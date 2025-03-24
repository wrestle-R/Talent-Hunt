import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, User, Mail, ExternalLink, MapPin, Briefcase, GraduationCap, Loader, RefreshCw, AlertCircle } from 'lucide-react';

const StudentProfile = () => {
  const { memberId } = useParams(); // Get memberId from URL params
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true); // Guaranteed loading time
  const [error, setError] = useState(null);
    const studentId = memberId;
  // Set a minimum loading time of 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchStudentProfile = async () => {
      if (!memberId) {
        setError('No student ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log(`Fetching student profile for ID: ${memberId}`);
        
        // Use the getStudentById route from your TeamController
        const response = await axios.get(`http://localhost:4000/api/teams/${memberId}`);
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
  }, [memberId]);

  if (initialLoading || loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors mr-4"
          >
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-2xl font-bold text-gray-800">Student Profile</h2>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-10">
          <div className="flex flex-col justify-center items-center h-60">
            <Loader className="animate-spin text-indigo-600 mb-4" size={50} />
            <span className="text-lg text-gray-600">Loading student profile...</span>
            <p className="text-sm text-gray-500 mt-2">Please wait while we retrieve the student data</p>
          </div>
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
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors mr-4"
          >
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-2xl font-bold text-gray-800">Student Profile</h2>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="bg-red-50 text-red-700 p-6 rounded-lg">
            <div className="flex items-center mb-3">
              <AlertCircle size={24} className="mr-2" />
              <h3 className="font-medium text-lg">Error Loading Profile</h3>
            </div>
            <p className="mb-4">{error}</p>
            <div className="flex space-x-3">
              <button 
                onClick={() => window.location.reload()} 
                className="bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 flex items-center gap-2"
              >
                <RefreshCw size={16} />
                Retry
              </button>
              <button
                onClick={() => navigate(-1)}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
              >
                Go Back
              </button>
            </div>
          </div>
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
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors mr-4"
          >
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-2xl font-bold text-gray-800">Student Profile</h2>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="text-center py-12">
            <AlertCircle size={48} className="mx-auto text-yellow-500 mb-3" />
            <h4 className="text-xl font-medium text-gray-700 mb-2">Student Not Found</h4>
            <p className="text-gray-500 mb-6">We couldn't find the student profile you're looking for.</p>
            <button
              onClick={() => navigate(-1)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors mr-4"
        >
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-2xl font-bold text-gray-800">Student Profile</h2>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {/* Cover and Profile Section */}
        <div className="relative">
          <div className="h-48 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white rounded-full p-2 shadow-xl">
              <div className="h-28 w-28 rounded-full overflow-hidden bg-gray-200">
                {student.profile_picture ? (
                  <img 
                    src={student.profile_picture}
                    alt={student.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-indigo-100 text-indigo-600">
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
            <h3 className="text-2xl font-bold text-gray-800">{student.name}</h3>
            <p className="text-gray-500 flex items-center justify-center mt-1">
              <Mail size={16} className="mr-1" />
              {student.email}
            </p>
            {student.institution && (
              <p className="text-gray-500 flex items-center justify-center mt-1">
                <GraduationCap size={16} className="mr-1" />
                {student.institution}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div>
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-2 border-b border-gray-200 pb-2">About</h4>
                <p className="text-gray-600">{student.bio || "No bio provided"}</p>
              </div>

              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-2 border-b border-gray-200 pb-2">Skills</h4>
                {student.skills && student.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {student.skills.map((skill, idx) => (
                      <span key={idx} className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No skills listed</p>
                )}
              </div>

              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-2 border-b border-gray-200 pb-2">Education</h4>
                {student.education ? (
                  <div className="space-y-2">
                    <p className="font-medium">{student.education.institution || "Institution not specified"}</p>
                    <p>{student.education.degree || "Degree not specified"}</p>
                    <p className="text-gray-500">
                      {student.education.startYear && `${student.education.startYear} - `}
                      {student.education.endYear || "Present"}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-500">No education information provided</p>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div>
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-2 border-b border-gray-200 pb-2">Experience</h4>
                {student.experience ? (
                  <p className="text-gray-600">{student.experience}</p>
                ) : (
                  <p className="text-gray-500">No experience listed</p>
                )}
              </div>

              {student.projects && student.projects.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-700 mb-2 border-b border-gray-200 pb-2">Projects</h4>
                  <div className="space-y-3">
                    {student.projects.map((project, idx) => (
                      <div key={idx} className="border border-gray-200 rounded-lg p-3">
                        <h5 className="font-medium">{project.name}</h5>
                        <p className="text-sm text-gray-600">{project.description}</p>
                        {project.link && (
                          <a 
                            href={project.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center mt-2"
                          >
                            <ExternalLink size={14} className="mr-1" />
                            View Project
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Social Links */}
              {(student.github || student.linkedin || student.portfolio) && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-700 mb-2 border-b border-gray-200 pb-2">Connect</h4>
                  <div className="flex flex-wrap gap-3">
                    {student.github && (
                      <a 
                        href={student.github} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center text-sm"
                      >
                        GitHub
                      </a>
                    )}
                    
                    {student.linkedin && (
                      <a 
                        href={student.linkedin} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center text-sm"
                      >
                        LinkedIn
                      </a>
                    )}
                    
                    {student.portfolio && (
                      <a 
                        href={student.portfolio} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center text-sm"
                      >
                        Portfolio
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
  );
};

export default StudentProfile;