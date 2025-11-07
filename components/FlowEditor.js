import React, { useEffect, useMemo, useState } from "react";
import FunctionMultiSelect from "./FunctionMultiSelect";
import { flowsService } from "../lib/flowsService";

const DEFAULT_NODE = (id = "general_tools") => ({
  id,
  title: id,
  prompt:
    "You are in the general Tools state.\nUse ONLY the available functions shown to you to fulfill the user's request.\nAfter a tool call returns, summarize briefly. If the topic changes, call the router again.",
  functions: [],
  respond_immediately: true,
});

function toWire(node) {
  return {
    name: node.id,
    task_messages: [{ role: "system", content: (node.prompt || "").trim() }],
    functions: node.functions,
    respond_immediately: !!node.respond_immediately,
    meta: node.meta || {},
  };
}

function fromWire(node) {
  const sys = Array.isArray(node?.task_messages)
    ? node.task_messages.find((m) => m.role === "system")
    : null;
  return {
    id: node?.name || node?.id || "node",
    title: node?.title || node?.name || "node",
    prompt: sys?.content || "",
    functions: (node?.functions || [])
      .map((f) => (typeof f === "string" ? f : f?.name))
      .filter(Boolean),
    respond_immediately:
      typeof node?.respond_immediately === "boolean"
        ? node.respond_immediately
        : true,
    meta: node?.meta || {},
  };
}

export default function FlowEditor({ assistantId }) {
  const [name, setName] = useState("");
  const [nodes, setNodes] = useState([DEFAULT_NODE()]);
  const [initialId, setInitialId] = useState("general_tools");
  const [edges, setEdges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activating, setActivating] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const latest = await flowsService.latest(assistantId);
        if (!mounted || !latest) {
          setLoading(false);
          return;
        }
        const flow =
          latest.initial || latest.nodes || latest.edges ? latest : latest.flow;
        if (!flow) {
          setLoading(false);
          return;
        }
        const editable = Array.isArray(flow.nodes)
          ? flow.nodes.map(fromWire)
          : [DEFAULT_NODE()];
        setNodes(editable.length ? editable : [DEFAULT_NODE()]);
        setInitialId(flow.initial || editable[0]?.id || "general_tools");
        setEdges(Array.isArray(flow.edges) ? flow.edges : []);
      } catch {
        // use defaults
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [assistantId]);

  const initialValid = useMemo(() => {
    const ids = new Set(nodes.map((n) => n.id));
    return ids.has(initialId) ? initialId : nodes[0]?.id || "general_tools";
  }, [nodes, initialId]);

  const addNode = () => {
    const base = "node";
    let i = 1;
    let id = `${base}_${i}`;
    const ids = new Set(nodes.map((n) => n.id));
    while (ids.has(id)) {
      i += 1;
      id = `${base}_${i}`;
    }
    setNodes([...nodes, DEFAULT_NODE(id)]);
  };

  const removeNode = (id) => {
    const next = nodes.filter((n) => n.id !== id);
    setNodes(next.length ? next : [DEFAULT_NODE()]);
    if (initialId === id && next.length) setInitialId(next[0].id);
  };

  const updateNode = (id, patch) => {
    setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, ...patch } : n)));
  };

  const flowToSave = () => {
    const wireNodes = nodes.map(toWire);
    return {
      initial: initialValid,
      nodes: wireNodes,
      edges: edges || [],
    };
  };

  const doSave = async () => {
    setMsg("");
    setSaving(true);
    try {
      const payload = {
        flow: flowToSave(),
        name: name || "User Flow",
        version: 1,
      };
      const res = await flowsService.save(assistantId, payload);
      setMsg(
        res?.ok === false ? `Save failed: ${res.error || "error"}` : "Saved ✅"
      );
    } catch (e) {
      setMsg(`Save failed: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  const doActivate = async () => {
    setMsg("");
    setActivating(true);
    try {
      const res = await flowsService.activate(assistantId, {
        flow: flowToSave(),
      });
      setMsg(
        res?.ok === false
          ? `Activate failed: ${res.error || "error"}`
          : "Activated ✅"
      );
    } catch (e) {
      // Friendly message if backend doesn't have /api/flows/activate yet
      setMsg(
        `Activate failed: ${e.message}. If your backend is missing POST /api/flows/activate, add it or disable this button.`
      );
    } finally {
      setActivating(false);
    }
  };

  if (loading) {
    return <div className="p-4 text-gray-600">Loading flow editor…</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-4">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-[240px]">
          <label className="block text-sm font-medium mb-1">Flow name</label>
          <input
            className="w-full border rounded px-3 py-2"
            value={name}
            placeholder="e.g., Default Runtime Flow"
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="min-w-[240px]">
          <label className="block text-sm font-medium mb-1">Initial node</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={initialValid}
            onChange={(e) => setInitialId(e.target.value)}
          >
            {nodes.map((n) => (
              <option key={n.id} value={n.id}>
                {n.id}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={addNode}
          className="px-3 py-2 border rounded hover:bg-gray-50"
        >
          + Add node
        </button>
        {msg ? <div className="text-sm text-gray-700">{msg}</div> : null}
      </div>

      <div className="space-y-6">
        {nodes.map((node) => (
          <div key={node.id} className="border rounded p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Node ID</label>
                <input
                  className="w-full border rounded px-3 py-2"
                  value={node.id}
                  onChange={(e) =>
                    updateNode(node.id, {
                      id: e.target.value.trim() || node.id,
                    })
                  }
                />
              </div>
              <div className="pt-6">
                <button
                  type="button"
                  onClick={() => removeNode(node.id)}
                  className="px-3 py-2 border rounded hover:bg-gray-50"
                >
                  Remove
                </button>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">
                System prompt
              </label>
              <textarea
                className="w-full border rounded px-3 py-2 min-h-[120px]"
                value={node.prompt}
                onChange={(e) => updateNode(node.id, { prompt: e.target.value })}
              />
            </div>

            <div className="mt-4">
              <FunctionMultiSelect
                assistantId={assistantId}
                value={node.functions}
                onChange={(fns) => updateNode(node.id, { functions: fns })}
              />
            </div>

            <div className="mt-4 flex items-center gap-2">
              <input
                id={`ri_${node.id}`}
                type="checkbox"
                checked={!!node.respond_immediately}
                onChange={(e) =>
                  updateNode(node.id, { respond_immediately: e.target.checked })
                }
              />
              <label htmlFor={`ri_${node.id}`} className="text-sm">
                Respond immediately
              </label>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          onClick={doSave}
          disabled={saving}
          className="px-4 py-2 border rounded hover:bg-gray-50"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          onClick={doActivate}
          disabled={activating}
          className="px-4 py-2 border rounded hover:bg-gray-50"
        >
          {activating ? "Activating…" : "Activate"}
        </button>
      </div>
    </div>
  );
}
