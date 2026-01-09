import { API_BASE_URL, getHeaders } from './config';

export const userApi = {
  /**
   * Fetch current user profile data
   * Placeholder for future profile expansion
   */
  getProfile: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/profile`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('User Service Error:', error);
      return { success: false };
    }
  },

  /**
   * Submit onboarding survey data
   * POST /user/onboarding
   */
  submitOnboarding: async (payload: {
    role: string;
    goals: string[];
    workStyle: string;
    experienceLevel: string;
    complete: boolean;
  }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/onboarding`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      return await response.json();
    } catch (error) {
      console.error('Onboarding API Error:', error);
      return { success: false };
    }
  },

  /**
   * Sync credits with backend
   * Placeholder for backend credit management
   */
  syncCredits: async (amount: number) => {
    // Logic for syncing credits with production backend
  }
};