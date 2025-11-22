const Setting = require('../models/Setting');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

/**
 * @desc    Get all settings (admin only)
 * @route   GET /api/v1/settings
 * @access  Private (Admin)
 */
const getSettings = catchAsync(async (req, res, next) => {
  // Get settings with sensitive fields included
  const settings = await Setting.findOne()
    .select('+email.password +payment.sslcommerz.storePassword +payment.stripe.secretKey +payment.paypal.clientSecret');

  if (!settings) {
    // Create default settings if none exist
    const newSettings = await Setting.create({});
    return res.status(200).json({
      status: 'success',
      data: newSettings
    });
  }

  res.status(200).json({
    status: 'success',
    data: settings
  });
});

/**
 * @desc    Get public settings (no authentication required)
 * @route   GET /api/v1/settings/public
 * @access  Public
 */
const getPublicSettings = catchAsync(async (req, res, next) => {
  const settings = await Setting.getSettings();
  const publicSettings = settings.getPublicSettings();

  res.status(200).json({
    status: 'success',
    data: publicSettings
  });
});

/**
 * @desc    Update settings
 * @route   PATCH /api/v1/settings
 * @access  Private (Admin)
 */
const updateSettings = catchAsync(async (req, res, next) => {
  const updates = req.body;

  // Validate that only allowed categories are being updated
  const allowedCategories = ['general', 'email', 'payment', 'system', 'features', 'social', 'seo'];
  const updateCategories = Object.keys(updates);

  const invalidCategories = updateCategories.filter(cat => !allowedCategories.includes(cat));
  if (invalidCategories.length > 0) {
    return next(new AppError(`Invalid setting categories: ${invalidCategories.join(', ')}`, 400));
  }

  // Update settings using the static method
  const settings = await Setting.updateSettings(updates, req.user._id);

  // Fetch updated settings with sensitive fields
  const updatedSettings = await Setting.findById(settings._id)
    .select('+email.password +payment.sslcommerz.storePassword +payment.stripe.secretKey +payment.paypal.clientSecret')
    .populate('lastUpdatedBy', 'name email');

  res.status(200).json({
    status: 'success',
    message: 'Settings updated successfully',
    data: updatedSettings
  });
});

/**
 * @desc    Update general settings
 * @route   PATCH /api/v1/settings/general
 * @access  Private (Admin)
 */
const updateGeneralSettings = catchAsync(async (req, res, next) => {
  const updates = { general: req.body };
  const settings = await Setting.updateSettings(updates, req.user._id);

  res.status(200).json({
    status: 'success',
    message: 'General settings updated successfully',
    data: { general: settings.general }
  });
});

/**
 * @desc    Update email settings
 * @route   PATCH /api/v1/settings/email
 * @access  Private (Admin)
 */
const updateEmailSettings = catchAsync(async (req, res, next) => {
  const updates = { email: req.body };
  const settings = await Setting.updateSettings(updates, req.user._id);

  // Return email settings without password
  const emailSettings = { ...settings.email.toObject() };
  delete emailSettings.password;

  res.status(200).json({
    status: 'success',
    message: 'Email settings updated successfully',
    data: { email: emailSettings }
  });
});

/**
 * @desc    Update payment settings
 * @route   PATCH /api/v1/settings/payment
 * @access  Private (Admin)
 */
const updatePaymentSettings = catchAsync(async (req, res, next) => {
  const updates = { payment: req.body };
  const settings = await Setting.updateSettings(updates, req.user._id);

  // Return payment settings without sensitive credentials
  const paymentSettings = { ...settings.payment.toObject() };
  if (paymentSettings.sslcommerz) {
    delete paymentSettings.sslcommerz.storePassword;
  }
  if (paymentSettings.stripe) {
    delete paymentSettings.stripe.secretKey;
  }
  if (paymentSettings.paypal) {
    delete paymentSettings.paypal.clientSecret;
  }

  res.status(200).json({
    status: 'success',
    message: 'Payment settings updated successfully',
    data: { payment: paymentSettings }
  });
});

/**
 * @desc    Update system settings
 * @route   PATCH /api/v1/settings/system
 * @access  Private (Admin)
 */
const updateSystemSettings = catchAsync(async (req, res, next) => {
  const updates = { system: req.body };
  const settings = await Setting.updateSettings(updates, req.user._id);

  res.status(200).json({
    status: 'success',
    message: 'System settings updated successfully',
    data: { system: settings.system }
  });
});

/**
 * @desc    Update feature settings
 * @route   PATCH /api/v1/settings/features
 * @access  Private (Admin)
 */
const updateFeatureSettings = catchAsync(async (req, res, next) => {
  const updates = { features: req.body };
  const settings = await Setting.updateSettings(updates, req.user._id);

  res.status(200).json({
    status: 'success',
    message: 'Feature settings updated successfully',
    data: { features: settings.features }
  });
});

/**
 * @desc    Update social media settings
 * @route   PATCH /api/v1/settings/social
 * @access  Private (Admin)
 */
const updateSocialSettings = catchAsync(async (req, res, next) => {
  const updates = { social: req.body };
  const settings = await Setting.updateSettings(updates, req.user._id);

  res.status(200).json({
    status: 'success',
    message: 'Social media settings updated successfully',
    data: { social: settings.social }
  });
});

/**
 * @desc    Update SEO settings
 * @route   PATCH /api/v1/settings/seo
 * @access  Private (Admin)
 */
const updateSEOSettings = catchAsync(async (req, res, next) => {
  const updates = { seo: req.body };
  const settings = await Setting.updateSettings(updates, req.user._id);

  res.status(200).json({
    status: 'success',
    message: 'SEO settings updated successfully',
    data: { seo: settings.seo }
  });
});

/**
 * @desc    Test email configuration
 * @route   POST /api/v1/settings/test-email
 * @access  Private (Admin)
 */
const testEmailConfiguration = catchAsync(async (req, res, next) => {
  const { recipientEmail } = req.body;

  if (!recipientEmail) {
    return next(new AppError('Please provide a recipient email address', 400));
  }

  const emailService = require('../services/emailService');

  try {
    // Send a test email
    await emailService.sendEmail({
      to: recipientEmail,
      subject: 'LMS - Email Configuration Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Email Configuration Test</h2>
          <p>This is a test email to verify your email configuration is working correctly.</p>
          <p>If you received this email, your email settings are configured properly!</p>
          <hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #6b7280; font-size: 14px;">
            Sent from your LMS Platform at ${new Date().toLocaleString()}
          </p>
        </div>
      `
    });

    res.status(200).json({
      status: 'success',
      message: `Test email sent successfully to ${recipientEmail}`
    });
  } catch (error) {
    return next(new AppError(`Failed to send test email: ${error.message}`, 500));
  }
});

/**
 * @desc    Reset settings to default
 * @route   POST /api/v1/settings/reset
 * @access  Private (Super Admin only)
 */
const resetSettings = catchAsync(async (req, res, next) => {
  // Only super_admin can reset settings
  if (req.user.role !== 'super_admin') {
    return next(new AppError('Only super administrators can reset settings', 403));
  }

  // Delete existing settings
  await Setting.deleteMany({});

  // Create new default settings
  const settings = await Setting.create({
    lastUpdatedBy: req.user._id
  });

  res.status(200).json({
    status: 'success',
    message: 'Settings have been reset to default values',
    data: settings
  });
});

module.exports = {
  getSettings,
  getPublicSettings,
  updateSettings,
  updateGeneralSettings,
  updateEmailSettings,
  updatePaymentSettings,
  updateSystemSettings,
  updateFeatureSettings,
  updateSocialSettings,
  updateSEOSettings,
  testEmailConfiguration,
  resetSettings
};
