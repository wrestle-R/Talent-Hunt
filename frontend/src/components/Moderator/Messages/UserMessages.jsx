import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, MessageSquare, User, Flag, Filter, Mail, Search,
  AlertTriangle, Calendar, AlertCircle, Download, ChevronDown
} from 'lucide-react';

const UserMessages = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  
  const [userData, setUserData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterReported, setFilterReported] = useState(false);
  const [sortDirection, setSortDirection] = useState('desc'); // 'asc' or 'desc'
  const [contacts, setContacts] = useState([]);
  
  // Fetch user data and messages
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch all messages to find user data and contacts
        const response = await axios.get(`http://localhost:4000/api/moderator/messages/user/${userId}`);
        const userMessages = response.data;
        setMessages(userMessages);
        
        // Get all reported messages to find user data
        const reportedResponse = await axios.get(`http://localhost:4000/api/moderator/messages/reported?status=all`);
        const reportedMessages = reportedResponse.data;
        
        // Find user data
        let userData = null;
        
        // First check in reported messages as they have full user data
        for (const msg of reportedMessages) {
          if (msg.senderId === userId && msg.sender) {
            userData = msg.sender;
            break;
          } else if (msg.receiverId === userId && msg.receiver) {
            userData = msg.receiver;
            break;
          }
        }
        
        // If not found, construct basic data from regular messages
        if (!userData) {
          // Use first message to determine if user is sender or receiver
          const firstMsg = userMessages[0];
          if (firstMsg) {
            userData = {
              _id: userId,
              name: firstMsg.senderId === userId ? 'User ' + userId.substring(0, 5) : 'User ' + userId.substring(0, 5),
              type: 'unknown'
            };
          }
        }
        
        setUserData(userData);
        
        // Extract unique contacts (people this user has messaged with)
        const uniqueContacts = new Map();
        
        userMessages.forEach(msg => {
          const contactId = msg.senderId === userId ? msg.receiverId : msg.senderId;
          if (!uniqueContacts.has(contactId)) {
            uniqueContacts.set(contactId, {
              _id: contactId,
              messageCount: 1,
              lastMessageDate: msg.createdAt
            });
          } else {
            const contact = uniqueContacts.get(contactId);
            contact.messageCount += 1;
            if (new Date(msg.createdAt) > new Date(contact.lastMessageDate)) {
              contact.lastMessageDate = msg.createdAt;
            }
          }
        });
        
        // Try to enrich contact data from reported messages
        uniqueContacts.forEach((contact, contactId) => {
          for (const msg of reportedMessages) {
            if (msg.senderId === contactId && msg.sender) {
              contact.name = msg.sender.name;
              contact.type = msg.sender.type;
              contact.profilePicture = msg.sender.profilePicture;
              contact.email = msg.sender.email;
              break;
            } else if (msg.receiverId === contactId && msg.receiver) {
              contact.name = msg.receiver.name;
              contact.type = msg.receiver.type;
              contact.profilePicture = msg.receiver.profilePicture;
              contact.email = msg.receiver.email;
              break;
            }
          }
          
          // If still no name, use ID
          if (!contact.name) {
            contact.name = 'User ' + contactId.substring(0, 5);
          }
        });
        
        setContacts(Array.from(uniqueContacts.values()));
        
        // Apply initial filtering
        applyFilters(userMessages, '', filterReported, sortDirection);
        
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, [userId]);
  
  // Apply filters when they change
  useEffect(() => {
    applyFilters(messages, searchTerm, filterReported, sortDirection);
  }, [searchTerm, filterReported, sortDirection]);
  
  // Helper function to apply filters
  const applyFilters = (msgs, search, onlyReported, direction) => {
    let filtered = [...msgs];
    
    // Filter by search term
    if (search) {
      filtered = filtered.filter(msg => 
        msg.message.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Filter only reported messages
    if (onlyReported) {
      filtered = filtered.filter(msg => msg.isReported);
    }
    
    // Sort by date
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return direction === 'asc' ? dateA - dateB : dateB - dateA;
    });
    
    setFilteredMessages(filtered);
  };
  
  // Toggle sort direction
  const toggleSortDirection = () => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  };
  
  // Format date and time
  const formatDateTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };
  
  // Highlight search terms in message
  const highlightSearchTerm = (text) => {
    if (!searchTerm) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.split(regex).map((part, i) => 
      regex.test(part) ? <mark key={i} className="bg-yellow-200">{part}</mark> : part
    );
  };
  
  // Export messages as text file
  const exportMessages = () => {
    // Create text content
    let content = `Messages for ${userData?.name || userId}\n`;
    content += `Type: ${userData?.type || 'Unknown'}\n`;
    content += `Email: ${userData?.email || 'Unknown'}\n`;
    content += `Exported on: ${new Date().toLocaleString()}\n\n`;
    
    // Add messages
    filteredMessages.forEach((msg) => {
      const direction = msg.senderId === userId ? 'SENT TO' : 'RECEIVED FROM';
      const otherUser = msg.senderId === userId 
        ? `User ${msg.receiverId.substring(0, 5)}` 
        : `User ${msg.senderId.substring(0, 5)}`;
        
      content += `[${formatDateTime(msg.createdAt)}] ${direction} ${otherUser}: ${msg.message}\n`;
      
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
    a.download = `messages_${userId}_${new Date().toISOString().slice(0,10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-200 rounded w-1/4"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header with back button */}
        <div className="mb-6">
          <button 
            onClick={() => navigate('/moderator/messages')}
            className="inline-flex items-center text-indigo-600 hover:text-indigo-800"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            <span>Back to Messages</span>
          </button>
        </div>
        
        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar with user info and contacts */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
              {/* User Info */}
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <User className="mr-2 text-indigo-500" size={20} />
                  User Profile
                </h2>
                
                <div className="flex items-center mb-4">
                  <img 
                    className="h-16 w-16 rounded-full mr-4"
                    src={userData?.profilePicture || 'https://via.placeholder.com/64?text=👤'} 
                    alt={userData?.name || 'User'} 
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/64?text=👤';
                    }}
                  />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {userData?.name || 'Unknown User'}
                    </h3>
                    <p className="text-sm text-gray-500 flex items-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        userData?.type === 'student' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : userData?.type === 'mentor'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                      }`}>
                        {userData?.type === 'student' 
                          ? 'Student' 
                          : userData?.type === 'mentor'
                            ? 'Mentor'
                            : 'Unknown Role'}
                      </span>
                    </p>
                  </div>
                </div>
                
                {userData?.email && (
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <Mail className="mr-2 h-4 w-4 text-gray-400" />
                    <span>{userData.email}</span>
                  </div>
                )}
                
                <div className="mt-4 grid grid-cols-2 gap-4 text-center">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xl font-medium text-gray-900">
                      {messages.filter(m => m.senderId === userId).length}
                    </div>
                    <div className="text-xs text-gray-500">Sent</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xl font-medium text-gray-900">
                      {messages.filter(m => m.receiverId === userId).length}
                    </div>
                    <div className="text-xs text-gray-500">Received</div>
                  </div>
                </div>
              </div>
              
              {/* User Contacts */}
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Conversations With
                </h3>
                
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {contacts.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-500">No contacts found</p>
                    </div>
                  ) : (
                    contacts.map((contact) => (
                      <div 
                        key={contact._id}
                        onClick={() => navigate(`/moderator/conversation/${userId}/${contact._id}`)}
                        className="flex items-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                      >
                        <div className="relative">
                          <img 
                            className="h-10 w-10 rounded-full"
                            src={contact.profilePicture || 'https://via.placeholder.com/40?text=👤'} 
                            alt={contact.name} 
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://via.placeholder.com/40?text=👤';
                            }}
                          />
                          {contact.type && (
                            <span className={`absolute bottom-0 right-0 h-3 w-3 rounded-full ring-2 ring-white ${
                              contact.type === 'student' 
                                ? 'bg-emerald-400' 
                                : contact.type === 'mentor'
                                  ? 'bg-blue-400'
                                  : 'bg-gray-400'
                            }`} />
                          )}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{contact.name}</p>
                          <p className="text-xs text-gray-500">
                            {contact.messageCount} messages · Last: {new Date(contact.lastMessageDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 flex justify-between items-center border-b border-gray-200">
                <h3 className="text-sm font-medium text-gray-500">Message Statistics</h3>
              </div>
              <div className="p-4">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-500">Total Messages</span>
                      <span className="font-medium text-gray-900">{messages.length}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-indigo-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-500">Reported Messages</span>
                      <span className="font-medium text-gray-900">{messages.filter(m => m.isReported).length}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full" 
                        style={{ width: `${(messages.filter(m => m.isReported).length / messages.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-500">Sent Messages</span>
                      <span className="font-medium text-gray-900">{messages.filter(m => m.senderId === userId).length}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${(messages.filter(m => m.senderId === userId).length / messages.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <button
                    onClick={exportMessages}
                    className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export Messages
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Message List */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <h2 className="text-lg font-medium text-gray-900 flex items-center">
                    <MessageSquare className="mr-2 text-indigo-500" size={20} />
                    Message History
                  </h2>
                  
                  <div className="flex flex-wrap gap-2">
                    {/* Search */}
                    <div className="relative">
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search messages..."
                        className="border border-gray-300 rounded-md pl-9 pr-4 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                    
                    {/* Filter Reported */}
                    <button
                      onClick={() => setFilterReported(!filterReported)}
                      className={`inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium ${
                        filterReported
                          ? 'bg-red-50 text-red-700 border-red-300'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <Flag className={`mr-2 h-4 w-4 ${filterReported ? 'text-red-500' : 'text-gray-400'}`} />
                      {filterReported ? 'All Messages' : 'Only Reported'}
                    </button>
                    
                    {/* Sort Direction */}
                    <button
                      onClick={toggleSortDirection}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 bg-white rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      <Calendar className="mr-2 h-4 w-4 text-gray-400" />
                      {sortDirection === 'desc' ? 'Newest First' : 'Oldest First'}
                    </button>
                  </div>
                </div>
              </div>
              
              {filteredMessages.length === 0 ? (
                <div className="p-8 text-center">
                  <AlertCircle size={48} className="mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">No messages found</h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    {searchTerm 
                      ? `No messages matching "${searchTerm}"`
                      : filterReported
                        ? "This user has no reported messages"
                        : "No messages available for this user"}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredMessages.map((message) => {
                    const isSender = message.senderId === userId;
                    return (
                      <div key={message._id} className={`p-4 hover:bg-gray-50 ${message.isReported ? 'bg-red-50' : ''}`}>
                        <div className="flex items-start">
                          <div className={`flex-shrink-0 ${isSender ? 'mr-4' : 'ml-auto order-last mr-0'}`}>
                            {isSender ? (
                              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500">
                                <User size={20} />
                              </div>
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                <User size={20} />
                              </div>
                            )}
                          </div>
                          
                          <div className={`flex-grow ${isSender ? '' : 'text-right pr-4'}`}>
                            <div className="flex items-center mb-1">
                              <span className="text-sm font-medium text-gray-900">
                                {isSender ? userData?.name || 'This User' : 'To: Contact'}
                              </span>
                              <span className="ml-2 text-xs text-gray-500">
                                {formatDateTime(message.createdAt)}
                              </span>
                              
                              {message.isReported && (
                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                  <Flag className="mr-1 h-3 w-3" />
                                  Reported
                                </span>
                              )}
                            </div>
                            
                            <div className="text-sm text-gray-500 mb-1">
                              {isSender 
                                ? `To: ${message.receiverId.substring(0, 8)}...` 
                                : `From: ${message.senderId.substring(0, 8)}...`}
                            </div>
                            
                            <div className={`inline-block px-4 py-2 rounded-lg max-w-lg text-sm ${
                              isSender 
                                ? 'bg-indigo-100 text-indigo-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {typeof message.message === 'string' 
                                ? highlightSearchTerm(message.message)
                                : message.message}
                            </div>
                            
                            {message.isReported && message.reportDetails && (
                              <div className="mt-2 p-3 rounded-lg bg-red-50 border border-red-100 text-sm">
                                <div className="flex items-center text-red-800 mb-1">
                                  <AlertTriangle className="mr-1 h-4 w-4" />
                                  <span className="font-medium">Report Details</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  <div>
                                    <span className="text-gray-500">Reason:</span>{' '}
                                    <span className="font-medium capitalize">{message.reportDetails.reason.replace(/_/g, ' ')}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Status:</span>{' '}
                                    <span className="font-medium capitalize">{message.reportDetails.status.replace(/_/g, ' ')}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Reported On:</span>{' '}
                                    <span>{new Date(message.reportDetails.reportedAt).toLocaleDateString()}</span>
                                  </div>
                                  {message.reportDetails.reviewedAt && (
                                    <div>
                                      <span className="text-gray-500">Reviewed On:</span>{' '}
                                      <span>{new Date(message.reportDetails.reviewedAt).toLocaleDateString()}</span>
                                    </div>
                                  )}
                                </div>
                                {message.reportDetails.additionalInfo && (
                                  <div className="mt-1 text-xs">
                                    <span className="text-gray-500">Additional Info:</span>{' '}
                                    <span className="italic">"{message.reportDetails.additionalInfo}"</span>
                                  </div>
                                )}
                              </div>
                            )}
                            
                            <div className="mt-2">
                              <button
                                onClick={() => navigate(`/moderator/conversation/${message.senderId}/${message.receiverId}`)}
                                className="inline-flex items-center text-xs text-indigo-600 hover:text-indigo-800"
                              >
                                <MessageSquare className="mr-1 h-3 w-3" />
                                View Conversation
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              
              {/* Pagination placeholder */}
              {filteredMessages.length > 0 && (
                <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                      Previous
                    </button>
                    <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing{' '}
                        <span className="font-medium">1</span>
                        {' '}to{' '}
                        <span className="font-medium">{filteredMessages.length}</span>
                        {' '}of{' '}
                        <span className="font-medium">{filteredMessages.length}</span>
                        {' '}results
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                          <span className="sr-only">Previous</span>
                          <ChevronDown className="h-5 w-5 rotate-90" />
                        </button>
                        <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                          1
                        </button>
                        <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                          <span className="sr-only">Next</span>
                          <ChevronDown className="h-5 w-5 -rotate-90" />
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserMessages;