# LMS Project - Next Session Prompt

Copy and paste this prompt to start your next session:

---

## Project Context

I'm working on a **Learning Management System (LMS)** - a full-stack web application with **Next.js frontend** and **Node.js/Express backend**, using **MongoDB** as the database. This is a combined monorepo with both frontend and backend in the same repository.

### Project Location
- **Repository**: C:\Users\nsl\Desktop\LMS
- **Frontend**: `./frontend` (Next.js 15, TypeScript, Tailwind CSS, RTK Query)
- **Backend**: `./backend` (Node.js, Express, MongoDB/Mongoose)
- **Documentation**: `./docs`

### Key Documentation Files
1. **`docs/LMS_SRS.md`** - Complete Software Requirements Specification
2. **`docs/DELIVERY_PLAN.md`** - Detailed go-live roadmap with progress tracking
3. **`docs/PAYMENT_SETUP_GUIDE.md`** - SSLCommerz payment gateway setup guide
4. **`docs/Postman_Collection_Guide.md`** - API testing guide

---

## Current Progress: ~82% Complete

### ✅ Completed Features (Phases 1.1, 1.2, 1.3 & 1.4)

#### Phase 1.1: SSLCommerz Payment Integration ✅
**What was implemented:**
- Complete payment gateway integration for Bangladesh (SSLCommerz)
- Backend: Payment controller, routes, webhooks (success/fail/cancel/IPN)
- Frontend: Checkout flow, success/failed/cancelled pages, payment history
- Full payment verification and refund system (admin only)

**Key Files:**
- Backend: `backend/src/controllers/paymentController.js`, `backend/src/routes/paymentRoutes.js`
- Frontend: `frontend/src/store/api/paymentApi.ts`, `frontend/src/app/payment/*`

#### Phase 1.2: Admin Course Approval Workflow ✅
**What was implemented:**
- Admin panel to review and approve/reject courses
- Backend endpoints: getPendingCourses, approveCourse, rejectCourse, revokeApproval
- Admin notes tracking (audit trail) in Course model
- Frontend admin panel at `/admin/courses/pending`

**Key Files:**
- Backend: `backend/src/controllers/courseController.js` (added 4 functions)
- Backend: `backend/src/models/Course.js` (added adminNotes field)
- Frontend: `frontend/src/store/api/courseApi.ts` (added approval endpoints)
- Frontend: `frontend/src/app/admin/courses/pending/page.tsx`

#### Phase 1.3: Email Notification System ✅
**What was implemented:**
- Nodemailer configuration with Gmail SMTP
- Comprehensive email service with 7 email types
- Email templates (HTML with responsive design)
- Password reset functionality (forgotPassword & resetPassword)
- Integration in courseController, paymentController, authController
- EMAIL_SETUP_GUIDE.md documentation

**Key Files:**
- Backend: `backend/src/config/email.config.js` (email configuration)
- Backend: `backend/src/services/emailService.js` (email service with templates)
- Backend: `backend/src/controllers/courseController.js` (approval/rejection emails)
- Backend: `backend/src/controllers/paymentController.js` (payment/enrollment emails)
- Backend: `backend/src/controllers/authController.js` (welcome, password reset emails)
- Backend: `backend/.env.example` (email configuration variables)
- Documentation: `docs/EMAIL_SETUP_GUIDE.md`

**Email Types:**
1. Welcome Email (signup & OAuth)
2. Password Reset Email
3. Course Approval Email
4. Course Rejection Email
5. Payment Confirmation Email
6. Enrollment Confirmation Email
7. Email Verification Template (ready for future)

#### Phase 1.4: User Management Admin Panel ✅
**What was implemented:**
- Complete user management system for administrators
- Backend controllers for all user operations
- User statistics and analytics
- Frontend admin panel with full CRUD operations
- User activation/deactivation functionality
- Role assignment and management

**Key Files:**
- Backend: `backend/src/controllers/userController.js` (8 functions)
- Backend: `backend/src/routes/userRoutes.js` (updated with controllers)
- Frontend: `frontend/src/store/api/userApi.ts` (added activate/deactivate)
- Frontend: `frontend/src/app/admin/users/page.tsx` (users list)
- Frontend: `frontend/src/app/admin/users/[userId]/page.tsx` (user detail/edit)

**Features:**
1. User list with pagination, search, and filters
2. User statistics dashboard
3. View/edit user details
4. Activate/deactivate users
5. Delete users (soft delete)
6. Role assignment (student, instructor, org_admin, super_admin)
7. Security controls (prevent self-deactivation)

---

## 🔴 What Needs to Be Done Next

### Phase 1: Critical Missing Features (REMAINING)

#### 1.5 Assignment Grading Interface (2 days)
**What needs to be implemented:**
- Student: Assignment submission UI
- Instructor: Assignment grading interface
- Backend: Assignment submission and grading endpoints
- Grade display for students
- Assignment notifications

**Files to create/modify:**
- `frontend/src/components/course/AssignmentSubmission.tsx` (new)
- `frontend/src/components/instructor/AssignmentGrading.tsx` (new)
- `backend/src/controllers/assignmentController.js` (new)
- `backend/src/routes/assignmentRoutes.js` (new)

---

## Tech Stack & Important Decisions

### Backend
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens with refresh token support
- **Payment Gateway**: SSLCommerz (Bangladesh)
- **Email**: Nodemailer + Gmail (decision made)
- **File Storage**: Cloudinary integration
- **Session**: Express sessions with MongoDB store

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **State Management**: Redux Toolkit with RTK Query
- **UI Components**: Radix UI, shadcn/ui
- **Forms**: Formik + Yup
- **Date**: Moment.js
- **Notifications**: Sonner (toast)

### Key Environment Variables Needed
```env
# Backend (.env)
MONGODB_URI=mongodb://localhost:27017/lms_database
JWT_SECRET=your-secret
SSLCOMMERZ_STORE_ID=your-store-id
SSLCOMMERZ_STORE_PASSWORD=your-password
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000

# Email (to be configured)
EMAIL_SERVICE=gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@yourlms.com

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

---

## Project Structure Overview

```
LMS/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Business logic
│   │   ├── models/           # MongoDB schemas
│   │   ├── routes/           # API endpoints
│   │   ├── middleware/       # Auth, error handling
│   │   ├── services/         # Email, external services
│   │   ├── utils/            # Helper functions
│   │   ├── config/           # Configuration files
│   │   └── app.js            # Main app file
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── app/              # Next.js pages (App Router)
│   │   ├── components/       # React components
│   │   ├── store/            # Redux store & RTK Query APIs
│   │   ├── types/            # TypeScript types
│   │   └── lib/              # Utilities
│   ├── package.json
│   └── next.config.js
│
└── docs/
    ├── LMS_SRS.md                    # Requirements
    ├── DELIVERY_PLAN.md              # Progress tracker
    ├── PAYMENT_SETUP_GUIDE.md        # Payment setup
    └── NEXT_SESSION_PROMPT.md        # This file
```

---

## Key Implemented Features (What Works)

### Core Features (70% from before)
- ✅ User authentication (email/password, OAuth with Google/GitHub)
- ✅ Course creation and management (chapters, lessons, content)
- ✅ Course enrollment and progress tracking
- ✅ Quizzes with multiple question types and auto-grading
- ✅ Question bank management
- ✅ Articles/Knowledge base
- ✅ Reporting and analytics dashboards
- ✅ File uploads (Cloudinary)

### Recently Added (Phase 1.1 & 1.2)
- ✅ SSLCommerz payment gateway (initiate, success, fail, verify, refund, history)
- ✅ Payment UI (checkout, success/failed/cancelled pages, history table)
- ✅ Admin course approval workflow (pending list, approve/reject, revoke)
- ✅ Admin panel at `/admin/courses/pending`
- ✅ Course approval audit trail (adminNotes in Course model)

---

## How to Continue

### For Next Session, Start With:

1. **Review the delivery plan**:
   ```
   Read docs/DELIVERY_PLAN.md to see current progress
   ```

2. **Start Phase 1.3 - Email Notifications**:
   ```
   I need to implement Phase 1.3: Email Notification System with Nodemailer + Gmail.

   According to docs/DELIVERY_PLAN.md, this involves:
   - Configuring Nodemailer with Gmail
   - Creating email templates
   - Integrating email notifications in existing controllers
   - Testing email delivery

   Please help me implement this step by step, and update the DELIVERY_PLAN.md as we complete tasks.
   ```

3. **Alternative - Skip to other phases**:
   ```
   I want to implement Phase 1.4 (User Management) instead.
   Please read docs/DELIVERY_PLAN.md and help me implement the admin user management panel.
   ```

---

## Important Notes

### Commit Strategy
- We commit after each phase completion
- Commit messages follow convention:
  ```
  feat: <description> (Phase X.Y)

  [Detailed changes]

  Progress: X% → Y% Complete

  🤖 Generated with [Claude Code](https://claude.com/claude-code)
  Co-Authored-By: Claude <noreply@anthropic.com>
  ```

### Todo List Management
- Use TodoWrite tool to track tasks within a session
- Update DELIVERY_PLAN.md to track overall progress
- Mark items as completed in DELIVERY_PLAN.md with ✅

### Testing Approach
- Phase 1-2: Implementation focus
- Phase 4: Comprehensive testing (unit, integration, e2e, load, accessibility)

### Timeline
- **Aggressive**: 6-8 weeks total
- **Current Phase**: Week 2 (Phase 1 - Critical Features)
- **Remaining in Phase 1**: Items 1.3, 1.4, 1.5 (estimated 7 days)

---

## Quick Commands

### Start Development Servers
```bash
# Backend
cd backend
npm run dev    # Runs on port 5000

# Frontend
cd frontend
npm run dev    # Runs on port 3000
```

### Git Workflow
```bash
git status
git add <files>
git commit -m "message"
git push origin master
```

### View API Documentation
- Swagger UI: http://localhost:5000/api-docs (when backend running)
- Postman Collection: `docs/LMS_API_Postman_Collection.json`

---

## Contact & Questions

If unclear about anything:
1. Check `docs/DELIVERY_PLAN.md` for detailed task breakdown
2. Check `docs/LMS_SRS.md` for requirements
3. Check existing code in similar completed features
4. Ask me to search the codebase for examples

---

**Last Session Ended**: 2025-11-22
**Last Completed**: Phase 1.4 - User Management Admin Panel
**Next Task**: Phase 1.5 - Assignment Grading Interface
**Current Branch**: claude/lms-phase-1-continuation-01K8rkfrC1R56b51t62KK8uL
**Progress**: 82% Complete

---

## Example Prompt to Start Next Session

```
I'm continuing work on my LMS (Learning Management System) project.

Here's the context:
- Full-stack application (Next.js + Node.js/Express + MongoDB)
- Located at: C:\Users\nsl\Desktop\LMS
- Current progress: 82% complete
- Just finished: Phase 1.4 (User Management Admin Panel)
- Next task: Phase 1.5 (Assignment Grading Interface)

Please read the following files to understand the project state:
1. docs/DELIVERY_PLAN.md - for current progress and what needs to be done
2. docs/LMS_SRS.md - for requirements
3. docs/NEXT_SESSION_PROMPT.md - for complete context

Then help me implement Phase 1.5: Assignment Grading Interface.

Let's start by:
1. Reading the delivery plan to see exactly what Phase 1.5 requires
2. Creating assignment submission UI for students
3. Creating assignment grading interface for instructors
4. Implementing grade display for students

Please track our progress using TodoWrite and update DELIVERY_PLAN.md as we complete tasks. When we finish Phase 1.5, help me commit and push the changes following our commit convention.
```

---

**END OF PROMPT TEMPLATE**
