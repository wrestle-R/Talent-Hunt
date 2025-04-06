import React, { useState, useEffect } from 'react';
import { Users, CheckCircle, XCircle, AlertCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import StudentPlaceholder from '../../../public/student_placeholder.png';

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
      const response = await axios.get(`http://localhost:4000/api/mentor/team-applications/${mentorData._id}`);
      
      if (Array.isArray(response.data)) {
        const processedData = response.data.map(app => ({
          applicationId: app._id,
          teamId: app.teamId,
          teamName: app.teamName || "Unnamed Team",
          description: app.description || "",
          memberCount: app.memberCount || 0,
          techStack: Array.isArray(app.techStack) ? app.techStack : [],
          message: app.message || "",
          applicationDate: app.applicationDate || new Date(),
          status: app.status || "pending",
          team: app.team || null // Keep the full team object if available
        }));
        
        console.log("Processed applications:", processedData);
        setApplications(processedData);
      } else {
        console.warn("Unexpected applications response format:", response.data);
        setApplications([]);
      }
    } catch (error) {
      console.error("Error fetching pending applications:", error);
      toast.error("Failed to load applications");
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (applicationId) => {
    try {
      if (!applicationId) {
        toast.error("Application ID is missing");
        return;
      }
      
      setProcessingId(applicationId);
      const response = await axios.post(
        `http://localhost:4000/api/mentor/team-applications/${mentorData._id}/${applicationId}/accept`
      );
      
      if (response.data?.success) {
        toast.success("Application accepted successfully!");
        fetchApplications(); // Refresh the list
        if (onRefresh) onRefresh();
      } else {
        toast.error(response.data?.message || "Failed to accept application");
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
      if (!applicationId) {
        toast.error("Application ID is missing");
        return;
      }
      
      setProcessingId(applicationId);
      const response = await axios.post(
        `http://localhost:4000/api/mentor/team-applications/${mentorData._id}/${applicationId}/reject`
      );
      
      if (response.data?.success) {
        toast.success("Application rejected successfully");
        fetchApplications(); // Refresh the list
        if (onRefresh) onRefresh();
      } else {
        toast.error(response.data?.message || "Failed to reject application");
      }
    } catch (error) {
      console.error("Error rejecting application:", error);
      toast.error(error.response?.data?.message || "An error occurred");
    } finally {
      setProcessingId(null);
    }
  };

  const toggleExpand = (appId) => {
    setExpandedApp(expandedApp === appId ? null : appId);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return "Recently";
    
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
      <div className="bg-[#1A1A1A] p-6 rounded-xl shadow-sm border border-gray-800">
        <h3 className="font-bold text-lg flex items-center gap-2 mb-4 text-white">
          <Users size={20} className="text-[#E8C848]" />
          Pending Applications
        </h3>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#E8C848]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1A1A1A] p-6 rounded-xl shadow-sm border border-gray-800">
      <h3 className="font-bold text-lg flex items-center gap-2 mb-4 text-white">
        <Users size={20} className="text-[#E8C848]" />
        Pending Applications ({applications.length})
      </h3>
      
      {applications.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <AlertCircle className="mx-auto mb-2 h-8 w-8 text-gray-600" />
          <p>No pending applications</p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div key={app.applicationId} className="border border-gray-800 rounded-lg overflow-hidden bg-[#121212]">
              <div 
                className="p-4 hover:bg-[#1A1A1A] cursor-pointer transition-colors"
                onClick={() => toggleExpand(app.applicationId)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-white">
                        {app.teamName}
                      </h4>
                      <span className="text-xs bg-[#E8C848]/10 text-[#E8C848] px-2 py-0.5 rounded-full">
                        {app.memberCount} members
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">
                      Applied {getTimeAgo(app.applicationDate)}
                    </p>
                  </div>
                  <div className="flex items-center">
                    {expandedApp === app.applicationId ? (
                      <ChevronUp size={18} className="text-gray-400" />
                    ) : (
                      <ChevronDown size={18} className="text-gray-400" />
                    )}
                  </div>
                </div>
              </div>

              {expandedApp === app.applicationId && (
                <div className="px-4 pb-4 border-t border-gray-800">
                  <div className="pt-3">
                    <h5 className="text-sm font-medium text-gray-300 mb-2">Team Description</h5>
                    <p className="text-sm text-gray-400 mb-4">
                      {app.description || "No team description provided."}
                    </p>
                    
                    {app.techStack?.length > 0 && (
                      <div className="mb-4">
                        <h5 className="text-sm font-medium text-gray-300 mb-1">Tech Stack</h5>
                        <div className="flex flex-wrap gap-1">
                          {app.techStack.map((tech, idx) => (
                            <span 
                              key={idx} 
                              className="px-2 py-1 bg-[#E8C848]/10 text-[#E8C848] text-xs rounded-full"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="mb-4">
                      <h5 className="text-sm font-medium text-gray-300 mb-1">Application Message</h5>
                      <div className="bg-[#1A1A1A] p-3 rounded-md text-sm text-gray-400 border border-gray-800">
                        {app.message || "No message provided with this application."}
                      </div>
                    </div>
                    
                    <div className="flex space-x-3">
                      <button 
                        onClick={() => handleAccept(app.applicationId)}
                        disabled={processingId === app.applicationId}
                        className={`flex-1 py-2 px-4 rounded-md flex justify-center items-center ${
                          processingId === app.applicationId 
                            ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                            : 'bg-[#E8C848] text-[#121212] hover:bg-[#E8C848]/80'
                        }`}
                      >
                        {processingId === app.applicationId ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-t-transparent border-[#121212] mr-2"></div>
                        ) : (
                          <CheckCircle size={16} className="mr-2" />
                        )}
                        Accept
                      </button>
                      
                      <button 
                        onClick={() => handleReject(app.applicationId)}
                        disabled={processingId === app.applicationId}
                        className={`flex-1 py-2 px-4 rounded-md flex justify-center items-center ${
                          processingId === app.applicationId 
                            ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                            : 'bg-[#E8C848]/10 text-[#E8C848] hover:bg-[#E8C848]/20'
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