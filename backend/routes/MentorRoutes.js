const express = require("express");
const router = express.Router();
const { 
  registerOrLoginMentor,
  getMentorProfile,
  updateMentorProfile
} = require("../controllers/MentorController");

// Public routes with no authentication
router.post("/registerOrLogin", registerOrLoginMentor);
router.get("/profile/:uid", getMentorProfile);
router.put("/profile/:uid", updateMentorProfile);

module.exports = router;