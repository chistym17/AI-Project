// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://esapdev.xyz:7000/agentbuilder';

export const API_ENDPOINTS = {
  ASSISTANTS: `${API_BASE_URL}/api/assistants`,
  ASSISTANT: (id) => `${API_BASE_URL}/api/assistants/${id}`,
  MENU: `${API_BASE_URL}/api/menu`,
  ORDERS: `${API_BASE_URL}/api/orders`,
  // Q&A endpoints
  QA_LIST: (assistantId) => `${API_BASE_URL}/api/assistants/${assistantId}/qa`,
  QA_CREATE: (assistantId) => `${API_BASE_URL}/api/assistants/${assistantId}/qa`,
  QA_GET: (assistantId, qaId) => `${API_BASE_URL}/api/assistants/${assistantId}/qa/${qaId}`,
  QA_UPDATE: (assistantId, qaId) => `${API_BASE_URL}/api/assistants/${assistantId}/qa/${qaId}`,
  QA_DELETE: (assistantId, qaId) => `${API_BASE_URL}/api/assistants/${assistantId}/qa/${qaId}`,
  // Tools endpoints
  TOOLS_LIST: (assistantId) => `${API_BASE_URL}/api/assistants/${assistantId}/tools`,
  TOOLS_CREATE: (assistantId) => `${API_BASE_URL}/api/assistants/${assistantId}/tools`,
  TOOLS_GET: (assistantId, toolId) => `${API_BASE_URL}/api/assistants/${assistantId}/tools/${toolId}`,
  TOOLS_UPDATE: (assistantId, toolId) => `${API_BASE_URL}/api/assistants/${assistantId}/tools/${toolId}`,
  TOOLS_DELETE: (assistantId, toolId) => `${API_BASE_URL}/api/assistants/${assistantId}/tools/${toolId}`,
  TOOLS_TEST: (assistantId, toolId) => `${API_BASE_URL}/api/assistants/${assistantId}/tools/${toolId}/test`,
};

export default API_BASE_URL; 