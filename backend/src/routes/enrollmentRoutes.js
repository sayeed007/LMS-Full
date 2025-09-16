const express = require('express');
const { protect, restrictTo } = require('../middleware/auth');
const {
  getAllEnrollments,
  getEnrollmentById,
  getMyEnrollments,
  getCourseEnrollments,
  enrollInCourse,
  bulkEnroll,
  unenrollFromCourse,
  updateProgress,
  markCourseComplete,
  rateCourse,
  updateRating,
  deleteRating,
  generateCertificate,
  downloadCertificate,
  getEnrollmentStats,
  getProgress,
  getDetailedProgress
} = require('../controllers/enrollmentController');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Enrollment:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         user:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             name:
 *               type: string
 *             email:
 *               type: string
 *             avatar:
 *               type: string
 *         course:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             title:
 *               type: string
 *             thumbnail:
 *               type: string
 *         enrolledAt:
 *           type: string
 *           format: date-time
 *         status:
 *           type: string
 *           enum: [active, completed, dropped, suspended]
 *         progress:
 *           type: object
 *           properties:
 *             completedLessons:
 *               type: array
 *               items:
 *                 type: string
 *             currentLesson:
 *               type: string
 *             completionPercentage:
 *               type: number
 *             timeSpent:
 *               type: number
 *             lastAccessed:
 *               type: string
 *               format: date-time
 *         certificate:
 *           type: object
 *           properties:
 *             issued:
 *               type: boolean
 *             issuedAt:
 *               type: string
 *               format: date-time
 *             certificateId:
 *               type: string
 *             downloadUrl:
 *               type: string
 *         rating:
 *           type: object
 *           properties:
 *             value:
 *               type: number
 *             review:
 *               type: string
 *             submittedAt:
 *               type: string
 *               format: date-time
 */

// All routes require authentication
router.use(protect);

/**
 * @swagger
 * /api/v1/enrollments:
 *   get:
 *     summary: Get all enrollments with filtering
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, completed, dropped, suspended]
 *       - in: query
 *         name: course
 *         schema:
 *           type: string
 *         description: Filter by course ID
 *       - in: query
 *         name: user
 *         schema:
 *           type: string
 *         description: Filter by user ID (admin only)
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
 *         description: List of enrollments
 *   post:
 *     summary: Enroll in a course
 *     tags: [Enrollments]
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
 *               userId:
 *                 type: string
 *                 description: Admin can enroll other users
 *     responses:
 *       201:
 *         description: Successfully enrolled in course
 *       400:
 *         description: Already enrolled or course not available
 */
router.route('/')
  .get(getAllEnrollments)
  .post(enrollInCourse);

/**
 * @swagger
 * /api/v1/enrollments/my-enrollments:
 *   get:
 *     summary: Get current user's enrollments
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         description: User's enrollments
 */
router.get('/my-enrollments', getMyEnrollments);

/**
 * @swagger
 * /api/v1/enrollments/bulk:
 *   post:
 *     summary: Bulk enroll users in a course (Admin only)
 *     tags: [Enrollments]
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
 *               - userIds
 *             properties:
 *               courseId:
 *                 type: string
 *               userIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Bulk enrollment results
 */
router.post('/bulk', restrictTo('org_admin', 'super_admin'), bulkEnroll);

/**
 * @swagger
 * /api/v1/enrollments/stats:
 *   get:
 *     summary: Get enrollment statistics
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: string
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Enrollment statistics
 */
router.get('/stats', getEnrollmentStats);

/**
 * @swagger
 * /api/v1/enrollments/{id}:
 *   get:
 *     summary: Get enrollment by ID
 *     tags: [Enrollments]
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
 *         description: Enrollment details
 *       404:
 *         description: Enrollment not found
 *   delete:
 *     summary: Unenroll from course
 *     tags: [Enrollments]
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
 *         description: Successfully unenrolled
 *       404:
 *         description: Enrollment not found
 */
router.route('/:id')
  .get(getEnrollmentById)
  .delete(unenrollFromCourse);

/**
 * @swagger
 * /api/v1/enrollments/{id}/progress:
 *   patch:
 *     summary: Update enrollment progress
 *     tags: [Enrollments]
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
 *               - lessonId
 *               - completed
 *             properties:
 *               lessonId:
 *                 type: string
 *               completed:
 *                 type: boolean
 *               timeSpent:
 *                 type: number
 *     responses:
 *       200:
 *         description: Progress updated successfully
 */
router.patch('/:id/progress', updateProgress);

/**
 * @swagger
 * /api/v1/enrollments/{id}/complete:
 *   patch:
 *     summary: Mark course as complete
 *     tags: [Enrollments]
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
 *         description: Course marked as complete
 */
router.patch('/:id/complete', markCourseComplete);

/**
 * @swagger
 * /api/v1/enrollments/{id}/rating:
 *   post:
 *     summary: Rate a course
 *     tags: [Enrollments]
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
 *               - rating
 *             properties:
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *               review:
 *                 type: string
 *     responses:
 *       200:
 *         description: Course rated successfully
 *   patch:
 *     summary: Update course rating
 *     tags: [Enrollments]
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
 *               - rating
 *             properties:
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *               review:
 *                 type: string
 *     responses:
 *       200:
 *         description: Rating updated successfully
 *   delete:
 *     summary: Delete course rating
 *     tags: [Enrollments]
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
 *         description: Rating deleted successfully
 */
router.route('/:id/rating')
  .post(rateCourse)
  .patch(updateRating)
  .delete(deleteRating);

/**
 * @swagger
 * /api/v1/enrollments/{id}/certificate:
 *   post:
 *     summary: Generate certificate
 *     tags: [Enrollments]
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
 *         description: Certificate generated successfully
 *       400:
 *         description: Course not completed
 */
router.post('/:id/certificate', generateCertificate);

/**
 * @swagger
 * /api/v1/enrollments/{id}/certificate/download:
 *   get:
 *     summary: Download certificate
 *     tags: [Enrollments]
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
 *         description: Certificate file
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Certificate not found
 */
router.get('/:id/certificate/download', downloadCertificate);

/**
 * @swagger
 * /api/v1/enrollments/{id}/detailed-progress:
 *   get:
 *     summary: Get detailed progress for enrollment
 *     tags: [Enrollments]
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
 *         description: Detailed progress information
 */
router.get('/:id/detailed-progress', getDetailedProgress);


module.exports = router;