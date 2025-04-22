import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Users, ChevronLeft, Crown, UserPlus, Clipboard, 
  Check, X, ExternalLink, Mail, Shield, Clock, 
  User, Code, Plus, Trash, Settings, UserX, MessageCircle,
  Calendar
} from 'lucide-react';
import axios from 'axios';
import { useUser } from '../../../../../context/UserContext';
import TeamChatModal from './TeamChatModal';
import MentorChatModal from './Mentor/MentorChatModal'; // Add this import
import { toast } from 'react-hot-toast';

const TeamDetails = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const {userData} = useUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('members');
  const [statusMessage, setStatusMessage] = useState({ message: '', type: '' });
  
  // Add state for chat modals
  const [isTeamChatOpen, setIsTeamChatOpen] = useState(false);
  const [isMentorChatOpen, setIsMentorChatOpen] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState(null);

  // Fetch team details
  useEffect(() => {
    const fetchTeamDetails = async () => {
      try {
        setLoading(true);
        // Use userData directly instead of token
        const studentId = userData?._id;
        const response = await axios.get(
          `http://localhost:4000/api/teams/${teamId}?studentId=${studentId || ''}`
        );
        console.log("Raw team data:", response.data);
        
        if (response.data && response.data.success) {
          console.log("Team mentor data:", response.data.team.mentor);
          console.log("Team applications:", response.data.team.applications);
          setTeam(response.data.team);
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
    
    if (teamId) {
      fetchTeamDetails();
    }
  }, [teamId, userData]);

  // Handle invitation response
  const handleRespondToInvitation = async (accept) => {
    try {
      setLoading(true);
      const studentId = userData?._id;
      
      const response = await axios.post(
        'http://localhost:4000/api/teams/respond-invitation',
        {
          teamId,
          invitationId: team.userStatus.invitationId,
          accept,
          studentId // Include student ID in the request
        }
      );
      
      if (response.data && response.data.success) {
        setStatusMessage({
          message: response.data.message,
          type: 'success'
        });
        
        // Refresh team data
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setStatusMessage({
          message: response.data?.message || 'Failed to process invitation',
          type: 'error'
        });
      }
    } catch (err) {
      console.error('Error responding to invitation:', err);
      setStatusMessage({
        message: err.response?.data?.message || 'Failed to process invitation',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Handle application response (for team leader)
  const handleRespondToApplication = async (applicationId, accept) => {
    try {
      setLoading(true);
      const responderId = userData?._id;
      
      const response = await axios.post(
        'http://localhost:4000/api/teams/respond-request',
        {
          teamId,
          requestId: applicationId,
          accept,
          responderId // Include responder ID in the request
        }
      );
      
      if (response.data && response.data.success) {
        setStatusMessage({
          message: response.data.message,
          type: 'success'
        });
        
        // Update applications list
        const updatedTeam = {...team};
        const appIndex = updatedTeam.joinRequests.findIndex(app => app._id === applicationId);
        if (appIndex !== -1) {
          updatedTeam.joinRequests[appIndex].status = accept ? 'accepted' : 'declined';
          setTeam(updatedTeam);
        }
      } else {
        setStatusMessage({
          message: response.data?.message || 'Failed to process application',
          type: 'error'
        });
      }
    } catch (err) {
      console.error('Error responding to application:', err);
      setStatusMessage({
        message: err.response?.data?.message || 'Failed to process application',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Handle applying to join team
  const handleApplyToJoin = async () => {
    try {
      setLoading(true);
      const studentId = userData?._id;
      
      const response = await axios.post(
        'http://localhost:4000/api/teams/apply',
        {
          teamId,
          message: `I would like to join ${team.name}.`,
          studentId // Include student ID in the request
        }
      );
      
      if (response.data && response.data.success) {
        setStatusMessage({
          message: response.data.message,
          type: 'success'
        });
        
        // Update user status
        const updatedTeam = {...team};
        updatedTeam.userStatus.hasRequestedToJoin = true;
        setTeam(updatedTeam);
      } else {
        setStatusMessage({
          message: response.data?.message || 'Failed to apply to team',
          type: 'error'
        });
      }
    } catch (err) {
      console.error('Error applying to team:', err);
      setStatusMessage({
        message: err.response?.data?.message || 'Failed to apply to team',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle toggle recruiting status
  const handleToggleRecruiting = async (newStatus) => {
    try {
      setLoading(true);
      const updaterId = userData?._id;
      
      const response = await axios.put(
        `http://localhost:4000/api/teams/${teamId}`,
        {
          isRecruiting: newStatus,
          updaterId
        }
      );
      
      if (response.data && response.data.success) {
        toast.success(`Team is now ${newStatus ? 'recruiting' : 'not recruiting'}`);
        // Update local state
        setTeam(prev => ({
          ...prev,
          isRecruiting: newStatus
        }));
      } else {
        toast.error(response.data?.message || 'Failed to update recruiting status');
      }
    } catch (err) {
      console.error('Error updating recruiting status:', err);
      toast.error(err.response?.data?.message || 'Failed to update recruiting status');
    } finally {
      setLoading(false);
    }
  };

  // Render members tab content
  const renderMembersTab = () => {
    return (
      <div>
        <div className="mb-6 flex flex-wrap justify-between items-center">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Users size={20} className="text-[#E8C848]" />
            Team Members
          </h3>
          
          {team?.userStatus?.isLeader && (
            <button
              onClick={() => navigate('/student/teammates')}
              className="bg-[#E8C848] text-[#121212] px-4 py-2 rounded-lg hover:bg-[#E8C848]/80 transition-all duration-300 flex items-center gap-2"
            >
              <UserPlus size={16} />
              Find Teammates
            </button>
          )}
        </div>
        
        <div className="space-y-4">
          {team?.members && team.members.length > 0 ? (
            team.members.map((member) => (
              <div
                key={member?._id || Math.random()}
                className="p-4 bg-[#242424] rounded-lg border border-gray-800 flex justify-between items-center"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#333333] flex items-center justify-center text-white overflow-hidden">
                    {member.profile_picture ? (
                      <img 
                        src={member.profile_picture} 
                        alt={member.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{member.name?.charAt(0).toUpperCase() || "?"}</span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-white">{member.name || 'Unknown'}</p>
                    <p className="text-sm text-gray-400">{member.email || 'No email'}</p>
                    {member.institution && (
                      <p className="text-xs text-gray-500 mt-1">{member.institution}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-1 rounded bg-[#E8C848]/10 text-[#E8C848]">
                        {member.status === 'active' ? 'Active Member' : 'Member'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-400">
              <p>No team members found.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render applications tab content
  const renderApplicationsTab = () => {
    return (
      <div>
        <div className="mb-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <UserPlus size={20} className="text-[#E8C848]" />
            Join Requests
          </h3>
          <p className="text-gray-400">Review and respond to requests to join your team</p>
        </div>
        
        {team.userStatus.isLeader ? (
          <div className="space-y-4">
            {team.joinRequests && team.joinRequests.length > 0 ? (
              team.joinRequests.map((request) => (
                <div
                  key={request._id}
                  className="p-4 bg-[#242424] rounded-lg border border-gray-800"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-white">{request.student.name}</p>
                      <p className="text-sm text-gray-400">{request.student.email}</p>
                      {request.message && (
                        <p className="mt-2 text-gray-300 bg-[#333333] p-3 rounded-lg">
                          "{request.message}"
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {request.status === 'pending' ? (
                        <>
                          <button
                            onClick={() => handleRespondToApplication(request._id, true)}
                            className="bg-green-900/20 text-green-400 p-2 rounded-lg hover:bg-green-900/30 transition-all duration-300"
                            disabled={loading}
                          >
                            <Check size={18} />
                          </button>
                          <button
                            onClick={() => handleRespondToApplication(request._id, false)}
                            className="bg-red-900/20 text-red-400 p-2 rounded-lg hover:bg-red-900/30 transition-all duration-300"
                            disabled={loading}
                          >
                            <X size={18} />
                          </button>
                        </>
                      ) : (
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            request.status === 'accepted'
                              ? 'bg-green-900/20 text-green-400'
                              : 'bg-red-900/20 text-red-400'
                          }`}
                        >
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                <p>No pending join requests.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <p>You don't have permission to view join requests.</p>
          </div>
        )}
        
        {/* Apply to join section for non-members */}
        {!team.userStatus.isMember && 
         !team.userStatus.isLeader && 
         !team.userStatus.hasRequestedToJoin && 
         team.isRecruiting && (
          <div className="mt-8 p-6 bg-[#242424] rounded-lg border border-gray-800">
            <h4 className="text-lg font-bold text-white mb-3">Apply to Join Team</h4>
            <p className="text-gray-400 mb-4">
              This team is currently recruiting. Submit a request to join!
            </p>
            <button
              onClick={handleApplyToJoin}
              className="bg-[#E8C848] text-[#121212] px-4 py-2 rounded-lg hover:bg-[#E8C848]/80 transition-all duration-300 flex items-center gap-2 mx-auto"
              disabled={loading}
            >
              <UserPlus size={16} />
              Apply to Join
            </button>
          </div>
        )}
        
        {team.userStatus.hasRequestedToJoin && (
          <div className="mt-8 p-6 bg-[#242424] rounded-lg border border-[#E8C848]/30">
            <h4 className="text-lg font-bold text-[#E8C848] mb-3">Application Pending</h4>
            <p className="text-gray-400">
              You have already requested to join this team. Please wait for the team leader to respond.
            </p>
          </div>
        )}
      </div>
    );
  };

  // Render projects tab content
  const renderProjectsTab = () => {
    return (
      <div>
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Code size={20} className="text-[#E8C848]" />
              Team Projects
            </h3>
            <p className="text-gray-400">View and manage your team's projects</p>
          </div>
          
          {(team.userStatus.isMember || team.userStatus.isLeader) && (
            <button
              onClick={() => navigate(`/student/team/${teamId}/projects`)}
              className="bg-[#E8C848] text-[#121212] px-4 py-2 rounded-lg hover:bg-[#E8C848]/80 transition-all duration-300 flex items-center gap-2"
            >
              <ExternalLink size={16} />
              View All Projects
            </button>
          )}
        </div>
        
        {team.projects && team.projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {team.projects.slice(0, 4).map((project) => (
              <div
                key={project._id}
                className="p-4 bg-[#242424] rounded-lg border border-gray-800 hover:border-[#E8C848]/30 transition-all duration-300"
              >
                <h4 className="font-bold text-white mb-1">{project.name}</h4>
                <p className="text-gray-400 text-sm mb-3">
                  {project.description.length > 100
                    ? project.description.substring(0, 100) + '...'
                    : project.description}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-xs bg-[#333333] text-gray-300 px-2 py-1 rounded">
                    {project.category}
                  </span>
                  <button
                    onClick={() => navigate(`/student/project/${project._id}`)}
                    className="text-[#E8C848] hover:underline text-sm"
                  >
                    View Project
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <p>No projects found.</p>
          </div>
        )}
      </div>
    );
  };

  // Render mentors tab content
  const renderMentorsTab = () => {
    console.log("Rendering mentors tab with team data:", team);
    
    // Check if there's a mentor directly in the team object
    const assignedMentor = team.mentor ? [team.mentor] : [];
    
    // Also check for accepted mentor applications
    const acceptedMentorApplications = team.applications ? 
      team.applications.filter(app => app.status === "accepted").map(app => ({
        _id: app.mentorId,
        name: app.mentorName,
        email: app.mentorEmail,
        profile_picture: app.mentorProfilePicture,
        expertise: app.mentorExpertise?.technical_skills || [],
        focus_areas: app.mentorFocusAreas || [],
        company: app.mentorRole?.company || 'Unknown Company'
      })) : [];
    
    console.log("Assigned mentor:", assignedMentor);
    console.log("Accepted applications:", acceptedMentorApplications);
    
    // Combine both sources of mentors
    const allMentors = [...assignedMentor, ...acceptedMentorApplications];
    
    console.log("All mentors:", allMentors);
    
    return (
      <div>
        <div className="mb-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Shield size={20} className="text-[#E8C848]" />
            Team Mentor
          </h3>
          <p className="text-gray-400 mb-4">Get guidance from industry experts</p>
        </div>
        
        {allMentors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allMentors.map((mentor) => (
              <div
                key={mentor._id}
                className="p-4 bg-[#242424] rounded-lg border border-gray-800"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#333333] flex items-center justify-center text-white overflow-hidden">
                    {mentor.profile_picture ? (
                      <img 
                        src={mentor.profile_picture} 
                        alt={mentor.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{mentor.name?.charAt(0).toUpperCase() || "M"}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-white">{mentor.name}</p>
                    <p className="text-sm text-gray-400">{mentor.email}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      {mentor.company && (
                        <span className="text-xs bg-[#E8C848]/20 text-[#E8C848] px-2 py-1 rounded">
                          {mentor.company}
                        </span>
                      )}
                      
                      {mentor.focus_areas?.slice(0, 2).map((area, index) => (
                        <span key={index} className="text-xs bg-[#333333] text-gray-300 px-2 py-1 rounded">
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedMentor(mentor);
                      setIsMentorChatOpen(true);
                    }}
                    className="px-3 py-1.5 bg-[#E8C848]/10 hover:bg-[#E8C848]/20 text-[#E8C848] rounded-full flex items-center text-sm transition-all duration-300"
                  >
                    <MessageCircle size={14} className="mr-1" />
                    Chat
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <p>No mentors assigned to this team yet.</p>
            {team.userStatus.isLeader && (
              <button
                onClick={() => navigate(`/student/team/${teamId}/mentor`)}
                className="mt-4 bg-[#333333] text-[#E8C848] px-4 py-2 rounded-lg hover:bg-[#E8C848]/10 transition-all duration-300"
              >
                Find Mentors
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  // Render recruiting options
  const renderRecruitingOptions = () => {
    return (
      <div className="mt-8 p-6 bg-[#242424] rounded-lg border border-gray-800">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="text-lg font-bold text-white mb-1">Team Recruiting Status</h4>
            <p className="text-gray-400">
              Control whether your team appears in search results and allows applications
            </p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <button
              onClick={() => handleToggleRecruiting(!team.isRecruiting)}
              className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                team.isRecruiting
                  ? 'bg-green-900/20 text-green-400 hover:bg-green-900/30'
                  : 'bg-red-900/20 text-red-400 hover:bg-red-900/30'
              }`}
            >
              {team.isRecruiting ? 'Currently Recruiting' : 'Not Recruiting'}
            </button>
            
            {team.isRecruiting && (
              <button
                onClick={() => navigate('/student/teammates')}
                className="bg-[#E8C848]/10 text-[#E8C848] px-4 py-2 rounded-lg hover:bg-[#E8C848]/20 transition-all duration-300 flex items-center gap-2"
              >
                <UserPlus size={16} />
                Find Teammates
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading && !team) {
    return (
      <div className="min-h-screen w-full bg-[#121212] p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-[#1A1A1A] rounded w-1/4 mb-4"></div>
            <div className="h-40 bg-[#1A1A1A] rounded mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="h-60 bg-[#1A1A1A] rounded"></div>
              <div className="h-60 bg-[#1A1A1A] rounded"></div>
              <div className="h-60 bg-[#1A1A1A] rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen w-full bg-[#121212] p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center mb-6">
            <button
              onClick={() => navigate('/student/hero')}
              className="p-2 rounded-full bg-[#1A1A1A] hover:bg-[#E8C848]/10 text-[#E8C848] transition-all duration-300"
            >
              <ChevronLeft size={20} />
            </button>
            <h2 className="text-2xl font-bold text-white ml-2">Team Details</h2>
          </div>
          <div className="bg-red-900/20 text-red-400 p-4 rounded-lg border border-red-900/50">
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-3 bg-red-900/30 text-red-400 px-4 py-2 rounded-lg hover:bg-red-900/40 transition-all duration-300"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#121212]">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate('/student/hero')}
            className="p-2 rounded-full bg-[#1A1A1A] hover:bg-[#E8C848]/10 text-[#E8C848] transition-all duration-300"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex-1 ml-2">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              {team.name}
              {team.userStatus.isLeader && (
                <Crown size={18} className="text-[#E8C848]" />
              )}
            </h2>
            <p className="text-gray-400">Created {new Date(team.createdAt).toLocaleDateString()}</p>
          </div>
          <div className="flex items-center gap-3">
            {(team.userStatus.isMember || team.userStatus.isLeader) && (
              <button
                onClick={() => setIsTeamChatOpen(true)}
                className="bg-[#E8C848]/10 text-[#E8C848] px-4 py-2 rounded-lg hover:bg-[#E8C848]/20 transition-all duration-300 flex items-center gap-2"
              >
                <MessageCircle size={16} />
                Team Chat
              </button>
            )}
            {team.userStatus.isLeader && (
              <button
                onClick={() => navigate(`/student/team/${teamId}/settings`)}
                className="bg-[#1A1A1A] text-[#E8C848] p-2 rounded-lg hover:bg-[#E8C848]/10 transition-all duration-300"
              >
                <Settings size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Status Messages */}
        {statusMessage.message && (
          <div className={`mb-6 p-4 rounded-lg ${
            statusMessage.type === 'success' 
              ? 'bg-green-900/20 text-green-400 border border-green-900/50' 
              : 'bg-red-900/20 text-red-400 border border-red-900/50'
          }`}>
            {statusMessage.message}
          </div>
        )}

        {/* Team Status Banner */}
        {!team.isRecruiting && (
          <div className="mb-6 p-4 bg-[#1A1A1A] rounded-lg border border-gray-800">
            <p className="text-gray-400 flex items-center gap-2">
              <Users size={18} className="text-[#E8C848]" />
              This team is not currently recruiting new members
            </p>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-6 bg-[#1A1A1A] p-1 rounded-lg border border-gray-800">
          {['members', 'applications', 'projects', 'mentors'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                activeTab === tab
                  ? 'bg-[#E8C848] text-[#121212]'
                  : 'text-gray-400 hover:bg-[#E8C848]/10 hover:text-[#E8C848]'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-[#1A1A1A] rounded-lg border border-gray-800 p-6">
          {activeTab === 'members' && renderMembersTab()}
          {activeTab === 'applications' && renderApplicationsTab()}
          {activeTab === 'projects' && renderProjectsTab()}
          {activeTab === 'mentors' && renderMentorsTab()}
        </div>

        {/* Recruiting Options (only for team leader) */}
        {team.userStatus.isLeader && renderRecruitingOptions()}

        {/* Team Chat Modal */}
        {isTeamChatOpen && (
          <TeamChatModal
            isOpen={isTeamChatOpen}
            onClose={() => setIsTeamChatOpen(false)}
            team={team}
            currentUser={userData}
          />
        )}

        {/* Mentor Chat Modal */}
        {isMentorChatOpen && selectedMentor && (
          <MentorChatModal
            isOpen={isMentorChatOpen}
            onClose={() => {
              setIsMentorChatOpen(false);
              setSelectedMentor(null);
            }}
            mentor={selectedMentor}
            team={team}
            currentUser={userData}
          />
        )}

        {/* Show invitation response options if user has invitation */}
        {team.userStatus.hasInvitation && (
          <div className="mt-6 p-6 bg-[#242424] rounded-lg border border-[#E8C848]/30">
            <h3 className="text-xl font-bold text-[#E8C848] mb-4">You're Invited!</h3>
            <p className="text-white mb-6">
              You've been invited to join {team.name} as a {team.userStatus.invitationRole}.
            </p>
            
            {team.userStatus.invitationMessage && (
              <div className="bg-[#333333] p-4 rounded-lg mb-6 border border-gray-700">
                <p className="text-gray-300 italic">"{team.userStatus.invitationMessage}"</p>
              </div>
            )}
            
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => handleRespondToInvitation(true)}
                className="bg-green-900/20 text-green-400 px-6 py-3 rounded-lg hover:bg-green-900/30 transition-all duration-300 flex items-center gap-2"
                disabled={loading}
              >
                <Check size={18} />
                Accept Invitation
              </button>
              <button
                onClick={() => handleRespondToInvitation(false)}
                className="bg-red-900/20 text-red-400 px-6 py-3 rounded-lg hover:bg-red-900/30 transition-all duration-300 flex items-center gap-2"
                disabled={loading}
              >
                <X size={18} />
                Decline
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamDetails;