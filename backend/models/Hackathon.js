const mongoose = require("mongoose");

const hackathonSchema = new mongoose.Schema({
  hackathonName: { type: String, required: true },
  description: { type: String },
  lastRegisterDate: { type: Date, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },

  mode: { type: String, enum: ["Online", "Offline", "Hybrid"], default: "Online" },
  location: { type: String, default: "Online" }, // Only applies if offline/hybrid
  
  prizePool: { type: Number, default: 0 },
  postedByAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    required: true,
  },

  registration: {
    totalCapacity: { type: Number, required: true }, // Maximum spots available
    currentlyRegistered: { type: Number, default: 0 }, // Current number of registered participants
  },

  applicants: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      status: {
        type: String,
        enum: ["Pending", "Accepted", "Rejected"],
        default: "Pending",
      },
      appliedAt: { type: Date, default: Date.now },
    }
  ],

  problemStatement: [{ type: String }],
  domain: [{ type: String }], // Example: ["AI", "Web3", "Cybersecurity"]
}, { timestamps: true });

module.exports = mongoose.model("Hackathon", hackathonSchema);
