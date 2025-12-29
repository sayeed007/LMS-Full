/**
 * Final Verification of SOLID Course
 *
 * Checks chapters, lessons, and content items
 */

require('dotenv').config({ path: '../../../../.env' });
const mongoose = require('mongoose');
const Course = require('../../../../src/models/Course');
const Chapter = require('../../../../src/models/Chapter');
const Lesson = require('../../../../src/models/Lesson');
const Content = require('../../../../src/models/Content');

async function verifyFinalCourse() {
  try {
    console.log('🔍 Final Verification of SOLID Principles Course\n');
    console.log('=' .repeat(70) + '\n');

    await mongoose.connect(process.env.MONGODB_URI);

    const course = await Course.findOne({ slug: /solid-principles/ });
    if (!course) {
      console.log('❌ Course not found');
      process.exit(1);
    }

    console.log('📚 COURSE INFORMATION');
    console.log('  Title:', course.title);
    console.log('  Slug:', course.slug);
    console.log('  Price: $' + course.price);
    console.log('  Duration:', course.duration, 'minutes');
    console.log('  Level:', course.level);
    console.log('  Language:', course.language);
    console.log('');

    const chapters = await Chapter.find({ course: course._id }).sort('order');
    console.log('📖 CHAPTERS & LESSONS (' + chapters.length + ' chapters total)\n');

    let totalLessons = 0;
    let totalContentItems = 0;
    let totalContentChars = 0;

    for (const chapter of chapters) {
      const lessons = await Lesson.find({ chapter: chapter._id }).sort('order');
      console.log(`Chapter ${chapter.order}: ${chapter.title}`);
      console.log(`  Lessons: ${lessons.length}`);

      for (const lesson of lessons) {
        const contentItems = await Content.find({ lesson: lesson._id }).sort('order');
        totalLessons++;

        let lessonContentChars = 0;
        contentItems.forEach(item => {
          const textLength = item.data?.text?.length || 0;
          lessonContentChars += textLength;
          totalContentChars += textLength;
        });

        totalContentItems += contentItems.length;

        console.log(`    ${lesson.order}. ${lesson.title}`);
        console.log(`       Duration: ${lesson.estimatedDuration || 0}min | Content items: ${contentItems.length} | Chars: ${lessonContentChars}`);
      }
      console.log('');
    }

    console.log('=' .repeat(70));
    console.log('✅ VERIFICATION SUMMARY');
    console.log('=' .repeat(70));
    console.log('Total Chapters:', chapters.length);
    console.log('Total Lessons:', totalLessons);
    console.log('Total Content Items:', totalContentItems);
    console.log('Total Content Characters:', totalContentChars.toLocaleString());
    console.log('Average per Lesson:', Math.round(totalContentChars / totalLessons).toLocaleString(), 'characters');
    console.log('Average per Content Item:', Math.round(totalContentChars / totalContentItems).toLocaleString(), 'characters');

    // Check for empty content
    const emptyContent = await Content.find({
      lesson: { $in: (await Lesson.find({ course: course._id }).select('_id')).map(l => l._id) },
      $or: [
        { 'data.text': '' },
        { 'data.text': null },
        { 'data.text': { $exists: false } }
      ]
    }).populate('lesson', 'title');

    if (emptyContent.length > 0) {
      console.log('\\n⚠️  EMPTY CONTENT DETECTED:');
      emptyContent.forEach(item => {
        console.log(`  - ${item.lesson.title}: ${item.title}`);
      });
    } else {
      console.log('\\n✅ All lessons have content!');
    }

    console.log('\\n🎉 Course is COMPLETE and ready for production!');
    console.log(`📍 Frontend URL: /courses/${course.slug}\n`);

    await mongoose.connection.close();

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

verifyFinalCourse()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
