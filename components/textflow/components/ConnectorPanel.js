// components/textflow/components/ConnectorPanel.js - Universal Connector Generator UI
import React, { useState, useEffect, useRef } from "react";
import { 
  Plug, Plus, Code, Star, TrendingUp, Search, X, 
  CheckCircle, AlertCircle, Zap, Clock, Activity, Globe, Eye, Trash2
} from "lucide-react";
import Editor from "@monaco-editor/react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://esapdev.xyz:7000/agentbuilder/api';

/** Utility: make readable error messages from fetch responses */
async function readError(res) {
  try {
    const text = await res.text();
    try {
      const json = JSON.parse(text);
      return json.detail || json.message || text || `${res.status} ${res.statusText}`;
    } catch {
      return text || `${res.status} ${res.statusText}`;
    }
  } catch {
    return `${res.status} ${res.statusText}`;
  }
}

// ============================================================================
// CONNECTOR CARD COMPONENT
// ============================================================================
function ConnectorCard({
  connector,
  onSelect,
  onDelete,
  onValidate,
  onTogglePublic,
  onInstall,       // install public connector for this assistant
  onUninstall,     // remove installed connector for this assistant
  currentAssistantId,
  context = 'discover', // 'discover' | 'my-connectors'
  showActions = true
}) {
  const [showDetails, setShowDetails] = useState(false);
  const isOwner = connector.owner_id === currentAssistantId;

  const getHealthColor = (status) => {
    switch (status) {
      case 'healthy': return 'text-emerald-400 bg-emerald-950/30 border-emerald-800/50';
      case 'degraded': return 'text-yellow-400 bg-yellow-950/30 border-yellow-800/50';
      case 'failing': return 'text-red-400 bg-red-950/30 border-red-800/50';
      default: return 'text-gray-400 bg-gray-950/30 border-gray-800/50';
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 hover:border-indigo-600 transition-all hover:shadow-lg hover:shadow-indigo-500/10 overflow-hidden group">
      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            <Plug className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-100 truncate">{connector.name}</h3>
            <p className="text-xs text-gray-500 truncate">{connector.slug}</p>
          </div>
          {showActions && isOwner && (
            <button
              onClick={() => onDelete && onDelete(connector.connector_id)}
              className="p-1.5 hover:bg-red-600/20 text-gray-500 hover:text-red-400 rounded transition-all opacity-0 group-hover:opacity-100"
              title="Delete (owner only)"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Description */}
        {connector.description && (
          <p className="text-xs text-gray-500 line-clamp-2">{connector.description}</p>
        )}

        {/* Metadata */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="px-2 py-1 bg-gray-900 rounded text-gray-400 capitalize">
            {connector.category}
          </span>
          <span className={`px-2 py-1 rounded border ${getHealthColor(connector.health_status)}`}>
            {connector.health_status}
          </span>
          {connector.validated && (
            <span className="flex items-center gap-1 text-emerald-400">
              <CheckCircle className="w-3 h-3" />
              Validated
            </span>
          )}
          {connector.is_public && (
            <span className="flex items-center gap-1 text-indigo-400">
              <Globe className="w-3 h-3" />
              Public
            </span>
          )}
          {isOwner && (
            <span className="flex items-center gap-1 text-purple-400">
              Owner
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-gray-600">
          <span className="flex items-center gap-1">
            <Star className="w-3 h-3 text-yellow-500 fill-current" />
            {connector.rating?.toFixed(1) || "0.0"}
          </span>
          <span>{connector.usage_count || 0} uses</span>
          <span>{connector.spec?.endpoints?.length || 0} endpoints</span>
          {connector.avg_response_time && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {connector.avg_response_time.toFixed(0)}ms
            </span>
          )}
        </div>

        {/* Tags */}
        {connector.tags && connector.tags.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap">
            {connector.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 bg-indigo-900/30 text-indigo-300 rounded-full text-[10px]"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t border-gray-700">
          {/* Primary call-to-action */}
          {context === 'discover' && !isOwner ? (
            <button
              onClick={() => onInstall && onInstall(connector.connector_id)}
              className="flex-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1"
              title="Add to My Connectors"
            >
              <Plus className="w-3 h-3" />
              Add to My Connectors
            </button>
          ) : (
            <button
              onClick={() => onSelect && onSelect(connector)}
              className="flex-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1"
            >
              <Zap className="w-3 h-3" />
              Use Connector
            </button>
          )}

          {/* Secondary: details */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-xs transition-all"
          >
            <Eye className="w-3 h-3" />
          </button>

          {/* Validate available for both */}
          {showActions && onValidate && (
            <button
              onClick={() => onValidate(connector.connector_id)}
              className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-xs transition-all"
              title="Validate connector"
            >
              <Activity className="w-3 h-3" />
            </button>
          )}

          {/* Owner-only: publish/unpublish */}
          {showActions && isOwner && onTogglePublic && (
            <button
              onClick={() => onTogglePublic(connector.connector_id, !connector.is_public)}
              className={`px-3 py-1.5 rounded-lg text-xs transition-all ${connector.is_public ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
              title={connector.is_public ? 'Unpublish (hide from Discover)' : 'Publish (show in Discover)'}
            >
              <Globe className="w-3 h-3 inline mr-1" />
              {connector.is_public ? 'Unpublish' : 'Publish'}
            </button>
          )}

          {/* Non-owner in My Connectors: Remove (uninstall) */}
          {context === 'my-connectors' && !isOwner && onUninstall && (
            <button
              onClick={() => onUninstall(connector.connector_id)}
              className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg text-xs transition-all"
              title="Remove from My Connectors"
            >
              <Trash2 className="w-3 h-3 inline mr-1" />
              Remove
            </button>
          )}
        </div>

        {/* Expandable Details */}
        {showDetails && (
          <div className="pt-3 border-t border-gray-700 space-y-2">
            <div className="text-xs space-y-1">
              <div className="flex justify-between text-gray-400">
                <span>Base URL:</span>
                <span className="font-mono text-gray-300 truncate ml-2">
                  {connector.spec?.base_url}
                </span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Auth Type:</span>
                <span className="font-mono text-gray-300">
                  {connector.spec?.auth?.type || 'none'}
                </span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Version:</span>
                <span className="font-mono text-gray-300">{connector.version}</span>
              </div>
              {connector.success_rate > 0 && (
                <div className="flex justify-between text-gray-400">
                  <span>Success Rate:</span>
                  <span className="font-mono text-emerald-400">
                    {connector.success_rate.toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// CREATE CONNECTOR MODAL
// ============================================================================
function CreateConnectorModal({ onClose, onSubmit, assistantId }) {
  const [mode, setMode] = useState('trace'); // 'trace', 'openapi'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'general',
    tags: '',
    trace_data: null,
    openapi_spec: null
  });

  const [traceJson, setTraceJson] = useState('{\n  "requests": []\n}');
  const [openapiJson, setOpenapiJson] = useState('{\n  "openapi": "3.0.0"\n}');
  const [makePublic, setMakePublic] = useState(false); // default private

  const handleSubmit = async () => {
    setError('');
    if (!formData.name.trim()) {
      setError('Connector name is required');
      return;
    }

    try {
      setLoading(true);
      const tags = formData.tags.split(',').map(t => t.trim()).filter(Boolean);
      
      let endpoint = '';
      let payload = {
        name: formData.name,
        description: formData.description || null,
        category: formData.category,
        tags
      };

      if (mode === 'trace') {
        endpoint = `${API_BASE}/textflow/connectors/build/trace?owner_id=${assistantId}`;
        payload.trace_data = JSON.parse(traceJson);
      } else {
        endpoint = `${API_BASE}/textflow/connectors/build/openapi?owner_id=${assistantId}`;
        payload.openapi_spec = JSON.parse(openapiJson);
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error(await readError(response));

      const result = await response.json();

      if (makePublic && result?.connector_id) {
        try {
          const pubRes = await fetch(
            `${API_BASE}/textflow/connectors/${result.connector_id}?owner_id=${assistantId}`,
            {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ is_public: true, change_summary: 'Publishing on create' })
            }
          );
          if (!pubRes.ok) console.warn('Publish failed:', await readError(pubRes));
        } catch (_) {}
      }

      onSubmit(result);
      onClose();
    } catch (err) {
      setError(err.message);
      console.error('Failed to create connector:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl border border-gray-700 shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-auto">
        <div className="p-6 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between sticky top-0 bg-gray-900 pb-4 border-b border-gray-700">
            <div>
              <h3 className="text-lg font-bold text-white">Create Connector</h3>
              <p className="text-xs text-gray-400">Generate API connector from trace or OpenAPI spec</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="bg-red-950/30 border border-red-800/50 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-red-300">{error}</span>
            </div>
          )}

          {/* Mode Selector */}
          <div className="flex gap-2 bg-gray-800/30 rounded-lg p-1">
            <button
              onClick={() => setMode('trace')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all ${
                mode === 'trace' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              From Trace
            </button>
            <button
              onClick={() => setMode('openapi')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all ${
                mode === 'openapi' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              From OpenAPI
            </button>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="text-sm font-medium text-gray-300 block mb-2">Connector Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Slack API"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-indigo-500 transition-colors"
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-medium text-gray-300 block mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Send messages to Slack channels"
                rows={2}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-indigo-500 transition-colors resize-none"
              />
            </div>

            {/* Category */}
            <div>
              <label className="text-sm font-medium text-gray-300 block mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-indigo-500 transition-colors"
              >
                <option value="general">General</option>
                <option value="communication">Communication</option>
                <option value="productivity">Productivity</option>
                <option value="database">Database</option>
                <option value="crm">CRM</option>
                <option value="analytics">Analytics</option>
              </select>
            </div>

            {/* Tags */}
            <div>
              <label className="text-sm font-medium text-gray-300 block mb-2">Tags (comma-separated)</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({...formData, tags: e.target.value})}
                placeholder="slack, messaging, api"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-indigo-500 transition-colors"
              />
            </div>

            {/* Trace/OpenAPI Input */}
            <div>
              <label className="text-sm font-medium text-gray-300 block mb-2">
                {mode === 'trace' ? 'API Trace JSON *' : 'OpenAPI Spec JSON *'}
              </label>
              <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                <Editor
                  height="300px"
                  defaultLanguage="json"
                  value={mode === 'trace' ? traceJson : openapiJson}
                  onChange={(v) => {
                    if (mode === 'trace') {
                      setTraceJson(v || '{}');
                    } else {
                      setOpenapiJson(v || '{}');
                    }
                  }}
                  theme="vs-dark"
                  options={{ 
                    minimap: { enabled: false }, 
                    fontSize: 12,
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                  }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {mode === 'trace' 
                  ? 'Paste captured API requests with responses. Use browser dev tools or recording extension.'
                  : 'Paste OpenAPI 3.0 specification JSON.'
                }
              </p>
            </div>

            {/* Visibility */}
            <div className="flex items-center gap-2">
              <input
                id="makePublic"
                type="checkbox"
                checked={makePublic}
                onChange={(e) => setMakePublic(e.target.checked)}
                className="h-4 w-4 text-indigo-600 bg-gray-800 border-gray-700 rounded"
              />
              <label htmlFor="makePublic" className="text-sm text-gray-300">
                Make public (show in Discover so others can find & use it)
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-700">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !formData.name.trim()}
              className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Create Connector
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN CONNECTOR PANEL
// ============================================================================
export default function ConnectorPanel({ assistantId, onSelectConnector, onClose }) {
  const [connectors, setConnectors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('discover'); // 'discover', 'my-connectors'
  const searchTimer = useRef(null);

  const categories = ['all', 'communication', 'productivity', 'database', 'crm', 'analytics'];

  useEffect(() => {
    loadConnectors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, activeTab]);

  const fetchList = async (params) => {
    const res = await fetch(`${API_BASE}/textflow/connectors/list?${params}`);
    if (!res.ok) throw new Error(await readError(res));
    return res.json();
  };

  const loadConnectors = async () => {
    try {
      setLoading(true);
      setError('');

      if (activeTab === 'discover') {
        // Public feed only - never includes my own connectors
        const params = new URLSearchParams();
        params.append('limit', '50');
        params.append('public_only', 'true');
        if (selectedCategory !== 'all') params.append('category', selectedCategory);
        if (searchQuery.trim()) params.append('search', searchQuery);
        const data = await fetchList(params);
        setConnectors(Array.isArray(data) ? data : []);
        return;
      }

      // --- MY CONNECTORS TAB ---
      // Fetch owned + installed separately and merge
      const ownedParams = new URLSearchParams();
      ownedParams.append('limit', '100');
      ownedParams.append('owner_id', assistantId);
      if (selectedCategory !== 'all') ownedParams.append('category', selectedCategory);
      if (searchQuery.trim()) ownedParams.append('search', searchQuery);

      const installedParams = new URLSearchParams();
      installedParams.append('limit', '100');
      installedParams.append('installed_for', assistantId);
      if (selectedCategory !== 'all') installedParams.append('category', selectedCategory);
      if (searchQuery.trim()) installedParams.append('search', searchQuery);

      // Fetch both owned and installed
      let owned = [];
      let installed = [];
      
      try {
        owned = await fetchList(ownedParams);
      } catch (err) {
        console.error('Failed to fetch owned connectors:', err);
        owned = [];
      }

      try {
        installed = await fetchList(installedParams);
      } catch (err) {
        console.error('Failed to fetch installed connectors:', err);
        installed = [];
      }

      // Merge and deduplicate by connector_id
      const map = new Map();
      for (const c of [...(Array.isArray(owned) ? owned : []), ...(Array.isArray(installed) ? installed : [])]) {
        map.set(c.connector_id, c);
      }
      const merged = Array.from(map.values());
      
      // Sort by usage and rating
      merged.sort((a, b) => {
        const aScore = (a.usage_count || 0) + (a.rating || 0);
        const bScore = (b.usage_count || 0) + (b.rating || 0);
        return bScore - aScore;
      });
      
      setConnectors(merged);
    } catch (err) {
      setError(err.message);
      console.error('Failed to load connectors:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    // Debounce search
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      loadConnectors();
    }, 400);
  };

  const handleDeleteConnector = async (connectorId) => {
    if (!window.confirm('Delete this connector? This cannot be undone. It will be removed from all users who installed it.')) return;

    try {
      const response = await fetch(
        `${API_BASE}/textflow/connectors/${connectorId}?owner_id=${assistantId}`,
        { method: 'DELETE' }
      );
      if (!response.ok) throw new Error(await readError(response));

      setSuccess('Connector deleted');
      setTimeout(() => setSuccess(''), 2000);
      loadConnectors();
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleValidateConnector = async (connectorId) => {
    try {
      const response = await fetch(
        `${API_BASE}/textflow/connectors/${connectorId}/validate`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        }
      );
      if (!response.ok) throw new Error(await readError(response));

      const result = await response.json();
      if (result.valid) {
        setSuccess('Connector validated successfully');
      } else {
        setError(`Validation failed: ${result.error || 'unknown error'}`);
      }
      setTimeout(() => {
        setSuccess('');
        setError('');
      }, 3000);

      loadConnectors();
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleTogglePublic = async (connectorId, nextPublic) => {
    try {
      const res = await fetch(
        `${API_BASE}/textflow/connectors/${connectorId}?owner_id=${assistantId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            is_public: nextPublic, 
            change_summary: nextPublic ? 'Publishing connector' : 'Unpublishing connector' 
          })
        }
      );
      if (!res.ok) throw new Error(await readError(res));
      setSuccess(nextPublic ? 'Published! Now visible in Discover.' : 'Unpublished. No longer visible in Discover.');
      setTimeout(() => setSuccess(''), 3000);
      loadConnectors();
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    }
  };

  // Install a public connector for this assistant
  const handleInstall = async (connectorId) => {
    try {
      const res = await fetch(
        `${API_BASE}/textflow/connectors/${connectorId}/install?owner_id=${assistantId}`,
        { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify({}) 
        }
      );
      if (!res.ok) throw new Error(await readError(res));
      
      setSuccess('Added to My Connectors! Switch to "My Connectors" tab to use it.');
      setTimeout(() => setSuccess(''), 3000);
      
      // Optionally auto-switch to my-connectors tab
      // setActiveTab('my-connectors');
      // loadConnectors();
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    }
  };

  // Remove an installed connector (non-owner)
  const handleUninstall = async (connectorId) => {
    if (!window.confirm('Remove this connector from My Connectors? You can add it again from Discover.')) return;
    
    try {
      const res = await fetch(
        `${API_BASE}/textflow/connectors/${connectorId}/install?owner_id=${assistantId}`,
        { method: 'DELETE' }
      );
      if (!res.ok) {
        const errMsg = await readError(res);
        // Treat "not installed" as success - might have been removed already
        if (!errMsg.toLowerCase().includes('not installed')) {
          throw new Error(errMsg);
        }
      }
      
      setSuccess('Removed from My Connectors');
      setTimeout(() => setSuccess(''), 2000);
      loadConnectors();
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleConnectorCreated = (result) => {
    setSuccess(`Connector "${result.name}" created with ${result.endpoints_count} endpoints`);
    setTimeout(() => setSuccess(''), 5000);
    setActiveTab('my-connectors'); // Switch to my-connectors after creating
    loadConnectors();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 to-slate-900 rounded-2xl border border-gray-700/50 shadow-2xl w-full max-w-6xl h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-700/50 flex items-center justify-between bg-gray-800/50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Plug className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">API Connectors</h2>
              <p className="text-xs text-gray-400">Universal Connector Generator</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Connector
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 border-b border-gray-700/50 flex gap-4 bg-gray-800/30">
          <button
            onClick={() => setActiveTab('discover')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'discover'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Discover
          </button>
          <button
            onClick={() => setActiveTab('my-connectors')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'my-connectors'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            <Code className="w-4 h-4" />
            My Connectors
          </button>
        </div>

        {/* Search & Filters */}
        <div className="px-6 py-3 bg-gray-800/30 border-b border-gray-700/50 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search connectors..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mx-6 mt-4 bg-red-950/30 border border-red-800/50 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-red-300">{error}</span>
            <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-300">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {success && (
          <div className="mx-6 mt-4 bg-emerald-950/30 border border-emerald-800/50 rounded-lg p-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-emerald-300">{success}</span>
          </div>
        )}

        {/* Connectors Grid */}
        <div className="flex-1 overflow-auto px-6 py-4">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-gray-700 border-t-indigo-500 rounded-full animate-spin mx-auto mb-2"></div>
                <div className="text-sm text-gray-400">Loading connectors...</div>
              </div>
            </div>
          ) : connectors.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Plug className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                <div className="text-lg font-medium text-gray-400 mb-2">No connectors found</div>
                <p className="text-sm text-gray-600 mb-4">
                  {activeTab === 'my-connectors' 
                    ? 'Create your first connector or install one from Discover'
                    : 'Try adjusting your filters'
                  }
                </p>
                {activeTab === 'my-connectors' && (
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-all flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Create Connector
                    </button>
                    <button
                      onClick={() => setActiveTab('discover')}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-all flex items-center gap-2"
                    >
                      <TrendingUp className="w-4 h-4" />
                      Browse Discover
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {connectors.map(connector => (
                <ConnectorCard
                  key={connector.connector_id}
                  connector={connector}
                  onSelect={onSelectConnector}
                  onDelete={handleDeleteConnector}
                  onValidate={handleValidateConnector}
                  onTogglePublic={handleTogglePublic}
                  onInstall={handleInstall}
                  onUninstall={handleUninstall}
                  currentAssistantId={assistantId}
                  context={activeTab}
                  showActions={activeTab === 'my-connectors'}
                />
              ))}
            </div>
          )}
        </div>

        {/* Create Connector Modal */}
        {showCreateModal && (
          <CreateConnectorModal
            onClose={() => setShowCreateModal(false)}
            onSubmit={handleConnectorCreated}
            assistantId={assistantId}
          />
        )}
      </div>
    </div>
  );
}