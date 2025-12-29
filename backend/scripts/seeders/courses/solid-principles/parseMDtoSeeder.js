/**
 * MD to Seeder Parser
 *
 * Parses SOLID_Principles_Session.md and generates a complete course seeder
 */

const fs = require('fs');
const path = require('path');

// Read the MD file
const mdContent = fs.readFileSync(
  path.join(__dirname, 'SOLID_Principles_Session.md'),
  'utf-8'
);

const lines = mdContent.split('\n');

// Parse structure
const chapters = [];
let currentChapter = null;
let currentLesson = null;
let lessonContent = [];
let chapterOrder = 0;
let lessonOrder = 0;

// Main section markers (# headings)
const mainSections = {
  'Part 1: What and Why Design Patterns': 1,
  'Part 2: SOLID Principles': 2,
  'S - Single Responsibility Principle': 3,
  'O - Open/Closed Principle': 4,
  'L - Liskov Substitution Principle': 5,
  'I - Interface Segregation Principle': 6,
  'D - Dependency Inversion Principle': 7,
  'Summary: SOLID Benefits in Our Codebase': 8
};

// Chapter titles mapping
const chapterTitles = {
  1: 'Introduction to Design Patterns',
  2: 'SOLID Principles Overview',
  3: 'Single Responsibility Principle (SRP)',
  4: 'Open/Closed Principle (OCP)',
  5: 'Liskov Substitution Principle (LSP)',
  6: 'Interface Segregation Principle (ISP)',
  7: 'Dependency Inversion Principle (DIP)',
  8: 'Putting It All Together - Summary & Action Plan'
};

const chapterDescriptions = {
  1: 'Understand what design patterns are, why they matter, and the cost of poor design',
  2: 'Learn the five SOLID principles and their importance in software development',
  3: 'Master the Single Responsibility Principle through real-world violations and solutions',
  4: 'Learn to write extensible code with the Open/Closed Principle',
  5: 'Understand type substitutability and polymorphism with Liskov Substitution Principle',
  6: 'Create focused interfaces with the Interface Segregation Principle',
  7: 'Build flexible architectures with Dependency Inversion Principle',
  8: 'Apply SOLID principles to improve your codebase with actionable strategies'
};

function saveChapter() {
  if (currentChapter && currentChapter.lessons.length > 0) {
    chapters.push(currentChapter);
  }
}

function saveLesson() {
  if (currentLesson && lessonContent.length > 0) {
    currentLesson.content = lessonContent.join('\n').trim();
    currentChapter.lessons.push(currentLesson);
    lessonContent = [];
  }
}

// Parse the file
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  // Main section (# heading) - starts new chapter
  if (line.startsWith('# ') && !line.includes('marp')) {
    const sectionTitle = line.substring(2).trim();

    if (mainSections[sectionTitle]) {
      // Save previous lesson and chapter
      saveLesson();
      saveChapter();

      chapterOrder = mainSections[sectionTitle];
      lessonOrder = 0;

      currentChapter = {
        title: chapterTitles[chapterOrder],
        description: chapterDescriptions[chapterOrder],
        order: chapterOrder,
        isPublished: true,
        lessons: []
      };
    }
    continue;
  }

  // Sub-section (## heading) - starts new lesson
  if (line.startsWith('## ') && currentChapter) {
    // Save previous lesson
    saveLesson();

    lessonOrder++;
    const lessonTitle = line.substring(3).trim();

    // Determine lesson type and duration
    let type = 'text';
    let duration = 15;

    if (lessonTitle.toLowerCase().includes('video') ||
        lessonTitle.toLowerCase().includes('practical') ||
        lessonTitle.toLowerCase().includes('demo')) {
      type = 'video';
      duration = 20;
    }

    // Longer duration for comprehensive lessons
    if (lessonTitle.toLowerCase().includes('how to fix') ||
        lessonTitle.toLowerCase().includes('comprehensive') ||
        lessonTitle.toLowerCase().includes('complete')) {
      duration = 30;
    }

    currentLesson = {
      title: lessonTitle,
      description: `Learn about ${lessonTitle}`,
      type,
      order: lessonOrder,
      duration,
      isPublished: true,
      resources: []
    };

    lessonContent = [];
    continue;
  }

  // Collect content for current lesson
  if (currentLesson && !line.startsWith('---')) {
    lessonContent.push(line);
  }
}

// Save last lesson and chapter
saveLesson();
saveChapter();

// Generate stats
console.log('Parsed Structure:');
console.log('================');
chapters.forEach(ch => {
  console.log(`\nChapter ${ch.order}: ${ch.title}`);
  console.log(`  Lessons: ${ch.lessons.length}`);
  ch.lessons.forEach(lesson => {
    console.log(`    ${lesson.order}. ${lesson.title} (${lesson.type}, ${lesson.duration}min)`);
  });
});

console.log(`\n\nTotal Chapters: ${chapters.length}`);
console.log(`Total Lessons: ${chapters.reduce((sum, ch) => sum + ch.lessons.length, 0)}`);

// Export as JSON for use in seeder
const output = {
  chapters,
  stats: {
    totalChapters: chapters.length,
    totalLessons: chapters.reduce((sum, ch) => sum + ch.lessons.length, 0)
  }
};

fs.writeFileSync(
  path.join(__dirname, 'parsedCourseStructure.json'),
  JSON.stringify(output, null, 2)
);

console.log('\n✅ Saved to parsedCourseStructure.json');
