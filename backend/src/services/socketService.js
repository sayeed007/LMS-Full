const jwt = require('jsonwebtoken');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');

// Store active connections: userId => socketId
const activeUsers = new Map();

// Store typing status: conversationId => Set of userIds
const typingUsers = new Map();

/**
 * Verify JWT token from socket handshake
 */
const authenticateSocket = async (socket) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new Error('No authentication token provided');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user || !user.isActive) {
      throw new Error('User not found or inactive');
    }

    return user;
  } catch (error) {
    throw new Error('Authentication failed: ' + error.message);
  }
};

/**
 * Initialize Socket.io service
 */
const initialize = (io) => {
  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const user = await authenticateSocket(socket);
      socket.user = user;
      next();
    } catch (error) {
      next(new Error(error.message));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user._id.toString();
    console.log(`User connected: ${socket.user.name} (${userId})`);

    // Store active connection
    activeUsers.set(userId, socket.id);

    // Notify user's contacts that they're online
    socket.broadcast.emit('user:online', { userId });

    // Send current online users to the newly connected user
    const onlineUserIds = Array.from(activeUsers.keys());
    socket.emit('users:online', { userIds: onlineUserIds });

    /**
     * Join a conversation room
     */
    socket.on('conversation:join', async (data) => {
      try {
        const { conversationId } = data;

        // Verify user is part of this conversation
        const conversation = await Conversation.findById(conversationId);
        if (!conversation || !conversation.participants.includes(userId)) {
          socket.emit('error', { message: 'Not authorized to join this conversation' });
          return;
        }

        // Join the room
        socket.join(`conversation:${conversationId}`);
        console.log(`User ${userId} joined conversation ${conversationId}`);

        // Mark messages as read
        await Message.markConversationAsRead(conversationId, userId);
        await conversation.resetUnread(userId);

        // Notify other user that messages were read
        const otherParticipant = conversation.getOtherParticipant(userId);
        const otherSocketId = activeUsers.get(otherParticipant._id.toString());

        if (otherSocketId) {
          io.to(otherSocketId).emit('messages:read', {
            conversationId,
            userId
          });
        }

        socket.emit('conversation:joined', { conversationId });
      } catch (error) {
        console.error('Error joining conversation:', error);
        socket.emit('error', { message: error.message });
      }
    });

    /**
     * Leave a conversation room
     */
    socket.on('conversation:leave', (data) => {
      const { conversationId } = data;
      socket.leave(`conversation:${conversationId}`);
      console.log(`User ${userId} left conversation ${conversationId}`);
    });

    /**
     * Send a message
     */
    socket.on('message:send', async (data) => {
      try {
        const { conversationId, receiverId, content, messageType = 'text', attachments = [] } = data;

        // Find or create conversation
        let conversation = await Conversation.findById(conversationId);
        if (!conversation) {
          conversation = await Conversation.findOrCreate(userId, receiverId);
        }

        // Verify user is part of this conversation
        if (!conversation.participants.includes(userId)) {
          socket.emit('error', { message: 'Not authorized to send messages in this conversation' });
          return;
        }

        // Create message
        const message = await Message.create({
          conversation: conversation._id,
          sender: userId,
          receiver: receiverId,
          content,
          messageType,
          attachments
        });

        // Populate sender and receiver info
        await message.populate('sender', 'name email avatar');
        await message.populate('receiver', 'name email avatar');

        // Update conversation
        await conversation.updateLastMessage(message._id);
        await conversation.incrementUnread(receiverId);

        // Emit to conversation room
        io.to(`conversation:${conversation._id}`).emit('message:new', {
          message,
          conversationId: conversation._id
        });

        // Send notification to receiver if they're online but not in the conversation
        const receiverSocketId = activeUsers.get(receiverId.toString());
        if (receiverSocketId) {
          const receiverSocket = io.sockets.sockets.get(receiverSocketId);
          const inConversation = receiverSocket?.rooms.has(`conversation:${conversation._id}`);

          if (!inConversation) {
            io.to(receiverSocketId).emit('message:notification', {
              message,
              conversationId: conversation._id,
              sender: socket.user
            });
          }
        }

        console.log(`Message sent from ${userId} to ${receiverId}`);
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: error.message });
      }
    });

    /**
     * Typing indicator
     */
    socket.on('typing:start', async (data) => {
      const { conversationId } = data;

      // Add user to typing set for this conversation
      if (!typingUsers.has(conversationId)) {
        typingUsers.set(conversationId, new Set());
      }
      typingUsers.get(conversationId).add(userId);

      // Notify others in the conversation
      socket.to(`conversation:${conversationId}`).emit('typing:started', {
        userId,
        userName: socket.user.name,
        conversationId
      });
    });

    socket.on('typing:stop', (data) => {
      const { conversationId } = data;

      // Remove user from typing set
      if (typingUsers.has(conversationId)) {
        typingUsers.get(conversationId).delete(userId);
      }

      // Notify others in the conversation
      socket.to(`conversation:${conversationId}`).emit('typing:stopped', {
        userId,
        conversationId
      });
    });

    /**
     * Mark messages as read
     */
    socket.on('messages:markAsRead', async (data) => {
      try {
        const { conversationId } = data;

        // Mark all messages in conversation as read
        await Message.markConversationAsRead(conversationId, userId);

        // Update conversation unread count
        const conversation = await Conversation.findById(conversationId);
        if (conversation) {
          await conversation.resetUnread(userId);

          // Notify sender that messages were read
          const otherParticipant = conversation.getOtherParticipant(userId);
          const otherSocketId = activeUsers.get(otherParticipant._id.toString());

          if (otherSocketId) {
            io.to(otherSocketId).emit('messages:read', {
              conversationId,
              userId
            });
          }
        }
      } catch (error) {
        console.error('Error marking messages as read:', error);
        socket.emit('error', { message: error.message });
      }
    });

    /**
     * Get online status of specific users
     */
    socket.on('users:checkOnline', (data) => {
      const { userIds } = data;
      const onlineStatus = {};

      userIds.forEach(id => {
        onlineStatus[id] = activeUsers.has(id.toString());
      });

      socket.emit('users:onlineStatus', onlineStatus);
    });

    /**
     * Handle disconnection
     */
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.name} (${userId})`);

      // Remove from active users
      activeUsers.delete(userId);

      // Clean up typing indicators
      typingUsers.forEach((users, conversationId) => {
        if (users.has(userId)) {
          users.delete(userId);
          socket.to(`conversation:${conversationId}`).emit('typing:stopped', {
            userId,
            conversationId
          });
        }
      });

      // Notify others that user is offline
      socket.broadcast.emit('user:offline', { userId });
    });
  });

  console.log('Socket.io service initialized');
};

/**
 * Get active users count
 */
const getActiveUsersCount = () => {
  return activeUsers.size;
};

/**
 * Get active users list
 */
const getActiveUsers = () => {
  return Array.from(activeUsers.keys());
};

/**
 * Check if user is online
 */
const isUserOnline = (userId) => {
  return activeUsers.has(userId.toString());
};

module.exports = {
  initialize,
  getActiveUsersCount,
  getActiveUsers,
  isUserOnline
};
