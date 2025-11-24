/**
 * Performance Middleware
 *
 * Middleware for response compression, rate limiting, and performance optimization.
 *
 * Usage:
 *   const { compression, rateLimiter, helmet } = require('./middleware/performance');
 *
 *   app.use(compression());
 *   app.use(helmet());
 *   app.use('/api/', rateLimiter());
 */

const compressionMiddleware = require('compression');
const rateLimit = require('express-rate-limit');
const helmetMiddleware = require('helmet');
const logger = require('../config/logger');
const { logRateLimit } = require('./requestLogger');

/**
 * Compression middleware configuration
 * Compresses responses for better performance
 */
function compression() {
  return compressionMiddleware({
    // Compression level (0-9, 6 is default)
    level: 6,

    // Minimum response size to compress (in bytes)
    threshold: 1024, // 1KB

    // Filter function to determine if response should be compressed
    filter: (req, res) => {
      // Don't compress if client doesn't support it
      if (req.headers['x-no-compression']) {
        return false;
      }

      // Use default compression filter
      return compressionMiddleware.filter(req, res);
    },

    // Memory level (1-9, 8 is default)
    memLevel: 8,
  });
}

/**
 * API rate limiter
 * Prevents abuse by limiting requests per IP
 */
function rateLimiter(options = {}) {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    max = 100, // Limit each IP to 100 requests per windowMs
    message = 'Too many requests from this IP, please try again later',
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
  } = options;

  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      error: message,
    },
    standardHeaders: true, // Return rate limit info in headers
    legacyHeaders: false,
    skipSuccessfulRequests,
    skipFailedRequests,

    // Custom handler for rate limit exceeded
    handler: (req, res) => {
      logRateLimit(req);

      res.status(429).json({
        success: false,
        error: message,
        retryAfter: Math.ceil(windowMs / 1000),
      });
    },

    // Skip rate limiting for certain requests
    skip: (req) => {
      // Skip for health checks
      if (req.url === '/health' || req.url === '/api/health') {
        return true;
      }

      return false;
    },

    // Key generator (default is IP address)
    keyGenerator: (req) => {
      return req.ip || req.connection.remoteAddress;
    },

    // Store for rate limit data (in-memory by default)
    // For production, use Redis store
  });
}

/**
 * Strict rate limiter for authentication endpoints
 */
function authRateLimiter() {
  return rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts
    message: 'Too many authentication attempts, please try again later',
    skipSuccessfulRequests: true, // Don't count successful logins
  });
}

/**
 * Rate limiter for file uploads
 */
function uploadRateLimiter() {
  return rateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 uploads per hour
    message: 'Too many upload requests, please try again later',
  });
}

/**
 * Rate limiter for API endpoints
 */
function apiRateLimiter() {
  return rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per 15 minutes
    message: 'API rate limit exceeded, please try again later',
  });
}

/**
 * Helmet security middleware
 * Sets various HTTP headers for security
 */
function helmet() {
  return helmetMiddleware({
    // Content Security Policy
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https:'],
        scriptSrc: ["'self'", "'unsafe-inline'", 'https:'],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", 'https:'],
        fontSrc: ["'self'", 'https:', 'data:'],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'", 'https:'],
        frameSrc: ["'self'", 'https:'],
      },
    },

    // Cross-Origin-Embedder-Policy
    crossOriginEmbedderPolicy: false,

    // Cross-Origin-Opener-Policy
    crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },

    // Cross-Origin-Resource-Policy
    crossOriginResourcePolicy: { policy: 'cross-origin' },

    // Expect-CT
    expectCt: {
      enforce: true,
      maxAge: 30,
    },

    // Referrer-Policy
    referrerPolicy: { policy: 'no-referrer-when-downgrade' },

    // Strict-Transport-Security
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },

    // X-Content-Type-Options
    noSniff: true,

    // X-DNS-Prefetch-Control
    dnsPrefetchControl: { allow: false },

    // X-Download-Options
    ieNoOpen: true,

    // X-Frame-Options
    frameguard: { action: 'deny' },

    // X-Permitted-Cross-Domain-Policies
    permittedCrossDomainPolicies: { permittedPolicies: 'none' },

    // X-Powered-By
    hidePoweredBy: true,

    // X-XSS-Protection
    xssFilter: true,
  });
}

/**
 * Response time header middleware
 * Adds X-Response-Time header to responses
 */
function responseTime() {
  return (req, res, next) => {
    const startTime = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - startTime;
      res.setHeader('X-Response-Time', `${duration}ms`);

      // Log slow responses
      if (duration > 1000) {
        logger.warn('Slow response', {
          method: req.method,
          url: req.url,
          duration: `${duration}ms`,
          statusCode: res.statusCode,
        });
      }
    });

    next();
  };
}

