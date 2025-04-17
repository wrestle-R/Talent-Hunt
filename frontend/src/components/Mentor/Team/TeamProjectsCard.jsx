import React, { useState } from 'react';
import { FileCode, CheckCircle, Clock, XCircle, Github, ExternalLink, Calendar, Layers, HelpCircle, Edit } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import StudentPlaceholder from '../../../public/student_placeholder.png';
import MentorPlaceholder from '../../../public/mentor_placeholder.png';

const ProjectStatus = ({ status }) => {
  const getStatusInfo = () => {
    switch (status) {
      case 'planning':
        return { icon: <Clock size={14} />, color: 'bg-[#E8C848]/10 text-[#E8C848]', label: 'Planning' };
      case 'in-progress':
        return { icon: <Layers size={14} />, color: 'bg-[#E8C848]/10 text-[#E8C848]', label: 'In Progress' };
      case 'completed':
        return { icon: <CheckCircle size={14} />, color: 'bg-[#E8C848]/10 text-[#E8C848]', label: 'Completed' };
      case 'abandoned':
        return { icon: <XCircle size={14} />, color: 'bg-red-500/10 text-red-500', label: 'Abandoned' };
      default:
        return { icon: <HelpCircle size={14} />, color: 'bg-gray-800 text-gray-400', label: 'Unknown' };
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

      const response = await axios.post(`${import.meta.env.VITE_APP_BASE_URL}/api/mentor/project-feedback/${team._id}`, {
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
    <div className="bg-[#1A1A1A] rounded-xl shadow-lg border border-gray-800 transition-all duration-300">
      <div className="p-6 border-b border-gray-800">
        <h2 className="text-lg font-semibold flex items-center text-white font-montserrat">
          <FileCode size={20} className="mr-2 text-[#E8C848]" />
          Team Projects ({team.projects?.length || 0})
        </h2>
        <p className="text-sm text-gray-400 mt-1 font-inter">Review and provide feedback on team projects</p>
      </div>

      <div className="divide-y divide-gray-800">
        {team.projects && team.projects.length > 0 ? (
          team.projects.map((project) => (
            <div key={project._id} className="p-0">
              <div
                className={`px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-[#111111] transition-all duration-300 ${
                  expandedProject === project._id ? 'bg-[#111111]' : ''
                }`}
                onClick={() => handleProjectClick(project._id)}
              >
                <div className="flex-1">
                  <div className="flex items-center">
                    <h3 className="font-medium text-white">{project.name}</h3>
                    <div className="ml-3">
                      <ProjectStatus status={project.status} />
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 mt-1 line-clamp-1">
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
                <div className="px-6 py-4 bg-[#111111] border-t border-gray-800">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-3">Project Information</h4>

                      <div className="space-y-4">
                        <div>
                          <h5 className="text-xs text-gray-500 uppercase tracking-wide">Description</h5>
                          <p className="mt-1 text-sm text-gray-300">{project.description || 'No description provided'}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h5 className="text-xs text-gray-500 uppercase tracking-wide">Start Date</h5>
                            <p className="mt-1 text-sm text-gray-300 flex items-center">
                              <Calendar size={14} className="mr-1 text-gray-500" />
                              {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'Not set'}
                            </p>
                          </div>

                          <div>
                            <h5 className="text-xs text-gray-500 uppercase tracking-wide">End Date</h5>
                            <p className="mt-1 text-sm text-gray-300 flex items-center">
                              <Calendar size={14} className="mr-1 text-gray-500" />
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
                                  className="px-2 py-1 bg-[#E8C848]/10 text-[#E8C848] text-xs rounded-full"
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
                              className="inline-flex items-center px-3 py-1 bg-[#E8C848]/10 hover:bg-[#E8C848]/20 rounded-md text-sm text-[#E8C848]"
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
                              className="inline-flex items-center px-3 py-1 bg-[#E8C848]/10 hover:bg-[#E8C848]/20 rounded-md text-sm text-[#E8C848]"
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
                                    statusColor = 'text-[#E8C848]';
                                    break;
                                  case 'missed':
                                    statusColor = 'text-red-500';
                                    break;
                                  default:
                                    statusColor = 'text-[#E8C848]';
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
                                      <p className="text-sm font-medium text-gray-300">{milestone.title}</p>
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
                      <h4 className="text-sm font-medium text-gray-400 mb-3">Provide Project Feedback</h4>
                      <textarea
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        placeholder="Write your feedback for this project..."
                        className="w-full px-3 py-2 bg-[#1A1A1A] border border-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E8C848]/50 focus:border-[#E8C848] text-white placeholder-gray-500 font-inter"
                        rows="5"
                      />
                      <div className="mt-3 flex justify-end">
                        <button
                          onClick={() => handleSubmitFeedback(project._id)}
                          disabled={isSubmitting || !feedbackText.trim()}
                          className={`px-4 py-2 rounded-md ${
                            isSubmitting || !feedbackText.trim()
                              ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                              : 'bg-[#E8C848] text-[#121212] hover:bg-[#E8C848]/80'
                          }`}
                        >
                          {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                        </button>
                      </div>

                      {project.feedback && project.feedback.length > 0 && (
                        <div className="mt-6">
                          <h5 className="text-xs text-gray-500 uppercase tracking-wide mb-3">Previous Feedback</h5>
                          <div className="space-y-4">
                            {project.feedback.map((fb, idx) => (
                              <div key={idx} className="bg-[#1A1A1A] p-3 rounded-md border border-gray-800">
                                <p className="text-sm text-gray-300">{fb.content}</p>
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
          <div className="text-center py-12 font-inter">
            <FileCode size={32} className="mx-auto text-gray-600 mb-3" />
            <h3 className="text-lg font-medium text-white font-montserrat">No Projects Yet</h3>
            <p className="text-gray-400 mt-1">This team hasn't created any projects</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamProjectsCard;