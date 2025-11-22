const { body, param, query, validationResult } = require('express-validator');
const AppError = require('../utils/appError');
const securityConfig = require('../config/security.config');

/**
 * Validation Middleware
 *
 * Provides comprehensive request validation and sanitization
 * to prevent injection attacks, XSS, and other security vulnerabilities.
 */

/**
 * Handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => ({
      field: err.param,
      message: err.msg,
      value: err.value,
    }));

    return next(
      new AppError(
        'Validation failed',
        400,
        errorMessages
      )
    );
  }

  next();
};

/**
 * Validate MongoDB ObjectId
 */
const validateObjectId = (fieldName = 'id') => {
  return param(fieldName)
    .matches(securityConfig.validation.objectIdPattern)
    .withMessage(`Invalid ${fieldName} format`);
};

/**
 * Validate email
 */
const validateEmail = (fieldName = 'email') => {
  return body(fieldName)
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('Email must not exceed 255 characters');
};

/**
 * Validate password
 */
const validatePassword = (fieldName = 'password', isOptional = false) => {
  let validator = body(fieldName);

  if (isOptional) {
    validator = validator.optional();
  }

  validator = validator
    .isLength({ min: securityConfig.password.minLength, max: securityConfig.password.maxLength })
    .withMessage(`Password must be between ${securityConfig.password.minLength} and ${securityConfig.password.maxLength} characters`);

  if (securityConfig.password.requireUppercase) {
    validator = validator
      .matches(/[A-Z]/)
      .withMessage('Password must contain at least one uppercase letter');
  }

  if (securityConfig.password.requireLowercase) {
    validator = validator
      .matches(/[a-z]/)
      .withMessage('Password must contain at least one lowercase letter');
  }

  if (securityConfig.password.requireNumbers) {
    validator = validator
      .matches(/\d/)
      .withMessage('Password must contain at least one number');
  }

  if (securityConfig.password.requireSpecialChars) {
    validator = validator
      .matches(/[!@#$%^&*(),.?":{}|<>]/)
      .withMessage('Password must contain at least one special character');
  }

  if (securityConfig.password.preventCommonPasswords) {
    validator = validator
      .custom((value) => {
        const lowerValue = value.toLowerCase();
        if (securityConfig.password.commonPasswords.includes(lowerValue)) {
          throw new Error('This password is too common. Please choose a stronger password.');
        }
        return true;
      });
  }

  return validator;
};

/**
 * Validate string field
 */
const validateString = (fieldName, options = {}) => {
  const {
    required = true,
    minLength = 1,
    maxLength = 500,
    trim = true,
    escape = true,
  } = options;

  let validator = body(fieldName);

  if (!required) {
    validator = validator.optional();
  }

  if (trim) {
    validator = validator.trim();
  }

  validator = validator
    .isLength({ min: minLength, max: maxLength })
    .withMessage(`${fieldName} must be between ${minLength} and ${maxLength} characters`);

  if (escape) {
    validator = validator.escape();
  }

  return validator;
};

/**
 * Validate URL
 */
const validateUrl = (fieldName, options = {}) => {
  const { required = true, protocols = ['http', 'https'] } = options;

  let validator = body(fieldName);

  if (!required) {
    validator = validator.optional();
  }

  return validator
    .trim()
    .isURL({ protocols, require_protocol: true })
    .withMessage(`${fieldName} must be a valid URL`)
    .isLength({ max: 2048 })
    .withMessage(`${fieldName} must not exceed 2048 characters`);
};

/**
 * Validate number
 */
const validateNumber = (fieldName, options = {}) => {
  const { required = true, min = 0, max = Number.MAX_SAFE_INTEGER } = options;

  let validator = body(fieldName);

  if (!required) {
    validator = validator.optional();
  }

  return validator
    .isNumeric()
    .withMessage(`${fieldName} must be a number`)
    .isFloat({ min, max })
    .withMessage(`${fieldName} must be between ${min} and ${max}`)
    .toFloat();
};

/**
 * Validate boolean
 */
const validateBoolean = (fieldName, required = true) => {
  let validator = body(fieldName);

  if (!required) {
    validator = validator.optional();
  }

  return validator
    .isBoolean()
    .withMessage(`${fieldName} must be a boolean`)
    .toBoolean();
};

/**
 * Validate array
 */
const validateArray = (fieldName, options = {}) => {
  const { required = true, minLength = 0, maxLength = 100 } = options;

  let validator = body(fieldName);

  if (!required) {
    validator = validator.optional();
  }

  return validator
    .isArray({ min: minLength, max: maxLength })
    .withMessage(`${fieldName} must be an array with ${minLength} to ${maxLength} items`);
};

/**
 * Validate enum
 */
const validateEnum = (fieldName, allowedValues, required = true) => {
  let validator = body(fieldName);

  if (!required) {
    validator = validator.optional();
  }

  return validator
    .isIn(allowedValues)
    .withMessage(`${fieldName} must be one of: ${allowedValues.join(', ')}`);
};

/**
 * Validate date
 */
const validateDate = (fieldName, options = {}) => {
  const { required = true, minDate, maxDate } = options;

  let validator = body(fieldName);

  if (!required) {
    validator = validator.optional();
  }

  validator = validator
    .isISO8601()
    .withMessage(`${fieldName} must be a valid date`);

  if (minDate) {
    validator = validator
      .isAfter(minDate.toISOString())
      .withMessage(`${fieldName} must be after ${minDate.toISOString()}`);
  }

  if (maxDate) {
    validator = validator
      .isBefore(maxDate.toISOString())
      .withMessage(`${fieldName} must be before ${maxDate.toISOString()}`);
  }

  return validator.toDate();
};

/**
 * Sanitize HTML content
 */
const sanitizeHtml = (fieldName) => {
  return body(fieldName)
    .trim()
    .customSanitizer((value) => {
      // Remove script tags and event handlers
      if (typeof value === 'string') {
        return value
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/on\w+="[^"]*"/gi, '')
          .replace(/on\w+='[^']*'/gi, '');
      }
      return value;
    });
};

/**
 * Validate file upload
 */
const validateFileUpload = (fileType = 'default') => {
  return (req, res, next) => {
    if (!req.file && !req.files) {
      return next();
    }

    const files = req.files || [req.file];
    const config = securityConfig.fileUpload;

    for (const file of files) {
      if (!file) continue;

      // Check file size
      const maxSize = config.maxSize[fileType] || config.maxSize.default;
      if (file.size > maxSize) {
        return next(
          new AppError(
            `File size exceeds maximum limit of ${maxSize / 1024 / 1024}MB`,
            400
          )
        );
      }

      // Check MIME type
      const allowedMimeTypes = config.allowedMimeTypes[fileType];
      if (allowedMimeTypes && !allowedMimeTypes.includes(file.mimetype)) {
        return next(
          new AppError(
            `Invalid file type. Allowed types: ${allowedMimeTypes.join(', ')}`,
            400
          )
        );
      }

      // Check file extension
      const fileExtension = '.' + file.originalname.split('.').pop().toLowerCase();
      const allowedExtensions = config.allowedExtensions[fileType];
      if (allowedExtensions && !allowedExtensions.includes(fileExtension)) {
        return next(
          new AppError(
            `Invalid file extension. Allowed extensions: ${allowedExtensions.join(', ')}`,
            400
          )
        );
      }
    }

    next();
  };
};

/**
 * Prevent NoSQL injection in query parameters
 */
const sanitizeQuery = (req, res, next) => {
  // Remove $ and . from query parameters
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = req.query[key].replace(/[$\.]/g, securityConfig.mongoSanitize.replaceWith);
      }
    });
  }
  next();
};

/**
 * Common validation chains
 */
const commonValidations = {
  // Auth validations
  register: [
    validateString('name', { minLength: 2, maxLength: 100 }),
    validateEmail('email'),
    validatePassword('password'),
    body('passwordConfirm')
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Passwords do not match');
        }
        return true;
      }),
    handleValidationErrors,
  ],

  login: [
    validateEmail('email'),
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
    handleValidationErrors,
  ],

  forgotPassword: [
    validateEmail('email'),
    handleValidationErrors,
  ],

  resetPassword: [
    param('token')
      .notEmpty()
      .withMessage('Reset token is required')
      .isLength({ min: 64, max: 64 })
      .withMessage('Invalid reset token'),
    validatePassword('password'),
    body('passwordConfirm')
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Passwords do not match');
        }
        return true;
      }),
    handleValidationErrors,
  ],

  updatePassword: [
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    validatePassword('newPassword'),
    body('newPasswordConfirm')
      .custom((value, { req }) => {
        if (value !== req.body.newPassword) {
          throw new Error('Passwords do not match');
        }
        return true;
      }),
    handleValidationErrors,
  ],

  // User validations
  updateProfile: [
    validateString('name', { minLength: 2, maxLength: 100, required: false }),
    validateEmail('email').optional(),
    validateString('bio', { minLength: 0, maxLength: 500, required: false }),
    handleValidationErrors,
  ],

  // Course validations
  createCourse: [
    validateString('title', { minLength: 5, maxLength: 200 }),
    validateString('description', { minLength: 20, maxLength: 5000 }),
    validateEnum('level', ['beginner', 'intermediate', 'advanced']),
    validateEnum('category', [
      'programming', 'web-development', 'mobile-development', 'data-science',
      'machine-learning', 'artificial-intelligence', 'cybersecurity', 'cloud-computing',
      'devops', 'blockchain', 'game-development', 'ui-ux-design', 'digital-marketing',
      'business', 'finance', 'management', 'personal-development', 'health-fitness',
      'language-learning', 'arts-crafts', 'music', 'photography', 'other',
    ]),
    validateNumber('price', { min: 0, max: 100000, required: false }),
    handleValidationErrors,
  ],
};

module.exports = {
  handleValidationErrors,
  validateObjectId,
  validateEmail,
  validatePassword,
  validateString,
  validateUrl,
  validateNumber,
  validateBoolean,
  validateArray,
  validateEnum,
  validateDate,
  sanitizeHtml,
  validateFileUpload,
  sanitizeQuery,
  commonValidations,
};
