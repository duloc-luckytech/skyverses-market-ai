import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronLeft, Sparkles, Building, Zap, Image, Clock } from 'lucide-react';
import { GradientMesh, FadeInUp, HoverCard } from '../_shared/SectionAnimations';
import { ImageMasonryGrid, FloatingBadge } from '../_shared/ProHeroVisuals';

interface HeroSectionProps { onStartStudio: () => void; }

const SPECS = [
  { icon: <Zap size={12} />,      label: '4K+ Render',       sub: 'Độ phân giải siêu nét chuẩn in ấn' },
  { icon: <Building size={12} />, label: '60+ Phong cách',    sub: 'Modern, luxury, traditional & more' },
  { icon: <Image size={12} />,    label: 'Ảnh + Video',       sub: 'Still render & video tour cinematic' },
  { icon: <Clock size={12} />,    label: '10s Xử lý',         sub: 'AI render nhanh hơn tốc độ thực' },
];

export const HeroSection: React.FC<HeroSectionProps> = ({ onStartStudio }) => (
  <div className="relative overflow-hidden pt-24 pb-16 px-6 lg:px-12">
    <GradientMesh intensity="soft" accent="amber-500" />

    <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center relative z-10">

      {/* ── LEFT COLUMN ─────────────────────────────────── */}
      <div className="lg:col-span-5 space-y-7">
        <Link
          to="/markets"
          className="inline-flex items-center gap-1.5 text-[10px] font-medium uppercase text-slate-400 dark:text-[#555] hover:text-brand-blue transition-colors tracking-wider"
        >
          <ChevronLeft size={14} /> Trở lại
        </Link>

        <FadeInUp>
          <div className="space-y-5">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-blue/[0.08] border border-brand-blue/15 rounded-full text-brand-blue text-[10px] font-semibold uppercase tracking-wider">
              🏡 BĐS &amp; Kiến Trúc
            </div>

            {/* Heading */}
            <h1 className="text-5xl lg:text-7xl font-bold leading-[0.9] tracking-tight">
              Tạo Ảnh &amp; Video<br />
              <span className="text-brand-blue relative inline-block">
                Bất Động Sản AI
                <motion.span
                  className="absolute bottom-0 left-0 h-[3px] bg-brand-blue rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ delay: 0.8, duration: 0.7, ease: 'easeOut' }}
                />
              </span>
            </h1>

            {/* Tagline */}
            <p className="text-sm text-slate-500 dark:text-[#666] font-medium leading-relaxed max-w-md">
              Render 4K, staging nội thất ảo, video tour cinematic — hoàn thành trong vài giây, không cần designer.
            </p>
          </div>
        </FadeInUp>

        {/* Spec cards */}
        <FadeInUp delay={0.15}>
          <div className="grid grid-cols-2 gap-2">
            {SPECS.map(s => (
              <HoverCard key={s.label} className="p-3 flex items-start gap-2.5">
                <div className="shrink-0 w-6 h-6 rounded-md bg-brand-blue/10 flex items-center justify-center text-brand-blue">
                  {s.icon}
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-slate-700 dark:text-white/80">{s.label}</p>
                  <p className="text-[8px] font-medium text-slate-400 dark:text-[#444]">{s.sub}</p>
                </div>
              </HoverCard>
            ))}
          </div>
        </FadeInUp>

        {/* CTA */}
        <FadeInUp delay={0.25}>
          <div className="space-y-3">
            <motion.button
              onClick={onStartStudio}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gradient-to-r from-brand-blue to-blue-500 text-white px-10 py-4 rounded-xl text-[11px] font-semibold uppercase tracking-widest shadow-lg shadow-brand-blue/20 hover:brightness-110 transition-all flex items-center gap-3 group"
            >
              <Sparkles size={14} className="shrink-0" />
              ✨ Tạo ngay — Miễn phí thử
            </motion.button>
            <p className="text-[11px] text-slate-400 dark:text-[#555] flex items-center gap-2.5 flex-wrap">
              <span>🔒 Không cần thẻ tín dụng</span>
              <span className="opacity-30">·</span>
              <span>✓ Ảnh thuộc về bạn</span>
              <span className="opacity-30">·</span>
              <span>⚡ 100 CR miễn phí khi đăng ký</span>
            </p>
          </div>
        </FadeInUp>
      </div>

      {/* ── RIGHT COLUMN ────────────────────────────────── */}
      <div className="lg:col-span-7 relative">
        <FadeInUp delay={0.15}>
          <ImageMasonryGrid type="image" limit={12} columns={3} />
        </FadeInUp>

        {/* Floating badge */}
        <FloatingBadge
          label="Render BĐS Chuyên Nghiệp"
          value="150 CR / ảnh"
          className="absolute -bottom-3 -left-3"
          delay={0.8}
        />
      </div>

    </div>
  </div>
);
