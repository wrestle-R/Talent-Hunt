const Admin = require("../models/Admin");
const Student = require("../models/Student");
const Mentor = require("../models/Mentor");

// Register or login admin
const registerOrLoginAdmin = async (req, res) => {
  try {
    const {
      firebaseUID,
      email,
      name,
      organization
    } = req.body;

    // Check if the email exists in the Student or Mentor collection
    let student = await Student.findOne({ email });
    if (student) {
      return res.status(400).json({ message: "Email already exists as a student. Please use a different email." });
    }

    let mentor = await Mentor.findOne({ email });
    if (mentor) {
      return res.status(400).json({ message: "Email already exists as a mentor. Please use a different email." });
    }

    // Check if the admin already exists by firebaseUID or email
    let admin = await Admin.findOne({ $or: [{ firebaseUID }, { email }] });

    if (admin) {
      // If the admin exists, return a success message
      return res.status(200).json({ message: "Login successful", admin });
    }

    // If not found, register the admin
    admin = new Admin({
      firebaseUID,
      email,
      name,
      organization,
    });

    await admin.save();

    res.status(201).json({ message: "Admin registered successfully", admin });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// Get admin profile by UID
const getAdminProfile = async (req, res) => {
  try {
    const { uid } = req.params;
    const admin = await Admin.findOne({ firebaseUID: uid });

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.status(200).json(admin);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update admin profile by UID
const updateAdminProfile = async (req, res) => {
  try {
    const { uid } = req.params;
    const updatedData = req.body;
    
    // Prevent updating protected fields
    delete updatedData.email;
    delete updatedData.firebaseUID;
    delete updatedData.role;

    const admin = await Admin.findOneAndUpdate(
      { firebaseUID: uid }, 
      updatedData, 
      { new: true, runValidators: true }
    );

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.status(200).json(admin);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all admins
const getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().select({
      name: 1,
      email: 1,
      organization: 1,
      role: 1
    });
    
    res.status(200).json({ 
      success: true, 
      count: admins.length, 
      admins 
    });
  } catch (error) {
    console.error("Error fetching admins:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to retrieve admins", 
      error: error.message 
    });
  }
};

module.exports = { 
  registerOrLoginAdmin,
  getAdminProfile,
  updateAdminProfile,
  getAllAdmins
};