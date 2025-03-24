const express = require('express');
const router = express.Router();
const { 
  createTeam,
  getMyTeams,
  getTeamById,
  joinTeamWithCode,
  applyToJoinTeam,
  respondToJoinRequest,
  inviteToTeam,
  respondToInvitation,
  getRecruitingTeams,
  updateTeamDetails,
  removeTeamMember,
  regenerateJoinCode,
  getPendingInvitations,
  addProject,
  updateProject,
  deleteProject,
  getStudentById,
  getStudentProfileById
} = require('../controllers/TeamController');

// Team management routes (no auth middleware)
router.post('/create', createTeam);
router.get('/my-teams', getMyTeams);
router.get('/recruiting', getRecruitingTeams);
router.get('/:teamId', getTeamById);
router.post('/join-with-code', joinTeamWithCode);
router.post('/apply', applyToJoinTeam);
router.post('/respond-request', respondToJoinRequest);
router.post('/invite', inviteToTeam);
router.post('/respond-invitation', respondToInvitation);

// Team update routes
router.put('/:teamId', updateTeamDetails);
router.delete('/:teamId/members/:memberId', removeTeamMember);
router.post('/:teamId/regenerate-code', regenerateJoinCode);

// Add the route for fetching pending invitations
router.get('/:teamId/invitations', getPendingInvitations);

// Project management routes
router.post('/:teamId/projects', addProject);
router.put('/:teamId/projects/:projectId', updateProject);
router.delete('/:teamId/projects/:projectId', deleteProject);

// Make sure this route exists in your StudentRoutes.js file

router.get('/student/:studentId', getStudentProfileById);


module.exports = router;