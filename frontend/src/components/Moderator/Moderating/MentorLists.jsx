import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Search, Filter, AlertCircle, X, Flag, Eye } from 'lucide-react';

const MentorLists = () => {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [mentorsPerPage] = useState(10);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [mentorToReject, setMentorToReject] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectionFormSubmitted, setRejectionFormSubmitted] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState(null);
  
  // Fetch all active mentors
  useEffect(() => {
    const fetchActiveMentors = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:4000/api/admin/mentors?status=active');
        setMentors(response.data.mentors || []);
      } catch (err) {
        console.error('Error fetching active mentors:', err);
        setError('Failed to load mentors. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchActiveMentors();
  }, []);
  
  // Handle mentor rejection
  const handleRejectMentor = async () => {
    if (!mentorToReject || !rejectionReason.trim()) {
      setRejectionFormSubmitted(true);
      return;
    }
    
    try {
      await axios.put(`http://localhost:4000/api/admin/mentors/${mentorToReject._id}/reject`, {
        reason: rejectionReason
      });
      
      // Remove rejected mentor from list
      setMentors(mentors.filter(mentor => mentor._id !== mentorToReject._id));
      setShowRejectModal(false);
      setMentorToReject(null);
      setRejectionReason('');
      setRejectionFormSubmitted(false);
      
      // Show success message (you could add a toast notification here)
    } catch (err) {
      console.error('Error rejecting mentor:', err);
      // Show error message
    }
  };
  
  // Filter mentors by search term
  const filteredMentors = mentors.filter(mentor => 
    mentor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mentor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mentor.current_role?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mentor.current_role?.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Pagination
  const indexOfLastMentor = currentPage * mentorsPerPage;
  const indexOfFirstMentor = indexOfLastMentor - mentorsPerPage;
  const currentMentors = filteredMentors.slice(indexOfFirstMentor, indexOfLastMentor);
  const totalPages = Math.ceil(filteredMentors.length / mentorsPerPage);
  
  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-blue-100 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
          <div className="h-3 w-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex items-center mb-2">
            <AlertCircle size={20} className="mr-2" />
            <span className="font-medium">Error</span>
          </div>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 bg-white text-red-600 border border-red-600 px-4 py-1 rounded-md text-sm hover:bg-red-50"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <User className="text-blue-600" />
          Active Mentors ({filteredMentors.length})
        </h2>
        
        {/* Search Control */}
        <div className="mt-4 flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-[240px]">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, position or company..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      {/* Mentors Table */}
      {currentMentors.length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          <User size={40} className="mx-auto text-gray-300 mb-2" />
          <p>No mentors found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-6 py-3">Mentor</th>
                <th className="px-6 py-3">Position</th>
                <th className="px-6 py-3">Expertise</th>
                <th className="px-6 py-3">Profile Score</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentMentors.map(mentor => (
                <tr key={mentor._id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={mentor.profile_picture || 'https://via.placeholder.com/40?text=?'}
                        alt={mentor.name}
                        className="w-10 h-10 rounded-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/40?text=?';
                        }}
                      />
                      <div>
                        <div className="font-medium text-gray-800">{mentor.name}</div>
                        <div className="text-xs text-gray-500">{mentor.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs">
                      {mentor.current_role?.title ? (
                        <>
                          <div className="font-medium">{mentor.current_role.title}</div>
                          <div className="text-gray-500">{mentor.current_role.company || ''}</div>
                        </>
                      ) : (
                        <span className="text-gray-400">Not specified</span>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {Array.isArray(mentor.expertise?.technical_skills) && mentor.expertise.technical_skills.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {mentor.expertise.technical_skills.slice(0, 3).map((skill, i) => (
                          <span key={i} className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                            {skill}
                          </span>
                        ))}
                        {mentor.expertise.technical_skills.length > 3 && (
                          <span className="text-xs text-gray-500">+{mentor.expertise.technical_skills.length - 3} more</span>
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
                            mentor.profileCompletion >= 80 ? 'bg-green-500' :
                            mentor.profileCompletion >= 50 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${mentor.profileCompletion}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">{mentor.profileCompletion}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => {
                          setSelectedMentor(mentor);
                          setShowDetailModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                      >
                        <Eye size={16} />
                        <span>View</span>
                      </button>
                      <button
                        onClick={() => {
                          setMentorToReject(mentor);
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
                    ? 'bg-blue-500 text-white'
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
      
      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Flag Mentor Account</h3>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setMentorToReject(null);
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
                Are you sure you want to flag this mentor account? This will remove them from the platform and they will no longer be able to access the system.
              </p>
              
              {mentorToReject && (
                <div className="bg-gray-50 p-3 rounded flex items-center gap-3 mb-3">
                  <img
                    src={mentorToReject.profile_picture || 'https://via.placeholder.com/40?text=?'}
                    alt={mentorToReject.name}
                    className="w-10 h-10 rounded-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/40?text=?';
                    }}
                  />
                  <div>
                    <div className="font-medium">{mentorToReject.name}</div>
                    <div className="text-xs text-gray-500">{mentorToReject.email}</div>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  setMentorToReject(null);
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
                    handleRejectMentor();
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
      
      {/* Detail Modal */}
      {showDetailModal && selectedMentor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full my-8 mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">Mentor Profile</h3>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedMentor(null);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="mb-6 flex flex-col sm:flex-row gap-6">
              <div className="flex-shrink-0">
                <img
                  src={selectedMentor.profile_picture || 'https://via.placeholder.com/150?text=?'}
                  alt={selectedMentor.name}
                  className="w-32 h-32 rounded-full object-cover border-4 border-blue-100"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/150?text=?';
                  }}
                />
              </div>
              
              <div className="flex-grow">
                <h4 className="text-xl font-bold text-gray-800">{selectedMentor.name}</h4>
                <p className="text-gray-500 mb-2">{selectedMentor.email}</p>
                
                {selectedMentor.current_role?.title && (
                  <div className="mb-2">
                    <span className="font-medium">{selectedMentor.current_role.title}</span>
                    {selectedMentor.current_role.company && (
                      <span> at {selectedMentor.current_role.company}</span>
                    )}
                  </div>
                )}
                
                {selectedMentor.phone && (
                  <p className="text-gray-600 text-sm mb-2">
                    <span className="font-medium">Phone:</span> {selectedMentor.phone}
                  </p>
                )}
                
                <div className="mt-3">
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2 max-w-[200px]">
                      <div 
                        className={`h-2.5 rounded-full ${
                          selectedMentor.profileCompletion >= 80 ? 'bg-green-500' :
                          selectedMentor.profileCompletion >= 50 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${selectedMentor.profileCompletion}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">{selectedMentor.profileCompletion}% Profile Completion</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedMentor.bio && (
                <div className="col-span-full mb-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-1">Bio</h5>
                  <p className="text-gray-600 text-sm">{selectedMentor.bio}</p>
                </div>
              )}
              
              {selectedMentor.years_of_experience > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-1">Years of Experience</h5>
                  <p className="text-gray-600">{selectedMentor.years_of_experience} years</p>
                </div>
              )}
              
              {Array.isArray(selectedMentor.expertise?.technical_skills) && selectedMentor.expertise.technical_skills.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-1">Technical Skills</h5>
                  <div className="flex flex-wrap gap-1">
                    {selectedMentor.expertise.technical_skills.map((skill, i) => (
                      <span key={i} className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {Array.isArray(selectedMentor.industries_worked_in) && selectedMentor.industries_worked_in.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-1">Industries</h5>
                  <div className="flex flex-wrap gap-1">
                    {selectedMentor.industries_worked_in.map((industry, i) => (
                      <span key={i} className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full">
                        {industry}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {Array.isArray(selectedMentor.mentorship_focus_areas) && selectedMentor.mentorship_focus_areas.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-1">Focus Areas</h5>
                  <div className="flex flex-wrap gap-1">
                    {selectedMentor.mentorship_focus_areas.map((area, i) => (
                      <span key={i} className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedMentor.social_links && Object.values(selectedMentor.social_links).some(link => link) && (
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-1">Social Links</h5>
                  <div className="flex space-x-2">
                    {selectedMentor.social_links.linkedin && (
                      <a href={selectedMentor.social_links.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">LinkedIn</a>
                    )}
                    {selectedMentor.social_links.github && (
                      <a href={selectedMentor.social_links.github} target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:underline">GitHub</a>
                    )}
                    {selectedMentor.social_links.personal_website && (
                      <a href={selectedMentor.social_links.personal_website} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">Website</a>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedMentor(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorLists;