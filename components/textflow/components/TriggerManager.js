// components/textflow/components/TriggerManager.js (NEW)
// Combines Credentials and Trigger Logs in one tabbed interface
import React, { useState } from "react";
import { X, Key, Activity } from "lucide-react";
import CredentialsPanel from "./CredentialsPanel";
import TriggerLogsPanel from "./TriggerLogsPanel";

export default function TriggerManager({ assistantId, onClose }) {
  const [activeTab, setActiveTab] = useState("credentials");

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 to-slate-900 rounded-2xl border border-gray-700/50 shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-700/50 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Trigger Management</h2>
            <p className="text-sm text-gray-400 mt-1">Manage credentials and monitor trigger activity</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            title="Close"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 py-3 bg-gray-800/30 border-b border-gray-700/50">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("credentials")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === "credentials"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-750 hover:text-gray-300"
              }`}
            >
              <Key className="w-4 h-4" />
              Credentials
            </button>
            <button
              onClick={() => setActiveTab("logs")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === "logs"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-750 hover:text-gray-300"
              }`}
            >
              <Activity className="w-4 h-4" />
              Trigger Logs
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden p-6">
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