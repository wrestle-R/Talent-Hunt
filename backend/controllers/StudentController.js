const Student = require("../models/Student");
const Mentor = require("../models/Mentor");
const Admin = require("../models/Admin"); // Add this import

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
    
    // Check if the email exists in the Admin collection
    let admin = await Admin.findOne({ email });
    if (admin) {
      // If the email exists in the Admin collection, return an error similar to mentor check
      return res.status(400).json({ message: "Email already exists as an admin. Please use a different email." });
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


const getAllMentors = async (req, res) => {
  try {
    // Find all mentors and select only the fields relevant for students
    const mentors = await Mentor.find()
      .select({
        name: 1,
        title: 1,
        bio: 1,
        profile_picture: 1,
        skills: 1,
        years_of_experience: 1,
        education: 1,
        current_company: 1,
        location: 1,
        languages: 1,
        availability_status: 1,
        mentor_topics: 1,
        average_rating: 1,
        total_reviews: 1,
        social_links: 1
      })
      .sort({ average_rating: -1 }); // Sort by highest rating first

    // Return the mentors
    res.status(200).json({
      success: true,
      count: mentors.length,
      mentors
    });

  } catch (error) {
    console.error("Error fetching mentors:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to retrieve mentors", 
      error: error.message 
    });
  }
};



// Update the getAllStudents function to exclude the current user
const getAllStudents = async (req, res) => {
  try {
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Search and filter parameters
    const search = req.query.search || '';
    const skill = req.query.skill || '';
    
    // Get parameters to exclude current user (using both email and UID for reliability)
    const excludeEmail = req.query.excludeEmail || '';
    const excludeUID = req.query.excludeUID || '';
    
    // Build query
    let query = {};
    
    // Exclude the current user using $and to ensure both conditions are applied
    if (excludeEmail || excludeUID) {
      query.$and = [];
      
      if (excludeEmail) {
        query.$and.push({ email: { $ne: excludeEmail } });
      }
      
      if (excludeUID) {
        query.$and.push({ firebaseUID: { $ne: excludeUID } });
      }
    }
    
    // Add search functionality
    if (search) {
      const searchQuery = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { 'education.institution': { $regex: search, $options: 'i' } }
        ]
      };
      
      // Combine with existing query
      if (query.$and) {
        query.$and.push(searchQuery);
      } else {
        query = { ...query, ...searchQuery };
      }
    }
    
    // Add skill filter
    if (skill) {
      const skillQuery = { skills: { $in: [new RegExp(skill, 'i')] } };
      
      // Combine with existing query
      if (query.$and) {
        query.$and.push(skillQuery);
      } else {
        query = { ...query, ...skillQuery };
      }
    }

    // Execute query with pagination
    const students = await Student.find(query)
      .select({
        firebaseUID: 1,
        name: 1,
        email: 1,
        profile_picture: 1,
        location: 1,
        education: 1,
        skills: 1,
        interests: 1,
        achievements: 1,
        projects: 1,
        mentorship_status: 1
      })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination
    const totalStudents = await Student.countDocuments(query);
    
    // Send response
    res.status(200).json({
      success: true,
      count: students.length,
      total: totalStudents,
      totalPages: Math.ceil(totalStudents / limit),
      currentPage: page,
      students
    });

  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to retrieve students", 
      error: error.message 
    });
  }
}; 


// Add these new functions to your StudentController.js file

// Get recommended teammates for a student
const getRecommendedTeammates = async (req, res) => {
  try {
    const { uid } = req.params;
    
    // First get the current student to find their skills and interests
    const currentStudent = await Student.findOne({ firebaseUID: uid });
    
    if (!currentStudent) {
      return res.status(404).json({ message: "Student not found" });
    }
    
    // Get student's skills and interests to match with potential teammates
    const studentSkills = currentStudent.skills || [];
    const studentInterests = currentStudent.interests || [];
    
    // Find students with complementary skills or similar interests
    // Exclude the current student
    let query = {
      firebaseUID: { $ne: uid },
      email: { $ne: currentStudent.email }
    };
    
    // If student has skills or interests, use them for recommendations
    const skillsAndInterests = [...studentSkills, ...studentInterests];
    if (skillsAndInterests.length > 0) {
      // Find students with at least one matching skill or interest
      query.$or = [
        { skills: { $in: studentInterests } },  // Students with skills matching current student's interests
        { interests: { $in: studentSkills } },  // Students with interests matching current student's skills
        { interests: { $in: studentInterests } } // Students with similar interests
      ];
    }
    
    // Limit to 4 recommended teammates
    const recommendedTeammates = await Student.find(query)
      .select({
        firebaseUID: 1,
        name: 1,
        email: 1,
        profile_picture: 1,
        education: 1,
        skills: 1,
        interests: 1,
        location: 1,
        projects: 1
      })
      .limit(4);
    
    res.status(200).json({
      success: true,
      count: recommendedTeammates.length,
      teammates: recommendedTeammates
    });
    
  } catch (error) {
    console.error("Error fetching recommended teammates:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to retrieve recommended teammates", 
      error: error.message 
    });
  }
};

// Get recommended mentors for a student
const getRecommendedMentors = async (req, res) => {
  try {
    const { uid } = req.params;
    
    // First get the current student to find their interests and skills
    const student = await Student.findOne({ firebaseUID: uid });
    
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    
    // Get student's mentor topics and skills to find matching mentors
    const mentorTopics = student.mentorship_interests?.mentor_topics || [];
    const studentSkills = student.skills || [];
    const studentInterests = student.interests || [];
    
    // All topics to match with mentor expertise
    const allTopics = [...mentorTopics, ...studentSkills, ...studentInterests];
    
    // Find mentors with matching expertise
    let query = {};
    
    if (allTopics.length > 0) {
      // Find mentors with matching expertise
      query.$or = [
        { "expertise.technical_skills": { $in: allTopics } },
        { "mentorship_focus_areas": { $in: allTopics } }
      ];
    }
    
    // Limit to 4 recommended mentors
    const recommendedMentors = await Mentor.find(query)
      .select({
        name: 1,
        bio: 1,
        title: 1,
        profile_picture: 1,
        current_role: 1,
        expertise: 1,
        location: 1,
        mentorship_focus_areas: 1,
        average_rating: 1
      })
      .sort({ average_rating: -1 })
      .limit(4);
    
    res.status(200).json({
      success: true,
      count: recommendedMentors.length,
      mentors: recommendedMentors
    });
    
  } catch (error) {
    console.error("Error fetching recommended mentors:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to retrieve recommended mentors", 
      error: error.message 
    });
  }
};

// Update the exports to include the new functions
module.exports = { 
  registerOrLoginStudent,
  getStudentProfile, 
  updateStudentProfile,
  calculateStudentProfileCompletion,
  getAllMentors,
  getAllStudents,
  getRecommendedTeammates,
  getRecommendedMentors
};



