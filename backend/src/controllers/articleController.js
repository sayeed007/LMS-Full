const Article = require('../models/Article');
const ArticleVersion = require('../models/ArticleVersion');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const DOMPurify = require('isomorphic-dompurify');

// Helper function to sanitize HTML content
const sanitizeHTML = (html) => {
  if (!html) return html;

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 's', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'a', 'img', 'blockquote', 'code', 'pre',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'span', 'div', 'iframe', 'video', 'audio', 'source'
    ],
    ALLOWED_ATTR: [
      'href', 'src', 'alt', 'title', 'class', 'id', 'style',
      'target', 'rel', 'width', 'height', 'frameborder', 'allowfullscreen',
      'controls', 'autoplay', 'loop', 'muted'
    ],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i
  });
};

// Helper function for pagination
const getPaginationData = (page, limit, totalResults) => {
  const totalPages = Math.ceil(totalResults / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return {
    currentPage: page,
    totalPages,
    totalResults,
    limit,
    hasNextPage,
    hasPrevPage,
    nextPage: hasNextPage ? page + 1 : null,
    prevPage: hasPrevPage ? page - 1 : null
  };
};

// Helper function to build article query filters
const buildArticleFilters = (queryParams, userId = null, myArticles = false) => {
  const filters = {};

  // Base filters
  if (myArticles && userId) {
    filters.author = userId;
  } else {
    // For public articles, only show published and visible articles
    filters.status = 'published';
    filters.visibility = { $in: ['public', 'organization'] };
  }

  // Additional filters from query parameters
  if (queryParams.category) {
    filters.category = queryParams.category;
  }

  if (queryParams.tags) {
    const tagsArray = queryParams.tags.split(',').map(tag => tag.trim());
    filters.tags = { $in: tagsArray };
  }

  if (queryParams.status && myArticles) {
    // Only allow status filtering for my articles
    filters.status = queryParams.status;
  }

  if (queryParams.author && !myArticles) {
    filters.author = queryParams.author;
  }

  // Search in title, content, and excerpt
  if (queryParams.search) {
    filters.$text = { $search: queryParams.search };
  }

  return filters;
};

// Helper function to build sort options
const buildSortOptions = (sortParam) => {
  switch (sortParam) {
    case 'newest':
      return { publishedAt: -1, createdAt: -1 };
    case 'oldest':
      return { publishedAt: 1, createdAt: 1 };
    case 'popular':
      return { views: -1, likes: -1 };
    case 'title':
      return { title: 1 };
    default:
      return { publishedAt: -1, createdAt: -1 };
  }
};

// Get all articles with filtering and pagination
exports.getAllArticles = catchAsync(async (req, res, next) => {
  // Parse pagination parameters
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Build filters and sort options
  const filters = buildArticleFilters(req.query);
  const sortOptions = buildSortOptions(req.query.sort);

  // Get total count for pagination
  const totalResults = await Article.countDocuments(filters);

  // Fetch articles (exclude full content for performance, return excerpt instead)
  const articles = await Article.find(filters)
    .sort(sortOptions)
    .skip(skip)
    .limit(limit)
    .populate('author', 'name avatar email')
    .populate('organization', 'name')
    .select('-content -likedBy'); // Exclude full content and likedBy array for performance

  // Add text search score if searching
  if (req.query.search) {
    articles.forEach(article => {
      if (article._doc) {
        article._doc.score = article.score;
      }
    });
  }

  // Get pagination data
  const pagination = getPaginationData(page, limit, totalResults);

  res.status(200).json({
    status: 'success',
    results: articles.length,
    pagination,
    data: articles
  });
});

// Get user's own articles
exports.getMyArticles = catchAsync(async (req, res, next) => {
  // Parse pagination parameters
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Build filters and sort options
  const filters = buildArticleFilters(req.query, req.user.id, true);
  const sortOptions = buildSortOptions(req.query.sort);

  // Get total count for pagination
  const totalResults = await Article.countDocuments(filters);

  // Fetch articles (exclude full content for performance in list view)
  const articles = await Article.find(filters)
    .sort(sortOptions)
    .skip(skip)
    .limit(limit)
    .populate('author', 'name avatar email')
    .populate('organization', 'name')
    .select('-content -likedBy'); // Exclude content and likedBy for performance

  // Get pagination data
  const pagination = getPaginationData(page, limit, totalResults);

  res.status(200).json({
    status: 'success',
    results: articles.length,
    pagination,
    data: articles
  });
});

// Get article by ID
exports.getArticleById = catchAsync(async (req, res, next) => {
  const article = await Article.findById(req.params.id)
    .populate('author', 'name avatar email bio')
    .populate('organization', 'name logo');

  if (!article) {
    return next(new AppError('Article not found', 404));
  }

  // Check visibility permissions
  // Authors can always view their own articles
  const isAuthor = req.user && article.author._id.toString() === req.user.id;

  if (!isAuthor) {
    if (article.visibility === 'private') {
      // Private articles: only author can view
      return next(new AppError('You do not have permission to view this article', 403));
    } else if (article.visibility === 'organization') {
      // Organization articles: only users from the same organization can view
      if (!req.user) {
        return next(new AppError('You must be logged in to view this article', 401));
      }
      if (!article.organization || !req.user.organization ||
          article.organization._id.toString() !== req.user.organization.toString()) {
        return next(new AppError('You do not have permission to view this article', 403));
      }
    }
    // Public articles: no restrictions
  }

  // Increment views (only if not the author viewing their own article)
  if (!req.user || article.author._id.toString() !== req.user.id) {
    await article.incrementViews();
  }

  res.status(200).json({
    status: 'success',
    data: {
      article
    }
  });
});

// Create new article
exports.createArticle = catchAsync(async (req, res, next) => {
  // Sanitize HTML content to prevent XSS attacks
  if (req.body.content) {
    req.body.content = sanitizeHTML(req.body.content);
  }

  // Add author and organization to the article data
  const articleData = {
    ...req.body,
    author: req.user.id,
    organization: req.user.organization
  };

  const article = await Article.create(articleData);

  // Populate author information for response
  await article.populate('author', 'name avatar email');

  res.status(201).json({
    status: 'success',
    data: {
      article
    }
  });
});

// Update article
exports.updateArticle = catchAsync(async (req, res, next) => {
  const article = await Article.findById(req.params.id);

  if (!article) {
    return next(new AppError('Article not found', 404));
  }

  // Check if user is the author or has permission to edit
  if (article.author.toString() !== req.user.id &&
      !['org_admin', 'super_admin'].includes(req.user.role)) {
    return next(new AppError('You do not have permission to edit this article', 403));
  }

  // Sanitize HTML content to prevent XSS attacks
  if (req.body.content) {
    req.body.content = sanitizeHTML(req.body.content);
  }

  // Create version snapshot before updating (only for significant changes)
  const hasSignificantChange = req.body.content || req.body.title;
  if (hasSignificantChange) {
    await ArticleVersion.createSnapshot(article, req.user.id, req.body.changeNote);
  }

  // Update article
  const updatedArticle = await Article.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  ).populate('author', 'name avatar email');

  res.status(200).json({
    status: 'success',
    data: {
      article: updatedArticle
    }
  });
});

