const Booking = require('../models/Booking');
const Resource = require('../models/Resource');
const User = require('../models/User');
const BookingAuditLog = require('../models/BookingAuditLog');
const { calculateDuration, determineApprovalLevel } = require('../middleware/bookingValidation');
const { canUserApprove } = require('../utils/approvalRouter');

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private
exports.getBookings = async (req, res) => {
    try {
        let query = {};

        // If not admin, only show user's own bookings
        if (req.user.role !== 'admin') {
            // Department can see bookings for their department resources
            if (req.user.role === 'department') {
                query.department = req.user.department;
            } else {
                query.userId = req.user._id;
            }
        }

        // Filter by status
        if (req.query.status) {
            query.status = req.query.status;
        }

        // Filter by resource
        if (req.query.resourceId) {
            query.resourceId = req.query.resourceId;
        }

        const bookings = await Booking.find(query)
            .populate('resourceId', 'name type location category')
            .populate('userId', 'name email role department')
            .populate('approvedBy', 'name email role')
            .populate('rejectedBy', 'name email role')
            .sort('-createdAt');

        // Filter out bookings with deleted resources or users and format response
        const formattedBookings = bookings
            .filter(booking => booking.resourceId && booking.userId) // Skip bookings with deleted resources/users
            .map(booking => ({
                id: booking._id,
                resourceId: booking.resourceId._id,
                resourceName: booking.resourceId.name,
                resourceType: booking.resourceId.type,
                resourceCategory: booking.resourceId.category,
                userId: booking.userId._id,
                userName: booking.userId.name,
                userRole: booking.userId.role,
                userDepartment: booking.userId.department,
                date: booking.date,
                timeSlot: booking.timeSlot,
                duration: booking.duration,
                purpose: booking.purpose,
                bookingType: booking.bookingType,
                status: booking.status,
                requiresApproval: booking.requiresApproval,
                approvalLevel: booking.approvalLevel,
                approvedBy: booking.approvedBy ? {
                    id: booking.approvedBy._id,
                    name: booking.approvedBy.name,
                    role: booking.approvedBy.role
                } : null,
                approvedAt: booking.approvedAt,
                rejectedBy: booking.rejectedBy ? {
                    id: booking.rejectedBy._id,
                    name: booking.rejectedBy.name,
                    role: booking.rejectedBy.role
                } : null,
                rejectedAt: booking.rejectedAt,
                rejectionReason: booking.rejectionReason,
                createdAt: booking.createdAt,
                department: booking.department,
            }));

        res.status(200).json({
            success: true,
            count: formattedBookings.length,
            data: formattedBookings,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get pending bookings
// @route   GET /api/bookings/pending
// @access  Private/Admin/Department
exports.getPendingBookings = async (req, res) => {
    try {
        let query = { status: 'pending' };

        // Department can only see pending bookings for their department
        if (req.user.role === 'department') {
            query.department = req.user.department;
        }

        const bookings = await Booking.find(query)
            .populate('resourceId', 'name type location')
            .populate('userId', 'name email role')
            .sort('-createdAt');

        const formattedBookings = bookings.map(booking => ({
            id: booking._id,
            resourceId: booking.resourceId._id,
            resourceName: booking.resourceId.name,
            userId: booking.userId._id,
            userName: booking.userId.name,
            userRole: booking.userId.role,
            date: booking.date,
            timeSlot: booking.timeSlot,
            purpose: booking.purpose,
            status: booking.status,
            createdAt: booking.createdAt,
            department: booking.department,
        }));

        res.status(200).json({
            success: true,
            count: formattedBookings.length,
            data: formattedBookings,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
exports.getBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('resourceId', 'name type location')
            .populate('userId', 'name email role');

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found',
            });
        }

        // Check authorization
        if (req.user.role !== 'admin' &&
            req.user.role !== 'department' &&
            booking.userId._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access this booking',
            });
        }

        const formattedBooking = {
            id: booking._id,
            resourceId: booking.resourceId._id,
            resourceName: booking.resourceId.name,
            userId: booking.userId._id,
            userName: booking.userId.name,
            userRole: booking.userId.role,
            date: booking.date,
            timeSlot: booking.timeSlot,
            purpose: booking.purpose,
            status: booking.status,
            createdAt: booking.createdAt,
            department: booking.department,
        };

        res.status(200).json({
            success: true,
            data: formattedBooking,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res) => {
    try {
        const { resourceId, date, timeSlot, purpose, bookingType = 'regular' } = req.body;

        // Check if resource exists
        const resource = await Resource.findById(resourceId);
        if (!resource) {
            return res.status(404).json({
                success: false,
                message: 'Resource not found',
            });
        }

        // Check if resource is available
        if (!resource.isAvailable) {
            return res.status(400).json({
                success: false,
                message: 'Resource is not available',
            });
        }

        // Calculate duration
        const duration = calculateDuration(timeSlot);

        // Determine approval level required
        const approvalInfo = determineApprovalLevel(
            req.user.role,
            resource,
            duration
        );

        // Check for booking conflicts (including auto-approved and pending bookings)
        const conflictingBooking = await Booking.findOne({
            resourceId,
            date,
            status: { $in: ['auto_approved', 'pending_hod', 'pending_admin', 'approved'] },
            $or: [
                {
                    'timeSlot.start': { $lt: timeSlot.end },
                    'timeSlot.end': { $gt: timeSlot.start },
                },
            ],
        });

        if (conflictingBooking) {
            return res.status(400).json({
                success: false,
                message: 'Time slot conflicts with an existing booking',
            });
        }

        // Create booking with approval info
        const booking = await Booking.create({
            resourceId,
            userId: req.user._id,
            date,
            timeSlot,
            duration,
            purpose,
            bookingType,
            department: resource.department || req.user.department,
            status: approvalInfo.status,
            requiresApproval: approvalInfo.requiresApproval,
            approvalLevel: approvalInfo.approvalLevel,
        });

        // Create audit log entry
        await BookingAuditLog.create({
            bookingId: booking._id,
            action: 'created',
            performedBy: req.user._id,
            newStatus: approvalInfo.status,
            notes: `Booking created with status: ${approvalInfo.status}`
        });

        // Populate and format response
        const populatedBooking = await Booking.findById(booking._id)
            .populate('resourceId', 'name type location category')
            .populate('userId', 'name email role department');

        const formattedBooking = {
            id: populatedBooking._id,
            resourceId: populatedBooking.resourceId._id,
            resourceName: populatedBooking.resourceId.name,
            resourceType: populatedBooking.resourceId.type,
            resourceCategory: populatedBooking.resourceId.category,
            userId: populatedBooking.userId._id,
            userName: populatedBooking.userId.name,
            userRole: populatedBooking.userId.role,
            userDepartment: populatedBooking.userId.department,
            date: populatedBooking.date,
            timeSlot: populatedBooking.timeSlot,
            duration: populatedBooking.duration,
            purpose: populatedBooking.purpose,
            bookingType: populatedBooking.bookingType,
            status: populatedBooking.status,
            requiresApproval: populatedBooking.requiresApproval,
            approvalLevel: populatedBooking.approvalLevel,
            createdAt: populatedBooking.createdAt,
            department: populatedBooking.department,
        };

        res.status(201).json({
            success: true,
            data: formattedBooking,
            message: approvalInfo.requiresApproval
                ? `Booking created. ${approvalInfo.approvalLevel === 'hod' ? 'HOD' : 'Admin'} approval required.`
                : 'Booking auto-approved successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private/Admin/Department
exports.updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!['pending', 'approved', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status',
            });
        }

        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found',
            });
        }

        // Check authorization
        if (req.user.role === 'department' && booking.department !== req.user.department) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this booking',
            });
        }

        booking.status = status;
        await booking.save();

        const populatedBooking = await Booking.findById(booking._id)
            .populate('resourceId', 'name type location')
            .populate('userId', 'name email role');

        const formattedBooking = {
            id: populatedBooking._id,
            resourceId: populatedBooking.resourceId._id,
            resourceName: populatedBooking.resourceId.name,
            userId: populatedBooking.userId._id,
            userName: populatedBooking.userId.name,
            userRole: populatedBooking.userId.role,
            date: populatedBooking.date,
            timeSlot: populatedBooking.timeSlot,
            purpose: populatedBooking.purpose,
            status: populatedBooking.status,
            createdAt: populatedBooking.createdAt,
            department: populatedBooking.department,
        };

        res.status(200).json({
            success: true,
            data: formattedBooking,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Delete booking
// @route   DELETE /api/bookings/:id
// @access  Private
exports.deleteBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found',
            });
        }

        // Check authorization - user can only delete their own bookings, admin can delete any
        if (req.user.role !== 'admin' && booking.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this booking',
            });
        }

        await Booking.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Booking deleted successfully',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Approve booking
