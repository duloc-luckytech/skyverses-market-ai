
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
  const totalQuota = quotaRemaining + usedQuota;
  const currentPlan = apiKey?.plan ?? 'Chưa đăng ký';
  const rateLimit = apiKey?.rateLimit?.perMinute ?? 0;
  const concurrent = apiKey?.maxConcurrentRequests ?? 0;
  
  // Progress calculation
  const usagePercentage = totalQuota > 0 ? (usedQuota / totalQuota) * 100 : 0;

  const specs = [
    { l: 'Gói dịch vụ', v: currentPlan.toUpperCase(), i: <ShieldCheck size={12}/>, color: 'text-indigo-500' },
    { l: 'Tokens khả dụng', v: quotaRemaining.toLocaleString(), i: <Zap size={12} fill="currentColor"/>, color: 'text-brand-blue' },
    { l: 'Tokens đã dùng', v: usedQuota.toLocaleString(), i: <Clock size={12}/>, color: 'text-orange-500' },
    { l: 'Tốc độ (Rate Limit)', v: `${rateLimit} RPM`, i: <Activity size={12}/>, color: 'text-emerald-500' },
    { l: 'Yêu cầu đồng thời', v: `${concurrent} Req`, i: <Server size={12}/>, color: 'text-purple-500' }
  ];

  const scrollToPricing = () => {
    document.getElementById('pricing-matrix')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="lg:col-span-4 space-y-8">
      {/* MAIN QUOTA CARD */}
      <div className="p-8 bg-white dark:bg-[#0d0d0f] border border-black/5 dark:border-white/10 rounded-[2.5rem] space-y-8 shadow-2xl relative overflow-hidden group transition-all duration-500">
         <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
            <Database size={160} />
         </div>

         <div className="space-y-6 relative z-10">
            <div className="flex justify-between items-center">
               <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic">Gói</span>
                  <span className={`text-sm font-black uppercase italic ${
                    currentPlan.toLowerCase().includes('pro') ? 'text-indigo-600' : 'text-brand-blue'
                  }`}>{currentPlan}</span>
               </div>
               {apiKey?.isActive && (
                 <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]"></div>
                    <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Active</span>
                 </div>
               )}
            </div>

            <div className="space-y-4">
               <div className="flex items-baseline gap-2">
                  <h3 className="text-5xl lg:text-6xl font-black italic tracking-tighter text-slate-900 dark:text-white">
                    {quotaRemaining.toLocaleString()}
                  </h3>
                  <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Tokens Left</span>
               </div>

               <div className="space-y-2">
                  <div className="flex justify-between items-center text-[8px] font-black uppercase text-gray-500 tracking-widest">
                     <span>một lượt captcha = 1 token</span>
                     <span>{Math.round(usagePercentage)}% Used</span>
                  </div>
                  <div className="h-1.5 w-full bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                     <motion.div 
                       initial={{ width: 0 }} 
                       animate={{ width: `${usagePercentage}%` }} 
                       transition={{ duration: 1.5, ease: "easeOut" }} 
                       className="h-full bg-indigo-600 shadow-[0_0_15px_rgba(99,102,241,0.5)]" 
                     />
                  </div>
               </div>
            </div>

            <div className="pt-2">
               <button 
                 onClick={scrollToPricing}
                 className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-black rounded-xl text-center text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group"
               >
                  <Zap size={14} fill="currentColor" className="group-hover:rotate-12 transition-transform" />
                  Nạp thêm Token
               </button>
            </div>
         </div>
      </div>

      {/* TECHNICAL SPECS HUB */}
      <div className="p-8 bg-slate-50 dark:bg-white/[0.02] border border-black/5 dark:border-white/10 rounded-[2rem] space-y-6 shadow-sm">
         <div className="flex items-center gap-3 border-b border-black/5 dark:border-white/5 pb-4">
            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-500 shadow-inner">
               <ShieldAlert size={18} />
            </div>
            <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-900 dark:text-white">Thông số kỹ thuật API</h4>
         </div>
         
         <div className="space-y-3">
            {specs.map(s => (
              <div key={s.l} className="flex justify-between items-center p-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/[0.03] transition-all group border border-transparent hover:border-black/5 dark:hover:border-white/5">
                 <div className="flex items-center gap-3 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors">
                    <div className={`${s.color} opacity-70 group-hover:opacity-100 transition-opacity`}>
                       {s.i}
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest">{s.l}</span>
                 </div>
                 <span className={`text-[10px] font-mono font-black italic group-hover:scale-105 transition-transform ${s.color}`}>
                   {s.v}
                 </span>
              </div>
            ))}
         </div>

         <div className="pt-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-black/5 dark:bg-white/5 rounded-lg border border-black/5 dark:border-white/5">
               <div className="w-1 h-1 rounded-full bg-brand-blue animate-pulse"></div>
               <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Telemetry Link: Synchronized</span>
            </div>
         </div>
      </div>
    </div>
  );
};
