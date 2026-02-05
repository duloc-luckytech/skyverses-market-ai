
import { API_BASE_URL, getHeaders } from './config';

export interface PricingModel {
  _id: string;
  tool: string;
  name: string;
  engine: string;
  modelKey: string;
  version: string;
  description: string;
  mode: string;
  modes?: string[];
  status: string;
  aspectRatios?: string[];
  pricing: {
    [resolution: string]: {
      [duration: string]: number;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface PricingFilters {
  engine?: string;
  modelKey?: string;
  version?: string;
  tool?: string;
}

export interface CreatePricingRequest {
  tool: string;
  engine: string;
  modelKey: string;
  version: string;
  name?: string;
  mode?: string;
  modes?: string[];
  baseCredits: number;
  defaultDuration?: number;
  perSecond: number;
  resolutions: Record<string, number>;
  durations: number[];
  aspectRatios?: string[];
  description?: string;
  status?: string;
}

export const pricingApi = {
  /**
   * Fetch pricing models based on dynamic filters
   * GET /pricing
   */
  getPricing: async (filters: PricingFilters = {}): Promise<{ success: boolean; data: PricingModel[] }> => {
    try {
      const cleanFilters: Record<string, string> = {};
      Object.entries(filters).forEach(([key, value]) => {
        if (value) cleanFilters[key] = value;
      });

      const query = new URLSearchParams(cleanFilters);
      const response = await fetch(`${API_BASE_URL}/pricing?${query}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      
      const data = await response.json();
      if (Array.isArray(data)) {
        return { success: true, data };
      }
      return data;
    } catch (error) {
      console.error('Pricing Fetch Error:', error);
      return { success: false, data: [] };
    }
  },

  /**
   * Create new pricing config
   * POST /pricing
   */
  createPricing: async (payload: CreatePricingRequest): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/pricing`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      return await response.json();
    } catch (error) {
      console.error('Pricing Create Error:', error);
      return { success: false, message: 'Network synchronization failed' };
    }
  },

  /**
   * Update pricing config
   * PUT /pricing/:id
   */
  updatePricing: async (id: string, payload: Partial<CreatePricingRequest>): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/pricing/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      return await response.json();
    } catch (error) {
      console.error('Pricing Update Error:', error);
      return { success: false, message: 'Network synchronization failed' };
    }
  },

  /**
   * Update a specific cell in the pricing matrix
   * PATCH /pricing/:id/cell
   */
  updatePricingCell: async (id: string, resolution: string, duration: number, credits: number): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/pricing/${id}/cell`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ resolution, duration, credits }),
      });
      return await response.json();
    } catch (error) {
      console.error('Pricing Cell Update Error:', error);
      return { success: false, message: 'Cell synchronization failed' };
    }
  },

  /**
   * Delete pricing config
   * DELETE /pricing/:id
   */
  deletePricing: async (id: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/pricing/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('Pricing Delete Error:', error);
      return { success: false, message: 'Network synchronization failed' };
    }
  }
};
