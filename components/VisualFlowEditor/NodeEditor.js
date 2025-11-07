// NodeEditor.js - Production-grade minimal design
import React, { useState, useEffect } from 'react';
import FunctionMultiSelect from '../FunctionMultiSelect';

export default function NodeEditor({ node, assistantId, onUpdate, toolsRefreshTrigger = 0 }) {
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    prompt: '',
    functions: [],
    respond_immediately: true,
  });
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    if (node?.data) {
      setFormData({
        id: node.data.id || '',
        title: node.data.title || '',
        prompt: node.data.prompt || '',
        functions: node.data.functions || [],
        respond_immediately: node.data.respond_immediately !== false,
      });
    }
  }, [node]);

  const handleChange = (field, value) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onUpdate(newData);
  };

  if (!node) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-950">
        <p className="text-sm text-slate-500">Select a node to configure</p>
      </div>
    );
  }

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'prompt', label: 'Prompt' },
    { id: 'functions', label: 'Functions' },
    { id: 'behavior', label: 'Behavior' },
  ];

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-800/50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-slate-200">Node Configuration</h3>
            <p className="text-xs text-slate-500 mt-0.5">ID: {formData.id || 'Untitled'}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
            <span className="text-xs text-slate-500">Connected</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800/50 px-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 text-sm font-medium transition-colors relative ${
              activeTab === tab.id
                ? 'text-emerald-400'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500"></div>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {/* General Tab */}
        {activeTab === 'general' && (
          <div className="space-y-6 max-w-2xl">
            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">
                Node ID
              </label>
              <input
                type="text"
                value={formData.id}
                onChange={(e) => handleChange('id', e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-sm text-slate-100 placeholder-slate-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all"
                placeholder="menu_handler"
              />
              <p className="text-xs text-slate-600">
                Unique identifier for routing and references
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">
                Display Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-sm text-slate-100 placeholder-slate-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all"
                placeholder="Menu Handler"
              />
              <p className="text-xs text-slate-600">
                Human-readable name for the flow editor
              </p>
            </div>
          </div>
        )}

        {/* Prompt Tab */}
        {activeTab === 'prompt' && (
          <div className="space-y-4 max-w-3xl">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">
                System Prompt
              </label>
              <span className="text-xs text-slate-600">
                {formData.prompt.length} chars
              </span>
            </div>
            <textarea
              value={formData.prompt}
              onChange={(e) => handleChange('prompt', e.target.value)}
              rows={16}
              className="w-full px-3 py-3 bg-slate-900 border border-slate-800 rounded text-sm text-slate-100 placeholder-slate-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all font-mono leading-relaxed resize-none"
              placeholder="Define the AI's behavior, instructions, and context for this node..."
            />
            <div className="flex items-start gap-3 p-3 bg-slate-900/50 border border-slate-800/50 rounded text-xs text-slate-500">
              <svg className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="space-y-1">
                <p>Be specific about expected behavior and tone</p>
                <p>Reference available functions when relevant</p>
                <p>Include examples for complex scenarios</p>
              </div>
            </div>
          </div>
        )}

        {/* Functions Tab */}
        {activeTab === 'functions' && (
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">
                Available Functions
              </label>
              <span className="text-xs text-slate-600">
                {formData.functions.length} selected
              </span>
            </div>
            
            <div className="bg-slate-900 border border-slate-800 rounded p-1">
              <FunctionMultiSelect
                assistantId={assistantId}
                value={formData.functions}
                onChange={(functions) => handleChange('functions', functions)}
                className="!bg-transparent !border-0"
                refreshTrigger={toolsRefreshTrigger}
              />
            </div>

            {formData.functions.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Selected Functions
                </div>
                <div className="space-y-1.5">
                  {formData.functions.map((func, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between py-2 px-3 bg-slate-900 border border-slate-800 rounded text-sm hover:border-slate-700 transition-colors group"
                    >
                      <span className="text-slate-300 font-mono text-xs">{func}</span>
                      <button
                        onClick={() => {
                          const newFunctions = formData.functions.filter((_, i) => i !== index);
                          handleChange('functions', newFunctions);
                        }}
                        className="text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-start gap-3 p-3 bg-slate-900/50 border border-slate-800/50 rounded text-xs text-slate-500">
              <svg className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>Functions enable the AI to perform actions and retrieve data during conversations</p>
            </div>
          </div>
        )}

        {/* Behavior Tab */}
        {activeTab === 'behavior' && (
          <div className="space-y-6 max-w-2xl">
            <div className="space-y-3">
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">
                Response Mode
              </label>
              
              <label className={`flex items-start p-4 border rounded cursor-pointer transition-all ${
                formData.respond_immediately === true
                  ? 'bg-emerald-500/5 border-emerald-500/50'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}>
                <input
                  type="radio"
                  name="respond_immediately"
                  checked={formData.respond_immediately === true}
                  onChange={() => handleChange('respond_immediately', true)}
                  className="mt-0.5 mr-3 text-emerald-500 bg-slate-800 border-slate-700 focus:ring-emerald-500"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-slate-200">Immediate Response</span>
                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-xs rounded border border-emerald-500/20">
                      Fast
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Respond immediately after function execution for faster interactions
                  </p>
                </div>
              </label>
              
              <label className={`flex items-start p-4 border rounded cursor-pointer transition-all ${
                formData.respond_immediately === false
                  ? 'bg-emerald-500/5 border-emerald-500/50'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}>
                <input
                  type="radio"
                  name="respond_immediately"
                  checked={formData.respond_immediately === false}
                  onChange={() => handleChange('respond_immediately', false)}
                  className="mt-0.5 mr-3 text-emerald-500 bg-slate-800 border-slate-700 focus:ring-emerald-500"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-slate-200">Wait for Results</span>
                    <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 text-xs rounded border border-amber-500/20">
                      Accurate
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Wait for function results before responding for data accuracy
                  </p>
                </div>
              </label>
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-900/50 border border-slate-800/50 rounded text-xs text-slate-500">
              <svg className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>
                Use immediate mode for conversational flows. Use wait mode for operations requiring data accuracy.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-3 border-t border-slate-800/50 bg-slate-950">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-4 text-slate-600">
            <span className="font-mono">{formData.id || 'untitled'}</span>
            <span>•</span>
            <span>{formData.functions.length} functions</span>
          </div>
          <span className={`px-2 py-1 rounded text-xs ${
            formData.respond_immediately 
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
          }`}>
            {formData.respond_immediately ? 'Immediate' : 'Wait'}
          </span>
        </div>
      </div>
    </div>
  );
}