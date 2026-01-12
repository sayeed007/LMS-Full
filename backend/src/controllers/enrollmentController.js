const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

// Get all enrollments with filtering
const getAllEnrollments = catchAsync(async (req, res, next) => {
  let filter = {};

  // For students, only show their own enrollments
  if (req.user.role === 'student') {
    filter.user = req.user.id;
  }

  // For instructors, show enrollments for their courses only
  if (req.user.role === 'instructor') {
    const instructorCourses = await Course.find({ instructor: req.user.id }).select('_id');
    filter.course = { $in: instructorCourses.map(c => c._id) };
  }

  // Apply additional filters
  if (req.query.status) {
    filter.status = req.query.status;
  }

  if (req.query.course) {
    filter.course = req.query.course;
  }

  if (req.query.user && ['org_admin', 'super_admin'].includes(req.user.role)) {
    filter.user = req.query.user;
  }

  const features = new APIFeatures(Enrollment.find(filter), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const enrollments = await features.query
    .populate('user', 'name email avatar')
    .populate('course', 'title thumbnail instructor duration price category level')
    .populate('progress.currentLesson', 'title');

  const total = await Enrollment.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    results: enrollments.length,
    total,
    data: {
      enrollments
    }
  });
});

// Get single enrollment by ID
const getEnrollmentById = catchAsync(async (req, res, next) => {
  let query = Enrollment.findById(req.params.id)
    .populate('user', 'name email avatar')
    .populate('course', 'title description thumbnail instructor chapters')
    .populate('progress.currentLesson', 'title')
    .populate('lessonProgress.lesson', 'title')
    .populate('quizScores.quiz', 'title')
    .populate('assignmentSubmissions.assignment', 'title');

  const enrollment = await query;

  if (!enrollment) {
    return next(new AppError('No enrollment found with that ID', 404));
  }

  // Check access permissions
  if (req.user.role === 'student' && enrollment.user._id.toString() !== req.user.id) {
    return next(new AppError('You can only access your own enrollments', 403));
  }

  if (req.user.role === 'instructor') {
    const course = await Course.findById(enrollment.course._id);
    if (course.instructor.toString() !== req.user.id) {
      return next(new AppError('You can only access enrollments for your courses', 403));
    }
  }

  res.status(200).json({
    status: 'success',
    data: {
      enrollment
    }
  });
});

// Get current user's enrollments
const getMyEnrollments = catchAsync(async (req, res, next) => {
  let filter = { user: req.user.id };

  if (req.query.status) {
    filter.status = req.query.status;
  }

  const features = new APIFeatures(Enrollment.find(filter), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const enrollments = await features.query
    .populate({
      path: 'course',
      select: 'title description thumbnail instructor duration price category level rating stats',
      populate: {
        path: 'instructor',
        select: 'name avatar'
      }
    })
    .populate('progress.currentLesson', 'title');

  const total = await Enrollment.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    results: enrollments.length,
    total,
    data: {
      enrollments
    }
  });
});

// Get enrollments for a specific course
const getCourseEnrollments = catchAsync(async (req, res, next) => {
  const course = await Course.findById(req.params.courseId);

  if (!course) {
    return next(new AppError('Course not found', 404));
  }

  // Check permissions - only instructor and admins can view course enrollments
  if (req.user.role === 'instructor' && course.instructor.toString() !== req.user.id) {
    return next(new AppError('You can only view enrollments for your own courses', 403));
  }

  let filter = { course: req.params.courseId };

  if (req.query.status) {
    filter.status = req.query.status;
  }

  const features = new APIFeatures(Enrollment.find(filter), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const enrollments = await features.query
    .populate('user', 'name email avatar')
    .populate('progress.currentLesson', 'title');

  const total = await Enrollment.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    results: enrollments.length,
    total,
    data: {
      enrollments
    }
  });
});

