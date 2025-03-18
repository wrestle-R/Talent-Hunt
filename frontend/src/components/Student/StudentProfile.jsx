import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, GraduationCap, Code, Award, Briefcase, Globe, Save, X, Plus, Clock, Target, Users } from 'lucide-react';

const StudentProfile = () => {
  // Initialize form data with all schema fields
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
    preferred_working_hours: { start_time: '09:00', end_time: '17:00' },
    goals: [],
    // Add new fields for teammate search preferences
    teammate_search: {
      looking_for_teammates: false,
      purpose: 'Both',
      desired_skills: [],
      project_description: '',
      team_size_preference: '',
      urgency_level: 'Medium'
    },
    // Current search preferences
    current_search_preferences: {
      looking_for: 'None',
      hackathon_teammate_preferences: {
        hackathon_name: '',
        hackathon_date: '',
        required_skills: [],
        team_size: 0,
        idea_description: ''
      },
      project_teammate_preferences: {
        project_type: '',
        project_duration: '',
        required_skills: [],
        commitment_level: 'Medium'
      }
    }
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basic'); // To manage tabs
  const [newItem, setNewItem] = useState({ // Generic state for new items
    skill: '',
    interest: '',
    hackathonInterest: '',
    certification: '',
    goal: '',
    mentorTopic: '',
    tech: '',
    // New fields for collaboration
    desiredSkill: '',
    hackathonRequiredSkill: '',
    projectRequiredSkill: ''
  });
  
  // Fetch student profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user?.uid) {
          setLoading(false);
          return;
        }
        
        const response = await axios.get(`http://localhost:4000/api/student/profile/${user.uid}`);
        if (response.data) {
          setFormData(prev => ({
            ...prev,
            ...response.data,
            location: response.data.location || prev.location,
            education: response.data.education || prev.education,
            social_links: response.data.social_links || prev.social_links,
            mentorship_interests: response.data.mentorship_interests || prev.mentorship_interests,
            preferred_working_hours: response.data.preferred_working_hours || prev.preferred_working_hours,
            teammate_search: response.data.teammate_search || prev.teammate_search,
            current_search_preferences: response.data.current_search_preferences || prev.current_search_preferences
          }));
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, []);
  
  // Handle form field changes - unified handler for all types
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      if (name.includes('.')) {
        const parts = name.split('.');
        if (parts.length === 2) {
          const [parent, child] = parts;
          setFormData(prev => ({
            ...prev,
            [parent]: { ...prev[parent], [child]: checked }
          }));
        } else if (parts.length === 3) {
          const [parent, middle, child] = parts;
          setFormData(prev => ({
            ...prev,
            [parent]: { 
              ...prev[parent], 
              [middle]: { 
                ...prev[parent][middle], 
                [child]: checked 
              }
            }
          }));
        }
      } else {
        setFormData(prev => ({ ...prev, [name]: checked }));
      }
      return;
    }
    
    if (name.includes('.')) {
      const parts = name.split('.');
      if (parts.length === 2) {
        const [parent, child] = parts;
        setFormData(prev => ({
          ...prev,
          [parent]: { ...prev[parent], [child]: value }
        }));
      } else if (parts.length === 3) {
        const [parent, middle, child] = parts;
        setFormData(prev => ({
          ...prev,
          [parent]: { 
            ...prev[parent], 
            [middle]: { 
              ...prev[parent][middle], 
              [child]: value 
            }
          }
        }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  // Generic functions for array operations
  const addItem = (field, value) => {
    if (!value.trim()) return;
    
    if (field.includes('.')) {
      const parts = field.split('.');
      if (parts.length === 2) {
        const [parent, child] = parts;
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: [...prev[parent][child], value.trim()]
          }
        }));
      } else if (parts.length === 3) {
        const [parent, middle, child] = parts;
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [middle]: {
              ...prev[parent][middle],
              [child]: [...prev[parent][middle][child], value.trim()]
            }
          }
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));
    }
    
    // Reset the input
    const inputType = field.includes('.') ? field.split('.').pop() : field;
    setNewItem(prev => ({ ...prev, [inputType]: '' }));
  };
  
  const removeItem = (field, index) => {
    if (field.includes('.')) {
      const parts = field.split('.');
      if (parts.length === 2) {
        const [parent, child] = parts;
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: prev[parent][child].filter((_, i) => i !== index)
          }
        }));
      } else if (parts.length === 3) {
        const [parent, middle, child] = parts;
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [middle]: {
              ...prev[parent][middle],
              [child]: prev[parent][middle][child].filter((_, i) => i !== index)
            }
          }
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index)
      }));
    }
  };
  
  // Generic function to add a nested object to an array
  const addNestedObject = (field, template) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], template]
    }));
  };
  
  // Generic function to update a nested object in an array
  const updateNestedObject = (field, index, subfield, value) => {
    setFormData(prev => {
      const items = [...prev[field]];
      items[index] = { ...items[index], [subfield]: value };
      return { ...prev, [field]: items };
    });
  };
  
  // Generic function to remove a nested object from an array
  const removeNestedObject = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };
  
  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user?.uid) return;
    
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

  // Render form based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'basic':
        return (
          <>
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
              </div>
            </div>
            
            {/* Location */}
            <div className="bg-white p-5 rounded shadow-sm mt-4">
              <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <Globe className="text-blue-600" /> Location
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
            <div className="bg-white p-5 rounded shadow-sm mt-4">
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
          </>
        );
        
      case 'skills':
        return (
          <>
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
                  <input type="text" value={newItem.skill} onChange={(e) => setNewItem({...newItem, skill: e.target.value})} 
                    className="flex-1 p-2 border rounded-l" placeholder="Add a skill" />
                  <button type="button" onClick={() => addItem('skills', newItem.skill)} 
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
                  <input type="text" value={newItem.interest} onChange={(e) => setNewItem({...newItem, interest: e.target.value})}
                    className="flex-1 p-2 border rounded-l" placeholder="Add an interest" />
                  <button type="button" onClick={() => addItem('interests', newItem.interest)}
                    className="bg-green-600 text-white px-3 py-2 rounded-r">
                    <Plus size={18} />
                  </button>
                </div>
              </div>
              
              {/* Goals */}
              <div>
                <label className="block text-sm font-medium mb-2">Career & Learning Goals</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.goals.map((goal, index) => (
                    <div key={index} className="bg-amber-100 text-amber-700 px-2 py-1 rounded-full flex items-center gap-1">
                      {goal}
                      <button type="button" onClick={() => removeItem('goals', index)} className="text-amber-700">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex">
                  <input type="text" value={newItem.goal} onChange={(e) => setNewItem({...newItem, goal: e.target.value})}
                    className="flex-1 p-2 border rounded-l" placeholder="Add a goal" />
                  <button type="button" onClick={() => addItem('goals', newItem.goal)}
                    className="bg-amber-600 text-white px-3 py-2 rounded-r">
                    <Plus size={18} />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Certifications */}
            <div className="bg-white p-5 rounded shadow-sm mt-4">
              <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <Award className="text-blue-600" /> Certifications
              </h2>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.certifications.map((cert, index) => (
                  <div key={index} className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-lg flex items-center gap-1">
                    {cert}
                    <button type="button" onClick={() => removeItem('certifications', index)} className="text-indigo-700">
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex">
                <input type="text" value={newItem.certification} onChange={(e) => setNewItem({...newItem, certification: e.target.value})}
                  className="flex-1 p-2 border rounded-l" placeholder="Add a certification" />
                <button type="button" onClick={() => addItem('certifications', newItem.certification)}
                  className="bg-indigo-600 text-white px-3 py-2 rounded-r">
                  <Plus size={18} />
                </button>
              </div>
            </div>
          </>
        );
        
      case 'projects':
        return (
          <div className="bg-white p-5 rounded shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Briefcase className="text-blue-600" /> Projects
              </h2>
              <button type="button" onClick={() => addNestedObject('projects', { 
                name: '', description: '', tech_stack: [], github_link: '', live_demo: '' 
              })} className="bg-blue-600 text-white px-2 py-1 rounded text-sm flex items-center gap-1">
                <Plus size={16} /> Add Project
              </button>
            </div>
            
            {formData.projects.length === 0 ? (
              <p className="text-gray-500 text-sm italic">No projects added yet</p>
            ) : (
              formData.projects.map((project, index) => (
                <div key={index} className="border rounded p-3 mb-3">
                  <div className="flex justify-between">
                    <h3 className="font-medium">{project.name || `Project ${index + 1}`}</h3>
                    <button type="button" onClick={() => removeNestedObject('projects', index)} className="text-red-600">
                      <X size={18} />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-2 mt-2">
                    <input type="text" placeholder="Project name" value={project.name}
                      onChange={(e) => updateNestedObject('projects', index, 'name', e.target.value)} className="w-full p-2 border rounded" />
                    <textarea placeholder="Description" value={project.description}
                      onChange={(e) => updateNestedObject('projects', index, 'description', e.target.value)} className="w-full p-2 border rounded" rows="2"></textarea>
                    
                    {/* Tech stack */}
                    <div>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {project.tech_stack.map((tech, techIndex) => (
                          <div key={techIndex} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full flex items-center gap-1 text-xs">
                            {tech}
                            <button type="button" onClick={() => {
                              const newStack = project.tech_stack.filter((_, i) => i !== techIndex);
                              updateNestedObject('projects', index, 'tech_stack', newStack);
                            }} className="text-blue-700">
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="flex">
                        <input type="text" placeholder="Add technology" value={newItem.tech || ''} 
                          onChange={(e) => setNewItem({...newItem, tech: e.target.value})} className="flex-1 p-2 border rounded-l text-sm" />
                        <button type="button" onClick={() => {
                          if (newItem.tech?.trim()) {
                            const newStack = [...project.tech_stack, newItem.tech.trim()];
                            updateNestedObject('projects', index, 'tech_stack', newStack);
                            setNewItem({...newItem, tech: ''});
                          }
                        }}
                        className="bg-blue-600 text-white px-2 py-1 rounded-r">
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                    
                    <input type="url" placeholder="GitHub link" value={project.github_link}
                      onChange={(e) => updateNestedObject('projects', index, 'github_link', e.target.value)} className="w-full p-2 border rounded" />
                    <input type="url" placeholder="Live demo URL" value={project.live_demo}
                      onChange={(e) => updateNestedObject('projects', index, 'live_demo', e.target.value)} className="w-full p-2 border rounded" />
                  </div>
                </div>
              ))
            )}
          </div>
        );
        
      case 'experience':
        return (
          <>
            {/* Experience */}
            <div className="bg-white p-5 rounded shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Briefcase className="text-blue-600" /> Experience
                </h2>
                <button type="button" onClick={() => addNestedObject('experience', { 
                  title: '', description: '', date: new Date().toISOString().split('T')[0], type: 'Project' 
                })} className="bg-blue-600 text-white px-2 py-1 rounded text-sm flex items-center gap-1">
                  <Plus size={16} /> Add Experience
                </button>
              </div>
              
              {formData.experience.length === 0 ? (
                <p className="text-gray-500 text-sm italic">No experience added yet</p>
              ) : (
                formData.experience.map((exp, index) => (
                  <div key={index} className="border rounded p-3 mb-3">
                    <div className="flex justify-between">
                      <h3 className="font-medium">{exp.title || `Experience ${index + 1}`}</h3>
                      <button type="button" onClick={() => removeNestedObject('experience', index)} className="text-red-600">
                        <X size={18} />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                      <input type="text" placeholder="Title/Position" value={exp.title}
                        onChange={(e) => updateNestedObject('experience', index, 'title', e.target.value)} className="w-full p-2 border rounded" />
                      <select value={exp.type} onChange={(e) => updateNestedObject('experience', index, 'type', e.target.value)} className="w-full p-2 border rounded">
                        <option value="Hackathon">Hackathon</option>
                        <option value="Internship">Internship</option>
                        <option value="Project">Project</option>
                        <option value="Freelance">Freelance</option>
                      </select>
                      <div className="md:col-span-2">
                        <textarea placeholder="Description" value={exp.description}
                          onChange={(e) => updateNestedObject('experience', index, 'description', e.target.value)} className="w-full p-2 border rounded" rows="2"></textarea>
                      </div>
                      <input type="date" value={exp.date ? exp.date.substring(0,10) : ''}
                        onChange={(e) => updateNestedObject('experience', index, 'date', e.target.value)} className="w-full p-2 border rounded" />
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {/* Hackathon Interests */}
            <div className="bg-white p-5 rounded shadow-sm mt-4">
              <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <Award className="text-blue-600" /> Hackathon Information
              </h2>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Previous Hackathon Experience</label>
                <input type="number" name="hackathon_prev_experiences" value={formData.hackathon_prev_experiences}
                  onChange={handleChange} min="0" className="w-32 p-2 border rounded" />
              </div>
              
              <div>
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
                  <input type="text" value={newItem.hackathonInterest} onChange={(e) => setNewItem({...newItem, hackathonInterest: e.target.value})}
                    className="flex-1 p-2 border rounded-l" placeholder="Add hackathon interest" />
                  <button type="button" onClick={() => addItem('hackathon_current_interests', newItem.hackathonInterest)}
                    className="bg-purple-600 text-white px-3 py-2 rounded-r">
                    <Plus size={18} />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Achievements */}
            <div className="bg-white p-5 rounded shadow-sm mt-4">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Award className="text-blue-600" /> Achievements
                </h2>
                <button type="button" onClick={() => addNestedObject('achievements', { 
                  title: '', description: '', date: new Date().toISOString().split('T')[0]
                })} className="bg-blue-600 text-white px-2 py-1 rounded text-sm flex items-center gap-1">
                  <Plus size={16} /> Add Achievement
                </button>
              </div>
              
              {formData.achievements.length === 0 ? (
                <p className="text-gray-500 text-sm italic">No achievements added yet</p>
              ) : (
                formData.achievements.map((achievement, index) => (
                  <div key={index} className="border rounded p-3 mb-3">
                    <div className="flex justify-between">
                      <h3 className="font-medium">{achievement.title || `Achievement ${index + 1}`}</h3>
                      <button type="button" onClick={() => removeNestedObject('achievements', index)} className="text-red-600">
                        <X size={18} />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                      <input type="text" placeholder="Achievement title" value={achievement.title}
                        onChange={(e) => updateNestedObject('achievements', index, 'title', e.target.value)} className="w-full p-2 border rounded" />
                      <input type="date" value={achievement.date ? achievement.date.substring(0,10) : ''}
                        onChange={(e) => updateNestedObject('achievements', index, 'date', e.target.value)} className="w-full p-2 border rounded" />
                      <div className="md:col-span-2">
                        <textarea placeholder="Description" value={achievement.description}
                          onChange={(e) => updateNestedObject('achievements', index, 'description', e.target.value)} className="w-full p-2 border rounded" rows="2"></textarea>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        );
        
      case 'connections':
        return (
          <>
            {/* Mentorship Interests */}
            <div className="bg-white p-5 rounded shadow-sm">
              <h2 className="text-xl font-semibold mb-              4 flex items-center gap-2">
                <User className="text-blue-600" /> Mentorship Preferences
              </h2>
              
              <div className="mb-4">
                <label className="flex items-center mb-3">
                  <input 
                    type="checkbox" 
                    name="mentorship_interests.seeking_mentor" 
                    checked={formData.mentorship_interests.seeking_mentor} 
                    onChange={handleChange}
                    className="mr-2 h-4 w-4 text-blue-600" 
                  />
                  <span className="text-md">I'm looking for a mentor</span>
                </label>
                
                {formData.mentorship_interests.seeking_mentor && (
                  <div className="pl-6 border-l-2 border-blue-100">
                    <label className="block text-sm font-medium mb-2">Topics I'm seeking mentorship in:</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.mentorship_interests.mentor_topics.map((topic, index) => (
                        <div key={index} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full flex items-center gap-1">
                          {topic}
                          <button type="button" onClick={() => removeItem('mentorship_interests.mentor_topics', index)} className="text-blue-700">
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex">
                      <input type="text" value={newItem.mentorTopic} onChange={(e) => setNewItem({...newItem, mentorTopic: e.target.value})}
                        className="flex-1 p-2 border rounded-l" placeholder="Add mentorship topic" />
                      <button type="button" onClick={() => addItem('mentorship_interests.mentor_topics', newItem.mentorTopic)}
                        className="bg-blue-600 text-white px-3 py-2 rounded-r">
                        <Plus size={18} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Preferred Working Hours</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm mb-1">Start Time</label>
                    <input type="time" name="preferred_working_hours.start_time" value={formData.preferred_working_hours.start_time}
                      onChange={handleChange} className="w-full p-2 border rounded" />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">End Time</label>
                    <input type="time" name="preferred_working_hours.end_time" value={formData.preferred_working_hours.end_time}
                      onChange={handleChange} className="w-full p-2 border rounded" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Social Links */}
            <div className="bg-white p-5 rounded shadow-sm mt-4">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Globe className="text-blue-600" /> Social Links
              </h2>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-sm mb-1">GitHub</label>
                  <input type="url" name="social_links.github" value={formData.social_links.github}
                    onChange={handleChange} className="w-full p-2 border rounded" placeholder="https://github.com/username" />
                </div>
                <div>
                  <label className="block text-sm mb-1">LinkedIn</label>
                  <input type="url" name="social_links.linkedin" value={formData.social_links.linkedin}
                    onChange={handleChange} className="w-full p-2 border rounded" placeholder="https://linkedin.com/in/username" />
                </div>
                <div>
                  <label className="block text-sm mb-1">Portfolio Website</label>
                  <input type="url" name="social_links.portfolio" value={formData.social_links.portfolio}
                    onChange={handleChange} className="w-full p-2 border rounded" placeholder="https://yourportfolio.com" />
                </div>
              </div>
            </div>
          </>
        );
        
      case 'collaborate':
        return (
          <>
            {/* Teammate Search Preferences */}
            <div className="bg-white p-5 rounded shadow-sm">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Users className="text-blue-600" /> Teammate Search Preferences
              </h2>
              
              <div className="mb-4">
                <label className="flex items-center mb-3">
                  <input 
                    type="checkbox" 
                    name="teammate_search.looking_for_teammates" 
                    checked={formData.teammate_search.looking_for_teammates} 
                    onChange={handleChange}
                    className="mr-2 h-4 w-4 text-blue-600" 
                  />
                  <span className="text-md font-medium">I'm looking for teammates</span>
                </label>
                
                {formData.teammate_search.looking_for_teammates && (
                  <div className="pl-6 border-l-2 border-blue-100 space-y-4">
                    {/* Purpose */}
                    <div>
                      <label className="block text-sm font-medium mb-1">I'm looking for teammates for:</label>
                      <div className="grid grid-cols-3 gap-2">
                        {['Project', 'Hackathon', 'Both'].map((option) => (
                          <label key={option} className="flex items-center p-2 border rounded-md cursor-pointer hover:bg-blue-50">
                            <input
                              type="radio"
                              name="teammate_search.purpose"
                              value={option}
                              checked={formData.teammate_search.purpose === option}
                              onChange={handleChange}
                              className="mr-2 text-blue-600"
                            />
                            <span>{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    
                    {/* Desired Skills */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Skills I'm looking for in teammates:</label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {formData.teammate_search.desired_skills.map((skill, index) => (
                          <div key={index} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full flex items-center gap-1">
                            {skill}
                            <button type="button" onClick={() => removeItem('teammate_search.desired_skills', index)} className="text-blue-700">
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="flex">
                        <input type="text" value={newItem.desiredSkill} 
                          onChange={(e) => setNewItem({...newItem, desiredSkill: e.target.value})}
                          className="flex-1 p-2 border rounded-l" placeholder="Add desired skill" />
                        <button type="button" onClick={() => addItem('teammate_search.desired_skills', newItem.desiredSkill)}
                          className="bg-blue-600 text-white px-3 py-2 rounded-r">
                          <Plus size={18} />
                        </button>
                      </div>
                    </div>
                    
                    {/* Project Description */}
                    <div>
                      <label className="block text-sm font-medium mb-1">Brief description of your project/idea:</label>
                      <textarea 
                        name="teammate_search.project_description" 
                        value={formData.teammate_search.project_description} 
                        onChange={handleChange}
                        className="w-full p-2 border rounded" 
                        rows="3" 
                        placeholder="Describe what you're working on or planning to work on"
                      ></textarea>
                    </div>
                    
                    {/* Team Size Preference */}
                    <div>
                      <label className="block text-sm font-medium mb-1">Team size preference:</label>
                      <select 
                        name="teammate_search.team_size_preference"
                        value={formData.teammate_search.team_size_preference}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                      >
                        <option value="">Select a preference</option>
                        <option value="Small (2-3 people)">Small (2-3 people)</option>
                        <option value="Medium (4-6 people)">Medium (4-6 people)</option>
                        <option value="Large (7+ people)">Large (7+ people)</option>
                        <option value="Any size">Any size</option>
                      </select>
                    </div>
                    
                    {/* Urgency Level */}
                    <div>
                      <label className="block text-sm font-medium mb-1">Urgency level:</label>
                      <div className="grid grid-cols-3 gap-2">
                        {['Low', 'Medium', 'High'].map((level) => (
                          <label key={level} className={`flex items-center p-2 border rounded-md cursor-pointer ${
                            formData.teammate_search.urgency_level === level 
                              ? 'bg-blue-100 border-blue-300' 
                              : 'hover:bg-blue-50'
                          }`}>
                            <input
                              type="radio"
                              name="teammate_search.urgency_level"
                              value={level}
                              checked={formData.teammate_search.urgency_level === level}
                              onChange={handleChange}
                              className="mr-2 text-blue-600"
                            />
                            <span>{level}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Current Search Preferences */}
            <div className="bg-white p-5 rounded shadow-sm mt-4">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Target className="text-blue-600" /> Current Search Status
              </h2>
              
              {/* What are you currently looking for */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">I'm currently looking for:</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {['Teammates', 'Mentors', 'Both', 'None'].map((option) => (
                    <label key={option} className={`flex items-center p-2 border rounded-md cursor-pointer ${
                      formData.current_search_preferences.looking_for === option 
                        ? 'bg-blue-100 border-blue-300' 
                        : 'hover:bg-blue-50'
                    }`}>
                      <input
                        type="radio"
                        name="current_search_preferences.looking_for"
                        value={option}
                        checked={formData.current_search_preferences.looking_for === option}
                        onChange={handleChange}
                        className="mr-2 text-blue-600"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Conditional sections based on what they're looking for */}
              {['Teammates', 'Both'].includes(formData.current_search_preferences.looking_for) && (
                <div className="mt-6 space-y-6">
                  {/* Hackathon Section */}
                  <div className="border-t pt-4">
                    <h3 className="font-medium mb-3">Hackathon Teammate Preferences</h3>
                    <div className="space-y-3 pl-3 border-l-2 border-blue-100">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium mb-1">Hackathon Name</label>
                          <input 
                            type="text" 
                            name="current_search_preferences.hackathon_teammate_preferences.hackathon_name" 
                            value={formData.current_search_preferences.hackathon_teammate_preferences.hackathon_name} 
                            onChange={handleChange}
                            className="w-full p-2 border rounded" 
                            placeholder="Name of the hackathon"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Date</label>
                          <input 
                            type="date" 
                            name="current_search_preferences.hackathon_teammate_preferences.hackathon_date" 
                            value={formData.current_search_preferences.hackathon_teammate_preferences.hackathon_date 
                              ? formData.current_search_preferences.hackathon_teammate_preferences.hackathon_date.substring(0,10) 
                              : ''} 
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Required Skills:</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {formData.current_search_preferences.hackathon_teammate_preferences.required_skills.map((skill, index) => (
                            <div key={index} className="bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center gap-1">
                              {skill}
                              <button type="button" onClick={() => {
                                const newSkills = [...formData.current_search_preferences.hackathon_teammate_preferences.required_skills];
                                newSkills.splice(index, 1);
                                setFormData({
                                  ...formData,
                                  current_search_preferences: {
                                    ...formData.current_search_preferences,
                                    hackathon_teammate_preferences: {
                                      ...formData.current_search_preferences.hackathon_teammate_preferences,
                                      required_skills: newSkills
                                    }
                                  }
                                });
                              }} className="text-green-700">
                                <X size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                        <div className="flex">
                          <input type="text" value={newItem.hackathonRequiredSkill} 
                            onChange={(e) => setNewItem({...newItem, hackathonRequiredSkill: e.target.value})}
                            className="flex-1 p-2 border rounded-l" placeholder="Add required skill" />
                          <button type="button" onClick={() => {
                            if (newItem.hackathonRequiredSkill.trim()) {
                              setFormData({
                                ...formData,
                                current_search_preferences: {
                                  ...formData.current_search_preferences,
                                  hackathon_teammate_preferences: {
                                    ...formData.current_search_preferences.hackathon_teammate_preferences,
                                    required_skills: [
                                      ...formData.current_search_preferences.hackathon_teammate_preferences.required_skills,
                                      newItem.hackathonRequiredSkill.trim()
                                    ]
                                  }
                                }
                              });
                              setNewItem({...newItem, hackathonRequiredSkill: ''});
                            }
                          }}
                          className="bg-green-600 text-white px-3 py-2 rounded-r">
                            <Plus size={18} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium mb-1">Team Size</label>
                          <input 
                            type="number" 
                            name="current_search_preferences.hackathon_teammate_preferences.team_size" 
                            value={formData.current_search_preferences.hackathon_teammate_preferences.team_size} 
                            onChange={handleChange}
                            min="1"
                            className="w-full p-2 border rounded" 
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium mb-1">Project/Idea Description</label>
                          <textarea 
                            name="current_search_preferences.hackathon_teammate_preferences.idea_description" 
                            value={formData.current_search_preferences.hackathon_teammate_preferences.idea_description} 
                            onChange={handleChange}
                            className="w-full p-2 border rounded" 
                            rows="2" 
                            placeholder="Briefly describe your hackathon idea"
                          ></textarea>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Project Section */}
                  <div className="border-t pt-4">
                    <h3 className="font-medium mb-3">Project Teammate Preferences</h3>
                    <div className="space-y-3 pl-3 border-l-2 border-blue-100">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium mb-1">Project Type</label>
                          <input 
                            type="text" 
                            name="current_search_preferences.project_teammate_preferences.project_type" 
                            value={formData.current_search_preferences.project_teammate_preferences.project_type} 
                            onChange={handleChange}
                            className="w-full p-2 border rounded" 
                            placeholder="Web app, mobile app, etc."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Expected Duration</label>
                          <input 
                            type="text" 
                            name="current_search_preferences.project_teammate_preferences.project_duration" 
                            value={formData.current_search_preferences.project_teammate_preferences.project_duration} 
                            onChange={handleChange}
                            className="w-full p-2 border rounded" 
                            placeholder="2 weeks, 3 months, etc."
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Required Skills:</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {formData.current_search_preferences.project_teammate_preferences.required_skills.map((skill, index) => (
                            <div key={index} className="bg-amber-100 text-amber-700 px-2 py-1 rounded-full flex items-center gap-1">
                              {skill}
                              <button type="button" onClick={() => {
                                const newSkills = [...formData.current_search_preferences.project_teammate_preferences.required_skills];
                                newSkills.splice(index, 1);
                                setFormData({
                                  ...formData,
                                  current_search_preferences: {
                                    ...formData.current_search_preferences,
                                    project_teammate_preferences: {
                                      ...formData.current_search_preferences.project_teammate_preferences,
                                      required_skills: newSkills
                                    }
                                  }
                                });
                              }} className="text-amber-700">
                                <X size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                        <div className="flex">
                          <input type="text" value={newItem.projectRequiredSkill} 
                            onChange={(e) => setNewItem({...newItem, projectRequiredSkill: e.target.value})}
                            className="flex-1 p-2 border rounded-l" placeholder="Add required skill" />
                          <button type="button" onClick={() => {
                            if (newItem.projectRequiredSkill.trim()) {
                              setFormData({
                                ...formData,
                                current_search_preferences: {
                                  ...formData.current_search_preferences,
                                  project_teammate_preferences: {
                                    ...formData.current_search_preferences.project_teammate_preferences,
                                    required_skills: [
                                      ...formData.current_search_preferences.project_teammate_preferences.required_skills,
                                      newItem.projectRequiredSkill.trim()
                                    ]
                                  }
                                }
                              });
                              setNewItem({...newItem, projectRequiredSkill: ''});
                            }
                          }}
                          className="bg-amber-600 text-white px-3 py-2 rounded-r">
                            <Plus size={18} />
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Commitment Level</label>
                        <div className="grid grid-cols-3 gap-2">
                          {['Low', 'Medium', 'High'].map((level) => (
                            <label key={level} className={`flex items-center p-2 border rounded-md cursor-pointer ${
                              formData.current_search_preferences.project_teammate_preferences.commitment_level === level 
                                ? 'bg-amber-100 border-amber-300' 
                                : 'hover:bg-amber-50'
                            }`}>
                              <input
                                type="radio"
                                name="current_search_preferences.project_teammate_preferences.commitment_level"
                                value={level}
                                checked={formData.current_search_preferences.project_teammate_preferences.commitment_level === level}
                                onChange={handleChange}
                                className="mr-2 text-amber-600"
                              />
                              <span>{level}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        );
        
      default:
        return <div>Select a tab to view profile sections</div>;
    }
  };

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <form onSubmit={handleSubmit}>
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Student Profile</h1>
            <button 
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded flex items-center gap-2"
            >
              {saving ? 'Saving...' : (
                <>
                  <Save size={18} />
                  Save Changes
                </>
              )}
            </button>
          </div>
          
          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-2 mb-6 justify-center">
            <button 
              onClick={() => setActiveTab('basic')} 
              className={`px-4 py-2 rounded-lg ${activeTab === 'basic' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              Basic Info
            </button>
            <button 
              onClick={() => setActiveTab('skills')} 
              className={`px-4 py-2 rounded-lg ${activeTab === 'skills' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              Skills & Interests
            </button>
            <button 
              onClick={() => setActiveTab('projects')} 
              className={`px-4 py-2 rounded-lg ${activeTab === 'projects' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              Projects
            </button>
            <button 
              onClick={() => setActiveTab('experience')} 
              className={`px-4 py-2 rounded-lg ${activeTab === 'experience' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              Experience
            </button>
            <button 
              onClick={() => setActiveTab('connections')} 
              className={`px-4 py-2 rounded-lg ${activeTab === 'connections' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              Connections
            </button>
            <button 
              onClick={() => setActiveTab('collaborate')} 
              className={`px-4 py-2 rounded-lg ${activeTab === 'collaborate' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              Collaboration
            </button>
          </div>
          
          {/* Tab Content */}
          {renderTabContent()}
          
          {/* Bottom Save Button for Mobile */}
          <div className="mt-6 sm:hidden">
            <button 
              type="submit"
              disabled={saving}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded flex items-center justify-center gap-2"
            >
              {saving ? 'Saving...' : (
                <>
                  <Save size={18} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default StudentProfile;