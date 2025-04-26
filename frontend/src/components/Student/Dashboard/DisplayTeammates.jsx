import React, { useState, useEffect } from 'react';
import { Users, ChevronRight, MessageCircle, Search, Filter, User, BookOpen, MapPin, 
  Briefcase, Code, X, Send, Paperclip, ChevronLeft, Calendar, Award, Clock, UserPlus, Check } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../../../context/UserContext';
import ChatModal from '../ChatModal';
import StudentPlaceholder from "../../../public/student_placeholder.png";

const DisplayTeammates = ({ userData: propUserData, isFullPage = false, isRecommendations = false }) => {
  const navigate = useNavigate();
  const { userData: contextUserData } = useUser();
  const userData = propUserData || contextUserData;

  const [teammates, setTeammates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [purposeFilter, setPurposeFilter] = useState('all');
  
  // Chat modal state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeChatUser, setActiveChatUser] = useState(null);
  
  // Team invitation state
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [selectedTeammateToInvite, setSelectedTeammateToInvite] = useState(null);
  const [teamsList, setTeamsList] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [inviteRole, setInviteRole] = useState('Member');
  const [inviteMessage, setInviteMessage] = useState('');
  const [inviteStatus, setInviteStatus] = useState({ type: '', message: '' });
  
  // Track which teammates have already been invited to which teams
  const [invitedTeammates, setInvitedTeammates] = useState({});
  
  // Function to handle opening teammate profile
  const handleViewProfile = (teammateId) => {
    if(isRecommendations){
      navigate(`/student/teammate/${teammateId.$oid}`);
    } else {
      navigate(`/student/teammate/${teammateId}`);
    }
  };

  // Function to handle opening chat
  const handleOpenChat = (teammate) => {
    console.log("Opening chat with teammate:", teammate);
    if (teammate && teammate._id) {
      setActiveChatUser(teammate);
      setIsChatOpen(true);
    } else {
      console.error("Cannot open chat: teammate is missing _id", teammate);
    }
  };

  // Function to handle closing chat
  const handleCloseChat = () => {
    setIsChatOpen(false);
    setActiveChatUser(null);
  };

  // Function to fetch teams where user is a leader
  useEffect(() => {
    const fetchUserTeams = async () => {
      if (!userData || !userData._id) return;
      
      try {
        const response = await axios.get(
          `http://localhost:4000/api/teams/my-teams?studentId=${userData._id}`
        );
        
        if (response.data && response.data.success) {
          const leaderTeams = response.data.teams.filter(team => team.isLeader);
          setTeamsList(leaderTeams);
          if (leaderTeams.length > 0) {
            setSelectedTeamId(leaderTeams[0]._id);
          }
        }
      } catch (err) {
        console.error("Error fetching user teams:", err);
      }
    };
    
    fetchUserTeams();
  }, [userData]);

  // Function to fetch pending invitations
  useEffect(() => {
    const fetchPendingInvitations = async () => {
      if (!teamsList.length || !userData || !userData._id) return;
      
      try {
        // Create a map to track which teammates are already invited to which teams
        const invitationMap = {};
        
        // For each team where user is leader, get pending invitations
        await Promise.all(teamsList.map(async (team) => {
          const response = await axios.get(
            `http://localhost:4000/api/teams/${team._id}/invitations?status=pending`
          );
          
          if (response.data && response.data.success && Array.isArray(response.data.invitations)) {
            // For each invitation, mark the student as invited to this team
            response.data.invitations.forEach(invitation => {
              if (invitation.studentId) {
                // If we don't have an entry for this teammate yet, create one
                if (!invitationMap[invitation.studentId]) {
                  invitationMap[invitation.studentId] = [];
                }
                
                // Add this team to the list of teams the teammate is invited to
                invitationMap[invitation.studentId].push({
                  teamId: team._id,
                  teamName: team.name
                });
              }
            });
          }
        }));
        
        setInvitedTeammates(invitationMap);
      } catch (err) {
        console.error("Error fetching pending invitations:", err);
      }
    };
    
    fetchPendingInvitations();
  }, [teamsList, userData]);

  // Function to check if a teammate has already been invited to a team
  const isAlreadyInvited = (teammateId, teamId) => {
    if (!invitedTeammates[teammateId]) return false;
    return invitedTeammates[teammateId].some(team => team.teamId === teamId);
  };

  // Function to check if a teammate has already been invited to any team
  const hasAnyInvitation = (teammateId) => {
    return invitedTeammates[teammateId] && invitedTeammates[teammateId].length > 0;
  };

  // Function to get the team name for an already invited teammate
  const getInvitedTeamName = (teammateId) => {
    if (!invitedTeammates[teammateId] || invitedTeammates[teammateId].length === 0) {
      return null;
    }
    
    // If invited to multiple teams, show first one with "+ more"
    if (invitedTeammates[teammateId].length > 1) {
      return `${invitedTeammates[teammateId][0].teamName} + ${invitedTeammates[teammateId].length - 1} more`;
    }
    
    return invitedTeammates[teammateId][0].teamName;
  };

  // Function to open invite modal for a specific teammate
  const handleOpenInviteModal = (teammate) => {
    setSelectedTeammateToInvite(teammate);
    setIsInviteModalOpen(true);
    setInviteMessage(`Hi ${teammate.name}, I'd like to invite you to join my team.`);
  };

  // Function to send invitation
  const handleSendInvite = async (e) => {
    e.preventDefault();
    
    if (!selectedTeamId || !selectedTeammateToInvite || !userData) {
      setInviteStatus({
        type: 'error',
        message: 'Missing required information'
      });
      return;
    }
    
    // Check if already invited to this team
    if (isAlreadyInvited(selectedTeammateToInvite._id, selectedTeamId)) {
      setInviteStatus({
        type: 'error',
        message: `${selectedTeammateToInvite.name} has already been invited to this team`
      });
      return;
    }
    
    try {
      setInviteStatus({ type: 'loading', message: 'Sending invitation...' });
      if(isRecommendations){
        selectedTeamId = selectedTeamId.$oid;
      }
      else{
        selectedTeamId = selectedTeamId;
      }
      const response = await axios.post(
        'http://localhost:4000/api/teams/invite',
        {
          teamId: selectedTeamId,
          studentId: selectedTeammateToInvite._id,
          role: inviteRole,
          message: inviteMessage,
          inviterId: userData._id
        }
      );
      
      if (response.data && response.data.success) {
        setInviteStatus({
          type: 'success',
          message: `Invitation sent to ${selectedTeammateToInvite.name}`
        });
        
        // Update the invitedTeammates state to include this new invitation
        setInvitedTeammates(prev => {
          const updated = {...prev};
          
          if (!updated[selectedTeammateToInvite._id]) {
            updated[selectedTeammateToInvite._id] = [];
          }
          
          // Find the team info
          const teamInfo = teamsList.find(t => t._id === selectedTeamId);
          
          // Add the new invitation
          updated[selectedTeammateToInvite._id].push({
            teamId: selectedTeamId,
            teamName: teamInfo?.name || 'Your team'
          });
          
          return updated;
        });
        
        // Reset and close modal after success
        setTimeout(() => {
          setIsInviteModalOpen(false);
          setInviteStatus({ type: '', message: '' });
          setSelectedTeammateToInvite(null);
          setInviteRole('Member');
          setInviteMessage('');
        }, 2000);
      } else {
        setInviteStatus({
          type: 'error',
          message: response.data?.message || 'Failed to send invitation'
        });
      }
    } catch (err) {
      console.error("Error sending invitation:", err);
      setInviteStatus({
        type: 'error',
        message: err.response?.data?.message || 'Failed to send invitation'
      });
    }
  };

  useEffect(() => {
    const fetchTeammates = async () => {
      try {
        setLoading(true);
        
        // Get current user from localStorage
        const currentUser = JSON.parse(localStorage.getItem("user")) || {};
        
        // Get user ID and email
        const uid = userData?.firebaseUID || currentUser?.uid || '';
        
        // Build query parameters
        let queryParams = new URLSearchParams();
        
        if (purposeFilter !== 'all') {
          queryParams.append('purpose', purposeFilter);
        }
        
        if (skillFilter) {
          queryParams.append('skills', skillFilter);
        }
        
        // Add exclusion parameters for all-students endpoint
        queryParams.append('excludeUID', uid);
        queryParams.append('excludeEmail', currentUser.email);
        
        // Determine which endpoint to use
        let endpoint;
        if (isRecommendations) {
          endpoint = `http://localhost:8000/api/recommend_students/`;
        } else {
          endpoint = `http://localhost:4000/api/student/all-students/`;
        }
        
        // Add query parameters to endpoint if any exist
        if (queryParams.toString()) {
          endpoint += `?${queryParams.toString()}`;
        }
  
        let response;
        if (isRecommendations) {
          response = await axios.post(endpoint, {
            userData: userData
          });
        } else {
          response = await axios.get(endpoint);
        }
        
        // Process the response based on its structure
        if (isRecommendations && Array.isArray(response.data?.teammates)) {
          setTeammates(response.data.teammates);
        } else if (!isRecommendations && response.data?.students) {
          // Handle the all-students response format
          setTeammates(response.data.students);
        } else if (Array.isArray(response.data)) {
          setTeammates(response.data);
        } else {
          console.warn("Unexpected response format:", response.data);
          setTeammates([]);
        }
      } catch (err) {
        console.error("Error fetching teammates:", err);
        setError(`Failed to load teammates: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTeammates();
  }, [userData, isRecommendations, purposeFilter, skillFilter]);
  
  // Filter teammates based on search term
  const filteredTeammates = teammates.filter(teammate => {
    const matchesSearch = searchTerm === '' || 
      teammate.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teammate.education?.institution?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teammate.education?.degree?.toLowerCase().includes(searchTerm.toLowerCase());
      
    return matchesSearch;
  });

  // Helper function to get purpose icon and color
  const getPurposeDisplay = (purpose) => {
    switch(purpose) {
      case 'Project':
        return {
          icon: <Code size={12} className="mr-1 text-indigo-500" />,
          text: 'Looking for project teammates',
          bgColor: 'bg-indigo-50',
          textColor: 'text-indigo-700'
        };
      case 'Hackathon':
        return {
          icon: <Calendar size={12} className="mr-1 text-purple-500" />,
          text: 'Looking for hackathon team',
          bgColor: 'bg-purple-50',
          textColor: 'text-purple-700'
        };
      case 'Both':
        return {
          icon: <Users size={12} className="mr-1 text-emerald-500" />,
          text: 'Open to Projects & Hackathons',
          bgColor: 'bg-emerald-50',
          textColor: 'text-emerald-700'
        };
      default:
        return {
          icon: <User size={12} className="mr-1 text-gray-500" />,
          text: 'Looking for teammates',
          bgColor: 'bg-gray-50',
          textColor: 'text-gray-700'
        };
    }
  };

  // Team Invitation Modal component
  const InviteToTeamModal = () => (
    <div className="fixed inset-0 bg-[#121212]/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#1A1A1A] rounded-lg shadow-lg p-6 w-full max-w-md border border-gray-800 hover:border-[#E8C848]/30 transition-all duration-300">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg flex items-center text-white">
            <UserPlus className="text-[#E8C848] mr-2" size={20} />
            Invite to Team
          </h3>
          <button 
            onClick={() => {
              setIsInviteModalOpen(false);
              setInviteStatus({ type: '', message: '' });
            }}
            className="text-gray-400 hover:text-[#E8C848] transition-all duration-300"
          >
            <X size={20} />
          </button>
        </div>
        
        {selectedTeammateToInvite && (
          <div className="flex items-center mb-4 p-3 bg-[#121212] rounded-lg">
            <img 
              src={selectedTeammateToInvite.profile_picture || StudentPlaceholder} 
              alt={selectedTeammateToInvite.name} 
              className="w-10 h-10 rounded-full mr-3"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/40?text=👤';
              }}
            />
            <div>
              <p className="font-medium text-white">{selectedTeammateToInvite.name}</p>
              <p className="text-sm text-gray-400">
                {selectedTeammateToInvite.education?.institution || 'Student'}
              </p>
              
              {/* Show if already invited */}
              {hasAnyInvitation(selectedTeammateToInvite._id) && (
                <div className="text-xs text-[#E8C848] flex items-center mt-1">
                  <Clock size={12} className="mr-1" />
                  <span>
                    Already invited to: {getInvitedTeamName(selectedTeammateToInvite._id)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
        
        {inviteStatus.message && (
          <div className={`mb-4 p-3 rounded-lg ${
            inviteStatus.type === 'success' 
              ? 'bg-[#E8C848]/10 text-[#E8C848]' 
              : inviteStatus.type === 'error'
                ? 'bg-red-400/10 text-red-400'
                : 'bg-blue-400/10 text-blue-400'
          }`}>
            {inviteStatus.message}
          </div>
        )}
        
        <form onSubmit={handleSendInvite}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Team
            </label>
            {teamsList.length > 0 ? (
              <select
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                className="w-full p-2 border border-gray-800 rounded-lg focus:ring-2 focus:ring-[#E8C848] focus:border-[#E8C848] bg-[#121212] text-white"
                required
              >
                {teamsList.map(team => {
                  const isInvitedToThisTeam = selectedTeammateToInvite && 
                    isAlreadyInvited(selectedTeammateToInvite._id, team._id);
                  
                  return (
                    <option 
                      key={team._id} 
                      value={team._id}
                      disabled={isInvitedToThisTeam}
                    >
                      {team.name} ({team.memberCount}/{team.maxTeamSize} members)
                      {isInvitedToThisTeam ? ' - Already invited' : ''}
                    </option>
                  );
                })}
              </select>
            ) : (
              <p className="text-red-400 text-sm">You must be a team leader to invite members</p>
            )}
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Role
            </label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="w-full p-2 border border-gray-800 rounded-lg focus:ring-2 focus:ring-[#E8C848] focus:border-[#E8C848] bg-[#121212] text-white"
            >
              <option value="Member">Team Member</option>
              <option value="Developer">Developer</option>
              <option value="Designer">Designer</option>
              <option value="Project Manager">Project Manager</option>
              <option value="QA Tester">QA Tester</option>
              <option value="Technical Writer">Technical Writer</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Message
            </label>
            <textarea
              value={inviteMessage}
              onChange={(e) => setInviteMessage(e.target.value)}
              className="w-full p-2 border border-gray-800 rounded-lg focus:ring-2 focus:ring-[#E8C848] focus:border-[#E8C848] bg-[#121212] text-white"
              rows={3}
              required
            />
          </div>
          
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsInviteModalOpen(false)}
              className="px-4 py-2 bg-gray-800 text-gray-400 rounded-lg hover:bg-gray-700 hover:text-white transition-all duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#E8C848] text-black rounded-lg hover:bg-[#E8C848]/90 disabled:opacity-70 flex items-center transition-all duration-300"
              disabled={
                inviteStatus.type === 'loading' || 
                teamsList.length === 0 || 
                (selectedTeammateToInvite && selectedTeamId && isAlreadyInvited(selectedTeammateToInvite._id, selectedTeamId))
              }
            >
              {inviteStatus.type === 'loading' ? 'Sending...' : (
                <>
                  <Send size={16} className="mr-2" />
                  Send Invitation
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
  
  // Handle loading state
  if (loading) {
    return (
      <div className={`bg-[#1A1A1A] rounded-xl shadow-lg p-6 ${isFullPage ? 'min-h-[600px]' : ''} border border-gray-800`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg flex items-center gap-2 text-white">
            <Users className="text-[#E8C848]" />
            {isRecommendations ? 'Team Suggestions' : 'Available Teammates'}
          </h3>
        </div>
        <div className="flex justify-center items-center h-40">
          <div className="animate-pulse flex flex-col items-center">
            <div className="rounded-full bg-[#121212] h-12 w-12 mb-2"></div>
            <div className="h-4 bg-[#121212] rounded w-24 mb-2"></div>
            <div className="h-3 bg-[#121212] rounded w-32"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error && teammates.length === 0) {
    return (
      <div className={`bg-[#1A1A1A] rounded-xl shadow-lg p-6 ${isFullPage ? 'min-h-[600px]' : ''} border border-gray-800`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg flex items-center gap-2 text-white">
            <Users className="text-[#E8C848]" />
            {isRecommendations ? 'Team Suggestions' : 'Available Teammates'}
          </h3>
        </div>
        <div className="flex justify-center items-center h-40">
          <div className="text-center">
            <p className="mb-2 text-gray-400">Failed to load teammate suggestions.</p>
            <p className="text-xs mb-3 text-red-400">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-[#E8C848]/10 text-[#E8C848] px-3 py-1 rounded-lg text-sm hover:bg-[#E8C848]/20 transition-all duration-300"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isFullPage ? 'bg-[#1A1A1A] rounded-xl shadow-lg p-6 min-h-[600px] border border-gray-800' : ''} relative`}>
      {/* Invite modal */}
      {isInviteModalOpen && <InviteToTeamModal />}
      
      {isFullPage && (
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg flex items-center gap-2 text-white">
            <Users className="text-[#E8C848]" />
            Available Teammates
          </h3>
        </div>
      )}
      
      {/* Search and filters - only shown in full page view */}
      {isFullPage && (
        <div className="mb-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or institution..."
                className="w-full pl-10 pr-4 py-2 border border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8C848] bg-[#121212] text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative w-full md:w-64">
              <Filter size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Filter by skills..."
                className="w-full pl-10 pr-4 py-2 border border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8C848] bg-[#121212] text-white"
                value={skillFilter}
                onChange={(e) => setSkillFilter(e.target.value)}
              />
            </div>
          </div>
          
          {/* Purpose filter buttons */}
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => setPurposeFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                purposeFilter === 'all' 
                  ? 'bg-[#E8C848]/10 text-[#E8C848]' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
              } transition-all duration-300`}
            >
              All
            </button>
            <button 
              onClick={() => setPurposeFilter('Project')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center ${
                purposeFilter === 'Project' 
                  ? 'bg-indigo-500/10 text-indigo-500' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
              } transition-all duration-300`}
            >
              <Code size={14} className="mr-1" /> 
              Projects
            </button>
            <button 
              onClick={() => setPurposeFilter('Hackathon')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center ${
                purposeFilter === 'Hackathon' 
                  ? 'bg-purple-500/10 text-purple-500' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
              } transition-all duration-300`}
            >
              <Calendar size={14} className="mr-1" /> 
              Hackathons
            </button>
            <button 
              onClick={() => setPurposeFilter('Both')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center ${
                purposeFilter === 'Both' 
                  ? 'bg-[#E8C848]/10 text-[#E8C848]' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
              } transition-all duration-300`}
            >
              <Users size={14} className="mr-1" /> 
              Both
            </button>
          </div>
        </div>
      )}
      
      {/* Teammates list - in a row for recommendations, grid for full page */}
      {filteredTeammates.length > 0 ? (
        <div className={`grid gap-3 ${
          isRecommendations 
            ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4' 
            : isFullPage 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1 md:grid-cols-2'
        }`}>
          {filteredTeammates.map(teammate => {
            const teammateData = teammate.teammate || teammate;
            const purpose = teammateData.teammate_search?.purpose || 'Both';
            
            const purposeDisplay = purpose === 'Project' 
              ? { text: 'Project', bgColor: 'bg-indigo-500/10', textColor: 'text-indigo-500', icon: <Code size={10} className="mr-1" /> }
              : purpose === 'Hackathon'
                ? { text: 'Hackathon', bgColor: 'bg-purple-500/10', textColor: 'text-purple-500', icon: <Calendar size={10} className="mr-1" /> }
                : { text: 'Both', bgColor: 'bg-blue-500/10', textColor: 'text-blue-500', icon: <Users size={10} className="mr-1" /> };

            const isInvited = hasAnyInvitation(teammateData._id);
            
            return (
              <div 
                key={teammateData._id} 
                className="flex flex-col bg-[#121212] rounded-lg border border-gray-800 overflow-hidden h-[220px] hover:shadow-lg cursor-pointer transition-shadow text-xs"
                onClick={() => handleViewProfile(teammateData._id)}
              >
                <div className="p-3 flex items-start space-x-2 flex-1">
                  <img 
                    src={teammateData.profile_picture || StudentPlaceholder} 
                    alt={teammateData.name} 
                    className="w-10 h-10 rounded-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/40?text=👤';
                    }}
                  />
                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="font-semibold text-white truncate">{teammateData.name}</p>
                    <p className="text-gray-400 truncate">
                      {teammateData.education?.degree || 'Student'} at {teammateData.education?.institution || 'Unknown'}
                    </p>
                    
                    <div className={`flex items-center ${purposeDisplay.bgColor} ${purposeDisplay.textColor} px-2 py-0.5 rounded-full w-fit`}>
                      {purposeDisplay.icon}
                      <span>{purposeDisplay.text}</span>
                    </div>

                    {teammate.score && (
                      <div className="flex items-center text-[#E8C848]">
                        <span className="font-medium">Match: </span>
                        <span>{Math.round(teammate.score * 100)}%</span>
                      </div>
                    )}

                    {Array.isArray(teammateData.skills) && teammateData.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {teammateData.skills.slice(0, 2).map((skill, i) => (
                          <span key={i} className="bg-[#E8C848]/10 text-[#E8C848] px-1.5 py-0.5 rounded-full">
                            {skill}
                          </span>
                        ))}
                        {teammateData.skills.length > 2 && (
                          <span className="text-gray-400">+{teammateData.skills.length - 2}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="p-2 border-t border-gray-800 bg-[#121212]">
                  {teammateData.teammate_search?.desired_skills && teammateData.teammate_search.desired_skills.length > 0 && (
                    <div className="flex items-start text-gray-400 mb-1 truncate">
                      <Award size={10} className="mr-1 mt-0.5 flex-shrink-0" />
                      <span className="truncate">
                        Needs: {teammateData.teammate_search.desired_skills.slice(0, 2).join(', ')}
                        {teammateData.teammate_search.desired_skills.length > 2 && '...'}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex gap-1.5" onClick={e => e.stopPropagation()}>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenChat(teammateData);
                      }} 
                      className="bg-gray-800 text-gray-400 px-2 py-1 rounded text-xs flex items-center hover:bg-gray-700 hover:text-white transition-all duration-300"
                    >
                      <MessageCircle size={12} className="mr-1" />
                    </button>
                    
                    {teamsList.length > 0 && (
                      <>
                        {hasAnyInvitation(teammateData._id) ? (
                          <button
                            disabled
                            className="bg-[#E8C848]/10 text-[#E8C848] px-2 py-1 rounded text-xs flex items-center cursor-default"
                          >
                            <Check size={12} className="mr-1" />
                            Invited
                          </button>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenInviteModal(teammateData);
                            }}
                            className="bg-[#E8C848]/10 text-[#E8C848] px-2 py-1 rounded text-xs flex items-center hover:bg-[#E8C848]/20 transition-all duration-300"
                          >
                            <UserPlus size={12} className="mr-1" />
                            Invite
                          </button>
                        )}
                      </>
                    )}
                    
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewProfile(teammateData._id);
                      }}
                      className="bg-[#E8C848]/10 text-[#E8C848] px-2 py-1 rounded text-xs flex-1 hover:bg-[#E8C848]/20 transition-all duration-300"
                    >
                      Profile
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-10">
          <User size={48} className="mx-auto text-gray-800 mb-3" />
          <h4 className="text-lg font-medium text-gray-400 mb-1">No teammates found</h4>
          <p className="text-gray-400 text-sm">
            {isFullPage 
              ? purposeFilter !== 'all'
                ? purposeFilter === 'Both'
                  ? "No one is currently looking for both project and hackathon teammates."
                  : `No one is currently looking for ${purposeFilter.toLowerCase()} teammates.`
                : "Try adjusting your search or filter criteria."
              : "We're adding more teammate suggestions soon."}
          </p>
        </div>
      )}
      
      {/* Pagination or more teammates button - only in full page view */}
      {isFullPage && teammates.length > 8 && (
        <div className="mt-6 flex justify-center">
          <button className="bg-[#E8C848]/10 text-[#E8C848] px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#E8C848]/20 transition-all duration-300">
            Load More Teammates
          </button>
        </div>
      )}
      
      {/* Chat Modal */}
      <ChatModal 
        isOpen={isChatOpen} 
        onClose={handleCloseChat} 
        user={activeChatUser} 
        currentUser={userData}
      />
    </div>
  );
};

export default DisplayTeammates;