const mongoose = require('mongoose');

/**
 * Article Analytics Schema
 * Tracks views, engagement, and reader behavior for articles
 */
const articleAnalyticsSchema = new mongoose.Schema({
  article: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article',
    required: [true, 'Article reference is required'],
    index: true
  },
  // View tracking
  totalViews: {
    type: Number,
    default: 0,
    min: 0
  },
  uniqueViews: {
    type: Number,
    default: 0,
    min: 0
  },
  // Engagement metrics
  totalComments: {
    type: Number,
    default: 0,
    min: 0
  },
  totalRatings: {
    type: Number,
    default: 0,
    min: 0
  },
  yesRatings: {
    type: Number,
    default: 0,
    min: 0
  },
  noRatings: {
    type: Number,
    default: 0,
    min: 0
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  // Time metrics
  averageReadTime: {
    type: Number, // in seconds
    default: 0,
    min: 0
  },
  totalReadTime: {
    type: Number, // in seconds
    default: 0,
    min: 0
  },
  // Social engagement
  shares: {
    type: Number,
    default: 0,
    min: 0
  },
  bookmarks: {
    type: Number,
    default: 0,
    min: 0
  },
  // Detailed view records
  views: [{
    viewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    viewedAt: {
      type: Date,
      default: Date.now,
      index: true
    },
    readTime: {
      type: Number, // in seconds
      default: 0
    },
    completedReading: {
      type: Boolean,
      default: false
    },
    // Track user agent for analytics
    userAgent: String,
    ipAddress: String
  }],
  // Last updated
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for performance
articleAnalyticsSchema.index({ article: 1, 'views.viewedAt': -1 });
articleAnalyticsSchema.index({ article: 1, totalViews: -1 });
articleAnalyticsSchema.index({ 'views.viewer': 1, 'views.viewedAt': -1 });

// Methods
articleAnalyticsSchema.methods.recordView = async function(userId, readTime = 0) {
  // Check if user already viewed today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existingViewToday = this.views.find(view =>
    view.viewer &&
    view.viewer.toString() === userId.toString() &&
    view.viewedAt >= today
  );

  // Add view record
  this.views.push({
    viewer: userId,
    viewedAt: new Date(),
    readTime
  });

  // Update total views
  this.totalViews += 1;

  // Update unique views (only if not viewed today)
  if (!existingViewToday) {
    this.uniqueViews += 1;
  }

  // Update read time
  if (readTime > 0) {
    this.totalReadTime += readTime;
    this.averageReadTime = Math.round(this.totalReadTime / this.totalViews);
  }

  this.lastUpdated = Date.now();

  return this.save();
};

articleAnalyticsSchema.methods.updateRating = function(isHelpful) {
  this.totalRatings += 1;

  if (isHelpful) {
    this.yesRatings += 1;
  } else {
    this.noRatings += 1;
  }

  // Calculate percentage of yes ratings
  this.averageRating = Math.round((this.yesRatings / this.totalRatings) * 100);
  this.lastUpdated = Date.now();

  return this.save();
};

articleAnalyticsSchema.methods.incrementComments = function() {
  this.totalComments += 1;
  this.lastUpdated = Date.now();
  return this.save();
};

articleAnalyticsSchema.methods.decrementComments = function() {
  if (this.totalComments > 0) {
    this.totalComments -= 1;
    this.lastUpdated = Date.now();
  }
  return this.save();
};

// Static methods
articleAnalyticsSchema.statics.getOrCreate = async function(articleId) {
  let analytics = await this.findOne({ article: articleId });

  if (!analytics) {
    analytics = await this.create({ article: articleId });
  }

  return analytics;
};

articleAnalyticsSchema.statics.getTopArticles = async function(limit = 10) {
  return this.find()
    .sort({ totalViews: -1 })
    .limit(limit)
    .populate('article', 'title slug author createdAt');
};

articleAnalyticsSchema.statics.getEngagementStats = async function(articleId) {
  const analytics = await this.findOne({ article: articleId });

  if (!analytics) {
    return {
      totalViews: 0,
      uniqueViews: 0,
      totalComments: 0,
      totalRatings: 0,
      yesRatings: 0,
      noRatings: 0,
      averageRating: 0,
      averageReadTime: 0
    };
  }

  return {
    totalViews: analytics.totalViews,
    uniqueViews: analytics.uniqueViews,
    totalComments: analytics.totalComments,
    totalRatings: analytics.totalRatings,
    yesRatings: analytics.yesRatings,
    noRatings: analytics.noRatings,
    averageRating: analytics.averageRating,
    averageReadTime: analytics.averageReadTime,
    shares: analytics.shares,
    bookmarks: analytics.bookmarks
  };
};

// Virtual for engagement rate
articleAnalyticsSchema.virtual('engagementRate').get(function() {
  if (this.totalViews === 0) return 0;
  const engagementActions = this.totalComments + this.totalRatings + this.shares + this.bookmarks;
  return ((engagementActions / this.totalViews) * 100).toFixed(2);
});

module.exports = mongoose.model('ArticleAnalytics', articleAnalyticsSchema);
