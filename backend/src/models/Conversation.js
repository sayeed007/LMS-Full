const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      }
    ],
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message'
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
      index: true
    },
    unreadCount: {
      type: Map,
      of: Number,
      default: new Map()
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    isArchived: {
      type: Boolean,
      default: false
    },
    archivedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    metadata: {
      courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
      },
      courseTitle: String,
      subject: String,
      tags: [String]
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Compound index for finding conversations between two users
conversationSchema.index({ participants: 1 });
conversationSchema.index({ lastMessageAt: -1 });
conversationSchema.index({ participants: 1, isActive: 1 });

// Validate that there are exactly 2 participants
conversationSchema.pre('save', function (next) {
  if (this.participants.length !== 2) {
    next(new Error('A conversation must have exactly 2 participants'));
  }

  // Initialize unreadCount map for both participants if not exists
  if (!this.unreadCount || this.unreadCount.size === 0) {
    this.unreadCount = new Map();
    this.participants.forEach(participantId => {
      this.unreadCount.set(participantId.toString(), 0);
    });
  }

  next();
});

// Method to get the other participant in the conversation
conversationSchema.methods.getOtherParticipant = function (userId) {
  return this.participants.find(
    participant => participant._id.toString() !== userId.toString()
  );
};

// Method to increment unread count for a user
conversationSchema.methods.incrementUnread = async function (userId) {
  const userIdStr = userId.toString();
  const currentCount = this.unreadCount.get(userIdStr) || 0;
  this.unreadCount.set(userIdStr, currentCount + 1);
  await this.save();
  return this;
};

// Method to reset unread count for a user
conversationSchema.methods.resetUnread = async function (userId) {
  const userIdStr = userId.toString();
  this.unreadCount.set(userIdStr, 0);
  await this.save();
  return this;
};

// Method to update last message
conversationSchema.methods.updateLastMessage = async function (messageId) {
  this.lastMessage = messageId;
  this.lastMessageAt = new Date();
  await this.save();
  return this;
};

// Method to archive conversation for a user
conversationSchema.methods.archiveForUser = async function (userId) {
  if (!this.archivedBy.includes(userId)) {
    this.archivedBy.push(userId);

    // If both users archived, mark as archived
    if (this.archivedBy.length === 2) {
      this.isArchived = true;
    }

    await this.save();
  }
  return this;
};

// Method to unarchive conversation for a user
conversationSchema.methods.unarchiveForUser = async function (userId) {
  this.archivedBy = this.archivedBy.filter(
    id => id.toString() !== userId.toString()
  );
  this.isArchived = false;
  await this.save();
  return this;
};

// Static method to find or create conversation between two users
conversationSchema.statics.findOrCreate = async function (user1Id, user2Id) {
  // Try to find existing conversation
  let conversation = await this.findOne({
    participants: { $all: [user1Id, user2Id] },
    isActive: true
  });

  // Create new conversation if not found
  if (!conversation) {
    const unreadMap = new Map();
    unreadMap.set(user1Id.toString(), 0);
    unreadMap.set(user2Id.toString(), 0);

    conversation = await this.create({
      participants: [user1Id, user2Id],
      unreadCount: unreadMap
    });
  }

  return conversation;
};

// Static method to get user's conversations
conversationSchema.statics.getUserConversations = async function (userId, options = {}) {
  const {
    includeArchived = false,
    limit = 20,
    skip = 0
  } = options;

  const query = {
    participants: userId,
    isActive: true
  };

  if (!includeArchived) {
    query.archivedBy = { $ne: userId };
  }

  return await this.find(query)
    .populate('participants', 'name email avatar role')
    .populate('lastMessage', 'content messageType createdAt sender isRead')
    .sort({ lastMessageAt: -1 })
    .limit(limit)
    .skip(skip);
};

// Static method to get total unread count for a user across all conversations
conversationSchema.statics.getTotalUnreadCount = async function (userId) {
  const conversations = await this.find({
    participants: userId,
    isActive: true
  });

  let totalUnread = 0;
  conversations.forEach(conv => {
    const count = conv.unreadCount.get(userId.toString()) || 0;
    totalUnread += count;
  });

  return totalUnread;
};

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;
