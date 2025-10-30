const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUserById,
  updateUser,
  updateFaceDescriptor,
  deleteUser
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('admin', 'manager'), getUsers);
router.get('/:id', protect, getUserById);
router.put('/:id', protect, updateUser);
router.put('/:id/face', protect, updateFaceDescriptor);
router.delete('/:id', protect, authorize('admin'), deleteUser);

module.exports = router;
