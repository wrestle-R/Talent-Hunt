const express = require('express');
const router = express.Router();
const {
  getReportedMessages,
  getConversation,
  updateReportedMessage,
  getUserMessages,
  getAllProjects,
  getProjectById,  
  updateProjectStatus,
  deleteProject,
  flagProject,
  getFlaggedProjects,
  sendNote,
  getNotesByRecipient,
  getNotesBySender,
  getNoteReplies,
  updateNoteStatus,
  getAllNotes,
  getNoteById
} = require('../controllers/ModeratorController');

// Messages routes
router.get('/messages/reported', getReportedMessages);
router.get('/conversation/:user1/:user2', getConversation);
router.put('/messages/reported/:messageId', updateReportedMessage);
router.get('/messages/user/:userId', getUserMessages);

// Project management routes
router.get('/projects', getAllProjects);
router.get('/projects/:projectId', getProjectById);
router.put('/projects/:projectId', updateProjectStatus);
router.delete('/projects/:projectId', deleteProject);
router.post('/projects/:projectId/flag', flagProject);
router.get('/projects/flagged', getFlaggedProjects);

// Note system routes
router.post('/notes', sendNote);
router.get('/notes/recipient/:userId/:userType', getNotesByRecipient);
router.get('/notes/sender/:moderatorId', getNotesBySender);
router.get('/notes/:noteId/replies', getNoteReplies);
router.put('/notes/:noteId/status', updateNoteStatus);
router.get('/notes', getAllNotes);
router.get('/notes/:noteId', getNoteById);

module.exports = router;