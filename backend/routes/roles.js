const express = require('express');
const { assignRole, getPendingRoles } = require('../controllers/roleController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require admin authentication
router.post('/assign', protect, authorize('infra_admin', 'it_admin'), assignRole);
router.get('/pending', protect, authorize('infra_admin', 'it_admin'), getPendingRoles);

module.exports = router;
