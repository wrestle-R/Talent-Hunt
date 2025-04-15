import React from 'react';
import { Users, ChevronRight, MessageCircle } from 'lucide-react';
import StudentPlaceholder from '../../../public/student_placeholder.png';
import MentorPlaceholder from '../../../public/mentor_placeholder.png';

const CurrentStudentsCard = ({ students, onOpenChat }) => {
  return (
    <div className="bg-[#1A1A1A] p-6 rounded-xl shadow-lg border border-gray-800 hover:border-[#E8C848]/30 transition-all duration-300">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg flex items-center gap-2 text-white font-montserrat">
          <Users size={20} className="text-[#E8C848]" />
          Current Students
        </h3>
        <span className="bg-[#E8C848]/10 text-[#E8C848] text-xs px-2 py-1 rounded-full">
          {students.length} Total
        </span>
      </div>
      <div className="space-y-4">
        {students.map(student => (
          <div key={student._id} className="flex items-center justify-between border-b border-gray-800 pb-3 hover:bg-[#111111]/50 transition-all duration-300 rounded-lg p-2">
            <div className="flex items-center">
              <img 
                src={student.profile_picture || StudentPlaceholder} 
                alt={student.name} 
                className="w-10 h-10 rounded-full mr-3"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = StudentPlaceholder;
                }}
              />
              <div>
                <p className="font-medium text-white">{student.name}</p>
                <p className="text-sm text-gray-400">
                  {student.education?.institution || 'No institution'} • {student.project || 'No project'}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                className="bg-[#E8C848]/10 text-[#E8C848] px-3 py-1 rounded-lg text-sm hover:bg-[#E8C848]/20 transition-all duration-300 font-inter"
                onClick={() => onOpenChat(student)}
              >
                Message
              </button>
            </div>
          </div>
        ))}
        {students.length === 0 && (
          <div className="text-center text-gray-400 py-4 font-inter">
            No students assigned yet
          </div>
        )}
      </div>
      <button className="text-[#E8C848] text-sm font-medium mt-4 hover:text-[#E8C848]/80 flex items-center group transition-all duration-300 font-inter">
        View Student Progress 
        <ChevronRight size={16} className="ml-1 transition-transform group-hover:translate-x-1" />
      </button>
    </div>
  );
};

export default CurrentStudentsCard;