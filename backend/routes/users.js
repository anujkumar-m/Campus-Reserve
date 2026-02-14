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

router.get('/', authorize('infra_admin', 'it_admin'), getUsers);
router.get('/:id', getUser);
router.put('/:id', authorize('infra_admin', 'it_admin'), updateUser);
router.put('/:id/block', authorize('infra_admin', 'it_admin'), blockUser);
router.put('/:id/unblock', authorize('infra_admin', 'it_admin'), unblockUser);
router.delete('/:id', authorize('infra_admin', 'it_admin'), deleteUser);

module.exports = router;
