import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, AlertTriangle, MessageCircle, Calendar,
  User, Send, CheckCircle, Clock, AlertCircle, X, Check
} from 'lucide-react';

const NoteDetail = () => {
  const { noteId } = useParams();
  const navigate = useNavigate();
  
  const [note, setNote] = useState(null);
  const [replies, setReplies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [replyForm, setReplyForm] = useState({
    content: '',
    isImportant: false
  });

  // Fetch note data
  useEffect(() => {
    const fetchNoteData = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`http://localhost:4000/api/moderator/notes/${noteId}/replies`);
        
        if (response.data) {
          setNote(response.data.parentNote);
          setReplies(response.data.replies || []);
        }
      } catch (error) {
        console.error('Error fetching note:', error);
        setError('Failed to load note. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchNoteData();
  }, [noteId]);

  // Handle reply form changes
  const handleReplyFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setReplyForm({
      ...replyForm,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Send reply
  const sendReply = async (e) => {
    e.preventDefault();
    
    if (!note || !replyForm.content.trim()) return;
    
    try {
      // Post the reply
      await axios.post('http://localhost:4000/api/moderator/notes', {
        recipientId: note.senderId,
        recipientType: note.senderType,
        subject: `Re: ${note.subject}`,
        content: replyForm.content,
        regarding: note.regarding,
        relatedItemId: note.relatedItemId,
        relatedItemType: note.relatedItemType,
        isImportant: replyForm.isImportant,
        parentNoteId: noteId,
        moderatorId: 'moderator123' // This should be the actual moderator ID
      });
      
      // Mark the original note as responded
      await axios.put(`http://localhost:4000/api/moderator/notes/${noteId}/status`, {
        status: 'Responded'
      });
      
      // Clear the form
      setReplyForm({
        content: '',
        isImportant: false
      });
      
      // Refresh the note data
      const response = await axios.get(`http://localhost:4000/api/moderator/notes/${noteId}/replies`);
      setNote(response.data.parentNote);
      setReplies(response.data.replies || []);
      
    } catch (error) {
      console.error('Error sending reply:', error);
      alert('Error sending reply. Please try again.');
    }
  };

  // Update note status
  const updateNoteStatus = async (status) => {
    try {
      await axios.put(`http://localhost:4000/api/moderator/notes/${noteId}/status`, {
        status
      });
      
      // Refresh the note data
      const response = await axios.get(`http://localhost:4000/api/moderator/notes/${noteId}/replies`);
      setNote(response.data.parentNote);
    } catch (error) {
      console.error('Error updating note status:', error);
      alert('Error updating note status. Please try again.');
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString().substring(0, 5);
  };

  // Check if a note is overdue
  const isOverdue = (deadlineDate) => {
    if (!deadlineDate) return false;
    return new Date() > new Date(deadlineDate);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <button 
              onClick={() => navigate(-1)}
              className="inline-flex items-center text-indigo-600 hover:text-indigo-800"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              <span>Back</span>
            </button>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="animate-spin w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-500">Loading note details...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <button 
              onClick={() => navigate(-1)}
              className="inline-flex items-center text-indigo-600 hover:text-indigo-800"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              <span>Back</span>
            </button>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <AlertTriangle size={48} className="mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">Error Loading Note</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <button 
              onClick={() => navigate(-1)}
              className="inline-flex items-center text-indigo-600 hover:text-indigo-800"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              <span>Back</span>
            </button>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <AlertTriangle size={48} className="mx-auto mb-4 text-yellow-500" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">Note Not Found</h3>
            <p className="text-gray-500">The requested note could not be found.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Header with back button */}
        <div className="mb-6">
          <button 
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-indigo-600 hover:text-indigo-800"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            <span>Back</span>
          </button>
        </div>
        
        {/* Main content */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
          {/* Note header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl font-bold text-gray-800 flex items-center">
                  <MessageCircle className="mr-2 text-indigo-500" size={24} />
                  {note.subject}
                  {note.isImportant && (
                    <span className="ml-2 bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full flex items-center">
                      <AlertTriangle className="mr-1 h-3 w-3" />
                      Important
                    </span>
                  )}
                </h1>
                <div className="flex items-center mt-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
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
                  <span className="ml-3 text-sm text-gray-500">
                    <Calendar className="inline-block mr-1 h-4 w-4" />
                    {formatDate(note.createdAt)}
                  </span>
                </div>
              </div>
              
              <div className="flex gap-2">
                {note.status !== 'Closed' && note.status !== 'Responded' && (
                  <>
                    <button 
                      onClick={() => updateNoteStatus('Closed')}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <X className="mr-1 h-4 w-4" />
                      Close
                    </button>
                    {note.status === 'Unread' && (
                      <button 
                        onClick={() => updateNoteStatus('Read')}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-indigo-700 bg-white hover:bg-indigo-50"
                      >
                        <Check className="mr-1 h-4 w-4" />
                        Mark as Read
                      </button>
                    )}
                  </>
                )}
                
                {note.status === 'Closed' && (
                  <button 
                    onClick={() => updateNoteStatus('Read')}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-indigo-700 bg-white hover:bg-indigo-50"
                  >
                    <MessageCircle className="mr-1 h-4 w-4" />
                    Reopen
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {/* Note content */}
          <div className="p-6">
            {/* Sender info */}
            <div className="flex items-start mb-6">
              <div className="flex-shrink-0 mr-4">
                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                  <User size={20} />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center mb-1">
                  <span className="font-medium text-gray-900">{note.senderType === 'Student' ? 'Student' : note.senderType === 'Mentor' ? 'Mentor' : 'Moderator'}</span>
                  <span className="text-xs text-gray-500 ml-2">{formatDate(note.createdAt)}</span>
                </div>
                <div className="text-gray-700 whitespace-pre-line">{note.content}</div>
                
                {/* Additional info */}
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="text-gray-500">
                    <span className="font-medium">Category:</span> {note.regarding}
                  </div>
                  
                  {note.responseDeadline && (
                    <div className={`text-gray-500 ${isOverdue(note.responseDeadline) ? 'text-red-600 font-medium' : ''}`}>
                      <span className="font-medium">Deadline:</span> {formatDate(note.responseDeadline)}
                      {isOverdue(note.responseDeadline) && (
                        <span className="ml-1 text-red-600">(Overdue)</span>
                      )}
                    </div>
                  )}
                  
                  {note.relatedItemType && (
                    <div className="text-gray-500">
                      <span className="font-medium">Related to:</span> {note.relatedItemType}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Replies */}
            {replies.length > 0 && (
              <div className="mt-6 mb-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Replies</h2>
                <div className="space-y-6">
                  {replies.map((reply) => (
                    <div key={reply._id} className="flex items-start">
                      <div className="flex-shrink-0 mr-4">
                        <div className={`h-10 w-10 rounded-full ${
                          reply.senderType === 'Moderator' 
                            ? 'bg-indigo-100 text-indigo-500' 
                            : 'bg-gray-200 text-gray-500'
                          } flex items-center justify-center`}>
                          <User size={20} />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center mb-1">
                          <span className="font-medium text-gray-900">
                            {reply.senderType === 'Student' 
                              ? 'Student' 
                              : reply.senderType === 'Mentor' 
                                ? 'Mentor' 
                                : 'Moderator'}
                          </span>
                          <span className="text-xs text-gray-500 ml-2">{formatDate(reply.createdAt)}</span>
                          {reply.isImportant && (
                            <span className="ml-2 bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full flex items-center">
                              <AlertTriangle className="mr-1 h-3 w-3" />
                              Important
                            </span>
                          )}
                        </div>
                        <div className="text-gray-700 bg-gray-50 p-3 rounded-lg">{reply.content}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Reply form */}
            {note.status !== 'Closed' && (
              <div className="mt-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Reply</h2>
                <form onSubmit={sendReply}>
                  <div className="mb-4">
                    <textarea
                      name="content"
                      value={replyForm.content}
                      onChange={handleReplyFormChange}
                      rows={4}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Type your reply here..."
                      required
                    ></textarea>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isImportant"
                        name="isImportant"
                        checked={replyForm.isImportant}
                        onChange={handleReplyFormChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor="isImportant" className="ml-2 block text-sm text-gray-700">
                        Mark as important
                      </label>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <Send className="inline-block mr-2 h-4 w-4" />
                      Send Reply
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            {note.status === 'Closed' && (
              <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                <AlertCircle className="mx-auto h-6 w-6 text-gray-400 mb-2" />
                <p className="text-gray-600">This note has been closed and cannot receive new replies.</p>
                <button 
                  onClick={() => updateNoteStatus('Read')}
                  className="mt-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-indigo-700 bg-white hover:bg-indigo-50"
                >
                  <MessageCircle className="inline-block mr-2 h-4 w-4" />
                  Reopen Note
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteDetail;