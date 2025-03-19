import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Register from './components/Register';
import StudentHero from './components/Student/StudentHero';
import MentorHero from './components/Mentor/MentorHero';
import MentorProfile from "./components/Mentor/MentorProfile";
import StudentProfile from "./components/Student/StudentProfile";
import StudentNewProject from "./components/Student/StudentNewProject";
import StudentDashboard from './components/Student/StudentDashboard';
import AdminHero from './components/Admin/AdminHero';
import TeammatesPage from './components/Student/TeammatesPage';
import MentorsPage from './components/Student/MentorsPage';
import { UserProvider } from '../context/UserContext';
import ManageHackathons from './components/Admin/ManageHackathons';
import HackathonPage from './components/Student/HackathonPage';
import HackathonDetail from './components/Student/HackathonDetail';
import AdminModeration from './components/Admin/AdminModeration';

const App = () => {
  return (
    <UserProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <div className="flex-grow">
            <Routes>
              <Route path="/student/hero" element={<StudentHero />} />
              <Route path="/register" element={<Register />} />
              <Route path="/mentor/hero" element={<MentorHero />} />
              <Route path="/mentor/profile" element={<MentorProfile />} />
              <Route path="/student/profile" element={<StudentProfile />} />
              <Route path="/student/new-project" element={<StudentNewProject />} />
              <Route path="/admin/hero" element={<AdminHero />} /> 
              <Route path="/student/teammates" element={<TeammatesPage />} />
              <Route path="/student/mentors" element={<MentorsPage />} />
              <Route path="/admin/hackathons" element={<ManageHackathons />} />
              <Route path="/admin/applications" element={<AdminModeration />} /> 

              
              {/* New Hackathon routes */}
              <Route path="/student/hackathons" element={<HackathonPage />} />
              <Route path="/student/hackathon/:id" element={<HackathonDetail />} />
            </Routes>
          </div>
        </div>
      </Router>
    </UserProvider>
  );
};

export default App;