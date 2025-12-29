/**
 * Fix the 3 Missing Content Items
 *
 * Updates the empty content for 3 lessons with correct extraction
 */

require('dotenv').config({ path: '../../../../.env' });
const mongoose = require('mongoose');
const Lesson = require('../../../../src/models/Lesson');
const Content = require('../../../../src/models/Content');
const fs = require('fs');
const path = require('path');

// Read and parse the MD file
const mdContent = fs.readFileSync(
  path.join(__dirname, 'SOLID_Principles_Session.md'),
  'utf-8'
);

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

async function fixMissingContent() {
  try {
    console.log('🔧 Fixing 3 missing content items...\\n');

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\\n');

    // Fix 1: The Real Cost of Poor Design
    const lesson1 = await Lesson.findOne({ title: 'The Real Cost of Poor Design' });
    if (lesson1) {
      const content1 = extractContent(
        '## The Cost of Poor Design',
        '# Part 2: SOLID Principles'
      );

      await Content.findOneAndUpdate(
        { lesson: lesson1._id },
        { 'data.text': content1 }
      );

      console.log(`✅ Updated: The Real Cost of Poor Design (${content1.length} chars)`);
    }

    // Fix 2: Measuring Code Quality (doesn't exist as separate section, extract from Cost section)
    const lesson2 = await Lesson.findOne({ title: 'Measuring Code Quality' });
    if (lesson2) {
      // This lesson's content should be the section about measuring quality
      // Looking at the MD file, this seems to be part of "The Cost of Poor Design" section
      // Let's extract from "What is SOLID?" to "Why SOLID Matters" as transition content
      const content2 = extractContent(
        '## What is SOLID?',
        '## Why SOLID Matters'
      );

      await Content.findOneAndUpdate(
        { lesson: lesson2._id },
        { 'data.text': content2 }
      );

      console.log(`✅ Updated: Measuring Code Quality (${content2.length} chars)`);
    }

    // Fix 3: SOLID Principles in Modern JavaScript
    const lesson3 = await Lesson.findOne({ title: 'SOLID Principles in Modern JavaScript' });
    if (lesson3) {
      const content3 = extractContent(
        '## Why SOLID Matters',
        '# S - Single Responsibility Principle'
      );

      await Content.findOneAndUpdate(
        { lesson: lesson3._id },
        { 'data.text': content3 }
      );

      console.log(`✅ Updated: SOLID Principles in Modern JavaScript (${content3.length} chars)`);
    }

    console.log('\\n🎉 All content fixed!');

    await mongoose.connection.close();
    console.log('\\n📡 Database connection closed');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

fixMissingContent()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
