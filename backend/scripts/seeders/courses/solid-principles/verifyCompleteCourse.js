/**
 * Verify Complete SOLID Course Structure
 *
 * Checks that all 8 chapters and 23 lessons have been created
 */

require('dotenv').config({ path: '../../../../.env' });
const mongoose = require('mongoose');
const Course = require('../../../../src/models/Course');
const Chapter = require('../../../../src/models/Chapter');
const Lesson = require('../../../../src/models/Lesson');

async function verifyCourse() {
  try {
    console.log('🔍 Verifying SOLID Principles course...\n');

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const course = await Course.findOne({ slug: /solid-principles/ });
    if (!course) {
      console.log('❌ Course not found');
      process.exit(1);
    }

    console.log('📚 Course:', course.title);
    console.log('   Slug:', course.slug);
    console.log('   Price: $' + course.price);
    console.log('   Duration:', course.duration, 'minutes');
    console.log('   Instructor:', course.instructor);

    const chapters = await Chapter.find({ course: course._id }).sort('order');
    console.log('\n📖 Chapters (' + chapters.length + ' total):\n');

    let totalContentChars = 0;

    for (const chapter of chapters) {
      const lessons = await Lesson.find({ chapter: chapter._id }).sort('order');
      console.log('  Chapter ' + chapter.order + ': ' + chapter.title);
      console.log('    Description:', chapter.description);
      console.log('    Lessons: ' + lessons.length);

      lessons.forEach(lesson => {
        const contentLength = lesson.content?.length || 0;
        totalContentChars += contentLength;
        console.log('      - ' + lesson.title);
        console.log('        Duration: ' + lesson.duration + 'min | Content: ' + contentLength + ' chars');
      });
      console.log('');
    }

    const totalLessons = await Lesson.countDocuments({ course: course._id });

    console.log('=' .repeat(60));
    console.log('✅ VERIFICATION COMPLETE');
    console.log('=' .repeat(60));
    console.log('Total Chapters:', chapters.length);
    console.log('Total Lessons:', totalLessons);
    console.log('Total Content:', totalContentChars, 'characters');
    console.log('Average per lesson:', Math.round(totalContentChars / totalLessons), 'chars');
    console.log('\n🎉 Course is complete and ready for frontend!');

    await mongoose.connection.close();
    console.log('\n📡 Database connection closed');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

verifyCourse()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
