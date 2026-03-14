import { API_BASE_URL, getHeaders } from './config';

export interface AuthUser {
  _id: string;
  email: string;
  name: string;
  avatar?: string;
  role: string;
  inviteCode: string;
  inviteFrom?: string;
  creditBalance: number;
  claimWelcomeCredit: boolean;
  canDailyClaim?: boolean; // New field for daily rewards
  plan?: string;
  planExpiresAt?: string;
  videoUsed?: number;
  maxVideo?: number;
  lastActiveAt?: string;
  createdAt?: string;
  googleEmail?: string;
}

export interface RegisterRequest {
  email: string;
  name: string;
  inviteCode?: string;
  picture?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: AuthUser;
}

export interface UserListResponse {
  data: AuthUser[];
  totalItems: number;
  totalPages: number;
  page: number;
  pageSize: number;
  sortBy: string;
  sortOrder: string;
  plan: string;
}

export interface UserListParams {
  searchContent?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  plan?: string;
}

export const authApi = {
  /**
   * Register or Login with Google/Email info
   * POST /auth/google-register
   */
  googleRegister: async (payload: RegisterRequest): Promise<AuthResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/google-register`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          ...payload,
          picture: payload.picture || "https://framerusercontent.com/images/EIgpJkAezmTH65ZZbHE7BDbzD60.png"
        }),
      });
      return await response.json();
    } catch (error) {
      console.error('Auth Service Error:', error);
      return { success: false, message: 'Network connection failed' };
    }
  },

  /**
   * Fetch full user info and balance
   * GET /auth/user/info
   */
  getUserInfo: async (): Promise<AuthResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/user/info`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('User Info Error:', error);
      return { success: false, message: 'Failed to sync user data' };
    }
  },

  /**
   * Fetch list of users for admin
   * GET /user/list-u
   */
  listUsers: async (params: UserListParams): Promise<UserListResponse> => {
    try {
      const query = new URLSearchParams();
      if (params.searchContent) query.append('searchContent', params.searchContent);
      if (params.page) query.append('page', params.page.toString());
      if (params.pageSize) query.append('pageSize', params.pageSize.toString());
      if (params.sortBy) query.append('sortBy', params.sortBy);
      if (params.sortOrder) query.append('sortOrder', params.sortOrder);
      if (params.plan) query.append('plan', params.plan);

      const response = await fetch(`${API_BASE_URL}/user/list-u?${query.toString()}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('List Users Error:', error);
      throw error;
    }
  }
};