// Enroll in a course
const enrollInCourse = catchAsync(async (req, res, next) => {
  const { courseId, userId } = req.body;

  // Default to current user if no userId provided
  const targetUserId = userId || req.user.id;

  // Check if user can enroll others
  if (userId && userId !== req.user.id && !['org_admin', 'super_admin'].includes(req.user.role)) {
    return next(new AppError('You can only enroll yourself', 403));
  }

  const course = await Course.findById(courseId);
  if (!course) {
    return next(new AppError('Course not found', 404));
  }

  // Check if course is published and available
  if (!course.isPublished || !course.isApproved) {
    return next(new AppError('This course is not available for enrollment', 400));
  }

  // Check enrollment capacity
  if (course.settings.maxStudents && course.stats.totalEnrollments >= course.settings.maxStudents) {
    return next(new AppError('Course enrollment is full', 400));
  }

  // Check enrollment deadline
  if (course.settings.enrollmentDeadline && new Date() > course.settings.enrollmentDeadline) {
    return next(new AppError('Enrollment deadline has passed', 400));
  }

  // Check if user is already enrolled
  const existingEnrollment = await Enrollment.findOne({
    user: targetUserId,
    course: courseId,
    isActive: true
  });

  if (existingEnrollment) {
    return next(new AppError('User is already enrolled in this course', 400));
  }

  // Create enrollment
  const enrollmentData = {
    user: targetUserId,
    course: courseId,
    enrollmentSource: userId ? (req.user.id === targetUserId ? 'self' : 'admin') : 'self',
    enrolledBy: req.user.id
  };

  // Handle payment for paid courses
  if (course.price > 0) {
    enrollmentData.payment = {
      amount: course.price,
      currency: 'USD'
    };
  }

  const enrollment = await Enrollment.create(enrollmentData);

  await enrollment.populate([
    { path: 'user', select: 'name email avatar' },
    { path: 'course', select: 'title thumbnail instructor duration price' },
    { path: 'enrolledBy', select: 'name email' }
  ]);

  // Update course stats
  await Course.findByIdAndUpdate(courseId, {
    $inc: { 'stats.totalEnrollments': 1 }
  });

  res.status(201).json({
    status: 'success',
    data: {
      enrollment
    }
  });
});

// Bulk enrollment
const bulkEnroll = catchAsync(async (req, res, next) => {
  const { courseId, userIds } = req.body;

  if (!['org_admin', 'super_admin'].includes(req.user.role)) {
    return next(new AppError('You do not have permission to perform bulk enrollment', 403));
  }

  const course = await Course.findById(courseId);
  if (!course) {
    return next(new AppError('Course not found', 404));
  }

  const enrollments = [];
  const failed = [];

  for (const userId of userIds) {
    try {
      // Check if user exists
      const user = await User.findById(userId);
      if (!user) {
        failed.push({ userId, error: 'User not found' });
        continue;
      }

      // Check if already enrolled
      const existingEnrollment = await Enrollment.findOne({
        user: userId,
        course: courseId,
        isActive: true
      });

      if (existingEnrollment) {
        failed.push({ userId, error: 'Already enrolled' });
        continue;
      }

      // Create enrollment
      const enrollment = await Enrollment.create({
        user: userId,
        course: courseId,
        enrollmentSource: 'bulk',
        enrolledBy: req.user.id
      });

      await enrollment.populate('user', 'name email');
      enrollments.push(enrollment);

    } catch (error) {
      failed.push({ userId, error: error.message });
    }
  }

  // Update course stats
  if (enrollments.length > 0) {
    await Course.findByIdAndUpdate(courseId, {
      $inc: { 'stats.totalEnrollments': enrollments.length }
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      enrollments,
      failed,
      summary: {
        total: userIds.length,
        successful: enrollments.length,
        failed: failed.length
      }
    }
  });
});

// Unenroll from course
const unenrollFromCourse = catchAsync(async (req, res, next) => {
  const enrollment = await Enrollment.findById(req.params.id);

  if (!enrollment) {
    return next(new AppError('Enrollment not found', 404));
  }

  // Check permissions
  if (req.user.role === 'student' && enrollment.user.toString() !== req.user.id) {
    return next(new AppError('You can only unenroll yourself', 403));
  }

  // Mark as dropped instead of deleting
  enrollment.status = 'dropped';
  enrollment.isActive = false;
  await enrollment.save();

  // Update course stats
  await Course.findByIdAndUpdate(enrollment.course, {
    $inc: { 'stats.totalEnrollments': -1 }
  });

  res.status(200).json({
    status: 'success',
    data: {
      message: 'Successfully unenrolled from course'
    }
  });
});

// Update progress
const updateProgress = catchAsync(async (req, res, next) => {
  const { lessonId, completed, timeSpent = 0 } = req.body;

  const enrollment = await Enrollment.findById(req.params.id);

  if (!enrollment) {
    return next(new AppError('Enrollment not found', 404));
  }

  // Check permissions
  if (enrollment.user.toString() !== req.user.id) {
    return next(new AppError('You can only update your own progress', 403));
  }

  if (completed) {
    await enrollment.updateProgress(lessonId, timeSpent);
    await enrollment.calculateProgress();
  } else {
    // Update time spent even if not completed
    const existingProgress = enrollment.lessonProgress.find(
      lp => lp.lesson.toString() === lessonId.toString()
    );

    if (existingProgress) {
      existingProgress.timeSpent += timeSpent;
      existingProgress.lastAccessedAt = new Date();
    } else {
      enrollment.lessonProgress.push({
        lesson: lessonId,
        completed: false,
        timeSpent,
        lastAccessedAt: new Date()
      });
    }

    enrollment.progress.timeSpent += timeSpent;
    enrollment.progress.currentLesson = lessonId;
    enrollment.progress.lastAccessed = new Date();
    await enrollment.save();
  }

  await enrollment.populate([
    { path: 'progress.currentLesson', select: 'title' },
    { path: 'lessonProgress.lesson', select: 'title' }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      enrollment
    }
  });
});

