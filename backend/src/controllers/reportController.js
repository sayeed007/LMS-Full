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
  const { search, status, courseId, limit = 10, page = 1, startDate, endDate, sortBy = 'name', sortOrder = 'asc' } = req.body;

  // Build query
  let userQuery = { role: 'student' };
  if (search) {
    userQuery.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  // Date range filter for user creation
  if (startDate || endDate) {
    userQuery.createdAt = {};
    if (startDate) {
      userQuery.createdAt.$gte = new Date(startDate);
    }
    if (endDate) {
      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999);
      userQuery.createdAt.$lte = endDateTime;
    }
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

  // Build sort object
  const sortField = ['name', 'email', 'createdAt'].includes(sortBy) ? sortBy : 'name';
  const sortDirection = sortOrder === 'desc' ? -1 : 1;
  const sortObject = { [sortField]: sortDirection };

  // Get learners with pagination
  const learners = await User.find(userQuery)
    .select('name email avatar createdAt')
    .sort(sortObject)
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit));

  // Get enrollment stats for each learner
  let learnersWithStats = await Promise.all(learners.map(async (learner) => {
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

  // Apply status filter if provided
  if (status && status !== 'all') {
    learnersWithStats = learnersWithStats.filter(learner => {
      if (status === 'completed') {
        return learner.completed > 0;
      } else if (status === 'in_progress') {
        return learner.inProgress > 0;
      } else if (status === 'yet_to_start') {
        return learner.yetToStart > 0 && learner.inProgress === 0 && learner.completed === 0;
      }
      return true;
    });
  }

  // Sort by computed fields if requested
  const computedFields = ['coursesEnrolled', 'completionPercentage', 'yetToStart', 'inProgress', 'completed'];
  if (computedFields.includes(sortBy)) {
    learnersWithStats.sort((a, b) => {
      const aValue = a[sortBy] || 0;
      const bValue = b[sortBy] || 0;
      return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
    });
  }

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
  const { search, category, isPublished, limit = 10, page = 1, startDate, endDate, sortBy = 'title', sortOrder = 'asc' } = req.body;

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

  // Date range filter for course creation
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) {
      query.createdAt.$gte = new Date(startDate);
    }
    if (endDate) {
      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999);
      query.createdAt.$lte = endDateTime;
    }
  }

  // Get total count for pagination
  const totalCount = await Course.countDocuments(query);
  const totalPages = Math.ceil(totalCount / parseInt(limit));

  // Build sort object
  const sortField = ['title', 'createdAt', 'isPublished'].includes(sortBy) ? sortBy : 'title';
  const sortDirection = sortOrder === 'desc' ? -1 : 1;
  const sortObject = { [sortField]: sortDirection };

  // Get courses with pagination
  const courses = await Course.find(query)
    .select('title description thumbnail instructor isPublished createdAt')
    .populate('instructor', 'name email')
    .sort(sortObject)
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

  // Sort by computed fields if requested
  const computedFields = ['totalLearners', 'yetToStart', 'inProgress', 'completed'];
  if (computedFields.includes(sortBy)) {
    coursesWithStats.sort((a, b) => {
      const aValue = a[sortBy] || 0;
      const bValue = b[sortBy] || 0;
      return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
    });
  }

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
  const { search, isPublished, limit = 10, page = 1, startDate, endDate, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

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

  // Date range filter for article creation
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) {
      query.createdAt.$gte = new Date(startDate);
    }
    if (endDate) {
      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999);
      query.createdAt.$lte = endDateTime;
    }
  }

  // Get total count for pagination
  const totalCount = await Article.countDocuments(query);
  const totalPages = Math.ceil(totalCount / parseInt(limit));

  // Build sort object
  const sortField = ['title', 'createdAt', 'isPublished'].includes(sortBy) ? sortBy : 'createdAt';
  const sortDirection = sortOrder === 'desc' ? -1 : 1;
  const sortObject = { [sortField]: sortDirection };

  // Get articles with pagination
  const articles = await Article.find(query)
    .select('title slug author isPublished createdAt')
    .populate('author', 'name email')
    .sort(sortObject)
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

  // Sort by computed analytics fields if requested
  const computedFields = ['totalViewer', 'comments', 'rating', 'yesRating', 'noRating'];
  if (computedFields.includes(sortBy)) {
    articlesWithAnalytics.sort((a, b) => {
      const aValue = a[sortBy] || 0;
      const bValue = b[sortBy] || 0;
      return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
    });
  }

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

