const express = require("express");
const router = express.Router();
const { 
  registerOrLoginStudent,
  getStudentProfile,
  updateStudentProfile,
  calculateStudentProfileCompletion,
  getAllMentors,
  getAllStudents,
  getRecommendedTeammates,
  getRecommendedMentors,
  getAllTeammates,
  getUpcomingHackathons,
  getPastHackathons,
  getRegisteredHackathons,
  getHackathonById,
  registerForHackathon,
  getStudentConversations,
  markStudentMessagesAsRead,
  getMentorConversations,
  getStudentProjects,
  addStudentProject,
  updateStudentProject,
  deleteStudentProject,
  getPotentialTeammates,
  getTeammateById,
  getMentorById,
  getTeamInfo,
  respondToTeamInvitation,
  getTeamInvitations,
  getTeamDetails,
  getTeamMemberProfile,
  getTeamActivities,
  getTeamHackathonHistory,
  getHackathonRegistrationStatus,
  getMentorRequestStatus,
  sendMentorRequest,
} = require("../controllers/StudentController");

// Authentication routes
router.post("/registerOrLogin", registerOrLoginStudent);

// Profile routes
router.get("/profile/:uid", getStudentProfile);
router.put("/profile/:uid", updateStudentProfile);
router.get("/profile-completion/:uid", calculateStudentProfileCompletion);

// Teammate discovery routes
router.get("/mentors", getAllMentors);
router.get("/all-students/:uid", getAllTeammates);
router.get("/recommended-teammates/:uid", getRecommendedTeammates);
router.get("/recommended-mentors/:uid", getRecommendedMentors);
router.get("/teammates/:uid", getPotentialTeammates);
router.get("/teammate/:teammateId", getTeammateById);
router.get("/mentor/:mentorId", getMentorById);

// Hackathon routes
router.get("/hackathons/upcoming", getUpcomingHackathons);
router.get("/hackathons/past", getPastHackathons);
router.get("/hackathons/registered/:uid", getRegisteredHackathons);
router.get("/hackathons/:id", getHackathonById);
router.post("/hackathons/:id/register", registerForHackathon);
router.get('/hackathons/:hackathonId/status/:uid', getHackathonRegistrationStatus);

// Team routes
router.get("/team/:uid", getTeamInfo);
router.get('/teams/:teamId/details', getTeamDetails);
router.get('/teams/:teamId/members/:memberId', getTeamMemberProfile);
router.get('/teams/:teamId/activities', getTeamActivities);
router.get('/teams/:teamId/hackathons', getTeamHackathonHistory);

// Team invitations routes
router.get("/team-invitations/:uid", getTeamInvitations);
router.put("/team-invitations/:invitationId/respond", respondToTeamInvitation);

// Messaging routes
router.get("/conversations/:studentId", getStudentConversations);
router.put("/messages/read/:studentId/:senderId", markStudentMessagesAsRead);
router.get("/mentor-conversations/:studentId", getMentorConversations);

// Project routes
router.get("/projects/:studentId", getStudentProjects);
router.post("/projects/:studentId", addStudentProject);
router.put("/projects/:studentId/:projectId", updateStudentProject);
router.delete("/projects/:studentId/:projectId", deleteStudentProject);

// Add these routes to your existing routes
router.post('/mentor/:mentorId/request', sendMentorRequest);
router.get('/mentor/:mentorId/request-status', getMentorRequestStatus);

module.exports = router;