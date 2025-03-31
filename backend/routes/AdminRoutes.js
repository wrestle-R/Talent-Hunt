const express = require("express");
const router = express.Router();
const { 
  // Admin authentication and profile
  registerOrLoginAdmin,
  getAdminProfile,
  updateAdminProfile,
  
  // User moderation
  getAllMentorsForAdmin,
  getAllStudentsForAdmin,
  rejectMentor,
  restoreMentor,
  rejectStudent,
  restoreStudent,
  
  // Hackathon management
  getAllHackathons,
  getHackathonById,
  createHackathon,
  updateHackathon,
  deleteHackathon,
  updateApplicantStatus,
  getHackathonStats,
  getHackathonsByAdmin,
  
  // Team management for hackathons
  getIndividualApplicants,
  createTemporaryTeam,
  getHackathonTeams,
  getHackathonParticipants,
  convertTemporaryTeam,
  getTeamApplicants,
  dissolveTemporaryTeam
} = require("../controllers/AdminController");

// Admin authentication and profile routes
router.post("/registerOrLogin", registerOrLoginAdmin);
router.get("/profile/:uid", getAdminProfile);
router.put("/profile/:uid", updateAdminProfile);

// Admin user moderation routes
router.get("/mentors", getAllMentorsForAdmin);
router.put("/mentors/:id/reject", rejectMentor);
router.put("/mentors/:id/restore", restoreMentor);
router.get("/students", getAllStudentsForAdmin);
router.put("/students/:id/reject", rejectStudent);
router.put("/students/:id/restore", restoreStudent);

// Admin hackathon management routes
router.get("/hackathons", getAllHackathons);
router.get("/hackathons/stats", getHackathonStats);
router.get("/hackathons/:id", getHackathonById);
router.post("/hackathons", createHackathon);
router.put("/hackathons/:id", updateHackathon);
router.delete("/hackathons/:id", deleteHackathon);
router.get("/:uid/hackathons", getHackathonsByAdmin);
// Add this route to your routes file:

router.get('/hackathons/:hackathonId/team-applicants', getTeamApplicants);

// Hackathon participant management
router.get('/hackathons/:hackathonId/participants', getHackathonParticipants);
router.get('/hackathons/:hackathonId/individual-applicants', getIndividualApplicants);
router.get('/hackathons/:hackathonId/teams', getHackathonTeams);

// Hackathon application approval/rejection
router.put('/hackathons/:hackathonId/applicants/:applicantId', updateApplicantStatus);

// Temporary team management
router.post('/hackathons/:hackathonId/temp-teams', createTemporaryTeam);
router.post('/hackathons/:hackathonId/temp-teams/:tempTeamId/convert', convertTemporaryTeam);
router.delete('/hackathons/:hackathonId/temp-teams/:tempTeamId', dissolveTemporaryTeam);

module.exports = router;