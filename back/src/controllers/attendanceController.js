const Attendance = require('../models/Attendance');
const User = require('../models/User');
const { getTodayDate } = require('../utils/dateHelpers');

// @desc    Check in
// @route   POST /api/attendance/checkin
// @access  Private
const checkIn = async (req, res) => {
  try {
    const { userId, method, location, faceDescriptor } = req.body;
    const today = getTodayDate();

    // Check if user already checked in today
    const existingAttendance = await Attendance.findOne({
      user: userId,
      date: today,
      status: 'active'
    });

    if (existingAttendance) {
      return res.status(400).json({ message: 'Already checked in today' });
    }

    // If facial recognition, verify face descriptor
    if (method === 'facial' && faceDescriptor) {
      const user = await User.findById(userId);
      if (!user.faceDescriptor || user.faceDescriptor.length === 0) {
        return res.status(400).json({ message: 'Face not registered. Please register your face first.' });
      }
      
      // In production, you would compare face descriptors here
      // For now, we'll accept the face recognition
    }

    const attendance = await Attendance.create({
      user: userId,
      checkIn: new Date(),
      checkInMethod: method || 'facial',
      checkInLocation: location,
      date: today
    });

    res.status(201).json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Check out
// @route   PUT /api/attendance/checkout
// @access  Private
const checkOut = async (req, res) => {
  try {
    const { userId, method, location } = req.body;
    const today = getTodayDate();

    const attendance = await Attendance.findOne({
      user: userId,
      date: today,
      status: 'active'
    });

    if (!attendance) {
      return res.status(404).json({ message: 'No active check-in found for today' });
    }

    attendance.checkOut = new Date();
    attendance.checkOutMethod = method || 'facial';
    attendance.checkOutLocation = location;
    
    await attendance.save();

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user attendance history
// @route   GET /api/attendance/user/:userId
// @access  Private
const getUserAttendance = async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;

    let query = { user: userId };

    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    }

    const attendance = await Attendance.find(query)
      .sort({ date: -1 })
      .populate('user', 'firstName lastName employeeId');

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all attendance records
// @route   GET /api/attendance
// @access  Private/Admin
const getAllAttendance = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let query = {};

    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    }

    const attendance = await Attendance.find(query)
      .sort({ date: -1 })
      .populate('user', 'firstName lastName employeeId');

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get today's attendance status
// @route   GET /api/attendance/today/:userId
// @access  Private
const getTodayAttendance = async (req, res) => {
  try {
    const { userId } = req.params;
    const today = getTodayDate();

    const attendance = await Attendance.findOne({
      user: userId,
      date: today
    });

    res.json(attendance || { message: 'No attendance record for today' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Manually correct attendance (for HR/Manager)
// @route   PUT /api/attendance/:id/correct
// @access  Private/Manager,Admin
const correctAttendance = async (req, res) => {
  try {
    const { checkIn, checkOut, reason } = req.body;
    const attendance = await Attendance.findById(req.params.id);

    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    // Store previous values for audit log
    const previousValue = {
      checkIn: attendance.checkIn,
      checkOut: attendance.checkOut,
      workHours: attendance.workHours
    };

    // Update attendance
    if (checkIn) {
      attendance.checkIn = new Date(checkIn);
    }
    if (checkOut) {
      attendance.checkOut = new Date(checkOut);
    }

    await attendance.save();

    // Create audit log
    const AuditLog = require('../models/AuditLog');
    await AuditLog.create({
      action: 'attendance_correction',
      performedBy: req.user._id,
      targetUser: attendance.user,
      targetAttendance: attendance._id,
      description: reason || 'Manual attendance correction',
      previousValue,
      newValue: {
        checkIn: attendance.checkIn,
        checkOut: attendance.checkOut,
        workHours: attendance.workHours
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.json({
      message: 'Attendance corrected successfully',
      attendance,
      audit: {
        correctedBy: req.user.firstName + ' ' + req.user.lastName,
        correctedAt: new Date(),
        reason
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add manual attendance record (for HR/Manager)
// @route   POST /api/attendance/manual
// @access  Private/Manager,Admin
const addManualAttendance = async (req, res) => {
  try {
    const { userId, date, checkIn, checkOut, reason } = req.body;

    if (!userId || !date || !checkIn) {
      return res.status(400).json({ 
        message: 'userId, date, and checkIn time are required' 
      });
    }

    // Check if attendance already exists for this date
    const existingAttendance = await Attendance.findOne({
      user: userId,
      date
    });

    if (existingAttendance) {
      return res.status(400).json({ 
        message: 'Attendance record already exists for this date' 
      });
    }

    // Create attendance record
    const attendance = await Attendance.create({
      user: userId,
      checkIn: new Date(checkIn),
      checkOut: checkOut ? new Date(checkOut) : null,
      checkInMethod: 'manual',
      checkOutMethod: checkOut ? 'manual' : null,
      date,
      status: checkOut ? 'completed' : 'active'
    });

    // Create audit log
    const AuditLog = require('../models/AuditLog');
    await AuditLog.create({
      action: 'attendance_correction',
      performedBy: req.user._id,
      targetUser: userId,
      targetAttendance: attendance._id,
      description: reason || 'Manual attendance record added',
      newValue: {
        checkIn: attendance.checkIn,
        checkOut: attendance.checkOut,
        date: attendance.date
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.status(201).json({
      message: 'Manual attendance record created successfully',
      attendance
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get audit logs for attendance
// @route   GET /api/attendance/:id/audit
// @access  Private/Manager,Admin
const getAttendanceAudit = async (req, res) => {
  try {
    const AuditLog = require('../models/AuditLog');
    const logs = await AuditLog.find({ 
      targetAttendance: req.params.id 
    })
      .populate('performedBy', 'firstName lastName email role')
      .sort({ createdAt: -1 });

    res.json(logs);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  checkIn,
  checkOut,
  getUserAttendance,
  getAllAttendance,
  getTodayAttendance,
  correctAttendance,
  addManualAttendance,
  getAttendanceAudit
};
