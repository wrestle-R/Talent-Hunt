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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">User Moderation</h1>
      
      {/* Main Tabs - Students / Mentors */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => {
            setActiveTab('students');
            setActiveSubTab('active');
          }}
          className={`py-3 px-4 text-sm font-medium flex items-center gap-1 ${
            activeTab === 'students'
              ? 'text-emerald-600 border-b-2 border-emerald-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
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
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
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
              ? activeTab === 'students' 
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Active
        </button>
        
        <button
          onClick={() => setActiveSubTab('rejected')}
          className={`py-2 px-4 text-sm font-medium rounded-full flex items-center gap-1 ${
            activeSubTab === 'rejected'
              ? 'bg-red-100 text-red-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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