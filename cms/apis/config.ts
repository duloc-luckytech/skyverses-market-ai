
// API URL: prioritize env var, then auto-detect based on environment
function getApiBaseUrl(): string {
  // 1. Vite env var (set via .env or build-time)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // 2. Production: same host, port 5302
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return `${window.location.protocol}//${window.location.hostname}:5302`;
  }

  // 3. Local dev fallback
  return 'http://localhost:3221';
}

export const API_BASE_URL = getApiBaseUrl();

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
