
import { API_BASE_URL, getHeaders } from './config';

export interface PromoBanner {
  _id: string;
  tag: string;
  heroTitle: string;
  heroHighlight: string;
  heroDesc: string;
  title: string;
  desc: string;
  cta: string;
  link: string;
  imageUrl: string;
  active: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export type PromoBannerRequest = Omit<PromoBanner, '_id' | 'createdAt' | 'updatedAt'>;

export const promoBannersApi = {
  getAll: async (): Promise<{ success: boolean; data: PromoBanner[] }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/promo-banners/admin/all`, {
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('Fetch PromoBanners Error:', error);
      return { success: false, data: [] };
    }
  },

  create: async (payload: Partial<PromoBannerRequest>): Promise<{ success: boolean; data?: PromoBanner; message?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/promo-banners`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: 'Connection failed' };
    }
  },

  update: async (id: string, payload: Partial<PromoBannerRequest>): Promise<{ success: boolean; data?: PromoBanner; message?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/promo-banners/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: 'Connection failed' };
    }
  },

  toggle: async (id: string): Promise<{ success: boolean; active: boolean }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/promo-banners/${id}/toggle`, {
        method: 'PATCH',
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      return { success: false, active: false };
    }
  },

  delete: async (id: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/promo-banners/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: 'Connection failed' };
    }
  },
};
