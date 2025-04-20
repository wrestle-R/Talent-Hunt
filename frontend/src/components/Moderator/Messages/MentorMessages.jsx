import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Eye, MessageSquare, UserX, Check, Flag, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MentorMessages = ({ statusFilter, updateMessageStatus, isLoading: parentLoading }) => {
  const [mentorMessages, setMentorMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMentorMessages = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_APP_BASE_URL}/api/moderator/messages/reported?status=${statusFilter}&userType=mentor`
        );
        setMentorMessages(response.data);
      } catch (error) {
        console.error('Error fetching mentor reported messages:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMentorMessages();
  }, [statusFilter]);

  // If parent is loading, show parent's loader
  if (parentLoading) return null;

  return (
    <div className="bg-[#1A1A1A] rounded-lg border border-gray-800 overflow-hidden">
      {isLoading ? (
        <div className="p-8 text-center">
          <div className="animate-spin w-10 h-10 border-4 border-[#E8C848] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400">Loading mentor messages...</p>
        </div>
      ) : mentorMessages.length === 0 ? (
        <div className="p-8 text-center">
          <Flag size={48} className="mx-auto mb-4 text-gray-600" />
          <h3 className="text-lg font-medium text-gray-300 mb-2 font-montserrat">No reported mentor messages found</h3>
          <p className="text-gray-400 max-w-md mx-auto">
            {statusFilter === 'all' 
              ? "There are no reported mentor messages in the system." 
              : `There are no ${statusFilter} mentor reports at the moment.`}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-gray-800">
            <thead className="bg-[#111111]">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Message Content</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Mentor</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Sent To</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Reason</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-[#1A1A1A] divide-y divide-gray-800">
              {mentorMessages.map((message) => (
                <tr key={message._id} className="hover:bg-[#111111] transition-colors duration-200">
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-300 max-w-xs">
                      {message.message.length > 50 
                        ? `${message.message.substring(0, 50)}...` 
                        : message.message}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(message.createdAt).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 flex-shrink-0 mr-3">
                        <img 
                          className="h-8 w-8 rounded-full"
                          src={message.sender?.profilePicture || 'https://via.placeholder.com/40?text=👤'} 
                          alt={message.sender?.name || 'Mentor'} 
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/40?text=👤';
                          }}
                        />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-300">
                          {message.sender?.name || 'Unknown Mentor'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {message.sender?.email || ''}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 flex-shrink-0 mr-3">
                        <img 
                          className="h-8 w-8 rounded-full"
                          src={message.receiver?.profilePicture || 'https://via.placeholder.com/40?text=👤'} 
                          alt={message.receiver?.name || 'Recipient'} 
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/40?text=👤';
                          }}
                        />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-300">
                          {message.receiver?.name || 'Unknown Recipient'}
                        </div>
                        <div className="text-xs text-gray-500">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            message.receiver?.type === 'student' 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {message.receiver?.type === 'student' ? 'Student' : 'Mentor'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 capitalize">
                      {message.reportDetails.reason.replace(/_/g, ' ')}
                    </span>
                    {message.reportDetails.additionalInfo && (
                      <div className="text-xs text-gray-500 mt-1 max-w-xs truncate" title={message.reportDetails.additionalInfo}>
                        "{message.reportDetails.additionalInfo}"
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      message.reportDetails.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : message.reportDetails.status === 'reviewed'
                          ? 'bg-blue-100 text-blue-800'
                          : message.reportDetails.status === 'action_taken'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                    } capitalize`}>
                      {message.reportDetails.status.replace(/_/g, ' ')}
                    </span>
                    
                    {message.reportDetails.actionTaken && message.reportDetails.actionTaken !== 'none' && (
                      <div className="text-xs text-gray-500 mt-1">
                        Action: <span className="text-red-600 font-medium capitalize">{message.reportDetails.actionTaken.replace(/_/g, ' ')}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => navigate(`/moderator/message/${message._id}`)}
                        className="p-1 text-blue-600 hover:text-blue-800 rounded-full hover:bg-blue-50"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                      
                      <button 
                        onClick={() => navigate(`/moderator/conversation/${message.senderId}/${message.receiverId}`)}
                        className="p-1 text-indigo-600 hover:text-indigo-800 rounded-full hover:bg-indigo-50"
                        title="View Full Conversation"
                      >
                        <MessageSquare size={18} />
                      </button>
                      
                      {message.reportDetails.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => {
                              const notes = prompt('Add notes (optional):');
                              updateMessageStatus(message._id, 'action_taken', 'message_removed', notes);
                            }}
                            className="p-1 text-red-600 hover:text-red-800 rounded-full hover:bg-red-50"
                            title="Take Action"
                          >
                            <UserX size={18} />
                          </button>
                          
                          <button 
                            onClick={() => updateMessageStatus(message._id, 'dismissed', 'none')}
                            className="p-1 text-green-600 hover:text-green-800 rounded-full hover:bg-green-50"
                            title="Dismiss Report"
                          >
                            <Check size={18} />
                          </button>
                        </>
                      )}
                      
                      {message.reportDetails.status !== 'pending' && (
                        <button 
                          onClick={() => {
                            const confirm = window.confirm('Reset this report to pending status?');
                            if (confirm) updateMessageStatus(message._id, 'pending', null);
                          }}
                          className="p-1 text-amber-600 hover:text-amber-800 rounded-full hover:bg-amber-50"
                          title="Reset Status"
                        >
                          <RefreshCw size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MentorMessages;