
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, LayoutGrid } from 'lucide-react';
import { FadeInUp, StaggerChildren, HoverCard, SectionLabel } from '../_shared/SectionAnimations';
import { AISLIDE_SHOWCASE } from '../../../src/constants/aislide-showcase-cdn';

// ─── Metadata per showcase card ───────────────────────────────────────────────

const SLIDE_META: Record<string, {
  category: string;
  slideCount: number;
  tagColor: string;
  subtitle: string;
}> = {
  'showcase-startup-pitch':       { category: 'Business',    slideCount: 12, tagColor: 'bg-brand-blue/20 text-blue-300 border-brand-blue/30',      subtitle: 'Series A — Fintech' },
  'showcase-marketing-campaign':  { category: 'Marketing',   slideCount: 8,  tagColor: 'bg-violet-500/20 text-violet-300 border-violet-500/30',     subtitle: 'Q4 Campaign' },
  'showcase-ml-education':        { category: 'Giáo dục',    slideCount: 15, tagColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',   subtitle: 'Học kỳ 2 — IT' },
  'showcase-quarterly-report':    { category: 'Corporate',   slideCount: 10, tagColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',         subtitle: 'Q3 2025 — Tổng kết' },
  'showcase-product-launch':      { category: 'Product',     slideCount: 9,  tagColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',            subtitle: 'SaaS Platform Launch' },
  'showcase-medical-conf':        { category: 'Healthcare',  slideCount: 14, tagColor: 'bg-sky-500/20 text-sky-300 border-sky-500/30',               subtitle: 'VNMC 2025 — Cardiology' },
  'showcase-realestate':          { category: 'Real Estate', slideCount: 11, tagColor: 'bg-orange-500/20 text-orange-300 border-orange-500/30',      subtitle: 'Investment Deck' },
  'showcase-ecommerce':           { category: 'E-commerce',  slideCount: 8,  tagColor: 'bg-pink-500/20 text-pink-300 border-pink-500/30',            subtitle: 'Growth Strategy' },
  'showcase-hr-recruitment':      { category: 'HR',          slideCount: 7,  tagColor: 'bg-teal-500/20 text-teal-300 border-teal-500/30',            subtitle: 'Talent Acquisition' },
  'showcase-fintech-demo':        { category: 'Fintech',     slideCount: 10, tagColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',            subtitle: 'Demo Day 2025' },
  'showcase-travel':              { category: 'Du lịch',     slideCount: 9,  tagColor: 'bg-lime-500/20 text-lime-300 border-lime-500/30',            subtitle: 'Vietnam Tourism' },
  'showcase-tech-summit':         { category: 'Tech',        slideCount: 13, tagColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',      subtitle: 'Innovation Summit' },
};

// ─── Single showcase card ──────────────────────────────────────────────────────

interface ShowcaseCardProps {
  id: string;
  cdnUrl: string;
  label: string;
  desc: string;
  index: number;
}

const ShowcaseCard: React.FC<ShowcaseCardProps> = ({ id, cdnUrl, label, desc, index }) => {
  const [hovered, setHovered] = useState(false);
  const meta = SLIDE_META[id] ?? { category: 'Slide', slideCount: 10, tagColor: 'bg-white/10 text-white/60 border-white/10', subtitle: '' };

  return (
    <motion.div
      variants={{
        hidden:  { opacity: 0, y: 24 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative"
    >
      <HoverCard className="overflow-hidden cursor-default">
        {/* Real CDN image */}
        <div className="relative aspect-video overflow-hidden bg-slate-900">
          <motion.img
            src={cdnUrl}
            alt={label}
            loading="lazy"
            animate={hovered ? { scale: 1.04 } : { scale: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="w-full h-full object-cover"
          />

          {/* Overlay badges */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

          {/* Top badges */}
          <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
            <span className={`text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border backdrop-blur-sm ${meta.tagColor}`}>
              {meta.category}
            </span>
            <div className="flex items-center gap-1 bg-black/40 backdrop-blur-sm rounded-full px-2 py-0.5">
              <LayoutGrid size={7} className="text-white/60" />
              <span className="text-[8px] text-white/60 font-medium">{meta.slideCount} slides</span>
            </div>
          </div>

          {/* Bottom title overlay */}
          <div className="absolute bottom-3 left-3 right-3">
            <h3 className="text-sm font-black text-white leading-tight drop-shadow">{label}</h3>
            {meta.subtitle && (
              <p className="text-[9px] text-white/60 mt-0.5">{meta.subtitle}</p>
            )}
          </div>

          {/* AI badge on hover */}
          <AnimatePresence>
            {hovered && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.18 }}
                className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm"
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
            <p className="text-[11px] font-semibold text-slate-700 dark:text-white/80 leading-none truncate max-w-[160px]">{label}</p>
            <p className="text-[9px] text-slate-400 dark:text-white/30 mt-0.5">{desc}</p>
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

// ─── ShowcaseSection ───────────────────────────────────────────────────────────

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

      {/* 3×4 grid of real CDN images */}
      <StaggerChildren
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        staggerDelay={0.07}
      >
        {AISLIDE_SHOWCASE.map((item, i) => (
          <ShowcaseCard
            key={item.id}
            id={item.id}
            cdnUrl={item.cdnUrl}
            label={item.label}
            desc={item.desc}
            index={i}
          />
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
