import React, { useEffect, useMemo, useState } from 'react';
import { X, Save, Link as LinkIcon, ToggleLeft, ToggleRight, Plus, Trash2, Code, CheckCircle2, AlertCircle, Zap } from 'lucide-react';
import { toolsService } from '../lib/toolsService';
import ToolVerifyPanel from './ToolVerifyPanel';
import { validateToolConfig } from '../lib/toolValidation';

const emptyTool = {
  id: '',
  name: '',
  description: '',
  is_enabled: true,
  method: 'GET',
  endpoint_url: '',
  headers: [], // [{key, value}]
  input_schema: { type: 'object', properties: {}, required: [] },
  output_schema: { type: 'object', properties: {} },
  is_verified: false, // Changed from verification: null
};

// Helper function to sanitize tool names for Gemini compatibility
const sanitizeToolName = (name) => {
  return name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
};

const ToolEditor = ({ assistantId, tool = null, onCancel, onSaved }) => {
  const [form, setForm] = useState(emptyTool);
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState('configure'); // 'configure' | 'verify'
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const loadExistingNames = async () => {
    try {
      const tools = await toolsService.listTools(assistantId);
      return tools.map(t => t.name).filter(n => n !== (tool?.name || ''));
    } catch (error) {
      console.error('Failed to load existing tool names:', error);
      return [];
    }
  };

  const [existingNames, setExistingNames] = useState([]);
  const validation = useMemo(() => validateToolConfig(form, existingNames), [form, existingNames]);

  useEffect(() => {
    const loadNames = async () => {
      const names = await loadExistingNames();
      setExistingNames(names);
    };
    loadNames();
  }, [assistantId, tool]);

  useEffect(() => {
    if (tool) {
      setForm({
        ...emptyTool,
        ...tool,
        headers: Array.isArray(tool.headers)
          ? tool.headers
          : Object.entries(tool.headers || {}).map(([key, value]) => ({ key, value })),
      });
    } else {
      setForm({ ...emptyTool, id: '' });
    }
  }, [tool]);

  // --- NEW: keep schema text as editable strings so paste/typing won't be blocked ---
  const [inputSchemaText, setInputSchemaText] = useState(JSON.stringify(form.input_schema, null, 2));
  const [outputSchemaText, setOutputSchemaText] = useState(JSON.stringify(form.output_schema, null, 2));

  // When the underlying form schemas change (e.g., on load or after verification),
  // update the textareas to reflect the current schema objects.
  useEffect(() => {
    try {
      setInputSchemaText(JSON.stringify(form.input_schema, null, 2));
    } catch {
      setInputSchemaText('');
    }
  }, [form.input_schema]);

  useEffect(() => {
    try {
      setOutputSchemaText(JSON.stringify(form.output_schema, null, 2));
    } catch {
      setOutputSchemaText('');
    }
  }, [form.output_schema]);
  // --- END NEW ---

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const updateHeader = (idx, field, value) => {
    const next = [...form.headers];
    next[idx] = { ...next[idx], [field]: value };
    setForm(prev => ({ ...prev, headers: next }));
  };

  const addHeader = () => setForm(prev => ({ ...prev, headers: [...prev.headers, { key: '', value: '' }] }));
  const removeHeader = (idx) => setForm(prev => ({ ...prev, headers: prev.headers.filter((_, i) => i !== idx) }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const headersObj = form.headers.reduce((acc, h) => { if (h.key) acc[h.key] = h.value; return acc; }, {});

      // Parse schemas from textarea strings if possible; fall back to form's current objects
      let parsedInput = form.input_schema;
      try {
        parsedInput = JSON.parse(inputSchemaText);
      } catch (err) {
        // keep existing form.input_schema if parse fails
      }
      let parsedOutput = form.output_schema;
      try {
        parsedOutput = JSON.parse(outputSchemaText);
      } catch (err) {
        // keep existing form.output_schema if parse fails
      }

      const payload = { 
        ...form, 
        headers: headersObj, 
        input_schema: parsedInput, 
        output_schema: parsedOutput 
      };
      
      // Sanitize tool name for Gemini compatibility
      payload.name = sanitizeToolName(payload.name);
      
      // Force disabled until verified
      if (!payload.is_verified) {
        payload.is_enabled = false;
      }
      
      let savedTool;
      if (tool?.id) {
        savedTool = await toolsService.updateTool(assistantId, tool.id, payload);
      } else {
        savedTool = await toolsService.createTool(assistantId, payload);
      }
      
      onSaved(savedTool);
    } catch (e) {
      console.error(e);
      alert('Failed to save tool');
    } finally {
      setSaving(false);
    }
  };

  const onVerified = (updated) => {
    // Ensure headers are in the correct format for the form
    const updatedWithCorrectHeaders = {
      ...updated,
      headers: Array.isArray(updated.headers) 
        ? updated.headers 
        : Object.entries(updated.headers || {}).map(([key, value]) => ({ key, value }))
    };
    setForm(updatedWithCorrectHeaders);
    
    // Show success message
    if (updated.is_verified) {
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    }
    
    // Switch back to configure step
    setStep('configure');
    
    // Trigger parent reload if callback exists
    if (onSaved) {
      onSaved(updated);
    }
  };

  const canEnable = form.is_verified;

  return (
    <div className="min-h-screen bg-green-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        </div>

        <div className="relative backdrop-blur-sm bg-green-100/130 rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
          {/* Glassmorphism overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-50/20 to-green-100/5 pointer-events-none"></div>
          
          <div className="relative p-8">
            {/* Success Toast */}
            {showSuccessToast && (
              <div className="mb-8 p-4 bg-gradient-to-r from-emerald-500/10 to-green-500/10 backdrop-blur-md border border-emerald-200/50 rounded-2xl flex items-center animate-in slide-in-from-top-4 duration-500">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center mr-4 animate-bounce">
                  <CheckCircle2 size={18} className="text-white" />
                </div>
                <div className="text-emerald-800">
                  <span className="font-semibold">Tool verified successfully!</span>
                  <span className="text-sm ml-2 opacity-80">You can now enable it in the Configure step.</span>
                </div>
              </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                  <Zap className="text-white" size={24} />
                </div>
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                    {tool ? 'Edit Tool' : 'Create New Tool'}
                  </h2>
                  <p className="text-slate-500 text-sm mt-1">Configure and verify your API integration</p>
                </div>
              </div>
              <button 
                onClick={onCancel} 
                className="w-12 h-12 rounded-2xl bg-slate-100/80 hover:bg-slate-200/80 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <X size={20} className="text-slate-600" />
              </button>
            </div>

            {/* Modern Stepper */}
            <div className="flex space-x-2 mb-10 bg-slate-100/50 rounded-2xl p-2">
              <button 
                className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  step === 'configure' 
                    ? 'bg-white shadow-lg text-blue-600 transform scale-105' 
                    : 'text-slate-600 hover:text-slate-800 hover:bg-white/50'
                }`} 
                onClick={() => setStep('configure')}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Code size={16} />
                  <span>Configure</span>
                </div>
              </button>
              <button 
                className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  step === 'verify' 
                    ? 'bg-white shadow-lg text-blue-600 transform scale-105' 
                    : 'text-slate-600 hover:text-slate-800 hover:bg-white/50'
                }`} 
                onClick={() => setStep('verify')}
              >
                <div className="flex items-center justify-center space-x-2">
                  <CheckCircle2 size={16} />
                  <span>Verify</span>
                </div>
              </button>
            </div>

            {step === 'configure' ? (
              <div className="grid lg:grid-cols-2 gap-10">
                {/* Left Section - Basic Configuration */}
                <div className="space-y-8">
                  <form onSubmit={onSubmit} className="space-y-8">
                    {/* Basic Info Card */}
                    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/80 shadow-sm">
                      <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                        Basic Information
                      </h3>
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Tool Name *</label>
                          <input 
                            className="w-full bg-white/80 border border-slate-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:bg-white" 
                            value={form.name} 
                            onChange={e => update('name', e.target.value)} 
                            required 
                            placeholder="e.g., add product" 
                          />
                          {form.name && (
                            <div className="text-xs text-slate-500 mt-2 p-2 bg-slate-50 rounded-lg">
                              Gemini will use: <code className="bg-slate-200 px-2 py-1 rounded font-mono">{sanitizeToolName(form.name)}</code>
                            </div>
                          )}
                          {validation.errors.length > 0 && (
                            <div className="flex items-center mt-2 text-xs text-red-600">
                              <AlertCircle size={12} className="mr-1" />
                              {validation.errors[0]}
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                          <textarea 
                            className="w-full bg-white/80 border border-slate-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:bg-white resize-none" 
                            rows={3} 
                            value={form.description} 
                            onChange={e => update('description', e.target.value)}
                            placeholder="Describe what this tool does..."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-3">Status</label>
                          <button 
                            type="button" 
                            disabled={!canEnable} 
                            onClick={() => update('is_enabled', !form.is_enabled)} 
                            className={`inline-flex items-center px-4 py-3 rounded-xl border transition-all duration-200 ${
                              canEnable ? 'hover:scale-105 active:scale-95' : 'opacity-50 cursor-not-allowed'
                            } ${form.is_enabled ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
                          >
                            {form.is_enabled ? 
                              <ToggleRight size={20} className="mr-2 text-emerald-600" /> : 
                              <ToggleLeft size={20} className="mr-2 text-slate-400" />
                            }
                            {form.is_enabled ? 'Enabled' : 'Disabled'}
                          </button>
                          {!canEnable && (
                            <div className="text-xs text-slate-500 mt-2 flex items-center">
                              <AlertCircle size={12} className="mr-1" />
                              Tool will be activated once verified
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* HTTP Configuration Card */}
                    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/80 shadow-sm">
                      <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                        HTTP Configuration
                      </h3>
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Method *</label>
                            <select 
                              className="w-full bg-white/80 border border-slate-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:bg-white" 
                              value={form.method} 
                              onChange={e => update('method', e.target.value)} 
                              required
                            >
                              <option>GET</option>
                              <option>POST</option>
                              <option>PUT</option>
                              <option>DELETE</option>
                            </select>
                          </div>
                          <div className="lg:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Endpoint URL *</label>
                            <div className="relative">
                              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                                <LinkIcon size={16} />
                              </div>
                              <input 
                                className="w-full bg-white/80 border border-slate-200 pl-10 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:bg-white" 
                                value={form.endpoint_url} 
                                onChange={e => update('endpoint_url', e.target.value)} 
                                required 
                                placeholder="https://api.example.com/endpoint" 
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <label className="block text-sm font-medium text-slate-700">Headers</label>
                            <button 
                              type="button" 
                              onClick={addHeader} 
                              className="flex items-center px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200"
                            >
                              <Plus size={14} className="mr-1" />
                              Add Header
                            </button>
                          </div>
                          <div className="space-y-3">
                            {form.headers.map((h, idx) => (
                              <div key={idx} className="flex gap-3 items-center group">
                                <input 
                                  className="flex-1 bg-white/80 border border-slate-200 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:bg-white" 
                                  placeholder="Key" 
                                  value={h.key} 
                                  onChange={e => updateHeader(idx, 'key', e.target.value)} 
                                />
                                <input 
                                  className="flex-1 bg-white/80 border border-slate-200 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:bg-white" 
                                  placeholder="Value" 
                                  value={h.value} 
                                  onChange={e => updateHeader(idx, 'value', e.target.value)} 
                                />
                                <button 
                                  type="button" 
                                  onClick={() => removeHeader(idx)} 
                                  className="w-8 h-8 flex items-center justify-center text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            ))}
                            {form.headers.length === 0 && (
                              <div className="text-center py-8 text-slate-400 text-sm">
                                No headers configured
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-between items-center pt-6">
                      <button 
                        type="button" 
                        onClick={() => setStep('verify')} 
                        className="px-6 py-3 bg-slate-100/80 hover:bg-slate-200/80 text-slate-700 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
                      >
                        Go to Verify
                      </button>
                      <div className="flex space-x-3">
                        <button 
                          type="button" 
                          onClick={onCancel} 
                          className="px-6 py-3 bg-white/80 hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit" 
                          disabled={saving} 
                          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center"
                        >
                          {saving ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                          ) : (
                            <Save size={16} className="mr-2" />
                          )}
                          {tool ? 'Save Changes' : 'Create Tool'}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>

                {/* Right Section - Schema Configuration */}
                <div className="space-y-8">
                  <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/80 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      JSON Schemas
                    </h3>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Input Schema</label>
                        <textarea
                          className="w-full bg-white text-slate-800 border border-slate-300 px-4 py-3 rounded-xl font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                          rows={10}
                          value={inputSchemaText}
                          onChange={e => {
                            setInputSchemaText(e.target.value);
                            // try to update parsed schema in form when valid JSON is pasted/entered
                            try { update('input_schema', JSON.parse(e.target.value)); } catch {}
                          }}
                          placeholder="Enter JSON schema for input parameters..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Output Schema</label>
                        <textarea
                          className="w-full bg-white text-slate-800 border border-slate-300 px-4 py-3 rounded-xl font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                          rows={10}
                          value={outputSchemaText}
                          onChange={e => {
                            setOutputSchemaText(e.target.value);
                            // try to update parsed schema in form when valid JSON is pasted/entered
                            try { update('output_schema', JSON.parse(e.target.value)); } catch {}
                          }}
                          placeholder="Enter JSON schema for output response..."
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/80 shadow-sm">
                <ToolVerifyPanel 
                  assistantId={assistantId} 
                  tool={{
                    ...form, 
                    headers: Array.isArray(form.headers) 
                      ? form.headers.reduce((acc, h) => { if (h.key) acc[h.key] = h.value; return acc; }, {})
                      : form.headers || {}
                  }} 
                  onVerified={onVerified} 
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToolEditor;