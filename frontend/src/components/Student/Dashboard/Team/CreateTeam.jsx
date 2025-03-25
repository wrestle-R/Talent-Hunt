import React, { useState } from 'react';
import { Users, ChevronLeft, X, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../../../../../context/UserContext';

const CreateTeam = () => {
  const navigate = useNavigate();
  const { userData } = useUser();
  const [teamData, setTeamData] = useState({
    name: '',
    description: '',
    isPublic: true,
    techStack: [],
    maxTeamSize: 5,
    recruitmentMessage: '',
    skillsNeeded: [],
    isRecruiting: true // Add this to state with default true
  });
  const [techInput, setTechInput] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTeamData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Add tech stack item
  const handleAddTech = () => {
    if (techInput.trim() && !teamData.techStack.includes(techInput.trim())) {
      setTeamData(prev => ({
        ...prev,
        techStack: [...prev.techStack, techInput.trim()]
      }));
      setTechInput('');
    }
  };

  // Remove tech stack item
  const handleRemoveTech = (tech) => {
    setTeamData(prev => ({
      ...prev,
      techStack: prev.techStack.filter(t => t !== tech)
    }));
  };

  // Add skill needed
  const handleAddSkill = () => {
    if (skillInput.trim() && !teamData.skillsNeeded.includes(skillInput.trim())) {
      setTeamData(prev => ({
        ...prev,
        skillsNeeded: [...prev.skillsNeeded, skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  // Remove skill needed
  const handleRemoveSkill = (skill) => {
    setTeamData(prev => ({
      ...prev,
      skillsNeeded: prev.skillsNeeded.filter(s => s !== skill)
    }));
  };

  // Submit the form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // More comprehensive validation
    if (!teamData.name.trim() || teamData.name.trim().length < 3) {
      setError('Team name is required and must be at least 3 characters long');
      return;
    }
    
    if (!userData || !userData._id) {
      setError('User information not available. Please login again.');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Explicitly create the request data with all required fields
      const requestData = {
        name: teamData.name.trim(),
        description: teamData.description.trim() || '',
        isPublic: Boolean(teamData.isPublic),
        techStack: teamData.techStack || [],
        maxTeamSize: parseInt(teamData.maxTeamSize) || 5,
        recruitmentMessage: teamData.recruitmentMessage.trim() || '',
        skillsNeeded: teamData.skillsNeeded || [],
        isRecruiting: true, // Always true for new teams
        createdBy: userData._id
      };
      
      // Add token to header if using authentication
      const config = {};
      const token = localStorage.getItem('token');
      if (token) {
        config.headers = {
          'Authorization': `Bearer ${token}`
        };
      }
      
      const response = await axios.post(
        'http://localhost:4000/api/teams/create',
        requestData,
        config
      );
      
      if (response.data && response.data.success) {
        setSuccess('Team created successfully!');
        
        // Reset form state to avoid issues if user navigates back
        setTeamData({
          name: '',
          description: '',
          isPublic: true,
          techStack: [],
          maxTeamSize: 5,
          recruitmentMessage: '',
          skillsNeeded: [],
          isRecruiting: true
        });
        
        setTimeout(() => {
          navigate(`/student/team/${response.data.team._id}`);
        }, 1500);
      } else {
        setError(response.data?.message || 'Failed to create team');
      }
    } catch (err) {
      console.error('Error creating team:', err);
      
      // Better error handling
      if (err.response) {
        // The server responded with a status code outside the 2xx range
        console.error('Error response data:', err.response.data);
        console.error('Error response status:', err.response.status);
        
        if (err.response.status === 400) {
          setError(err.response.data?.message || 'Invalid team data. Please check your inputs.');
        } else if (err.response.status === 401) {
          setError('Authentication error. Please login again.');
        } else if (err.response.status === 500) {
          setError('Server error. Please try again later.');
        } else {
          setError(err.response.data?.message || 'Failed to create team');
        }
      } else if (err.request) {
        // The request was made but no response was received
        setError('No response from server. Please check your internet connection.');
      } else {
        // Something happened in setting up the request
        setError('Error preparing request. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Prevent double form submission with debounce
  const debouncedSubmit = (e) => {
    if (loading) return; // Prevent multiple submissions
    handleSubmit(e);
  };

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="mr-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Users className="text-indigo-600" />
          Create a New Team
        </h2>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-50 text-green-700 p-4 rounded-lg">
          {success}
        </div>
      )}

      <form onSubmit={debouncedSubmit} className="space-y-6">
        {/* Team Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Team Name*
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={teamData.name}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter team name (min 3 characters)"
            required
            minLength="3"
          />
        </div>

        {/* Team Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={teamData.description}
            onChange={handleChange}
            rows={4}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Describe your team and its goals..."
          ></textarea>
        </div>

        {/* Team Settings */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Team Visibility */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Team Visibility
            </label>
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPublic"
                  name="isPublic"
                  checked={teamData.isPublic}
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-700">
                  Public team (visible to all students)
                </label>
              </div>
              <p className="text-xs text-gray-500">
                {teamData.isPublic 
                  ? "Your team will be visible in team search and listings."
                  : "Your team will only be visible to members or by invitation."}
              </p>
            </div>
          </div>

          {/* Max Team Size */}
          <div className="flex-1">
            <label htmlFor="maxTeamSize" className="block text-sm font-medium text-gray-700 mb-1">
              Maximum Team Size
            </label>
            <select
              id="maxTeamSize"
              name="maxTeamSize"
              value={teamData.maxTeamSize}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {[2, 3, 4, 5, 6, 7, 8, 9, 10].map(size => (
                <option key={size} value={size}>{size} members</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tech Stack */}
        <div>
          <label htmlFor="techInput" className="block text-sm font-medium text-gray-700 mb-1">
            Tech Stack
          </label>
          <div className="flex">
            <input
              type="text"
              id="techInput"
              value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
              placeholder="Add technologies/frameworks your team uses"
              className="flex-1 p-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (techInput.trim()) {
                    handleAddTech();
                  }
                }
              }}
            />
            <button
              type="button"
              onClick={handleAddTech}
              className="bg-indigo-600 text-white px-4 py-2 rounded-r-lg hover:bg-indigo-700 flex items-center"
              aria-label="Add technology"
            >
              <Plus size={18} />
            </button>
          </div>
          
          {teamData.techStack.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {teamData.techStack.map((tech) => (
                <span key={tech} className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm flex items-center">
                  {tech}
                  <button 
                    type="button" 
                    onClick={() => handleRemoveTech(tech)}
                    className="ml-1 text-indigo-400 hover:text-indigo-600"
                    aria-label={`Remove ${tech}`}
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Skills Needed - New Section */}
        <div>
          <label htmlFor="skillInput" className="block text-sm font-medium text-gray-700 mb-1">
            Skills Needed
          </label>
          <div className="flex">
            <input
              type="text"
              id="skillInput"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              placeholder="Add skills you're looking for in team members"
              className="flex-1 p-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (skillInput.trim()) {
                    handleAddSkill();
                  }
                }
              }}
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="bg-green-600 text-white px-4 py-2 rounded-r-lg hover:bg-green-700 flex items-center"
              aria-label="Add skill"
            >
              <Plus size={18} />
            </button>
          </div>
          
          {teamData.skillsNeeded.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {teamData.skillsNeeded.map((skill) => (
                <span key={skill} className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm flex items-center">
                  {skill}
                  <button 
                    type="button" 
                    onClick={() => handleRemoveSkill(skill)}
                    className="ml-1 text-green-400 hover:text-green-600"
                    aria-label={`Remove ${skill}`}
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          )}
          <p className="text-xs text-gray-500 mt-1">
            List the skills you're looking for in potential team members.
          </p>
        </div>

        {/* Recruitment Message */}
        <div>
          <label htmlFor="recruitmentMessage" className="block text-sm font-medium text-gray-700 mb-1">
            Recruitment Message (Optional)
          </label>
          <textarea
            id="recruitmentMessage"
            name="recruitmentMessage"
            value={teamData.recruitmentMessage}
            onChange={handleChange}
            rows={3}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Add a message for potential team members..."
          ></textarea>
          <p className="text-xs text-gray-500 mt-1">
            This message will be shown to students viewing your team's profile.
          </p>
        </div>

        {/* Auto-start recruiting option */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isRecruiting"
            name="isRecruiting"
            checked={true} // Default to true for new teams
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            disabled // Disabled since new teams are always recruiting
          />
          <label htmlFor="isRecruiting" className="ml-2 block text-sm text-gray-700">
            Open for recruitment (default for new teams)
          </label>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:bg-indigo-400"
          >
            {loading ? 'Creating...' : 'Create Team'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTeam;