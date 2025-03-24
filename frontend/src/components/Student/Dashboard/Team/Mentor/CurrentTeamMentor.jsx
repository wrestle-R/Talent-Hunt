import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ExternalLink, Shield } from 'lucide-react';

const CurrentTeamMentor = ({ team, onRemoveMentor, isLeader }) => {
  const navigate = useNavigate();

  return (
    <div>
      <h3 className="font-medium text-lg mb-4">Current Team Mentor</h3>
      
      {team?.mentor ? (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="h-16 w-16 rounded-full overflow-hidden bg-gray-200 mr-4 flex-shrink-0">
              {team.mentor.profile_picture ? (
                <img 
                  src={team.mentor.profile_picture} 
                  alt={team.mentor.name} 
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-indigo-100 text-indigo-600">
                  <User size={32} />
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-gray-800">
                    {team.mentor.name}
                    <Shield size={14} className="ml-1 text-indigo-500 inline" />
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Joined {new Date(team.mentor.joinedAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded-full">
                  Active Mentor
                </span>
              </div>
              
              {team.mentor.expertise && team.mentor.expertise.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-gray-600 mb-1">Expertise:</p>
                  <div className="flex flex-wrap gap-1">
                    {team.mentor.expertise.map((skill, idx) => (
                      <span key={idx} className="bg-indigo-50 text-indigo-700 text-xs px-2 py-0.5 rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="mt-4 flex justify-between items-center">
                <button
                  onClick={() => navigate(`/student/mentor/${team.mentor.mentorId}`)}
                  className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center gap-1"
                >
                  <ExternalLink size={14} />
                  View Profile
                </button>
                
                {isLeader && (
                  <button 
                    onClick={() => onRemoveMentor(team.mentor.mentorId)}
                    className="bg-red-50 text-red-700 px-3 py-1 rounded hover:bg-red-100 text-sm"
                  >
                    Remove Mentor
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-50 rounded-xl">
          <Shield size={48} className="mx-auto text-gray-300 mb-3" />
          <h3 className="text-xl font-medium text-gray-700 mb-2">No Mentor Yet</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Your team doesn't have a mentor yet. Mentors can provide guidance, expertise, and help your team succeed.
          </p>
          {/* <button
            onClick={() => navigate(`/student/mentors`)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 inline-flex items-center gap-2"
          >
            <Shield size={16} />
            Find a Mentor
          </button> */}
        </div>
      )}
    </div>
  );
};

export default CurrentTeamMentor;