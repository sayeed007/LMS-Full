const express = require('express');
const { protect, restrictTo } = require('../middleware/auth');
const questionController = require('../controllers/questionController');
const { validate, sanitizeInputs } = require('../middleware/validate');
const {
  questionSearchLimiter,
  bulkQuestionCreateLimiter,
  questionDuplicateLimiter
} = require('../middleware/rateLimiter');
const {
  createQuestionSchema,
  updateQuestionSchema,
  bulkCreateQuestionsSchema,
  duplicateQuestionSchema
} = require('../validators/question.validator');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Question:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         text:
 *           type: string
 *         type:
 *           type: string
 *           enum: [single-choice, multiple-choice, descriptive, true-false, fill-blank]
 *         choices:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               _id:
 *                 type: string
 *               text:
 *                 type: string
 *               isCorrect:
 *                 type: boolean
 *         correctAnswer:
 *           type: string
 *         explanation:
 *           type: string
 *         difficulty:
 *           type: string
 *           enum: [easy, medium, hard]
 *         points:
 *           type: number
 *         timeLimit:
 *           type: number
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *         questionBank:
 *           type: string
 *         course:
 *           type: string
 *         section:
 *           type: string
 *         createdBy:
 *           type: string
 *         isActive:
 *           type: boolean
 *         isPublic:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/v1/questions:
 *   get:
 *     summary: Get all questions with filtering
 *     tags: [Questions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: questionBankId
 *         schema:
 *           type: string
 *         description: Filter by question bank ID
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: string
 *         description: Filter by course ID
 *       - in: query
 *         name: sectionId
 *         schema:
 *           type: string
 *         description: Filter by section ID
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter by question type
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: string
 *         description: Filter by difficulty level
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *         description: Filter by tags (comma-separated)
 *       - in: query
 *         name: my
 *         schema:
 *           type: boolean
 *         description: Show only user's own questions
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
 *         description: List of questions
 *   post:
 *     summary: Create a new question (Student/Instructor/Admin)
 *     tags: [Questions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *               - type
 *               - questionBank
 *             properties:
 *               text:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [single-choice, multiple-choice, descriptive, true-false, fill-blank]
 *               choices:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     text:
 *                       type: string
 *                     isCorrect:
 *                       type: boolean
 *               correctAnswer:
 *                 type: string
 *               explanation:
 *                 type: string
 *               difficulty:
 *                 type: string
 *                 enum: [easy, medium, hard]
 *               points:
 *                 type: number
 *               timeLimit:
 *                 type: number
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               questionBank:
 *                 type: string
 *               section:
 *                 type: string
 *               isPublic:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Question created successfully
 */

/**
 * @swagger
 * /api/v1/questions/{id}:
 *   get:
 *     summary: Get question by ID
 *     tags: [Questions]
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
 *         description: Question details
 *       404:
 *         description: Question not found
 *   patch:
 *     summary: Update question
 *     tags: [Questions]
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
 *               text:
 *                 type: string
 *               choices:
 *                 type: array
 *               explanation:
 *                 type: string
 *               difficulty:
 *                 type: string
 *               points:
 *                 type: number
 *     responses:
 *       200:
 *         description: Question updated successfully
 *       403:
 *         description: Insufficient permissions
 *   delete:
 *     summary: Delete question
 *     tags: [Questions]
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
 *         description: Question deleted successfully
 *       403:
 *         description: Insufficient permissions
 */

/**
 * @swagger
 * /api/v1/questions/bulk:
 *   post:
 *     summary: Create multiple questions at once
 *     tags: [Questions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - questionBankId
 *               - questions
 *             properties:
 *               questionBankId:
 *                 type: string
 *               questions:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Question'
 *     responses:
 *       201:
 *         description: Questions created successfully
 */

/**
 * @swagger
 * /api/v1/questions/search:
 *   get:
 *     summary: Search questions by text
 *     tags: [Questions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter by question type
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: string
 *         description: Filter by difficulty
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *         description: Filter by tags (comma-separated)
 *     responses:
 *       200:
 *         description: Search results
 */

// Protected routes
router.use(protect);

// Apply input sanitization to all routes
router.use(sanitizeInputs);

// Utility routes (must come before parameterized routes)
router.post(
  '/bulk',
  bulkQuestionCreateLimiter,
  restrictTo('student', 'instructor', 'org_admin', 'super_admin'),
  validate(bulkCreateQuestionsSchema),
  questionController.bulkCreateQuestions
);
router.get(
  '/search',
  questionSearchLimiter,
  questionController.searchQuestions
);
router.get('/course/:courseId', questionController.getQuestionsByCourse);
router.get('/question-bank/:questionBankId', questionController.getQuestionsByQuestionBank);

// Main CRUD routes
router
  .route('/')
  .get(questionController.getAllQuestions)
  .post(
    restrictTo('student', 'instructor', 'org_admin', 'super_admin'),
    validate(createQuestionSchema),
    questionController.createQuestion
  );

router
  .route('/:id')
  .get(questionController.getQuestion)
  .patch(
    validate(updateQuestionSchema),
    questionController.updateQuestion
  )
  .delete(questionController.deleteQuestion);

// Additional utility routes
router.post(
  '/:id/duplicate',
  questionDuplicateLimiter,
  validate(duplicateQuestionSchema),
  questionController.duplicateQuestion
);

module.exports = router;