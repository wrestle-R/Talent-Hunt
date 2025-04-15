import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ExternalLink, Shield, MessageCircle } from 'lucide-react';
import { useUser } from '../../../../../../context/UserContext';
import MentorChatModal from './MentorChatModal';

const CurrentTeamMentor = ({ team, onRemoveMentor, isLeader }) => {
  const navigate = useNavigate();
  const { userData } = useUser();
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="text-white">
      <h3 className="font-medium text-lg mb-4">Current Team Mentor</h3>
      
      {team?.mentor?.mentorId ? (
        <div className="bg-[#1A1A1A] border border-gray-800 hover:border-[#E8C848]/30 rounded-lg p-4 transition-all duration-300">
          <div className="flex items-start">
            <div className="h-16 w-16 rounded-full overflow-hidden bg-[#121212] mr-4 flex-shrink-0">
              {team.mentor.profile_picture ? (
                <img 
                  src={team.mentor.profile_picture} 
                  alt={team.mentor.name} 
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-[#E8C848]/10 text-[#E8C848]">
                  <User size={32} />
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-gray-200">
                    {team.mentor.name}
                    <Shield size={14} className="ml-1 text-[#E8C848] inline" />
                  </h4>
                  <p className="text-sm text-gray-400 mt-1">
                    Joined {new Date(team.mentor.joinedAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="bg-[#E8C848]/10 text-[#E8C848] text-xs px-2 py-1 rounded-full">
                  Active Mentor
                </span>
              </div>
              
              {team.mentor.expertise && team.mentor.expertise.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-gray-400 mb-1">Expertise:</p>
                  <div className="flex flex-wrap gap-1">
                    {team.mentor.expertise.map((skill, idx) => (
                      <span key={idx} className="bg-[#E8C848]/10 text-[#E8C848] text-xs px-2 py-0.5 rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="mt-4 flex justify-between items-center">
                <div className="flex gap-3">
                  <button
                    onClick={() => navigate(`/student/mentor/${team.mentor.mentorId}`)}
                    className="text-[#E8C848] hover:text-[#E8C848]/80 text-sm flex items-center gap-1 transition-colors duration-300"
                  >
                    <ExternalLink size={14} />
                    View Profile
                  </button>
                  
                  <button
                    onClick={() => setIsChatOpen(true)}
                    className="text-[#E8C848] hover:text-[#E8C848]/80 text-sm flex items-center gap-1 transition-colors duration-300"
                  >
                    <MessageCircle size={14} />
                    Message
                  </button>
                </div>
                
                {isLeader && (
                  <button 
                    onClick={() => onRemoveMentor(team.mentor.mentorId)}
                    className="bg-red-500/10 text-red-500 px-3 py-1 rounded hover:bg-red-500/20 text-sm transition-colors duration-300"
                  >
                    Remove Mentor
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-[#1A1A1A] border border-gray-800 hover:border-[#E8C848]/30 rounded-xl transition-all duration-300">
          <Shield size={48} className="mx-auto text-[#E8C848]/30 mb-3" />
          <h3 className="text-xl font-medium text-gray-200 mb-2">No Mentor Yet</h3>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Your team doesn't have a mentor yet. Mentors can provide guidance, expertise, and help your team succeed.
          </p>
        </div>
      )}

      {/* Mentor Chat Modal */}
      {team?.mentor?.mentorId && (
        <MentorChatModal
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          mentor={team.mentor}
          currentUser={userData}
          team={team}
        />
      )}
    </div>
  );
};

export default CurrentTeamMentor;