// Mark course as complete
const markCourseComplete = catchAsync(async (req, res, next) => {
  const enrollment = await Enrollment.findById(req.params.id);

  if (!enrollment) {
    return next(new AppError('Enrollment not found', 404));
  }

  // Check permissions
  if (enrollment.user.toString() !== req.user.id && !['instructor', 'org_admin', 'super_admin'].includes(req.user.role)) {
    return next(new AppError('You do not have permission to mark this course as complete', 403));
  }

  enrollment.status = 'completed';
  enrollment.progress.completionPercentage = 100;
  enrollment.completedAt = new Date();

  await enrollment.save();

  res.status(200).json({
    status: 'success',
    data: {
      enrollment
    }
  });
});

// Rate course
const rateCourse = catchAsync(async (req, res, next) => {
  const { rating, review } = req.body;

  const enrollment = await Enrollment.findById(req.params.id);

  if (!enrollment) {
    return next(new AppError('Enrollment not found', 404));
  }

  // Check permissions
  if (enrollment.user.toString() !== req.user.id) {
    return next(new AppError('You can only rate courses you are enrolled in', 403));
  }

  await enrollment.addRating(rating, review);

  // Update course rating
  const course = await Course.findById(enrollment.course);
  if (course) {
    const allRatings = await Enrollment.find({
      course: enrollment.course,
      'rating.value': { $exists: true }
    }).select('rating.value');

    if (allRatings.length > 0) {
      const average = allRatings.reduce((sum, r) => sum + r.rating.value, 0) / allRatings.length;
      course.rating.average = Math.round(average * 10) / 10;
      course.rating.count = allRatings.length;
      await course.save();
    }
  }

  res.status(200).json({
    status: 'success',
    data: {
      enrollment
    }
  });
});

// Update rating
const updateRating = catchAsync(async (req, res, next) => {
  const { rating, review } = req.body;

  const enrollment = await Enrollment.findById(req.params.id);

  if (!enrollment) {
    return next(new AppError('Enrollment not found', 404));
  }

  if (enrollment.user.toString() !== req.user.id) {
    return next(new AppError('You can only update your own ratings', 403));
  }

  if (!enrollment.rating) {
    return next(new AppError('No existing rating found to update', 404));
  }

  enrollment.rating.value = rating;
  enrollment.rating.review = review;
  enrollment.rating.submittedAt = new Date();

  await enrollment.save();

  res.status(200).json({
    status: 'success',
    data: {
      enrollment
    }
  });
});

// Delete rating
const deleteRating = catchAsync(async (req, res, next) => {
  const enrollment = await Enrollment.findById(req.params.id);

  if (!enrollment) {
    return next(new AppError('Enrollment not found', 404));
  }

  if (enrollment.user.toString() !== req.user.id) {
    return next(new AppError('You can only delete your own ratings', 403));
  }

  enrollment.rating = undefined;
  await enrollment.save();

  res.status(200).json({
    status: 'success',
    data: {
      enrollment
    }
  });
});

// Generate certificate
const generateCertificate = catchAsync(async (req, res, next) => {
  const enrollment = await Enrollment.findById(req.params.id)
    .populate('user', 'name email')
    .populate('course', 'title instructor');

  if (!enrollment) {
    return next(new AppError('Enrollment not found', 404));
  }

  if (enrollment.user._id.toString() !== req.user.id && !['instructor', 'org_admin', 'super_admin'].includes(req.user.role)) {
    return next(new AppError('You do not have permission to generate this certificate', 403));
  }

  if (enrollment.status !== 'completed') {
    return next(new AppError('Cannot generate certificate for incomplete course', 400));
  }

  await enrollment.issueCertificate();

  // Here you would typically generate the actual PDF certificate
  // For now, we'll just set a placeholder URL
  enrollment.certificate.downloadUrl = `/api/v1/enrollments/${enrollment._id}/certificate/download`;
  await enrollment.save();

  res.status(200).json({
    status: 'success',
    data: {
      enrollment,
      certificateUrl: enrollment.certificate.downloadUrl
    }
  });
});

