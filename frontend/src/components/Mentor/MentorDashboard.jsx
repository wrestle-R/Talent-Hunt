import React, { useState, useEffect } from 'react';
import { Award, MessageCircle, Users, BarChart, ArrowLeft, RefreshCw } from 'lucide-react';
import axios from 'axios';
import UpcomingHackathons from '../Student/Dashboard/UpcomingHackathons';
import ConversationsCard from './dashboard/ConversationCard';
import MentorChatModal from './dashboard/MentorChatModal';
import TeamApplicationsCard from './Team/TeamApplicationsCard';
import CurrentMentorshipsCard from './Team/CurrentMentorshipsCard';
import TeamMembersList from './Team/TeamMembersList';
import TeamProjectsCard from './Team/TeamProjectsCard';
import TeamMemberProfile from './Team/TeamMemberProfile';
import { toast } from 'react-hot-toast';
import StudentPlaceholder from '../../public/student_placeholder.png';
import MentorPlaceholder from '../../public/mentor_placeholder.png';

const MentorDashboard = ({ userData, refreshUserData }) => {
  // States
  const [conversations, setConversations] = useState([]);
  const [activeMentorships, setActiveMentorships] = useState([]);
  const [teamApplications, setTeamApplications] = useState([]);
  const [mentorshipLoading, setMentorshipLoading] = useState(true);
  const [conversationsLoading, setConversationsLoading] = useState(true);
  const [applicationsLoading, setApplicationsLoading] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeStudent, setActiveStudent] = useState(null);
  const [dashboardRefreshTrigger, setDashboardRefreshTrigger] = useState(0);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [hackathonData, setHackathonData] = useState([]);
  const [hackathonLoading, setHackathonLoading] = useState(true);
  
  // Format time for messages
  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    
    return date.toLocaleDateString();
  };

  // Chat handlers
  const handleOpenChat = (student) => {
    setActiveStudent(student);
    setIsChatOpen(true);
  };

  const handleCloseChat = () => {
    setIsChatOpen(false);
    setActiveStudent(null);
    fetchConversations();
  };

  // Dashboard refresh
  const refreshDashboard = () => {
    setDashboardRefreshTrigger(prev => prev + 1);
    fetchAllData();
    toast.success("Dashboard refreshed");
  };

  // Fetch all dashboard data
  const fetchAllData = () => {
    fetchActiveMentorships();
    fetchTeamApplications();
    fetchConversations();
    fetchHackathons();
  };

  // Fetch active mentorships
  const fetchActiveMentorships = async () => {
    if (!userData?._id) {
      setMentorshipLoading(false);
      return;
    }
    
    try {
      setMentorshipLoading(true);
      const response = await axios.get(`http://localhost:4000/api/mentor/active-mentorships/${userData._id}`);
      console.log("Mentorships data:", response.data);
      setActiveMentorships(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching active mentorships:", error);
      setActiveMentorships([]);
    } finally {
      setMentorshipLoading(false);
    }
  };

  // Fetch team applications
  const fetchTeamApplications = async () => {
    if (!userData?._id) {
      setApplicationsLoading(false);
      return;
    }
    
    try {
      setApplicationsLoading(true);
      const response = await axios.get(`http://localhost:4000/api/mentor/team-applications/${userData._id}`);
      console.log("Applications data:", response.data);
      setTeamApplications(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching team applications:", error);
      setTeamApplications([]);
    } finally {
      setApplicationsLoading(false);
    }
  };

  // Fetch conversations
  const fetchConversations = async () => {
    if (!userData?._id) {
      setConversationsLoading(false);
      return;
    }
    
    try {
      setConversationsLoading(true);
      const response = await axios.get(`http://localhost:4000/api/mentor/conversations/${userData._id}`);
      console.log("Conversations data:", response.data);
      setConversations(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      setConversations([]);
    } finally {
      setConversationsLoading(false);
    }
  };

  // Fetch upcoming hackathons
  const fetchHackathons = async () => {
    try {
      setHackathonLoading(true);
      const response = await axios.get('http://localhost:4000/api/hackathons/upcoming');
      console.log("Hackathons data:", response.data);
      setHackathonData(response.data);
    } catch (error) {
      console.error("Error fetching hackathons:", error);
      setHackathonData([]);
    } finally {
      setHackathonLoading(false);
    }
  };

  // Team and member actions
  const handleViewTeam = async (team) => {
    try {
      const response = await axios.get(
        `http://localhost:4000/api/mentor/team/${team._id}?mentorId=${userData._id}`
      );
      
      if (response.data && response.data.success) {
        console.log("Full team data:", response.data.team);
        setSelectedTeam({
          ...team,
          ...response.data.team,
          performanceMetrics: response.data.performanceMetrics
        });
      } else {
        throw new Error("Failed to fetch complete team data");
      }
    } catch (error) {
      console.error("Error fetching team details:", error);
      toast.error("Could not load team details");
      // Still set the basic team info we already have
      setSelectedTeam(team);
    }
  };

  const handleBackToDashboard = () => {
    setSelectedTeam(null);
  };

  const handleViewMemberProfile = async (memberId) => {
    try {
      // First find the member in the current team to get basic info
      const memberBasicInfo = selectedTeam.members.find(
        m => m.student._id.toString() === memberId.toString()
      );
      
      if (!memberBasicInfo) {
        throw new Error("Member not found in team");
      }
      
      // Now fetch detailed profile
      const response = await axios.get(
        `http://localhost:4000/api/mentor/student-profile/${memberId}?mentorId=${userData._id}`
      );
      
      if (response.data && response.data.success) {
        console.log("Member profile data:", response.data);
        
        setSelectedMember({
          ...memberBasicInfo,
          ...response.data.student,
          feedback: response.data.feedback || []
        });
        
        setIsProfileOpen(true);
      } else {
        throw new Error("Failed to fetch member profile");
      }
    } catch (error) {
      console.error("Error fetching member profile:", error);
      toast.error("Could not load member profile");
      // Fall back to basic info if available
      if (memberBasicInfo) {
        setSelectedMember(memberBasicInfo);
        setIsProfileOpen(true);
      }
    }
  };

  const handleCloseProfile = () => {
    setIsProfileOpen(false);
    setTimeout(() => setSelectedMember(null), 300);
  };

  // Initial data fetch
  useEffect(() => {
    if (userData?._id) {
      fetchAllData();
      
      // Set up polling every 5 minutes
      const interval = setInterval(fetchAllData, 300000);
      return () => clearInterval(interval);
    }
  }, [userData?._id]);

  // Loading state
  if (!userData?._id) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#121212]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E8C848] mb-4"></div>
          <p className="text-gray-400">Loading mentor dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] py-8">
      <div className="w-full px-6 md:px-8 max-w-7xl mx-auto space-y-8">
        {!selectedTeam ? (
          <>
            {/* Dashboard Header */}
            <div className="flex justify-between items-center mb-12">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-white">Welcome, {userData.name}!</h2>
                <p className="text-gray-400 mt-2">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
              <button 
                onClick={refreshDashboard}
                className="flex items-center gap-2 text-sm bg-[#E8C848]/10 text-[#E8C848] px-4 py-2 rounded-lg hover:bg-[#E8C848]/20 transition-all duration-300"
              >
                <RefreshCw size={18} />
                <span className="hidden sm:inline">Refresh Dashboard</span>
              </button>
            </div>
            
            {/* Team Management Section */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 mb-6">
                <Users className="text-[#E8C848]" size={24} />
                <h3 className="text-xl font-semibold text-white">Team Management</h3>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TeamApplicationsCard 
                  applications={teamApplications}
                  mentorData={userData}
                  onRefresh={refreshDashboard}
                  isLoading={applicationsLoading}
                  key={`applications-${dashboardRefreshTrigger}`}
                />
                
                <CurrentMentorshipsCard 
                  mentorships={activeMentorships}
                  mentorData={userData}
                  onViewTeam={handleViewTeam}
                  isLoading={mentorshipLoading}
                  key={`mentorships-${dashboardRefreshTrigger}`}
                />
              </div>
            </section>
            
            {/* Recent Conversations Section */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 mb-6">
                <MessageCircle className="text-[#E8C848]" size={24} />
                <h3 className="text-xl font-semibold text-white">Recent Conversations</h3>
              </div>
              
              <div className="w-full">
                <ConversationsCard 
                  conversations={conversations} 
                  onOpenChat={handleOpenChat} 
                  formatTimeAgo={formatTimeAgo}
                  isLoading={conversationsLoading} 
                />
              </div>
            </section>
            
            {/* Upcoming Hackathons Section - Full Width */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 mb-6">
                <Award className="text-[#E8C848]" size={24} />
                <h3 className="text-xl font-semibold text-white">Upcoming Hackathons</h3>
              </div>
              
              <div className="bg-[#1A1A1A] p-6 rounded-xl shadow-sm border border-gray-800">
                <UpcomingHackathons 
                  limit={6} 
                  layout="grid"
                  gridCols="grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                  customData={hackathonData}
                  isLoading={hackathonLoading}
                />
              </div>
            </section>
          </>
        ) : (
          // Team Details View
          <>
            {/* Team Details Header */}
            <div className="mb-6">
              <button 
                onClick={handleBackToDashboard}
                className="flex items-center gap-1 text-sm text-gray-400 hover:text-white mb-4"
              >
                <ArrowLeft size={16} />
                Back to Dashboard
              </button>
              
              <div className="bg-[#1A1A1A] rounded-xl shadow-sm p-4 md:p-6 border border-gray-800">
                <div className="flex items-start gap-4">
                  <div className="h-14 w-14 rounded-lg overflow-hidden bg-[#E8C848]/10 flex items-center justify-center flex-shrink-0">
                    {selectedTeam.logo ? (
                      <img 
                        src={selectedTeam.logo} 
                        alt={selectedTeam.name} 
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Users size={24} className="text-[#E8C848]" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-xl font-bold text-white">{selectedTeam.name}</h2>
                        <p className="text-gray-400 text-sm">
                          {selectedTeam.members?.length || 0} members • Mentoring since {new Date(selectedTeam.mentorJoinedDate || selectedTeam.mentor?.joinedAt).toLocaleDateString()}
                        </p>
                      </div>
                      
                      {/* Performance Score */}
                      {selectedTeam.performanceMetrics && (
                        <div className="bg-[#E8C848]/10 text-[#E8C848] px-4 py-2 rounded-lg text-center">
                          <div className="text-sm uppercase font-semibold tracking-wide">Team Score</div>
                          <div className="text-2xl font-bold">{selectedTeam.performanceMetrics.overallRating || '7.5'}/10</div>
                        </div>
                      )}
                    </div>
                    
                    {selectedTeam.description && (
                      <p className="text-gray-300 mt-2 max-w-2xl">
                        {selectedTeam.description}
                      </p>
                    )}
                    
                    {selectedTeam.techStack && selectedTeam.techStack.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {selectedTeam.techStack.map((tech, idx) => (
                          <span 
                            key={idx} 
                            className="px-2 py-0.5 bg-[#E8C848]/10 text-[#E8C848] rounded-full text-xs"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Team Details Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              <TeamMembersList 
                team={selectedTeam} 
                mentorId={userData._id}
                onDataChange={refreshDashboard}
                onViewProfile={handleViewMemberProfile}
              />
              
              <TeamProjectsCard 
                team={selectedTeam} 
                mentorId={userData._id}
                onDataChange={refreshDashboard}
              />
            </div>
          </>
        )}
        
        {/* Modals */}
        <MentorChatModal
          isOpen={isChatOpen}
          onClose={handleCloseChat}
          student={activeStudent}
          mentorData={userData}
        />

        {selectedMember && (
          <TeamMemberProfile
            isOpen={isProfileOpen}
            onClose={handleCloseProfile}
            member={selectedMember}
            mentorId={userData._id}
            onDataChange={refreshDashboard}
          />
        )}
      </div>
    </div>
  );
};

export default MentorDashboard;