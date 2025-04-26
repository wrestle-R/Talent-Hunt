import React, { useState, useEffect } from 'react';
import { Users, Search, Bell, Shield, Flag, File, Ban, MessageSquare, UserCog, UserX, UserCheck, Lock, Globe, Target } from 'lucide-react';
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
    // {
    //   title: 'User Management',
    //   description: 'Review, approve and manage student accounts',
    //   icon: <Users size={24} className="text-indigo-600" />,
    //   path: '/moderator/users',
    //   bgColor: 'bg-indigo-50',
    //   textColor: 'text-indigo-700',
    //   stats: { count: 218, label: 'Active' }
    // },
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

  // SDG data for the mapping section
  const sdgData = [
    { id: 1, name: "No Poverty", projects: 12, color: "bg-red-600" },
    { id: 4, name: "Quality Education", projects: 28, color: "bg-red-400" },
    { id: 7, name: "Affordable & Clean Energy", projects: 15, color: "bg-yellow-500" },
    { id: 11, name: "Sustainable Cities", projects: 9, color: "bg-orange-600" },
    { id: 13, name: "Climate Action", projects: 23, color: "bg-green-600" }
  ];

  return (
    <div className="container mx-auto py-8 px-4 bg-[#111111] font-inter">
      {/* Moderator Dashboard Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white font-montserrat">Moderator Dashboard</h1>
          <p className="text-gray-400">Welcome back, {userData?.name || 'Moderator'}</p>
        </div>
        
      
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
      
      {/* SDG Mapping Section */}
      <div className="mt-10 bg-[#1A1A1A] rounded-xl shadow-sm border border-gray-800 overflow-hidden">
        <div className="p-5 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Globe size={24} className="text-[#E8C848]" />
            <h2 className="font-bold text-xl text-white font-montserrat">SDG Mapping Dashboard</h2>
          </div>
          <div className="bg-[#E8C848]/20 text-[#E8C848] text-xs font-medium px-3 py-1 rounded-full">
            87 Projects Mapped
          </div>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* SDG Progress Chart */}
            <div className="bg-[#151515] rounded-lg p-4 border border-gray-800">
              <h3 className="text-gray-300 font-medium mb-4">Top SDG Categories</h3>
              <div className="space-y-4">
                {sdgData.map(sdg => (
                  <div key={sdg.id} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">SDG {sdg.id}: {sdg.name}</span>
                      <span className="text-gray-400">{sdg.projects} projects</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div 
                        className={`${sdg.color} h-2 rounded-full`} 
                        style={{ width: `${(sdg.projects / 30) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Recent SDG Mappings */}
            <div className="space-y-4">
              <div className="flex items-center gap-4 pb-3 border-b border-gray-800">
                <div className="w-10 h-10 rounded-full bg-green-900/30 flex items-center justify-center flex-shrink-0">
                  <Target size={20} className="text-green-400" />
                </div>
                <div>
                  <p className="text-gray-300"><span className="font-medium text-white">EcoTeam Project</span> mapped to SDG 13: Climate Action</p>
                  <p className="text-xs text-gray-500">Today at 11:30 AM</p>
                </div>
                <div className="ml-auto">
                  <button className="bg-green-900/30 text-green-400 px-3 py-1 rounded-lg text-sm hover:bg-green-900/40 transition-colors duration-300">
                    Review
                  </button>
                </div>
              </div>
              
              <div className="flex items-center gap-4 pb-3 border-b border-gray-800">
                <div className="w-10 h-10 rounded-full bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                  <Target size={20} className="text-blue-400" />
                </div>
                <div>
                  <p className="text-gray-300"><span className="font-medium text-white">Clean Water Initiative</span> mapped to SDG 6: Clean Water</p>
                  <p className="text-xs text-gray-500">Yesterday at 3:45 PM</p>
                </div>
                <div className="ml-auto">
                  <button className="bg-blue-900/30 text-blue-400 px-3 py-1 rounded-lg text-sm hover:bg-blue-900/40 transition-colors duration-300">
                    Review
                  </button>
                </div>
              </div>
              
              <div className="flex items-center gap-4 pb-3 border-b border-gray-800">
                <div className="w-10 h-10 rounded-full bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                  <Target size={20} className="text-purple-400" />
                </div>
                <div>
                  <p className="text-gray-300"><span className="font-medium text-white">Gender Equality Forum</span> mapped to SDG 5: Gender Equality</p>
                  <p className="text-xs text-gray-500">Yesterday at 2:15 PM</p>
                </div>
                <div className="ml-auto">
                  <button className="bg-purple-900/30 text-purple-400 px-3 py-1 rounded-lg text-sm hover:bg-purple-900/40 transition-colors duration-300">
                    Review
                  </button>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#E8C848]/20 flex items-center justify-center flex-shrink-0">
                  <Target size={20} className="text-[#E8C848]" />
                </div>
                <div>
                  <p className="text-gray-300"><span className="font-medium text-white">Tech Education Access</span> mapped to SDG 4: Quality Education</p>
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
        </div>
        <div className="px-5 py-3 bg-[#111111] border-t border-gray-800">
          <button 
            onClick={() => navigate('/moderator/sdg-mapping')} 
            className="text-[#E8C848] hover:text-[#E8C848]/80 text-sm font-medium transition-colors duration-300"
          >
            View All SDG Mappings →
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModeratorDashboard;