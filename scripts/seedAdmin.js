/* eslint-disable @typescript-eslint/no-require-imports */
// scripts/seedAdmin.js
const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');

async function seedAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ username: 'admin' });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      
      // Update password if needed
      const bcrypt = require('bcryptjs');
      const newPassword = process.env.ADMIN_PASSWORD || 'admin123';
      const isSamePassword = await bcrypt.compare(newPassword, existingAdmin.password);
      
      if (!isSamePassword) {
        existingAdmin.password = newPassword;
        await existingAdmin.save();
        console.log('Admin password updated');
      }
      
      mongoose.connection.close();
      return;
    }

    // Create new admin user
    const adminData = {
      username: 'admin',
      password: process.env.ADMIN_PASSWORD || 'admin123', // Will be hashed by pre-save hook
      role: 'admin',
      isActive: true,
      profile: {
        firstName: 'Admin',
        lastName: 'User'
      }
    };

    const admin = new User(adminData);
    await admin.save();
    
    console.log('Admin user created successfully!');
    console.log('Username: admin');
    console.log('Password:', process.env.ADMIN_PASSWORD || 'admin123');
    
    mongoose.connection.close();
    
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
}

seedAdmin();