const AppError = require('../utils/appError');
const { JSDOM } = require('jsdom');
const createDOMPurify = require('dompurify');

// Create DOMPurify instance for server-side HTML sanitization
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

// Configure DOMPurify to allow safe HTML tags and attributes
const DOMPURIFY_CONFIG = {
  ALLOWED_TAGS: [
    'p', 'br', 'strong', 'em', 'u', 's', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'blockquote', 'code', 'pre', 'ul', 'ol', 'li', 'a', 'img',
    'span', 'div', 'sub', 'sup'
  ],
  ALLOWED_ATTR: [
    'href', 'src', 'alt', 'title', 'class', 'style', 'target', 'rel'
  ],
  ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  ALLOW_DATA_ATTR: false,
  ADD_TAGS: ['katex', 'katex-mathml', 'annotation'], // Support for KaTeX math formulas
  ADD_ATTR: ['encoding'] // For KaTeX
};

/**
 * Fields that can contain HTML content (rich text)
 * These will be sanitized with DOMPurify instead of stripped
 */
const HTML_ALLOWED_FIELDS = [
  'text', // Question text
  'explanation', // Question explanation
  'hint', // Question hint
  'feedback' // Question feedback
];

/**
 * Check if a field path should allow HTML content
 * @param {String} path - Field path (e.g., 'text', 'choices.0.text')
 * @returns {Boolean}
 */
const isHTMLAllowedField = (path) => {
  // Check if the path ends with any of the allowed field names
  return HTML_ALLOWED_FIELDS.some(field =>
    path === field || path.endsWith(`.${field}`)
  );
};

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
 * Sanitize HTML content to prevent XSS while preserving formatting
 * @param {String} html - HTML string to sanitize
 * @returns {String} Sanitized HTML
 */
const sanitizeHTML = (html) => {
  if (typeof html !== 'string') return html;
  return DOMPurify.sanitize(html, DOMPURIFY_CONFIG);
};

/**
 * Sanitize string inputs to prevent XSS (for non-HTML fields)
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
 * Uses different sanitization strategies based on field type
 */
const sanitizeInputs = (req, res, next) => {
  if (req.body) {
    const sanitizeObject = (obj, parentPath = '') => {
      for (const key in obj) {
        const currentPath = parentPath ? `${parentPath}.${key}` : key;

        if (typeof obj[key] === 'string') {
          // Use HTML sanitization for rich text fields, strict for others
          if (isHTMLAllowedField(currentPath)) {
            obj[key] = sanitizeHTML(obj[key]);
          } else {
            obj[key] = sanitizeString(obj[key]);
          }
        } else if (Array.isArray(obj[key])) {
          // Handle arrays (like choices)
          obj[key].forEach((item, index) => {
            if (typeof item === 'object' && item !== null) {
              sanitizeObject(item, `${currentPath}.${index}`);
            } else if (typeof item === 'string') {
              if (isHTMLAllowedField(currentPath)) {
                obj[key][index] = sanitizeHTML(item);
              } else {
                obj[key][index] = sanitizeString(item);
              }
            }
          });
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          sanitizeObject(obj[key], currentPath);
        }
      }
    };

    sanitizeObject(req.body);
  }

  next();
};

module.exports = {
  validate,
  sanitizeInputs,
  sanitizeHTML,
  sanitizeString
};
