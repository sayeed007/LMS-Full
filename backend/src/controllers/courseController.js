const Course = require('../models/Course');
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const getAllCourses = catchAsync(async (req, res, next) => {
  // Build query
  const queryObj = { ...req.query };
  const excludedFields = ['page', 'sort', 'limit', 'fields'];
  excludedFields.forEach(el => delete queryObj[el]);

  // Advanced filtering
  let queryStr = JSON.stringify(queryObj);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

  let query = Course.find(JSON.parse(queryStr));

  // Only show published and approved courses for non-authenticated users
  if (!req.user) {
    query = query.find({ isPublished: true, isApproved: true, isDeleted: false });
  }

  // Sorting
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  // Field limiting
  if (req.query.fields) {
    const fields = req.query.fields.split(',').join(' ');
    query = query.select(fields);
  } else {
    query = query.select('-__v');
  }

  // Pagination
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 10;
  const skip = (page - 1) * limit;

  query = query.skip(skip).limit(limit);

  // Execute query
  const courses = await query.populate('instructor', 'name avatar');
  const total = await Course.countDocuments();

  res.status(200).json({
    status: 'success',
    results: courses.length,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalResults: total,
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1,
    },
    data: courses,
  });
});

const getCourse = catchAsync(async (req, res, next) => {
  // First get the course to check ownership
  const course = await Course.findById(req.params.id)
    .populate('instructor', 'name avatar bio')
    .populate('createdBy', 'name email');

  if (!course) {
    return next(new AppError('No course found with that ID', 404));
  }

  // Check if course is deleted
  if (course.isDeleted) {
    return next(new AppError('No course found with that ID', 404));
  }

  // Check if user can access this course
  const isOwner = req.user && (
    course.instructor._id.toString() === req.user.id ||
    course.createdBy._id.toString() === req.user.id ||
    ['org_admin', 'super_admin'].includes(req.user.role)
  );

  // If user is not the owner and course is not published, deny access
  if (!isOwner && (!course.isPublished || !course.isApproved)) {
    return next(new AppError('No course found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      course,
    },
  });
});

const createCourse = catchAsync(async (req, res, next) => {
  const courseData = {
    ...req.body,
    instructor: req.user.id,
    createdBy: req.user.id,
  };

  const newCourse = await Course.create(courseData);

  res.status(201).json({
    status: 'success',
    data: {
      course: newCourse,
    },
  });
});

const updateCourse = catchAsync(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(new AppError('No course found with that ID', 404));
  }

  // Check if user can update this course
  if (course.instructor.toString() !== req.user.id && !['org_admin', 'super_admin'].includes(req.user.role)) {
    return next(new AppError('You do not have permission to update this course', 403));
  }

  const updatedCourse = await Course.findByIdAndUpdate(
    req.params.id,
    { ...req.body, lastUpdatedBy: req.user.id },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: 'success',
    data: {
      course: updatedCourse,
    },
  });
});

const deleteCourse = catchAsync(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(new AppError('No course found with that ID', 404));
  }

  // Check if user can delete this course
  if (course.instructor.toString() !== req.user.id && !['org_admin', 'super_admin'].includes(req.user.role)) {
    return next(new AppError('You do not have permission to delete this course', 403));
  }

  // Soft delete
  await Course.findByIdAndUpdate(req.params.id, {
    isDeleted: true,
    deletedAt: new Date(),
    deletedBy: req.user.id,
  });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

const publishCourse = catchAsync(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(new AppError('No course found with that ID', 404));
  }

  // Check if user can publish this course
  if (course.instructor.toString() !== req.user.id && !['org_admin', 'super_admin'].includes(req.user.role)) {
    return next(new AppError('You do not have permission to publish this course', 403));
  }

  course.isPublished = true;
  course.publishedAt = new Date();
  await course.save();

  res.status(200).json({
    status: 'success',
    data: {
      course,
    },
  });
});

const enrollCourse = catchAsync(async (req, res, next) => {
  const { courseId } = req.body;

  const course = await Course.findById(courseId);
  if (!course) {
    return next(new AppError('Course not found', 404));
  }

  await course.enrollStudent(req.user.id);

  res.status(200).json({
    status: 'success',
    message: 'Successfully enrolled in course',
  });
});

const updateProgress = catchAsync(async (req, res, next) => {
  const { courseId, lessonId } = req.body;

  const course = await Course.findById(courseId);
  if (!course) {
    return next(new AppError('Course not found', 404));
  }

  await course.updateProgress(req.user.id, lessonId);

  res.status(200).json({
    status: 'success',
    message: 'Progress updated successfully',
  });
});

