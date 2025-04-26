"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { auth } from "../firebaseConfig"

const Navbar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userRole, setUserRole] = useState("")
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeLink, setActiveLink] = useState("")
  console.log()
  useEffect(() => {
    setActiveLink(location.pathname)
  }, [location])

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsLoggedIn(!!user)
      if (user) {
        const storedUser = localStorage.getItem("user")
        if (storedUser) {
          try {
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

  const NavLink = ({ to, children }) => (
    <Link
      to={to}
      className={`relative text-white/80 hover:text-white transition-colors duration-300 ${
        activeLink === to ? "text-white" : ""
      }`}
      onClick={() => setIsMenuOpen(false)}
    >
      {children}
      {activeLink === to && (
        <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-white transform scale-x-100 origin-left transition-transform duration-300" />
      )}
    </Link>
  )

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? "bg-[#111111]/90 backdrop-blur-md shadow-lg" : "bg-[#111111] bg-blur"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-gray-900 font-bold text-xl transform transition-transform duration-300 group-hover:scale-110">
                TS
              </div>
              <span className="text-xl font-bold text-white group-hover:text-white/90 transition-colors duration-300">
                Team<span className="text-white/90">Sync</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <NavLink to="/">Home</NavLink>
              <NavLink to="/features">Features</NavLink>
              <NavLink to="/about">About</NavLink>
              {isLoggedIn ? (
                <>
                  <NavLink to={`/${userRole}/hero`}>Profile</NavLink>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-white text-gray-900 rounded-md hover:bg-gray-100 transition-all duration-300 font-medium transform hover:scale-105 active:scale-95"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/register"
                  className="px-4 py-2 bg-white text-gray-900 rounded-md hover:bg-gray-100 transition-all duration-300 font-medium transform hover:scale-105 active:scale-95"
                >
                  Sign Up
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-white/90 hover:text-white focus:outline-none transition-transform duration-300 transform hover:scale-110"
              >
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
        <div
          className={`md:hidden bg-[#111111] border-t border-white/10 transition-all duration-500 ease-in-out ${
            isMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0 overflow-hidden"
          }`}
        >
          <div className="container mx-auto px-4 py-4 space-y-4">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/features">Features</NavLink>
            <NavLink to="/about">About</NavLink>
            {isLoggedIn ? (
              <>
                <NavLink to={`/${userRole}/profile`}>Profile</NavLink>
                <button
                  onClick={() => {
                    handleLogout()
                    setIsMenuOpen(false)
                  }}
                  className="w-full px-4 py-2 bg-white text-gray-900 rounded-md hover:bg-gray-100 transition-all duration-300 font-medium transform hover:scale-105 active:scale-95"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/register"
                className="block w-full px-4 py-2 bg-white text-gray-900 rounded-md hover:bg-gray-100 transition-all duration-300 font-medium text-center transform hover:scale-105 active:scale-95"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign Up
              </Link>
            )}
          </div>
        </div>
      </nav>
      {/* This div adds spacing below the navbar */}
      <div className="h-16"></div>
    </>
  )
}

export default Navbar

