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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Request Mentorship</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="mb-4">
          <p className="text-gray-700">
            You're requesting mentorship from <span className="font-semibold">{mentor.name}</span>
          </p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message to Mentor
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Introduce your team and explain why you're looking for mentorship..."
              rows={4}
              className="w-full p-2 border border-gray-300 rounded-lg"
              required
            ></textarea>
          </div>
          
          {error && (
            <div className="mb-4 text-red-600 text-sm bg-red-50 p-2 rounded">
              {error}
            </div>
          )}
          
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
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