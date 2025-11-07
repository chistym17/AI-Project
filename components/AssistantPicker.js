// for voice agent

import React, { useEffect, useState } from "react";
import { apiGet, apiPost } from "../lib/api";

export default function AssistantPicker({ onChange }) {
    const [list, setList] = useState([]);
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                // requires GET /api/assistants (see note below)
                const items = await apiGet("/assistants");
                if (!mounted) return;
                setList(items);
                const saved = typeof window !== "undefined" ? localStorage.getItem("assistant_id") : null;
                const initial =
                    saved && items.find((a) => a.id === saved)
                        ? saved
                        : items[0]?.id || null;
                setSelected(initial);
                onChange(initial);
            } catch {
                // Fallback: create a default assistant if listing isn't available yet
                const created = await apiPost("/assistants", {
                    name: "Sunrise Café",
                    description: "Default assistant",
                });
                if (!mounted) return;
                setList([created]);
                setSelected(created.id);
                onChange(created.id);
                if (typeof window !== "undefined") {
                    localStorage.setItem("assistant_id", created.id);
                }
            } finally {
                mounted = false;
                setLoading(false);
            }
        })();
    }, [onChange]);

    function handleChange(e) {
        const id = e.target.value || null;
        setSelected(id);
        onChange(id);
        if (typeof window !== "undefined") {
            if (id) localStorage.setItem("assistant_id", id);
            else localStorage.removeItem("assistant_id");
        }
    }

    if (loading) return <div className="text-sm opacity-70">Loading assistant…</div>;

    return (
        <div className="flex items-center gap-2">
            <label className="text-sm">Assistant:</label>
            <select
                value={selected ?? ""}
                onChange={handleChange}
                className="border rounded px-2 py-1"
            >
                {list.map((a) => (
                    <option key={a.id} value={a.id}>
                        {a.name}
                    </option>
                ))}
            </select>
        </div>
    );
}
