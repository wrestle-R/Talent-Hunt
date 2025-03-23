import React, { useState } from 'react';
import { Users, Search, Bell, Shield, Flag, File, Ban, MessageSquare, UserCog, UserX, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ModeratorDashboard = ({ userData }) => {
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
      title: 'Team Dissolution',
      description: 'Review team dissolution requests',
      icon: <UserX size={24} className="text-purple-600" />,
      path: '/moderator/teams/dissolution',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
      stats: { count: 3, label: 'Requests' }
    },
    {
      title: 'Student Reports',
      description: 'Generate and review student activity reports',
      icon: <File size={24} className="text-emerald-600" />,
      path: '/moderator/reports',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-700'
    },
    {
      title: 'Verification Requests',
      description: 'Review and approve verification requests',
      icon: <UserCheck size={24} className="text-blue-600" />,
      path: '/moderator/verifications',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      stats: { count: 8, label: 'Pending' }
    }
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Moderator Dashboard Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Moderator Dashboard</h1>
          <p className="text-gray-600">Welcome back, {userData?.name || 'Moderator'}</p>
        </div>
        
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="Search for users..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-indigo-600 hover:text-indigo-800"
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
                      {searchResults.length} user{searchResults.length !== 1 ? 's' : ''} found
                    </h3>
                  </div>
                  {searchResults.map(student => (
                    <div 
                      key={student.id}
                      className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
                      onClick={() => {
                        // In a real app, navigate to student profile
                        alert(`Viewing profile for ${student.name}`);
                        setShowSearchResults(false);
                      }}
                    >
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3">
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
      
      {/* Recent Reports Section */}
      <div className="mt-10 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-200">
          <h2 className="font-bold text-xl text-gray-800">Recent Reports</h2>
        </div>
        <div className="p-5">
          <div className="space-y-4">
            <div className="flex items-center gap-4 pb-3 border-b border-gray-100">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <Flag size={20} className="text-red-600" />
              </div>
              <div>
                <p className="text-gray-800">Message reported by <span className="font-medium">Maria Garcia</span> for harassment</p>
                <p className="text-xs text-gray-500">Today at 10:30 AM</p>
              </div>
              <div className="ml-auto">
                <button className="bg-red-50 text-red-700 px-3 py-1 rounded-lg text-sm">
                  Review
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-4 pb-3 border-b border-gray-100">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                <UserCog size={20} className="text-amber-600" />
              </div>
              <div>
                <p className="text-gray-800"><span className="font-medium">Team Swift Coders</span> requested dissolution</p>
                <p className="text-xs text-gray-500">Yesterday at 5:45 PM</p>
              </div>
              <div className="ml-auto">
                <button className="bg-amber-50 text-amber-700 px-3 py-1 rounded-lg text-sm">
                  Review
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-4 pb-3 border-b border-gray-100">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                <Shield size={20} className="text-purple-600" />
              </div>
              <div>
                <p className="text-gray-800">Account verification request from <span className="font-medium">David Chen</span></p>
                <p className="text-xs text-gray-500">Yesterday at 2:15 PM</p>
              </div>
              <div className="ml-auto">
                <button className="bg-purple-50 text-purple-700 px-3 py-1 rounded-lg text-sm">
                  Verify
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                <Ban size={20} className="text-indigo-600" />
              </div>
              <div>
                <p className="text-gray-800"><span className="font-medium">2 accounts</span> flagged for spam activity</p>
                <p className="text-xs text-gray-500">2 days ago</p>
              </div>
              <div className="ml-auto">
                <button className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg text-sm">
                  Review
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
          <button 
            onClick={() => navigate('/moderator/reports/all')} 
            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
          >
            View All Reports →
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModeratorDashboard;