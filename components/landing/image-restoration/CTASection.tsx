
import React from 'react';
import { Zap } from 'lucide-react';

interface CTASectionProps {
  onStartStudio: () => void;
}

export const CTASection: React.FC<CTASectionProps> = ({ onStartStudio }) => {
  return (
    <section className="py-40 lg:py-60 text-center relative overflow-hidden bg-white dark:bg-black border-t border-slate-100 dark:border-white/5 transition-colors">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] bg-emerald-500/5 rounded-full blur-[250px] pointer-events-none"></div>
      <div className="max-w-4xl mx-auto space-y-16 relative z-10 px-6">
        <h2 className="text-6xl sm:text-7xl lg:text-[120px] xl:text-[140px] font-black uppercase tracking-tighter leading-[0.8] italic text-slate-900 dark:text-white">
          Save the <br /> <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">History.</span>
        </h2>
        <div className="space-y-10 pt-10">
          <button 
            onClick={onStartStudio}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-16 sm:px-24 py-6 sm:py-8 rounded-xl text-sm font-black uppercase tracking-[0.5em] shadow-[0_40px_100px_rgba(16,185,129,0.4)] hover:scale-110 active:scale-95 transition-all flex items-center gap-6 mx-auto group"
          >
            Phục chế ngay <Zap size={24} fill="currentColor" className="group-hover:scale-110 transition-transform" />
          </button>
          <p className="text-slate-500 dark:text-gray-500 font-black uppercase tracking-[0.3em] sm:tracking-[0.5em] text-[9px] sm:text-[10px] italic">Universal Credit Ready • 4K/8K Output • Instant Export</p>
        </div>
      </div>
    </section>
  );
};
