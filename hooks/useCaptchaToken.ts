
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { API_BASE_URL, getHeaders } from '../apis/config';

export const CAPTCHA_API_BASE = 'https://captcha.skyverses.com';
export const TOKEN_STORAGE_KEY = 'skyverses_captcha_access_token';

export interface CaptchaLog {
  id: string;
  timestamp: string;
  action: 'IMAGE' | 'VIDEO' | 'CUSTOM';
  status: 'SUCCESS' | 'FAILED' | 'BYPASS';
  latency: string;
  cost: number;
}

export interface CaptchaApiKey {
  key: string;
  quotaRemaining: number;
  rateLimit: {
    perMinute: number;
  };
  lastUsedAt?: string;
  createdAt: string;
  note?: string;
}

export interface CaptchaAccount {
  id: string;
  email: string;
  name: string;
  userIdSkyverses: string;
  apiKey: CaptchaApiKey | null;
  accessTokenCaptcha?: string;
}

export type CaptchaTab = 'UPLINK' | 'SANDBOX' | 'TELEMETRY' | 'ACCOUNT';

export const useCaptchaToken = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<CaptchaTab>('UPLINK');
  const [loading, setLoading] = useState(false);
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [accountData, setAccountData] = useState<CaptchaAccount | null>(null);

  const [logs, setLogs] = useState<CaptchaLog[]>([
    { id: 'TX-8429', timestamp: '14:22:05', action: 'IMAGE', status: 'SUCCESS', latency: '0.24s', cost: 0.5 },
    { id: 'TX-8430', timestamp: '14:25:12', action: 'VIDEO', status: 'BYPASS', latency: '1.42s', cost: 2.0 },
    { id: 'TX-8431', timestamp: '14:30:44', action: 'CUSTOM', status: 'SUCCESS', latency: '0.12s', cost: 1.0 },
  ]);

  const [requestMode, setRequestMode] = useState<'IMAGE' | 'VIDEO' | 'CUSTOM'>('IMAGE');
  const [targetUrl, setTargetUrl] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);

  const getCaptchaHeaders = () => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };
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
  }, []);

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
        showToast("Liên kết định danh Captcha thành công!", "success");
        await fetchAccountInfo();
      } else {
        showToast(result.message || "Liên kết định danh thất bại.", "error");
      }
    } catch (err) {
      console.error("Link Account Error:", err);
      showToast("Lỗi kết nối máy chủ Captcha.", "error");
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
      if (result.success) {
        showToast("Đã khởi tạo API Key mới thành công", "success");
        await fetchAccountInfo();
      } else {
        showToast(result.message || "Không thể tạo API Key.", "error");
      }
    } catch (err) {
      console.error("Generate API Key Error:", err);
      showToast("Lỗi kết nối máy chủ API Key.", "error");
    } finally {
      setIsGeneratingKey(false);
    }
  };

  const handleRunSandbox = () => {
    if (!targetUrl.trim() || isExecuting) return;
    setIsExecuting(true);
    setTimeout(() => {
      const newLog: CaptchaLog = {
        id: `TX-${Math.floor(Math.random() * 9000 + 1000)}`,
        timestamp: new Date().toLocaleTimeString(),
        action: requestMode,
        status: Math.random() > 0.1 ? 'SUCCESS' : 'FAILED',
        latency: (Math.random() * 0.5 + 0.1).toFixed(2) + 's',
        cost: requestMode === 'IMAGE' ? 0.5 : requestMode === 'VIDEO' ? 2.0 : 1.0
      };
      setLogs(prev => [newLog, ...prev]);
      setIsExecuting(false);
      setTargetUrl('');
      showToast("Sandbox execution complete", "success");
    }, 2000);
  };

  return {
    activeTab, setActiveTab,
    loading, isGeneratingKey, isLinking,
    accountData, setAccountData,
    logs, setLogs,
    requestMode, setRequestMode,
    targetUrl, setTargetUrl,
    isExecuting,
    handleLinkAccount, handleGenerateKey, handleRunSandbox
  };
};
