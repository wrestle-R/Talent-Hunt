import React, { useState } from 'react';
import { CalendarDays, Edit, Trash2, Users, Clock, MapPin, Award, ChevronDown, ChevronUp, Search, Check, X } from 'lucide-react';

const HackathonList = ({ hackathons, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedHackathon, setExpandedHackathon] = useState(null);
  
  // Filter hackathons based on search term
  const filteredHackathons = hackathons.filter(hackathon => 
    hackathon.hackathonName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hackathon.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hackathon.domain.some(d => d.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  // Update applicant status
  const updateApplicantStatus = async (hackathonId, applicantId, newStatus) => {
    try {
      // Mock API call
      console.log(`Updating applicant ${applicantId} status to ${newStatus}`);
      
      // API call would go here in a real implementation
      
      alert(`Applicant status updated to ${newStatus}`);
    } catch (err) {
      console.error("Error updating applicant status:", err);
      alert(`Failed to update applicant status: ${err.message}`);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div>
      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search hackathons by name, description, or domain..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      
      {/* Hackathons List */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <CalendarDays className="text-blue-600" size={24} />
            All Hackathons
          </h3>
          <p className="text-sm text-gray-500">
            Manage all the hackathons on the platform
          </p>
        </div>
        
        {filteredHackathons.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <p>No hackathons found. Create your first hackathon using the button above.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredHackathons.map(hackathon => (
              <div key={hackathon._id} className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-lg text-gray-900 mb-1">{hackathon.hackathonName}</h4>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {hackathon.domain.map((domain, index) => (
                        <span key={index} className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs">
                          {domain}
                        </span>
                      ))}
                    </div>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{hackathon.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 mt-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock size={16} className="mr-2 text-gray-400" />
                        <span>
                          {formatDate(hackathon.startDate)} - {formatDate(hackathon.endDate)}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin size={16} className="mr-2 text-gray-400" />
                        <span>
                          {hackathon.mode} {hackathon.location !== 'Online' && `• ${hackathon.location}`}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Award size={16} className="mr-2 text-gray-400" />
                        <span>
                          {hackathon.prizePool > 0 
                            ? `$${hackathon.prizePool.toLocaleString()} Prize Pool` 
                            : 'No Prize Money'}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Users size={16} className="mr-2 text-gray-400" />
                        <span>
                          {hackathon.registration.currentlyRegistered}/{hackathon.registration.totalCapacity} Participants
                        </span>
                      </div>
                    </div>
                    {hackathon.problemStatement && hackathon.problemStatement.length > 0 && (
                      <div className="mt-3">
                        <h5 className="text-sm font-medium text-gray-700 mb-1">Problem Statements:</h5>
                        <div className="flex flex-wrap gap-2">
                          {hackathon.problemStatement.map((problem, index) => (
                            <span key={index} className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-xs">
                              {problem}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => onEdit(hackathon)}
                      className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                      title="Edit"
                    >
                      <Edit size={16} className="text-gray-700" />
                    </button>
                    <button 
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this hackathon? This action cannot be undone.')) {
                          onDelete(hackathon._id);
                        }
                      }}
                      className="p-2 bg-gray-100 hover:bg-red-100 rounded-full transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} className="text-gray-700 hover:text-red-600" />
                    </button>
                  </div>
                </div>
                
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    Created on {formatDate(hackathon.createdAt)}
                  </span>
                  <button 
                    onClick={() => setExpandedHackathon(expandedHackathon === hackathon._id ? null : hackathon._id)}
                    className="text-blue-600 hover:text-blue-800 flex items-center text-sm font-medium"
                  >
                    {expandedHackathon === hackathon._id ? (
                      <>Hide Applicants <ChevronUp size={16} className="ml-1" /></>
                    ) : (
                      <>View Applicants <ChevronDown size={16} className="ml-1" /></>
                    )}
                  </button>
                </div>
                
                {/* Applicants Section */}
                {expandedHackathon === hackathon._id && (
                  <div className="mt-6 border-t border-gray-100 pt-4">
                    <h5 className="font-medium text-gray-900 mb-4 flex items-center">
                      <Users size={18} className="mr-2 text-blue-600" />
                      Applicants
                    </h5>
                    
                    {hackathon.applicants && hackathon.applicants.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead>
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied On</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {hackathon.applicants.map(applicant => (
                              <tr key={applicant._id}>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-800">
                                  {applicant.user.name || "User"}
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">
                                  {applicant.user.email || "No email"}
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">
                                  {formatDate(applicant.appliedAt)}
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm">
                                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                                    applicant.status === 'Accepted' 
                                      ? 'bg-green-100 text-green-800'
                                      : applicant.status === 'Rejected'
                                      ? 'bg-red-100 text-red-800'
                                      : 'bg-blue-100 text-blue-800'
                                  }`}>
                                    {applicant.status}
                                  </span>
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm">
                                  <div className="flex space-x-2">
                                    {applicant.status !== 'Accepted' && (
                                      <button
                                        onClick={() => updateApplicantStatus(hackathon._id, applicant._id, 'Accepted')}
                                        className="bg-green-50 hover:bg-green-100 text-green-700 p-1 rounded"
                                        title="Accept"
                                      >
                                        <Check size={14} />
                                      </button>
                                    )}
                                    {applicant.status !== 'Rejected' && (
                                      <button
                                        onClick={() => updateApplicantStatus(hackathon._id, applicant._id, 'Rejected')}
                                        className="bg-red-50 hover:bg-red-100 text-red-700 p-1 rounded"
                                        title="Reject"
                                      >
                                        <X size={14} />
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        <p>No applicants found for this hackathon.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HackathonList;