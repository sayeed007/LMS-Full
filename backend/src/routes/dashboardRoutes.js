const express = require('express');
const {
  getDashboardStats,
  getOngoingCourses,
  getCourseAnalytics,
  getCompletionRateData,
  getDashboardCategories
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Protect all routes - authentication required
router.use(protect);

// Dashboard stats
router.get('/stats', getDashboardStats);

// Ongoing/enrolled courses
router.get('/ongoing-courses', getOngoingCourses);

// Course analytics (instructor/admin only)
router.get('/course-analytics', getCourseAnalytics);

// Completion rate data (instructor/admin only)
router.get('/completion-rate', getCompletionRateData);

// Get categories for dashboard filters
router.get('/categories', getDashboardCategories);

module.exports = router;
