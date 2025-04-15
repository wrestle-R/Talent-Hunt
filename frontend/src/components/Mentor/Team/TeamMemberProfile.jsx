import React, { useState, useEffect } from 'react';
import { X, User, Mail, Book, ChevronLeft, Calendar, 
  Briefcase, Award, Github, Linkedin, Globe, FileText } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import StudentPlaceholder from '../../../public/student_placeholder.png';
import MentorPlaceholder from '../../../public/mentor_placeholder.png';

const TeamMemberProfile = ({ isOpen, onClose, member, mentorId, onDataChange }) => {
  const [memberData, setMemberData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackList, setFeedbackList] = useState([]);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    if (isOpen && member?.student?._id) {
      fetchMemberProfile();
    }
  }, [isOpen, member]);

  const fetchMemberProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:4000/api/mentor/student-profile/${member.student._id}`);
      
      if (response.data.success) {
        setMemberData(response.data.student);
        setFeedbackList(response.data.feedback || []);
      } else {
        toast.error("Failed to load member profile");
      }
    } catch (error) {
      console.error("Error fetching member profile:", error);
      toast.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFeedback = async () => {
    if (!feedback.trim()) {
      toast.error("Feedback cannot be empty");
      return;
    }
    
    try {
      setIsSubmittingFeedback(true);
      
      const response = await axios.post(`http://localhost:4000/api/mentor/member-feedback/${member.student._id}`, {
        mentorId,
        feedback: feedback.trim()
      });
      
      if (response.data.success) {
        toast.success("Feedback submitted successfully");
        setFeedback('');
        fetchMemberProfile(); // Refresh feedback list
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-[#1A1A1A] rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-gray-800">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center bg-[#121212]">
          <div className="flex items-center">
            <button 
              onClick={onClose}
              className="p-1 mr-3 rounded-full hover:bg-[#E8C848]/10 text-[#E8C848]"
            >
              <ChevronLeft size={20} />
            </button>
            <h2 className="text-lg font-semibold text-white flex items-center">
              <User size={20} className="mr-2 text-[#E8C848]" />
              Member Profile
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-[#E8C848]/10 text-gray-400"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-4 border-b border-gray-800">
          <div className="flex space-x-6">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-2 border-b-2 font-medium ${
                activeTab === 'profile'
                  ? 'border-[#E8C848] text-[#E8C848]'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              Profile
            </button>
            <button
              onClick={() => setActiveTab('feedback')}
              className={`py-2 border-b-2 font-medium ${
                activeTab === 'feedback'
                  ? 'border-[#E8C848] text-[#E8C848]'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              Feedback
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 120px)' }}>
          {activeTab === 'profile' && (
            <div className="p-6">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#E8C848]"></div>
                </div>
              ) : (
                <div className="flex flex-col md:flex-row items-start gap-6">
                  {/* Profile Sidebar */}
                  <div className="w-full md:w-1/3">
                    <div className="bg-[#121212] p-4 rounded-lg border border-gray-800">
                      <div className="mb-4 flex justify-center">
                        <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-800">
                          {memberData?.profile_picture ? (
                            <img 
                              src={memberData.profile_picture} 
                              alt={memberData.name} 
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-[#E8C848]/10 text-[#E8C848]">
                              <User size={48} />
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-center text-white">{memberData?.name}</h3>
                      
                      {member.role && (
                        <p className="text-gray-500 text-center mb-4">{member.role}</p>
                      )}
                      
                      <div className="space-y-3 mt-6">
                        <div className="flex items-center text-sm text-gray-400">
                          <Mail size={16} className="text-gray-500 mr-2" />
                          <span>{memberData?.email}</span>
                        </div>
                        
                        {memberData?.education?.institution && (
                          <div className="flex items-center text-sm text-gray-400">
                            <Book size={16} className="text-gray-500 mr-2" />
                            <span>{memberData.education.institution}</span>
                          </div>
                        )}
                        
                        {member.joinedAt && (
                          <div className="flex items-center text-sm text-gray-400">
                            <Calendar size={16} className="text-gray-500 mr-2" />
                            <span>Joined {new Date(member.joinedAt).toLocaleDateString()}</span>
                          </div>
                        )}
                        
                        {memberData?.social_links && (
                          <div className="pt-4 mt-4 border-t border-gray-800">
                            <h4 className="text-xs uppercase text-gray-500 mb-2">Social Profiles</h4>
                            <div className="flex flex-wrap gap-2">
                              {memberData.social_links.github && (
                                <a 
                                  href={memberData.social_links.github}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2 rounded-full bg-[#E8C848]/10 hover:bg-[#E8C848]/20 text-[#E8C848]"
                                >
                                  <Github size={18} />
                                </a>
                              )}
                              {memberData.social_links.linkedin && (
                                <a 
                                  href={memberData.social_links.linkedin}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2 rounded-full bg-[#E8C848]/10 hover:bg-[#E8C848]/20 text-[#E8C848]"
                                >
                                  <Linkedin size={18} />
                                </a>
                              )}
                              {memberData.social_links.portfolio && (
                                <a 
                                  href={memberData.social_links.portfolio}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2 rounded-full bg-[#E8C848]/10 hover:bg-[#E8C848]/20 text-[#E8C848]"
                                >
                                  <Globe size={18} />
                                </a>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Main Content */}
                  <div className="w-full md:w-2/3 space-y-6">
                    {/* Bio */}
                    {memberData?.bio && (
                      <div>
                        <h3 className="text-md font-medium text-white mb-2">About</h3>
                        <p className="text-gray-400">{memberData.bio}</p>
                      </div>
                    )}

                    {/* Skills */}
                    {memberData?.skills && memberData.skills.length > 0 && (
                      <div>
                        <h3 className="text-md font-medium text-white mb-2">Skills</h3>
                        <div className="flex flex-wrap gap-2">
                          {memberData.skills.map((skill, idx) => (
                            <span 
                              key={idx} 
                              className="px-3 py-1 bg-[#E8C848]/10 text-[#E8C848] rounded-full text-sm"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Team Responsibilities */}
                    {member.responsibilities && member.responsibilities.length > 0 && (
                      <div>
                        <h3 className="text-md font-medium text-white mb-2">Team Responsibilities</h3>
                        <ul className="list-disc list-inside text-gray-400 space-y-1">
                          {member.responsibilities.map((resp, idx) => (
                            <li key={idx}>{resp}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Experience */}
                    {memberData?.experience && memberData.experience.length > 0 && (
                      <div>
                        <h3 className="text-md font-medium text-white mb-2">Experience</h3>
                        <div className="space-y-4">
                          {memberData.experience.map((exp, idx) => (
                            <div key={idx} className="border-l-2 border-[#E8C848] pl-4 py-1">
                              <h4 className="font-medium text-white">{exp.position}</h4>
                              <p className="text-sm text-gray-400">{exp.company}</p>
                              <p className="text-xs text-gray-500">
                                {exp.startDate && new Date(exp.startDate).toLocaleDateString()} - 
                                {exp.endDate ? new Date(exp.endDate).toLocaleDateString() : 'Present'}
                              </p>
                              {exp.description && (
                                <p className="text-sm text-gray-400 mt-1">{exp.description}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Personal Projects */}
                    {memberData?.projects && memberData.projects.length > 0 && (
                      <div>
                        <h3 className="text-md font-medium text-white mb-2">Personal Projects</h3>
                        <div className="space-y-4">
                          {memberData.projects.map((proj, idx) => (
                            <div key={idx} className="bg-[#121212] p-3 rounded-lg border border-gray-800">
                              <h4 className="font-medium text-white">{proj.title}</h4>
                              {proj.description && (
                                <p className="text-sm text-gray-400 mt-1">{proj.description}</p>
                              )}
                              <div className="flex gap-3 mt-2">
                                {proj.githubRepo && (
                                  <a 
                                    href={proj.githubRepo}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-[#E8C848] hover:underline flex items-center"
                                  >
                                    <Github size={12} className="mr-1" />
                                    GitHub
                                  </a>
                                )}
                                {proj.liveDemo && (
                                  <a 
                                    href={proj.liveDemo}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-[#E8C848] hover:underline flex items-center"
                                  >
                                    <Globe size={12} className="mr-1" />
                                    Live Demo
                                  </a>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Feedback Tab */}
          {activeTab === 'feedback' && (
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-md font-medium text-white mb-2">Provide Feedback</h3>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder={`Write your feedback for ${member.student?.name || 'this member'}...`}
                  className="w-full px-3 py-2 bg-[#121212] border border-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E8C848]/50 focus:border-[#E8C848] text-white placeholder-gray-500"
                  rows="5"
                />
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={handleSubmitFeedback}
                    disabled={isSubmittingFeedback || !feedback.trim()}
                    className={`px-4 py-2 rounded-md ${
                      isSubmittingFeedback || !feedback.trim()
                        ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                        : 'bg-[#E8C848] text-[#121212] hover:bg-[#E8C848]/80'
                    }`}
                  >
                    {isSubmittingFeedback ? 'Submitting...' : 'Submit Feedback'}
                  </button>
                </div>
              </div>

              {/* Previous Feedback */}
              <div>
                <h3 className="text-md font-medium text-white mb-2">Previous Feedback</h3>
                {feedbackList.length > 0 ? (
                  <div className="space-y-4">
                    {feedbackList.map((fb, idx) => (
                      <div key={idx} className="bg-[#121212] p-4 rounded-lg border border-gray-800">
                        <p className="text-gray-300">{fb.content}</p>
                        <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                          <span>{new Date(fb.date).toLocaleDateString()}</span>
                          <span>{fb.mentorName || 'You'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-[#121212] rounded-lg border border-gray-800">
                    <FileText size={32} className="mx-auto text-gray-600 mb-3" />
                    <p className="text-gray-400">No feedback yet</p>
                    <p className="text-sm text-gray-500">Be the first to provide feedback</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamMemberProfile;