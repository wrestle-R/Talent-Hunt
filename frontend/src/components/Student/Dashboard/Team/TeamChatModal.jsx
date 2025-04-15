import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, X, Send, Paperclip, MessageCircle, User, Users, Flag, AlertCircle } from 'lucide-react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { toast } from 'react-hot-toast';

// Create socket instance (outside component to persist between renders)
let socket;

const TeamChatModal = ({ isOpen, onClose, team, currentUser }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [socketConnected, setSocketConnected] = useState(true);
  const [typingUsers, setTypingUsers] = useState({});
  const [messageToReport, setMessageToReport] = useState(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [messageContextMenu, setMessageContextMenu] = useState({ isOpen: false, messageId: null, x: 0, y: 0 });
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const tempIdCounterRef = useRef(0); // Counter for unique temp IDs
  
  // Keep track of processed message IDs to avoid duplicates
  const processedMessageIds = useRef(new Set());

  // Initialize socket connection once
  useEffect(() => {
    if (!socket) {
      socket = io('http://localhost:4000', {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000
      });
      
      socket.on('connect', () => {
        console.log('Connected to socket server');
        setSocketConnected(true);
      });
      
      socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        console.log('Connection error, but keeping UI enabled for better UX');
      });
    }
    
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // Helper function to safely extract ID from user
  const getUserId = (userObj) => {
    if (!userObj) return null;
    return userObj._id || userObj.uid || null;
  };

  // Join team chat room when team ID is available
  useEffect(() => {
    if (currentUser && team) {
      const userId = getUserId(currentUser);
      const teamId = team._id;
      
      if (userId && teamId) {
        console.log(`Joining team chat room for team: ${teamId}`);
        socket.emit('joinTeamRoom', { userId, teamId });
      }
    }
  }, [currentUser, team]);

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

  // Generate a unique temp ID
  const generateTempId = () => {
    tempIdCounterRef.current += 1;
    return `temp-${Date.now()}-${tempIdCounterRef.current}`;
  };

  // Add a message safely (avoiding duplicates)
  const addMessageSafely = (newMsg) => {
    // If it's a temporary message, don't need to check for duplicates
    if (newMsg.temp) {
      // Ensure temp message has a unique ID
      const msgWithId = {
        ...newMsg,
        _id: newMsg._id || generateTempId()
      };
      setMessages(prev => [...prev, msgWithId]);
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
      // Find an index of a temp message with similar content to replace
      const tempIndex = prev.findIndex(msg => 
        msg.temp && 
        msg.senderId === newMsg.senderId && 
        msg.message === newMsg.message
      );
      
      if (tempIndex !== -1) {
        // Create a new array with the temp message replaced
        const newMessages = [...prev];
        newMessages[tempIndex] = newMsg;
        return newMessages;
      } else {
        // Just add the new message
        return [...prev, newMsg];
      }
    });
  };

  // Load team chat history when team changes
  useEffect(() => {
    if (!isOpen || !team || !currentUser) return;
    
    // Clear processed message IDs when changing chat
    processedMessageIds.current.clear();
    
    // Reset temp ID counter
    tempIdCounterRef.current = 0;
    
    // Ensure we have both user ID and team ID
    const userId = getUserId(currentUser);
    const teamId = team._id;
    
    if (!userId || !teamId) {
      console.log("Missing IDs for team chat:", { userId, teamId });
      return;
    }

    console.log("Setting up team chat for team:", teamId);
    setIsLoading(true);
    
    // Set up event listeners for team chat
    socket.on('teamMessageSent', (newMsg) => {
      console.log("Team message sent confirmation:", newMsg);
      
      if (newMsg.receiverId === teamId) {
        addMessageSafely(newMsg);
      }
    });
    
    socket.on('newTeamMessage', (newMsg) => {
      console.log("New team message received:", newMsg);
      
      if (newMsg.receiverId === teamId) {
        addMessageSafely(newMsg);
        
        // If we're receiving a message and the chat is open, mark it as read
        if (newMsg.senderId !== userId && isOpen) {
          axios.put(`http://localhost:4000/api/chat/team-messages/read/${userId}/${teamId}`)
            .catch(error => {
              console.error("Error marking team messages as read:", error);
            });
        }
      }
    });
    
    socket.on('messageError', (error) => {
      console.error('Message error:', error);
      toast.error("Failed to send message. Please try again.");
    });
    
    // Typing indicators for team chat
    socket.on('userTypingInTeam', (data) => {
      if (data.teamId === teamId && data.userId !== userId) {
        setTypingUsers(prev => ({
          ...prev,
          [data.userId]: {
            name: data.userName || 'A team member',
            timestamp: Date.now()
          }
        }));
      }
    });
    
    socket.on('userStoppedTypingInTeam', (data) => {
      if (data.teamId === teamId && data.userId !== userId) {
        setTypingUsers(prev => {
          const newTypingUsers = { ...prev };
          delete newTypingUsers[data.userId];
          return newTypingUsers;
        });
      }
    });
    
    // Fetch team message history
    const fetchTeamMessages = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/api/chat/team-messages/${teamId}`);
        console.log("Fetched team messages:", response.data);
        
        if (Array.isArray(response.data)) {
          // Add all fetched messages to processed set to avoid duplicates
          response.data.forEach(msg => {
            if (msg._id) {
              processedMessageIds.current.add(msg._id);
            }
          });
          
          setMessages(response.data);
        } else {
          console.warn("Unexpected response format for team messages:", response.data);
          setMessages([]);
        }
      } catch (error) {
        console.error("Error fetching team messages:", error);
        setMessages([]);
        
        // Fallback to empty state
        toast.error("Failed to load team chat history");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTeamMessages();
    
    // Cleanup function to remove event listeners
    return () => {
      socket.off('teamMessageSent');
      socket.off('newTeamMessage');
      socket.off('messageError');
      socket.off('userTypingInTeam');
      socket.off('userStoppedTypingInTeam');
      setMessages([]);
      setTypingUsers({});
    };
  }, [team, currentUser, isOpen]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    // Extract proper IDs
    const senderId = getUserId(currentUser);
    const teamId = team._id;

    if (!senderId || !teamId) {
      console.error("Cannot send message: Missing IDs", { senderId, teamId });
      return;
    }

    console.log("Sending team message:", {
      senderId,
      receiverId: teamId, // Team ID is the receiver for team chat
      message: message.trim(),
      isTeamMessage: true // Flag to identify team messages
    });

    // Send message through socket
    socket.emit('sendTeamMessage', {
      senderId,
      senderName: currentUser.name,
      receiverId: teamId, // Team ID as receiver
      message: message.trim(),
      isTeamMessage: true
    });
    
    // Add message to local state immediately for instant feedback
    const tempMessage = {
      _id: generateTempId(), // Use our unique temp ID generator
      senderId,
      receiverId: teamId,
      message: message.trim(),
      isTeamMessage: true,
      createdAt: new Date().toISOString(),
      temp: true // Flag to identify temporary messages
    };
    
    addMessageSafely(tempMessage);
    
    // Clear input
    setMessage('');
    
    // Clear typing timeout and indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      socket.emit('stopTypingInTeam', {
        userId: senderId,
        teamId
      });
    }
  };

  // Handle typing in team chat
  const handleInputChange = (e) => {
    setMessage(e.target.value);
    
    // Extract proper IDs
    const userId = getUserId(currentUser);
    const teamId = team._id;
    
    if (!userId || !teamId) return;
    
    // Send typing indicator to team chat room
    socket.emit('typingInTeam', {
      userId,
      userName: currentUser.name,
      teamId
    });
    
    // Clear any existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout to stop typing indicator after 2 seconds
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stopTypingInTeam', {
        userId,
        teamId
      });
    }, 2000);
  };

  // Handle message context menu
  const handleMessageContextMenu = (e, messageId) => {
    e.preventDefault();
    
    // Only allow reporting messages from other team members
    const clickedMessage = messages.find(msg => msg._id === messageId);
    if (!clickedMessage || clickedMessage.senderId === getUserId(currentUser)) {
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
      
      const response = await axios.post('http://localhost:4000/api/chat/messages/report', {
        messageId: messageToReport._id,
        reportedBy: getUserId(currentUser),
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

  // Get team member name by ID
  const getMemberNameById = (userId) => {
    if (!team || !team.members) return 'Team Member';
    
    const member = team.members.find(m => m._id === userId);
    return member ? member.name : 'Team Member';
  };

  if (!isOpen || !team) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-[#1A1A1A] border-l border-gray-800 shadow-xl z-50 flex flex-col animate-slide-in-right">
      {/* Chat Header */}
      <div className="px-4 py-3 bg-[#121212] text-white flex items-center justify-between border-b border-gray-800">
        <div className="flex items-center">
          <button onClick={onClose} className="p-1 mr-2 rounded-full hover:bg-[#E8C848]/10 text-[#E8C848] transition-all duration-300">
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center">
            <div className="bg-[#E8C848]/10 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-[#E8C848]">
              <Users size={18} />
            </div>
            <div>
              <h3 className="font-medium text-white">{team.name} Team Chat</h3>
              <p className="text-xs text-gray-400">
                {team.members?.length || 0} {team.members?.length === 1 ? 'member' : 'members'}
              </p>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="p-1 rounded-full hover:bg-[#E8C848]/10 text-[#E8C848] transition-all duration-300">
          <X size={20} />
        </button>
      </div>
      
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-[#121212]">
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
                <Users size={24} className="mb-2 text-[#E8C848]/30" />
                <p>No messages yet</p>
                <p className="text-sm">Start a conversation with your team</p>
              </div>
            ) : (
              messages.map((msg) => {
                const senderId = getUserId(currentUser);
                const isMe = msg.senderId === senderId;
                const sender = team.members?.find(m => m._id === msg.senderId);
                const senderName = sender?.name || 'Team Member';
                
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
                          : 'bg-[#1A1A1A] text-white border border-gray-800 rounded-bl-none relative group hover:border-[#E8C848]/30 transition-all duration-300'
                      }`}
                    >
                      {!isMe && (
                        <div className="text-xs font-medium text-[#E8C848] mb-1">
                          {senderName}
                        </div>
                      )}
                      
                      {!isMe && (
                        <button 
                          className="absolute right-0 top-0 -mt-1 -mr-1 p-1 rounded-full bg-[#1A1A1A] border border-gray-800 opacity-0 group-hover:opacity-100 transition-opacity hover:border-[#E8C848]/30"
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
            
            {Object.keys(typingUsers).length > 0 && (
              <div className="flex justify-start">
                <div className="bg-[#1A1A1A] rounded-lg px-3 py-2 max-w-[80%] border border-gray-800">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-400">
                      {Object.values(typingUsers).length === 1 
                        ? `${Object.values(typingUsers)[0].name} is typing...` 
                        : 'Multiple people are typing...'}
                    </span>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-[#E8C848]/30 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-[#E8C848]/30 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-[#E8C848]/30 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
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
          className="fixed bg-[#1A1A1A] shadow-lg rounded-md py-1 z-50 w-48 border border-gray-800 hover:border-[#E8C848]/30"
          style={{ top: messageContextMenu.y, left: messageContextMenu.x }}
        >
          <button 
            className="w-full text-left px-4 py-2 text-sm text-[#E8C848] hover:bg-[#121212] transition-all duration-300 flex items-center"
            onClick={() => openReportModal(messageContextMenu.messageId)}
          >
            <Flag size={16} className="mr-2" /> Report Message
          </button>
        </div>
      )}
      
      {/* Chat Input */}
      <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-800 bg-[#1A1A1A] flex gap-2">
        <button 
          type="button"
          className="p-2 text-[#E8C848] rounded-full hover:bg-[#E8C848]/10 transition-all duration-300"
        >
          <Paperclip size={20} />
        </button>
        <input
          type="text"
          value={message}
          onChange={handleInputChange}
          placeholder="Type a message to the team..."
          className="flex-1 py-2 px-3 bg-[#121212] border border-gray-800 text-white rounded-full focus:outline-none focus:ring-2 focus:ring-[#E8C848] focus:border-[#E8C848] placeholder-gray-500 transition-all duration-300"
        />
        <button 
          type="submit"
          disabled={!message.trim()}
          className={`p-2 rounded-full transition-all duration-300 ${
            message.trim()
              ? 'bg-[#E8C848] text-[#121212] hover:bg-[#E8C848]/80 shadow-lg shadow-[#E8C848]/30'
              : 'bg-gray-800 text-gray-600 cursor-not-allowed'
          }`}
        >
          <Send size={20} />
        </button>
      </form>

      {/* Report Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 bg-[#121212]/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#1A1A1A] rounded-lg shadow-xl p-6 w-full max-w-md mx-4 border border-gray-800 hover:border-[#E8C848]/30 transition-all duration-300">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-white flex items-center">
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
                  className="w-full rounded-lg border border-gray-800 bg-[#121212] text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E8C848] focus:border-[#E8C848] transition-all duration-300"
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
                  className="w-full rounded-lg border border-gray-800 bg-[#121212] text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E8C848] focus:border-[#E8C848] placeholder-gray-500 transition-all duration-300"
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
                  className="px-4 py-2 bg-gray-800 text-gray-400 rounded-lg text-sm hover:bg-gray-700 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReport || !reportReason}
                  className={`px-4 py-2 bg-[#E8C848] text-[#121212] rounded-lg text-sm flex items-center ${
                    isSubmittingReport || !reportReason ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#E8C848]/80 shadow-lg shadow-[#E8C848]/30'
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

export default TeamChatModal;