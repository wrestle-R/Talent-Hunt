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
    isRecruiting: true
  });
  const [techInput, setTechInput] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTeamData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddTech = () => {
    if (techInput.trim() && !teamData.techStack.includes(techInput.trim())) {
      setTeamData(prev => ({
        ...prev,
        techStack: [...prev.techStack, techInput.trim()]
      }));
      setTechInput('');
    }
  };

  const handleRemoveTech = (tech) => {
    setTeamData(prev => ({
      ...prev,
      techStack: prev.techStack.filter(t => t !== tech)
    }));
  };

  const handleAddSkill = () => {
    if (skillInput.trim() && !teamData.skillsNeeded.includes(skillInput.trim())) {
      setTeamData(prev => ({
        ...prev,
        skillsNeeded: [...prev.skillsNeeded, skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skill) => {
    setTeamData(prev => ({
      ...prev,
      skillsNeeded: prev.skillsNeeded.filter(s => s !== skill)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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

      const requestData = {
        name: teamData.name.trim(),
        description: teamData.description.trim() || '',
        isPublic: Boolean(teamData.isPublic),
        techStack: teamData.techStack || [],
        maxTeamSize: parseInt(teamData.maxTeamSize) || 5,
        recruitmentMessage: teamData.recruitmentMessage.trim() || '',
        skillsNeeded: teamData.skillsNeeded || [],
        isRecruiting: true,
        createdBy: userData._id
      };

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

      if (err.response) {
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
        setError('No response from server. Please check your internet connection.');
      } else {
        setError('Error preparing request. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const debouncedSubmit = (e) => {
    if (loading) return;
    handleSubmit(e);
  };

  return (
    <div className="max-w-6xl mx-auto bg-[#1A1A1A] rounded-xl shadow-lg p-6 border border-gray-800 hover:border-[#E8C848]/30 transition-all duration-300">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="mr-4 p-2 rounded-full bg-[#121212] text-[#E8C848] hover:bg-[#E8C848]/10 transition-all duration-300"
        >
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Users className="text-[#E8C848]" />
          Create a New Team
        </h2>
      </div>

      {error && (
        <div className="mb-6 bg-red-900/20 border border-red-800 text-red-400 p-4 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 bg-[#E8C848]/10 border border-[#E8C848]/30 text-[#E8C848] p-4 rounded-lg">
          {success}
        </div>
      )}

      <form onSubmit={debouncedSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
            Team Name*
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={teamData.name}
            onChange={handleChange}
            className="w-full p-2 bg-[#121212] border border-gray-800 text-white rounded-lg focus:ring-2 focus:ring-[#E8C848] focus:border-[#E8C848] placeholder-gray-500 transition-all duration-300"
            placeholder="Enter team name (min 3 characters)"
            required
            minLength="3"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={teamData.description}
            onChange={handleChange}
            rows={4}
            className="w-full p-2 bg-[#121212] border border-gray-800 text-white rounded-lg focus:ring-2 focus:ring-[#E8C848] focus:border-[#E8C848] placeholder-gray-500 transition-all duration-300"
            placeholder="Describe your team and its goals..."
          ></textarea>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-300 mb-1">
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
                  className="h-4 w-4 text-[#E8C848] focus:ring-[#E8C848] border-gray-800 rounded bg-[#121212]"
                />
                <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-300">
                  Public team (visible to all students)
                </label>
              </div>
              <p className="text-xs text-gray-400">
                {teamData.isPublic 
                  ? "Your team will be visible in team search and listings."
                  : "Your team will only be visible to members or by invitation."}
              </p>
            </div>
          </div>

          <div className="flex-1">
            <label htmlFor="maxTeamSize" className="block text-sm font-medium text-gray-300 mb-1">
              Maximum Team Size
            </label>
            <p className="w-full p-2 bg-[#121212] border border-gray-800 rounded-lg text-gray-300">
              4 members
            </p>
            <input type="hidden" id="maxTeamSize" name="maxTeamSize" value={4} />
          </div>
        </div>

        <div>
          <label htmlFor="techInput" className="block text-sm font-medium text-gray-300 mb-1">
            Tech Stack
          </label>
          <div className="flex">
            <input
              type="text"
              id="techInput"
              value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
              placeholder="Add technologies/frameworks your team uses"
              className="flex-1 p-2 bg-[#121212] border border-gray-800 text-white rounded-l-lg focus:ring-2 focus:ring-[#E8C848] focus:border-[#E8C848] placeholder-gray-500 transition-all duration-300"
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
              className="bg-[#E8C848] text-[#121212] px-4 py-2 rounded-r-lg hover:bg-[#E8C848]/80 flex items-center transition-all duration-300 shadow-lg shadow-[#E8C848]/30"
              aria-label="Add technology"
            >
              <Plus size={18} />
            </button>
          </div>
          
          {teamData.techStack.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {teamData.techStack.map((tech) => (
                <span key={tech} className="bg-[#E8C848]/10 text-[#E8C848] px-3 py-1 rounded-full text-sm flex items-center">
                  {tech}
                  <button 
                    type="button" 
                    onClick={() => handleRemoveTech(tech)}
                    className="ml-1 text-[#E8C848]/70 hover:text-[#E8C848]"
                    aria-label={`Remove ${tech}`}
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          <label htmlFor="skillInput" className="block text-sm font-medium text-gray-300 mb-1">
            Skills Needed
          </label>
          <div className="flex">
            <input
              type="text"
              id="skillInput"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              placeholder="Add skills you're looking for in team members"
              className="flex-1 p-2 bg-[#121212] border border-gray-800 text-white rounded-l-lg focus:ring-2 focus:ring-[#E8C848] focus:border-[#E8C848] placeholder-gray-500 transition-all duration-300"
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
              className="bg-[#E8C848] text-[#121212] px-4 py-2 rounded-r-lg hover:bg-[#E8C848]/80 flex items-center transition-all duration-300 shadow-lg shadow-[#E8C848]/30"
              aria-label="Add skill"
            >
              <Plus size={18} />
            </button>
          </div>
          
          {teamData.skillsNeeded.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {teamData.skillsNeeded.map((skill) => (
                <span key={skill} className="bg-[#E8C848]/10 text-[#E8C848] px-3 py-1 rounded-full text-sm flex items-center">
                  {skill}
                  <button 
                    type="button" 
                    onClick={() => handleRemoveSkill(skill)}
                    className="ml-1 text-[#E8C848]/70 hover:text-[#E8C848]"
                    aria-label={`Remove ${skill}`}
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          )}
          <p className="text-xs text-gray-400 mt-1">
            List the skills you're looking for in potential team members.
          </p>
        </div>

        <div>
          <label htmlFor="recruitmentMessage" className="block text-sm font-medium text-gray-300 mb-1">
            Recruitment Message (Optional)
          </label>
          <textarea
            id="recruitmentMessage"
            name="recruitmentMessage"
            value={teamData.recruitmentMessage}
            onChange={handleChange}
            rows={3}
            className="w-full p-2 bg-[#121212] border border-gray-800 text-white rounded-lg focus:ring-2 focus:ring-[#E8C848] focus:border-[#E8C848] placeholder-gray-500 transition-all duration-300"
            placeholder="Add a message for potential team members..."
          ></textarea>
          <p className="text-xs text-gray-400 mt-1">
            This message will be shown to students viewing your team's profile.
          </p>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isRecruiting"
            name="isRecruiting"
            checked={true}
            className="h-4 w-4 text-[#E8C848] focus:ring-[#E8C848] border-gray-800 rounded bg-[#121212]"
            disabled
          />
          <label htmlFor="isRecruiting" className="ml-2 block text-sm text-gray-300">
            Open for recruitment (default for new teams)
          </label>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-[#E8C848] text-[#121212] px-6 py-2 rounded-lg font-medium hover:bg-[#E8C848]/80 transition-all duration-300 disabled:bg-[#E8C848]/50 disabled:cursor-not-allowed shadow-lg shadow-[#E8C848]/30"
          >
            {loading ? 'Creating...' : 'Create Team'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTeam;