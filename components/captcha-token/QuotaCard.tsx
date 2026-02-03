
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Database, Activity, Cpu, Clock, Lock, Code2, ShieldCheck, Zap } from 'lucide-react';
import { CaptchaAccount } from '../../hooks/useCaptchaToken';

interface QuotaCardProps {
  accountData: CaptchaAccount | null;
}

export const QuotaCard: React.FC<QuotaCardProps> = ({ accountData }) => {
  const quotaRemaining = accountData?.apiKey?.quotaRemaining || 0;
  const totalTokens = accountData?.apiKey?.totalTokens || 0;
  const usedTokens = accountData?.apiKey?.usedTokens || 0;
  const currentPlan = accountData?.apiKey?.planName || accountData?.apiKey?.plan || 'Free';
  
  const specs = [
    { l: 'Gói dịch vụ', v: currentPlan, i: <ShieldCheck size={12}/> },
    { l: 'Tổng Tokens', v: totalTokens.toLocaleString(), i: <Zap size={12} fill="currentColor"/> },
    { l: 'Đã sử dụng', v: usedTokens.toLocaleString(), i: <Activity size={12}/> },
    { l: 'Tốc độ trung bình', v: '5-10s / Request', i: <Clock size={12}/> }
  ];

  const progressWidth = totalTokens > 0 ? Math.min(100, (quotaRemaining / totalTokens) * 100) : (quotaRemaining > 0 ? 100 : 0);

  return (
    <div className="lg:col-span-4 space-y-8">
      <div className="p-8 bg-white dark:bg-[#0d0d0f] border border-black/5 dark:border-white/10 rounded-[2.5rem] space-y-8 shadow-2xl relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Database size={120} />
         </div>
         <div className="space-y-6 relative z-10">
            <div className="flex justify-between items-center">
               <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic">Gói hiện tại</span>
                  <span className={`text-sm font-black uppercase italic ${
                    currentPlan.toLowerCase().includes('pro') ? 'text-indigo-600' : currentPlan.toLowerCase().includes('basic') ? 'text-blue-500' : 'text-slate-400'
                  }`}>{currentPlan}</span>
               </div>
               <div className="flex items-center gap-2 text-emerald-500">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-[10px] font-black uppercase">SYSTEM_ONLINE</span>
               </div>
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
                    animate={{ width: `${progressWidth}%` }} 
                    transition={{ duration: 1.5 }} 
                    className="h-full bg-indigo-600 shadow-[0_0_15px_rgba(99,102,241,0.5)]" 
                  />
               </div>
               <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest text-right italic">Số token còn lại</p>
            </div>
            <Link to="/credits" className="block w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-black rounded-xl text-center text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] transition-all">
               Nạp thêm Token
            </Link>
         </div>
      </div>

      <div className="p-8 bg-slate-50 dark:bg-white/[0.02] border border-black/5 dark:border-white/10 rounded-3xl space-y-6">
         <div className="flex items-center gap-3">
            <Activity size={18} className="text-indigo-500" />
            <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-900 dark:text-white">Thông số kỹ thuật</h4>
         </div>
         <div className="space-y-4">
            {specs.map(s => (
              <div key={s.l} className="flex justify-between items-center border-b border-black/5 dark:border-white/5 pb-3">
                 <div className="flex items-center gap-3 text-slate-400">
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
