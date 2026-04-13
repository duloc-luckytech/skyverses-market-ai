import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ChevronLeft, Sparkles, ArrowRight,
  Layers, Cpu, Image, Download, Loader2, RefreshCw,
} from 'lucide-react';
import { GradientMesh, FadeInUp, HoverCard } from '../_shared/SectionAnimations';
import { FloatingBadge } from '../_shared/ProHeroVisuals';
import { imagesApi, ImageJobRequest } from '../../../apis/images';
import { ImageJobCard, JobCardStatus } from '../../../components/shared/ImageJobCard';
import { useAuth } from '../../../context/AuthContext';
import { useJobPoller } from '../../../hooks/useJobPoller';

interface HeroSectionProps { onStartStudio: () => void; }

const SPECS = [
  { icon: <Cpu size={12} />, label: '22+ AI Models', sub: 'Imagen 4, FLUX, SD, Midjourney-style' },
  { icon: <Layers size={12} />, label: 'Gen · Edit · Upscale', sub: 'Ba chế độ trong một studio' },
  { icon: <Image size={12} />, label: 'Xuất 4K / 8K', sub: 'PNG chất lượng cao, sẵn đăng ngay' },
  { icon: <Download size={12} />, label: 'Batch Processing', sub: 'Hàng loạt ảnh cùng lúc, xuất ZIP' },
];

const DEMO_PROMPTS = [
  'Ảnh sản phẩm nước hoa cao cấp trên nền đá cẩm thạch trắng, ánh sáng studio chuyên nghiệp',
  'Cảnh quan kỳ ảo với hòn đảo bay và rừng phát quang, bầu trời tím violet, chất lượng cinematic',
  'Nhân vật anime warrior nữ trong bộ giáp ánh kim, background đô thị futuristic neon',
  'Ảnh nội thất phòng khách Japandi tối giản, ánh sáng tự nhiên, gỗ sáng và cây xanh',
];

// ─── Mock image cards hiển thị khi chưa generate ─────────────────────────────

const MOCK_IMAGES = [
  {
    label: 'Product Shot',
    sub: 'E-commerce',
    gradient: 'from-slate-800 via-slate-700 to-slate-900',
    accent: 'bg-amber-300',
    emoji: '💎',
    dots: ['bg-amber-200', 'bg-amber-300', 'bg-yellow-200'],
  },
  {
    label: 'Fantasy Art',
    sub: 'Creative',
    gradient: 'from-violet-900 via-purple-800 to-indigo-900',
    accent: 'bg-violet-300',
    emoji: '✨',
    dots: ['bg-violet-300', 'bg-purple-300', 'bg-indigo-300'],
  },
  {
    label: 'Architecture',
    sub: 'Real Estate',
    gradient: 'from-sky-900 via-blue-800 to-slate-900',
    accent: 'bg-sky-300',
    emoji: '🏛️',
    dots: ['bg-sky-200', 'bg-blue-200', 'bg-cyan-200'],
  },
  {
    label: 'Fashion',
    sub: 'Lookbook',
    gradient: 'from-rose-900 via-pink-800 to-fuchsia-900',
    accent: 'bg-rose-300',
    emoji: '👗',
    dots: ['bg-rose-200', 'bg-pink-200', 'bg-fuchsia-200'],
  },
];

