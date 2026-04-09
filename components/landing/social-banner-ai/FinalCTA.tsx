import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { FadeInUp } from '../_shared/SectionAnimations';

interface FinalCTAProps {
  onStartStudio: () => void;
}

export const FinalCTA: React.FC<FinalCTAProps> = ({ onStartStudio }) => (
  <section className="px-6 lg:px-12 py-24 border-t border-black/[0.06] dark:border-white/[0.04] overflow-hidden">
    <div className="max-w-[1400px] mx-auto relative">
      {/* Subtle bg blobs */}
      <div className="absolute -top-24 left-1/4 w-[500px] h-[500px] bg-brand-blue/[0.04] rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute -bottom-24 right-1/4 w-[400px] h-[400px] bg-indigo-600/[0.03] rounded-full blur-[140px] pointer-events-none" />

      <FadeInUp className="text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-blue/[0.08] border border-brand-blue/15 rounded-full text-brand-blue text-[10px] font-semibold uppercase tracking-wider mb-6">
          <Sparkles size={11} /> Bắt đầu miễn phí với 1,000 Credits
        </div>

        <h2 className="text-4xl lg:text-5xl font-bold tracking-tight mb-5">
          Banner chuyên nghiệp<br />
          <span className="text-brand-blue">trong 60 giây</span>
        </h2>

        <p className="text-slate-500 dark:text-[#666] text-sm max-w-md mx-auto mb-8">
          Không cần thiết kế. Không cần nhớ kích thước. Chỉ cần ý tưởng — AI lo phần còn lại.
        </p>

        <motion.button
          onClick={onStartStudio}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          className="inline-flex items-center gap-3 bg-gradient-to-r from-brand-blue to-indigo-600 text-white px-12 py-4 rounded-xl text-[11px] font-bold uppercase tracking-widest shadow-xl shadow-brand-blue/20 hover:shadow-brand-blue/35 hover:brightness-110 transition-all group"
        >
          <Sparkles size={14} />
          Mở Banner Studio
          <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </motion.button>

        <p className="mt-4 text-[10px] text-slate-400 dark:text-[#555]">
          120 CR / banner · Thương mại tự do · Export HD
        </p>
      </FadeInUp>
    </div>
  </section>
);