// Delete article
exports.deleteArticle = catchAsync(async (req, res, next) => {
  const article = await Article.findById(req.params.id);

  if (!article) {
    return next(new AppError('Article not found', 404));
  }

  // Check if user is the author or has permission to delete
  if (article.author.toString() !== req.user.id &&
      !['org_admin', 'super_admin'].includes(req.user.role)) {
    return next(new AppError('You do not have permission to delete this article', 403));
  }

  await Article.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Duplicate article
exports.duplicateArticle = catchAsync(async (req, res, next) => {
  const originalArticle = await Article.findById(req.params.id);

  if (!originalArticle) {
    return next(new AppError('Article not found', 404));
  }

  // Check if user is the author or has permission
  if (originalArticle.author.toString() !== req.user.id &&
      !['org_admin', 'super_admin'].includes(req.user.role)) {
    return next(new AppError('You do not have permission to duplicate this article', 403));
  }

  // Create duplicate with modified title and reset stats
  const duplicateData = {
    title: `${originalArticle.title} (Copy)`,
    content: originalArticle.content,
    excerpt: originalArticle.excerpt,
    category: originalArticle.category,
    tags: originalArticle.tags,
    thumbnail: originalArticle.thumbnail,
    author: req.user.id, // Set current user as author
    status: 'draft', // Always create as draft
    visibility: originalArticle.visibility,
    organization: req.user.organization,
    // Reset engagement metrics
    views: 0,
    likes: 0,
    likedBy: []
  };

  const duplicatedArticle = await Article.create(duplicateData);

  // Populate author information
  await duplicatedArticle.populate('author', 'name avatar email');

  res.status(201).json({
    status: 'success',
    data: {
      article: duplicatedArticle
    }
  });
});

// Like/Unlike article
exports.toggleLikeArticle = catchAsync(async (req, res, next) => {
  const article = await Article.findById(req.params.id);

  if (!article) {
    return next(new AppError('Article not found', 404));
  }

  const wasLiked = article.likedBy.includes(req.user.id);
  await article.toggleLike(req.user.id);

  res.status(200).json({
    status: 'success',
    data: {
      message: wasLiked ? 'Article unliked successfully' : 'Article liked successfully',
      liked: !wasLiked,
      likes: article.likes
    }
  });
});

// Get article categories
exports.getArticleCategories = catchAsync(async (req, res, next) => {
  const categories = await Article.getCategories();

  res.status(200).json({
    status: 'success',
    data: {
      categories
    }
  });
});

// Get featured articles
exports.getFeaturedArticles = catchAsync(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 5;
  const articles = await Article.getFeatured(limit);

  res.status(200).json({
    status: 'success',
    results: articles.length,
    data: articles
  });
});

// Get popular articles
exports.getPopularArticles = catchAsync(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 10;
  const period = req.query.period || 'week';
  const articles = await Article.getPopular(limit, period);

  res.status(200).json({
    status: 'success',
    results: articles.length,
    data: articles
  });
});

