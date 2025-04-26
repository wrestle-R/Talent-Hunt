import React, { useState } from 'react';
import { CalendarDays, Users, Search, Bell, Shield, Database, FileText, FileBarChart, Globe, Target, BarChart2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = "http://localhost:4000"; // or your deployed backend URL


const AdminDashboard = ({ userData }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Mock data for search functionality
  const mockStudents = [
    { id: 'st1', name: 'Alex Johnson', email: 'alex@example.com', major: 'Computer Science' },
    { id: 'st2', name: 'Priya Patel', email: 'priya@example.com', major: 'Data Science' },
    { id: 'st3', name: 'Marcus Lee', email: 'marcus@example.com', major: 'Software Engineering' },
    { id: 'st4', name: 'Sarah Williams', email: 'sarah@example.com', major: 'UI/UX Design' },
    { id: 'st5', name: 'Jamal Brown', email: 'jamal@example.com', major: 'Computer Engineering' }
  ];

  // SDG data for the mapping section
  const sdgData = [
    { id: 1, name: "No Poverty", projects: 18, color: "bg-red-500" },
    { id: 3, name: "Good Health & Well-being", projects: 32, color: "bg-green-500" },
    { id: 4, name: "Quality Education", projects: 45, color: "bg-red-400" },
    { id: 9, name: "Industry & Innovation", projects: 27, color: "bg-orange-500" },
    { id: 13, name: "Climate Action", projects: 36, color: "bg-teal-500" }
  ];
  
  // SDG category distribution
  const sdgCategories = [
    { category: "Social", count: 95, color: "bg-blue-500" },
    { category: "Environmental", count: 78, color: "bg-green-500" },
    { category: "Economic", count: 62, color: "bg-amber-500" },
    { category: "Technological", count: 53, color: "bg-purple-500" }
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

  const dashboardSections = [
    {
      title: 'Manage Hackathons',
      description: 'Create, edit and manage hackathon events',
      icon: <CalendarDays size={24} className="text-[#E8C848]" />,
      path: '/admin/hackathons',
      bgColor: 'bg-[#1A1A1A]',
      textColor: 'text-[#E8C848]',
      stats: { count: 3, label: 'Active' }
    },
    {
      title: 'Review Hackathon Applications',
      description: 'Review and manage hackathon applicants',
      icon: <Users size={24} className="text-[#E8C848]" />,
      path: '/admin/hackathon_applications',
      bgColor: 'bg-[#1A1A1A]',
      textColor: 'text-[#E8C848]',
      stats: { count: 42, label: 'Pending' }
    },
    {
      title: 'Generate Hacakthon Reports',
      description: 'Create comprehensive student reports',
      icon: <FileBarChart size={24} className="text-[#E8C848]" />,
      path: '/admin/reports/generate',
      bgColor: 'bg-[#1A1A1A]',
      textColor: 'text-[#E8C848]'
    },
  ];

  return (
    <div className="container mx-auto py-8 px-4 bg-[#111111] min-h-screen">
      {/* Admin Dashboard Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white font-montserrat">Admin Dashboard</h1>
          <p className="text-gray-300">{`Welcome back, ${userData?.name || 'Admin'}`}</p>
        </div>
        
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="Search for students..."
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#1A1A1A] border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E8C848] focus:border-transparent"
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
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#E8C848] hover:text-[#E8C848]/80"
          >
            Go
          </button>
          
          {/* Search Results Dropdown */}
          {showSearchResults && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-[#1A1A1A] border border-gray-700 rounded-md shadow-lg z-10">
              {searchResults.length > 0 ? (
                <div>
                  <div className="p-2 border-b border-gray-700">
                    <h3 className="font-medium text-sm text-gray-300">
                      {searchResults.length} student{searchResults.length !== 1 ? 's' : ''} found
                    </h3>
                  </div>
                  {searchResults.map(student => (
                    <div 
                      key={student.id}
                      className="p-3 hover:bg-[#232323] cursor-pointer border-b border-gray-700 last:border-0"
                      onClick={() => {
                        alert(`Viewing profile for ${student.name}`);
                        setShowSearchResults(false);
                      }}
                    >
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-[#E8C848]/20 text-[#E8C848] flex items-center justify-center mr-3">
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-white">{student.name}</p>
                          <p className="text-xs text-gray-400">{student.email} • {student.major}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-gray-400">
                  No students found matching "{searchTerm}"
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
            className="bg-[#1A1A1A] rounded-xl shadow-lg hover:shadow-[#E8C848]/10 transition-shadow border border-gray-800 hover:border-[#E8C848]/30 overflow-hidden cursor-pointer"
            onClick={() => navigate(section.path)}
          >
            <div className={`p-5 border-b border-gray-800`}>
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
      <div className="mt-10 bg-[#1A1A1A] rounded-xl shadow-lg border border-gray-800 overflow-hidden">
        <div className="p-5 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Globe size={24} className="text-[#E8C848]" />
            <h2 className="font-bold text-xl text-white font-montserrat">SDG Mapping Analytics</h2>
          </div>
          <div className="bg-[#E8C848]/20 text-[#E8C848] text-xs font-medium px-3 py-1 rounded-full">
            158 Projects Mapped
          </div>
        </div>
        
        <div className="p-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* SDG Progress Chart */}
            <div className="bg-[#151515] rounded-lg p-4 border border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-300 font-medium">Top SDG Categories</h3>
                <div className="bg-[#232323] text-gray-400 text-xs px-2 py-1 rounded-full">
                  Last 30 days
                </div>
              </div>
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
                        style={{ width: `${(sdg.projects / 50) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* SDG Distribution */}
            <div className="bg-[#151515] rounded-lg p-4 border border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-300 font-medium">Category Distribution</h3>
                <button className="text-[#E8C848] text-xs hover:underline">Export Data</button>
              </div>
              
              <div className="space-y-4">
                {sdgCategories.map((category, idx) => (
                  <div key={idx} className="flex items-center">
                    <div className="w-1/2">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full ${category.color} mr-2`}></div>
                        <span className="text-sm text-gray-300">{category.category}</span>
                      </div>
                    </div>
                    <div className="w-1/2">
                      <div className="flex justify-between mb-1">
                        <span className="text-xs text-gray-400">{Math.round((category.count / 288) * 100)}%</span>
                        <span className="text-xs text-gray-400">{category.count}</span>
                      </div>
                      <div className="w-full h-2 bg-gray-800 rounded-full">
                        <div 
                          className={`${category.color} h-2 rounded-full`} 
                          style={{ width: `${(category.count / 288) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6">
                <h4 className="text-sm text-gray-300 mb-3">Recent Project Mappings</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-gray-700">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-green-900/30 flex items-center justify-center flex-shrink-0 mr-3">
                        <Target size={16} className="text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm text-white">Climate Data Hub</p>
                        <p className="text-xs text-gray-400">SDG 13 • 12 participants</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">Today</span>
                  </div>
                  
                  <div className="flex items-center justify-between py-2 border-b border-gray-700">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-900/30 flex items-center justify-center flex-shrink-0 mr-3">
                        <Target size={16} className="text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm text-white">EdTech Accessibility</p>
                        <p className="text-xs text-gray-400">SDG 4 • 8 participants</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">Yesterday</span>
                  </div>
                  
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-purple-900/30 flex items-center justify-center flex-shrink-0 mr-3">
                        <Target size={16} className="text-purple-400" />
                      </div>
                      <div>
                        <p className="text-sm text-white">Health Data Analytics</p>
                        <p className="text-xs text-gray-400">SDG 3 • 15 participants</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">2 days ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="px-5 py-3 bg-[#232323] border-t border-gray-800 flex justify-between items-center">
          <button 
            onClick={() => navigate('/admin/sdg-analytics')} 
            className="text-[#E8C848] hover:text-[#E8C848]/80 text-sm font-medium"
          >
            View Full SDG Analytics →
          </button>
          
          <button className="bg-[#E8C848]/20 hover:bg-[#E8C848]/30 text-[#E8C848] px-3 py-1 rounded-lg text-sm transition-colors flex items-center gap-1">
            <BarChart2 size={16} />
            <span>Generate Report</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;