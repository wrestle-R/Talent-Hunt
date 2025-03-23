import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UserX, Search, Filter, AlertCircle, CheckCircle, X } from 'lucide-react';

const StudentReject = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage] = useState(10);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [studentToRestore, setStudentToRestore] = useState(null);
  
  // Fetch all rejected students
  useEffect(() => {
    const fetchRejectedStudents = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:4000/api/admin/students?status=rejected');
        setStudents(response.data.students || []);
      } catch (err) {
        console.error('Error fetching rejected students:', err);
        setError('Failed to load rejected students. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRejectedStudents();
  }, []);
  
  // Handle student restoration
  const handleRestoreStudent = async () => {
    if (!studentToRestore) return;
    
    try {
      await axios.put(`http://localhost:4000/api/admin/students/${studentToRestore._id}/restore`);
      
      // Remove restored student from list
      setStudents(students.filter(student => student._id !== studentToRestore._id));
      setShowConfirmModal(false);
      setStudentToRestore(null);
      
      // Show success message (you could add a toast notification here)
    } catch (err) {
      console.error('Error restoring student:', err);
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
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-red-100 rounded-full mb-4"></div>
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
          <UserX className="text-red-600" />
          Rejected Students ({filteredStudents.length})
        </h2>
        
        {/* Search Control */}
        <div className="mt-4 flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-[240px]">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or institution..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      {/* Students Table */}
      {currentStudents.length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          <UserX size={40} className="mx-auto text-gray-300 mb-2" />
          <p>No rejected students found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-6 py-3">Student</th>
                <th className="px-6 py-3">Education</th>
                <th className="px-6 py-3">Skills</th>
                <th className="px-6 py-3">Rejection Date</th>
                <th className="px-6 py-3">Reason</th>
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
                          <span key={i} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
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
                    <span className="text-xs text-gray-600">
                      {student.rejectionDate ? new Date(student.rejectionDate).toLocaleDateString() : 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-gray-600">
                      {student.rejectionReason || 'No reason provided'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => {
                        setStudentToRestore(student);
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
                  
                  {/* Confirmation Modal */}
                  {showConfirmModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-medium text-gray-900">Restore Student Account</h3>
                          <button
                            onClick={() => {
                              setShowConfirmModal(false);
                              setStudentToRestore(null);
                            }}
                            className="text-gray-400 hover:text-gray-500"
                          >
                            <X size={20} />
                          </button>
                        </div>
                        
                        <div className="mb-4">
                          <p className="text-sm text-gray-600 mb-2">
                            Are you sure you want to restore this student account?
                          </p>
                          
                          {studentToRestore && (
                            <div className="bg-gray-50 p-3 rounded flex items-center gap-3">
                              <img
                                src={studentToRestore.profile_picture || 'https://via.placeholder.com/40?text=?'}
                                alt={studentToRestore.name}
                                className="w-10 h-10 rounded-full object-cover"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = 'https://via.placeholder.com/40?text=?';
                                }}
                              />
                              <div>
                                <div className="font-medium">{studentToRestore.name}</div>
                                <div className="text-xs text-gray-500">{studentToRestore.email}</div>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => {
                              setShowConfirmModal(false);
                              setStudentToRestore(null);
                            }}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                          >
                            Cancel
                          </button>
                          
                          <button
                            onClick={handleRestoreStudent}
                            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                          >
                            Restore Account
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            };
            
            export default StudentReject;
            