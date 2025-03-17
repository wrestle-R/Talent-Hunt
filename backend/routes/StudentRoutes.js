const express = require("express");
const { 
    registerOrLoginStudent,
    getStudentProfile,
    updateStudentProfile,
    calculateStudentProfileCompletion
 } = require("../controllers/StudentController");
const router = express.Router();

router.post("/registerOrLogin", registerOrLoginStudent);
router.get("/profile/:uid", getStudentProfile);
router.put("/profile/:uid", updateStudentProfile);
router.get("/profile-completion/:uid",calculateStudentProfileCompletion);

module.exports = router;