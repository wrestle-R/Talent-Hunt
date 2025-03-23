import React, { useState, useEffect } from 'react';
import { Users, Crown, Clock, ChevronLeft, ChevronRight, UserPlus, Mail, X, Send } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../../../context/UserContext';

// Simple placeholder if no image is available
const UserAvatar = ({ image, name }) => {
  return image ? (
    <img src={image} alt={name} className="w-12 h-12 rounded-full object-cover" />
  ) : (
    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-medium">
      {name?.charAt(0) || "?"}
    </div>
  );
};

const DisplayTeam = ({ teamId, limit = 5 }) => {
  const navigate = useNavigate();
  const { userData } = useUser();
  const [team, setTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLeader, setIsLeader] = useState(false);
  
  // Invite modal state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  const [inviteRole, setInviteRole] = useState('Member');
  const [inviteStatus, setInviteStatus] = useState({ type: '', message: '' });

  useEffect(() => {
    const fetchTeamDetails = async () => {
      try {
        if (!teamId) {
          setError("No team ID provided");
          setLoading(false);
          return;
        }

        if (!userData || !userData._id) {
          setError('User data not available');
          setLoading(false);
          return;
        }

        setLoading(true);
        
        const response = await axios.get(
          `http://localhost:4000/api/teams/${teamId}?studentId=${userData._id}`
        );
        
        if (response.data && response.data.success) {
          setTeam(response.data.team);
          setMembers(response.data.team.members);
          
          // Check if current user is the team leader
          setIsLeader(response.data.team.userStatus?.isLeader || false);
          
          // Calculate pages if using pagination
          if (limit > 0) {
            setTotalPages(Math.ceil(response.data.team.members.length / limit));
          }
        } else {
          setError('Failed to load team details');
        }
      } catch (err) {
        console.error('Error fetching team details:', err);
        setError(err.response?.data?.message || 'Failed to load team details');
      } finally {
        setLoading(false);
      }
    };
    
    if (teamId) {
      fetchTeamDetails();
    }
  }, [teamId, limit, userData]);

  // Handle team invitation
  const handleInvite = async (e) => {
    e.preventDefault();
    
    try {
      setInviteStatus({ type: 'loading', message: 'Sending invitation...' });
      
      if (!inviteEmail.trim()) {
        setInviteStatus({ type: 'error', message: 'Please enter an email address' });
        return;
      }
      
      // First, look up the student by email
      const lookupResponse = await axios.get(
        `http://localhost:4000/api/students/lookup?email=${inviteEmail.trim()}`
      );
      
      if (!lookupResponse.data || !lookupResponse.data.success) {
        setInviteStatus({ 
          type: 'error', 
          message: lookupResponse.data?.message || 'Student not found with this email' 
        });
        return;
      }
      
      const studentId = lookupResponse.data.student._id;
      
      // Now send the invitation
      const response = await axios.post(
        'http://localhost:4000/api/teams/invite',
        {
          teamId,
          studentId,
          role: inviteRole,
          message: inviteMessage || `You are invited to join ${team?.name}`,
          inviterId: userData._id
        }
      );
      
      if (response.data && response.data.success) {
        setInviteStatus({ 
          type: 'success', 
          message: `Invitation sent to ${inviteEmail}` 
        });
        
        // Reset form after successful invite
        setTimeout(() => {
          setInviteEmail('');
          setInviteMessage('');
          setInviteRole('Member');
          setShowInviteModal(false);
          setInviteStatus({ type: '', message: '' });
        }, 2000);
      } else {
        setInviteStatus({ 
          type: 'error', 
          message: response.data?.message || 'Failed to send invitation' 
        });
      }
    } catch (err) {
      console.error('Error sending invitation:', err);
      setInviteStatus({ 
        type: 'error', 
        message: err.response?.data?.message || 'Failed to send invitation' 
      });
    }
  };

  // Navigate between pages
  const goToNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  };

  // Get current members to display
  const getCurrentMembers = () => {
    if (limit <= 0) return members; // Return all if no limit
    
    const startIndex = currentPage * limit;
    return members.slice(startIndex, startIndex + limit);
  };

  // Invite Modal Component
  const InviteModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg flex items-center">
            <UserPlus className="text-indigo-600 mr-2" size={20} />
            Invite to Team
          </h3>
          <button 
            onClick={() => {
              setShowInviteModal(false);
              setInviteStatus({ type: '', message: '' });
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        
        {inviteStatus.message && (
          <div className={`mb-4 p-3 rounded-lg ${
            inviteStatus.type === 'success' 
              ? 'bg-green-50 text-green-700' 
              : inviteStatus.type === 'error'
                ? 'bg-red-50 text-red-700'
                : 'bg-blue-50 text-blue-700'
          }`}>
            {inviteStatus.message}
          </div>
        )}
        
        <form onSubmit={handleInvite}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="teammate@example.com"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Personal Message (Optional)
            </label>
            <textarea
              value={inviteMessage}
              onChange={(e) => setInviteMessage(e.target.value)}
              placeholder="Enter a personal message..."
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              rows={3}
            />
          </div>
          
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowInviteModal(false)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-70"
              disabled={inviteStatus.type === 'loading'}
            >
              {inviteStatus.type === 'loading' ? 'Sending...' : 'Send Invitation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse flex flex-col">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(limit)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-500">Team information not available</p>
      </div>
    );
  }

  return (
    <>
      {showInviteModal && <InviteModal />}
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg flex items-center">
            <Users className="text-indigo-600 mr-2" />
            Team: {team.name}
          </h3>
          <div className="flex gap-2">
            {isLeader && (
              <button 
                onClick={() => setShowInviteModal(true)}
                className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg text-sm font-medium hover:bg-indigo-200 flex items-center"
              >
                <UserPlus size={16} className="mr-1" />
                Invite
              </button>
            )}
            <button 
              onClick={() => navigate(`/student/team/${teamId}`)}
              className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
            >
              View Team
            </button>
          </div>
        </div>
        
        {isLeader && team.joinRequests && team.joinRequests.length > 0 && (
          <div className="mb-4 p-3 rounded-lg bg-yellow-50 border border-yellow-100">
            <p className="text-sm text-yellow-700 flex items-center">
              <Mail className="mr-2" size={16} />
              You have {team.joinRequests.length} pending join request{team.joinRequests.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
        
        {getCurrentMembers().length > 0 ? (
          <div className="space-y-4">
            {getCurrentMembers().map(member => (
              <div 
                key={member._id} 
                className="flex items-center p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => navigate(`/student/profile/${member._id}`)}
              >
                <UserAvatar image={member.profile_picture} name={member.name} />
                <div className="ml-3 flex-1">
                  <div className="flex items-center">
                    <h4 className="font-medium">{member.name}</h4>
                    {member._id === team.leader._id && (
                      <Crown size={16} className="ml-1 text-yellow-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{member.role || "Member"}</p>
                </div>
                <div className="text-xs text-gray-500 flex flex-col items-end">
                  <span className="flex items-center">
                    <Clock size={12} className="mr-1" />
                    {new Date(member.joinedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-4">No team members found</p>
        )}
        
        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-4">
            <button 
              onClick={goToPrevPage} 
              disabled={currentPage === 0}
              className="p-1 text-gray-500 disabled:text-gray-300"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-sm text-gray-600">
              Page {currentPage + 1} of {totalPages}
            </span>
            <button 
              onClick={goToNextPage} 
              disabled={currentPage === totalPages - 1}
              className="p-1 text-gray-500 disabled:text-gray-300"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default DisplayTeam;