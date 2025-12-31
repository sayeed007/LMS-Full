const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const User = require('../models/User');
const Article = require('../models/Article');
const ArticleAnalytics = require('../models/ArticleAnalytics');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const mongoose = require('mongoose');
const { convertToCSV, formatDateForCSV, formatTimeForCSV } = require('../utils/csvExporter');

/**
 * @desc    Get individual learner report
 * @route   GET /api/v1/reports/learner/:id
 * @access  Private (Student themselves, Instructor, Admin)
 */
const getIndividualLearnerReport = catchAsync(async (req, res, next) => {
  const learnerId = req.params.id;
  const requestingUser = req.user;

  // Authorization check
  if (
    requestingUser.role === 'student' &&
    requestingUser._id.toString() !== learnerId
  ) {
    return next(new AppError('You can only access your own reports', 403));
  }

  // Get learner information
  const learner = await User.findById(learnerId).select('name email avatar role createdAt');
  if (!learner) {
    return next(new AppError('Learner not found', 404));
  }

  // Get all enrollments for the learner
  const enrollments = await Enrollment.find({ user: learnerId })
    .populate({
      path: 'course',
      select: 'title description thumbnail instructor duration category level'
    })
    .sort({ enrolledAt: -1 });

  // Calculate statistics
  const stats = {
    courseEnrolled: enrollments.length,
    yetToStart: enrollments.filter(e => e.progress.completionPercentage === 0).length,
    inProgress: enrollments.filter(e => e.status === 'active' && e.progress.completionPercentage > 0 && e.progress.completionPercentage < 100).length,
    completed: enrollments.filter(e => e.status === 'completed' || e.progress.completionPercentage === 100).length,
    totalTimeSpent: enrollments.reduce((sum, e) => sum + (e.progress.timeSpent || 0), 0),
    averageCompletionRate: enrollments.length > 0
      ? enrollments.reduce((sum, e) => sum + e.progress.completionPercentage, 0) / enrollments.length
      : 0
  };

  // Format course data
  const courses = enrollments.map(enrollment => ({
    _id: enrollment._id,
    courseId: enrollment.course._id,
    courseName: enrollment.course.title,
    thumbnail: enrollment.course.thumbnail,
    enrollDate: enrollment.enrolledAt,
    completedDate: enrollment.completedAt || null,
    timeSpent: enrollment.progress.timeSpent || 0,
    completionPercentage: enrollment.progress.completionPercentage || 0,
    status: getStatusText(enrollment),
    category: enrollment.course.category,
    level: enrollment.course.level
  }));

  res.status(200).json({
    status: 'success',
    data: {
      learner: {
        _id: learner._id,
        name: learner.name,
        email: learner.email,
        avatar: learner.avatar,
        memberSince: learner.createdAt
      },
      stats,
      courses
    }
  });
});

/**
 * @desc    Get individual learner's course progress
 * @route   GET /api/v1/reports/learner/:id/courses/:courseId
 * @access  Private
 */
const getIndividualLearnerCourseProgress = catchAsync(async (req, res, next) => {
  const { id: learnerId, courseId } = req.params;

  // Authorization check
  if (
    req.user.role === 'student' &&
    req.user._id.toString() !== learnerId
  ) {
    return next(new AppError('You can only access your own reports', 403));
  }

  // Get enrollment
  const enrollment = await Enrollment.findOne({
    user: learnerId,
    course: courseId
  })
    .populate({
      path: 'course',
      select: 'title description chapters',
      populate: {
        path: 'chapters.lessons',
        select: 'title type duration order'
      }
    })
    .populate('lessonProgress.lesson', 'title type duration');

  if (!enrollment) {
    return next(new AppError('Enrollment not found', 404));
  }

  // Get course details
  const course = enrollment.course;

  // Build lesson progress array
  const lessonProgressMap = new Map();
  enrollment.lessonProgress.forEach(lp => {
    lessonProgressMap.set(lp.lesson._id.toString(), {
      completed: lp.completed,
      timeSpent: lp.timeSpent,
      completedAt: lp.completedAt,
      lastAccessedAt: lp.lastAccessedAt
    });
  });

  // Get all lessons from course
  const lessons = [];
  course.chapters.forEach((chapter, chapterIndex) => {
    chapter.lessons.forEach((lesson, lessonIndex) => {
      const progress = lessonProgressMap.get(lesson._id.toString()) || {
        completed: false,
        timeSpent: 0,
        completedAt: null,
        lastAccessedAt: null
      };

      lessons.push({
        _id: lesson._id,
        title: lesson.title,
        type: lesson.type,
        duration: lesson.duration,
        order: lesson.order || (lessonIndex + 1),
        chapter: chapter.title,
        chapterOrder: chapterIndex + 1,
        startDate: progress.lastAccessedAt,
        timeSpent: progress.timeSpent,
        completionPercentage: progress.completed ? 100 : 0,
        status: progress.completed ? 'Complete' : progress.lastAccessedAt ? 'In Progress' : 'Yet to Start',
        completedAt: progress.completedAt
      });
    });
  });

  // Course stats
  const courseStats = {
    completed: enrollment.progress.completionPercentage,
    timeSpent: Math.round(enrollment.progress.timeSpent / 3600), // Convert to hours
    totalLessons: lessons.length,
    completedLessons: lessons.filter(l => l.status === 'Complete').length,
    inProgressLessons: lessons.filter(l => l.status === 'In Progress').length,
    yetToStartLessons: lessons.filter(l => l.status === 'Yet to Start').length
  };

  res.status(200).json({
    status: 'success',
    data: {
      course: {
        _id: course._id,
        title: course.title,
        description: course.description
      },
      enrollment: {
        _id: enrollment._id,
        enrolledAt: enrollment.enrolledAt,
        status: enrollment.status
      },
      stats: courseStats,
      lessons
    }
  });
});

/**
 * @desc    Get individual course report
 * @route   GET /api/v1/reports/course/:id
 * @access  Private (Instructor, Admin)
 */
const getIndividualCourseReport = catchAsync(async (req, res, next) => {
  const courseId = req.params.id;
  const requestingUser = req.user;

  // Get course
  const course = await Course.findById(courseId)
    .populate('instructor', 'name email')
    .populate('chapters.lessons', 'title type duration order');

  if (!course) {
    return next(new AppError('Course not found', 404));
  }

  // Authorization check for instructors
  if (
    requestingUser.role === 'instructor' &&
    course.instructor._id.toString() !== requestingUser._id.toString()
  ) {
    return next(new AppError('You can only access reports for your own courses', 403));
  }

  // Get all enrollments for the course
  const enrollments = await Enrollment.find({ course: courseId })
    .populate('user', 'name email avatar');

  // Calculate statistics
  const stats = {
    totalLearners: enrollments.length,
    yetToStart: enrollments.filter(e => e.progress.completionPercentage === 0).length,
    inProgress: enrollments.filter(e => e.status === 'active' && e.progress.completionPercentage > 0 && e.progress.completionPercentage < 100).length,
    completed: enrollments.filter(e => e.status === 'completed' || e.progress.completionPercentage === 100).length
  };

  // Format user data
  const users = enrollments.map(enrollment => ({
    _id: enrollment.user._id,
    name: enrollment.user.name,
    email: enrollment.user.email,
    avatar: enrollment.user.avatar,
    userId: enrollment.user._id,
    enrollDate: enrollment.enrolledAt,
    completedDate: enrollment.completedAt || null,
    timeSpent: enrollment.progress.timeSpent || 0,
    completionPercentage: enrollment.progress.completionPercentage || 0,
    status: getStatusText(enrollment)
  }));

  // Get lesson-wise analytics
  const allLessons = [];
  course.chapters.forEach(chapter => {
    chapter.lessons.forEach(lesson => {
      allLessons.push({
        _id: lesson._id,
        title: lesson.title,
        type: lesson.type,
        duration: lesson.duration
      });
    });
  });

  const lessonStats = allLessons.map(lesson => {
    const lessonId = lesson._id.toString();
    let yetToStart = 0;
    let inProgress = 0;
    let completed = 0;

    enrollments.forEach(enrollment => {
      const lessonProgress = enrollment.lessonProgress.find(
        lp => lp.lesson.toString() === lessonId
      );

      if (!lessonProgress || (!lessonProgress.completed && !lessonProgress.lastAccessedAt)) {
        yetToStart++;
      } else if (lessonProgress.completed) {
        completed++;
      } else {
        inProgress++;
      }
    });

    return {
      _id: lesson._id,
      lesson: lesson.title,
      type: lesson.type,
      yetToStart,
      inProgress,
      completed
    };
  });

  res.status(200).json({
    status: 'success',
    data: {
      course: {
        _id: course._id,
        title: course.title,
        description: course.description,
        instructor: course.instructor
      },
      stats,
      users,
      lessonStats
    }
  });
});

