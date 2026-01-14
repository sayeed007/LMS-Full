const mongoose = require('mongoose');
require('dotenv').config();

const Course = require('../src/models/Course');

const updateCourseCategory = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const course = await Course.findOne({ title: /SOLID Principles/ });
    
    if (course) {
      // Set to a more appropriate category
      course.category = 'Technology & Development';
      await course.save({ validateBeforeSave: false });
      console.log(`Updated category to: ${course.category}`);
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
  }
};

updateCourseCategory();
