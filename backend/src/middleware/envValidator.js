/**
 * Environment Validator Middleware
 *
 * Validates environment configuration at application startup
 * and provides health checks for configuration status.
 *
 * Usage:
 *   const { validateEnvironment, envHealthCheck } = require('./middleware/envValidator');
 *
 *   // Validate at startup
 *   validateEnvironment();
 *
 *   // Add health check endpoint
 *   app.get('/health/env', envHealthCheck);
 */

const config = require('../config/env.config');

/**
 * Validation result structure
 */
class ValidationResult {
  constructor() {
    this.isValid = true;
    this.errors = [];
    this.warnings = [];
    this.info = [];
  }

  addError(message) {
    this.errors.push(message);
    this.isValid = false;
  }

  addWarning(message) {
    this.warnings.push(message);
  }

  addInfo(message) {
    this.info.push(message);
  }

  hasIssues() {
    return this.errors.length > 0 || this.warnings.length > 0;
  }

  toJSON() {
    return {
      isValid: this.isValid,
      errors: this.errors,
      warnings: this.warnings,
      info: this.info,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Validate JWT configuration
 */
const validateJWT = (result) => {
  // JWT Secret validation
  if (!config.jwt.secret) {
    result.addError('JWT_SECRET is required but not set');
  } else if (config.jwt.secret.length < 32) {
    result.addWarning('JWT_SECRET should be at least 32 characters long for security');
  } else if (config.jwt.secret.includes('change-in-production') || config.jwt.secret === 'your-super-secret-jwt-key-minimum-32-characters-change-in-production') {
    result.addWarning('JWT_SECRET is using the default value - please change in production');
  }

  // JWT Refresh Secret validation
  if (!config.jwt.refreshSecret) {
    result.addError('JWT_REFRESH_SECRET is required but not set');
  } else if (config.jwt.refreshSecret.length < 32) {
    result.addWarning('JWT_REFRESH_SECRET should be at least 32 characters long for security');
  }

  // Same secret check
  if (config.jwt.secret && config.jwt.refreshSecret && config.jwt.secret === config.jwt.refreshSecret) {
    result.addWarning('JWT_SECRET and JWT_REFRESH_SECRET should be different');
  }
};

/**
 * Validate Session configuration
 */
const validateSession = (result) => {
  if (!config.session.secret) {
    result.addError('SESSION_SECRET is required but not set');
  } else if (config.session.secret.length < 32) {
    result.addWarning('SESSION_SECRET should be at least 32 characters long for security');
  }
};

/**
 * Validate Cookie configuration
 */
const validateCookie = (result) => {
  if (!config.cookie.secret) {
    result.addWarning('COOKIE_SECRET is not set');
  }

  // Production-specific checks
  if (config.IS_PRODUCTION) {
    if (!config.cookie.secure) {
      result.addWarning('COOKIE_SECURE should be true in production (requires HTTPS)');
    }
    if (config.cookie.sameSite !== 'strict' && config.cookie.sameSite !== 'lax') {
      result.addWarning('COOKIE_SAME_SITE should be "strict" or "lax" in production');
    }
  }
};

/**
 * Validate Database configuration
 */
const validateDatabase = (result) => {
  if (!config.database.uri) {
    result.addError('MONGODB_URI is required but not set');
  } else if (config.database.uri.includes('localhost') && config.IS_PRODUCTION) {
    result.addWarning('Using localhost MongoDB in production - consider using a remote database');
  }

  // Connection pool validation
  if (config.database.minPoolSize > config.database.maxPoolSize) {
    result.addError('MONGODB_MIN_POOL_SIZE cannot be greater than MONGODB_MAX_POOL_SIZE');
  }
};

/**
 * Validate Email configuration
 */
const validateEmail = (result) => {
  if (!config.email.username) {
    result.addWarning('EMAIL_USERNAME is not set - email functionality will not work');
  }
  if (!config.email.password) {
    result.addWarning('EMAIL_PASSWORD is not set - email functionality will not work');
  }

  // Email from validation
  if (config.email.from && !config.email.from.includes('@')) {
    result.addWarning('EMAIL_FROM should be a valid email address');
  }
};

/**
 * Validate File Upload configuration
 */
const validateUpload = (result) => {
  // File size validation
  if (config.upload.maxVideoSize < config.upload.maxFileSize) {
    result.addWarning('MAX_VIDEO_SIZE should be larger than MAX_FILE_SIZE');
  }

  // Storage provider validation
  if (config.upload.storageProvider === 'cloudinary') {
    if (!config.cloudinary.cloudName || !config.cloudinary.apiKey || !config.cloudinary.apiSecret) {
      result.addWarning('Cloudinary storage is selected but credentials are not fully configured');
    }
  } else if (config.upload.storageProvider === 'aws-s3') {
    if (!config.aws.accessKeyId || !config.aws.secretAccessKey || !config.aws.s3Bucket) {
      result.addWarning('AWS S3 storage is selected but credentials are not fully configured');
    }
  }
};

/**
 * Validate Payment Gateway configuration
 */
const validatePayment = (result) => {
  // Stripe validation
  if (config.payment.stripe.enabled) {
    if (!config.payment.stripe.secretKey) {
      result.addError('Stripe is enabled but STRIPE_SECRET_KEY is not set');
    }
    if (!config.payment.stripe.webhookSecret) {
      result.addWarning('STRIPE_WEBHOOK_SECRET is not set - webhook verification will fail');
    }
  }

  // PayPal validation
  if (config.payment.paypal.enabled) {
    if (!config.payment.paypal.clientId || !config.payment.paypal.clientSecret) {
      result.addError('PayPal is enabled but credentials are not fully configured');
    }
  }

  // SSLCommerz validation
  if (config.payment.sslcommerz.enabled) {
    if (!config.payment.sslcommerz.storeId || !config.payment.sslcommerz.storePassword) {
      result.addError('SSLCommerz is enabled but credentials are not fully configured');
    }
  }

  // At least one payment gateway should be enabled in production
  if (config.IS_PRODUCTION) {
    const hasPaymentGateway = config.payment.stripe.enabled ||
                             config.payment.paypal.enabled ||
                             config.payment.sslcommerz.enabled;
    if (!hasPaymentGateway) {
      result.addWarning('No payment gateway is enabled in production');
    }
  }
};

/**
 * Validate OAuth configuration
 */
const validateOAuth = (result) => {
  // Google OAuth
  if (config.oauth.google.enabled) {
    if (!config.oauth.google.clientId || !config.oauth.google.clientSecret) {
      result.addWarning('Google OAuth is enabled but credentials are not fully configured');
    }
  }

  // Facebook OAuth
  if (config.oauth.facebook.enabled) {
    if (!config.oauth.facebook.appId || !config.oauth.facebook.appSecret) {
      result.addWarning('Facebook OAuth is enabled but credentials are not fully configured');
    }
  }

  // GitHub OAuth
  if (config.oauth.github.enabled) {
    if (!config.oauth.github.clientId || !config.oauth.github.clientSecret) {
      result.addWarning('GitHub OAuth is enabled but credentials are not fully configured');
    }
  }
};

/**
 * Validate Redis configuration
 */
const validateRedis = (result) => {
  if (config.redis.enabled) {
    if (!config.redis.url && (!config.redis.host || !config.redis.port)) {
      result.addError('Redis is enabled but connection details are not configured');
    }

    if (config.IS_PRODUCTION && !config.redis.password) {
      result.addWarning('Redis password is not set in production - security risk');
    }
  }
};

/**
 * Validate CORS configuration
 */
const validateCORS = (result) => {
  if (!config.cors.origin || config.cors.origin.length === 0) {
    result.addWarning('CORS_ORIGIN is not configured - API may be inaccessible from frontend');
  }

  if (config.IS_PRODUCTION) {
    const hasWildcard = config.cors.origin.some(origin => origin === '*');
    if (hasWildcard) {
      result.addWarning('CORS is configured to allow all origins (*) in production - security risk');
    }

    const hasLocalhost = config.cors.origin.some(origin => origin.includes('localhost'));
    if (hasLocalhost) {
      result.addWarning('CORS includes localhost in production - should use production domain');
    }
  }
};

/**
 * Validate Security Headers configuration
 */
const validateSecurityHeaders = (result) => {
  if (config.IS_PRODUCTION) {
    if (!config.securityHeaders.hsts.enabled) {
      result.addWarning('HSTS is not enabled in production - security risk');
    }

    if (!config.securityHeaders.csp.enabled) {
      result.addWarning('CSP is not enabled in production - XSS protection reduced');
    }
  }
};

/**
 * Validate SSL configuration
 */
const validateSSL = (result) => {
  if (config.IS_PRODUCTION && !config.ssl.enabled) {
    result.addInfo('SSL is not enabled - ensure you are using HTTPS via reverse proxy (nginx, load balancer)');
  }

  if (config.ssl.enabled) {
    if (!config.ssl.keyPath || !config.ssl.certPath) {
      result.addError('SSL is enabled but certificate paths are not configured');
    }
  }
};

/**
 * Validate Logging configuration
 */
const validateLogging = (result) => {
  if (config.IS_PRODUCTION) {
    if (config.logging.level === 'debug' || config.logging.level === 'silly') {
      result.addWarning('Log level is set to debug/silly in production - may impact performance');
    }

    if (!config.logging.file.enabled) {
      result.addWarning('File logging is disabled in production - logs may be lost');
    }

    if (!config.logging.audit.enabled) {
      result.addWarning('Audit logging is disabled in production - compliance risk');
    }
  }
};

/**
 * Validate Monitoring configuration
 */
const validateMonitoring = (result) => {
  if (config.IS_PRODUCTION) {
    const hasMonitoring = config.monitoring.sentry.enabled || config.monitoring.newRelic.enabled;
    if (!hasMonitoring) {
      result.addInfo('No monitoring service (Sentry, New Relic) is enabled in production');
    }
  }

  if (config.monitoring.sentry.enabled && !config.monitoring.sentry.dsn) {
    result.addError('Sentry is enabled but SENTRY_DSN is not configured');
  }

  if (config.monitoring.newRelic.enabled && !config.monitoring.newRelic.licenseKey) {
    result.addError('New Relic is enabled but license key is not configured');
  }
};

/**
 * Validate Feature Flags
 */
const validateFeatures = (result) => {
  if (config.features.certificates && !config.certificate.enabled) {
    result.addWarning('Certificate feature is enabled but certificate generation is disabled');
  }
};

/**
 * Validate Cron Jobs
 */
const validateCron = (result) => {
  if (config.cron.enabled && config.database.backup.enabled) {
    result.addInfo('Database backup cron job is enabled');
  }
};

/**
 * Main validation function
 */
const validateEnvironment = (options = {}) => {
  const { throwOnError = false, verbose = true } = options;
  const result = new ValidationResult();

  // Environment info
  result.addInfo(`Environment: ${config.NODE_ENV}`);
  result.addInfo(`Server: ${config.server.host}:${config.server.port}`);
  result.addInfo(`Database: ${config.database.uri.replace(/\/\/.*@/, '//***:***@')}`); // Hide credentials

  // Run all validators
  validateJWT(result);
  validateSession(result);
  validateCookie(result);
  validateDatabase(result);
  validateEmail(result);
  validateUpload(result);
  validatePayment(result);
  validateOAuth(result);
  validateRedis(result);
  validateCORS(result);
  validateSecurityHeaders(result);
  validateSSL(result);
  validateLogging(result);
  validateMonitoring(result);
  validateFeatures(result);
  validateCron(result);

  // Print results if verbose
  if (verbose) {
    console.log('\n' + '='.repeat(60));
    console.log('🔍 Environment Configuration Validation');
    console.log('='.repeat(60) + '\n');

    // Print info
    if (result.info.length > 0) {
      console.log('ℹ️  Information:');
      result.info.forEach(msg => console.log(`   ${msg}`));
      console.log('');
    }

    // Print warnings
    if (result.warnings.length > 0) {
      console.log('⚠️  Warnings:');
      result.warnings.forEach(msg => console.log(`   ${msg}`));
      console.log('');
    }

    // Print errors
    if (result.errors.length > 0) {
      console.log('❌ Errors:');
      result.errors.forEach(msg => console.log(`   ${msg}`));
      console.log('');
    }

    // Summary
    if (result.isValid) {
      console.log('✅ Environment configuration is valid!\n');
    } else {
      console.log(`❌ Environment configuration has ${result.errors.length} error(s)\n`);
    }

    console.log('='.repeat(60) + '\n');
  }

  // Throw error if requested and validation failed
  if (throwOnError && !result.isValid) {
    throw new Error(`Environment validation failed with ${result.errors.length} error(s)`);
  }

  return result;
};

/**
 * Express middleware for environment health check
 */
const envHealthCheck = (req, res) => {
  const result = validateEnvironment({ verbose: false });

  const statusCode = result.isValid ? 200 : 503;
  const status = result.isValid ? 'healthy' : 'unhealthy';

  res.status(statusCode).json({
    status,
    environment: config.NODE_ENV,
    validation: result.toJSON(),
  });
};

/**
 * Middleware to check if environment is properly configured
 * Runs on every request (lightweight version)
 */
const requireValidEnvironment = (req, res, next) => {
  // Only check critical variables on each request
  if (!config.jwt.secret) {
    return res.status(500).json({
      status: 'error',
      message: 'Server configuration error - JWT secret not configured',
    });
  }

  if (!config.database.uri) {
    return res.status(500).json({
      status: 'error',
      message: 'Server configuration error - Database not configured',
    });
  }

  next();
};

/**
 * Startup validation - validates environment and exits if critical errors in production
 */
const validateOnStartup = () => {
  const result = validateEnvironment({ verbose: true });

  // In production, exit if there are critical errors
  if (config.IS_PRODUCTION && !result.isValid) {
    console.error('\n❌ CRITICAL: Environment configuration has errors. Exiting...\n');
    process.exit(1);
  }

  // In development, just warn
  if (config.IS_DEVELOPMENT && result.hasIssues()) {
    console.warn('\n⚠️  Environment configuration has issues. Please review.\n');
  }

  return result;
};

module.exports = {
  validateEnvironment,
  envHealthCheck,
  requireValidEnvironment,
  validateOnStartup,
  ValidationResult,
};
