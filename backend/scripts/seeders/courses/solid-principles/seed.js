/**
 * SOLID Principles Course Seeder
 *
 * Seeds the course using data from parsedCourseStructure.json
 */

require('dotenv').config({ path: '../../../../.env' });
const mongoose = require('mongoose');
const Course = require('../../../../src/models/Course');
const Chapter = require('../../../../src/models/Chapter');
const Lesson = require('../../../../src/models/Lesson');
const Content = require('../../../../src/models/Content');
const Category = require('../../../../src/models/Category');
const fs = require('fs');
const path = require('path');

// Load course structure from JSON
const courseStructure = require('./parsedCourseStructure.json');

async function seedCourse() {
  try {
    console.log('🔄 Seeding SOLID principles course...');

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // 1. Get Instructor
    // Ideally this should be dynamic or env var, but hardcoded for this specific seeder is fine
    // as per original script logic.
    const users = await mongoose.connection.collection('users').find({ role: 'instructor' }).toArray();
    const instructor = users.find(i => i.email === 'john.doe@lms.com') || users[0];

    if (!instructor) {
      throw new Error('No instructor found. Please run user seeder first.');
    }

     // 2. Get Category
    const category = await Category.findOne({ name: { $regex: 'Development', $options: 'i' } });
    if (!category) {
        throw new Error('Category "Development" not found.');
    }

    // 3. Define Course Metadata
    const courseData = {
        title: 'SOLID Principles & Design Patterns Mastery',
        shortDescription: 'Master SOLID principles and design patterns to write maintainable, scalable, and testable code through real-world examples.',
        description: `Transform your code quality by mastering the SOLID principles - the foundation of clean, maintainable software architecture.

This comprehensive course takes you beyond theory, diving deep into real-world code violations from actual production codebases and teaching you step-by-step refactoring strategies that you can apply immediately.

**What Makes This Course Unique:**
• Real codebase analysis with actual SOLID violations
• Step-by-step refactoring demonstrations
• Practical patterns for React/JavaScript ecosystem
• Before/after code comparisons
• Actionable strategies for legacy code improvement
• Production-grade examples you can use today`,
        category: 'Development',
        subcategory: 'Software Architecture',
        level: 'Intermediate',
        instructor: instructor._id,
        createdBy: instructor._id,
        thumbnail: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800',
        previewVideo: 'https://www.youtube.com/embed/pTB0EiLXUC8',
        images: [
          'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800',
          'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800'
        ],
        price: 129.99,
        originalPrice: 199.99,
        discountPrice: 99.99,
        currency: 'USD',
        estimatedDuration: 10,
        tags: ['solid-principles', 'design-patterns', 'architecture', 'clean-code'],
        prerequisites: ['Basic JavaScript knowledge'],
        learningOutcomes: ['Understand SOLID principles', 'Refactor legacy code'],
        isPublished: true,
        isApproved: true
    };

    // 4. Create or Update Course
    let course = await Course.findOne({ title: courseData.title });
    if (course) {
        console.log(`Found existing course: ${course.title} (${course._id})`);
        // Update metadata
        Object.assign(course, courseData);
        await course.save();
        console.log('✅ Updated course metadata');

        // Cleanup existing content to re-seed
        console.log('🗑️  Cleaning up existing chapters/lessons...');
        const existingChapters = await Chapter.find({ course: course._id });
        for (const ch of existingChapters) {
             const lessons = await Lesson.find({ chapter: ch._id });
             for(const l of lessons) {
                 await Content.deleteMany({ lesson: l._id });
             }
             await Lesson.deleteMany({ chapter: ch._id });
        }
        await Chapter.deleteMany({ course: course._id });
        console.log('✅ Cleanup complete');
    } else {
        course = await Course.create(courseData);
        console.log(`✅ Created new course: ${course.title} (${course._id})`);
    }

    // 5. Seed Chapters and Lessons from JSON
    let globalLessonOrder = 1;
    let totalContentCount = 0;

    for (const chapterData of courseStructure.chapters) {
        console.log(`\nChapter ${chapterData.order}: ${chapterData.title}`);

        const chapter = await Chapter.create({
            course: course._id,
            title: chapterData.title,
            description: chapterData.description,
            order: chapterData.order,
            isPublished: true,
            isActive: true,
            createdBy: instructor._id
        });

        for (const lessonData of chapterData.lessons) {
            const lesson = await Lesson.create({
                course: course._id,
                chapter: chapter._id,
                title: lessonData.title,
                description: lessonData.description,
                estimatedDuration: lessonData.duration, // JSON has 'duration'
                type: lessonData.type,
                order: globalLessonOrder++,
                isPublished: true,
                isPreview: lessonData.duration < 25, // Logic from previous seeder or just usage
                createdBy: instructor._id
            });

            // Create Content
            if (lessonData.content) {
                await Content.create({
                    title: lessonData.title,
                    description: `Main content for ${lessonData.title}`,
                    type: 'text',
                    data: { text: lessonData.content },
                    lesson: lesson._id,
                    order: 1,
                    isPublished: true,
                    isActive: true,
                    createdBy: instructor._id
                });
                totalContentCount++;
            }
            console.log(`  - Lesson ${lesson.order}: ${lesson.title}`);
        }
    }

    console.log('\n==========================================');
    console.log(`🎉 Seeding Complete!`);
    console.log(`Total Chapters: ${courseStructure.chapters.length}`);
    console.log(`Total Lessons: ${globalLessonOrder - 1}`);
    console.log(`Total Content Items: ${totalContentCount}`);
    console.log('==========================================\n');

  } catch (error) {
    console.error('❌ Error seeding course:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

seedCourse();
