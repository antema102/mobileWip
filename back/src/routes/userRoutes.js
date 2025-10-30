const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUserById,
  updateUser,
  updateFaceDescriptor,
  deleteUser
} = require('../controllers/userController');
const {
  importEmployees,
  exportEmployees,
  getImportTemplate
} = require('../controllers/importController');
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../utils/upload');

router.get('/', protect, authorize('admin', 'manager'), getUsers);
router.get('/export', protect, authorize('admin'), exportEmployees);
router.get('/import/template', protect, authorize('admin'), getImportTemplate);
router.post('/import', protect, authorize('admin'), upload.single('file'), importEmployees);
router.get('/:id', protect, getUserById);
router.put('/:id', protect, updateUser);
router.put('/:id/face', protect, updateFaceDescriptor);
router.delete('/:id', protect, authorize('admin'), deleteUser);

module.exports = router;
