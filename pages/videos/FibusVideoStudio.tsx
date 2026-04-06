
import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Video, Cpu, Layers, Download, Play, ArrowRight,
  ChevronLeft, CheckCircle2, Star, Zap, Shield, Users,
  MonitorPlay, Sparkles, RefreshCw, LayoutGrid, Lock, ImageIcon
} from 'lucide-react';
import { usePageMeta } from '../../hooks/usePageMeta';

/*
 * BRAND COLORS — Matching https://ai.fibusvideo.com/
 * BG:          #050505 / #0a0a14
 * Video AI:    purple #A855F7 → blue #6366F1
 * Hình ảnh AI: amber #F59E0B → pink #EC4899
 * Heading:     violet #8B5CF6 → fuchsia #D946EF
 * Button:      indigo #6366F1 → purple #A855F7
 * Cards:       #0A0A0A border #1A1A1A
 */

/* ─── SHOWCASE ─── */
const SHOWCASE = [
  { url: 'https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?auto=format&fit=crop&q=80&w=700', label: 'Cinematic Drone Shot — Tokyo at Night', tag: 'Text-to-Video', model: 'VEO 3.1' },
  { url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=700', label: 'Fantasy Landscape — Floating Islands', tag: 'Image-to-Video', model: 'VEO 3.1' },
  { url: 'https://images.unsplash.com/photo-1559827291-72ee739d0d9a?auto=format&fit=crop&q=80&w=700', label: 'Underwater Coral Reef Exploration', tag: 'Text-to-Video', model: 'VEO 3.1' },
  { url: 'https://images.unsplash.com/photo-1524781289445-ddf8d5695861?auto=format&fit=crop&q=80&w=700', label: 'Hyperrealistic Portrait — Neon Lighting', tag: 'AI Image', model: 'Banana Pro' },
  { url: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&q=80&w=700', label: 'Slow-Motion Nature Macro Photography', tag: 'Image-to-Video', model: 'VEO 3.1' },
  { url: 'https://images.unsplash.com/photo-1552083375-1447ce886485?auto=format&fit=crop&q=80&w=700', label: 'Abstract Digital Art Composition', tag: 'AI Image', model: 'Nano Banana 2' },
];

/* ─── FEATURES ─── */
const FEATURES = [
  { icon: <Video size={22} />, title: 'Text-to-Video', desc: 'Nhập mô tả bằng chữ — AI tạo video chất lượng cao với VEO 3.1. Hỗ trợ landscape, portrait và nhiều chế độ.', stat: 'VEO 3.1', badge: 'Flagship', color: 'purple' },
  { icon: <Play size={22} />, title: 'Image-to-Video', desc: 'Biến ảnh tĩnh thành video sống động. Start Image và Start+End Image để kiểm soát chuyển động.', stat: 'Seamless', badge: 'Popular', color: 'indigo' },
  { icon: <Users size={22} />, title: 'Multi-Account VEO3', desc: 'Linh động chuyển đổi nhiều tài khoản VEO3 FX Lab. Không cần đăng nhập lại — một click switch.', stat: 'Unlimited', badge: 'Exclusive', color: 'violet' },
  { icon: <ImageIcon size={22} />, title: 'AI Image Generation', desc: 'Tạo hình ảnh AI siêu chất lượng với Banana Pro & Nano Banana 2 — hai model mạnh nhất hiện tại.', stat: 'Banana Pro', badge: 'Premium', color: 'pink' },
  { icon: <LayoutGrid size={22} />, title: 'Thư viện Media', desc: 'Quản lý toàn bộ ảnh và video đã tạo. Upload, sắp xếp, preview nhanh trong giao diện trực quan.', stat: 'Cloud-ready', badge: 'Organized', color: 'purple' },
  { icon: <RefreshCw size={22} />, title: 'Multi-Queue Processing', desc: 'Tạo nhiều video/ảnh cùng lúc. Hệ thống hàng đợi thông minh, tự động xử lý tuần tự.', stat: 'Parallel', badge: 'Smart', color: 'indigo' },
];

const FEATURE_COLORS: Record<string, string> = {
  purple: 'border-purple-500/10 hover:border-purple-500/25 group-hover:text-purple-400',
  indigo: 'border-indigo-500/10 hover:border-indigo-500/25 group-hover:text-indigo-400',
  violet: 'border-violet-500/10 hover:border-violet-500/25 group-hover:text-violet-400',
  pink:   'border-pink-500/10 hover:border-pink-500/25 group-hover:text-pink-400',
};

const FEATURE_ICON_COLORS: Record<string, string> = {
  purple: 'bg-purple-500/[0.06] border-purple-500/15 text-purple-500/50 group-hover:text-purple-400 group-hover:border-purple-500/30',
  indigo: 'bg-indigo-500/[0.06] border-indigo-500/15 text-indigo-500/50 group-hover:text-indigo-400 group-hover:border-indigo-500/30',
  violet: 'bg-violet-500/[0.06] border-violet-500/15 text-violet-500/50 group-hover:text-violet-400 group-hover:border-violet-500/30',
  pink:   'bg-pink-500/[0.06] border-pink-500/15 text-pink-500/50 group-hover:text-pink-400 group-hover:border-pink-500/30',
};

/* ─── WORKFLOW ─── */
const WORKFLOW = [
  { step: '01', title: 'Tải & Cài đặt', desc: 'Tải file .dmg (macOS) hoặc .exe (Windows). Mở file và kéo vào Applications. Chạy app lần đầu.', icon: <Download size={20} />, badge: 'Free' },
  { step: '02', title: 'Đăng nhập VEO3', desc: 'Mở trang "Đăng nhập VEO3" trong sidebar. Đăng nhập Google để kết nối VEO3 FX Lab. Hỗ trợ đa tài khoản.', icon: <MonitorPlay size={20} />, badge: 'Google' },
  { step: '03', title: 'Kích hoạt License', desc: 'Vào trang "Gói & License", chọn gói phù hợp, thanh toán qua QR Code. Nhận key và kích hoạt tức thì.', icon: <Lock size={20} />, badge: 'Instant' },
  { step: '04', title: 'Tạo Video & Ảnh AI', desc: 'Chọn Video PRO để tạo từ text hoặc ảnh. Chọn Tạo Hình để generate ảnh AI. Nhập prompt và gửi.', icon: <Sparkles size={20} />, badge: 'Create' },
];

/* ─── PRICING ─── */
const PRICING = [
  { name: 'Gói 1 Tháng', highlight: false, features: ['Text-to-Video không giới hạn', 'Image-to-Video đầy đủ', 'AI Image Generation', 'Multi-queue processing', 'Thư viện media', 'Hỗ trợ cơ bản'] },
  { name: 'Gói 1 Năm', highlight: true, badge: 'Tiết kiệm 40%', features: ['Tất cả tính năng gói tháng', 'Ưu tiên xử lý nhanh hơn', 'Cập nhật tính năng mới sớm', 'Hỗ trợ VIP riêng', 'Tiết kiệm 40%', 'Bảo hành trọn đời license'] },
];

/* ─── STATS ─── */
const STATS = [
  { value: 'VEO 3.1', label: 'Latest AI Model' },
  { value: '4K', label: 'Max Resolution' },
  { value: '8s', label: 'Video Length' },
  { value: '∞', label: 'Creativity' },
];

/* ─── TRUSTED BY ─── */
const TRUSTED = [
  { name: 'Fx Flow', icon: '⚡' },
  { name: 'Skyverses', icon: '🌌' },
  { name: 'Google AI', icon: '🤖' },
];

/* ─── FILM GRAIN overlay ─── */
const FilmGrain = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.02] z-0">
    <div className="absolute inset-0"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
        animation: 'grain 0.4s steps(1) infinite',
      }}
    />
    <style>{`
      @keyframes grain {
        0%,100%{transform:translate(0,0)}10%{transform:translate(-2%,-3%)}20%{transform:translate(4%,2%)}
        30%{transform:translate(-3%,4%)}40%{transform:translate(2%,-2%)}50%{transform:translate(-4%,3%)}
        60%{transform:translate(3%,-4%)}70%{transform:translate(-1%,2%)}80%{transform:translate(4%,-1%)}90%{transform:translate(-2%,4%)}
      }
    `}</style>
  </div>
);

/* ─── SHOWCASE CARD ─── */
const ShowcaseCard: React.FC<{ item: (typeof SHOWCASE)[0]; index: number }> = ({ item, index }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springX = useSpring(rotateX, { stiffness: 200, damping: 20 });
  const springY = useSpring(rotateY, { stiffness: 200, damping: 20 });

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] as const }}
      onMouseMove={(e) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        rotateX.set(-y * 12);
        rotateY.set(x * 12);
      }}
      onMouseLeave={() => { rotateX.set(0); rotateY.set(0); }}
      style={{ rotateX: springX, rotateY: springY, transformStyle: 'preserve-3d' }}
      className="group cursor-pointer"
    >
      <div className="relative bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl overflow-hidden
        shadow-[0_20px_60px_rgba(0,0,0,0.6)]
        hover:shadow-[0_30px_80px_rgba(139,92,246,0.12)]
        hover:border-purple-500/20 transition-all duration-700">

        <div className="aspect-[16/10] relative overflow-hidden">
          <img
            src={item.url}
            className="w-full h-full object-cover opacity-70 group-hover:opacity-95 group-hover:scale-105 transition-all duration-1000 saturate-[0.7] group-hover:saturate-100"
            alt={item.label}
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/20 to-transparent" />

          {/* Tag */}
          <div className="absolute top-3 left-3 flex items-center gap-2 z-20">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse shadow-[0_0_6px_rgba(168,85,247,0.8)]" />
            <span className="text-[8px] font-mono font-bold text-purple-400/80 uppercase tracking-widest">{item.tag}</span>
          </div>
          <div className="absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="px-2 py-0.5 bg-indigo-500/15 border border-indigo-500/30 rounded text-[7px] font-mono text-indigo-300">
              {item.model}
            </div>
          </div>

          {/* Play */}
          <div className="absolute inset-0 flex items-center justify-center z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-14 h-14 rounded-full bg-indigo-500/20 border border-indigo-500/40 backdrop-blur-sm flex items-center justify-center">
              <Play size={20} className="text-indigo-300 fill-indigo-300/70 ml-1" />
            </div>
          </div>
        </div>

        <div className="p-4 relative z-20">
          <h4 className="text-sm font-bold text-white/90 leading-tight">{item.label}</h4>
          <div className="flex items-center justify-between mt-2">
            <span className="text-[9px] font-mono text-purple-500/40">Fibus • {item.model}</span>
            <div className="flex gap-1">
              {[...Array(3)].map((_, i) => (
                <div key={i} className={`w-1 h-1 rounded-full ${i < 2 ? 'bg-indigo-500/30' : 'bg-purple-400/50'}`} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════ */
const FibusVideoStudio: React.FC = () => {
  usePageMeta({
    title: 'Fibus Video Studio — AI Video & Image Studio | Powered by Google VEO3 | Skyverses',
    description: 'Ứng dụng desktop tạo Video AI & Image AI mạnh nhất. Text-to-Video, Image-to-Video powered by Google VEO3. Multi-account, Multi-queue. Dùng thử miễn phí.',
    keywords: 'fibus video studio, google veo3, ai video generator, text to video, image to video, banana pro, AI desktop app',
    canonical: '/product/fibus-video-studio',
  });

  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.96]);

  const handleOpen = () => {
    window.open('https://ai.fibusvideo.com/', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bg-[#050505] min-h-screen text-white font-sans selection:bg-purple-500/30 overflow-x-hidden">

      {/* ═══ HERO ═══ */}
      <motion.section
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden"
      >
        <FilmGrain />

        {/* BG dots grid — like fibus site */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.3]"
          style={{
            backgroundImage: 'radial-gradient(circle, #1a1a2e 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }} />

        {/* Glow orbs */}
        <div className="absolute top-0 right-1/4 w-[700px] h-[700px] bg-purple-600/[0.06] rounded-full blur-[160px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/[0.05] rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-violet-600/[0.04] rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 text-center max-w-5xl mx-auto space-y-8 pt-20">
          {/* Back link */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <Link to="/markets" className="inline-flex items-center gap-2 text-[11px] font-mono font-semibold text-purple-500/50 hover:text-purple-400 transition-colors mb-6">
              <ChevronLeft size={14} /> ← Trở về Marketplace
            </Link>
          </motion.div>

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-indigo-500/[0.08] border border-indigo-500/20 text-indigo-300 text-[11px] font-mono font-semibold"
          >
            <Sparkles size={12} className="text-purple-400" />
            Powered by Google VEO3
          </motion.div>

          {/* H1 — match fibus site gradient style */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1, ease: [0.22, 1, 0.36, 1] as const }}
            className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.05]"
          >
            Tạo{' '}
            <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
              Video AI
            </span>{' '}
            &{' '}
            <span className="bg-gradient-to-r from-amber-400 to-pink-400 bg-clip-text text-transparent">
              Hình ảnh AI
            </span>
            <br />
            <span className="text-white">chỉ trong vài giây</span>
          </motion.h1>

          {/* Sub */}
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
            className="text-base md:text-lg text-[#94a3b8] max-w-2xl mx-auto leading-relaxed"
          >
            Fibus Video Studio là công cụ desktop mạnh mẽ giúp bạn tạo video và hình ảnh chất lượng cao bằng AI.
          </motion.p>

          {/* CTAs — indigo→purple gradient like fibus */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}
            className="flex flex-wrap items-center justify-center gap-4 pt-4"
          >
            <button
              onClick={handleOpen}
              id="fibus-cta-primary"
              className="group relative px-10 py-4 rounded-xl font-bold text-sm tracking-wide shadow-[0_0_40px_rgba(99,102,241,0.25)] hover:shadow-[0_0_70px_rgba(99,102,241,0.4)] hover:scale-[1.03] transition-all flex items-center gap-3 overflow-hidden"
              style={{ background: 'linear-gradient(to right, #6366f1, #a855f7)' }}
            >
              <Download size={17} />
              Tải miễn phí
              <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={handleOpen}
              id="fibus-cta-secondary"
              className="px-10 py-4 border border-[#1f2937] rounded-xl font-semibold text-sm text-white/70 hover:text-white hover:border-white/20 hover:bg-white/[0.03] transition-all flex items-center gap-2"
            >
              <Play size={14} /> Xem demo
            </button>
          </motion.div>

          {/* Stats row — same as fibus */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-12 max-w-2xl mx-auto"
          >
            {STATS.map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl md:text-3xl font-black text-white">{s.value}</div>
                <div className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-wider mt-1">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <div className="w-px h-12 bg-gradient-to-b from-transparent to-purple-500/30" />
          <span className="text-[8px] font-mono text-purple-500/40 uppercase tracking-widest">Scroll</span>
        </motion.div>
      </motion.section>

      {/* ═══ TRUSTED BY ═══ */}
      <section className="py-16 px-6 border-t border-[#1a1a1a]">
        <div className="max-w-3xl mx-auto">
          <p className="text-center text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest mb-10">
            TRUSTED BY
          </p>
          <div className="grid grid-cols-3 gap-4">
            {TRUSTED.map((t, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center gap-3 py-6 px-4 bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl hover:border-[#2a2a2a] transition-all"
              >
                <span className="text-2xl">{t.icon}</span>
                <span className="text-[12px] font-semibold text-[#94a3b8]">{t.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section id="features" className="py-32 px-6 lg:px-12 border-t border-[#1a1a1a] relative">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center space-y-4 mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/[0.08] border border-indigo-500/20 text-indigo-300 text-[11px] font-semibold">
              <Zap size={11} />
              TÍNH NĂNG
            </div>
            <h2 className="text-4xl lg:text-5xl font-black tracking-tight">
              Mọi thứ bạn cần,{' '}
              <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                trong một ứng dụng
              </span>
            </h2>
            <p className="text-[#94a3b8] max-w-lg mx-auto text-sm leading-relaxed">
              Fibus Video Studio tích hợp toàn bộ công cụ AI sáng tạo từ Google vào một desktop app duy nhất.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.09, ease: [0.22, 1, 0.36, 1] as const }}
                className={`group p-8 bg-[#0a0a0a] border rounded-2xl transition-all duration-500 relative overflow-hidden ${FEATURE_COLORS[f.color]}`}
              >
                <div className="absolute top-4 right-4 px-2 py-0.5 bg-white/[0.04] border border-white/[0.06] rounded text-[7px] font-semibold text-white/30 uppercase">
                  {f.badge}
                </div>
                <div className={`w-12 h-12 border flex items-center justify-center rounded-xl mb-6 transition-all ${FEATURE_ICON_COLORS[f.color]}`}>
                  {f.icon}
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-bold text-white/90">{f.title}</h4>
                    <span className="text-[8px] font-mono text-white/20 uppercase">{f.stat}</span>
                  </div>
                  <p className="text-sm text-[#94a3b8] leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SHOWCASE GALLERY ═══ */}
      <section id="showcase" className="py-32 px-6 lg:px-12 border-t border-[#1a1a1a] relative">
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-[#080510] to-[#050505] pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center space-y-4 mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/[0.08] border border-purple-500/20 text-purple-300 text-[11px] font-semibold">
              <Video size={11} />
              SHOWCASE
            </div>
            <h2 className="text-4xl lg:text-6xl font-black tracking-tight">
              Tác phẩm{' '}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">AI</span>
            </h2>
            <p className="text-sm text-[#94a3b8] max-w-md mx-auto">
              Khám phá những tác phẩm ấn tượng tạo bởi cộng đồng người dùng Fibus Video Studio.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" style={{ perspective: '1200px' }}>
            {SHOWCASE.map((item, i) => <ShowcaseCard key={i} item={item} index={i} />)}
          </div>
        </div>
      </section>

      {/* ═══ WORKFLOW ═══ */}
      <section id="how-to-use" className="py-32 px-6 lg:px-12 border-t border-[#1a1a1a]">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center space-y-4 mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/[0.08] border border-indigo-500/20 text-indigo-300 text-[11px] font-semibold">
              <Zap size={11} />
              HƯỚNG DẪN
            </div>
            <h2 className="text-4xl lg:text-5xl font-black tracking-tight">
              Bắt đầu trong{' '}
              <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">4 bước</span>
            </h2>
            <p className="text-sm text-[#94a3b8] max-w-md mx-auto">
              Từ tải app đến tạo video AI đầu tiên — quy trình đơn giản, nhanh chóng.
            </p>
          </motion.div>

          <div className="relative">
            <div className="absolute left-7 top-0 bottom-0 w-px bg-gradient-to-b from-indigo-500/20 via-purple-500/10 to-transparent hidden md:block" />
            <div className="space-y-6">
              {WORKFLOW.map((s, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                  transition={{ delay: i * 0.12, ease: [0.22, 1, 0.36, 1] as const }}
                  className="flex gap-6 items-start group"
                >
                  <div className="shrink-0 w-14 h-14 rounded-xl bg-indigo-500/[0.06] border border-indigo-500/10 flex items-center justify-center text-indigo-400/50 group-hover:text-indigo-400 group-hover:border-indigo-500/30 group-hover:bg-indigo-500/10 transition-all relative z-10">
                    {s.icon}
                  </div>
                  <div className="flex-grow p-6 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl group-hover:border-[#2a2a2a] transition-all">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-[9px] font-mono text-indigo-400/50 uppercase">STEP_{s.step}</span>
                      <span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/15 rounded text-[7px] font-semibold text-indigo-300/60">{s.badge}</span>
                      <div className="h-px flex-grow bg-[#1a1a1a]" />
                    </div>
                    <h4 className="text-base font-bold text-white/90 mb-1">{s.title}</h4>
                    <p className="text-sm text-[#94a3b8]">{s.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ PRICING ═══ */}
      <section id="pricing" className="py-32 px-6 lg:px-12 border-t border-[#1a1a1a] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-[#07050f] to-[#050505] pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center space-y-4 mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/[0.08] border border-purple-500/20 text-purple-300 text-[11px] font-semibold">
              <Shield size={11} />
              BẢNG GIÁ
            </div>
            <h2 className="text-4xl lg:text-5xl font-black tracking-tight">
              Chọn gói{' '}
              <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">phù hợp</span>
            </h2>
            <p className="text-sm text-[#94a3b8] max-w-md mx-auto">
              Miễn phí cài đặt. Kích hoạt license để mở khóa toàn bộ tính năng.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {PRICING.map((plan, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.15, ease: [0.22, 1, 0.36, 1] as const }}
                className={`relative rounded-2xl p-8 border transition-all duration-500 ${
                  plan.highlight
                    ? 'bg-gradient-to-b from-indigo-500/[0.07] to-[#0a0a0a] border-indigo-500/25 shadow-[0_0_60px_rgba(99,102,241,0.07)]'
                    : 'bg-[#0a0a0a] border-[#1a1a1a] hover:border-[#2a2a2a]'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 text-white text-[10px] font-bold rounded-full uppercase tracking-wider"
                    style={{ background: 'linear-gradient(to right, #6366f1, #a855f7)' }}>
                    {plan.badge}
                  </div>
                )}

                <h3 className="text-xl font-black text-white/90 mb-6">{plan.name}</h3>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feat, j) => (
                    <li key={j} className="flex items-start gap-3">
                      <CheckCircle2 size={14} className="text-indigo-400 shrink-0 mt-0.5" />
                      <span className="text-sm text-[#94a3b8]">{feat}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={handleOpen}
                  className={`w-full py-4 rounded-xl font-bold text-sm tracking-wide transition-all ${
                    plan.highlight
                      ? 'text-white shadow-[0_0_30px_rgba(99,102,241,0.3)] hover:shadow-[0_0_50px_rgba(99,102,241,0.5)] hover:scale-[1.02]'
                      : 'border border-[#2a2a2a] text-white/60 hover:text-white hover:border-indigo-500/30 hover:bg-indigo-500/[0.04]'
                  }`}
                  style={plan.highlight ? { background: 'linear-gradient(to right, #6366f1, #a855f7)' } : {}}
                >
                  Xem giá & Đăng ký →
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ DOWNLOAD CTA ═══ */}
      <section id="download" className="py-40 text-center relative overflow-hidden border-t border-[#1a1a1a]">
        <FilmGrain />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505] pointer-events-none z-[1]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-indigo-600/[0.05] rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-purple-600/[0.04] rounded-full blur-[80px] pointer-events-none" />

        <div className="max-w-3xl mx-auto space-y-10 relative z-10 px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="space-y-6">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto text-indigo-400"
              style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(168,85,247,0.1))', border: '1px solid rgba(99,102,241,0.2)' }}>
              <Video size={32} />
            </div>
            <h2 className="text-5xl md:text-7xl font-black tracking-tight leading-[0.95]">
              TẠO VIDEO AI
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-indigo-400 to-pink-400 bg-clip-text text-transparent">
                NGAY HÔM NAY
              </span>
            </h2>
            <p className="text-sm text-[#94a3b8] max-w-md mx-auto">
              Fibus Video Studio — công cụ tạo Video AI & Hình ảnh AI mạnh mẽ nhất. Powered by Google VEO3.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleOpen}
              id="fibus-download-main"
              className="group relative px-14 py-5 rounded-xl text-sm font-bold tracking-wider shadow-[0_0_60px_rgba(99,102,241,0.25)] hover:shadow-[0_0_100px_rgba(99,102,241,0.4)] hover:scale-[1.05] transition-all inline-flex items-center gap-3"
              style={{ background: 'linear-gradient(to right, #6366f1, #a855f7)' }}
            >
              <Download size={18} />
              TẢI FIBUS VIDEO STUDIO
              <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
            </button>
          </motion.div>

          {/* Platform chips */}
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap items-center justify-center gap-3">
            {[
              { label: 'Apple Silicon', sub: 'M1, M2, M3' },
              { label: 'Intel Mac', sub: 'x64' },
              { label: 'Windows', sub: '10 / 11' },
            ].map((p, i) => (
              <div key={i} onClick={handleOpen}
                className="cursor-pointer px-4 py-2 bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg hover:border-indigo-500/25 hover:bg-indigo-500/[0.04] transition-all text-left">
                <div className="text-xs font-bold text-white/70">{p.label}</div>
                <div className="text-[9px] font-mono text-[#94a3b8]">{p.sub}</div>
              </div>
            ))}
          </motion.div>

          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-[10px] font-mono text-white/15 space-x-3">
            <span>macOS 12+ / Windows 10+</span>
            <span>•</span>
            <span>RAM 8GB+</span>
            <span>•</span>
            <span>Kết nối Internet</span>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-center gap-2 pt-2">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map(i => <Star key={i} size={12} className="text-indigo-400/50 fill-indigo-400/50" />)}
            </div>
            <span className="text-[10px] font-mono text-white/20">1,000+ creators tin dùng • Được tạo bởi Skyverses</span>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default FibusVideoStudio;
