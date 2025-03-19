import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Calendar, MapPin, Users, Clock, Award, ArrowLeft, Check } from 'lucide-react';

const HackathonDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hackathon, setHackathon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [registering, setRegistering] = useState(false);
  const [registered, setRegistered] = useState(false);

  // Fetch hackathon details on component mount
  useEffect(() => {
    const fetchHackathon = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:4000/api/student/hackathons/${id}`);
        setHackathon(response.data.hackathon);
        
        // Check if user is registered
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && response.data.hackathon.applicants) {
          const isRegistered = response.data.hackathon.applicants.some(
            app => app.user === user._id || app.user._id === user._id
          );
          setRegistered(isRegistered);
        }

        setError(null);
      } catch (err) {
        console.error("Error fetching hackathon:", err);
        setError("Failed to load hackathon details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchHackathon();
  }, [id]);

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Get days remaining until start date
  const getDaysRemaining = (dateString) => {
    const today = new Date();
    const targetDate = new Date(dateString);
    const timeDiff = targetDate - today;
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    if (daysDiff < 0) return 'Event has ended';
    if (daysDiff === 0) return 'Event starts today';
    if (daysDiff === 1) return 'Event starts tomorrow';
    return `${daysDiff} days until start`;
  };

  // Register for hackathon
  const registerForHackathon = async () => {
    try {
      setRegistering(true);
      const user = JSON.parse(localStorage.getItem('user'));
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        `http://localhost:4000/api/student/hackathons/${id}/register`,
        { uid: user.uid },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        setRegistered(true);
        setHackathon(response.data.hackathon);
        alert("Successfully registered for the hackathon!");
      }
    } catch (err) {
      console.error("Error registering for hackathon:", err);
      alert(err.response?.data?.message || "Failed to register. Please try again.");
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full p-6 flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error || !hackathon) {
    return (
      <div className="w-full p-6 bg-red-50 flex justify-center items-center min-h-screen">
        <div className="text-center text-red-700">
          <h2 className="text-xl font-bold mb-2">Error Loading Hackathon</h2>
          <p>{error || "Hackathon not found"}</p>
          <button 
            onClick={() => navigate('/student/hackathons')}
            className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg"
          >
            Back to Hackathons
          </button>
        </div>
      </div>
    );
  }

  // Check if registration is still open
  const today = new Date();
  const lastRegisterDate = new Date(hackathon.lastRegisterDate);
  const isRegistrationOpen = today <= lastRegisterDate;

  // Check if hackathon has space available
  const hasSpaceAvailable = hackathon.registration.currentlyRegistered < hackathon.registration.totalCapacity;

  return (
    <div className="w-full p-6 bg-gray-50 min-h-screen">
      {/* Back button */}
      <button 
        onClick={() => navigate('/student/hackathons')}
        className="bg-purple-100 text-purple-700 p-2 rounded-full mb-6 hover:bg-purple-200 transition-colors flex items-center"
      >
        <ArrowLeft size={20} />
      </button>
      
      {/* Hackathon header */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
        <div className="p-6">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{hackathon.hackathonName}</h1>
            
            <div className="flex items-center gap-4">
              {registered ? (
                <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg flex items-center">
                  <Check size={18} className="mr-2" />
                  Registered
                </div>
              ) : (
                <button
                  onClick={registerForHackathon}
                  disabled={registering || !isRegistrationOpen || !hasSpaceAvailable || registered}
                  className={`px-6 py-3 rounded-lg font-medium flex items-center ${
                    isRegistrationOpen && hasSpaceAvailable && !registered
                      ? "bg-purple-600 hover:bg-purple-700 text-white"
                      : "bg-gray-200 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {registering ? (
                    <>
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-current rounded-full border-t-transparent"></div>
                      Processing...
                    </>
                  ) : (
                    "Register Now"
                  )}
                </button>
              )}
            </div>
          </div>
          
          {/* Registration status */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className={`px-4 py-2 rounded-lg text-sm font-medium ${
              isRegistrationOpen 
                ? "bg-green-100 text-green-800" 
                : "bg-red-100 text-red-800"
            }`}>
              {isRegistrationOpen 
                ? `Registration open until ${formatDate(hackathon.lastRegisterDate)}` 
                : "Registration closed"}
            </div>
            
            <div className="bg-purple-100 text-purple-800 px-4 py-2 rounded-lg text-sm font-medium">
              {getDaysRemaining(hackathon.startDate)}
            </div>
            
            <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg text-sm font-medium">
              {hackathon.registration.currentlyRegistered} / {hackathon.registration.totalCapacity} registered
            </div>
          </div>
          
          {/* Hackathon details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <div>
                <h2 className="text-xl font-bold mb-3">About this Hackathon</h2>
                <p className="text-gray-700 whitespace-pre-line">{hackathon.description}</p>
              </div>
              
              {hackathon.problemStatement && hackathon.problemStatement.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold mb-3">Problem Statements</h2>
                  <div className="space-y-3">
                    {hackathon.problemStatement.map((problem, index) => (
                      <div key={index} className="bg-orange-50 border border-orange-100 p-4 rounded-lg">
                        <p>{problem}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <h2 className="text-xl font-bold mb-3">Domains</h2>
                <div className="flex flex-wrap gap-2">
                  {hackathon.domain.map((domain, index) => (
                    <span 
                      key={index} 
                      className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full"
                    >
                      {domain}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            <div>
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h2 className="text-lg font-bold mb-4">Event Details</h2>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <Calendar className="text-purple-600 mt-1 mr-3" size={20} />
                    <div>
                      <h3 className="font-medium">Event Dates</h3>
                      <p className="text-gray-600">{formatDate(hackathon.startDate)} - {formatDate(hackathon.endDate)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <MapPin className="text-purple-600 mt-1 mr-3" size={20} />
                    <div>
                      <h3 className="font-medium">Mode</h3>
                      <p className="text-gray-600">
                        {hackathon.mode}
                        {hackathon.mode !== 'Online' && ` • ${hackathon.location}`}
                      </p>
                    </div>
                  </div>
                  
                  {hackathon.prizePool > 0 && (
                    <div className="flex items-start">
                      <Award className="text-purple-600 mt-1 mr-3" size={20} />
                      <div>
                        <h3 className="font-medium">Prize Pool</h3>
                        <p className="text-gray-600">₹{hackathon.prizePool.toLocaleString()}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-start">
                    <Users className="text-purple-600 mt-1 mr-3" size={20} />
                    <div>
                      <h3 className="font-medium">Participants</h3>
                      <p className="text-gray-600">
                        {hackathon.registration.currentlyRegistered} registered out of {hackathon.registration.totalCapacity} spots
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h2 className="text-lg font-bold mb-4">Organized by</h2>
                <p className="font-medium">{hackathon.postedByAdmin?.name || "Admin"}</p>
                <p className="text-gray-600">{hackathon.postedByAdmin?.organization || ""}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HackathonDetail;