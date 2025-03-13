import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Register from './components/Register';
import StudentHero from './components/Student/StudentHero';
import MentorHero from './components/Mentor/MentorHero';
import MentorProfile from "./components/Mentor/MentorProfile"
import StudentProfile from "./components/Student/StudentProfile"
const App = () => {
  return (
    <Router>
      <div>
        <Navbar />
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/student/hero" element={<StudentHero />} />
          <Route path="/mentor/hero" element={<MentorHero />} />
          <Route path="/mentor/profile" element={<MentorProfile />} />
          <Route path="/student/profile" element={<StudentProfile />} />


          {/* Redirect root to register page */}
          <Route path="/" element={<Register />} />
          {/* Redirect old login path to register */}
          <Route path="/login" element={<Register />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;