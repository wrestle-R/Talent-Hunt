import React, { useEffect } from 'react';
import { X, Award, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

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
  // Debug logs
  useEffect(() => {
    console.group('CreateTeamModal Data');
    console.log('Available:', availableIndividuals);
    console.log('Selected:', selectedIndividuals);
    console.log('Leader:', teamLeader);
    console.groupEnd();
  }, [availableIndividuals, selectedIndividuals, teamLeader]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Create New Team</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Team Name</label>
          <input
            type="text"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            className="w-full p-2 border rounded-md"
            placeholder="Enter team name"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Available Members */}
          <div>
            <h3 className="font-medium mb-2">Available Members</h3>
            <div className="border rounded-md h-[400px] overflow-y-auto">
              {availableIndividuals.map((individual) => {
                const uniqueKey = `available-${individual._id || individual.student?._id}`;
                return (
                  <div
                    key={uniqueKey}
                    onClick={() => onToggleSelection(individual)}
                    className={`p-3 border-b cursor-pointer hover:bg-gray-50 flex items-center ${
                      selectedIndividuals.some(
                        (i) => i._id === individual._id || i.student?._id === individual.student?._id
                      )
                        ? 'bg-blue-50'
                        : ''
                    }`}
                  >
                    <div className="flex items-center">
                      <img
                        src={individual.student?.profile_picture || '/default-avatar.png'}
                        alt={individual.student?.name}
                        className="h-8 w-8 rounded-full mr-2"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/default-avatar.png';
                        }}
                      />
                      <div>
                        <div className="font-medium">{individual.student?.name}</div>
                        <div className="text-sm text-gray-500">
                          {individual.student?.email}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Members */}
          <div>
            <h3 className="font-medium mb-2">
              Selected Team ({selectedIndividuals.length}/4)
            </h3>
            <div className="border rounded-md h-[400px] overflow-y-auto p-3">
              {selectedIndividuals.length === 0 ? (
                <div className="text-center text-gray-500 mt-4">
                  Select members from the left to add to team
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedIndividuals.map((individual) => {
                    const uniqueKey = `selected-${individual._id || individual.student?._id}`;
                    return (
                      <div
                        key={uniqueKey}
                        className={`p-3 border rounded-md ${
                          teamLeader?._id === individual._id ||
                          teamLeader?.student?._id === individual.student?._id
                            ? 'bg-green-50 border-green-300'
                            : 'bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <img
                              src={individual.student?.profile_picture || '/default-avatar.png'}
                              alt={individual.student?.name}
                              className="h-8 w-8 rounded-full mr-2"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/default-avatar.png';
                              }}
                            />
                            <div>
                              <div className="font-medium">{individual.student?.name}</div>
                              <div className="text-sm text-gray-500">
                                {individual.student?.email}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => onSetLeader(individual)}
                              className={`p-1.5 rounded-full ${
                                teamLeader?._id === individual._id ||
                                teamLeader?.student?._id === individual.student?._id
                                  ? 'bg-green-100 text-green-600'
                                  : 'bg-gray-100 hover:bg-green-50'
                              }`}
                              title="Set as team leader"
                            >
                              <Award size={16} />
                            </button>
                            <button
                              onClick={() => onToggleSelection(individual)}
                              className="p-1.5 rounded-full bg-gray-100 hover:bg-red-50 text-gray-500 hover:text-red-500"
                              title="Remove member"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                        {(teamLeader?._id === individual._id ||
                          teamLeader?.student?._id === individual.student?._id) && (
                          <div className="text-xs text-green-600 mt-1.5 flex items-center">
                            <Award size={12} className="mr-1" />
                            Team Leader
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onCreateTeam}
            disabled={selectedIndividuals.length !== 4 || !teamLeader || !teamName.trim()}
            className={`px-4 py-2 rounded-md text-white flex items-center ${
              selectedIndividuals.length === 4 && teamLeader && teamName.trim()
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-blue-300 cursor-not-allowed'
            }`}
          >
            <Plus size={18} className="mr-2" />
            Create Team
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CreateTeamModal;