const mongoose = require('mongoose');
const Team = require('../models/Team');
const Student = require('../models/Student');
const crypto = require('crypto');
const Mentor = require('../models/Mentor')

// Create a new team
// Update the createTeam function to fix validation errors

// Create a new team
const createTeam = async (req, res) => {
    try {
      const { 
        name, 
        description, 
        isPublic, 
        techStack, 
        maxTeamSize = 7,
        recruitmentMessage = "",
        createdBy // Get the creator ID from request body instead of auth middleware
      } = req.body;
      
      if (!createdBy) {
        return res.status(400).json({
          success: false,
          message: "Creator ID is required"
        });
      }
      
      // Check if student is already a team leader
      const existingTeamAsLeader = await Team.findOne({ 
        leader: createdBy,
        status: { $ne: 'disbanded' }
      });
      
      if (existingTeamAsLeader) {
        return res.status(400).json({
          success: false,
          message: "You are already a leader of another team"
        });
      }
      
      // Generate a unique join code
      const joinCode = crypto.randomBytes(4).toString('hex').toUpperCase();
      
      // Create the new team
      const newTeam = new Team({
        name,
        description,
        isPublic: isPublic ?? true,
        techStack: techStack || [],
        createdBy,
        leader: createdBy, // Explicitly set leader to fix first error
        joinCode,
        maxTeamSize,
        recruitmentMessage,
        isRecruiting: true,
        members: [{
          student: createdBy,
          // Use one of the valid enum values from the Team model
          role: "Project Manager", // Changed from "Team Leader" to fix second error
          joinedAt: new Date(),
          status: 'active',
          invitationStatus: 'accepted'
        }],
        activityLog: [{
          action: 'team_created',
          description: `Team "${name}" was created`,
          userId: createdBy,
          userType: 'Student'
        }]
      });
      
      await newTeam.save();
      
      // Add team reference to student
      await Student.findByIdAndUpdate(createdBy, {
        $push: { 
          teams: {
            teamId: newTeam._id,
            role: 'Project Manager', // Changed from "Team Leader" to match the above change
            joinedAt: new Date(),
            isLeader: true
          }
        }
      });
      
      res.status(201).json({
        success: true,
        message: "Team created successfully",
        team: {
          _id: newTeam._id,
          name: newTeam.name,
          description: newTeam.description,
          joinCode: newTeam.joinCode
        }
      });
      
    } catch (error) {
      console.error("Error creating team:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create team",
        error: error.message
      });
    }
  };

// Get teams where student is a member
const getMyTeams = async (req, res) => {
  try {
    // Get studentId from query parameter instead of auth middleware
    const { studentId } = req.query;
    
    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "Student ID is required"
      });
    }
    
    // Find all teams where the student is a member
    const teams = await Team.find({
      'members.student': studentId,
      status: { $ne: 'disbanded' }
    }).select('_id name description leader members invitations joinRequests applications techStack isRecruiting lastActivityDate');
    
    // Format the response with additional information
    const formattedTeams = await Promise.all(teams.map(async (team) => {
      const isLeader = team.leader.toString() === studentId.toString();
      const memberInfo = team.members.find(m => m.student.toString() === studentId.toString());
      
      // Count pending applications and invitations
      const pendingInvitations = team.invitations.filter(invite => invite.status === 'pending').length;
      const pendingApplications = team.joinRequests.filter(app => app.status === 'pending').length;
      
      return {
        _id: team._id,
        name: team.name,
        description: team.description,
        isLeader,
        role: memberInfo?.role || 'Member',
        memberCount: team.members.length,
        techStack: team.techStack,
        pendingInvitations: isLeader ? pendingInvitations : 0,
        pendingApplications: isLeader ? pendingApplications : 0,
        isRecruiting: team.isRecruiting,
        lastActivity: team.lastActivityDate
      };
    }));
    
    res.status(200).json({
      success: true,
      teamsCount: formattedTeams.length,
      teams: formattedTeams
    });
  } catch (error) {
    console.error("Error fetching teams:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch teams",
      error: error.message
    });
  }
};

