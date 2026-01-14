const Course = require('../models/Course');
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const emailService = require('../services/emailService');

const getAllCourses = catchAsync(async (req, res, next) => {
  // Build query
  const queryObj = { ...req.query };
  const excludedFields = ['page', 'sort', 'limit', 'fields', 'search', 'minPrice', 'maxPrice', 'minRating'];
  excludedFields.forEach(el => delete queryObj[el]);

  // Advanced filtering
  let queryStr = JSON.stringify(queryObj);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

  const filter = JSON.parse(queryStr);

  // Only show published courses for non-authenticated users (allow preview without approval)
  if (!req.user) {
    filter.isPublished = true;
    filter.isDeleted = false;
  }

  // Text search
  if (req.query.search) {
    filter.$text = { $search: req.query.search };
  }

  // Price range filtering
  if (req.query.minPrice || req.query.maxPrice) {
    filter.price = {};
    if (req.query.minPrice) filter.price.$gte = parseFloat(req.query.minPrice);
    if (req.query.maxPrice) filter.price.$lte = parseFloat(req.query.maxPrice);
  }

  // Rating filtering
  if (req.query.minRating) {
    filter['rating.average'] = { $gte: parseFloat(req.query.minRating) };
  }

  let query = Course.find(filter);

  // Enhanced sorting
  if (req.query.sort) {
    let sortBy;
    switch (req.query.sort) {
      case 'popular':
        sortBy = '-stats.totalEnrollments -rating.average';
        break;
      case 'rating':
        sortBy = '-rating.average -stats.totalEnrollments';
        break;
      case 'price-asc':
        sortBy = 'price';
        break;
      case 'price-desc':
        sortBy = '-price';
        break;
      case 'newest':
        sortBy = '-createdAt';
        break;
      default:
        // Allow custom sort fields (e.g., sort=title,-createdAt)
        sortBy = req.query.sort.split(',').join(' ');
    }
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
  const total = await Course.countDocuments(filter);

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
    .populate('instructor', 'name avatar bio');

  if (!course) {
    return next(new AppError('No course found with that ID', 404));
  }

  // Check if course is deleted
  if (course.isDeleted) {
    return next(new AppError('No course found with that ID', 404));
  }

  // Check if user can access this course
  const isOwner = req.user && (
    (course.instructor && course.instructor._id.toString() === req.user.id) ||
    ['org_admin', 'super_admin'].includes(req.user.role)
  );

  // If user is not the owner and course is not published, deny access (allow preview without approval)
  if (!isOwner && !course.isPublished) {
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
    instructor: req.user._id,
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
    // Use $ne: true to include documents where isDeleted is false, undefined, or doesn't exist
    query = Course.find({ instructor: req.user._id, isDeleted: { $ne: true } });
  } else {
    // Get enrolled courses for students
    query = Course.find({ 'enrollments.student': req.user._id, isDeleted: { $ne: true } });
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

/**
 * @desc    Get all pending courses for admin review
 * @route   GET /api/v1/courses/pending
 * @access  Private (Admin only)
 */
const getPendingCourses = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Find courses that are published but not yet approved
  const query = {
    isPublished: true,
    isApproved: false,
    isDeleted: false
  };

  const courses = await Course.find(query)
    .populate('instructor', 'name email avatar')
    .sort('-createdAt')
    .skip(skip)
    .limit(limit);

  const total = await Course.countDocuments(query);

  res.status(200).json({
    status: 'success',
    results: courses.length,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    data: courses
  });
});

/**
 * @desc    Approve a course
 * @route   PATCH /api/v1/courses/:id/approve
 * @access  Private (Admin only)
 */
const approveCourse = catchAsync(async (req, res, next) => {
  const { feedback } = req.body;

  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(new AppError('No course found with that ID', 404));
  }

  if (course.isDeleted) {
    return next(new AppError('This course has been deleted', 400));
  }

  if (course.isApproved) {
    return next(new AppError('This course is already approved', 400));
  }

  if (!course.isPublished) {
    return next(new AppError('Course must be published before approval', 400));
  }

  // Approve the course
  course.isApproved = true;
  course.approvedBy = req.user._id;
  course.approvedAt = new Date();

  if (feedback) {
    if (!course.adminNotes) {
      course.adminNotes = [];
    }
    course.adminNotes.push({
      admin: req.user._id,
      note: feedback,
      action: 'approved',
      createdAt: new Date()
    });
  }

  await course.save();

  // Populate for response
  await course.populate('instructor', 'name email');
  await course.populate('approvedBy', 'name email');

  // Send approval email to instructor
  if (course.instructor && course.instructor.email) {
    try {
      await emailService.sendCourseApprovedEmail(
        course.instructor,
        course,
        feedback || ''
      );
    } catch (emailError) {
      console.error('Failed to send course approval email:', emailError);
      // Don't fail the request if email fails
    }
  }

  res.status(200).json({
    status: 'success',
    message: 'Course approved successfully',
    data: course
  });
});

/**
 * @desc    Reject a course
 * @route   PATCH /api/v1/courses/:id/reject
 * @access  Private (Admin only)
 */
const rejectCourse = catchAsync(async (req, res, next) => {
  const { reason } = req.body;

  if (!reason) {
    return next(new AppError('Please provide a reason for rejection', 400));
  }

  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(new AppError('No course found with that ID', 404));
  }

  if (course.isDeleted) {
    return next(new AppError('This course has been deleted', 400));
  }

  if (course.isApproved) {
    return next(new AppError('Cannot reject an approved course', 400));
  }

  // Mark as rejected (unpublish it)
  course.isPublished = false;
  course.isApproved = false;

  if (!course.adminNotes) {
    course.adminNotes = [];
  }

  course.adminNotes.push({
    admin: req.user._id,
    note: reason,
    action: 'rejected',
    createdAt: new Date()
  });

  await course.save();

  // Populate for response
  await course.populate('instructor', 'name email');

  // Send rejection email to instructor
  if (course.instructor && course.instructor.email) {
    try {
      await emailService.sendCourseRejectedEmail(
        course.instructor,
        course,
        reason
      );
    } catch (emailError) {
      console.error('Failed to send course rejection email:', emailError);
      // Don't fail the request if email fails
    }
  }

  res.status(200).json({
    status: 'success',
    message: 'Course rejected successfully',
    data: {
      course,
      rejectionReason: reason
    }
  });
});

/**
 * @desc    Revoke course approval
 * @route   PATCH /api/v1/courses/:id/revoke-approval
 * @access  Private (Admin only)
 */
const revokeApproval = catchAsync(async (req, res, next) => {
  const { reason } = req.body;

  if (!reason) {
    return next(new AppError('Please provide a reason for revoking approval', 400));
  }

  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(new AppError('No course found with that ID', 404));
  }

  if (!course.isApproved) {
    return next(new AppError('This course is not approved', 400));
  }

  // Revoke approval
  course.isApproved = false;
  course.isPublished = false;

  if (!course.adminNotes) {
    course.adminNotes = [];
  }

  course.adminNotes.push({
    admin: req.user._id,
    note: reason,
    action: 'revoked',
    createdAt: new Date()
  });

  await course.save();

  res.status(200).json({
    status: 'success',
    message: 'Course approval revoked successfully',
    data: course
  });

  // TODO: Send email notification to instructor (implement in Phase 1.3)
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
  getPendingCourses,
  approveCourse,
  rejectCourse,
  revokeApproval,
};