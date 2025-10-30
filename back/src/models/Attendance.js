const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  checkIn: {
    type: Date,
    required: true
  },
  checkOut: {
    type: Date
  },
  checkInMethod: {
    type: String,
    enum: ['facial', 'manual'],
    default: 'facial'
  },
  checkOutMethod: {
    type: String,
    enum: ['facial', 'manual'],
    default: 'facial'
  },
  checkInLocation: {
    latitude: Number,
    longitude: Number
  },
  checkOutLocation: {
    latitude: Number,
    longitude: Number
  },
  workHours: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'completed'],
    default: 'active'
  },
  date: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Calculate work hours before saving
attendanceSchema.pre('save', function(next) {
  if (this.checkOut && this.checkIn) {
    const hours = (this.checkOut - this.checkIn) / (1000 * 60 * 60);
    this.workHours = Math.round(hours * 100) / 100;
    this.status = 'completed';
  }
  next();
});

module.exports = mongoose.model('Attendance', attendanceSchema);
