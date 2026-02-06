const express = require('express');
const {
    getUsers,
    getUser,
    updateUser,
    deleteUser,
    blockUser,
    unblockUser,
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

const router = express.Router();

router.use(protect); // All routes require authentication

router.get('/', authorize('admin'), getUsers);
router.get('/:id', getUser);
router.put('/:id', authorize('admin'), updateUser);
router.put('/:id/block', authorize('admin'), blockUser);
router.put('/:id/unblock', authorize('admin'), unblockUser);
router.delete('/:id', authorize('admin'), deleteUser);

module.exports = router;
