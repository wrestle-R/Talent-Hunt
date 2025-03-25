import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, X, Send, Paperclip, MessageCircle, Users, Flag, AlertCircle } from 'lucide-react';
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

  // Helper function to safely extract ID
  const getUserId = (userObj) => {
    if (!userObj) return null;
    return userObj._id || userObj.mentorId || userObj.uid || null;
  };

  // Join chat room when team is available
  useEffect(() => {
    if (team && currentUser) {
      const teamId = team._id;
      const mentorId = getUserId(currentUser);
      
      if (mentorId && teamId) {
        console.log(`Joining mentor-team chat room: mentor ${mentorId} with team ${teamId}`);
        socket.emit('join', mentorId);
      }
    }
  }, [team, currentUser]);

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

  // Mark messages as read when opening chat
  useEffect(() => {
    if (isOpen && team && currentUser) {
      const teamId = team._id;
      const mentorId = getUserId(currentUser);
      
      if (mentorId && teamId) {
        // Mark messages as read via API
        axios.put(`http://localhost:4000/api/chat/messages/read/${mentorId}/${teamId}`)
          .then(response => {
            console.log("Messages marked as read:", response.data);
          })
          .catch(error => {
            console.error("Error marking messages as read:", error);
          });
      }
    }
  }, [isOpen, team, currentUser]);

  // Load chat history when team changes
  useEffect(() => {
    if (!isOpen || !team || !currentUser) return;
    
    // Clear processed message IDs when changing chat
    processedMessageIds.current.clear();
    
    // Reset temp ID counter
    tempIdCounterRef.current = 0;
    
    const teamId = team._id;
    const mentorId = getUserId(currentUser);
    
    if (!mentorId || !teamId) {
      console.log("Missing IDs for team chat:", { mentorId, teamId });
      return;
    }

    console.log("Setting up mentor-team chat between:", mentorId, teamId);
    setIsLoading(true);
    
    // Set up event listeners for this specific chat
    socket.on('messageSent', (newMsg) => {
      console.log("Message sent confirmation:", newMsg);
      
      if (
        (newMsg.senderId === mentorId && newMsg.receiverId === teamId) ||
        (newMsg.senderId === teamId && newMsg.receiverId === mentorId)
      ) {
        addMessageSafely(newMsg);
      }
    });
    
    socket.on('newMessage', (newMsg) => {
      console.log("New message received:", newMsg);
      
      if (
        (newMsg.senderId === mentorId && newMsg.receiverId === teamId) ||
        (newMsg.senderId === teamId && newMsg.receiverId === mentorId)
      ) {
        addMessageSafely(newMsg);
        
        // If we're receiving a message and the chat is open, mark it as read
        if (newMsg.senderId === teamId && isOpen) {
          axios.put(`http://localhost:4000/api/chat/messages/read/${mentorId}/${teamId}`)
            .catch(error => {
              console.error("Error marking messages as read:", error);
            });
        }
      }
    });
    
    socket.on('messageError', (error) => {
      console.error('Message error:', error);
      toast.error("Failed to send message. Please try again.");
    });
    
    // Typing indicators
    socket.on('userTyping', (data) => {
      if (data.senderId === teamId && data.receiverId === mentorId) {
        setIsTyping(true);
      }
    });
    
    socket.on('userStoppedTyping', (data) => {
      if (data.senderId === teamId && data.receiverId === mentorId) {
        setIsTyping(false);
      }
    });
    
    // Fetch message history
    const fetchMessages = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/api/chat/messages/${mentorId}/${teamId}`);
        console.log("Fetched messages:", response.data);
        
        if (Array.isArray(response.data)) {
          // Add all fetched messages to processed set to avoid duplicates
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
      } catch (error) {
        console.error("Error fetching messages:", error);
        setMessages([]);
        toast.error("Failed to load chat history");
      } finally {
        setIsLoading(false);
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
      setIsTyping(false);
    };
  }, [team, currentUser, isOpen]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const teamId = team._id;
    const mentorId = getUserId(currentUser);

    if (!mentorId || !teamId) {
      console.error("Cannot send message: Missing IDs", { mentorId, teamId });
      return;
    }

    console.log("Sending message to team:", {
      senderId: mentorId,
      receiverId: teamId,
      message: message.trim(),
      senderType: 'mentor'
    });

    // Send message through socket
    socket.emit('sendMessage', {
      senderId: mentorId,
      receiverId: teamId,
      message: message.trim(),
      senderType: 'mentor',
      senderName: currentUser.name
    });
    
    // Add message to local state immediately for instant feedback
    const tempMessage = {
      _id: generateTempId(),
      senderId: mentorId,
      receiverId: teamId,
      message: message.trim(),
      createdAt: new Date().toISOString(),
      senderType: 'mentor',
      senderName: currentUser.name,
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
        receiverId: teamId
      });
    }
  };

  // Typing indicator functionality
  const handleInputChange = (e) => {
    setMessage(e.target.value);
    
    const teamId = team._id;
    const mentorId = getUserId(currentUser);
    
    if (!mentorId || !teamId) return;
    
    // Send typing indicator
    socket.emit('typing', {
      senderId: mentorId,
      receiverId: teamId,
      senderType: 'mentor'
    });
    
    // Clear any existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout to stop typing indicator after 2 seconds
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stopTyping', {
        senderId: mentorId,
        receiverId: teamId
      });
    }, 2000);
  };

  // Handle message context menu
  const handleMessageContextMenu = (e, messageId) => {
    e.preventDefault();
    
    // Only allow reporting messages from the team (not your own messages)
    const clickedMessage = messages.find(msg => msg._id === messageId);
    const mentorId = getUserId(currentUser);
    
    if (!clickedMessage || clickedMessage.senderId === mentorId) {
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
        reportedByType: 'mentor',
        reportedByName: currentUser.name,
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

  if (!isOpen || !team) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-xl z-50 flex flex-col animate-slide-in-right">
      {/* Chat Header */}
      <div className="px-4 py-3 bg-emerald-600 text-white flex items-center justify-between">
        <div className="flex items-center">
          <button onClick={onClose} className="p-1 mr-2 rounded-full hover:bg-emerald-700">
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full overflow-hidden bg-emerald-500 mr-3 flex-shrink-0 flex items-center justify-center">
              {team.logo ? (
                <img 
                  src={team.logo} 
                  alt={team.name} 
                  className="h-full w-full object-cover"
                />
              ) : (
                <Users size={16} className="text-white" />
              )}
            </div>
            <div>
              <h3 className="font-medium">{team.name}</h3>
              <p className="text-xs text-emerald-100">
                {team.members?.length || 0} team members
              </p>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="p-1 rounded-full hover:bg-emerald-700">
          <X size={20} />
        </button>
      </div>
      
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
                <p className="text-sm">Start a conversation with this team</p>
              </div>
            ) : (
              messages.map((msg) => {
                const mentorId = getUserId(currentUser);
                const isFromMentor = msg.senderId === mentorId;
                
                return (
                  <div 
                    key={msg._id}
                    className={`flex ${isFromMentor ? 'justify-end' : 'justify-start'}`}
                    onContextMenu={(e) => handleMessageContextMenu(e, msg._id)}
                  >
                    <div 
                      className={`max-w-[80%] rounded-lg px-3 py-2 ${
                        isFromMentor 
                          ? `bg-emerald-600 text-white rounded-br-none ${msg.temp ? 'opacity-70' : ''}`
                          : 'bg-white border border-gray-200 rounded-bl-none relative group'
                      }`}
                    >
                      {!isFromMentor && (
                        <button 
                          className="absolute right-0 top-0 -mt-1 -mr-1 p-1 rounded-full bg-white shadow-md border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            openReportModal(msg._id);
                          }}
                        >
                          <Flag size={12} className="text-red-500" />
                        </button>
                      )}
                      
                      {/* Show sender info for team messages */}
                      {!isFromMentor && msg.senderInfo?.sentByUserName && (
                        <div className="text-xs text-gray-500 mb-1">
                          {msg.senderInfo.sentByUserName}
                        </div>
                      )}
                      
                      <p className="text-sm">{msg.message}</p>
                      <div className={`text-xs mt-1 flex items-center justify-end gap-1 ${
                        isFromMentor ? 'text-emerald-100' : 'text-gray-500'
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
      
      {/* Context Menu */}
      {messageContextMenu.isOpen && (
        <div 
          className="fixed bg-white shadow-lg rounded-md py-1 z-50 w-48 border border-gray-200"
          style={{ top: messageContextMenu.y, left: messageContextMenu.x }}
        >
          <button 
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
            onClick={() => openReportModal(messageContextMenu.messageId)}
          >
            <Flag size={16} className="mr-2" /> Report Message
          </button>
        </div>
      )}
      
      {/* Chat Input */}
      <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200 flex gap-2">
        <button 
          type="button"
          className="p-2 text-gray-500 rounded-full hover:bg-gray-100"
        >
          <Paperclip size={20} />
        </button>
        <input
          type="text"
          value={message}
          onChange={handleInputChange}
          placeholder="Send a message to the team..."
          className="flex-1 py-2 px-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <button 
          type="submit"
          disabled={!message.trim()}
          className={`p-2 rounded-full ${
            message.trim()
              ? 'bg-emerald-600 text-white hover:bg-emerald-700'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          <Send size={20} />
        </button>
      </form>
      
      {/* Report Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <AlertCircle size={20} className="text-red-500 mr-2" />
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
            
            <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">Message content:</p>
              <p className="text-gray-800 mt-1">{messageToReport?.message}</p>
            </div>
            
            <form onSubmit={handleReportSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for reporting*
                </label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional information (optional)
                </label>
                <textarea
                  value={additionalInfo}
                  onChange={(e) => setAdditionalInfo(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
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
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReport || !reportReason}
                  className={`px-4 py-2 bg-red-600 text-white rounded-lg text-sm flex items-center ${
                    isSubmittingReport || !reportReason ? 'opacity-70 cursor-not-allowed' : 'hover:bg-red-700'
                  }`}
                >
                  {isSubmittingReport ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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