import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebaseConfig';

const Navbar = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsLoggedIn(!!user);
      // Determine user role from localStorage or other source
      if (user) {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            // You might want to store role in localStorage when user logs in
            const role = localStorage.getItem('userRole') || 'student';
            setUserRole(role);
          } catch (error) {
            console.error("Error parsing stored user:", error);
          }
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    auth.signOut().then(() => {
      localStorage.removeItem("user");
      localStorage.removeItem("userRole");
      navigate('/register');
    }).catch((error) => {
      console.error("Logout Error:", error);
    });
  };

  return (
    <nav className="bg-[#2F4156] text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">TalentHunt</Link>
        <div className="flex space-x-4">
          {isLoggedIn ? (
            <>
              <Link to={`/${userRole}/hero`} className="hover:text-[#C8D9E6]">Profile</Link>
              <button onClick={handleLogout} className="hover:text-[#C8D9E6]">Logout</button>
            </>
          ) : (
            <>
              <Link to="/register" className="hover:text-[#C8D9E6]">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;