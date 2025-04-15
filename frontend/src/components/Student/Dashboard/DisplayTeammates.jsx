import React, { useState, useEffect } from "react";
import {
  Users,
  ChevronRight,
  MessageCircle,
  Search,
  Filter,
  User,
  BookOpen,
  MapPin,
  Briefcase,
  Code,
  X,
  Send,
  Paperclip,
  ChevronLeft,
  Calendar,
  Award,
  Clock,
  UserPlus,
  Check,
} from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../../../context/UserContext";
import ChatModal from "../ChatModal";
import StudentPlaceholder from "../../../public/student_placeholder.png";

const DisplayTeammates = ({
  userData: propUserData,
  isFullPage = false,
  isRecommendations = false,
}) => {
  const navigate = useNavigate();
  const { userData: contextUserData } = useUser();
  const userData = propUserData || contextUserData;

  const [teammates, setTeammates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [skillFilter, setSkillFilter] = useState("");
  const [purposeFilter, setPurposeFilter] = useState("all");

  // Chat modal state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeChatUser, setActiveChatUser] = useState(null);

  // Team invitation state
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [selectedTeammateToInvite, setSelectedTeammateToInvite] =
    useState(null);
  const [teamsList, setTeamsList] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [inviteRole, setInviteRole] = useState("Member");
  const [inviteMessage, setInviteMessage] = useState("");
  const [inviteStatus, setInviteStatus] = useState({ type: "", message: "" });

  // Track which teammates have already been invited to which teams
  const [invitedTeammates, setInvitedTeammates] = useState({});

  // Function to handle opening teammate profile
  const handleViewProfile = (teammateId) => {
    navigate(`/student/teammate/${teammateId}`);
  };

  // Function to handle opening chat
  const handleOpenChat = (teammate) => {
    console.log("Opening chat with teammate:", teammate);
    if (teammate && teammate._id) {
      setActiveChatUser(teammate);
      setIsChatOpen(true);
    } else {
      console.error("Cannot open chat: teammate is missing _id", teammate);
    }
  };

  // Function to handle closing chat
  const handleCloseChat = () => {
    setIsChatOpen(false);
    setActiveChatUser(null);
  };

  // Function to fetch teams where user is a leader
  useEffect(() => {
    const fetchUserTeams = async () => {
      if (!userData || !userData._id) return;

      try {
        const response = await axios.get(
          `http://localhost:4000/api/teams/my-teams?studentId=${userData._id}`
        );

        if (response.data && response.data.success) {
          const leaderTeams = response.data.teams.filter(
            (team) => team.isLeader
          );
          setTeamsList(leaderTeams);
          if (leaderTeams.length > 0) {
            setSelectedTeamId(leaderTeams[0]._id);
          }
        }
      } catch (err) {
        console.error("Error fetching user teams:", err);
      }
    };

    fetchUserTeams();
  }, [userData]);

  // Function to fetch pending invitations
  useEffect(() => {
    const fetchPendingInvitations = async () => {
      if (!teamsList.length || !userData || !userData._id) return;

      try {
        // Create a map to track which teammates are already invited to which teams
        const invitationMap = {};

        // For each team where user is leader, get pending invitations
        await Promise.all(
          teamsList.map(async (team) => {
            const response = await axios.get(
              `http://localhost:4000/api/teams/${team._id}/invitations?status=pending`
            );

            if (
              response.data &&
              response.data.success &&
              Array.isArray(response.data.invitations)
            ) {
              // For each invitation, mark the student as invited to this team
              response.data.invitations.forEach((invitation) => {
                if (invitation.studentId) {
                  // If we don't have an entry for this teammate yet, create one
                  if (!invitationMap[invitation.studentId]) {
                    invitationMap[invitation.studentId] = [];
                  }

                  // Add this team to the list of teams the teammate is invited to
                  invitationMap[invitation.studentId].push({
                    teamId: team._id,
                    teamName: team.name,
                  });
                }
              });
            }
          })
        );

        setInvitedTeammates(invitationMap);
      } catch (err) {
        console.error("Error fetching pending invitations:", err);
      }
    };

    fetchPendingInvitations();
  }, [teamsList, userData]);

  // Function to check if a teammate has already been invited to a team
  const isAlreadyInvited = (teammateId, teamId) => {
    if (!invitedTeammates[teammateId]) return false;
    return invitedTeammates[teammateId].some((team) => team.teamId === teamId);
  };

  // Function to check if a teammate has already been invited to any team
  const hasAnyInvitation = (teammateId) => {
    return (
      invitedTeammates[teammateId] && invitedTeammates[teammateId].length > 0
    );
  };

  // Function to get the team name for an already invited teammate
  const getInvitedTeamName = (teammateId) => {
    if (
      !invitedTeammates[teammateId] ||
      invitedTeammates[teammateId].length === 0
    ) {
      return null;
    }

    // If invited to multiple teams, show first one with "+ more"
    if (invitedTeammates[teammateId].length > 1) {
      return `${invitedTeammates[teammateId][0].teamName} + ${
        invitedTeammates[teammateId].length - 1
      } more`;
    }

    return invitedTeammates[teammateId][0].teamName;
  };

  // Function to open invite modal for a specific teammate
  const handleOpenInviteModal = (teammate) => {
    setSelectedTeammateToInvite(teammate);
    setIsInviteModalOpen(true);
    setInviteMessage(
      `Hi ${teammate.name}, I'd like to invite you to join my team.`
    );
  };

  // Function to send invitation
  const handleSendInvite = async (e) => {
    e.preventDefault();

    if (!selectedTeamId || !selectedTeammateToInvite || !userData) {
      setInviteStatus({
        type: "error",
        message: "Missing required information",
      });
      return;
    }

    // Check if already invited to this team
    if (isAlreadyInvited(selectedTeammateToInvite._id, selectedTeamId)) {
      setInviteStatus({
        type: "error",
        message: `${selectedTeammateToInvite.name} has already been invited to this team`,
      });
      return;
    }

    try {
      setInviteStatus({ type: "loading", message: "Sending invitation..." });

      const response = await axios.post(
        "http://localhost:4000/api/teams/invite",
        {
          teamId: selectedTeamId,
          studentId: selectedTeammateToInvite._id,
          role: inviteRole,
          message: inviteMessage,
          inviterId: userData._id,
        }
      );

      if (response.data && response.data.success) {
        setInviteStatus({
          type: "success",
          message: `Invitation sent to ${selectedTeammateToInvite.name}`,
        });

        // Update the invitedTeammates state to include this new invitation
        setInvitedTeammates((prev) => {
          const updated = { ...prev };

          if (!updated[selectedTeammateToInvite._id]) {
            updated[selectedTeammateToInvite._id] = [];
          }

          // Find the team info
          const teamInfo = teamsList.find((t) => t._id === selectedTeamId);

          // Add the new invitation
          updated[selectedTeammateToInvite._id].push({
            teamId: selectedTeamId,
            teamName: teamInfo?.name || "Your team",
          });

          return updated;
        });

        // Reset and close modal after success
        setTimeout(() => {
          setIsInviteModalOpen(false);
          setInviteStatus({ type: "", message: "" });
          setSelectedTeammateToInvite(null);
          setInviteRole("Member");
          setInviteMessage("");
        }, 2000);
      } else {
        setInviteStatus({
          type: "error",
          message: response.data?.message || "Failed to send invitation",
        });
      }
    } catch (err) {
      console.error("Error sending invitation:", err);
      setInviteStatus({
        type: "error",
        message: err.response?.data?.message || "Failed to send invitation",
      });
    }
  };

  useEffect(() => {
    const fetchTeammates = async () => {
      try {
        setLoading(true);

        // Get current user from localStorage
        const currentUser = JSON.parse(localStorage.getItem("user")) || {};

        // Get user ID and email
        const uid = userData?.firebaseUID || currentUser?.uid || "";

        // Build query parameters
        let queryParams = new URLSearchParams();

        if (purposeFilter !== "all") {
          queryParams.append("purpose", purposeFilter);
        }

        if (skillFilter) {
          queryParams.append("skills", skillFilter);
        }

        // Determine which endpoint to use
        let endpoint;
        if (isRecommendations) {
          endpoint = `http://localhost:8000/api/recommend_students/`;
        } else {
          endpoint = `http://localhost:4000/api/student/teammates/${uid}`;
        }

        // Add query parameters to endpoint if any exist
        if (queryParams.toString()) {
          endpoint += `?${queryParams.toString()}`;
        }
        console.log(userData);

        const response = await axios.post(endpoint, {
          userData,
        });
        console.log(response);
        // Process the response based on its structure
        if (
          response.data &&
          response.data.success &&
          Array.isArray(response.data.teammates)
        ) {
          setTeammates(response.data.teammates);
        } else {
          console.warn("Unexpected response format:", response.data);
          setTeammates([]);
        }
      } catch (err) {
        console.error("Error fetching teammates:", err);
        setError(`Failed to load teammates: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchTeammates();
  }, [userData, isRecommendations, purposeFilter, skillFilter]);

  // Filter teammates based on search term
  const filteredTeammates = teammates.filter((teammate) => {
    const matchesSearch =
      searchTerm === "" ||
      teammate.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teammate.education?.institution
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      teammate.education?.degree
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  // Helper function to get purpose icon and color
  const getPurposeDisplay = (purpose) => {
    switch (purpose) {
      case "Project":
        return {
          icon: <Code size={12} className="mr-1 text-indigo-500" />,
          text: "Looking for project teammates",
          bgColor: "bg-indigo-50",
          textColor: "text-indigo-700",
        };
      case "Hackathon":
        return {
          icon: <Calendar size={12} className="mr-1 text-purple-500" />,
          text: "Looking for hackathon team",
          bgColor: "bg-purple-50",
          textColor: "text-purple-700",
        };
      case "Both":
        return {
          icon: <Users size={12} className="mr-1 text-emerald-500" />,
          text: "Open to Projects & Hackathons",
          bgColor: "bg-emerald-50",
          textColor: "text-emerald-700",
        };
      default:
        return {
          icon: <User size={12} className="mr-1 text-gray-500" />,
          text: "Looking for teammates",
          bgColor: "bg-gray-50",
          textColor: "text-gray-700",
        };
    }
  };

  // Team Invitation Modal component
  const InviteToTeamModal = () => (
    <div className="fixed inset-0 bg-[#121212]/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#1A1A1A] rounded-lg shadow-lg p-6 w-full max-w-md border border-gray-800 hover:border-[#E8C848]/30 transition-all duration-300">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg flex items-center text-white">
            <UserPlus className="text-[#E8C848] mr-2" size={20} />
            Invite to Team
          </h3>
          <button
            onClick={() => {
              setIsInviteModalOpen(false);
              setInviteStatus({ type: "", message: "" });
            }}
            className="text-gray-400 hover:text-[#E8C848] transition-all duration-300"
          >
            <X size={20} />
          </button>
        </div>

        {selectedTeammateToInvite && (
<<<<<<< HEAD
          <div className="flex items-center mb-4 p-3 bg-gray-50 rounded-lg">
            <img
              src={
                selectedTeammateToInvite.profile_picture || StudentPlaceholder
              }
              alt={selectedTeammateToInvite.name}
=======
          <div className="flex items-center mb-4 p-3 bg-[#121212] rounded-lg">
            <img 
              src={selectedTeammateToInvite.profile_picture || StudentPlaceholder} 
              alt={selectedTeammateToInvite.name} 
>>>>>>> rdp
              className="w-10 h-10 rounded-full mr-3"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://via.placeholder.com/40?text=👤";
              }}
            />
            <div>
<<<<<<< HEAD
              <p className="font-medium">{selectedTeammateToInvite.name}</p>
              <p className="text-sm text-gray-500">
                {selectedTeammateToInvite.education?.institution || "Student"}
=======
              <p className="font-medium text-white">{selectedTeammateToInvite.name}</p>
              <p className="text-sm text-gray-400">
                {selectedTeammateToInvite.education?.institution || 'Student'}
>>>>>>> rdp
              </p>

              {/* Show if already invited */}
              {hasAnyInvitation(selectedTeammateToInvite._id) && (
                <div className="text-xs text-[#E8C848] flex items-center mt-1">
                  <Clock size={12} className="mr-1" />
                  <span>
                    Already invited to:{" "}
                    {getInvitedTeamName(selectedTeammateToInvite._id)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {inviteStatus.message && (
<<<<<<< HEAD
          <div
            className={`mb-4 p-3 rounded-lg ${
              inviteStatus.type === "success"
                ? "bg-green-50 text-green-700"
                : inviteStatus.type === "error"
                ? "bg-red-50 text-red-700"
                : "bg-blue-50 text-blue-700"
            }`}
          >
=======
          <div className={`mb-4 p-3 rounded-lg ${
            inviteStatus.type === 'success' 
              ? 'bg-[#E8C848]/10 text-[#E8C848]' 
              : inviteStatus.type === 'error'
                ? 'bg-red-400/10 text-red-400'
                : 'bg-blue-400/10 text-blue-400'
          }`}>
>>>>>>> rdp
            {inviteStatus.message}
          </div>
        )}

        <form onSubmit={handleSendInvite}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Team
            </label>
            {teamsList.length > 0 ? (
              <select
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                className="w-full p-2 border border-gray-800 rounded-lg focus:ring-2 focus:ring-[#E8C848] focus:border-[#E8C848] bg-[#121212] text-white"
                required
              >
                {teamsList.map((team) => {
                  const isInvitedToThisTeam =
                    selectedTeammateToInvite &&
                    isAlreadyInvited(selectedTeammateToInvite._id, team._id);

                  return (
                    <option
                      key={team._id}
                      value={team._id}
                      disabled={isInvitedToThisTeam}
                    >
                      {team.name} ({team.memberCount}/{team.maxTeamSize}{" "}
                      members)
                      {isInvitedToThisTeam ? " - Already invited" : ""}
                    </option>
                  );
                })}
              </select>
            ) : (
<<<<<<< HEAD
              <p className="text-red-500 text-sm">
                You must be a team leader to invite members
              </p>
=======
              <p className="text-red-400 text-sm">You must be a team leader to invite members</p>
>>>>>>> rdp
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Role
            </label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="w-full p-2 border border-gray-800 rounded-lg focus:ring-2 focus:ring-[#E8C848] focus:border-[#E8C848] bg-[#121212] text-white"
            >
              <option value="Member">Team Member</option>
              <option value="Developer">Developer</option>
              <option value="Designer">Designer</option>
              <option value="Project Manager">Project Manager</option>
              <option value="QA Tester">QA Tester</option>
              <option value="Technical Writer">Technical Writer</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Message
            </label>
            <textarea
              value={inviteMessage}
              onChange={(e) => setInviteMessage(e.target.value)}
              className="w-full p-2 border border-gray-800 rounded-lg focus:ring-2 focus:ring-[#E8C848] focus:border-[#E8C848] bg-[#121212] text-white"
              rows={3}
              required
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsInviteModalOpen(false)}
              className="px-4 py-2 bg-gray-800 text-gray-400 rounded-lg hover:bg-gray-700 hover:text-white transition-all duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#E8C848] text-black rounded-lg hover:bg-[#E8C848]/90 disabled:opacity-70 flex items-center transition-all duration-300"
              disabled={
                inviteStatus.type === "loading" ||
                teamsList.length === 0 ||
                (selectedTeammateToInvite &&
                  selectedTeamId &&
                  isAlreadyInvited(
                    selectedTeammateToInvite._id,
                    selectedTeamId
                  ))
              }
            >
              {inviteStatus.type === "loading" ? (
                "Sending..."
              ) : (
                <>
                  <Send size={16} className="mr-2" />
                  Send Invitation
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Handle loading state
  if (loading) {
    return (
<<<<<<< HEAD
      <div
        className={`bg-white rounded-xl shadow-md p-6 ${
          isFullPage ? "min-h-[600px]" : ""
        }`}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Users className="text-emerald-600" />
            {isRecommendations ? "Team Suggestions" : "Available Teammates"}
=======
      <div className={`bg-[#1A1A1A] rounded-xl shadow-lg p-6 ${isFullPage ? 'min-h-[600px]' : ''} border border-gray-800`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg flex items-center gap-2 text-white">
            <Users className="text-[#E8C848]" />
            {isRecommendations ? 'Team Suggestions' : 'Available Teammates'}
>>>>>>> rdp
          </h3>
        </div>
        <div className="flex justify-center items-center h-40">
          <div className="animate-pulse flex flex-col items-center">
            <div className="rounded-full bg-[#121212] h-12 w-12 mb-2"></div>
            <div className="h-4 bg-[#121212] rounded w-24 mb-2"></div>
            <div className="h-3 bg-[#121212] rounded w-32"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error && teammates.length === 0) {
    return (
<<<<<<< HEAD
      <div
        className={`bg-white rounded-xl shadow-md p-6 ${
          isFullPage ? "min-h-[600px]" : ""
        }`}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Users className="text-emerald-600" />
            {isRecommendations ? "Team Suggestions" : "Available Teammates"}
          </h3>
        </div>
        <div className="flex justify-center items-center h-40">
          <div className="text-center text-gray-500">
            <p className="mb-2">Failed to load teammate suggestions.</p>
            <p className="text-xs mb-3 text-red-500">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg text-sm"
=======
      <div className={`bg-[#1A1A1A] rounded-xl shadow-lg p-6 ${isFullPage ? 'min-h-[600px]' : ''} border border-gray-800`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg flex items-center gap-2 text-white">
            <Users className="text-[#E8C848]" />
            {isRecommendations ? 'Team Suggestions' : 'Available Teammates'}
          </h3>
        </div>
        <div className="flex justify-center items-center h-40">
          <div className="text-center">
            <p className="mb-2 text-gray-400">Failed to load teammate suggestions.</p>
            <p className="text-xs mb-3 text-red-400">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-[#E8C848]/10 text-[#E8C848] px-3 py-1 rounded-lg text-sm hover:bg-[#E8C848]/20 transition-all duration-300"
>>>>>>> rdp
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
<<<<<<< HEAD
    <div
      className={`${
        isFullPage ? "bg-white rounded-xl shadow-md p-6 min-h-[600px]" : ""
      } relative`}
    >
=======
    <div className={`${isFullPage ? 'bg-[#1A1A1A] rounded-xl shadow-lg p-6 min-h-[600px] border border-gray-800' : ''} relative`}>
>>>>>>> rdp
      {/* Invite modal */}
      {isInviteModalOpen && <InviteToTeamModal />}

      {isFullPage && (
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg flex items-center gap-2 text-white">
            <Users className="text-[#E8C848]" />
            Available Teammates
          </h3>
        </div>
      )}

      {/* Search and filters - only shown in full page view */}
      {isFullPage && (
        <div className="mb-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search by name or institution..."
                className="w-full pl-10 pr-4 py-2 border border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8C848] bg-[#121212] text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative w-full md:w-64">
              <Filter
                size={18}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Filter by skills..."
                className="w-full pl-10 pr-4 py-2 border border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8C848] bg-[#121212] text-white"
                value={skillFilter}
                onChange={(e) => setSkillFilter(e.target.value)}
              />
            </div>
          </div>

          {/* Purpose filter buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setPurposeFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
<<<<<<< HEAD
                purposeFilter === "all"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
=======
                purposeFilter === 'all' 
                  ? 'bg-[#E8C848]/10 text-[#E8C848]' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
              } transition-all duration-300`}
>>>>>>> rdp
            >
              All
            </button>
            <button
              onClick={() => setPurposeFilter("Project")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center ${
<<<<<<< HEAD
                purposeFilter === "Project"
                  ? "bg-indigo-100 text-indigo-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
=======
                purposeFilter === 'Project' 
                  ? 'bg-indigo-500/10 text-indigo-500' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
              } transition-all duration-300`}
>>>>>>> rdp
            >
              <Code size={14} className="mr-1" />
              Projects
            </button>
            <button
              onClick={() => setPurposeFilter("Hackathon")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center ${
<<<<<<< HEAD
                purposeFilter === "Hackathon"
                  ? "bg-purple-100 text-purple-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
=======
                purposeFilter === 'Hackathon' 
                  ? 'bg-purple-500/10 text-purple-500' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
              } transition-all duration-300`}
>>>>>>> rdp
            >
              <Calendar size={14} className="mr-1" />
              Hackathons
            </button>
            <button
              onClick={() => setPurposeFilter("Both")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center ${
<<<<<<< HEAD
                purposeFilter === "Both"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
=======
                purposeFilter === 'Both' 
                  ? 'bg-[#E8C848]/10 text-[#E8C848]' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
              } transition-all duration-300`}
>>>>>>> rdp
            >
              <Users size={14} className="mr-1" />
              Both
            </button>
          </div>
        </div>
      )}

      {/* Teammates list - in a row for recommendations, grid for full page */}
      {filteredTeammates.length > 0 ? (
        <div
          className={`${
            isRecommendations
              ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4"
              : isFullPage
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              : "grid grid-cols-1 md:grid-cols-2 gap-4"
          }`}
        >
          {filteredTeammates
            .filter((teammate) => {
              if (purposeFilter === "all") return true;
              return teammate.lookingFor?.purpose === purposeFilter;
            })
            .slice(0, isRecommendations ? 4 : undefined)
            .map((teammate) => {
              const purposeDisplay = getPurposeDisplay(
                teammate.lookingFor?.purpose
              );
              const isInvited = hasAnyInvitation(teammate._id);

              return (
<<<<<<< HEAD
                <div
                  key={teammate._id}
                  className="flex flex-col bg-gray-50 rounded-lg border border-gray-200 overflow-hidden h-[300px] hover:shadow-md cursor-pointer transition-shadow"
=======
                <div 
                  key={teammate._id} 
                  className="flex flex-col bg-[#121212] rounded-lg border border-gray-800 overflow-hidden h-[300px] hover:shadow-lg cursor-pointer transition-shadow"
>>>>>>> rdp
                  onClick={() => handleViewProfile(teammate._id)}
                >
                  <div className="p-4 flex items-start space-x-3 flex-1">
                    <img
                      src={teammate.profile_picture || StudentPlaceholder}
                      alt={teammate.name}
                      className="w-16 h-16 rounded-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://via.placeholder.com/64?text=👤";
                      }}
                    />
                    <div className="flex-1 min-w-0">
<<<<<<< HEAD
                      <p className="font-semibold text-gray-800">
                        {teammate.name}
=======
                      <p className="font-semibold text-white">{teammate.name}</p>
                      <p className="text-sm text-gray-400 truncate">
                        {teammate.education?.institution || 'Student'}
>>>>>>> rdp
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {teammate.education?.institution || "Student"}
                      </p>

                      {/* What they're looking for */}
                      <div
                        className={`flex items-center ${purposeDisplay.bgColor} ${purposeDisplay.textColor} text-xs px-2 py-0.5 rounded-full mt-2 w-fit`}
                      >
                        {purposeDisplay.icon}
                        <span>{purposeDisplay.text}</span>
                      </div>

                      {/* Additional badges for "Both" type */}
                      {teammate.lookingFor?.purpose === "Both" && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          <span className="bg-indigo-500/10 text-indigo-500 text-xs px-2 py-0.5 rounded-full flex items-center">
                            <Code size={12} className="mr-1" /> Projects
                          </span>
                          <span className="bg-purple-500/10 text-purple-500 text-xs px-2 py-0.5 rounded-full flex items-center">
                            <Calendar size={12} className="mr-1" /> Hackathons
                          </span>
                        </div>
                      )}

                      {/* Urgency indicator if they have one */}
                      {teammate.lookingFor?.urgencyLevel && (
<<<<<<< HEAD
                        <div
                          className={`flex items-center mt-2 text-xs ${
                            teammate.lookingFor.urgencyLevel === "High"
                              ? "text-red-600"
                              : teammate.lookingFor.urgencyLevel === "Medium"
                              ? "text-orange-600"
                              : "text-blue-600"
                          }`}
                        >
=======
                        <div className={`flex items-center mt-2 text-xs ${
                          teammate.lookingFor.urgencyLevel === 'High' 
                            ? 'text-red-400' 
                            : teammate.lookingFor.urgencyLevel === 'Medium'
                              ? 'text-orange-400'
                              : 'text-blue-400'
                        }`}>
>>>>>>> rdp
                          <Clock size={12} className="mr-1" />
                          <span>
                            {teammate.lookingFor.urgencyLevel === "High"
                              ? "Urgent - needs teammates soon"
                              : teammate.lookingFor.urgencyLevel === "Medium"
                              ? "Looking for teammates soon"
                              : "No rush - open to collaborate"}
                          </span>
                        </div>
                      )}
<<<<<<< HEAD

                      {Array.isArray(teammate.skills) &&
                        teammate.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {teammate.skills.slice(0, 3).map((skill, i) => (
                              <span
                                key={i}
                                className="bg-emerald-50 text-emerald-700 text-xs px-2 py-0.5 rounded-full"
                              >
                                {skill}
                              </span>
                            ))}
                            {teammate.skills.length > 3 && (
                              <span className="text-xs text-gray-500">
                                +{teammate.skills.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                    </div>
                  </div>

                  <div className="p-4 border-t border-gray-200 bg-gray-50">
                    {/* Desired skills */}
                    {teammate.lookingFor?.desiredSkills &&
                      teammate.lookingFor.desiredSkills.length > 0 && (
                        <div className="flex items-start mt-1 text-xs text-gray-600 mb-2">
                          <Award
                            size={12}
                            className="mr-1 mt-0.5 flex-shrink-0"
                          />
                          <span>
                            <span className="font-medium">Looking for: </span>
                            {teammate.lookingFor.desiredSkills
                              .slice(0, 3)
                              .join(", ")}
                            {teammate.lookingFor.desiredSkills.length > 3 &&
                              " + more"}
                          </span>
                        </div>
                      )}

=======
                      
                      {Array.isArray(teammate.skills) && teammate.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {teammate.skills.slice(0, 3).map((skill, i) => (
                            <span key={i} className="bg-[#E8C848]/10 text-[#E8C848] text-xs px-2 py-0.5 rounded-full">
                              {skill}
                            </span>
                          ))}
                          {teammate.skills.length > 3 && (
                            <span className="text-xs text-gray-400">+{teammate.skills.length - 3} more</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-4 border-t border-gray-800 bg-[#121212]">
                    {/* Desired skills */}
                    {teammate.lookingFor?.desiredSkills && teammate.lookingFor.desiredSkills.length > 0 && (
                      <div className="flex items-start mt-1 text-xs text-gray-400 mb-2">
                        <Award size={12} className="mr-1 mt-0.5 flex-shrink-0" />
                        <span>
                          <span className="font-medium">Looking for: </span>
                          {teammate.lookingFor.desiredSkills.slice(0, 3).join(', ')}
                          {teammate.lookingFor.desiredSkills.length > 3 && ' + more'}
                        </span>
                      </div>
                    )}
                    
>>>>>>> rdp
                    {/* Location */}
                    {teammate.location && (
                      <div className="flex items-center mt-1 text-xs text-gray-400 mb-2">
                        <MapPin size={12} className="mr-1" />
                        <span>
                          {typeof teammate.location === "string"
                            ? teammate.location
                            : `${teammate.location.city || ""} ${
                                teammate.location.country || ""
                              }`}
                        </span>
                      </div>
                    )}

                    <div
                      className="flex gap-2 mt-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenChat(teammate);
<<<<<<< HEAD
                        }}
                        className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-sm flex items-center justify-center hover:bg-gray-200"
=======
                        }} 
                        className="bg-gray-800 text-gray-400 px-3 py-1 rounded-lg text-sm flex items-center justify-center hover:bg-gray-700 hover:text-white transition-all duration-300"
>>>>>>> rdp
                      >
                        <MessageCircle size={14} className="mr-1" /> Chat
                      </button>

                      {/* Conditionally render invite button or "Already Invited" label */}
                      {teamsList.length > 0 &&
                        (isInvited ? (
                          <button
                            disabled
                            className="bg-[#E8C848]/10 text-[#E8C848] px-3 py-1 rounded-lg text-sm flex items-center justify-center cursor-default"
                          >
                            <Check size={14} className="mr-1" /> Invited
                          </button>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenInviteModal(teammate);
                            }}
                            className="bg-[#E8C848]/10 text-[#E8C848] px-3 py-1 rounded-lg text-sm flex items-center justify-center hover:bg-[#E8C848]/20 transition-all duration-300"
                          >
                            <UserPlus size={14} className="mr-1" /> Invite
                          </button>
                        ))}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewProfile(teammate._id);
                        }}
                        className="bg-[#E8C848]/10 text-[#E8C848] px-3 py-1 rounded-lg text-sm flex-1 hover:bg-[#E8C848]/20 transition-all duration-300"
                      >
                        View Profile
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      ) : (
        <div className="text-center py-10">
<<<<<<< HEAD
          <User size={48} className="mx-auto text-gray-300 mb-3" />
          <h4 className="text-lg font-medium text-gray-500 mb-1">
            No teammates found
          </h4>
=======
          <User size={48} className="mx-auto text-gray-800 mb-3" />
          <h4 className="text-lg font-medium text-gray-400 mb-1">No teammates found</h4>
>>>>>>> rdp
          <p className="text-gray-400 text-sm">
            {isFullPage
              ? purposeFilter !== "all"
                ? purposeFilter === "Both"
                  ? "No one is currently looking for both project and hackathon teammates."
                  : `No one is currently looking for ${purposeFilter.toLowerCase()} teammates.`
                : "Try adjusting your search or filter criteria."
              : "We're adding more teammate suggestions soon."}
          </p>
        </div>
      )}

      {/* Pagination or more teammates button - only in full page view */}
      {isFullPage && filteredTeammates.length > 8 && (
        <div className="mt-6 flex justify-center">
          <button className="bg-[#E8C848]/10 text-[#E8C848] px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#E8C848]/20 transition-all duration-300">
            Load More Teammates
          </button>
        </div>
      )}

      {/* Chat Modal */}
      <ChatModal
        isOpen={isChatOpen}
        onClose={handleCloseChat}
        user={activeChatUser}
        currentUser={userData}
      />
    </div>
  );
};

export default DisplayTeammates;
