const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    getMessages,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteMessage,
} = require('../controllers/dashboardMessageController');

// All routes require authentication
router.use(protect);

router.get('/', getMessages);
router.get('/unread-count', getUnreadCount);
router.put('/:id/read', markAsRead);
router.put('/read-all', markAllAsRead);
router.delete('/:id', deleteMessage);

module.exports = router;
