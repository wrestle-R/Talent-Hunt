const Admin = require("../models/Admin");
const Hackathon = require("../models/Hackathon");
const Student = require("../models/Student");

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
      domain,
      problemStatement,
    } = req.body;
    
    // Get UID from the authentication token instead of URL params
    // This assumes you have middleware that adds the user to the request
    // If you're using Firebase Auth, you might get the UID from req.user.uid
    const uid = req.user?.uid || req.body.adminUid; // Get UID from auth middleware or request body
    
    if (!uid) {
      return res.status(400).json({
        success: false,
        message: "Admin UID is required"
      });
    }
    
    // Find admin by Firebase UID
    const admin = await Admin.findOne({ firebaseUID: uid });
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found"
      });
    }
    
    const hackathon = new Hackathon({
      hackathonName,
      description,
      startDate,
      endDate,
      lastRegisterDate,
      mode,
      location: mode === "Online" ? "Online" : location,
      prizePool: Number(prizePool),
      postedByAdmin: admin._id,
      registration: {
        totalCapacity: Number(totalCapacity),
        currentlyRegistered: 0
      },
      domain,
      problemStatement: problemStatement || [],
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

const updateApplicantStatus = async (req, res) => {
  try {
    const { hackathonId, applicantId } = req.params;
    const { status } = req.body;
    
    if (!["Pending", "Accepted", "Rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be Pending, Accepted, or Rejected"
      });
    }
    
    const hackathon = await Hackathon.findById(hackathonId);
    
    if (!hackathon) {
      return res.status(404).json({
        success: false,
        message: "Hackathon not found"
      });
    }
    
    // Find the application
    const applicationIndex = hackathon.applicants.findIndex(
      app => app._id.toString() === applicantId
    );
    
    if (applicationIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Application not found"
      });
    }
    
    // Update application status
    hackathon.applicants[applicationIndex].status = status;
    await hackathon.save();
    
    res.status(200).json({
      success: true,
      message: "Application status updated successfully",
      application: hackathon.applicants[applicationIndex]
    });
  } catch (error) {
    console.error("Error updating application status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update application status",
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

module.exports = {
  // Admin authentication and profile
  registerOrLoginAdmin,
  getAdminProfile,
  updateAdminProfile,
  
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