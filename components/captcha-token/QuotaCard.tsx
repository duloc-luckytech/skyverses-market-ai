
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Database, Activity, Cpu, Clock, Lock, Code2 } from 'lucide-react';
import { CaptchaAccount } from '../../hooks/useCaptchaToken';

interface QuotaCardProps {
  accountData: CaptchaAccount | null;
}

export const QuotaCard: React.FC<QuotaCardProps> = ({ accountData }) => {
  const specs = [
    { l: 'Bypass Engine', v: 'Neural V4.2', i: <Cpu size={12}/> },
    { l: 'Mean Latency', v: '242ms', i: <Clock size={12}/> },
    { l: 'Rate Limit', v: `${accountData?.apiKey?.rateLimit?.perMinute || 0} RPM`, i: <Activity size={12}/> },
    { l: 'Network Hash', v: 'VPC_AES_256', i: <Lock size={12}/> },
    { l: 'API Version', v: 'v2.0 Stable', i: <Code2 size={12}/> }
  ];

  const quotaRemaining = accountData?.apiKey?.quotaRemaining || 0;
  const progressWidth = Math.min(100, (quotaRemaining / 1000) * 100);

  return (
    <div className="lg:col-span-4 space-y-8">
      <div className="p-8 bg-white dark:bg-[#0d0d0f] border border-black/5 dark:border-white/10 rounded-[2.5rem] space-y-8 shadow-2xl relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Database size={120} />
         </div>
         <div className="space-y-6 relative z-10">
            <div className="flex justify-between items-center">
               <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic">Node Quota Status</span>
               <div className="flex items-center gap-2 text-emerald-500">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-[10px] font-black uppercase">UPLINK_STABLE</span>
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
               <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest text-right italic">Dung lượng giải mã khả dụng</p>
            </div>
            <Link to="/credits" className="block w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-black rounded-xl text-center text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] transition-all">
               Mua thêm Token
            </Link>
         </div>
      </div>

      <div className="p-8 bg-slate-50 dark:bg-white/[0.02] border border-black/5 dark:border-white/10 rounded-3xl space-y-6">
         <div className="flex items-center gap-3">
            <Activity size={18} className="text-indigo-500" />
            <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-900 dark:text-white">Node Diagnostics</h4>
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
