import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Register from './components/Register';
import StudentHero from './components/Student/StudentHero';
import MentorHero from './components/Mentor/MentorHero';
import MentorProfile from "./components/Mentor/MentorProfile";
import StudentProfile from "./components/Student/StudentProfile";
import StudentNewProject from "./components/Student/StudentNewProject";
import AdminHero from './components/Admin/AdminHero';
import TeammatesPage from './components/Student/TeammatesPage';
import MentorsPage from './components/Student/Dashboard/MentorsPage';
import { UserProvider } from '../context/UserContext';
import HackathonPage from './components/Student/Dashboard/HackathonPage';
import HackathonDetail from './components/Student/Dashboard/HackathonDetail';
import AdminModeration from './components/Moderator/ModeratorModeration';
import HackathonStatus from './components/Student/Hackathon/HacakthonStatus';
import AllConversationsPage from './components/Student/Dashboard/AllConversationPage';
import AllProjectsPage from './components/Student/Dashboard/AllProjectsPage';
import ModeratorDashboard from './components/Moderator/ModeratorDashboard';
import Messages from "./components/Moderator/Messages/Messages";
import MessageDetails from "./components/Moderator/Messages/MessageDetails";
import ConversationView from "./components/Moderator/Messages/ConversationView";
import UserMessages from "./components/Moderator/Messages/UserMessages";
import ProjectManagement from "./components/Moderator/Projects/ProjectManagement";
import ProjectDetail from "./components/Moderator/Projects/ProjectDetail";
import NotesManagement from "./components/Moderator/Projects/NotesManagement";
import NoteDetail from "./components/Moderator/Projects/NoteDetail";
import TeammateProfile from './components/Student/Dashboard/TeammateProfile'
import MentorDetail from "./components/Student/Dashboard/MentorDetail"
import CreateTeam from "./components/Student/Dashboard/Team/CreateTeam"
import TeamDetails from "./components/Student/Dashboard/Team/TeamDetails"
import JoinTeam from "./components/Student/Dashboard/Team/JoinTeam"
import TeamManage from './components/Student/Dashboard/Team/TeamManage';
import TeamStudentProfile from './components/Student/Dashboard/Team/StudentProfile'
import TeamProjects from './components/Student/Dashboard/Team/TeamProjects'
import TeamMentorManager from './components/Student/Dashboard/Team/Mentor/TeamMentorManager';
import TeamMentorProfile from './components/Student/Dashboard/Team/Mentor/MentorProfile';
import Landing from './components/Landing'
import HackathonParticipantManager from './components/Admin/HackathonParticipantManager'
import ManageHackathons from './components/Admin/ManageHackathons'
import ManageHackathonTeams from "./components/Admin/ManagehackathonTeams"

const role = localStorage.userRole
console.log(role)
const App = () => {
  return (
    <UserProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <div className="flex-grow">
            <Routes>
              {/* Student Routes */}
              <Route path="/student/hero" element={<StudentHero />} />
              <Route path="/student/profile" element={<StudentProfile />} />
              <Route path="/student/new-project" element={<StudentNewProject />} />
              <Route path="/student/teammates" element={<TeammatesPage />} />
              <Route path="/student/mentors" element={<MentorsPage />} />
              <Route path="/student/conversations" element={<AllConversationsPage/>}/>
              <Route path="/student/projects" element={<AllProjectsPage/>} />
              <Route path="/student/teammate/:teammateId" element={<TeammateProfile />} />
              <Route path="/student/mentor/:mentorId" element={<MentorDetail />} />
              <Route path="/student/team/create" element={<CreateTeam />} />
              <Route path="/student/team/join" element={<JoinTeam />} />
              <Route path="/student/team/:teamId" element={<TeamDetails />} />
              <Route path="/student/team/manage/:teamId" element={<TeamManage />} />
              <Route path="/student/profile/:studentId" element={<TeamStudentProfile/>} /> 
              <Route path="/student/team/:teamId/projects" element={<TeamProjects />} />
              <Route path="/student/team/:teamId/mentors" element={<TeamMentorManager />} />
              <Route path="/student/team/mentor/:mentorId" element={<TeamMentorProfile />} />

              {/* Hackathon Routes */}
              <Route path="/student/hackathons" element={<HackathonPage />} />
              <Route path="/student/hackathon/:id" element={<HackathonDetail />} />
              <Route path="/student/hackathon-status" element={<HackathonStatus />} />
              
              {/* Mentor Routes */}
              <Route path="/mentor/hero" element={<MentorHero />} />
              <Route path="/mentor/profile" element={<MentorProfile />} />
              
              {/* Admin Routes */}
              <Route path="/admin/hero" element={<AdminHero />} /> 
              <Route path="/admin/hackathons" element={<ManageHackathons />} />
              <Route path="/admin/hackathons/:hackathonId/participants" element={ <HackathonParticipantManager />}/>
              <Route path="/admin/hackathon_applications" element={<ManageHackathons />} />
              <Route path="/admin/hackathon-applications" element={<ManageHackathons />} /> {/* Add this route */}
{/* Admin Routes */}
<Route path="/admin/hero" element={<AdminHero />} /> 
<Route path="/admin/hackathons" element={<ManageHackathons />} />
<Route path="/admin/hackathons/:hackathonId/participants" element={<HackathonParticipantManager />}/>
<Route path="/admin/hackathon-applications" element={<ManageHackathons />} />

<Route path="/admin/hackathons/:hackathonId/teams" element={<ManageHackathonTeams />} />
              {/* Auth Routes */}
              <Route path="/register" element={<Register />} />
              
              {/* Moderator Routes */}
              <Route path="/moderator/users" element={<AdminModeration />} /> 
              <Route path="/moderator/dashboard" element={<ModeratorDashboard/>} />
              
              {/* Moderator Message Routes */}
              <Route path="/moderator/messages" element={<Messages/>} />
              <Route path="/moderator/message/:messageId" element={<MessageDetails/>} />
              <Route path="/moderator/conversation/:user1/:user2" element={<ConversationView/>} />
              <Route path="/moderator/user-messages/:userId" element={<UserMessages/>} />
              
              {/* Moderator Project Routes */}
              <Route path="/moderator/projects" element={<ProjectManagement />} />
              <Route path="/moderator/project/:projectId" element={<ProjectDetail />} />
              <Route path="/moderator/projects/flagged" element={<ProjectManagement flaggedOnly={true} />} />
              <Route path="/moderator/projects/pending" element={<ProjectManagement statusFilter="Pending" />} />
              <Route path="/moderator/projects/approved" element={<ProjectManagement statusFilter="Approved" />} />
              <Route path="/moderator/projects/rejected" element={<ProjectManagement statusFilter="Rejected" />} />
              
              {/* Moderator Notes Routes */}
              <Route path="/moderator/notes" element={<NotesManagement />} />
              <Route path="/moderator/note/:noteId" element={<NoteDetail />} />
              <Route path="/landing" element={<Landing />} />

              
              {/* Default Route */}
              {role == 'admin' &&(
              <Route path="/" element={<AdminHero />} />

              )}

              {role == 'mentor' &&(
              <Route path="/" element={<MentorHero />} />

              )}
              {
                role == 'student' && (
              <Route path="/" element={<StudentHero />} />

                )
              }
            </Routes>
          </div>
        </div>
      </Router>
    </UserProvider>
  );
};

export default App;