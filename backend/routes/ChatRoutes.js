const express = require('express');
const router = express.Router();
const {
    getMessages,
    getConversations,
    getConversationsWithDetails,
    saveMessage,
    markMessagesAsRead,
    getUnreadMessageCount
} = require('../controllers/ChatController');

// Get messages between two users
router.get('/messages/:senderId/:receiverId', getMessages);

// Save a new message
router.post('/messages', saveMessage);

// Get user's conversations
router.get('/conversations/:userId', getConversations);

// Get recent conversations with details
router.get('/conversations/details/:userId', getConversationsWithDetails);

// Mark messages as read
router.put('/messages/read/:senderId/:receiverId', markMessagesAsRead);

// Get unread message count
router.get('/unread/:userId', getUnreadMessageCount);

module.exports = router;