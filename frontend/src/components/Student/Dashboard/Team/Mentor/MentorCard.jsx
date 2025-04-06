import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Award, Briefcase, ExternalLink, Check, Clock } from 'lucide-react';

const MentorCard = ({ mentor, hasApplied, onApply }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-[#1A1A1A] border border-gray-800 hover:border-[#E8C848]/30 rounded-lg p-4 transition-all duration-300 shadow-lg">
      <div className="flex">
        <div className="h-14 w-14 rounded-full overflow-hidden bg-[#121212] mr-3 flex-shrink-0">
          {mentor.profile_picture ? (
            <img 
              src={mentor.profile_picture} 
              alt={mentor.name} 
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-[#E8C848]/10 text-[#E8C848]">
              <User size={24} />
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <h4 className="font-semibold text-white">{mentor.name}</h4>
          
          {mentor.current_role && (
            <p className="text-sm text-gray-300 flex items-center gap-1">
              <Briefcase size={14} className="text-[#E8C848]" />
              {mentor.current_role.title}
              {mentor.current_role.company && ` at ${mentor.current_role.company}`}
            </p>
          )}
          
          {mentor.years_of_experience && (
            <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
              <Award size={12} className="text-[#E8C848]" />
              {mentor.years_of_experience} years of experience
            </p>
          )}
        </div>
      </div>
      
      {/* Skills/Expertise */}
      {mentor.expertise && mentor.expertise.technical_skills && mentor.expertise.technical_skills.length > 0 && (
        <div className="mt-3">
          <div className="flex flex-wrap gap-1">
            {mentor.expertise.technical_skills.slice(0, 5).map((skill, idx) => (
              <span key={idx} className="bg-[#E8C848]/10 text-[#E8C848] text-xs px-2 py-0.5 rounded-full">
                {skill}
              </span>
            ))}
            {mentor.expertise.technical_skills.length > 5 && (
              <span className="bg-[#E8C848]/10 text-[#E8C848] text-xs px-2 py-0.5 rounded-full">
                +{mentor.expertise.technical_skills.length - 5} more
              </span>
            )}
          </div>
        </div>
      )}
      
      {/* Action buttons */}
      <div className="mt-4 flex justify-between items-center">
        <button
          onClick={() => navigate(`/student/team/mentor/${mentor._id}`)}
          className="text-[#E8C848] hover:text-[#E8C848]/80 text-sm flex items-center gap-1 transition-colors duration-300"
        >
          <ExternalLink size={14} />
          View Profile
        </button>
        
        {hasApplied ? (
          <div className="text-xs bg-blue-900/20 text-blue-400 px-2 py-1 rounded-full flex items-center">
            <Clock size={12} className="mr-1" />
            Application Pending
          </div>
        ) : (
          <button
            onClick={onApply}
            className="bg-[#E8C848] text-[#121212] px-3 py-1 rounded hover:bg-[#E8C848]/80 text-sm flex items-center gap-1 transition-all duration-300 shadow-lg shadow-[#E8C848]/30"
          >
            <Check size={14} />
            Request Mentorship
          </button>
        )}
      </div>
    </div>
  );
};

export default MentorCard;