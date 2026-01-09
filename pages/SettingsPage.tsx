import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  User, Shield, Zap, CreditCard, 
  ChevronRight, Key, LogOut, Users,
  History, Cloud
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

  const navItems: { id: SettingTab; label: string; icon: React.ReactNode }[] = [
    { id: 'profile', label: t('settings.tabs.profile'), icon: <User size={18} /> },
    { id: 'compute', label: t('settings.tabs.compute'), icon: <Zap size={18} /> },
    { id: 'cloud', label: t('settings.tabs.cloud'), icon: <Cloud size={18} /> },
    { id: 'keys', label: t('settings.tabs.keys'), icon: <Key size={18} /> },
    { id: 'referrals', label: t('settings.tabs.referrals'), icon: <Users size={18} /> },
    { id: 'security', label: t('settings.tabs.security'), icon: <Shield size={18} /> },
    { id: 'billing', label: t('settings.tabs.billing'), icon: <CreditCard size={18} /> },
  ];

  return (
    <div className="pt-24 md:pt-32 pb-40 min-h-screen bg-[#fcfcfd] dark:bg-[#050506] text-black dark:text-white transition-colors duration-500 font-sans">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6">
        
        <header className="mb-8 md:mb-12">
           <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter italic">{t('settings.title')}</h1>
        </header>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          
          {/* LEFT NAV - Horizontal scroll on mobile, vertical sidebar on desktop */}
          <aside className="w-full lg:w-72 shrink-0 flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible no-scrollbar gap-2 lg:gap-0 lg:space-y-1 pb-4 lg:pb-0 border-b lg:border-b-0 border-black/5 dark:border-white/5">
             {navItems.map((item) => (
               <button
                 key={item.id}
                 onClick={() => logic.setActiveTab(item.id)}
                 className={`shrink-0 lg:w-full flex items-center gap-3 md:gap-4 px-5 py-3 md:px-6 md:py-4 rounded-xl text-xs md:sm font-bold transition-all whitespace-nowrap ${logic.activeTab === item.id ? 'bg-brand-blue text-white shadow-xl shadow-brand-blue/20' : 'text-gray-500 hover:bg-black/5 dark:hover:bg-white/5'}`}
               >
                 {item.icon}
                 <span>{item.label}</span>
                 {logic.activeTab === item.id && (
                   <motion.div 
                     layoutId="active-pill-indicator" 
                     className="ml-auto hidden lg:block"
                   >
                     <ChevronRight size={16}/>
                   </motion.div>
                 )}
               </button>
             ))}
             
             <div className="hidden lg:block pt-4 mt-8 border-t border-black/5 dark:border-white/10">
                <button 
                  onClick={handleLogout} 
                  className="w-full flex items-center gap-3 px-4 py-3 text-[12px] font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all rounded-lg"
                >
                   <LogOut size={16} /> 
                   <span>{t('user.menu.signout')}</span>
                </button>
             </div>
          </aside>

          {/* RIGHT CONTENT */}
          <main className="flex-grow bg-white dark:bg-[#0a0a0c] border border-black/5 dark:border-white/5 rounded-[2rem] lg:rounded-3xl p-6 md:p-8 lg:p-12 shadow-sm transition-colors overflow-hidden min-h-[600px]">
             <AnimatePresence mode="wait">
                {logic.activeTab === 'profile' && <ProfileTab logic={logic} />}
                {logic.activeTab === 'compute' && <ComputeTab logic={logic} />}
                {logic.activeTab === 'cloud' && <CloudStorageTab />}
                {logic.activeTab === 'keys' && <ModelKeysTab logic={logic} />}
                {logic.activeTab === 'referrals' && <ReferralsTab logic={logic} />}
                {logic.activeTab === 'security' && <SecurityTab logic={logic} />}
                {logic.activeTab === 'billing' && <BillingTab logic={logic} />}
             </AnimatePresence>

             {/* Logout button for mobile specifically at the bottom of content */}
             <div className="lg:hidden mt-16 pt-8 border-t border-black/5 dark:border-white/10">
                <button 
                  onClick={handleLogout} 
                  className="w-full flex items-center justify-center gap-3 px-4 py-4 text-sm font-bold text-red-500 bg-red-500/5 hover:bg-red-500/10 transition-all rounded-xl border border-red-500/10"
                >
                   <LogOut size={18} /> 
                   <span>{t('user.menu.signout')}</span>
                </button>
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