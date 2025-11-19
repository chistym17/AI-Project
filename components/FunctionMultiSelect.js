import React, { useEffect, useMemo, useState } from "react";
import { toolsService } from "../lib/toolsService";

// Static tool names; extend as needed.
const STATIC_TOOL_NAMES = [
  "recall_memory",
];

export default function FunctionMultiSelect({
  assistantId,
  value = [],
  onChange,
  className = "text-white",
}) {
  const [dynNames, setDynNames] = useState([]);
  const [loading, setLoading] = useState(false);

  const allOptions = useMemo(() => {
    const set = new Set([
      ...STATIC_TOOL_NAMES,
      ...dynNames.map((t) => t?.name).filter(Boolean),
    ]);
    return Array.from(set).sort();
  }, [dynNames]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const rows = await toolsService.listTools(assistantId);
        if (!mounted) return;
        setDynNames(Array.isArray(rows) ? rows : []);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [assistantId]);

  const toggle = (name) => {
    const exists = value.includes(name);
    const next = exists ? value.filter((n) => n !== name) : [...value, name];
    onChange?.(next);
  };

  const selectAll = () => onChange?.(allOptions);
  const clearAll = () => onChange?.([]);

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2 gap-2">
        <div className="text-sm font-medium text-white">Functions</div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={selectAll}
            className="px-2 py-1 text-xs border rounded text-white hover:bg-gray-900"
          >
            Select all
          </button>
          <button
            type="button"
            onClick={clearAll}
            className="px-2 py-1 text-xs border rounded text-white hover:bg-gray-900"
          >
            Clear
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-xs text-gray-500">Loading tools…</div>
      ) : null}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-56 overflow-auto border rounded p-2">
        {allOptions.map((name) => (
          <label key={name} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={value.includes(name)}
              onChange={() => toggle(name)}
            />
            <span className="truncate text-white">{name}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
