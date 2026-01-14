const mongoose = require('mongoose');
require('dotenv').config();

const Course = require('../src/models/Course');
const Category = require('../src/models/Category');

const fixCourseCategory = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all categories
    const categories = await Category.find({ isActive: true });
    console.log('\nAvailable categories:');
    categories.forEach(cat => {
      console.log(`- ${cat.name} (${cat._id})`);
    });

    // Find the course
    const course = await Course.findOne({ title: /SOLID Principles/ });
    
    if (!course) {
      console.log('\nCourse not found!');
      await mongoose.connection.close();
      return;
    }

    console.log(`\nCourse category before: ${course.category}`);

    // Use the first available category or a development-related one
    const devCategory = categories.find(c => c.name.toLowerCase().includes('dev')) || categories[0];
    
    if (devCategory) {
      course.category = devCategory.name;
      await course.save({ validateBeforeSave: false }); // Skip validation temporarily
      console.log(`Course category after: ${course.category}`);
    }

    // Verify
    const publishedCount = await Course.countDocuments({
      isPublished: true,
      isDeleted: false
    });

    console.log(`\nPublished courses: ${publishedCount}`);

    await mongoose.connection.close();
    console.log('\nDone!');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

fixCourseCategory();
