#!/usr/bin/env node

/**
 * Database Restore Script
 *
 * Restores a MongoDB database from a backup created by backup-database.js
 *
 * Usage:
 *   node scripts/restore-database.js <backup-name>
 *   node scripts/restore-database.js backup-2025-11-22T10-30-00
 *   node scripts/restore-database.js --list
 *   node scripts/restore-database.js --latest
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
  listOnly: process.argv.includes('--list'),
  restoreLatest: process.argv.includes('--latest'),
  dropBeforeRestore: process.argv.includes('--drop'),
  backupName: process.argv[2],
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
 * List available backups
 */
function listBackups() {
  try {
    if (!fs.existsSync(config.backupDir)) {
      return [];
    }

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
        isArchive: file.endsWith('.tar.gz'),
      });
    }

    // Sort by creation time (newest first)
    backups.sort((a, b) => b.created - a.created);

    return backups;
  } catch (error) {
    print(`Error listing backups: ${error.message}`, 'red');
    return [];
  }
}

/**
 * Print available backups
 */
async function printAvailableBackups() {
  const backups = listBackups();

  if (backups.length === 0) {
    print('No backups found', 'yellow');
    print(`Backup directory: ${config.backupDir}`, 'blue');
    return;
  }

  print('Available Backups:', 'cyan');
  print('-'.repeat(80), 'cyan');
  print(sprintf('%-40s %-15s %-15s %s', 'Name', 'Size', 'Age', 'Type'), 'bright');
  print('-'.repeat(80), 'cyan');

  for (const backup of backups) {
    const age = Math.floor((Date.now() - backup.created) / (1000 * 60 * 60 * 24));
    const ageStr = age === 0 ? 'Today' : `${age} day${age > 1 ? 's' : ''} ago`;
    const sizeStr = backup.isDirectory() ? '(calculating...)' : formatBytes(backup.size);
    const type = backup.isArchive ? 'Archive' : backup.isDirectory ? 'Directory' : 'Unknown';

    console.log(sprintf('%-40s %-15s %-15s %s', backup.name, sizeStr, ageStr, type));
  }

  print(`\nTotal: ${backups.length} backup(s)`, 'cyan');
}

/**
 * Simple sprintf implementation
 */
function sprintf(format, ...args) {
  let i = 0;
  return format.replace(/%(-?\d+)?s/g, (match, width) => {
    const value = String(args[i++] || '');
    if (width) {
      const w = parseInt(width);
      if (w < 0) {
        return value.padEnd(-w);
      }
      return value.padStart(w);
    }
    return value;
  });
}

/**
 * Extract archive if needed
 */
