const Question = require('../models/Question');
const QuestionBank = require('../models/QuestionBank');
const QuestionVersion = require('../models/QuestionVersion');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');
const {
  exportToJSON,
  exportToCSV,
  exportToQTI,
  importFromJSON,
  importFromCSV,
  getExportFormat,
  getMimeType
} = require('../utils/questionExporter');

// Get all questions with filtering
exports.getAllQuestions = catchAsync(async (req, res, next) => {
  let filter = {};

  // Filter by question bank
  if (req.query.questionBankId) {
    filter.questionBank = req.query.questionBankId;
  }

  // Filter by course
  if (req.query.courseId) {
    filter.course = req.query.courseId;
  }

  // Filter by section
  if (req.query.sectionId) {
    filter.section = req.query.sectionId;
  }

  // Filter by type
  if (req.query.type) {
    filter.type = req.query.type;
  }

  // Filter by difficulty
  if (req.query.difficulty) {
    filter.difficulty = req.query.difficulty;
  }

  // Filter by tags
  if (req.query.tags) {
    const tags = req.query.tags.split(',');
    filter.tags = { $in: tags };
  }

  // Filter by user's own questions if requested
  if (req.query.my === 'true') {
    filter.createdBy = req.user.id;
  }

  // Only show active questions by default
  if (req.query.includeInactive !== 'true') {
    filter.isActive = true;
  }

  // Filter by visibility based on user role
  if (!['org_admin', 'super_admin'].includes(req.user.role)) {
    filter.$or = [
      { isPublic: true },
      { createdBy: req.user.id },
      { organization: req.user.organization }
    ];
  }

  const features = new APIFeatures(Question.find(filter), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const questions = await features.query
    .populate('createdBy', 'name email avatar')
    .populate({
      path: 'questionBank',
      select: 'name course',
      populate: {
        path: 'course',
        select: 'title'
      }
    });

  res.status(200).json({
    status: 'success',
    results: questions.length,
    data: {
      questions
    }
  });
});

// Get question by ID
exports.getQuestion = catchAsync(async (req, res, next) => {
  const question = await Question.findById(req.params.id)
    .populate('createdBy', 'name email avatar')
    .populate({
      path: 'questionBank',
      select: 'name course',
      populate: {
        path: 'course',
        select: 'title'
      }
    });

  if (!question) {
    return next(new AppError('No question found with that ID', 404));
  }

  // Check visibility permissions
  if (!question.isPublic &&
      question.createdBy._id.toString() !== req.user.id &&
      question.organization?.toString() !== req.user.organization?.toString() &&
      !['org_admin', 'super_admin'].includes(req.user.role)) {
    return next(new AppError('You do not have permission to view this question', 403));
  }

  res.status(200).json({
    status: 'success',
    data: {
      question
    }
  });
});

// Create new question
exports.createQuestion = catchAsync(async (req, res, next) => {
  // Validate question bank exists
  const questionBank = await QuestionBank.findById(req.body.questionBank);
  if (!questionBank) {
    return next(new AppError('Question bank not found', 404));
  }

  // Check if user can add questions to this question bank
  if (questionBank.createdBy.toString() !== req.user.id &&
      !['org_admin', 'super_admin'].includes(req.user.role)) {
    return next(new AppError('You do not have permission to add questions to this question bank', 403));
  }

  // Add creator and organization info
  const questionData = {
    ...req.body,
    createdBy: req.user.id,
    organization: req.user.organization
  };

  const question = await Question.create(questionData);

  // Create initial version snapshot
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
    'Initial version'
  );

  // Update question bank stats
  await questionBank.updateStats();

  // Populate the response
  await question.populate('createdBy', 'name email avatar');
  await question.populate({
    path: 'questionBank',
    select: 'name course',
    populate: {
      path: 'course',
      select: 'title'
    }
  });

  res.status(201).json({
    status: 'success',
    data: {
      question
    }
  });
});

