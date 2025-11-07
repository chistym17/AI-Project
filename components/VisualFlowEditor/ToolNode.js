import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';

export default function ToolNode({ data, selected }) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      className={`relative transition-all duration-300 transform ${
        selected ? 'scale-105' : isHovered ? 'scale-102' : 'scale-100'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Glow effect for selected node */}
      {selected && (
        <div className="absolute inset-0 rounded-xl bg-green-500/20 blur-xl animate-pulse" />
      )}
      
      <div className={`relative bg-slate-800 rounded-xl border-2 shadow-2xl min-w-[240px] max-w-[280px] ${
        selected 
          ? 'border-green-500 shadow-green-500/20' 
          : isHovered 
            ? 'border-slate-600 shadow-slate-700/30'
            : 'border-slate-700 shadow-slate-900/50'
      } transition-all duration-300 cursor-pointer backdrop-blur-sm`}>
        
        <Handle
          type="target"
          position={Position.Top}
          className={`!w-3 !h-3 !border-2 transition-all duration-300 ${
            selected || isHovered
              ? '!bg-green-500 !border-slate-800 scale-125'
              : '!bg-slate-600 !border-slate-800'
          }`}
          style={{ top: -6 }}
        />
        
        {/* Header */}
        <div className={`px-4 py-3 rounded-t-xl transition-all duration-300 ${
          selected 
            ? 'bg-gradient-to-r from-green-600/20 to-purple-600/20 border-b border-green-500/30' 
            : 'bg-gradient-to-r from-slate-700/30 to-slate-700/20 border-b border-slate-700'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Node type icon */}
              <div className={`w-2 h-2 rounded-full animate-pulse ${
                selected ? 'bg-green-400' : 'bg-green-400'
              }`} />
              <h3 className="font-semibold text-sm text-slate-100 truncate">
                {data.title || data.id}
              </h3>
            </div>
            {/* Status indicator */}
            <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              data.respond_immediately 
                ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
            }`}>
              {data.respond_immediately ? 'Fast' : 'Wait'}
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="px-4 py-3">
          {/* Functions section */}
          {data.functions && data.functions.length > 0 ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Functions
                </span>
                <span className="text-xs text-slate-500 bg-slate-700/50 px-1.5 py-0.5 rounded">
                  {data.functions.length}
                </span>
              </div>
              <div className="space-y-1.5">
                {data.functions.slice(0, 3).map((func, index) => (
                  <div 
                    key={index} 
                    className="flex items-center gap-2 group"
                  >
                    <div className="w-1 h-1 bg-green-400 rounded-full group-hover:scale-150 transition-transform" />
                    <span className="text-xs text-slate-300 truncate font-mono">
                      {func}
                    </span>
                  </div>
                ))}
                {data.functions.length > 3 && (
                  <div className="text-xs text-slate-500 pl-3 italic">
                    +{data.functions.length - 3} more...
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-4">
              <div className="text-xs text-slate-600 italic">No functions configured</div>
            </div>
          )}
          
          {/* Prompt preview */}
          {data.prompt && (
            <div className="mt-3 pt-3 border-t border-slate-700/50">
              <div className="text-xs text-slate-500 mb-1 uppercase tracking-wider">Prompt</div>
              <div className="text-xs text-slate-400 line-clamp-2 opacity-70">
                {data.prompt}
              </div>
            </div>
          )}
        </div>
        
        {/* Footer status bar */}
        <div className="px-4 py-2 bg-slate-900/50 rounded-b-xl border-t border-slate-700/50">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                data.respond_immediately ? 'bg-green-400' : 'bg-yellow-400'
              } animate-pulse`} />
              <span className="text-slate-500">
                {data.respond_immediately ? 'Immediate' : 'Deferred'}
              </span>
            </div>
            <span className="text-slate-600 font-mono text-[10px]">
              {data.id}
            </span>
          </div>
        </div>
        
        <Handle
          type="source"
          position={Position.Bottom}
          className={`!w-3 !h-3 !border-2 transition-all duration-300 ${
            selected || isHovered
              ? '!bg-green-500 !border-slate-800 scale-125'
              : '!bg-slate-600 !border-slate-800'
          }`}
          style={{ bottom: -6 }}
        />
      </div>
    </div>
  );
}