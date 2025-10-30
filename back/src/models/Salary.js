const mongoose = require('mongoose');

const salarySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  period: {
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12
    },
    year: {
      type: Number,
      required: true
    }
  },
  totalHours: {
    type: Number,
    default: 0
  },
  hourlyRate: {
    type: Number,
    required: true
  },
  grossSalary: {
    type: Number,
    default: 0
  },
  deductions: {
    type: Number,
    default: 0
  },
  bonuses: {
    type: Number,
    default: 0
  },
  netSalary: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'processed', 'paid'],
    default: 'pending'
  },
  paidAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Calculate salary before saving
salarySchema.pre('save', function(next) {
  this.grossSalary = this.totalHours * this.hourlyRate;
  this.netSalary = this.grossSalary - this.deductions + this.bonuses;
  next();
});

module.exports = mongoose.model('Salary', salarySchema);
