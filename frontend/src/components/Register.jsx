import React, { useState } from 'react';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { auth, provider, signInWithPopup } from "../firebaseConfig";
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState(''); // No default role
  const navigate = useNavigate();

  // Helper function to clear auth state
  const clearAuthState = async () => {
    try {
      // Sign out from Firebase
      await auth.signOut();
      
      // Clear localStorage items
      localStorage.removeItem("user");
      localStorage.removeItem("userRole");
      localStorage.removeItem("token");
      
      console.log("User logged out and auth state cleared");
    } catch (error) {
      console.error("Error clearing auth state:", error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!role) {
      toast.error('Please select a role (Student or Mentor)');
      return;
    }
    
    if (email && password && fullName) {
      toast.success('Registration successful!');
      navigate(`/${role}/hero`);
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  const handleGoogleLogin = async () => {
    if (!role) {
      toast.error('Please select a role before continuing with Google');
      return;
    }

    try {
      toast.loading('Signing in with Google...', { id: 'googleLogin' });
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      console.log("User Info:", user.uid, user.displayName, user.email, user.photoURL);

      const userData = {
        firebaseUID: user.uid,
        email: user.email,
        name: user.displayName,
        profilePicture: user.photoURL,
      };

      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("userRole", role);

      const endpoint = role === 'student' 
        ? "http://localhost:4000/api/student/registerOrLogin" 
        : "http://localhost:4000/api/mentor/registerOrLogin";

      const response = await axios.post(endpoint, userData);

      toast.dismiss('googleLogin');
      
      if (response.status === 200 || response.status === 201) {
        console.log("Login/Registration successful:", response.data);
        toast.success(response.data.message || 'Login/Registration successful!');
        navigate(`/${role}/hero`);
      } else {
        console.error("Error:", response.data.message);
        await clearAuthState();
        toast.error(response.data.message || 'Something went wrong');
      }
    } catch (error) {
      toast.dismiss('googleLogin');
      console.error("Google Sign-In Error:", error);
      
      // Clear auth state on any error
      await clearAuthState();
      
      // Handle specific error cases
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        toast.error(error.response.data.message || 'Server error: Please try again');
      } else if (error.request) {
        // The request was made but no response was received
        toast.error('No response from server. Please check your connection');
      } else {
        // Something happened in setting up the request that triggered an Error
        toast.error('Failed to sign in with Google: ' + error.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2F4156] to-[#1A2A3A] text-black flex items-center justify-center">
      <Toaster 
        position="top-center"
        toastOptions={{
          success: {
            style: {
              background: '#2F4156',
              color: 'white',
            },
          },
          error: {
            style: {
              background: '#E53E3E',
              color: 'white',
            },
          },
          duration: 5000,
        }}
      />
      <div className="w-full max-w-md p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 backdrop-blur-sm">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#2F4156] mb-2">Welcome to TalentHunt</h1>
            <p className="text-[#567C8D]">Sign in or create an account to get started</p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-[#2F4156] mb-2">Register as:</label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="role"
                  value="student"
                  checked={role === 'student'}
                  onChange={() => setRole('student')}
                  className="form-radio text-[#2F4156] h-4 w-4"
                />
                <span className="ml-2 text-sm text-[#2F4156]">Student</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="role"
                  value="mentor"
                  checked={role === 'mentor'}
                  onChange={() => setRole('mentor')}
                  className="form-radio text-[#2F4156] h-4 w-4"
                />
                <span className="ml-2 text-sm text-[#2F4156]">Mentor</span>
              </label>
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            className={`w-full mb-6 bg-white text-[#2F4156] py-3 px-4 rounded-lg border-2 border-[#C8D9E6] hover:bg-[#C8D9E6] transition-colors duration-200 flex items-center justify-center space-x-3 ${!role && 'opacity-50 cursor-not-allowed'}`}
            disabled={!role}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#C8D9E6]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-[#567C8D]">Or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-[#2F4156] mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-[#C8D9E6] focus:outline-none focus:border-[#567C8D] bg-white"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#2F4156] mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-[#C8D9E6] focus:outline-none focus:border-[#567C8D] bg-white"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#2F4156] mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-[#C8D9E6] focus:outline-none focus:border-[#567C8D] bg-white"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#567C8D]"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="terms"
                className="h-4 w-4 text-[#567C8D] border-[#C8D9E6] rounded"
                required
              />
              <label htmlFor="terms" className="ml-2 text-sm text-[#567C8D]">
                I agree to the <a href="#" className="text-[#2F4156] font-semibold hover:text-[#567C8D]">Terms and Conditions</a>
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-[#2F4156] text-white py-3 px-4 rounded-lg hover:bg-[#567C8D] transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <span>Register</span>
              <ArrowRight size={20} />
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[#567C8D]">
              Already have an account?{' '}
              <button 
                onClick={() => navigate('/register')}
                className="text-[#2F4156] font-semibold hover:text-[#567C8D]"
              >
                Sign in with Google
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;