import React, { useState, useEffect } from 'react';

const CreateHackathon = ({ hackathon, isEditing = false, onSubmit, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [domainInput, setDomainInput] = useState('');
  const [problemStatementInput, setProblemStatementInput] = useState('');
  
  const [formData, setFormData] = useState({
    hackathonName: '',
    description: '',
    lastRegisterDate: '',
    startDate: '',
    endDate: '',
    mode: 'Online',
    location: '',
    prizePool: 0,
    totalCapacity: 100,
    primaryDomain: '', // Primary domain field
    primaryProblemStatement: '', // Primary problem statement field
    domain: [], // Legacy field
    problemStatement: [] // Legacy field
  });
  
  // If editing, populate form with existing data
  useEffect(() => {
    if (hackathon) {
      setFormData({
        hackathonName: hackathon.hackathonName || '',
        description: hackathon.description || '',
        startDate: hackathon.startDate ? hackathon.startDate.split('T')[0] : '',
        endDate: hackathon.endDate ? hackathon.endDate.split('T')[0] : '',
        lastRegisterDate: hackathon.lastRegisterDate ? hackathon.lastRegisterDate.split('T')[0] : '',
        mode: hackathon.mode || 'Online',
        location: hackathon.location || '',
        prizePool: hackathon.prizePool || 0,
        totalCapacity: hackathon.registration?.totalCapacity || 100,
        primaryDomain: hackathon.primaryDomain || '', // Load primary domain
        primaryProblemStatement: hackathon.primaryProblemStatement || '', // Load primary problem statement
        domain: hackathon.domain ? [...hackathon.domain] : [],
        problemStatement: hackathon.problemStatement ? [...hackathon.problemStatement] : []
      });
    }
  }, [hackathon]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Handle domain tags input
  const handleDomainKeyDown = (e) => {
    if (e.key === 'Enter' && domainInput.trim() !== '') {
      e.preventDefault();
      if (!formData.domain.includes(domainInput.trim())) {
        setFormData({
          ...formData,
          domain: [...formData.domain, domainInput.trim()]
        });
      }
      setDomainInput('');
    }
  };

  const handleProblemKeyDown = (e) => {
    if (e.key === 'Enter' && problemStatementInput.trim() !== '') {
      e.preventDefault();
      if (!formData.problemStatement.includes(problemStatementInput.trim())) {
        setFormData({
          ...formData,
          problemStatement: [...formData.problemStatement, problemStatementInput.trim()]
        });
      }
      setProblemStatementInput('');
    }
  }; 

  const removeProblemStatement = (index) => {
    setFormData({
      ...formData,
      problemStatement: formData.problemStatement.filter((_, i) => i !== index)
    });
  };
  
  // Remove domain tag
  const removeDomain = (index) => {
    setFormData({
      ...formData,
      domain: formData.domain.filter((_, i) => i !== index)
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Ensure primary domain and problem statement are set
      if (!formData.primaryDomain.trim()) {
        alert("Primary domain is required");
        setLoading(false);
        return;
      }
      
      if (!formData.primaryProblemStatement.trim()) {
        alert("Primary problem statement is required");
        setLoading(false);
        return;
      }
      
      // Prepare data with proper types
      const hackathonData = {
        ...formData,
        prizePool: Number(formData.prizePool),
        totalCapacity: Number(formData.totalCapacity)
      };
      
      if (isEditing) {
        // Mock successful update
        console.log(`Updating hackathon with data:`, hackathonData);
        
        const updatedHackathon = {
          _id: hackathon._id,
          ...hackathonData,
          registration: {
            totalCapacity: Number(hackathonData.totalCapacity),
            currentlyRegistered: hackathon.registration?.currentlyRegistered || 0,
            requiredTeamSize: 4
          },
          createdAt: hackathon.createdAt
        };
        
        onSubmit(updatedHackathon);
      } else {
        // Mock successful creation
        console.log("Creating hackathon with data:", hackathonData);
        
        const newHackathon = {
          _id: `hackathon${Date.now()}`,
          ...hackathonData,
          registration: {
            totalCapacity: Number(hackathonData.totalCapacity),
            currentlyRegistered: 0,
            requiredTeamSize: 4
          },
          createdAt: new Date().toISOString()
        };
        
        onSubmit(newHackathon);
      }
      
    } catch (err) {
      console.error(isEditing ? "Error updating hackathon:" : "Error creating hackathon:", err);
      alert(`Failed to ${isEditing ? 'update' : 'create'} hackathon: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4">
        {isEditing ? 'Edit Hackathon' : 'Create New Hackathon'}
      </h3>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hackathon Name*
            </label>
            <input
              type="text"
              name="hackathonName"
              value={formData.hackathonName}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description*
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                Registration Deadline*
            </label>
            <input
                type="date"
                name="lastRegisterDate"
                value={formData.lastRegisterDate}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date*
            </label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date*
            </label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mode
            </label>
            <select
              name="mode"
              value={formData.mode}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Online">Online</option>
              <option value="Offline">Offline</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location {formData.mode !== 'Online' && '*'}
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              disabled={formData.mode === 'Online'}
              placeholder={formData.mode === 'Online' ? 'Online' : 'Enter location'}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              required={formData.mode !== 'Online'}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prize Pool (INR)
            </label>
            <input
              type="number"
              name="prizePool"
              value={formData.prizePool}
              onChange={handleChange}
              min="0"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Maximum Participants*
            </label>
            <input
              type="number"
              name="totalCapacity"
              value={formData.totalCapacity}
              onChange={handleChange}
              min="1"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Primary Domain field */}
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Primary Domain*
            </label>
            <input
              type="text"
              name="primaryDomain"
              value={formData.primaryDomain}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Main domain of the hackathon (e.g., AI, Web3, Healthcare)"
              required
            />
          </div>

          {/* Primary Problem Statement field */}
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Primary Problem Statement*
            </label>
            <textarea
              name="primaryProblemStatement"
              value={formData.primaryProblemStatement}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
              placeholder="Main problem statement that participants will solve"
              required
            />
          </div>
         
          
          <div className="col-span-2 mt-4 flex justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="mr-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
            >
              {loading && (
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
              )}
              {isEditing ? 'Update Hackathon' : 'Create Hackathon'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateHackathon;