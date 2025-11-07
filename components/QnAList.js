import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, MessageSquare, Calendar, Tag } from 'lucide-react';
import { API_ENDPOINTS } from '../config/api';

const QnAList = ({ assistantId, onEdit }) => {
  const [qaEntries, setQaEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchQaEntries();
  }, [assistantId]);

  const fetchQaEntries = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.QA_LIST(assistantId));
      if (!response.ok) {
        throw new Error('Failed to fetch Q&A entries');
      }
      const data = await response.json();
      setQaEntries(data);
    } catch (error) {
      console.error('Error fetching Q&A entries:', error);
      setError('Failed to load Q&A entries');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (qaId) => {
    if (!confirm('Are you sure you want to delete this Q&A entry?')) {
      return;
    }

    try {
      const response = await fetch(API_ENDPOINTS.QA_DELETE(assistantId, qaId), {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete Q&A entry');
      }

      setQaEntries(prev => prev.filter(qa => qa.id !== qaId));
    } catch (error) {
      console.error('Error deleting Q&A entry:', error);
      alert('Failed to delete Q&A entry. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="bg-green-100 p-6 rounded-lg">
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-green-100 p-6 rounded-lg">
        <div className="text-center py-4">
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchQaEntries}
            className="mt-2 px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-green-100 p-6 rounded-lg space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <MessageSquare size={20} className="mr-2" />
          Q&A Entries ({qaEntries.length})
        </h3>
        <button
          onClick={() => onEdit(null)} 
          className="flex items-center px-3 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
        >
          <Plus size={14} className="mr-1" />
          Add Q&A
        </button>
      </div>

      {qaEntries.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <MessageSquare size={32} className="mx-auto text-gray-400 mb-2" />
          <h4 className="text-sm font-medium text-gray-900 mb-1">No Q&A entries yet</h4>
          <p className="text-xs text-gray-500 mb-4">
            Add Q&A pairs to help your AI assistant answer common questions
          </p>
          <button
            onClick={() => onEdit(null)}
            className="px-3 py-1 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 text-sm"
          >
            Add Your First Q&A
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {qaEntries.map((qa) => (
            <div
              key={qa.id}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">
                    {qa.question}
                  </h4>
                  <p className="text-sm text-gray-600 mb-2">
                    {qa.answer}
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-gray-400">
                    {qa.category && (
                      <div className="flex items-center">
                        <Tag size={12} className="mr-1" />
                        <span>{qa.category}</span>
                      </div>
                    )}
                    <div className="flex items-center">
                      <Calendar size={12} className="mr-1" />
                      <span>
                        {new Date(qa.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-1 ml-4">
                  <button
                    onClick={() => onEdit(qa)}
                    className="p-1 text-gray-400 hover:text-blue-600"
                    title="Edit"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(qa.id)}
                    className="p-1 text-gray-400 hover:text-red-600"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QnAList;