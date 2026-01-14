const mongoose = require('mongoose');
require('dotenv').config();

const Course = require('../src/models/Course');

const checkCourses = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const totalCourses = await Course.countDocuments();
    console.log(`\nTotal courses in database: ${totalCourses}`);

    const publishedAndApproved = await Course.countDocuments({
      isPublished: true,
      isApproved: true,
      isDeleted: false
    });
    console.log(`Published and approved courses: ${publishedAndApproved}`);

    const publishedOnly = await Course.countDocuments({ isPublished: true });
    console.log(`Published courses: ${publishedOnly}`);

    const approvedOnly = await Course.countDocuments({ isApproved: true });
    console.log(`Approved courses: ${approvedOnly}`);

    const deletedCourses = await Course.countDocuments({ isDeleted: true });
    console.log(`Deleted courses: ${deletedCourses}`);

    // Show sample course
    const sampleCourse = await Course.findOne().select('title isPublished isApproved isDeleted');
    if (sampleCourse) {
      console.log(`\nSample course:`);
      console.log(JSON.stringify(sampleCourse, null, 2));
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkCourses();
