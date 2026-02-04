const express = require('express');
const {
    getBookings,
    getPendingBookings,
    getBooking,
    createBooking,
    updateBookingStatus,
    deleteBooking,
} = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

const router = express.Router();

router.use(protect); // All routes require authentication

router.get('/pending', authorize('admin', 'department'), getPendingBookings);

router
    .route('/')
    .get(getBookings)
    .post(createBooking);

router
    .route('/:id')
    .get(getBooking)
    .delete(deleteBooking);

router.put('/:id/status', authorize('admin', 'department'), updateBookingStatus);

module.exports = router;
