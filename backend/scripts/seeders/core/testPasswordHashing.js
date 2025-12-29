/**
 * Test Password Hashing
 *
 * This script tests if passwords are being hashed correctly (only once)
 */

require('dotenv').config({ path: '../../../.env' });
const mongoose = require('mongoose');
const User = require('../../../src/models/User');

async function testPasswordHashing() {
  try {
    console.log('🧪 Testing Password Hashing...\n');

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find the admin user (explicitly select password since it has select: false)
    const admin = await User.findOne({ email: 'admin@lms.com' }).select('+password');

    if (!admin) {
      console.log('❌ Admin user not found. Run seedAll.js first.');
      process.exit(1);
    }

    console.log('Found user:', admin.name);
    console.log('Email:', admin.email);
    console.log('Hashed password:', admin.password);
    console.log('Password length:', admin.password.length);
    console.log('');

    // Test password verification with the plain password
    const isValid = await admin.correctPassword('password123', admin.password);

    console.log('Testing password: "password123"');
    console.log('Password valid:', isValid ? '✅ YES' : '❌ NO');
    console.log('');

    if (isValid) {
      console.log('🎉 Password hashing is working correctly!');
      console.log('   - Password was hashed exactly once');
      console.log('   - Login with "password123" should work');
    } else {
      console.log('⚠️  PASSWORD HASHING ISSUE DETECTED!');
      console.log('   - Password may have been double-hashed');
      console.log('   - Login will NOT work');
      console.log('');
      console.log('💡 Solution: Re-run seedAll.js to fix the issue');
    }

    await mongoose.connection.close();
    console.log('\n📡 Database connection closed');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testPasswordHashing()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
