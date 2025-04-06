import React, { useState } from 'react';
import { X, Plus, Save } from 'lucide-react';
import axios from 'axios';

const StudentNewProject = ({ isOpen, onClose, onProjectAdded }) => {
  const [project, setProject] = useState({
    name: '',
    description: '',
    tech_stack: [],
    github_link: '',
    live_demo: ''
  });
  const [newTech, setNewTech] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProject(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addTech = () => {
    if (!newTech.trim()) return;
    setProject(prev => ({
      ...prev,
      tech_stack: [...prev.tech_stack, newTech.trim()]
    }));
    setNewTech('');
  };

  const removeTech = (indexToRemove) => {
    setProject(prev => ({
      ...prev,
      tech_stack: prev.tech_stack.filter((_, index) => index !== indexToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!project.name.trim()) {
      setError('Project name is required');
      return;
    }

    try {
      setSaving(true);
      setError('');
      
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user || !user.uid) {
        setError("User not found. Please log in again.");
        setSaving(false);
        return;
      }
      
      // Get current user profile
      const response = await axios.get(`http://localhost:4000/api/student/profile/${user.uid}`);
      const currentProfile = response.data;
      
      // Add new project to projects array
      const updatedProjects = [...(currentProfile.projects || []), project];
      
      // Update the profile
      await axios.put(`http://localhost:4000/api/student/profile/${user.uid}`, {
        ...currentProfile,
        projects: updatedProjects
      });
      
      // Notify parent component about the new project
      onProjectAdded(project);
      
      // Close the modal
      onClose();
    } catch (err) {
      console.error("Error adding project:", err);
      setError("Failed to add project. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#121212]/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1A1A1A] rounded-lg shadow-lg w-full max-w-md border border-gray-800 hover:border-[#E8C848]/30 transition-all duration-300">
        <div className="flex justify-between items-center p-4 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-white">Add New Project</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-[#E8C848] transition-all duration-300"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          {error && (
            <div className="bg-red-900/20 text-red-400 p-2 mb-4 rounded text-sm border border-red-900/50">
              {error}
            </div>
          )}
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1 text-white">Project Name *</label>
              <input 
                type="text"
                name="name"
                value={project.name}
                onChange={handleChange}
                className="w-full p-2 bg-[#121212] border border-gray-800 rounded text-white placeholder-gray-500 focus:outline-none focus:border-[#E8C848]/50 transition-all duration-300"
                placeholder="Enter project name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-white">Description</label>
              <textarea
                name="description"
                value={project.description}
                onChange={handleChange}
                className="w-full p-2 bg-[#121212] border border-gray-800 rounded text-white placeholder-gray-500 focus:outline-none focus:border-[#E8C848]/50 transition-all duration-300"
                rows="2"
                placeholder="Brief description of your project"
              ></textarea>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-white">Technologies Used</label>
              <div className="flex flex-wrap gap-1 mb-2">
                {project.tech_stack.map((tech, index) => (
                  <div key={index} className="bg-[#E8C848]/10 text-[#E8C848] px-2 py-0.5 rounded-full flex items-center gap-1 text-xs border border-[#E8C848]/20">
                    {tech}
                    <button 
                      type="button" 
                      onClick={() => removeTech(index)} 
                      className="text-[#E8C848] hover:text-[#E8C848]/80"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex">
                <input 
                  type="text" 
                  value={newTech} 
                  onChange={(e) => setNewTech(e.target.value)}
                  className="flex-1 p-2 bg-[#121212] border border-gray-800 rounded-l text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#E8C848]/50 transition-all duration-300"
                  placeholder="Add technology"
                />
                <button 
                  type="button" 
                  onClick={addTech}
                  className="bg-[#E8C848] text-[#121212] px-2 py-1 rounded-r hover:bg-[#E8C848]/80 transition-all duration-300"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-white">GitHub Link</label>
              <input 
                type="url"
                name="github_link"
                value={project.github_link}
                onChange={handleChange}
                className="w-full p-2 bg-[#121212] border border-gray-800 rounded text-white placeholder-gray-500 focus:outline-none focus:border-[#E8C848]/50 transition-all duration-300"
                placeholder="https://github.com/yourusername/project"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-white">Live Demo URL</label>
              <input 
                type="url"
                name="live_demo"
                value={project.live_demo}
                onChange={handleChange}
                className="w-full p-2 bg-[#121212] border border-gray-800 rounded text-white placeholder-gray-500 focus:outline-none focus:border-[#E8C848]/50 transition-all duration-300"
                placeholder="https://your-demo-site.com"
              />
            </div>
          </div>
          
          <div className="flex justify-end mt-6 gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-800 rounded text-gray-300 hover:bg-[#121212] transition-all duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-[#E8C848] text-[#121212] px-4 py-2 rounded hover:bg-[#E8C848]/80 transition-all duration-300 shadow-lg shadow-[#E8C848]/20"
            >
              {saving ? 'Adding...' : (
                <>
                  <Save size={16} /> Save Project
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentNewProject;