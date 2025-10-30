const Attendance = require('../models/Attendance');
const User = require('../models/User');

// @desc    Check in
// @route   POST /api/attendance/checkin
// @access  Private
const checkIn = async (req, res) => {
  try {
    const { userId, method, location, faceDescriptor } = req.body;
    const today = new Date().toISOString().split('T')[0];

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
    const today = new Date().toISOString().split('T')[0];

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
    const today = new Date().toISOString().split('T')[0];

    const attendance = await Attendance.findOne({
      user: userId,
      date: today
    });

    res.json(attendance || { message: 'No attendance record for today' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  checkIn,
  checkOut,
  getUserAttendance,
  getAllAttendance,
  getTodayAttendance
};
