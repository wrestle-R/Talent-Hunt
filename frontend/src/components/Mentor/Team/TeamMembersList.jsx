import React, { useState } from 'react';
import { User, Mail, Book, Calendar, Award, Shield, ExternalLink, BarChart, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import StudentPlaceholder from '../../../public/student_placeholder.png';
import MentorPlaceholder from '../../../public/mentor_placeholder.png';

const TeamMembersList = ({ team, mentorId, onDataChange, onViewProfile }) => {
  const [expandedMember, setExpandedMember] = useState(null);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [memberFeedback, setMemberFeedback] = useState('');
  
  if (!team || !team.members) {
    return (
      <div className="bg-[#1A1A1A] rounded-xl shadow-sm p-6 border border-gray-800">
        <h2 className="text-lg font-semibold flex items-center text-white">
          <User size={20} className="mr-2 text-[#E8C848]" />
          Team Members
        </h2>
        <div className="text-center py-8 text-gray-400">
          <AlertCircle className="mx-auto mb-2 h-8 w-8 text-gray-600" />
          <p>Team data not available</p>
        </div>
      </div>
    );
  }
  
  const handleMemberClick = (memberId) => {
    if (expandedMember === memberId) {
      setExpandedMember(null);
    } else {
      setExpandedMember(memberId);
      setMemberFeedback('');
    }
  };
  
  const handleSubmitFeedback = async (memberId) => {
    if (!memberFeedback.trim()) {
      toast.error("Feedback cannot be empty");
      return;
    }
    
    try {
      setIsSubmittingFeedback(true);
      
      const response = await axios.post(`http://localhost:4000/api/mentor/member-feedback/${team._id}/${memberId}`, {
        mentorId,
        feedback: memberFeedback
      });
      
      if (response.data.success) {
        toast.success("Feedback submitted successfully");
        setMemberFeedback('');
        setExpandedMember(null);
        if (onDataChange) onDataChange();
      } else {
        toast.error(response.data.message || "Failed to submit feedback");
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error(error.response?.data?.message || "An error occurred while submitting feedback");
    } finally {
      setIsSubmittingFeedback(false);
    }
  };
  
  const handleViewProfile = (member) => {
    if (onViewProfile) {
      onViewProfile(member);
    }
  };
  
  return (
    <div className="bg-[#1A1A1A] rounded-xl shadow-sm border border-gray-800">
      <div className="p-6 border-b border-gray-800">
        <h2 className="text-lg font-semibold flex items-center text-white">
          <User size={20} className="mr-2 text-[#E8C848]" />
          Team Members ({team.members.length})
        </h2>
        <p className="text-sm text-gray-400 mt-1">Click on a member to see more details</p>
      </div>
      
      <div className="divide-y divide-gray-800">
        {team.members.map((member, index) => {
          const memberData = member.student || {};
          const memberId = memberData._id || `member-${index}`;
          const memberName = memberData.name || 'Team Member';
          
          return (
            <div key={memberId} className="p-0">
              <div 
                className={`px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-[#121212] ${
                  expandedMember === memberId ? 'bg-[#121212]' : ''
                }`}
                onClick={() => handleMemberClick(memberId)}
              >
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full overflow-hidden bg-[#121212] mr-4 flex-shrink-0">
                    {memberData.profile_picture ? (
                      <img 
                        src={memberData.profile_picture || StudentPlaceholder} 
                        alt={memberName} 
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = StudentPlaceholder;
                        }}
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-[#1A1A1A] text-[#E8C848]">
                        <User size={20} />
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-white flex items-center">
                      {memberName}
                      {team.leader && memberId === team.leader && (
                        <span className="ml-2 px-2 py-0.5 text-xs bg-[#E8C848]/10 text-[#E8C848] rounded-full">
                          Team Leader
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-gray-400">{member.role || 'Team Member'}</p>
                  </div>
                </div>
                
                <div className="flex items-center text-gray-400">
                  <span className="text-sm">
                    {expandedMember === memberId ? 'Hide Details' : 'View Details'}
                  </span>
                  <svg
                    className={`ml-2 h-5 w-5 transition-transform duration-200 ${
                      expandedMember === memberId ? 'transform rotate-180' : ''
                    }`}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              
              {expandedMember === memberId && (
                <div className="px-6 py-4 bg-[#121212] border-t border-gray-800">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-3">Member Information</h4>
                      
                      <ul className="space-y-3">
                        {memberData.email && (
                          <li className="flex items-start">
                            <Mail size={16} className="mt-0.5 mr-2 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-400">Email</p>
                              <p className="text-sm text-white">{memberData.email}</p>
                            </div>
                          </li>
                        )}
                        
                        <li className="flex items-start">
                          <Book size={16} className="mt-0.5 mr-2 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-400">Education</p>
                            <p className="text-sm text-white">
                              {memberData.education?.institution || 'Not specified'}
                              {memberData.education?.degree && ` - ${memberData.education.degree}`}
                            </p>
                          </div>
                        </li>
                        
                        {member.joinedAt && (
                          <li className="flex items-start">
                            <Calendar size={16} className="mt-0.5 mr-2 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-400">Joined Team</p>
                              <p className="text-sm text-white">{new Date(member.joinedAt).toLocaleDateString()}</p>
                            </div>
                          </li>
                        )}
                        
                        {member.customRole && (
                          <li className="flex items-start">
                            <Shield size={16} className="mt-0.5 mr-2 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-400">Custom Role</p>
                              <p className="text-sm text-white">{member.customRole}</p>
                            </div>
                          </li>
                        )}
                        
                        {memberData.skills && memberData.skills.length > 0 && (
                          <li className="flex items-start">
                            <Award size={16} className="mt-0.5 mr-2 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-400">Skills</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {memberData.skills.slice(0, 5).map((skill, idx) => (
                                  <span 
                                    key={idx} 
                                    className="px-2 py-1 bg-gray-800 text-gray-400 text-xs rounded-full"
                                  >
                                    {skill}
                                  </span>
                                ))}
                                {memberData.skills.length > 5 && (
                                  <span className="px-2 py-1 bg-gray-800 text-gray-400 text-xs rounded-full">
                                    +{memberData.skills.length - 5} more
                                  </span>
                                )}
                              </div>
                            </div>
                          </li>
                        )}
                        
                        {member.responsibilities && member.responsibilities.length > 0 && (
                          <li className="flex items-start">
                            <BarChart size={16} className="mt-0.5 mr-2 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-400">Responsibilities</p>
                              <ul className="mt-1 list-disc list-inside text-sm text-gray-400">
                                {member.responsibilities.map((resp, idx) => (
                                  <li key={idx}>{resp}</li>
                                ))}
                              </ul>
                            </div>
                          </li>
                        )}
                      </ul>
                      
                      <div className="mt-4 space-x-3">
                        {memberId && (
                          <button
                            onClick={() => handleViewProfile(member)}
                            className="inline-flex items-center text-sm bg-[#E8C848]/10 text-[#E8C848] px-3 py-1.5 rounded-lg hover:bg-[#E8C848]/20"
                          >
                            <User size={14} className="mr-1" />
                            View Profile
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-3">Provide Feedback</h4>
                      <textarea
                        value={memberFeedback}
                        onChange={(e) => setMemberFeedback(e.target.value)}
                        placeholder="Write your feedback for this team member..."
                        className="w-full px-3 py-2 bg-[#1A1A1A] border border-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E8C848]/50 focus:border-[#E8C848] text-white placeholder-gray-500"
                        rows="5"
                      />
                      <div className="mt-3 flex justify-end">
                        <button
                          onClick={() => handleSubmitFeedback(memberId)}
                          disabled={isSubmittingFeedback || !memberFeedback.trim()}
                          className={`px-4 py-2 rounded-md ${
                            isSubmittingFeedback || !memberFeedback.trim()
                              ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                              : 'bg-[#E8C848] text-[#121212] hover:bg-[#E8C848]/80'
                          }`}
                        >
                          {isSubmittingFeedback ? 'Submitting...' : 'Submit Feedback'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TeamMembersList;