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
router.get('/my-courses', courseController.getMyCourses);

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

module.exports = router;