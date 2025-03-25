import React, { useState } from 'react';
import { CalendarDays, Users, Search, Bell, Shield, Database, FileText, FileBarChart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
      icon: <CalendarDays size={24} className="text-blue-600" />,
      path: '/admin/hackathons',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      stats: { count: 3, label: 'Active' }
    },
    {
      title: 'Review Hackathon Applications',
      description: 'Review and manage hackathon applicants',
      icon: <Users size={24} className="text-indigo-600" />,
      path: '/admin/hackathon_applications',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-700',
      stats: { count: 42, label: 'Pending' }
    },
    {
      title: 'Manage Events',
      description: 'Create and manage workshops and events',
      icon: <Bell size={24} className="text-pink-600" />,
      path: '/admin/events',
      bgColor: 'bg-pink-50',
      textColor: 'text-pink-700',
      stats: { count: 5, label: 'Upcoming' }
    },
    {
      title: 'Analytics Dashboard',
      description: 'Platform metrics and user statistics',
      icon: <Database size={24} className="text-amber-600" />,
      path: '/admin/analytics',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-700'
    },
    {
      title: 'Generate Hacakthon Reports',
      description: 'Create comprehensive student reports',
      icon: <FileBarChart size={24} className="text-emerald-600" />,
      path: '/admin/reports/generate',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-700'
    },
   
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Admin Dashboard Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome back, {userData?.name || 'Admin'}</p>
        </div>
        
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="Search for students..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-600 hover:text-blue-800"
          >
            Go
          </button>
          
          {/* Search Results Dropdown */}
          {showSearchResults && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10">
              {searchResults.length > 0 ? (
                <div>
                  <div className="p-2 border-b border-gray-200">
                    <h3 className="font-medium text-sm text-gray-700">
                      {searchResults.length} student{searchResults.length !== 1 ? 's' : ''} found
                    </h3>
                  </div>
                  {searchResults.map(student => (
                    <div 
                      key={student.id}
                      className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
                      onClick={() => {
                        alert(`Viewing profile for ${student.name}`);
                        setShowSearchResults(false);
                      }}
                    >
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3">
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{student.name}</p>
                          <p className="text-xs text-gray-500">{student.email} • {student.major}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500">
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
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden cursor-pointer"
            onClick={() => navigate(section.path)}
          >
            <div className={`p-5 ${section.bgColor} border-b border-gray-100`}>
              {section.icon}
            </div>
            <div className="p-5">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-gray-800 mb-1">{section.title}</h3>
                {section.stats && (
                  <div className={`${section.bgColor} ${section.textColor} text-xs font-medium px-2 py-1 rounded-full`}>
                    {section.stats.count} {section.stats.label}
                  </div>
                )}
              </div>
              <p className="text-gray-600 text-sm">{section.description}</p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Recent Activity Section */}
      <div className="mt-10 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-200">
          <h2 className="font-bold text-xl text-gray-800">Recent Activity</h2>
        </div>
        <div className="p-5">
          <div className="space-y-4">
            <div className="flex items-center gap-4 pb-3 border-b border-gray-100">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <CalendarDays size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-gray-800">New hackathon <span className="font-medium">AI Innovations 2025</span> created</p>
                <p className="text-xs text-gray-500">Today at 10:30 AM</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 pb-3 border-b border-gray-100">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <FileText size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-gray-800"><span className="font-medium">25 student reports</span> generated and published</p>
                <p className="text-xs text-gray-500">Yesterday at 5:45 PM</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 pb-3 border-b border-gray-100">
              <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0">
                <Bell size={20} className="text-pink-600" />
              </div>
              <div>
                <p className="text-gray-800">New workshop <span className="font-medium">Web3 Fundamentals</span> scheduled</p>
                <p className="text-xs text-gray-500">Yesterday at 2:15 PM</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <Shield size={20} className="text-red-600" />
              </div>
              <div>
                <p className="text-gray-800"><span className="font-medium">3 messages</span> flagged for inappropriate content</p>
                <p className="text-xs text-gray-500">2 days ago</p>
              </div>
            </div>
          </div>
        </div>
        <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
          <button 
            onClick={() => navigate('/admin/activity')} 
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            View All Activity →
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;