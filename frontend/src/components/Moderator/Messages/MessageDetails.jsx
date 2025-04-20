import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, Flag, MessageSquare, UserX, Check, RefreshCw, 
  AlertTriangle, ExternalLink, Calendar, Clock, User, Mail, Shield
} from 'lucide-react';

const MessageDetails = () => {
  const { messageId } = useParams();
  const navigate = useNavigate();
  
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [moderatorNotes, setModeratorNotes] = useState('');
  
  useEffect(() => {
    const fetchMessage = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}/api/moderator/messages/reported?status=all`);
        
        // Find the specific message in the response
        const foundMessage = response.data.find(msg => msg._id === messageId);
        
        if (foundMessage) {
          setMessage(foundMessage);
          setModeratorNotes(foundMessage.reportDetails?.moderatorNotes || '');
        } else {
          console.error('Message not found');
        }
      } catch (error) {
        console.error('Error fetching message details:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMessage();
  }, [messageId]);
  
  const updateMessageStatus = async (newStatus, actionTaken = null) => {
    try {
      setIsSubmitting(true);
      
      await axios.put(`${import.meta.env.VITE_APP_BASE_URL}/api/moderator/messages/reported/${messageId}`, {
        status: newStatus,
        actionTaken: actionTaken,
        moderatorNotes: moderatorNotes,
        moderatorId: "moderator123" // This should be the actual moderator ID in a real app
      });
      
      // Refresh the message data
      const response = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}/api/moderator/messages/reported?status=all`);
      const updatedMessage = response.data.find(msg => msg._id === messageId);
      if (updatedMessage) {
        setMessage(updatedMessage);
      }
      
    } catch (error) {
      console.error('Error updating message status:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle going back to messages list
  const handleBack = () => {
    navigate('/moderator/messages');
  };
  
  // Format timestamps
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });
  };
  
  const formatTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-[#1A1A1A] rounded w-1/3 mb-6"></div>
            <div className="h-64 bg-[#1A1A1A] rounded mb-6"></div>
            <div className="h-32 bg-[#1A1A1A] rounded"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!message) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-[#1A1A1A] p-6 rounded-lg shadow-lg border border-gray-800">
          <h1 className="text-2xl font-bold text-white mb-4 font-montserrat">Message Not Found</h1>
          <p className="text-gray-400 mb-6 font-inter">The requested message could not be found or may have been deleted.</p>
          <button 
            onClick={handleBack}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-[#111111] bg-[#E8C848] hover:bg-[#E8C848]/90 transition-colors duration-300 focus:outline-none"
          >
            <ArrowLeft className="mr-2 -ml-1 h-5 w-5" />
            Back to Messages
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header with back button */}
        <div className="mb-6">
          <button 
            onClick={handleBack}
            className="inline-flex items-center text-[#E8C848] hover:text-[#E8C848]/80 transition-colors duration-300"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            <span className="font-inter">Back to Messages</span>
          </button>
        </div>
        
        {/* Main content */}
        <div className="bg-[#1A1A1A] rounded-lg shadow-lg border border-gray-800 overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 bg-[#111111] border-b border-gray-800">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold text-white flex items-center font-montserrat">
                <Flag className="mr-2 text-red-500" size={20} />
                Reported Message Details
              </h1>
              
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
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
              </div>
            </div>
          </div>
          
          {/* Message Info Section */}
          <div className="p-6 border-b border-gray-800">
            <h2 className="text-lg font-medium text-white mb-4 font-montserrat">Message Content</h2>
            
            <div className="bg-[#111111] rounded-lg p-4 border border-gray-800 mb-4">
              <p className="text-gray-300 whitespace-pre-wrap font-inter">{message.message}</p>
              <div className="mt-3 text-xs text-gray-500 flex items-center justify-between">
                <div className="flex items-center">
                  <Calendar size={12} className="mr-1" />
                  <span>{formatDate(message.createdAt)}</span>
                  <span className="mx-2">•</span>
                  <Clock size={12} className="mr-1" />
                  <span>{formatTime(message.createdAt)}</span>
                </div>
                
                {message.reportDetails.actionTaken && message.reportDetails.actionTaken !== 'none' && (
                  <span className="text-red-400 font-medium capitalize flex items-center">
                    <AlertTriangle size={12} className="mr-1" />
                    {message.reportDetails.actionTaken.replace(/_/g, ' ')}
                  </span>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Sender Info */}
              <div className="bg-[#1A1A1A] rounded-lg p-4 border border-gray-800">
                <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center">
                  <User size={16} className="mr-1 text-gray-500" />
                  Sender
                </h3>
                
                <div className="flex items-center mb-2">
                  <div className="h-10 w-10 flex-shrink-0 mr-3">
                    <img 
                      className="h-10 w-10 rounded-full"
                      src={message.sender?.profilePicture || 'https://via.placeholder.com/40?text=👤'} 
                      alt={message.sender?.name || 'User'} 
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/40?text=👤';
                      }}
                    />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">
                      {message.sender?.name || 'Unknown User'}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center">
                      <Mail size={10} className="mr-1" />
                      {message.sender?.email || 'No email available'}
                    </div>
                  </div>
                </div>
                
                <div className="mt-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    message.sender?.type === 'student' 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {message.sender?.type === 'student' ? 'Student' : 'Mentor'}
                  </span>
                </div>
                
                <div className="mt-3">
                  <button 
                    onClick={() => navigate(`/moderator/user-messages/${message.senderId}`)}
                    className="w-full flex items-center justify-center px-3 py-1.5 border border-gray-800 rounded-md text-xs font-medium text-gray-300 bg-[#1A1A1A] hover:bg-gray-800 focus:outline-none"
                  >
                    <MessageSquare size={12} className="mr-1" />
                    View All Messages
                  </button>
                </div>
              </div>
              
              {/* Receiver Info */}
              <div className="bg-[#1A1A1A] rounded-lg p-4 border border-gray-800">
                <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center">
                  <User size={16} className="mr-1 text-gray-500" />
                  Recipient
                </h3>
                
                <div className="flex items-center mb-2">
                  <div className="h-10 w-10 flex-shrink-0 mr-3">
                    <img 
                      className="h-10 w-10 rounded-full"
                      src={message.receiver?.profilePicture || 'https://via.placeholder.com/40?text=👤'} 
                      alt={message.receiver?.name || 'User'} 
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/40?text=👤';
                      }}
                    />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">
                      {message.receiver?.name || 'Unknown User'}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center">
                      <Mail size={10} className="mr-1" />
                      {message.receiver?.email || 'No email available'}
                    </div>
                  </div>
                </div>
                
                <div className="mt-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    message.receiver?.type === 'student' 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {message.receiver?.type === 'student' ? 'Student' : 'Mentor'}
                  </span>
                </div>
                
                <div className="mt-3">
                  <button 
                    onClick={() => navigate(`/moderator/conversation/${message.senderId}/${message.receiverId}`)}
                    className="w-full flex items-center justify-center px-3 py-1.5 border border-gray-800 rounded-md text-xs font-medium text-gray-300 bg-[#1A1A1A] hover:bg-gray-800 focus:outline-none"
                  >
                    <MessageSquare size={12} className="mr-1" />
                    View Conversation
                  </button>
                </div>
              </div>
              
              {/* Reporter Info */}
              <div className="bg-[#1A1A1A] rounded-lg p-4 border border-gray-800">
                <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center">
                  <Flag size={16} className="mr-1 text-red-500" />
                  Reporter
                </h3>
                
                <div className="flex items-center mb-2">
                  <div className="h-10 w-10 flex-shrink-0 mr-3">
                    <img 
                      className="h-10 w-10 rounded-full"
                      src={message.reporter?.profilePicture || 'https://via.placeholder.com/40?text=👤'} 
                      alt={message.reporter?.name || 'User'} 
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/40?text=👤';
                      }}
                    />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">
                      {message.reporter?.name || 'Unknown User'}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center">
                      <Mail size={10} className="mr-1" />
                      {message.reporter?.email || 'No email available'}
                    </div>
                  </div>
                </div>
                
                <div className="mt-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    message.reporter?.type === 'student' 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {message.reporter?.type === 'student' ? 'Student' : 'Mentor'}
                  </span>
                </div>
                
                <div className="mt-3 text-xs text-gray-500">
                  Reported on: {formatDate(message.reportDetails.reportedAt)} at {formatTime(message.reportDetails.reportedAt)}
                </div>
              </div>
            </div>
          </div>
          
          {/* Report Details Section */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-800 mb-4">Report Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Reason for Report</h3>
                  <div className="px-3 py-2 bg-red-50 text-red-800 rounded-md border border-red-100 text-sm capitalize">
                    {message.reportDetails.reason.replace(/_/g, ' ')}
                  </div>
                </div>
                
                {message.reportDetails.additionalInfo && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Additional Information</h3>
                    <div className="px-3 py-2 bg-gray-50 rounded-md border border-gray-200 text-sm whitespace-pre-wrap">
                      {message.reportDetails.additionalInfo}
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Moderator Notes</h3>
                  <textarea 
                    value={moderatorNotes}
                    onChange={(e) => setModeratorNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    rows={4}
                    placeholder="Add your notes about this report here..."
                  />
                </div>
                
                {message.reportDetails.reviewedBy && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Review Information</h3>
                    <div className="px-3 py-2 bg-gray-50 rounded-md border border-gray-200 text-sm">
                      <div className="flex items-center mb-1">
                        <Shield size={12} className="text-indigo-500 mr-1" />
                        <span className="text-gray-700 font-medium">Moderator ID:</span>
                        <span className="ml-1 text-gray-600">{message.reportDetails.reviewedBy}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock size={12} className="text-indigo-500 mr-1" />
                        <span className="text-gray-700 font-medium">Reviewed on:</span>
                        <span className="ml-1 text-gray-600">
                          {message.reportDetails.reviewedAt ? formatDate(message.reportDetails.reviewedAt) + ' at ' + formatTime(message.reportDetails.reviewedAt) : 'Not yet reviewed'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Actions Section */}
          <div className="p-6 bg-gray-50">
            <div className="flex flex-col sm:flex-row items-center justify-between">
              <div className="flex space-x-3 mb-4 sm:mb-0">
                {message.reportDetails.status === 'pending' && (
                  <>
                    <button 
                      onClick={() => updateMessageStatus('action_taken', 'message_removed')}
                      disabled={isSubmitting}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <UserX className="mr-2 -ml-1 h-4 w-4" />
                      {isSubmitting ? 'Processing...' : 'Take Action'}
                    </button>
                    
                    <button 
                      onClick={() => updateMessageStatus('dismissed', 'none')}
                      disabled={isSubmitting}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Check className="mr-2 -ml-1 h-4 w-4" />
                      {isSubmitting ? 'Processing...' : 'Dismiss Report'}
                    </button>
                    
                    <button 
                      onClick={() => updateMessageStatus('reviewed')}
                      disabled={isSubmitting}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <MessageSquare className="mr-2 -ml-1 h-4 w-4" />
                      {isSubmitting ? 'Processing...' : 'Mark as Reviewed'}
                    </button>
                  </>
                )}
                
                {message.reportDetails.status !== 'pending' && (
                  <button 
                    onClick={() => updateMessageStatus('pending')}
                    disabled={isSubmitting}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RefreshCw className="mr-2 -ml-1 h-4 w-4" />
                    {isSubmitting ? 'Processing...' : 'Reset to Pending'}
                  </button>
                )}
              </div>
              
              {/* Save Notes Button */}
              <button 
                onClick={() => updateMessageStatus(message.reportDetails.status, message.reportDetails.actionTaken)}
                disabled={isSubmitting || moderatorNotes === message.reportDetails.moderatorNotes}
                className={`inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                  moderatorNotes !== message.reportDetails.moderatorNotes
                    ? 'border-transparent text-white bg-indigo-600 hover:bg-indigo-700'
                    : 'border-gray-300 text-gray-700 bg-gray-100 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? 'Saving...' : 'Save Notes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageDetails;