const mongoose = require('mongoose');
const Chapter = require('../models/Chapter');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

// Get all chapters for a course
const getChapters = catchAsync(async (req, res, next) => {
  const { courseId } = req.params;

  // Verify course exists
  const course = await Course.findById(courseId);
  if (!course) {
    return next(new AppError('Course not found', 404));
  }

  // Check if user has access to course
  let canViewUnpublished = false;

  // Check if user is authenticated
  if (req.user) {
    if (req.user.role === 'instructor' && course.instructor.toString() === req.user.id) {
      canViewUnpublished = true;
    } else if (['org_admin', 'super_admin'].includes(req.user.role)) {
      canViewUnpublished = true;
    }
  } else {
    // Unauthenticated users can only view published courses
    if (!course.isPublished) {
      return next(new AppError('You do not have access to this course', 403));
    }
  }

  let filter = {
    course: courseId,
    isDeleted: false
  };

  // For non-owners, only show published chapters
  if (!canViewUnpublished) {
    filter.isPublished = true;
  }

  const features = new APIFeatures(Chapter.find(filter), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const chapters = await features.query
    .populate('createdBy', 'name email')
    .populate({
      path: 'lessons',
      match: { isDeleted: false },
      options: { sort: { order: 1 } },
      populate: {
        path: 'createdBy',
        select: 'name email'
      }
    })
    .sort({ order: 1 });

  const total = await Chapter.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    results: chapters.length,
    total,
    data: {
      chapters
    }
  });
});

// Get single chapter by ID
const getChapterById = catchAsync(async (req, res, next) => {
  const { courseId, chapterId } = req.params;

  // Verify course exists
  const course = await Course.findById(courseId);
  if (!course) {
    return next(new AppError('Course not found', 404));
  }

  const chapter = await Chapter.findOne({
    _id: chapterId,
    course: courseId,
    isDeleted: false
  })
    .populate('createdBy', 'name email avatar')
    .populate({
      path: 'lessons',
      match: { isDeleted: false },
      options: { sort: { order: 1 } },
      populate: {
        path: 'createdBy',
        select: 'name email'
      }
    });

  if (!chapter) {
    return next(new AppError('Chapter not found', 404));
  }

  // Check access permissions
  let hasAccess = false;

  // Instructor and admin access
  if (req.user.role === 'instructor' && course.instructor.toString() === req.user.id) {
    hasAccess = true;
  } else if (['org_admin', 'super_admin'].includes(req.user.role)) {
    hasAccess = true;
  } else if (chapter.isPublished) {
    hasAccess = true;
  }

  if (!hasAccess) {
    return next(new AppError('You do not have access to this chapter', 403));
  }

  res.status(200).json({
    status: 'success',
    data: {
      chapter
    }
  });
});

// Create new chapter (Instructor/Admin only)
const createChapter = catchAsync(async (req, res, next) => {
  const { courseId } = req.params;

  // Verify course exists and user has access
  const course = await Course.findById(courseId);
  if (!course) {
    return next(new AppError('Course not found', 404));
  }

  // Check permissions
  if (req.user.role === 'instructor' && course.instructor.toString() !== req.user.id) {
    return next(new AppError('You can only create chapters for your own courses', 403));
  }

  // Get next order number if not provided
  if (!req.body.order) {
    req.body.order = await Chapter.getNextOrder(courseId);
  }

  const chapterData = {
    ...req.body,
    course: courseId,
    createdBy: req.user.id
  };

  const chapter = await Chapter.create(chapterData);

  await chapter.populate([
    { path: 'createdBy', select: 'name email' },
    {
      path: 'lessons',
      match: { isDeleted: false },
      options: { sort: { order: 1 } }
    }
  ]);

  res.status(201).json({
    status: 'success',
    data: {
      chapter
    }
  });
});

// Update chapter (Instructor/Admin only)
const updateChapter = catchAsync(async (req, res, next) => {
  const { courseId, chapterId } = req.params;

  const chapter = await Chapter.findOne({
    _id: chapterId,
    course: courseId,
    isDeleted: false
  });

  if (!chapter) {
    return next(new AppError('Chapter not found', 404));
  }

  // Check permissions
  if (req.user.role === 'instructor') {
    const course = await Course.findById(courseId);
    if (course.instructor.toString() !== req.user.id) {
      return next(new AppError('You can only update chapters for your own courses', 403));
    }
  }

  const updatedChapter = await Chapter.findByIdAndUpdate(
    chapterId,
    { ...req.body, lastModified: new Date() },
    { new: true, runValidators: true }
  ).populate([
    { path: 'createdBy', select: 'name email' },
    {
      path: 'lessons',
      match: { isDeleted: false },
      options: { sort: { order: 1 } }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      chapter: updatedChapter
    }
  });
});

// Delete chapter (Instructor/Admin only)
const deleteChapter = catchAsync(async (req, res, next) => {
  const { courseId, chapterId } = req.params;

  const chapter = await Chapter.findOne({
    _id: chapterId,
    course: courseId,
    isDeleted: false
  });

  if (!chapter) {
    return next(new AppError('Chapter not found', 404));
  }

  // Check permissions
  if (req.user.role === 'instructor') {
    const course = await Course.findById(courseId);
    if (course.instructor.toString() !== req.user.id) {
      return next(new AppError('You can only delete chapters for your own courses', 403));
    }
  }

  // Soft delete the chapter
  await chapter.softDelete();

  // Also soft delete all lessons in this chapter
  await Lesson.updateMany(
    { chapter: chapterId },
    {
      isDeleted: true,
      deletedAt: new Date(),
      isActive: false,
      order: null // Clear order to prevent conflicts
    }
  );

  // Update chapter orders for remaining chapters
  await Chapter.updateMany(
    {
      course: courseId,
      order: { $gt: chapter.order },
      isDeleted: false
    },
    { $inc: { order: -1 } }
  );

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Reorder chapters
const reorderChapters = catchAsync(async (req, res, next) => {
  const { courseId } = req.params;
  const { chapters } = req.body;

  // Verify course exists and user has access
  const course = await Course.findById(courseId);
  if (!course) {
    return next(new AppError('Course not found', 404));
  }

  // Check permissions
  if (req.user.role === 'instructor' && course.instructor.toString() !== req.user.id) {
    return next(new AppError('You can only reorder chapters for your own courses', 403));
  }

  // Validate that all chapters belong to the course
  const chapterIds = chapters.map(c => c._id);
  const validChapters = await Chapter.find({
    _id: { $in: chapterIds },
    course: courseId,
    isDeleted: false
  });

  if (validChapters.length !== chapters.length) {
    return next(new AppError('Some chapters do not belong to this course', 400));
  }

  // Reorder chapters
  await Chapter.reorderChapters(courseId, chapters);

  // Fetch updated chapters
  const updatedChapters = await Chapter.findByCourse(courseId);

  res.status(200).json({
    status: 'success',
    data: {
      chapters: updatedChapters
    }
  });
});

module.exports = {
  getChapters,
  getChapterById,
  createChapter,
  updateChapter,
  deleteChapter,
  reorderChapters
};