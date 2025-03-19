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
              <Route path="/student/dashboard" element={<StudentDashboard />} />
              <Route path="/admin/hero" element={<AdminHero />} /> 
              <Route path="/student/teammates" element={<TeammatesPage />} />
              <Route path="/student/mentors" element={<MentorsPage />} />
              <Route path="/admin/hackathons" element={<ManageHackathons />} /> 

            </Routes>
          </div>
        </div>
      </Router>
    </UserProvider>
  );
};

export default App;