/**
 * @desc    Get multiple learners report
 * @route   POST /api/v1/reports/learners
 * @access  Private (Admin, Instructor)
 */
const getMultipleLeanersReport = catchAsync(async (req, res, next) => {
  const { search, status, courseId, limit = 10, page = 1 } = req.body;

  // Build query
  let userQuery = { role: 'student' };
  if (search) {
    userQuery.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  // For instructors, only show learners enrolled in their courses
  if (req.user.role === 'instructor') {
    const instructorCourses = await Course.find({ instructor: req.user._id }).select('_id');
    const courseIds = instructorCourses.map(c => c._id);
    const enrolledUserIds = await Enrollment.distinct('user', { course: { $in: courseIds } });
    userQuery._id = { $in: enrolledUserIds };
  }

  // Get total count for pagination
  const totalCount = await User.countDocuments(userQuery);
  const totalPages = Math.ceil(totalCount / parseInt(limit));

  // Get learners with pagination
  const learners = await User.find(userQuery)
    .select('name email avatar createdAt')
    .sort({ name: 1 })
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit));

  // Get enrollment stats for each learner
  const learnersWithStats = await Promise.all(learners.map(async (learner) => {
    const enrollments = await Enrollment.find({ user: learner._id });

    const stats = {
      coursesEnrolled: enrollments.length,
      yetToStart: enrollments.filter(e => e.progress.completionPercentage === 0).length,
      inProgress: enrollments.filter(e => e.status === 'active' && e.progress.completionPercentage > 0 && e.progress.completionPercentage < 100).length,
      completed: enrollments.filter(e => e.status === 'completed' || e.progress.completionPercentage === 100).length,
      completionPercentage: enrollments.length > 0
        ? Math.round(enrollments.reduce((sum, e) => sum + e.progress.completionPercentage, 0) / enrollments.length)
        : 0
    };

    return {
      _id: learner._id,
      name: learner.name,
      email: learner.email,
      avatar: learner.avatar,
      ...stats
    };
  }));

  // Calculate summary stats from ALL learners (not just current page)
  const allLearners = await User.find(userQuery).select('_id');
  const allEnrollments = await Enrollment.find({
    user: { $in: allLearners.map(l => l._id) }
  });

  const summaryStats = {
    totalLearners: totalCount,
    totalCourseEnrollments: allEnrollments.length,
    totalYetToStart: allEnrollments.filter(e => e.progress.completionPercentage === 0).length,
    totalInProgress: allEnrollments.filter(e => e.status === 'active' && e.progress.completionPercentage > 0 && e.progress.completionPercentage < 100).length,
    totalCompleted: allEnrollments.filter(e => e.status === 'completed' || e.progress.completionPercentage === 100).length
  };

  res.status(200).json({
    status: 'success',
    data: {
      summaryStats,
      learners: learnersWithStats,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: totalCount,
        itemsPerPage: parseInt(limit),
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    }
  });
});

/**
 * @desc    Get multiple courses report
 * @route   POST /api/v1/reports/courses
 * @access  Private (Instructor, Admin)
 */
