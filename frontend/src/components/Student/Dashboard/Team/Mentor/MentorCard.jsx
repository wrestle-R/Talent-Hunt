import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Award, Briefcase, ExternalLink, Check, Clock } from 'lucide-react';

const MentorCard = ({ mentor, hasApplied, onApply }) => {
  const navigate = useNavigate();

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:border-indigo-200 transition-colors">
      <div className="flex">
        <div className="h-14 w-14 rounded-full overflow-hidden bg-gray-200 mr-3 flex-shrink-0">
          {mentor.profile_picture ? (
            <img 
              src={mentor.profile_picture} 
              alt={mentor.name} 
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-indigo-100 text-indigo-600">
              <User size={24} />
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <h4 className="font-semibold text-gray-800">{mentor.name}</h4>
          
          {mentor.current_role && (
            <p className="text-sm text-gray-600 flex items-center gap-1">
              <Briefcase size={14} />
              {mentor.current_role.title}
              {mentor.current_role.company && ` at ${mentor.current_role.company}`}
            </p>
          )}
          
          {mentor.years_of_experience && (
            <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
              <Award size={12} />
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
              <span key={idx} className="bg-indigo-50 text-indigo-700 text-xs px-2 py-0.5 rounded-full">
                {skill}
              </span>
            ))}
            {mentor.expertise.technical_skills.length > 5 && (
              <span className="bg-indigo-50 text-indigo-700 text-xs px-2 py-0.5 rounded-full">
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
          className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center gap-1"
        >
          <ExternalLink size={14} />
          View Profile
        </button>
        
        {hasApplied ? (
          <div className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full flex items-center">
            <Clock size={12} className="mr-1" />
            Application Pending
          </div>
        ) : (
          <button
            onClick={onApply}
            className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded hover:bg-indigo-200 text-sm flex items-center gap-1"
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