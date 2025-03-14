import React from 'react';
import {
  GraduationCap, BookOpen, Trophy, Calendar, 
  Clock, Code, Users, Zap, ChevronRight, Bell
} from 'lucide-react';

const StudentDashboard = ({ userData, formatDate, getDaysRemaining }) => {
  return (
    <div className="w-full md:w-7/10 p-6">
      {/* Header & Action Buttons */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Current Activities</h2>
        <div className="flex gap-3">
          <button className="relative p-2 mr-2">
            <Bell size={20} className="text-gray-600" />
            <span className="absolute top-0 right-0 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
              2
            </span>
          </button>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors">
            Find Teamates
          </button>
          <button className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg font-medium hover:bg-indigo-200 transition-colors">
            Find Mentors
          </button>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors">
            Explore Projects
          </button>
        </div>
      </div>
      
      {/* Active Mentorships */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <GraduationCap className="text-indigo-600" />
            Active Mentorships
          </h3>
          <button className="text-indigo-600 text-sm font-medium hover:underline flex items-center">
            View All <ChevronRight size={16} />
          </button>
        </div>
        
        {userData.activities.filter(a => a.type === 'mentorship').map(mentorship => (
          <div key={mentorship.id} className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex justify-between mb-2">
              <h4 className="font-semibold text-gray-800">{mentorship.title}</h4>
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Active</span>
            </div>
            <p className="text-gray-600 text-sm mb-3">Mentor: {mentorship.mentor}</p>
            <div className="mb-2">
              <div className="flex justify-between text-xs mb-1">
                <span>Progress</span>
                <span>{mentorship.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-indigo-600 h-1.5 rounded-full" 
                  style={{ width: `${mentorship.progress}%` }}
                ></div>
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm text-indigo-700">
              <Clock size={14} />
              <span>Next session: {formatDate(mentorship.nextSession)}</span>
            </div>
          </div>
        ))}
      </div>
      
      {/* Current Projects */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Code className="text-emerald-600" />
            Current Projects
          </h3>
          <button className="text-emerald-600 text-sm font-medium hover:underline flex items-center">
            View All <ChevronRight size={16} />
          </button>
        </div>
        
        {userData.activities.filter(a => a.type === 'project').map(project => (
          <div key={project.id} className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex justify-between mb-2">
              <h4 className="font-semibold text-gray-800">{project.title}</h4>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">In Progress</span>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <Users size={16} className="text-gray-500" />
              <p className="text-gray-600 text-sm">
                {project.teammates.join(', ')}
              </p>
            </div>
            <div className="flex items-center gap-1 text-sm text-emerald-700">
              <Calendar size={14} />
              <span>Deadline: {formatDate(project.deadline)} ({getDaysRemaining(project.deadline)} days remaining)</span>
            </div>
          </div>
        ))}
      </div>
      
      {/* Upcoming Events */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Trophy className="text-amber-600" />
            Upcoming Events
          </h3>
          <button className="text-amber-600 text-sm font-medium hover:underline flex items-center">
            View All <ChevronRight size={16} />
          </button>
        </div>
        
        {userData.activities.filter(a => a.type === 'hackathon').map(event => (
          <div key={event.id} className="bg-gray-50 rounded-lg p-4 mb-4 last:mb-0">
            <div className="flex justify-between mb-2">
              <h4 className="font-semibold text-gray-800">{event.title}</h4>
              <span className={`px-2 py-1 rounded text-xs ${
                event.status === 'registered' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {event.status === 'registered' ? 'Registered' : 'Open'}
              </span>
            </div>
            <div className="flex items-center gap-4 mb-2">
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Calendar size={14} />
                <span>{formatDate(event.date)}</span>
              </div>
              {event.location && (
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Users size={14} />
                  <span>{event.location}</span>
                </div>
              )}
            </div>
            
            <button className={`text-sm px-3 py-1 rounded-lg ${
              event.status === 'registered'
                ? 'bg-amber-100 text-amber-700'
                : 'bg-indigo-600 text-white'
            }`}>
              {event.status === 'registered' ? 'View Details' : 'Register'}
            </button>
          </div>
        ))}
        
        {/* Recommended Event */}
        <div className="mt-4 border-t pt-4">
          <h4 className="font-medium text-gray-700 mb-3">Recommended for You</h4>
          <div className="bg-amber-50 rounded-lg p-4">
            <div className="flex justify-between mb-2">
              <h4 className="font-semibold text-gray-800">Frontend Masters Hackathon</h4>
              <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs">
                New
              </span>
            </div>
            <div className="flex items-center gap-4 mb-3">
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Calendar size={14} />
                <span>May 28 - 30</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Users size={14} />
                <span>Online</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Build innovative web applications with latest frontend technologies
            </p>
            <button className="bg-indigo-600 text-white text-sm px-3 py-1 rounded-lg">
              Learn More
            </button>
          </div>
        </div>
      </div>
      
      {/* Recommended Learning Paths */}
      <div className="bg-white rounded-xl shadow-md p-6 mt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <BookOpen className="text-indigo-600" />
            Recommended Learning Paths
          </h3>
          <button className="text-indigo-600 text-sm font-medium hover:underline">
            View All
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white">
              <Code size={32} />
            </div>
            <div className="p-4">
              <h4 className="font-medium text-gray-800 mb-1">Full-Stack Web Development</h4>
              <p className="text-sm text-gray-600 mb-3">
                Master modern web development with React, Node.js and MongoDB
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">82 modules • 4 projects</span>
                <button className="text-indigo-600 text-sm font-medium">Explore</button>
              </div>
            </div>
          </div>
          
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-green-600 to-teal-600 flex items-center justify-center text-white">
              <Zap size={32} />
            </div>
            <div className="p-4">
              <h4 className="font-medium text-gray-800 mb-1">Machine Learning Fundamentals</h4>
              <p className="text-sm text-gray-600 mb-3">
                Learn core ML concepts and practical applications with Python
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">64 modules • 3 projects</span>
                <button className="text-indigo-600 text-sm font-medium">Explore</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;