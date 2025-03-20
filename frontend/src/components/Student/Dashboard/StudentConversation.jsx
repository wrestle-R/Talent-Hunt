import React, { useState, useEffect } from 'react';
import { MessageCircle, ChevronRight, GraduationCap, User, Users } from 'lucide-react';
import axios from 'axios';
import ChatModal from '../ChatModal';
import { Link } from 'react-router-dom';

const StudentConversation = ({ userData, limit = 3, isInDashboard = true }) => {
  const [conversations, setConversations] = useState([]);
  const [studentConversations, setStudentConversations] = useState([]);
  const [mentorConversations, setMentorConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeChatUser, setActiveChatUser] = useState(null);
  const [pollingInterval, setPollingInterval] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'students', 'mentors'

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
  const fetchConversations = async () => {
    if (!userData || !userData._id) {
      console.log("Missing student data, can't fetch conversations");
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
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
    } catch (err) {
      console.error("Error fetching conversations:", err);
      setError("Failed to load conversations.");
      setConversations([]);
      setMentorConversations([]);
      setStudentConversations([]);
    } finally {
      setIsLoading(false);
    }
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

  // Load fallback data for development/demo
  const loadFallbackData = () => {
    const sampleData = [
      {
        userId: 'sample1',
        name: 'Dr. Sarah Chen',
        profilePicture: 'https://via.placeholder.com/40?text=SC',
        userType: 'mentor',
        affiliation: 'Stanford University',
        lastMessage: 'Your project proposal looks promising. Let me know if you need more feedback.',
        lastMessageTime: new Date(Date.now() - 3600000).toISOString(),
        unreadCount: 2
      },
      {
        userId: 'sample2',
        name: 'Alex Johnson',
        profilePicture: 'https://via.placeholder.com/40?text=AJ',
        userType: 'student',
        affiliation: 'MIT',
        lastMessage: 'Hey, want to team up for the hackathon this weekend?',
        lastMessageTime: new Date(Date.now() - 7200000).toISOString(),
        unreadCount: 1
      },
      {
        userId: 'sample3',
        name: 'Prof. James Wilson',
        profilePicture: 'https://via.placeholder.com/40?text=JW',
        userType: 'mentor',
        affiliation: 'Google Research',
        lastMessage: 'Id be happy to review your resume next week.',
        lastMessageTime: new Date(Date.now() - 86400000).toISOString(),
        unreadCount: 0
      },
      {
        userId: 'sample4',
        name: 'Priya Sharma',
        profilePicture: 'https://via.placeholder.com/40?text=PS',
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
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <MessageCircle size={20} className="text-purple-600" />
            My Conversations
          </h3>
          <div className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full animate-pulse">
            Loading...
          </div>
        </div>
        <div className="space-y-4">
          {[...Array(limit)].map((_, index) => (
            <div key={index} className="animate-pulse flex justify-between items-center border-b pb-3">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-200 rounded-full mr-3"></div>
                <div>
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-40"></div>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <div className="h-3 bg-gray-200 rounded w-10 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
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
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <MessageCircle size={20} className="text-purple-600" />
            My Conversations
          </h3>
        </div>
        <div className="bg-red-50 p-4 rounded-lg text-center text-red-700">
          <p>{error}</p>
          <div className="flex justify-center mt-2 gap-2">
            <button 
              onClick={fetchConversations} 
              className="bg-purple-100 text-purple-700 px-3 py-1 rounded-lg text-sm hover:bg-purple-200"
            >
              Try Again
            </button>
            <button 
              onClick={loadFallbackData} 
              className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-sm hover:bg-gray-200"
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

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <MessageCircle size={20} className="text-purple-600" />
          My Conversations
        </h3>
        {hasAnyConversations && (
          <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
            {getUnreadCount(conversations)} Unread
          </span>
        )}
      </div>
      
      {/* Tabs for navigation */}
      <div className="flex border-b mb-4">
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'all'
              ? 'text-purple-700 border-b-2 border-purple-700'
              : 'text-gray-500 hover:text-purple-700'
          }`}
          onClick={() => setActiveTab('all')}
        >
          All
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'mentors'
              ? 'text-blue-700 border-b-2 border-blue-700'
              : 'text-gray-500 hover:text-blue-700'
          }`}
          onClick={() => setActiveTab('mentors')}
        >
          Mentors 
          {hasMentorConversations && getUnreadCount(mentorConversations) > 0 && (
            <span className="ml-1 bg-blue-100 text-blue-700 text-xs px-1.5 rounded-full">
              {getUnreadCount(mentorConversations)}
            </span>
          )}
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'students'
              ? 'text-emerald-700 border-b-2 border-emerald-700'
              : 'text-gray-500 hover:text-emerald-700'
          }`}
          onClick={() => setActiveTab('students')}
        >
          Students
          {hasStudentConversations && getUnreadCount(studentConversations) > 0 && (
            <span className="ml-1 bg-emerald-100 text-emerald-700 text-xs px-1.5 rounded-full">
              {getUnreadCount(studentConversations)}
            </span>
          )}
        </button>
      </div>
      
      {hasAnyConversations ? (
        <>
          {/* ALL TAB CONTENT */}
          {activeTab === 'all' && (
            <div className="space-y-6">
              {/* Mentor Section */}
              {hasMentorConversations && (
                <div>
                  <h4 className="font-medium text-blue-700 flex items-center gap-1 mb-2">
                    <GraduationCap size={16} />
                    Mentor Conversations
                  </h4>
                  <div className="space-y-3">
                    {mentorConversations.map(mentor => (
                      <div key={mentor.userId} className="flex items-center justify-between border-b pb-3">
                        <div className="flex items-center">
                          <div className="relative">
                            <img 
                              src={mentor.profilePicture || 'https://via.placeholder.com/40?text=👨‍🏫'} 
                              alt={mentor.name} 
                              className="w-10 h-10 rounded-full mr-3"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://via.placeholder.com/40?text=👨‍🏫';
                              }}
                            />
                            {mentor.unreadCount > 0 && (
                              <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                                {mentor.unreadCount}
                              </span>
                            )}
                            <span className="absolute -bottom-1 -right-1 bg-blue-500 text-white text-xs p-1 rounded-full">
                              <GraduationCap size={10} />
                            </span>
                          </div>
                          <div>
                            <div className="flex items-center">
                              <p className="font-medium">{mentor.name}</p>
                              <span className="ml-2 text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">
                                Mentor
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <p className="text-xs text-gray-500">
                                {mentor.affiliation}
                              </p>
                              <p className="text-sm text-gray-600 truncate max-w-[200px]">
                                {mentor.lastMessage}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-xs text-gray-500">{formatTimeAgo(mentor.lastMessageTime)}</span>
                          <button 
                            className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-sm mt-1 hover:bg-blue-200 transition-colors"
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
                  <h4 className="font-medium text-emerald-700 flex items-center gap-1 mb-2">
                    <Users size={16} />
                    Student Conversations
                  </h4>
                  <div className="space-y-3">
                    {studentConversations.map(student => (
                      <div key={student.userId} className="flex items-center justify-between border-b pb-3">
                        <div className="flex items-center">
                          <div className="relative">
                            <img 
                              src={student.profilePicture || 'https://via.placeholder.com/40?text=👤'} 
                              alt={student.name} 
                              className="w-10 h-10 rounded-full mr-3"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://via.placeholder.com/40?text=👤';
                              }}
                            />
                            {student.unreadCount > 0 && (
                              <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                                {student.unreadCount}
                              </span>
                            )}
                            <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white text-xs p-1 rounded-full">
                              <User size={10} />
                            </span>
                          </div>
                          <div>
                            <div className="flex items-center">
                              <p className="font-medium">{student.name}</p>
                              <span className="ml-2 text-xs bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded">
                                Student
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <p className="text-xs text-gray-500">
                                {student.affiliation}
                              </p>
                              <p className="text-sm text-gray-600 truncate max-w-[200px]">
                                {student.lastMessage}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-xs text-gray-500">{formatTimeAgo(student.lastMessageTime)}</span>
                          <button 
                            className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg text-sm mt-1 hover:bg-emerald-200 transition-colors"
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
          )}
          
          {/* MENTORS TAB CONTENT */}
          {activeTab === 'mentors' && (
            <div className="space-y-3">
              {hasMentorConversations ? (
                mentorConversations.map(mentor => (
                  <div key={mentor.userId} className="flex items-center justify-between border-b pb-3">
                    <div className="flex items-center">
                      <div className="relative">
                        <img 
                          src={mentor.profilePicture || 'https://via.placeholder.com/40?text=👨‍🏫'} 
                          alt={mentor.name} 
                          className="w-10 h-10 rounded-full mr-3"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/40?text=👨‍🏫';
                          }}
                        />
                        {mentor.unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                            {mentor.unreadCount}
                          </span>
                        )}
                        <span className="absolute -bottom-1 -right-1 bg-blue-500 text-white text-xs p-1 rounded-full">
                          <GraduationCap size={10} />
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center">
                          <p className="font-medium">{mentor.name}</p>
                          <span className="ml-2 text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">
                            Mentor
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <p className="text-xs text-gray-500">
                            {mentor.affiliation}
                          </p>
                          <p className="text-sm text-gray-600 truncate max-w-[200px]">
                            {mentor.lastMessage}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-xs text-gray-500">{formatTimeAgo(mentor.lastMessageTime)}</span>
                      <button 
                        className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-sm mt-1 hover:bg-blue-200 transition-colors"
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
                ))
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <GraduationCap size={32} className="mx-auto text-gray-300 mb-3" />
                  <h4 className="text-lg font-medium text-gray-500 mb-1">No mentor conversations yet</h4>
                  <p className="text-gray-400 text-sm">
                    Connect with mentors to get guidance on your projects and career
                  </p>
                  <Link 
                    to="/student/mentors"
                    className="mt-4 inline-block bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-sm hover:bg-blue-200"
                  >
                    Find Mentors
                  </Link>
                </div>
              )}
            </div>
          )}
          
          {/* STUDENTS TAB CONTENT */}
          {activeTab === 'students' && (
            <div className="space-y-3">
              {hasStudentConversations ? (
                studentConversations.map(student => (
                  <div key={student.userId} className="flex items-center justify-between border-b pb-3">
                    <div className="flex items-center">
                      <div className="relative">
                        <img 
                          src={student.profilePicture || 'https://via.placeholder.com/40?text=👤'} 
                          alt={student.name} 
                          className="w-10 h-10 rounded-full mr-3"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/40?text=👤';
                          }}
                        />
                        {student.unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                            {student.unreadCount}
                          </span>
                        )}
                        <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white text-xs p-1 rounded-full">
                          <User size={10} />
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center">
                          <p className="font-medium">{student.name}</p>
                          <span className="ml-2 text-xs bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded">
                            Student
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <p className="text-xs text-gray-500">
                            {student.affiliation}
                          </p>
                          <p className="text-sm text-gray-600 truncate max-w-[200px]">
                            {student.lastMessage}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-xs text-gray-500">{formatTimeAgo(student.lastMessageTime)}</span>
                      <button 
                        className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg text-sm mt-1 hover:bg-emerald-200 transition-colors"
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
                ))
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <Users size={32} className="mx-auto text-gray-300 mb-3" />
                  <h4 className="text-lg font-medium text-gray-500 mb-1">No student conversations yet</h4>
                  <p className="text-gray-400 text-sm">
                    Connect with other students to collaborate on projects
                  </p>
                  <Link 
                    to="/student/teammates"
                    className="mt-4 inline-block bg-emerald-100 text-emerald-700 px-4 py-2 rounded-lg text-sm hover:bg-emerald-200"
                  >
                    Find Teammates
                  </Link>
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="text-center text-gray-500 py-8">
          <MessageCircle size={32} className="mx-auto text-gray-300 mb-3" />
          <h4 className="text-lg font-medium text-gray-500 mb-1">No conversations yet</h4>
          <p className="text-gray-400 text-sm">
            Start messaging mentors and teammates to see them here
          </p>
          <div className="flex justify-center gap-3 mt-4">
            <Link 
              to="/student/mentors"
              className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-sm hover:bg-blue-200"
            >
              Find Mentors
            </Link>
            <Link 
              to="/student/teammates"
              className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-lg text-sm hover:bg-emerald-200"
            >
              Find Teammates
            </Link>
          </div>
        </div>
      )}
      
      {isInDashboard && hasAnyConversations && (
        <div className="mt-4 flex justify-between">
          {hasMentorConversations && (
            <Link 
              to="/student/mentors"
              className="text-blue-600 text-sm font-medium hover:text-blue-800 flex items-center"
            >
              View All Mentors <ChevronRight size={16} />
            </Link>
          )}
          {hasStudentConversations && (
            <Link 
              to="/student/teammates"
              className="text-emerald-600 text-sm font-medium hover:text-emerald-800 flex items-center"
            >
              View All Teammates <ChevronRight size={16} />
            </Link>
          )}
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