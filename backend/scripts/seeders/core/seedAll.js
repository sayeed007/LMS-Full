require('dotenv').config({ path: '../../../.env' });
const mongoose = require('mongoose');
const chalk = require('chalk');

// Import models
const User = require('../../../src/models/User');
const Category = require('../../../src/models/Category');
const Course = require('../../../src/models/Course');
const Lesson = require('../../../src/models/Lesson');
const Assignment = require('../../../src/models/Assignment');
const { Quiz, QuizAttempt } = require('../../../src/models/Quiz');
const Question = require('../../../src/models/Question');
const QuestionBank = require('../../../src/models/QuestionBank');
const Enrollment = require('../../../src/models/Enrollment');

// Import seeders
const { seedUsers } = require('./userSeeder');
const { seedCategories } = require('./categorySeeder');
const { seedCoursesWithLessons } = require('../courses/improvedCourseSeeder');
const { seedSOLIDPrinciplesCourse } = require('../courses/solid-principles/solidPrinciplesCourseSeederComplete');
const { seedQuestionBanks, seedQuestions, seedQuizzes } = require('../assessments/quizSeeder');
const { seedEnrollments } = require('../students/enrollmentSeeder');
const { seedArticles } = require('../content/improvedArticleSeeder');

// Database connection with retry logic
const connectDB = async (retries = 5) => {
  for (let i = 0; i < retries; i++) {
    try {
      const conn = await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
      console.log(chalk.cyan(`MongoDB Connected: ${conn.connection.host}`));
      return conn;
    } catch (error) {
      console.error(chalk.red(`Database connection attempt ${i + 1} failed: ${error.message}`));
      if (i === retries - 1) {
        throw error;
      }
      console.log(chalk.yellow(`Retrying in 3 seconds...`));
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
};

// Clear all data with error handling
const clearDatabase = async () => {
  try {
    console.log(chalk.yellow('🗑️  Clearing existing data...'));

    const collections = [
      'quizattempts',
      'quizzes',
      'questions',
      'questionbanks',
      'assignments',
      'lessons',
      'enrollments',
      'courses',
      'categories',
      'users',
      'articles'
    ];

    const clearPromises = collections.map(async (collection) => {
      try {
        const model = getModelByCollection(collection);
        if (model) {
          const count = await model.countDocuments();
          if (count > 0) {
            await model.deleteMany({});
            console.log(chalk.gray(`   • Cleared ${count} documents from ${collection}`));
          }
        }
      } catch (error) {
        console.warn(chalk.yellow(`   • Warning: Could not clear ${collection}: ${error.message}`));
      }
    });

    await Promise.all(clearPromises);
    console.log(chalk.green('✅ Database cleared successfully'));
  } catch (error) {
    console.error(chalk.red(`Error clearing database: ${error.message}`));
    throw error;
  }
};

// Helper function to get model by collection name
const getModelByCollection = (collection) => {
  const modelMap = {
    'quizattempts': QuizAttempt,
    'quizzes': Quiz,
    'questions': Question,
    'questionbanks': QuestionBank,
    'assignments': Assignment,
    'lessons': Lesson,
    'enrollments': Enrollment,
    'courses': Course,
    'categories': Category,
    'users': User,
    'articles': require('../../../src/models/Article')
  };
  return modelMap[collection];
};

// Comprehensive seeding function with progress tracking
const seedDatabase = async () => {
  const startTime = Date.now();
  let users, categories, courses, questionBanks, questions, quizzes, enrollments, articles;

  try {
    console.log(chalk.blue.bold('\n🌱 Starting Comprehensive LMS Database Seeding...\n'));

    // Connect to database
    await connectDB();

    // Clear existing data
    await clearDatabase();

    console.log(chalk.yellow('📊 Starting seeding process...\n'));

    // Phase 1: Core Data
    console.log(chalk.cyan.bold('📝 PHASE 1: Core Data Setup'));
    console.log(chalk.cyan('👥 Seeding users...'));
    users = await seedUsers();
    console.log(chalk.green(`✅ Created ${users.length} users`));

    console.log(chalk.cyan('📁 Seeding categories...'));
    categories = await seedCategories(users);
    console.log(chalk.green(`✅ Created ${categories.length} categories`));

    // Phase 2: Course Content
    console.log(chalk.cyan.bold('\n📚 PHASE 2: Course Content'));
    console.log(chalk.cyan('📚 Seeding courses with embedded lessons...'));
    courses = await seedCoursesWithLessons(users);
    console.log(chalk.green(`✅ Created ${courses.length} courses with embedded lessons`));

    console.log(chalk.cyan('📘 Seeding SOLID Principles course...'));
    const solidCourse = await seedSOLIDPrinciplesCourse(users);
    courses.push(solidCourse);
    console.log(chalk.green(`✅ Created SOLID Principles & Design Patterns Mastery course`));

    // Count total lessons across all courses
    const totalLessons = courses.reduce((total, course) => {
      return total + course.chapters.reduce((chapterTotal, chapter) => {
        return chapterTotal + (chapter.lessons ? chapter.lessons.length : 0);
      }, 0);
    }, 0);
    console.log(chalk.green(`   • Total lessons embedded: ${totalLessons}`));

    // Phase 3: Assessment System
    console.log(chalk.cyan.bold('\n🧭 PHASE 3: Assessment System'));
    try {
      console.log(chalk.cyan('🏦 Seeding question banks...'));
      questionBanks = await seedQuestionBanks(users, courses);
      console.log(chalk.green(`✅ Created ${questionBanks.length} question banks`));

      console.log(chalk.cyan('❓ Seeding questions...'));
      questions = await seedQuestions(questionBanks, users);
      console.log(chalk.green(`✅ Created ${questions.length} questions`));

      console.log(chalk.cyan('🧭 Seeding quizzes...'));
      quizzes = await seedQuizzes(courses, questions, users);
      console.log(chalk.green(`✅ Created ${quizzes.length} quizzes`));
    } catch (error) {
      console.warn(chalk.yellow(`⚠️  Warning: Assessment system seeding failed: ${error.message}`));
      console.log(chalk.gray('   Continuing with enrollment seeding...'));
      questionBanks = [];
      questions = [];
      quizzes = [];
    }

    // Phase 4: Student Enrollments
    console.log(chalk.cyan.bold('\n🎓 PHASE 4: Student Enrollments'));
    console.log(chalk.cyan('🎓 Seeding enrollments...'));

    // Create a lessons array for enrollment seeder compatibility
    const allLessons = [];
    courses.forEach(course => {
      course.chapters.forEach(chapter => {
        if (chapter.lessons) {
          chapter.lessons.forEach(lesson => {
            allLessons.push({
              _id: lesson._id,
              course: course._id,
              title: lesson.title,
              order: lesson.order
            });
          });
        }
      });
    });

    enrollments = await seedEnrollments(courses, allLessons, users);
    console.log(chalk.green(`✅ Created ${enrollments.length} enrollments`));

    // Phase 5: Articles and Content
    console.log(chalk.cyan.bold('\n📰 PHASE 5: Articles and Content'));
    console.log(chalk.cyan('📰 Seeding articles...'));
    const articles = await seedArticles(users);
    console.log(chalk.green(`✅ Created ${articles.length} articles`));

    // Final Statistics
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log(chalk.green.bold('\n🎉 Database seeding completed successfully!\n'));
    console.log(chalk.blue.bold('📊 SEEDING SUMMARY'));
    console.log(chalk.blue('═══════════════════════════════════════'));
    console.log(chalk.white(`   Time taken: ${duration} seconds`));
    console.log(chalk.white(`   Users: ${users.length}`));
    console.log(chalk.white(`   Categories: ${categories.length}`));
    console.log(chalk.white(`   Courses: ${courses.length}`));
    console.log(chalk.white(`   Total Lessons: ${totalLessons}`));
    console.log(chalk.white(`   Question Banks: ${questionBanks.length}`));
    console.log(chalk.white(`   Questions: ${questions.length}`));
    console.log(chalk.white(`   Quizzes: ${quizzes.length}`));
    console.log(chalk.white(`   Enrollments: ${enrollments.length}`));
    console.log(chalk.white(`   Articles: ${articles.length}`));

    console.log(chalk.magenta.bold('\n🔑 TEST ACCOUNTS'));
    console.log(chalk.magenta('═══════════════════════════════════'));
    console.log(chalk.white('   🔹 Admin: admin@lms.com / password123'));
    console.log(chalk.white('   🔹 Instructor: john.doe@lms.com / password123'));
    console.log(chalk.white('   🔹 Student: alice.student@lms.com / password123'));

    console.log(chalk.green.bold('\n🚀 Your LMS is now ready for use!'));
    console.log(chalk.gray('   You can start the application and begin testing.\n'));

    return {
      users,
      categories,
      courses,
      questionBanks,
      questions,
      quizzes,
      enrollments,
      articles,
      totalLessons,
      duration
    };

  } catch (error) {
    console.error(chalk.red.bold(`\n❌ SEEDING FAILED`));
    console.error(chalk.red(`Error: ${error.message}`));

    if (error.stack) {
      console.error(chalk.gray('\nStack trace:'));
      console.error(chalk.gray(error.stack));
    }

    // Provide helpful debugging information
    console.log(chalk.yellow('\n🔧 DEBUGGING HELP'));
    console.log(chalk.yellow('══════════════════'));
    console.log(chalk.white('1. Check your MongoDB connection string in .env'));
    console.log(chalk.white('2. Ensure MongoDB is running and accessible'));
    console.log(chalk.white('3. Verify all required models are properly imported'));
    console.log(chalk.white('4. Check for any missing dependencies'));

    throw error;
  } finally {
    // Close database connection
    try {
      await mongoose.connection.close();
      console.log(chalk.cyan('📡 Database connection closed'));
    } catch (closeError) {
      console.warn(chalk.yellow(`Warning: Error closing database connection: ${closeError.message}`));
    }
  }
};

// Handle command line arguments
const handleCommandLine = () => {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(chalk.blue.bold('\nLMS Database Seeder'));
    console.log(chalk.blue('══════════════════════'));
    console.log(chalk.white('Usage: node seedAll.js [options]'));
    console.log(chalk.white('\nOptions:'));
    console.log(chalk.white('  --clear, -c    Clear database only (no seeding)'));
    console.log(chalk.white('  --help, -h     Show this help message'));
    console.log(chalk.white('\nExamples:'));
    console.log(chalk.white('  node seedAll.js           # Full seeding'));
    console.log(chalk.white('  node seedAll.js --clear   # Clear database only'));
    process.exit(0);
  }

  if (args.includes('--clear') || args.includes('-c')) {
    // Only clear database
    (async () => {
      try {
        await connectDB();
        await clearDatabase();
        console.log(chalk.green.bold('✅ Database cleared successfully!'));
      } catch (error) {
        console.error(chalk.red(`❌ Failed to clear database: ${error.message}`));
        process.exit(1);
      } finally {
        await mongoose.connection.close();
        process.exit(0);
      }
    })();
  } else {
    // Run full seeding
    seedDatabase()
      .then((result) => {
        console.log(chalk.green(`\n✨ Seeding completed in ${result.duration}s`));
        process.exit(0);
      })
      .catch((error) => {
        console.error(chalk.red('\n💥 Seeding failed!'));
        process.exit(1);
      });
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error(chalk.red.bold('💥 Uncaught Exception!'));
  console.error(chalk.red(error.message));
  console.error(chalk.gray(error.stack));
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error(chalk.red.bold('💥 Unhandled Rejection!'));
  console.error(chalk.red('Reason:', reason));
  console.error(chalk.gray('Promise:', promise));
  process.exit(1);
});

// Run the command line handler
if (require.main === module) {
  handleCommandLine();
}

module.exports = {
  seedDatabase,
  clearDatabase,
  connectDB
};