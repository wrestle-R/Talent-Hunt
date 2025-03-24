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
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Member');
  const [inviteMessage, setInviteMessage] = useState('');
  
  // Add state for team chat modal
  const [isTeamChatOpen, setIsTeamChatOpen] = useState(false);

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
        
        if (response.data && response.data.success) {
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
  
  // Handle sending invitation
  const handleSendInvitation = async (e) => {
    e.preventDefault();
    
    if (!inviteEmail.trim()) {
      setStatusMessage({
        message: 'Please enter an email address',
        type: 'error'
      });
      return;
    }
    
    try {
      setLoading(true);
      const inviterId = userData?._id;
      
      // First, find the student ID by email
      const studentResponse = await axios.get(
        `http://localhost:4000/api/students/by-email/${inviteEmail.trim()}`
      );
      
      if (!studentResponse.data || !studentResponse.data.success) {
        setStatusMessage({
          message: 'Student not found with this email',
          type: 'error'
        });
        setLoading(false);
        return;
      }
      
      const studentId = studentResponse.data.student._id;
      
      // Send the invitation
      const response = await axios.post(
        'http://localhost:4000/api/teams/invite',
        {
          teamId,
          studentId,
          role: inviteRole,
          message: inviteMessage || `You are invited to join ${team.name} as a ${inviteRole}`,
          inviterId // Include inviter ID in the request
        }
      );
      
      if (response.data && response.data.success) {
        setStatusMessage({
          message: response.data.message,
          type: 'success'
        });
        
        // Clear form
        setInviteEmail('');
        setInviteMessage('');
        setInviteRole('Member');
        
        // Go back to members tab
        setActiveTab('members');
      } else {
        setStatusMessage({
          message: response.data?.message || 'Failed to send invitation',
          type: 'error'
        });
      }
    } catch (err) {
      console.error('Error sending invitation:', err);
      setStatusMessage({
        message: err.response?.data?.message || 'Failed to send invitation',
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

  if (loading && !team) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-40 bg-gray-200 rounded mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-60 bg-gray-200 rounded"></div>
            <div className="h-60 bg-gray-200 rounded"></div>
            <div className="h-60 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate('/student/hero')}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors mr-4"
          >
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-2xl font-bold text-gray-800">Team Details</h2>
        </div>
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-3 bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200"
          >
            Try Again
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
          onClick={() => navigate('/student/hero')}
          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors mr-4"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            {team.name}
            {team.userStatus.isLeader && (
              <Crown size={18} className="text-yellow-500" />
            )}
          </h2>
          <p className="text-gray-500">{team.members.length}/{team.maxTeamSize} members</p>
        </div>
        
        {/* Show different actions based on user relationship */}
        <div className="flex gap-2">
          {/* Add Team Chat button for team members and leaders */}
          {(team.userStatus.isMember || team.userStatus.isLeader) && (
            <>
              <button 
                onClick={() => setIsTeamChatOpen(true)}
                className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg hover:bg-indigo-200 flex items-center gap-2"
              >
                <MessageCircle size={16} />
                Team Chat
              </button>
              
              {/* Projects button for team members and leaders */}
              <button 
                onClick={() => navigate(`/student/team/${teamId}/projects`)}
                className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg hover:bg-indigo-200 flex items-center gap-2"
              >
                <Code size={16} />
                Projects
              </button>
            </>
          )}
          
          {team.userStatus.isLeader ? (
            <div className="flex gap-2">
              <button 
                onClick={() => navigate(`/student/team/manage/${team._id}`)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
              >
                <Settings size={16} />
                Manage Team
              </button>
              {team.isRecruiting ? (
                <button 
                  onClick={() => handleToggleRecruiting(false)}
                  className="bg-green-100 text-green-700 px-4 py-2 rounded-lg hover:bg-green-200 flex items-center gap-2"
                >
                  <UserPlus size={16} />
                  Recruiting
                </button>
              ) : (
                <button 
                  onClick={() => handleToggleRecruiting(true)}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center gap-2"
                >
                  <UserPlus size={16} />
                  Start Recruiting
                </button>
              )}
            </div>
          ) : team.userStatus.isMember ? (
            <button className="bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 flex items-center gap-2">
              <UserX size={16} />
              Leave Team
            </button>
          ) : team.userStatus.invitationStatus === 'pending' ? (
            <div className="flex gap-2">
              <button
                onClick={() => handleRespondToInvitation(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
                disabled={loading}
              >
                <Check size={16} />
                Accept Invitation
              </button>
              <button
                onClick={() => handleRespondToInvitation(false)}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2"
                disabled={loading}
              >
                <X size={16} />
                Decline
              </button>
            </div>
          ) : team.userStatus.hasRequestedToJoin ? (
            <button
              disabled
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Clock size={16} />
              Application Pending
            </button>
          ) : (
            <button
              onClick={handleApplyToJoin}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
              disabled={loading}
            >
              <UserPlus size={16} />
              Apply to Join
            </button>
          )}
        </div>
      </div>

      {/* Status Messages */}
      {statusMessage.message && (
        <div className={`mb-6 p-3 rounded-lg ${
          statusMessage.type === 'success' 
            ? 'bg-green-50 text-green-700' 
            : 'bg-red-50 text-red-700'
        }`}>
          {statusMessage.message}
        </div>
      )}

      {/* Team Join Code (only for leader) */}
      {team.userStatus.isLeader && team.joinCode && (
        <div className="mb-6 bg-indigo-50 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium text-indigo-700 mb-1">Team Join Code</h4>
              <p className="text-indigo-700 font-mono text-lg">{team.joinCode}</p>
              <p className="text-sm text-indigo-600 mt-1">
                Share this code with people you want to join your team directly
              </p>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(team.joinCode);
                setStatusMessage({
                  message: 'Join code copied to clipboard',
                  type: 'success'
                });
                setTimeout(() => setStatusMessage({ message: '', type: '' }), 3000);
              }}
              className="bg-indigo-100 text-indigo-700 px-3 py-2 rounded-md hover:bg-indigo-200 flex items-center gap-1"
            >
              <Clipboard size={14} />
              Copy
            </button>
          </div>
        </div>
      )}

      {/* Team description */}
      <div className="mb-6 bg-white rounded-xl shadow-md p-6">
        <h3 className="font-medium text-gray-800 mb-3">About this team</h3>
        <p className="text-gray-600 mb-4">
          {team.description || "No description provided."}
        </p>
        
        {team.techStack && team.techStack.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Tech Stack</h4>
            <div className="flex flex-wrap gap-2">
              {team.techStack.map((tech, idx) => (
                <span key={idx} className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tab navigation */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('members')}
            className={`pb-4 px-1 ${
              activeTab === 'members'
                ? 'border-b-2 border-indigo-600 text-indigo-600 font-medium'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <span className="flex items-center gap-2">
              <Users size={18} />
              Members ({team.members.length})
            </span>
          </button>
          
          {team.userStatus.isLeader && (
            <>
              <button
                onClick={() => setActiveTab('applications')}
                className={`pb-4 px-1 ${
                  activeTab === 'applications'
                    ? 'border-b-2 border-indigo-600 text-indigo-600 font-medium'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Mail size={18} />
                  Applications ({team.joinRequests?.filter(req => req.status === 'pending').length || 0})
                </span>
              </button>
              
              <button
                onClick={() => setActiveTab('invitations')}
                className={`pb-4 px-1 ${
                  activeTab === 'invitations'
                    ? 'border-b-2 border-indigo-600 text-indigo-600 font-medium'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <span className="flex items-center gap-2">
                  <UserPlus size={18} />
                  Invitations ({team.invitations?.filter(inv => inv.status === 'pending').length || 0})
                </span>
              </button>
            </>
          )}
          
          <button
            onClick={() => setActiveTab('projects')}
            className={`pb-4 px-1 ${
              activeTab === 'projects'
                ? 'border-b-2 border-indigo-600 text-indigo-600 font-medium'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <span className="flex items-center gap-2">
              <Code size={18} />
              Projects ({team.projects?.length || 0})
            </span>
          </button>
        </div>
      </div>

      {/* Tab content */}
      <div className="bg-white rounded-xl shadow-md p-6">
        {activeTab === 'members' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium text-lg">Team Members</h3>
              {team.userStatus.isLeader && (
                <button 
                  onClick={() => setActiveTab('invite')}
                  className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 text-sm"
                >
                  <Plus size={16} />
                  Invite Member
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {team.members.map(member => (
                <div key={member._id} className="flex items-start border border-gray-200 rounded-lg p-4">
                  <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-200 mr-3 flex-shrink-0">
                    {member.profile_picture ? (
                      <img 
                        src={member.profile_picture}
                        alt={member.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-indigo-100 text-indigo-600">
                        <User size={24} />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-800">
                          {member.name}
                          {member._id === team.leader._id && (
                            <Crown size={14} className="ml-1 text-yellow-500 inline" />
                          )}
                        </h4>
                        <p className="text-sm text-gray-500">{member.role}</p>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(member.joinedAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    {member.skills && member.skills.length > 0 && (
                      <div className="mt-2">
                        <div className="flex flex-wrap gap-1 mt-1">
                          {member.skills.slice(0, 3).map((skill, idx) => (
                            <span key={idx} className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-full">
                              {skill}
                            </span>
                          ))}
                          {member.skills.length > 3 && (
                            <span className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-full">
                              +{member.skills.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-3 flex justify-between items-center">
                      <button
                        onClick={() => navigate(`/student/profile/${member._id}`)}
                        className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center gap-1"
                      >
                        <ExternalLink size={14} />
                        View Profile
                      </button>
                      
                      {team.userStatus.isLeader && member._id !== team.leader._id && (
                        <button 
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to remove ${member.name} from the team?`)) {
                              axios.delete(`http://localhost:4000/api/teams/${teamId}/members/${member._id}`, {
                                data: { removerId: userData?._id }
                              })
                              .then(response => {
                                if (response.data.success) {
                                  toast.success("Member removed successfully");
                                  // Update UI by removing the member
                                  setTeam({
                                    ...team,
                                    members: team.members.filter(m => m._id !== member._id)
                                  });
                                } else {
                                  toast.error(response.data.message || "Failed to remove member");
                                }
                              })
                              .catch(err => {
                                console.error("Error removing member:", err);
                                toast.error(err.response?.data?.message || "Failed to remove member");
                              });
                            }
                          }}
                          className="text-red-600 hover:text-red-800 text-sm flex items-center gap-1"
                        >
                          <Trash size={14} />
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {activeTab === 'applications' && team.userStatus.isLeader && (
          <div>
            <h3 className="font-medium text-lg mb-4">Pending Applications</h3>
            
            {team.joinRequests && team.joinRequests.filter(req => req.status === 'pending').length > 0 ? (
              <div className="space-y-4">
                {team.joinRequests
                  .filter(req => req.status === 'pending')
                  .map(request => (
                    <div key={request._id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start">
                        <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-200 mr-3 flex-shrink-0">
                          {request.student.profile_picture ? (
                            <img 
                              src={request.student.profile_picture}
                              alt={request.student.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-indigo-100 text-indigo-600">
                              <User size={24} />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <div>
                              <h4 className="font-semibold text-gray-800">{request.student.name}</h4>
                              <p className="text-sm text-gray-500">
                                {request.student.institution || "No institution listed"}
                              </p>
                            </div>
                            <span className="text-xs text-gray-500">
                              {new Date(request.requestDate).toLocaleDateString()}
                            </span>
                          </div>
                          
                          {request.message && (
                            <div className="mt-2 bg-gray-50 p-3 rounded-md text-sm text-gray-700">
                              "{request.message}"
                            </div>
                          )}
                          
                          {request.student.skills && request.student.skills.length > 0 && (
                            <div className="mt-3">
                              <p className="text-xs text-gray-600 mb-1">Skills:</p>
                              <div className="flex flex-wrap gap-1">
                                {request.student.skills.map((skill, idx) => (
                                  <span key={idx} className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-full">
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          <div className="mt-4 flex justify-between items-center">
                            <button
                              onClick={() => navigate(`/student/profile/${request.student._id}`)}
                              className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center gap-1"
                            >
                              <ExternalLink size={14} />
                              View Profile
                            </button>
                            
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleRespondToApplication(request._id, false)}
                                className="bg-red-100 text-red-700 px-3 py-1 rounded-md hover:bg-red-200 text-sm flex items-center gap-1"
                                disabled={loading}
                              >
                                <X size={14} />
                                Decline
                              </button>
                              <button
                                onClick={() => handleRespondToApplication(request._id, true)}
                                className="bg-green-100 text-green-700 px-3 py-1 rounded-md hover:bg-green-200 text-sm flex items-center gap-1"
                                disabled={loading}
                              >
                                <Check size={14} />
                                Accept
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <Mail size={40} className="mx-auto text-gray-300 mb-2" />
                <p className="text-gray-500">No pending applications</p>
              </div>
            )}
            
            <h3 className="font-medium text-lg mt-8 mb-4">Past Applications</h3>
            
            {team.joinRequests && team.joinRequests.filter(req => req.status !== 'pending').length > 0 ? (
              <div className="space-y-3">
                {team.joinRequests
                  .filter(req => req.status !== 'pending')
                  .map(request => (
                    <div key={request._id} className="border border-gray-100 rounded-lg p-3 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-200 mr-3">
                            {request.student.profile_picture ? (
                              <img 
                                src={request.student.profile_picture}
                                alt={request.student.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center bg-indigo-100 text-indigo-600">
                                <User size={20} />
                              </div>
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-800">{request.student.name}</h4>
                            <p className="text-xs text-gray-500">
                              {new Date(request.requestDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          request.status === 'accepted' 
                            ? 'bg-green-50 text-green-700' 
                            : 'bg-red-50 text-red-700'
                        }`}>
                          {request.status === 'accepted' ? 'Accepted' : 'Declined'}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No past applications</p>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'invitations' && team.userStatus.isLeader && (
          <div>
            <h3 className="font-medium text-lg mb-4">Pending Invitations</h3>
            
            {team.invitations && team.invitations.filter(inv => inv.status === 'pending').length > 0 ? (
              <div className="space-y-4">
                {team.invitations
                  .filter(inv => inv.status === 'pending')
                  .map(invitation => (
                    <div key={invitation._id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start">
                        <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-200 mr-3 flex-shrink-0">
                          {invitation.recipient.profile_picture ? (
                            <img 
                              src={invitation.recipient.profile_picture}
                              alt={invitation.recipient.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-indigo-100 text-indigo-600">
                              <User size={24} />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <div>
                              <h4 className="font-semibold text-gray-800">{invitation.recipient.name}</h4>
                              <p className="text-sm text-gray-500">
                                Invited as {invitation.role || 'Member'}
                              </p>
                            </div>
                            <span className="text-xs text-gray-500">
                              Sent {new Date(invitation.sentAt).toLocaleDateString()}
                            </span>
                          </div>
                          
                          {invitation.message && (
                            <div className="mt-2 bg-gray-50 p-3 rounded-md text-sm text-gray-700">
                              "{invitation.message}"
                            </div>
                          )}
                          
                          <div className="mt-3 flex justify-between items-center">
                            <div className="text-xs text-yellow-700 bg-yellow-50 px-2 py-1 rounded-full flex items-center">
                              <Clock size={12} className="mr-1" />
                              Awaiting response
                            </div>
                            
                            <button
                              onClick={() => {
                                if (window.confirm(`Cancel invitation to ${invitation.recipient.name}?`)) {
                                  axios.post(`http://localhost:4000/api/teams/cancel-invitation`, {
                                    teamId,
                                    invitationId: invitation._id,
                                    cancelerId: userData?._id
                                  })
                                  .then(response => {
                                    if (response.data.success) {
                                      toast.success("Invitation cancelled");
                                      // Update UI
                                      setTeam({
                                        ...team,
                                        invitations: team.invitations.filter(inv => inv._id !== invitation._id)
                                      });
                                    } else {
                                      toast.error(response.data.message || "Failed to cancel invitation");
                                    }
                                  })
                                  .catch(err => {
                                    toast.error(err.response?.data?.message || "Failed to cancel invitation");
                                  });
                                }
                              }}
                              className="text-red-600 hover:text-red-800 text-sm flex items-center gap-1"
                            >
                              <X size={14} />
                              Cancel Invitation
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <UserPlus size={40} className="mx-auto text-gray-300 mb-2" />
                <p className="text-gray-500">No pending invitations</p>
              </div>
            )}
            
            <h3 className="font-medium text-lg mt-8 mb-4">Past Invitations</h3>
            
            {team.invitations && team.invitations.filter(inv => inv.status !== 'pending').length > 0 ? (
              <div className="space-y-3">
                {team.invitations
                  .filter(inv => inv.status !== 'pending')
                  .map(invitation => (
                    <div key={invitation._id} className="border border-gray-100 rounded-lg p-3 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-200 mr-3">
                            {invitation.recipient.profile_picture ? (
                              <img 
                                src={invitation.recipient.profile_picture}
                                alt={invitation.recipient.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center bg-indigo-100 text-indigo-600">
                                <User size={20} />
                              </div>
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-800">{invitation.recipient.name}</h4>
                            <p className="text-xs text-gray-500">
                              {new Date(invitation.sentAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          invitation.status === 'accepted' 
                            ? 'bg-green-50 text-green-700' 
                            : invitation.status === 'expired'
                              ? 'bg-gray-50 text-gray-700'
                              : 'bg-red-50 text-red-700'
                        }`}>
                          {invitation.status === 'accepted' 
                            ? 'Accepted' 
                            : invitation.status === 'expired'
                              ? 'Expired'
                              : 'Declined'}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No past invitations</p>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'invite' && team.userStatus.isLeader && (
          <div>
            <div className="flex items-center mb-4">
              <button
                onClick={() => setActiveTab('members')}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors mr-3"
              >
                <ChevronLeft size={18} />
              </button>
              <h3 className="font-medium text-lg">Invite New Member</h3>
            </div>
            
            <form onSubmit={handleSendInvitation} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  placeholder="Enter student's email"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="Member">Member</option>
                  <option value="Frontend Developer">Frontend Developer</option>
                  <option value="Backend Developer">Backend Developer</option>
                  <option value="Full Stack Developer">Full Stack Developer</option>
                  <option value="UI/UX Designer">UI/UX Designer</option>
                  <option value="Data Scientist">Data Scientist</option>
                  <option value="DevOps Engineer">DevOps Engineer</option>
                  <option value="Project Manager">Project Manager</option>
                  <option value="QA Engineer">QA Engineer</option>
                  <option value="Content Creator">Content Creator</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message (Optional)
                </label>
                <textarea
                  value={inviteMessage}
                  onChange={(e) => setInviteMessage(e.target.value)}
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  placeholder="Add a personal message to your invitation"
                ></textarea>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                  disabled={loading}
                >
                  <Mail size={16} />
                  {loading ? 'Sending...' : 'Send Invitation'}
                </button>
              </div>
            </form>
          </div>
        )}
        
        {activeTab === 'projects' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium text-lg">Team Projects</h3>
              {team.userStatus.isLeader && (
                <button 
                  onClick={() => navigate(`/student/team/${teamId}/projects`)}
                  className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 text-sm"
                >
                  <Settings size={16} />
                  Manage Projects
                </button>
              )}
            </div>
            
            {team.projects && team.projects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {team.projects.map(project => (
                  <div key={project._id} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-1">{project.name}</h4>
                    
                    <div className="flex items-center mb-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        project.status === 'completed' 
                          ? 'bg-green-50 text-green-700' 
                          : project.status === 'in-progress'
                            ? 'bg-indigo-50 text-indigo-700'
                            : project.status === 'abandoned'
                              ? 'bg-red-50 text-red-700'
                              : 'bg-yellow-50 text-yellow-700'
                      }`}>
                        {project.status.charAt(0).toUpperCase() + project.status.slice(1).replace('-', ' ')}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{project.description}</p>
                    
                    {project.techStack && project.techStack.length > 0 && (
                      <div className="mb-3">
                        <div className="flex flex-wrap gap-1">
                          {project.techStack.map((tech, idx) => (
                            <span key={idx} className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-full">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-500 gap-2 mb-3">
                      {project.startDate && (
                        <div className="flex items-center">
                          <Calendar size={14} className="mr-1" />
                          <span>
                            Started: {new Date(project.startDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      
                      {project.endDate && (
                        <div className="flex items-center">
                          <Calendar size={14} className="mr-1" />
                          <span>
                            {project.status === 'completed' ? 'Completed' : 'Ends'}: 
                            {' '}{new Date(project.endDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      {project.githubRepo && (
                        <a
                          href={project.githubRepo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center gap-1"
                        >
                          <Code size={14} />
                          GitHub
                        </a>
                      )}
                      
                      {project.deployedUrl && (
                        <a
                          href={project.deployedUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center gap-1"
                        >
                          <ExternalLink size={14} />
                          Live Demo
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <Code size={40} className="mx-auto text-gray-300 mb-2" />
                <p className="text-gray-500">No projects added yet</p>
                {team.userStatus.isLeader && (
                  <button 
                    onClick={() => navigate(`/student/team/${teamId}/projects`)}
                    className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2 mx-auto"
                  >
                    <Plus size={16} />
                    Add Your First Project
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add TeamChatModal at the end of your component */}
      {team && userData && (
        <TeamChatModal 
          isOpen={isTeamChatOpen} 
          onClose={() => setIsTeamChatOpen(false)} 
          team={team} 
          currentUser={userData}
        />
      )}
    </div>
  );
};

export default TeamDetails;