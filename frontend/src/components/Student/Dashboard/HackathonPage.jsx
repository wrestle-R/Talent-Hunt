import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Calendar, MapPin, Users, Clock, Search, Filter, ArrowLeft, Award } from 'lucide-react';

const HackathonPage = () => {
  const navigate = useNavigate();
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDomains, setSelectedDomains] = useState([]);
  const [domains, setDomains] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchHackathons = async () => {
      try {
        setLoading(true);
        let response;
        
        if (activeTab === 'upcoming') {
          response = await axios.get('http://localhost:4000/api/student/hackathons/upcoming');
        } else if (activeTab === 'past') {
          response = await axios.get('http://localhost:4000/api/student/hackathons/past');
        } else if (activeTab === 'registered') {
          const user = JSON.parse(localStorage.getItem('user'));
          if (!user?.uid) {
            throw new Error("User not logged in");
          }
          response = await axios.get(`http://localhost:4000/api/student/hackathons/registered/${user.uid}`);
        }
        
        setHackathons(response.data.hackathons || []);
        
        if (activeTab === 'upcoming' && response.data.hackathons) {
          const uniqueDomains = [...new Set(response.data.hackathons.map(h => h.primaryDomain))];
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
    const isCapacityAvailable = hackathon.registration.currentlyRegistered < hackathon.registration.totalCapacity;
    
    if (!isRegistrationOpen) {
      return {
        isOpen: false,
        label: 'Registration Closed',
        colorClass: 'bg-red-900/20 text-red-400'
      };
    }
    
    if (!isCapacityAvailable) {
      return {
        isOpen: false,
        label: 'Registration Full',
        colorClass: 'bg-yellow-900/20 text-yellow-400'
      };
    }
    
    return {
      isOpen: true,
      label: 'Registration Open',
      colorClass: 'bg-[#E8C848]/10 text-[#E8C848]'
    };
  };

  const handleDomainToggle = (domain) => {
    setSelectedDomains(prev => 
      prev.includes(domain) 
        ? prev.filter(d => d !== domain)
        : [...prev, domain]
    );
  };

  const handleRegister = async (hackathonId) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user?.uid) {
        alert("Please log in to register for hackathons");
        return;
      }
      
      const token = localStorage.getItem('token');
      
      const registrationType = window.confirm(
        "Would you like to register as part of a team?\n\n" +
        "OK - Register with team\n" +
        "Cancel - Register as individual (Admin will assign you to a team)"
      ) ? 'team' : 'individual';
      
      await axios.post(
        `http://localhost:4000/api/student/hackathons/${hackathonId}/register`,
        { 
          uid: user.uid,
          registrationType 
        },
        { 
          headers: { Authorization: `Bearer ${token}` } 
        }
      );
      
      setActiveTab('registered');
      
    } catch (err) {
      console.error("Error registering for hackathon:", err);
      alert(err.response?.data?.message || "Registration failed. Please try again.");
    }
  };

  const filteredHackathons = hackathons.filter(hackathon => {
    const matchesSearch = 
      hackathon.hackathonName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hackathon.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hackathon.primaryDomain.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hackathon.primaryProblemStatement.toLowerCase().includes(searchTerm.toLowerCase());
                           
    const matchesDomain = 
      selectedDomains.length === 0 || 
      selectedDomains.includes(hackathon.primaryDomain);
                           
    return matchesSearch && matchesDomain;
  });

  const renderHackathonCard = (hackathon) => {
    const registrationStatus = getRegistrationStatus(hackathon);
    
    return (
      <div key={hackathon._id} className="bg-[#1A1A1A] border border-gray-800 hover:border-[#E8C848]/30 rounded-lg overflow-hidden shadow-lg hover:shadow-[#E8C848]/10 transition-all duration-300">
        <div className="p-5">
          <div className="flex justify-between items-start mb-3">
            <h4 className="text-lg font-semibold text-white line-clamp-1">
              {hackathon.hackathonName}
            </h4>
            <span className={`text-xs px-2 py-1 rounded-full ${registrationStatus.colorClass}`}>
              {registrationStatus.label}
            </span>
          </div>
          
          <div className="mb-4 text-sm text-gray-400 line-clamp-2">
            {hackathon.description}
          </div>
          
          <div className="mb-4">
            <span className="px-2 py-1 bg-[#E8C848]/10 text-[#E8C848] text-xs rounded-full">
              {hackathon.primaryDomain}
            </span>
            <p className="mt-2 text-sm text-gray-400 line-clamp-2">
              <span className="font-medium text-gray-300">Problem:</span> {hackathon.primaryProblemStatement}
            </p>
          </div>
          
          <div className="space-y-2 mb-4">
            <div className="flex items-center text-sm text-gray-400">
              <Calendar size={16} className="mr-2 flex-shrink-0 text-[#E8C848]" />
              <span>{formatDate(hackathon.startDate)} - {formatDate(hackathon.endDate)}</span>
            </div>
            
            <div className="flex items-center text-sm text-gray-400">
              <MapPin size={16} className="mr-2 flex-shrink-0 text-[#E8C848]" />
              <span>{hackathon.mode} {hackathon.mode !== 'Online' && `• ${hackathon.location}`}</span>
            </div>
            
            <div className="flex items-center text-sm text-gray-400">
              <Users size={16} className="mr-2 flex-shrink-0 text-[#E8C848]" />
              <span>Teams of {hackathon.registration.requiredTeamSize} • {hackathon.registration.currentlyRegistered} / {hackathon.registration.totalCapacity} participants</span>
            </div>
            
            <div className="flex items-center text-sm text-gray-400">
              <Clock size={16} className="mr-2 flex-shrink-0 text-[#E8C848]" />
              <span className="font-medium text-[#E8C848]">{getDaysRemaining(hackathon.lastRegisterDate)}</span>
            </div>
            
            {hackathon.prizePool > 0 && (
              <div className="flex items-center text-sm text-gray-400">
                <Award size={16} className="mr-2 flex-shrink-0 text-[#E8C848]" />
                <span className="font-medium">₹{hackathon.prizePool.toLocaleString()} prize pool</span>
              </div>
            )}
          </div>
          
          <div className="flex justify-between items-center">
            <button
              onClick={() => navigate(`/student/hackathon/${hackathon._id}`)}
              className="bg-[#E8C848] text-[#121212] px-3 py-2 rounded-md text-sm font-medium hover:bg-[#E8C848]/80 transition-all duration-300 shadow-lg shadow-[#E8C848]/30"
            >
              View Details
            </button>
            
            {activeTab !== 'registered' && registrationStatus.isOpen && (
              <button 
                onClick={() => handleRegister(hackathon._id)}
                className="text-[#E8C848] hover:text-[#E8C848]/80 font-medium text-sm"
              >
                Register Now
              </button>
            )}
            
            {activeTab === 'registered' && (
              <span className="text-[#E8C848] text-sm font-medium">
                Registered ✓
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full p-6 bg-[#121212] min-h-screen">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate('/student/hero')}
          className="bg-[#E8C848]/10 text-[#E8C848] p-2 rounded-full mr-4 hover:bg-[#E8C848]/20 transition-all duration-300"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-2xl font-bold text-white">Explore Hackathons</h2>
      </div>
      
      <div className="flex items-center border-b border-gray-800 mb-6">
        <button
          className={`px-6 py-3 ${activeTab === 'upcoming' ? 'text-[#E8C848] border-b-2 border-[#E8C848] font-medium' : 'text-gray-400'}`}
          onClick={() => setActiveTab('upcoming')}
        >
          Upcoming
        </button>
        <button
          className={`px-6 py-3 ${activeTab === 'past' ? 'text-[#E8C848] border-b-2 border-[#E8C848] font-medium' : 'text-gray-400'}`}
          onClick={() => setActiveTab('past')}
        >
          Past
        </button>
        <button
          className={`px-6 py-3 ${activeTab === 'registered' ? 'text-[#E8C848] border-b-2 border-[#E8C848] font-medium' : 'text-gray-400'}`}
          onClick={() => setActiveTab('registered')}
        >
          Registered
        </button>
      </div>
      
      <div className="mb-6">
        <div className="flex items-center gap-4">
          <div className="bg-[#1A1A1A] rounded-lg flex-1 flex items-center border border-gray-800 hover:border-[#E8C848]/30 px-3 py-2 transition-all duration-300">
            <Search size={20} className="text-[#E8C848]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search hackathons..."
              className="w-full focus:outline-none bg-transparent text-white placeholder-gray-500"
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="bg-[#1A1A1A] border border-gray-800 hover:border-[#E8C848]/30 p-2 rounded-lg text-[#E8C848] hover:bg-[#E8C848]/10 transition-all duration-300"
          >
            <Filter size={20} />
          </button>
        </div>
        
        {showFilters && (
          <div className="bg-[#1A1A1A] p-4 rounded-lg shadow-lg mt-3 border border-gray-800 hover:border-[#E8C848]/30 transition-all duration-300">
            <h4 className="font-medium text-white mb-3">Filter by domain</h4>
            <div className="flex flex-wrap gap-2">
              {domains.map((domain, idx) => (
                <button
                  key={idx}
                  onClick={() => handleDomainToggle(domain)}
                  className={`px-3 py-1 rounded-full text-sm transition-all duration-300 ${
                    selectedDomains.includes(domain)
                      ? 'bg-[#E8C848] text-[#121212]'
                      : 'bg-[#E8C848]/10 text-[#E8C848] hover:bg-[#E8C848]/20'
                  }`}
                >
                  {domain}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E8C848]"></div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-900/20 p-6 rounded-lg text-center text-red-400 shadow-lg">
          <p className="font-medium mb-2">Oops! Something went wrong</p>
          <p>{error}</p>
        </div>
      )}
      
      {!loading && !error && filteredHackathons.length === 0 && (
        <div className="bg-[#1A1A1A] p-8 rounded-lg text-center shadow-lg">
          <div className="flex justify-center mb-4">
            <Calendar size={48} className="text-gray-400" />
          </div>
          <h3 className="font-medium text-lg text-white mb-2">
            {selectedDomains.length > 0 || searchTerm
              ? "No matching hackathons found"
              : activeTab === 'upcoming'
              ? "No upcoming hackathons"
              : activeTab === 'past'
              ? "No past hackathons"
              : "You haven't registered for any hackathons yet"}
          </h3>
          <p className="text-gray-400">
            {selectedDomains.length > 0 || searchTerm
              ? "Try adjusting your filters or search terms"
              : activeTab === 'registered'
              ? "Explore and register for hackathons to develop your skills"
              : "Check back later for new hackathon opportunities"}
          </p>
        </div>
      )}
      
      {!loading && !error && filteredHackathons.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHackathons.map(renderHackathonCard)}
        </div>
      )}
    </div>
  );
};

export default HackathonPage;