// lib/apiService.js
import { useAuth } from './authContext';

// Hook to get authenticated API methods
export function useApiService() {
  const { apiFetch } = useAuth();

  return {
    // Generic methods
    async get(path) {
      const res = await apiFetch(path, { cache: "no-store" });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`API Error ${res.status}: ${errorText}`);
      }
      return res.json();
    },

    async post(path, body) {
      const res = await apiFetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`API Error ${res.status}: ${errorText}`);
      }
      return res.json();
    },

    async put(path, body) {
      const res = await apiFetch(path, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`API Error ${res.status}: ${errorText}`);
      }
      return res.json();
    },

    async delete(path) {
      const res = await apiFetch(path, {
        method: "DELETE",
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`API Error ${res.status}: ${errorText}`);
      }
      // DELETE might return 204 No Content
      if (res.status === 204) {
        return null;
      }
      return res.json();
    },

    // Assistant-specific methods
    async listAssistants() {
      return this.get('/assistants');
    },

    async getAssistant(id) {
      return this.get(`/assistants/${id}`);
    },

    async createAssistant(assistantData) {
      return this.post('/assistants', assistantData);
    },

    async updateAssistant(id, assistantData) {
      return this.put(`/assistants/${id}`, assistantData);
    },

    async deleteAssistant(id) {
      return this.delete(`/assistants/${id}`);
    },

    // Q&A methods
    async listQA(assistantId) {
      return this.get(`/assistants/${assistantId}/qa`);
    },

    async createQA(assistantId, qaData) {
      return this.post(`/assistants/${assistantId}/qa`, qaData);
    },

    async updateQA(assistantId, qaId, qaData) {
      return this.put(`/assistants/${assistantId}/qa/${qaId}`, qaData);
    },

    async deleteQA(assistantId, qaId) {
      return this.delete(`/assistants/${assistantId}/qa/${qaId}`);
    },

    // Tools methods
    async listTools(assistantId) {
      return this.get(`/assistants/${assistantId}/tools`);
    },

    async getTool(assistantId, toolId) {
      return this.get(`/assistants/${assistantId}/tools/${toolId}`);
    },

    async createTool(assistantId, toolData) {
      return this.post(`/assistants/${assistantId}/tools`, toolData);
    },

    async updateTool(assistantId, toolId, toolData) {
      return this.put(`/assistants/${assistantId}/tools/${toolId}`, toolData);
    },

    async deleteTool(assistantId, toolId) {
      return this.delete(`/assistants/${assistantId}/tools/${toolId}`);
    },

    async testTool(assistantId, toolId, testData = {}) {
      return this.post(`/assistants/${assistantId}/tools/${toolId}/test`, testData);
    },

    // Raw apiFetch for custom requests
    apiFetch
  };
}

// Legacy compatibility - non-hook version (use sparingly)
export const createApiService = (apiFetch) => {
  return {
    async get(path) {
      const res = await apiFetch(path, { cache: "no-store" });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`API Error ${res.status}: ${errorText}`);
      }
      return res.json();
    },

    async post(path, body) {
      const res = await apiFetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`API Error ${res.status}: ${errorText}`);
      }
      return res.json();
    },

    async put(path, body) {
      const res = await apiFetch(path, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`API Error ${res.status}: ${errorText}`);
      }
      return res.json();
    },

    async delete(path) {
      const res = await apiFetch(path, {
        method: "DELETE",
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`API Error ${res.status}: ${errorText}`);
      }
      if (res.status === 204) {
        return null;
      }
      return res.json();
    },

    apiFetch
  };
};