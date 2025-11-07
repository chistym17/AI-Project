import React from "react";
import { useRouter } from "next/router";
import FlowEditor from "../../../components/FlowEditor";

export default function AssistantFlowsPage() {
  const router = useRouter();
  const { id } = router.query;

  if (!id) {
    return <div className="p-4 text-gray-600">Loading…</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Flow Editor</h1>
      <FlowEditor assistantId={id} />
    </div>
  );
}
