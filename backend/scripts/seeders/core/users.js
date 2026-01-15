const User = require('../../../src/models/User');
const bcrypt = require('bcryptjs');

const users = [
  // Admin User
  {
    name: 'Admin User',
    email: 'admin@lms.com',
    password: 'admin123',
    role: 'super_admin',
    department: 'Administration',
    designation: 'System Administrator',
    isActive: true,
    isEmailVerified: true
  },
  // Instructors
  {
    name: 'John Doe',
    email: 'john.instructor@lms.com',
    password: 'instructor123',
    role: 'instructor',
    department: 'Computer Science',
    designation: 'Senior Instructor',
    isActive: true,
    isEmailVerified: true
  },
  {
    name: 'Jane Smith',
    email: 'jane.instructor@lms.com',
    password: 'instructor123',
    role: 'instructor',
    department: 'Software Engineering',
    designation: 'Lead Instructor',
    isActive: true,
    isEmailVerified: true
  },
  // Students
  {
    name: 'Alice Johnson',
    email: 'alice.student@lms.com',
    password: 'student123',
    role: 'student',
    department: 'Computer Science',
    designation: 'Student',
    isActive: true,
    isEmailVerified: true
  },
  {
    name: 'Bob Williams',
    email: 'bob.student@lms.com',
    password: 'student123',
    role: 'student',
    department: 'Software Engineering',
    designation: 'Student',
    isActive: true,
    isEmailVerified: true
  },
  {
    name: 'Charlie Brown',
    email: 'charlie.student@lms.com',
    password: 'student123',
    role: 'student',
    department: 'Computer Science',
    designation: 'Student',
    isActive: true,
    isEmailVerified: true
  },
  {
    name: 'Diana Prince',
    email: 'diana.student@lms.com',
    password: 'student123',
    role: 'student',
    department: 'Information Technology',
    designation: 'Student',
    isActive: true,
    isEmailVerified: true
  },
  {
    name: 'Ethan Hunt',
    email: 'ethan.student@lms.com',
    password: 'student123',
    role: 'student',
    department: 'Computer Science',
    designation: 'Student',
    isActive: true,
    isEmailVerified: true
  }
];

async function seedUsers() {
  console.log('🔐 Seeding users...');
  
  try {
    // Hash passwords
    const usersWithHashedPasswords = await Promise.all(
      users.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, 10)
      }))
    );

    // Insert users
    const createdUsers = await User.insertMany(usersWithHashedPasswords);
    
    console.log(`✅ Created ${createdUsers.length} users`);
    console.log('   - 1 Admin');
    console.log('   - 2 Instructors');
    console.log('   - 5 Students');
    
    return createdUsers;
  } catch (error) {
    console.error('❌ Error seeding users:', error.message);
    throw error;
  }
}

module.exports = { seedUsers, users };
