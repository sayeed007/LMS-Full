const QuestionBank = require('../models/QuestionBank');
const Question = require('../models/Question');
const Course = require('../models/Course');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

// Get all question banks with filtering and pagination
exports.getAllQuestionBanks = catchAsync(async (req, res, next) => {
  let filter = {};

  // Filter by course if provided
  if (req.query.courseId) {
    filter.course = req.query.courseId;
  }

  // Filter by user's own question banks if requested
  if (req.query.my === 'true') {
    filter.createdBy = req.user.id;
  }

  // Filter by status
  if (req.query.status) {
    filter.status = req.query.status;
  } else {
    // Default to non-archived
    filter.status = { $ne: 'archived' };
  }

  // Filter by visibility based on user role
  if (!['org_admin', 'super_admin'].includes(req.user.role)) {
    filter.$or = [
      { visibility: 'public' },
      { createdBy: req.user.id },
      { visibility: 'organization', organization: req.user.organization }
    ];
  }

  const features = new APIFeatures(QuestionBank.find(filter), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const questionBanks = await features.query
    .populate('createdBy', 'name email avatar')
    .populate('course', 'title description')
    .populate('questionsCount');

  res.status(200).json({
    status: 'success',
    results: questionBanks.length,
    data: {
      questionBanks
    }
  });
});

// Get question bank by ID
exports.getQuestionBank = catchAsync(async (req, res, next) => {
  const questionBank = await QuestionBank.findById(req.params.id)
    .populate('createdBy', 'name email avatar')
    .populate('course', 'title description')
    .populate({
      path: 'questions',
      populate: {
        path: 'createdBy',
        select: 'name email'
      }
    });

  if (!questionBank) {
    return next(new AppError('No question bank found with that ID', 404));
  }

  // Check visibility permissions
  if (questionBank.visibility === 'private' &&
      questionBank.createdBy._id.toString() !== req.user.id &&
      !['org_admin', 'super_admin'].includes(req.user.role)) {
    return next(new AppError('You do not have permission to view this question bank', 403));
  }

  res.status(200).json({
    status: 'success',
    data: {
      questionBank
    }
  });
});

// Create new question bank
exports.createQuestionBank = catchAsync(async (req, res, next) => {
  // Check if course exists
  const course = await Course.findById(req.body.course);
  if (!course) {
    return next(new AppError('Course not found', 404));
  }

  // Add creator and organization info
  const questionBankData = {
    ...req.body,
    createdBy: req.user.id,
    organization: req.user.organization
  };

  const questionBank = await QuestionBank.create(questionBankData);

  // Populate the response
  await questionBank.populate('createdBy', 'name email avatar');
  await questionBank.populate('course', 'title description');

  res.status(201).json({
    status: 'success',
    data: {
      questionBank
    }
  });
});

// Update question bank
exports.updateQuestionBank = catchAsync(async (req, res, next) => {
  const questionBank = await QuestionBank.findById(req.params.id);

  if (!questionBank) {
    return next(new AppError('No question bank found with that ID', 404));
  }

  // Check permissions
  if (questionBank.createdBy.toString() !== req.user.id &&
      !['org_admin', 'super_admin'].includes(req.user.role)) {
    return next(new AppError('You do not have permission to edit this question bank', 403));
  }

  // Don't allow changing course or creator
  delete req.body.course;
  delete req.body.createdBy;
  delete req.body.organization;

  const updatedQuestionBank = await QuestionBank.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  ).populate('createdBy', 'name email avatar')
   .populate('course', 'title description');

  res.status(200).json({
    status: 'success',
    data: {
      questionBank: updatedQuestionBank
    }
  });
});

