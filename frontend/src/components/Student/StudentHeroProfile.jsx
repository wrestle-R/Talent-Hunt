import React, { useState, useRef, useEffect } from 'react';
import { GraduationCap, Code, Target, Edit, Star, Plus, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import StudentNewProject from './StudentNewProject';

const StudentHeroProfile = ({ userData, profileCompletion, completionDetails, getProfileButtonText, navigate, refreshUserData }) => {
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const projectsContainerRef = useRef(null);
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0);

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

  // Default profile picture to use when none is available
  const defaultProfilePic = "https://via.placeholder.com/150";
  
  // Handle adding a new project
  const handleProjectAdded = (newProject) => {
    // Refresh the user data to show the new project
    refreshUserData();
  };
  
  // Scroll projects horizontally to specific project
  const scrollToProject = (index) => {
    if (projectsContainerRef.current && userData?.projects?.length > 0) {
      // Ensure index is in bounds
      const safeIndex = Math.max(0, Math.min(index, userData.projects.length - 1));
      setCurrentProjectIndex(safeIndex);
      
      const cardWidth = 250; // Width of card + margins
      const scrollPosition = safeIndex * cardWidth;
      
      projectsContainerRef.current.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      });
    }
  };
  
  // Handle next/prev navigation
  const handleProjectNavigation = (direction) => {
    const totalProjects = userData?.projects?.length || 0;
    let newIndex;
    
    if (direction === 'left') {
      newIndex = (currentProjectIndex - 1 + totalProjects) % totalProjects;
    } else {
      newIndex = (currentProjectIndex + 1) % totalProjects;
    }
    
    scrollToProject(newIndex);
  };

  // Ensure container scrolls properly when current index changes
  useEffect(() => {
    if (projectsContainerRef.current) {
      const cardWidth = 250; // Width of card + margins
      projectsContainerRef.current.scrollLeft = currentProjectIndex * cardWidth;
    }
  }, [currentProjectIndex]);

  return (
    <div className="w-full h-full bg-white shadow-lg p-6 flex flex-col">
      {/* Project Modal */}
      <StudentNewProject 
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
        onProjectAdded={handleProjectAdded}
      />
      
      {/* Main Content (scrollable) */}
      <div className="flex-grow overflow-y-auto mb-4">
        {/* Top Profile Section */}
        <div className="flex-none">
          <div className="relative mb-4">
            <img
              src={userData.profile_picture || defaultProfilePic}
              alt="Profile"
              className="w-24 h-24 rounded-full mx-auto border-4 border-indigo-50 object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = defaultProfilePic;
              }}
            />
            <button className="absolute bottom-0 right-1/2 translate-x-10 bg-indigo-600 text-white rounded-full p-2 shadow-md hover:bg-indigo-700 transition-colors">
              <Edit size={14} />
            </button>
          </div>
          
          <h2 className="text-xl font-bold text-gray-800 mb-1 text-center">{userData.name || 'Complete Your Profile'}</h2>
          <p className="text-gray-500 mb-2 text-center text-sm">{userData.email}</p>
          
          {/* Student Rating */}
          <div className="flex justify-center mb-4">
            {renderRatingStars(userData.rating)}
          </div>
          
          {/* Current Education */}
          {(userData.education?.institution || userData.education?.degree) && (
            <div className="flex items-center gap-2 mb-4 text-gray-600 text-sm">
              <GraduationCap size={16} />
              <span>
                {userData.education?.degree} 
                {userData.education?.degree && userData.education?.institution && " at "}
                {userData.education?.institution}
                {userData.education?.graduation_year && `, ${userData.education?.graduation_year}`}
              </span>
            </div>
          )}
          
          {/* Profile Completion */}
          <div className="w-full mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Profile Completion</span>
              <span className="font-medium">{profileCompletion}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${profileCompletion === 100 ? 'bg-green-500' : 'bg-indigo-600'}`}
                style={{ width: `${profileCompletion}%` }}
              ></div>
            </div>
          </div>

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
        
        {/* Skills - Limited to top 5 */}
        <div className="w-full mb-4">
          <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2 text-sm">
            <Code size={16} />
            Skills
          </h3>
          <div className="flex flex-wrap gap-2">
            {userData.skills?.length > 0 ? (
              userData.skills.slice(0, 5).map((skill, index) => (
                <span 
                  key={index} 
                  className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))
            ) : (
              <span className="text-gray-500 text-sm">No skills added yet</span>
            )}
            {userData.skills?.length > 5 && (
              <span className="text-sm text-blue-600">+{userData.skills.length - 5} more</span>
            )}
          </div>
        </div>
        
        {/* Learning Interests - Limited to top 3 */}
        <div className="w-full bg-indigo-50 p-4 rounded-lg mb-4">
          <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2 text-sm">
            <Target size={16} />
            Learning Interests
          </h3>
          <div className="flex flex-wrap gap-2">
            {userData.interests?.length > 0 ? (
              userData.interests.slice(0, 3).map((interest, index) => (
                <span 
                  key={index} 
                  className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-sm"
                >
                  {interest}
                </span>
              ))
            ) : (
              <span className="text-gray-500 text-sm">No learning interests added yet</span>
            )}
            {userData.interests?.length > 3 && (
              <span className="text-sm text-indigo-600">+{userData.interests.length - 3} more</span>
            )}
          </div>
        </div>
        
        {/* Learning Statistics - Modified for only 2 items */}
        <div className="w-full grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-50 p-3 rounded-lg text-center">
            <p className="text-lg font-bold text-indigo-700">{userData.projects?.length || 0}</p>
            <p className="text-xs text-gray-500">Projects</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg text-center">
            <p className="text-lg font-bold text-indigo-700">{userData.hackathon_prev_experiences || 0}</p>
            <p className="text-xs text-gray-500">Hackathons</p>
          </div>
        </div>
        
        {/* Improved Projects Carousel - Shows one card at a time with smooth navigation */}
        <div className="w-full mb-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-gray-700 flex items-center gap-2 text-sm">
              <Code size={16} />
              Current Projects
            </h3>
            <button 
              className="text-xs bg-indigo-600 text-white px-2 py-1 rounded flex items-center gap-1"
              onClick={() => setIsNewProjectModalOpen(true)}
            >
              <Plus size={14} /> New
            </button>
          </div>
          
          {userData.projects && userData.projects.length > 0 ? (
            <div className="relative">
              {/* Navigation buttons - Bigger and more visible */}
              {userData.projects.length > 1 && (
                <>
                  <button 
                    onClick={() => handleProjectNavigation('left')}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-1.5 hover:bg-gray-100 focus:outline-none border border-gray-200"
                    aria-label="Previous project"
                  >
                    <ChevronLeft size={18} className="text-gray-600" />
                  </button>
                  <button 
                    onClick={() => handleProjectNavigation('right')}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-1.5 hover:bg-gray-100 focus:outline-none border border-gray-200"
                    aria-label="Next project"
                  >
                    <ChevronRight size={18} className="text-gray-600" />
                  </button>
                </>
              )}
              
              {/* Fixed-width project container with snap scrolling */}
              <div className="relative overflow-hidden">
                <div 
                  ref={projectsContainerRef}
                  className="flex overflow-x-auto hide-scrollbar scroll-smooth snap-x snap-mandatory"
                  style={{ 
                    scrollbarWidth: 'none',
                    WebkitOverflowScrolling: 'touch',
                    paddingLeft: '12px',
                    paddingRight: '12px'
                  }}
                >
                  {userData.projects.map((project, index) => (
                    <div 
                      key={index} 
                      className="bg-gray-50 p-3 rounded border border-gray-200 flex-shrink-0 w-full snap-center"
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium text-gray-800 mb-1 text-sm">{project.name}</h4>
                        {project.github_link && (
                          <a 
                            href={project.github_link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-indigo-600"
                          >
                            <ExternalLink size={14} />
                          </a>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {project.description || "No description provided"}
                      </p>
                      {project.tech_stack && project.tech_stack.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {project.tech_stack.slice(0, 2).map((tech, techIndex) => (
                            <span key={techIndex} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-sm">
                              {tech}
                            </span>
                          ))}
                          {project.tech_stack.length > 2 && (
                            <span className="text-sm text-blue-600">+{project.tech_stack.length - 2} more</span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Dot indicators for project navigation */}
              {userData.projects.length > 1 && (
                <div className="flex justify-center mt-2 space-x-1">
                  {userData.projects.map((_, index) => (
                    <button
                      key={index}
                      className={`w-2 h-2 rounded-full ${
                        currentProjectIndex === index ? 'bg-indigo-600' : 'bg-gray-300'
                      }`}
                      onClick={() => scrollToProject(index)}
                      aria-label={`Go to project ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-50 p-3 rounded border border-gray-200 text-center">
              <p className="text-gray-500 text-sm mb-2">No projects added yet</p>
              <button 
                className="text-indigo-600 text-sm font-medium"
                onClick={() => setIsNewProjectModalOpen(true)}
              >
                Start your first project
              </button>
            </div>
          )}
        </div>
        {/* Profile Button - ALWAYS FIXED at bottom */}
      <div className="flex-none w-full">
        <button 
          className={`text-white py-2 px-3 rounded-lg transition-colors duration-200 w-full font-medium text-sm
            ${profileCompletion === 100 ? 'bg-green-600 hover:bg-green-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
          onClick={() => navigate('/student/profile')}
        >
          {getProfileButtonText()}
        </button>
      </div>
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
          0% { box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.4); }
          70% { box-shadow: 0 0 0 6px rgba(79, 70, 229, 0); }
          100% { box-shadow: 0 0 0 0 rgba(79, 70, 229, 0); }
        }
      `}</style>
    </div>
  );
};

export default StudentHeroProfile;