import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UserX, Search, AlertCircle, CheckCircle, X } from 'lucide-react';

const MentorReject = () => {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [mentorsPerPage] = useState(10);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [mentorToRestore, setMentorToRestore] = useState(null);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  
  // Fetch all rejected mentors
  useEffect(() => {
    const fetchRejectedMentors = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}/api/admin/mentors?status=rejected`);
        setMentors(response.data.mentors || []);
      } catch (err) {
        console.error('Error fetching rejected mentors:', err);
        setError('Failed to load rejected mentors. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRejectedMentors();
  }, []);
  
  // Handle mentor restoration
  const handleRestoreMentor = async () => {
    if (!mentorToRestore) return;
    
    try {
      await axios.put(`${import.meta.env.VITE_APP_BASE_URL}/api/admin/mentors/${mentorToRestore._id}/restore`);
      
      // Remove restored mentor from list
      setMentors(mentors.filter(mentor => mentor._id !== mentorToRestore._id));
      setShowConfirmModal(false);
      setMentorToRestore(null);
      
      // Show success message (you could add a toast notification here)
    } catch (err) {
      console.error('Error restoring mentor:', err);
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
          <UserX className="text-[#E8C848]" />
          Rejected Mentors ({filteredMentors.length})
        </h2>
        
        {/* Search Control */}
        <div className="mt-4 flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-[240px]">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, position or company..."
              className="w-full pl-10 pr-4 py-2 border border-gray-700 rounded-lg bg-[#111111] text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#E8C848] focus:border-[#E8C848] transition-colors duration-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      {/* Mentors Table */}
      {currentMentors.length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          <UserX size={40} className="mx-auto text-gray-300 mb-2" />
          <p>No rejected mentors found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-6 py-3">Mentor</th>
                <th className="px-6 py-3">Position</th>
                <th className="px-6 py-3">Expertise</th>
                <th className="px-6 py-3">Rejection Date</th>
                <th className="px-6 py-3">Reason</th>
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
                          <span key={i} className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full">
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
                    <span className="text-xs text-gray-600">
                      {mentor.rejectionDate ? new Date(mentor.rejectionDate).toLocaleDateString() : 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-xs">
                      <span className="text-xs text-gray-600 line-clamp-3">
                        {mentor.rejectionReason || 'No reason provided'}
                      </span>
                      {mentor.rejectionReason && mentor.rejectionReason.length > 100 && (
                        <button 
                          onClick={() => {
                            setSelectedReason(mentor.rejectionReason);
                            setShowReasonModal(true);
                          }}
                          className="text-xs text-blue-600 hover:underline mt-1"
                        >
                          Show more
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => {
                        setMentorToRestore(mentor);
                        setShowConfirmModal(true);
                      }}
                      className="text-green-600 hover:text-green-800 font-medium flex items-center gap-1"
                    >
                      <CheckCircle size={16} />
                      <span>Restore</span>
                    </button>
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
                    ? 'bg-red-500 text-white'
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
      
      {/* Restore Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Restore Mentor Account</h3>
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setMentorToRestore(null);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Are you sure you want to restore this mentor account?
              </p>
              
              {mentorToRestore && (
                <div className="bg-gray-50 p-3 rounded flex items-center gap-3">
                  <img
                    src={mentorToRestore.profile_picture || 'https://via.placeholder.com/40?text=?'}
                    alt={mentorToRestore.name}
                    className="w-10 h-10 rounded-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/40?text=?';
                    }}
                  />
                  <div>
                    <div className="font-medium">{mentorToRestore.name}</div>
                    <div className="text-xs text-gray-500">{mentorToRestore.email}</div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setMentorToRestore(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              
              <button
                onClick={handleRestoreMentor}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
              >
                Restore Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reason Modal */}
      {showReasonModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Rejection Reason</h3>
              <button
                onClick={() => {
                  setShowReasonModal(false);
                  setSelectedReason('');
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="mb-4 bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedReason}</p>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setShowReasonModal(false);
                  setSelectedReason('');
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

export default MentorReject;