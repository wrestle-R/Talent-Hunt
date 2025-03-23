import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { FolderGit2, Code, Globe, Plus, Edit, CheckCircle2, XCircle, AlertTriangle, 
  Clock, Clipboard, RefreshCw, Filter, Search, AlertCircle, Check, X, MessageCircle, 
  Bookmark, Info, Send, ArrowLeft, Eye, Bell, Mail, Circle } from 'lucide-react';

const ProjectManagement = ({ statusFilter: initialStatusFilter = 'all' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(initialStatusFilter);
  const [searchTerm, setSearchTerm] = useState('');
  const [unreviewedNotes, setUnreviewedNotes] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });
  const [selectedProject, setSelectedProject] = useState(null);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [noteForm, setNoteForm] = useState({
    subject: '',
    content: '',
    regarding: 'Project',
    isImportant: false,
    responseDeadline: ''
  });

  // Base API URL - centralized for easier maintenance
  const API_BASE_URL = 'http://localhost:4000/api/moderator';

  // Helper function to normalize status for comparison
  const normalizeStatus = (status) => {
    if (!status) return '';
    return status.toLowerCase();
  };

  // Standard status values with proper capitalization
  const STATUS_VALUES = {
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected'
  };


  // Fetch all projects
  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching projects from:', `${API_BASE_URL}/projects`);
      
      const response = await axios.get(`${API_BASE_URL}/projects`);
      
      if (Array.isArray(response.data)) {
        // Normalize status values for all projects
        const normalizedProjects = response.data.map(project => ({
          ...project,
          status: project.status ? 
            STATUS_VALUES[normalizeStatus(project.status)] || project.status : 
            STATUS_VALUES.pending
        }));
        
        setProjects(normalizedProjects);
        
        // Initial filtering based on statusFilter prop
        let filtered = [...normalizedProjects];
        if (statusFilter !== 'all') {
          filtered = filtered.filter(project => 
            normalizeStatus(project.status) === normalizeStatus(statusFilter)
          );
        }
        
        setFilteredProjects(filtered);
        
        // Calculate stats with case-insensitive comparison
        const stats = {
          total: normalizedProjects.length,
          pending: normalizedProjects.filter(p => normalizeStatus(p.status) === 'pending').length,
          approved: normalizedProjects.filter(p => normalizeStatus(p.status) === 'approved').length,
          rejected: normalizedProjects.filter(p => normalizeStatus(p.status) === 'rejected').length
        };
        
        setStats(stats);
      } else {
        console.error('Unexpected response format:', response.data);
        setProjects([]);
        setFilteredProjects([]);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter projects based on status and search term
  useEffect(() => {
    let filtered = [...projects];
    
    // Apply status filter with case-insensitive comparison
    if (statusFilter !== 'all') {
      filtered = filtered.filter(project => 
        normalizeStatus(project.status) === normalizeStatus(statusFilter)
      );
    }
    
    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(project => 
        (project.name && project.name.toLowerCase().includes(searchLower)) ||
        (project.description && project.description.toLowerCase().includes(searchLower)) ||
        (project.creator?.name && project.creator.name.toLowerCase().includes(searchLower))
      );
    }
    
    setFilteredProjects(filtered);
  }, [statusFilter, searchTerm, projects]);

  // Load projects and unread notes on component mount
  useEffect(() => {
    fetchProjects();
    fetchUnreadNotes();
    
    // Refresh unread notes count every minute
    const interval = setInterval(fetchUnreadNotes, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Update project status function
  const updateProjectStatus = async (projectId, status, moderatorNotes = '') => {
    try {
      // Normalize the status to ensure proper capitalization
      const normalizedStatus = STATUS_VALUES[normalizeStatus(status)] || status;
      
      // Log the request for debugging
      console.log('Updating project with:', {
        projectId,
        status: normalizedStatus,
        moderatorNotes,
        url: `${API_BASE_URL}/projects/${projectId}`
      });
      
      const response = await axios.put(`${API_BASE_URL}/projects/${projectId}`, {
        status: normalizedStatus,
        moderatorNotes,
        moderatorId: 'moderator123' // For now, using a string ID
      });
      
      console.log('Update response:', response.data);
      
      // Update local state after successful API call
      setProjects(prev => prev.map(project => 
        project._id === projectId 
          ? { ...project, status: normalizedStatus, moderatorNotes }
          : project
      ));
      
      // Refresh projects to update stats
      fetchProjects();
      
      return response.data;
    } catch (error) {
      console.error('Error updating project status:', error);
      throw error;
    }
  };

  // Handle approve project action
  const handleApproveProject = async (projectId) => {
    try {
      await updateProjectStatus(projectId, 'Approved', 'Project meets all quality standards.');
    } catch (error) {
      console.error('Error approving project:', error);
      alert('Failed to approve project. Please try again.');
    }
  };

  // Handle reject project action
  const handleRejectProject = async (projectId) => {
    const reason = prompt('Enter reason for rejection:');
    if (reason) {
      try {
        await updateProjectStatus(projectId, 'Rejected', reason);
      } catch (error) {
        console.error('Error rejecting project:', error);
        alert('Failed to reject project. Please try again.');
      }
    }
  };

  // Handle setting project back to pending
  const handlePendingProject = async (projectId) => {
    try {
      await updateProjectStatus(projectId, 'Pending', 'Project has been set back to pending review.');
    } catch (error) {
      console.error('Error setting project to pending:', error);
      alert('Failed to update project status. Please try again.');
    }
  };

  // Open note modal to send note to student
  const openNoteModal = (project) => {
    setSelectedProject(project);
    setNoteForm({
      subject: `Regarding your project: ${project.name}`,
      content: '',
      regarding: 'Project',
      isImportant: false,
      responseDeadline: ''
    });
    setNoteModalOpen(true);
  };

  // Handle note form changes
  const handleNoteFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNoteForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Send note to student
  const sendNote = async (e) => {
    e.preventDefault();
    
    if (!selectedProject || !selectedProject.creator?.studentId) {
      alert('Cannot send note: Missing student information');
      return;
    }
    
    try {
      const response = await axios.post(`${API_BASE_URL}/notes`, {
        recipientId: selectedProject.creator.studentId,
        recipientType: 'Student',
        subject: noteForm.subject,
        content: noteForm.content,
        regarding: noteForm.regarding,
        relatedItemId: selectedProject._id,
        relatedItemType: 'Project',
        isImportant: noteForm.isImportant,
        responseDeadline: noteForm.responseDeadline || null,
        moderatorId: 'moderator123'
      });
      
      console.log('Note sent successfully:', response.data);
      setNoteModalOpen(false);
      alert('Note sent successfully');
      
      // Refresh unread notes count
      fetchUnreadNotes();
    } catch (error) {
      console.error('Error sending note:', error);
      alert(`Failed to send note: ${error.response?.data?.error || error.message}`);
    }
  };

  // Helper function for status-based styling
  const getStatusStyle = (status) => {
    const normalizedStatus = normalizeStatus(status);
    
    switch(normalizedStatus) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Helper to check if project has specific status (case-insensitive)
  const hasStatus = (project, statusToCheck) => {
    return normalizeStatus(project.status) === normalizeStatus(statusToCheck);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <button 
            onClick={() => navigate('/moderator/dashboard')}
            className="inline-flex items-center text-indigo-600 hover:text-indigo-800"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            <span>Back to Dashboard</span>
          </button>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
              <Clipboard className="mr-2 text-indigo-500" size={24} />
              Project Management
            </h1>
            <p className="text-gray-600 mt-1">
              Review, approve, or reject student projects
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex items-center gap-3">
            {unreviewedNotes > 0 && (
              <button 
                onClick={() => navigate('/moderator/notes')}
                className="relative flex items-center gap-1 text-indigo-600 hover:text-indigo-800 px-3 py-1.5 rounded-md bg-indigo-50 hover:bg-indigo-100"
              >
                <Mail size={16} />
                <span>Notes</span>
                <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                  {unreviewedNotes}
                </span>
              </button>
            )}
            
            <button 
              onClick={() => fetchProjects()}
              className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 px-3 py-1.5 rounded-md bg-indigo-50 hover:bg-indigo-100"
            >
              <RefreshCw size={16} />
              <span>Refresh</span>
            </button>
            
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-md pl-10 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              >
                <option value="all">All Projects</option>
                <option value="Pending">Pending Review</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
              <Filter size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Project Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div 
            className={`bg-white p-4 rounded-lg shadow-sm border ${
              statusFilter === 'all' ? 'border-indigo-300 ring-2 ring-indigo-100' : 'border-gray-100'
            } cursor-pointer transition-all hover:shadow-md`}
            onClick={() => setStatusFilter('all')}
          >
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium text-gray-500">Total Projects</h3>
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                <Clipboard size={14} className="text-indigo-600" />
              </div>
            </div>
            <p className="text-2xl font-semibold text-gray-800 mt-2">{stats.total}</p>
          </div>
          
          <div 
            className={`bg-white p-4 rounded-lg shadow-sm border ${
              normalizeStatus(statusFilter) === 'pending' ? 'border-yellow-300 ring-2 ring-yellow-100' : 'border-gray-100'
            } cursor-pointer transition-all hover:shadow-md`}
            onClick={() => setStatusFilter('Pending')}
          >
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium text-gray-500">Pending</h3>
              <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                <Clock size={14} className="text-yellow-600" />
              </div>
            </div>
            <p className="text-2xl font-semibold text-gray-800 mt-2">{stats.pending}</p>
          </div>
          
          <div 
            className={`bg-white p-4 rounded-lg shadow-sm border ${
              normalizeStatus(statusFilter) === 'approved' ? 'border-green-300 ring-2 ring-green-100' : 'border-gray-100'
            } cursor-pointer transition-all hover:shadow-md`}
            onClick={() => setStatusFilter('Approved')}
          >
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium text-gray-500">Approved</h3>
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 size={14} className="text-green-600" />
              </div>
            </div>
            <p className="text-2xl font-semibold text-gray-800 mt-2">{stats.approved}</p>
          </div>
          
          <div 
            className={`bg-white p-4 rounded-lg shadow-sm border ${
              normalizeStatus(statusFilter) === 'rejected' ? 'border-red-300 ring-2 ring-red-100' : 'border-gray-100'
            } cursor-pointer transition-all hover:shadow-md`}
            onClick={() => setStatusFilter('Rejected')}
          >
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium text-gray-500">Rejected</h3>
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle size={14} className="text-red-600" />
              </div>
            </div>
            <p className="text-2xl font-semibold text-gray-800 mt-2">{stats.rejected}</p>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search projects by name, description, or creator..."
              className="w-full border border-gray-300 rounded-md pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
        </div>

        {/* Projects Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-500">Loading projects...</p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="p-8 text-center">
              <AlertCircle size={48} className="mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">No projects found</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {searchTerm 
                  ? `No projects matching "${searchTerm}"`
                  : statusFilter !== 'all'
                    ? `No projects with status "${statusFilter}"`
                    : "No projects available in the system"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Creator</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProjects.map((project) => (
                    <tr key={project._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-start">
                          <div className="text-sm font-medium text-gray-900">{project.name}</div>
                        </div>
                        <div className="text-sm text-gray-500 mt-1 max-w-md">
                          {project.description?.length > 100 
                            ? `${project.description.substring(0, 100)}...` 
                            : project.description}
                        </div>
                        {project.techStack && project.techStack.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {project.techStack.slice(0, 3).map((tech, index) => (
                              <span 
                                key={index}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                              >
                                {tech}
                              </span>
                            ))}
                            {project.techStack.length > 3 && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                +{project.techStack.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 mr-3">
                            <img 
                              className="h-10 w-10 rounded-full"
                              src={project.creator?.profilePicture || 'https://via.placeholder.com/40?text=👤'} 
                              alt={project.creator?.name || 'Creator'} 
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/40?text=👤';
                              }}
                            />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {project.creator?.name || 'Unknown Creator'}
                            </div>
                            <div className="text-xs text-gray-500">
                              Student ID: {project.creator?.studentId?.substring(0, 8) || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(project.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusStyle(project.status)}`}>
                          {project.status}
                        </span>
                        
                        {project.moderatorNotes && (
                          <div className="mt-2 text-xs text-gray-500">
                            <span className="font-medium">Note:</span> {project.moderatorNotes.substring(0, 30)}
                            {project.moderatorNotes.length > 30 ? '...' : ''}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => navigate(`/moderator/project/${project._id}`)}
                            className="p-1 text-indigo-600 hover:text-indigo-800 rounded-full hover:bg-indigo-50"
                            title="View Project Details"
                          >
                            <Eye size={18} />
                          </button>
                          
                          {/* Status Change Buttons - now using case-insensitive comparison */}
                          {!hasStatus(project, 'approved') && (
                            <button 
                              onClick={() => handleApproveProject(project._id)}
                              className="p-1 text-green-600 hover:text-green-800 rounded-full hover:bg-green-50"
                              title="Approve Project"
                            >
                              <Check size={18} />
                            </button>
                          )}
                          
                          {!hasStatus(project, 'rejected') && (
                            <button 
                              onClick={() => handleRejectProject(project._id)}
                              className="p-1 text-red-600 hover:text-red-800 rounded-full hover:bg-red-50"
                              title="Reject Project"
                            >
                              <X size={18} />
                            </button>
                          )}
                          
                          {!hasStatus(project, 'pending') && (
                            <button 
                              onClick={() => handlePendingProject(project._id)}
                              className="p-1 text-yellow-600 hover:text-yellow-800 rounded-full hover:bg-yellow-50"
                              title="Set to Pending"
                            >
                              <Circle size={18} />
                            </button>
                          )}
                          
                          <button 
                            onClick={() => openNoteModal(project)}
                            className="p-1 text-blue-600 hover:text-blue-800 rounded-full hover:bg-blue-50"
                            title="Send Note to Student"
                          >
                            <MessageCircle size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* Information Banner */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start space-x-3">
          <div className="flex-shrink-0">
            <Info size={20} className="text-blue-500" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-blue-800">Moderation Guidelines</h4>
            <p className="text-sm text-blue-600 mt-1">
              Review each project carefully. You can approve, reject, or set projects back to pending status at any time.
              Use the note feature to provide feedback to students about their projects.
            </p>
          </div>
        </div>
      </div>
      
      {/* Note Modal */}
      {noteModalOpen && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Send Note to Student
            </h2>
            
            <div className="mb-4">
              <p className="text-sm text-gray-500">
                Sending note to: <span className="font-medium">{selectedProject.creator?.name || 'Student'}</span>
              </p>
              <p className="text-sm text-gray-500">
                Regarding project: <span className="font-medium">{selectedProject.name}</span>
              </p>
            </div>
            
            <form onSubmit={sendNote}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <input 
                  type="text"
                  name="subject"
                  value={noteForm.subject}
                  onChange={handleNoteFormChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  name="content"
                  value={noteForm.content}
                  onChange={handleNoteFormChange}
                  rows={5}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter your message to the student..."
                  required
                ></textarea>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  name="regarding"
                  value={noteForm.regarding}
                  onChange={handleNoteFormChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Project">Project Content</option>
                  <option value="CodeQuality">Code Quality</option>
                  <option value="Documentation">Documentation</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div className="mb-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isImportant"
                    name="isImportant"
                    checked={noteForm.isImportant}
                    onChange={handleNoteFormChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isImportant" className="ml-2 block text-sm text-gray-700">
                    Mark as important
                  </label>
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Response Deadline (Optional)
                </label>
                <input
                  type="date"
                  name="responseDeadline"
                  value={noteForm.responseDeadline}
                  onChange={handleNoteFormChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setNoteModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Send className="h-4 w-4 inline-block mr-1" />
                  Send Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectManagement;