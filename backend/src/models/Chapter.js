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
    required: [true, 'Chapter order is required'],
    min: [1, 'Chapter order must be at least 1']
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

// Unique index for ordering within course (exclude soft-deleted chapters)
chapterSchema.index({ course: 1, order: 1 }, {
  unique: true,
  partialFilterExpression: { isDeleted: false }
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
  const bulkOps = chapterOrders.map(({ _id, order }) => ({
    updateOne: {
      filter: { _id, course: courseId },
      update: { order, lastModified: new Date() }
    }
  }));

  return this.bulkWrite(bulkOps);
};

const Chapter = mongoose.model('Chapter', chapterSchema);

module.exports = Chapter;