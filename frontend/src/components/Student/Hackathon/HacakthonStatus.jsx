import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { 
  Trophy, Calendar, User, CheckCircle, XCircle, Clock, 
  ArrowLeft, ChevronRight, Filter, ExternalLink, 
  AlertCircle, Award, Users, MapPin
} from 'lucide-react';

const HackathonStatus = ({ isFullPage = false, limit = 3, onBack }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchHackathonApplications();
  }, []);

  const checkHackathonStatus = async (hackathonId) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await axios.get(
        `http://localhost:4000/api/student/hackathons/${hackathonId}/status/${user.uid}`
      );
      
      return response.data;
    } catch (err) {
      console.error('Error checking hackathon status:', err);
      throw err;
    }
  };

  const fetchHackathonApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      // Get all registered hackathons
      const registeredResponse = await axios.get(
        `http://localhost:4000/api/student/hackathons/registered/${user.uid}`
      );

      // Get detailed status for each hackathon
      const detailedApplications = await Promise.all(
        registeredResponse.data.hackathons.map(async (hackathon) => {
          const statusResponse = await checkHackathonStatus(hackathon._id);
          return {
            id: hackathon._id,
            hackathon_id: hackathon._id,
            hackathon_name: hackathon.name,
            status: statusResponse.registrationStatus.status,
            applied_date: statusResponse.registrationStatus.details?.registeredAt,
            start_date: hackathon.startDate,
            end_date: hackathon.endDate,
            organizer: hackathon.postedByAdmin?.organization || 'Organization',
            location: hackathon.location,
            prize: hackathon.prizePool ? `$${hackathon.prizePool}` : 'TBA',
            hackathon_url: `/student/hackathons/${hackathon._id}`,
            feedback: statusResponse.registrationStatus.details?.feedback || '',
            isTeamApplication: statusResponse.registrationStatus.registrationType === 'team',
            teamName: statusResponse.registrationStatus.details?.team?.name,
            teamMembers: statusResponse.registrationStatus.details?.team?.members || [],
            deadlineInfo: statusResponse.hackathonInfo,
            temporaryTeam: statusResponse.registrationStatus.details?.temporaryTeam
          };
        })
      );

      setApplications(detailedApplications);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching hackathon applications:", err);
      setError("Failed to load your hackathon applications");
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getStatusBadge = (status, isTeamApplication = false) => {
    const teamIndicator = isTeamApplication ? '(Team) ' : '';
    
    switch(status.toLowerCase()) {
      case 'accepted':
        return (
          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full flex items-center gap-1">
            <CheckCircle size={14} /> {teamIndicator}Accepted
          </span>
        );
      case 'rejected':
        return (
          <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full flex items-center gap-1">
            <XCircle size={14} /> {teamIndicator}Rejected
          </span>
        );
      case 'waitlisted':
        return (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full flex items-center gap-1">
            <Clock size={14} /> {teamIndicator}Waitlisted
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full flex items-center gap-1">
            <Clock size={14} /> {teamIndicator}Pending
          </span>
        );
    }
  };

  const calculateTimeRemaining = (dateString) => {
    const eventDate = new Date(dateString);
    const now = new Date();
    if (now > eventDate) {
      return { isPast: true };
    }
    
    const diffTime = Math.abs(eventDate - now);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return { 
      isPast: false,
      days: diffDays
    };
  };

  const getActionButton = (application) => {
    switch(application.status.toLowerCase()) {
      case 'accepted':
        const timeInfo = calculateTimeRemaining(application.start_date);
        return (
          <Link 
            to={application.hackathon_url}
            className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            {timeInfo.isPast ? 'Visit Event' : 'Prepare'} <ExternalLink size={14} />
          </Link>
        );
      case 'waitlisted':
        return (
          <button 
            className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-amber-600 text-white rounded-lg hover:bg-amber-700"
            onClick={() => window.alert("This would send a follow-up message to organizers")}
          >
            Check Status <AlertCircle size={14} />
          </button>
        );
      case 'rejected':
        return (
          <Link 
            to="/student/hackathons"
            className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Find More <Award size={14} />
          </Link>
        );
      case 'pending':
      default:
        return (
          <button 
            className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            onClick={() => window.alert("This would withdraw your application")}
          >
            Withdraw <XCircle size={14} />
          </button>
        );
    }
  };

  const filteredApplications = applications.filter(app => {
    if (filter === 'all') return true;
    return app.status.toLowerCase() === filter.toLowerCase();
  });

  if (!isFullPage) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Trophy className="text-purple-600" />
            Your Hackathon Applications
          </h3>
          <Link
            to="/student/hackathon-status" 
            className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center"
          >
            View All <ChevronRight size={16} />
          </Link>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-red-600 p-4">
            {error}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && applications.length === 0 && (
          <div className="text-center py-6 text-gray-500">
            <div className="mb-2">
              <Trophy size={32} className="mx-auto text-gray-400" />
            </div>
            <p>You haven't applied to any hackathons yet</p>
            <Link to="/student/hackathons" className="text-purple-600 hover:underline mt-2 inline-block">
              Browse Hackathons
            </Link>
          </div>
        )}

        {/* Applications List */}
        {!loading && !error && applications.length > 0 && (
          <div className="space-y-4">
            {applications.slice(0, limit).map((app) => (
              <div 
                key={app.id} 
                className={`p-4 rounded-lg ${
                  app.status.toLowerCase() === 'accepted' ? 'bg-green-50' :
                  app.status.toLowerCase() === 'pending' ? 'bg-blue-50' :
                  app.status.toLowerCase() === 'waitlisted' ? 'bg-yellow-50' :
                  'bg-red-50'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900">{app.hackathon_name}</h4>
                    <div className="text-sm text-gray-600 mt-1">
                      {formatDate(app.start_date)} - {formatDate(app.end_date)}
                    </div>
                    {app.isTeamApplication && (
                      <div className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                        <Users size={14} /> Team: {app.teamName}
                      </div>
                    )}
                  </div>
                  {getStatusBadge(app.status, app.isTeamApplication)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Full page view
  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center mb-6">
        {onBack && (
          <button 
            onClick={onBack}
            className="bg-purple-100 text-purple-700 p-2 rounded-full mr-4 hover:bg-purple-200 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <h2 className="text-2xl font-bold text-gray-800">Your Hackathon Applications</h2>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button 
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1 ${
            filter === 'all' 
              ? 'bg-purple-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Filter size={14} /> All
        </button>
        {['accepted', 'pending', 'waitlisted', 'rejected'].map((status) => (
          <button 
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1 ${
              filter === status
                ? `bg-${status === 'accepted' ? 'green' : 
                    status === 'pending' ? 'blue' : 
                    status === 'waitlisted' ? 'yellow' : 
                    'red'}-600 text-white`
                : `bg-${status === 'accepted' ? 'green' : 
                    status === 'pending' ? 'blue' : 
                    status === 'waitlisted' ? 'yellow' : 
                    'red'}-50 text-${status === 'accepted' ? 'green' : 
                    status === 'pending' ? 'blue' : 
                    status === 'waitlisted' ? 'yellow' : 
                    'red'}-700 hover:bg-${status === 'accepted' ? 'green' : 
                    status === 'pending' ? 'blue' : 
                    status === 'waitlisted' ? 'yellow' : 
                    'red'}-100`
            }`}
          >
            {status === 'accepted' ? <CheckCircle size={14} /> :
             status === 'pending' ? <Clock size={14} /> :
             status === 'waitlisted' ? <Clock size={14} /> :
             <XCircle size={14} />} 
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading && (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-100 text-red-800 p-4 rounded-lg">
          {error}
          <button 
            onClick={fetchHackathonApplications}
            className="ml-2 text-red-700 underline"
          >
            Try again
          </button>
        </div>
      )}

      {!loading && !error && filteredApplications.length === 0 && (
        <div className="bg-gray-100 text-gray-700 p-8 rounded-lg text-center">
          <div className="mb-3">
            <Trophy size={48} className="mx-auto text-gray-400" />
          </div>
          <h3 className="text-xl font-medium mb-2">
            {applications.length === 0 
              ? "No Applications Yet"
              : "No Applications Match Your Filter"}
          </h3>
          <p className="mb-4">
            {applications.length === 0 
              ? "You haven't applied to any hackathons yet."
              : "Try selecting a different filter to see your applications."}
          </p>
          
          {applications.length === 0 && (
            <Link 
              to="/student/hackathons"
              className="bg-purple-600 text-white px-4 py-2 rounded-lg inline-block"
            >
              Browse Hackathons
            </Link>
          )}
          
          {applications.length > 0 && (
            <button
              onClick={() => setFilter('all')}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg inline-block"
            >
              Show All Applications
            </button>
          )}
        </div>
      )}

      {!loading && !error && filteredApplications.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredApplications.map((app) => (
            <div 
              key={app.id} 
              className={`bg-white p-5 rounded-lg shadow-md ${
                app.status.toLowerCase() === 'accepted' ? 'border-l-4 border-green-500' :
                app.status.toLowerCase() === 'pending' ? 'border-l-4 border-blue-500' :
                app.status.toLowerCase() === 'waitlisted' ? 'border-l-4 border-yellow-500' :
                'border-l-4 border-red-500'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-medium">{app.hackathon_name}</h3>
                {getStatusBadge(app.status, app.isTeamApplication)}
              </div>
              
              <div className="mb-4 text-sm text-gray-600">
                <div className="flex items-center gap-1 mb-1">
                  <Calendar size={14} /> 
                  {formatDate(app.start_date)} - {formatDate(app.end_date)}
                </div>
                <div className="flex items-center gap-1 mb-1">
                  <User size={14} /> 
                  Organized by {app.organizer}
                </div>
                {app.location && (
                  <div className="flex items-center gap-1">
                    <MapPin size={14} /> 
                    {app.location}
                  </div>
                )}
                {app.isTeamApplication && app.teamName && (
                  <div className="flex items-center gap-1 mt-1">
                    <Users size={14} /> 
                    Team: {app.teamName}
                  </div>
                )}
                
                {/* Add deadline info */}
                {app.deadlineInfo && (
                  <div className="mt-2 text-sm">
                    {!app.deadlineInfo.isRegistrationOpen && (
                      <p className="text-red-600">Registration Closed</p>
                    )}
                    {app.deadlineInfo.isRegistrationOpen && !app.deadlineInfo.isCapacityAvailable && (
                      <p className="text-amber-600">Capacity Full</p>
                    )}
                    {app.isTeamApplication && (
                      <p>Required Team Size: {app.deadlineInfo.requiredTeamSize}</p>
                    )}
                  </div>
                )}
                
                {/* Add temporary team info for individual applications */}
                {!app.isTeamApplication && app.temporaryTeam && (
                  <div className="mt-2 bg-blue-50 p-2 rounded">
                    <p className="font-medium">Assigned Team:</p>
                    <p>{app.temporaryTeam.name}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {app.temporaryTeam.members.map((member, idx) => (
                        <span key={idx} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {member.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {app.feedback && (
                <div className={`mb-4 p-3 text-sm rounded ${
                  app.status.toLowerCase() === 'accepted' ? 'bg-green-50 text-green-800' :
                  app.status.toLowerCase() === 'waitlisted' ? 'bg-yellow-50 text-yellow-800' :
                  app.status.toLowerCase() === 'rejected' ? 'bg-red-50 text-red-800' :
                  'bg-gray-50 text-gray-800'
                }`}>
                  <p className="font-medium mb-1">Feedback:</p>
                  <p>{app.feedback}</p>
                </div>
              )}
              
              <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                <div className="text-sm text-gray-500">
                  Applied: {formatDate(app.applied_date)}
                </div>
                {getActionButton(app)}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Footer */}
      <div className="mt-8 text-center">
        <Link
          to="/student/hackathons"
          className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-6 py-3 rounded-lg inline-flex items-center gap-2"
        >
          <Trophy size={18} /> Find More Hackathons
        </Link>
      </div>
    </div>
  );
};

export default HackathonStatus;