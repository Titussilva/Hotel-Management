import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './server/models/User.js';

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  // 1. Auto-create admin if missing via login endpoint
  const loginRes = await fetch('http://localhost:10000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@stayease.test', password: 'password123' })
  });
  const loginData = await loginRes.json();
  console.log('Login Response:', loginData);

  // 2. Fetch admin users
  const usersRes = await fetch('http://localhost:10000/api/admin/users', {
    headers: { 'Authorization': `Bearer ${loginData.token}` }
  });
  const usersData = await usersRes.json();
  console.log('Admin Users Response:', JSON.stringify(usersData).substring(0, 500) + '...');

  // 3. Verify DB explicitly
  const adminUser = await User.findOne({ email: 'admin@stayease.test' });
  console.log('DB Insert Result:', adminUser ? 'User exists' : 'User not found', adminUser);

  mongoose.disconnect();
}

run();
