import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../../../../../../context/UserContext';
import { Sparkles, User, ExternalLink, MessageCircle } from 'lucide-react';
import MentorCard from './MentorCard';
import MentorApplicationForm from './MentorApplicationForm';

const RecommendedMentors = ({ teamId, teamTechStack, applications, onApplicationAdded }) => {
  const { userData } = useUser();
  const [recommendedMentors, setRecommendedMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);

  useEffect(() => {
    const fetchRecommendedMentors = async () => {
      try {
        setLoading(true);
        
        // Build query with team's tech stack for matching expertise
        let query = '';
        if (teamTechStack && teamTechStack.length) {
          query = teamTechStack.join(',');
        }
        
        const response = await axios.get(
          `http://localhost:4000/api/teams/mentors/search?skills=${query}&recommended=true&limit=8`
        );
        
        if (response.data && response.data.success) {
          setRecommendedMentors(response.data.mentors || []);
        }
      } catch (err) {
        console.error('Error fetching recommended mentors:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendedMentors();
  }, [teamTechStack]);

  // Open application form for specific mentor
  const handleApplyToMentor = (mentor) => {
    setSelectedMentor(mentor);
    setShowApplicationForm(true);
  };

  // Check if already applied to a mentor
  const hasAppliedToMentor = (mentorId) => {
    return applications.some(app => 
      app.mentorId === mentorId && 
      (app.status === 'pending' || app.status === 'accepted' || app.status === 'waitlisted')
    );
  };

  return (
    <div className="text-white">
      <div className="flex items-center mb-4">
        <Sparkles size={20} className="text-[#E8C848] mr-2" />
        <h3 className="font-medium text-lg">Recommended Mentors for Your Team</h3>
      </div>
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, index) => (
            <div 
              key={index} 
              className="animate-pulse bg-[#1A1A1A] border border-gray-800 hover:border-[#E8C848]/30 rounded-lg p-4 h-48 transition-all duration-300"
            ></div>
          ))}
        </div>
      ) : recommendedMentors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendedMentors.map(mentor => (
            <MentorCard 
              key={mentor._id}
              mentor={mentor}
              hasApplied={hasAppliedToMentor(mentor._id)}
              onApply={() => handleApplyToMentor(mentor)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-[#1A1A1A] border border-gray-800 hover:border-[#E8C848]/30 rounded-lg transition-all duration-300">
          <User size={40} className="mx-auto text-[#E8C848]/30 mb-2" />
          <p className="text-gray-300">No recommended mentors found</p>
          <p className="text-gray-400 text-sm mt-2">Try browsing all mentors instead</p>
        </div>
      )}
      
      {/* Mentor Application Form Modal */}
      {showApplicationForm && selectedMentor && (
        <MentorApplicationForm
          mentor={selectedMentor}
          teamId={teamId}
          studentId={userData?._id}
          onClose={() => setShowApplicationForm(false)}
          onApplicationSubmitted={(newApp) => {
            setShowApplicationForm(false);
            onApplicationAdded(newApp);
          }}
        />
      )}
    </div>
  );
};

export default RecommendedMentors;