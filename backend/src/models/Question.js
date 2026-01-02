const mongoose = require('mongoose');

// Choice schema for multiple choice questions
const choiceSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, 'Choice text is required']
  },
  isCorrect: {
    type: Boolean,
    default: false
  }
}, { _id: true });

// Main Question schema
const questionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['single-choice', 'multiple-choice', 'descriptive', 'true-false', 'fill-blank'],
    required: [true, 'Question type is required']
  },
  choices: {
    type: [choiceSchema],
    validate: {
      validator: function(choices) {
        // For choice-based questions, must have at least 2 choices
        if (['single-choice', 'multiple-choice', 'true-false'].includes(this.type)) {
          return choices && choices.length >= 2;
        }
        return true;
      },
      message: 'Choice-based questions must have at least 2 choices'
    }
  },
  correctAnswer: {
    type: String,
    validate: {
      validator: function(answer) {
        // For descriptive and fill-blank questions, correctAnswer can be optional or a sample answer
        if (['descriptive', 'fill-blank'].includes(this.type)) {
          return true; // Optional for these types
        }
        // For choice-based questions, this field might store the correct choice ID
        return answer && answer.length > 0;
      },
      message: 'Correct answer is required for choice-based questions'
    }
  },
  explanation: {
    type: String,
    trim: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  points: {
    type: Number,
    default: 1,
    min: [0, 'Points cannot be negative']
  },
  timeLimit: {
    type: Number, // in seconds
    default: 0, // 0 means no time limit
    min: [0, 'Time limit cannot be negative']
  },
  tags: [{
    type: String,
    trim: true
  }],
  attachments: [{
    name: String,
    url: String,
    type: {
      type: String,
      enum: ['image', 'video', 'audio', 'document'],
      default: 'document'
    }
  }],
  // Question Bank references
  questionBank: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QuestionBank',
    required: [true, 'Question must belong to a question bank']
  },
  // Internal section within the question bank (for organization)
  bankSection: {
    type: mongoose.Schema.Types.ObjectId,
    // References QuestionBank.sections._id (embedded document ID)
  },
  // Creator info
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Question creator is required']
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization'
  },
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  // Analytics
  timesUsed: {
    type: Number,
    default: 0
  },
  averageScore: {
    type: Number,
    default: 0
  },
  lastUsed: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
questionSchema.index({ questionBank: 1 });
questionSchema.index({ bankSection: 1 });
questionSchema.index({ questionBank: 1, bankSection: 1 }); // Compound index for queries by bank and section
questionSchema.index({ createdBy: 1 });
questionSchema.index({ type: 1 });
questionSchema.index({ difficulty: 1 });
questionSchema.index({ tags: 1 });
questionSchema.index({ isActive: 1 });
questionSchema.index({ isPublic: 1 });
questionSchema.index({ createdAt: -1 });

// Virtual for getting the number of correct choices
questionSchema.virtual('correctChoicesCount').get(function() {
  if (!this.choices) return 0;
  return this.choices.filter(choice => choice.isCorrect).length;
});

// Pre-save middleware for validation
questionSchema.pre('save', function(next) {
  // Validate correct answers for different question types
  if (this.type === 'single-choice') {
    const correctChoices = this.choices.filter(choice => choice.isCorrect);
    if (correctChoices.length !== 1) {
      return next(new Error('Single choice questions must have exactly one correct answer'));
    }
  } else if (this.type === 'multiple-choice') {
    const correctChoices = this.choices.filter(choice => choice.isCorrect);
    if (correctChoices.length === 0) {
      return next(new Error('Multiple choice questions must have at least one correct answer'));
    }
  } else if (this.type === 'true-false') {
    if (this.choices.length !== 2) {
      return next(new Error('True/False questions must have exactly 2 choices'));
    }
    const correctChoices = this.choices.filter(choice => choice.isCorrect);
    if (correctChoices.length !== 1) {
      return next(new Error('True/False questions must have exactly one correct answer'));
    }
  }

  next();
});

// Instance methods
questionSchema.methods.incrementUsage = function() {
  this.timesUsed += 1;
  this.lastUsed = new Date();
  return this.save();
};

questionSchema.methods.updateAverageScore = function(newScore) {
  // Simple rolling average calculation
  const totalScore = this.averageScore * this.timesUsed + newScore;
  this.averageScore = totalScore / (this.timesUsed + 1);
  return this.save();
};

// Static methods
questionSchema.statics.findByDifficulty = function(difficulty) {
  return this.find({ difficulty, isActive: true });
};

questionSchema.statics.findByType = function(type) {
  return this.find({ type, isActive: true });
};

questionSchema.statics.findByTags = function(tags) {
  return this.find({ tags: { $in: tags }, isActive: true });
};

questionSchema.statics.findByCourse = async function(courseId) {
  // Find question banks for this course
  const QuestionBank = mongoose.model('QuestionBank');
  const questionBanks = await QuestionBank.find({ course: courseId }).select('_id');
  const bankIds = questionBanks.map(bank => bank._id);

  // Find questions in these banks
  return this.find({
    questionBank: { $in: bankIds },
    isActive: true
  })
    .populate('createdBy', 'name email')
    .populate('questionBank', 'name course')
    .sort({ createdAt: -1 });
};

const Question = mongoose.model('Question', questionSchema);

module.exports = Question;