const ImagePlaceholder: React.FC = () => {
  return (
    <motion.div
      key="placeholder"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 overflow-hidden"
    >
      {/* Animated blur blobs */}
      <div className="absolute inset-0">
        <motion.div
          animate={{ x: [0, 20, 0], y: [0, -15, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-8 -left-8 w-40 h-40 rounded-full bg-brand-blue/20 blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -15, 0], y: [0, 20, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute -bottom-8 -right-8 w-44 h-44 rounded-full bg-violet-500/15 blur-3xl"
        />
        <motion.div
          animate={{ x: [0, 10, 0], y: [0, 10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-emerald-400/10 blur-2xl"
        />
      </div>

      {/* Image cards grid — 2×2 */}
      <div className="absolute inset-0 grid grid-cols-2 gap-2 p-3">
        {MOCK_IMAGES.map((img, i) => (
          <motion.div
            key={img.label}
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: i * 0.12, duration: 0.5, ease: 'easeOut' }}
            whileHover={{ scale: 1.03, zIndex: 10 }}
            className={`relative rounded-xl overflow-hidden bg-gradient-to-br ${img.gradient} flex flex-col justify-between p-3 cursor-default shadow-lg`}
          >
            {/* Shimmer sweep */}
            <motion.div
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 2.4, repeat: Infinity, repeatDelay: i * 1.2 + 2, ease: 'easeInOut' }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 pointer-events-none"
            />

            {/* Top: category */}
            <div className="flex items-center justify-between">
              <span className="text-[7px] font-bold uppercase tracking-widest text-white/60 bg-white/10 px-1.5 py-0.5 rounded-full">
                {img.sub}
              </span>
              <span className="text-base">{img.emoji}</span>
            </div>

            {/* Center label */}
            <div>
              <p className="text-[11px] font-extrabold text-white leading-tight">{img.label}</p>
            </div>

            {/* Bottom: dot accents */}
            <div className="flex items-center gap-1">
              {img.dots.map((d, j) => (
                <motion.div
                  key={j}
                  animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 1.8, repeat: Infinity, delay: j * 0.3 + i * 0.2 }}
                  className={`w-1.5 h-1.5 rounded-full ${d}`}
                />
              ))}
              <div className="flex-1" />
              <motion.div
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
                className={`w-5 h-1 rounded-full ${img.accent} opacity-60`}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Center CTA overlay */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6, duration: 0.4 }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        <motion.div
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="flex flex-col items-center gap-1.5 bg-white/90 dark:bg-black/70 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/50 dark:border-white/10 shadow-xl"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1 }}
          >
            <Sparkles size={20} className="text-brand-blue" />
          </motion.div>
          <p className="text-[10px] font-bold text-slate-700 dark:text-white/90 text-center leading-snug">
            Nhập prompt → AI tạo ngay
          </p>
          <p className="text-[8px] text-slate-400 dark:text-white/40">50 CR / ảnh</p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

// ─── Inline Demo Widget ───────────────────────────────────────────────────────

const InlineDemoWidget: React.FC<{ onOpenStudio: () => void }> = ({ onOpenStudio }) => {
  const { isAuthenticated, login, credits, useCredits, addCredits } = useAuth();

  const [demoPrompt, setDemoPrompt] = useState(DEMO_PROMPTS[0]);
  const [demoResult, setDemoResult] = useState<string | null>(null);
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoPromptIdx, setDemoPromptIdx] = useState(0);
  const [demoStatus, setDemoStatus] = useState<'idle' | 'creating' | 'polling' | 'done' | 'error'>('idle');

  const DEMO_ENGINE = 'gommo';
  const DEMO_MODEL  = 'Nano Banana';
  const DEMO_MODE   = 'relaxed';
  const DEMO_COST   = 50;

  const poller = useJobPoller(
    {
      onDone: (result) => {
        const url = result.images?.[0] ?? null;
        if (url) {
          setDemoResult(url);
          setDemoStatus('done');
        } else {
          addCredits(DEMO_COST);
          setDemoStatus('error');
        }
        setDemoLoading(false);
      },
      onError: () => {
        addCredits(DEMO_COST);
        setDemoStatus('error');
        setDemoLoading(false);
      },
      onTimeout: () => {
        addCredits(DEMO_COST);
        setDemoStatus('error');
        setDemoLoading(false);
      },
    },
    { apiType: 'image', intervalMs: 5000, maxDurationMs: 180_000 },
  );

  const runDemo = async () => {
    if (demoLoading || !demoPrompt.trim()) return;
    if (!isAuthenticated) { login(); return; }
    if (credits < DEMO_COST) { onOpenStudio(); return; }

    setDemoLoading(true);
    setDemoResult(null);
    setDemoStatus('creating');

    const payload: ImageJobRequest = {
      type: 'text_to_image',
      input: {
        prompt: `Ảnh chất lượng cao, photorealistic. ${demoPrompt}. Ánh sáng đẹp, bố cục cân bằng, chi tiết sắc nét.`,
      },
      config: {
        width: 1024,
        height: 1024,
        aspectRatio: '1:1',
        seed: 0,
        style: 'photorealistic',
      },
      engine: {
        provider: DEMO_ENGINE as 'gommo' | 'fxlab',
        model: DEMO_MODEL,
      },
      enginePayload: {
        prompt: `Ảnh chất lượng cao, photorealistic. ${demoPrompt}. Ánh sáng đẹp, bố cục cân bằng, chi tiết sắc nét.`,
        privacy: 'PRIVATE',
        projectId: 'default',
        mode: DEMO_MODE,
      },
    };

    try {
      const res = await imagesApi.createJob(payload);
      const isSuccess = res.success === true || res.status?.toLowerCase() === 'success';

      if (isSuccess && res.data?.jobId) {
        useCredits(DEMO_COST);
        setDemoStatus('polling');
        poller.startPolling(res.data.jobId);
      } else {
        setDemoStatus('error');
        setDemoLoading(false);
      }
    } catch {
      setDemoStatus('error');
      setDemoLoading(false);
    }
  };

  const cyclePrompt = () => {
    const next = (demoPromptIdx + 1) % DEMO_PROMPTS.length;
    setDemoPromptIdx(next);
    setDemoPrompt(DEMO_PROMPTS[next]);
    setDemoResult(null);
    setDemoStatus('idle');
    poller.cancel();
  };

  const statusLabel =
    demoStatus === 'creating' ? 'Đang gửi lên AI...' :
    demoStatus === 'polling'  ? 'AI đang tạo ảnh...' :
    demoStatus === 'error'    ? 'Lỗi — thử lại nhé' : '';

  return (
    <div className="rounded-2xl border border-black/[0.07] dark:border-white/[0.06] bg-white dark:bg-white/[0.02] overflow-hidden shadow-xl shadow-black/5">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-black/[0.05] dark:border-white/[0.04] bg-slate-50/60 dark:bg-white/[0.01]">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
        </div>
        <span className="text-[9px] font-bold text-slate-400 dark:text-[#555] uppercase tracking-wider">Demo · AI Image Studio</span>
        <div className="w-12" />
      </div>

      {/* Preview area */}
      {(() => {
        const cardStatus: JobCardStatus = demoLoading ? 'processing'
          : demoStatus === 'error' ? 'error'
          : demoResult ? 'done'
          : 'idle';
        return (
          <ImageJobCard
            status={cardStatus}
            resultUrl={demoResult ?? undefined}
            statusText={statusLabel}
            errorMessage="Có lỗi xảy ra — credits đã được hoàn lại 🔄"
            aspectRatio="1/1"
            mode="compact"
            downloadFilename="skyverses_image"
            onReset={cyclePrompt}
            onRetry={() => { setDemoResult(null); setDemoStatus('idle'); }}
            idleSlot={<ImagePlaceholder />}
          />
        );
      })()}

      {/* Prompt input + actions */}
      <div className="p-3 space-y-2">
        <div className="flex items-center gap-2">
          <input
            value={demoPrompt}
            onChange={e => { setDemoPrompt(e.target.value); setDemoResult(null); setDemoStatus('idle'); }}
            onKeyDown={e => e.key === 'Enter' && runDemo()}
            placeholder="Mô tả ảnh bạn muốn tạo..."
            className="flex-1 text-[11px] bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] rounded-lg px-3 py-2 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-[#444] focus:outline-none focus:border-brand-blue/50 transition-colors"
          />
          <button
            onClick={cyclePrompt}
            title="Đổi mẫu prompt"
            className="shrink-0 w-8 h-8 rounded-lg border border-slate-200 dark:border-white/[0.06] flex items-center justify-center text-slate-400 hover:text-brand-blue hover:border-brand-blue/30 transition-colors"
          >
            <RefreshCw size={13} />
          </button>
        </div>
        <div className="flex gap-2">
          <motion.button
            onClick={runDemo}
            disabled={demoLoading}
            whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
            className="flex-1 py-2 rounded-lg bg-brand-blue text-white text-[11px] font-bold flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 transition-all"
          >
            {demoLoading
              ? <><Loader2 size={11} className="animate-spin" /> {statusLabel}</>
              : <><Sparkles size={11} /> Tạo Ảnh ({DEMO_COST} CR)</>
            }
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

// ─── Main Hero Section ────────────────────────────────────────────────────────

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
                <Sparkles size={12} /> AI Image Studio — Gen & Edit
              </div>

              {/* Heading */}
              <h1 className="text-5xl lg:text-7xl font-bold leading-[0.9] tracking-tight">
                Tạo & chỉnh<br />
                <span className="text-brand-blue relative">
                  sửa ảnh AI
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
                Upload ảnh hoặc nhập prompt — AI tạo ảnh 8K, xóa nền, style transfer trong{' '}
                <strong className="text-slate-700 dark:text-white/80">giây lát</strong>.
              </p>
            </div>
          </FadeInUp>

          {/* Spec cards */}
          <FadeInUp delay={0.1}>
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
          <FadeInUp delay={0.2}>
            <div className="space-y-3">
              <motion.button
                onClick={onStartStudio}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-gradient-to-r from-brand-blue to-blue-500 text-white px-10 py-4 rounded-xl text-[11px] font-semibold uppercase tracking-widest shadow-lg shadow-brand-blue/20 hover:brightness-110 transition-all flex items-center gap-3 group"
              >
                Mở AI Image Studio <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
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
            label="~30s / ảnh"
            value="50 CR / lần"
            className="absolute -bottom-3 -left-3"
            delay={0.8}
          />
        </div>
      </div>
    </section>
  );
};
