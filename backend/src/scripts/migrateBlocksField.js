/**
 * Migration Script: Rename 'items' to 'blocks' in block content
 *
 * This script migrates existing block content from using 'data.items'
 * to 'data.blocks' for consistency with the frontend.
 *
 * Run with: node src/scripts/migrateBlocksField.js
 */

const mongoose = require('mongoose');
const Content = require('../models/Content');
require('dotenv').config();

const migrateBlocksField = async () => {
  try {
    // Connect to database
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lms');
    console.log('✓ Connected to database');

    // Find all block content that has 'items' but not 'blocks'
    const blockContent = await Content.find({
      type: { $in: ['block', 'blocks'] },
      'data.items': { $exists: true }
    }).lean();

    console.log(`\nFound ${blockContent.length} block content items to migrate`);

    if (blockContent.length === 0) {
      console.log('✓ No migration needed - all content already uses "blocks" field');
      await mongoose.connection.close();
      return;
    }

    // Migrate each content item
    let migrated = 0;
    let skipped = 0;
    let errors = 0;

    for (const content of blockContent) {
      try {
        // Copy items to blocks
        const updateData = {
          'data.blocks': content.data.items,
          lastModified: new Date()
        };

        // Update the content
        await Content.updateOne(
          { _id: content._id },
          {
            $set: updateData,
            $unset: { 'data.items': '' } // Remove old 'items' field
          }
        );

        migrated++;
        console.log(`  ✓ Migrated content: ${content.title} (${content._id})`);
      } catch (error) {
        errors++;
        console.error(`  ✗ Error migrating ${content._id}:`, error.message);
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('Migration Summary:');
    console.log('='.repeat(60));
    console.log(`Total content found:    ${blockContent.length}`);
    console.log(`Successfully migrated:  ${migrated}`);
    console.log(`Skipped:                ${skipped}`);
    console.log(`Errors:                 ${errors}`);
    console.log('='.repeat(60));

    if (migrated > 0) {
      console.log('\n✓ Migration completed successfully!');
    }

    // Close database connection
    await mongoose.connection.close();
    console.log('\n✓ Database connection closed');

  } catch (error) {
    console.error('\n✗ Migration failed:', error);
    process.exit(1);
  }
};

// Run migration
console.log('='.repeat(60));
console.log('Block Content Field Migration');
console.log('Migrating "data.items" → "data.blocks"');
console.log('='.repeat(60));

migrateBlocksField()
  .then(() => {
    console.log('\n✓ Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n✗ Script failed:', error);
    process.exit(1);
  });
