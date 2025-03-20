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
  deleteStudentProject
} = require("../controllers/StudentController");

// Existing routes
router.post("/registerOrLogin", registerOrLoginStudent);
router.get("/profile/:uid", getStudentProfile);
router.put("/profile/:uid", updateStudentProfile);
router.get("/profile-completion/:uid", calculateStudentProfileCompletion);
router.get("/mentors", getAllMentors);
router.get("/all-students/:uid", getAllTeammates);
router.get("/recommended-teammates/:uid", getRecommendedTeammates);
router.get("/recommended-mentors/:uid", getRecommendedMentors);

// Hackathon routes
router.get("/hackathons/upcoming", getUpcomingHackathons);
router.get("/hackathons/past", getPastHackathons);
router.get("/hackathons/registered/:uid", getRegisteredHackathons);
router.get("/hackathons/:id", getHackathonById);
router.post("/hackathons/:id/register", registerForHackathon);

// Conversation routes
router.get("/conversations/:studentId", getStudentConversations);
router.put("/messages/read/:studentId/:senderId", markStudentMessagesAsRead);
router.get("/mentor-conversations/:studentId", getMentorConversations);

// Project routes
router.get("/projects/:studentId", getStudentProjects);
router.post("/projects/:studentId", addStudentProject);
router.put("/projects/:studentId/:projectId", updateStudentProject);
router.delete("/projects/:studentId/:projectId", deleteStudentProject);

module.exports = router;