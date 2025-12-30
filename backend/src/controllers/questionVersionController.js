const Question = require('../models/Question');
const QuestionVersion = require('../models/QuestionVersion');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

/**
 * Get all versions for a specific question
 * GET /api/v1/questions/:questionId/versions
 */
exports.getQuestionVersions = catchAsync(async (req, res, next) => {
  const { questionId } = req.params;

  // Verify question exists
  const question = await Question.findById(questionId);
  if (!question) {
    return next(new AppError('Question not found', 404));
  }

  // Check permissions
  if (question.createdBy.toString() !== req.user.id &&
      !['org_admin', 'super_admin'].includes(req.user.role)) {
    return next(new AppError('You do not have permission to view version history', 403));
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  // Get versions
  const versions = await QuestionVersion.findByQuestion(questionId, {
    limit,
    skip,
    sort: { version: -1 } // Latest first
  });

  // Get total count
  const totalVersions = await QuestionVersion.countVersions(questionId);

  res.status(200).json({
    status: 'success',
    results: versions.length,
    totalVersions,
    currentPage: page,
    totalPages: Math.ceil(totalVersions / limit),
    data: {
      versions
    }
  });
});

/**
 * Get a specific version
 * GET /api/v1/questions/:questionId/versions/:versionNumber
 */
exports.getSpecificVersion = catchAsync(async (req, res, next) => {
  const { questionId, versionNumber } = req.params;

  // Verify question exists
  const question = await Question.findById(questionId);
  if (!question) {
    return next(new AppError('Question not found', 404));
  }

  // Check permissions
  if (question.createdBy.toString() !== req.user.id &&
      !['org_admin', 'super_admin'].includes(req.user.role)) {
    return next(new AppError('You do not have permission to view version history', 403));
  }

  // Get the version
  const version = await QuestionVersion.findByVersion(questionId, parseInt(versionNumber, 10));

  if (!version) {
    return next(new AppError('Version not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      version
    }
  });
});

/**
 * Get latest version
 * GET /api/v1/questions/:questionId/versions/latest
 */
exports.getLatestVersion = catchAsync(async (req, res, next) => {
  const { questionId } = req.params;

  // Verify question exists
  const question = await Question.findById(questionId);
  if (!question) {
    return next(new AppError('Question not found', 404));
  }

  // Check permissions
  if (question.createdBy.toString() !== req.user.id &&
      !['org_admin', 'super_admin'].includes(req.user.role)) {
    return next(new AppError('You do not have permission to view version history', 403));
  }

  // Get latest version
  const latestVersion = await QuestionVersion.findLatestVersion(questionId);

  if (!latestVersion) {
    return next(new AppError('No versions found for this question', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      version: latestVersion
    }
  });
});

/**
 * Compare two versions
 * GET /api/v1/questions/:questionId/versions/compare?from=1&to=2
 */
exports.compareVersions = catchAsync(async (req, res, next) => {
  const { questionId } = req.params;
  const { from, to } = req.query;

  if (!from || !to) {
    return next(new AppError('Both "from" and "to" version numbers are required', 400));
  }

  // Verify question exists
  const question = await Question.findById(questionId);
  if (!question) {
    return next(new AppError('Question not found', 404));
  }

  // Check permissions
  if (question.createdBy.toString() !== req.user.id &&
      !['org_admin', 'super_admin'].includes(req.user.role)) {
    return next(new AppError('You do not have permission to compare versions', 403));
  }

  // Get both versions
  const fromVersion = await QuestionVersion.findByVersion(questionId, parseInt(from, 10));
  const toVersion = await QuestionVersion.findByVersion(questionId, parseInt(to, 10));

  if (!fromVersion || !toVersion) {
    return next(new AppError('One or both versions not found', 404));
  }

  // Compare versions
  const changes = toVersion.compareWith(fromVersion);

  res.status(200).json({
    status: 'success',
    data: {
      from: fromVersion,
      to: toVersion,
      changes
    }
  });
});

/**
 * Restore a specific version
 * POST /api/v1/questions/:questionId/versions/:versionNumber/restore
 */
exports.restoreVersion = catchAsync(async (req, res, next) => {
  const { questionId, versionNumber } = req.params;

  // Verify question exists
  const question = await Question.findById(questionId);
  if (!question) {
    return next(new AppError('Question not found', 404));
  }

  // Check permissions
  if (question.createdBy.toString() !== req.user.id &&
      !['org_admin', 'super_admin'].includes(req.user.role)) {
    return next(new AppError('You do not have permission to restore versions', 403));
  }

  // Get the version to restore
  const versionToRestore = await QuestionVersion.findByVersion(questionId, parseInt(versionNumber, 10));

  if (!versionToRestore) {
    return next(new AppError('Version not found', 404));
  }

  // Update the question with the version data
  Object.assign(question, versionToRestore.data);
  await question.save({ validateBeforeSave: true });

  // Create a new version for this restore action
  const versionData = {
    text: question.text,
    type: question.type,
    choices: question.choices,
    correctAnswer: question.correctAnswer,
    explanation: question.explanation,
    difficulty: question.difficulty,
    points: question.points,
    timeLimit: question.timeLimit,
    tags: question.tags,
    attachments: question.attachments
  };

  await QuestionVersion.createVersion(
    question._id,
    versionData,
    req.user.id,
    `Restored to version ${versionNumber}`
  );

  // Populate and return the question
  await question.populate('createdBy', 'name email avatar');
  await question.populate('questionBank', 'name');
  await question.populate('course', 'title');

  res.status(200).json({
    status: 'success',
    message: `Successfully restored to version ${versionNumber}`,
    data: {
      question
    }
  });
});

/**
 * Delete old versions (cleanup)
 * DELETE /api/v1/questions/:questionId/versions/cleanup
 */
exports.cleanupOldVersions = catchAsync(async (req, res, next) => {
  const { questionId } = req.params;
  const { keepCount = 50 } = req.query;

  // Verify question exists
  const question = await Question.findById(questionId);
  if (!question) {
    return next(new AppError('Question not found', 404));
  }

  // Check permissions - only admins can cleanup
  if (!['org_admin', 'super_admin'].includes(req.user.role)) {
    return next(new AppError('You do not have permission to cleanup versions', 403));
  }

  // Cleanup old versions
  const deletedCount = await QuestionVersion.cleanupOldVersions(questionId, parseInt(keepCount, 10));

  res.status(200).json({
    status: 'success',
    message: `Deleted ${deletedCount} old versions`,
    data: {
      deletedCount,
      keptCount: parseInt(keepCount, 10)
    }
  });
});

/**
 * Get version statistics
 * GET /api/v1/questions/:questionId/versions/stats
 */
exports.getVersionStats = catchAsync(async (req, res, next) => {
  const { questionId } = req.params;

  // Verify question exists
  const question = await Question.findById(questionId);
  if (!question) {
    return next(new AppError('Question not found', 404));
  }

  // Check permissions
  if (question.createdBy.toString() !== req.user.id &&
      !['org_admin', 'super_admin'].includes(req.user.role)) {
    return next(new AppError('You do not have permission to view version stats', 403));
  }

  // Get version count
  const totalVersions = await QuestionVersion.countVersions(questionId);

  // Get latest version
  const latestVersion = await QuestionVersion.findLatestVersion(questionId);

  // Get first version
  const firstVersion = await QuestionVersion.findOne({ questionId })
    .sort({ version: 1 })
    .populate('changedBy', 'name email');

  // Calculate total storage used
  const versions = await QuestionVersion.find({ questionId }).select('dataSize');
  const totalStorageBytes = versions.reduce((sum, v) => sum + (v.dataSize || 0), 0);
  const totalStorageKB = (totalStorageBytes / 1024).toFixed(2);

  // Get contributors (unique users who made changes)
  const contributorIds = await QuestionVersion.distinct('changedBy', { questionId });

  res.status(200).json({
    status: 'success',
    data: {
      stats: {
        totalVersions,
        firstVersion: firstVersion ? {
          version: firstVersion.version,
          createdAt: firstVersion.createdAt,
          createdBy: firstVersion.changedBy
        } : null,
        latestVersion: latestVersion ? {
          version: latestVersion.version,
          createdAt: latestVersion.createdAt,
          createdBy: latestVersion.changedBy
        } : null,
        totalStorageKB,
        totalContributors: contributorIds.length
      }
    }
  });
});

module.exports = exports;
