import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, UserPlus, X, CheckCircle, XCircle, Search } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = "http://localhost:4000"; // or your deployed backend URL


const ManageHackathonParticipants = () => {
  const { hackathonId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('individuals');
  const [hackathon, setHackathon] = useState(null);
  const [participants, setParticipants] = useState({
    individualApplicants: [],
    teamApplicants: [],
    temporaryTeams: []
  });
  const [showTeamFormation, setShowTeamFormation] = useState(false);
  const [selectedIndividuals, setSelectedIndividuals] = useState([]);
  const [teamName, setTeamName] = useState('');
  const [teamLeader, setTeamLeader] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchHackathonDetails();
    fetchParticipants();
  }, [hackathonId]);

  const fetchHackathonDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_APP_BASE_URL}/api/admin/hackathons/${hackathonId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setHackathon(response.data.hackathon);
    } catch (err) {
      setError('Failed to load hackathon details');
      console.error('Error fetching hackathon details:', err);
    }
  };

  const fetchParticipants = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_APP_BASE_URL}/api/admin/hackathons/${hackathonId}/participants`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setParticipants(response.data.participants);
    } catch (err) {
      setError('Failed to load participants');
      console.error('Error fetching participants:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemporaryTeam = async () => {
    if (selectedIndividuals.length !== 4) {
      setError('Please select exactly 4 individuals');
      return;
    }

    if (!teamLeader) {
      setError('Please select a team leader');
      return;
    }

    if (!teamName.trim()) {
      setError('Please enter a team name');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      // Create payload with both ID and email for better identification
      const memberData = selectedIndividuals.map(ind => ({
        id: ind.student._id,
        email: ind.student.email
      }));
      
      await axios.post(
        `${import.meta.env.VITE_APP_BASE_URL}/api/admin/hackathons/${hackathonId}/temp-teams`,
        {
          teamName,
          members: memberData,
          leader: {
            id: teamLeader.student._id,
            email: teamLeader.student.email
          }
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess('Team created successfully');
      setShowTeamFormation(false);
      setSelectedIndividuals([]);
      setTeamLeader(null);
      setTeamName('');
      fetchParticipants();
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to create team: ' + (err.response?.data?.message || err.message));
      console.error('Error creating temporary team:', err);
      
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleDissolveTemporaryTeam = async (tempTeamId) => {
    if (!window.confirm('Are you sure you want to dissolve this temporary team?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${import.meta.env.VITE_APP_BASE_URL}/api/admin/hackathons/${hackathonId}/temp-teams/${tempTeamId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess('Team dissolved successfully');
      fetchParticipants();
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to dissolve team');
      console.error('Error dissolving temporary team:', err);
      
      setTimeout(() => setError(null), 5000);
    }
  };

  const toggleIndividualSelection = (individual) => {
    if (selectedIndividuals.some(i => i.student._id === individual.student._id)) {
      // Remove from selection
      setSelectedIndividuals(selectedIndividuals.filter(i => i.student._id !== individual.student._id));
      // If removing the leader, reset leader
      if (teamLeader && teamLeader.student._id === individual.student._id) {
        setTeamLeader(null);
      }
    } else {
      // Add to selection if not already 4
      if (selectedIndividuals.length < 4) {
        setSelectedIndividuals([...selectedIndividuals, individual]);
      } else {
        setError('You can only select 4 individuals');
        setTimeout(() => setError(null), 3000);
      }
    }
  };

  const setAsLeader = (individual) => {
    setTeamLeader(individual);
  };

  const filteredIndividuals = participants.individualApplicants
    .filter(ind => !ind.assignedToTempTeam)
    .filter(ind => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      return (
        ind.student.name.toLowerCase().includes(searchLower) ||
        ind.student.email.toLowerCase().includes(searchLower) ||
        (ind.skills && ind.skills.some(skill => skill.toLowerCase().includes(searchLower)))
      );
    });

  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E8C848]"></div>
        </div>
      );
    }

    switch (activeTab) {
      case 'individuals':
        return (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-medium text-white">Individual Participants</h2>
              <button
                onClick={() => setShowTeamFormation(true)}
                className="bg-[#E8C848] hover:bg-[#d4b03e] text-white px-4 py-2 rounded-lg flex items-center gap-2"
                disabled={filteredIndividuals.length < 4}
              >
                <UserPlus size={18} />
                Form Teams
              </button>
            </div>
            
            <div className="mb-4 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search participants..."
                className="w-full md:w-64 pl-10 pr-3 py-2 border border-gray-700 bg-[#1A1A1A] text-white rounded-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {filteredIndividuals.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No individual participants available</div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredIndividuals.map((individual) => (
                  <div
                    key={individual._id || `student-${individual.student._id}`}
                    className="border border-gray-700 rounded-lg p-4 hover:border-[#E8C848] cursor-pointer"
                  >
                    <div className="flex items-center">
                      <img
                        src={individual.student.profile_picture || 'https://via.placeholder.com/40'}
                        alt={individual.student.name}
                        className="h-10 w-10 rounded-full mr-3"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/40' }}
                      />
                      <div>
                        <div className="font-medium text-white">{individual.student.name}</div>
                        <div className="text-sm text-gray-500">{individual.student.email}</div>
                      </div>
                    </div>
                    
                    <div className="mt-3 flex flex-wrap gap-1">
                      {individual.skills && individual.skills.slice(0, 3).map((skill, idx) => (
                        <span key={`skill-${idx}-${individual.student._id}`} className="px-2 py-1 bg-[#E8C848] text-black text-xs rounded-full">
                          {skill}
                        </span>
                      ))}
                      {individual.skills && individual.skills.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                          +{individual.skills.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        );
        
      case 'teams':
        return (
          <>
            <h2 className="text-xl font-medium text-white mb-4">Team Participants</h2>
            {participants.teamApplicants.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No team participants registered</div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {participants.teamApplicants.map((team, teamIndex) => (
                  <div
                    key={team._id || `team-${teamIndex}`}
                    className="border border-gray-700 rounded-lg p-4"
                  >
                    <div className="font-medium text-lg text-white">{team.team?.name}</div>
                    <div className="text-sm text-gray-500 mb-3">
                      Applied: {new Date(team.registeredAt).toLocaleDateString()}
                    </div>
                    
                    <div className="flex -space-x-2 overflow-hidden mb-3">
                      {team.team?.members?.slice(0, 4).map((member, idx) => (
                        <img
                          key={`member-${idx}-${teamIndex}`}
                          src={member.student?.profile_picture || 'https://via.placeholder.com/32'}
                          alt={member.student?.name}
                          className="inline-block h-8 w-8 rounded-full ring-2 ring-white"
                          onError={(e) => { e.target.src = 'https://via.placeholder.com/32' }}
                        />
                      ))}
                    </div>
                    
                    <div className="text-sm text-gray-400">
                      {team.team?.members?.length} members
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        );
        
      case 'temporary':
        return (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-medium text-white">Temporary Teams</h2>
              <button
                onClick={() => setShowTeamFormation(true)}
                className="bg-[#E8C848] hover:bg-[#d4b03e] text-white px-4 py-2 rounded-lg flex items-center gap-2"
                disabled={filteredIndividuals.length < 4}
              >
                <UserPlus size={18} />
                Form New Team
              </button>
            </div>
            
            {participants.temporaryTeams.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No temporary teams created yet</div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {participants.temporaryTeams.map((team, tempTeamIndex) => (
                  <div
                    key={team._id || `temp-team-${tempTeamIndex}`}
                    className="border border-gray-700 rounded-lg p-4"
                  >
                    <div className="flex justify-between">
                      <div className="font-medium text-lg text-white">{team.teamName}</div>
                      <button
                        onClick={() => handleDissolveTemporaryTeam(team._id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <XCircle size={18} />
                      </button>
                    </div>
                    
                    <div className="text-sm text-gray-500 mb-3">
                      Created: {new Date(team.formedAt).toLocaleDateString()}
                    </div>
                    
                    <div className="mb-3">
                      <span className="text-sm font-medium text-gray-400">Team Leader:</span>
                      <div className="flex items-center mt-1">
                        <img
                          src={team.leader?.profile_picture || 'https://via.placeholder.com/32'}
                          alt={team.leader?.name}
                          className="h-8 w-8 rounded-full mr-2"
                          onError={(e) => { e.target.src = 'https://via.placeholder.com/32' }}
                        />
                        <div>
                          <div className="font-medium text-white">{team.leader?.name}</div>
                          <div className="text-xs text-gray-500">{team.leader?.email}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-400">Members:</span>
                      <div className="mt-2 space-y-2">
                        {team.members?.map((member, idx) => (
                          <div
                            key={`temp-member-${idx}-${tempTeamIndex}`}
                            className="flex items-center mt-1"
                          >
                            <img
                              src={member.profile_picture || 'https://via.placeholder.com/32'}
                              alt={member.name}
                              className="h-6 w-6 rounded-full mr-2"
                              onError={(e) => { e.target.src = 'https://via.placeholder.com/32' }}
                            />
                            <div>
                              <div className="text-sm text-white">{member.name}</div>
                              <div className="text-xs text-gray-500">{member.email}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        );
        
      default:
        return <div className="text-white">Select a tab to view participants</div>;
    }
  };

  return (
    <div className="container mx-auto p-6 bg-[#111111] min-h-screen">
      <button 
        className="mb-6 flex items-center gap-2 text-gray-400 hover:text-[#E8C848] transition-colors"
        onClick={() => navigate('/admin/hackathons')}
      >
        <ArrowLeft size={16} />
        Back to Hackathons
      </button>
      
      <div className="bg-[#1A1A1A] rounded-xl shadow-lg border border-gray-800 p-6 mb-6">
        <h1 className="text-2xl font-bold mb-2 text-white font-montserrat">
          {hackathon?.hackathonName || 'Hackathon Participants'}
        </h1>
        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8 text-gray-400">
          <div className="flex items-center gap-2">
            <Users size={18} />
            <span>
              {hackathon?.registration?.currentlyRegistered || 0}/{hackathon?.registration?.totalCapacity || 0} participants
            </span>
          </div>
          <div>
            <span>Team Size: {hackathon?.registration?.requiredTeamSize || 4}</span>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-900/20 border border-red-800 text-red-200 p-4 rounded-lg mb-6 flex justify-between items-center">
          <p>{error}</p>
          <button onClick={() => setError(null)}><X size={18} /></button>
        </div>
      )}

      {success && (
        <div className="bg-[#E8C848]/20 border border-[#E8C848] text-[#E8C848] p-4 rounded-lg mb-6 flex justify-between items-center">
          <p>{success}</p>
          <button onClick={() => setSuccess(null)}><X size={18} /></button>
        </div>
      )}
      
      <div className="mb-6 flex border-b border-gray-800">
        <button
          className={`py-2 px-4 flex items-center gap-1 ${
            activeTab === 'individuals' 
              ? 'border-b-2 border-[#E8C848] text-[#E8C848]' 
              : 'text-gray-400 hover:text-white'
          }`}
          onClick={() => setActiveTab('individuals')}
        >
          <Users size={16} />
          Individual Participants ({filteredIndividuals.length})
        </button>
        <button
          className={`py-2 px-4 flex items-center gap-1 ${
            activeTab === 'temporary' 
              ? 'border-b-2 border-[#E8C848] text-[#E8C848]' 
              : 'text-gray-400 hover:text-white'
          }`}
          onClick={() => setActiveTab('temporary')}
        >
          <UserPlus size={16} />
          Temporary Teams ({participants.temporaryTeams.length})
        </button>
        <button
          className={`py-2 px-4 flex items-center gap-1 ${
            activeTab === 'teams' 
              ? 'border-b-2 border-[#E8C848] text-[#E8C848]' 
              : 'text-gray-400 hover:text-white'
          }`}
          onClick={() => setActiveTab('teams')}
        >
          <Users size={16} />
          Team Participants ({participants.teamApplicants.length})
        </button>
      </div>
      
      <div className="bg-[#1A1A1A] rounded-xl shadow-lg border border-gray-800 p-6">
        {renderTabContent()}
      </div>
      
      {/* Team Formation UI */}
      {showTeamFormation && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-[#1A1A1A] rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-800"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white font-montserrat">Form Temporary Team</h2>
              <button
                onClick={() => {
                  setShowTeamFormation(false);
                  setSelectedIndividuals([]);
                  setTeamLeader(null);
                  setTeamName('');
                }}
                className="text-gray-400 hover:text-[#E8C848]"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-400 mb-2">Team Name</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-700 bg-[#1A1A1A] text-white rounded-lg"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Enter team name"
              />
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-white mb-2">Available Individuals ({filteredIndividuals.length})</h3>
                <div className="border border-gray-700 rounded-lg max-h-80 overflow-y-auto p-2">
                  {filteredIndividuals.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">No individuals available</div>
                  ) : (
                    filteredIndividuals.map((individual, individualIndex) => (
                      <div
                        key={`modal-individual-${individualIndex}`}
                        onClick={() => toggleIndividualSelection(individual)}
                        className={`p-3 rounded-lg mb-2 border border-gray-700 cursor-pointer ${
                          selectedIndividuals.some(i => i.student._id === individual.student._id)
                            ? 'bg-[#E8C848]/20 border-[#E8C848]'
                            : 'hover:bg-gray-800'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <img
                              src={individual.student.profile_picture || 'https://via.placeholder.com/40'}
                              alt={individual.student.name}
                              className="h-10 w-10 rounded-full mr-3"
                              onError={(e) => { e.target.src = 'https://via.placeholder.com/40' }}
                            />
                            <div>
                              <div className="font-medium text-white">{individual.student.name}</div>
                              <div className="text-sm text-gray-500">{individual.student.email}</div>
                            </div>
                          </div>
                          {selectedIndividuals.some(i => i.student._id === individual.student._id) && (
                            <CheckCircle className="text-[#E8C848]" size={20} />
                          )}
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {individual.skills && individual.skills.slice(0, 3).map((skill, idx) => (
                            <span key={`modal-skill-${idx}-${individualIndex}`} className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-medium text-white mb-2">Selected Team Members ({selectedIndividuals.length}/4)</h3>
                <div className="border border-gray-700 rounded-lg h-80 p-4">
                  {selectedIndividuals.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      Select team members from the list
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {selectedIndividuals.map((individual, selectedIdx) => (
                        <motion.div
                          key={`selected-${selectedIdx}`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`p-3 rounded-lg border border-gray-700 ${
                            teamLeader && teamLeader.student._id === individual.student._id
                              ? 'bg-[#E8C848]/20 border-[#E8C848]'
                              : 'hover:bg-gray-800'
                          }`}
                          onClick={() => setAsLeader(individual)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <img
                                src={individual.student.profile_picture || 'https://via.placeholder.com/40'}
                                alt={individual.student.name}
                                className="h-10 w-10 rounded-full mr-3"
                                onError={(e) => { e.target.src = 'https://via.placeholder.com/40' }}
                              />
                              <div>
                                <div className="font-medium text-white">{individual.student.name}</div>
                                <div className="text-sm text-gray-500">{individual.student.email}</div>
                                <div className="text-sm mt-1">
                                  {teamLeader && teamLeader.student._id === individual.student._id ? (
                                    <span className="text-[#E8C848]">Team Leader</span>
                                  ) : (
                                    "Click to set as leader"
                                  )}
                                </div>
                              </div>
                            </div>
                            {teamLeader && teamLeader.student._id === individual.student._id && (
                              <CheckCircle className="text-[#E8C848]" size={20} />
                            )}
                          </div>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {individual.skills && individual.skills.slice(0, 3).map((skill, idx) => (
                              <span key={`selected-skill-${idx}-${selectedIdx}`} className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end gap-4">
              <button
                onClick={() => {
                  setShowTeamFormation(false);
                  setSelectedIndividuals([]);
                  setTeamLeader(null);
                  setTeamName('');
                }}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTemporaryTeam}
                disabled={selectedIndividuals.length !== 4 || !teamLeader || !teamName.trim()}
                className={`px-4 py-2 rounded-lg text-white ${
                  selectedIndividuals.length === 4 && teamLeader && teamName.trim()
                    ? 'bg-[#E8C848] hover:bg-[#d4b03e]'
                    : 'bg-[#E8C848]/50 cursor-not-allowed'
                }`}
              >
                Create Team
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default ManageHackathonParticipants;