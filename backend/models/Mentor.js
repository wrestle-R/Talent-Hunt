  const mongoose = require("mongoose");

  const mentorSchema = new mongoose.Schema(
    {
      firebaseUID: {type: String, required: false},
      name: { type: String, required: true },
      email: { type: String, required: true, unique: true },
      phone: { type: String },
      profile_picture: { type: String },
      current_role: {
        title: { type: String },
        company: { type: String },
      },
      years_of_experience: { type: Number},
      expertise: {
        technical_skills: [{ type: String }],
        non_technical_skills: [{ type: String }],
      },
      industries_worked_in: [{ type: String }],
      mentorship_focus_areas: [{ type: String }], // Areas the mentor prefers to guide in
      mentorship_availability: {
        hours_per_week: { type: Number, default: 2 },
        mentorship_type: [{ type: String, enum: ["One-on-One", "Group", "Online", "In-Person"] }],
      },
      hackathon_mentorship_experiences: [
        {
          event_name: { type: String },
          team_name: { type: String },
          year: { type: Number },
          role: { type: String, enum: ["Mentor", "Judge"] },
          achievements: { type: String }, // Example: "Guided team to finals"
        }
      ],
      social_links: {
        linkedin: { type: String },
        github: { type: String },
        personal_website: { type: String },
      },
      rating: { type: Number, default: 0},
    },
    { timestamps: true }
  );

  const Mentor = mongoose.model("Mentor", mentorSchema);
  module.exports = Mentor;
