const mongoose = require('mongoose');
require('dotenv').config();

const Course = require('../src/models/Course');

const fixCourses = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Update all published courses to also be approved
    const result = await Course.updateMany(
      { isPublished: true },
      { 
        $set: { 
          isApproved: true,
          approvedAt: new Date()
        } 
      }
    );

    console.log(`\nUpdated ${result.modifiedCount} courses`);

    // Verify the fix
    const publishedAndApproved = await Course.countDocuments({
      isPublished: true,
      isApproved: true,
      isDeleted: false
    });
    console.log(`Published and approved courses now: ${publishedAndApproved}`);

    // Show all courses
    const allCourses = await Course.find().select('title isPublished isApproved isDeleted');
    console.log(`\nAll courses:`);
    allCourses.forEach(course => {
      console.log(`- ${course.title}`);
      console.log(`  Published: ${course.isPublished}, Approved: ${course.isApproved}, Deleted: ${course.isDeleted || false}`);
    });

    await mongoose.connection.close();
    console.log('\nDone!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

fixCourses();
