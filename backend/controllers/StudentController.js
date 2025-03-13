const Student = require("../models/Student");
const Mentor = require("../models/Mentor");

const registerOrLoginStudent = async (req, res) => {
  try {
    const {
      firebaseUID,
      email,
      name,
      profilePicture,
    } = req.body;

    // Check if the email exists in the Mentor collection
    let mentor = await Mentor.findOne({ email });
    if (mentor) {
      // If the email exists in the Mentor collection, return an error and log out the user
      return res.status(400).json({ message: "Email already exists as a mentor. Please use a different email." });
    }

    // Check if the student already exists by firebaseUID or email
    let student = await Student.findOne({ $or: [{ firebaseUID }, { email }] });

    if (student) {
      // If the student exists, return a success message without updating any fields
      return res.status(200).json({ message: "Login successful", student });
    }

    // If not found, register the student
    student = new Student({
      firebaseUID,
      email,
      name,
      profile_picture: profilePicture,
    });

    await student.save();

    res.status(201).json({ message: "Student registered successfully", student });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

module.exports = { registerOrLoginStudent };