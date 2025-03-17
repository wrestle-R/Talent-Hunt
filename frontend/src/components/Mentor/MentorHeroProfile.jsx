import React, { useState, useRef, useEffect } from 'react';
import { 
  Star, Edit, Briefcase, BookOpen, Users, Cpu, Code, Target, Plus, ExternalLink, ChevronLeft, ChevronRight
} from 'lucide-react';

const MentorHeroProfile = ({ 
  userData, 
  dashboardData, 
  profileCompletion, 
  completionDetails, 
  getProfileButtonText, 
  navigate, 
  refreshUserData 
}) => {
  const [isNewResourceModalOpen, setIsNewResourceModalOpen] = useState(false);
  const resourcesContainerRef = useRef(null);
  const [currentResourceIndex, setCurrentResourceIndex] = useState(0);
  const [bioExpanded, setBioExpanded] = useState(false);

  // Default profile picture to use when none is available
  const defaultProfilePic = "https://via.placeholder.com/150";
  
  // Calculate how many resources are visible
  const calculateVisibleResources = () => {
    if (!dashboardData?.resources?.length) return 0;
    return Math.min(dashboardData.resources.length, 1); // Show only 1 resource at a time
  };

  // Scroll resources horizontally to specific resource
  const scrollToResource = (index) => {
    if (resourcesContainerRef.current && dashboardData?.resources?.length > 0) {
      // Ensure index is in bounds
      const safeIndex = Math.max(0, Math.min(index, dashboardData.resources.length - 1));
      setCurrentResourceIndex(safeIndex);
      
      const cardWidth = 250; // Width of card + margins
      const scrollPosition = safeIndex * cardWidth;
      
      resourcesContainerRef.current.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      });
    }
  };
  
  // Handle next/prev navigation
  const handleResourceNavigation = (direction) => {
    const totalResources = dashboardData?.resources?.length || 0;
    let newIndex;
    
    if (direction === 'left') {
      newIndex = (currentResourceIndex - 1 + totalResources) % totalResources;
    } else {
      newIndex = (currentResourceIndex + 1) % totalResources;
    }
    
    scrollToResource(newIndex);
  };

  // Ensure container scrolls properly when current index changes
  useEffect(() => {
    if (resourcesContainerRef.current) {
      const cardWidth = 250; // Width of card + margins
      resourcesContainerRef.current.scrollLeft = currentResourceIndex * cardWidth;
    }
  }, [currentResourceIndex]);

  // Render rating stars consistently with student profile
  const renderRatingStars = (rating) => {
    const fullStars = Math.floor(rating || 0);
    const hasHalfStar = rating % 1 >= 0.5;
    const stars = [];
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} size={16} className="fill-amber-500 text-amber-500" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<Star key={i} size={16} className="fill-amber-500 text-amber-500 half-filled" />);
      } else {
        stars.push(<Star key={i} size={16} className="text-gray-300" />);
      }
    }
    
    return (
      <div className="flex items-center gap-1">
        {stars}
        <span className="text-sm text-gray-600 ml-1">{rating ? rating.toFixed(1) : '0.0'}</span>
        <span className="text-sm text-gray-500">({userData.reviews_count || 0} reviews)</span>
      </div>
    );
  };

  return (
    <div className="w-full h-[94%]  bg-white shadow-lg p-6 flex flex-col overflow-hidden">
      {/* Main Content (scrollable) */}
      <div className="flex-grow overflow-hidden mb-4">
        {/* Top Profile Section */}
        <div className="flex-none">
          <div className="relative mb-4">
            <img
              src={userData.profile_picture || defaultProfilePic}
              alt="Profile"
              className="w-24 h-24 rounded-full mx-auto border-4 border-blue-50 object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = defaultProfilePic;
              }}
            />
            <button className="absolute bottom-0 right-1/2 translate-x-10 bg-blue-600 text-white rounded-full p-2 shadow-md hover:bg-blue-700 transition-colors">
              <Edit size={14} />
            </button>
          </div>
          
          <h2 className="text-xl font-bold text-gray-800 mb-1 text-center">{userData.name || 'Complete Your Profile'}</h2>
          <p className="text-gray-500 mb-2 text-center text-sm">{userData.email}</p>
          
          {/* Mentor Rating */}
          <div className="flex justify-center mb-4">
            {renderRatingStars(userData.rating)}
          </div>
          
          {/* Bio - In a similar style to student's education */}
          {userData.bio && (
  <div className="bg-blue-50 p-3 rounded-lg mb-4 relative">
    <div className={`${bioExpanded ? '' : 'h-20 overflow-hidden'}`}>
      <p className="text-sm text-gray-700 italic">{userData.bio}</p>
    </div>
    
    {userData.bio.length > 150 && (
      <div className={`absolute bottom-0 left-0 right-0 text-center ${bioExpanded ? 'pt-2' : 'pt-8 bg-gradient-to-t from-blue-50'}`}>
        <button 
          onClick={() => setBioExpanded(!bioExpanded)} 
          className="text-xs bg-white px-3 py-1 rounded-full text-blue-600 font-medium shadow-sm hover:bg-gray-50"
        >
          {bioExpanded ? 'Show Less' : 'Read More'}
        </button>
      </div>
    )}
  </div>
)}
          
          {/* Current Role */}
          {(userData.current_role?.title || userData.current_role?.company) && (
            <div className="flex items-center gap-2 mb-4 text-gray-600 text-sm">
              <Briefcase size={16} />
              <span>
                {userData.current_role?.title} 
                {userData.current_role?.title && userData.current_role?.company && " at "}
                {userData.current_role?.company}
              </span>
            </div>
          )}
          
          {/* Experience */}
          <div className="flex items-center gap-2 mb-4 text-gray-600 text-sm">
            <BookOpen size={16} />
            <span>{userData.years_of_experience} years of experience</span>
          </div>
          
          {/* Profile Completion - Matching student profile style */}
          <div className="w-full mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Profile Completion</span>
              <span className="font-medium">{profileCompletion}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${profileCompletion === 100 ? 'bg-green-500' : 'bg-blue-600'}`}
                style={{ width: `${profileCompletion}%` }}
              ></div>
            </div>
            
            {/* Optionally show incomplete fields */}
            {completionDetails.incompleteFields.length > 0 && (
              <div className="mt-2 p-2 bg-yellow-50 rounded-md">
                <p className="text-xs text-yellow-700 font-medium">Complete your profile by adding:</p>
                <ul className="text-xs text-yellow-600 list-disc ml-4 mt-1">
                  {completionDetails.incompleteFields.slice(0, 3).map((field, index) => (
                    <li key={index}>{field}</li>
                  ))}
                  {completionDetails.incompleteFields.length > 3 && (
                    <li>...and {completionDetails.incompleteFields.length - 3} more</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
        
        {/* Stats in grid layout like student's stats */}
        <div className="w-full grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-50 p-3 rounded-lg text-center">
            <p className="text-lg font-bold text-blue-700">{dashboardData.stats.studentsReached}</p>
            <p className="text-xs text-gray-500">Current Students </p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg text-center">
            <p className="text-lg font-bold text-blue-700">{dashboardData.stats.completedMentorships}</p>
            <p className="text-xs text-gray-500">Completed</p>
          </div>
        </div>
        
        {/* Technical Skills - Similar to student's skills */}
        <div className="w-full mb-4">
          <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2 text-sm">
            <Cpu size={16} />
            Technical Skills
          </h3>
          <div className="flex flex-wrap gap-2">
            {userData.expertise?.technical_skills?.length > 0 ? (
              userData.expertise.technical_skills.slice(0, 5).map((skill, index) => (
                <span 
                  key={index} 
                  className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))
            ) : (
              <span className="text-gray-500 text-sm">No technical skills added yet</span>
            )}
            {userData.expertise?.technical_skills?.length > 5 && (
              <span className="text-sm text-blue-600">+{userData.expertise.technical_skills.length - 5} more</span>
            )}
          </div>
        </div>
        
        {/* Non-Technical Skills - In the same style as student's interests */}
        <div className="w-full bg-blue-50 p-4 rounded-lg mb-4">
          <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2 text-sm">
            <Users size={16} />
            Soft Skills
          </h3>
          <div className="flex flex-wrap gap-2">
            {userData.expertise?.non_technical_skills?.length > 0 ? (
              userData.expertise.non_technical_skills.slice(0, 3).map((skill, index) => (
                <span 
                  key={index} 
                  className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))
            ) : (
              <span className="text-gray-500 text-sm">No soft skills added yet</span>
            )}
            {userData.expertise?.non_technical_skills?.length > 3 && (
              <span className="text-sm text-blue-600">+{userData.expertise.non_technical_skills.length - 3} more</span>
            )}
          </div>
        </div>
        
        {/* Learning Resources - Similar to student's projects carousel */}
        {dashboardData.resources && (
          <div className="w-full mb-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-gray-700 flex items-center gap-2 text-sm">
                <Code size={16} />
                Learning Resources
              </h3>
              <button 
                className="text-xs bg-blue-600 text-white px-2 py-1 rounded flex items-center gap-1"
                onClick={() => setIsNewResourceModalOpen(true)}
              >
                <Plus size={14} /> New
              </button>
            </div>
            
            {dashboardData.resources.length > 0 ? (
              <div className="relative">
                {dashboardData.resources.length > 1 && (
                  <>
                    <button 
                      onClick={() => handleResourceNavigation('left')}
                      className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-1.5 hover:bg-gray-100 focus:outline-none border border-gray-200"
                      aria-label="Previous resource"
                    >
                      <ChevronLeft size={18} className="text-gray-600" />
                    </button>
                    <button 
                      onClick={() => handleResourceNavigation('right')}
                      className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-1.5 hover:bg-gray-100 focus:outline-none border border-gray-200"
                      aria-label="Next resource"
                    >
                      <ChevronRight size={18} className="text-gray-600" />
                    </button>
                  </>
                )}
                
                <div className="relative overflow-hidden">
                  <div 
                    ref={resourcesContainerRef}
                    className="flex overflow-x-auto hide-scrollbar scroll-smooth snap-x snap-mandatory"
                    style={{ 
                      scrollbarWidth: 'none',
                      WebkitOverflowScrolling: 'touch',
                      paddingLeft: '12px',
                      paddingRight: '12px'
                    }}
                  >
                    {dashboardData.resources.map((resource, index) => (
                      <div 
                        key={index} 
                        className="bg-gray-50 p-3 rounded border border-gray-200 flex-shrink-0 w-full snap-center"
                      >
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium text-gray-800 mb-1 text-sm">{resource.title}</h4>
                          {resource.url && (
                            <a 
                              href={resource.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600"
                            >
                              <ExternalLink size={14} />
                            </a>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {resource.description || "No description provided"}
                        </p>
                        {resource.tags && resource.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {resource.tags.slice(0, 2).map((tag, tagIndex) => (
                              <span key={tagIndex} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-sm">
                                {tag}
                              </span>
                            ))}
                            {resource.tags.length > 2 && (
                              <span className="text-sm text-blue-600">+{resource.tags.length - 2} more</span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                {dashboardData.resources.length > 1 && (
                  <div className="flex justify-center mt-2 space-x-1">
                    {dashboardData.resources.map((_, index) => (
                      <button
                        key={index}
                        className={`w-2 h-2 rounded-full ${
                          currentResourceIndex === index ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                        onClick={() => scrollToResource(index)}
                        aria-label={`Go to resource ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-50 p-3 rounded border border-gray-200 text-center">
                <p className="text-gray-500 text-sm mb-2">No learning resources added yet</p>
                <button 
                  className="text-blue-600 text-sm font-medium"
                  onClick={() => setIsNewResourceModalOpen(true)}
                >
                  Share your first resource
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Update Profile Button - Fixed at Bottom */}
      <div className="flex-none w-full">
        <button 
          className={`text-white py-2 px-3 rounded-lg transition-colors duration-200 w-full font-medium text-sm
            ${profileCompletion === 100 ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
          onClick={() => navigate('/mentor/profile')}
        >
          {getProfileButtonText()}
        </button>
      </div>
      
      {/* Hide scrollbars but maintain functionality */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes pulse-border {
          0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
          70% { box-shadow: 0 0 0 6px rgba(59, 130, 246, 0); }
          100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
        }
      `}</style>
    </div>
  );
};

export default MentorHeroProfile;