import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Wand2, RotateCcw, Layers, Zap, Shield } from 'lucide-react';
import { GradientMesh, FadeInUp, HoverCard } from '../_shared/SectionAnimations';
import { BeforeAfterSlider, FloatingBadge } from '../_shared/ProHeroVisuals';

interface HeroSectionProps {
  onStartStudio: () => void;
}

const SPECS = [
  { icon: <Wand2 size={12} />,   label: '4K / 8K Output',  sub: 'Chuẩn in ấn & display' },
  { icon: <Zap size={12} />,     label: 'Dưới 5 giây',     sub: 'H100 GPU cluster' },
  { icon: <Layers size={12} />,  label: '8 Preset modes',  sub: 'Portrait, wedding, colorize…' },
  { icon: <Shield size={12} />,  label: 'Privacy Vault',   sub: 'Tự xóa sau 24h' },
];

export const HeroSection: React.FC<HeroSectionProps> = ({ onStartStudio }) => {
  return (
    <section className="relative min-h-screen flex flex-col justify-center px-6 lg:px-12 py-20 overflow-hidden">
      <GradientMesh intensity="medium" />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.015] dark:opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(16,185,129,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.4) 1px, transparent 1px)`,
          backgroundSize: '70px 70px',
        }}
      />

      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center relative z-10">

        {/* ─── Left column ─── */}
        <div className="lg:col-span-5 space-y-8 order-2 lg:order-1">
          <FadeInUp delay={0}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-[0.2em]">
              <Sparkles size={12} className="animate-pulse" />
              Neural Restoration Engine v7
            </div>
          </FadeInUp>

          <FadeInUp delay={0.1}>
            <h1 className="text-5xl sm:text-6xl lg:text-[72px] xl:text-[82px] font-black leading-[0.9] tracking-tighter text-slate-900 dark:text-white">
              Hồi sinh<br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                Ký ức
              </span>{' '}
              lên<br />
              4K.
            </h1>
          </FadeInUp>

          <FadeInUp delay={0.2}>
            <p className="text-base lg:text-lg text-slate-500 dark:text-[#777] leading-relaxed border-l-2 border-emerald-500 pl-4 max-w-md">
              AI chuyên nghiệp phục chế ảnh cũ, mờ, xước — giữ trọn hồn cốt,
              nâng lên 4K sắc nét tuyệt đối trong vài giây.
            </p>
          </FadeInUp>

          {/* Stats row */}
          <FadeInUp delay={0.3}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {SPECS.map((s, i) => (
                <div
                  key={i}
                  className="flex flex-col gap-1 p-3 rounded-xl bg-white/60 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] backdrop-blur-sm"
                >
                  <div className="text-emerald-500">{s.icon}</div>
                  <p className="text-[11px] font-bold text-slate-800 dark:text-white leading-tight">{s.label}</p>
                  <p className="text-[9px] text-slate-400 dark:text-[#555] leading-tight">{s.sub}</p>
                </div>
              ))}
            </div>
          </FadeInUp>

          {/* CTAs */}
          <FadeInUp delay={0.4}>
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <motion.button
                onClick={onStartStudio}
                whileHover={{ scale: 1.03, boxShadow: '0 20px 60px rgba(16,185,129,0.3)' }}
                whileTap={{ scale: 0.97 }}
                className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/20 hover:brightness-110 transition-all inline-flex items-center justify-center gap-2.5 group"
              >
                <Wand2 size={16} />
                Khởi động Studio
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="px-8 py-4 border border-slate-200 dark:border-white/10 rounded-xl font-semibold text-sm text-slate-700 dark:text-white/80 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-all flex items-center justify-center gap-2 group"
              >
                <RotateCcw size={14} className="text-emerald-500" />
                Xem kết quả mẫu
              </motion.button>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-[#555] mt-3 flex items-center gap-2">
              <span>🔒 Miễn phí hoàn toàn</span>
              <span className="opacity-30">·</span>
              <span>✓ Ảnh xóa sau 24h</span>
              <span className="opacity-30">·</span>
              <span>⚡ Không cần cài đặt</span>
            </p>
          </FadeInUp>
        </div>

        {/* ─── Right column: BeforeAfterSlider ─── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, x: 30 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="lg:col-span-7 relative order-1 lg:order-2"
        >
          {/* Browser chrome */}
          <div className="rounded-2xl overflow-hidden shadow-2xl dark:shadow-[0_20px_80px_rgba(0,0,0,0.7)] border border-slate-200 dark:border-white/[0.06]">
            {/* Top bar */}
            <div className="flex items-center gap-2 px-4 py-3 bg-slate-100 dark:bg-[#111] border-b border-slate-200/80 dark:border-white/[0.05]">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/70" />
              <div className="mx-auto px-6 py-1 bg-white/70 dark:bg-white/5 rounded-full border border-slate-200 dark:border-white/10">
                <span className="text-[9px] font-mono text-slate-400 dark:text-[#555]">skyverses.ai/restore — Neural Core Active</span>
              </div>
            </div>

            {/* BeforeAfter visual */}
            <BeforeAfterSlider
              beforeSrc="https://images.unsplash.com/photo-1531259683007-016a7b628fc3?auto=format&fit=crop&q=30&w=1200"
              afterSrc="https://images.unsplash.com/photo-1531259683007-016a7b628fc3?auto=format&fit=crop&q=100&w=1200"
              beforeLabel="TRƯỚC"
              afterLabel="ĐÃ PHỤC CHẾ"
              className="aspect-[16/9]"
              accentColor="#10b981"
            />
          </div>

          {/* Floating badge */}
          <FloatingBadge
            className="-bottom-4 -right-4 lg:-right-6"
            icon={<Wand2 size={18} className="text-emerald-500" />}
            label="Output Quality"
            value="Ultra HD 4K"
            accentColor="emerald"
          />
        </motion.div>
      </div>
    </section>
  );
};
