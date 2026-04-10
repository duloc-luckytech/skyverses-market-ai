import { API_BASE_URL, getHeaders } from './config';

export interface CreditFeature {
  key: string;
  label: string;
  enabled: boolean;
  highlight: boolean;
  note?: string;
}

export interface UnlimitedModelConfig {
  modelKey: string;
  label: string;
  badge: string;
  enabled: boolean;
  highlight: boolean;
}

export interface CreditPackage {
  _id: string;
  code: string;
  name: string;
  description?: string;
  
  /* CREDIT */
  credits: number;
  bonusPercent: number;
  bonusCredits: number;
  totalCredits: number; // Thường tính toán ở backend hoặc frontend

  /* PRICE */
  price: number;
  originalPrice?: number;
  currency: string;
  billingCycle: 'monthly' | 'annual';
  billedMonths: number;
  discountPercent?: number;

  /* UI FLAGS */
  popular: boolean;
  highlight: boolean;
  badge?: string;
  ribbon?: {
    text: string;
    color: string;
    icon: string;
  };
  ctaText: string;

  /* FEATURES & MODELS */
  features: CreditFeature[];
  unlimitedModels: UnlimitedModelConfig[];

  /* THEME */
  theme: {
    gradientFrom: string;
    gradientTo: string;
    accentColor: string;
    buttonStyle: 'neon' | 'solid' | 'pink';
  };

  /* STATUS */
  active: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreditPackageRequest {
  /* BASIC */
  code: string;
  name: string;
  description?: string;

  /* CREDIT */
  credits: number;
  bonusPercent?: number;
  bonusCredits?: number;

  /* PRICE */
  price: number;
  originalPrice?: number;
  currency?: string;
  billingCycle?: 'monthly' | 'annual';
  billedMonths?: number;
  discountPercent?: number;

  /* UI FLAGS */
  popular?: boolean;
  highlight?: boolean;
  badge?: string;
  ribbon?: {
    text: string;
    color: string;
    icon: string;
  };
  ctaText?: string;

  /* FEATURES */
  features?: CreditFeature[];
  unlimitedModels?: UnlimitedModelConfig[];

  /* THEME */
  theme?: {
    gradientFrom: string;
    gradientTo: string;
    accentColor: string;
    buttonStyle: string;
  };

  /* STATUS */
  active?: boolean;
  sortOrder?: number;
}

export const creditsApi = {
  claimWelcome: async (): Promise<{ success: boolean; message: string; creditBalance?: number }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/credits/claim-welcome`, {
        method: 'POST',
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: 'Network failed' };
    }
  },

  claimDaily: async (): Promise<{ success: boolean; message: string; creditBalance?: number }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/credits/claim-daily`, {
        method: 'POST',
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: 'Network failed' };
    }
  },

  getAdminPackages: async (): Promise<{ data: CreditPackage[] }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/credits/packages`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('Fetch Packages Error:', error);
      return { data: [] };
    }
  },

  createPackage: async (payload: CreditPackageRequest): Promise<{ success: boolean; data?: CreditPackage; message?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/credits/admin/package`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: 'Connection failed' };
    }
  },

  updatePackage: async (id: string, payload: Partial<CreditPackageRequest>): Promise<{ success: boolean; data?: CreditPackage; message?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/credits/admin/package/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: 'Connection failed' };
    }
  },

  togglePackage: async (id: string): Promise<{ success: boolean; active: boolean }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/credits/admin/package/${id}/toggle`, {
        method: 'PATCH',
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      return { success: false, active: false };
    }
  },

  deletePackage: async (id: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/credits/admin/package/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: 'Connection failed' };
    }
  },

  getHistory: async (page: number = 1, limit: number = 20): Promise<{
    data: CreditTransaction[];
    pagination: { page: number; limit: number; total: number };
  }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/credits/history?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      return { data: [], pagination: { page: 1, limit: 20, total: 0 } };
    }
  },

  getBalance: async (): Promise<{ creditBalance: number }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/credits/balance`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      return { creditBalance: 0 };
    }
  },

  getMyPurchases: async (): Promise<{
    success: boolean;
    plan: string | null;
    planExpiresAt: string | null;
    purchases: Array<{
      planCode: string;
      planName: string;
      amount: number;
      memo: string;
      purchasedAt: string;
      verifiedAt: string;
    }>;
  }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/credits/my-purchases`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      return { success: false, plan: null, planExpiresAt: null, purchases: [] };
    }
  },
};

export interface CreditTransaction {
  _id: string;
  userId: string;
  type: 'TOP_UP' | 'CONSUME' | 'REFUND' | 'ADMIN_ADJUST' | 'WELCOME' | 'DAILY' | 'REFERRAL' | 'EVENT_BONUS' | 'FREE_IMAGE';
  amount: number;
  balanceAfter: number;
  source: string;
  note?: string;
  createdAt: string;
}