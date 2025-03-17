import React from 'react';
import { 
  Bell, Clock, Calendar, MessageCircle, CheckCircle, Award, Users
} from 'lucide-react';

const MentorDashboard = ({ dashboardData }) => {
  return (
    <div className="w-full p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Mentor Dashboard</h2>
        <div className="flex items-center gap-4">
          <button className="relative p-2">
            <Bell size={20} className="text-gray-600" />
            <span className="absolute top-0 right-0 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
              {dashboardData.applications.length + dashboardData.reachouts.length}
            </span>
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors">
            <Clock size={16} />
            Set Availability
          </button>
        </div>
      </div>
      
      {/* Upcoming Sessions Preview - Top section */}
      <div className="mb-6 p-6 bg-white rounded-xl shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">Upcoming Mentorship Sessions</h3>
          <button className="text-blue-600 text-sm font-medium">View Calendar</button>
        </div>
        
        {dashboardData.upcomingSessions && dashboardData.upcomingSessions.length > 0 ? (
          <div className="space-y-4">
            {dashboardData.upcomingSessions.map(session => (
              <div key={session.id} className="flex items-center justify-between border-b pb-3">
                <div>
                  <p className="font-medium">{session.name}</p>
                  <div className="flex items-center gap-4">
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Calendar size={14} /> {session.date}
                    </p>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Clock size={14} /> {session.duration}
                    </p>
                  </div>
                </div>
                <button className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-sm">
                  Join
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-20 bg-gray-50 rounded-lg text-gray-500">
            No upcoming sessions scheduled
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mentorship Applications */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <CheckCircle size={20} className="text-green-600" />
              Mentorship Applications
            </h3>
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
              {dashboardData.applications.length} New
            </span>
          </div>
          <div className="space-y-4">
            {dashboardData.applications.map(app => (
              <div key={app.id} className="flex items-center justify-between border-b pb-3">
                <div>
                  <p className="font-medium">{app.name}</p>
                  <p className="text-sm text-gray-500">{app.project}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{app.date}</span>
                  <button className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-sm">
                    Review
                  </button>
                </div>
              </div>
            ))}
            {dashboardData.applications.length === 0 && (
              <div className="text-center text-gray-500 py-4">
                No mentorship applications yet
              </div>
            )}
          </div>
          <button className="text-blue-600 text-sm font-medium mt-4 hover:text-blue-800">
            View All Applications
          </button>
        </div>
        
        {/* Students Reaching Out */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <MessageCircle size={20} className="text-blue-600" />
              Students Reaching Out
            </h3>
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              {dashboardData.reachouts.length} New
            </span>
          </div>
          <div className="space-y-4">
            {dashboardData.reachouts.map(student => (
              <div key={student.id} className="flex items-center justify-between border-b pb-3">
                <div>
                  <p className="font-medium">{student.name}</p>
                  <p className="text-sm text-gray-500">{student.interest} • {student.institution}</p>
                </div>
                <div className="flex gap-2">
                  <button className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-sm">
                    Decline
                  </button>
                  <button className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm">
                    Connect
                  </button>
                </div>
              </div>
            ))}
            {dashboardData.reachouts.length === 0 && (
              <div className="text-center text-gray-500 py-4">
                No student reach-outs yet
              </div>
            )}
          </div>
          <button className="text-blue-600 text-sm font-medium mt-4 hover:text-blue-800">
            Find More Students
          </button>
        </div>
        
        {/* Upcoming Hackathons */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Award size={20} className="text-purple-600" />
              Upcoming Hackathons
            </h3>
            <button className="text-sm text-purple-600 font-medium">Add to Calendar</button>
          </div>
          <div className="space-y-4">
            {dashboardData.upcomingHackathons.map(hackathon => (
              <div key={hackathon.id} className="flex items-center justify-between border-b pb-3">
                <div>
                  <p className="font-medium">{hackathon.name}</p>
                  <div className="flex items-center gap-4">
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Calendar size={14} /> {hackathon.date}
                    </p>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Users size={14} /> {hackathon.participants} Participants
                    </p>
                  </div>
                </div>
                <button className="bg-purple-100 text-purple-700 px-3 py-1 rounded-lg text-sm">
                  Details
                </button>
              </div>
            ))}
            {dashboardData.upcomingHackathons.length === 0 && (
              <div className="text-center text-gray-500 py-4">
                No upcoming hackathons
              </div>
            )}
          </div>
          <button className="text-purple-600 text-sm font-medium mt-4 hover:text-purple-800">
            Browse All Events
          </button>
        </div>
        
        {/* Quick Access */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="font-bold text-lg mb-4">Quick Access</h3>
          <div className="grid grid-cols-2 gap-4">
            <button className="flex flex-col items-center justify-center bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors">
              <Users size={24} className="text-blue-600 mb-2" />
              <span className="text-sm font-medium">My Students</span>
            </button>
            <button className="flex flex-col items-center justify-center bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors">
              <Calendar size={24} className="text-green-600 mb-2" />
              <span className="text-sm font-medium">Schedule</span>
            </button>
            <button className="flex flex-col items-center justify-center bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors">
              <MessageCircle size={24} className="text-amber-600 mb-2" />
              <span className="text-sm font-medium">Messages</span>
            </button>
            <button className="flex flex-col items-center justify-center bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors">
              <Award size={24} className="text-purple-600 mb-2" />
              <span className="text-sm font-medium">Resources</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorDashboard;