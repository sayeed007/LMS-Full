const mongoose = require('mongoose');

// Block Schema - can contain multiple content items
const blockItemSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['text', 'image', 'audio', 'video', 'document'],
    required: true
  },
  order: {
    type: Number,
    required: true,
    min: 1
  },
  data: {
    // Text content
    text: String,

    // Media content (image, audio, video, document)
    url: String,
    filename: String,
    size: Number,
    mimeType: String,

    // Common metadata
    title: String,
    description: String,
    alt: String, // for images
    duration: Number, // for audio/video in seconds

    // For embed videos (YouTube, Vimeo, etc.)
    embedUrl: String,

    // Additional properties can be added as needed
    metadata: mongoose.Schema.Types.Mixed
  },

  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { _id: true });

// Quiz Question Schema
const quizQuestionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['single_choice', 'multiple_choice', 'descriptive', 'pick_from_db'],
    required: true
  },
  order: {
    type: Number,
    required: true,
    min: 1
  },
  question: {
    type: String,
    required: true,
    trim: true
  },

  // For choice-based questions
  options: [{
    text: String,
    isCorrect: Boolean,
    explanation: String
  }],

  // For descriptive questions
  expectedAnswer: String,
  maxLength: Number,

  // For pick_from_db questions
  dbCollectionRef: String,
  dbQuery: mongoose.Schema.Types.Mixed,

  // Common question properties
  points: {
    type: Number,
    default: 1,
    min: 0
  },
  explanation: String,
  hint: String,

  // Time limit for this question (in seconds)
  timeLimit: Number,

  // Whether this question is required
  isRequired: {
    type: Boolean,
    default: true
  },

  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { _id: true });

// Assignment Schema
const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  instructions: String,

  // Submission settings
  submissionType: {
    type: String,
    enum: ['file', 'text', 'url', 'mixed'],
    default: 'file'
  },
  maxFileSize: {
    type: Number,
    default: 10 * 1024 * 1024 // 10MB in bytes
  },
  allowedFileTypes: [String], // ['pdf', 'doc', 'docx', 'txt', etc.]
  maxSubmissions: {
    type: Number,
    default: 1,
    min: 1
  },

  // Grading
  maxPoints: {
    type: Number,
    default: 100,
    min: 0
  },
  gradingRubric: String,
  autoGrade: {
    type: Boolean,
    default: false
  },

  // Deadlines
  dueDate: Date,
  availableFrom: Date,
  availableUntil: Date,

  // Late submission settings
  allowLateSubmission: {
    type: Boolean,
    default: false
  },
  lateSubmissionPenalty: {
    type: Number,
    default: 0,
    min: 0,
    max: 100 // percentage
  },

  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { _id: false });

// Main Content Schema
const contentSchema = new mongoose.Schema({
  // Basic info
  title: {
    type: String,
    required: [true, 'Content title is required'],
    trim: true,
    maxlength: [200, 'Content title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Content description cannot exceed 1000 characters']
  },

  // Content type and data
  type: {
    type: String,
    enum: ['text', 'block', 'audio', 'video', 'document', 'quiz', 'assignment'],
    required: [true, 'Content type is required']
  },

  // Content-specific data based on type
  data: {
    // For text content
    text: String,

    // For media content (audio, video, document)
    title: String, // Title for standalone media content
    description: String, // Description for standalone media content
    url: String,
    filename: String,
    size: Number,
    mimeType: String,
    duration: Number, // for audio/video

    // For embed videos
    embedUrl: String,

    // Additional metadata
    metadata: mongoose.Schema.Types.Mixed,

    // For block content - array of block items
    blocks: [blockItemSchema],

    // DEPRECATED: Backward compatibility - will be removed in future version
    // Old field name, use 'blocks' instead
    items: [blockItemSchema],

    // For quiz content
    quiz: {
      instructions: String,
      timeLimit: Number, // in seconds
      attempts: {
        type: Number,
        default: 1,
        min: 1
      },
      shuffleQuestions: {
        type: Boolean,
        default: false
      },
      showFeedback: {
        type: Boolean,
        default: true
      },
      passingScore: {
        type: Number,
        default: 70,
        min: 0,
        max: 100
      },
      questions: [quizQuestionSchema]
    },

    // For quiz content - reference to separate Quiz document
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz'
    },

    // For assignment content
    assignment: assignmentSchema
  },

  // Relationships
  lesson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
    required: [true, 'Content must belong to a lesson']
  },

  // Ordering within lesson
  order: {
    type: Number,
    required: [true, 'Content order is required'],
    min: [1, 'Content order must be at least 1']
  },

  // Access control
  isPublished: {
    type: Boolean,
    default: false
  },
  isPreview: {
    type: Boolean,
    default: false
  },

  // Creator info
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Content creator is required']
  },

  // Status tracking
  isActive: {
    type: Boolean,
    default: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date,
  lastModified: {
    type: Date,
    default: Date.now
  },

  // Engagement metrics
  views: {
    type: Number,
    default: 0
  },
  avgCompletionTime: Number, // in seconds

  // Learning objectives
  objectives: [String],
  tags: [String]
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      // Backward compatibility: If 'items' exists but 'blocks' doesn't, copy items to blocks
      if (ret.data && ret.data.items && !ret.data.blocks) {
        ret.data.blocks = ret.data.items;
      }
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// Indexes
contentSchema.index({ lesson: 1, isDeleted: 1 });
contentSchema.index({ type: 1 });
contentSchema.index({ createdBy: 1 });
contentSchema.index({ isActive: 1, isDeleted: 1 });
contentSchema.index({ isPublished: 1, isDeleted: 1 });
contentSchema.index({ createdAt: -1 });

// Unique index for ordering within lesson (exclude soft-deleted content)
contentSchema.index({ lesson: 1, order: 1 }, {
  unique: true,
  partialFilterExpression: { isDeleted: false }
});

// Search index
contentSchema.index({
  title: 'text',
  description: 'text',
  'data.text': 'text',
  objectives: 'text',
  tags: 'text'
}, {
  weights: {
    title: 10,
    description: 5,
    'data.text': 3,
    objectives: 2,
    tags: 1
  }
});

// Virtual for lesson details
contentSchema.virtual('lessonDetails', {
  ref: 'Lesson',
  localField: 'lesson',
  foreignField: '_id',
  justOne: true
});

// Pre-save middleware
contentSchema.pre('save', function (next) {
  this.lastModified = new Date();

  // Update nested timestamps based on content type
  if (this.type === 'block' && this.data.blocks) {
    this.data.blocks.forEach(item => {
      item.updatedAt = new Date();
    });
  }

  if (this.type === 'quiz' && this.data.quiz && this.data.quiz.questions) {
    this.data.quiz.questions.forEach(question => {
      question.updatedAt = new Date();
    });
  }

  if (this.type === 'assignment' && this.data.assignment) {
    this.data.assignment.updatedAt = new Date();
  }

  next();
});

// Instance methods
contentSchema.methods.publish = function () {
  this.isPublished = true;
  this.isActive = true;
  return this.save();
};

contentSchema.methods.unpublish = function () {
  this.isPublished = false;
  return this.save();
};

contentSchema.methods.softDelete = function () {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.isActive = false;
  return this.save();
};

contentSchema.methods.incrementViews = function () {
  this.views += 1;
  return this.save();
};

// Static methods
contentSchema.statics.findByLesson = function (lessonId, options = {}) {
  const query = {
    lesson: lessonId,
    isDeleted: false
  };

  if (options.published !== undefined) {
    query.isPublished = options.published;
  }

  if (options.type) {
    query.type = options.type;
  }

  return this.find(query)
    .populate('createdBy', 'name email')
    .sort({ order: 1 });
};

contentSchema.statics.findByType = function (type, options = {}) {
  const query = {
    type,
    isDeleted: false
  };

  if (options.lessonId) {
    query.lesson = options.lessonId;
  }

  if (options.published !== undefined) {
    query.isPublished = options.published;
  }

  return this.find(query)
    .populate('createdBy', 'name email')
    .populate('lessonDetails', 'title')
    .sort({ createdAt: -1 });
};

contentSchema.statics.getNextOrder = async function (lessonId) {
  const lastContent = await this.findOne({
    lesson: lessonId,
    isDeleted: false
  }).sort({ order: -1 });

  return lastContent ? lastContent.order + 1 : 1;
};

contentSchema.statics.reorderContent = async function (lessonId, contentOrders) {
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      // Step 1: Set all orders to temporary negative values to avoid unique constraint violations
      const tempOps = contentOrders.map(({ _id }, index) => ({
        updateOne: {
          filter: { _id, lesson: lessonId },
          update: { order: -(index + 1), lastModified: new Date() }
        }
      }));

      await this.bulkWrite(tempOps, { session });

      // Step 2: Update to final order values
      const finalOps = contentOrders.map(({ _id, order }) => ({
        updateOne: {
          filter: { _id, lesson: lessonId },
          update: { order, lastModified: new Date() }
        }
      }));

      await this.bulkWrite(finalOps, { session });
    });
  } finally {
    await session.endSession();
  }
};

// Move content between lessons
contentSchema.statics.moveContent = async function (contentId, fromLessonId, toLessonId, newOrder) {
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      // Update the content's lesson and order
      await this.findByIdAndUpdate(contentId, {
        lesson: toLessonId,
        order: newOrder,
        lastModified: new Date()
      }, { session });

      // Reorder remaining content in the source lesson
      await this.updateMany(
        {
          lesson: fromLessonId,
          order: { $gt: await this.findById(contentId).order },
          isDeleted: false
        },
        { $inc: { order: -1 } },
        { session }
      );

      // Reorder content in the destination lesson to make space
      await this.updateMany(
        {
          lesson: toLessonId,
          order: { $gte: newOrder },
          _id: { $ne: contentId },
          isDeleted: false
        },
        { $inc: { order: 1 } },
        { session }
      );
    });
  } finally {
    await session.endSession();
  }
};

const Content = mongoose.model('Content', contentSchema);

module.exports = Content;