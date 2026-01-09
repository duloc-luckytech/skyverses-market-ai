
import { API_BASE_URL, getHeaders } from './config';
import { Solution } from '../types';

export const marketApi = {
  /**
   * Fetch all market solutions
   * GET /market
   */
  getSolutions: async (): Promise<{ success: boolean; data: Solution[] }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/market`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('Market Fetch Error:', error);
      return { success: false, data: [] };
    }
  },

  /**
   * Fetch random featured solutions
   * GET /market/random/featured
   */
  getRandomFeatured: async (): Promise<{ success: boolean; data: Solution[] }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/market/random/featured`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('Market Featured Fetch Error:', error);
      return { success: false, data: [] };
    }
  },

  /**
   * Update an existing solution
   * PUT /market/:id
   */
  updateSolution: async (id: string, payload: Partial<Solution>): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/market/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      return await response.json();
    } catch (error) {
      console.error('Market Update Error:', error);
      return { success: false, message: 'Network synchronization failed' };
    }
  },

  /**
   * Create a new solution node
   * POST /market
   */
  createSolution: async (payload: Solution): Promise<{ success: boolean; data?: Solution }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/market`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      return await response.json();
    } catch (error) {
      console.error('Market Create Error:', error);
      return { success: false };
    }
  },

  /**
   * Delete a solution node
   * DELETE /market/:id
   */
  deleteSolution: async (id: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/market/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('Market Delete Error:', error);
      return { success: false, message: 'Network synchronization failed' };
    }
  },

  /**
   * Toggle active status
   * POST /market/:id/active
   */
  toggleActive: async (id: string, isActive: boolean): Promise<{ success: boolean; data?: Solution }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/market/${id}/active`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ isActive }),
      });
      return await response.json();
    } catch (error) {
      console.error('Market Toggle Active Error:', error);
      return { success: false };
    }
  }
};
