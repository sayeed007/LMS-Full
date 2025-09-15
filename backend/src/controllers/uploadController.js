const multer = require('multer');
const path = require('path');
const fs = require('fs');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(uploadsDir, file.fieldname + 's'); // images, documents, etc.
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Create unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);
  }
});

// File filter function
const fileFilter = (allowedTypes) => (req, file, cb) => {
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`, 400), false);
  }
};

// File size limits (in bytes)
const fileSizeLimits = {
  image: 5 * 1024 * 1024, // 5MB
  document: 10 * 1024 * 1024, // 10MB
  video: 100 * 1024 * 1024, // 100MB
  audio: 20 * 1024 * 1024, // 20MB
};

// Allowed MIME types
const allowedMimeTypes = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  document: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain'
  ],
  video: ['video/mp4', 'video/avi', 'video/quicktime', 'video/x-msvideo'],
  audio: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/aac']
};

// Create multer instances for different file types
const createUploader = (type) => multer({
  storage: storage,
  fileFilter: fileFilter(allowedMimeTypes[type]),
  limits: {
    fileSize: fileSizeLimits[type]
  }
}).single(type);

// Upload handlers
const uploadImage = createUploader('image');
const uploadDocument = createUploader('document');
const uploadVideo = createUploader('video');
const uploadAudio = createUploader('audio');

// Generic upload response function
const sendUploadResponse = (req, res) => {
  if (!req.file) {
    throw new AppError('No file uploaded', 400);
  }

  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const fileUrl = `${baseUrl}/uploads/${req.file.fieldname}s/${req.file.filename}`;

  res.status(200).json({
    status: 'success',
    data: {
      filename: req.file.originalname,
      url: fileUrl,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      uploadedAt: new Date().toISOString()
    }
  });
};

// Image upload endpoint
exports.uploadImageHandler = catchAsync(async (req, res, next) => {
  uploadImage(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new AppError('File too large. Maximum size is 5MB', 413));
        }
        return next(new AppError(err.message, 400));
      }
      return next(err);
    }
    sendUploadResponse(req, res);
  });
});

// Document upload endpoint
exports.uploadDocumentHandler = catchAsync(async (req, res, next) => {
  uploadDocument(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new AppError('File too large. Maximum size is 10MB', 413));
        }
        return next(new AppError(err.message, 400));
      }
      return next(err);
    }
    sendUploadResponse(req, res);
  });
});

// Video upload endpoint
exports.uploadVideoHandler = catchAsync(async (req, res, next) => {
  uploadVideo(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new AppError('File too large. Maximum size is 100MB', 413));
        }
        return next(new AppError(err.message, 400));
      }
      return next(err);
    }
    sendUploadResponse(req, res);
  });
});

// Audio upload endpoint
exports.uploadAudioHandler = catchAsync(async (req, res, next) => {
  uploadAudio(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new AppError('File too large. Maximum size is 20MB', 413));
        }
        return next(new AppError(err.message, 400));
      }
      return next(err);
    }
    sendUploadResponse(req, res);
  });
});

// Bulk upload handler
exports.bulkUploadHandler = catchAsync(async (req, res, next) => {
  const upload = multer({
    storage: storage,
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB per file
      files: 10 // Maximum 10 files
    }
  }).array('files', 10);

  upload(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new AppError('One or more files are too large. Maximum size is 10MB per file', 413));
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return next(new AppError('Too many files. Maximum is 10 files', 400));
        }
        return next(new AppError(err.message, 400));
      }
      return next(err);
    }

    if (!req.files || req.files.length === 0) {
      return next(new AppError('No files uploaded', 400));
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const successful = req.files.map(file => ({
      filename: file.originalname,
      url: `${baseUrl}/uploads/${file.fieldname}s/${file.filename}`,
      fileSize: file.size,
      mimeType: file.mimetype,
      uploadedAt: new Date().toISOString()
    }));

    res.status(200).json({
      status: 'success',
      data: {
        successful,
        failed: []
      }
    });
  });
});

// Get files endpoint (placeholder - would need a database model for file metadata)
exports.getFiles = catchAsync(async (req, res, next) => {
  // This would typically query a database for file metadata
  res.status(200).json({
    status: 'success',
    results: 0,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalResults: 0,
      limit: 20,
      hasNextPage: false,
      hasPrevPage: false,
      nextPage: null,
      prevPage: null
    },
    data: []
  });
});

// Get file by ID endpoint (placeholder)
exports.getFileById = catchAsync(async (req, res, next) => {
  res.status(404).json({
    status: 'error',
    message: 'File not found'
  });
});

// Delete file endpoint (placeholder)
exports.deleteFile = catchAsync(async (req, res, next) => {
  res.status(404).json({
    status: 'error',
    message: 'File not found'
  });
});