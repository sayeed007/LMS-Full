/**
 * Centralized Error Handler Middleware
 *
 * Handles all errors in the application with proper logging, monitoring, and responses.
 * Integrates with Winston for logging and Sentry for error tracking.
 *
 * Usage:
 *   const { errorHandler, notFound, AppError } = require('./middleware/errorHandler');
 *
 *   // In server.js (should be last middleware)
 *   app.use(notFound);
 *   app.use(errorHandler);
 */

const logger = require('../config/logger');
const { captureException, getSentryErrorHandler } = require('../config/sentry');
const { server } = require('../config/env.config');

/**
 * Custom Application Error Class
 */
class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation Error (400)
 */
class ValidationError extends AppError {
  constructor(message, errors = []) {
    super(message, 400);
    this.errors = errors;
  }
}

/**
 * Authentication Error (401)
 */
class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401);
  }
}

/**
 * Authorization Error (403)
 */
class AuthorizationError extends AppError {
  constructor(message = 'Access forbidden') {
    super(message, 403);
  }
}

/**
 * Not Found Error (404)
 */
class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404);
  }
}

/**
 * Conflict Error (409)
 */
class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super(message, 409);
  }
}

/**
 * Rate Limit Error (429)
 */
class RateLimitError extends AppError {
  constructor(message = 'Too many requests') {
    super(message, 429);
  }
}

/**
 * Handle MongoDB Cast Errors
 */
function handleCastError(error) {
  const message = `Invalid ${error.path}: ${error.value}`;
  return new ValidationError(message);
}

/**
 * Handle MongoDB Duplicate Key Errors
 */
function handleDuplicateKeyError(error) {
  if (!error.keyValue || typeof error.keyValue !== 'object') {
    return new ConflictError('Duplicate key error occurred');
  }
  const field = Object.keys(error.keyValue)[0];
  const value = error.keyValue[field];
  const message = `Duplicate field value: ${field} = "${value}". Please use another value.`;
  return new ConflictError(message);
}

/**
 * Handle MongoDB Validation Errors
 */
function handleValidationError(error) {
  const errors = Object.values(error.errors).map((err) => ({
    field: err.path,
    message: err.message,
    value: err.value,
  }));

  const message = `Invalid input data: ${errors.map((e) => e.message).join(', ')}`;
  return new ValidationError(message, errors);
}

/**
 * Handle JWT Errors
 */
function handleJWTError() {
  return new AuthenticationError('Invalid token. Please log in again.');
}

/**
 * Handle JWT Expired Error
 */
function handleJWTExpiredError() {
  return new AuthenticationError('Your token has expired. Please log in again.');
}

/**
 * Handle Mongoose Validation Error
 */
function handleMongooseValidationError(error) {
  const errors = Object.values(error.errors).map((err) => ({
    field: err.path,
    message: err.message,
  }));

  return new ValidationError('Validation failed', errors);
}

/**
 * Send error response in development
 */
function sendErrorDev(err, req, res) {
  // Log error details
  logger.error('Error in Development', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    statusCode: err.statusCode,
    isOperational: err.isOperational,
  });

  // API error response
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
      errors: err.errors,
    });
  }

  // Rendered website error
  res.status(err.statusCode).json({
    title: 'Something went wrong!',
    message: err.message,
    error: err,
    stack: err.stack,
  });
}

/**
 * Send error response in production
 */
function sendErrorProd(err, req, res) {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    // Log operational error
    logger.warn('Operational Error', {
      message: err.message,
      statusCode: err.statusCode,
      url: req.url,
      method: req.method,
      userId: req.user?.id,
    });

    // API error response
    if (req.originalUrl.startsWith('/api')) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        errors: err.errors,
      });
    }

    // Rendered website error
    return res.status(err.statusCode).json({
      title: 'Something went wrong!',
      message: err.message,
    });
  }

  // Programming or unknown error: don't leak error details
  logger.error('Non-Operational Error', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    statusCode: err.statusCode || 500,
    userId: req.user?.id,
  });

  // Send error to Sentry
  captureException(err, {
    user: req.user ? {
      id: req.user.id || req.user._id,
      email: req.user.email,
    } : undefined,
    tags: {
      url: req.url,
      method: req.method,
    },
    extra: {
      body: req.body,
      query: req.query,
      params: req.params,
    },
  });

  // API error response
  if (req.originalUrl.startsWith('/api')) {
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong on the server. Please try again later.',
    });
  }

  // Rendered website error
  res.status(500).json({
    title: 'Something went wrong!',
    message: 'Please try again later.',
  });
}

