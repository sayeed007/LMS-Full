const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../models/User');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check if it's there
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('You are not logged in! Please log in to get access.', 401));
  }

  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('The user belonging to this token does no longer exist.', 401));
  }

  // 4) Check if user is active
  if (!currentUser.isActive) {
    return next(new AppError('Your account has been deactivated. Please contact support.', 401));
  }

  // Grant access to protected route
  req.user = currentUser;
  next();
});

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};

const restrictToOwnerOrRole = (...roles) => {
  return (req, res, next) => {
    const isOwner = req.user.id === req.params.userId || req.user.id === req.params.id;
    const hasRole = roles.includes(req.user.role);
    
    if (!isOwner && !hasRole) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};

const restrictToCourseInstructorOrRole = (...roles) => {
  return catchAsync(async (req, res, next) => {
    const Course = require('../models/Course');
    
    let courseId = req.params.courseId || req.params.id;
    if (!courseId && req.body.courseId) {
      courseId = req.body.courseId;
    }

    if (!courseId) {
      return next(new AppError('Course ID is required', 400));
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return next(new AppError('Course not found', 404));
    }

    const isInstructor = course.instructor.toString() === req.user.id ||
                        course.coInstructors.some(coInstructor => coInstructor.toString() === req.user.id);
    const hasRole = roles.includes(req.user.role);
    
    if (!isInstructor && !hasRole) {
      return next(new AppError('You do not have permission to access this course', 403));
    }
    
    req.course = course;
    next();
  });
};

const restrictToArticleAuthorOrRole = (...roles) => {
  return catchAsync(async (req, res, next) => {
    const Article = require('../models/Article');
    
    let articleId = req.params.articleId || req.params.id;
    if (!articleId && req.body.articleId) {
      articleId = req.body.articleId;
    }

    if (!articleId) {
      return next(new AppError('Article ID is required', 400));
    }

    const article = await Article.findById(articleId);
    if (!article) {
      return next(new AppError('Article not found', 404));
    }

    const isAuthor = article.author.toString() === req.user.id;
    const hasRole = roles.includes(req.user.role);
    
    if (!isAuthor && !hasRole) {
      return next(new AppError('You do not have permission to access this article', 403));
    }
    
    req.article = article;
    next();
  });
};

const checkSubscriptionLimits = (feature) => {
  return catchAsync(async (req, res, next) => {
    const user = req.user;
    
    if (!user.subscription || user.subscription.status !== 'active') {
      return next(new AppError('You need an active subscription to access this feature', 403));
    }

    const subscription = user.subscription;
    
    switch (feature) {
      case 'createCourse':
        if (subscription.plan === 'free') {
          const Course = require('../models/Course');
          const userCourses = await Course.countDocuments({ instructor: user.id, isDeleted: false });
          if (userCourses >= subscription.features.maxCourses) {
            return next(new AppError(`Your ${subscription.plan} plan allows only ${subscription.features.maxCourses} courses. Please upgrade.`, 403));
          }
        }
        break;
        
      case 'analytics':
        if (!subscription.features.analyticsAccess) {
          return next(new AppError('Analytics access is not available in your current plan. Please upgrade.', 403));
        }
        break;
        
      case 'customBranding':
        if (!subscription.features.customBranding) {
          return next(new AppError('Custom branding is not available in your current plan. Please upgrade.', 403));
        }
        break;
        
      default:
        break;
    }
    
    next();
  });
};

const optionalAuth = catchAsync(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
      const currentUser = await User.findById(decoded.id);
      
      if (currentUser && currentUser.isActive) {
        req.user = currentUser;
      }
    } catch (error) {
      // Token is invalid, but we continue without user
      req.user = null;
    }
  }

  next();
});

module.exports = {
  protect,
  restrictTo,
  restrictToOwnerOrRole,
  restrictToCourseInstructorOrRole,
  restrictToArticleAuthorOrRole,
  checkSubscriptionLimits,
  optionalAuth
};