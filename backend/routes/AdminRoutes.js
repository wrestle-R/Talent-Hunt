const express = require("express");
const router = express.Router();
const { 
  // Admin authentication and profile
  registerOrLoginAdmin,
  getAdminProfile,
  updateAdminProfile,
  
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

// Admin hackathon management routes
router.get("/hackathons", getAllHackathons);
router.get("/hackathons/stats", getHackathonStats);
router.get("/hackathons/:id", getHackathonById);
// Changed from "/:uid/hackathons" to "/hackathons" to match frontend
router.post("/hackathons", createHackathon);
router.put("/hackathons/:id", updateHackathon);
router.delete("/hackathons/:id", deleteHackathon);
router.put("/hackathons/:hackathonId/applicants/:applicantId", updateApplicantStatus);
// Keep this route for specific admin hackathons
router.get("/:uid/hackathons", getHackathonsByAdmin);

module.exports = router;