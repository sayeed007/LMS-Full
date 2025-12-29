/**
 * Migration: Convert SOLID Course Embedded Chapters/Lessons to Standalone Models
 *
 * The frontend expects chapters and lessons as separate documents,
 * but the SOLID course was created with embedded chapters/lessons.
 * This script converts them to standalone records.
 */

require('dotenv').config({ path: '../../.env' });
const mongoose = require('mongoose');
const Course = require('../../src/models/Course');
const Chapter = require('../../src/models/Chapter');
const Lesson = require('../../src/models/Lesson');

const migrateSOLIDCourse = async () => {
  try {
    console.log('🔄 Starting migration: SOLID Course to Standalone Models\n');

    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find the SOLID course
    const course = await Course.findOne({ slug: /solid-principles/ });

    if (!course) {
      console.log('❌ SOLID Principles course not found!');
      process.exit(1);
    }

    console.log(`Found course: ${course.title}`);
    console.log(`Course ID: ${course._id}`);
    console.log(`Embedded Chapters: ${course.chapters?.length || 0}\n`);

    if (!course.chapters || course.chapters.length === 0) {
      console.log('⚠️  No embedded chapters found. Nothing to migrate.');
      process.exit(0);
    }

    // Check if already migrated
    const existingChapters = await Chapter.find({ course: course._id });
    if (existingChapters.length > 0) {
      console.log(`⚠️  Found ${existingChapters.length} existing standalone chapters.`);
      console.log('This course may have already been migrated.');
      console.log('Delete existing chapters first if you want to re-migrate.\n');
      process.exit(0);
    }

    console.log('📝 Creating standalone chapters and lessons...\n');

    let totalLessons = 0;
    let globalLessonOrder = 1; // Track lesson order across entire course

    // Migrate each chapter
    for (const embeddedChapter of course.chapters) {
      console.log(`Chapter ${embeddedChapter.order}: ${embeddedChapter.title}`);

      // Create standalone chapter
      const chapter = await Chapter.create({
        course: course._id,
        title: embeddedChapter.title,
        description: embeddedChapter.description,
        order: embeddedChapter.order,
        isPublished: embeddedChapter.isPublished !== false, // default true
        isActive: true,
        createdBy: course.instructor,
        createdAt: embeddedChapter.createdAt || new Date(),
        updatedAt: embeddedChapter.updatedAt || new Date()
      });

      console.log(`  ✅ Created chapter: ${chapter._id}`);
      console.log(`  Lessons to migrate: ${embeddedChapter.lessons?.length || 0}`);

      // Migrate lessons for this chapter
      if (embeddedChapter.lessons && embeddedChapter.lessons.length > 0) {
        for (const embeddedLesson of embeddedChapter.lessons) {
          const lesson = await Lesson.create({
            course: course._id,
            chapter: chapter._id,
            title: embeddedLesson.title,
            description: embeddedLesson.description,
            content: embeddedLesson.content,
            type: embeddedLesson.type || 'text',
            order: globalLessonOrder++, // Use global order, not chapter-specific
            duration: embeddedLesson.duration,

            // Video fields
            videoUrl: embeddedLesson.videoUrl,
            videoProvider: embeddedLesson.videoProvider,
            videoDuration: embeddedLesson.videoDuration,
            videoThumbnail: embeddedLesson.videoThumbnail,

            // Resources
            resources: embeddedLesson.resources || [],

            // Access control
            isPreview: embeddedLesson.isPreview || false,
            isPublished: embeddedLesson.isPublished !== false, // default true
            isPremium: embeddedLesson.isPremium || false,

            // Settings
            allowComments: embeddedLesson.allowComments !== false,
            downloadable: embeddedLesson.downloadable || false,

            // Metadata
            tags: embeddedLesson.tags || [],
            language: embeddedLesson.language || course.language || 'English',
            thumbnail: embeddedLesson.thumbnail,

            // Tracking
            isActive: true,
            isDeleted: false,
            createdBy: course.instructor,
            createdAt: embeddedLesson.createdAt || new Date(),
            updatedAt: embeddedLesson.updatedAt || new Date()
          });

          console.log(`    ✅ Created lesson: ${lesson.title}`);
          totalLessons++;
        }
      }
      console.log('');
    }

    console.log('✅ Migration completed successfully!\n');
    console.log('Summary:');
    console.log(`  Chapters created: ${course.chapters.length}`);
    console.log(`  Lessons created: ${totalLessons}`);
    console.log(`  Course: ${course.title}`);
    console.log(`  Course ID: ${course._id}\n`);

    console.log('🎉 The course is now ready to view in the frontend!');
    console.log(`📍 Course URL: /courses/${course.slug}\n`);

  } catch (error) {
    console.error('❌ Migration failed:');
    console.error(error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('📡 Database connection closed');
  }
};

// Run migration
migrateSOLIDCourse()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
