import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebaseConfig';
import axios from 'axios';
import MentorHeroProfile from './MentorHeroProfile';
import MentorDashboard from './MentorDashboard';
import { toast } from 'react-hot-toast';
import StudentPlaceholder from '../../public/student_placeholder.png';
import MentorPlaceholder from '../../public/mentor_placeholder.png';

const MentorHero = () => {
  // Initialize userData state with all expected properties
  const [userData, setUserData] = useState({
    _id: '',
    name: '',
    email: '',
    profile_picture: '',
    phone: '',
    current_role: {
      title: '',
      company: ''
    },
    years_of_experience: 0,
    expertise: {
      technical_skills: [],
      non_technical_skills: []
    },
    industries_worked_in: [],
    mentorship_focus_areas: [],
    mentorship_availability: {
      hours_per_week: 2,
      mentorship_type: []
    },
    hackathon_mentorship_experiences: [],
    social_links: {
      linkedin: '',
      github: '',
      personal_website: ''
    },
    rating: 0,
    applications: [],
    mentees: [],
    bio: '',
    isRejected: false,
    rejectionReason: '',
  });
  
  // Dashboard data with all expected properties
  const [dashboardData, setDashboardData] = useState({
    stats: {
      studentsReached: 0,
      activeProjects: 0,
      mentorshipHours: 0,
      completedMentorships: 0
    },
    applications: [],
    mentorships: [],
    reachouts: [],
    conversations: [],
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
        console.log("Raw mentor data:", response.data);
        
        // Extract all relevant fields from the response
        const {
          _id,
          name,
          email,
          profile_picture,
          phone,
          current_role,
          years_of_experience,
          expertise,
          industries_worked_in,
          mentorship_focus_areas,
          mentorship_availability,
          hackathon_mentorship_experiences,
          social_links,
          rating,
          applications,
          mentees,
          bio,
          isRejected,
          rejectionReason
        } = response.data;
        
        // Update user data with all available fields
        setUserData({
          _id,
          name: name || '',
          email: email || '',
          profile_picture: profile_picture || '',
          phone: phone || '',
          current_role: current_role || { title: '', company: '' },
          years_of_experience: years_of_experience || 0,
          expertise: expertise || { technical_skills: [], non_technical_skills: [] },
          industries_worked_in: industries_worked_in || [],
          mentorship_focus_areas: mentorship_focus_areas || [],
          mentorship_availability: mentorship_availability || { 
            hours_per_week: 2, 
            mentorship_type: [] 
          },
          hackathon_mentorship_experiences: hackathon_mentorship_experiences || [],
          social_links: social_links || { linkedin: '', github: '', personal_website: '' },
          rating: rating || 0,
          applications: applications || [],
          mentees: mentees || [],
          bio: bio || '',
          isRejected: isRejected || false,
          rejectionReason: rejectionReason || '',
        });
        
        // Fetch dashboard data after getting the mentor profile
        await fetchDashboardData(_id);
        
        // Fetch profile completion
        await fetchProfileCompletion(uid);
        
        // Save user to localStorage for easy access
        localStorage.setItem("user", JSON.stringify({
          _id,
          uid,
          email,
          name,
          userType: 'Mentor'
        }));
      } else {
        toast.error("Failed to load mentor profile");
      }
    } catch (error) {
      console.error("Error fetching mentor profile:", error);
      toast.error("Error loading your profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  // Separate function to fetch dashboard data using mentor ID
  const fetchDashboardData = async (mentorId) => {
    if (!mentorId) return;
    
    try {
      // Fetch team applications
      const applicationsResponse = await axios.get(`http://localhost:4000/api/mentor/${mentorId}/applications`);
      
      // Fetch active mentorships
      const mentorshipsResponse = await axios.get(`http://localhost:4000/api/mentor/${mentorId}/mentorships`);
      
      // Fetch recent conversations
      const conversationsResponse = await axios.get(`http://localhost:4000/api/mentor/${mentorId}/conversations`);
      
      // Fetch upcoming hackathons
      const hackathonsResponse = await axios.get(`http://localhost:4000/api/hackathons/upcoming`);
      
      // Calculate basic stats
      const stats = {
        studentsReached: mentorshipsResponse.data ? 
          mentorshipsResponse.data.reduce((total, team) => total + team.members.length, 0) : 0,
        activeProjects: mentorshipsResponse.data ? 
          mentorshipsResponse.data.reduce((total, team) => total + (team.projectsCount || 0), 0) : 0,
        mentorshipHours: mentorshipsResponse.data ? mentorshipsResponse.data.length * 5 : 0, // Estimate 5 hours per team
        completedMentorships: 0 // This would need a separate endpoint to track completed mentorships
      };
      
      // Update dashboard data state
      setDashboardData({
        stats,
        applications: applicationsResponse.data || [],
        mentorships: mentorshipsResponse.data || [],
        conversations: conversationsResponse.data || [],
        reachouts: [], // This would need a separate API endpoint
        upcomingHackathons: hackathonsResponse.data || [],
        upcomingSessions: [] // This would need a separate API endpoint
      });
      
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
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
          fieldStatus: response.data.fieldStatus || [],
          incompleteFields: response.data.incompleteFields || []
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
      <div className="min-h-screen flex items-center justify-center bg-[#121212]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#E8C848] border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your mentor dashboard...</p>
        </div>
      </div>
    );
  }

  // Define the fixed width for the profile section
  const profileWidth = "400px";

  return (
    <div className="min-h-screen bg-[#121212] flex">
      {/* Left Section - Fixed Profile */}
      <div className="fixed w-full h-screen border-r border-gray-800" style={{ width: profileWidth }}>
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
      <div 
        className="flex-1 bg-[#121212]" 
        style={{ 
          marginLeft: profileWidth,
          backgroundImage: `
            radial-gradient(circle at 50% 50%, rgba(232, 200, 72, 0.03), transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(232, 200, 72, 0.02), transparent 30%)
          `
        }}
      >
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