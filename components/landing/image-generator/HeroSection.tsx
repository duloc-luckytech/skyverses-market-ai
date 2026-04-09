import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ChevronLeft, Sparkles, ArrowRight, Loader2,
  Image as ImageIcon, Cpu, Gauge, Ratio, Wand2,
  RefreshCw, Download, CheckCircle2, AlertCircle,
  Shuffle, ZoomIn,
} from 'lucide-react';
import { imagesApi, ImageJobRequest } from '../../../apis/images';
import { useAuth } from '../../../context/AuthContext';

interface HeroSectionProps { onStartStudio: () => void; }

const MODEL_FAMILIES = [
  { name: 'Nano Banana Pro', tag: 'Google', hot: true },
  { name: 'Seedream 5',      tag: 'ByteDance' },
  { name: 'Midjourney 7',   tag: 'Midjourney' },
  { name: 'Kling 3.0 Omni', tag: 'Kuaishou' },
  { name: 'IMAGE O1',        tag: 'Kling' },
  { name: 'Imagen 4.5',     tag: 'Google' },
  { name: 'Z-Image',        tag: 'Community' },
  { name: 'Dreamina 3.1',   tag: 'ByteDance' },
];

const SPECS = [
  { icon: <Cpu size={12} />,   label: '22+ AI Models', sub: '10+ model families' },
  { icon: <Gauge size={12} />, label: 'Lên đến 12K',   sub: '1K → Ultra HD 12K' },
  { icon: <Ratio size={12} />, label: '11 tỷ lệ',      sub: '16:9 · 9:16 · 1:1 · 21:9…' },
  { icon: <Wand2 size={12} />, label: 'AI Upscale',    sub: 'Nâng cấp ảnh chuyên nghiệp' },
];

const QUICK_PROMPTS = [
  { label: '🌅 Phong cảnh',   prompt: 'Stunning Vietnamese landscape at golden hour, misty mountains, rice terraces Sapa, ultra HD cinematic photography' },
  { label: '👤 Portrait',     prompt: 'Professional portrait of a young Vietnamese woman, soft studio lighting, bokeh background, film photography aesthetic, high quality' },
  { label: '🏙️ Đô thị',      prompt: 'Ho Chi Minh City skyline at night, neon lights reflection on river, aerial photography, cinematic, ultra realistic' },
  { label: '🎨 Abstract',     prompt: 'Vibrant abstract digital art, flowing liquid chrome and neon colors, generative art, ultra detailed, 8K' },
  { label: '🦋 Thiên nhiên',  prompt: 'Macro photography of exotic butterfly on tropical flower, Vietnam rainforest, ultra sharp detail, natural lighting' },
  { label: '🏮 Văn hóa',      prompt: 'Vietnamese Tet festival lanterns at night, Ho Chi Minh City old quarter, warm golden light, street photography, cinematic' },
];

const ASPECT_RATIOS = [
  { key: '1:1',  label: '1:1',  w: 1024, h: 1024 },
  { key: '16:9', label: '16:9', w: 1280, h: 720  },
  { key: '9:16', label: '9:16', w: 720,  h: 1280 },
  { key: '4:3',  label: '4:3',  w: 1024, h: 768  },
];

// ─── Animated gradient background ─────────────────────────────
const HeroBG: React.FC = () => (
  <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
    <motion.div
      className="absolute -top-[200px] -right-[200px] w-[700px] h-[700px] rounded-full"
      style={{ background: 'radial-gradient(circle, rgba(244,63,94,0.06), transparent 70%)' }}
      animate={{ scale: [1, 1.1, 1], x: [0, 20, 0] }}
      transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
    />
    <motion.div
      className="absolute -bottom-[200px] -left-[200px] w-[600px] h-[600px] rounded-full"
      style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.04), transparent 70%)' }}
      animate={{ scale: [1, 1.08, 1], y: [0, -20, 0] }}
      transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
    />
    {/* Subtle noise grid */}
    <div className="absolute inset-0 opacity-[0.012]"
      style={{
        backgroundImage: `linear-gradient(rgba(244,63,94,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(244,63,94,0.5) 1px, transparent 1px)`,
        backgroundSize: '48px 48px',
      }}
    />
  </div>
);

