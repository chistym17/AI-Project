import { API_ENDPOINTS } from '../config/api';

// Tools API service
export const toolsService = {
  // List all tools for an assistant
  async listTools(assistantId) {
    try {
      const response = await fetch(API_ENDPOINTS.TOOLS_LIST(assistantId));
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error('Failed to list tools:', error);
      return [];
    }
  },

  // Get a specific tool
  async getTool(assistantId, toolId) {
    try {
      const response = await fetch(API_ENDPOINTS.TOOLS_GET(assistantId, toolId));
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error('Failed to get tool:', error);
      throw error;
    }
  },

  // Create a new tool
  async createTool(assistantId, toolData) {
    try {
      const response = await fetch(API_ENDPOINTS.TOOLS_CREATE(assistantId), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toolData),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error('Failed to create tool:', error);
      throw error;
    }
  },

  // Update an existing tool
  async updateTool(assistantId, toolId, toolData) {
    try {
      const response = await fetch(API_ENDPOINTS.TOOLS_UPDATE(assistantId, toolId), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toolData),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error('Failed to update tool:', error);
      throw error;
    }
  },

  // Delete a tool
  async deleteTool(assistantId, toolId) {
    try {
      const response = await fetch(API_ENDPOINTS.TOOLS_DELETE(assistantId, toolId), {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      return true;
    } catch (error) {
      console.error('Failed to delete tool:', error);
      throw error;
    }
  },

  // Test a tool
  async testTool(assistantId, toolId, testData = {}) {
    try {
      const response = await fetch(API_ENDPOINTS.TOOLS_TEST(assistantId, toolId), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error('Failed to test tool:', error);
      throw error;
    }
  },

  // Toggle tool enabled status
  async toggleToolEnabled(assistantId, toolId, enabled) {
    try {
      const tool = await this.getTool(assistantId, toolId);
      const updatedTool = { ...tool, is_enabled: enabled };
      return await this.updateTool(assistantId, toolId, updatedTool);
    } catch (error) {
      console.error('Failed to toggle tool enabled status:', error);
      throw error;
    }
  },
}; 