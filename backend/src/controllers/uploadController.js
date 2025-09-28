const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Configure multer for temporary file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/temp';

    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Define allowed file types
  const allowedTypes = {
    video: ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/webm'],
    audio: ['audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a', 'audio/mpeg'],
    document: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain'
    ]
  };

  const allAllowedTypes = [...allowedTypes.video, ...allowedTypes.audio, ...allowedTypes.document];

  if (allAllowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Invalid file type. Only video, audio, document, and assignment files are allowed.', 400), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 150 * 1024 * 1024, // 150MB limit
  }
});

// Upload single file endpoint
const uploadFile = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('No file uploaded', 400));
  }

  try {
    // Upload to Cloudinary
    const cloudinaryResult = await uploadToCloudinary(req.file.path, {
      folder: `lms-content/${req.body.contentType || 'general'}`,
      public_id: `${Date.now()}-${req.file.originalname.split('.')[0]}`,
    });

    // Delete temporary file
    fs.unlinkSync(req.file.path);

    res.status(200).json({
      status: 'success',
      data: {
        url: cloudinaryResult.url,
        publicId: cloudinaryResult.publicId,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        fileType: req.file.mimetype,
        resourceType: cloudinaryResult.resourceType,
        format: cloudinaryResult.format
      }
    });
  } catch (error) {
    // Clean up temporary file if upload fails
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    console.error('Upload error:', error);
    return next(new AppError('File upload failed', 500));
  }
});

// Delete file endpoint
const deleteFile = catchAsync(async (req, res, next) => {
  const { publicId, resourceType } = req.body;

  if (!publicId) {
    return next(new AppError('Public ID is required', 400));
  }

  try {
    await deleteFromCloudinary(publicId, resourceType || 'auto');

    res.status(200).json({
      status: 'success',
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('Delete error:', error);
    return next(new AppError('File deletion failed', 500));
  }
});

module.exports = {
  upload: upload.single('file'), // Middleware for single file upload
  uploadFile,
  deleteFile
};