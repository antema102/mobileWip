const express = require('express');
const router = express.Router();
const {
  calculateSalary,
  getUserSalary,
  getAllSalaries,
  updateSalaryStatus,
  getCurrentMonthSalary,
  calculateProRataSalary
} = require('../controllers/salaryController');
const { protect, authorize } = require('../middleware/auth');

router.post('/calculate', protect, authorize('admin', 'manager'), calculateSalary);
router.post('/calculate-prorata', protect, authorize('admin', 'manager'), calculateProRataSalary);
router.get('/user/:userId', protect, getUserSalary);
router.get('/current/:userId', protect, getCurrentMonthSalary);
router.get('/', protect, authorize('admin', 'manager'), getAllSalaries);
router.put('/:id', protect, authorize('admin', 'manager'), updateSalaryStatus);

module.exports = router;
