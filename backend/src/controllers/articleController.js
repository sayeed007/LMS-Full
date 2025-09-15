const Article = require('../models/Article');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

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

  // Fetch articles
  const articles = await Article.find(filters)
    .sort(sortOptions)
    .skip(skip)
    .limit(limit)
    .populate('author', 'firstName lastName avatar email')
    .populate('organization', 'name')
    .select('-likedBy'); // Exclude likedBy array for performance

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

  // Fetch articles
  const articles = await Article.find(filters)
    .sort(sortOptions)
    .skip(skip)
    .limit(limit)
    .populate('author', 'firstName lastName avatar email')
    .populate('organization', 'name');

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
    .populate('author', 'firstName lastName avatar email bio')
    .populate('organization', 'name logo');

  if (!article) {
    return next(new AppError('Article not found', 404));
  }

  // Check visibility permissions
  if (article.visibility === 'private' &&
      (!req.user || article.author._id.toString() !== req.user.id)) {
    return next(new AppError('You do not have permission to view this article', 403));
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
  // Add author and organization to the article data
  const articleData = {
    ...req.body,
    author: req.user.id,
    organization: req.user.organization
  };

  const article = await Article.create(articleData);

  // Populate author information for response
  await article.populate('author', 'firstName lastName avatar email');

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

  // Update article
  const updatedArticle = await Article.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  ).populate('author', 'firstName lastName avatar email');

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

  // Find related articles by category and tags
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
  .populate('author', 'firstName lastName avatar');

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
    .populate('author', 'firstName lastName avatar email');

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