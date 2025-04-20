import React, { useState } from 'react';
import MentorLists from './Moderating/MentorLists';
import StudentLists from './Moderating/StudentLists';
import MentorReject from './Moderating/MentorReject';
import StudentReject from './Moderating/StudentReject';
import { Users, UserX } from 'lucide-react';

const AdminModeration = () => {
  const [activeTab, setActiveTab] = useState('students');
  const [activeSubTab, setActiveSubTab] = useState('active');

  return (
    <div className="container mx-auto px-4 py-8 bg-[#111111] font-inter">
      <h1 className="text-2xl font-bold text-white mb-6 font-montserrat">User Moderation</h1>
      
      {/* Main Tabs - Students / Mentors */}
      <div className="flex border-b border-gray-800 mb-6">
        <button
          onClick={() => {
            setActiveTab('students');
            setActiveSubTab('active');
          }}
          className={`py-3 px-4 text-sm font-medium flex items-center gap-1 ${
            activeTab === 'students'
              ? 'text-[#E8C848] border-b-2 border-[#E8C848]'
              : 'text-gray-400 hover:text-gray-300'
          } transition-colors duration-300`}
        >
          <Users size={18} />
          Students
        </button>
        
        <button
          onClick={() => {
            setActiveTab('mentors');
            setActiveSubTab('active');
          }}
          className={`py-3 px-4 text-sm font-medium flex items-center gap-1 ${
            activeTab === 'mentors'
              ? 'text-[#E8C848] border-b-2 border-[#E8C848]'
              : 'text-gray-400 hover:text-gray-300'
          } transition-colors duration-300`}
        >
          <Users size={18} />
          Mentors
        </button>
      </div>
      
      {/* Sub Tabs - Active / Rejected */}
      <div className="flex mb-6">
        <button
          onClick={() => setActiveSubTab('active')}
          className={`py-2 px-4 text-sm font-medium rounded-full mr-2 ${
            activeSubTab === 'active'
              ? 'bg-[#E8C848]/20 text-[#E8C848]'
              : 'bg-[#1A1A1A] text-gray-400 hover:bg-[#1A1A1A]/80 transition-colors duration-300'
          }`}
        >
          Active
        </button>
        
        <button
          onClick={() => setActiveSubTab('rejected')}
          className={`py-2 px-4 text-sm font-medium rounded-full flex items-center gap-1 ${
            activeSubTab === 'rejected'
              ? 'bg-red-900/30 text-red-400'
              : 'bg-[#1A1A1A] text-gray-400 hover:bg-[#1A1A1A]/80 transition-colors duration-300'
          }`}
        >
          <UserX size={14} />
          Flagged
        </button>
      </div>
      
      {/* Component Rendering */}
      <div className="mt-4">
        {activeTab === 'students' && activeSubTab === 'active' && <StudentLists />}
        {activeTab === 'students' && activeSubTab === 'rejected' && <StudentReject />}
        {activeTab === 'mentors' && activeSubTab === 'active' && <MentorLists />}
        {activeTab === 'mentors' && activeSubTab === 'rejected' && <MentorReject />}
      </div>
    </div>
  );
};

export default AdminModeration;