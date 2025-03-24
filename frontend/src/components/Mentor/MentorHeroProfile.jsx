import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Star, Edit, Briefcase, BookOpen, Cpu, Users, AlertCircle, X } from 'lucide-react';

const MentorHeroProfile = ({ 
  userData, 
  dashboardData, 
  profileCompletion, 
  completionDetails, 
  getProfileButtonText, 
  navigate 
}) => {
  const [bioExpanded, setBioExpanded] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  
  // Default profile picture to use when none is available
  const defaultProfilePic = "https://via.placeholder.com/150";

  // Check if user is rejected when component mounts or userData changes
  useEffect(() => {
    if (userData && userData.isRejected === true) {
      setShowRejectionModal(true);
    }
  }, [userData]);

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
    <>
      <div className="w-full h-full bg-white shadow-lg p-6 flex flex-col">
        {/* Main Content (scrollable) */}
        <div className="flex-grow overflow-y-auto mb-4">
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
            
            {/* Bio - With read more/less capability */}
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
            
            {/* Profile Completion */}
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
              
              {/* Show incomplete fields */}
              {completionDetails.incompleteFields && completionDetails.incompleteFields.length > 0 && (
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
          
          {/* Stats - Only current students and hours mentored */}
          <div className="w-full grid grid-cols-2 gap-3 mb-4">
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <p className="text-lg font-bold text-blue-700">{dashboardData.stats.studentsReached}</p>
              <p className="text-xs text-gray-500">Students Reached</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <p className="text-lg font-bold text-blue-700">{dashboardData.stats.mentorshipHours}</p>
              <p className="text-xs text-gray-500">Hours Mentored</p>
            </div>
          </div>
          
          {/* Technical Skills */}
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
          
          {/* Non-Technical Skills */}
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
          <div className="flex-none w-full">
          <button 
            className={`text-white py-2 px-3 rounded-lg transition-colors duration-200 w-full font-medium text-sm
              ${profileCompletion === 100 ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
            onClick={() => navigate('/mentor/profile')}
          >
            {getProfileButtonText()}
          </button>
        </div>
        </div>
        
        {/* Update Profile Button - Fixed at Bottom */}
        
      </div>
      
      {/* Rejection Modal with React Portal - renders at document.body level */}
      {showRejectionModal && createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[99999]" 
             style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-red-600 flex items-center">
                <AlertCircle size={20} className="mr-2" />
                Account Flagged
              </h3>
              <button
                onClick={() => setShowRejectionModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700 mb-4">
                Your mentor account has been flagged by our moderation team. This means your profile is not visible to students 
                and you cannot accept mentorship requests at this time.
              </p>
              
              <div className="bg-red-50 border border-red-100 rounded-md p-4 text-sm text-red-700 mb-4">
                <p className="font-medium mb-1">Reason for flagging:</p>
                <p>{userData.rejectionReason || "No specific reason provided."}</p>
              </div>
              
              <p className="text-gray-700">
                To restore your account, please update your profile according to the feedback above and reach out to 
                our support team if you have any questions.
              </p>
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowRejectionModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Close
              </button>
              
              <button
                onClick={() => navigate('/mentor/profile')}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Update Profile
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default MentorHeroProfile;