/**
 * @desc    Export individual course report as CSV
 * @route   GET /api/v1/reports/course/:id/export/csv
 * @access  Private (Instructor for own courses, Admin for all)
 */
const exportIndividualCourseCSV = catchAsync(async (req, res, next) => {
  const courseId = req.params.id;
  const requestingUser = req.user;

  // Get course
  const course = await Course.findById(courseId)
    .populate('instructor', 'name email');

  if (!course) {
    return next(new AppError('Course not found', 404));
  }

  // Authorization check for instructors
  if (
    requestingUser.role === 'instructor' &&
    course.instructor._id.toString() !== requestingUser._id.toString()
  ) {
    return next(new AppError('You can only export reports for your own courses', 403));
  }

  // Get all enrollments for the course
  const enrollments = await Enrollment.find({ course: courseId })
    .populate('user', 'name email');

  const csvData = enrollments.map((enrollment, index) => ({
    sl: index + 1,
    learner: enrollment.user?.name || 'N/A',
    email: enrollment.user?.email || 'N/A',
    enrollDate: formatDateForCSV(enrollment.enrolledAt),
    completedDate: enrollment.completedAt ? formatDateForCSV(enrollment.completedAt) : '--',
    timeSpent: formatTimeForCSV(enrollment.progress.timeSpent || 0),
    completionPercentage: enrollment.progress.completionPercentage || 0,
    status: getStatusText(enrollment)
  }));

  const headers = [
    { label: 'SL', key: 'sl' },
    { label: 'Learner', key: 'learner' },
    { label: 'Email Address', key: 'email' },
    { label: 'Enroll Date', key: 'enrollDate' },
    { label: 'Completed Date', key: 'completedDate' },
    { label: 'Time Spent', key: 'timeSpent' },
    { label: 'Completion Percentage', key: 'completionPercentage' },
    { label: 'Status', key: 'status' }
  ];

  const csv = convertToCSV(csvData, headers);

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=course-${course.title.replace(/[^a-z0-9]/gi, '-')}-report-${Date.now()}.csv`);
  res.status(200).send(csv);
});

/**
 * @desc    Export multiple courses report as CSV
 * @route   POST /api/v1/reports/courses/export/csv
 * @access  Private (Instructor, Admin)
 */
const exportMultipleCoursesCSV = catchAsync(async (req, res, next) => {
  const { search } = req.body;
  const requestingUser = req.user;

  // Build query
  let query = {};

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
    .select('title description category level isPublished createdAt')
    .sort({ createdAt: -1 });

  const coursesWithStats = await Promise.all(courses.map(async (course, index) => {
    const enrollments = await Enrollment.find({ course: course._id });

    return {
      sl: index + 1,
      course: course.title,
      description: course.description || 'N/A',
      category: course.category || 'N/A',
      level: course.level || 'N/A',
      published: course.isPublished ? 'Yes' : 'No',
      totalLearners: enrollments.length,
      yetToStart: enrollments.filter(e => e.progress.completionPercentage === 0).length,
      inProgress: enrollments.filter(e => e.status === 'active' && e.progress.completionPercentage > 0 && e.progress.completionPercentage < 100).length,
      completed: enrollments.filter(e => e.status === 'completed' || e.progress.completionPercentage === 100).length
    };
  }));

  const headers = [
    { label: 'SL', key: 'sl' },
    { label: 'Course', key: 'course' },
    { label: 'Description', key: 'description' },
    { label: 'Category', key: 'category' },
    { label: 'Level', key: 'level' },
    { label: 'Published', key: 'published' },
    { label: 'Total Learners', key: 'totalLearners' },
    { label: 'Yet to Start', key: 'yetToStart' },
    { label: 'In Progress', key: 'inProgress' },
    { label: 'Completed', key: 'completed' }
  ];

  const csv = convertToCSV(coursesWithStats, headers);

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=multiple-courses-report-${Date.now()}.csv`);
  res.status(200).send(csv);
});

