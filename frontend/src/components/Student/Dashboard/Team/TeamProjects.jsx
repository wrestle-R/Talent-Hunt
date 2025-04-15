import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, FileCode, Calendar, CheckCircle, Clock, AlertCircle, Loader, RefreshCw, 
  Github, Plus, Edit, Trash2, X, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';

const TeamProjects = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [isTeamLeader, setIsTeamLeader] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'planning',
    techStack: [],
    githubRepo: '',
    deployedUrl: '',
    startDate: '',
    endDate: ''
  });
  const [techInput, setTechInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const studentId = currentUser._id;

  const refreshTeamData = async () => {
    try {
      const response = await axios.get(`http://localhost:4000/api/teams/${teamId}?studentId=${studentId}`);
      
      if (response.data && response.data.success) {
        const teamData = response.data.team;
        
        if (!teamData) {
          console.error('Invalid team data received');
          return false;
        }
        
        const leaderId = teamData.leader && teamData.leader._id ? teamData.leader._id : null;
        
        setTeam({
          _id: teamData._id,
          name: teamData.name,
          description: teamData.description,
          members: teamData.members || [],
          leader: leaderId,
        });
        
        let isLeader = false;
        if (leaderId && studentId) {
          isLeader = leaderId.toString() === studentId.toString();
        }
        
        setIsTeamLeader(isLeader);
        setProjects(teamData.projects || []);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error refreshing team data:', err);
      return false;
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchTeamProjects = async () => {
      if (!teamId) {
        setError('No team ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        const response = await axios.get(`http://localhost:4000/api/teams/${teamId}?studentId=${studentId}`);
        
        if (response.data && response.data.success) {
          const teamData = response.data.team;
          
          if (!teamData) {
            throw new Error('Invalid team data received');
          }
          
          const leaderId = teamData.leader && teamData.leader._id ? teamData.leader._id : null;
          
          setTeam({
            _id: teamData._id,
            name: teamData.name,
            description: teamData.description,
            members: teamData.members || [],
            leader: leaderId,
          });
          
          let isLeader = false;
          if (leaderId && studentId) {
            isLeader = leaderId.toString() === studentId.toString();
          }
          
          setIsTeamLeader(isLeader);
          setProjects(teamData.projects || []);
        } else {
          setError('Failed to load team projects');
        }
      } catch (err) {
        console.error('Error fetching team projects:', err);
        setError(err.response?.data?.message || 'Failed to load team projects');
      } finally {
        setLoading(false);
      }
    };

    fetchTeamProjects();
  }, [teamId, studentId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddTech = () => {
    if (techInput.trim()) {
      setFormData(prev => ({
        ...prev,
        techStack: [...prev.techStack, techInput.trim()]
      }));
      setTechInput('');
    }
  };

  const handleRemoveTech = (index) => {
    setFormData(prev => ({
      ...prev,
      techStack: prev.techStack.filter((_, i) => i !== index)
    }));
  };

  const handleTechKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTech();
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast.error('Project name is required');
      return;
    }

    if (formData.status === 'completed' && !formData.endDate) {
      toast.error('End date is required for completed projects');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const payload = {
        name: formData.name,
        description: formData.description || '',
        status: formData.status,
        techStack: formData.techStack || [],
        githubUrl: formData.githubRepo || '',
        deployedUrl: formData.deployedUrl || '',
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
        studentId: studentId
      };
      
      const response = await axios.post(
        `http://localhost:4000/api/teams/${teamId}/projects`, 
        payload
      );
      
      if (response.data.success) {
        toast.success('Project created successfully!');
        
        setFormData({
          name: '',
          description: '',
          status: 'planning',
          techStack: [],
          githubRepo: '',
          deployedUrl: '',
          startDate: '',
          endDate: ''
        });
        setIsCreating(false);
        
        await refreshTeamData();
      } else {
        throw new Error(response.data.message || 'Failed to create project');
      }
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error(error.response?.data?.message || 'Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateProject = async (e) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast.error('Project name is required');
      return;
    }

    if (formData.status === 'completed' && !formData.endDate) {
      toast.error('End date is required for completed projects');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const payload = {
        name: formData.name,
        description: formData.description || '',
        status: formData.status,
        techStack: formData.techStack || [],
        githubUrl: formData.githubRepo || '',
        deployedUrl: formData.deployedUrl || '',
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
        studentId: studentId
      };
      
      const response = await axios.put(
        `http://localhost:4000/api/teams/${teamId}/projects/${editingProjectId}`, 
        payload
      );
      
      if (response.data.success) {
        toast.success('Project updated successfully!');
        
        setEditingProjectId(null);
        
        await refreshTeamData();
      } else {
        throw new Error(response.data.message || 'Failed to update project');
      }
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error(error.response?.data?.message || 'Failed to update project');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await axios.delete(
        `http://localhost:4000/api/teams/${teamId}/projects/${projectId}`,
        { data: { studentId: studentId } }
      );
      
      if (response.data.success) {
        toast.success('Project deleted successfully');
        
        await refreshTeamData();
      } else {
        throw new Error(response.data.message || 'Failed to delete project');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error(error.response?.data?.message || 'Failed to delete project');
    }
  };

  const handleEditProject = (project) => {
    setFormData({
      name: project.name,
      description: project.description || '',
      status: project.status || 'planning',
      techStack: project.techStack || [],
      githubRepo: project.githubUrl || project.githubRepo || '',
      deployedUrl: project.deployedUrl || '',
      startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
      endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : ''
    });
    setEditingProjectId(project._id);
    setIsCreating(false);
  };

  const handleCancelForm = () => {
    setIsCreating(false);
    setEditingProjectId(null);
    setFormData({
      name: '',
      description: '',
      status: 'planning',
      techStack: [],
      githubRepo: '',
      deployedUrl: '',
      startDate: '',
      endDate: ''
    });
  };

  const renderStatusBadge = (status) => {
    switch(status) {
      case 'completed':
        return (
          <span className="bg-[#E8C848]/10 text-[#E8C848] px-2 py-1 rounded-full text-xs flex items-center">
            <CheckCircle size={12} className="mr-1" />
            Completed
          </span>
        );
      case 'in-progress':
        return (
          <span className="bg-[#E8C848]/10 text-[#E8C848] px-2 py-1 rounded-full text-xs flex items-center">
            <Clock size={12} className="mr-1" />
            In Progress
          </span>
        );
      case 'planning':
        return (
          <span className="bg-[#E8C848]/10 text-[#E8C848] px-2 py-1 rounded-full text-xs flex items-center">
            <Calendar size={12} className="mr-1" />
            Planning
          </span>
        );
      case 'abandoned':
        return (
          <span className="bg-red-900/20 text-red-400 px-2 py-1 rounded-full text-xs flex items-center">
            <AlertCircle size={12} className="mr-1" />
            Abandoned
          </span>
        );
      default:
        return (
          <span className="bg-[#1A1A1A] text-gray-400 px-2 py-1 rounded-full text-xs">
            {status}
          </span>
        );
    }
  };

  if (initialLoading || loading) {
    return (
      <div className="min-h-screen bg-[#121212]">
        <div className="max-w-6xl mx-auto p-6">
          <div className="flex items-center mb-6">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-full bg-[#1A1A1A] text-[#E8C848] hover:bg-[#E8C848]/10 transition-all duration-300"
            >
              <ChevronLeft size={20} />
            </button>
            <h2 className="text-2xl font-bold text-white">Team Projects</h2>
          </div>
          
          <div className="bg-[#1A1A1A] rounded-xl shadow-lg p-10 border border-gray-800">
            <div className="flex flex-col justify-center items-center h-60">
              <Loader className="animate-spin text-[#E8C848] mb-4" size={50} />
              <span className="text-lg text-gray-300">Loading team projects...</span>
              <p className="text-sm text-gray-400 mt-2">Please wait while we retrieve the project data</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const ProjectForm = ({ isEditing }) => (
    <div className="bg-[#1A1A1A] rounded-xl shadow-lg p-6 mb-6 border border-gray-800 hover:border-[#E8C848]/30 transition-all duration-300">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg text-white">{isEditing ? 'Edit Project' : 'Create New Project'}</h3>
        <button 
          onClick={handleCancelForm}
          className="text-gray-400 hover:text-[#E8C848] transition-all duration-300"
        >
          <X size={20} />
        </button>
      </div>
      
      <form onSubmit={isEditing ? handleUpdateProject : handleCreateProject}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Project Name*</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-[#121212] border border-gray-800 text-white rounded-md focus:ring-2 focus:ring-[#E8C848] focus:border-[#E8C848] placeholder-gray-500 transition-all duration-300"
              placeholder="Enter project name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full px-3 py-2 bg-[#121212] border border-gray-800 text-white rounded-md focus:ring-2 focus:ring-[#E8C848] focus:border-[#E8C848] placeholder-gray-500 transition-all duration-300"
              placeholder="Enter project description"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-[#121212] border border-gray-800 text-white rounded-md focus:ring-2 focus:ring-[#E8C848] focus:border-[#E8C848] placeholder-gray-500 transition-all duration-300"
            >
              <option value="planning">Planning</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="abandoned">Abandoned</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Technologies</label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyPress={handleTechKeyPress}
                className="flex-grow px-3 py-2 bg-[#121212] border border-gray-800 text-white rounded-md focus:ring-2 focus:ring-[#E8C848] focus:border-[#E8C848] placeholder-gray-500 transition-all duration-300"
                placeholder="Add a technology"
              />
              <button
                type="button"
                onClick={handleAddTech}
                className="px-3 py-2 bg-[#E8C848]/10 text-[#E8C848] rounded-md hover:bg-[#E8C848]/20 transition-all duration-300"
              >
                Add
              </button>
            </div>
            
            {formData.techStack.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.techStack.map((tech, idx) => (
                  <span key={idx} className="px-2 py-1 bg-gray-800 text-gray-300 rounded-full text-xs flex items-center">
                    {tech}
                    <button
                      type="button"
                      onClick={() => handleRemoveTech(idx)}
                      className="ml-1 text-gray-400 hover:text-[#E8C848] transition-all duration-300"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">GitHub Repository</label>
              <input
                type="url"
                name="githubRepo"
                value={formData.githubRepo}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-[#121212] border border-gray-800 text-white rounded-md focus:ring-2 focus:ring-[#E8C848] focus:border-[#E8C848] placeholder-gray-500 transition-all duration-300"
                placeholder="https://github.com/username/repo"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Deployed URL</label>
              <input
                type="url"
                name="deployedUrl"
                value={formData.deployedUrl}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-[#121212] border border-gray-800 text-white rounded-md focus:ring-2 focus:ring-[#E8C848] focus:border-[#E8C848] placeholder-gray-500 transition-all duration-300"
                placeholder="https://your-project.com"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Start Date</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-[#121212] border border-gray-800 text-white rounded-md focus:ring-2 focus:ring-[#E8C848] focus:border-[#E8C848] placeholder-gray-500 transition-all duration-300"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                End Date {formData.status === 'completed' && <span className="text-[#E8C848]">*</span>}
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-[#121212] border border-gray-800 text-white rounded-md focus:ring-2 focus:ring-[#E8C848] focus:border-[#E8C848] placeholder-gray-500 transition-all duration-300"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={handleCancelForm}
              className="px-4 py-2 border border-gray-800 rounded-md text-gray-300 hover:bg-[#E8C848]/10 hover:text-[#E8C848] hover:border-[#E8C848]/30 transition-all duration-300"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 rounded-md text-[#121212] flex items-center ${
                isSubmitting 
                  ? 'bg-[#E8C848]/50 cursor-not-allowed' 
                  : 'bg-[#E8C848] hover:bg-[#E8C848]/80 shadow-lg shadow-[#E8C848]/30'
              } transition-all duration-300`}
            >
              {isSubmitting ? (
                <>
                  <Loader size={16} className="animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  {isEditing ? 'Update Project' : 'Create Project'}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#121212]">
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-full bg-[#1A1A1A] text-[#E8C848] hover:bg-[#E8C848]/10 transition-all duration-300"
            >
              <ChevronLeft size={20} />
            </button>
            <h2 className="text-2xl font-bold text-white">Team Projects</h2>
          </div>
          
          {!isCreating && !editingProjectId && (
            <button
              onClick={() => setIsCreating(true)}
              className="flex items-center bg-[#E8C848] text-[#121212] px-4 py-2 rounded-lg hover:bg-[#E8C848]/80 transition-all duration-300 shadow-lg shadow-[#E8C848]/30"
            >
              <Plus size={18} className="mr-2" />
              New Project
            </button>
          )}
        </div>

        {team && team.name && (
          <div className="bg-[#1A1A1A] rounded-xl p-4 mb-6 border border-gray-800 hover:border-[#E8C848]/30 transition-all duration-300">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-lg bg-[#E8C848]/10 flex items-center justify-center mr-4">
                <FileCode size={20} className="text-[#E8C848]" />
              </div>
              <div>
                <h3 className="font-bold text-white">{team.name} Projects</h3>
                <p className="text-gray-400 text-sm">
                  {projects.length} project{projects.length !== 1 ? 's' : ''}
                  {isTeamLeader && (
                    <span className="ml-2 px-2 py-0.5 bg-[#E8C848]/10 text-[#E8C848] rounded-full text-xs">
                      Team Leader
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {isCreating && <ProjectForm isEditing={false} />}
        
        {editingProjectId && <ProjectForm isEditing={true} />}

        {projects.length === 0 && !isCreating ? (
          <div className="bg-[#1A1A1A] rounded-xl shadow-lg p-8 text-center border border-gray-800">
            <div className="flex flex-col items-center">
              <FileCode size={48} className="text-gray-600 mb-4" />
              <h3 className="text-xl font-medium text-gray-300 mb-2">No Projects Found</h3>
              <p className="text-gray-400 max-w-md mb-6">
                This team hasn't created any projects yet. Projects will be displayed here once they're added.
              </p>
              <button
                onClick={() => setIsCreating(true)}
                className="bg-[#E8C848] text-[#121212] px-4 py-2 rounded-lg hover:bg-[#E8C848]/80 transition-all duration-300 shadow-lg shadow-[#E8C848]/30 flex items-center"
              >
                <Plus size={18} className="mr-2" />
                Create First Project
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div key={project._id} className="bg-[#1A1A1A] rounded-xl shadow-lg overflow-hidden border border-gray-800 hover:border-[#E8C848]/30 transition-all duration-300">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-lg text-white">{project.name}</h3>
                    {renderStatusBadge(project.status)}
                  </div>
                  
                  <p className="text-gray-400 mb-4 line-clamp-3">{project.description}</p>
                  
                  <div className="border-t border-gray-800 pt-4 flex flex-wrap gap-2 mb-4">
                    {project.techStack && project.techStack.map((tech, idx) => (
                      <span key={idx} className="px-2 py-1 bg-gray-800 text-gray-300 rounded-full text-xs">
                        {tech}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar size={14} className="mr-1 text-gray-400" />
                      <span className="text-gray-400">
                        {project.startDate && new Date(project.startDate).toLocaleDateString()}
                        {project.endDate && ` - ${new Date(project.endDate).toLocaleDateString()}`}
                      </span>
                    </div>
                    
                    {(project.githubUrl || project.githubRepo) && (
                      <a 
                        href={project.githubUrl || project.githubRepo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-[#E8C848] hover:text-[#E8C848]/80 transition-all duration-300"
                      >
                        <Github size={14} className="mr-1" />
                        Repo
                      </a>
                    )}
                  </div>
                  
                  <div className="mt-4 flex space-x-2 border-t border-gray-800 pt-4">
                    <button 
                      onClick={() => handleEditProject(project)}
                      className="flex-1 flex items-center justify-center bg-[#E8C848]/10 text-[#E8C848] py-2 rounded-lg hover:bg-[#E8C848]/20 transition-all duration-300 text-sm font-medium"
                    >
                      <Edit size={14} className="mr-1" />
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteProject(project._id)}
                      className="flex-1 flex items-center justify-center bg-red-800/10 text-red-600 py-2 rounded-lg hover:bg-red-800/20 transition-all duration-300 text-sm font-medium"
                    >
                      <Trash2 size={14} className="mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamProjects;