require('dotenv').config({ path: '../../../../.env' });
const mongoose = require('mongoose');
const Lesson = require('../../../../src/models/Lesson');
const Chapter = require('../../../../src/models/Chapter');

async function checkLessons() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const courseId = '6964b6407fb5200f542206f2';
    
    // Count lessons
    const lessonCount = await Lesson.countDocuments({ course: courseId });
    console.log(`Total Lessons in DB for course: ${lessonCount}`);
    
    // Count chapters
    const chapterCount = await Chapter.countDocuments({ course: courseId });
    console.log(`Total Chapters in DB for course: ${chapterCount}`);
    
    // Check if lessons have chapter field
    const lessonsWithChapter = await Lesson.countDocuments({ 
      course: courseId,
      chapter: { $exists: true, $ne: null }
    });
    console.log(`Lessons with chapter field: ${lessonsWithChapter}`);
    
    // Sample lesson
    const sampleLesson = await Lesson.findOne({ course: courseId });
    if (sampleLesson) {
      console.log('\nSample Lesson:');
      console.log(`  Title: ${sampleLesson.title}`);
      console.log(`  Chapter: ${sampleLesson.chapter}`);
      console.log(`  Module: ${sampleLesson.module}`);
      console.log(`  isPublished: ${sampleLesson.isPublished}`);
      console.log(`  isDeleted: ${sampleLesson.isDeleted}`);
    }
    
  } catch (error) {
    console.error(error);
  } finally {
    await mongoose.connection.close();
  }
}

checkLessons();
