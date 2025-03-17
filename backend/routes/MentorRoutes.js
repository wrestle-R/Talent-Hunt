const express = require("express");
const router = express.Router();
const { 
  registerOrLoginMentor,
  getMentorProfile,
  updateMentorProfile,
  calculateMentorProfileCompletion
} = require("../controllers/MentorController");

// Public routes with no authentication
router.post("/registerOrLogin", registerOrLoginMentor);
router.get("/profile/:uid", getMentorProfile);
router.put("/profile/:uid", updateMentorProfile);
router.get("/profile-completion/:uid",calculateMentorProfileCompletion);


module.exports = router;