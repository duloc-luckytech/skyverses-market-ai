
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { API_BASE_URL, getHeaders } from '../apis/config';

export type SettingTab = 'profile' | 'compute' | 'cloud' | 'keys' | 'referrals' | 'security' | 'billing';

export interface ModelKeys {
  gemini: string;
  openai: string;
  anthropic: string;
  midjourney: string;
}

const STORAGE_KEY = 'skyverses_model_vault';

export const useSettingsLogic = () => {
  const { user, credits, logout, refreshUserInfo } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang } = useLanguage();

  const [activeTab, setActiveTab] = useState<SettingTab>('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [modelKeys, setModelKeys] = useState<ModelKeys>({
    gemini: '', openai: '', anthropic: '', midjourney: ''
  });

  // ── Profile editing ──
  const [profileName, setProfileName] = useState('');

  useEffect(() => {
    if (user?.name) setProfileName(user.name);
  }, [user?.name]);

  // ── Model keys from localStorage ──
  useEffect(() => {
    const savedKeys = localStorage.getItem(STORAGE_KEY);
    if (savedKeys) {
      try { setModelKeys(JSON.parse(savedKeys)); } catch { }
    }
  }, []);

  // ── Referral stats from BE ──
  const [referralStats, setReferralStats] = useState({
    totalInvited: 0, totalEarned: 0, history: [] as any[]
  });
  const [referralLoading, setReferralLoading] = useState(false);

  const fetchReferralStats = useCallback(async () => {
    setReferralLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/user/referral-stats`, { method: 'GET', headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        if (data.success) setReferralStats(data.data);
      }
    } catch { }
    setReferralLoading(false);
  }, []);

  useEffect(() => {
    if (activeTab === 'referrals' && user) fetchReferralStats();
  }, [activeTab, user, fetchReferralStats]);

  // ── Credit transactions from BE ──
  const [creditHistory, setCreditHistory] = useState<any[]>([]);
  const [creditHistoryLoading, setCreditHistoryLoading] = useState(false);

  const fetchCreditHistory = useCallback(async () => {
    setCreditHistoryLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/credits/history?limit=20`, { method: 'GET', headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        if (data.success) setCreditHistory(data.data || []);
      }
    } catch { }
    setCreditHistoryLoading(false);
  }, []);

  useEffect(() => {
    if (activeTab === 'billing' && user) fetchCreditHistory();
  }, [activeTab, user, fetchCreditHistory]);

  // ── Actions ──
  const handleSaveKeys = async () => {
    setIsSaving(true);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(modelKeys));
    await new Promise(r => setTimeout(r, 600));
    setIsSaving(false);
  };

  const handleResetKeys = () => {
    if (window.confirm('Bạn có chắc muốn xóa toàn bộ Key đã lưu?')) {
      setModelKeys({ gemini: '', openai: '', anthropic: '', midjourney: '' });
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await fetch(`${API_BASE_URL}/user/profile`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ name: profileName }),
      });
      await refreshUserInfo();
    } catch { }
    setIsSaving(false);
  };

  return {
    user, credits, logout, refreshUserInfo,
    theme, toggleTheme,
    lang, setLang,
    activeTab, setActiveTab,
    isSaving,
    profileName, setProfileName, handleSaveProfile,
    modelKeys, setModelKeys, handleSaveKeys, handleResetKeys,
    referralStats, referralLoading, fetchReferralStats,
    creditHistory, creditHistoryLoading,
  };
};
