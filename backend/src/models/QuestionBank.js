const mongoose = require('mongoose');

// Section schema for organizing questions within a question bank
const sectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Section name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  _id: true
});

// Settings schema for question bank configuration
const settingsSchema = new mongoose.Schema({
  // Question randomization
  randomizeQuestions: {
    type: Boolean,
    default: false
  },
  randomizeChoices: {
    type: Boolean,
    default: false
  },
  // Scoring
  defaultPointsPerQuestion: {
    type: Number,
    default: 1,
    min: [0, 'Default points cannot be negative']
  },
  passingScore: {
    type: Number,
    default: 70,
    min: [0, 'Passing score cannot be negative'],
    max: [100, 'Passing score cannot exceed 100']
  },
  passingScoreRequired: {
    type: Boolean,
    default: true
  },
  // Time limits
  defaultTimeLimit: {
    type: Number, // in minutes
    default: 0, // 0 means no time limit
    min: [0, 'Time limit cannot be negative']
  },
  // Access control
  allowRetakes: {
    type: Boolean,
    default: true
  },
  maxAttempts: {
    type: Number,
    default: 3,
    min: [0, 'Cannot be negative'] // 0 means unlimited
  },
  // Display options
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
  }
}, { _id: false });

// Main QuestionBank schema
const questionBankSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Question bank name is required'],
    trim: true,
    maxlength: [100, 'Question bank name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: false // Optional for shared question banks
  },
  sections: {
    type: [sectionSchema],
    default: []
  },
  // Creator and organization info
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Question bank creator is required']
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization'
  },
  // Settings and configuration
  settings: {
    type: settingsSchema,
    default: () => ({})
  },
  // Status and visibility
  status: {
    type: String,
    enum: ['draft', 'active', 'archived'],
    default: 'active'  // Auto-publish new question banks
  },
  visibility: {
    type: String,
    enum: ['public', 'private', 'organization'],
    default: 'private'
  },
  isTemplate: {
    type: Boolean,
    default: false
  },
  // Analytics and metadata
  totalQuestions: {
    type: Number,
    default: 0
  },
  averageDifficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  estimatedDuration: {
    type: Number, // in minutes
    default: 0
  },
  timesUsed: {
    type: Number,
    default: 0
  },
  averageScore: {
    type: Number,
    default: 0
  },
  lastUsed: Date,
  // Tags for categorization
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  // Thumbnail and visual
  thumbnail: {
    type: String,
    default: ''
  },
  color: {
    type: String,
    default: '#3B82F6' // Default blue color
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
questionBankSchema.index({ course: 1 });
questionBankSchema.index({ createdBy: 1 });
questionBankSchema.index({ organization: 1 });
questionBankSchema.index({ status: 1 });
questionBankSchema.index({ visibility: 1 });
questionBankSchema.index({ tags: 1 });
questionBankSchema.index({ createdAt: -1 });
questionBankSchema.index({ name: 'text', description: 'text' }); // Text search

// Virtual for questions count from Question model
questionBankSchema.virtual('questionsCount', {
  ref: 'Question',
  localField: '_id',
  foreignField: 'questionBank',
  count: true
});

// Virtual for questions
questionBankSchema.virtual('questions', {
  ref: 'Question',
  localField: '_id',
  foreignField: 'questionBank'
});

// Pre-save middleware
questionBankSchema.pre('save', function(next) {
  // Ensure sections have proper order if not set
  this.sections.forEach((section, index) => {
    if (!section.order && section.order !== 0) {
      section.order = index;
    }
  });

  // Sort sections by order
  this.sections.sort((a, b) => a.order - b.order);

  next();
});

// Instance methods
questionBankSchema.methods.addSection = function(sectionData) {
  const newSection = {
    ...sectionData,
    order: this.sections.length
  };
  this.sections.push(newSection);
  return this.save();
};

questionBankSchema.methods.removeSection = function(sectionId) {
  this.sections = this.sections.filter(section =>
    section._id.toString() !== sectionId.toString()
  );
  return this.save();
};

questionBankSchema.methods.updateSection = function(sectionId, updateData) {
  const section = this.sections.id(sectionId);
  if (section) {
    Object.assign(section, updateData);
    return this.save();
  }
  throw new Error('Section not found');
};

questionBankSchema.methods.reorderSections = function(sectionOrders) {
  sectionOrders.forEach(({ sectionId, order }) => {
    const section = this.sections.id(sectionId);
    if (section) {
      section.order = order;
    }
  });

  // Sort sections by new order
  this.sections.sort((a, b) => a.order - b.order);
  return this.save();
};

questionBankSchema.methods.activate = function() {
  this.status = 'active';
  return this.save();
};

questionBankSchema.methods.archive = function() {
  this.status = 'archived';
  return this.save();
};

questionBankSchema.methods.incrementUsage = function() {
  this.timesUsed += 1;
  this.lastUsed = new Date();
  return this.save();
};

questionBankSchema.methods.updateStats = async function() {
  const Question = mongoose.model('Question');

  // Get all questions for this question bank
  const questions = await Question.find({
    questionBank: this._id,
    isActive: true
  });

  // Calculate stats logic
  const updates = {
    totalQuestions: questions.length
  };

  if (questions.length > 0) {
    // Calculate average difficulty
    const difficultyWeights = { easy: 1, medium: 2, hard: 3 };
    const avgDifficultyWeight = questions.reduce((sum, q) =>
      sum + difficultyWeights[q.difficulty || 'medium'], 0 // Fallback for safety
    ) / questions.length;

    if (avgDifficultyWeight <= 1.5) {
      updates.averageDifficulty = 'easy';
    } else if (avgDifficultyWeight <= 2.5) {
      updates.averageDifficulty = 'medium';
    } else {
      updates.averageDifficulty = 'hard';
    }

    // Calculate estimated duration
    updates.estimatedDuration = questions.reduce((sum, q) =>
      sum + (q.timeLimit || 120), 0 // Default 2 minutes per question
    ) / 60; // Convert to minutes

    // Calculate average score
    const totalScore = questions.reduce((sum, q) => sum + (q.averageScore || 0), 0);
    updates.averageScore = totalScore / questions.length;
  } else {
    // Reset stats if no questions
    updates.averageDifficulty = 'medium';
    updates.estimatedDuration = 0;
    updates.averageScore = 0;
  }

  // Use findByIdAndUpdate to avoid VersionError (optimistic locking)
  return this.constructor.findByIdAndUpdate(this._id, updates, { new: true });
};

// Static methods
questionBankSchema.statics.findByCourse = function(courseId, options = {}) {
  const query = { course: courseId };

  if (options.status) {
    query.status = options.status;
  }

  if (options.visibility) {
    query.visibility = options.visibility;
  }

  return this.find(query)
    .populate('createdBy', 'name email avatar')
    .populate('course', 'title')
    .sort({ createdAt: -1 });
};

questionBankSchema.statics.findByUser = function(userId, options = {}) {
  const query = { createdBy: userId };

  if (options.status) {
    query.status = options.status;
  }

  return this.find(query)
    .populate('course', 'title description')
    .sort({ updatedAt: -1 });
};

questionBankSchema.statics.search = function(searchQuery, filters = {}) {
  const query = {
    $text: { $search: searchQuery },
    ...filters
  };

  return this.find(query)
    .populate('createdBy', 'name email')
    .populate('course', 'title')
    .sort({ score: { $meta: 'textScore' } });
};

const QuestionBank = mongoose.model('QuestionBank', questionBankSchema);

module.exports = QuestionBank;