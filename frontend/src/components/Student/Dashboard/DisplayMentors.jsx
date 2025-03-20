import React, { useState, useEffect } from 'react';
import { Briefcase, ChevronRight, MessageCircle, Search, Filter, User, Star, MapPin, GraduationCap } from 'lucide-react';
import axios from 'axios';
import { useUser } from '../../../../context/UserContext';
import ChatModal from '../ChatModal';

// This component can be used in both dashboard and full page view
const DisplayMentors = ({ userData: propUserData, isFullPage = false, isRecommendations = false }) => {
  // Use userData from props if provided, otherwise use context
  const { userData: contextUserData } = useUser();
  const userData = propUserData || contextUserData;

  const [mentors, setMentors] = useState([]);  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expertiseFilter, setExpertiseFilter] = useState('');
  
  // Chat modal state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeChatUser, setActiveChatUser] = useState(null);

  // Function to handle opening chat
  const handleOpenChat = (mentor) => {
    console.log("Opening chat with mentor:", mentor);
    // Ensure mentor has _id field
    if (mentor && mentor._id) {
      setActiveChatUser(mentor);
      setIsChatOpen(true);
    } else {
      console.error("Cannot open chat: mentor is missing _id", mentor);
    }
  };

  // Function to handle closing chat
  const handleCloseChat = () => {
    setIsChatOpen(false);
    setActiveChatUser(null);
  };

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        setLoading(true);
        
        // Get current user from localStorage
        const currentUser = JSON.parse(localStorage.getItem("user")) || {};
        
        // Get user ID
        const uid = userData?.firebaseUID || currentUser?.uid || '';
        
        let response;
        
        if (isRecommendations) {
          // Fetch recommended mentors for dashboard
          response = await axios.get(`http://localhost:4000/api/student/recommended-mentors/${uid}`);
          if (response.data && Array.isArray(response.data)) {
            setMentors(response.data);
          } else if (response.data && Array.isArray(response.data.mentors)) {
            setMentors(response.data.mentors);
          } else {
            setMentors([]);
          }
          console.log(response);
        } else {
          // Fetch all mentors for full page view
          response = await axios.get(`http://localhost:4000/api/student/mentors`);
          
          if (response.data && Array.isArray(response.data.mentors)) {
            setMentors(response.data.mentors);
          } else if (response.data && Array.isArray(response.data)) {
            setMentors(response.data);
          } else {
            setMentors([]);
          }
          console.log(response);

        }
      } catch (err) {
        console.error("Error fetching mentors:", err);
        setError(`API request failed: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMentors();
  }, [userData, isRecommendations]);
  
  // Filter mentors based on search term and expertise filter
  const filteredMentors = mentors.filter(mentor => {
    const matchesSearch = searchTerm === '' || 
      mentor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.organization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.bio?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesExpertise = expertiseFilter === '' ||
      (Array.isArray(mentor.expertise) && 
        mentor.expertise.some(skill => 
          skill.toLowerCase().includes(expertiseFilter.toLowerCase())
        ));
      
    return matchesSearch && matchesExpertise;
  });

  // Handle loading state
  if (loading) {
    return (
      <div className={`bg-white rounded-xl shadow-md p-6 ${isFullPage ? 'min-h-[600px]' : ''}`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Briefcase className="text-indigo-600" />
            {isRecommendations ? 'Mentor Suggestions' : 'All Mentors'}
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

  if (error && mentors.length === 0) {
    return (
      <div className={`bg-white rounded-xl shadow-md p-6 ${isFullPage ? 'min-h-[600px]' : ''}`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Briefcase className="text-indigo-600" />
            {isRecommendations ? 'Mentor Suggestions' : 'All Mentors'}
          </h3>
        </div>
        <div className="flex justify-center items-center h-40">
          <div className="text-center text-gray-500">
            <p className="mb-2">Failed to load mentor suggestions.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg text-sm"
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
            <Briefcase className="text-indigo-600" />
            All Mentors
          </h3>
        </div>
      )}
      
      {/* Search and filters - only shown in full page view */}
      {isFullPage && (
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or organization..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative w-full md:w-64">
            <Filter size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Filter by expertise..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={expertiseFilter}
              onChange={(e) => setExpertiseFilter(e.target.value)}
            />
          </div>
        </div>
      )}
      
      {/* Mentors list - in a row for recommendations, grid for full page */}
      {filteredMentors.length > 0 ? (
        <div className={`${isRecommendations 
          ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4' 
          : isFullPage 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' 
            : 'grid grid-cols-1 md:grid-cols-2 gap-4'
        }`}>
          {filteredMentors.slice(0, isRecommendations ? 4 : undefined).map(mentor => (
            <div key={mentor._id} className="flex flex-col bg-gray-50 rounded-lg border border-gray-200 overflow-hidden h-[280px]">
              <div className="p-4 flex items-start space-x-3 flex-1">
                <img 
                  src={mentor.profilePicture || 'https://randomuser.me/api/portraits/lego/2.jpg'} 
                  alt={mentor.name} 
                  className="w-16 h-16 rounded-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/64?text=👤';
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800">{mentor.name}</p>
                  <p className="text-sm text-gray-500 truncate">
                    {mentor.organization || 'Independent Mentor'}
                  </p>
                  
                  {Array.isArray(mentor.expertise) && mentor.expertise.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {mentor.expertise.slice(0, 3).map((skill, i) => (
                        <span key={i} className="bg-indigo-50 text-indigo-700 text-xs px-2 py-0.5 rounded-full">
                          {skill}
                        </span>
                      ))}
                      {mentor.expertise.length > 3 && (
                        <span className="text-xs text-gray-500">+{mentor.expertise.length - 3} more</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {mentor.bio || "No bio available."}
                </p>
              
                <div className="flex gap-2 mt-2">
                  <button 
                    onClick={() => handleOpenChat(mentor)}
                    className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-sm flex items-center flex-1 justify-center hover:bg-gray-200"
                  >
                    <MessageCircle size={14} className="mr-1" /> Message
                  </button>
                  <button className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg text-sm flex-1 hover:bg-indigo-200">
                    Request Mentoring
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <User size={48} className="mx-auto text-gray-300 mb-3" />
          <h4 className="text-lg font-medium text-gray-500 mb-1">No mentors found</h4>
          <p className="text-gray-400 text-sm">
            {isFullPage 
              ? "Try adjusting your search or filter criteria." 
              : "We're adding more mentor suggestions soon."}
          </p>
        </div>
      )}
      
      {/* Pagination or more mentors button - only in full page view */}
      {isFullPage && filteredMentors.length > 0 && (
        <div className="mt-6 flex justify-center">
          <button className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors">
            Load More Mentors
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

export default DisplayMentors;