const mongoose = require('mongoose');

// Assignment submission schema
const submissionSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  content: {
    type: String,
    required: function() {
      return this.submissionType === 'text';
    }
  },
  files: [{
    filename: String,
    originalName: String,
    url: String,
    size: Number, // in bytes
    mimeType: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  url: {
    type: String,
    required: function() {
      return this.submissionType === 'url';
    }
  },
  status: {
    type: String,
    enum: ['submitted', 'late', 'graded', 'returned'],
    default: 'submitted'
  },
  grade: {
    score: {
      type: Number,
      min: 0
    },
    maxScore: {
      type: Number,
      min: 0
    },
    percentage: {
      type: Number,
      min: 0,
      max: 100
    },
    feedback: String,
    gradedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    gradedAt: Date
  },
  attempts: {
    type: Number,
    default: 1
  },
  isLate: {
    type: Boolean,
    default: false
  },
  plagiarismCheck: {
    checked: {
      type: Boolean,
      default: false
    },
    score: Number, // 0-100, higher means more likely plagiarized
    report: String
  }
}, {
  timestamps: true
});

// Main assignment schema
const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Assignment title is required'],
    trim: true,
    maxlength: [200, 'Assignment title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Assignment description is required'],
    trim: true,
    maxlength: [2000, 'Assignment description cannot exceed 2000 characters']
  },
  instructions: {
    type: String,
    required: [true, 'Assignment instructions are required'],
    maxlength: [5000, 'Assignment instructions cannot exceed 5000 characters']
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Assignment must belong to a course']
  },
  lesson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson'
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Assignment must have an instructor']
  },
  // Submission settings
  submissionType: {
    type: String,
    enum: ['text', 'file', 'url', 'code'],
    required: [true, 'Submission type is required'],
    default: 'text'
  },
  allowedFileTypes: [{
    type: String,
    lowercase: true
  }],
  maxFileSize: {
    type: Number, // in MB
    default: 10
  },
  maxFiles: {
    type: Number,
    default: 1,
    min: 1,
    max: 10
  },
  // Scoring
  maxScore: {
    type: Number,
    required: [true, 'Maximum score is required'],
    default: 100,
    min: 1
  },
  passingScore: {
    type: Number,
    min: 0
  },
  // Timing
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  availableFrom: {
    type: Date,
    default: Date.now
  },
  availableUntil: Date,
  // Submission rules
  allowLateSubmissions: {
    type: Boolean,
    default: true
  },
  latePenalty: {
    type: Number, // percentage deduction per day
    default: 10,
    min: 0,
    max: 100
  },
  maxLateDays: {
    type: Number,
    default: 3,
    min: 0
  },
  maxAttempts: {
    type: Number,
    default: 1,
    min: 1
  },
  // Auto-grading (for code assignments)
  autoGrading: {
    enabled: {
      type: Boolean,
      default: false
    },
    testCases: [{
      input: String,
      expectedOutput: String,
      points: {
        type: Number,
        default: 1
      },
      description: String
    }],
    language: {
      type: String,
      enum: ['javascript', 'python', 'java', 'cpp', 'c', 'go', 'rust'],
      default: 'javascript'
    },
    timeout: {
      type: Number, // in seconds
      default: 30
    }
  },
  // Resources
  attachments: [{
    filename: String,
    originalName: String,
    url: String,
    size: Number,
    mimeType: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Settings
  settings: {
    anonymousGrading: {
      type: Boolean,
      default: false
    },
    showGradeToStudent: {
      type: Boolean,
      default: true
    },
    allowPeerReview: {
      type: Boolean,
      default: false
    },
    requireOriginalWork: {
      type: Boolean,
      default: true
    },
    plagiarismCheck: {
      type: Boolean,
      default: false
    }
  },
  // Submissions
  submissions: [submissionSchema],
  // Status
  isPublished: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Analytics
  stats: {
    totalSubmissions: {
      type: Number,
      default: 0
    },
    gradedSubmissions: {
      type: Number,
      default: 0
    },
    averageScore: {
      type: Number,
      default: 0
    },
    averageGradingTime: {
      type: Number, // in hours
      default: 0
    }
  },
  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
assignmentSchema.index({ course: 1 });
assignmentSchema.index({ instructor: 1 });
assignmentSchema.index({ dueDate: 1 });
assignmentSchema.index({ isPublished: 1, isActive: 1 });
assignmentSchema.index({ 'submissions.student': 1 });
assignmentSchema.index({ createdAt: -1 });

// Virtual for submission count
assignmentSchema.virtual('submissionCount').get(function () {
  return this.submissions ? this.submissions.length : 0;
});

// Virtual for overdue status
assignmentSchema.virtual('isOverdue').get(function () {
  return new Date() > this.dueDate;
});

// Virtual for average score
assignmentSchema.virtual('averageSubmissionScore').get(function () {
  if (!this.submissions || this.submissions.length === 0) return 0;

  const gradedSubmissions = this.submissions.filter(s => s.grade && s.grade.score !== undefined);
  if (gradedSubmissions.length === 0) return 0;

  const totalScore = gradedSubmissions.reduce((sum, s) => sum + s.grade.score, 0);
  return totalScore / gradedSubmissions.length;
});

// Pre-save middleware to update stats
assignmentSchema.pre('save', function (next) {
  if (this.submissions) {
    this.stats.totalSubmissions = this.submissions.length;
    this.stats.gradedSubmissions = this.submissions.filter(s => s.grade && s.grade.score !== undefined).length;

    // Calculate average score
    const gradedSubmissions = this.submissions.filter(s => s.grade && s.grade.score !== undefined);
    if (gradedSubmissions.length > 0) {
      const totalScore = gradedSubmissions.reduce((sum, s) => sum + s.grade.score, 0);
      this.stats.averageScore = totalScore / gradedSubmissions.length;
    }
  }

  // Set passing score to 70% if not provided
  if (!this.passingScore) {
    this.passingScore = Math.ceil(this.maxScore * 0.7);
  }

  next();
});

// Instance methods
assignmentSchema.methods.submitAssignment = function (studentId, submissionData) {
  // Check if assignment is still accepting submissions
  if (!this.isPublished || !this.isActive) {
    throw new Error('Assignment is not available for submission');
  }

  // Check if due date has passed and late submissions are not allowed
  const now = new Date();
  if (now > this.dueDate && !this.allowLateSubmissions) {
    throw new Error('Assignment submission deadline has passed');
  }

  // Check existing submissions for this student
  const existingSubmissions = this.submissions.filter(s => s.student.toString() === studentId.toString());
  if (existingSubmissions.length >= this.maxAttempts) {
    throw new Error('Maximum submission attempts exceeded');
  }

  // Create new submission
  const submission = {
    ...submissionData,
    student: studentId,
    isLate: now > this.dueDate,
    attempts: existingSubmissions.length + 1
  };

  this.submissions.push(submission);
  return this.save();
};

assignmentSchema.methods.gradeSubmission = function (submissionId, gradeData, graderId) {
  const submission = this.submissions.id(submissionId);
  if (!submission) {
    throw new Error('Submission not found');
  }

  submission.grade = {
    ...gradeData,
    gradedBy: graderId,
    gradedAt: new Date(),
    percentage: (gradeData.score / this.maxScore) * 100
  };

  submission.status = 'graded';
  return this.save();
};

assignmentSchema.methods.getStudentSubmission = function (studentId) {
  return this.submissions.find(s => s.student.toString() === studentId.toString());
};

assignmentSchema.methods.getSubmissionStats = function () {
  const submissions = this.submissions;
  const gradedSubmissions = submissions.filter(s => s.grade && s.grade.score !== undefined);

  return {
    total: submissions.length,
    graded: gradedSubmissions.length,
    pending: submissions.length - gradedSubmissions.length,
    averageScore: gradedSubmissions.length > 0
      ? gradedSubmissions.reduce((sum, s) => sum + s.grade.score, 0) / gradedSubmissions.length
      : 0,
    passRate: gradedSubmissions.length > 0
      ? (gradedSubmissions.filter(s => s.grade.score >= this.passingScore).length / gradedSubmissions.length) * 100
      : 0
  };
};

// Static methods
assignmentSchema.statics.findByCourse = function (courseId, options = {}) {
  const query = { course: courseId };

  if (options.published !== undefined) {
    query.isPublished = options.published;
  }

  if (options.active !== undefined) {
    query.isActive = options.active;
  }

  return this.find(query)
    .populate('instructor', 'name email')
    .populate('course', 'title')
    .sort({ dueDate: 1 });
};

assignmentSchema.statics.findUpcoming = function (courseIds, days = 7) {
  const now = new Date();
  const futureDate = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000));

  return this.find({
    course: { $in: courseIds },
    dueDate: { $gte: now, $lte: futureDate },
    isPublished: true,
    isActive: true
  }).sort({ dueDate: 1 });
};

assignmentSchema.statics.findOverdue = function (courseIds) {
  return this.find({
    course: { $in: courseIds },
    dueDate: { $lt: new Date() },
    isPublished: true,
    isActive: true
  }).sort({ dueDate: -1 });
};

const Assignment = mongoose.model('Assignment', assignmentSchema);

module.exports = Assignment;