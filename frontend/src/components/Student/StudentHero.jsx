import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebaseConfig';
import { useUser } from '../../../context/UserContext';
import StudentProfile from './StudentHeroProfile';
import StudentDashboard from './StudentDashboard';

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
  
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        navigate('/register');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

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
        />
      </div>
    </div>
  );
};

export default StudentHero;