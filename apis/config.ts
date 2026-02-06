
// Fixed: Defined and exported API_BASE_URL and getHeaders directly to resolve circular import issues
export const API_BASE_URL = 'https://api.skyverses.com';

export const getHeaders = () => {
  const token = localStorage.getItem('skyverses_auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

import { SystemConfig } from '../types';

export const systemConfigApi = {
  /**
   * Fetch system configurations including market home blocks
   * GET /config
   */
  getSystemConfig: async (): Promise<{ success: boolean; data: SystemConfig }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/config`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('System Config Fetch Error:', error);
      throw error;
    }
  }
};
