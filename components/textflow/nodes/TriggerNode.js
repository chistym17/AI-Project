// components/textflow/nodes/TriggerNode.js (NEW)
import React from "react";
import { Handle, Position } from "reactflow";
import { useTextflowStore } from "../hooks/useTextflowStore.js";
import { Target, Webhook, Clock, Play } from "lucide-react";

export default function TriggerNode({ id, data, selected }) {
  const setSelection = useTextflowStore((s) => s.setSelection);
  const config = data?.config || {};
  const triggerKind = config.kind || "manual";

  // Choose icon based on trigger type
  const Icon = triggerKind === "webhook" ? Webhook : triggerKind === "schedule" ? Clock : Target;
  
  // Choose color scheme
  const colorScheme = {
    webhook: {
      gradient: "from-blue-500 to-cyan-600",
      border: "border-blue-500/30",
      glow: "shadow-blue-500/20",
      text: "text-blue-400"
    },
    schedule: {
      gradient: "from-purple-500 to-pink-600",
      border: "border-purple-500/30",
      glow: "shadow-purple-500/20",
      text: "text-purple-400"
    },
    manual: {
      gradient: "from-gray-500 to-slate-600",
      border: "border-gray-500/30",
      glow: "shadow-gray-500/20",
      text: "text-gray-400"
    }
  };

  const colors = colorScheme[triggerKind] || colorScheme.manual;

  return (
    <div
      onClick={() => setSelection(id)}
      className={`px-4 py-3 min-w-[200px] rounded-xl border-2 ${colors.border} bg-gradient-to-br from-gray-800 to-gray-900 shadow-lg cursor-pointer transition-all hover:shadow-xl hover:${colors.glow} ${
        selected ? "ring-2 ring-indigo-500 ring-offset-2 ring-offset-gray-950" : ""
      }`}
    >
      <div className="flex items-center gap-2 mb-1">
        <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${colors.gradient} flex items-center justify-center shadow-lg ${colors.glow}`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <div className={`text-[10px] uppercase tracking-wide ${colors.text} font-semibold`}>
          {triggerKind} trigger
        </div>
      </div>
      <div className="font-medium text-white text-sm">{data?.label || "Trigger"}</div>
      <div className="text-[10px] text-gray-400 mt-0.5 capitalize">
        {triggerKind === "webhook" && "🌐 HTTP POST"}
        {triggerKind === "schedule" && "⏰ Cron Schedule"}
        {triggerKind === "manual" && "▶️ Manual"}
      </div>
      
      {/* Only target handle (triggers are entry points) */}
      <Handle type="source" position={Position.Right} className={`!bg-blue-500 !w-3 !h-3 !border-2 !border-gray-900`} />
    </div>
  );
}