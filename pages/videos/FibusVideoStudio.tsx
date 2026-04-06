
import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Video, Image, Cpu, Layers, Download, Play, ArrowRight,
  ChevronLeft, CheckCircle2, Star, Zap, Shield, Users,
  MonitorPlay, Sparkles, RefreshCw, LayoutGrid, Lock
} from 'lucide-react';
import { usePageMeta } from '../../hooks/usePageMeta';

/* ─── BRAND COLOR: Amber-Orange (cinematic video feel) ─── */

/* ─── SHOWCASE GALLERY ─── */
const SHOWCASE = [
  {
    url: 'https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?auto=format&fit=crop&q=80&w=700',
    label: 'Cinematic Drone Shot — Tokyo at Night',
    tag: 'Text-to-Video',
    model: 'VEO 3.1',
  },
  {
    url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=700',
    label: 'Fantasy Landscape — Floating Islands',
    tag: 'Image-to-Video',
    model: 'VEO 3.1',
  },
  {
    url: 'https://images.unsplash.com/photo-1559827291-72ee739d0d9a?auto=format&fit=crop&q=80&w=700',
    label: 'Underwater Coral Reef Exploration',
    tag: 'Text-to-Video',
    model: 'VEO 3.1',
  },
  {
    url: 'https://images.unsplash.com/photo-1524781289445-ddf8d5695861?auto=format&fit=crop&q=80&w=700',
    label: 'Hyperrealistic Portrait — Neon Lighting',
    tag: 'AI Image',
    model: 'Banana Pro',
  },
  {
    url: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&q=80&w=700',
    label: 'Slow-Motion Nature Macro Photography',
    tag: 'Image-to-Video',
    model: 'VEO 3.1',
  },
  {
    url: 'https://images.unsplash.com/photo-1552083375-1447ce886485?auto=format&fit=crop&q=80&w=700',
    label: 'Abstract Digital Art Composition',
    tag: 'AI Image',
    model: 'Nano Banana 2',
  },
];

/* ─── FEATURES ─── */
const FEATURES = [
  {
    icon: <Video size={22} />,
    title: 'Text-to-Video',
    desc: 'Nhập mô tả bằng chữ — AI tạo video chất lượng cao với VEO 3.1. Hỗ trợ landscape, portrait và nhiều chế độ chất lượng.',
    stat: 'VEO 3.1',
    badge: 'Flagship',
  },
  {
    icon: <Play size={22} />,
    title: 'Image-to-Video',
    desc: 'Biến ảnh tĩnh thành video sống động. Hỗ trợ Start Image và Start+End Image để kiểm soát chuyển động chính xác.',
    stat: 'Seamless',
    badge: 'Popular',
  },
  {
    icon: <Users size={22} />,
    title: 'Multi-Account VEO3',
    desc: 'Linh động chuyển đổi nhiều tài khoản VEO3 FX Lab. Không cần đăng nhập lại — chỉ cần một click để switch account.',
    stat: 'Unlimited',
    badge: 'Exclusive',
  },
  {
    icon: <Image size={22} />,
    title: 'AI Image Generation',
    desc: 'Tạo hình ảnh AI siêu chất lượng với Banana Pro & Nano Banana 2 — hai model mạnh nhất hiện tại trên thị trường.',
    stat: 'Banana Pro',
    badge: 'Premium',
  },
  {
    icon: <LayoutGrid size={22} />,
    title: 'Thư viện Media',
    desc: 'Quản lý toàn bộ ảnh và video đã tạo. Upload, sắp xếp, preview nhanh chóng trong một giao diện trực quan.',
    stat: 'Cloud-ready',
    badge: 'Organized',
  },
  {
    icon: <RefreshCw size={22} />,
    title: 'Multi-Queue Processing',
    desc: 'Tạo nhiều video/ảnh cùng lúc. Hệ thống hàng đợi thông minh, tự động xử lý tuần tự — không bỏ lỡ job nào.',
    stat: 'Parallel',
    badge: 'Smart',
  },
];

/* ─── WORKFLOW STEPS ─── */
const WORKFLOW = [
  {
    step: '01',
    title: 'Tải & Cài đặt',
    desc: 'Tải file .dmg (macOS) hoặc .exe (Windows). Mở file và kéo vào Applications. Chạy app lần đầu trong vài giây.',
    icon: <Download size={20} />,
    badge: 'Free',
  },
  {
    step: '02',
    title: 'Đăng nhập VEO3',
    desc: 'Mở trang \"Đăng nhập VEO3\" trong sidebar. Đăng nhập Google để kết nối VEO3 FX Lab. Hỗ trợ đa tài khoản.',
    icon: <MonitorPlay size={20} />,
    badge: 'Google',
  },
  {
    step: '03',
    title: 'Kích hoạt License',
    desc: 'Vào trang \"Gói & License\", chọn gói phù hợp, thanh toán qua QR Code. Nhận key và kích hoạt tức thì.',
    icon: <Lock size={20} />,
    badge: 'Instant',
  },
  {
    step: '04',
    title: 'Tạo Video & Ảnh AI',
    desc: 'Chọn Video PRO để tạo từ text hoặc ảnh. Chọn Tạo Hình để generate ảnh AI chất lượng cao. Nhập prompt và gửi.',
    icon: <Sparkles size={20} />,
    badge: 'Create',
  },
];

/* ─── PRICING ─── */
const PRICING = [
  {
    name: 'Gói 1 Tháng',
    highlight: false,
    features: [
      'Text-to-Video không giới hạn',
      'Image-to-Video đầy đủ',
      'AI Image Generation',
      'Multi-queue processing',
      'Thư viện media',
      'Hỗ trợ cơ bản',
    ],
  },
  {
    name: 'Gói 1 Năm',
    highlight: true,
    badge: 'Tiết kiệm 40%',
    features: [
      'Tất cả tính năng gói tháng',
      'Ưu tiên xử lý nhanh hơn',
      'Cập nhật tính năng mới sớm',
      'Hỗ trợ VIP riêng',
      'Tiết kiệm 40%',
      'Bảo hành trọn đời license',
    ],
  },
];

/* ─── STATS ─── */
const STATS = [
  { value: 'VEO 3.1', label: 'Google AI Engine' },
  { value: '4K+', label: 'Video Quality' },
  { value: '∞', label: 'Multi-Queue Jobs' },
  { value: '<60s', label: 'Video Gen Time' },
];