const getMultipleCoursesReport = catchAsync(async (req, res, next) => {
  const { search, category, isPublished, limit = 10, page = 1 } = req.body;

  // Build query
  let query = {};

  // For instructors, only show their own courses
  if (req.user.role === 'instructor') {
    query.instructor = req.user._id;
  }

  if (search) {
    query.title = { $regex: search, $options: 'i' };
  }

  if (category) {
    query.category = category;
  }

  if (isPublished !== undefined) {
    query.isPublished = isPublished;
  }

  // Get total count for pagination
  const totalCount = await Course.countDocuments(query);
  const totalPages = Math.ceil(totalCount / parseInt(limit));

  // Get courses with pagination
  const courses = await Course.find(query)
    .select('title description thumbnail instructor isPublished createdAt')
    .populate('instructor', 'name email')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit));

  // Get enrollment stats for each course
  const coursesWithStats = await Promise.all(courses.map(async (course) => {
    const enrollments = await Enrollment.find({ course: course._id });

    const stats = {
      totalLearners: enrollments.length,
      yetToStart: enrollments.filter(e => e.progress.completionPercentage === 0).length,
      inProgress: enrollments.filter(e => e.status === 'active' && e.progress.completionPercentage > 0 && e.progress.completionPercentage < 100).length,
      completed: enrollments.filter(e => e.status === 'completed' || e.progress.completionPercentage === 100).length
    };

    return {
      _id: course._id,
      name: course.title,
      description: course.description,
      thumbnail: course.thumbnail,
      instructor: course.instructor,
      isPublished: course.isPublished,
      createdAt: course.createdAt,
      ...stats
    };
  }));

  // Calculate summary stats from ALL courses (not just current page)
  const allCourses = await Course.find(query).select('_id isPublished');
  const allEnrollments = await Enrollment.find({
    course: { $in: allCourses.map(c => c._id) }
  });

  const summaryStats = {
    totalCourses: totalCount,
    published: allCourses.filter(c => c.isPublished).length,
    unpublished: allCourses.filter(c => !c.isPublished).length,
    totalEnrollments: allEnrollments.length
  };

  res.status(200).json({
    status: 'success',
    data: {
      stats: summaryStats,
      courses: coursesWithStats,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: totalCount,
        itemsPerPage: parseInt(limit),
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    }
  });
});

/**
 * @desc    Get articles report
 * @route   GET /api/v1/reports/articles
 * @access  Private (Admin, Author)
 */
const getArticlesReport = catchAsync(async (req, res, next) => {
  const { search, isPublished, limit = 10, page = 1 } = req.query;

  // Build query
  let query = {};

  // For non-admins, only show their own articles
  if (req.user.role !== 'super_admin' && req.user.role !== 'org_admin') {
    query.author = req.user._id;
  }

  if (search) {
    query.title = { $regex: search, $options: 'i' };
  }

  if (isPublished !== undefined) {
    query.isPublished = isPublished === 'true';
  }

  // Get total count for pagination
  const totalCount = await Article.countDocuments(query);
  const totalPages = Math.ceil(totalCount / parseInt(limit));

  // Get articles with pagination
  const articles = await Article.find(query)
    .select('title slug author isPublished createdAt')
    .populate('author', 'name email')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit));

  // Get analytics for each article
  const articlesWithAnalytics = await Promise.all(articles.map(async (article) => {
    const analytics = await ArticleAnalytics.findOne({ article: article._id });

    return {
      _id: article._id,
      name: article.title,
      slug: article.slug,
      author: article.author,
      isPublished: article.isPublished,
      createdAt: article.createdAt,
      totalViewer: analytics?.totalViews || 0,
      comments: analytics?.totalComments || 0,
      rating: analytics?.averageRating || 0,
      yesRating: analytics?.yesRatings || 0,
      noRating: analytics?.noRatings || 0
    };
  }));

  // Calculate summary stats from ALL articles (not just current page)
  const allArticles = await Article.find(query).select('_id isPublished');
  const allArticleIds = allArticles.map(a => a._id);
  const allAnalytics = await ArticleAnalytics.find({ article: { $in: allArticleIds } });

  const summaryStats = {
    total: totalCount,
    published: allArticles.filter(a => a.isPublished).length,
    unpublished: allArticles.filter(a => !a.isPublished).length,
    totalViews: allAnalytics.reduce((sum, a) => sum + (a.totalViews || 0), 0),
    totalComments: allAnalytics.reduce((sum, a) => sum + (a.totalComments || 0), 0)
  };

  res.status(200).json({
    status: 'success',
    data: {
      stats: summaryStats,
      articles: articlesWithAnalytics,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: totalCount,
        itemsPerPage: parseInt(limit),
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    }
  });
});

/**
 * @desc    Get my reports (current user's learning progress)
 * @route   GET /api/v1/reports/my-report
 * @access  Private
 */
const getMyReport = catchAsync(async (req, res, next) => {
  const userId = req.user._id;

  // Get all enrollments
  const enrollments = await Enrollment.find({ user: userId })
    .populate({
      path: 'course',
      select: 'title description thumbnail instructor duration category level'
    })
    .sort({ enrolledAt: -1 });

  // Calculate statistics
  const stats = {
    courseEnrolled: enrollments.length,
    yetToStart: enrollments.filter(e => e.progress.completionPercentage === 0).length,
    inProgress: enrollments.filter(e => e.status === 'active' && e.progress.completionPercentage > 0 && e.progress.completionPercentage < 100).length,
    completed: enrollments.filter(e => e.status === 'completed' || e.progress.completionPercentage === 100).length
  };

  // Format course data
  const courses = enrollments.map(enrollment => ({
    _id: enrollment._id,
    courseId: enrollment.course._id,
    name: enrollment.course.title,
    thumbnail: enrollment.course.thumbnail,
    enrollDate: enrollment.enrolledAt,
    completedDate: enrollment.completedAt || null,
    timeSpent: formatTimeSpent(enrollment.progress.timeSpent || 0),
    completion: enrollment.progress.completionPercentage || 0,
    status: getStatusText(enrollment)
  }));

  res.status(200).json({
    status: 'success',
    data: {
      stats,
      courses
    }
  });
});

// Helper functions
function getStatusText(enrollment) {
  if (enrollment.status === 'completed' || enrollment.progress.completionPercentage === 100) {
    return 'Complete';
  }
  if (enrollment.progress.completionPercentage === 0) {
    return 'Yet to Start';
  }
  return 'In Progress';
}

function formatTimeSpent(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours === 0) {
    return `${minutes} min`;
  }

  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;

  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ${remainingHours} hour${remainingHours !== 1 ? 's' : ''}`;
  }

  return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} min`;
}

/**
 * @desc    Export my report as CSV
 * @route   GET /api/v1/reports/my-report/export/csv
 * @access  Private
 */
