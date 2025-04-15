"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { auth } from "../firebaseConfig"

const Navbar = () => {
  const navigate = useNavigate()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userRole, setUserRole] = useState("")
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsLoggedIn(!!user)
      // Determine user role from localStorage or other source
      if (user) {
        const storedUser = localStorage.getItem("user")
        if (storedUser) {
          try {
            // You might want to store role in localStorage when user logs in
            const role = localStorage.getItem("userRole") || "student"
            setUserRole(role)
          } catch (error) {
            console.error("Error parsing stored user:", error)
          }
        }
      }
    })

    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)

    return () => {
      unsubscribe()
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  const handleLogout = () => {
    auth
      .signOut()
      .then(() => {
        localStorage.removeItem("user")
        localStorage.removeItem("userRole")
        navigate("/register")
      })
      .catch((error) => {
        console.error("Logout Error:", error)
      })
  }

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-[#121212]/90 backdrop-blur-md shadow-lg" : "bg-[#121212]"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-[#E8C848] to-[#E8C848]/70 rounded-lg flex items-center justify-center text-[#121212] font-bold text-xl">
                TS
              </div>
              <span className="text-xl font-bold text-white">
                Team<span className="text-[#E8C848]">Sync</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-white hover:text-[#E8C848] transition-colors">
                Home
              </Link>
              <Link to="/features" className="text-white hover:text-[#E8C848] transition-colors">
                Features
              </Link>
              <Link to="/about" className="text-white hover:text-[#E8C848] transition-colors">
                About
              </Link>
              {isLoggedIn ? (
                <>
                  <Link to={`/${userRole}/hero`} className="text-white hover:text-[#E8C848] transition-colors">
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-[#E8C848] text-[#121212] rounded-md hover:bg-[#E8C848]/80 transition-colors font-medium"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/register"
                  className="px-4 py-2 bg-[#E8C848] text-[#121212] rounded-md hover:bg-[#E8C848]/80 transition-colors font-medium"
                >
                  Sign Up
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white focus:outline-none">
                {isMenuOpen ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-[#121212] border-t border-gray-800">
            <div className="container mx-auto px-4 py-4 space-y-4">
              <Link
                to="/"
                className="block text-white hover:text-[#E8C848] transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/features"
                className="block text-white hover:text-[#E8C848] transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                to="/about"
                className="block text-white hover:text-[#E8C848] transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              {isLoggedIn ? (
                <>
                  <Link
                    to={`/${userRole}/hero`}
                    className="block text-white hover:text-[#E8C848] transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout()
                      setIsMenuOpen(false)
                    }}
                    className="w-full px-4 py-2 bg-[#E8C848] text-[#121212] rounded-md hover:bg-[#E8C848]/80 transition-colors font-medium"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/register"
                  className="block w-full px-4 py-2 bg-[#E8C848] text-[#121212] rounded-md hover:bg-[#E8C848]/80 transition-colors font-medium text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
      {/* This div adds spacing below the navbar */}
      <div className="h-16"></div>
    </>
  )
}

export default Navbar

