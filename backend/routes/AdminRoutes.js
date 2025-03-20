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
  getHackathonsByAdmin
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
router.put("/hackathons/:hackathonId/applicants/:applicantId", updateApplicantStatus);
router.get("/:uid/hackathons", getHackathonsByAdmin);

module.exports = router;