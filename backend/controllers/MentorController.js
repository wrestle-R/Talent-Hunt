const Mentor = require("../models/Mentor");
const Student = require("../models/Student");

// Register or login mentor
const registerOrLoginMentor = async (req, res) => {
  try {
    const {
      firebaseUID,
      email,
      name,
      profilePicture,
    } = req.body;

    // Check if the email exists in the Student collection
    let student = await Student.findOne({ email });
    if (student) {
      // If the email exists in the Student collection, return an error
      return res.status(400).json({ message: "Email already exists as a student. Please use a different email." });
    }

    // Check if the mentor already exists by firebaseUID or email
    let mentor = await Mentor.findOne({ $or: [{ firebaseUID }, { email }] });

    if (mentor) {
      // If the mentor exists, return a success message
      return res.status(200).json({ message: "Login successful", mentor });
    }

    // If not found, register the mentor
    mentor = new Mentor({
      firebaseUID,
      email,
      name,
      profile_picture: profilePicture,
    });

    await mentor.save();

    res.status(201).json({ message: "Mentor registered successfully", mentor });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// Get mentor profile by UID
const getMentorProfile = async (req, res) => {
  try {
    const { uid } = req.params;
    const mentor = await Mentor.findOne({ firebaseUID: uid });

    if (!mentor) {
      return res.status(404).json({ message: "Mentor not found" });
    }

    res.status(200).json(mentor);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update mentor profile by UID
const updateMentorProfile = async (req, res) => {
  try {
    const { uid } = req.params;
    const updatedData = req.body;
    
    // Prevent updating protected fields
    delete updatedData.email;
    delete updatedData.firebaseUID;

    const mentor = await Mentor.findOneAndUpdate(
      { firebaseUID: uid }, 
      updatedData, 
      { new: true, runValidators: true }
    );

    if (!mentor) {
      return res.status(404).json({ message: "Mentor not found" });
    }

    res.status(200).json(mentor);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { 
  registerOrLoginMentor,
  getMentorProfile,
  updateMentorProfile
};