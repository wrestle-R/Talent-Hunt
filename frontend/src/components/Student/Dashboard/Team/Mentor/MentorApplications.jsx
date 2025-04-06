import React from 'react';
import { Clock, ExternalLink, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MentorApplications = ({ applications }) => {
  const navigate = useNavigate();
  const pendingApplications = applications.filter(app => app.status === 'pending');
  const pastApplications = applications.filter(app => app.status !== 'pending');

  // Helper function to get status icon
  const getStatusIcon = (status) => {
    switch(status) {
      case 'accepted':
        return <CheckCircle size={14} className="mr-1" />;
      case 'rejected':
        return <XCircle size={14} className="mr-1" />;
      case 'waitlisted':
        return <AlertCircle size={14} className="mr-1" />;
      default:
        return <Clock size={14} className="mr-1" />;
    }
  };

  return (
    <div className="text-white">
      <h3 className="font-medium text-lg mb-4">Pending Mentor Applications</h3>
      
      {pendingApplications.length > 0 ? (
        <div className="space-y-4">
          {pendingApplications.map(app => (
            <div 
              key={app._id || `pending-${app.mentorId}-${app.applicationDate}`} 
              className="bg-[#1A1A1A] border border-gray-800 hover:border-[#E8C848]/30 rounded-lg p-4 transition-all duration-300"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-gray-200">{app.mentorName}</h4>
                  <p className="text-sm text-gray-400">
                    Applied: {new Date(app.applicationDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center bg-[#E8C848]/10 text-[#E8C848] px-2 py-1 rounded-full">
                  <Clock size={14} className="mr-1" />
                  <span className="text-xs">Pending</span>
                </div>
              </div>
              
              {app.message && (
                <div className="mt-3 bg-[#121212] p-3 rounded-md text-sm">
                  <p className="italic text-gray-300">"{app.message}"</p>
                </div>
              )}
              
              <div className="mt-3 flex justify-end">
                <button
                  onClick={() => navigate(`/student/team/mentor/${app.mentorId}`)}
                  className="text-[#E8C848] hover:text-[#E8C848]/80 text-sm flex items-center gap-1 transition-colors duration-300"
                >
                  <ExternalLink size={14} />
                  View Mentor Profile
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-[#1A1A1A] border border-gray-800 hover:border-[#E8C848]/30 rounded-lg transition-all duration-300">
          <Clock size={40} className="mx-auto text-[#E8C848]/30 mb-2" />
          <p className="text-gray-400">No pending applications</p>
        </div>
      )}
      
      {pastApplications.length > 0 && (
        <>
          <h3 className="font-medium text-lg mt-8 mb-4">Past Applications</h3>
          <div className="space-y-3">
            {pastApplications.map(app => (
              <div 
                key={app._id || `past-${app.mentorId}-${app.applicationDate}`} 
                className="bg-[#1A1A1A] border border-gray-800 hover:border-[#E8C848]/30 rounded-lg p-3 transition-all duration-300"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium text-gray-200">{app.mentorName}</h4>
                    <p className="text-xs text-gray-400">
                      {new Date(app.applicationDate).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <span className={`text-xs px-2 py-1 rounded-full flex items-center ${
                    app.status === 'accepted' 
                      ? 'bg-green-900/20 text-green-400' 
                      : app.status === 'waitlisted'
                        ? 'bg-blue-900/20 text-blue-400'
                        : 'bg-red-900/20 text-red-400'
                  }`}>
                    {getStatusIcon(app.status)}
                    {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                  </span>
                </div>
                
                {app.message && (
                  <div className="mt-2 text-xs text-gray-400 line-clamp-1">
                    <span className="italic">"{app.message.substring(0, 50)}{app.message.length > 50 ? '...' : ''}"</span>
                  </div>
                )}
                
                <div className="mt-2 flex justify-end">
                  <button
                    onClick={() => navigate(`/student/team/mentor/${app.mentorId}`)}
                    className="text-[#E8C848] hover:text-[#E8C848]/80 text-xs flex items-center gap-1 transition-colors duration-300"
                  >
                    <ExternalLink size={12} />
                    View Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default MentorApplications;