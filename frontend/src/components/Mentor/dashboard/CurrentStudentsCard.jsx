import React from 'react';
import { Users, ChevronRight, MessageCircle } from 'lucide-react';

const CurrentStudentsCard = ({ students, onOpenChat }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <Users size={20} className="text-emerald-600" />
          Current Students
        </h3>
        <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-full">
          {students.length} Total
        </span>
      </div>
      <div className="space-y-4">
        {students.map(student => (
          <div key={student._id} className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center">
              <img 
                src={student.profile_picture || 'https://via.placeholder.com/40?text=👤'} 
                alt={student.name} 
                className="w-10 h-10 rounded-full mr-3"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/40?text=👤';
                }}
              />
              <div>
                <p className="font-medium">{student.name}</p>
                <p className="text-sm text-gray-500">
                  {student.education?.institution || 'No institution'} • {student.project || 'No project'}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg text-sm"
                onClick={() => onOpenChat(student)}
              >
                Message
              </button>
            </div>
          </div>
        ))}
        {students.length === 0 && (
          <div className="text-center text-gray-500 py-4">
            No students assigned yet
          </div>
        )}
      </div>
      <button className="text-emerald-600 text-sm font-medium mt-4 hover:text-emerald-800 flex items-center">
        View Student Progress <ChevronRight size={16} />
      </button>
    </div>
  );
};

export default CurrentStudentsCard;