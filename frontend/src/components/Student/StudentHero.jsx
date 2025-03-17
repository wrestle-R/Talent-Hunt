import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebaseConfig';
import axios from 'axios';
import StudentProfile from './StudentHeroProfile';
import StudentDashboard from './StudentDashboard';

const StudentHero = () => {
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    profile_picture: '',
    education: { institution: '', degree: '', graduation_year: '' },
    interests: [],
    skills: [],
    hackathon_prev_experiences: 0,
    projects: [],
    activities: [],
    rating: 0
  });
  
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

  // Fetch student profile data
  const fetchStudentProfile = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) {
        console.error("User not found in localStorage.");
        return;
      }

      try {
        const response = await axios.get(`http://localhost:4000/api/student/profile/${user.uid}`);
        
        if (response.data) {
          // Map backend data to our component structure
          setUserData(prev => ({
            ...prev,
            name: response.data.name || '',
            email: response.data.email || '',
            profile_picture: response.data.profile_picture || '',
            rating: response.data.rating || 0,
            education: response.data.education || { institution: '', degree: '', graduation_year: '' },
            interests: response.data.interests || [],
            skills: response.data.skills || [],
            hackathon_prev_experiences: response.data.hackathon_prev_experiences || 0,
            projects: response.data.projects || [],
            activities: response.data.activities || [],
            location: response.data.location || { city: '', country: '' },
            social_links: response.data.social_links || { github: '', linkedin: '', portfolio: '' },
            goals: response.data.goals || []
          }));
        }
        
        // Fetch profile completion from backend
        fetchProfileCompletion(user.uid);
        
      } catch (error) {
        console.error("Error fetching profile:", error);
        // Reset to empty data on error rather than keeping mock data
        setUserData({
          name: '',
          email: '',
          profile_picture: '',
          education: { institution: '', degree: '', graduation_year: '' },
          interests: [],
          skills: [],
          projects: [],
          hackathon_prev_experiences: 0,
          activities: []
        });
      }
    } catch (error) {
      console.error("Error in profile fetch:", error);
    }
  };

  // Fetch profile completion data from backend
  const fetchProfileCompletion = async (uid) => {
    try {
      const response = await axios.get(`http://localhost:4000/api/student/profile-completion/${uid}`);
      
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

  useEffect(() => {
    fetchStudentProfile();
  }, []);

  // Get appropriate button text based on completion
  const getProfileButtonText = () => {
    return profileCompletion === 100 ? "View Profile" : "Complete Profile";
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
  
  // Add this function inside your StudentHero component
  const refreshUserData = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) {
        console.error("User not found in localStorage.");
        return;
      }

      const response = await axios.get(`http://localhost:4000/api/student/profile/${user.uid}`);
      
      if (response.data) {
        // Update userData with fresh data
        setUserData(prev => ({
          ...prev,
          name: response.data.name || '',
          email: response.data.email || '',
          profile_picture: response.data.profile_picture || '',
          rating: response.data.rating || 0,
          education: response.data.education || { institution: '', degree: '', graduation_year: '' },
          interests: response.data.interests || [],
          skills: response.data.skills || [],
          hackathon_prev_experiences: response.data.hackathon_prev_experiences || 0,
          projects: response.data.projects || [],
          activities: response.data.activities || [],
          location: response.data.location || { city: '', country: '' },
          social_links: response.data.social_links || { github: '', linkedin: '', portfolio: '' },
          goals: response.data.goals || []
        }));
        
        // Also refresh the profile completion data
        fetchProfileCompletion(user.uid);
      }
    } catch (error) {
      console.error("Error refreshing user data:", error);
    }
  };

  // Define the fixed width for the profile section
  const profileWidth = "400px";

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Section - Fixed Profile */}
      <div className="fixed w-full h-screen" style={{ width: profileWidth }}>
        <StudentProfile 
          userData={userData}
          profileCompletion={profileCompletion}
          completionDetails={completionDetails}
          getProfileButtonText={getProfileButtonText}
          navigate={navigate}
          refreshUserData={refreshUserData}
        />
      </div>
      
      {/* Right Section - Dashboard with left margin */}
      <div className="flex-1" style={{ marginLeft: profileWidth }}>
        <StudentDashboard 
          userData={userData}
          formatDate={formatDate}
          getDaysRemaining={getDaysRemaining}
          profileCompletion={profileCompletion}
        />
      </div>
    </div>
  );
};

export default StudentHero;