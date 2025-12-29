/**
 * Test Script: SOLID Principles Course Structure Validation
 *
 * This script validates the structure of the SOLID Principles course
 * without actually seeding to the database.
 */

const chalk = require('chalk');

// Mock user data
const mockUsers = [
  {
    _id: 'mock-instructor-id',
    name: 'John Doe',
    email: 'john.doe@lms.com',
    role: 'instructor'
  }
];

// Mock Category model
const MockCategory = {
  find: () => ({
    select: async () => [
      { name: 'Development' },
      { name: 'Data Science' },
      { name: 'Design' },
      { name: 'Cybersecurity' }
    ]
  })
};

// Mock Course model
const MockCourse = {
  create: async (courseData) => {
    console.log(chalk.green('\n✅ Course structure validation passed!'));
    return { ...courseData, _id: 'mock-course-id' };
  }
};

// Override require to use mocks
const Module = require('module');
const originalRequire = Module.prototype.require;

Module.prototype.require = function (id) {
  if (id.includes('models/Category')) {
    return MockCategory;
  }
  if (id.includes('models/Course')) {
    return MockCourse;
  }
  return originalRequire.apply(this, arguments);
};

// Load the seeder
const { seedSOLIDPrinciplesCourse } = require('./solidPrinciplesCourseSeederComplete');

// Test function
async function testCourseStructure() {
  console.log(chalk.blue.bold('🧪 Testing SOLID Principles Course Structure\n'));
  console.log(chalk.blue('═'.repeat(50)));

  try {
    // Call the seeder with mock data
    const course = await seedSOLIDPrinciplesCourse(mockUsers);

    console.log(chalk.blue('\n📊 Course Structure Analysis:'));
    console.log(chalk.blue('═'.repeat(50)));

    // Validate course basic info
    console.log(chalk.cyan('\n📝 Basic Information:'));
    console.log(chalk.white(`   Title: ${course.title}`));
    console.log(chalk.white(`   Slug: ${course.slug}`));
    console.log(chalk.white(`   Level: ${course.level}`));
    console.log(chalk.white(`   Category: ${course.category}`));
    console.log(chalk.white(`   Subcategory: ${course.subcategory}`));
    console.log(chalk.white(`   Duration: ${course.estimatedDuration} hours`));
    console.log(chalk.white(`   Price: $${course.price}`));
    console.log(chalk.white(`   Language: ${course.language}`));

    // Validate chapters
    console.log(chalk.cyan('\n📚 Chapter Structure:'));
    console.log(chalk.white(`   Total Chapters: ${course.chapters.length}`));

    course.chapters.forEach((chapter, index) => {
      console.log(chalk.yellow(`\n   Chapter ${index + 1}: ${chapter.title}`));
      console.log(chalk.gray(`      Description: ${chapter.description.substring(0, 60)}...`));
      console.log(chalk.gray(`      Lessons: ${chapter.lessons.length}`));
      console.log(chalk.gray(`      Published: ${chapter.isPublished ? '✅' : '❌'}`));

      chapter.lessons.forEach((lesson, lessonIndex) => {
        const previewTag = lesson.isPreview ? chalk.green(' [PREVIEW]') : '';
        console.log(chalk.gray(`         ${lessonIndex + 1}. ${lesson.title}${previewTag}`));
        console.log(chalk.gray(`            Type: ${lesson.type} | Duration: ${lesson.duration} min`));
        if (lesson.resources && lesson.resources.length > 0) {
          console.log(chalk.gray(`            Resources: ${lesson.resources.length}`));
        }
      });
    });

    // Count totals
    const totalLessons = course.chapters.reduce(
      (total, chapter) => total + chapter.lessons.length,
      0
    );
    const totalDuration = course.chapters.reduce(
      (total, chapter) =>
        total +
        chapter.lessons.reduce((lessonTotal, lesson) => lessonTotal + (lesson.duration || 0), 0),
      0
    );

    console.log(chalk.cyan('\n📊 Statistics:'));
    console.log(chalk.white(`   Total Lessons: ${totalLessons}`));
    console.log(chalk.white(`   Total Duration: ${totalDuration} minutes (~${Math.floor(totalDuration / 60)} hours)`));
    console.log(chalk.white(`   Preview Lessons: ${countPreviewLessons(course)}`));
    console.log(chalk.white(`   Text Lessons: ${countLessonsByType(course, 'text')}`));
    console.log(chalk.white(`   Video Lessons: ${countLessonsByType(course, 'video')}`));
    console.log(chalk.white(`   Total Resources: ${countTotalResources(course)}`));

    // Validate tags
    console.log(chalk.cyan('\n🏷️  Tags:'));
    console.log(chalk.white(`   ${course.tags.join(', ')}`));

    // Validate prerequisites
    console.log(chalk.cyan('\n✅ Prerequisites:'));
    course.prerequisites.forEach((prereq, index) => {
      console.log(chalk.white(`   ${index + 1}. ${prereq}`));
    });

    // Validate learning outcomes
    console.log(chalk.cyan('\n🎯 Learning Outcomes:'));
    course.learningOutcomes.slice(0, 5).forEach((outcome, index) => {
      console.log(chalk.white(`   ${index + 1}. ${outcome}`));
    });
    if (course.learningOutcomes.length > 5) {
      console.log(chalk.gray(`   ... and ${course.learningOutcomes.length - 5} more`));
    }

    // Validate settings
    console.log(chalk.cyan('\n⚙️  Course Settings:'));
    console.log(chalk.white(`   Comments Allowed: ${course.settings.allowComments ? '✅' : '❌'}`));
    console.log(chalk.white(`   Reviews Allowed: ${course.settings.allowReviews ? '✅' : '❌'}`));
    console.log(chalk.white(`   Certificate Enabled: ${course.settings.certificateEnabled ? '✅' : '❌'}`));
    console.log(chalk.white(`   Pass Requirement: ${course.settings.passRequirement}%`));

    // Validate stats
    console.log(chalk.cyan('\n📈 Seeded Statistics:'));
    console.log(chalk.white(`   Total Enrollments: ${course.stats.totalEnrollments}`));
    console.log(chalk.white(`   Total Completions: ${course.stats.totalCompletions}`));
    console.log(chalk.white(`   Average Rating: ${course.stats.averageRating}/5.0`));
    console.log(chalk.white(`   Completion Rate: ${course.stats.completionRate}%`));

    // Validation checks
    console.log(chalk.cyan('\n🔍 Validation Checks:'));
    const validations = [
      { name: 'Title exists', pass: !!course.title },
      { name: 'Slug generated', pass: !!course.slug },
      { name: 'Has chapters', pass: course.chapters.length > 0 },
      { name: 'Has lessons', pass: totalLessons > 0 },
      { name: 'Has preview content', pass: countPreviewLessons(course) > 0 },
      { name: 'Has resources', pass: countTotalResources(course) > 0 },
      { name: 'Has prerequisites', pass: course.prerequisites.length > 0 },
      { name: 'Has learning outcomes', pass: course.learningOutcomes.length > 0 },
      { name: 'Has tags', pass: course.tags.length > 0 },
      { name: 'Price set', pass: course.price > 0 },
      { name: 'Duration set', pass: course.estimatedDuration > 0 },
      { name: 'Published', pass: course.isPublished },
      { name: 'Approved', pass: course.isApproved },
      { name: 'Featured', pass: course.isFeatured }
    ];

    validations.forEach((validation) => {
      const status = validation.pass ? chalk.green('✅') : chalk.red('❌');
      console.log(`   ${status} ${validation.name}`);
    });

    const allPassed = validations.every((v) => v.pass);

    console.log(chalk.blue('\n' + '═'.repeat(50)));

    if (allPassed) {
      console.log(chalk.green.bold('\n✅ ALL VALIDATIONS PASSED!'));
      console.log(chalk.green('The course structure is valid and ready for seeding.\n'));
      return true;
    } else {
      console.log(chalk.red.bold('\n❌ SOME VALIDATIONS FAILED!'));
      console.log(chalk.yellow('Please review the course structure.\n'));
      return false;
    }
  } catch (error) {
    console.error(chalk.red.bold('\n❌ TEST FAILED!'));
    console.error(chalk.red(`Error: ${error.message}`));
    console.error(chalk.gray('\nStack trace:'));
    console.error(chalk.gray(error.stack));
    return false;
  }
}

// Helper functions
function countPreviewLessons(course) {
  return course.chapters.reduce(
    (total, chapter) =>
      total + chapter.lessons.filter((lesson) => lesson.isPreview).length,
    0
  );
}

function countLessonsByType(course, type) {
  return course.chapters.reduce(
    (total, chapter) =>
      total + chapter.lessons.filter((lesson) => lesson.type === type).length,
    0
  );
}

function countTotalResources(course) {
  return course.chapters.reduce(
    (total, chapter) =>
      total +
      chapter.lessons.reduce(
        (lessonTotal, lesson) => lessonTotal + (lesson.resources ? lesson.resources.length : 0),
        0
      ),
    0
  );
}

// Run the test
testCourseStructure()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error(chalk.red('Unexpected error:', error));
    process.exit(1);
  });
