# Email Notification System - Setup Guide

**Phase 1.3 - Email Notification System**
**Status**: ✅ Implemented
**Date**: 2025-11-22

---

## Overview

The LMS now has a comprehensive email notification system using **Nodemailer + Gmail**. This system sends automated emails for various events throughout the platform.

---

## Email Types Implemented

### 1. Welcome Email
- **Trigger**: New user registration (email/password or OAuth)
- **Recipient**: New user
- **Content**: Welcome message, course exploration links

### 2. Password Reset Email
- **Trigger**: User requests password reset
- **Recipient**: User who requested reset
- **Content**: Password reset link (expires in 10 minutes)

### 3. Course Approval Email
- **Trigger**: Admin approves a course
- **Recipient**: Course instructor
- **Content**: Approval confirmation, admin notes (if any)

### 4. Course Rejection Email
- **Trigger**: Admin rejects a course
- **Recipient**: Course instructor
- **Content**: Rejection reason, link to edit course

### 5. Payment Confirmation Email
- **Trigger**: Successful payment for course enrollment
- **Recipient**: Student
- **Content**: Payment details, transaction ID, receipt link

### 6. Enrollment Confirmation Email
- **Trigger**: Successful course enrollment (after payment)
- **Recipient**: Student
- **Content**: Course details, start learning link

### 7. Email Verification (Template Ready)
- **Status**: Template created, integration pending
- **Usage**: For future email verification feature

---

## Configuration Setup

### Step 1: Enable Gmail SMTP

1. **Go to your Google Account**: https://myaccount.google.com/
2. **Enable 2-Factor Authentication**:
   - Go to Security → 2-Step Verification
   - Follow the setup wizard

3. **Generate App Password**:
   - Go to Security → App passwords
   - Select "Mail" and "Other (Custom name)"
   - Name it "LMS Backend"
   - Copy the 16-character password

### Step 2: Configure Backend Environment

Edit `backend/.env` and add the following:

```env
# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USERNAME=your-gmail@gmail.com
EMAIL_PASSWORD=xxxx-xxxx-xxxx-xxxx  # 16-char app password from Step 1
EMAIL_FROM=noreply@yourlms.com
EMAIL_FROM_NAME=LMS Platform

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:3000
```

### Step 3: Verify Configuration

Start the backend server:

```bash
cd backend
npm run dev
```

You should see:
```
✅ Email service is ready to send messages
```

If you see an error:
```
❌ Email transporter verification failed: ...
```

Check your credentials and ensure 2FA + App Password are set up correctly.

---

## Testing Email Functionality

### Test 1: Welcome Email (User Registration)

**Endpoint**: `POST /api/v1/auth/signup`

```bash
curl -X POST http://localhost:5000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "confirmPassword": "password123"
  }'
```

**Expected Result**:
- User created successfully
- Welcome email sent to `test@example.com`
- Check inbox for welcome message

---

### Test 2: Password Reset Email

**Step 1 - Request Reset**:
```bash
curl -X POST http://localhost:5000/api/v1/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'
```

**Expected Result**:
- Success message: "Password reset email sent successfully"
- Email sent with reset link
- Link expires in 10 minutes

**Step 2 - Reset Password**:
```bash
curl -X POST http://localhost:5000/api/v1/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "RESET_TOKEN_FROM_EMAIL",
    "password": "newpassword123"
  }'
```

---

### Test 3: Course Approval Email

**Prerequisites**:
- Be logged in as admin
- Have a pending course to approve

**Endpoint**: `PATCH /api/v1/courses/:courseId/approve`

```bash
curl -X PATCH http://localhost:5000/api/v1/courses/COURSE_ID/approve \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "feedback": "Great course! Approved for publication."
  }'
```

**Expected Result**:
- Course approved
- Instructor receives approval email with feedback

---

### Test 4: Course Rejection Email

**Endpoint**: `PATCH /api/v1/courses/:courseId/reject`

```bash
curl -X PATCH http://localhost:5000/api/v1/courses/COURSE_ID/reject \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "reason": "Please improve the course content and add more examples."
  }'
```

**Expected Result**:
- Course rejected (unpublished)
- Instructor receives rejection email with reason

---

### Test 5: Payment & Enrollment Emails

**Prerequisites**:
- Have SSLCommerz configured (see `docs/PAYMENT_SETUP_GUIDE.md`)
- Complete a payment through the checkout flow

**Flow**:
1. Student initiates payment for a course
2. Payment succeeds via SSLCommerz
3. System creates enrollment
4. **Two emails sent**:
   - Payment confirmation email
   - Enrollment confirmation email

**Manual Test via Frontend**:
```
1. Go to http://localhost:3000
2. Browse courses
3. Click "Enroll Now" on a paid course
4. Complete payment (use SSLCommerz sandbox)
5. Check email inbox for both confirmations
```

---

## Email Templates

All email templates are in **HTML format** with responsive design and include:

- **Header**: Colorful gradient header with icon
- **Body**: Clean, readable content with CTA buttons
- **Footer**: Copyright notice and legal info
- **Styling**: Inline CSS for maximum email client compatibility

