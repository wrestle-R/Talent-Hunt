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

  useEffect(() => {
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
              activities: response.data.activities || []
            }));
          }
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

    fetchStudentProfile();
  }, []);

  // Add this function inside your StudentHero component


  // Calculate profile completion percentage based on filled fields
  const calculateProfileCompletion = () => {
    const totalFields = 6; // Total number of important fields
    let filledFields = 0;
    
    // Check if each field is properly filled
    if (userData.name && userData.name.trim() !== '') filledFields++;
    if (userData.email && userData.email.trim() !== '') filledFields++;
    if (userData.profile_picture && userData.profile_picture.trim() !== '') filledFields++;
    
    // Check education - need both institution and degree
    if (userData.education?.institution && userData.education?.degree && 
        userData.education.institution.trim() !== '' && 
        userData.education.degree.trim() !== '') {
      filledFields++;
    }
    
    // Check interests - need at least one
    if (userData.interests && Array.isArray(userData.interests) && userData.interests.length > 0) {
      filledFields++;
    }
    
    // Check skills - need at least one
    if (userData.skills && Array.isArray(userData.skills) && userData.skills.length > 0) {
      filledFields++;
    }
    
    // Calculate percentage and return
    const percentage = (filledFields / totalFields) * 100;
    return Math.round(percentage);
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
        activities: response.data.activities || []
      }));
    }
  } catch (error) {
    console.error("Error refreshing user data:", error);
  }
};

// Then pass this function to StudentProfile
return (
  <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
    {/* Left Section - Profile */}
    <StudentProfile 
      userData={userData}
      calculateProfileCompletion={calculateProfileCompletion}
      navigate={navigate}
      refreshUserData={refreshUserData}  // Add this line
    />
    
    {/* Right Section - Dashboard */}
    <StudentDashboard 
      userData={userData}
      formatDate={formatDate}
      getDaysRemaining={getDaysRemaining}
    />
  </div>
);


};

export default StudentHero;