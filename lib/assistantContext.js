// lib/assistantContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const AssistantContext = createContext();

export function AssistantProvider({ children }) {
  const [assistant, setAssistantState] = useState(null);
  const [assistantId, setAssistantId] = useState(null);

  // Load saved assistant from localStorage on mount
  useEffect(() => {
    try {
      const savedAssistantId = localStorage.getItem('assistant_id');
      const savedAssistant = localStorage.getItem('assistant_data');
      
      if (savedAssistantId) {
        setAssistantId(savedAssistantId);
      }
      
      if (savedAssistant) {
        setAssistantState(JSON.parse(savedAssistant));
      }
    } catch (error) {
      console.error('Error loading assistant from localStorage:', error);
    }
  }, []);

  // Set assistant and persist to localStorage
  const setAssistant = (assistantData) => {
    setAssistantState(assistantData);
    
    if (assistantData) {
      setAssistantId(assistantData.id);
      try {
        localStorage.setItem('assistant_id', assistantData.id);
        localStorage.setItem('assistant_data', JSON.stringify(assistantData));
      } catch (error) {
        console.error('Error saving assistant to localStorage:', error);
      }
    } else {
      setAssistantId(null);
      try {
        localStorage.removeItem('assistant_id');
        localStorage.removeItem('assistant_data');
      } catch (error) {
        console.error('Error removing assistant from localStorage:', error);
      }
    }
  };

  // Clear assistant
  const clearAssistant = () => {
    setAssistant(null);
  };

  const value = {
    assistant,
    assistantId,
    setAssistant,
    clearAssistant,
  };

  return (
    <AssistantContext.Provider value={value}>
      {children}
    </AssistantContext.Provider>
  );
}

export const useAssistant = () => {
  const context = useContext(AssistantContext);
  if (context === undefined) {
    throw new Error('useAssistant must be used within an AssistantProvider');
  }
  return context;
};