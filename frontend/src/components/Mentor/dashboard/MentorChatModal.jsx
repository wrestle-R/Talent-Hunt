import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Paperclip, ChevronLeft, MessageCircle, Flag, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import StudentPlaceholder from '../../../public/student_placeholder.png';
import MentorPlaceholder from '../../../public/mentor_placeholder.png';

// Create socket instance (outside component to persist between renders)
let socket;

const MentorChatModal = ({ isOpen, onClose, student, mentorData }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [messageToReport, setMessageToReport] = useState(null);
  const [reportReason, setReportReason] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [messageContextMenu, setMessageContextMenu] = useState({ isOpen: false, messageId: null, x: 0, y: 0 });
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  
  // Keep track of processed message IDs to avoid duplicates
  const processedMessageIds = useRef(new Set());

  // Initialize socket connection once
  useEffect(() => {
    if (!socket) {
      socket = io(import.meta.env.VITE_APP_BASE_URL);
      
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

  // Click outside to close context menu
  useEffect(() => {
    if (messageContextMenu.isOpen) {
      const handleClickOutside = () => {
        setMessageContextMenu({ isOpen: false, messageId: null, x: 0, y: 0 });
      };
      
      document.addEventListener('click', handleClickOutside);
      
      return () => {
        document.removeEventListener('click', handleClickOutside);
      };
    }
  }, [messageContextMenu.isOpen]);

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
        axios.put(`${import.meta.env.VITE_APP_BASE_URL}/api/mentor/messages/read/${mentorId}/${studentId}`)
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
          axios.put(`${import.meta.env.VITE_APP_BASE_URL}/api/mentor/messages/read/${mentorId}/${studentId}`)
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
        const response = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}/api/chat/messages/${mentorId}/${studentId}`);
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

  // Handle message context menu
  const handleMessageContextMenu = (e, messageId) => {
    e.preventDefault();
    
    // Only allow reporting messages from the other person
    const clickedMessage = messages.find(msg => msg._id === messageId);
    if (!clickedMessage || clickedMessage.senderId === getUserId(mentorData)) {
      return;
    }
    
    // Position context menu
    setMessageContextMenu({
      isOpen: true,
      messageId,
      x: e.clientX,
      y: e.clientY
    });
  };

  // Open report modal
  const openReportModal = (messageId) => {
    const messageObj = messages.find(msg => msg._id === messageId);
    setMessageToReport(messageObj);
    setIsReportModalOpen(true);
    setMessageContextMenu({ isOpen: false, messageId: null, x: 0, y: 0 });
  };

  // Handle report submission
  const handleReportSubmit = async (e) => {
    e.preventDefault();
    
    if (!messageToReport || !reportReason) {
      toast.error("Please select a reason for reporting");
      return;
    }
    
    try {
      setIsSubmittingReport(true);
      
      const response = await axios.post(`${import.meta.env.VITE_APP_BASE_URL}/api/chat/messages/report`, {
        messageId: messageToReport._id,
        reportedBy: getUserId(mentorData),
        reason: reportReason,
        additionalInfo
      });
      
      toast.success("Message reported successfully. Our moderators will review it.");
      setIsReportModalOpen(false);
      setReportReason('');
      setAdditionalInfo('');
      setMessageToReport(null);
    } catch (error) {
      console.error("Error reporting message:", error);
      toast.error(error.response?.data?.error || "Failed to report message");
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen || !student) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-[#111111] shadow-lg border-l border-gray-800 z-50 flex flex-col animate-slide-in-right">
      {/* Chat Header */}
      <div className="px-4 py-3 bg-[#1A1A1A] border-b border-gray-800">
        <div className="flex items-center">
          <button onClick={onClose} className="p-1 mr-2 rounded-full hover:bg-[#E8C848]/10 text-[#E8C848]">
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center">
            <img 
              src={student.profilePicture || StudentPlaceholder} 
              alt={student.name} 
              className="w-8 h-8 rounded-full mr-3"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = StudentPlaceholder;
              }}
            />
            <div>
              <h3 className="font-medium text-white font-montserrat">{student.name}</h3>
              {student.email && (
                <p className="text-xs text-gray-400 font-inter">
                  {student.email}
                </p>
              )}
            </div>
          </div>
        </div>
        <button onClick={onClose} className="p-1 rounded-full hover:bg-[#E8C848]/10 text-[#E8C848]">
          <X size={20} />
        </button>
      </div>
      
      {/* Connection Status Indicator */}
      {!socketConnected && (
        <div className="bg-[#E8C848]/10 text-[#E8C848] text-center text-sm py-1">
          Connecting to chat server...
        </div>
      )}
      
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-[#111111]">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-2.5 bg-[#1A1A1A] rounded-full w-24 mb-2.5"></div>
              <div className="h-2.5 bg-[#1A1A1A] rounded-full w-32 mb-2.5"></div>
              <div className="h-2.5 bg-[#1A1A1A] rounded-full w-28"></div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                <MessageCircle size={24} className="mb-2 text-gray-600" />
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
                    onContextMenu={(e) => handleMessageContextMenu(e, msg._id)}
                  >
                    <div 
                      className={`max-w-[80%] rounded-lg px-3 py-2 ${
                        isMe 
                          ? `bg-[#E8C848] text-[#121212] rounded-br-none ${msg.temp ? 'opacity-70' : ''}`
                          : 'bg-[#1A1A1A] text-white rounded-bl-none relative group border border-gray-800'
                      }`}
                    >
                      {!isMe && (
                        <button 
                          className="absolute right-0 top-0 -mt-1 -mr-1 p-1 rounded-full bg-[#121212] shadow-md border border-gray-800 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            openReportModal(msg._id);
                          }}
                        >
                          <Flag size={12} className="text-[#E8C848]" />
                        </button>
                      )}
                      <p className="text-sm">{msg.message}</p>
                      <div className={`text-xs mt-1 flex items-center justify-end gap-1 ${
                        isMe ? 'text-[#121212]/70' : 'text-gray-400'
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
                <div className="bg-[#1A1A1A] rounded-lg px-3 py-2 max-w-[80%] border border-gray-800">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-[#E8C848]/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-[#E8C848]/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-[#E8C848]/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      {/* Context Menu */}
      {messageContextMenu.isOpen && (
        <div 
          className="fixed bg-[#1A1A1A] shadow-lg rounded-md py-1 z-50 w-48 border border-gray-800"
          style={{ top: messageContextMenu.y, left: messageContextMenu.x }}
        >
          <button 
            className="w-full text-left px-4 py-2 text-sm text-[#E8C848] hover:bg-[#121212] flex items-center"
            onClick={() => openReportModal(messageContextMenu.messageId)}
          >
            <Flag size={16} className="mr-2" /> Report Message
          </button>
        </div>
      )}
      
      {/* Chat Input */}
      <form onSubmit={handleSendMessage} className="p-3 bg-[#1A1A1A] border-t border-gray-800">
        <button 
          type="button"
          className="p-2 text-gray-400 rounded-full hover:bg-[#121212]"
          disabled={!socketConnected}
        >
          <Paperclip size={20} />
        </button>
        <input
          type="text"
          value={message}
          onChange={handleInputChange}
          placeholder={socketConnected ? "Type a message..." : "Connecting..."}
          className="flex-1 py-2 px-3 bg-[#111111] border border-gray-800 rounded-full focus:outline-none focus:ring-2 focus:ring-[#E8C848]/50 text-white placeholder-gray-500 font-inter"
          disabled={!socketConnected}
        />
        <button 
          type="submit"
          disabled={!message.trim() || !socketConnected}
          className={`p-2 rounded-full ${
            message.trim() && socketConnected
              ? 'bg-[#E8C848] text-[#121212] hover:bg-[#E8C848]/80' 
              : 'bg-gray-800 text-gray-600 cursor-not-allowed'
          }`}
        >
          <Send size={20} />
        </button>
      </form>
      
      {/* Report Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#1A1A1A] rounded-lg shadow-lg p-6 w-full max-w-md mx-4 border border-gray-800">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-white font-montserrat flex items-center">
                <AlertCircle size={20} className="text-[#E8C848] mr-2" />
                Report Message
              </h3>
              <button 
                onClick={() => {
                  setIsReportModalOpen(false);
                  setReportReason('');
                  setAdditionalInfo('');
                  setMessageToReport(null);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="mb-4 p-3 bg-[#121212] rounded-lg border border-gray-800">
              <p className="text-sm text-gray-400">Message content:</p>
              <p className="text-white mt-1">{messageToReport?.message}</p>
            </div>
            
            <form onSubmit={handleReportSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Reason for reporting*
                </label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full rounded-lg border border-gray-800 bg-[#121212] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E8C848]/50 text-white"
                  required
                >
                  <option value="">Select a reason</option>
                  <option value="harassment">Harassment</option>
                  <option value="inappropriate_content">Inappropriate Content</option>
                  <option value="spam">Spam</option>
                  <option value="hate_speech">Hate Speech</option>
                  <option value="threats">Threats</option>
                  <option value="misinformation">Misinformation</option>
                  <option value="personal_information">Personal Information</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Additional information (optional)
                </label>
                <textarea
                  value={additionalInfo}
                  onChange={(e) => setAdditionalInfo(e.target.value)}
                  className="w-full rounded-lg border border-gray-800 bg-[#121212] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E8C848]/50 text-white placeholder-gray-500"
                  placeholder="Please provide any additional details"
                  rows="3"
                  maxLength="500"
                />
              </div>
              
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsReportModalOpen(false);
                    setReportReason('');
                    setAdditionalInfo('');
                    setMessageToReport(null);
                  }}
                  className="px-4 py-2 bg-gray-800 text-gray-400 rounded-lg text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReport || !reportReason}
                  className={`px-4 py-2 bg-[#E8C848] text-[#121212] rounded-lg text-sm flex items-center ${
                    isSubmittingReport || !reportReason ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#E8C848]/80'
                  }`}
                >
                  {isSubmittingReport ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-[#121212]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Flag size={16} className="mr-2" />
                      Submit Report
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorChatModal;