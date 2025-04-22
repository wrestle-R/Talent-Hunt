import React, { useState, useEffect, useRef } from 'react';
import { X, Send } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import io from 'socket.io-client';

// Initialize socket connection
const socket = io('http://localhost:4000');

// Hardcoded mentor ID - Use this instead of dynamic mentor ID
const HARDCODED_MENTOR_ID = "68066ed669957410d3f56074";

const MentorChatModal = ({ isOpen, onClose, mentor, team, currentUser }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const processedMessageIds = useRef(new Set());
  
  // Safely add messages to state without duplicates
  const addMessageSafely = (newMsg) => {
    if (!newMsg || processedMessageIds.current.has(newMsg._id)) return;
    
    processedMessageIds.current.add(newMsg._id);
    setMessages((prevMessages) => [...prevMessages, newMsg]);
  };

  // Function to get user ID based on user type
  const getUserId = (user) => {
    if (!user) return null;
    return user._id || null;
  };
  
  // Format timestamp for display
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Use hardcoded mentor ID in useEffect
  useEffect(() => {
    if (!isOpen || !currentUser) return;
    
    // Clear processed message IDs when changing chat
    processedMessageIds.current.clear();
    
    // Use hardcoded mentor ID instead of dynamic mentor._id
    const mentorId = HARDCODED_MENTOR_ID;
    const studentId = getUserId(currentUser);
    
    if (!studentId || !mentorId) {
      console.log("Missing IDs for chat:", { studentId, mentorId });
      return;
    }

    console.log("Setting up chat with hardcoded mentor:", { studentId, mentorId });
    setLoading(true);
    
    // Update socket event listeners to use hardcoded ID
    socket.on('messageSent', (newMsg) => {
      console.log("Message sent confirmation:", newMsg);
      
      if (
        (newMsg.senderId === studentId && newMsg.receiverId === mentorId) ||
        (newMsg.senderId === mentorId && newMsg.receiverId === studentId)
      ) {
        addMessageSafely(newMsg);
      }
    });
    
    socket.on('newMessage', (newMsg) => {
      console.log("New message received:", newMsg);
      
      if (
        (newMsg.senderId === studentId && newMsg.receiverId === mentorId) ||
        (newMsg.senderId === mentorId && newMsg.receiverId === studentId)
      ) {
        addMessageSafely(newMsg);
        
        // If we're receiving a message and the chat is open, mark it as read
        if (newMsg.senderId === mentorId && isOpen) {
          axios.put(`http://localhost:4000/api/student/messages/read/${studentId}/${mentorId}`)
            .catch(error => {
              console.error("Error marking message as read:", error);
            });
        }
      }
    });
    
    socket.on('messageError', (error) => {
      console.error('Message error:', error);
      
      // Show toast notification with the error
      if (error && error.error) {
        toast.error(`Message failed: ${error.error}`);
        
        // Update UI to show failed message
        setMessages(prev => prev.map(msg => {
          if (msg.temp && error.messageId && msg._id === error.messageId) {
            return { ...msg, failed: true };
          }
          return msg;
        }));
      }
    });
    
    // Fetch message history
    axios.get(`http://localhost:4000/api/messages/history?senderId=${studentId}&receiverId=${mentorId}`)
      .then(response => {
        if (response.data && Array.isArray(response.data)) {
          // Add all messages to the processed set to prevent duplicates
          response.data.forEach(msg => {
            processedMessageIds.current.add(msg._id);
          });
          
          // Set the messages
          setMessages(response.data);
        }
      })
      .catch(error => {
        console.error("Error fetching message history:", error);
        toast.error("Failed to load message history");
      })
      .finally(() => {
        setLoading(false);
      });
    
    return () => {
      // Clean up event listeners when unmounting
      socket.off('messageSent');
      socket.off('newMessage');
      socket.off('messageError');
      socket.off('userTyping');
      socket.off('userStoppedTyping');
    };
  }, [currentUser, isOpen]);

  // Handle sending message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const senderId = getUserId(currentUser);
    const receiverId = HARDCODED_MENTOR_ID;

    if (!senderId || !receiverId) {
      console.error("Cannot send message: Missing user IDs", { senderId, receiverId });
      return;
    }

    // Create a message ID for tracking
    const tempId = `temp-${Date.now()}`;

    // Send message through socket
    socket.emit('sendMessage', {
      senderId,
      receiverId,
      message: message.trim(),
      messageId: tempId
    });
    
    // Add message to local state immediately for instant feedback
    const tempMessage = {
      _id: tempId,
      senderId,
      receiverId,
      message: message.trim(),
      createdAt: new Date().toISOString(),
      temp: true
    };
    
    addMessageSafely(tempMessage);
    
    // Clear input
    setMessage('');
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle retry for failed messages
  const handleRetryMessage = (messageId) => {
    // Find the failed message
    const failedMessage = messages.find(msg => msg._id === messageId);
    if (!failedMessage) return;
    
    // Extract proper IDs
    const senderId = getUserId(currentUser);
    const receiverId = HARDCODED_MENTOR_ID;

    // Remove the failed message
    setMessages(prev => prev.filter(msg => msg._id !== messageId));
    
    // Add a new temp message
    const tempMessage = {
      _id: `temp-${Date.now()}`,
      senderId,
      receiverId,
      message: failedMessage.message,
      createdAt: new Date().toISOString(),
      temp: true
    };
    
    addMessageSafely(tempMessage);

    // Send message through socket
    socket.emit('sendMessage', {
      senderId,
      receiverId,
      message: failedMessage.message,
      messageId: tempMessage._id
    });
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-[#1A1A1A] shadow-lg z-50 flex flex-col animate-slide-in-right border-l border-gray-800">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-800 bg-[#1A1A1A] flex justify-between items-center sticky top-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#333333] flex items-center justify-center text-white overflow-hidden">
            {mentor.profile_picture ? (
              <img 
                src={mentor.profile_picture} 
                alt={mentor.name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{mentor.name?.charAt(0).toUpperCase() || "M"}</span>
            )}
          </div>
          <div>
            <h3 className="font-medium text-white">{mentor.name}</h3>
            <p className="text-xs text-gray-400">
              {mentor.company ? mentor.company : 'Mentor'}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-[#333333] text-gray-400 hover:text-white transition-all duration-300"
        >
          <X size={20} />
        </button>
      </div>
      
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-[#121212]">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-2.5 bg-gray-800 rounded-full w-24 mb-2.5"></div>
              <div className="h-2.5 bg-gray-800 rounded-full w-32 mb-2.5"></div>
              <div className="h-2.5 bg-gray-800 rounded-full w-28"></div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                <Send size={24} className="mb-2 text-[#E8C848]" />
                <p>No messages yet</p>
                <p className="text-sm">Start a conversation with {mentor.name}</p>
              </div>
            ) : (
              messages.map((msg) => {
                const senderId = getUserId(currentUser);
                const isMe = msg.senderId === senderId;
                
                return (
                  <div 
                    key={msg._id} 
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[80%] rounded-lg px-3 py-2 ${
                        isMe 
                          ? `bg-[#E8C848] text-[#121212] rounded-br-none ${msg.temp ? 'opacity-70' : ''} ${msg.failed ? 'bg-red-500/70' : ''}`
                          : 'bg-[#1A1A1A] text-white rounded-bl-none border border-gray-800 hover:border-[#E8C848]/30 transition-all duration-300'
                      }`}
                    >
                      <p className="text-sm">{msg.message}</p>
                      <div className={`text-xs mt-1 flex items-center justify-end gap-1 ${
                        isMe ? 'text-[#121212]' : 'text-gray-400'
                      }`}>
                        {msg.failed ? (
                          <>
                            <span className="text-red-800">Failed</span>
                            <button 
                              onClick={() => handleRetryMessage(msg._id)}
                              className="underline hover:text-white ml-2"
                            >
                              Retry
                            </button>
                          </>
                        ) : (
                          formatTime(msg.createdAt)
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-800 rounded-lg px-3 py-2 max-w-[80%]">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      {/* Chat Input */}
      <div className="p-4 bg-[#1A1A1A] border-t border-gray-800">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-lg bg-[#242424] border border-gray-800 px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#E8C848]"
          />
          <button
            type="submit"
            disabled={!message.trim()}
            className={`p-2 rounded-lg ${
              message.trim()
                ? 'bg-[#E8C848] text-[#121212] hover:bg-[#E8C848]/80'
                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
            } transition-all duration-300`}
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default MentorChatModal;