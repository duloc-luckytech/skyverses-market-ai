

// Fixed: Defined and exported API_BASE_URL and getHeaders directly to resolve circular import issues
export const API_BASE_URL = 'http://localhost:3221';

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
