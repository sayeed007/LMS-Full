const mongoose = require('mongoose');
const { dropDatabase } = require('./dropDatabase');
const { seedUsers } = require('./seeders/core/users');
const { seedCategories } = require('./seeders/core/categories');
const { seedSettings } = require('./seeders/core/settings');
const { seedQuestionBanks } = require('./seeders/questionBanks/defaultBanks');
const { seedGitHubMasteryCourse } = require('./seeders/courses/github-mastery/seed');
const { seedSOLIDPrinciplesCourse } = require('./seeders/courses/solid-principles/seed');
require('dotenv').config();

async function seed() {
  const startTime = Date.now();
  
  try {
    console.log('\\n🌱 Starting database seeding process...\\n');
    console.log('=' .repeat(60));
    
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lms';
    await mongoose.connect(mongoURI);
    console.log('\\n🔌 Connected to MongoDB');
    console.log(`📊 Database: ${mongoose.connection.name}\\n`);
    
    // Drop existing database
    console.log('=' .repeat(60));
    const dropped = await dropDatabase();
    if (!dropped) {
      console.log('\\n❌ Seeding cancelled');
      await mongoose.disconnect();
      return;
    }
    
    console.log('\\n' + '='.repeat(60));
    console.log('\\n🚀 Starting fresh seed...\\n');
    
    // Seed core data
    console.log('=' .repeat(60));
    console.log('PHASE 1: Core Data');
    console.log('=' .repeat(60));
    
    const users = await seedUsers();
    const categories = await seedCategories(users);
    await seedSettings();
    
    // Seed courses
    console.log('\\n' + '='.repeat(60));
    console.log('PHASE 2: Courses');
    console.log('=' .repeat(60));
    
    const githubCourse = await seedGitHubMasteryCourse(users, categories);
    const solidCourse = await seedSOLIDPrinciplesCourse(users, categories);
    
    // Seed question banks
    console.log('\\n' + '='.repeat(60));
    console.log('PHASE 3: Question Banks');
    console.log('=' .repeat(60));
    
    await seedQuestionBanks([githubCourse, solidCourse], users);
    
    // Summary
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log('\\n' + '='.repeat(60));
    console.log('✅ SEEDING COMPLETE!');
    console.log('=' .repeat(60));
    console.log('\\n📊 Summary:');
    console.log(`   • Users: ${users.length} (1 admin, 2 instructors, 5 students)`);
    console.log(`   • Categories: ${categories.length}`);
    console.log(`   • Courses: 2 (GitHub Mastery, SOLID Principles)`);
    console.log(`   • Question Banks: 2`);
    console.log(`\\n⏱️  Time taken: ${duration}s`);
    console.log('\\n🔐 Login Credentials:');
    console.log('   Admin: admin@lms.com / admin123');
    console.log('   Instructor: john.instructor@lms.com / instructor123');
    console.log('   Student: alice.student@lms.com / student123');
    console.log('\\n' + '='.repeat(60) + '\\n');
    
  } catch (error) {
    console.error('\\n❌ Seeding failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB\\n');
  }
}

// Run if called directly
if (require.main === module) {
  seed()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { seed };
