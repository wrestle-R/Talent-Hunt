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
import MentorLayout from '../../components/Layouts/MentorLayout';
import TeamMembersList from '../../components/Mentor/Team/TeamMembersList';
import TeamProjectsCard from '../../components/Mentor/Team/TeamProjectsCard';
import TeamChatModal from '../../components/Mentor/Team/TeamChatModal';

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
        const response = await axios.get(`http://localhost:4000/api/mentor/team/${teamId}`, {
          params: { mentorId: mentorData._id }
        });
        
        if (response.data.success) {
          setTeam(response.data.team);
          
          // Also fetch team performance metrics
          const metricsResponse = await axios.get(`http://localhost:4000/api/mentor/team-metrics/${teamId}`, {
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
      const response = await axios.post(`http://localhost:4000/api/mentor/leave-team/${teamId}`, {
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
      const response = await axios.post(`http://localhost:4000/api/mentor/team-feedback/${teamId}`, {
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
      <MentorLayout>
        <div className="p-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
          </div>
        </div>
      </MentorLayout>
    );
  }

  if (error) {
    return (
      <MentorLayout>
        <div className="p-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertTriangle size={48} className="mx-auto text-red-500 mb-4" />
            <h2 className="text-xl font-bold text-red-700 mb-2">Error Loading Team</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => navigate('/mentor/dashboard')}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </MentorLayout>
    );
  }

  if (!team) {
    return (
      <MentorLayout>
        <div className="p-8">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
            <AlertTriangle size={48} className="mx-auto text-amber-500 mb-4" />
            <h2 className="text-xl font-bold text-amber-700 mb-2">Team Not Found</h2>
            <p className="text-amber-600 mb-4">The team you're looking for doesn't exist or you don't have permission to view it.</p>
            <button 
              onClick={() => navigate('/mentor/dashboard')}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </MentorLayout>
    );
  }

  return (
    <MentorLayout>
      <div className="p-6">
        {/* Top bar with team info and actions */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center">
            <button 
              onClick={() => navigate('/mentor/dashboard')}
              className="mr-4 p-2 rounded-full hover:bg-gray-100"
            >
              <ArrowLeft size={20} />
            </button>
            
            <div className="flex items-center">
              <div className="h-16 w-16 rounded-lg mr-4 overflow-hidden bg-emerald-100 flex items-center justify-center">
                {team.logo ? (
                  <img 
                    src={team.logo} 
                    alt={team.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Users size={32} className="text-emerald-600" />
                )}
              </div>
              
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{team.name}</h1>
                <p className="text-gray-500">
                  {team.members.length} members • Mentoring since {new Date(team.mentor.joinedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button 
              onClick={() => setIsChatOpen(true)}
              className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors flex items-center"
            >
              <MessageCircle size={18} className="mr-2" />
              Message Team
            </button>
            
            <button 
              onClick={() => setIsNotesModalOpen(true)}
              className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors flex items-center"
            >
              <FileText size={18} className="mr-2" />
              Add Feedback
            </button>
            
            <button 
              onClick={() => setIsLeaveModalOpen(true)}
              className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center"
            >
              <X size={18} className="mr-2" />
              Leave Mentorship
            </button>
          </div>
        </div>
        
        {/* Navigation tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview' 
                  ? 'border-emerald-500 text-emerald-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            
            <button 
              onClick={() => setActiveTab('members')}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'members' 
                  ? 'border-emerald-500 text-emerald-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Members
            </button>
            
            <button 
              onClick={() => setActiveTab('projects')}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'projects' 
                  ? 'border-emerald-500 text-emerald-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Projects
            </button>
            
            <button 
              onClick={() => setActiveTab('activity')}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'activity' 
                  ? 'border-emerald-500 text-emerald-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Activity
            </button>
            
            <button 
              onClick={() => setActiveTab('meetings')}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'meetings' 
                  ? 'border-emerald-500 text-emerald-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Meetings
            </button>
          </nav>
        </div>
        
        {/* Main content based on active tab */}
        <div className="mb-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Team Overview */}
              <div className="md:col-span-2 bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <Users size={20} className="mr-2 text-emerald-600" />
                  Team Overview
                </h2>
                
                <p className="text-gray-600 mb-6">{team.description || "No team description provided."}</p>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Team Founded</h3>
                    <p className="text-gray-800 font-medium">{new Date(team.formationDate).toLocaleDateString()}</p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Last Active</h3>
                    <p className="text-gray-800 font-medium">{new Date(team.lastActivityDate).toLocaleDateString()}</p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Team Size</h3>
                    <p className="text-gray-800 font-medium">{team.members.length} / {team.maxTeamSize} members</p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Team Status</h3>
                    <div className="flex items-center">
                      <span className={`w-2 h-2 rounded-full mr-2 ${
                        team.status === 'active' ? 'bg-green-500' : 
                        team.status === 'inactive' ? 'bg-amber-500' : 'bg-red-500'
                      }`}></span>
                      <p className="text-gray-800 font-medium capitalize">{team.status}</p>
                    </div>
                  </div>
                </div>
                
                {team.techStack && team.techStack.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-600 mb-2 flex items-center">
                      <Code size={16} className="mr-1 text-emerald-600" />
                      Tech Stack
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {team.techStack.map((tech, idx) => (
                        <span 
                          key={idx} 
                          className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-sm"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Mentorship History */}
                <div className="mt-8">
                  <h3 className="text-sm font-medium text-gray-600 mb-4 flex items-center">
                    <Shield size={16} className="mr-1 text-emerald-600" />
                    Mentorship Notes & Feedback
                  </h3>
                  
                  {team.mentor.feedbackLog && team.mentor.feedbackLog.length > 0 ? (
                    <div className="space-y-4">
                      {team.mentor.feedbackLog.map((feedback, idx) => (
                        <div key={idx} className="border-l-2 border-emerald-400 pl-4 py-1">
                          <p className="text-gray-700">{feedback.content}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(feedback.date).toLocaleDateString()} at {new Date(feedback.date).toLocaleTimeString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <FileText size={28} className="mx-auto text-gray-400 mb-2" />
                      <p className="text-gray-500">No feedback notes yet</p>
                      <p className="text-sm text-gray-400">Add feedback to track this team's progress</p>
                      <button 
                        onClick={() => setIsNotesModalOpen(true)}
                        className="mt-3 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors"
                      >
                        Add First Feedback
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Team Performance Metrics */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <BarChart4 size={20} className="mr-2 text-emerald-600" />
                  Team Performance
                </h2>
                
                {teamPerformanceMetrics ? (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-600 mb-2">Activity Level</h3>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-emerald-600 h-2.5 rounded-full" 
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
                        <span className="text-sm text-gray-600">Active Projects</span>
                        <span className="font-medium">{teamPerformanceMetrics.activeProjects}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Completed Projects</span>
                        <span className="font-medium">{teamPerformanceMetrics.completedProjects}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Hackathon Participations</span>
                        <span className="font-medium">{teamPerformanceMetrics.hackathonParticipations}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Avg. Member Contribution</span>
                        <div className="flex items-center">
                          <span className="font-medium mr-1">{teamPerformanceMetrics.avgMemberContribution}</span>
                          <span className="text-xs text-gray-500">/10</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Team Cohesion</span>
                        <div className="flex items-center">
                          <span className="font-medium mr-1">{teamPerformanceMetrics.teamCohesion}</span>
                          <span className="text-xs text-gray-500">/10</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Project Completion Rate */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-600 mb-2">Project Completion Rate</h3>
                      <div className="relative pt-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-emerald-600 bg-emerald-100">
                              {teamPerformanceMetrics.projectCompletionRate}%
                            </span>
                          </div>
                        </div>
                        <div className="flex h-2 mt-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            style={{ width: `${teamPerformanceMetrics.projectCompletionRate}%` }} 
                            className="bg-emerald-500"
                          ></div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Recent Achievements */}
                    {teamPerformanceMetrics.recentAchievements && teamPerformanceMetrics.recentAchievements.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-600 mb-2 flex items-center">
                          <Award size={16} className="mr-1 text-emerald-600" />
                          Recent Achievements
                        </h3>
                        <ul className="space-y-2">
                          {teamPerformanceMetrics.recentAchievements.map((achievement, idx) => (
                            <li key={idx} className="text-sm flex items-start">
                              <span className="h-5 w-5 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                                <Award size={12} />
                              </span>
                              <span className="text-gray-700">{achievement}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {/* Overall Rating */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <h3 className="text-sm font-medium text-gray-600 mb-3">Overall Team Rating</h3>
                      <div className="flex items-center">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Zap 
                              key={i}
                              size={20} 
                              className={i < Math.round(teamPerformanceMetrics.overallRating / 2) 
                                ? "text-amber-400 fill-amber-400" 
                                : "text-gray-300"
                              } 
                            />
                          ))}
                        </div>
                        <span className="ml-2 text-gray-700 font-medium">{teamPerformanceMetrics.overallRating}/10</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <BarChart4 size={32} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500">Performance metrics unavailable</p>
                    <p className="text-sm text-gray-400">Data will be available as the team progresses</p>
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
    </MentorLayout>
  );
};

export default TeamManagement;