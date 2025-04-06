import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StudentConversation from './StudentConversation';
import { useUser } from '../../../../context/UserContext';

const AllConversationsPage = () => {
  const navigate = useNavigate();
  const { userData, isLoading } = useUser();

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="mb-6 flex items-center">
        <button 
          onClick={() => navigate('/student/dashboard')}
          className="mr-4 p-2 rounded-full bg-[#1A1A1A] text-[#E8C848] hover:bg-[#E8C848]/10 transition-all duration-300"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-white">All Conversations</h1>
      </div>
      
      {isLoading ? (
        <div className="bg-[#1A1A1A] rounded-xl shadow-lg p-6 border border-gray-800 hover:border-[#E8C848]/30 transition-all duration-300">
          <div className="flex justify-between items-center mb-4">
            <div className="h-8 bg-[#121212] rounded w-48 animate-pulse"></div>
            <div className="h-8 bg-[#121212] rounded w-32 animate-pulse"></div>
          </div>
          <div className="space-y-4">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="animate-pulse flex justify-between items-center border-b border-gray-800 pb-3">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-[#121212] rounded-full mr-3"></div>
                  <div>
                    <div className="h-4 bg-[#121212] rounded w-24 mb-2"></div>
                    <div className="h-3 bg-[#121212] rounded w-40"></div>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="h-3 bg-[#121212] rounded w-10 mb-2"></div>
                  <div className="h-6 bg-[#121212] rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <StudentConversation userData={userData} isInDashboard={false} />
      )}
    </div>
  );
};

export default AllConversationsPage;