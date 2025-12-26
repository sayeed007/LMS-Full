const Course = require('../models/Course');
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const Article = require('../models/Article');
const QuestionBank = require('../models/QuestionBank');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

/**
 * @desc    Get dashboard stats for the logged-in user
 * @route   GET /api/v1/dashboard/stats
 * @access  Private
 */
const getDashboardStats = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const userRole = req.user.role;

  let stats = {};

  // Common stats for all users
  const enrollmentsCount = await Enrollment.countDocuments({ student: userId });

  // Role-specific stats
  if (userRole === 'instructor' || userRole === 'org_admin' || userRole === 'super_admin') {
    // Instructor/Admin stats
    const [coursesCreated, articlesCreated, questionBanks, totalLearners] = await Promise.all([
      Course.countDocuments({ instructor: userId }),
      Article.countDocuments({ author: userId }),
      QuestionBank.countDocuments({ createdBy: userId }),
      Enrollment.distinct('student', {
        course: { $in: await Course.find({ instructor: userId }).distinct('_id') }
      }).then(students => students.length)
    ]);

    stats = {
      totalCourseCreated: coursesCreated,
      totalArticle: articlesCreated,
      totalQuestionBank: questionBanks,
      totalLearner: totalLearners,
    };
  } else {
    // Student stats
    const [enrolledCourses, completedCourses] = await Promise.all([
      Enrollment.countDocuments({ student: userId, status: 'active' }),
      Enrollment.countDocuments({ student: userId, status: 'completed' })
    ]);

    stats = {
      totalEnrolledCourses: enrolledCourses,
      totalCompletedCourses: completedCourses,
      totalInProgressCourses: enrolledCourses - completedCourses,
      completionRate: enrolledCourses > 0 ? ((completedCourses / enrolledCourses) * 100).toFixed(2) : 0
    };
  }

  res.status(200).json({
    status: 'success',
    data: stats,
  });
});

/**
 * @desc    Get ongoing/enrolled courses for dashboard (students) or recent created courses (instructors)
 * @route   GET /api/v1/dashboard/ongoing-courses
 * @access  Private
 */
const getOngoingCourses = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const userRole = req.user.role;
  const limit = parseInt(req.query.limit) || 10;

  let courses = [];

  // For instructors/admins: show recently created courses
  if (userRole === 'instructor' || userRole === 'org_admin' || userRole === 'super_admin') {
    const recentCourses = await Course.find({ instructor: userId })
      .populate('instructor', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    // Get enrollment stats for each course
    const courseIds = recentCourses.map(c => c._id);
    const enrollmentStats = await Enrollment.aggregate([
      { $match: { course: { $in: courseIds } } },
      {
        $group: {
          _id: '$course',
          totalEnrollments: { $sum: 1 },
          activeEnrollments: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          }
        }
      }
    ]);

    courses = recentCourses.map(course => {
      const stats = enrollmentStats.find(s => s._id.toString() === course._id.toString());
      return {
        _id: course._id,
        title: course.title,
        description: course.description,
        thumbnail: course.thumbnail,
        instructor: course.instructor,
        progress: 0, // Not applicable for instructors
        completedLessons: 0,
        totalLessons: 0,
        rating: course.stats?.averageRating || 0,
        enrollmentId: null,
        lastAccessed: course.createdAt,
        totalEnrollments: stats?.totalEnrollments || 0,
        activeEnrollments: stats?.activeEnrollments || 0,
        isPublished: course.isPublished
      };
    });
  } else {
    // For students: show ongoing enrolled courses
    const enrollments = await Enrollment.find({
      student: userId,
      status: 'active'
    })
      .populate({
        path: 'course',
        select: 'title description thumbnail instructor estimatedDuration stats',
        populate: {
          path: 'instructor',
          select: 'name email'
        }
      })
      .sort({ lastAccessedAt: -1, createdAt: -1 })
      .limit(limit)
      .lean();

    courses = enrollments.map(enrollment => {
      const course = enrollment.course;
      const totalLessons = enrollment.progress?.totalLessons || 0;
      const completedLessons = enrollment.progress?.completedLessons || 0;

      return {
        _id: course._id,
        title: course.title,
        description: course.description,
        thumbnail: course.thumbnail,
        instructor: course.instructor,
        progress: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
        completedLessons,
        totalLessons,
        rating: course.stats?.averageRating || 0,
        enrollmentId: enrollment._id,
        lastAccessed: enrollment.lastAccessedAt || enrollment.createdAt
      };
    });
  }

  res.status(200).json({
    status: 'success',
    results: courses.length,
    data: courses,
  });
});

