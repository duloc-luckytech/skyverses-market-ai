import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { API_BASE_URL, getHeaders } from '../apis/config';

export const CAPTCHA_API_BASE = 'https://captcha.skyverses.com';
export const TOKEN_STORAGE_KEY = 'skyverses_captcha_access_token';

export interface PaymentLog {
  _id: string;
  createdAt: string;
  plan: {
    name: string;
    code: string;
  };
  amount: number;
  currency: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED' | string;
  bankRef?: string;
}

export interface CaptchaLog {
  id: string;
  timestamp: string;
  action: string;
  latency: string;
  status: string;
  cost: number;
}

export interface CaptchaPlan {
  code: string;
  name: string;
  price: number;
  currency: string;
  quota: number;
  maxConcurrentRequests: number;
  rateLimit: {
    perMinute: number;
  };
  description: string;
  isFree: boolean;
}

export interface CaptchaApiKey {
  _id: string;
  key: string;
  quotaRemaining: number;
  usedQuota: number;
  plan: string;
  planName?: string;
  rateLimit: {
    perMinute: number;
  };
  maxConcurrentRequests: number;
  lastUsedAt?: string;
  createdAt: string;
  note?: string;
  isActive: boolean;
}

export interface CaptchaAccount {
  user: {
    id: string;
    email: string;
    name: string;
    userIdSkyverses: string;
  };
  apiKey: CaptchaApiKey | null;
  accessTokenCaptcha?: string;
}

export interface CaptchaPaymentData {
  transactionId: string;
  amount: number;
  currency: string;
  transferContent: string;
  bank: {
    provider: string;
    bankName: string;
    accountName: string;
    accountNumber: string;
  };
  plan: {
    code: string;
    name: string;
    quota: number;
  };
  createdAt: string;
}

export type CaptchaTab = 'CONNECT' | 'PAYMENTS' | 'DOCS';

export const useCaptchaToken = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<CaptchaTab>('CONNECT');
  const [loading, setLoading] = useState(false);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [accountData, setAccountData] = useState<CaptchaAccount | null>(null);
  const [plans, setPlans] = useState<CaptchaPlan[]>([]);
  const [activePayment, setActivePayment] = useState<CaptchaPaymentData | null>(null);
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState<PaymentLog[]>([]);

  const getCaptchaHeaders = () => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };
  };

  const fetchPlans = async () => {
    setLoadingPlans(true);
    try {
      const response = await fetch(`${CAPTCHA_API_BASE}/captcha/plans`);
      const result = await response.json();
      if (result.success && result.data) {
        setPlans(result.data);
      }
    } catch (err) {
      console.error("Fetch Plans Error:", err);
    } finally {
      setLoadingPlans(false);
    }
  };

  const fetchPaymentHistory = async () => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!token) return;

    setLoadingHistory(true);
    try {
      const response = await fetch(`${CAPTCHA_API_BASE}/payment/history`, {
        headers: getCaptchaHeaders()
      });
      const result = await response.json();
      if (result.success && result.data) {
        setPaymentHistory(result.data);
      }
    } catch (err) {
      console.error("Fetch Payment History Error:", err);
      showToast("Không thể tải lịch sử thanh toán", "error");
    } finally {
      setLoadingHistory(false);
    }
  };

  const fetchAccountInfo = async () => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!token) return;

    setLoading(true);
    try {
      const response = await fetch(`${CAPTCHA_API_BASE}/account/info`, {
        headers: getCaptchaHeaders()
      });
      const result = await response.json();
      if (result.success && result.data) {
        setAccountData(result.data);
      } else if (response.status === 401) {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        setAccountData(null);
      }
    } catch (err) {
      console.error("Load Account Info Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccountInfo();
    fetchPlans();
  }, []);

  useEffect(() => {
    if (activeTab === 'PAYMENTS') {
      fetchPaymentHistory();
    }
  }, [activeTab]);

  const handleLinkAccount = async () => {
    if (!user || isLinking) return;
    setIsLinking(true);
    try {
      const response = await fetch(`${CAPTCHA_API_BASE}/account/link`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          userIdSkyverses: user._id,
          email: user.email,
          name: user.name
        }),
      });
      
      const result = await response.json();
      if (result.success && result.accessTokenCaptcha) {
        localStorage.setItem(TOKEN_STORAGE_KEY, result.accessTokenCaptcha);
        showToast("Liên kết tài khoản thành công!", "success");
        await fetchAccountInfo();
      } else {
        showToast(result.message || "Liên kết tài khoản thất bại.", "error");
      }
    } catch (err) {
      console.error("Link Account Error:", err);
      showToast("Lỗi kết nối máy chủ API.", "error");
    } finally {
      setIsLinking(false);
    }
  };

  const handleGenerateKey = async () => {
    if (isGeneratingKey || !accountData) return;
    setIsGeneratingKey(true);
    try {
      const response = await fetch(`${CAPTCHA_API_BASE}/apikey/create`, {
        method: 'POST',
        headers: getCaptchaHeaders(),
        body: JSON.stringify({}),
      });
      const result = await response.json();
      if (result.success && result.data) {
        showToast("Đã khởi tạo Secret Key mới thành công", "success");
        setAccountData(prev => prev ? ({
          ...prev,
          apiKey: result.data
        }) : null);
      } else {
        showToast(result.message || "Không thể tạo Secret Key.", "error");
      }
    } catch (err) {
      console.error("Generate API Key Error:", err);
      showToast("Lỗi kết nối máy chủ API.", "error");
    } finally {
      setIsGeneratingKey(false);
    }
  };

  const handleCreatePayment = async (planCode: string) => {
    if (!accountData || !accountData.apiKey || isCreatingPayment) {
      if (!accountData) {
        showToast("Vui lòng kết nối tài khoản trước.", "warning");
      } else if (!accountData.apiKey) {
        showToast("Vui lòng khởi tạo API Key trước khi nạp Token.", "warning");
      }
      return;
    }

    setIsCreatingPayment(true);
    try {
      const response = await fetch(`${CAPTCHA_API_BASE}/payment/create`, {
        method: 'POST',
        headers: getCaptchaHeaders(),
        body: JSON.stringify({
          plan: planCode,
          apiKeyId: accountData.apiKey._id
        }),
      });
      const result = await response.json();
      if (result.success && result.data) {
        setActivePayment(result.data);
      } else {
        showToast(result.message || "Không thể khởi tạo thanh toán.", "error");
      }
    } catch (err) {
      console.error("Create Payment Error:", err);
      showToast("Lỗi kết nối máy chủ thanh toán.", "error");
    } finally {
      setIsCreatingPayment(false);
    }
  };

  const pollPaymentStatus = async (txId: string): Promise<string> => {
    try {
      const response = await fetch(`${CAPTCHA_API_BASE}/payment/poll/${txId}`, {
        headers: getCaptchaHeaders()
      });
      const result = await response.json();
      if (result.success) {
        if (result.status === 'SUCCESS') {
          await fetchAccountInfo();
          await fetchPaymentHistory();
        }
        return result.status;
      }
      return 'PENDING';
    } catch (err) {
      console.error("Polling error", err);
      return 'PENDING';
    }
  };

  return {
    activeTab, setActiveTab,
    loading, loadingPlans, loadingHistory, isGeneratingKey, isLinking,
    accountData, setAccountData,
    plans,
    paymentHistory, setPaymentHistory,
    activePayment, setActivePayment,
    isCreatingPayment,
    handleLinkAccount, handleGenerateKey, handleCreatePayment, pollPaymentStatus,
    fetchAccountInfo // Added this to return object
  };
};