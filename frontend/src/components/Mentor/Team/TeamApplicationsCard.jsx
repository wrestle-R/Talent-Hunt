import React, { useState, useEffect } from 'react';
import { Users, CheckCircle, XCircle, AlertCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const TeamApplicationsCard = ({ mentorData, onRefresh }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [expandedApp, setExpandedApp] = useState(null);

  useEffect(() => {
    if (mentorData?._id) {
      fetchApplications();
    }
  }, [mentorData]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      // Changed endpoint from /pending-applications/ to /team-applications/ to match the backend route
      const response = await axios.get(`http://localhost:4000/api/mentor/team-applications/${mentorData._id}`);
      
      if (Array.isArray(response.data)) {
        setApplications(response.data);
      } else {
        console.warn("Unexpected applications response format:", response.data);
        setApplications([]);
      }
    } catch (error) {
      console.error("Error fetching pending applications:", error);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (applicationId) => {
    try {
      setProcessingId(applicationId);
      // Update this endpoint as well to match your backend route structure
      const response = await axios.post(`http://localhost:4000/api/mentor/team-applications/${mentorData._id}/${applicationId}/accept`);
      
      if (response.data.success) {
        toast.success("You've accepted the mentorship request!");
        
        // Remove from applications list
        setApplications(prev => prev.filter(app => app._id !== applicationId));
        
        // Notify parent to refresh data
        if (onRefresh) onRefresh();
      } else {
        toast.error(response.data.message || "Failed to accept application");
      }
    } catch (error) {
      console.error("Error accepting application:", error);
      toast.error(error.response?.data?.message || "An error occurred");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (applicationId) => {
    try {
      setProcessingId(applicationId);
      // Update this endpoint as well to match your backend route structure
      const response = await axios.post(`http://localhost:4000/api/mentor/team-applications/${mentorData._id}/${applicationId}/reject`);
      
      if (response.data.success) {
        toast.success("Application rejected successfully");
        
        // Remove from applications list
        setApplications(prev => prev.filter(app => app._id !== applicationId));
        
        // Notify parent to refresh data
        if (onRefresh) onRefresh();
      } else {
        toast.error(response.data.message || "Failed to reject application");
      }
    } catch (error) {
      console.error("Error rejecting application:", error);
      toast.error(error.response?.data?.message || "An error occurred");
    } finally {
      setProcessingId(null);
    }
  };



  const toggleExpand = (appId) => {
    if (expandedApp === appId) {
      setExpandedApp(null);
    } else {
      setExpandedApp(appId);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h3 className="font-bold text-lg flex items-center gap-2 mb-4">
          <Users size={20} className="text-blue-600" />
          Pending Applications
        </h3>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h3 className="font-bold text-lg flex items-center gap-2 mb-4">
        <Users size={20} className="text-blue-600" />
        Pending Applications
      </h3>
      
      {applications.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <AlertCircle className="mx-auto mb-2 h-8 w-8 text-gray-400" />
          <p>No pending applications</p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div key={app._id} className="border rounded-lg overflow-hidden">
              <div 
                className="p-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => toggleExpand(app._id)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center">
                      <h4 className="font-medium text-gray-900">{app.team.name}</h4>
                      <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                        {app.team.members.length} members
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Requested {getTimeAgo(app.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center">
                    {expandedApp === app._id ? (
                      <ChevronUp size={18} className="text-gray-400" />
                    ) : (
                      <ChevronDown size={18} className="text-gray-400" />
                    )}
                  </div>
                </div>
              </div>
              
              {expandedApp === app._id && (
                <div className="px-4 pb-4 border-t border-gray-100">
                  <div className="pt-3">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Team Description</h5>
                    <p className="text-sm text-gray-600 mb-4">
                      {app.team.description || "No team description provided."}
                    </p>
                    
                    {app.team.techStack && app.team.techStack.length > 0 && (
                      <div className="mb-4">
                        <h5 className="text-sm font-medium text-gray-700 mb-1">Tech Stack</h5>
                        <div className="flex flex-wrap gap-1">
                          {app.team.techStack.map((tech, idx) => (
                            <span 
                              key={idx} 
                              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="mb-4">
                      <h5 className="text-sm font-medium text-gray-700 mb-1">Request Message</h5>
                      <div className="bg-gray-50 p-3 rounded-md text-sm text-gray-700">
                        {app.message || "No message provided with this request."}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <h5 className="text-xs font-medium text-gray-500 mb-1">Team Founded</h5>
                        <p className="text-sm">{formatDate(app.team.formationDate)}</p>
                      </div>
                      <div>
                        <h5 className="text-xs font-medium text-gray-500 mb-1">Request Date</h5>
                        <p className="text-sm">{formatDate(app.createdAt)}</p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-3">
                      <button 
                        onClick={() => handleAccept(app._id)}
                        disabled={processingId === app._id}
                        className={`flex-1 py-2 px-4 rounded-md flex justify-center items-center ${
                          processingId === app._id 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                      >
                        {processingId === app._id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-t-transparent border-white mr-2"></div>
                        ) : (
                          <CheckCircle size={16} className="mr-2" />
                        )}
                        Accept
                      </button>
                      
                      <button 
                        onClick={() => handleReject(app._id)}
                        disabled={processingId === app._id}
                        className={`flex-1 py-2 px-4 rounded-md flex justify-center items-center ${
                          processingId === app._id 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : 'bg-red-100 text-red-600 hover:bg-red-200'
                        }`}
                      >
                        <XCircle size={16} className="mr-2" />
                        Decline
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeamApplicationsCard;