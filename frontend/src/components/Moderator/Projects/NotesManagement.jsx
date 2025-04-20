import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, Search, Filter, MessageCircle, AlertTriangle,
  Eye, RefreshCw, Clock, Info, AlertCircle, CheckCircle, XCircle,
  MailOpen, CheckCircle2, Send, Reply
} from 'lucide-react';

const NotesManagement = () => {
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    read: 0,
    responded: 0,
    closed: 0,
    actionRequired: 0,
    overdue: 0
  });

  // Fetch notes
  const fetchNotes = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}/api/moderator/notes`);
      
      if (Array.isArray(response.data)) {
        setNotes(response.data);
        
        // Apply initial filtering
        applyFilters(response.data, searchTerm, statusFilter);
        
        // Calculate stats
        const now = new Date();
        const noteStats = {
          total: response.data.length,
          unread: response.data.filter(n => n.status === 'Unread').length,
          read: response.data.filter(n => n.status === 'Read').length,
          responded: response.data.filter(n => n.status === 'Responded').length,
          closed: response.data.filter(n => n.status === 'Closed').length,
          actionRequired: response.data.filter(n => n.status === 'ActionRequired').length,
          overdue: response.data.filter(n => {
            if (!n.responseDeadline) return false;
            return new Date(n.responseDeadline) < now && n.status !== 'Closed' && n.status !== 'Responded';
          }).length
        };
        setStats(noteStats);
      } else {
        console.error('Unexpected API response format:', response.data);
        setNotes([]);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  // Apply filters when they change
  useEffect(() => {
    applyFilters(notes, searchTerm, statusFilter);
  }, [searchTerm, statusFilter]);

  // Helper function to apply filters
  const applyFilters = (allNotes, search, status) => {
    let filtered = [...allNotes];
    
    // Filter by search term
    if (search) {
      filtered = filtered.filter(note => 
        note.subject?.toLowerCase().includes(search.toLowerCase()) ||
        note.content?.toLowerCase().includes(search.toLowerCase()) ||
        note.recipientType?.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Filter by status
    if (status && status !== 'all') {
      filtered = filtered.filter(note => note.status === status);
    }
    
    setFilteredNotes(filtered);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Check if a note is overdue
  const isOverdue = (deadlineDate) => {
    if (!deadlineDate) return false;
    return new Date() > new Date(deadlineDate);
  };

  // Update note status
  const updateNoteStatus = async (noteId, newStatus) => {
    try {
      await axios.put(`${import.meta.env.VITE_APP_BASE_URL}/api/moderator/notes/${noteId}/status`, {
        status: newStatus
      });
      
      // Refresh notes
      fetchNotes();
    } catch (error) {
      console.error('Error updating note status:', error);
      alert('Failed to update note status. Please try again.');
    }
  };

  // Open reply modal
  const openReplyModal = (note) => {
    setSelectedNote(note);
    setReplyModalOpen(true);
  };

  // Send reply
  const sendReply = async (e) => {
    e.preventDefault();
    
    if (!selectedNote || !replyContent.trim()) {
      return;
    }
    
    try {
      await axios.post(`${import.meta.env.VITE_APP_BASE_URL}/api/moderator/notes`, {
        recipientId: selectedNote.senderId,
        recipientType: selectedNote.senderType,
        subject: `RE: ${selectedNote.subject}`,
        content: replyContent,
        regarding: selectedNote.regarding,
        relatedItemId: selectedNote.relatedItemId,
        relatedItemType: selectedNote.relatedItemType,
        parentNoteId: selectedNote._id,
        moderatorId: 'moderator123' // This should be the actual moderator ID
      });
      
      // Update original note status
      await updateNoteStatus(selectedNote._id, 'Responded');
      
      // Close modal and reset form
      setReplyModalOpen(false);
      setSelectedNote(null);
      setReplyContent('');
      
      // Refresh notes
      fetchNotes();
      
      alert('Reply sent successfully!');
    } catch (error) {
      console.error('Error sending reply:', error);
      alert('Failed to send reply. Please try again.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-[#111111] font-inter">
      <div className="max-w-7xl mx-auto">
        {/* Header with back button */}
        <div className="mb-6">
          <button 
            onClick={() => navigate('/moderator/dashboard')}
            className="inline-flex items-center text-[#E8C848] hover:text-[#E8C848]/80 transition-colors duration-300"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            <span>Back to Dashboard</span>
          </button>
        </div>
        
        {/* Main heading */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center font-montserrat">
              <MessageCircle className="mr-2 text-[#E8C848]" size={24} />
              Notes Management
            </h1>
            <p className="text-gray-400 mt-1">
              Manage communication with students and mentors
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex items-center gap-3">
            <button 
              onClick={() => fetchNotes()}
              className="flex items-center gap-1 text-[#E8C848] hover:text-[#E8C848]/80 px-3 py-1.5 rounded-md bg-[#E8C848]/10 hover:bg-[#E8C848]/20 transition-colors duration-300"
            >
              <RefreshCw size={16} />
              <span>Refresh</span>
            </button>
            
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none bg-[#1A1A1A] border border-gray-700 rounded-md pl-10 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-[#E8C848] text-sm text-gray-300"
              >
                <option value="all">All Status</option>
                <option value="Unread">Unread</option>
                <option value="Read">Read</option>
                <option value="Responded">Responded</option>
                <option value="Closed">Closed</option>
                <option value="ActionRequired">Action Required</option>
              </select>
              <Filter size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-7 gap-4 mb-6">
          <div className="bg-[#1A1A1A] p-4 rounded-lg shadow-sm border border-gray-800">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-medium text-gray-500">Total</h3>
              <div className="w-7 h-7 rounded-full bg-[#E8C848]/10 flex items-center justify-center">
                <MessageCircle size={14} className="text-[#E8C848]" />
              </div>
            </div>
            <p className="text-xl font-semibold text-gray-300 mt-2">{stats.total}</p>
          </div>
          
          <div className="bg-[#1A1A1A] p-4 rounded-lg shadow-sm border border-gray-800">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-medium text-gray-500">Unread</h3>
              <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">
                <MessageCircle size={14} className="text-blue-600" />
              </div>
            </div>
            <p className="text-xl font-semibold text-gray-300 mt-2">{stats.unread}</p>
          </div>
          
          <div className="bg-[#1A1A1A] p-4 rounded-lg shadow-sm border border-gray-800">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-medium text-gray-500">Read</h3>
              <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
                <CheckCircle size={14} className="text-gray-600" />
              </div>
            </div>
            <p className="text-xl font-semibold text-gray-300 mt-2">{stats.read}</p>
          </div>
          
          <div className="bg-[#1A1A1A] p-4 rounded-lg shadow-sm border border-gray-800">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-medium text-gray-500">Responded</h3>
              <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle size={14} className="text-green-600" />
              </div>
            </div>
            <p className="text-xl font-semibold text-gray-300 mt-2">{stats.responded}</p>
          </div>
          
          <div className="bg-[#1A1A1A] p-4 rounded-lg shadow-sm border border-gray-800">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-medium text-gray-500">Closed</h3>
              <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
                <XCircle size={14} className="text-gray-600" />
              </div>
            </div>
            <p className="text-xl font-semibold text-gray-300 mt-2">{stats.closed}</p>
          </div>
          
          <div className="bg-[#1A1A1A] p-4 rounded-lg shadow-sm border border-gray-800">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-medium text-gray-500">Action Needed</h3>
              <div className="w-7 h-7 rounded-full bg-yellow-100 flex items-center justify-center">
                <AlertCircle size={14} className="text-yellow-600" />
              </div>
            </div>
            <p className="text-xl font-semibold text-gray-300 mt-2">{stats.actionRequired}</p>
          </div>
          
          <div className="bg-[#1A1A1A] p-4 rounded-lg shadow-sm border border-gray-800">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-medium text-gray-500">Overdue</h3>
              <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center">
                <Clock size={14} className="text-red-600" />
              </div>
            </div>
            <p className="text-xl font-semibold text-gray-300 mt-2">{stats.overdue}</p>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search notes by subject, content, or recipient..."
              className="w-full border border-gray-700 rounded-md pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#E8C848] bg-[#1A1A1A] text-gray-300 placeholder-gray-500"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
        </div>

        {/* Notes List */}
        <div className="bg-[#1A1A1A] rounded-lg shadow-sm overflow-hidden border border-gray-800">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-10 h-10 border-4 border-[#E8C848] border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-500">Loading notes...</p>
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="p-8 text-center">
              <AlertCircle size={48} className="mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">No notes found</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {searchTerm 
                  ? `No notes matching "${searchTerm}"`
                  : statusFilter !== 'all'
                    ? `No notes with status "${statusFilter}"`
                    : "No notes available in the system"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-gray-700">
                <thead className="bg-[#1A1A1A]">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recipient</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Regarding</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sent Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-[#1A1A1A] divide-y divide-gray-700">
                  {filteredNotes.map((note) => (
                    <tr key={note._id} className={`hover:bg-gray-800 ${
                      note.isImportant ? 'bg-red-50' : ''
                    }`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {note.isImportant && (
                            <span className="mr-2 flex-shrink-0">
                              <AlertTriangle size={16} className="text-red-500" />
                            </span>
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-300">{note.subject}</div>
                            <div className="text-sm text-gray-500 mt-1 max-w-md line-clamp-2">
                              {note.content}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-300">
                          {note.recipientType === 'Student' ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                              Student
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Mentor
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          ID: {note.recipientId ? note.recipientId.substring(0, 8) + '...' : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          note.regarding === 'Project'
                            ? 'bg-indigo-100 text-indigo-800'
                            : note.regarding === 'Behavior'
                              ? 'bg-orange-100 text-orange-800'
                              : note.regarding === 'ContentViolation'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                        }`}>
                          {note.regarding === 'ContentViolation' ? 'Content Violation' : note.regarding}
                        </span>
                        
                        {note.responseDeadline && (
                          <div className="mt-2 text-xs">
                            <span className={`${
                              isOverdue(note.responseDeadline) && note.status !== 'Closed' && note.status !== 'Responded'
                                ? 'text-red-600 font-medium'
                                : 'text-gray-500'
                            }`}>
                              {isOverdue(note.responseDeadline) && note.status !== 'Closed' && note.status !== 'Responded'
                                ? 'Overdue: '
                                : 'Due: '}
                              {formatDate(note.responseDeadline)}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(note.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          note.status === 'Unread'
                            ? 'bg-blue-100 text-blue-800'
                            : note.status === 'Read'
                              ? 'bg-gray-100 text-gray-800'
                              : note.status === 'Responded'
                                ? 'bg-green-100 text-green-800'
                                : note.status === 'Closed'
                                  ? 'bg-gray-100 text-gray-800'
                                  : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {note.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => navigate(`/moderator/note/${note._id}`)}
                            className="p-1 text-[#E8C848] hover:text-[#E8C848]/80 rounded-full hover:bg-[#E8C848]/10"
                            title="View Note Details"
                          >
                            <Eye size={18} />
                          </button>
                          
                          {note.status === 'Unread' && (
                            <button 
                              onClick={() => updateNoteStatus(note._id, 'Read')}
                              className="p-1 text-blue-600 hover:text-blue-800 rounded-full hover:bg-blue-50"
                              title="Mark as Read"
                            >
                              <MailOpen size={18} />
                            </button>
                          )}
                          
                          {(note.status === 'Unread' || note.status === 'Read' || note.status === 'ActionRequired') && (
                            <button 
                              onClick={() => openReplyModal(note)}
                              className="p-1 text-green-600 hover:text-green-800 rounded-full hover:bg-green-50"
                              title="Reply"
                            >
                              <Reply size={18} />
                            </button>
                          )}
                          
                          {note.status !== 'Closed' && (
                            <button 
                              onClick={() => updateNoteStatus(note._id, 'Closed')}
                              className="p-1 text-gray-600 hover:text-gray-800 rounded-full hover:bg-gray-50"
                              title="Close Note"
                            >
                              <CheckCircle2 size={18} />
                            </button>
                          )}
                          
                          {note.relatedItemType === 'Project' && note.relatedItemId && (
                            <button 
                              onClick={() => navigate(`/moderator/project/${note.relatedItemId}`)}
                              className="p-1 text-purple-600 hover:text-purple-800 rounded-full hover:bg-purple-50"
                              title="View Related Project"
                            >
                              <Info size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* Information Banner */}
        <div className="mt-6 bg-[#E8C848]/10 border border-[#E8C848]/20 rounded-lg p-4 flex items-start space-x-3">
          <div className="flex-shrink-0">
            <Info size={20} className="text-[#E8C848]" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-[#E8C848] font-montserrat">Note Management Guidelines</h4>
            <p className="text-sm text-gray-300 mt-1">
              Respond to all notes promptly, especially those marked as important. Set appropriate deadlines for responses and follow up 
              if needed. Make sure to address all concerns raised by students and mentors.
            </p>
          </div>
        </div>
      </div>
      
      {/* Reply Modal */}
      {replyModalOpen && selectedNote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#1A1A1A] rounded-lg max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto border border-gray-800">
            <h2 className="text-lg font-medium text-white mb-4 font-montserrat">
              Reply to Note
            </h2>
            
            <div className="mb-4 p-4 bg-gray-800 rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-400">Original Note</span>
                <span className="text-xs text-gray-500">{formatDate(selectedNote.createdAt)}</span>
              </div>
              <h3 className="text-sm font-medium mb-1 text-gray-300">{selectedNote.subject}</h3>
              <p className="text-sm text-gray-400">{selectedNote.content}</p>
              
              <div className="mt-2 text-xs text-gray-500">
                From: {selectedNote.senderType} ({selectedNote.senderId.substring(0, 8)}...)
              </div>
            </div>
            
            <form onSubmit={sendReply}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Your Reply
                </label>
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  rows={6}
                  className="w-full border border-gray-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E8C848] bg-[#1A1A1A] text-gray-300 placeholder-gray-500"
                  placeholder="Type your response here..."
                  required
                ></textarea>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setReplyModalOpen(false)}
                  className="px-4 py-2 border border-gray-700 rounded-md text-sm font-medium text-gray-300 bg-[#111111] hover:bg-gray-800 transition-colors duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-[#111111] bg-[#E8C848] hover:bg-[#E8C848]/90 transition-colors duration-300 focus:outline-none"
                >
                  <Send className="h-4 w-4 inline-block mr-1" />
                  Send Reply
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesManagement;