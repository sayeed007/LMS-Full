const ArticleAnalytics = require('../models/ArticleAnalytics');
const Article = require('../models/Article');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

/**
 * @desc    Track article view
 * @route   POST /api/v1/analytics/article/:id/view
 * @access  Public/Private (Can be accessed by authenticated or anonymous users)
 */
const trackArticleView = catchAsync(async (req, res, next) => {
  const articleId = req.params.id;
  const { readTime = 0 } = req.body;
  const userId = req.user?._id || null;

  // Get or create analytics record
  let analytics = await ArticleAnalytics.getOrCreate(articleId);

  // Record the view
  if (userId) {
    await analytics.recordView(userId, readTime);
  } else {
    // Anonymous view
    analytics.views.push({
      viewedAt: new Date(),
      readTime,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });
    analytics.totalViews += 1;
    analytics.lastUpdated = Date.now();
    await analytics.save();
  }

  res.status(200).json({
    status: 'success',
    message: 'View tracked successfully'
  });
});

/**
 * @desc    Track article rating (helpful/not helpful)
 * @route   POST /api/v1/analytics/article/:id/rate
 * @access  Public
 */
const trackArticleRating = catchAsync(async (req, res, next) => {
  const articleId = req.params.id;
  const { isHelpful } = req.body;

  if (typeof isHelpful !== 'boolean') {
    return next(new AppError('isHelpful must be a boolean value', 400));
  }

  // Get or create analytics record
  let analytics = await ArticleAnalytics.getOrCreate(articleId);

  // Update rating
  await analytics.updateRating(isHelpful);

  res.status(200).json({
    status: 'success',
    message: 'Rating recorded successfully',
    data: {
      totalRatings: analytics.totalRatings,
      yesRatings: analytics.yesRatings,
      noRatings: analytics.noRatings,
      averageRating: analytics.averageRating
    }
  });
});

/**
 * @desc    Get article analytics
 * @route   GET /api/v1/analytics/article/:id
 * @access  Private (Author, Admin)
 */
const getArticleAnalytics = catchAsync(async (req, res, next) => {
  const articleId = req.params.id;

  // Check if article exists
  const article = await Article.findById(articleId);
  if (!article) {
    return next(new AppError('Article not found', 404));
  }

  // Authorization check
  if (
    req.user.role !== 'super_admin' &&
    req.user.role !== 'org_admin' &&
    article.author.toString() !== req.user._id.toString()
  ) {
    return next(new AppError('You do not have permission to view this article analytics', 403));
  }

  // Get analytics
  const analytics = await ArticleAnalytics.getOrCreate(articleId);

  // Get view history (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentViews = analytics.views.filter(
    view => view.viewedAt >= thirtyDaysAgo
  );

  // Group views by date
  const viewsByDate = {};
  recentViews.forEach(view => {
    const date = view.viewedAt.toISOString().split('T')[0];
    viewsByDate[date] = (viewsByDate[date] || 0) + 1;
  });

  res.status(200).json({
    status: 'success',
    data: {
      analytics: {
        totalViews: analytics.totalViews,
        uniqueViews: analytics.uniqueViews,
        totalComments: analytics.totalComments,
        totalRatings: analytics.totalRatings,
        yesRatings: analytics.yesRatings,
        noRatings: analytics.noRatings,
        averageRating: analytics.averageRating,
        averageReadTime: analytics.averageReadTime,
        shares: analytics.shares,
        bookmarks: analytics.bookmarks,
        engagementRate: analytics.engagementRate
      },
      viewsByDate,
      recentViewsCount: recentViews.length
    }
  });
});

/**
 * @desc    Increment comment count (called when comment is added)
 * @route   POST /api/v1/analytics/article/:id/comment/increment
 * @access  Private
 */
const incrementCommentCount = catchAsync(async (req, res, next) => {
  const articleId = req.params.id;

  const analytics = await ArticleAnalytics.getOrCreate(articleId);
  await analytics.incrementComments();

  res.status(200).json({
    status: 'success',
    message: 'Comment count updated'
  });
});

/**
 * @desc    Decrement comment count (called when comment is deleted)
 * @route   POST /api/v1/analytics/article/:id/comment/decrement
 * @access  Private
 */
const decrementCommentCount = catchAsync(async (req, res, next) => {
  const articleId = req.params.id;

  const analytics = await ArticleAnalytics.getOrCreate(articleId);
  await analytics.decrementComments();

  res.status(200).json({
    status: 'success',
    message: 'Comment count updated'
  });
});

/**
 * @desc    Track article share
 * @route   POST /api/v1/analytics/article/:id/share
 * @access  Public
 */
const trackArticleShare = catchAsync(async (req, res, next) => {
  const articleId = req.params.id;

  const analytics = await ArticleAnalytics.getOrCreate(articleId);
  analytics.shares += 1;
  analytics.lastUpdated = Date.now();
  await analytics.save();

  res.status(200).json({
    status: 'success',
    message: 'Share tracked successfully'
  });
});

/**
 * @desc    Track article bookmark
 * @route   POST /api/v1/analytics/article/:id/bookmark
 * @access  Private
 */
const trackArticleBookmark = catchAsync(async (req, res, next) => {
  const articleId = req.params.id;

  const analytics = await ArticleAnalytics.getOrCreate(articleId);
  analytics.bookmarks += 1;
  analytics.lastUpdated = Date.now();
  await analytics.save();

  res.status(200).json({
    status: 'success',
    message: 'Bookmark tracked successfully'
  });
});

module.exports = {
  trackArticleView,
  trackArticleRating,
  getArticleAnalytics,
  incrementCommentCount,
  decrementCommentCount,
  trackArticleShare,
  trackArticleBookmark
};
