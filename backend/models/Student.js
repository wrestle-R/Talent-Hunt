const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    firebaseUID: { type: String, required: false },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    profile_picture: { type: String },
    location: {
      city: { type: String },
      country: { type: String },
    },
    education: {
      institution: { type: String },
      degree: { type: String },
      graduation_year: { type: Number },
    },
    skills: [{ type: String }], // Technical & soft skills
    interests: [{ type: String }], // Fields of interest
    experience: [
      {
        title: { type: String },
        description: { type: String },
        date: { type: Date },
        type: {
          type: String,
          enum: ["Hackathon", "Internship", "Project", "Freelance"],
        },
      },
    ],
    hackathon_prev_experiences: { type: Number, default: 0 }, // Past hackathons count
    hackathon_current_interests: [{ type: String }], // Hackathons they want to join
    projects: [
      {
        name: { type: String },
        description: { type: String },
        tech_stack: [{ type: String }],
        github_link: { type: String },
        live_demo: { type: String },
        // Additional fields for project status, notes, and moderation
        status: { type: String,enum: ['Pending','Rejected' ,'Approved','pending','rejected' ,'approved' ], default: 'Pending' },
        moderatorNotes: { type: String },
        moderatedAt: { type: Date },
        isDeleted: { type: Boolean, default: false },
        deletedAt: { type: Date },
        deletedReason: { type: String },
        isFlagged: { type: Boolean, default: false },
      },
    ],
    achievements: [
      {
        title: { type: String },
        description: { type: String },
        date: { type: Date },
      },
    ],
    certifications: [{ type: String }],
    social_links: {
      github: { type: String },
      linkedin: { type: String },
      portfolio: { type: String },
    },

    // Enhanced mentorship fields
    mentorship_interests: {
      seeking_mentor: { type: Boolean, default: false },
      mentor_topics: [{ type: String }], // Topics for mentorship
    },

    // New fields for teammate search preferences
// Update the teammate_search field in the schema
teammate_search: {
  looking_for_teammates: { type: Boolean, default: false },
  purpose: {
    type: String,
    enum: ["Project", "Hackathon", "Both", "Not specified"],
    default: "Not specified"
  },
  // For Both option, include fields for both project and hackathon
  project_preferences: {
    description: String,
    team_size: String,
    tech_stack: [String]
  },
  hackathon_preferences: {
    preferred_type: String,
    team_size: String,
    tech_stack: [String]
  },
  desired_skills: [{ type: String }],
  urgency_level: {
    type: String,
    enum: ["Low", "Medium", "High"],
    default: "Medium"
  }
},

    // New field to track what the user is currently looking for
    current_search_preferences: {
      looking_for: {
        type: String,
        enum: ["Teammates", "Mentors", "Both", "None"],
        default: "None",
      },
      // For hackathons specifically
      hackathon_teammate_preferences: {
        hackathon_name: { type: String },
        hackathon_date: { type: Date },
        required_skills: [{ type: String }],
        team_size: { type: Number },
        idea_description: { type: String },
      },
      // For projects specifically
      project_teammate_preferences: {
        project_type: { type: String },
        project_duration: { type: String },
        required_skills: [{ type: String }],
        commitment_level: {
          type: String,
          enum: ["Low", "Medium", "High"],
          default: "Medium",
        },
      },
    },

    preferred_working_hours: {
      start_time: { type: String },
      end_time: { type: String },
    },
    goals: [{ type: String }],
    rating: { type: Number, default: 0 },
    total_reviews: { type: Number, default: 0 },

    teammates: [
      {
        id: { type: mongoose.Schema.Types.ObjectId, ref: "Student" }, // Reference to another student
        name: { type: String },
        email: { type: String },
        role: { type: String }, // Role in the team
      },
    ],

    mentors: [
      {
        id: { type: mongoose.Schema.Types.ObjectId, ref: "Mentor" }, // Reference to mentor
        name: { type: String },
        email: { type: String },
        expertise: [{ type: String }], // Areas of expertise
      },
    ],

    isRejected: { type: Boolean, required: true, default: false },
    rejectionReason: { type: String },
    isTempTeam: {type: Boolean, required: false, default:false},
    tempTeam: {
      type: [
        {
          id: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true }, 
          name: { type: String, required: true },
          email: { type: String, required: true },
          expertise: [{ type: String, required: true }],
        },
      ],
      minlength: 3, // Minimum 3 members required
      maxlength: 3, // Maximum 3 members allowed
    },
  },

  { timestamps: true }
);

const Student = mongoose.model("Student", studentSchema);
module.exports = Student;
