import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebaseConfig';
import axios from 'axios';
import MentorHeroProfile from './MentorHeroProfile';
import MentorDashboard from './MentorDashboard';

const MentorHero = () => {
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    profile_picture: '',
    current_role: {
      title: '',
      company: ''
    },
    years_of_experience: 0,
    expertise: {
      technical_skills: [],
      non_technical_skills: []
    },
    rating: 0,
    bio: '',
    isRejected : false,
    rejectedReason: '',
  });
  
  // Dashboard data with minimal default values
  const [dashboardData, setDashboardData] = useState({
    stats: {
      studentsReached: 0,
      activeProjects: 0,
      mentorshipHours: 0,
      completedMentorships: 0
    },
    applications: [],
    reachouts: [],
    upcomingHackathons: [],
    upcomingSessions: []
  });
  
  const [loading, setLoading] = useState(true);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [completionDetails, setCompletionDetails] = useState({
    completedFields: 0,
    totalFields: 0,
    fieldStatus: [],
    incompleteFields: []
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // Set email from Firebase auth
        setUserData(prev => ({...prev, email: user.email || prev.email}));
        fetchMentorProfile(user.uid);
      } else {
        setLoading(false);
        navigate('/register');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const fetchMentorProfile = async (uid) => {
    try {
      setLoading(true);
      
      // Fetch profile data from API
      const response = await axios.get(`http://localhost:4000/api/mentor/profile/${uid}`);
      
      if (response.data) {
        // Update user data from API response
        setUserData(prev => ({
          ...prev,
          ...response.data,
        }));
        
        // Update dashboard data from API response
        if (response.data.dashboardData) {
          setDashboardData(prev => ({
            ...prev,
            ...response.data.dashboardData
          }));
        }
        
        // Fetch profile completion
        fetchProfileCompletion(uid);
      }
    } catch (error) {
      console.error("Error fetching mentor profile:", error);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch profile completion data from backend
  const fetchProfileCompletion = async (uid) => {
    try {
      const response = await axios.get(`http://localhost:4000/api/mentor/profile-completion/${uid}`);
      
      if (response.data) {
        setProfileCompletion(response.data.completionPercentage);
        setCompletionDetails({
          completedFields: response.data.completedFields,
          totalFields: response.data.totalFields,
          fieldStatus: response.data.fieldStatus,
          incompleteFields: response.data.incompleteFields
        });
      }
    } catch (error) {
      console.error("Error fetching profile completion:", error);
    }
  };
  
  // Get appropriate button text based on completion
  const getProfileButtonText = () => {
    return profileCompletion === 100 ? "View Profile" : "Complete Profile";
  };
  
  // Function to refresh user data after updates
  const refreshUserData = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.uid) {
      fetchMentorProfile(user.uid);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your mentor dashboard...</p>
        </div>
      </div>
    );
  }

  // Define the fixed width for the profile section
  const profileWidth = "400px";

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Section - Fixed Profile */}
      <div className="fixed w-full h-screen" style={{ width: profileWidth }}>
        <MentorHeroProfile 
          userData={userData}
          dashboardData={dashboardData}
          profileCompletion={profileCompletion}
          completionDetails={completionDetails}
          getProfileButtonText={getProfileButtonText}
          navigate={navigate}
          refreshUserData={refreshUserData}
        />
      </div>
      
      {/* Right Section - Dashboard with left margin */}
      <div className="flex-1" style={{ marginLeft: profileWidth }}>
        <MentorDashboard 
          dashboardData={dashboardData}
          userData={userData}
          refreshUserData={refreshUserData}
        />
        <MentorDashboard 
          dashboardData={dashboardData}
          userData={userData}
          refreshUserData={refreshUserData}
        />
      </div>
    </div>
  );
};

export default MentorHero;