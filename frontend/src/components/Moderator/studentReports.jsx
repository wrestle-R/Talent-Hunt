import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Download, PieChart, BarChart3, Users, BookOpen, Award, Code, Calendar, AlertTriangle } from 'lucide-react';
import { 
  PieChart as RechartsAppPieChart, 
  Pie, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  Cell,
  LineChart,
  Line
} from 'recharts';

const StudentReports = () => {
  // State variables
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [filterOptions, setFilterOptions] = useState({
    skills: [],
    projectStatus: 'All',
    experienceLevel: 'All',
    lookingForTeammates: null,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState(null);

  // Colors for charts
  const COLORS = ['#E8C848', '#4338CA', '#EC4899', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444'];
  const PROJECT_STATUS_COLORS = {
    'Pending': '#F59E0B',
    'Approved': '#10B981',
    'Rejected': '#EF4444',
    'In Progress': '#4338CA',
  };

  // Fetch students data
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/student/all-students');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Fetched students:', data); // Debugging log
        if (data.success && Array.isArray(data.students)) {
          setStudents(data.students);
          setFilteredStudents(data.students);
        } else {
          throw new Error('Invalid data format received');
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching students:', error);
        setError('Failed to fetch student data. Please try again later.');
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  // Analytics data preparation - Project status distribution
  const projectStatusData = useMemo(() => {
    if (!students.length) return [];
    
    const statusCounts = {};
    let totalProjects = 0;
    
    students.forEach(student => {
      if (student.projects && Array.isArray(student.projects)) {
        student.projects.forEach(project => {
          if (!project.isDeleted) {
            const status = project.status?.charAt(0).toUpperCase() + project.status?.slice(1).toLowerCase() || 'Pending';
            statusCounts[status] = (statusCounts[status] || 0) + 1;
            totalProjects++;
          }
        });
      }
    });
    
    return Object.keys(statusCounts).map(status => ({
      name: status,
      value: statusCounts[status],
      percentage: Math.round((statusCounts[status] / totalProjects) * 100)
    }));
  }, [students]);

  // Skills distribution data
  const skillsDistributionData = useMemo(() => {
    if (!students.length) return [];
    
    const skillsCount = {};
    
    students.forEach(student => {
      if (student.skills && student.skills.length) {
        student.skills.forEach(skill => {
          skillsCount[skill] = (skillsCount[skill] || 0) + 1;
        });
      }
    });
    
    return Object.entries(skillsCount)
      .map(([skill, count]) => ({ name: skill, value: count }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10); // Top 10 skills
  }, [students]);

  // Experience level distribution
  const experienceLevelData = useMemo(() => {
    if (!students.length) return [];
    
    const experienceCounts = {
      'Beginner (0)': 0,
      'Novice (1-2)': 0,
      'Intermediate (3-5)': 0,
      'Advanced (6+)': 0
    };
    
    students.forEach(student => {
      const expCount = student.hackathon_prev_experiences || 0;
      
      if (expCount === 0) experienceCounts['Beginner (0)']++;
      else if (expCount <= 2) experienceCounts['Novice (1-2)']++;
      else if (expCount <= 5) experienceCounts['Intermediate (3-5)']++;
      else experienceCounts['Advanced (6+)']++;
    });
    
    return Object.entries(experienceCounts).map(([level, count]) => ({
      name: level,
      value: count
    }));
  }, [students]);

  // Monthly student registrations
  const registrationTrendsData = useMemo(() => {
    if (!students.length) return [];
    
    const monthData = {};
    
    students.forEach(student => {
      if (student.createdAt) {
        const date = new Date(student.createdAt);
        const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
        
        monthData[monthYear] = (monthData[monthYear] || 0) + 1;
      }
    });
    
    // Convert to array and sort by date
    return Object.entries(monthData)
      .map(([month, count]) => ({ name: month, registrations: count }))
      .sort((a, b) => {
        const [aMonth, aYear] = a.name.split('/').map(Number);
        const [bMonth, bYear] = b.name.split('/').map(Number);
        
        if (aYear !== bYear) return aYear - bYear;
        return aMonth - bMonth;
      });
  }, [students]);

  // Teammate search data
  const teammateSearchData = useMemo(() => {
    if (!students.length) return [];
    
    const lookingCount = students.filter(student => 
      student.teammate_search && student.teammate_search.looking_for_teammates
    ).length;
    
    const notLookingCount = students.length - lookingCount;
    
    return [
      { name: 'Looking for Teammates', value: lookingCount },
      { name: 'Not Looking', value: notLookingCount }
    ];
  }, [students]);

  // Apply filters and search
  useEffect(() => {
    if (!students.length) return;

    let result = [...students];
    
    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(student => 
        student.name?.toLowerCase().includes(term) || 
        student.email?.toLowerCase().includes(term) ||
        (student.education?.institution && student.education.institution.toLowerCase().includes(term))
      );
    }
    
    // Apply filters
    if (filterOptions.skills.length > 0) {
      result = result.filter(student => 
        student.skills?.some(skill => 
          filterOptions.skills.includes(skill)
        )
      );
    }
    
    if (filterOptions.projectStatus !== 'All') {
      result = result.filter(student => 
        student.projects?.some(project => 
          project.status.toLowerCase() === filterOptions.projectStatus.toLowerCase()
        )
      );
    }
    
    if (filterOptions.experienceLevel !== 'All') {
      result = result.filter(student => {
        const expCount = student.hackathon_prev_experiences || 0;
        
        switch(filterOptions.experienceLevel) {
          case 'Beginner':
            return expCount === 0;
          case 'Novice':
            return expCount >= 1 && expCount <= 2;
          case 'Intermediate':
            return expCount >= 3 && expCount <= 5;
          case 'Advanced':
            return expCount >= 6;
          default:
            return true;
        }
      });
    }
    
    if (filterOptions.lookingForTeammates !== null) {
      result = result.filter(student => 
        student.teammate_search?.looking_for_teammates === filterOptions.lookingForTeammates
      );
    }
    
    setFilteredStudents(result);
  }, [students, searchTerm, filterOptions]);

  // All unique skills for filter dropdown
  const allSkills = useMemo(() => {
    if (!students.length) return [];
    
    const skillsSet = new Set();
    
    students.forEach(student => {
      if (student.skills && student.skills.length) {
        student.skills.forEach(skill => skillsSet.add(skill));
      }
    });
    
    return Array.from(skillsSet).sort();
  }, [students]);

  // Toggle skill selection in filter
  const toggleSkillFilter = (skill) => {
    setFilterOptions(prev => {
      if (prev.skills.includes(skill)) {
        return { ...prev, skills: prev.skills.filter(s => s !== skill) };
      } else {
        return { ...prev, skills: [...prev.skills, skill] };
      }
    });
  };

  // Reset all filters
  const resetFilters = () => {
    setFilterOptions({
      skills: [],
      projectStatus: 'All',
      experienceLevel: 'All',
      lookingForTeammates: null,
    });
    setSearchTerm('');
  };

  // Calculate detailed analysis for the selected student
  const studentAnalysis = useMemo(() => {
    if (!selectedStudent) return null;

    const analysis = {
      totalProjects: selectedStudent.projects?.length || 0,
      projectsByStatus: {},
      skillsCount: selectedStudent.skills?.length || 0,
      experienceLevel: '',
      teammateNetworkSize: selectedStudent.teammates?.length || 0,
      mentorships: selectedStudent.mentors?.length || 0,
      registrationDate: new Date(selectedStudent.createdAt).toLocaleDateString(),
      lookingForTeammates: selectedStudent.teammate_search?.looking_for_teammates || false,
    };

    // Calculate project status distribution
    if (selectedStudent.projects?.length) {
      selectedStudent.projects.forEach(project => {
        const status = project.status.charAt(0).toUpperCase() + project.status.slice(1).toLowerCase();
        analysis.projectsByStatus[status] = (analysis.projectsByStatus[status] || 0) + 1;
      });
    }

    // Determine experience level
    const expCount = selectedStudent.hackathon_prev_experiences || 0;
    if (expCount === 0) analysis.experienceLevel = 'Beginner';
    else if (expCount <= 2) analysis.experienceLevel = 'Novice';
    else if (expCount <= 5) analysis.experienceLevel = 'Intermediate';
    else analysis.experienceLevel = 'Advanced';

    return analysis;
  }, [selectedStudent]);

  // Export data as CSV
  const exportCSV = () => {
    // Create headers
    const headers = ['Name', 'Email', 'Institution', 'Graduation Year', 'Projects Count', 'Skills', 'Experience Level'];
    
    // Create rows
    const rows = filteredStudents.map(student => [
      student.name || '',
      student.email || '',
      student.education?.institution || '',
      student.education?.graduation_year || '',
      student.projects?.length || 0,
      student.skills?.join(', ') || '',
      student.hackathon_prev_experiences || 0
    ]);
    
    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `student-reports-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-12 px-4 bg-[#111111] text-white text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E8C848] mx-auto"></div>
        <p className="mt-4 text-gray-400">Loading student data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-12 px-4 bg-[#111111] text-white text-center">
        <AlertTriangle size={48} className="text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">Error Loading Data</h2>
        <p className="text-gray-400">{error}</p>
        <button 
          className="mt-4 bg-[#E8C848] text-black px-4 py-2 rounded-lg hover:bg-[#E8C848]/80 transition-colors"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 bg-[#111111] font-inter">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white font-montserrat">Student Reports & Analytics</h1>
          <p className="text-gray-400">Comprehensive data on {students.length} registered students</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-700 bg-[#1A1A1A] text-gray-300 hover:bg-[#222222] transition-colors"
          >
            <Filter size={18} />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
          
          <button 
            onClick={exportCSV}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#E8C848] text-black hover:bg-[#E8C848]/80 transition-colors"
          >
            <Download size={18} />
            Export Data
          </button>
        </div>
      </div>
      
      {/* Search and Filter Section */}
      <div className="mb-8">
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Search students by name, email, or institution..."
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#E8C848] bg-[#1A1A1A] text-gray-300 placeholder-gray-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        </div>
        
        {/* Extended filters */}
        {showFilters && (
          <div className="mt-4 p-4 bg-[#1A1A1A] rounded-lg border border-gray-800">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Project Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Project Status</label>
                <select
                  className="w-full px-3 py-2 rounded-lg border border-gray-700 bg-[#111111] text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#E8C848]"
                  value={filterOptions.projectStatus}
                  onChange={(e) => setFilterOptions({...filterOptions, projectStatus: e.target.value})}
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                  <option value="In Progress">In Progress</option>
                </select>
              </div>
              
              {/* Experience Level Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Experience Level</label>
                <select
                  className="w-full px-3 py-2 rounded-lg border border-gray-700 bg-[#111111] text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#E8C848]"
                  value={filterOptions.experienceLevel}
                  onChange={(e) => setFilterOptions({...filterOptions, experienceLevel: e.target.value})}
                >
                  <option value="All">All Levels</option>
                  <option value="Beginner">Beginner (0 hackathons)</option>
                  <option value="Novice">Novice (1-2 hackathons)</option>
                  <option value="Intermediate">Intermediate (3-5 hackathons)</option>
                  <option value="Advanced">Advanced (6+ hackathons)</option>
                </select>
              </div>
              
              {/* Looking for teammates */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Teammate Search</label>
                <select
                  className="w-full px-3 py-2 rounded-lg border border-gray-700 bg-[#111111] text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#E8C848]"
                  value={filterOptions.lookingForTeammates === null ? "" : filterOptions.lookingForTeammates.toString()}
                  onChange={(e) => setFilterOptions({
                    ...filterOptions, 
                    lookingForTeammates: e.target.value === "" ? null : e.target.value === "true"
                  })}
                >
                  <option value="">All Students</option>
                  <option value="true">Looking for Teammates</option>
                  <option value="false">Not Looking</option>
                </select>
              </div>
            </div>
            
            {/* Skills filter */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-400 mb-2">Skills (Select multiple)</label>
              <div className="flex flex-wrap gap-2">
                {allSkills.slice(0, 15).map((skill) => (
                  <button
                    key={skill}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      filterOptions.skills.includes(skill)
                        ? 'bg-[#E8C848] text-black'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                    onClick={() => toggleSkillFilter(skill)}
                  >
                    {skill}
                  </button>
                ))}
                {allSkills.length > 15 && (
                  <span className="text-xs text-gray-500 self-center">+{allSkills.length - 15} more</span>
                )}
              </div>
            </div>
            
            {/* Reset filters button */}
            <div className="mt-4 flex justify-end">
              <button
                className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                onClick={resetFilters}
              >
                Reset All Filters
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Dashboard & Stats Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Project Status Distribution */}
        <div className="bg-[#1A1A1A] rounded-xl p-5 border border-gray-800">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={20} className="text-[#E8C848]" />
            <h2 className="text-lg font-bold text-white">Project Status Distribution</h2>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projectStatusData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="name" stroke="#999" />
                <YAxis stroke="#999" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#222', border: '1px solid #444', borderRadius: '4px' }}
                  formatter={(value, name, props) => [`${value} (${props.payload.percentage}%)`, 'Projects']}
                />
                <Bar dataKey="value" fill="#E8C848">
                  {projectStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PROJECT_STATUS_COLORS[entry.name] || '#E8C848'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Skills Distribution */}
        <div className="bg-[#1A1A1A] rounded-xl p-5 border border-gray-800">
          <div className="flex items-center gap-2 mb-4">
            <Code size={20} className="text-[#E8C848]" />
            <h2 className="text-lg font-bold text-white">Top Skills Distribution</h2>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={skillsDistributionData} 
                layout="vertical"
                margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis type="number" stroke="#999" />
                <YAxis dataKey="name" type="category" stroke="#999" width={80} />
                <Tooltip contentStyle={{ backgroundColor: '#222', border: '1px solid #444', borderRadius: '4px' }} />
                <Bar dataKey="value" fill="#4338CA" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Experience Level Distribution */}
        <div className="bg-[#1A1A1A] rounded-xl p-5 border border-gray-800">
          <div className="flex items-center gap-2 mb-4">
            <Award size={20} className="text-[#E8C848]" />
            <h2 className="text-lg font-bold text-white">Experience Level Distribution</h2>
          </div>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsAppPieChart>
                <Pie
                  data={experienceLevelData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {experienceLevelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#222', border: '1px solid #444', borderRadius: '4px' }} />
                <Legend />
              </RechartsAppPieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Registration Trends */}
        <div className="bg-[#1A1A1A] rounded-xl p-5 border border-gray-800">
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={20} className="text-[#E8C848]" />
            <h2 className="text-lg font-bold text-white">Monthly Registration Trends</h2>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={registrationTrendsData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="name" stroke="#999" />
                <YAxis stroke="#999" />
                <Tooltip contentStyle={{ backgroundColor: '#222', border: '1px solid #444', borderRadius: '4px' }} />
                <Line type="monotone" dataKey="registrations" stroke="#E8C848" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Secondary Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Teammate Search Status */}
        <div className="bg-[#1A1A1A] rounded-xl p-5 border border-gray-800">
          <div className="flex items-center gap-2 mb-4">
            <Users size={20} className="text-[#E8C848]" />
            <h2 className="text-lg font-bold text-white">Teammate Search Status</h2>
          </div>
          <div className="h-48 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsAppPieChart>
                <Pie
                  data={teammateSearchData}
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  <Cell fill="#10B981" />
                  <Cell fill="#6B7280" />
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#222', border: '1px solid #444', borderRadius: '4px' }} />
                <Legend />
              </RechartsAppPieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Summary Stats */}
        <div className="bg-[#1A1A1A] rounded-xl p-5 border border-gray-800">
          <div className="flex items-center gap-2 mb-4">
            <PieChart size={20} className="text-[#E8C848]" />
            <h2 className="text-lg font-bold text-white">Summary Statistics</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#111111] rounded-lg p-4 border border-gray-800">
              <p className="text-gray-400 text-sm">Total Students</p>
              <p className="text-white text-2xl font-bold">{students.length}</p>
            </div>
            
            <div className="bg-[#111111] rounded-lg p-4 border border-gray-800">
              <p className="text-gray-400 text-sm">Total Projects</p>
              <p className="text-white text-2xl font-bold">
                {Array.isArray(students) 
                  ? students.reduce((sum, s) => sum + (s.projects?.length || 0), 0) 
                  : 0}
              </p>
            </div>
            
            <div className="bg-[#111111] rounded-lg p-4 border border-gray-800">
              <p className="text-gray-400 text-sm">Avg. Skills</p>
              <p className="text-white text-2xl font-bold">
                {Math.round(students.reduce((sum, s) => sum + (s.skills?.length || 0), 0) / (students.length || 1))}
              </p>
            </div>
            
            <div className="bg-[#111111] rounded-lg p-4 border border-gray-800">
              <p className="text-gray-400 text-sm">Active Teams</p>
              <p className="text-white text-2xl font-bold">
                {students.filter(s => (s.teammates?.length || 0) > 0).length}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Students List Section */}
      <div className="bg-[#1A1A1A] rounded-xl border border-gray-800 overflow-hidden">
        <div className="p-5 border-b border-gray-800">
          <h2 className="text-lg font-bold text-white">
            Student List ({filteredStudents.length} {filteredStudents.length === 1 ? 'result' : 'results'})
          </h2>
        </div>
        
        {filteredStudents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead className="bg-[#111111]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 tracking-wider">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 tracking-wider">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 tracking-wider">Institution</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 tracking-wider">Projects</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 tracking-wider">Skills</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 tracking-wider">Team Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredStudents.map((student, index) => (
                  <tr key={student._id || index} className="hover:bg-[#111111] transition-colors">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-[#E8C848]/20 text-[#E8C848] flex items-center justify-center">
                          {student.name ? student.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-white">{student.name || 'Unnamed Student'}</p>
                          <p className="text-xs text-gray-500">
                            {student.hackathon_prev_experiences ? 
                              `${student.hackathon_prev_experiences} hackathons` : 
                              'No experience'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-300">{student.email}</p>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-300">
                        {student.education?.institution || 'Not specified'}
                      </p>
                      {student.education?.graduation_year && (
                        <p className="text-xs text-gray-500">
                          Class of {student.education.graduation_year}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <p className="text-sm text-gray-300">
                          {student.projects?.length || 0} {student.projects?.length === 1 ? 'project' : 'projects'}
                        </p>
                        {student.projects && student.projects.length > 0 && (
                          <div className="flex mt-1 gap-1 flex-wrap">
                            {Object.entries(
                              student.projects.reduce((acc, project) => {
                                const status = project.status.charAt(0).toUpperCase() + project.status.slice(1).toLowerCase();
                                acc[status] = (acc[status] || 0) + 1;
                                return acc;
                              }, {})
                            ).map(([status, count], i) => (
                              <span 
                                key={i} 
                                className={`px-1.5 py-0.5 text-xs rounded-full ${
                                  status === 'Approved' ? 'bg-green-900/30 text-green-400' :
                                  status === 'Pending' ? 'bg-amber-900/30 text-amber-400' :
                                  status === 'Rejected' ? 'bg-red-900/30 text-red-400' :
                                  'bg-indigo-900/30 text-indigo-400'
                                }`}
                              >
                                {count} {status}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {student.skills && student.skills.length > 0 ? 
                          (student.skills.slice(0, 3).map((skill, i) => (
                            <span 
                              key={i} 
                              className="bg-gray-800 text-gray-300 px-2 py-0.5 text-xs rounded-full"
                            >
                              {skill}
                            </span>
                          ))) 
                          : 
                          (<span className="text-sm text-gray-500">No skills listed</span>)
                        }
                        {student.skills && student.skills.length > 3 && (
                          <span className="text-xs text-gray-500">+{student.skills.length - 3} more</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {student.teammate_search?.looking_for_teammates ? (
                        <span className="bg-green-900/30 text-green-400 text-xs px-2 py-1 rounded-full">
                          Looking for teammates
                        </span>
                      ) : (
                        <span className="bg-gray-800 text-gray-400 text-xs px-2 py-1 rounded-full">
                          Not looking
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => setSelectedStudent(student)}
                        className="text-[#E8C848] hover:text-[#E8C848]/80 transition-colors"
                      >
                        View Analysis
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-gray-500">
            <BookOpen size={48} className="mx-auto mb-4 opacity-30" />
            <h3 className="text-lg font-medium text-gray-400">No students match your search</h3>
            <p className="mt-2">Try adjusting your search terms or filters</p>
            <button 
              onClick={resetFilters}
              className="mt-4 text-[#E8C848] hover:text-[#E8C848]/80 transition-colors"
            >
              Reset all filters
            </button>
          </div>
        )}
      </div>
      
      {/* Student Analysis Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-10 p-4">
          <div className="bg-[#1A1A1A] rounded-xl border border-gray-800 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-gray-800 flex justify-between items-center sticky top-0 bg-[#1A1A1A] z-10">
              <h2 className="text-xl font-bold text-white">
                Student Analysis: {selectedStudent.name}
              </h2>
              <button 
                onClick={() => setSelectedStudent(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="p-5">
              {/* Student Profile Section */}
              <div className="flex flex-col md:flex-row gap-6 mb-8">
                <div className="md:w-1/3">
                  <div className="bg-[#111111] rounded-lg p-5 border border-gray-800">
                    <div className="flex items-center mb-4">
                      <div className="h-16 w-16 rounded-full bg-[#E8C848]/20 text-[#E8C848] flex items-center justify-center text-2xl font-bold">
                        {selectedStudent.name ? selectedStudent.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-bold text-white">{selectedStudent.name}</h3>
                        <p className="text-gray-400">{selectedStudent.email}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3 mt-4">
                      <div>
                        <p className="text-sm text-gray-500">Education</p>
                        <p className="text-gray-300">
                          {selectedStudent.education?.institution 
                            ? `${selectedStudent.education.institution}${selectedStudent.education.graduation_year 
                              ? ` (Class of ${selectedStudent.education.graduation_year})` 
                              : ''}`
                            : 'Not specified'
                          }
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500">Location</p>
                        <p className="text-gray-300">
                          {selectedStudent.location?.city && selectedStudent.location?.country
                            ? `${selectedStudent.location.city}, ${selectedStudent.location.country}`
                            : 'Not specified'
                          }
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500">Profile Created</p>
                        <p className="text-gray-300">{studentAnalysis.registrationDate}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500">Experience Level</p>
                        <p className="text-gray-300">{studentAnalysis.experienceLevel}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="md:w-2/3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-[#111111] rounded-lg p-4 border border-gray-800">
                      <h4 className="text-lg font-medium text-white mb-2">Skills ({studentAnalysis.skillsCount})</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedStudent.skills && selectedStudent.skills.length > 0 ? (
                          selectedStudent.skills.map((skill, i) => (
                            <span key={i} className="bg-gray-800 text-gray-300 px-2 py-1 text-sm rounded-full">
                              {skill}
                            </span>
                          ))
                        ) : (
                          <p className="text-gray-500">No skills listed</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="bg-[#111111] rounded-lg p-4 border border-gray-800">
                      <h4 className="text-lg font-medium text-white mb-2">Areas of Interest</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedStudent.interests && selectedStudent.interests.length > 0 ? (
                          selectedStudent.interests.map((interest, i) => (
                            <span key={i} className="bg-[#E8C848]/20 text-[#E8C848] px-2 py-1 text-sm rounded-full">
                              {interest}
                            </span>
                          ))
                        ) : (
                          <p className="text-gray-500">No interests listed</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="bg-[#111111] rounded-lg p-4 border border-gray-800">
                      <h4 className="text-lg font-medium text-white mb-2">Team Status</h4>
                      <div>
                        <p className="text-sm text-gray-400">
                          <span className="font-medium">Network Size:</span> {studentAnalysis.teammateNetworkSize} teammates
                        </p>
                        
                        <div className="mt-2">
                          {studentAnalysis.lookingForTeammates ? (
                            <div className="flex items-center">
                              <span className="w-2 h-2 rounded-full bg-green-400 mr-2"></span>
                              <span className="text-green-400">Actively looking for teammates</span>
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <span className="w-2 h-2 rounded-full bg-gray-400 mr-2"></span>
                              <span className="text-gray-400">Not looking for teammates</span>
                            </div>
                          )}
                        </div>
                        
                        {selectedStudent.teammate_search?.purpose && studentAnalysis.lookingForTeammates && (
                          <p className="mt-2 text-sm text-gray-300">
                            Purpose: <span className="text-[#E8C848]">{selectedStudent.teammate_search.purpose}</span>
                            {selectedStudent.teammate_search.urgency_level && (
                              <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-gray-800">
                                {selectedStudent.teammate_search.urgency_level} priority
                              </span>
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="bg-[#111111] rounded-lg p-4 border border-gray-800">
                      <h4 className="text-lg font-medium text-white mb-2">Mentorship</h4>
                      {selectedStudent.mentorship_interests?.seeking_mentor ? (
                        <div>
                          <div className="flex items-center">
                            <span className="w-2 h-2 rounded-full bg-purple-400 mr-2"></span>
                            <span className="text-purple-400">Seeking mentorship</span>
                          </div>
                          
                          {selectedStudent.mentorship_interests.mentor_topics && 
                           selectedStudent.mentorship_interests.mentor_topics.length > 0 && (
                            <div className="mt-2">
                              <p className="text-sm text-gray-400">Topics of interest:</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {selectedStudent.mentorship_interests.mentor_topics.map((topic, i) => (
                                  <span key={i} className="bg-purple-900/30 text-purple-400 px-2 py-0.5 text-xs rounded-full">
                                    {topic}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <span className="w-2 h-2 rounded-full bg-gray-400 mr-2"></span>
                          <span className="text-gray-400">Not seeking mentorship</span>
                        </div>
                      )}
                      
                      <p className="mt-2 text-sm text-gray-400">
                        <span className="font-medium">Mentorship connections:</span> {studentAnalysis.mentorships}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Projects Analysis */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-white mb-4">Projects Analysis</h3>
                
                {studentAnalysis.totalProjects > 0 ? (
                  <div className="space-y-6">
                    {/* Projects Summary */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      <div className="bg-[#111111] rounded-lg p-4 border border-gray-800">
                        <p className="text-gray-400 text-sm">Total Projects</p>
                        <p className="text-white text-2xl font-bold">{studentAnalysis.totalProjects}</p>
                      </div>
                      
                      {Object.entries(studentAnalysis.projectsByStatus).map(([status, count], index) => (
                        <div 
                          key={index} 
                          className="bg-[#111111] rounded-lg p-4 border border-gray-800"
                        >
                          <p className="text-gray-400 text-sm">{status} Projects</p>
                          <p className={`text-2xl font-bold ${
                            status === 'Approved' ? 'text-green-400' :
                            status === 'Pending' ? 'text-amber-400' :
                            status === 'Rejected' ? 'text-red-400' :
                            'text-indigo-400'
                          }`}>
                            {count}
                          </p>
                        </div>
                      ))}
                    </div>
                    
                    {/* Projects Breakdown */}
                    <div className="bg-[#111111] rounded-lg border border-gray-800 overflow-hidden">
                      <div className="p-4 border-b border-gray-800">
                        <h4 className="font-medium text-white">Projects Breakdown</h4>
                      </div>
                      <div className="divide-y divide-gray-800">
                        {selectedStudent.projects && selectedStudent.projects.map((project, index) => (
                          <div key={index} className="p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h5 className="font-medium text-white">{project.name || 'Unnamed Project'}</h5>
                                <p className="text-sm text-gray-400 mt-1">{project.description || 'No description provided'}</p>
                              </div>
                              <div>
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  project.status.toLowerCase() === 'approved' ? 'bg-green-900/30 text-green-400' :
                                  project.status.toLowerCase() === 'pending' ? 'bg-amber-900/30 text-amber-400' :
                                  project.status.toLowerCase() === 'rejected' ? 'bg-red-900/30 text-red-400' :
                                  'bg-indigo-900/30 text-indigo-400'
                                }`}>
                                  {project.status.charAt(0).toUpperCase() + project.status.slice(1).toLowerCase()}
                                </span>
                              </div>
                            </div>
                            
                            {project.tech_stack && project.tech_stack.length > 0 && (
                              <div className="mt-2">
                                <p className="text-xs text-gray-500">Tech Stack:</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {project.tech_stack.map((tech, i) => (
                                    <span key={i} className="bg-gray-800 text-gray-300 px-2 py-0.5 text-xs rounded-full">
                                      {tech}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {project.github_link && (
                              <a 
                                href={project.github_link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="mt-2 inline-flex items-center text-xs text-[#E8C848] hover:underline"
                              >
                                View on GitHub
                              </a>
                            )}
                            
                            {project.moderatorNotes && (
                              <div className="mt-2 p-2 bg-gray-800/50 rounded text-xs text-gray-400 border-l-2 border-[#E8C848]">
                                <p className="font-medium text-[#E8C848]">Moderator Notes:</p>
                                <p>{project.moderatorNotes}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#111111] rounded-lg p-8 border border-gray-800 text-center">
                    <Code size={32} className="mx-auto mb-2 text-gray-600" />
                    <p className="text-gray-400">No projects found for this student</p>
                  </div>
                )}
              </div>
              
              {/* Additional Data */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Experience Section */}
                <div>
                  <h3 className="text-xl font-bold text-white mb-4">Experience</h3>
                  <div className="bg-[#111111] rounded-lg border border-gray-800 overflow-hidden">
                    {selectedStudent.experience && selectedStudent.experience.length > 0 ? (
                      <div className="divide-y divide-gray-800">
                        {selectedStudent.experience.map((exp, index) => (
                          <div key={index} className="p-4">
                            <div className="flex justify-between">
                              <h5 className="font-medium text-white">{exp.title}</h5>
                              <span className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded-full">
                                {exp.type}
                              </span>
                            </div>
                            <p className="text-sm text-gray-400 mt-1">{exp.description}</p>
                            {exp.date && (
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(exp.date).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center">
                        <p className="text-gray-400">No experience details available</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Achievements Section */}
                <div>
                  <h3 className="text-xl font-bold text-white mb-4">Achievements</h3>
                  <div className="bg-[#111111] rounded-lg border border-gray-800 overflow-hidden">
                    {selectedStudent.achievements && selectedStudent.achievements.length > 0 ? (
                      <div className="divide-y divide-gray-800">
                        {selectedStudent.achievements.map((achievement, index) => (
                          <div key={index} className="p-4">
                            <h5 className="font-medium text-white">{achievement.title}</h5>
                            <p className="text-sm text-gray-400 mt-1">{achievement.description}</p>
                            {achievement.date && (
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(achievement.date).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center">
                        <p className="text-gray-400">No achievements recorded</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-5 border-t border-gray-800 flex justify-end">
              <button 
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 bg-[#E8C848] text-black rounded-lg hover:bg-[#E8C848]/80 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentReports;