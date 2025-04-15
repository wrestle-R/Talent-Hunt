import React, { useState, useEffect } from 'react';
import {
  GraduationCap, BookOpen, Trophy, Calendar, 
  Clock, Code, Users, Zap, ChevronRight, Bell,
  MapPin, User, MessageCircle, Bookmark, ArrowLeft,
  FolderGit2
} from 'lucide-react';
import DisplayMentors from './Dashboard/DisplayMentors';
import DisplayTeammates from './Dashboard/DisplayTeammates';
import { Link } from 'react-router-dom';
import UpcomingHackathons from './Dashboard/UpcomingHackathons';
import HackathonStatus from './Hackathon/HacakthonStatus';
import StudentConversation from './Dashboard/StudentConversation';
import StudentProjects from './Dashboard/StudentProjects';
import TeamOverview from './Dashboard/Team/TeamOverview';
import Invitations from './Dashboard/Team/Invitations';

const StudentDashboard = ({ userData, formatDate, getDaysRemaining }) => {
  const [showAllMentors, setShowAllMentors] = useState(false);
  const [showAllTeammates, setShowAllTeammates] = useState(false);
  const [showAllApplications, setShowAllApplications] = useState(false);
  const [showAllMessages, setShowAllMessages] = useState(false);
  const [showAllMentorMessages, setShowAllMentorMessages] = useState(false);
  const [showAllProjects, setShowAllProjects] = useState(false);
  
  if (showAllMentors) {
    return (
      <div className="w-[95%] p-6 bg-[#121212]">
        <div className="flex items-center mb-6">
          <button 
            onClick={() => setShowAllMentors(false)}
            className="bg-[#E8C848]/10 text-[#E8C848] p-2 rounded-full mr-4 hover:bg-[#E8C848]/20 transition-all duration-300"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-2xl font-bold text-white">Browse Mentors</h2>
        </div>
        
        <DisplayMentors userData={userData} isFullPage={true} />
      </div>
    );
  }
  
  if (showAllTeammates) {
    return (
      <div className="w-[95%] p-6 bg-[#121212]">
        <div className="flex items-center mb-6">
          <button 
            onClick={() => setShowAllTeammates(false)}
            className="bg-[#E8C848]/10 text-[#E8C848] p-2 rounded-full mr-4 hover:bg-[#E8C848]/20 transition-all duration-300"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-2xl font-bold text-white">Find Teammates</h2>
        </div>
        
        <DisplayTeammates userData={userData} isFullPage={true} />
      </div>
    );
  }

  if (showAllApplications) {
    return (
      <div className="w-[95%] bg-[#121212]">
        <HackathonStatus 
          isFullPage={true} 
          onBack={() => setShowAllApplications(false)} 
        />
      </div>
    );
  }
  
  if (showAllMessages) {
    return (
      <div className="w-[95%] p-6 bg-[#121212]">
        <div className="flex items-center mb-6">
          <button 
            onClick={() => setShowAllMessages(false)}
            className="bg-[#E8C848]/10 text-[#E8C848] p-2 rounded-full mr-4 hover:bg-[#E8C848]/20 transition-all duration-300"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-2xl font-bold text-white">My Conversations</h2>
        </div>
        
        <StudentConversation userData={userData} isInDashboard={false} />
      </div>
    );
  }
  
  if (showAllProjects) {
    return (
      <div className="w-[95%] p-6 bg-[#121212]">
        <div className="flex items-center mb-6">
          <button 
            onClick={() => setShowAllProjects(false)}
            className="bg-[#E8C848]/10 text-[#E8C848] p-2 rounded-full mr-4 hover:bg-[#E8C848]/20 transition-all duration-300"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-2xl font-bold text-white">My Projects</h2>
        </div>
        
        <StudentProjects userData={userData} isInDashboard={false} />
      </div>
    );
  }
  
  return (
    <div className="w-[95%] p-6 bg-[#121212]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Your Dashboard</h2>
        <div className="flex gap-3">
          <button className="relative p-2 mr-2">
            <Bell size={20} className="text-[#E8C848]" />
            <span className="absolute top-0 right-0 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
              3
            </span>
          </button>
          <button 
            onClick={() => setShowAllTeammates(true)}
            className="bg-[#E8C848] text-[#121212] px-4 py-2 rounded-lg font-medium hover:bg-[#E8C848]/80 transition-all duration-300 shadow-lg shadow-[#E8C848]/20"
          >
            Find Teammates
          </button>
          <button 
            onClick={() => setShowAllMentors(true)}
            className="bg-[#E8C848]/10 text-[#E8C848] px-4 py-2 rounded-lg font-medium hover:bg-[#E8C848]/20 transition-all duration-300"
          >
            Find Mentors
          </button>
        </div>
      </div>

      <div className="mb-6">
        <div className="bg-[#1A1A1A] rounded-xl shadow-lg p-6 border border-gray-800 hover:border-[#E8C848]/30 transition-all duration-300">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg flex items-center gap-2 text-white">
              <Users className="text-[#E8C848]" />
              Team Invitations
            </h3>
          </div>
          <Invitations limit={3} />
        </div>
      </div>

      <div className="mb-6">
        <TeamOverview />
      </div>
      
      <div className="mb-6">
        <StudentConversation userData={userData} limit={2} />
      </div>
      
      <div className="mb-6">
        <StudentProjects userData={userData} limit={2} />
      </div>
      
      <div className="mb-6">
        <HackathonStatus limit={3} />
      </div>
      
      <div className="bg-[#1A1A1A] rounded-xl shadow-lg p-6 mb-6 border border-gray-800 hover:border-[#E8C848]/30 transition-all duration-300">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg flex items-center gap-2 text-white">
            <Trophy className="text-[#E8C848]" />
            Upcoming Hackathons
          </h3>
          <Link
            to="/student/hackathons" 
            className="text-[#E8C848] hover:text-[#E8C848]/80 text-sm font-medium flex items-center transition-all duration-300"
          >
            View All <ChevronRight size={16} />
          </Link>
        </div>
        
        <UpcomingHackathons limit={3} layout='grid'/>
      </div>
      
      <div className="space-y-6 mb-6">
        <div className="bg-[#1A1A1A] rounded-xl shadow-lg p-6 border border-gray-800 hover:border-[#E8C848]/30 transition-all duration-300">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg flex items-center gap-2 text-white">
              <Users className="text-[#E8C848]" />
              Team Suggestions
            </h3>
            <Link
              to="/student/teammates" 
              className="text-[#E8C848] hover:text-[#E8C848]/80 text-sm font-medium flex items-center transition-all duration-300"
            >
              View All <ChevronRight size={16} />
            </Link>
          </div>
          
          <DisplayTeammates userData={userData} isRecommendations={true} />
        </div>
        
        <div className="bg-[#1A1A1A] rounded-xl shadow-lg p-6 border border-gray-800 hover:border-[#E8C848]/30 transition-all duration-300">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg flex items-center gap-2 text-white">
              <GraduationCap className="text-[#E8C848]" />
              Mentor Suggestions
            </h3>
            <Link
              to="/student/mentors" 
              className="text-[#E8C848] hover:text-[#E8C848]/80 text-sm font-medium flex items-center transition-all duration-300"
            >
              View All <ChevronRight size={16} />
            </Link>
          </div>
          
          <DisplayMentors userData={userData} isRecommendations={true} />
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;