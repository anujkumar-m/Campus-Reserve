const Booking = require('../models/Booking');
const Resource = require('../models/Resource');
const { detectConflicts } = require('../utils/conflictDetector');
const { createMessage } = require('./dashboardMessageController');

// @desc    Get all IT services bookings
// @route   GET /api/it-admin/bookings
// @access  Private/ITAdmin
exports.getITBookings = async (req, res) => {
    try {
        const { status, date, resourceId } = req.query;

        // Build query for IT services-managed resources
        const resourceQuery = { managedBy: 'it_services' };
        if (resourceId) {
            resourceQuery._id = resourceId;
        }

        const resources = await Resource.find(resourceQuery).select('_id');
        const resourceIds = resources.map(r => r._id);

        // Build booking query
        const bookingQuery = { resourceId: { $in: resourceIds } };
        if (status) {
            bookingQuery.status = status;
        }
        if (date) {
            bookingQuery.date = date;
        }

        const bookings = await Booking.find(bookingQuery)
            .populate('resourceId', 'name type location category managedBy')
            .populate('userId', 'name email role department')
            .populate('approvedBy', 'name email role')
            .populate('rejectedBy', 'name email role')
            .populate('rescheduledBy', 'name email role')
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get all IT services resources
// @route   GET /api/it-admin/resources
// @access  Private/ITAdmin
exports.getITResources = async (req, res) => {
    try {
        const resources = await Resource.find({ managedBy: 'it_services' })
            .sort('name');

        res.status(200).json({
            success: true,
            count: resources.length,
            data: resources,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get conflict warnings for IT services resources
// @route   GET /api/it-admin/conflicts
// @access  Private/ITAdmin
exports.getConflicts = async (req, res) => {
    try {
        // Find all bookings with conflict warnings for IT services resources
        const resources = await Resource.find({ managedBy: 'it_services' }).select('_id');
        const resourceIds = resources.map(r => r._id);

        const conflictBookings = await Booking.find({
            resourceId: { $in: resourceIds },
            conflictWarning: true,
            status: { $in: ['pending_admin', 'approved'] }
        })
            .populate('resourceId', 'name type location')
            .populate('userId', 'name email role department')
            .sort('date');

        res.status(200).json({
            success: true,
            count: conflictBookings.length,
            data: conflictBookings,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get IT stats
// @route   GET /api/it-admin/stats
// @access  Private/ITAdmin
exports.getStats = async (req, res) => {
    try {
        // Get all IT resources
        const resources = await Resource.find({ managedBy: 'it_services' });
        const resourceIds = resources.map(r => r._id);

        // Get bookings for these resources
        const totalBookings = await Booking.countDocuments({ resourceId: { $in: resourceIds } });
        const pendingBookings = await Booking.countDocuments({
            resourceId: { $in: resourceIds },
            status: { $in: ['pending_admin', 'pending_hod'] }
        });
        const approvedBookings = await Booking.countDocuments({
            resourceId: { $in: resourceIds },
            status: 'approved'
        });

        res.status(200).json({
            success: true,
            data: {
                totalResources: resources.length,
                totalBookings,
                pendingBookings,
                approvedBookings
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Reschedule a booking
// @route   PUT /api/it-admin/bookings/:id/reschedule
// @access  Private/ITAdmin
exports.rescheduleBooking = async (req, res) => {
    try {
        const { date, timeSlot, resourceId, reason } = req.body;

        if (!date || !timeSlot || !reason) {
            return res.status(400).json({
                success: false,
                message: 'Please provide date, timeSlot, and reason for rescheduling',
            });
        }

        const booking = await Booking.findById(req.params.id)
            .populate('resourceId', 'name type managedBy')
            .populate('userId', 'name email');

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found',
            });
        }

        // Verify this is an IT services resource
        if (booking.resourceId.managedBy !== 'it_services') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to reschedule this booking',
            });
        }

        // Use provided resourceId or keep existing
        const newResourceId = resourceId || booking.resourceId._id;

        // Check for conflicts with new time/resource
        const conflictCheck = await detectConflicts(
            newResourceId,
            date,
            timeSlot,
            booking._id
        );

        // Update booking
        booking.date = date;
        booking.timeSlot = timeSlot;
        if (resourceId) {
            booking.resourceId = resourceId;
        }
        booking.rescheduledBy = req.user._id;
        booking.rescheduledAt = new Date();
        booking.rescheduleReason = reason;
        booking.status = 'approved'; // Auto-approve rescheduled bookings
        booking.conflictWarning = conflictCheck.hasConflict;

        await booking.save();

        // Create dashboard message for user
        await createMessage(
            booking.userId._id,
            booking._id,
            `Your booking has been rescheduled. New date: ${date}, Time: ${timeSlot.start} - ${timeSlot.end}. Reason: ${reason}`,
            'warning'
        );

        const updatedBooking = await Booking.findById(booking._id)
            .populate('resourceId', 'name type location')
            .populate('userId', 'name email')
            .populate('rescheduledBy', 'name email role');

        res.status(200).json({
            success: true,
            message: 'Booking rescheduled successfully',
            data: updatedBooking,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Create IT services resource
// @route   POST /api/it-admin/resources
// @access  Private/ITAdmin
exports.createResource = async (req, res) => {
    try {
        const resourceData = {
            ...req.body,
            managedBy: 'it_services', // Force IT services management
        };

        const resource = await Resource.create(resourceData);

        res.status(201).json({
            success: true,
            data: resource,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Update IT services resource
// @route   PUT /api/it-admin/resources/:id
// @access  Private/ITAdmin
exports.updateResource = async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id);

        if (!resource) {
            return res.status(404).json({
                success: false,
                message: 'Resource not found',
            });
        }

        if (resource.managedBy !== 'it_services') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this resource',
            });
        }

        const updatedResource = await Resource.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            data: updatedResource,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Delete IT services resource
// @route   DELETE /api/it-admin/resources/:id
// @access  Private/ITAdmin
exports.deleteResource = async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id);

        if (!resource) {
            return res.status(404).json({
                success: false,
                message: 'Resource not found',
            });
        }

        if (resource.managedBy !== 'it_services') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this resource',
            });
        }

        await Resource.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Resource deleted successfully',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
