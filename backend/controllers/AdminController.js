const Admin = require("../models/Admin");
const Hackathon = require("../models/Hackathon");
const Student = require("../models/Student");
const Mentor = require("../models/Mentor");
const mongoose =require('mongoose')
const Team = require("../models/Team")

// Admin authentication and profile functions
const registerOrLoginAdmin = async (req, res) => {
  try {
    const { name, email, firebaseUID } = req.body;

    // Check if admin already exists
    let admin = await Admin.findOne({ email });

    if (admin) {
      // Admin exists, update login time
      admin.lastLogin = new Date();
      await admin.save();
    } else {
      // Create new admin
      admin = new Admin({
        name,
        email,
        firebaseUID,
        lastLogin: new Date()
      });
      await admin.save();
    }

    res.status(200).json({
      success: true,
      message: "Admin logged in successfully",
      admin
    });
  } catch (error) {
    console.error("Error in admin authentication:", error);
    res.status(500).json({
      success: false,
      message: "Server error during authentication",
      error: error.message
    });
  }
};


const getAdminProfile = async (req, res) => {
  try {
    const { uid } = req.params;
    
    const admin = await Admin.findOne({ firebaseUID: uid });
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found"
      });
    }
    
    res.status(200).json({
      success: true,
      admin
    });
  } catch (error) {
    console.error("Error fetching admin profile:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve admin profile",
      error: error.message
    });
  }
};

const updateAdminProfile = async (req, res) => {
  try {
    const { uid } = req.params;
    const { name, organization, bio, phone, profile_picture } = req.body;
    
    const admin = await Admin.findOneAndUpdate(
      { firebaseUID: uid },
      { 
        $set: { 
          name, 
          organization, 
          bio, 
          phone, 
          profile_picture 
        } 
      },
      { new: true, runValidators: true }
    );
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found"
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Admin profile updated successfully",
      admin
    });
  } catch (error) {
    console.error("Error updating admin profile:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update admin profile",
      error: error.message
    });
  }
};

// Hackathon management functions
const getAllHackathons = async (req, res) => {
  try {
    const hackathons = await Hackathon.find()
      .sort({ createdAt: -1 })
      .populate("postedByAdmin", "name email");
    
    res.status(200).json({
      success: true,
      count: hackathons.length,
      hackathons
    });
  } catch (error) {
    console.error("Error fetching hackathons:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve hackathons",
      error: error.message
    });
  }
};

const getHackathonById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const hackathon = await Hackathon.findById(id)
      .populate("postedByAdmin", "name email")
      .populate("applicants.user", "name email profile_picture");
    
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

// Updated createHackathon function to get UID from token instead of URL parameter
const createHackathon = async (req, res) => {
  try {
    const {
      hackathonName,
      description,
      startDate,
      endDate,
      lastRegisterDate,
      mode,
      location,
      prizePool,
      totalCapacity,
      primaryDomain,         // Changed from domain
      primaryProblemStatement, // Changed from problemStatement
      adminUid
    } = req.body;

    if (!adminUid) {
      return res.status(400).json({
        success: false,
        message: "Admin UID is required"
      });
    }

    // Find admin by Firebase UID
    const admin = await Admin.findOne({ firebaseUID: adminUid });
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found"
      });
    }

    // Create new hackathon with updated schema
    const hackathon = new Hackathon({
      hackathonName,
      description,
      startDate,
      endDate,
      lastRegisterDate,
      mode,
      location: mode === "Online" ? "Online" : location,
      primaryDomain,         // New field
      primaryProblemStatement, // New field
      prizePool: Number(prizePool),
      postedByAdmin: admin._id,
      registration: {
        totalCapacity: Number(totalCapacity),
        currentlyRegistered: 0,
        requiredTeamSize: 4  // Fixed team size
      }
    });

    await hackathon.save();

    res.status(201).json({
      success: true,
      message: "Hackathon created successfully",
      hackathon
    });
  } catch (error) {
    console.error("Error creating hackathon:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create hackathon",
      error: error.message
    });
  }
};

const updateHackathon = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      hackathonName,
      description,
      startDate,
      endDate,
      lastRegisterDate,
      mode,
      location,
      prizePool,
      totalCapacity,
      domain,
      problemStatement
    } = req.body;
    
    // Find the hackathon first to check if it exists and get current capacity
    const existingHackathon = await Hackathon.findById(id);
    
    if (!existingHackathon) {
      return res.status(404).json({
        success: false,
        message: "Hackathon not found"
      });
    }
    
    // Create update object
    const updateData = {
      hackathonName,
      description,
      startDate,
      endDate,
      lastRegisterDate,
      mode,
      location: mode === "Online" ? "Online" : location,
      prizePool: Number(prizePool),
      domain,
      problemStatement: problemStatement || existingHackathon.problemStatement
    };
    
    // Update capacity if provided and not less than current registrations
    const currentlyRegistered = existingHackathon.registration.currentlyRegistered || 0;
    if (totalCapacity && Number(totalCapacity) >= currentlyRegistered) {
      updateData["registration.totalCapacity"] = Number(totalCapacity);
    } else if (totalCapacity && Number(totalCapacity) < currentlyRegistered) {
      return res.status(400).json({
        success: false,
        message: `Cannot set capacity lower than current registrations (${currentlyRegistered})`
      });
    }
    
    const hackathon = await Hackathon.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      message: "Hackathon updated successfully",
      hackathon
    });
  } catch (error) {
    console.error(`Error updating hackathon with ID ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: "Failed to update hackathon",
      error: error.message
    });
  }
};

const deleteHackathon = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find and delete the hackathon
    const hackathon = await Hackathon.findByIdAndDelete(id);
    
    if (!hackathon) {
      return res.status(404).json({
        success: false,
        message: "Hackathon not found"
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Hackathon deleted successfully"
    });
  } catch (error) {
    console.error(`Error deleting hackathon with ID ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: "Failed to delete hackathon",
      error: error.message
    });
  }
};

const getHackathonStats = async (req, res) => {
  try {
    // Total hackathons count
    const totalHackathons = await Hackathon.countDocuments();
    
    // Active hackathons (end date in the future)
    const activeHackathons = await Hackathon.countDocuments({
      endDate: { $gte: new Date() }
    });
    
    // Upcoming hackathons (start date in the future)
    const upcomingHackathons = await Hackathon.countDocuments({
      startDate: { $gte: new Date() }
    });
    
    // Past hackathons (end date in the past)
    const pastHackathons = await Hackathon.countDocuments({
      endDate: { $lt: new Date() }
    });
    
    // Total applications and pending applications
    const hackathonsWithApps = await Hackathon.find();
    const totalApplications = hackathonsWithApps.reduce(
      (sum, hackathon) => sum + (hackathon.applicants?.length || 0),
      0
    );
    
    const pendingApplications = hackathonsWithApps.reduce(
      (sum, hackathon) => sum + (hackathon.applicants?.filter(app => app.status === "Pending").length || 0),
      0
    );
    
    res.status(200).json({
      success: true,
      stats: {
        totalHackathons,
        activeHackathons,
        upcomingHackathons,
        pastHackathons,
        totalApplications,
        pendingApplications
      }
    });
  } catch (error) {
    console.error("Error fetching hackathon stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve hackathon statistics",
      error: error.message
    });
  }
};

const getHackathonsByAdmin = async (req, res) => {
  try {
    const { uid } = req.params;
    
    // Find admin by Firebase UID
    const admin = await Admin.findOne({ firebaseUID: uid });
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found"
      });
    }
    
    // Find hackathons posted by this admin
    const hackathons = await Hackathon.find({ postedByAdmin: admin._id })
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: hackathons.length,
      hackathons
    });
  } catch (error) {
    console.error("Error fetching hackathons by admin:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve hackathons",
      error: error.message
    });
  }
};

// Get all mentors with status and profile completion filtering
const getAllMentorsForAdmin = async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = {};
    
    // Filter by status (active or rejected)
    if (status === 'active') {
      query.isRejected = false;
    } else if (status === 'rejected') {
      query.isRejected = true;
    }
    
    // Add search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { 'current_role.title': { $regex: search, $options: 'i' } },
        { 'current_role.company': { $regex: search, $options: 'i' } }
      ];
    }
    
    const mentors = await Mentor.find(query)
      .select({
        name: 1,
        email: 1,
        profile_picture: 1,
        bio: 1,
        current_role: 1,
        expertise: 1,
        years_of_experience: 1,
        mentorship_focus_areas: 1,
        industries_worked_in: 1,
        isRejected: 1,
        rejectionReason: 1,
        rejectionDate: 1,
        createdAt: 1,
        social_links: 1,
        mentorship_availability: 1,
        phone: 1
      })
      .sort({ createdAt: -1 });
      
    // Calculate profile completion percentage for each mentor
    const mentorsWithCompletion = mentors.map(mentor => {
      const mentorObj = mentor.toObject();
      
      // Define fields to check for mentor profile completion
      const fields = [
        { name: 'name', check: () => !!mentor.name },
        { name: 'email', check: () => !!mentor.email },
        { name: 'bio', check: () => !!mentor.bio },
        { name: 'profile_picture', check: () => !!mentor.profile_picture },
        { name: 'current_role', check: () => !!mentor.current_role?.title || !!mentor.current_role?.company },
        { name: 'years_of_experience', check: () => mentor.years_of_experience > 0 },
        { name: 'expertise', check: () => Array.isArray(mentor.expertise?.technical_skills) && mentor.expertise.technical_skills.length > 0 },
        { name: 'industries_worked_in', check: () => Array.isArray(mentor.industries_worked_in) && mentor.industries_worked_in.length > 0 },
        { name: 'mentorship_focus_areas', check: () => Array.isArray(mentor.mentorship_focus_areas) && mentor.mentorship_focus_areas.length > 0 },
        { name: 'social_links', check: () => !!mentor.social_links?.linkedin || !!mentor.social_links?.github || !!mentor.social_links?.personal_website },
        { name: 'mentorship_availability', check: () => mentor.mentorship_availability?.hours_per_week > 0 || (Array.isArray(mentor.mentorship_availability?.mentorship_type) && mentor.mentorship_availability.mentorship_type.length > 0) }
      ];
      
      // Calculate completion percentage
      let completedFields = 0;
      fields.forEach(field => {
        if (field.check()) {
          completedFields++;
        }
      });
      
      mentorObj.profileCompletion = Math.round((completedFields / fields.length) * 100);
      return mentorObj;
    });
    
    return res.status(200).json({
      success: true,
      count: mentorsWithCompletion.length,
      mentors: mentorsWithCompletion
    });
    
  } catch (error) {
    console.error("Error fetching mentors:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve mentors",
      error: error.message
    });
  }
};

// Get all students with status and profile completion filtering
const getAllStudentsForAdmin = async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = {};
    
    // Filter by status (active or rejected)
    if (status === 'active') {
      query.isRejected = false;
    } else if (status === 'rejected') {
      query.isRejected = true;
    }
    
    // Add search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { 'education.institution': { $regex: search, $options: 'i' } }
      ];
    }
    
    const students = await Student.find(query)
      .select({
        name: 1,
        email: 1,
        profile_picture: 1,
        education: 1,
        skills: 1,
        interests: 1,
        bio: 1,
        location: 1,
        isRejected: 1,
        rejectionReason: 1,
        rejectionDate: 1,
        createdAt: 1,
        phone: 1,
        social_links: 1,
        mentorship_interests: 1,
        preferred_working_hours: 1,
        goals: 1
      })
      .sort({ createdAt: -1 });
      
    // Calculate profile completion percentage for each student
    const studentsWithCompletion = students.map(student => {
      const studentObj = student.toObject();
      
      // Define fields to check for student profile completion
      const fields = [
        { name: 'name', check: () => !!student.name },
        { name: 'email', check: () => !!student.email },
        { name: 'profile_picture', check: () => !!student.profile_picture },
        { name: 'location', check: () => !!student.location?.city || !!student.location?.country },
        { name: 'education', check: () => !!student.education?.institution || !!student.education?.degree },
        { name: 'skills', check: () => Array.isArray(student.skills) && student.skills.length > 0 },
        { name: 'interests', check: () => Array.isArray(student.interests) && student.interests.length > 0 },
        { name: 'bio', check: () => !!student.bio },
        { name: 'social_links', check: () => !!student.social_links?.github || !!student.social_links?.linkedin || !!student.social_links?.portfolio },
        { name: 'mentorship_interests', check: () => student.mentorship_interests?.seeking_mentor !== undefined },
        { name: 'preferred_working_hours', check: () => !!student.preferred_working_hours?.start_time && !!student.preferred_working_hours?.end_time },
        { name: 'goals', check: () => Array.isArray(student.goals) && student.goals.length > 0 }
      ];
      
      // Calculate completion percentage
      let completedFields = 0;
      fields.forEach(field => {
        if (field.check()) {
          completedFields++;
        }
      });
      
      studentObj.profileCompletion = Math.round((completedFields / fields.length) * 100);
      return studentObj;
    });
    
    return res.status(200).json({
      success: true,
      count: studentsWithCompletion.length,
      students: studentsWithCompletion
    });
    
  } catch (error) {
    console.error("Error fetching students:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve students",
      error: error.message
    });
  }
};

// Reject a mentor
const rejectMentor = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    if (!reason || reason.trim() === '') {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required"
      });
    }
    
    const mentor = await Mentor.findByIdAndUpdate(
      id,
      {
        isRejected: true,
        rejectionReason: reason,
        rejectionDate: new Date()
      },
      { new: true }
    );
    
    if (!mentor) {
      return res.status(404).json({
        success: false,
        message: "Mentor not found"
      });
    }
    
    return res.status(200).json({
      success: true,
      message: "Mentor has been rejected",
      mentor
    });
    
  } catch (error) {
    console.error("Error rejecting mentor:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to reject mentor",
      error: error.message
    });
  }
};

// Restore a rejected mentor
const restoreMentor = async (req, res) => {
  try {
    const { id } = req.params;
    
    const mentor = await Mentor.findByIdAndUpdate(
      id,
      {
        isRejected: false,
        rejectionReason: null,
        rejectionDate: null
      },
      { new: true }
    );
    
    if (!mentor) {
      return res.status(404).json({
        success: false,
        message: "Mentor not found"
      });
    }
    
    return res.status(200).json({
      success: true,
      message: "Mentor has been restored",
      mentor
    });
    
  } catch (error) {
    console.error("Error restoring mentor:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to restore mentor",
      error: error.message
    });
  }
};

// Reject a student
const rejectStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    if (!reason || reason.trim() === '') {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required"
      });
    }
    
    const student = await Student.findByIdAndUpdate(
      id,
      {
        isRejected: true,
        rejectionReason: reason,
        rejectionDate: new Date()
      },
      { new: true }
    );
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }
    
    return res.status(200).json({
      success: true,
      message: "Student has been rejected",
      student
    });
    
  } catch (error) {
    console.error("Error rejecting student:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to reject student",
      error: error.message
    });
  }
};

// Restore a rejected student
const restoreStudent = async (req, res) => {
  try {
    const { id } = req.params;
    
    const student = await Student.findByIdAndUpdate(
      id,
      {
        isRejected: false,
        rejectionReason: null,
        rejectionDate: null
      },
      { new: true }
    );
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }
    
    return res.status(200).json({
      success: true,
      message: "Student has been restored",
      student
    });
    
  } catch (error) {
    console.error("Error restoring student:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to restore student",
      error: error.message
    });
  }
};

// Add these new functions after your existing ones
// Update the getIndividualApplicants function

const getIndividualApplicants = async (req, res) => {
  try {
    const { hackathonId } = req.params;
    
    console.log("Received hackathonId:", hackathonId);
    
    if (!hackathonId || hackathonId === 'undefined') {
      return res.status(400).json({
        success: false,
        message: "Invalid hackathon ID provided"
      });
    }
    
    const hackathon = await Hackathon.findById(hackathonId)
      .populate('individualApplicants.student', 'name email profile_picture skills');
    
    if (!hackathon) {
      return res.status(404).json({
        success: false,
        message: "Hackathon not found"
      });
    }
    
    // Filter only unassigned applicants
    const unassignedApplicants = hackathon.individualApplicants.filter(
      app => !app.assignedToTempTeam
    );
    
    res.status(200).json({
      success: true,
      count: unassignedApplicants.length,
      applicants: unassignedApplicants
    });
  } catch (error) {
    console.error("Error fetching individual applicants:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch individual applicants",
      error: error.message
    });
  }
};

// Get all teams for a hackathon
const getHackathonTeams = async (req, res) => {
  try {
    const { hackathonId } = req.params;
    
    const hackathon = await Hackathon.findById(hackathonId)
      .populate({
        path: 'teamApplicants.team',
        populate: {
          path: 'members',
          select: 'name email profile_picture'
        }
      })
      .populate('temporaryTeams.members', 'name email profile_picture')
      .populate('temporaryTeams.leader', 'name email')
      .populate('temporaryTeams.formedBy', 'name');

    if (!hackathon) {
      return res.status(404).json({
        success: false,
        message: "Hackathon not found"
      });
    }

    res.status(200).json({
      success: true,
      teams: {
        registered: hackathon.teamApplicants,
        temporary: hackathon.temporaryTeams
      }
    });
  } catch (error) {
    console.error("Error fetching hackathon teams:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch teams",
      error: error.message
    });
  }
};

// Add these functions to your existing AdminController.js

// Get detailed participant information for a hackathon
const getHackathonParticipants = async (req, res) => {
  try {
    const { hackathonId } = req.params;
    
    const hackathon = await Hackathon.findById(hackathonId)
      .populate({
        path: 'individualApplicants.student',
        select: 'name email profile_picture skills education'
      })
      .populate({
        path: 'teamApplicants.team',
        populate: {
          path: 'members.student',
          select: 'name email profile_picture skills'
        }
      })
      .populate({
        path: 'temporaryTeams.members',
        select: 'name email profile_picture skills'
      })
      .populate({
        path: 'temporaryTeams.leader',
        select: 'name email profile_picture'
      });
    
    if (!hackathon) {
      return res.status(404).json({
        success: false,
        message: "Hackathon not found"
      });
    }
    
    // Format response data
    const participants = {
      individualApplicants: hackathon.individualApplicants.map(app => ({
        id: app._id,
        student: {
          id: app.student._id,
          name: app.student.name,
          email: app.student.email,
          profile_picture: app.student.profile_picture,
          skills: app.student.skills || [],
          institution: app.student.education?.institution || 'Not specified'
        },
        status: app.status,
        registeredAt: app.registeredAt,
        skills: app.skills || [],
        assignedToTempTeam: app.assignedToTempTeam,
        tempTeamId: app.tempTeamId,
        feedback: app.feedback
      })),
      
      teamApplicants: hackathon.teamApplicants.map(app => ({
        id: app._id,
        team: {
          id: app.team._id,
          name: app.team.name,
          description: app.team.description,
          leader: app.team.leader,
          memberCount: app.team.members.length,
          members: app.team.members.map(member => ({
            id: member.student._id,
            name: member.student.name,
            role: member.role,
            profile_picture: member.student.profile_picture,
            skills: member.student.skills || []
          }))
        },
        status: app.status,
        registeredAt: app.registeredAt,
        feedback: app.feedback
      })),
      
      temporaryTeams: hackathon.temporaryTeams.map(team => ({
        id: team._id,
        tempTeamId: team.tempTeamId,
        teamName: team.teamName,
        members: team.members.map(member => ({
          id: member._id,
          name: member.name,
          email: member.email,
          profile_picture: member.profile_picture,
          skills: member.skills || []
        })),
        leader: team.leader ? {
          id: team.leader._id,
          name: team.leader.name,
          email: team.leader.email,
          profile_picture: team.leader.profile_picture
        } : null,
        formedAt: team.formedAt,
        status: team.status
      }))
    };
    
    res.status(200).json({
      success: true,
      participants
    });
    
  } catch (error) {
    console.error("Error fetching hackathon participants:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch hackathon participants",
      error: error.message
    });
  }
};

// Add this controller function:

// Get all applicants (individual) for a hackathon
const getHackathonIndividualApplicants = async (req, res) => {
  try {
    const { hackathonId } = req.params;
    
    const hackathon = await Hackathon.findById(hackathonId)
      .populate({
        path: 'individualApplicants.student',
        select: 'name email profile_picture skills'
      });
    
    if (!hackathon) {
      return res.status(404).json({ 
        success: false, 
        message: "Hackathon not found" 
      });
    }
    
    // Organize by status
    const pending = hackathon.individualApplicants.filter(a => a.status === 'Pending');
    const approved = hackathon.individualApplicants.filter(a => a.status === 'Approved');
    const rejected = hackathon.individualApplicants.filter(a => a.status === 'Rejected');
    
    res.status(200).json({
      success: true,
      data: { pending, approved, rejected }
    });
  } catch (error) {
    console.error('Error fetching hackathon individual applicants:', error);
    res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: error.message 
    });
  }
};

// Update individual applicant status
const updateApplicantStatus = async (req, res) => {
  try {
    const { hackathonId, applicantId } = req.params;
    const { status } = req.body;
    
    if (!['Pending', 'Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid status" 
      });
    }
    
    const hackathon = await Hackathon.findById(hackathonId);
    
    if (!hackathon) {
      return res.status(404).json({ 
        success: false, 
        message: "Hackathon not found" 
      });
    }
    
    const applicantIndex = hackathon.individualApplicants.findIndex(
      a => a._id.toString() === applicantId
    );
    
    if (applicantIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        message: "Applicant not found" 
      });
    }
    
    hackathon.individualApplicants[applicantIndex].status = status;
    await hackathon.save();
    
    res.status(200).json({
      success: true,
      message: "Applicant status updated successfully"
    });
  } catch (error) {
    console.error('Error updating applicant status:', error);
    res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: error.message 
    });
  }
};

const createTemporaryTeam = async (req, res) => {
  try {
    const { hackathonId } = req.params;
    const { teamName, leaderId, memberIds, createdBy } = req.body;

    // Validate input
    if (!teamName || !leaderId || !memberIds || memberIds.length === 0 || !createdBy) {
      return res.status(400).json({
        success: false,
        message: "Team name, leader, members, and createdBy are required",
      });
    }

    // Find the admin by Firebase UID
    const admin = await Admin.findOne({ firebaseUID: createdBy });
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    // Find the hackathon
    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      return res.status(404).json({
        success: false,
        message: "Hackathon not found",
      });
    }

    // Create the temporary team using admin's MongoDB ObjectId
    const tempTeam = new Team({
      name: teamName,
      leader: leaderId,
      members: memberIds.map((id) => ({ student: id })),
      isTempTeam: true,
      hackathon: hackathonId,
      createdBy: admin._id // Use admin's MongoDB ObjectId
    });

    await tempTeam.save();

    // Add the temporary team to the hackathon's team applications
    hackathon.teamApplicants.push({
      team: tempTeam._id,
      members: memberIds,
      status: "Pending",
      registeredAt: new Date(),
    });

    // Update the status of individual applicants to "Completed"
    memberIds.forEach((memberId) => {
      const applicantIndex = hackathon.individualApplicants.findIndex(
        (applicant) => applicant.student.toString() === memberId
      );

      if (applicantIndex !== -1) {
        hackathon.individualApplicants[applicantIndex].status = "Completed";
      }
    });

    await hackathon.save();

    res.status(201).json({
      success: true,
      message: "Temporary team created, added to team applications, and members marked as 'Completed'",
      tempTeam,
    });
  } catch (err) {
    console.error("Error creating temporary team:", err);
    res.status(500).json({
      success: false,
      message: "Failed to create temporary team",
      error: err.message,
    });
  }
};
// 2. Fix the convertTemporaryTeam function
const convertTemporaryTeam = async (req, res) => {
  try {
    const { hackathonId, tempTeamId } = req.params;
    
    const hackathon = await Hackathon.findById(hackathonId);
    
    if (!hackathon) {
      return res.status(404).json({ 
        success: false, 
        message: "Hackathon not found" 
      });
    }
    
    // Find the temporary team in the hackathon document
    const tempTeamIndex = hackathon.temporaryTeams.findIndex(
      t => t._id.toString() === tempTeamId
    );
    
    if (tempTeamIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        message: "Temporary team not found" 
      });
    }
    
    const tempTeam = hackathon.temporaryTeams[tempTeamIndex];
    
    // Find the Team document that was created earlier
    const teamDoc = await Team.findById(tempTeam._id || tempTeam.teamId);
    
    if (!teamDoc) {
      return res.status(404).json({ 
        success: false, 
        message: "Team document not found" 
      });
    }
    
    // Update the Team document to mark it as no longer temporary
    teamDoc.isTempTeam = false;
    await teamDoc.save();
    
    // Add to registered teams if not already there
    if (!hackathon.registeredTeams.includes(teamDoc._id)) {
      hackathon.registeredTeams.push(teamDoc._id);
    }
    
    // Remove temporary team
    hackathon.temporaryTeams.splice(tempTeamIndex, 1);
    
    // Update individual applicants
    for (const member of tempTeam.members) {
      const applicantIndex = hackathon.individualApplicants.findIndex(
        a => a.student._id.toString() === member._id.toString()
      );
      
      if (applicantIndex !== -1) {
        hackathon.individualApplicants[applicantIndex].assignedToTempTeam = false;
        hackathon.individualApplicants[applicantIndex].tempTeamId = null;
        hackathon.individualApplicants[applicantIndex].assignedToTeam = true;
        hackathon.individualApplicants[applicantIndex].teamId = teamDoc._id;
      }
    }
    
    await hackathon.save();
    
    res.status(200).json({
      success: true,
      message: "Temporary team converted to registered team successfully",
      team: teamDoc
    });
  } catch (error) {
    console.error('Error converting temporary team:', error);
    res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: error.message 
    });
  }
};

