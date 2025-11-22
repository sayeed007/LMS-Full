const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

/**
 * @desc    Get all conversations for the current user
 * @route   GET /api/v1/messages/conversations
 * @access  Private
 */
exports.getConversations = catchAsync(async (req, res, next) => {
  const { includeArchived = false, limit = 20, page = 1 } = req.query;
  const skip = (page - 1) * limit;

  const conversations = await Conversation.getUserConversations(req.user.id, {
    includeArchived: includeArchived === 'true',
    limit: parseInt(limit),
    skip: parseInt(skip)
  });

  // Add unread count and online status for each conversation
  const conversationsWithDetails = conversations.map(conv => {
    const otherParticipant = conv.getOtherParticipant(req.user.id);
    const unreadCount = conv.unreadCount.get(req.user.id.toString()) || 0;

    return {
      ...conv.toObject(),
      otherParticipant,
      unreadCount,
      isArchived: conv.archivedBy.includes(req.user.id)
    };
  });

  // Get total count for pagination
  const totalQuery = {
    participants: req.user.id,
    isActive: true
  };

  if (includeArchived !== 'true') {
    totalQuery.archivedBy = { $ne: req.user.id };
  }

  const total = await Conversation.countDocuments(totalQuery);

  res.status(200).json({
    status: 'success',
    results: conversationsWithDetails.length,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalConversations: total
    },
    data: conversationsWithDetails
  });
});

/**
 * @desc    Get or create a conversation with another user
 * @route   GET /api/v1/messages/conversations/:userId
 * @access  Private
 */
exports.getOrCreateConversation = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  // Check if the other user exists
  const otherUser = await User.findById(userId).select('name email avatar role isActive');

  if (!otherUser || !otherUser.isActive) {
    return next(new AppError('User not found or inactive', 404));
  }

  // Prevent conversation with self
  if (userId === req.user.id) {
    return next(new AppError('Cannot create conversation with yourself', 400));
  }

  // Find or create conversation
  const conversation = await Conversation.findOrCreate(req.user.id, userId);

  // Populate participants
  await conversation.populate('participants', 'name email avatar role');
  await conversation.populate('lastMessage');

  const otherParticipant = conversation.getOtherParticipant(req.user.id);
  const unreadCount = conversation.unreadCount.get(req.user.id.toString()) || 0;

  res.status(200).json({
    status: 'success',
    data: {
      conversation: {
        ...conversation.toObject(),
        otherParticipant,
        unreadCount
      }
    }
  });
});

/**
 * @desc    Get messages for a specific conversation
 * @route   GET /api/v1/messages/conversations/:conversationId/messages
 * @access  Private
 */
exports.getMessages = catchAsync(async (req, res, next) => {
  const { conversationId } = req.params;
  const { limit = 50, page = 1, before } = req.query;
  const skip = (page - 1) * limit;

  // Verify user is part of the conversation
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    return next(new AppError('Conversation not found', 404));
  }

  if (!conversation.participants.includes(req.user.id)) {
    return next(new AppError('Not authorized to view this conversation', 403));
  }

  // Build query
  const query = { conversation: conversationId };

  // For infinite scroll: get messages before a certain timestamp
  if (before) {
    query.createdAt = { $lt: new Date(before) };
  }

  // Get messages
  const messages = await Message.find(query)
    .populate('sender', 'name email avatar')
    .populate('receiver', 'name email avatar')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(parseInt(skip));

  // Reverse to show oldest first
  messages.reverse();

  // Get total count
  const total = await Message.countDocuments(query);

  res.status(200).json({
    status: 'success',
    results: messages.length,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalMessages: total,
      hasMore: skip + messages.length < total
    },
    data: messages
  });
});

/**
 * @desc    Send a message (REST API fallback)
 * @route   POST /api/v1/messages
 * @access  Private
 */
exports.sendMessage = catchAsync(async (req, res, next) => {
  const { receiverId, content, conversationId, messageType = 'text', attachments = [] } = req.body;

  if (!receiverId && !conversationId) {
    return next(new AppError('Either receiverId or conversationId is required', 400));
  }

  if (!content || content.trim().length === 0) {
    return next(new AppError('Message content cannot be empty', 400));
  }

  // Find or create conversation
  let conversation;
  if (conversationId) {
    conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return next(new AppError('Conversation not found', 404));
    }

    // Verify user is part of this conversation
    if (!conversation.participants.includes(req.user.id)) {
      return next(new AppError('Not authorized to send messages in this conversation', 403));
    }
  } else {
    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver || !receiver.isActive) {
      return next(new AppError('Receiver not found or inactive', 404));
    }

    conversation = await Conversation.findOrCreate(req.user.id, receiverId);
  }

  // Get the other participant
  const otherParticipant = conversation.getOtherParticipant(req.user.id);

  // Create message
  const message = await Message.create({
    conversation: conversation._id,
    sender: req.user.id,
    receiver: otherParticipant._id,
    content: content.trim(),
    messageType,
    attachments
  });

  // Populate sender and receiver
  await message.populate('sender', 'name email avatar');
  await message.populate('receiver', 'name email avatar');

  // Update conversation
  await conversation.updateLastMessage(message._id);
  await conversation.incrementUnread(otherParticipant._id);

  // Emit real-time event via Socket.io
  const io = req.app.get('io');
  if (io) {
    io.to(`conversation:${conversation._id}`).emit('message:new', {
      message,
      conversationId: conversation._id
    });
  }

  res.status(201).json({
    status: 'success',
    data: {
      message,
      conversationId: conversation._id
    }
  });
});

