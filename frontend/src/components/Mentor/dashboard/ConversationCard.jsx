import React from 'react';
import { MessageCircle, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StudentPlaceholder from '../../../public/student_placeholder.png';
import MentorPlaceholder from '../../../public/mentor_placeholder.png';

const ConversationsCard = ({ conversations, onOpenChat, formatTimeAgo, isLoading }) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="bg-[#1A1A1A] p-6 rounded-xl shadow-sm border border-gray-800">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg flex items-center gap-2 text-white">
            <MessageCircle size={20} className="text-[#E8C848]" />
            Recent Conversations
          </h3>
          <div className="bg-[#E8C848]/10 text-[#E8C848] text-xs px-2 py-1 rounded-full animate-pulse">
            Loading...
          </div>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="animate-pulse flex justify-between items-center border-b border-gray-800 pb-3">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-[#1A1A1A] rounded-full mr-3"></div>
                <div>
                  <div className="h-4 bg-[#1A1A1A] rounded w-24 mb-2"></div>
                  <div className="h-3 bg-[#1A1A1A] rounded w-40"></div>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <div className="h-3 bg-[#1A1A1A] rounded w-10 mb-2"></div>
                <div className="h-6 bg-[#1A1A1A] rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1A1A1A] p-6 rounded-xl shadow-sm border border-gray-800">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg flex items-center gap-2 text-white">
          <MessageCircle size={20} className="text-[#E8C848]" />
          Recent Conversations
        </h3>
        <span className="bg-[#E8C848]/10 text-[#E8C848] text-xs px-2 py-1 rounded-full">
          {conversations.reduce((total, conv) => total + (conv.unreadCount || 0), 0)} Unread
        </span>
      </div>
      <div className="space-y-4">
        {conversations.map(conversation => (
          <div key={conversation.userId} className="flex items-center justify-between border-b border-gray-800 pb-3">
            <div className="flex items-center">
              <div className="relative">
                <img 
                  src={conversation.profilePicture || StudentPlaceholder} 
                  alt={conversation.name} 
                  className="w-10 h-10 rounded-full mr-3"
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
              <div>
                <p className="font-medium text-white">{conversation.name}</p>
                <p className="text-sm text-gray-400 truncate max-w-[200px]">
                  {conversation.lastMessage}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-xs text-gray-400">{formatTimeAgo(conversation.lastMessageTime)}</span>
              <button 
                className="bg-[#E8C848]/10 text-[#E8C848] px-3 py-1 rounded-lg text-sm mt-1 hover:bg-[#E8C848]/20 transition-colors"
                onClick={() => onOpenChat({
                  _id: conversation.userId,
                  name: conversation.name,
                  email: conversation.email,
                  profilePicture: conversation.profilePicture
                })}
              >
                Reply
              </button>
            </div>
          </div>
        ))}
        {conversations.length === 0 && (
          <div className="text-center text-gray-400 py-4">
            <MessageCircle size={24} className="mx-auto mb-2 text-gray-600" />
            <p>No conversations yet</p>
            <p className="text-sm mt-1">When students message you, they'll appear here</p>
          </div>
        )}
      </div>
      {conversations.length > 0 && (
        <button 
          onClick={() => navigate('/mentor/conversations')}
          className="text-[#E8C848] text-sm font-medium mt-4 hover:text-[#E8C848]/80 flex items-center group"
        >
          View All Messages 
          <ChevronRight size={16} className="ml-1 transition-transform group-hover:translate-x-1" />
        </button>
      )}
    </div>
  );
};

export default ConversationsCard;