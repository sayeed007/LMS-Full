const Course = require('../../../../src/models/Course');
const Chapter = require('../../../../src/models/Chapter');
const Lesson = require('../../../../src/models/Lesson');
const Content = require('../../../../src/models/Content');
const Quiz = require('../../../../src/models/Quiz');
const Question = require('../../../../src/models/Question');
const courseData = require('./courseStructure.json');

async function seedGitHubMasteryCourse(users, categories) {
  console.log('\\n📚 Seeding GitHub Mastery course...');
  
  try {
    const instructor = users.find(u => u.email === 'john.instructor@lms.com');
    const category = categories.find(c => c.name === 'DevOps');
    
    if (!instructor || !category) {
      throw new Error('Instructor or category not found');
    }

    // Create course
    const course = await Course.create({
      title: courseData.course.title,
      shortDescription: courseData.course.shortDescription,
      description: courseData.course.description,
      category: category.name,
      subcategory: courseData.course.subcategory,
      instructor: instructor._id,
      level: courseData.course.level,
      thumbnail: courseData.course.thumbnail,
      previewVideo: courseData.course.previewVideo,
      images: courseData.course.images,
      price: courseData.course.price,
      originalPrice: courseData.course.originalPrice,
      discountPrice: courseData.course.discountPrice,
      currency: courseData.course.currency,
      estimatedDuration: courseData.course.estimatedDuration,
      tags: courseData.course.tags,
      prerequisites: courseData.course.prerequisites,
      learningOutcomes: courseData.course.learningOutcomes,
      isPublished: courseData.course.isPublished,
      isApproved: courseData.course.isApproved,
      isFeatured: true,
      status: 'published'
    });

    console.log(`  ✅ Created course: ${course.title}`);

    // Create chapters and lessons
    for (const chapterData of courseData.chapters) {
      const chapter = await Chapter.create({
        title: chapterData.title,
        description: chapterData.description,
        course: course._id,
        order: chapterData.order,
        createdBy: instructor._id
      });

      console.log(`    📖 Created chapter: ${chapter.title}`);

      for (const lessonData of chapterData.lessons) {
        const lesson = await Lesson.create({
          title: lessonData.title,
          description: lessonData.description,
          chapter: chapter._id,
          course: course._id,
          type: lessonData.type,
          order: lessonData.order,
          estimatedDuration: lessonData.estimatedDuration,
          createdBy: instructor._id
        });

        // Create content for the lesson
        if (lessonData.content && lessonData.content.length > 0) {
          for (const contentData of lessonData.content) {
            await Content.create({
              lesson: lesson._id,
              course: course._id,
              type: contentData.type,
              title: contentData.title,
              order: contentData.order,
              data: contentData.data,
              createdBy: instructor._id
            });
          }
        }

        console.log(`      📝 Created lesson: ${lesson.title}`);
      }
    }

    console.log(`\\n✅ GitHub Mastery course seeded successfully!`);
    return course;
  } catch (error) {
    console.error('❌ Error seeding GitHub Mastery course:', error.message);
    throw error;
  }
}

module.exports = { seedGitHubMasteryCourse };
