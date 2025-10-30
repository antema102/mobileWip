const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const XLSX = require('xlsx');
const csv = require('csv-parser');
const fs = require('fs');

// @desc    Import employees from CSV/XLSX file
// @route   POST /api/users/import
// @access  Private/Admin
const importEmployees = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const fileExtension = req.file.originalname.split('.').pop().toLowerCase();
    let employees = [];

    if (fileExtension === 'csv') {
      // Parse CSV
      employees = await parseCSV(filePath);
    } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      // Parse Excel
      employees = parseExcel(filePath);
    } else {
      fs.unlinkSync(filePath);
      return res.status(400).json({ message: 'Invalid file format. Please upload CSV or XLSX file.' });
    }

    // Validate and create employees
    const results = {
      success: [],
      errors: []
    };

    for (const empData of employees) {
      try {
        // Validate required fields
        if (!empData.firstName || !empData.lastName || !empData.email || !empData.employeeId) {
          results.errors.push({
            row: empData,
            error: 'Missing required fields (firstName, lastName, email, employeeId)'
          });
          continue;
        }

        // Check if user already exists
        const existingUser = await User.findOne({
          $or: [
            { email: empData.email },
            { employeeId: empData.employeeId }
          ]
        });

        if (existingUser) {
          results.errors.push({
            row: empData,
            error: `User already exists with email ${empData.email} or employeeId ${empData.employeeId}`
          });
          continue;
        }

        // Create default password (should be changed on first login)
        const defaultPassword = empData.password || 'changeme123';

        // Create user
        const user = await User.create({
          firstName: empData.firstName,
          lastName: empData.lastName,
          email: empData.email.toLowerCase(),
          password: defaultPassword,
          employeeId: empData.employeeId,
          address: empData.address || '',
          age: empData.age || null,
          baseSalary: parseFloat(empData.baseSalary) || 0,
          hourlyRate: parseFloat(empData.hourlyRate) || 0,
          department: empData.department || '',
          position: empData.position || '',
          role: empData.role || 'employee'
        });

        results.success.push({
          employeeId: user.employeeId,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email
        });

      } catch (error) {
        results.errors.push({
          row: empData,
          error: error.message
        });
      }
    }

    // Log the import action
    await AuditLog.create({
      action: 'user_import',
      performedBy: req.user._id,
      description: `Imported ${results.success.length} employees from ${req.file.originalname}`,
      newValue: {
        totalProcessed: employees.length,
        successCount: results.success.length,
        errorCount: results.errors.length
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    res.status(201).json({
      message: 'Import completed',
      summary: {
        total: employees.length,
        success: results.success.length,
        errors: results.errors.length
      },
      results
    });

  } catch (error) {
    // Clean up file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: error.message });
  }
};

// Helper function to parse CSV
const parseCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
};

// Helper function to parse Excel
const parseExcel = (filePath) => {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(worksheet);
};

// @desc    Export employees to CSV
// @route   GET /api/users/export
// @access  Private/Admin
const exportEmployees = async (req, res) => {
  try {
    const users = await User.find({}).select('-password -faceDescriptor');
    
    const { Parser } = require('@json2csv/plainjs');
    const fields = [
      'employeeId',
      'firstName', 
      'lastName',
      'email',
      'address',
      'age',
      'position',
      'department',
      'baseSalary',
      'hourlyRate',
      'role',
      'isActive',
      'createdAt'
    ];
    
    const parser = new Parser({ fields });
    const csv = parser.parse(users);

    res.header('Content-Type', 'text/csv');
    res.header('Content-Disposition', 'attachment; filename=employees.csv');
    res.send(csv);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get employee import template
// @route   GET /api/users/import/template
// @access  Private/Admin
const getImportTemplate = (req, res) => {
  const templateData = [
    {
      firstName: 'Jean',
      lastName: 'Dupont',
      email: 'jean.dupont@example.com',
      employeeId: 'EMP001',
      address: '123 Rue de la Paix, Paris',
      age: 30,
      position: 'Développeur',
      department: 'IT',
      baseSalary: 3000,
      hourlyRate: 15,
      role: 'employee',
      password: 'changeme123'
    }
  ];

  const { Parser } = require('@json2csv/plainjs');
  const parser = new Parser();
  const csv = parser.parse(templateData);

  res.header('Content-Type', 'text/csv');
  res.header('Content-Disposition', 'attachment; filename=employee_import_template.csv');
  res.send(csv);
};

module.exports = {
  importEmployees,
  exportEmployees,
  getImportTemplate
};
