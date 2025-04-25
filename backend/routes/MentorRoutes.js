const express = require("express");
const router = express.Router();
const { 
  registerOrLoginMentor,
  getMentorProfile,
  updateMentorProfile,
  calculateMentorProfileCompletion,
  getCurrentStudents,
  getUpcomingHackathons,
  getDashboardData,
  getRecentConversations,
  markMessagesAsRead,
  getTeamApplications,
  handleTeamApplication,
  getActiveMentorships,
  getStudentProfile,
  submitMemberFeedback,
  getTeamDetails,
  submitProjectFeedback,
  getAllConversations,
  fetchTeamApplications,
  handleStudentApplications,
  getAllMentors
} = require("../controllers/MentorController");

// Public routes with no authentication
router.post("/registerOrLogin", registerOrLoginMentor);
router.get("/profile/:uid", getMentorProfile);
router.put("/profile/:uid", updateMentorProfile);
router.get("/profile-completion/:uid", calculateMentorProfileCompletion);

// New route for getting all mentors
router.get("/all", getAllMentors);

// Dashboard routes
router.get("/students/:mentorId", getCurrentStudents);
router.get("/hackathons", getUpcomingHackathons);
router.get("/dashboard/:mentorId", getDashboardData);

// Chat routes
router.get("/conversations/:mentorId", getRecentConversations);
router.put("/messages/read/:mentorId/:senderId", markMessagesAsRead);
router.get('/conversations/all/:mentorId', getAllConversations);

// Team applications routes
router.get('/team-applications/:mentorId', getTeamApplications);
router.get('/applications/:mentorId', fetchTeamApplications);
// Add this route
router.get('/student-applications/:mentorId', handleStudentApplications);
// Changed from teamId to applicationId to match frontend expectations
router.post('/team-applications/:mentorId/:applicationId/:action', handleTeamApplication);
router.get('/active-mentorships/:mentorId', getActiveMentorships);

// Team and member management routes
router.get('/student-profile/:studentId', getStudentProfile);
router.post('/member-feedback/:teamId/:memberId', submitMemberFeedback);
router.post('/project-feedback/:teamId', submitProjectFeedback);
router.get('/team/:teamId', getTeamDetails);

module.exports = router;