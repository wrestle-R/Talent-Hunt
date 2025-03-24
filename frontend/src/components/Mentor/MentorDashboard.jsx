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

const MentorDashboard = ({ 
  hackathonData = [], 
  isLoading = false,
  refreshHackathons,
  userData
}) => {
  // States
  const [conversations, setConversations] = useState([]);
  const [conversationsLoading, setConversationsLoading] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeStudent, setActiveStudent] = useState(null);
  const [dashboardRefreshTrigger, setDashboardRefreshTrigger] = useState(0);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

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
    fetchConversations();
    if (refreshHackathons) refreshHackathons();
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
      setConversations(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      setConversations([]);
    } finally {
      setConversationsLoading(false);
    }
  };

  // Team and member actions
  const handleViewTeam = (team) => {
    setSelectedTeam(team);
  };

  const handleBackToDashboard = () => {
    setSelectedTeam(null);
  };

  const handleViewMemberProfile = (member) => {
    setSelectedMember(member);
    setIsProfileOpen(true);
  };

  const handleCloseProfile = () => {
    setIsProfileOpen(false);
    setTimeout(() => setSelectedMember(null), 300);
  };

  // Initial data fetch
  useEffect(() => {
    if (userData?._id) {
      fetchConversations();
      
      // Set up polling every 5 minutes
      const interval = setInterval(fetchConversations, 300000);
      return () => clearInterval(interval);
    }
  }, [userData]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="w-full p-4 md:p-6 max-w-7xl mx-auto">
      {!selectedTeam ? (
        // Main Dashboard View
        <>
          {/* Dashboard Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl md:text-2xl font-bold">Mentor Dashboard</h2>
            <button 
              onClick={refreshDashboard}
              className="flex items-center gap-1 text-sm bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100"
            >
              <RefreshCw size={16} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
          
          {/* Mentorships Section */}
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Users className="text-indigo-600" size={20} />
              <h3 className="text-lg font-semibold text-gray-800">Team Management</h3>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              <TeamApplicationsCard 
                mentorData={userData}
                onRefresh={refreshDashboard}
                key={`applications-${dashboardRefreshTrigger}`}
              />
              
              <CurrentMentorshipsCard 
                mentorData={userData}
                onViewTeam={handleViewTeam}
                key={`mentorships-${dashboardRefreshTrigger}`}
              />
            </div>
          </section>
          
          {/* Communications Section */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <MessageCircle className="text-blue-600" size={20} />
              <h3 className="text-lg font-semibold text-gray-800">Communication & Events</h3>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              <ConversationsCard 
                conversations={conversations} 
                onOpenChat={handleOpenChat} 
                formatTimeAgo={formatTimeAgo}
                isLoading={conversationsLoading} 
              />
              
              <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm">
                <h3 className="font-bold text-lg flex items-center gap-2 mb-4">
                  <Award size={20} className="text-purple-600" />
                  Upcoming Hackathons
                </h3>
                <UpcomingHackathons limit={4} layout="grid" />
              </div>
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
              className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </button>
            
            <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
              <div className="flex items-start gap-4">
                <div className="h-14 w-14 rounded-lg overflow-hidden bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  {selectedTeam.logo ? (
                    <img 
                      src={selectedTeam.logo} 
                      alt={selectedTeam.name} 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Users size={24} className="text-emerald-600" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold">{selectedTeam.name}</h2>
                  <p className="text-gray-500 text-sm">
                    {selectedTeam.members?.length || 0} members • Mentoring since {new Date(selectedTeam.mentorJoinedDate).toLocaleDateString()}
                  </p>
                  {selectedTeam.description && (
                    <p className="text-gray-700 mt-2 max-w-2xl">
                      {selectedTeam.description}
                    </p>
                  )}
                  
                  {selectedTeam.techStack && selectedTeam.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {selectedTeam.techStack.map((tech, idx) => (
                        <span 
                          key={idx} 
                          className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-xs"
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
  );
};

export default MentorDashboard;