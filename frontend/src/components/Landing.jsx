import {
    FaUsers,
    FaUserTie,
    FaChalkboardTeacher,
    FaChartLine,
    FaSearch,
    FaRocket,
    FaComments,
    FaClipboardCheck,
    FaGithub,
    FaTwitter,
    FaInstagram,
  } from "react-icons/fa"
  
  function Landing() {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100">
        {/* Hero Section */}
        <section className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 mb-10 md:mb-0">
                <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-4">
                  Automated Team Selection & Mentorship System
                </h1>
                <p className="text-xl text-gray-300 mb-8">
                  Build winning teams for technical competitions with AI-powered matching and expert mentorship.
                </p>
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                  <button className="px-6 py-3 text-base font-medium text-gray-900 bg-blue-400 rounded-md hover:bg-blue-500 transition-colors duration-300 shadow-md">
                    Get Started
                  </button>
                  <button className="px-6 py-3 text-base font-medium text-blue-400 bg-transparent border border-blue-400 rounded-md hover:bg-gray-800 transition-colors duration-300">
                    Learn More
                  </button>
                </div>
              </div>
              <div className="md:w-1/2">
                <img
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80"
                  alt="Team collaboration"
                  className="rounded-lg shadow-xl"
                />
              </div>
            </div>
          </div>
        </section>
  
        {/* Features Section */}
        <section className="py-20 bg-gray-800 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-white mb-4">Key Features</h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Our platform streamlines the entire process from team formation to competition success.
              </p>
            </div>
  
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-gray-700 p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="text-blue-400 mb-4">
                  <FaUsers className="h-10 w-10" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Smart Team Formation</h3>
                <p className="text-gray-300">
                  AI-driven matching based on complementary skills and experience for optimal team composition.
                </p>
              </div>
  
              <div className="bg-gray-700 p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="text-blue-400 mb-4">
                  <FaSearch className="h-10 w-10" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Teammate Search</h3>
                <p className="text-gray-300">
                  Find the perfect teammates with advanced filtering by skills, department, and experience.
                </p>
              </div>
  
              <div className="bg-gray-700 p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="text-blue-400 mb-4">
                  <FaChalkboardTeacher className="h-10 w-10" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Expert Mentorship</h3>
                <p className="text-gray-300">
                  Get matched with faculty mentors based on competition type and team needs.
                </p>
              </div>
  
              <div className="bg-gray-700 p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="text-blue-400 mb-4">
                  <FaClipboardCheck className="h-10 w-10" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Progress Tracking</h3>
                <p className="text-gray-300">
                  Monitor milestones, deadlines, and team performance throughout the competition.
                </p>
              </div>
            </div>
          </div>
        </section>
  
        {/* User Roles Section */}
        <section className="py-20 bg-gray-900 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-white mb-4">User Roles</h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Our platform serves the needs of all stakeholders in the technical competition ecosystem.
              </p>
            </div>
  
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gray-800 p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center mb-6">
                  <div className="bg-gray-700 p-3 rounded-full text-blue-400 mr-4">
                    <FaUsers className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">Students</h3>
                </div>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start">
                    <svg
                      className="h-5 w-5 text-blue-400 mr-2 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Create profiles with skills and experience
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="h-5 w-5 text-blue-400 mr-2 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Get matched with complementary teammates
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="h-5 w-5 text-blue-400 mr-2 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Search for potential teammates
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="h-5 w-5 text-blue-400 mr-2 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Track competition progress and deadlines
                  </li>
                </ul>
              </div>
  
              <div className="bg-gray-800 p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center mb-6">
                  <div className="bg-gray-700 p-3 rounded-full text-blue-400 mr-4">
                    <FaUserTie className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">Admins</h3>
                </div>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start">
                    <svg
                      className="h-5 w-5 text-blue-400 mr-2 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Manage competition listings
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="h-5 w-5 text-blue-400 mr-2 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Define skill requirements for competitions
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="h-5 w-5 text-blue-400 mr-2 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Approve team formations and mentor assignments
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="h-5 w-5 text-blue-400 mr-2 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Generate reports on student engagement
                  </li>
                </ul>
              </div>
  
              <div className="bg-gray-800 p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center mb-6">
                  <div className="bg-gray-700 p-3 rounded-full text-blue-400 mr-4">
                    <FaChalkboardTeacher className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">Faculty Mentors</h3>
                </div>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start">
                    <svg
                      className="h-5 w-5 text-blue-400 mr-2 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Register with domain expertise
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="h-5 w-5 text-blue-400 mr-2 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Get assigned to teams based on needs
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="h-5 w-5 text-blue-400 mr-2 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Provide feedback and guidance
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="h-5 w-5 text-blue-400 mr-2 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Track team progress and submit evaluations
                  </li>
                </ul>
              </div>
  
              <div className="bg-gray-800 p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center mb-6">
                  <div className="bg-gray-700 p-3 rounded-full text-blue-400 mr-4">
                    <FaChartLine className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">Management</h3>
                </div>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start">
                    <svg
                      className="h-5 w-5 text-blue-400 mr-2 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Monitor student participation rates
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="h-5 w-5 text-blue-400 mr-2 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Track faculty involvement with teams
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="h-5 w-5 text-blue-400 mr-2 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    View competition success analytics
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="h-5 w-5 text-blue-400 mr-2 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Generate overall summary reports
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
  
        {/* Benefits Section */}
        <section className="py-20 bg-gray-800 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-white mb-4">Why Choose TeamSync?</h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Our platform offers unique advantages for all stakeholders in the technical competition ecosystem.
              </p>
            </div>
  
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center p-6">
                <div className="bg-gray-700 p-4 rounded-full text-blue-400 mb-4">
                  <FaRocket className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Increased Success Rate</h3>
                <p className="text-gray-300">
                  Teams formed with complementary skills have a 40% higher success rate in competitions.
                </p>
              </div>
  
              <div className="flex flex-col items-center text-center p-6">
                <div className="bg-gray-700 p-4 rounded-full text-blue-400 mb-4">
                  <FaComments className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Streamlined Communication</h3>
                <p className="text-gray-300">
                  Integrated messaging and notification system keeps everyone on the same page.
                </p>
              </div>
  
              <div className="flex flex-col items-center text-center p-6">
                <div className="bg-gray-700 p-4 rounded-full text-blue-400 mb-4">
                  <FaChartLine className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Data-Driven Insights</h3>
                <p className="text-gray-300">
                  Comprehensive analytics help identify strengths and areas for improvement.
                </p>
              </div>
            </div>
          </div>
        </section>
  
        {/* CTA Section */}
        <section className="py-20 bg-blue-600 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Build Winning Teams?</h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
              Join thousands of students, mentors, and institutions already using our platform.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <button className="px-8 py-3 text-base font-medium text-blue-600 bg-white rounded-md hover:bg-gray-100 transition-colors duration-300 shadow-md">
                Get Started
              </button>
              <button className="px-8 py-3 text-base font-medium text-white bg-transparent border border-white rounded-md hover:bg-blue-700 transition-colors duration-300">
                Request Demo
              </button>
            </div>
          </div>
        </section>
  
        {/* Footer */}
        <footer className="bg-gray-900 text-gray-400 py-12 px-4 sm:px-6 lg:px-8 border-t border-gray-800">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center mb-4">
                  <div className="text-blue-400 mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-white">TeamSync</h2>
                </div>
                <p className="text-gray-400 mb-4">Building winning teams through smart matching and expert mentorship.</p>
                <div className="flex space-x-4">
                  <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                    <FaTwitter className="h-6 w-6" />
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                    <FaInstagram className="h-6 w-6" />
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                    <FaGithub className="h-6 w-6" />
                  </a>
                </div>
              </div>
  
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Platform</h3>
                <ul className="space-y-2">
                  <li>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                      Features
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                      Security
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                      Pricing
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                      Testimonials
                    </a>
                  </li>
                </ul>
              </div>
  
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Resources</h3>
                <ul className="space-y-2">
                  <li>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                      Documentation
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                      Guides
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                      API Reference
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                      Blog
                    </a>
                  </li>
                </ul>
              </div>
  
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Company</h3>
                <ul className="space-y-2">
                  <li>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                      About Us
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                      Careers
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                      Contact
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                      Privacy Policy
                    </a>
                  </li>
                </ul>
              </div>
            </div>
  
            <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-500 text-sm">&copy; {new Date().getFullYear()} TeamSync. All rights reserved.</p>
              <div className="mt-4 md:mt-0">
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors duration-300 mr-4">
                  Terms of Service
                </a>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors duration-300 mr-4">
                  Privacy Policy
                </a>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors duration-300">
                  Cookie Policy
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    )
  }
  
  export default Landing
  
  