/**
 * @desc    Mark conversation messages as read
 * @route   PATCH /api/v1/messages/conversations/:conversationId/read
 * @access  Private
 */
exports.markAsRead = catchAsync(async (req, res, next) => {
  const { conversationId } = req.params;

  // Verify conversation exists and user is part of it
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    return next(new AppError('Conversation not found', 404));
  }

  if (!conversation.participants.includes(req.user.id)) {
    return next(new AppError('Not authorized to access this conversation', 403));
  }

  // Mark all messages as read
  await Message.markConversationAsRead(conversationId, req.user.id);

  // Reset unread count
  await conversation.resetUnread(req.user.id);

  // Emit real-time event
  const io = req.app.get('io');
  if (io) {
    const otherParticipant = conversation.getOtherParticipant(req.user.id);
    io.to(`conversation:${conversationId}`).emit('messages:read', {
      conversationId,
      userId: req.user.id,
      readBy: otherParticipant._id
    });
  }

  res.status(200).json({
    status: 'success',
    message: 'Messages marked as read'
  });
});

/**
 * @desc    Delete a message (soft delete)
 * @route   DELETE /api/v1/messages/:messageId
 * @access  Private
 */
exports.deleteMessage = catchAsync(async (req, res, next) => {
  const { messageId } = req.params;

  const message = await Message.findById(messageId);

  if (!message) {
    return next(new AppError('Message not found', 404));
  }

  // Only sender can delete their message
  if (message.sender.toString() !== req.user.id) {
    return next(new AppError('Not authorized to delete this message', 403));
  }

  // Soft delete
  await message.softDelete(req.user.id);

  // Emit real-time event
  const io = req.app.get('io');
  if (io) {
    io.to(`conversation:${message.conversation}`).emit('message:deleted', {
      messageId: message._id,
      conversationId: message.conversation
    });
  }

  res.status(200).json({
    status: 'success',
    message: 'Message deleted successfully'
  });
});

/**
 * @desc    Search users to start a conversation
 * @route   GET /api/v1/messages/users/search
 * @access  Private
 */
exports.searchUsers = catchAsync(async (req, res, next) => {
  const { q, role, limit = 10 } = req.query;

  if (!q || q.trim().length < 2) {
    return next(new AppError('Search query must be at least 2 characters', 400));
  }

  // Build search query
  const searchQuery = {
    $and: [
      { _id: { $ne: req.user.id } }, // Exclude self
      { isActive: true },
      {
        $or: [
          { name: { $regex: q, $options: 'i' } },
          { email: { $regex: q, $options: 'i' } }
        ]
      }
    ]
  };

  // Filter by role if provided
  if (role) {
    searchQuery.$and.push({ role });
  }

  const users = await User.find(searchQuery)
    .select('name email avatar role')
    .limit(parseInt(limit));

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: users
  });
});

/**
 * @desc    Get total unread message count
 * @route   GET /api/v1/messages/unread-count
 * @access  Private
 */
exports.getUnreadCount = catchAsync(async (req, res, next) => {
  const totalUnread = await Conversation.getTotalUnreadCount(req.user.id);

  res.status(200).json({
    status: 'success',
    data: {
      unreadCount: totalUnread
    }
  });
});

/**
 * @desc    Archive a conversation
 * @route   PATCH /api/v1/messages/conversations/:conversationId/archive
 * @access  Private
 */
exports.archiveConversation = catchAsync(async (req, res, next) => {
  const { conversationId } = req.params;

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    return next(new AppError('Conversation not found', 404));
  }

  if (!conversation.participants.includes(req.user.id)) {
    return next(new AppError('Not authorized to archive this conversation', 403));
  }

  await conversation.archiveForUser(req.user.id);

  res.status(200).json({
    status: 'success',
    message: 'Conversation archived successfully'
  });
});

/**
 * @desc    Unarchive a conversation
 * @route   PATCH /api/v1/messages/conversations/:conversationId/unarchive
 * @access  Private
 */
exports.unarchiveConversation = catchAsync(async (req, res, next) => {
  const { conversationId } = req.params;

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    return next(new AppError('Conversation not found', 404));
  }

  if (!conversation.participants.includes(req.user.id)) {
    return next(new AppError('Not authorized to unarchive this conversation', 403));
  }

  await conversation.unarchiveForUser(req.user.id);

  res.status(200).json({
    status: 'success',
    message: 'Conversation unarchived successfully'
  });
});
