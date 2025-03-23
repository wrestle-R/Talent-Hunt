import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, Check, X, AlertTriangle, ExternalLink, 
  Github, Globe, MessageCircle, Calendar, User, Trash2,
  RefreshCw, Tag, Clipboard, CheckCircle2, XCircle
} from 'lucide-react';

const ProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notes, setNotes] = useState([]);
  const [isNotesLoading, setIsNotesLoading] = useState(false);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [noteForm, setNoteForm] = useState({
    subject: '',
    content: '',
    regarding: 'Project',
    isImportant: false,
    responseDeadline: ''
  });

  // Fetch project data
  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`http://localhost:4000/api/moderator/projects/${projectId}`);
        setProject(response.data);
        
        // Set initial note subject
        setNoteForm(prev => ({
          ...prev,
          subject: `Regarding your project: ${response.data.name}`
        }));
        
        // Fetch related notes
        fetchNotes();
      } catch (error) {
        console.error('Error fetching project:', error);
        setError('Failed to load project. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProjectData();
  }, [projectId]);

  // Fetch notes related to this project
  const fetchNotes = async () => {
    try {
      setIsNotesLoading(true);
      const response = await axios.get(`http://localhost:4000/api/moderator/projects/${projectId}/notes`);
      setNotes(response.data || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setIsNotesLoading(false);
    }
  };

  // Update project status
  const updateProjectStatus = async (status, moderatorNotes = '') => {
    try {
      await axios.put(`http://localhost:4000/api/moderator/projects/${projectId}`, {
        status,
        moderatorNotes,
        moderatorId: 'moderator123' // This should be the actual moderator ID
      });
      
      // Refresh project data
      const response = await axios.get(`http://localhost:4000/api/moderator/projects/${projectId}`);
      setProject(response.data);
    } catch (error) {
      console.error('Error updating project status:', error);
      alert('Failed to update project status');
    }
  };

  // Delete project
  const deleteProject = async () => {
    const reason = prompt('Please provide a reason for deletion:');
    if (!reason) return; // User cancelled
    
    try {
      await axios.delete(`http://localhost:4000/api/moderator/projects/${projectId}`, {
        data: {
          reason,
          notifyStudent: true,
          moderatorId: 'moderator123' // This should be the actual moderator ID
        }
      });
      
      // Navigate back to projects list
      navigate('/moderator/projects');
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project');
    }
  };

  // Handle note form changes
  const handleNoteFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNoteForm({
      ...noteForm,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Send note to student
  const sendNote = async (e) => {
    e.preventDefault();
    if (!project) return;
    
    try {
      await axios.post('http://localhost:4000/api/moderator/notes', {
        recipientId: project.creator.studentId,
        recipientType: 'Student',
        subject: noteForm.subject,
        content: noteForm.content,
        regarding: noteForm.regarding,
        relatedItemId: projectId,
        relatedItemType: 'Project',
        isImportant: noteForm.isImportant,
        responseDeadline: noteForm.responseDeadline || null,
        moderatorId: 'moderator123' // This should be the actual moderator ID
      });
      
      // Close modal and reset form
      setNoteModalOpen(false);
      setNoteForm({
        subject: `Regarding your project: ${project.name}`,
        content: '',
        regarding: 'Project',
        isImportant: false,
        responseDeadline: ''
      });
      
      // Refresh notes
      fetchNotes();
      
      alert('Note sent successfully!');
    } catch (error) {
      console.error('Error sending note:', error);
      alert('Error sending note. Please try again.');
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString().substring(0, 5);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <button 
              onClick={() => navigate('/moderator/projects')}
              className="inline-flex items-center text-indigo-600 hover:text-indigo-800"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              <span>Back to Projects</span>
            </button>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="animate-spin w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-500">Loading project details...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <button 
              onClick={() => navigate('/moderator/projects')}
              className="inline-flex items-center text-indigo-600 hover:text-indigo-800"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              <span>Back to Projects</span>
            </button>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <AlertTriangle size={48} className="mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">Error Loading Project</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              <RefreshCw className="inline-block mr-2 h-4 w-4" />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <button 
              onClick={() => navigate('/moderator/projects')}
              className="inline-flex items-center text-indigo-600 hover:text-indigo-800"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              <span>Back to Projects</span>
            </button>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <AlertTriangle size={48} className="mx-auto mb-4 text-yellow-500" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">Project Not Found</h3>
            <p className="text-gray-500">The requested project could not be found.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header with back button */}
        <div className="mb-6">
          <button 
            onClick={() => navigate('/moderator/projects')}
            className="inline-flex items-center text-indigo-600 hover:text-indigo-800"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            <span>Back to Projects</span>
          </button>
        </div>
        
        {/* Main content */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
          {/* Project header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                  <Clipboard className="mr-2 text-indigo-500" size={24} />
                  {project.name}
                </h1>
                <div className="flex items-center mt-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    project.status === 'Pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : project.status === 'Approved'
                        ? 'bg-green-100 text-green-800'
                        : project.status === 'Rejected'
                          ? 'bg-red-100 text-red-800'
                          : project.status === 'Flagged'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-gray-100 text-gray-800'
                  }`}>
                    {project.status}
                  </span>
                  <span className="ml-3 text-sm text-gray-500">
                    <Calendar className="inline-block mr-1 h-4 w-4" />
                    {formatDate(project.createdAt)}
                  </span>
                </div>
              </div>
              
              <div className="flex gap-2">
                {project.status === 'Pending' && (
                  <>
                    <button 
                      onClick={() => {
                        const notes = prompt('Add approval notes (optional):');
                        updateProjectStatus('Approved', notes);
                      }}
                      className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                    >
                      <Check className="mr-1 h-4 w-4" />
                      Approve
                    </button>
                    <button 
                      onClick={() => {
                        const reason = prompt('Please provide a reason for rejection:');
                        if (reason) updateProjectStatus('Rejected', reason);
                      }}
                      className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                    >
                      <X className="mr-1 h-4 w-4" />
                      Reject
                    </button>
                  </>
                )}
                
                <button 
                  onClick={() => setNoteModalOpen(true)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-indigo-700 bg-white hover:bg-indigo-50"
                >
                  <MessageCircle className="mr-1 h-4 w-4" />
                  Send Note
                </button>
                
                <button 
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to delete project "${project.name}"?`)) {
                      deleteProject();
                    }
                  }}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-red-600 bg-white hover:bg-red-50"
                >
                  <Trash2 className="mr-1 h-4 w-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
          
          {/* Project details */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left column - Project info */}
              <div className="md:col-span-2">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Project Details</h2>
                
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
                  <p className="text-gray-800 whitespace-pre-line">{project.description || 'No description provided.'}</p>
                </div>
                
                {project.techStack && project.techStack.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Technologies Used</h3>
                    <div className="flex flex-wrap gap-2">
                      {project.techStack.map((tech, index) => (
                        <span 
                          key={index}
                          className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                        >
                          <Tag className="mr-1 h-3 w-3" />
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {(project.githubLink || project.liveDemo) && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Project Links</h3>
                    <div className="flex flex-wrap gap-2">
                      {project.githubLink && (
                        <a 
                          href={project.githubLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1.5 rounded text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200"
                        >
                          <Github className="mr-1 h-4 w-4" />
                          GitHub Repository
                          <ExternalLink className="ml-1 h-3 w-3" />
                        </a>
                      )}
                      {project.liveDemo && (
                        <a 
                          href={project.liveDemo} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1.5 rounded text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200"
                        >
                          <Globe className="mr-1 h-4 w-4" />
                          Live Demo
                          <ExternalLink className="ml-1 h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                )}
                
                {project.moderatorNotes && (
                  <div className="mb-6 p-4 bg-yellow-50 border border-yellow-100 rounded-lg">
                    <h3 className="text-sm font-medium text-yellow-800 mb-2 flex items-center">
                      <AlertTriangle className="mr-1 h-4 w-4" />
                      Moderator Notes
                    </h3>
                    <p className="text-yellow-800 text-sm">{project.moderatorNotes}</p>
                  </div>
                )}
                
                {/* Moderation history section */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Moderation History</h3>
                  <div className="border rounded-lg divide-y">
                    <div className="px-4 py-3 flex justify-between items-center">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-600">Project Created</span>
                      </div>
                      <span className="text-sm text-gray-500">{formatDate(project.createdAt)}</span>
                    </div>
                    
                    {project.moderatedAt && (
                      <div className="px-4 py-3 flex justify-between items-center">
                        <div className="flex items-center">
                          {project.status === 'Approved' ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                          ) : project.status === 'Rejected' ? (
                            <XCircle className="h-4 w-4 text-red-500 mr-2" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2" />
                          )}
                          <span className="text-sm text-gray-600">
                            Project {project.status}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">{formatDate(project.moderatedAt)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Right column - Creator info */}
              <div className="md:col-span-1">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Creator</h2>
                  
                  <div className="flex items-center mb-4">
                    <div className="mr-3">
                      <img 
                        src={project.creator?.profilePicture || 'https://via.placeholder.com/50?text=👤'} 
                        alt={project.creator?.name || 'Creator'} 
                        className="h-12 w-12 rounded-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/50?text=👤';
                        }}
                      />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{project.creator?.name || 'Unknown Creator'}</h3>
                      <p className="text-xs text-gray-500">Student</p>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-1 flex items-center">
                    <User className="h-4 w-4 mr-2 text-gray-400" />
                    ID: {project.creator?.studentId?.substring(0, 8) || 'N/A'}...
                  </div>
                  
                  {project.creator?.email && (
                    <div className="text-sm text-gray-600 mb-3 flex items-center">
                      <Globe className="h-4 w-4 mr-2 text-gray-400" />
                      {project.creator.email}
                    </div>
                  )}
                  
                  <div className="mt-4 flex gap-2">
                    <button 
                      onClick={() => navigate(`/moderator/user-profile/${project.creator?.studentId}`)}
                      className="w-full px-3 py-2 bg-indigo-100 text-indigo-700 rounded-md text-sm flex items-center justify-center hover:bg-indigo-200"
                    >
                      <User className="mr-1 h-4 w-4" />
                      View Profile
                    </button>
                  </div>
                </div>
                
                {/* Notes section */}
                <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-medium text-gray-900">Recent Notes</h2>
                    <button
                      onClick={() => setNoteModalOpen(true)}
                      className="text-indigo-600 text-sm hover:text-indigo-800 flex items-center"
                    >
                      <MessageCircle className="h-4 w-4 mr-1" />
                      <span>New</span>
                    </button>
                  </div>
                  
                  {isNotesLoading ? (
                    <div className="text-center py-4">
                      <div className="animate-spin w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                      <p className="text-sm text-gray-500">Loading notes...</p>
                    </div>
                  ) : notes.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-500">No notes have been sent yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {notes.map((note) => (
                        <div key={note._id} className="border rounded-md p-3 bg-white">
                          <div className="flex justify-between items-start mb-1">
                            <h3 className="text-sm font-medium text-gray-800 flex items-center">
                              {note.isImportant && (
                                <AlertTriangle className="h-3 w-3 mr-1 text-red-500" />
                              )}
                              {note.subject}
                            </h3>
                            <span className="text-xs text-gray-500">{formatDate(note.createdAt)}</span>
                          </div>
                          <p className="text-xs text-gray-600 line-clamp-2">{note.content}</p>
                          <div className="mt-2 flex justify-between items-center">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              note.status === 'Unread'
                                ? 'bg-blue-100 text-blue-800'
                                : note.status === 'Read'
                                  ? 'bg-gray-100 text-gray-800'
                                  : note.status === 'Responded'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {note.status}
                            </span>
                            <button 
                              className="text-indigo-600 text-xs hover:text-indigo-800"
                              onClick={() => navigate(`/moderator/notes/${note._id}`)}
                            >
                              View
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Note Modal */}
      {noteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Send Note to Student
            </h2>
            
            <div className="mb-4">
              <p className="text-sm text-gray-500">
                Sending note to: <span className="font-medium">{project.creator?.name || 'Student'}</span>
              </p>
              <p className="text-sm text-gray-500">
                Regarding project: <span className="font-medium">{project.name}</span>
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
                  <option value="Behavior">Behavior</option>
                  <option value="ContentViolation">Content Violation</option>
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

export default ProjectDetail;