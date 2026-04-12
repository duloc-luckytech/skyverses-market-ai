

// API URL: prioritize env var, then auto-detect based on environment
function getApiBaseUrl(): string {
  // 1. Vite env var
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

// Explorer API: use local backend when in dev, live API in production
const isLocalDev = API_BASE_URL.includes('localhost') || API_BASE_URL.includes('127.0.0.1');
export const EXPLORER_BASE_URL = isLocalDev ? API_BASE_URL : 'https://api.skyverses.com';

/**
 * Returns the correct explorer URL based on environment
 * @example getExplorerUrl('image', 1, 20) → http://localhost:3221/explorer?page=1&limit=20&type=image
 */
export const getExplorerUrl = (type: 'image' | 'video', page: number, limit: number) =>
  `${EXPLORER_BASE_URL}/explorer?page=${page}&limit=${limit}&type=${type}`;

export const getHeaders = () => {
  const token = localStorage.getItem('skyverses_auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

import { SystemConfig } from '../types';
import { apiCache } from '../utils/apiCache';

export const systemConfigApi = {
  /**
   * Fetch system configurations including market home blocks
   * GET /config
   */
  getSystemConfig: async (): Promise<{ success: boolean; data: SystemConfig }> => {
    return apiCache.wrap('system:config', async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/config`, {
          method: 'GET',
          headers: getHeaders(),
        });
        return await response.json();
      } catch (error) {
        console.error('System Config Fetch Error:', error);
        return { success: false, data: {} as SystemConfig };
      }
    }, 5 * 60 * 1000); // 5 min TTL
  }
};
