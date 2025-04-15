import React, { useState, useEffect } from 'react';
import { Users, Crown, UserPlus, Plus, Clock, Bell, Shield, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../../../../../context/UserContext';

const TeamOverview = () => {
  const navigate = useNavigate();
  const { userData } = useUser();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showEmptyState, setShowEmptyState] = useState(false);

  const fetchTeams = async () => {
    try {
      if (!userData || !userData._id) {
        setError('User data not available');
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setShowEmptyState(false);
      
      const response = await axios.get(
        `http://localhost:4000/api/teams/my-teams?studentId=${userData._id}`
      );
      
      if (response.data && response.data.success) {
        setTeams(response.data.teams);
        
        // Set a delay before showing the empty state
        if (response.data.teams.length === 0) {
          setTimeout(() => {
            setShowEmptyState(true);
          }, 2000);
        } else {
          setShowEmptyState(true);
        }
      } else {
        setError('Failed to load teams data');
        setShowEmptyState(true);
      }
    } catch (err) {
      console.error('Error fetching teams:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load teams');
      setShowEmptyState(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (userData) {
      fetchTeams();
    }
  }, [userData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchTeams();
  };
  
  if (loading) {
    return (
      <div className="bg-[#1A1A1A] rounded-xl shadow-lg p-6 mb-6 border border-gray-800">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg flex items-center gap-2 text-white">
            <Users className="text-[#E8C848]" />
            My Teams
          </h3>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-[#E8C848]/10 text-[#E8C848] p-2 rounded-lg text-sm font-medium hover:bg-[#E8C848]/20 transition-all duration-300 disabled:opacity-50"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
          </button>
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

  return (
    <div className="bg-[#1A1A1A] rounded-xl shadow-lg p-6 mb-6 border border-gray-800 hover:border-[#E8C848]/30 transition-all duration-300">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg flex items-center gap-2 text-white">
          <Users className="text-[#E8C848]" />
          My Teams
        </h3>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-[#E8C848]/10 text-[#E8C848] p-2 rounded-lg text-sm font-medium hover:bg-[#E8C848]/20 transition-all duration-300 disabled:opacity-50"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
          </button>
          <button
            onClick={() => navigate('/student/team/join')}
            className="bg-[#E8C848]/10 text-[#E8C848] px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-[#E8C848]/20 transition-all duration-300 flex items-center gap-1"
          >
            <UserPlus size={16} />
            Join Team
          </button>
          <button
            onClick={() => navigate('/student/team/create')}
            className="bg-[#E8C848] text-[#121212] px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-[#E8C848]/80 transition-all duration-300 flex items-center gap-1 shadow-lg shadow-[#E8C848]/20"
          >
            <Plus size={16} />
            Create Team
          </button>
        </div>
      </div>

      {teams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teams.map(team => (
            <div key={team._id} className="bg-[#121212] border border-gray-800 hover:border-[#E8C848]/30 rounded-lg p-4 transition-all duration-300">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-semibold text-white flex items-center gap-2">
                    {team.name}
                    {team.isLeader && (
                      <Crown size={16} className="text-[#E8C848]" />
                    )}
                  </h4>
                  <p className="text-sm text-gray-400">
                    {team.memberCount} members • {team.role}
                  </p>
                </div>
                {team.isLeader && (
                  <div className="flex items-center gap-2">
                    <span className="bg-[#E8C848]/10 text-[#E8C848] text-xs px-2 py-1 rounded-full flex items-center">
                      <Shield size={12} className="mr-1" />
                      Leader
                    </span>
                  </div>
                )}
              </div>

              {team.isLeader && (
                <div className="space-y-2 mb-3">
                  {team.pendingInvitations > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <UserPlus className="text-[#E8C848]" size={14} />
                      <span className="text-gray-400">
                        {team.pendingInvitations} pending {team.pendingInvitations === 1 ? 'invitation' : 'invitations'}
                      </span>
                    </div>
                  )}
                  
                  {team.pendingApplications > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <Bell className="text-[#E8C848]" size={14} />
                      <span className="text-gray-400">
                        {team.pendingApplications} pending {team.pendingApplications === 1 ? 'application' : 'applications'}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={() => navigate(`/student/team/${team._id}`)}
                className="mt-3 w-full bg-[#E8C848]/10 text-[#E8C848] px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-[#E8C848]/20 transition-all duration-300"
              >
                View Team
              </button>
            </div>
          ))}
        </div>
      ) : (
        <>
          {showEmptyState ? (
            <div className="text-center py-8">
              <Users size={40} className="mx-auto text-[#E8C848]/30 mb-2" />
              <p className="text-gray-400 mb-4">You're not part of any teams yet</p>
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => navigate('/student/team/join')}
                  className="bg-[#E8C848]/10 text-[#E8C848] px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#E8C848]/20 transition-all duration-300"
                >
                  Join a Team
                </button>
                <button
                  onClick={() => navigate('/student/team/create')}
                  className="bg-[#E8C848] text-[#121212] px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#E8C848]/80 transition-all duration-300 shadow-lg shadow-[#E8C848]/20"
                >
                  Create a Team
                </button>
              </div>
            </div>
          ) : (
            <div className="flex justify-center items-center h-40">
              <div className="animate-pulse flex flex-col items-center">
                <div className="rounded-full bg-[#121212] h-12 w-12 mb-2"></div>
                <div className="h-4 bg-[#121212] rounded w-24 mb-2"></div>
                <div className="h-3 bg-[#121212] rounded w-32"></div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TeamOverview;