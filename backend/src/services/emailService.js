/**
 * Email Service
 *
 * Handles sending various types of emails throughout the application
 */

const emailConfig = require('../config/email.config');

/**
 * Generic function to send email
 *
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @param {string} options.text - Plain text content (optional)
 * @returns {Promise<Object>} - Email send result
 */
const sendEmail = async ({ to, subject, html, text }) => {
  // Check if email service is configured
  if (!emailConfig.isConfigured()) {
    console.warn(`⚠️  Email not sent (service not configured): ${subject} to ${to}`);
    return { success: false, message: 'Email service not configured' };
  }

  try {
    const mailOptions = {
      from: `${emailConfig.from.name} <${emailConfig.from.address}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML tags for text version
    };

    const info = await emailConfig.transporter.sendMail(mailOptions);

    console.log(`✅ Email sent: ${subject} to ${to}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Failed to send email: ${subject} to ${to}`, error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send welcome email to new user
 *
 * @param {Object} user - User object
 * @param {string} user.email - User email
 * @param {string} user.name - User name
 * @returns {Promise<Object>}
 */
const sendWelcomeEmail = async (user) => {
  const subject = 'Welcome to LMS Platform! 🎓';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to LMS Platform!</h1>
        </div>
        <div class="content">
          <h2>Hi ${user.name || 'there'},</h2>
          <p>Thank you for joining our Learning Management System! We're excited to have you on board.</p>

          <p>Here's what you can do next:</p>
          <ul>
            <li>Browse our course catalog</li>
            <li>Complete your profile</li>
            <li>Start learning today!</li>
          </ul>

          <div style="text-align: center;">
            <a href="${emailConfig.frontendUrl}/courses" class="button">Explore Courses</a>
          </div>

          <p>If you have any questions, feel free to reach out to our support team.</p>

          <p>Happy Learning! 🚀</p>
          <p>The LMS Team</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} LMS Platform. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({ to: user.email, subject, html });
};

/**
 * Send password reset email
 *
 * @param {Object} user - User object
 * @param {string} user.email - User email
 * @param {string} user.name - User name
 * @param {string} resetToken - Password reset token
 * @returns {Promise<Object>}
 */
const sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${emailConfig.frontendUrl}/reset-password?token=${resetToken}`;
  const subject = 'Password Reset Request 🔐';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f44336; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 30px; background: #f44336; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset Request</h1>
        </div>
        <div class="content">
          <h2>Hi ${user.name || 'there'},</h2>
          <p>We received a request to reset your password for your LMS Platform account.</p>

          <p>Click the button below to reset your password:</p>

          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset Password</a>
          </div>

          <div class="warning">
            <strong>⚠️ Security Notice:</strong>
            <ul>
              <li>This link will expire in 1 hour</li>
              <li>If you didn't request this, please ignore this email</li>
              <li>Your password won't change until you create a new one</li>
            </ul>
          </div>

          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${resetUrl}</p>

          <p>Stay safe!</p>
          <p>The LMS Team</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} LMS Platform. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({ to: user.email, subject, html });
};

/**
 * Send course enrollment confirmation
 *
 * @param {Object} user - User object
 * @param {Object} course - Course object
 * @returns {Promise<Object>}
 */
const sendEnrollmentConfirmation = async (user, course) => {
  const courseUrl = `${emailConfig.frontendUrl}/courses/${course._id}`;
  const subject = `🎉 Enrollment Confirmed: ${course.title}`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .course-card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Enrollment Confirmed!</h1>
        </div>
        <div class="content">
          <h2>Hi ${user.name || 'there'},</h2>
          <p>Congratulations! You've successfully enrolled in:</p>

          <div class="course-card">
            <h3>${course.title}</h3>
            ${course.description ? `<p>${course.description}</p>` : ''}
            ${course.instructor ? `<p><strong>Instructor:</strong> ${course.instructor.name || 'TBD'}</p>` : ''}
          </div>

          <p>You can start learning right away!</p>

          <div style="text-align: center;">
            <a href="${courseUrl}" class="button">Start Learning</a>
          </div>

          <p>Good luck with your learning journey! 📚</p>
          <p>The LMS Team</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} LMS Platform. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({ to: user.email, subject, html });
};

/**
 * Send payment confirmation email
 *
 * @param {Object} user - User object
 * @param {Object} payment - Payment object
 * @param {Object} course - Course object
 * @returns {Promise<Object>}
 */
const sendPaymentConfirmation = async (user, payment, course) => {
  const receiptUrl = `${emailConfig.frontendUrl}/payment/history`;
  const courseUrl = `${emailConfig.frontendUrl}/courses/${course._id}`;
  const subject = `✅ Payment Confirmation - ${course.title}`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4caf50; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .payment-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .button { display: inline-block; padding: 12px 30px; background: #4caf50; color: white; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Payment Successful!</h1>
        </div>
        <div class="content">
          <h2>Hi ${user.name || 'there'},</h2>
          <p>Thank you for your payment! Your transaction was successful.</p>

          <div class="payment-details">
            <h3>Payment Details</h3>
            <div class="detail-row">
              <span><strong>Transaction ID:</strong></span>
              <span>${payment.transactionId || payment._id}</span>
            </div>
            <div class="detail-row">
              <span><strong>Course:</strong></span>
              <span>${course.title}</span>
            </div>
            <div class="detail-row">
              <span><strong>Amount:</strong></span>
              <span>${payment.currency || 'BDT'} ${payment.amount}</span>
            </div>
            <div class="detail-row">
              <span><strong>Date:</strong></span>
              <span>${new Date(payment.createdAt || Date.now()).toLocaleDateString()}</span>
            </div>
            <div class="detail-row">
              <span><strong>Status:</strong></span>
              <span style="color: #4caf50; font-weight: bold;">Paid</span>
            </div>
          </div>

          <p>You now have full access to the course. Happy learning!</p>

          <div style="text-align: center;">
            <a href="${courseUrl}" class="button">Start Learning</a>
            <a href="${receiptUrl}" class="button" style="background: #666;">View Receipt</a>
          </div>

          <p>If you have any questions about your payment, please contact our support team.</p>

          <p>Thank you for choosing LMS Platform! 🎓</p>
          <p>The LMS Team</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} LMS Platform. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({ to: user.email, subject, html });
};

/**
 * Send course approval notification to instructor
 *
 * @param {Object} instructor - Instructor object
 * @param {Object} course - Course object
 * @param {string} adminNotes - Admin notes (optional)
 * @returns {Promise<Object>}
 */
