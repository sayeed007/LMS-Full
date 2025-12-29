const Comment = require('../models/Comment');
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

// @desc    Get all comments for an article
// @route   GET /api/v1/articles/:articleId/comments
// @access  Public
exports.getArticleComments = catchAsync(async (req, res, next) => {
  const { articleId } = req.params;

  // Verify article exists
  const article = await Article.findById(articleId);
  if (!article) {
    return next(new AppError('Article not found', 404));
  }

  // Parse pagination parameters
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  const sortBy = req.query.sortBy || 'createdAt';
  const order = req.query.order || 'desc';

  // Build query for top-level comments only
  const query = {
    article: articleId,
    parentComment: null,
    status: 'active'
  };

  // Get total count for pagination
  const totalResults = await Comment.countDocuments(query);

  // Fetch comments with populated author and replies
  const comments = await Comment.find(query)
    .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
    .skip(skip)
    .limit(limit)
    .populate('author', 'name avatar')
    .populate({
      path: 'replies',
      populate: { path: 'author', select: 'name avatar' },
      options: { sort: { createdAt: 1 }, limit: 5 }
    })
    .select('-likedBy'); // Exclude likedBy array for performance

  const pagination = getPaginationData(page, limit, totalResults);

  res.status(200).json({
    status: 'success',
    results: comments.length,
    pagination,
    data: {
      comments
    }
  });
});

// @desc    Get a single comment by ID
// @route   GET /api/v1/articles/:articleId/comments/:commentId
// @access  Public
exports.getCommentById = catchAsync(async (req, res, next) => {
  const { commentId } = req.params;

  const comment = await Comment.findById(commentId)
    .populate('author', 'name avatar')
    .populate({
      path: 'replies',
      populate: { path: 'author', select: 'name avatar' },
      options: { sort: { createdAt: 1 } }
    })
    .select('-likedBy');

  if (!comment || comment.status === 'deleted') {
    return next(new AppError('Comment not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      comment
    }
  });
});

// @desc    Create a new comment
// @route   POST /api/v1/articles/:articleId/comments
// @access  Private
exports.createComment = catchAsync(async (req, res, next) => {
  const { articleId } = req.params;
  const { content, parentComment } = req.body;

  // Verify article exists
  const article = await Article.findById(articleId);
  if (!article) {
    return next(new AppError('Article not found', 404));
  }

  // If this is a reply, verify parent comment exists
  if (parentComment) {
    const parent = await Comment.findById(parentComment);
    if (!parent) {
      return next(new AppError('Parent comment not found', 404));
    }
    // Ensure parent comment belongs to the same article
    if (parent.article.toString() !== articleId) {
      return next(new AppError('Parent comment does not belong to this article', 400));
    }
  }

  // Create comment
  const comment = await Comment.create({
    content,
    article: articleId,
    author: req.user.id,
    parentComment: parentComment || null
  });

  // Populate author information
  await comment.populate('author', 'name avatar');

  res.status(201).json({
    status: 'success',
    data: {
      comment
    }
  });
});

// @desc    Update a comment
// @route   PATCH /api/v1/articles/:articleId/comments/:commentId
// @access  Private (Author only)
exports.updateComment = catchAsync(async (req, res, next) => {
  const { commentId } = req.params;
  const { content } = req.body;

  const comment = await Comment.findById(commentId);

  if (!comment || comment.status === 'deleted') {
    return next(new AppError('Comment not found', 404));
  }

  // Check if user is the author
  if (comment.author.toString() !== req.user.id) {
    return next(new AppError('You can only edit your own comments', 403));
  }

  // Update comment
  comment.content = content;
  await comment.save();

  // Populate author information
  await comment.populate('author', 'name avatar');

  res.status(200).json({
    status: 'success',
    data: {
      comment
    }
  });
});

// @desc    Delete a comment (soft delete)
// @route   DELETE /api/v1/articles/:articleId/comments/:commentId
// @access  Private (Author only or Admin)
exports.deleteComment = catchAsync(async (req, res, next) => {
  const { commentId } = req.params;

  const comment = await Comment.findById(commentId);

  if (!comment || comment.status === 'deleted') {
    return next(new AppError('Comment not found', 404));
  }

  // Check if user is the author or an admin
  const isAuthor = comment.author.toString() === req.user.id;
  const isAdmin = ['admin', 'super_admin', 'org_admin'].includes(req.user.role);

  if (!isAuthor && !isAdmin) {
    return next(new AppError('You do not have permission to delete this comment', 403));
  }

  // Soft delete
  await comment.softDelete();

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// @desc    Toggle like on a comment
// @route   POST /api/v1/articles/:articleId/comments/:commentId/like
// @access  Private
exports.toggleLikeComment = catchAsync(async (req, res, next) => {
  const { commentId } = req.params;

  const comment = await Comment.findById(commentId);

  if (!comment || comment.status === 'deleted') {
    return next(new AppError('Comment not found', 404));
  }

  // Toggle like
  await comment.toggleLike(req.user.id);

  // Populate author information
  await comment.populate('author', 'name avatar');

  res.status(200).json({
    status: 'success',
    data: {
      comment,
      isLiked: comment.likedBy.includes(req.user.id)
    }
  });
});

// @desc    Get comment replies (nested comments)
// @route   GET /api/v1/articles/:articleId/comments/:commentId/replies
// @access  Public
exports.getCommentReplies = catchAsync(async (req, res, next) => {
  const { commentId } = req.params;

  // Verify parent comment exists
  const parentComment = await Comment.findById(commentId);
  if (!parentComment || parentComment.status === 'deleted') {
    return next(new AppError('Comment not found', 404));
  }

  // Parse pagination parameters
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Get total count for pagination
  const totalResults = await Comment.countDocuments({
    parentComment: commentId,
    status: 'active'
  });

  // Fetch replies
  const replies = await Comment.find({
    parentComment: commentId,
    status: 'active'
  })
    .sort({ createdAt: 1 })
    .skip(skip)
    .limit(limit)
    .populate('author', 'name avatar')
    .select('-likedBy');

  const pagination = getPaginationData(page, limit, totalResults);

  res.status(200).json({
    status: 'success',
    results: replies.length,
    pagination,
    data: {
      replies
    }
  });
});
