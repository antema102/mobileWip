const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Salary = require('../models/Salary');
const { getTodayDate, getDateRange } = require('../utils/dateHelpers');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private/Admin,Manager
const getDashboardStats = async (req, res) => {
  try {
    const today = getTodayDate();
    const { period = 'today' } = req.query; // today, week, month

    // Get date range based on period
    const dateRange = getDateRange(period);

    // Total employees
    const totalEmployees = await User.countDocuments({ isActive: true });

    // Today's attendance
    const todayAttendance = await Attendance.find({ date: today });
    
    const presentToday = todayAttendance.filter(a => a.checkIn).length;
    const checkedOutToday = todayAttendance.filter(a => a.checkOut).length;
    const stillPresent = presentToday - checkedOutToday;
    const absentToday = totalEmployees - presentToday;

    // Late arrivals (assuming work starts at 9:00 AM)
    const workStartTime = 9; // 9 AM
    const lateToday = todayAttendance.filter(a => {
      if (!a.checkIn) return false;
      const checkInHour = new Date(a.checkIn).getHours();
      return checkInHour >= workStartTime;
    }).length;

    // Attendance for the period
    const periodAttendance = await Attendance.find({
      date: { $gte: dateRange.start, $lte: dateRange.end },
      status: 'completed'
    });

    // Calculate total hours worked in period
    const totalHoursWorked = periodAttendance.reduce((sum, att) => sum + (att.workHours || 0), 0);
    const averageHoursPerDay = periodAttendance.length > 0 ? totalHoursWorked / periodAttendance.length : 0;

    // Attendance rate
    const workingDays = getWorkingDaysBetween(dateRange.start, dateRange.end);
    const expectedAttendances = totalEmployees * workingDays;
    const actualAttendances = periodAttendance.length;
    const attendanceRate = expectedAttendances > 0 ? (actualAttendances / expectedAttendances) * 100 : 0;

    // Department-wise breakdown
    const departmentStats = await User.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 },
          avgSalary: { $avg: '$baseSalary' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      summary: {
        totalEmployees,
        presentToday,
        absentToday,
        stillPresent,
        lateToday,
        attendanceRate: Math.round(attendanceRate * 100) / 100
      },
      periodStats: {
        period,
        dateRange,
        totalHoursWorked: Math.round(totalHoursWorked * 100) / 100,
        averageHoursPerDay: Math.round(averageHoursPerDay * 100) / 100,
        totalAttendances: actualAttendances
      },
      departments: departmentStats,
      todayDetails: {
        present: todayAttendance.map(a => ({
          userId: a.user,
          checkIn: a.checkIn,
          checkOut: a.checkOut,
          workHours: a.workHours,
          status: a.status
        }))
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get attendance report with color coding
// @route   GET /api/dashboard/attendance-report
// @access  Private/Admin,Manager
const getAttendanceReport = async (req, res) => {
  try {
    const { startDate, endDate, userId, department } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }

    // Build query
    let userQuery = { isActive: true };
    if (userId) {
      userQuery._id = userId;
    }
    if (department) {
      userQuery.department = department;
    }

    const users = await User.find(userQuery).select('firstName lastName employeeId department position');
    
    // Get all attendance records for the period
    const attendances = await Attendance.find({
      date: { $gte: startDate, $lte: endDate }
    }).populate('user', 'firstName lastName employeeId');

    // Generate report for each user
    const report = users.map(user => {
      const userAttendances = attendances.filter(a => 
        a.user && a.user._id.toString() === user._id.toString()
      );

      // Calculate stats
      const totalDays = userAttendances.length;
      const completedDays = userAttendances.filter(a => a.status === 'completed').length;
      const totalHours = userAttendances.reduce((sum, a) => sum + (a.workHours || 0), 0);
      
      // Full days (≥8 hours)
      const fullDays = userAttendances.filter(a => a.workHours >= 8).length;
      // Incomplete days (<8 hours)
      const incompleteDays = userAttendances.filter(a => a.workHours > 0 && a.workHours < 8).length;

      // Day-by-day breakdown
      const dailyRecords = userAttendances.map(a => {
        let status = 'absent'; // GREY
        let color = 'grey';

        if (a.workHours >= 8) {
          status = 'full'; // GREEN
          color = 'green';
        } else if (a.workHours > 0 && a.workHours < 8) {
          status = 'incomplete'; // RED
          color = 'red';
        }

        return {
          date: a.date,
          checkIn: a.checkIn,
          checkOut: a.checkOut,
          workHours: a.workHours,
          status,
          color
        };
      });

      return {
        user: {
          id: user._id,
          employeeId: user.employeeId,
          name: `${user.firstName} ${user.lastName}`,
          department: user.department,
          position: user.position
        },
        summary: {
          totalDays,
          completedDays,
          fullDays,
          incompleteDays,
          totalHours: Math.round(totalHours * 100) / 100,
          averageHours: completedDays > 0 ? Math.round((totalHours / completedDays) * 100) / 100 : 0
        },
        dailyRecords
      };
    });

    res.json({
      period: { startDate, endDate },
      report
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get real-time employee status
// @route   GET /api/dashboard/live-status
// @access  Private/Admin,Manager
const getLiveStatus = async (req, res) => {
  try {
    const today = getTodayDate();
    
    const users = await User.find({ isActive: true })
      .select('firstName lastName employeeId department position photoUrl');
    
    const todayAttendances = await Attendance.find({ date: today });

    const liveStatus = users.map(user => {
      const attendance = todayAttendances.find(a => 
        a.user.toString() === user._id.toString()
      );

      let status = 'absent';
      let statusColor = 'grey';
      let checkInTime = null;
      let checkOutTime = null;
      let currentWorkHours = 0;

      if (attendance) {
        if (attendance.checkIn) {
          checkInTime = attendance.checkIn;
          
          if (attendance.checkOut) {
            status = 'checked_out';
            statusColor = 'blue';
            checkOutTime = attendance.checkOut;
            currentWorkHours = attendance.workHours;
          } else {
            status = 'present';
            statusColor = 'green';
            // Calculate current work hours
            const now = new Date();
            currentWorkHours = (now - new Date(attendance.checkIn)) / (1000 * 60 * 60);
          }
        }
      }

      return {
        user: {
          id: user._id,
          employeeId: user.employeeId,
          name: `${user.firstName} ${user.lastName}`,
          department: user.department,
          position: user.position,
          photoUrl: user.photoUrl
        },
        status,
        statusColor,
        checkInTime,
        checkOutTime,
        currentWorkHours: Math.round(currentWorkHours * 100) / 100
      };
    });

    res.json({
      date: today,
      timestamp: new Date(),
      employees: liveStatus
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function to calculate working days between dates
const getWorkingDaysBetween = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  let count = 0;
  const current = new Date(start);

  while (current <= end) {
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
  getDashboardStats,
  getAttendanceReport,
  getLiveStatus
};
