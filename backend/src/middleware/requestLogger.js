/**
 * Request Logging Middleware
 *
 * Integrates Morgan HTTP logging with Winston for comprehensive request/response logging.
 *
 * Usage:
 *   const { requestLogger, errorLogger } = require('./middleware/requestLogger');
 *
 *   // In server.js
 *   app.use(requestLogger);
 *   // ... routes ...
 *   app.use(errorLogger); // After routes, before error handler
 */

const morgan = require('morgan');
const logger = require('../config/logger');
const { getSentryRequestHandler, getSentryTracingHandler } = require('../config/sentry');

/**
 * Custom Morgan token for response time in seconds
 */
morgan.token('response-time-sec', (req, res) => {
  if (!req._startAt || !res._startAt) {
    return '0.000';
  }

  const ms = (res._startAt[0] - req._startAt[0]) * 1e3 +
             (res._startAt[1] - req._startAt[1]) * 1e-6;

  return (ms / 1000).toFixed(3);
});

/**
 * Custom Morgan token for user ID
 */
morgan.token('user-id', (req) => {
  return req.user?.id || req.user?._id || 'anonymous';
});

/**
 * Custom Morgan token for request body size
 */
morgan.token('req-size', (req) => {
  const contentLength = req.headers['content-length'];
  return contentLength ? formatBytes(parseInt(contentLength, 10)) : '0';
});

/**
 * Custom Morgan token for response body size
 */
morgan.token('res-size', (req, res) => {
  const contentLength = res.getHeader('content-length');
  return contentLength ? formatBytes(parseInt(contentLength, 10)) : '0';
});

/**
 * Format bytes to human readable
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Morgan format for development
 */
const developmentFormat = ':method :url :status :response-time ms - :res[content-length]';

/**
 * Morgan format for production (JSON)
 */
const productionFormat = JSON.stringify({
  method: ':method',
  url: ':url',
  status: ':status',
  responseTime: ':response-time-sec',
  contentLength: ':res[content-length]',
  userId: ':user-id',
  userAgent: ':user-agent',
  ip: ':remote-addr',
  reqSize: ':req-size',
  resSize: ':res-size',
});

/**
 * Determine if request should be logged
 */
