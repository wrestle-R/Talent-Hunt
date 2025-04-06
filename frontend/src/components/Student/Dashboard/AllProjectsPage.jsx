import React, { useState, useEffect } from 'react';
import { ArrowLeft, FolderGit2, Search, Filter, SortDesc, SortAsc, RefreshCw, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StudentProjects from './StudentProjects';
import { useUser } from '../../../../context/UserContext';

const AllProjectsPage = () => {
  const navigate = useNavigate();
  const { userData, isLoading: userLoading } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'name'
  const [filterTech, setFilterTech] = useState('');
  const [availableTechTags, setAvailableTechTags] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Extract unique tech stack tags from projects
  useEffect(() => {
    if (userData && userData.projects) {
      const allTags = userData.projects.flatMap(project => project.tech_stack || []);
      const uniqueTags = [...new Set(allTags)];
      setAvailableTechTags(uniqueTags);
    }
  }, [userData]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // This would normally refresh data from the server
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };
  
  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center">
          <button 
            onClick={() => navigate('/student/hero')}
            className="mr-4 p-2 rounded-full bg-[#1A1A1A] text-[#E8C848] hover:bg-[#E8C848]/10 transition-all duration-300"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FolderGit2 size={24} className="text-[#E8C848]" />
            All Projects
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm transition-all duration-300 ${
              isRefreshing 
                ? 'bg-[#1A1A1A] text-gray-500 cursor-not-allowed'
                : 'bg-[#E8C848]/10 text-[#E8C848] hover:bg-[#E8C848]/20'
            }`}
          >
            <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>
      
      {/* Filters and search */}
      <div className="bg-[#1A1A1A] rounded-xl shadow-lg p-4 mb-6 border border-gray-800 hover:border-[#E8C848]/30 transition-all duration-300">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-[#E8C848]" />
            </div>
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full px-3 py-2 bg-[#121212] border border-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8C848] focus:border-[#E8C848] placeholder-gray-500 transition-all duration-300"
            />
          </div>
          
          {/* Sort dropdown */}
          <div className="w-full sm:w-48">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {sortBy.includes('newest') ? 
                  <SortDesc size={16} className="text-[#E8C848]" /> : 
                  <SortAsc size={16} className="text-[#E8C848]" />
                }
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="pl-10 w-full px-3 py-2 bg-[#121212] border border-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8C848] focus:border-[#E8C848] appearance-none transition-all duration-300"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name">By Name</option>
              </select>
            </div>
          </div>
          
          {/* Tech stack filter */}
          <div className="w-full sm:w-52">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Tag size={16} className="text-[#E8C848]" />
              </div>
              <select
                value={filterTech}
                onChange={(e) => setFilterTech(e.target.value)}
                className="pl-10 w-full px-3 py-2 bg-[#121212] border border-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8C848] focus:border-[#E8C848] appearance-none transition-all duration-300"
              >
                <option value="">All Technologies</option>
                {availableTechTags.map(tech => (
                  <option key={tech} value={tech}>{tech}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        {/* Active filters */}
        {(searchTerm || filterTech) && (
          <div className="mt-3 flex items-center flex-wrap gap-2">
            <span className="text-xs text-gray-400">Active filters:</span>
            {searchTerm && (
              <div className="bg-[#E8C848]/10 text-[#E8C848] text-xs px-2 py-1 rounded-full flex items-center">
                <span>"{searchTerm}"</span>
                <button 
                  onClick={() => setSearchTerm('')}
                  className="ml-1 text-[#E8C848]/80 hover:text-[#E8C848] transition-colors"
                >
                  &times;
                </button>
              </div>
            )}
            {filterTech && (
              <div className="bg-[#E8C848]/10 text-[#E8C848] text-xs px-2 py-1 rounded-full flex items-center">
                <span>{filterTech}</span>
                <button 
                  onClick={() => setFilterTech('')}
                  className="ml-1 text-[#E8C848]/80 hover:text-[#E8C848] transition-colors"
                >
                  &times;
                </button>
              </div>
            )}
            {(searchTerm || filterTech) && (
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setFilterTech('');
                }}
                className="text-xs text-gray-400 hover:text-[#E8C848] transition-colors"
              >
                Clear all
              </button>
            )}
          </div>
        )}
      </div>
      
      {/* Loading state */}
      {userLoading ? (
        <div className="bg-[#1A1A1A] rounded-xl shadow-lg p-6 border border-gray-800">
          <div className="flex justify-between items-center mb-4">
            <div className="h-8 bg-[#121212] rounded w-48 animate-pulse"></div>
            <div className="h-8 bg-[#121212] rounded w-32 animate-pulse"></div>
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="animate-pulse border border-gray-800 rounded-lg p-4">
                <div className="h-4 bg-[#121212] rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-[#121212] rounded w-full mb-3"></div>
                <div className="flex mb-3">
                  <div className="h-6 bg-[#121212] rounded w-20 mr-2"></div>
                  <div className="h-6 bg-[#121212] rounded w-20 mr-2"></div>
                </div>
                <div className="flex justify-end">
                  <div className="h-8 bg-[#121212] rounded w-24"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <StudentProjects 
          userData={userData} 
          isInDashboard={false}
          searchFilter={searchTerm}
          techFilter={filterTech}
          sortOrder={sortBy}
        />
      )}
    </div>
  );
};

export default AllProjectsPage;