const exportMyReportCSV = catchAsync(async (req, res, next) => {
  const userId = req.user._id;

  const enrollments = await Enrollment.find({ user: userId })
    .populate('course', 'title category level')
    .sort({ enrolledAt: -1 });

  const csvData = enrollments.map((enrollment, index) => ({
    sl: index + 1,
    courseName: enrollment.course?.title || 'N/A',
    enrollDate: formatDateForCSV(enrollment.enrolledAt),
    completedDate: enrollment.completedDate ? formatDateForCSV(enrollment.completedDate) : '--',
    timeSpent: formatTimeForCSV(enrollment.progress.timeSpent || 0),
    completionPercentage: enrollment.progress.completionPercentage || 0,
    status: getStatusText(enrollment)
  }));

  const headers = [
    { label: 'SL', key: 'sl' },
    { label: 'Course Name', key: 'courseName' },
    { label: 'Enroll Date', key: 'enrollDate' },
    { label: 'Completed Date', key: 'completedDate' },
    { label: 'Time Spent', key: 'timeSpent' },
    { label: 'Completion Percentage', key: 'completionPercentage' },
    { label: 'Status', key: 'status' }
  ];

  const csv = convertToCSV(csvData, headers);

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=my-report-${Date.now()}.csv`);
  res.status(200).send(csv);
});

/**
 * @desc    Export learner report as CSV
 * @route   GET /api/v1/reports/learner/:id/export/csv
 * @access  Private
 */
const exportLearnerReportCSV = catchAsync(async (req, res, next) => {
  const learnerId = req.params.id;

  // Authorization check
  if (
    req.user.role === 'student' &&
    req.user._id.toString() !== learnerId
  ) {
    return next(new AppError('You can only export your own reports', 403));
  }

  const enrollments = await Enrollment.find({ user: learnerId })
    .populate('course', 'title category level')
    .sort({ enrolledAt: -1 });

  const csvData = enrollments.map((enrollment, index) => ({
    sl: index + 1,
    courseName: enrollment.course?.title || 'N/A',
    enrollDate: formatDateForCSV(enrollment.enrolledAt),
    completedDate: enrollment.completedDate ? formatDateForCSV(enrollment.completedDate) : '--',
    timeSpent: formatTimeForCSV(enrollment.progress.timeSpent || 0),
    completionPercentage: enrollment.progress.completionPercentage || 0,
    status: getStatusText(enrollment)
  }));

  const headers = [
    { label: 'SL', key: 'sl' },
    { label: 'Course Name', key: 'courseName' },
    { label: 'Enroll Date', key: 'enrollDate' },
    { label: 'Completed Date', key: 'completedDate' },
    { label: 'Time Spent', key: 'timeSpent' },
    { label: 'Completion Percentage', key: 'completionPercentage' },
    { label: 'Status', key: 'status' }
  ];

  const csv = convertToCSV(csvData, headers);

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=learner-report-${learnerId}-${Date.now()}.csv`);
  res.status(200).send(csv);
});

/**
 * @desc    Export articles report as CSV
 * @route   GET /api/v1/reports/articles/export/csv
 * @access  Private
 */
const exportArticlesReportCSV = catchAsync(async (req, res, next) => {
  const { search, isPublished } = req.query;

  let query = {};
  if (req.user.role !== 'super_admin' && req.user.role !== 'org_admin') {
    query.author = req.user._id;
  }
  if (search) {
    query.title = { $regex: search, $options: 'i' };
  }
  if (isPublished !== undefined) {
    query.isPublished = isPublished === 'true';
  }

  const articles = await Article.find(query)
    .select('title slug isPublished createdAt')
    .sort({ createdAt: -1 });

  const articlesWithAnalytics = await Promise.all(articles.map(async (article, index) => {
    const analytics = await ArticleAnalytics.findOne({ article: article._id });

    return {
      sl: index + 1,
      articleName: article.title,
      totalViewer: analytics?.totalViews || 0,
      comments: analytics?.totalComments || 0,
      rating: analytics?.averageRating || 0,
      yesRating: analytics?.yesRatings || 0,
      noRating: analytics?.noRatings || 0
    };
  }));

  const headers = [
    { label: 'SL', key: 'sl' },
    { label: 'Article Name', key: 'articleName' },
    { label: 'Total Viewer', key: 'totalViewer' },
    { label: 'Comments', key: 'comments' },
    { label: 'Rating', key: 'rating' },
    { label: 'Yes Rating', key: 'yesRating' },
    { label: 'No Rating', key: 'noRating' }
  ];

  const csv = convertToCSV(articlesWithAnalytics, headers);

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=articles-report-${Date.now()}.csv`);
  res.status(200).send(csv);
});

/**
 * @desc    Export multiple learners report as CSV
 * @route   POST /api/v1/reports/learners/export/csv
 * @access  Private (Admin, Instructor)
 */
const exportMultipleLearnersCSV = catchAsync(async (req, res, next) => {
  const { search } = req.body;

  let userQuery = {};
  if (search) {
    userQuery.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  if (req.user.role === 'instructor') {
    const instructorCourses = await Course.find({ instructor: req.user._id }).select('_id');
    const courseIds = instructorCourses.map(c => c._id);
    const enrolledUserIds = await Enrollment.distinct('user', { course: { $in: courseIds } });
    userQuery._id = { $in: enrolledUserIds };
  }

  const learners = await User.find(userQuery).select('name email');

  const learnersWithStats = await Promise.all(learners.map(async (learner, index) => {
    const enrollments = await Enrollment.find({ user: learner._id });

    return {
      sl: index + 1,
      learner: learner.name,
      email: learner.email,
      coursesEnrolled: enrollments.length,
      yetToStart: enrollments.filter(e => e.progress.completionPercentage === 0).length,
      inProgress: enrollments.filter(e => e.status === 'active' && e.progress.completionPercentage > 0 && e.progress.completionPercentage < 100).length,
      completed: enrollments.filter(e => e.status === 'completed' || e.progress.completionPercentage === 100).length,
      completionPercentage: enrollments.length > 0
        ? Math.round(enrollments.reduce((sum, e) => sum + e.progress.completionPercentage, 0) / enrollments.length)
        : 0
    };
  }));

  const headers = [
    { label: 'SL', key: 'sl' },
    { label: 'Learner', key: 'learner' },
    { label: 'Email Address', key: 'email' },
    { label: 'Courses Enrolled', key: 'coursesEnrolled' },
    { label: 'Yet to Start', key: 'yetToStart' },
    { label: 'In Progress', key: 'inProgress' },
    { label: 'Completed', key: 'completed' },
    { label: 'Completion Percentage', key: 'completionPercentage' }
  ];

  const csv = convertToCSV(learnersWithStats, headers);

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=multiple-learners-report-${Date.now()}.csv`);
  res.status(200).send(csv);
});

