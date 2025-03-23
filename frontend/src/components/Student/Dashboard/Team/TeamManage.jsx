import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Save, 
  ChevronLeft, 
  RefreshCw, 
  Clipboard, 
  Globe, 
  Lock, 
  Plus, 
  X,
  AlertTriangle,
  Check
} from 'lucide-react';
import axios from 'axios';
import { useUser } from '../../../../../context/UserContext';
import { toast } from 'react-hot-toast';

const TeamManage = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const { userData } = useUser();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generatingCode, setGeneratingCode] = useState(false);
  const [team, setTeam] = useState(null);
  const [error, setError] = useState(null);
  
  // Form fields
  const [teamName, setTeamName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [isRecruiting, setIsRecruiting] = useState(false);
  const [maxTeamSize, setMaxTeamSize] = useState(7);
  const [recruitmentMessage, setRecruitmentMessage] = useState('');
  const [techStack, setTechStack] = useState([]);
  const [skillsNeeded, setSkillsNeeded] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [newTechItem, setNewTechItem] = useState('');
  const [joinCode, setJoinCode] = useState('');
  
  // Load team data
  useEffect(() => {
    const fetchTeamDetails = async () => {
      try {
        setLoading(true);
        const studentId = userData?._id;
        
        if (!studentId) {
          setError('User authentication required');
          setLoading(false);
          return;
        }
        
        const response = await axios.get(
          `http://localhost:4000/api/teams/${teamId}?studentId=${studentId}`
        );
        
        if (response.data && response.data.success) {
          const teamData = response.data.team;
          setTeam(teamData);
          
          // Initialize form fields with team data
          setTeamName(teamData.name || '');
          setDescription(teamData.description || '');
          setIsPublic(teamData.isPublic);
          setIsRecruiting(teamData.isRecruiting);
          setMaxTeamSize(teamData.maxTeamSize || 7);
          setRecruitmentMessage(teamData.recruitmentMessage || '');
          setTechStack(teamData.techStack || []);
          setSkillsNeeded(teamData.skillsNeeded || []);
          setJoinCode(teamData.joinCode || '');
          
          // Check if user is team leader
          if (!teamData.userStatus.isLeader) {
            setError('Only team leaders can manage team settings');
            navigate(`/student/team/${teamId}`);
          }
        } else {
          setError('Failed to load team details');
        }
      } catch (err) {
        console.error('Error fetching team details:', err);
        setError(err.response?.data?.message || 'Failed to load team');
      } finally {
        setLoading(false);
      }
    };
    
    if (teamId && userData) {
      fetchTeamDetails();
    }
  }, [teamId, userData, navigate]);

  // Handle tech stack items
  const handleAddTechItem = () => {
    if (newTechItem.trim() && !techStack.includes(newTechItem.trim())) {
      setTechStack([...techStack, newTechItem.trim()]);
      setNewTechItem('');
    }
  };
  
  const handleRemoveTechItem = (item) => {
    setTechStack(techStack.filter(tech => tech !== item));
  };
  
  // Handle skills needed
  const handleAddSkill = () => {
    if (newSkill.trim() && !skillsNeeded.includes(newSkill.trim())) {
      setSkillsNeeded([...skillsNeeded, newSkill.trim()]);
      setNewSkill('');
    }
  };
  
  const handleRemoveSkill = (skill) => {
    setSkillsNeeded(skillsNeeded.filter(s => s !== skill));
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!teamName.trim()) {
      toast.error('Team name is required');
      return;
    }
    
    try {
      setSaving(true);
      
      const response = await axios.put(
        `http://localhost:4000/api/teams/${teamId}`,
        {
          name: teamName,
          description,
          isPublic,
          techStack,
          maxTeamSize,
          recruitmentMessage,
          skillsNeeded,
          isRecruiting,
          updaterId: userData?._id
        }
      );
      
      if (response.data && response.data.success) {
        toast.success('Team updated successfully');
        
        // Update local state with updated data
        setTeam({
          ...team,
          ...response.data.team
        });
      } else {
        toast.error(response.data?.message || 'Failed to update team');
      }
    } catch (err) {
      console.error('Error updating team:', err);
      toast.error(err.response?.data?.message || 'Failed to update team');
    } finally {
      setSaving(false);
    }
  };
  
  // Handle join code regeneration
  const handleRegenerateJoinCode = async () => {
    try {
      setGeneratingCode(true);
      
      const response = await axios.post(
        `http://localhost:4000/api/teams/${teamId}/regenerate-code`,
        {
          requesterId: userData?._id
        }
      );
      
      if (response.data && response.data.success) {
        setJoinCode(response.data.joinCode);
        toast.success('Join code regenerated successfully');
      } else {
        toast.error(response.data?.message || 'Failed to regenerate join code');
      }
    } catch (err) {
      console.error('Error regenerating join code:', err);
      toast.error(err.response?.data?.message || 'Failed to regenerate join code');
    } finally {
      setGeneratingCode(false);
    }
  };
  
  // Handle member removal
  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Are you sure you want to remove this member from the team?')) {
      return;
    }
    
    try {
      const response = await axios.delete(
        `http://localhost:4000/api/teams/${teamId}/members/${memberId}`,
        {
          data: { removerId: userData?._id }
        }
      );
      
      if (response.data && response.data.success) {
        toast.success('Member removed successfully');
        
        // Update member list in UI
        setTeam({
          ...team,
          members: team.members.filter(member => member._id !== memberId)
        });
      } else {
        toast.error(response.data?.message || 'Failed to remove member');
      }
    } catch (err) {
      console.error('Error removing member:', err);
      toast.error(err.response?.data?.message || 'Failed to remove member');
    }
  };
  
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-40 bg-gray-200 rounded mb-6"></div>
          <div className="h-60 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate(`/student/team/${teamId}`)}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors mr-4"
          >
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-2xl font-bold text-gray-800">Manage Team</h2>
        </div>
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">
          <p>{error}</p>
          <button 
            onClick={() => navigate(`/student/team/${teamId}`)} 
            className="mt-3 bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200"
          >
            Back to Team
          </button>
        </div>
      </div>
    );
  }
  
  if (!team) {
    return null;
  }
  
  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header with back button */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(`/student/team/${teamId}`)}
          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors mr-4"
        >
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-2xl font-bold text-gray-800">Manage Team Settings</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Team Information */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="font-semibold text-lg text-gray-800 mb-4">Basic Information</h3>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="teamName" className="block text-sm font-medium text-gray-700 mb-1">
                Team Name*
              </label>
              <input
                id="teamName"
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
                required
                placeholder="Enter team name"
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full p-2 border border-gray-300 rounded-lg"
                placeholder="Describe your team, mission, and what you're working on"
              ></textarea>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Team Visibility
              </label>
              <div className="flex space-x-4">
                <div 
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    isPublic ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => setIsPublic(true)}
                >
                  <Globe className={`mr-2 ${isPublic ? 'text-indigo-600' : 'text-gray-400'}`} size={20} />
                  <div>
                    <p className={`font-medium ${isPublic ? 'text-indigo-700' : 'text-gray-700'}`}>Public</p>
                    <p className="text-xs text-gray-500">Visible to all students on Talent Hunt</p>
                  </div>
                </div>
                
                <div 
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    !isPublic ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => setIsPublic(false)}
                >
                  <Lock className={`mr-2 ${!isPublic ? 'text-indigo-600' : 'text-gray-400'}`} size={20} />
                  <div>
                    <p className={`font-medium ${!isPublic ? 'text-indigo-700' : 'text-gray-700'}`}>Private</p>
                    <p className="text-xs text-gray-500">Only accessible by team members and by invitation</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <label htmlFor="maxTeamSize" className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Team Size (1-15)
              </label>
              <input
                id="maxTeamSize"
                type="number"
                min={team.members.length}
                max={15}
                value={maxTeamSize}
                onChange={(e) => setMaxTeamSize(parseInt(e.target.value) || 7)}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
              <p className="text-xs text-gray-500 mt-1">
                Current member count: {team.members.length} (cannot set lower than current count)
              </p>
            </div>
          </div>
        </div>
        
        {/* Tech Stack */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="font-semibold text-lg text-gray-800 mb-4">Tech Stack</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Technologies your team uses
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {techStack.map((tech, index) => (
                <div 
                  key={index} 
                  className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm flex items-center"
                >
                  {tech}
                  <button 
                    type="button"
                    onClick={() => handleRemoveTechItem(tech)} 
                    className="ml-2 text-indigo-500 hover:text-indigo-700"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              {techStack.length === 0 && (
                <p className="text-sm text-gray-500 italic">No technologies added yet</p>
              )}
            </div>
            
            <div className="flex">
              <input
                type="text"
                value={newTechItem}
                onChange={(e) => setNewTechItem(e.target.value)}
                className="flex-1 p-2 border border-gray-300 rounded-l-lg"
                placeholder="Add a technology (e.g., React, Node.js, Python)"
              />
              <button
                type="button"
                onClick={handleAddTechItem}
                className="bg-indigo-600 text-white px-4 py-2 rounded-r-lg hover:bg-indigo-700"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>
        </div>
        
        {/* Recruitment Settings */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="font-semibold text-lg text-gray-800 mb-4">Recruitment Settings</h3>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                id="isRecruiting"
                type="checkbox"
                checked={isRecruiting}
                onChange={(e) => setIsRecruiting(e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="isRecruiting" className="ml-2 block text-sm text-gray-700">
                Open for new members
              </label>
            </div>
            
            {isRecruiting && (
              <>
                <div>
                  <label htmlFor="recruitmentMessage" className="block text-sm font-medium text-gray-700 mb-1">
                    Recruitment Message
                  </label>
                  <textarea
                    id="recruitmentMessage"
                    value={recruitmentMessage}
                    onChange={(e) => setRecruitmentMessage(e.target.value)}
                    rows={3}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    placeholder="Describe what kind of members you're looking for"
                  ></textarea>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Skills Needed
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {skillsNeeded.map((skill, index) => (
                      <div 
                        key={index} 
                        className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm flex items-center"
                      >
                        {skill}
                        <button 
                          type="button"
                          onClick={() => handleRemoveSkill(skill)} 
                          className="ml-2 text-green-500 hover:text-green-700"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                    {skillsNeeded.length === 0 && (
                      <p className="text-sm text-gray-500 italic">No specific skills listed</p>
                    )}
                  </div>
                  
                  <div className="flex">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      className="flex-1 p-2 border border-gray-300 rounded-l-lg"
                      placeholder="Add a skill (e.g., UI/UX Design, Backend Development)"
                    />
                    <button
                      type="button"
                      onClick={handleAddSkill}
                      className="bg-green-600 text-white px-4 py-2 rounded-r-lg hover:bg-green-700"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* Join Code Management */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="font-semibold text-lg text-gray-800 mb-4">Team Join Code</h3>
          
          <div className="bg-indigo-50 p-4 rounded-lg mb-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-indigo-700 mb-1">Current Join Code:</p>
                <p className="text-indigo-700 font-mono text-lg">{joinCode}</p>
                <p className="text-xs text-indigo-600 mt-1">
                  Share this code with people you want to join your team directly
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(joinCode);
                    toast.success('Join code copied to clipboard');
                  }}
                  className="bg-indigo-100 text-indigo-700 px-3 py-2 rounded-md hover:bg-indigo-200 flex items-center gap-1"
                >
                  <Clipboard size={16} />
                  Copy
                </button>
                <button
                  type="button"
                  onClick={handleRegenerateJoinCode}
                  disabled={generatingCode}
                  className="bg-indigo-600 text-white px-3 py-2 rounded-md hover:bg-indigo-700 flex items-center gap-1"
                >
                  <RefreshCw size={16} className={generatingCode ? 'animate-spin' : ''} />
                  Generate New Code
                </button>
              </div>
            </div>
          </div>
          
          <div className="rounded-lg bg-yellow-50 border border-yellow-100 p-3 text-sm text-yellow-800 flex items-start">
            <AlertTriangle className="text-yellow-500 mr-2 flex-shrink-0 mt-0.5" size={16} />
            <p>
              Regenerating the join code will invalidate the previous code. 
              Anyone with the old code will no longer be able to join.
            </p>
          </div>
        </div>
        
        {/* Team Members Management */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="font-semibold text-lg text-gray-800 mb-4">Team Members</h3>
          
          <div className="space-y-3">
            {team.members.map(member => (
              <div key={member._id} className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-200 mr-3">
                    {member.profile_picture ? (
                      <img 
                        src={member.profile_picture}
                        alt={member.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-indigo-100 text-indigo-600">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">
                      {member.name}
                      {member._id === team.leader._id && (
                        <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                          Leader
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-gray-500">{member.role || 'Member'}</p>
                  </div>
                </div>
                
                {/* Can't remove yourself as leader */}
                {member._id !== team.leader._id && (
                  <button
                    type="button"
                    onClick={() => handleRemoveMember(member._id)}
                    className="text-red-600 hover:text-red-800 p-1"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
          >
            {saving ? (
              <>
                <RefreshCw className="animate-spin" size={20} />
                Saving...
              </>
            ) : (
              <>
                <Save size={20} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TeamManage;