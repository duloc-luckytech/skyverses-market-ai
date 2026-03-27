
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { API_BASE_URL, getHeaders } from '../apis/config';
import { creditsApi, CreditTransaction } from '../apis/credits';

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
  const [profileFields, setProfileFields] = useState<Record<string, string>>({});

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

  // ── Referral friends from BE: GET /user/list-by-invite?userId= ──
  const [referralFriends, setReferralFriends] = useState<any[]>([]);
  const [referralTotal, setReferralTotal] = useState(0);
  const [referralLoading, setReferralLoading] = useState(false);

  const fetchReferralFriends = useCallback(async () => {
    if (!user?._id) return;
    setReferralLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/user/list-by-invite?userId=${user._id}&limit=50`, {
        method: 'GET', headers: getHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setReferralFriends(data.users || []);
          setReferralTotal(data.total || 0);
        }
      }
    } catch { }
    setReferralLoading(false);
  }, [user?._id]);

  useEffect(() => {
    if (activeTab === 'referrals' && user?._id) fetchReferralFriends();
  }, [activeTab, user?._id, fetchReferralFriends]);

  // ── Credit history from BE: GET /credits/history ──
  const [creditHistory, setCreditHistory] = useState<CreditTransaction[]>([]);
  const [creditHistoryLoading, setCreditHistoryLoading] = useState(false);

  // ── Purchase history from BE: GET /credits/my-purchases ──
  const [purchaseHistory, setPurchaseHistory] = useState<any[]>([]);

  const fetchBillingData = useCallback(async () => {
    setCreditHistoryLoading(true);
    try {
      const [historyRes, purchaseRes] = await Promise.all([
        creditsApi.getHistory(1, 30),
        creditsApi.getMyPurchases(),
      ]);
      setCreditHistory(historyRes.data || []);
      if (purchaseRes.success) setPurchaseHistory(purchaseRes.purchases || []);
    } catch { }
    setCreditHistoryLoading(false);
  }, []);

  useEffect(() => {
    if (activeTab === 'billing' && user) fetchBillingData();
  }, [activeTab, user, fetchBillingData]);

  // ── Actions ──
  const handleSaveKeys = async () => {
    setIsSaving(true);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(modelKeys));
    // Also save gemini key to backend
    if (modelKeys.gemini) {
      try {
        await fetch(`${API_BASE_URL}/user/update-gemini-api-key`, {
          method: 'PUT', headers: getHeaders(),
          body: JSON.stringify({ geminiApiKey: modelKeys.gemini }),
        });
      } catch { }
    }
    await new Promise(r => setTimeout(r, 400));
    setIsSaving(false);
  };

  const handleResetKeys = () => {
    if (window.confirm('Bạn có chắc muốn xóa toàn bộ Key đã lưu?')) {
      setModelKeys({ gemini: '', openai: '', anthropic: '', midjourney: '' });
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  // PUT /user/update-profile — uses allowed fields from BE
  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const payload: any = {};
      // Name is special — backend uses firstName/lastName but we also allow name
      if (profileFields.firstName !== undefined) payload.firstName = profileFields.firstName;
      if (profileFields.lastName !== undefined) payload.lastName = profileFields.lastName;
      if (profileFields.phone !== undefined) payload.phone = profileFields.phone;
      if (profileFields.gender !== undefined) payload.gender = profileFields.gender;
      if (profileFields.birthYear !== undefined) payload.birthYear = profileFields.birthYear;
      if (profileFields.province !== undefined) payload.province = profileFields.province;

      if (Object.keys(payload).length > 0) {
        await fetch(`${API_BASE_URL}/user/update-profile`, {
          method: 'PUT', headers: getHeaders(),
          body: JSON.stringify(payload),
        });
      }
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
    profileName, setProfileName,
    profileFields, setProfileFields,
    handleSaveProfile,
    modelKeys, setModelKeys, handleSaveKeys, handleResetKeys,
    referralFriends, referralTotal, referralLoading, fetchReferralFriends,
    creditHistory, creditHistoryLoading,
    purchaseHistory,
  };
};
