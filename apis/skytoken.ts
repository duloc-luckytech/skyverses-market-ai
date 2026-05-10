import { API_BASE_URL, getHeaders } from './config';
import type { SkyTokenPackage, SkyTokenTransaction, SkyTokenWithdrawal } from '../types';

export const skytokenApi = {
  getBalance: async (): Promise<{ skyTokenBalance: number }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/skytoken/balance`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return await response.json();
    } catch {
      return { skyTokenBalance: 0 };
    }
  },

  getPackages: async (): Promise<{ data: SkyTokenPackage[] }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/skytoken/packages`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return await response.json();
    } catch {
      return { data: [] };
    }
  },

  getHistory: async (
    page: number = 1,
    limit: number = 20
  ): Promise<{
    data: SkyTokenTransaction[];
    pagination: { page: number; limit: number; total: number };
  }> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/skytoken/history?page=${page}&limit=${limit}`,
        { method: 'GET', headers: getHeaders() }
      );
      return await response.json();
    } catch {
      return { data: [], pagination: { page: 1, limit: 20, total: 0 } };
    }
  },

  claimWelcome: async (): Promise<{
    success: boolean;
    message?: string;
    tokensAdded?: number;
    skyTokenBalance?: number;
  }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/skytoken/claim-welcome`, {
        method: 'POST',
        headers: getHeaders(),
      });
      return await response.json();
    } catch {
      return { success: false, message: 'Network failed' };
    }
  },

  purchaseCreate: async (
    packageCode: string
  ): Promise<{
    success: boolean;
    transaction?: {
      _id: string;
      memo: string;
      amount: number;
      packageName: string;
      tokens: number;
      status: string;
      expiresAt: string;
    };
    message?: string;
  }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/skytoken/purchase/create`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ packageCode }),
      });
      return await response.json();
    } catch {
      return { success: false, message: 'Network failed' };
    }
  },

  purchaseCheck: async (
    txId: string
  ): Promise<{
    status: string;
    tokensAdded?: number;
    skyTokenBalance?: number;
  }> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/skytoken/purchase/check/${txId}`,
        { method: 'GET', headers: getHeaders() }
      );
      return await response.json();
    } catch {
      return { status: 'error' };
    }
  },

  purchaseCancel: async (txId: string): Promise<{ success: boolean }> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/skytoken/purchase/cancel/${txId}`,
        { method: 'POST', headers: getHeaders() }
      );
      return await response.json();
    } catch {
      return { success: false };
    }
  },

  /* ─── Withdrawal ─── */

  withdrawRequest: async (payload: {
    amountSKT: number;
    bankName: string;
    bankAccountNumber: string;
    bankAccountName: string;
  }): Promise<{
    success: boolean;
    data?: SkyTokenWithdrawal;
    skyTokenBalance?: number;
    message?: string;
  }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/skytoken/withdraw/request`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      return await response.json();
    } catch {
      return { success: false, message: 'Network failed' };
    }
  },

  getMyWithdrawals: async (
    page: number = 1,
    limit: number = 20
  ): Promise<{
    data: SkyTokenWithdrawal[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/skytoken/withdraw/my?page=${page}&limit=${limit}`,
        { method: 'GET', headers: getHeaders() }
      );
      return await response.json();
    } catch {
      return { data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } };
    }
  },

  cancelWithdrawal: async (
    id: string
  ): Promise<{ success: boolean; skyTokenBalance?: number }> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/skytoken/withdraw/cancel/${id}`,
        { method: 'POST', headers: getHeaders() }
      );
      return await response.json();
    } catch {
      return { success: false };
    }
  },
};
