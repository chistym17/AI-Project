// components/textflow/components/TriggerManager.js (NEW)
// Combines Credentials and Trigger Logs in one tabbed interface
import React, { useState } from "react";
import { X, Key, Activity } from "lucide-react";
import CredentialsPanel from "./CredentialsPanel";
import TriggerLogsPanel from "./TriggerLogsPanel";

export default function TriggerManager({ assistantId, onClose }) {
  const [activeTab, setActiveTab] = useState("credentials");

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
            <h2 className="text-sm font-semibold text-white/90">Trigger Management</h2>
            <p className="text-[11px] text-white/50">Manage credentials & monitor trigger activity</p>
          </div>
          <button
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center text-white/60 hover:text-white transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 pb-2 flex gap-1">
          <button
            onClick={() => setActiveTab("credentials")}
            className={`px-2 py-1 text-[10px] font-semibold rounded-md transition-all flex items-center gap-1 ${
              activeTab === "credentials"
                ? "bg-[rgba(19,245,132,0.08)] text-[#9EFBCD]"
                : "text-white/60 hover:text-white/80"
            }`}
          >
            <Key className="w-2.5 h-2.5 opacity-80" />
            Credentials
          </button>
          <button
            onClick={() => setActiveTab("logs")}
            className={`px-2 py-1 text-[10px] font-semibold rounded-md transition-all flex items-center gap-1 ${
              activeTab === "logs"
                ? "bg-[rgba(19,245,132,0.08)] text-[#9EFBCD]"
                : "text-white/60 hover:text-white/80"
            }`}
          >
            <Activity className="w-2.5 h-2.5 opacity-80" />
            Trigger Logs
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto px-6 pb-6 template-scroll">
          {activeTab === "credentials" && (
            <CredentialsPanel assistantId={assistantId} />
          )}
          {activeTab === "logs" && (
            <TriggerLogsPanel assistantId={assistantId} />
          )}
        </div>
      </div>
    </div>
  );
}