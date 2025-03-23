const Student = require("../models/Student");
const Mentor = require("../models/Mentor");
const Admin = require("../models/Admin"); // Add this import
const Hackathon = require("../models/Hackathon"); // Add this line
const Message = require('../models/Message');
const mongoose = require('mongoose')


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
    // Only include non-rejected mentors
    const potentialMentors = await Mentor.find({ isRejected: false })
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
        social_links: 1,
        email: 1,
        phone: 1,
        current_role: 1,
        expertise: 1,
        mentorship_focus_areas: 1,
        mentorship_availability: 1,
        industries_worked_in: 1
      })
      .sort({ average_rating: -1 }); // Sort by highest rating first

    // Filter mentors by profile completion percentage
    const eligibleMentors = [];
    
    for (const mentor of potentialMentors) {
      // Define fields to check for mentor profile completion
      const fields = [
        // Basic information
        { name: 'name', check: () => !!mentor.name },
        { name: 'email', check: () => !!mentor.email },
        { name: 'bio', check: () => !!mentor.bio },
        { name: 'profile_picture', check: () => !!mentor.profile_picture },
        
        // Professional details
        { name: 'current_role', check: () => 
          !!mentor.current_role?.title || !!mentor.current_role?.company 
        },
        { name: 'years_of_experience', check: () => mentor.years_of_experience > 0 },
        
        // Expertise
        { name: 'expertise', check: () => 
          Array.isArray(mentor.expertise?.technical_skills) && 
          mentor.expertise.technical_skills.length > 0 
        },
        
        // Industry and focus areas
        { name: 'industries_worked_in', check: () => 
          Array.isArray(mentor.industries_worked_in) && 
          mentor.industries_worked_in.length > 0 
        },
        { name: 'mentorship_focus_areas', check: () => 
          Array.isArray(mentor.mentorship_focus_areas) && 
          mentor.mentorship_focus_areas.length > 0 
        },
        
        // Availability
        { name: 'mentorship_availability', check: () => 
          mentor.mentorship_availability?.hours_per_week > 0 || 
          (Array.isArray(mentor.mentorship_availability?.mentorship_type) && 
           mentor.mentorship_availability.mentorship_type.length > 0)
        },
        
        // Social links
        { name: 'social_links', check: () => 
          !!mentor.social_links?.linkedin || 
          !!mentor.social_links?.github || 
          !!mentor.social_links?.personal_website 
        }
      ];
      
      // Calculate completion percentage
      let completedFields = 0;
      fields.forEach(field => {
        if (field.check()) {
          completedFields++;
        }
      });
      
      const completionPercentage = Math.round((completedFields / fields.length) * 100);
      
      // Only include if profile completion is at least 75%
      if (completionPercentage >= 50) {
        // Create a cleaned mentor object with only the necessary fields for display
        const cleanedMentor = {
          _id: mentor._id,
          name: mentor.name,
          title: mentor.title,
          bio: mentor.bio,
          profile_picture: mentor.profile_picture,
          skills: mentor.skills,
          years_of_experience: mentor.years_of_experience,
          education: mentor.education,
          current_company: mentor.current_company || mentor.current_role?.company,
          location: mentor.location,
          languages: mentor.languages,
          availability_status: mentor.availability_status,
          mentor_topics: mentor.mentor_topics || mentor.mentorship_focus_areas,
          average_rating: mentor.average_rating,
          total_reviews: mentor.total_reviews,
          social_links: mentor.social_links
        };
        
        eligibleMentors.push(cleanedMentor);
      }
    }

    // Return the filtered mentors
    res.status(200).json({
      success: true,
      count: eligibleMentors.length,
      mentors: eligibleMentors
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
// Updated getRecommendedTeammates function with isRejected and profile completion checks
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
    // Exclude the current student and rejected students
    let query = {
      firebaseUID: { $ne: uid },
      email: { $ne: currentStudent.email },
      isRejected: false
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
    
    // Get potential recommended teammates
    const potentialTeammates = await Student.find(query)
      .select({
        firebaseUID: 1,
        name: 1,
        email: 1,
        profile_picture: 1,
        education: 1,
        skills: 1,
        interests: 1,
        location: 1,
        projects: 1,
        bio: 1,
        phone: 1,
        social_links: 1,
        mentorship_interests: 1,
        preferred_working_hours: 1,
        goals: 1
      });
      
    // Filter by profile completion percentage
    const eligibleTeammates = [];
    
    for (const teammate of potentialTeammates) {
      // Define the specific fields to check with equal weight
      const fields = [
        // Basic information
        { name: 'name', check: () => !!teammate.name },
        { name: 'email', check: () => !!teammate.email },
        { name: 'phone', check: () => !!teammate.phone },
        { name: 'profile_picture', check: () => !!teammate.profile_picture },
        
        // Location
        { name: 'location', check: () => !!teammate.location?.city || !!teammate.location?.country },
        
        // Education
        { name: 'education', check: () => !!teammate.education?.institution || !!teammate.education?.degree },
        
        // Skills & Interests
        { name: 'skills', check: () => Array.isArray(teammate.skills) && teammate.skills.length > 0 },
        { name: 'interests', check: () => Array.isArray(teammate.interests) && teammate.interests.length > 0 },
        
        // Social Links
        { name: 'social_links', check: () => 
          !!teammate.social_links?.github || 
          !!teammate.social_links?.linkedin || 
          !!teammate.social_links?.portfolio 
        },
        
        // Mentorship
        { name: 'mentorship_interests', check: () => 
          teammate.mentorship_interests?.seeking_mentor !== undefined &&
          (
            !teammate.mentorship_interests.seeking_mentor || 
            (teammate.mentorship_interests.seeking_mentor && 
             Array.isArray(teammate.mentorship_interests.mentor_topics) && 
             teammate.mentorship_interests.mentor_topics.length > 0)
          )
        },
        
        // Working Hours
        { name: 'preferred_working_hours', check: () => 
          !!teammate.preferred_working_hours?.start_time && 
          !!teammate.preferred_working_hours?.end_time 
        },
        
        // Goals
        { name: 'goals', check: () => Array.isArray(teammate.goals) && teammate.goals.length > 0 }
      ];

      // Calculate completion percentage
      let completedFields = 0;
      fields.forEach(field => {
        if (field.check()) {
          completedFields++;
        }
      });

      const completionPercentage = Math.round((completedFields / fields.length) * 100);

      // Only include if profile completion is at least 75%
      if (completionPercentage >= 50) {
        // Remove fields used only for calculation before sending to client
        const cleanedTeammate = {
          _id: teammate._id,
          firebaseUID: teammate.firebaseUID,
          name: teammate.name,
          email: teammate.email,
          profile_picture: teammate.profile_picture,
          education: teammate.education,
          skills: teammate.skills,
          interests: teammate.interests,
          location: teammate.location,
          projects: teammate.projects,
          bio: teammate.bio
        };
        
        eligibleTeammates.push(cleanedTeammate);
      }
    }
    
    // Limit to 4 recommended teammates after filtering
    const limitedTeammates = eligibleTeammates.slice(0, 4);
    
    res.status(200).json({
      success: true,
      count: limitedTeammates.length,
      teammates: limitedTeammates
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
// Updated getRecommendedMentors function with isRejected and profile completion checks
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
    let query = {
      isRejected: false // Only include non-rejected mentors
    };
    
    if (allTopics.length > 0) {
      // Find mentors with matching expertise
      query.$or = [
        { "expertise.technical_skills": { $in: allTopics } },
        { "mentorship_focus_areas": { $in: allTopics } }
      ];
    }
    
    // Get potential mentors matching criteria
    const potentialMentors = await Mentor.find(query)
      .select({
        name: 1,
        bio: 1,
        title: 1,
        profile_picture: 1,
        current_role: 1,
        expertise: 1,
        location: 1,
        mentorship_focus_areas: 1,
        average_rating: 1,
        email: 1,
        phone: 1,
        current_role: 1,
        years_of_experience: 1,
        social_links: 1,
        mentorship_availability: 1,
        industries_worked_in: 1
      })
      .sort({ average_rating: -1 });
    
    // Filter mentors by profile completion percentage
    const eligibleMentors = [];
    
    for (const mentor of potentialMentors) {
      // Define fields to check for mentor profile completion
      const fields = [
        // Basic information
        { name: 'name', check: () => !!mentor.name },
        { name: 'email', check: () => !!mentor.email },
        { name: 'bio', check: () => !!mentor.bio },
        { name: 'profile_picture', check: () => !!mentor.profile_picture },
        
        // Professional details
        { name: 'current_role', check: () => 
          !!mentor.current_role?.title || !!mentor.current_role?.company 
        },
        { name: 'years_of_experience', check: () => mentor.years_of_experience > 0 },
        
        // Expertise
        { name: 'expertise', check: () => 
          Array.isArray(mentor.expertise?.technical_skills) && 
          mentor.expertise.technical_skills.length > 0 
        },
        
        // Industry and focus areas
        { name: 'industries_worked_in', check: () => 
          Array.isArray(mentor.industries_worked_in) && 
          mentor.industries_worked_in.length > 0 
        },
        { name: 'mentorship_focus_areas', check: () => 
          Array.isArray(mentor.mentorship_focus_areas) && 
          mentor.mentorship_focus_areas.length > 0 
        },
        
        // Availability
        { name: 'mentorship_availability', check: () => 
          mentor.mentorship_availability?.hours_per_week > 0 || 
          (Array.isArray(mentor.mentorship_availability?.mentorship_type) && 
           mentor.mentorship_availability.mentorship_type.length > 0)
        },
        
        // Social links
        { name: 'social_links', check: () => 
          !!mentor.social_links?.linkedin || 
          !!mentor.social_links?.github || 
          !!mentor.social_links?.personal_website 
        }
      ];
      
      // Calculate completion percentage
      let completedFields = 0;
      fields.forEach(field => {
        if (field.check()) {
          completedFields++;
        }
      });
      
      const completionPercentage = Math.round((completedFields / fields.length) * 100);
      
      // Only include if profile completion is at least 75%
      if (completionPercentage >= 50) {
        // Create a cleaned version of the mentor object to return
        const cleanedMentor = {
          _id: mentor._id,
          name: mentor.name,
          bio: mentor.bio,
          title: mentor.title,
          profile_picture: mentor.profile_picture,
          current_role: mentor.current_role,
          expertise: mentor.expertise,
          location: mentor.location,
          mentorship_focus_areas: mentor.mentorship_focus_areas,
          average_rating: mentor.average_rating
        };
        
        eligibleMentors.push(cleanedMentor);
      }
    }
    
    // Limit to 4 recommended mentors after filtering
    const limitedMentors = eligibleMentors.slice(0, 4);
    
    res.status(200).json({
      success: true,
      count: limitedMentors.length,
      mentors: limitedMentors
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

const getUpcomingHackathons = async (req, res) => {
  try {
    const today = new Date();
    
    // Find hackathons that haven't started yet
    const hackathons = await Hackathon.find({
      startDate: { $gte: today }
    })
    .sort({ startDate: 1 }) // Sort by closest start date
    .populate("postedByAdmin", "name organization");
    
    res.status(200).json({
      success: true,
      count: hackathons.length,
      hackathons
    });
  } catch (error) {
    console.error("Error fetching upcoming hackathons:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve upcoming hackathons",
      error: error.message
    });
  }
};

// Get past hackathons
const getPastHackathons = async (req, res) => {
  try {
    const today = new Date();
    
    // Find hackathons that have ended
    const hackathons = await Hackathon.find({
      endDate: { $lt: today }
    })
    .sort({ endDate: -1 }) // Sort by most recent end date
    .populate("postedByAdmin", "name organization");
    
    res.status(200).json({
      success: true,
      count: hackathons.length,
      hackathons
    });
  } catch (error) {
    console.error("Error fetching past hackathons:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve past hackathons",
      error: error.message
    });
  }
};

// Get hackathons registered by student
const getRegisteredHackathons = async (req, res) => {
  try {
    const { uid } = req.params;
    
    // Find student by firebase UID
    const student = await Student.findOne({ firebaseUID: uid });
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }
    
    // Find hackathons where this student is an applicant
    const hackathons = await Hackathon.find({
      "applicants.user": student._id
    })
    .sort({ startDate: 1 })
    .populate("postedByAdmin", "name organization");
    
    res.status(200).json({
      success: true,
      count: hackathons.length,
      hackathons
    });
  } catch (error) {
    console.error("Error fetching registered hackathons:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve registered hackathons",
      error: error.message
    });
  }
};

// Get hackathon by ID
const getHackathonById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const hackathon = await Hackathon.findById(id)
      .populate("postedByAdmin", "name organization email");
    
    if (!hackathon) {
      return res.status(404).json({
        success: false,
        message: "Hackathon not found"
      });
    }
    
    res.status(200).json({
      success: true,
      hackathon
    });
  } catch (error) {
    console.error(`Error fetching hackathon with ID ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve hackathon",
      error: error.message
    });
  }
};

// Register for a hackathon
const registerForHackathon = async (req, res) => {
  try {
    const { id } = req.params;
    const { uid } = req.body;
    
    // Find student by firebase UID
    const student = await Student.findOne({ firebaseUID: uid });
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }
    
    // Find the hackathon
    const hackathon = await Hackathon.findById(id);
    
    if (!hackathon) {
      return res.status(404).json({
        success: false,
        message: "Hackathon not found"
      });
    }
    
    // Check if registration is still open
    const today = new Date();
    const registerDate = new Date(hackathon.lastRegisterDate);
    
    if (today > registerDate) {
      return res.status(400).json({
        success: false,
        message: "Registration period has ended for this hackathon"
      });
    }
    
    // Check if already registered
    const alreadyRegistered = hackathon.applicants.some(
      app => app.user.toString() === student._id.toString()
    );
    
    if (alreadyRegistered) {
      return res.status(400).json({
        success: false,
        message: "You are already registered for this hackathon"
      });
    }
    
    // Check capacity
    if (hackathon.registration.currentlyRegistered >= hackathon.registration.totalCapacity) {
      return res.status(400).json({
        success: false,
        message: "This hackathon has reached maximum capacity"
      });
    }
    
    // Register the student
    hackathon.applicants.push({
      user: student._id,
      status: "Pending",
      appliedAt: new Date()
    });
    
    // Increment currently registered count
    hackathon.registration.currentlyRegistered += 1;
    
    await hackathon.save();
    
    res.status(200).json({
      success: true,
      message: "Successfully registered for the hackathon",
      hackathon
    });
  } catch (error) {
    console.error("Error registering for hackathon:", error);
    res.status(500).json({
      success: false,
      message: "Failed to register for hackathon",
      error: error.message
    });
  }
};

// Add this function to your existing controller
// Updated getAllTeammates function with profile completion and isRejected checks
const getAllTeammates = async (req, res) => {
  try {
    // Get parameters to exclude current user
    const { uid } = req.params;
    
    // Find the current student to get their email
    const currentStudent = await Student.findOne({ firebaseUID: uid });
    
    if (!currentStudent) {
      return res.status(404).json({ 
        success: false,
        message: "Current student not found" 
      });
    }

    // Find all students except the current one
    const potentialTeammates = await Student.find({
      $and: [
        { firebaseUID: { $ne: uid } },
        { email: { $ne: currentStudent.email } },
        { isRejected: false } // Only include non-rejected students
      ]
    }).select({
      firebaseUID: 1,
      name: 1,
      email: 1,
      profile_picture: 1,
      education: 1,
      skills: 1,
      interests: 1,
      location: 1,
      projects: 1,
      bio: 1,
      phone: 1,
      social_links: 1,
      mentorship_interests: 1,
      preferred_working_hours: 1,
      goals: 1
    });

    // Filter students by profile completion percentage
    const eligibleTeammates = [];

    for (const teammate of potentialTeammates) {
      // Define the specific fields to check with equal weight
      const fields = [
        // Basic information
        { name: 'name', check: () => !!teammate.name },
        { name: 'email', check: () => !!teammate.email },
        { name: 'phone', check: () => !!teammate.phone },
        { name: 'profile_picture', check: () => !!teammate.profile_picture },
        
        // Location
        { name: 'location', check: () => !!teammate.location?.city || !!teammate.location?.country },
        
        // Education
        { name: 'education', check: () => !!teammate.education?.institution || !!teammate.education?.degree },
        
        // Skills & Interests
        { name: 'skills', check: () => Array.isArray(teammate.skills) && teammate.skills.length > 0 },
        { name: 'interests', check: () => Array.isArray(teammate.interests) && teammate.interests.length > 0 },
        
        // Social Links
        { name: 'social_links', check: () => 
          !!teammate.social_links?.github || 
          !!teammate.social_links?.linkedin || 
          !!teammate.social_links?.portfolio 
        },
        
        // Mentorship
        { name: 'mentorship_interests', check: () => 
          teammate.mentorship_interests?.seeking_mentor !== undefined &&
          (
            !teammate.mentorship_interests.seeking_mentor || 
            (teammate.mentorship_interests.seeking_mentor && 
             Array.isArray(teammate.mentorship_interests.mentor_topics) && 
             teammate.mentorship_interests.mentor_topics.length > 0)
          )
        },
        
        // Working Hours
        { name: 'preferred_working_hours', check: () => 
          !!teammate.preferred_working_hours?.start_time && 
          !!teammate.preferred_working_hours?.end_time 
        },
        
        // Goals
        { name: 'goals', check: () => Array.isArray(teammate.goals) && teammate.goals.length > 0 }
      ];

      // Calculate completion percentage
      let completedFields = 0;
      fields.forEach(field => {
        if (field.check()) {
          completedFields++;
        }
      });

      const completionPercentage = Math.round((completedFields / fields.length) * 100);

      // Only include if profile completion is at least 75%
      if (completionPercentage >= 75) {
        // Remove fields used only for calculation before sending to client
        const cleanedTeammate = {
          _id: teammate._id,
          firebaseUID: teammate.firebaseUID,
          name: teammate.name,
          email: teammate.email,
          profile_picture: teammate.profile_picture,
          education: teammate.education,
          skills: teammate.skills,
          interests: teammate.interests,
          location: teammate.location,
          projects: teammate.projects,
          bio: teammate.bio
        };
        
        eligibleTeammates.push(cleanedTeammate);
      }
    }

    res.status(200).json({
      success: true,
      count: eligibleTeammates.length,
      teammates: eligibleTeammates
    });
  } catch (error) {
    console.error("Error fetching all teammates:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to retrieve teammates", 
      error: error.message 
    });
  }
};

// Add this function to get student conversations
const getStudentConversations = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    if (!studentId) {
      return res.status(400).json({ error: 'Student ID is required' });
    }
    
    // Find most recent messages between student and mentors/other students
    const recentMessages = await Message.aggregate([
      // Match messages involving this student
      { 
        $match: { 
          $or: [
            { senderId: studentId },
            { receiverId: studentId }
          ] 
        } 
      },
      // Sort by time descending
      { $sort: { createdAt: -1 } },
      // Group by the conversation partner (the other person)
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$senderId", studentId] },
              "$receiverId",
              "$senderId"
            ]
          },
          lastMessage: { $first: "$message" },
          lastMessageTime: { $first: "$createdAt" },
          unreadCount: { 
            $sum: { 
              $cond: [
                { $and: [
                  { $eq: ["$receiverId", studentId] },
                  { $eq: ["$isRead", false] }
                ]},
                1,
                0
              ] 
            }
          },
          messages: { $push: "$$ROOT" }
        }
      },
      // Sort conversations by most recent message
      { $sort: { lastMessageTime: -1 } },
      // Limit to last 10 conversations
      { $limit: 10 }
    ]);

    // Fetch user details for each conversation
    const conversationsWithDetails = await Promise.all(
      recentMessages.map(async (conv) => {
        // First try to find user in Mentor collection
        let user = await Mentor.findById(conv._id, 'name email profile_picture organization');
        let userType = 'mentor';
        
        // If not found in mentors, check Students (for student-to-student chats)
        if (!user) {
          user = await Student.findById(conv._id, 'name email profile_picture education');
          userType = 'student';
        }
        
        if (!user) {
          // Fallback for users that might be deleted
          return {
            userId: conv._id,
            name: "Unknown User",
            profilePicture: null,
            userType: 'unknown',
            lastMessage: conv.lastMessage,
            lastMessageTime: conv.lastMessageTime,
            unreadCount: conv.unreadCount
          };
        }
        
        return {
          userId: conv._id,
          name: user.name,
          email: user.email,
          profilePicture: user.profile_picture,
          affiliation: userType === 'mentor' ? user.organization : (user.education?.institution || ''),
          userType,
          lastMessage: conv.lastMessage,
          lastMessageTime: conv.lastMessageTime,
          unreadCount: conv.unreadCount
        };
      })
    );
    
    return res.status(200).json(conversationsWithDetails);
    
  } catch (error) {
    console.error('Error fetching student conversations:', error);
    return res.status(500).json({ error: 'Server error', message: error.message });
  }
};

// Add this function to mark messages as read
const markStudentMessagesAsRead = async (req, res) => {
  try {
    const { studentId, senderId } = req.params;
    
    if (!studentId || !senderId) {
      return res.status(400).json({ error: 'Both student ID and sender ID are required' });
    }
    
    // Update all unread messages from this sender to this student
    const result = await Message.updateMany(
      { 
        senderId: senderId,
        receiverId: studentId,
        isRead: false
      },
      { $set: { isRead: true } }
    );
    
    return res.status(200).json({ 
      success: true,
      messagesMarkedRead: result.modifiedCount 
    });
    
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return res.status(500).json({ error: 'Server error', message: error.message });
  }
};


// Add this function to get student-mentor conversations only
const getMentorConversations = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    if (!studentId) {
      return res.status(400).json({ error: 'Student ID is required' });
    }
    
    // Find most recent messages between student and mentors only
    const recentMessages = await Message.aggregate([
      // Match messages involving this student
      { 
        $match: { 
          $or: [
            { senderId: studentId },
            { receiverId: studentId }
          ] 
        } 
      },
      // Sort by time descending
      { $sort: { createdAt: -1 } },
      // Group by the conversation partner (the other person)
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$senderId", studentId] },
              "$receiverId",
              "$senderId"
            ]
          },
          lastMessage: { $first: "$message" },
          lastMessageTime: { $first: "$createdAt" },
          unreadCount: { 
            $sum: { 
              $cond: [
                { $and: [
                  { $eq: ["$receiverId", studentId] },
                  { $eq: ["$isRead", false] }
                ]},
                1,
                0
              ] 
            }
          },
          messages: { $push: "$$ROOT" }
        }
      },
      // Sort conversations by most recent message
      { $sort: { lastMessageTime: -1 } }
    ]);

    // Filter and fetch only mentor user details
    const mentorConversations = await Promise.all(
      recentMessages.map(async (conv) => {
        // Try to find the user in Mentor collection
        const mentor = await Mentor.findById(conv._id, 'name email profile_picture current_role expertise organization');
        
        // Skip if not a mentor
        if (!mentor) {
          return null;
        }
        
        return {
          userId: conv._id,
          name: mentor.name,
          email: mentor.email,
          profilePicture: mentor.profile_picture,
          affiliation: mentor.organization || (mentor.current_role?.company || ''),
          expertise: mentor.expertise?.technical_skills || [],
          lastMessage: conv.lastMessage,
          lastMessageTime: conv.lastMessageTime,
          unreadCount: conv.unreadCount
        };
      })
    );
    
    // Filter out null values (non-mentors) and limit if needed
    const filteredMentorConversations = mentorConversations
      .filter(conv => conv !== null);
    
    return res.status(200).json(filteredMentorConversations);
    
  } catch (error) {
    console.error('Error fetching mentor conversations:', error);
    return res.status(500).json({ error: 'Server error', message: error.message });
  }
};

// Add these functions to your StudentController.js file
// Get student projects
const getStudentProjects = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { search, techFilter } = req.query;
    
    if (!studentId) {
      return res.status(400).json({ error: 'Student ID is required' });
    }
    
    // Find the student
    const student = await Student.findById(studentId);
    
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    // Get all projects, regardless of status
    let projects = student.projects || [];
    
    // Apply search filter if provided
    if (search) {
      const searchLower = search.toLowerCase();
      projects = projects.filter(project => 
        (project.name && project.name.toLowerCase().includes(searchLower)) ||
        (project.description && project.description.toLowerCase().includes(searchLower)) ||
        (project.tech_stack && project.tech_stack.some(tech => 
          tech.toLowerCase().includes(searchLower)
        ))
      );
    }
    
    // Apply tech stack filter if provided
    if (techFilter) {
      const techFilterLower = techFilter.toLowerCase();
      projects = projects.filter(project => 
        project.tech_stack && project.tech_stack.some(tech => 
          tech.toLowerCase().includes(techFilterLower)
        )
      );
    }
    
    // Don't show deleted projects by default
    projects = projects.filter(project => !project.isDeleted);
    
    // Format projects for consistency and ensure status is included
    const formattedProjects = projects.map(project => ({
      _id: project._id,
      name: project.name,
      description: project.description,
      tech_stack: project.tech_stack || [],
      techStack: project.tech_stack || [], // Include both naming conventions for flexibility
      github_link: project.github_link,
      githubLink: project.github_link, // Include both naming conventions
      live_demo: project.live_demo,
      liveDemo: project.live_demo, // Include both naming conventions
      status: project.status || 'Pending', // Default to 'Pending' if no status
      createdAt: project.createdAt || null,
      updatedAt: project.updatedAt || null,
      moderatorNotes: project.moderatorNotes || '',
      isFlagged: project.isFlagged || false
    }));
    
    // Sort projects by creation date (newest first) if available
    formattedProjects.sort((a, b) => {
      if (a.createdAt && b.createdAt) {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      return 0;
    });
    
    // Calculate counts by status for the frontend
    const statusCounts = {
      Total: formattedProjects.length,
      Pending: formattedProjects.filter(p => p.status === 'Pending').length,
      Approved: formattedProjects.filter(p => p.status === 'Approved').length,
      Rejected: formattedProjects.filter(p => p.status === 'Rejected').length
    };
    
    return res.status(200).json({
      success: true,
      count: formattedProjects.length,
      statusCounts: statusCounts,
      projects: formattedProjects
    });
    
  } catch (error) {
    console.error('Error fetching student projects:', error);
    
    // More detailed error handling
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid student ID format' 
      });
    }
    
    return res.status(500).json({ 
      success: false,
      error: 'Server error', 
      message: error.message 
    });
  }
};

// Add a project
const addStudentProject = async (req, res) => {
  try {
    const { studentId } = req.params;
    const projectData = req.body;
    
    if (!studentId) {
      return res.status(400).json({ error: 'Student ID is required' });
    }
    
    // Validate required fields
    if (!projectData.name || !projectData.description || !projectData.tech_stack) {
      return res.status(400).json({ error: 'Project name, description, and tech stack are required' });
    }
    
    // Find the student
    const student = await Student.findById(studentId);
    
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    // Initialize projects array if it doesn't exist
    if (!student.projects) {
      student.projects = [];
    }
    
    // Add new project with an _id
    const newProject = {
      _id: new mongoose.Types.ObjectId(),
      ...projectData
    };
    
    student.projects.push(newProject);
    await student.save();
    
    return res.status(201).json({
      success: true,
      message: 'Project added successfully',
      project: newProject
    });
    
  } catch (error) {
    console.error('Error adding student project:', error);
    return res.status(500).json({ error: 'Server error', message: error.message });
  }
};

// Update a project
const updateStudentProject = async (req, res) => {
  try {
    const { studentId, projectId } = req.params;
    const projectData = req.body;
    
    if (!studentId || !projectId) {
      return res.status(400).json({ error: 'Student ID and Project ID are required' });
    }
    
    // Find the student
    const student = await Student.findById(studentId);
    
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    // Find the project index
    const projectIndex = student.projects.findIndex(
      project => project._id.toString() === projectId
    );
    
    if (projectIndex === -1) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Update the project
    student.projects[projectIndex] = {
      _id: student.projects[projectIndex]._id, // Keep the original ID
      ...projectData
    };
    
    await student.save();
    
    return res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      project: student.projects[projectIndex]
    });
    
  } catch (error) {
    console.error('Error updating student project:', error);
    return res.status(500).json({ error: 'Server error', message: error.message });
  }
};

// Delete a project
const deleteStudentProject = async (req, res) => {
  try {
    const { studentId, projectId } = req.params;
    
    if (!studentId || !projectId) {
      return res.status(400).json({ error: 'Student ID and Project ID are required' });
    }
    
    // Find the student
    const student = await Student.findById(studentId);
    
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    // Remove the project
    student.projects = student.projects.filter(
      project => project._id.toString() !== projectId
    );
    
    await student.save();
    
    return res.status(200).json({
      success: true,
      message: 'Project deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting student project:', error);
    return res.status(500).json({ error: 'Server error', message: error.message });
  }
};

// Add these to your exports
module.exports = {
  // ...existing exports
  registerOrLoginStudent,
  getStudentProfile, 
  updateStudentProfile,
  calculateStudentProfileCompletion,
  getAllMentors,
  getAllStudents,
  getRecommendedTeammates,
  getRecommendedMentors,
  getAllTeammates,
  getUpcomingHackathons,
  getPastHackathons,
  getRegisteredHackathons,
  getHackathonById,
  registerForHackathon,
  getStudentConversations,
  markStudentMessagesAsRead,
  getMentorConversations,
  // New project endpoints
  getStudentProjects,
  addStudentProject,
  updateStudentProject,
  deleteStudentProject
};

