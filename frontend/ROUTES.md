# Frontend Routes Documentation

This document provides a comprehensive overview of all routes in the LMS frontend application, including their purpose, components, and current status.

## Table of Contents

- [Public Routes](#public-routes)
- [Course Routes](#course-routes)
- [Course Creation Routes](#course-creation-routes)
- [Admin Routes](#admin-routes)
- [Article Routes](#article-routes)
- [Question Bank Routes](#question-bank-routes)
- [Report Routes](#report-routes)
- [User Routes](#user-routes)
- [Payment Routes](#payment-routes)
- [API Routes](#api-routes)
- [Architecture Notes](#architecture-notes)

---

## Public Routes

### `/` - Homepage

- **File:** `src/app/page.tsx`
- **Status:** ✅ Tested
- **Purpose:** Landing page with course catalog and search
- **Components:** Course listings, search functionality, filters

### `/dashboard` - User Dashboard

- **File:** `src/app/dashboard/page.tsx`
- **Status:** ✅ Tested
- **Purpose:** Personalized dashboard showing enrolled courses, progress, and recommendations
- **Auth:** Required

---

## Course Routes

### `/courses` - Course Catalog

- **File:** `src/app/courses/page.tsx`
- **Status:** ✅ Tested
- **Purpose:** Browse all available courses with filtering and search
- **Components:**
  - `CourseFiltersModal` - Advanced filtering
  - `SearchSuggestions` - Search autocomplete

### `/courses/[course_id]` - Course Detail Page

- **File:** `src/app/courses/[course_id]/page.tsx`
- **Status:** ✅ Tested
- **Purpose:** View course details, chapters, lessons, and enroll
- **Components:**
  - `CourseDetailClient` - Main course detail view
  - **Shared Components:**
    - `CourseHeader` - Title, rating, instructor, stats
    - `CourseStatsCard` - Functional stats (completion %, time left, incomplete lessons)
    - `CourseOutline` - Chapter/lesson tree with expand/collapse
- **Architecture:**
  - Uses chapter-based structure
  - Chapters have virtual `lessons` field populated from `Lesson.chapter`
  - Stats card calculates real-time progress from enrollment data

### `/courses/[course_id]/learn` - Course Learning Interface

- **File:** `src/app/courses/[course_id]/learn/page.tsx`
- **Status:** ⚠️ Needs Testing
- **Purpose:** Main learning interface with lesson navigation
- **Components:** `CourseLearningClient`

### `/courses/[course_id]/lessons/[lessonId]` - Lesson Player

- **File:** `src/app/courses/[course_id]/lessons/[lessonId]/page.tsx`
- **Status:** ✅ Tested
- **Purpose:** View and complete individual lessons
- **Components:**
  - `LessonPlayerHeader` - Navigation and completion
  - `LessonContent` - Lesson content renderer
  - `LessonDetailsCard` - Lesson metadata
  - `LessonNavigation` - Previous/Next navigation
  - `CourseProgressCard` - Progress tracking
  - `LessonListSidebar` - All lessons list
- **Features:**
  - Time tracking
  - Progress updates
  - Sequential navigation
  - Completion marking

### `/courses/[course_id]/chapters/[chapterId]/lessons/[lessonId]` - Chapter-based Lesson

- **Status:** 🔄 Architecture Change
- **Purpose:** Access lessons through chapter hierarchy
- **Note:** Current implementation uses flat lesson structure. Chapter navigation handled in CourseOutline component.

### `/courses/[course_id]/quizzes/[quizId]` - Quiz Player

- **File:** `src/app/courses/[course_id]/quizzes/[quizId]/page.tsx`
- **Status:** ⚠️ Needs Testing
- **Purpose:** Take course quizzes

---

## Course Creation Routes

All course creation routes are under `/courses/create/[course_id]` with a shared layout.

### `/courses/create/[course_id]` - Course Editor Dashboard

- **File:** `src/app/courses/create/[course_id]/page.tsx`
- **Layout:** `src/app/courses/create/[course_id]/layout.tsx`
- **Status:** ⚠️ Needs Testing
- **Purpose:** Main course creation/editing interface

### `/courses/create/[course_id]/courseOutline` - Course Outline Editor

- **File:** `src/app/courses/create/[course_id]/courseOutline/page.tsx`
- **Status:** ⚠️ Needs Testing
- **Purpose:** Manage chapters and lessons structure
- **Features:**
  - Chapter creation/editing
  - Lesson ordering
  - Drag-and-drop reordering

### `/courses/create/[course_id]/courseOutline/[lesson_id]/content` - Lesson Content Editor

- **File:** `src/app/courses/create/[course_id]/courseOutline/[lesson_id]/content/page.tsx`
- **Status:** ⚠️ Needs Testing
- **Purpose:** Edit lesson content (text, video, blocks, quiz, assignment)
- **Content Types:**
  - Text
  - Block (mixed media)
  - Video
  - Audio
  - Document
  - Quiz
  - Assignment

### `/courses/create/[course_id]/learner` - Learner Settings

- **File:** `src/app/courses/create/[course_id]/learner/page.tsx`
- **Status:** ⚠️ Needs Testing
- **Purpose:** Configure learner-facing settings

### `/courses/create/[course_id]/preview` - Course Preview

- **File:** `src/app/courses/create/[course_id]/preview/page.tsx`
- **Status:** ✅ Tested
- **Purpose:** Preview course as students will see it
- **Components:**
  - `CoursePreviewClient` - Uses shared components
  - Shows preview banner
  - Disabled enrollment actions

### `/courses/create/[course_id]/setting` - Course Settings

- **File:** `src/app/courses/create/[course_id]/setting/page.tsx`
- **Status:** ⚠️ Needs Testing
- **Purpose:** Configure course settings (pricing, access, certificates)

---

## Admin Routes

### `/admin` - Admin Dashboard

- **File:** `src/app/admin/page.tsx`
- **Status:** ⚠️ Needs Testing
- **Auth:** Admin only
- **Purpose:** Admin overview and quick actions

### `/admin/users` - User Management

- **File:** `src/app/admin/users/page.tsx`
- **Status:** ✅ Tested
- **Purpose:** Manage all users
- **Features:** User list, roles, status management

### `/admin/users/[userId]` - User Details

- **File:** `src/app/admin/users/[userId]/page.tsx`
- **Status:** ✅ Tested
- **Purpose:** View/edit individual user details

### `/admin/organizations` - Organization Management

- **File:** `src/app/admin/organizations/page.tsx`
- **Status:** ✅ Tested
- **Purpose:** Manage organizations

### `/admin/organizations/[orgId]` - Organization Details

- **File:** `src/app/admin/organizations/[orgId]/page.tsx`
- **Status:** ✅ Tested
- **Purpose:** View/edit organization details

### `/admin/settings` - System Settings

- **File:** `src/app/admin/settings/page.tsx`
- **Status:** ⚠️ Needs Testing
- **Purpose:** Configure system-wide settings

---

## Article Routes

### `/articles` - Article Listing

- **File:** `src/app/articles/page.tsx`
- **Status:** ✅ Tested
- **Purpose:** Browse all articles/blog posts

### `/articles/[article_id]` - Article View

- **File:** `src/app/articles/[article_id]/page.tsx`
- **Status:** ✅ Tested
- **Purpose:** Read individual article

### `/articles/[article_id]/analytics` - Article Analytics

- **File:** `src/app/articles/[article_id]/analytics/page.tsx`
- **Status:** ⚠️ Needs Testing
- **Purpose:** View article performance metrics
- **Auth:** Author/Admin only

### `/articles/create` - Create Article

- **File:** `src/app/articles/create/page.tsx`
- **Status:** ✅ Tested
- **Purpose:** Create new article
- **Auth:** Required

### `/articles/edit/[id]` - Edit Article

- **File:** `src/app/articles/edit/[id]/page.tsx`
- **Status:** ⚠️ Needs Testing
- **Purpose:** Edit existing article
- **Auth:** Author/Admin only

### `/articles/preview/[article_name]` - Article Preview

- **File:** `src/app/articles/preview/[article_name]/page.tsx`
- **Status:** ✅ Tested
- **Purpose:** Preview article before publishing

---

## Question Bank Routes

### `/question-bank` - Question Bank List

- **File:** `src/app/question-bank/page.tsx`
- **Status:** ⚠️ Needs Testing
- **Purpose:** Manage question banks

### `/question-bank/[id]` - Question Bank Details

- **File:** `src/app/question-bank/[id]/page.tsx`
- **Status:** ⚠️ Needs Testing
- **Purpose:** View/edit question bank

### `/question-bank/[id]/preview` - Question Bank Preview

- **File:** `src/app/question-bank/[id]/preview/page.tsx`
- **Status:** ⚠️ Needs Testing
- **Purpose:** Preview question bank

### `/question-bank/[id]/sections/[sectionId]/questions` - Section Questions

- **File:** `src/app/question-bank/[id]/sections/[sectionId]/questions/page.tsx`
- **Status:** ⚠️ Needs Testing
- **Purpose:** Manage questions in a section

### `/question-bank/courses/[courseId]` - Course Question Bank

- **File:** `src/app/question-bank/courses/[courseId]/page.tsx`
- **Status:** ⚠️ Needs Testing
- **Purpose:** Question bank for specific course

### `/question-bank/courses/[courseId]/preview` - Course QB Preview

- **File:** `src/app/question-bank/courses/[courseId]/preview/page.tsx`
- **Status:** ⚠️ Needs Testing

### `/question-bank/courses/[courseId]/sections/[sectionId]/questions` - Course Section Questions

- **File:** `src/app/question-bank/courses/[courseId]/sections/[sectionId]/questions/page.tsx`
- **Status:** ⚠️ Needs Testing

---

## Report Routes

### `/reports` - Reports Dashboard

- **File:** `src/app/reports/page.tsx`
- **Status:** ⚠️ Needs Testing
- **Purpose:** Overview of all available reports

### `/reports/my-report` - My Reports

- **File:** `src/app/reports/my-report/page.tsx`
- **Status:** ⚠️ Needs Testing
- **Purpose:** Personal performance reports

### `/reports/articles` - Article Reports

- **File:** `src/app/reports/articles/page.tsx`
- **Status:** ⚠️ Needs Testing
- **Purpose:** Article performance analytics

### `/reports/individual-course` - Individual Course Report

- **File:** `src/app/reports/individual-course/page.tsx`
- **Status:** ⚠️ Needs Testing
- **Purpose:** Detailed course analytics

### `/reports/multiple-course` - Multiple Course Report

- **File:** `src/app/reports/multiple-course/page.tsx`
- **Status:** ⚠️ Needs Testing
- **Purpose:** Compare multiple courses

### `/reports/individual-learner` - Individual Learner Report

- **File:** `src/app/reports/individual-learner/page.tsx`
- **Status:** ⚠️ Needs Testing
- **Purpose:** Student performance overview

### `/reports/individual-learner/[id]` - Learner Details

- **File:** `src/app/reports/individual-learner/[id]/page.tsx`
- **Status:** ⚠️ Needs Testing
- **Purpose:** Detailed learner analytics

### `/reports/individual-learner/[id]/course/[courseId]` - Learner Course Report

- **File:** `src/app/reports/individual-learner/[id]/course/[courseId]/page.tsx`
- **Status:** ⚠️ Needs Testing
- **Purpose:** Learner's performance in specific course

### `/reports/multiple-learner` - Multiple Learner Report

- **File:** `src/app/reports/multiple-learner/page.tsx`
- **Status:** ⚠️ Needs Testing
- **Purpose:** Compare multiple learners

---

## User Routes

### `/profile` - User Profile

- **File:** `src/app/profile/page.tsx`
- **Status:** ⚠️ Needs Testing
- **Auth:** Required
- **Purpose:** View/edit user profile

### `/messages` - Messages

- **File:** `src/app/messages/page.tsx`
- **Status:** ⚠️ Needs Testing
- **Auth:** Required
- **Purpose:** User messaging system

---

## Payment Routes

### `/payment/checkout` - Checkout

- **File:** `src/app/payment/checkout/page.tsx`
- **Status:** ⚠️ Needs Testing
- **Purpose:** Course purchase checkout

### `/payment/success` - Payment Success

- **File:** `src/app/payment/success/page.tsx`
- **Status:** ⚠️ Needs Testing
- **Purpose:** Payment confirmation page

### `/payment/failed` - Payment Failed

- **File:** `src/app/payment/failed/page.tsx`
- **Status:** ⚠️ Needs Testing
- **Purpose:** Payment failure page

### `/payment/cancelled` - Payment Cancelled

- **File:** `src/app/payment/cancelled/page.tsx`
- **Status:** ⚠️ Needs Testing
- **Purpose:** Payment cancellation page

### `/payment/history` - Payment History

- **File:** `src/app/payment/history/page.tsx`
- **Status:** ⚠️ Needs Testing
- **Auth:** Required
- **Purpose:** View payment transaction history

---

## Certificate Routes

### `/certificates` - My Certificates

- **File:** `src/app/certificates/page.tsx`
- **Status:** ⚠️ Needs Testing
- **Auth:** Required
- **Purpose:** View earned certificates

### `/certificates/verify/[certificateId]` - Verify Certificate

- **File:** `src/app/certificates/verify/[certificateId]/page.tsx`
- **Status:** ⚠️ Needs Testing
- **Purpose:** Public certificate verification

---

## API Routes

### `/api/auth/[...nextauth]` - NextAuth API

- **File:** `src/app/api/auth/[...nextauth]/route.ts`
- **Purpose:** NextAuth authentication endpoints
- **Endpoints:**
  - `/api/auth/signin`
  - `/api/auth/signout`
  - `/api/auth/callback`
  - `/api/auth/session`

---

## Development/Testing Routes

### `/design-system-demo` - Design System Demo

- **File:** `src/app/design-system-demo/page.tsx`
- **Status:** ⚠️ Dev Only
- **Purpose:** Showcase UI components and design system

### `/test-redux` - Redux Testing

- **File:** `src/app/test-redux/page.tsx`
- **Status:** ⚠️ Dev Only
- **Purpose:** Test Redux state management

---

## Architecture Notes

### Chapter-Based Course Structure

The application uses a **chapter-based course architecture**:

```
Course
  └─ Chapters (virtual field)
      └─ Lessons (virtual field populated from Lesson.chapter)
          └─ Content
```

**Key Models:**

- `Course` - Main course entity
- `Chapter` - Course sections with `course` reference
  - Has virtual `lessons` field
  - Populated from `Lesson.chapter`
- `Lesson` - Individual lessons with `chapter` reference
  - Has `chapter` field (ObjectId)
  - Has `course` field for backward compatibility

### Shared Components

**Location:** `src/components/courses/shared/`

1. **CourseHeader** - Reusable course header
   - Props: `course`, `chapters`, `totalLessons`, `actionButtons`
   - Used in: CourseDetailClient, CoursePreviewClient

2. **CourseStatsCard** - Functional stats card
   - Props: `course`, `totalLessons`, `enrollment`, `mode`
   - Modes: `preview`, `detail`, `learning`
   - **Functional Stats:**
     - Completion % (calculated from enrollment)
     - Time Left (calculated from expiry date)
     - Incomplete Lessons (totalLessons - completed)

3. **CourseOutline** - Chapter/lesson tree
   - Props: `chapters`, `lessons`, `courseId`, `mode`
   - Features: Expand/collapse, lesson navigation

### Type System

**Location:** `src/types/backend-models.ts`

All components use proper TypeScript types:

- `CourseChapter` - Chapter interface with virtual lessons
- `CourseLesson` - Lesson interface with chapter reference
- `CoursePopulated` - Populated course data
- `Enrollment` - User enrollment with progress tracking

### API Integration

**RTK Query Hooks:**

- `useGetCourseByIdQuery` - Fetch course details
- `useGetChaptersQuery` - Fetch chapters with lessons
- `useGetLessonsQuery` - Fetch all lessons
- `useGetLessonByIdQuery` - Fetch single lesson
- `useUpdateProgressMutation` - Update lesson progress

---

## Status Legend

- ✅ **Tested** - Route has been tested and verified working
- ⚠️ **Needs Testing** - Route exists but needs verification
- 🔄 **Architecture Change** - Route affected by recent architecture changes
- ❌ **Not Implemented** - Route planned but not yet implemented

---

## Recent Architecture Changes

1. **Chapter-Based Structure** (2026-01-12)
   - Added `chapter` field to Lesson model
   - Chapters now have virtual `lessons` field
   - Updated CourseDetailClient and CoursePreviewClient

2. **Component Refactoring** (2026-01-12)
   - Created shared components (CourseHeader, CourseStatsCard, CourseOutline)
   - Eliminated ~650 lines of duplicate code
   - Made stats card functional (was hardcoded)

3. **Type System Improvements** (2026-01-12)
   - Replaced all `any` types with proper TypeScript types
   - Updated backend-models.ts to match new schema
   - Added proper interfaces for enrollment and progress

---

**Last Updated:** 2026-01-12
**Version:** 2.0
