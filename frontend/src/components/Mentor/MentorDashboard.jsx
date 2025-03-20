import React, { useState, useEffect } from 'react';
import { Award, MessageCircle } from 'lucide-react';
import axios from 'axios';
import UpcomingHackathons from '../Student/Dashboard/UpcomingHackathons';
import ConversationsCard from './dashboard/ConversationCard';
import MentorChatModal from './dashboard/MentorChatModal';

// Dashboard component showing hackathons and conversations
const MentorDashboard = ({ 
  hackathonData = [], 
  isLoading = false,
  refreshHackathons,
  userData
}) => {
  const [conversations, setConversations] = useState([]);
  const [conversationsLoading, setConversationsLoading] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeStudent, setActiveStudent] = useState(null);
  const [pollingInterval, setPollingInterval] = useState(null);

  // Function to format relative time
  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'Just now';
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    
    return date.toLocaleDateString();
  };

  // Function to open chat with a specific student
  const handleOpenChat = (student) => {
    setActiveStudent(student);
    setIsChatOpen(true);
  };

  // Function to close the chat
  const handleCloseChat = () => {
    setIsChatOpen(false);
    setActiveStudent(null);
    
    // Refresh conversations after closing chat to update unread counts
    fetchConversations();
  };

  // Function to fetch recent conversations
  const fetchConversations = async () => {
    if (!userData || !userData._id) {
      console.log("Missing mentor data, can't fetch conversations");
      setConversationsLoading(false);
      return;
    }
    
    try {
      setConversationsLoading(true);
      const response = await axios.get(`http://localhost:4000/api/mentor/conversations/${userData._id}`);
      
      if (Array.isArray(response.data)) {
        setConversations(response.data);
      } else {
        console.warn("Unexpected conversations response format:", response.data);
        setConversations([]);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
      // Set empty array on error
      setConversations([]);
    } finally {
      setConversationsLoading(false);
    }
  };

  // Set up polling for conversations
  useEffect(() => {
    if (userData && userData._id) {
      // Fetch conversations immediately
      fetchConversations();
      
      // Set up polling every 5 minutes (300000 ms)
      const interval = setInterval(fetchConversations, 300000);
      setPollingInterval(interval);
      
      // Clean up interval on unmount
      return () => {
        if (pollingInterval) clearInterval(pollingInterval);
      };
    }
  }, [userData]);

  // Display a loading spinner for the whole dashboard
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="w-full p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <MessageCircle size={28} className="text-blue-600" />
          Mentor Dashboard
        </h2>
        {refreshHackathons && (
          <button 
            onClick={refreshHackathons}
            className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-lg hover:bg-blue-200"
          >
            Refresh
          </button>
        )}
      </div>
      
      {/* Main content - dashboard with conversations and hackathons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversations Card */}
        <ConversationsCard 
          conversations={conversations} 
          onOpenChat={handleOpenChat} 
          formatTimeAgo={formatTimeAgo}
          isLoading={conversationsLoading} 
        />
        
        {/* Upcoming Hackathons Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="font-bold text-lg flex items-center gap-2 mb-4">
            <Award size={20} className="text-purple-600" />
            Upcoming Hackathons
          </h3>
          
          {/* Using UpcomingHackathons with grid layout */}
          <UpcomingHackathons limit={4} layout="grid" />
        </div>
      </div>
      
      {/* Chat Modal */}
      <MentorChatModal
        isOpen={isChatOpen}
        onClose={handleCloseChat}
        student={activeStudent}
        mentorData={userData}
      />
    </div>
  );
};

export default MentorDashboard;