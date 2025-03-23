import React, { useState, useEffect } from 'react';
import { FolderGit2, Code, Globe, Plus, Edit, ExternalLink, Github, ChevronRight, Clock, CheckCircle2, XCircle, AlertCircle, MessageCircle } from 'lucide-react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const StudentProjects = ({ 
  userData, 
  limit = 3, 
  isInDashboard = true,
  searchFilter = '',
  techFilter = '',
  sortOrder = 'newest' 
}) => {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    tech_stack: '',
    github_link: '',
    live_demo: ''
  });
  const [statusCounts, setStatusCounts] = useState({
    Pending: 0,
    Approved: 0,
    Rejected: 0,
    Total: 0
  });
  const [activeStatusFilter, setActiveStatusFilter] = useState('all');

  // Function to fetch student projects
  const fetchProjects = async () => {
    if (!userData || !userData._id) {
      console.log("Missing student data, can't fetch projects");
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Build query parameters for filtering
      let queryParams = new URLSearchParams();
      
      if (searchFilter) {
        queryParams.append('search', searchFilter);
      }
      
      if (techFilter) {
        queryParams.append('techFilter', techFilter);
      }
      
      const response = await axios.get(
        `http://localhost:4000/api/student/projects/${userData._id}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
      );
      
      if (response.data.success && Array.isArray(response.data.projects)) {
        // Get projects directly from response
        let fetchedProjects = [...response.data.projects];
        
        // Apply sorting (server already filters by search and tech)
        fetchedProjects = fetchedProjects.sort((a, b) => {
          switch (sortOrder) {
            case 'newest':
              return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
            case 'oldest':
              return new Date(a.updatedAt || a.createdAt) - new Date(b.updatedAt || b.createdAt);
            case 'name':
              return a.name.localeCompare(b.name);
            default:
              return 0;
          }
        });
        
// In the fetchProjects function, update the status counting and filtering:
const counts = {
  // Use case-insensitive comparison for status counting
  Pending: fetchedProjects.filter(p => 
    p.status && p.status.toLowerCase() === 'pending').length,
  Approved: fetchedProjects.filter(p => 
    p.status && p.status.toLowerCase() === 'approved').length,
  Rejected: fetchedProjects.filter(p => 
    p.status && p.status.toLowerCase() === 'rejected').length,
  Total: fetchedProjects.length
};
setStatusCounts(counts);

// Filter projects based on activeStatusFilter - using case-insensitive comparison
let filteredProjects = fetchedProjects;
if (activeStatusFilter !== 'all') {
  filteredProjects = fetchedProjects.filter(p => 
    p.status && p.status.toLowerCase() === activeStatusFilter.toLowerCase()
  );
}
        
        // If in dashboard, limit the number of projects shown
        const limitedProjects = isInDashboard 
          ? filteredProjects.slice(0, limit) 
          : filteredProjects;
          
        setProjects(limitedProjects);
      } else {
        console.warn("Unexpected projects response format:", response.data);
        setProjects([]);
      }
      setError(null);
    } catch (err) {
      console.error("Error fetching projects:", err);
      setError(err.response?.data?.message || "Failed to load projects");
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle adding a new project
  const handleAddProject = async (e) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      
      // Convert comma-separated tech stack string to array
      const formattedProject = {
        ...newProject,
        tech_stack: newProject.tech_stack.includes(',') 
          ? newProject.tech_stack.split(',').map(tech => tech.trim())
          : [newProject.tech_stack.trim()],
        status: 'Pending' // Always set new projects to pending
      };
      
      const response = await axios.post(
        `http://localhost:4000/api/student/projects/${userData._id}`,
        formattedProject
      );
      
      // Refresh projects after adding new one
      fetchProjects();
      
      setIsAddModalOpen(false);
      setNewProject({
        name: '',
        description: '',
        tech_stack: '',
        github_link: '',
        live_demo: ''
      });
    } catch (err) {
      console.error("Error adding project:", err);
      setError(err.response?.data?.message || "Failed to add project");
      setIsLoading(false);
    }
  };

  // Handle editing an existing project
  const handleEditProject = async (e) => {
    e.preventDefault();
    
    if (!currentProject || !currentProject._id) return;
    
    try {
      setIsLoading(true);
      
      // Convert comma-separated tech stack string to array
      const formattedProject = {
        ...currentProject,
        tech_stack: typeof currentProject.tech_stack === 'string'
          ? (currentProject.tech_stack.includes(',') 
              ? currentProject.tech_stack.split(',').map(tech => tech.trim())
              : [currentProject.tech_stack.trim()])
          : currentProject.tech_stack,
        status: 'Pending' // Reset to pending when edited
      };
      
      const response = await axios.put(
        `http://localhost:4000/api/student/projects/${userData._id}/${currentProject._id}`,
        formattedProject
      );
      
      // Refresh projects after editing
      fetchProjects();
      
      setIsEditModalOpen(false);
      setCurrentProject(null);
    } catch (err) {
      console.error("Error updating project:", err);
      setError(err.response?.data?.message || "Failed to update project");
      setIsLoading(false);
    }
  };

  // Helper to format tech stack for display
  const formatTechStack = (techStack) => {
    // Handle both array and string formats
    const technologies = Array.isArray(techStack) 
      ? techStack 
      : (typeof techStack === 'string' 
        ? techStack.split(',').map(t => t.trim()) 
        : []);
        
    if (!technologies || !technologies.length) return "N/A";
    
    return technologies.map(tech => (
      <span 
        key={tech} 
        className={`text-xs px-2 py-1 rounded-full mr-1 mb-1 inline-block ${
          techFilter === tech 
            ? 'bg-indigo-600 text-white' 
            : 'bg-indigo-100 text-indigo-800'
        }`}
      >
        {tech}
      </span>
    ));
  };

