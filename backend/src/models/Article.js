const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Article title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Article content is required']
  },
  excerpt: {
    type: String,
    maxlength: [500, 'Excerpt cannot exceed 500 characters'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Article category is required'],
    trim: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  thumbnail: {
    type: String,
    validate: {
      validator: function (v) {
        return !v || /^https?:\/\//.test(v);
      },
      message: 'Thumbnail must be a valid URL'
    }
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Article must have an author']
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  visibility: {
    type: String,
    enum: ['public', 'private', 'organization'],
    default: 'public'
  },
  readTime: {
    type: Number,
    default: function () {
      // Calculate estimated read time based on content length
      // Average reading speed: 200 words per minute
      const wordCount = this.content ? this.content.split(/\s+/).length : 0;
      return Math.max(1, Math.ceil(wordCount / 200));
    }
  },
  views: {
    type: Number,
    default: 0,
    min: 0
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
  publishedAt: {
    type: Date
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization'
  },
  // SEO fields
  metaTitle: {
    type: String,
    maxlength: [70, 'Meta title cannot exceed 70 characters']
  },
  metaDescription: {
    type: String,
    maxlength: [160, 'Meta description cannot exceed 160 characters']
  },
  slug: {
    type: String,
    unique: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
articleSchema.index({ title: 'text', content: 'text', excerpt: 'text' });
articleSchema.index({ author: 1, status: 1, createdAt: -1 });
articleSchema.index({ category: 1, status: 1, publishedAt: -1 });
articleSchema.index({ tags: 1, status: 1, publishedAt: -1 });
articleSchema.index({ organization: 1, status: 1, publishedAt: -1 });
articleSchema.index({ views: -1, publishedAt: -1 });
articleSchema.index({ likes: -1, publishedAt: -1 });

// Virtual for comments count (if implementing comments later)
articleSchema.virtual('commentsCount', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'article',
  count: true
});

// Pre-save middleware
articleSchema.pre('save', function (next) {
  // Set publishedAt when status changes to published
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }

  // Generate slug from title if not provided
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }

  // Auto-generate excerpt from content if not provided
  if (this.isModified('content') && !this.excerpt) {
    const plainText = this.content.replace(/<[^>]*>/g, ''); // Remove HTML tags
    this.excerpt = plainText.substring(0, 200) + (plainText.length > 200 ? '...' : '');
  }

  next();
});

// Instance methods
articleSchema.methods.incrementViews = function () {
  this.views += 1;
  return this.save({ validateBeforeSave: false });
};

articleSchema.methods.toggleLike = function (userId) {
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

// Static methods
articleSchema.statics.getPopular = function (limit = 10, timeframe = 'week') {
  const now = new Date();
  let dateFilter = {};

  switch (timeframe) {
    case 'week':
      dateFilter = { publishedAt: { $gte: new Date(now - 7 * 24 * 60 * 60 * 1000) } };
      break;
    case 'month':
      dateFilter = { publishedAt: { $gte: new Date(now - 30 * 24 * 60 * 60 * 1000) } };
      break;
    case 'year':
      dateFilter = { publishedAt: { $gte: new Date(now - 365 * 24 * 60 * 60 * 1000) } };
      break;
  }

  return this.find({
    status: 'published',
    visibility: { $in: ['public', 'organization'] },
    ...dateFilter
  })
    .sort({ views: -1, likes: -1 })
    .limit(limit)
    .populate('author', 'name avatar')
    .select('-content -likedBy'); // Exclude full content for performance
};

articleSchema.statics.getFeatured = function (limit = 5) {
  return this.find({
    status: 'published',
    visibility: { $in: ['public', 'organization'] }
  })
    .sort({ likes: -1, views: -1, publishedAt: -1 })
    .limit(limit)
    .populate('author', 'name avatar')
    .select('-content -likedBy'); // Exclude full content for performance
};

articleSchema.statics.getCategories = function () {
  return this.distinct('category', { status: 'published' });
};

module.exports = mongoose.model('Article', articleSchema);