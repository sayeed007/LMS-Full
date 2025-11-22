const express = require('express');
const { protect, restrictTo } = require('../middleware/auth');
const {
  getAssignmentsByCourse,
  getAssignment,
  submitAssignment,
  gradeSubmission,
  getAssignmentSubmissions,
  getMySubmission
} = require('../controllers/assignmentController');

const router = express.Router();

// All routes require authentication
router.use(protect);

/**
 * @swagger
 * /api/v1/assignments/{id}:
 *   get:
 *     summary: Get assignment by ID
 *     tags: [Assignments]
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
 *         description: Assignment details
 *       404:
 *         description: Assignment not found
 */
router.get('/:id', getAssignment);

/**
 * @swagger
 * /api/v1/assignments/{id}/my-submission:
 *   get:
 *     summary: Get student's own submission
 *     tags: [Assignments]
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
 *         description: Student submission details
 */
router.get('/:id/my-submission', restrictTo('student'), getMySubmission);

/**
 * @swagger
 * /api/v1/assignments/{id}/submit:
 *   post:
 *     summary: Submit assignment
 *     tags: [Assignments]
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
 *               content:
 *                 type: string
 *               url:
 *                 type: string
 *               files:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       201:
 *         description: Assignment submitted successfully
 *       400:
 *         description: Invalid submission
 */
router.post('/:id/submit', restrictTo('student'), submitAssignment);

/**
 * @swagger
 * /api/v1/assignments/{id}/submissions:
 *   get:
 *     summary: Get all submissions for an assignment (instructor view)
 *     tags: [Assignments]
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
 *         description: All submissions with stats
 *       403:
 *         description: Unauthorized
 */
router.get('/:id/submissions', restrictTo('instructor', 'org_admin', 'super_admin'), getAssignmentSubmissions);

/**
 * @swagger
 * /api/v1/assignments/{id}/submissions/{submissionId}/grade:
 *   patch:
 *     summary: Grade assignment submission
 *     tags: [Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: submissionId
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
 *               - score
 *             properties:
 *               score:
 *                 type: number
 *               feedback:
 *                 type: string
 *     responses:
 *       200:
 *         description: Submission graded successfully
 *       400:
 *         description: Invalid score or feedback
 *       403:
 *         description: Unauthorized
 */
router.patch('/:id/submissions/:submissionId/grade', restrictTo('instructor', 'org_admin', 'super_admin'), gradeSubmission);

module.exports = router;