// Get status badge based on project status
const getStatusBadge = (status) => {
  const statusLower = status ? status.toLowerCase() : 'pending';
  
  switch(statusLower) {
    case 'approved':
      return (
        <span className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-full bg-green-100 text-green-800 font-medium border border-green-200">
          <CheckCircle2 size={14} />
          Approved
        </span>
      );
    case 'rejected':
      return (
        <span className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-full bg-red-100 text-red-800 font-medium border border-red-200">
          <XCircle size={14} />
          Rejected
        </span>
      );
    case 'pending':
    default:
      return (
        <span className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-full bg-yellow-100 text-yellow-800 font-medium border border-yellow-200">
          <Clock size={14} />
          Pending Review
        </span>
      );
  }
};

  // Load project data when component mounts or when userData or filters change
  useEffect(() => {
    if (userData && userData._id) {
      fetchProjects();
    }
  }, [userData, isInDashboard, searchFilter, techFilter, sortOrder, activeStatusFilter]);

  // Loading state
  if (isLoading && !projects.length) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <FolderGit2 size={20} className="text-indigo-600" />
            {isInDashboard ? 'My Projects' : 'All Projects'}
          </h3>
          <div className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full animate-pulse">
            Loading...
          </div>
        </div>
        <div className="space-y-4">
          {[...Array(isInDashboard ? limit : 4)].map((_, index) => (
            <div key={index} className="animate-pulse border rounded-lg p-4">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full mb-3"></div>
              <div className="flex mb-3">
                <div className="h-6 bg-gray-200 rounded w-20 mr-2"></div>
                <div className="h-6 bg-gray-200 rounded w-20 mr-2"></div>
              </div>
              <div className="flex justify-end">
                <div className="h-8 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error && !projects.length) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <FolderGit2 size={20} className="text-indigo-600" />
            {isInDashboard ? 'My Projects' : 'All Projects'}
          </h3>
        </div>
        <div className="bg-red-50 p-4 rounded-lg text-center text-red-700">
          <p>{error}</p>
          <button 
            onClick={fetchProjects} 
            className="mt-2 bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg text-sm hover:bg-indigo-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty state after filtering
  const isFilteredEmpty = !isLoading && projects.length === 0 && (searchFilter || techFilter || activeStatusFilter !== 'all');

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <FolderGit2 size={20} className="text-indigo-600" />
          {isInDashboard ? 'My Projects' : 'All Projects'}
        </h3>
        <div className="flex items-center gap-2">
          {statusCounts.Total > 0 && (
            <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">
              {statusCounts.Total} {statusCounts.Total === 1 ? 'Project' : 'Projects'}
              {!isInDashboard && (activeStatusFilter !== 'all' || searchFilter || techFilter) && ' (filtered)'}
            </span>
          )}
          <button 
            className="bg-indigo-600 text-white px-3 py-1 rounded-lg text-sm flex items-center gap-1"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus size={14} /> Add Project
          </button>
        </div>
      </div>
      
      {/* Status Tabs - Only show when not in dashboard or when there are enough projects */}
      {(!isInDashboard || statusCounts.Total > 3) && (
        <div className="mb-6 border-b border-gray-200">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveStatusFilter('all')}
              className={`py-2 px-1 font-medium text-sm relative ${
                activeStatusFilter === 'all'
                  ? 'text-indigo-600 border-b-2 border-indigo-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              All Projects
              <span className="ml-1 bg-gray-100 text-gray-700 text-xs px-1.5 py-0.5 rounded-full">
                {statusCounts.Total}
              </span>
            </button>
            
            <button
              onClick={() => setActiveStatusFilter('Pending')}
              className={`py-2 px-1 font-medium text-sm relative ${
                activeStatusFilter === 'Pending'
                  ? 'text-yellow-600 border-b-2 border-yellow-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Pending
              <span className="ml-1 bg-yellow-100 text-yellow-700 text-xs px-1.5 py-0.5 rounded-full">
                {statusCounts.Pending}
              </span>
            </button>
            
            <button
              onClick={() => setActiveStatusFilter('Approved')}
              className={`py-2 px-1 font-medium text-sm relative ${
                activeStatusFilter === 'Approved'
                  ? 'text-green-600 border-b-2 border-green-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Approved
              <span className="ml-1 bg-green-100 text-green-700 text-xs px-1.5 py-0.5 rounded-full">
                {statusCounts.Approved}
              </span>
            </button>
            
            <button
              onClick={() => setActiveStatusFilter('Rejected')}
              className={`py-2 px-1 font-medium text-sm relative ${
                activeStatusFilter === 'Rejected'
                  ? 'text-red-600 border-b-2 border-red-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Rejected
              <span className="ml-1 bg-red-100 text-red-700 text-xs px-1.5 py-0.5 rounded-full">
                {statusCounts.Rejected}
              </span>
            </button>
          </div>
        </div>
      )}
      
      {projects.length > 0 ? (
        <div className="space-y-4">
          {projects.map(project => (
            <div 
              key={project._id} 
              className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
                project.status === 'Pending' 
                  ? 'border-l-4 border-l-yellow-400' 
                  : project.status === 'Approved' 
                    ? 'border-l-4 border-l-green-400' 
                    : project.status === 'Rejected'
                      ? 'border-l-4 border-l-red-400'
                      : ''
              }`}
            >
              <div className="flex justify-between">
                <div className="flex items-start gap-2">
                  <h4 className="font-medium text-lg">{project.name}</h4>
                  {getStatusBadge(project.status)}
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      setCurrentProject({
                        ...project,
                        // Normalize tech_stack for the form - handle both property names
                        tech_stack: Array.isArray(project.tech_stack) 
                          ? project.tech_stack.join(', ')
                          : (Array.isArray(project.techStack) 
                            ? project.techStack.join(', ') 
                            : '')
                      });
                      setIsEditModalOpen(true);
                    }}
                    className="text-gray-500 hover:text-indigo-600 transition-colors"
                    title="Edit project (will reset to pending status)"
                  >
                    <Edit size={16} />
                  </button>
                </div>
              </div>
              
              <p className="text-gray-600 mt-1 mb-3 text-sm">
                {project.description}
              </p>
              
              <div className="flex flex-wrap mb-3">
                {formatTechStack(project.tech_stack || project.techStack)}
              </div>
              
              <div className="flex justify-end gap-2 mt-2">
                {(project.github_link || project.githubLink) && (
                  <a 
                    href={project.github_link || project.githubLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-sm hover:bg-gray-200 flex items-center gap-1"
                  >
                    <Github size={14} /> GitHub
                  </a>
                )}
                {(project.live_demo || project.liveDemo) && (
                  <a 
                    href={project.live_demo || project.liveDemo} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg text-sm hover:bg-indigo-200 flex items-center gap-1"
                  >
                    <Globe size={14} /> Live Demo
                  </a>
                )}
              </div>
              
              {/* Display moderator notes if available */}
              {project.moderatorNotes && (
                <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
                  <p className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <MessageCircle size={16} className="mr-1 text-indigo-500" />
                    Moderator Feedback:
                  </p>
                  <p className="text-sm text-gray-600">{project.moderatorNotes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : isFilteredEmpty ? (
        <div className="text-center text-gray-500 py-8">
          <AlertCircle size={32} className="mx-auto text-gray-300 mb-3" />
          <h4 className="text-lg font-medium text-gray-500 mb-1">No matching projects</h4>
          <p className="text-gray-400 text-sm">
            {activeStatusFilter !== 'all' 
              ? `You don't have any ${activeStatusFilter.toLowerCase()} projects` 
              : 'Try adjusting your filters to find what youre looking for'}
          </p>
          <button 
            onClick={() => {
              setActiveStatusFilter('all');
              if (searchFilter || techFilter) window.location.reload();
            }} 
            className="mt-4 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg text-sm hover:bg-indigo-200"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="text-center text-gray-500 py-8">
          <FolderGit2 size={32} className="mx-auto text-gray-300 mb-3" />
          <h4 className="text-lg font-medium text-gray-500 mb-1">No projects yet</h4>
          <p className="text-gray-400 text-sm">
            Showcase your skills by adding projects to your profile
          </p>
          <button 
            className="mt-4 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg text-sm hover:bg-indigo-200 flex items-center gap-1 mx-auto"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus size={16} /> Add Your First Project
          </button>
        </div>
      )}
      
      {/* Show "View All" link if in dashboard */}
      {isInDashboard && statusCounts.Total > limit && (
        <Link 
          to="/student/projects" 
          className="text-indigo-600 text-sm font-medium mt-4 hover:text-indigo-800 flex items-center justify-end"
        >
          View All Projects <ChevronRight size={16} />
        </Link>
      )}
      
      {/* Add Project Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Add New Project</h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>
            
            <div className="mb-4 bg-blue-50 p-3 rounded-lg text-sm text-blue-700 flex items-start gap-2">
              <AlertCircle size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                All new projects will be marked as "Pending" and require moderator approval before becoming visible to others.
              </div>
            </div>
            
            <form onSubmit={handleAddProject}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Project Name*
                </label>
                <input 
                  type="text" 
                  value={newProject.name}
                  onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Description*
                </label>
                <textarea 
                  value={newProject.description}
                  onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows="3"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Tech Stack* (comma separated)
                </label>
                <input 
                  type="text" 
                  value={newProject.tech_stack}
                  onChange={(e) => setNewProject({...newProject, tech_stack: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="React, Node.js, MongoDB"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  GitHub Link
                </label>
                <input 
                  type="url" 
                  value={newProject.github_link}
                  onChange={(e) => setNewProject({...newProject, github_link: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="https://github.com/yourusername/project"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Live Demo URL
                </label>
                <input 
                  type="url" 
                  value={newProject.live_demo}
                  onChange={(e) => setNewProject({...newProject, live_demo: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="https://your-project-demo.com"
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <button 
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Add Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Edit Project Modal */}
      {isEditModalOpen && currentProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Edit Project</h3>
              <button 
                onClick={() => {
                  setIsEditModalOpen(false);
                  setCurrentProject(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>
            
            <div className="mb-4 bg-yellow-50 p-3 rounded-lg text-sm text-yellow-700 flex items-start gap-2">
              <AlertCircle size={18} className="text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                Editing this project will reset its status to "Pending" and it will require moderator approval again.
              </div>
            </div>
            
            <form onSubmit={handleEditProject}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Project Name*
                </label>
                <input 
                  type="text" 
                  value={currentProject.name}
                  onChange={(e) => setCurrentProject({...currentProject, name: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Description*
                </label>
                <textarea 
                  value={currentProject.description}
                  onChange={(e) => setCurrentProject({...currentProject, description: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows="3"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Tech Stack* (comma separated)
                </label>
                <input 
                  type="text" 
                  value={currentProject.tech_stack}
                  onChange={(e) => setCurrentProject({...currentProject, tech_stack: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="React, Node.js, MongoDB"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  GitHub Link
                </label>
                <input 
                  type="url" 
                  value={currentProject.github_link || currentProject.githubLink || ''}
                  onChange={(e) => setCurrentProject({
                    ...currentProject, 
                    github_link: e.target.value,
                    githubLink: e.target.value
                  })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="https://github.com/yourusername/project"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Live Demo URL
                </label>
                <input 
                  type="url" 
                  value={currentProject.live_demo || currentProject.liveDemo || ''}
                  onChange={(e) => setCurrentProject({
                    ...currentProject, 
                    live_demo: e.target.value,
                    liveDemo: e.target.value
                  })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="https://your-project-demo.com"
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <button 
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setCurrentProject(null);
                  }}
                  className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentProjects;