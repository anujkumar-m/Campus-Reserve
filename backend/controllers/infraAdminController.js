const Booking = require('../models/Booking');
const Resource = require('../models/Resource');
const { detectConflicts } = require('../utils/conflictDetector');
const { createMessage } = require('./dashboardMessageController');

// @desc    Get all infrastructure bookings
// @route   GET /api/infra-admin/bookings
// @access  Private/InfraAdmin
exports.getInfraBookings = async (req, res) => {
    try {
        const { status, date, resourceId } = req.query;

        // Build query for infrastructure-managed resources
        const resourceQuery = { managedBy: 'infrastructure' };
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

// @desc    Get all infrastructure resources
// @route   GET /api/infra-admin/resources
// @access  Private/InfraAdmin
exports.getInfraResources = async (req, res) => {
    try {
        const resources = await Resource.find({ managedBy: 'infrastructure' })
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

// @desc    Get conflict warnings for infrastructure resources
// @route   GET /api/infra-admin/conflicts
// @access  Private/InfraAdmin
exports.getConflicts = async (req, res) => {
    try {
        // Find all bookings with conflict warnings for infrastructure resources
        const resources = await Resource.find({ managedBy: 'infrastructure' }).select('_id');
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

// @desc    Get infrastructure stats
// @route   GET /api/infra-admin/stats
// @access  Private/InfraAdmin
exports.getStats = async (req, res) => {
    try {
        // Get all infrastructure resources
        const resources = await Resource.find({ managedBy: 'infrastructure' });
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
// @route   PUT /api/infra-admin/bookings/:id/reschedule
// @access  Private/InfraAdmin
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

        // Verify this is an infrastructure resource
        if (booking.resourceId.managedBy !== 'infrastructure') {
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

// @desc    Create infrastructure resource
// @route   POST /api/infra-admin/resources
// @access  Private/InfraAdmin
exports.createResource = async (req, res) => {
    try {
        const resourceData = {
            ...req.body,
            managedBy: 'infrastructure', // Force infrastructure management
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

// @desc    Update infrastructure resource
// @route   PUT /api/infra-admin/resources/:id
// @access  Private/InfraAdmin
exports.updateResource = async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id);

        if (!resource) {
            return res.status(404).json({
                success: false,
                message: 'Resource not found',
            });
        }

        if (resource.managedBy !== 'infrastructure') {
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

// @desc    Delete infrastructure resource
// @route   DELETE /api/infra-admin/resources/:id
// @access  Private/InfraAdmin
exports.deleteResource = async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id);

        if (!resource) {
            return res.status(404).json({
                success: false,
                message: 'Resource not found',
            });
        }

        if (resource.managedBy !== 'infrastructure') {
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
