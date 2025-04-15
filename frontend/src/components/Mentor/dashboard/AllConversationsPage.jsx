import React, { useState, useEffect } from 'react';
import { ArrowLeft, MessageCircle, Search, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import StudentPlaceholder from '../../../public/student_placeholder.png';
import MentorChatModal from './MentorChatModal';

const AllConversationsPage = () => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Get user data from localStorage
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      toast.error('Please login to continue');
      navigate('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      setUserData(parsedUser);
    } catch (error) {
      console.error('Error parsing user data:', error);
      toast.error('Session expired. Please login again');
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    if (userData?._id) {
      fetchAllConversations();
    }
  }, [userData]);

  const fetchAllConversations = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}/api/mentor/conversations/all/${userData._id}`);
      setConversations(response.data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  const handleOpenChat = (student) => {
    setSelectedStudent(student);
    setIsChatOpen(true);
  };

  const filteredConversations = conversations.filter(conv => 
    conv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.lastMessage?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#111111]">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button 
            onClick={() => navigate('/')}
            className="mr-4 p-2 rounded-full bg-[#1A1A1A] text-[#E8C848] hover:bg-[#E8C848]/10 transition-all duration-300"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-white font-montserrat">All Conversations</h1>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={20} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-800 rounded-lg bg-[#1A1A1A] text-white placeholder-gray-400 focus:outline-none focus:border-[#E8C848]/50"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Conversations List */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="animate-pulse bg-[#1A1A1A] p-4 rounded-lg border border-gray-800">
                <div className="flex items-center space-x-4">
                  <div className="rounded-full bg-gray-800 h-12 w-12"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-800 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-800 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.userId}
                className="bg-[#1A1A1A] p-4 rounded-lg border border-gray-800 hover:border-[#E8C848]/30 transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center flex-1">
                    <div className="relative">
                      <img
                        src={conversation.profilePicture || StudentPlaceholder}
                        alt={conversation.name}
                        className="w-12 h-12 rounded-full"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = StudentPlaceholder;
                        }}
                      />
                      {conversation.unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-[#E8C848] text-[#121212] text-xs w-5 h-5 flex items-center justify-center rounded-full">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="text-white font-medium">{conversation.name}</h3>
                      <p className="text-gray-400 text-sm">{conversation.lastMessage}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end ml-4">
                    <span className="text-gray-400 text-sm mb-2">
                      {formatTimeAgo(conversation.lastMessageTime)}
                    </span>
                    <button
                      onClick={() => handleOpenChat(conversation)}
                      className="bg-[#E8C848]/10 text-[#E8C848] px-3 py-1 rounded-lg text-sm hover:bg-[#E8C848]/20 transition-all duration-300"
                    >
                      Message
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredConversations.length === 0 && (
              <div className="text-center py-12 bg-[#1A1A1A] rounded-lg border border-gray-800">
                <MessageCircle size={40} className="mx-auto text-gray-600 mb-4" />
                <h3 className="text-white font-medium mb-1">No conversations found</h3>
                <p className="text-gray-400">No messages match your search criteria</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Chat Modal */}
      <MentorChatModal
        isOpen={isChatOpen}
        onClose={() => {
          setIsChatOpen(false);
          setSelectedStudent(null);
          fetchAllConversations(); // Refresh conversations when chat is closed
        }}
        student={selectedStudent}
        mentorData={userData}
      />
    </div>
  );
};

export default AllConversationsPage;
