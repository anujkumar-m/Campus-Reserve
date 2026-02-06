const Booking = require('../models/Booking');
const Resource = require('../models/Resource');
const User = require('../models/User');
const BookingAuditLog = require('../models/BookingAuditLog');
const { calculateDuration } = require('../middleware/bookingValidation');

// @desc    Reschedule booking (Admin only)
// @route   PUT /api/bookings/:id/reschedule
// @access  Private/Admin
exports.rescheduleBooking = async (req, res) => {
    try {
        const { date, timeSlot, reason } = req.body;
        const bookingId = req.params.id;

        // Find the booking
        const booking = await Booking.findById(bookingId).populate('resourceId');

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Calculate new duration
        const duration = calculateDuration(timeSlot);

        // Check for conflicts with the new time slot
        const conflictingBooking = await Booking.findOne({
            resourceId: booking.resourceId._id,
            date,
            _id: { $ne: bookingId }, // Exclude current booking
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
                message: 'Time slot conflicts with an existing booking'
            });
        }

        // Update booking
        booking.date = date;
        booking.timeSlot = timeSlot;
        booking.duration = duration;
        await booking.save();

        // Create audit log
        await BookingAuditLog.create({
            bookingId: booking._id,
            action: 'rescheduled',
            performedBy: req.user._id,
            notes: reason || `Rescheduled to ${date} ${timeSlot.start}-${timeSlot.end}`
        });

        res.status(200).json({
            success: true,
            message: 'Booking rescheduled successfully',
            data: booking
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Delete booking (Admin only)
// @route   DELETE /api/bookings/:id/admin
// @access  Private/Admin
exports.deleteBookingAdmin = async (req, res) => {
    try {
        const { reason } = req.body;
        const bookingId = req.params.id;

        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Create audit log before deletion
        await BookingAuditLog.create({
            bookingId: booking._id,
            action: 'deleted_by_admin',
            performedBy: req.user._id,
            notes: reason || 'Deleted by admin'
        });

        // Delete the booking
        await Booking.findByIdAndDelete(bookingId);

        res.status(200).json({
            success: true,
            message: 'Booking deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Approve booking (Admin override)
// @route   PUT /api/bookings/:id/approve-admin
// @access  Private/Admin
exports.approveBookingAdmin = async (req, res) => {
    try {
        const bookingId = req.params.id;

        const booking = await Booking.findById(bookingId)
            .populate('resourceId', 'name type')
            .populate('userId', 'name email');

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Update booking status
        booking.status = 'approved';
        booking.approvedBy = req.user._id;
        booking.approvedAt = new Date();
        await booking.save();

        // Create audit log
        await BookingAuditLog.create({
            bookingId: booking._id,
            action: 'approved',
            performedBy: req.user._id,
            previousStatus: booking.status,
            newStatus: 'approved',
            notes: 'Approved by admin override'
        });

        res.status(200).json({
            success: true,
            message: 'Booking approved successfully',
            data: booking
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Reject booking (Admin override)
// @route   PUT /api/bookings/:id/reject-admin
// @access  Private/Admin
exports.rejectBookingAdmin = async (req, res) => {
    try {
        const { reason } = req.body;
        const bookingId = req.params.id;

        if (!reason) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a reason for rejection'
            });
        }

        const booking = await Booking.findById(bookingId)
            .populate('resourceId', 'name type')
            .populate('userId', 'name email');

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Update booking status
        booking.status = 'rejected';
        booking.rejectedBy = req.user._id;
        booking.rejectedAt = new Date();
        booking.rejectionReason = reason;
        await booking.save();

        // Create audit log
        await BookingAuditLog.create({
            bookingId: booking._id,
            action: 'rejected',
            performedBy: req.user._id,
            previousStatus: booking.status,
            newStatus: 'rejected',
            notes: reason
        });

        res.status(200).json({
            success: true,
            message: 'Booking rejected successfully',
            data: booking
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = exports;
