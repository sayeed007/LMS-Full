#!/usr/bin/env node

/**
 * Environment Validation Script
 *
 * Validates environment configuration before deployment
 * Run: node scripts/validate-env.js
 */

const path = require('path');
const fs = require('fs');

// Load dotenv
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Validation results
const results = {
  errors: [],
  warnings: [],
  info: [],
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
function printSection(title) {
  console.log('');
  print('='.repeat(60), 'cyan');
  print(`  ${title}`, 'bright');
  print('='.repeat(60), 'cyan');
  console.log('');
}

/**
 * Add error
 */
function addError(message) {
  results.errors.push(message);
}

/**
 * Add warning
 */
function addWarning(message) {
  results.warnings.push(message);
}

/**
 * Add info
 */
function addInfo(message) {
  results.info.push(message);
}

/**
 * Check if .env file exists
 */
function checkEnvFileExists() {
  const envPath = path.join(__dirname, '../.env');
  if (!fs.existsSync(envPath)) {
    addError('.env file not found! Copy .env.example to .env and configure it.');
    return false;
  }
  addInfo('.env file found');
  return true;
}

/**
 * Validate required variables
 */
function validateRequired() {
  const required = [
    'NODE_ENV',
    'PORT',
    'MONGODB_URI',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'SESSION_SECRET',
    'BACKEND_URL',
    'FRONTEND_URL',
  ];

  required.forEach((varName) => {
    if (!process.env[varName]) {
      addError(`Required variable missing: ${varName}`);
    }
  });
}

/**
 * Validate JWT configuration
 */
function validateJWT() {
  const { JWT_SECRET, JWT_REFRESH_SECRET } = process.env;

  if (JWT_SECRET) {
    if (JWT_SECRET.length < 32) {
      addWarning('JWT_SECRET is less than 32 characters - not secure enough');
    }
    if (JWT_SECRET.includes('change-in-production')) {
      addWarning('JWT_SECRET still contains default value - please change it!');
    }
  }

  if (JWT_REFRESH_SECRET) {
    if (JWT_REFRESH_SECRET.length < 32) {
      addWarning('JWT_REFRESH_SECRET is less than 32 characters - not secure enough');
    }
    if (JWT_SECRET === JWT_REFRESH_SECRET) {
      addWarning('JWT_SECRET and JWT_REFRESH_SECRET should be different');
    }
  }
}

/**
 * Validate database configuration
 */
function validateDatabase() {
  const { MONGODB_URI, NODE_ENV } = process.env;

  if (!MONGODB_URI) return;

  // Check if using localhost in production
  if (NODE_ENV === 'production' && MONGODB_URI.includes('localhost')) {
    addWarning('Using localhost MongoDB in production - consider using a remote database');
  }

  // Check for default database name
  if (MONGODB_URI.includes('lms_database') && NODE_ENV === 'production') {
    addWarning('Using default database name in production - consider using a unique name');
  }
}

/**
 * Validate CORS configuration
 */
function validateCORS() {
  const { CORS_ORIGIN, NODE_ENV } = process.env;

  if (!CORS_ORIGIN) {
    addWarning('CORS_ORIGIN not configured - API may be inaccessible from frontend');
    return;
  }

  if (NODE_ENV === 'production') {
    if (CORS_ORIGIN.includes('*')) {
      addError('CORS_ORIGIN allows all origins (*) in production - SECURITY RISK!');
    }
    if (CORS_ORIGIN.includes('localhost')) {
      addWarning('CORS_ORIGIN includes localhost in production');
    }
  }
}

/**
 * Validate security settings
 */
function validateSecurity() {
  const { NODE_ENV, COOKIE_SECURE, HSTS_ENABLED } = process.env;

  if (NODE_ENV === 'production') {
    if (COOKIE_SECURE !== 'true') {
      addWarning('COOKIE_SECURE is not true in production - cookies will not be secure');
    }
    if (HSTS_ENABLED !== 'true') {
      addWarning('HSTS_ENABLED is not true in production - missing HTTPS enforcement');
    }
  }
}

/**
 * Validate email configuration
 */
function validateEmail() {
  const { EMAIL_USERNAME, EMAIL_PASSWORD, EMAIL_FROM } = process.env;

  if (!EMAIL_USERNAME || !EMAIL_PASSWORD) {
    addWarning('Email not configured - email functionality will not work');
    return;
  }

  if (EMAIL_FROM && !EMAIL_FROM.includes('@')) {
    addWarning('EMAIL_FROM should be a valid email address');
  }
}

/**
 * Validate file storage
 */
function validateStorage() {
  const { STORAGE_PROVIDER, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

  if (STORAGE_PROVIDER === 'cloudinary') {
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
      addWarning('Cloudinary selected but credentials not fully configured');
    }
  }
}

/**
 * Validate payment gateways
 */
function validatePayments() {
  const {
    STRIPE_ENABLED,
    STRIPE_SECRET_KEY,
    PAYPAL_ENABLED,
    PAYPAL_CLIENT_ID,
    NODE_ENV,
  } = process.env;

  if (STRIPE_ENABLED === 'true') {
    if (!STRIPE_SECRET_KEY) {
      addError('Stripe enabled but STRIPE_SECRET_KEY not configured');
    } else if (NODE_ENV === 'production' && STRIPE_SECRET_KEY.startsWith('sk_test_')) {
      addError('Using Stripe TEST key in PRODUCTION environment!');
    } else if (NODE_ENV === 'development' && STRIPE_SECRET_KEY.startsWith('sk_live_')) {
      addWarning('Using Stripe LIVE key in development environment');
    }
  }

  if (PAYPAL_ENABLED === 'true' && !PAYPAL_CLIENT_ID) {
    addError('PayPal enabled but PAYPAL_CLIENT_ID not configured');
  }
}

/**
 * Validate Redis configuration
 */
function validateRedis() {
  const { REDIS_ENABLED, REDIS_URL, REDIS_PASSWORD, NODE_ENV } = process.env;

  if (REDIS_ENABLED === 'true') {
    if (!REDIS_URL && !process.env.REDIS_HOST) {
      addError('Redis enabled but connection details not configured');
    }

    if (NODE_ENV === 'production' && !REDIS_PASSWORD) {
      addWarning('Redis password not set in production - security risk');
    }
  }
}

/**
 * Validate monitoring
 */
function validateMonitoring() {
  const { NODE_ENV, SENTRY_ENABLED, SENTRY_DSN } = process.env;

  if (NODE_ENV === 'production') {
    if (SENTRY_ENABLED !== 'true') {
      addInfo('Sentry error tracking not enabled in production');
    } else if (!SENTRY_DSN) {
      addError('Sentry enabled but SENTRY_DSN not configured');
    }
  }
}

/**
 * Print results
 */
function printResults() {
  printSection('Validation Results');

  // Info
  if (results.info.length > 0) {
    print('ℹ️  Information:', 'blue');
    results.info.forEach((msg) => print(`   ${msg}`, 'cyan'));
    console.log('');
  }

  // Warnings
  if (results.warnings.length > 0) {
    print('⚠️  Warnings:', 'yellow');
    results.warnings.forEach((msg) => print(`   ${msg}`, 'yellow'));
    console.log('');
  }

  // Errors
  if (results.errors.length > 0) {
    print('❌ Errors:', 'red');
    results.errors.forEach((msg) => print(`   ${msg}`, 'red'));
    console.log('');
  }

  // Summary
  print('='.repeat(60), 'cyan');
  const hasErrors = results.errors.length > 0;
  const hasWarnings = results.warnings.length > 0;

  if (!hasErrors && !hasWarnings) {
    print('✅ Environment configuration is valid!', 'green');
  } else if (hasErrors) {
    print(`❌ Validation failed with ${results.errors.length} error(s)`, 'red');
  } else {
    print(`⚠️  Validation passed with ${results.warnings.length} warning(s)`, 'yellow');
  }
  print('='.repeat(60), 'cyan');
  console.log('');

  // Exit code
  if (hasErrors) {
    process.exit(1);
  }
}

/**
 * Main validation function
 */
function main() {
  print('', '');
  printSection('🔍 Environment Configuration Validation');

  // Add environment info
  addInfo(`Environment: ${process.env.NODE_ENV || 'not set'}`);
  addInfo(`Port: ${process.env.PORT || 'not set'}`);
  addInfo(`Backend URL: ${process.env.BACKEND_URL || 'not set'}`);
  addInfo(`Frontend URL: ${process.env.FRONTEND_URL || 'not set'}`);

  // Check if .env exists
  if (!checkEnvFileExists()) {
    printResults();
    return;
  }

  // Run validations
  print('Running validation checks...', 'cyan');
  validateRequired();
  validateJWT();
  validateDatabase();
  validateCORS();
  validateSecurity();
  validateEmail();
  validateStorage();
  validatePayments();
  validateRedis();
  validateMonitoring();

  // Print results
  printResults();
}

// Run validation
main();