/**
 * @desc    Export my report as PDF
 * @route   GET /api/v1/reports/my-report/export/pdf
 * @access  Private (Student, Instructor)
 */
const exportMyReportPDF = catchAsync(async (req, res, next) => {
  const userId = req.user._id;

  // Get user's enrolled courses
  const enrollments = await Enrollment.find({ student: userId })
    .populate({
      path: 'course',
      select: 'title description thumbnail'
    })
    .sort({ enrolledAt: -1 });

  const coursesData = enrollments.map(enrollment => ({
    courseId: enrollment.course._id,
    courseName: enrollment.course.title,
    thumbnail: enrollment.course.thumbnail,
    enrollDate: enrollment.enrolledAt,
    completedDate: enrollment.completedAt,
    timeSpent: enrollment.progress.timeSpent || 0,
    completionPercentage: enrollment.progress.completionPercentage,
    status: enrollment.status
  }));

  const stats = {
    courseEnrolled: enrollments.length,
    yetToStart: enrollments.filter(e => e.progress.completionPercentage === 0).length,
    inProgress: enrollments.filter(e => e.status === 'active' && e.progress.completionPercentage > 0 && e.progress.completionPercentage < 100).length,
    completed: enrollments.filter(e => e.status === 'completed' || e.progress.completionPercentage === 100).length
  };

  const reportData = {
    stats,
    courses: coursesData
  };

  const { generateMyReportPDF } = require('../utils/pdfExporter');
  generateMyReportPDF(reportData, res);
});

/**
 * @desc    Export individual learner report as PDF
 * @route   GET /api/v1/reports/learner/:id/export/pdf
 * @access  Private (Org Admin, Super Admin)
 */
const exportIndividualLearnerPDF = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const learner = await User.findById(id).select('name email avatar createdAt');
  if (!learner) {
    return next(new AppError('Learner not found', 404));
  }

  const enrollments = await Enrollment.find({ student: id })
    .populate({
      path: 'course',
      select: 'title description thumbnail'
    })
    .sort({ enrolledAt: -1 });

  const coursesData = enrollments.map(enrollment => ({
    courseId: enrollment.course._id,
    courseName: enrollment.course.title,
    enrollDate: enrollment.enrolledAt,
    completedDate: enrollment.completedAt,
    timeSpent: enrollment.progress.timeSpent || 0,
    completionPercentage: enrollment.progress.completionPercentage,
    status: enrollment.status
  }));

  const stats = {
    courseEnrolled: enrollments.length,
    yetToStart: enrollments.filter(e => e.progress.completionPercentage === 0).length,
    inProgress: enrollments.filter(e => e.status === 'active' && e.progress.completionPercentage > 0 && e.progress.completionPercentage < 100).length,
    completed: enrollments.filter(e => e.status === 'completed' || e.progress.completionPercentage === 100).length
  };

  const reportData = {
    learner,
    stats,
    courses: coursesData
  };

  const { generateIndividualLearnerPDF } = require('../utils/pdfExporter');
  generateIndividualLearnerPDF(reportData, res);
});

/**
 * @desc    Export individual course report as PDF
 * @route   GET /api/v1/reports/course/:id/export/pdf
 * @access  Private (Instructor, Org Admin, Super Admin)
 */