/**
 * Request size limiter middleware
 * Limits the size of request bodies
 */
function requestSizeLimit(maxSize = '10mb') {
  const express = require('express');

  return [
    express.json({ limit: maxSize }),
    express.urlencoded({ extended: true, limit: maxSize }),
  ];
}

/**
 * Timeout middleware
 * Adds timeout to requests
 */
function timeout(ms = 30000) {
  return (req, res, next) => {
    req.setTimeout(ms, () => {
      logger.error('Request timeout', {
        method: req.method,
        url: req.url,
        timeout: ms,
      });

      res.status(408).json({
        success: false,
        error: 'Request timeout',
      });
    });

    res.setTimeout(ms, () => {
      logger.error('Response timeout', {
        method: req.method,
        url: req.url,
        timeout: ms,
      });
    });

    next();
  };
}

/**
 * HTTP/2 Server Push middleware
 * Pushes critical resources to client
 */
function http2ServerPush(resources = []) {
  return (req, res, next) => {
    if (res.push && resources.length > 0) {
      resources.forEach((resource) => {
        res.push(resource.path, {
          response: {
            'content-type': resource.type,
          },
        });
      });
    }

    next();
  };
}

/**
 * Preflight cache middleware
 * Caches CORS preflight responses
 */
function preflightCache() {
  return (req, res, next) => {
    if (req.method === 'OPTIONS') {
      res.set('Access-Control-Max-Age', '86400'); // 24 hours
    }
    next();
  };
}

/**
 * Connection keep-alive middleware
 * Enables keep-alive connections
 */
function keepAlive() {
  return (req, res, next) => {
    res.set('Connection', 'keep-alive');
    res.set('Keep-Alive', 'timeout=5, max=100');
    next();
  };
}

/**
 * Resource hints middleware
 * Adds resource hints to responses
 */
function resourceHints(hints = {}) {
  return (req, res, next) => {
    const {
      dnsPrefetch = [],
      preconnect = [],
      prefetch = [],
      preload = [],
    } = hints;

    const linkHeaders = [];

    dnsPrefetch.forEach((url) => {
      linkHeaders.push(`<${url}>; rel=dns-prefetch`);
    });

    preconnect.forEach((url) => {
      linkHeaders.push(`<${url}>; rel=preconnect`);
    });

    prefetch.forEach((url) => {
      linkHeaders.push(`<${url}>; rel=prefetch`);
    });

    preload.forEach(({ url, as }) => {
      linkHeaders.push(`<${url}>; rel=preload; as=${as}`);
    });

    if (linkHeaders.length > 0) {
      res.set('Link', linkHeaders.join(', '));
    }

    next();
  };
}

/**
 * Performance monitoring middleware
 * Tracks request performance metrics
 */
function performanceMonitoring() {
  return (req, res, next) => {
    const startTime = Date.now();
    const startMemory = process.memoryUsage().heapUsed;

    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const memoryUsed = process.memoryUsage().heapUsed - startMemory;

      // Log performance metrics
      logger.debug('Request performance', {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        memory: `${(memoryUsed / 1024 / 1024).toFixed(2)}MB`,
      });

      // Track metrics (can be sent to monitoring service)
      if (duration > 5000) {
        logger.warn('Very slow request detected', {
          method: req.method,
          url: req.url,
          duration: `${duration}ms`,
        });
      }
    });

    next();
  };
}

/**
 * Conditional GET middleware
 * Supports If-Modified-Since and If-None-Match
 */
function conditionalGet() {
  return (req, res, next) => {
    const originalJson = res.json.bind(res);

    res.json = function (data) {
      // Check If-None-Match (ETag)
      const etag = res.get('ETag');
      if (etag && req.headers['if-none-match'] === etag) {
        return res.status(304).end();
      }

      // Check If-Modified-Since
      const lastModified = res.get('Last-Modified');
      if (lastModified && req.headers['if-modified-since']) {
        const modifiedSince = new Date(req.headers['if-modified-since']);
        const lastMod = new Date(lastModified);

        if (lastMod <= modifiedSince) {
          return res.status(304).end();
        }
      }

      return originalJson(data);
    };

    next();
  };
}

module.exports = {
  // Main middleware
  compression,
  helmet,
  responseTime,

  // Rate limiting
  rateLimiter,
  authRateLimiter,
  uploadRateLimiter,
  apiRateLimiter,

  // Request/Response optimization
  requestSizeLimit,
  timeout,
  keepAlive,
  conditionalGet,

  // Advanced features
  http2ServerPush,
  preflightCache,
  resourceHints,
  performanceMonitoring,
};