// Update question
exports.updateQuestion = catchAsync(async (req, res, next) => {
  const question = await Question.findById(req.params.id);

  if (!question) {
    return next(new AppError('No question found with that ID', 404));
  }

  // Check permissions
  if (question.createdBy.toString() !== req.user.id &&
      !['org_admin', 'super_admin'].includes(req.user.role)) {
    return next(new AppError('You do not have permission to edit this question', 403));
  }

  // Don't allow changing certain fields
  delete req.body.createdBy;
  delete req.body.organization;
  delete req.body.questionBank;
  delete req.body.course;
  delete req.body.__v; // Ensure version key is not updated manually

  const updatedQuestion = await Question.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  ).populate('createdBy', 'name email avatar')
   .populate({
     path: 'questionBank',
     select: 'name course',
     populate: {
       path: 'course',
       select: 'title'
     }
   });

  // Create version snapshot after update
  const versionData = {
    text: updatedQuestion.text,
    type: updatedQuestion.type,
    choices: updatedQuestion.choices,
    correctAnswer: updatedQuestion.correctAnswer,
    explanation: updatedQuestion.explanation,
    difficulty: updatedQuestion.difficulty,
    points: updatedQuestion.points,
    timeLimit: updatedQuestion.timeLimit,
    tags: updatedQuestion.tags,
    attachments: updatedQuestion.attachments
  };

  await QuestionVersion.createVersion(
    updatedQuestion._id,
    versionData,
    req.user.id,
    req.body.changeDescription || null
  );

  // Update question bank stats
  const questionBank = await QuestionBank.findById(question.questionBank);
  if (questionBank) {
    await questionBank.updateStats();
  }

  res.status(200).json({
    status: 'success',
    data: {
      question: updatedQuestion
    }
  });
});

