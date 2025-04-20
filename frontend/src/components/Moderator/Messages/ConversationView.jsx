import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, MessageSquare, Flag, User, Search, Download, AlertCircle } from 'lucide-react';

const ConversationView = () => {
  const { user1, user2 } = useParams();
  const navigate = useNavigate();
  
  const [conversation, setConversation] = useState([]);
  const [user1Data, setUser1Data] = useState(null);
  const [user2Data, setUser2Data] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedMessages, setHighlightedMessages] = useState([]);
  const [currentHighlight, setCurrentHighlight] = useState(-1);
  
  const messagesEndRef = useRef(null);
  const highlightedRefs = useRef({});
  
  // Fetch conversation between two users
  useEffect(() => {
    const fetchConversation = async () => {
      try {
        setIsLoading(true);
        
        const conversationResponse = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}/api/moderator/conversation/${user1}/${user2}`);
        setConversation(conversationResponse.data);
        
        // Fetch user details for both users
        const usersResponse = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}/api/moderator/messages/reported?status=all`);
        
        // Find message with either user to get their details
        const messagesWithUsers = usersResponse.data;
        
        // Find user1 data
        const user1Message = messagesWithUsers.find(
          msg => msg.senderId === user1 || msg.receiverId === user1
        );
        
        if (user1Message) {
          if (user1Message.senderId === user1) {
            setUser1Data(user1Message.sender);
          } else if (user1Message.receiverId === user1) {
            setUser1Data(user1Message.receiver);
          }
        }
        
        // Find user2 data
        const user2Message = messagesWithUsers.find(
          msg => msg.senderId === user2 || msg.receiverId === user2
        );
        
        if (user2Message) {
          if (user2Message.senderId === user2) {
            setUser2Data(user2Message.sender);
          } else if (user2Message.receiverId === user2) {
            setUser2Data(user2Message.receiver);
          }
        }
        
      } catch (error) {
        console.error('Error fetching conversation:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchConversation();
  }, [user1, user2]);
  
  // Scroll to bottom when conversation loads
  useEffect(() => {
    if (messagesEndRef.current && !isLoading) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversation, isLoading]);
  
  // Handle search functionality
  useEffect(() => {
    if (!searchTerm.trim()) {
      setHighlightedMessages([]);
      setCurrentHighlight(-1);
      return;
    }
    
    const searchResults = conversation.reduce((results, message, index) => {
      if (message.message.toLowerCase().includes(searchTerm.toLowerCase())) {
        results.push(index);
      }
      return results;
    }, []);
    
    setHighlightedMessages(searchResults);
    setCurrentHighlight(searchResults.length > 0 ? 0 : -1);
  }, [searchTerm, conversation]);
  
  // Scroll to highlighted message
  useEffect(() => {
    if (currentHighlight >= 0 && highlightedRefs.current[highlightedMessages[currentHighlight]]) {
      highlightedRefs.current[highlightedMessages[currentHighlight]].scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [currentHighlight, highlightedMessages]);
  
  // Navigate to next/previous highlight
  const navigateHighlight = (direction) => {
    if (highlightedMessages.length === 0) return;
    
    if (direction === 'next') {
      setCurrentHighlight((prev) => 
        prev === highlightedMessages.length - 1 ? 0 : prev + 1
      );
    } else {
      setCurrentHighlight((prev) => 
        prev === 0 ? highlightedMessages.length - 1 : prev - 1
      );
    }
  };
  
  // Format date and time
  const formatDateTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };
  
  // Get truncated date for date dividers
  const getMessageDate = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };
  
  // Helper to check if message is reported
  const isReportedMessage = (messageId) => {
    return conversation.some(msg => 
      msg._id === messageId && msg.isReported
    );
  };
  
  // Export conversation as text file
  const exportConversation = () => {
    // Create text content
    let content = `Conversation between ${user1Data?.name || user1} and ${user2Data?.name || user2}\n`;
    content += `Exported on: ${new Date().toLocaleString()}\n\n`;
    
    // Add messages
    conversation.forEach((msg) => {
      const sender = msg.senderId === user1 ? user1Data?.name || 'User 1' : user2Data?.name || 'User 2';
      content += `[${formatDateTime(msg.createdAt)}] ${sender}: ${msg.message}\n`;
      
      if (msg.isReported) {
        content += `-- THIS MESSAGE WAS REPORTED --\n`;
        content += `Reason: ${msg.reportDetails?.reason.replace(/_/g, ' ')}\n`;
        if (msg.reportDetails?.additionalInfo) {
          content += `Additional info: ${msg.reportDetails.additionalInfo}\n`;
        }
        content += `Status: ${msg.reportDetails?.status.replace(/_/g, ' ')}\n`;
        content += `----------------------------------\n`;
      }
    });
    
    // Create blob and download link
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversation_${user1}_${user2}_${new Date().toISOString().slice(0,10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  // Highlight search terms in message
  const highlightSearchTerm = (text) => {
    if (!searchTerm) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.split(regex).map((part, i) => 
      regex.test(part) ? <mark key={i} className="bg-yellow-200">{part}</mark> : part
    );
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 bg-[#111111]">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-[#1A1A1A] rounded w-1/4"></div>
            <div className="h-24 bg-[#1A1A1A] rounded"></div>
            <div className="space-y-2">
              <div className="h-12 bg-[#1A1A1A] rounded"></div>
              <div className="h-12 bg-[#1A1A1A] rounded"></div>
              <div className="h-12 bg-[#1A1A1A] rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8 bg-[#111111] font-inter">
      <div className="max-w-4xl mx-auto">
        {/* Header with back button */}
        <div className="mb-6">
          <button 
            onClick={() => navigate('/moderator/messages')}
            className="inline-flex items-center text-[#E8C848] hover:text-[#E8C848]/80 transition-colors duration-300"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            <span>Back to Messages</span>
          </button>
        </div>
        
        {/* Main content */}
        <div className="bg-[#1A1A1A] rounded-lg shadow-lg border border-gray-800 overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 bg-[#111111] border-b border-gray-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between">
              <h1 className="text-xl font-semibold text-white flex items-center mb-4 sm:mb-0 font-montserrat">
                <MessageSquare className="mr-2 text-[#E8C848]" size={20} />
                Conversation
              </h1>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={exportConversation}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-[#111111] hover:bg-[#1d1d1d] hover:border-gray-600 transition-colors duration-300"
                >
                  <Download size={16} className="mr-1.5 -ml-0.5" />
                  Export
                </button>
              </div>
            </div>
          </div>
          
          {/* Users Info - Updated with dark theme colors */}
          <div className="px-6 py-4 bg-[#111111] border-b border-gray-800">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center">
                <div className="h-10 w-10 flex-shrink-0 mr-3">
                  <img 
                    className="h-10 w-10 rounded-full"
                    src={user1Data?.profilePicture || 'https://via.placeholder.com/40?text=👤'} 
                    alt={user1Data?.name || 'User 1'} 
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/40?text=👤';
                    }}
                  />
                </div>
                <div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-300">
                      {user1Data?.name || 'Unknown User'}
                    </span>
                    <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      user1Data?.type === 'student' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user1Data?.type === 'student' ? 'Student' : 'Mentor'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {user1Data?.email || user1}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-center w-full sm:w-auto">
                <div className="px-3 py-1 rounded-full bg-gray-800 text-gray-400 text-sm flex items-center">
                  <MessageSquare size={14} className="mr-1" />
                  <span>{conversation.length} messages</span>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="h-10 w-10 flex-shrink-0 mr-3">
                  <img 
                    className="h-10 w-10 rounded-full"
                    src={user2Data?.profilePicture || 'https://via.placeholder.com/40?text=👤'} 
                    alt={user2Data?.name || 'User 2'} 
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/40?text=👤';
                    }}
                  />
                </div>
                <div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-300">
                      {user2Data?.name || 'Unknown User'}
                    </span>
                    <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      user2Data?.type === 'student' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user2Data?.type === 'student' ? 'Student' : 'Mentor'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {user2Data?.email || user2}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Search bar */}
          <div className="px-6 py-3 border-b border-gray-800 bg-[#1A1A1A] sticky top-0 z-10">
            <div className="flex items-center">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={16} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search in conversation..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-md leading-5 bg-[#111111] text-gray-300 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-[#E8C848] focus:border-[#E8C848] transition-colors duration-300"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              {highlightedMessages.length > 0 && (
                <div className="ml-3 flex items-center">
                  <span className="text-sm text-gray-400 mr-2">
                    {currentHighlight + 1} of {highlightedMessages.length}
                  </span>
                  <button 
                    onClick={() => navigateHighlight('prev')}
                    className="p-1 rounded-full hover:bg-[#111111] text-gray-400 hover:text-gray-300 transition-colors duration-300"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => navigateHighlight('next')}
                    className="p-1 rounded-full hover:bg-[#111111] text-gray-400 hover:text-gray-300 transition-colors duration-300"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Messages - Updated with dark theme colors */}
          <div className="h-[600px] overflow-y-auto p-6 bg-[#111111]">
            {conversation.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <MessageSquare size={48} className="text-gray-300 mb-3" />
                <p className="text-center">No messages found between these users.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {conversation.map((message, index) => {
                  const isUser1 = message.senderId === user1;
                  const sender = isUser1 ? user1Data : user2Data;
                  const isReported = message.isReported;
                  
                  // Check if we need a date separator
                  const showDateSeparator = index === 0 || 
                    getMessageDate(message.createdAt) !== getMessageDate(conversation[index - 1].createdAt);
                  
                  // Assign ref if message is highlighted
                  const isHighlighted = highlightedMessages.indexOf(index) !== -1;
                  const isCurrentHighlight = highlightedMessages[currentHighlight] === index;
                  
                  return (
                    <React.Fragment key={message._id || index}>
                      {showDateSeparator && (
                        <div className="flex justify-center my-4">
                          <div className="px-3 py-1 bg-gray-800 rounded-full text-xs text-gray-400">
                            {formatDateTime(message.createdAt).split(' ')[0]}
                          </div>
                        </div>
                      )}
                      
                      <div 
                        className={`flex ${isUser1 ? 'justify-start' : 'justify-end'}`}
                        ref={el => {
                          if (isHighlighted) {
                            highlightedRefs.current[index] = el;
                          }
                        }}
                      >
                        <div className={`max-w-[75%] flex ${isUser1 ? 'flex-row' : 'flex-row-reverse'}`}>
                          {isUser1 && (
                            <div className="flex-shrink-0 mr-3">
                              <img 
                                className="h-8 w-8 rounded-full"
                                src={sender?.profilePicture || 'https://via.placeholder.com/40?text=👤'} 
                                alt={sender?.name || 'User'} 
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = 'https://via.placeholder.com/40?text=👤';
                                }}
                              />
                            </div>
                          )}
                          
                          <div 
                            className={`relative ${
                              isCurrentHighlight ? 'ring-2 ring-[#E8C848] ring-offset-2' : ''
                            }`}
                          >
                            {isReported && (
                              <div className="absolute -top-2 -right-2 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center">
                                <Flag size={10} className="text-white" />
                              </div>
                            )}
                            
                            <div 
                              className={`rounded-lg px-4 py-2 ${
                                isUser1 
                                  ? 'bg-gray-800 text-gray-300 rounded-tl-none' 
                                  : 'bg-[#E8C848] text-gray-900 rounded-tr-none'
                              } ${isReported ? 'border border-red-300' : ''}`}
                            >
                              <div className="text-sm whitespace-pre-wrap">
                                {highlightSearchTerm(message.message)}
                              </div>
                              <div className={`text-xs mt-1 flex justify-end ${
                                isUser1 ? 'text-gray-500' : 'text-gray-900'
                              }`}>
                                {formatDateTime(message.createdAt).split(' ')[1]}
                              </div>
                            </div>
                            
                            {isReported && (
                              <div className="mt-1 text-xs flex justify-end">
                                <div className="bg-red-50 text-red-700 px-2 py-1 rounded flex items-center">
                                  <AlertCircle size={10} className="mr-1" />
                                  <span className="capitalize">
                                    {message.reportDetails?.reason.replace(/_/g, ' ')}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {!isUser1 && (
                            <div className="flex-shrink-0 ml-3">
                              <img 
                                className="h-8 w-8 rounded-full"
                                src={sender?.profilePicture || 'https://via.placeholder.com/40?text=👤'} 
                                alt={sender?.name || 'User'} 
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = 'https://via.placeholder.com/40?text=👤';
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="px-6 py-4 bg-[#111111] border-t border-gray-800">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-400">
                {conversation.length} messages | {conversation.filter(m => m.isReported).length} reported
              </div>
              
              <button 
                onClick={() => navigate('/moderator/messages')}
                className="inline-flex items-center px-3 py-1.5 border border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-[#1A1A1A] hover:bg-[#232323] transition-colors duration-300"
              >
                <ArrowLeft size={16} className="mr-1.5 -ml-0.5" />
                Back to Reports
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationView;