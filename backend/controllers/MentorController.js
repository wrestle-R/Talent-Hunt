const Mentor = require("../models/Mentor");
const Student = require("../models/Student");
const Admin = require("../models/Admin"); // Add this import for Admin model

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

    // Check if the email exists in the Admin collection
    let admin = await Admin.findOne({ email });
    if (admin) {
      // If the email exists in the Admin collection, return an error
      return res.status(400).json({ message: "Email already exists as an admin. Please use a different email." });
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

const calculateMentorProfileCompletion = async (req, res) => {
  try {
    const { uid } = req.params;

    // Fetch mentor profile with selected fields
    const mentor = await Mentor.findOne(
      { firebaseUID: uid },
      {
        name: 1,
        email: 1,
        phone: 1,
        bio: 1,
        profile_picture: 1,
        current_role: 1,
        years_of_experience: 1,
        expertise: 1,
        industries_worked_in: 1,
        mentorship_focus_areas: 1,
        mentorship_availability: 1,
        social_links: 1
      }
    );

    if (!mentor) {
      return res.status(404).json({ message: "Mentor not found" });
    }

    // Fields to check for completion
    const fields = [
      { name: "name", check: () => !!mentor.name },
      { name: "email", check: () => !!mentor.email },
      { name: "phone", check: () => !!mentor.phone },
      { name: "bio", check: () => !!mentor.bio },
      { name: "profile_picture", check: () => !!mentor.profile_picture },
      { name: "current_role", check: () => !!mentor.current_role?.title && !!mentor.current_role?.company },
      { name: "years_of_experience", check: () => mentor.years_of_experience > 0 },
      { name: "expertise", check: () => 
        (mentor.expertise?.technical_skills?.length > 0 || mentor.expertise?.non_technical_skills?.length > 0)
      },
      { name: "industries_worked_in", check: () => mentor.industries_worked_in?.length > 0 },
      { name: "mentorship_focus_areas", check: () => mentor.mentorship_focus_areas?.length > 0 },
      { name: "mentorship_availability", check: () => mentor.mentorship_availability?.hours_per_week > 0 },
      { name: "social_links", check: () => 
        !!mentor.social_links?.linkedin || !!mentor.social_links?.github || !!mentor.social_links?.personal_website
      }
    ];

    // Calculate completion percentage
    let completedFields = fields.filter(field => field.check()).length;
    const completionPercentage = Math.round((completedFields / fields.length) * 100);

    // Response
    res.status(200).json({
      completionPercentage,
      completedFields,
      totalFields: fields.length,
      incompleteFields: fields.filter(field => !field.check()).map(field => field.name)
    });

  } catch (error) {
    console.error("Error calculating profile completion:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { 
  registerOrLoginMentor,
  getMentorProfile,
  updateMentorProfile,
  calculateMentorProfileCompletion
};