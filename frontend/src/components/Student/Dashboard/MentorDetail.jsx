import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { 
  User, ChevronLeft, MessageCircle, Github, Globe, LinkIcon, 
  MapPin, Briefcase, Star, BookOpen, Calendar, Clock, Award,
  FileText, ExternalLink, Mail, Phone, Languages, Coffee,
  Users, CheckCircle2, Rocket, Bookmark, Heart, Zap, 
  Linkedin, Twitter
} from 'lucide-react';
import axios from 'axios';
import { useUser } from '../../../../context/UserContext';
import ChatModal from '../ChatModal';
import MentorPlaceholder from "../../../public/mentor_placeholder.png";

const MentorDetail = () => {
  const { mentorId } = useParams();
  const navigate = useNavigate();
  const { userData } = useUser();
  
  const [mentor, setMentor] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requestStatus, setRequestStatus] = useState(null);
  
  // Chat modal state
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  useEffect(() => {
    const fetchMentorDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:4000/api/student/mentor/${mentorId}`);
        
        if (response.data && response.data.success) {
          // Pre-process the mentor data to ensure all properties have valid types
          const mentorData = response.data.mentor;
          
          // Normalize expertise and skills to be arrays if they exist
          if (mentorData.expertise && !Array.isArray(mentorData.expertise)) {
            mentorData.expertise = typeof mentorData.expertise === 'string' 
              ? [mentorData.expertise] 
              : [];
          }
          
          if (mentorData.skills && !Array.isArray(mentorData.skills)) {
            mentorData.skills = typeof mentorData.skills === 'string' 
              ? [mentorData.skills] 
              : [];
          }
          
          // Ensure other arrays are initialized
          mentorData.mentorshipFocusAreas = Array.isArray(mentorData.mentorshipFocusAreas) 
            ? mentorData.mentorshipFocusAreas 
            : [];
            
          mentorData.workExperience = Array.isArray(mentorData.workExperience) 
            ? mentorData.workExperience 
            : [];
            
          mentorData.projects = Array.isArray(mentorData.projects) 
            ? mentorData.projects 
            : [];
            
          mentorData.achievements = Array.isArray(mentorData.achievements) 
            ? mentorData.achievements 
            : [];
            
          mentorData.languages = Array.isArray(mentorData.languages) 
            ? mentorData.languages 
            : [];
            
          mentorData.industriesWorkedIn = Array.isArray(mentorData.industriesWorkedIn) 
            ? mentorData.industriesWorkedIn 
            : [];
          
          setMentor(mentorData);
        } else {
          setError("Failed to fetch mentor details");
        }
      } catch (err) {
        console.error("Error fetching mentor details:", err);
        setError(err.response?.data?.message || "An error occurred while fetching mentor details");
      } finally {
        setLoading(false);
      }
    };
    
    if (mentorId) {
      fetchMentorDetails();
    }
  }, [mentorId]);
  
  const handleOpenChat = () => {
    if (mentor) {
      setIsChatOpen(true);
    }
  };
  
  const handleCloseChat = () => {
    setIsChatOpen(false);
  };
  
  const handleRequestMentorship = async () => {
    try {
      setRequestStatus('loading');
      
      // Here you would typically make an API call to request mentorship
      // For now we'll just simulate it with a timeout
      setTimeout(() => {
        setRequestStatus('success');
      }, 1500);
      
    } catch (error) {
      console.error("Error requesting mentorship:", error);
      setRequestStatus('error');
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#121212]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E8C848]"></div>
      </div>
    );
  }
  
  if (error || !mentor) {
    return (
      <div className="max-w-5xl mx-auto p-6 bg-[#121212]">
        <div className="text-center py-10 bg-[#1A1A1A] rounded-lg shadow-lg border border-gray-800 hover:border-[#E8C848]/30 transition-all duration-300">
          <User size={48} className="mx-auto text-[#E8C848]/50 mb-3" />
          <h2 className="text-xl font-medium text-white mb-2">Mentor Not Found</h2>
          <p className="text-gray-400 mb-4">{error || "Unable to load mentor details"}</p>
          <button 
            onClick={() => navigate('/student/mentors')}
            className="inline-flex items-center px-4 py-2 bg-[#E8C848]/10 text-[#E8C848] rounded-lg hover:bg-[#E8C848]/20 transition-all duration-300"
          >
            <ChevronLeft size={16} className="mr-1" />
            Back to Mentors
          </button>
        </div>
      </div>
    );
  }

  // Extract current company name with safety checks
  const companyName = typeof mentor.currentCompany === 'string' 
    ? mentor.currentCompany 
    : typeof mentor.current_company === 'string'
      ? mentor.current_company
      : mentor.currentCompany && typeof mentor.currentCompany === 'object' && mentor.currentCompany.name
        ? mentor.currentCompany.name
        : mentor.current_company && typeof mentor.current_company === 'object' && mentor.current_company.name
          ? mentor.current_company.name
          : '';

  // Extract title/role with safety checks
  const mentorTitle = typeof mentor.title === 'string'
    ? mentor.title
    : typeof mentor.current_role === 'string'
      ? mentor.current_role
      : 'Mentor';
      
  // Extract location with safety checks
  const locationText = typeof mentor.location === 'string'
    ? mentor.location
    : typeof mentor.location === 'object' && (mentor.location.city || mentor.location.country)
      ? `${mentor.location.city || ''} ${mentor.location.country || ''}`.trim()
      : '';

  return (
    <>
      <Helmet>
        <title>{mentor.name || 'Mentor'} | Mentor Profile | TalentHunt</title>
      </Helmet>
      
      <div className="bg-[#121212] min-h-screen py-8">
        <div className="max-w-5xl mx-auto px-4">
          <button 
            onClick={() => navigate('/student/mentors')}
            className="flex items-center text-[#E8C848] hover:text-[#E8C848]/80 transition-all duration-300 mb-6"
          >
            <ChevronLeft size={20} className="mr-1" />
            Back to Mentors
          </button>
          
          <div className="bg-[#1A1A1A] rounded-lg shadow-lg overflow-hidden border border-gray-800 hover:border-[#E8C848]/30 transition-all duration-300">
            {/* Header / Profile Summary */}
            <div className="p-6 border-b border-gray-800">
              <div className="flex flex-col md:flex-row items-start md:items-center">
                <img 
                  src={mentor.profilePicture || mentor.profile_picture || MentorPlaceholder} 
                  alt={mentor.name || 'Mentor'} 
                  className="w-24 h-24 rounded-full object-cover mb-4 md:mb-0 md:mr-6"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/96?text=👤';
                  }}
                />
                
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <h1 className="text-2xl font-bold text-white">{mentor.name || 'Unnamed Mentor'}</h1>
                      <p className="text-gray-400 font-medium">{mentorTitle}</p>
                      
                      <div className="flex flex-wrap items-center mt-2">
                        {companyName && (
                          <span className="flex items-center text-sm text-gray-400 mr-4">
                            <Briefcase size={14} className="mr-1" />
                            {companyName}
                          </span>
                        )}
                        
                        {locationText && (
                          <span className="flex items-center text-sm text-gray-400 mr-4">
                            <MapPin size={14} className="mr-1" />
                            {locationText}
                          </span>
                        )}
                        
                        {mentor.yearsOfExperience && (
                          <span className="flex items-center text-sm text-gray-400">
                            <Clock size={14} className="mr-1" />
                            {mentor.yearsOfExperience} years experience
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-3 mt-4 md:mt-0">
                      <button 
                        onClick={handleOpenChat}
                        className="bg-[#E8C848]/10 text-[#E8C848] px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#E8C848]/20 transition-all duration-300 flex items-center"
                      >
                        <MessageCircle size={16} className="mr-2" />
                        Message
                      </button>
                      
                      <button 
                        onClick={handleRequestMentorship}
                        disabled={requestStatus === 'loading' || requestStatus === 'success'}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center 
                          ${requestStatus === 'success' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-[#E8C848] text-white hover:bg-[#E8C848]/80'
                          } ${(requestStatus === 'loading' || requestStatus === 'success') && 'cursor-not-allowed opacity-80'}`}
                      >
                        {requestStatus === 'loading' ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white mr-2"></div>
                            Processing...
                          </>
                        ) : requestStatus === 'success' ? (
                          <>
                            <CheckCircle2 size={16} className="mr-2" />
                            Request Sent
                          </>
                        ) : (
                          <>
                            <Users size={16} className="mr-2" />
                            Request Mentorship
                          </>
                        )}
                      </button>
                    </div>
                    
                    {typeof mentor.averageRating === 'number' && mentor.averageRating > 0 && (
                      <div className="flex items-center mt-3">
                        <div className="flex">
                          {[...Array(5)].map((_, index) => (
                            <Star 
                              key={index} 
                              size={16} 
                              className={`${
                                index < Math.floor(mentor.averageRating) 
                                  ? 'text-[#E8C848] fill-[#E8C848]' 
                                  : index < mentor.averageRating 
                                    ? 'text-[#E8C848] fill-[#E8C848] opacity-50' 
                                    : 'text-gray-800'
                              }`} 
                            />
                          ))}
                        </div>
                        <span className="ml-2 text-sm text-gray-400">
                          {mentor.averageRating.toFixed(1)} ({mentor.totalReviews || 0} reviews)
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Main Content Grid */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Column - Bio and Areas of Expertise */}
              <div className="md:col-span-2 space-y-6">
                {/* Bio Section */}
                {mentor.bio && (
                  <div>
                    <h2 className="text-lg font-semibold text-white mb-3">About</h2>
                    <p className="text-gray-400 whitespace-pre-line">{mentor.bio}</p>
                  </div>
                )}
                
                {/* Areas of Expertise - Safely rendered */}
                <div>
                  <h2 className="text-lg font-semibold text-white mb-3">Areas of Expertise</h2>
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(mentor.expertise) && mentor.expertise.length > 0 ? (
                      mentor.expertise.map((skill, index) => (
                        <span key={index} className="bg-[#E8C848]/10 text-[#E8C848] px-3 py-1 rounded-full text-sm">
                          {typeof skill === 'string' ? skill : JSON.stringify(skill)}
                        </span>
                      ))
                    ) : Array.isArray(mentor.skills) && mentor.skills.length > 0 ? (
                      mentor.skills.map((skill, index) => (
                        <span key={index} className="bg-[#E8C848]/10 text-[#E8C848] px-3 py-1 rounded-full text-sm">
                          {typeof skill === 'string' ? skill : JSON.stringify(skill)}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-400 italic">No specific expertise listed</p>
                    )}
                  </div>
                </div>
                
                {/* Mentorship Focus Areas - Safely rendered */}
                {Array.isArray(mentor.mentorshipFocusAreas) && mentor.mentorshipFocusAreas.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold text-white mb-3">Mentorship Focus</h2>
                    <div className="space-y-2">
                      {mentor.mentorshipFocusAreas.map((area, index) => (
                        <div key={index} className="flex items-start">
                          <Rocket size={16} className="text-[#E8C848] mt-1 mr-3" />
                          <span className="text-gray-400">{typeof area === 'string' ? area : JSON.stringify(area)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Work Experience - Safely rendered */}
                {Array.isArray(mentor.workExperience) && mentor.workExperience.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold text-white mb-3">Experience</h2>
                    <div className="space-y-4">
                      {mentor.workExperience.map((role, index) => {
                        // Safely extract role data
                        const roleTitle = typeof role === 'object' && typeof role.role === 'string' 
                          ? role.role 
                          : 'Role';
                          
                        const companyName = typeof role === 'object' && typeof role.company === 'string'
                          ? role.company
                          : 'Company';
                          
                        const description = typeof role === 'object' && typeof role.description === 'string'
                          ? role.description
                          : '';
                          
                        return (
                          <div key={index} className="relative pl-6 pb-4 border-l border-gray-800">
                            <div className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full bg-[#E8C848]/30 border-2 border-[#E8C848]"></div>
                            <h3 className="font-medium text-white">{roleTitle}</h3>
                            <p className="text-gray-400">{companyName}</p>
                            {role && role.startDate && (
                              <p className="text-gray-400 text-sm">
                                {new Date(role.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })} - 
                                {role.endDate 
                                  ? new Date(role.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
                                  : 'Present'}
                              </p>
                            )}
                            {description && (
                              <p className="text-gray-400 text-sm mt-1">{description}</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {/* Notable Projects - Safely rendered */}
                {Array.isArray(mentor.projects) && mentor.projects.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold text-white mb-3">Notable Projects</h2>
                    <div className="space-y-4">
                      {mentor.projects.map((project, index) => {
                        // Safely extract project data
                        const projectName = typeof project === 'object' && typeof project.name === 'string'
                          ? project.name
                          : 'Project';
                          
                        const projectRole = typeof project === 'object' && typeof project.role === 'string'
                          ? project.role
                          : '';
                          
                        const projectDesc = typeof project === 'object' && typeof project.description === 'string'
                          ? project.description
                          : '';
                          
                        const projectTechs = typeof project === 'object' && Array.isArray(project.technologies)
                          ? project.technologies
                          : [];
                          
                        return (
                          <div key={index} className="border border-gray-800 rounded-lg p-4">
                            <h3 className="font-semibold text-white">{projectName}</h3>
                            {projectRole && (
                              <p className="text-[#E8C848] text-sm">{projectRole}</p>
                            )}
                            {projectDesc && (
                              <p className="text-gray-400 text-sm mt-1 mb-3">{projectDesc}</p>
                            )}
                            
                            {/* Tech Stack - Safely rendered */}
                            {projectTechs.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-3">
                                {projectTechs.map((tech, i) => (
                                  <span key={i} className="bg-[#E8C848]/10 text-[#E8C848] text-xs px-2 py-0.5 rounded-full">
                                    {typeof tech === 'string' ? tech : ''}
                                  </span>
                                ))}
                              </div>
                            )}
                            
                            {/* Project Links */}
                            <div className="flex gap-3">
                              {project && project.github && (
                                <a 
                                  href={project.github} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="flex items-center text-gray-400 hover:text-white text-xs"
                                >
                                  <Github size={14} className="mr-1" />
                                  GitHub
                                </a>
                              )}
                              
                              {project && project.link && (
                                <a 
                                  href={project.link} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="flex items-center text-gray-400 hover:text-white text-xs"
                                >
                                  <Globe size={14} className="mr-1" />
                                  View Project
                                </a>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {/* Achievements - Safely rendered */}
                {Array.isArray(mentor.achievements) && mentor.achievements.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold text-white mb-3">Achievements</h2>
                    <div className="space-y-3">
                      {mentor.achievements.map((achievement, index) => {
                        // Safely extract achievement data
                        const achievementTitle = typeof achievement === 'object' && typeof achievement.title === 'string'
                          ? achievement.title
                          : '';
                          
                        const achievementDesc = typeof achievement === 'object' && typeof achievement.description === 'string'
                          ? achievement.description
                          : '';
                          
                        return (
                          <div key={index} className="flex items-start">
                            <Award size={16} className="text-[#E8C848] mt-1 mr-3" />
                            <div>
                              {achievementTitle && (
                                <h3 className="font-medium text-white">{achievementTitle}</h3>
                              )}
                              {achievementDesc && (
                                <p className="text-gray-400 text-sm">{achievementDesc}</p>
                              )}
                              {achievement && achievement.date && (
                                <p className="text-gray-400 text-xs mt-1">
                                  {new Date(achievement.date).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Right Column - Sidebar Information */}
              <div className="space-y-6">
                {/* Availability and Contact - safely rendered */}
                <div className="bg-[#121212] p-4 rounded-lg border border-gray-800 hover:border-[#E8C848]/30 transition-all duration-300">
                  <h2 className="text-lg font-semibold text-white mb-3 flex items-center">
                    <Coffee size={18} className="mr-2 text-[#E8C848]" />
                    Availability
                  </h2>
                  
                  {mentor.mentorshipAvailability && typeof mentor.mentorshipAvailability === 'object' ? (
                    <div className="space-y-3">
                      {mentor.mentorshipAvailability.status && (
                        <div className="flex items-center text-[#E8C848]">
                          <CheckCircle2 size={16} className="mr-2" />
                          <span className="font-medium">
                            {mentor.mentorshipAvailability.status === 'available' 
                              ? 'Available for mentorship' 
                              : mentor.mentorshipAvailability.status === 'limited' 
                                ? 'Limited availability' 
                                : 'Currently unavailable'}
                          </span>
                        </div>
                      )}
                      
                      {mentor.mentorshipAvailability.hours_per_week && (
                        <p className="text-sm text-[#E8C848] flex items-center">
                          <Clock size={14} className="mr-2" />
                          {mentor.mentorshipAvailability.hours_per_week} hours/week
                        </p>
                      )}
                      
                      {mentor.mentorshipAvailability.preferred_meeting_times && (
                        <p className="text-sm text-[#E8C848]">
                          <span className="font-medium">Preferred times: </span>
                          {mentor.mentorshipAvailability.preferred_meeting_times}
                        </p>
                      )}
                      
                      {mentor.mentorshipAvailability.note && (
                        <p className="text-sm text-[#E8C848] mt-2 border-t border-[#E8C848]/10 pt-2">
                          {mentor.mentorshipAvailability.note}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-[#E8C848]">Contact for availability</p>
                  )}
                </div>
                
                {/* Contact Information */}
                <div className="bg-[#121212] p-4 rounded-lg border border-gray-800 hover:border-[#E8C848]/30 transition-all duration-300">
                  <h2 className="text-lg font-semibold text-white mb-3 flex items-center">
                    <Mail size={18} className="mr-2 text-[#E8C848]" />
                    Contact
                  </h2>
                  <div className="space-y-2">
                    {mentor.email && (
                      <a 
                        href={`mailto:${mentor.email}`}
                        className="flex items-center text-gray-400 hover:text-[#E8C848]"
                      >
                        <Mail size={16} className="mr-2" />
                        {mentor.email}
                      </a>
                    )}
                    
                    {mentor.phone && (
                      <a 
                        href={`tel:${mentor.phone}`}
                        className="flex items-center text-gray-400 hover:text-[#E8C848]"
                      >
                        <Phone size={16} className="mr-2" />
                        {mentor.phone}
                      </a>
                    )}
                    
                    {mentor.preferredContactMethod && (
                      <p className="text-gray-400 text-sm mt-2">
                        <span className="font-medium">Preferred contact: </span>
                        {mentor.preferredContactMethod}
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Education - Safely rendered */}
                {mentor.education && (
                  <div className="bg-[#121212] p-4 rounded-lg border border-gray-800 hover:border-[#E8C848]/30 transition-all duration-300">
                    <h2 className="text-lg font-semibold text-white mb-3 flex items-center">
                      <BookOpen size={18} className="mr-2 text-[#E8C848]" />
                      Education
                    </h2>
                    <div className="space-y-3">
                      {Array.isArray(mentor.education) ? (
                        mentor.education.map((edu, index) => {
                          // Safely extract education data
                          const institution = typeof edu === 'object' && typeof edu.institution === 'string'
                            ? edu.institution
                            : '';
                            
                          const degree = typeof edu === 'object' && typeof edu.degree === 'string'
                            ? edu.degree
                            : '';
                            
                          const year = edu && edu.year ? edu.year : null;
                          
                          if (!institution && !degree) return null;
                          
                          return (
                            <div key={index}>
                              {institution && (
                                <p className="font-medium text-white">{institution}</p>
                              )}
                              {degree && (
                                <p className="text-gray-400">{degree}</p>
                              )}
                              {year && (
                                <p className="text-gray-400 text-sm">Class of {year}</p>
                              )}
                            </div>
                          );
                        }).filter(Boolean)
                      ) : mentor.education && typeof mentor.education === 'object' ? (
                        <div>
                          {mentor.education.institution && typeof mentor.education.institution === 'string' && (
                            <p className="font-medium text-white">{mentor.education.institution}</p>
                          )}
                          {mentor.education.degree && typeof mentor.education.degree === 'string' && (
                            <p className="text-gray-400">{mentor.education.degree}</p>
                          )}
                          {mentor.education.year && (
                            <p className="text-gray-400 text-sm">Class of {mentor.education.year}</p>
                          )}
                        </div>
                      ) : null}
                    </div>
                  </div>
                )}
                
                {/* Languages - Safely rendered */}
                {Array.isArray(mentor.languages) && mentor.languages.length > 0 && (
                  <div className="bg-[#121212] p-4 rounded-lg border border-gray-800 hover:border-[#E8C848]/30 transition-all duration-300">
                    <h2 className="text-lg font-semibold text-white mb-3 flex items-center">
                      <Languages size={18} className="mr-2 text-[#E8C848]" />
                      Languages
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {mentor.languages.map((language, index) => (
                        <span key={index} className="bg-[#E8C848]/10 text-[#E8C848] px-3 py-1 rounded-full text-sm">
                          {typeof language === 'string' ? language : ''}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Industries - Safely rendered */}
                {Array.isArray(mentor.industriesWorkedIn) && mentor.industriesWorkedIn.length > 0 && (
                  <div className="bg-[#121212] p-4 rounded-lg border border-gray-800 hover:border-[#E8C848]/30 transition-all duration-300">
                    <h2 className="text-lg font-semibold text-white mb-3 flex items-center">
                      <Briefcase size={18} className="mr-2 text-[#E8C848]" />
                      Industries
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {mentor.industriesWorkedIn.map((industry, index) => (
                        <span key={index} className="bg-[#E8C848]/10 text-[#E8C848] px-3 py-1 rounded-full text-sm">
                          {typeof industry === 'string' ? industry : ''}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Social Links - Safely rendered */}
                {mentor.socialLinks && typeof mentor.socialLinks === 'object' && (
                  (mentor.socialLinks.github || 
                  mentor.socialLinks.linkedin || 
                  mentor.socialLinks.twitter ||
                  mentor.socialLinks.website) ? (
                  <div className="bg-[#121212] p-4 rounded-lg border border-gray-800 hover:border-[#E8C848]/30 transition-all duration-300">
                    <h2 className="text-lg font-semibold text-white mb-3 flex items-center">
                      <LinkIcon size={18} className="mr-2 text-[#E8C848]" />
                      Connect
                    </h2>
                    <div className="space-y-2">
                      {mentor.socialLinks.github && (
                        <a 
                          href={mentor.socialLinks.github}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center text-gray-400 hover:text-[#E8C848]"
                        >
                          <Github size={16} className="mr-2" />
                          GitHub
                          <ExternalLink size={12} className="ml-1" />
                        </a>
                      )}
                      
                      {mentor.socialLinks.linkedin && (
                        <a 
                          href={mentor.socialLinks.linkedin}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center text-gray-400 hover:text-[#E8C848]"
                        >
                          <Linkedin size={16} className="mr-2" />
                          LinkedIn
                          <ExternalLink size={12} className="ml-1" />
                        </a>
                      )}
                      
                      {mentor.socialLinks.twitter && (
                        <a 
                          href={mentor.socialLinks.twitter}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center text-gray-400 hover:text-[#E8C848]"
                        >
                          <Twitter size={16} className="mr-2" />
                          Twitter
                          <ExternalLink size={12} className="ml-1" />
                        </a>
                      )}
                      
                      {mentor.socialLinks.website && (
                        <a 
                          href={mentor.socialLinks.website}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center text-gray-400 hover:text-[#E8C848]"
                        >
                          <Globe size={16} className="mr-2" />
                          Website
                          <ExternalLink size={12} className="ml-1" />
                        </a>
                      )}
                    </div>
                  </div>
                ) : null)}
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-center">
            <button 
              onClick={() => navigate('/student/mentors')}
              className="bg-[#E8C848]/10 text-[#E8C848] px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#E8C848]/20 transition-all duration-300"
            >
              <ChevronLeft size={16} className="inline mr-2" />
              Back to All Mentors
            </button>
          </div>
        </div>
      </div>
      
      {/* Chat Modal */}
      <ChatModal 
        isOpen={isChatOpen} 
        onClose={handleCloseChat} 
        user={mentor} 
        currentUser={userData}
      />
    </>
  );
};

export default MentorDetail;