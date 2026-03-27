import { API_BASE_URL, getHeaders } from './config';

export interface AuthUser {
  _id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  phone?: string;
  gender?: string;
  birthYear?: number;
  province?: string;

  // Role & System
  role: string;
  inviteCode: string;
  inviteFrom?: string;
  googleId?: string;
  googleEmail?: string;
  ownedTools?: string[];
  claimWelcomeCredit: boolean;
  canDailyClaim?: boolean;
  lastDailyClaimAt?: string;

  // Plan & Quota
  plan?: string;
  planExpiresAt?: string;
  videoUsed?: number;
  maxVideo?: number;
  videoCount?: number;

  // Credits & Finance
  creditBalance: number;
  affiliateTotal?: number;
  affiliatePending?: number;
  pendingShopPayment?: {
    itemId: string;
    note: string;
    amount: number;
    expiresAt: string;
    createdAt: string;
  };

  // Career
  specialty?: string;
  experienceYears?: number;
  careerDescription?: string;

  // Banking
  bankAccountName?: string;
  bankName?: string;
  bankNumber?: string;

  // Onboarding
  onboarding?: {
    role?: string;
    goals?: string[];
    workStyle?: string;
    experienceLevel?: string;
    completedAt?: string;
  };

  // Timestamps
  lastActiveAt?: string;
  createdAt?: string;
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
  },

  getUserCreditHistory: async (userId: string, page: number = 1, limit: number = 20): Promise<any> => {
    try {
      const response = await fetch(`${API_BASE_URL}/credits/admin/user-history/${userId}?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('User Credit History Error:', error);
      return { data: [], pagination: { page: 1, limit: 20, total: 0 } };
    }
  },

  adminAdjustCredits: async (userId: string, amount: number, note: string): Promise<any> => {
    try {
      const response = await fetch(`${API_BASE_URL}/credits/admin/add`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ userId, amount, note }),
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: 'Connection failed' };
    }
  },

  // ─── Customer Statistics (dashboard cards) ───
  getUserStatistic: async (): Promise<any> => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/statistic`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('User Statistic Error:', error);
      return { success: false };
    }
  },

  // ─── Customer Detail (revenue + plan summary) ───
  getCustomerDetail: async (userId: string): Promise<any> => {
    try {
      const response = await fetch(`${API_BASE_URL}/customer/detail/${userId}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('Customer Detail Error:', error);
      return { success: false };
    }
  },

  // ─── Customer Purchase History ───
  getCustomerPurchaseHistory: async (userId: string): Promise<any> => {
    try {
      const response = await fetch(`${API_BASE_URL}/customer/history/${userId}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('Customer History Error:', error);
      return { success: false, data: [] };
    }
  },

  // ─── Invited Users (Referral list) ───
  getInvitedUsers: async (userId: string, page: number = 1, limit: number = 20): Promise<any> => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/list-by-invite?userId=${userId}&page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('Invited Users Error:', error);
      return { success: false, users: [], total: 0 };
    }
  },

  // ─── Update User Role (become agent) ───
  updateUserRole: async (userId: string, role: string): Promise<any> => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/become-agent`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ userId, role }),
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: 'Connection failed' };
    }
  },

  // ─── Update Plan Expiry ───
  updatePlanExpire: async (userId: string, planExpiresAt: string): Promise<any> => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/update-plan-expire`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ userId, planExpiresAt }),
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: 'Connection failed' };
    }
  },
};