const express = require('express');
const router = express.Router();
const {
    getMessages,
    getConversations,
    getConversationsWithDetails,
    saveMessage,
    markMessagesAsRead,
    getUnreadMessageCount,
    reportMessage,
    // Add these new imports
    getTeamMessages,
    saveTeamMessage,
    markTeamMessagesAsRead
} = require('../controllers/ChatController');

// Existing routes
router.get('/messages/:senderId/:receiverId', getMessages);
router.post('/messages', saveMessage);
router.get('/conversations/:userId', getConversations);
router.get('/conversations/details/:userId', getConversationsWithDetails);
router.put('/messages/read/:senderId/:receiverId', markMessagesAsRead);
router.get('/unread/:userId', getUnreadMessageCount);
router.post('/messages/report', reportMessage);

// Add team chat routes
router.get('/team-messages/:teamId', getTeamMessages);
router.post('/team-messages', saveTeamMessage);
router.put('/team-messages/read/:userId/:teamId', markTeamMessagesAsRead);

module.exports = router;