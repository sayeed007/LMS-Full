/**
 * Winston Logger Configuration
 *
 * Centralized logging system with multiple transports:
 * - Console (development)
 * - File (error.log, combined.log, access.log)
 * - Daily rotating files (production)
 *
 * Usage:
 *   const logger = require('./config/logger');
 *   logger.info('User logged in', { userId: '123' });
 *   logger.error('Database connection failed', { error: err.message });
 */

const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');
const fs = require('fs');

// Load environment config
const { server, logging } = require('./env.config');

// Ensure log directory exists
const logDir = logging.dir || 'logs';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

/**
 * Custom log format
 */
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp', 'label'] }),
  winston.format.json()
);

/**
 * Console format (pretty print for development)
 */
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...metadata }) => {
    let msg = `${timestamp} [${level}]: ${message}`;

    // Add metadata if present
    if (Object.keys(metadata).length > 0) {
      msg += ` ${JSON.stringify(metadata)}`;
    }

    return msg;
  })
);

/**
 * Create transports based on environment
 */
const transports = [];

// Console transport (always enabled in development)
if (logging.console.enabled) {
  transports.push(
    new winston.transports.Console({
      level: logging.console.level,
      format: server.isDevelopment ? consoleFormat : customFormat,
      handleExceptions: true,
      handleRejections: true,
    })
  );
}

// File transports
if (logging.file.enabled) {
  // Error log (errors only)
  transports.push(
    new DailyRotateFile({
      filename: path.join(logDir, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      format: customFormat,
      maxSize: logging.maxSize,
      maxFiles: logging.maxFiles,
      handleExceptions: true,
      handleRejections: true,
    })
  );

  // Combined log (all levels)
  transports.push(
    new DailyRotateFile({
      filename: path.join(logDir, 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      format: customFormat,
      maxSize: logging.maxSize,
      maxFiles: logging.maxFiles,
    })
  );

  // Access log (http requests)
  transports.push(
    new DailyRotateFile({
      filename: path.join(logDir, 'access-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'http',
      format: customFormat,
      maxSize: logging.maxSize,
      maxFiles: logging.maxFiles,
    })
  );
}

// Audit log (if enabled)
if (logging.audit.enabled) {
  transports.push(
    new DailyRotateFile({
      filename: path.join(logDir, 'audit-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'info',
      format: customFormat,
      maxSize: logging.maxSize,
      maxFiles: logging.maxFiles,
    })
  );
}

/**
 * Create Winston logger instance
 */
const logger = winston.createLogger({
  level: logging.level,
  format: customFormat,
  transports,
  exitOnError: false,
});

/**
 * Create a stream object for Morgan integration
 */
logger.stream = {
  write: (message) => {
    logger.http(message.trim());
  },
};

/**
 * Helper methods for structured logging
 */

/**
 * Log HTTP request
 */
logger.logRequest = (req, res, responseTime) => {
  logger.http('HTTP Request', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    statusCode: res.statusCode,
    responseTime: `${responseTime}ms`,
    userId: req.user?.id,
  });
};

/**
 * Log authentication event
 */
logger.logAuth = (event, details) => {
  logger.info(`Auth: ${event}`, {
    event,
    ...details,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Log database operation
 */
logger.logDB = (operation, details) => {
  logger.debug(`DB: ${operation}`, {
    operation,
    ...details,
  });
};

/**
 * Log security event
 */
logger.logSecurity = (event, details) => {
  logger.warn(`Security: ${event}`, {
    event,
    ...details,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Log audit event
 */
logger.logAudit = (action, user, resource, details = {}) => {
  const auditEntry = {
    action,
    userId: user?.id || user,
    userEmail: user?.email,
    resource,
    timestamp: new Date().toISOString(),
    ...details,
  };

  // Mask sensitive fields
  if (auditEntry.data) {
    auditEntry.data = maskSensitiveData(auditEntry.data);
  }

  logger.info('Audit', auditEntry);
};

/**
 * Log payment event
 */
logger.logPayment = (event, details) => {
  // Mask sensitive payment info
  const maskedDetails = { ...details };
  if (maskedDetails.cardNumber) {
    maskedDetails.cardNumber = maskCardNumber(maskedDetails.cardNumber);
  }
  if (maskedDetails.cvv) {
    delete maskedDetails.cvv;
  }

  logger.info(`Payment: ${event}`, maskedDetails);
};

/**
 * Log error with context
 */
logger.logError = (error, context = {}) => {
  logger.error(error.message, {
    error: {
      message: error.message,
      stack: error.stack,
      code: error.code,
      status: error.statusCode,
    },
    ...context,
  });
};

/**
 * Mask sensitive data
 */
function maskSensitiveData(data) {
  const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'accessToken', 'refreshToken'];
  const masked = { ...data };

  Object.keys(masked).forEach((key) => {
    if (sensitiveFields.includes(key)) {
      masked[key] = '***MASKED***';
    } else if (typeof masked[key] === 'object' && masked[key] !== null) {
      masked[key] = maskSensitiveData(masked[key]);
    }
  });

  return masked;
}

/**
 * Mask card number
 */
function maskCardNumber(cardNumber) {
  if (!cardNumber) return '';
  const cleaned = cardNumber.replace(/\D/g, '');
  return '*'.repeat(cleaned.length - 4) + cleaned.slice(-4);
}

/**
 * Handle uncaught exceptions and unhandled rejections
 */
if (server.isProduction) {
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception', {
      error: {
        message: error.message,
        stack: error.stack,
      },
    });
    // Give time for logs to write
    setTimeout(() => process.exit(1), 1000);
  });

  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection', {
      reason,
      promise,
    });
  });
}

module.exports = logger;
