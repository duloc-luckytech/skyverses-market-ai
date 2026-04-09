import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ChevronLeft, Sparkles, ArrowRight,
  Layout, Palette, Type, Download,
} from 'lucide-react';

interface HeroSectionProps {
  onStartStudio: () => void;
}

// Platform mockup cards — đúng aspect ratio từng nền tảng
const PLATFORMS = [
  {
    key: 'x',
    label: 'X / Twitter',
    ratio: 'aspect-[3/1]',         // 1500 × 500
    size: '1500 × 500',
    badge: 'Cover',
    color: 'from-slate-800 to-slate-900',
    accent: '#1DA1F2',
    icon: '𝕏',
    gradient: 'from-sky-500/20 to-sky-700/10',
    headline: 'Your Brand Story',
    sub: 'Powered by AI',
  },
  {
    key: 'fb',
    label: 'Facebook',
    ratio: 'aspect-[1200/630]',    // 1200 × 630
    size: '1200 × 630',
    badge: 'Post',
    color: 'from-blue-900 to-indigo-900',
    accent: '#1877F2',
    icon: 'f',
    gradient: 'from-blue-500/20 to-indigo-500/10',
    headline: 'Reach More',
    sub: 'Customers Today',
  },
  {
    key: 'ig',
    label: 'Instagram',
    ratio: 'aspect-[9/16]',        // 1080 × 1920
    size: '1080 × 1920',
    badge: 'Story',
    color: 'from-pink-900 to-purple-900',
    accent: '#E1306C',
    icon: '◈',
    gradient: 'from-pink-500/20 to-purple-500/10',
    headline: 'Stand Out',
    sub: 'On Social',
  },
  {
    key: 'li',
    label: 'LinkedIn',
    ratio: 'aspect-[4/1]',         // 1584 × 396
    size: '1584 × 396',
    badge: 'Banner',
    color: 'from-blue-800 to-blue-950',
    accent: '#0A66C2',
    icon: 'in',
    gradient: 'from-blue-400/20 to-blue-600/10',
    headline: 'Professional',
    sub: 'Brand Identity',
  },
];

const SPECS = [
  { icon: <Layout size={12} />, label: '14+ Formats', sub: 'X · FB · IG · LI · TikTok' },
  { icon: <Palette size={12} />, label: 'Brand Colors', sub: 'Màu & font thương hiệu' },
  { icon: <Type size={12} />, label: 'AI Copywriting', sub: 'Tiêu đề & mô tả tự động' },
  { icon: <Download size={12} />, label: 'PNG / JPG', sub: 'Kích thước chuẩn từng nền tảng' },
];

export const HeroSection: React.FC<HeroSectionProps> = ({ onStartStudio }) => (
  <section className="min-h-screen flex flex-col justify-center px-6 lg:px-12 py-16 relative overflow-hidden">
    {/* BG glows */}
    <div className="absolute inset-0 z-0 pointer-events-none">
      <div className="absolute top-[-200px] right-[-200px] w-[800px] h-[800px] bg-brand-blue/[0.04] rounded-full blur-[200px]" />
      <div className="absolute bottom-[-200px] left-[-200px] w-[600px] h-[600px] bg-purple-600/[0.03] rounded-full blur-[180px]" />
    </div>

    <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center relative z-10">
      {/* ── LEFT COPY (5 cols) ── */}
      <div className="lg:col-span-5 space-y-7">
        <Link
          to="/market"
          className="inline-flex items-center gap-1.5 text-[10px] font-medium uppercase text-slate-400 dark:text-[#555] hover:text-brand-blue dark:hover:text-brand-blue transition-colors tracking-wider"
        >
          <ChevronLeft size={14} /> Trở lại
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-blue/[0.08] border border-brand-blue/15 rounded-full text-brand-blue text-[10px] font-semibold uppercase tracking-wider">
            <Sparkles size={12} /> 4 Platforms · 14+ Formats
          </div>

          <h1 className="text-5xl lg:text-7xl font-bold leading-[0.9] tracking-tight">
            Social <br /><span className="text-brand-blue">Banner</span> AI
          </h1>

          <p className="text-sm text-slate-500 dark:text-[#666] font-medium leading-relaxed max-w-md">
            Tạo banner mạng xã hội chuẩn pixel cho X, Facebook, Instagram, LinkedIn
            trong vài giây — AI tự chọn layout, viết tiêu đề và xuất đúng kích thước từng nền tảng.
          </p>
        </motion.div>

        {/* Specs grid */}
        <div className="grid grid-cols-2 gap-2">
          {SPECS.map(s => (
            <div
              key={s.label}
              className="p-3 bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.04] rounded-xl flex items-start gap-2.5 hover:border-brand-blue/20 transition-all"
            >
              <div className="shrink-0 w-6 h-6 rounded-md bg-brand-blue/10 flex items-center justify-center text-brand-blue">
                {s.icon}
              </div>
              <div>
                <p className="text-[10px] font-semibold text-slate-700 dark:text-white/80">{s.label}</p>
                <p className="text-[8px] font-medium text-slate-400 dark:text-[#444]">{s.sub}</p>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onStartStudio}
          className="bg-gradient-to-r from-brand-blue to-indigo-600 text-white px-10 py-4 rounded-xl text-[11px] font-semibold uppercase tracking-widest shadow-lg shadow-brand-blue/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-3 group"
        >
          Mở Banner Studio <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* ── RIGHT VISUAL (7 cols) — Platform mockup grid ── */}
      <div className="lg:col-span-7 relative">
        <div className="grid grid-cols-2 gap-3">
          {/* X Cover — spans 2 columns, ratio 3:1 */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="col-span-2"
          >
            <PlatformCard platform={PLATFORMS[0]} />
          </motion.div>

          {/* Facebook post */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <PlatformCard platform={PLATFORMS[1]} />
          </motion.div>

          {/* Instagram Story — taller */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <PlatformCard platform={PLATFORMS[2]} />
          </motion.div>

          {/* LinkedIn Banner — spans 2 columns, ratio 4:1 */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="col-span-2"
          >
            <PlatformCard platform={PLATFORMS[3]} />
          </motion.div>
        </div>

        {/* Floating "AI Generated" badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="absolute -top-3 -right-3 bg-brand-blue text-white text-[8px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-lg shadow-brand-blue/30"
        >
          AI Generated
        </motion.div>
      </div>
    </div>
  </section>
);

// ─── Platform mockup card ──────────────────────────────────
const PlatformCard: React.FC<{ platform: typeof PLATFORMS[0] }> = ({ platform }) => (
  <div
    className={`relative ${platform.ratio} w-full rounded-xl overflow-hidden border border-white/[0.08] bg-gradient-to-br ${platform.color} group hover:scale-[1.01] transition-transform duration-300`}
  >
    {/* Subtle gradient overlay */}
    <div className={`absolute inset-0 bg-gradient-to-br ${platform.gradient}`} />

    {/* Platform icon top-left */}
    <div className="absolute top-2.5 left-3 flex items-center gap-2 z-10">
      <span
        className="text-[11px] font-black leading-none"
        style={{ color: platform.accent }}
      >
        {platform.icon}
      </span>
      <span className="text-[8px] font-semibold text-white/50 uppercase tracking-wider">{platform.label}</span>
    </div>

    {/* Size badge top-right */}
    <div className="absolute top-2 right-2 z-10">
      <span className="text-[7px] font-mono font-semibold text-white/30 bg-white/[0.06] border border-white/[0.08] rounded px-1.5 py-0.5">
        {platform.size}
      </span>
    </div>

    {/* Content center */}
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 px-4 z-10">
      <div className="w-8 h-[2px] rounded-full mb-2" style={{ backgroundColor: platform.accent, opacity: 0.6 }} />
      <p className="text-white/80 text-[11px] font-bold text-center leading-tight">{platform.headline}</p>
      <p className="text-white/30 text-[9px] font-medium text-center">{platform.sub}</p>
    </div>

    {/* Format badge bottom-left */}
    <div className="absolute bottom-2 left-2.5 z-10">
      <span
        className="text-[7px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border"
        style={{ color: platform.accent, borderColor: platform.accent + '40', backgroundColor: platform.accent + '15' }}
      >
        {platform.badge}
      </span>
    </div>

    {/* Shimmer effect on hover */}
    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent -translate-x-full group-hover:translate-x-full transition-all duration-700 ease-in-out" />
  </div>
);
