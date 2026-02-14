/**
 * Utility functions for approval routing logic
 */

/**
 * Get required approver level based on user role and resource
 */
const getRequiredApprover = (userRole, resource, duration) => {
    // Infra Admin and IT Admin never need approval
    if (userRole === 'infra_admin' || userRole === 'it_admin') {
        return 'none';
    }

    // Club always needs admin approval (routed based on resource type)
    if (userRole === 'club') {
        return 'admin';
    }

    // Faculty: HOD for department resources, admin for central resources
    if (userRole === 'faculty') {
        return resource.category === 'department' ? 'hod' : 'admin';
    }

    // HOD: auto-approve department resources, admin for central resources
    if (userRole === 'department') {
        return resource.category === 'department' ? 'none' : 'admin';
    }

    return 'admin'; // Default
};

/**
 * Check if user can approve a booking
 */
const canUserApprove = (user, booking) => {
    const resource = booking.resourceId;

    // Infrastructure Admin can approve infrastructure-managed resources
    if (user.role === 'infra_admin') {
        return resource.managedBy === 'infrastructure';
    }

    // IT Admin can approve IT services-managed resources
    if (user.role === 'it_admin') {
        return resource.managedBy === 'it_services';
    }

    // HOD can approve department-level bookings for their department
    if (user.role === 'department') {
        return booking.approvalLevel === 'hod' &&
            booking.department === user.department;
    }

    return false;
};

/**
 * Get approval status message for user
 */
const getApprovalMessage = (requiresApproval, approvalLevel) => {
    if (!requiresApproval) {
        return 'This booking will be auto-approved';
    }

    if (approvalLevel === 'hod') {
        return 'This booking requires HOD approval';
    }

    if (approvalLevel === 'admin') {
        return 'This booking requires Admin approval';
    }

    return 'This booking requires approval';
};

module.exports = {
    getRequiredApprover,
    canUserApprove,
    getApprovalMessage
};
