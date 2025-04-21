import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebaseConfig';
import axios from 'axios';
import AdminDashboard from './AdminDashboard';

const API_BASE_URL = "http://localhost:4000"; // Use consistent base URL

const AdminHero = () => {
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    organization: '',
    role: 'admin'
  });
  
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // Set email from Firebase auth
        setUserData(prev => ({...prev, email: user.email || prev.email}));
        fetchAdminProfile(user.uid);
      } else {
        setLoading(false);
        navigate('/register');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const fetchAdminProfile = async (uid) => {
    try {
      setLoading(true);
      
      // Use the consistent API_BASE_URL instead of environment variable
      const response = await axios.get(`${API_BASE_URL}/api/admin/profile/${uid}`);
      
      if (response.data) {
        // Update user data from API response
        setUserData(prev => ({
          ...prev,
          ...response.data,
        }));
      }
    } catch (error) {
      console.error("Error fetching admin profile:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#111111]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#E8C848] border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-300 font-inter">Loading your admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111111]">
      <AdminDashboard userData={userData} />
    </div>
  );
};

export default AdminHero;