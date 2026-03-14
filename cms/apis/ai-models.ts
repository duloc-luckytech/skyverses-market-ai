
import { API_BASE_URL, getHeaders } from './config';

export interface AIModel {
  _id: string;
  key: string;
  name: string;
  logoUrl: string;
  route: string;
  description?: string;
  provider?: string;
  category?: string;
  order: number;
  status: 'active' | 'inactive' | 'draft';
}

export interface AIModelRequest {
  key: string;
  name: string;
  logoUrl: string;
  route: string;
  description?: string;
  provider?: string;
  category?: string;
  order?: number;
  status?: string;
}

export const aiModelsApi = {
  /**
   * Lấy danh sách AI models
   */
  getModels: async (): Promise<{ data: AIModel[] }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/ai-model/`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('AI Models Fetch Error:', error);
      return { data: [] };
    }
  },

  /**
   * Tạo model mới
   */
  createModel: async (payload: AIModelRequest): Promise<{ success: boolean; data?: AIModel; message?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/ai-model/`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: 'Network connection failed' };
    }
  },

  /**
   * Cập nhật model
   */
  updateModel: async (id: string, payload: Partial<AIModelRequest>): Promise<{ success: boolean; data?: AIModel; message?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/ai-model/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: 'Network connection failed' };
    }
  },

  /**
   * Thay đổi trạng thái model
   */
  toggleStatus: async (id: string, status: string): Promise<{ success: boolean; data?: AIModel }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/ai-model/${id}/status`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ status }),
      });
      return await response.json();
    } catch (error) {
      return { success: false };
    }
  },

  /**
   * Xóa model
   */
  deleteModel: async (id: string): Promise<{ success: boolean }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/ai-model/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      return { success: false };
    }
  }
};
