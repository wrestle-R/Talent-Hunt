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
    <div>
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
              className="w-full p-2 pl-10 border border-gray-300 rounded-lg"
            />
            <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
          </div>
          
          <button 
            onClick={handleSearch}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
          >
            Search
          </button>
          
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg border ${
              showFilters ? 'bg-indigo-50 border-indigo-200' : 'border-gray-300'
            }`}
          >
            <Filter size={20} className={showFilters ? 'text-indigo-600' : 'text-gray-500'} />
          </button>
          
          {(filters.skills.length > 0 || filters.industries.length > 0 || filters.availability > 0) && (
            <button 
              onClick={clearFilters}
              className="p-2 rounded-lg bg-gray-100 text-gray-700 flex items-center gap-1"
            >
              <RefreshCw size={16} />
              Clear
            </button>
          )}
        </div>
        
        {/* Filter panel */}
        {showFilters && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Skills Filter */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Technical Skills</h4>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {availableSkills.map(skill => (
                    <label key={skill} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.skills.includes(skill)}
                        onChange={() => handleFilterChange('skills', skill)}
                        className="mr-2 h-4 w-4 text-indigo-600"
                      />
                      <span className="text-sm text-gray-700">{skill}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Industries Filter */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Industries</h4>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {availableIndustries.map(industry => (
                    <label key={industry} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.industries.includes(industry)}
                        onChange={() => handleFilterChange('industries', industry)}
                        className="mr-2 h-4 w-4 text-indigo-600"
                      />
                      <span className="text-sm text-gray-700">{industry}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Availability Filter */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Availability (hours/week)</h4>
                <select
                  value={filters.availability}
                  onChange={(e) => handleFilterChange('availability', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
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
            <div key={index} className="animate-pulse border border-gray-200 rounded-lg p-4 h-48"></div>
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
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <User size={40} className="mx-auto text-gray-300 mb-2" />
          <p className="text-gray-500">No mentors found matching your criteria</p>
          <button 
            onClick={clearFilters}
            className="mt-4 text-indigo-600 hover:text-indigo-800 flex items-center gap-1 mx-auto"
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
    </div>
  );
};

export default MentorSearch;