const express = require('express');
const courseController = require('../controllers/courseController');
const { protect, restrictTo, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/categories', courseController.getCategories);
router.get('/popular', courseController.getPopularCourses);
router.get('/featured', courseController.getFeaturedCourses);
router.get('/', optionalAuth, courseController.getAllCourses);
router.get('/:id', optionalAuth, courseController.getCourse);

// Protected routes
router.use(protect);

router.post('/', restrictTo('instructor', 'org_admin', 'super_admin'), courseController.createCourse);
router.get('/my-courses', courseController.getMyCourses);
router.post('/enroll', courseController.enrollCourse);
router.patch('/progress', courseController.updateProgress);

router.patch('/:id/publish', restrictTo('instructor', 'org_admin', 'super_admin'), courseController.publishCourse);
router.get('/:id/stats', restrictTo('instructor', 'org_admin', 'super_admin'), courseController.getCourseStats);
router.get('/:id/progress', courseController.getCourseProgress);

router
  .route('/:id')
  .patch(restrictTo('instructor', 'org_admin', 'super_admin'), courseController.updateCourse)
  .delete(restrictTo('instructor', 'org_admin', 'super_admin'), courseController.deleteCourse);

module.exports = router;