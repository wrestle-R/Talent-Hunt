import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { 
  Trophy, 
  Calendar, 
  User, 
  CheckCircle, 
  XCircle, 
  Clock, 
  ArrowLeft, 
  ChevronRight, 
  Filter,
  Link as LinkIcon,
  ExternalLink,
  AlertCircle,
  Award
} from 'lucide-react';

const HackathonStatus = ({ isFullPage = false, limit = 3, onBack }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  // Function to fetch hackathon applications
  const fetchHackathonApplications = async () => {
    // Uncomment this code when backend is ready
    /*
    try {
      setLoading(true);
      setError(null);
      
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user?.uid) {
        setLoading(false);
        return;
      }
      
      const response = await axios.get(`http://localhost:4000/api/student/applications/${user.uid}`);
      setApplications(response.data);
    } catch (err) {
      console.error("Error fetching hackathon applications:", err);
      setError("Failed to load your hackathon applications");
    } finally {
      setLoading(false);
    }
    */
    
    // Fallback data for development (comment out when backend is ready)
    setLoading(true);
    setTimeout(() => {
      setApplications([
        {
          id: "app1",
          hackathon_id: "hack1",
          hackathon_name: "Tech Innovators Hackathon",
          status: "Accepted",
          applied_date: "2025-03-15T10:30:00",
          response_date: "2025-03-18T14:20:00",
          start_date: "2025-04-01T09:00:00",
          end_date: "2025-04-03T18:00:00",
          organizer: "TechCorp",
          location: "Virtual",
          prize: "$5,000",
          hackathon_url: "https://techinnovators.com/hackathon",
          feedback: "Great application! Your project idea was very innovative."
        },
        {
          id: "app2",
          hackathon_id: "hack2",
          hackathon_name: "AI for Good Challenge",
          status: "Pending",
          applied_date: "2025-03-17T15:45:00",
          start_date: "2025-04-10T09:00:00",
          end_date: "2025-04-12T18:00:00",
          organizer: "AI Foundation",
          location: "New York, NY",
          prize: "$10,000",
          hackathon_url: "https://aiforgood.org/challenge"
        },
        {
          id: "app3",
          hackathon_id: "hack3",
          hackathon_name: "Blockchain Revolution",
          status: "Rejected",
          applied_date: "2025-02-28T11:20:00",
          response_date: "2025-03-10T09:15:00",
          start_date: "2025-03-25T09:00:00",
          end_date: "2025-03-27T18:00:00",
          organizer: "CryptoInnovate",
          location: "Virtual",
          prize: "$3,000",
          hackathon_url: "https://cryptoinnovate.io/hackathon",
          feedback: "Thank you for your application. We had many strong applications and couldn't accommodate everyone."
        },
        {
          id: "app4",
          hackathon_id: "hack4",
          hackathon_name: "Green Tech Sustainability Hack",
          status: "Waitlisted",
          applied_date: "2025-03-12T13:10:00",
          response_date: "2025-03-16T10:30:00",
          start_date: "2025-04-15T09:00:00",
          end_date: "2025-04-17T18:00:00",
          organizer: "EcoTech Initiatives",
          location: "San Francisco, CA",
          prize: "$7,500",
          hackathon_url: "https://ecotech.org/hackathon",
          feedback: "We were impressed with your application and have placed you on our waitlist. We'll notify you if a spot opens up."
        },
        {
          id: "app5",
          hackathon_id: "hack5",
          hackathon_name: "HealthTech Innovation Challenge",
          status: "Accepted",
          applied_date: "2025-03-05T09:15:00",
          response_date: "2025-03-12T16:40:00",
          start_date: "2025-04-20T09:00:00",
          end_date: "2025-04-22T18:00:00",
          organizer: "MedTech Alliance",
          location: "Boston, MA",
          prize: "$8,000",
          hackathon_url: "https://medtech.org/challenge",
          feedback: "Excellent application! We're excited to have you join us."
        }
      ]);
      setLoading(false);
    }, 800); // Simulate network delay
  };
  
  // Fetch applications when component mounts
  useEffect(() => {
    fetchHackathonApplications();
  }, []);
  
  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  // Get status badge based on application status
  const getStatusBadge = (status) => {
    switch(status.toLowerCase()) {
      case 'accepted':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full flex items-center gap-1"><CheckCircle size={14} /> Accepted</span>;
      case 'rejected':
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full flex items-center gap-1"><XCircle size={14} /> Rejected</span>;
      case 'waitlisted':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full flex items-center gap-1"><Clock size={14} /> Waitlisted</span>;
      case 'pending':
      default:
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full flex items-center gap-1"><Clock size={14} /> Pending</span>;
    }
  };
  
  // Calculate time remaining
  const calculateTimeRemaining = (dateString) => {
    const eventDate = new Date(dateString);
    const now = new Date();
    
    // If event is in the past
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
  
  // Get status-based action button
  const getActionButton = (application) => {
    switch(application.status.toLowerCase()) {
      case 'accepted':
        const timeInfo = calculateTimeRemaining(application.start_date);
        return (
          <a 
            href={application.hackathon_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            {timeInfo.isPast ? 'Visit Event' : 'Prepare'} <ExternalLink size={14} />
          </a>
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
  
  // Filter applications based on selected filter
  const filteredApplications = applications.filter(app => {
    if (filter === 'all') return true;
    return app.status.toLowerCase() === filter.toLowerCase();
  });
  
  // Show compact view for dashboard integration
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
        
        {loading && (
          <div className="flex justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600"></div>
          </div>
        )}
        
        {error && (
          <div className="text-red-600 p-4">
            {error}
          </div>
        )}
        
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
        
        {!loading && !error && applications.length > 0 && (
          <div className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hackathon</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied On</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {applications.slice(0, limit).map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">{app.hackathon_name}</div>
                        <div className="text-xs text-gray-500">{app.organizer}</div>
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(app.status)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {formatDate(app.applied_date)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {formatDate(app.start_date)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }
  
  // Full page view
  return (
    <div className="p-6">
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
      
      {/* Filter controls */}
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
        <button 
          onClick={() => setFilter('accepted')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1 ${
            filter === 'accepted' 
              ? 'bg-green-600 text-white' 
              : 'bg-green-50 text-green-700 hover:bg-green-100'
          }`}
        >
          <CheckCircle size={14} /> Accepted
        </button>
        <button 
          onClick={() => setFilter('pending')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1 ${
            filter === 'pending' 
              ? 'bg-blue-600 text-white' 
              : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
          }`}
        >
          <Clock size={14} /> Pending
        </button>
        <button 
          onClick={() => setFilter('waitlisted')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1 ${
            filter === 'waitlisted' 
              ? 'bg-yellow-600 text-white' 
              : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
          }`}
        >
          <Clock size={14} /> Waitlisted
        </button>
        <button 
          onClick={() => setFilter('rejected')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1 ${
            filter === 'rejected' 
              ? 'bg-red-600 text-white' 
              : 'bg-red-50 text-red-700 hover:bg-red-100'
          }`}
        >
          <XCircle size={14} /> Rejected
        </button>
      </div>
      
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
            <div key={app.id} className={`bg-white p-5 rounded-lg shadow-md ${
              app.status.toLowerCase() === 'accepted' ? 'border-l-4 border-green-500' :
              app.status.toLowerCase() === 'pending' ? 'border-l-4 border-blue-500' :
              app.status.toLowerCase() === 'waitlisted' ? 'border-l-4 border-yellow-500' :
              'border-l-4 border-red-500'
            }`}>
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-medium">{app.hackathon_name}</h3>
                {getStatusBadge(app.status)}
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
      
      {/* Show apply button if no applications or at bottom of page */}
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