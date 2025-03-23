const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    senderId: {
      type: String,  // Changed from ObjectId to String to accommodate frontend IDs
      required: true,
    },
    receiverId: {
      type: String,  // Changed from ObjectId to String to accommodate frontend IDs
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    // Message reporting functionality
    isReported: {
      type: Boolean,
      default: false
    },
    reportDetails: {
      reportedBy: {
        type: String, // ID of the user who reported the message
      },
      reportedAt: {
        type: Date
      },
      reason: {
        type: String,
        enum: [
          "harassment", 
          "inappropriate_content", 
          "spam", 
          "hate_speech", 
          "threats", 
          "misinformation",
          "personal_information",
          "other"
        ]
      },
      additionalInfo: {
        type: String,
        maxlength: 500
      },
      status: {
        type: String,
        enum: ["pending", "reviewed", "action_taken", "dismissed"],
        default: "pending"
      },
      reviewedBy: {
        type: String, // ID of the moderator who reviewed the report
      },
      reviewedAt: {
        type: Date
      },
      moderatorNotes: {
        type: String,
        maxlength: 500
      },
      actionTaken: {
        type: String,
        enum: ["none", "warning_issued", "message_removed", "user_suspended", "user_banned"]
      }
    },
    isVisible: {
      type: Boolean,
      default: true // Can be set to false if message is removed by moderator
    }
  },
  { timestamps: true }
);

// Create indexes for frequently accessed fields to improve query performance
MessageSchema.index({ senderId: 1, receiverId: 1 });
MessageSchema.index({ receiverId: 1, createdAt: -1 });
MessageSchema.index({ isReported: 1 }); // For quickly finding reported messages
MessageSchema.index({ "reportDetails.status": 1 }); // For filtering by report status
MessageSchema.index({ "reportDetails.reportedAt": -1 }); // For sorting by report date

module.exports = mongoose.model("Message", MessageSchema);