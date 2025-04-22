import React, { useState, useEffect } from 'react';
import { Users, Search, Bell, Shield, Flag, File, Ban, MessageSquare, UserCog, UserX, UserCheck, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ModeratorDashboard = ({ userData }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isValidated, setIsValidated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Check localStorage on mount
  useEffect(() => {
    const validated = localStorage.getItem('moderatorValidated');
    if (validated === 'true') {
      setIsValidated(true);
    }
  }, []);

  const handleValidation = (e) => {
    e.preventDefault();
    if (password === 'moderator123') {
      setIsValidated(true);
      setError('');
      localStorage.setItem('moderatorValidated', 'true');
    } else {
      setError('Invalid password');
    }
  };

  if (!isValidated) {
    return (
      <div className="min-h-screen bg-[#111111] flex items-center justify-center p-4">
        <div className="bg-[#1A1A1A] p-8 rounded-xl border border-gray-800 w-full max-w-md">
          <div className="flex items-center justify-center mb-6">
            <div className="w-12 h-12 rounded-full bg-[#E8C848]/20 flex items-center justify-center">
              <Lock className="text-[#E8C848]" size={24} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white text-center mb-6">Moderator Access</h2>
          <form onSubmit={handleValidation}>
            <div className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-1">
                  Enter Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-[#242424] border border-gray-700 rounded-lg focus:outline-none focus:border-[#E8C848] text-white"
                  placeholder="Enter moderator password"
                />
              </div>
              {error && (
                <p className="text-red-400 text-sm">{error}</p>
              )}
              <button
                type="submit"
                className="w-full bg-[#E8C848] text-[#111111] py-2 px-4 rounded-lg font-medium hover:bg-[#E8C848]/90 transition-all duration-300"
              >
                Access Dashboard
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Mock data for search functionality
  const mockStudents = [
    { id: 'st1', name: 'Alex Johnson', email: 'alex@example.com', major: 'Computer Science' },
    { id: 'st2', name: 'Priya Patel', email: 'priya@example.com', major: 'Data Science' },
    { id: 'st3', name: 'Marcus Lee', email: 'marcus@example.com', major: 'Software Engineering' },
    { id: 'st4', name: 'Sarah Williams', email: 'sarah@example.com', major: 'UI/UX Design' },
    { id: 'st5', name: 'Jamal Brown', email: 'jamal@example.com', major: 'Computer Engineering' }
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      const results = mockStudents.filter(student => 
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        student.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSearchResults(results);
      setShowSearchResults(true);
    }
  };

  // Dashboard sections/cards
  const dashboardSections = [
    {
      title: 'User Management',
      description: 'Review, approve and manage student accounts',
      icon: <Users size={24} className="text-indigo-600" />,
      path: '/moderator/users',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-700',
      stats: { count: 218, label: 'Active' }
    },
    {
      title: 'Project Managing',
      description: 'Managing Projects of students',
      icon: <Ban size={24} className="text-red-600" />,
      path: '/moderator/projects',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      stats: { count: 5, label: 'New' }
    },
    {
      title: 'Messages Moderation',
      description: 'Review reported messages',
      icon: <MessageSquare size={24} className="text-amber-600" />,
      path: '/moderator/messages',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-700',
      stats: { count: 12, label: 'Pending' }
    },
    {
      title: 'Student Reports',
      description: 'Generate and review student activity reports',
      icon: <File size={24} className="text-emerald-600" />,
      path: '/moderator/reports',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-700'
    },
  ];

  return (
    <div className="container mx-auto py-8 px-4 bg-[#111111] font-inter">
      {/* Moderator Dashboard Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white font-montserrat">Moderator Dashboard</h1>
          <p className="text-gray-400">Welcome back, {userData?.name || 'Moderator'}</p>
        </div>
        
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="Search for users..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#E8C848] bg-[#1A1A1A] text-gray-300 placeholder-gray-500"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              if (e.target.value === '') {
                setShowSearchResults(false);
              }
            }}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <button 
            type="submit" 
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#E8C848] hover:text-[#E8C848]/80 transition-colors duration-300"
          >
            Go
          </button>
          
          {/* Search Results Dropdown */}
          {showSearchResults && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-[#1A1A1A] border border-gray-800 rounded-md shadow-lg z-10">
              {searchResults.length > 0 ? (
                <div>
                  <div className="p-2 border-b border-gray-800">
                    <h3 className="font-medium text-sm text-gray-300">
                      {searchResults.length} user{searchResults.length !== 1 ? 's' : ''} found
                    </h3>
                  </div>
                  {searchResults.map(student => (
                    <div 
                      key={student.id}
                      className="p-3 hover:bg-[#111111] cursor-pointer border-b border-gray-800 last:border-0 transition-colors duration-300"
                      onClick={() => {
                        // In a real app, navigate to student profile
                        alert(`Viewing profile for ${student.name}`);
                        setShowSearchResults(false);
                      }}
                    >
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-[#E8C848]/20 text-[#E8C848] flex items-center justify-center mr-3">
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-300">{student.name}</p>
                          <p className="text-xs text-gray-500">{student.email} • {student.major}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  No users found matching "{searchTerm}"
                </div>
              )}
            </div>
          )}
        </form>
      </div>
      
      {/* Dashboard Sections Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboardSections.map((section, index) => (
          <div 
            key={index}
            className="bg-[#1A1A1A] rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-800 overflow-hidden cursor-pointer"
            onClick={() => navigate(section.path)}
          >
            <div className={`p-5 bg-[#111111] border-b border-gray-800`}>
              {section.icon}
            </div>
            <div className="p-5">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-white mb-1 font-montserrat">{section.title}</h3>
                {section.stats && (
                  <div className={`bg-[#E8C848]/20 text-[#E8C848] text-xs font-medium px-2 py-1 rounded-full`}>
                    {section.stats.count} {section.stats.label}
                  </div>
                )}
              </div>
              <p className="text-gray-400 text-sm">{section.description}</p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Recent Reports Section */}
      <div className="mt-10 bg-[#1A1A1A] rounded-xl shadow-sm border border-gray-800 overflow-hidden">
        <div className="p-5 border-b border-gray-800">
          <h2 className="font-bold text-xl text-white font-montserrat">Recent Reports</h2>
        </div>
        <div className="p-5">
          <div className="space-y-4">
            <div className="flex items-center gap-4 pb-3 border-b border-gray-800">
              <div className="w-10 h-10 rounded-full bg-red-900/30 flex items-center justify-center flex-shrink-0">
                <Flag size={20} className="text-red-400" />
              </div>
              <div>
                <p className="text-gray-300">Message reported by <span className="font-medium text-white">Maria Garcia</span> for harassment</p>
                <p className="text-xs text-gray-500">Today at 10:30 AM</p>
              </div>
              <div className="ml-auto">
                <button className="bg-red-900/30 text-red-400 px-3 py-1 rounded-lg text-sm hover:bg-red-900/40 transition-colors duration-300">
                  Review
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-4 pb-3 border-b border-gray-800">
              <div className="w-10 h-10 rounded-full bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                <UserCog size={20} className="text-amber-400" />
              </div>
              <div>
                <p className="text-gray-300"><span className="font-medium text-white">Team Swift Coders</span> requested dissolution</p>
                <p className="text-xs text-gray-500">Yesterday at 5:45 PM</p>
              </div>
              <div className="ml-auto">
                <button className="bg-amber-900/30 text-amber-400 px-3 py-1 rounded-lg text-sm hover:bg-amber-900/40 transition-colors duration-300">
                  Review
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-4 pb-3 border-b border-gray-800">
              <div className="w-10 h-10 rounded-full bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                <Shield size={20} className="text-purple-400" />
              </div>
              <div>
                <p className="text-gray-300">Account verification request from <span className="font-medium text-white">David Chen</span></p>
                <p className="text-xs text-gray-500">Yesterday at 2:15 PM</p>
              </div>
              <div className="ml-auto">
                <button className="bg-purple-900/30 text-purple-400 px-3 py-1 rounded-lg text-sm hover:bg-purple-900/40 transition-colors duration-300">
                  Verify
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#E8C848]/20 flex items-center justify-center flex-shrink-0">
                <Ban size={20} className="text-[#E8C848]" />
              </div>
              <div>
                <p className="text-gray-300"><span className="font-medium text-white">2 accounts</span> flagged for spam activity</p>
                <p className="text-xs text-gray-500">2 days ago</p>
              </div>
              <div className="ml-auto">
                <button className="bg-[#E8C848]/20 text-[#E8C848] px-3 py-1 rounded-lg text-sm hover:bg-[#E8C848]/30 transition-colors duration-300">
                  Review
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="px-5 py-3 bg-[#111111] border-t border-gray-800">
          <button 
            onClick={() => navigate('/moderator/reports/all')} 
            className="text-[#E8C848] hover:text-[#E8C848]/80 text-sm font-medium transition-colors duration-300"
          >
            View All Reports →
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModeratorDashboard;