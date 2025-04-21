import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Briefcase, Clock, Globe, Save, X, Plus, Phone, MessageSquare, Upload } from 'lucide-react';
import StudentPlaceholder from '../../public/student_placeholder.png';
import MentorPlaceholder from '../../public/mentor_placeholder.png';

const MentorProfile = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    profile_picture: '',
    current_role: { title: '', company: '' },
    years_of_experience: '',
    expertise: { technical_skills: [], non_technical_skills: [] },
    industries_worked_in: [],
    mentorship_focus_areas: [],
    mentorship_availability: {
      hours_per_week: 2,
      mentorship_type: []
    },
    hackathon_mentorship_experiences: [],
    social_links: {
      linkedin: '',
      github: '',
      personal_website: ''
    }
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [newSoftSkill, setNewSoftSkill] = useState('');
  const [newIndustry, setNewIndustry] = useState('');
  const [newFocus, setNewFocus] = useState('');
  const [imagePreview, setImagePreview] = useState(null);

  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user || !user.uid) {
    console.error("User not found in localStorage");
  }

  // Fetch mentor profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!user || !user.uid) {
          setLoading(false);
          return;
        }
        
        const response = await axios.get(
          `${import.meta.env.VITE_APP_BASE_URL}/api/mentor/profile/${user.uid}`,
        );
        
        if (response.data) {
          setFormData({
            ...formData,
            ...response.data,
            // Handle potentially missing nested objects
            current_role: response.data.current_role || formData.current_role,
            expertise: response.data.expertise || formData.expertise,
            mentorship_availability: response.data.mentorship_availability || formData.mentorship_availability,
            social_links: response.data.social_links || formData.social_links
          });

          // Set image preview if profile picture exists
          if (response.data.profile_picture) {
            setImagePreview(response.data.profile_picture);
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, []);
  
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
  
  // Add items to arrays
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
  
  // Remove items from arrays
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
  
  // Toggle mentorship type
  const toggleType = (type) => {
    const currentTypes = formData.mentorship_availability.mentorship_type;
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type];
    
    setFormData(prev => ({
      ...prev,
      mentorship_availability: {
        ...prev.mentorship_availability,
        mentorship_type: newTypes
      }
    }));
  };
  
  // Add hackathon experience
  const addHackathon = () => {
    setFormData(prev => ({
      ...prev,
      hackathon_mentorship_experiences: [
        ...prev.hackathon_mentorship_experiences,
        { event_name: '', team_name: '', year: new Date().getFullYear(), role: 'Mentor', achievements: '' }
      ]
    }));
  };
  
  // Update hackathon experience
  const updateHackathon = (index, field, value) => {
    setFormData(prev => {
      const experiences = [...prev.hackathon_mentorship_experiences];
      experiences[index] = { ...experiences[index], [field]: value };
      return {
        ...prev,
        hackathon_mentorship_experiences: experiences
      };
    });
  };
  
  // Remove hackathon experience
  const removeHackathon = (index) => {
    setFormData(prev => ({
      ...prev,
      hackathon_mentorship_experiences: prev.hackathon_mentorship_experiences.filter((_, i) => i !== index)
    }));
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      
      if (!user || !user.uid) {
        alert("User not found. Please log in again.");
        return;
      }
    
      await axios.put(
        `${import.meta.env.VITE_APP_BASE_URL}/api/mentor/profile/${user.uid}`,
        formData,
      );
      
      alert("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center p-8 bg-[#121212] text-gray-300">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-[#E8C848]"></div>
          Loading profile...
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-[#121212]">
      <div className="max-w-4xl mx-auto p-4 py-8">
        {/* Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">Profile Settings</h1>
          <p className="text-gray-400">Manage your mentor profile and preferences</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-[#1A1A1A] p-6 rounded-lg shadow-sm border border-white/10">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-[#E8C848]">
              <User className="text-[#E8C848]" /> Basic Information
            </h2>
            
            {/* Profile Picture URL Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 text-gray-300">Profile Picture URL</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <div className="md:col-span-1 flex justify-center">
                  <img 
                    src={imagePreview || MentorPlaceholder} 
                    alt="Profile preview" 
                    className="w-32 h-32 rounded-full object-cover border-4 border-[#E8C848]/30"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = MentorPlaceholder;
                    }}
                  />
                </div>
                <div className="md:col-span-2">
                  <div className="flex">
                    <div className="flex-none flex items-center bg-[#121212] px-3 border border-r-0 border-white/10 rounded-l-md">
                      <Globe size={16} className="text-gray-400" />
                    </div>
                    <input
                      type="url"
                      name="profile_picture"
                      value={formData.profile_picture}
                      onChange={(e) => {
                        handleChange(e);
                        setImagePreview(e.target.value);
                      }}
                      className="flex-1 px-3 py-2 border border-white/10 bg-[#121212] text-gray-300 rounded-r-md focus:ring-1 focus:ring-[#E8C848]/50 focus:border-[#E8C848]/50"
                      placeholder="https://example.com/your-profile-image.jpg"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Enter a URL to your profile picture (JPG, PNG, or WebP format)</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-white/10 bg-[#121212] text-gray-300 rounded-md focus:ring-1 focus:ring-[#E8C848]/50 focus:border-[#E8C848]/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-white/10 bg-[#121212] text-gray-400 rounded-md focus:ring-1 focus:ring-[#E8C848]/50 focus:border-[#E8C848]/50"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">Phone Number</label>
                <div className="flex">
                  <div className="flex-none flex items-center bg-[#121212] px-3 border border-r-0 border-white/10 rounded-l-md">
                    <Phone size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="flex-1 px-3 py-2 border border-white/10 bg-[#121212] text-gray-300 rounded-r-md focus:ring-1 focus:ring-[#E8C848]/50 focus:border-[#E8C848]/50"
                    placeholder="Your contact number"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">Years of Experience</label>
                <input
                  type="number"
                  name="years_of_experience"
                  value={formData.years_of_experience}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-white/10 bg-[#121212] text-gray-300 rounded-md focus:ring-1 focus:ring-[#E8C848]/50 focus:border-[#E8C848]/50"
                  min="0"
                  max="50"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1 text-gray-300">Professional Bio</label>
                <div className="flex">
                  <div className="flex-none flex items-start bg-[#121212] px-3 py-2 border border-r-0 border-white/10 rounded-l-md">
                    <MessageSquare size={16} className="text-gray-400 mt-1" />
                  </div>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    className="flex-1 px-3 py-2 border border-white/10 bg-[#121212] text-gray-300 rounded-r-md h-24 focus:ring-1 focus:ring-[#E8C848]/50 focus:border-[#E8C848]/50"
                    placeholder="Write a short professional bio to introduce yourself to students (approximately 30 words)"
                  ></textarea>
                </div>
                <p className="text-xs text-gray-500 mt-1">Include your background, expertise, and what you're passionate about.</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">Job Title</label>
                <input
                  type="text"
                  name="current_role.title"
                  value={formData.current_role.title}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-white/10 bg-[#121212] text-gray-300 rounded-md focus:ring-1 focus:ring-[#E8C848]/50 focus:border-[#E8C848]/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">Company</label>
                <input
                  type="text"
                  name="current_role.company"
                  value={formData.current_role.company}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-white/10 bg-[#121212] text-gray-300 rounded-md focus:ring-1 focus:ring-[#E8C848]/50 focus:border-[#E8C848]/50"
                />
              </div>
            </div>
          </div>
          
          {/* Skills Section */}
          <div className="bg-[#1A1A1A] p-6 rounded-lg shadow-sm border border-white/10">
            <h2 className="text-xl font-bold mb-4 text-[#E8C848]">Skills & Expertise</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-gray-300">Technical Skills</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.expertise.technical_skills.map((skill, index) => (
                  <div key={index} className="bg-[#E8C848]/10 text-[#E8C848] px-2 py-1 rounded-full flex items-center gap-1 border border-[#E8C848]/20">
                    {skill}
                    <button 
                      type="button" 
                      onClick={() => removeItem('expertise.technical_skills', index)}
                      className="text-[#E8C848] hover:text-[#E8C848]/70"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  className="flex-1 px-3 py-2 border border-white/10 bg-[#121212] text-gray-300 rounded-l-md focus:ring-1 focus:ring-[#E8C848]/50 focus:border-[#E8C848]/50"
                  placeholder="Add a skill"
                />
                <button
                  type="button"
                  onClick={() => addItem('expertise.technical_skills', newSkill, setNewSkill)}
                  className="bg-[#E8C848] text-[#121212] px-3 py-2 rounded-r-md hover:bg-[#E8C848]/90 transition-colors"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-gray-300">Soft Skills</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.expertise.non_technical_skills.map((skill, index) => (
                  <div key={index} className="bg-[#E8C848]/10 text-[#E8C848] px-2 py-1 rounded-full flex items-center gap-1 border border-[#E8C848]/20">
                    {skill}
                    <button 
                      type="button" 
                      onClick={() => removeItem('expertise.non_technical_skills', index)}
                      className="text-[#E8C848] hover:text-[#E8C848]/70"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex">
                <input
                  type="text"
                  value={newSoftSkill}
                  onChange={(e) => setNewSoftSkill(e.target.value)}
                  className="flex-1 px-3 py-2 border border-white/10 bg-[#121212] text-gray-300 rounded-l-md focus:ring-1 focus:ring-[#E8C848]/50 focus:border-[#E8C848]/50"
                  placeholder="Add a soft skill"
                />
                <button
                  type="button"
                  onClick={() => addItem('expertise.non_technical_skills', newSoftSkill, setNewSoftSkill)}
                  className="bg-[#E8C848] text-[#121212] px-3 py-2 rounded-r-md hover:bg-[#E8C848]/90 transition-colors"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-gray-300">Industries Worked In</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.industries_worked_in.map((industry, index) => (
                  <div key={index} className="bg-[#E8C848]/10 text-[#E8C848] px-2 py-1 rounded-full flex items-center gap-1 border border-[#E8C848]/20">
                    {industry}
                    <button 
                      type="button" 
                      onClick={() => removeItem('industries_worked_in', index)}
                      className="text-[#E8C848] hover:text-[#E8C848]/70"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex">
                <input
                  type="text"
                  value={newIndustry}
                  onChange={(e) => setNewIndustry(e.target.value)}
                  className="flex-1 px-3 py-2 border border-white/10 bg-[#121212] text-gray-300 rounded-l-md focus:ring-1 focus:ring-[#E8C848]/50 focus:border-[#E8C848]/50"
                  placeholder="Add an industry"
                />
                <button
                  type="button"
                  onClick={() => addItem('industries_worked_in', newIndustry, setNewIndustry)}
                  className="bg-[#E8C848] text-[#121212] px-3 py-2 rounded-r-md hover:bg-[#E8C848]/90 transition-colors"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>
          </div>
          
          {/* Mentorship Section */}
          <div className="bg-[#1A1A1A] p-6 rounded-lg shadow-sm border border-white/10">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-[#E8C848]">
              <Briefcase className="text-[#E8C848]" /> Mentorship Details
            </h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-gray-300">Focus Areas</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.mentorship_focus_areas.map((area, index) => (
                  <div key={index} className="bg-[#E8C848]/10 text-[#E8C848] px-2 py-1 rounded-full flex items-center gap-1 border border-[#E8C848]/20">
                    {area}
                    <button 
                      type="button" 
                      onClick={() => removeItem('mentorship_focus_areas', index)}
                      className="text-[#E8C848] hover:text-[#E8C848]/70"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex">
                <input
                  type="text"
                  value={newFocus}
                  onChange={(e) => setNewFocus(e.target.value)}
                  className="flex-1 px-3 py-2 border border-white/10 bg-[#121212] text-gray-300 rounded-l-md focus:ring-1 focus:ring-[#E8C848]/50 focus:border-[#E8C848]/50"
                  placeholder="Add a focus area"
                />
                <button
                  type="button"
                  onClick={() => addItem('mentorship_focus_areas', newFocus, setNewFocus)}
                  className="bg-[#E8C848] text-[#121212] px-3 py-2 rounded-r-md hover:bg-[#E8C848]/90 transition-colors"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Hours Available per Week
              </label>
              <input
                type="number"
                name="mentorship_availability.hours_per_week"
                value={formData.mentorship_availability.hours_per_week}
                onChange={handleChange}
                min="1"
                max="40"
                className="w-32 px-3 py-2 border border-white/10 bg-[#121212] text-gray-300 rounded-md focus:ring-1 focus:ring-[#E8C848]/50 focus:border-[#E8C848]/50"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Preferred Mentorship Format
              </label>
              <div className="flex flex-wrap gap-2">
                {['One-on-One', 'Group', 'Online', 'In-Person'].map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => toggleType(type)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      formData.mentorship_availability.mentorship_type.includes(type)
                        ? 'bg-[#E8C848] text-[#121212]'
                        : 'bg-[#121212] text-gray-300 border border-white/10 hover:border-[#E8C848]/50'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Hackathon Experiences */}
          <div className="bg-[#1A1A1A] p-6 rounded-lg shadow-sm border border-white/10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[#E8C848]">Hackathon Experiences</h2>
              <button 
                type="button"
                onClick={addHackathon}
                className="bg-[#E8C848] text-[#121212] px-2 py-1 rounded-md text-sm flex items-center gap-1 hover:bg-[#E8C848]/90 transition-colors"
              >
                <Plus size={16} /> Add
              </button>
            </div>
            
            {formData.hackathon_mentorship_experiences.length === 0 ? (
              <p className="text-gray-500 text-sm italic">No hackathon experiences added yet</p>
            ) : (
              formData.hackathon_mentorship_experiences.map((exp, index) => (
                <div key={index} className="border border-white/10 rounded-md p-3 mb-3 bg-[#121212]">
                  <div className="flex justify-between">
                    <h3 className="font-medium text-gray-300">Hackathon #{index + 1}</h3>
                    <button 
                      type="button" 
                      onClick={() => removeHackathon(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X size={18} />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Event Name</label>
                      <input
                        type="text"
                        value={exp.event_name}
                        onChange={(e) => updateHackathon(index, 'event_name', e.target.value)}
                        className="w-full px-3 py-1 border border-white/10 bg-[#1A1A1A] text-gray-300 rounded-md focus:ring-1 focus:ring-[#E8C848]/50 focus:border-[#E8C848]/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Team Name</label>
                      <input
                        type="text"
                        value={exp.team_name}
                        onChange={(e) => updateHackathon(index, 'team_name', e.target.value)}
                        className="w-full px-3 py-1 border border-white/10 bg-[#1A1A1A] text-gray-300 rounded-md focus:ring-1 focus:ring-[#E8C848]/50 focus:border-[#E8C848]/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Year</label>
                      <input
                        type="number"
                        value={exp.year}
                        onChange={(e) => updateHackathon(index, 'year', e.target.value)}
                        className="w-full px-3 py-1 border border-white/10 bg-[#1A1A1A] text-gray-300 rounded-md focus:ring-1 focus:ring-[#E8C848]/50 focus:border-[#E8C848]/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Role</label>
                      <select
                        value={exp.role}
                        onChange={(e) => updateHackathon(index, 'role', e.target.value)}
                        className="w-full px-3 py-1 border border-white/10 bg-[#1A1A1A] text-gray-300 rounded-md focus:ring-1 focus:ring-[#E8C848]/50 focus:border-[#E8C848]/50"
                      >
                        <option value="Mentor">Mentor</option>
                        <option value="Judge">Judge</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs text-gray-400 mb-1">Achievements</label>
                      <input
                        type="text"
                        value={exp.achievements}
                        onChange={(e) => updateHackathon(index, 'achievements', e.target.value)}
                        className="w-full px-3 py-1 border border-white/10 bg-[#1A1A1A] text-gray-300 rounded-md focus:ring-1 focus:ring-[#E8C848]/50 focus:border-[#E8C848]/50"
                        placeholder="e.g., Guided team to finals"
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {/* Social Links */}
          <div className="bg-[#1A1A1A] p-6 rounded-lg shadow-sm border border-white/10">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-[#E8C848]">
              <Globe className="text-[#E8C848]" /> Social Links
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">LinkedIn</label>
                <input
                  type="url"
                  name="social_links.linkedin"
                  value={formData.social_links.linkedin}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-white/10 bg-[#121212] text-gray-300 rounded-md focus:ring-1 focus:ring-[#E8C848]/50 focus:border-[#E8C848]/50"
                  placeholder="https://linkedin.com/in/yourusername"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">GitHub</label>
                <input
                  type="url"
                  name="social_links.github"
                  value={formData.social_links.github}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-white/10 bg-[#121212] text-gray-300 rounded-md focus:ring-1 focus:ring-[#E8C848]/50 focus:border-[#E8C848]/50"
                  placeholder="https://github.com/yourusername"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">Personal Website</label>
                <input
                  type="url"
                  name="social_links.personal_website"
                  value={formData.social_links.personal_website}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-white/10 bg-[#121212] text-gray-300 rounded-md focus:ring-1 focus:ring-[#E8C848]/50 focus:border-[#E8C848]/50"
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </div>
          </div>
          
          {/* Update the submit button container to have a dark background */}
          <div className="sticky bottom-0 left-0 right-0 py-4 bg-[#121212]/80 backdrop-blur-lg border-t border-gray-800">
            <div className="max-w-4xl mx-auto px-4 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-[#E8C848] text-[#121212] px-6 py-2 rounded-md hover:bg-[#E8C848]/90 transition-colors flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-[#121212]"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Save Profile
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MentorProfile;