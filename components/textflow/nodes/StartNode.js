import React from "react";
import { Handle, Position } from "reactflow";
import { useTextflowStore } from "../hooks/useTextflowStore.js";
import { Play } from "lucide-react";

export default function StartNode({ id, data, selected }) {
  const setSelection = useTextflowStore((s) => s.setSelection);
  return (
    <div
      onClick={() => setSelection(id)}
      className={`px-4 py-3 min-w-[220px] rounded-xl border-2 bg-gradient-to-br from-gray-800 to-gray-900 shadow-lg cursor-pointer transition-all hover:shadow-2xl ${
        selected 
          ? "ring-2 ring-indigo-500 ring-offset-2 ring-offset-gray-950 scale-105 shadow-emerald-500/25" 
          : "hover:scale-102 border-emerald-500/50"
      }`}
      style={{
        borderColor: selected ? '#10b981' : '#10b98140'
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
          <Play className="w-4 h-4 text-white" />
        </div>
        <div className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold">START</div>
      </div>
      <div className="font-semibold text-white">{data?.label || "Flow Entry Point"}</div>
      <div className="text-[10px] text-emerald-400/70 mt-1">Begin execution here</div>
      <Handle 
        type="source" 
        position={Position.Right} 
        className="!bg-emerald-500 !w-3 !h-3 !border-2 !border-gray-900"
      />
    </div>
  );
}