const AppError = require('../utils/appError');

/**
 * Middleware to validate request body against a Yup schema
 * @param {Object} schema - Yup validation schema
 * @param {String} source - Source of data to validate ('body', 'query', 'params')
 * @returns {Function} Express middleware function
 */
const validate = (schema, source = 'body') => {
  return async (req, res, next) => {
    try {
      // Get the data to validate based on source
      const dataToValidate = req[source];

      // Validate and sanitize the data
      const validatedData = await schema.validate(dataToValidate, {
        abortEarly: false, // Collect all errors
        stripUnknown: true, // Remove unknown fields
        strict: true // Don't type-cast values
      });

      // Replace the original data with validated data
      req[source] = validatedData;

      next();
    } catch (error) {
      // Format validation errors
      if (error.name === 'ValidationError') {
        const errors = error.inner.map(err => ({
          field: err.path,
          message: err.message
        }));

        return next(new AppError(
          `Validation failed: ${errors.map(e => e.message).join(', ')}`,
          400,
          errors
        ));
      }

      next(error);
    }
  };
};

/**
 * Sanitize string inputs to prevent XSS
 * @param {String} str - String to sanitize
 * @returns {String} Sanitized string
 */
const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;

  return str
    .replace(/[<>]/g, '') // Remove < and > to prevent script tags
    .trim();
};

/**
 * Middleware to sanitize all string inputs in request body
 */
const sanitizeInputs = (req, res, next) => {
  if (req.body) {
    const sanitizeObject = (obj) => {
      for (const key in obj) {
        if (typeof obj[key] === 'string') {
          obj[key] = sanitizeString(obj[key]);
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          sanitizeObject(obj[key]);
        }
      }
    };

    sanitizeObject(req.body);
  }

  next();
};

module.exports = {
  validate,
  sanitizeInputs
};
