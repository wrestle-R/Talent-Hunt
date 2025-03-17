import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Register from './components/Register';
import StudentHero from './components/Student/StudentHero';
import MentorHero from './components/Mentor/MentorHero';
import MentorProfile from "./components/Mentor/MentorProfile";
import StudentProfile from "./components/Student/StudentProfile";
import StudentNewProject from "./components/Student/StudentNewProject";
import MentorDashboard from "./components/Mentor/MentorDashboard";
import MentorHeroProfile from "./components/Mentor/MentorHeroProfile";

const App = () => {
  return (
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
            
            {/* Redirect root to register page */}
            <Route path="/" element={<Register />} />
            {/* Redirect old login path to register */}
            <Route path="/login" element={<Register />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;