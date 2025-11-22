const rateLimit = require('express-rate-limit');
const MongoStore = require('rate-limit-mongo');
const securityConfig = require('../config/security.config');

/**
 * Rate Limiting Middleware
 *
 * Provides endpoint-specific rate limiting to prevent abuse and DDoS attacks.
 * Uses MongoDB for distributed rate limiting (works with multiple server instances).
 */

/**
 * Create a rate limiter with custom configuration
 */
const createRateLimiter = (config) => {
  const options = {
    ...config,
    standardHeaders: true,
    legacyHeaders: false,
    // Use MongoDB store for distributed rate limiting
    store: process.env.MONGODB_URI
      ? new MongoStore({
          uri: process.env.MONGODB_URI,
          collectionName: 'rateLimits',
          expireTimeMs: config.windowMs,
        })
      : undefined, // Use memory store in development if MongoDB not available
    // Key generator (use IP address)
    keyGenerator: (req) => {
      return req.ip || req.connection.remoteAddress;
    },
    // Skip requests from whitelisted IPs
    skip: (req) => {
      const ip = req.ip || req.connection.remoteAddress;
      return securityConfig.ipControl.whitelist.includes(ip);
    },
    // Handler for rate limit exceeded
    handler: (req, res) => {
      res.status(429).json({
        status: 'error',
        message: config.message || 'Too many requests, please try again later.',
        retryAfter: Math.ceil(config.windowMs / 1000), // seconds
      });
    },
  };

  return rateLimit(options);
};

/**
 * Global rate limiter (applied to all /api routes)
 */
const globalLimiter = createRateLimiter(securityConfig.rateLimit.global);

/**
 * Auth rate limiter (stricter for authentication endpoints)
 */
const authLimiter = createRateLimiter(securityConfig.rateLimit.auth);

/**
 * Password reset rate limiter (very strict)
 */
const passwordResetLimiter = createRateLimiter(securityConfig.rateLimit.passwordReset);

/**
 * File upload rate limiter
 */
const uploadLimiter = createRateLimiter(securityConfig.rateLimit.upload);

/**
 * Payment rate limiter
 */
const paymentLimiter = createRateLimiter(securityConfig.rateLimit.payment);

/**
 * Email rate limiter
 */
const emailLimiter = createRateLimiter(securityConfig.rateLimit.email);

/**
 * Create a custom rate limiter with specific configuration
 */
const customLimiter = (windowMs, max, message) => {
  return createRateLimiter({
    windowMs,
    max,
    message: message || 'Too many requests, please try again later.',
  });
};

/**
 * IP-based blocking middleware
 */
const ipBlocker = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;

  // Check if IP is blacklisted
  if (securityConfig.ipControl.blacklist.includes(ip)) {
    return res.status(403).json({
      status: 'error',
      message: 'Access denied',
    });
  }

  next();
};

/**
 * Suspicious activity detector
 */
const suspiciousActivityDetector = (req, res, next) => {
  // Check for common attack patterns
  const suspiciousPatterns = [
    /(\.\.[\/\\])+/i,  // Directory traversal
    /<script[\s\S]*?>[\s\S]*?<\/script>/gi, // Script tags
    /union[\s]+select/i, // SQL injection
    /javascript:/i, // JavaScript protocol
    /\$where/i, // MongoDB injection
  ];

  const checkString = (str) => {
    if (typeof str !== 'string') return false;
    return suspiciousPatterns.some(pattern => pattern.test(str));
  };

  // Check URL
  if (checkString(req.originalUrl)) {
    console.warn(`[Security] Suspicious URL pattern detected: ${req.originalUrl} from IP: ${req.ip}`);
    return res.status(400).json({
      status: 'error',
      message: 'Invalid request',
    });
  }

  // Check query parameters
  if (req.query) {
    for (const [key, value] of Object.entries(req.query)) {
      if (checkString(value)) {
        console.warn(`[Security] Suspicious query parameter detected: ${key}=${value} from IP: ${req.ip}`);
        return res.status(400).json({
          status: 'error',
          message: 'Invalid request parameters',
        });
      }
    }
  }

  // Check body
  if (req.body && typeof req.body === 'object') {
    const checkObject = (obj, path = '') => {
      for (const [key, value] of Object.entries(obj)) {
        const currentPath = path ? `${path}.${key}` : key;
        if (checkString(value)) {
          console.warn(`[Security] Suspicious body content detected: ${currentPath} from IP: ${req.ip}`);
          return true;
        }
        if (typeof value === 'object' && value !== null) {
          if (checkObject(value, currentPath)) {
            return true;
          }
        }
      }
      return false;
    };

    if (checkObject(req.body)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid request data',
      });
    }
  }

  next();
};

/**
 * Request size limiter
 */
const requestSizeLimiter = (req, res, next) => {
  const contentLength = req.headers['content-length'];

  if (contentLength) {
    const sizeInMB = parseInt(contentLength) / (1024 * 1024);
    const maxSizeInMB = parseInt(securityConfig.validation.bodyLimit) || 10;

    if (sizeInMB > maxSizeInMB) {
      return res.status(413).json({
        status: 'error',
        message: `Request body too large. Maximum size: ${maxSizeInMB}MB`,
      });
    }
  }

  next();
};

module.exports = {
  globalLimiter,
  authLimiter,
  passwordResetLimiter,
  uploadLimiter,
  paymentLimiter,
  emailLimiter,
  customLimiter,
  ipBlocker,
  suspiciousActivityDetector,
  requestSizeLimiter,
};