const exportIndividualCoursePDF = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const requestingUser = req.user;

  const course = await Course.findById(id).select('title description instructor');
  if (!course) {
    return next(new AppError('Course not found', 404));
  }

  if (requestingUser.role === 'instructor' && course.instructor.toString() !== requestingUser._id.toString()) {
    return next(new AppError('You do not have permission to view this course report', 403));
  }

  const enrollments = await Enrollment.find({ course: id })
    .populate({
      path: 'student',
      select: 'name email avatar'
    })
    .sort({ enrolledAt: -1 });

  const usersData = enrollments.map(enrollment => ({
    name: enrollment.student.name,
    email: enrollment.student.email,
    enrollDate: enrollment.enrolledAt,
    completedDate: enrollment.completedAt,
    timeSpent: enrollment.progress.timeSpent || 0,
    completionPercentage: enrollment.progress.completionPercentage,
    status: enrollment.status
  }));

  const stats = {
    totalEnrollments: enrollments.length,
    yetToStart: enrollments.filter(e => e.progress.completionPercentage === 0).length,
    inProgress: enrollments.filter(e => e.status === 'active' && e.progress.completionPercentage > 0 && e.progress.completionPercentage < 100).length,
    completed: enrollments.filter(e => e.status === 'completed' || e.progress.completionPercentage === 100).length
  };

  const reportData = {
    course,
    stats,
    users: usersData
  };

  const { generateIndividualCoursePDF } = require('../utils/pdfExporter');
  generateIndividualCoursePDF(reportData, res);
});

/**
 * @desc    Export multiple learners report as PDF
 * @route   POST /api/v1/reports/learners/export/pdf
 * @access  Private (Org Admin, Super Admin)
 */
const exportMultipleLearnersPDF = catchAsync(async (req, res, next) => {
  const { search, status, courseId, startDate, endDate } = req.body;

  let userQuery = { role: 'student' };

  if (search) {
    userQuery.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  if (startDate || endDate) {
    userQuery.createdAt = {};
    if (startDate) userQuery.createdAt.$gte = new Date(startDate);
    if (endDate) {
      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999);
      userQuery.createdAt.$lte = endDateTime;
    }
  }

  const learners = await User.find(userQuery).select('name email avatar createdAt');

  const learnersWithStats = await Promise.all(learners.map(async (learner) => {
    let enrollmentQuery = { student: learner._id };
    if (courseId) enrollmentQuery.course = courseId;

    const enrollments = await Enrollment.find(enrollmentQuery);

    let filteredEnrollments = enrollments;
    if (status) {
      if (status === 'completed') {
        filteredEnrollments = enrollments.filter(e => e.status === 'completed' || e.progress.completionPercentage === 100);
      } else if (status === 'in-progress') {
        filteredEnrollments = enrollments.filter(e => e.status === 'active' && e.progress.completionPercentage > 0 && e.progress.completionPercentage < 100);
      } else if (status === 'yet-to-start') {
        filteredEnrollments = enrollments.filter(e => e.progress.completionPercentage === 0);
      }
    }

    if (status && filteredEnrollments.length === 0) return null;

    return {
      _id: learner._id,
      name: learner.name,
      email: learner.email,
      coursesEnrolled: enrollments.length,
      yetToStart: enrollments.filter(e => e.progress.completionPercentage === 0).length,
      inProgress: enrollments.filter(e => e.status === 'active' && e.progress.completionPercentage > 0 && e.progress.completionPercentage < 100).length,
      completed: enrollments.filter(e => e.status === 'completed' || e.progress.completionPercentage === 100).length
    };
  }));

  const filteredLearners = learnersWithStats.filter(l => l !== null);

  const summaryStats = {
    totalLearners: filteredLearners.length,
    totalCourseEnrollments: filteredLearners.reduce((sum, l) => sum + l.coursesEnrolled, 0),
    totalYetToStart: filteredLearners.reduce((sum, l) => sum + l.yetToStart, 0),
    totalInProgress: filteredLearners.reduce((sum, l) => sum + l.inProgress, 0),
    totalCompleted: filteredLearners.reduce((sum, l) => sum + l.completed, 0)
  };

  const reportData = {
    summaryStats,
    learners: filteredLearners
  };

  const { generateMultipleLearnersPDF } = require('../utils/pdfExporter');
  generateMultipleLearnersPDF(reportData, res);
});

/**
 * @desc    Export multiple courses report as PDF
 * @route   POST /api/v1/reports/courses/export/pdf
 * @access  Private (Instructor, Org Admin, Super Admin)
 */
const exportMultipleCoursesPDF = catchAsync(async (req, res, next) => {
  const { search, category, isPublished, startDate, endDate } = req.body;
  const requestingUser = req.user;

  let query = {};

  if (search) {
    query.title = { $regex: search, $options: 'i' };
  }

  if (category) {
    query.category = category;
  }

  if (isPublished !== undefined) {
    query.isPublished = isPublished;
  }

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) {
      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999);
      query.createdAt.$lte = endDateTime;
    }
  }

  if (requestingUser.role === 'instructor') {
    query.instructor = requestingUser._id;
  }

  const courses = await Course.find(query).select('title description isPublished createdAt');

  const coursesWithStats = await Promise.all(courses.map(async (course) => {
    const enrollments = await Enrollment.find({ course: course._id });

    return {
      _id: course._id,
      name: course.title,
      description: course.description,
      isPublished: course.isPublished,
      createdAt: course.createdAt,
      totalLearners: enrollments.length,
      yetToStart: enrollments.filter(e => e.progress.completionPercentage === 0).length,
      inProgress: enrollments.filter(e => e.status === 'active' && e.progress.completionPercentage > 0 && e.progress.completionPercentage < 100).length,
      completed: enrollments.filter(e => e.status === 'completed' || e.progress.completionPercentage === 100).length
    };
  }));

  const allCourses = await Course.find(query).select('_id isPublished');
  const allEnrollments = await Enrollment.find({
    course: { $in: allCourses.map(c => c._id) }
  });

  const summaryStats = {
    totalCourses: allCourses.length,
    published: allCourses.filter(c => c.isPublished).length,
    unpublished: allCourses.filter(c => !c.isPublished).length,
    totalEnrollments: allEnrollments.length
  };

  const reportData = {
    stats: summaryStats,
    courses: coursesWithStats
  };

  const { generateMultipleCoursesPDF } = require('../utils/pdfExporter');
  generateMultipleCoursesPDF(reportData, res);
});

/**
 * @desc    Export articles report as PDF
 * @route   GET /api/v1/reports/articles/export/pdf
 * @access  Private (Admin, Author)
 */
const exportArticlesReportPDF = catchAsync(async (req, res, next) => {
  const { search, isPublished, startDate, endDate } = req.query;

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

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) {
      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999);
      query.createdAt.$lte = endDateTime;
    }
  }

  const articles = await Article.find(query)
    .select('title slug author isPublished createdAt')
    .populate('author', 'name email');

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

  const allArticles = await Article.find(query).select('_id isPublished');
  const allArticleIds = allArticles.map(a => a._id);
  const allAnalytics = await ArticleAnalytics.find({ article: { $in: allArticleIds } });

  const summaryStats = {
    total: allArticles.length,
    published: allArticles.filter(a => a.isPublished).length,
    unpublished: allArticles.filter(a => !a.isPublished).length,
    totalViews: allAnalytics.reduce((sum, a) => sum + (a.totalViews || 0), 0),
    totalComments: allAnalytics.reduce((sum, a) => sum + (a.totalComments || 0), 0)
  };

  const reportData = {
    stats: summaryStats,
    articles: articlesWithAnalytics
  };

  const { generateArticlesReportPDF } = require('../utils/pdfExporter');
  generateArticlesReportPDF(reportData, res);
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
  exportMultipleLearnersCSV,
  exportIndividualCourseCSV,
  exportMultipleCoursesCSV,
  exportMyReportPDF,
  exportIndividualLearnerPDF,
  exportIndividualCoursePDF,
  exportMultipleLearnersPDF,
  exportMultipleCoursesPDF,
  exportArticlesReportPDF
};