const sendCourseApprovedEmail = async (instructor, course, adminNotes = '') => {
  const courseUrl = `${emailConfig.frontendUrl}/instructor/courses/${course._id}`;
  const subject = `✅ Course Approved: ${course.title}`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4caf50; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .course-card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .notes { background: #e8f5e9; border-left: 4px solid #4caf50; padding: 15px; margin: 20px 0; }
        .button { display: inline-block; padding: 12px 30px; background: #4caf50; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Course Approved!</h1>
        </div>
        <div class="content">
          <h2>Hi ${instructor.name || 'there'},</h2>
          <p>Great news! Your course has been approved by our admin team and is now live on the platform.</p>

          <div class="course-card">
            <h3>${course.title}</h3>
            <p><strong>Status:</strong> <span style="color: #4caf50;">✅ Approved</span></p>
          </div>

          ${adminNotes ? `
          <div class="notes">
            <strong>📝 Admin Notes:</strong>
            <p>${adminNotes}</p>
          </div>
          ` : ''}

          <p>Your course is now visible to students and they can start enrolling. You can track enrollments and student progress from your instructor dashboard.</p>

          <div style="text-align: center;">
            <a href="${courseUrl}" class="button">View Course</a>
          </div>

          <p>Keep up the great work! 🚀</p>
          <p>The LMS Team</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} LMS Platform. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({ to: instructor.email, subject, html });
};

/**
 * Send course rejection notification to instructor
 *
 * @param {Object} instructor - Instructor object
 * @param {Object} course - Course object
 * @param {string} reason - Rejection reason
 * @returns {Promise<Object>}
 */
const sendCourseRejectedEmail = async (instructor, course, reason) => {
  const courseUrl = `${emailConfig.frontendUrl}/instructor/courses/${course._id}/edit`;
  const subject = `Course Review Required: ${course.title}`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #ff9800; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .course-card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .feedback { background: #fff3e0; border-left: 4px solid #ff9800; padding: 15px; margin: 20px 0; }
        .button { display: inline-block; padding: 12px 30px; background: #ff9800; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Course Review Required</h1>
        </div>
        <div class="content">
          <h2>Hi ${instructor.name || 'there'},</h2>
          <p>Thank you for submitting your course for review. Our admin team has reviewed it and would like you to make some improvements before approval.</p>

          <div class="course-card">
            <h3>${course.title}</h3>
            <p><strong>Status:</strong> <span style="color: #ff9800;">⚠️ Needs Revision</span></p>
          </div>

          <div class="feedback">
            <strong>📋 Admin Feedback:</strong>
            <p>${reason || 'Please review and improve the course content.'}</p>
          </div>

          <p>Don't worry! This is a normal part of the quality assurance process. Please review the feedback, make the necessary updates, and resubmit your course.</p>

          <div style="text-align: center;">
            <a href="${courseUrl}" class="button">Edit Course</a>
          </div>

          <p>If you have any questions about the feedback, please don't hesitate to contact our support team.</p>

          <p>We're here to help you create an amazing learning experience! 💪</p>
          <p>The LMS Team</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} LMS Platform. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({ to: instructor.email, subject, html });
};

/**
 * Send email verification email
 *
 * @param {Object} user - User object
 * @param {string} verificationToken - Email verification token
 * @returns {Promise<Object>}
 */
const sendEmailVerification = async (user, verificationToken) => {
  const verificationUrl = `${emailConfig.frontendUrl}/verify-email?token=${verificationToken}`;
  const subject = 'Please Verify Your Email Address 📧';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Verify Your Email</h1>
        </div>
        <div class="content">
          <h2>Hi ${user.name || 'there'},</h2>
          <p>Thank you for signing up with LMS Platform! Please verify your email address to complete your registration.</p>

          <div style="text-align: center;">
            <a href="${verificationUrl}" class="button">Verify Email Address</a>
          </div>

          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${verificationUrl}</p>

          <p>This link will expire in 24 hours.</p>

          <p>If you didn't create an account, you can safely ignore this email.</p>

          <p>Welcome aboard! 🎉</p>
          <p>The LMS Team</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} LMS Platform. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({ to: user.email, subject, html });
};

/**
 * Send assignment submission notification to instructor
 *
 * @param {Object} instructor - Instructor object
 * @param {Object} student - Student object
 * @param {Object} assignment - Assignment object
 * @param {Object} course - Course object
 * @returns {Promise<Object>}
 */
const sendAssignmentSubmittedEmail = async (instructor, student, assignment, course) => {
  const assignmentUrl = `${emailConfig.frontendUrl}/instructor/courses/${course._id}/assignments/${assignment._id}`;
  const subject = `New Assignment Submission: ${assignment.title}`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📝 New Assignment Submission</h1>
        </div>
        <div class="content">
          <h2>Hi ${instructor.name || 'Instructor'},</h2>
          <p>A student has submitted an assignment in your course <strong>${course.title}</strong>.</p>

          <div class="info-box">
            <h3>${assignment.title}</h3>
            <p><strong>Student:</strong> ${student.name || 'N/A'} (${student.email})</p>
            <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Due Date:</strong> ${new Date(assignment.dueDate).toLocaleString()}</p>
          </div>

          <p>Please review and grade this submission when you have time.</p>

          <div style="text-align: center;">
            <a href="${assignmentUrl}" class="button">View Submission</a>
          </div>

          <p>Keep up the great teaching! 🎓</p>
          <p>The LMS Team</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} LMS Platform. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({ to: instructor.email, subject, html });
};

/**
 * Send grade notification to student
 *
 * @param {Object} student - Student object
 * @param {Object} assignment - Assignment object
 * @param {Object} grade - Grade object
 * @param {Object} course - Course object
 * @returns {Promise<Object>}
 */
const sendGradeNotificationEmail = async (student, assignment, grade, course) => {
  const assignmentUrl = `${emailConfig.frontendUrl}/courses/${course._id}/assignments/${assignment._id}`;
  const passed = grade.score >= (assignment.passingScore || assignment.maxScore * 0.7);
  const subject = `Assignment Graded: ${assignment.title}`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: ${passed ? '#4caf50' : '#ff9800'}; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .grade-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
        .score { font-size: 48px; font-weight: bold; color: ${passed ? '#4caf50' : '#ff9800'}; }
        .feedback-box { background: #f0f0f0; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${passed ? '🎉 Assignment Graded!' : '📊 Assignment Graded'}</h1>
        </div>
        <div class="content">
          <h2>Hi ${student.name || 'there'},</h2>
          <p>Your assignment <strong>${assignment.title}</strong> in <strong>${course.title}</strong> has been graded.</p>

          <div class="grade-box">
            <div class="score">${grade.score} / ${grade.maxScore}</div>
            <div style="font-size: 24px; color: #666;">${grade.percentage.toFixed(1)}%</div>
            <div style="margin-top: 10px; font-weight: bold; color: ${passed ? '#4caf50' : '#ff9800'};">
              ${passed ? '✅ PASSED' : '⚠️ NEEDS IMPROVEMENT'}
            </div>
          </div>

          ${grade.feedback ? `
          <div class="feedback-box">
            <h3>Instructor Feedback:</h3>
            <p>${grade.feedback}</p>
          </div>
          ` : ''}

          <div style="text-align: center;">
            <a href="${assignmentUrl}" class="button">View Full Details</a>
          </div>

          <p>${passed ? 'Congratulations on passing!' : 'Keep up the good work!'}</p>
          <p>The LMS Team</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} LMS Platform. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({ to: student.email, subject, html });
};

/**
 * Send course reminder email
 *
 * @param {Object} user - User object
 * @param {Object} course - Course object
 * @param {string} message - Custom reminder message
 * @param {string} type - Reminder type (e.g., Expiry Warning)
 * @returns {Promise<Object>}
 */
const sendCourseReminderEmail = async (user, course, message, type) => {
  const courseUrl = `${emailConfig.frontendUrl}/courses/${course._id}`;
  const subject = `Reminder: ${course.title} - ${type}`;
  
  // Replace simple placeholders in message
  const personalizedMessage = message
    .replace(/{studentName}/g, user.name || 'Student')
    .replace(/{courseTitle}/g, course.title);

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #607d8b; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .message-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #607d8b; }
        .button { display: inline-block; padding: 12px 30px; background: #607d8b; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Course Reminder</h1>
        </div>
        <div class="content">
          <h2>Hi ${user.name || 'there'},</h2>
          
          <div class="message-box">
            <p>${personalizedMessage}</p>
          </div>

          <p><strong>Course:</strong> ${course.title}</p>

          <div style="text-align: center;">
            <a href="${courseUrl}" class="button">Go to Course</a>
          </div>

          <p>The LMS Team</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} LMS Platform. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({ to: user.email, subject, html });
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendEnrollmentConfirmation,
  sendPaymentConfirmation,
  sendCourseApprovedEmail,
  sendCourseRejectedEmail,
  sendEmailVerification,
  sendAssignmentSubmittedEmail,
  sendGradeNotificationEmail,
  sendCourseReminderEmail,
};
