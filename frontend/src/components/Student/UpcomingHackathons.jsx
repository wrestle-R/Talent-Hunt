import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Calendar, MapPin, Users, Award, Clock } from 'lucide-react';

const UpcomingHackathons = ({ limit = 3, layout = "list" }) => {
  const navigate = useNavigate();
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHackathons = async () => {
      try {
        setLoading(true);
        // Fix: Change the API endpoint to match your StudentRoutes.js
        const response = await axios.get('http://localhost:4000/api/student/hackathons/upcoming');
        
        // Limit the number of hackathons to display
        const limitedHackathons = response.data.hackathons?.slice(0, limit) || [];
        setHackathons(limitedHackathons);
        setError(null);
      } catch (err) {
        console.error("Error fetching upcoming hackathons:", err);
        setError("Failed to load upcoming hackathons.");
      } finally {
        setLoading(false);
      }
    };

    fetchHackathons();
  }, [limit]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const getDaysRemaining = (dateString) => {
    const today = new Date();
    const targetDate = new Date(dateString);
    const timeDiff = targetDate - today;
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    if (daysDiff < 0) return 'Ended';
    if (daysDiff === 0) return 'Today';
    if (daysDiff === 1) return '1 day left';
    return `${daysDiff} days left`;
  };

  const getRegistrationStatus = (hackathon) => {
    const today = new Date();
    const registerDate = new Date(hackathon.lastRegisterDate);
    const isRegistrationOpen = today <= registerDate;
    
    return {
      isOpen: isRegistrationOpen,
      label: isRegistrationOpen ? 'Registration Open' : 'Registration Closed',
      colorClass: isRegistrationOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
    };
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg text-center text-red-700">
        <p>{error}</p>
      </div>
    );
  }

  // Empty state
  if (hackathons.length === 0) {
    return (
      <div className="bg-gray-50 p-6 rounded-lg text-center">
        <Calendar size={32} className="text-gray-400 mx-auto mb-2" />
        <p className="text-gray-600">No upcoming hackathons found.</p>
        <p className="text-gray-500 text-sm mt-1">Check back later for new opportunities!</p>
      </div>
    );
  }

  // Vertical card layout (for dashboard display)
  if (layout === "grid") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {hackathons.map(hackathon => {
          const registrationStatus = getRegistrationStatus(hackathon);
          
          return (
            <div 
              key={hackathon._id}
              onClick={() => navigate(`/student/hackathon/${hackathon._id}`)}
              className="bg-white border border-gray-200 hover:border-purple-300 rounded-lg p-4 shadow-sm cursor-pointer transform hover:shadow-md hover:scale-[1.01] transition-all h-full flex flex-col"
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-gray-800 line-clamp-1">{hackathon.hackathonName}</h4>
                <span className={`text-xs px-2 py-1 rounded-full ${registrationStatus.colorClass} whitespace-nowrap ml-1`}>
                  {registrationStatus.label}
                </span>
              </div>
              
              <p className="text-sm text-gray-500 mb-3 line-clamp-2 flex-grow">
                {hackathon.description}
              </p>
              
              <div className="space-y-2">
                <div className="flex items-center text-xs text-gray-600">
                  <Calendar size={14} className="mr-1.5 flex-shrink-0" />
                  <span className="truncate">{formatDate(hackathon.startDate)}</span>
                </div>
                
                <div className="flex items-center text-xs text-gray-600">
                  <Clock size={14} className="mr-1.5 flex-shrink-0" />
                  <span className="text-purple-600 font-medium">
                    {getDaysRemaining(hackathon.startDate)}
                  </span>
                </div>
                
                <div className="flex items-center text-xs text-gray-600">
                  <MapPin size={14} className="mr-1.5 flex-shrink-0" />
                  <span className="truncate">{hackathon.mode}</span>
                </div>
                
                <div className="flex items-center text-xs text-gray-600">
                  <Users size={14} className="mr-1.5 flex-shrink-0" />
                  <span>
                    {hackathon.registration.currentlyRegistered} / {hackathon.registration.totalCapacity}
                  </span>
                </div>
              </div>
              
              {hackathon.domain.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  <span 
                    key={0} 
                    className="px-2 py-0.5 bg-purple-50 text-purple-700 text-xs rounded-full line-clamp-1"
                  >
                    {hackathon.domain[0]}
                  </span>
                  {hackathon.domain.length > 1 && (
                    <span className="px-2 py-0.5 bg-gray-50 text-gray-600 text-xs rounded-full">
                      +{hackathon.domain.length - 1} more
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // Original list layout
  return (
    <div className="space-y-4">
      {hackathons.map(hackathon => {
        const registrationStatus = getRegistrationStatus(hackathon);
        
        return (
          <div 
            key={hackathon._id}
            onClick={() => navigate(`/student/hackathon/${hackathon._id}`)}
            className="bg-white border border-gray-200 hover:border-purple-300 rounded-lg p-4 cursor-pointer transform hover:scale-[1.01] transition-all"
          >
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-medium text-gray-800">{hackathon.hackathonName}</h4>
              <span className={`text-xs px-2 py-1 rounded-full ${registrationStatus.colorClass}`}>
                {registrationStatus.label}
              </span>
            </div>
            
            <p className="text-sm text-gray-500 mb-3 line-clamp-2">
              {hackathon.description}
            </p>
            
            <div className="grid grid-cols-2 gap-y-2 mb-3">
              <div className="flex items-center text-xs text-gray-600">
                <Calendar size={14} className="mr-1.5" />
                <span>{formatDate(hackathon.startDate)}</span>
              </div>
              
              <div className="flex items-center text-xs text-gray-600">
                <Clock size={14} className="mr-1.5" />
                <span className="text-purple-600 font-medium">
                  {getDaysRemaining(hackathon.startDate)}
                </span>
              </div>
              
              <div className="flex items-center text-xs text-gray-600">
                <MapPin size={14} className="mr-1.5" />
                <span>{hackathon.mode}</span>
              </div>
              
              <div className="flex items-center text-xs text-gray-600">
                <Users size={14} className="mr-1.5" />
                <span>
                  {hackathon.registration.currentlyRegistered} / {hackathon.registration.totalCapacity}
                </span>
              </div>
            </div>
            
            {hackathon.prizePool > 0 && (
              <div className="flex items-center text-sm">
                <Award size={15} className="mr-1.5 text-yellow-500" />
                <span className="font-medium">
                  ₹{hackathon.prizePool.toLocaleString()} prize pool
                </span>
              </div>
            )}
            
            <div className="flex flex-wrap gap-2 mt-3">
              {hackathon.domain.slice(0, 2).map((domain, idx) => (
                <span 
                  key={idx} 
                  className="px-2 py-0.5 bg-purple-50 text-purple-700 text-xs rounded-full"
                >
                  {domain}
                </span>
              ))}
              {hackathon.domain.length > 2 && (
                <span className="px-2 py-0.5 bg-gray-50 text-gray-600 text-xs rounded-full">
                  +{hackathon.domain.length - 2} more
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default UpcomingHackathons;