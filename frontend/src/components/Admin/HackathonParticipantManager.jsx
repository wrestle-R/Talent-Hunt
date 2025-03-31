import React, { useState, useEffect } from 'react';

import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, User, Plus, Check, X, Award, Trash2, Search, ArrowLeft, UserCheck } from 'lucide-react';
import axios from 'axios';
import CreateTeamModal from './CreateTeamModal';

const HackathonParticipantManager = () => {
  // Get hackathonId from URL parameters
  const { hackathonId } = useParams();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('individuals');
  const [individuals, setIndividuals] = useState([]);
  const [teamApplicants, setTeamApplicants] = useState([]);
  const [registeredTeams, setRegisteredTeams] = useState([]);
  const [tempTeams, setTempTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [selectedIndividuals, setSelectedIndividuals] = useState([]);
  const [teamName, setTeamName] = useState('');
  const [teamLeader, setTeamLeader] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [hackathon, setHackathon] = useState(null);

  useEffect(() => {
    if (hackathonId) {
      fetchData();
    } else {
      setError("Missing hackathon ID");
      setLoading(false);
    }
  }, [hackathonId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      console.log("Fetching data for hackathonId:", hackathonId);
      
      // Get hackathon details
      const hackathonRes = await axios.get(
        `http://localhost:4000/api/admin/hackathons/${hackathonId}`,
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      setHackathon(hackathonRes.data.hackathon);
      
      // Get all participants data
      const participantsRes = await axios.get(
        `http://localhost:4000/api/admin/hackathons/${hackathonId}/participants`,
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      const { participants } = participantsRes.data;
      
      setIndividuals(participants.individualApplicants || []);
      setTeamApplicants(participants.teamApplicants || []);
      setTempTeams(participants.temporaryTeams || []);
      
      // Get registered teams
      const teamsRes = await axios.get(
        `http://localhost:4000/api/admin/hackathons/${hackathonId}/teams`,
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      setRegisteredTeams(teamsRes.data.teams?.registered || []);
      
    } catch (err) {
      console.error('Error fetching hackathon participants:', err);
      setError('Failed to load participants data');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveIndividual = async (applicantId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:4000/api/admin/hackathons/${hackathonId}/applicants/${applicantId}`,
        {
          type: 'individual',
          status: 'Approved'
        },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      setSuccess('Applicant approved successfully');
      fetchData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to approve applicant');
      console.error('Error approving applicant:', err);
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleRejectIndividual = async (applicantId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:4000/api/admin/hackathons/${hackathonId}/applicants/${applicantId}`,
        {
          type: 'individual',
          status: 'Rejected',
          feedback: 'Your application was rejected' // Optional: Add feedback
        },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      setSuccess('Applicant rejected successfully');
      fetchData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to reject applicant');
      console.error('Error rejecting applicant:', err);
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleApproveTeam = async (applicantId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:4000/api/admin/hackathons/${hackathonId}/applicants/${applicantId}`,
        {
          type: 'team',
          status: 'Approved'
        },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      setSuccess('Team approved successfully');
      fetchData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to approve team');
      console.error('Error approving team:', err);
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleRejectTeam = async (applicantId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:4000/api/admin/hackathons/${hackathonId}/applicants/${applicantId}`,
        {
          type: 'team',
          status: 'Rejected',
          feedback: 'Your team application was rejected' // Optional: Add feedback
        },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      setSuccess('Team rejected successfully');
      fetchData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to reject team');
      console.error('Error rejecting team:', err);
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleCreateTempTeam = async () => {
    if (selectedIndividuals.length !== 4) {
      setError('Please select exactly 4 team members');
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
      
      // Make sure we're accessing student data correctly
      const memberData = selectedIndividuals.map(ind => ({
        id: ind.student?._id,
        email: ind.student?.email
      }));
      
      await axios.post(
        `http://localhost:4000/api/admin/hackathons/${hackathonId}/temp-teams`,
        {
          teamName: teamName.trim(),
          members: memberData,
          leader: {
            id: teamLeader.student?._id,
            email: teamLeader.student?.email
          }
        },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      setSuccess('Team created successfully');
      setShowTeamModal(false);
      setSelectedIndividuals([]);
      setTeamLeader(null);
      setTeamName('');
      fetchData();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create team');
    }
  };

  const handleConvertTempTeam = async (teamId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:4000/api/admin/hackathons/${hackathonId}/temp-teams/${teamId}/convert`,
        {},
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      setSuccess('Team converted successfully');
      fetchData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to convert team');
      console.error('Error converting team:', err);
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleDissolveTempTeam = async (teamId) => {
    if (!confirm('Are you sure you want to dissolve this team?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `http://localhost:4000/api/admin/hackathons/${hackathonId}/temp-teams/${teamId}`,
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      setSuccess('Team dissolved successfully');
      fetchData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to dissolve team');
      console.error('Error dissolving team:', err);
      setTimeout(() => setError(null), 3000);
    }
  };

// Update these functions in your existing component

const toggleIndividualSelection = (individual) => {
  console.log('Toggling individual:', individual); // Debug log
  
  setSelectedIndividuals(prev => {
    const isSelected = prev.some(i => 
      i._id === individual._id || 
      i.student?._id === individual.student?._id
    );

    if (isSelected) {
      // Remove from selection
      const newSelection = prev.filter(i => 
        i._id !== individual._id && 
        i.student?._id !== individual.student?._id
      );
      
      // If we're removing the team leader, reset it
      if (teamLeader?._id === individual._id || 
          teamLeader?.student?._id === individual.student?._id) {
        setTeamLeader(null);
      }
      return newSelection;
    } else {
      // Add to selection if less than 4 members
      if (prev.length < 4) {
        return [...prev, individual];
      }
      return prev;
    }
  });
};

const setAsLeader = (individual) => {
  console.log('Setting leader:', individual); // Debug log
  
  // Make sure the individual is in the selected list
  if (!selectedIndividuals.some(i => 
    i._id === individual._id || 
    i.student?._id === individual.student?._id
  )) {
    toggleIndividualSelection(individual);
  }
  setTeamLeader(individual);
};



  const availableIndividuals = individuals.filter(i => 
    i.status === 'Approved' && 
    !i.assignedToTempTeam &&
    !selectedIndividuals.some(selected => selected.student._id === i.student._id)
  );

  // Filter individuals based on search term including emails
  const filteredIndividuals = individuals.filter(ind => 
    ind.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ind.student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (ind.skills && ind.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="ml-2">Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {/* Hackathon Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{hackathon?.hackathonName}</h1>
        {hackathon && (
          <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
            <span>Domain: {hackathon.primaryDomain}</span>
            <span>•</span>
            <span className="flex items-center">
              <Users size={16} className="mr-1" />
              {hackathon.registration.currentlyRegistered}/{hackathon.registration.totalCapacity}
            </span>
          </div>
        )}
      </div>

      {/* Notification Messages */}
      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 flex items-center justify-between"
        >
          <span>{error}</span>
          <button onClick={() => setError(null)}><X size={16} /></button>
        </motion.div>
      )}
      
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 flex items-center justify-between"
        >
          <span>{success}</span>
          <button onClick={() => setSuccess(null)}><X size={16} /></button>
        </motion.div>
      )}

      {/* Back Navigation */}
      <button 
        onClick={() => navigate('/admin/hackathons')}
        className="mb-4 flex items-center text-gray-600 hover:text-blue-600"
      >
        <ArrowLeft size={16} className="mr-1" /> Back to Hackathons
      </button>

      {/* Tab Navigation */}
      <div className="flex border-b mb-4 overflow-x-auto">
        <button
          className={`py-2 px-4 whitespace-nowrap ${activeTab === 'individuals' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('individuals')}
        >
          <User className="inline mr-2" size={16} />
          Individual Applicants ({individuals.filter(i => !i.assignedToTempTeam).length})
        </button>
        <button
          className={`py-2 px-4 whitespace-nowrap ${activeTab === 'teamApplicants' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('teamApplicants')}
        >
          <Users className="inline mr-2" size={16} />
          Team Applicants ({teamApplicants.length})
        </button>
        <button
          className={`py-2 px-4 whitespace-nowrap ${activeTab === 'tempTeams' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('tempTeams')}
        >
          <Award className="inline mr-2" size={16} />
          Temporary Teams ({tempTeams.length})
        </button>
        <button
          className={`py-2 px-4 whitespace-nowrap ${activeTab === 'registeredTeams' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('registeredTeams')}
        >
          <UserCheck className="inline mr-2" size={16} />
          Registered Teams ({registeredTeams.length})
        </button>
      </div>

      {/* Individual Applicants Tab */}
      {activeTab === 'individuals' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by name or email..."
                className="pl-10 py-2 pr-3 border rounded-lg w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={() => setShowTeamModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
              disabled={individuals.filter(i => i.status === 'Approved' && !i.assignedToTempTeam).length < 4}
            >
              <Plus size={18} className="mr-2" />
              Form Team
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Skills</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredIndividuals
                  .filter(ind => !ind.assignedToTempTeam) // Filter out individuals already in temp teams
                  .map(individual => (
                    <tr key={individual.student._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            src={individual.student.profile_picture || '/default-avatar.png'}
                            alt={individual.student.name}
                            className="h-10 w-10 rounded-full mr-3"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/default-avatar.png';
                            }}
                          />
                          <div className="font-medium">{individual.student.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {individual.student.email}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {individual.skills?.slice(0, 3).map((skill, idx) => (
                            <span 
                              key={`${individual.student._id}-skill-${idx}`} 
                              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                            >
                              {skill}
                            </span>
                          ))}
                          {individual.skills?.length > 3 && (
                            <span 
                              key={`${individual.student._id}-more`}
                              className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full"
                            >
                              +{individual.skills.length - 3} more
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                          ${individual.status === 'Approved' ? 'bg-green-100 text-green-800' : 
                            individual.status === 'Rejected' ? 'bg-red-100 text-red-800' : 
                            'bg-yellow-100 text-yellow-800'}`}>
                          {individual.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {individual.status === 'Pending' ? (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleApproveIndividual(individual.id)}
                              className="bg-green-100 hover:bg-green-200 text-green-800 px-3 py-1 rounded-md text-sm flex items-center"
                            >
                              <Check size={14} className="mr-1" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectIndividual(individual.id)}
                              className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded-md text-sm flex items-center"
                            >
                              <X size={14} className="mr-1" />
                              Reject
                            </button>
                          </div>
                        ) : individual.status === 'Approved' ? (
                          <button
                            onClick={() => {
                              setSelectedIndividuals([individual]);
                              setShowTeamModal(true);
                            }}
                            className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1 rounded-md text-sm flex items-center"
                          >
                            <Plus size={14} className="mr-1" />
                            Add to Team
                          </button>
                        ) : (
                          <span className="text-gray-500 text-sm">No actions available</span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Team Applicants Tab */}
      {activeTab === 'teamApplicants' && (
        <div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Members</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {teamApplicants.map(team => (
                  <tr key={team.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium">{team.team?.name}</div>
                      <div className="text-xs text-gray-500">Applied: {new Date(team.registeredAt).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {team.team?.members?.map((member, idx) => (
                          <div 
                            key={`${team.id}-member-${idx}`} 
                            className="flex items-center bg-gray-50 rounded-full pl-1 pr-2 py-0.5"
                          >
                            <img
                              src={member.student?.profile_picture || '/default-avatar.png'}
                              alt={member.student?.name}
                              className="h-6 w-6 rounded-full mr-1"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/default-avatar.png';
                              }}
                            />
                            <div className="text-xs">
                              <div>{member.student?.name}</div>
                              <div className="text-gray-500">{member.student?.email}</div>
                            </div>
                            {member.isLeader && (
                              <span className="ml-1 bg-blue-100 text-blue-800 text-xs rounded-full px-1">Leader</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${team.status === 'Approved' ? 'bg-green-100 text-green-800' : 
                          team.status === 'Rejected' ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'}`}>
                        {team.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {team.status === 'Pending' ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleApproveTeam(team.id)}
                            className="bg-green-100 hover:bg-green-200 text-green-800 px-3 py-1 rounded-md text-sm flex items-center"
                          >
                            <Check size={14} className="mr-1" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectTeam(team.id)}
                            className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded-md text-sm flex items-center"
                          >
                            <X size={14} className="mr-1" />
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm">No actions available</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Temporary Teams Tab */}
      {activeTab === 'tempTeams' && (
        <div>
          <div className="grid md:grid-cols-2 gap-4">
            {tempTeams.length === 0 ? (
              <div className="col-span-2 text-center py-8 text-gray-500">
                No temporary teams have been formed yet.
              </div>
            ) : (
              tempTeams.map(team => (
                <div key={team._id} className="border rounded-lg p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium text-lg">{team.teamName}</h3>
                      <p className="text-sm text-gray-500">
                        Created: {new Date(team.formedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleConvertTempTeam(team._id)}
                        className="bg-green-100 hover:bg-green-200 text-green-800 p-1.5 rounded-full"
                        title="Convert to regular team"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={() => handleDissolveTempTeam(team._id)}
                        className="bg-red-100 hover:bg-red-200 text-red-800 p-1.5 rounded-full"
                        title="Dissolve team"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <div className="text-sm font-medium mb-1">Team Leader:</div>
                    <div className="flex items-center bg-green-50 rounded-lg p-2">
                      <img
                        src={team.leader?.profile_picture || '/default-avatar.png'}
                        alt={team.leader?.name}
                        className="h-8 w-8 rounded-full mr-2"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/default-avatar.png';
                        }}
                      />
                      <div>
                        <div className="font-medium">{team.leader?.name}</div>
                        <div className="text-xs text-gray-600">{team.leader?.email}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium mb-1">Members:</div>
                    <div className="space-y-2">
                      {team.members?.map((member, idx) => (
                        <div 
                          key={`${team._id}-member-${idx}-${member.email}`} 
                          className="flex items-center bg-gray-50 rounded-lg p-2"
                        >
                          <img
                            src={member.profile_picture || '/default-avatar.png'}
                            alt={member.name}
                            className="h-6 w-6 rounded-full mr-2"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/default-avatar.png';
                            }}
                          />
                          <div>
                            <div className="text-sm">{member.name}</div>
                            <div className="text-xs text-gray-500">{member.email}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Registered Teams Tab */}
      {activeTab === 'registeredTeams' && (
        <div>
          <div className="grid md:grid-cols-2 gap-4">
            {registeredTeams.length === 0 ? (
              <div className="col-span-2 text-center py-8 text-gray-500">
                No teams have been registered yet.
              </div>
            ) : (
              registeredTeams.map(team => (
                <div key={team.id} className="border rounded-lg p-4 shadow-sm">
                  <h3 className="font-medium text-lg">{team.name}</h3>
                  <p className="text-sm text-gray-500">
                    Registered: {new Date(team.createdAt).toLocaleDateString()}
                  </p>
                  
                  <div className="mt-3">
                    <div className="text-sm font-medium mb-1">Team Members:</div>
                    <div className="space-y-2">
                      {team.members?.map((member, idx) => (
                        <div 
                          key={`${team.id}-member-${idx}-${member.student?.email}`} 
                          className={`flex items-center p-2 rounded-lg ${
                            member.isLeader ? 'bg-green-50' : 'bg-gray-50'
                          }`}
                        >
                          <img
                            src={member.student?.profile_picture || '/default-avatar.png'}
                            alt={member.student?.name}
                            className="h-8 w-8 rounded-full mr-2"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/default-avatar.png';
                            }}
                          />
                          <div>
                            <div className={member.isLeader ? 'font-medium' : ''}>{member.student?.name}</div>
                            <div className="text-xs text-gray-500">{member.student?.email}</div>
                            {member.isLeader && (
                              <div className="text-xs text-green-600 mt-0.5">Team Leader</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Team Formation Modal */}
      {showTeamModal && (
        <CreateTeamModal
          showModal={showTeamModal}
          onClose={() => {
            setShowTeamModal(false);
            setSelectedIndividuals([]);
            setTeamLeader(null);
            setTeamName('');
          }}
          teamName={teamName}
          setTeamName={setTeamName}
          availableIndividuals={availableIndividuals}
          selectedIndividuals={selectedIndividuals}
          teamLeader={teamLeader}
          onToggleSelection={toggleIndividualSelection}
          onSetLeader={setAsLeader}
          onCreateTeam={handleCreateTempTeam}
        />
      )}
    </div>
  );
};

export default HackathonParticipantManager;