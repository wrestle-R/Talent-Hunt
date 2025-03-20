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
const Message = require("./models/Message");

const app = express();

// Middleware with improved CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

app.use(express.json());

// Test route to verify server is running
app.get("/api/status", (req, res) => {
  res.status(200).json({ status: "Server is running" });
});

// Connect to MongoDB with proper error handling
mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });

// Routes
app.use("/api/student", studentRoutes);
app.use("/api/mentor", mentorRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/chat", chatRoutes);

const server = http.createServer(app);

// Socket.io setup with improved configuration
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    transports: ['websocket', 'polling']
  },
  pingTimeout: 60000  // Increase timeout for better connection stability
});

// Store active users
const activeUsers = new Map();

// Debug active users
const logActiveUsers = () => {
  console.log("Currently active users:", 
    Array.from(activeUsers.entries())
      .map(([id, socket]) => `${id} (${socket})`)
      .join(', ')
  );
};

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // User joins with their user ID
  socket.on("join", (userId) => {
    // Validate userId
    if (!userId) {
      console.warn("Join event received without userId");
      return;
    }
    
    activeUsers.set(userId, socket.id);
    console.log(`User ${userId} is now active with socket: ${socket.id}`);
    logActiveUsers();
  });

  // Handle sending message with improved validation and error handling
  socket.on("sendMessage", async (messageData) => {
    try {
      console.log("Received message data:", messageData);
      
      const { senderId, receiverId, message } = messageData;
      
      // Validate required fields
      if (!senderId) {
        console.warn("Missing senderId in message data");
        socket.emit("messageError", { error: "Missing senderId" });
        return;
      }
      
      if (!receiverId) {
        console.warn("Missing receiverId in message data");
        socket.emit("messageError", { error: "Missing receiverId" });
        return;
      }
      
      if (!message || typeof message !== 'string' || !message.trim()) {
        console.warn("Missing or invalid message content");
        socket.emit("messageError", { error: "Invalid message content" });
        return;
      }
      
      // Create and save message to DB
      const newMessage = new Message({
        senderId,
        receiverId,
        message: message.trim()
      });
      
      console.log("Saving message:", newMessage);
      const savedMessage = await newMessage.save();
      console.log("Message saved successfully:", savedMessage);
      
      // Send the message back to sender with confirmation
      socket.emit("messageSent", savedMessage);
      
      // Get receiver's socket if they're online
      const receiverSocketId = activeUsers.get(receiverId);
      
      if (receiverSocketId) {
        // Send the message to receiver
        io.to(receiverSocketId).emit("newMessage", savedMessage);
        console.log(`Message delivered to online user ${receiverId}`);
      } else {
        console.log(`User ${receiverId} is offline. Message saved but not delivered.`);
      }
      
    } catch (error) {
      console.error("Error sending message:", error);
      socket.emit("messageError", { error: "Failed to save message" });
    }
  });

  // Handle typing status with improved error handling
  socket.on("typing", (data) => {
    try {
      const { senderId, receiverId } = data;
      
      if (!senderId || !receiverId) {
        console.warn("Missing user IDs in typing event", data);
        return;
      }
      
      const receiverSocketId = activeUsers.get(receiverId);
      
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("userTyping", { userId: senderId });
      }
    } catch (error) {
      console.error("Error handling typing event:", error);
    }
  });

  // Handle when user stops typing with improved error handling
  socket.on("stopTyping", (data) => {
    try {
      const { senderId, receiverId } = data;
      
      if (!senderId || !receiverId) {
        console.warn("Missing user IDs in stopTyping event", data);
        return;
      }
      
      const receiverSocketId = activeUsers.get(receiverId);
      
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("userStoppedTyping", { userId: senderId });
      }
    } catch (error) {
      console.error("Error handling stopTyping event:", error);
    }
  });

  // Handle disconnect with better cleanup
  socket.on("disconnect", () => {
    let disconnectedUserId = null;
    
    // Find and remove the disconnected user
    for (const [userId, socketId] of activeUsers.entries()) {
      if (socketId === socket.id) {
        disconnectedUserId = userId;
        activeUsers.delete(userId);
        break;
      }
    }
    
    if (disconnectedUserId) {
      console.log(`User ${disconnectedUserId} disconnected`);
    } else {
      console.log(`Socket ${socket.id} disconnected (user not found in active users)`);
    }
    
    logActiveUsers();
  });

  // Handle socket errors
  socket.on("error", (error) => {
    console.error(`Socket ${socket.id} error:`, error);
  });
});

// Handle server errors
server.on('error', (error) => {
  console.error('Server error:', error);
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket server available at ws://localhost:${PORT}`);
});