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
      ref: "Admin",
      required: function() { return !this.isTempTeam; } // Only required for permanent teams
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

    // sent to potentional teamates
    invitations: [
      {
        recipientId: {
          type: mongoose.Schema.Types.ObjectId,
          refPath: "invitations.recipientType"
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
    members: [
      {
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Student"
        },
        role: {
          type: String,
          
        },
        customRole: {
          type: String, // For when "Other" is selected
          trim: true
        },
        responsibilities: [{ 
          type: String,
          trim: true
        }],
        skills: [{ type: String }], // Aligned with Student model's skills
        institution: { type: String }, // From student's education.institution
        experience: { 
          type: String,
          enum: ["Beginner", "Intermediate", "Advanced", "Expert"],
          default: "Intermediate"
        },
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
        },
        preferredWorkingHours: {
          startTime: { type: String },
          endTime: { type: String }
        },
        workingStyle: {
          type: String,
          enum: ["Independent", "Collaborative", "Flexible"],
          default: "Flexible"
        }
      }
    ],
    
    // Maximum team size (default is 7, but can be overridden)
    maxTeamSize: {
      type: Number,
      default: 7,
      min: 1,
      max: 15 // Increased max size
    },
    
    // Mentor association
    mentor: {
      mentorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Mentor"
      },
      name: { type: String },
      expertise: [{ type: String }], // Matching mentors.expertise in Student model
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
                deadline: { type: Date },
                priority: {
                  type: String,
                  enum: ["low", "medium", "high", "critical"],
                  default: "medium"
                },
                timeEstimate: { type: Number } // Hours estimated
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
        ],
        
        // Project resources and documentation
        resources: [
          {
            title: { type: String },
            type: { 
              type: String,
              enum: ["document", "design", "api", "database", "other"]
            },
            link: { type: String },
            addedBy: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Student"
            },
            addedAt: { type: Date, default: Date.now }
          }
        ]
      }
    ],
    
    // Hackathons the team is participating in - aligned with Student experience
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
        demoVideo: { type: String },
        ranking: { type: Number }, // Final position in the hackathon
        achievement: { type: String }, // Any special recognition
        
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
            "hackathon_completed",
            "dissolution_requested",
            "dissolution_cancelled",
            "team_dissolved",
            "team_updated"
          ]
        },
        description: { type: String },
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          refPath: "activityLog.userType"
        },
        userType: {
          type: String,
          enum: ["Student", "Mentor", "Admin"]
        },
        timestamp: { type: Date, default: Date.now }
      }
    ],
    
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
        skills: [{ type: String }], // Matching Student model's skills
        institution: { type: String }, // From student's education
        requestDate: { type: Date, default: Date.now },
        status: {
          type: String,
          enum: ["pending", "accepted", "declined"],
          default: "pending"
        }
      }
    ],
    
    // recieved from to potential members
    applications: [
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
    
    // Dissolution related fields
    dissolutionRequest: {
      isRequested: { type: Boolean, default: false },
      requestedBy: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "dissolutionRequest.requesterType"
      },
      requesterType: {
        type: String,
        enum: ["Student", "Mentor", "Admin"]
      },
      reason: { type: String },
      requestedAt: { type: Date },
      votingDeadline: { type: Date }, // Optional democratic dissolution
      votes: [
        {
          memberId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student"
          },
          vote: { type: Boolean }, // true = agree to dissolve
          votedAt: { type: Date, default: Date.now }
        }
      ]
    },
    
    // Team admin/moderator (can be different from leader)
    moderators: [
      {
        studentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Student"
        },
        addedAt: { type: Date, default: Date.now },
        addedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Student"
        },
        permissions: [
          {
            type: String,
            enum: [
              "add_members", 
              "remove_members", 
              "edit_team", 
              "manage_projects", 
              "dissolve_team"
            ]
          }
        ]
      }
    ],
    
    // Team achievements beyond hackathons
    achievements: [
      {
        title: { type: String },
        description: { type: String },
        date: { type: Date },
        awardedBy: { type: String },
        proofLink: { type: String }
      }
    ],
    
    // Dates
    formationDate: { 
      type: Date, 
      default: Date.now 
    },
    lastActivityDate: { 
      type: Date, 
      default: Date.now 
    },
    dissolutionDate: {
      type: Date
    },
    isTempTeam: {
      type: Boolean,
      default: false,
      // required: true
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
teamSchema.index({ "dissolutionRequest.isRequested": 1 });
teamSchema.index({ "moderators.studentId": 1 });

const Team = mongoose.model("Team", teamSchema);
module.exports = Team;