const express = require("express");
const { 
    registerOrLoginStudent,
    getStudentProfile,
    updateStudentProfile,
    calculateStudentProfileCompletion,
    getAllMentors,
    getAllStudents,
    getRecommendedTeammates,
    getRecommendedMentors
} = require("../controllers/StudentController");
const router = express.Router();

router.post("/registerOrLogin", registerOrLoginStudent);
router.get("/profile/:uid", getStudentProfile);
router.put("/profile/:uid", updateStudentProfile);
router.get("/profile-completion/:uid", calculateStudentProfileCompletion);
router.get("/mentors", getAllMentors);
router.get("/all", getAllStudents);
router.get("/recommended-teammates/:uid", getRecommendedTeammates);
router.get("/recommended-mentors/:uid", getRecommendedMentors);

module.exports = router;