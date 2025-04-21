import React, { useState, useEffect } from 'react';
import { CalendarDays, ArrowLeft, Plus, AlertCircle, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import HackathonParticipantManager from './HackathonParticipantManager';

// Add your API base URL directly here
const API_BASE_URL = "http://localhost:4000"; // or your deployed backend URL

const ManageHackathons = () => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('list');
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingHackathon, setEditingHackathon] = useState(null);
  const [selectedHackathon, setSelectedHackathon] = useState(null);
  
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetchHackathons();
  }, []);

  const fetchHackathons = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/admin/hackathons`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setHackathons(response.data.hackathons || []);
    } catch (err) {
      console.error("Error fetching hackathons:", err);
      setError(err.response?.data?.message || "Failed to load hackathons");
    } finally {
      setLoading(false);
    }
  };

  const handleManageParticipants = (hackathon) => {
    setSelectedHackathon(hackathon);
    setActiveView('participants');
  };

  const handleHackathonCreate = async (hackathonData) => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem("user"));
      
      if (!user?.uid) {
        throw new Error("User authentication required");
      }

      // Map frontend fields to backend expected fields
      const requestData = {
        ...hackathonData,
        adminUid: user.uid,
        prizePool: Number(hackathonData.prizePool),
        totalCapacity: Number(hackathonData.totalCapacity),
        primaryDomain: hackathonData.primaryDomain || hackathonData.domain, // ensure correct field
        primaryProblemStatement: hackathonData.primaryProblemStatement || hackathonData.problemStatement, // ensure correct field
        registration: {
          totalCapacity: Number(hackathonData.totalCapacity),
          currentlyRegistered: 0,
          requiredTeamSize: 4
        }
      };

      // Remove possible legacy fields to avoid backend confusion
      delete requestData.domain;
      delete requestData.problemStatement;

      const response = await axios.post(
        `${API_BASE_URL}/api/admin/hackathons`,
        requestData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        await fetchHackathons();
        setActiveView('list');
        // Optional: Show success message
        alert("Hackathon created successfully!");
      }
    } catch (err) {
      console.error("Error creating hackathon:", err);
      alert(err.response?.data?.message || "Failed to create hackathon");
    } finally {
      setLoading(false);
    }
  };

  const handleHackathonUpdate = async (hackathonId, hackathonData) => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('token');
      
      // Validate required fields
      if (!hackathonData.primaryDomain || !hackathonData.primaryProblemStatement) {
        throw new Error("Primary domain and problem statement are required");
      }

      // Ensure team size is exactly 4
      hackathonData.registration = {
        ...hackathonData.registration,
        requiredTeamSize: 4
      };
      
      const response = await axios.put(
        `${API_BASE_URL}/api/admin/hackathons/${hackathonId}`,
        {
          ...hackathonData,
          adminUid: user.uid
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.success) {
        await fetchHackathons();
        setActiveView('list');
        setEditingHackathon(null);
      }
    } catch (err) {
      console.error("Error updating hackathon:", err);
      alert(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleHackathonDelete = async (hackathonId) => {
    if (!window.confirm('Are you sure you want to delete this hackathon?')) {
      return;
    }

    try {
      setLoading(true);
      
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `${API_BASE_URL}/api/admin/hackathons/${hackathonId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.success) {
        await fetchHackathons();
      }
    } catch (err) {
      console.error("Error deleting hackathon:", err);
      alert(err.response?.data?.message || "Failed to delete hackathon");
    } finally {
      setLoading(false);
    }
  };

  const renderHackathonCard = (hackathon) => (
    <div key={hackathon._id} className="bg-[#1A1A1A] rounded-xl shadow-lg border border-gray-800 p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold mb-2 text-white font-montserrat">{hackathon.hackathonName}</h3>
          <div className="flex gap-4 text-sm text-gray-400">
            <span className="flex items-center gap-1">
              <Users size={16} className="text-[#E8C848]" />
              {hackathon.registration.currentlyRegistered}/{hackathon.registration.totalCapacity}
            </span>
            <span>Teams of {hackathon.registration.requiredTeamSize}</span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => {
              setEditingHackathon(hackathon);
              setActiveView('edit');
            }}
            className="px-3 py-1 text-[#E8C848] hover:bg-[#E8C848]/20 rounded-md transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => handleHackathonDelete(hackathon._id)}
            className="px-3 py-1 text-red-400 hover:bg-red-500/20 rounded-md transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="mb-2">
          <span className="text-sm font-medium text-gray-300">Domain:</span>
          <span className="ml-2 bg-[#E8C848]/20 text-[#E8C848] px-2 py-0.5 rounded-full text-sm">
            {hackathon.primaryDomain}
          </span>
        </div>
        <div>
          <span className="text-sm font-medium text-gray-300">Problem Statement:</span>
          <p className="mt-1 text-gray-400 text-sm line-clamp-2">
            {hackathon.primaryProblemStatement}
          </p>
        </div>
      </div>
      
      <div className="border-t border-gray-800 pt-4">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="block text-gray-400">Teams</span>
            <span className="font-medium text-white">{hackathon.teamApplicants?.length || 0}</span>
          </div>
          <div>
            <span className="block text-gray-400">Individual Applicants</span>
            <span className="font-medium text-white">{hackathon.individualApplicants?.length || 0}</span>
          </div>
          <div>
            <span className="block text-gray-400">Temporary Teams</span>
            <span className="font-medium text-white">{hackathon.temporaryTeams?.length || 0}</span>
          </div>
        </div>
      </div>
      
      <div className="border-t border-gray-800 mt-4 pt-4 flex gap-2">
        <button
          onClick={() => navigate(`/admin/hackathons/${hackathon._id}/participants`)}
          className="text-sm bg-[#E8C848]/20 text-[#E8C848] px-3 py-1 rounded-md hover:bg-[#E8C848]/30 transition-colors"
        >
          <Users className="w-4 h-4 inline mr-1" />
          Manage Participants
        </button>
      </div>
    </div>
  );

  if (loading && hackathons.length === 0) {
    return (
      <div className="container mx-auto p-6 bg-[#111111]">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E8C848]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 bg-[#111111] min-h-screen">
      <button 
        className="mb-6 flex items-center gap-2 text-gray-400 hover:text-[#E8C848] transition-colors"
        onClick={() => navigate('/admin/hero')}
      >
        <ArrowLeft size={16} />
        Back to Dashboard
      </button>
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2 text-white font-montserrat">
          <CalendarDays className="text-[#E8C848]" />
          Manage Hackathons
        </h1>
        {activeView === 'list' && (
          <button 
            onClick={() => setActiveView('create')}
            className="flex items-center gap-2 bg-[#E8C848] hover:bg-[#E8C848]/90 text-gray-900 px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={18} /> New Hackathon
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-800 text-red-200 p-4 rounded-lg mb-6">
          <div className="flex items-center gap-2">
            <AlertCircle size={20} />
            <p>{error}</p>
          </div>
        </div>
      )}

      {activeView === 'create' && (
        <CreateHackathon 
          onSubmit={handleHackathonCreate}
          onCancel={() => setActiveView('list')}
        />
      )}

      {activeView === 'edit' && editingHackathon && (
        <CreateHackathon 
          hackathon={editingHackathon}
          isEditing={true}
          onSubmit={(data) => handleHackathonUpdate(editingHackathon._id, data)}
          onCancel={() => {
            setActiveView('list');
            setEditingHackathon(null);
          }}
        />
      )}

      {activeView === 'participants' && selectedHackathon && (
        <HackathonParticipantManager 
          hackathonId={selectedHackathon._id}
          onBack={() => setActiveView('list')}
        />
      )}

      {activeView === 'list' && (
        <div className="grid gap-6">
          {hackathons.length === 0 ? (
            <div className="text-center py-12 bg-[#1A1A1A] rounded-lg shadow">
              <CalendarDays size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-medium text-gray-300 mb-2">No Hackathons Yet</h3>
              <p className="text-gray-500 mb-4">Create your first hackathon to get started</p>
              <button
                onClick={() => setActiveView('create')}
                className="bg-[#E8C848] text-gray-900 px-4 py-2 rounded-lg hover:bg-[#E8C848]/90 transition-colors"
              >
                Create Hackathon
              </button>
            </div>
          ) : (
            hackathons.map(renderHackathonCard)
          )}
        </div>
      )}
    </div>
  );
};

export default ManageHackathons;