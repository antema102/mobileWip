const Attendance = require('../models/Attendance');
const User = require('../models/User');
const Salary = require('../models/Salary');
const PDFDocument = require('pdfkit');
const { Parser } = require('@json2csv/plainjs');

// @desc    Export attendance report as CSV
// @route   GET /api/reports/attendance/csv
// @access  Private/Admin,Manager
const exportAttendanceCSV = async (req, res) => {
  try {
    const { startDate, endDate, userId, department } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }

    // Build query
    let attendanceQuery = {
      date: { $gte: startDate, $lte: endDate }
    };

    if (userId) {
      attendanceQuery.user = userId;
    }

    const attendances = await Attendance.find(attendanceQuery)
      .populate('user', 'firstName lastName employeeId department position')
      .sort({ date: -1 });

    // Filter by department if specified
    let filteredAttendances = attendances;
    if (department) {
      filteredAttendances = attendances.filter(a => 
        a.user && a.user.department === department
      );
    }

    // Prepare data for CSV
    const data = filteredAttendances.map(a => ({
      employeeId: a.user?.employeeId || 'N/A',
      employeeName: a.user ? `${a.user.firstName} ${a.user.lastName}` : 'N/A',
      department: a.user?.department || 'N/A',
      position: a.user?.position || 'N/A',
      date: a.date,
      checkIn: a.checkIn ? new Date(a.checkIn).toLocaleString() : 'N/A',
      checkOut: a.checkOut ? new Date(a.checkOut).toLocaleString() : 'N/A',
      workHours: a.workHours || 0,
      status: a.status,
      checkInMethod: a.checkInMethod,
      checkOutMethod: a.checkOutMethod || 'N/A'
    }));

    const fields = [
      'employeeId',
      'employeeName',
      'department',
      'position',
      'date',
      'checkIn',
      'checkOut',
      'workHours',
      'status',
      'checkInMethod',
      'checkOutMethod'
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(data);

    res.header('Content-Type', 'text/csv');
    res.header('Content-Disposition', `attachment; filename=attendance_${startDate}_to_${endDate}.csv`);
    res.send(csv);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Export attendance report as PDF
// @route   GET /api/reports/attendance/pdf
// @access  Private/Admin,Manager
const exportAttendancePDF = async (req, res) => {
  try {
    const { startDate, endDate, userId, department } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }

    // Build query
    let attendanceQuery = {
      date: { $gte: startDate, $lte: endDate }
    };

    if (userId) {
      attendanceQuery.user = userId;
    }

    const attendances = await Attendance.find(attendanceQuery)
      .populate('user', 'firstName lastName employeeId department position')
      .sort({ date: -1 });

    // Filter by department if specified
    let filteredAttendances = attendances;
    if (department) {
      filteredAttendances = attendances.filter(a => 
        a.user && a.user.department === department
      );
    }

    // Create PDF
    const doc = new PDFDocument({ margin: 50 });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=attendance_report_${startDate}_to_${endDate}.pdf`);
    
    doc.pipe(res);

    // Add title
    doc.fontSize(20).text('Rapport de Présence', { align: 'center' });
    doc.moveDown();
    
    // Add period
    doc.fontSize(12).text(`Période: ${startDate} à ${endDate}`, { align: 'center' });
    if (department) {
      doc.text(`Département: ${department}`, { align: 'center' });
    }
    doc.moveDown(2);

    // Add summary
    const totalRecords = filteredAttendances.length;
    const completedRecords = filteredAttendances.filter(a => a.status === 'completed').length;
    const totalHours = filteredAttendances.reduce((sum, a) => sum + (a.workHours || 0), 0);

    doc.fontSize(12).text(`Total d'enregistrements: ${totalRecords}`);
    doc.text(`Enregistrements complétés: ${completedRecords}`);
    doc.text(`Total d'heures travaillées: ${Math.round(totalHours * 100) / 100} heures`);
    doc.moveDown(2);

    // Add table header
    doc.fontSize(10);
    const tableTop = doc.y;
    const colWidths = {
      employeeId: 80,
      name: 120,
      date: 80,
      checkIn: 70,
      checkOut: 70,
      hours: 50
    };

    let xPos = 50;
    doc.text('ID Employé', xPos, tableTop);
    xPos += colWidths.employeeId;
    doc.text('Nom', xPos, tableTop);
    xPos += colWidths.name;
    doc.text('Date', xPos, tableTop);
    xPos += colWidths.date;
    doc.text('Arrivée', xPos, tableTop);
    xPos += colWidths.checkIn;
    doc.text('Départ', xPos, tableTop);
    xPos += colWidths.checkOut;
    doc.text('Heures', xPos, tableTop);

    doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();
    doc.moveDown();

    // Add table rows
    filteredAttendances.forEach((a, index) => {
      if (doc.y > 700) {
        doc.addPage();
        doc.y = 50;
      }

      const y = doc.y;
      xPos = 50;

      doc.text(a.user?.employeeId || 'N/A', xPos, y, { width: colWidths.employeeId - 5 });
      xPos += colWidths.employeeId;
      
      const name = a.user ? `${a.user.firstName} ${a.user.lastName}` : 'N/A';
      doc.text(name, xPos, y, { width: colWidths.name - 5 });
      xPos += colWidths.name;
      
      doc.text(a.date, xPos, y, { width: colWidths.date - 5 });
      xPos += colWidths.date;
      
      const checkInTime = a.checkIn ? new Date(a.checkIn).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '-';
      doc.text(checkInTime, xPos, y, { width: colWidths.checkIn - 5 });
      xPos += colWidths.checkIn;
      
      const checkOutTime = a.checkOut ? new Date(a.checkOut).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '-';
      doc.text(checkOutTime, xPos, y, { width: colWidths.checkOut - 5 });
      xPos += colWidths.checkOut;
      
      doc.text((a.workHours || 0).toFixed(2), xPos, y, { width: colWidths.hours - 5 });

      doc.moveDown(0.5);
    });

    // Finalize PDF
    doc.end();

  } catch (error) {
    console.error('PDF Export Error:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: error.message });
    }
  }
};

// @desc    Export salary report as CSV
// @route   GET /api/reports/salary/csv
// @access  Private/Admin
const exportSalaryCSV = async (req, res) => {
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
      .populate('user', 'firstName lastName employeeId department position')
      .sort({ 'period.year': -1, 'period.month': -1 });

    const data = salaries.map(s => ({
      employeeId: s.user?.employeeId || 'N/A',
      employeeName: s.user ? `${s.user.firstName} ${s.user.lastName}` : 'N/A',
      department: s.user?.department || 'N/A',
      position: s.user?.position || 'N/A',
      month: s.period.month,
      year: s.period.year,
      totalHours: s.totalHours,
      hourlyRate: s.hourlyRate,
      grossSalary: s.grossSalary,
      deductions: s.deductions,
      bonuses: s.bonuses,
      netSalary: s.netSalary,
      status: s.status,
      paidAt: s.paidAt ? new Date(s.paidAt).toLocaleDateString() : 'N/A'
    }));

    const fields = [
      'employeeId',
      'employeeName',
      'department',
      'position',
      'month',
      'year',
      'totalHours',
      'hourlyRate',
      'grossSalary',
      'deductions',
      'bonuses',
      'netSalary',
      'status',
      'paidAt'
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(data);

    const filename = month && year 
      ? `salary_report_${year}_${month}.csv`
      : 'salary_report_all.csv';

    res.header('Content-Type', 'text/csv');
    res.header('Content-Disposition', `attachment; filename=${filename}`);
    res.send(csv);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  exportAttendanceCSV,
  exportAttendancePDF,
  exportSalaryCSV
};
