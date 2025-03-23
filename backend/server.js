require('dotenv').config();

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const mongoose = require("mongoose");
const studentRoutes = require("./routes/StudentRoutes");
const mentorRoutes = require("./routes/MentorRoutes");
const adminRoutes = require("./routes/AdminRoutes");
const chatRoutes = require("./routes/ChatRoutes");
const teamRoutes = require("./routes/TeamRoutes");
const Message = require("./models/Message");
const moderatorRoutes = require("./routes/ModeratorRoutes");

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

app.use(express.json());

// Test route
app.get("/api/status", (req, res) => {
  res.status(200).json({ status: "Server is running" });
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use("/api/student", studentRoutes);
app.use("/api/mentor", mentorRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/moderator", moderatorRoutes);
app.use("/api/teams", teamRoutes);

const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    transports: ['websocket', 'polling']
  },
  pingTimeout: 60000
});

// Store active users and team rooms
const activeUsers = new Map();
const teamRooms = new Map(); // Map teamId to array of user socket IDs

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("join", (userId) => {
    if (!userId) return;
    activeUsers.set(userId, socket.id);
  });

  // Join team chat room
  socket.on("joinTeamRoom", ({ userId, teamId }) => {
    if (!userId || !teamId) return;
    
    console.log(`User ${userId} joining team room ${teamId}`);
    
    // Add user to team room
    socket.join(`team-${teamId}`);
    
    // Track users in team rooms
    if (!teamRooms.has(teamId)) {
      teamRooms.set(teamId, new Set());
    }
    
    teamRooms.get(teamId).add(socket.id);
    
    // Add user to active users if not already there
    if (!activeUsers.has(userId)) {
      activeUsers.set(userId, socket.id);
    }
  });

  socket.on("sendMessage", async (messageData) => {
    try {
      const { senderId, receiverId, message } = messageData;
      if (!senderId || !receiverId || !message?.trim()) return;

      const newMessage = new Message({ senderId, receiverId, message: message.trim() });
      await newMessage.save();

      socket.emit("messageSent", newMessage);

      const receiverSocketId = activeUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newMessage", newMessage);
      }
    } catch (error) {
      socket.emit("messageError", { error: "Failed to save message" });
    }
  });

  // Team chat message handling
  socket.on("sendTeamMessage", async (messageData) => {
    try {
      const { senderId, senderName, receiverId, message, isTeamMessage } = messageData;
      
      if (!senderId || !receiverId || !message?.trim()) {
        return socket.emit("messageError", { error: "Missing required fields" });
      }
      
      console.log(`Team message from ${senderName} to team ${receiverId}: ${message}`);
      
      // Save the team message
      const newMessage = new Message({ 
        senderId, 
        receiverId, 
        message: message.trim(),
        isTeamMessage: true
      });
      
      await newMessage.save();
      
      // Emit confirmation to sender
      socket.emit("teamMessageSent", newMessage);
      
      // Broadcast to team room (excluding sender)
      socket.to(`team-${receiverId}`).emit("newTeamMessage", {
        ...newMessage.toObject(),
        senderName
      });
      
    } catch (error) {
      console.error("Error sending team message:", error);
      socket.emit("messageError", { error: "Failed to save team message" });
    }
  });

  socket.on("typing", ({ senderId, receiverId }) => {
    const receiverSocketId = activeUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("userTyping", { userId: senderId });
    }
  });

  socket.on("stopTyping", ({ senderId, receiverId }) => {
    const receiverSocketId = activeUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("userStoppedTyping", { userId: senderId });
    }
  });

  // Team chat typing indicators
  socket.on("typingInTeam", ({ userId, userName, teamId }) => {
    console.log(`${userName} is typing in team ${teamId}`);
    socket.to(`team-${teamId}`).emit("userTypingInTeam", { 
      userId, 
      userName,
      teamId 
    });
  });
  
  socket.on("stopTypingInTeam", ({ userId, teamId }) => {
    socket.to(`team-${teamId}`).emit("userStoppedTypingInTeam", { 
      userId,
      teamId
    });
  });

  socket.on("disconnect", () => {
    // Remove from activeUsers
    for (const [userId, socketId] of activeUsers.entries()) {
      if (socketId === socket.id) {
        activeUsers.delete(userId);
        break;
      }
    }
    
    // Remove from team rooms
    for (const [teamId, socketIds] of teamRooms.entries()) {
      if (socketIds.has(socket.id)) {
        socketIds.delete(socket.id);
        // If room is empty, remove it
        if (socketIds.size === 0) {
          teamRooms.delete(teamId);
        }
      }
    }
    
    console.log(`User disconnected: ${socket.id}`);
  });

  socket.on("error", (error) => {
    console.error("Socket error:", error);
  });
});

server.on('error', (error) => {
  console.error('Server error:', error);
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket server available at ws://localhost:${PORT}`);
});