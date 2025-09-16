const { Quiz, QuizAttempt } = require('../models/Quiz');
const Course = require('../models/Course');
const { Question } = require('../models/Question');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

// Get all quizzes with filtering and pagination
const getAllQuizzes = catchAsync(async (req, res, next) => {
  let filter = {};

  // Filter by course if provided
  if (req.query.courseId) {
    filter.course = req.query.courseId;
  }

  // Only show published quizzes for non-instructors
  if (req.user.role === 'student') {
    filter.status = 'published';
    filter.isActive = true;
  }

  // For instructors, only show their own quizzes unless they're admin
  if (req.user.role === 'instructor' && !['org_admin', 'super_admin'].includes(req.user.role)) {
    filter.createdBy = req.user.id;
  }

  const features = new APIFeatures(Quiz.find(filter), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const quizzes = await features.query
    .populate('course', 'title')
    .populate('createdBy', 'name email')
    .populate('questionBank', 'name')
    .populate({
      path: 'questions',
      select: 'questionText questionType points difficulty'
    });

  const total = await Quiz.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    results: quizzes.length,
    total,
    data: {
      quizzes
    }
  });
});

// Get single quiz by ID
const getQuiz = catchAsync(async (req, res, next) => {
  const quiz = await Quiz.findById(req.params.id)
    .populate('course', 'title instructor')
    .populate('createdBy', 'name email')
    .populate('questionBank', 'name description')
    .populate({
      path: 'questions',
      select: 'questionText questionType options points difficulty explanation'
    });

  if (!quiz) {
    return next(new AppError('No quiz found with that ID', 404));
  }

  // Check if user has access to this quiz
  if (quiz.status !== 'published' &&
      req.user.role === 'student' &&
      quiz.createdBy._id.toString() !== req.user.id) {
    return next(new AppError('This quiz is not available', 403));
  }

  // For students taking quiz, hide correct answers
  if (req.user.role === 'student') {
    quiz.questions = quiz.questions.map(question => {
      const questionObj = question.toObject();
      delete questionObj.correctAnswer;
      delete questionObj.explanation;
      return questionObj;
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      quiz
    }
  });
});

// Create new quiz (Instructor/Admin only)
const createQuiz = catchAsync(async (req, res, next) => {
  // Verify course exists and user has access
  const course = await Course.findById(req.body.course);
  if (!course) {
    return next(new AppError('Course not found', 404));
  }

  // Check if user can create quiz for this course
  if (req.user.role === 'instructor' &&
      course.instructor.toString() !== req.user.id) {
    return next(new AppError('You can only create quizzes for your own courses', 403));
  }

  // Verify questions exist if provided
  if (req.body.questions && req.body.questions.length > 0) {
    const questions = await Question.find({ _id: { $in: req.body.questions } });
    if (questions.length !== req.body.questions.length) {
      return next(new AppError('Some questions not found', 404));
    }
  }

  const quizData = {
    ...req.body,
    createdBy: req.user.id,
    organization: req.user.organization
  };

  const quiz = await Quiz.create(quizData);

  await quiz.populate([
    { path: 'course', select: 'title' },
    { path: 'createdBy', select: 'name email' },
    { path: 'questions', select: 'questionText questionType points' }
  ]);

  res.status(201).json({
    status: 'success',
    data: {
      quiz
    }
  });
});

// Update quiz (Instructor/Admin only)
const updateQuiz = catchAsync(async (req, res, next) => {
  const quiz = await Quiz.findById(req.params.id);

  if (!quiz) {
    return next(new AppError('No quiz found with that ID', 404));
  }

  // Check permissions
  if (req.user.role === 'instructor' &&
      quiz.createdBy.toString() !== req.user.id) {
    return next(new AppError('You can only update your own quizzes', 403));
  }

  // Verify questions exist if provided
  if (req.body.questions && req.body.questions.length > 0) {
    const questions = await Question.find({ _id: { $in: req.body.questions } });
    if (questions.length !== req.body.questions.length) {
      return next(new AppError('Some questions not found', 404));
    }
  }

  const updatedQuiz = await Quiz.findByIdAndUpdate(
    req.params.id,
    { ...req.body, lastModified: new Date() },
    { new: true, runValidators: true }
  ).populate([
    { path: 'course', select: 'title' },
    { path: 'createdBy', select: 'name email' },
    { path: 'questions', select: 'questionText questionType points' }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      quiz: updatedQuiz
    }
  });
});

