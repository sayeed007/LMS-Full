const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

/**
 * @desc    Get all users with pagination and filtering
 * @route   GET /api/v1/users
 * @access  Private (Admin only)
 */
const getAllUsers = catchAsync(async (req, res, next) => {
  // Build query
  const queryObj = { ...req.query };
  const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
  excludedFields.forEach(el => delete queryObj[el]);

  let query = User.find(queryObj);

  // Search functionality
  if (req.query.search) {
    query = query.find({
      $or: [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ]
    });
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
    query = query.select('-password -__v');
  }

  // Pagination
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 10;
  const skip = (page - 1) * limit;

  query = query.skip(skip).limit(limit);

  // Execute query
  const users = await query;

  // Get total count for pagination
  const totalQuery = User.find(queryObj);
  if (req.query.search) {
    totalQuery.find({
      $or: [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ]
    });
  }
  const total = await totalQuery.countDocuments();

  res.status(200).json({
    status: 'success',
    results: users.length,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalResults: total,
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1,
    },
    data: users,
  });
});

/**
 * @desc    Get all instructors
 * @route   GET /api/v1/users/instructors
 * @access  Private
 */
const getAllInstructors = catchAsync(async (req, res, next) => {
  const instructors = await User.find({
    role: 'instructor',
    isActive: true
  }).select('-password -__v');

  res.status(200).json({
    status: 'success',
    results: instructors.length,
    data: instructors,
  });
});

/**
 * @desc    Get user by ID
 * @route   GET /api/v1/users/:id
 * @access  Private
 */
const getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

/**
 * @desc    Update user
 * @route   PATCH /api/v1/users/:id
 * @access  Private (Admin only)
 */
const updateUser = catchAsync(async (req, res, next) => {
  const { name, email, role, isActive, bio, avatar } = req.body;

  // Check if user exists
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  // Prevent changing own role or status
  if (req.user.id === req.params.id) {
    if (req.body.role && req.body.role !== user.role) {
      return next(new AppError('You cannot change your own role', 400));
    }
    if (req.body.isActive !== undefined && req.body.isActive !== user.isActive) {
      return next(new AppError('You cannot change your own account status', 400));
    }
  }

  // Only super_admin can create/modify super_admin role
  if (role === 'super_admin' && req.user.role !== 'super_admin') {
    return next(new AppError('Only super admins can assign super admin role', 403));
  }

  // Update allowed fields
  if (name !== undefined) user.name = name;
  if (email !== undefined) user.email = email;
  if (role !== undefined) user.role = role;
  if (isActive !== undefined) user.isActive = isActive;
  if (bio !== undefined) user.bio = bio;
  if (avatar !== undefined) user.avatar = avatar;

  await user.save({ validateBeforeSave: false });

  // Remove password from output
  user.password = undefined;

  res.status(200).json({
    status: 'success',
    message: 'User updated successfully',
    data: {
      user,
    },
  });
});

/**
 * @desc    Delete user
 * @route   DELETE /api/v1/users/:id
 * @access  Private (Super Admin only)
 */
const deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  // Prevent deleting own account
  if (req.user.id === req.params.id) {
    return next(new AppError('You cannot delete your own account', 400));
  }

  // Soft delete - just deactivate the user
  user.isActive = false;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    message: 'User deleted successfully',
    data: null,
  });
});

/**
 * @desc    Activate user account
 * @route   PATCH /api/v1/users/:id/activate
 * @access  Private (Admin only)
 */
const activateUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  if (user.isActive) {
    return next(new AppError('User account is already active', 400));
  }

  user.isActive = true;
  await user.save({ validateBeforeSave: false });

  // Remove password from output
  user.password = undefined;

  res.status(200).json({
    status: 'success',
    message: 'User account activated successfully',
    data: {
      user,
    },
  });
});

/**
 * @desc    Deactivate user account
 * @route   PATCH /api/v1/users/:id/deactivate
 * @access  Private (Admin only)
 */
const deactivateUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  // Prevent deactivating own account
  if (req.user.id === req.params.id) {
    return next(new AppError('You cannot deactivate your own account', 400));
  }

  if (!user.isActive) {
    return next(new AppError('User account is already inactive', 400));
  }

  user.isActive = false;
  await user.save({ validateBeforeSave: false });

  // Remove password from output
  user.password = undefined;

  res.status(200).json({
    status: 'success',
    message: 'User account deactivated successfully',
    data: {
      user,
    },
  });
});

/**
 * @desc    Get user statistics
 * @route   GET /api/v1/users/stats
 * @access  Private (Admin only)
 */
const getUserStats = catchAsync(async (req, res, next) => {
  const stats = await User.aggregate([
    {
      $facet: {
        totalUsers: [{ $count: 'count' }],
        activeUsers: [
          { $match: { isActive: true } },
          { $count: 'count' }
        ],
        inactiveUsers: [
          { $match: { isActive: false } },
          { $count: 'count' }
        ],
        usersByRole: [
          {
            $group: {
              _id: '$role',
              count: { $sum: 1 }
            }
          },
          {
            $project: {
              role: '$_id',
              count: 1,
              _id: 0
            }
          }
        ],
        recentUsers: [
          { $sort: { createdAt: -1 } },
          { $limit: 5 },
          {
            $project: {
              name: 1,
              email: 1,
              role: 1,
              createdAt: 1,
              isActive: 1
            }
          }
        ]
      }
    }
  ]);

  const result = {
    totalUsers: stats[0].totalUsers[0]?.count || 0,
    activeUsers: stats[0].activeUsers[0]?.count || 0,
    inactiveUsers: stats[0].inactiveUsers[0]?.count || 0,
    usersByRole: stats[0].usersByRole,
    recentUsers: stats[0].recentUsers
  };

  res.status(200).json({
    status: 'success',
    data: result,
  });
});

module.exports = {
  getAllUsers,
  getAllInstructors,
  getUser,
  updateUser,
  deleteUser,
  activateUser,
  deactivateUser,
  getUserStats,
};
