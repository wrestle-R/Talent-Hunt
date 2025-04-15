import React, { useState } from 'react';
import axios from 'axios';
import { X, Send } from 'lucide-react';
import { toast } from 'react-hot-toast';

const InviteMentorForm = ({ teamId, teamName, onClose, studentId }) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Please enter an email address');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.post(
        `http://localhost:4000/api/teams/${teamId}/mentors/invite`,
        {
          email: email.trim(),
          message: message || `You are invited to mentor our team ${teamName}`,
          teamId,
          inviterId: studentId
        }
      );
      
      if (response.data && response.data.success) {
        toast.success('Invitation sent successfully');
        onClose();
      } else {
        setError(response.data?.message || 'Failed to send invitation');
      }
    } catch (err) {
      console.error('Error sending invitation:', err);
      setError(err.response?.data?.message || 'Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#121212]/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#1A1A1A] border border-gray-800 hover:border-[#E8C848]/30 rounded-lg p-6 max-w-md w-full shadow-lg transition-all duration-300">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">Invite a Mentor</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-[#E8C848] transition-colors duration-300"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Mentor's Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 bg-[#121212] border border-gray-800 hover:border-[#E8C848]/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#E8C848] transition-all duration-300"
              placeholder="Enter mentor's email"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Invitation Message (Optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Hello, we would like you to mentor our team ${teamName}...`}
              rows={4}
              className="w-full p-2 bg-[#121212] border border-gray-800 hover:border-[#E8C848]/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#E8C848] transition-all duration-300"
            ></textarea>
          </div>
          
          {error && (
            <div className="mb-4 text-red-400 text-sm bg-red-900/20 border border-red-800 p-2 rounded">
              {error}
            </div>
          )}
          
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-800 hover:border-[#E8C848]/30 rounded-lg text-gray-300 hover:text-white hover:bg-[#121212] transition-all duration-300"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#E8C848] text-[#121212] px-4 py-2 rounded-lg hover:bg-[#E8C848]/80 flex items-center gap-2 transition-all duration-300 shadow-lg shadow-[#E8C848]/30"
              disabled={loading}
            >
              <Send size={16} />
              {loading ? 'Sending...' : 'Send Invitation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InviteMentorForm;