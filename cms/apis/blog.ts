import { API_BASE_URL, getHeaders } from './config';

export const blogApi = {
  /** GET /blog/admin/all — List all posts including drafts (admin) */
  getAll: async (): Promise<{ success: boolean; data: any[]; total: number }> => {
    try {
      const res = await fetch(`${API_BASE_URL}/blog/admin/all`, { headers: getHeaders() });
      return await res.json();
    } catch (error) {
      console.error('Blog Admin List Error:', error);
      return { success: false, data: [], total: 0 };
    }
  },

  /** GET /blog/admin/:id — Get single post for editing */
  getById: async (id: string): Promise<{ success: boolean; data: any }> => {
    try {
      const res = await fetch(`${API_BASE_URL}/blog/admin/${id}`, { headers: getHeaders() });
      return await res.json();
    } catch (error) {
      console.error('Blog Admin Detail Error:', error);
      return { success: false, data: null };
    }
  },

  /** POST /blog — Create new post */
  create: async (payload: any): Promise<{ success: boolean; data?: any }> => {
    try {
      const res = await fetch(`${API_BASE_URL}/blog`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      return await res.json();
    } catch (error) {
      console.error('Blog Create Error:', error);
      return { success: false };
    }
  },

  /** PUT /blog/:id — Update post */
  update: async (id: string, payload: any): Promise<{ success: boolean; data?: any }> => {
    try {
      const res = await fetch(`${API_BASE_URL}/blog/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      return await res.json();
    } catch (error) {
      console.error('Blog Update Error:', error);
      return { success: false };
    }
  },

  /** DELETE /blog/:id — Delete post */
  delete: async (id: string): Promise<{ success: boolean }> => {
    try {
      const res = await fetch(`${API_BASE_URL}/blog/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      return await res.json();
    } catch (error) {
      console.error('Blog Delete Error:', error);
      return { success: false };
    }
  },

  /** POST /blog/:id/publish — Toggle publish */
  togglePublish: async (id: string, isPublished: boolean): Promise<{ success: boolean; data?: any }> => {
    try {
      const res = await fetch(`${API_BASE_URL}/blog/${id}/publish`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ isPublished }),
      });
      return await res.json();
    } catch (error) {
      console.error('Blog Publish Error:', error);
      return { success: false };
    }
  },
};
