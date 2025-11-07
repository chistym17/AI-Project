// components/textflow/components/ConsolePanel.js
import React from "react";
import { useTextflowStore } from "../hooks/useTextflowStore";
import { Activity, X } from "lucide-react";

export default function ConsolePanel() {
  const lines = useTextflowStore((s) => s.consoleLines);
  const clearConsole = useTextflowStore((s) => s.clearConsole);

  return (
    <div className="h-full bg-gradient-to-br from-slate-900 to-gray-900 rounded-xl border border-gray-700/50 overflow-hidden flex flex-col shadow-xl">
      <div className="px-4 py-3 bg-gray-800/50 border-b border-gray-700/50 flex items-center justify-between backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-semibold text-gray-100">Console</span>
          <span className="text-xs text-gray-400 bg-gray-700/50 px-2 py-0.5 rounded-full">
            {lines.length} {lines.length === 1 ? 'log' : 'logs'}
          </span>
        </div>
        <button
          onClick={clearConsole}
          className="text-xs text-gray-400 hover:text-white transition-colors px-2 py-1 hover:bg-gray-700/50 rounded-md flex items-center gap-1"
        >
          <X className="w-3 h-3" />
          Clear
        </button>
      </div>
      
      <div className="flex-1 overflow-auto p-3 space-y-1 font-mono text-xs">
        {lines.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-gray-500">
              <Activity className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <div className="text-sm">No logs yet</div>
              <div className="text-xs mt-1">Run your flow to see activity</div>
            </div>
          </div>
        ) : (
          lines.map((l, i) => (
            <div 
              key={i} 
              className={`px-3 py-2 rounded-lg transition-all ${
                l.kind === 'error' 
                  ? 'bg-red-500/10 text-red-300 border-l-2 border-red-500' 
                  : l.kind === 'chunk'
                  ? 'bg-blue-500/10 text-blue-300 border-l-2 border-blue-500'
                  : 'bg-gray-800/50 text-gray-300 border-l-2 border-gray-600'
              }`}
            >
              <div className="flex items-start gap-2">
                <span className="text-gray-500 text-[10px] leading-5 flex-shrink-0">
                  {new Date(l.ts).toLocaleTimeString()}
                </span>
                <span className="flex-1">{l.text}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}