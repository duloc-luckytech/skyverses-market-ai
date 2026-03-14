
import { API_BASE_URL, getHeaders } from './config';

export interface ProviderToken {
  _id: string;
  provider: "labs" | "wan" | "gommo";
  isActive: boolean;
  ownerId?: string | null;
  plan?: string;
  note?: string;
  email?: string;
  accessToken?: string;
  cookieToken?: string;
  apiKey?: string;
  lastActiveAt?: string;
  errorCount: number;
  cooldownUntil?: string;
  createdAt: string;
  updatedAt: string;
  credits?: number;
  expires?: string;
}

export interface ProviderTokenRequest {
  provider: "labs" | "wan" | "gommo";
  isActive?: boolean;
  ownerId?: string | null;
  plan?: string;
  note?: string;
  email?: string;
  accessToken?: string;
  cookieToken?: string;
  apiKey?: string;
  credits?: number;
  expires?: string;
}

export const providerTokensApi = {
  /**
   * Lấy danh sách token với các bộ lọc
   */
  getList: async (params: { provider?: string; email?: string; isActive?: boolean }): Promise<{ success: boolean; data: ProviderToken[] }> => {
    try {
      const query = new URLSearchParams();
      if (params.provider) query.append('provider', params.provider);
      if (params.email) query.append('email', params.email);
      if (params.isActive !== undefined) query.append('isActive', String(params.isActive));

      const response = await fetch(`${API_BASE_URL}/providerToken/list?${query.toString()}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('ProviderToken List Error:', error);
      return { success: false, data: [] };
    }
  },

  /**
   * Tạo token mới
   */
  create: async (payload: ProviderTokenRequest): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/providerToken/create`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: 'Network error' };
    }
  },

  /**
   * Cập nhật token hiện có
   */
  update: async (id: string, payload: Partial<ProviderTokenRequest>): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/providerToken/update`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ id, ...payload }),
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: 'Network error' };
    }
  }
};
