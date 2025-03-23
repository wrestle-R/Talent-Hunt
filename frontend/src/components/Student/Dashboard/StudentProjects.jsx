import React, { useState, useEffect } from 'react';
import { FolderGit2, Code, Globe, Plus, Edit, Trash, ExternalLink, Github, ChevronRight } from 'lucide-react';
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
    tech_stack: [],
    github_link: '',
    live_demo: ''
  });

  // Function to fetch student projects
  const fetchProjects = async () => {
    if (!userData || !userData._id) {
      console.log("Missing student data, can't fetch projects");
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      const response = await axios.get(`http://localhost:4000/api/student/projects/${userData._id}`);
      
      if (Array.isArray(response.data.projects)) {
        // Apply filters and sorting if not in dashboard
        let filteredProjects = [...response.data.projects];
        
        // Only apply filters when not in dashboard or specific filters are provided
        if (!isInDashboard || searchFilter || techFilter || sortOrder !== 'newest') {
          // Apply search filter
          if (searchFilter) {
            filteredProjects = filteredProjects.filter(project => 
              project.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
              (project.description && project.description.toLowerCase().includes(searchFilter.toLowerCase()))
            );
          }
          
          // Apply tech stack filter
          if (techFilter) {
            filteredProjects = filteredProjects.filter(project => 
              project.tech_stack && project.tech_stack.some(tech => 
                tech.toLowerCase() === techFilter.toLowerCase()
              )
            );
          }
          
          // Apply sorting
          filteredProjects = filteredProjects.sort((a, b) => {
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
          : [newProject.tech_stack.trim()]
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
        tech_stack: [],
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
          : currentProject.tech_stack
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

  // Handle deleting a project
  const handleDeleteProject = async (projectId) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    
    try {
      setIsLoading(true);
      
      await axios.delete(`http://localhost:4000/api/student/projects/${userData._id}/${projectId}`);
      
      // Refresh projects after deleting
      fetchProjects();
    } catch (err) {
      console.error("Error deleting project:", err);
      setError(err.response?.data?.message || "Failed to delete project");
      setIsLoading(false);
    }
  };

  // Helper to format tech stack for display
  const formatTechStack = (techStack) => {
    if (!techStack || !techStack.length) return "N/A";
    
    return techStack.map(tech => (
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

  // Load project data when component mounts or when userData or filters change
  useEffect(() => {
    if (userData && userData._id) {
      fetchProjects();
    }
  }, [userData, isInDashboard, searchFilter, techFilter, sortOrder]);

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
  const isFilteredEmpty = !isLoading && projects.length === 0 && (searchFilter || techFilter);

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <FolderGit2 size={20} className="text-indigo-600" />
          {isInDashboard ? 'My Projects' : 'All Projects'}
        </h3>
        <div className="flex items-center gap-2">
          {projects.length > 0 && (
            <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">
              {isFilteredEmpty ? '0' : projects.length} {projects.length === 1 ? 'Project' : 'Projects'}
              {!isInDashboard && (searchFilter || techFilter) && ' (filtered)'}
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
      
      {projects.length > 0 ? (
        <div className="space-y-4">
          {projects.map(project => (
            <div key={project._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between">
                <h4 className="font-medium text-lg">{project.name}</h4>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      setCurrentProject({
                        ...project,
                        tech_stack: project.tech_stack.join(', ')
                      });
                      setIsEditModalOpen(true);
                    }}
                    className="text-gray-500 hover:text-indigo-600 transition-colors"
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    onClick={() => handleDeleteProject(project._id)}
                    className="text-gray-500 hover:text-red-600 transition-colors"
                  >
                    <Trash size={16} />
                  </button>
                </div>
              </div>
              
              <p className="text-gray-600 mt-1 mb-3 text-sm">
                {project.description}
              </p>
              
              <div className="flex flex-wrap mb-3">
                {formatTechStack(project.tech_stack)}
              </div>
              
              <div className="flex justify-end gap-2 mt-2">
                {project.github_link && (
                  <a 
                    href={project.github_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-sm hover:bg-gray-200 flex items-center gap-1"
                  >
                    <Github size={14} /> GitHub
                  </a>
                )}
                {project.live_demo && (
                  <a 
                    href={project.live_demo} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg text-sm hover:bg-indigo-200 flex items-center gap-1"
                  >
                    <Globe size={14} /> Live Demo
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : isFilteredEmpty ? (
        <div className="text-center text-gray-500 py-8">
          <FolderGit2 size={32} className="mx-auto text-gray-300 mb-3" />
          <h4 className="text-lg font-medium text-gray-500 mb-1">No matching projects</h4>
          <p className="text-gray-400 text-sm">
            Try adjusting your filters to find what you're looking for
          </p>
          <button 
            onClick={() => window.location.reload()} 
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
      {isInDashboard && projects.length > 0 && (
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
                  value={currentProject.github_link}
                  onChange={(e) => setCurrentProject({...currentProject, github_link: e.target.value})}
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
                  value={currentProject.live_demo}
                  onChange={(e) => setCurrentProject({...currentProject, live_demo: e.target.value})}
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