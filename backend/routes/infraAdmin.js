const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    getInfraBookings,
    getInfraResources,
    getConflicts,
    rescheduleBooking,
    createResource,
    updateResource,
    deleteResource,
    getStats,
} = require('../controllers/infraAdminController');

// All routes require authentication and infra_admin role
router.use(protect);
router.use(authorize('infra_admin'));

// Booking routes
router.get('/bookings', getInfraBookings);
router.put('/bookings/:id/reschedule', rescheduleBooking);

// Resource routes
router.route('/resources')
    .get(getInfraResources)
    .post(createResource);

router.route('/resources/:id')
    .put(updateResource)
    .delete(deleteResource);

// Conflict routes
router.get('/conflicts', getConflicts);

// Stats routes
router.get('/stats', getStats);

module.exports = router;
