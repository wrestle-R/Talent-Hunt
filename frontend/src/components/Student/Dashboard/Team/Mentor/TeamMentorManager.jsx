import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../../../../../../context/UserContext';
import { ChevronLeft, Shield, UserPlus } from 'lucide-react';
import { toast } from 'react-hot-toast';

// Import sub-components
import CurrentTeamMentor from './CurrentTeamMentor';
import MentorApplications from './MentorApplications';
import MentorSearch from './MentorSearch';
import RecommendedMentors from './RecommendedMentors';
import InviteMentorForm from './InviteMentorForm';

const TeamMentorManager = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const { userData } = useUser();
  const [team, setTeam] = useState(null);
  const [activeTab, setActiveTab] = useState('current');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applications, setApplications] = useState([]);
  const [showInviteForm, setShowInviteForm] = useState(false);
  
  // Fetch team details and mentor data
  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        setLoading(true);
        
        // Fetch team details
        const teamResponse = await axios.get(
          `http://localhost:4000/api/teams/${teamId}?studentId=${userData._id}`
        );
        
        if (teamResponse.data && teamResponse.data.success) {
          setTeam(teamResponse.data.team);
        } else {
          setError('Failed to load team details');
        }
        
        // Fetch pending applications
        const applicationsResponse = await axios.get(
          `http://localhost:4000/api/teams/${teamId}/mentors/applications?requesterId=${userData._id}`
        );
        
        if (applicationsResponse.data && applicationsResponse.data.success) {
          setApplications(applicationsResponse.data.applications || []);
        }
        
      } catch (err) {
        console.error('Error fetching team data:', err);
        setError(err.response?.data?.message || 'Failed to load team data');
      } finally {
        setLoading(false);
      }
    };

    if (teamId && userData?._id) {
      fetchTeamData();
    }
  }, [teamId, userData]);

  // Handle removing a mentor
  const handleRemoveMentor = async (mentorId) => {
    if (!confirm("Are you sure you want to remove this mentor from your team?")) {
      return;
    }
    
    try {
      setLoading(true);
      
      const response = await axios.post(
        `http://localhost:4000/api/teams/${teamId}/mentors/remove`,
        {
          mentorId,
          requesterId: userData._id
        }
      );
      
      if (response.data && response.data.success) {
        toast.success('Mentor removed successfully');
        
        // Update team state
        setTeam({
          ...team,
          mentor: null
        });
        
      } else {
        toast.error(response.data?.message || 'Failed to remove mentor');
      }
    } catch (err) {
      console.error('Error removing mentor:', err);
      toast.error(err.response?.data?.message || 'Failed to remove mentor');
    } finally {
      setLoading(false);
    }
  };

  // Cancel a pending application
  const handleCancelApplication = async (applicationId) => {
    if (!confirm("Are you sure you want to cancel this mentorship application?")) {
      return;
    }
    
    try {
      // Fix: Add request body instead of using query params
      const response = await axios.delete(
        `http://localhost:4000/api/teams/${teamId}/mentors/applications/${applicationId}`,
        {
          data: { // Use 'data' property to send request body with DELETE
            cancelerId: userData._id
          }
        }
      );
      
      if (response.data && response.data.success) {
        toast.success('Application cancelled successfully');
        
        // Update applications list
        setApplications(applications.filter(app => app._id !== applicationId));
      } else {
        toast.error(response.data?.message || 'Failed to cancel application');
      }
    } catch (err) {
      console.error('Error cancelling application:', err);
      // Provide more specific error message based on the response
      const errorMessage = err.response?.data?.message || 'Failed to cancel application';
      toast.error(errorMessage);
    }
  };

  // Update applications list when a new application is created
  const handleApplicationAdded = (newApplication) => {
    setApplications([...applications, newApplication]);
    toast.success('Application sent successfully');
    setActiveTab('applications');
  };

  if (loading && !team) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-[#1A1A1A] rounded w-1/4 mb-4"></div>
          <div className="h-24 bg-[#1A1A1A] rounded mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-60 bg-[#1A1A1A] rounded"></div>
            <div className="h-60 bg-[#1A1A1A] rounded"></div>
            <div className="h-60 bg-[#1A1A1A] rounded"></div>
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
            onClick={() => navigate(`/student/team/${teamId}`)}
            className="p-2 rounded-full bg-[#1A1A1A] hover:bg-[#E8C848]/10 text-[#E8C848] transition-all duration-300"
          >
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-2xl font-bold text-white">Team Mentors</h2>
        </div>
        <div className="bg-red-900/20 text-red-400 p-4 rounded-lg border border-red-800">
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-3 bg-red-900/30 text-red-400 px-4 py-2 rounded-lg hover:bg-red-900/40 transition-all duration-300"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 text-white">
      {/* Header with back button */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(`/student/team/${teamId}`)}
          className="p-2 rounded-full bg-[#1A1A1A] hover:bg-[#E8C848]/10 text-[#E8C848] transition-all duration-300"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-white">Team Mentors</h2>
          <p className="text-gray-400">Manage mentors for {team?.name}</p>
        </div>
        
        {/* Invite Button (Leader only) */}
        {team?.userStatus?.isLeader && (
          <button
            onClick={() => setShowInviteForm(true)}
            className="bg-[#E8C848] text-[#121212] px-4 py-2 rounded-lg hover:bg-[#E8C848]/80 flex items-center gap-2 transition-all duration-300 shadow-lg shadow-[#E8C848]/30"
          >
            <UserPlus size={16} />
            Invite a Mentor
          </button>
        )}
      </div>

      {/* Tab navigation */}
      <div className="mb-6 border-b border-gray-800">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('current')}
            className={`pb-4 px-1 transition-all duration-300 ${
              activeTab === 'current'
                ? 'border-b-2 border-[#E8C848] text-[#E8C848] font-medium'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Current Mentor
          </button>
          
          <button
            onClick={() => setActiveTab('applications')}
            className={`pb-4 px-1 transition-all duration-300 ${
              activeTab === 'applications'
                ? 'border-b-2 border-[#E8C848] text-[#E8C848] font-medium'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Applications ({applications.filter(app => app.status === 'pending').length})
          </button>
          
          <button
            onClick={() => setActiveTab('recommended')}
            className={`pb-4 px-1 transition-all duration-300 ${
              activeTab === 'recommended'
                ? 'border-b-2 border-[#E8C848] text-[#E8C848] font-medium'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Recommended Mentors
          </button>
          
          <button
            onClick={() => setActiveTab('browse')}
            className={`pb-4 px-1 transition-all duration-300 ${
              activeTab === 'browse'
                ? 'border-b-2 border-[#E8C848] text-[#E8C848] font-medium'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Browse All Mentors
          </button>
        </div>
      </div>

      {/* Tab content */}
      <div className="bg-[#1A1A1A] rounded-xl shadow-lg p-6 border border-gray-800 hover:border-[#E8C848]/30 transition-all duration-300">
        {activeTab === 'current' && (
          <CurrentTeamMentor 
            team={team} 
            onRemoveMentor={handleRemoveMentor} 
            isLeader={team?.userStatus?.isLeader} 
          />
        )}
        
        {activeTab === 'applications' && (
          <MentorApplications 
            applications={applications} 
            onCancelApplication={handleCancelApplication} 
          />
        )}
        
        {activeTab === 'recommended' && (
          <RecommendedMentors 
            teamId={teamId}
            teamTechStack={team?.techStack || []}
            applications={applications}
            onApplicationAdded={handleApplicationAdded}
          />
        )}
        
        {activeTab === 'browse' && (
          <MentorSearch 
            teamId={teamId}
            applications={applications}
            onApplicationAdded={handleApplicationAdded}
          />
        )}
      </div>

      {/* Invite Mentor Form Modal */}
      {showInviteForm && (
        <InviteMentorForm
          teamId={teamId}
          teamName={team?.name}
          onClose={() => setShowInviteForm(false)}
          studentId={userData?._id}
        />
      )}
    </div>
  );
};

export default TeamMentorManager;