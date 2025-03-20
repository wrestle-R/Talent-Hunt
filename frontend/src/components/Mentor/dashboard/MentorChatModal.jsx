import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Paperclip, ChevronLeft, MessageCircle } from 'lucide-react';
import axios from 'axios';
import { io } from 'socket.io-client';

// Create socket instance (outside component to persist between renders)
let socket;

const MentorChatModal = ({ isOpen, onClose, student, mentorData }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  
  // Keep track of processed message IDs to avoid duplicates
  const processedMessageIds = useRef(new Set());

  // Initialize socket connection once
  useEffect(() => {
    if (!socket) {
      socket = io('http://localhost:4000');
      
      socket.on('connect', () => {
        console.log('Connected to socket server');
        setSocketConnected(true);
      });
      
      socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setSocketConnected(false);
      });
    }
    
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // Join socket when mentor ID is available
  useEffect(() => {
    if (mentorData?._id) {
      console.log("Joining socket with mentorId:", mentorData._id);
      socket.emit('join', mentorData._id);
    }
  }, [mentorData]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Helper to get user ID
  const getUserId = (userObj) => {
    if (!userObj) return null;
    return userObj._id || userObj.userId || null;
  };

  // Mark messages as read when opening chat
  useEffect(() => {
    if (isOpen && student && mentorData) {
      const studentId = getUserId(student);
      const mentorId = getUserId(mentorData);
      
      if (studentId && mentorId) {
        // Mark messages as read via API
        axios.put(`http://localhost:4000/api/mentor/messages/read/${mentorId}/${studentId}`)
          .then(response => {
            console.log("Messages marked as read:", response.data);
          })
          .catch(error => {
            console.error("Error marking messages as read:", error);
          });
      }
    }
  }, [isOpen, student, mentorData]);

  // Add a message safely (avoiding duplicates)
  const addMessageSafely = (newMsg) => {
    // If it's a temporary message (just sent), we don't check for dupes
    if (newMsg.temp) {
      setMessages(prev => [...prev, newMsg]);
      return;
    }

    // Check if we've already processed this message ID
    if (!newMsg._id || processedMessageIds.current.has(newMsg._id)) {
      return;
    }
    
    // Add to processed set
    processedMessageIds.current.add(newMsg._id);
    
    // Replace any temp message with the same content, or add as new
    setMessages(prev => {
      // Check if we already have a temp message with similar content/timestamp
      const hasSimilarTempMessage = prev.some(msg => 
        msg.temp && 
        msg.senderId === newMsg.senderId && 
        msg.receiverId === newMsg.receiverId &&
        msg.message === newMsg.message
      );
      
      if (hasSimilarTempMessage) {
        // Replace the temp message with the real one
        return prev.map(msg => 
          (msg.temp && 
           msg.senderId === newMsg.senderId && 
           msg.receiverId === newMsg.receiverId &&
           msg.message === newMsg.message) 
            ? newMsg 
            : msg
        );
      } else {
        // Just add the new message
        return [...prev, newMsg];
      }
    });
  };

  // Load chat history when student changes
  useEffect(() => {
    // Clear processed message IDs when changing chat
    processedMessageIds.current.clear();
    
    // Ensure we have both users' IDs
    const mentorId = getUserId(mentorData);
    const studentId = getUserId(student);
    
    if (!mentorId || !studentId || !isOpen) {
      console.log("Missing data for chat:", { mentorId, studentId, isOpen });
      return;
    }

    console.log("Setting up chat between:", { mentorId, studentId });
    setIsLoading(true);
    
    // Set up event listeners for this specific chat
    socket.on('messageSent', (newMsg) => {
      console.log("Message sent confirmation:", newMsg);
      
      if (
        (newMsg.senderId === mentorId && newMsg.receiverId === studentId) ||
        (newMsg.senderId === studentId && newMsg.receiverId === mentorId)
      ) {
        addMessageSafely(newMsg);
      }
    });
    
    socket.on('newMessage', (newMsg) => {
      console.log("New message received:", newMsg);
      
      if (
        (newMsg.senderId === mentorId && newMsg.receiverId === studentId) ||
        (newMsg.senderId === studentId && newMsg.receiverId === mentorId)
      ) {
        addMessageSafely(newMsg);
        
        // If we're receiving a message and the chat is open, mark it as read
        if (newMsg.senderId === studentId && isOpen) {
          axios.put(`http://localhost:4000/api/mentor/messages/read/${mentorId}/${studentId}`)
            .catch(error => {
              console.error("Error marking message as read:", error);
            });
        }
      }
    });
    
    socket.on('messageError', (error) => {
      console.error('Message error:', error);
    });
    
    // Optional typing indicators
    socket.on('userTyping', (data) => {
      if (data.userId === studentId) {
        setIsTyping(true);
      }
    });
    
    socket.on('userStoppedTyping', (data) => {
      if (data.userId === studentId) {
        setIsTyping(false);
      }
    });
    
    // Fetch message history
    const fetchMessages = async () => {
      try {
        // Use proper IDs for API call
        const response = await axios.get(`http://localhost:4000/api/chat/messages/${mentorId}/${studentId}`);
        console.log("Fetched messages:", response.data);
        
        // Add all fetched messages to processed set to avoid duplicates
        if (Array.isArray(response.data)) {
          response.data.forEach(msg => {
            if (msg._id) {
              processedMessageIds.current.add(msg._id);
            }
          });
          
          setMessages(response.data);
        } else {
          console.warn("Unexpected response format:", response.data);
          setMessages([]);
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching messages:", error);
        setIsLoading(false);
        setMessages([]);
      }
    };
    
    fetchMessages();
    
    // Cleanup function to remove event listeners
    return () => {
      socket.off('messageSent');
      socket.off('newMessage');
      socket.off('messageError');
      socket.off('userTyping');
      socket.off('userStoppedTyping');
      setMessages([]);
    };
  }, [student, mentorData, isOpen]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim() || !socketConnected) return;

    // Extract proper IDs
    const mentorId = getUserId(mentorData);
    const studentId = getUserId(student);

    if (!mentorId || !studentId) {
      console.error("Cannot send message: Missing user IDs", { mentorId, studentId });
      return;
    }

    console.log("Sending message:", {
      senderId: mentorId,
      receiverId: studentId,
      message: message.trim()
    });

    // Send message through socket
    socket.emit('sendMessage', {
      senderId: mentorId,
      receiverId: studentId,
      message: message.trim()
    });
    
    // Add message to local state immediately for instant feedback
    const tempMessage = {
      _id: `temp-${Date.now()}`,
      senderId: mentorId,
      receiverId: studentId,
      message: message.trim(),
      createdAt: new Date().toISOString(),
      temp: true // Flag to identify temporary messages
    };
    
    addMessageSafely(tempMessage);
    
    // Clear input
    setMessage('');
    
    // Clear typing timeout and indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      socket.emit('stopTyping', {
        senderId: mentorId,
        receiverId: studentId
      });
    }
  };

  // Typing indicator functionality
  const handleInputChange = (e) => {
    setMessage(e.target.value);
    
    // Extract proper IDs
    const mentorId = getUserId(mentorData);
    const studentId = getUserId(student);
    
    if (!mentorId || !studentId || !socketConnected) return;
    
    // Send typing indicator
    socket.emit('typing', {
      senderId: mentorId,
      receiverId: studentId
    });
    
    // Clear any existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout to stop typing indicator after 2 seconds
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stopTyping', {
        senderId: mentorId,
        receiverId: studentId
      });
    }, 2000);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen || !student) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-xl z-50 flex flex-col animate-slide-in-right">
      {/* Chat Header */}
      <div className="px-4 py-3 bg-blue-600 text-white flex items-center justify-between">
        <div className="flex items-center">
          <button onClick={onClose} className="p-1 mr-2 rounded-full hover:bg-blue-700">
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center">
            <img 
              src={student.profilePicture || 'https://via.placeholder.com/40?text=👤'}
              alt={student.name} 
              className="w-8 h-8 rounded-full mr-3"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/40?text=👤';
              }}
            />
            <div>
              <h3 className="font-medium">{student.name}</h3>
              {student.email && (
                <p className="text-xs text-blue-100">
                  {student.email}
                </p>
              )}
            </div>
          </div>
        </div>
        <button onClick={onClose} className="p-1 rounded-full hover:bg-blue-700">
          <X size={20} />
        </button>
      </div>
      
      {/* Connection Status Indicator */}
      {!socketConnected && (
        <div className="bg-yellow-100 text-yellow-800 text-center text-sm py-1">
          Connecting to chat server...
        </div>
      )}
      
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-2.5 bg-gray-200 rounded-full w-24 mb-2.5"></div>
              <div className="h-2.5 bg-gray-200 rounded-full w-32 mb-2.5"></div>
              <div className="h-2.5 bg-gray-200 rounded-full w-28"></div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                <MessageCircle size={24} className="mb-2 text-gray-300" />
                <p>No messages yet</p>
                <p className="text-sm">Start a conversation with {student.name}</p>
              </div>
            ) : (
              messages.map((msg) => {
                const mentorId = getUserId(mentorData);
                const isMe = msg.senderId === mentorId;
                
                return (
                  <div 
                    key={msg._id} 
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[80%] rounded-lg px-3 py-2 ${
                        isMe 
                          ? `bg-blue-500 text-white rounded-br-none ${msg.temp ? 'opacity-70' : ''}`
                          : 'bg-white border border-gray-200 rounded-bl-none'
                      }`}
                    >
                      <p className="text-sm">{msg.message}</p>
                      <div className={`text-xs mt-1 flex items-center justify-end gap-1 ${
                        isMe ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {formatTime(msg.createdAt)}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg px-3 py-2 max-w-[80%]">
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
      <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200 flex gap-2">
        <button 
          type="button"
          className="p-2 text-gray-500 rounded-full hover:bg-gray-100"
          disabled={!socketConnected}
        >
          <Paperclip size={20} />
        </button>
        <input
          type="text"
          value={message}
          onChange={handleInputChange}
          placeholder={socketConnected ? "Type a message..." : "Connecting..."}
          className="flex-1 py-2 px-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={!socketConnected}
        />
        <button 
          type="submit"
          disabled={!message.trim() || !socketConnected}
          className={`p-2 rounded-full ${
            message.trim() && socketConnected
              ? 'bg-blue-500 text-white hover:bg-blue-600' 
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

export default MentorChatModal;