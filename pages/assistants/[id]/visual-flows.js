import React from "react";
import { useRouter } from "next/router";
import VisualFlowEditor from "../../../components/VisualFlowEditor";

export default function VisualFlowsPage() {
  const router = useRouter();
  const { id } = router.query;

  if (!id) {
    return <div className="p-4 text-gray-600">Loading…</div>;
  }

  return (
    <div className="h-screen bg-gray-50">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">Visual Flow Editor</h1>
            <button 
              onClick={() => router.push(`/assistants/${id}`)}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
            >
              Back to Assistant
            </button>
          </div>
        </div>
        
        {/* Editor */}
        <div className="flex-1">
          <VisualFlowEditor assistantId={id} />
        </div>
      </div>
    </div>
  );
}