// 3. Fix the getRegisteredTeams function
const getRegisteredTeams = async (req, res) => {
  try {
    const { hackathonId } = req.params;
    
    const hackathon = await Hackathon.findById(hackathonId)
      .populate({
        path: 'registeredTeams',
        populate: {
          path: 'members.student',
          select: 'name email profile_picture skills'
        }
      });
    
    if (!hackathon) {
      return res.status(404).json({ 
        success: false, 
        message: "Hackathon not found" 
      });
    }
    
    // Get all registered teams (both converted temp teams and directly registered teams)
    const teams = hackathon.registeredTeams || [];
    
    res.status(200).json({
      success: true,
      teams
    });
  } catch (error) {
    console.error('Error fetching registered teams:', error);
    res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: error.message 
    });
  }
};
// Get all temporary teams for a hackathon
const getTemporaryTeams = async (req, res) => {
  try {
    const { hackathonId } = req.params;
    
    const hackathon = await Hackathon.findById(hackathonId);
    
    if (!hackathon) {
      return res.status(404).json({ 
        success: false, 
        message: "Hackathon not found" 
      });
    }
    
    res.status(200).json({
      success: true,
      teams: hackathon.temporaryTeams || []
    });
  } catch (error) {
    console.error('Error fetching temporary teams:', error);
    res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: error.message 
    });
  }
};

// Get team applicants 
const getTeamApplicants = async (req, res) => {
  try {
    const { hackathonId } = req.params;
    
    const hackathon = await Hackathon.findById(hackathonId)
      .populate({
        path: 'teamApplicants.team',
        populate: {
          path: 'members.student',
          select: 'name email profile_picture skills'
        }
      });
    
    if (!hackathon) {
      return res.status(404).json({ 
        success: false, 
        message: "Hackathon not found" 
      });
    }
    
    // Organize by status
    const pendingTeams = hackathon.teamApplicants.filter(a => a.status === 'Pending');
    const approvedTeams = hackathon.teamApplicants.filter(a => a.status === 'Approved');
    const rejectedTeams = hackathon.teamApplicants.filter(a => a.status === 'Rejected');
    
    res.status(200).json({
      success: true,
      data: { 
        pending: pendingTeams,
        approved: approvedTeams,
        rejected: rejectedTeams
      }
    });
  } catch (error) {
    console.error('Error fetching team applicants:', error);
    res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: error.message 
    });
  }
};

// Update team application status
const updateTeamStatus = async (req, res) => {
  try {
    const { hackathonId, teamApplicationId } = req.params;
    const { status } = req.body;
    
    if (!['Pending', 'Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid status" 
      });
    }
    
    const hackathon = await Hackathon.findById(hackathonId);
    
    if (!hackathon) {
      return res.status(404).json({ 
        success: false, 
        message: "Hackathon not found" 
      });
    }
    
    const teamIndex = hackathon.teamApplicants.findIndex(
      t => t._id.toString() === teamApplicationId
    );
    
    if (teamIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        message: "Team application not found" 
      });
    }
    
    const teamApplication = hackathon.teamApplicants[teamIndex];
    teamApplication.status = status;
    
    // If approved, add to registered teams
    if (status === 'Approved') {
      const teamId = teamApplication.team;
      
      // Check if team already in registered teams
      if (!hackathon.registeredTeams.includes(teamId)) {
        hackathon.registeredTeams.push(teamId);
      }
      
      // Update team status in Team model
      await Team.findByIdAndUpdate(teamId, { 
        $set: { 
          'hackathons.$[elem].status': 'participating' 
        } 
      }, { 
        arrayFilters: [{ 'elem.hackathonId': hackathonId }] 
      });
    }
    
    await hackathon.save();
    
    res.status(200).json({
      success: true,
      message: "Team application status updated successfully"
    });
  } catch (error) {
    console.error('Error updating team status:', error);
    res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: error.message 
    });
  }
};

// Dissolve temporary team
const dissolveTemporaryTeam = async (req, res) => {
  try {
    const { hackathonId, tempTeamId } = req.params;
    
    const hackathon = await Hackathon.findById(hackathonId);
    
    if (!hackathon) {
      return res.status(404).json({ 
        success: false, 
        message: "Hackathon not found" 
      });
    }
    
    // Find the temporary team
    const tempTeamIndex = hackathon.temporaryTeams.findIndex(
      t => t._id.toString() === tempTeamId
    );
    
    if (tempTeamIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        message: "Temporary team not found" 
      });
    }
    
    const tempTeam = hackathon.temporaryTeams[tempTeamIndex];
    
    // Update individual applicants
    for (const member of tempTeam.members) {
      const applicantIndex = hackathon.individualApplicants.findIndex(
        a => a.student._id.toString() === member._id.toString()
      );
      
      if (applicantIndex !== -1) {
        hackathon.individualApplicants[applicantIndex].assignedToTempTeam = false;
        hackathon.individualApplicants[applicantIndex].tempTeamId = null;
      }
    }
    
    // Remove temporary team
    hackathon.temporaryTeams.splice(tempTeamIndex, 1);
    
    await hackathon.save();
    
    res.status(200).json({
      success: true,
      message: "Temporary team dissolved successfully"
    });
  } catch (error) {
    console.error('Error dissolving temporary team:', error);
    res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: error.message 
    });
  }
};

const getStudentProfile = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findById(studentId)
      .select({
        name: 1,
        email: 1,
        profile_picture: 1,
        education: 1,
        skills: 1,
        interests: 1,
        bio: 1,
        location: 1,
        social_links: 1,
        goals: 1,
        projects: 1,
        achievements: 1,
        preferred_working_hours: 1
      });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    res.status(200).json({
      success: true,
      student
    });

  } catch (error) {
    console.error("Error fetching student profile:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch student profile",
      error: error.message
    });
  }
};

// Fix the exports
module.exports = {
  // Admin authentication and profile
  registerOrLoginAdmin,
  getAdminProfile,
  updateAdminProfile,
  getStudentProfile,
  
  // User moderation
  getAllMentorsForAdmin,
  getAllStudentsForAdmin,
  rejectMentor,
  restoreMentor,
  rejectStudent,
  restoreStudent,  
  
  // Team management for hackathons
  getIndividualApplicants,
  getTeamApplicants,
  createTemporaryTeam,
  getHackathonTeams,
  getHackathonParticipants,
  convertTemporaryTeam,
  dissolveTemporaryTeam,
  getHackathonIndividualApplicants,
  getRegisteredTeams, // Only include once
  updateTeamStatus,
  getTemporaryTeams,
  
  // Hackathon management
  getAllHackathons,
  getHackathonById,
  createHackathon,
  updateHackathon,
  deleteHackathon,
  updateApplicantStatus,
  getHackathonStats,
  getHackathonsByAdmin
};
