import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Users, Shield, Calendar, Code, Award, MessageCircle, 
  Zap, ChevronRight, Clock, ArrowLeft, BarChart4, FileCode, 
  UserPlus, UserCheck, Github, ExternalLink, Edit, Check, X, 
  FileText, Layers, AlertTriangle
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import TeamMembersList from '../Team/TeamMembersList';
import TeamProjectsCard from '../Team/TeamProjectsCard';
import TeamChatModal from '../Team/TeamChatModal';
import StudentPlaceholder from '../../../public/student_placeholder.png';
import MentorPlaceholder from '../../../public/mentor_placeholder.png';

const TeamManagement = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mentorData, setMentorData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [error, setError] = useState(null);
  const [teamPerformanceMetrics, setTeamPerformanceMetrics] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Get mentor data from localStorage
  useEffect(() => {
    const mentor = JSON.parse(localStorage.getItem('user'));
    if (mentor) {
      setMentorData(mentor);
    } else {
      setError("Mentor session data not found");
      toast.error("Please login again");
      navigate('/mentor/login');
    }
  }, [navigate]);

  // Fetch team data
  useEffect(() => {
    if (!teamId || !mentorData) return;
    
    const fetchTeamData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}/api/mentor/team/${teamId}`, {
          params: { mentorId: mentorData._id }
        });
        
        if (response.data.success) {
          setTeam(response.data.team);
          
          // Also fetch team performance metrics
          const metricsResponse = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}/api/mentor/team-metrics/${teamId}`, {
            params: { mentorId: mentorData._id }
          });
          
          if (metricsResponse.data.success) {
            setTeamPerformanceMetrics(metricsResponse.data.metrics);
          }
        } else {
          setError(response.data.message || "Failed to fetch team data");
          toast.error(response.data.message || "Failed to fetch team data");
        }
      } catch (err) {
        console.error("Error fetching team data:", err);
        setError(err.response?.data?.message || "An error occurred while fetching team data");
        toast.error(err.response?.data?.message || "An error occurred while fetching team data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchTeamData();
  }, [teamId, mentorData, hasChanges]);

  // Handle leaving mentorship
  const handleLeaveMentorship = async (reason) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_APP_BASE_URL}/api/mentor/leave-team/${teamId}`, {
        mentorId: mentorData._id,
        reason
      });
      
      if (response.data.success) {
        toast.success("Successfully left the team mentorship");
        navigate('/mentor/dashboard');
      } else {
        toast.error(response.data.message || "Failed to leave mentorship");
      }
    } catch (err) {
      console.error("Error leaving mentorship:", err);
      toast.error(err.response?.data?.message || "An error occurred while leaving the mentorship");
    }
  };

  // Handle adding feedback notes
  const handleAddFeedback = async (notes) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_APP_BASE_URL}/api/mentor/team-feedback/${teamId}`, {
        mentorId: mentorData._id,
        feedback: notes
      });
      
      if (response.data.success) {
        toast.success("Feedback added successfully");
        setHasChanges(prev => !prev); // Toggle to refresh data
        setIsNotesModalOpen(false);
      } else {
        toast.error(response.data.message || "Failed to add feedback");
      }
    } catch (err) {
      console.error("Error adding feedback:", err);
      toast.error(err.response?.data?.message || "An error occurred while adding feedback");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121212]">
        <div className="p-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E8C848]"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#121212]">
        <div className="p-8">
          <div className="bg-[#1A1A1A] border border-gray-800 rounded-lg p-6 text-center">
            <AlertTriangle size={48} className="mx-auto text-[#E8C848] mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Error Loading Team</h2>
            <p className="text-gray-400 mb-4">{error}</p>
            <button 
              onClick={() => navigate('/mentor/dashboard')}
              className="px-4 py-2 bg-[#E8C848] text-[#121212] rounded-lg hover:bg-[#E8C848]/80 transition-colors"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen bg-[#121212]">
        <div className="p-8">
          <div className="bg-[#1A1A1A] border border-gray-800 rounded-lg p-6 text-center">
            <AlertTriangle size={48} className="mx-auto text-[#E8C848] mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Team Not Found</h2>
            <p className="text-gray-400 mb-4">The team you're looking for doesn't exist or you don't have permission to view it.</p>
            <button 
              onClick={() => navigate('/mentor/dashboard')}
              className="px-4 py-2 bg-[#E8C848] text-[#121212] rounded-lg hover:bg-[#E8C848]/80 transition-colors"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111111]">
      <div className="p-6">
        {/* Top bar with team info and actions */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center">
            <button 
              onClick={() => navigate('/mentor/dashboard')}
              className="mr-4 p-2 rounded-full hover:bg-[#1A1A1A] text-white"
            >
              <ArrowLeft size={20} />
            </button>
            
            <div className="flex items-center">
              <div className="h-16 w-16 rounded-lg mr-4 overflow-hidden bg-[#E8C848]/10 flex items-center justify-center">
                {team.logo ? (
                  <img src={team.logo} alt={team.name} className="w-full h-full object-cover" />
                ) : (
                  <Users size={32} className="text-[#E8C848]" />
                )}
              </div>
              
              <div>
                <h1 className="text-2xl font-bold text-white font-montserrat">{team.name}</h1>
                <p className="text-gray-400 font-inter">
                  {team.members.length} members • Mentoring since {new Date(team.mentor.joinedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button 
              onClick={() => setIsChatOpen(true)}
              className="px-4 py-2 bg-[#E8C848]/10 text-[#E8C848] rounded-lg hover:bg-[#E8C848]/20 transition-colors flex items-center"
            >
              <MessageCircle size={18} className="mr-2" />
              Message Team
            </button>
            
            <button 
              onClick={() => setIsNotesModalOpen(true)}
              className="px-4 py-2 bg-[#E8C848]/10 text-[#E8C848] rounded-lg hover:bg-[#E8C848]/20 transition-colors flex items-center"
            >
              <FileText size={18} className="mr-2" />
              Add Feedback
            </button>
            
            <button 
              onClick={() => setIsLeaveModalOpen(true)}
              className="px-4 py-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors flex items-center"
            >
              <X size={18} className="mr-2" />
              Leave Mentorship
            </button>
          </div>
        </div>
        
        {/* Navigation tabs */}
        <div className="border-b border-gray-800 mb-6">
          <nav className="flex space-x-8">
            {['overview', 'members', 'projects', 'activity', 'meetings'].map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab 
                    ? 'border-[#E8C848] text-[#E8C848]' 
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-700'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        {/* Main content area */}
        <div className="bg-[#1A1A1A] rounded-xl border border-gray-800 p-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Team Overview */}
              <div className="md:col-span-2 bg-[#1A1A1A] rounded-xl border border-gray-800 p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center text-white">
                  <Users size={20} className="mr-2 text-[#E8C848]" />
                  Team Overview
                </h2>
                {console.log(team)} 
                <p className="text-gray-400 mb-6">{team.description || "No team description provided."}</p>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-[#121212] rounded-lg p-4 border border-gray-800">
                    <h3 className="text-sm font-medium text-gray-400 mb-2">Team Founded</h3>
                    <p className="text-white font-medium">{new Date(team.formationDate).toLocaleDateString()}</p>
                  </div>
                  
                  <div className="bg-[#121212] rounded-lg p-4 border border-gray-800">
                    <h3 className="text-sm font-medium text-gray-400 mb-2">Last Active</h3>
                    <p className="text-white font-medium">{new Date(team.lastActivityDate).toLocaleDateString()}</p>
                  </div>
                  
                  <div className="bg-[#121212] rounded-lg p-4 border border-gray-800">
                    <h3 className="text-sm font-medium text-gray-400 mb-2">Team Size</h3>
                    <p className="text-white font-medium">{team.members.length} / {team.maxTeamSize} members</p>
                  </div>
                  
                  <div className="bg-[#121212] rounded-lg p-4 border border-gray-800">
                    <h3 className="text-sm font-medium text-gray-400 mb-2">Team Status</h3>
                    <div className="flex items-center">
                      <span className={`w-2 h-2 rounded-full mr-2 ${
                        team.status === 'active' ? 'bg-green-500' : 
                        team.status === 'inactive' ? 'bg-amber-500' : 'bg-red-500'
                      }`}></span>
                      <p className="text-white font-medium capitalize">{team.status}</p>
                    </div>
                  </div>
                </div>
                
                {team.techStack && team.techStack.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-400 mb-2 flex items-center">
                      <Code size={16} className="mr-1 text-[#E8C848]" />
                      Tech Stack
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {team.techStack.map((tech, idx) => (
                        <span 
                          key={idx} 
                          className="bg-[#E8C848]/10 text-[#E8C848] px-3 py-1 rounded-full text-sm"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Mentorship History */}
                <div className="mt-8">
                  <h3 className="text-sm font-medium text-gray-400 mb-4 flex items-center">
                    <Shield size={16} className="mr-1 text-[#E8C848]" />
                    Mentorship Notes & Feedback
                  </h3>
                  
                  {team.mentor.feedbackLog && team.mentor.feedbackLog.length > 0 ? (
                    <div className="space-y-4">
                      {team.mentor.feedbackLog.map((feedback, idx) => (
                        <div key={idx} className="border-l-2 border-[#E8C848] pl-4 py-1">
                          <p className="text-gray-300">{feedback.content}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(feedback.date).toLocaleDateString()} at {new Date(feedback.date).toLocaleTimeString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-[#121212] rounded-lg border border-gray-800">
                      <FileText size={28} className="mx-auto text-gray-400 mb-2" />
                      <p className="text-gray-400">No feedback notes yet</p>
                      <p className="text-sm text-gray-500">Add feedback to track this team's progress</p>
                      <button 
                        onClick={() => setIsNotesModalOpen(true)}
                        className="mt-3 px-4 py-2 bg-[#E8C848]/10 text-[#E8C848] rounded-lg hover:bg-[#E8C848]/20 transition-colors"
                      >
                        Add First Feedback
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Team Performance Metrics */}
              <div className="bg-[#1A1A1A] rounded-xl border border-gray-800 p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center text-white">
                  <BarChart4 size={20} className="mr-2 text-[#E8C848]" />
                  Team Performance
                </h2>
                
                {teamPerformanceMetrics ? (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-400 mb-2">Activity Level</h3>
                      <div className="w-full bg-gray-800 rounded-full h-2.5">
                        <div 
                          className="bg-[#E8C848] h-2.5 rounded-full" 
                          style={{ width: `${teamPerformanceMetrics.activityLevel}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between mt-1 text-xs text-gray-500">
                        <span>Low</span>
                        <span>Medium</span>
                        <span>High</span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">Active Projects</span>
                        <span className="font-medium text-white">{teamPerformanceMetrics.activeProjects}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">Completed Projects</span>
                        <span className="font-medium text-white">{teamPerformanceMetrics.completedProjects}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">Hackathon Participations</span>
                        <span className="font-medium text-white">{teamPerformanceMetrics.hackathonParticipations}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">Avg. Member Contribution</span>
                        <div className="flex items-center">
                          <span className="font-medium text-white mr-1">{teamPerformanceMetrics.avgMemberContribution}</span>
                          <span className="text-xs text-gray-500">/10</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">Team Cohesion</span>
                        <div className="flex items-center">
                          <span className="font-medium text-white mr-1">{teamPerformanceMetrics.teamCohesion}</span>
                          <span className="text-xs text-gray-500">/10</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Project Completion Rate */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-400 mb-2">Project Completion Rate</h3>
                      <div className="relative pt-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-[#E8C848] bg-[#E8C848]/10">
                              {teamPerformanceMetrics.projectCompletionRate}%
                            </span>
                          </div>
                        </div>
                        <div className="flex h-2 mt-2 bg-gray-800 rounded-full overflow-hidden">
                          <div 
                            style={{ width: `${teamPerformanceMetrics.projectCompletionRate}%` }} 
                            className="bg-[#E8C848]"
                          ></div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Recent Achievements */}
                    {teamPerformanceMetrics.recentAchievements && teamPerformanceMetrics.recentAchievements.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-400 mb-2 flex items-center">
                          <Award size={16} className="mr-1 text-[#E8C848]" />
                          Recent Achievements
                        </h3>
                        <ul className="space-y-2">
                          {teamPerformanceMetrics.recentAchievements.map((achievement, idx) => (
                            <li key={idx} className="text-sm flex items-start">
                              <span className="h-5 w-5 rounded-full bg-[#E8C848]/10 text-[#E8C848] flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                                <Award size={12} />
                              </span>
                              <span className="text-gray-300">{achievement}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {/* Overall Rating */}
                    <div className="mt-4 pt-4 border-t border-gray-800">
                      <h3 className="text-sm font-medium text-gray-400 mb-3">Overall Team Rating</h3>
                      <div className="flex items-center">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Zap 
                              key={i}
                              size={20} 
                              className={i < Math.round(teamPerformanceMetrics.overallRating / 2) 
                                ? "text-[#E8C848] fill-[#E8C848]" 
                                : "text-gray-800"
                              } 
                            />
                          ))}
                        </div>
                        <span className="ml-2 text-gray-300 font-medium">{teamPerformanceMetrics.overallRating}/10</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <BarChart4 size={32} className="mx-auto text-gray-800 mb-3" />
                    <p className="text-gray-400">Performance metrics unavailable</p>
                    <p className="text-sm text-gray-500">Data will be available as the team progresses</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {activeTab === 'members' && (
            <TeamMembersList 
              team={team} 
              mentorId={mentorData._id}
              onDataChange={() => setHasChanges(prev => !prev)}
            />
          )}
          
          {activeTab === 'projects' && (
            <TeamProjectsCard 
              team={team} 
              mentorId={mentorData._id}
              onDataChange={() => setHasChanges(prev => !prev)}
            />
          )}
          
          {activeTab === 'activity' && (
            <TeamActivityFeed 
              team={team} 
              mentorId={mentorData._id}
            />
          )}
          
          {activeTab === 'meetings' && (
            <MeetingScheduler 
              team={team} 
              mentorId={mentorData._id}
              onDataChange={() => setHasChanges(prev => !prev)}
            />
          )}
        </div>
      </div>
      
      {/* Chat Modal */}
      {team && (
        <TeamChatModal
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          team={team}
          currentUser={mentorData}
        />
      )}
      
      {/* Mentorship Notes Modal */}
      <MentorshipNotesModal
        isOpen={isNotesModalOpen}
        onClose={() => setIsNotesModalOpen(false)}
        onSubmit={handleAddFeedback}
        previousNotes={team?.mentor?.feedbackLog || []}
      />
      
      {/* Leave Mentorship Modal */}
      <LeaveMentorshipModal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        onConfirm={handleLeaveMentorship}
        teamName={team?.name}
      />
    </div>
  );
};

export default TeamManagement;