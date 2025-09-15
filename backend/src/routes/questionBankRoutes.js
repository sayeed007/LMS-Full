const express = require('express');
const { protect, restrictTo } = require('../middleware/auth');
const questionBankController = require('../controllers/questionBankController');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     QuestionBank:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         course:
 *           type: string
 *         sections:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               _id:
 *                 type: string
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               order:
 *                 type: number
 *         createdBy:
 *           type: string
 *         status:
 *           type: string
 *           enum: [draft, active, archived]
 *         visibility:
 *           type: string
 *           enum: [public, private, organization]
 *         totalQuestions:
 *           type: number
 *         settings:
 *           type: object
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/v1/question-banks:
 *   get:
 *     summary: Get all question banks with filtering
 *     tags: [Question Banks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: string
 *         description: Filter by course ID
 *       - in: query
 *         name: my
 *         schema:
 *           type: boolean
 *         description: Show only user's own question banks
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, active, archived]
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
 *         description: List of question banks
 *   post:
 *     summary: Create a new question bank (Student/Instructor/Admin)
 *     tags: [Question Banks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - course
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               course:
 *                 type: string
 *               visibility:
 *                 type: string
 *                 enum: [public, private, organization]
 *               sections:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *     responses:
 *       201:
 *         description: Question bank created successfully
 */

/**
 * @swagger
 * /api/v1/question-banks/{id}:
 *   get:
 *     summary: Get question bank by ID
 *     tags: [Question Banks]
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
 *         description: Question bank details
 *       404:
 *         description: Question bank not found
 *   patch:
 *     summary: Update question bank
 *     tags: [Question Banks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               visibility:
 *                 type: string
 *               settings:
 *                 type: object
 *     responses:
 *       200:
 *         description: Question bank updated successfully
 *       403:
 *         description: Insufficient permissions
 *   delete:
 *     summary: Delete question bank
 *     tags: [Question Banks]
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
 *         description: Question bank deleted successfully
 *       403:
 *         description: Insufficient permissions
 */

// Protected routes
router.use(protect);

// Main CRUD routes
router
  .route('/')
  .get(questionBankController.getAllQuestionBanks)
  .post(restrictTo('student', 'instructor', 'org_admin', 'super_admin'), questionBankController.createQuestionBank);

router
  .route('/:id')
  .get(questionBankController.getQuestionBank)
  .patch(questionBankController.updateQuestionBank)
  .delete(questionBankController.deleteQuestionBank);

// Section management routes
router.post('/:id/sections', questionBankController.addSection);
router.patch('/:id/sections/:sectionId', questionBankController.updateSection);
router.delete('/:id/sections/:sectionId', questionBankController.deleteSection);

// Status management routes
router.patch('/:id/activate', questionBankController.activateQuestionBank);
router.patch('/:id/archive', questionBankController.archiveQuestionBank);

// Utility routes
router.post('/:id/duplicate', questionBankController.duplicateQuestionBank);
router.get('/course/:courseId', questionBankController.getQuestionBanksByCourse);

module.exports = router;