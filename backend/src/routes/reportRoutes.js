const express = require('express');
const { protect, restrictTo } = require('../middleware/auth');
const {
  getIndividualLearnerReport,
  getIndividualLearnerCourseProgress,
  getIndividualCourseReport,
  getMultipleLeanersReport,
  getMultipleCoursesReport,
  getArticlesReport,
  getMyReport,
  getCoursesList,
  getLearnersList,
  exportMyReportCSV,
  exportLearnerReportCSV,
  exportArticlesReportCSV,
  exportMultipleLearnersCSV,
  exportIndividualCourseCSV,
  exportMultipleCoursesCSV
} = require('../controllers/reportController');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     LearnerReport:
 *       type: object
 *       properties:
 *         learner:
 *           type: object
 *         stats:
 *           type: object
 *         courses:
 *           type: array
 */

// All routes require authentication
router.use(protect);

/**
 * @swagger
 * /api/v1/reports/my-report:
 *   get:
 *     summary: Get current user's learning report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's learning report
 */
router.get('/my-report', getMyReport);

/**
 * @swagger
 * /api/v1/reports/learner/:id:
 *   get:
 *     summary: Get individual learner report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Learner ID
 *     responses:
 *       200:
 *         description: Learner report data
 *       403:
 *         description: Unauthorized access
 *       404:
 *         description: Learner not found
 */
router.get('/learner/:id', getIndividualLearnerReport);

/**
 * @swagger
 * /api/v1/reports/learner/:id/courses/:courseId:
 *   get:
 *     summary: Get individual learner's course progress
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Course progress data
 */
router.get('/learner/:id/courses/:courseId', getIndividualLearnerCourseProgress);

/**
 * @swagger
 * /api/v1/reports/course/:id:
 *   get:
 *     summary: Get individual course report
 *     tags: [Reports]
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
 *         description: Course report data
 */
router.get(
  '/course/:id',
  restrictTo('instructor', 'org_admin', 'super_admin'),
  getIndividualCourseReport
);

/**
 * @swagger
 * /api/v1/reports/learners/list:
 *   get:
 *     summary: Get list of all learners (for dropdown/selection)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of learners
 */
router.get(
  '/learners/list',
  restrictTo('instructor', 'org_admin', 'super_admin'),
  getLearnersList
);

/**
 * @swagger
 * /api/v1/reports/learners:
 *   post:
 *     summary: Get multiple learners report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               search:
 *                 type: string
 *               status:
 *                 type: string
 *               courseId:
 *                 type: string
 *               limit:
 *                 type: number
 *               page:
 *                 type: number
 *     responses:
 *       200:
 *         description: Multiple learners report
 */
router.post(
  '/learners',
  restrictTo('instructor', 'org_admin', 'super_admin'),
  getMultipleLeanersReport
);

/**
 * @swagger
 * /api/v1/reports/courses/list:
 *   get:
 *     summary: Get list of courses (for dropdown/selection)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of courses
 */
router.get(
  '/courses/list',
  restrictTo('instructor', 'org_admin', 'super_admin'),
  getCoursesList
);

/**
 * @swagger
 * /api/v1/reports/courses:
 *   post:
 *     summary: Get multiple courses report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               search:
 *                 type: string
 *               category:
 *                 type: string
 *               isPublished:
 *                 type: boolean
 *               limit:
 *                 type: number
 *               page:
 *                 type: number
 *     responses:
 *       200:
 *         description: Multiple courses report
 */
router.post(
  '/courses',
  restrictTo('instructor', 'org_admin', 'super_admin'),
  getMultipleCoursesReport
);

/**
 * @swagger
 * /api/v1/reports/articles:
 *   get:
 *     summary: Get articles report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: isPublished
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Articles report
 */
router.get('/articles', getArticlesReport);

// Export routes
router.get('/my-report/export/csv', exportMyReportCSV);
router.get('/learner/:id/export/csv', exportLearnerReportCSV);
router.get('/articles/export/csv', exportArticlesReportCSV);
router.post(
  '/learners/export/csv',
  restrictTo('instructor', 'org_admin', 'super_admin'),
  exportMultipleLearnersCSV
);
router.get(
  '/course/:id/export/csv',
  restrictTo('instructor', 'org_admin', 'super_admin'),
  exportIndividualCourseCSV
);
router.post(
  '/courses/export/csv',
  restrictTo('instructor', 'org_admin', 'super_admin'),
  exportMultipleCoursesCSV
);

module.exports = router;
