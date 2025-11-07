// Flow API endpoints for the flows editor.
// Uses NEXT_PUBLIC_API_BASE (e.g., http://localhost:8000/api).
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://esapdev.xyz:7000/agentbuilder/api";

export const FLOW_ENDPOINTS = {
  list: (assistantId) => `${API_BASE}/flows/${assistantId}`,
  latest: (assistantId) => `${API_BASE}/flows/${assistantId}/latest`,
  // Save matches backend POST /api/flows (assistant_id in body)
  save: () => `${API_BASE}/flows`,
  // Activate route — only works if you add this endpoint in backend.
  // If you haven't added an activate endpoint yet, the front-end will
  // show a friendly error.
  activate: () => `${API_BASE}/flows/activate`,
};

export default FLOW_ENDPOINTS;
