const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { promisify } = require('util');
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const passport = require('passport');
const emailService = require('../services/emailService');

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

  // Send welcome email (async, don't wait)
  emailService.sendWelcomeEmail(newUser).catch(err => {
    console.error('Failed to send welcome email:', err);
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
  // Get user based on email
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError('There is no user with that email address', 404));
  }

  // Generate random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  try {
    // Send password reset email
    await emailService.sendPasswordResetEmail(user, resetToken);

    res.status(200).json({
      status: 'success',
      message: 'Password reset email sent successfully',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('There was an error sending the email. Try again later!', 500)
    );
  }
});

const resetPassword = catchAsync(async (req, res, next) => {
  // Get hashed token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.body.token || req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // If token has not expired and there is a user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // Log the user in, send JWT
  createSendToken(user, 200, res);
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

    let isNewUser = false;

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
      isNewUser = true;
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

      // Send welcome email for new OAuth users (async, don't wait)
      emailService.sendWelcomeEmail(user).catch(err => {
        console.error('Failed to send welcome email to OAuth user:', err);
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