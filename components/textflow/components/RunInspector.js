import React, { useEffect, useState } from "react";
import { getSteps } from "../api/textflowApi";
import { useTextflowStore } from "../hooks/useTextflowStore";

export default function RunInspector() {
  const runId = useTextflowStore((s) => s.runId);
  const [steps, setSteps] = useState([]);

  useEffect(() => {
    if (!runId) return;
    (async () => { setSteps(await getSteps(runId)); })();
  }, [runId]);

  if (!runId) return <div className="text-sm text-gray-500">No active run.</div>;

  return (
    <div className="space-y-2">
      <div className="text-xs text-gray-500">Run: {runId}</div>
      {steps.map((s) => (
        <div key={s.step_id} className="border rounded p-2">
          <div className="text-xs">{s.node_id} — {s.status}</div>
          <pre className="text-[11px] overflow-auto">{JSON.stringify(s.output, null, 2)}</pre>
        </div>
      ))}
    </div>
  );
}
