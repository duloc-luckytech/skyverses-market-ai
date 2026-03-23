import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  User, Shield, Zap, CreditCard, 
  ChevronRight, Key, LogOut, Users,
  Cloud, Settings
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
  CloudStorageTab
} from '../components/settings/SettingsTabs';

const SettingsPage = () => {
  const logic = useSettingsLogic();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = () => {
    logic.logout();
    navigate('/');
  };

  const navItems: { id: SettingTab; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: 'profile', label: t('settings.tabs.profile'), icon: <User size={18} />, desc: 'Thông tin cá nhân' },
    { id: 'compute', label: t('settings.tabs.compute'), icon: <Zap size={18} />, desc: 'Credits & usage' },
    { id: 'cloud', label: t('settings.tabs.cloud'), icon: <Cloud size={18} />, desc: 'Lưu trữ đám mây' },
    { id: 'keys', label: t('settings.tabs.keys'), icon: <Key size={18} />, desc: 'API keys' },
    { id: 'referrals', label: t('settings.tabs.referrals'), icon: <Users size={18} />, desc: 'Giới thiệu bạn bè' },
    { id: 'security', label: t('settings.tabs.security'), icon: <Shield size={18} />, desc: 'Bảo mật tài khoản' },
    { id: 'billing', label: t('settings.tabs.billing'), icon: <CreditCard size={18} />, desc: 'Lịch sử thanh toán' },
  ];

  const activeItem = navItems.find(item => item.id === logic.activeTab);

  return (
    <div className="pt-24 md:pt-28 pb-32 min-h-screen bg-[#fafafa] dark:bg-[#050507] text-black dark:text-white transition-colors duration-500">
      
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[40%] w-[800px] h-[400px] bg-brand-blue/[0.02] dark:bg-brand-blue/[0.04] rounded-full blur-[120px]" />
      </div>

      <div className="max-w-[1200px] mx-auto px-4 md:px-8 relative z-10">
        
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-brand-blue/10 text-brand-blue flex items-center justify-center">
              <Settings size={18} />
            </div>
            <h1 className="text-2xl font-black tracking-tight">{t('settings.title')}</h1>
          </div>
          <p className="text-xs text-slate-400 dark:text-gray-500 ml-12">Quản lý tài khoản và tuỳ chỉnh trải nghiệm</p>
        </motion.header>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          
          {/* LEFT NAV */}
          <aside className="w-full lg:w-64 shrink-0">
            {/* Mobile: Horizontal tabs */}
            <div className="flex lg:hidden overflow-x-auto no-scrollbar gap-2 pb-4 border-b border-black/[0.04] dark:border-white/[0.04]">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => logic.setActiveTab(item.id)}
                  className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    logic.activeTab === item.id 
                    ? 'bg-brand-blue text-white shadow-md' 
                    : 'text-slate-400 bg-white dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.04]'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            {/* Desktop: Vertical nav */}
            <div className="hidden lg:block space-y-1 bg-white dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] rounded-2xl p-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => logic.setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                    logic.activeTab === item.id 
                    ? 'bg-brand-blue text-white shadow-md shadow-brand-blue/15' 
                    : 'text-slate-500 dark:text-gray-400 hover:bg-black/[0.03] dark:hover:bg-white/[0.03]'
                  }`}
                >
                  <span className={logic.activeTab === item.id ? '' : 'opacity-60'}>{item.icon}</span>
                  <div className="text-left flex-1">
                    <span className="font-bold text-xs block">{item.label}</span>
                    {logic.activeTab !== item.id && (
                      <span className="text-[10px] font-medium opacity-50 hidden xl:block">{item.desc}</span>
                    )}
                  </div>
                  {logic.activeTab === item.id && (
                    <ChevronRight size={14} className="opacity-60" />
                  )}
                </button>
              ))}
              
              {/* Divider + Logout */}
              <div className="pt-2 mt-2 border-t border-black/[0.04] dark:border-white/[0.04]">
                <button 
                  onClick={handleLogout} 
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/5 transition-all"
                >
                  <LogOut size={16} />
                  <span>{t('user.menu.signout')}</span>
                </button>
              </div>
            </div>
          </aside>

          {/* RIGHT CONTENT */}
          <main className="flex-grow bg-white dark:bg-[#0a0a0e] border border-black/[0.04] dark:border-white/[0.04] rounded-2xl overflow-hidden min-h-[600px] shadow-sm">
            {/* Tab Header Bar */}
            {activeItem && (
              <div className="px-6 md:px-8 py-5 border-b border-black/[0.04] dark:border-white/[0.04] flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-blue/10 text-brand-blue flex items-center justify-center">
                  {activeItem.icon}
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">{activeItem.label}</h2>
                  <p className="text-[10px] text-slate-400 dark:text-gray-500">{activeItem.desc}</p>
                </div>
              </div>
            )}

            <div className="p-6 md:p-8">
              <AnimatePresence mode="wait">
                {logic.activeTab === 'profile' && <ProfileTab logic={logic} />}
                {logic.activeTab === 'compute' && <ComputeTab logic={logic} />}
                {logic.activeTab === 'cloud' && <CloudStorageTab />}
                {logic.activeTab === 'keys' && <ModelKeysTab logic={logic} />}
                {logic.activeTab === 'referrals' && <ReferralsTab logic={logic} />}
                {logic.activeTab === 'security' && <SecurityTab logic={logic} />}
                {logic.activeTab === 'billing' && <BillingTab logic={logic} />}
              </AnimatePresence>
            </div>

            {/* Mobile Logout */}
            <div className="lg:hidden px-6 pb-6">
              <div className="pt-6 border-t border-black/[0.04] dark:border-white/[0.04]">
                <button 
                  onClick={handleLogout} 
                  className="w-full flex items-center justify-center gap-2 px-4 py-3.5 text-sm font-bold text-red-500 bg-red-500/5 hover:bg-red-500/10 transition-all rounded-xl border border-red-500/10"
                >
                  <LogOut size={16} /> 
                  <span>{t('user.menu.signout')}</span>
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default SettingsPage;