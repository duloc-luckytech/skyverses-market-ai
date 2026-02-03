
import React from 'react';
import { motion } from 'framer-motion';
import { Database, Activity, Clock, ShieldCheck, Zap, Server, ShieldAlert } from 'lucide-react';
import { CaptchaAccount } from '../../hooks/useCaptchaToken';

interface QuotaCardProps {
  accountData: CaptchaAccount | null;
}

export const QuotaCard: React.FC<QuotaCardProps> = ({ accountData }) => {
  const apiKey = accountData?.apiKey;
  const quotaRemaining = apiKey?.quotaRemaining ?? 0;
  const usedQuota = apiKey?.usedQuota ?? 0;
  const currentPlan = apiKey?.plan ?? 'Chưa đăng ký';
  const rateLimit = apiKey?.rateLimit?.perMinute ?? 0;
  const concurrent = apiKey?.maxConcurrentRequests ?? 0;
  
  const specs = [
    { l: 'Gói dịch vụ', v: currentPlan.toUpperCase(), i: <ShieldCheck size={12}/> },
    { l: 'Tokens khả dụng', v: quotaRemaining.toLocaleString(), i: <Zap size={12} fill="currentColor"/> },
    { l: 'Tokens đã dùng', v: usedQuota.toLocaleString(), i: <Clock size={12}/> },
    { l: 'Rate Limit', v: `${rateLimit} RPM`, i: <Activity size={12}/> },
    { l: 'Yêu cầu đồng thời', v: `${concurrent} Req`, i: <Server size={12}/> }
  ];

  const scrollToPricing = () => {
    document.getElementById('pricing-matrix')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="lg:col-span-4 space-y-8">
      <div className="p-8 bg-white dark:bg-[#0d0d0f] border border-black/5 dark:border-white/10 rounded-[2.5rem] space-y-8 shadow-2xl relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-100 transition-opacity">
            <Database size={120} />
         </div>
         <div className="space-y-6 relative z-10">
            <div className="flex justify-between items-center">
               <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic">Quota</span>
                  <span className={`text-sm font-black uppercase italic ${
                    currentPlan.toLowerCase().includes('pro') ? 'text-indigo-600' : 'text-brand-blue'
                  }`}>{currentPlan}</span>
               </div>
               {apiKey?.isActive && (
                 <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-2">
                    <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Active</span>
                 </div>
               )}
            </div>
            <div className="space-y-2">
               <div className="flex items-baseline gap-2">
                  <h3 className="text-5xl font-black italic tracking-tighter text-slate-900 dark:text-white">
                    {quotaRemaining.toLocaleString()}
                  </h3>
                  <span className="text-[10px] font-black text-indigo-600 uppercase">Tokens</span>
               </div>
               <div className="h-1.5 w-full bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: quotaRemaining > 0 ? '100%' : '0%' }} 
                    transition={{ duration: 1.5 }} 
                    className="h-full bg-indigo-600 shadow-[0_0_15px_rgba(99,102,241,0.5)]" 
                  />
               </div>
               <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest text-right italic">mỗi lượt captcha = 1 token</p>
            </div>
            <button 
              onClick={scrollToPricing}
              className="block w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-black rounded-xl text-center text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] transition-all"
            >
               Nạp thêm Token
            </button>
         </div>
      </div>

      <div className="p-8 bg-slate-50 dark:bg-white/[0.02] border border-black/5 dark:border-white/10 rounded-3xl space-y-6">
         <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-500">
               <ShieldAlert size={18} />
            </div>
            <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-900 dark:text-white">Thông số kỹ thuật API</h4>
         </div>
         <div className="space-y-4">
            {specs.map(s => (
              <div key={s.l} className="flex justify-between items-center border-b border-black/5 dark:border-white/5 pb-3 group hover:border-brand-blue/30 transition-colors">
                 <div className="flex items-center gap-3 text-slate-400 group-hover:text-brand-blue transition-colors">
                    {s.i}
                    <span className="text-[9px] font-black uppercase tracking-widest">{s.l}</span>
                 </div>
                 <span className="text-[10px] font-black text-indigo-500 italic">{s.v}</span>
              </div>
            ))}
         </div>
      </div>
    </div>
  );
};
