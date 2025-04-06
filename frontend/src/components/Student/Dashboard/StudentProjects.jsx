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
        
        const counts = {
          Pending: fetchedProjects.filter(p => 
            p.status && p.status.toLowerCase() === 'pending').length,
          Approved: fetchedProjects.filter(p => 
            p.status && p.status.toLowerCase() === 'approved').length,
          Rejected: fetchedProjects.filter(p => 
            p.status && p.status.toLowerCase() === 'rejected').length,
          Total: fetchedProjects.length
        };
        setStatusCounts(counts);

        let filteredProjects = fetchedProjects;
        if (activeStatusFilter !== 'all') {
          filteredProjects = fetchedProjects.filter(p => 
            p.status && p.status.toLowerCase() === activeStatusFilter.toLowerCase()
          );
        }
        
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
      
      const formattedProject = {
        ...newProject,
        tech_stack: newProject.tech_stack.includes(',') 
          ? newProject.tech_stack.split(',').map(tech => tech.trim())
          : [newProject.tech_stack.trim()],
        status: 'Pending'
      };
      
      const response = await axios.post(
        `http://localhost:4000/api/student/projects/${userData._id}`,
        formattedProject
      );
      
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
      
      const formattedProject = {
        ...currentProject,
        tech_stack: typeof currentProject.tech_stack === 'string'
          ? (currentProject.tech_stack.includes(',') 
              ? currentProject.tech_stack.split(',').map(tech => tech.trim())
              : [currentProject.tech_stack.trim()])
          : currentProject.tech_stack,
        status: 'Pending'
      };
      
      const response = await axios.put(
        `http://localhost:4000/api/student/projects/${userData._id}/${currentProject._id}`,
        formattedProject
      );
      
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
            ? 'bg-[#E8C848] text-[#121212]' 
            : 'bg-[#E8C848]/10 text-[#E8C848]'
        }`}
      >
        {tech}
      </span>
    ));
  };

  const getStatusBadge = (status) => {
    const statusLower = status ? status.toLowerCase() : 'pending';
    
    switch(statusLower) {
      case 'approved':
        return (
          <span className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-full bg-green-500/10 text-green-500 font-medium border border-green-500/20">
            <CheckCircle2 size={14} />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-full bg-red-500/10 text-red-500 font-medium border border-red-500/20">
            <XCircle size={14} />
            Rejected
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-full bg-[#E8C848]/10 text-[#E8C848] font-medium border border-[#E8C848]/20">
            <Clock size={14} />
            Pending Review
          </span>
        );
    }
  };

  useEffect(() => {
    if (userData && userData._id) {
      fetchProjects();
    }
  }, [userData, isInDashboard, searchFilter, techFilter, sortOrder, activeStatusFilter]);

  if (isLoading && !projects.length) {
    return (
      <div className={`${!isInDashboard ? 'min-h-screen bg-[#121212] p-6' : ''}`}>
        <div className="bg-[#1A1A1A] rounded-xl shadow-lg p-6 border border-gray-800 hover:border-[#E8C848]/30 transition-all duration-300">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg flex items-center gap-2 text-white">
              <FolderGit2 size={20} className="text-[#E8C848]" />
              {isInDashboard ? 'My Projects' : 'All Projects'}
            </h3>
            <div className="bg-[#E8C848]/10 text-[#E8C848] text-xs px-2 py-1 rounded-full animate-pulse">
              Loading...
            </div>
          </div>
          <div className="space-y-4">
            {[...Array(isInDashboard ? limit : 4)].map((_, index) => (
              <div key={index} className="animate-pulse border border-gray-800 rounded-lg p-4">
                <div className="h-4 bg-[#121212] rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-[#121212] rounded w-full mb-3"></div>
                <div className="flex mb-3">
                  <div className="h-6 bg-[#121212] rounded w-20 mr-2"></div>
                  <div className="h-6 bg-[#121212] rounded w-20 mr-2"></div>
                </div>
                <div className="flex justify-end">
                  <div className="h-8 bg-[#121212] rounded w-24"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${!isInDashboard ? 'min-h-screen bg-[#121212] p-6' : ''}`}>
      <div className="bg-[#1A1A1A] rounded-xl shadow-lg p-6 border border-gray-800 hover:border-[#E8C848]/30 transition-all duration-300">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg flex items-center gap-2 text-white">
            <FolderGit2 size={20} className="text-[#E8C848]" />
            {isInDashboard ? 'My Projects' : 'All Projects'}
          </h3>
          <div className="flex items-center gap-2">
            {statusCounts.Total > 0 && (
              <span className="bg-[#E8C848]/10 text-[#E8C848] text-xs px-2 py-1 rounded-full">
                {statusCounts.Total} {statusCounts.Total === 1 ? 'Project' : 'Projects'}
                {!isInDashboard && (activeStatusFilter !== 'all' || searchFilter || techFilter) && ' (filtered)'}
              </span>
            )}
            <button 
              className="bg-[#E8C848] text-[#121212] px-3 py-1 rounded-lg text-sm flex items-center gap-1 hover:bg-[#E8C848]/80 transition-all duration-300 shadow-lg shadow-[#E8C848]/30"
              onClick={() => setIsAddModalOpen(true)}
            >
              <Plus size={14} /> Add Project
            </button>
          </div>
        </div>

        {(!isInDashboard || statusCounts.Total > 3) && (
          <div className="mb-6 border-b border-gray-800">
            <div className="flex space-x-4">
              <button
                onClick={() => setActiveStatusFilter('all')}
                className={`py-2 px-1 font-medium text-sm relative ${
                  activeStatusFilter === 'all'
                    ? 'text-[#E8C848] border-b-2 border-[#E8C848]'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                All Projects
                <span className="ml-1 bg-[#121212] text-gray-300 text-xs px-1.5 py-0.5 rounded-full">
                  {statusCounts.Total}
                </span>
              </button>
              
              <button
                onClick={() => setActiveStatusFilter('Pending')}
                className={`py-2 px-1 font-medium text-sm relative ${
                  activeStatusFilter === 'Pending'
                    ? 'text-[#E8C848] border-b-2 border-[#E8C848]'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                Pending
                <span className="ml-1 bg-[#121212] text-gray-300 text-xs px-1.5 py-0.5 rounded-full">
                  {statusCounts.Pending}
                </span>
              </button>
              
              <button
                onClick={() => setActiveStatusFilter('Approved')}
                className={`py-2 px-1 font-medium text-sm relative ${
                  activeStatusFilter === 'Approved'
                    ? 'text-green-500 border-b-2 border-green-500'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                Approved
                <span className="ml-1 bg-[#121212] text-gray-300 text-xs px-1.5 py-0.5 rounded-full">
                  {statusCounts.Approved}
                </span>
              </button>
              
              <button
                onClick={() => setActiveStatusFilter('Rejected')}
                className={`py-2 px-1 font-medium text-sm relative ${
                  activeStatusFilter === 'Rejected'
                    ? 'text-red-500 border-b-2 border-red-500'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                Rejected
                <span className="ml-1 bg-[#121212] text-gray-300 text-xs px-1.5 py-0.5 rounded-full">
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
                className={`bg-[#121212] rounded-lg p-4 hover:shadow-lg transition-all duration-300 border border-gray-800 hover:border-[#E8C848]/30 ${
                  project.status === 'Pending' 
                    ? 'border-l-4 border-l-[#E8C848]' 
                    : project.status === 'Approved' 
                      ? 'border-l-4 border-l-green-500' 
                      : project.status === 'Rejected'
                        ? 'border-l-4 border-l-red-500'
                        : ''
                }`}
              >
                <div className="flex justify-between">
                  <div className="flex items-start gap-2">
                    <h4 className="font-medium text-lg text-white">{project.name}</h4>
                    {getStatusBadge(project.status)}
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        setCurrentProject({
                          ...project,
                          tech_stack: Array.isArray(project.tech_stack) 
                            ? project.tech_stack.join(', ')
                            : (Array.isArray(project.techStack) 
                              ? project.techStack.join(', ') 
                              : '')
                        });
                        setIsEditModalOpen(true);
                      }}
                      className="text-gray-400 hover:text-[#E8C848] transition-colors"
                      title="Edit project (will reset to pending status)"
                    >
                      <Edit size={16} />
                    </button>
                  </div>
                </div>
                
                <p className="text-gray-400 mt-1 mb-3 text-sm">
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
                      className="bg-[#E8C848]/10 text-[#E8C848] px-3 py-1 rounded-lg text-sm hover:bg-[#E8C848]/20 transition-all duration-300 flex items-center gap-1"
                    >
                      <Github size={14} /> GitHub
                    </a>
                  )}
                  {(project.live_demo || project.liveDemo) && (
                    <a 
                      href={project.live_demo || project.liveDemo} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-[#E8C848]/10 text-[#E8C848] px-3 py-1 rounded-lg text-sm hover:bg-[#E8C848]/20 transition-all duration-300 flex items-center gap-1"
                    >
                      <Globe size={14} /> Live Demo
                    </a>
                  )}
                </div>
                
                {project.moderatorNotes && (
                  <div className="mt-3 p-4 bg-[#121212] rounded-lg border border-gray-800 shadow-sm">
                    <p className="text-sm font-medium text-[#E8C848] mb-2 flex items-center">
                      <MessageCircle size={16} className="mr-1 text-[#E8C848]" />
                      Moderator Feedback:
                    </p>
                    <p className="text-sm text-gray-400">{project.moderatorNotes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FolderGit2 size={32} className="mx-auto text-[#E8C848]/30 mb-3" />
            <h4 className="text-lg font-medium text-white mb-1">No projects yet</h4>
            <p className="text-gray-400 text-sm">
              Showcase your skills by adding projects to your profile
            </p>
            <button 
              className="mt-4 bg-[#E8C848]/10 text-[#E8C848] px-4 py-2 rounded-lg text-sm hover:bg-[#E8C848]/20 transition-all duration-300 flex items-center gap-1 mx-auto"
              onClick={() => setIsAddModalOpen(true)}
            >
              <Plus size={16} /> Add Your First Project
            </button>
          </div>
        )}

        {isInDashboard && statusCounts.Total > limit && (
          <Link 
            to="/student/projects" 
            className="text-[#E8C848] text-sm font-medium mt-4 hover:text-[#E8C848]/80 flex items-center justify-end"
          >
            View All Projects <ChevronRight size={16} />
          </Link>
        )}
      </div>

      {/* Modals */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-[#121212]/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#1A1A1A] rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto border border-gray-800 hover:border-[#E8C848]/30 transition-all duration-300">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-white">Add New Project</h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-300"
              >
                &times;
              </button>
            </div>
            
            <div className="mb-4 bg-[#E8C848]/10 p-3 rounded-lg text-sm text-[#E8C848] flex items-start gap-2">
              <AlertCircle size={18} className="text-[#E8C848] flex-shrink-0 mt-0.5" />
              <div>
                All new projects will be marked as "Pending" and require moderator approval before becoming visible to others.
              </div>
            </div>
            
            <form onSubmit={handleAddProject}>
              <div className="mb-4">
                <label className="block text-gray-400 text-sm font-medium mb-1">
                  Project Name*
                </label>
                <input 
                  type="text" 
                  value={newProject.name}
                  onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8C848] bg-[#121212] text-white"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-400 text-sm font-medium mb-1">
                  Description*
                </label>
                <textarea 
                  value={newProject.description}
                  onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8C848] bg-[#121212] text-white"
                  rows="3"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-400 text-sm font-medium mb-1">
                  Tech Stack* (comma separated)
                </label>
                <input 
                  type="text" 
                  value={newProject.tech_stack}
                  onChange={(e) => setNewProject({...newProject, tech_stack: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8C848] bg-[#121212] text-white"
                  placeholder="React, Node.js, MongoDB"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-400 text-sm font-medium mb-1">
                  GitHub Link
                </label>
                <input 
                  type="url" 
                  value={newProject.github_link}
                  onChange={(e) => setNewProject({...newProject, github_link: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8C848] bg-[#121212] text-white"
                  placeholder="https://github.com/yourusername/project"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-400 text-sm font-medium mb-1">
                  Live Demo URL
                </label>
                <input 
                  type="url" 
                  value={newProject.live_demo}
                  onChange={(e) => setNewProject({...newProject, live_demo: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8C848] bg-[#121212] text-white"
                  placeholder="https://your-project-demo.com"
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <button 
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-gray-800 rounded-lg text-gray-400 hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-[#E8C848] text-[#121212] rounded-lg hover:bg-[#E8C848]/80 transition-all duration-300"
                >
                  Add Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditModalOpen && currentProject && (
        <div className="fixed inset-0 bg-[#121212]/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#1A1A1A] rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto border border-gray-800 hover:border-[#E8C848]/30 transition-all duration-300">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-white">Edit Project</h3>
              <button 
                onClick={() => {
                  setIsEditModalOpen(false);
                  setCurrentProject(null);
                }}
                className="text-gray-400 hover:text-gray-300"
              >
                &times;
              </button>
            </div>
            
            <div className="mb-4 bg-[#E8C848]/10 p-3 rounded-lg text-sm text-[#E8C848] flex items-start gap-2">
              <AlertCircle size={18} className="text-[#E8C848] flex-shrink-0 mt-0.5" />
              <div>
                Editing this project will reset its status to "Pending" and it will require moderator approval again.
              </div>
            </div>
            
            <form onSubmit={handleEditProject}>
              <div className="mb-4">
                <label className="block text-gray-400 text-sm font-medium mb-1">
                  Project Name*
                </label>
                <input 
                  type="text" 
                  value={currentProject.name}
                  onChange={(e) => setCurrentProject({...currentProject, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8C848] bg-[#121212] text-white"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-400 text-sm font-medium mb-1">
                  Description*
                </label>
                <textarea 
                  value={currentProject.description}
                  onChange={(e) => setCurrentProject({...currentProject, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8C848] bg-[#121212] text-white"
                  rows="3"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-400 text-sm font-medium mb-1">
                  Tech Stack* (comma separated)
                </label>
                <input 
                  type="text" 
                  value={currentProject.tech_stack}
                  onChange={(e) => setCurrentProject({...currentProject, tech_stack: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8C848] bg-[#121212] text-white"
                  placeholder="React, Node.js, MongoDB"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-400 text-sm font-medium mb-1">
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
                  className="w-full px-3 py-2 border border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8C848] bg-[#121212] text-white"
                  placeholder="https://github.com/yourusername/project"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-400 text-sm font-medium mb-1">
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
                  className="w-full px-3 py-2 border border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8C848] bg-[#121212] text-white"
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
                  className="px-4 py-2 border border-gray-800 rounded-lg text-gray-400 hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-[#E8C848] text-[#121212] rounded-lg hover:bg-[#E8C848]/80 transition-all duration-300"
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