/**
 * Main error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;
  error.isOperational = err.isOperational !== undefined ? err.isOperational : false;

  // Log the original error
  if (error.statusCode >= 500) {
    logger.error('Error Handler Caught', {
      name: err.name,
      message: err.message,
      stack: err.stack,
      statusCode: error.statusCode,
    });
  }

  // Handle specific error types
  if (err.name === 'CastError') error = handleCastError(err);
  if (err.code === 11000) error = handleDuplicateKeyError(err);
  if (err.name === 'ValidationError') error = handleValidationError(err);
  if (err.name === 'JsonWebTokenError') error = handleJWTError();
  if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();
  if (err.name === 'MongooseValidationError') error = handleMongooseValidationError(err);

  // Handle multer errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      error = new ValidationError('File size too large');
    } else if (err.code === 'LIMIT_FILE_COUNT') {
      error = new ValidationError('Too many files');
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      error = new ValidationError('Unexpected file field');
    } else {
      error = new ValidationError(`Upload error: ${err.message}`);
    }
  }

  // Handle express-validator errors
  if (err.array && typeof err.array === 'function') {
    const errors = err.array().map((e) => ({
      field: e.param,
      message: e.msg,
      value: e.value,
    }));
    error = new ValidationError('Validation failed', errors);
  }

  // Send appropriate response
  if (server.isDevelopment) {
    sendErrorDev(error, req, res);
  } else {
    sendErrorProd(error, req, res);
  }
};

/**
 * 404 Not Found Handler
 */
const notFound = (req, res, next) => {
  const error = new NotFoundError(`Route ${req.originalUrl}`);
  next(error);
};

/**
 * Async error wrapper
 * Catches errors in async route handlers
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Assert condition or throw error
 */
const assert = (condition, message, statusCode = 400) => {
  if (!condition) {
    throw new AppError(message, statusCode);
  }
};

/**
 * Validate request body/query/params
 */
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return next(new ValidationError('Validation failed', errors));
    }

    // Replace request body with validated value
    req.body = value;
    next();
  };
};

/**
 * Error response helper
 */
const errorResponse = (res, statusCode, message, errors = null) => {
  const response = {
    success: false,
    status: `${statusCode}`.startsWith('4') ? 'fail' : 'error',
    message,
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

/**
 * Success response helper
 */
const successResponse = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    status: 'success',
    message,
    data,
  });
};

/**
 * Paginated response helper
 */
const paginatedResponse = (res, data, pagination, message = 'Success') => {
  return res.status(200).json({
    success: true,
    status: 'success',
    message,
    data,
    pagination: {
      currentPage: pagination.page,
      totalPages: pagination.totalPages,
      totalItems: pagination.totalItems,
      itemsPerPage: pagination.limit,
      hasNextPage: pagination.page < pagination.totalPages,
      hasPrevPage: pagination.page > 1,
    },
  });
};

/**
 * Handle unhandled promise rejections
 */
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', {
    reason: reason instanceof Error ? reason.message : reason,
    stack: reason instanceof Error ? reason.stack : undefined,
    promise,
  });

  // Capture in Sentry
  if (reason instanceof Error) {
    captureException(reason, {
      tags: { type: 'unhandledRejection' },
    });
  }

  // In development, crash the application
  if (server.isDevelopment) {
    console.error('UNHANDLED REJECTION! 💥 Shutting down...');
    console.error(reason);
    process.exit(1);
  }
});

/**
 * Handle uncaught exceptions
 */
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', {
    error: error.message,
    stack: error.stack,
  });

  // Capture in Sentry
  captureException(error, {
    tags: { type: 'uncaughtException' },
  });

  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(error);

  // Exit the application
  process.exit(1);
});

/**
 * Graceful shutdown handler
 */
const gracefulShutdown = (signal) => {
  return () => {
    logger.info(`${signal} received. Starting graceful shutdown...`);

    // Close server
    if (global.server) {
      global.server.close(() => {
        logger.info('HTTP server closed');

        // Close database connection
        if (global.mongoose) {
          global.mongoose.connection.close(false, () => {
            logger.info('MongoDB connection closed');
            process.exit(0);
          });
        } else {
          process.exit(0);
        }
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    } else {
      process.exit(0);
    }
  };
};

// Register shutdown handlers
process.on('SIGTERM', gracefulShutdown('SIGTERM'));
process.on('SIGINT', gracefulShutdown('SIGINT'));

module.exports = {
  // Error handler middleware
  errorHandler,
  notFound,

  // Sentry error handler (should be used before custom error handler)
  sentryErrorHandler: getSentryErrorHandler(),

  // Error classes
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,

  // Helpers
  catchAsync,
  assert,
  validate,
  errorResponse,
  successResponse,
  paginatedResponse,
};