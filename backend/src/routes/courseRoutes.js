const express = require('express');
const courseController = require('../controllers/courseController');
const { protect, restrictTo, optionalAuth } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Course:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         category:
 *           type: string
 *         level:
 *           type: string
 *           enum: [beginner, intermediate, advanced]
 *         price:
 *           type: number
 *         instructor:
 *           $ref: '#/components/schemas/User'
 *         isPublished:
 *           type: boolean
 *         isFeatured:
 *           type: boolean
 *         thumbnail:
 *           type: string
 *         duration:
 *           type: number
 *         chapters:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Chapter'
 *         createdAt:
 *           type: string
 *           format: date-time
 *     Chapter:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         lessons:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Lesson'
 *     Lesson:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         content:
 *           type: string
 *         duration:
 *           type: number
 *         type:
 *           type: string
 *           enum: [video, text, quiz]
 */

/**
 * @swagger
 * /api/v1/courses/categories:
 *   get:
 *     summary: Get all course categories
 *     tags: [Courses]
 *     responses:
 *       200:
 *         description: List of course categories
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     categories:
 *                       type: array
 *                       items:
 *                         type: string
 */
router.get('/categories', courseController.getCategories);

/**
 * @swagger
 * /api/v1/courses/popular:
 *   get:
 *     summary: Get popular courses
 *     tags: [Courses]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of courses to return
 *     responses:
 *       200:
 *         description: List of popular courses
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 results:
 *                   type: integer
 *                 data:
 *                   type: object
 *                   properties:
 *                     courses:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Course'
 */
router.get('/popular', courseController.getPopularCourses);

/**
 * @swagger
 * /api/v1/courses/featured:
 *   get:
 *     summary: Get featured courses
 *     tags: [Courses]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of courses to return
 *     responses:
 *       200:
 *         description: List of featured courses
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 results:
 *                   type: integer
 *                 data:
 *                   type: object
 *                   properties:
 *                     courses:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Course'
 */
router.get('/featured', courseController.getFeaturedCourses);

/**
 * @swagger
 * /api/v1/courses/my-courses:
 *   get:
 *     summary: Get current user's courses
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's courses (created or enrolled)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 results:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Course'
 */
router.get('/my-courses', protect, courseController.getMyCourses);

/**
 * @swagger
 * /api/v1/courses/enrolled:
 *   get:
 *     summary: Get current user's enrolled courses
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's enrolled courses
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 results:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Course'
 */
router.get('/enrolled', protect, courseController.getEnrolledCourses);

/**
 * @swagger
 * /api/v1/courses:
 *   get:
 *     summary: Get all courses with filtering
 *     tags: [Courses]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: level
 *         schema:
 *           type: string
 *           enum: [beginner, intermediate, advanced]
 *     responses:
 *       200:
 *         description: Paginated list of courses
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 results:
 *                   type: integer
 *                 pagination:
 *                   type: object
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Course'
 */
router.get('/', optionalAuth, courseController.getAllCourses);

/**
 * @swagger
 * /api/v1/courses/{id}:
 *   get:
 *     summary: Get course by ID
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Course details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     course:
 *                       $ref: '#/components/schemas/Course'
 *       404:
 *         description: Course not found
 */
router.get('/:id', optionalAuth, courseController.getCourse);

// Protected routes
router.use(protect);

/**
 * @swagger
 * /api/v1/courses:
 *   post:
 *     summary: Create a new course
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - category
 *               - level
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               level:
 *                 type: string
 *                 enum: [beginner, intermediate, advanced]
 *               price:
 *                 type: number
 *               thumbnail:
 *                 type: string
 *               chapters:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Chapter'
 *     responses:
 *       201:
 *         description: Course created successfully
 *       403:
 *         description: Insufficient permissions
 */
router.post('/', restrictTo('instructor', 'org_admin', 'super_admin'), courseController.createCourse);


/**
 * @swagger
 * /api/v1/courses/enroll:
 *   post:
 *     summary: Enroll in a course
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - courseId
 *             properties:
 *               courseId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully enrolled in course
 *       404:
 *         description: Course not found
 */
router.post('/enroll', courseController.enrollCourse);

/**
 * @swagger
 * /api/v1/courses/progress:
 *   patch:
 *     summary: Update course progress
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - courseId
 *               - lessonId
 *             properties:
 *               courseId:
 *                 type: string
 *               lessonId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Progress updated successfully
 *       404:
 *         description: Course not found
 */
router.patch('/progress', courseController.updateProgress);

/**
 * @swagger
 * /api/v1/courses/{id}/publish:
 *   patch:
 *     summary: Publish a course
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Course published successfully
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Course not found
 */
router.patch('/:id/publish', restrictTo('instructor', 'org_admin', 'super_admin'), courseController.publishCourse);

