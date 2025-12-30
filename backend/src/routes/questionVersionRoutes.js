const express = require('express');
const questionVersionController = require('../controllers/questionVersionController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

// All routes require authentication
router.use(protect);

/**
 * @route   GET /api/v1/questions/:questionId/versions
 * @desc    Get all versions for a question
 * @access  Private (Question owner, org admin, super admin)
 */
router.get(
  '/',
  questionVersionController.getQuestionVersions
);

/**
 * @route   GET /api/v1/questions/:questionId/versions/latest
 * @desc    Get the latest version of a question
 * @access  Private (Question owner, org admin, super admin)
 */
router.get(
  '/latest',
  questionVersionController.getLatestVersion
);

/**
 * @route   GET /api/v1/questions/:questionId/versions/stats
 * @desc    Get version statistics for a question
 * @access  Private (Question owner, org admin, super admin)
 */
router.get(
  '/stats',
  questionVersionController.getVersionStats
);

/**
 * @route   GET /api/v1/questions/:questionId/versions/compare
 * @desc    Compare two versions
 * @access  Private (Question owner, org admin, super admin)
 * @query   from - Version number to compare from
 * @query   to - Version number to compare to
 */
router.get(
  '/compare',
  questionVersionController.compareVersions
);

/**
 * @route   DELETE /api/v1/questions/:questionId/versions/cleanup
 * @desc    Cleanup old versions (keep only recent N versions)
 * @access  Private (Org admin, super admin only)
 * @query   keepCount - Number of versions to keep (default: 50)
 */
router.delete(
  '/cleanup',
  restrictTo('org_admin', 'super_admin'),
  questionVersionController.cleanupOldVersions
);

/**
 * @route   GET /api/v1/questions/:questionId/versions/:versionNumber
 * @desc    Get a specific version
 * @access  Private (Question owner, org admin, super admin)
 */
router.get(
  '/:versionNumber',
  questionVersionController.getSpecificVersion
);

/**
 * @route   POST /api/v1/questions/:questionId/versions/:versionNumber/restore
 * @desc    Restore a specific version
 * @access  Private (Question owner, org admin, super admin)
 */
router.post(
  '/:versionNumber/restore',
  questionVersionController.restoreVersion
);

module.exports = router;
