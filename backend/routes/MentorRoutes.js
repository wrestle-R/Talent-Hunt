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
  markMessagesAsRead
} = require("../controllers/MentorController");

// Public routes with no authentication
router.post("/registerOrLogin", registerOrLoginMentor);
router.get("/profile/:uid", getMentorProfile);
router.put("/profile/:uid", updateMentorProfile);
router.get("/profile-completion/:uid", calculateMentorProfileCompletion);

// Dashboard routes
router.get("/students/:mentorId", getCurrentStudents);
router.get("/hackathons", getUpcomingHackathons);
router.get("/dashboard/:mentorId", getDashboardData);

// Chat routes
router.get("/conversations/:mentorId", getRecentConversations);
router.put("/messages/read/:mentorId/:senderId", markMessagesAsRead);

module.exports = router;