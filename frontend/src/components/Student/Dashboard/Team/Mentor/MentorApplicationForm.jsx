import React, { useState } from 'react';
import axios from 'axios';
import { X, Send } from 'lucide-react';

const MentorApplicationForm = ({ mentor, teamId, studentId, onClose, onApplicationSubmitted }) => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.post(
        `http://localhost:4000/api/teams/${teamId}/mentors/apply`,
        {
          mentorId: mentor._id,
          message: message.trim(),
          applicantId: studentId
        }
      );
      
      if (response.data && response.data.success) {
        const newApplication = {
          _id: response.data.applicationId,
          mentorId: mentor._id,
          mentorName: mentor.name,
          message: message.trim(),
          status: 'pending',
          applicationDate: new Date()
        };
        
        onApplicationSubmitted(newApplication);
      } else {
        setError(response.data?.message || 'Failed to send application');
      }
    } catch (err) {
      console.error('Error applying to mentor:', err);
      setError(err.response?.data?.message || 'Failed to send application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#121212]/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#1A1A1A] border border-gray-800 hover:border-[#E8C848]/30 rounded-lg p-6 max-w-md w-full shadow-lg transition-all duration-300">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">Request Mentorship</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-[#E8C848] transition-colors duration-300"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="mb-4">
          <p className="text-gray-300">
            You're requesting mentorship from <span className="font-semibold text-[#E8C848]">{mentor.name}</span>
          </p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Message to Mentor
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Introduce your team and explain why you're looking for mentorship..."
              rows={4}
              className="w-full p-2 bg-[#121212] border border-gray-800 hover:border-[#E8C848]/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#E8C848] transition-all duration-300"
              required
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
              {loading ? 'Sending...' : 'Send Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MentorApplicationForm;