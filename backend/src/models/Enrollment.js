const mongoose = require('mongoose');

// Individual lesson progress schema
const lessonProgressSchema = new mongoose.Schema({
  lesson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  timeSpent: {
    type: Number, // in seconds
    default: 0
  },
  completedAt: Date,
  lastAccessedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

// Certificate schema
const certificateSchema = new mongoose.Schema({
  issued: {
    type: Boolean,
    default: false
  },
  issuedAt: Date,
  certificateId: {
    type: String,
    unique: true,
    sparse: true
  },
  downloadUrl: String,
  validUntil: Date
}, { _id: false });

// Rating schema
const ratingSchema = new mongoose.Schema({
  value: {
    type: Number,
    required: true,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  review: {
    type: String,
    maxlength: [1000, 'Review cannot exceed 1000 characters']
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  isPublic: {
    type: Boolean,
    default: true
  }
}, { _id: false });

// Main enrollment schema
const enrollmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required for enrollment']
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course is required for enrollment']
  },
  enrolledAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'dropped', 'suspended'],
    default: 'active'
  },
  // Progress tracking
  progress: {
    completedLessons: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson'
    }],
    currentLesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson'
    },
    completionPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    timeSpent: {
      type: Number, // total time in seconds
      default: 0
    },
    lastAccessed: {
      type: Date,
      default: Date.now
    }
  },
  // Detailed lesson progress
  lessonProgress: [lessonProgressSchema],
  // Assessment scores
  quizScores: [{
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz'
    },
    bestScore: {
      type: Number,
      default: 0
    },
    attempts: {
      type: Number,
      default: 0
    },
    passed: {
      type: Boolean,
      default: false
    },
    lastAttemptAt: Date
  }],
  // Assignment submissions
  assignmentSubmissions: [{
    assignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment'
    },
    submitted: {
      type: Boolean,
      default: false
    },
    submittedAt: Date,
    grade: Number,
    feedback: String,
    gradedAt: Date,
    gradedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  // Certificate information
  certificate: certificateSchema,
  // Course rating
  rating: ratingSchema,
  // Payment information
  payment: {
    amount: {
      type: Number,
      default: 0
    },
    currency: {
      type: String,
      default: 'USD'
    },
    paymentMethod: String,
    transactionId: String,
    paidAt: Date
  },
  // Enrollment metadata
  enrollmentSource: {
    type: String,
    enum: ['self', 'admin', 'bulk', 'invitation', 'organization'],
    default: 'self'
  },
  enrolledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // Access control
  accessExpiresAt: Date,
  // Notes and flags
  notes: [{
    text: String,
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
enrollmentSchema.index({ user: 1, course: 1 }, { unique: true });
enrollmentSchema.index({ user: 1 });
enrollmentSchema.index({ course: 1 });
enrollmentSchema.index({ status: 1 });
enrollmentSchema.index({ enrolledAt: -1 });
enrollmentSchema.index({ 'progress.lastAccessed': -1 });
enrollmentSchema.index({ 'certificate.issued': 1 });
enrollmentSchema.index({ createdAt: -1 });

// Virtual for enrollment duration
enrollmentSchema.virtual('enrollmentDuration').get(function() {
  return this.status === 'completed' && this.completedAt ?
    this.completedAt - this.enrolledAt :
    Date.now() - this.enrolledAt;
});

// Virtual for average quiz score
enrollmentSchema.virtual('averageQuizScore').get(function() {
  if (!this.quizScores || this.quizScores.length === 0) return 0;
  const total = this.quizScores.reduce((sum, quiz) => sum + quiz.bestScore, 0);
  return total / this.quizScores.length;
});

// Virtual for completion status
enrollmentSchema.virtual('isCompleted').get(function() {
  return this.status === 'completed' || this.progress.completionPercentage >= 100;
});

// Pre-save middleware
enrollmentSchema.pre('save', function(next) {
  // Update last accessed when progress changes
  if (this.isModified('progress') || this.isModified('lessonProgress')) {
    this.progress.lastAccessed = new Date();
  }

  // Auto-complete enrollment when 100% progress is reached
  if (this.progress.completionPercentage >= 100 && this.status === 'active') {
    this.status = 'completed';
    this.completedAt = new Date();
  }

  // Generate certificate ID if certificate is being issued
  if (this.certificate && this.certificate.issued && !this.certificate.certificateId) {
    this.certificate.certificateId = `CERT-${this._id}-${Date.now()}`;
    this.certificate.issuedAt = new Date();
    // Certificate valid for 5 years
    this.certificate.validUntil = new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000);
  }

  next();
});

// Instance methods
enrollmentSchema.methods.updateProgress = function(lessonId, timeSpent = 0) {
  // Update lesson progress
  const existingProgress = this.lessonProgress.find(
    lp => lp.lesson.toString() === lessonId.toString()
  );

  if (existingProgress) {
    existingProgress.completed = true;
    existingProgress.completedAt = new Date();
    existingProgress.timeSpent += timeSpent;
    existingProgress.lastAccessedAt = new Date();
  } else {
    this.lessonProgress.push({
      lesson: lessonId,
      completed: true,
      timeSpent,
      completedAt: new Date(),
      lastAccessedAt: new Date()
    });
  }

  // Update overall progress
  if (!this.progress.completedLessons.includes(lessonId)) {
    this.progress.completedLessons.push(lessonId);
  }

  this.progress.currentLesson = lessonId;
  this.progress.timeSpent += timeSpent;
  this.progress.lastAccessed = new Date();

  return this.save();
};

enrollmentSchema.methods.calculateProgress = async function() {
  const Course = mongoose.model('Course');
  const course = await Course.findById(this.course).populate('chapters.lessons');

  if (!course) return 0;

  let totalLessons = 0;
  course.chapters.forEach(chapter => {
    totalLessons += chapter.lessons.length;
  });

  if (totalLessons === 0) return 0;

  const completedCount = this.progress.completedLessons.length;
  this.progress.completionPercentage = Math.round((completedCount / totalLessons) * 100);

  return this.progress.completionPercentage;
};

enrollmentSchema.methods.addQuizScore = function(quizId, score, passed) {
  const existingQuiz = this.quizScores.find(qs => qs.quiz.toString() === quizId.toString());

  if (existingQuiz) {
    existingQuiz.bestScore = Math.max(existingQuiz.bestScore, score);
    existingQuiz.attempts += 1;
    existingQuiz.passed = existingQuiz.passed || passed;
    existingQuiz.lastAttemptAt = new Date();
  } else {
    this.quizScores.push({
      quiz: quizId,
      bestScore: score,
      attempts: 1,
      passed,
      lastAttemptAt: new Date()
    });
  }

  return this.save();
};

enrollmentSchema.methods.submitAssignment = function(assignmentId, submissionData) {
  const existingSubmission = this.assignmentSubmissions.find(
    as => as.assignment.toString() === assignmentId.toString()
  );

  if (existingSubmission) {
    existingSubmission.submitted = true;
    existingSubmission.submittedAt = new Date();
  } else {
    this.assignmentSubmissions.push({
      assignment: assignmentId,
      submitted: true,
      submittedAt: new Date()
    });
  }

  return this.save();
};

enrollmentSchema.methods.gradeAssignment = function(assignmentId, grade, feedback, graderId) {
  const submission = this.assignmentSubmissions.find(
    as => as.assignment.toString() === assignmentId.toString()
  );

  if (submission) {
    submission.grade = grade;
    submission.feedback = feedback;
    submission.gradedAt = new Date();
    submission.gradedBy = graderId;
  }

  return this.save();
};

enrollmentSchema.methods.issueCertificate = function() {
  if (this.status !== 'completed') {
    throw new Error('Cannot issue certificate for incomplete course');
  }

  this.certificate = {
    issued: true,
    issuedAt: new Date(),
    certificateId: `CERT-${this._id}-${Date.now()}`,
    validUntil: new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000) // 5 years
  };

  return this.save();
};

enrollmentSchema.methods.addRating = function(rating, review) {
  this.rating = {
    value: rating,
    review,
    submittedAt: new Date()
  };

  return this.save();
};

// Static methods
enrollmentSchema.statics.findByUser = function(userId, options = {}) {
  const query = { user: userId };

  if (options.status) {
    query.status = options.status;
  }

  if (options.isActive !== undefined) {
    query.isActive = options.isActive;
  }

  return this.find(query)
    .populate('course', 'title thumbnail instructor duration price')
    .populate('user', 'name email avatar')
    .sort({ enrolledAt: -1 });
};

enrollmentSchema.statics.findByCourse = function(courseId, options = {}) {
  const query = { course: courseId };

  if (options.status) {
    query.status = options.status;
  }

  return this.find(query)
    .populate('user', 'name email avatar')
    .populate('course', 'title')
    .sort({ enrolledAt: -1 });
};

enrollmentSchema.statics.getStats = async function(filters = {}) {
  const matchStage = { isActive: true };

  if (filters.courseId) {
    matchStage.course = mongoose.Types.ObjectId(filters.courseId);
  }

  if (filters.userId) {
    matchStage.user = mongoose.Types.ObjectId(filters.userId);
  }

  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalEnrollments: { $sum: 1 },
        activeEnrollments: {
          $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
        },
        completedEnrollments: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        droppedEnrollments: {
          $sum: { $cond: [{ $eq: ['$status', 'dropped'] }, 1, 0] }
        },
        averageTimeSpent: { $avg: '$progress.timeSpent' },
        enrollmentsThisMonth: {
          $sum: {
            $cond: [
              {
                $gte: ['$enrolledAt', new Date(new Date().getFullYear(), new Date().getMonth(), 1)]
              },
              1,
              0
            ]
          }
        },
        completionsThisMonth: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$status', 'completed'] },
                  { $gte: ['$completedAt', new Date(new Date().getFullYear(), new Date().getMonth(), 1)] }
                ]
              },
              1,
              0
            ]
          }
        }
      }
    }
  ]);

  const result = stats[0] || {
    totalEnrollments: 0,
    activeEnrollments: 0,
    completedEnrollments: 0,
    droppedEnrollments: 0,
    averageTimeSpent: 0,
    enrollmentsThisMonth: 0,
    completionsThisMonth: 0
  };

  result.completionRate = result.totalEnrollments > 0 ?
    (result.completedEnrollments / result.totalEnrollments) * 100 : 0;

  return result;
};

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);

module.exports = Enrollment;