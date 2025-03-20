const Message = require('../models/Message');
const Student = require('../models/Student');
const Mentor = require('../models/Mentor');

exports.getMessages = async (req, res) => {
  try {
    const { senderId, receiverId } = req.params;
    
    console.log(`Fetching messages between ${senderId} and ${receiverId}`);
    
    // Fetch messages between these two users (in both directions)
    const messages = await Message.find({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId }
      ]
    }).sort({ createdAt: 1 });
    
    console.log(`Found ${messages.length} messages`);
    return res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.saveMessage = async (req, res) => {
  try {
    const { senderId, receiverId, message } = req.body;
    
    console.log("Saving message via API:", { senderId, receiverId, message });
    
    if (!senderId || !receiverId || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const newMessage = new Message({
      senderId,
      receiverId,
      message
    });
    
    const savedMessage = await newMessage.save();
    console.log("Message saved:", savedMessage);
    
    return res.status(201).json(savedMessage);
  } catch (error) {
    console.error('Error saving message:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.getConversations = async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log(`Getting conversations for user ${userId}`);
    
    // Find all messages where the user is either sender or receiver
    const messages = await Message.find({
      $or: [
        { senderId: userId },
        { receiverId: userId }
      ]
    }).sort({ createdAt: -1 });
    
    // Get unique users the current user has chatted with
    const conversationPartners = new Map();
    
    for (const message of messages) {
      // Determine the other user in the conversation
      const partnerId = message.senderId === userId ? message.receiverId : message.senderId;
      
      // If we haven't processed this partner yet, add their latest message
      if (!conversationPartners.has(partnerId)) {
        conversationPartners.set(partnerId, {
          userId: partnerId,
          lastMessage: message.message,
          lastMessageTime: message.createdAt
        });
      }
    }
    
    // Convert to array
    const conversations = Array.from(conversationPartners.values());
    console.log(`Found ${conversations.length} conversations`);
    
    return res.status(200).json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

// Get conversations with user details
exports.getConversationsWithDetails = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Find all messages where the user is either sender or receiver
    const messages = await Message.find({
      $or: [
        { senderId: userId },
        { receiverId: userId }
      ]
    }).sort({ createdAt: -1 });
    
    // Get unique users the current user has chatted with
    const conversationPartners = new Map();
    
    for (const message of messages) {
      // Determine the other user in the conversation
      const partnerId = message.senderId === userId ? message.receiverId : message.senderId;
      
      // If we haven't processed this partner yet, add their latest message
      if (!conversationPartners.has(partnerId)) {
        conversationPartners.set(partnerId, {
          userId: partnerId,
          lastMessage: message.message,
          lastMessageTime: message.createdAt,
          unread: 0
        });
      }
    }
    
    // Get unread message counts
    for (const [partnerId, conversation] of conversationPartners.entries()) {
      const unreadCount = await Message.countDocuments({
        senderId: partnerId,
        receiverId: userId,
        // Add read field if you implement read status later
      });
      conversation.unread = unreadCount;
    }
    
    // Add user details for each conversation
    const enhancedConversations = [];
    for (const [partnerId, conversation] of conversationPartners.entries()) {
      // Try to find user in Student collection first
      let partner = await Student.findById(partnerId);
      let role = 'student';
      
      // If not found in Student, try Mentor collection
      if (!partner) {
        partner = await Mentor.findById(partnerId);
        role = 'mentor';
      }
      
      if (partner) {
        enhancedConversations.push({
          ...conversation,
          name: partner.name,
          profilePicture: partner.profile_picture,
          role,
          institution: partner.education?.institution || 'N/A'
        });
      }
    }
    
    // Sort by most recent message
    enhancedConversations.sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));
    
    return res.status(200).json(enhancedConversations);
  } catch (error) {
    console.error('Error fetching conversations with details:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.markMessagesAsRead = async (req, res) => {
  try {
    const { senderId, receiverId } = req.params;
    
    // This would mark messages as read if you add a read field to your schema later
    // For now, it's a placeholder
    
    return res.status(200).json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

// Get unread message count for a user
exports.getUnreadMessageCount = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Count unread messages
    // This is a placeholder since your schema doesn't have a read status
    const count = await Message.countDocuments({
      receiverId: userId
      // Add read: false when you implement read status
    });
    
    return res.status(200).json({ count });
  } catch (error) {
    console.error('Error getting unread message count:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};