#!/usr/bin/env node

/**
 * Script to create an admin account
 * Usage: node scripts/createAdmin.js
 */

const mongoose = require('mongoose');
const readline = require('readline');
require('dotenv').config();

const User = require('../src/models/User');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function createAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB');

    // Get admin information
    console.log('\n=== Create Admin Account ===\n');
    
    const firstName = await question('First Name: ');
    if (!firstName.trim()) {
      throw new Error('First name is required');
    }

    const lastName = await question('Last Name: ');
    if (!lastName.trim()) {
      throw new Error('Last name is required');
    }

    const email = await question('Email: ');
    if (!email.trim()) {
      throw new Error('Email is required');
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const employeeId = await question('Employee ID: ');
    if (!employeeId.trim()) {
      throw new Error('Employee ID is required');
    }

    // Check if employee ID already exists
    const existingEmployeeId = await User.findOne({ employeeId });
    if (existingEmployeeId) {
      throw new Error('Employee ID already exists');
    }

    const password = await question('Password (min 6 characters): ');
    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    const hourlyRateStr = await question('Hourly Rate (optional, press Enter to skip): ');
    const hourlyRate = hourlyRateStr.trim() ? parseFloat(hourlyRateStr) : 0;

    const department = await question('Department (optional): ');
    const position = await question('Position (optional): ');

    // Create admin user
    const admin = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      password,
      employeeId: employeeId.trim(),
      hourlyRate,
      department: department.trim() || undefined,
      position: position.trim() || undefined,
      role: 'admin'
    });

    console.log('\n✓ Admin account created successfully!');
    console.log('\nAdmin Details:');
    console.log(`  ID: ${admin._id}`);
    console.log(`  Name: ${admin.firstName} ${admin.lastName}`);
    console.log(`  Email: ${admin.email}`);
    console.log(`  Employee ID: ${admin.employeeId}`);
    console.log(`  Role: ${admin.role}`);
    console.log(`  Created: ${admin.createdAt}`);

  } catch (error) {
    console.error('\n✗ Error:', error.message);
    process.exit(1);
  } finally {
    rl.close();
    await mongoose.connection.close();
    console.log('\n✓ Database connection closed');
  }
}

// Run the script
createAdmin();
