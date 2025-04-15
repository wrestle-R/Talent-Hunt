import React, { useState, useEffect } from 'react';
import { MessageCircle, ChevronRight, GraduationCap, User, Users, RefreshCw } from 'lucide-react';
import axios from 'axios';
import ChatModal from '../ChatModal';
import { Link, useNavigate } from 'react-router-dom';

const StudentConversation = ({ userData, limit = 2, isInDashboard = true }) => {
  const [conversations, setConversations] = useState([]);
  const [studentConversations, setStudentConversations] = useState([]);
  const [mentorConversations, setMentorConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeChatUser, setActiveChatUser] = useState(null);
  const [pollingInterval, setPollingInterval] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'students', 'mentors'
  const navigate = useNavigate();

  // Helper to format time ago
  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'Just now';
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    
    return date.toLocaleDateString();
  };

  // Function to fetch conversations
  const fetchConversations = async (refresh = false) => {
    if (!userData || !userData._id) {
      console.log("Missing student data, can't fetch conversations");
      setIsLoading(false);
      return;
    }
    
    try {
      if (refresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      
      const response = await axios.get(`http://localhost:4000/api/student/conversations/${userData._id}`);
      
      if (Array.isArray(response.data)) {
        // Save all conversations
        setConversations(response.data);
        
        // Separate conversations by user type
        const mentors = response.data.filter(conv => conv.userType === 'mentor');
        const students = response.data.filter(conv => conv.userType === 'student');
        
        // If in dashboard, limit the number of conversations shown in each section
        setMentorConversations(isInDashboard ? mentors.slice(0, limit) : mentors);
        setStudentConversations(isInDashboard ? students.slice(0, limit) : students);
      } else {
        console.warn("Unexpected conversations response format:", response.data);
        setConversations([]);
        setMentorConversations([]);
        setStudentConversations([]);
      }
      setError(null);
      
      // Simulate a brief loading state for refresh
      if (refresh) {
        setTimeout(() => {
          setIsRefreshing(false);
        }, 1000);
      } else {
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Error fetching conversations:", err);
      setError("Failed to load conversations.");
      setConversations([]);
      setMentorConversations([]);
      setStudentConversations([]);
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Handle refreshing conversations
  const handleRefresh = () => {
    fetchConversations(true);
  };

  // Handle opening chat with a user
  const handleOpenChat = (user) => {
    setActiveChatUser(user);
    setIsChatOpen(true);
    
    // Mark messages as read when opening chat
    if (user && user._id && userData && userData._id) {
      try {
        axios.put(`http://localhost:4000/api/student/messages/read/${userData._id}/${user._id}`);
      } catch (err) {
        console.error("Error marking messages as read:", err);
      }
    }
  };

  // Handle closing chat
  const handleCloseChat = () => {
    setIsChatOpen(false);
    setActiveChatUser(null);
    
    // Refresh conversations after closing chat to update unread counts
    fetchConversations();
  };

  // Navigate to all conversations page
  const handleViewAll = () => {
    navigate('/student/conversations');
  };

  // Load fallback data for development/demo
  const loadFallbackData = () => {
    const sampleData = [
      {
        userId: 'sample1',
        name: 'Dr. Sarah Chen',
        profilePicture: '/images/avatars/mentor-1.png',
        userType: 'mentor',
        affiliation: 'Stanford University',
        lastMessage: 'Your project proposal looks promising. Let me know if you need more feedback.',
        lastMessageTime: new Date(Date.now() - 3600000).toISOString(),
        unreadCount: 2
      },
      {
        userId: 'sample2',
        name: 'Alex Johnson',
        profilePicture: '/images/avatars/student-1.png',
        userType: 'student',
        affiliation: 'MIT',
        lastMessage: 'Hey, want to team up for the hackathon this weekend?',
        lastMessageTime: new Date(Date.now() - 7200000).toISOString(),
        unreadCount: 1
      },
      {
        userId: 'sample3',
        name: 'Prof. James Wilson',
        profilePicture: '/images/avatars/mentor-2.png',
        userType: 'mentor',
        affiliation: 'Google Research',
        lastMessage: 'Id be happy to review your resume next week.',
        lastMessageTime: new Date(Date.now() - 86400000).toISOString(),
        unreadCount: 0
      },
      {
        userId: 'sample4',
        name: 'Priya Sharma',
        profilePicture: '/images/avatars/student-2.png',
        userType: 'student',
        affiliation: 'UC Berkeley',
        lastMessage: 'Thanks for sharing the resources!',
        lastMessageTime: new Date(Date.now() - 172800000).toISOString(),
        unreadCount: 0
      }
    ];
    
    setConversations(sampleData);
    setMentorConversations(sampleData.filter(conv => conv.userType === 'mentor').slice(0, limit));
    setStudentConversations(sampleData.filter(conv => conv.userType === 'student').slice(0, limit));
    setIsLoading(false);
    setError(null);
  };

  // Set up polling for conversations
  useEffect(() => {
    if (userData && userData._id) {
      // Fetch conversations immediately
      fetchConversations();
      
      // Set up polling every 5 minutes (300000 ms)
      const interval = setInterval(fetchConversations, 300000);
      setPollingInterval(interval);
      
      // Clean up interval on unmount
      return () => {
        if (pollingInterval) clearInterval(pollingInterval);
      };
    }
  }, [userData]);

  // Function to get unread count by type
  const getUnreadCount = (conversations) => {
    return conversations.reduce((total, conv) => total + (conv.unreadCount || 0), 0);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-[#1A1A1A] rounded-xl shadow-lg p-6 border border-gray-800 hover:border-[#E8C848]/30 transition-all duration-300">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg flex items-center gap-2 text-white">
            <MessageCircle size={20} className="text-[#E8C848]" />
            My Conversations
          </h3>
          <div className="bg-[#E8C848]/10 text-[#E8C848] text-xs px-2 py-1 rounded-full animate-pulse">
            Loading...
          </div>
        </div>
        <div className="space-y-4">
          {[...Array(limit)].map((_, index) => (
            <div key={index} className="animate-pulse flex justify-between items-center border-b border-gray-800 pb-3">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-[#121212] rounded-full mr-3"></div>
                <div>
                  <div className="h-4 bg-[#121212] rounded w-24 mb-2"></div>
                  <div className="h-3 bg-[#121212] rounded w-40"></div>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <div className="h-3 bg-[#121212] rounded w-10 mb-2"></div>
                <div className="h-6 bg-[#121212] rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-[#1A1A1A] rounded-xl shadow-lg p-6 border border-gray-800 hover:border-[#E8C848]/30 transition-all duration-300">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg flex items-center gap-2 text-white">
            <MessageCircle size={20} className="text-[#E8C848]" />
            My Conversations
          </h3>
        </div>
        <div className="bg-red-900 p-4 rounded-lg text-center text-red-400">
          <p>{error}</p>
          <div className="flex justify-center mt-2 gap-2">
            <button 
              onClick={fetchConversations} 
              className="bg-[#E8C848]/10 text-[#E8C848] px-3 py-1 rounded-lg text-sm hover:bg-[#E8C848]/20 transition-all duration-300"
            >
              Try Again
            </button>
            <button 
              onClick={loadFallbackData} 
              className="bg-gray-800 text-gray-400 px-3 py-1 rounded-lg text-sm hover:bg-gray-700 transition-all duration-300"
            >
              Load Sample Data
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Determine if we have any conversations to show
  const hasMentorConversations = mentorConversations.length > 0;
  const hasStudentConversations = studentConversations.length > 0;
  const hasAnyConversations = hasMentorConversations || hasStudentConversations;

  // Dashboard view (limit to 2 of each type)
  return (
    <div className="bg-[#1A1A1A] rounded-xl shadow-lg p-6 border border-gray-800 hover:border-[#E8C848]/30 transition-all duration-300">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg flex items-center gap-2 text-white">
          <MessageCircle size={20} className="text-[#E8C848]" />
          My Conversations
        </h3>
        {hasAnyConversations && (
          <div className="flex items-center gap-2">
            <span className="bg-[#E8C848]/10 text-[#E8C848] text-xs px-2 py-1 rounded-full">
              {getUnreadCount(conversations)} Unread
            </span>
            <button 
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm ${
                isRefreshing 
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  : 'bg-[#E8C848]/10 text-[#E8C848] hover:bg-[#E8C848]/20'
              } transition-all duration-300`}
            >
              <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        )}
      </div>
      
      {isRefreshing ? (
        <div className="space-y-4">
          {[...Array(limit)].map((_, index) => (
            <div key={index} className="animate-pulse flex justify-between items-center border-b border-gray-800 pb-3">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-[#121212] rounded-full mr-3"></div>
                <div>
                  <div className="h-4 bg-[#121212] rounded w-24 mb-2"></div>
                  <div className="h-3 bg-[#121212] rounded w-40"></div>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <div className="h-3 bg-[#121212] rounded w-10 mb-2"></div>
                <div className="h-6 bg-[#121212] rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      ) : hasAnyConversations ? (
        <div className="space-y-6">
          {/* Mentor Section */}
          {hasMentorConversations && (
            <div>
              <h4 className="font-medium text-[#E8C848] flex items-center gap-1 mb-2">
                <GraduationCap size={16} />
                Mentor Conversations
              </h4>
              <div className="space-y-3">
                {mentorConversations.map(mentor => (
                  <div key={mentor.userId} className="flex items-center justify-between border-b border-gray-800 pb-3">
                    <div className="flex items-center">
                      <div className="relative">
                        <img 
                          src={mentor.profilePicture || '/images/avatars/default-mentor.png'} 
                          alt={mentor.name} 
                          className="w-10 h-10 rounded-full mr-3"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/images/avatars/default-mentor.png';
                          }}
                        />
                        {mentor.unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 bg-[#E8C848] text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                            {mentor.unreadCount}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center">
                          <p className="font-medium text-white">{mentor.name}</p>
                          <span className="ml-2 text-xs bg-[#E8C848]/10 text-[#E8C848] px-1.5 py-0.5 rounded">
                            Mentor
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <p className="text-xs text-gray-400">
                            {mentor.affiliation}
                          </p>
                          <p className="text-sm text-gray-300 truncate max-w-[200px]">
                            {mentor.lastMessage}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-xs text-gray-400">{formatTimeAgo(mentor.lastMessageTime)}</span>
                      <button 
                        className="bg-[#E8C848]/10 text-[#E8C848] px-3 py-1 rounded-lg text-sm mt-1 hover:bg-[#E8C848]/20 transition-all duration-300"
                        onClick={() => handleOpenChat({
                          _id: mentor.userId,
                          name: mentor.name,
                          email: mentor.email,
                          profilePicture: mentor.profilePicture,
                          organization: mentor.affiliation,
                          userType: 'mentor'
                        })}
                      >
                        Message
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Student Section */}
          {hasStudentConversations && (
            <div>
              <h4 className="font-medium text-[#E8C848] flex items-center gap-1 mb-2">
                <Users size={16} />
                Student Conversations
              </h4>
              <div className="space-y-3">
                {studentConversations.map(student => (
                  <div key={student.userId} className="flex items-center justify-between border-b border-gray-800 pb-3">
                    <div className="flex items-center">
                      <div className="relative">
                        <img 
                          src={student.profilePicture || '/images/avatars/default-student.png'} 
                          alt={student.name} 
                          className="w-10 h-10 rounded-full mr-3"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/images/avatars/default-student.png';
                          }}
                        />
                        {student.unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 bg-[#E8C848] text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                            {student.unreadCount}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center">
                          <p className="font-medium text-white">{student.name}</p>
                          <span className="ml-2 text-xs bg-[#E8C848]/10 text-[#E8C848] px-1.5 py-0.5 rounded">
                            Student
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <p className="text-xs text-gray-400">
                            {student.affiliation}
                          </p>
                          <p className="text-sm text-gray-300 truncate max-w-[200px]">
                            {student.lastMessage}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-xs text-gray-400">{formatTimeAgo(student.lastMessageTime)}</span>
                      <button 
                        className="bg-[#E8C848]/10 text-[#E8C848] px-3 py-1 rounded-lg text-sm mt-1 hover:bg-[#E8C848]/20 transition-all duration-300"
                        onClick={() => handleOpenChat({
                          _id: student.userId,
                          name: student.name,
                          email: student.email,
                          profilePicture: student.profilePicture,
                          education: { institution: student.affiliation },
                          userType: 'student'
                        })}
                      >
                        Message
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center text-gray-400 py-8">
          <MessageCircle size={32} className="mx-auto text-gray-600 mb-3" />
          <h4 className="text-lg font-medium text-gray-400 mb-1">No conversations yet</h4>
          <p className="text-gray-500 text-sm">
            Start messaging mentors and teammates to see them here
          </p>
          <div className="flex justify-center gap-3 mt-4">
            <Link 
              to="/student/mentors"
              className="bg-[#E8C848]/10 text-[#E8C848] px-4 py-2 rounded-lg text-sm hover:bg-[#E8C848]/20 transition-all duration-300"
            >
              Find Mentors
            </Link>
            <Link 
              to="/student/teammates"
              className="bg-[#E8C848]/10 text-[#E8C848] px-4 py-2 rounded-lg text-sm hover:bg-[#E8C848]/20 transition-all duration-300"
            >
              Find Teammates
            </Link>
          </div>
        </div>
      )}
      
      {/* View All Conversations Button */}
      {hasAnyConversations && (
        <div className="mt-4 flex justify-center">
          <button
            onClick={handleViewAll}
            className="bg-[#E8C848]/10 text-[#E8C848] px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#E8C848]/20 transition-all duration-300 flex items-center gap-1"
          >
            View All Conversations <ChevronRight size={16} />
          </button>
        </div>
      )}
      
      {/* Chat Modal */}
      <ChatModal 
        isOpen={isChatOpen} 
        onClose={handleCloseChat} 
        user={activeChatUser} 
        currentUser={userData}
      />
    </div>
  );
};

export default StudentConversation;