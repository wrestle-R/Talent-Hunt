import React, { useState } from 'react';
import { CalendarDays, Users, Search, Bell, Shield, Database, FileText, FileBarChart } from 'lucide-react';
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

  // Dashboard sections/cards - streamlined for admin
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
      
      {/* Recent Activity Section */}
      <div className="mt-10 bg-[#1A1A1A] rounded-xl shadow-lg border border-gray-800 overflow-hidden">
        <div className="p-5 border-b border-gray-800">
          <h2 className="font-bold text-xl text-white font-montserrat">Recent Activity</h2>
        </div>
        <div className="p-5">
          <div className="space-y-4">
            <div className="flex items-center gap-4 pb-3 border-b border-gray-800">
              <div className="w-10 h-10 rounded-full bg-[#E8C848]/20 flex items-center justify-center flex-shrink-0">
                <CalendarDays size={20} className="text-[#E8C848]" />
              </div>
              <div>
                <p className="text-white">New hackathon <span className="font-medium">AI Innovations 2025</span> created</p>
                <p className="text-xs text-gray-400">Today at 10:30 AM</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 pb-3 border-b border-gray-800">
              <div className="w-10 h-10 rounded-full bg-[#E8C848]/20 flex items-center justify-center flex-shrink-0">
                <FileText size={20} className="text-[#E8C848]" />
              </div>
              <div>
                <p className="text-white"><span className="font-medium">25 student reports</span> generated and published</p>
                <p className="text-xs text-gray-400">Yesterday at 5:45 PM</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 pb-3 border-b border-gray-800">
              <div className="w-10 h-10 rounded-full bg-[#E8C848]/20 flex items-center justify-center flex-shrink-0">
                <Bell size={20} className="text-[#E8C848]" />
              </div>
              <div>
                <p className="text-white">New workshop <span className="font-medium">Web3 Fundamentals</span> scheduled</p>
                <p className="text-xs text-gray-400">Yesterday at 2:15 PM</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#E8C848]/20 flex items-center justify-center flex-shrink-0">
                <Shield size={20} className="text-[#E8C848]" />
              </div>
              <div>
                <p className="text-white"><span className="font-medium">3 messages</span> flagged for inappropriate content</p>
                <p className="text-xs text-gray-400">2 days ago</p>
              </div>
            </div>
          </div>
        </div>
        <div className="px-5 py-3 bg-[#232323] border-t border-gray-800">
          <button 
            onClick={() => navigate('/admin/activity')} 
            className="text-[#E8C848] hover:text-[#E8C848]/80 text-sm font-medium"
          >
            View All Activity →
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;