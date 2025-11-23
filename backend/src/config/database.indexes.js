/**
 * Database Index Configuration
 *
 * Centralized index management for all MongoDB collections.
 * Indexes improve query performance and ensure data integrity.
 *
 * Usage:
 *   const { createAllIndexes } = require('./config/database.indexes');
 *   await createAllIndexes();
 */

const mongoose = require('mongoose');

/**
 * User Collection Indexes
 */
const userIndexes = [
  // Unique indexes
  { fields: { email: 1 }, options: { unique: true, background: true } },

  // Search and filter indexes
  { fields: { role: 1 }, options: { background: true } },
  { fields: { organization: 1 }, options: { background: true } },
  { fields: { subscription: 1 }, options: { background: true } },
  { fields: { isActive: 1 }, options: { background: true } },
  { fields: { isVerified: 1 }, options: { background: true } },

  // Compound indexes for common queries
  { fields: { organization: 1, role: 1 }, options: { background: true } },
  { fields: { isActive: 1, role: 1 }, options: { background: true } },

  // Text search index
  { fields: { name: 'text', email: 'text' }, options: { background: true } },

  // Date-based queries
  { fields: { createdAt: -1 }, options: { background: true } },
  { fields: { lastLogin: -1 }, options: { background: true } },
];

/**
 * Course Collection Indexes
 */
const courseIndexes = [
  // Search and filter indexes
  { fields: { instructor: 1 }, options: { background: true } },
  { fields: { category: 1 }, options: { background: true } },
  { fields: { status: 1 }, options: { background: true } },
  { fields: { isPublished: 1 }, options: { background: true } },
  { fields: { isFeatured: 1 }, options: { background: true } },
  { fields: { organization: 1 }, options: { background: true } },

  // Compound indexes for common queries
  { fields: { isPublished: 1, status: 1 }, options: { background: true } },
  { fields: { instructor: 1, isPublished: 1 }, options: { background: true } },
  { fields: { category: 1, isPublished: 1 }, options: { background: true } },
  { fields: { organization: 1, isPublished: 1 }, options: { background: true } },
  { fields: { isFeatured: 1, isPublished: 1 }, options: { background: true } },

  // Sorting indexes
  { fields: { enrollmentCount: -1 }, options: { background: true } },
  { fields: { rating: -1 }, options: { background: true } },
  { fields: { price: 1 }, options: { background: true } },
  { fields: { createdAt: -1 }, options: { background: true } },
  { fields: { updatedAt: -1 }, options: { background: true } },

  // Text search index
  { fields: { title: 'text', description: 'text', tags: 'text' }, options: { background: true } },

  // Geospatial index (if location-based courses)
  // { fields: { location: '2dsphere' }, options: { background: true } },
];

/**
 * Enrollment Collection Indexes
 */
const enrollmentIndexes = [
  // Unique compound index (prevent duplicate enrollments)
  { fields: { student: 1, course: 1 }, options: { unique: true, background: true } },

  // Query indexes
  { fields: { student: 1 }, options: { background: true } },
  { fields: { course: 1 }, options: { background: true } },
  { fields: { status: 1 }, options: { background: true } },
  { fields: { progress: 1 }, options: { background: true } },
  { fields: { completedAt: 1 }, options: { background: true } },

  // Compound indexes
  { fields: { student: 1, status: 1 }, options: { background: true } },
  { fields: { course: 1, status: 1 }, options: { background: true } },
  { fields: { student: 1, completedAt: -1 }, options: { background: true } },

  // Date sorting
  { fields: { enrolledAt: -1 }, options: { background: true } },
  { fields: { lastAccessedAt: -1 }, options: { background: true } },
];

/**
 * Chapter Collection Indexes
 */
const chapterIndexes = [
  // Query indexes
  { fields: { course: 1 }, options: { background: true } },
  { fields: { order: 1 }, options: { background: true } },

  // Compound index for ordered retrieval
  { fields: { course: 1, order: 1 }, options: { background: true } },

  // Text search
  { fields: { title: 'text', description: 'text' }, options: { background: true } },
];

/**
 * Lesson Collection Indexes
 */
const lessonIndexes = [
  // Query indexes
  { fields: { course: 1 }, options: { background: true } },
  { fields: { chapter: 1 }, options: { background: true } },
  { fields: { order: 1 }, options: { background: true } },
  { fields: { type: 1 }, options: { background: true } },
  { fields: { isFree: 1 }, options: { background: true } },

  // Compound indexes
  { fields: { course: 1, order: 1 }, options: { background: true } },
  { fields: { chapter: 1, order: 1 }, options: { background: true } },
  { fields: { course: 1, type: 1 }, options: { background: true } },

  // Text search
  { fields: { title: 'text', description: 'text' }, options: { background: true } },
];

/**
 * Quiz Collection Indexes
 */
const quizIndexes = [
  // Query indexes
  { fields: { course: 1 }, options: { background: true } },
  { fields: { lesson: 1 }, options: { background: true } },
  { fields: { createdBy: 1 }, options: { background: true } },
  { fields: { isPublished: 1 }, options: { background: true } },

  // Compound indexes
  { fields: { course: 1, isPublished: 1 }, options: { background: true } },
  { fields: { lesson: 1, isPublished: 1 }, options: { background: true } },

  // Text search
  { fields: { title: 'text', description: 'text' }, options: { background: true } },
];

/**
 * Question Collection Indexes
 */
const questionIndexes = [
  // Query indexes
  { fields: { quiz: 1 }, options: { background: true } },
  { fields: { questionBank: 1 }, options: { background: true } },
  { fields: { type: 1 }, options: { background: true } },
  { fields: { difficulty: 1 }, options: { background: true } },
  { fields: { tags: 1 }, options: { background: true } },

  // Compound indexes
  { fields: { quiz: 1, order: 1 }, options: { background: true } },
  { fields: { questionBank: 1, type: 1 }, options: { background: true } },
  { fields: { questionBank: 1, difficulty: 1 }, options: { background: true } },

  // Text search
  { fields: { question: 'text', tags: 'text' }, options: { background: true } },
];

/**
 * Assignment Collection Indexes
 */
const assignmentIndexes = [
  // Query indexes
  { fields: { course: 1 }, options: { background: true } },
  { fields: { lesson: 1 }, options: { background: true } },
  { fields: { createdBy: 1 }, options: { background: true } },
  { fields: { dueDate: 1 }, options: { background: true } },

  // Compound indexes
  { fields: { course: 1, dueDate: 1 }, options: { background: true } },

  // Text search
  { fields: { title: 'text', description: 'text' }, options: { background: true } },
];

/**
 * Article Collection Indexes
 */
const articleIndexes = [
  // Query indexes
  { fields: { author: 1 }, options: { background: true } },
  { fields: { category: 1 }, options: { background: true } },
  { fields: { status: 1 }, options: { background: true } },
  { fields: { visibility: 1 }, options: { background: true } },
  { fields: { isFeatured: 1 }, options: { background: true } },
  { fields: { tags: 1 }, options: { background: true } },
  { fields: { organization: 1 }, options: { background: true } },

  // Compound indexes
  { fields: { status: 1, visibility: 1 }, options: { background: true } },
  { fields: { author: 1, status: 1 }, options: { background: true } },
  { fields: { category: 1, status: 1 }, options: { background: true } },
  { fields: { isFeatured: 1, status: 1 }, options: { background: true } },

  // Sorting indexes
  { fields: { views: -1 }, options: { background: true } },
  { fields: { likes: -1 }, options: { background: true } },
  { fields: { createdAt: -1 }, options: { background: true } },
  { fields: { publishedAt: -1 }, options: { background: true } },

  // Text search
  { fields: { title: 'text', content: 'text', tags: 'text' }, options: { background: true } },
];

/**
 * Certificate Collection Indexes
 */
