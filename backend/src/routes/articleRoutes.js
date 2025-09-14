const express = require('express');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Article:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         title:
 *           type: string
 *         content:
 *           type: string
 *           description: HTML content of the article
 *         excerpt:
 *           type: string
 *           description: Short summary of the article
 *         category:
 *           type: string
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *         thumbnail:
 *           type: string
 *           description: URL to article thumbnail image
 *         author:
 *           $ref: '#/components/schemas/User'
 *         status:
 *           type: string
 *           enum: [draft, published, archived]
 *         visibility:
 *           type: string
 *           enum: [public, private, organization]
 *         readTime:
 *           type: number
 *           description: Estimated read time in minutes
 *         views:
 *           type: number
 *         likes:
 *           type: number
 *         publishedAt:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/v1/articles:
 *   get:
 *     summary: Get all articles with filtering
 *     tags: [Articles]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of articles per page
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *         description: Filter by tags (comma-separated)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, published, archived]
 *         description: Filter by status
 *       - in: query
 *         name: author
 *         schema:
 *           type: string
 *         description: Filter by author ID
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [newest, oldest, popular, title]
 *         description: Sort articles
 *     responses:
 *       200:
 *         description: List of articles
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
 *                     $ref: '#/components/schemas/Article'
 *   post:
 *     summary: Create a new article (Author/Admin only)
 *     tags: [Articles]
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
 *               - content
 *               - category
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Getting Started with Modern JavaScript"
 *               content:
 *                 type: string
 *                 example: "<h2>Introduction</h2><p>JavaScript has evolved significantly...</p>"
 *               excerpt:
 *                 type: string
 *                 example: "Explore modern JavaScript features and best practices"
 *               category:
 *                 type: string
 *                 example: "Programming"
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["javascript", "es6", "programming"]
 *               thumbnail:
 *                 type: string
 *                 example: "https://via.placeholder.com/400x250"
 *               status:
 *                 type: string
 *                 enum: [draft, published]
 *                 default: draft
 *               visibility:
 *                 type: string
 *                 enum: [public, private, organization]
 *                 default: public
 *     responses:
 *       201:
 *         description: Article created successfully
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
 *                     article:
 *                       $ref: '#/components/schemas/Article'
 *       403:
 *         description: Insufficient permissions
 */

/**
 * @swagger
 * /api/v1/articles/{id}:
 *   get:
 *     summary: Get article by ID
 *     tags: [Articles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Article ID
 *     responses:
 *       200:
 *         description: Article details
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
 *                     article:
 *                       $ref: '#/components/schemas/Article'
 *       404:
 *         description: Article not found
 *   patch:
 *     summary: Update article (Author/Admin only)
 *     tags: [Articles]
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
 *               content:
 *                 type: string
 *               excerpt:
 *                 type: string
 *               category:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               thumbnail:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [draft, published, archived]
 *               visibility:
 *                 type: string
 *                 enum: [public, private, organization]
 *     responses:
 *       200:
 *         description: Article updated successfully
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Article not found
 *   delete:
 *     summary: Delete article (Author/Admin only)
 *     tags: [Articles]
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
 *         description: Article deleted successfully
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Article not found
 */

/**
 * @swagger
 * /api/v1/articles/{id}/like:
 *   post:
 *     summary: Like an article
 *     tags: [Articles]
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
 *         description: Article liked successfully
 *       404:
 *         description: Article not found
 *   delete:
 *     summary: Unlike an article
 *     tags: [Articles]
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
 *         description: Article unliked successfully
 *       404:
 *         description: Article not found
 */

/**
 * @swagger
 * /api/v1/articles/categories:
 *   get:
 *     summary: Get all article categories
 *     tags: [Articles]
 *     responses:
 *       200:
 *         description: List of categories
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

/**
 * @swagger
 * /api/v1/articles/featured:
 *   get:
 *     summary: Get featured articles
 *     tags: [Articles]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *         description: Number of featured articles
 *     responses:
 *       200:
 *         description: List of featured articles
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
 *                     $ref: '#/components/schemas/Article'
 */

// Public routes
router.get('/categories', async (req, res) => {
  res.status(501).json({
    status: 'error',
    message: 'Article categories not implemented yet'
  });
});

router.get('/featured', async (req, res) => {
  res.status(501).json({
    status: 'error',
    message: 'Featured articles not implemented yet'
  });
});

router.get('/', async (req, res) => {
  res.status(501).json({
    status: 'error',
    message: 'Article listing not implemented yet'
  });
});

router.get('/:id', async (req, res) => {
  res.status(501).json({
    status: 'error',
    message: 'Article details not implemented yet'
  });
});

// Protected routes
router.use(protect);

router.post('/', restrictTo('instructor', 'org_admin', 'super_admin'), async (req, res) => {
  res.status(501).json({
    status: 'error',
    message: 'Article creation not implemented yet'
  });
});

router.patch('/:id', restrictTo('instructor', 'org_admin', 'super_admin'), async (req, res) => {
  res.status(501).json({
    status: 'error',
    message: 'Article update not implemented yet'
  });
});

router.delete('/:id', restrictTo('instructor', 'org_admin', 'super_admin'), async (req, res) => {
  res.status(501).json({
    status: 'error',
    message: 'Article deletion not implemented yet'
  });
});

router.post('/:id/like', async (req, res) => {
  res.status(501).json({
    status: 'error',
    message: 'Article like functionality not implemented yet'
  });
});

router.delete('/:id/like', async (req, res) => {
  res.status(501).json({
    status: 'error',
    message: 'Article unlike functionality not implemented yet'
  });
});

module.exports = router;