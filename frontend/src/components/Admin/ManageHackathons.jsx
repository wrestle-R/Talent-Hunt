import React, { useState, useEffect } from 'react';
import { CalendarDays, ArrowLeft, Plus, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CreateHackathon from './CreateHackathon';
import HackathonList from './HackathonList';

const ManageHackathons = () => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('list');
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingHackathon, setEditingHackathon] = useState(null);
  
  const user = JSON.parse(localStorage.getItem("user"));
  console.log(user.uid);

  // Load hackathons on component mount
  useEffect(() => {
    fetchHackathons();
  }, []);

  // Fetch hackathons from API
  const fetchHackathons = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:4000/api/admin/hackathons', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setHackathons(response.data.hackathons || []);
    } catch (err) {
      console.error("Error fetching hackathons:", err);
      setError(err.response?.data?.message || "Failed to load hackathons. Please try again.");
    } finally {
      setLoading(false);
    }
  };
// Remove these duplicate functions and keep just one fixed version:

// Handle new hackathon creation
const handleHackathonCreate = async (hackathonData) => {
  try {
    setLoading(true);
    
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem("user"));
    
    // Add the adminUid to the request body
    const dataWithUid = {
      ...hackathonData,
      adminUid: user.uid // Include the admin's UID in the request body
    };
    
    const response = await axios.post(
      'http://localhost:4000/api/admin/hackathons',
      dataWithUid, // Send the updated data with UID
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    if (response.data.success) {
      await fetchHackathons(); // Refresh the list with latest data
      setActiveView('list');
    }
  } catch (err) {
    console.error("Error creating hackathon:", err);
    alert(err.response?.data?.message || "Failed to create hackathon");
  } finally {
    setLoading(false);
  }
};

// Also add the missing handleHackathonUpdate function
const handleHackathonUpdate = async (hackathonId, hackathonData) => {
  try {
    setLoading(true);
    
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem("user"));
    
    // Add the adminUid to the request body for consistency
    const dataWithUid = {
      ...hackathonData,
      adminUid: user.uid
    };
    
    const response = await axios.put(
      `http://localhost:4000/api/admin/hackathons/${hackathonId}`,
      dataWithUid,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    if (response.data.success) {
      await fetchHackathons(); // Refresh the list with latest data
      setActiveView('list');
      setEditingHackathon(null);
    }
  } catch (err) {
    console.error("Error updating hackathon:", err);
    alert(err.response?.data?.message || "Failed to update hackathon");
  } finally {
    setLoading(false);
  }
};


  // Handle hackathon delete
  const handleHackathonDelete = async (hackathonId) => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `http://localhost:4000/api/admin/hackathons/${hackathonId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        await fetchHackathons(); // Refresh the list with latest data
      }
    } catch (err) {
      console.error("Error deleting hackathon:", err);
      alert(err.response?.data?.message || "Failed to delete hackathon");
    } finally {
      setLoading(false);
    }
  };

  // Start editing a hackathon
  const startEditing = (hackathon) => {
    setEditingHackathon(hackathon);
    setActiveView('edit');
  };

  // Loading state
  if (loading && hackathons.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && hackathons.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-lg">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="text-red-500" />
            <h3 className="font-semibold text-lg">Error Loading Hackathons</h3>
          </div>
          <p className="mb-4">{error}</p>
          <div className="flex gap-3">
            <button 
              className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded font-medium"
              onClick={() => fetchHackathons()}
            >
              Try Again
            </button>
            <button
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded"
              onClick={() => navigate('/admin/hero')}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Back button */}
      <button 
        className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-800"
        onClick={() => navigate('/admin/hero')}
      >
        <ArrowLeft size={16} />
        Back to Dashboard
      </button>
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <CalendarDays className="text-blue-600" />
          Hackathon Management
        </h1>
        {activeView === 'list' && (
          <button 
            onClick={() => setActiveView('create')}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={18} /> New Hackathon
          </button>
        )}
      </div>
      
      {/* Empty state when no hackathons exist */}
      {!loading && hackathons.length === 0 && activeView === 'list' && (
        <div className="bg-white rounded-xl shadow-md p-10 text-center">
          <div className="flex flex-col items-center gap-4 max-w-md mx-auto">
            <CalendarDays size={48} className="text-blue-200" />
            <h2 className="text-xl font-semibold text-gray-700">No Hackathons Found</h2>
            <p className="text-gray-500 mb-4">
              You haven't created any hackathons yet. Create your first hackathon to see it here.
            </p>
            <button 
              onClick={() => setActiveView('create')}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              <Plus size={18} /> Create Your First Hackathon
            </button>
          </div>
        </div>
      )}
      
      {/* Main content - conditionally render based on activeView */}
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
          onSubmit={(updatedData) => handleHackathonUpdate(editingHackathon._id, updatedData)}
          onCancel={() => {
            setActiveView('list');
            setEditingHackathon(null);
          }} 
        />
      )}
      
      {activeView === 'list' && hackathons.length > 0 && (
        <HackathonList 
          hackathons={hackathons} 
          onEdit={startEditing} 
          onDelete={handleHackathonDelete} 
        />
      )}
    </div>
  );
};

export default ManageHackathons;