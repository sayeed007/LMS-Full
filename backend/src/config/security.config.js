/**
 * Security Configuration
 *
 * Centralized security settings for the LMS application.
 * This file contains all security-related configurations including
 * rate limiting, CORS, CSRF, headers, and validation rules.
 */

module.exports = {
  // Rate Limiting Configuration
  rateLimit: {
    // Global rate limit (applies to all /api routes)
    global: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // Limit each IP to 100 requests per windowMs
      message: 'Too many requests from this IP, please try again later.',
      standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
      legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    },

    // Authentication endpoints (stricter limits)
    auth: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5, // 5 attempts per 15 minutes
      message: 'Too many authentication attempts, please try again later.',
      skipSuccessfulRequests: true, // Don't count successful requests
    },

    // Password reset (very strict)
    passwordReset: {
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 3, // 3 attempts per hour
      message: 'Too many password reset attempts, please try again later.',
    },

    // File upload (moderate limit)
    upload: {
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 50, // 50 uploads per hour
      message: 'Too many file uploads, please try again later.',
    },

    // Payment endpoints (strict)
    payment: {
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 10, // 10 payment attempts per hour
      message: 'Too many payment attempts, please try again later.',
    },

    // Email sending (moderate)
    email: {
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 20, // 20 emails per hour
      message: 'Too many emails sent, please try again later.',
    },
  },

  // CORS Configuration
  cors: {
    // Allowed origins (should be set via environment variables)
    allowedOrigins: [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'Access-Control-Request-Method',
      'Access-Control-Request-Headers',
      'X-CSRF-Token', // For CSRF protection
    ],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 86400, // 24 hours
  },

  // Helmet Security Headers Configuration
  helmet: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Consider tightening in production
        connectSrc: ["'self'", process.env.FRONTEND_URL || 'http://localhost:3000'],
        frameSrc: ["'self'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
      },
    },
    crossOriginEmbedderPolicy: false, // Required for some features
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow cross-origin resources
  },

  // File Upload Security
  fileUpload: {
    // Maximum file size (in bytes)
    maxSize: {
      image: 5 * 1024 * 1024, // 5MB
      video: 100 * 1024 * 1024, // 100MB
      document: 10 * 1024 * 1024, // 10MB
      audio: 20 * 1024 * 1024, // 20MB
      default: 10 * 1024 * 1024, // 10MB
    },

    // Allowed MIME types
    allowedMimeTypes: {
      image: [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/svg+xml',
      ],
      video: [
        'video/mp4',
        'video/mpeg',
        'video/quicktime',
        'video/x-msvideo',
        'video/webm',
      ],
      document: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain',
      ],
      audio: [
        'audio/mpeg',
        'audio/wav',
        'audio/ogg',
        'audio/webm',
      ],
    },

    // Allowed file extensions
    allowedExtensions: {
      image: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
      video: ['.mp4', '.mpeg', '.mov', '.avi', '.webm'],
      document: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt'],
      audio: ['.mp3', '.wav', '.ogg', '.webm'],
    },
  },

  // Password Policy
  password: {
    minLength: 8,
    maxLength: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: false,
    preventCommonPasswords: true,
    // Common passwords to block
    commonPasswords: [
      'password', '12345678', 'password123', 'admin', 'admin123',
      'qwerty', 'letmein', 'welcome', 'monkey', '1234567890',
    ],
  },

  // Session Configuration
  session: {
    secret: process.env.SESSION_SECRET || 'your-session-secret-change-in-production',
    resave: false,
    saveUninitialized: false,
    name: 'lms.sid', // Custom session cookie name
    cookie: {
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      httpOnly: true, // Prevent XSS
      sameSite: 'lax', // CSRF protection
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      domain: process.env.COOKIE_DOMAIN || undefined,
    },
  },

  // JWT Configuration
  jwt: {
    accessTokenExpiry: '15m', // 15 minutes
    refreshTokenExpiry: '7d', // 7 days
    issuer: 'lms-platform',
    audience: 'lms-users',
  },

  // Request Validation
  validation: {
    // Maximum request body size
    bodyLimit: '10mb',
    // Maximum URL parameter length
    parameterLimit: 1000,
    // Allowed characters in IDs (MongoDB ObjectIDs)
    objectIdPattern: /^[0-9a-fA-F]{24}$/,
  },

  // IP Whitelist/Blacklist (optional)
  ipControl: {
    // IPs that are allowed to bypass rate limiting (admin IPs)
    whitelist: process.env.IP_WHITELIST ? process.env.IP_WHITELIST.split(',') : [],
    // IPs that are completely blocked
    blacklist: process.env.IP_BLACKLIST ? process.env.IP_BLACKLIST.split(',') : [],
  },

  // API Key Configuration (for external integrations)
  apiKeys: {
    headerName: 'X-API-Key',
    queryParamName: 'apiKey',
  },

  // Security Headers (additional custom headers)
  customHeaders: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  },

  // MongoDB Injection Prevention
  mongoSanitize: {
    replaceWith: '_', // Replace $ and . with _
    onSanitize: ({ req, key }) => {
      console.warn(`[Security] Potential MongoDB injection attempt in ${key}`);
    },
  },

  // XSS Prevention
  xss: {
    whiteList: {}, // No HTML allowed by default
    stripIgnoreTag: true,
    stripIgnoreTagBody: ['script', 'style'],
  },

  // Account Lockout Policy
  accountLockout: {
    maxFailedAttempts: 5, // Lock after 5 failed attempts
    lockoutDuration: 15 * 60 * 1000, // 15 minutes
    resetAfterSuccess: true, // Reset failed attempts after successful login
  },

  // Audit Logging
  auditLog: {
    enabled: true,
    sensitiveFields: [
      'password',
      'passwordConfirm',
      'token',
      'refreshToken',
      'apiKey',
      'secret',
      'creditCard',
    ],
    logFailedLogins: true,
    logSuccessfulLogins: false, // Set to true for high-security requirements
    logIpAddresses: true,
    logUserAgents: true,
  },

  // CSRF Protection
  csrf: {
    enabled: process.env.NODE_ENV === 'production',
    cookieName: 'XSRF-TOKEN',
    headerName: 'X-CSRF-Token',
    cookieOptions: {
      httpOnly: false, // Must be false so client can read it
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    },
  },

  // Two-Factor Authentication (future implementation)
  twoFactor: {
    enabled: false, // Set to true when implementing 2FA
    issuer: 'LMS Platform',
    windowSize: 1, // Allow 1 step before/after current time
  },
};
