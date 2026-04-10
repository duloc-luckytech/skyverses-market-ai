import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { GradientMesh, FadeInUp } from '../_shared/SectionAnimations';

interface FinalCTAProps {
  onStartStudio: () => void;
}

export const FinalCTA: React.FC<FinalCTAProps> = ({ onStartStudio }) => (
  <section className="py-24 px-6 lg:px-12 border-t border-black/[0.06] dark:border-white/[0.04] relative overflow-hidden">
    <GradientMesh intensity="strong" />
    <div className="max-w-3xl mx-auto text-center relative z-10">
      <FadeInUp>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/[0.08] border border-emerald-500/15 rounded-full text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold uppercase tracking-wider mb-6">
          <Sparkles size={12} /> AI Image Restoration
        </div>
        <h2 className="text-3xl lg:text-5xl font-bold mb-4 leading-tight">
          Hồi sinh những ký ức <br />
          <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            không thể mất
          </span>
        </h2>
        <p className="text-sm text-slate-500 dark:text-[#666] mb-8 max-w-lg mx-auto leading-relaxed">
          Ảnh cũ, ảnh hỏng, ảnh đen trắng — AI phục chế tất cả trong vài giây
        </p>
        <motion.button
          onClick={onStartStudio}
          whileHover={{ scale: 1.04, boxShadow: '0 20px 60px rgba(16,185,129,0.25)' }}
          whileTap={{ scale: 0.97 }}
          className="px-10 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold text-sm shadow-lg shadow-emerald-500/20 hover:brightness-110 transition-all inline-flex items-center gap-3 group"
        >
          <Sparkles size={18} />
          Phục Chế Ngay — Miễn Phí
          <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
        </motion.button>
        <p className="text-[11px] text-slate-400 dark:text-[#555] mt-4 flex items-center justify-center gap-2.5">
          <span>🔒 Không cần thẻ tín dụng</span>
          <span className="opacity-30">·</span>
          <span>✓ Ảnh xóa sau 24h</span>
          <span className="opacity-30">·</span>
          <span>⚡ 4K / 8K Output</span>
        </p>
      </FadeInUp>
    </div>
  </section>
);
