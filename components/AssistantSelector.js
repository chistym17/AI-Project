import React, { useState, useEffect } from 'react';
import { useAssistant } from '../lib/assistantContext';
import { API_ENDPOINTS } from '../config/api';

const AssistantSelector = () => {
  const [assistants, setAssistants] = useState([]);
  const [loading, setLoading] = useState(true);
  const { assistantId, setAssistant } = useAssistant();

  useEffect(() => {
    fetchAssistants();
  }, []);

  const fetchAssistants = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.ASSISTANTS);
      if (!response.ok) {
        throw new Error('Failed to fetch assistants');
      }
      const data = await response.json();
      setAssistants(data);
    } catch (error) {
      console.error('Error fetching assistants:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectAssistant = (assistant) => {
    setAssistant(assistant);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Assistant</h3>
      
      {assistants.length === 0 ? (
        <p className="text-gray-500 text-sm">No assistants available</p>
      ) : (
        <div className="space-y-3">
          {assistants.map((assistant) => (
            <div
              key={assistant.id}
              className={`p-3 rounded-lg border flex items-center justify-between ${
                assistantId === assistant.id
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-gray-200'
              }`}
            >
              <span className="font-bold text-gray-900 truncate">{assistant.name}</span>
              <button
                onClick={() => selectAssistant(assistant)}
                disabled={assistantId === assistant.id}
                className={`px-3 py-1 text-xs rounded ${
                  assistantId === assistant.id
                    ? 'bg-emerald-600 text-white cursor-default'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {assistantId === assistant.id ? 'Selected' : 'Select'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AssistantSelector; 