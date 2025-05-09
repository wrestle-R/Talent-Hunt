import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  Users, User, Plus, X, Check, ArrowLeft, 
  AlertCircle, UserPlus, Trash2, Award, RefreshCw
} from 'lucide-react';

const API_BASE_URL = "http://localhost:4000"; // or your deployed backend URL


const ManageHackathonTeams = ({ hackathonId, onBack }) => {
  const [loading, setLoading] = useState(true);
  const [individuals, setIndividuals] = useState([]);
  const [teams, setTeams] = useState([]);
  const [temporaryTeams, setTemporaryTeams] = useState([]);
  const [selectedApplicants, setSelectedApplicants] = useState([]);
  const [selectedLeader, setSelectedLeader] = useState(null);
  const [newTeamName, setNewTeamName] = useState('');
  const [activeTab, setActiveTab] = useState('individuals');
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchData();
  }, [hackathonId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      
      // Fetch individual applicants
      const individualsResponse = await axios.get(
        `${import.meta.env.VITE_APP_BASE_URL}/api/admin/hackathons/${hackathonId}/individual-applicants`,
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      // Fetch teams data
      const teamsResponse = await axios.get(
        `${import.meta.env.VITE_APP_BASE_URL}/api/admin/hackathons/${hackathonId}/teams`,
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      setIndividuals(individualsResponse.data.applicants || []);
      setTeams(teamsResponse.data.teams.registered || []);
      setTemporaryTeams(teamsResponse.data.teams.temporary || []);
      
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleApplicantSelection = (applicant) => {
    if (selectedApplicants.some(a => a._id === applicant._id)) {
      setSelectedApplicants(selectedApplicants.filter(a => a._id !== applicant._id));
      if (selectedLeader && selectedLeader._id === applicant._id) {
        setSelectedLeader(null);
      }
    } else {
      if (selectedApplicants.length < 4) {
        setSelectedApplicants([...selectedApplicants, applicant]);
      } else {
        setError('Maximum 4 members can be selected for a team');
      }
    }
  };

  const setLeader = (applicant) => {
    if (!selectedApplicants.some(a => a._id === applicant._id)) {
      toggleApplicantSelection(applicant);
    }
    setSelectedLeader(applicant);
  };

  const createTemporaryTeam = async () => {
    if (selectedApplicants.length !== 4) {
      setError('Exactly 4 members are required for a team');
      return;
    }

    if (!selectedLeader) {
      setError('Please select a team leader');
      return;
    }

    if (!newTeamName.trim()) {
      setError('Please provide a team name');
      return;
    }

    try {
      setIsCreatingTeam(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        `${import.meta.env.VITE_APP_BASE_URL}/api/admin/hackathons/${hackathonId}/temp-teams`,
        {
          teamName: newTeamName,
          memberIds: selectedApplicants.map(a => a.student._id),
          leaderId: selectedLeader.student._id
        },
        { headers: { Authorization: `Bearer ${token}` }}
      );

      if (response.data.success) {
        // Refresh data
        fetchData();
        
        // Reset selections
        setSelectedApplicants([]);
        setSelectedLeader(null);
        setNewTeamName('');
        setIsCreatingTeam(false);
        
        setSuccess('Team created successfully!');
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      console.error('Error creating team:', err);
      setError(err.response?.data?.message || 'Failed to create team');
    } finally {
      setIsCreatingTeam(false);
    }
  };

  const handleApproveApplicant = async (applicantId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${import.meta.env.VITE_APP_BASE_URL}/api/admin/hackathons/${hackathonId}/applicants/${applicantId}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      // Update local state
      setIndividuals(individuals.map(ind => 
        ind._id === applicantId ? { ...ind, status: 'Approved' } : ind
      ));
      
      setSuccess('Applicant approved successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error approving applicant:', err);
      setError('Failed to approve applicant');
    }
  };

  const handleRejectApplicant = async (applicantId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${import.meta.env.VITE_APP_BASE_URL}/api/admin/hackathons/${hackathonId}/applicants/${applicantId}/reject`,
        {},
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      // Update local state
      setIndividuals(individuals.map(ind => 
        ind._id === applicantId ? { ...ind, status: 'Rejected' } : ind
      ));
      
      setSuccess('Applicant rejected');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error rejecting applicant:', err);
      setError('Failed to reject applicant');
    }
  };

  const handleApproveTeam = async (teamId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${import.meta.env.VITE_APP_BASE_URL}/api/admin/hackathons/${hackathonId}/teams/${teamId}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      // Update local state
      setTeams(teams.map(team => 
        team._id === teamId ? { ...team, status: 'Approved' } : team
      ));
      
      setSuccess('Team approved successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error approving team:', err);
      setError('Failed to approve team');
    }
  };

  const convertTemporaryTeam = async (tempTeamId) => {
    try {
      const tempTeam = temporaryTeams.find(t => t.tempTeamId === tempTeamId);
      if (!tempTeam) return;
      
      const token = localStorage.getItem('token');
      await axios.post(
        `${import.meta.env.VITE_APP_BASE_URL}/api/admin/hackathons/${hackathonId}/temp-teams/${tempTeamId}/convert`,
        {
          teamName: tempTeam.teamName,
          leaderId: tempTeam.leader._id
        },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      // Refresh data after conversion
      fetchData();
      
      setSuccess('Team converted successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error converting team:', err);
      setError('Failed to convert temporary team');
    }
  };

  const dissolveTemporaryTeam = async (tempTeamId) => {
    if (!window.confirm('Are you sure you want to dissolve this team?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${import.meta.env.VITE_APP_BASE_URL}/api/admin/hackathons/${hackathonId}/temp-teams/${tempTeamId}`,
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      // Refresh data after dissolution
      fetchData();
      
      setSuccess('Team dissolved successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error dissolving team:', err);
      setError('Failed to dissolve team');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <RefreshCw className="w-6 h-6 animate-spin text-[#E8C848]" />
        <span className="ml-2 text-gray-400">Loading...</span>
      </div>
    );
  }

  return (
    <div className="bg-[#1A1A1A] rounded-lg shadow-lg border border-gray-800 p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <button 
            onClick={onBack} 
            className="mr-4 p-2 rounded-full hover:bg-[#E8C848]/20 text-gray-400 hover:text-[#E8C848] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold text-white font-montserrat">Manage Hackathon Participants</h2>
        </div>
        
        <div className="flex space-x-4">
          <button 
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'individuals' 
                ? 'bg-[#E8C848] text-[#111111]' 
                : 'bg-[#111111] text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('individuals')}
          >
            <User className="w-4 h-4 inline mr-1" />
            Individuals
          </button>
          <button 
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'teams' 
                ? 'bg-[#E8C848] text-[#111111]' 
                : 'bg-[#111111] text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('teams')}
          >
            <Users className="w-4 h-4 inline mr-1" />
            Teams
          </button>
          <button 
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'tempTeams' 
                ? 'bg-[#E8C848] text-[#111111]' 
                : 'bg-[#111111] text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('tempTeams')}
          >
            <UserPlus className="w-4 h-4 inline mr-1" />
            Temp Teams
          </button>
        </div>
      </div>

      {/* Error and Success Messages */}
      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-900/20 border border-red-800 text-red-200 p-4 mb-6 flex justify-between items-center"
        >
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
          <button onClick={() => setError(null)}>
            <X className="w-5 h-5" />
          </button>
        </motion.div>
      )}

      {success && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#E8C848]/20 border border-[#E8C848] text-[#E8C848] p-4 mb-6 flex justify-between items-center"
        >
          <div className="flex items-center">
            <Check className="w-5 h-5 mr-2" />
            {success}
          </div>
          <button onClick={() => setSuccess(null)}>
            <X className="w-5 h-5" />
          </button>
        </motion.div>
      )}

      {/* Team Creation Form */}
      {activeTab === 'individuals' && !isCreatingTeam && (
        <div className="mb-4">
          <button
            onClick={() => setIsCreatingTeam(true)}
            className="bg-[#E8C848] text-[#111111] px-4 py-2 rounded-lg flex items-center hover:bg-[#E8C848]/90 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" /> Create Temporary Team
          </button>
        </div>
      )}

      {activeTab === 'individuals' && isCreatingTeam && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="border border-[#E8C848] bg-[#1A1A1A] p-4 rounded-lg mb-6"
        >
          <h3 className="text-lg font-medium mb-3 text-white">Create Temporary Team</h3>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 text-gray-400">Team Name</label>
            <input
              type="text"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              className="border border-gray-800 rounded-lg px-3 py-2 w-full bg-[#111111] text-white"
              placeholder="Enter team name"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-gray-400">
              Selected Members: {selectedApplicants.length}/4
            </label>
            <div className="flex flex-wrap gap-2">
              {selectedApplicants.map(applicant => (
                <div 
                  key={applicant._id}
                  className={`flex items-center px-3 py-1 rounded-full text-sm ${
                    selectedLeader && selectedLeader._id === applicant._id 
                    ? 'bg-yellow-200 border border-yellow-400' 
                    : 'bg-[#E8C848]/20 border border-[#E8C848] text-[#E8C848]'
                  }`}
                >
                  {applicant.student.name}
                  {selectedLeader && selectedLeader._id === applicant._id && (
                    <span className="ml-1 text-yellow-700">(Leader)</span>
                  )}
                  <button
                    onClick={() => toggleApplicantSelection(applicant)}
                    className="ml-1 text-gray-500 hover:text-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-4">
            <button
              onClick={() => {
                setIsCreatingTeam(false);
                setSelectedApplicants([]);
                setSelectedLeader(null);
                setNewTeamName('');
              }}
              className="px-4 py-2 border border-gray-800 rounded-lg text-gray-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={createTemporaryTeam}
              disabled={selectedApplicants.length !== 4 || !selectedLeader || !newTeamName.trim()}
              className={`px-4 py-2 rounded-lg ${
                selectedApplicants.length === 4 && selectedLeader && newTeamName.trim()
                ? 'bg-[#E8C848] text-[#111111]' 
                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
              }`}
            >
              Create Team
            </button>
          </div>
        </motion.div>
      )}

      {/* Tab Content */}
      {activeTab === 'individuals' && (
        <div>
          <h3 className="text-lg font-medium mb-3 text-white">Individual Applicants</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-800">
              <thead className="bg-[#111111]">
                <tr>
                  {isCreatingTeam && <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Select</th>}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Skills</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-[#1A1A1A] divide-y divide-gray-800">
                {individuals.map(applicant => (
                  <tr key={applicant._id}>
                    {isCreatingTeam && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <input 
                            type="checkbox"
                            checked={selectedApplicants.some(a => a._id === applicant._id)}
                            onChange={() => toggleApplicantSelection(applicant)}
                            disabled={!applicant.student || applicant.assignedToTempTeam || applicant.status !== 'Approved'}
                            className="h-4 w-4 rounded border-gray-800 text-[#E8C848] focus:ring-[#E8C848] bg-[#111111]"
                          />
                          {selectedApplicants.some(a => a._id === applicant._id) && (
                            <button
                              onClick={() => setLeader(applicant)}
                              className={`px-2 py-1 text-xs rounded ${
                                selectedLeader && selectedLeader._id === applicant._id
                                ? 'bg-yellow-200 text-yellow-800' 
                                : 'bg-gray-800 text-gray-400 hover:bg-yellow-100'
                              }`}
                            >
                              {selectedLeader && selectedLeader._id === applicant._id ? 'Leader' : 'Set as Leader'}
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img 
                          src={applicant.student?.profile_picture || '/default-avatar.png'} 
                          alt={applicant.student?.name || 'Student'}
                          className="h-10 w-10 rounded-full object-cover mr-3"
                          onError={(e) => { e.target.src = '/default-avatar.png' }}
                        />
                        <div>
                          <div className="font-medium text-white">{applicant.student?.name || 'Russel Daniel'}</div>
                          <div className="text-sm text-gray-400">{applicant.student?.email || 'russeldaniel@gmail.com'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {applicant.skills?.slice(0, 3).map((skill, i) => (
                          <span key={i} className="inline-block px-2 py-1 text-xs bg-[#E8C848]/20 text-[#E8C848] rounded-full">
                            {skill}
                          </span>
                        ))}
                        {applicant.skills?.length > 3 && (
                          <span className="inline-block px-2 py-1 text-xs bg-gray-800 text-gray-400 rounded-full">
                            +{applicant.skills.length - 3} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${applicant.status === 'Approved' ? 'bg-green-900/20 text-green-200' : 
                          applicant.status === 'Rejected' ? 'bg-red-900/20 text-red-200' : 
                          'bg-yellow-900/20 text-yellow-200'}`}>
                        {applicant.status}
                      </span>
                      {applicant.assignedToTempTeam && (
                        <span className="ml-2 px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-900/20 text-purple-200">
                          In Team
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {applicant.status === 'Pending' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleApproveApplicant(applicant._id)}
                            className="px-3 py-1 text-xs bg-green-900/20 text-green-200 rounded hover:bg-green-800 flex items-center"
                          >
                            <Check className="w-3 h-3 mr-1" /> Approve
                          </button>
                          <button
                            onClick={() => handleRejectApplicant(applicant._id)}
                            className="px-3 py-1 text-xs bg-red-900/20 text-red-200 rounded hover:bg-red-800 flex items-center"
                          >
                            <X className="w-3 h-3 mr-1" /> Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'teams' && (
        <div>
          <h3 className="text-lg font-medium mb-3 text-white">Team Applications</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-800">
              <thead className="bg-[#111111]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Team</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Members</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-[#1A1A1A] divide-y divide-gray-800">
                {teams.map(team => (
                  <tr key={team._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-white">{team.team?.name || 'Team'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex -space-x-2">
                        {team.team?.members?.slice(0, 4).map((member, idx) => (
                          <img 
                            key={idx}
                            src={member.student?.profile_picture || '/default-avatar.png'} 
                            alt={member.student?.name || `Member ${idx+1}`}
                            className="h-8 w-8 rounded-full border-2 border-[#1A1A1A] object-cover"
                            onError={(e) => { e.target.src = '/default-avatar.png' }}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${team.status === 'Approved' ? 'bg-green-900/20 text-green-200' : 
                          team.status === 'Rejected' ? 'bg-red-900/20 text-red-200' : 
                          'bg-yellow-900/20 text-yellow-200'}`}>
                        {team.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {team.status === 'Pending' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleApproveTeam(team._id)}
                            className="px-3 py-1 text-xs bg-green-900/20 text-green-200 rounded hover:bg-green-800 flex items-center"
                          >
                            <Check className="w-3 h-3 mr-1" /> Approve
                          </button>
                          <button
                            onClick={() => handleRejectTeam(team._id)}
                            className="px-3 py-1 text-xs bg-red-900/20 text-red-200 rounded hover:bg-red-800 flex items-center"
                          >
                            <X className="w-3 h-3 mr-1" /> Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'tempTeams' && (
        <div>
          <h3 className="text-lg font-medium mb-3 text-white">Temporary Teams</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-800">
              <thead className="bg-[#111111]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Team Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Leader</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Members</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-[#1A1A1A] divide-y divide-gray-800">
                {temporaryTeams.map(team => (
                  <tr key={team.tempTeamId}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-white">{team.teamName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img 
                          src={team.leader?.profile_picture || '/default-avatar.png'} 
                          alt={team.leader?.name || 'Leader'}
                          className="h-8 w-8 rounded-full object-cover mr-2"
                          onError={(e) => { e.target.src = '/default-avatar.png' }}
                        />
                        <span className="text-white">{team.leader?.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex -space-x-2">
                        {team.members?.slice(0, 4).map((member, idx) => (
                          <img 
                            key={idx}
                            src={member.profile_picture || '/default-avatar.png'} 
                            alt={member.name || `Member ${idx+1}`}
                            className="h-8 w-8 rounded-full border-2 border-[#1A1A1A] object-cover"
                            onError={(e) => { e.target.src = '/default-avatar.png' }}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => convertTemporaryTeam(team.tempTeamId)}
                          className="px-3 py-1 text-xs bg-green-900/20 text-green-200 rounded hover:bg-green-800 flex items-center"
                        >
                          <Award className="w-3 h-3 mr-1" /> Convert to Official
                        </button>
                        <button
                          onClick={() => dissolveTemporaryTeam(team.tempTeamId)}
                          className="px-3 py-1 text-xs bg-red-900/20 text-red-200 rounded hover:bg-red-800 flex items-center"
                        >
                          <Trash2 className="w-3 h-3 mr-1" /> Dissolve
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageHackathonTeams;