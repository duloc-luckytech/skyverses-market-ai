import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap } from 'lucide-react';

interface FinalCTAProps { onStartStudio: () => void; }

export const FinalCTA: React.FC<FinalCTAProps> = ({ onStartStudio }) => (
  <section className="py-32 text-center relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800">
    <div className="absolute inset-0 opacity-[0.03] pointer-events-none select-none text-[160px] font-bold text-white leading-none tracking-tight flex items-center justify-center whitespace-nowrap">
      MOTION MOTION
    </div>
    <div className="max-w-2xl mx-auto space-y-8 relative z-10 px-6">
      <div className="space-y-4">
        <h2 className="text-4xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
          Bắt đầu <br /><span className="text-white/40">sáng tạo.</span>
        </h2>
        <p className="text-sm text-white/50 font-medium max-w-md mx-auto">
          Truy cập Video Studio ngay để trải nghiệm sản xuất video AI thế hệ mới.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          onClick={onStartStudio}
          className="bg-white text-indigo-700 px-8 py-3.5 rounded-xl text-[10px] font-semibold uppercase tracking-widest hover:scale-105 transition-all shadow-xl flex items-center gap-2 group"
        >
          <Zap size={14} fill="currentColor" /> Vào Studio <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
        </button>
        <Link to="/market" className="bg-white/10 text-white/80 border border-white/15 px-8 py-3.5 rounded-xl text-[10px] font-semibold uppercase tracking-widest hover:bg-white/20 transition-all backdrop-blur-md">
          Xem giải pháp khác
        </Link>
      </div>
    </div>
  </section>
);
