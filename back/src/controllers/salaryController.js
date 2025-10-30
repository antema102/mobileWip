const Salary = require('../models/Salary');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const { formatDate } = require('../utils/dateHelpers');

// @desc    Calculate and generate salary for a user
// @route   POST /api/salary/calculate
// @access  Private/Admin
const calculateSalary = async (req, res) => {
  try {
    const { userId, month, year, deductions, bonuses } = req.body;

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get attendance records for the period
    const startDate = formatDate(new Date(year, month - 1, 1));
    const endDate = formatDate(new Date(year, month, 0));

    const attendanceRecords = await Attendance.find({
      user: userId,
      date: { $gte: startDate, $lte: endDate },
      status: 'completed'
    });

    // Calculate total hours
    const totalHours = attendanceRecords.reduce((sum, record) => sum + record.workHours, 0);

    // Check if salary already exists
    let salary = await Salary.findOne({
      user: userId,
      'period.month': month,
      'period.year': year
    });

    if (salary) {
      // Update existing salary
      salary.totalHours = totalHours;
      salary.hourlyRate = user.hourlyRate;
      salary.deductions = deductions || 0;
      salary.bonuses = bonuses || 0;
    } else {
      // Create new salary
      salary = new Salary({
        user: userId,
        period: { month, year },
        totalHours,
        hourlyRate: user.hourlyRate,
        deductions: deductions || 0,
        bonuses: bonuses || 0
      });
    }

    await salary.save();

    const populatedSalary = await Salary.findById(salary._id)
      .populate('user', 'firstName lastName employeeId');

    res.status(201).json(populatedSalary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user salary history
// @route   GET /api/salary/user/:userId
// @access  Private
const getUserSalary = async (req, res) => {
  try {
    const { userId } = req.params;

    const salaries = await Salary.find({ user: userId })
      .sort({ 'period.year': -1, 'period.month': -1 })
      .populate('user', 'firstName lastName employeeId');

    res.json(salaries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all salaries
// @route   GET /api/salary
// @access  Private/Admin
const getAllSalaries = async (req, res) => {
  try {
    const { month, year } = req.query;

    let query = {};
    if (month && year) {
      query = {
        'period.month': parseInt(month),
        'period.year': parseInt(year)
      };
    }

    const salaries = await Salary.find(query)
      .sort({ 'period.year': -1, 'period.month': -1 })
      .populate('user', 'firstName lastName employeeId department');

    res.json(salaries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update salary status
// @route   PUT /api/salary/:id
// @access  Private/Admin
const updateSalaryStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const salary = await Salary.findById(req.params.id);

    if (!salary) {
      return res.status(404).json({ message: 'Salary record not found' });
    }

    salary.status = status;
    if (status === 'paid') {
      salary.paidAt = new Date();
    }

    await salary.save();

    const populatedSalary = await Salary.findById(salary._id)
      .populate('user', 'firstName lastName employeeId');

    res.json(populatedSalary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current month salary summary
// @route   GET /api/salary/current/:userId
// @access  Private
const getCurrentMonthSalary = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentDate = new Date();
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();

    const salary = await Salary.findOne({
      user: userId,
      'period.month': month,
      'period.year': year
    }).populate('user', 'firstName lastName employeeId');

    res.json(salary || { message: 'No salary record for current month' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Calculate pro-rata salary based on days present (as per cahier des charges)
// @route   POST /api/salary/calculate-prorata
// @access  Private/Admin
const calculateProRataSalary = async (req, res) => {
  try {
    const { userId, month, year, deductions, bonuses } = req.body;

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.baseSalary || user.baseSalary === 0) {
      return res.status(400).json({ 
        message: 'User does not have a base salary defined' 
      });
    }

    // Get attendance records for the period
    const startDate = formatDate(new Date(year, month - 1, 1));
    const endDate = formatDate(new Date(year, month, 0));

    const attendanceRecords = await Attendance.find({
      user: userId,
      date: { $gte: startDate, $lte: endDate },
      status: 'completed'
    });

    // Calculate working days in the month (excluding weekends)
    const workingDays = getWorkingDaysInMonth(month, year);
    
    // Count present days
    const presentDays = attendanceRecords.length;
    
    // Calculate total hours worked
    const totalHours = attendanceRecords.reduce((sum, record) => sum + record.workHours, 0);

    // Pro-rata calculation: (Base Salary / Working Days) * Present Days
    const dailyRate = user.baseSalary / workingDays;
    const proRataSalary = dailyRate * presentDays;

    // Calculate gross and net salary
    const deductionAmount = deductions || 0;
    const bonusAmount = bonuses || 0;
    const grossSalary = proRataSalary;
    const netSalary = grossSalary - deductionAmount + bonusAmount;

    // Check if salary already exists
    let salary = await Salary.findOne({
      user: userId,
      'period.month': month,
      'period.year': year
    });

    if (salary) {
      // Update existing salary
      salary.totalHours = totalHours;
      salary.hourlyRate = user.hourlyRate;
      salary.grossSalary = grossSalary;
      salary.deductions = deductionAmount;
      salary.bonuses = bonusAmount;
      salary.netSalary = netSalary;
    } else {
      // Create new salary
      salary = new Salary({
        user: userId,
        period: { month, year },
        totalHours,
        hourlyRate: user.hourlyRate,
        grossSalary,
        deductions: deductionAmount,
        bonuses: bonusAmount,
        netSalary
      });
    }

    await salary.save();

    const populatedSalary = await Salary.findById(salary._id)
      .populate('user', 'firstName lastName employeeId baseSalary');

    res.status(201).json({
      salary: populatedSalary,
      calculation: {
        baseSalary: user.baseSalary,
        workingDays,
        presentDays,
        dailyRate: Math.round(dailyRate * 100) / 100,
        proRataSalary: Math.round(proRataSalary * 100) / 100,
        totalHours: Math.round(totalHours * 100) / 100,
        formula: `(${user.baseSalary} / ${workingDays}) * ${presentDays} = ${Math.round(proRataSalary * 100) / 100}`
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function to calculate working days in a month (excluding weekends)
const getWorkingDaysInMonth = (month, year) => {
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  let count = 0;
  const current = new Date(firstDay);

  while (current <= lastDay) {
    const dayOfWeek = current.getDay();
    // Exclude weekends (0 = Sunday, 6 = Saturday)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }

  return count;
};

module.exports = {
  calculateSalary,
  getUserSalary,
  getAllSalaries,
  updateSalaryStatus,
  getCurrentMonthSalary,
  calculateProRataSalary
};