const getMyCourses = catchAsync(async (req, res, next) => {
  let query;
  
  if (req.user.role === 'instructor' || req.user.role === 'org_admin' || req.user.role === 'super_admin') {
    // Get courses created by this instructor
    query = Course.find({ instructor: req.user.id, isDeleted: false });
  } else {
    // Get enrolled courses for students
    query = Course.find({ 'enrollments.student': req.user.id, isDeleted: false });
  }

  const courses = await query.populate('instructor', 'name avatar');

  res.status(200).json({
    status: 'success',
    results: courses.length,
    data: courses,
  });
});

const getCourseProgress = catchAsync(async (req, res, next) => {
  const course = await Course.findById(req.params.id);
  
  if (!course) {
    return next(new AppError('Course not found', 404));
  }

  const enrollment = course.enrollments.find(
    e => e.student.toString() === req.user.id
  );

  if (!enrollment) {
    return next(new AppError('You are not enrolled in this course', 403));
  }

  res.status(200).json({
    status: 'success',
    data: {
      progress: enrollment,
    },
  });
});

const getCourseStats = catchAsync(async (req, res, next) => {
  const course = await Course.findById(req.params.id);
  
  if (!course) {
    return next(new AppError('Course not found', 404));
  }

  // Check if user can view stats
  if (course.instructor.toString() !== req.user.id && !['org_admin', 'super_admin'].includes(req.user.role)) {
    return next(new AppError('You do not have permission to view course statistics', 403));
  }

  res.status(200).json({
    status: 'success',
    data: course.stats,
  });
});

const getCategories = (req, res) => {
  const categories = [
    'programming', 'web-development', 'mobile-development', 'data-science',
    'machine-learning', 'artificial-intelligence', 'cybersecurity', 'cloud-computing',
    'devops', 'blockchain', 'game-development', 'ui-ux-design', 'digital-marketing',
    'business', 'finance', 'management', 'personal-development', 'health-fitness',
    'language-learning', 'arts-crafts', 'music', 'photography', 'other'
  ];

  res.status(200).json({
    status: 'success',
    data: { categories },
  });
};

const getPopularCourses = catchAsync(async (req, res, next) => {
  const limit = req.query.limit * 1 || 10;
  
  const courses = await Course.find({
    isPublished: true,
    isApproved: true,
    isDeleted: false,
  })
    .sort({ 'stats.totalEnrollments': -1, 'rating.average': -1 })
    .limit(limit)
    .populate('instructor', 'name avatar');

  res.status(200).json({
    status: 'success',
    results: courses.length,
    data: { courses },
  });
});

const getFeaturedCourses = catchAsync(async (req, res, next) => {
  const limit = req.query.limit * 1 || 10;
  
  const courses = await Course.find({
    isFeatured: true,
    isPublished: true,
    isApproved: true,
    isDeleted: false,
  })
    .sort('-createdAt')
    .limit(limit)
    .populate('instructor', 'name avatar');

  res.status(200).json({
    status: 'success',
    results: courses.length,
    data: { courses },
  });
});

// Get user's enrolled courses
const getEnrolledCourses = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10, sort, category, level, search } = req.query;

  // Get user's enrollments first
  const Enrollment = require('../models/Enrollment');
  const enrollments = await Enrollment.find({
    student: req.user._id,
    status: { $in: ['active', 'completed'] }
  }).select('course');

  const courseIds = enrollments.map(enrollment => enrollment.course);

  if (courseIds.length === 0) {
    return res.status(200).json({
      status: 'success',
      results: 0,
      data: [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: 0,
        pages: 0,
      },
    });
  }

  // Build filter for enrolled courses
  const filter = {
    _id: { $in: courseIds },
    isDeleted: { $ne: true }
  };

  if (category) filter.category = category;
  if (level) filter.level = level;
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  // Build sort object
  let sortObj = {};
  if (sort) {
    const parts = sort.split(',');
    parts.forEach(part => {
      if (part.startsWith('-')) {
        sortObj[part.substring(1)] = -1;
      } else {
        sortObj[part] = 1;
      }
    });
  } else {
    sortObj.createdAt = -1;
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Course.countDocuments(filter);

  const courses = await Course.find(filter)
    .populate('instructor', 'name email avatar')
    .populate('coInstructors', 'name email avatar')
    .populate('createdBy', 'name email')
    .sort(sortObj)
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  // Add enrollment info to each course
  const coursesWithEnrollment = courses.map(course => {
    const enrollment = enrollments.find(e => e.course.toString() === course._id.toString());
    return {
      ...course,
      enrollmentStatus: enrollment?.status || 'not_enrolled'
    };
  });

  res.status(200).json({
    status: 'success',
    results: courses.length,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
    data: coursesWithEnrollment,
  });
});

module.exports = {
  getAllCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  publishCourse,
  enrollCourse,
  updateProgress,
  getMyCourses,
  getEnrolledCourses,
  getCourseProgress,
  getCourseStats,
  getCategories,
  getPopularCourses,
  getFeaturedCourses,
};