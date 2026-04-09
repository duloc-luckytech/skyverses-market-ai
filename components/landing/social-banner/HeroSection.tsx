import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronLeft, Sparkles, ArrowRight, Monitor, Layout, Smartphone } from 'lucide-react';

interface HeroSectionProps { onStartStudio: () => void; }

// Minimal platform SVGs
const XIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);
const FBIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);
const IGIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
  </svg>
);
const LIIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

// Mock banner data — represents what the product generates
const BANNER_MOCKS = [
  {
    platform: 'X (Twitter)', icon: <XIcon />, format: 'Cover · 1500×500',
    ratio: '3/1', colSpan: 'col-span-2',
    gradient: 'from-slate-900 via-slate-800 to-slate-900',
    accent: 'border-white/10',
    preview: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=1600',
    label: 'New Product Launch',
  },
  {
    platform: 'Instagram', icon: <IGIcon />, format: 'Story · 9:16',
    ratio: '9/16', colSpan: 'col-span-1',
    gradient: 'from-pink-900 via-rose-800 to-purple-900',
    accent: 'border-pink-500/20',
    preview: 'https://images.unsplash.com/photo-1620641622503-12e0fdf7e907?auto=format&fit=crop&q=80&w=800',
    label: 'Flash Sale',
  },
  {
    platform: 'Facebook', icon: <FBIcon />, format: 'Post · 1200×630',
    ratio: '190/100', colSpan: 'col-span-1',
    gradient: 'from-blue-900 via-blue-800 to-indigo-900',
    accent: 'border-blue-500/20',
    preview: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&q=80&w=800',
    label: 'Brand Awareness',
  },
  {
    platform: 'LinkedIn', icon: <LIIcon />, format: 'Profile Cover · 1584×396',
    ratio: '4/1', colSpan: 'col-span-2',
    gradient: 'from-blue-950 via-blue-900 to-slate-900',
    accent: 'border-blue-700/20',
    preview: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1600',
    label: 'Professional Brand',
  },
];

const SPECS = [
  { icon: <Monitor size={12} />, label: '4 Platforms', sub: 'X · Facebook · Instagram · LinkedIn' },
  { icon: <Layout size={12} />, label: '14+ Formats', sub: 'Cover · Post · Story · Event · Banner' },
  { icon: <Sparkles size={12} />, label: 'AI Prompt Boost', sub: 'Tối ưu prompt theo platform tự động' },
  { icon: <Smartphone size={12} />, label: '4K Export', sub: 'PNG chất lượng cao, commercial safe' },
];

export const HeroSection: React.FC<HeroSectionProps> = ({ onStartStudio }) => {
  return (
    <section className="min-h-screen flex flex-col justify-center px-6 lg:px-12 py-16 relative overflow-hidden">
      {/* BG glows */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-200px] right-[-200px] w-[800px] h-[800px] bg-brand-blue/[0.04] dark:bg-brand-blue/[0.06] rounded-full blur-[200px]" />
        <div className="absolute bottom-[-200px] left-[-200px] w-[600px] h-[600px] bg-purple-600/[0.03] dark:bg-purple-600/[0.04] rounded-full blur-[180px]" />
      </div>

      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center relative z-10">

        {/* ── LEFT copy ── */}
        <div className="lg:col-span-5 space-y-7">
          <Link to="/market" className="inline-flex items-center gap-1.5 text-[10px] font-medium uppercase text-slate-400 dark:text-[#555] hover:text-brand-blue dark:hover:text-brand-blue transition-colors tracking-wider">
            <ChevronLeft size={14} /> Trở lại
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-blue/[0.08] border border-brand-blue/15 rounded-full text-brand-blue text-[10px] font-semibold uppercase tracking-wider">
              <Sparkles size={12} /> 4 Platforms · 14+ Kích thước chuẩn
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold leading-[0.9] tracking-tight">
              Social <br /><span className="text-brand-blue">Banner</span> AI
            </h1>
            <p className="text-sm text-slate-500 dark:text-[#666] font-medium leading-relaxed max-w-md">
              Tạo banner media đúng kích thước chuẩn cho X, Facebook, Instagram và LinkedIn bằng AI — cùng AI panel cấu hình, hỗ trợ ảnh tham chiếu, màu thương hiệu và 4K export.
            </p>
          </motion.div>

          {/* Specs grid */}
          <div className="grid grid-cols-2 gap-2">
            {SPECS.map(s => (
              <div key={s.label} className="p-3 bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.04] rounded-xl flex items-start gap-2.5 group hover:border-brand-blue/20 transition-all">
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
            className="bg-gradient-to-r from-brand-blue to-purple-600 text-white px-10 py-4 rounded-xl text-[11px] font-semibold uppercase tracking-widest shadow-lg shadow-brand-blue/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-3 group"
          >
            Mở Banner Studio <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* ── RIGHT — Platform banner mockup grid ── */}
        <div className="lg:col-span-7">
          <div className="grid grid-cols-2 gap-3">
            {BANNER_MOCKS.map((b, i) => (
              <motion.div
                key={b.platform}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className={`${b.colSpan} relative overflow-hidden rounded-xl border ${b.accent} bg-gradient-to-br ${b.gradient} group`}
                style={{ aspectRatio: b.ratio }}
              >
                {/* Background photo */}
                <img
                  src={b.preview}
                  alt={b.platform}
                  className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-50 transition-opacity duration-500 group-hover:scale-105 transition-transform duration-700"
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Platform badge top-left */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2 py-1 bg-black/40 backdrop-blur-sm rounded-lg text-white">
                  {b.icon}
                  <span className="text-[8px] font-semibold tracking-wide">{b.format}</span>
                </div>

                {/* Content */}
                <div className="absolute bottom-3 left-3 right-3">
                  <p className="text-[9px] font-semibold text-white/50 uppercase tracking-widest mb-0.5">{b.platform}</p>
                  <p className="text-xs font-bold text-white leading-tight">{b.label}</p>
                  {/* Mock progress bar */}
                  <div className="mt-2 h-0.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-blue/70 rounded-full w-3/4 group-hover:w-full transition-all duration-700" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Format count badge */}
          <div className="mt-3 flex items-center justify-end gap-1.5 text-[9px] font-semibold text-slate-400 dark:text-white/25 uppercase tracking-widest">
            <Layout size={10} />
            14+ definite formats across 4 platforms
          </div>
        </div>

      </div>
    </section>
  );
};
