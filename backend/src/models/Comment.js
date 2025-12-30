const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    trim: true,
    maxlength: [2000, 'Comment cannot exceed 2000 characters'],
    minlength: [1, 'Comment must have at least 1 character']
  },
  article: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article',
    required: [true, 'Comment must belong to an article']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Comment must have an author']
  },
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  },
  status: {
    type: String,
    enum: ['active', 'deleted', 'flagged'],
    default: 'active'
  },
  likes: {
    type: Number,
    default: 0,
    min: 0
  },
  likedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
commentSchema.index({ article: 1, createdAt: -1 });
commentSchema.index({ author: 1, createdAt: -1 });
commentSchema.index({ parentComment: 1, createdAt: 1 });
commentSchema.index({ article: 1, parentComment: 1, status: 1 });

// Virtual for replies (nested comments)
commentSchema.virtual('replies', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'parentComment',
  match: { status: 'active' }
});

// Virtual for replies count
commentSchema.virtual('repliesCount', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'parentComment',
  count: true,
  match: { status: 'active' }
});

// Pre-save middleware
commentSchema.pre('save', function (next) {
  // Set editedAt when content is modified (but not on creation)
  if (this.isModified('content') && !this.isNew) {
    this.isEdited = true;
    this.editedAt = new Date();
  }
  next();
});

// Instance methods
commentSchema.methods.toggleLike = function (userId) {
  const isLiked = this.likedBy.includes(userId);

  if (isLiked) {
    this.likedBy.pull(userId);
    this.likes = Math.max(0, this.likes - 1);
  } else {
    this.likedBy.push(userId);
    this.likes += 1;
  }

  return this.save({ validateBeforeSave: false });
};

commentSchema.methods.softDelete = function () {
  this.status = 'deleted';
  this.content = '[This comment has been deleted]';
  return this.save({ validateBeforeSave: false });
};

// Static methods
commentSchema.statics.getArticleComments = function (articleId, options = {}) {
  const {
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    order = 'desc'
  } = options;

  const skip = (page - 1) * limit;
  const sortOrder = order === 'desc' ? -1 : 1;

  return this.find({
    article: articleId,
    parentComment: null, // Only top-level comments
    status: 'active'
  })
    .sort({ [sortBy]: sortOrder })
    .skip(skip)
    .limit(limit)
    .populate('author', 'name avatar')
    .populate({
      path: 'replies',
      populate: { path: 'author', select: 'name avatar' },
      options: { sort: { createdAt: 1 }, limit: 50 }
    });
};

module.exports = mongoose.model('Comment', commentSchema);
