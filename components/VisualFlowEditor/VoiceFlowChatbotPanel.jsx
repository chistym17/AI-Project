// components/flows/VoiceFlowChatbotPanel.jsx - FIXED INFINITE LOOP
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Bot, Send, Loader, Minimize2, Maximize2, Trash2, Download, AlertCircle, CheckCircle, Sparkles } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://esapdev.xyz:7000/agentbuilder/api';

export default function VoiceFlowChatbotPanel({
  assistantId,
  currentFlow,
  onApplyFlow,
  onPreviewFlow,
  sessionId,
  isMinimized,
  onToggleMinimize
}) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '👋 Hi! I\'m your Voice Flow Designer. I can help you create conversational voice flows.\n\nTell me what kind of conversation flow you need, and I\'ll generate it for you!',
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [contextSet, setContextSet] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // FIX: Memoize the context setting function
  const setContextInBackground = useCallback(async () => {
    if (!assistantId && !currentFlow) return;
    
    try {
      console.log('Setting context...', { assistantId, hasFlow: !!currentFlow });
      await fetch(`${API_BASE}/voice-flow-chatbot/set-context`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          assistant_id: assistantId,
          current_flow: currentFlow
        })
      });
      console.log('✓ Context set successfully');
      setContextSet(true);
    } catch (e) {
      console.warn('Context setting failed:', e);
    }
  }, [assistantId, sessionId]); // FIX: Remove currentFlow from dependencies

  // FIX: Only set context once on mount if assistantId exists
  useEffect(() => {
    if (assistantId && !contextSet) {
      console.log('Initial context setup for assistant:', assistantId);
      setContextInBackground();
    }
  }, [assistantId, contextSet, setContextInBackground]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setError(null);

    // Add user message
    setMessages(prev => [...prev, {
      role: 'user',
      content: userMessage,
      timestamp: Date.now()
    }]);

    setLoading(true);

    try {
      // Set context with current flow before sending message
      if (currentFlow) {
        await fetch(`${API_BASE}/voice-flow-chatbot/set-context`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_id: sessionId,
            assistant_id: assistantId,
            current_flow: currentFlow
          })
        });
      }

      const response = await fetch(`${API_BASE}/voice-flow-chatbot/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          session_id: sessionId,
          assistant_id: assistantId,
          current_flow: currentFlow
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success && data.flow) {
        // Add success message with flow
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.explanation,
          flow: data.flow,
          tools: data.tools || [],
          warnings: data.warnings || [],
          suggestions: data.suggestions || [],
          timestamp: Date.now()
        }]);
      } else {
        // Add error message
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.error || 'Failed to generate flow. Please try again.',
          isError: true,
          timestamp: Date.now()
        }]);
      }
    } catch (e) {
      console.error('Chat error:', e);
      setError(e.message);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Error: ${e.message}\n\nPlease try again or rephrase your request.`,
        isError: true,
        timestamp: Date.now()
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleApply = (msg) => {
    if (onApplyFlow && msg.flow) {
      // Pass both flow AND tools to the handler
      onApplyFlow(msg.flow, msg.tools || []);
      setMessages(prev => [...prev, {
        role: 'system',
        content: '✅ Flow applied to canvas successfully!',
        timestamp: Date.now()
      }]);
    }
  };

  const handleClearHistory = async () => {
    if (!confirm('Clear conversation history?')) return;

    try {
      await fetch(`${API_BASE}/voice-flow-chatbot/clear-history?session_id=${sessionId}`, {
        method: 'POST'
      });
      setMessages([{
        role: 'assistant',
        content: 'History cleared. Let\'s start fresh! What flow do you want to create?',
        timestamp: Date.now()
      }]);
      setContextSet(false); // Reset context flag
    } catch (e) {
      console.error('Clear history error:', e);
    }
  };

  const exportFlow = (flow) => {
    const blob = new Blob([JSON.stringify(flow, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voice_flow_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Minimized view
  if (isMinimized) {
    return (
      <button
        onClick={onToggleMinimize}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-200 hover:scale-110"
      >
        <Bot className="w-6 h-6" />
        {loading && (
          <div className="absolute -top-1 -right-1 w-4 h-4">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </button>
    );
  }

  return (
    <div className="h-full rounded-2xl bg-gradient-to-br from-gray-900 to-slate-900 border border-gray-700/50 shadow-2xl flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border-b border-gray-700/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">AI Flow Designer</h3>
            <p className="text-xs text-gray-400">Conversational Voice Flows</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleClearHistory}
            className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
            title="Clear history"
          >
            <Trash2 className="w-4 h-4 text-gray-400" />
          </button>
          <button
            onClick={onToggleMinimize}
            className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
            title="Minimize"
          >
            <Minimize2 className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-xl p-3 ${
              msg.role === 'user' 
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                : msg.role === 'system'
                  ? 'bg-green-600/20 text-green-300 border border-green-600/30'
                  : msg.isError
                    ? 'bg-red-600/20 text-red-300 border border-red-600/30'
                    : 'bg-gray-800 text-gray-200 border border-gray-700'
            }`}>
              {/* Message content */}
              <div className="text-sm whitespace-pre-wrap">{msg.content}</div>

              {/* Warnings */}
              {msg.warnings && msg.warnings.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <div className="flex items-center gap-2 text-xs text-yellow-400 mb-2">
                    <AlertCircle className="w-3 h-3" />
                    <span>Warnings</span>
                  </div>
                  <ul className="space-y-1">
                    {msg.warnings.map((warning, i) => (
                      <li key={i} className="text-xs text-yellow-300">• {warning}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Suggestions */}
              {msg.suggestions && msg.suggestions.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <div className="flex items-center gap-2 text-xs text-green-400 mb-2">
                    <Sparkles className="w-3 h-3" />
                    <span>Suggestions</span>
                  </div>
                  <ul className="space-y-1">
                    {msg.suggestions.map((suggestion, i) => (
                      <li key={i} className="text-xs text-green-300">• {suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Flow actions */}
              {msg.flow && (
                <div className="mt-3 pt-3 border-t border-gray-700 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <CheckCircle className="w-3 h-3 text-green-400" />
                    <span>Flow generated: {msg.flow.nodes?.length || 0} nodes, {msg.flow.edges?.length || 0} edges</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApply(msg)}
                      className="flex-1 px-3 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1"
                    >
                      <CheckCircle className="w-3 h-3" />
                      Apply to Canvas
                    </button>
                    <button
                      onClick={() => exportFlow(msg.flow)}
                      className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-xs transition-all"
                      title="Export flow"
                    >
                      <Download className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}

              {/* Tools */}
              {msg.tools && msg.tools.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <div className="flex items-center gap-2 text-xs text-purple-400 mb-2">
                    <Sparkles className="w-3 h-3" />
                    <span>{msg.tools.length} Tool{msg.tools.length > 1 ? 's' : ''} Suggested</span>
                  </div>
                  <div className="space-y-2">
                    {msg.tools.map((tool, i) => (
                      <div key={i} className="bg-gray-900/50 rounded-lg p-2 border border-gray-700">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="text-xs font-medium text-white">{tool.name}</div>
                            <div className="text-xs text-gray-400 mt-0.5">{tool.description}</div>
                            <div className="text-xs text-gray-500 mt-1">{tool.method} • {tool.endpoint_url}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    💡 Tools will be created when you apply the flow. Enable and verify them in Tool Management.
                  </div>
                </div>
              )}

              <div className="text-xs text-gray-500 mt-2">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 rounded-xl p-3 border border-gray-700">
              <div className="flex items-center gap-2">
                <Loader className="w-4 h-4 text-indigo-400 animate-spin" />
                <span className="text-sm text-gray-300">Generating flow...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error display */}
      {error && (
        <div className="px-4 py-2 bg-red-600/20 border-y border-red-600/30 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span className="text-xs text-red-300 flex-1">{error}</span>
          <button
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-300"
          >
            ×
          </button>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-gray-700/50 bg-gray-900/50">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Describe your flow... (e.g., 'Create a real estate assistant flow')"
            className="flex-1 px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
          <span>💡 Try: "Create a flow for my café assistant"</span>
          <span>{input.length}/500</span>
        </div>
      </div>
    </div>
  );
}