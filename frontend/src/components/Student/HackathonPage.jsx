import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Calendar, MapPin, Users, Clock, Search, Filter, ArrowLeft, Award } from 'lucide-react';

const HackathonPage = () => {
  const navigate = useNavigate();
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming'); // upcoming, past, registered
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDomains, setSelectedDomains] = useState([]);
  const [domains, setDomains] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch hackathons on component mount and when tab changes
  useEffect(() => {
    const fetchHackathons = async () => {
      try {
        setLoading(true);
        let response;
        
        // Change endpoint based on active tab - UPDATED API ENDPOINTS
        if (activeTab === 'upcoming') {
          response = await axios.get('http://localhost:4000/api/student/hackathons/upcoming');
        } else if (activeTab === 'past') {
          response = await axios.get('http://localhost:4000/api/student/hackathons/past');
        } else if (activeTab === 'registered') {
          const user = JSON.parse(localStorage.getItem('user'));
          if (!user || !user.uid) {
            throw new Error("User not logged in");
          }
          response = await axios.get(`http://localhost:4000/api/student/hackathons/registered/${user.uid}`);
        }
        
        setHackathons(response.data.hackathons || []);
        
        // Extract unique domains from all hackathons
        if (activeTab === 'upcoming' && response.data.hackathons) {
          const allDomains = response.data.hackathons.flatMap(h => h.domain || []);
          const uniqueDomains = [...new Set(allDomains)];
          setDomains(uniqueDomains);
        }
        
        setError(null);
      } catch (err) {
        console.error("Error fetching hackathons:", err);
        setError("Failed to load hackathons. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchHackathons();
  }, [activeTab]);

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

  const handleDomainToggle = (domain) => {
    if (selectedDomains.includes(domain)) {
      setSelectedDomains(selectedDomains.filter(d => d !== domain));
    } else {
      setSelectedDomains([...selectedDomains, domain]);
    }
  };

  const handleRegister = async (hackathonId) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.uid) {
        alert("Please log in to register for hackathons");
        return;
      }
      
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:4000/api/student/hackathons/${hackathonId}/register`,
        { uid: user.uid },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Refresh the hackathon list
      setActiveTab('registered');
      
    } catch (err) {
      console.error("Error registering for hackathon:", err);
      alert(err.response?.data?.message || "Registration failed. Please try again.");
    }
  };

  const filteredHackathons = hackathons.filter(hackathon => {
    const matchesSearch = hackathon.hackathonName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           hackathon.description.toLowerCase().includes(searchTerm.toLowerCase());
                           
    const matchesDomain = selectedDomains.length === 0 || 
                           selectedDomains.some(domain => hackathon.domain.includes(domain));
                           
    return matchesSearch && matchesDomain;
  });

  return (
    <div className="w-full p-6 bg-gray-50 min-h-screen">
      {/* Header with back button */}
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate('/student/hero')}
          className="bg-purple-100 text-purple-700 p-2 rounded-full mr-4 hover:bg-purple-200 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-2xl font-bold text-gray-800">Explore Hackathons</h2>
      </div>
      
      {/* Tabs */}
      <div className="flex items-center border-b border-gray-200 mb-6">
        <button
          className={`px-6 py-3 ${activeTab === 'upcoming' ? 'text-purple-600 border-b-2 border-purple-600 font-medium' : 'text-gray-500'}`}
          onClick={() => setActiveTab('upcoming')}
        >
          Upcoming
        </button>
        <button
          className={`px-6 py-3 ${activeTab === 'past' ? 'text-purple-600 border-b-2 border-purple-600 font-medium' : 'text-gray-500'}`}
          onClick={() => setActiveTab('past')}
        >
          Past
        </button>
        <button
          className={`px-6 py-3 ${activeTab === 'registered' ? 'text-purple-600 border-b-2 border-purple-600 font-medium' : 'text-gray-500'}`}
          onClick={() => setActiveTab('registered')}
        >
          Registered
        </button>
      </div>
      
      {/* Search and Filter */}
      <div className="mb-6">
        <div className="flex items-center gap-4">
          <div className="bg-white rounded-lg flex-1 flex items-center border border-gray-300 px-3 py-2">
            <Search size={20} className="text-gray-400 mr-2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search hackathons..."
              className="w-full focus:outline-none"
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="bg-white border border-gray-300 p-2 rounded-lg hover:bg-gray-50"
          >
            <Filter size={20} className="text-gray-600" />
          </button>
        </div>
        
        {showFilters && (
          <div className="bg-white p-4 rounded-lg shadow-sm mt-3 border border-gray-200">
            <h4 className="font-medium text-gray-700 mb-3">Filter by domain</h4>
            <div className="flex flex-wrap gap-2">
              {domains.map((domain, idx) => (
                <button
                  key={idx}
                  onClick={() => handleDomainToggle(domain)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedDomains.includes(domain)
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {domain}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Loading state */}
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
        </div>
      )}
      
      {/* Error state */}
      {error && (
        <div className="bg-red-50 p-6 rounded-lg text-center text-red-700 shadow-sm">
          <p className="font-medium mb-2">Oops! Something went wrong</p>
          <p>{error}</p>
        </div>
      )}
      
      {/* Empty state */}
      {!loading && !error && filteredHackathons.length === 0 && (
        <div className="bg-white p-8 rounded-lg text-center shadow-sm">
          <div className="flex justify-center mb-4">
            <Calendar size={48} className="text-gray-400" />
          </div>
          <h3 className="font-medium text-lg text-gray-700 mb-2">
            {selectedDomains.length > 0 || searchTerm
              ? "No matching hackathons found"
              : activeTab === 'upcoming'
              ? "No upcoming hackathons"
              : activeTab === 'past'
              ? "No past hackathons"
              : "You haven't registered for any hackathons yet"}
          </h3>
          <p className="text-gray-500">
            {selectedDomains.length > 0 || searchTerm
              ? "Try adjusting your filters or search terms"
              : activeTab === 'registered'
              ? "Explore and register for hackathons to develop your skills"
              : "Check back later for new hackathon opportunities"}
          </p>
        </div>
      )}
      
      {/* Hackathons grid */}
      {!loading && !error && filteredHackathons.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHackathons.map(hackathon => {
            const registrationStatus = getRegistrationStatus(hackathon);
            
            return (
              <div key={hackathon._id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="text-lg font-semibold text-gray-800 line-clamp-1">{hackathon.hackathonName}</h4>
                    <span className={`text-xs px-2 py-1 rounded-full ${registrationStatus.colorClass}`}>
                      {registrationStatus.label}
                    </span>
                  </div>
                  
                  <div className="mb-4 text-sm text-gray-500 line-clamp-2">
                    {hackathon.description}
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar size={16} className="mr-2 flex-shrink-0" />
                      <span>
                        {formatDate(hackathon.startDate)} - {formatDate(hackathon.endDate)}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin size={16} className="mr-2 flex-shrink-0" />
                      <span>{hackathon.mode} {hackathon.mode !== 'Online' && `• ${hackathon.location}`}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <Users size={16} className="mr-2 flex-shrink-0" />
                      <span>
                        {hackathon.registration.currentlyRegistered} / {hackathon.registration.totalCapacity} participants
                      </span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock size={16} className="mr-2 flex-shrink-0" />
                      <span className="font-medium text-purple-600">
                        {getDaysRemaining(hackathon.startDate)}
                      </span>
                    </div>
                    
                    {hackathon.prizePool > 0 && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Award size={16} className="mr-2 flex-shrink-0" />
                        <span className="font-medium">
                          ₹{hackathon.prizePool.toLocaleString()} prize pool
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {hackathon.domain.slice(0, 3).map((domain, idx) => (
                      <span 
                        key={idx} 
                        className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-full"
                      >
                        {domain}
                      </span>
                    ))}
                    {hackathon.domain.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                        +{hackathon.domain.length - 3} more
                      </span>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => navigate(`/student/hackathon/${hackathon._id}`)}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      View Details
                    </button>
                    
                    {activeTab !== 'registered' && registrationStatus.isOpen && (
                      <button 
                        onClick={() => handleRegister(hackathon._id)}
                        className="text-purple-600 hover:text-purple-700 font-medium text-sm"
                      >
                        Register Now
                      </button>
                    )}
                    
                    {activeTab === 'registered' && (
                      <span className="text-green-600 text-sm font-medium">
                        Registered ✓
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HackathonPage;