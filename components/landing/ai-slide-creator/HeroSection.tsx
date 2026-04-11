
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ChevronLeft, Sparkles, Layers, Download,
  Edit3, Zap, Layout, Globe,
} from 'lucide-react';
import {
  GradientMesh, FadeInUp, HoverCard, SectionLabel,
} from '../_shared/SectionAnimations';
import { FloatingBadge, AIBadge } from '../_shared/ProHeroVisuals';

interface HeroSectionProps { onStartStudio: () => void; }

const SPECS = [
  { icon: <Layers size={12} />,   label: '5 Layouts',       sub: 'Center, Left, 2-col, Full BG, Image' },
  { icon: <Zap size={12} />,      label: '< 2 phút',        sub: 'Tạo toàn bộ deck trong 2 phút' },
  { icon: <Layout size={12} />,   label: 'BG AI mỗi slide', sub: 'Mỗi slide 1 ảnh nền riêng biệt' },
  { icon: <Download size={12} />, label: 'PPTX/PDF/PNG',     sub: 'Xuất file ngay, dùng được liền' },
];

// Mock slide previews for the hero visual
const MOCK_SLIDES = [
  {
    id: 's1',
    label: 'Corporate',
    title: 'Q3 Business Strategy',
    body: '• Revenue Growth +42%\n• Market Expansion\n• New Product Launch',
    gradient: 'from-slate-900 via-blue-950 to-indigo-950',
    accent: 'bg-brand-blue',
  },
  {
    id: 's2',
    label: 'Creative',
    title: 'Marketing Campaign 2025',
    body: '• Brand Awareness ↑\n• Social Media x3\n• Influencer Network',
    gradient: 'from-violet-900 via-purple-900 to-fuchsia-950',
    accent: 'bg-fuchsia-400',
  },
  {
    id: 's3',
    label: 'Minimal',
    title: 'Startup Pitch Deck',
    body: '• Problem We Solve\n• Our Solution\n• $2M Seed Round',
    gradient: 'from-zinc-900 via-zinc-800 to-slate-900',
    accent: 'bg-white',
  },
  {
    id: 's4',
    label: 'Education',
    title: 'Machine Learning 101',
    body: '• Neural Networks\n• Training Data\n• Real-world Applications',
    gradient: 'from-emerald-900 via-teal-900 to-cyan-950',
    accent: 'bg-emerald-400',
  },
];

const SlidePreviewCard: React.FC<{
  slide: typeof MOCK_SLIDES[0];
  isActive: boolean;
  onClick: () => void;
  delay: number;
}> = ({ slide, isActive, onClick, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    onClick={onClick}
    className={`relative cursor-pointer rounded-xl overflow-hidden border-2 transition-all duration-300 aspect-video
      ${isActive
        ? 'border-brand-blue shadow-lg shadow-brand-blue/25 scale-[1.02]'
        : 'border-white/10 hover:border-white/30 hover:scale-[1.01]'
      }`}
  >
    {/* BG gradient */}
    <div className={`absolute inset-0 bg-gradient-to-br ${slide.gradient}`} />
    {/* Animated orb */}
    <motion.div
      animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: delay * 2 }}
      className={`absolute top-0 right-0 w-24 h-24 ${slide.accent}/20 rounded-full blur-2xl`}
    />
    {/* Slide number badge */}
    <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-black/40 backdrop-blur text-white text-[8px] font-bold">
      {slide.label}
    </div>
    {/* Content */}
    <div className="absolute inset-0 flex flex-col justify-center px-4 py-3">
      <p className="text-white font-bold text-[10px] leading-tight mb-1.5 drop-shadow">{slide.title}</p>
      <p className="text-white/60 text-[8px] leading-relaxed whitespace-pre-line line-clamp-3">{slide.body}</p>
    </div>
    {/* Active indicator */}
    {isActive && (
      <motion.div
        layoutId="active-border"
        className="absolute inset-0 border-2 border-brand-blue rounded-xl"
      />
    )}
  </motion.div>
);

export const HeroSection: React.FC<HeroSectionProps> = ({ onStartStudio }) => {
  const [activeSlide, setActiveSlide] = useState(0);

  return (
    <section className="relative overflow-hidden pt-12 pb-20 px-6">
      <GradientMesh intensity="soft" />

      <div className="relative z-10 max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        {/* ── Left column ─────────────────────────────────────────────────── */}
        <div className="lg:col-span-5 space-y-6">
          <FadeInUp delay={0}>
            <Link
              to="/markets"
              className="inline-flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-white/40 hover:text-brand-blue transition-colors mb-2"
            >
              <ChevronLeft size={13} />
              Trở lại Marketplace
            </Link>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-blue/[0.08] border border-brand-blue/20 text-brand-blue text-[11px] font-bold">
              <Sparkles size={11} />
              Mới · Miễn phí hoàn toàn
            </div>
          </FadeInUp>

          <FadeInUp delay={0.08}>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white leading-[1.1] tracking-tight">
              Tạo Slide
              <br />
              <span className="relative text-brand-blue inline-block">
                Trình Chiếu AI
                <motion.span
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.5, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute -bottom-1 left-0 right-0 h-[3px] bg-brand-blue/30 rounded-full origin-left"
                />
              </span>
            </h1>
          </FadeInUp>

          <FadeInUp delay={0.14}>
            <p className="text-base text-slate-500 dark:text-white/50 leading-relaxed max-w-md">
              Nhập chủ đề → AI tạo nội dung + ảnh nền <strong className="text-slate-700 dark:text-white/80">riêng cho từng slide</strong> → Chỉnh trực tiếp trên canvas → Xuất PPTX / PDF / PNG.
            </p>
          </FadeInUp>

          {/* Key specs */}
          <FadeInUp delay={0.2}>
            <div className="grid grid-cols-2 gap-3">
              {SPECS.map((spec, i) => (
                <HoverCard key={i} className="p-3 bg-black/[0.01] dark:bg-white/[0.02]">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 rounded-lg bg-brand-blue/10 flex items-center justify-center text-brand-blue">
                      {spec.icon}
                    </div>
                    <span className="text-[12px] font-bold text-slate-800 dark:text-white">{spec.label}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 dark:text-white/30 leading-tight pl-8">{spec.sub}</p>
                </HoverCard>
              ))}
            </div>
          </FadeInUp>

          {/* CTA */}
          <FadeInUp delay={0.26}>
            <div className="flex flex-col sm:flex-row gap-3">
              <motion.button
                onClick={onStartStudio}
                whileHover={{ scale: 1.03, boxShadow: '0 12px 32px rgba(0,144,255,0.3)' }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-2xl bg-brand-blue text-white font-bold text-sm shadow-xl shadow-brand-blue/20 hover:bg-brand-blue/90 transition-all"
              >
                <Sparkles size={15} />
                Mở AI Slide Studio
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl border border-black/[0.08] dark:border-white/[0.08] text-sm font-medium text-slate-600 dark:text-white/60 hover:border-brand-blue/40 hover:text-brand-blue transition-all"
              >
                <Globe size={14} />
                Xem ví dụ
              </motion.button>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-white/25 mt-3">
              ✅ Miễn phí · Không cần đăng nhập để thử · Xuất không giới hạn
            </p>
          </FadeInUp>
        </div>

        {/* ── Right column — fake workspace mockup ──────────────────────── */}
        <FadeInUp delay={0.18} className="lg:col-span-7 relative">
          <div className="relative">
            {/* App chrome */}
            <div className="bg-white dark:bg-[#0f0f11] rounded-2xl border border-black/[0.06] dark:border-white/[0.04] shadow-2xl overflow-hidden">
              {/* Fake titlebar */}
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-black/[0.05] dark:border-white/[0.05] bg-black/[0.01] dark:bg-white/[0.01]">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/70" />
                </div>
                <div className="flex items-center gap-2">
                  <Layers size={11} className="text-brand-blue" />
                  <span className="text-[10px] font-bold text-slate-600 dark:text-white/50">AI Slide Creator</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[8px] font-bold">🆓 Free</span>
                  <div className="w-6 h-4 rounded bg-brand-blue/20 flex items-center justify-center">
                    <Download size={8} className="text-brand-blue" />
                  </div>
                </div>
              </div>

              {/* Fake workspace body */}
              <div className="flex h-[340px]">
                {/* Left thumbnails strip */}
                <div className="w-[80px] border-r border-black/[0.05] dark:border-white/[0.04] flex flex-col gap-1.5 p-2 bg-black/[0.01] dark:bg-white/[0.01] overflow-hidden">
                  {MOCK_SLIDES.map((slide, i) => (
                    <div
                      key={slide.id}
                      onClick={() => setActiveSlide(i)}
                      className={`relative aspect-video rounded cursor-pointer overflow-hidden border transition-all
                        ${activeSlide === i ? 'border-brand-blue' : 'border-transparent hover:border-white/20'}`}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${slide.gradient}`} />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <p className="text-white text-[6px] font-bold text-center px-1 drop-shadow leading-tight">{slide.title.split(' ').slice(0, 2).join(' ')}</p>
                      </div>
                      {activeSlide === i && <div className="absolute inset-0 border border-brand-blue rounded" />}
                    </div>
                  ))}
                </div>

                {/* Main canvas area */}
                <div className="flex-1 flex flex-col">
                  {/* Fake toolbar */}
                  <div className="flex items-center gap-2 px-3 py-2 border-b border-black/[0.05] dark:border-white/[0.04] bg-white/50 dark:bg-[#0f0f11]/50">
                    {['Giữa', 'Trái', '2 cột'].map(l => (
                      <div key={l} className="px-2 py-0.5 rounded bg-black/[0.04] dark:bg-white/[0.04] text-[8px] text-slate-500 dark:text-white/40">{l}</div>
                    ))}
                    <div className="ml-auto flex items-center gap-1.5">
                      <div className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 text-[8px] font-medium flex items-center gap-1">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                          className="w-2 h-2 border border-amber-500 border-t-transparent rounded-full"
                        />
                        Đang gen BG...
                      </div>
                      <div className="px-2 py-0.5 rounded bg-brand-blue/10 text-brand-blue text-[8px] font-medium flex items-center gap-1">
                        <Sparkles size={8} />
                        AI Gợi ý
                      </div>
                    </div>
                  </div>

                  {/* Active slide canvas */}
                  <div className="flex-1 p-3 flex items-center justify-center bg-slate-100 dark:bg-[#0a0a0c]">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeSlide}
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className={`w-full aspect-video relative rounded-xl overflow-hidden bg-gradient-to-br ${MOCK_SLIDES[activeSlide].gradient} shadow-xl`}
                      >
                        <motion.div
                          animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.5, 0.3] }}
                          transition={{ duration: 5, repeat: Infinity }}
                          className={`absolute top-0 right-0 w-32 h-32 ${MOCK_SLIDES[activeSlide].accent}/20 rounded-full blur-2xl`}
                        />
                        <div className="absolute inset-0 bg-black/35 flex flex-col justify-center px-8">
                          <div className="flex items-center gap-1.5 mb-3">
                            <Edit3 size={8} className="text-white/40" />
                            <span className="text-[8px] text-white/40">Click để chỉnh sửa</span>
                          </div>
                          <p className="text-white font-black text-lg leading-tight mb-2 drop-shadow-md">{MOCK_SLIDES[activeSlide].title}</p>
                          <p className="text-white/70 text-[10px] leading-relaxed whitespace-pre-line">{MOCK_SLIDES[activeSlide].body}</p>
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>

                {/* Right sidebar snippet */}
                <div className="w-[110px] border-l border-black/[0.05] dark:border-white/[0.04] p-2 bg-white/60 dark:bg-[#0f0f11]/60 overflow-hidden flex flex-col gap-2">
                  <div className="text-[7px] font-bold uppercase tracking-wider text-slate-400 dark:text-white/20 mb-1">Phong cách</div>
                  {['Corporate 💼', 'Creative 🎨', 'Minimal ◻️'].map((s, i) => (
                    <div key={i} className={`px-2 py-1.5 rounded-lg text-[8px] font-medium border transition-all cursor-pointer
                      ${i === 0 ? 'bg-brand-blue/[0.08] border-brand-blue/30 text-brand-blue' : 'border-black/[0.05] dark:border-white/[0.05] text-slate-500 dark:text-white/30'}`}>
                      {s}
                    </div>
                  ))}
                  <div className="mt-1 pt-2 border-t border-black/[0.05] dark:border-white/[0.05]">
                    <div className="text-[7px] font-bold uppercase tracking-wider text-slate-400 dark:text-white/20 mb-1">Slides</div>
                    {[4, 6, 8].map(n => (
                      <div key={n} className={`inline-block mr-1 px-1.5 py-0.5 rounded text-[8px] font-semibold border
                        ${n === 6 ? 'bg-brand-blue text-white border-brand-blue' : 'border-black/[0.06] dark:border-white/[0.06] text-slate-400 dark:text-white/30'}`}>
                        {n}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Floating badges */}
            <FloatingBadge
              label="Mỗi slide 1 ảnh AI riêng"
              value="AI Background"
              icon={<Sparkles size={13} />}
              className="absolute -bottom-4 -left-4 z-10"
              delay={0.6}
            />
            <FloatingBadge
              label="Hoàn toàn miễn phí"
              value="🆓 Free"
              className="absolute -top-4 -right-4 z-10"
              delay={0.75}
            />
            <AIBadge delay={0.9} />
          </div>
        </FadeInUp>
      </div>
    </section>
  );
};
