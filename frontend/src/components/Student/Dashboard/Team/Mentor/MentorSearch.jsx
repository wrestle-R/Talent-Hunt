import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../../../../../../context/UserContext';
import { Search, Filter, X, RefreshCw, User } from 'lucide-react';
import MentorCard from './MentorCard';
import MentorApplicationForm from './MentorApplicationForm';

const MentorSearch = ({ teamId, applications, onApplicationAdded }) => {
  const { userData } = useUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    skills: [],
    industries: [],
    availability: 0
  });
  
  // Available options for filters
  const availableSkills = [
    'JavaScript', 'React', 'Angular', 'Vue', 'Node.js', 'Python', 'Java', 'C#',
    'AWS', 'Azure', 'DevOps', 'UI/UX Design', 'Product Management', 'Data Science',
    'Machine Learning', 'Blockchain', 'Mobile Development', 'Database Design'
  ];
  
  const availableIndustries = [
    'Software Development', 'Finance', 'Healthcare', 'Education', 'E-commerce',
    'Gaming', 'Social Media', 'Cybersecurity', 'AI', 'IoT', 'Fintech', 'Edtech'
  ];

  // Fetch all mentors initially
  useEffect(() => {
    const fetchAllMentors = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          'http://localhost:4000/api/teams/mentors/search?limit=20'
        );
        
        if (response.data && response.data.success) {
          setMentors(response.data.mentors || []);
        }
      } catch (err) {
        console.error('Error fetching mentors:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllMentors();
  }, []);

  // Handle search with filters
  const handleSearch = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const queryParams = new URLSearchParams();
      
      if (searchQuery.trim()) {
        queryParams.append('query', searchQuery.trim());
      }
      
      if (filters.skills.length) {
        queryParams.append('skills', filters.skills.join(','));
      }
      
      if (filters.industries.length) {
        queryParams.append('industries', filters.industries.join(','));
      }
      
      if (filters.availability) {
        queryParams.append('availability', filters.availability);
      }
      
      // Add pagination
      queryParams.append('page', 1);
      queryParams.append('limit', 20);
      
      const response = await axios.get(
        `http://localhost:4000/api/teams/mentors/search?${queryParams.toString()}`
      );
      
      if (response.data && response.data.success) {
        setMentors(response.data.mentors || []);
      }
    } catch (err) {
      console.error('Error searching mentors:', err);
    } finally {
      setLoading(false);
    }
  };

  // Open application form for specific mentor
  const handleApplyToMentor = (mentor) => {
    setSelectedMentor(mentor);
    setShowApplicationForm(true);
  };

  // Check if already applied to a mentor
  const hasAppliedToMentor = (mentorId) => {
    return applications.some(app => 
      app.mentorId === mentorId && 
      (app.status === 'pending' || app.status === 'accepted' || app.status === 'waitlisted')
    );
  };

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    if (filterType === 'skills') {
      if (filters.skills.includes(value)) {
        setFilters({
          ...filters,
          skills: filters.skills.filter(skill => skill !== value)
        });
      } else {
        setFilters({
          ...filters,
          skills: [...filters.skills, value]
        });
      }
    } else if (filterType === 'industries') {
      if (filters.industries.includes(value)) {
        setFilters({
          ...filters,
          industries: filters.industries.filter(industry => industry !== value)
        });
      } else {
        setFilters({
          ...filters,
          industries: [...filters.industries, value]
        });
      }
    } else if (filterType === 'availability') {
      setFilters({
        ...filters,
        availability: parseInt(value)
      });
    }
  };

  const clearFilters = () => {
    setFilters({
      skills: [],
      industries: [],
      availability: 0
    });
    setSearchQuery('');
    // Refetch all mentors
    setLoading(true);
    axios.get('http://localhost:4000/api/teams/mentors/search?limit=20')
      .then(response => {
        if (response.data && response.data.success) {
          setMentors(response.data.mentors || []);
        }
      })
      .catch(err => console.error('Error fetching mentors:', err))
      .finally(() => setLoading(false));
  };

  return (
    <div className="text-white">
      <h3 className="font-medium text-lg mb-4">Browse All Mentors</h3>
      
      {/* Search and filter controls */}
      <div className="mb-6">
        <div className="flex gap-2 mb-3">
          <div className="relative flex-grow">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, skills, or expertise..."
              className="w-full p-2 pl-10 bg-[#1A1A1A] border border-gray-800 hover:border-[#E8C848]/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#E8C848] transition-all duration-300"
            />
            <Search size={18} className="absolute left-3 top-2.5 text-[#E8C848]" />
          </div>
          
          <button 
            onClick={handleSearch}
            className="bg-[#E8C848] text-[#121212] px-4 py-2 rounded-lg hover:bg-[#E8C848]/80 transition-all duration-300 shadow-lg shadow-[#E8C848]/30"
          >
            Search
          </button>
          
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg border ${
              showFilters 
                ? 'bg-[#E8C848]/10 border-[#E8C848]/30 text-[#E8C848]' 
                : 'border-gray-800 text-gray-400 hover:border-[#E8C848]/30'
            } transition-all duration-300`}
          >
            <Filter size={20} />
          </button>
          
          {(filters.skills.length > 0 || filters.industries.length > 0 || filters.availability > 0) && (
            <button 
              onClick={clearFilters}
              className="p-2 rounded-lg bg-[#1A1A1A] text-gray-300 hover:text-[#E8C848] flex items-center gap-1 border border-gray-800 hover:border-[#E8C848]/30 transition-all duration-300"
            >
              <RefreshCw size={16} />
              Clear
            </button>
          )}
        </div>
        
        {/* Filter panel */}
        {showFilters && (
          <div className="bg-[#1A1A1A] border border-gray-800 hover:border-[#E8C848]/30 rounded-lg p-4 mb-4 transition-all duration-300">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Skills Filter */}
              <div>
                <h4 className="text-sm font-medium text-white mb-2">Technical Skills</h4>
                <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar">
                  {availableSkills.map(skill => (
                    <label key={skill} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.skills.includes(skill)}
                        onChange={() => handleFilterChange('skills', skill)}
                        className="mr-2 h-4 w-4 accent-[#E8C848] bg-[#121212] border-gray-800"
                      />
                      <span className="text-sm text-gray-300 hover:text-white">{skill}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Industries Filter */}
              <div>
                <h4 className="text-sm font-medium text-white mb-2">Industries</h4>
                <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar">
                  {availableIndustries.map(industry => (
                    <label key={industry} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.industries.includes(industry)}
                        onChange={() => handleFilterChange('industries', industry)}
                        className="mr-2 h-4 w-4 accent-[#E8C848] bg-[#121212] border-gray-800"
                      />
                      <span className="text-sm text-gray-300 hover:text-white">{industry}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Availability Filter */}
              <div>
                <h4 className="text-sm font-medium text-white mb-2">Availability (hours/week)</h4>
                <select
                  value={filters.availability}
                  onChange={(e) => handleFilterChange('availability', e.target.value)}
                  className="w-full p-2 bg-[#121212] border border-gray-800 hover:border-[#E8C848]/30 rounded-lg text-gray-300 focus:outline-none focus:border-[#E8C848] transition-all duration-300"
                >
                  <option value="0">Any availability</option>
                  <option value="1">At least 1 hour</option>
                  <option value="2">At least 2 hours</option>
                  <option value="5">At least 5 hours</option>
                  <option value="10">10+ hours</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="animate-pulse bg-[#1A1A1A] border border-gray-800 rounded-lg p-4 h-48"></div>
          ))}
        </div>
      ) : mentors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mentors.map(mentor => (
            <MentorCard 
              key={mentor._id}
              mentor={mentor}
              hasApplied={hasAppliedToMentor(mentor._id)}
              onApply={() => handleApplyToMentor(mentor)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-[#1A1A1A] border border-gray-800 hover:border-[#E8C848]/30 rounded-lg transition-all duration-300">
          <User size={40} className="mx-auto text-[#E8C848]/30 mb-2" />
          <p className="text-gray-400">No mentors found matching your criteria</p>
          <button 
            onClick={clearFilters}
            className="mt-4 text-[#E8C848] hover:text-[#E8C848]/80 flex items-center gap-1 mx-auto transition-all duration-300"
          >
            <RefreshCw size={16} />
            Clear filters and try again
          </button>
        </div>
      )}
      
      {/* Mentor Application Form Modal */}
      {showApplicationForm && selectedMentor && (
        <MentorApplicationForm
          mentor={selectedMentor}
          teamId={teamId}
          studentId={userData?._id}
          onClose={() => setShowApplicationForm(false)}
          onApplicationSubmitted={(newApp) => {
            setShowApplicationForm(false);
            onApplicationAdded(newApp);
          }}
        />
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #121212;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #E8C848;
          border-radius: 4px;
          opacity: 0.3;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #E8C848;
          opacity: 0.5;
        }
      `}</style>
    </div>
  );
};

export default MentorSearch;