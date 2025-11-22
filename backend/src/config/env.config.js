/**
 * Environment Configuration Module
 *
 * Centralizes environment variable loading, validation, and access.
 * Provides type-safe configuration objects organized by concern.
 *
 * Usage:
 *   const { server, database, jwt } = require('./config/env.config');
 *   console.log(`Server running on port ${server.port}`);
 */

require('dotenv').config();

/**
 * Get environment variable with optional default value
 * @param {string} key - Environment variable name
 * @param {*} defaultValue - Default value if not set
 * @returns {string} Environment variable value
 */
const getEnv = (key, defaultValue = '') => {
  return process.env[key] || defaultValue;
};

/**
 * Get boolean environment variable
 * @param {string} key - Environment variable name
 * @param {boolean} defaultValue - Default value
 * @returns {boolean} Boolean value
 */
const getBoolEnv = (key, defaultValue = false) => {
  const value = process.env[key];
  if (value === undefined || value === '') return defaultValue;
  return value.toLowerCase() === 'true' || value === '1';
};

/**
 * Get integer environment variable
 * @param {string} key - Environment variable name
 * @param {number} defaultValue - Default value
 * @returns {number} Integer value
 */
const getIntEnv = (key, defaultValue = 0) => {
  const value = process.env[key];
  if (value === undefined || value === '') return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

/**
 * Get array from comma-separated environment variable
 * @param {string} key - Environment variable name
 * @param {string[]} defaultValue - Default value
 * @returns {string[]} Array of values
 */
const getArrayEnv = (key, defaultValue = []) => {
  const value = process.env[key];
  if (!value) return defaultValue;
  return value.split(',').map(item => item.trim()).filter(Boolean);
};

/**
 * Validate required environment variables
 * @param {string[]} requiredVars - Array of required variable names
 * @throws {Error} If any required variable is missing
 */
const validateRequired = (requiredVars) => {
  const missing = requiredVars.filter(varName => !process.env[varName]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env file and ensure all required variables are set.'
    );
  }
};

// ===================================
// Environment
// ===================================
const NODE_ENV = getEnv('NODE_ENV', 'development');
const IS_PRODUCTION = NODE_ENV === 'production';
const IS_DEVELOPMENT = NODE_ENV === 'development';
const IS_TEST = NODE_ENV === 'test';

// ===================================
// Server Configuration
// ===================================
const server = {
  env: NODE_ENV,
  isProduction: IS_PRODUCTION,
  isDevelopment: IS_DEVELOPMENT,
  isTest: IS_TEST,
  port: getIntEnv('PORT', 5000),
  host: getEnv('HOST', 'localhost'),
  apiVersion: getEnv('API_VERSION', 'v1'),
  apiPrefix: getEnv('API_PREFIX', '/api'),
  backendUrl: getEnv('BACKEND_URL', 'http://localhost:5000'),
  frontendUrl: getEnv('FRONTEND_URL', 'http://localhost:3000'),
  timeout: getIntEnv('SERVER_TIMEOUT', 30000),
  trustProxy: getBoolEnv('TRUST_PROXY', false),
};

// ===================================
// Database Configuration
// ===================================
const database = {
  uri: getEnv('MONGODB_URI', 'mongodb://localhost:27017/lms_database'),
  testUri: getEnv('MONGODB_TEST_URI', 'mongodb://localhost:27017/lms_test_database'),
  poolSize: getIntEnv('MONGODB_POOL_SIZE', 10),
  maxPoolSize: getIntEnv('MONGODB_MAX_POOL_SIZE', 50),
  minPoolSize: getIntEnv('MONGODB_MIN_POOL_SIZE', 5),
  socketTimeout: getIntEnv('MONGODB_SOCKET_TIMEOUT', 45000),
  serverSelectionTimeout: getIntEnv('MONGODB_SERVER_SELECTION_TIMEOUT', 5000),
  backup: {
    enabled: getBoolEnv('DB_BACKUP_ENABLED', false),
    schedule: getEnv('DB_BACKUP_SCHEDULE', '0 2 * * *'),
    path: getEnv('DB_BACKUP_PATH', '/backups/mongodb'),
  },
};