// Get related articles
exports.getRelatedArticles = catchAsync(async (req, res, next) => {
  const article = await Article.findById(req.params.id);

  if (!article) {
    return next(new AppError('Article not found', 404));
  }

  const limit = parseInt(req.query.limit) || 5;

  // Find related articles by category and tags (exclude full content)
  const relatedArticles = await Article.find({
    _id: { $ne: article._id },
    status: 'published',
    visibility: { $in: ['public', 'organization'] },
    $or: [
      { category: article.category },
      { tags: { $in: article.tags } }
    ]
  })
  .sort({ likes: -1, views: -1 })
  .limit(limit)
  .populate('author', 'name avatar')
  .select('-content -likedBy'); // Exclude content and likedBy for performance

  res.status(200).json({
    status: 'success',
    results: relatedArticles.length,
    data: relatedArticles
  });
});

// Search articles
exports.searchArticles = catchAsync(async (req, res, next) => {
  const { q: searchQuery } = req.query;

  if (!searchQuery) {
    return next(new AppError('Search query is required', 400));
  }

  // Parse pagination parameters
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Build search filters
  const filters = {
    $text: { $search: searchQuery },
    status: 'published',
    visibility: { $in: ['public', 'organization'] },
    ...buildArticleFilters(req.query)
  };

  // Get total count
  const totalResults = await Article.countDocuments(filters);

  // Search articles
  const articles = await Article.find(filters, { score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' }, publishedAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('author', 'name avatar email');

  // Get pagination data
  const pagination = getPaginationData(page, limit, totalResults);

  res.status(200).json({
    status: 'success',
    results: articles.length,
    pagination,
    data: articles
  });
});

// Publish article
exports.publishArticle = catchAsync(async (req, res, next) => {
  const article = await Article.findById(req.params.id);

  if (!article) {
    return next(new AppError('Article not found', 404));
  }

  // Check permissions
  if (article.author.toString() !== req.user.id &&
      !['org_admin', 'super_admin'].includes(req.user.role)) {
    return next(new AppError('You do not have permission to publish this article', 403));
  }

  article.status = 'published';
  if (!article.publishedAt) {
    article.publishedAt = new Date();
  }

  await article.save();

  res.status(200).json({
    status: 'success',
    data: {
      article
    }
  });
});

// Archive article
exports.archiveArticle = catchAsync(async (req, res, next) => {
  const article = await Article.findById(req.params.id);

  if (!article) {
    return next(new AppError('Article not found', 404));
  }

  // Check permissions
  if (article.author.toString() !== req.user.id &&
      !['org_admin', 'super_admin'].includes(req.user.role)) {
    return next(new AppError('You do not have permission to archive this article', 403));
  }

  article.status = 'archived';
  await article.save();

  res.status(200).json({
    status: 'success',
    data: {
      article
    }
  });
});

// Get article stats
exports.getArticleStats = catchAsync(async (req, res, next) => {
  const userId = req.user.id;

  const stats = await Article.aggregate([
    {
      $facet: {
        totalArticles: [
          { $match: { author: userId } },
          { $count: 'count' }
        ],
        publishedArticles: [
          { $match: { author: userId, status: 'published' } },
          { $count: 'count' }
        ],
        draftArticles: [
          { $match: { author: userId, status: 'draft' } },
          { $count: 'count' }
        ],
        totalViews: [
          { $match: { author: userId } },
          { $group: { _id: null, total: { $sum: '$views' } } }
        ],
        totalLikes: [
          { $match: { author: userId } },
          { $group: { _id: null, total: { $sum: '$likes' } } }
        ],
        articlesThisMonth: [
          {
            $match: {
              author: userId,
              createdAt: {
                $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
              }
            }
          },
          { $count: 'count' }
        ]
      }
    }
  ]);

  const result = stats[0];

  const articleStats = {
    totalArticles: result.totalArticles[0]?.count || 0,
    publishedArticles: result.publishedArticles[0]?.count || 0,
    draftArticles: result.draftArticles[0]?.count || 0,
    totalViews: result.totalViews[0]?.total || 0,
    totalLikes: result.totalLikes[0]?.total || 0,
    articlesThisMonth: result.articlesThisMonth[0]?.count || 0
  };

  res.status(200).json({
    status: 'success',
    data: articleStats
  });
});

// Get article version history
exports.getArticleVersions = catchAsync(async (req, res, next) => {
  const article = await Article.findById(req.params.id);

  if (!article) {
    return next(new AppError('Article not found', 404));
  }

  // Check if user has access to view versions
  if (article.author.toString() !== req.user.id &&
      !['org_admin', 'super_admin'].includes(req.user.role)) {
    return next(new AppError('You do not have permission to view article versions', 403));
  }

  const limit = parseInt(req.query.limit) || 20;
  const versions = await ArticleVersion.getVersionHistory(req.params.id, limit);

  res.status(200).json({
    status: 'success',
    results: versions.length,
    data: versions
  });
});

// Get specific version
exports.getArticleVersion = catchAsync(async (req, res, next) => {
  const article = await Article.findById(req.params.id);

  if (!article) {
    return next(new AppError('Article not found', 404));
  }

  // Check if user has access
  if (article.author.toString() !== req.user.id &&
      !['org_admin', 'super_admin'].includes(req.user.role)) {
    return next(new AppError('You do not have permission to view article versions', 403));
  }

  const version = await ArticleVersion.getVersion(req.params.id, parseInt(req.params.versionNumber));

  if (!version) {
    return next(new AppError('Version not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: version
  });
});

// Restore article from version
exports.restoreArticleVersion = catchAsync(async (req, res, next) => {
  const article = await Article.findById(req.params.id);

  if (!article) {
    return next(new AppError('Article not found', 404));
  }

  // Check if user has permission
  if (article.author.toString() !== req.user.id &&
      !['org_admin', 'super_admin'].includes(req.user.role)) {
    return next(new AppError('You do not have permission to restore article versions', 403));
  }

  const version = await ArticleVersion.getVersion(req.params.id, parseInt(req.params.versionNumber));

  if (!version) {
    return next(new AppError('Version not found', 404));
  }

  // Create snapshot of current state before restoring
  await ArticleVersion.createSnapshot(article, req.user.id, 'Before restore');

  // Restore from version
  article.title = version.title;
  article.content = version.content;
  article.excerpt = version.excerpt;
  article.category = version.category;
  article.tags = version.tags;
  article.thumbnail = version.thumbnail;

  await article.save();
  await article.populate('author', 'name avatar email');

  res.status(200).json({
    status: 'success',
    data: {
      article
    },
    message: `Article restored to version ${req.params.versionNumber}`
  });
});

/**
 * Get article analytics/insights
 * @route GET /api/v1/articles/:id/analytics
 * @access Private (Author or Admin)
 */
exports.getArticleAnalytics = catchAsync(async (req, res, next) => {
  const article = await Article.findById(req.params.id)
    .populate('author', 'name avatar email')
    .select('+likedBy');

  if (!article) {
    return next(new AppError('Article not found', 404));
  }

  // Check if user has permission to view analytics
  if (article.author._id.toString() !== req.user.id && req.user.role !== 'super_admin') {
    return next(new AppError('You do not have permission to view this article\'s analytics', 403));
  }

  // Get comments for this article
  const Comment = require('../models/Comment');
  const comments = await Comment.find({ article: article._id, deletedAt: null });
  const totalComments = comments.length;
  const totalReplies = comments.filter(c => c.parentComment).length;
  const topLevelComments = comments.filter(c => !c.parentComment).length;

  // Get engagement rate (likes + comments per view)
  const engagementRate = article.views > 0
    ? ((article.likes + totalComments) / article.views * 100).toFixed(2)
    : 0;

  // Get version history count
  const ArticleVersion = require('../models/ArticleVersion');
  const versionCount = await ArticleVersion.countDocuments({ article: article._id });

  // Prepare analytics data
  const analytics = {
    views: article.views,
    likes: article.likes,
    likeRate: article.views > 0 ? (article.likes / article.views * 100).toFixed(2) : 0,
    comments: {
      total: totalComments,
      topLevel: topLevelComments,
      replies: totalReplies
    },
    engagement: {
      rate: engagementRate,
      totalInteractions: article.likes + totalComments
    },
    versions: versionCount,
    readTime: article.readTime,
    publishedAt: article.publishedAt,
    lastUpdated: article.updatedAt,
    status: article.status,
    visibility: article.visibility,
    category: article.category,
    tags: article.tags
  };

  res.status(200).json({
    status: 'success',
    data: {
      analytics
    }
  });
});

/**
 * Bookmark/favorite an article
 * @route POST /api/v1/articles/:id/bookmark
 * @access Private
 */
exports.bookmarkArticle = catchAsync(async (req, res, next) => {
  const User = require('../models/User');
  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  const article = await Article.findById(req.params.id);
  if (!article) {
    return next(new AppError('Article not found', 404));
  }

  // Check if article is already bookmarked
  const isBookmarked = user.bookmarkedArticles.includes(req.params.id);

  if (isBookmarked) {
    return next(new AppError('Article is already bookmarked', 400));
  }

  // Add to bookmarks
  user.bookmarkedArticles.push(req.params.id);
  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'Article bookmarked successfully',
    data: {
      bookmarkedArticles: user.bookmarkedArticles
    }
  });
});

/**
 * Remove bookmark/unfavorite an article
 * @route DELETE /api/v1/articles/:id/bookmark
 * @access Private
 */
exports.unbookmarkArticle = catchAsync(async (req, res, next) => {
  const User = require('../models/User');
  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Check if article is bookmarked
  const isBookmarked = user.bookmarkedArticles.includes(req.params.id);

  if (!isBookmarked) {
    return next(new AppError('Article is not bookmarked', 400));
  }

  // Remove from bookmarks
  user.bookmarkedArticles = user.bookmarkedArticles.filter(
    id => id.toString() !== req.params.id
  );
  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'Article bookmark removed successfully',
    data: {
      bookmarkedArticles: user.bookmarkedArticles
    }
  });
});

/**
 * Get user's bookmarked articles
 * @route GET /api/v1/articles/bookmarks
 * @access Private
 */
exports.getBookmarkedArticles = catchAsync(async (req, res, next) => {
  const User = require('../models/User');
  const user = await User.findById(req.user.id).populate({
    path: 'bookmarkedArticles',
    select: '-content -likedBy',
    populate: {
      path: 'author',
      select: 'name avatar email'
    }
  });

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    status: 'success',
    results: user.bookmarkedArticles.length,
    data: {
      articles: user.bookmarkedArticles
    }
  });
});