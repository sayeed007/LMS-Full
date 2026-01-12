require('dotenv').config({ path: '../../../../.env' });
const mongoose = require('mongoose');
const Course = require('../../../../src/models/Course');
const Chapter = require('../../../../src/models/Chapter');
const Lesson = require('../../../../src/models/Lesson');

async function checkDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Check all courses
    const courses = await Course.find({}).select('_id title');
    console.log(`📚 Total Courses: ${courses.length}`);
    courses.forEach(c => console.log(`   - ${c.title} (${c._id})`));
    
    if (courses.length > 0) {
      console.log('\n📊 Checking each course:');
      for (const course of courses) {
        const chapters = await Chapter.find({ course: course._id });
        const lessons = await Lesson.find({ course: course._id });
        const lessonsWithChapter = await Lesson.find({ 
          course: course._id,
          chapter: { $exists: true, $ne: null }
        });
        
        console.log(`\n   Course: ${course.title}`);
        console.log(`   - Chapters: ${chapters.length}`);
        console.log(`   - Total Lessons: ${lessons.length}`);
        console.log(`   - Lessons with chapter: ${lessonsWithChapter.length}`);
        console.log(`   - Standalone lessons: ${lessons.length - lessonsWithChapter.length}`);
        
        if (chapters.length > 0) {
          console.log(`\n   Chapter breakdown:`);
          for (const chapter of chapters) {
            const chapterLessons = await Lesson.find({ chapter: chapter._id });
            console.log(`     - ${chapter.title}: ${chapterLessons.length} lessons`);
          }
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

checkDatabase();