async function extractArchive(archivePath) {
  try {
    print('\nExtracting archive...', 'cyan');

    const extractDir = archivePath.replace('.tar.gz', '');

    await execPromise(`tar -xzf "${archivePath}" -C "${config.backupDir}"`);

    print(`✓ Archive extracted to: ${extractDir}`, 'green');

    return {
      success: true,
      path: extractDir,
      shouldCleanup: true,
    };
  } catch (error) {
    print(`✗ Extraction failed: ${error.message}`, 'red');
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Restore database from backup
 */
async function restoreDatabase(backupPath) {
  try {
    print(`\nRestoring database from: ${backupPath}`, 'blue');

    // Build mongorestore command
    let command = `mongorestore --uri="${config.mongodbUri}"`;

    if (config.dropBeforeRestore) {
      command += ' --drop';
      print('⚠  Will drop existing collections before restore', 'yellow');
    }

    // Check if backup is gzipped
    const isGzipped = fs.existsSync(path.join(backupPath, 'admin')) &&
                      fs.readdirSync(path.join(backupPath, 'admin')).some(f => f.endsWith('.gz'));

    if (isGzipped) {
      command += ' --gzip';
      print('Backup format: Compressed (gzip)', 'blue');
    }

    command += ` "${backupPath}"`;

    // Execute mongorestore
    const startTime = Date.now();
    print('\nExecuting mongorestore...', 'cyan');

    const { stdout, stderr } = await execPromise(command);

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    if (stdout) console.log(stdout);
    if (stderr && !stderr.includes('warning')) {
      console.error(stderr);
    }

    print(`✓ Restore completed in ${duration}s`, 'green');

    return {
      success: true,
      duration,
    };
  } catch (error) {
    print(`✗ Restore failed: ${error.message}`, 'red');
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Confirm restore operation
 */
async function confirmRestore(backupName) {
  print('\n⚠️  WARNING: This will restore the database!', 'yellow');
  print(`Backup: ${backupName}`, 'yellow');
  print(`Target: ${config.mongodbUri}`, 'yellow');

  if (config.dropBeforeRestore) {
    print('Mode: DROP existing data before restore', 'red');
  } else {
    print('Mode: Merge with existing data', 'yellow');
  }

  print('\nType "yes" to continue, or anything else to cancel:', 'cyan');

  // In non-interactive environment, skip confirmation
  if (!process.stdin.isTTY) {
    print('Non-interactive mode: Proceeding with restore', 'yellow');
    return true;
  }

  return new Promise((resolve) => {
    process.stdin.once('data', (data) => {
      const answer = data.toString().trim().toLowerCase();
      resolve(answer === 'yes');
    });
  });
}

/**
 * Main restore function
 */
async function main() {
  printHeader('🔄 Database Restore');

  // List backups if requested
  if (config.listOnly) {
    await printAvailableBackups();
    process.exit(0);
  }

  // Validate configuration
  if (!config.mongodbUri) {
    print('❌ Error: MONGODB_URI not configured', 'red');
    process.exit(1);
  }

  if (!fs.existsSync(config.backupDir)) {
    print(`❌ Error: Backup directory not found: ${config.backupDir}`, 'red');
    process.exit(1);
  }

  // Determine backup to restore
  let backupName;
  let backupPath;

  if (config.restoreLatest) {
    const backups = listBackups();
    if (backups.length === 0) {
      print('❌ Error: No backups available', 'red');
      process.exit(1);
    }

    const latest = backups[0];
    backupName = latest.name;
    backupPath = latest.path;
    print(`Using latest backup: ${backupName}`, 'cyan');
  } else if (config.backupName && !config.backupName.startsWith('--')) {
    backupName = config.backupName;
    backupPath = path.join(config.backupDir, backupName);

    if (!fs.existsSync(backupPath)) {
      print(`❌ Error: Backup not found: ${backupName}`, 'red');
      print('\nUse --list to see available backups', 'yellow');
      process.exit(1);
    }
  } else {
    print('❌ Error: No backup specified', 'red');
    print('\nUsage:', 'cyan');
    print('  node scripts/restore-database.js <backup-name>', 'blue');
    print('  node scripts/restore-database.js --latest', 'blue');
    print('  node scripts/restore-database.js --list', 'blue');
    process.exit(1);
  }

  // Confirm restore
  const confirmed = await confirmRestore(backupName);
  if (!confirmed) {
    print('\n❌ Restore cancelled', 'yellow');
    process.exit(0);
  }

  // Extract archive if needed
  let restorePath = backupPath;
  let shouldCleanup = false;

  if (backupPath.endsWith('.tar.gz')) {
    const extractResult = await extractArchive(backupPath);
    if (!extractResult.success) {
      process.exit(1);
    }
    restorePath = extractResult.path;
    shouldCleanup = extractResult.shouldCleanup;
  }

  // Restore database
  const restoreResult = await restoreDatabase(restorePath);

  // Cleanup extracted files if needed
  if (shouldCleanup) {
    print('\nCleaning up extracted files...', 'cyan');
    await execPromise(`rm -rf "${restorePath}"`);
    print('✓ Cleanup complete', 'green');
  }

  if (restoreResult.success) {
    printHeader('✅ Restore Complete');
  } else {
    printHeader('❌ Restore Failed');
    process.exit(1);
  }
}

// Run restore
main().catch((error) => {
  print(`\n❌ Fatal error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