/**
 * @swagger
 * /api/v1/courses/{id}/stats:
 *   get:
 *     summary: Get course statistics
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Course statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Course not found
 */
router.get('/:id/stats', restrictTo('instructor', 'org_admin', 'super_admin'), courseController.getCourseStats);

/**
 * @swagger
 * /api/v1/courses/{id}/progress:
 *   get:
 *     summary: Get user's progress in a course
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User's course progress
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     progress:
 *                       type: object
 *       403:
 *         description: Not enrolled in course
 *       404:
 *         description: Course not found
 */
router.get('/:id/progress', courseController.getCourseProgress);

router
  .route('/:id')
  /**
   * @swagger
   * /api/v1/courses/{id}:
   *   patch:
   *     summary: Update a course
   *     tags: [Courses]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               title:
   *                 type: string
   *               description:
   *                 type: string
   *               category:
   *                 type: string
   *               level:
   *                 type: string
   *               price:
   *                 type: number
   *               thumbnail:
   *                 type: string
   *     responses:
   *       200:
   *         description: Course updated successfully
   *       403:
   *         description: Insufficient permissions
   *       404:
   *         description: Course not found
   */
  .patch(restrictTo('instructor', 'org_admin', 'super_admin'), courseController.updateCourse)
  /**
   * @swagger
   * /api/v1/courses/{id}:
   *   delete:
   *     summary: Delete a course (soft delete)
   *     tags: [Courses]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       204:
   *         description: Course deleted successfully
   *       403:
   *         description: Insufficient permissions
   *       404:
   *         description: Course not found
   */
  .delete(restrictTo('instructor', 'org_admin', 'super_admin'), courseController.deleteCourse);

// Import enrollment controller functions
const {
  getCourseEnrollments,
  getProgress
} = require('../controllers/enrollmentController');

// Import lesson controller functions
const {
  getLessons,
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson,
  reorderLessons,
  completeLesson,
  getLessonStats,
  addResource,
  removeResource
} = require('../controllers/lessonController');

// Import chapter controller functions
const {
  getChapters,
  getChapterById,
  createChapter,
  updateChapter,
  deleteChapter,
  reorderChapters
} = require('../controllers/chapterController');

/**
 * @swagger
 * /api/v1/courses/{id}/enrollments:
 *   get:
 *     summary: Get enrollments for a specific course
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, completed, dropped, suspended]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Course enrollments
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Course not found
 */
router.get('/:id/enrollments', restrictTo('instructor', 'org_admin', 'super_admin'), (req, res, next) => {
  req.params.courseId = req.params.id;
  getCourseEnrollments(req, res, next);
});

// Lesson Routes

/**
 * @swagger
 * /api/v1/courses/{id}/lessons:
 *   get:
 *     summary: Get all lessons for a course
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of course lessons
 *       403:
 *         description: No access to course
 *       404:
 *         description: Course not found
 *   post:
 *     summary: Create a new lesson for the course
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *               - type
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               content:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [text, video, quiz, assignment, live, download]
 *               order:
 *                 type: number
 *               duration:
 *                 type: number
 *               isPreview:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Lesson created successfully
 *       403:
 *         description: Insufficient permissions
 */
router.route('/:id/lessons')
  .get((req, res, next) => {
    req.params.courseId = req.params.id;
    getLessons(req, res, next);
  })
  .post(restrictTo('instructor', 'org_admin', 'super_admin'), (req, res, next) => {
    req.params.courseId = req.params.id;
    createLesson(req, res, next);
  });

/**
 * @swagger
 * /api/v1/courses/{id}/lessons/reorder:
 *   patch:
 *     summary: Reorder lessons in a course
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - lessons
 *             properties:
 *               lessons:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     order:
 *                       type: number
 *     responses:
 *       200:
 *         description: Lessons reordered successfully
 *       403:
 *         description: Insufficient permissions
 */
router.patch('/:id/lessons/reorder', restrictTo('instructor', 'org_admin', 'super_admin'), (req, res, next) => {
  req.params.courseId = req.params.id;
  reorderLessons(req, res, next);
});

/**
 * @swagger
 * /api/v1/courses/{id}/lessons/{lessonId}:
 *   get:
 *     summary: Get lesson by ID
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lesson details
 *       403:
 *         description: No access to lesson
 *       404:
 *         description: Lesson not found
 *   patch:
 *     summary: Update lesson
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               content:
 *                 type: string
 *               duration:
 *                 type: number
 *               isPreview:
 *                 type: boolean
 *               isPublished:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Lesson updated successfully
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Lesson not found
 *   delete:
 *     summary: Delete lesson
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Lesson deleted successfully
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Lesson not found
 */
