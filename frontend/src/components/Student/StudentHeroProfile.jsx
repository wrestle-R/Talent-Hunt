import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { GraduationCap, Code, Target, Edit, Star, AlertCircle, X } from 'lucide-react';

const StudentHeroProfile = ({ userData, profileCompletion, completionDetails, getProfileButtonText, navigate, refreshUserData }) => {
  const [showRejectionModal, setShowRejectionModal] = useState(false);

  // Check if user is rejected when component mounts or userData changes
  useEffect(() => {
    if (userData && userData.isRejected === true) {
      setShowRejectionModal(true);
    }
  }, [userData]);

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
        `}</style>
      </div>
      
      {/* Render the modal with React Portal */}
      {showRejectionModal && createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[99999]" 
             style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            {/* Modal content */}
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
                Your account has been flagged by our moderation team. This means your profile is not visible to mentors 
                or potential teammates, and you cannot apply for hackathons at this time.
              </p>
              
              <div className="bg-red-50 border border-red-100 rounded-md p-4 text-sm text-red-700 mb-4">
                <p className="font-medium mb-1">Reason for flagging:</p>
                <p>{userData.rejectionReason || "No specific reason provided."}</p>
              </div>
              
              <p className="text-gray-700">
                To restore your account, please update your profile according to the feedback and reach out to 
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
                onClick={() => navigate('/student/profile')}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
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

export default StudentHeroProfile;