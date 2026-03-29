
import { API_BASE_URL, getHeaders } from './config';

export interface ProductSubmissionItem {
  _id: string;
  productName: string;
  productSlug: string;
  category: string;
  complexity: string;
  shortDescription: string;
  fullDescription: string;
  demoType: string;
  tags: string[];
  thumbnailUrl: string;
  galleryUrls: string[];
  demoUrl: string;
  priceCredits: number;
  isFree: boolean;
  platforms: string[];
  aiModels: string[];
  features: string[];
  apiEndpoint: string;
  documentation: string;
  creatorId: string;
  creatorName: string;
  creatorEmail: string;
  creatorStudio: string;
  creatorWebsite: string;
  creatorTelegram: string;
  additionalNotes: string;
  status: 'pending' | 'reviewing' | 'approved' | 'rejected' | 'published';
  adminFeedback: string;
  reviewedBy: string;
  reviewedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubmissionStats {
  total: number;
  pending: number;
  reviewing: number;
  approved: number;
  rejected: number;
  published: number;
}

export const productSubmissionApi = {
  /**
   * Get all submissions with optional filters
   * GET /product-submission?status=...&q=...
   */
  getAll: async (params?: {
    status?: string;
    category?: string;
    q?: string;
  }): Promise<{ success: boolean; data: ProductSubmissionItem[]; stats: SubmissionStats }> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.status && params.status !== 'all') queryParams.append('status', params.status);
      if (params?.category) queryParams.append('category', params.category);
      if (params?.q) queryParams.append('q', params.q);

      const url = `${API_BASE_URL}/product-submission${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('Submissions Fetch Error:', error);
      return { success: false, data: [], stats: { total: 0, pending: 0, reviewing: 0, approved: 0, rejected: 0, published: 0 } };
    }
  },

  /**
   * Review a submission (update status + feedback)
   * PUT /product-submission/:id/review
   */
  review: async (id: string, payload: {
    status: string;
    adminFeedback?: string;
  }): Promise<{ success: boolean; data?: ProductSubmissionItem; message?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/product-submission/${id}/review`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      return await response.json();
    } catch (error) {
      console.error('Submission Review Error:', error);
      return { success: false, message: 'Network error' };
    }
  },

  /**
   * Delete a submission
   * DELETE /product-submission/:id
   */
  delete: async (id: string): Promise<{ success: boolean }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/product-submission/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('Submission Delete Error:', error);
      return { success: false };
    }
  },
};
