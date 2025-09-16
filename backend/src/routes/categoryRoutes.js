const express = require('express');
const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryStats,
  categoryValidationRules,
  categoryIdValidation
} = require('../controllers/categoryController');
const { protect, restrictTo } = require('../middleware/auth');
const router = express.Router();

// Public routes
router.get('/', getCategories);
router.get('/stats', getCategoryStats);
router.get('/:id', categoryIdValidation(), getCategoryById);

// Protected routes - require authentication
router.use(protect);

// Routes for instructors and admins
router.post('/', restrictTo('instructor', 'admin'), categoryValidationRules(), createCategory);
router.put('/:id', restrictTo('instructor', 'admin'), categoryIdValidation(), categoryValidationRules(), updateCategory);

// Admin only routes
router.delete('/:id', restrictTo('admin'), categoryIdValidation(), deleteCategory);

module.exports = router;