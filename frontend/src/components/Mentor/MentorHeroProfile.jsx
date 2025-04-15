import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Star, Edit, Briefcase, BookOpen, Cpu, Users, AlertCircle, X } from 'lucide-react';

import StudentPlaceholder from '../../public/student_placeholder.png';
import MentorPlaceholder from '../../public/mentor_placeholder.png';

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

  // Render rating stars with updated colors
  const renderRatingStars = (rating) => {
    const fullStars = Math.floor(rating || 0);
    const hasHalfStar = rating % 1 >= 0.5;
    const stars = [];
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} size={16} className="fill-[#E8C848] text-[#E8C848]" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<Star key={i} size={16} className="fill-[#E8C848] text-[#E8C848] half-filled" />);
      } else {
        stars.push(<Star key={i} size={16} className="text-gray-600" />);
      }
    }
    
    return (
      <div className="flex items-center gap-1">
        {stars}
        <span className="text-sm text-gray-400 ml-1">{rating ? rating.toFixed(1) : '0.0'}</span>
        <span className="text-sm text-gray-500">({userData.reviews_count || 0} reviews)</span>
      </div>
    );
  };

  return (
    <>
      <div className="w-full h-full bg-[#1A1A1A] shadow-lg p-6 flex flex-col border-r border-gray-800">
        <div className="flex-grow overflow-y-auto mb-4">
          <div className="flex-none">
            <div className="relative mb-4">
              <img
                src={userData.profile_picture || MentorPlaceholder}
                alt="Profile"
                className="w-24 h-24 rounded-full mx-auto border-4 border-[#E8C848]/10 object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = MentorPlaceholder;
                }}
              />
              <button className="absolute bottom-0 right-1/2 translate-x-10 bg-[#E8C848] text-[#121212] rounded-full p-2 shadow-md hover:bg-[#E8C848]/80 transition-colors">
                <Edit size={14} />
              </button>
            </div>
            
            <h2 className="text-xl font-bold text-white mb-1 text-center font-montserrat">{userData.name || 'Complete Your Profile'}</h2>
            <p className="text-gray-400 mb-2 text-center text-sm font-inter">{userData.email}</p>
            
            {/* Mentor Rating */}
            <div className="flex justify-center mb-4">
              {renderRatingStars(userData.rating)}
            </div>
            
            {/* Bio section */}
            {userData.bio && (
              <div className="bg-[#121212] p-3 rounded-lg mb-4 relative border border-gray-800">
                <div className={`${bioExpanded ? '' : 'h-20 overflow-hidden'}`}>
                  <p className="text-sm text-gray-300 italic">{userData.bio}</p>
                </div>
                
                {userData.bio.length > 150 && (
                  <div className={`absolute bottom-0 left-0 right-0 text-center ${
                    bioExpanded ? 'pt-2' : 'pt-8 bg-gradient-to-t from-[#121212]'
                  }`}>
                    <button 
                      onClick={() => setBioExpanded(!bioExpanded)} 
                      className="text-xs bg-[#E8C848]/10 px-3 py-1 rounded-full text-[#E8C848] font-medium hover:bg-[#E8C848]/20"
                    >
                      {bioExpanded ? 'Show Less' : 'Read More'}
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {/* Current Role & Experience with updated colors */}
            {(userData.current_role?.title || userData.current_role?.company) && (
              <div className="flex items-center gap-2 mb-4 text-gray-400 text-sm">
                <Briefcase size={16} className="text-[#E8C848]" />
                <span>
                  {userData.current_role?.title} 
                  {userData.current_role?.title && userData.current_role?.company && " at "}
                  {userData.current_role?.company}
                </span>
              </div>
            )}
            
            <div className="flex items-center gap-2 mb-4 text-gray-400 text-sm">
              <BookOpen size={16} className="text-[#E8C848]" />
              <span>{userData.years_of_experience} years of experience</span>
            </div>

            {/* Profile Completion with updated colors */}
            <div className="w-full mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Profile Completion</span>
                <span className="font-medium text-white">{profileCompletion}%</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    profileCompletion === 100 ? 'bg-[#E8C848]' : 'bg-[#E8C848]/80'
                  }`}
                  style={{ width: `${profileCompletion}%` }}
                ></div>
              </div>

              {/* Incomplete fields warning */}
              {completionDetails.incompleteFields && completionDetails.incompleteFields.length > 0 && (
                <div className="mt-2 p-2 bg-[#E8C848]/10 rounded-md border border-[#E8C848]/20">
                  <p className="text-xs text-[#E8C848] font-medium">Complete your profile by adding:</p>
                  <ul className="text-xs text-gray-400 list-disc ml-4 mt-1">
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

          {/* Stats cards with updated colors */}
          <div className="w-full grid grid-cols-2 gap-3 mb-4">
            <div className="bg-[#121212] p-3 rounded-lg text-center border border-gray-800">
              <p className="text-lg font-bold text-[#E8C848]">{dashboardData.stats.studentsReached}</p>
              <p className="text-xs text-gray-400">Students Reached</p>
            </div>
            <div className="bg-[#121212] p-3 rounded-lg text-center border border-gray-800">
              <p className="text-lg font-bold text-[#E8C848]">{dashboardData.stats.mentorshipHours}</p>
              <p className="text-xs text-gray-400">Hours Mentored</p>
            </div>
          </div>

          {/* Skills sections with updated colors */}
          <div className="w-full mb-4">
            <h3 className="font-semibold text-white mb-2 flex items-center gap-2 text-sm">
              <Cpu size={16} className="text-[#E8C848]" />
              Technical Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {userData.expertise?.technical_skills?.length > 0 ? (
                userData.expertise.technical_skills.slice(0, 5).map((skill, index) => (
                  <span 
                    key={index} 
                    className="bg-[#E8C848]/10 text-[#E8C848] px-2 py-0.5 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-gray-400 text-sm">No technical skills added yet</span>
              )}
              {userData.expertise?.technical_skills?.length > 5 && (
                <span className="text-sm text-[#E8C848]">+{userData.expertise.technical_skills.length - 5} more</span>
              )}
            </div>
          </div>

          {/* Non-Technical Skills */}
          <div className="w-full bg-[#121212] p-4 rounded-lg mb-4 border border-gray-800">
            <h3 className="font-semibold text-white mb-2 flex items-center gap-2 text-sm">
              <Users size={16} className="text-[#E8C848]" />
              Soft Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {userData.expertise?.non_technical_skills?.length > 0 ? (
                userData.expertise.non_technical_skills.slice(0, 3).map((skill, index) => (
                  <span 
                    key={index} 
                    className="bg-[#E8C848]/10 text-[#E8C848] px-2 py-0.5 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-gray-400 text-sm">No soft skills added yet</span>
              )}
              {userData.expertise?.non_technical_skills?.length > 3 && (
                <span className="text-sm text-[#E8C848]">+{userData.expertise.non_technical_skills.length - 3} more</span>
              )}
            </div>
          </div>

          {/* Update Profile Button */}
          <div className="flex-none w-full">
            <button 
              className={`text-[#121212] py-2 px-3 rounded-lg transition-colors duration-200 w-full font-medium text-sm
                ${profileCompletion === 100 ? 'bg-[#E8C848] hover:bg-[#E8C848]/80' : 'bg-[#E8C848] hover:bg-[#E8C848]/80'}`}
              onClick={() => navigate('/mentor/profile')}
            >
              {getProfileButtonText()}
            </button>
          </div>
        </div>
      </div>

      {/* Rejection Modal with updated colors */}
      {showRejectionModal && createPortal(
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[99999]">
          <div className="bg-[#1A1A1A] rounded-lg shadow-xl p-6 max-w-md w-full border border-gray-800">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-[#E8C848] flex items-center">
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
              <p className="text-gray-300 mb-4">
                Your mentor account has been flagged by our moderation team. This means your profile is not visible to students 
                and you cannot accept mentorship requests at this time.
              </p>
              
              <div className="bg-[#E8C848]/10 border border-[#E8C848]/20 rounded-md p-4 text-sm text-[#E8C848] mb-4">
                <p className="font-medium mb-1">Reason for flagging:</p>
                <p>{userData.rejectionReason || "No specific reason provided."}</p>
              </div>
              
              <p className="text-gray-300">
                To restore your account, please update your profile according to the feedback above and reach out to 
                our support team if you have any questions.
              </p>
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowRejectionModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-400 bg-gray-800 rounded-md hover:bg-gray-700"
              >
                Close
              </button>
              
              <button
                onClick={() => navigate('/mentor/profile')}
                className="px-4 py-2 text-sm font-medium text-[#121212] bg-[#E8C848] rounded-md hover:bg-[#E8C848]/80"
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