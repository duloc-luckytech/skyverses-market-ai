
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

export type SettingTab = 'profile' | 'compute' | 'cloud' | 'keys' | 'referrals' | 'security' | 'billing';

export interface ModelKeys {
  gemini: string;
  openai: string;
  anthropic: string;
  midjourney: string;
}

const STORAGE_KEY = 'skyverses_model_vault';

export const useSettingsLogic = () => {
  const { user, credits, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang } = useLanguage();
  
  const [activeTab, setActiveTab] = useState<SettingTab>('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [modelKeys, setModelKeys] = useState<ModelKeys>({
    gemini: '',
    openai: '',
    anthropic: '',
    midjourney: ''
  });

  useEffect(() => {
    const savedKeys = localStorage.getItem(STORAGE_KEY);
    if (savedKeys) {
      try {
        setModelKeys(JSON.parse(savedKeys));
      } catch (e) {
        console.error("Error parsing Model Keys", e);
      }
    }
  }, []);

  const handleSaveKeys = async () => {
    setIsSaving(true);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(modelKeys));
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsSaving(false);
  };

  const handleResetKeys = () => {
    if(window.confirm("Bạn có chắc chắn muốn xóa toàn bộ Key đã lưu khỏi trình duyệt?")) {
      setModelKeys({gemini:'', openai:'', anthropic:'', midjourney:''});
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1200));
    setIsSaving(false);
  };

  return {
    user,
    credits,
    logout,
    theme,
    toggleTheme,
    lang,
    setLang,
    activeTab,
    setActiveTab,
    isSaving,
    modelKeys,
    setModelKeys,
    handleSaveKeys,
    handleResetKeys,
    handleSaveProfile
  };
};
