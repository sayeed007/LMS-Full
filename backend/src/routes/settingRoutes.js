const express = require('express');
const {
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
} = require('../controllers/settingController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Settings
 *   description: System settings management (Admin only)
 */

/**
 * @swagger
 * /settings/public:
 *   get:
 *     summary: Get public settings
 *     description: Retrieve public settings that are safe to expose to all users
 *     tags: [Settings]
 *     responses:
 *       200:
 *         description: Public settings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 */
router.get('/public', getPublicSettings);

// All routes below require authentication and admin role
router.use(protect);
router.use(restrictTo('org_admin', 'super_admin'));

/**
 * @swagger
 * /settings:
 *   get:
 *     summary: Get all settings
 *     description: Retrieve all system settings including sensitive data (Admin only)
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Settings retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/', getSettings);

/**
 * @swagger
 * /settings:
 *   patch:
 *     summary: Update settings
 *     description: Update multiple setting categories at once (Admin only)
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               general:
 *                 type: object
 *               email:
 *                 type: object
 *               payment:
 *                 type: object
 *               system:
 *                 type: object
 *               features:
 *                 type: object
 *               social:
 *                 type: object
 *               seo:
 *                 type: object
 *     responses:
 *       200:
 *         description: Settings updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.patch('/', updateSettings);

/**
 * @swagger
 * /settings/general:
 *   patch:
 *     summary: Update general settings
 *     description: Update general site settings (Admin only)
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               siteName:
 *                 type: string
 *               siteDescription:
 *                 type: string
 *               siteUrl:
 *                 type: string
 *               logo:
 *                 type: string
 *               contactEmail:
 *                 type: string
 *     responses:
 *       200:
 *         description: General settings updated successfully
 */
router.patch('/general', updateGeneralSettings);

/**
 * @swagger
 * /settings/email:
 *   patch:
 *     summary: Update email settings
 *     description: Update email/SMTP configuration (Admin only)
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               enabled:
 *                 type: boolean
 *               service:
 *                 type: string
 *                 enum: [gmail, smtp, sendgrid, ses]
 *               host:
 *                 type: string
 *               port:
 *                 type: number
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               fromEmail:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email settings updated successfully
 */
router.patch('/email', updateEmailSettings);

/**
 * @swagger
 * /settings/payment:
 *   patch:
 *     summary: Update payment settings
 *     description: Update payment gateway configuration (Admin only)
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               enabled:
 *                 type: boolean
 *               gateway:
 *                 type: string
 *                 enum: [sslcommerz, stripe, paypal]
 *               mode:
 *                 type: string
 *                 enum: [sandbox, live]
 *     responses:
 *       200:
 *         description: Payment settings updated successfully
 */
router.patch('/payment', updatePaymentSettings);

/**
 * @swagger
 * /settings/system:
 *   patch:
 *     summary: Update system settings
 *     description: Update system configuration (Admin only)
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               maintenanceMode:
 *                 type: boolean
 *               registrationEnabled:
 *                 type: boolean
 *               courseApprovalRequired:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: System settings updated successfully
 */
router.patch('/system', updateSystemSettings);

/**
 * @swagger
 * /settings/features:
 *   patch:
 *     summary: Update feature settings
 *     description: Enable/disable platform features (Admin only)
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               enableCertificates:
 *                 type: boolean
 *               enableMessaging:
 *                 type: boolean
 *               enableForums:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Feature settings updated successfully
 */
router.patch('/features', updateFeatureSettings);

/**
 * @swagger
 * /settings/social:
 *   patch:
 *     summary: Update social media settings
 *     description: Update social media links (Admin only)
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               facebook:
 *                 type: string
 *               twitter:
 *                 type: string
 *               linkedin:
 *                 type: string
 *     responses:
 *       200:
 *         description: Social media settings updated successfully
 */
router.patch('/social', updateSocialSettings);

/**
 * @swagger
 * /settings/seo:
 *   patch:
 *     summary: Update SEO settings
 *     description: Update SEO and analytics settings (Admin only)
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               metaTitle:
 *                 type: string
 *               metaDescription:
 *                 type: string
 *               googleAnalyticsId:
 *                 type: string
 *     responses:
 *       200:
 *         description: SEO settings updated successfully
 */
router.patch('/seo', updateSEOSettings);

/**
 * @swagger
 * /settings/test-email:
 *   post:
 *     summary: Test email configuration
 *     description: Send a test email to verify email settings (Admin only)
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - recipientEmail
 *             properties:
 *               recipientEmail:
 *                 type: string
 *                 example: test@example.com
 *     responses:
 *       200:
 *         description: Test email sent successfully
 *       400:
 *         description: Invalid email address
 *       500:
 *         description: Failed to send email
 */
router.post('/test-email', testEmailConfiguration);

/**
 * @swagger
 * /settings/reset:
 *   post:
 *     summary: Reset settings to default
 *     description: Reset all settings to their default values (Super Admin only)
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Settings reset successfully
 *       403:
 *         description: Forbidden - Super Admin access required
 */
router.post('/reset', restrictTo('super_admin'), resetSettings);

module.exports = router;
