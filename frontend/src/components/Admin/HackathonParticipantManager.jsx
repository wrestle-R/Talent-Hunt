import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Tabs, TabList, Tab, TabPanel } from 'react-tabs';
import { 
  User, Users, Check, X, AlertTriangle, Award, 
  UserPlus, Clock, Calendar, Plus, ChevronDown, ChevronUp 
} from 'lucide-react';
import { motion } from 'framer-motion';
import CreateTeamModal from './CreateTeamModal';

// Use a reliable placeholder image
const PLACEHOLDER_IMAGE = "https://via.placeholder.com/40?text=User";

const API_BASE_URL = "http://localhost:4000"; // Using localhost:4000 for consistency

// Safe user handling
const getUserId = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{"uid":"unknown"}');
    return user?.uid || 'unknown';
  } catch (error) {
    console.error("Error getting user ID:", error);
    return 'unknown';
  }
};

const HackathonParticipantManager = () => {
  const { hackathonId } = useParams();
  const [activeTab, setActiveTab] = useState(0);
  const [activeIndividualTab, setActiveIndividualTab] = useState(0);
  const [activeTeamTab, setActiveTeamTab] = useState(0);
  // Data state
  const [hackathon, setHackathon] = useState(null);
  const [individuals, setIndividuals] = useState({
    pending: [],
    approved: [],
    rejected: []
  });
  const [teamApplicants, setTeamApplicants] = useState({
    pending: [],
    approved: [],
    rejected: []
  });
  const [registeredTeams, setRegisteredTeams] = useState([]);
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Team modal state
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [selectedIndividuals, setSelectedIndividuals] = useState([]);
  const [teamLeader, setTeamLeader] = useState(null);
  const [teamName, setTeamName] = useState('');
  
  // Team profile view state
  const [expandedTeam, setExpandedTeam] = useState(null);
  
  useEffect(() => {
    fetchData();
  }, [hackathonId]);
  
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch hackathon details
      const { data: hackathonData } = await axios.get(
        `${API_BASE_URL}/api/admin/hackathons/${hackathonId}`
      );
      setHackathon(hackathonData);
      
      // Fetch individual applicants
      const { data: individualsData } = await axios.get(
        `${API_BASE_URL}/api/admin/hackathons/${hackathonId}/individual-applicants`
      );
      // Defensive: ensure .data exists and has pending/approved/rejected
      setIndividuals(
        (individualsData && individualsData.data)
          ? {
              pending: Array.isArray(individualsData.data.pending) ? individualsData.data.pending : [],
              approved: Array.isArray(individualsData.data.approved) ? individualsData.data.approved : [],
              rejected: Array.isArray(individualsData.data.rejected) ? individualsData.data.rejected : []
            }
          : { pending: [], approved: [], rejected: [] }
      );

      // Fetch team applicants
      const { data: teamApplicantsData } = await axios.get(
        `${API_BASE_URL}/api/admin/hackathons/${hackathonId}/team-applicants`
      );
      setTeamApplicants(
        (teamApplicantsData && teamApplicantsData.data)
          ? {
              pending: Array.isArray(teamApplicantsData.data.pending) ? teamApplicantsData.data.pending : [],
              approved: Array.isArray(teamApplicantsData.data.approved) ? teamApplicantsData.data.approved : [],
              rejected: Array.isArray(teamApplicantsData.data.rejected) ? teamApplicantsData.data.rejected : []
            }
          : { pending: [], approved: [], rejected: [] }
      );
      
      // Fetch registered teams
      const { data: registeredTeamsData } = await axios.get(
        `${API_BASE_URL}/api/admin/hackathons/${hackathonId}/registered-teams`
      );
      setRegisteredTeams(Array.isArray(registeredTeamsData.teams) ? registeredTeamsData.teams : []);
      
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Individual applicant status update
  const handleUpdateApplicantStatus = async (applicantId, newStatus) => {
    try {
      await axios.put(
        `${API_BASE_URL}/api/admin/hackathons/${hackathonId}/individual-applicants/${applicantId}`,
        { status: newStatus }
      );
      
      setSuccess(`Applicant ${newStatus.toLowerCase()} successfully`);
      fetchData(); // Refresh data
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to update applicant status');
      console.error('Error updating applicant status:', err);
      setTimeout(() => setError(null), 3000);
    }
  };
  
  // Team selection for team creation
  const toggleIndividualSelection = (individual) => {
    setSelectedIndividuals(prev => {
      const isSelected = prev.some(i => i._id === individual.student._id);
      
      if (isSelected) {
        // If removing the team leader, reset it
        if (teamLeader && teamLeader._id === individual.student._id) {
          setTeamLeader(null);
        }
        return prev.filter(i => i._id !== individual.student._id);
      } else {
        // Add to selection if less than 4
        if (prev.length < 4) {
          const newMember = {
            _id: individual.student._id,
            name: individual.student.name,
            email: individual.student.email,
            profile_picture: individual.student.profile_picture,
            skills: individual.skills || []
          };
          return [...prev, newMember];
        }
        return prev;
      }
    });
  };

  const setAsLeader = (individual) => {
    setTeamLeader({
      _id: individual._id,
      name: individual.name,
      email: individual.email
    });
  };
  
  // Create temporary team
  const handleCreateTempTeam = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/admin/hackathons/${hackathonId}/temp-teams`,
        {
          teamName,
          leaderId: teamLeader._id,
          memberIds: selectedIndividuals.map((individual) => individual._id),
          createdBy: getUserId(), // Use actual user ID from localStorage
        }
      );
  
      if (response.data.success) {
        setSuccess("Temporary team created successfully and added to team applications");
        fetchData(); // Refresh data to include the new team
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      console.error("Error creating temporary team:", err);
      setError("Failed to create temporary team");
      setTimeout(() => setError(null), 3000);
    }
  };

  // Update team applicant status
  const handleUpdateTeamStatus = async (teamId, newStatus) => {
    try {
      await axios.put(
        `${API_BASE_URL}/api/admin/hackathons/${hackathonId}/team-applicants/${teamId}`,
        { status: newStatus }
      );
      
      setSuccess(`Team ${newStatus.toLowerCase()} successfully`);
      fetchData(); // Refresh data
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to update team status');
      console.error('Error updating team status:', err);
      setTimeout(() => setError(null), 3000);
    }
  };

  const renderTeamMembers = (members) => {
    // Guard clause for null/undefined members array
    if (!members || !Array.isArray(members)) {
      return <div className="text-gray-500">No members available</div>;
    }
  
    return members.map((member, index) => {
      // If member is completely null/undefined, return placeholder
      if (!member) {
        return (
          <div key={`missing-member-${index}`} className="flex items-center">
            <div className="flex-shrink-0 h-8 w-8">
              <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center text-xs text-gray-400">
                ?
              </div>
            </div>
            <div className="ml-3">
              <div className="text-sm font-medium text-gray-400">Russel Daniel</div>
            </div>
          </div>
        );
      }
  
      try {
        // Handle case where member data is directly on the member object
        if (member.name && typeof member.name === 'string') {
          return (
            <div key={member._id || `direct-member-${index}`} className="flex items-center">
              <div className="flex-shrink-0 h-8 w-8">
                <img 
                  className="h-8 w-8 rounded-full object-cover" 
                  src={member.profile_picture || PLACEHOLDER_IMAGE} 
                  alt={(member.name || '?').charAt(0)}
                  onError={(e) => { e.target.src = PLACEHOLDER_IMAGE }}
                />
              </div>
              <div className="ml-3">
                <div className="text-sm font-medium flex items-center text-white">
                  {member.name || 'Unknown'}
                  {member.isLeader && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      <Award size={12} className="mr-1" />
                      Leader
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-400">{member.email || 'No email'}</div>
              </div>
            </div>
          );
        }
  
        // Handle case where member data is nested in student property
        const studentData = member.student || {};
        return (
          <div key={studentData._id || `student-member-${index}`} className="flex items-center">
            <div className="flex-shrink-0 h-8 w-8">
              <img 
                className="h-8 w-8 rounded-full object-cover" 
                src={studentData.profile_picture || PLACEHOLDER_IMAGE} 
                alt={(studentData.name || '?').charAt(0)}
                onError={(e) => { e.target.src = PLACEHOLDER_IMAGE }}
              />
            </div>
            <div className="ml-3">
              <div className="text-sm font-medium flex items-center text-white">
                {studentData.name || 'Unknown User'}
                {member.role === 'Leader' && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    <Award size={12} className="mr-1" />
                    Leader
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-400">{studentData.email || 'No email'}</div>
            </div>
          </div>
        );
      } catch (error) {
        console.error('Error rendering team member:', error);
        // Return fallback UI instead of throwing error
        return (
          <div key={`error-member-${index}`} className="flex items-center">
            <div className="flex-shrink-0 h-8 w-8">
              <div className="h-8 w-8 rounded-full bg-red-700 flex items-center justify-center text-xs text-white">
                !
              </div>
            </div>
            <div className="ml-3">
              <div className="text-sm font-medium text-gray-400">Error Loading Member</div>
            </div>
          </div>
        );
      }
    });
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E8C848]"></div>
      </div>
    );
  }
  
  if (error && !hackathon) {
    return (
      <div className="bg-red-900/20 border border-red-800 text-red-200 p-4 rounded-md">
        <div className="flex items-center">
          <AlertTriangle className="mr-2" size={20} />
          <p>{error}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-[#111111] min-h-screen p-6">
      {/* Alerts */}
      {error && (
        <div className="bg-red-900/20 border border-red-800 text-red-200 p-3 rounded-md mb-4">
          <div className="flex items-center">
            <AlertTriangle className="mr-2" size={16} />
            <p>{error}</p>
          </div>
        </div>
      )}
      
      {success && (
        <div className="bg-[#E8C848]/20 border border-[#E8C848] text-[#E8C848] p-3 rounded-md mb-4">
          <div className="flex items-center">
            <Check className="mr-2" size={16} />
            <p>{success}</p>
          </div>
        </div>
      )}
      
      {/* Hackathon Header */}
      <div className="bg-[#1A1A1A] rounded-xl shadow-lg border border-gray-800 p-6 mb-6">
        <h1 className="text-2xl font-bold text-white mb-2 font-montserrat">{hackathon.hackathonName}</h1>
        <div className="flex items-center text-gray-400 text-sm">
          <Calendar className="mr-1 text-[#E8C848]" size={14} />
          <span>{new Date(hackathon.startDate).toLocaleDateString()} - {new Date(hackathon.endDate).toLocaleDateString()}</span>
        </div>
      </div>
      
      {/* Main Tabs */}
      <Tabs selectedIndex={activeTab} onSelect={index => setActiveTab(index)}>
        <TabList className="flex border-b border-gray-800 mb-6">
          <Tab 
            className={`py-3 px-4 font-medium text-sm cursor-pointer transition-colors ${
              activeTab === 0 
                ? 'text-[#E8C848] border-b-2 border-[#E8C848] font-montserrat' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center">
              <User size={16} className="mr-2" />
              Individual Applicants
            </div>
          </Tab>
          <Tab 
            className={`py-3 px-4 font-medium text-sm cursor-pointer ${
              activeTab === 1
                ? 'text-[#E8C848] border-b-2 border-[#E8C848] font-montserrat' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center">
              <UserPlus size={16} className="mr-2" />
              Team Applicants
            </div>
          </Tab>
          <Tab 
            className={`py-3 px-4 font-medium text-sm cursor-pointer ${
              activeTab === 2
                ? 'text-[#E8C848] border-b-2 border-[#E8C848] font-montserrat' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center">
              <Award size={16} className="mr-2" />
              Registered Teams
            </div>
          </Tab>
        </TabList>
        
        {/* Tab Content */}
        <TabPanel>
          {/* Individual Applicants Tab */}
          <div className="bg-[#1A1A1A] rounded-xl shadow-lg overflow-hidden border border-gray-800">
            <div className="px-6 py-4 border-b border-gray-800">
              <h2 className="font-bold text-lg text-white">Individual Applicants</h2>
            </div>
            
            {/* Individual Subtabs */}
            <div className="px-6 pt-4">
              <div className="flex border-b border-gray-800">
                <button 
                  onClick={() => setActiveIndividualTab(0)}
                  className={`py-2 px-4 font-medium text-sm ${
                    activeIndividualTab === 0
                      ? 'text-[#E8C848] border-b-2 border-[#E8C848] font-montserrat' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Pending ({individuals.pending.length})
                </button>
                <button 
                  onClick={() => setActiveIndividualTab(1)}
                  className={`py-2 px-4 font-medium text-sm ${
                    activeIndividualTab === 1
                      ? 'text-[#E8C848] border-b-2 border-[#E8C848] font-montserrat' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Approved ({individuals.approved.length})
                </button>
                <button 
                  onClick={() => setActiveIndividualTab(2)}
                  className={`py-2 px-4 font-medium text-sm ${
                    activeIndividualTab === 2
                      ? 'text-[#E8C848] border-b-2 border-[#E8C848] font-montserrat' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Rejected ({individuals.rejected.length})
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {activeIndividualTab === 0 && (
                <div>
                  {individuals.pending.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No pending applicants
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-800">
                        <thead className="bg-[#2A2A2A]">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Applicant</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Skills</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Applied On</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-[#1A1A1A] divide-y divide-gray-800">
                          {individuals.pending.map(individual => (
                            <tr key={individual._id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10">
                                    <img 
                                      className="h-10 w-10 rounded-full" 
                                      src={individual.student?.profile_picture || PLACEHOLDER_IMAGE} 
                                      alt={individual.student?.name?.substring(0,1) || "?"}
                                      onError={(e) => { e.target.src = PLACEHOLDER_IMAGE }}
                                    />
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-white">{individual.student.name}</div>
                                    <div className="text-sm text-gray-400">{individual.student.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex flex-wrap gap-1">
                                  {individual.skills?.slice(0, 3).map((skill, index) => (
                                    <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                      {skill}
                                    </span>
                                  ))}
                                  {individual.skills?.length > 3 && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                      +{individual.skills.length - 3}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                {new Date(individual.registeredAt).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleUpdateApplicantStatus(individual._id, 'Approved')}
                                    className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 px-2 py-1 rounded"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleUpdateApplicantStatus(individual._id, 'Rejected')}
                                    className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-2 py-1 rounded"
                                  >
                                    Reject
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
              
              {activeIndividualTab === 1 && (
                <div>
                  <div className="flex justify-end mb-4">
                    <button
                      onClick={() => setShowTeamModal(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
                    >
                      <Plus size={16} className="mr-2" />
                      Create Team
                    </button>
                  </div>
                  
                  {individuals.approved.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No approved applicants
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {individuals.approved.map(individual => (
                        <div 
                          key={individual._id}
                          className={`p-4 border rounded-lg ${
                            individual.assignedToTempTeam
                              ? 'border-green-300 bg-green-50'
                              : 'border-gray-800 bg-[#1A1A1A] hover:border-[#E8C848] hover:shadow-lg'
                          } transition-all`}
                          onClick={() => !individual.assignedToTempTeam && toggleIndividualSelection(individual)}
                        >
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <img 
                                className="h-12 w-12 rounded-full" 
                                src={individual.student?.profile_picture || PLACEHOLDER_IMAGE} 
                                alt={individual.student?.name?.substring(0,1) || "?"}
                                onError={(e) => { e.target.src = PLACEHOLDER_IMAGE }}
                              />
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-white">{individual.student.name}</div>
                              <div className="text-xs text-gray-400">{individual.student.email}</div>
                              {individual.assignedToTempTeam && (
                                <div className="text-xs text-green-600 mt-1">Assigned to a team</div>
                              )}
                            </div>
                          </div>
                          
                          <div className="mt-3 flex flex-wrap gap-1">
                            {individual.skills?.slice(0, 3).map((skill, index) => (
                              <span key={index} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {skill}
                              </span>
                            ))}
                            {individual.skills?.length > 3 && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                +{individual.skills.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              {activeIndividualTab === 2 && (
                <div>
                  {individuals.rejected.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No rejected applicants
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-800">
                        <thead className="bg-[#2A2A2A]">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Applicant</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Skills</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Applied On</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-[#1A1A1A] divide-y divide-gray-800">
                          {individuals.rejected.map(individual => (
                            <tr key={individual._id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10">
                                    <img 
                                      className="h-10 w-10 rounded-full" 
                                      src={individual.student?.profile_picture || PLACEHOLDER_IMAGE} 
                                      alt={individual.student?.name?.substring(0,1) || "?"}
                                      onError={(e) => { e.target.src = PLACEHOLDER_IMAGE }}
                                    />
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-white">{individual.student.name}</div>
                                    <div className="text-sm text-gray-400">{individual.student.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex flex-wrap gap-1">
                                  {individual.skills?.slice(0, 3).map((skill, index) => (
                                    <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                      {skill}
                                    </span>
                                  ))}
                                  {individual.skills?.length > 3 && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                      +{individual.skills.length - 3}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                {new Date(individual.registeredAt).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button
                                  onClick={() => handleUpdateApplicantStatus(individual._id, 'Approved')}
                                  className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded"
                                >
                                  Move to Approved
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </TabPanel>
        
        <TabPanel>
          {/* Team Applicants Tab */}
          <div className="bg-[#1A1A1A] rounded-xl shadow-lg overflow-hidden border border-gray-800">
            <div className="px-6 py-4 border-b border-gray-800">
              <h2 className="font-bold text-lg text-white">Team Applicants</h2>
            </div>
            
            {/* Team Subtabs */}
            <div className="px-6 pt-4">
              <div className="flex border-b border-gray-800">
                <button 
                  onClick={() => setActiveTeamTab(0)}
                  className={`py-2 px-4 font-medium text-sm ${
                    activeTeamTab === 0
                      ? 'text-[#E8C848] border-b-2 border-[#E8C848] font-montserrat' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Pending ({teamApplicants.pending.length})
                </button>
                <button 
                  onClick={() => setActiveTeamTab(1)}
                  className={`py-2 px-4 font-medium text-sm ${
                    activeTeamTab === 1
                      ? 'text-[#E8C848] border-b-2 border-[#E8C848] font-montserrat' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Approved ({teamApplicants.approved.length})
                </button>
                <button 
                  onClick={() => setActiveTeamTab(2)}
                  className={`py-2 px-4 font-medium text-sm ${
                    activeTeamTab === 2
                      ? 'text-[#E8C848] border-b-2 border-[#E8C848] font-montserrat' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Rejected ({teamApplicants.rejected.length})
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {activeTeamTab === 0 && (
                <div>
                  {teamApplicants.pending.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No pending team applications
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {teamApplicants.pending.map(application => (
                        <div key={application._id} className="border border-gray-800 rounded-lg overflow-hidden bg-[#1A1A1A]">
                          <div className="px-4 py-3 bg-[#2A2A2A] border-b border-gray-800 flex justify-between items-center">
                            <h3 className="font-medium text-white">
                              {application.team.name}
                            </h3>
                            <div className="text-xs text-gray-400">
                              Applied {new Date(application.registeredAt).toLocaleDateString()}
                            </div>
                          </div>
                          
                          <div className="p-4">
                            <div className="flex flex-wrap gap-2 mb-3">
                              {application.team.techStack?.map((tech, index) => (
                                <span key={index} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {tech}
                                </span>
                              ))}
                            </div>
                            
                            {expandedTeam === application._id ? (
                              <div className="mt-3 border-t border-gray-800 pt-3">
                                <h4 className="text-sm font-medium text-gray-400 mb-2">Team Members:</h4>
                                <div className="space-y-2">
                                  {renderTeamMembers(application.team.members)}
                                </div>
                                
                                <div className="mt-4 text-sm text-gray-400">
                                  <h4 className="font-medium mb-1">Description:</h4>
                                  <p>{application.team.description || 'No description provided.'}</p>
                                </div>
                                
                                <button
                                  onClick={() => setExpandedTeam(null)}
                                  className="mt-4 text-[#E8C848] text-sm flex items-center"
                                >
                                  <ChevronUp size={16} className="mr-1" />
                                  Hide Details
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between mt-3">
                                <button
                                  onClick={() => setExpandedTeam(application._id)}
                                  className="text-[#E8C848] text-sm flex items-center"
                                >
                                  <ChevronDown size={16} className="mr-1" />
                                  View Team Details
                                </button>
                                
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleUpdateTeamStatus(application._id, 'Rejected')}
                                    className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md text-sm"
                                  >
                                    Reject
                                  </button>
                                  <button
                                    onClick={() => handleUpdateTeamStatus(application._id, 'Approved')}
                                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm"
                                  >
                                    Approve
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              {activeTeamTab === 1 && (
                <div>
                  {teamApplicants.approved.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No approved team applications
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {teamApplicants.approved.map(application => (
                        <div key={application._id} className="border border-green-200 rounded-lg overflow-hidden bg-green-50">
                          <div className="px-4 py-3 bg-green-100 border-b border-green-200 flex justify-between items-center">
                            <div className="flex items-center">
                              <h3 className="font-medium text-green-800">
                                {application.team.name}
                              </h3>
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-200 text-green-800">
                                <Check size={12} className="mr-1" />
                                Approved
                              </span>
                            </div>
                            <div className="text-xs text-green-700">
                              Approved on {new Date(application.updatedAt || application.registeredAt).toLocaleDateString()}
                            </div>
                          </div>
                          
                          <div className="p-4">
                            <div className="flex flex-wrap gap-2 mb-3">
                              {application.team.techStack?.map((tech, index) => (
                                <span key={index} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {tech}
                                </span>
                              ))}
                            </div>
                            
                            {expandedTeam === application._id ? (
                              <div className="mt-3 border-t border-green-200 pt-3">
                                <h4 className="text-sm font-medium text-gray-700 mb-2">Team Members:</h4>
                                <div className="space-y-2">
                                  {renderTeamMembers(application.team.members)}
                                </div>
                                
                                <div className="mt-4 text-sm text-gray-700">
                                  <h4 className="font-medium mb-1">Description:</h4>
                                  <p>{application.team.description || 'No description provided.'}</p>
                                </div>
                                
                                <button
                                  onClick={() => setExpandedTeam(null)}
                                  className="mt-4 text-blue-600 text-sm flex items-center"
                                >
                                  <ChevronUp size={16} className="mr-1" />
                                  Hide Details
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setExpandedTeam(application._id)}
                                className="mt-3 text-blue-600 text-sm flex items-center"
                              >
                                <ChevronDown size={16} className="mr-1" />
                                View Team Details
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              {activeTeamTab === 2 && (
                <div>
                  {teamApplicants.rejected.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No rejected team applications
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {teamApplicants.rejected.map(application => (
                        <div key={application._id} className="border border-red-200 rounded-lg overflow-hidden bg-red-50">
                          <div className="px-4 py-3 bg-red-100 border-b border-red-200 flex justify-between items-center">
                            <div className="flex items-center">
                              <h3 className="font-medium text-red-800">
                                {application.team.name}
                              </h3>
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-200 text-red-800">
                                <X size={12} className="mr-1" />
                                Rejected
                              </span>
                            </div>
                            <div className="text-xs text-red-700">
                              Rejected on {new Date(application.updatedAt || application.registeredAt).toLocaleDateString()}
                            </div>
                          </div>
                          
                          <div className="p-4">
                            <div className="flex flex-wrap gap-2 mb-3">
                              {application.team.techStack?.map((tech, index) => (
                                <span key={index} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {tech}
                                </span>
                              ))}
                            </div>
                            
                            {expandedTeam === application._id ? (
                              <div className="mt-3 border-t border-red-200 pt-3">
                                <h4 className="text-sm font-medium text-gray-700 mb-2">Team Members:</h4>
                                <div className="space-y-2">
                                  {renderTeamMembers(application.team.members)}
                                </div>
                                
                                <div className="mt-4 text-sm text-gray-700">
                                  <h4 className="font-medium mb-1">Description:</h4>
                                  <p>{application.team.description || 'No description provided.'}</p>
                                </div>
                                
                                <button
                                  onClick={() => setExpandedTeam(null)}
                                  className="mt-4 text-blue-600 text-sm flex items-center"
                                >
                                  <ChevronUp size={16} className="mr-1" />
                                  Hide Details
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setExpandedTeam(application._id)}
                                className="mt-3 text-blue-600 text-sm flex items-center"
                              >
                                <ChevronDown size={16} className="mr-1" />
                                View Team Details
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </TabPanel>
        
        <TabPanel>
          {/* Registered Teams Tab */}
          <div className="bg-[#1A1A1A] rounded-xl shadow-lg overflow-hidden border border-gray-800">
            <div className="px-6 py-4 border-b border-gray-800">
              <h2 className="font-bold text-lg text-white">Registered Teams</h2>
            </div>
            
            <div className="p-6">
              {registeredTeams.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No registered teams yet
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {registeredTeams.map(team => (
                    <div key={team._id} className="border border-gray-800 rounded-lg overflow-hidden bg-[#1A1A1A] hover:shadow-lg transition-shadow">
                      <div className="px-4 py-3 bg-[#2A2A2A] border-b border-gray-800 flex justify-between items-center">
                        <h3 className="font-semibold text-white">
                          {team.teamName}
                        </h3>
                        <div className="flex items-center">
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full flex items-center">
                            <Users size={12} className="mr-1" />
                            {team.members.length} members
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <h4 className="text-sm font-medium text-gray-400 mb-2">Team Members:</h4>
                        <div className="space-y-2">
                          {team.members.slice(0, 2).map(member => (
                            <div key={member._id} className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8">
                                <img 
                                  className="h-8 w-8 rounded-full object-cover" 
                                  src={member?.profile_picture || PLACEHOLDER_IMAGE} 
                                  alt={(member?.name || '?').substring(0,1)} 
                                  onError={(e) => { e.target.src = PLACEHOLDER_IMAGE }}
                                />
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium flex items-center text-white">
                                  {member?.name || 'Russel Daniel'}
                                  {member?.isLeader && (
                                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                      <Award size={12} className="mr-1" />
                                      Leader
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-gray-400">{member?.email || 'No email'}</div>
                              </div>
                            </div>
                          ))}
                          
                          {team.members.length > 2 && (
                            <div className="text-sm text-[#E8C848] mt-1">
                              +{team.members.length - 2} more members
                            </div>
                          )}
                        </div>
                        
                        {expandedTeam === team._id ? (
                          <div className="mt-3 pt-3 border-t border-gray-800">
                            <div className="space-y-2">
                              {renderTeamMembers(team.members.slice(2))}
                            </div>
                            
                            <button
                              onClick={() => setExpandedTeam(null)}
                              className="mt-3 text-[#E8C848] text-sm flex items-center"
                            >
                              <ChevronUp size={16} className="mr-1" />
                              Show Less
                            </button>
                          </div>
                        ) : (
                          team.members.length > 2 && (
                            <button
                              onClick={() => setExpandedTeam(team._id)}
                              className="mt-3 text-[#E8C848] text-sm flex items-center"
                            >
                              <ChevronDown size={16} className="mr-1" />
                              View All Members
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabPanel>
      </Tabs>
      
      {/* Create Team Modal */}
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
          availableIndividuals={individuals.approved.filter(i => !i.assignedToTempTeam)}
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