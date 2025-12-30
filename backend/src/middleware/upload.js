const multer = require('multer');
const path = require('path');
const AppError = require('../utils/appError');

/**
 * File Upload Middleware
 *
 * Handles file uploads with validation for question attachments
 * Supports: images, videos, audio, and documents
 */

// File type validation
const ALLOWED_FILE_TYPES = {
  image: {
    mimetypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    maxSize: 5 * 1024 * 1024, // 5MB
  },
  video: {
    mimetypes: ['video/mp4', 'video/webm', 'video/ogg'],
    extensions: ['.mp4', '.webm', '.ogg'],
    maxSize: 50 * 1024 * 1024, // 50MB
  },
  audio: {
    mimetypes: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'],
    extensions: ['.mp3', '.mpeg', '.wav', '.ogg'],
    maxSize: 10 * 1024 * 1024, // 10MB
  },
  document: {
    mimetypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ],
    extensions: ['.pdf', '.doc', '.docx', '.txt'],
    maxSize: 10 * 1024 * 1024, // 10MB
  }
};

// Get all allowed mimetypes and extensions
const getAllowedMimetypes = () => {
  const mimetypes = [];
  Object.values(ALLOWED_FILE_TYPES).forEach(type => {
    mimetypes.push(...type.mimetypes);
  });
  return mimetypes;
};

const getAllowedExtensions = () => {
  const extensions = [];
  Object.values(ALLOWED_FILE_TYPES).forEach(type => {
    extensions.push(...type.extensions);
  });
  return extensions;
};

// Validate file type
const validateFileType = (file) => {
  const allowedMimetypes = getAllowedMimetypes();
  const allowedExtensions = getAllowedExtensions();

  const ext = path.extname(file.originalname).toLowerCase();
  const mimetype = file.mimetype.toLowerCase();

  const isValidMimetype = allowedMimetypes.includes(mimetype);
  const isValidExtension = allowedExtensions.includes(ext);

  return isValidMimetype && isValidExtension;
};

// Determine file category
const getFileCategory = (mimetype) => {
  for (const [category, config] of Object.entries(ALLOWED_FILE_TYPES)) {
    if (config.mimetypes.includes(mimetype.toLowerCase())) {
      return category;
    }
  }
  return null;
};

// Validate file size based on category
const validateFileSize = (file) => {
  const category = getFileCategory(file.mimetype);
  if (!category) return false;

  const maxSize = ALLOWED_FILE_TYPES[category].maxSize;
  return file.size <= maxSize;
};

// Multer storage configuration (memory storage for cloud uploads)
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
  // Validate file type
  if (!validateFileType(file)) {
    return cb(
      new AppError(
        `Invalid file type. Allowed types: ${getAllowedExtensions().join(', ')}`,
        400
      ),
      false
    );
  }

  // Validate file size
  if (!validateFileSize(file)) {
    const category = getFileCategory(file.mimetype);
    const maxSizeMB = ALLOWED_FILE_TYPES[category].maxSize / (1024 * 1024);
    return cb(
      new AppError(
        `File too large. Maximum size for ${category} files: ${maxSizeMB}MB`,
        400
      ),
      false
    );
  }

  cb(null, true);
};

// Multer configuration
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB absolute maximum
    files: 5, // Maximum 5 files per request
  }
});

/**
 * Middleware for single file upload
 */
const uploadSingle = (fieldName = 'file') => {
  return upload.single(fieldName);
};

/**
 * Middleware for multiple files upload
 */
const uploadMultiple = (fieldName = 'files', maxCount = 5) => {
  return upload.array(fieldName, maxCount);
};

/**
 * Middleware for multiple fields with files
 */
const uploadFields = (fields) => {
  return upload.fields(fields);
};

/**
 * Sanitize filename
 */
const sanitizeFilename = (filename) => {
  // Remove special characters and spaces
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .toLowerCase();
};

/**
 * Generate unique filename
 */
const generateUniqueFilename = (originalFilename) => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const ext = path.extname(originalFilename);
  const nameWithoutExt = path.basename(originalFilename, ext);
  const sanitizedName = sanitizeFilename(nameWithoutExt);

  return `${sanitizedName}-${timestamp}-${randomString}${ext}`;
};

/**
 * Validate uploaded file (additional security check)
 */
const validateUploadedFile = (file) => {
  if (!file) {
    throw new AppError('No file uploaded', 400);
  }

  // Check for null bytes (potential security threat)
  if (file.originalname.includes('\0')) {
    throw new AppError('Invalid filename', 400);
  }

  // Check filename length
  if (file.originalname.length > 255) {
    throw new AppError('Filename too long', 400);
  }

  // Verify buffer exists
  if (!file.buffer || file.buffer.length === 0) {
    throw new AppError('File is empty', 400);
  }

  return true;
};

/**
 * Error handler for multer errors
 */
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Multer-specific errors
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        status: 'error',
        message: 'File too large. Maximum size: 50MB'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        status: 'error',
        message: 'Too many files. Maximum: 5 files per request'
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        status: 'error',
        message: 'Unexpected field name in file upload'
      });
    }

    return res.status(400).json({
      status: 'error',
      message: `File upload error: ${err.message}`
    });
  }

  next(err);
};

module.exports = {
  uploadSingle,
  uploadMultiple,
  uploadFields,
  sanitizeFilename,
  generateUniqueFilename,
  validateUploadedFile,
  handleMulterError,
  ALLOWED_FILE_TYPES,
  getFileCategory
};
