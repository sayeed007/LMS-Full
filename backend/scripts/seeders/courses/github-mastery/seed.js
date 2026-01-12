/**
 * GitHub Mastery Course Seeder
 * 
 * This seeder creates a comprehensive GitHub course with:
 * - 5 chapters with multiple lessons
 * - 1 standalone lesson
 * - All content types: text, block, video, audio, document, quiz, assignment
 * - All block types: text, image, video, audio, document
 * 
 * Total: 5 chapters, 20 lessons, ~6 hours of content
 */

const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '../../../../.env') });

// Import models
const Course = require('../../../../src/models/Course');
const Chapter = require('../../../../src/models/Chapter');
const Lesson = require('../../../../src/models/Lesson');
const LessonContent = require('../../../../src/models/LessonContent');
const User = require('../../../../src/models/User');

// Load course structure
const courseStructure = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'courseStructure.json'), 'utf8')
);

async function seedGitHubCourse() {
  try {
    // 1. Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB');

    // 2. Find or create instructor
    let instructor = await User.findOne({ email: 'instructor@example.com' });
    if (!instructor) {
      instructor = await User.create({
        name: 'GitHub Expert',
        email: 'instructor@example.com',
        password: 'password123',
        role: 'instructor',
        emailVerified: true,
        isActive: true
      });
      console.log('✓ Created instructor user');
    }

    // 3. Create Course
    const courseData = {
      ...courseStructure.course,
      instructor: instructor._id,
      createdBy: instructor._id
    };

    const course = await Course.create(courseData);
    console.log(`✓ Created course: ${course.title}`);

    // 4. Create Chapters and Lessons
    for (const chapterData of courseStructure.chapters) {
      const { lessons: lessonDataArray, ...chapterInfo } = chapterData;

      // Create chapter
      const chapter = await Chapter.create({
        ...chapterInfo,
        course: course._id,
        createdBy: instructor._id,
        isPublished: true,
        isActive: true
      });
      console.log(`  ✓ Created chapter: ${chapter.title}`);

      // Create lessons for this chapter
      for (const lessonData of lessonDataArray) {
        const { content: contentArray, ...lessonInfo } = lessonData;

        // Create lesson
        const lesson = await Lesson.create({
          ...lessonInfo,
          course: course._id,
          chapter: chapter._id,
          createdBy: instructor._id,
          isPublished: true,
          isActive: true,
          isPreview: lessonInfo.order === 1 // First lesson is preview
        });
        console.log(`    ✓ Created lesson: ${lesson.title}`);

        // Create content for this lesson
        if (contentArray && contentArray.length > 0) {
          for (const contentData of contentArray) {
            await LessonContent.create({
              ...contentData,
              lesson: lesson._id,
              createdBy: instructor._id,
              isPublished: true,
              isActive: true
            });
          }
          console.log(`      ✓ Created ${contentArray.length} content item(s)`);
        }
      }
    }

    // 5. Create Standalone Lesson (if exists)
    if (courseStructure.standaloneLesson) {
      const { content: contentArray, ...lessonInfo } = courseStructure.standaloneLesson;

      const standaloneLesson = await Lesson.create({
        ...lessonInfo,
        course: course._id,
        // No chapter - standalone
        createdBy: instructor._id,
        isPublished: true,
        isActive: true,
        isPreview: true
      });
      console.log(`  ✓ Created standalone lesson: ${standaloneLesson.title}`);

      // Create content
      if (contentArray && contentArray.length > 0) {
        for (const contentData of contentArray) {
          await LessonContent.create({
            ...contentData,
            lesson: standaloneLesson._id,
            createdBy: instructor._id,
            isPublished: true,
            isActive: true
          });
        }
        console.log(`    ✓ Created ${contentArray.length} content item(s)`);
      }
    }

    // 6. Summary
    const totalChapters = await Chapter.countDocuments({ course: course._id });
    const totalLessons = await Lesson.countDocuments({ course: course._id });
    const totalContent = await LessonContent.countDocuments({
      lesson: { $in: await Lesson.find({ course: course._id }).distinct('_id') }
    });

    console.log('\n=== GitHub Mastery Course Created Successfully! ===');
    console.log(`Course ID: ${course._id}`);
    console.log(`Total Chapters: ${totalChapters}`);
    console.log(`Total Lessons: ${totalLessons}`);
    console.log(`Total Content Items: ${totalContent}`);
    console.log('\nContent Types Included:');
    console.log('  ✓ Text');
    console.log('  ✓ Block (with text, image, video, audio, document)');
    console.log('  ✓ Video');
    console.log('  ✓ Audio');
    console.log('  ✓ Document');
    console.log('  ✓ Quiz');
    console.log('  ✓ Assignment');
    console.log('\nYou can now test the course in the UI!');

  } catch (error) {
    console.error('Error seeding GitHub course:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('\n✓ Database connection closed');
  }
}

// Run seeder
if (require.main === module) {
  seedGitHubCourse()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = seedGitHubCourse;
