const Mentor = require("../models/Mentor");
const Student = require("../models/Student");
const Admin = require("../models/Admin"); // Add this import for Admin model
const Hackathon = require('../models/Hackathon')
// Add this import at the top
const Message = require("../models/Message");
const mongoose =require('mongoose')




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

// Add these functions to your existing MentorController

// Get current students for a mentor
const getCurrentStudents = async (req, res) => {
  try {
    const { mentorId } = req.params;
    
    if (!mentorId) {
      return res.status(400).json({ error: 'Mentor ID is required' });
    }
    
    // Find mentor
    const mentor = await Mentor.findById(mentorId);
    
    if (!mentor) {
      return res.status(404).json({ error: 'Mentor not found' });
    }
    
    // Find students who have this mentor assigned
    const students = await Student.find({ 
      mentor: mentorId 
    }).select('name email profile_picture skills education project');
    
    return res.status(200).json(students);
  } catch (error) {
    console.error('Error fetching current students:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

// Update getUpcomingHackathons function
const getUpcomingHackathons = async (req, res) => {
  try {
    // Get current date
    const currentDate = new Date();
    
    // Find hackathons with a start date in the future
    // Updated to match your schema field names
    const hackathons = await Hackathon.find({
      startDate: { $gt: currentDate }
    }).sort({ startDate: 1 }).limit(5);
    
    // Map to consistent field names for frontend
    const formattedHackathons = hackathons.map(hackathon => ({
      id: hackathon._id,
      name: hackathon.hackathonName,
      description: hackathon.description,
      date: `${new Date(hackathon.startDate).toLocaleDateString()} - ${new Date(hackathon.endDate).toLocaleDateString()}`,
      participants: hackathon.registration.currentlyRegistered,
      totalCapacity: hackathon.registration.totalCapacity,
      mode: hackathon.mode,
      location: hackathon.location,
      lastRegisterDate: hackathon.lastRegisterDate,
      domains: hackathon.domain
    }));
    
    return res.status(200).json(formattedHackathons);
  } catch (error) {
    console.error('Error fetching upcoming hackathons:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

// Also update the hackathon part in getDashboardData
const getDashboardData = async (req, res) => {
  try {
    // ...existing code...
    
    // Get upcoming hackathons - updated to match your schema
    const hackathons = await Hackathon.find({
      startDate: { $gt: new Date() }
    }).sort({ startDate: 1 }).limit(5);
    
    // Map hackathons to consistent format for frontend
    const upcomingHackathons = hackathons.map(hackathon => ({
      id: hackathon._id,
      name: hackathon.hackathonName,
      description: hackathon.description,
      date: `${new Date(hackathon.startDate).toLocaleDateString()} - ${new Date(hackathon.endDate).toLocaleDateString()}`,
      participants: hackathon.registration.currentlyRegistered,
      totalCapacity: hackathon.registration.totalCapacity,
      mode: hackathon.mode,
      location: hackathon.location
    }));
    
    // ...rest of the function...
    
    // Combine all data
    const dashboardData = {
      currentStudents: students,
      upcomingSessions,
      applications,
      upcomingHackathons,
      reachouts
    };
    
    // ...existing code...
  } catch (error) {
    // ...existing code...
  }
};

// Add this function to get recent conversations for a mentor
const getRecentConversations = async (req, res) => {
  try {
    const { mentorId } = req.params;
    
    if (!mentorId) {
      return res.status(400).json({ error: 'Mentor ID is required' });
    }
    
    // Find most recent messages between mentor and students
    const recentMessages = await Message.aggregate([
      // Match messages involving this mentor
      { 
        $match: { 
          $or: [
            { senderId: mentorId },
            { receiverId: mentorId }
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
              { $eq: ["$senderId", mentorId] },
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
                  { $eq: ["$receiverId", mentorId] },
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

    // Now fetch user details for each conversation
    const conversationsWithDetails = await Promise.all(
      recentMessages.map(async (conv) => {
        // First try to find user in Student collection
        let user = await Student.findById(conv._id, 'name email profile_picture');
        
        // If not found in students, check Mentors (for mentor-to-mentor chats)
        if (!user) {
          user = await Mentor.findById(conv._id, 'name email profile_picture');
        }
        
        if (!user) {
          // Fallback for users that might be deleted
          return {
            userId: conv._id,
            name: "Unknown User",
            profilePicture: null,
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
          lastMessage: conv.lastMessage,
          lastMessageTime: conv.lastMessageTime,
          unreadCount: conv.unreadCount
        };
      })
    );
    
    return res.status(200).json(conversationsWithDetails);
    
  } catch (error) {
    console.error('Error fetching recent conversations:', error);
    return res.status(500).json({ error: 'Server error', message: error.message });
  }
};

// Add this function to mark messages as read
const markMessagesAsRead = async (req, res) => {
  try {
    const { mentorId, senderId } = req.params;
    
    if (!mentorId || !senderId) {
      return res.status(400).json({ error: 'Both mentor ID and sender ID are required' });
    }
    
    // Update all unread messages from this sender to this mentor
    const result = await Message.updateMany(
      { 
        senderId: senderId,
        receiverId: mentorId,
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

// Update module exports to include the new functions
module.exports = { 
  registerOrLoginMentor,
  getMentorProfile,
  updateMentorProfile,
  calculateMentorProfileCompletion,
  getCurrentStudents,
  getUpcomingHackathons,
  getDashboardData,
  getRecentConversations,
  markMessagesAsRead
};

