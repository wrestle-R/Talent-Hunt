import React, { useState, useEffect } from 'react';
import { Flag, MessageSquare, Filter, Check, X, AlertTriangle, Eye, RefreshCw, UserX, Info } from 'lucide-react';
import StudentMessages from './StudentMessages';
import MentorMessages from './MentorMessages';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Messages = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [reportedMessages, setReportedMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    reviewed: 0,
    actionTaken: 0,
    dismissed: 0,
    student: 0,
    mentor: 0
  });
  const navigate = useNavigate();

  // Fetch reported messages
  const fetchReportedMessages = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`http://localhost:4000/api/moderator/messages/reported?status=${statusFilter}`);
      setReportedMessages(response.data);
      
      // Calculate stats
      const newStats = {
        total: response.data.length,
        pending: response.data.filter(msg => msg.reportDetails.status === 'pending').length,
        reviewed: response.data.filter(msg => msg.reportDetails.status === 'reviewed').length,
        actionTaken: response.data.filter(msg => msg.reportDetails.status === 'action_taken').length,
        dismissed: response.data.filter(msg => msg.reportDetails.status === 'dismissed').length,
        student: response.data.filter(msg => msg.sender?.type === 'student').length,
        mentor: response.data.filter(msg => msg.sender?.type === 'mentor').length
      };
      setStats(newStats);
    } catch (error) {
      console.error('Error fetching reported messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReportedMessages();
  }, [statusFilter]);

  const handleStatusChange = (status) => {
    setStatusFilter(status);
  };

  const updateMessageStatus = async (messageId, newStatus, actionTaken = null, notes = null) => {
    try {
      await axios.put(`http://localhost:4000/api/moderator/messages/reported/${messageId}`, {
        status: newStatus,
        actionTaken: actionTaken,
        moderatorNotes: notes,
        moderatorId: "moderator123" // This should be the actual moderator ID in a real app
      });
      
      // Refresh messages after update
      fetchReportedMessages();
    } catch (error) {
      console.error('Error updating message status:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <Flag className="mr-2 text-red-500" size={24} />
            Reported Messages
          </h1>
          <p className="text-gray-600 mt-1">
            Review and moderate reported messages from users
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex items-center gap-3">
          <button 
            onClick={() => fetchReportedMessages()}
            className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 px-3 py-1.5 rounded-md bg-indigo-50 hover:bg-indigo-100"
          >
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
          
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-md pl-10 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            >
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="action_taken">Action Taken</option>
              <option value="dismissed">Dismissed</option>
              <option value="all">All Statuses</option>
            </select>
            <Filter size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-gray-500">Total Reports</h3>
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
              <Flag size={14} className="text-indigo-600" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-gray-800 mt-2">{stats.total}</p>
          <div className="mt-1 text-xs text-gray-500 flex items-center gap-1">
            <span className="inline-flex items-center">
              <Check size={12} className="text-emerald-500" />
              <span className="ml-1">{stats.dismissed + stats.actionTaken}</span>
            </span>
            <span>resolved</span>
            <span className="mx-1">•</span>
            <span className="inline-flex items-center">
              <AlertTriangle size={12} className="text-amber-500" />
              <span className="ml-1">{stats.pending}</span>
            </span>
            <span>pending</span>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-gray-500">Student Messages</h3>
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
              <MessageSquare size={14} className="text-emerald-600" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-gray-800 mt-2">{stats.student}</p>
          <div className="mt-1 text-xs text-gray-500">
            {Math.round((stats.student / (stats.total || 1)) * 100)}% of all reports
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-gray-500">Mentor Messages</h3>
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <MessageSquare size={14} className="text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-gray-800 mt-2">{stats.mentor}</p>
          <div className="mt-1 text-xs text-gray-500">
            {Math.round((stats.mentor / (stats.total || 1)) * 100)}% of all reports
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-gray-500">Action Taken</h3>
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
              <UserX size={14} className="text-red-600" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-gray-800 mt-2">{stats.actionTaken}</p>
          <div className="mt-1 text-xs text-gray-500">
            {Math.round((stats.actionTaken / (stats.total || 1)) * 100)}% violation rate
          </div>
        </div>
      </div>

      {/* Custom Tabs */}
      <div className="mb-6">
        <div className="bg-white p-1 rounded-lg border border-gray-200 flex overflow-x-auto">
          <div className="flex space-x-1">
            <button 
              onClick={() => setActiveTab('all')} 
              className={`px-4 py-2 text-sm rounded-md ${
                activeTab === 'all' 
                  ? 'bg-gray-100 text-gray-900 font-medium' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              All Messages
            </button>
            <button 
              onClick={() => setActiveTab('student')} 
              className={`px-4 py-2 text-sm rounded-md ${
                activeTab === 'student' 
                  ? 'bg-gray-100 text-gray-900 font-medium' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Student Messages
            </button>
            <button 
              onClick={() => setActiveTab('mentor')} 
              className={`px-4 py-2 text-sm rounded-md ${
                activeTab === 'mentor' 
                  ? 'bg-gray-100 text-gray-900 font-medium' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Mentor Messages
            </button>
          </div>
        </div>
        
        {/* Tab Content */}
        <div className="mt-4">
          {/* All Messages Tab */}
          {activeTab === 'all' && (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {isLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading reported messages...</p>
                </div>
              ) : reportedMessages.length === 0 ? (
                <div className="p-8 text-center">
                  <Flag size={48} className="mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">No reported messages found</h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    {statusFilter === 'all' 
                      ? "There are no reported messages in the system." 
                      : `There are no ${statusFilter} reports at the moment.`}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reported Message</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sender</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reported On</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reportedMessages.map((message) => (
                        <tr key={message._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {message.message.length > 50 
                                ? `${message.message.substring(0, 50)}...` 
                                : message.message}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-8 w-8 flex-shrink-0 mr-3">
                                <img 
                                  className="h-8 w-8 rounded-full"
                                  src={message.sender?.profilePicture || 'https://via.placeholder.com/40?text=👤'} 
                                  alt={message.sender?.name || 'User'} 
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = 'https://via.placeholder.com/40?text=👤';
                                  }}
                                />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {message.sender?.name || 'Unknown User'}
                                </div>
                                <div className="text-xs text-gray-500">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    message.sender?.type === 'student' 
                                      ? 'bg-emerald-100 text-emerald-800' 
                                      : 'bg-blue-100 text-blue-800'
                                  }`}>
                                    {message.sender?.type === 'student' ? 'Student' : 'Mentor'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              {message.reportDetails.reason.replace(/_/g, ' ')}
                            </span>
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
                            }`}>
                              {message.reportDetails.status.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(message.reportDetails.reportedAt).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => navigate(`/moderator/message/${message._id}`)}
                                className="p-1 text-indigo-600 hover:text-indigo-800 rounded-full hover:bg-indigo-50"
                                title="View Details"
                              >
                                <Eye size={18} />
                              </button>
                              
                              <button 
                                onClick={() => navigate(`/moderator/conversation/${message.senderId}/${message.receiverId}`)}
                                className="p-1 text-blue-600 hover:text-blue-800 rounded-full hover:bg-blue-50"
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
          )}
          
          {/* Student Messages Tab */}
          {activeTab === 'student' && (
            <StudentMessages 
              statusFilter={statusFilter}
              updateMessageStatus={updateMessageStatus}
              isLoading={isLoading} 
            />
          )}
          
          {/* Mentor Messages Tab */}
          {activeTab === 'mentor' && (
            <MentorMessages 
              statusFilter={statusFilter}
              updateMessageStatus={updateMessageStatus}
              isLoading={isLoading} 
            />
          )}
        </div>
      </div>
      
      {/* Information Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start space-x-3">
        <div className="flex-shrink-0">
          <Info size={20} className="text-blue-500" />
        </div>
        <div>
          <h4 className="text-sm font-medium text-blue-800">Moderation Guidelines</h4>
          <p className="text-sm text-blue-600 mt-1">
            Carefully review each reported message. Take action on clear violations of community guidelines.
            Contact the Admin team for guidance on complex cases or when issuing account suspensions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Messages;