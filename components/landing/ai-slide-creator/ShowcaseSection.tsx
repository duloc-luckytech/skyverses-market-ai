
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, LayoutGrid } from 'lucide-react';
import { FadeInUp, StaggerChildren, HoverCard, SectionLabel } from '../_shared/SectionAnimations';

// ─── Slide showcase data — CSS-gradient previews ──────────────────────────────

interface SlideCard {
  id: string;
  topic: string;
  subtitle: string;
  category: string;
  slideCount: number;
  gradient: string;
  accentGradient: string;
  textColor: string;
  tagColor: string;
  bullets: string[];
}

const SLIDES: SlideCard[] = [
  {
    id: 'pitch-deck',
    topic: 'Startup Pitch Deck',
    subtitle: 'Series A — Fintech',
    category: 'Business',
    slideCount: 12,
    gradient: 'from-slate-900 via-blue-950 to-indigo-950',
    accentGradient: 'from-brand-blue/40 to-indigo-500/20',
    textColor: 'text-blue-200',
    tagColor: 'bg-brand-blue/20 text-blue-300 border-brand-blue/30',
    bullets: ['Problem & Solution', 'Market Size $4B', 'Revenue Model'],
  },
  {
    id: 'marketing',
    topic: 'Chiến Lược Marketing',
    subtitle: 'Q4 2025 Campaign',
    category: 'Marketing',
    slideCount: 8,
    gradient: 'from-violet-950 via-purple-900 to-fuchsia-950',
    accentGradient: 'from-violet-500/40 to-fuchsia-500/20',
    textColor: 'text-violet-200',
    tagColor: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
    bullets: ['Brand Awareness ↑60%', 'Social Media x3', 'ROI Target 250%'],
  },
  {
    id: 'education',
    topic: 'Machine Learning 101',
    subtitle: 'Khóa học kỳ 2 — IT',
    category: 'Giáo dục',
    slideCount: 15,
    gradient: 'from-emerald-950 via-teal-900 to-cyan-950',
    accentGradient: 'from-emerald-500/40 to-cyan-500/20',
    textColor: 'text-emerald-200',
    tagColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    bullets: ['Neural Networks', 'Training Pipeline', 'Real Applications'],
  },
  {
    id: 'business-report',
    topic: 'Báo Cáo Tăng Trưởng',
    subtitle: 'Q3 2025 — Tổng kết',
    category: 'Corporate',
    slideCount: 10,
    gradient: 'from-amber-950 via-orange-900 to-red-950',
    accentGradient: 'from-amber-500/40 to-orange-500/20',
    textColor: 'text-amber-200',
    tagColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    bullets: ['Revenue +42% YoY', 'Market Share 18%', 'Next Quarter Plan'],
  },
  {
    id: 'product-launch',
    topic: 'Ra Mắt Sản Phẩm Mới',
    subtitle: 'SaaS Platform Launch',
    category: 'Product',
    slideCount: 9,
    gradient: 'from-rose-950 via-pink-900 to-violet-950',
    accentGradient: 'from-rose-500/40 to-pink-500/20',
    textColor: 'text-rose-200',
    tagColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    bullets: ['Core Features', 'Pricing Tiers', 'Launch Roadmap'],
  },
  {
    id: 'healthcare',
    topic: 'Medical Conference',
    subtitle: 'VNMC 2025 — Cardiology',
    category: 'Healthcare',
    slideCount: 14,
    gradient: 'from-sky-950 via-blue-900 to-indigo-950',
    accentGradient: 'from-sky-500/40 to-blue-500/20',
    textColor: 'text-sky-200',
    tagColor: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
    bullets: ['Clinical Findings', 'Case Studies ×3', 'Recommendations'],
  },
];

// ─── Single slide card ─────────────────────────────────────────────────────────

const ShowcaseCard: React.FC<{ card: SlideCard; index: number }> = ({ card, index }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 24 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative"
    >
      <HoverCard className="overflow-hidden cursor-default">
        {/* Gradient background preview */}
        <div className={`relative aspect-video bg-gradient-to-br ${card.gradient} overflow-hidden`}>
          {/* Accent blob */}
          <motion.div
            animate={hovered
              ? { scale: 1.2, opacity: 0.6 }
              : { scale: 1, opacity: 0.35 }}
            transition={{ duration: 0.5 }}
            className={`absolute top-0 right-0 w-3/4 h-3/4 bg-gradient-to-bl ${card.accentGradient} rounded-full blur-3xl`}
          />

          {/* Slide content mock */}
          <div className="relative z-10 flex flex-col justify-between h-full p-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <span className={`text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${card.tagColor}`}>
                {card.category}
              </span>
              <div className="flex items-center gap-1 bg-black/30 backdrop-blur-sm rounded-full px-2 py-0.5">
                <LayoutGrid size={7} className="text-white/60" />
                <span className="text-[8px] text-white/60 font-medium">{card.slideCount} slides</span>
              </div>
            </div>

            {/* Title */}
            <div className="space-y-1">
              <h3 className="text-sm font-black text-white leading-tight drop-shadow">{card.topic}</h3>
              <p className={`text-[9px] font-medium ${card.textColor}`}>{card.subtitle}</p>
            </div>

            {/* Bullet previews */}
            <div className="space-y-0.5">
              {card.bullets.map((b, bi) => (
                <div key={bi} className="flex items-center gap-1.5">
                  <div className="w-1 h-1 rounded-full bg-white/40 shrink-0" />
                  <p className="text-[8px] text-white/55 truncate">{b}</p>
                </div>
              ))}
            </div>
          </div>

          {/* AI badge overlay on hover */}
          <AnimatePresence>
            {hovered && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.18 }}
                className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 rounded-lg bg-black/50 backdrop-blur-sm"
              >
                <Sparkles size={9} className="text-brand-blue" />
                <span className="text-[8px] font-bold text-white">AI Generated</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Card footer */}
        <div className="px-3 py-2.5 flex items-center justify-between border-t border-black/[0.04] dark:border-white/[0.04]">
          <div>
            <p className="text-[11px] font-semibold text-slate-700 dark:text-white/80 leading-none">{card.topic}</p>
            <p className="text-[9px] text-slate-400 dark:text-white/30 mt-0.5">{card.category}</p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {[0, 1, 2].map(d => (
              <motion.div
                key={d}
                animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.4, repeat: Infinity, delay: d * 0.22 + index * 0.1 }}
                className="w-1.5 h-1.5 rounded-full bg-brand-blue/50"
              />
            ))}
          </div>
        </div>
      </HoverCard>
    </motion.div>
  );
};

// ─── ShowcaseSection ──────────────────────────────────────────────────────────

export const ShowcaseSection: React.FC = () => (
  <section className="py-20 px-6 border-t border-black/[0.06] dark:border-white/[0.04] bg-black/[0.01] dark:bg-white/[0.01]">
    <div className="max-w-[1400px] mx-auto">

      {/* Header */}
      <FadeInUp className="text-center mb-12">
        <SectionLabel>SHOWCASE</SectionLabel>
        <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-3">
          Slide từ mọi ngành — tạo bởi AI
        </h2>
        <p className="text-base text-slate-500 dark:text-white/40 max-w-lg mx-auto">
          Mỗi deck được tạo từ 1 dòng prompt. AI sinh nội dung + ảnh nền riêng biệt cho từng slide.
        </p>
      </FadeInUp>

      {/* 3×2 grid of slide cards */}
      <StaggerChildren
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        staggerDelay={0.08}
      >
        {SLIDES.map((card, i) => (
          <ShowcaseCard key={card.id} card={card} index={i} />
        ))}
      </StaggerChildren>

      {/* Bottom CTA */}
      <FadeInUp delay={0.15} className="mt-12 text-center">
        <p className="text-sm text-slate-400 dark:text-[#555] mb-4">
          Tạo deck tương tự chỉ trong{' '}
          <strong className="text-slate-700 dark:text-white/80">2 phút</strong>
        </p>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-blue/[0.08] border border-brand-blue/15 text-brand-blue text-[11px] font-semibold">
          <Sparkles size={11} />
          100% AI Generated — Hoàn toàn miễn phí
        </div>
      </FadeInUp>
    </div>
  </section>
);
