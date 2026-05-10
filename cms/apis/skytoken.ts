
import { API_BASE_URL, getHeaders } from './config';

export const cmsSkytokenApi = {
  getWithdrawals: async (params: { status?: string; page?: number; limit?: number }) => {
    try {
      const query = new URLSearchParams();
      if (params.status) query.set('status', params.status);
      if (params.page) query.set('page', String(params.page));
      if (params.limit) query.set('limit', String(params.limit));
      const response = await fetch(`${API_BASE_URL}/skytoken/admin/withdrawals?${query}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('Fetch withdrawals error:', error);
      return { success: false };
    }
  },

  approveWithdrawal: async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/skytoken/admin/withdrawal/${id}/approve`, {
        method: 'PATCH',
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('Approve withdrawal error:', error);
      return { success: false };
    }
  },

  rejectWithdrawal: async (id: string, adminNote: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/skytoken/admin/withdrawal/${id}/reject`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ adminNote }),
      });
      return await response.json();
    } catch (error) {
      console.error('Reject withdrawal error:', error);
      return { success: false };
    }
  },

  completeWithdrawal: async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/skytoken/admin/withdrawal/${id}/complete`, {
        method: 'PATCH',
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('Complete withdrawal error:', error);
      return { success: false };
    }
  },
};
