import React, { useState, useEffect } from 'react';
import { Users, User, Settings } from 'lucide-react';
import axios from 'axios';

const AdminDashboard = ({ userData }) => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:4000/api/admin/all');
        
        if (response.data && Array.isArray(response.data.admins)) {
          setAdmins(response.data.admins);
        }
      } catch (err) {
        console.error("Error fetching admins:", err);
        setError(`Failed to load admins: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAdmins();
  }, []);

  if (loading) {
    return (
      <div className="w-full p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-6">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          <p>{error}</p>
          <button 
            className="mt-2 bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Admin Dashboard</h2>
        <div className="flex items-center gap-4">
          <span className="text-gray-600">Welcome, {userData?.name || 'Admin'}</span>
          <button className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
            <Settings size={20} className="text-gray-600" />
          </button>
        </div>
      </div>
      
      {/* Admins List */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <User className="text-blue-600" size={24} />
          <h3 className="font-bold text-lg">Admin Management</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 tracking-wider">Name</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 tracking-wider">Email</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 tracking-wider">Organization</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 tracking-wider">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {admins.map(admin => (
                <tr key={admin._id}>
                  <td className="py-4 px-4 text-sm font-medium text-gray-900">{admin.name}</td>
                  <td className="py-4 px-4 text-sm text-gray-500">{admin.email}</td>
                  <td className="py-4 px-4 text-sm text-gray-500">{admin.organization}</td>
                  <td className="py-4 px-4 text-sm text-gray-500">{admin.role}</td>
                </tr>
              ))}
              {admins.length === 0 && (
                <tr>
                  <td colSpan="4" className="py-4 px-4 text-sm text-gray-500 text-center">
                    No admins found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Additional admin functionality can go here */}
    </div>
  );
};

export default AdminDashboard;