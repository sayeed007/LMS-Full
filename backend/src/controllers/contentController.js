const mongoose = require('mongoose');
const Content = require('../models/Content');
const Lesson = require('../models/Lesson');
const Course = require('../models/Course');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

// Get all content for a lesson
const getContentByLesson = catchAsync(async (req, res, next) => {
  const { courseId, lessonId } = req.params;

  // Verify course exists
  const course = await Course.findById(courseId);
  if (!course) {
    return next(new AppError('Course not found', 404));
  }

  // Verify lesson exists and belongs to the course
  const lesson = await Lesson.findOne({
    _id: lessonId,
    course: courseId,
    isDeleted: false
  });
  if (!lesson) {
    return next(new AppError('Lesson not found', 404));
  }

  // Check if user has access to course
  let canViewUnpublished = false;

  if (req.user.role === 'instructor' && course.instructor.toString() === req.user.id) {
    canViewUnpublished = true;
  } else if (['org_admin', 'super_admin'].includes(req.user.role)) {
    canViewUnpublished = true;
  }

  let filter = {
    lesson: lessonId,
    isDeleted: false
  };

  // For non-owners, only show published content
  if (!canViewUnpublished) {
    filter.isPublished = true;
  }

  const features = new APIFeatures(Content.find(filter), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const content = await features.query
    .populate('createdBy', 'name email')
    .sort({ order: 1 });

  const total = await Content.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    results: content.length,
    total,
    data: {
      content
    }
  });
});

// Get single content item by ID
const getContentById = catchAsync(async (req, res, next) => {
  const { courseId, lessonId, contentId } = req.params;

  // Verify the content exists and belongs to the lesson
  const content = await Content.findOne({
    _id: contentId,
    lesson: lessonId,
    isDeleted: false
  })
    .populate('createdBy', 'name email avatar')
    .populate('lessonDetails', 'title course');

  if (!content) {
    return next(new AppError('Content not found', 404));
  }

  // Verify lesson belongs to course
  const lesson = await Lesson.findOne({
    _id: lessonId,
    course: courseId,
    isDeleted: false
  });
  if (!lesson) {
    return next(new AppError('Lesson not found or does not belong to this course', 404));
  }

  // Check access permissions
  const course = await Course.findById(courseId);
  if (!course) {
    return next(new AppError('Course not found', 404));
  }

  let hasAccess = false;

  // Instructor and admin access
  if (req.user.role === 'instructor' && course.instructor.toString() === req.user.id) {
    hasAccess = true;
  } else if (['org_admin', 'super_admin'].includes(req.user.role)) {
    hasAccess = true;
  } else if (content.isPublished) {
    hasAccess = true;
  }

  if (!hasAccess) {
    return next(new AppError('You do not have access to this content', 403));
  }

  // Increment views if not the creator
  if (req.user.id !== content.createdBy.toString()) {
    await content.incrementViews();
  }

  res.status(200).json({
    status: 'success',
    data: {
      content
    }
  });
});

