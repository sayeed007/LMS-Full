const express = require('express');
const { protect, restrictTo } = require('../middleware/auth');
const {
  getAllUsers,
  getAllInstructors,
  getUser,
  updateUser,
  deleteUser,
  activateUser,
  deactivateUser,
  getUserStats,
  searchUsers,
} = require('../controllers/userController');

const router = express.Router();

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
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
 *         name: role
 *         schema:
 *           type: string
 *           enum: [student, instructor, org_admin, super_admin]
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: List of users
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
 *                     $ref: '#/components/schemas/User'
 *       403:
 *         description: Insufficient permissions
 */

/**
 * @swagger
 * /api/v1/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
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
 *         description: User details
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
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *   patch:
 *     summary: Update user (Admin only)
 *     tags: [Users]
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
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [student, instructor, org_admin, super_admin]
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: User updated successfully
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: User not found
 *   delete:
 *     summary: Delete user (Admin only)
 *     tags: [Users]
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
 *         description: User deleted successfully
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /api/v1/users/{id}/activate:
 *   patch:
 *     summary: Activate user account (Admin only)
 *     tags: [Users]
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
 *         description: User activated successfully
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /api/v1/users/{id}/deactivate:
 *   patch:
 *     summary: Deactivate user account (Admin only)
 *     tags: [Users]
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
 *         description: User deactivated successfully
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /api/v1/users/instructors:
 *   get:
 *     summary: Get all instructors
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of instructors
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
 *                     $ref: '#/components/schemas/User'
 */

// Protected routes - Admin only
router.use(protect);

// User statistics (must come before /:id route)
router.get('/stats', restrictTo('org_admin', 'super_admin'), getUserStats);

// Search users (must come before /:id route)
router.get('/search', searchUsers);

// Get all users with filters
router.get('/', restrictTo('org_admin', 'super_admin'), getAllUsers);

// Get all instructors
router.get('/instructors', getAllInstructors);

// User activation/deactivation (must come before /:id route)
router.patch('/:id/activate', restrictTo('org_admin', 'super_admin'), activateUser);
router.patch('/:id/deactivate', restrictTo('org_admin', 'super_admin'), deactivateUser);

// User CRUD operations
router
  .route('/:id')
  .get(getUser)
  .patch(restrictTo('org_admin', 'super_admin'), updateUser)
  .delete(restrictTo('super_admin'), deleteUser);

module.exports = router;