const express = require("express");
const { 
    registerOrLoginStudent,
    getStudentProfile,
    updateStudentProfile

 } = require("../controllers/StudentController");
const router = express.Router();

router.post("/registerOrLogin", registerOrLoginStudent);
router.get("/profile/:uid", getStudentProfile);
router.put("/profile/:uid", updateStudentProfile);

module.exports = router;