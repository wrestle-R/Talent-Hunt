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
    <div>
      <h3 className="font-medium text-lg mb-4">Pending Mentor Applications</h3>
      
      {pendingApplications.length > 0 ? (
        <div className="space-y-4">
          {pendingApplications.map(app => (
            <div key={app._id || `pending-${app.mentorId}-${app.applicationDate}`} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-gray-800">{app.mentorName}</h4>
                  <p className="text-sm text-gray-500">
                    Applied: {new Date(app.applicationDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">
                  <Clock size={14} className="mr-1" />
                  <span className="text-xs">Pending</span>
                </div>
              </div>
              
              {app.message && (
                <div className="mt-3 bg-gray-50 p-3 rounded-md text-sm">
                  <p className="italic text-gray-700">"{app.message}"</p>
                </div>
              )}
              
              <div className="mt-3 flex justify-end">
                <button
                  onClick={() => navigate(`/student/team/mentor/${app.mentorId}`)}
                  className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center gap-1"
                >
                  <ExternalLink size={14} />
                  View Mentor Profile
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <Clock size={40} className="mx-auto text-gray-300 mb-2" />
          <p className="text-gray-500">No pending applications</p>
        </div>
      )}
      
      {pastApplications.length > 0 && (
        <>
          <h3 className="font-medium text-lg mt-8 mb-4">Past Applications</h3>
          <div className="space-y-3">
            {pastApplications.map(app => (
              <div 
                key={app._id || `past-${app.mentorId}-${app.applicationDate}`} 
                className="border border-gray-100 rounded-lg p-3 bg-gray-50"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium text-gray-800">{app.mentorName}</h4>
                    <p className="text-xs text-gray-500">
                      {new Date(app.applicationDate).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <span className={`text-xs px-2 py-1 rounded-full flex items-center ${
                    app.status === 'accepted' 
                      ? 'bg-green-50 text-green-700' 
                      : app.status === 'waitlisted'
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-red-50 text-red-700'
                  }`}>
                    {getStatusIcon(app.status)}
                    {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                  </span>
                </div>
                
                {app.message && (
                  <div className="mt-2 text-xs text-gray-500 line-clamp-1">
                    <span className="italic">"{app.message.substring(0, 50)}{app.message.length > 50 ? '...' : ''}"</span>
                  </div>
                )}
                
                <div className="mt-2 flex justify-end">
                  <button
                    onClick={() => navigate(`/student/team/mentor/${app.mentorId}`)}
                    className="text-indigo-600 hover:text-indigo-800 text-xs flex items-center gap-1"
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