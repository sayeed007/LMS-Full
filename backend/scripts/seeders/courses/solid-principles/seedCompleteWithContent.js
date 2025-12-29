/**
 * Complete SOLID Course Seeder with Content Model
 *
 * Creates all 8 chapters with lessons and proper Content documents
 */

require('dotenv').config({ path: '../../../../.env' });
const mongoose = require('mongoose');
const Course = require('../../../../src/models/Course');
const Chapter = require('../../../../src/models/Chapter');
const Lesson = require('../../../../src/models/Lesson');
const Content = require('../../../../src/models/Content');
const fs = require('fs');
const path = require('path');

// Read and parse the MD file
const mdContent = fs.readFileSync(
  path.join(__dirname, 'SOLID_Principles_Session.md'),
  'utf-8'
);

console.log('📖 MD File loaded:', mdContent.length, 'characters\\n');

// Helper function to extract content between two markers
function extractContent(startMarker, endMarker) {
  const startIndex = mdContent.indexOf(startMarker);
  if (startIndex === -1) {
    console.warn(`⚠️  Start marker not found: "${startMarker}"`);
    return '';
  }

  const searchFrom = startIndex + startMarker.length;
  const endIndex = mdContent.indexOf(endMarker, searchFrom);

  if (endIndex === -1) {
    return mdContent.substring(startIndex).trim();
  }

  return mdContent.substring(startIndex, endIndex).trim();
}

