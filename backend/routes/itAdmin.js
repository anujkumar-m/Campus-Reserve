const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    getITBookings,
    getITResources,
    getConflicts,
    rescheduleBooking,
    createResource,
    updateResource,
    deleteResource,
    getStats,
} = require('../controllers/itAdminController');

// All routes require authentication and it_admin role
router.use(protect);
router.use(authorize('it_admin'));

// Booking routes
router.get('/bookings', getITBookings);
router.put('/bookings/:id/reschedule', rescheduleBooking);

// Resource routes
router.route('/resources')
    .get(getITResources)
    .post(createResource);

router.route('/resources/:id')
    .put(updateResource)
    .delete(deleteResource);

// Conflict routes
router.get('/conflicts', getConflicts);

// Stats routes
router.get('/stats', getStats);

module.exports = router;
