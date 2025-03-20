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
  // New hackathon-related functions
  getUpcomingHackathons,
  getPastHackathons,
  getRegisteredHackathons,
  getHackathonById,
  registerForHackathon
} = require("../controllers/StudentController");

// Existing routes
router.post("/registerOrLogin", registerOrLoginStudent);
router.get("/profile/:uid", getStudentProfile);
router.put("/profile/:uid", updateStudentProfile);
router.get("/profile-completion/:uid", calculateStudentProfileCompletion);
router.get("/mentors", getAllMentors);
// Add this route to your existing routes
router.get("/all-students/:uid", getAllTeammates);
router.get("/recommended-teammates/:uid", getRecommendedTeammates);
router.get("/recommended-mentors/:uid", getRecommendedMentors);

// New hackathon routes
router.get("/hackathons/upcoming", getUpcomingHackathons);
router.get("/hackathons/past", getPastHackathons);
router.get("/hackathons/registered/:uid", getRegisteredHackathons);
router.get("/hackathons/:id", getHackathonById);
router.post("/hackathons/:id/register", registerForHackathon);

module.exports = router;