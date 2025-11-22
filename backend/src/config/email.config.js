/**
 * Email Configuration
 *
 * Configures Nodemailer transport for sending emails via Gmail
 */

const nodemailer = require('nodemailer');

/**
 * Create and configure email transporter
 *
 * For Gmail:
 * 1. Enable 2-factor authentication in your Google account
 * 2. Generate an "App Password" from Google Account settings
 * 3. Use the App Password in EMAIL_PASSWORD environment variable
 *
 * Alternative services: SendGrid, AWS SES, Mailgun, etc.
 */
const createTransporter = () => {
  // Check if email service is configured
  if (!process.env.EMAIL_USERNAME || !process.env.EMAIL_PASSWORD) {
    console.warn('⚠️  Email service not configured. Email notifications will be skipped.');
    return null;
  }

  try {
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
      // Additional options for better reliability
      tls: {
        rejectUnauthorized: process.env.NODE_ENV === 'production',
      },
    });

    // Verify transporter configuration
    transporter.verify((error, success) => {
      if (error) {
        console.error('❌ Email transporter verification failed:', error.message);
      } else {
        console.log('✅ Email service is ready to send messages');
      }
    });

    return transporter;
  } catch (error) {
    console.error('❌ Failed to create email transporter:', error.message);
    return null;
  }
};

// Create the transporter instance
const transporter = createTransporter();

/**
 * Email configuration object
 */
const emailConfig = {
  transporter,

  // Default sender information
  from: {
    name: process.env.EMAIL_FROM_NAME || 'LMS Platform',
    address: process.env.EMAIL_FROM || process.env.EMAIL_USERNAME,
  },

  // Frontend URL for links in emails
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',

  // Email service status
  isConfigured: () => !!transporter,
};

module.exports = emailConfig;
