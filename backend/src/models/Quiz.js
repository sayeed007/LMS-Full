const mongoose = require('mongoose');

// Answer schema for quiz attempts
const answerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  answer: {
    type: mongoose.Schema.Types.Mixed, // Can be string, array, or object depending on question type
    required: true
  },
  isCorrect: {
    type: Boolean,
    default: false
  },
  pointsAwarded: {
    type: Number,
    default: 0
  },
  timeSpent: {
    type: Number, // in seconds
    default: 0
  }
}, { _id: false });

// Quiz attempt schema
const quizAttemptSchema = new mongoose.Schema({
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  answers: [answerSchema],
  score: {
    type: Number,
    default: 0
  },
  maxScore: {
    type: Number,
    required: true
  },
  percentage: {
    type: Number,
    default: 0
  },
  isPassed: {
    type: Boolean,
    default: false
  },
  timeSpent: {
    type: Number, // in seconds
    default: 0
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  submittedAt: Date,
  status: {
    type: String,
    enum: ['in_progress', 'completed', 'abandoned'],
    default: 'in_progress'
  },
  ipAddress: String,
  userAgent: String
}, {
  timestamps: true
});

// Quiz settings schema
const quizSettingsSchema = new mongoose.Schema({
  // Time settings
  timeLimit: {
    type: Number, // in minutes
    default: 0 // 0 means no time limit
  },
  // Attempt settings
  maxAttempts: {
    type: Number,
    default: 3,
    min: [1, 'Must allow at least one attempt']
  },
  allowRetakes: {
    type: Boolean,
    default: true
  },
  // Scoring settings
  passingScore: {
    type: Number,
    default: 70,
    min: [0, 'Passing score cannot be negative'],
    max: [100, 'Passing score cannot exceed 100']
  },
  gradingMethod: {
    type: String,
    enum: ['highest', 'latest', 'average'],
    default: 'highest'
  },
  // Display settings
  showCorrectAnswers: {
    type: Boolean,
    default: true
  },
  showExplanations: {
    type: Boolean,
    default: true
  },
  showScoreImmediately: {
    type: Boolean,
    default: true
  },
  // Question settings
  randomizeQuestions: {
    type: Boolean,
    default: false
  },
  randomizeChoices: {
    type: Boolean,
    default: false
  },
  questionsPerPage: {
    type: Number,
    default: 1,
    min: [1, 'Must show at least one question per page']
  },
  // Access settings
  requirePassword: {
    type: Boolean,
    default: false
  },
  password: String,
  availableFrom: Date,
  availableUntil: Date,
  // Proctoring settings
  enableProctoring: {
    type: Boolean,
    default: false
  },
  preventCopyPaste: {
    type: Boolean,
    default: false
  },
  fullScreenRequired: {
    type: Boolean,
    default: false
  }
}, { _id: false });

// Main Quiz schema
const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Quiz title is required'],
    trim: true,
    maxlength: [100, 'Quiz title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Quiz description cannot exceed 500 characters']
  },
  instructions: {
    type: String,
    trim: true
  },
  // Associated entities
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Quiz must belong to a course']
  },
  questionBank: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QuestionBank'
  },
  chapter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chapter'
  },
  // Questions (can be from question bank or custom)
  questions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  }],
  // Creator info
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Quiz creator is required']
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization'
  },
  // Settings
  settings: {
    type: quizSettingsSchema,
    default: () => ({})
  },
  // Status and visibility
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Analytics
  totalAttempts: {
    type: Number,
    default: 0
  },
  averageScore: {
    type: Number,
    default: 0
  },
  passRate: {
    type: Number,
    default: 0
  },
  averageTimeSpent: {
    type: Number, // in minutes
    default: 0
  },
  // Metadata
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  estimatedDuration: {
    type: Number, // in minutes
    default: 0
  },
  thumbnail: String,
  lastModified: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
quizSchema.index({ course: 1 });
quizSchema.index({ questionBank: 1 });
quizSchema.index({ chapter: 1 });
quizSchema.index({ createdBy: 1 });
quizSchema.index({ status: 1 });
quizSchema.index({ isActive: 1 });
quizSchema.index({ tags: 1 });
quizSchema.index({ createdAt: -1 });
quizSchema.index({ title: 'text', description: 'text' });