// Delete question
exports.deleteQuestion = catchAsync(async (req, res, next) => {
  const question = await Question.findById(req.params.id);

  if (!question) {
    return next(new AppError('No question found with that ID', 404));
  }

  // Check permissions
  if (question.createdBy.toString() !== req.user.id &&
      !['org_admin', 'super_admin'].includes(req.user.role)) {
    return next(new AppError('You do not have permission to delete this question', 403));
  }

  await Question.findByIdAndDelete(req.params.id);

  // Update question bank stats
  const questionBank = await QuestionBank.findById(question.questionBank);
  if (questionBank) {
    await questionBank.updateStats();
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Bulk create questions
exports.bulkCreateQuestions = catchAsync(async (req, res, next) => {
  const { questionBankId, questions } = req.body;

  if (!questions || !Array.isArray(questions) || questions.length === 0) {
    return next(new AppError('Questions array is required and cannot be empty', 400));
  }

  // Validate question bank exists
  const questionBank = await QuestionBank.findById(questionBankId);
  if (!questionBank) {
    return next(new AppError('Question bank not found', 404));
  }

  // Check permissions
  if (questionBank.createdBy.toString() !== req.user.id &&
      !['org_admin', 'super_admin'].includes(req.user.role)) {
    return next(new AppError('You do not have permission to add questions to this question bank', 403));
  }

  // Process questions
  const questionsData = questions.map(q => ({
    ...q,
    questionBank: questionBankId,
    createdBy: req.user.id,
    organization: req.user.organization
  }));

  const createdQuestions = await Question.insertMany(questionsData);

  // Create initial versions for each question
  for (const question of createdQuestions) {
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
      'Initial version'
    );
  }

  // Update question bank stats
  await questionBank.updateStats();

  res.status(201).json({
    status: 'success',
    results: createdQuestions.length,
    data: {
      questions: createdQuestions
    }
  });
});

// Duplicate question
exports.duplicateQuestion = catchAsync(async (req, res, next) => {
  const originalQuestion = await Question.findById(req.params.id);

  if (!originalQuestion) {
    return next(new AppError('No question found with that ID', 404));
  }

  // Check if user can view the original
  if (!originalQuestion.isPublic &&
      originalQuestion.createdBy.toString() !== req.user.id &&
      originalQuestion.organization?.toString() !== req.user.organization?.toString() &&
      !['org_admin', 'super_admin'].includes(req.user.role)) {
    return next(new AppError('You do not have permission to duplicate this question', 403));
  }

  const originalObj = originalQuestion.toObject();

  // Create new question data cleaning internal fields
  const newQuestionData = {
    ...originalObj,
    _id: undefined,
    id: undefined,
    text: `${originalQuestion.text} (Copy)`,
    createdBy: req.user.id,
    organization: req.user.organization,
    timesUsed: 0,
    averageScore: 0,
    lastUsed: undefined,
    createdAt: undefined,
    updatedAt: undefined,
    __v: undefined
  };
  
  // Clean subdocument IDs to ensure new ones are generated
  if (newQuestionData.choices) {
    newQuestionData.choices = newQuestionData.choices.map(c => {
      const choice = { ...c };
      delete choice._id;
      delete choice.id;
      return choice;
    });
  }
  
  if (newQuestionData.attachments) {
    newQuestionData.attachments = newQuestionData.attachments.map(a => {
      const att = { ...a };
      delete att._id;
      delete att.id;
      return att;
    });
  }

  // Handle target question bank and section
  if (req.body.questionBankId) {
    const targetQuestionBank = await QuestionBank.findById(req.body.questionBankId);
    if (!targetQuestionBank) {
      return next(new AppError('Target question bank not found', 404));
    }

    // Check permissions for target question bank
    if (targetQuestionBank.createdBy.toString() !== req.user.id &&
        !['org_admin', 'super_admin'].includes(req.user.role)) {
      return next(new AppError('You do not have permission to add questions to the target question bank', 403));
    }

    newQuestionData.questionBank = req.body.questionBankId;
  }
  
  // Handle section assignment (update or clear)
  if (req.body.sectionId) {
    newQuestionData.bankSection = req.body.sectionId;
  } else if (req.body.questionBankId && req.body.questionBankId !== originalObj.questionBank.toString()) {
    // If moving to a different bank and no section specified, clear the section
    // to avoid pointing to a section in the old bank
    newQuestionData.bankSection = undefined;
  }

  const newQuestion = await Question.create(newQuestionData);

  // Update question bank stats
  const questionBank = await QuestionBank.findById(newQuestion.questionBank);
  if (questionBank) {
    await questionBank.updateStats();
  }

  await newQuestion.populate('createdBy', 'name email avatar');
  await newQuestion.populate({
    path: 'questionBank',
    select: 'name course',
    populate: {
      path: 'course',
      select: 'title'
    }
  });

  res.status(201).json({
    status: 'success',
    data: {
      question: newQuestion
    }
  });
});

// Get questions by course
exports.getQuestionsByCourse = catchAsync(async (req, res, next) => {
  const questions = await Question.findByCourse(req.params.courseId);

  res.status(200).json({
    status: 'success',
    results: questions.length,
    data: {
      questions
    }
  });
});

// Get questions by question bank
exports.getQuestionsByQuestionBank = catchAsync(async (req, res, next) => {
  const filter = {
    questionBank: req.params.questionBankId,
    isActive: true
  };

  // Filter by section if provided
  if (req.query.sectionId) {
    filter.bankSection = req.query.sectionId;
  }

  const questions = await Question.find(filter)
    .populate('createdBy', 'name email avatar')
    .sort({ order: 1, createdAt: 1 }); // Sort by order first, then createdAt as fallback

  res.status(200).json({
    status: 'success',
    results: questions.length,
    data: {
      questions
    }
  });
});

// Search questions
exports.searchQuestions = catchAsync(async (req, res, next) => {
  const { q, type, difficulty, tags } = req.query;

  if (!q) {
    return next(new AppError('Search query is required', 400));
  }

  let filter = {
    $text: { $search: q },
    isActive: true
  };

  // Add additional filters
  if (type) filter.type = type;
  if (difficulty) filter.difficulty = difficulty;
  if (tags) filter.tags = { $in: tags.split(',') };

  // Filter by visibility
  if (!['org_admin', 'super_admin'].includes(req.user.role)) {
    filter.$or = [
      { isPublic: true },
      { createdBy: req.user.id },
      { organization: req.user.organization }
    ];
  }

  const questions = await Question.find(filter)
    .populate('createdBy', 'name email avatar')
    .populate({
      path: 'questionBank',
      select: 'name course',
      populate: {
        path: 'course',
        select: 'title'
      }
    })
    .sort({ score: { $meta: 'textScore' } })
    .limit(50); // Limit search results

  res.status(200).json({
    status: 'success',
    results: questions.length,
    data: {
      questions
    }
  });
});

// Export questions from a question bank
exports.exportQuestions = catchAsync(async (req, res, next) => {
  const { questionBankId } = req.params;
  const { format = 'json', includeMetadata = 'true' } = req.query;

  // Verify question bank exists
  const questionBank = await QuestionBank.findById(questionBankId);
  if (!questionBank) {
    return next(new AppError('Question bank not found', 404));
  }

  // Check permissions
  if (questionBank.createdBy.toString() !== req.user.id &&
      !['org_admin', 'super_admin'].includes(req.user.role)) {
    return next(new AppError('You do not have permission to export from this question bank', 403));
  }

  // Get all questions from the question bank
  const questions = await Question.find({
    questionBank: questionBankId,
    isActive: true
  })
    .populate('createdBy', 'name email')
    .lean();

  if (questions.length === 0) {
    return next(new AppError('No questions found in this question bank', 404));
  }

  // Generate export based on format
  const exportFormat = getExportFormat(format);
  let exportData;
  let filename;
  let mimeType;

  const options = {
    includeMetadata: includeMetadata === 'true',
    includeIds: true
  };

  switch (exportFormat) {
    case 'csv':
      exportData = exportToCSV(questions, options);
      filename = `questions_${questionBankId}_${Date.now()}.csv`;
      mimeType = getMimeType('csv');
      break;

    case 'qti':
      exportData = exportToQTI(questions, {
        assessmentTitle: questionBank.name,
        assessmentIdentifier: questionBankId
      });
      filename = `questions_${questionBankId}_${Date.now()}.xml`;
      mimeType = getMimeType('qti');
      break;

    case 'json':
    default:
      exportData = exportToJSON(questions, options);
      filename = `questions_${questionBankId}_${Date.now()}.json`;
      mimeType = getMimeType('json');
  }

  // Set headers for file download
  res.setHeader('Content-Type', mimeType);
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

  res.send(exportData);
});

// Import questions to a question bank
exports.importQuestions = catchAsync(async (req, res, next) => {
  const { questionBankId } = req.params;
  const { format = 'json', data } = req.body;

  if (!data) {
    return next(new AppError('Import data is required', 400));
  }

  // Verify question bank exists
  const questionBank = await QuestionBank.findById(questionBankId);
  if (!questionBank) {
    return next(new AppError('Question bank not found', 404));
  }

  // Check permissions
  if (questionBank.createdBy.toString() !== req.user.id &&
      !['org_admin', 'super_admin'].includes(req.user.role)) {
    return next(new AppError('You do not have permission to import to this question bank', 403));
  }

  // Parse import data based on format
  let questions;
  const importFormat = getExportFormat(format);

  try {
    switch (importFormat) {
      case 'csv':
        questions = importFromCSV(data);
        break;

      case 'json':
      default:
        questions = importFromJSON(data);
    }
  } catch (error) {
    return next(new AppError(`Import failed: ${error.message}`, 400));
  }

  if (!questions || questions.length === 0) {
    return next(new AppError('No valid questions found in import data', 400));
  }

  // Add question bank and user info to each question
  const questionsData = questions.map(q => ({
    ...q,
    questionBank: questionBankId,
    course: questionBank.course,
    createdBy: req.user.id,
    organization: req.user.organization
  }));

  // Create questions
  const createdQuestions = await Question.insertMany(questionsData, { ordered: false });

  // Create initial versions for each question
  for (const question of createdQuestions) {
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
      'Initial version (imported)'
    );
  }

  // Update question bank stats
  await questionBank.updateStats();

  res.status(201).json({
    status: 'success',
    message: `Successfully imported ${createdQuestions.length} questions`,
    data: {
      importedCount: createdQuestions.length,
      totalProvided: questions.length,
      questions: createdQuestions.map(q => ({
        _id: q._id,
        text: q.text,
        type: q.type
      }))
    }
  });
});