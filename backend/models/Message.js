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
  },
  { timestamps: true }
);

// Create indexes for frequently accessed fields to improve query performance
MessageSchema.index({ senderId: 1, receiverId: 1 });
MessageSchema.index({ receiverId: 1, createdAt: -1 });

module.exports = mongoose.model("Message", MessageSchema);