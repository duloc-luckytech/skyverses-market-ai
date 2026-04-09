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
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-blue/[0.08] border border-brand-blue/15 rounded-full text-brand-blue text-[10px] font-semibold uppercase tracking-wider mb-6">
          <Sparkles size={12} /> Real Estate Visual AI
        </div>
        <h2 className="text-3xl lg:text-5xl font-bold mb-4 leading-tight">
          Bắt đầu tạo ảnh BĐS chuyên nghiệp <br />
          <span className="text-brand-blue">ngay hôm nay</span>
        </h2>
        <p className="text-sm text-slate-500 dark:text-[#666] mb-8 max-w-lg mx-auto leading-relaxed">
          Không cần designer, không cần studio — AI làm tất cả trong vài giây
        </p>
        <motion.button
          onClick={onStartStudio}
          whileHover={{ scale: 1.04, boxShadow: '0 20px 60px rgba(0,144,255,0.25)' }}
          whileTap={{ scale: 0.97 }}
          className="px-10 py-4 bg-gradient-to-r from-brand-blue to-blue-500 text-white rounded-xl font-semibold text-sm shadow-lg shadow-brand-blue/20 hover:brightness-110 transition-all inline-flex items-center gap-3 group"
        >
          <Sparkles size={18} />
          ✨ Tạo Ngay — 100 CR Miễn Phí
          <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
        </motion.button>
        <p className="text-[11px] text-slate-400 dark:text-[#555] mt-4 flex items-center justify-center gap-2.5">
          <span>🔒 Không cần thẻ tín dụng</span>
          <span className="opacity-30">·</span>
          <span>✓ Ảnh thuộc về bạn</span>
          <span className="opacity-30">·</span>
          <span>⚡ 100 CR miễn phí khi đăng ký</span>
        </p>
      </FadeInUp>
    </div>
  </section>
);
