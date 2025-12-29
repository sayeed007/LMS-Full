/**
 * Standalone Script: Seed ONLY the SOLID Principles Course
 *
 * Use this when you already have users and categories in your database
 * and just want to add the SOLID Principles course.
 */

require('dotenv').config({ path: '../../../../.env' });
const mongoose = require('mongoose');
const chalk = require('chalk');
const { seedSOLIDPrinciplesCourse } = require('./solidPrinciplesCourseSeederComplete');
const User = require('../../../../src/models/User');

const seedCourseOnly = async () => {
  try {
    console.log(chalk.blue.bold('\n📘 Seeding SOLID Principles Course Only\n'));
    console.log(chalk.blue('═'.repeat(50)));

    // Connect to database
    console.log(chalk.cyan('Connecting to MongoDB...'));
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log(chalk.green('✅ Connected to MongoDB'));

    // Get existing users
    console.log(chalk.cyan('\nFetching existing users...'));
    const users = await User.find();

    if (users.length === 0) {
      console.log(chalk.red('❌ No users found in database!'));
      console.log(chalk.yellow('Please run the main seeder first or create users.'));
      process.exit(1);
    }

    console.log(chalk.green(`✅ Found ${users.length} users`));

    // Check for instructors
    const instructors = users.filter(u => u.role === 'instructor');
    if (instructors.length === 0) {
      console.log(chalk.red('❌ No instructors found!'));
      console.log(chalk.yellow('The course needs an instructor. Please create an instructor user first.'));
      process.exit(1);
    }

    console.log(chalk.green(`✅ Found ${instructors.length} instructors`));

    // Seed the SOLID course
    console.log(chalk.cyan('\n📘 Creating SOLID Principles course...'));
    const course = await seedSOLIDPrinciplesCourse(users);

    // Success summary
    console.log(chalk.green.bold('\n✅ SOLID Principles Course Created Successfully!\n'));
    console.log(chalk.blue('Course Details:'));
    console.log(chalk.blue('═'.repeat(50)));
    console.log(chalk.white(`   Title: ${course.title}`));
    console.log(chalk.white(`   Slug: ${course.slug}`));
    console.log(chalk.white(`   Course ID: ${course._id}`));
    console.log(chalk.white(`   Instructor: ${instructors[0].name}`));
    console.log(chalk.white(`   Chapters: ${course.chapters.length}`));
    console.log(chalk.white(`   Total Lessons: ${course.chapters.reduce((total, ch) => total + ch.lessons.length, 0)}`));
    console.log(chalk.white(`   Price: $${course.price}`));
    console.log(chalk.white(`   Level: ${course.level}`));
    console.log(chalk.white(`   Published: ${course.isPublished ? 'Yes' : 'No'}`));
    console.log(chalk.white(`   Featured: ${course.isFeatured ? 'Yes' : 'No'}`));

    console.log(chalk.green.bold('\n🎉 You can now view the course in your LMS!'));
    console.log(chalk.gray('\nCourse URL: /courses/' + course.slug));

  } catch (error) {
    console.error(chalk.red.bold('\n❌ Error creating course:'));
    console.error(chalk.red(error.message));

    if (error.code === 11000) {
      console.log(chalk.yellow('\n⚠️  Course already exists!'));
      console.log(chalk.yellow('If you want to recreate it, delete the existing course first.'));
    }

    console.error(chalk.gray('\nStack trace:'));
    console.error(chalk.gray(error.stack));
    process.exit(1);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log(chalk.cyan('\n📡 Database connection closed'));
  }
};

// Run the script
seedCourseOnly()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(chalk.red('Fatal error:'), error);
    process.exit(1);
  });
