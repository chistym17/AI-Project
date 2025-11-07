// components/textflow/components/TextFlowEditor.js - WITH AI CHAT + UCG FEATURE
import React, { useCallback, useEffect, useState, useRef } from "react";
import ReactFlow, { Background, Controls, MiniMap, addEdge, useEdgesState, useNodesState } from "reactflow";
import "reactflow/dist/style.css";
import { nodeTypes } from "../nodes/index.js";
import { useTextflowStore } from "../hooks/useTextflowStore.js";
import { saveTextFlow, getTextFlow } from "../api/textflowApi.js";
import { useWebSocketStream } from "../hooks/useWebSocketStream.js";
import NodeSidebar from "./NodeSidebar.js";
import ConfigPanel from "./ConfigPanel.js";
import ConsolePanel from "./ConsolePanel.js";
import TriggerManager from "./TriggerManager.js";
import TemplateGallery from "./TemplateGallery.js";
import ComponentLibraryPanel from "./ComponentLibraryPanel.js";
import FlowChatbotPanel from "./FlowChatbotPanel.js";
import ConnectorPanel from "./ConnectorPanel.js";
import { Play, Save, Layers, Zap, Download, Upload, Key, Activity, Settings, Sparkles, Package, AlertCircle, CheckCircle, GripHorizontal, Bot, MessageSquare, Plug } from "lucide-react";

