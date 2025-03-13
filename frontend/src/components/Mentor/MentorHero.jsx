import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebaseConfig';
import axios from 'axios';
import { 
  Star, Edit, Briefcase, Code, MessageCircle, Calendar, 
  Clock, Award, Users, CheckCircle, Bell, User, BookOpen, Cpu
} from 'lucide-react';

const MentorHero = () => {
  const [userData, setUserData] = useState({
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@example.com',
    profile_picture: 'https://randomuser.me/api/portraits/women/44.jpg',
    current_role: {
      title: 'Senior Software Engineer',
      company: 'TechCorp Solutions'
    },
    years_of_experience: 8,
    expertise: {
      technical_skills: ['JavaScript', 'React', 'Node.js', 'Python', 'Machine Learning'],
      non_technical_skills: ['Leadership', 'Project Management', 'Mentoring']
    },
    rating: 4.8,
    bio: 'Passionate software engineer with expertise in web development and machine learning. Love to mentor upcoming developers and share knowledge.'
  });
  
  // Dashboard data
  const [dashboardData, setDashboardData] = useState({
    stats: {
      studentsReached: 124,
      activeProjects: 5,
      mentorshipHours: 320,
      completedMentorships: 28
    },
    applications: [
      { id: 1, name: "Alex Chen", project: "ML Voice Recognition", date: "March 10" },
      { id: 2, name: "Maya Patel", project: "Computer Vision App", date: "March 12" },
      { id: 3, name: "James Wilson", project: "NLP Chatbot", date: "March 13" }
    ],
    reachouts: [
      { id: 1, name: "Tara Singh", interest: "Neural Networks", institution: "MIT" },
      { id: 2, name: "Ben Kim", interest: "Computer Vision", institution: "Stanford" }
    ],
    upcomingHackathons: [
      { id: 1, name: "AI Innovation Hackathon", date: "March 25-27", participants: 250 },
      { id: 2, name: "Code For Good", date: "April 10-12", participants: 500 }
    ],
    upcomingSessions: [
      { id: 1, name: "Code Review with Maya", date: "March 16, 3:00 PM", duration: "1 hour" },
      { id: 2, name: "Project Planning with James", date: "March 18, 2:00 PM", duration: "45 min" }
    ]
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // Keep example data for now, just update auth specific fields
        setUserData((prevData) => ({
          ...prevData,
          email: user.email || prevData.email
        }));
      } else {
        navigate('/register');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const fetchMentorProfile = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user) {
          console.error("User not found in localStorage.");
          return;
        }

        // In a real app, you'd be fetching actual data here
        // For now, we'll keep using the sample data
        
        /* Uncomment this when you have an actual API endpoint
        const response = await axios.get(`http://localhost:4000/api/mentor/profile/${user.uid}`);
        setUserData(prev => ({
          ...prev,  
          ...response.data,
        }));
        
        setDashboardData(prev => ({
          ...prev,
          stats: response.data.stats || prev.stats,
          applications: response.data.applications || prev.applications,
          reachouts: response.data.reachouts || prev.reachouts,
        }));
        */
        
      } catch (error) {
        console.error("Error fetching mentor profile:", error);
      }
    };

    fetchMentorProfile();
  }, []);

  // Calculate profile completion percentage based on filled fields
  const calculateProfileCompletion = () => {
    const totalFields = 7; // Adjust based on your requirements
    let filledFields = 0;
    
    if (userData.name) filledFields++;
    if (userData.email) filledFields++;
    if (userData.profile_picture) filledFields++;
    if (userData.current_role?.title) filledFields++;
    if (userData.current_role?.company) filledFields++;
    if (userData.years_of_experience) filledFields++;
    if (userData.expertise?.technical_skills?.length > 0 || 
        userData.expertise?.non_technical_skills?.length > 0) filledFields++;
    
    return Math.round((filledFields / totalFields) * 100);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Left Section - Scrollable Profile (30%) */}
      <div className="w-full md:w-3/10 bg-white shadow-lg p-6">
        <div className="relative mb-6">
          <img
            src={userData.profile_picture}
            alt="Profile"
            className="w-24 h-24 rounded-full mx-auto border-4 border-blue-50 object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://via.placeholder.com/150";
            }}
          />
          <button className="absolute bottom-0 right-1/2 translate-x-10 bg-blue-600 text-white rounded-full p-2 shadow-md hover:bg-blue-700 transition-colors">
            <Edit size={16} />
          </button>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-1 text-center">{userData.name}</h2>
        <p className="text-gray-500 mb-2 text-center">{userData.email}</p>
        
        {/* Bio */}
        <div className="bg-blue-50 p-3 rounded-lg mb-4">
          <p className="text-sm text-gray-700 italic">{userData.bio}</p>
        </div>
        
        {/* Current Role */}
        {(userData.current_role?.title || userData.current_role?.company) && (
          <div className="flex items-center gap-2 mb-4 text-gray-600">
            <Briefcase size={16} />
            <span>
              {userData.current_role?.title} 
              {userData.current_role?.title && userData.current_role?.company && " at "}
              {userData.current_role?.company}
            </span>
          </div>
        )}
        
        {/* Experience */}
        <div className="flex items-center gap-2 mb-4 text-gray-600">
          <BookOpen size={16} />
          <span>{userData.years_of_experience} years of experience</span>
        </div>
        
        {/* Rating */}
        <div className="flex items-center gap-2 mb-6">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              size={18} 
              fill={i < Math.floor(userData.rating) ? "#FBBF24" : "none"} 
              color={i < Math.floor(userData.rating) ? "#FBBF24" : "#D1D5DB"}
            />
          ))}
          <span className="text-gray-700 font-medium ml-1">{userData.rating}</span>
        </div>
        
        {/* Stats */}
        <div className="w-full grid grid-cols-2 gap-3 text-center mb-6">
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xl font-bold text-blue-700">{dashboardData.stats.studentsReached}</p>
            <p className="text-xs text-gray-500">Students Reached</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xl font-bold text-blue-700">{dashboardData.stats.activeProjects}</p>
            <p className="text-xs text-gray-500">Active Projects</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xl font-bold text-blue-700">{dashboardData.stats.mentorshipHours}</p>
            <p className="text-xs text-gray-500">Hours Mentored</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xl font-bold text-blue-700">{dashboardData.stats.completedMentorships}</p>
            <p className="text-xs text-gray-500">Completed</p>
          </div>
        </div>
        
        {/* Profile Completion */}
        <div className="w-full mb-6">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Profile Completion</span>
            <span className="font-medium">{calculateProfileCompletion()}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full" 
              style={{ width: `${calculateProfileCompletion()}%` }}
            ></div>
          </div>
        </div>
        
        {/* Technical Skills */}
        <div className="w-full mb-4">
          <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <Cpu size={16} />
            Technical Skills
          </h3>
          <div className="flex flex-wrap gap-1">
            {userData.expertise?.technical_skills?.map((skill, index) => (
              <span 
                key={index} 
                className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs mb-1"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
        
        {/* Non-Technical Skills */}
        <div className="w-full mb-6">
          <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <Users size={16} />
            Soft Skills
          </h3>
          <div className="flex flex-wrap gap-1">
            {userData.expertise?.non_technical_skills?.map((skill, index) => (
              <span 
                key={index} 
                className="bg-green-50 text-green-700 px-2 py-1 rounded-full text-xs mb-1"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
        
        {/* Update Profile Button */}
        <button 
          className="bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 w-full font-medium"
          onClick={() => navigate('/mentor/profile')}
        >
          Update Profile
        </button>
      </div>
      
      {/* Right Section - Content Area (70%) */}
      <div className="w-full md:w-7/10 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Mentor Dashboard</h2>
          <div className="flex items-center gap-4">
            <button className="relative p-2">
              <Bell size={20} className="text-gray-600" />
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                {dashboardData.applications.length + dashboardData.reachouts.length}
              </span>
            </button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors">
              <Clock size={16} />
              Set Availability
            </button>
          </div>
        </div>
        
        {/* Upcoming Sessions Preview - Top section */}
        <div className="mb-6 p-6 bg-white rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">Upcoming Mentorship Sessions</h3>
            <button className="text-blue-600 text-sm font-medium">View Calendar</button>
          </div>
          
          {dashboardData.upcomingSessions && dashboardData.upcomingSessions.length > 0 ? (
            <div className="space-y-4">
              {dashboardData.upcomingSessions.map(session => (
                <div key={session.id} className="flex items-center justify-between border-b pb-3">
                  <div>
                    <p className="font-medium">{session.name}</p>
                    <div className="flex items-center gap-4">
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Calendar size={14} /> {session.date}
                      </p>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Clock size={14} /> {session.duration}
                      </p>
                    </div>
                  </div>
                  <button className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-sm">
                    Join
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-20 bg-gray-50 rounded-lg text-gray-500">
              No upcoming sessions scheduled
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Mentorship Applications */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <CheckCircle size={20} className="text-green-600" />
                Mentorship Applications
              </h3>
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                {dashboardData.applications.length} New
              </span>
            </div>
            <div className="space-y-4">
              {dashboardData.applications.map(app => (
                <div key={app.id} className="flex items-center justify-between border-b pb-3">
                  <div>
                    <p className="font-medium">{app.name}</p>
                    <p className="text-sm text-gray-500">{app.project}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{app.date}</span>
                    <button className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-sm">
                      Review
                    </button>
                  </div>
                </div>
              ))}
              {dashboardData.applications.length === 0 && (
                <div className="text-center text-gray-500 py-4">
                  No mentorship applications yet
                </div>
              )}
            </div>
            <button className="text-blue-600 text-sm font-medium mt-4 hover:text-blue-800">
              View All Applications
            </button>
          </div>
          
          {/* Students Reaching Out */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <MessageCircle size={20} className="text-blue-600" />
                Students Reaching Out
              </h3>
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                {dashboardData.reachouts.length} New
              </span>
            </div>
            <div className="space-y-4">
              {dashboardData.reachouts.map(student => (
                <div key={student.id} className="flex items-center justify-between border-b pb-3">
                  <div>
                    <p className="font-medium">{student.name}</p>
                    <p className="text-sm text-gray-500">{student.interest} • {student.institution}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-sm">
                      Decline
                    </button>
                    <button className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm">
                      Connect
                    </button>
                  </div>
                </div>
              ))}
              {dashboardData.reachouts.length === 0 && (
                <div className="text-center text-gray-500 py-4">
                  No student reach-outs yet
                </div>
              )}
            </div>
            <button className="text-blue-600 text-sm font-medium mt-4 hover:text-blue-800">
              Find More Students
            </button>
          </div>
          
          {/* Upcoming Hackathons */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Award size={20} className="text-purple-600" />
                Upcoming Hackathons
              </h3>
              <button className="text-sm text-purple-600 font-medium">Add to Calendar</button>
            </div>
            <div className="space-y-4">
              {dashboardData.upcomingHackathons.map(hackathon => (
                <div key={hackathon.id} className="flex items-center justify-between border-b pb-3">
                  <div>
                    <p className="font-medium">{hackathon.name}</p>
                    <div className="flex items-center gap-4">
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Calendar size={14} /> {hackathon.date}
                      </p>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Users size={14} /> {hackathon.participants} Participants
                      </p>
                    </div>
                  </div>
                  <button className="bg-purple-100 text-purple-700 px-3 py-1 rounded-lg text-sm">
                    Details
                  </button>
                </div>
              ))}
              {dashboardData.upcomingHackathons.length === 0 && (
                <div className="text-center text-gray-500 py-4">
                  No upcoming hackathons
                </div>
              )}
            </div>
            <button className="text-purple-600 text-sm font-medium mt-4 hover:text-purple-800">
              Browse All Events
            </button>
          </div>
          
          {/* Quick Access */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="font-bold text-lg mb-4">Quick Access</h3>
            <div className="grid grid-cols-2 gap-4">
              <button className="flex flex-col items-center justify-center bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors">
                <Users size={24} className="text-blue-600 mb-2" />
                <span className="text-sm font-medium">My Students</span>
              </button>
              <button className="flex flex-col items-center justify-center bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors">
                <Calendar size={24} className="text-green-600 mb-2" />
                <span className="text-sm font-medium">Schedule</span>
              </button>
              <button className="flex flex-col items-center justify-center bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors">
                <MessageCircle size={24} className="text-amber-600 mb-2" />
                <span className="text-sm font-medium">Messages</span>
              </button>
              <button className="flex flex-col items-center justify-center bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors">
                <Award size={24} className="text-purple-600 mb-2" />
                <span className="text-sm font-medium">Resources</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorHero;