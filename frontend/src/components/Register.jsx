import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc"; // Import Google icon

export default function Register() {
  const navigate = useNavigate();
  const [data, setData] = useState({ 
    fullName: "", 
    email: "", 
    password: "",
    role: "student" // Default role is student
  });
  
  const [isFlipped, setIsFlipped] = useState(false); // State to track which side is showing

  const registerUser = async (e) => {
    e.preventDefault();

    const { fullName, email, password, role } = data;
    try {
      const { data: responseData } = await axios.post('/register', {
        fullName, email, password, role
      });

      if (responseData.error) {
        toast.error(responseData.error);
      } else {
        setData({});
        toast.success("You have been registered successfully");
        navigate('/login');
      }
    } catch (error) {
      toast.error("Registration failed. Please try again.");
    }
  };

  // Google authentication handler
  const handleGoogleAuth = async () => {
    try {
      // Redirect to Google OAuth endpoint or use a library like firebase auth
      window.location.href = "/api/auth/google"; // Adjust this URL based on your backend implementation
    } catch (error) {
      toast.error("Google authentication failed");
    }
  };

  // Toggle role between student and mentor
  const toggleRole = () => {
    setIsFlipped(!isFlipped);
    setData({
      ...data,
      role: isFlipped ? "student" : "mentor"
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-96 bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold text-center mb-2">Register</h2>
        
        {/* Role Toggle Switch */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center p-1 bg-gray-200 rounded-full">
            <button 
              className={`px-4 py-2 rounded-full transition-all ${!isFlipped ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-700'}`}
              onClick={() => !isFlipped && toggleRole()}
            >
              Student
            </button>
            <button 
              className={`px-4 py-2 rounded-full transition-all ${isFlipped ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-700'}`}
              onClick={() => isFlipped && toggleRole()}
            >
              Mentor
            </button>
          </div>
        </div>

        <div className="text-center mb-4">
          <span className="text-lg font-medium text-indigo-700">
            Register as a {data.role}
          </span>
        </div>

        <form onSubmit={registerUser}>
          {/* Name Input */}
          <div className="mb-4">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Full Name
            </label>
            <input
              id="name"
              type="text"
              placeholder="Enter your full name"
              value={data.fullName || ""}
              onChange={(e) => setData({ ...data, fullName: e.target.value })}
              className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
          </div>

          {/* Email Input */}
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={data.email || ""}
              onChange={(e) => setData({ ...data, email: e.target.value })}
              className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
          </div>

          {/* Password Input */}
          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={data.password || ""}
              onChange={(e) => setData({ ...data, password: e.target.value })}
              className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
          >
            Register
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-4">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="px-3 text-gray-500 text-sm">OR</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        {/* Google Auth Button */}
        <button
          type="button"
          onClick={handleGoogleAuth}
          className="w-full flex items-center justify-center bg-white border border-gray-300 py-2 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          <FcGoogle className="text-xl mr-2" />
          <span>Continue with Google</span>
        </button>

        {/* Login Link */}
        <p className="text-center mt-4 text-sm text-gray-600">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Log in
          </a>
        </p>
      </div>
    </div>
  );
}
