import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ChevronLeft, Sparkles, ArrowRight,
  Layout, Palette, Zap, Download,
} from 'lucide-react';
import { Coins } from 'lucide-react';
import {
  GradientMesh, HoverCard,
} from '../_shared/SectionAnimations';
import { FloatingBadge, AIBadge } from '../_shared/ProHeroVisuals';

interface HeroSectionProps {
  onStartStudio: () => void;
}

// Platform mockup data
const PLATFORMS = [
  {
    id: 'x',
    name: 'X / Twitter',
    color: '#000',
    darkBg: '#111',
    size: '1500 × 500',
    tag: 'Cover',
    gradient: 'from-slate-800 to-black',
    logo: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" xmlns="http://www.w3.org/2000/svg">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    id: 'facebook',
    name: 'Facebook',
    color: '#1877F2',
    size: '1200 × 630',
    tag: 'Post',
    gradient: 'from-blue-700 to-blue-500',
    logo: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" xmlns="http://www.w3.org/2000/svg">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    id: 'instagram',
    name: 'Instagram',
    color: '#E1306C',
    size: '1080 × 1080',
    tag: 'Post',
    gradient: 'from-purple-600 via-pink-500 to-orange-400',
    logo: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    color: '#0A66C2',
    size: '1584 × 396',
    tag: 'Banner',
    gradient: 'from-blue-800 to-blue-600',
    logo: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" xmlns="http://www.w3.org/2000/svg">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
];

const SPECS = [
  { icon: <Layout size={13} />, label: '8+ Platform Formats', sub: 'X, FB, IG, LinkedIn, TikTok...' },
  { icon: <Palette size={13} />, label: 'Brand Colors AI', sub: 'Auto-match màu thương hiệu' },
  { icon: <Zap size={13} />, label: '60s Processing', sub: 'Banner hoàn chỉnh trong 1 phút' },
  { icon: <Download size={13} />, label: 'PNG / JPG Export', sub: 'High-res, ready to publish' },
];

export const HeroSection: React.FC<HeroSectionProps> = ({ onStartStudio }) => (
  <section className="min-h-screen flex flex-col justify-center px-6 lg:px-12 py-16 relative overflow-hidden">
    {/* Animated background */}
    <GradientMesh accent="purple-600" intensity="soft" />

    <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center relative z-10">
      {/* ── LEFT COLUMN ── */}
      <div className="lg:col-span-5 space-y-7">
        <Link
          to="/market"
          className="inline-flex items-center gap-1.5 text-[10px] font-medium uppercase text-slate-400 dark:text-[#555] hover:text-brand-blue dark:hover:text-brand-blue transition-colors tracking-wider"
        >
          <ChevronLeft size={14} /> Trở lại
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-blue/[0.08] border border-brand-blue/15 rounded-full text-brand-blue text-[10px] font-semibold uppercase tracking-wider">
            <Sparkles size={12} /> 8+ Định dạng · 4 Nền tảng
          </div>

          {/* Title */}
          <h1 className="text-5xl lg:text-6xl font-bold leading-[0.92] tracking-tight">
            Banner<br />
            <span className="text-brand-blue relative inline-block">
              MXH AI
              <motion.span
                className="absolute -bottom-1 left-0 h-[3px] bg-brand-blue rounded-full"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ delay: 0.6, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              />
            </span>
          </h1>

          <p className="text-sm text-slate-500 dark:text-[#666] font-medium leading-relaxed max-w-md">
            Tạo banner chuẩn pixel cho <strong className="text-slate-700 dark:text-white/70">X, Facebook, Instagram, LinkedIn</strong> trong vài giây — màu thương hiệu, AI copywriting, đúng kích thước từng nền tảng.
          </p>
        </motion.div>

        {/* Spec cards */}
        <div className="grid grid-cols-2 gap-2">
          {SPECS.map((s) => (
            <HoverCard key={s.label} className="p-3 bg-black/[0.02] dark:bg-white/[0.02] flex items-start gap-2.5">
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

        {/* CTA */}
        <motion.button
          onClick={onStartStudio}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="bg-gradient-to-r from-brand-blue to-indigo-600 text-white px-10 py-4 rounded-xl text-[11px] font-semibold uppercase tracking-widest shadow-lg shadow-brand-blue/20 hover:shadow-brand-blue/30 hover:brightness-110 transition-all flex items-center gap-3 group"
        >
          <Sparkles size={14} />
          Tạo Banner Ngay
          <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </motion.button>
      </div>

      {/* ── RIGHT COLUMN — Platform Mockup Grid ── */}
      <div className="lg:col-span-7 relative">
        <AIBadge delay={0.7} />

        {/* Platform cards grid */}
        <div className="grid grid-cols-2 gap-3">
          {PLATFORMS.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.09, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className={`group relative rounded-2xl overflow-hidden border border-black/[0.07] dark:border-white/[0.06] ${i === 0 ? 'col-span-2' : ''}`}
            >
              {/* Banner preview mockup */}
              <div className={`w-full bg-gradient-to-br ${p.gradient} ${i === 0 ? 'h-28' : 'h-32'} relative flex items-center justify-center overflow-hidden`}>
                {/* Decorative lines */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute left-6 top-4 h-full w-[1px] bg-white rotate-12" />
                  <div className="absolute right-12 top-0 h-full w-[1px] bg-white -rotate-6" />
                </div>
                {/* Mock content */}
                <div className="relative z-10 flex flex-col items-center gap-2 text-white">
                  <div className="opacity-80">{p.logo}</div>
                  <div className="space-y-1 text-center">
                    <div className="h-2 w-20 bg-white/40 rounded-full" />
                    <div className="h-1.5 w-14 bg-white/25 rounded-full mx-auto" />
                  </div>
                </div>
                {/* Hover glow */}
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors duration-300" />
              </div>

              {/* Platform info footer */}
              <div className="flex items-center justify-between px-3 py-2.5 bg-white dark:bg-[#111] gap-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-5 h-5 rounded-md flex items-center justify-center"
                    style={{ backgroundColor: p.color }}
                  >
                    <div className="scale-[0.55] text-white">{p.logo}</div>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-800 dark:text-white">{p.name}</p>
                    <p className="text-[7px] text-slate-400 dark:text-[#555]">{p.size}px</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-brand-blue/10 text-brand-blue text-[7px] font-bold rounded-full uppercase">
                  {p.tag}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Floating credit badge */}
        <FloatingBadge
          label="Giá mỗi banner"
          value="120 CR / banner"
          icon={<Coins size={14} />}
          className="absolute -bottom-3 -left-3"
          delay={0.9}
        />
      </div>
    </div>
  </section>
);
