
import React from 'react';
import { Link } from 'react-router-dom';

interface FinalCTAProps {
  onStartStudio: () => void;
}

export const FinalCTA: React.FC<FinalCTAProps> = ({ onStartStudio }) => {
  return (
    <section className="py-60 text-center relative overflow-hidden bg-brand-blue text-white group transition-all duration-700">
      <div className="absolute inset-0 opacity-10 flex flex-wrap gap-4 p-8 pointer-events-none text-[220px] font-black text-white leading-none tracking-tighter select-none italic">
        VISUAL VISUAL VISUAL VISUAL
      </div>
      <div className="max-w-4xl mx-auto space-y-12 relative z-10 px-6">
        <h2 className="text-7xl lg:text-[140px] font-black uppercase tracking-tighter leading-[0.8] italic">Start <br /> <span className="text-slate-900">Synthesizing.</span></h2>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-10">
          <button 
            onClick={onStartStudio}
            className="bg-black text-white px-20 py-8 rounded-sm text-sm font-black uppercase tracking-widest hover:scale-110 transition-all shadow-2xl w-full sm:w-auto"
          >
            VÀO STUDIO NGAY
          </button>
          <Link to="/market" className="bg-white/10 text-white border border-white/20 px-20 py-8 rounded-sm text-sm font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all backdrop-blur-md w-full sm:w-auto">
            XEM GIẢI PHÁP KHÁC
          </Link>
        </div>
      </div>
    </section>
  );
};
