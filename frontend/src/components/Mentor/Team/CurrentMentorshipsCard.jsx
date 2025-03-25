import React, { useState, useEffect } from 'react';
import { Users, ChevronRight, BarChart, MessageCircle } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import TeamChatModal from './TeamChatModal';

const CurrentMentorshipsCard = ({ mentorData, onViewTeam }) => {
  const [mentorships, setMentorships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (mentorData?._id) {
      fetchMentorships();
    }
  }, [mentorData]);

  const fetchMentorships = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:4000/api/mentor/active-mentorships/${mentorData._id}`);
      setMentorships(response.data || []);
    } catch (error) {
      console.error("Error fetching active mentorships:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMessageTeam = (team) => {
    setSelectedTeam(team);
    setIsChatOpen(true);
  };

  const handleViewTeam = (team) => {
    if (onViewTeam) {
      onViewTeam(team);
    } else {
      navigate(`/mentor/team/${team._id}`);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h3 className="font-bold text-lg flex items-center gap-2 mb-4">
          <BarChart size={20} className="text-emerald-600" />
          Current Mentorships
        </h3>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h3 className="font-bold text-lg flex items-center gap-2 mb-4">
        <BarChart size={20} className="text-emerald-600" />
        Current Mentorships
      </h3>
      
      {mentorships.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Users className="mx-auto mb-2 h-8 w-8 text-gray-400" />
          <p>No active mentorships</p>
        </div>
      ) : (
        <div className="space-y-3">
          {mentorships.map((team) => (
            <div key={team._id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium text-gray-900">{team.name}</h4>
                  <p className="text-sm text-gray-500">
                    {team.members.length} members • Since {new Date(team.mentorJoinedDate).toLocaleDateString()}
                  </p>
                </div>
                
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleMessageTeam(team)}
                    className="flex items-center space-x-1 text-emerald-600 text-sm font-medium bg-emerald-50 px-2 py-1 rounded-md hover:bg-emerald-100"
                  >
                    <MessageCircle size={14} />
                    <span>Message</span>
                  </button>
                  
                  <button 
                    onClick={() => handleViewTeam(team)}
                    className="flex items-center space-x-1 text-emerald-600 text-sm font-medium bg-emerald-50 px-2 py-1 rounded-md hover:bg-emerald-100"
                  >
                    <span>View Profile</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
              
              {team.currentProject && (
                <div className="mt-3 border-t pt-2">
                  <p className="text-sm font-medium">Current Project:</p>
                  <p className="text-sm">{team.currentProject}</p>
                </div>
              )}
              
              {team.techStack && team.techStack.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {team.techStack.map((tech, idx) => (
                    <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">
                      {tech}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Team Chat Modal */}
      {selectedTeam && (
        <TeamChatModal
          isOpen={isChatOpen}
          onClose={() => {
            setIsChatOpen(false);
            setTimeout(() => setSelectedTeam(null), 300);
          }}
          team={selectedTeam}
          currentUser={mentorData}
        />
      )}
    </div>
  );
};

export default CurrentMentorshipsCard;