export default function TextFlowEditor({ assistantId }) {
  const tf = useTextflowStore();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const [testInput, setTestInput] = useState("Test my flow");
  const [showTriggerManager, setShowTriggerManager] = useState(false);
  const [showTemplateGallery, setShowTemplateGallery] = useState(false);
  const [showComponentLibrary, setShowComponentLibrary] = useState(false);
  const [showConnectorPanel, setShowConnectorPanel] = useState(false);
  const [selectedNodeType, setSelectedNodeType] = useState(null);
  const [notification, setNotification] = useState(null);
  
  // AI Chatbot states
  const [showChatbot, setShowChatbot] = useState(false);
  const [chatbotMinimized, setChatbotMinimized] = useState(false);
  const [chatSessionId] = useState(() => 
    `chat_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
  );
  
  // Console height state (resizable)
  const [consoleHeight, setConsoleHeight] = useState(200);
  const [isResizing, setIsResizing] = useState(false);
  const resizeStartY = useRef(0);
  const resizeStartHeight = useRef(0);
  
  const isLoadingRef = useRef(false);
  const { sendMessage, isConnected } = useWebSocketStream(true, assistantId);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Console resize handlers
  const handleResizeStart = (e) => {
    e.preventDefault();
    setIsResizing(true);
    resizeStartY.current = e.clientY;
    resizeStartHeight.current = consoleHeight;
    document.body.style.cursor = 'ns-resize';
    document.body.style.userSelect = 'none';
  };

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e) => {
      const delta = resizeStartY.current - e.clientY;
      const newHeight = Math.max(150, Math.min(600, resizeStartHeight.current + delta));
      setConsoleHeight(newHeight);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  // Load flow from backend
  useEffect(() => {
    if (!assistantId || isLoadingRef.current) return;
    
    isLoadingRef.current = true;
    (async () => {
      try {
        setLoading(true);
        const data = await getTextFlow(assistantId);
        
        if (data.flow_data?.nodes?.length > 0) {
          setNodes(data.flow_data.nodes);
          setEdges(data.flow_data.edges || []);
          tf.setNodes(data.flow_data.nodes);
          tf.setEdges(data.flow_data.edges || []);
          
          tf.appendConsole({ 
            ts: Date.now(), 
            kind: "info", 
            text: `Loaded flow with ${data.flow_data.nodes.length} nodes` 
          });
        }
      } catch (e) {
        tf.appendConsole({ ts: Date.now(), kind: "error", text: `Load failed: ${e.message}` });
        showNotification('error', `Failed to load flow: ${e.message}`);
      } finally {
        setLoading(false);
        isLoadingRef.current = false;
      }
    })();
  }, [assistantId]);

  // Sync store to ReactFlow
  useEffect(() => {
    if (isLoadingRef.current) return;
    setNodes(tf.flow.nodes);
  }, [tf.flow.nodes]);

  useEffect(() => {
    if (isLoadingRef.current) return;
    setEdges(tf.flow.edges);
  }, [tf.flow.edges]);

  // Debounced sync back to store
  const syncTimeoutRef = useRef(null);
  useEffect(() => {
    if (isLoadingRef.current) return;
    
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }
    
    syncTimeoutRef.current = setTimeout(() => {
      tf.setNodes(nodes);
      tf.setEdges(edges);
    }, 100);
    
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [nodes, edges]);

  const onConnect = useCallback((params) => {
    setEdges((eds) => addEdge(params, eds));
  }, [setEdges]);

  const onNodeClick = useCallback((event, node) => {
    tf.setSelection(node.id);
  }, [tf]);

  const onPaneClick = useCallback(() => {
    tf.setSelection(null);
  }, [tf]);

  const handleSave = useCallback(async () => {
    if (!assistantId) {
      tf.appendConsole({ ts: Date.now(), kind: "error", text: "No assistant ID" });
      showNotification('error', 'Cannot save: No assistant ID');
      return;
    }
    
    try {
      setSaveStatus("Saving...");
      const payload = { nodes, edges };
      await saveTextFlow(assistantId, payload);
      
      setSaveStatus("✓ Saved");
      tf.appendConsole({ 
        ts: Date.now(), 
        kind: "info", 
        text: `Flow saved: ${nodes.length} nodes, ${edges.length} edges` 
      });
      showNotification('success', 'Flow saved successfully');
      setTimeout(() => setSaveStatus(""), 2000);
    } catch (e) {
      setSaveStatus("✗ Failed");
      tf.appendConsole({ ts: Date.now(), kind: "error", text: `Save failed: ${e.message}` });
      showNotification('error', `Save failed: ${e.message}`);
      setTimeout(() => setSaveStatus(""), 3000);
    }
  }, [assistantId, nodes, edges, tf]);

  const handleRun = useCallback(() => {
    if (!nodes.length) {
      tf.appendConsole({ ts: Date.now(), kind: "error", text: "No nodes to execute" });
      showNotification('error', 'No nodes to execute');
      return;
    }

    if (!isConnected()) {
      tf.appendConsole({ ts: Date.now(), kind: "error", text: "WebSocket not connected" });
      showNotification('error', 'WebSocket not connected');
      return;
    }

    const entryNode = nodes.find(n => n.type === "start" || n.type === "trigger") || nodes[0];
    
    if (!entryNode) {
      tf.appendConsole({ ts: Date.now(), kind: "error", text: "No entry node found" });
      showNotification('error', 'No entry node found');
      return;
    }

    tf.appendConsole({ 
      ts: Date.now(), 
      kind: "info", 
      text: `Starting execution from: ${entryNode.id}` 
    });
    
    const success = sendMessage(testInput, { assistant_id: assistantId });
    
    if (!success) {
      tf.appendConsole({ ts: Date.now(), kind: "error", text: "Failed to send message" });
      showNotification('error', 'Failed to send message');
    } else {
      showNotification('success', 'Flow execution started');
    }
  }, [nodes, isConnected, sendMessage, testInput, assistantId, tf]);

  const handleExport = () => {
    const flowData = { nodes, edges };
    const blob = new Blob([JSON.stringify(flowData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tf.flow.name.replace(/\s+/g, '_')}_flow.json`;
    a.click();
    URL.revokeObjectURL(url);
    tf.appendConsole({ ts: Date.now(), kind: "info", text: "Flow exported" });
    showNotification('success', 'Flow exported successfully');
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      try {
        const text = await file.text();
        const flowData = JSON.parse(text);
        if (flowData.nodes && flowData.edges) {
          setNodes(flowData.nodes);
          setEdges(flowData.edges);
          tf.setNodes(flowData.nodes);
          tf.setEdges(flowData.edges);
          tf.appendConsole({ ts: Date.now(), kind: "info", text: "Flow imported" });
          showNotification('success', `Flow imported: ${flowData.nodes.length} nodes`);
        } else {
          throw new Error("Invalid flow data format");
        }
      } catch (err) {
        tf.appendConsole({ ts: Date.now(), kind: "error", text: `Import failed: ${err.message}` });
        showNotification('error', `Import failed: ${err.message}`);
      }
    };
    input.click();
  };

  // AI Chatbot handlers
  const handleApplyChatbotFlow = (flow) => {
    if (!flow || !flow.nodes) {
      showNotification('error', 'Invalid flow data from chatbot');
      return;
    }
    console.log("Applying chatbot flow:", flow);
    
    setNodes(flow.nodes);
    setEdges(flow.edges || []);
    tf.setNodes(flow.nodes);
    tf.setEdges(flow.edges || []);
    
    tf.appendConsole({ 
      ts: Date.now(), 
      kind: "info", 
      text: `AI-generated flow applied: ${flow.nodes.length} nodes, ${flow.edges?.length || 0} edges` 
    });
    showNotification('success', `Flow applied: ${flow.nodes.length} nodes`);
  };

  const handlePreviewChatbotFlow = (flow) => {
    console.log("Preview chatbot flow:", flow);
  };

  const handleSelectConnector = (connector) => {
    console.log('Connector selected:', connector);
    // Connector selection is handled in ConfigPanel when HTTP node is configured
  };

  const handleSelectTemplate = (template) => {
    console.log("📥 Loading template:", template.name, template);
    
    if (!template.flow_data) {
      console.error("❌ Template missing flow_data:", template);
      showNotification('error', 'Invalid template: No flow data');
      tf.appendConsole({ 
        ts: Date.now(), 
        kind: "error", 
        text: `Template "${template.name}" has no flow data` 
      });
      return;
    }

    if (!template.flow_data.nodes || !Array.isArray(template.flow_data.nodes)) {
      console.error("❌ Template has invalid nodes:", template.flow_data);
      showNotification('error', 'Invalid template: No nodes found');
      tf.appendConsole({ 
        ts: Date.now(), 
        kind: "error", 
        text: `Template "${template.name}" has invalid nodes` 
      });
      return;
    }

    if (template.flow_data.nodes.length === 0) {
      showNotification('error', 'Template is empty (no nodes)');
      tf.appendConsole({ 
        ts: Date.now(), 
        kind: "error", 
        text: `Template "${template.name}" is empty` 
      });
      return;
    }

    const httpNodesWithoutCreds = template.flow_data.nodes.filter(node => {
      const config = node.data?.config || {};
      return node.type === 'http' && !config.credential_id && !config.connector_id;
    });

    const invalidNodes = template.flow_data.nodes.filter(node => {
      return !node.id || !node.type || !node.position;
    });

    if (invalidNodes.length > 0) {
      console.error("❌ Template has invalid node structure:", invalidNodes);
      showNotification('error', `Template has ${invalidNodes.length} invalid nodes`);
      return;
    }

    try {
      const newNodes = template.flow_data.nodes.map(node => ({
        ...node,
        data: {
          ...node.data,
          config: node.data?.config || {}
        }
      }));

      const newEdges = template.flow_data.edges || [];

      console.log("✅ Loading template nodes:", newNodes.length, "edges:", newEdges.length);

      setNodes(newNodes);
      setEdges(newEdges);
      tf.setNodes(newNodes);
      tf.setEdges(newEdges);
      
      let message = `Template "${template.name}" loaded: ${newNodes.length} nodes`;
      if (httpNodesWithoutCreds.length > 0) {
        message += ` (⚠️ ${httpNodesWithoutCreds.length} HTTP nodes need credentials)`;
      }
      
      tf.appendConsole({ 
        ts: Date.now(), 
        kind: "info", 
        text: message
      });

      showNotification('success', message);

      if (httpNodesWithoutCreds.length > 0) {
        setTimeout(() => {
          showNotification('warning', 
            `⚠️ ${httpNodesWithoutCreds.length} HTTP node(s) need authentication. Configure in node settings.`
          );
        }, 3000);
      }

      setShowTemplateGallery(false);
      
    } catch (err) {
      console.error("❌ Failed to load template:", err);
      showNotification('error', `Failed to load template: ${err.message}`);
      tf.appendConsole({ 
        ts: Date.now(), 
        kind: "error", 
        text: `Failed to load template: ${err.message}` 
      });
    }
  };

  const handleSelectComponent = (component) => {
    const id = `${component.node_type}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const existingNodes = nodes.length;
    const x = 100 + (existingNodes % 3) * 280;
    const y = 100 + Math.floor(existingNodes / 3) * 160;
    
    const newNode = {
      id,
      type: component.node_type,
      position: { x, y },
      data: { 
        label: component.name,
        config: component.config
      }
    };
    
    setNodes([...nodes, newNode]);
    tf.setNodes([...nodes, newNode]);
    tf.setSelection(id);
    
    tf.appendConsole({ 
      ts: Date.now(), 
      kind: "info", 
      text: `Added component: ${component.name}` 
    });

    showNotification('success', `Component "${component.name}" added`);
    
    setShowComponentLibrary(false);
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-slate-950 to-gray-950">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-700 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-sm font-medium text-gray-300">Loading flow...</div>
        </div>
      </div>
    );
  }

  const selectedNode = nodes.find(n => n.id === tf.selection);

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-950 via-slate-950 to-gray-950">
      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
          <div className={`
            px-4 py-3 rounded-lg shadow-2xl border backdrop-blur-sm max-w-md
            ${notification.type === 'success' ? 'bg-emerald-950/90 border-emerald-800/50 text-emerald-100' : ''}
            ${notification.type === 'error' ? 'bg-red-950/90 border-red-800/50 text-red-100' : ''}
            ${notification.type === 'warning' ? 'bg-yellow-950/90 border-yellow-800/50 text-yellow-100' : ''}
          `}>
            <div className="flex items-start gap-3">
              {notification.type === 'success' && <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />}
              {notification.type === 'error' && <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />}
              {notification.type === 'warning' && <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />}
              <div className="flex-1">
                <div className="text-sm font-medium">{notification.message}</div>
              </div>
              <button 
                onClick={() => setNotification(null)}
                className="text-current hover:opacity-70 transition-opacity"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Bar */}
      <div className="h-16 bg-gray-900/80 backdrop-blur-xl border-b border-gray-700/50 px-6 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">{tf.flow.name}</h1>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isConnected() ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse`} />
                <span className="text-xs text-gray-400">{isConnected() ? 'Connected' : 'Disconnected'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowTemplateGallery(true)}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 flex items-center gap-2"
            title="Browse Templates"
          >
            <Sparkles className="w-4 h-4" />
            Templates
          </button>

          <button
            onClick={() => setShowConnectorPanel(true)}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 flex items-center gap-2"
            title="API Connectors"
          >
            <Plug className="w-4 h-4" />
            Connectors
          </button>

          <button
            onClick={() => setShowComponentLibrary(true)}
            className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 flex items-center gap-2"
            title="Component Library"
          >
            <Package className="w-4 h-4" />
            Components
          </button>

          <button
            onClick={() => {
              setShowChatbot(!showChatbot);
              setChatbotMinimized(false);
            }}
            className={`px-4 py-2 ${
              showChatbot 
                ? 'bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700' 
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
            } text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 flex items-center gap-2`}
            title="AI Flow Builder"
          >
            <Bot className="w-4 h-4" />
            {showChatbot ? 'Hide AI' : 'AI Builder'}
          </button>

          <button
            onClick={() => setShowTriggerManager(true)}
            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/30 flex items-center gap-2"
            title="Manage Triggers & Credentials"
          >
            <Key className="w-4 h-4" />
            <Activity className="w-4 h-4" />
          </button>

          <input
            type="text"
            value={testInput}
            onChange={(e) => setTestInput(e.target.value)}
            placeholder="Test input..."
            className="w-64 px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
          <button
            onClick={handleRun}
            disabled={!nodes.length || !isConnected()}
            className="px-5 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            Run
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-5 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-sm font-semibold border border-gray-700 transition-all shadow-lg flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saveStatus || "Save"}
          </button>
          <button
            onClick={handleExport}
            className="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-xl border border-gray-700 transition-all shadow-lg"
            title="Export flow"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={handleImport}
            className="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-xl border border-gray-700 transition-all shadow-lg"
            title="Import flow"
          >
            <Upload className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-72 flex-shrink-0">
          <NodeSidebar />
        </div>

        {/* Canvas Area */}
        <div className="flex-1 p-4" style={{ height: `calc(100vh - 64px - ${consoleHeight}px)` }}>
          <div className="h-full rounded-2xl bg-gradient-to-br from-gray-900 to-slate-900 border border-gray-700/50 shadow-2xl overflow-hidden relative">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={onNodeClick}
              onPaneClick={onPaneClick}
              nodeTypes={nodeTypes}
              fitView
              defaultEdgeOptions={{ 
                type: "smoothstep",
                animated: true,
                style: { stroke: '#6366f1', strokeWidth: 2 }
              }}
            >
              <Background 
                gap={24} 
                size={1} 
                color="#4b5563"
                style={{ opacity: 0.3 }}
              />
              <MiniMap 
                pannable 
                zoomable
                className="!bg-gray-800/80 !border-gray-700 !rounded-lg !shadow-lg"
                nodeColor={(node) => {
                  const colorMap = {
                    start: '#10b981',
                    trigger: '#3b82f6',
                    http: '#8b5cf6',
                    llm: '#ec4899',
                    transform: '#f59e0b',
                    conditional: '#6366f1',
                    parallel: '#d946ef',
                    wait: '#6b7280',
                    subflow: '#06b6d4',
                  };
                  return colorMap[node.type] || '#6b7280';
                }}
              />
              <Controls 
                className="!bg-gray-800/80 !border-gray-700 !rounded-lg !shadow-lg [&_button]:!bg-gray-700 [&_button]:!border-gray-600 [&_button:hover]:!bg-gray-600 [&_button]:!text-white"
              />
            </ReactFlow>
            
            {nodes.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-indigo-500/25">
                    <Zap className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Build Your Flow</h3>
                  <p className="text-sm text-gray-400 max-w-md mb-4">
                    Add nodes from the sidebar to create your automation workflow.
                    Connect them to define your flow logic.
                  </p>
                  <div className="flex gap-2 justify-center pointer-events-auto">
                    <button
                      onClick={() => {
                        setShowChatbot(true);
                        setChatbotMinimized(false);
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg text-sm font-medium transition-all flex items-center gap-2 shadow-lg"
                    >
                      <Bot className="w-4 h-4" />
                      Build with AI
                    </button>
                    <button
                      onClick={() => setShowTemplateGallery(true)}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-all flex items-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      Browse Templates
                    </button>
                    <button
                      onClick={() => setShowConnectorPanel(true)}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-all flex items-center gap-2"
                    >
                      <Plug className="w-4 h-4" />
                      Connectors
                    </button>
                    <button
                      onClick={() => setShowComponentLibrary(true)}
                      className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium transition-all flex items-center gap-2"
                    >
                      <Package className="w-4 h-4" />
                      Components
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* AI Chatbot Panel - Right Side */}
        {showChatbot && !chatbotMinimized && (
          <div className="w-[420px] flex-shrink-0 p-4 pl-0">
            <FlowChatbotPanel
              currentFlow={{ nodes, edges }}
              onApplyFlow={handleApplyChatbotFlow}
              onPreviewFlow={handlePreviewChatbotFlow}
              sessionId={chatSessionId}
              isMinimized={chatbotMinimized}
              onToggleMinimize={() => setChatbotMinimized(!chatbotMinimized)}
            />
          </div>
        )}

        {/* Minimized Chatbot Button */}
        {showChatbot && chatbotMinimized && (
          <FlowChatbotPanel
            currentFlow={{ nodes, edges }}
            onApplyFlow={handleApplyChatbotFlow}
            onPreviewFlow={handlePreviewChatbotFlow}
            sessionId={chatSessionId}
            isMinimized={chatbotMinimized}
            onToggleMinimize={() => setChatbotMinimized(!chatbotMinimized)}
          />
        )}
      </div>

      {/* Resizable Console Panel */}
      <div className="relative px-4 pb-4" style={{ height: consoleHeight }}>
        {/* Resize Handle */}
        <div
          className="absolute top-0 left-0 right-0 h-2 cursor-ns-resize hover:bg-indigo-500/20 transition-colors group z-10"
          onMouseDown={handleResizeStart}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-1 bg-gray-700 rounded-full group-hover:bg-indigo-500 transition-colors flex items-center justify-center">
            <GripHorizontal className="w-4 h-4 text-gray-600 group-hover:text-indigo-400" />
          </div>
        </div>
        <div className="h-full pt-2">
          <ConsolePanel />
        </div>
      </div>

      {/* Config Panel Modal (Centered with Blur) */}
      {selectedNode && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
          {/* Backdrop with blur */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => tf.setSelection(null)}
          />
          
          {/* Config Panel - Fixed height with proper overflow */}
          <div className="relative z-50 w-full max-w-2xl h-[90vh] max-h-[90vh]">
            <ConfigPanel assistantId={assistantId} />
          </div>
        </div>
      )}

      {/* Other Modals */}
      {showTriggerManager && (
        <TriggerManager 
          assistantId={assistantId} 
          onClose={() => setShowTriggerManager(false)} 
        />
      )}

      {showTemplateGallery && (
        <TemplateGallery
          assistantId={assistantId}
          onSelectTemplate={handleSelectTemplate}
          onClose={() => setShowTemplateGallery(false)}
          onGetCurrentFlow={() => ({ nodes, edges })}
        />
      )}

      {showComponentLibrary && (
        <ComponentLibraryPanel
          assistantId={assistantId}
          nodeType={selectedNodeType}
          onSelectComponent={handleSelectComponent}
          onClose={() => setShowComponentLibrary(false)}
        />
      )}

      {showConnectorPanel && (
        <ConnectorPanel
          assistantId={assistantId}
          onSelectConnector={handleSelectConnector}
          onClose={() => setShowConnectorPanel(false)}
        />
      )}
    </div>
  );
}