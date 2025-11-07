import React, { useEffect, useState } from 'react';
import { Wrench, Plus } from 'lucide-react';
import { toolsService } from '../lib/toolsService';

const StatusBadge = ({ is_verified }) => {
  if (is_verified) return <span className="text-emerald-700 text-xs px-2 py-1 bg-emerald-100 rounded-full">Verified</span>;
  return <span className="text-gray-500 text-xs px-2 py-1 bg-gray-100 rounded-full">Pending</span>;
};

const ToolsList = ({ assistantId, onAdd, onEdit }) => {
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [togglingToolId, setTogglingToolId] = useState(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const loadTools = async () => {
    setLoading(true);
    try {
      const toolsList = await toolsService.listTools(assistantId);
      console.log('toolsList', toolsList);
      setTools(toolsList);
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

  const handleDelete = async (toolId) => {
    if (!confirm('Delete this tool?')) return;
    try {
      await toolsService.deleteTool(assistantId, toolId);
      await loadTools(); 
    } catch (error) {
      console.error('Failed to delete tool:', error);
      alert('Failed to delete tool');
    }
  };

  const handleToggle = async (tool) => {
    if (!tool.is_verified) {
      alert('Please verify the tool before enabling it.');
      return;
    }
    
    setTogglingToolId(tool.id);
    try {
      await toolsService.toggleToolEnabled(assistantId, tool.id, !tool.is_enabled);
      await loadTools(); 
      
      // Show success message
      const action = tool.is_enabled ? 'disabled' : 'enabled';
      setSuccessMessage(`Tool "${tool.name}" ${action} successfully!`);
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
      
    } catch (error) {
      console.error('Failed to toggle tool:', error);
      alert('Failed to toggle tool status');
    } finally {
      setTogglingToolId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 bg-green-100">
      {/* Success Toast */}
      {showSuccessToast && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center">
          <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center mr-3">
            <span className="text-white text-xs">✓</span>
          </div>
          <div className="text-emerald-800 font-medium">{successMessage}</div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <Wrench size={20} className="mr-2" /> Tools ({tools.length})
        </h3>
        <button
          onClick={onAdd}
          className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 text-sm"
        >
          <Plus size={16} className="inline mr-2" /> Add Tool
        </button>
      </div>

      {tools.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <Wrench size={32} className="mx-auto text-gray-400 mb-2" />
          <div className="text-sm text-gray-600">No tools yet. Create your first tool.</div>
        </div>
      ) : (
        <div className="space-y-3">
          {tools.map(tool => (
            <div key={tool.id} className="border rounded-lg p-4 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="font-medium text-gray-900">{tool.name}</span>
                    <StatusBadge is_verified={tool.is_verified} />
                  </div>
                  <div className="text-sm text-gray-600 mb-2">{tool.description}</div>
                  <div className="text-xs text-gray-500">
                    {tool.method} • {tool.endpoint_url}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => onEdit(tool)} 
                    className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                  >
                    Configure
                  </button>
                  <button 
                    onClick={() => handleToggle(tool)} 
                    disabled={!tool.is_verified || togglingToolId === tool.id}
                    className={`px-3 py-1 text-xs rounded ${
                      tool.is_enabled 
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {togglingToolId === tool.id ? (
                      <>
                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin mr-1 inline"></div>
                        Saving...
                      </>
                    ) : (
                      tool.is_enabled ? 'Disable' : 'Enable'
                    )}
                  </button>
                  <button 
                    onClick={() => handleDelete(tool.id)} 
                    className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
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
};

export default ToolsList;