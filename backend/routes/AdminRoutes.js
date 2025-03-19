const express = require("express");
const router = express.Router();
const { 
  registerOrLoginAdmin,
  getAdminProfile,
  updateAdminProfile,
  getAllAdmins
} = require("../controllers/AdminController");

// Admin routes
router.post("/registerOrLogin", registerOrLoginAdmin);
router.get("/profile/:uid", getAdminProfile);
router.put("/profile/:uid", updateAdminProfile);
router.get("/all", getAllAdmins);

module.exports = router;