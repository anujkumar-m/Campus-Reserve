const Booking = require('../models/Booking');

/**
 * Detect booking conflicts for a given resource, date, and time slot
 * @param {String} resourceId - Resource ID
 * @param {String} date - Booking date (YYYY-MM-DD)
 * @param {Object} timeSlot - Time slot object with start and end times
 * @param {String} excludeBookingId - Optional booking ID to exclude from conflict check (for rescheduling)
 * @returns {Object} { hasConflict: Boolean, conflictingBookings: Array }
 */
const detectConflicts = async (resourceId, date, timeSlot, excludeBookingId = null) => {
    try {
        const query = {
            resourceId,
            date,
            status: { $in: ['auto_approved', 'pending_hod', 'pending_admin', 'approved'] },
            $or: [
                {
                    'timeSlot.start': { $lt: timeSlot.end },
                    'timeSlot.end': { $gt: timeSlot.start },
                },
            ],
        };

        // Exclude specific booking if provided (useful for rescheduling)
        if (excludeBookingId) {
            query._id = { $ne: excludeBookingId };
        }

        const conflictingBookings = await Booking.find(query)
            .populate('resourceId', 'name type location')
            .populate('userId', 'name email role department');

        return {
            hasConflict: conflictingBookings.length > 0,
            conflictingBookings,
        };
    } catch (error) {
        throw new Error(`Conflict detection failed: ${error.message}`);
    }
};

/**
 * Check if a time slot overlaps with another
 * @param {Object} slot1 - First time slot { start, end }
 * @param {Object} slot2 - Second time slot { start, end }
 * @returns {Boolean} - True if slots overlap
 */
const doTimeSlotsOverlap = (slot1, slot2) => {
    return slot1.start < slot2.end && slot1.end > slot2.start;
};

/**
 * Format conflict details for display
 * @param {Array} conflictingBookings - Array of conflicting booking documents
 * @returns {Array} - Formatted conflict details
 */
const formatConflictDetails = (conflictingBookings) => {
    return conflictingBookings.map(booking => ({
        bookingId: booking._id,
        resourceName: booking.resourceId?.name || 'Unknown Resource',
        userName: booking.userId?.name || 'Unknown User',
        userRole: booking.userId?.role || 'Unknown',
        userDepartment: booking.userId?.department || 'N/A',
        date: booking.date,
        timeSlot: booking.timeSlot,
        purpose: booking.purpose,
        status: booking.status,
    }));
};

module.exports = {
    detectConflicts,
    doTimeSlotsOverlap,
    formatConflictDetails,
};
