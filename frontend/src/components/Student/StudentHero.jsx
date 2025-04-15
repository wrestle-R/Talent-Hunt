import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebaseConfig';
import { useUser } from '../../../context/UserContext';
import StudentProfile from './StudentHeroProfile';
import StudentDashboard from './StudentDashboard';
import axios from 'axios';

const StudentHero = () => {
  const { 
    userData, 
    profileCompletion, 
    completionDetails, 
    refreshUserData, 
    getProfileButtonText,
    formatDate,
    getDaysRemaining
  } = useUser();
  
  const [mentorConversations, setMentorConversations] = useState([]);
  const [mentorConversationsLoading, setMentorConversationsLoading] = useState(true);
  const [mentorConversationsError, setMentorConversationsError] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        navigate('/register');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Fetch mentor conversations
  const fetchMentorConversations = async () => {
    if (!userData || !userData._id) return;
    
    try {
      setMentorConversationsLoading(true);
      const response = await axios.get(`http://localhost:4000/api/student/mentor-conversations/${userData._id}`);
      
      if (Array.isArray(response.data)) {
        setMentorConversations(response.data);
      } else {
        console.warn("Unexpected mentor conversations format:", response.data);
        setMentorConversations([]);
      }
      setMentorConversationsError(null);
    } catch (error) {
      console.error("Error fetching mentor conversations:", error);
      setMentorConversationsError(
        error.response?.data?.message || 
        error.response?.data?.error || 
        error.message || 
        "Failed to load mentor conversations"
      );
      setMentorConversations([]);
    } finally {
      setMentorConversationsLoading(false);
    }
  };

  // Fetch data when userData changes
  useEffect(() => {
    if (userData && userData._id) {
      fetchMentorConversations();
      
      // Set up polling every 5 minutes (300000 ms)
      const interval = setInterval(fetchMentorConversations, 300000);
      
      return () => clearInterval(interval);
    }
  }, [userData]);

  // Define the fixed width for the profile section
  const profileWidth = "400px";

  return (
    <div className="min-h-screen bg-[#121212] flex">
      {/* Left Section - Fixed Profile */}
      <div className="fixed w-full h-screen border-r border-gray-800" style={{ width: profileWidth }}>
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
      <div className="flex-1 bg-[#121212]" style={{ marginLeft: profileWidth }}>
        <StudentDashboard 
          userData={userData}
          formatDate={formatDate}
          getDaysRemaining={getDaysRemaining}
          mentorConversations={mentorConversations}
          mentorConversationsLoading={mentorConversationsLoading}
          mentorConversationsError={mentorConversationsError}
          refreshMentorConversations={fetchMentorConversations}
        />
      </div>
    </div>
  );
};

export default StudentHero;