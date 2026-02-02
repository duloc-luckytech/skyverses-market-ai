
import React from 'react';
import { motion } from 'framer-motion';
import { Code2, Globe, Zap, Terminal, ShieldCheck, Database, Activity, Network, Boxes } from 'lucide-react';

interface DeveloperPortalProps {
  onApply: () => void;
}

export const DeveloperPortal: React.FC<DeveloperPortalProps> = ({ onApply }) => {
  return (
    <section className="py-40 bg-slate-50 dark:bg-[#08080a] relative overflow-hidden transition-colors duration-500">
      <div className="absolute right-0 top-0 opacity-10 translate-x-1/2 -translate-y-1/2">
        <Globe size={800} strokeWidth={0.5} className="text-brand-blue" />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
        <div className="space-y-12">
          <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
              className="inline-flex items-center gap-3 px-4 py-1.5 bg-brand-blue/10 border border-brand-blue/20 rounded-full text-brand-blue text-[9px] font-black uppercase tracking-[0.3em] italic"
            >
              <Code2 size={12} /> DÀNH CHO NHÀ PHÁT TRIỂN
            </motion.div>
            <h2 className="text-5xl lg:text-7xl font-black uppercase tracking-tighter italic leading-none text-slate-900 dark:text-white">Architecture <br /> <span className="text-brand-blue">Portal.</span></h2>
            <p className="text-xl text-slate-500 dark:text-gray-400 font-medium leading-relaxed italic">
              Chúng tôi cung cấp các bộ SDK và API chuyên dụng để bạn tích hợp kịch bản AI vào quy trình hiện có.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {[
              { t: 'High-Speed API', d: 'Endpoint độ trễ thấp phục vụ ứng dụng real-time.', i: <Zap /> },
              { t: 'Unified SDK', d: 'Phát triển đa ngôn ngữ: Python, JS, C#.', i: <Terminal /> },
              { t: 'VPC Sync', d: 'Môi trường đám mây riêng biệt cho mỗi dự án.', i: <ShieldCheck /> },
              { t: 'Asset Registry', d: 'Quản lý tập trung mọi tài sản kỹ thuật số.', i: <Database /> }
            ].map((item, i) => (
              <div key={i} className="space-y-3 group">
                <div className="w-10 h-10 bg-brand-blue/10 rounded-xl flex items-center justify-center text-brand-blue group-hover:scale-110 transition-transform shadow-sm">
                  {React.cloneElement(item.i as React.ReactElement, { size: 20 })}
                </div>
                <h4 className="text-sm font-black uppercase italic tracking-tight text-slate-800 dark:text-white">{item.t}</h4>
                <p className="text-xs text-slate-500 dark:text-gray-400 font-medium">"{item.d}"</p>
              </div>
            ))}
          </div>

          <button 
            onClick={onApply}
            className="px-16 py-6 bg-brand-blue text-white rounded-full text-xs font-black uppercase tracking-[0.4em] shadow-xl shadow-brand-blue/20 hover:scale-105 active:scale-95 transition-all"
          >
            Đăng ký Developer Access
          </button>
        </div>

        <div className="relative group">
          <div className="absolute inset-0 bg-brand-blue/10 blur-[120px] rounded-full animate-pulse"></div>
          <div className="relative p-12 lg:p-20 bg-white dark:bg-[#0d0d0f] border border-black/5 dark:border-white/10 rounded-[3.5rem] shadow-3xl overflow-hidden transition-colors">
            <div className="space-y-10 relative z-10">
              <div className="flex justify-between items-center border-b border-black/5 dark:border-white/5 pb-8">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">Network Health: 99.9%</span>
                <Activity size={24} className="text-emerald-500 animate-pulse" />
              </div>
              <div className="space-y-6">
                {[0.8, 1, 0.9, 0.7].map((w, i) => (
                  <div key={i} className="h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }} whileInView={{ width: `${w * 100}%` }}
                      className="h-full bg-brand-blue"
                    />
                  </div>
                ))}
              </div>
              <div className="pt-10 flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-white/5 border border-black/5 dark:border-white/10 flex items-center justify-center"><Code2 size={24} className="text-gray-300" /></div>
                <div className="w-12 h-12 rounded-xl bg-brand-blue/10 border border-brand-blue/30 flex items-center justify-center"><Network size={24} className="text-brand-blue" /></div>
                <div className="flex-grow"></div>
                <Boxes size={48} className="text-slate-200 dark:text-gray-800" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
