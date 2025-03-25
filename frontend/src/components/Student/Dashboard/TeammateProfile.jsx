import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { 
  User, ChevronLeft, MessageCircle, Github, Globe, LinkIcon, 
  MapPin, Briefcase, Code, BookOpen, Calendar, Clock, Award,
  FileText, ExternalLink, CreditCard, Users, Zap, Heart, Mail, Timer
} from 'lucide-react';
import axios from 'axios';
import { useUser } from '../../../../context/UserContext';
import ChatModal from '../ChatModal';
import StudentPlaceholder from "../../../public/student_placeholder.png";

const TeammateProfile = () => {
  const { teammateId } = useParams();
  const navigate = useNavigate();
  const { userData } = useUser();
  
  const [teammate, setTeammate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Chat modal state
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  useEffect(() => {
    const fetchTeammateDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:4000/api/student/teammate/${teammateId}`);
        
        if (response.data && response.data.success) {
          setTeammate(response.data.teammate);
        } else {
          setError("Failed to fetch teammate details");
        }
      } catch (err) {
        console.error("Error fetching teammate details:", err);
        setError(err.response?.data?.message || "An error occurred while fetching teammate details");
      } finally {
        setLoading(false);
      }
    };
    
    if (teammateId) {
      fetchTeammateDetails();
    }
  }, [teammateId]);
  
  const handleOpenChat = () => {
    if (teammate) {
      setIsChatOpen(true);
    }
  };
  
  const handleCloseChat = () => {
    setIsChatOpen(false);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }
  
  if (error || !teammate) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="text-center py-10 bg-white rounded-lg shadow-sm border border-gray-200">
          <User size={48} className="mx-auto text-gray-300 mb-3" />
          <h2 className="text-xl font-medium text-gray-700 mb-2">Teammate Not Found</h2>
          <p className="text-gray-500 mb-4">{error || "Unable to load teammate details"}</p>
          <button 
            onClick={() => navigate('/student/teammates')}
            className="inline-flex items-center px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200"
          >
            <ChevronLeft size={16} className="mr-1" />
            Back to Teammates
          </button>
        </div>
      </div>
    );
  }

  // Helper function to determine what they're looking for
  const getLookingForInfo = () => {
    if (!teammate.lookingFor?.isLookingForTeammates) {
      return null;
    }
    
    const purpose = teammate.lookingFor.purpose;
    
    let content = null;
    
    if (purpose === 'Project' || purpose === 'Both') {
      content = (
        <div className="bg-indigo-50 p-4 rounded-lg mb-4">
          <h3 className="font-medium text-indigo-800 flex items-center mb-2">
            <Code size={16} className="mr-2" />
            Looking for Project Teammates
          </h3>
          
          {teammate.lookingFor.projectDescription && (
            <p className="text-indigo-700 text-sm mb-3">{teammate.lookingFor.projectDescription}</p>
          )}
          
          {teammate.lookingFor.desiredSkills && teammate.lookingFor.desiredSkills.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-medium text-indigo-800 mb-1">Desired Skills:</p>
              <div className="flex flex-wrap gap-1">
                {teammate.lookingFor.desiredSkills.map((skill, index) => (
                  <span key={index} className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex items-center gap-4 text-xs text-indigo-700">
            {teammate.lookingFor.teamSizePreference && (
              <span className="flex items-center">
                <Users size={12} className="mr-1" />
                Team size: {teammate.lookingFor.teamSizePreference}
              </span>
            )}
            
            {teammate.lookingFor.urgencyLevel && (
              <span className="flex items-center">
                <Clock size={12} className="mr-1" />
                Urgency: {teammate.lookingFor.urgencyLevel}
              </span>
            )}
          </div>
          
          {teammate.lookingFor.projectDetails && (
            <div className="mt-3 border-t border-indigo-100 pt-3">
              <p className="text-xs font-medium text-indigo-800 mb-1">Project Details:</p>
              <div className="grid grid-cols-2 gap-2 text-xs text-indigo-700">
                <span className="flex items-center">
                  <FileText size={12} className="mr-1" />
                  Type: {teammate.lookingFor.projectDetails.project_type}
                </span>
                <span className="flex items-center">
                  <Timer size={12} className="mr-1" />
                  Duration: {teammate.lookingFor.projectDetails.project_duration}
                </span>
                <span className="flex items-center">
                  <Zap size={12} className="mr-1" />
                  Commitment: {teammate.lookingFor.projectDetails.commitment_level}
                </span>
              </div>
            </div>
          )}
        </div>
      );
    }
    
    if (purpose === 'Hackathon' || purpose === 'Both') {
      const hackathonContent = (
        <div className="bg-purple-50 p-4 rounded-lg mb-4">
          <h3 className="font-medium text-purple-800 flex items-center mb-2">
            <Calendar size={16} className="mr-2" />
            Looking for Hackathon Team
          </h3>
          
          {teammate.lookingFor.hackathonDetails && (
            <>
              <div className="mb-3">
                {teammate.lookingFor.hackathonDetails.hackathon_name && (
                  <p className="text-purple-700 text-sm mb-1">
                    <span className="font-medium">Hackathon: </span>
                    {teammate.lookingFor.hackathonDetails.hackathon_name}
                  </p>
                )}
                
                {teammate.lookingFor.hackathonDetails.idea_description && (
                  <p className="text-purple-700 text-sm">
                    <span className="font-medium">Idea: </span>
                    {teammate.lookingFor.hackathonDetails.idea_description}
                  </p>
                )}
              </div>
              
              {teammate.lookingFor.hackathonDetails.required_skills && 
               teammate.lookingFor.hackathonDetails.required_skills.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-medium text-purple-800 mb-1">Looking for:</p>
                  <div className="flex flex-wrap gap-1">
                    {teammate.lookingFor.hackathonDetails.required_skills.map((skill, index) => (
                      <span key={index} className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-4 text-xs text-purple-700">
                {teammate.lookingFor.hackathonDetails.team_size && (
                  <span className="flex items-center">
                    <Users size={12} className="mr-1" />
                    Team size: {teammate.lookingFor.hackathonDetails.team_size}
                  </span>
                )}
                
                {teammate.lookingFor.hackathonDetails.hackathon_date && (
                  <span className="flex items-center">
                    <Calendar size={12} className="mr-1" />
                    Date: {new Date(teammate.lookingFor.hackathonDetails.hackathon_date).toLocaleDateString()}
                  </span>
                )}
              </div>
            </>
          )}
          
          {!teammate.lookingFor.hackathonDetails && (
            <>
              <p className="text-purple-700 text-sm mb-3">Open to participating in hackathons</p>
              
              {teammate.lookingFor.desiredSkills && teammate.lookingFor.desiredSkills.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-medium text-purple-800 mb-1">Desired Skills:</p>
                  <div className="flex flex-wrap gap-1">
                    {teammate.lookingFor.desiredSkills.map((skill, index) => (
                      <span key={index} className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      );
      
      // If they're looking for both, add the hackathon content after the project content
      if (purpose === 'Both') {
        return (
          <div>
            {content}
            {hackathonContent}
          </div>
        );
      }
      
      return hackathonContent;
    }
    
    return content;
  };
  
  return (
    <>
      <Helmet>
        <title>{teammate.name} | TalentHunt</title>
      </Helmet>
      
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-5xl mx-auto px-4">
          <button 
            onClick={() => navigate('/student/teammates')}
            className="flex items-center text-emerald-600 hover:text-emerald-700 mb-6"
          >
            <ChevronLeft size={20} className="mr-1" />
            Back to Teammates
          </button>
          
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Header / Profile Summary */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex flex-col md:flex-row items-start md:items-center">
                <img 
                  src={teammate.profile_picture || StudentPlaceholder} 
                  alt={teammate.name} 
                  className="w-20 h-20 rounded-full object-cover mb-4 md:mb-0 md:mr-6"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/80?text=👤';
                  }}
                />
                
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-800">{teammate.name}</h1>
                      <p className="text-gray-600">
                        {teammate.education?.degree ? `${teammate.education.degree} Student` : 'Student'}
                        {teammate.education?.institution && ` at ${teammate.education.institution}`}
                      </p>
                      
                      {teammate.location && (
                        <p className="text-gray-500 text-sm mt-1 flex items-center">
                          <MapPin size={14} className="mr-1" />
                          {typeof teammate.location === 'string' 
                            ? teammate.location 
                            : `${teammate.location.city || ''} ${teammate.location.country || ''}`.trim()}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex gap-3 mt-4 md:mt-0">
                      <button 
                        onClick={handleOpenChat}
                        className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-200 transition flex items-center"
                      >
                        <MessageCircle size={16} className="mr-2" />
                        Message
                      </button>
                    </div>
                  </div>
                  
                  {/* Profile Completion */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs text-gray-500">Profile Completion</p>
                      <span className="text-xs font-medium text-gray-700">{teammate.profileCompletion}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-emerald-500 h-2 rounded-full" 
                        style={{ width: `${teammate.profileCompletion}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Looking For Section */}
            {teammate.lookingFor?.isLookingForTeammates && (
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Currently Looking For</h2>
                {getLookingForInfo()}
              </div>
            )}
            
            {/* Main Content Grid */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Column */}
              <div className="md:col-span-2 space-y-6">
                {/* Bio Section */}
                {teammate.bio && (
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800 mb-3">About</h2>
                    <p className="text-gray-700">{teammate.bio}</p>
                  </div>
                )}
                
                {/* Skills Section */}
                {teammate.skills && teammate.skills.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800 mb-3">Skills</h2>
                    <div className="flex flex-wrap gap-2">
                      {teammate.skills.map((skill, index) => (
                        <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Projects Section */}
                {teammate.projects && teammate.projects.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800 mb-3">Projects</h2>
                    <div className="space-y-4">
                      {teammate.projects.map(project => (
                        <div key={project._id} className="border border-gray-200 rounded-lg p-4">
                          <h3 className="font-semibold text-gray-800">{project.name}</h3>
                          <p className="text-gray-600 text-sm mt-1 mb-3">{project.description}</p>
                          
                          {/* Tech Stack */}
                          {project.tech_stack && project.tech_stack.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {project.tech_stack.map((tech, index) => (
                                <span key={index} className="bg-indigo-50 text-indigo-700 text-xs px-2 py-0.5 rounded-full">
                                  {tech}
                                </span>
                              ))}
                            </div>
                          )}
                          
                          {/* Project Links */}
                          <div className="flex gap-3">
                            {project.github_link && (
                              <a 
                                href={project.github_link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center text-gray-600 hover:text-gray-900 text-xs"
                              >
                                <Github size={14} className="mr-1" />
                                GitHub
                              </a>
                            )}
                            
                            {project.live_demo && (
                              <a 
                                href={project.live_demo} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center text-gray-600 hover:text-gray-900 text-xs"
                              >
                                <Globe size={14} className="mr-1" />
                                Live Demo
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Achievements Section */}
                {teammate.achievements && teammate.achievements.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800 mb-3">Achievements</h2>
                    <div className="space-y-3">
                      {teammate.achievements.map((achievement, index) => (
                        <div key={index} className="flex items-start">
                          <Award size={16} className="text-emerald-500 mt-1 mr-3" />
                          <div>
                            <h3 className="font-medium text-gray-800">{achievement.title}</h3>
                            <p className="text-gray-600 text-sm">{achievement.description}</p>
                            {achievement.date && (
                              <p className="text-gray-500 text-xs mt-1">
                                {new Date(achievement.date).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Right Column */}
              <div className="space-y-6">
                {/* Education */}
                {teammate.education && (teammate.education.institution || teammate.education.degree) && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                      <BookOpen size={18} className="mr-2 text-emerald-600" />
                      Education
                    </h2>
                    <div>
                      {teammate.education.institution && (
                        <p className="font-medium text-gray-800">{teammate.education.institution}</p>
                      )}
                      {teammate.education.degree && (
                        <p className="text-gray-600">{teammate.education.degree}</p>
                      )}
                      {teammate.education.graduation_year && (
                        <p className="text-gray-500 text-sm">Class of {teammate.education.graduation_year}</p>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Interests */}
                {teammate.interests && teammate.interests.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                      <Heart size={18} className="mr-2 text-emerald-600" />
                      Interests
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {teammate.interests.map((interest, index) => (
                        <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Working Hours */}
                {teammate.preferred_working_hours && (
                teammate.preferred_working_hours.start_time || teammate.preferred_working_hours.end_time) && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                      <Clock size={18} className="mr-2 text-emerald-600" />
                      Preferred Working Hours
                    </h2>
                    <p className="text-gray-700">
                      {teammate.preferred_working_hours.start_time} - {teammate.preferred_working_hours.end_time}
                    </p>
                  </div>
                )}
                
                {/* Goals */}
                {teammate.goals && teammate.goals.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                      <Award size={18} className="mr-2 text-emerald-600" />
                      Goals
                    </h2>
                    <ul className="list-disc pl-5 text-gray-700 space-y-1">
                      {teammate.goals.map((goal, index) => (
                        <li key={index}>{goal}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Social Links */}
                {teammate.social_links && (
                  teammate.social_links.github || 
                  teammate.social_links.linkedin || 
                  teammate.social_links.portfolio
                ) && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                      <LinkIcon size={18} className="mr-2 text-emerald-600" />
                      Connect
                    </h2>
                    <div className="space-y-2">
                      {teammate.social_links.github && (
                        <a 
                          href={teammate.social_links.github}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center text-gray-700 hover:text-gray-900"
                        >
                          <Github size={16} className="mr-2" />
                          GitHub
                          <ExternalLink size={12} className="ml-1" />
                        </a>
                      )}
                      
                      {teammate.social_links.linkedin && (
                        <a 
                          href={teammate.social_links.linkedin}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center text-gray-700 hover:text-gray-900"
                        >
                          <Briefcase size={16} className="mr-2" />
                          LinkedIn
                          <ExternalLink size={12} className="ml-1" />
                        </a>
                      )}
                      
                      {teammate.social_links.portfolio && (
                        <a 
                          href={teammate.social_links.portfolio}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center text-gray-700 hover:text-gray-900"
                        >
                          <Globe size={16} className="mr-2" />
                          Portfolio
                          <ExternalLink size={12} className="ml-1" />
                        </a>
                      )}
                      
                      {teammate.email && (
                        <a 
                          href={`mailto:${teammate.email}`}
                          className="flex items-center text-gray-700 hover:text-gray-900"
                        >
                          <Mail size={16} className="mr-2" />
                          Email
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Chat Modal */}
      <ChatModal 
        isOpen={isChatOpen} 
        onClose={handleCloseChat} 
        user={teammate} 
        currentUser={userData}
      />
    </>
  );
};

export default TeammateProfile;