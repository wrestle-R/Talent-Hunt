import React, { useState, useEffect } from 'react';
import { Users, ChevronRight, MessageCircle, Search, Filter, User, BookOpen, MapPin, 
  Briefcase, Code, X, Send, Paperclip, ChevronLeft, Calendar, Award, Clock } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../../../context/UserContext';
import ChatModal from '../ChatModal';
import StudentPlaceholder from "../../../public/student_placeholder.png";

const DisplayTeammates = ({ userData: propUserData, isFullPage = false, isRecommendations = false }) => {
  const navigate = useNavigate();
  const { userData: contextUserData } = useUser();
  const userData = propUserData || contextUserData;

  const [teammates, setTeammates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [purposeFilter, setPurposeFilter] = useState('all');
  
  // Chat modal state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeChatUser, setActiveChatUser] = useState(null);
  
  // Function to handle opening teammate profile
  const handleViewProfile = (teammateId) => {
    navigate(`/student/teammate/${teammateId}`);
  };

  // Function to handle opening chat
  const handleOpenChat = (teammate) => {
    console.log("Opening chat with teammate:", teammate);
    if (teammate && teammate._id) {
      setActiveChatUser(teammate);
      setIsChatOpen(true);
    } else {
      console.error("Cannot open chat: teammate is missing _id", teammate);
    }
  };

  // Function to handle closing chat
  const handleCloseChat = () => {
    setIsChatOpen(false);
    setActiveChatUser(null);
  };

  useEffect(() => {
    const fetchTeammates = async () => {
      try {
        setLoading(true);
        
        // Get current user from localStorage
        const currentUser = JSON.parse(localStorage.getItem("user")) || {};
        
        // Get user ID and email
        const uid = userData?.firebaseUID || currentUser?.uid || '';
        
        // Build query parameters
        let queryParams = new URLSearchParams();
        
        if (purposeFilter !== 'all') {
          queryParams.append('purpose', purposeFilter);
        }
        
        if (skillFilter) {
          queryParams.append('skills', skillFilter);
        }
        
        // Determine which endpoint to use
        let endpoint;
        if (isRecommendations) {
          endpoint = `http://localhost:4000/api/student/recommended-teammates/${uid}`;
        } else {
          endpoint = `http://localhost:4000/api/student/teammates/${uid}`;
        }
        
        // Add query parameters to endpoint if any exist
        if (queryParams.toString()) {
          endpoint += `?${queryParams.toString()}`;
        }
        
        const response = await axios.get(endpoint);
        console.log(response)
        // Process the response based on its structure
        if (response.data && response.data.success && Array.isArray(response.data.teammates)) {
          setTeammates(response.data.teammates);
        } else {
          console.warn("Unexpected response format:", response.data);
          setTeammates([]);
        }
      } catch (err) {
        console.error("Error fetching teammates:", err);
        setError(`Failed to load teammates: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTeammates();
  }, [userData, isRecommendations, purposeFilter, skillFilter]);
  
  // Filter teammates based on search term
  const filteredTeammates = teammates.filter(teammate => {
    const matchesSearch = searchTerm === '' || 
      teammate.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teammate.education?.institution?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teammate.education?.degree?.toLowerCase().includes(searchTerm.toLowerCase());
      
    return matchesSearch;
  });

  // Helper function to get purpose icon and color
  // Update the getPurposeDisplay function in your DisplayTeammates component
// Update the getPurposeDisplay function in your DisplayTeammates component
const getPurposeDisplay = (purpose) => {
  switch(purpose) {
    case 'Project':
      return {
        icon: <Code size={12} className="mr-1 text-indigo-500" />,
        text: 'Looking for project teammates',
        bgColor: 'bg-indigo-50',
        textColor: 'text-indigo-700'
      };
    case 'Hackathon':
      return {
        icon: <Calendar size={12} className="mr-1 text-purple-500" />,
        text: 'Looking for hackathon team',
        bgColor: 'bg-purple-50',
        textColor: 'text-purple-700'
      };
    case 'Both':
      return {
        icon: <Users size={12} className="mr-1 text-emerald-500" />,
        text: 'Open to Projects & Hackathons',
        bgColor: 'bg-emerald-50',
        textColor: 'text-emerald-700'
      };
    default:
      return {
        icon: <User size={12} className="mr-1 text-gray-500" />,
        text: 'Looking for teammates',
        bgColor: 'bg-gray-50',
        textColor: 'text-gray-700'
      };
  }
  };
  // Handle loading state
  if (loading) {
    return (
      <div className={`bg-white rounded-xl shadow-md p-6 ${isFullPage ? 'min-h-[600px]' : ''}`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Users className="text-emerald-600" />
            {isRecommendations ? 'Team Suggestions' : 'Available Teammates'}
          </h3>
        </div>
        <div className="flex justify-center items-center h-40">
          <div className="animate-pulse flex flex-col items-center">
            <div className="rounded-full bg-gray-200 h-12 w-12 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-32"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error && teammates.length === 0) {
    return (
      <div className={`bg-white rounded-xl shadow-md p-6 ${isFullPage ? 'min-h-[600px]' : ''}`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Users className="text-emerald-600" />
            {isRecommendations ? 'Team Suggestions' : 'Available Teammates'}
          </h3>
        </div>
        <div className="flex justify-center items-center h-40">
          <div className="text-center text-gray-500">
            <p className="mb-2">Failed to load teammate suggestions.</p>
            <p className="text-xs mb-3 text-red-500">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg text-sm"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isFullPage ? 'bg-white rounded-xl shadow-md p-6 min-h-[600px]' : ''} relative`}>
      {isFullPage && (
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Users className="text-emerald-600" />
            Available Teammates
          </h3>
        </div>
      )}
      
      {/* Search and filters - only shown in full page view */}
      {isFullPage && (
        <div className="mb-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or institution..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative w-full md:w-64">
              <Filter size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Filter by skills..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={skillFilter}
                onChange={(e) => setSkillFilter(e.target.value)}
              />
            </div>
          </div>
          
          {/* Purpose filter buttons */}
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => setPurposeFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                purposeFilter === 'all' 
                  ? 'bg-emerald-100 text-emerald-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button 
              onClick={() => setPurposeFilter('Project')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center ${
                purposeFilter === 'Project' 
                  ? 'bg-indigo-100 text-indigo-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Code size={14} className="mr-1" /> 
              Projects
            </button>
            <button 
              onClick={() => setPurposeFilter('Hackathon')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center ${
                purposeFilter === 'Hackathon' 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Calendar size={14} className="mr-1" /> 
              Hackathons
            </button>
            <button 
              onClick={() => setPurposeFilter('Both')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center ${
                purposeFilter === 'Both' 
                  ? 'bg-emerald-100 text-emerald-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Users size={14} className="mr-1" /> 
              Both
            </button>
          </div>
        </div>
      )}
      
      {/* Teammates list - in a row for recommendations, grid for full page */}
      {filteredTeammates.length > 0 ? (
        <div className={`${isRecommendations 
          ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4' 
          : isFullPage 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' 
            : 'grid grid-cols-1 md:grid-cols-2 gap-4'
        }`}>
          {filteredTeammates
            .filter(teammate => {
              if (purposeFilter === 'all') return true;
              return teammate.lookingFor?.purpose === purposeFilter;
            })
            .slice(0, isRecommendations ? 4 : undefined)
            .map(teammate => {
              const purposeDisplay = getPurposeDisplay(teammate.lookingFor?.purpose);
              
              return (
                <div 
                  key={teammate._id} 
                  className="flex flex-col bg-gray-50 rounded-lg border border-gray-200 overflow-hidden h-[300px] hover:shadow-md cursor-pointer transition-shadow"
                  onClick={() => handleViewProfile(teammate._id)}
                >
                  <div className="p-4 flex items-start space-x-3 flex-1">
                    <img 
                      src={teammate.profile_picture || StudentPlaceholder} 
                      alt={teammate.name} 
                      className="w-16 h-16 rounded-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/64?text=👤';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800">{teammate.name}</p>
                      <p className="text-sm text-gray-500 truncate">
                        {teammate.education?.institution || 'Student'}
                      </p>
                      
                      {/* What they're looking for */}
                      <div className={`flex items-center ${purposeDisplay.bgColor} ${purposeDisplay.textColor} text-xs px-2 py-0.5 rounded-full mt-2 w-fit`}>
                        {purposeDisplay.icon}
                        <span>{purposeDisplay.text}</span>
                      </div>

                      {/* Additional badges for "Both" type */}
                      {teammate.lookingFor?.purpose === 'Both' && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          <span className="bg-indigo-50 text-indigo-700 text-xs px-2 py-0.5 rounded-full flex items-center">
                            <Code size={12} className="mr-1" /> Projects
                          </span>
                          <span className="bg-purple-50 text-purple-700 text-xs px-2 py-0.5 rounded-full flex items-center">
                            <Calendar size={12} className="mr-1" /> Hackathons
                          </span>
                        </div>
                      )}
                      
                      {/* Urgency indicator if they have one */}
                      {teammate.lookingFor?.urgencyLevel && (
                        <div className={`flex items-center mt-2 text-xs ${
                          teammate.lookingFor.urgencyLevel === 'High' 
                            ? 'text-red-600' 
                            : teammate.lookingFor.urgencyLevel === 'Medium'
                              ? 'text-orange-600'
                              : 'text-blue-600'
                        }`}>
                          <Clock size={12} className="mr-1" />
                          <span>
                            {teammate.lookingFor.urgencyLevel === 'High' 
                              ? 'Urgent - needs teammates soon'
                              : teammate.lookingFor.urgencyLevel === 'Medium'
                                ? 'Looking for teammates soon'
                                : 'No rush - open to collaborate'
                            }
                          </span>
                        </div>
                      )}
                      
                      {Array.isArray(teammate.skills) && teammate.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {teammate.skills.slice(0, 3).map((skill, i) => (
                            <span key={i} className="bg-emerald-50 text-emerald-700 text-xs px-2 py-0.5 rounded-full">
                              {skill}
                            </span>
                          ))}
                          {teammate.skills.length > 3 && (
                            <span className="text-xs text-gray-500">+{teammate.skills.length - 3} more</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-4 border-t border-gray-200 bg-gray-50">
                    {/* Desired skills */}
                    {teammate.lookingFor?.desiredSkills && teammate.lookingFor.desiredSkills.length > 0 && (
                      <div className="flex items-start mt-1 text-xs text-gray-600 mb-2">
                        <Award size={12} className="mr-1 mt-0.5 flex-shrink-0" />
                        <span>
                          <span className="font-medium">Looking for: </span>
                          {teammate.lookingFor.desiredSkills.slice(0, 3).join(', ')}
                          {teammate.lookingFor.desiredSkills.length > 3 && ' + more'}
                        </span>
                      </div>
                    )}
                    
                    {/* Location */}
                    {teammate.location && (
                      <div className="flex items-center mt-1 text-xs text-gray-600 mb-2">
                        <MapPin size={12} className="mr-1" />
                        <span>{typeof teammate.location === 'string' ? teammate.location : `${teammate.location.city || ''} ${teammate.location.country || ''}`}</span>
                      </div>
                    )}
                    
                    <div className="flex gap-2 mt-2" onClick={e => e.stopPropagation()}>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenChat(teammate);
                        }} 
                        className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-sm flex items-center flex-1 justify-center hover:bg-gray-200"
                      >
                        <MessageCircle size={14} className="mr-1" /> Chat
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewProfile(teammate._id);
                        }}
                        className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg text-sm flex-1 hover:bg-emerald-200"
                      >
                        View Profile
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      ) : (
        <div className="text-center py-10">
          <User size={48} className="mx-auto text-gray-300 mb-3" />
          <h4 className="text-lg font-medium text-gray-500 mb-1">No teammates found</h4>
          <p className="text-gray-400 text-sm">
            {isFullPage 
              ? purposeFilter !== 'all'
                ? purposeFilter === 'Both'
                  ? "No one is currently looking for both project and hackathon teammates."
                  : `No one is currently looking for ${purposeFilter.toLowerCase()} teammates.`
                : "Try adjusting your search or filter criteria."
              : "We're adding more teammate suggestions soon."}
          </p>
        </div>
      )}
      
      {/* Pagination or more teammates button - only in full page view */}
      {isFullPage && filteredTeammates.length > 8 && (
        <div className="mt-6 flex justify-center">
          <button className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-100 transition-colors">
            Load More Teammates
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

export default DisplayTeammates;