/**
 * @desc    Get course analytics for dashboard (for instructors)
 * @route   GET /api/v1/dashboard/course-analytics
 * @access  Private (Instructor/Admin)
 */
const getCourseAnalytics = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const userRole = req.user.role;

  // Only instructors and admins can access this
  if (userRole !== 'instructor' && userRole !== 'org_admin' && userRole !== 'super_admin') {
    return next(new AppError('You do not have permission to access this resource', 403));
  }

  const courses = await Course.find({ instructor: userId });
  const courseIds = courses.map(c => c._id);

  const [publishedCount, draftCount, inProgressCount, totalEnrollments] = await Promise.all([
    Course.countDocuments({ instructor: userId, isPublished: true }),
    Course.countDocuments({ instructor: userId, isPublished: false }),
    Enrollment.countDocuments({ course: { $in: courseIds }, status: 'active' }),
    Enrollment.countDocuments({ course: { $in: courseIds } })
  ]);

  const total = publishedCount + draftCount;

  const analytics = {
    published: {
      count: publishedCount,
      percentage: total > 0 ? parseFloat(((publishedCount / total) * 100).toFixed(2)) : 0
    },
    draft: {
      count: draftCount,
      percentage: total > 0 ? parseFloat(((draftCount / total) * 100).toFixed(2)) : 0
    },
    inProgress: {
      count: inProgressCount,
      percentage: totalEnrollments > 0 ? parseFloat(((inProgressCount / totalEnrollments) * 100).toFixed(2)) : 0
    },
    totalCourses: total,
    totalEnrollments
  };

  res.status(200).json({
    status: 'success',
    data: analytics,
  });
});

/**
 * @desc    Get course completion rate data for dashboard chart
 * @route   GET /api/v1/dashboard/completion-rate
 * @access  Private (Instructor/Admin)
 */
const getCompletionRateData = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const userRole = req.user.role;
  const category = req.query.category;

  // Only instructors and admins can access this
  if (userRole !== 'instructor' && userRole !== 'org_admin' && userRole !== 'super_admin') {
    return next(new AppError('You do not have permission to access this resource', 403));
  }

  // Find courses created by this instructor
  const courseQuery = { instructor: userId };
  if (category) {
    courseQuery.category = category;
  }

  const courses = await Course.find(courseQuery)
    .select('title _id')
    .limit(10)
    .lean();

  const courseIds = courses.map(c => c._id);

  // Get enrollment counts for each course
  const enrollmentCounts = await Enrollment.aggregate([
    {
      $match: {
        course: { $in: courseIds }
      }
    },
    {
      $group: {
        _id: '$course',
        totalEnrollments: { $sum: 1 },
        completedEnrollments: {
          $sum: {
            $cond: [{ $eq: ['$status', 'completed'] }, 1, 0]
          }
        }
      }
    }
  ]);

  // Map the data to course titles
  const completionData = courses.map(course => {
    const stats = enrollmentCounts.find(e => e._id.toString() === course._id.toString());
    return {
      courseId: course._id,
      courseTitle: course.title,
      totalEnrollments: stats?.totalEnrollments || 0,
      completedEnrollments: stats?.completedEnrollments || 0,
      completionRate: stats?.totalEnrollments > 0
        ? Math.round((stats.completedEnrollments / stats.totalEnrollments) * 100)
        : 0
    };
  });

  res.status(200).json({
    status: 'success',
    results: completionData.length,
    data: completionData,
  });
});

/**
 * @desc    Get available categories for completion rate filter
 * @route   GET /api/v1/dashboard/categories
 * @access  Private (Instructor/Admin)
 */
const getDashboardCategories = catchAsync(async (req, res, next) => {
  const userId = req.user._id;

  const categories = await Course.distinct('category', { instructor: userId });

  res.status(200).json({
    status: 'success',
    results: categories.length,
    data: categories,
  });
});

module.exports = {
  getDashboardStats,
  getOngoingCourses,
  getCourseAnalytics,
  getCompletionRateData,
  getDashboardCategories
};
