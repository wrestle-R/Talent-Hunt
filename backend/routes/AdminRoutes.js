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
  getStudentProfile,
  
  // Hackathon management
  getAllHackathons,
  getHackathonById,
  createHackathon,
  updateHackathon,
  deleteHackathon,
  getHackathonStats,
  getHackathonsByAdmin,
  
  // Individual applicants management
  getHackathonIndividualApplicants,
  updateApplicantStatus,
  
  // Temporary team management
  createTemporaryTeam,
  getTemporaryTeams,
  convertTemporaryTeam,
  dissolveTemporaryTeam,
  
  // Team applicants management
  getTeamApplicants,
  updateTeamStatus,
  
  // Registered teams management
  getRegisteredTeams,
  
  // Hackathon participants
  getHackathonParticipants,
  getIndividualApplicants,
  getHackathonTeams
} = require("../controllers/AdminController");

// ==== ADMIN AUTHENTICATION AND PROFILE ====
router.post("/registerOrLogin", registerOrLoginAdmin);
router.get("/profile/:uid", getAdminProfile);
router.put("/profile/:uid", updateAdminProfile);
// Add this route with your other routes
router.get('/students/:studentId/profile', getStudentProfile);
// ==== USER MODERATION ====
router.get("/mentors", getAllMentorsForAdmin);
router.put("/mentors/:id/reject", rejectMentor);
router.put("/mentors/:id/restore", restoreMentor);
router.get("/students", getAllStudentsForAdmin);
router.put("/students/:id/reject", rejectStudent);
router.put("/students/:id/restore", restoreStudent);

// ==== HACKATHON MANAGEMENT ====
router.get("/hackathons", getAllHackathons);
router.get("/hackathons/stats", getHackathonStats);
router.get("/hackathons/:id", getHackathonById);
router.post("/hackathons", createHackathon);
router.put("/hackathons/:id", updateHackathon);
router.delete("/hackathons/:id", deleteHackathon);
router.get("/:uid/hackathons", getHackathonsByAdmin);

// ==== HACKATHON PARTICIPANTS OVERVIEW ====
// Get all participants (individuals and teams)
router.get('/hackathons/:hackathonId/participants', getHackathonParticipants);

// ==== INDIVIDUAL APPLICANTS MANAGEMENT ====
// Get all individual applicants (categorized by status)
router.get('/hackathons/:hackathonId/individual-applicants', getHackathonIndividualApplicants);
// Update applicant status (approve, reject)
router.put('/hackathons/:hackathonId/individual-applicants/:applicantId', updateApplicantStatus);

// ==== TEMPORARY TEAM MANAGEMENT ====
// Create temporary team from approved individuals
router.post('/hackathons/:hackathonId/temp-teams', createTemporaryTeam);
// Get all temporary teams
router.get('/hackathons/:hackathonId/temp-teams', getTemporaryTeams);
// Convert temporary team to registered team
router.post('/hackathons/:hackathonId/temp-teams/:tempTeamId/convert', convertTemporaryTeam);
// Dissolve temporary team
router.delete('/hackathons/:hackathonId/temp-teams/:tempTeamId', dissolveTemporaryTeam);

// ==== TEAM APPLICANTS MANAGEMENT ====
// Get team applications (categorized by status)
router.get('/hackathons/:hackathonId/team-applicants', getTeamApplicants);
// Update team application status (approve, reject)
router.put('/hackathons/:hackathonId/team-applicants/:teamApplicationId', updateTeamStatus);

// ==== REGISTERED TEAMS MANAGEMENT ====
// Get all registered teams
router.get('/hackathons/:hackathonId/registered-teams', getRegisteredTeams);

module.exports = router;