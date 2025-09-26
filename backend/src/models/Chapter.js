const mongoose = require('mongoose');

const chapterSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Chapter title is required'],
    trim: true,
    maxlength: [100, 'Chapter title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Chapter description cannot exceed 500 characters']
  },
  // Course association
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Chapter must belong to a course']
  },
  // Ordering
  order: {
    type: Number,
    required: function() {
      // Order is only required for active chapters
      return !this.isDeleted;
    },
    min: [1, 'Chapter order must be at least 1'],
    default: null
  },
  // Access control
  isPublished: {
    type: Boolean,
    default: false
  },
  // Creator info
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Chapter creator is required']
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
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
chapterSchema.index({ course: 1, isDeleted: 1 });
chapterSchema.index({ createdBy: 1 });
chapterSchema.index({ isActive: 1, isDeleted: 1 });
chapterSchema.index({ createdAt: -1 });

// Unique index for ordering within course (exclude soft-deleted chapters and null orders)
chapterSchema.index({ course: 1, order: 1 }, {
  unique: true,
  partialFilterExpression: { isDeleted: false, order: { $ne: null } }
});

// Virtual for lessons in this chapter
chapterSchema.virtual('lessons', {
  ref: 'Lesson',
  localField: '_id',
  foreignField: 'chapter',
  match: { isDeleted: false }
});

// Virtual for lesson count
chapterSchema.virtual('lessonCount').get(function () {
  return this.lessons ? this.lessons.length : 0;
});

// Pre-save middleware
chapterSchema.pre('save', function (next) {
  this.lastModified = new Date();
  next();
});

// Instance methods
chapterSchema.methods.publish = function () {
  this.isPublished = true;
  this.isActive = true;
  return this.save();
};

chapterSchema.methods.unpublish = function () {
  this.isPublished = false;
  return this.save();
};

chapterSchema.methods.softDelete = function () {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.isActive = false;
  // Clear the order to prevent conflicts with future chapters
  this.order = null;
  return this.save();
};

chapterSchema.methods.restore = async function () {
  this.isDeleted = false;
  this.deletedAt = null;
  this.isActive = true;
  // Assign new order at the end of the course
  this.order = await this.constructor.getNextOrder(this.course);
  return this.save();
};

// Static methods
chapterSchema.statics.findByCourse = function (courseId, options = {}) {
  const query = {
    course: courseId,
    isDeleted: false
  };

  if (options.published !== undefined) {
    query.isPublished = options.published;
  }

  return this.find(query)
    .populate('createdBy', 'name email')
    .populate({
      path: 'lessons',
      match: { isDeleted: false },
      options: { sort: { order: 1 } }
    })
    .sort({ order: 1 });
};

chapterSchema.statics.getNextOrder = async function (courseId) {
  const lastChapter = await this.findOne({
    course: courseId,
    isDeleted: false
  }).sort({ order: -1 });

  return lastChapter ? lastChapter.order + 1 : 1;
};

chapterSchema.statics.reorderChapters = async function (courseId, chapterOrders) {
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      // Step 1: Get all active chapters for this course
      const existingChapters = await this.find({
        course: courseId,
        isDeleted: false
      }, { _id: 1, order: 1 }, { session });

      // Step 2: Move ALL active chapters to temporary negative orders first
      // This completely clears the order space to avoid any conflicts
      const allTempOps = existingChapters.map((chapter, index) => ({
        updateOne: {
          filter: { _id: chapter._id, course: courseId, isDeleted: false },
          update: { order: -(index + 50000), lastModified: new Date() }
        }
      }));

      if (allTempOps.length > 0) {
        await this.bulkWrite(allTempOps, { session });
      }

      // Step 3: Set the final correct orders for the chapters being reordered
      const finalOps = chapterOrders.map(({ _id, order }) => ({
        updateOne: {
          filter: { _id, course: courseId, isDeleted: false },
          update: { order, lastModified: new Date() }
        }
      }));

      if (finalOps.length > 0) {
        await this.bulkWrite(finalOps, { session });
      }

      // Step 4: Fix orders for any remaining chapters that weren't in the reorder list
      const reorderedIds = chapterOrders.map(c => c._id.toString());
      const unprocessedChapters = existingChapters.filter(
        chapter => !reorderedIds.includes(chapter._id.toString())
      );

      if (unprocessedChapters.length > 0) {
        // Find the highest order from the reordered chapters
        const maxOrder = Math.max(...chapterOrders.map(c => c.order));

        const remainingOps = unprocessedChapters.map((chapter, index) => ({
          updateOne: {
            filter: { _id: chapter._id, course: courseId, isDeleted: false },
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

const Chapter = mongoose.model('Chapter', chapterSchema);

module.exports = Chapter;