// Create new content (Instructor/Admin only)
const createContent = catchAsync(async (req, res, next) => {
  const { courseId, lessonId } = req.params;

  // Verify lesson exists and belongs to course
  const lesson = await Lesson.findOne({
    _id: lessonId,
    course: courseId,
    isDeleted: false
  });
  if (!lesson) {
    return next(new AppError('Lesson not found', 404));
  }

  // Verify course exists and user has access
  const course = await Course.findById(courseId);
  if (!course) {
    return next(new AppError('Course not found', 404));
  }

  // Check permissions
  if (req.user.role === 'instructor' && course.instructor.toString() !== req.user.id) {
    return next(new AppError('You can only create content for your own courses', 403));
  }

  // Get next order number if not provided
  if (!req.body.order) {
    req.body.order = await Content.getNextOrder(lessonId);
  }

  const contentData = {
    ...req.body,
    lesson: lessonId,
    createdBy: req.user.id
  };

  // Validate content data based on type
  const { type } = req.body;
  if (!type) {
    return next(new AppError('Content type is required', 400));
  }

  // Type-specific validation and cleanup
  switch (type) {
    case 'text':
      if (!req.body.data || !req.body.data.text) {
        return next(new AppError('Text content is required for text type', 400));
      }
      // Clean up - only keep text field
      req.body.data = {
        text: req.body.data.text
      };
      break;

    case 'blocks':
    case 'block':
      // Handle backward compatibility: migrate 'items' to 'blocks' if needed
      if (req.body.data) {
        // If items exists but blocks doesn't, migrate items to blocks
        if (req.body.data.items && !req.body.data.blocks) {
          req.body.data.blocks = req.body.data.items;
        }
        // Ensure blocks array exists
        if (!req.body.data.blocks || !Array.isArray(req.body.data.blocks)) {
          req.body.data.blocks = [];
        }
      } else {
        req.body.data = { blocks: [] };
      }
      // Clean up - only keep blocks array
      req.body.data = {
        blocks: req.body.data.blocks
      };
      break;

    case 'audio':
    case 'image':
    case 'document':
    case 'assignment':
      if (!req.body.data || !req.body.data.url) {
        return next(new AppError('URL is required for media/assignment content', 400));
      }
      // Clean up - only keep relevant media fields
      req.body.data = {
        title: req.body.data.title,
        description: req.body.data.description,
        url: req.body.data.url,
        filename: req.body.data.filename,
        size: req.body.data.size,
        mimeType: req.body.data.mimeType,
        duration: req.body.data.duration,
        metadata: req.body.data.metadata
      };
      break;

    case 'video':
      // Video can have either uploaded file URL or embed URL
      if (!req.body.data || (!req.body.data.url && !req.body.data.embedUrl)) {
        return next(new AppError('Either upload URL or embed URL is required for video content', 400));
      }
      // Clean up - only keep relevant video fields
      req.body.data = {
        title: req.body.data.title,
        description: req.body.data.description,
        url: req.body.data.url,
        filename: req.body.data.filename,
        size: req.body.data.size,
        mimeType: req.body.data.mimeType,
        duration: req.body.data.duration,
        embedUrl: req.body.data.embedUrl,
        metadata: req.body.data.metadata
      };
      break;

    case 'quiz':
      if (!req.body.data || !req.body.data.quiz || !req.body.data.quiz.questions) {
        return next(new AppError('Quiz questions are required for quiz type', 400));
      }
      // Clean up - only keep quiz field
      req.body.data = {
        quiz: req.body.data.quiz
      };
      break;

    default:
      return next(new AppError('Invalid content type', 400));
  }

  const content = await Content.create(contentData);

  await content.populate([
    { path: 'createdBy', select: 'name email' },
    { path: 'lessonDetails', select: 'title' }
  ]);

  res.status(201).json({
    status: 'success',
    data: {
      content
    }
  });
});

