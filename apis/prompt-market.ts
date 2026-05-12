import { API_BASE_URL, getHeaders } from './config';
import type { PromptSet, PromptPurchase, PromptReview, LocalizedString, PromptItem, SellerProfile, PromptWishlistItem, AIModel, PromptExample } from '../types';

export interface PromptMarketListParams {
  q?: string;
  category?: string;
  tags?: string;
  models?: string;
  media?: 'all' | 'image' | 'video' | 'image_video';
  price?: 'all' | 'free' | 'paid';
  rating?: string;
  featured?: boolean;
  sort?: 'newest' | 'popular' | 'price_low' | 'price_high';
  page?: number;
  limit?: number;
}

export interface PromptSetCreatePayload {
  title: Partial<LocalizedString>;
  description?: Partial<LocalizedString>;
  category?: string;
  tags?: string[];
  coverImage?: string;
  priceSKT: number;
  isFree?: boolean;
  prompts: PromptItem[];
  previewText?: string;
  models?: AIModel[];
  examples?: PromptExample[];
}

export const promptMarketApi = {
  /* ─── Browse ─── */
  list: async (
    params: PromptMarketListParams = {}
  ): Promise<{
    data: PromptSet[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }> => {
    try {
      const qs = new URLSearchParams();
      if (params.q) qs.set('q', params.q);
      if (params.category) qs.set('category', params.category);
      if (params.tags) qs.set('tags', params.tags);
      if (params.models) qs.set('models', params.models);
      if (params.media && params.media !== 'all') qs.set('media', params.media);
      if (params.price && params.price !== 'all') qs.set('price', params.price);
      if (params.rating && params.rating !== 'any') qs.set('rating', params.rating);
      if (params.featured) qs.set('featured', 'true');
      if (params.sort) qs.set('sort', params.sort);
      if (params.page) qs.set('page', String(params.page));
      if (params.limit) qs.set('limit', String(params.limit));

      const response = await fetch(
        `${API_BASE_URL}/prompt-market?${qs.toString()}`,
        { method: 'GET', headers: getHeaders() }
      );
      return await response.json();
    } catch {
      return { data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } };
    }
  },

  getBySlug: async (slug: string): Promise<{ data: PromptSet | null }> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/prompt-market/detail/${slug}`,
        { method: 'GET', headers: getHeaders() }
      );
      return await response.json();
    } catch {
      return { data: null };
    }
  },

  purchase: async (
    id: string
  ): Promise<{ success: boolean; skyTokenBalance?: number; message?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/prompt-market/${id}/purchase`, {
        method: 'POST',
        headers: getHeaders(),
      });
      return await response.json();
    } catch {
      return { success: false, message: 'Network failed' };
    }
  },

  /* ─── Buyer ─── */
  getMyPurchases: async (
    page: number = 1,
    limit: number = 20
  ): Promise<{
    data: PromptPurchase[];
    pagination: { page: number; limit: number; total: number };
  }> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/prompt-market/my-purchases?page=${page}&limit=${limit}`,
        { method: 'GET', headers: getHeaders() }
      );
      return await response.json();
    } catch {
      return { data: [], pagination: { page: 1, limit: 20, total: 0 } };
    }
  },

  getMyPurchaseDetail: async (
    id: string
  ): Promise<{ data: { purchase: PromptPurchase; promptSet: PromptSet } | null }> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/prompt-market/my-purchases/${id}`,
        { method: 'GET', headers: getHeaders() }
      );
      return await response.json();
    } catch {
      return { data: null };
    }
  },

  /* ─── Seller ─── */
  create: async (
    payload: PromptSetCreatePayload
  ): Promise<{ success: boolean; data?: PromptSet; message?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/prompt-market/sell`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      return await response.json();
    } catch {
      return { success: false, message: 'Network failed' };
    }
  },

  update: async (
    id: string,
    payload: Partial<PromptSetCreatePayload>
  ): Promise<{ success: boolean; data?: PromptSet; message?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/prompt-market/sell/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      return await response.json();
    } catch {
      return { success: false, message: 'Network failed' };
    }
  },

  remove: async (id: string): Promise<{ success: boolean }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/prompt-market/sell/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      return await response.json();
    } catch {
      return { success: false };
    }
  },

  getMyListings: async (): Promise<{ data: PromptSet[] }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/prompt-market/my-listings`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return await response.json();
    } catch {
      return { data: [] };
    }
  },

  getMyEarnings: async (): Promise<{
    totalSales: number;
    totalEarned: number;
    recentSales: Array<{
      _id: string;
      pricePaid: number;
      sellerReceived: number;
      buyerId: { _id: string; name: string; avatar?: string };
      promptSetId: { _id: string; title: { en: string }; slug: string };
      createdAt: string;
    }>;
  }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/prompt-market/my-earnings`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return await response.json();
    } catch {
      return { totalSales: 0, totalEarned: 0, recentSales: [] };
    }
  },

  /* ─── Featured / Trending ─── */
  getFeatured: async (
    limit: number = 8
  ): Promise<{ data: PromptSet[] }> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/prompt-market?sort=popular&limit=${limit}&featured=true`,
        { method: 'GET', headers: getHeaders() }
      );
      const res = await response.json();
      return { data: res.data ?? [] };
    } catch {
      return { data: [] };
    }
  },

  /* ─── Check if already purchased ─── */
  checkPurchased: async (
    promptSetId: string
  ): Promise<{ purchased: boolean; purchaseId?: string }> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/prompt-market/${promptSetId}/check-purchased`,
        { method: 'GET', headers: getHeaders() }
      );
      return await response.json();
    } catch {
      return { purchased: false };
    }
  },

  /* ─── Related prompts ─── */
  getRelated: async (
    slug: string,
    limit: number = 4
  ): Promise<{ data: PromptSet[] }> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/prompt-market/related/${slug}?limit=${limit}`,
        { method: 'GET', headers: getHeaders() }
      );
      const res = await response.json();
      return { data: res.data ?? [] };
    } catch {
      return { data: [] };
    }
  },

  /* ─── Reviews ─── */
  getReviews: async (
    promptSetId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{
    data: PromptReview[];
    pagination: { page: number; limit: number; total: number };
    averageRating: number;
    reviewCount: number;
  }> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/prompt-market/${promptSetId}/reviews?page=${page}&limit=${limit}`,
        { method: 'GET', headers: getHeaders() }
      );
      return await response.json();
    } catch {
      return {
        data: [],
        pagination: { page: 1, limit: 10, total: 0 },
        averageRating: 0,
        reviewCount: 0,
      };
    }
  },

  submitReview: async (
    promptSetId: string,
    payload: { rating: number; comment: string }
  ): Promise<{ success: boolean; data?: PromptReview; message?: string }> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/prompt-market/${promptSetId}/reviews`,
        {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(payload),
        }
      );
      return await response.json();
    } catch {
      return { success: false, message: 'Network failed' };
    }
  },

  deleteReview: async (
    reviewId: string
  ): Promise<{ success: boolean }> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/prompt-market/reviews/${reviewId}`,
        { method: 'DELETE', headers: getHeaders() }
      );
      return await response.json();
    } catch {
      return { success: false };
    }
  },

  /* ─── Wishlist ─── */
  getWishlist: async (
    page: number = 1,
    limit: number = 20
  ): Promise<{
    data: PromptWishlistItem[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/prompt-market/wishlist?page=${page}&limit=${limit}`,
        { method: 'GET', headers: getHeaders() }
      );
      return await response.json();
    } catch {
      return { data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } };
    }
  },

  toggleWishlist: async (
    promptSetId: string
  ): Promise<{ success: boolean; wishlisted: boolean; wishlistCount: number }> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/prompt-market/${promptSetId}/wishlist`,
        { method: 'POST', headers: getHeaders() }
      );
      return await response.json();
    } catch {
      return { success: false, wishlisted: false, wishlistCount: 0 };
    }
  },

  checkWishlisted: async (
    promptSetIds: string[]
  ): Promise<{ data: Record<string, boolean> }> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/prompt-market/wishlist/check`,
        {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({ ids: promptSetIds }),
        }
      );
      return await response.json();
    } catch {
      return { data: {} };
    }
  },

  /* ─── Seller Profile ─── */
  getSellerProfile: async (
    sellerId: string
  ): Promise<{ data: SellerProfile | null }> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/prompt-market/seller/${sellerId}`,
        { method: 'GET', headers: getHeaders() }
      );
      return await response.json();
    } catch {
      return { data: null };
    }
  },

  toggleFollowSeller: async (
    sellerId: string
  ): Promise<{ success: boolean; following: boolean; followerCount: number }> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/prompt-market/seller/${sellerId}/follow`,
        { method: 'POST', headers: getHeaders() }
      );
      return await response.json();
    } catch {
      return { success: false, following: false, followerCount: 0 };
    }
  },

  checkFollowing: async (
    sellerId: string
  ): Promise<{ following: boolean }> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/prompt-market/seller/${sellerId}/check-follow`,
        { method: 'GET', headers: getHeaders() }
      );
      return await response.json();
    } catch {
      return { following: false };
    }
  },

  /* ─── Market Stats ─── */
  getStats: async (): Promise<{
    totalPrompts: number;
    totalSellers: number;
    totalPurchases: number;
    totalSKTVolume: number;
    totalReviews: number;
  }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/prompt-market/stats`, {
        method: 'GET',
        headers: getHeaders(),
      });
      const res = await response.json();
      return res.data ?? { totalPrompts: 0, totalSellers: 0, totalPurchases: 0, totalSKTVolume: 0, totalReviews: 0 };
    } catch {
      return { totalPrompts: 0, totalSellers: 0, totalPurchases: 0, totalSKTVolume: 0, totalReviews: 0 };
    }
  },

  /* ─── Track view ─── */
  trackView: async (promptSetId: string): Promise<void> => {
    try {
      await fetch(
        `${API_BASE_URL}/prompt-market/${promptSetId}/view`,
        { method: 'POST', headers: getHeaders() }
      );
    } catch {
      // silent
    }
  },
};
