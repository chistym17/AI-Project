// pages/assistants/[id]/text-flows.js
import dynamic from "next/dynamic";
import { useRouter } from "next/router";

const Editor = dynamic(
  () => import("../../../components/textflow/components/TextFlowEditor.js"), 
  { ssr: false }
);

export default function TextFlowsPage() {
  const router = useRouter();
  const { id } = router.query; // Extract assistantId from query

  // Don't render until we have the assistantId from the router
  if (!router.isReady || !id) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
          <div className="text-sm text-gray-500">Loading editor...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Editor handles its own WebSocket connection and UI */}
      <Editor assistantId={id} />
    </div>
  );
}