const Message = require('../models/Message');
const Student = require('../models/Student');
const Mentor = require('../models/Mentor');
const mongoose = require('mongoose');
const Note = require('../models/Note');

// Get all reported messages
exports.getReportedMessages = async (req, res) => {
  try {
    const { status, userType } = req.query;
    
    // Base query for reported messages
    let query = { isReported: true };
    
    // Filter by report status if provided
    if (status && status !== 'all') {
      query['reportDetails.status'] = status;
    }
    
    // Fetch messages
    const messages = await Message.find(query)
      .sort({ 'reportDetails.reportedAt': -1 });
    
    // Enhance messages with user details
    const enhancedMessages = await Promise.all(messages.map(async (message) => {
      const messageObj = message.toObject();
      
      // Get sender details
      try {
        const senderIsStudent = await Student.findById(message.senderId);
        if (senderIsStudent) {
          messageObj.sender = {
            _id: senderIsStudent._id,
            name: senderIsStudent.name,
            email: senderIsStudent.email,
            type: 'student',
            profilePicture: senderIsStudent.profilePicture
          };
        } else {
          const senderIsMentor = await Mentor.findById(message.senderId);
          if (senderIsMentor) {
            messageObj.sender = {
              _id: senderIsMentor._id,
              name: senderIsMentor.name,
              email: senderIsMentor.email,
              type: 'mentor',
              profilePicture: senderIsMentor.profilePicture
            };
          }
        }
      } catch (err) {
        console.error('Error fetching sender details:', err);
      }
      
      // Get receiver details
      try {
        const receiverIsStudent = await Student.findById(message.receiverId);
        if (receiverIsStudent) {
          messageObj.receiver = {
            _id: receiverIsStudent._id,
            name: receiverIsStudent.name,
            email: receiverIsStudent.email,
            type: 'student',
            profilePicture: receiverIsStudent.profilePicture
          };
        } else {
          const receiverIsMentor = await Mentor.findById(message.receiverId);
          if (receiverIsMentor) {
            messageObj.receiver = {
              _id: receiverIsMentor._id,
              name: receiverIsMentor.name,
              email: receiverIsMentor.email,
              type: 'mentor',
              profilePicture: receiverIsMentor.profilePicture
            };
          }
        }
      } catch (err) {
        console.error('Error fetching receiver details:', err);
      }
      
      // Get reporter details
      try {
        const reporterIsStudent = await Student.findById(message.reportDetails.reportedBy);
        if (reporterIsStudent) {
          messageObj.reporter = {
            _id: reporterIsStudent._id,
            name: reporterIsStudent.name,
            email: reporterIsStudent.email,
            type: 'student',
            profilePicture: reporterIsStudent.profilePicture
          };
        } else {
          const reporterIsMentor = await Mentor.findById(message.reportDetails.reportedBy);
          if (reporterIsMentor) {
            messageObj.reporter = {
              _id: reporterIsMentor._id,
              name: reporterIsMentor.name,
              email: reporterIsMentor.email,
              type: 'mentor',
              profilePicture: reporterIsMentor.profilePicture
            };
          }
        }
      } catch (err) {
        console.error('Error fetching reporter details:', err);
      }
      
      return messageObj;
    }));
    
    // Filter by user type if requested
    if (userType && userType !== 'all') {
      const filteredMessages = enhancedMessages.filter(msg => {
        if (userType === 'student' && msg.sender?.type === 'student') return true;
        if (userType === 'mentor' && msg.sender?.type === 'mentor') return true;
        return false;
      });
      return res.status(200).json(filteredMessages);
    }
    
    return res.status(200).json(enhancedMessages);
  } catch (error) {
    console.error('Error fetching reported messages:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

// Get conversation between users
exports.getConversation = async (req, res) => {
  try {
    const { user1, user2 } = req.params;
    
    if (!user1 || !user2) {
      return res.status(400).json({ error: 'Missing user IDs' });
    }
    
    // Get messages between these users (in both directions)
    const messages = await Message.find({
      $or: [
        { senderId: user1, receiverId: user2 },
        { senderId: user2, receiverId: user1 }
      ]
    }).sort({ createdAt: 1 });
    
    return res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

// Update reported message status
exports.updateReportedMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { status, moderatorNotes, actionTaken, moderatorId } = req.body;
    
    if (!messageId) {
      return res.status(400).json({ error: 'Missing message ID' });
    }
    
    // Find and update the message
    const message = await Message.findById(messageId);
    
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    
    if (!message.isReported) {
      return res.status(400).json({ error: 'This message has not been reported' });
    }
    
    // Update message report details - use moderatorId directly (can be string)
    message.reportDetails.status = status || message.reportDetails.status;
    message.reportDetails.moderatorNotes = moderatorNotes || message.reportDetails.moderatorNotes;
    message.reportDetails.actionTaken = actionTaken || message.reportDetails.actionTaken;
    message.reportDetails.reviewedBy = moderatorId || "system-moderator";
    message.reportDetails.reviewedAt = new Date();
    
    // If action is to remove message, update visibility
    if (actionTaken === 'message_removed') {
      message.isVisible = false;
    }
    
    const updatedMessage = await message.save();
    
    return res.status(200).json({ 
      message: 'Report updated successfully',
      data: updatedMessage
    });
  } catch (error) {
    console.error('Error updating reported message:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

// Get user's all messages
exports.getUserMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ error: 'Missing user ID' });
    }
    
    // Get all messages sent or received by this user
    const messages = await Message.find({
      $or: [
        { senderId: userId },
        { receiverId: userId }
      ]
    }).sort({ createdAt: -1 });
    
    return res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching user messages:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

// Get all projects for moderation (using projects from student schema)
exports.getAllProjects = async (req, res) => {
  try {
    const { status, studentId } = req.query;
    
    // Base query to find all students
    let studentQuery = {};
    
    // Filter by student if provided
    if (studentId) {
      studentQuery._id = studentId;
    }
    
    // Find all students and their projects
    const students = await Student.find(studentQuery).select('_id name profile_picture projects');
    
    // Flatten all projects and add creator information
    let allProjects = [];
    
    for (const student of students) {
      if (student.projects && student.projects.length > 0) {
        const projectsWithCreator = student.projects.map(project => {
          // Convert MongoDB document to plain object
          const projectObj = project.toObject ? project.toObject() : project;
          
          // Check if project status meets the filter criteria
          if (status && projectObj.status && projectObj.status !== status) {
            return null; // Skip this project
          }
          
          // Add creator information and format for consistency
          return {
            _id: projectObj._id || new mongoose.Types.ObjectId(),
            name: projectObj.name,
            description: projectObj.description,
            techStack: projectObj.tech_stack || [],
            githubLink: projectObj.github_link,
            liveDemo: projectObj.live_demo,
            creator: {
              studentId: student._id,
              name: student.name,
              profilePicture: student.profile_picture
            },
            status: projectObj.status || 'Pending',
            createdAt: projectObj.createdAt || new Date(),
            moderatorNotes: projectObj.moderatorNotes || '',
            isFlagged: projectObj.isFlagged || false
          };
        }).filter(Boolean); // Remove null items
        
        allProjects = [...allProjects, ...projectsWithCreator];
      }
    }
    
    // Sort projects by creation date (newest first)
    allProjects.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    return res.status(200).json(allProjects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

// Get project by ID (from student's projects)
exports.getProjectById = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    if (!projectId) {
      return res.status(400).json({ error: 'Missing project ID' });
    }
    
    // Find the student with the given project
    const student = await Student.findOne({ 
      "projects._id": new mongoose.Types.ObjectId(projectId) 
    });
    
    if (!student) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Find the specific project in the student's projects array
    const project = student.projects.find(
      p => p._id.toString() === projectId
    );
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Format the project with additional creator info
    const projectWithCreator = {
      ...project.toObject(),
      creator: {
        studentId: student._id,
        name: student.name,
        profilePicture: student.profile_picture
      }
    };
    
    return res.status(200).json(projectWithCreator);
  } catch (error) {
    console.error('Error fetching project:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

// Update project status (approve, reject, etc.)
exports.updateProjectStatus = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { status, moderatorNotes } = req.body;
    
    if (!projectId) {
      return res.status(400).json({ error: 'Missing project ID' });
    }
    
    // Find the student with the specific project
    const student = await Student.findOne({ 
      "projects._id": new mongoose.Types.ObjectId(projectId) 
    });
    
    if (!student) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Find the project index in the student's projects array
    const projectIndex = student.projects.findIndex(
      p => p._id.toString() === projectId
    );
    
    if (projectIndex === -1) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Update the project
    if (status) {
      student.projects[projectIndex].status = status;
    }
    
    if (moderatorNotes) {
      student.projects[projectIndex].moderatorNotes = moderatorNotes;
    }
    
    student.projects[projectIndex].moderatedAt = new Date();
    
    await student.save();
    
    // Return the updated project with creator info
    const updatedProject = {
      ...student.projects[projectIndex].toObject(),
      creator: {
        studentId: student._id,
        name: student.name,
        profilePicture: student.profile_picture
      }
    };
    
    return res.status(200).json({ 
      message: 'Project updated successfully',
      data: updatedProject
    });
  } catch (error) {
    console.error('Error updating project:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

// Send note to student or mentor
exports.sendNote = async (req, res) => {
  try {
    const { 
      recipientId, 
      recipientType, 
      subject, 
      content, 
      regarding,
      relatedItemId,
      relatedItemType,
      isImportant,
      responseDeadline,
      parentNoteId
    } = req.body;
    
    if (!recipientId || !recipientType || !subject || !content) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        required: ['recipientId', 'recipientType', 'subject', 'content'] 
      });
    }
    
    // Validate recipient exists
    let recipientExists = false;
    
    if (recipientType === 'Student') {
      const student = await Student.findById(recipientId);
      recipientExists = !!student;
    } else if (recipientType === 'Mentor') {
      const mentor = await Mentor.findById(recipientId);
      recipientExists = !!mentor;
    }
    
    if (!recipientExists) {
      return res.status(404).json({ error: 'Recipient not found' });
    }
    
    // Get moderator ID from request - use as string directly
    const moderatorId = req.body.moderatorId || "system-moderator";
    
    // Create note with string moderatorId
    const note = new Note({
      senderId: moderatorId, // Use string directly
      senderType: 'Moderator',
      recipientId,
      recipientType,
      subject,
      content,
      regarding: regarding || 'Other',
      relatedItemId: relatedItemId || null,
      relatedItemType: relatedItemType || null,
      isImportant: isImportant || false,
      responseDeadline: responseDeadline ? new Date(responseDeadline) : null,
      parentNoteId: parentNoteId || null,
      status: 'Unread'
    });
    
    const savedNote = await note.save();
    
    // If this is about a project, update the project reference in student document
    if (relatedItemType === 'Project' && relatedItemId) {
      try {
        const student = await Student.findOne({ 
          "projects._id": new mongoose.Types.ObjectId(relatedItemId) 
        });
        
        if (student) {
          const projectIndex = student.projects.findIndex(
            p => p._id.toString() === relatedItemId
          );
          
          if (projectIndex !== -1) {
            // Initialize relatedNotes array if it doesn't exist
            if (!student.projects[projectIndex].relatedNotes) {
              student.projects[projectIndex].relatedNotes = [];
            }
            
            // Add note reference
            student.projects[projectIndex].relatedNotes.push(savedNote._id);
            await student.save();
          }
        }
      } catch (err) {
        console.warn("Could not update project with note reference:", err);
        // Continue execution even if this part fails
      }
    }
    
    return res.status(201).json({
      message: 'Note sent successfully',
      data: savedNote
    });
  } catch (error) {
    console.error('Error sending note:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

// Get all notes for a specific recipient
exports.getNotesByRecipient = async (req, res) => {
  try {
    const { userId, userType } = req.params;
    const { status } = req.query;
    
    if (!userId || !userType) {
      return res.status(400).json({ error: 'Missing user ID or type' });
    }
    
    // Base query
    let query = {
      recipientId: userId,
      recipientType: userType
    };
    
    // Filter by status if provided
    if (status) {
      query.status = status;
    }
    
    // Get notes
    const notes = await Note.find(query)
      .sort({ createdAt: -1 });
      
    return res.status(200).json(notes);
  } catch (error) {
    console.error('Error fetching notes:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

// Get all notes sent by a moderator
exports.getNotesBySender = async (req, res) => {
  try {
    const { moderatorId } = req.params;
    
    if (!moderatorId) {
      return res.status(400).json({ error: 'Missing moderator ID' });
    }
    
    // Get notes
    const notes = await Note.find({
      senderId: moderatorId,
      senderType: 'Moderator'
    }).sort({ createdAt: -1 });
      
    return res.status(200).json(notes);
  } catch (error) {
    console.error('Error fetching notes:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

// Get replies for a specific note
exports.getNoteReplies = async (req, res) => {
  try {
    const { noteId } = req.params;
    
    if (!noteId) {
      return res.status(400).json({ error: 'Missing note ID' });
    }
    
    // Get the original note
    const parentNote = await Note.findById(noteId);
    
    if (!parentNote) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    // Get all replies to this note
    const replies = await Note.find({ parentNoteId: noteId })
      .sort({ createdAt: 1 });
      
    return res.status(200).json({
      parentNote,
      replies
    });
  } catch (error) {
    console.error('Error fetching note replies:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

// Update note status (mark as read, closed, etc.)
exports.updateNoteStatus = async (req, res) => {
  try {
    const { noteId } = req.params;
    const { status } = req.body;
    
    if (!noteId) {
      return res.status(400).json({ error: 'Missing note ID' });
    }
    
    // Find the note
    const note = await Note.findById(noteId);
    
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    // Update status
    note.status = status;
    const updatedNote = await note.save();
    
    return res.status(200).json({ 
      message: 'Note status updated successfully',
      data: updatedNote
    });
  } catch (error) {
    console.error('Error updating note status:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

// Delete a project (soft delete from student's projects array)
exports.deleteProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { reason, notifyStudent = true } = req.body;
    
    if (!projectId) {
      return res.status(400).json({ error: 'Missing project ID' });
    }
    
    // Find the student with the specific project
    const student = await Student.findOne({ 
      "projects._id": new mongoose.Types.ObjectId(projectId) 
    });
    
    if (!student) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Find the project index in the student's projects array
    const projectIndex = student.projects.findIndex(
      p => p._id.toString() === projectId
    );
    
    if (projectIndex === -1) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Save project name before modifying for the notification
    const projectName = student.projects[projectIndex].name;
    
    // Soft delete - mark the project as deleted
    student.projects[projectIndex].isDeleted = true;
    student.projects[projectIndex].deletedAt = new Date();
    student.projects[projectIndex].deletedReason = reason;
    student.projects[projectIndex].status = 'Removed';
    
    await student.save();
    
    // If notifyStudent is true, send a note to the student
    if (notifyStudent) {
      // Get moderator ID directly as string
      const moderatorId = req.body.moderatorId || "system-moderator";
      
      const note = new Note({
        senderId: moderatorId, // Use string directly
        senderType: 'Moderator',
        recipientId: student._id,
        recipientType: 'Student',
        subject: 'Your project has been removed',
        content: `Your project "${projectName}" has been removed. Reason: ${reason || 'Violation of platform guidelines'}`,
        regarding: 'Project',
        relatedItemType: 'Project',
        status: 'Unread',
        isImportant: true
      });
      
      await note.save();
    }
    
    return res.status(200).json({ 
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

// Get all notes (for moderators to manage all communications)
exports.getAllNotes = async (req, res) => {
  try {
    const { status, regarding, isImportant } = req.query;
    
    // Base query
    let query = {};
    
    // Apply filters
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (regarding && regarding !== 'all') {
      query.regarding = regarding;
    }
    
    if (isImportant === 'true') {
      query.isImportant = true;
    }
    
    // Get notes
    const notes = await Note.find(query)
      .sort({ createdAt: -1 });
    
    // Calculate statistics
    const allNotes = await Note.find({});
    const stats = {
      total: allNotes.length,
      unread: allNotes.filter(n => n.status === 'Unread').length,
      read: allNotes.filter(n => n.status === 'Read').length,
      responded: allNotes.filter(n => n.status === 'Responded').length,
      closed: allNotes.filter(n => n.status === 'Closed').length,
      actionRequired: allNotes.filter(n => n.status === 'ActionRequired').length,
      overdue: allNotes.filter(n => {
        if (!n.responseDeadline) return false;
        return new Date(n.responseDeadline) < new Date() && 
               n.status !== 'Closed' && 
               n.status !== 'Responded';
      }).length
    };
    
    return res.status(200).json({ 
      notes,
      stats
    });
  } catch (error) {
    console.error('Error fetching all notes:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

// Get a single note by ID
exports.getNoteById = async (req, res) => {
  try {
    const { noteId } = req.params;
    
    if (!noteId) {
      return res.status(400).json({ error: 'Missing note ID' });
    }
    
    // Find the note
    const note = await Note.findById(noteId);
    
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    // Get related notes (replies)
    const replies = await Note.find({ parentNoteId: noteId })
      .sort({ createdAt: 1 });
    
    // Get sender and recipient details
    let senderDetails = null;
    let recipientDetails = null;
    
    if (note.senderType === 'Student') {
      const student = await Student.findById(note.senderId);
      if (student) {
        senderDetails = {
          id: student._id,
          name: student.name,
          email: student.email,
          type: 'student',
          profilePicture: student.profile_picture
        };
      }
    } else if (note.senderType === 'Mentor') {
      const mentor = await Mentor.findById(note.senderId);
      if (mentor) {
        senderDetails = {
          id: mentor._id,
          name: mentor.name,
          email: mentor.email,
          type: 'mentor',
          profilePicture: mentor.profile_picture
        };
      }
    } else if (note.senderType === 'Moderator') {
      senderDetails = {
        id: note.senderId,
        name: 'Moderator',
        type: 'moderator'
      };
    }
    
    if (note.recipientType === 'Student') {
      const student = await Student.findById(note.recipientId);
      if (student) {
        recipientDetails = {
          id: student._id,
          name: student.name,
          email: student.email,
          type: 'student',
          profilePicture: student.profile_picture
        };
      }
    } else if (note.recipientType === 'Mentor') {
      const mentor = await Mentor.findById(note.recipientId);
      if (mentor) {
        recipientDetails = {
          id: mentor._id,
          name: mentor.name,
          email: mentor.email,
          type: 'mentor',
          profilePicture: mentor.profile_picture
        };
      }
    } else if (note.recipientType === 'Moderator') {
      recipientDetails = {
        id: note.recipientId,
        name: 'Moderator',
        type: 'moderator'
      };
    }
    
    // Combine all data
    const result = {
      note: note.toObject(),
      sender: senderDetails,
      recipient: recipientDetails,
      replies: replies
    };
    
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching note details:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

// Flag a project for review
exports.flagProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { reason, moderatorId } = req.body;
    
    if (!projectId) {
      return res.status(400).json({ error: 'Missing project ID' });
    }
    
    // Find the student with the specific project
    const student = await Student.findOne({ 
      "projects._id": new mongoose.Types.ObjectId(projectId) 
    });
    
    if (!student) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Find the project index in the student's projects array
    const projectIndex = student.projects.findIndex(
      p => p._id.toString() === projectId
    );
    
    if (projectIndex === -1) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Flag the project - use moderatorId directly as string
    student.projects[projectIndex].isFlagged = true;
    student.projects[projectIndex].flaggedAt = new Date();
    student.projects[projectIndex].flaggedReason = reason;
    student.projects[projectIndex].flaggedBy = moderatorId || "system-moderator";
    
    await student.save();
    
    return res.status(200).json({ 
      message: 'Project flagged successfully',
      data: student.projects[projectIndex]
    });
  } catch (error) {
    console.error('Error flagging project:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

// Get all flagged projects
exports.getFlaggedProjects = async (req, res) => {
  try {
    // Find all students with flagged projects
    const students = await Student.find({ 
      "projects.isFlagged": true 
    }).select('_id name profile_picture projects');
    
    // Extract and format the flagged projects
    let flaggedProjects = [];
    
    for (const student of students) {
      const flagged = student.projects
        .filter(p => p.isFlagged)
        .map(project => ({
          _id: project._id,
          name: project.name,
          description: project.description,
          techStack: project.tech_stack || [],
          githubLink: project.github_link,
          liveDemo: project.live_demo,
          creator: {
            studentId: student._id,
            name: student.name,
            profilePicture: student.profile_picture
          },
          status: project.status || 'Pending',
          createdAt: project.createdAt || new Date(),
          moderatorNotes: project.moderatorNotes || '',
          flaggedAt: project.flaggedAt,
          flaggedReason: project.flaggedReason,
          flaggedBy: project.flaggedBy
        }));
      
      flaggedProjects = [...flaggedProjects, ...flagged];
    }
    
    // Sort by flagged date (newest first)
    flaggedProjects.sort((a, b) => new Date(b.flaggedAt) - new Date(a.flaggedAt));
    
    return res.status(200).json(flaggedProjects);
  } catch (error) {
    console.error('Error fetching flagged projects:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};