const mongoose = require('mongoose');

// Resource schema for lesson attachments
const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Resource title is required'],
    trim: true
  },
  url: {
    type: String,
    required: [true, 'Resource URL is required']
  },
  type: {
    type: String,
    enum: ['pdf', 'video', 'link', 'document', 'image', 'audio'],
    required: [true, 'Resource type is required']
  },
  size: Number, // in bytes
  duration: Number, // for video/audio resources in seconds
  downloadable: {
    type: Boolean,
    default: true
  }
}, { _id: true });

// Lesson settings schema
const lessonSettingsSchema = new mongoose.Schema({
  allowComments: {
    type: Boolean,
    default: true
  },
  downloadable: {
    type: Boolean,
    default: false
  },
  autoComplete: {
    type: Boolean,
    default: false
  },
  preventSkipping: {
    type: Boolean,
    default: false
  },
  showTranscript: {
    type: Boolean,
    default: false
  }
}, { _id: false });

// Main lesson schema
const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Lesson title is required'],
    trim: true,
    maxlength: [100, 'Lesson title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Lesson description cannot exceed 500 characters']
  },
  content: {
    type: String,
    required: [true, 'Lesson content is required']
  },
  type: {
    type: String,
    enum: ['text', 'video', 'quiz', 'assignment', 'live', 'download'],
    default: 'text',
    required: [true, 'Lesson type is required']
  },
  // Course association
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Lesson must belong to a course']
  },
  chapter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chapter' // For future chapter model
  },
  // Ordering and organization
  order: {
    type: Number,
    required: [true, 'Lesson order is required'],
    min: [1, 'Lesson order must be at least 1']
  },
  duration: {
    type: Number, // in minutes
    default: 0,
    min: [0, 'Duration cannot be negative']
  },
  // Content details
  videoUrl: String,
  videoProvider: {
    type: String,
    enum: ['youtube', 'vimeo', 'wistia', 'local', 'aws-s3'],
    default: 'local'
  },
  videoDuration: Number, // in seconds for video lessons
  transcript: String,
  // Resources and attachments
  resources: [resourceSchema],
  // Access control
  isPreview: {
    type: Boolean,
    default: false
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  // Settings
  settings: {
    type: lessonSettingsSchema,
    default: () => ({})
  },
  // References to related content
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz'
  },
  assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment'
  },
  // Creator info
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Lesson creator is required']
  },
  // Analytics and engagement
  views: {
    type: Number,
    default: 0
  },
  completions: {
    type: Number,
    default: 0
  },
  averageTimeSpent: {
    type: Number, // in seconds
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  // Metadata
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  language: {
    type: String,
    default: 'en'
  },
  thumbnail: String,
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
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance - FIXED: Removed duplicate compound index
lessonSchema.index({ course: 1, isPublished: 1 });
lessonSchema.index({ createdBy: 1 });
lessonSchema.index({ type: 1 });
lessonSchema.index({ isPreview: 1 });
lessonSchema.index({ isActive: 1, isDeleted: 1 });
lessonSchema.index({ createdAt: -1 });
lessonSchema.index({ title: 'text', description: 'text', content: 'text' });

// Compound index for ordering within course - Keep only this one with unique constraint
// Exclude soft-deleted lessons from unique constraint
lessonSchema.index({ course: 1, order: 1 }, {
  unique: true,
  partialFilterExpression: { isDeleted: false }
});

// Virtual for completion rate
lessonSchema.virtual('completionRate').get(function () {
  return this.views > 0 ? (this.completions / this.views) * 100 : 0;
});

// Virtual for resource count
lessonSchema.virtual('resourceCount').get(function () {
  return this.resources ? this.resources.length : 0;
});

// Virtual for formatted duration
lessonSchema.virtual('formattedDuration').get(function () {
  if (!this.duration) return '0 min';
  const hours = Math.floor(this.duration / 60);
  const minutes = this.duration % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
});

// Pre-save middleware
lessonSchema.pre('save', function (next) {
  this.lastModified = new Date();

  // Auto-set duration for video lessons if not provided
  if (this.type === 'video' && this.videoDuration && !this.duration) {
    this.duration = Math.ceil(this.videoDuration / 60); // Convert seconds to minutes
  }

  next();
});

// Pre-remove middleware for soft delete
lessonSchema.pre('remove', function (next) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.isActive = false;
  next();
});

// Instance methods
lessonSchema.methods.publish = function () {
  this.isPublished = true;
  this.isActive = true;
  return this.save();
};

lessonSchema.methods.unpublish = function () {
  this.isPublished = false;
  return this.save();
};

lessonSchema.methods.addView = function () {
  this.views += 1;
  return this.save();
};

lessonSchema.methods.markComplete = function () {
  this.completions += 1;
  return this.save();
};

lessonSchema.methods.addResource = function (resourceData) {
  this.resources.push(resourceData);
  return this.save();
};

lessonSchema.methods.removeResource = function (resourceId) {
  this.resources = this.resources.filter(r => r._id.toString() !== resourceId.toString());
  return this.save();
};

lessonSchema.methods.updateOrder = function (newOrder) {
  this.order = newOrder;
  return this.save();
};

lessonSchema.methods.softDelete = function () {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.isActive = false;
  return this.save();
};

// Static methods
lessonSchema.statics.findByCourse = function (courseId, options = {}) {
  const query = {
    course: courseId,
    isDeleted: false
  };

  if (options.published !== undefined) {
    query.isPublished = options.published;
  }

  if (options.isPreview !== undefined) {
    query.isPreview = options.isPreview;
  }

  return this.find(query)
    .populate('createdBy', 'name email')
    .populate('quiz', 'title')
    .populate('assignment', 'title')
    .sort({ order: 1 });
};

lessonSchema.statics.getNextOrder = async function (courseId) {
  const lastLesson = await this.findOne({
    course: courseId,
    isDeleted: false
  }).sort({ order: -1 });

  return lastLesson ? lastLesson.order + 1 : 1;
};

lessonSchema.statics.reorderLessons = async function (courseId, lessonOrders) {
  const bulkOps = lessonOrders.map(({ _id, order }) => ({
    updateOne: {
      filter: { _id, course: courseId },
      update: { order, lastModified: new Date() }
    }
  }));

  return this.bulkWrite(bulkOps);
};

lessonSchema.statics.getCourseStats = async function (courseId) {
  const stats = await this.aggregate([
    { $match: { course: mongoose.Types.ObjectId(courseId), isDeleted: false } },
    {
      $group: {
        _id: null,
        totalLessons: { $sum: 1 },
        publishedLessons: {
          $sum: { $cond: [{ $eq: ['$isPublished', true] }, 1, 0] }
        },
        totalDuration: { $sum: '$duration' },
        totalViews: { $sum: '$views' },
        totalCompletions: { $sum: '$completions' },
        averageCompletionRate: { $avg: '$completionRate' },
        lessonTypes: {
          $push: '$type'
        }
      }
    }
  ]);

  return stats[0] || {
    totalLessons: 0,
    publishedLessons: 0,
    totalDuration: 0,
    totalViews: 0,
    totalCompletions: 0,
    averageCompletionRate: 0,
    lessonTypes: []
  };
};

const Lesson = mongoose.model('Lesson', lessonSchema);

module.exports = Lesson;