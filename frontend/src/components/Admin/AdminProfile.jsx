import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Building, Save } from 'lucide-react';

const AdminProfile = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user || !user.uid) {
    console.error("User not found in localStorage");
  }

  // Fetch admin profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!user || !user.uid) {
          setLoading(false);
          return;
        }
        
        const response = await axios.get(
          `http://localhost:4000/api/admin/profile/${user.uid}`,
        );
        
        if (response.data) {
          setFormData({
            name: response.data.name || '',
            email: response.data.email || '',
            organization: response.data.organization || ''
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, []);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      
      if (!user || !user.uid) {
        alert("User not found. Please log in again.");
        return;
      }
    
      await axios.put(
        `http://localhost:4000/api/admin/profile/${user.uid}`,
        formData,
      );
      
      alert("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return <div className="flex justify-center p-8">Loading profile...</div>;
  }
  
  return (
    <div className="max-w-4xl mx-auto p-4 bg-gray-50">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <User className="text-blue-600" /> Admin Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                readOnly
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Organization</label>
              <div className="flex">
                <div className="flex-none flex items-center bg-gray-100 px-3 border border-r-0 border-gray-300 rounded-l-md">
                  <Building size={16} className="text-gray-500" />
                </div>
                <input
                  type="text"
                  name="organization"
                  value={formData.organization}
                  onChange={handleChange}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              <>
                <Save size={18} />
                Save Profile
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminProfile;