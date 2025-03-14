import React, { useState } from 'react';
import { GraduationCap, Code, Target, Edit, Star, Plus, ExternalLink } from 'lucide-react';
import StudentNewProject from './StudentNewProject';

const StudentProfile = ({ userData, calculateProfileCompletion, navigate, refreshUserData }) => {
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  
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

  return (
    <div className="w-full md:w-3/10 bg-white shadow-lg p-6">
      {/* Project Modal */}
      <StudentNewProject 
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
        onProjectAdded={handleProjectAdded}
      />
      
      <div className="relative mb-6">
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
          <Edit size={16} />
        </button>
      </div>
      
      <h2 className="text-2xl font-bold text-gray-800 mb-1 text-center">{userData.name || 'Complete Your Profile'}</h2>
      <p className="text-gray-500 mb-2 text-center">{userData.email}</p>
      
      {/* Student Rating */}
      <div className="flex justify-center mb-4">
        {renderRatingStars(userData.rating)}
      </div>
      
      {/* Current Education */}
      {(userData.education?.institution || userData.education?.degree) && (
        <div className="flex items-center gap-2 mb-4 text-gray-600">
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
      <div className="w-full mb-6">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">Profile Completion</span>
          <span className="font-medium">{calculateProfileCompletion()}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-indigo-600 h-2 rounded-full" 
            style={{ width: `${calculateProfileCompletion()}%` }}
          ></div>
        </div>
      </div>
      
      {/* Skills - Limited to top 5 */}
      <div className="w-full mb-6">
        <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
          <Code size={16} />
          Skills
        </h3>
        <div className="flex flex-wrap gap-2">
          {userData.skills?.length > 0 ? (
            userData.skills.slice(0, 5).map((skill, index) => (
              <span 
                key={index} 
                className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm"
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
      <div className="w-full bg-indigo-50 p-4 rounded-lg mb-6">
        <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
          <Target size={16} />
          Learning Interests
        </h3>
        <div className="flex flex-wrap gap-2">
          {userData.interests?.length > 0 ? (
            userData.interests.slice(0, 3).map((interest, index) => (
              <span 
                key={index} 
                className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm"
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
      <div className="w-full grid grid-cols-2 gap-3 mb-6">
        <div className="bg-gray-50 p-3 rounded-lg text-center">
          <p className="text-xl font-bold text-indigo-700">{userData.projects?.length || 0}</p>
          <p className="text-xs text-gray-500">Projects</p>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg text-center">
          <p className="text-xl font-bold text-indigo-700">{userData.hackathon_prev_experiences || 0}</p>
          <p className="text-xs text-gray-500">Hackathons</p>
        </div>
      </div>
      
      {/* Current Projects Section - Updated to open modal */}
      <div className="w-full mb-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-gray-700 flex items-center gap-2">
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
          <div className="space-y-2">
            {userData.projects.slice(0, 3).map((project, index) => (
              <div key={index} className="bg-gray-50 p-3 rounded border border-gray-200">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium text-gray-800 mb-1">{project.name}</h4>
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
                <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                  {project.description || "No description provided"}
                </p>
                {project.tech_stack && project.tech_stack.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {project.tech_stack.slice(0, 2).map((tech, techIndex) => (
                      <span key={techIndex} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs">
                        {tech}
                      </span>
                    ))}
                    {project.tech_stack.length > 2 && (
                      <span className="text-xs text-blue-600">+{project.tech_stack.length - 2} more</span>
                    )}
                  </div>
                )}
              </div>
            ))}
            
            {userData.projects.length > 3 && (
              <button 
                className="text-indigo-600 text-sm w-full text-center mt-1"
                onClick={() => navigate('/student/projects')}
              >
                View all {userData.projects.length} projects
              </button>
            )}
          </div>
        ) : (
          <div className="bg-gray-50 p-4 rounded border border-gray-200 text-center">
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
      
      {/* Update Profile Button */}
      <button 
        className="bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors duration-200 w-full font-medium"
        onClick={() => navigate('/student/profile')}
      >
        Update Profile
      </button>
    </div>
  );
};

export default StudentProfile;