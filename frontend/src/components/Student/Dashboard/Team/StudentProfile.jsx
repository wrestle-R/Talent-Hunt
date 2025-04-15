import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, User, Mail, ExternalLink, MapPin, Briefcase, GraduationCap, 
         Calendar,  Linkedin, Globe, Award, Book, Code, Star, Clock } from 'lucide-react';
import { useUser } from '../../../../../context/UserContext';

const StudentProfile = () => {
  const { studentId } = useParams(); // Get studentId from URL params
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { userData } = useUser();
  console.log(studentId)

  useEffect(() => {
    const fetchStudentProfile = async () => {
      if (!studentId) {
        setError('No student ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log(`Fetching student profile for ID: ${studentId}`);
        
        const response = await axios.get(`http://localhost:4000/api/teams/student/${studentId}`);
        console.log('API response:', response.data);
        
        if (response.data && response.data.success) {
          setStudent(response.data.student);
        } else {
          setError('Failed to load student profile');
        }
      } catch (err) {
        console.error('Error fetching student profile:', err);
        setError(err.response?.data?.message || 'Failed to load student profile');
      } finally {
        setLoading(false);
      }
    };

    fetchStudentProfile();
  }, [studentId]);

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full bg-[#1A1A1A] text-[#E8C848] hover:bg-[#E8C848]/10 transition-all duration-300"
          >
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-2xl font-bold text-white">Student Profile</h2>
        </div>
        
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E8C848]"></div>
          <span className="ml-3 text-lg text-gray-400">Loading profile...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full bg-[#1A1A1A] text-[#E8C848] hover:bg-[#E8C848]/10 transition-all duration-300"
          >
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-2xl font-bold text-white">Student Profile</h2>
        </div>
        <div className="bg-red-900/20 text-red-400 p-4 rounded-lg border border-red-800">
          <p className="font-medium mb-1">Error loading profile</p>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-3 bg-red-900/30 text-red-400 px-4 py-2 rounded-lg hover:bg-red-900/40 transition-all duration-300"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full bg-[#1A1A1A] text-[#E8C848] hover:bg-[#E8C848]/10 transition-all duration-300"
          >
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-2xl font-bold text-white">Student Profile</h2>
        </div>
        <div className="bg-[#E8C848]/10 text-[#E8C848] p-4 rounded-lg border border-[#E8C848]/30">
          <p className="font-medium">No student data found</p>
          <p className="mt-1">The student profile you're looking for could not be found.</p>
        </div>
      </div>
    );
  }

  // Extract social links from nested object if needed
  const socialLinks = student.social_links || {
    github: student.github,
    linkedin: student.linkedin,
    portfolio: student.portfolio
  };

  // Format location if available
  const location = student.location ? 
    `${student.location.city || ''} ${student.location.city && student.location.country ? ', ' : ''} ${student.location.country || ''}` : 
    '';

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full bg-[#1A1A1A] text-[#E8C848] hover:bg-[#E8C848]/10 transition-all duration-300"
        >
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-2xl font-bold text-white">Student Profile</h2>
      </div>

      <div className="bg-[#1A1A1A] rounded-xl shadow-lg overflow-hidden border border-gray-800 hover:border-[#E8C848]/30 transition-all duration-300">
        {/* Cover and Profile Section */}
        <div className="relative">
          <div className="h-48 bg-gradient-to-r from-[#E8C848]/30 to-[#E8C848]/10"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-[#1A1A1A] rounded-full p-2 shadow-lg border border-gray-800">
              <div className="h-28 w-28 rounded-full overflow-hidden bg-[#121212]">
                {student.profile_picture ? (
                  <img 
                    src={student.profile_picture}
                    alt={student.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-[#E8C848]/10 text-[#E8C848]">
                    <User size={48} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6 pt-16">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-white">{student.name}</h3>
            <p className="text-gray-400 flex items-center justify-center mt-1">
              <Mail size={16} className="mr-1 text-[#E8C848]" />
              {student.email}
            </p>
            
            {/* Education Institution */}
            {(student.institution || (student.education && student.education.institution)) && (
              <p className="text-gray-400 flex items-center justify-center mt-1">
                <GraduationCap size={16} className="mr-1 text-[#E8C848]" />
                {student.institution || student.education.institution}
              </p>
            )}
            
            {/* Location */}
            {location && (
              <p className="text-gray-400 flex items-center justify-center mt-1">
                <MapPin size={16} className="mr-1 text-[#E8C848]" />
                {location}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div>
              {/* About / Bio */}
              <div className="mb-6">
                <h4 className="font-medium text-white mb-2 border-b border-gray-800 pb-2 flex items-center">
                  <User size={18} className="mr-2 text-[#E8C848]" />
                  About
                </h4>
                <p className="text-gray-400">{student.bio || "No bio provided"}</p>
              </div>

              {/* Skills */}
              <div className="mb-6">
                <h4 className="font-medium text-white mb-2 border-b border-gray-800 pb-2 flex items-center">
                  <Code size={18} className="mr-2 text-[#E8C848]" />
                  Skills
                </h4>
                {student.skills && student.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {student.skills.map((skill, idx) => (
                      <span key={idx} className="bg-[#E8C848]/10 text-[#E8C848] px-3 py-1 rounded-full text-sm">
                        {typeof skill === 'string' ? skill : JSON.stringify(skill)}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400">No skills listed</p>
                )}
              </div>

              {/* Education */}
              <div className="mb-6">
                <h4 className="font-medium text-white mb-2 border-b border-gray-800 pb-2 flex items-center">
                  <GraduationCap size={18} className="mr-2 text-[#E8C848]" />
                  Education
                </h4>
                {student.education ? (
                  <div className="space-y-2 bg-[#121212] p-3 rounded-lg">
                    <p className="font-medium text-white">{student.education.institution || "Institution not specified"}</p>
                    <p className="text-gray-400">{student.education.degree || "Degree not specified"}</p>
                    <p className="text-gray-400 flex items-center">
                      <Calendar size={14} className="mr-1 text-[#E8C848]" />
                      {student.education.graduation_year ? 
                        `Graduation: ${student.education.graduation_year}` : 
                        "Graduation year not specified"}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-400">No education information provided</p>
                )}
              </div>

              {/* Certifications */}
              {student.certifications && student.certifications.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium text-white mb-2 border-b border-gray-800 pb-2 flex items-center">
                    <Award size={18} className="mr-2 text-[#E8C848]" />
                    Certifications
                  </h4>
                  <ul className="list-disc pl-5 space-y-1 text-gray-400">
                    {student.certifications.map((cert, idx) => (
                      <li key={idx}>
                        {typeof cert === 'string' ? cert : JSON.stringify(cert)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Interests */}
              {student.interests && student.interests.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium text-white mb-2 border-b border-gray-800 pb-2 flex items-center">
                    <Star size={18} className="mr-2 text-[#E8C848]" />
                    Interests
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {student.interests.map((interest, idx) => (
                      <span key={idx} className="bg-[#E8C848]/10 text-[#E8C848] px-3 py-1 rounded-full text-sm">
                        {typeof interest === 'string' ? interest : JSON.stringify(interest)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div>
              {/* Experience */}
              <div className="mb-6">
                <h4 className="font-medium text-white mb-2 border-b border-gray-800 pb-2 flex items-center">
                  <Briefcase size={18} className="mr-2 text-[#E8C848]" />
                  Experience
                </h4>
                {Array.isArray(student.experience) && student.experience.length > 0 ? (
                  <div className="space-y-4">
                    {student.experience.map((exp, idx) => (
                      <div key={idx} className="bg-[#121212] p-3 rounded-lg">
                        <h5 className="font-medium text-white">{exp.title}</h5>
                        <p className="text-gray-400 text-sm mt-1">{exp.description}</p>
                        <div className="flex justify-between mt-2 text-sm text-gray-400">
                          <span className="flex items-center">
                            <Clock size={14} className="mr-1 text-[#E8C848]" />
                            {exp.date ? formatDate(exp.date) : 'Date not specified'}
                          </span>
                          {exp.type && (
                            <span className="bg-[#E8C848]/10 text-[#E8C848] px-2 py-0.5 rounded-full text-xs">
                              {exp.type}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : typeof student.experience === 'string' ? (
                  <p className="text-gray-400">{student.experience}</p>
                ) : (
                  <p className="text-gray-400">No experience listed</p>
                )}
              </div>

              {/* Projects */}
              {student.projects && student.projects.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium text-white mb-2 border-b border-gray-800 pb-2 flex items-center">
                    <Code size={18} className="mr-2 text-[#E8C848]" />
                    Projects
                  </h4>
                  <div className="space-y-3">
                    {student.projects.map((project, idx) => (
                      <div key={idx} className="border border-gray-800 rounded-lg p-3 hover:border-[#E8C848]/30 transition-all duration-300">
                        <h5 className="font-medium text-[#E8C848]">
                          {typeof project === 'object' && project.name 
                            ? project.name 
                            : typeof project === 'string'
                              ? project
                              : `Project ${idx + 1}`}
                        </h5>
                        
                        {typeof project === 'object' && project.description && (
                          <p className="text-sm text-gray-400 mt-1">{project.description}</p>
                        )}
                        
                        {typeof project === 'object' && project.tech_stack && project.tech_stack.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {project.tech_stack.map((tech, techIdx) => (
                              <span key={techIdx} className="bg-[#E8C848]/10 text-[#E8C848] text-xs px-2 py-0.5 rounded-full">
                                {tech}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        {/* Project links */}
                        <div className="flex gap-3 mt-2">
                          {typeof project === 'object' && project.github_link && (
                            <a 
                              href={project.github_link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-[#E8C848] hover:text-[#E8C848]/80 text-sm flex items-center"
                            >
                              <User size={14} className="mr-1" />
                              GitHub
                            </a>
                          )}
                          
                          {typeof project === 'object' && project.live_demo && (
                            <a 
                              href={project.live_demo} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-[#E8C848] hover:text-[#E8C848]/80 text-sm flex items-center"
                            >
                              <ExternalLink size={14} className="mr-1" />
                              Live Demo
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Achievements */}
              {student.achievements && student.achievements.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium text-white mb-2 border-b border-gray-800 pb-2 flex items-center">
                    <Award size={18} className="mr-2 text-[#E8C848]" />
                    Achievements
                  </h4>
                  <div className="space-y-3">
                    {student.achievements.map((achievement, idx) => (
                      <div key={idx} className="bg-[#E8C848]/10 p-3 rounded-lg">
                        <h5 className="font-medium text-[#E8C848]">
                          {typeof achievement === 'object' && achievement.title 
                            ? achievement.title 
                            : typeof achievement === 'string' 
                              ? achievement 
                              : `Achievement ${idx + 1}`}
                        </h5>
                        
                        {typeof achievement === 'object' && achievement.description && (
                          <p className="text-sm text-[#E8C848]/80 mt-1">{achievement.description}</p>
                        )}
                        
                        {typeof achievement === 'object' && achievement.date && (
                          <p className="text-xs text-[#E8C848]/70 mt-1 flex items-center">
                            <Calendar size={12} className="mr-1" />
                            {formatDate(achievement.date)}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Social Links */}
              {(socialLinks?.github || socialLinks?.linkedin || socialLinks?.portfolio) && (
                <div className="mb-6">
                  <h4 className="font-medium text-white mb-2 border-b border-gray-800 pb-2 flex items-center">
                    <Globe size={18} className="mr-2 text-[#E8C848]" />
                    Connect
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {socialLinks.github && (
                      <a 
                        href={socialLinks.github} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="bg-[#121212] text-[#E8C848] px-4 py-2 rounded-lg flex items-center text-sm hover:bg-[#E8C848]/10 transition-all duration-300"
                      >
                        <GitHub size={16} className="mr-2" />
                        GitHub
                      </a>
                    )}
                    
                    {socialLinks.linkedin && (
                      <a 
                        href={socialLinks.linkedin} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="bg-[#121212] text-[#E8C848] px-4 py-2 rounded-lg flex items-center text-sm hover:bg-[#E8C848]/10 transition-all duration-300"
                      >
                        <Linkedin size={16} className="mr-2" />
                        LinkedIn
                      </a>
                    )}
                    
                    {socialLinks.portfolio && (
                      <a 
                        href={socialLinks.portfolio} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="bg-[#121212] text-[#E8C848] px-4 py-2 rounded-lg flex items-center text-sm hover:bg-[#E8C848]/10 transition-all duration-300"
                      >
                        <Globe size={16} className="mr-2" />
                        Portfolio
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Hackathon Information */}
              {student.hackathon_prev_experiences > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium text-white mb-2 border-b border-gray-800 pb-2 flex items-center">
                    <Code size={18} className="mr-2 text-[#E8C848]" />
                    Hackathon Experience
                  </h4>
                  <div className="bg-[#121212] p-3 rounded-lg">
                    <p className="text-[#E8C848]">
                      <span className="font-medium">{student.hackathon_prev_experiences}</span> previous 
                      {student.hackathon_prev_experiences === 1 ? ' hackathon' : ' hackathons'} attended
                    </p>
                    
                    {student.hackathon_current_interests && student.hackathon_current_interests.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm text-[#E8C848]/80 font-medium mb-1">Currently interested in:</p>
                        <div className="flex flex-wrap gap-1">
                          {student.hackathon_current_interests.map((interest, idx) => (
                            <span key={idx} className="bg-[#E8C848]/10 text-[#E8C848] text-xs px-2 py-0.5 rounded-full">
                              {interest}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;