// Get team details by ID
const getTeamById = async (req, res) => {
  try {
    const { teamId } = req.params;
    // Get studentId from query parameter instead of auth middleware
    const { studentId } = req.query;
    
    if (!mongoose.Types.ObjectId.isValid(teamId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid team ID format"
      });
    }
    
    // Get the team with populated member details
    const team = await Team.findById(teamId)
      .populate('members.student', 'name email profile_picture education skills')
      .populate('leader', 'name email profile_picture')
      .populate('invitations.recipientId', 'name email profile_picture')
      .populate('joinRequests.studentId', 'name email profile_picture skills education');
    
    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found"
      });
    }
    
    // Check if the student is a member of the team (if studentId is provided)
    let isMember = false;
    let isLeader = false;
    let hasRequestedToJoin = false;
    let invitationStatus = null;
    let invitationId = null;
    
    if (studentId) {
      isMember = team.members.some(m => m.student._id.toString() === studentId.toString());
      isLeader = team.leader._id.toString() === studentId.toString();
      
      // Check if student has requested to join
      const joinRequest = team.joinRequests.find(
        req => req.studentId.toString() === studentId.toString() && req.status === 'pending'
      );
      hasRequestedToJoin = !!joinRequest;
      
      // Check invitation status
      const invitation = team.invitations.find(
        inv => inv.recipientId.toString() === studentId.toString()
      );
      
      if (invitation) {
        invitationStatus = invitation.status;
        invitationId = invitation._id;
      }
    }
    
    // If team is not public and user is not a member, restrict access
    if (!team.isPublic && !isMember && studentId) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to view this team"
      });
    }
    
    // Format data based on user's role
    const formattedTeam = {
      _id: team._id,
      name: team.name,
      description: team.description,
      joinCode: isLeader ? team.joinCode : undefined,
      logo: team.logo,
      leader: {
        _id: team.leader._id,
        name: team.leader.name,
        email: team.leader.email,
        profile_picture: team.leader.profile_picture
      },
      isPublic: team.isPublic,
      techStack: team.techStack,
      isRecruiting: team.isRecruiting,
      recruitmentMessage: team.recruitmentMessage,
      skillsNeeded: team.skillsNeeded,
      maxTeamSize: team.maxTeamSize,
      members: team.members.map(m => ({
        _id: m.student._id,
        name: m.student.name,
        email: m.student.email,
        profile_picture: m.student.profile_picture,
        role: m.role,
        customRole: m.customRole,
        skills: m.student.skills,
        institution: m.student.education?.institution,
        status: m.status,
        joinedAt: m.joinedAt
      })),
      projects: team.projects?.map(p => ({
        _id: p._id,
        name: p.name,
        description: p.description,
        status: p.status,
        techStack: p.techStack
      })),
      // Only show invitations and requests to leader
      invitations: isLeader ? team.invitations.map(inv => ({
        _id: inv._id,
        recipient: {
          _id: inv.recipientId._id,
          name: inv.recipientId.name,
          email: inv.recipientId.email,
          profile_picture: inv.recipientId.profile_picture
        },
        role: inv.role,
        message: inv.message,
        sentAt: inv.sentAt,
        status: inv.status
      })) : [],
      joinRequests: isLeader ? team.joinRequests.map(req => ({
        _id: req._id,
        student: {
          _id: req.studentId._id,
          name: req.studentId.name,
          email: req.studentId.email,
          profile_picture: req.studentId.profile_picture,
          skills: req.studentId.skills,
          institution: req.studentId.education?.institution
        },
        message: req.message,
        requestDate: req.requestDate,
        status: req.status
      })) : [],
      // User's relationship to the team
      userStatus: {
        isMember,
        isLeader,
        hasRequestedToJoin,
        invitationStatus,
        invitationId
      }
    };
    
    res.status(200).json({
      success: true,
      team: formattedTeam
    });
    
  } catch (error) {
    console.error("Error fetching team details:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch team details",
      error: error.message
    });
  }
};

// Join a team using join code
const joinTeamWithCode = async (req, res) => {
  try {
    const { joinCode, studentId } = req.body; // Get studentId from body instead of auth middleware
    
    if (!joinCode || !studentId) {
      return res.status(400).json({
        success: false,
        message: "Join code and studentId are required"
      });
    }
    
    // Find team by join code
    const team = await Team.findOne({ joinCode });
    
    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Invalid join code. Team not found."
      });
    }
    
    // Check if team is full
    if (team.members.length >= team.maxTeamSize) {
      return res.status(400).json({
        success: false,
        message: "Team is already at maximum capacity"
      });
    }
    
    // Check if student is already a member
    if (team.members.some(m => m.student.toString() === studentId.toString())) {
      return res.status(400).json({
        success: false,
        message: "You are already a member of this team"
      });
    }
    
    // Get student info for adding to team
    const student = await Student.findById(studentId);
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }
    
    // Add student to team as member
    team.members.push({
      student: studentId,
      role: 'Member',
      joinedAt: new Date(),
      status: 'active',
      invitationStatus: 'accepted',
      institution: student.education?.institution,
      skills: student.skills
    });
    
    // Add to activity log
    team.activityLog.push({
      action: 'member_joined',
      description: `${student.name} joined the team using join code`,
      userId: studentId,
      userType: 'Student',
      timestamp: new Date()
    });
    
    team.lastActivityDate = new Date();
    
    await team.save();
    
    // Add team to student's teams
    await Student.findByIdAndUpdate(studentId, {
      $push: {
        teams: {
          teamId: team._id,
          role: 'Member',
          joinedAt: new Date(),
          isLeader: false
        }
      }
    });
    
    res.status(200).json({
      success: true,
      message: "Successfully joined team",
      teamId: team._id,
      teamName: team.name
    });
    
  } catch (error) {
    console.error("Error joining team:", error);
    res.status(500).json({
      success: false,
      message: "Failed to join team",
      error: error.message
    });
  }
};

