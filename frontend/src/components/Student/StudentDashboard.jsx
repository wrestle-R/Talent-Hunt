import React, { useState } from 'react';
import {
  GraduationCap, BookOpen, Trophy, Calendar, 
  Clock, Code, Users, Zap, ChevronRight, Bell,
  MapPin, User, MessageCircle, Bookmark, ArrowLeft
} from 'lucide-react';
import DisplayMentors from './DisplayMentors';
import DisplayTeammates from './DisplayTeammates';
import { Link } from 'react-router-dom';

const StudentDashboard = ({ userData, formatDate, getDaysRemaining }) => {
  // Add state to track what we're showing in full-page mode
  const [showAllMentors, setShowAllMentors] = useState(false);
  const [showAllTeammates, setShowAllTeammates] = useState(false);
  
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

      {/* Main activities overview and stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* LEFT: Current activities */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
          <h3 className="font-bold text-lg mb-4">Current Activities</h3>
          
          <div className="space-y-4">
            {/* Show mentor guidance */}
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg flex justify-between items-center">
              <div className="flex items-center gap-3">
                <GraduationCap className="text-blue-600" size={22} />
                <div>
                  <h4 className="font-medium text-gray-800">Looking for guidance?</h4>
                  <p className="text-sm text-gray-600">Connect with a mentor to help with your projects</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAllMentors(true)}
                className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm"
              >
                Find Mentor
              </button>
            </div>
            
            {/* Show team invitation */}
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-lg flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Users className="text-emerald-600" size={22} />
                <div>
                  <h4 className="font-medium text-gray-800">Looking for teammates?</h4>
                  <p className="text-sm text-gray-600">Build a team for your next project or hackathon</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAllTeammates(true)}
                className="bg-emerald-600 text-white px-3 py-1 rounded-lg text-sm"
              >
                Find Team
              </button>
            </div>
            
            {/* User's ongoing activities could go here */}
          </div>
        </div>
        
        {/* RIGHT: Stats summary */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="font-bold text-lg mb-4">Your Stats</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="bg-indigo-100 p-2 rounded-lg">
                  <Trophy className="text-indigo-600" size={18} />
                </div>
                <span className="text-gray-700">Profile Completion</span>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-indigo-700">75%</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <GraduationCap className="text-blue-600" size={18} />
                </div>
                <span className="text-gray-700">Active Mentorships</span>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-blue-700">2</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="bg-emerald-100 p-2 rounded-lg">
                  <Users className="text-emerald-600" size={18} />
                </div>
                <span className="text-gray-700">Team Projects</span>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-emerald-700">1</span>
              </div>
            </div>
          </div>
        </div>
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