### Template Locations

All templates are defined in:
```
backend/src/services/emailService.js
```

Functions:
- `sendWelcomeEmail(user)`
- `sendPasswordResetEmail(user, resetToken)`
- `sendEnrollmentConfirmation(user, course)`
- `sendPaymentConfirmation(user, payment, course)`
- `sendCourseApprovedEmail(instructor, course, adminNotes)`
- `sendCourseRejectedEmail(instructor, course, reason)`
- `sendEmailVerification(user, verificationToken)` *(template only)*

---

## Error Handling

### Email Failures Don't Break Requests

All email sending is wrapped in try-catch blocks. If an email fails:
- Error is logged to console
- Request continues successfully
- User receives normal response

**Example**:
```
❌ Failed to send email: Welcome to LMS Platform! to test@example.com
Error: Invalid credentials
```

This ensures the system remains functional even if email service is down.

---

## Troubleshooting

### Issue 1: "Email service not configured"

**Error**:
```
⚠️  Email not sent (service not configured): ...
```

**Solution**:
- Check `.env` file has all email variables
- Ensure `EMAIL_USERNAME` and `EMAIL_PASSWORD` are set
- Restart the backend server

---

### Issue 2: "Invalid credentials"

**Error**:
```
❌ Email transporter verification failed: Invalid login
```

**Solution**:
- Verify Gmail address is correct
- Regenerate App Password (16 characters, no spaces)
- Ensure 2FA is enabled on Google Account
- Try using the App Password immediately (it may take a minute to activate)

---

### Issue 3: "Connection timeout"

**Error**:
```
❌ Email transporter verification failed: Connection timeout
```

**Solution**:
- Check internet connection
- Verify firewall isn't blocking port 587
- Try changing `EMAIL_PORT` to 465 and `EMAIL_SECURE=true`

---

### Issue 4: Emails go to spam

**Solution**:
- This is common with Gmail SMTP for personal use
- Check spam/junk folder
- For production, use dedicated email services (SendGrid, AWS SES, Mailgun)
- Add SPF/DKIM records to your domain

---

## Alternative Email Services

### Using SendGrid (Recommended for Production)

```env
EMAIL_SERVICE=sendgrid
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USERNAME=apikey
EMAIL_PASSWORD=YOUR_SENDGRID_API_KEY
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=LMS Platform
```

### Using AWS SES

```env
EMAIL_SERVICE=ses
EMAIL_HOST=email-smtp.us-east-1.amazonaws.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USERNAME=YOUR_SMTP_USERNAME
EMAIL_PASSWORD=YOUR_SMTP_PASSWORD
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=LMS Platform
```

### Using Outlook/Hotmail

```env
EMAIL_SERVICE=outlook
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USERNAME=your-email@outlook.com
EMAIL_PASSWORD=your-password
EMAIL_FROM=your-email@outlook.com
EMAIL_FROM_NAME=LMS Platform
```

---

## Production Considerations

### 1. Use Dedicated Email Service
- Gmail has sending limits (~500 emails/day)
- Use SendGrid, AWS SES, or Mailgun for production
- These services offer better deliverability and analytics

### 2. Implement Email Queuing
- For high volume, use a queue (Bull, BullMQ, Redis)
- Prevents email sending from blocking requests
- Allows retry logic for failed emails

### 3. Add Email Preferences
- Let users opt-out of marketing emails
- Always send transactional emails (password reset, receipts)
- Store preferences in User model

### 4. Monitor Email Deliverability
- Track bounce rates
- Monitor spam complaints
- Use email analytics to improve open rates

### 5. Comply with Regulations
- Add unsubscribe links to marketing emails
- Include physical address in footer (required in many countries)
- Follow CAN-SPAM Act, GDPR guidelines

---

## Files Created/Modified

### New Files
1. `backend/src/config/email.config.js` - Email configuration
2. `backend/src/services/emailService.js` - Email sending service with templates
3. `docs/EMAIL_SETUP_GUIDE.md` - This guide

### Modified Files
1. `backend/.env.example` - Added email configuration variables
2. `backend/src/controllers/courseController.js` - Added email notifications for approve/reject
3. `backend/src/controllers/paymentController.js` - Added email notifications for payment success
4. `backend/src/controllers/authController.js` - Added email notifications for signup, password reset

---

## Next Steps

### Phase 1.4: User Management Admin Panel
- Admin interface to manage users
- User activation/deactivation
- Role management

### Phase 1.5: Assignment Grading Interface
- Student assignment submission
- Instructor grading interface

### Future Email Enhancements
- Email verification flow (template ready)
- Assignment submission notifications
- Course update notifications
- Discussion forum notifications

---

## Support

If you encounter issues:
1. Check backend console logs for detailed error messages
2. Verify all environment variables are set correctly
3. Test with a simple curl request first
4. Check email spam folder

For production deployment, consider using a dedicated email service for better deliverability and support.

---

**Document Version**: 1.0
**Last Updated**: 2025-11-22
**Phase**: 1.3 - Email Notification System ✅
