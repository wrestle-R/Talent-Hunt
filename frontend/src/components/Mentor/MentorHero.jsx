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
    bio: ''
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
    incompleteFields: []
  });
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // Store user in localStorage for API calls
        localStorage.setItem("user", JSON.stringify({
          uid: user.uid,
          email: user.email
        }));
        
        // Set email from auth
        setUserData(prevData => ({
          ...prevData,
          email: user.email || prevData.email
        }));
        
        // Fetch user profile data
        fetchMentorProfile(user.uid);
        // Fetch profile completion data
        fetchProfileCompletion(user.uid);
      } else {
        // Redirect to register if not logged in
        navigate('/register');
      }
      setLoading(false);
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
      }
    } catch (error) {
      console.error("Error fetching mentor profile:", error);
      
      // If in development mode, you might want to use sample data for testing
      if (process.env.NODE_ENV === 'development') {
        console.log('Using sample data for development');
        useSampleData();
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch profile completion from backend API
  const fetchProfileCompletion = async (uid) => {
    try {
      const response = await axios.get(`http://localhost:4000/api/mentor/profile-completion/${uid}`);
      
      if (response.data) {
        setProfileCompletion(response.data.completionPercentage);
        setCompletionDetails({
          completedFields: response.data.completedFields,
          totalFields: response.data.totalFields,
          incompleteFields: response.data.incompleteFields
        });
      }
    } catch (error) {
      console.error("Error fetching profile completion:", error);
      // Fall back to 0% if there's an error
      setProfileCompletion(0);
    }
  };

  // Get profile button text based on completion
  const getProfileButtonText = () => {
    return profileCompletion === 100 ? "View Profile" : "Complete Profile";
  };

  const refreshUserData = async () => {
    const user = auth.currentUser;
    if (user) {
      await fetchMentorProfile(user.uid);
      await fetchProfileCompletion(user.uid);
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

  // Update the return statement to include fixed height and sticky positioning
return (
  <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
    {/* Left Section - Profile (30%) with fixed height and sticky positioning */}
    <div className="w-full md:w-3/10 overflow-hidden bg-white shadow-lg md:h-screen md:sticky md:top-0">
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
    
    {/* Right Section - Dashboard (70%) */}
    <div className="w-full md:w-7/10">
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
      {/* Remove the duplicate MentorDashboard components */}
    </div>
  </div>
);
};

export default MentorHero;