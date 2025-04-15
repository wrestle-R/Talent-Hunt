const mongoose = require("mongoose");

const hackathonSchema = new mongoose.Schema({
  hackathonName: { type: String, required: true },
  description: { type: String },
  lastRegisterDate: { type: Date, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },

  mode: { type: String, enum: ["Online", "Offline", "Hybrid"], default: "Online" },
  location: { type: String, default: "Online" },  
  
  // Single domain and problem statement
  primaryDomain: { type: String, required: true },
  primaryProblemStatement: { type: String, required: true },
  

  
  prizePool: { type: Number, default: 0 },
  postedByAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    required: true,
  },

  registration: {
    totalCapacity: { type: Number, required: true }, // Maximum spots available
    currentlyRegistered: { type: Number, default: 0 }, // Current number of registered participants
    requiredTeamSize: { type: Number, default: 4 }, // Teams must have exactly 4 members
  },

  // Array of all registered students (for quick access)
  registeredTeams: [
    { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Team" 
    }
  ],

// Update the teamApplicants schema part
teamApplicants: [
  {
    team: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Team", 
      required: true 
    },
    registeredAt: { type: Date, default: Date.now },
    members: [
      { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Student" 
      }
    ],
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Active", "Disqualified", "Completed"],
      default: "Pending",
    }
  }
],

// Update the individualApplicants schema part
individualApplicants: [
  {
    student: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Student", 
      required: true 
    },
    registeredAt: { type: Date, default: Date.now },
    skills: [{ type: String }],
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected","Completed"],
      default: "Pending"
    },
    assignedToTempTeam: { type: Boolean, default: false },
    tempTeamId: { type: String },
  }
],

  // Legacy applicants field (for backward compatibility)
  applicants: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
      status: {
        type: String,
        enum: ["Pending", "Accepted", "Rejected","Assigned"],
        default: "Pending",
      },
      appliedAt: { type: Date, default: Date.now },
    }
  ],

  

  // Hackathon results and analytics
  results: {
    winningTeams: [
      {
        rank: { type: Number },
        isTemporaryTeam: { type: Boolean, default: false },
        teamId: { 
          type: mongoose.Schema.Types.ObjectId, 
          ref: "Team" 
        },
        tempTeamId: { type: String },
        prizeAmount: { type: Number },
      }
    ],
    participationCount: { type: Number, default: 0 },
    submissionCount: { type: Number, default: 0 },
    completedTeams: { type: Number, default: 0 },
  }
}, { timestamps: true });

module.exports = mongoose.model("Hackathon", hackathonSchema);