function shouldSkipLogging(req, res) {
  // Skip health check endpoints
  if (req.url === '/health' || req.url === '/api/health') {
    return true;
  }

  // Skip static files
  if (req.url.match(/\.(css|js|jpg|jpeg|png|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
    return true;
  }

  // Skip successful OPTIONS requests
  if (req.method === 'OPTIONS' && res.statusCode < 400) {
    return true;
  }

  return false;
}

/**
 * Morgan stream that writes to Winston
 */
const morganStream = {
  write: (message) => {
    // Remove trailing newline
    const cleanMessage = message.trim();

    // Try to parse as JSON for structured logging
    try {
      const logData = JSON.parse(cleanMessage);
      const status = parseInt(logData.status, 10);

      // Determine log level based on status code
      if (status >= 500) {
        logger.error('HTTP Request', logData);
      } else if (status >= 400) {
        logger.warn('HTTP Request', logData);
      } else {
        logger.http('HTTP Request', logData);
      }
    } catch (err) {
      // Fallback to plain text logging
      logger.http(cleanMessage);
    }
  },
};

/**
 * Request logging middleware
 */
const requestLogger = [
  // Sentry request handler (should be first)
  getSentryRequestHandler(),

  // Sentry tracing handler
  getSentryTracingHandler(),

  // Morgan HTTP logger
  morgan(
    process.env.NODE_ENV === 'production' ? productionFormat : developmentFormat,
    {
      stream: morganStream,
      skip: shouldSkipLogging,
    }
  ),

  // Custom request metadata logger
  (req, res, next) => {
    // Attach request start time
    req.startTime = Date.now();

    // Log request details for important operations
    if (req.method !== 'GET' && req.method !== 'OPTIONS') {
      const requestInfo = {
        method: req.method,
        url: req.url,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
        userId: req.user?.id || req.user?._id,
        body: maskSensitiveData(req.body),
        query: req.query,
      };

      logger.logRequest(requestInfo);
    }

    // Capture response finish event
    const originalSend = res.send;
    res.send = function (data) {
      res.responseBody = data;
      originalSend.apply(res, arguments);
    };

    // Log response when finished
    res.on('finish', () => {
      const duration = Date.now() - req.startTime;

      // Log slow requests
      if (duration > 1000) {
        logger.warn('Slow Request', {
          method: req.method,
          url: req.url,
          duration: `${duration}ms`,
          status: res.statusCode,
          userId: req.user?.id || req.user?._id,
        });
      }

      // Log failed requests
      if (res.statusCode >= 400) {
        const errorInfo = {
          method: req.method,
          url: req.url,
          status: res.statusCode,
          duration: `${duration}ms`,
          userId: req.user?.id || req.user?._id,
          ip: req.ip,
        };

        if (res.statusCode >= 500) {
          logger.error('Request Failed', errorInfo);
        } else {
          logger.warn('Request Error', errorInfo);
        }
      }
    });

    next();
  },
];

/**
 * Mask sensitive data in request bodies
 */
function maskSensitiveData(data) {
  if (!data || typeof data !== 'object') {
    return data;
  }

  const sensitiveFields = [
    'password',
    'newPassword',
    'oldPassword',
    'currentPassword',
    'passwordConfirm',
    'token',
    'accessToken',
    'refreshToken',
    'secret',
    'apiKey',
    'privateKey',
    'creditCard',
    'cvv',
    'ssn',
  ];

  const masked = { ...data };

  for (const field of sensitiveFields) {
    if (masked[field]) {
      masked[field] = '***REDACTED***';
    }
  }

  return masked;
}

/**
 * Error logging middleware (should be used after routes)
 */
const errorLogger = (err, req, res, next) => {
  // Log the error
  const errorInfo = {
    message: err.message,
    stack: err.stack,
    method: req.method,
    url: req.url,
    status: err.statusCode || 500,
    userId: req.user?.id || req.user?._id,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    body: maskSensitiveData(req.body),
    query: req.query,
    params: req.params,
  };

  if (err.statusCode >= 500 || !err.statusCode) {
    logger.error('Unhandled Error', errorInfo);
  } else {
    logger.warn('Client Error', errorInfo);
  }

  // Pass to next error handler
  next(err);
};

/**
 * API endpoint for log statistics
 */
const getLogStats = async (req, res) => {
  try {
    // This would typically query log files or a logging service
    // For now, return basic statistics
    const stats = {
      logLevel: process.env.LOG_LEVEL || 'info',
      logDirectory: process.env.LOG_DIR || 'logs',
      loggingEnabled: true,
      transports: {
        console: process.env.NODE_ENV !== 'production',
        file: true,
        rotation: true,
      },
      features: {
        requestLogging: true,
        errorTracking: true,
        performanceMonitoring: true,
        auditLogging: true,
        sentryIntegration: process.env.SENTRY_ENABLED === 'true',
      },
    };

    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    logger.error('Failed to get log stats', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve log statistics',
    });
  }
};

/**
 * Request tracking middleware for performance monitoring
 */
const trackRequestPerformance = (req, res, next) => {
  const startTime = Date.now();

  // Track response
  res.on('finish', () => {
    const duration = Date.now() - startTime;

    // Log performance metrics
    if (duration > 500) {
      logger.logPerformance({
        route: `${req.method} ${req.route?.path || req.url}`,
        duration,
        slow: duration > 1000,
        method: req.method,
        statusCode: res.statusCode,
      });
    }

    // Track in monitoring system
    if (req.user) {
      logger.logAudit('api_request', req.user, req.url, {
        method: req.method,
        statusCode: res.statusCode,
        duration,
      });
    }
  });

  next();
};

/**
 * Log API access for security monitoring
 */
const logSecurityEvent = (req, eventType, details = {}) => {
  logger.logSecurity({
    event: eventType,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    userId: req.user?.id || req.user?._id,
    url: req.url,
    method: req.method,
    ...details,
  });
};

/**
 * Middleware to log authentication attempts
 */
const logAuthAttempt = (req, res, next) => {
  const originalJson = res.json;

  res.json = function (data) {
    // Check if this is an auth endpoint
    if (req.url.includes('/auth/') || req.url.includes('/login') || req.url.includes('/register')) {
      const success = res.statusCode >= 200 && res.statusCode < 300;

      logger.logAuth(success ? 'login_success' : 'login_failure', {
        email: req.body?.email,
        ip: req.ip,
        userAgent: req.get('user-agent'),
        method: req.method,
        url: req.url,
      });

      if (!success) {
        logSecurityEvent(req, 'failed_auth_attempt', {
          email: req.body?.email,
          reason: data?.message || 'Unknown',
        });
      }
    }

    originalJson.apply(res, arguments);
  };

  next();
};

/**
 * Rate limit logging
 */
const logRateLimit = (req) => {
  logger.warn('Rate Limit Exceeded', {
    ip: req.ip,
    url: req.url,
    userAgent: req.get('user-agent'),
    userId: req.user?.id || req.user?._id,
  });

  logSecurityEvent(req, 'rate_limit_exceeded');
};

module.exports = {
  requestLogger,
  errorLogger,
  trackRequestPerformance,
  logSecurityEvent,
  logAuthAttempt,
  logRateLimit,
  getLogStats,
};
