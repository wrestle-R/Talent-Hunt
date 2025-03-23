const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      refPath: 'senderType'
    },
    senderType: {
      type: String,
      required: true,
      enum: ['Moderator', 'Student', 'Mentor']
    },
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'recipientType'
    },
    recipientType: {
      type: String,
      required: true,
      enum: ['Student', 'Mentor', 'Moderator']
    },
    subject: {
      type: String,
      required: true,
      trim: true
    },
    content: {
      type: String,
      required: true,
      trim: true
    },
    regarding: {
      type: String,
      enum: ['Project', 'Behavior', 'ContentViolation', 'Other'],
      default: 'Other'
    },
    relatedItemId: {
      type: mongoose.Schema.Types.ObjectId,
      // Optional - could reference a project, message, etc.
    },
    relatedItemType: {
      type: String,
      enum: ['Project', 'Message', 'Hackathon', null],
      default: null
    },
    status: {
      type: String,
      enum: ['Unread', 'Read', 'Responded', 'Closed', 'ActionRequired'],
      default: 'Unread'
    },
    isImportant: {
      type: Boolean,
      default: false
    },
    parentNoteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Note',
      default: null
    },
    attachments: [{
      filename: String,
      fileUrl: String,
      fileType: String,
      uploadDate: {
        type: Date,
        default: Date.now
      }
    }],
    responseDeadline: {
      type: Date,
      default: null
    }
  },
  { 
    timestamps: true
  }
);

// Create virtual to determine if this is a reply
noteSchema.virtual('isReply').get(function() {
  return this.parentNoteId !== null;
});

// Create virtual to determine if deadline is passed
noteSchema.virtual('isOverdue').get(function() {
  if (!this.responseDeadline) return false;
  return new Date() > this.responseDeadline;
});

// Index for faster queries
noteSchema.index({ senderId: 1, recipientId: 1 });
noteSchema.index({ status: 1 });
noteSchema.index({ parentNoteId: 1 });

const Note = mongoose.model('Note', noteSchema);
module.exports = Note;