// ===================================
// JWT Configuration
// ===================================
const jwt = {
  secret: getEnv('JWT_SECRET'),
  expiresIn: getEnv('JWT_EXPIRES_IN', '15m'),
  refreshSecret: getEnv('JWT_REFRESH_SECRET'),
  refreshExpiresIn: getEnv('JWT_REFRESH_EXPIRES_IN', '7d'),
  algorithm: getEnv('JWT_ALGORITHM', 'HS256'),
};

// ===================================
// Session Configuration
// ===================================
const session = {
  secret: getEnv('SESSION_SECRET'),
  name: getEnv('SESSION_NAME', 'lms.sid'),
  maxAge: getIntEnv('SESSION_MAX_AGE', 86400000),
  resave: false,
  saveUninitialized: false,
};

// ===================================
// Cookie Configuration
// ===================================
const cookie = {
  secret: getEnv('COOKIE_SECRET'),
  secure: getBoolEnv('COOKIE_SECURE', IS_PRODUCTION),
  sameSite: getEnv('COOKIE_SAME_SITE', 'lax'),
  httpOnly: getBoolEnv('COOKIE_HTTP_ONLY', true),
  domain: getEnv('COOKIE_DOMAIN', 'localhost'),
};

// ===================================
// Security Configuration
// ===================================
const security = {
  bcryptSaltRounds: getIntEnv('BCRYPT_SALT_ROUNDS', 12),
  maxLoginAttempts: getIntEnv('MAX_LOGIN_ATTEMPTS', 5),
  lockoutDuration: getIntEnv('LOCKOUT_DURATION', 900000),
  passwordResetExpires: getIntEnv('PASSWORD_RESET_EXPIRES', 3600000),
  enable2FA: getBoolEnv('ENABLE_2FA', false),
  totpIssuer: getEnv('TOTP_ISSUER', 'LMS Platform'),
  totpWindow: getIntEnv('TOTP_WINDOW', 1),
};

// ===================================
// CORS Configuration
// ===================================
const cors = {
  origin: getArrayEnv('CORS_ORIGIN', ['http://localhost:3000']),
  credentials: getBoolEnv('CORS_CREDENTIALS', true),
  methods: getArrayEnv('CORS_METHODS', ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE']),
  allowedHeaders: getArrayEnv('CORS_ALLOWED_HEADERS', ['Content-Type', 'Authorization', 'X-Requested-With']),
  exposedHeaders: getArrayEnv('CORS_EXPOSED_HEADERS', ['Content-Range', 'X-Content-Range']),
  maxAge: getIntEnv('CORS_MAX_AGE', 86400),
};

// ===================================
// Rate Limiting Configuration
// ===================================
const rateLimit = {
  global: {
    windowMs: getIntEnv('RATE_LIMIT_WINDOW_MS', 900000),
    max: getIntEnv('RATE_LIMIT_MAX_REQUESTS', 100),
    message: getEnv('RATE_LIMIT_MESSAGE', 'Too many requests, please try again later'),
  },
  auth: {
    windowMs: getIntEnv('AUTH_RATE_LIMIT_WINDOW_MS', 900000),
    max: getIntEnv('AUTH_RATE_LIMIT_MAX_REQUESTS', 5),
  },
  passwordReset: {
    windowMs: getIntEnv('PASSWORD_RESET_RATE_LIMIT_WINDOW_MS', 3600000),
    max: getIntEnv('PASSWORD_RESET_RATE_LIMIT_MAX_REQUESTS', 3),
  },
  upload: {
    windowMs: getIntEnv('UPLOAD_RATE_LIMIT_WINDOW_MS', 3600000),
    max: getIntEnv('UPLOAD_RATE_LIMIT_MAX_REQUESTS', 50),
  },
  payment: {
    windowMs: getIntEnv('PAYMENT_RATE_LIMIT_WINDOW_MS', 3600000),
    max: getIntEnv('PAYMENT_RATE_LIMIT_MAX_REQUESTS', 10),
  },
};

// ===================================
// Email Configuration
// ===================================
const email = {
  service: getEnv('EMAIL_SERVICE', 'gmail'),
  host: getEnv('EMAIL_HOST', 'smtp.gmail.com'),
  port: getIntEnv('EMAIL_PORT', 587),
  secure: getBoolEnv('EMAIL_SECURE', false),
  username: getEnv('EMAIL_USERNAME'),
  password: getEnv('EMAIL_PASSWORD'),
  from: getEnv('EMAIL_FROM', 'noreply@yourlms.com'),
  fromName: getEnv('EMAIL_FROM_NAME', 'LMS Platform'),
  templateDir: getEnv('EMAIL_TEMPLATE_DIR', 'src/templates/emails'),
  verificationExpires: getIntEnv('EMAIL_VERIFICATION_EXPIRES', 86400000),
  queue: {
    enabled: getBoolEnv('EMAIL_QUEUE_ENABLED', false),
    concurrency: getIntEnv('EMAIL_QUEUE_CONCURRENCY', 5),
  },
};

// ===================================
// File Upload Configuration
// ===================================
const upload = {
  maxFileSize: getIntEnv('MAX_FILE_SIZE', 10485760),
  maxVideoSize: getIntEnv('MAX_VIDEO_SIZE', 104857600),
  maxImageSize: getIntEnv('MAX_IMAGE_SIZE', 5242880),
  maxDocumentSize: getIntEnv('MAX_DOCUMENT_SIZE', 10485760),
  allowedTypes: getArrayEnv('ALLOWED_FILE_TYPES', ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx']),
  allowedImageTypes: getArrayEnv('ALLOWED_IMAGE_TYPES', ['jpg', 'jpeg', 'png', 'gif', 'webp']),
  allowedVideoTypes: getArrayEnv('ALLOWED_VIDEO_TYPES', ['mp4', 'mpeg', 'mov', 'avi', 'webm']),
  allowedDocumentTypes: getArrayEnv('ALLOWED_DOCUMENT_TYPES', ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx']),
  storageProvider: getEnv('STORAGE_PROVIDER', 'cloudinary'),
  localDir: getEnv('LOCAL_UPLOAD_DIR', 'uploads'),
  localPath: getEnv('LOCAL_UPLOAD_PATH', '/var/www/lms/uploads'),
};

// ===================================
// Cloudinary Configuration
// ===================================
const cloudinary = {
  cloudName: getEnv('CLOUDINARY_CLOUD_NAME'),
  apiKey: getEnv('CLOUDINARY_API_KEY'),
  apiSecret: getEnv('CLOUDINARY_API_SECRET'),
  folder: getEnv('CLOUDINARY_FOLDER', 'lms'),
  secure: getBoolEnv('CLOUDINARY_SECURE', true),
};

// ===================================
// AWS S3 Configuration
// ===================================
const aws = {
  accessKeyId: getEnv('AWS_ACCESS_KEY_ID'),
  secretAccessKey: getEnv('AWS_SECRET_ACCESS_KEY'),
  region: getEnv('AWS_REGION', 'us-east-1'),
  s3Bucket: getEnv('AWS_S3_BUCKET'),
  s3ACL: getEnv('AWS_S3_ACL', 'public-read'),
};

// ===================================
// Payment Gateways
// ===================================
const payment = {
  stripe: {
    enabled: getBoolEnv('STRIPE_ENABLED', false),
    publicKey: getEnv('STRIPE_PUBLIC_KEY'),
    secretKey: getEnv('STRIPE_SECRET_KEY'),
    webhookSecret: getEnv('STRIPE_WEBHOOK_SECRET'),
    currency: getEnv('STRIPE_CURRENCY', 'usd'),
    successUrl: getEnv('STRIPE_SUCCESS_URL', 'http://localhost:3000/payment/success'),
    cancelUrl: getEnv('STRIPE_CANCEL_URL', 'http://localhost:3000/payment/cancel'),
  },
  paypal: {
    enabled: getBoolEnv('PAYPAL_ENABLED', false),
    mode: getEnv('PAYPAL_MODE', 'sandbox'),
    clientId: getEnv('PAYPAL_CLIENT_ID'),
    clientSecret: getEnv('PAYPAL_CLIENT_SECRET'),
    currency: getEnv('PAYPAL_CURRENCY', 'USD'),
    returnUrl: getEnv('PAYPAL_RETURN_URL', 'http://localhost:3000/payment/success'),
    cancelUrl: getEnv('PAYPAL_CANCEL_URL', 'http://localhost:3000/payment/cancel'),
  },
  sslcommerz: {
    enabled: getBoolEnv('SSLCOMMERZ_ENABLED', false),
    storeId: getEnv('SSLCOMMERZ_STORE_ID'),
    storePassword: getEnv('SSLCOMMERZ_STORE_PASSWORD'),
    mode: getEnv('SSLCOMMERZ_MODE', 'sandbox'),
    successUrl: getEnv('SSLCOMMERZ_SUCCESS_URL', 'http://localhost:3000/payment/success'),
    failUrl: getEnv('SSLCOMMERZ_FAIL_URL', 'http://localhost:3000/payment/fail'),
    cancelUrl: getEnv('SSLCOMMERZ_CANCEL_URL', 'http://localhost:3000/payment/cancel'),
    ipnUrl: getEnv('SSLCOMMERZ_IPN_URL', 'http://localhost:5000/api/v1/payment/ipn'),
  },
  platformFeePercentage: getIntEnv('PLATFORM_FEE_PERCENTAGE', 10),
};

// ===================================
// OAuth Configuration
// ===================================
const oauth = {
  google: {
    enabled: getBoolEnv('GOOGLE_ENABLED', false),
    clientId: getEnv('GOOGLE_CLIENT_ID'),
    clientSecret: getEnv('GOOGLE_CLIENT_SECRET'),
    callbackUrl: getEnv('GOOGLE_CALLBACK_URL', 'http://localhost:5000/api/v1/auth/google/callback'),
  },
  facebook: {
    enabled: getBoolEnv('FACEBOOK_ENABLED', false),
    appId: getEnv('FACEBOOK_APP_ID'),
    appSecret: getEnv('FACEBOOK_APP_SECRET'),
    callbackUrl: getEnv('FACEBOOK_CALLBACK_URL', 'http://localhost:5000/api/v1/auth/facebook/callback'),
  },
  github: {
    enabled: getBoolEnv('GITHUB_ENABLED', false),
    clientId: getEnv('GITHUB_CLIENT_ID'),
    clientSecret: getEnv('GITHUB_CLIENT_SECRET'),
    callbackUrl: getEnv('GITHUB_CALLBACK_URL', 'http://localhost:5000/api/v1/auth/github/callback'),
  },
};

// ===================================
// Redis Configuration
// ===================================
const redis = {
  enabled: getBoolEnv('REDIS_ENABLED', false),
  host: getEnv('REDIS_HOST', 'localhost'),
  port: getIntEnv('REDIS_PORT', 6379),
  password: getEnv('REDIS_PASSWORD'),
  db: getIntEnv('REDIS_DB', 0),
  url: getEnv('REDIS_URL', 'redis://localhost:6379'),
  session: {
    prefix: getEnv('REDIS_SESSION_PREFIX', 'sess:'),
    ttl: getIntEnv('REDIS_SESSION_TTL', 86400),
  },
  cache: {
    prefix: getEnv('REDIS_CACHE_PREFIX', 'cache:'),
    ttl: getIntEnv('REDIS_CACHE_TTL', 3600),
  },
};

// ===================================
// Logging Configuration
// ===================================
const logging = {
  level: getEnv('LOG_LEVEL', IS_PRODUCTION ? 'info' : 'debug'),
  format: getEnv('LOG_FORMAT', 'json'),
  dir: getEnv('LOG_DIR', 'logs'),
  maxSize: getEnv('LOG_MAX_SIZE', '10m'),
  maxFiles: getEnv('LOG_MAX_FILES', '14d'),
  console: {
    enabled: getBoolEnv('LOG_CONSOLE_ENABLED', true),
    level: getEnv('LOG_CONSOLE_LEVEL', IS_PRODUCTION ? 'info' : 'debug'),
  },
  file: {
    enabled: getBoolEnv('LOG_FILE_ENABLED', IS_PRODUCTION),
    errorFile: getEnv('LOG_ERROR_FILE', 'logs/error.log'),
    combinedFile: getEnv('LOG_COMBINED_FILE', 'logs/combined.log'),
    accessFile: getEnv('LOG_ACCESS_FILE', 'logs/access.log'),
  },
  audit: {
    enabled: getBoolEnv('AUDIT_LOG_ENABLED', IS_PRODUCTION),
    file: getEnv('AUDIT_LOG_FILE', 'logs/audit.log'),
    events: getArrayEnv('AUDIT_LOG_EVENTS', ['login', 'logout', 'create', 'update', 'delete', 'payment']),
  },
};

// ===================================
// Monitoring Configuration
// ===================================
const monitoring = {
  sentry: {
    enabled: getBoolEnv('SENTRY_ENABLED', false),
    dsn: getEnv('SENTRY_DSN'),
    environment: getEnv('SENTRY_ENVIRONMENT', NODE_ENV),
    tracesSampleRate: parseFloat(getEnv('SENTRY_TRACES_SAMPLE_RATE', '1.0')),
  },
  newRelic: {
    enabled: getBoolEnv('NEW_RELIC_ENABLED', false),
    licenseKey: getEnv('NEW_RELIC_LICENSE_KEY'),
    appName: getEnv('NEW_RELIC_APP_NAME', 'LMS-Backend'),
  },
};

// ===================================
// Security Headers Configuration
// ===================================
const securityHeaders = {
  csp: {
    enabled: getBoolEnv('CSP_ENABLED', true),
    directives: getEnv('CSP_DIRECTIVES', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"),
  },
  hsts: {
    enabled: getBoolEnv('HSTS_ENABLED', IS_PRODUCTION),
    maxAge: getIntEnv('HSTS_MAX_AGE', 31536000),
    includeSubDomains: getBoolEnv('HSTS_INCLUDE_SUBDOMAINS', true),
    preload: getBoolEnv('HSTS_PRELOAD', false),
  },
  xFrameOptions: getEnv('X_FRAME_OPTIONS', 'DENY'),
  xContentTypeOptions: getEnv('X_CONTENT_TYPE_OPTIONS', 'nosniff'),
  xXSSProtection: getEnv('X_XSS_PROTECTION', '1; mode=block'),
  referrerPolicy: getEnv('REFERRER_POLICY', 'strict-origin-when-cross-origin'),
};

// ===================================
// IP Control Configuration
// ===================================
const ipControl = {
  whitelist: getArrayEnv('IP_WHITELIST', []),
  blacklist: getArrayEnv('IP_BLACKLIST', []),
  rateLimiting: getBoolEnv('IP_RATE_LIMITING', true),
};

// ===================================
// Caching Configuration
// ===================================
const cache = {
  enabled: getBoolEnv('CACHE_ENABLED', true),
  ttl: getIntEnv('CACHE_TTL', 3600),
  provider: getEnv('CACHE_PROVIDER', 'memory'),
  api: {
    enabled: getBoolEnv('API_CACHE_ENABLED', true),
    ttl: getIntEnv('API_CACHE_TTL', 300),
  },
  static: {
    maxAge: getIntEnv('STATIC_CACHE_MAX_AGE', 86400),
  },
};

// ===================================
// Certificate Configuration
// ===================================
const certificate = {
  enabled: getBoolEnv('CERTIFICATE_ENABLED', true),
  templatePath: getEnv('CERTIFICATE_TEMPLATE_PATH', 'src/templates/certificates'),
  outputDir: getEnv('CERTIFICATE_OUTPUT_DIR', 'certificates'),
  signatureName: getEnv('CERTIFICATE_SIGNATURE_NAME', 'Dr. John Doe'),
  signatureTitle: getEnv('CERTIFICATE_SIGNATURE_TITLE', 'CEO & Founder'),
  organization: getEnv('CERTIFICATE_ORGANIZATION', 'LMS Platform'),
};

// ===================================
// Video Configuration
// ===================================
const video = {
  streamingEnabled: getBoolEnv('VIDEO_STREAMING_ENABLED', true),
  chunkSize: getIntEnv('VIDEO_CHUNK_SIZE', 1048576),
  qualityOptions: getArrayEnv('VIDEO_QUALITY_OPTIONS', ['360p', '480p', '720p', '1080p']),
  ffmpeg: {
    enabled: getBoolEnv('FFMPEG_ENABLED', false),
    path: getEnv('FFMPEG_PATH', '/usr/bin/ffmpeg'),
    transcodeEnabled: getBoolEnv('VIDEO_TRANSCODE_ENABLED', false),
  },
};

// ===================================
// Search Configuration
// ===================================
const search = {
  elasticsearch: {
    enabled: getBoolEnv('ELASTICSEARCH_ENABLED', false),
    node: getEnv('ELASTICSEARCH_NODE', 'http://localhost:9200'),
    index: getEnv('ELASTICSEARCH_INDEX', 'lms'),
    username: getEnv('ELASTICSEARCH_USERNAME'),
    password: getEnv('ELASTICSEARCH_PASSWORD'),
  },
  algolia: {
    enabled: getBoolEnv('ALGOLIA_ENABLED', false),
    appId: getEnv('ALGOLIA_APP_ID'),
    adminKey: getEnv('ALGOLIA_ADMIN_KEY'),
    searchKey: getEnv('ALGOLIA_SEARCH_KEY'),
    index: getEnv('ALGOLIA_INDEX', 'courses'),
  },
};

// ===================================
// Notification Services
// ===================================
const notifications = {
  fcm: {
    enabled: getBoolEnv('FCM_ENABLED', false),
    serverKey: getEnv('FCM_SERVER_KEY'),
    senderId: getEnv('FCM_SENDER_ID'),
  },
  twilio: {
    enabled: getBoolEnv('TWILIO_ENABLED', false),
    accountSid: getEnv('TWILIO_ACCOUNT_SID'),
    authToken: getEnv('TWILIO_AUTH_TOKEN'),
    phoneNumber: getEnv('TWILIO_PHONE_NUMBER'),
  },
  slack: {
    enabled: getBoolEnv('SLACK_ENABLED', false),
    webhookUrl: getEnv('SLACK_WEBHOOK_URL'),
  },
};

// ===================================
// API Documentation
// ===================================
const swagger = {
  enabled: getBoolEnv('SWAGGER_ENABLED', !IS_PRODUCTION),
  title: getEnv('SWAGGER_TITLE', 'LMS API Documentation'),
  description: getEnv('SWAGGER_DESCRIPTION', 'Comprehensive API documentation for Learning Management System'),
  version: getEnv('SWAGGER_VERSION', '1.0.0'),
  path: getEnv('SWAGGER_PATH', '/api-docs'),
  authRequired: getBoolEnv('SWAGGER_AUTH_REQUIRED', false),
};

// ===================================
// Analytics Configuration
// ===================================
const analytics = {
  googleAnalytics: {
    enabled: getBoolEnv('GOOGLE_ANALYTICS_ENABLED', false),
    id: getEnv('GOOGLE_ANALYTICS_ID'),
  },
  mixpanel: {
    enabled: getBoolEnv('MIXPANEL_ENABLED', false),
    token: getEnv('MIXPANEL_TOKEN'),
  },
};

// ===================================
// Development & Testing
// ===================================
const development = {
  debug: getBoolEnv('DEBUG', IS_DEVELOPMENT),
  debugSql: getBoolEnv('DEBUG_SQL', false),
  debugRoutes: getBoolEnv('DEBUG_ROUTES', false),
  useMockData: getBoolEnv('USE_MOCK_DATA', false),
  seedDatabase: getBoolEnv('SEED_DATABASE', false),
  testMode: getBoolEnv('TEST_MODE', IS_TEST),
  testTimeout: getIntEnv('TEST_TIMEOUT', 10000),
};

// ===================================
// Cron Jobs Configuration
// ===================================
const cron = {
  enabled: getBoolEnv('CRON_ENABLED', IS_PRODUCTION),
  cleanTokens: getEnv('CRON_CLEAN_TOKENS', '0 2 * * *'),
  generateCertificates: getEnv('CRON_GENERATE_CERTIFICATES', '0 3 * * *'),
  sendReminders: getEnv('CRON_SEND_REMINDERS', '0 */6 * * *'),
  dbBackup: getEnv('CRON_DB_BACKUP', '0 2 * * *'),
};

// ===================================
// SSL/TLS Configuration
// ===================================
const ssl = {
  enabled: getBoolEnv('SSL_ENABLED', false),
  keyPath: getEnv('SSL_KEY_PATH'),
  certPath: getEnv('SSL_CERT_PATH'),
  caPath: getEnv('SSL_CA_PATH'),
};

// ===================================
// Organization Settings
// ===================================
const organization = {
  name: getEnv('ORG_NAME', 'LMS Platform'),
  logoUrl: getEnv('ORG_LOGO_URL', 'https://yourdomain.com/logo.png'),
  supportEmail: getEnv('ORG_SUPPORT_EMAIL', 'support@yourlms.com'),
  adminEmail: getEnv('ORG_ADMIN_EMAIL', 'admin@yourlms.com'),
  contactPhone: getEnv('ORG_CONTACT_PHONE'),
  address: getEnv('ORG_ADDRESS'),
  website: getEnv('ORG_WEBSITE', 'https://yourlms.com'),
};

// ===================================
// Feature Flags
// ===================================
const features = {
  chat: getBoolEnv('FEATURE_CHAT_ENABLED', true),
  forum: getBoolEnv('FEATURE_FORUM_ENABLED', true),
  liveClasses: getBoolEnv('FEATURE_LIVE_CLASSES_ENABLED', false),
  certificates: getBoolEnv('FEATURE_CERTIFICATES_ENABLED', true),
  assignments: getBoolEnv('FEATURE_ASSIGNMENTS_ENABLED', true),
  quizzes: getBoolEnv('FEATURE_QUIZZES_ENABLED', true),
  gamification: getBoolEnv('FEATURE_GAMIFICATION_ENABLED', false),
  analyticsDashboard: getBoolEnv('FEATURE_ANALYTICS_DASHBOARD', true),
};

// ===================================
// Localization Configuration
// ===================================
const localization = {
  timezone: getEnv('TIMEZONE', 'UTC'),
  defaultLanguage: getEnv('DEFAULT_LANGUAGE', 'en'),
  supportedLanguages: getArrayEnv('SUPPORTED_LANGUAGES', ['en', 'es', 'fr', 'de', 'ar', 'bn']),
  dateFormat: getEnv('DATE_FORMAT', 'YYYY-MM-DD'),
  timeFormat: getEnv('TIME_FORMAT', 'HH:mm:ss'),
};

// ===================================
// Maintenance Mode
// ===================================
const maintenance = {
  enabled: getBoolEnv('MAINTENANCE_MODE', false),
  message: getEnv('MAINTENANCE_MESSAGE', 'We are currently performing scheduled maintenance. Please check back soon.'),
  allowedIPs: getArrayEnv('MAINTENANCE_ALLOWED_IPS', []),
};

// ===================================
// Validate Required Variables
// ===================================
const requiredVars = [];

// Only validate critical variables in production
if (IS_PRODUCTION) {
  requiredVars.push('JWT_SECRET', 'JWT_REFRESH_SECRET', 'SESSION_SECRET', 'COOKIE_SECRET');

  // Validate database URI
  if (!process.env.MONGODB_URI) {
    requiredVars.push('MONGODB_URI');
  }
}

// Validate required vars
if (requiredVars.length > 0) {
  try {
    validateRequired(requiredVars);
  } catch (error) {
    console.error('❌ Environment Configuration Error:', error.message);
    if (IS_PRODUCTION) {
      process.exit(1);
    }
  }
}

// ===================================
// Export Configuration
// ===================================
module.exports = {
  // Environment helpers
  getEnv,
  getBoolEnv,
  getIntEnv,
  getArrayEnv,
  validateRequired,

  // Configuration objects
  server,
  database,
  jwt,
  session,
  cookie,
  security,
  cors,
  rateLimit,
  email,
  upload,
  cloudinary,
  aws,
  payment,
  oauth,
  redis,
  logging,
  monitoring,
  securityHeaders,
  ipControl,
  cache,
  certificate,
  video,
  search,
  notifications,
  swagger,
  analytics,
  development,
  cron,
  ssl,
  organization,
  features,
  localization,
  maintenance,

  // Legacy/convenience exports
  NODE_ENV,
  IS_PRODUCTION,
  IS_DEVELOPMENT,
  IS_TEST,
};
