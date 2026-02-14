const express = require('express');
const {
    getBookings,
    getPendingBookings,
    getBooking,
    createBooking,
    updateBookingStatus,
    deleteBooking,
    approveBooking,
    rejectBooking,
    cancelBooking,
    getBookingsForApproval,
    getBookingAudit,
} = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');
const { validateStudentBooking, validateResourceAccess } = require('../middleware/bookingValidation');

const router = express.Router();

router.use(protect); // All routes require authentication

// Approval-specific routes
router.get('/pending-approval', authorize('infra_admin', 'it_admin', 'department'), getBookingsForApproval);
router.get('/pending', authorize('infra_admin', 'it_admin', 'department'), getPendingBookings);

// Booking CRUD routes
router
    .route('/')
    .get(getBookings)
    .post(validateStudentBooking, validateResourceAccess, createBooking);

router
    .route('/:id')
    .get(getBooking)
    .delete(deleteBooking);

// Approval actions
router.put('/:id/approve', authorize('infra_admin', 'it_admin', 'department'), approveBooking);
router.put('/:id/reject', authorize('infra_admin', 'it_admin', 'department'), rejectBooking);
router.put('/:id/cancel', cancelBooking);

// Audit log
router.get('/:id/audit', authorize('infra_admin', 'it_admin'), getBookingAudit);

// Admin booking management routes
const {
    rescheduleBooking,
    deleteBookingAdmin,
    approveBookingAdmin,
    rejectBookingAdmin
} = require('../controllers/adminBookingController');

router.put('/:id/reschedule', authorize('infra_admin', 'it_admin'), rescheduleBooking);
router.delete('/:id/admin', authorize('infra_admin', 'it_admin'), deleteBookingAdmin);
router.put('/:id/approve-admin', authorize('infra_admin', 'it_admin'), approveBookingAdmin);
router.put('/:id/reject-admin', authorize('infra_admin', 'it_admin'), rejectBookingAdmin);

// Legacy status update (keep for backward compatibility)
router.put('/:id/status', authorize('infra_admin', 'it_admin', 'department'), updateBookingStatus);

module.exports = router;
