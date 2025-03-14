import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, GraduationCap, Code, Award, Briefcase, Globe, Save, X, Plus, Clock, Target } from 'lucide-react';

const StudentProfile = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    profile_picture: '',
    location: { city: '', country: '' },
    education: { institution: '', degree: '', graduation_year: new Date().getFullYear() },
    skills: [],
    interests: [],
    experience: [],
    hackathon_prev_experiences: 0,
    hackathon_current_interests: [],
    projects: [],
    achievements: [],
    certifications: [],
    social_links: { github: '', linkedin: '', portfolio: '' },
    mentorship_interests: { seeking_mentor: false, mentor_topics: [] },
    timezone: '',
    preferred_working_hours: { start_time: '09:00', end_time: '17:00' },
    goals: []
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [newInterest, setNewInterest] = useState('');
  const [newHackathonInterest, setNewHackathonInterest] = useState('');
  const [newCertification, setNewCertification] = useState('');
  const [newGoal, setNewGoal] = useState('');
  const [newMentorTopic, setNewMentorTopic] = useState('');
  const [newTechInput, setNewTechInput] = useState('');

  // Fetch student profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user || !user.uid) {
          console.error("User not found in localStorage");
          setLoading(false);
          return;
        }
        console.log(user.uid)
        const response = await axios.get(`http://localhost:4000/api/student/profile/${user.uid}`);
        
        if (response.data) {
          setFormData({
            ...formData,
            ...response.data,
            location: response.data.location || formData.location,
            education: response.data.education || formData.education,
            social_links: response.data.social_links || formData.social_links,
            mentorship_interests: response.data.mentorship_interests || formData.mentorship_interests,
            preferred_working_hours: response.data.preferred_working_hours || formData.preferred_working_hours
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, []);
  
  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      mentorship_interests: {
        ...prev.mentorship_interests,
        [name]: checked
      }
    }));
  };
  
  // Generic functions for arrays
  const addItem = (field, value, setter) => {
    if (!value.trim()) return;
    
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: [...prev[parent][child], value.trim()]
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));
    }
    
    setter('');
  };
  
  const removeItem = (field, index) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: prev[parent][child].filter((_, i) => i !== index)
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index)
      }));
    }
  };
  
  // Project functions
  const addProject = () => {
    setFormData(prev => ({
      ...prev,
      projects: [
        ...prev.projects,
        { name: '', description: '', tech_stack: [], github_link: '', live_demo: '' }
      ]
    }));
  };
  
  const updateProject = (index, field, value) => {
    setFormData(prev => {
      const projects = [...prev.projects];
      projects[index] = { ...projects[index], [field]: value };
      return { ...prev, projects };
    });
  };
  
  const addProjectTech = (projectIndex, tech) => {
    if (!tech.trim()) return;
    setFormData(prev => {
      const projects = [...prev.projects];
      projects[projectIndex].tech_stack = [...projects[projectIndex].tech_stack, tech.trim()];
      return { ...prev, projects };
    });
    setNewTechInput('');
  };
  
  const removeProjectTech = (projectIndex, techIndex) => {
    setFormData(prev => {
      const projects = [...prev.projects];
      projects[projectIndex].tech_stack = projects[projectIndex].tech_stack.filter((_, i) => i !== techIndex);
      return { ...prev, projects };
    });
  };
  
  const removeProject = (index) => {
    setFormData(prev => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index)
    }));
  };
  
  // Experience functions
  const addExperience = () => {
    setFormData(prev => ({
      ...prev,
      experience: [
        ...prev.experience,
        { title: '', description: '', date: new Date().toISOString().split('T')[0], type: 'Project' }
      ]
    }));
  };
  
  const updateExperience = (index, field, value) => {
    setFormData(prev => {
      const experiences = [...prev.experience];
      experiences[index] = { ...experiences[index], [field]: value };
      return { ...prev, experience: experiences };
    });
  };
  
  const removeExperience = (index) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
  };
  
  // Achievement functions
  const addAchievement = () => {
    setFormData(prev => ({
      ...prev,
      achievements: [
        ...prev.achievements,
        { title: '', description: '', date: new Date().toISOString().split('T')[0] }
      ]
    }));
  };
  
  const updateAchievement = (index, field, value) => {
    setFormData(prev => {
      const achievements = [...prev.achievements];
      achievements[index] = { ...achievements[index], [field]: value };
      return { ...prev, achievements };
    });
  };
  
  const removeAchievement = (index) => {
    setFormData(prev => ({
      ...prev,
      achievements: prev.achievements.filter((_, i) => i !== index)
    }));
  };
  
  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user || !user.uid) {
        console.error("User not found in localStorage");
        return;
      }
    
      await axios.put(`http://localhost:4000/api/student/profile/${user.uid}`, formData);
      
      alert("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return <div className="flex justify-center p-8">Loading profile...</div>;
  }
  
  return (
    <div className="max-w-4xl mx-auto p-4 bg-gray-50">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Basic Information */}
        <div className="bg-white p-5 rounded shadow-sm">
          <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
            <User className="text-blue-600" /> Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1">Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} 
                className="w-full p-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm mb-1">Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} 
                className="w-full p-2 border rounded" readOnly />
            </div>
            <div>
              <label className="block text-sm mb-1">Phone</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} 
                className="w-full p-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm mb-1">Profile Picture URL</label>
              <input type="url" name="profile_picture" value={formData.profile_picture} onChange={handleChange} 
                className="w-full p-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm mb-1">City</label>
              <input type="text" name="location.city" value={formData.location.city} onChange={handleChange} 
                className="w-full p-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm mb-1">Country</label>
              <input type="text" name="location.country" value={formData.location.country} onChange={handleChange} 
                className="w-full p-2 border rounded" />
            </div>
          </div>
        </div>

        {/* Education */}
        <div className="bg-white p-5 rounded shadow-sm">
          <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
            <GraduationCap className="text-blue-600" /> Education
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1">Institution</label>
              <input type="text" name="education.institution" value={formData.education.institution} 
                onChange={handleChange} className="w-full p-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm mb-1">Degree</label>
              <input type="text" name="education.degree" value={formData.education.degree} 
                onChange={handleChange} className="w-full p-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm mb-1">Graduation Year</label>
              <input type="number" name="education.graduation_year" value={formData.education.graduation_year} 
                onChange={handleChange} min="2000" max="2030" className="w-full p-2 border rounded" />
            </div>
          </div>
        </div>

        {/* Skills & Interests */}
        <div className="bg-white p-5 rounded shadow-sm">
          <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
            <Code className="text-blue-600" /> Skills & Interests
          </h2>
          
          {/* Skills */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Skills</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.skills.map((skill, index) => (
                <div key={index} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full flex items-center gap-1">
                  {skill}
                  <button type="button" onClick={() => removeItem('skills', index)} className="text-blue-700">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex">
              <input type="text" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} 
                className="flex-1 p-2 border rounded-l" placeholder="Add a skill" />
              <button type="button" onClick={() => addItem('skills', newSkill, setNewSkill)} 
                className="bg-blue-600 text-white px-3 py-2 rounded-r">
                <Plus size={18} />
              </button>
            </div>
          </div>
          
          {/* Fields of Interest */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Fields of Interest</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.interests.map((interest, index) => (
                <div key={index} className="bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center gap-1">
                  {interest}
                  <button type="button" onClick={() => removeItem('interests', index)} className="text-green-700">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex">
              <input type="text" value={newInterest} onChange={(e) => setNewInterest(e.target.value)}
                className="flex-1 p-2 border rounded-l" placeholder="Add an interest" />
              <button type="button" onClick={() => addItem('interests', newInterest, setNewInterest)}
                className="bg-green-600 text-white px-3 py-2 rounded-r">
                <Plus size={18} />
              </button>
            </div>
          </div>
          
          {/* Hackathon Interests */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Hackathon Interests</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.hackathon_current_interests.map((interest, index) => (
                <div key={index} className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full flex items-center gap-1">
                  {interest}
                  <button type="button" onClick={() => removeItem('hackathon_current_interests', index)} className="text-purple-700">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex">
              <input type="text" value={newHackathonInterest} onChange={(e) => setNewHackathonInterest(e.target.value)}
                className="flex-1 p-2 border rounded-l" placeholder="Add hackathon interest" />
              <button type="button" onClick={() => addItem('hackathon_current_interests', newHackathonInterest, setNewHackathonInterest)}
                className="bg-purple-600 text-white px-3 py-2 rounded-r">
                <Plus size={18} />
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Previous Hackathon Experience</label>
            <input type="number" name="hackathon_prev_experiences" value={formData.hackathon_prev_experiences}
              onChange={handleChange} min="0" className="w-32 p-2 border rounded" />
          </div>
        </div>

        {/* Projects */}
        <div className="bg-white p-5 rounded shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Briefcase className="text-blue-600" /> Projects
            </h2>
            <button type="button" onClick={addProject} className="bg-blue-600 text-white px-2 py-1 rounded text-sm flex items-center gap-1">
              <Plus size={16} /> Add Project
            </button>
          </div>
          
          {formData.projects.length === 0 ? (
            <p className="text-gray-500 text-sm italic">No projects added yet</p>
          ) : (
            formData.projects.map((project, index) => (
              <div key={index} className="border rounded p-3 mb-3">
                <div className="flex justify-between">
                  <h3 className="font-medium">Project #{index + 1}</h3>
                  <button type="button" onClick={() => removeProject(index)} className="text-red-600">
                    <X size={18} />
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-2 mt-2">
                  <input type="text" placeholder="Project name" value={project.name}
                    onChange={(e) => updateProject(index, 'name', e.target.value)} className="w-full p-2 border rounded" />
                  <textarea placeholder="Description" value={project.description}
                    onChange={(e) => updateProject(index, 'description', e.target.value)} className="w-full p-2 border rounded" rows="2"></textarea>
                  <div>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {project.tech_stack.map((tech, techIndex) => (
                        <div key={techIndex} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full flex items-center gap-1 text-xs">
                          {tech}
                          <button type="button" onClick={() => removeProjectTech(index, techIndex)} className="text-blue-700">
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex">
                      <input type="text" placeholder="Add technology" value={newTechInput} 
                        onChange={(e) => setNewTechInput(e.target.value)} className="flex-1 p-2 border rounded-l text-sm" />
                      <button type="button" onClick={() => addProjectTech(index, newTechInput)}
                        className="bg-blue-600 text-white px-2 py-1 rounded-r">
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                  <input type="url" placeholder="GitHub link" value={project.github_link}
                    onChange={(e) => updateProject(index, 'github_link', e.target.value)} className="w-full p-2 border rounded" />
                  <input type="url" placeholder="Live demo URL" value={project.live_demo}
                    onChange={(e) => updateProject(index, 'live_demo', e.target.value)} className="w-full p-2 border rounded" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button type="submit" disabled={saving} 
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">
            {saving ? 'Saving...' : <>
              <Save size={18} /> Save Profile
            </>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StudentProfile;