const Mentor = require("../models/Mentor");
const Student = require("../models/Student");
const Admin = require("../models/Admin"); // Add this import for Admin model
const Hackathon = require('../models/Hackathon')
// Add this import at the top
const Message = require("../models/Message");
const mongoose =require('mongoose')
const Team = require('../models/Team')



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


// Improved getTeamApplications function that fetches from Mentor schema
const getTeamApplications = async (req, res) => {
  try {
    const { mentorId } = req.params;
    
    if (!mentorId) {
      return res.status(400).json({ error: 'Mentor ID is required' });
    }
    
    console.log(`Fetching applications for mentor ID: ${mentorId}`);
    
    // Find the mentor with their applications
    const mentor = await Mentor.findById(mentorId).populate({
      path: 'applications.student',
      select: 'name description members techStack leader'
    });
    
    if (!mentor) {
      return res.status(404).json({ error: 'Mentor not found' });
    }
    
    // Filter to get only pending applications
    const pendingApplications = mentor.applications.filter(app => app.status === 'pending');
    
    console.log(`Found ${pendingApplications.length} pending applications for mentor ${mentor.name}`);
    
    // Format the applications for the response
    const formattedApplications = await Promise.all(pendingApplications.map(async (app) => {
      // If team is not populated or doesn't exist, return minimal info
      if (!app.student) {
        return {
          applicationId: app._id,
          teamId: app.student,
          teamName: "Unknown Team",
          message: app.message || '',
          applicationDate: app.application_date,
          status: app.status
        };
      }
      
      // Return full team details
      return {
        applicationId: app._id,
        teamId: app.student._id,
        teamName: app.student.name,
        description: app.student.description,
        memberCount: app.student.members?.length || 0,
        techStack: app.student.techStack || [],
        message: app.message || '',
        applicationDate: app.application_date,
        leader: app.student.leader,
        status: app.status
      };
    }));
    
    return res.status(200).json(formattedApplications);
  } catch (error) {
    console.error('Error fetching team applications:', error);
    return res.status(500).json({ 
      error: 'Server error', 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

const handleTeamApplication = async (req, res) => {
  try {
    const { mentorId, applicationId, action } = req.params;
    
    console.log(`Processing ${action} for application ${applicationId} from mentor ${mentorId}`);
    
    if (!mentorId || !mongoose.Types.ObjectId.isValid(mentorId)) {
      return res.status(400).json({
        success: false,
        message: "Valid Mentor ID is required"
      });
    }
    
    if (!applicationId || !mongoose.Types.ObjectId.isValid(applicationId)) {
      return res.status(400).json({
        success: false,
        message: "Valid Application ID is required"
      });
    }
    
    // Get the mentor
    const mentor = await Mentor.findById(mentorId);
    
    if (!mentor) {
      return res.status(404).json({
        success: false,
        message: "Mentor not found"
      });
    }
    
    // Find the application in the mentor's applications array
    const applicationIndex = mentor.applications.findIndex(app => 
      app._id.toString() === applicationId
    );
    
    if (applicationIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Application not found"
      });
    }
    
    const application = mentor.applications[applicationIndex];
    
    // Make sure there's a valid team ID
    if (!application.student || !mongoose.Types.ObjectId.isValid(application.student)) {
      return res.status(400).json({
        success: false,
        message: "Invalid team ID in application"
      });
    }
    
    // Find the team
    const teamId = application.student;
    const team = await Team.findById(teamId);
    
    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found"
      });
    }
    
    // If accepting:
    if (action === 'accept') {
      // Update application status
      mentor.applications[applicationIndex].status = 'accepted';
      
      // Add mentor to team
      team.mentor = {
        mentorId: mentor._id,
        name: mentor.name,
        expertise: mentor.expertise?.technical_skills || [],
        joinedAt: new Date(),
        status: 'active',
        invitationStatus: 'accepted'
      };
      
      // Add to team's activity log
      team.activityLog.push({
        action: 'mentor_joined',
        description: `${mentor.name} joined as team mentor`,
        userId: mentor._id,
        userType: 'Mentor',
        timestamp: new Date()
      });
      
      team.lastActivityDate = new Date();
      await team.save();
    } 
    // If rejecting:
    else if (action === 'reject') {
      mentor.applications[applicationIndex].status = 'rejected';
    }
    
    await mentor.save();
    
    return res.status(200).json({
      success: true,
      message: action === 'accept' ? 
        'Mentorship application accepted' : 
        'Mentorship application rejected'
    });
    
  } catch (error) {
    console.error("Error handling team application:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process application",
      error: error.message
    });
  }
};

// Add this function to get student profile details
const getStudentProfile = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { mentorId } = req.query;
    
    if (!studentId) {
      return res.status(400).json({ error: 'Student ID is required' });
    }
    
    // Find the student
    const student = await Student.findById(studentId).select(
      'name email profile_picture bio education experience projects skills social_links'
    );
    
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    
    // Get any feedback provided by this mentor to this student
    let feedback = [];
    if (mentorId) {
      // Find teams where this student is a member and the mentor is mentoring
      const teams = await Team.find({
        'members.student': studentId,
        'mentor.mentorId': mentorId
      });
      
      // Extract feedback from teams
      feedback = teams.reduce((allFeedback, team) => {
        const memberFeedback = team.members.find(
          m => m.student.toString() === studentId
        )?.feedback || [];
        
        return [...allFeedback, ...memberFeedback.map(fb => ({
          ...fb,
          teamName: team.name,
          teamId: team._id
        }))];
      }, []);
    }
    
    return res.status(200).json({
      success: true,
      student,
      feedback
    });
  } catch (error) {
    console.error("Error fetching student profile:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// Add this function to submit feedback for a team member
const submitMemberFeedback = async (req, res) => {
  try {
    const { teamId, memberId } = req.params;
    const { mentorId, feedback } = req.body;
    
    if (!teamId || !memberId || !mentorId || !feedback) {
      return res.status(400).json({ 
        success: false, 
        message: 'Team ID, member ID, mentor ID and feedback are required' 
      });
    }
    
    // Find the team
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }
    
    // Verify this mentor is associated with this team
    if (team.mentor?.mentorId.toString() !== mentorId) {
      return res.status(403).json({ 
        success: false, 
        message: 'You are not authorized to provide feedback for this team' 
      });
    }
    
    // Find the member in the team
    const memberIndex = team.members.findIndex(
      m => m.student.toString() === memberId
    );
    
    if (memberIndex === -1) {
      return res.status(404).json({ success: false, message: 'Member not found in team' });
    }
    
    // Get mentor details
    const mentor = await Mentor.findById(mentorId).select('name');
    
    // Add feedback to the member
    if (!team.members[memberIndex].feedback) {
      team.members[memberIndex].feedback = [];
    }
    
    team.members[memberIndex].feedback.push({
      content: feedback,
      date: new Date(),
      mentorId: mentorId,
      mentorName: mentor?.name || 'Mentor'
    });
    
    // Save the team
    await team.save();
    
    // Add to team activity log
    team.activityLog.push({
      action: 'feedback_provided',
      description: `Mentor provided feedback for team member ${team.members[memberIndex].student}`,
      userId: mentorId,
      userType: 'Mentor',
      timestamp: new Date()
    });
    
    return res.status(200).json({
      success: true,
      message: 'Feedback submitted successfully'
    });
  } catch (error) {
    console.error("Error submitting member feedback:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// Add this function to submit feedback for a project
const submitProjectFeedback = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { mentorId, projectId, feedback } = req.body;
    
    if (!teamId || !mentorId || !projectId || !feedback) {
      return res.status(400).json({ 
        success: false, 
        message: 'Team ID, mentor ID, project ID, and feedback are required' 
      });
    }
    
    // Find the team
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }
    
    // Verify this mentor is associated with this team
    if (team.mentor?.mentorId.toString() !== mentorId) {
      return res.status(403).json({ 
        success: false, 
        message: 'You are not authorized to provide feedback for this team' 
      });
    }
    
    // Find the project in the team
    const projectIndex = team.projects.findIndex(
      p => p._id.toString() === projectId
    );
    
    if (projectIndex === -1) {
      return res.status(404).json({ success: false, message: 'Project not found in team' });
    }
    
    // Get mentor details
    const mentor = await Mentor.findById(mentorId).select('name');
    
    // Add feedback to the project
    if (!team.projects[projectIndex].feedback) {
      team.projects[projectIndex].feedback = [];
    }
    
    team.projects[projectIndex].feedback.push({
      content: feedback,
      date: new Date(),
      mentorId: mentorId,
      mentorName: mentor?.name || 'Mentor'
    });
    
    // Save the team
    await team.save();
    
    // Add to team activity log
    team.activityLog.push({
      action: 'project_feedback',
      description: `Mentor provided feedback for project "${team.projects[projectIndex].name}"`,
      userId: mentorId,
      userType: 'Mentor',
      timestamp: new Date()
    });
    
    return res.status(200).json({
      success: true,
      message: 'Project feedback submitted successfully'
    });
  } catch (error) {
    console.error("Error submitting project feedback:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// Update getActiveMentorships function to include project information
const getActiveMentorships = async (req, res) => {
  try {
    const { mentorId } = req.params;
    
    if (!mentorId) {
      return res.status(400).json({ error: 'Mentor ID is required' });
    }
    
    // Find all teams that have this mentor
    const teams = await Team.find({
      'mentor.mentorId': mentorId,
      'mentor.status': 'active',
      status: { $in: ['active', 'inactive'] } // Exclude archived or disbanded teams
    }).select('name description members logo techStack formationDate lastActivityDate projects mentor.joinedAt');
    
    // Format the response
    const formattedMentorships = teams.map(team => {
      // Find the most recent active project, if any
      const currentProject = team.projects && team.projects.length > 0 
        ? team.projects
            .filter(p => p.status === 'in-progress')
            .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))[0]?.name
        : null;
      
      return {
        _id: team._id,
        name: team.name,
        description: team.description,
        logo: team.logo,
        members: team.members.map(m => ({
          _id: m.student,
          role: m.role,
          joinedAt: m.joinedAt,
          status: m.status
        })),
        techStack: team.techStack || [],
        formationDate: team.formationDate,
        lastActivityDate: team.lastActivityDate,
        currentProject,
        projectsCount: team.projects?.length || 0,
        mentorJoinedDate: team.mentor?.joinedAt
      };
    });
    
    return res.status(200).json(formattedMentorships);
  } catch (error) {
    console.error('Error fetching active mentorships:', error);
    return res.status(500).json({ error: 'Server error', message: error.message });
  }
};

// Update getTeamDetails function
const getTeamDetails = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { mentorId } = req.query;
    
    if (!teamId || !mentorId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Team ID and mentor ID are required' 
      });
    }
    
    // Find the team with populated member data
    const team = await Team.findById(teamId)
      .populate('members.student', 'name email profile_picture skills education bio experience')
      .populate('leader', 'name email');
    
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }
    
    // Verify this mentor is associated with this team
    if (team.mentor?.mentorId.toString() !== mentorId) {
      return res.status(403).json({ 
        success: false, 
        message: 'You are not authorized to access this team' 
      });
    }
    
    // Calculate team performance metrics
    const performanceMetrics = {
      activityLevel: calculateActivityLevel(team),
      activeProjects: team.projects.filter(p => p.status === 'in-progress').length,
      completedProjects: team.projects.filter(p => p.status === 'completed').length,
      projectCompletionRate: calculateProjectCompletionRate(team),
      avgMemberContribution: calculateAverageMemberContribution(team),
      teamCohesion: calculateTeamCohesion(team),
      hackathonParticipations: team.hackathons?.length || 0,
      recentAchievements: getRecentAchievements(team),
      overallRating: calculateOverallRating(team)
    };
    
    return res.status(200).json({
      success: true,
      team,
      performanceMetrics
    });
  } catch (error) {
    console.error("Error fetching team details:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// Add these placeholder calculation functions (implement properly based on your data model)
function calculateActivityLevel(team) {
  // Placeholder implementation - replace with actual calculation
  const daysSinceLastActivity = Math.floor((new Date() - new Date(team.lastActivityDate)) / (1000 * 60 * 60 * 24));
  return Math.max(0, Math.min(100, 100 - (daysSinceLastActivity * 5)));
}

function calculateProjectCompletionRate(team) {
  if (!team.projects || team.projects.length === 0) return 0;
  
  const completedProjects = team.projects.filter(p => p.status === 'completed').length;
  return Math.round((completedProjects / team.projects.length) * 100);
}

function calculateAverageMemberContribution(team) {
  // Placeholder implementation - replace with actual calculation
  return Math.floor(Math.random() * 5) + 5; // Random number between 5-10
}

function calculateTeamCohesion(team) {
  // Placeholder implementation - replace with actual calculation
  return Math.floor(Math.random() * 5) + 5; // Random number between 5-10
}

function getRecentAchievements(team) {
  const achievements = [];
  
  // Add project completions
  const recentCompletedProjects = team.projects
    .filter(p => p.status === 'completed' && new Date(p.endDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
    .map(p => `Completed project "${p.name}"`);
  
  achievements.push(...recentCompletedProjects);
  
  // Add hackathon achievements
  const recentHackathons = team.hackathons
    .filter(h => h.status === 'completed' && h.achievement)
    .map(h => `${h.achievement} in "${h.name}" hackathon`);
  
  achievements.push(...recentHackathons);
  
  // Add other team achievements
  if (team.achievements) {
    const recentOtherAchievements = team.achievements
      .filter(a => new Date(a.date) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000))
      .map(a => a.title);
    
    achievements.push(...recentOtherAchievements);
  }
  
  return achievements.slice(0, 5); // Return at most 5 achievements
}

function calculateOverallRating(team) {
  // Placeholder implementation - replace with actual calculation
  const activityScore = calculateActivityLevel(team) / 20; // 0-5 score
  const projectScore = calculateProjectCompletionRate(team) / 20; // 0-5 score
  
  // Calculate overall score (0-10)
  return Math.min(10, Math.max(1, Math.round((activityScore + projectScore + 5) / 3 * 10) / 10));
}
const getAllConversations = async (req, res) => {
  try {
    const { mentorId } = req.params;
    
    if (!mentorId) {
      return res.status(400).json({ error: 'Mentor ID is required' });
    }
    
    // Find all messages between mentor and other users
    const conversations = await Message.aggregate([
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
      // Group by conversation partner
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
          }
        }
      },
      // Sort conversations by most recent message
      { $sort: { lastMessageTime: -1 } }
    ]);

    // Fetch user details for each conversation
    const conversationsWithDetails = await Promise.all(
      conversations.map(async (conv) => {
        // First try to find user in Student collection
        let user = await Student.findById(conv._id, 'name email profile_picture');
        
        // If not found in students, check Mentors
        if (!user) {
          user = await Mentor.findById(conv._id, 'name email profile_picture');
        }
        
        if (!user) {
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
    console.error('Error fetching all conversations:', error);
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
  markMessagesAsRead,
  getTeamApplications,
  handleTeamApplication,
  getActiveMentorships,
  getStudentProfile,
  submitMemberFeedback,
  submitProjectFeedback,
  getActiveMentorships,
  getTeamDetails,
  getAllConversations
};



