// components/flows/index.js - Complete Visual Flow Editor with AI Voice Chatbot
import React, { useState, useEffect, useCallback, useRef } from "react";
import FlowCanvas from "./FlowCanvas";
import NodeEditor from "./NodeEditor";
import VoiceFlowChatbotPanel from "./VoiceFlowChatbotPanel";
import { flowsService } from "../../lib/flowsService";
import { convertToReactFlow, convertFromReactFlow, createDefaultNode, PositionStorage } from "./utils";

// ============================================================================
// INLINE TOOL EDITOR (Dark Theme)
// ============================================================================
function ToolEditor({ assistantId, tool, onCancel, onSaved }) {
  const [form, setForm] = useState({
    id: '',
    name: '',
    description: '',
    is_enabled: false,
    method: 'GET',
    endpoint_url: '',
    headers: [],
    input_schema: { type: 'object', properties: {}, required: [] },
    output_schema: { type: 'object', properties: {} },
    is_verified: false,
  });
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState('configure');
  const [inputSchemaText, setInputSchemaText] = useState('');
  const [outputSchemaText, setOutputSchemaText] = useState('');
  const [testBody, setTestBody] = useState('{}');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [testError, setTestError] = useState(null);

  useEffect(() => {
    if (tool) {
      const headers = Array.isArray(tool.headers)
        ? tool.headers
        : Object.entries(tool.headers || {}).map(([key, value]) => ({ key, value }));
      
      setForm({ ...tool, headers });
      setInputSchemaText(JSON.stringify(tool.input_schema || { type: 'object', properties: {} }, null, 2));
      setOutputSchemaText(JSON.stringify(tool.output_schema || { type: 'object', properties: {} }, null, 2));
    }
  }, [tool]);

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const addHeader = () => setForm(prev => ({ ...prev, headers: [...prev.headers, { key: '', value: '' }] }));
  const removeHeader = (idx) => setForm(prev => ({ ...prev, headers: prev.headers.filter((_, i) => i !== idx) }));
  const updateHeader = (idx, field, value) => {
    const next = [...form.headers];
    next[idx] = { ...next[idx], [field]: value };
    setForm(prev => ({ ...prev, headers: next }));
  };

  const runTest = async () => {
    setTesting(true);
    setTestError(null);
    setTestResult(null);
    try {
      const headersObj = form.headers.reduce((acc, h) => {
        if (h.key) acc[h.key] = h.value;
        return acc;
      }, {});

      let init = { method: form.method, headers: headersObj };
      if (form.method !== 'GET' && testBody && testBody.trim()) {
        init.body = testBody;
        if (!init.headers['Content-Type']) init.headers['Content-Type'] = 'application/json';
      }

      const start = performance.now();
      const res = await fetch(form.endpoint_url, init);
      const duration = Math.round(performance.now() - start);
      const contentType = res.headers.get('content-type') || '';
      
      let json = null, text = null;
      if (contentType.includes('application/json')) {
        try { json = await res.json(); } catch { }
      } else {
        try { text = await res.text(); } catch { }
      }
      
      setTestResult({ status: res.status, ok: res.ok, duration, contentType, json, text });
    } catch (e) {
      setTestError(String(e));
    } finally {
      setTesting(false);
    }
  };

  const passed = testResult && testResult.ok;

  const saveVerification = async () => {
    setSaving(true);
    try {
      const headersObj = form.headers.reduce((acc, h) => {
        if (h.key) acc[h.key] = h.value;
        return acc;
      }, {});

      let parsedInput = form.input_schema;
      try { parsedInput = JSON.parse(inputSchemaText); } catch { }
      
      let parsedOutput = form.output_schema;
      try { parsedOutput = JSON.parse(outputSchemaText); } catch { }

      const payload = {
        ...form,
        name: form.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''),
        headers: headersObj,
        input_schema: parsedInput,
        output_schema: parsedOutput,
        is_verified: passed,
        is_enabled: passed ? form.is_enabled : false,
      };

      const apiBase = process.env.NEXT_PUBLIC_API_BASE || "https://esapdev.xyz:7000/agentbuilder/api";
      const url = tool?.id 
        ? `${apiBase}/assistants/${assistantId}/tools/${tool.id}`
        : `${apiBase}/assistants/${assistantId}/tools`;
      
      const res = await fetch(url, {
        method: tool?.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(await res.text());
      const saved = await res.json();
      onSaved(saved);
    } catch (e) {
      console.error(e);
      alert('Failed to save tool: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-slate-900 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-200">{tool ? 'Edit Tool' : 'Add Tool'}</h2>
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-200">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex space-x-4 mb-6">
        <button
          className={`px-4 py-2 rounded-lg ${step === 'configure' ? 'bg-green-600 text-white' : 'bg-slate-700 text-slate-300'}`}
          onClick={() => setStep('configure')}
        >
          Configure
        </button>
        <button
          className={`px-4 py-2 rounded-lg ${step === 'verify' ? 'bg-green-600 text-white' : 'bg-slate-700 text-slate-300'}`}
          onClick={() => setStep('verify')}
        >
          Verify
        </button>
      </div>

      {step === 'configure' ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Tool Name *</label>
                <input
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-slate-200"
                  value={form.name}
                  onChange={e => update('name', e.target.value)}
                  placeholder="e.g., get_weather"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                <textarea
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-slate-200"
                  rows={3}
                  value={form.description}
                  onChange={e => update('description', e.target.value)}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Method *</label>
                  <select
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-slate-200"
                    value={form.method}
                    onChange={e => update('method', e.target.value)}
                  >
                    <option>GET</option>
                    <option>POST</option>
                    <option>PUT</option>
                    <option>DELETE</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-2">URL *</label>
                  <input
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-slate-200"
                    value={form.endpoint_url}
                    onChange={e => update('endpoint_url', e.target.value)}
                    placeholder="https://api.example.com/endpoint"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Headers</label>
                {form.headers.map((h, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <input
                      className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
                      placeholder="Key"
                      value={h.key}
                      onChange={e => updateHeader(idx, 'key', e.target.value)}
                    />
                    <input
                      className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
                      placeholder="Value"
                      value={h.value}
                      onChange={e => updateHeader(idx, 'value', e.target.value)}
                    />
                    <button
                      onClick={() => removeHeader(idx)}
                      className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  onClick={addHeader}
                  className="text-sm text-green-400 hover:text-green-300"
                >
                  + Add header
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Input Schema (JSON)</label>
                <textarea
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 font-mono text-xs"
                  rows={8}
                  value={inputSchemaText}
                  onChange={e => {
                    setInputSchemaText(e.target.value);
                    try { update('input_schema', JSON.parse(e.target.value)); } catch { }
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Output Schema (JSON)</label>
                <textarea
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 font-mono text-xs"
                  rows={8}
                  value={outputSchemaText}
                  onChange={e => {
                    setOutputSchemaText(e.target.value);
                    try { update('output_schema', JSON.parse(e.target.value)); } catch { }
                  }}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-6 border-t border-slate-700">
            <button
              onClick={() => setStep('verify')}
              className="px-6 py-2 bg-slate-700 text-slate-200 rounded-lg hover:bg-slate-600"
            >
              Go to Verify
            </button>
            <div className="space-x-3">
              <button
                onClick={onCancel}
                className="px-6 py-2 bg-slate-700 text-slate-200 rounded-lg hover:bg-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={saveVerification}
                disabled={saving}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : tool ? 'Save Changes' : 'Create Tool'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <h4 className="font-semibold text-slate-200 mb-3">Test Tool</h4>
            <textarea
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 font-mono text-sm"
              rows={4}
              value={testBody}
              onChange={e => setTestBody(e.target.value)}
              placeholder='{"key": "value"}'
            />
            <button
              onClick={runTest}
              disabled={testing}
              className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {testing ? 'Testing...' : 'Run Test'}
            </button>
            {testError && (
              <div className="mt-3 text-sm text-red-400">Error: {testError}</div>
            )}
          </div>

          {testResult && (
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
              <h4 className="font-semibold text-slate-200 mb-3">Test Results</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Status:</span>
                  <span className={testResult.ok ? 'text-green-400' : 'text-red-400'}>
                    {testResult.status} {testResult.ok ? '✓' : '✗'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Latency:</span>
                  <span className="text-slate-200">{testResult.duration} ms</span>
                </div>
                <div className="mt-3">
                  <div className="text-slate-400 mb-1">Response:</div>
                  <pre className="bg-slate-900 border border-slate-700 rounded p-3 overflow-auto max-h-40 text-xs text-slate-200">
                    {testResult.json ? JSON.stringify(testResult.json, null, 2) : testResult.text}
                  </pre>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-6 border-t border-slate-700">
            <button
              onClick={() => setStep('configure')}
              className="px-6 py-2 bg-slate-700 text-slate-200 rounded-lg hover:bg-slate-600"
            >
              Back to Configure
            </button>
            <button
              onClick={saveVerification}
              disabled={saving}
              className={`px-6 py-2 rounded-lg ${
                passed
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-slate-700 text-slate-400'
              } disabled:opacity-50`}
            >
              {saving ? 'Saving...' : passed ? '✓ Mark as Verified' : 'Save'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// INLINE TOOLS LIST (Dark Theme)
// ============================================================================
function ToolsList({ assistantId, onAdd, onEdit }) {
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [togglingToolId, setTogglingToolId] = useState(null);

  const loadTools = async () => {
    setLoading(true);
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE || "https://esapdev.xyz:7000/agentbuilder/api";
      const res = await fetch(`${apiBase}/assistants/${assistantId}/tools`);
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setTools(data);
    } catch (error) {
      console.error('Failed to load tools:', error);
      setTools([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTools();
  }, [assistantId]);

  const handleToggle = async (tool) => {
    if (!tool.is_verified) {
      alert('Please verify the tool before enabling it.');
      return;
    }
    
    setTogglingToolId(tool.id);
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE || "https://esapdev.xyz:7000/agentbuilder/api";
      const updatedTool = { ...tool, is_enabled: !tool.is_enabled };
      
      const res = await fetch(`${apiBase}/assistants/${assistantId}/tools/${tool.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTool),
      });
      
      if (!res.ok) throw new Error(await res.text());
      await loadTools();
    } catch (error) {
      console.error('Failed to toggle tool:', error);
      alert('Failed to toggle tool status');
    } finally {
      setTogglingToolId(null);
    }
  };

  const handleDelete = async (toolId) => {
    if (!confirm('Delete this tool?')) return;
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE || "https://esapdev.xyz:7000/agentbuilder/api";
      await fetch(`${apiBase}/assistants/${assistantId}/tools/${toolId}`, { method: 'DELETE' });
      await loadTools();
    } catch (error) {
      console.error('Failed to delete tool:', error);
      alert('Failed to delete tool');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-200">Tools ({tools.length})</h3>
        <button
          onClick={onAdd}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Tool
        </button>
      </div>

      {tools.length === 0 ? (
        <div className="text-center py-10 bg-slate-800 rounded-lg border border-slate-700">
          <div className="text-sm text-slate-400">No tools yet. Create your first tool.</div>
        </div>
      ) : (
        <div className="space-y-3">
          {tools.map(tool => (
            <div key={tool.id} className="bg-slate-800 border border-slate-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-medium text-slate-200">{tool.name}</span>
                    {tool.is_verified ? (
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">Verified</span>
                    ) : (
                      <span className="px-2 py-1 bg-slate-700 text-slate-400 text-xs rounded-full">Pending</span>
                    )}
                    {tool.is_enabled && (
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">Enabled</span>
                    )}
                  </div>
                  <div className="text-sm text-slate-400 mb-2">{tool.description}</div>
                  <div className="text-xs text-slate-500">
                    {tool.method} • {tool.endpoint_url}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(tool)}
                    className="px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700"
                  >
                    Configure
                  </button>
                  <button
                    onClick={() => handleToggle(tool)}
                    disabled={!tool.is_verified || togglingToolId === tool.id}
                    className={`px-3 py-1 text-xs rounded-lg ${
                      tool.is_enabled 
                        ? 'bg-green-600 text-white hover:bg-green-700' 
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {togglingToolId === tool.id ? (
                      <>
                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin inline mr-1"></div>
                        Saving...
                      </>
                    ) : (
                      tool.is_enabled ? 'Disable' : 'Enable'
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(tool.id)}
                    className="px-3 py-1 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MAIN VISUAL FLOW EDITOR COMPONENT
// ============================================================================
export default function VisualFlowEditor({ assistantId }) {
  // Flow state
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [flowName, setFlowName] = useState("");
  const [initialNodeId, setInitialNodeId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activating, setActivating] = useState(false);
  const [message, setMessage] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const fileInputRef = useRef(null);
  const savePositionTimeoutRef = useRef(null);
  // Tools state
  const [showToolsPanel, setShowToolsPanel] = useState(false);
  const [editingTool, setEditingTool] = useState(null);
  const [showToolEditor, setShowToolEditor] = useState(false);
  const [toolsRefreshTrigger, setToolsRefreshTrigger] = useState(0);

  // AI Chatbot state
  const [showChatbot, setShowChatbot] = useState(false);
  const [chatbotMinimized, setChatbotMinimized] = useState(false);
  const [chatSessionId] = useState(() => 
    `voice_chat_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
  );

  // Load flow on mount
  useEffect(() => {
  let mounted = true;
  (async () => {
    setLoading(true);
    try {
      const latest = await flowsService.latest(assistantId);
      if (!mounted || !latest) {
        const defaultNode = createDefaultNode("welcome", 100, 100);
        setNodes([defaultNode]);
        setInitialNodeId("welcome");
        setLoading(false);
        return;
      }

      const flow = latest.initial || latest.nodes || latest.edges ? latest : latest.flow;
      if (!flow || !Array.isArray(flow.nodes)) {
        const defaultNode = createDefaultNode("welcome", 100, 100);
        setNodes([defaultNode]);
        setInitialNodeId("welcome");
        setLoading(false);
        return;
      }

      // ✅ NEW: Load saved positions from localStorage
      const savedPositions = PositionStorage.loadPositions(assistantId);

      // ✅ MODIFIED: Convert with position restoration
      const { nodes: reactFlowNodes, edges: reactFlowEdges } = convertToReactFlow(flow, savedPositions);
      setNodes(reactFlowNodes);
      setEdges(reactFlowEdges);
      setInitialNodeId(flow.initial || reactFlowNodes[0]?.data?.id || "welcome");

      // ✅ NEW: Show feedback if positions were restored
      if (Object.keys(savedPositions).length > 0) {
        setMessage("✅ Node positions restored from previous session");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      console.error("Failed to load flow:", error);
      const defaultNode = createDefaultNode("welcome", 100, 100);
      setNodes([defaultNode]);
      setInitialNodeId("welcome");
    } finally {
      setLoading(false);
    }
  })();
  return () => { mounted = false; };
}, [assistantId]);
  // ✅ NEW: Auto-save positions when nodes change (debounced)
const savePositionsDebounced = useCallback(() => {
  // Clear existing timeout
  if (savePositionTimeoutRef.current) {
    clearTimeout(savePositionTimeoutRef.current);
  }

  // Save after 1 second of inactivity
  savePositionTimeoutRef.current = setTimeout(() => {
    PositionStorage.savePositions(assistantId, nodes);
  }, 1000);
}, [assistantId, nodes]);

// ✅ NEW: Trigger position save when nodes change
useEffect(() => {
  if (nodes.length > 0) {
    savePositionsDebounced();
  }
  
  // Cleanup timeout on unmount
  return () => {
    if (savePositionTimeoutRef.current) {
      clearTimeout(savePositionTimeoutRef.current);
    }
  };
}, [nodes, savePositionsDebounced]);
  // Add node
  const addNode = useCallback(() => {
    const newNodeId = `node_${Date.now()}`;
    const newNode = createDefaultNode(newNodeId, Math.random() * 300 + 100, Math.random() * 300 + 100);
    setNodes(prev => [...prev, newNode]);
  }, []);

  // Update node data
  const updateNodeData = useCallback((nodeId, newData) => {
    setNodes(prev => prev.map(node => 
      node.id === nodeId 
        ? { ...node, data: { ...node.data, ...newData } }
        : node
    ));
  }, []);

  // Delete selected node
  const deleteSelectedNode = useCallback(() => {
    if (!selectedNode) return;
    
    setNodes(prev => prev.filter(node => node.id !== selectedNode.id));
    setEdges(prev => prev.filter(edge => 
      edge.source !== selectedNode.id && edge.target !== selectedNode.id
    ));
    setSelectedNode(null);
    
    if (initialNodeId === selectedNode.data?.id) {
      const remainingNodes = nodes.filter(node => node.id !== selectedNode.id);
      setInitialNodeId(remainingNodes[0]?.data?.id || "");
    }
  }, [selectedNode, nodes, initialNodeId]);

  // Export flow
  const exportFlow = useCallback(() => {
    try {
      const flowData = convertFromReactFlow(nodes, edges, initialNodeId);
      const exportData = {
        name: flowName || "Visual Flow",
        version: 1,
        flow: flowData,
        exportedAt: new Date().toISOString(),
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${flowName || 'flow'}_${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setMessage("Flow exported successfully ✅");
      setTimeout(() => setMessage(""), 3000);
    } catch (e) {
      setMessage(`Export failed: ${e.message}`);
      setTimeout(() => setMessage(""), 3000);
    }
  }, [nodes, edges, initialNodeId, flowName]);

  // Import flow
  const importFlow = useCallback((event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        
        if (!importedData.flow || !Array.isArray(importedData.flow.nodes)) {
          throw new Error("Invalid flow format");
        }
        PositionStorage.clearPositions(assistantId);

        const { nodes: reactFlowNodes, edges: reactFlowEdges } = convertToReactFlow(importedData.flow);
        setNodes(reactFlowNodes);
        setEdges(reactFlowEdges);
        setInitialNodeId(importedData.flow.initial || reactFlowNodes[0]?.data?.id || "welcome");
        setFlowName(importedData.name || "");
        
        setMessage("Flow imported successfully ✅");
        setTimeout(() => setMessage(""), 3000);
      } catch (e) {
        setMessage(`Import failed: ${e.message}`);
        setTimeout(() => setMessage(""), 3000);
      }
    };
    reader.readAsText(file);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  // Save flow
  const saveFlow = useCallback(async () => {
    setMessage("");
    setSaving(true);
    try {
      const flowData = convertFromReactFlow(nodes, edges, initialNodeId);
      const payload = {
        flow: flowData,
        name: flowName || "Visual Flow",
        version: 1,
      };
      const res = await flowsService.save(assistantId, payload);
      setMessage(res?.ok === false ? `Save failed: ${res.error || "error"}` : "Saved ✅");
      setTimeout(() => setMessage(""), 3000);
    } catch (e) {
      setMessage(`Save failed: ${e.message}`);
    } finally {
      setSaving(false);
    }
  }, [nodes, edges, initialNodeId, flowName, assistantId]);

  // Activate flow
  const activateFlow = useCallback(async () => {
    setMessage("");
    setActivating(true);
    try {
      const flowData = convertFromReactFlow(nodes, edges, initialNodeId);
      const res = await flowsService.activate(assistantId, { flow: flowData });
      setMessage(res?.ok === false ? `Activate failed: ${res.error || "error"}` : "Activated ✅");
      setTimeout(() => setMessage(""), 3000);
    } catch (e) {
      setMessage(`Activate failed: ${e.message}`);
    } finally {
      setActivating(false);
    }
  }, [nodes, edges, initialNodeId, assistantId]);

  // Tool handlers
  const handleToolSaved = (tool) => {
    setEditingTool(null);
    setShowToolEditor(false);
    setShowToolsPanel(true);
    setToolsRefreshTrigger(prev => prev + 1);
    setMessage(`Tool "${tool.name}" saved successfully ✅`);
    setTimeout(() => setMessage(""), 3000);
  };

  const handleAddTool = () => {
    console.log('Add tool clicked - opening editor');
    setEditingTool(null);
    setShowToolEditor(true);
  };

  const handleEditTool = (tool) => {
    console.log('Edit tool clicked', tool);
    setEditingTool(tool);
    setShowToolEditor(true);
  };

  const handleCloseToolsPanel = () => {
    setShowToolsPanel(false);
    setShowToolEditor(false);
    setEditingTool(null);
  };

  // AI Chatbot handlers
  const handleApplyChatbotFlow = async (flow, tools = []) => {
    if (!flow || !flow.nodes) {
      setMessage('❌ Invalid flow from AI');
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    console.log("Applying AI-generated flow:", flow);
    console.log("Tools to create:", tools);

    try {
      // Step 1: Create tools first (if any)
      const createdTools = [];
      if (tools && tools.length > 0) {
        setMessage(`⏳ Creating ${tools.length} tools...`);
        
        for (const tool of tools) {
          try {
            const apiBase = process.env.NEXT_PUBLIC_API_BASE || "https://esapdev.xyz:7000/agentbuilder/api";
            
            // Prepare tool payload
            const toolPayload = {
              name: tool.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''),
              description: tool.description || `Auto-generated tool: ${tool.name}`,
              method: tool.method || 'POST',
              endpoint_url: tool.endpoint_url || 'https://api.example.com/endpoint',
              input_schema: tool.input_schema || { type: 'object', properties: {} },
              output_schema: tool.output_schema || { type: 'object', properties: {} },
              headers: tool.headers || { 'Content-Type': 'application/json' },
              is_enabled: false, // Created as disabled - user must verify
              is_verified: false
            };

            console.log(`Creating tool: ${toolPayload.name}`);

            const response = await fetch(`${apiBase}/assistants/${assistantId}/tools`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(toolPayload)
            });

            if (response.ok) {
              const createdTool = await response.json();
              createdTools.push(createdTool);
              console.log(`✓ Tool created: ${createdTool.name}`);
            } else {
              const error = await response.text();
              console.error(`Failed to create tool ${toolPayload.name}:`, error);
            }
          } catch (toolError) {
            console.error(`Error creating tool ${tool.name}:`, toolError);
          }
        }

        if (createdTools.length > 0) {
          setToolsRefreshTrigger(prev => prev + 1); // Trigger tools list refresh
          setMessage(`✅ Created ${createdTools.length}/${tools.length} tools`);
        }
      }

      // Step 2: Convert AI flow format to ReactFlow format
      const { nodes: reactFlowNodes, edges: reactFlowEdges } = convertToReactFlow(flow);
      
      setNodes(reactFlowNodes);
      setEdges(reactFlowEdges);
      setInitialNodeId(flow.initial || reactFlowNodes[0]?.data?.id || "welcome");
      
      const toolMessage = createdTools.length > 0 
        ? `. ${createdTools.length} tools created (verify & enable in Tool Management)`
        : '';
      
      setMessage(`✅ AI flow applied: ${reactFlowNodes.length} nodes, ${reactFlowEdges.length} edges${toolMessage}`);
      setTimeout(() => setMessage(""), 5000);

      // Step 3: Auto-save after applying
      setTimeout(async () => {
        try {
          const flowData = convertFromReactFlow(reactFlowNodes, reactFlowEdges, flow.initial);
          await flowsService.save(assistantId, {
            flow: flowData,
            name: flowName || "AI Generated Flow",
            version: 1,
          });
          setMessage("✅ AI flow applied and saved");
          setTimeout(() => setMessage(""), 3000);
        } catch (e) {
          console.error("Auto-save failed:", e);
        }
      }, 1000);

    } catch (e) {
      console.error("Apply flow error:", e);
      setMessage(`❌ Failed to apply flow: ${e.message}`);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handlePreviewChatbotFlow = (flow) => {
    console.log("Preview AI flow:", flow);
    // Optional: Show preview modal or visualization
  };

  // Get current flow for chatbot context
  const getCurrentFlow = useCallback(() => {
    try {
      return convertFromReactFlow(nodes, edges, initialNodeId);
    } catch {
      return null;
    }
  }, [nodes, edges, initialNodeId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-950">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          <div className="mt-4 text-slate-400">Loading flow editor...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex bg-slate-950">
      {/* Left Side - Flow Canvas with Controls */}
      <div className="flex-1 relative">
        {/* Control Panel - Top Left */}
        <div className="absolute top-4 left-4 z-10">
          <div className="bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-800 p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <h2 className="text-sm font-semibold text-slate-200">Flow Editor</h2>
            </div>

            {/* Flow Name */}
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Flow Name</label>
                <input
                  type="text"
                  placeholder="Enter flow name..."
                  value={flowName}
                  onChange={(e) => setFlowName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500/50 transition-all"
                />
              </div>
              
              {/* Initial Node Selector */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Initial Node</label>
                <select
                  value={initialNodeId}
                  onChange={(e) => setInitialNodeId(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500/50 transition-all"
                >
                  <option value="">Select initial node</option>
                  {nodes.map(node => (
                    <option key={node.id} value={node.data.id}>
                      {node.data.title || node.data.id}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Add/Delete Node Buttons */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                onClick={addNode}
                className="px-3 py-2 text-sm bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg hover:from-green-500 hover:to-green-400 transition-all duration-200 shadow-lg shadow-green-500/20 hover:shadow-green-500/30 font-medium flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Node
              </button>
              
              {selectedNode && (
                <button
                  onClick={deleteSelectedNode}
                  className="px-3 py-2 text-sm bg-gradient-to-r from-red-600 to-red-500 text-white rounded-lg hover:from-red-500 hover:to-red-400 transition-all duration-200 shadow-lg shadow-red-500/20 hover:shadow-red-500/30 font-medium flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              )}
            </div>

            {/* AI Flow Designer Button */}
            <button
              onClick={() => {
                setShowChatbot(!showChatbot);
                setChatbotMinimized(false);
              }}
              className={`w-full mb-3 px-3 py-2 text-sm ${
                showChatbot
                  ? 'bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
              } text-white rounded-lg transition-all duration-200 shadow-lg font-medium flex items-center justify-center gap-2`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              {showChatbot ? 'Hide AI Designer' : 'AI Flow Designer'}
            </button>

            {/* Manage Tools Button */}
            <button
              onClick={() => setShowToolsPanel(true)}
              className="w-full mb-3 px-3 py-2 text-sm bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-lg hover:from-purple-500 hover:to-purple-400 transition-all duration-200 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 font-medium flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Manage Tools
            </button>

            {/* Import/Export Buttons */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={importFlow}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-2 text-sm bg-slate-700 text-slate-200 rounded-lg hover:bg-slate-600 transition-all duration-200 font-medium flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Import
              </button>
              
              <button
                onClick={exportFlow}
                className="px-3 py-2 text-sm bg-slate-700 text-slate-200 rounded-lg hover:bg-slate-600 transition-all duration-200 font-medium flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
                Export
              </button>
            </div>

            {/* Save/Activate Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={saveFlow}
                disabled={saving}
                className="px-3 py-2 text-sm bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg hover:from-green-500 hover:to-green-400 disabled:from-slate-600 disabled:to-slate-500 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-green-500/20 hover:shadow-green-500/30 font-medium flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V2" />
                    </svg>
                    Save
                  </>
                )}
              </button>
              
              <button
                onClick={activateFlow}
                disabled={activating}
                className="px-3 py-2 text-sm bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-lg hover:from-purple-500 hover:to-purple-400 disabled:from-slate-600 disabled:to-slate-500 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 font-medium flex items-center justify-center gap-2"
              >
                {activating ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Activating...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Activate
                  </>
                )}
              </button>
            </div>

            {/* Status Message */}
            {message && (
              <div className={`mt-3 px-3 py-2 rounded-lg text-xs font-medium animate-fade-in ${
                message.includes('failed') || message.includes('❌')
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                  : 'bg-green-500/20 text-green-400 border border-green-500/30'
              }`}>
                {message}
              </div>
            )}
          </div>
        </div>

        {/* Flow Canvas */}
        <FlowCanvas
          nodes={nodes}
          edges={edges}
          setNodes={setNodes}
          setEdges={setEdges}
          selectedNode={selectedNode}
          setSelectedNode={setSelectedNode}
        />
      </div>

      {/* AI Chatbot Panel - Right Side (Full or Minimized) */}
      {showChatbot && (
        <div className={`flex-shrink-0 ${chatbotMinimized ? 'w-0' : 'w-[420px]'} transition-all duration-300 p-4 pl-0 h-full`}>
          <VoiceFlowChatbotPanel
            assistantId={assistantId}
            currentFlow={getCurrentFlow()}
            onApplyFlow={handleApplyChatbotFlow}
            onPreviewFlow={handlePreviewChatbotFlow}
            sessionId={chatSessionId}
            isMinimized={chatbotMinimized}
            onToggleMinimize={() => setChatbotMinimized(!chatbotMinimized)}
          />
        </div>
      )}

      {/* Tools Panel Modal */}
      {showToolsPanel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={(e) => {
          if (e.target === e.currentTarget) handleCloseToolsPanel();
        }}>
          <div className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-200">Tool Management</h3>
              <button
                onClick={handleCloseToolsPanel}
                className="text-slate-400 hover:text-slate-200 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-auto p-5">
              {showToolEditor ? (
                <ToolEditor
                  assistantId={assistantId}
                  tool={editingTool}
                  onCancel={() => {
                    setShowToolEditor(false);
                    setEditingTool(null);
                  }}
                  onSaved={handleToolSaved}
                />
              ) : (
                <ToolsList
                  assistantId={assistantId}
                  onAdd={handleAddTool}
                  onEdit={handleEditTool}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Node Editor Sidebar - Right Side */}
      <div className={`transition-all duration-300 ${
        sidebarCollapsed ? 'w-0' : 'w-96'
      } relative`}>
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute -left-4 top-1/2 -translate-y-1/2 z-20 bg-slate-800 hover:bg-slate-700 rounded-full p-2 shadow-xl border border-slate-700 transition-all duration-200"
        >
          <svg 
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
              sidebarCollapsed ? 'rotate-180' : ''
            }`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {!sidebarCollapsed && selectedNode && (
          <div className="w-full h-full bg-slate-900 border-l border-slate-800 overflow-hidden">
            <NodeEditor
              node={selectedNode}
              assistantId={assistantId}
              onUpdate={(newData) => updateNodeData(selectedNode.id, newData)}
              toolsRefreshTrigger={toolsRefreshTrigger}
            />
          </div>
        )}
      </div>
    </div>
  );
}