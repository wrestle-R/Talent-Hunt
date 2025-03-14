const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    firebaseUID: {type: String, required: true},
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
        type: { type: String, enum: ["Hackathon", "Internship", "Project", "Freelance"] },
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
    mentorship_interests: {
      seeking_mentor: { type: Boolean, default: false },
      mentor_topics: [{ type: String }], // Topics for mentorship
    },
    timezone: { type: String },
    preferred_working_hours: {
      start_time: { type: String },
      end_time: { type: String },
    },
    goals: [{ type: String }],
    rating: { type: Number, default: 0},
  },
  { timestamps: true }
);

const Student = mongoose.model("Student", studentSchema);
module.exports = Student;
