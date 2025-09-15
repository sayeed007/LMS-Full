const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { promisify } = require('util');
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const passport = require('passport');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const signRefreshToken = (id) => {
  return jwt.sign({ id, type: 'refresh' }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const refreshToken = signRefreshToken(user._id);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    refreshToken,
    data: {
      user,
    },
  });
};

const signup = catchAsync(async (req, res, next) => {
  const { name, email, password, confirmPassword, role } = req.body;

  if (password !== confirmPassword) {
    return next(new AppError('Passwords do not match', 400));
  }

  const newUser = await User.create({
    name,
    email,
    password,
    role: role || 'student',
  });

  createSendToken(newUser, 201, res);
});

const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }

  // Check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  if (!user.isActive) {
    return next(new AppError('Your account has been deactivated', 401));
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  createSendToken(user, 200, res);
});

const logout = (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully',
  });
};

const refreshToken = catchAsync(async (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return next(new AppError('Refresh token is required', 400));
  }

  // Verify refresh token
  const decoded = await promisify(jwt.verify)(refreshToken, process.env.JWT_REFRESH_SECRET);

  // Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('The user belonging to this token does no longer exist.', 401));
  }

  // Generate new tokens
  const newToken = signToken(currentUser._id);
  const newRefreshToken = signRefreshToken(currentUser._id);

  res.status(200).json({
    status: 'success',
    token: newToken,
    refreshToken: newRefreshToken,
    data: {
      user: currentUser,
    },
  });
});

const getMe = (req, res, next) => {
  res.status(200).json({
    status: 'success',
    data: {
      user: req.user,
    },
  });
};

const updateProfile = catchAsync(async (req, res, next) => {
  // Don't allow password updates here
  if (req.body.password || req.body.confirmPassword) {
    return next(new AppError('This route is not for password updates. Please use /change-password.', 400));
  }

  const filteredBody = {};
  const allowedFields = ['name', 'bio', 'phoneNumber', 'skills', 'socialLinks', 'avatar'];
  
  Object.keys(req.body).forEach(el => {
    if (allowedFields.includes(el)) filteredBody[el] = req.body[el];
  });

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

const changePassword = catchAsync(async (req, res, next) => {
  // Get user from collection
  const user = await User.findById(req.user.id).select('+password');

  // Check if POSTed current password is correct
  if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
    return next(new AppError('Your current password is wrong.', 401));
  }

  if (req.body.newPassword !== req.body.confirmPassword) {
    return next(new AppError('Passwords do not match', 400));
  }

  // Update password
  user.password = req.body.newPassword;
  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'Password changed successfully',
  });
});

const forgotPassword = catchAsync(async (req, res, next) => {
  // Implementation for forgot password would be here
  res.status(200).json({
    status: 'success',
    message: 'Password reset functionality not implemented yet',
  });
});

const resetPassword = catchAsync(async (req, res, next) => {
  // Implementation for reset password would be here
  res.status(200).json({
    status: 'success',
    message: 'Password reset functionality not implemented yet',
  });
});

const verifyEmail = catchAsync(async (req, res, next) => {
  // Implementation for email verification would be here
  res.status(200).json({
    status: 'success',
    message: 'Email verification functionality not implemented yet',
  });
});

const resendVerificationEmail = catchAsync(async (req, res, next) => {
  // Implementation for resend verification would be here
  res.status(200).json({
    status: 'success',
    message: 'Resend verification functionality not implemented yet',
  });
});

// Removed backend Google OAuth methods - using NextAuth.js instead

const getSSOConfig = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      googleEnabled: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
      microsoftEnabled: false, // Would check Microsoft config
      samlEnabled: false, // Would check SAML config
    },
  });
};

const oauthLogin = catchAsync(async (req, res, next) => {
  const { provider, providerId, email, name, image } = req.body;

  if (!provider || !providerId || !email || !name) {
    return next(new AppError('Missing required OAuth data', 400));
  }

  try {
    // Check if user already exists with this OAuth provider
    let user = await User.findOne({
      $or: [
        { email },
        { [`oauthProviders.${provider}.id`]: providerId }
      ]
    });

    if (user) {
      // Update OAuth provider info if not already present
      if (!user.oauthProviders || !user.oauthProviders[provider]) {
        user.oauthProviders = user.oauthProviders || {};
        user.oauthProviders[provider] = {
          id: providerId,
          email,
        };
        await user.save({ validateBeforeSave: false });
      }
    } else {
      // Create new user
      user = await User.create({
        name,
        email,
        avatar: image,
        role: 'student', // Default role for OAuth users
        emailVerified: true, // OAuth emails are considered verified
        oauthProviders: {
          [provider]: {
            id: providerId,
            email,
          }
        },
        // Set a random password since this is OAuth
        password: crypto.randomBytes(32).toString('hex'),
      });
    }

    // Generate JWT tokens
    const token = signToken(user._id);
    const refreshToken = signRefreshToken(user._id);

    // Remove sensitive data
    user.password = undefined;
    user.oauthProviders = undefined;

    res.status(200).json({
      status: 'success',
      token,
      refreshToken,
      data: {
        user,
      },
    });
  } catch (error) {
    console.error('OAuth login error:', error);
    return next(new AppError('OAuth authentication failed', 500));
  }
});

module.exports = {
  signup,
  login,
  logout,
  refreshToken,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerificationEmail,
  getSSOConfig,
  oauthLogin,
};