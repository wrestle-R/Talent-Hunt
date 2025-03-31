import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Calendar, MapPin, Users, Clock, Award, ArrowLeft, Check, Eye, X, AlertCircle, Group, UserPlus, AlertTriangle } from 'lucide-react';

const HackathonDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hackathon, setHackathon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [registering, setRegistering] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [registrationType, setRegistrationType] = useState(null);
  const [teamLeader, setTeamLeader] = useState(false);
  const [currentTeam, setCurrentTeam] = useState(null);
  const [registrationError, setRegistrationError] = useState(null);
  const [teamError, setTeamError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  
  const userRole = localStorage.getItem('userRole');
  const isMentor = userRole === 'mentor';

  const fetchTeamInfo = async (uid) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:4000/api/student/team/${uid}`,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
  
      if (response.data.success) {
        const team = response.data.team;
        setCurrentTeam(team);
        if (team) {
          setTeamLeader(team.isLeader);
        } else {
          setTeamLeader(false);
        }
      }
    } catch (err) {
      console.error("Error fetching team info:", err);
      setTeamError(err.response?.data?.message || "Failed to fetch team information");
      setCurrentTeam(null);
      setTeamLeader(false);
    }
  };

  const checkRegistrationStatus = async () => {
    if (!hackathon || isMentor) return;

    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user?._id) return;

      const isTeamRegistered = hackathon.teamApplicants?.some(app => 
        app.members.some(member => member.toString() === user._id)
      );

      const isIndividuallyRegistered = hackathon.individualApplicants?.some(app => 
        app.student.toString() === user._id
      );

      const isApproved = hackathon.registeredStudents?.some(
        student => student.toString() === user._id
      );

      setRegistered(isTeamRegistered || isIndividuallyRegistered || isApproved);
    } catch (err) {
      console.error("Error checking registration status:", err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:4000/api/student/hackathons/${id}`);
        setHackathon(response.data.hackathon);
        await checkRegistrationStatus();
      } catch (err) {
        console.error("Error fetching hackathon:", err);
        setError("Failed to load hackathon details");
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.uid) {
      fetchTeamInfo(user.uid);
    }
  }, [id, isMentor]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

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

  const registerForHackathon = () => {
    if (isMentor) return;

    try {
      setRegistrationError(null);
      setSuccessMessage(null);

      if (registered) {
        setRegistrationError("You are already registered for this hackathon");
        return;
      }

      if (!isRegistrationOpen) {
        setRegistrationError("Registration is closed for this hackathon");
        return;
      }

      if (!hasSpaceAvailable) {
        setRegistrationError("This hackathon has reached its maximum capacity");
        return;
      }

      setShowRegistrationModal(true);
    } catch (err) {
      console.error("Error in registration:", err);
      setRegistrationError("Failed to start registration process");
    }
  };

  const handleRegisterWithTeam = async () => {
    try {
      setRegistering(true);
      setRegistrationError(null);
      setSuccessMessage(null);

      if (!currentTeam) {
        setRegistrationError("No team found");
        return;
      }

      if (!teamLeader) {
        setRegistrationError("Only team leader can register the team");
        return;
      }

      if (currentTeam.members.length !== hackathon.registration.requiredTeamSize) {
        setRegistrationError(`Team must have exactly ${hackathon.registration.requiredTeamSize} members`);
        return;
      }

      const user = JSON.parse(localStorage.getItem('user'));
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        `http://localhost:4000/api/student/hackathons/${id}/register`,
        { 
          uid: user.uid,
          registrationType: 'team',
          teamId: currentTeam._id
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setHackathon(response.data.hackathon);
        setSuccessMessage(response.data.message);
        setRegistered(true);
        setTimeout(() => {
          setShowTeamModal(false);
          setShowRegistrationModal(false);
        }, 2000);
      }
    } catch (err) {
      console.error("Error registering team:", err);
      setRegistrationError(err.response?.data?.message || "Failed to register team");
    } finally {
      setRegistering(false);
    }
  };

  const handleRegisterIndividually = async () => {
    try {
      setRegistering(true);
      setRegistrationError(null);
      setSuccessMessage(null);

      const user = JSON.parse(localStorage.getItem('user'));
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        `http://localhost:4000/api/student/hackathons/${id}/register`,
        { 
          uid: user.uid,
          registrationType: 'individual'
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setHackathon(response.data.hackathon);
        setSuccessMessage(response.data.message);
        setRegistered(true);
        setTimeout(() => {
          setShowRegistrationModal(false);
        }, 2000);
      }
    } catch (err) {
      console.error("Error registering individually:", err);
      setRegistrationError(err.response?.data?.message || "Failed to register");
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
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg"
          >
            Back
          </button>
        </div>
      </div>
    );
  }
  console.log('Team Status:', { 
    hasTeam: !!currentTeam, 
    isLeader: teamLeader, 
    teamMembers: currentTeam?.members?.length 
  });
  const today = new Date();
  const lastRegisterDate = new Date(hackathon.lastRegisterDate);
  const isRegistrationOpen = today <= lastRegisterDate;
  const hasSpaceAvailable = hackathon.registration.currentlyRegistered < hackathon.registration.totalCapacity;

  return (
    <div className="w-full p-6 bg-gray-50 min-h-screen">
      <button 
        onClick={() => navigate(-1)}
        className="bg-purple-100 text-purple-700 p-2 rounded-full mb-6 hover:bg-purple-200 transition-colors flex items-center"
      >
        <ArrowLeft size={20} />
      </button>
      
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
        <div className="p-6">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{hackathon.hackathonName}</h1>
            
            <div className="flex items-center gap-4">
              {isMentor ? (
                <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg flex items-center">
                  <Eye size={18} className="mr-2" />
                  View Only (Mentor)
                </div>
              ) : registered ? (
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
              Teams of {hackathon.registration.requiredTeamSize} • {hackathon.registration.currentlyRegistered} / {hackathon.registration.totalCapacity} registered
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <div>
                <h2 className="text-xl font-bold mb-3">About this Hackathon</h2>
                <p className="text-gray-700 whitespace-pre-line">{hackathon.description}</p>
              </div>
              
              <div>
                <h2 className="text-xl font-bold mb-3">Problem Statement</h2>
                <div className="bg-orange-50 border border-orange-100 p-4 rounded-lg">
                  <p>{hackathon.primaryProblemStatement}</p>
                </div>
              </div>
              
              <div>
                <h2 className="text-xl font-bold mb-3">Domain</h2>
                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
                  {hackathon.primaryDomain}
                </span>
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
                      <h3 className="font-medium">Team Structure</h3>
                      <p className="text-gray-600">
                        Teams of {hackathon.registration.requiredTeamSize} members
                      </p>
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

      {/* Registration Type Modal */}
      {showRegistrationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Choose Registration Type</h3>
              <button 
                onClick={() => setShowRegistrationModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            {/* Error Message */}
            {registrationError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-start">
                <AlertTriangle className="mr-2 flex-shrink-0 mt-0.5" size={16} />
                <p>{registrationError}</p>
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 flex items-start">
                <Check className="mr-2 flex-shrink-0 mt-0.5" size={16} />
                <p>{successMessage}</p>
              </div>
            )}

            <div className="space-y-4">
              {/* Team Registration Option */}
              {currentTeam && (
                <div>
                  <button
                    onClick={() => setShowTeamModal(true)}
                    className="w-full p-4 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors flex items-center"
                    disabled={currentTeam.members.length !== hackathon.registration.requiredTeamSize}
                  >
                    <Group className="text-purple-600 mr-3" size={24} />
                    <div className="text-left flex-grow">
                      <h4 className="font-medium text-gray-800">Register with Your Team</h4>
                      <p className="text-sm text-gray-600">Team Name: {currentTeam.name}</p>
                      <p className="text-sm text-gray-600">
                        Members: {currentTeam.members.length}/{hackathon.registration.requiredTeamSize}
                      </p>
                    </div>
                  </button>

                  {currentTeam.members.length < hackathon.registration.requiredTeamSize && (
                    <div className="mt-2 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center">
                      <AlertTriangle className="text-yellow-600 mr-2" size={16} />
                      <p className="text-sm text-yellow-700">
                        Your team needs {hackathon.registration.requiredTeamSize - currentTeam.members.length} more member{hackathon.registration.requiredTeamSize - currentTeam.members.length > 1 ? 's' : ''} to register
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Individual Registration Option */}
              <button
                onClick={handleRegisterIndividually}
                className="w-full p-4 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors flex items-center"
                disabled={registering}
              >
                <UserPlus className="text-blue-600 mr-3" size={24} />
                <div className="text-left">
                  <h4 className="font-medium text-gray-800">Register as Individual</h4>
                  <p className="text-sm text-gray-600">Admin will assign you to a team</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Team Confirmation Modal */}
      {showTeamModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Confirm Team Registration</h3>
              <button 
                onClick={() => setShowTeamModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            {registrationError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-start">
                <AlertTriangle className="mr-2 flex-shrink-0 mt-0.5" size={16} />
                <p>{registrationError}</p>
              </div>
            )}

            <div className="space-y-4">
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-medium text-purple-800">Team Details</h4>
                <p className="text-purple-600">Name: {currentTeam.name}</p>
                <p className="text-purple-600">Members: {currentTeam.members.length}/{hackathon.registration.requiredTeamSize}</p>
                
                {currentTeam.members.length < hackathon.registration.requiredTeamSize && (
                  <div className="mt-3 flex items-start text-yellow-700">
                    <AlertTriangle className="mr-2 flex-shrink-0 mt-0.5" size={16} />
                    <p className="text-sm">
                      Cannot register - Team requires {hackathon.registration.requiredTeamSize} members
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-end gap-4">
                <button
                  onClick={() => setShowTeamModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRegisterWithTeam}
                  disabled={registering || currentTeam.members.length !== hackathon.registration.requiredTeamSize}
                  className={`px-4 py-2 rounded-lg flex items-center ${
                    currentTeam.members.length === hackathon.registration.requiredTeamSize
                      ? "bg-purple-600 hover:bg-purple-700 text-white"
                      : "bg-gray-200 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {registering ? (
                    <>
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
                      Processing...
                    </>
                  ) : (
                    'Confirm Registration'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HackathonDetail;