import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ChevronLeft, Sparkles, ArrowRight,
  Layout, Zap, Palette, Download,
} from 'lucide-react';
import { GradientMesh, FadeInUp, HoverCard } from '../_shared/SectionAnimations';
import { FloatingBadge } from '../_shared/ProHeroVisuals';

interface HeroSectionProps { onStartStudio: () => void; }

const SPECS = [
  { icon: <Layout size={12} />, label: '7+ Định dạng', sub: 'Facebook, X, Instagram, LinkedIn' },
  { icon: <Zap size={12} />, label: 'Tạo trong 30s', sub: 'AI tối ưu từng nền tảng' },
  { icon: <Palette size={12} />, label: 'Brand Colors', sub: 'Nhúng logo & màu thương hiệu' },
  { icon: <Download size={12} />, label: 'Xuất PNG/JPG 4K', sub: 'Sẵn sàng đăng ngay' },
];

const PLATFORMS = [
  { key: 'fb-cover',   label: 'FB Cover',     size: '820×312',  color: '#1877F2' },
  { key: 'fb-post',    label: 'FB Post',       size: '1200×630', color: '#1877F2' },
  { key: 'x-header',  label: 'X Header',      size: '1500×500', color: '#000000' },
  { key: 'x-post',    label: 'X Post',         size: '1200×675', color: '#000000' },
  { key: 'ig-post',   label: 'IG Post',        size: '1080×1080', color: '#E1306C' },
  { key: 'ig-story',  label: 'IG Story',       size: '1080×1920', color: '#E1306C' },
  { key: 'linkedin',  label: 'LinkedIn',        size: '1584×396', color: '#0A66C2' },
];

const CDN_DEMO = 'https://imagedelivery.net/aevj5SbbyTU6ZP_CJx_TEA/baa0318b-3bbe-404a-1bff-ca95989bd500/public';

export const HeroSection: React.FC<HeroSectionProps> = ({ onStartStudio }) => (
  <section className="min-h-screen flex flex-col justify-center px-6 lg:px-12 py-16 relative overflow-hidden">
    <GradientMesh intensity="soft" />

    <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center relative z-10">
      {/* ── LEFT COLUMN ─────────────────────────────────── */}
      <div className="lg:col-span-5 space-y-7">
        <Link
          to="/market"
          className="inline-flex items-center gap-1.5 text-[10px] font-medium uppercase text-slate-400 dark:text-[#555] hover:text-brand-blue transition-colors tracking-wider"
        >
          <ChevronLeft size={14} /> Trở lại
        </Link>

        <FadeInUp>
          <div className="space-y-5">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-blue/[0.08] border border-brand-blue/15 rounded-full text-brand-blue text-[10px] font-semibold uppercase tracking-wider">
              <Sparkles size={12} /> Facebook & X Banner AI
            </div>

            {/* Heading */}
            <h1 className="text-5xl lg:text-7xl font-bold leading-[0.9] tracking-tight">
              Banner<br />
              <span className="text-brand-blue relative">
                Social AI
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
              Tạo banner chuyên nghiệp cho <strong className="text-slate-700 dark:text-white/80">Facebook</strong> và <strong className="text-slate-700 dark:text-white/80">X (Twitter)</strong> trong vài giây — đúng kích thước, đúng thương hiệu, không cần designer.
            </p>
          </div>
        </FadeInUp>

        {/* Platform size pills */}
        <FadeInUp delay={0.1}>
          <div className="space-y-2">
            <p className="text-[9px] font-semibold uppercase text-slate-400 dark:text-[#444] tracking-wider">Formats hỗ trợ</p>
            <div className="flex flex-wrap gap-1.5">
              {PLATFORMS.map(p => (
                <div
                  key={p.key}
                  className="px-2.5 py-1 rounded-lg text-[9px] font-medium border bg-black/[0.02] dark:bg-white/[0.02] border-black/[0.06] dark:border-white/[0.04] text-slate-500 dark:text-[#666]"
                >
                  <span style={{ color: p.color }} className="font-bold mr-1">●</span>
                  {p.label} <span className="text-slate-400 dark:text-[#444] ml-1">· {p.size}</span>
                </div>
              ))}
            </div>
          </div>
        </FadeInUp>

        {/* Spec cards */}
        <FadeInUp delay={0.2}>
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
        <FadeInUp delay={0.3}>
          <motion.button
            onClick={onStartStudio}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-gradient-to-r from-brand-blue to-blue-500 text-white px-10 py-4 rounded-xl text-[11px] font-semibold uppercase tracking-widest shadow-lg shadow-brand-blue/20 hover:brightness-110 transition-all flex items-center gap-3 group"
          >
            Tạo Banner Ngay <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </motion.button>
        </FadeInUp>
      </div>

      {/* ── RIGHT COLUMN — Platform Mockup Grid ─────────── */}
      <div className="lg:col-span-7 relative">
        <FadeInUp delay={0.15}>
          <div className="relative rounded-2xl overflow-hidden border border-black/[0.06] dark:border-white/[0.04] bg-black/[0.02] dark:bg-white/[0.02] p-4 space-y-3">
            {/* Facebook mockup row */}
            <div className="space-y-1">
              <p className="text-[8px] font-bold text-[#1877F2] uppercase tracking-wider ml-1">Facebook</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="aspect-[820/312] rounded-lg overflow-hidden border border-[#1877F2]/20 relative">
                  <img src={CDN_DEMO} alt="FB Cover" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-2">
                    <span className="text-[8px] text-white font-semibold">Cover 820×312</span>
                  </div>
                </div>
                <div className="aspect-[1200/630] rounded-lg overflow-hidden border border-[#1877F2]/20 relative">
                  <img src={CDN_DEMO} alt="FB Post" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-2">
                    <span className="text-[8px] text-white font-semibold">Post 1200×630</span>
                  </div>
                </div>
              </div>
            </div>

            {/* X (Twitter) mockup row */}
            <div className="space-y-1">
              <p className="text-[8px] font-bold text-slate-800 dark:text-white/70 uppercase tracking-wider ml-1">𝕏 Twitter</p>
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2 aspect-[1500/500] rounded-lg overflow-hidden border border-white/10 relative">
                  <img src={CDN_DEMO} alt="X Header" className="w-full h-full object-cover brightness-75" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-2">
                    <span className="text-[8px] text-white font-semibold">Header 1500×500</span>
                  </div>
                </div>
                <div className="aspect-square rounded-lg overflow-hidden border border-white/10 relative">
                  <img src={CDN_DEMO} alt="X Post" className="w-full h-full object-cover brightness-75" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-1">
                    <span className="text-[7px] text-white font-semibold">Post 1200×675</span>
                  </div>
                </div>
              </div>
            </div>

            {/* AI badge overlay */}
            <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-brand-blue rounded-full text-white text-[9px] font-bold">
              <Sparkles size={9} /> AI Generated
            </div>
          </div>
        </FadeInUp>

        {/* Floating badge */}
        <FloatingBadge
          label="Pixel-perfect output"
          value="80 CR / lần"
          className="absolute -bottom-3 -left-3"
          delay={0.8}
        />
      </div>
    </div>
  </section>
);
