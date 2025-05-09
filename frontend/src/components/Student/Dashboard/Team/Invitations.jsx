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

  const handleInvitation = async (invitationId, teamId, status) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user?.uid) {
        toast.error('Please login to respond to invitations');
        return;
      }

      // Set the invitation as responding
      setInvitations(prev => 
        prev.map(inv => inv._id === invitationId ? { ...inv, isResponding: true } : inv)
      );

      // Make the API call
      const response = await axios.put(
        `http://localhost:4000/api/student/team-invitations/${invitationId}/respond`,
        {
          uid: user.uid,
          teamId,
          status
        }
      );

      // Handle success
      if (response.data.success) {
        toast.success(status === 'accepted' ? 'Successfully joined the team!' : 'Invitation declined');
        // Remove the invitation from the list
        setInvitations(prev => prev.filter(inv => inv._id !== invitationId));
      }
    } catch (err) {
      console.error('Error responding to invitation:', err);
      const errorMessage = err.response?.data?.message || 'Failed to respond to invitation';
      toast.error(errorMessage);
      
      // Reset the responding state for this invitation
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
      if (!userId) {
        toast.error('Invalid user ID');
        return;
      }
  
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

  const TeamDetailsModal = ({ team, onClose }) => {
    if (!team) return null;

    return (
      <div className="fixed inset-0 bg-[#121212]/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-[#1A1A1A] rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-gray-800 hover:border-[#E8C848]/30 transition-all duration-300">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-white">{team.name}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-[#E8C848] transition-colors duration-300">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-300">About Team</h4>
              <p className="text-gray-400">{team.description || 'No description provided'}</p>
            </div>

            <div>
              <h4 className="font-medium text-gray-300">Tech Stack</h4>
              <div className="flex flex-wrap gap-2 mt-1">
                {team.techStack && team.techStack.length > 0 ? (
                  team.techStack.map((tech, index) => (
                    <span key={index} className="px-2 py-1 bg-[#E8C848]/10 text-[#E8C848] rounded-md text-sm">
                      {tech}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400">No tech stack specified</span>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-300">Team Members</h4>
              <div className="space-y-2 mt-2">
                {teamMembers && teamMembers.length > 0 ? (
                  teamMembers.map((member) => (
                    <div key={member._id || member.student?._id || index} className="flex items-center justify-between p-2 bg-[#121212] rounded-lg border border-gray-800 hover:border-[#E8C848]/30 transition-all duration-300">
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
                          <p className="font-medium text-white">{member.name || member.student?.name || 'Team member'}</p>
                          <p className="text-sm text-gray-400">{member.role || 'Member'}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400">No team members</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ProfileModal = ({ profile, onClose }) => {
    if (!profile) return null;

    return (
      <div className="fixed inset-0 bg-[#121212]/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-[#1A1A1A] rounded-xl p-6 max-w-xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-gray-800 hover:border-[#E8C848]/30 transition-all duration-300">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-white">Profile</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-[#E8C848] transition-colors duration-300">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <img 
                src={profile.profile_picture || '/default-avatar.png'} 
                alt={profile.name}
                className="w-20 h-20 rounded-full object-cover border-2 border-[#E8C848]/30"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/default-avatar.png';
                }}
              />
              <div>
                <h4 className="text-xl font-medium text-white">{profile.name || 'User'}</h4>
                <p className="text-gray-400">
                  {profile.education?.institution || profile.education?.degree || 'No education info'}
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-300">Skills</h4>
              <div className="flex flex-wrap gap-2 mt-1">
                {profile.skills?.length > 0 ? (
                  profile.skills.map((skill, index) => (
                    <span key={index} className="px-2 py-1 bg-[#E8C848]/10 text-[#E8C848] rounded-md text-sm">
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400">No skills listed</span>
                )}
              </div>
            </div>

            {profile.bio && (
              <div>
                <h4 className="font-medium text-gray-300">About</h4>
                <p className="text-gray-400">{profile.bio}</p>
              </div>
            )}

            {profile.projects?.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-300">Projects</h4>
                <div className="space-y-2 mt-2">
                  {profile.projects.map((project, index) => (
                    <div key={index} className="p-3 bg-[#121212] rounded-lg border border-gray-800 hover:border-[#E8C848]/30 transition-all duration-300">
                      <h5 className="font-medium text-white">{project.name}</h5>
                      <p className="text-sm text-gray-400">{project.description}</p>
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
        <Loader2 className="w-6 h-6 animate-spin text-[#E8C848]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-400 p-4 text-center">
        {error}
      </div>
    );
  }

  if (invitations.length === 0) {
    return (
      <div className="text-gray-400 p-4 text-center">
        No pending team invitations
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {invitations.map((invitation) => (
        <div 
          key={invitation._id}
          className="flex items-center justify-between p-4 bg-[#1A1A1A] rounded-lg border border-gray-800 hover:border-[#E8C848]/30 transition-all duration-300"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-[#E8C848]/30">
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
              <h4 className="font-medium text-white">
                {invitation.teamName || 'Team'}
              </h4>
              <p className="text-sm text-gray-400">
                Invited by {invitation.leader?.name || 'Team Leader'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleViewTeam(invitation.teamId)}
              className="p-1.5 rounded-full text-[#E8C848] hover:bg-[#E8C848]/10 transition-all duration-300"
              disabled={invitation.isResponding}
            >
              <Users className="w-5 h-5" />
            </button>
            {invitation.leader && invitation.leader._id && (
              <button
                onClick={() => handleViewProfile(invitation.leader._id)}
                className="p-1.5 rounded-full text-[#E8C848] hover:bg-[#E8C848]/10 transition-all duration-300"
                disabled={invitation.isResponding}
              >
                <User className="w-5 h-5" />
              </button>
            )}
            {invitation.isResponding ? (
              <Loader2 className="w-5 h-5 animate-spin text-[#E8C848]" />
            ) : (
              <>
                <button
                  onClick={() => handleInvitation(invitation._id, invitation.teamId, 'accepted')}
                  className="p-1.5 rounded-full text-green-400 hover:bg-green-900/20 transition-all duration-300"
                  disabled={invitation.isResponding}
                >
                  <CheckCircle className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleInvitation(invitation._id, invitation.teamId, 'declined')}
                  className="p-1.5 rounded-full text-red-400 hover:bg-red-900/20 transition-all duration-300"
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