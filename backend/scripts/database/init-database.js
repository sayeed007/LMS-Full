#!/usr/bin/env node

/**
 * Database Initialization Script
 *
 * Initializes the database with indexes, validates collections,
 * and performs health checks.
 *
 * Usage:
 *   node scripts/init-database.js
 *   node scripts/init-database.js --create-indexes
 *   node scripts/init-database.js --validate
 */

const mongoose = require('mongoose');
const path = require('path');

// Load environment variables
require('dotenv').config();

// Load database configuration
const { createAllIndexes, getIndexStats } = require('../src/config/database.indexes');
const { checkDatabaseHealth, getAllCollectionStats, validateCollection } = require('../src/utils/database.utils');

// Configuration
const config = {
  createIndexes: process.argv.includes('--create-indexes') || process.argv.length === 2,
  validate: process.argv.includes('--validate'),
  mongodbUri: process.env.MONGODB_URI,
};

// Colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function print(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function printHeader(title) {
  console.log('');
  print('='.repeat(60), 'cyan');
  print(`  ${title}`, 'bright');
  print('='.repeat(60), 'cyan');
  console.log('');
}

/**
 * Connect to database
 */
async function connectDatabase() {
  try {
    print('Connecting to database...', 'cyan');

    await mongoose.connect(config.mongodbUri);

    print(`✓ Connected to: ${mongoose.connection.name}`, 'green');
    return true;
  } catch (error) {
    print(`✗ Connection failed: ${error.message}`, 'red');
    return false;
  }
}

/**
 * Load all models
 */
function loadModels() {
  try {
    print('\nLoading models...', 'cyan');

    // Require all model files
    const modelsDir = path.join(__dirname, '../src/models');
    const fs = require('fs');

    const files = fs.readdirSync(modelsDir).filter(f => f.endsWith('.js'));

    files.forEach(file => {
      require(path.join(modelsDir, file));
    });

    const modelNames = Object.keys(mongoose.connection.models);
    print(`✓ Loaded ${modelNames.length} models`, 'green');

    return modelNames;
  } catch (error) {
    print(`✗ Error loading models: ${error.message}`, 'red');
    return [];
  }
}

/**
 * Check database health
 */
async function performHealthCheck() {
  printHeader('🏥 Database Health Check');

  const health = await checkDatabaseHealth();

  if (!health.connected) {
    print('❌ Database is not connected', 'red');
    return false;
  }

  print('✓ Database is connected', 'green');
  print(`  Version: ${health.version}`, 'blue');
  print(`  Uptime: ${Math.floor(health.uptime / 60)} minutes`, 'blue');
  print(`  Connections: ${health.connections.current}/${health.connections.available}`, 'blue');
  print(`  Memory: ${health.memory.resident}MB (resident), ${health.memory.virtual}MB (virtual)`, 'blue');
  print(`  Models: ${health.models}`, 'blue');
  print(`  Collections: ${health.collections}`, 'blue');

  return true;
}

/**
 * Get collection statistics
 */
async function showCollectionStats() {
  printHeader('📊 Collection Statistics');

  const stats = await getAllCollectionStats();

  if (stats.length === 0) {
    print('No collections found', 'yellow');
    return;
  }

  // Calculate totals
  let totalDocs = 0;
  let totalSize = 0;
  let totalIndexSize = 0;

  print(`${'Collection'.padEnd(30)} ${'Documents'.padStart(12)} ${'Size'.padStart(12)} ${'Indexes'.padStart(8)}`,'bright');
  print('-'.repeat(70), 'cyan');

  stats.forEach(stat => {
    if (!stat.error) {
      totalDocs += stat.count;
      totalSize += stat.size;
      totalIndexSize += stat.indexSize || 0;

      const sizeStr = formatBytes(stat.size);
      const indexCount = stat.indexes || 0;

      console.log(`${stat.collection.padEnd(30)} ${String(stat.count).padStart(12)} ${sizeStr.padStart(12)} ${String(indexCount).padStart(8)}`);
    }
  });

  print('-'.repeat(70), 'cyan');
  print(`${'TOTAL'.padEnd(30)} ${String(totalDocs).padStart(12)} ${formatBytes(totalSize).padStart(12)}`, 'bright');
  print(`Index Size: ${formatBytes(totalIndexSize)}`, 'blue');
  print(`Total Database Size: ${formatBytes(totalSize + totalIndexSize)}`, 'blue');
}

/**
 * Format bytes
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Validate all collections
 */
async function validateAllCollections() {
  printHeader('🔍 Collection Validation');

  const collections = Object.keys(mongoose.connection.collections);

  for (const collectionName of collections) {
    const result = await validateCollection(collectionName);

    if (result.valid) {
      print(`✓ ${collectionName}: Valid`, 'green');
    } else {
      print(`✗ ${collectionName}: Invalid`, 'red');
      if (result.errors && result.errors.length > 0) {
        result.errors.forEach(err => print(`  - ${err}`, 'red'));
      }
    }
  }
}

/**
 * Show index statistics
 */
async function showIndexStats() {
  printHeader('📇 Index Statistics');

  const stats = await getIndexStats();

  print(`${'Collection'.padEnd(30)} ${'Indexes'.padStart(10)}`, 'bright');
  print('-'.repeat(45), 'cyan');

  let totalIndexes = 0;

  stats.forEach(stat => {
    totalIndexes += stat.indexCount;
    console.log(`${stat.model.padEnd(30)} ${String(stat.indexCount).padStart(10)}`);
  });

  print('-'.repeat(45), 'cyan');
  print(`${'TOTAL'.padEnd(30)} ${String(totalIndexes).padStart(10)}`, 'bright');
}

/**
 * Main initialization function
 */
async function main() {
  printHeader('🔧 Database Initialization');

  // Validate configuration
  if (!config.mongodbUri) {
    print('❌ Error: MONGODB_URI not configured', 'red');
    process.exit(1);
  }

  print('Configuration:', 'cyan');
  print(`  Create Indexes: ${config.createIndexes ? 'Yes' : 'No'}`, 'blue');
  print(`  Validate Collections: ${config.validate ? 'Yes' : 'No'}`, 'blue');

  // Connect to database
  const connected = await connectDatabase();
  if (!connected) {
    process.exit(1);
  }

  // Load models
  loadModels();

  // Health check
  const healthy = await performHealthCheck();
  if (!healthy) {
    process.exit(1);
  }

  // Collection statistics
  await showCollectionStats();

  // Create indexes if requested
  if (config.createIndexes) {
    printHeader('🔨 Creating Indexes');
    await createAllIndexes();
    await showIndexStats();
  }

  // Validate collections if requested
  if (config.validate) {
    await validateAllCollections();
  }

  // Close connection
  await mongoose.connection.close();
  print('\n✓ Database connection closed', 'green');

  printHeader('✅ Initialization Complete');
}

// Run initialization
main().catch((error) => {
  print(`\n❌ Fatal error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
