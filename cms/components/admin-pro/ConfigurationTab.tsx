
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, ShieldCheck, UserCheck, 
  Zap, Info, ToggleLeft, ToggleRight, 
  Terminal, ShieldAlert, Key, Globe
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const ConfigurationTab: React.FC = () => {
  const { showToast } = useToast();
  
  // State cho cấu hình Auto Login
  const [autoLoginEnabled, setAutoLoginEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('skyverses_auto_login_admin');
    return saved !== 'false'; // Mặc định là true nếu chưa có giá trị
  });

  const handleToggleAutoLogin = () => {
    const newValue = !autoLoginEnabled;
    setAutoLoginEnabled(newValue);
    localStorage.setItem('skyverses_auto_login_admin', String(newValue));
    showToast(`Đã ${newValue ? 'bật' : 'tắt'} tự động đăng nhập Admin`, 'info');
  };

  return (
    <div className="p-8 lg:p-12 space-y-12 animate-in fade-in duration-700 max-w-5xl">
      
      {/* SECTION: AUTHENTICATION */}
      <section className="space-y-8">
        <div className="flex items-center gap-4 border-l-4 border-indigo-600 pl-6">
           <div className="w-10 h-10 bg-indigo-600/10 rounded-xl flex items-center justify-center text-indigo-600">
              <ShieldAlert size={22} />
           </div>
           <div>
              <h3 className="text-xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white leading-none">Cấu hình định danh</h3>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1 italic">Authentication & Access Control</p>
           </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
           {/* Auto Login duloc2708 */}
           <div className="p-8 bg-white dark:bg-[#0d0d0f] border border-black/5 dark:border-white/5 rounded-3xl flex items-center justify-between group hover:border-indigo-500/20 transition-all shadow-sm">
              <div className="flex items-center gap-6">
                 <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                    <UserCheck size={24} />
                 </div>
                 <div className="space-y-1">
                    <h4 className="text-base font-black uppercase italic text-slate-800 dark:text-white">Auto Login Admin (duloc2708)</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Tự động xác thực tài khoản quản trị khi vào ứng dụng.</p>
                 </div>
              </div>
              <button 
                onClick={handleToggleAutoLogin}
                className={`p-2 transition-all ${autoLoginEnabled ? 'text-indigo-600' : 'text-slate-400'}`}
              >
                {autoLoginEnabled ? <ToggleRight size={48} /> : <ToggleLeft size={48} />}
              </button>
           </div>

           <div className="p-6 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex gap-5 items-start">
              <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-600 shrink-0 shadow-inner">
                 <Info size={20} />
              </div>
              <div className="space-y-1">
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-600 italic">Security Warning</p>
                 <p className="text-[11px] text-slate-500 dark:text-gray-400 font-bold leading-relaxed uppercase tracking-tight italic">
                   "Nếu tắt tính năng này, bạn sẽ phải đăng nhập thủ công thông qua Google SSO hoặc Email để truy cập quyền quản trị."
                 </p>
              </div>
           </div>
        </div>
      </section>

      {/* SECTION: SYSTEM NODES */}
      <section className="space-y-8 pt-10 border-t border-black/5 dark:border-white/5">
        <div className="flex items-center gap-4 border-l-4 border-brand-blue pl-6">
           <div className="w-10 h-10 bg-brand-blue/10 rounded-xl flex items-center justify-center text-brand-blue">
              <Zap size={22} />
           </div>
           <div>
              <h3 className="text-xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white leading-none">Hệ thống & Tài nguyên</h3>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1 italic">Resource & API Orchestration</p>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="p-8 bg-white dark:bg-[#0d0d0f] border border-black/5 dark:border-white/5 rounded-3xl space-y-6 shadow-sm opacity-40 grayscale group cursor-not-allowed">
              <div className="flex items-center gap-4">
                 <Key size={20} className="text-slate-400" />
                 <h4 className="text-sm font-black uppercase tracking-widest">Environment Variables</h4>
              </div>
              <p className="text-[11px] text-gray-500 font-medium">Cấu hình các biến môi trường cho Node. (Yêu cầu root access)</p>
           </div>
           
           <div className="p-8 bg-white dark:bg-[#0d0d0f] border border-black/5 dark:border-white/5 rounded-3xl space-y-6 shadow-sm opacity-40 grayscale group cursor-not-allowed">
              <div className="flex items-center gap-4">
                 <Globe size={20} className="text-slate-400" />
                 <h4 className="text-sm font-black uppercase tracking-widest">Global Endpoint Sync</h4>
              </div>
              <p className="text-[11px] text-gray-500 font-medium">Đồng bộ hóa địa chỉ máy chủ xử lý trung tâm.</p>
           </div>
        </div>
      </section>
    </div>
  );
};