// Apply to join a team
const applyToJoinTeam = async (req, res) => {
  try {
    const { teamId, message, studentId } = req.body; // Get studentId from body instead of auth middleware
    
    if (!teamId || !studentId) {
      return res.status(400).json({
        success: false,
        message: "Team ID and Student ID are required"
      });
    }
    
    if (!mongoose.Types.ObjectId.isValid(teamId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid team ID format"
      });
    }
    
    // Find the team
    const team = await Team.findById(teamId);
    
    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found"
      });
    }
    
    // Check if the team is recruiting
    if (!team.isRecruiting) {
      return res.status(400).json({
        success: false,
        message: "This team is not currently recruiting new members"
      });
    }
    
    // Check if student is already a member
    if (team.members.some(m => m.student.toString() === studentId.toString())) {
      return res.status(400).json({
        success: false,
        message: "You are already a member of this team"
      });
    }
    
    // Check if student has already applied
    if (team.joinRequests.some(req => 
      req.studentId.toString() === studentId.toString() && 
      req.status === 'pending'
    )) {
      return res.status(400).json({
        success: false,
        message: "You have already applied to join this team"
      });
    }
    
    // Get student information
    const student = await Student.findById(studentId);
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }
    
    // Add join request
    team.joinRequests.push({
      studentId,
      message: message || "I would like to join your team.",
      skills: student.skills,
      institution: student.education?.institution,
      requestDate: new Date(),
      status: 'pending'
    });
    
    team.lastActivityDate = new Date();
    
    await team.save();
    
    res.status(200).json({
      success: true,
      message: "Application submitted successfully",
      teamName: team.name
    });
    
  } catch (error) {
    console.error("Error applying to team:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit application",
      error: error.message
    });
  }
};

// Respond to join request (accept/reject)
const respondToJoinRequest = async (req, res) => {
  try {
    const { teamId, requestId, accept, responderId } = req.body; // Get responder ID from body instead of auth middleware
    
    if (!mongoose.Types.ObjectId.isValid(teamId) || !mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format"
      });
    }
    
    // Find the team
    const team = await Team.findById(teamId);
    
    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found"
      });
    }
    
    // Check if user is team leader
    if (team.leader.toString() !== responderId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the team leader can respond to join requests"
      });
    }
    
    // Find the join request
    const requestIndex = team.joinRequests.findIndex(req => req._id.toString() === requestId);
    
    if (requestIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Join request not found"
      });
    }
    
    const joinRequest = team.joinRequests[requestIndex];
    
    // Check if request is already processed
    if (joinRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `This request has already been ${joinRequest.status}`
      });
    }
    
    if (accept) {
      // Check if team is full
      if (team.members.length >= team.maxTeamSize) {
        return res.status(400).json({
          success: false,
          message: "Cannot accept request: team is at maximum capacity"
        });
      }
      
      // Accept the request - update the request status
      team.joinRequests[requestIndex].status = 'accepted';
      
      // Get applicant info
      const applicantId = joinRequest.studentId;
      const applicant = await Student.findById(applicantId);
      
      if (!applicant) {
        return res.status(404).json({
          success: false,
          message: "Applicant student not found"
        });
      }
      
      // Add applicant to team members
      team.members.push({
        student: applicantId,
        role: 'Member',
        joinedAt: new Date(),
        status: 'active',
        invitationStatus: 'accepted',
        institution: applicant.education?.institution,
        skills: applicant.skills
      });
      
      // Add to activity log
      team.activityLog.push({
        action: 'member_joined',
        description: `${applicant.name} joined the team (application accepted)`,
        userId: applicantId,
        userType: 'Student',
        timestamp: new Date()
      });
      
      // Add team to student's teams
      await Student.findByIdAndUpdate(applicantId, {
        $push: {
          teams: {
            teamId: team._id,
            role: 'Member',
            joinedAt: new Date(),
            isLeader: false
          }
        }
      });
      
    } else {
      // Reject the request
      team.joinRequests[requestIndex].status = 'declined';
    }
    
    team.lastActivityDate = new Date();
    await team.save();
    
    res.status(200).json({
      success: true,
      message: accept ? 
        "Application accepted, new member added to team" : 
        "Application declined"
    });
    
  } catch (error) {
    console.error("Error responding to join request:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process join request",
      error: error.message
    });
  }
};

// Invite a student to join team
const inviteToTeam = async (req, res) => {
  try {
    const { teamId, studentId, role, message, inviterId } = req.body; // Get inviter ID from body instead of auth middleware
    
    if (!mongoose.Types.ObjectId.isValid(teamId) || !mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format"
      });
    }
    
    // Find the team
    const team = await Team.findById(teamId);
    
    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found"
      });
    }
    
    // Check if user is team leader
    if (team.leader.toString() !== inviterId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the team leader can send invitations"
      });
    }
    
    // Check if team is full
    if (team.members.length >= team.maxTeamSize) {
      return res.status(400).json({
        success: false,
        message: "Team is already at maximum capacity"
      });
    }
    
    // Check if student is already a member
    if (team.members.some(m => m.student.toString() === studentId.toString())) {
      return res.status(400).json({
        success: false,
        message: "This student is already a member of your team"
      });
    }
    
    // Check if student already has an invitation
    if (team.invitations.some(inv => 
      inv.recipientId.toString() === studentId.toString() && 
      inv.status === 'pending'
    )) {
      return res.status(400).json({
        success: false,
        message: "You have already invited this student"
      });
    }
    
    // Verify the student exists
    const student = await Student.findById(studentId);
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }
    
    // Create expiration date (7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    
    // Add invitation
    team.invitations.push({
      recipientId: studentId,
      recipientType: 'Student',
      role: role || 'Member',
      message: message || `You are invited to join ${team.name}`,
      invitedBy: inviterId,
      sentAt: new Date(),
      expiresAt,
      status: 'pending'
    });
    
    team.lastActivityDate = new Date();
    await team.save();
    
    res.status(200).json({
      success: true,
      message: `Invitation sent to ${student.name}`,
      invitationId: team.invitations[team.invitations.length - 1]._id
    });
    
  } catch (error) {
    console.error("Error inviting to team:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send invitation",
      error: error.message
    });
  }
};

// Respond to team invitation
const respondToInvitation = async (req, res) => {
  try {
    const { teamId, invitationId, accept, studentId } = req.body; // Get student ID from body instead of auth middleware
    
    if (!mongoose.Types.ObjectId.isValid(teamId) || !mongoose.Types.ObjectId.isValid(invitationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format"
      });
    }
    
    // Find the team
    const team = await Team.findById(teamId);
    
    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found"
      });
    }
    
    // Find the invitation
    const invitationIndex = team.invitations.findIndex(inv => 
      inv._id.toString() === invitationId && 
      inv.recipientId.toString() === studentId.toString()
    );
    
    if (invitationIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Invitation not found"
      });
    }
    
    const invitation = team.invitations[invitationIndex];
    
    // Check if invitation is still pending
    if (invitation.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `This invitation has already been ${invitation.status}`
      });
    }
    
    // Check if invitation has expired
    if (invitation.expiresAt && new Date() > new Date(invitation.expiresAt)) {
      team.invitations[invitationIndex].status = 'expired';
      await team.save();
      
      return res.status(400).json({
        success: false,
        message: "This invitation has expired"
      });
    }
    
    if (accept) {
      // Check if team is full
      if (team.members.length >= team.maxTeamSize) {
        return res.status(400).json({
          success: false,
          message: "Cannot join: team is at maximum capacity"
        });
      }
      
      // Accept the invitation
      team.invitations[invitationIndex].status = 'accepted';
      
      // Get student info
      const student = await Student.findById(studentId);
      
      if (!student) {
        return res.status(404).json({
          success: false,
          message: "Student not found"
        });
      }
      
      // Add student to team members
      team.members.push({
        student: studentId,
        role: invitation.role || 'Member',
        joinedAt: new Date(),
        status: 'active',
        invitationStatus: 'accepted',
        institution: student.education?.institution,
        skills: student.skills
      });
      
      // Add to activity log
      team.activityLog.push({
        action: 'member_joined',
        description: `${student.name} joined the team (invitation accepted)`,
        userId: studentId,
        userType: 'Student',
        timestamp: new Date()
      });
      
      // Add team to student's teams
      await Student.findByIdAndUpdate(studentId, {
        $push: {
          teams: {
            teamId: team._id,
            role: invitation.role || 'Member',
            joinedAt: new Date(),
            isLeader: false
          }
        }
      });
      
    } else {
      // Decline the invitation
      team.invitations[invitationIndex].status = 'declined';
    }
    
    team.lastActivityDate = new Date();
    await team.save();
    
    res.status(200).json({
      success: true,
      message: accept ? 
        `You have joined team ${team.name}` : 
        `You have declined the invitation to team ${team.name}`
    });
    
  } catch (error) {
    console.error("Error responding to invitation:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process invitation",
      error: error.message
    });
  }
};

// Add this function to your controller

// Get teams that are recruiting
const getRecruitingTeams = async (req, res) => {
    try {
      const { studentId } = req.query;
      
      if (!studentId) {
        return res.status(400).json({
          success: false,
          message: "Student ID is required"
        });
      }
      
      // Find public teams that are recruiting and where the student is not already a member
      const teams = await Team.find({
        isPublic: true,
        isRecruiting: true,
        status: { $ne: 'disbanded' },
        'members.student': { $ne: studentId }
      }).select('_id name description leader members techStack maxTeamSize isRecruiting');
      
      // Check if the student has already applied to any of these teams
      const formattedTeams = await Promise.all(teams.map(async (team) => {
        // Check if student has an active application
        const hasApplied = team.joinRequests && team.joinRequests.some(
          req => req.studentId.toString() === studentId.toString() && req.status === 'pending'
        );
        
        return {
          _id: team._id,
          name: team.name,
          description: team.description || '',
          memberCount: team.members.length,
          maxTeamSize: team.maxTeamSize || 5,
          techStack: team.techStack || [],
          hasApplied: hasApplied || false
        };
      }));
      
      res.status(200).json({
        success: true,
        teamsCount: formattedTeams.length,
        teams: formattedTeams
      });
    } catch (error) {
      console.error("Error fetching recruiting teams:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch recruiting teams",
        error: error.message
      });
    }
  };
  
// Update team details (name, description, etc.)
const updateTeamDetails = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { 
      name, 
      description, 
      isPublic, 
      techStack, 
      maxTeamSize,
      recruitmentMessage,
      skillsNeeded,
      isRecruiting,
      updaterId // ID of the user making the update
    } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(teamId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid team ID format"
      });
    }
    
    // Find the team
    const team = await Team.findById(teamId);
    
    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found"
      });
    }
    
    // Check if user is team leader
    if (team.leader.toString() !== updaterId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the team leader can update team details"
      });
    }
    
    // Update core team details
    if (name) team.name = name;
    if (description !== undefined) team.description = description;
    if (isPublic !== undefined) team.isPublic = isPublic;
    if (techStack) team.techStack = techStack;
    if (maxTeamSize && maxTeamSize >= team.members.length && maxTeamSize <= 15) {
      team.maxTeamSize = maxTeamSize;
    } else if (maxTeamSize && maxTeamSize < team.members.length) {
      return res.status(400).json({
        success: false,
        message: `Team size cannot be less than current member count (${team.members.length})`
      });
    }
    
    // Update recruitment settings
    if (isRecruiting !== undefined) team.isRecruiting = isRecruiting;
    if (recruitmentMessage !== undefined) team.recruitmentMessage = recruitmentMessage;
    if (skillsNeeded) team.skillsNeeded = skillsNeeded;
    
    // Update activity log
    team.activityLog.push({
      action: 'team_updated',
      description: `Team details updated by team leader`,
      userId: updaterId,
      userType: 'Student',
      timestamp: new Date()
    });
    
    team.lastActivityDate = new Date();
    await team.save();
    
    res.status(200).json({
      success: true,
      message: "Team details updated successfully",
      team: {
        _id: team._id,
        name: team.name,
        description: team.description,
        isPublic: team.isPublic,
        techStack: team.techStack,
        maxTeamSize: team.maxTeamSize,
        isRecruiting: team.isRecruiting,
        recruitmentMessage: team.recruitmentMessage,
        skillsNeeded: team.skillsNeeded
      }
    });
    
  } catch (error) {
    console.error("Error updating team details:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update team details",
      error: error.message
    });
  }
};

// Remove a member from the team
const removeTeamMember = async (req, res) => {
  try {
    const { teamId, memberId } = req.params;
    const { removerId } = req.body; // ID of the user performing the removal
    
    if (!mongoose.Types.ObjectId.isValid(teamId) || !mongoose.Types.ObjectId.isValid(memberId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format"
      });
    }
    
    // Find the team
    const team = await Team.findById(teamId);
    
    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found"
      });
    }
    
    // Check if user is team leader
    if (team.leader.toString() !== removerId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the team leader can remove members"
      });
    }
    
    // Cannot remove the team leader
    if (memberId === team.leader.toString()) {
      return res.status(400).json({
        success: false,
        message: "Cannot remove the team leader"
      });
    }
    
    // Find the member in the team
    const memberIndex = team.members.findIndex(m => m.student.toString() === memberId);
    
    if (memberIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Member not found in team"
      });
    }
    
    // Get member info for activity log
    const memberInfo = team.members[memberIndex];
    
    // Remove the member
    team.members.splice(memberIndex, 1);
    
    // Add to activity log
    team.activityLog.push({
      action: 'member_left',
      description: `Team member was removed by team leader`,
      userId: memberId,
      userType: 'Student',
      timestamp: new Date()
    });
    
    team.lastActivityDate = new Date();
    await team.save();
    
    // Remove team from student's teams list
    await Student.findByIdAndUpdate(memberId, {
      $pull: {
        teams: { teamId: team._id }
      }
    });
    
    res.status(200).json({
      success: true,
      message: "Team member removed successfully"
    });
    
  } catch (error) {
    console.error("Error removing team member:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove team member",
      error: error.message
    });
  }
};

// Generate a new join code for the team
const regenerateJoinCode = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { requesterId } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(teamId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid team ID format"
      });
    }
    
    // Find the team
    const team = await Team.findById(teamId);
    
    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found"
      });
    }
    
    // Check if user is team leader
    if (team.leader.toString() !== requesterId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the team leader can regenerate join code"
      });
    }
    
    // Generate a new join code
    const newJoinCode = crypto.randomBytes(4).toString('hex').toUpperCase();
    team.joinCode = newJoinCode;
    
    // Add to activity log
    team.activityLog.push({
      action: 'join_code_regenerated',
      description: `Team join code was regenerated by team leader`,
      userId: requesterId,
      userType: 'Student',
      timestamp: new Date()
    });
    
    team.lastActivityDate = new Date();
    await team.save();
    
    res.status(200).json({
      success: true,
      message: "Join code regenerated successfully",
      joinCode: newJoinCode
    });
    
  } catch (error) {
    console.error("Error regenerating join code:", error);
    res.status(500).json({
      success: false,
      message: "Failed to regenerate join code",
      error: error.message
    });
  }
};

const getPendingInvitations = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { status } = req.query;

    if (!mongoose.Types.ObjectId.isValid(teamId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid team ID format"
      });
    }

    const team = await Team.findById(teamId).populate('invitations.recipientId', 'name email profile_picture');

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found"
      });
    }

    const invitations = team.invitations.filter(inv => inv.status === status);

    res.status(200).json({
      success: true,
      invitations
    });
  } catch (error) {
    console.error("Error fetching pending invitations:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch pending invitations",
      error: error.message
    });
  }
};

// Add a new project to a team
const addProject = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { 
      name, 
      description, 
      status, 
      techStack, 
      githubRepo, 
      deployedUrl, 
      startDate, 
      endDate, 
      creatorId 
    } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(teamId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid team ID format"
      });
    }
    
    // Find the team
    const team = await Team.findById(teamId);
    
    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found"
      });
    }
    
    // Check if user is team leader
    if (team.leader.toString() !== creatorId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the team leader can add projects"
      });
    }
    
    // Validation
    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Project name is required"
      });
    }
    
    // For completed projects, end date is required
    if (status === 'completed' && !endDate) {
      return res.status(400).json({
        success: false,
        message: "End date is required for completed projects"
      });
    }
    
    // Ensure dates are valid
    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      return res.status(400).json({
        success: false,
        message: "End date cannot be before start date"
      });
    }
    
    // Create a new project
    const newProject = {
      name,
      description: description || '',
      status: status || 'planning',
      techStack: techStack || [],
      githubRepo: githubRepo || '',
      deployedUrl: deployedUrl || '',
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      // Generate a new ObjectId for the project
      _id: new mongoose.Types.ObjectId()
    };
    
    // Add project to team
    team.projects.push(newProject);
    
    // Add to activity log
    team.activityLog.push({
      action: 'project_added',
      description: `New project "${name}" was added to the team`,
      userId: creatorId,
      userType: 'Student',
      timestamp: new Date()
    });
    
    team.lastActivityDate = new Date();
    await team.save();
    
    res.status(201).json({
      success: true,
      message: "Project added successfully",
      project: newProject
    });
    
  } catch (error) {
    console.error("Error adding project:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add project",
      error: error.message
    });
  }
};

// Update an existing project
const updateProject = async (req, res) => {
  try {
    const { teamId, projectId } = req.params;
    const { 
      name, 
      description, 
      status, 
      techStack, 
      githubRepo, 
      deployedUrl, 
      startDate, 
      endDate, 
      updaterId 
    } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(teamId) || !mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format"
      });
    }
    
    // Find the team
    const team = await Team.findById(teamId);
    
    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found"
      });
    }
    
    // Check if user is team leader
    if (team.leader.toString() !== updaterId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the team leader can update projects"
      });
    }
    
    // Find the project in the team
    const projectIndex = team.projects.findIndex(p => p._id.toString() === projectId);
    
    if (projectIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Project not found in team"
      });
    }
    
    // Validation
    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Project name is required"
      });
    }
    
    // For completed projects, end date is required
    if (status === 'completed' && !endDate) {
      return res.status(400).json({
        success: false,
        message: "End date is required for completed projects"
      });
    }
    
    // Ensure dates are valid
    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      return res.status(400).json({
        success: false,
        message: "End date cannot be before start date"
      });
    }
    
    // Check if the project is being marked as completed
    const isNewlyCompleted = 
      status === 'completed' && 
      team.projects[projectIndex].status !== 'completed';
    
    // Update the project
    team.projects[projectIndex] = {
      ...team.projects[projectIndex],
      name,
      description: description || '',
      status: status || 'planning',
      techStack: techStack || [],
      githubRepo: githubRepo || '',
      deployedUrl: deployedUrl || '',
      startDate: startDate ? new Date(startDate) : team.projects[projectIndex].startDate,
      endDate: endDate ? new Date(endDate) : team.projects[projectIndex].endDate
    };
    
    // Add to activity log
    team.activityLog.push({
      action: isNewlyCompleted ? 'project_completed' : 'team_updated',
      description: isNewlyCompleted ? 
        `Project "${name}" was marked as completed` : 
        `Project "${name}" was updated`,
      userId: updaterId,
      userType: 'Student',
      timestamp: new Date()
    });
    
    team.lastActivityDate = new Date();
    await team.save();
    
    res.status(200).json({
      success: true,
      message: "Project updated successfully",
      project: team.projects[projectIndex]
    });
    
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update project",
      error: error.message
    });
  }
};

// Delete a project
const deleteProject = async (req, res) => {
  try {
    const { teamId, projectId } = req.params;
    const { deleterId } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(teamId) || !mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format"
      });
    }
    
    // Find the team
    const team = await Team.findById(teamId);
    
    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found"
      });
    }
    
    // Check if user is team leader
    if (team.leader.toString() !== deleterId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the team leader can delete projects"
      });
    }
    
    // Find the project in the team
    const projectIndex = team.projects.findIndex(p => p._id.toString() === projectId);
    
    if (projectIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Project not found in team"
      });
    }
    
    // Store project name for activity log
    const projectName = team.projects[projectIndex].name;
    
    // Remove the project
    team.projects.splice(projectIndex, 1);
    
    // Add to activity log
    team.activityLog.push({
      action: 'team_updated',
      description: `Project "${projectName}" was removed from the team`,
      userId: deleterId,
      userType: 'Student',
      timestamp: new Date()
    });
    
    team.lastActivityDate = new Date();
    await team.save();
    
    res.status(200).json({
      success: true,
      message: "Project deleted successfully"
    });
    
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete project",
      error: error.message
    });
  }
};

