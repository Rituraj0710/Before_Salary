import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.model.js';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env') });

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/beforesalary';
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB Connected');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@beforesalary.com' });
    
    if (existingAdmin) {
      console.log('\n⚠️  Admin user already exists!');
      console.log('========================================');
      console.log('Admin Login Credentials:');
      console.log('Email: admin@beforesalary.com');
      console.log('Password: Admin@123');
      console.log('========================================\n');
      await mongoose.disconnect();
      process.exit(0);
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('Admin@123', 10);
    
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@beforesalary.com',
      phone: '9999999999',
      password: hashedPassword,
      role: 'admin',
      isVerified: {
        email: true,
        phone: true
      },
      isActive: true
    });

    console.log('\n✅ Admin user created successfully!');
    console.log('========================================');
    console.log('Admin Login Credentials:');
    console.log('Email: admin@beforesalary.com');
    console.log('Password: Admin@123');
    console.log('========================================');
    console.log('⚠️  Please change the password after first login!\n');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

createAdmin();

