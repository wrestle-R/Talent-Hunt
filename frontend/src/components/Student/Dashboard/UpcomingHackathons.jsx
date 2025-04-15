import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Calendar, MapPin, Users, Award, Clock } from 'lucide-react';

const UpcomingHackathons = ({ limit = 3, layout = "list" }) => {
  const navigate = useNavigate();
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const role = localStorage.userRole;
  console.log(role);

  useEffect(() => {
    const fetchHackathons = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:4000/api/student/hackathons/upcoming');
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
      colorClass: isRegistrationOpen ? 'bg-[#E8C848]/10 text-[#E8C848]' : 'bg-red-900/20 text-red-400'
    };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#E8C848]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 text-red-400 p-4 rounded-lg text-center border border-red-900/50">
        <p>{error}</p>
      </div>
    );
  }

  if (hackathons.length === 0) {
    return (
      <div className="bg-[#1A1A1A] p-6 rounded-lg text-center border border-gray-800">
        <Calendar size={32} className="text-[#E8C848]/30 mx-auto mb-2" />
        <p className="text-white">No upcoming hackathons found.</p>
        <p className="text-gray-400 text-sm mt-1">Check back later for new opportunities!</p>
      </div>
    );
  }

  if (layout === "grid") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {hackathons.map(hackathon => {
          const registrationStatus = getRegistrationStatus(hackathon);
          
          return (
            <div 
              key={hackathon._id}
              onClick={() => navigate(`/student/hackathon/${hackathon._id}`)}
              className="bg-[#1A1A1A] border border-gray-800 hover:border-[#E8C848]/30 rounded-lg p-4 shadow-lg cursor-pointer transform hover:shadow-[#E8C848]/10 hover:scale-[1.01] transition-all duration-300 h-full flex flex-col"
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-white line-clamp-1">{hackathon.hackathonName}</h4>
                <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ml-1 ${
                  registrationStatus.isOpen 
                    ? 'bg-[#E8C848]/10 text-[#E8C848]' 
                    : 'bg-red-900/20 text-red-400'
                }`}>
                  {registrationStatus.label}
                </span>
              </div>
              
              <p className="text-sm text-gray-400 mb-3 line-clamp-2 flex-grow">
                {hackathon.description}
              </p>
              
              <div className="space-y-2">
                <div className="flex items-center text-xs text-gray-400">
                  <Calendar size={14} className="mr-1.5 flex-shrink-0 text-[#E8C848]" />
                  <span className="truncate">{formatDate(hackathon.startDate)}</span>
                </div>
                
                <div className="flex items-center text-xs text-gray-400">
                  <Clock size={14} className="mr-1.5 flex-shrink-0 text-[#E8C848]" />
                  <span className="text-[#E8C848] font-medium">
                    {getDaysRemaining(hackathon.startDate)}
                  </span>
                </div>
                
                <div className="flex items-center text-xs text-gray-400">
                  <MapPin size={14} className="mr-1.5 flex-shrink-0 text-[#E8C848]" />
                  <span className="truncate">{hackathon.mode}</span>
                </div>
                
                <div className="flex items-center text-xs text-gray-400">
                  <Users size={14} className="mr-1.5 flex-shrink-0 text-[#E8C848]" />
                  <span>
                    {hackathon.registration.currentlyRegistered} / {hackathon.registration.totalCapacity}
                  </span>
                </div>
              </div>
              
              {hackathon.primaryDomain && (
                <div className="flex flex-wrap gap-1 mt-3">
                  <span className="px-2 py-0.5 bg-[#E8C848]/10 text-[#E8C848] text-xs rounded-full line-clamp-1 border border-[#E8C848]/20">
                    {hackathon.primaryDomain}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {hackathons.map(hackathon => {
        const registrationStatus = getRegistrationStatus(hackathon);
        
        return (
          <div 
            key={hackathon._id}
            onClick={() => navigate(`/student/hackathon/${hackathon._id}`)}
            className="bg-[#1A1A1A] border border-gray-800 hover:border-[#E8C848]/30 rounded-lg p-4 cursor-pointer transform hover:scale-[1.01] transition-all duration-300 shadow-lg hover:shadow-[#E8C848]/10"
          >
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-medium text-white">{hackathon.hackathonName}</h4>
              <span className={`text-xs px-2 py-1 rounded-full ${
                registrationStatus.isOpen 
                  ? 'bg-[#E8C848]/10 text-[#E8C848]' 
                  : 'bg-red-900/20 text-red-400'
              }`}>
                {registrationStatus.label}
              </span>
            </div>
            
            <p className="text-sm text-gray-400 mb-3 line-clamp-2">
              {hackathon.description}
            </p>
            
            <div className="grid grid-cols-2 gap-y-2 mb-3">
              <div className="flex items-center text-xs text-gray-400">
                <Calendar size={14} className="mr-1.5 text-[#E8C848]" />
                <span>{formatDate(hackathon.startDate)}</span>
              </div>
              
              <div className="flex items-center text-xs text-gray-400">
                <Clock size={14} className="mr-1.5 text-[#E8C848]" />
                <span className="text-[#E8C848] font-medium">
                  {getDaysRemaining(hackathon.startDate)}
                </span>
              </div>
              
              <div className="flex items-center text-xs text-gray-400">
                <MapPin size={14} className="mr-1.5 text-[#E8C848]" />
                <span>{hackathon.mode}</span>
              </div>
              
              <div className="flex items-center text-xs text-gray-400">
                <Users size={14} className="mr-1.5 text-[#E8C848]" />
                <span>
                  {hackathon.registration.currentlyRegistered} / {hackathon.registration.totalCapacity}
                </span>
              </div>
            </div>
            
            {hackathon.prizePool > 0 && (
              <div className="flex items-center text-sm">
                <Award size={15} className="mr-1.5 text-[#E8C848]" />
                <span className="font-medium text-white">
                  ₹{hackathon.prizePool.toLocaleString()} prize pool
                </span>
              </div>
            )}
            
            <div className="flex flex-wrap gap-2 mt-3">
              {hackathon.primaryDomain && (
                <span className="px-2 py-0.5 bg-[#E8C848]/10 text-[#E8C848] text-xs rounded-full border border-[#E8C848]/20">
                  {hackathon.primaryDomain}
                </span>
              )}
              
              <span className="px-2 py-0.5 bg-blue-900/20 text-blue-400 text-xs rounded-full flex items-center">
                <Users size={10} className="mr-1" />
                Team: {hackathon.registration?.requiredTeamSize || 4} members
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default UpcomingHackathons;