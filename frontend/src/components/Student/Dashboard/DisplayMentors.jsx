import React, { useState, useEffect } from 'react';
import { Users, ChevronRight, MessageCircle, Search, Filter, User, BookOpen, MapPin, 
  Briefcase, Code, Star, Shield, Award, Clock, Coffee, Rocket } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../../../context/UserContext';
import ChatModal from '../ChatModal';
import MentorPlaceholder from "../../../public/mentor_placeholder.png";

const DisplayMentors = ({ userData: propUserData, isFullPage = false, isRecommendations = true }) => {
  const navigate = useNavigate();
  const { userData: contextUserData } = useUser();
  const userData = propUserData || contextUserData;

  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expertiseFilter, setExpertiseFilter] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  
  // Chat modal state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeChatUser, setActiveChatUser] = useState(null);
  
  // Function to handle opening mentor profile
  const handleViewProfile = (mentorId) => {
    navigate(`/student/mentor/${mentorId}`);
  };

  // Function to handle opening chat
  const handleOpenChat = (mentor) => {
    console.log("Opening chat with mentor:", mentor);
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
        
        // Get user ID and email
        const uid = userData?.firebaseUID || currentUser?.uid || '';
        
        // Build query parameters
        let queryParams = new URLSearchParams();
        
        if (availabilityFilter !== 'all') {
          queryParams.append('availability', availabilityFilter);
        }
        
        if (expertiseFilter) {
          queryParams.append('expertise', expertiseFilter);
        }
        
        // Determine which endpoint to use
        let endpoint;
        if (isRecommendations) {
          endpoint = `http://localhost:8000/api/recommend_mentors/`;
        } else {
          endpoint = `http://localhost:4000/api/student/mentors/:${uid}`;
        }
        
        // Add query parameters to endpoint if any exist
        if (queryParams.toString()) {
          endpoint += `?${queryParams.toString()}`;
        }
        
        let response;
        if (isRecommendations) {
          response = await axios.post(endpoint, {
            userData: userData
          });
        } else {
          response = await axios.get(endpoint);
        }
        console.log("Mentors response:", response.data);
        // Process the response based on its structure
        if (Array.isArray(response.data.mentors)) {
          setMentors(response.data.mentors);
        } else if (Array.isArray(response.data)) {
          setMentors(response.data);
        } else {
          console.warn("Unexpected response format:", response.data);
          setMentors([]);
        }
        console.log("Mentors fetched:", mentors);
      } catch (err) {
        console.error("Error fetching mentors:", err);
        setError(`Failed to load mentors: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMentors();
  }, [userData, isRecommendations, availabilityFilter, expertiseFilter]);
  
  // Filter mentors based on search term
  const filteredMentors = mentors.filter(mentor => {
    const matchesSearch = searchTerm === '' || 
      mentor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (Array.isArray(mentor.expertise) && mentor.expertise.some(skill => typeof skill === 'string' && skill.toLowerCase().includes(searchTerm.toLowerCase()))) ||
      (Array.isArray(mentor.skills) && mentor.skills.some(skill => typeof skill === 'string' && skill.toLowerCase().includes(searchTerm.toLowerCase()))) ||
      (typeof mentor.currentCompany === 'string' && mentor.currentCompany.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (typeof mentor.current_company === 'string' && mentor.current_company.toLowerCase().includes(searchTerm.toLowerCase()));
      
    return matchesSearch;
  });

  // Helper function to get expertise icon and color
  const getExpertiseDisplay = (currentMentor) => {
    // Ensure we have arrays to work with
    const expertise = Array.isArray(currentMentor.expertise) ? currentMentor.expertise : [];
    const skills = Array.isArray(currentMentor.skills) ? currentMentor.skills : [];
    
    // Convert any non-string values to strings to prevent rendering errors
    const safeExpertise = expertise.map(item => String(item));
    const safeSkills = skills.map(item => String(item));
    
    if (safeExpertise.length === 0 && safeSkills.length === 0) {
      return {
        icon: <Code size={12} className="mr-1 text-gray-500" />,
        text: 'Various Skills',
        bgColor: 'bg-gray-50',
        textColor: 'text-gray-700'
      };
    }
    
    const allSkills = [...safeExpertise, ...safeSkills];
    
    if (allSkills.some(s => s.toLowerCase().includes('frontend') || s.toLowerCase().includes('front-end') || s.toLowerCase().includes('ui'))) {
      return {
        icon: <Code size={12} className="mr-1 text-indigo-500" />,
        text: 'Frontend Expert',
        bgColor: 'bg-indigo-50',
        textColor: 'text-indigo-700'
      };
    } else if (allSkills.some(s => s.toLowerCase().includes('backend') || s.toLowerCase().includes('back-end') || s.toLowerCase().includes('server'))) {
      return {
        icon: <Shield size={12} className="mr-1 text-blue-500" />,
        text: 'Backend Expert',
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-700'
      };
    } else if (allSkills.some(s => s.toLowerCase().includes('fullstack') || s.toLowerCase().includes('full-stack'))) {
      return {
        icon: <Rocket size={12} className="mr-1 text-purple-500" />,
        text: 'Fullstack Developer',
        bgColor: 'bg-purple-50',
        textColor: 'text-purple-700'
      };
    } else if (allSkills.some(s => s.toLowerCase().includes('data') || s.toLowerCase().includes('ml') || s.toLowerCase().includes('ai'))) {
      return {
        icon: <Award size={12} className="mr-1 text-emerald-500" />,
        text: 'Data/ML Expert',
        bgColor: 'bg-emerald-50',
        textColor: 'text-emerald-700'
      };
    } else {
      return {
        icon: <User size={12} className="mr-1 text-gray-500" />,
        text: 'Technology Mentor',
        bgColor: 'bg-gray-50',
        textColor: 'text-gray-700'
      };
    }
  };

  // Handle loading state
  if (loading) {
    return (
      <div className={`bg-[#1A1A1A] rounded-xl shadow-lg p-6 ${isFullPage ? 'min-h-[600px]' : ''} border border-gray-800`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg flex items-center gap-2 text-white">
            <Coffee className="text-[#E8C848]" />
            {isRecommendations ? 'Mentor Suggestions' : 'Available Mentors'}
          </h3>
        </div>
        <div className="flex justify-center items-center h-40">
          <div className="animate-pulse flex flex-col items-center">
            <div className="rounded-full bg-[#121212] h-12 w-12 mb-2"></div>
            <div className="h-4 bg-[#121212] rounded w-24 mb-2"></div>
            <div className="h-3 bg-[#121212] rounded w-32"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error && mentors.length === 0) {
    return (
      <div className={`bg-[#1A1A1A] rounded-xl shadow-lg p-6 ${isFullPage ? 'min-h-[600px]' : ''} border border-gray-800`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg flex items-center gap-2 text-white">
            <Coffee className="text-[#E8C848]" />
            {isRecommendations ? 'Mentor Suggestions' : 'Available Mentors'}
          </h3>
        </div>
        <div className="flex justify-center items-center h-40">
          <div className="text-center text-gray-400">
            <p className="mb-2">Failed to load mentor suggestions.</p>
            <p className="text-xs mb-3 text-red-400">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-[#E8C848]/10 text-[#E8C848] px-3 py-1 rounded-lg text-sm hover:bg-[#E8C848]/20 transition-all duration-300"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isFullPage ? 'bg-[#1A1A1A] rounded-xl shadow-lg p-6 min-h-[600px] border border-gray-800' : ''} relative`}>
      {isFullPage && (
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg flex items-center gap-2 text-white">
            <Coffee className="text-[#E8C848]" />
            Available Mentors
          </h3>
        </div>
      )}
      
      {/* Search and filters - only shown in full page view */}
      {isFullPage && (
        <div className="mb-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#E8C848]" />
              <input
                type="text"
                placeholder="Search by name, title, or expertise..."
                className="w-full pl-10 pr-4 py-2 bg-[#121212] border border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8C848] focus:border-[#E8C848] text-white placeholder-gray-500 transition-all duration-300"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative w-full md:w-64">
              <Filter size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#E8C848]" />
              <input
                type="text"
                placeholder="Filter by expertise..."
                className="w-full pl-10 pr-4 py-2 bg-[#121212] border border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8C848] focus:border-[#E8C848] text-white placeholder-gray-500 transition-all duration-300"
                value={expertiseFilter}
                onChange={(e) => setExpertiseFilter(e.target.value)}
              />
            </div>
          </div>
          
          {/* Availability filter buttons */}
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => setAvailabilityFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                availabilityFilter === 'all' 
                  ? 'bg-[#E8C848]/10 text-[#E8C848]' 
                  : 'bg-[#121212] text-gray-300 hover:bg-[#E8C848]/10 hover:text-[#E8C848]'
              } transition-all duration-300`}
            >
              All
            </button>
            <button 
              onClick={() => setAvailabilityFilter('available')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center ${
                availabilityFilter === 'available' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-[#121212] text-gray-300 hover:bg-[#E8C848]/10 hover:text-[#E8C848]'
              } transition-all duration-300`}
            >
              <Clock size={14} className="mr-1" /> 
              Available Now
            </button>
            <button 
              onClick={() => setAvailabilityFilter('open')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center ${
                availabilityFilter === 'open' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-[#121212] text-gray-300 hover:bg-[#E8C848]/10 hover:text-[#E8C848]'
              } transition-all duration-300`}
            >
              <Coffee size={14} className="mr-1" /> 
              Open to Mentorship
            </button>
          </div>
        </div>
      )}
      
      {/* Mentors list - in a row for recommendations, grid for full page */}
      {mentors.length > 0 ? (
  <div className={`${isRecommendations 
    ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3' 
    : isFullPage 
      ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3' 
      : 'grid grid-cols-1 md:grid-cols-2 gap-3'
  }`}>
    {mentors.slice(0, isRecommendations ? 4 : undefined).map(mentor => {
      // Safely extract mentor data
      const mentorId = mentor._id?.$oid || mentor._id || '';
      const profilePicture = mentor.profile_picture || MentorPlaceholder;
      const mentorName = mentor.name || 'Unnamed Mentor';
      const mentorTitle = mentor.current_role?.title || 'Mentor';
      const companyName = mentor.current_role?.company || '';
      const mentorBio = mentor.bio || "No bio available.";
      const rating = mentor.rating?.$numberInt ? parseInt(mentor.rating.$numberInt) : 0;
      const yearsExperience = mentor.years_of_experience?.$numberInt || 0;
      
      // Extract skills from expertise object
      const technicalSkills = mentor.expertise?.technical_skills || [];
      const nonTechnicalSkills = mentor.expertise?.non_technical_skills || [];
      const allSkills = [...technicalSkills, ...nonTechnicalSkills].filter(skill => skill && skill !== "To be updated");
      
      // Get focus areas
      const focusAreas = mentor.mentorship_focus_areas || [];
      
      return (
        <div 
          key={mentorId} 
          className="flex flex-col bg-[#121212] rounded-lg border border-gray-800 overflow-hidden h-[220px] hover:shadow-lg cursor-pointer transition-shadow text-xs"
          onClick={() => {
            console.log('Mentor clicked:', mentor);
            handleViewProfile('68066ed669957410d3f56074');
          }}
        >
          <div className="p-3 flex items-start space-x-2 flex-1">
            <img 
              src={profilePicture} 
              alt={mentorName} 
              className="w-10 h-10 rounded-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/40?text=👤';
              }}
            />
            <div className="flex-1 min-w-0 space-y-1">
              <p className="font-semibold text-white truncate">{mentorName}</p>
              <p className="text-gray-400 truncate">
                {mentorTitle} {companyName && `at ${companyName}`}
              </p>
              
              {/* Years of experience */}
              {yearsExperience > 0 && (
                <div className="flex items-center text-gray-400">
                  <Clock size={10} className="mr-1 flex-shrink-0" />
                  <span>{yearsExperience}+ years experience</span>
                </div>
              )}

              {/* Rating display with yellow stars */}
              {rating > 0 && (
                <div className="flex items-center text-[#E8C848]">
                  <span className="font-medium">Rating: </span>
                  <div className="flex ml-1">
                    {[...Array(5)].map((_, index) => (
                      <Star 
                        key={index} 
                        size={10} 
                        className={`${
                          index < rating 
                            ? 'text-yellow-400 fill-yellow-400' 
                            : 'text-gray-300'
                        }`} 
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {/* Focus areas as badges */}
              {focusAreas.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {focusAreas.slice(0, 2).map((area, i) => (
                    <span key={i} className="bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded-full">
                      {area}
                    </span>
                  ))}
                  {focusAreas.length > 2 && (
                    <span className="text-gray-400">+{focusAreas.length - 2}</span>
                  )}
                </div>
              )}
              
              {/* Skills display */}
              {allSkills.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {allSkills.slice(0, 2).map((skill, i) => (
                    <span key={i} className="bg-[#E8C848]/10 text-[#E8C848] px-1.5 py-0.5 rounded-full">
                      {skill}
                    </span>
                  ))}
                  {allSkills.length > 2 && (
                    <span className="text-gray-400">+{allSkills.length - 2}</span>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="p-2 border-t border-gray-800 bg-[#121212]">
            {/* Bio snippet */}
            <div className="flex items-start text-gray-400 mb-1 truncate">
              <User size={10} className="mr-1 mt-0.5 flex-shrink-0" />
              <span className="truncate">{mentorBio}</span>
            </div>
            
            <div className="flex gap-1.5" onClick={e => e.stopPropagation()}>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenChat(mentor);
                }} 
                className="bg-gray-800 text-gray-400 px-2 py-1 rounded text-xs flex items-center hover:bg-gray-700 hover:text-white transition-all duration-300"
              >
                <MessageCircle size={12} className="mr-1" />
              </button>
              
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewProfile('68066ed669957410d3f56074');
                }}
                className="bg-[#E8C848]/10 text-[#E8C848] px-2 py-1 rounded text-xs flex-1 hover:bg-[#E8C848]/20 transition-all duration-300"
              >
                Profile
              </button>
            </div>
          </div>
        </div>
      );
    })}
  </div>
) : (
  <div className="text-center py-10">
    <User size={48} className="mx-auto text-[#E8C848]/30 mb-3" />
    <h4 className="text-lg font-medium text-gray-300 mb-1">No mentors found</h4>
    <p className="text-gray-400 text-sm">
      {isFullPage 
        ? availabilityFilter !== 'all'
          ? `No mentors are currently ${availabilityFilter === 'available' ? 'available' : 'open to mentorship'}.`
          : "Try adjusting your search or filter criteria."
        : "We're adding more mentor suggestions soon."}
    </p>
  </div>
)}
      
      {/* Pagination or more mentors button - only in full page view */}
      {isFullPage && mentors.length > 8 && (
        <div className="mt-6 flex justify-center">
          <button className="bg-[#E8C848]/10 text-[#E8C848] px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#E8C848]/20 transition-all duration-300">
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