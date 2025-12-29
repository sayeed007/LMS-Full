#!/usr/bin/env node

/**
 * Database Backup Script
 *
 * Creates a backup of the MongoDB database using mongodump.
 * Supports compression, rotation, and cloud storage upload.
 *
 * Usage:
 *   node scripts/backup-database.js
 *   node scripts/backup-database.js --compress
 *   node scripts/backup-database.js --upload-s3
 */

const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const util = require('util');

const execPromise = util.promisify(exec);

// Load environment variables
require('dotenv').config();

// Configuration
const config = {
  mongodbUri: process.env.MONGODB_URI,
  backupDir: process.env.DB_BACKUP_PATH || path.join(__dirname, '../../backups/mongodb'),
  compress: process.argv.includes('--compress'),
  uploadS3: process.argv.includes('--upload-s3'),
  retention: parseInt(process.env.DB_BACKUP_RETENTION || '30', 10), // days
  timestamp: new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19),
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

/**
 * Print colored message
 */
function print(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Print section header
 */
function printHeader(title) {
  console.log('');
  print('='.repeat(60), 'cyan');
  print(`  ${title}`, 'bright');
  print('='.repeat(60), 'cyan');
  console.log('');
}

/**
 * Ensure backup directory exists
 */
function ensureBackupDir() {
  if (!fs.existsSync(config.backupDir)) {
    fs.mkdirSync(config.backupDir, { recursive: true });
    print(`✓ Created backup directory: ${config.backupDir}`, 'green');
  }
}

/**
 * Parse MongoDB connection string
 */
function parseMongoUri(uri) {
  try {
    const url = new URL(uri);
    return {
      protocol: url.protocol,
      host: url.hostname,
      port: url.port || '27017',
      database: url.pathname.slice(1).split('?')[0],
      username: url.username,
      password: url.password,
    };
  } catch (error) {
    throw new Error(`Invalid MongoDB URI: ${error.message}`);
  }
}

/**
 * Create database backup
 */
async function createBackup() {
  try {
    const backupPath = path.join(config.backupDir, `backup-${config.timestamp}`);
    const parsed = parseMongoUri(config.mongodbUri);

    print(`Creating backup to: ${backupPath}`, 'blue');
    print(`Database: ${parsed.database}`, 'blue');

    // Build mongodump command
    let command = `mongodump --uri="${config.mongodbUri}" --out="${backupPath}"`;

    if (config.compress) {
      command += ' --gzip';
      print('Compression: Enabled', 'blue');
    }

    // Execute mongodump
    const startTime = Date.now();
    print('\nExecuting mongodump...', 'cyan');

    const { stdout, stderr } = await execPromise(command);

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);

    print(`✓ Backup completed in ${duration}s`, 'green');

    // Get backup size
    const backupSize = await getDirectorySize(backupPath);
    print(`Backup size: ${formatBytes(backupSize)}`, 'green');

    return {
      success: true,
      path: backupPath,
      size: backupSize,
      duration,
    };
  } catch (error) {
    print(`✗ Backup failed: ${error.message}`, 'red');
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Get directory size
 */
async function getDirectorySize(dirPath) {
  try {
    const { stdout } = await execPromise(`du -sb "${dirPath}" | cut -f1`);
    return parseInt(stdout.trim(), 10);
  } catch (error) {
    return 0;
  }
}

/**
 * Format bytes to human readable
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Create compressed archive
 */
async function compressBackup(backupPath) {
  try {
    const archivePath = `${backupPath}.tar.gz`;

    print('\nCreating compressed archive...', 'cyan');

    await execPromise(`tar -czf "${archivePath}" -C "${config.backupDir}" "${path.basename(backupPath)}"`);

    // Get archive size
    const stats = fs.statSync(archivePath);

    print(`✓ Archive created: ${path.basename(archivePath)}`, 'green');
    print(`Archive size: ${formatBytes(stats.size)}`, 'green');

    // Remove uncompressed backup
    await execPromise(`rm -rf "${backupPath}"`);

    return {
      success: true,
      path: archivePath,
      size: stats.size,
    };
  } catch (error) {
    print(`✗ Compression failed: ${error.message}`, 'red');
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Upload backup to S3
 */
async function uploadToS3(backupPath) {
  try {
    const s3Bucket = process.env.AWS_S3_BACKUP_BUCKET;
    const s3Region = process.env.AWS_REGION || 'us-east-1';

    if (!s3Bucket) {
      print('⚠ S3 bucket not configured (AWS_S3_BACKUP_BUCKET)', 'yellow');
      return { success: false, skipped: true };
    }

    print('\nUploading to S3...', 'cyan');
    print(`Bucket: ${s3Bucket}`, 'blue');

    const fileName = path.basename(backupPath);
    const s3Key = `mongodb-backups/${fileName}`;

    const command = `aws s3 cp "${backupPath}" "s3://${s3Bucket}/${s3Key}" --region ${s3Region}`;

    await execPromise(command);

    print(`✓ Uploaded to S3: ${s3Key}`, 'green');

    return {
      success: true,
      bucket: s3Bucket,
      key: s3Key,
    };
  } catch (error) {
    print(`✗ S3 upload failed: ${error.message}`, 'red');
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Clean up old backups
 */
async function cleanupOldBackups() {
  try {
    print('\nCleaning up old backups...', 'cyan');
    print(`Retention: ${config.retention} days`, 'blue');

    const files = fs.readdirSync(config.backupDir);
    const now = Date.now();
    const maxAge = config.retention * 24 * 60 * 60 * 1000;

    let deleted = 0;
    let freedSpace = 0;

    for (const file of files) {
      const filePath = path.join(config.backupDir, file);
      const stats = fs.statSync(filePath);

      const age = now - stats.mtimeMs;

      if (age > maxAge) {
        const size = stats.isDirectory() ? await getDirectorySize(filePath) : stats.size;
        freedSpace += size;

        if (stats.isDirectory()) {
          await execPromise(`rm -rf "${filePath}"`);
        } else {
          fs.unlinkSync(filePath);
        }

        deleted++;
        print(`  Deleted: ${file} (${formatBytes(size)})`, 'yellow');
      }
    }

    if (deleted === 0) {
      print('No old backups to clean up', 'green');
    } else {
      print(`✓ Deleted ${deleted} old backup(s), freed ${formatBytes(freedSpace)}`, 'green');
    }

    return {
      success: true,
      deleted,
      freedSpace,
    };
  } catch (error) {
    print(`✗ Cleanup failed: ${error.message}`, 'red');
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * List backups
 */
function listBackups() {
  try {
    const files = fs.readdirSync(config.backupDir);
    const backups = [];

    for (const file of files) {
      const filePath = path.join(config.backupDir, file);
      const stats = fs.statSync(filePath);

      backups.push({
        name: file,
        path: filePath,
        size: stats.size,
        created: stats.mtime,
        isDirectory: stats.isDirectory(),
      });
    }

    // Sort by creation time (newest first)
    backups.sort((a, b) => b.created - a.created);

    return backups;
  } catch (error) {
    return [];
  }
}

/**
 * Print backup summary
 */
function printBackupSummary() {
  const backups = listBackups();

  if (backups.length === 0) {
    print('No backups found', 'yellow');
    return;
  }

  print('\nExisting Backups:', 'cyan');
  print('-'.repeat(60), 'cyan');

  backups.slice(0, 10).forEach((backup) => {
    const age = Math.floor((Date.now() - backup.created) / (1000 * 60 * 60 * 24));
    const sizeStr = backup.isDirectory() ? '(dir)' : formatBytes(backup.size);

    console.log(`  ${backup.name} - ${sizeStr} - ${age} days old`);
  });

  if (backups.length > 10) {
    print(`  ... and ${backups.length - 10} more`, 'yellow');
  }

  const totalSize = backups.reduce((sum, b) => sum + b.size, 0);
  print(`\nTotal: ${backups.length} backup(s), ${formatBytes(totalSize)}`, 'cyan');
}

/**
 * Main backup function
 */
async function main() {
  printHeader('🗄️  Database Backup');

  // Validate configuration
  if (!config.mongodbUri) {
    print('❌ Error: MONGODB_URI not configured', 'red');
    process.exit(1);
  }

  // Ensure backup directory
  ensureBackupDir();

  // Print configuration
  print('Configuration:', 'cyan');
  print(`  Backup directory: ${config.backupDir}`, 'blue');
  print(`  Compression: ${config.compress ? 'Yes' : 'No'}`, 'blue');
  print(`  S3 upload: ${config.uploadS3 ? 'Yes' : 'No'}`, 'blue');
  print(`  Retention: ${config.retention} days`, 'blue');

  // Create backup
  const backupResult = await createBackup();

  if (!backupResult.success) {
    process.exit(1);
  }

  let finalPath = backupResult.path;

  // Compress if requested
  if (config.compress || config.uploadS3) {
    const compressResult = await compressBackup(backupResult.path);
    if (compressResult.success) {
      finalPath = compressResult.path;
    }
  }

  // Upload to S3 if requested
  if (config.uploadS3) {
    await uploadToS3(finalPath);
  }

  // Clean up old backups
  await cleanupOldBackups();

  // Print summary
  printBackupSummary();

  printHeader('✅ Backup Complete');
}

// Run backup
main().catch((error) => {
  print(`\n❌ Fatal error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
