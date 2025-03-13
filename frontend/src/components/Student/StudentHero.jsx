import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebaseConfig';
import axios from 'axios';
import { 
  GraduationCap, BookOpen, Trophy, Calendar, Target, 
  Clock, Code, Users, Zap, Edit, ChevronRight, Bell
} from 'lucide-react';

const StudentHero = () => {
  const [userData, setUserData] = useState({
    name: 'Alex Rodriguez',
    email: 'alex.rodriguez@example.com',
    profile_picture: 'https://randomuser.me/api/portraits/men/32.jpg',
    current_education: {
      institution: 'Stanford University',
      degree: 'Computer Science',
      year: 'Junior'
    },
    learning_interests: ['Machine Learning', 'Web Development', 'Mobile Apps', 'Data Science'],
    skills: ['Python', 'JavaScript', 'React', 'UI/UX Design', 'Git'],
    profileCompletion: 85,
    activities: [
      {
        id: 1,
        type: 'mentorship',
        title: 'AI & Machine Learning Fundamentals',
        mentor: 'Dr. Sarah Johnson',
        progress: 65,
        nextSession: '2025-03-18T15:00:00',
        status: 'active'
      },
      {
        id: 2,
        type: 'project',
        title: 'Image Recognition App',
        teammates: ['Maya Patel', 'James Wilson'],
        deadline: '2025-04-10',
        status: 'in_progress'
      },
      {
        id: 3,
        type: 'hackathon',
        title: 'DataHack 2025',
        date: '2025-04-20',
        location: 'San Francisco',
        status: 'registered'
      },
      {
        id: 4,
        type: 'hackathon',
        title: 'AI Innovation Challenge',
        date: '2025-05-15',
        location: 'Online',
        status: 'open'
      }
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
    const fetchStudentProfile = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user) {
          console.error("User not found in localStorage.");
          return;
        }

        /* Uncomment when API is ready
        const response = await axios.get(`http://localhost:4000/api/student/profile/${user.uid}`);
        
        setUserData(prev => ({
          ...prev,
          ...response.data,
          // Merge activities as needed
        }));
        */
      } catch (error) {
        console.error("Error fetching student profile:", error);
      }
    };

    fetchStudentProfile();
  }, []);

  // Calculate profile completion percentage based on filled fields
  const calculateProfileCompletion = () => {
    const totalFields = 6; // Adjust based on your requirements
    let filledFields = 0;
    
    if (userData.name) filledFields++;
    if (userData.email) filledFields++;
    if (userData.profile_picture) filledFields++;
    if (userData.current_education?.institution || 
        userData.current_education?.degree) filledFields++;
    if (userData.learning_interests?.length > 0) filledFields++;
    if (userData.skills?.length > 0) filledFields++;
    
    return Math.round((filledFields / totalFields) * 100);
  };

  // Format date to more readable format
  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Calculate days remaining for deadlines
  const getDaysRemaining = (dateString) => {
    const today = new Date();
    const deadline = new Date(dateString);
    const diffTime = deadline - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Get appropriate icon for activity type
  const getActivityIcon = (type) => {
    switch(type) {
      case 'mentorship':
        return <GraduationCap size={18} className="text-indigo-600" />;
      case 'project':
        return <Code size={18} className="text-emerald-600" />;
      case 'hackathon':
        return <Zap size={18} className="text-amber-600" />;
      default:
        return <BookOpen size={18} className="text-blue-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Left Section - Scrollable Profile (30%) */}
      <div className="w-full md:w-3/10 bg-white shadow-lg p-6">
        <div className="relative mb-6">
          <img
            src={userData.profile_picture}
            alt="Profile"
            className="w-24 h-24 rounded-full mx-auto border-4 border-indigo-50 object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://via.placeholder.com/150";
            }}
          />
          <button className="absolute bottom-0 right-1/2 translate-x-10 bg-indigo-600 text-white rounded-full p-2 shadow-md hover:bg-indigo-700 transition-colors">
            <Edit size={16} />
          </button>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-1 text-center">{userData.name}</h2>
        <p className="text-gray-500 mb-4 text-center">{userData.email}</p>
        
        {/* Current Education */}
        {(userData.current_education?.institution || userData.current_education?.degree) && (
          <div className="flex items-center gap-2 mb-4 text-gray-600">
            <GraduationCap size={16} />
            <span>
              {userData.current_education?.degree} 
              {userData.current_education?.degree && userData.current_education?.institution && " at "}
              {userData.current_education?.institution}
              {userData.current_education?.year && `, ${userData.current_education?.year}`}
            </span>
          </div>
        )}
        
        {/* Profile Completion */}
        <div className="w-full mb-6">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Profile Completion</span>
            <span className="font-medium">{calculateProfileCompletion()}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-indigo-600 h-2 rounded-full" 
              style={{ width: `${calculateProfileCompletion()}%` }}
            ></div>
          </div>
        </div>
        
        {/* Learning Interests */}
        <div className="w-full bg-indigo-50 p-4 rounded-lg mb-6">
          <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <Target size={16} />
            Learning Interests
          </h3>
          <div className="flex flex-wrap gap-2">
            {userData.learning_interests?.length > 0 ? (
              userData.learning_interests.map((interest, index) => (
                <span 
                  key={index} 
                  className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm"
                >
                  {interest}
                </span>
              ))
            ) : (
              <span className="text-gray-500 text-sm">No learning interests added yet</span>
            )}
          </div>
        </div>
        
        {/* Skills */}
        <div className="w-full mb-6">
          <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <Code size={16} />
            Skills
          </h3>
          <div className="flex flex-wrap gap-2">
            {userData.skills?.length > 0 ? (
              userData.skills.map((skill, index) => (
                <span 
                  key={index} 
                  className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))
            ) : (
              <span className="text-gray-500 text-sm">No skills added yet</span>
            )}
          </div>
        </div>
        
        {/* Learning Statistics */}
        <div className="w-full grid grid-cols-2 gap-3 mb-6">
          <div className="bg-gray-50 p-3 rounded-lg text-center">
            <p className="text-xl font-bold text-indigo-700">3</p>
            <p className="text-xs text-gray-500">Active Projects</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg text-center">
            <p className="text-xl font-bold text-indigo-700">2</p>
            <p className="text-xs text-gray-500">Mentorships</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg text-center">
            <p className="text-xl font-bold text-indigo-700">5</p>
            <p className="text-xs text-gray-500">Certificates</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg text-center">
            <p className="text-xl font-bold text-indigo-700">18</p>
            <p className="text-xs text-gray-500">Skills Gained</p>
          </div>
        </div>
        
        {/* Update Profile Button */}
        <button 
          className="bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors duration-200 w-full font-medium"
          onClick={() => navigate('/student/profile')}
        >
          Update Profile
        </button>
      </div>
      
      {/* Right Section - Content Area (70%) */}
      <div className="w-full md:w-7/10 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Current Activities</h2>
          <div className="flex gap-3">
            <button className="relative p-2 mr-2">
              <Bell size={20} className="text-gray-600" />
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                2
              </span>
            </button>
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors">
              Find Teamates
            </button>
            <button className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg font-medium hover:bg-indigo-200 transition-colors">
              Find Mentors
            </button>
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors">
              Explore Projects
            </button>
          </div>
        </div>
        
        {/* Active Mentorships */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <GraduationCap className="text-indigo-600" />
              Active Mentorships
            </h3>
            <button className="text-indigo-600 text-sm font-medium hover:underline flex items-center">
              View All <ChevronRight size={16} />
            </button>
          </div>
          
          {userData.activities.filter(a => a.type === 'mentorship').map(mentorship => (
            <div key={mentorship.id} className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex justify-between mb-2">
                <h4 className="font-semibold text-gray-800">{mentorship.title}</h4>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Active</span>
              </div>
              <p className="text-gray-600 text-sm mb-3">Mentor: {mentorship.mentor}</p>
              <div className="mb-2">
                <div className="flex justify-between text-xs mb-1">
                  <span>Progress</span>
                  <span>{mentorship.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-indigo-600 h-1.5 rounded-full" 
                    style={{ width: `${mentorship.progress}%` }}
                  ></div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-sm text-indigo-700">
                <Clock size={14} />
                <span>Next session: {formatDate(mentorship.nextSession)}</span>
              </div>
            </div>
          ))}
        </div>
        
        {/* Current Projects */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Code className="text-emerald-600" />
              Current Projects
            </h3>
            <button className="text-emerald-600 text-sm font-medium hover:underline flex items-center">
              View All <ChevronRight size={16} />
            </button>
          </div>
          
          {userData.activities.filter(a => a.type === 'project').map(project => (
            <div key={project.id} className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex justify-between mb-2">
                <h4 className="font-semibold text-gray-800">{project.title}</h4>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">In Progress</span>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <Users size={16} className="text-gray-500" />
                <p className="text-gray-600 text-sm">
                  {project.teammates.join(', ')}
                </p>
              </div>
              <div className="flex items-center gap-1 text-sm text-emerald-700">
                <Calendar size={14} />
                <span>Deadline: {formatDate(project.deadline)} ({getDaysRemaining(project.deadline)} days remaining)</span>
              </div>
            </div>
          ))}
        </div>
        
        {/* Upcoming Events */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Trophy className="text-amber-600" />
              Upcoming Events
            </h3>
            <button className="text-amber-600 text-sm font-medium hover:underline flex items-center">
              View All <ChevronRight size={16} />
            </button>
          </div>
          
          {userData.activities.filter(a => a.type === 'hackathon').map(event => (
            <div key={event.id} className="bg-gray-50 rounded-lg p-4 mb-4 last:mb-0">
              <div className="flex justify-between mb-2">
                <h4 className="font-semibold text-gray-800">{event.title}</h4>
                <span className={`px-2 py-1 rounded text-xs ${
                  event.status === 'registered' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {event.status === 'registered' ? 'Registered' : 'Open'}
                </span>
              </div>
              <div className="flex items-center gap-4 mb-2">
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Calendar size={14} />
                  <span>{formatDate(event.date)}</span>
                </div>
                {event.location && (
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Users size={14} />
                    <span>{event.location}</span>
                  </div>
                )}
              </div>
              
              <button className={`text-sm px-3 py-1 rounded-lg ${
                event.status === 'registered'
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-indigo-600 text-white'
              }`}>
                {event.status === 'registered' ? 'View Details' : 'Register'}
              </button>
            </div>
          ))}
          
          {/* Recommended Event */}
          <div className="mt-4 border-t pt-4">
            <h4 className="font-medium text-gray-700 mb-3">Recommended for You</h4>
            <div className="bg-amber-50 rounded-lg p-4">
              <div className="flex justify-between mb-2">
                <h4 className="font-semibold text-gray-800">Frontend Masters Hackathon</h4>
                <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs">
                  New
                </span>
              </div>
              <div className="flex items-center gap-4 mb-3">
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Calendar size={14} />
                  <span>May 28 - 30</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Users size={14} />
                  <span>Online</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Build innovative web applications with latest frontend technologies
              </p>
              <button className="bg-indigo-600 text-white text-sm px-3 py-1 rounded-lg">
                Learn More
              </button>
            </div>
          </div>
        </div>
        
        {/* Recommended Learning Paths */}
        <div className="bg-white rounded-xl shadow-md p-6 mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <BookOpen className="text-indigo-600" />
              Recommended Learning Paths
            </h3>
            <button className="text-indigo-600 text-sm font-medium hover:underline">
              View All
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white">
                <Code size={32} />
              </div>
              <div className="p-4">
                <h4 className="font-medium text-gray-800 mb-1">Full-Stack Web Development</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Master modern web development with React, Node.js and MongoDB
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">82 modules • 4 projects</span>
                  <button className="text-indigo-600 text-sm font-medium">Explore</button>
                </div>
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="h-32 bg-gradient-to-r from-green-600 to-teal-600 flex items-center justify-center text-white">
                <Zap size={32} />
              </div>
              <div className="p-4">
                <h4 className="font-medium text-gray-800 mb-1">Machine Learning Fundamentals</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Learn core ML concepts and practical applications with Python
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">64 modules • 3 projects</span>
                  <button className="text-indigo-600 text-sm font-medium">Explore</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentHero;