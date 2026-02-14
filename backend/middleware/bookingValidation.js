const Booking = require('../models/Booking');
const Resource = require('../models/Resource');

/**
 * Calculate duration in hours from timeSlot
 */
const calculateDuration = (timeSlot) => {
    const [startHour, startMin] = timeSlot.start.split(':').map(Number);
    const [endHour, endMin] = timeSlot.end.split(':').map(Number);

    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    const durationMinutes = endMinutes - startMinutes;
    return durationMinutes / 60; // Convert to hours
};

/**
 * Check if student has already booked for the given date
 */
const checkDailyLimit = async (userId, date, excludeBookingId = null) => {
    const query = {
        userId,
        date,
        status: { $in: ['auto_approved', 'pending_hod', 'pending_admin', 'approved'] }
    };

    // Exclude current booking if updating
    if (excludeBookingId) {
        query._id = { $ne: excludeBookingId };
    }

    const existingBooking = await Booking.findOne(query);
    return existingBooking !== null;
};

/**
 * Validate student booking restrictions
 * NOTE: Students are no longer allowed to book resources
 */
const validateStudentBooking = async (req, res, next) => {
    // Student role has been removed from the system
    // This middleware is kept for backward compatibility but does nothing
    next();
};

/**
 * Validate resource access based on user role
 */
const validateResourceAccess = async (req, res, next) => {
    const { resourceId } = req.body;
    const resource = await Resource.findById(resourceId);

    if (!resource) {
        return res.status(404).json({
            success: false,
            message: 'Resource not found'
        });
    }

    const userRole = req.user.role;

    // Infra Admin and IT Admin can access all resources
    if (userRole === 'infra_admin' || userRole === 'it_admin') {
        req.resource = resource;
        return next();
    }

    // All other roles can book resources (faculty, HOD, club)
    // Access control is handled by approval workflow
    req.resource = resource;
    next();
};

/**
 * Determine approval level required for booking
 * CORE LOGIC:
 * - Infra/IT Admin → AUTO-APPROVE
 * - Movable resources → IT Admin approval
 * - Fixed resources → Infrastructure Admin approval
 * - Faculty/HOD/Club → Routed based on resource type and category
 */
const determineApprovalLevel = (userRole, resource, duration) => {
    const isMovable = resource.isMovable || resource.category === 'movable_asset';
    const resourceCategory = resource.category;
    const managedBy = resource.managedBy;

    // Infra Admin and IT Admin never need approval
    if (userRole === 'infra_admin' || userRole === 'it_admin') {
        return {
            requiresApproval: false,
            approvalLevel: 'none',
            status: 'auto_approved'
        };
    }

    // Route to appropriate admin based on resource managedBy field
    // Movable resources (IT Services) or Fixed resources (Infrastructure)
    if (managedBy === 'it_services' || isMovable) {
        return {
            requiresApproval: true,
            approvalLevel: 'admin',
            status: 'pending_admin'
        };
    }

    if (managedBy === 'infrastructure') {
        return {
            requiresApproval: true,
            approvalLevel: 'admin',
            status: 'pending_admin'
        };
    }

    // Faculty bookings
    if (userRole === 'faculty') {
        if (duration > 1) {
            // Duration >1 hour requires HOD approval
            return {
                requiresApproval: true,
                approvalLevel: 'hod',
                status: 'pending_hod'
            };
        } else if (resourceCategory === 'central') {
            // Central resources need admin approval
            return {
                requiresApproval: true,
                approvalLevel: 'admin',
                status: 'pending_admin'
            };
        } else {
            // Department resources ≤1 hour auto-approve
            return {
                requiresApproval: false,
                approvalLevel: 'none',
                status: 'auto_approved'
            };
        }
    }

    // HOD bookings
    if (userRole === 'department') {
        if (resourceCategory === 'department') {
            // Auto-approve department resources
            return {
                requiresApproval: false,
                approvalLevel: 'none',
                status: 'auto_approved'
            };
        } else {
            // Central resources need admin approval
            return {
                requiresApproval: true,
                approvalLevel: 'admin',
                status: 'pending_admin'
            };
        }
    }

    // Club bookings
    if (userRole === 'club') {
        return {
            requiresApproval: true,
            approvalLevel: 'admin',
            status: 'pending_admin'
        };
    }

    // Default: require admin approval
    return {
        requiresApproval: true,
        approvalLevel: 'admin',
        status: 'pending_admin'
    };
};

module.exports = {
    calculateDuration,
    checkDailyLimit,
    validateStudentBooking,
    validateResourceAccess,
    determineApprovalLevel
};