// Update content (Instructor/Admin only)
const updateContent = catchAsync(async (req, res, next) => {
  const { courseId, lessonId, contentId } = req.params;

  const content = await Content.findOne({
    _id: contentId,
    lesson: lessonId,
    isDeleted: false
  });

  if (!content) {
    return next(new AppError('Content not found', 404));
  }

  // Check permissions
  if (req.user.role === 'instructor') {
    const course = await Course.findById(courseId);
    if (course.instructor.toString() !== req.user.id) {
      return next(new AppError('You can only update content for your own courses', 403));
    }
  }

  // Type-specific cleanup to remove unwanted fields
  if (req.body.data) {
    switch (content.type) {
      case 'text':
        // Clean up - only keep text field
        req.body.data = {
          text: req.body.data.text
        };
        break;

      case 'block':
      case 'blocks':
        // Handle backward compatibility: migrate 'items' to 'blocks' if needed
        if (req.body.data.items && !req.body.data.blocks) {
          req.body.data.blocks = req.body.data.items;
        }
        // Ensure blocks array exists
        if (!req.body.data.blocks || !Array.isArray(req.body.data.blocks)) {
          req.body.data.blocks = [];
        }
        // Clean up - only keep blocks array
        req.body.data = {
          blocks: req.body.data.blocks
        };
        break;

      case 'audio':
      case 'image':
      case 'document':
      case 'assignment':
        // Clean up - only keep relevant media fields
        req.body.data = {
          title: req.body.data.title,
          description: req.body.data.description,
          url: req.body.data.url,
          filename: req.body.data.filename,
          size: req.body.data.size,
          mimeType: req.body.data.mimeType,
          duration: req.body.data.duration,
          metadata: req.body.data.metadata
        };
        break;

      case 'video':
        // Clean up - only keep relevant video fields
        req.body.data = {
          title: req.body.data.title,
          description: req.body.data.description,
          url: req.body.data.url,
          filename: req.body.data.filename,
          size: req.body.data.size,
          mimeType: req.body.data.mimeType,
          duration: req.body.data.duration,
          embedUrl: req.body.data.embedUrl,
          metadata: req.body.data.metadata
        };
        break;

      case 'quiz':
        // Clean up - only keep quiz field
        req.body.data = {
          quiz: req.body.data.quiz
        };
        break;
    }
  }

  const updatedContent = await Content.findByIdAndUpdate(
    contentId,
    { ...req.body, lastModified: new Date() },
    { new: true, runValidators: true }
  ).populate([
    { path: 'createdBy', select: 'name email' },
    { path: 'lessonDetails', select: 'title' }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      content: updatedContent
    }
  });
});

// Delete content (Instructor/Admin only)
const deleteContent = catchAsync(async (req, res, next) => {
  const { courseId, lessonId, contentId } = req.params;

  const content = await Content.findOne({
    _id: contentId,
    lesson: lessonId,
    isDeleted: false
  });

  if (!content) {
    return next(new AppError('Content not found', 404));
  }

  // Check permissions
  if (req.user.role === 'instructor') {
    const course = await Course.findById(courseId);
    if (course.instructor.toString() !== req.user.id) {
      return next(new AppError('You can only delete content for your own courses', 403));
    }
  }

  // Soft delete the content
  await content.softDelete();

  // Update content orders for remaining content in the lesson
  await Content.updateMany(
    {
      lesson: lessonId,
      order: { $gt: content.order },
      isDeleted: false
    },
    { $inc: { order: -1 } }
  );

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Reorder content within a lesson
const reorderContent = catchAsync(async (req, res, next) => {
  const { courseId, lessonId } = req.params;
  const { content } = req.body;

  // Validate content array
  if (!content || !Array.isArray(content)) {
    return next(new AppError('Content array is required', 400));
  }

  // Verify lesson exists and belongs to course
  const lesson = await Lesson.findOne({
    _id: lessonId,
    course: courseId,
    isDeleted: false
  });
  if (!lesson) {
    return next(new AppError('Lesson not found', 404));
  }

  // Check permissions
  if (req.user.role === 'instructor') {
    const course = await Course.findById(courseId);
    if (course.instructor.toString() !== req.user.id) {
      return next(new AppError('You can only reorder content for your own courses', 403));
    }
  }

  // Validate that all content belongs to the lesson
  const contentIds = content.map(c => c._id);
  const validContent = await Content.find({
    _id: { $in: contentIds },
    lesson: lessonId,
    isDeleted: false
  });

  if (validContent.length !== content.length) {
    return next(new AppError('Some content does not belong to this lesson', 400));
  }

  // Reorder content
  await Content.reorderContent(lessonId, content);

  // Fetch updated content
  const updatedContent = await Content.findByLesson(lessonId);

  res.status(200).json({
    status: 'success',
    data: {
      content: updatedContent
    }
  });
});

// Move content between lessons
const moveContent = catchAsync(async (req, res, next) => {
  const { courseId, lessonId, contentId } = req.params;
  const { targetLessonId, newOrder } = req.body;

  // Verify content exists
  const content = await Content.findOne({
    _id: contentId,
    lesson: lessonId,
    isDeleted: false
  });

  if (!content) {
    return next(new AppError('Content not found', 404));
  }

  // Verify target lesson exists and belongs to same course
  const targetLesson = await Lesson.findOne({
    _id: targetLessonId,
    course: courseId,
    isDeleted: false
  });

  if (!targetLesson) {
    return next(new AppError('Target lesson not found', 404));
  }

  // Check permissions
  if (req.user.role === 'instructor') {
    const course = await Course.findById(courseId);
    if (course.instructor.toString() !== req.user.id) {
      return next(new AppError('You can only move content within your own courses', 403));
    }
  }

  // Calculate new order if not provided
  const calculatedOrder = newOrder || await Content.getNextOrder(targetLessonId);

  // Move the content
  await Content.moveContent(contentId, lessonId, targetLessonId, calculatedOrder);

  // Fetch updated content
  const updatedContent = await Content.findById(contentId)
    .populate('createdBy', 'name email')
    .populate('lessonDetails', 'title');

  res.status(200).json({
    status: 'success',
    data: {
      content: updatedContent
    }
  });
});

// Get content by type across all lessons in a course
const getContentByType = catchAsync(async (req, res, next) => {
  const { courseId } = req.params;
  const { type } = req.query;

  // Verify course exists
  const course = await Course.findById(courseId);
  if (!course) {
    return next(new AppError('Course not found', 404));
  }

  // Check permissions
  let canViewUnpublished = false;
  if (req.user.role === 'instructor' && course.instructor.toString() === req.user.id) {
    canViewUnpublished = true;
  } else if (['org_admin', 'super_admin'].includes(req.user.role)) {
    canViewUnpublished = true;
  }

  // Get all lessons for the course
  const lessons = await Lesson.find({
    course: courseId,
    isDeleted: false
  }).select('_id');

  const lessonIds = lessons.map(lesson => lesson._id);

  let filter = {
    lesson: { $in: lessonIds },
    isDeleted: false
  };

  if (type) {
    filter.type = type;
  }

  if (!canViewUnpublished) {
    filter.isPublished = true;
  }

  const content = await Content.find(filter)
    .populate('createdBy', 'name email')
    .populate('lessonDetails', 'title')
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: 'success',
    results: content.length,
    data: {
      content
    }
  });
});

// Bulk operations for content
const bulkUpdateContent = catchAsync(async (req, res, next) => {
  const { courseId, lessonId } = req.params;
  const { operations } = req.body;

  // Check permissions
  if (req.user.role === 'instructor') {
    const course = await Course.findById(courseId);
    if (course.instructor.toString() !== req.user.id) {
      return next(new AppError('You can only update content for your own courses', 403));
    }
  }

  const bulkOps = operations.map(op => {
    switch (op.action) {
      case 'update':
        return {
          updateOne: {
            filter: { _id: op.contentId, lesson: lessonId },
            update: { ...op.data, lastModified: new Date() }
          }
        };
      case 'delete':
        return {
          updateOne: {
            filter: { _id: op.contentId, lesson: lessonId },
            update: { isDeleted: true, deletedAt: new Date(), isActive: false }
          }
        };
      default:
        throw new AppError('Invalid bulk operation action', 400);
    }
  });

  await Content.bulkWrite(bulkOps);

  res.status(200).json({
    status: 'success',
    message: `${bulkOps.length} operations completed successfully`
  });
});

module.exports = {
  getContentByLesson,
  getContentById,
  createContent,
  updateContent,
  deleteContent,
  reorderContent,
  moveContent,
  getContentByType,
  bulkUpdateContent
};