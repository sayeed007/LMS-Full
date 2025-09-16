const mongoose = require('mongoose');
const Lesson = require('../models/Lesson');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

// Get all lessons for a course
const getLessons = catchAsync(async (req, res, next) => {
  const { courseId } = req.params;

  // Verify course exists
  const course = await Course.findById(courseId);
  if (!course) {
    return next(new AppError('Course not found', 404));
  }

  // Check if user has access to course
  let canViewUnpublished = false;

  if (req.user.role === 'instructor' && course.instructor.toString() === req.user.id) {
    canViewUnpublished = true;
  } else if (['org_admin', 'super_admin'].includes(req.user.role)) {
    canViewUnpublished = true;
  } else {
    // Check if student is enrolled
    const enrollment = await Enrollment.findOne({
      user: req.user.id,
      course: courseId,
      isActive: true
    });

    if (!enrollment && !course.isPublished) {
      return next(new AppError('You do not have access to this course', 403));
    }
  }

  let filter = {
    course: courseId,
    isDeleted: false
  };

  // For students, only show published lessons unless it's a preview
  if (!canViewUnpublished) {
    filter.$or = [
      { isPublished: true },
      { isPreview: true }
    ];
  }

  const features = new APIFeatures(Lesson.find(filter), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const lessons = await features.query
    .populate('createdBy', 'name email')
    .populate('quiz', 'title passingScore')
    .populate('assignment', 'title dueDate')
    .sort({ order: 1 });

  const total = await Lesson.countDocuments(filter);

  // Track lesson views for enrolled students
  if (req.user.role === 'student') {
    const enrollment = await Enrollment.findOne({
      user: req.user.id,
      course: courseId,
      isActive: true
    });

    if (enrollment) {
      // You could track course access here
      enrollment.progress.lastAccessed = new Date();
      await enrollment.save();
    }
  }

  res.status(200).json({
    status: 'success',
    results: lessons.length,
    total,
    data: {
      lessons
    }
  });
});

// Get single lesson by ID
const getLessonById = catchAsync(async (req, res, next) => {
  const { courseId, lessonId } = req.params;

  // Verify course exists
  const course = await Course.findById(courseId);
  if (!course) {
    return next(new AppError('Course not found', 404));
  }

  const lesson = await Lesson.findOne({
    _id: lessonId,
    course: courseId,
    isDeleted: false
  })
    .populate('createdBy', 'name email avatar')
    .populate('quiz', 'title description passingScore timeLimit')
    .populate('assignment', 'title description dueDate');

  if (!lesson) {
    return next(new AppError('Lesson not found', 404));
  }

  // Check access permissions
  let hasAccess = false;

  // Instructor and admin access
  if (req.user.role === 'instructor' && course.instructor.toString() === req.user.id) {
    hasAccess = true;
  } else if (['org_admin', 'super_admin'].includes(req.user.role)) {
    hasAccess = true;
  } else {
    // Student access
    if (lesson.isPreview) {
      hasAccess = true;
    } else {
      // Check enrollment
      const enrollment = await Enrollment.findOne({
        user: req.user.id,
        course: courseId,
        isActive: true
      });

      if (enrollment && lesson.isPublished) {
        hasAccess = true;

        // Track lesson view
        await lesson.addView();

        // Update user's current lesson
        enrollment.progress.currentLesson = lessonId;
        enrollment.progress.lastAccessed = new Date();
        await enrollment.save();
      }
    }
  }

  if (!hasAccess) {
    return next(new AppError('You do not have access to this lesson', 403));
  }

  res.status(200).json({
    status: 'success',
    data: {
      lesson
    }
  });
});

// Create new lesson (Instructor/Admin only)
const createLesson = catchAsync(async (req, res, next) => {
  const { courseId } = req.params;

  // Verify course exists and user has access
  const course = await Course.findById(courseId);
  if (!course) {
    return next(new AppError('Course not found', 404));
  }

  // Check permissions
  if (req.user.role === 'instructor' && course.instructor.toString() !== req.user.id) {
    return next(new AppError('You can only create lessons for your own courses', 403));
  }

  // Get next order number if not provided
  if (!req.body.order) {
    req.body.order = await Lesson.getNextOrder(courseId);
  }

  const lessonData = {
    ...req.body,
    course: courseId,
    createdBy: req.user.id
  };

  const lesson = await Lesson.create(lessonData);

  await lesson.populate([
    { path: 'createdBy', select: 'name email' },
    { path: 'quiz', select: 'title' },
    { path: 'assignment', select: 'title' }
  ]);

  res.status(201).json({
    status: 'success',
    data: {
      lesson
    }
  });
});

// Update lesson (Instructor/Admin only)
const updateLesson = catchAsync(async (req, res, next) => {
  const { courseId, lessonId } = req.params;

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
      return next(new AppError('You can only update lessons for your own courses', 403));
    }
  }

  const updatedLesson = await Lesson.findByIdAndUpdate(
    lessonId,
    { ...req.body, lastModified: new Date() },
    { new: true, runValidators: true }
  ).populate([
    { path: 'createdBy', select: 'name email' },
    { path: 'quiz', select: 'title' },
    { path: 'assignment', select: 'title' }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      lesson: updatedLesson
    }
  });
});

