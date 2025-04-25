const express = require("express");
const Student = require("../models/Student");
const Mentor = require("../models/Mentor");
const Admin = require("../models/Admin"); // Add this import
const Hackathon = require("../models/Hackathon"); // Add this line
const Message = require('../models/Message');
const mongoose = require('mongoose')
const Team = require('../models/Team')
const router = express.Router();
const { 
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
  getStudentProjects,
  addStudentProject,
  updateStudentProject,
  deleteStudentProject,
  getPotentialTeammates,
  getTeammateById,
  getMentorById,
  getTeamInfo,
  respondToTeamInvitation,
  getTeamInvitations,
  getTeamDetails,
  getTeamMemberProfile,
  getTeamActivities,
  getTeamHackathonHistory,
  getHackathonRegistrationStatus,
  getMentorRequestStatus,
  sendMentorRequest,
} = require("../controllers/StudentController");

// Authentication routes
router.post("/registerOrLogin", registerOrLoginStudent);

// Profile routes
router.get("/profile/:uid", getStudentProfile);
router.put("/profile/:uid", updateStudentProfile);
router.get("/profile-completion/:uid", calculateStudentProfileCompletion);

// Teammate discovery routes
router.get("/mentors", getAllMentors);
router.get("/all-students", getAllStudents); // Ensure this route matches the frontend API call
router.get("/recommended-teammates/:uid", getRecommendedTeammates);
router.get("/recommended-mentors/:uid", getRecommendedMentors);
router.get("/teammates/:uid", getPotentialTeammates);
router.get("/teammate/:teammateId", getTeammateById);
router.get("/mentor/:mentorId", getMentorById);
// Add this route with your other routes
router.get('/teams/led/:uid', async (req, res) => {
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

    // Find teams where student is leader
    const teams = await Team.find({
      leader: student._id,
      status: 'active'
    }).select('name description members');

    return res.status(200).json({
      success: true,
      teams
    });

  } catch (error) {
    console.error("Error fetching user teams:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch teams",
      error: error.message
    });
  }
});
// Hackathon routes
router.get("/hackathons/upcoming", getUpcomingHackathons);
router.get("/hackathons/past", getPastHackathons);
router.get("/hackathons/registered/:uid", getRegisteredHackathons);
router.get("/hackathons/:id", getHackathonById);
router.post("/hackathons/:id/register", registerForHackathon);
router.get('/hackathons/:hackathonId/status/:uid', getHackathonRegistrationStatus);

// Team routes
router.get("/team/:uid", getTeamInfo);
router.get('/teams/:teamId/details', getTeamDetails);
router.get('/teams/:teamId/members/:memberId', getTeamMemberProfile);
router.get('/teams/:teamId/activities', getTeamActivities);
router.get('/teams/:teamId/hackathons', getTeamHackathonHistory);

// Team invitations routes
router.get("/team-invitations/:uid", getTeamInvitations);
router.put("/team-invitations/:invitationId/respond", respondToTeamInvitation);

// Messaging routes
router.get("/conversations/:studentId", getStudentConversations);
router.put("/messages/read/:studentId/:senderId", markStudentMessagesAsRead);
router.get("/mentor-conversations/:studentId", getMentorConversations);

// Project routes
router.get("/projects/:studentId", getStudentProjects);
router.post("/projects/:studentId", addStudentProject);
router.put("/projects/:studentId/:projectId", updateStudentProject);
router.delete("/projects/:studentId/:projectId", deleteStudentProject);

// Add these routes to your existing routes
router.post('/mentor/:mentorId/request', sendMentorRequest);
router.get('/mentor/:mentorId/request-status', getMentorRequestStatus);

module.exports = router;