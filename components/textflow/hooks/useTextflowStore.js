// components/textflow/hooks/useTextflowStore.js
import { create } from "zustand";

export const useTextflowStore = create((set) => ({
  theme: "system",
  flow: { id: null, name: "Untitled Text Flow", nodes: [], edges: [], entryNodeId: null },
  selection: null,
  consoleLines: [],
  runId: null,

  setTheme: (t) => set({ theme: t }),
  setFlow: (up) => set((s) => ({ flow: { ...s.flow, ...up } })),
  setNodes: (nodes) => set((s) => ({ flow: { ...s.flow, nodes } })),
  setEdges: (edges) => set((s) => ({ flow: { ...s.flow, edges } })),
  setSelection: (id) => set({ selection: id }),
  appendConsole: (line) => set((s) => ({ consoleLines: [...s.consoleLines, line] })),
  clearConsole: () => set({ consoleLines: [] }),
  setRunId: (id) => set({ runId: id }),
}));