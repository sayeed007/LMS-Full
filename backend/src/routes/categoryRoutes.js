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

// Routes for instructors and super_admins
router.post('/', restrictTo('instructor', 'super_admin'), categoryValidationRules(), createCategory);
router.put('/:id', restrictTo('instructor', 'super_admin'), categoryIdValidation(), categoryValidationRules(), updateCategory);

// Super admin only routes
router.delete('/:id', restrictTo('super_admin'), categoryIdValidation(), deleteCategory);

module.exports = router;