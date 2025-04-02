import React, { useState } from 'react';
import { X, Award, Plus, Search, Users, User, Check, AlertTriangle, Github, Linkedin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const CreateTeamModal = ({
  showModal,
  onClose,
  teamName,
  setTeamName,
  availableIndividuals,
  selectedIndividuals,
  teamLeader,
  onToggleSelection,
  onSetLeader,
  onCreateTeam
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [animatingCard, setAnimatingCard] = useState(null);
  const [viewingProfile, setViewingProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Filter available members by search term
  const filteredAvailable = availableIndividuals.filter(individual => 
    individual.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    individual.student?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Animation handling
  const handleCardAnimation = (id) => {
    setAnimatingCard(id);
    setTimeout(() => setAnimatingCard(null), 500);
  };

  // Handle team leader selection with exclusive choice
  const handleSetLeader = (individual) => {
    const leaderId = individual.student?._id || individual._id;
    
    if (!teamLeader || 
        (teamLeader._id !== leaderId && 
         teamLeader.student?._id !== leaderId)) {
      onSetLeader(individual);
    }
  };

  // Profile fetching function
  const fetchStudentProfile = async (studentId) => {
    try {
      setLoadingProfile(true);
      const response = await axios.get(`/api/admin/students/${studentId}/profile`);
      console.log('Fetched profile data:', response.data);
      return response.data.student;
    } catch (error) {
      console.error('Error fetching student profile:', error);
      throw error;
    } finally {
      setLoadingProfile(false);
    }
  };

  // Handle profile viewing
  const handleViewProfile = async (individual) => {
    try {
      // Set the viewing profile immediately to show basic info while loading details
      setViewingProfile({
        ...individual,
        student: individual.student || individual
      });
      
      setLoadingProfile(true);
      
      const studentId = individual.student?._id;
      if (!studentId) {
        throw new Error('Student ID not found');
      }

      console.log('Fetching profile for student ID:', studentId);
      
      const profileData = await fetchStudentProfile(studentId);
      console.log('Profile data received:', profileData);
      
      // Update the viewing profile with the fetched data
      setViewingProfile(prevState => ({
        ...prevState,
        student: {
          ...prevState.student,
          ...profileData
        }
      }));
    } catch (error) {
      console.error('Error loading profile:', error);
      setLoadingProfile(false);
    }
  };

  // Fix key generation to ensure uniqueness
  const getUniqueKey = (individual, prefix) => {
    const id = individual._id || individual.student?._id;
    if (!id) {
      return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
    }
    return `${prefix}-${id}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.4 }}
        className="bg-zinc-900 rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden border border-zinc-700"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-zinc-800 to-zinc-900 p-6 border-b border-zinc-700">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white tracking-tight">Create New Team</h2>
            <button 
              onClick={onClose}
              className="rounded-full p-2 hover:bg-zinc-700/50 text-zinc-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="mt-6">
            <label className="text-sm font-semibold text-zinc-300 block mb-2">Team Name</label>
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="w-full p-3 rounded-lg bg-zinc-800/50 border border-zinc-600 text-white placeholder-zinc-500 
                focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-zinc-500 transition-all"
              placeholder="Enter a creative team name"
            />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 bg-zinc-800/50 border-b border-zinc-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-zinc-300">Team Formation Progress</h3>
            <span className="text-sm font-semibold bg-zinc-900 px-3 py-1 rounded-full text-white">
              {selectedIndividuals.length}/4 members
            </span>
          </div>
          <div className="h-2 bg-zinc-700/50 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(selectedIndividuals.length / 4) * 100}%` }}
              className="h-full bg-white shadow-lg shadow-white/10"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-0 h-[450px]">
          {/* Available Members Panel */}
          <div className="border-r border-zinc-700">
            <div className="p-4 bg-zinc-900">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white flex items-center">
                  <Users size={18} className="mr-2 text-zinc-400" />
                  Available Members
                </h3>
                <div className="relative w-56">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="Search members..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-3 py-2 text-sm bg-zinc-800 border border-zinc-600 rounded-full w-full 
                      focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-white/20 
                      text-white placeholder-zinc-500 transition-all"
                  />
                </div>
              </div>

              {/* Available Members List */}
              <div className="h-[350px] overflow-y-auto pr-2 -mr-2 custom-scrollbar">
                {filteredAvailable.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-zinc-500">
                    <Users size={40} className="mb-2 opacity-30" />
                    {searchTerm ? 'No matching members found' : 'No available members'}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredAvailable.map((individual) => {
                      const uniqueKey = getUniqueKey(individual, 'available');
                      const isSelected = selectedIndividuals.some(
                        (i) => (i._id && i._id === individual._id) || 
                               (i.student?._id && i.student?._id === individual.student?._id)
                      );
                      
                      return (
                        <motion.div
                          key={uniqueKey}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          className={`p-4 rounded-lg border-2 group
                            ${isSelected 
                              ? 'bg-white/10 border-white shadow-lg' 
                              : 'hover:bg-zinc-800 border-zinc-700/50 bg-zinc-900'} 
                            ${selectedIndividuals.length >= 4 && !isSelected 
                              ? 'opacity-50 cursor-not-allowed' 
                              : 'hover:border-white/50'}`}
                        >
                          <div className="flex flex-col space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className={`w-3 h-3 rounded-full ${isSelected ? 'bg-white' : 'bg-zinc-600'}`}></div>
                                <div>
                                  <div className="font-semibold text-lg text-white">
                                    {individual.student?.name}
                                  </div>
                                  <div className="text-sm text-zinc-300">
                                    {individual.student?.email}
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between pt-2">
                              <button
                                onClick={() => handleViewProfile(individual)}
                                disabled={loadingProfile}
                                className="px-3 py-1.5 text-sm bg-zinc-800 text-white rounded-md
                                  hover:bg-zinc-700 transition-colors flex items-center gap-2"
                              >
                                {loadingProfile ? (
                                  <span className="animate-spin h-4 w-4 mr-1">⟳</span>
                                ) : (
                                  <User size={14} />
                                )}
                                View Profile
                              </button>
                              
                              {!isSelected && selectedIndividuals.length < 4 && (
                                <button
                                  onClick={() => {
                                    handleCardAnimation(uniqueKey);
                                    onToggleSelection(individual);
                                  }}
                                  className="px-3 py-1.5 text-sm bg-white/10 text-white rounded-md
                                    hover:bg-white/20 transition-colors flex items-center gap-2"
                                >
                                  <Plus size={14} />
                                  Add to team
                                </button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Selected Team Members Panel */}
          <div className="bg-zinc-800">
            <div className="p-4">
              <h3 className="font-semibold text-white flex items-center mb-4">
                <User size={18} className="mr-2 text-zinc-400" />
                Your Team
                {selectedIndividuals.length > 0 && (
                  <span className="ml-2 text-xs bg-white/10 text-white px-3 py-1 rounded-full">
                    {selectedIndividuals.length}/4
                  </span>
                )}  
              </h3>

              <div className="h-[350px] overflow-y-auto pr-2 -mr-2 custom-scrollbar">
                {selectedIndividuals.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-zinc-500">
                    <User size={40} className="mb-2 opacity-30" />
                    <p className="text-sm">Select members from the left panel</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <AnimatePresence>
                      {selectedIndividuals.map((individual) => {
                        const uniqueKey = getUniqueKey(individual, 'selected');
                        const isLeader = teamLeader?._id === individual._id;
                        
                        return (
                          <motion.div
                            key={uniqueKey}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ type: "spring", duration: 0.4 }}
                            className={`relative overflow-hidden rounded-lg border-2 shadow-lg
                              ${isLeader ? 'bg-white/20 border-white' : 'bg-zinc-900 border-zinc-700'}`}
                          >
                            {isLeader && (
                              <div className="absolute top-0 right-0">
                                <div className="bg-white text-black transform rotate-45 text-sm 
                                  font-bold py-1 px-8 translate-x-2 -translate-y-2 shadow-lg">
                                  Leader
                                </div>
                              </div>
                            )}
                            
                            <div className="p-4">
                              <div className="flex items-center space-x-3">
                                <div className={`w-3 h-3 rounded-full
                                  ${isLeader ? 'bg-white' : 'bg-zinc-600'}`}></div>
                                <div>
                                  <div className="font-semibold text-lg text-white">
                                    {individual.name}
                                  </div>
                                  <div className="text-sm text-zinc-300">
                                    {individual.email}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex justify-end gap-2 mt-4">
                                {!isLeader && (
                                  <button
                                    onClick={() => onSetLeader(individual)}
                                    className="px-4 py-2 rounded-md text-sm flex items-center
                                      bg-white/10 hover:bg-white/20 text-white font-medium 
                                      transition-all border border-white/20"
                                  >
                                    <Award size={16} className="mr-2" />
                                    Make Leader
                                  </button>
                                )}
                                <button
                                  onClick={() => onToggleSelection(individual)}
                                  className="px-4 py-2 rounded-md bg-red-500/20 hover:bg-red-500/30 
                                    text-white text-sm flex items-center transition-all
                                    border border-red-500/30"
                                >
                                  <X size={16} className="mr-2" />
                                  Remove
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t-2 border-zinc-700 bg-zinc-900">
          <div className="flex justify-between items-center">
            {selectedIndividuals.length === 4 && !teamLeader && (
              <div className="text-yellow-300 text-sm flex items-center bg-yellow-500/10 
                px-4 py-2 rounded-lg border border-yellow-500/30">
                <AlertTriangle className="mr-2" size={18} />
                Please select a team leader before creating the team
              </div>
            )}
            {selectedIndividuals.length > 0 && selectedIndividuals.length < 4 && (
              <div className="text-white text-sm flex items-center bg-zinc-800 
                px-4 py-2 rounded-lg border border-zinc-700">
                <Users className="mr-2" size={18} />
                Add {4 - selectedIndividuals.length} more member{selectedIndividuals.length < 3 ? 's' : ''} to form a team
              </div>
            )}
            
            <div className="flex gap-4">
              <button
                onClick={onClose}
                className="px-6 py-2.5 border-2 border-zinc-600 rounded-lg text-white 
                  hover:bg-zinc-800 hover:border-white transition-all font-medium"
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onCreateTeam}
                disabled={selectedIndividuals.length !== 4 || !teamLeader || !teamName.trim()}
                className={`px-8 py-2.5 rounded-lg font-medium flex items-center transition-all
                  ${selectedIndividuals.length === 4 && teamLeader && teamName.trim()
                    ? 'bg-white text-black hover:bg-zinc-100 shadow-xl'
                    : 'bg-zinc-800 text-zinc-400 border-2 border-zinc-700 cursor-not-allowed'}`}
              >
                <Plus size={20} className="mr-2" />
                Create Team
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Profile Modal */}
      {viewingProfile && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
          onClick={() => setViewingProfile(null)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-zinc-900 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-zinc-700"
            onClick={e => e.stopPropagation()}
          >
            {loadingProfile ? (
              <div className="p-8 flex flex-col items-center justify-center">
                <div className="animate-spin mb-4">
                  <svg className="w-8 h-8" viewBox="0 0 24 24">
                    <circle 
                      className="opacity-25" 
                      cx="12" 
                      cy="12" 
                      r="10" 
                      stroke="currentColor" 
                      strokeWidth="4" 
                      fill="none" 
                    />
                    <path 
                      className="opacity-75" 
                      fill="currentColor" 
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" 
                    />
                  </svg>
                </div>
                <p className="text-zinc-400">Loading profile...</p>
              </div>
            ) : (
              <div>
                {/* Header */}
                <div className="p-6 border-b border-zinc-700 flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {viewingProfile.student?.name}
                    </h3>
                    <p className="text-sm text-zinc-400 mt-1">
                      {viewingProfile.student?.email}
                    </p>
                  </div>
                  <button
                    onClick={() => setViewingProfile(null)}
                    className="rounded-full p-2 hover:bg-zinc-800 text-zinc-400 
                      hover:text-white transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Profile Content */}
                <div className="p-6 space-y-4">
                  {/* Education Section */}
                  <div>
                    <h4 className="text-sm font-medium text-zinc-400 mb-2">Education</h4>
                    <div className="bg-zinc-800/50 rounded-lg p-3 border border-zinc-700">
                      <p className="text-white font-medium">
                        {viewingProfile.student?.education?.institution || 'Not specified'}
                      </p>
                      <p className="text-sm text-zinc-400">
                        {viewingProfile.student?.education?.degree || 'Not specified'}
                      </p>
                    </div>
                  </div>

                  {/* Skills Section */}
                  <div>
                    <h4 className="text-sm font-medium text-zinc-400 mb-2">Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {viewingProfile.student?.skills?.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 text-sm bg-white/10 text-white 
                            rounded-full border border-white/20"
                        >
                          {skill}
                        </span>
                      )) || (
                        <span className="text-zinc-500 text-sm">No skills listed</span>
                      )}
                    </div>
                  </div>

                  {/* Bio Section */}
                  {viewingProfile.student?.bio && (
                    <div>
                      <h4 className="text-sm font-medium text-zinc-400 mb-2">About</h4>
                      <p className="text-white text-sm bg-zinc-800/50 rounded-lg p-3 border border-zinc-700">
                        {viewingProfile.student.bio}
                      </p>
                    </div>
                  )}

                  {/* Links Section */}
                  {viewingProfile.student?.social_links && (
                    <div>
                      <h4 className="text-sm font-medium text-zinc-400 mb-2">Links</h4>
                      <div className="flex gap-3">
                        {viewingProfile.student.social_links.github && (
                          <a 
                            href={viewingProfile.student.social_links.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white hover:text-zinc-300 transition-colors"
                          >
                            <Github size={20} />
                          </a>
                        )}
                        {viewingProfile.student.social_links.linkedin && (
                          <a 
                            href={viewingProfile.student.social_links.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white hover:text-zinc-300 transition-colors"
                          >
                            <Linkedin size={20} />
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-6 pt-6 border-t border-zinc-700 flex justify-end">
                    <button
                      onClick={() => setViewingProfile(null)}
                      className="px-4 py-2 text-sm text-white bg-zinc-800 
                        hover:bg-zinc-700 rounded-md transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default CreateTeamModal;