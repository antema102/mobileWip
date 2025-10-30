const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAttendanceReport,
  getLiveStatus
} = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/auth');

router.get('/stats', protect, authorize('admin', 'manager'), getDashboardStats);
router.get('/attendance-report', protect, authorize('admin', 'manager'), getAttendanceReport);
router.get('/live-status', protect, authorize('admin', 'manager'), getLiveStatus);

module.exports = router;
