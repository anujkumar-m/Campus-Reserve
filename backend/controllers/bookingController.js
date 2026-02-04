const Booking = require('../models/Booking');
const Resource = require('../models/Resource');
const User = require('../models/User');

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
            .populate('resourceId', 'name type location')
            .populate('userId', 'name email role')
            .sort('-createdAt');

        // Format response to match frontend expectations
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
        const { resourceId, date, timeSlot, purpose } = req.body;

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

        // Check for booking conflicts
        const conflictingBooking = await Booking.findOne({
            resourceId,
            date,
            status: { $in: ['pending', 'approved'] },
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
                message: 'Time slot is already booked',
            });
        }

        // Create booking
        const booking = await Booking.create({
            resourceId,
            userId: req.user._id,
            date,
            timeSlot,
            purpose,
            department: resource.department || req.user.department,
        });

        // Populate and format response
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

        res.status(201).json({
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
