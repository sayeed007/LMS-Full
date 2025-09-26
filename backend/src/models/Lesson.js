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
  // Note: Lesson content is now managed through the Content model
  // Each lesson can have multiple content items with different types
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
    required: function() {
      // Order is only required for active lessons
      return !this.isDeleted;
    },
    min: [1, 'Lesson order must be at least 1'],
    default: null
  },
  estimatedDuration: {
    type: Number, // in minutes - estimated total time for all content in lesson
    default: 0,
    min: [0, 'Duration cannot be negative']
  },
  // Resources and attachments (keeping for backward compatibility)
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
  // Note: Quiz and Assignment references removed - now managed through Content model
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
// Exclude soft-deleted lessons and null orders from unique constraint
lessonSchema.index({ course: 1, order: 1 }, {
  unique: true,
  partialFilterExpression: { isDeleted: false, order: { $ne: null } }
});

// Virtual for completion rate
lessonSchema.virtual('completionRate').get(function () {
  return this.views > 0 ? (this.completions / this.views) * 100 : 0;
});

// Virtual for lesson content
lessonSchema.virtual('content', {
  ref: 'Content',
  localField: '_id',
  foreignField: 'lesson',
  match: { isDeleted: false }
});

// Virtual for resource count
lessonSchema.virtual('resourceCount').get(function () {
  return this.resources ? this.resources.length : 0;
});

// Virtual for content count
lessonSchema.virtual('contentCount').get(function () {
  return this.content ? this.content.length : 0;
});

// Virtual for formatted duration
lessonSchema.virtual('formattedDuration').get(function () {
  if (!this.estimatedDuration) return '0 min';
  const hours = Math.floor(this.estimatedDuration / 60);
  const minutes = this.estimatedDuration % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
});

// Pre-save middleware
lessonSchema.pre('save', function (next) {
  this.lastModified = new Date();
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
  // Clear the order to prevent conflicts with future lessons
  this.order = null;
  return this.save();
};

lessonSchema.methods.restore = async function () {
  this.isDeleted = false;
  this.deletedAt = null;
  this.isActive = true;
  // Assign new order at the end of the course
  this.order = await this.constructor.getNextOrder(this.course);
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
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      // Step 1: Get all active lessons for this course
      const existingLessons = await this.find({
        course: courseId,
        isDeleted: false
      }, { _id: 1, order: 1 }, { session });

      // Step 2: Move ALL active lessons to temporary negative orders first
      // This completely clears the order space to avoid any conflicts
      const allTempOps = existingLessons.map((lesson, index) => ({
        updateOne: {
          filter: { _id: lesson._id, course: courseId, isDeleted: false },
          update: { order: -(index + 50000), lastModified: new Date() }
        }
      }));

      if (allTempOps.length > 0) {
        await this.bulkWrite(allTempOps, { session });
      }

      // Step 3: Set the final correct orders for the lessons being reordered
      const finalOps = lessonOrders.map(({ _id, order }) => ({
        updateOne: {
          filter: { _id, course: courseId, isDeleted: false },
          update: { order, lastModified: new Date() }
        }
      }));

      if (finalOps.length > 0) {
        await this.bulkWrite(finalOps, { session });
      }

      // Step 4: Fix orders for any remaining lessons that weren't in the reorder list
      const reorderedIds = lessonOrders.map(l => l._id.toString());
      const unprocessedLessons = existingLessons.filter(
        lesson => !reorderedIds.includes(lesson._id.toString())
      );

      if (unprocessedLessons.length > 0) {
        // Find the highest order from the reordered lessons
        const maxOrder = Math.max(...lessonOrders.map(l => l.order));

        const remainingOps = unprocessedLessons.map((lesson, index) => ({
          updateOne: {
            filter: { _id: lesson._id, course: courseId, isDeleted: false },
            update: { order: maxOrder + index + 1, lastModified: new Date() }
          }
        }));

        await this.bulkWrite(remainingOps, { session });
      }
    });
  } finally {
    await session.endSession();
  }
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