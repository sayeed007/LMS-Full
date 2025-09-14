const express = require('express');
const authController = require('../controllers/authController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.patch('/reset-password', authController.resetPassword);
router.post('/verify-email', authController.verifyEmail);
router.post('/resend-verification', authController.resendVerificationEmail);

// OAuth routes
router.get('/google', authController.googleAuth);
router.get('/google/callback', authController.googleCallback);

// SSO config
router.get('/sso/config', authController.getSSOConfig);

// Protected routes
router.use(protect); // All routes after this middleware are protected

router.post('/logout', authController.logout);
router.post('/refresh-token', authController.refreshToken);
router.get('/me', authController.getMe);
router.patch('/update-profile', authController.updateProfile);
router.patch('/change-password', authController.changePassword);

module.exports = router;