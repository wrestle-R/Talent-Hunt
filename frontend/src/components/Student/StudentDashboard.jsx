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

const StudentDashboard = ({ userData, formatDate, getDaysRemaining }) => {
  // Add state to track what we're showing in full-page mode
  const [showAllMentors, setShowAllMentors] = useState(false);
  const [showAllTeammates, setShowAllTeammates] = useState(false);
  const [showAllApplications, setShowAllApplications] = useState(false);
  const [showAllMessages, setShowAllMessages] = useState(false);
  const [showAllMentorMessages, setShowAllMentorMessages] = useState(false);
  const [showAllProjects, setShowAllProjects] = useState(false);
  
  // Return different view based on what should be shown in full-page
  if (showAllMentors) {
    return (
      <div className="w-[95%] p-6">
        <div className="flex items-center mb-6">
          <button 
            onClick={() => setShowAllMentors(false)}
            className="bg-blue-100 text-blue-700 p-2 rounded-full mr-4 hover:bg-blue-200 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-2xl font-bold text-gray-800">Browse Mentors</h2>
        </div>
        
        <DisplayMentors userData={userData} isFullPage={true} />
      </div>
    );
  }
  
  // Show all teammates full-page
  if (showAllTeammates) {
    return (
      <div className="w-[95%] p-6">
        <div className="flex items-center mb-6">
          <button 
            onClick={() => setShowAllTeammates(false)}
            className="bg-emerald-100 text-emerald-700 p-2 rounded-full mr-4 hover:bg-emerald-200 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-2xl font-bold text-gray-800">Find Teammates</h2>
        </div>
        
        <DisplayTeammates userData={userData} isFullPage={true} />
      </div>
    );
  }

  // Show all hackathon applications full-page
  if (showAllApplications) {
    return (
      <div className="w-[95%]">
        <HackathonStatus 
          isFullPage={true} 
          onBack={() => setShowAllApplications(false)} 
        />
      </div>
    );
  }
  
  // Show all messages full-page
  if (showAllMessages) {
    return (
      <div className="w-[95%] p-6">
        <div className="flex items-center mb-6">
          <button 
            onClick={() => setShowAllMessages(false)}
            className="bg-purple-100 text-purple-700 p-2 rounded-full mr-4 hover:bg-purple-200 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-2xl font-bold text-gray-800">My Conversations</h2>
        </div>
        
        <StudentConversation userData={userData} isInDashboard={false} />
      </div>
    );
  }
  
  // Show all projects full-page
  if (showAllProjects) {
    return (
      <div className="w-[95%] p-6">
        <div className="flex items-center mb-6">
          <button 
            onClick={() => setShowAllProjects(false)}
            className="bg-indigo-100 text-indigo-700 p-2 rounded-full mr-4 hover:bg-indigo-200 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-2xl font-bold text-gray-800">My Projects</h2>
        </div>
        
        <StudentProjects userData={userData} isInDashboard={false} />
      </div>
    );
  }
  
  // Regular dashboard view
  return (
    <div className="w-[95%] p-6">
      {/* Header & Action Buttons */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Your Dashboard</h2>
        <div className="flex gap-3">
          <button className="relative p-2 mr-2">
            <Bell size={20} className="text-gray-600" />
            <span className="absolute top-0 right-0 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
              3
            </span>
          </button>
          <button 
            onClick={() => setShowAllTeammates(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            Find Teammates
          </button>
          <button 
            onClick={() => setShowAllMentors(true)}
            className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg font-medium hover:bg-indigo-200 transition-colors"
          >
            Find Mentors
          </button>
        </div>
      </div>

      {/* Team Overview Component */}
      <div className="mb-6">
        <TeamOverview />
      </div>
      
      {/* Conversations component */}
      <div className="mb-6">
        <StudentConversation userData={userData} limit={2} />
      </div>
      
      {/* Projects Component */}
      <div className="mb-6">
        <StudentProjects userData={userData} limit={2} />
      </div>
      
      {/* Hackathon Applications Component */}
      <div className="mb-6">
        <HackathonStatus limit={3} />
      </div>
      
      {/* Add Upcoming Hackathons section */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Trophy className="text-purple-600" />
            Upcoming Hackathons
          </h3>
          <Link
            to="/student/hackathons" 
            className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center"
          >
            View All <ChevronRight size={16} />
          </Link>
        </div>
        
        <UpcomingHackathons limit={3} layout='grid'/>
      </div>
      
      {/* Team and Mentor Suggestions - Side by Side in one row each */}
      <div className="space-y-6 mb-6">
        {/* Team Suggestions */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Users className="text-emerald-600" />
              Team Suggestions
            </h3>
            <Link
              to="/student/teammates" 
              className="text-emerald-600 hover:text-emerald-700 text-sm font-medium flex items-center"
            >
              View All <ChevronRight size={16} />
            </Link>
          </div>
          
          {/* Display recommended teammates in one row */}
          <DisplayTeammates userData={userData} isRecommendations={true} />
        </div>
        
        {/* Mentor Suggestions */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <GraduationCap className="text-blue-600" />
              Mentor Suggestions
            </h3>
            <Link
              to="/student/mentors" 
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
            >
              View All <ChevronRight size={16} />
            </Link>
          </div>
          
          {/* Display recommended mentors in one row */}
          <DisplayMentors userData={userData} isRecommendations={true} />
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;