router.route('/:id/lessons/:lessonId')
  .get((req, res, next) => {
    req.params.courseId = req.params.id;
    getLessonById(req, res, next);
  })
  .patch(restrictTo('instructor', 'org_admin', 'super_admin'), (req, res, next) => {
    req.params.courseId = req.params.id;
    updateLesson(req, res, next);
  })
  .delete(restrictTo('instructor', 'org_admin', 'super_admin'), (req, res, next) => {
    req.params.courseId = req.params.id;
    deleteLesson(req, res, next);
  });

/**
 * @swagger
 * /api/v1/courses/{id}/lessons/{lessonId}/complete:
 *   post:
 *     summary: Mark lesson as complete (Student only)
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               timeSpent:
 *                 type: number
 *                 description: Time spent on lesson in seconds
 *     responses:
 *       200:
 *         description: Lesson completed successfully
 *       403:
 *         description: Not enrolled in course
 *       404:
 *         description: Lesson not found
 */
router.post('/:id/lessons/:lessonId/complete', restrictTo('student'), (req, res, next) => {
  req.params.courseId = req.params.id;
  completeLesson(req, res, next);
});

/**
 * @swagger
 * /api/v1/courses/{id}/lessons/{lessonId}/stats:
 *   get:
 *     summary: Get lesson statistics (Instructor/Admin only)
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lesson statistics
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Lesson not found
 */
router.get('/:id/lessons/:lessonId/stats', restrictTo('instructor', 'org_admin', 'super_admin'), (req, res, next) => {
  req.params.courseId = req.params.id;
  getLessonStats(req, res, next);
});

/**
 * @swagger
 * /api/v1/courses/{id}/lessons/{lessonId}/resources:
 *   post:
 *     summary: Add resource to lesson
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - url
 *               - type
 *             properties:
 *               title:
 *                 type: string
 *               url:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [pdf, video, link, document, image, audio]
 *               downloadable:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Resource added successfully
 *       403:
 *         description: Insufficient permissions
 */
router.post('/:id/lessons/:lessonId/resources', restrictTo('instructor', 'org_admin', 'super_admin'), (req, res, next) => {
  req.params.courseId = req.params.id;
  addResource(req, res, next);
});

/**
 * @swagger
 * /api/v1/courses/{id}/lessons/{lessonId}/resources/{resourceId}:
 *   delete:
 *     summary: Remove resource from lesson
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: resourceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Resource removed successfully
 *       403:
 *         description: Insufficient permissions
 */
router.delete('/:id/lessons/:lessonId/resources/:resourceId', restrictTo('instructor', 'org_admin', 'super_admin'), (req, res, next) => {
  req.params.courseId = req.params.id;
  removeResource(req, res, next);
});

// Chapter Routes

/**
 * @swagger
 * /api/v1/courses/{id}/chapters:
 *   get:
 *     summary: Get all chapters for a course
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of course chapters
 *       403:
 *         description: No access to course
 *       404:
 *         description: Course not found
 *   post:
 *     summary: Create a new chapter for the course
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               order:
 *                 type: number
 *               isPublished:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Chapter created successfully
 *       403:
 *         description: Insufficient permissions
 */
router.route('/:id/chapters')
  .get((req, res, next) => {
    req.params.courseId = req.params.id;
    getChapters(req, res, next);
  })
  .post(restrictTo('instructor', 'org_admin', 'super_admin'), (req, res, next) => {
    req.params.courseId = req.params.id;
    createChapter(req, res, next);
  });

/**
 * @swagger
 * /api/v1/courses/{id}/chapters/reorder:
 *   patch:
 *     summary: Reorder chapters in a course
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - chapters
 *             properties:
 *               chapters:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     order:
 *                       type: number
 *     responses:
 *       200:
 *         description: Chapters reordered successfully
 *       403:
 *         description: Insufficient permissions
 */
router.patch('/:id/chapters/reorder', restrictTo('instructor', 'org_admin', 'super_admin'), (req, res, next) => {
  req.params.courseId = req.params.id;
  reorderChapters(req, res, next);
});

/**
 * @swagger
 * /api/v1/courses/{id}/chapters/{chapterId}:
 *   get:
 *     summary: Get chapter by ID
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: chapterId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chapter details
 *       403:
 *         description: No access to chapter
 *       404:
 *         description: Chapter not found
 *   patch:
 *     summary: Update chapter
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: chapterId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               isPublished:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Chapter updated successfully
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Chapter not found
 *   delete:
 *     summary: Delete chapter
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: chapterId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Chapter deleted successfully
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Chapter not found
 */
router.route('/:id/chapters/:chapterId')
  .get((req, res, next) => {
    req.params.courseId = req.params.id;
    getChapterById(req, res, next);
  })
  .patch(restrictTo('instructor', 'org_admin', 'super_admin'), (req, res, next) => {
    req.params.courseId = req.params.id;
    updateChapter(req, res, next);
  })
  .delete(restrictTo('instructor', 'org_admin', 'super_admin'), (req, res, next) => {
    req.params.courseId = req.params.id;
    deleteChapter(req, res, next);
  });

module.exports = router;