// components/textflow/components/ConnectorPanel.js - Universal Connector Generator UI
import React, { useState, useEffect, useRef } from "react";
import { 
  Plug, Plus, Code, Star, TrendingUp, Search, X, 
  CheckCircle, AlertCircle, Zap, Clock, Activity, Globe, Eye, Trash2
} from "lucide-react";
import Editor from "@monaco-editor/react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://176.9.16.194:5403/api';

const truncateText = (text = "", max = 60) => {
  if (!text) return "";
  return text.length > max ? `${text.slice(0, max)}…` : text;
};

const splitTitle = (text = "", firstWords = 3, restMax = 40) => {
  const words = (text || "").trim().split(/\s+/);
  const firstLine = words.slice(0, firstWords).join(" ");
  const remaining = words.slice(firstWords).join(" ");
  return {
    firstLine,
    remaining: truncateText(remaining, restMax),
  };
};

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
  showActions = true,
  isExpanded = false,
  onToggleDetails = () => {}
}) {
  const isOwner = connector.owner_id === currentAssistantId;
  const { firstLine, remaining } = splitTitle(connector.name || connector.slug || "Connector");
  const descriptionText = truncateText(connector.description || connector.slug || "No description provided", 70);

  return (
    <div 
      className="rounded-2xl border overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-lg group node-card-surface min-h-[170px] flex"
      style={{
        borderColor: 'rgba(255, 255, 255, 0.12)'
      }}
      data-connector-card-id={connector.connector_id}
      onClick={(e) => {
        // Prevent card click from affecting other cards
        e.stopPropagation();
      }}
    >
      <div className="p-2 flex flex-col gap-1.5 flex-1">
        <div className="space-y-1 flex-1 min-h-[100px]">
          {/* Header */}
          <div className="flex items-start gap-1.5">
            <div className="flex-1 space-y-0.5">
              <span className="inline-flex px-1.5 py-0.5 rounded-full text-[8px] uppercase tracking-wide node-badge-immediate">
                {connector.category || 'general'}
              </span>
              <h3 className="mt-1 text-[11px] font-semibold text-white/85 leading-tight">
                <span className="block">{firstLine}</span>
                {remaining && <span className="block text-white/70">{remaining}</span>}
              </h3>
              <p className="text-[9px] text-white/50 line-clamp-2 leading-snug">
                {descriptionText}
              </p>
            </div>
            {showActions && isOwner && (
              <button
                onClick={() => onDelete && onDelete(connector.connector_id)}
                className="p-1.5 text-white/50 hover:text-red-400 transition-colors"
                title="Delete (owner only)"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-1 text-[8px] text-white/45">
            <span>{connector.usage_count || 0} users</span>
            <span>· {connector.spec?.endpoints?.length || 0} endpoints</span>
            {connector.avg_response_time && (
              <span>· {connector.avg_response_time.toFixed(0)}ms</span>
            )}
          </div>

          {/* Tags */}
          {connector.tags && connector.tags.length > 0 && (
            <div className="flex items-center gap-0.5 flex-wrap">
              {connector.tags.slice(0, 3).map((tag, idx) => (
                <span
                  key={idx}
                  className="px-1.5 py-0.5 rounded-full text-[8px]"
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: 'rgba(255, 255, 255, 0.75)'
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="pt-1 space-y-1">
          {context === 'discover' ? (
            <div className="flex items-center justify-between text-[9px] font-semibold">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onInstall && onInstall(connector.connector_id);
                }}
                className="text-[#9EFBCD] hover:text-white transition-colors"
                title="Add to My Connectors"
              >
                Add
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onToggleDetails && onToggleDetails();
                }}
                className="text-white/55 hover:text-white transition-colors"
                type="button"
                data-connector-id={connector.connector_id}
              >
                {isExpanded ? 'Hide details' : 'Details'}
              </button>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-2 text-[9px] font-semibold">
                <button
                  onClick={() => onSelect && onSelect(connector)}
                  className="text-[#9EFBCD] hover:text-white transition-colors"
                >
                  Use
                </button>

                {context === 'my-connectors' && !isOwner && onUninstall && (
                  <button
                    onClick={() => onUninstall(connector.connector_id)}
                    className="text-[#FF9F9F] hover:text-red-300 transition-colors"
                  >
                    Remove
                  </button>
                )}

                {showActions && onValidate && (
                  <button
                    onClick={() => onValidate(connector.connector_id)}
                    className="text-white/65 hover:text-white transition-colors"
                    title="Validate connector"
                  >
                    Validate
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-[9px] font-semibold">
                {showActions && isOwner && onTogglePublic && (
                  <button
                    onClick={() => onTogglePublic(connector.connector_id, !connector.is_public)}
                    className="text-white/60 hover:text-white transition-colors"
                  >
                    {connector.is_public ? 'Unpublish' : 'Publish'}
                  </button>
                )}
                <span className="text-white/30">•</span>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onToggleDetails && onToggleDetails();
                  }}
                  className="text-white/55 hover:text-white transition-colors"
                  type="button"
                  data-connector-id={connector.connector_id}
                >
                  {isExpanded ? 'Hide details' : 'Details'}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Expandable Details */}
        {isExpanded && (
          <div className="pt-3 border-t border-white/10 space-y-2" onClick={(e) => e.stopPropagation()}>
            <div className="text-xs space-y-1">
              <div className="flex justify-between text-gray-200">
                <span>Base URL:</span>
                <span className="font-mono text-gray-100 truncate ml-2">
                  {connector.spec?.base_url}
                </span>
              </div>
              <div className="flex justify-between text-gray-200">
                <span>Auth Type:</span>
                <span className="font-mono text-gray-100">
                  {connector.spec?.auth?.type || 'none'}
                </span>
              </div>
              <div className="flex justify-between text-gray-200">
                <span>Version:</span>
                <span className="font-mono text-gray-100">{connector.version}</span>
              </div>
              {connector.success_rate > 0 && (
                <div className="flex justify-between text-gray-200">
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
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const categoryRef = useRef(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'general',
    tags: '',
    trace_data: null,
    openapi_spec: null
  });

  const categories = [
    { value: 'general', label: 'General' },
    { value: 'communication', label: 'Communication' },
    { value: 'productivity', label: 'Productivity' },
    { value: 'database', label: 'Database' },
    { value: 'crm', label: 'CRM' },
    { value: 'analytics', label: 'Analytics' }
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target)) {
        setCategoryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={onClose} 
      />
      
      {/* Modal */}
      <div 
        className="relative rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-auto shadow-2xl"
        style={{
          background: 'rgba(20, 25, 35, 0.65)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1.5px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
        }}
      >
        <style dangerouslySetInnerHTML={{__html: `
          /* Style select dropdown options to match transparent design */
          .create-connector-modal select option {
            background: rgba(255, 255, 255, 0.08) !important;
            color: #FFFFFF !important;
            padding: 8px 12px;
          }
          .create-connector-modal select option:hover,
          .create-connector-modal select option:checked,
          .create-connector-modal select option:focus {
            background: rgba(19, 245, 132, 0.2) !important;
            color: #9EFBCD !important;
          }
        `}} />
        <div className="p-4 space-y-4 create-connector-modal">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl" style={{ color: 'rgba(255, 255, 255, 1)', fontWeight: 700 }}>Create New Connector</h3>
            </div>
            <button 
              onClick={onClose} 
              className="w-6 h-6 flex items-center justify-center transition-colors"
              style={{ color: 'rgba(255, 255, 255, 0.9)' }}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="bg-red-950/30 border border-red-800/50 rounded-lg p-2 flex items-start gap-2">
              <AlertCircle className="w-3 h-3 text-red-400 flex-shrink-0 mt-0.5" />
              <span className="text-xs" style={{ color: 'rgba(252, 165, 165, 1)', fontWeight: 500 }}>{error}</span>
            </div>
          )}

          {/* Tabs - Matching Figma Design */}
          <div 
            className="flex items-center gap-6 border-b"
            style={{
              borderBottomColor: 'rgba(255, 255, 255, 0.15)',
              borderBottomWidth: '1px'
            }}
          >
            <button
              onClick={() => setMode('trace')}
              className={`px-0 py-2 text-sm transition-all uppercase ${
                mode === 'trace' 
                  ? 'text-[#13F584] border-b-2 border-[#13F584]' 
                  : 'text-[#919EAB] hover:text-gray-300'
              }`}
              style={{ height: '32px', fontWeight: mode === 'trace' ? 600 : 500 }}
            >
              From Trace
            </button>
            <button
              onClick={() => setMode('openapi')}
              className={`px-0 py-2 text-sm transition-all uppercase ${
                mode === 'openapi' 
                  ? 'text-[#13F584] border-b-2 border-[#13F584]' 
                  : 'text-[#919EAB] hover:text-gray-300'
              }`}
              style={{ height: '32px', fontWeight: mode === 'openapi' ? 600 : 500 }}
            >
              From OpenAPI
            </button>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="text-xs block mb-1.5" style={{ color: 'rgba(255, 255, 255, 0.95)', fontWeight: 600 }}>Connector Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Slack API"
                className="w-full px-2 py-1.5 rounded-lg text-xs transition-colors focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                style={{
                  background: 'rgba(255, 255, 255, 0.12)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: 'rgba(255, 255, 255, 1)',
                  fontWeight: 500
                }}
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-xs block mb-1.5" style={{ color: 'rgba(255, 255, 255, 0.95)', fontWeight: 600 }}>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Send messages to Slack channels"
                rows={2}
                className="w-full px-2 py-1.5 rounded-lg text-xs transition-colors resize-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                style={{
                  background: 'rgba(255, 255, 255, 0.12)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: 'rgba(255, 255, 255, 1)',
                  fontWeight: 500
                }}
              />
            </div>

            {/* Category */}
            <div ref={categoryRef} className="relative">
              <label className="text-xs block mb-1.5" style={{ color: 'rgba(255, 255, 255, 0.95)', fontWeight: 600 }}>Category</label>
              <button
                type="button"
                onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                className="w-full px-2 py-1.5 rounded-lg text-xs transition-colors focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-left flex items-center justify-between"
                style={{
                  background: 'rgba(255, 255, 255, 0.12)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: 'rgba(255, 255, 255, 1)',
                  fontWeight: 500
                }}
              >
                <span>{categories.find(c => c.value === formData.category)?.label || 'General'}</span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {categoryDropdownOpen && (
                <div
                  className="absolute z-50 w-full mt-1 rounded-lg shadow-lg overflow-hidden"
                  style={{
                    background: '#2D3748',
                    border: '1px solid rgba(255, 255, 255, 0.12)'
                  }}
                >
                  {categories.map((category) => (
                    <button
                      key={category.value}
                      type="button"
                      onClick={() => {
                        setFormData({...formData, category: category.value});
                        setCategoryDropdownOpen(false);
                      }}
                      className="w-full px-2 py-1.5 text-left text-xs text-white hover:bg-emerald-500/20 transition-colors"
                      style={{
                        background: formData.category === category.value 
                          ? 'rgba(19, 245, 132, 0.2)' 
                          : 'transparent',
                        color: formData.category === category.value ? '#9EFBCD' : '#FFFFFF'
                      }}
                    >
                      {category.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Tags */}
            <div>
              <label className="text-xs block mb-1.5" style={{ color: 'rgba(255, 255, 255, 0.95)', fontWeight: 600 }}>Tags (comma-separated)</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({...formData, tags: e.target.value})}
                placeholder="slack, messaging, api"
                className="w-full px-2 py-1.5 rounded-lg text-xs transition-colors focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                style={{
                  background: 'rgba(255, 255, 255, 0.12)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: 'rgba(255, 255, 255, 1)',
                  fontWeight: 500
                }}
              />
            </div>

            {/* Trace/OpenAPI Input */}
            <div>
              <label className="text-xs block mb-1.5" style={{ color: 'rgba(255, 255, 255, 0.95)', fontWeight: 600 }}>
                {mode === 'trace' ? 'API Trace JSON *' : 'OpenAPI Spec JSON *'}
              </label>
              <div 
                className="rounded-lg overflow-hidden"
                style={{
                  background: 'rgba(255, 255, 255, 0.12)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px'
                }}
              >
                <Editor
                  height="200px"
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
                    fontSize: 13,
                    fontWeight: '500',
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    lineHeight: 20
                  }}
                  beforeMount={(monaco) => {
                    monaco.editor.defineTheme('transparent-dark', {
                      base: 'vs-dark',
                      inherit: true,
                      rules: [],
                      colors: {
                        'editor.background': '#00000000',
                        'editor.foreground': '#FFFFFF',
                      }
                    });
                  }}
                  onMount={(editor, monaco) => {
                    monaco.editor.setTheme('transparent-dark');
                  }}
                />
              </div>
              <p className="text-[10px] mt-1.5" style={{ color: 'rgba(255, 255, 255, 0.8)', fontWeight: 500 }}>
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
                className="h-3.5 w-3.5 text-indigo-600 bg-gray-800 border-gray-700 rounded"
              />
              <label htmlFor="makePublic" className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.95)', fontWeight: 500 }}>
                Make public (show in Discover so others can find & use it)
              </label>
            </div>
          </div>

          {/* Actions - Matching Figma Design (Right-aligned) */}
          <div className="flex justify-end items-center gap-2.5 pt-4">
            <button
              onClick={onClose}
              className="px-3 py-2 text-sm rounded-lg transition-all"
              style={{
                background: 'rgba(255, 86, 48, 0.08)',
                color: '#FFAC82',
                height: '36px',
                fontWeight: 600
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !formData.name.trim()}
              className="px-3 py-2 text-sm rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{
                background: 'rgba(19, 245, 132, 0.08)',
                color: '#9EFBCD',
                height: '36px',
                fontWeight: 600
              }}
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                'Create'
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
  const [deleteModal, setDeleteModal] = useState({ open: false, connectorId: null, connectorName: '', isOwner: false });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('discover'); // 'discover', 'my-connectors'
  const [expandedCardKey, setExpandedCardKey] = useState(null);
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
        setExpandedCardKey(null);
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
      setExpandedCardKey(null);
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
    const connector = connectors.find(c => c.connector_id === connectorId);
    if (connector) {
      setDeleteModal({
        open: true,
        connectorId,
        connectorName: connector.name,
        isOwner: true
      });
    }
  };

  const confirmDelete = async () => {
    if (!deleteModal.connectorId) return;

    try {
      const response = await fetch(
        `${API_BASE}/textflow/connectors/${deleteModal.connectorId}?owner_id=${assistantId}`,
        { method: 'DELETE' }
      );
      if (!response.ok) throw new Error(await readError(response));

      setSuccess('Connector deleted');
      setTimeout(() => setSuccess(''), 2000);
      setDeleteModal({ open: false, connectorId: null, connectorName: '', isOwner: false });
      loadConnectors();
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
      setDeleteModal({ open: false, connectorId: null, connectorName: '', isOwner: false });
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
    const connector = connectors.find(c => c.connector_id === connectorId);
    if (connector) {
      setDeleteModal({
        open: true,
        connectorId,
        connectorName: connector.name,
        isOwner: false
      });
    }
  };

  const confirmUninstall = async () => {
    if (!deleteModal.connectorId) return;
    
    try {
      const res = await fetch(
        `${API_BASE}/textflow/connectors/${deleteModal.connectorId}/install?owner_id=${assistantId}`,
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
      setDeleteModal({ open: false, connectorId: null, connectorName: '', isOwner: false });
      loadConnectors();
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
      setDeleteModal({ open: false, connectorId: null, connectorName: '', isOwner: false });
    }
  };

  const handleConnectorCreated = (result) => {
    setSuccess(`Connector "${result.name}" created with ${result.endpoints_count} endpoints`);
    setTimeout(() => setSuccess(''), 5000);
    setActiveTab('my-connectors'); // Switch to my-connectors after creating
    loadConnectors();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={onClose} 
      />
      
      {/* Modal */}
      <div 
        className="relative rounded-3xl w-full max-w-xl h-[50vh] max-h-[50vh] shadow-2xl flex flex-col overflow-hidden"
        style={{
          background: 'rgba(255, 255, 255, 0.04)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.12)'
        }}
      >
        {/* Backdrop overlay to blur parent content when create modal is open */}
        {showCreateModal && (
          <div 
            className="absolute inset-0 z-[50] backdrop-blur-md"
            style={{
              background: 'rgba(0, 0, 0, 0.3)',
              pointerEvents: 'none'
            }}
          />
        )}
        
        {/* Header */}
        <div className="px-6 py-3 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white/90">API Connectors</h2>
            <p className="text-[11px] text-white/50">Universal connector generator</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all text-center"
            style={{
              color: "#9EFBCD",
              background: "rgba(19, 245, 132, 0.08)",
            }}
          >
            New Connector
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 pb-1 flex gap-1">
          <button
            onClick={() => setActiveTab('discover')}
            className={`px-2 py-1 text-[10px] font-semibold rounded-md transition-all flex items-center gap-1 ${
              activeTab === 'discover'
                ? 'bg-[rgba(19,245,132,0.08)] text-[#9EFBCD]'
                : 'text-white/60 hover:text-white/80'
            }`}
          >
            <TrendingUp className="w-2.5 h-2.5 opacity-80" />
            Discover
          </button>
          <button
            onClick={() => setActiveTab('my-connectors')}
            className={`px-2 py-1 text-[10px] font-semibold rounded-md transition-all flex items-center gap-1 ${
              activeTab === 'my-connectors'
                ? 'bg-[rgba(19,245,132,0.08)] text-[#9EFBCD]'
                : 'text-white/60 hover:text-white/80'
            }`}
          >
            <Code className="w-2.5 h-2.5 opacity-80" />
            My Connectors
          </button>
        </div>

        {/* Search & Filters */}
        <div className="px-6 py-2 space-y-2.5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-white/40" />
            <input
              type="text"
              placeholder="Search connectors..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1 rounded-xl text-[11px] text-white placeholder-white/40 transition-colors focus:ring-2 focus:ring-emerald-400/20 focus:border-emerald-400/60 border"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                borderColor: 'rgba(145, 158, 171, 0.18)'
              }}
            />
          </div>

          <div className="flex gap-1 overflow-x-auto pb-1.5">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className="px-2.5 py-1 rounded-md text-[10px] font-semibold whitespace-nowrap transition-all"
                style={
                  selectedCategory === cat
                    ? { background: 'rgba(19, 245, 132, 0.08)', color: '#9EFBCD' }
                    : { background: 'rgba(255, 255, 255, 0.08)', color: 'rgba(255,255,255,0.7)' }
                }
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
        <div className="flex-1 overflow-auto px-6 py-4 template-scroll">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center space-y-2">
                <div className="w-7 h-7 border-2 border-gray-700 border-t-emerald-400 rounded-full animate-spin mx-auto"></div>
                <div className="text-xs text-white/60">Loading connectors...</div>
              </div>
            </div>
          ) : connectors.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center space-y-1.5">
                <Plug className="w-10 h-10 mx-auto text-white/30" />
                <div className="text-sm font-semibold text-white/80">No connectors found</div>
                <p className="text-[11px] text-white/55">
                  {activeTab === 'my-connectors' 
                    ? 'Create your first connector or install one from Discover'
                    : 'Try adjusting your filters'
                  }
                </p>
                {activeTab === 'my-connectors' && (
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                      style={{
                        color: "#9EFBCD",
                        background: "rgba(19, 245, 132, 0.08)",
                      }}
                    >
                      Create Connector
                    </button>
                    <button
                      onClick={() => setActiveTab('discover')}
                      className="px-4 py-2 rounded-xl text-sm font-semibold transition-all text-white/70 hover:text-white"
                      style={{
                        background: 'rgba(255, 255, 255, 0.06)'
                      }}
                    >
                      Browse Discover
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {connectors.map((connector, index) => {
                const cardKey = `${connector.connector_id}-${index}-${activeTab}`;
                return (
                  <ConnectorCard
                    key={cardKey}
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
                    isExpanded={expandedCardKey === cardKey}
                    onToggleDetails={() =>
                      setExpandedCardKey(prev => (prev === cardKey ? null : cardKey))
                    }
                  />
                );
              })}
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

        {/* Delete/Remove Confirmation Modal */}
        {deleteModal.open && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
              onClick={() => setDeleteModal({ open: false, connectorId: null, connectorName: '', isOwner: false })} 
            />
            
            {/* Modal */}
            <div 
              className="relative rounded-3xl max-w-md w-full shadow-2xl"
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.12)'
              }}
            >
              <div className="p-6 space-y-4">
                {/* Header */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {deleteModal.isOwner ? 'Delete Connector' : 'Remove Connector'}
                    </h3>
                    <p className="text-xs text-gray-400">This action cannot be undone</p>
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <p className="text-sm text-gray-300">
                    {deleteModal.isOwner ? (
                      <>
                        Are you sure you want to delete <span className="font-semibold text-white">"{deleteModal.connectorName}"</span>? 
                        This will permanently remove the connector and it will be removed from all users who installed it.
                      </>
                    ) : (
                      <>
                        Remove <span className="font-semibold text-white">"{deleteModal.connectorName}"</span> from My Connectors? 
                        You can add it again from Discover.
                      </>
                    )}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex justify-end items-center gap-2.5 pt-4">
                  <button
                    onClick={() => setDeleteModal({ open: false, connectorId: null, connectorName: '', isOwner: false })}
                    className="px-4 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-2"
                    style={{
                      background: 'rgba(255, 86, 48, 0.08)',
                      color: '#FFAC82',
                      height: '36px'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={deleteModal.isOwner ? confirmDelete : confirmUninstall}
                    className="px-4 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-2"
                    style={{
                      background: deleteModal.isOwner 
                        ? 'rgba(255, 86, 48, 0.2)' 
                        : 'rgba(19, 245, 132, 0.2)',
                      color: deleteModal.isOwner ? '#FF6B6B' : '#9EFBCD',
                      border: `1px solid ${deleteModal.isOwner ? 'rgba(255, 86, 48, 0.3)' : 'rgba(19, 245, 132, 0.3)'}`,
                      height: '36px'
                    }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {deleteModal.isOwner ? 'Delete' : 'Remove'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}