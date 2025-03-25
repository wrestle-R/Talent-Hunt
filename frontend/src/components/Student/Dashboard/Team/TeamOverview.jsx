import React, { useState, useEffect } from 'react';
import { Users, Crown, UserPlus, Plus, Clock, Bell, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../../../../../context/UserContext';

const TeamOverview = () => {
  const navigate = useNavigate();
  const { userData } = useUser();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        if (!userData || !userData._id) {
          setError('User data not available');
          setLoading(false);
          return;
        }
        
        setLoading(true);
        const response = await axios.get(
          `http://localhost:4000/api/teams/my-teams?studentId=${userData._id}`
        );
        
        if (response.data && response.data.success) {
          setTeams(response.data.teams);
        } else {
          setError('Failed to load teams data');
        }
      } catch (err) {
        console.error('Error fetching teams:', err);
        setError(err.response?.data?.message || err.message || 'Failed to load teams');
      } finally {
        setLoading(false);
      }
    };
    
    if (userData) {
      fetchTeams();
    }
  }, [userData]);
  
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Users className="text-indigo-600" />
            My Teams
          </h3>
        </div>
        <div className="flex justify-center items-center h-40">
          <div className="animate-pulse flex flex-col items-center">
            <div className="rounded-full bg-gray-200 h-12 w-12 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-32"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <Users className="text-indigo-600" />
          My Teams
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/student/team/join')}
            className="bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors flex items-center gap-1"
          >
            <UserPlus size={16} />
            Join Team
          </button>
          <button
            onClick={() => navigate('/student/team/create')}
            className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-1"
          >
            <Plus size={16} />
            Create Team
          </button>
        </div>
      </div>

      {teams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teams.map(team => (
            <div key={team._id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                    {team.name}
                    {team.isLeader && (
                      <Crown size={16} className="text-yellow-500" />
                    )}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {team.memberCount} members • {team.role}
                  </p>
                </div>
                {team.isLeader && (
                  <div className="flex items-center gap-2">
                    <span className="bg-yellow-50 text-yellow-700 text-xs px-2 py-1 rounded-full flex items-center">
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
                      <UserPlus className="text-indigo-400" size={14} />
                      <span className="text-gray-600">
                        {team.pendingInvitations} pending {team.pendingInvitations === 1 ? 'invitation' : 'invitations'}
                      </span>
                    </div>
                  )}
                  
                  {team.pendingApplications > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <Bell className="text-indigo-400" size={14} />
                      <span className="text-gray-600">
                        {team.pendingApplications} pending {team.pendingApplications === 1 ? 'application' : 'applications'}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={() => navigate(`/student/team/${team._id}`)}
                className="mt-3 w-full bg-gray-50 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
              >
                View Team
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Users size={40} className="mx-auto text-gray-300 mb-2" />
          <p className="text-gray-500 mb-4">You're not part of any teams yet</p>
          <div className="flex justify-center gap-2">
            <button
              onClick={() => navigate('/student/team/join')}
              className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors"
            >
              Join a Team
            </button>
            <button
              onClick={() => navigate('/student/team/create')}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              Create a Team
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamOverview;