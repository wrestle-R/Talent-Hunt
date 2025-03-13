const express = require("express");
const { registerOrLoginStudent } = require("../controllers/StudentController");
const router = express.Router();

router.post("/registerOrLogin", registerOrLoginStudent);

module.exports = router;