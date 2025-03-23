const express = require('express');
const router = express.Router();
const ModeratorController = require('../controllers/ModeratorController');

// Existing message routes
router.get('/messages/reported', ModeratorController.getReportedMessages);
router.get('/conversation/:user1/:user2', ModeratorController.getConversation);
router.put('/messages/reported/:messageId', ModeratorController.updateReportedMessage);
router.get('/messages/user/:userId', ModeratorController.getUserMessages);

// Project management routes
router.get('/projects', ModeratorController.getAllProjects);
router.get('/projects/:projectId', ModeratorController.getProjectById);
router.put('/projects/:projectId', ModeratorController.updateProjectStatus);
router.delete('/projects/:projectId', ModeratorController.deleteProject);

// Note system routes
router.post('/notes', ModeratorController.sendNote);
router.get('/notes/recipient/:userId/:userType', ModeratorController.getNotesByRecipient);
router.get('/notes/sender/:moderatorId', ModeratorController.getNotesBySender);
router.get('/notes/:noteId/replies', ModeratorController.getNoteReplies);
router.put('/notes/:noteId/status', ModeratorController.updateNoteStatus);

module.exports = router;