const getStudentById = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID format"
      });
    }
    
    const student = await Student.findById(studentId);
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }
    
    // Return the appropriate student data
    res.status(200).json({
      success: true,
      student: {
        _id: student._id,
        name: student.name,
        email: student.email,
        profile_picture: student.profile_picture,
        bio: student.bio,
        institution: student.institution || (student.education ? student.education.institution : null),
        skills: student.skills || [],
        experience: student.experience,
        education: student.education,
        projects: student.projects,
        github: student.github,
        linkedin: student.linkedin,
        portfolio: student.portfolio
      }
    });
    
  } catch (error) {
    console.error("Error fetching student:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching student profile"
    });
  }
};

// Add this function to your existing StudentController.js
const getStudentProfileById = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID format"
      });
    }
    
    const student = await Student.findById(studentId)
      .select('name email profile_picture bio skills experience education projects github linkedin portfolio institution');
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }
    
    // Return the formatted student data
    res.status(200).json({
      success: true,
      student: {
        _id: student._id,
        name: student.name,
        email: student.email,
        profile_picture: student.profile_picture,
        bio: student.bio,
        institution: student.institution || (student.education ? student.education.institution : null),
        skills: student.skills || [],
        experience: student.experience,
        education: student.education,
        projects: student.projects || [],
        github: student.github,
        linkedin: student.linkedin,
        portfolio: student.portfolio
      }
    });
    
  } catch (error) {
    console.error("Error fetching student profile:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching student profile",
      error: error.message
    });
  }
};
// Search for available mentors based on filters
const searchMentors = async (req, res) => {
  try {
    const { query, skills, industries, availability, page = 1, limit = 10 } = req.query;
    
    // Build the search query
    const searchCriteria = { isRejected: false };
    
    // Add text search if provided
    if (query) {
      searchCriteria.$or = [
        { name: { $regex: query, $options: 'i' } },
        { bio: { $regex: query, $options: 'i' } },
        { 'current_role.title': { $regex: query, $options: 'i' } },
        { 'current_role.company': { $regex: query, $options: 'i' } }
      ];
    }
    
    // Add skills filter if provided
    if (skills) {
      const skillsArray = skills.split(',');
      searchCriteria['expertise.technical_skills'] = { $in: skillsArray };
    }
    
    // Add industries filter if provided
    if (industries) {
      const industriesArray = industries.split(',');
      searchCriteria.industries_worked_in = { $in: industriesArray };
    }
    
    // Add availability filter if provided
    if (availability) {
      searchCriteria['mentorship_availability.hours_per_week'] = { $gte: parseInt(availability) };
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Find mentors matching the criteria
    const mentors = await Mentor.find(searchCriteria)
      .select('name email profile_picture current_role expertise mentorship_focus_areas mentorship_availability industries_worked_in rating years_of_experience')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ rating: -1 });
    
    // Count total results for pagination
    const totalMentors = await Mentor.countDocuments(searchCriteria);
    
    res.status(200).json({
      success: true,
      count: mentors.length,
      total: totalMentors,
      totalPages: Math.ceil(totalMentors / parseInt(limit)),
      currentPage: parseInt(page),
      mentors
    });
    
  } catch (error) {
    console.error("Error searching mentors:", error);
    res.status(500).json({
      success: false,
      message: "Failed to search mentors",
      error: error.message
    });
  }
};

// Apply to a mentor for mentorship
const applyToMentor = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { mentorId, message, applicantId } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(teamId) || !mongoose.Types.ObjectId.isValid(mentorId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid team or mentor ID format"
      });
    }
    
    // Find the team and validate
    const team = await Team.findById(teamId);
    
    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found"
      });
    }
    
    // Check if user is team leader
    if (team.leader.toString() !== applicantId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only team leaders can apply for mentorship"
      });
    }
    
    // Check if team already has 2 mentors
    const mentorCount = team.mentor ? 1 : 0;
    if (mentorCount >= 2) {
      return res.status(400).json({
        success: false,
        message: "Your team already has the maximum number of mentors (2)"
      });
    }
    
    // Find the mentor
    const mentor = await Mentor.findById(mentorId);
    
    if (!mentor) {
      return res.status(404).json({
        success: false,
        message: "Mentor not found"
      });
    }
    
    // Check if an application already exists
    const existingApplication = mentor.applications.find(
      app => app.student.toString() === teamId.toString() && 
      (app.status === 'pending' || app.status === 'accepted')
    );
    
    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: existingApplication.status === 'pending' ? 
          "You have already applied to this mentor" : 
          "This mentor is already mentoring your team"
      });
    }
    
    // Add the application to mentor's applications array
    mentor.applications.push({
      student: teamId,
      status: 'pending',
      application_date: new Date(),
      message: message || `Team ${team.name} is requesting your mentorship`
    });
    
    await mentor.save();
    
    // Add to team's activity log
    team.activityLog.push({
      action: 'team_updated',
      description: `Applied for mentorship to ${mentor.name}`,
      userId: applicantId,
      userType: 'Student',
      timestamp: new Date()
    });
    
    team.lastActivityDate = new Date();
    await team.save();
    
    res.status(200).json({
      success: true,
      message: `Application sent to mentor ${mentor.name}`,
      applicationId: mentor.applications[mentor.applications.length - 1]._id
    });
    
  } catch (error) {
    console.error("Error applying to mentor:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send mentorship application",
      error: error.message
    });
  }
};

// Get all mentor applications for a team
const getTeamMentorApplications = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { requesterId } = req.query;
    
    if (!mongoose.Types.ObjectId.isValid(teamId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid team ID format"
      });
    }
    
    // Find the team
    const team = await Team.findById(teamId);
    
    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found"
      });
    }
    
    // Check if user is team leader or member
    const isMember = team.members.some(m => m.student.toString() === requesterId.toString());
    const isLeader = team.leader.toString() === requesterId.toString();
    
    if (!isMember && !isLeader) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to view this team's applications"
      });
    }
    
    // Find all mentors with applications from this team
    const mentorsWithApplications = await Mentor.find({
      'applications.student': teamId
    }).select('_id name email profile_picture current_role expertise applications');
    
    // Format the response
    const applications = mentorsWithApplications.map(mentor => {
      const teamApplication = mentor.applications.find(
        app => app.student.toString() === teamId.toString()
      );
      
      return {
        applicationId: teamApplication._id,
        mentorId: mentor._id,
        mentorName: mentor.name,
        mentorEmail: mentor.email,
        mentorProfilePicture: mentor.profile_picture,
        mentorRole: mentor.current_role,
        mentorExpertise: mentor.expertise,
        status: teamApplication.status,
        applicationDate: teamApplication.application_date,
        message: teamApplication.message
      };
    });
    
    res.status(200).json({
      success: true,
      teamId,
      applications
    });
    
  } catch (error) {
    console.error("Error fetching team mentor applications:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch mentor applications",
      error: error.message
    });
  }
};

// Cancel a pending mentor application
const cancelMentorApplication = async (req, res) => {
  try {
    const { teamId, applicationId } = req.params;
    const { cancelerId } = req.body;  // Get from request body instead of query params
    
    if (!cancelerId) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameter: cancelerId"
      });
    }
    
    if (!mongoose.Types.ObjectId.isValid(teamId) || !mongoose.Types.ObjectId.isValid(applicationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid team or application ID format"
      });
    }
    
    // Find the team
    const team = await Team.findById(teamId);
    
    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found"
      });
    }
    
    // Check if user is team leader
    if (team.leader.toString() !== cancelerId) {
      return res.status(403).json({
        success: false,
        message: "Only team leaders can cancel mentorship applications"
      });
    }
    
    // Find the mentor with this application
    const mentor = await Mentor.findOne({
      'applications._id': applicationId
    });
    
    if (!mentor) {
      return res.status(404).json({
        success: false,
        message: "Application not found"
      });
    }
    
    // Find the application
    const applicationIndex = mentor.applications.findIndex(
      app => app._id.toString() === applicationId
    );
    
    if (applicationIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Application not found"
      });
    }
    
    // Check if it's pending
    if (mentor.applications[applicationIndex].status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel application with status: ${mentor.applications[applicationIndex].status}`
      });
    }
    
    // Remove the application
    mentor.applications.splice(applicationIndex, 1);
    await mentor.save();
    
    res.status(200).json({
      success: true,
      message: "Application cancelled successfully"
    });
    
  } catch (error) {
    console.error("Error cancelling mentor application:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel application",
      error: error.message
    });
  }
};

// Get mentors for a team
const getTeamMentors = async (req, res) => {
  try {
    const { teamId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(teamId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid team ID format"
      });
    }
    
    // Find the team
    const team = await Team.findById(teamId);
    
    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found"
      });
    }
    
    // Format mentor data if exists
    let mentors = [];
    if (team.mentor && team.mentor.mentorId) {
      const mentorData = await Mentor.findById(team.mentor.mentorId)
        .select('name email profile_picture current_role expertise mentorship_focus_areas rating');
      
      if (mentorData) {
        mentors.push({
          _id: mentorData._id,
          name: mentorData.name,
          email: mentorData.email,
          profile_picture: mentorData.profile_picture,
          current_role: mentorData.current_role,
          expertise: mentorData.expertise,
          mentorship_focus_areas: mentorData.mentorship_focus_areas,
          rating: mentorData.rating,
          joinedAt: team.mentor.joinedAt,
          status: team.mentor.status
        });
      }
    }
    
    res.status(200).json({
      success: true,
      teamId,
      mentors
    });
    
  } catch (error) {
    console.error("Error fetching team mentors:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch team mentors",
      error: error.message
    });
  }
};

// Add these to your module.exports
module.exports = {
  createTeam,
  getMyTeams,
  getTeamById,
  joinTeamWithCode,
  applyToJoinTeam,
  respondToJoinRequest,
  inviteToTeam,
  respondToInvitation,
  getRecruitingTeams,
  updateTeamDetails,
  removeTeamMember,
  regenerateJoinCode,
  getPendingInvitations, // Add this
  addProject,
  updateProject,
  deleteProject,
  getStudentById,
  getStudentProfileById,
  searchMentors,
  applyToMentor,
  getTeamMentorApplications,
  cancelMentorApplication,
  getTeamMentors

};
