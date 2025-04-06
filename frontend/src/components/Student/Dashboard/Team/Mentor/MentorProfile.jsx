import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { 
  User, ChevronLeft, MessageCircle, Github, Globe, LinkIcon, 
  MapPin, Briefcase, Star, BookOpen, Calendar, Clock, Award,
  FileText, ExternalLink, Mail, Phone, Languages, Coffee,
  Users, CheckCircle2, Rocket, Bookmark, Heart, Zap, 
  Linkedin, Twitter, XCircle, RefreshCcw
} from 'lucide-react';
import axios from 'axios';
import { useUser } from '../../../../../../context/UserContext';
import ChatModal from '../../../ChatModal';
import MentorPlaceholder from "../../../../../public/mentor_placeholder.png";

const MentorDetail = () => {
  const { mentorId } = useParams();
  const navigate = useNavigate();
  const { userData } = useUser();
  
  const [mentor, setMentor] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requestStatus, setRequestStatus] = useState(null);
  const [requestMessage, setRequestMessage] = useState('');
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  useEffect(() => {
    const fetchMentorDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:4000/api/student/mentor/${mentorId}`);
        
        if (response.data && response.data.success) {
          setMentor(response.data.mentor);
          await checkExistingRequest();
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

    const checkExistingRequest = async () => {
      try {
        const response = await axios.get(
          `http://localhost:4000/api/student/mentor/${mentorId}/request-status?uid=${userData.firebaseUID}`
        );
        if (response.data.hasApplication) {
          setRequestStatus(response.data.application.status);
        }
      } catch (error) {
        console.error("Error checking request status:", error);
      }
    };
    
    if (mentorId && userData) {
      fetchMentorDetails();
    }
  }, [mentorId, userData]);
  
  const handleOpenChat = () => {
    if (mentor) {
      setIsChatOpen(true);
    }
  };
  
  const handleCloseChat = () => {
    setIsChatOpen(false);
  };

  const handleOpenRequestForm = () => {
    setShowRequestForm(true);
  };

  const handleCloseRequestForm = () => {
    setShowRequestForm(false);
    setRequestMessage('');
  };

  const handleRequestMentorship = async (e) => {
    e.preventDefault();
    
    try {
      setRequestStatus('loading');
      
      const response = await axios.post(
        `http://localhost:4000/api/student/mentor/${mentorId}/request`,
        {
          uid: userData.firebaseUID,
          message: requestMessage
        }
      );

      if (response.data.success) {
        setRequestStatus('pending');
        handleCloseRequestForm();
      }
    } catch (error) {
      console.error("Error requesting mentorship:", error);
      setRequestStatus('error');
    }
  };

  const getRequestStatusButton = () => {
    if (requestStatus === 'loading') {
      return (
        <button 
          disabled
          className="bg-yellow-500/10 text-yellow-500 px-4 py-2 rounded-lg text-sm font-medium 
                   flex items-center cursor-wait"
        >
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-yellow-500 mr-2"></div>
          Sending Request...
        </button>
      );
    }

    switch (requestStatus) {
      case null:
        return (
          <button 
            onClick={handleOpenRequestForm}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium 
                     transition-colors flex items-center"
          >
            <BookOpen size={16} className="mr-2" />
            Request Mentorship
          </button>
        );
      case 'pending':
        return (
          <button 
            disabled
            className="bg-yellow-500/10 text-yellow-500 px-4 py-2 rounded-lg text-sm font-medium 
                     flex items-center cursor-not-allowed"
          >
            <Clock size={16} className="mr-2" />
            Request Pending
          </button>
        );
      case 'accepted':
        return (
          <button 
            disabled
            className="bg-green-500/10 text-green-500 px-4 py-2 rounded-lg text-sm font-medium 
                     flex items-center cursor-not-allowed"
          >
            <CheckCircle2 size={16} className="mr-2" />
            Request Accepted
          </button>
        );
      case 'rejected':
        return (
          <button 
            disabled
            className="bg-red-500/10 text-red-500 px-4 py-2 rounded-lg text-sm font-medium 
                     flex items-center cursor-not-allowed"
          >
            <XCircle size={16} className="mr-2" />
            Request Declined
          </button>
        );
      case 'error':
        return (
          <button 
            onClick={handleOpenRequestForm}
            className="bg-red-500/10 text-red-500 px-4 py-2 rounded-lg text-sm font-medium 
                     flex items-center hover:bg-red-500/20"
          >
            <RefreshCcw size={16} className="mr-2" />
            Retry Request
          </button>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  if (error || !mentor) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="text-center py-10 bg-white rounded-lg shadow-sm border border-gray-200">
          <User size={48} className="mx-auto text-gray-300 mb-3" />
          <h2 className="text-xl font-medium text-gray-700 mb-2">Mentor Not Found</h2>
          <p className="text-gray-500 mb-4">{error || "Unable to load mentor details"}</p>
          <button 
            onClick={() => navigate('/student/mentors')}
            className="inline-flex items-center px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200"
          >
            <ChevronLeft size={16} className="mr-1" />
            Back to Mentors
          </button>
        </div>
      </div>
    );
  }

  const companyName = typeof mentor.currentCompany === 'string' 
    ? mentor.currentCompany 
    : typeof mentor.current_company === 'string'
      ? mentor.current_company
      : mentor.currentCompany && typeof mentor.currentCompany === 'object' && mentor.currentCompany.name
        ? mentor.currentCompany.name
        : mentor.current_company && typeof mentor.current_company === 'object' && mentor.current_company.name
          ? mentor.current_company.name
          : '';

  const mentorTitle = typeof mentor.title === 'string'
    ? mentor.title
    : typeof mentor.current_role === 'string'
      ? mentor.current_role
      : 'Mentor';
      
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
      
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100">
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
                      <h1 className="text-2xl font-bold text-gray-800">{mentor.name || 'Unnamed Mentor'}</h1>
                      <p className="text-gray-600 font-medium">{mentorTitle}</p>
                      
                      <div className="flex flex-wrap items-center mt-2">
                        {companyName && (
                          <span className="flex items-center text-sm text-gray-500 mr-4">
                            <Briefcase size={14} className="mr-1" />
                            {companyName}
                          </span>
                        )}
                        
                        {locationText && (
                          <span className="flex items-center text-sm text-gray-500 mr-4">
                            <MapPin size={14} className="mr-1" />
                            {locationText}
                          </span>
                        )}
                        
                        {mentor.yearsOfExperience && (
                          <span className="flex items-center text-sm text-gray-500">
                            <Clock size={14} className="mr-1" />
                            {mentor.yearsOfExperience} years experience
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-3 mt-4 md:mt-0">
                      {getRequestStatusButton()}
                      <button 
                        onClick={handleOpenChat}
                        className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition flex items-center"
                      >
                        <MessageCircle size={16} className="mr-2" />
                        Message
                      </button>
                    </div>
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
                                ? 'text-yellow-400 fill-yellow-400' 
                                : index < mentor.averageRating 
                                  ? 'text-yellow-400 fill-yellow-400 opacity-50' 
                                  : 'text-gray-300'
                            }`} 
                          />
                        ))}
                      </div>
                      <span className="ml-2 text-sm text-gray-600">
                        {mentor.averageRating.toFixed(1)} ({mentor.totalReviews || 0} reviews)
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                {mentor.bio && (
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800 mb-3">About</h2>
                    <p className="text-gray-700 whitespace-pre-line">{mentor.bio}</p>
                  </div>
                )}
                
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-3">Areas of Expertise</h2>
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(mentor.expertise) && mentor.expertise.length > 0 ? (
                      mentor.expertise.map((skill, index) => (
                        <span key={index} className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm">
                          {typeof skill === 'string' ? skill : JSON.stringify(skill)}
                        </span>
                      ))
                    ) : Array.isArray(mentor.skills) && mentor.skills.length > 0 ? (
                      mentor.skills.map((skill, index) => (
                        <span key={index} className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm">
                          {typeof skill === 'string' ? skill : JSON.stringify(skill)}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-500 italic">No specific expertise listed</p>
                    )}
                  </div>
                </div>
                
                {Array.isArray(mentor.mentorshipFocusAreas) && mentor.mentorshipFocusAreas.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800 mb-3">Mentorship Focus</h2>
                    <div className="space-y-2">
                      {mentor.mentorshipFocusAreas.map((area, index) => (
                        <div key={index} className="flex items-start">
                          <Rocket size={16} className="text-indigo-500 mt-1 mr-3" />
                          <span className="text-gray-700">{typeof area === 'string' ? area : JSON.stringify(area)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {Array.isArray(mentor.workExperience) && mentor.workExperience.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800 mb-3">Experience</h2>
                    <div className="space-y-4">
                      {mentor.workExperience.map((role, index) => {
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
                          <div key={index} className="relative pl-6 pb-4 border-l border-gray-200">
                            <div className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full bg-indigo-200 border-2 border-indigo-500"></div>
                            <h3 className="font-medium text-gray-800">{roleTitle}</h3>
                            <p className="text-gray-600">{companyName}</p>
                            {role && role.startDate && (
                              <p className="text-gray-500 text-sm">
                                {new Date(role.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })} - 
                                {role.endDate 
                                  ? new Date(role.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
                                  : 'Present'}
                              </p>
                            )}
                            {description && (
                              <p className="text-gray-700 text-sm mt-1">{description}</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {Array.isArray(mentor.projects) && mentor.projects.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800 mb-3">Notable Projects</h2>
                    <div className="space-y-4">
                      {mentor.projects.map((project, index) => {
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
                          <div key={index} className="border border-gray-200 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-800">{projectName}</h3>
                            {projectRole && (
                              <p className="text-indigo-600 text-sm">{projectRole}</p>
                            )}
                            {projectDesc && (
                              <p className="text-gray-600 text-sm mt-1 mb-3">{projectDesc}</p>
                            )}
                            
                            {projectTechs.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-3">
                                {projectTechs.map((tech, i) => (
                                  <span key={i} className="bg-indigo-50 text-indigo-700 text-xs px-2 py-0.5 rounded-full">
                                    {typeof tech === 'string' ? tech : ''}
                                  </span>
                                ))}
                              </div>
                            )}
                            
                            <div className="flex gap-3">
                              {project && project.github && (
                                <a 
                                  href={project.github} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="flex items-center text-gray-600 hover:text-gray-900 text-xs"
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
                                  className="flex items-center text-gray-600 hover:text-gray-900 text-xs"
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
                
                {Array.isArray(mentor.achievements) && mentor.achievements.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800 mb-3">Achievements</h2>
                    <div className="space-y-3">
                      {mentor.achievements.map((achievement, index) => {
                        const achievementTitle = typeof achievement === 'object' && typeof achievement.title === 'string'
                          ? achievement.title
                          : '';
                          
                        const achievementDesc = typeof achievement === 'object' && typeof achievement.description === 'string'
                          ? achievement.description
                          : '';
                          
                        return (
                          <div key={index} className="flex items-start">
                            <Award size={16} className="text-indigo-500 mt-1 mr-3" />
                            <div>
                              {achievementTitle && (
                                <h3 className="font-medium text-gray-800">{achievementTitle}</h3>
                              )}
                              {achievementDesc && (
                                <p className="text-gray-600 text-sm">{achievementDesc}</p>
                              )}
                              {achievement && achievement.date && (
                                <p className="text-gray-500 text-xs mt-1">
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
              
              <div className="space-y-6">
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <h2 className="text-lg font-semibold text-indigo-800 mb-3 flex items-center">
                    <Coffee size={18} className="mr-2" />
                    Availability
                  </h2>
                  
                  {mentor.mentorshipAvailability && typeof mentor.mentorshipAvailability === 'object' ? (
                    <div className="space-y-3">
                      {mentor.mentorshipAvailability.status && (
                        <div className="flex items-center text-indigo-700">
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
                        <p className="text-sm text-indigo-700 flex items-center">
                          <Clock size={14} className="mr-2" />
                          {mentor.mentorshipAvailability.hours_per_week} hours/week
                        </p>
                      )}
                      
                      {mentor.mentorshipAvailability.preferred_meeting_times && (
                        <p className="text-sm text-indigo-700">
                          <span className="font-medium">Preferred times: </span>
                          {mentor.mentorshipAvailability.preferred_meeting_times}
                        </p>
                      )}
                      
                      {mentor.mentorshipAvailability.note && (
                        <p className="text-sm text-indigo-700 mt-2 border-t border-indigo-100 pt-2">
                          {mentor.mentorshipAvailability.note}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-indigo-700">Contact for availability</p>
                  )}
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <Mail size={18} className="mr-2 text-indigo-600" />
                    Contact
                  </h2>
                  <div className="space-y-2">
                    {mentor.email && (
                      <a 
                        href={`mailto:${mentor.email}`}
                        className="flex items-center text-gray-700 hover:text-indigo-600"
                      >
                        <Mail size={16} className="mr-2" />
                        {mentor.email}
                      </a>
                    )}
                    
                    {mentor.phone && (
                      <a 
                        href={`tel:${mentor.phone}`}
                        className="flex items-center text-gray-700 hover:text-indigo-600"
                      >
                        <Phone size={16} className="mr-2" />
                        {mentor.phone}
                      </a>
                    )}
                    
                    {mentor.preferredContactMethod && (
                      <p className="text-gray-600 text-sm mt-2">
                        <span className="font-medium">Preferred contact: </span>
                        {mentor.preferredContactMethod}
                      </p>
                    )}
                  </div>
                </div>
                
                {mentor.education && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                      <BookOpen size={18} className="mr-2 text-indigo-600" />
                      Education
                    </h2>
                    <div className="space-y-3">
                      {Array.isArray(mentor.education) ? (
                        mentor.education.map((edu, index) => {
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
                                <p className="font-medium text-gray-800">{institution}</p>
                              )}
                              {degree && (
                                <p className="text-gray-600">{degree}</p>
                              )}
                              {year && (
                                <p className="text-gray-500 text-sm">Class of {year}</p>
                              )}
                            </div>
                          );
                        }).filter(Boolean)
                      ) : mentor.education && typeof mentor.education === 'object' ? (
                        <div>
                          {mentor.education.institution && typeof mentor.education.institution === 'string' && (
                            <p className="font-medium text-gray-800">{mentor.education.institution}</p>
                          )}
                          {mentor.education.degree && typeof mentor.education.degree === 'string' && (
                            <p className="text-gray-600">{mentor.education.degree}</p>
                          )}
                          {mentor.education.year && (
                            <p className="text-gray-500 text-sm">Class of {mentor.education.year}</p>
                          )}
                        </div>
                      ) : null}
                    </div>
                  </div>
                )}
                
                {Array.isArray(mentor.languages) && mentor.languages.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                      <Languages size={18} className="mr-2 text-indigo-600" />
                      Languages
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {mentor.languages.map((language, index) => (
                        <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                          {typeof language === 'string' ? language : ''}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {Array.isArray(mentor.industriesWorkedIn) && mentor.industriesWorkedIn.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                      <Briefcase size={18} className="mr-2 text-indigo-600" />
                      Industries
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {mentor.industriesWorkedIn.map((industry, index) => (
                        <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                          {typeof industry === 'string' ? industry : ''}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {mentor.socialLinks && typeof mentor.socialLinks === 'object' && (
                  (mentor.socialLinks.github || 
                  mentor.socialLinks.linkedin || 
                  mentor.socialLinks.twitter ||
                  mentor.socialLinks.website) ? (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                      <LinkIcon size={18} className="mr-2 text-indigo-600" />
                      Connect
                    </h2>
                    <div className="space-y-2">
                      {mentor.socialLinks.github && (
                        <a 
                          href={mentor.socialLinks.github}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center text-gray-700 hover:text-gray-900"
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
                          className="flex items-center text-gray-700 hover:text-gray-900"
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
                          className="flex items-center text-gray-700 hover:text-gray-900"
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
                          className="flex items-center text-gray-700 hover:text-gray-900"
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
        </div>
      </div>

      {showRequestForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Request Mentorship</h3>
            <form onSubmit={handleRequestMentorship}>
              <textarea
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                placeholder="Write a message to your potential mentor..."
                className="w-full bg-gray-50 text-gray-900 rounded-lg p-3 min-h-[120px] mb-4 
                         border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                required
              />
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseRequestForm}
                  className="px-4 py-2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={requestStatus === 'loading'}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium 
                           hover:bg-indigo-700 transition-colors flex items-center"
                >
                  {requestStatus === 'loading' ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    'Send Request'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
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