async function seedCompleteWithContent() {
  try {
    console.log('🔄 Seeding complete SOLID course with Content model...\\n');

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\\n');

    // Find the SOLID course
    const course = await Course.findOne({ slug: /solid-principles/ });
    if (!course) {
      console.log('❌ SOLID course not found!');
      process.exit(1);
    }

    console.log(`Found course: ${course.title}`);
    console.log(`Course ID: ${course._id}\\n`);

    // Delete all existing chapters, lessons, and content for this course
    console.log('🗑️  Cleaning up existing data...');
    const existingChapters = await Chapter.find({ course: course._id });
    for (const chapter of existingChapters) {
      const lessons = await Lesson.find({ chapter: chapter._id });
      for (const lesson of lessons) {
        await Content.deleteMany({ lesson: lesson._id });
      }
      await Lesson.deleteMany({ chapter: chapter._id });
      await Chapter.deleteOne({ _id: chapter._id });
    }
    console.log('✅ Cleanup complete\\n');

    let globalLessonOrder = 1;
    let totalContent = 0;

    // Define all 8 chapters with their lessons
    const chapters = [
      {
        order: 1,
        title: 'Introduction to Design Patterns',
        description: 'Understand what design patterns are, why they matter in professional development, and the real, measurable cost of poor design in modern applications.',
        lessons: [
          {
            title: 'What are Design Patterns and Why Do We Need Them?',
            estimatedDuration: 15,
            content: extractContent(
              '# Part 1: What and Why Design Patterns',
              '## The Real Cost'
            )
          },
          {
            title: 'The Real Cost of Poor Design',
            estimatedDuration: 20,
            content: extractContent(
              '## The Real Cost',
              '## How Do We Measure Code Quality'
            )
          },
          {
            title: 'Measuring Code Quality',
            estimatedDuration: 15,
            content: extractContent(
              '## How Do We Measure Code Quality',
              '# Part 2: SOLID Principles'
            )
          }
        ]
      },
      {
        order: 2,
        title: 'SOLID Principles Overview',
        description: 'Get a comprehensive introduction to all five SOLID principles and understand why they form the foundation of professional software development.',
        lessons: [
          {
            title: 'Introduction to SOLID Principles',
            estimatedDuration: 20,
            content: extractContent(
              '# Part 2: SOLID Principles',
              '## SOLID in JavaScript'
            )
          },
          {
            title: 'SOLID Principles in Modern JavaScript',
            estimatedDuration: 25,
            content: extractContent(
              '## SOLID in JavaScript',
              '# S - Single Responsibility Principle'
            )
          }
        ]
      },
      {
        order: 3,
        title: 'Single Responsibility Principle (SRP)',
        description: 'Master the Single Responsibility Principle - learn to identify and fix SRP violations through real-world examples',
        lessons: [
          {
            title: 'Understanding SRP - The Foundation',
            estimatedDuration: 20,
            content: extractContent(
              '# S - Single Responsibility Principle',
              '## SRP Violation #1: AdminPanel.js'
            )
          },
          {
            title: 'Real-World SRP Violations',
            estimatedDuration: 30,
            content: extractContent(
              '## SRP Violation #1: AdminPanel.js',
              '## How to Fix SRP Violations'
            )
          },
          {
            title: 'How to Fix SRP Violations',
            estimatedDuration: 35,
            content: extractContent(
              '## How to Fix SRP Violations',
              '# O - Open/Closed Principle'
            )
          }
        ]
      },
      {
        order: 4,
        title: 'Open/Closed Principle (OCP)',
        description: 'Learn to write code that is open for extension but closed for modification',
        lessons: [
          {
            title: 'Understanding OCP',
            estimatedDuration: 20,
            content: extractContent(
              '# O - Open/Closed Principle',
              '## OCP Violation #1: Duplicated Error Handling'
            )
          },
          {
            title: 'OCP Violations in Real Code',
            estimatedDuration: 30,
            content: extractContent(
              '## OCP Violation #1: Duplicated Error Handling',
              '## How to Fix OCP Violations'
            )
          },
          {
            title: 'Fixing OCP Violations with Abstractions',
            estimatedDuration: 35,
            content: extractContent(
              '## How to Fix OCP Violations',
              '# L - Liskov Substitution Principle'
            )
          }
        ]
      },
      {
        order: 5,
        title: 'Liskov Substitution Principle (LSP)',
        description: 'Understand type substitutability and create proper polymorphic hierarchies',
        lessons: [
          {
            title: 'Understanding LSP',
            estimatedDuration: 20,
            content: extractContent(
              '# L - Liskov Substitution Principle',
              '## LSP Violation #1: Survey Question Types'
            )
          },
          {
            title: 'LSP Violations and Polymorphism',
            estimatedDuration: 30,
            content: extractContent(
              '## LSP Violation #1: Survey Question Types',
              '## How to Fix LSP Violations'
            )
          },
          {
            title: 'Fixing LSP with Proper Polymorphism',
            estimatedDuration: 35,
            content: extractContent(
              '## How to Fix LSP Violations',
              '# I - Interface Segregation Principle'
            )
          }
        ]
      },
      {
        order: 6,
        title: 'Interface Segregation Principle (ISP)',
        description: 'Create focused, minimal interfaces that clients actually need',
        lessons: [
          {
            title: 'Understanding ISP',
            estimatedDuration: 20,
            content: extractContent(
              '# I - Interface Segregation Principle',
              '## ISP Violation #1: Fat Hook'
            )
          },
          {
            title: 'ISP Violations - Fat Interfaces',
            estimatedDuration: 30,
            content: extractContent(
              '## ISP Violation #1: Fat Hook',
              '## How to Fix ISP Violations'
            )
          },
          {
            title: 'Creating Focused Interfaces',
            estimatedDuration: 35,
            content: extractContent(
              '## How to Fix ISP Violations',
              '# D - Dependency Inversion Principle'
            )
          }
        ]
      },
      {
        order: 7,
        title: 'Dependency Inversion Principle (DIP)',
        description: 'Build flexible architectures by depending on abstractions, not concrete implementations',
        lessons: [
          {
            title: 'Understanding DIP',
            estimatedDuration: 20,
            content: extractContent(
              '# D - Dependency Inversion Principle',
              '## DIP Violation #1: Global Logout Function'
            )
          },
          {
            title: 'DIP Violations in Your Codebase',
            estimatedDuration: 30,
            content: extractContent(
              '## DIP Violation #1: Global Logout Function',
              '## How to Fix DIP Violations'
            )
          },
          {
            title: 'Implementing Dependency Injection',
            estimatedDuration: 40,
            content: extractContent(
              '## How to Fix DIP Violations',
              '# Summary: SOLID Benefits in Our Codebase'
            )
          }
        ]
      },
      {
        order: 8,
        title: 'Putting It All Together',
        description: 'Apply SOLID principles to transform your codebase with a practical action plan',
        lessons: [
          {
            title: 'SOLID Benefits Summary',
            estimatedDuration: 20,
            content: extractContent(
              '# Summary: SOLID Benefits in Our Codebase',
              '## Action Plan for Our Team'
            )
          },
          {
            title: 'Your Action Plan',
            estimatedDuration: 25,
            content: extractContent(
              '## Action Plan for Our Team',
              '## Key Takeaways'
            )
          },
          {
            title: 'Next Steps and Resources',
            estimatedDuration: 15,
            content: extractContent(
              '## Key Takeaways',
              '# Thank You!'
            )
          }
        ]
      }
    ];

    console.log(`📝 Creating ${chapters.length} chapters...\\n`);

    let totalLessons = 0;
    let totalContentChars = 0;

    for (const chapterData of chapters) {
      console.log(`Chapter ${chapterData.order}: ${chapterData.title}`);

      // Create chapter
      const chapter = await Chapter.create({
        course: course._id,
        title: chapterData.title,
        description: chapterData.description,
        order: chapterData.order,
        isPublished: true,
        isActive: true,
        createdBy: course.instructor
      });

      console.log(`  ✅ Created chapter: ${chapter._id}`);
      console.log(`  Creating ${chapterData.lessons.length} lessons...`);

      // Create lessons
      for (const lessonData of chapterData.lessons) {
        // Create lesson
        const lesson = await Lesson.create({
          course: course._id,
          chapter: chapter._id,
          title: lessonData.title,
          estimatedDuration: lessonData.estimatedDuration,
          order: globalLessonOrder++,
          isPublished: true,
          createdBy: course.instructor
        });

        // Create content for the lesson
        const contentText = lessonData.content || '';
        totalContentChars += contentText.length;

        await Content.create({
          title: lessonData.title,
          description: `Main content for ${lessonData.title}`,
          type: 'text',
          data: {
            text: contentText
          },
          lesson: lesson._id,
          order: 1,
          isPublished: true,
          isActive: true,
          createdBy: course.instructor
        });

        console.log(`    ✅ ${lessonData.title} (${lessonData.estimatedDuration}min, ${contentText.length} chars)`);
        totalLessons++;
        totalContent++;
      }
      console.log('');
    }

    console.log('=' .repeat(60));
    console.log('✅ SEEDING COMPLETE!');
    console.log('=' .repeat(60));
    console.log(`Chapters created: ${chapters.length}`);
    console.log(`Lessons created: ${totalLessons}`);
    console.log(`Content items created: ${totalContent}`);
    console.log(`Total content: ${totalContentChars} characters`);
    console.log(`Average per lesson: ${Math.round(totalContentChars / totalLessons)} chars`);
    console.log(`\\n🎉 Complete SOLID Principles course is ready!`);
    console.log(`📍 Course URL: /courses/${course.slug}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\\n📡 Database connection closed');
  }
}

seedCompleteWithContent()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
