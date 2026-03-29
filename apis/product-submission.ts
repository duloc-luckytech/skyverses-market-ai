
import { API_BASE_URL, getHeaders } from './config';

export interface ProductSubmissionPayload {
  productName: string;
  productSlug: string;
  category: string;
  complexity: string;
  shortDescription: string;
  fullDescription: string;
  demoType: string;
  tags: string;
  thumbnailUrl: string;
  galleryUrls: string;
  demoUrl: string;
  priceCredits: string;
  isFree: boolean;
  platforms: string[];
  aiModels: string;
  features: string;
  apiEndpoint: string;
  documentation: string;
  creatorName: string;
  creatorEmail: string;
  creatorStudio: string;
  creatorWebsite: string;
  creatorTelegram: string;
  additionalNotes: string;
}

export const productSubmissionApi = {
  /**
   * Submit a product for review
   * POST /product-submission
   */
  submit: async (payload: ProductSubmissionPayload): Promise<{ success: boolean; data?: any; message?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/product-submission`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      return await response.json();
    } catch (error) {
      console.error('Product Submission Error:', error);
      return { success: false, message: 'Network error' };
    }
  },

  /**
   * Get current user's submissions
   * GET /product-submission/mine
   */
  getMySubmissions: async (): Promise<{ success: boolean; data: any[] }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/product-submission/mine`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('My Submissions Fetch Error:', error);
      return { success: false, data: [] };
    }
  },
};