/* ─── FILM STRIP animation ─── */
const FilmGrain = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.025] z-0">
    <div
      className="absolute inset-0"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
        animation: 'grain 0.4s steps(1) infinite',
      }}
    />
    <style>{`
      @keyframes grain {
        0%, 100% { transform: translate(0,0); }
        10% { transform: translate(-2%,-3%); }
        20% { transform: translate(4%,2%); }
        30% { transform: translate(-3%,4%); }
        40% { transform: translate(2%,-2%); }
        50% { transform: translate(-4%,3%); }
        60% { transform: translate(3%,-4%); }
        70% { transform: translate(-1%,2%); }
        80% { transform: translate(4%,-1%); }
        90% { transform: translate(-2%,4%); }
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
        rotateX.set(-y * 15);
        rotateY.set(x * 15);
      }}
      onMouseLeave={() => { rotateX.set(0); rotateY.set(0); }}
      style={{ rotateX: springX, rotateY: springY, transformStyle: 'preserve-3d' }}
      className="group cursor-pointer"
    >
      <div className="relative bg-[#0f0900] border border-amber-500/10 rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.5)] hover:shadow-[0_30px_80px_rgba(245,158,11,0.12)] hover:border-amber-500/25 transition-all duration-700">
        {/* Scanline */}
        <div className="absolute inset-0 z-20 pointer-events-none opacity-10"
          style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(245,158,11,0.04) 2px, rgba(245,158,11,0.04) 4px)' }} />

        <div className="aspect-[16/10] relative overflow-hidden">
          <img
            src={item.url}
            className="w-full h-full object-cover opacity-70 group-hover:opacity-95 group-hover:scale-105 transition-all duration-1000 saturate-[0.6] group-hover:saturate-100"
            alt={item.label}
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f0900] via-[#0f0900]/30 to-transparent" />

          {/* HUD overlay */}
          <div className="absolute top-3 left-3 flex items-center gap-2 z-20">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_6px_rgba(245,158,11,0.8)]" />
            <span className="text-[8px] font-mono font-bold text-amber-400/80 uppercase tracking-widest">{item.tag}</span>
          </div>
          <div className="absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="px-2 py-0.5 bg-amber-500/15 border border-amber-500/30 rounded text-[7px] font-mono text-amber-400">
              {item.model}
            </div>
          </div>

          {/* Play overlay */}
          <div className="absolute inset-0 flex items-center justify-center z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-14 h-14 rounded-full bg-amber-500/20 border border-amber-500/40 backdrop-blur-sm flex items-center justify-center">
              <Play size={20} className="text-amber-400 fill-amber-400/70 ml-1" />
            </div>
          </div>
        </div>

        <div className="p-4 relative z-20">
          <h4 className="text-sm font-bold text-white/90 leading-tight">{item.label}</h4>
          <div className="flex items-center justify-between mt-2">
            <span className="text-[9px] font-mono text-amber-500/50">Fibus Video Studio • {item.model}</span>
            <div className="flex gap-1">
              {[...Array(3)].map((_, i) => (
                <div key={i} className={`w-1 h-1 rounded-full ${i < 2 ? 'bg-amber-500/40' : 'bg-amber-500/60'}`} />
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
    <div className="bg-[#080500] min-h-screen text-white font-sans selection:bg-amber-500/30 overflow-x-hidden">

      {/* ═══ HERO ═══ */}
      <motion.section
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden"
      >
        <FilmGrain />

        {/* Background glow orbs */}
        <div className="absolute top-0 right-1/4 w-[700px] h-[700px] bg-amber-500/[0.05] rounded-full blur-[160px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-orange-600/[0.04] rounded-full blur-[120px] pointer-events-none" />

        {/* Horizontal scan lines */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            background: 'repeating-linear-gradient(0deg, transparent, transparent 80px, rgba(245,158,11,0.012) 80px, rgba(245,158,11,0.012) 81px)',
          }} />

        {/* Film frame corners */}
        {['top-8 left-8', 'top-8 right-8', 'bottom-8 left-8', 'bottom-8 right-8'].map((pos, i) => (
          <div key={i} className={`absolute ${pos} pointer-events-none`}>
            <div className="w-8 h-8 border-amber-500/20"
              style={{
                borderTopWidth: i < 2 ? '1px' : '0',
                borderBottomWidth: i >= 2 ? '1px' : '0',
                borderLeftWidth: i % 2 === 0 ? '1px' : '0',
                borderRightWidth: i % 2 === 1 ? '1px' : '0',
              }} />
          </div>
        ))}

        <div className="relative z-10 text-center max-w-5xl mx-auto space-y-8 pt-20">
          {/* Back link */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <Link to="/markets" className="inline-flex items-center gap-2 text-[11px] font-mono font-semibold text-amber-500/50 hover:text-amber-400 transition-colors mb-6">
              <ChevronLeft size={14} /> ← BACK_TO_MARKET
            </Link>
          </motion.div>

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-amber-500/[0.07] border border-amber-500/20 text-amber-400 text-[11px] font-mono font-bold uppercase tracking-wider"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
            POWERED BY GOOGLE VEO3 — DESKTOP AI STUDIO
          </motion.div>

          {/* H1 */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1, ease: [0.22, 1, 0.36, 1] as const }}
            className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.85]"
          >
            <span className="text-white/90">FIBUS</span>
            <br />
            <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-300 bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(245,158,11,0.35)]">
              VIDEO
            </span>
            <br />
            <span className="text-white/20 text-5xl md:text-6xl lg:text-7xl">STUDIO</span>
          </motion.h1>

          {/* Sub */}
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
            className="text-base md:text-lg text-white/35 font-mono max-w-2xl mx-auto leading-relaxed"
          >
            Tạo Video AI & Hình ảnh AI mạnh mẽ nhất.{' '}
            <span className="text-amber-400/60">Text-to-Video, Image-to-Video, AI Image — tất cả trong một app.</span>
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}
            className="flex flex-wrap items-center justify-center gap-4 pt-4"
          >
            <button
              onClick={handleOpen}
              id="fibus-cta-primary"
              className="group relative bg-amber-500 text-black px-10 py-5 rounded-xl font-black text-sm tracking-wide shadow-[0_0_40px_rgba(245,158,11,0.3)] hover:shadow-[0_0_70px_rgba(245,158,11,0.5)] hover:scale-[1.03] transition-all flex items-center gap-3 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative z-10 flex items-center gap-3">
                <Download size={18} />
                TẢI FIBUS VIDEO STUDIO
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
            <button
              onClick={handleOpen}
              id="fibus-cta-secondary"
              className="px-10 py-5 border border-amber-500/20 rounded-xl font-bold text-sm text-amber-400/60 hover:text-amber-400 hover:border-amber-500/40 hover:bg-amber-500/5 transition-all font-mono"
            >
              XEM DEMO ↓
            </button>
          </motion.div>

          {/* Tech badges */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
            className="flex flex-wrap items-center justify-center gap-6 pt-4 font-mono"
          >
            {['Google VEO 3.1', 'Banana Pro', 'Multi-Account', 'Multi-Queue', 'macOS + Windows'].map((badge, i) => (
              <span key={i} className="flex items-center gap-1.5 text-[10px] font-semibold text-white/25">
                <div className="w-1 h-1 rounded-full bg-amber-500/50" /> {badge}
              </span>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <div className="w-px h-12 bg-gradient-to-b from-transparent to-amber-500/30" />
          <span className="text-[8px] font-mono text-amber-500/40 uppercase tracking-widest">Scroll</span>
        </motion.div>
      </motion.section>

      {/* ═══ STATS BAR ═══ */}
      <section className="py-16 px-6 border-t border-amber-500/[0.06] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/[0.02] via-transparent to-amber-500/[0.02]" />
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10">
          {STATS.map((stat, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center space-y-2"
            >
              <div className="text-3xl lg:text-4xl font-black bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="text-[10px] font-mono text-white/25 uppercase tracking-wider">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══ SHOWCASE GALLERY ═══ */}
      <section id="showcase" className="py-32 px-6 lg:px-12 relative border-t border-amber-500/[0.06]">
        <div className="absolute inset-0 bg-gradient-to-b from-[#080500] via-[#0a0600] to-[#080500] pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center space-y-4 mb-20">
            <div className="inline-flex items-center gap-2 text-[10px] font-mono text-amber-500/50 uppercase tracking-widest">
              <Video size={12} /> SHOWCASE_GALLERY
            </div>
            <h2 className="text-4xl lg:text-6xl font-black tracking-tight">
              Tác phẩm <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">AI</span>
            </h2>
            <p className="text-sm text-white/30 font-mono max-w-md mx-auto">
              Khám phá những tác phẩm ấn tượng tạo bởi cộng đồng người dùng Fibus Video Studio.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" style={{ perspective: '1200px' }}>
            {SHOWCASE.map((item, i) => (
              <ShowcaseCard key={i} item={item} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section id="features" className="py-32 px-6 lg:px-12 relative border-t border-amber-500/[0.06]">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center space-y-4 mb-20">
            <div className="inline-flex items-center gap-2 text-[10px] font-mono text-amber-500/50 uppercase tracking-widest">
              <Cpu size={12} /> CORE_FEATURES
            </div>
            <h2 className="text-4xl lg:text-5xl font-black tracking-tight">
              Tính năng <span className="text-amber-400">nổi bật</span>
            </h2>
            <p className="text-sm text-white/30 font-mono max-w-lg mx-auto">
              Tích hợp toàn bộ công cụ AI sáng tạo từ Google vào một desktop app duy nhất.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.09, ease: [0.22, 1, 0.36, 1] as const }}
                className="group p-8 bg-[#0f0900] border border-amber-500/[0.07] rounded-2xl hover:border-amber-500/22 transition-all duration-500 relative overflow-hidden"
              >
                {/* Corner accents */}
                <div className="absolute top-0 left-0 w-6 h-px bg-amber-500/20" />
                <div className="absolute top-0 left-0 h-6 w-px bg-amber-500/20" />
                <div className="absolute bottom-0 right-0 w-6 h-px bg-amber-500/20" />
                <div className="absolute bottom-0 right-0 h-6 w-px bg-amber-500/20" />

                {/* Badge */}
                <div className="absolute top-4 right-4 px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded text-[7px] font-mono text-amber-400/70 uppercase">
                  {f.badge}
                </div>

                <div className="w-12 h-12 border border-amber-500/10 bg-amber-500/[0.05] flex items-center justify-center text-amber-500/40 group-hover:text-amber-400 group-hover:border-amber-500/30 transition-all rounded-xl mb-6">
                  {f.icon}
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-bold text-white/90">{f.title}</h4>
                    <span className="text-[8px] font-mono text-amber-500/40 uppercase">{f.stat}</span>
                  </div>
                  <p className="text-sm text-white/30 leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ WORKFLOW ═══ */}
      <section id="how-to-use" className="py-32 px-6 lg:px-12 border-t border-amber-500/[0.06] relative">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center space-y-4 mb-20">
            <div className="inline-flex items-center gap-2 text-[10px] font-mono text-amber-500/50 uppercase tracking-widest">
              <Zap size={12} /> QUICKSTART_GUIDE
            </div>
            <h2 className="text-4xl lg:text-5xl font-black tracking-tight">
              Bắt đầu trong <span className="text-amber-400">4 bước</span>
            </h2>
            <p className="text-sm text-white/30 font-mono max-w-md mx-auto">
              Từ tải app đến tạo video AI đầu tiên — quy trình đơn giản, nhanh chóng.
            </p>
          </motion.div>

          <div className="relative">
            {/* Connecting line */}
            <div className="absolute left-7 top-0 bottom-0 w-px bg-gradient-to-b from-amber-500/20 via-amber-500/10 to-transparent hidden md:block" />
            <div className="space-y-6">
              {WORKFLOW.map((s, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                  transition={{ delay: i * 0.12, ease: [0.22, 1, 0.36, 1] as const }}
                  className="flex gap-6 items-start group"
                >
                  <div className="shrink-0 w-14 h-14 rounded-xl bg-amber-500/[0.06] border border-amber-500/10 flex items-center justify-center text-amber-400/60 group-hover:text-amber-400 group-hover:border-amber-500/30 group-hover:bg-amber-500/10 transition-all relative z-10">
                    {s.icon}
                  </div>
                  <div className="flex-grow p-6 bg-[#0f0900] border border-amber-500/[0.05] rounded-xl group-hover:border-amber-500/15 transition-all">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-[9px] font-mono text-amber-500/50 uppercase">STEP_{s.step}</span>
                      <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/15 rounded text-[7px] font-mono text-amber-400/60">{s.badge}</span>
                      <div className="h-px flex-grow bg-amber-500/[0.05]" />
                    </div>
                    <h4 className="text-base font-bold text-white/90 mb-1">{s.title}</h4>
                    <p className="text-sm text-white/30">{s.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ PRICING ═══ */}
      <section id="pricing" className="py-32 px-6 lg:px-12 border-t border-amber-500/[0.06] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#080500] via-[#0d0700] to-[#080500] pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center space-y-4 mb-20">
            <div className="inline-flex items-center gap-2 text-[10px] font-mono text-amber-500/50 uppercase tracking-widest">
              <Shield size={12} /> PRICING_PLANS
            </div>
            <h2 className="text-4xl lg:text-5xl font-black tracking-tight">
              Chọn gói <span className="text-amber-400">phù hợp</span>
            </h2>
            <p className="text-sm text-white/30 font-mono max-w-md mx-auto">
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
                    ? 'bg-gradient-to-b from-amber-500/[0.08] to-[#0f0900] border-amber-500/30 shadow-[0_0_60px_rgba(245,158,11,0.08)]'
                    : 'bg-[#0f0900] border-amber-500/[0.07] hover:border-amber-500/20'
                }`}
              >
                {/* Corner accents */}
                <div className="absolute top-0 left-0 w-8 h-px bg-amber-500/30" />
                <div className="absolute top-0 left-0 h-8 w-px bg-amber-500/30" />
                <div className="absolute top-0 right-0 w-8 h-px bg-amber-500/30" />
                <div className="absolute top-0 right-0 h-8 w-px bg-amber-500/30" />

                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-amber-500 text-black text-[10px] font-black rounded-full uppercase tracking-wider">
                    {plan.badge}
                  </div>
                )}

                <h3 className="text-xl font-black text-white/90 mb-6">{plan.name}</h3>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feat, j) => (
                    <li key={j} className="flex items-start gap-3">
                      <CheckCircle2 size={14} className="text-amber-400 shrink-0 mt-0.5" />
                      <span className="text-sm text-white/50">{feat}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={handleOpen}
                  className={`w-full py-4 rounded-xl font-black text-sm tracking-wide transition-all ${
                    plan.highlight
                      ? 'bg-amber-500 text-black hover:bg-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.3)] hover:shadow-[0_0_50px_rgba(245,158,11,0.5)]'
                      : 'border border-amber-500/20 text-amber-400/70 hover:text-amber-400 hover:border-amber-500/40 hover:bg-amber-500/5'
                  }`}
                >
                  Xem giá & Đăng ký →
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ DOWNLOAD / CTA ═══ */}
      <section id="download" className="py-40 text-center relative overflow-hidden border-t border-amber-500/[0.06]">
        <FilmGrain />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080500] via-transparent to-[#080500] pointer-events-none z-[1]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-amber-500/[0.04] rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-3xl mx-auto space-y-10 relative z-10 px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="space-y-6">
            <div className="w-20 h-20 rounded-2xl bg-amber-500/[0.08] border border-amber-500/20 flex items-center justify-center mx-auto text-amber-400">
              <Video size={32} />
            </div>
            <h2 className="text-5xl md:text-7xl font-black tracking-tight leading-[0.9]">
              TẠO VIDEO AI
              <br />
              <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-300 bg-clip-text text-transparent">
                NGAY HÔM NAY
              </span>
            </h2>
            <p className="text-sm text-white/30 font-mono max-w-md mx-auto">
              Fibus Video Studio — công cụ tạo Video AI & Hình ảnh AI mạnh mẽ nhất. Powered by Google VEO3.
            </p>
          </motion.div>

          {/* Download buttons */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button
              onClick={handleOpen}
              id="fibus-download-main"
              className="group relative bg-amber-500 text-black px-14 py-6 rounded-xl text-sm font-black tracking-wider shadow-[0_0_60px_rgba(245,158,11,0.3)] hover:shadow-[0_0_100px_rgba(245,158,11,0.5)] hover:scale-[1.05] transition-all inline-flex items-center gap-3 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative z-10 flex items-center gap-3">
                <Download size={18} />
                TẢI FIBUS VIDEO STUDIO
                <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
              </span>
            </button>
          </motion.div>

          {/* Platform chips */}
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap items-center justify-center gap-3"
          >
            {[
              { label: 'Apple Silicon', sub: 'M1, M2, M3' },
              { label: 'Intel Mac', sub: 'x64' },
              { label: 'Windows', sub: '10 / 11' },
            ].map((p, i) => (
              <div key={i}
                onClick={handleOpen}
                className="cursor-pointer px-4 py-2 bg-amber-500/[0.06] border border-amber-500/15 rounded-lg hover:border-amber-500/30 hover:bg-amber-500/10 transition-all text-left"
              >
                <div className="text-xs font-bold text-white/70">{p.label}</div>
                <div className="text-[9px] font-mono text-amber-500/40">{p.sub}</div>
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

          {/* Social proof */}
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-center gap-2 pt-2">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map(i => <Star key={i} size={12} className="text-amber-500/50 fill-amber-500/50" />)}
            </div>
            <span className="text-[10px] font-mono text-white/20">1,000+ creators tin dùng • Được tạo bởi Skyverses</span>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default FibusVideoStudio;
