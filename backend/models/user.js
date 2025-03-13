const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    // Clerk user ID for authentication
    clerkId: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    }
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

module.exports = User;