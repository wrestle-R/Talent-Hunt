import React, { useState } from 'react';
import { FileCode, CheckCircle, Clock, XCircle, Github, ExternalLink, Calendar, Layers, HelpCircle, Edit } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const ProjectStatus = ({ status }) => {
  const getStatusInfo = () => {
    switch (status) {
      case 'planning':
        return { icon: <Clock size={14} />, color: 'bg-blue-100 text-blue-800', label: 'Planning' };
      case 'in-progress':
        return { icon: <Layers size={14} />, color: 'bg-amber-100 text-amber-800', label: 'In Progress' };
      case 'completed':
        return { icon: <CheckCircle size={14} />, color: 'bg-green-100 text-green-800', label: 'Completed' };
      case 'abandoned':
        return { icon: <XCircle size={14} />, color: 'bg-red-100 text-red-800', label: 'Abandoned' };
      default:
        return { icon: <HelpCircle size={14} />, color: 'bg-gray-100 text-gray-800', label: 'Unknown' };
    }
  };

  const { icon, color, label } = getStatusInfo();

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {icon}
      <span className="ml-1">{label}</span>
    </span>
  );
};

const TeamProjectsCard = ({ team, mentorId, onDataChange }) => {
  const [expandedProject, setExpandedProject] = useState(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleProjectClick = (projectId) => {
    if (expandedProject === projectId) {
      setExpandedProject(null);
    } else {
      setExpandedProject(projectId);
      setFeedbackText('');
    }
  };
  
  const handleSubmitFeedback = async (projectId) => {
    if (!feedbackText.trim()) {
      toast.error("Feedback cannot be empty");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const response = await axios.post(`http://localhost:4000/api/mentor/project-feedback/${team._id}`, {
        mentorId,
        projectId,
        feedback: feedbackText
      });
      
      if (response.data.success) {
        toast.success("Project feedback submitted successfully");
        setFeedbackText('');
        setExpandedProject(null);
        if (onDataChange) onDataChange();
      } else {
        toast.error(response.data.message || "Failed to submit feedback");
      }
    } catch (error) {
      console.error("Error submitting project feedback:", error);
      toast.error(error.response?.data?.message || "An error occurred while submitting feedback");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold flex items-center">
          <FileCode size={20} className="mr-2 text-emerald-600" />
          Team Projects ({team.projects?.length || 0})
        </h2>
        <p className="text-sm text-gray-500 mt-1">Review and provide feedback on team projects</p>
      </div>
      
      <div className="divide-y divide-gray-100">
        {team.projects && team.projects.length > 0 ? (
          team.projects.map((project) => (
            <div key={project._id} className="p-0">
              <div 
                className={`px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 ${
                  expandedProject === project._id ? 'bg-blue-50' : ''
                }`}
                onClick={() => handleProjectClick(project._id)}
              >
                <div className="flex-1">
                  <div className="flex items-center">
                    <h3 className="font-medium text-gray-800">{project.name}</h3>
                    <div className="ml-3">
                      <ProjectStatus status={project.status} />
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                    {project.description || 'No description provided'}
                  </p>
                </div>
                
                <div className="flex items-center text-gray-400">
                  <span className="text-sm">
                    {expandedProject === project._id ? 'Hide Details' : 'View Details'}
                  </span>
                  <svg
                    className={`ml-2 h-5 w-5 transition-transform duration-200 ${
                      expandedProject === project._id ? 'transform rotate-180' : ''
                    }`}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              
              {expandedProject === project._id && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-3">Project Information</h4>
                      
                      <div className="space-y-4">
                        <div>
                          <h5 className="text-xs text-gray-500 uppercase tracking-wide">Description</h5>
                          <p className="mt-1 text-sm text-gray-800">{project.description || 'No description provided'}</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h5 className="text-xs text-gray-500 uppercase tracking-wide">Start Date</h5>
                            <p className="mt-1 text-sm text-gray-800 flex items-center">
                              <Calendar size={14} className="mr-1 text-gray-400" />
                              {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'Not set'}
                            </p>
                          </div>
                          
                          <div>
                            <h5 className="text-xs text-gray-500 uppercase tracking-wide">End Date</h5>
                            <p className="mt-1 text-sm text-gray-800 flex items-center">
                              <Calendar size={14} className="mr-1 text-gray-400" />
                              {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'Not set'}
                            </p>
                          </div>
                        </div>
                        
                        {project.techStack && project.techStack.length > 0 && (
                          <div>
                            <h5 className="text-xs text-gray-500 uppercase tracking-wide">Tech Stack</h5>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {project.techStack.map((tech, idx) => (
                                <span 
                                  key={idx} 
                                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                                >
                                  {tech}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="flex flex-wrap gap-3">
                          {project.githubRepo && (
                            <a 
                              href={project.githubRepo}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md text-sm text-gray-700"
                            >
                              <Github size={14} className="mr-1" />
                              GitHub Repository
                            </a>
                          )}
                          
                          {project.deployedUrl && (
                            <a 
                              href={project.deployedUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md text-sm text-gray-700"
                            >
                              <ExternalLink size={14} className="mr-1" />
                              Live Demo
                            </a>
                          )}
                        </div>
                        
                        {project.milestones && project.milestones.length > 0 && (
                          <div>
                            <h5 className="text-xs text-gray-500 uppercase tracking-wide">Milestones</h5>
                            <ul className="mt-2 space-y-2">
                              {project.milestones.map((milestone, idx) => {
                                let statusColor;
                                switch (milestone.status) {
                                  case 'completed':
                                    statusColor = 'text-green-600';
                                    break;
                                  case 'missed':
                                    statusColor = 'text-red-600';
                                    break;
                                  default:
                                    statusColor = 'text-amber-600';
                                }
                                
                                return (
                                  <li key={idx} className="flex items-start">
                                    <div className={`mr-2 mt-0.5 ${statusColor}`}>
                                      {milestone.status === 'completed' ? (
                                        <CheckCircle size={16} />
                                      ) : milestone.status === 'missed' ? (
                                        <XCircle size={16} />
                                      ) : (
                                        <Clock size={16} />
                                      )}
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium">{milestone.title}</p>
                                      {milestone.description && (
                                        <p className="text-xs text-gray-500">{milestone.description}</p>
                                      )}
                                      {milestone.dueDate && (
                                        <p className="text-xs text-gray-500">
                                          Due: {new Date(milestone.dueDate).toLocaleDateString()}
                                        </p>
                                      )}
                                    </div>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-3">Provide Project Feedback</h4>
                      <textarea
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        placeholder="Write your feedback for this project..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        rows="5"
                      />
                      <div className="mt-3 flex justify-end">
                        <button
                          onClick={() => handleSubmitFeedback(project._id)}
                          disabled={isSubmitting || !feedbackText.trim()}
                          className={`px-4 py-2 rounded-md ${
                            isSubmitting || !feedbackText.trim()
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-emerald-600 text-white hover:bg-emerald-700'
                          }`}
                        >
                          {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                        </button>
                      </div>
                      
                      {/* Previous Feedback */}
                      {project.feedback && project.feedback.length > 0 && (
                        <div className="mt-6">
                          <h5 className="text-xs text-gray-500 uppercase tracking-wide mb-3">Previous Feedback</h5>
                          <div className="space-y-4">
                            {project.feedback.map((fb, idx) => (
                              <div key={idx} className="bg-white p-3 rounded-md border border-gray-200">
                                <p className="text-sm text-gray-800">{fb.content}</p>
                                <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                                  <span>{new Date(fb.date).toLocaleDateString()}</span>
                                  <span>{fb.mentorName || 'You'}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <FileCode size={32} className="mx-auto text-gray-300 mb-3" />
            <h3 className="text-lg font-medium text-gray-700">No Projects Yet</h3>
            <p className="text-gray-500 mt-1">This team hasn't created any projects</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamProjectsCard;