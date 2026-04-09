import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ChevronLeft, Sparkles, ArrowRight,
  Layout, Zap, Palette, Download, Loader2,
} from 'lucide-react';
import { GradientMesh, FadeInUp, HoverCard } from '../_shared/SectionAnimations';
import { FloatingBadge } from '../_shared/ProHeroVisuals';
import { imagesApi, ImageJobRequest } from '../../../apis/images';
import { useAuth } from '../../../context/AuthContext';

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

const DEMO_PROMPTS = [
  'Flash Sale 50% nền đỏ rực, chữ trắng bold, năng lượng cao',
  'Khai trương cửa hàng, pháo hoa vàng đỏ, festive Việt Nam',
  'Banner tuyển dụng chuyên nghiệp, gradient xanh dương tối',
  'Ra mắt sản phẩm mới, nền tối premium, spotlight trắng',
];

// ─── Mock banner cards hiển thị khi chưa tạo ảnh ────────────────────────────

const MOCK_BANNERS = [
  {
    label: 'Flash Sale',
    platform: 'FB Cover',
    tag: '#sale',
    gradient: 'from-red-500 via-orange-500 to-yellow-400',
    accent: 'bg-yellow-300',
    text: 'FLASH SALE',
    sub: 'Giảm đến 50%',
    dots: ['bg-yellow-200', 'bg-orange-200', 'bg-red-200'],
  },
  {
    label: 'Ra mắt SP',
    platform: 'IG Post',
    tag: '#launch',
    gradient: 'from-slate-900 via-blue-950 to-indigo-900',
    accent: 'bg-brand-blue',
    text: 'NEW ARRIVAL',
    sub: 'Premium Collection',
    dots: ['bg-blue-400', 'bg-indigo-400', 'bg-violet-400'],
  },
  {
    label: 'Khai trương',
    platform: 'X Header',
    tag: '#grand',
    gradient: 'from-amber-500 via-yellow-400 to-orange-400',
    accent: 'bg-white',
    text: 'GRAND OPENING',
    sub: 'Hôm nay khai trương',
    dots: ['bg-white/60', 'bg-amber-200', 'bg-yellow-200'],
  },
  {
    label: 'Tuyển dụng',
    platform: 'LinkedIn',
    tag: '#hiring',
    gradient: 'from-sky-600 via-blue-600 to-indigo-600',
    accent: 'bg-sky-300',
    text: "WE'RE HIRING",
    sub: 'Join our team today',
    dots: ['bg-sky-200', 'bg-blue-200', 'bg-indigo-200'],
  },
];

const BannerPlaceholder: React.FC = () => {
  return (
    <motion.div
      key="placeholder"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 overflow-hidden"
    >
      {/* Animated blur blobs background */}
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
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-indigo-400/10 blur-2xl"
        />
      </div>

      {/* Banner cards grid — 2×2 */}
      <div className="absolute inset-0 grid grid-cols-2 gap-2 p-3">
        {MOCK_BANNERS.map((b, i) => (
          <motion.div
            key={b.label}
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: i * 0.12, duration: 0.5, ease: 'easeOut' }}
            whileHover={{ scale: 1.03, zIndex: 10 }}
            className={`relative rounded-xl overflow-hidden bg-gradient-to-br ${b.gradient} flex flex-col justify-between p-3 cursor-default shadow-lg`}
          >
            {/* Shimmer sweep */}
            <motion.div
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 2.4, repeat: Infinity, repeatDelay: i * 1.2 + 2, ease: 'easeInOut' }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 pointer-events-none"
            />

            {/* Top row: platform pill + tag */}
            <div className="flex items-center justify-between">
              <span className="text-[7px] font-bold uppercase tracking-widest text-white/60 bg-white/10 px-1.5 py-0.5 rounded-full">
                {b.platform}
              </span>
              <span className="text-[7px] text-white/40">{b.tag}</span>
            </div>

            {/* Center text */}
            <div className="space-y-0.5">
              <p className="text-[11px] font-extrabold text-white leading-tight tracking-tight drop-shadow">
                {b.text}
              </p>
              <p className="text-[8px] text-white/70 font-medium">{b.sub}</p>
            </div>

            {/* Bottom: dot accents */}
            <div className="flex items-center gap-1">
              {b.dots.map((d, j) => (
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
                className={`w-5 h-1 rounded-full ${b.accent} opacity-60`}
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
          <p className="text-[8px] text-slate-400 dark:text-white/40">80 CR / banner</p>
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
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Demo dùng model mặc định — không cần user chọn engine
  const DEMO_ENGINE = 'gommo';
  const DEMO_MODEL  = 'Nano Banana';   // model nhanh nhất, chi phí thấp
  const DEMO_MODE   = 'relaxed';
  const DEMO_COST   = 80;             // CR khớp với FloatingBadge

  const pollJob = useCallback((jobId: string) => {
    pollTimerRef.current = setTimeout(async () => {
      try {
        const res = await imagesApi.getJobStatus(jobId);
        const status = res.data?.status;

        if (status === 'error' || status === 'failed') {
          // Hoàn credits khi job thất bại
          addCredits(DEMO_COST);
          setDemoStatus('error');
          setDemoLoading(false);
          return;
        }

        if (status === 'done' && res.data.result?.images?.length) {
          setDemoResult(res.data.result.images[0]);
          setDemoStatus('done');
          setDemoLoading(false);
          return;
        }

        // Còn processing → poll tiếp
        pollJob(jobId);
      } catch {
        // Lỗi mạng → retry chậm hơn
        pollTimerRef.current = setTimeout(() => pollJob(jobId), 10000);
      }
    }, 5000);
  }, [addCredits]);

  const runDemo = async () => {
    if (demoLoading || !demoPrompt.trim()) return;

    if (!isAuthenticated) { login(); return; }
    if (credits < DEMO_COST) { onOpenStudio(); return; }

    // Xóa poll timer cũ nếu có
    if (pollTimerRef.current) clearTimeout(pollTimerRef.current);

    setDemoLoading(true);
    setDemoResult(null);
    setDemoStatus('creating');

    const payload: ImageJobRequest = {
      type: 'text_to_image',
      input: {
        prompt: `Tạo banner mạng xã hội chuyên nghiệp, tỷ lệ 16:9. ${demoPrompt}. Chất lượng cao, bố cục đẹp mắt.`,
      },
      config: {
        width: 1280,
        height: 720,
        aspectRatio: '16:9',
        seed: 0,
        style: 'cinematic',
      },
      engine: {
        provider: DEMO_ENGINE as 'gommo' | 'fxlab',
        model: DEMO_MODEL,
      },
      enginePayload: {
        prompt: `Tạo banner mạng xã hội chuyên nghiệp, tỷ lệ 16:9. ${demoPrompt}. Chất lượng cao, bố cục đẹp mắt.`,
        privacy: 'PRIVATE',
        projectId: 'default',
        mode: DEMO_MODE,
      },
    };

    try {
      const res = await imagesApi.createJob(payload);
      const isSuccess = res.success === true || res.status?.toLowerCase() === 'success';

      if (isSuccess && res.data?.jobId) {
        // Trừ credits ngay khi job tạo thành công
        useCredits(DEMO_COST);
        setDemoStatus('polling');
        pollJob(res.data.jobId);
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
    if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
  };

  const statusLabel =
    demoStatus === 'creating' ? 'Đang gửi lên AI...' :
    demoStatus === 'polling'  ? 'AI đang vẽ...' :
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
              <p className="text-[10px] text-slate-400 animate-pulse">{statusLabel}</p>
            </motion.div>
          ) : demoStatus === 'error' ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-2 text-center px-4"
            >
              <p className="text-[11px] text-red-400 font-medium">Có lỗi xảy ra — credits đã được hoàn lại 🔄</p>
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
            <BannerPlaceholder />
          )}
        </AnimatePresence>

        {demoStatus === 'done' && (
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
            onChange={e => { setDemoPrompt(e.target.value); setDemoResult(null); setDemoStatus('idle'); }}
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
            {demoLoading
              ? <><Loader2 size={11} className="animate-spin" /> {statusLabel}</>
              : <><Sparkles size={11} /> Thử Ngay ({DEMO_COST} CR)</>
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