// ─── Placeholder mosaic (idle state) ──────────────────────────
const PLACEHOLDER_GRADIENTS = [
  'from-rose-500 via-fuchsia-600 to-purple-700',
  'from-orange-400 via-rose-500 to-pink-600',
  'from-sky-500 via-blue-600 to-indigo-700',
  'from-emerald-400 via-teal-500 to-cyan-600',
  'from-amber-400 via-orange-500 to-red-500',
  'from-violet-500 via-purple-600 to-fuchsia-700',
];

const IdleMosaic: React.FC = () => (
  <div className="absolute inset-0 overflow-hidden">
    {/* Blurred orbs */}
    <motion.div
      className="absolute -top-10 -left-10 w-48 h-48 rounded-full bg-rose-500/15 blur-3xl"
      animate={{ scale: [1, 1.15, 1], x: [0, 15, 0] }}
      transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
    />
    <motion.div
      className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-fuchsia-500/10 blur-3xl"
      animate={{ scale: [1, 1.2, 1], y: [0, -10, 0] }}
      transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
    />

    {/* 6-cell mosaic */}
    <div className="absolute inset-0 grid grid-cols-3 grid-rows-2 gap-1 p-1.5">
      {PLACEHOLDER_GRADIENTS.map((g, i) => (
        <motion.div
          key={i}
          className={`relative rounded-xl overflow-hidden bg-gradient-to-br ${g}`}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.1, duration: 0.5 }}
          whileHover={{ scale: 1.04, zIndex: 10 }}
        >
          {/* Shimmer */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent skew-x-12"
            animate={{ x: ['-120%', '200%'] }}
            transition={{ duration: 2.2, repeat: Infinity, repeatDelay: i * 0.8 + 1.5, ease: 'easeInOut' }}
          />
          {/* Icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <ImageIcon size={16} className="text-white/30" />
          </div>
        </motion.div>
      ))}
    </div>

    {/* Center overlay */}
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.7 }}
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
    >
      <motion.div
        animate={{ scale: [1, 1.04, 1] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="flex flex-col items-center gap-2 bg-white/90 dark:bg-black/75 backdrop-blur-xl px-5 py-3.5 rounded-2xl border border-white/50 dark:border-white/10 shadow-xl"
      >
        <motion.div
          animate={{ rotate: [0, 12, -12, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1 }}
        >
          <Sparkles size={22} className="text-rose-500" />
        </motion.div>
        <p className="text-[10px] font-bold text-slate-700 dark:text-white text-center">
          Nhập prompt → AI tạo ngay
        </p>
        <p className="text-[8px] text-slate-400 dark:text-white/40">22+ model · Từ 30 CR</p>
      </motion.div>
    </motion.div>
  </div>
);

// ─── Progress bar ──────────────────────────────────────────────
const ProgressBar: React.FC<{ value: number }> = ({ value }) => (
  <div className="h-0.5 w-full bg-rose-500/10 rounded-full overflow-hidden">
    <motion.div
      className="h-full bg-gradient-to-r from-rose-500 to-fuchsia-500 rounded-full"
      initial={{ width: 0 }}
      animate={{ width: `${value}%` }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    />
  </div>
);

// ─── Quick Gen Widget ──────────────────────────────────────────
type GenState = 'idle' | 'submitting' | 'processing' | 'done' | 'error';

const QuickGenWidget: React.FC<{ onOpenStudio: () => void }> = ({ onOpenStudio }) => {
  const [genState, setGenState] = useState<GenState>('idle');
  const [selectedPrompt, setSelectedPrompt] = useState(0);
  const [customPrompt, setCustomPrompt] = useState('');
  const [selectedRatio, setSelectedRatio] = useState(0);
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [fullscreen, setFullscreen] = useState(false);
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const { isAuthenticated, login, credits, useCredits, addCredits } = useAuth();

  const COST = 80;
  const ratio = ASPECT_RATIOS[selectedRatio];
  const activePrompt = customPrompt || QUICK_PROMPTS[selectedPrompt].prompt;
  const isRunning = genState === 'submitting' || genState === 'processing';

  const startGen = useCallback(async () => {
    if (isRunning || genState === 'done') return;
    if (!isAuthenticated) { login(); return; }
    if (credits < COST) { onOpenStudio(); return; }
    if (pollRef.current) clearInterval(pollRef.current);

    setGenState('submitting');
    setResultUrl(null);
    setErrorMsg('');
    setProgress(8);

    const payload: ImageJobRequest = {
      type: 'text_to_image',
      input: { prompt: activePrompt },
      config: { width: ratio.w, height: ratio.h, aspectRatio: ratio.key, seed: 0, style: '' },
      engine: { provider: 'gommo', model: 'google_image_gen_4_5' },
      enginePayload: { prompt: activePrompt, privacy: 'PRIVATE', projectId: 'default' },
    };

    try {
      const res = await imagesApi.createJob(payload);
      if (!res?.data?.jobId) throw new Error('No jobId');
      const isOk = res.success === true || res.status?.toLowerCase() === 'success';
      if (!isOk) throw new Error('Job rejected');
      useCredits(COST);
      const jobId = res.data.jobId;
      setGenState('processing');
      setProgress(20);

      let elapsed = 0;
      pollRef.current = setInterval(async () => {
        elapsed += 3;
        setProgress(Math.min(90, 20 + elapsed * 2.2));
        const status = await imagesApi.getJobStatus(jobId);
        const s = status?.data?.status;
        if (s === 'done') {
          clearInterval(pollRef.current!);
          const url = status.data.result?.images?.[0] ?? null;
          setResultUrl(url);
          setProgress(100);
          setGenState('done');
        } else if (s === 'failed' || s === 'error') {
          clearInterval(pollRef.current!);
          addCredits(COST);
          setErrorMsg('AI lỗi — Credits đã hoàn lại');
          setGenState('error');
        }
      }, 3000);

      setTimeout(() => {
        if (pollRef.current) { clearInterval(pollRef.current); setGenState('error'); setErrorMsg('Timeout'); }
      }, 180_000);
    } catch (e: any) {
      setErrorMsg(e?.message || 'Lỗi kết nối');
      setGenState('error');
    }
  }, [isRunning, genState, isAuthenticated, credits, activePrompt, ratio, login, onOpenStudio, useCredits, addCredits]);

  const reset = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    setGenState('idle'); setResultUrl(null); setProgress(0); setErrorMsg('');
  };

  const shufflePrompt = () => {
    const next = (selectedPrompt + 1) % QUICK_PROMPTS.length;
    setSelectedPrompt(next); setCustomPrompt('');
    if (genState === 'done' || genState === 'error') reset();
  };

  return (
    <div className="rounded-2xl overflow-hidden border border-black/[0.07] dark:border-white/[0.06] bg-white dark:bg-white/[0.02] shadow-2xl shadow-black/[0.08]">
      {/* Window chrome */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-black/[0.05] dark:border-white/[0.04] bg-slate-50/60 dark:bg-white/[0.015]">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
        </div>
        <span className="text-[9px] font-bold text-slate-400 dark:text-[#555] uppercase tracking-wider">
          Quick Generate · Image Studio
        </span>
        {/* Ratio selector in header */}
        <div className="flex items-center gap-1">
          {ASPECT_RATIOS.map((r, i) => (
            <button
              key={r.key}
              onClick={() => setSelectedRatio(i)}
              className={`px-2 py-0.5 rounded text-[8px] font-bold transition-all ${
                selectedRatio === i
                  ? 'bg-rose-500 text-white'
                  : 'text-slate-400 dark:text-[#555] hover:text-rose-500'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Canvas */}
      <div
        className="relative bg-slate-50 dark:bg-black/30 overflow-hidden"
        style={{ aspectRatio: `${ratio.w}/${ratio.h}`, maxHeight: '380px' }}
      >
        <AnimatePresence mode="wait">
          {genState === 'idle' && <IdleMosaic key="idle" />}

          {isRunning && (
            <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-4"
              style={{ background: 'linear-gradient(135deg, rgba(244,63,94,0.04), rgba(168,85,247,0.04))' }}
            >
              {/* Scan line */}
              <motion.div
                className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-rose-500/50 to-transparent pointer-events-none"
                animate={{ y: ['0%', '100%'] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
              />
              {/* Skeleton grid */}
              <div className="grid grid-cols-3 gap-1.5 w-full px-3">
                {[...Array(6)].map((_, i) => (
                  <motion.div key={i} className="aspect-square rounded-lg bg-rose-500/5 border border-rose-500/10"
                    animate={{ opacity: [0.3, 0.65, 0.3] }}
                    transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.15 }} />
                ))}
              </div>
              <div className="relative z-10 flex flex-col items-center gap-2 px-6 w-full">
                <p className="text-[10px] font-semibold text-rose-500/80">
                  {genState === 'submitting' ? 'Đang gửi job...' : `AI đang tạo... ${Math.round(progress)}%`}
                </p>
                <div className="w-full max-w-[200px]">
                  <ProgressBar value={progress} />
                </div>
              </div>
            </motion.div>
          )}

          {genState === 'done' && resultUrl && (
            <motion.div key="done" initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0"
            >
              <img src={resultUrl} alt="Generated" className="w-full h-full object-cover" />
              {/* Actions overlay */}
              <motion.div
                initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="absolute top-3 right-3 flex items-center gap-1.5"
              >
                <span className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-emerald-500 text-white text-[9px] font-bold shadow-lg">
                  <CheckCircle2 size={9} /> Xong!
                </span>
              </motion.div>

              {/* Bottom row */}
              <motion.div
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                className="absolute bottom-3 right-3 flex gap-1.5"
              >
                <button onClick={() => setFullscreen(true)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-black/60 backdrop-blur text-white text-[9px] font-medium hover:bg-black/80 transition-colors"
                >
                  <ZoomIn size={10} /> Xem lớn
                </button>
                <a href={resultUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-500/80 backdrop-blur text-white text-[9px] font-medium hover:bg-rose-500 transition-colors"
                >
                  <Download size={10} /> Tải về
                </a>
                <button onClick={reset}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/10 backdrop-blur text-white text-[9px] font-medium hover:bg-white/20 transition-colors"
                >
                  <RefreshCw size={10} />
                </button>
              </motion.div>
            </motion.div>
          )}

          {genState === 'error' && (
            <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-3"
            >
              <AlertCircle size={28} className="text-rose-400/60" />
              <p className="text-[11px] text-rose-400/80 text-center px-4">{errorMsg}</p>
              <button onClick={reset}
                className="text-[10px] text-slate-400 hover:text-rose-500 underline transition-colors"
              >
                Thử lại
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="p-3 space-y-2.5 border-t border-black/[0.04] dark:border-white/[0.04]">
        {/* Prompt presets */}
        <div className="flex gap-1.5 flex-wrap">
          {QUICK_PROMPTS.map((p, i) => (
            <button
              key={p.label}
              onClick={() => { setSelectedPrompt(i); setCustomPrompt(''); if (genState === 'done' || genState === 'error') reset(); }}
              className={`px-2.5 py-1 rounded-lg text-[9px] font-semibold transition-all ${
                selectedPrompt === i && !customPrompt
                  ? 'bg-rose-500/12 border border-rose-500/35 text-rose-500 dark:text-rose-400'
                  : 'border border-black/[0.07] dark:border-white/[0.06] text-slate-400 dark:text-[#555] hover:text-rose-500 hover:border-rose-500/25'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Custom prompt input */}
        <div className="flex gap-2">
          <input
            value={customPrompt}
            onChange={e => { setCustomPrompt(e.target.value); if (genState === 'done' || genState === 'error') reset(); }}
            onKeyDown={e => e.key === 'Enter' && startGen()}
            placeholder="Hoặc nhập prompt của bạn..."
            className="flex-1 text-[11px] bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] rounded-xl px-3 py-2 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-[#444] focus:outline-none focus:border-rose-500/40 transition-colors"
          />
          <button
            onClick={shufflePrompt}
            className="shrink-0 w-9 h-9 rounded-xl border border-slate-200 dark:border-white/[0.06] flex items-center justify-center text-slate-400 hover:text-rose-500 hover:border-rose-500/30 transition-colors"
            title="Đổi prompt mẫu"
          >
            <Shuffle size={13} />
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <motion.button
            onClick={startGen}
            disabled={isRunning}
            whileHover={!isRunning ? { scale: 1.02 } : {}}
            whileTap={!isRunning ? { scale: 0.98 } : {}}
            className={`flex-1 py-2.5 rounded-xl text-[11px] font-bold flex items-center justify-center gap-2 transition-all ${
              isRunning
                ? 'bg-rose-500/15 text-rose-400/50 cursor-not-allowed'
                : 'bg-gradient-to-r from-rose-600 to-fuchsia-600 text-white shadow-lg shadow-rose-500/20 hover:brightness-110'
            }`}
          >
            {isRunning
              ? <><Loader2 size={12} className="animate-spin" /> Đang tạo...</>
              : <><Sparkles size={12} /> Tạo Ngay · {COST} CR</>
            }
          </motion.button>
          <motion.button
            onClick={onOpenStudio}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="px-4 py-2.5 rounded-xl border border-rose-500/25 text-rose-500 dark:text-rose-400 text-[11px] font-semibold hover:bg-rose-500/8 transition-all whitespace-nowrap"
          >
            Studio →
          </motion.button>
        </div>

        {!isAuthenticated && (
          <p className="text-[9px] text-slate-400 dark:text-[#444] text-center">
            <button onClick={login} className="text-rose-500 underline font-semibold">Đăng nhập</button>
            {' '}để tạo ảnh · 100 CR miễn phí
          </p>
        )}
      </div>
    </div>
  );
};

// ─── Fullscreen lightbox ───────────────────────────────────────
const Fullscreen: React.FC<{ url: string; onClose: () => void }> = ({ url, onClose }) => (
  <motion.div
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/92 backdrop-blur-3xl"
    onClick={onClose}
  >
    <motion.img
      src={url} alt="Generated"
      initial={{ scale: 0.88, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.92, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 320, damping: 28 }}
      className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl object-contain"
      onClick={e => e.stopPropagation()}
    />
    <button onClick={onClose}
      className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-lg transition-colors"
    >×</button>
  </motion.div>
);

// ─── Main HeroSection ──────────────────────────────────────────
export const HeroSection: React.FC<HeroSectionProps> = ({ onStartStudio }) => {
  const [fullscreenUrl, setFullscreenUrl] = useState<string | null>(null);

  return (
    <section className="min-h-screen flex flex-col justify-center px-6 lg:px-12 py-16 relative overflow-hidden">
      <HeroBG />

      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center relative z-10">
        {/* ── LEFT ── */}
        <div className="lg:col-span-6 space-y-7">
          <Link to="/market" className="inline-flex items-center gap-1.5 text-[10px] font-medium uppercase text-slate-400 dark:text-[#555] hover:text-rose-500 dark:hover:text-rose-400 transition-colors tracking-wider">
            <ChevronLeft size={14} /> Trở lại
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-rose-500/[0.08] border border-rose-500/15 rounded-full text-rose-500 dark:text-rose-400 text-[10px] font-semibold uppercase tracking-wider">
              <Sparkles size={12} /> 22+ AI Image Models
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold leading-[0.9] tracking-tight">
              Image <br />
              <span className="text-rose-500 dark:text-rose-400 relative">
                Studio
                <motion.span
                  className="absolute bottom-0 left-0 h-[3px] bg-rose-500 rounded-full"
                  initial={{ width: 0 }} animate={{ width: '100%' }}
                  transition={{ delay: 0.9, duration: 0.7, ease: 'easeOut' }}
                />
              </span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-[#666] font-medium leading-relaxed max-w-md">
              Tạo hình ảnh AI chất lượng cao với hơn 22 model hàng đầu: Nano Banana Pro, Seedream 5, Midjourney 7, Kling 3.0 Omni — hỗ trợ lên tới 12K, 11 tỷ lệ, Single & Batch mode.
            </p>
          </motion.div>

          {/* Model pills */}
          <div className="space-y-2">
            <p className="text-[9px] font-semibold uppercase text-slate-400 dark:text-[#444] tracking-wider">Hỗ trợ Model Families</p>
            <div className="flex flex-wrap gap-1.5">
              {MODEL_FAMILIES.map(m => (
                <div key={m.name} className={`px-2.5 py-1 rounded-lg text-[9px] font-medium border transition-all ${
                  m.hot ? 'bg-rose-500/10 border-rose-500/25 text-rose-500 dark:text-rose-400'
                        : 'bg-black/[0.02] dark:bg-white/[0.02] border-black/[0.06] dark:border-white/[0.04] text-slate-500 dark:text-[#666]'
                }`}>
                  {m.name} <span className="text-slate-400 dark:text-[#444] ml-1">· {m.tag}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Specs */}
          <div className="grid grid-cols-2 gap-2">
            {SPECS.map(s => (
              <div key={s.label} className="p-3 bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.04] rounded-xl flex items-start gap-2.5 hover:border-rose-500/20 transition-all">
                <div className="shrink-0 w-6 h-6 rounded-md bg-rose-500/10 flex items-center justify-center text-rose-500 dark:text-rose-400">{s.icon}</div>
                <div>
                  <p className="text-[10px] font-semibold text-slate-700 dark:text-white/80">{s.label}</p>
                  <p className="text-[8px] font-medium text-slate-400 dark:text-[#444]">{s.sub}</p>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={onStartStudio}
            className="bg-gradient-to-r from-rose-600 to-fuchsia-600 text-white px-10 py-4 rounded-xl text-[11px] font-semibold uppercase tracking-widest shadow-lg shadow-rose-500/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-3 group"
          >
            Mở Image Studio <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* ── RIGHT — Quick Gen Widget ── */}
        <div className="lg:col-span-6">
          <motion.div
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <QuickGenWidget onOpenStudio={onStartStudio} />
          </motion.div>

          {/* Info strip */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="mt-3 flex items-center justify-center gap-4 text-[9px] text-slate-400 dark:text-[#444]"
          >
            <span>⚡ Tạo trong 30s</span>
            <span className="opacity-30">·</span>
            <span>🔒 Ảnh private mặc định</span>
            <span className="opacity-30">·</span>
            <span>💎 Từ 30 CR / ảnh</span>
          </motion.div>
        </div>
      </div>

      {/* Fullscreen lightbox */}
      <AnimatePresence>
        {fullscreenUrl && <Fullscreen url={fullscreenUrl} onClose={() => setFullscreenUrl(null)} />}
      </AnimatePresence>
    </section>
  );
};
