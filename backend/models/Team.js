const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema(
  {
    // Basic team information
    name: { 
      type: String, 
      required: true,
      trim: true
    },
    description: { 
      type: String,
      trim: true,
      maxlength: 1000
    },
    logo: { 
      type: String // URL to team logo
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true
    },
    
    // Team visibility and access
    isPublic: { 
      type: Boolean, 
      default: true // Whether the team can be discovered by others
    },
    joinCode: { 
      type: String // Private code for joining the team
    },
    
    // Team composition and roles
    leader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true
    },
    members: [
      {
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Student"
        },
        role: {
          type: String,
          enum: [
            "Frontend Developer", 
            "Backend Developer", 
            "Full Stack Developer", 
            "UI/UX Designer", 
            "Data Scientist", 
            "DevOps Engineer", 
            "Project Manager", 
            "QA Engineer", 
            "Content Creator",
            "Other"
          ]
        },
        customRole: {
          type: String, // For when "Other" is selected
          trim: true
        },
        responsibilities: [{ 
          type: String,
          trim: true
        }],
        joinedAt: {
          type: Date,
          default: Date.now
        },
        status: {
          type: String,
          enum: ["active", "inactive", "left"],
          default: "active"
        },
        invitationStatus: {
          type: String,
          enum: ["pending", "accepted", "declined"],
          default: "accepted" // For directly added members
        }
      }
    ],
    
    // Maximum team size (default is 7, but can be overridden)
    maxTeamSize: {
      type: Number,
      default: 7,
      min: 1,
      max: 7
    },
    
    // Mentor association
    mentor: {
      mentorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Mentor"
      },
      name: { type: String },
      joinedAt: { type: Date },
      status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active"
      },
      invitationStatus: {
        type: String,
        enum: ["pending", "accepted", "declined"]
      },
      feedbackLog: [
        {
          content: { type: String },
          date: { type: Date, default: Date.now }
        }
      ]
    },
    
    // Skills and Tech Stack
    techStack: [{ 
      type: String,
      trim: true
    }],
    
    // Projects the team is working on
    projects: [
      {
        name: { 
          type: String,
          required: true,
          trim: true
        },
        description: { 
          type: String,
          trim: true
        },
        status: {
          type: String,
          enum: ["planning", "in-progress", "completed", "abandoned"],
          default: "planning"
        },
        startDate: { type: Date },
        endDate: { type: Date },
        githubRepo: { type: String },
        deployedUrl: { type: String },
        techStack: [{ type: String }],
        images: [{ type: String }], // URLs of project screenshots
        demoVideo: { type: String }, // URL to demo video
        
        // Member-specific assignments for the project
        assignments: [
          {
            memberId: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Student"
            },
            tasks: [
              {
                title: { type: String },
                description: { type: String },
                status: {
                  type: String,
                  enum: ["pending", "in-progress", "completed", "blocked"],
                  default: "pending"
                },
                deadline: { type: Date }
              }
            ]
          }
        ],
        
        // Timeline and milestones
        milestones: [
          {
            title: { type: String },
            description: { type: String },
            dueDate: { type: Date },
            status: {
              type: String,
              enum: ["pending", "completed", "missed"],
              default: "pending"
            }
          }
        ]
      }
    ],
    
    // Hackathons the team is participating in
    hackathons: [
      {
        hackathonId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Hackathon"
        },
        name: { type: String },
        registrationDate: { type: Date },
        status: {
          type: String,
          enum: ["registered", "participating", "completed", "withdrawn"],
          default: "registered"
        },
        projectName: { type: String },
        projectDescription: { type: String },
        solutionUrl: { type: String },
        presentationUrl: { type: String },
        ranking: { type: Number }, // Final position in the hackathon
        
        // For tracking member participation specific to this hackathon
        participants: [
          {
            memberId: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Student"
            },
            role: { type: String },
            contributionNotes: { type: String }
          }
        ]
      }
    ],
    
    // Team communication and collaboration
    meetingSchedule: {
      frequency: {
        type: String,
        enum: ["daily", "weekly", "bi-weekly", "monthly", "as-needed"],
        default: "weekly"
      },
      preferredDays: [{ 
        type: String,
        enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
      }],
      preferredTimeStart: { type: String }, // Format: "HH:MM" in 24-hour format
      preferredTimeEnd: { type: String },
      timeZone: { type: String, default: "UTC" }
    },
    
    // Communication channels
    communicationChannels: {
      discordServer: { type: String },
      slackWorkspace: { type: String },
      microsoftTeams: { type: String },
      otherChannels: [
        {
          name: { type: String },
          url: { type: String }
        }
      ]
    },
    
    // Team activity tracking
    activityLog: [
      {
        action: {
          type: String,
          enum: [
            "team_created", 
            "member_joined", 
            "member_left", 
            "project_added", 
            "hackathon_registered", 
            "mentor_joined",
            "project_completed",
            "hackathon_completed"
          ]
        },
        description: { type: String },
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          refPath: "activityLog.userType"
        },
        userType: {
          type: String,
          enum: ["Student", "Mentor"]
        },
        timestamp: { type: Date, default: Date.now }
      }
    ],
    
    // Team statistics and achievements
    statistics: {
      totalProjects: { type: Number, default: 0 },
      completedProjects: { type: Number, default: 0 },
      totalHackathons: { type: Number, default: 0 },
      hackathonWins: { type: Number, default: 0 },
      hackathonPlacements: { type: Number, default: 0 } // Top 3 finishes
    },
    
    // Team recruitment and requests
    isRecruiting: { type: Boolean, default: false },
    recruitmentMessage: { type: String },
    skillsNeeded: [{ type: String }],
    
    joinRequests: [
      {
        studentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Student"
        },
        message: { type: String },
        requestDate: { type: Date, default: Date.now },
        status: {
          type: String,
          enum: ["pending", "accepted", "declined"],
          default: "pending"
        }
      }
    ],
    
    // Invitations sent to potential members
    pendingInvitations: [
      {
        recipientId: {
          type: mongoose.Schema.Types.ObjectId,
          refPath: "pendingInvitations.recipientType"
        },
        recipientType: {
          type: String,
          enum: ["Student", "Mentor"]
        },
        message: { type: String },
        role: { type: String }, // Proposed role in the team
        invitedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Student"
        },
        sentAt: { type: Date, default: Date.now },
        expiresAt: { type: Date },
        status: {
          type: String,
          enum: ["pending", "accepted", "declined", "expired"],
          default: "pending"
        }
      }
    ],
    
    // Team status
    status: {
      type: String,
      enum: ["active", "inactive", "archived", "disbanded"],
      default: "active"
    },
    
    // Dates
    formationDate: { 
      type: Date, 
      default: Date.now 
    },
    lastActivityDate: { 
      type: Date, 
      default: Date.now 
    }
  },
  { timestamps: true }
);

// Create indexes for efficient queries
teamSchema.index({ name: 1 });
teamSchema.index({ createdBy: 1 });
teamSchema.index({ leader: 1 });
teamSchema.index({ "members.student": 1 });
teamSchema.index({ "mentor.mentorId": 1 });
teamSchema.index({ "hackathons.hackathonId": 1 });
teamSchema.index({ status: 1 });
teamSchema.index({ isRecruiting: 1 });
teamSchema.index({ techStack: 1 });

const Team = mongoose.model("Team", teamSchema);
module.exports = Team;