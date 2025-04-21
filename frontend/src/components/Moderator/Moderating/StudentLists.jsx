import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Search, Eye, Flag, X, Users, AlertCircle } from 'lucide-react';

const StudentLists = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage] = useState(10);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [studentToReject, setStudentToReject] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectionFormSubmitted, setRejectionFormSubmitted] = useState(false);
  
  // Fetch active students
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}/api/admin/students?status=active`);
        setStudents(response.data.students || []);
      } catch (err) {
        console.error('Error fetching students:', err);
        setError('Failed to load students. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStudents();
  }, []);
  
  // Handle student rejection
  const handleRejectStudent = async () => {
    if (!studentToReject || !rejectionReason.trim()) {
      setRejectionFormSubmitted(true);
      return;
    }
    
    try {
      await axios.put(`${import.meta.env.VITE_APP_BASE_URL}/api/admin/students/${studentToReject._id}/reject`, {
        reason: rejectionReason
      });
      
      // Remove rejected student from list
      setStudents(students.filter(student => student._id !== studentToReject._id));
      setShowRejectModal(false);
      setStudentToReject(null);
      setRejectionReason('');
      setRejectionFormSubmitted(false);
      
      // Show success message (you could add a toast notification here)
    } catch (err) {
      console.error('Error rejecting student:', err);
      // Show error message
    }
  };
  
  // Filter students by search term
  const filteredStudents = students.filter(student => 
    student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.education?.institution?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Pagination
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);
  
  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 bg-[#111111]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-[#E8C848]/20 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-[#1A1A1A] rounded mb-2"></div>
          <div className="h-3 w-24 bg-[#1A1A1A] rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64 bg-[#111111]">
        <div className="bg-[#1A1A1A] border border-red-800 text-red-400 px-4 py-3 rounded-lg">
          <div className="flex items-center mb-2">
            <AlertCircle size={20} className="mr-2" />
            <span className="font-medium">Error</span>
          </div>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 bg-[#1A1A1A] text-[#E8C848] border border-[#E8C848] px-4 py-1 rounded-md text-sm hover:bg-[#E8C848]/10 transition-colors duration-300"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1A1A1A] rounded-xl shadow-lg border border-gray-800">
      <div className="p-6 border-b border-gray-800">
        <h2 className="text-xl font-bold text-white flex items-center gap-2 font-montserrat">
          <User className="text-[#E8C848]" />
          Active Students ({filteredStudents.length})
        </h2>
        
        {/* Search Control */}
        <div className="mt-4 flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-[240px]">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or institution..."
              className="w-full pl-10 pr-4 py-2 border border-gray-700 rounded-lg bg-[#111111] text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#E8C848] focus:border-[#E8C848] transition-colors duration-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      {/* Students Table */}
      {currentStudents.length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          <User size={40} className="mx-auto text-gray-300 mb-2" />
          <p>No students found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-6 py-3">Student</th>
                <th className="px-6 py-3">Education</th>
                <th className="px-6 py-3">Skills</th>
                <th className="px-6 py-3">Profile Score</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentStudents.map(student => (
                <tr key={student._id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={student.profile_picture || 'https://via.placeholder.com/40?text=?'}
                        alt={student.name}
                        className="w-10 h-10 rounded-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/40?text=?';
                        }}
                      />
                      <div>
                        <div className="font-medium text-gray-800">{student.name}</div>
                        <div className="text-xs text-gray-500">{student.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs">
                      {student.education?.institution ? (
                        <>
                          <div className="font-medium">{student.education.institution}</div>
                          <div className="text-gray-500">{student.education.degree || ''}</div>
                        </>
                      ) : (
                        <span className="text-gray-400">Not specified</span>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {Array.isArray(student.skills) && student.skills.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {student.skills.slice(0, 3).map((skill, i) => (
                          <span key={i} className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-full">
                            {skill}
                          </span>
                        ))}
                        {student.skills.length > 3 && (
                          <span className="text-xs text-gray-500">+{student.skills.length - 3} more</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400">No skills listed</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2 max-w-[100px]">
                        <div 
                          className={`h-2.5 rounded-full ${
                            student.profileCompletion >= 80 ? 'bg-green-500' :
                            student.profileCompletion >= 50 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${student.profileCompletion}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">{student.profileCompletion}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => {
                          setSelectedStudent(student);
                          setShowDetailModal(true);
                        }}
                        className="text-emerald-600 hover:text-emerald-800 font-medium flex items-center gap-1"
                      >
                        <Eye size={16} />
                        <span>View</span>
                      </button>
                      <button
                        onClick={() => {
                          setStudentToReject(student);
                          setShowRejectModal(true);
                        }}
                        className="text-red-600 hover:text-red-800 font-medium flex items-center gap-1"
                      >
                        <Flag size={16} />
                        <span>Flag</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-gray-200 flex justify-center">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => paginate(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Previous
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
              <button
                key={number}
                onClick={() => paginate(number)}
                className={`px-3 py-1 rounded ${
                  currentPage === number
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {number}
              </button>
            ))}
            
            <button
              onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded ${
                currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
      
      {/* Student Detail Modal */}
      {/* Student Detail Modal */}
{showDetailModal && selectedStudent && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
    <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full my-8 mx-4">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-900">Student Profile</h3>
        <button
          onClick={() => {
            setShowDetailModal(false);
            setSelectedStudent(null);
          }}
          className="text-gray-400 hover:text-gray-500"
        >
          <X size={20} />
        </button>
      </div>
      
      <div className="mb-6 flex flex-col sm:flex-row gap-6">
        <div className="flex-shrink-0">
          <img
            src={selectedStudent.profile_picture || 'https://via.placeholder.com/150?text=?'}
            alt={selectedStudent.name}
            className="w-32 h-32 rounded-full object-cover border-4 border-emerald-100"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://via.placeholder.com/150?text=?';
            }}
          />
        </div>
        
        <div className="flex-grow">
          <h4 className="text-xl font-bold text-gray-800">{selectedStudent.name}</h4>
          <p className="text-gray-500 mb-2">{selectedStudent.email}</p>
          
          {selectedStudent.education?.institution && (
            <div className="mb-2">
              <span className="font-medium">{selectedStudent.education.degree || 'Student'}</span>
              {selectedStudent.education.institution && (
                <span> at {selectedStudent.education.institution}</span>
              )}
            </div>
          )}
          
          {selectedStudent.phone && (
            <p className="text-gray-600 text-sm mb-2">
              <span className="font-medium">Phone:</span> {selectedStudent.phone}
            </p>
          )}
          
          {selectedStudent.location && (
            <p className="text-gray-600 text-sm mb-2">
              <span className="font-medium">Location:</span> {selectedStudent.location.city || ''} 
              {selectedStudent.location.city && selectedStudent.location.country && ', '}
              {selectedStudent.location.country || ''}
            </p>
          )}
          
          <div className="mt-3">
            <div className="flex items-center">
              <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2 max-w-[200px]">
                <div 
                  className={`h-2.5 rounded-full ${
                    selectedStudent.profileCompletion >= 80 ? 'bg-green-500' :
                    selectedStudent.profileCompletion >= 50 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${selectedStudent.profileCompletion}%` }}
                ></div>
              </div>
              <span className="text-sm text-gray-600">{selectedStudent.profileCompletion}% Profile Completion</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="border-t border-gray-200 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {selectedStudent.bio && (
          <div className="col-span-full mb-4">
            <h5 className="text-sm font-medium text-gray-700 mb-1">Bio</h5>
            <p className="text-gray-600 text-sm">{selectedStudent.bio}</p>
          </div>
        )}
        
        {Array.isArray(selectedStudent.skills) && selectedStudent.skills.length > 0 && (
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-1">Skills</h5>
            <div className="flex flex-wrap gap-1">
              {selectedStudent.skills.map((skill, i) => (
                <span key={i} className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-full">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {Array.isArray(selectedStudent.interests) && selectedStudent.interests.length > 0 && (
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-1">Interests</h5>
            <div className="flex flex-wrap gap-1">
              {selectedStudent.interests.map((interest, i) => (
                <span key={i} className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full">
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {Array.isArray(selectedStudent.goals) && selectedStudent.goals.length > 0 && (
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-1">Learning Goals</h5>
            <ul className="text-sm text-gray-600 list-disc pl-4">
              {selectedStudent.goals.map((goal, i) => (
                <li key={i}>{goal}</li>
              ))}
            </ul>
          </div>
        )}
        
        {selectedStudent.mentorship_interests?.seeking_mentor !== undefined && (
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-1">Mentorship Interest</h5>
            <p className="text-gray-600 text-sm">
              {selectedStudent.mentorship_interests.seeking_mentor ? 
                'Looking for a mentor' : 
                'Not currently seeking mentorship'}
            </p>
            {selectedStudent.mentorship_interests.preferences && (
              <p className="text-gray-600 text-sm mt-1">
                <span className="font-medium">Preferences: </span>
                {selectedStudent.mentorship_interests.preferences}
              </p>
            )}
          </div>
        )}
        
        {selectedStudent.social_links && Object.values(selectedStudent.social_links).some(link => link) && (
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-1">Social Links</h5>
            <div className="flex space-x-2">
              {selectedStudent.social_links.linkedin && (
                <a href={selectedStudent.social_links.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">LinkedIn</a>
              )}
              {selectedStudent.social_links.github && (
                <a href={selectedStudent.social_links.github} target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:underline">GitHub</a>
              )}
              {selectedStudent.social_links.portfolio && (
                <a href={selectedStudent.social_links.portfolio} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">Portfolio</a>
              )}
            </div>
          </div>
        )}
        
        {selectedStudent.preferred_working_hours && 
          (selectedStudent.preferred_working_hours.start_time || selectedStudent.preferred_working_hours.end_time) && (
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-1">Preferred Working Hours</h5>
            <p className="text-gray-600 text-sm">
              {selectedStudent.preferred_working_hours.start_time || 'N/A'} - {selectedStudent.preferred_working_hours.end_time || 'N/A'}
            </p>
          </div>
        )}
      </div>
      
      <div className="mt-6 flex justify-end">
        <button
          onClick={() => {
            setShowDetailModal(false);
            setSelectedStudent(null);
          }}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}
      
      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Flag Student Account</h3>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setStudentToReject(null);
                  setRejectionReason('');
                  setRejectionFormSubmitted(false);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Are you sure you want to flag this student account? This will remove them from the platform and they will no longer be able to access the system.
              </p>
              
              {studentToReject && (
                <div className="bg-gray-50 p-3 rounded flex items-center gap-3 mb-3">
                  <img
                    src={studentToReject.profile_picture || 'https://via.placeholder.com/40?text=?'}
                    alt={studentToReject.name}
                    className="w-10 h-10 rounded-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/40?text=?';
                    }}
                  />
                  <div>
                    <div className="font-medium">{studentToReject.name}</div>
                    <div className="text-xs text-gray-500">{studentToReject.email}</div>
                  </div>
                </div>
              )}
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1 required">
                  Reason for flagging: <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  rows={3}
                  placeholder="Please provide a detailed reason (required)"
                  required
                ></textarea>
                {rejectionFormSubmitted && !rejectionReason.trim() && (
                  <p className="text-red-500 text-xs mt-1">
                    Please provide a reason for flagging this account
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setStudentToReject(null);
                  setRejectionReason('');
                  setRejectionFormSubmitted(false);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              
              <button
                onClick={() => {
                  setRejectionFormSubmitted(true);
                  if (rejectionReason.trim()) {
                    handleRejectStudent();
                  }
                }}
                className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
                  rejectionReason.trim() ? 'bg-red-600 hover:bg-red-700' : 'bg-red-300'
                }`}
              >
                Flag Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentLists;