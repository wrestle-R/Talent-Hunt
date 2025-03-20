import React from 'react';
import { MessageCircle, ChevronRight } from 'lucide-react';

const ConversationsCard = ({ conversations, onOpenChat, formatTimeAgo, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <MessageCircle size={20} className="text-blue-600" />
            Recent Conversations
          </h3>
          <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full animate-pulse">
            Loading...
          </div>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="animate-pulse flex justify-between items-center border-b pb-3">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-200 rounded-full mr-3"></div>
                <div>
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-40"></div>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <div className="h-3 bg-gray-200 rounded w-10 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <MessageCircle size={20} className="text-blue-600" />
          Recent Conversations
        </h3>
        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
          {conversations.reduce((total, conv) => total + (conv.unreadCount || 0), 0)} Unread
        </span>
      </div>
      <div className="space-y-4">
        {conversations.map(conversation => (
          <div key={conversation.userId} className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center">
              <div className="relative">
                <img 
                  src={conversation.profilePicture || 'https://via.placeholder.com/40?text=👤'} 
                  alt={conversation.name} 
                  className="w-10 h-10 rounded-full mr-3"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/40?text=👤';
                  }}
                />
                {conversation.unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                    {conversation.unreadCount}
                  </span>
                )}
              </div>
              <div>
                <p className="font-medium">{conversation.name}</p>
                <p className="text-sm text-gray-500 truncate max-w-[200px]">
                  {conversation.lastMessage}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-xs text-gray-500">{formatTimeAgo(conversation.lastMessageTime)}</span>
              <button 
                className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-sm mt-1 hover:bg-blue-200 transition-colors"
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
          <div className="text-center text-gray-500 py-4">
            <MessageCircle size={24} className="mx-auto mb-2 text-gray-300" />
            <p>No conversations yet</p>
            <p className="text-sm mt-1">When students message you, they'll appear here</p>
          </div>
        )}
      </div>
      {conversations.length > 0 && (
        <button className="text-blue-600 text-sm font-medium mt-4 hover:text-blue-800 flex items-center">
          View All Messages <ChevronRight size={16} />
        </button>
      )}
    </div>
  );
};

export default ConversationsCard;