// components/textflow/components/ComponentLibraryPanel.js - FULLY FIXED
import React, { useState, useEffect } from "react";
import { Copy, Trash2, Plus, X, Star, Code, Package, Check, AlertCircle } from "lucide-react";
import Editor from "@monaco-editor/react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://esapdev.xyz:7000/agentbuilder/api';

function ComponentCard({ component, onUse, onDelete }) {
  // SAFETY CHECK: Ensure component has required fields
  if (!component || !component.component_id) {
    console.error("Invalid component data:", component);
    return null;
  }

  const nodeTypeColors = {
    http: "from-violet-400 to-purple-500",
    llm: "from-pink-400 to-rose-500",
    transform: "from-amber-400 to-orange-500",
    conditional: "from-indigo-400 to-blue-500",
    trigger: "from-blue-400 to-cyan-500",
  };

  const color = nodeTypeColors[component.node_type] || "from-gray-400 to-gray-500";

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 hover:border-indigo-600 transition-all hover:shadow-lg hover:shadow-indigo-500/10 overflow-hidden group">
      <div className="p-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0`}>
            <Code className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-100 truncate">{component.name || "Unnamed"}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                {component.node_type || "unknown"}
              </span>
              {component.category && (
                <span className="text-xs px-2 py-0.5 bg-gray-900 text-gray-400 rounded">
                  {component.category}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => onDelete(component.component_id)}
            className="p-1.5 hover:bg-red-600/20 text-gray-500 hover:text-red-400 rounded transition-all opacity-0 group-hover:opacity-100"
            title="Delete component"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {component.description && (
          <p className="text-xs text-gray-500 line-clamp-2">{component.description}</p>
        )}

        {component.tags && Array.isArray(component.tags) && component.tags.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {component.tags.slice(0, 2).map((tag, idx) => (
              <span
                key={`${component.component_id}-tag-${idx}`}
                className="text-[10px] px-2 py-0.5 bg-indigo-900/30 text-indigo-300 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-gray-700">
          <div className="flex items-center gap-2 text-[10px] text-gray-600">
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
              {(component.rating || 0).toFixed(1)}
            </span>
            <span>·</span>
            <span>{component.usage_count || 0} uses</span>
          </div>
          <button
            onClick={() => onUse(component)}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium transition-all flex items-center gap-1"
          >
            <Copy className="w-3 h-3" />
            Use
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ComponentLibraryPanel({ assistantId, nodeType, onSelectComponent, onClose }) {
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [filterByType, setFilterByType] = useState(nodeType || "all");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [renderError, setRenderError] = useState(null);

  const [newComponent, setNewComponent] = useState({
    name: "",
    description: "",
    node_type: nodeType || "http",
    category: "",
    tags: [],
    config: {},
    is_public: false
  });

  const nodeTypes = ["http", "llm", "transform", "conditional", "trigger"];

  useEffect(() => {
    try {
      loadComponents();
    } catch (err) {
      console.error("Error in useEffect:", err);
      setRenderError(err.message);
    }
  }, [filterByType]);

  const loadComponents = async () => {
    try {
      setLoading(true);
      setError("");

      // BUILD URL AS STRING (avoid URL object issues with Next.js fetch wrapper)
      let urlString = `${API_BASE}/templates/component/list?limit=50&assistant_id=${encodeURIComponent(assistantId)}`;
      
      if (filterByType !== "all") {
        urlString += `&node_type=${encodeURIComponent(filterByType)}`;
      }

      console.log("Loading components from:", urlString);

      const response = await fetch(urlString, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Loaded components:", data);
      
      // SAFETY: Validate data structure
      if (!Array.isArray(data)) {
        console.error("Invalid response - expected array, got:", typeof data);
        setComponents([]);
        return;
      }
      
      // CRITICAL FIX: Validate each component before setting state
      const validComponents = data.map(comp => {
        // Ensure tags is always an array
        if (!Array.isArray(comp.tags)) {
          console.warn(`Component ${comp.component_id} has invalid tags:`, comp.tags);
          comp.tags = [];
        }
        
        // Ensure config is always an object
        if (typeof comp.config !== 'object' || comp.config === null) {
          console.warn(`Component ${comp.component_id} has invalid config:`, comp.config);
          comp.config = {};
        }
        
        // Ensure required string fields
        comp.name = comp.name || "Unnamed";
        comp.node_type = comp.node_type || "unknown";
        comp.rating = comp.rating || 0;
        comp.usage_count = comp.usage_count || 0;
        
        return comp;
      });
      
      console.log("Validated components:", validComponents);
      setComponents(validComponents);
    } catch (err) {
      setError(err.message);
      console.error("Failed to load components:", err);
      setComponents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateComponent = async () => {
    if (!newComponent.name.trim()) {
      setError("Component name is required");
      return;
    }

    // CRITICAL FIX: Validate config before sending
    let configToSave = newComponent.config;
    try {
      if (typeof configToSave === 'string') {
        configToSave = JSON.parse(configToSave);
      }
      if (!configToSave || typeof configToSave !== 'object') {
        configToSave = {};
      }
    } catch (e) {
      setError("Invalid JSON in configuration");
      return;
    }

    try {
      const urlString = `${API_BASE}/templates/component/create?assistant_id=${encodeURIComponent(assistantId)}`;
      
      const response = await fetch(urlString, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newComponent,
          config: configToSave
        })
      });

      if (!response.ok) throw new Error("Failed to create component");

      const data = await response.json();
      
      // Show warning if credentials were sanitized
      if (data.sanitized) {
        setSuccess("Component created! (Credentials removed from public component)");
      } else {
        setSuccess("Component created successfully!");
      }
      
      setShowCreateModal(false);
      setNewComponent({
        name: "",
        description: "",
        node_type: nodeType || "http",
        category: "",
        tags: [],
        config: {},
        is_public: false
      });
      loadComponents();
      
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteComponent = async (componentId) => {
    if (!window.confirm("Delete this component? This cannot be undone.")) return;

    try {
      const urlString = `${API_BASE}/templates/component/${componentId}?assistant_id=${encodeURIComponent(assistantId)}`;
      
      const response = await fetch(urlString, { 
        method: "DELETE" 
      });

      if (!response.ok) throw new Error("Failed to delete component");

      setSuccess("Component deleted");
      loadComponents();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 to-slate-900 rounded-2xl border border-gray-700/50 shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-700/50 flex items-center justify-between bg-gray-800/50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Component Library</h2>
              <p className="text-xs text-gray-400">Reusable node configurations</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Component
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="px-6 py-3 bg-gray-800/30 border-b border-gray-700/50 flex items-center gap-3">
          <span className="text-sm text-gray-400">Filter:</span>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilterByType("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterByType === "all"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              All
            </button>
            {nodeTypes.map(type => (
              <button
                key={type}
                onClick={() => setFilterByType(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                  filterByType === type
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Alerts */}
        {renderError && (
          <div className="mx-6 mt-4 bg-red-950/30 border border-red-800/50 rounded-lg p-3">
            <div className="text-sm font-semibold text-red-300 mb-1">Render Error</div>
            <div className="text-xs text-red-400 font-mono">{renderError}</div>
            <button 
              onClick={() => setRenderError(null)}
              className="mt-2 text-xs text-red-300 hover:text-red-100"
            >
              Dismiss
            </button>
          </div>
        )}

        {error && (
          <div className="mx-6 mt-4 bg-red-950/30 border border-red-800/50 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="text-sm text-red-300">{error}</span>
            </div>
            <button onClick={() => setError("")} className="text-red-400 hover:text-red-300">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {success && (
          <div className="mx-6 mt-4 bg-emerald-950/30 border border-emerald-800/50 rounded-lg p-3 flex items-start gap-2">
            <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-emerald-300">{success}</span>
          </div>
        )}

        {/* Component Grid */}
        <div className="flex-1 overflow-auto px-6 py-4">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-gray-700 border-t-indigo-500 rounded-full animate-spin mx-auto mb-2"></div>
                <div className="text-sm text-gray-400">Loading components...</div>
              </div>
            </div>
          ) : components.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Package className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                <div className="text-lg font-medium text-gray-400 mb-2">No components yet</div>
                <p className="text-sm text-gray-600 mb-4">Create reusable node configurations</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-all flex items-center gap-2 mx-auto"
                >
                  <Plus className="w-4 h-4" />
                  Create Component
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {components.map((component, index) => {
                // SAFETY: Skip invalid components
                if (!component || !component.component_id) {
                  console.warn(`Skipping invalid component at index ${index}:`, component);
                  return null;
                }
                
                try {
                  return (
                    <ComponentCard
                      key={component.component_id}
                      component={component}
                      onUse={onSelectComponent}
                      onDelete={handleDeleteComponent}
                    />
                  );
                } catch (cardError) {
                  console.error(`Error rendering component ${component.component_id}:`, cardError);
                  setRenderError(`Component render error: ${cardError.message}`);
                  return (
                    <div key={component.component_id} className="bg-red-900/20 border border-red-800 rounded-lg p-3">
                      <div className="text-xs text-red-400">Error rendering component</div>
                      <div className="text-xs text-red-500 font-mono mt-1">{cardError.message}</div>
                    </div>
                  );
                }
              })}
            </div>
          )}
        </div>

        {/* Create Component Modal */}
        {showCreateModal && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-10 p-4">
            <div className="bg-gray-900 rounded-xl border border-gray-700 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto p-6 space-y-4">
              <div className="flex items-center justify-between sticky top-0 bg-gray-900 pb-4 border-b border-gray-700">
                <h3 className="text-lg font-bold text-white">Create Component</h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setError("");
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="text-sm font-medium text-gray-300 block mb-2">
                    Component Name *
                  </label>
                  <input
                    type="text"
                    value={newComponent.name}
                    onChange={(e) => setNewComponent({...newComponent, name: e.target.value})}
                    placeholder="My HTTP Request"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-indigo-500 transition-colors"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="text-sm font-medium text-gray-300 block mb-2">
                    Description
                  </label>
                  <textarea
                    value={newComponent.description}
                    onChange={(e) => setNewComponent({...newComponent, description: e.target.value})}
                    placeholder="Describe what this component does..."
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-indigo-500 transition-colors resize-none"
                  />
                </div>

                {/* Node Type */}
                <div>
                  <label className="text-sm font-medium text-gray-300 block mb-2">
                    Node Type *
                  </label>
                  <select
                    value={newComponent.node_type}
                    onChange={(e) => setNewComponent({...newComponent, node_type: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-indigo-500 transition-colors"
                  >
                    {nodeTypes.map(type => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Category */}
                <div>
                  <label className="text-sm font-medium text-gray-300 block mb-2">
                    Category
                  </label>
                  <input
                    type="text"
                    value={newComponent.category}
                    onChange={(e) => setNewComponent({...newComponent, category: e.target.value})}
                    placeholder="api, database, notification..."
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-indigo-500 transition-colors"
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="text-sm font-medium text-gray-300 block mb-2">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={
                      Array.isArray(newComponent.tags) 
                        ? newComponent.tags.join(", ") 
                        : (typeof newComponent.tags === 'string' ? newComponent.tags : "")
                    }
                    onChange={(e) => {
                      const value = e.target.value || "";
                      const tagsArray = value.split(",").map(t => t.trim()).filter(Boolean);
                      setNewComponent({
                        ...newComponent, 
                        tags: tagsArray
                      });
                    }}
                    placeholder="rest, json, webhook"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-indigo-500 transition-colors"
                  />
                </div>

                {/* Configuration JSON */}
                <div>
                  <label className="text-sm font-medium text-gray-300 block mb-2">
                    Configuration (JSON) *
                  </label>
                  <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                    <Editor
                      height="200px"
                      defaultLanguage="json"
                      value={JSON.stringify(newComponent.config || {}, null, 2)}
                      onChange={(v) => {
                        try {
                          const valueToUse = (v === undefined || v === null) ? "{}" : v;
                          const parsed = JSON.parse(valueToUse);
                          setNewComponent({...newComponent, config: parsed});
                          setError("");
                        } catch (e) {
                          console.log("Invalid JSON, ignoring:", e.message);
                        }
                      }}
                      theme="vs-dark"
                      options={{ 
                        minimap: { enabled: false }, 
                        fontSize: 12,
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                      }}
                      onMount={(editor, monaco) => {
                        console.log("Monaco Editor mounted successfully");
                      }}
                      onValidate={(markers) => {
                        if (markers.length > 0) {
                          console.log("Monaco validation markers:", markers);
                        }
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Example: {`{"method": "POST", "url": "https://api.example.com", "headers": {}}`}
                  </p>
                </div>

                {/* Public Toggle with Warning */}
                <div className="bg-yellow-950/20 border border-yellow-800/50 rounded-lg p-3">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newComponent.is_public}
                      onChange={(e) => setNewComponent({...newComponent, is_public: e.target.checked})}
                      className="rounded text-indigo-500 focus:ring-indigo-500 mt-0.5"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-300 block">Make Public</span>
                      <p className="text-xs text-yellow-400 mt-1">
                        Warning: Public components will have all credential IDs and sensitive data removed automatically
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-700">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setError("");
                  }}
                  className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateComponent}
                  disabled={!newComponent.name.trim()}
                  className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create Component
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}