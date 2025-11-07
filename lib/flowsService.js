import { apiGet, apiPost } from "./api";

export const flowsService = {
  async list(assistantId) {
    return apiGet(`/flows/${assistantId}`);
  },

  async latest(assistantId) {
    const data = await apiGet(`/flows/${assistantId}/latest`);
    // backend returns a row; flow lives in `flow_json`
    return data?.flow_json || data?.flow || data || null;
  },

  async save(assistantId, { flow, name, version, createdBy } = {}) {
    // backend expects assistant_id & flow_json in body
    return apiPost(`/flows`, {
      assistant_id: assistantId,
      flow_json: flow,
      name,
      version,
      created_by: createdBy,
    });
  },

  async activate(assistantId, { flow } = {}) {
    // Only works if you implement POST /api/flows/activate server-side.
    // If not implemented, this will throw and your UI will show the error.
    return apiPost(`/flows/activate`, {
      assistant_id: assistantId,
      flow_json: flow,
    });
  },
};