// Quiz attempt indexes
quizAttemptSchema.index({ quiz: 1 });
quizAttemptSchema.index({ user: 1 });
quizAttemptSchema.index({ quiz: 1, user: 1 });
quizAttemptSchema.index({ status: 1 });
quizAttemptSchema.index({ createdAt: -1 });

// Virtuals
quizSchema.virtual('questionsCount').get(function() {
  return this.questions ? this.questions.length : 0;
});

quizSchema.virtual('maxScore').get(function() {
  // This would need to be calculated based on questions
  return this.questions ? this.questions.length * 1 : 0; // Assuming 1 point per question
});

// Pre-save middleware
quizSchema.pre('save', function(next) {
  this.lastModified = new Date();

  // Calculate estimated duration based on questions
  if (this.questions && this.questions.length > 0) {
    // Estimate 2 minutes per question if no time limit is set
    this.estimatedDuration = this.settings.timeLimit || (this.questions.length * 2);
  }

  next();
});

// Instance methods
quizSchema.methods.publish = function() {
  this.status = 'published';
  return this.save();
};

quizSchema.methods.archive = function() {
  this.status = 'archived';
  return this.save();
};

quizSchema.methods.addQuestion = function(questionId) {
  if (!this.questions.includes(questionId)) {
    this.questions.push(questionId);
  }
  return this.save();
};

quizSchema.methods.removeQuestion = function(questionId) {
  this.questions = this.questions.filter(q => q.toString() !== questionId.toString());
  return this.save();
};

quizSchema.methods.updateStats = async function() {
  const QuizAttempt = mongoose.model('QuizAttempt');

  const attempts = await QuizAttempt.find({
    quiz: this._id,
    status: 'completed'
  });

  this.totalAttempts = attempts.length;

  if (attempts.length > 0) {
    // Calculate average score
    const totalScore = attempts.reduce((sum, attempt) => sum + attempt.percentage, 0);
    this.averageScore = totalScore / attempts.length;

    // Calculate pass rate
    const passedAttempts = attempts.filter(attempt => attempt.isPassed).length;
    this.passRate = (passedAttempts / attempts.length) * 100;

    // Calculate average time spent
    const totalTime = attempts.reduce((sum, attempt) => sum + attempt.timeSpent, 0);
    this.averageTimeSpent = (totalTime / attempts.length) / 60; // Convert to minutes
  }

  return this.save();
};

// Quiz attempt instance methods
quizAttemptSchema.methods.submit = function() {
  this.status = 'completed';
  this.submittedAt = new Date();
  this.timeSpent = Math.floor((this.submittedAt - this.startedAt) / 1000); // in seconds

  // Calculate score
  let totalPoints = 0;
  let maxPoints = 0;

  this.answers.forEach(answer => {
    totalPoints += answer.pointsAwarded;
    maxPoints += answer.pointsAwarded; // This should be the max possible points for the question
  });

  this.score = totalPoints;
  this.maxScore = maxPoints || this.answers.length; // Fallback
  this.percentage = maxPoints > 0 ? (totalPoints / maxPoints) * 100 : 0;

  return this.save();
};

// Static methods
quizSchema.statics.findByCourse = function(courseId, options = {}) {
  const query = { course: courseId };

  if (options.status) {
    query.status = options.status;
  }

  return this.find(query)
    .populate('createdBy', 'name email')
    .populate('questionBank', 'name')
    .populate('questions')
    .sort({ createdAt: -1 });
};

quizAttemptSchema.statics.findByUser = function(userId, options = {}) {
  const query = { user: userId };

  if (options.status) {
    query.status = options.status;
  }

  return this.find(query)
    .populate('quiz', 'title description')
    .sort({ createdAt: -1 });
};

const Quiz = mongoose.model('Quiz', quizSchema);
const QuizAttempt = mongoose.model('QuizAttempt', quizAttemptSchema);

module.exports = { Quiz, QuizAttempt };