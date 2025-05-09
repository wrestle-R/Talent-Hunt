"use client"

import { useState } from "react"
import { Shield, User, Briefcase, Sparkles, GraduationCap, Code, Moon, Star, Lock } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { auth, provider, signInWithPopup } from "../firebaseConfig"
import axios from "axios"
import toast, { Toaster } from "react-hot-toast"
import Spline from '@splinetool/react-spline'

const Register = () => {
  const [role, setRole] = useState("") // No default role
  const [organization, setOrganization] = useState("") // For admin role
  const [isLoading, setIsLoading] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const navigate = useNavigate()

  // Helper function to clear auth state
  const clearAuthState = async () => {
    try {
      // Sign out from Firebase
      await auth.signOut()

      // Clear localStorage items
      localStorage.removeItem("user")
      localStorage.removeItem("userRole")
      localStorage.removeItem("token")

      console.log("User logged out and auth state cleared")
    } catch (error) {
      console.error("Error clearing auth state:", error)
    }
  }

  // Google authentication
  const handleGoogleAuth = async () => {
    if (!role) {
      toast.error("Please select a role to continue")
      return
    }

    if (role === "admin" && !organization) {
      toast.error("Please enter your organization name")
      return
    }

    if (!agreeTerms) {
      toast.error("You must agree to the Terms and Conditions to continue")
      return
    }

    try {
      setIsLoading(true)
      toast.loading("Authenticating with Google...", { id: "googleAuth" })
      const result = await signInWithPopup(auth, provider)
      const user = result.user

      console.log("User Info:", user.uid, user.displayName, user.email, user.photoURL)

      const userData = {
        firebaseUID: user.uid,
        email: user.email,
        name: user.displayName,
        profilePicture: user.photoURL,
        authMethod: "google",
      }

      // Add organization for admin users
      if (role === "admin") {
        userData.organization = organization
      }

      localStorage.setItem("user", JSON.stringify(user))
      localStorage.setItem("userRole", role)

      // Determine the appropriate endpoint based on user role
      let endpoint
      if (role === "student") {
        endpoint = "http://localhost:4000/api/student/registerOrLogin"
      } else if (role === "mentor") {
        endpoint = "http://localhost:4000/api/mentor/registerOrLogin"
      } else if (role === "admin") {
        endpoint = "http://localhost:4000/api/admin/registerOrLogin"
      }

      const response = await axios.post(endpoint, userData)

      toast.dismiss("googleAuth")

      if (response.status === 200 || response.status === 201) {
        console.log("Authentication successful:", response.data)
        const isNewUser = response.status === 201
        toast.success(isNewUser ? "Account created successfully!" : "Welcome back!")
        navigate(`/${role}/hero`)
      } else {
        console.error("Error:", response.data.message)
        await clearAuthState()
        toast.error(response.data.message || "Something went wrong")
      }
    } catch (error) {
      toast.dismiss("googleAuth")
      console.error("Google Auth Error:", error)

      // Clear auth state on any error
      await clearAuthState()

      // Handle specific error cases
      if (error.response) {
        toast.error(error.response.data.message || "Server error: Please try again")
      } else if (error.request) {
        toast.error("No response from server. Please check your connection")
      } else {
        toast.error("Authentication failed: " + error.message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Role description based on selected role
  const getRoleDescription = () => {
    switch (role) {
      case "student":
        return "Access learning resources, connect with mentors, and track your progress."
      case "mentor":
        return "Guide students, create content, and share your expertise with the community."
      case "admin":
        return "Manage the platform, oversee users, and ensure quality standards."
      default:
        return "Select a role to continue to the TeamSync platform."
    }
  }

  // Role icon based on selected role
  const getRoleIcon = () => {
    switch (role) {
      case "student":
        return <GraduationCap size={48} className="text-white-300" />
      case "mentor":
        return <Code size={48} className="text-white-300" />
      case "admin":
        return <Shield size={48} className="text-white-300" />
      default:
        return <Sparkles size={48} className="text-white-300" />
    }
  }

  // Background pattern for the selected role
  const getRolePattern = () => {
    switch (role) {
      case "student":
        return "bg-[radial-gradient(#E8C848_1px,transparent_1px)] bg-[length:20px_20px]"
      case "mentor":
        return "bg-[radial-gradient(#E8C848_1px,transparent_1px)] bg-[length:20px_20px]"
      case "admin":
        return "bg-[radial-gradient(#E8C848_1px,transparent_1px)] bg-[length:20px_20px]"
      default:
        return "bg-[radial-gradient(#E8C848_1px,transparent_1px)] bg-[length:20px_20px]"
    }
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col md:flex-row items-stretch relative overflow-hidden">
      {/* Spline Background */}
      <div className="absolute inset-0 w-full h-full z-0">
        <Spline scene="https://prod.spline.design/RiJfxKhCB-D8Q8dt/scene.splinecode" />
      </div>

      <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-white/20 to-transparent pointer-events-none z-10"></div>

      <Toaster
        position="top-center"
        toastOptions={{
          success: {
            style: {
              background: "#121212",
              color: "white",
              border: "1px solid rgb(231, 231, 231)",
            },
            iconTheme: {
              primary: "white",
              secondary: "#121212",
            },
          },
          error: {
            style: {
              background: "#121212",
              color: "#EF4444",
              border: "1px solid rgb(255, 235, 235)",
            },
            iconTheme: {
              primary: "#EF4444",
              secondary: "#121212",
            },
          },
          loading: {
            style: {
              background: "#121212",
              color: "white",
              border: "1px solid rgb(255, 252, 238)",
            },
          },
          duration: 5000,
        }}
      />

      {/* Left side - Information Panel */}
      <div className="hidden md:flex md:w-1/2 bg-[#2d2d30]/30 backdrop-blur-[80px] text-white p-8 flex-col justify-center items-center relative z-10">
        <div className="max-w-md mx-auto text-center relative z-10">
          <div className="mb-8 relative">
            <div className="absolute -top-12 -left-12 w-32 h-32 bg-white-500 rounded-full filter blur-3xl opacity-20"></div>
            <div className="absolute -bottom-4 -right-8 w-28 h-28 bg-grey-500 rounded-full filter blur-3xl opacity-20"></div>
            <h1 className="text-5xl font-bold mb-2 flex items-center justify-center text-white">
              <Sparkles className="mr-2 text-white" /> TeamSync
            </h1>
            <p className="text-xl mt-4 text-gray-200">
              Discover, Learn, and Grow with our community of tech enthusiasts
            </p>
          </div>

          <div className="space-y-6 backdrop-blur-sm bg-[#2d2d30]/40 p-6 rounded-xl border border-white-500/20 shadow-xl">
            <div className="flex items-center bg-[#2d2d30]/70 p-4 rounded-lg transform hover:scale-105 transition-all border border-white-500/20 hover:border-grey-500/30">
              <div className="mr-4 bg-gradient-to-r from-white-500/20 to-grey-500/20 p-3 rounded-full">
                <GraduationCap className="text-white-300" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-white-300">For Students</h3>
                <p className="text-sm text-gray-300">Access learning paths and connect with mentors</p>
              </div>
            </div>

            <div className="flex items-center bg-[#2d2d30]/70 p-4 rounded-lg transform hover:scale-105 transition-all border border-white-500/20 hover:border-grey-500/30">
              <div className="mr-4 bg-gradient-to-r from-white-500/20 to-grey-500/20 p-3 rounded-full">
                <Briefcase className="text-white-300" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-white-300">For Mentors</h3>
                <p className="text-sm text-gray-300">Share your knowledge and guide students</p>
              </div>
            </div>

            <div className="flex items-center bg-[#2d2d30]/70 p-4 rounded-lg transform hover:scale-105 transition-all border border-white-500/20 hover:border-grey-500/30">
              <div className="mr-4 bg-gradient-to-r from-white-500/20 to-grey-500/20 p-3 rounded-full">
                <Shield className="text-white-300" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-white-300">For Admins</h3>
                <p className="text-sm text-gray-300">Manage the platform and ensure quality</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Authentication Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-4 md:p-8 relative z-10">
        <div className="w-full max-w-md relative">
          {/* Form glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-white-500/30 to-grey-500/30 rounded-lg blur opacity-30"></div>

          <div className="relative bg-[#2d2d30]/30 backdrop-blur-[80px] rounded-lg p-6 sm:p-8 border border-white-500/20">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">{getRoleIcon()}</div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Welcome to TeamSync
              </h1>
              <p className="text-gray-200">{getRoleDescription()}</p>
            </div>

            {/* Role selection */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-200 mb-3">Choose your role:</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Student role */}
                <label
                  className={`flex items-center p-3 border-2 rounded-md cursor-pointer transition-all transform hover:scale-105 ${
                    role === "student"
                      ? "bg-gradient-to-r from-white-500/20 to-grey-500/20 border-white-400 shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                      : "hover:bg-[#2d2d30]/50 border-gray-700"
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="student"
                    checked={role === "student"}
                    onChange={() => setRole("student")}
                    className="sr-only"
                  />
                  <div className="flex items-center">
                    <User className={`mr-2 ${role === "student" ? "text-white-300" : "text-white"}`} size={18} />
                    <span className={role === "student" ? "text-white-300 font-medium" : "text-white"}>Student</span>
                  </div>
                </label>

                {/* Mentor role */}
                <label
                  className={`flex items-center p-3 border-2 rounded-md cursor-pointer transition-all transform hover:scale-105 ${
                    role === "mentor"
                      ? "bg-gradient-to-r from-white-500/20 to-grey-500/20 border-white-400 shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                      : "hover:bg-[#2d2d30]/50 border-gray-700"
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="mentor"
                    checked={role === "mentor"}
                    onChange={() => setRole("mentor")}
                    className="sr-only"
                  />
                  <div className="flex items-center">
                    <Briefcase className={`mr-2 ${role === "mentor" ? "text-white-300" : "text-white"}`} size={18} />
                    <span className={role === "mentor" ? "text-white-300 font-medium" : "text-white"}>Mentor</span>
                  </div>
                </label>

                {/* Admin role */}
                <label
                  className={`flex items-center p-3 border-2 rounded-md cursor-pointer transition-all transform hover:scale-105 ${
                    role === "admin"
                      ? "bg-gradient-to-r from-white-500/20 to-grey-500/20 border-white-400 shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                      : "hover:bg-[#2d2d30]/50 border-gray-700"
                  }`}
                >
                  <input
                    type="radio"
                    value="admin"
                    checked={role === "admin"}
                    onChange={() => setRole("admin")}
                    className="sr-only"
                  />
                  <div className="flex items-center">
                    <Shield className={`mr-2 ${role === "admin" ? "text-white-300" : "text-white"}`} size={18} />
                    <span className={role === "admin" ? "text-white-300 font-medium" : "text-white"}>Admin</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Organization field for Admin role - with enhanced styling */}
            {role === "admin" && (
              <div className="mb-6 animate-fadeIn">
                <label htmlFor="organization" className="block text-sm font-medium text-white-300 mb-2">
                  Organization Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="organization"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border bg-gray-900 text-white border-gray-700 focus:outline-none focus:border-white-400 focus:ring-2 focus:ring-white-500/20 transition-all"
                    placeholder="Enter your organization name"
                    required={role === "admin"}
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <Briefcase size={18} className="text-white-300" />
                  </div>
                </div>
              </div>
            )}

            {/* Terms checkbox with updated styling */}
            <div className="flex items-center mb-8 p-4 border border-white-500/20 rounded-lg bg-[#2d2d30]/50 hover:bg-[#2d2d30]/60 transition-all">
              <input
                type="checkbox"
                id="terms"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="h-5 w-5 text-white-500 bg-[#2d2d30] border-gray-600 rounded focus:ring-2 focus:ring-white-500/30"
              />
              <label htmlFor="terms" className="ml-3 text-sm text-gray-200">
                I agree to the{" "}
                <a href="#" className="text-white-300 hover:text-grey-300 underline">
                  Terms and Conditions
                </a>{" "}
                and{" "}
                <a href="#" className="text-white-300 hover:text-grey-300 underline">
                  Privacy Policy
                </a>
              </label>
            </div>

            {/* Sign in button with updated styling */}
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={!role || (role === "admin" && !organization) || isLoading || !agreeTerms}
              className={`w-full py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg
                ${
                  !role || (role === "admin" && !organization) || !agreeTerms || isLoading
                    ? "bg-gray-900 text-gray-500 cursor-not-allowed border border-gray-700"
                    : "bg-gradient-to-r from-white-500 to-grey-500 hover:from-white-600 hover:to-grey-600 text-white border border-white-500/70 hover:shadow-[0_0_15px_rgba(168,85,247,0.5)]"
                }`}
            >
              {isLoading ? (
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#121212"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#121212"
                    fillOpacity="0.85"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#121212"
                    fillOpacity="0.7"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#121212"
                    fillOpacity="0.55"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              <span>{isLoading ? "Connecting..." : "Sign in with Google"}</span>
            </button>

            {/* Trust badges with updated styling */}
            <div className="mt-8 pt-6 border-t border-white-500/20">
              <p className="text-center text-sm text-gray-300">
                Whether you're new or returning, signing in will either create your account or access your existing one.
              </p>

              <div className="mt-6 flex justify-center space-x-6">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto bg-gradient-to-r from-white-500/10 to-grey-500/10 border border-white-500/30 rounded-full flex items-center justify-center text-white-300">
                    <Lock size={20} />
                  </div>
                  <p className="mt-2 text-xs text-gray-300">Secure Login</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto bg-gradient-to-r from-white-500/10 to-grey-500/10 border border-white-500/30 rounded-full flex items-center justify-center text-white-300">
                    <Shield size={20} />
                  </div>
                  <p className="mt-2 text-xs text-gray-300">Privacy Protected</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto bg-gradient-to-r from-white-500/10 to-grey-500/10 border border-white-500/30 rounded-full flex items-center justify-center text-white-300">
                    <Star size={20} />
                  </div>
                  <p className="mt-2 text-xs text-gray-300">Premium Access</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Add this to your global CSS or tailwind config
// @keyframes pulse {
//   0%, 100% { opacity: 0.6; }
//   50% { opacity: 1; }
// }

export default Register

