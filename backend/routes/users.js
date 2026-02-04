const express = require('express');
const {
    getUsers,
    getUser,
    updateUser,
    deleteUser,
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

const router = express.Router();

router.use(protect); // All routes require authentication

router.get('/', authorize('admin'), getUsers);
router.get('/:id', getUser);
router.put('/:id', authorize('admin'), updateUser);
router.delete('/:id', authorize('admin'), deleteUser);

module.exports = router;
