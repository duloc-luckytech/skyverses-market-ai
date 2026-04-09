import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ChevronLeft, Sparkles, ArrowRight, Building2, Zap, Image as ImageIcon,
  Clock, Loader2, RefreshCw, Download, CheckCircle2, AlertCircle,
} from 'lucide-react';
import { GradientMesh, FadeInUp, HoverCard } from '../_shared/SectionAnimations';
import { FloatingBadge } from '../_shared/ProHeroVisuals';
import { imagesApi, ImageJobRequest } from '../../../apis/images';
import { useAuth } from '../../../context/AuthContext';

interface HeroSectionProps { onStartStudio: () => void; }

// ─── Constants ────────────────────────────────────────────────
const SPECS = [
  { icon: <Zap size={12} />,       label: 'Render 4K',       sub: 'Chuẩn in ấn & marketing' },
  { icon: <Building2 size={12} />, label: '60+ Phong cách',  sub: 'Modern, luxury, classic…' },
  { icon: <ImageIcon size={12} />, label: 'Ảnh + Video',      sub: 'Still & cinematic tour' },
  { icon: <Clock size={12} />,     label: '30s Xử lý',       sub: 'AI render siêu tốc' },
];

const QUICK_STYLES = [
  { key: 'luxury',     label: '✦ Luxury',      color: '#f59e0b' },
  { key: 'modern',     label: '◼ Modern',      color: '#0ea5e9' },
  { key: 'tropical',   label: '🌿 Tropical',   color: '#10b981' },
  { key: 'industrial', label: '⬡ Industrial',  color: '#8b5cf6' },
];

const DEMO_PROMPTS = [
  { label: 'Villa ngoại thất',    prompt: 'Luxury Vietnamese villa exterior, white colonial architecture, infinity pool, tropical garden, golden hour sunset, photorealistic 4K CGI render' },
  { label: 'Căn hộ staging',      prompt: 'Modern Vietnamese luxury apartment interior staging, city view floor-to-ceiling windows, linen sofa, marble table, warm evening light, photorealistic' },
  { label: 'Penthouse rooftop',   prompt: 'Penthouse rooftop terrace with infinity pool, Ho Chi Minh City skyline at blue hour, teak loungers, fire pit, dramatic lighting, architectural render' },
  { label: 'Aerial master plan',  prompt: 'Bird\'s-eye aerial CGI view of luxury gated residential community Vietnam, villa cluster, central lake, clubhouse, tropical landscaping, golden hour' },
  { label: 'Interior bedroom',    prompt: 'Master bedroom interior staging luxury Vietnamese apartment, king bed linen headboard, warm amber lighting, walk-in wardrobe, garden view en-suite, photorealistic' },
];

// ─── Cinematic Background Orbs ────────────────────────────────
const BackgroundOrbs: React.FC = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    {/* Large emerald orb */}
    <motion.div
      className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full opacity-[0.06] dark:opacity-[0.04]"
      style={{ background: 'radial-gradient(circle, #10b981, transparent 70%)' }}
      animate={{ scale: [1, 1.08, 1], x: [0, 20, 0], y: [0, -15, 0] }}
      transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
    />
    {/* Amber orb bottom-left */}
    <motion.div
      className="absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full opacity-[0.04] dark:opacity-[0.03]"
      style={{ background: 'radial-gradient(circle, #f59e0b, transparent 70%)' }}
      animate={{ scale: [1, 1.12, 1], x: [0, -10, 0], y: [0, 10, 0] }}
      transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
    />
    {/* Grid lines subtle */}
    <div
      className="absolute inset-0 opacity-[0.015] dark:opacity-[0.025]"
      style={{
        backgroundImage: `linear-gradient(rgba(16,185,129,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.3) 1px, transparent 1px)`,
        backgroundSize: '60px 60px',
      }}
    />
  </div>
);

// ─── Animated progress bar ────────────────────────────────────
const ProgressBar: React.FC<{ progress: number; color: string }> = ({ progress, color }) => (
  <div className="h-0.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
    <motion.div
      className="h-full rounded-full"
      style={{ backgroundColor: color }}
      initial={{ width: 0 }}
      animate={{ width: `${progress}%` }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    />
  </div>
);

// ─── Quick Render Widget ───────────────────────────────────────
type RenderState = 'idle' | 'submitting' | 'processing' | 'done' | 'error';

const REQuickRenderWidget: React.FC<{ onOpenStudio: () => void }> = ({ onOpenStudio }) => {
  const [state, setState] = useState<RenderState>('idle');
  const [selectedPrompt, setSelectedPrompt] = useState(0);
  const [selectedStyle, setSelectedStyle] = useState(0);
  const [customPrompt, setCustomPrompt] = useState('');
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const { user } = useAuth();

  const activePrompt = customPrompt || DEMO_PROMPTS[selectedPrompt].prompt;
  const styleLabel = QUICK_STYLES[selectedStyle].label;

  const startRender = useCallback(async () => {
    if (state !== 'idle' && state !== 'error' && state !== 'done') return;
    setState('submitting');
    setResultUrl(null);
    setErrorMsg('');
    setProgress(5);

    const fullPrompt = `${activePrompt}, ${styleLabel} style, 4K quality, architectural visualization`;

    const payload: ImageJobRequest = {
      type: 'text_to_image',
      input: { prompt: fullPrompt },
      config: { width: 1280, height: 720, aspectRatio: '16:9', seed: 0, style: '' },
      engine: { provider: 'gommo', model: 'google_image_gen_4_5' },
      enginePayload: { prompt: fullPrompt, privacy: 'PRIVATE', projectId: 'default' },
    };

    try {
      const res = await imagesApi.createJob(payload);
      if (!res?.data?.jobId) throw new Error('No jobId returned');
      const jobId = res.data.jobId;
      setState('processing');
      setProgress(15);

      // Poll
      let elapsed = 0;
      pollRef.current = setInterval(async () => {
        elapsed += 3;
        // Animate progress naturally up to 90%
        setProgress(Math.min(90, 15 + elapsed * 2.5));

        const status = await imagesApi.getJobStatus(jobId);
        const s = status?.data?.status;
        if (s === 'done') {
          clearInterval(pollRef.current!);
          const url = status.data.result?.images?.[0] ?? null;
          setResultUrl(url);
          setProgress(100);
          setState('done');
        } else if (s === 'failed' || s === 'error') {
          clearInterval(pollRef.current!);
          setErrorMsg('AI gặp lỗi — thử lại nhé');
          setState('error');
        }
      }, 3000);

      // Safety timeout after 3 min
      setTimeout(() => {
        if (pollRef.current) {
          clearInterval(pollRef.current);
          setState('error');
          setErrorMsg('Timeout — thử lại nhé');
        }
      }, 180_000);
    } catch {
      setErrorMsg('Lỗi kết nối');
      setState('error');
    }
  }, [state, activePrompt, styleLabel]);

  const reset = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    setState('idle');
    setResultUrl(null);
    setProgress(0);
    setErrorMsg('');
  };

  const isRunning = state === 'submitting' || state === 'processing';

  return (
    <div className="rounded-3xl overflow-hidden ring-1 ring-white/[0.07] shadow-2xl shadow-black/20"
      style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)', backdropFilter: 'blur(20px)' }}
    >
      {/* ── Window chrome ── */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.05]"
        style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400/70" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/70" />
        </div>
        <div className="flex items-center gap-1.5 text-[9px] font-semibold text-white/30 uppercase tracking-wider">
          <Building2 size={10} />
          Real Estate Visual AI · Quick Render
        </div>
        <div className="w-14" />
      </div>

      {/* ── Preview canvas ── */}
      <div className="relative overflow-hidden bg-black/40" style={{ aspectRatio: '16/9' }}>
        <AnimatePresence mode="wait">
          {state === 'idle' && (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              {/* Architectural grid placeholder */}
              <div className="w-full h-full absolute inset-0 grid grid-cols-3 grid-rows-2 gap-1 p-1 opacity-30">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="rounded-lg bg-emerald-500/10 border border-emerald-500/[0.08]"
                    style={{ animationDelay: `${i * 0.2}s` }} />
                ))}
              </div>
              <div className="relative z-10 flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <Building2 size={22} className="text-emerald-400/60" />
                </div>
                <p className="text-[11px] text-white/40 text-center max-w-[200px]">
                  Chọn loại công trình và nhấn{' '}
                  <span className="text-emerald-400 font-semibold">Render Ngay</span>
                </p>
              </div>
            </motion.div>
          )}

          {isRunning && (
            <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              {/* Cinematic scan line effect */}
              <motion.div
                className="absolute inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent"
                animate={{ y: ['0%', '100%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              />
              <div className="grid grid-cols-3 gap-1.5 w-full px-4">
                {[...Array(6)].map((_, i) => (
                  <motion.div key={i} className="aspect-video rounded-lg bg-emerald-500/5 border border-emerald-500/10"
                    animate={{ opacity: [0.3, 0.7, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }} />
                ))}
              </div>
              <div className="relative z-10 flex flex-col items-center gap-2 px-6 w-full">
                <p className="text-[10px] text-emerald-400/80 font-medium">
                  {state === 'submitting' ? 'Đang gửi job...' : `AI đang render... ${Math.round(progress)}%`}
                </p>
                <div className="w-full max-w-[200px]">
                  <ProgressBar progress={progress} color="#10b981" />
                </div>
              </div>
            </motion.div>
          )}

          {state === 'done' && resultUrl && (
            <motion.div key="done" initial={{ opacity: 0, scale: 1.03 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0"
            >
              <img src={resultUrl} alt="Render result" className="w-full h-full object-cover" />
              {/* Success overlay */}
              <motion.div
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500 text-white text-[9px] font-bold shadow-lg shadow-emerald-500/30"
              >
                <CheckCircle2 size={10} />
                Render Xong!
              </motion.div>
              {/* Download overlay on hover */}
              <div className="absolute bottom-3 right-3 flex gap-2">
                <a href={resultUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-black/60 backdrop-blur text-white text-[9px] font-medium hover:bg-black/80 transition-colors"
                >
                  <Download size={10} /> Lưu ảnh
                </a>
                <button onClick={reset}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/10 backdrop-blur text-white text-[9px] font-medium hover:bg-white/20 transition-colors"
                >
                  <RefreshCw size={10} /> Render mới
                </button>
              </div>
            </motion.div>
          )}

          {state === 'error' && (
            <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-3"
            >
              <AlertCircle size={28} className="text-red-400/60" />
              <p className="text-[11px] text-red-400/80">{errorMsg}</p>
              <button onClick={reset} className="text-[10px] text-white/40 hover:text-white/70 underline transition-colors">
                Thử lại
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Controls ── */}
      <div className="p-4 space-y-3 border-t border-white/[0.04]">
        {/* Prompt presets */}
        <div className="flex gap-1.5 flex-wrap">
          {DEMO_PROMPTS.map((p, i) => (
            <button
              key={p.label}
              onClick={() => { setSelectedPrompt(i); setCustomPrompt(''); setResultUrl(null); if (state === 'done' || state === 'error') setState('idle'); }}
              className={`px-2.5 py-1 rounded-lg text-[9px] font-semibold transition-all ${
                selectedPrompt === i && !customPrompt
                  ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
                  : 'border border-white/[0.06] text-white/40 hover:text-white/60 hover:border-white/10'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Style selector */}
        <div className="flex gap-1.5">
          {QUICK_STYLES.map((s, i) => (
            <button
              key={s.key}
              onClick={() => setSelectedStyle(i)}
              className={`flex-1 py-1 rounded-lg text-[9px] font-semibold transition-all border ${
                selectedStyle === i
                  ? 'text-white border-current'
                  : 'border-white/[0.06] text-white/35 hover:text-white/55'
              }`}
              style={selectedStyle === i ? { borderColor: s.color, backgroundColor: `${s.color}18`, color: s.color } : {}}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Custom prompt input */}
        <input
          value={customPrompt}
          onChange={e => { setCustomPrompt(e.target.value); if (state === 'done' || state === 'error') setState('idle'); }}
          onKeyDown={e => e.key === 'Enter' && startRender()}
          placeholder="Hoặc mô tả công trình của bạn..."
          className="w-full text-[11px] bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2 text-white/80 placeholder-white/20 focus:outline-none focus:border-emerald-500/40 transition-colors"
        />

        {/* Action buttons */}
        <div className="flex gap-2">
          <motion.button
            onClick={startRender}
            disabled={isRunning}
            whileHover={!isRunning ? { scale: 1.02 } : {}}
            whileTap={!isRunning ? { scale: 0.98 } : {}}
            className={`flex-1 py-2.5 rounded-xl text-[11px] font-bold flex items-center justify-center gap-2 transition-all ${
              isRunning
                ? 'bg-emerald-500/20 text-emerald-400/50 cursor-not-allowed'
                : 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-500/25 hover:brightness-110'
            }`}
          >
            {isRunning
              ? <><Loader2 size={12} className="animate-spin" /> Đang render...</>
              : <><Sparkles size={12} /> Render Ngay · Miễn phí</>
            }
          </motion.button>
          <motion.button
            onClick={onOpenStudio}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="px-4 py-2.5 rounded-xl border border-emerald-500/25 text-emerald-400 text-[11px] font-semibold hover:bg-emerald-500/10 transition-all whitespace-nowrap"
          >
            Mở Studio →
          </motion.button>
        </div>

        {!user && (
          <p className="text-[9px] text-white/25 text-center">
            Demo không cần đăng nhập · Đăng ký để dùng nhiều hơn
          </p>
        )}
      </div>
    </div>
  );
};

// ─── Animated stat counter ────────────────────────────────────
const StatItem: React.FC<{ value: string; label: string; delay: number }> = ({ value, label, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="text-center"
  >
    <p className="text-2xl font-black text-emerald-400 leading-none">{value}</p>
    <p className="text-[9px] text-white/35 font-medium mt-0.5 uppercase tracking-wide">{label}</p>
  </motion.div>
);

// ─── Main Section ─────────────────────────────────────────────
export const HeroSection: React.FC<HeroSectionProps> = ({ onStartStudio }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-300, 300], [4, -4]);
  const rotateY = useTransform(mouseX, [-300, 300], [-4, 4]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  }, [mouseX, mouseY]);

  return (
    <div
      ref={containerRef}
      onMouseMove={onMouseMove}
      className="relative min-h-screen flex flex-col justify-center pt-24 pb-16 px-6 lg:px-12 overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0a0e0d 0%, #0d1410 40%, #090d0b 100%)' }}
    >
      <BackgroundOrbs />

      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center relative z-10">

        {/* ── LEFT ── */}
        <div className="lg:col-span-5 space-y-8">
          <Link
            to="/markets"
            className="inline-flex items-center gap-1.5 text-[10px] font-medium uppercase text-white/30 hover:text-emerald-400 transition-colors tracking-wider"
          >
            <ChevronLeft size={12} /> Quay lại marketplace
          </Link>

          <FadeInUp>
            <div className="space-y-5">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[9px] font-bold uppercase tracking-widest"
                style={{ backgroundColor: 'rgba(16,185,129,0.08)', borderColor: 'rgba(16,185,129,0.2)', color: '#10b981' }}
              >
                <Building2 size={10} />
                BĐS & Kiến Trúc · AI Render
              </motion.div>

              {/* Heading */}
              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-black leading-[0.88] tracking-tight text-white">
                <motion.span
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.6 }}
                  className="block"
                >
                  Phối Cảnh
                </motion.span>
                <motion.span
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.6 }}
                  className="block relative"
                >
                  <span className="text-emerald-400 relative">
                    BĐS 4K
                    <motion.span
                      className="absolute bottom-0 left-0 h-[3px] rounded-full bg-emerald-400"
                      initial={{ width: 0 }} animate={{ width: '100%' }}
                      transition={{ delay: 1.0, duration: 0.8, ease: 'easeOut' }}
                    />
                  </span>
                </motion.span>
                <motion.span
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.6 }}
                  className="block text-white/40 text-3xl lg:text-4xl font-bold mt-1"
                >
                  bằng AI · 30 giây
                </motion.span>
              </h1>

              {/* Tagline */}
              <motion.p
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                className="text-sm text-white/45 leading-relaxed max-w-md"
              >
                Từ bản vẽ 2D đến render photorealistic — AI tạo exterior, interior staging, aerial view đạt chuẩn
                {' '}<strong className="text-white/70">studio kiến trúc chuyên nghiệp</strong>.
              </motion.p>

              {/* Stats row */}
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
                className="flex items-center gap-6 py-3 border-t border-white/[0.05]"
              >
                <StatItem value="4K+" label="Độ phân giải" delay={0.65} />
                <div className="w-px h-8 bg-white/[0.06]" />
                <StatItem value="30s" label="Tốc độ render" delay={0.7} />
                <div className="w-px h-8 bg-white/[0.06]" />
                <StatItem value="60+" label="Phong cách" delay={0.75} />
                <div className="w-px h-8 bg-white/[0.06]" />
                <StatItem value="100%" label="Photorealistic" delay={0.8} />
              </motion.div>
            </div>
          </FadeInUp>

          {/* Spec cards */}
          <FadeInUp delay={0.2}>
            <div className="grid grid-cols-2 gap-2">
              {SPECS.map(s => (
                <motion.div
                  key={s.label}
                  whileHover={{ scale: 1.02, backgroundColor: 'rgba(16,185,129,0.06)' }}
                  className="p-3 flex items-start gap-2.5 rounded-xl border border-white/[0.06] transition-colors cursor-default"
                  style={{ background: 'rgba(255,255,255,0.02)' }}
                >
                  <div className="shrink-0 w-6 h-6 rounded-md flex items-center justify-center" style={{ backgroundColor: 'rgba(16,185,129,0.12)', color: '#10b981' }}>
                    {s.icon}
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-white/80">{s.label}</p>
                    <p className="text-[8px] font-medium text-white/30">{s.sub}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </FadeInUp>

          {/* CTA */}
          <FadeInUp delay={0.3}>
            <div className="space-y-3">
              <motion.button
                onClick={onStartStudio}
                whileHover={{ scale: 1.02, boxShadow: '0 12px 40px rgba(16,185,129,0.35)' }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-3 px-8 py-4 rounded-2xl text-[11px] font-bold uppercase tracking-widest text-white transition-all"
                style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
              >
                <Sparkles size={14} />
                Tạo Phối Cảnh Ngay
                <ArrowRight size={14} />
              </motion.button>
              <p className="text-[10px] text-white/25 flex items-center gap-2 flex-wrap">
                <span>🔒 Không cần thẻ</span>
                <span className="opacity-40">·</span>
                <span>✓ Ảnh thuộc về bạn</span>
                <span className="opacity-40">·</span>
                <span>⚡ 100 CR miễn phí</span>
              </p>
            </div>
          </FadeInUp>
        </div>

        {/* ── RIGHT — Quick Render Widget ── */}
        <div className="lg:col-span-7 relative">
          <FadeInUp delay={0.2}>
            <motion.div
              style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
              className="relative"
            >
              <REQuickRenderWidget onOpenStudio={onStartStudio} />
            </motion.div>
          </FadeInUp>

          {/* Floating badge */}
          <FloatingBadge
            label="Photorealistic 4K"
            value="AI Architecture"
            className="absolute -bottom-4 -left-4"
            delay={1.0}
          />

          {/* Ambient glow behind widget */}
          <div
            className="absolute -inset-4 rounded-3xl opacity-20 blur-2xl pointer-events-none -z-10"
            style={{ background: 'radial-gradient(circle at 50% 50%, #10b981, transparent 70%)' }}
          />
        </div>
      </div>
    </div>
  );
};