// Delete question bank
exports.deleteQuestionBank = catchAsync(async (req, res, next) => {
  const questionBank = await QuestionBank.findById(req.params.id);

  if (!questionBank) {
    return next(new AppError('No question bank found with that ID', 404));
  }

  // Check permissions
  if (questionBank.createdBy.toString() !== req.user.id &&
      !['org_admin', 'super_admin'].includes(req.user.role)) {
    return next(new AppError('You do not have permission to delete this question bank', 403));
  }

  // Also delete all associated questions
  await Question.deleteMany({ questionBank: req.params.id });

  await QuestionBank.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Add section to question bank
exports.addSection = catchAsync(async (req, res, next) => {
  const questionBank = await QuestionBank.findById(req.params.id);

  if (!questionBank) {
    return next(new AppError('No question bank found with that ID', 404));
  }

  // Check permissions
  if (questionBank.createdBy.toString() !== req.user.id &&
      !['org_admin', 'super_admin'].includes(req.user.role)) {
    return next(new AppError('You do not have permission to edit this question bank', 403));
  }

  await questionBank.addSection(req.body);

  res.status(200).json({
    status: 'success',
    data: {
      questionBank
    }
  });
});

// Update section
exports.updateSection = catchAsync(async (req, res, next) => {
  const questionBank = await QuestionBank.findById(req.params.id);

  if (!questionBank) {
    return next(new AppError('No question bank found with that ID', 404));
  }

  // Check permissions
  if (questionBank.createdBy.toString() !== req.user.id &&
      !['org_admin', 'super_admin'].includes(req.user.role)) {
    return next(new AppError('You do not have permission to edit this question bank', 403));
  }

  await questionBank.updateSection(req.params.sectionId, req.body);

  res.status(200).json({
    status: 'success',
    data: {
      questionBank
    }
  });
});

// Delete section
exports.deleteSection = catchAsync(async (req, res, next) => {
  const questionBank = await QuestionBank.findById(req.params.id);

  if (!questionBank) {
    return next(new AppError('No question bank found with that ID', 404));
  }

  // Check permissions
  if (questionBank.createdBy.toString() !== req.user.id &&
      !['org_admin', 'super_admin'].includes(req.user.role)) {
    return next(new AppError('You do not have permission to edit this question bank', 403));
  }

  await questionBank.removeSection(req.params.sectionId);

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Activate question bank
exports.activateQuestionBank = catchAsync(async (req, res, next) => {
  const questionBank = await QuestionBank.findById(req.params.id);

  if (!questionBank) {
    return next(new AppError('No question bank found with that ID', 404));
  }

  // Check permissions
  if (questionBank.createdBy.toString() !== req.user.id &&
      !['org_admin', 'super_admin'].includes(req.user.role)) {
    return next(new AppError('You do not have permission to activate this question bank', 403));
  }

  await questionBank.activate();

  res.status(200).json({
    status: 'success',
    data: {
      questionBank
    }
  });
});

// Archive question bank
exports.archiveQuestionBank = catchAsync(async (req, res, next) => {
  const questionBank = await QuestionBank.findById(req.params.id);

  if (!questionBank) {
    return next(new AppError('No question bank found with that ID', 404));
  }

  // Check permissions
  if (questionBank.createdBy.toString() !== req.user.id &&
      !['org_admin', 'super_admin'].includes(req.user.role)) {
    return next(new AppError('You do not have permission to archive this question bank', 403));
  }

  await questionBank.archive();

  res.status(200).json({
    status: 'success',
    data: {
      questionBank
    }
  });
});

// Get question banks by course
exports.getQuestionBanksByCourse = catchAsync(async (req, res, next) => {
  const questionBanks = await QuestionBank.findByCourse(req.params.courseId, {
    status: req.query.status,
    visibility: req.query.visibility
  });

  res.status(200).json({
    status: 'success',
    results: questionBanks.length,
    data: {
      questionBanks
    }
  });
});

// Duplicate question bank
exports.duplicateQuestionBank = catchAsync(async (req, res, next) => {
  const originalQuestionBank = await QuestionBank.findById(req.params.id)
    .populate('questions');

  if (!originalQuestionBank) {
    return next(new AppError('No question bank found with that ID', 404));
  }

  // Check if user can view the original
  if (originalQuestionBank.visibility === 'private' &&
      originalQuestionBank.createdBy.toString() !== req.user.id &&
      !['org_admin', 'super_admin'].includes(req.user.role)) {
    return next(new AppError('You do not have permission to duplicate this question bank', 403));
  }

  // Create new question bank
  const newQuestionBankData = {
    ...originalQuestionBank.toObject(),
    _id: undefined,
    name: `${originalQuestionBank.name} (Copy)`,
    createdBy: req.user.id,
    organization: req.user.organization,
    status: 'draft',
    totalQuestions: 0,
    timesUsed: 0,
    averageScore: 0,
    lastUsed: undefined,
    createdAt: undefined,
    updatedAt: undefined
  };

  const newQuestionBank = await QuestionBank.create(newQuestionBankData);

  // Duplicate questions if requested
  if (req.body.includeQuestions && originalQuestionBank.questions) {
    const originalQuestions = await Question.find({
      questionBank: originalQuestionBank._id
    });

    const questionPromises = originalQuestions.map(async (question) => {
      const newQuestionData = {
        ...question.toObject(),
        _id: undefined,
        questionBank: newQuestionBank._id,
        createdBy: req.user.id,
        organization: req.user.organization,
        timesUsed: 0,
        averageScore: 0,
        lastUsed: undefined,
        createdAt: undefined,
        updatedAt: undefined
      };

      return Question.create(newQuestionData);
    });

    await Promise.all(questionPromises);
  }

  // Update stats
  await newQuestionBank.updateStats();

  await newQuestionBank.populate('createdBy', 'name email avatar');
  await newQuestionBank.populate('course', 'title description');

  res.status(201).json({
    status: 'success',
    data: {
      questionBank: newQuestionBank
    }
  });
});