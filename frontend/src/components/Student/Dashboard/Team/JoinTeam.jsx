import React, { useState, useEffect } from 'react';
import { Users, Search, Filter, ChevronLeft, Send, ExternalLink, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../../../../../context/UserContext';

const JoinTeam = () => {
  const navigate = useNavigate();
  const { userData } = useUser();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [techFilter, setTechFilter] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [joinStatus, setJoinStatus] = useState({ message: '', type: '' });
  const [isBuffering, setIsBuffering] = useState(true); // Buffer state for context loading

  // Add a buffer period before checking userData
  useEffect(() => {
    // Set a buffer timer
    const bufferTimer = setTimeout(() => {
      setIsBuffering(false);
    }, 1000); // 2 second buffer period
    
    return () => clearTimeout(bufferTimer);
  }, []);

  // Fetch teams once we have userData and buffer period is complete
  useEffect(() => {
    // Don't attempt to fetch if we're still in buffer period
    if (isBuffering) {
      return;
    }
    
    const fetchTeams = async () => {
      try {
        // Check if userData is available
        if (!userData || !userData._id) {
          console.log('userData not available after buffer period:', userData);
          setError('User data not available. Please log in again.');
          setLoading(false);
          return;
        }

        setLoading(true);
        
        console.log("Fetching recruiting teams with studentId:", userData._id);
        
        const response = await axios.get(
          `http://localhost:4000/api/teams/recruiting?studentId=${userData._id}`
        );
        
        console.log("Recruiting teams response:", response.data);
        
        if (response.data && response.data.success) {
          setTeams(response.data.teams);
        } else {
          setError(response.data?.message || 'Failed to load available teams');
        }
      } catch (err) {
        console.error('Error fetching teams:', err);
        console.error('Error details:', err.response?.data);
        
        if (err.response?.status === 401 || err.response?.status === 403) {
          setError('Your session has expired. Please log in again.');
        } else {
          setError(err.response?.data?.message || err.message || 'Failed to load teams');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchTeams();
  }, [userData, isBuffering]); // Run once buffer is complete and when userData changes
  
  // Redirect to login
  const redirectToLogin = () => {
    // Save current URL to return after login
    localStorage.setItem('redirectAfterLogin', window.location.pathname);
    navigate('/login');
  };
  
  // Join team with code
  const handleJoinWithCode = async () => {
    if (!joinCode.trim()) {
      setJoinStatus({ message: 'Please enter a join code', type: 'error' });
      return;
    }
    
    if (!userData || !userData._id) {
      setJoinStatus({ message: 'User information not available. Please log in again.', type: 'error' });
      return;
    }
    
    try {
      setLoading(true);
      const studentId = userData._id;
      
      console.log("Joining team with code:", joinCode.trim(), "studentId:", studentId);
      
      const response = await axios.post(
        'http://localhost:4000/api/teams/join-with-code',
        { 
          joinCode: joinCode.trim(),
          studentId 
        }
      );
      
      console.log("Join response:", response.data);
      
      if (response.data && response.data.success) {
        setJoinStatus({ 
          message: `Successfully joined team: ${response.data.teamName}`, 
          type: 'success' 
        });
        
        // Redirect to team page after successful join
        setTimeout(() => {
          navigate(`/student/team/${response.data.teamId}`);
        }, 1500);
      } else {
        setJoinStatus({ 
          message: response.data?.message || 'Failed to join team', 
          type: 'error' 
        });
      }
    } catch (err) {
      console.error('Error joining team:', err);
      console.error('Error details:', err.response?.data);
      
      if (err.response?.status === 401 || err.response?.status === 403) {
        setJoinStatus({ 
          message: 'Your session has expired. Please log in again.', 
          type: 'error' 
        });
      } else {
        setJoinStatus({ 
          message: err.response?.data?.message || 'Failed to join team', 
          type: 'error' 
        });
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Apply to join team
  const handleApplyToTeam = async (teamId) => {
    if (!userData || !userData._id) {
      setJoinStatus({ message: 'User information not available. Please log in again.', type: 'error' });
      return;
    }
    
    try {
      setLoading(true);
      const studentId = userData._id;
      
      console.log("Applying to team with data:", { teamId, studentId });
      
      const response = await axios.post(
        'http://localhost:4000/api/teams/apply',
        { 
          teamId,
          studentId,
          message: "I'd like to join your team." 
        }
      );
      
      console.log("Application response:", response.data);
      
      if (response.data && response.data.success) {
        // Update the team status in the list
        const updatedTeams = teams.map(team => 
          team._id === teamId 
            ? {...team, hasApplied: true} 
            : team
        );
        setTeams(updatedTeams);
        
        setJoinStatus({ 
          message: `Application sent to team: ${response.data.teamName}`, 
          type: 'success' 
        });
      } else {
        setJoinStatus({ 
          message: response.data?.message || 'Failed to apply to team', 
          type: 'error' 
        });
      }
    } catch (err) {
      console.error('Error applying to team:', err);
      console.error('Error details:', err.response?.data);
      
      if (err.response?.status === 401 || err.response?.status === 403) {
        setJoinStatus({ 
          message: 'Your session has expired. Please log in again.', 
          type: 'error' 
        });
      } else {
        setJoinStatus({ 
          message: err.response?.data?.message || 'Failed to apply to team', 
          type: 'error' 
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Manual retry function
  const retryFetchTeams = () => {
    if (userData && userData._id) {
      setError(null);
      setLoading(true);
      
      axios.get(`http://localhost:4000/api/teams/recruiting?studentId=${userData._id}`)
        .then(response => {
          console.log("Manual retry response:", response.data);
          if (response.data && response.data.success) {
            setTeams(response.data.teams);
            setError(null);
          } else {
            setError(response.data?.message || 'Failed to load available teams');
          }
        })
        .catch(err => {
          console.error('Manual retry error:', err);
          console.error('Error details:', err.response?.data);
          
          if (err.response?.status === 401 || err.response?.status === 403) {
            setError('Your session has expired. Please log in again.');
          } else {
            setError(err.response?.data?.message || err.message || 'Failed to load teams');
          }
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setError('User data not available. Please log in again.');
    }
  };

  // Filter teams based on search and tech filter
  const filteredTeams = teams.filter(team => {
    const matchesSearch = searchTerm === '' || 
      team.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (team.description && team.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
    const matchesTech = techFilter === '' || 
      (team.techStack && team.techStack.some(tech => 
        tech.toLowerCase().includes(techFilter.toLowerCase())
      ));
      
    return matchesSearch && matchesTech;
  });

  // Show loading skeleton during buffer period or when loading data
  if (isBuffering || (loading && !error)) {
    return (
      <div className="max-w-6xl mx-auto bg-[#1A1A1A] rounded-xl shadow-lg p-6 border border-gray-800">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 bg-[#121212] rounded-full animate-pulse mr-4"></div>
          <div className="h-8 bg-[#121212] rounded w-48 animate-pulse"></div>
        </div>

        <div className="mb-6 p-4 border border-gray-800 rounded-lg">
          <div className="h-6 bg-[#121212] rounded w-36 mb-3 animate-pulse"></div>
          <div className="h-4 bg-[#121212] rounded w-full mb-3 animate-pulse"></div>
          <div className="flex">
            <div className="flex-1 h-10 bg-[#121212] rounded-l-lg animate-pulse"></div>
            <div className="w-28 h-10 bg-[#121212] rounded-r-lg animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  // If buffer period is complete and userData is still not available, show login prompt
  if (!isBuffering && (!userData || !userData._id)) {
    return (
      <div className="max-w-6xl mx-auto bg-[#1A1A1A] rounded-xl shadow-lg p-6 border border-gray-800">
        <div className="text-center py-10">
          <LogIn size={40} className="mx-auto text-[#E8C848] mb-2" />
          <h2 className="text-xl font-medium text-white mb-2">Login Required</h2>
          <p className="text-gray-400 mb-6">
            You need to be logged in to view and join teams.
          </p>
          <button 
            onClick={redirectToLogin} 
            className="bg-[#E8C848] text-[#121212] px-4 py-2 rounded-lg hover:bg-[#E8C848]/80 transition-all duration-300 shadow-lg shadow-[#E8C848]/30"
          >
            Log In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto bg-[#1A1A1A] rounded-xl shadow-lg p-6 border border-gray-800 hover:border-[#E8C848]/30 transition-all duration-300">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="mr-4 p-2 rounded-full bg-[#121212] text-[#E8C848] hover:bg-[#E8C848]/10 transition-all duration-300"
        >
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Users className="text-[#E8C848]" />
          Join a Team
        </h2>
      </div>

      {joinStatus.message && (
        <div className={`mb-4 p-3 rounded-lg ${
          joinStatus.type === 'success' 
            ? 'bg-[#E8C848]/10 border border-[#E8C848]/30 text-[#E8C848]' 
            : 'bg-red-900/20 border border-red-800 text-red-400'
        }`}>
          {joinStatus.message}
        </div>
      )}

      <div className="mb-6 p-4 border border-gray-800 rounded-lg bg-[#121212] hover:border-[#E8C848]/30 transition-all duration-300">
        <h3 className="font-medium text-lg mb-3 text-white">Join with Code</h3>
        <p className="text-sm text-gray-400 mb-3">
          If you have a team code, enter it below to join directly.
        </p>
        <div className="flex">
          <input
            type="text"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            placeholder="Enter team code"
            className="flex-1 p-2 bg-[#1A1A1A] border border-gray-800 text-white rounded-l-lg focus:ring-2 focus:ring-[#E8C848] focus:border-[#E8C848] placeholder-gray-500 transition-all duration-300"
          />
          <button
            onClick={handleJoinWithCode}
            disabled={loading}
            className="bg-[#E8C848] text-[#121212] px-4 py-2 rounded-r-lg hover:bg-[#E8C848]/80 disabled:opacity-70 flex items-center transition-all duration-300 shadow-lg shadow-[#E8C848]/30"
          >
            {loading ? 'Joining...' : 'Join Team'}
          </button>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="font-medium text-lg mb-3 text-white">Find Teams to Join</h3>
        
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#E8C848]" />
            <input
              type="text"
              placeholder="Search by team name or description..."
              className="w-full pl-10 pr-4 py-2 bg-[#121212] border border-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8C848] focus:border-[#E8C848] placeholder-gray-500 transition-all duration-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative w-full md:w-64">
            <Filter size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#E8C848]" />
            <input
              type="text"
              placeholder="Filter by tech stack..."
              className="w-full pl-10 pr-4 py-2 bg-[#121212] border border-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8C848] focus:border-[#E8C848] placeholder-gray-500 transition-all duration-300"
              value={techFilter}
              onChange={(e) => setTechFilter(e.target.value)}
            />
          </div>
        </div>
        
        {filteredTeams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTeams.map(team => (
              <div key={team._id} className="bg-[#121212] border border-gray-800 hover:border-[#E8C848]/30 rounded-lg p-4 transition-all duration-300">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-white">{team.name}</h4>
                  <span className="text-xs text-gray-400">
                    {team.memberCount}/{team.maxTeamSize} members
                  </span>
                </div>
                <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                  {team.description || "No description provided."}
                </p>
                
                {team.techStack && team.techStack.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {team.techStack.map((tech, idx) => (
                      <span key={idx} className="bg-[#E8C848]/10 text-[#E8C848] text-xs px-2 py-0.5 rounded-full">
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
                
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => navigate(`/student/team/${team._id}`)}
                    className="flex-1 bg-[#1A1A1A] text-[#E8C848] px-3 py-1.5 rounded-lg text-sm hover:bg-[#E8C848]/10 transition-all duration-300 flex items-center justify-center border border-gray-800 hover:border-[#E8C848]/30"
                  >
                    <ExternalLink size={14} className="mr-1" />
                    View
                  </button>
                  
                  {team.hasApplied ? (
                    <button
                      disabled
                      className="flex-1 bg-[#E8C848]/10 text-[#E8C848] px-3 py-1.5 rounded-lg text-sm border border-[#E8C848]/30"
                    >
                      Applied
                    </button>
                  ) : (
                    <button
                      onClick={() => handleApplyToTeam(team._id)}
                      disabled={loading}
                      className="flex-1 bg-[#E8C848] text-[#121212] px-3 py-1.5 rounded-lg text-sm hover:bg-[#E8C848]/80 transition-all duration-300 flex items-center justify-center shadow-lg shadow-[#E8C848]/30"
                    >
                      <Send size={14} className="mr-1" />
                      Apply
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <Users size={40} className="mx-auto text-[#E8C848]/30 mb-2" />
            <p className="text-gray-400">No teams found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JoinTeam;
