import { API_BASE_URL, getHeaders } from './config';
import { ExplorerItem } from '../components/ExplorerDetailModal';

export const explorerApi = {
  /**
   * Lấy toàn bộ danh sách Explorer Items
   */
  getItems: async (params?: { type?: string; search?: string }): Promise<{ success: boolean; data: ExplorerItem[]; pagination?: any }> => {
    try {
      const query = new URLSearchParams(params as any).toString();
      const response = await fetch(`${API_BASE_URL}/explorer?${query}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      const json = await response.json();
      
      // Nếu server trả về { data: [...] } mà không có success: true
      if (json && json.data) {
        return { success: true, data: json.data, pagination: json.pagination };
      }
      
      return json;
    } catch (error) {
      console.error('Explorer Fetch Error:', error);
      return { success: false, data: [] };
    }
  },

  /**
   * Cập nhật thông tin một item
   */
  updateItem: async (id: string, payload: Partial<ExplorerItem>): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/explorer/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: 'Uplink failed' };
    }
  },

  /**
   * Xóa vĩnh viễn một item khỏi showcase
   */
  deleteItem: async (id: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/explorer/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: 'Purge failed' };
    }
  },

  /**
   * Đăng ký một item mới vào Explorer chuẩn BE schema
   */
  createItem: async (payload: any): Promise<{ success: boolean; data?: ExplorerItem; message?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/explorer`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: 'Creation failed' };
    }
  },

  /**
   * Duyệt tác phẩm (Approve)
   */
  approveItem: async (id: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/explorer/${id}/approve`, {
        method: 'POST',
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: 'Approval failed' };
    }
  },

  /**
   * Từ chối tác phẩm (Reject)
   */
  rejectItem: async (id: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/explorer/${id}/reject`, {
        method: 'POST',
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: 'Rejection failed' };
    }
  }
};