const certificateIndexes = [
  // Unique index for certificate number
  { fields: { certificateNumber: 1 }, options: { unique: true, background: true } },

  // Query indexes
  { fields: { student: 1 }, options: { background: true } },
  { fields: { course: 1 }, options: { background: true } },
  { fields: { issuedAt: -1 }, options: { background: true } },

  // Compound indexes
  { fields: { student: 1, course: 1 }, options: { unique: true, background: true } },
  { fields: { student: 1, issuedAt: -1 }, options: { background: true } },
];

/**
 * Category Collection Indexes
 */
const categoryIndexes = [
  // Unique index
  { fields: { name: 1 }, options: { unique: true, background: true } },
  { fields: { slug: 1 }, options: { unique: true, background: true } },

  // Query indexes
  { fields: { parent: 1 }, options: { background: true } },
  { fields: { isActive: 1 }, options: { background: true } },
  { fields: { order: 1 }, options: { background: true } },

  // Text search
  { fields: { name: 'text', description: 'text' }, options: { background: true } },
];

/**
 * Organization Collection Indexes
 */
const organizationIndexes = [
  // Unique indexes
  { fields: { name: 1 }, options: { unique: true, background: true } },
  { fields: { domain: 1 }, options: { unique: true, sparse: true, background: true } },

  // Query indexes
  { fields: { owner: 1 }, options: { background: true } },
  { fields: { isActive: 1 }, options: { background: true } },
  { fields: { subscriptionPlan: 1 }, options: { background: true } },

  // Date indexes
  { fields: { createdAt: -1 }, options: { background: true } },
];

/**
 * Conversation Collection Indexes
 */
const conversationIndexes = [
  // Query indexes
  { fields: { participants: 1 }, options: { background: true } },
  { fields: { 'lastMessage.sentAt': -1 }, options: { background: true } },

  // Compound indexes
  { fields: { participants: 1, 'lastMessage.sentAt': -1 }, options: { background: true } },
];

/**
 * Message Collection Indexes
 */
const messageIndexes = [
  // Query indexes
  { fields: { conversation: 1 }, options: { background: true } },
  { fields: { sender: 1 }, options: { background: true } },
  { fields: { sentAt: -1 }, options: { background: true } },
  { fields: { isRead: 1 }, options: { background: true } },

  // Compound indexes
  { fields: { conversation: 1, sentAt: -1 }, options: { background: true } },
  { fields: { conversation: 1, isRead: 1 }, options: { background: true } },

  // Text search
  { fields: { content: 'text' }, options: { background: true } },
];

/**
 * QuestionBank Collection Indexes
 */
const questionBankIndexes = [
  // Query indexes
  { fields: { createdBy: 1 }, options: { background: true } },
  { fields: { organization: 1 }, options: { background: true } },
  { fields: { isPublic: 1 }, options: { background: true } },

  // Compound indexes
  { fields: { organization: 1, isPublic: 1 }, options: { background: true } },

  // Text search
  { fields: { name: 'text', description: 'text' }, options: { background: true } },
];

/**
 * Content Collection Indexes
 */
const contentIndexes = [
  // Query indexes
  { fields: { lesson: 1 }, options: { background: true } },
  { fields: { type: 1 }, options: { background: true } },
  { fields: { order: 1 }, options: { background: true } },

  // Compound indexes
  { fields: { lesson: 1, order: 1 }, options: { background: true } },
  { fields: { lesson: 1, type: 1 }, options: { background: true } },
];

/**
 * Setting Collection Indexes
 */
const settingIndexes = [
  // Unique index
  { fields: { key: 1 }, options: { unique: true, background: true } },

  // Query indexes
  { fields: { category: 1 }, options: { background: true } },
  { fields: { isPublic: 1 }, options: { background: true } },
];

/**
 * Index configuration map
 */
const indexConfig = {
  User: userIndexes,
  Course: courseIndexes,
  Enrollment: enrollmentIndexes,
  Chapter: chapterIndexes,
  Lesson: lessonIndexes,
  Quiz: quizIndexes,
  Question: questionIndexes,
  Assignment: assignmentIndexes,
  Article: articleIndexes,
  Certificate: certificateIndexes,
  Category: categoryIndexes,
  Organization: organizationIndexes,
  Conversation: conversationIndexes,
  Message: messageIndexes,
  QuestionBank: questionBankIndexes,
  Content: contentIndexes,
  Setting: settingIndexes,
};

