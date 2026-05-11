import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  User, Shield, Zap, CreditCard,
  Key, LogOut, Users,
  Wallet, Sparkles, Check,
} from 'lucide-react';
import { useSettingsLogic, SettingTab } from '../hooks/useSettingsLogic';
import { useLanguage } from '../context/LanguageContext';
import {
  ProfileTab,
  ComputeTab,
  ModelKeysTab,
  SecurityTab,
  BillingTab,
  ReferralsTab,
  WalletTab,
} from '../components/settings/SettingsTabs';

const SettingsPage = () => {
  const logic = useSettingsLogic();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = () => {
    logic.logout();
    navigate('/');
  };

  const navItems: { id: SettingTab; label: string; icon: React.ReactNode }[] = [
    { id: 'profile', label: t('settings.tabs.profile'), icon: <User size={14} /> },
    { id: 'compute', label: t('settings.tabs.compute'), icon: <Zap size={14} /> },
    { id: 'wallet', label: t('settings.tabs.wallet') || 'Wallet', icon: <Wallet size={14} /> },
    { id: 'keys', label: t('settings.tabs.keys'), icon: <Key size={14} /> },
    { id: 'referrals', label: t('settings.tabs.referrals'), icon: <Users size={14} /> },
    { id: 'security', label: t('settings.tabs.security'), icon: <Shield size={14} /> },
    { id: 'billing', label: t('settings.tabs.billing'), icon: <CreditCard size={14} /> },
  ];

  return (
    <div className="pt-20 md:pt-24 min-h-screen bg-[#FAFAF8] dark:bg-[var(--atlas-bg-page)] text-black dark:text-white transition-colors duration-500">

      {/* ═══ PROFILE HEADER ═══ */}
      <section className="px-6 lg:px-16 py-10 border-b border-black/10 dark:border-white/[0.04] bg-white dark:bg-transparent">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center gap-5">
            {/* Avatar */}
            <div className="relative group shrink-0">
              <img
                src={logic.user?.picture}
                className="w-16 h-16 rounded-xl border-2 border-[#C9A84C]/30 dark:border-white/[0.06] object-cover"
                alt="Avatar"
              />
              <div className="absolute inset-0 bg-[#C9A84C]/30 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Sparkles className="text-white" size={16} />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-black dark:text-white">
                {logic.user?.name}
              </h1>
              <p className="text-xs text-gray-500 dark:text-white/30 mt-0.5">{logic.user?.email}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap justify-center sm:justify-start">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 text-[10px] font-bold uppercase tracking-widest border border-emerald-500/20 rounded">
                  <Check size={10} strokeWidth={3} /> Verified
                </span>
                {logic.user?.plan && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#C9A84C]/10 text-[#8B6914] dark:text-[#C9A84C] text-[10px] font-bold uppercase tracking-widest border border-[#C9A84C]/20 rounded">
                    <Shield size={10} /> {logic.user.plan}
                  </span>
                )}
              </div>
            </div>

            {/* Quick stats */}
            <div className="flex items-center gap-5 shrink-0">
              <div className="text-center">
                <p className="text-[9px] font-bold text-gray-400 dark:text-white/30 uppercase tracking-widest">Credits</p>
                <p className="text-2xl font-bold mt-0.5 font-mono text-black dark:text-white">{logic.credits.toLocaleString()}</p>
              </div>
              <div className="w-px h-10 bg-black/10 dark:bg-white/[0.06]" />
              <div className="text-center">
                <p className="text-[9px] font-bold text-gray-400 dark:text-white/30 uppercase tracking-widest">Plan</p>
                <p className="text-2xl font-bold mt-0.5 capitalize text-black dark:text-white">{logic.user?.plan || 'Free'}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ TAB NAVIGATION ═══ */}
      <section className="px-6 lg:px-16 border-b border-black/10 dark:border-white/[0.04] sticky top-16 md:top-20 z-20 bg-white/90 dark:bg-[var(--atlas-bg-page)]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-0 overflow-x-auto no-scrollbar -mb-px">
            {navItems.map((item) => {
              const isActive = logic.activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => logic.setActiveTab(item.id)}
                  className={`relative shrink-0 flex items-center gap-2 px-4 py-3.5 text-xs font-semibold transition-all whitespace-nowrap border-b-2 ${
                    isActive
                      ? 'border-[#C9A84C] text-[#8B6914] dark:border-[#C9A84C] dark:text-[#C9A84C]'
                      : 'border-transparent text-gray-500 dark:text-white/30 hover:text-black dark:hover:text-white/60'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}

            <div className="flex-1" />
            <button
              onClick={handleLogout}
              className="shrink-0 flex items-center gap-2 px-4 py-3.5 text-xs font-semibold text-red-500 hover:text-red-400 transition-all whitespace-nowrap"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">{t('user.menu.signout')}</span>
            </button>
          </div>
        </div>
      </section>

      {/* ═══ CONTENT AREA ═══ */}
      <section className="px-6 lg:px-16 py-10 pb-32">
        <div className="max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            {logic.activeTab === 'profile' && <ProfileTab logic={logic} />}
            {logic.activeTab === 'compute' && <ComputeTab logic={logic} />}
            {logic.activeTab === 'wallet' && <WalletTab logic={logic} />}
            {logic.activeTab === 'keys' && <ModelKeysTab logic={logic} />}
            {logic.activeTab === 'referrals' && <ReferralsTab logic={logic} />}
            {logic.activeTab === 'security' && <SecurityTab logic={logic} />}
            {logic.activeTab === 'billing' && <BillingTab logic={logic} />}
          </AnimatePresence>
        </div>
      </section>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default SettingsPage;
