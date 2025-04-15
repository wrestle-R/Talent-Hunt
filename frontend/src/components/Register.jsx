"use client"

import { useState } from "react"
import { Shield, User, Briefcase, Sparkles, GraduationCap, Code, Moon, Star, Lock } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { auth, provider, signInWithPopup } from "../firebaseConfig"
import axios from "axios"
import toast, { Toaster } from "react-hot-toast"

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
        return <GraduationCap size={48} className="text-[#E8C848]" />
      case "mentor":
        return <Code size={48} className="text-[#E8C848]" />
      case "admin":
        return <Shield size={48} className="text-[#E8C848]" />
      default:
        return <Sparkles size={48} className="text-[#E8C848]" />
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
    <div className={`min-h-screen bg-[#121212] text-white flex flex-col md:flex-row items-stretch ${getRolePattern()}`}>
      <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-[#E8C848]/20 to-transparent pointer-events-none"></div>

      <Toaster
        position="top-center"
        toastOptions={{
          success: {
            style: {
              background: "#121212",
              color: "#E8C848",
              border: "1px solid #E8C848",
            },
            iconTheme: {
              primary: "#E8C848",
              secondary: "#121212",
            },
          },
          error: {
            style: {
              background: "#121212",
              color: "#EF4444",
              border: "1px solid #EF4444",
            },
            iconTheme: {
              primary: "#EF4444",
              secondary: "#121212",
            },
          },
          loading: {
            style: {
              background: "#121212",
              color: "#E8C848",
              border: "1px solid #E8C848",
            },
          },
          duration: 5000,
        }}
      />

      {/* Left side - Information Panel */}
      <div className="hidden md:flex md:w-1/2 bg-[#121212] text-white p-8 flex-col justify-center items-center relative overflow-hidden">
        {/* Moving stars background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="stars-container">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-[#E8C848] animate-pulse"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  width: `${Math.random() * 3 + 1}px`,
                  height: `${Math.random() * 3 + 1}px`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${Math.random() * 5 + 3}s`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="max-w-md mx-auto text-center relative z-10">
          <div className="mb-8 relative">
            <div className="absolute -top-12 -left-12 w-32 h-32 bg-[#E8C848] rounded-full filter blur-3xl opacity-20"></div>
            <div className="absolute -bottom-4 -right-8 w-28 h-28 bg-[#E8C848] rounded-full filter blur-3xl opacity-20"></div>
            <h1 className="text-5xl font-bold mb-2 flex items-center justify-center bg-clip-text text-transparent bg-gradient-to-r from-[#E8C848] via-[#E8C848] to-[#E8C848]/70">
              <Sparkles className="mr-2 text-[#E8C848]" /> TeamSync
            </h1>
            <p className="text-xl mt-4 text-gray-300">
              Discover, Learn, and Grow with our community of tech enthusiasts
            </p>
          </div>

          <div className="space-y-6 backdrop-blur-sm bg-gray-800/30 p-6 rounded-xl border border-gray-700 shadow-xl">
            <div className="flex items-center bg-gray-800/70 p-4 rounded-lg transform hover:scale-105 transition-all border border-[#E8C848]/20">
              <div className="mr-4 bg-[#E8C848]/10 p-3 rounded-full">
                <GraduationCap className="text-[#E8C848]" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-[#E8C848]">For Students</h3>
                <p className="text-sm text-gray-400">Access learning paths and connect with mentors</p>
              </div>
            </div>

            <div className="flex items-center bg-gray-800/70 p-4 rounded-lg transform hover:scale-105 transition-all border border-[#E8C848]/20">
              <div className="mr-4 bg-[#E8C848]/10 p-3 rounded-full">
                <Briefcase className="text-[#E8C848]" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-[#E8C848]">For Mentors</h3>
                <p className="text-sm text-gray-400">Share your knowledge and guide students</p>
              </div>
            </div>

            <div className="flex items-center bg-gray-800/70 p-4 rounded-lg transform hover:scale-105 transition-all border border-[#E8C848]/20">
              <div className="mr-4 bg-[#E8C848]/10 p-3 rounded-full">
                <Shield className="text-[#E8C848]" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-[#E8C848]">For Admins</h3>
                <p className="text-sm text-gray-400">Manage the platform and ensure quality</p>
              </div>
            </div>
          </div>

          <div className="mt-12 flex items-center justify-center gap-2 text-sm text-gray-400">
            <Moon size={16} className="text-[#E8C848]" />
            <p>© {new Date().getFullYear()} TeamSync. All rights reserved.</p>
          </div>
        </div>
      </div>

      {/* Right side - Authentication Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md relative">
          {/* Form glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-[#E8C848] to-[#E8C848]/70 rounded-lg blur opacity-30"></div>

          <div className="relative bg-gray-800 rounded-lg shadow-2xl p-6 sm:p-8 border border-gray-700">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">{getRoleIcon()}</div>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#E8C848] via-[#E8C848] to-[#E8C848]/70 mb-2">
                Welcome to TeamSync
              </h1>
              <p className="text-gray-300">{getRoleDescription()}</p>
            </div>

            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-300 mb-3">Choose your role:</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label
                  className={`flex items-center p-3 border-2 rounded-md cursor-pointer transition-all transform hover:scale-105 ${
                    role === "student"
                      ? "bg-[#E8C848]/10 border-[#E8C848] shadow-[0_0_15px_rgba(232,200,72,0.3)]"
                      : "hover:bg-gray-700 border-gray-700"
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="student"
                    checked={role === "student"}
                    onChange={() => setRole("student")}
                    className="sr-only" // Hide the default radio button
                  />
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 ${
                      role === "student" ? "border-[#E8C848]" : "border-gray-500"
                    }`}
                  >
                    {role === "student" && <div className="w-3 h-3 rounded-full bg-[#E8C848]"></div>}
                  </div>
                  <div className="flex items-center">
                    <User className={`mr-2 ${role === "student" ? "text-[#E8C848]" : "text-gray-500"}`} size={18} />
                    <span className={role === "student" ? "text-[#E8C848] font-medium" : "text-gray-400"}>Student</span>
                  </div>
                </label>

                <label
                  className={`flex items-center p-3 border-2 rounded-md cursor-pointer transition-all transform hover:scale-105 ${
                    role === "mentor"
                      ? "bg-[#E8C848]/10 border-[#E8C848] shadow-[0_0_15px_rgba(232,200,72,0.3)]"
                      : "hover:bg-gray-700 border-gray-700"
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="mentor"
                    checked={role === "mentor"}
                    onChange={() => setRole("mentor")}
                    className="sr-only" // Hide the default radio button
                  />
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 ${
                      role === "mentor" ? "border-[#E8C848]" : "border-gray-500"
                    }`}
                  >
                    {role === "mentor" && <div className="w-3 h-3 rounded-full bg-[#E8C848]"></div>}
                  </div>
                  <div className="flex items-center">
                    <Briefcase className={`mr-2 ${role === "mentor" ? "text-[#E8C848]" : "text-gray-500"}`} size={18} />
                    <span className={role === "mentor" ? "text-[#E8C848] font-medium" : "text-gray-400"}>Mentor</span>
                  </div>
                </label>

                <label
                  className={`flex items-center p-3 border-2 rounded-md cursor-pointer transition-all transform hover:scale-105 ${
                    role === "admin"
                      ? "bg-[#E8C848]/10 border-[#E8C848] shadow-[0_0_15px_rgba(232,200,72,0.3)]"
                      : "hover:bg-gray-700 border-gray-700"
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="admin"
                    checked={role === "admin"}
                    onChange={() => setRole("admin")}
                    className="sr-only" // Hide the default radio button
                  />
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 ${
                      role === "admin" ? "border-[#E8C848]" : "border-gray-500"
                    }`}
                  >
                    {role === "admin" && <div className="w-3 h-3 rounded-full bg-[#E8C848]"></div>}
                  </div>
                  <div className="flex items-center">
                    <Shield className={`mr-2 ${role === "admin" ? "text-[#E8C848]" : "text-gray-500"}`} size={18} />
                    <span className={role === "admin" ? "text-[#E8C848] font-medium" : "text-gray-400"}>Admin</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Organization field for Admin role - with enhanced styling */}
            {role === "admin" && (
              <div className="mb-6 animate-fadeIn">
                <label htmlFor="organization" className="block text-sm font-medium text-[#E8C848] mb-2">
                  Organization Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="organization"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border bg-gray-900 text-white border-gray-700 focus:outline-none focus:border-[#E8C848] focus:ring-2 focus:ring-[#E8C848]/20 transition-all"
                    placeholder="Enter your organization name"
                    required={role === "admin"}
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <Briefcase size={18} className="text-[#E8C848]" />
                  </div>
                </div>
              </div>
            )}

            {/* Terms checkbox - with enhanced styling */}
            <div className="flex items-center mb-8 p-4 border border-gray-700 rounded-lg bg-gray-900/80 hover:bg-gray-900 transition-all">
              <input
                type="checkbox"
                id="terms"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="h-5 w-5 text-[#E8C848] bg-gray-900 border-gray-600 rounded focus:ring-2 focus:ring-[#E8C848]/30"
              />
              <label htmlFor="terms" className="ml-3 text-sm text-gray-300">
                I agree to the{" "}
                <a href="#" className="text-[#E8C848] hover:text-[#E8C848]/80 underline">
                  Terms and Conditions
                </a>{" "}
                and{" "}
                <a href="#" className="text-[#E8C848] hover:text-[#E8C848]/80 underline">
                  Privacy Policy
                </a>
              </label>
            </div>

            {/* Sign in button - with enhanced styling */}
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={!role || (role === "admin" && !organization) || isLoading || !agreeTerms}
              className={`w-full py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg
                ${
                  !role || (role === "admin" && !organization) || !agreeTerms || isLoading
                    ? "bg-gray-900 text-gray-500 cursor-not-allowed border border-gray-700"
                    : "bg-gradient-to-r from-[#E8C848] to-[#E8C848]/80 hover:from-[#E8C848]/90 hover:to-[#E8C848]/70 text-[#121212] border border-[#E8C848]/70 hover:shadow-[0_0_15px_rgba(232,200,72,0.5)]"
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

            <div className="mt-8 pt-6 border-t border-gray-700">
              <p className="text-center text-sm text-gray-400">
                Whether you're new or returning, signing in will either create your account or access your existing one.
              </p>

              {/* Trust badges with dark theme */}
              <div className="mt-6 flex justify-center space-x-6">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto bg-[#E8C848]/10 border border-[#E8C848]/30 rounded-full flex items-center justify-center text-[#E8C848]">
                    <Lock size={20} />
                  </div>
                  <p className="mt-2 text-xs text-gray-400">Secure Login</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto bg-[#E8C848]/10 border border-[#E8C848]/30 rounded-full flex items-center justify-center text-[#E8C848]">
                    <Shield size={20} />
                  </div>
                  <p className="mt-2 text-xs text-gray-400">Privacy Protected</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto bg-[#E8C848]/10 border border-[#E8C848]/30 rounded-full flex items-center justify-center text-[#E8C848]">
                    <Star size={20} />
                  </div>
                  <p className="mt-2 text-xs text-gray-400">Premium Access</p>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile version of footer */}
          <div className="mt-6 text-center text-gray-400 text-xs md:hidden flex justify-center items-center gap-2">
            <Moon size={14} className="text-[#E8C848]" />
            <p>© {new Date().getFullYear()} TeamSync. All rights reserved.</p>
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

