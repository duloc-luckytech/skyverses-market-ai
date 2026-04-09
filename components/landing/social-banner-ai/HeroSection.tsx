import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ChevronLeft, Sparkles, ArrowRight,
  Layout, Zap, Palette, Download, Loader2,
} from 'lucide-react';
import { GradientMesh, FadeInUp, HoverCard } from '../_shared/SectionAnimations';
import { FloatingBadge } from '../_shared/ProHeroVisuals';
import { generateDemoImage } from '../../../services/gemini';

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

const CDN_DEMO = 'https://imagedelivery.net/eCWooK4EUyalJ6a-Nut5cw/7cbe5f07-2b18-4c42-ca5c-20bcd7206f00/public';

const DEMO_PROMPTS = [
  'Flash Sale 50% nền đỏ rực, chữ trắng bold, năng lượng cao',
  'Khai trương cửa hàng, pháo hoa vàng đỏ, festive Việt Nam',
  'Banner tuyển dụng chuyên nghiệp, gradient xanh dương tối',
  'Ra mắt sản phẩm mới, nền tối premium, spotlight trắng',
];

const InlineDemoWidget: React.FC<{ onOpenStudio: () => void }> = ({ onOpenStudio }) => {
  const [demoPrompt, setDemoPrompt] = useState(DEMO_PROMPTS[0]);
  const [demoResult, setDemoResult] = useState<string | null>(null);
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoPromptIdx, setDemoPromptIdx] = useState(0);

  const runDemo = async () => {
    if (demoLoading) return;
    setDemoLoading(true);
    setDemoResult(null);
    try {
      const url = await generateDemoImage(demoPrompt);
      setDemoResult(url ?? null);
    } catch { /* silent */ }
    finally { setDemoLoading(false); }
  };

  const cyclePrompt = () => {
    const next = (demoPromptIdx + 1) % DEMO_PROMPTS.length;
    setDemoPromptIdx(next);
    setDemoPrompt(DEMO_PROMPTS[next]);
    setDemoResult(null);
  };

  return (
    <div className="rounded-2xl border border-black/[0.07] dark:border-white/[0.06] bg-white dark:bg-white/[0.02] overflow-hidden shadow-xl shadow-black/5">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-black/[0.05] dark:border-white/[0.04] bg-slate-50/60 dark:bg-white/[0.01]">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
        </div>
        <span className="text-[9px] font-bold text-slate-400 dark:text-[#555] uppercase tracking-wider">Demo · Social Banner AI</span>
        <div className="w-12" />
      </div>

      {/* Preview area */}
      <div className="aspect-video bg-slate-100 dark:bg-white/[0.03] relative flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait">
          {demoLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-3"
            >
              <div className="grid grid-cols-2 gap-2 w-full px-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="aspect-video rounded-lg bg-slate-200 dark:bg-white/[0.04] animate-pulse" style={{ animationDelay: `${i*0.12}s` }} />
                ))}
              </div>
              <p className="text-[10px] text-slate-400 animate-pulse">AI đang vẽ...</p>
            </motion.div>
          ) : demoResult ? (
            <motion.img
              key="result"
              src={demoResult}
              alt="Demo output"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="w-full h-full object-cover"
            />
          ) : (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-2 text-center px-4"
            >
              <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center">
                <Sparkles size={18} className="text-brand-blue/60" />
              </div>
              <p className="text-[11px] text-slate-400 dark:text-[#555]">Nhấn <strong className="text-brand-blue">Thử Ngay</strong> để xem AI tạo banner</p>
            </motion.div>
          )}
        </AnimatePresence>

        {demoResult && (
          <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-emerald-500 rounded-full text-white text-[9px] font-bold">
            ✓ Tạo xong
          </div>
        )}
      </div>

      {/* Prompt input + actions */}
      <div className="p-3 space-y-2">
        <div className="flex items-center gap-2">
          <input
            value={demoPrompt}
            onChange={e => { setDemoPrompt(e.target.value); setDemoResult(null); }}
            onKeyDown={e => e.key === 'Enter' && runDemo()}
            placeholder="Mô tả banner..."
            className="flex-1 text-[11px] bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] rounded-lg px-3 py-2 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-[#444] focus:outline-none focus:border-brand-blue/50 transition-colors"
          />
          <button
            onClick={cyclePrompt}
            title="Đổi mẫu"
            className="shrink-0 w-8 h-8 rounded-lg border border-slate-200 dark:border-white/[0.06] flex items-center justify-center text-slate-400 hover:text-brand-blue hover:border-brand-blue/30 transition-colors"
          >
            <Loader2 size={13} />
          </button>
        </div>
        <div className="flex gap-2">
          <motion.button
            onClick={runDemo}
            disabled={demoLoading}
            whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
            className="flex-1 py-2 rounded-lg bg-brand-blue text-white text-[11px] font-bold flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 transition-all"
          >
            {demoLoading ? <><Loader2 size={11} className="animate-spin" /> Đang tạo...</> : <><Sparkles size={11} /> Thử Ngay (miễn phí)</>}
          </motion.button>
          <motion.button
            onClick={onOpenStudio}
            whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
            className="px-3 py-2 rounded-lg border border-brand-blue/30 text-brand-blue text-[11px] font-semibold hover:bg-brand-blue/5 transition-all"
          >
            Mở Studio →
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export const HeroSection: React.FC<HeroSectionProps> = ({ onStartStudio }) => {
  return (
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
          <div className="space-y-3">
            <motion.button
              onClick={onStartStudio}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gradient-to-r from-brand-blue to-blue-500 text-white px-10 py-4 rounded-xl text-[11px] font-semibold uppercase tracking-widest shadow-lg shadow-brand-blue/20 hover:brightness-110 transition-all flex items-center gap-3 group"
            >
              Tạo Banner Ngay <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
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

      {/* ── RIGHT COLUMN — Inline Demo Widget ─────────── */}
      <div className="lg:col-span-7 relative">
        <FadeInUp delay={0.15}>
          <InlineDemoWidget onOpenStudio={onStartStudio} />
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
};
