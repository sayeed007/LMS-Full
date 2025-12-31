const express = require('express');
const { protect } = require('../middleware/auth');
const {
  trackArticleView,
  trackArticleRating,
  getArticleAnalytics,
  incrementCommentCount,
  decrementCommentCount,
  trackArticleShare,
  trackArticleBookmark
} = require('../controllers/articleAnalyticsController');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     ArticleAnalytics:
 *       type: object
 *       properties:
 *         totalViews:
 *           type: number
 *         uniqueViews:
 *           type: number
 *         totalComments:
 *           type: number
 *         totalRatings:
 *           type: number
 */

/**
 * @swagger
 * /api/v1/analytics/article/{id}/view:
 *   post:
 *     summary: Track article view
 *     tags: [Analytics]
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
 *               readTime:
 *                 type: number
 *     responses:
 *       200:
 *         description: View tracked
 */
router.post('/article/:id/view', trackArticleView);

/**
 * @swagger
 * /api/v1/analytics/article/{id}/rate:
 *   post:
 *     summary: Rate article as helpful or not
 *     tags: [Analytics]
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
 *               - isHelpful
 *             properties:
 *               isHelpful:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Rating recorded
 */
router.post('/article/:id/rate', trackArticleRating);

/**
 * @swagger
 * /api/v1/analytics/article/{id}/share:
 *   post:
 *     summary: Track article share
 *     tags: [Analytics]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Share tracked
 */
router.post('/article/:id/share', trackArticleShare);

/**
 * @swagger
 * /api/v1/analytics/article/{id}/bookmark:
 *   post:
 *     summary: Track article bookmark
 *     tags: [Analytics]
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
 *         description: Bookmark tracked
 */
router.post('/article/:id/bookmark', protect, trackArticleBookmark);

/**
 * @swagger
 * /api/v1/analytics/article/{id}:
 *   get:
 *     summary: Get article analytics
 *     tags: [Analytics]
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
 *         description: Article analytics data
 */
router.get('/article/:id', protect, getArticleAnalytics);

/**
 * @swagger
 * /api/v1/analytics/article/{id}/comment/increment:
 *   post:
 *     summary: Increment comment count
 *     tags: [Analytics]
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
 *         description: Comment count incremented
 */
router.post('/article/:id/comment/increment', protect, incrementCommentCount);

/**
 * @swagger
 * /api/v1/analytics/article/{id}/comment/decrement:
 *   post:
 *     summary: Decrement comment count
 *     tags: [Analytics]
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
 *         description: Comment count decremented
 */
router.post('/article/:id/comment/decrement', protect, decrementCommentCount);

module.exports = router;
