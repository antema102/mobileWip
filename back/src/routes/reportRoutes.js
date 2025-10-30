const express = require('express');
const router = express.Router();
const {
  exportAttendanceCSV,
  exportAttendancePDF,
  exportSalaryCSV
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

router.get('/attendance/csv', protect, authorize('admin', 'manager'), exportAttendanceCSV);
router.get('/attendance/pdf', protect, authorize('admin', 'manager'), exportAttendancePDF);
router.get('/salary/csv', protect, authorize('admin'), exportSalaryCSV);

module.exports = router;
