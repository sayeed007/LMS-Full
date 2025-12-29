require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const chalk = require('chalk');

// Import models
const User = require('../models/User');
const Category = require('../models/Category');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const { Quiz, QuizAttempt } = require('../models/Quiz');
const Question = require('../models/Question');
const QuestionBank = require('../models/QuestionBank');
const Enrollment = require('../models/Enrollment');

// Import seeders
const { seedUsers } = require('./userSeeder');
const { seedCategories } = require('./categorySeeder');
const { seedCourses } = require('./courseSeeder');
const { seedLessons } = require('./lessonSeeder');
const { seedQuestionBanks, seedQuestions, seedQuizzes } = require('./quizSeeder');
const { seedEnrollments } = require('./enrollmentSeeder');

// Database connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(chalk.cyan(`MongoDB Connected: ${conn.connection.host}`));
  } catch (error) {
    console.error(chalk.red(`Database connection error: ${error.message}`));
    process.exit(1);
  }
};

// Clear all data
const clearDatabase = async () => {
  try {
    console.log(chalk.yellow('🗑️  Clearing existing data...'));

    await QuizAttempt.deleteMany({});
    await Quiz.deleteMany({});
    await Question.deleteMany({});
    await QuestionBank.deleteMany({});
    await Lesson.deleteMany({});
    await Enrollment.deleteMany({});
    await Course.deleteMany({});
    await Category.deleteMany({});
    await User.deleteMany({});

    console.log(chalk.green('✅ Database cleared'));
  } catch (error) {
    console.error(chalk.red(`Error clearing database: ${error.message}`));
    throw error;
  }
};

// Main seeding function
const seedDatabase = async () => {
  try {
    console.log(chalk.blue.bold('\n🌱 Starting LMS Database Seeding...\n'));

    // Connect to database
    await connectDB();

    // Clear existing data
    await clearDatabase();

    // Start seeding process
    console.log(chalk.yellow('📊 Seeding data...\n'));

    // 1. Seed Users (instructors, students, admins)
    console.log(chalk.cyan('👥 Seeding users...'));
    const users = await seedUsers();
    console.log(chalk.green(`✅ Created ${users.length} users\n`));

    // 2. Seed Categories
    console.log(chalk.cyan('📁 Seeding categories...'));
    const categories = await seedCategories(users);
    console.log(chalk.green(`✅ Created ${categories.length} categories\n`));

    // 3. Seed Courses
    console.log(chalk.cyan('📚 Seeding courses...'));
    const courses = await seedCourses(users);
    console.log(chalk.green(`✅ Created ${courses.length} courses\n`));

    // 4. Seed Question Banks
    console.log(chalk.cyan('🏦 Seeding question banks...'));
    const questionBanks = await seedQuestionBanks(users, courses);
    console.log(chalk.green(`✅ Created ${questionBanks.length} question banks\n`));

    // 5. Seed Questions
    console.log(chalk.cyan('❓ Seeding questions...'));
    const questions = await seedQuestions(questionBanks, users);
    console.log(chalk.green(`✅ Created ${questions.length} questions\n`));

    // 6. Seed Lessons
    console.log(chalk.cyan('📖 Seeding lessons...'));
    const lessons = await seedLessons(courses, users);
    console.log(chalk.green(`✅ Created ${lessons.length} lessons\n`));

    // 7. Seed Quizzes
    console.log(chalk.cyan('🧭 Seeding quizzes...'));
    const quizzes = await seedQuizzes(courses, questions, users);
    console.log(chalk.green(`✅ Created ${quizzes.length} quizzes\n`));

    // 8. Seed Enrollments
    console.log(chalk.cyan('🎓 Seeding enrollments...'));
    const enrollments = await seedEnrollments(courses, lessons, users);
    console.log(chalk.green(`✅ Created ${enrollments.length} enrollments\n`));

    // Success message
    console.log(chalk.green.bold('🎉 Database seeding completed successfully!\n'));

    console.log(chalk.blue('📊 Summary:'));
    console.log(chalk.white(`   Users: ${users.length}`));
    console.log(chalk.white(`   Categories: ${categories.length}`));
    console.log(chalk.white(`   Courses: ${courses.length}`));
    console.log(chalk.white(`   Question Banks: ${questionBanks.length}`));
    console.log(chalk.white(`   Questions: ${questions.length}`));
    console.log(chalk.white(`   Lessons: ${lessons.length}`));
    console.log(chalk.white(`   Quizzes: ${quizzes.length}`));
    console.log(chalk.white(`   Enrollments: ${enrollments.length}\n`));

    console.log(chalk.magenta.bold('🔑 Test Accounts:'));
    console.log(chalk.white('   Admin: admin@lms.com / password123'));
    console.log(chalk.white('   Instructor: john.doe@lms.com / password123'));
    console.log(chalk.white('   Student: alice.student@lms.com / password123\n'));

  } catch (error) {
    console.error(chalk.red.bold(`❌ Seeding failed: ${error.message}`));
    console.error(chalk.red(error.stack));
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log(chalk.cyan('📡 Database connection closed'));
    process.exit(0);
  }
};

// Handle command line arguments
const args = process.argv.slice(2);

if (args.includes('--clear')) {
  // Only clear database
  (async () => {
    await connectDB();
    await clearDatabase();
    await mongoose.connection.close();
    process.exit(0);
  })();
} else {
  // Run full seeding
  seedDatabase();
}

module.exports = {
  seedDatabase,
  clearDatabase,
  connectDB
};