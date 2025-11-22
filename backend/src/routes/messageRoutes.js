const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getConversations,
  getOrCreateConversation,
  getMessages,
  sendMessage,
  markAsRead,
  deleteMessage,
  searchUsers,
  getUnreadCount,
  archiveConversation,
  unarchiveConversation
} = require('../controllers/messageController');

const router = express.Router();

// All routes require authentication
router.use(protect);

/**
 * @swagger
 * /api/v1/messages/conversations:
 *   get:
 *     summary: Get all conversations for the current user
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: includeArchived
 *         schema:
 *           type: boolean
 *         description: Include archived conversations
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of conversations per page
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *     responses:
 *       200:
 *         description: List of conversations
 *       401:
 *         description: Unauthorized
 */
router.get('/conversations', getConversations);

/**
 * @swagger
 * /api/v1/messages/conversations/{userId}:
 *   get:
 *     summary: Get or create a conversation with another user
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user to chat with
 *     responses:
 *       200:
 *         description: Conversation found or created
 *       404:
 *         description: User not found
 */
router.get('/conversations/:userId', getOrCreateConversation);

/**
 * @swagger
 * /api/v1/messages/conversations/{conversationId}/messages:
 *   get:
 *     summary: Get messages for a specific conversation
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the conversation
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of messages per page
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: before
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Get messages before this timestamp (for infinite scroll)
 *     responses:
 *       200:
 *         description: List of messages
 *       403:
 *         description: Not authorized to view this conversation
 *       404:
 *         description: Conversation not found
 */
router.get('/conversations/:conversationId/messages', getMessages);

/**
 * @swagger
 * /api/v1/messages/conversations/{conversationId}/read:
 *   patch:
 *     summary: Mark all messages in a conversation as read
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the conversation
 *     responses:
 *       200:
 *         description: Messages marked as read
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Conversation not found
 */
router.patch('/conversations/:conversationId/read', markAsRead);

/**
 * @swagger
 * /api/v1/messages/conversations/{conversationId}/archive:
 *   patch:
 *     summary: Archive a conversation
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the conversation
 *     responses:
 *       200:
 *         description: Conversation archived
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Conversation not found
 */
router.patch('/conversations/:conversationId/archive', archiveConversation);

/**
 * @swagger
 * /api/v1/messages/conversations/{conversationId}/unarchive:
 *   patch:
 *     summary: Unarchive a conversation
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the conversation
 *     responses:
 *       200:
 *         description: Conversation unarchived
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Conversation not found
 */
router.patch('/conversations/:conversationId/unarchive', unarchiveConversation);

/**
 * @swagger
 * /api/v1/messages:
 *   post:
 *     summary: Send a message (REST API fallback)
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               receiverId:
 *                 type: string
 *                 description: ID of the receiver (required if no conversationId)
 *               conversationId:
 *                 type: string
 *                 description: ID of the conversation (required if no receiverId)
 *               content:
 *                 type: string
 *                 description: Message content
 *               messageType:
 *                 type: string
 *                 enum: [text, file, image, system]
 *                 default: text
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       201:
 *         description: Message sent successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Receiver not found
 */
router.post('/', sendMessage);

/**
 * @swagger
 * /api/v1/messages/{messageId}:
 *   delete:
 *     summary: Delete a message (soft delete)
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the message to delete
 *     responses:
 *       200:
 *         description: Message deleted successfully
 *       403:
 *         description: Not authorized to delete this message
 *       404:
 *         description: Message not found
 */
router.delete('/:messageId', deleteMessage);

/**
 * @swagger
 * /api/v1/messages/users/search:
 *   get:
 *     summary: Search for users to start a conversation
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query (minimum 2 characters)
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [student, instructor, org_admin, super_admin]
 *         description: Filter by user role
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of results
 *     responses:
 *       200:
 *         description: List of users
 *       400:
 *         description: Invalid search query
 */
router.get('/users/search', searchUsers);

/**
 * @swagger
 * /api/v1/messages/unread-count:
 *   get:
 *     summary: Get total unread message count
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unread message count
 */
router.get('/unread-count', getUnreadCount);

module.exports = router;