// Download certificate (placeholder)
const downloadCertificate = catchAsync(async (req, res, next) => {
  const enrollment = await Enrollment.findById(req.params.id)
    .populate('user', 'name email')
    .populate('course', 'title instructor');

  if (!enrollment) {
    return next(new AppError('Enrollment not found', 404));
  }

  if (!enrollment.certificate || !enrollment.certificate.issued) {
    return next(new AppError('Certificate not found or not issued', 404));
  }

  // For now, return a placeholder response
  // In a real implementation, you would generate and return a PDF
  res.status(501).json({
    status: 'error',
    message: 'Certificate download not implemented yet'
  });
});

// Get enrollment statistics
const getEnrollmentStats = catchAsync(async (req, res, next) => {
  const { courseId, userId } = req.query;

  let filters = {};

  if (courseId) {
    filters.courseId = courseId;
  }

  if (userId) {
    filters.userId = userId;
  }

  // For instructors, limit to their courses
  if (req.user.role === 'instructor' && !courseId) {
    const instructorCourses = await Course.find({ instructor: req.user.id }).select('_id');
    filters.courseId = { $in: instructorCourses.map(c => c._id) };
  }

  const stats = await Enrollment.getStats(filters);

  res.status(200).json({
    status: 'success',
    data: stats
  });
});

// Update progress by course ID (for compatibility with course routes)
const updateCourseProgress = catchAsync(async (req, res, next) => {
  const { courseId, lessonId, completed, timeSpent = 0 } = req.body;

  const enrollment = await Enrollment.findOne({
    user: req.user.id,
    course: courseId,
    isActive: true
  });

  if (!enrollment) {
    return next(new AppError('You are not enrolled in this course', 404));
  }

  if (completed) {
    await enrollment.updateProgress(lessonId, timeSpent);
    await enrollment.calculateProgress();
  } else {
    // Update time spent even if not completed
    let existingProgress = enrollment.lessonProgress.find(
      lp => lp.lesson.toString() === lessonId.toString()
    );

    if (existingProgress) {
      existingProgress.timeSpent += timeSpent;
      existingProgress.lastAccessedAt = new Date();
    } else {
      enrollment.lessonProgress.push({
        lesson: lessonId,
        completed: false,
        timeSpent,
        lastAccessedAt: new Date()
      });
    }

    enrollment.progress.timeSpent += timeSpent;
    enrollment.progress.currentLesson = lessonId;
    enrollment.progress.lastAccessed = new Date();
    await enrollment.save();
  }

  res.status(200).json({
    status: 'success',
    data: {
      enrollment
    }
  });
});

// Get progress for a course
const getProgress = catchAsync(async (req, res, next) => {
  const { courseId } = req.params;
  const { userId } = req.query;

  const targetUserId = userId || req.user.id;

  // Check permissions
  if (userId && userId !== req.user.id && req.user.role === 'student') {
    return next(new AppError('You can only view your own progress', 403));
  }

  const enrollment = await Enrollment.findOne({
    user: targetUserId,
    course: courseId,
    isActive: true
  }).populate('progress.currentLesson', 'title');

  if (!enrollment) {
    return next(new AppError('Enrollment not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      progress: enrollment.progress
    }
  });
});

// Get detailed progress
const getDetailedProgress = catchAsync(async (req, res, next) => {
  const enrollment = await Enrollment.findById(req.params.id)
    .populate('user', 'name email avatar')
    .populate('course', 'title chapters')
    .populate('progress.currentLesson', 'title')
    .populate('lessonProgress.lesson', 'title order')
    .populate('quizScores.quiz', 'title')
    .populate('assignmentSubmissions.assignment', 'title');

  if (!enrollment) {
    return next(new AppError('Enrollment not found', 404));
  }

  // Check permissions
  if (req.user.role === 'student' && enrollment.user._id.toString() !== req.user.id) {
    return next(new AppError('You can only view your own progress', 403));
  }

  res.status(200).json({
    status: 'success',
    data: {
      enrollment,
      lessonProgress: enrollment.lessonProgress
    }
  });
});

module.exports = {
  getAllEnrollments,
  getEnrollmentById,
  getMyEnrollments,
  getCourseEnrollments,
  enrollInCourse,
  bulkEnroll,
  unenrollFromCourse,
  updateProgress,
  markCourseComplete,
  rateCourse,
  updateRating,
  deleteRating,
  generateCertificate,
  downloadCertificate,
  getEnrollmentStats,
  getProgress,
  getDetailedProgress,
  updateCourseProgress
};