/**
 * Create indexes for a specific model
 */
async function createModelIndexes(modelName) {
  try {
    const Model = mongoose.model(modelName);
    const indexes = indexConfig[modelName];

    if (!indexes || indexes.length === 0) {
      console.log(`⚠️  No indexes configured for ${modelName}`);
      return { model: modelName, created: 0, errors: [] };
    }

    console.log(`📊 Creating ${indexes.length} indexes for ${modelName}...`);

    const results = {
      model: modelName,
      created: 0,
      skipped: 0,
      errors: [],
    };

    for (const index of indexes) {
      try {
        await Model.collection.createIndex(index.fields, index.options);
        results.created++;
      } catch (error) {
        // Index might already exist
        if (error.code === 85 || error.code === 86) {
          results.skipped++;
        } else {
          results.errors.push({
            fields: index.fields,
            error: error.message,
          });
        }
      }
    }

    console.log(`✅ ${modelName}: Created ${results.created}, Skipped ${results.skipped}, Errors ${results.errors.length}`);
    return results;
  } catch (error) {
    console.error(`❌ Error creating indexes for ${modelName}:`, error.message);
    return {
      model: modelName,
      created: 0,
      errors: [{ error: error.message }],
    };
  }
}

/**
 * Create all indexes for all models
 */
async function createAllIndexes() {
  console.log('\n' + '='.repeat(60));
  console.log('🔧 Database Index Creation');
  console.log('='.repeat(60) + '\n');

  const modelNames = Object.keys(indexConfig);
  const results = [];

  for (const modelName of modelNames) {
    const result = await createModelIndexes(modelName);
    results.push(result);
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Index Creation Summary');
  console.log('='.repeat(60));

  const totalCreated = results.reduce((sum, r) => sum + r.created, 0);
  const totalSkipped = results.reduce((sum, r) => sum + (r.skipped || 0), 0);
  const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0);

  console.log(`Total Models: ${results.length}`);
  console.log(`Indexes Created: ${totalCreated}`);
  console.log(`Indexes Skipped: ${totalSkipped}`);
  console.log(`Errors: ${totalErrors}`);

  if (totalErrors > 0) {
    console.log('\n⚠️  Errors occurred:');
    results.forEach((result) => {
      if (result.errors.length > 0) {
        console.log(`  ${result.model}:`);
        result.errors.forEach((err) => {
          console.log(`    - ${err.error}`);
        });
      }
    });
  }

  console.log('\n' + '='.repeat(60) + '\n');

  return results;
}

/**
 * Drop all indexes for a model (except _id)
 */
async function dropModelIndexes(modelName) {
  try {
    const Model = mongoose.model(modelName);
    await Model.collection.dropIndexes();
    console.log(`✅ Dropped all indexes for ${modelName}`);
    return { model: modelName, success: true };
  } catch (error) {
    console.error(`❌ Error dropping indexes for ${modelName}:`, error.message);
    return { model: modelName, success: false, error: error.message };
  }
}

/**
 * List all indexes for a model
 */
async function listModelIndexes(modelName) {
  try {
    const Model = mongoose.model(modelName);
    const indexes = await Model.collection.listIndexes().toArray();
    return { model: modelName, indexes };
  } catch (error) {
    console.error(`❌ Error listing indexes for ${modelName}:`, error.message);
    return { model: modelName, indexes: [], error: error.message };
  }
}

/**
 * Get index statistics
 */
async function getIndexStats() {
  const modelNames = Object.keys(indexConfig);
  const stats = [];

  for (const modelName of modelNames) {
    const Model = mongoose.model(modelName);
    const indexInfo = await Model.collection.indexInformation();
    const count = Object.keys(indexInfo).length;

    stats.push({
      model: modelName,
      indexCount: count,
      indexes: indexInfo,
    });
  }

  return stats;
}

module.exports = {
  indexConfig,
  createAllIndexes,
  createModelIndexes,
  dropModelIndexes,
  listModelIndexes,
  getIndexStats,
};
