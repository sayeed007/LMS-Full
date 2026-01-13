const emailService = require('../services/emailService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

/**
 * @desc    Send contact form email
 * @route   POST /api/v1/contact
 * @access  Public
 */
exports.sendContactEmail = catchAsync(async (req, res, next) => {
  const { firstName, lastName, email, message } = req.body;

  if (!email || !message) {
    return next(new AppError('Please provide email and message', 400));
  }

  const name = `${firstName || ''} ${lastName || ''}`.trim() || 'Visitor';
  const subject = `New Contact Form Submission from ${name}`;
  
  // Email to Admin/Support (using from address or configured support email)
  // Since we don't have a dedicated support email env var, we'll send it to the configured sender or a fallback
  const supportEmail = process.env.EMAIL_FROM || process.env.EMAIL_USERNAME;

  if (!supportEmail) {
      return next(new AppError('Email service not fully configured', 500));
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #3b82f6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; }
        .field { margin-bottom: 20px; }
        .label { font-weight: bold; color: #4b5563; font-size: 0.875rem; text-transform: uppercase; margin-bottom: 5px; }
        .value { background: white; padding: 12px; border-radius: 6px; border: 1px solid #d1d5db; }
        .footer { text-align: center; margin-top: 30px; color: #9ca3af; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>New Contact Message</h1>
        </div>
        <div class="content">
          <div class="field">
            <div class="label">Name</div>
            <div class="value">${name}</div>
          </div>
          
          <div class="field">
            <div class="label">Email</div>
            <div class="value"><a href="mailto:${email}">${email}</a></div>
          </div>
          
          <div class="field">
            <div class="label">Message</div>
            <div class="value" style="white-space: pre-wrap;">${message}</div>
          </div>
        </div>
        <div class="footer">
          <p>Sent from LMS Platform Contact Form</p>
        </div>
      </div>
    </body>
    </html>
  `;

  // Send email to support
  await emailService.sendEmail({
    to: supportEmail,
    subject,
    html,
  });

  // Optional: Send auto-reply to user
  const autoReplyHtml = `
    <!DOCTYPE html>
    <html>
    <body>
      <p>Hi ${name},</p>
      <p>Thanks for contacting us! We have received your message and will get back to you shortly.</p>
      <br>
      <p>Best regards,</p>
      <p>LMS Team</p>
    </body>
    </html>
  `;

  try {
      await emailService.sendEmail({
        to: email,
        subject: 'We received your message - LMS Platform',
        html: autoReplyHtml
      });
  } catch (err) {
      // Ignore error for auto-reply as the main goal was to notify support
      console.error('Failed to send auto-reply', err);
  }

  res.status(200).json({
    status: 'success',
    message: 'Message sent successfully',
  });
});