// Delete quiz (Instructor/Admin only)
const deleteQuiz = catchAsync(async (req, res, next) => {
  const quiz = await Quiz.findById(req.params.id);

  if (!quiz) {
    return next(new AppError('No quiz found with that ID', 404));
  }

  // Check permissions
  if (req.user.role === 'instructor' &&
      quiz.createdBy.toString() !== req.user.id) {
    return next(new AppError('You can only delete your own quizzes', 403));
  }

  // Check if quiz has attempts
  const attemptCount = await QuizAttempt.countDocuments({ quiz: req.params.id });
  if (attemptCount > 0) {
    return next(new AppError('Cannot delete quiz with existing attempts', 400));
  }

  await Quiz.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Start quiz attempt
const startQuizAttempt = catchAsync(async (req, res, next) => {
  const quiz = await Quiz.findById(req.params.id)
    .populate('questions', 'questionText questionType options points');

  if (!quiz) {
    return next(new AppError('No quiz found with that ID', 404));
  }

  if (quiz.status !== 'published' || !quiz.isActive) {
    return next(new AppError('This quiz is not available', 400));
  }

  // Check if user has exceeded max attempts
  const userAttempts = await QuizAttempt.countDocuments({
    quiz: req.params.id,
    user: req.user.id,
    status: 'completed'
  });

  if (userAttempts >= quiz.settings.maxAttempts) {
    return next(new AppError('Maximum attempts reached for this quiz', 400));
  }

  // Check if user has an active attempt
  const activeAttempt = await QuizAttempt.findOne({
    quiz: req.params.id,
    user: req.user.id,
    status: 'in_progress'
  });

  if (activeAttempt) {
    return res.status(200).json({
      status: 'success',
      data: {
        attemptId: activeAttempt._id,
        quiz: {
          ...quiz.toObject(),
          questions: quiz.questions.map(q => ({
            _id: q._id,
            questionText: q.questionText,
            questionType: q.questionType,
            options: q.options,
            points: q.points
          }))
        },
        timeRemaining: activeAttempt.startedAt && quiz.settings.timeLimit ?
          Math.max(0, (quiz.settings.timeLimit * 60) - Math.floor((Date.now() - activeAttempt.startedAt) / 1000)) : null
      }
    });
  }

  // Create new attempt
  const attempt = await QuizAttempt.create({
    quiz: req.params.id,
    user: req.user.id,
    maxScore: quiz.questions.reduce((sum, q) => sum + q.points, 0),
    ipAddress: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Prepare quiz data for student (hide correct answers)
  const quizForStudent = {
    ...quiz.toObject(),
    questions: quiz.questions.map(q => ({
      _id: q._id,
      questionText: q.questionText,
      questionType: q.questionType,
      options: q.options,
      points: q.points
    }))
  };

  res.status(200).json({
    status: 'success',
    data: {
      attemptId: attempt._id,
      quiz: quizForStudent,
      timeRemaining: quiz.settings.timeLimit ? quiz.settings.timeLimit * 60 : null
    }
  });
});

// Submit quiz answers
const submitQuiz = catchAsync(async (req, res, next) => {
  const { attemptId, answers } = req.body;

  const attempt = await QuizAttempt.findById(attemptId)
    .populate({
      path: 'quiz',
      populate: {
        path: 'questions',
        select: 'questionText questionType correctAnswer points'
      }
    });

  if (!attempt) {
    return next(new AppError('Quiz attempt not found', 404));
  }

  if (attempt.user.toString() !== req.user.id) {
    return next(new AppError('You can only submit your own quiz attempts', 403));
  }

  if (attempt.status === 'completed') {
    return next(new AppError('This quiz attempt has already been submitted', 400));
  }

  // Calculate scores
  const gradedAnswers = answers.map(answer => {
    const question = attempt.quiz.questions.find(q => q._id.toString() === answer.questionId);
    if (!question) {
      return {
        questionId: answer.questionId,
        answer: answer.answer,
        isCorrect: false,
        pointsAwarded: 0
      };
    }

    let isCorrect = false;
    let pointsAwarded = 0;

    // Grade based on question type
    switch (question.questionType) {
      case 'multiple_choice':
      case 'true_false':
        isCorrect = answer.answer === question.correctAnswer;
        pointsAwarded = isCorrect ? question.points : 0;
        break;
      case 'short_answer':
        // Basic string comparison for now - could be enhanced with fuzzy matching
        isCorrect = answer.answer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim();
        pointsAwarded = isCorrect ? question.points : 0;
        break;
      case 'essay':
        // Essays need manual grading
        isCorrect = false;
        pointsAwarded = 0;
        break;
      default:
        isCorrect = false;
        pointsAwarded = 0;
    }

    return {
      questionId: answer.questionId,
      answer: answer.answer,
      isCorrect,
      pointsAwarded
    };
  });

  // Update attempt
  attempt.answers = gradedAnswers;
  attempt.score = gradedAnswers.reduce((sum, answer) => sum + answer.pointsAwarded, 0);
  attempt.percentage = (attempt.score / attempt.maxScore) * 100;
  attempt.isPassed = attempt.percentage >= attempt.quiz.settings.passingScore;
  await attempt.submit();

  // Update quiz statistics
  await attempt.quiz.updateStats();

  res.status(200).json({
    status: 'success',
    data: {
      result: {
        score: attempt.score,
        maxScore: attempt.maxScore,
        percentage: attempt.percentage,
        isPassed: attempt.isPassed,
        timeSpent: attempt.timeSpent,
        answers: attempt.quiz.settings.showCorrectAnswers ? gradedAnswers : undefined
      }
    }
  });
});

// Get user's quiz attempts
const getQuizAttempts = catchAsync(async (req, res, next) => {
  const quiz = await Quiz.findById(req.params.id);
  if (!quiz) {
    return next(new AppError('No quiz found with that ID', 404));
  }

  const attempts = await QuizAttempt.find({
    quiz: req.params.id,
    user: req.user.id
  }).sort({ createdAt: -1 });

  res.status(200).json({
    status: 'success',
    results: attempts.length,
    data: {
      attempts
    }
  });
});

// Get quiz results and analytics (Instructor/Admin only)
const getQuizResults = catchAsync(async (req, res, next) => {
  const quiz = await Quiz.findById(req.params.id);

  if (!quiz) {
    return next(new AppError('No quiz found with that ID', 404));
  }

  // Check permissions
  if (req.user.role === 'instructor' &&
      quiz.createdBy.toString() !== req.user.id) {
    return next(new AppError('You can only view results for your own quizzes', 403));
  }

  const attempts = await QuizAttempt.find({
    quiz: req.params.id,
    status: 'completed'
  }).populate('user', 'name email').sort({ createdAt: -1 });

  // Calculate statistics
  const stats = {
    totalAttempts: attempts.length,
    averageScore: quiz.averageScore,
    passRate: quiz.passRate,
    averageTimeSpent: quiz.averageTimeSpent,
    highestScore: attempts.length > 0 ? Math.max(...attempts.map(a => a.percentage)) : 0,
    lowestScore: attempts.length > 0 ? Math.min(...attempts.map(a => a.percentage)) : 0
  };

  res.status(200).json({
    status: 'success',
    data: {
      stats,
      attempts
    }
  });
});

module.exports = {
  getAllQuizzes,
  getQuiz,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  startQuizAttempt,
  submitQuiz,
  getQuizAttempts,
  getQuizResults
};