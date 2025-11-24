// components/textflow/components/TemplateGallery.js - FIXED: Description handling + Credential warnings
import React, { useState, useEffect, useRef } from "react";
import { 
  Search, Star, Download, Heart, Share2, ArrowRight, Sparkles, TrendingUp, 
  Tag, User, Calendar, Plus, X, Check, Copy, Code, MessageSquare, AlertCircle, Shield 
} from "lucide-react";
import Editor from "@monaco-editor/react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://176.9.16.194:5403/api';

// ============================================================================
// TEMPLATE CARD COMPONENT
// ============================================================================

function truncate(text = "", max = 20) {
  if (!text) return "";
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

function TemplateCard({ template, onSelect, isFavorite, onToggleFavorite }) {
const rawTitle = template?.name || "";
const titleWords = rawTitle.trim().split(/\s+/);
const firstLineTitle = titleWords.slice(0, 3).join(" ");
const remainingTitle = titleWords.slice(3).join(" ");
const descriptionText = truncate(template?.description || "No description provided", 60);
  return (
    <div
      className="rounded-2xl border overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-lg group node-card-surface"
      style={{
        borderColor: 'rgba(255, 255, 255, 0.12)',
      }}
    >
      <div className="p-3 space-y-2.5 relative">
        {/* Header */}
        <div className="flex items-start justify-between gap-1.5">
          <div className="flex-1 space-y-0.5">
            <span
              className="inline-flex px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wide node-badge-immediate"
            >
              {template.category}
            </span>
            <h3 className="text-[12px] font-semibold text-white/85 transition-colors leading-tight">
              <span className="block">{firstLineTitle}</span>
              {remainingTitle && (
                <span className="block text-white/70">
                  {truncate(remainingTitle, 35)}
                </span>
              )}
            </h3>
            {/* FIXED: Show description properly */}
            <p className="text-[10px] text-white/50 line-clamp-2">
              {descriptionText}
            </p>
          </div>
          <button
            onClick={() => onToggleFavorite(template.template_id)}
            className="flex-shrink-0 text-white/40 hover:text-red-400 transition-colors"
          >
            <Heart
              className={`w-3.5 h-3.5 transition-colors ${
                isFavorite ? "fill-red-500 text-red-500" : ""
              }`}
            />
          </button>
        </div>

        {/* Metadata */}
        <div className="flex items-center gap-1 flex-wrap text-[9px] text-white/55">
          <span>{template.usage_count || 0} users</span>
        </div>

        {/* Tags */}
        {template.tags && template.tags.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap">
            {template.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-full text-[10px]"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'rgba(255, 255, 255, 0.75)',
                }}
              >
                {tag}
              </span>
            ))}
            {template.tags.length > 3 && (
              <span className="text-[10px] text-white/40">+{template.tags.length - 3}</span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-3 border-t border-white/5">
          <div className="flex-1 flex">
            <button
              onClick={() => onSelect(template)}
              className="px-2 py-1.5 rounded-xl text-[10px] font-semibold transition-all text-left"
              style={{
                background: "rgba(19, 245, 132, 0.12)",
                color: "#9EFBCD",
              }}
            >
              Use
            </button>
          </div>
          <button
            className="px-2 py-1 text-white/70 hover:text-white transition-colors"
            title="Share"
          >
            <Share2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// TEMPLATE DISCOVERY TAB
// ============================================================================

function TemplateDiscovery({ assistantId, onSelectTemplate, onClose }) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("trending");
  const [favorites, setFavorites] = useState([]);
  const [selectedTab, setSelectedTab] = useState("discover");

  const categories = ["all", "api", "data", "notification", "database", "ai"];

  useEffect(() => {
    if (selectedTab === "discover" || selectedTab === "trending") {
      loadTemplates();
    }
  }, [sortBy, selectedCategory, selectedTab]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      
      let url;
      if (selectedTab === "trending") {
        url = `${API_BASE}/templates/discover/trending?limit=50`;
      } else {
        url = new URL(`${API_BASE}/templates/flow/list`);
        url.searchParams.append("public_only", "true");
        url.searchParams.append("limit", "50");
        
        if (selectedCategory !== "all") {
          url.searchParams.append("category", selectedCategory);
        }
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to load templates");
      
      const data = await response.json();
      setTemplates(data);
    } catch (err) {
      console.error("Failed to load templates:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      loadTemplates();
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE}/templates/discover/search?q=${encodeURIComponent(query)}&limit=50`
      );
      if (!response.ok) throw new Error("Search failed");
      
      const data = await response.json();
      setTemplates(data);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (templateId) => {
    setFavorites(prev =>
      prev.includes(templateId)
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );
  };

  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* Tabs */}
      <div className="flex gap-1 px-4 pt-3">
        {["discover", "trending", "favorites"].map(tab => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            className={`px-2.5 py-1.5 text-[10px] font-semibold rounded-md transition-all ${
              selectedTab === tab
                ? "bg-[rgba(19,245,132,0.08)] text-[#9EFBCD]"
                : "text-white/60 hover:text-white/80"
            }`}
          >
            {tab === "discover" && "Browse"}
            {tab === "trending" && <TrendingUp className="w-3 h-3 inline mr-1 opacity-80" />}
            {tab === "trending" && "Trending"}
            {tab === "favorites" && <Heart className="w-3 h-3 inline mr-1 opacity-80" />}
            {tab === "favorites" && "Saved"}
          </button>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="px-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 rounded-2xl text-[12px] text-white placeholder-white/40 transition-colors focus:ring-2 focus:ring-emerald-400/20 focus:border-emerald-400/60 border"
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              borderColor: 'rgba(145, 158, 171, 0.2)'
            }}
          />
        </div>

        {selectedTab === "discover" && (
          <div className="flex gap-1.5 overflow-x-auto pb-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className="px-3 py-1.5 rounded-md text-[11px] font-semibold whitespace-nowrap transition-all"
                style={
                  selectedCategory === cat
                    ? {
                        background: "rgba(19, 245, 132, 0.08)",
                        color: "#9EFBCD",
                      }
                    : {
                        background: "rgba(255, 255, 255, 0.08)",
                        color: "rgba(255,255,255,0.7)",
                      }
                }
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Templates Grid */}
      <div className="flex-1 overflow-auto px-4 pb-4 template-scroll">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <div className="w-7 h-7 border-2 border-gray-700 border-t-emerald-400 rounded-full animate-spin mx-auto mb-2"></div>
              <div className="text-xs text-white/60">Loading templates...</div>
            </div>
          </div>
        ) : templates.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-center space-y-1">
              <Sparkles className="w-8 h-8 mx-auto text-white/30" />
              <div className="text-[12px] font-semibold text-white/75">No templates found</div>
              <div className="text-[10px] text-white/45">Try adjusting your filters</div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {templates.map(template => (
              <TemplateCard
                key={template.template_id}
                template={template}
                onSelect={(t) => {
                  onSelectTemplate(t);
                  onClose();
                }}
                isFavorite={favorites.includes(template.template_id)}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// MY TEMPLATES - FIXED
// ============================================================================

function MyTemplates({ assistantId, onSelectTemplate, onClose, onGetCurrentFlow }) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const categoryRef = useRef(null);
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    description: "",  // FIXED: Initialize as empty string
    category: "general",
    tags: "",
    is_public: false
  });

  const categories = [
    { value: 'general', label: 'General' },
    { value: 'api', label: 'API Integration' },
    { value: 'data', label: 'Data Processing' },
    { value: 'notification', label: 'Notification' },
    { value: 'database', label: 'Database' },
    { value: 'ai', label: 'AI/ML' }
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

  useEffect(() => {
    loadMyTemplates();
  }, []);

  const loadMyTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE}/templates/flow/list?assistant_id=${assistantId}&public_only=false`
      );
      if (!response.ok) throw new Error("Failed to load templates");
      
      const data = await response.json();
      setTemplates(data);
    } catch (err) {
      setError(err.message);
      console.error("Failed to load templates:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async () => {
    if (!newTemplate.name.trim()) {
      setError("Template name is required");
      return;
    }

    if (!onGetCurrentFlow) {
      setError("Cannot save template: no flow data available");
      return;
    }

    const currentFlow = onGetCurrentFlow();
    
    if (!currentFlow.nodes || currentFlow.nodes.length === 0) {
      setError("Cannot save empty flow as template");
      return;
    }

    try {
      const tags = newTemplate.tags
        .split(",")
        .map(t => t.trim())
        .filter(Boolean);

      const payload = {
        name: newTemplate.name,
        description: newTemplate.description || null,  // FIXED: Send null if empty
        category: newTemplate.category,
        flow_data: currentFlow,
        tags: tags,
        is_public: newTemplate.is_public
      };

      const response = await fetch(
        `${API_BASE}/templates/flow/create?assistant_id=${assistantId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to create template");
      }
      
      const data = await response.json();
      
      setShowCreateModal(false);
      setNewTemplate({ 
        name: "", 
        description: "",  // FIXED: Reset to empty string
        category: "general", 
        tags: "",
        is_public: false 
      });
      
      // FIXED: Show warning if credentials were sanitized
      if (data.sanitized) {
        setSuccess(`Template "${newTemplate.name}" created! (Credentials removed for security)`);
      } else {
        setSuccess(`Template "${newTemplate.name}" created successfully!`);
      }
      
      setError("");
      setTimeout(() => setSuccess(""), 5000);
      loadMyTemplates();
    } catch (err) {
      setError(err.message || "Failed to create template");
      console.error("Failed to create template:", err);
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    if (!window.confirm("Delete this template? This cannot be undone.")) return;

    try {
      const response = await fetch(
        `${API_BASE}/templates/flow/${templateId}?assistant_id=${assistantId}`,
        { method: "DELETE" }
      );

      if (!response.ok) throw new Error("Failed to delete template");
      
      setSuccess("Template deleted");
      setTimeout(() => setSuccess(""), 2000);
      loadMyTemplates();
    } catch (err) {
      setError(err.message);
      console.error("Failed to delete template:", err);
    }
  };

  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* Header */}
      <div className="px-4 pt-3 pb-2 flex items-center justify-between border-b border-white/10">
        <div>
          <h3 className="text-sm font-semibold text-white/90">My Templates</h3>
          <p className="text-[11px] text-white/50">{templates.length} templates</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-3 py-1.5 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-all"
          style={{
            background: "rgba(19, 245, 132, 0.12)",
            color: "#9EFBCD",
          }}
        >
          <Plus className="w-3 h-3" />
          Save Current
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mx-4 bg-red-950/30 border border-red-800/50 rounded-lg p-3 flex items-start gap-2">
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
        <div className="mx-4 bg-emerald-950/30 border border-emerald-800/50 rounded-lg p-3 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span className="text-sm text-emerald-300">{success}</span>
        </div>
      )}

      {/* Templates List */}
      <div className="flex-1 overflow-auto px-4 pb-4 space-y-2 template-scroll">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-xs text-white/60">Loading...</div>
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-10 space-y-1.5">
            <Code className="w-10 h-10 mx-auto text-white/30" />
            <div className="text-sm font-semibold text-white/75">No templates yet</div>
            <div className="text-[11px] text-white/50">Save your flows as templates to reuse them</div>
          </div>
        ) : (
          templates.map(template => (
            <div
              key={template.template_id}
              className="rounded-lg border p-3 transition-all"
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                borderColor: 'rgba(255, 255, 255, 0.12)'
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                    <h4 className="text-sm font-semibold text-white/90">{template.name}</h4>
                  {/* FIXED: Show description properly */}
                    <p className="text-[11px] text-white/50 mt-1 line-clamp-2">
                    {template.description || "No description"}
                  </p>
                    <div className="flex items-center gap-3 mt-2 text-[10px] text-white/50">
                    <span 
                      className="px-2 py-0.5 rounded capitalize"
                      style={{
                          background: 'rgba(255, 255, 255, 0.08)',
                          color: 'rgba(255,255,255,0.7)'
                      }}
                    >
                      {template.category}
                    </span>
                    <span>v{template.version}</span>
                    <span>{template.usage_count} uses</span>
                    {template.is_public && (
                      <span className="flex items-center gap-1 text-emerald-400">
                        <Shield className="w-3 h-3" />
                        Public
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => {
                      onSelectTemplate(template);
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-lg text-[11px] font-semibold text-[#9EFBCD] transition-all"
                    style={{
                      background: "rgba(19, 245, 132, 0.12)",
                    }}
                  >
                    Use
                  </button>
                  <button
                    onClick={() => handleDeleteTemplate(template.template_id)}
                    className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-red-300 transition-all"
                    style={{
                      background: 'rgba(255, 72, 72, 0.1)'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Backdrop overlay to blur parent modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[50] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-md transition-all duration-200" 
            onClick={() => {
              setShowCreateModal(false);
              setError("");
            }}
            style={{ pointerEvents: 'auto' }}
          />
        </div>
      )}

      {/* Create Template Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
            onClick={() => {
              setShowCreateModal(false);
              setError("");
            }}
          />
          
          {/* Modal */}
          <div 
            className="relative rounded-3xl max-w-md w-full shadow-2xl p-6 space-y-4"
            style={{
              background: 'rgba(20, 25, 35, 0.65)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1.5px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
            }}
          >
            <div className="flex items-center justify-between sticky top-0 pb-4 border-b" style={{ background: 'rgba(20, 25, 35, 0.65)', borderColor: 'rgba(255, 255, 255, 0.15)' }}>
              <h3 className="text-xl font-bold" style={{ color: 'rgba(255, 255, 255, 1)', fontWeight: 700 }}>Save as Template</h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setError("");
                }}
                className="w-7 h-7 flex items-center justify-center transition-colors rounded-lg hover:bg-white/10"
                style={{ color: 'rgba(255, 255, 255, 0.9)' }}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm block mb-2" style={{ color: 'rgba(255, 255, 255, 0.95)', fontWeight: 600 }}>
                  Template Name *
                </label>
                <input
                  type="text"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                  placeholder="My Awesome Flow"
                  className="w-full px-3 py-2.5 rounded-lg text-sm transition-colors focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  style={{
                    background: 'rgba(255, 255, 255, 0.12)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: 'rgba(255, 255, 255, 1)',
                    fontWeight: 500
                  }}
                />
              </div>

              <div>
                <label className="text-sm block mb-2" style={{ color: 'rgba(255, 255, 255, 0.95)', fontWeight: 600 }}>
                  Description
                </label>
                <textarea
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate({...newTemplate, description: e.target.value})}
                  placeholder="What does this template do?"
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-lg text-sm transition-colors resize-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  style={{
                    background: 'rgba(255, 255, 255, 0.12)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: 'rgba(255, 255, 255, 1)',
                    fontWeight: 500
                  }}
                />
              </div>

              <div ref={categoryRef} className="relative">
                <label className="text-sm block mb-2" style={{ color: 'rgba(255, 255, 255, 0.95)', fontWeight: 600 }}>
                  Category
                </label>
                <button
                  type="button"
                  onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                  className="w-full px-3 py-2.5 rounded-lg text-sm transition-colors focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-left flex items-center justify-between"
                  style={{
                    background: 'rgba(255, 255, 255, 0.12)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: 'rgba(255, 255, 255, 1)',
                    fontWeight: 500
                  }}
                >
                  <span>{categories.find(c => c.value === newTemplate.category)?.label || 'General'}</span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {categoryDropdownOpen && (
                  <div
                    className="absolute z-50 w-full mt-1 rounded-lg shadow-lg overflow-hidden"
                    style={{
                      background: '#1A1F2E',
                      border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}
                  >
                    {categories.map((category) => (
                      <button
                        key={category.value}
                        type="button"
                        onClick={() => {
                          setNewTemplate({...newTemplate, category: category.value});
                          setCategoryDropdownOpen(false);
                        }}
                        className="w-full px-3 py-2 text-left text-sm text-white hover:bg-emerald-500/20 transition-colors"
                        style={{
                          background: newTemplate.category === category.value 
                            ? 'rgba(19, 245, 132, 0.2)' 
                            : 'transparent',
                          color: newTemplate.category === category.value ? '#9EFBCD' : '#FFFFFF'
                        }}
                      >
                        {category.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm block mb-2" style={{ color: 'rgba(255, 255, 255, 0.95)', fontWeight: 600 }}>
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={newTemplate.tags}
                  onChange={(e) => setNewTemplate({...newTemplate, tags: e.target.value})}
                  placeholder="api, automation, webhook"
                  className="w-full px-3 py-2.5 rounded-lg text-sm transition-colors focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  style={{
                    background: 'rgba(255, 255, 255, 0.12)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: 'rgba(255, 255, 255, 1)',
                    fontWeight: 500
                  }}
                />
              </div>

              {/* FIXED: Public toggle with clear security warning */}
              <div className="bg-yellow-950/20 border border-yellow-800/50 rounded-lg p-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newTemplate.is_public}
                    onChange={(e) => setNewTemplate({...newTemplate, is_public: e.target.checked})}
                    className="rounded mt-0.5"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-semibold flex items-center gap-2" style={{ color: 'rgba(255, 255, 255, 0.95)' }}>
                      <Shield className="w-4 h-4" />
                      Make public (share with community)
                    </span>
                    <p className="text-xs mt-1" style={{ color: 'rgba(253, 224, 71, 1)', fontWeight: 500 }}>
                      ⚠️ Security: All credential IDs and sensitive data will be automatically removed from public templates
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.15)' }}>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setError("");
                }}
                className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all"
                style={{
                  background: 'rgba(255, 255, 255, 0.12)',
                  color: 'rgba(255, 255, 255, 1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  fontWeight: 600
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTemplate}
                disabled={!newTemplate.name.trim()}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{
                  color: 'rgba(255, 255, 255, 1)',
                  fontWeight: 600,
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                }}
              >
                Save Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MAIN TEMPLATE GALLERY
// ============================================================================

export default function TemplateGallery({ assistantId, onSelectTemplate, onClose, onGetCurrentFlow }) {
  const [activeTab, setActiveTab] = useState("discover");

  const handleSelectTemplate = (template) => {
    onSelectTemplate(template);
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
        {/* Header */}
        <div className="px-6 py-3 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-white/90 tracking-tight">Template Library</h2>
            <p className="text-[11px] text-white/60">Discover and reuse flow templates</p>
          </div>
          <button
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center text-white/60 hover:text-white transition-colors"
            title="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 pb-2 flex gap-1">
          {[
            { id: "discover", label: "Discover", icon: Sparkles },
            { id: "my-templates", label: "My Templates", icon: Code }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-2.5 py-1.5 text-[11px] font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                  activeTab === tab.id
                    ? "bg-[rgba(19,245,132,0.08)] text-[#9EFBCD]"
                    : "text-white/60 hover:text-white/80"
                }`}
              >
                <Icon className="w-3 h-3 opacity-80" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === "discover" && (
            <TemplateDiscovery
              assistantId={assistantId}
              onSelectTemplate={handleSelectTemplate}
              onClose={onClose}
            />
          )}
          {activeTab === "my-templates" && (
            <MyTemplates
              assistantId={assistantId}
              onSelectTemplate={handleSelectTemplate}
              onClose={onClose}
              onGetCurrentFlow={onGetCurrentFlow}  
            />
          )}
        </div>
      </div>
    </div>
  );
}