// Delete lesson (Instructor/Admin only)
const deleteLesson = catchAsync(async (req, res, next) => {
  const { courseId, lessonId } = req.params;

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
      return next(new AppError('You can only delete lessons for your own courses', 403));
    }
  }

  // Soft delete the lesson
  await lesson.softDelete();

  // Update lesson orders for remaining lessons
  await Lesson.updateMany(
    {
      course: courseId,
      order: { $gt: lesson.order },
      isDeleted: false
    },
    { $inc: { order: -1 } }
  );

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Reorder lessons
const reorderLessons = catchAsync(async (req, res, next) => {
  const { courseId } = req.params;
  const { lessons } = req.body;

  // Verify course exists and user has access
  const course = await Course.findById(courseId);
  if (!course) {
    return next(new AppError('Course not found', 404));
  }

  // Check permissions
  if (req.user.role === 'instructor' && course.instructor.toString() !== req.user.id) {
    return next(new AppError('You can only reorder lessons for your own courses', 403));
  }

  // Validate that all lessons belong to the course
  const lessonIds = lessons.map(l => l._id);
  const validLessons = await Lesson.find({
    _id: { $in: lessonIds },
    course: courseId,
    isDeleted: false
  });

  if (validLessons.length !== lessons.length) {
    return next(new AppError('Some lessons do not belong to this course', 400));
  }

  // Reorder lessons
  await Lesson.reorderLessons(courseId, lessons);

  // Fetch updated lessons
  const updatedLessons = await Lesson.findByCourse(courseId, { published: true });

  res.status(200).json({
    status: 'success',
    data: {
      lessons: updatedLessons
    }
  });
});

// Complete lesson (Student only)
const completeLesson = catchAsync(async (req, res, next) => {
  const { courseId, lessonId } = req.params;
  const { timeSpent = 0 } = req.body;

  // Check enrollment
  const enrollment = await Enrollment.findOne({
    user: req.user.id,
    course: courseId,
    isActive: true
  });

  if (!enrollment) {
    return next(new AppError('You are not enrolled in this course', 403));
  }

  // Verify lesson exists and is published
  const lesson = await Lesson.findOne({
    _id: lessonId,
    course: courseId,
    isPublished: true,
    isDeleted: false
  });

  if (!lesson) {
    return next(new AppError('Lesson not found or not available', 404));
  }

  // Update enrollment progress
  await enrollment.updateProgress(lessonId, timeSpent);
  await enrollment.calculateProgress();

  // Update lesson completion count
  await lesson.markComplete();

  res.status(200).json({
    status: 'success',
    data: {
      message: 'Lesson completed successfully',
      progress: enrollment.progress
    }
  });
});

// Get lesson statistics (Instructor/Admin only)
const getLessonStats = catchAsync(async (req, res, next) => {
  const { courseId, lessonId } = req.params;

  // Verify course and lesson
  const course = await Course.findById(courseId);
  if (!course) {
    return next(new AppError('Course not found', 404));
  }

  const lesson = await Lesson.findOne({
    _id: lessonId,
    course: courseId,
    isDeleted: false
  });

  if (!lesson) {
    return next(new AppError('Lesson not found', 404));
  }

  // Check permissions
  if (req.user.role === 'instructor' && course.instructor.toString() !== req.user.id) {
    return next(new AppError('You can only view stats for your own course lessons', 403));
  }

  // Get enrollment progress for this lesson
  const enrollmentStats = await Enrollment.aggregate([
    {
      $match: {
        course: mongoose.Types.ObjectId(courseId),
        isActive: true
      }
    },
    {
      $project: {
        hasCompleted: {
          $in: [mongoose.Types.ObjectId(lessonId), '$progress.completedLessons']
        },
        timeSpent: {
          $reduce: {
            input: '$lessonProgress',
            initialValue: 0,
            in: {
              $cond: [
                { $eq: ['$$this.lesson', mongoose.Types.ObjectId(lessonId)] },
                '$$this.timeSpent',
                '$$value'
              ]
            }
          }
        }
      }
    },
    {
      $group: {
        _id: null,
        totalEnrollments: { $sum: 1 },
        completedCount: {
          $sum: { $cond: ['$hasCompleted', 1, 0] }
        },
        averageTimeSpent: { $avg: '$timeSpent' }
      }
    }
  ]);

  const stats = enrollmentStats[0] || {
    totalEnrollments: 0,
    completedCount: 0,
    averageTimeSpent: 0
  };

  stats.completionRate = stats.totalEnrollments > 0 ?
    (stats.completedCount / stats.totalEnrollments) * 100 : 0;

  res.status(200).json({
    status: 'success',
    data: {
      lesson: {
        _id: lesson._id,
        title: lesson.title,
        views: lesson.views,
        completions: lesson.completions
      },
      stats
    }
  });
});

// Add resource to lesson
const addResource = catchAsync(async (req, res, next) => {
  const { courseId, lessonId } = req.params;

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
      return next(new AppError('You can only add resources to your own course lessons', 403));
    }
  }

  await lesson.addResource(req.body);

  res.status(200).json({
    status: 'success',
    data: {
      lesson
    }
  });
});

// Remove resource from lesson
const removeResource = catchAsync(async (req, res, next) => {
  const { courseId, lessonId, resourceId } = req.params;

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
      return next(new AppError('You can only remove resources from your own course lessons', 403));
    }
  }

  await lesson.removeResource(resourceId);

  res.status(200).json({
    status: 'success',
    data: {
      lesson
    }
  });
});

module.exports = {
  getLessons,
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson,
  reorderLessons,
  completeLesson,
  getLessonStats,
  addResource,
  removeResource
};