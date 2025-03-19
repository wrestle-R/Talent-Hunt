import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Create the context
const UserContext = createContext();

// Create the provider component
export const UserProvider = ({ children }) => {
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
    rating: 0,
    location: { city: '', country: '' },
    social_links: { github: '', linkedin: '', portfolio: '' },
    goals: []
  });
  
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [completionDetails, setCompletionDetails] = useState({
    completedFields: 0,
    totalFields: 0,
    fieldStatus: [],
    incompleteFields: []
  });
  
  const [isLoading, setIsLoading] = useState(true);

  // Fetch student profile data
  const fetchStudentProfile = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) {
        console.error("User not found in localStorage.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get(`http://localhost:4000/api/student/profile/${user.uid}`);
        
        if (response.data) {
          // Map backend data to our component structure
          setUserData(prev => ({
            ...prev,
            ...response.data,
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
        // Reset to empty data on error
        setUserData({
          name: '',
          email: '',
          profile_picture: '',
          education: { institution: '', degree: '', graduation_year: '' },
          interests: [],
          skills: [],
          projects: [],
          hackathon_prev_experiences: 0,
          activities: [],
          location: { city: '', country: '' },
          social_links: { github: '', linkedin: '', portfolio: '' },
          goals: []
        });
      } finally {
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error in profile fetch:", error);
      setIsLoading(false);
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

  // Function to refresh user data that can be called from any component
  const refreshUserData = async () => {
    setIsLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) {
        console.error("User not found in localStorage.");
        setIsLoading(false);
        return;
      }

      const response = await axios.get(`http://localhost:4000/api/student/profile/${user.uid}`);
      
      if (response.data) {
        // Update userData with fresh data
        setUserData(prev => ({
          ...prev,
          ...response.data,
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
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch user data on mount
  useEffect(() => {
    fetchStudentProfile();
  }, []);

  // Helper functions
  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const getDaysRemaining = (dateString) => {
    const today = new Date();
    const deadline = new Date(dateString);
    const diffTime = deadline - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Get appropriate button text based on completion
  const getProfileButtonText = () => {
    return profileCompletion === 100 ? "View Profile" : "Complete Profile";
  };

  return (
    <UserContext.Provider 
      value={{
        userData,
        profileCompletion,
        completionDetails,
        isLoading,
        refreshUserData,
        formatDate,
        getDaysRemaining,
        getProfileButtonText
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

// Create a custom hook for using the context
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};