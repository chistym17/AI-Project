// components/textflow/components/ConditionTester.js
import React, { useState } from "react";
import jmespath from "jmespath";
import Editor from "@monaco-editor/react";
import { Play, CheckCircle, XCircle } from "lucide-react";

export default function ConditionTester() {
  const [expr, setExpr] = useState("output.status == `200`");
  const [jsonIn, setJsonIn] = useState('{"output":{"status":200,"body":{"ok":true}}}');
  const [result, setResult] = useState("");
  const [error, setError] = useState(false);

  const run = () => {
    try {
      const input = JSON.parse(jsonIn);
      const out = jmespath.search(input, expr);
      setResult(JSON.stringify(out));
      setError(false);
    } catch (e) {
      setResult(String(e?.message || e));
      setError(true);
    }
  };

  return (
    <div className="space-y-3">
      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-4 border border-indigo-200/50">
        <div className="text-xs font-semibold text-indigo-700 mb-2 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
          JMESPath Expression
        </div>
        <div className="bg-white rounded-lg border border-indigo-200/50 overflow-hidden">
          <Editor 
            height="90px" 
            defaultLanguage="javascript" 
            value={expr} 
            onChange={(v)=>setExpr(v || "")} 
            options={{ 
              minimap:{enabled:false}, 
              fontSize:12,
              lineNumbers: "off",
              scrollBeyondLastLine: false,
            }} 
          />
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 border border-gray-200/50">
        <div className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span>
          Input JSON
        </div>
        <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
          <Editor 
            height="120px" 
            defaultLanguage="json" 
            value={jsonIn} 
            onChange={(v)=>setJsonIn(v || "{}")} 
            options={{ 
              minimap:{enabled:false}, 
              fontSize:12,
              lineNumbers: "off",
              scrollBeyondLastLine: false,
            }} 
          />
        </div>
      </div>

      <button 
        className="w-full px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-lg text-sm font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2" 
        onClick={run}
      >
        <Play className="w-4 h-4" />
        Test Condition
      </button>

      {result && (
        <div className={`rounded-xl p-4 border ${
          error 
            ? 'bg-red-50 border-red-200/50' 
            : 'bg-emerald-50 border-emerald-200/50'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            {error ? (
              <>
                <XCircle className="w-4 h-4 text-red-600" />
                <span className="text-xs font-semibold text-red-700">Error</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-semibold text-emerald-700">Result</span>
              </>
            )}
          </div>
          <pre className={`text-xs font-mono overflow-auto p-3 rounded-lg ${
            error ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
          }`}>
            {result}
          </pre>
        </div>
      )}
    </div>
  );
}