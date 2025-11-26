import React, { useState, useEffect } from "react";
import { Key, Trash2, AlertCircle, CheckCircle, X } from "lucide-react";
import { listCredentials, deleteCredential } from "../api/credentialsApi";

export default function CredentialsPanel({ assistantId, refreshKey = 0 }) {
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadCredentials = async () => {
    if (!assistantId) {
      console.log('No assistantId provided');
      return;
    }
    
    try {
      setLoading(true);
      setError("");
      console.log('Loading credentials for assistant:', assistantId);
      const data = await listCredentials(assistantId);
      console.log('Loaded credentials:', data);
      setCredentials(data);
    } catch (err) {
      const errorMsg = err.message || 'Failed to load credentials';
      setError(errorMsg);
      console.error('Failed to load credentials:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (assistantId) {
      loadCredentials();
    }
  }, [assistantId, refreshKey]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleDelete = async (credId) => {
    if (!window.confirm("Delete this credential? This cannot be undone.")) return;
    
    try {
      console.log('Deleting credential:', credId);
      await deleteCredential(credId);
      setSuccess("Credential deleted");
      await loadCredentials();
    } catch (err) {
      const errorMsg = err.message || 'Failed to delete credential';
      setError(errorMsg);
      console.error('Failed to delete credential:', err);
    }
  };

  // Show loading state if no assistantId
  if (!assistantId) {
    return (
      <div 
        className="h-full flex items-center justify-center"
        style={{
          background: 'rgba(255, 255, 255, 0.04)'
        }}
      >
        <div className="text-center">
          <div 
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 mx-auto"
            style={{
              background: 'rgba(255, 255, 255, 0.08)'
            }}
          >
            <Key className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-sm font-medium text-white">No assistant selected</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1a1a1a;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #404040;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #525252;
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #404040 #1a1a1a;
        }
        select option {
          background: rgba(20, 25, 35, 0.95);
          color: white;
        }
      `}</style>
      
      {/* Content */}
      <div className={`flex-1 px-6 py-4 space-y-3 ${credentials.length > 0 ? 'overflow-y-auto custom-scrollbar' : 'overflow-hidden'}`}>
        {/* Alerts */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-red-300 flex-1">{error}</span>
            <button onClick={() => setError("")} className="text-red-400 hover:text-red-300 flex-shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex items-start gap-3">
            <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-emerald-300">{success}</span>
          </div>
        )}

        {/* Credentials List */}
        {loading && credentials.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-sm text-gray-500">Loading credentials...</div>
          </div>
        ) : credentials.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div 
              className="w-10 h-10 rounded-2xl flex items-center justify-center mb-4"
              style={{
                background: 'rgba(255, 255, 255, 0.08)'
              }}
            >
              <Key className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-white mb-1">No credentials</p>
            <p className="text-xs text-gray-400">Create one to get started</p>
          </div>
        ) : (
          <div className="overflow-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] uppercase tracking-wide text-[#8FA0B1] border-b border-white/5">
                  <th className="px-2 py-2 font-semibold text-[#C7D2DC]">Name</th>
                  <th className="px-2 py-2 font-semibold text-[#C7D2DC]">Key Name</th>
                  <th className="px-2 py-2 font-semibold text-[#C7D2DC]">Location</th>
                  <th className="px-2 py-2 font-semibold text-[#C7D2DC]">Key Value</th>
                  <th className="px-2 py-2 font-semibold text-[#C7D2DC] text-right">Delete</th>
                </tr>
              </thead>
              <tbody>
                {credentials.map((cred, index) => {
                  const rawData = cred.data || {};
                  const redactedData = cred.data_redacted || {};

                  const resolveField = (...keys) => {
                    for (const key of keys) {
                      if (rawData[key]) return rawData[key];
                    }
                    for (const key of keys) {
                      if (redactedData[key]) return redactedData[key];
                    }
                    return "—";
                  };

                  const keyName = resolveField("key_name", "username", "client_id");
                  const resolvedLocation = resolveField("location");
                  const location =
                    resolvedLocation === "—" && cred.credential_type === "bearer"
                      ? "header"
                      : resolvedLocation;
                  const keyValue = resolveField(
                    "key_value",
                    "token",
                    "password",
                    "access_token",
                    "refresh_token"
                  );

                  return (
                    <tr
                      key={cred.credential_id}
                      className={`text-[11px] text-white/80 ${
                        index !== credentials.length - 1 ? "border-b border-white/5" : ""
                      }`}
                    >
                      <td className="px-2 py-2">
                        <div className="flex flex-col">
                          <span className="font-semibold text-white/90 leading-tight">{cred.name}</span>
                          <span className="text-[10px] text-white/50 capitalize">
                            {cred.credential_type.replace("_", " ")}
                          </span>
                        </div>
                      </td>
                      <td className="px-2 py-2 text-white/70">{keyName}</td>
                      <td className="px-2 py-2 text-white/70 capitalize">{location}</td>
                      <td className="px-2 py-2 text-white/70 font-mono">
                        {keyValue}
                      </td>
                      <td className="px-2 py-2 text-right">
                        <button
                          onClick={() => handleDelete(cred.credential_id)}
                          className="inline-flex items-center justify-center p-1.5 rounded-lg text-[#FF6B6B] hover:bg-[#FF6B6B]/15 transition-colors"
                          title="Delete credential"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}