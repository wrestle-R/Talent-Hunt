import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getAuth, signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword } from "firebase/auth";
import axios from 'axios';
import { app } from "../../firebase";
import { FcGoogle } from 'react-icons/fc';

const Login = () => {
  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();

  // Handle email/password login
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }
    
    try {
      setLoading(true);
      
      // Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Get user info from your backend
      let endpoint = '';
      if (role === 'student') {
        endpoint = `http://localhost:4000/api/student/${firebaseUser.uid}`;
      } else if (role === 'mentor') {
        endpoint = `http://localhost:4000/api/mentor/${firebaseUser.uid}`;
      } else if (role === 'admin') {
        endpoint = `http://localhost:4000/api/admin/${firebaseUser.uid}`;
      }
      
      const response = await axios.get(endpoint);
      
      // Store user data in localStorage
      const userData = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || response.data.name,
        role: role,
        profileComplete: response.data.profileComplete || false
      };
      
      localStorage.setItem('user', JSON.stringify(userData));
      toast.success("Login successful!");
      
      // Navigate based on role
      if (role === 'student') {
        navigate('/student/dashboard');
      } else if (role === 'mentor') {
        navigate('/mentor/dashboard');
      } else if (role === 'admin') {
        navigate('/admin/dashboard');
      }
      
    } catch (error) {
      console.error("Login failed:", error);
      
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        toast.error("Invalid email or password");
      } else {
        toast.error("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Google login (existing function)
  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      let endpoint = '';
      
      if (role === 'student') {
        endpoint = 'http://localhost:4000/api/student/registerOrLogin';
      } else if (role === 'mentor') {
        endpoint = 'http://localhost:4000/api/mentor/registerOrLogin';
      } else if (role === 'admin') {
        endpoint = 'http://localhost:4000/api/admin/registerOrLogin';
      }
      
      const response = await axios.post(endpoint, {
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        photo: user.photoURL
      });
      
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        role: role,
        profileComplete: response.data.profileComplete || false
      };
      
      localStorage.setItem('user', JSON.stringify(userData));
      toast.success("Login successful!");
      
      if (role === 'student') {
        navigate('/student/dashboard');
      } else if (role === 'mentor') {
        navigate('/mentor/dashboard');
      } else if (role === 'admin') {
        navigate('/admin/dashboard');
      }
      
    } catch (error) {
      console.error("Google login failed:", error);
      toast.error("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-center text-3xl font-bold text-gray-900">Talent Hunt</h1>
          <h2 className="mt-6 text-center text-2xl font-semibold text-gray-900">Sign in to your account</h2>
        </div>
        
        {/* Role Selection */}
        <div className="flex justify-center space-x-4 mb-6">
          <button
            type="button"
            onClick={() => setRole("student")}
            className={`px-4 py-2 rounded ${
              role === "student" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
            }`}
          >
            Student
          </button>
          <button
            type="button"
            onClick={() => setRole("mentor")}
            className={`px-4 py-2 rounded ${
              role === "mentor" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
            }`}
          >
            Mentor
          </button>
          <button
            type="button"
            onClick={() => setRole("admin")}
            className={`px-4 py-2 rounded ${
              role === "admin" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
            }`}
          >
            Admin
          </button>
        </div>
        
        {/* Email/Password Form */}
        <form className="mt-8 space-y-6" onSubmit={handleEmailLogin}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
        
        {/* Google Sign In */}
        <div className="mt-4">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <span className="mr-2">
              <FcGoogle size={20} />
            </span>
            Sign in with Google
          </button>
        </div>
        
        <div className="text-center">
          <p className="mt-2 text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;