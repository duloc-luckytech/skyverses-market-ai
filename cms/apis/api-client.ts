import { API_BASE_URL, getHeaders } from './config';

export interface ApiClient {
  _id: string;
  email: string;
  name: string;
  plan?: string;
  creditBalance: number;
  role: string;
  apiToken?: string;
  apiTokenFull?: string;
  hasToken: boolean;
  tokenExpired?: boolean;
  apiTokenCreatedAt?: string;
  apiTokenExpiresAt?: string;
  createdAt?: string;
  lastActiveAt?: string;
  fxflowOwner?: string;
  avatar?: string;
}

export interface ApiClientListResponse {
  success: boolean;
  data: ApiClient[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiClientStats {
  success: boolean;
  totalClients: number;
  activeTokens: number;
  pendingTasks: number;
  totalTasks: number;
}

export const apiClientApi = {
  /** GET /api-client/stats */
  getStats: async (): Promise<ApiClientStats> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api-client/stats`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('API Client Stats Error:', error);
      return { success: false, totalClients: 0, activeTokens: 0, pendingTasks: 0, totalTasks: 0 };
    }
  },

  /** GET /api-client/list */
  getList: async (params: { page?: number; pageSize?: number; search?: string }): Promise<ApiClientListResponse> => {
    try {
      const query = new URLSearchParams();
      if (params.page) query.append('page', params.page.toString());
      if (params.pageSize) query.append('pageSize', params.pageSize.toString());
      if (params.search) query.append('search', params.search);

      const response = await fetch(`${API_BASE_URL}/api-client/list?${query.toString()}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('API Client List Error:', error);
      throw error;
    }
  },

  /** POST /api-client/create-customer */
  createCustomer: async (payload: { email: string; name?: string; plan?: string; creditBalance?: number; generateToken?: boolean; tokenExpiresIn?: number }): Promise<any> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api-client/create-customer`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: 'Connection failed' };
    }
  },

  /** POST /api-client/generate-token */
  generateToken: async (userId: string, tokenExpiresIn?: number): Promise<any> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api-client/generate-token`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ userId, tokenExpiresIn }),
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: 'Connection failed' };
    }
  },

  /** POST /api-client/revoke-token */
  revokeToken: async (userId: string): Promise<any> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api-client/revoke-token`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ userId }),
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: 'Connection failed' };
    }
  },

  /** PATCH /api-client/token-expiry — Update expiry WITHOUT regen token */
  updateTokenExpiry: async (userId: string, tokenExpiresIn: number | null): Promise<any> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api-client/token-expiry`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ userId, tokenExpiresIn }),
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: 'Connection failed' };
    }
  },
};

