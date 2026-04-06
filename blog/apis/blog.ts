import { API_BASE_URL, getHeaders } from './config';
import { BlogListResponse, BlogDetailResponse, CategoryCount } from '../types';

export const blogApi = {
  /** GET /blog — List published posts with pagination & filters */
  getPosts: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    tag?: string;
    q?: string;
    lang?: string;
    featured?: boolean;
  }): Promise<BlogListResponse> => {
    try {
      const qp = new URLSearchParams();
      if (params?.page) qp.append('page', String(params.page));
      if (params?.limit) qp.append('limit', String(params.limit));
      if (params?.category) qp.append('category', params.category);
      if (params?.tag) qp.append('tag', params.tag);
      if (params?.q) qp.append('q', params.q);
      if (params?.lang) qp.append('lang', params.lang);
      if (params?.featured) qp.append('featured', 'true');

      const url = `${API_BASE_URL}/blog${qp.toString() ? `?${qp.toString()}` : ''}`;
      const res = await fetch(url, { headers: getHeaders() });
      return await res.json();
    } catch (error) {
      console.error('Blog List Error:', error);
      return { success: false, data: [], pagination: { page: 1, limit: 12, total: 0, totalPages: 0 } };
    }
  },

  /** GET /blog/featured — Featured posts */
  getFeatured: async (): Promise<{ success: boolean; data: any[] }> => {
    try {
      const res = await fetch(`${API_BASE_URL}/blog/featured`, { headers: getHeaders() });
      return await res.json();
    } catch (error) {
      console.error('Blog Featured Error:', error);
      return { success: false, data: [] };
    }
  },

  /** GET /blog/categories — Categories with count */
  getCategories: async (): Promise<{ success: boolean; data: CategoryCount[] }> => {
    try {
      const res = await fetch(`${API_BASE_URL}/blog/categories`, { headers: getHeaders() });
      return await res.json();
    } catch (error) {
      console.error('Blog Categories Error:', error);
      return { success: false, data: [] };
    }
  },

  /** GET /blog/:slug — Post detail */
  getPost: async (slug: string): Promise<BlogDetailResponse> => {
    try {
      const res = await fetch(`${API_BASE_URL}/blog/${slug}`, { headers: getHeaders() });
      return await res.json();
    } catch (error) {
      console.error('Blog Detail Error:', error);
      return { success: false, data: null as any };
    }
  },
};
