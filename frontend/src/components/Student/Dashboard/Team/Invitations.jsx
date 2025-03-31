import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Loader2, Users, User, X } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const Invitations = ({ limit }) => {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user?.uid) return;

      const response = await axios.get(
        `http://localhost:4000/api/student/team-invitations/${user.uid}`
      );

      if (response.data && response.data.invitations) {
        const formattedInvitations = response.data.invitations.map(inv => ({
          ...inv,
          isResponding: false
        }));

        setInvitations(limit ? formattedInvitations.slice(0, limit) : formattedInvitations);
      } else {
        setInvitations([]);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching invitations:', err);
      setError('Failed to load team invitations');
      setLoading(false);
    }
  };

  // FIX: Updating to match expected backend parameters
  const handleInvitation = async (invitationId, teamId, status) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user?.uid) {
        toast.error('Please login to respond to invitations');
        return;
      }
  
      // Update loading state for specific invitation
      setInvitations(prev => 
        prev.map(inv => inv._id === invitationId ? { ...inv, isResponding: true } : inv)
      );
  
      // FIX: Make sure the endpoint and parameters match what the backend expects
      const response = await axios.put(
        `http://localhost:4000/api/student/team-invitations/${invitationId}/respond`,
        {
          uid: user.uid,
          status,
          teamId
        }
      );
  
      if (response.data.success) {
        toast.success(status === 'accepted' ? 'Successfully joined the team!' : 'Invitation declined');
        setInvitations(prev => prev.filter(inv => inv._id !== invitationId));
      }
    } catch (err) {
      console.error('Error responding to invitation:', err);
      // Display the specific error message from the backend if available
      const errorMessage = err.response?.data?.message || 'Failed to respond to invitation';
      toast.error(errorMessage);
      
      // Reset loading state
      setInvitations(prev => 
        prev.map(inv => inv._id === invitationId ? { ...inv, isResponding: false } : inv)
      );
    }
  };

  const handleViewTeam = async (teamId) => {
    try {
      if (!teamId) {
        toast.error('Invalid team ID');
        return;
      }
      
      const response = await axios.get(
        `http://localhost:4000/api/student/teams/${teamId}/details`
      );
      
      if (response.data && response.data.team) {
        setSelectedTeam(response.data.team);
        setTeamMembers(response.data.team.members || []);
        setShowTeamModal(true);
      } else {
        toast.error('Failed to load team details');
      }
    } catch (err) {
      console.error('Error fetching team details:', err);
      toast.error('Failed to load team details');
    }
  };

  const handleViewProfile = async (userId) => {
    try {
      // Check if userId is valid
      if (!userId) {
        toast.error('Invalid user ID');
        return;
      }
  
      // FIX: Use the correct endpoint for fetching user profiles
      const response = await axios.get(
        `http://localhost:4000/api/student/teammate/${userId}`
      );
      
      if (response.data.success && response.data.teammate) {
        setSelectedProfile(response.data.teammate);
        setShowProfileModal(true);
      } else {
        toast.error('Failed to load profile');
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      toast.error('Failed to load profile');
    }
  };

  // FIX: Define TeamDetailsModal component 
  const TeamDetailsModal = ({ team, onClose }) => {
    if (!team) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">{team.name}</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Team Description */}
            <div>
              <h4 className="font-medium text-gray-700">About Team</h4>
              <p className="text-gray-600">{team.description || 'No description provided'}</p>
            </div>

            {/* Tech Stack */}
            <div>
              <h4 className="font-medium text-gray-700">Tech Stack</h4>
              <div className="flex flex-wrap gap-2 mt-1">
                {team.techStack && team.techStack.length > 0 ? (
                  team.techStack.map((tech, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-sm">
                      {tech}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500">No tech stack specified</span>
                )}
              </div>
            </div>

            {/* Team Members */}
            <div>
              <h4 className="font-medium text-gray-700">Team Members</h4>
              <div className="space-y-2 mt-2">
                {teamMembers && teamMembers.length > 0 ? (
                  teamMembers.map((member) => (
                    <div key={member._id || member.student?._id || index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <img 
                          src={member.profile_picture || member.student?.profile_picture || '/default-avatar.png'} 
                          alt={member.name || member.student?.name || 'Team member'}
                          className="w-8 h-8 rounded-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/default-avatar.png';
                          }}
                        />
                        <div>
                          <p className="font-medium">{member.name || member.student?.name || 'Team member'}</p>
                          <p className="text-sm text-gray-500">{member.role || 'Member'}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No team members</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // FIX: Define ProfileModal component
  const ProfileModal = ({ profile, onClose }) => {
    if (!profile) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 max-w-xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Profile</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Basic Info */}
            <div className="flex items-center gap-4">
              <img 
                src={profile.profile_picture || '/default-avatar.png'} 
                alt={profile.name}
                className="w-20 h-20 rounded-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/default-avatar.png';
                }}
              />
              <div>
                <h4 className="text-xl font-medium">{profile.name || 'User'}</h4>
                <p className="text-gray-600">
                  {profile.education?.institution || profile.education?.degree || 'No education info'}
                </p>
              </div>
            </div>

            {/* Skills */}
            <div>
              <h4 className="font-medium text-gray-700">Skills</h4>
              <div className="flex flex-wrap gap-2 mt-1">
                {profile.skills?.length > 0 ? (
                  profile.skills.map((skill, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-sm">
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500">No skills listed</span>
                )}
              </div>
            </div>

            {/* Bio */}
            {profile.bio && (
              <div>
                <h4 className="font-medium text-gray-700">About</h4>
                <p className="text-gray-600">{profile.bio}</p>
              </div>
            )}

            {/* Projects */}
            {profile.projects?.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-700">Projects</h4>
                <div className="space-y-2 mt-2">
                  {profile.projects.map((project, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <h5 className="font-medium">{project.name}</h5>
                      <p className="text-sm text-gray-600">{project.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4 text-center">
        {error}
      </div>
    );
  }

  if (invitations.length === 0) {
    return (
      <div className="text-gray-500 p-4 text-center">
        No pending team invitations
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {invitations.map((invitation) => (
        <div 
          key={invitation._id}
          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden">
              <img 
                src={invitation.leader?.profile_picture || '/default-avatar.png'} 
                alt={invitation.leader?.name || 'Team Leader'}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/default-avatar.png';
                }}
              />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">
                {invitation.teamName || 'Team'}
              </h4>
              <p className="text-sm text-gray-500">
                Invited by {invitation.leader?.name || 'Team Leader'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleViewTeam(invitation.teamId)}
              className="p-1.5 rounded-full text-blue-600 hover:bg-blue-50 transition-colors"
              disabled={invitation.isResponding}
            >
              <Users className="w-5 h-5" />
            </button>
            {invitation.leader && invitation.leader._id && (
              <button
                onClick={() => handleViewProfile(invitation.leader._id)}
                className="p-1.5 rounded-full text-blue-600 hover:bg-blue-50 transition-colors"
                disabled={invitation.isResponding}
              >
                <User className="w-5 h-5" />
              </button>
            )}
            {invitation.isResponding ? (
              <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
            ) : (
              <>
                <button
                  onClick={() => handleInvitation(invitation._id, invitation.teamId, 'accepted')}
                  className="p-1.5 rounded-full text-green-600 hover:bg-green-50 transition-colors"
                  disabled={invitation.isResponding}
                >
                  <CheckCircle className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleInvitation(invitation._id, invitation.teamId, 'rejected')}
                  className="p-1.5 rounded-full text-red-600 hover:bg-red-50 transition-colors"
                  disabled={invitation.isResponding}
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>
      ))}

      {showTeamModal && (
        <TeamDetailsModal 
          team={selectedTeam} 
          onClose={() => setShowTeamModal(false)} 
        />
      )}

      {showProfileModal && (
        <ProfileModal 
          profile={selectedProfile} 
          onClose={() => setShowProfileModal(false)} 
        />
      )}
    </div>
  );
};

export default Invitations;