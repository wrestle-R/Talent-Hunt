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

const getStudentProfile = async (req, res) => {
  try {
    const { uid } = req.params;
    const student = await Student.findOne({ firebaseUID: uid });

    if (!student) {
      return res.status(404).json({ message: "student not found" });
    }

    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateStudentProfile = async (req, res) => {
  try {
    const { uid } = req.params;
    const updatedData = req.body;
    
    // Prevent updating protected fields
    delete updatedData.email;
    delete updatedData.firebaseUID;

    const student = await Student.findOneAndUpdate(
      { firebaseUID: uid }, 
      updatedData, 
      { new: true, runValidators: true }
    );

    if (!student) {
      return res.status(404).json({ message: "student not found" });
    }

    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Add this function to your StudentController.js file
const calculateStudentProfileCompletion = async (req, res) => {
  try {
    const { uid } = req.params;
    
    // Only query the specific fields requested
    const student = await Student.findOne(
      { firebaseUID: uid },
      {
        name: 1,
        email: 1,
        phone: 1,
        profile_picture: 1,
        location: 1,
        education: 1,
        skills: 1,
        interests: 1,
        social_links: 1,
        mentorship_interests: 1,
        preferred_working_hours: 1,
        goals: 1
      }
    );

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Define the specific fields to check with equal weight
    // Total of 12 fields with equal weight
    const fields = [
      // Basic information
      { name: 'name', check: () => !!student.name },
      { name: 'email', check: () => !!student.email },
      { name: 'phone', check: () => !!student.phone },
      { name: 'profile_picture', check: () => !!student.profile_picture },
      
      // Location
      { name: 'location', check: () => !!student.location?.city || !!student.location?.country },
      
      // Education
      { name: 'education', check: () => !!student.education?.institution || !!student.education?.degree },
      
      // Skills & Interests
      { name: 'skills', check: () => Array.isArray(student.skills) && student.skills.length > 0 },
      { name: 'interests', check: () => Array.isArray(student.interests) && student.interests.length > 0 },
      
      // Social Links
      { name: 'social_links', check: () => 
        !!student.social_links?.github || 
        !!student.social_links?.linkedin || 
        !!student.social_links?.portfolio 
      },
      
      // Mentorship
      { name: 'mentorship_interests', check: () => 
        student.mentorship_interests?.seeking_mentor !== undefined &&
        (
          !student.mentorship_interests.seeking_mentor || 
          (student.mentorship_interests.seeking_mentor && 
          Array.isArray(student.mentorship_interests.mentor_topics) && 
          student.mentorship_interests.mentor_topics.length > 0)
        )
      },
      
      // Working Hours
      { name: 'preferred_working_hours', check: () => 
        !!student.preferred_working_hours?.start_time && 
        !!student.preferred_working_hours?.end_time 
      },
      
      // Goals
      { name: 'goals', check: () => Array.isArray(student.goals) && student.goals.length > 0 }
    ];

    // Calculate completion percentage
    let completedFields = 0;
    const fieldStatus = fields.map(field => {
      const isComplete = field.check();
      if (isComplete) {
        completedFields++;
      }
      return {
        field: field.name,
        complete: isComplete
      };
    });

    const completionPercentage = Math.round((completedFields / fields.length) * 100);

    // Create response
    const response = {
      completionPercentage,
      completedFields,
      totalFields: fields.length,
      fieldStatus,
      incompleteFields: fieldStatus.filter(f => !f.complete).map(f => f.field)
    };

    res.status(200).json(response);

  } catch (error) {
    console.error("Error calculating profile completion:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Don't forget to update the exports
module.exports = { 
  registerOrLoginStudent,
  getStudentProfile, 
  updateStudentProfile,
  calculateStudentProfileCompletion 
};