/**
 * @desc    Get list of courses (for dropdown/selection)
 * @route   GET /api/v1/reports/courses/list
 * @access  Private (Instructor, Admin)
 */
const getCoursesList = catchAsync(async (req, res, next) => {
  const { search } = req.query;
  const requestingUser = req.user;

  // Build query
  let query = { isPublished: true };

  // Add search filter
  if (search) {
    query.title = { $regex: search, $options: 'i' };
  }

  // If instructor, only show their courses
  if (requestingUser.role === 'instructor') {
    query.instructor = requestingUser._id;
  }

  // Get courses
  const courses = await Course.find(query)
    .select('_id title thumbnail category level')
    .sort({ title: 1 })
    .limit(100);

  // Format for dropdown
  const coursesList = courses.map(course => ({
    value: course._id.toString(),
    label: course.title,
    category: course.category,
    level: course.level,
    thumbnail: course.thumbnail
  }));

  res.status(200).json({
    success: true,
    data: coursesList
  });
});

/**
 * @desc    Get list of all learners (for dropdown/selection)
 * @route   GET /api/v1/reports/learners/list
 * @access  Private (Instructor, Admin)
 */
const getLearnersList = catchAsync(async (req, res, next) => {
  const { search } = req.query;
  const requestingUser = req.user;

  // Build query - only get students
  let query = { role: 'student' };

  // Add search filter
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  // If instructor, only show learners from their courses
  if (requestingUser.role === 'instructor') {
    // Get courses taught by this instructor
    const instructorCourses = await Course.find({ instructor: requestingUser._id }).select('_id');
    const courseIds = instructorCourses.map(c => c._id);

    // Get learners enrolled in these courses
    const enrollments = await Enrollment.find({ course: { $in: courseIds } }).distinct('user');
    query._id = { $in: enrollments };
  }

  // Get learners
  const learners = await User.find(query)
    .select('_id name email avatar')
    .sort({ name: 1 })
    .limit(100);

  // Format for dropdown
  const learnersList = learners.map(learner => ({
    value: learner._id.toString(),
    label: learner.name,
    email: learner.email,
    avatar: learner.avatar
  }));

  res.status(200).json({
    success: true,
    data: learnersList
  });
});

module.exports = {
  getIndividualLearnerReport,
  getIndividualLearnerCourseProgress,
  getIndividualCourseReport,
  getMultipleLeanersReport,
  getMultipleCoursesReport,
  getArticlesReport,
  getMyReport,
  getCoursesList,
  getLearnersList,
  exportMyReportCSV,
  exportLearnerReportCSV,
  exportArticlesReportCSV,
  exportMultipleLearnersCSV
};