// @route   PUT /api/bookings/:id/approve
// @access  Private/HOD/Admin
exports.approveBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('resourceId', 'name type category')
            .populate('userId', 'name email role department');

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found',
            });
        }

        // Check if booking is in a pending state
        if (!['pending_hod', 'pending_admin'].includes(booking.status)) {
            return res.status(400).json({
                success: false,
                message: 'Booking is not pending approval',
            });
        }

        // Check authorization using canUserApprove utility
        if (!canUserApprove(req.user, booking)) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to approve this booking',
            });
        }

        // Update booking status
        const previousStatus = booking.status;
        booking.status = 'approved';
        booking.approvedBy = req.user._id;
        booking.approvedAt = new Date();
        await booking.save();

        // Create audit log entry
        await BookingAuditLog.create({
            bookingId: booking._id,
            action: 'approved',
            performedBy: req.user._id,
            previousStatus,
            newStatus: 'approved',
            notes: `Approved by ${req.user.role}: ${req.user.name}`
        });

        // Populate approver info
        const updatedBooking = await Booking.findById(booking._id)
            .populate('resourceId', 'name type location category')
            .populate('userId', 'name email role department')
            .populate('approvedBy', 'name email role');

        res.status(200).json({
            success: true,
            message: 'Booking approved successfully',
            data: updatedBooking,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Reject booking
// @route   PUT /api/bookings/:id/reject
// @access  Private/HOD/Admin
exports.rejectBooking = async (req, res) => {
    try {
        const { reason } = req.body;

        if (!reason || reason.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Please provide a rejection reason',
            });
        }

        const booking = await Booking.findById(req.params.id)
            .populate('resourceId', 'name type category')
            .populate('userId', 'name email role department');

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found',
            });
        }

        // Check if booking is in a pending state
        if (!['pending_hod', 'pending_admin'].includes(booking.status)) {
            return res.status(400).json({
                success: false,
                message: 'Booking is not pending approval',
            });
        }

        // Check authorization
        if (!canUserApprove(req.user, booking)) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to reject this booking',
            });
        }

        // Update booking status
        const previousStatus = booking.status;
        booking.status = 'rejected';
        booking.rejectedBy = req.user._id;
        booking.rejectedAt = new Date();
        booking.rejectionReason = reason;
        await booking.save();

        // Create audit log entry
        await BookingAuditLog.create({
            bookingId: booking._id,
            action: 'rejected',
            performedBy: req.user._id,
            previousStatus,
            newStatus: 'rejected',
            notes: `Rejected by ${req.user.role}: ${req.user.name}. Reason: ${reason}`
        });

        // Populate rejector info
        const updatedBooking = await Booking.findById(booking._id)
            .populate('resourceId', 'name type location category')
            .populate('userId', 'name email role department')
            .populate('rejectedBy', 'name email role');

        res.status(200).json({
            success: true,
            message: 'Booking rejected',
            data: updatedBooking,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
exports.cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found',
            });
        }

        // Check authorization - user can cancel their own bookings, admin can cancel any
        if (req.user.role !== 'admin' && booking.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to cancel this booking',
            });
        }

        // Can't cancel already rejected or cancelled bookings
        if (['rejected', 'cancelled'].includes(booking.status)) {
            return res.status(400).json({
                success: false,
                message: `Cannot cancel a booking that is already ${booking.status}`,
            });
        }

        // Update booking status
        const previousStatus = booking.status;
        booking.status = 'cancelled';
        await booking.save();

        // Create audit log entry
        await BookingAuditLog.create({
            bookingId: booking._id,
            action: 'cancelled',
            performedBy: req.user._id,
            previousStatus,
            newStatus: 'cancelled',
            notes: `Cancelled by ${req.user.name}`
        });

        res.status(200).json({
            success: true,
            message: 'Booking cancelled successfully',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get bookings pending approval
// @route   GET /api/bookings/pending-approval
// @access  Private/HOD/Admin
exports.getBookingsForApproval = async (req, res) => {
    try {
        let query = {};

        // HOD can see pending_hod bookings for their department
        if (req.user.role === 'department') {
            query = {
                status: 'pending_hod',
                department: req.user.department
            };
        }
        // Admin can see pending_admin bookings
        else if (req.user.role === 'admin') {
            query = {
                status: 'pending_admin'
            };
        }
        else {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view pending approvals',
            });
        }

        const bookings = await Booking.find(query)
            .populate('resourceId', 'name type location category')
            .populate('userId', 'name email role department')
            .sort('-createdAt');

        const formattedBookings = bookings.map(booking => ({
            id: booking._id,
            resourceId: booking.resourceId._id,
            resourceName: booking.resourceId.name,
            resourceType: booking.resourceId.type,
            resourceCategory: booking.resourceId.category,
            userId: booking.userId._id,
            userName: booking.userId.name,
            userRole: booking.userId.role,
            userDepartment: booking.userId.department,
            date: booking.date,
            timeSlot: booking.timeSlot,
            duration: booking.duration,
            purpose: booking.purpose,
            bookingType: booking.bookingType,
            status: booking.status,
            approvalLevel: booking.approvalLevel,
            createdAt: booking.createdAt,
            department: booking.department,
        }));

        res.status(200).json({
            success: true,
            count: formattedBookings.length,
            data: formattedBookings,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get audit log for booking
// @route   GET /api/bookings/:id/audit
// @access  Private/Admin
exports.getBookingAudit = async (req, res) => {
    try {
        const auditLogs = await BookingAuditLog.find({ bookingId: req.params.id })
            .populate('performedBy', 'name email role')
            .sort('-performedAt');

        res.status(200).json({
            success: true,
            count: auditLogs.length,
            data: auditLogs,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
