/**
 * Delete Chapters 3-8 and Re-seed with Proper Content
 *
 * This script deletes the improperly seeded chapters 3-8 and recreates them
 * with correct content extraction from the MD file.
 */

require('dotenv').config({ path: '../../../../.env' });
const mongoose = require('mongoose');
const Course = require('../../../../src/models/Course');
const Chapter = require('../../../../src/models/Chapter');
const Lesson = require('../../../../src/models/Lesson');
const fs = require('fs');
const path = require('path');

// Read and parse the MD file
const mdContent = fs.readFileSync(
  path.join(__dirname, 'SOLID_Principles_Session.md'),
  'utf-8'
);

console.log('📖 MD File loaded:', mdContent.length, 'characters\n');

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

async function deleteAndReseedChapters() {
  try {
    console.log('🔄 Deleting and re-seeding chapters 3-8...\\n');

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

    // Delete chapters 3-8 and their lessons
    const chaptersToDelete = await Chapter.find({
      course: course._id,
      order: { $gte: 3 }
    });

    console.log(`📝 Found ${chaptersToDelete.length} chapters to delete (chapters 3-8)\\n`);

    for (const chapter of chaptersToDelete) {
      // Delete all lessons for this chapter
      const deletedLessons = await Lesson.deleteMany({ chapter: chapter._id });
      console.log(`  Deleted ${deletedLessons.deletedCount} lessons from chapter: ${chapter.title}`);

      // Delete the chapter
      await Chapter.deleteOne({ _id: chapter._id });
      console.log(`  Deleted chapter: ${chapter.title}\\n`);
    }

    console.log('✅ Old chapters deleted\\n');

    // Get current lesson count to continue order numbering
    let globalLessonOrder = await Lesson.countDocuments({ course: course._id }) + 1;
    console.log(`Starting lesson order at: ${globalLessonOrder}\\n`);

    // Define the new chapters with extracted content
    const newChapters = [
      {
        order: 3,
        title: 'Single Responsibility Principle (SRP)',
        description: 'Master the Single Responsibility Principle - learn to identify and fix SRP violations through real-world examples',
        lessons: [
          {
            title: 'Understanding SRP - The Foundation',
            type: 'text',
            duration: 20,
            content: extractContent(
              '# S - Single Responsibility Principle',
              '## SRP Violation #1: AdminPanel.js'
            )
          },
          {
            title: 'Real-World SRP Violations',
            type: 'text',
            duration: 30,
            content: extractContent(
              '## SRP Violation #1: AdminPanel.js',
              '## How to Fix SRP Violations'
            )
          },
          {
            title: 'How to Fix SRP Violations',
            type: 'text',
            duration: 35,
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
            type: 'text',
            duration: 20,
            content: extractContent(
              '# O - Open/Closed Principle',
              '## OCP Violation #1: Duplicated Error Handling'
            )
          },
          {
            title: 'OCP Violations in Real Code',
            type: 'text',
            duration: 30,
            content: extractContent(
              '## OCP Violation #1: Duplicated Error Handling',
              '## How to Fix OCP Violations'
            )
          },
          {
            title: 'Fixing OCP Violations with Abstractions',
            type: 'text',
            duration: 35,
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
            type: 'text',
            duration: 20,
            content: extractContent(
              '# L - Liskov Substitution Principle',
              '## LSP Violation #1: Survey Question Types'
            )
          },
          {
            title: 'LSP Violations and Polymorphism',
            type: 'text',
            duration: 30,
            content: extractContent(
              '## LSP Violation #1: Survey Question Types',
              '## How to Fix LSP Violations'
            )
          },
          {
            title: 'Fixing LSP with Proper Polymorphism',
            type: 'text',
            duration: 35,
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
            type: 'text',
            duration: 20,
            content: extractContent(
              '# I - Interface Segregation Principle',
              '## ISP Violation #1: Fat Hook'
            )
          },
          {
            title: 'ISP Violations - Fat Interfaces',
            type: 'text',
            duration: 30,
            content: extractContent(
              '## ISP Violation #1: Fat Hook',
              '## How to Fix ISP Violations'
            )
          },
          {
            title: 'Creating Focused Interfaces',
            type: 'text',
            duration: 35,
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
            type: 'text',
            duration: 20,
            content: extractContent(
              '# D - Dependency Inversion Principle',
              '## DIP Violation #1: Global Logout Function'
            )
          },
          {
            title: 'DIP Violations in Your Codebase',
            type: 'text',
            duration: 30,
            content: extractContent(
              '## DIP Violation #1: Global Logout Function',
              '## How to Fix DIP Violations'
            )
          },
          {
            title: 'Implementing Dependency Injection',
            type: 'text',
            duration: 40,
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
            type: 'text',
            duration: 20,
            content: extractContent(
              '# Summary: SOLID Benefits in Our Codebase',
              '## Action Plan for Our Team'
            )
          },
          {
            title: 'Your Action Plan',
            type: 'text',
            duration: 25,
            content: extractContent(
              '## Action Plan for Our Team',
              '## Key Takeaways'
            )
          },
          {
            title: 'Next Steps and Resources',
            type: 'text',
            duration: 15,
            content: extractContent(
              '## Key Takeaways',
              '# Thank You!'
            )
          }
        ]
      }
    ];

    console.log(`📝 Creating ${newChapters.length} new chapters...\\n`);

    let totalNewLessons = 0;
    let totalContentChars = 0;

    for (const chapterData of newChapters) {
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
        const contentLength = lessonData.content?.length || 0;
        totalContentChars += contentLength;

        await Lesson.create({
          course: course._id,
          chapter: chapter._id,
          title: lessonData.title,
          type: lessonData.type,
          duration: lessonData.duration,
          content: lessonData.content,
          order: globalLessonOrder++,
          isPublished: true,
          isActive: true,
          createdBy: course.instructor
        });

        console.log(`    ✅ ${lessonData.title} (${contentLength} chars)`);
        totalNewLessons++;
      }
      console.log('');
    }

    const finalTotalLessons = await Lesson.countDocuments({ course: course._id });

    console.log('✅ All chapters recreated successfully!\\n');
    console.log('Summary:');
    console.log(`  New Chapters: ${newChapters.length}`);
    console.log(`  New Lessons: ${totalNewLessons}`);
    console.log(`  Total Content: ${totalContentChars} characters`);
    console.log(`  Average per lesson: ${Math.round(totalContentChars / totalNewLessons)} chars`);
    console.log(`  Total Lessons in course: ${finalTotalLessons}`);
    console.log(`\\n🎉 Complete SOLID Principles course is ready with full content!`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\\n📡 Database connection closed');
  }
}

deleteAndReseedChapters()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
