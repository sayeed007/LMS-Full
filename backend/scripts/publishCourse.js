const mongoose = require('mongoose');
require('dotenv').config();

const Course = require('../src/models/Course');

const publishCourse = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find the course
    const course = await Course.findOne({ title: /SOLID Principles/ });
    
    if (!course) {
      console.log('Course not found!');
      await mongoose.connection.close();
      return;
    }

    console.log('\nBefore update:');
    console.log(`Title: ${course.title}`);
    console.log(`isPublished: ${course.isPublished}`);
    console.log(`isDeleted: ${course.isDeleted}`);

    // Update the course
    course.isPublished = true;
    course.isDeleted = false;
    await course.save();

    console.log('\nAfter update:');
    console.log(`isPublished: ${course.isPublished}`);
    console.log(`isDeleted: ${course.isDeleted}`);

    // Verify by querying
    const publishedCount = await Course.countDocuments({
      isPublished: true,
      isDeleted: false
    });

    console.log(`\nPublished courses in database: ${publishedCount}`);

    await mongoose.connection.close();
    console.log('\nDone!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

publishCourse();
