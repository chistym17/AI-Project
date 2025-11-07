import React, { useMemo, useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Play, AlertTriangle } from 'lucide-react';
import { useApiService } from '../lib/apiService'; // Use authenticated API service
import { validateToolConfig } from '../lib/toolValidation';

const ChecklistItem = ({ ok, text }) => (
  <div className={`flex items-center text-sm ${ok ? 'text-emerald-700' : 'text-red-600'}`}>
    {ok ? <CheckCircle2 size={16} className="mr-2" /> : <XCircle size={16} className="mr-2" />}
    {text}
  </div>
);

const ToolVerifyPanel = ({ assistantId, tool, onVerified }) => {
  const [body, setBody] = useState('{}');
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  
  // Use authenticated API service instead of toolsService
  const apiService = useApiService();

  const loadExistingNames = async () => {
    try {
      const tools = await apiService.listTools(assistantId);
      return tools.map(t => t.name).filter(n => n !== tool.name);
    } catch (error) {
      console.error('Failed to load existing tool names:', error);
      return [];
    }
  };

  const [existingNames, setExistingNames] = useState([]);
  const validation = useMemo(() => validateToolConfig(tool, existingNames), [tool, existingNames]);

  useEffect(() => {
    const loadNames = async () => {
      const names = await loadExistingNames();
      setExistingNames(names);
    };
    loadNames();
  }, [assistantId, tool.name]);

  const headerEntries = useMemo(() => Object.entries(tool.headers || {}), [tool.headers]);

  const runTest = async () => {
    setRunning(true); setError(null); setResult(null);
    try {
      let init = { method: tool.method, headers: tool.headers || {} };
      if (tool.method !== 'GET' && body && body.trim()) {
        init.body = body;
        if (!init.headers['Content-Type']) init.headers['Content-Type'] = 'application/json';
      }
      const start = performance.now();
      const res = await fetch(tool.endpoint_url, init);
      const duration = Math.round(performance.now() - start);
      const contentType = res.headers.get('content-type') || '';
      let json = null, text = null;
      if (contentType.includes('application/json')) {
        try { json = await res.json(); } catch { }
      } else {
        try { text = await res.text(); } catch { }
      }
      setResult({ status: res.status, ok: res.ok, duration, contentType, json, text });
    } catch (e) {
      setError(String(e));
    } finally {
      setRunning(false);
    }
  };

  const passed = validation.ok && result && result.ok && (!tool.output_schema || (result.json && typeof result.json === 'object'));

  const saveVerification = async () => {
    setSaving(true);
    try {
      const updated = {
        ...tool,
        is_verified: passed, // Changed from complex verification object
      };
      
      if (tool.id) {
        // Use authenticated API service instead of toolsService
        await apiService.updateTool(assistantId, tool.id, updated);
      }
      
      onVerified?.(updated);
    } catch (error) {
      console.error('Failed to save verification:', error);
      alert('Failed to save verification result');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="border rounded p-4 bg-gray-50">
        <h4 className="font-semibold text-gray-800 mb-3">Request Preview</h4>
        <div className="text-sm text-gray-700 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <div className="text-gray-500 text-xs mb-1">Method</div>
            <div className="inline-block px-2 py-1 rounded bg-white border text-sm">{tool.method}</div>
          </div>
          <div className="md:col-span-2">
            <div className="text-gray-500 text-xs mb-1">URL</div>
            <div className="px-2 py-1 rounded bg-white border truncate text-sm" title={tool.endpoint_url}>{tool.endpoint_url}</div>
          </div>
        </div>
        <div className="mt-3 text-sm text-gray-700">
          <div className="text-gray-500 text-xs mb-1">Headers</div>
          {headerEntries.length === 0 ? (
            <div className="px-2 py-1 rounded bg-white border inline-block text-gray-500 text-xs">None</div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {headerEntries.map(([k, v]) => (
                <div key={k} className="px-2 py-1 rounded bg-white border text-xs">
                  <span className="text-gray-500 mr-1">{k}:</span>
                  <span className="text-gray-800">{String(v)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="border rounded p-4 bg-white">
        <h4 className="font-semibold text-gray-800 mb-3">Test Tool</h4>
        <div className="text-sm text-gray-600 mb-2">Provide a sample request body (JSON) if your method is not GET.</div>
        <textarea className="w-full border px-3 py-2 rounded font-mono text-xs" rows={4} value={body} onChange={e => setBody(e.target.value)} />
        <div className="mt-3">
          <button disabled={running} onClick={runTest} className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:opacity-50 inline-flex items-center">
            <Play size={16} className="mr-2" /> {running ? 'Running...' : 'Run Test'}
          </button>
        </div>
        {error && (
          <div className="mt-3 text-sm text-red-600 flex items-center"><AlertTriangle size={16} className="mr-2" /> {error}</div>
        )}
      </div>

      <div className="flex gap-6">
        <div className="flex-1 border rounded p-4 bg-white">
          <h4 className="font-semibold text-gray-800 mb-3">Verification Checks</h4>
          <div className="space-y-2">
            <ChecklistItem ok={validation.errors.length === 0} text={`Config & schema basics (${validation.errors.length === 0 ? 'ok' : 'issues'})`} />
            <ChecklistItem ok={!!result && result.ok} text={`Live call succeeded (2xx)`} />
            <ChecklistItem ok={!tool.output_schema || (!!result && !!result.json && typeof result.json === 'object')} text={`Response JSON (when output schema provided)`} />
            {validation.errors.length > 0 && (
              <div className="text-xs text-red-600 mt-2 space-y-1">
                {validation.errors.map((e, idx) => (<div key={idx}>• {e}</div>))}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 border rounded p-4 bg-white">
          <h4 className="font-semibold text-gray-800 mb-3">Test Results</h4>
          {result ? (
            <div className="text-sm text-gray-700 space-y-2">
              <div className="flex justify-between">
                <span>Status:</span>
                <span className={result.ok ? 'text-emerald-600' : 'text-red-600'}>
                  {result.status} {result.ok ? '(OK)' : '(Error)'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Latency:</span>
                <span>{result.duration} ms</span>
              </div>
              <div className="flex justify-between">
                <span>Content-Type:</span>
                <span className="text-xs">{result.contentType || 'n/a'}</span>
              </div>
              <div className="mt-3">
                <div className="font-medium text-xs mb-1">Response Body:</div>
                <pre className="bg-gray-50 border rounded p-2 overflow-auto max-h-32 text-xs">
{result.json ? JSON.stringify(result.json, null, 2) : (result.text || '')}
                </pre>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-500">Run a test to see the response here.</div>
          )}
        </div>
      </div>

      {/* Action Bar */}
      <div className="pt-4 border-t flex items-center justify-between bg-white p-4 rounded">
        <div className={`text-sm ${passed ? 'text-emerald-700' : 'text-gray-500'}`}>
          {passed ? '🎉 All checks passed! Click "Mark as Verified" to proceed.' : 'Complete the checks to proceed.'}
        </div>
        <button 
          onClick={saveVerification} 
          disabled={saving}
          className={`px-4 py-2 rounded ${passed ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-gray-200 text-gray-600 cursor-pointer'} disabled:opacity-50`}
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2 inline"></div>
              Saving...
            </>
          ) : (
            passed ? '✅ Mark as Verified' : 'Save Verification Result'
          )}
        </button>
      </div>
    </div>
  );
};

export default ToolVerifyPanel;