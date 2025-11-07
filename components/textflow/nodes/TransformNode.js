import React from "react";
import { Handle, Position } from "reactflow";
import { useTextflowStore } from "../hooks/useTextflowStore.js";
import { Zap } from "lucide-react";

export default function TransformNode({ id, data, selected }) {
  const setSelection = useTextflowStore((s) => s.setSelection);
  return (
    <div
      onClick={() => setSelection(id)}
      className={`px-4 py-3 min-w-[200px] rounded-xl border-2 border-amber-500/30 bg-gradient-to-br from-gray-800 to-gray-900 shadow-lg cursor-pointer transition-all hover:shadow-xl hover:shadow-amber-500/20 ${
        selected ? "ring-2 ring-indigo-500 ring-offset-2 ring-offset-gray-950" : ""
      }`}
    >
      <div className="flex items-center gap-2 mb-1">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/25">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <div className="text-[10px] uppercase tracking-wide text-amber-400 font-semibold">TRANSFORM</div>
      </div>
      <div className="font-medium text-white text-sm">{data?.label || "Transform"}</div>
      <div className="text-[10px] text-gray-400 mt-0.5">Data processing</div>
      <Handle type="target" position={Position.Left} className="!bg-amber-500 !w-3 !h-3 !border-2 !border-gray-900" />
      <Handle type="source" position={Position.Right} className="!bg-amber-500 !w-3 !h-3 !border-2 !border-gray-900" />
    </div>
  );
}