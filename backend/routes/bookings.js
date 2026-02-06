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
router.get('/pending-approval', authorize('admin', 'department'), getBookingsForApproval);
router.get('/pending', authorize('admin', 'department'), getPendingBookings);

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
router.put('/:id/approve', authorize('admin', 'department'), approveBooking);
router.put('/:id/reject', authorize('admin', 'department'), rejectBooking);
router.put('/:id/cancel', cancelBooking);

// Audit log
router.get('/:id/audit', authorize('admin'), getBookingAudit);

// Admin booking management routes
const {
    rescheduleBooking,
    deleteBookingAdmin,
    approveBookingAdmin,
    rejectBookingAdmin
} = require('../controllers/adminBookingController');

router.put('/:id/reschedule', authorize('admin'), rescheduleBooking);
router.delete('/:id/admin', authorize('admin'), deleteBookingAdmin);
router.put('/:id/approve-admin', authorize('admin'), approveBookingAdmin);
router.put('/:id/reject-admin', authorize('admin'), rejectBookingAdmin);

// Legacy status update (keep for backward compatibility)
router.put('/:id/status', authorize('admin', 'department'), updateBookingStatus);

module.exports = router;
