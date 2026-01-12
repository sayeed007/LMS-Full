require('dotenv').config({ path: '../../../../.env' });
const mongoose = require('mongoose');
const Course = require('../../../../src/models/Course');
const Chapter = require('../../../../src/models/Chapter');
const Lesson = require('../../../../src/models/Lesson');
const Content = require('../../../../src/models/Content');

async function cleanupCourse() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const courseId = '6964b6407fb5200f542206f2';
    
    console.log('🗑️  Deleting all content...');
    const lessons = await Lesson.find({ course: courseId });
    for (const lesson of lessons) {
      await Content.deleteMany({ lesson: lesson._id });
    }
    
    console.log('🗑️  Deleting all lessons...');
    await Lesson.deleteMany({ course: courseId });
    
    console.log('🗑️  Deleting all chapters...');
    await Chapter.deleteMany({ course: courseId });
    
    console.log('🗑️  Deleting course...');
    await Course.deleteOne({ _id: courseId });
    
    console.log('✅ Cleanup complete!');
    
  } catch (error) {
    console.error(error);
  } finally {
    await mongoose.connection.close();
  }
}

cleanupCourse();
