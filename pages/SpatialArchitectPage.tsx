
import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Box, Cpu, Layers, Package, Monitor, ArrowRight,
  Palette, ShieldCheck, Landmark, ChevronLeft,
  CheckCircle2, Star, Upload, Eye, Download,
  Hexagon, RotateCcw, Maximize2, Zap, Sparkles
} from 'lucide-react';
import { useArt3DGenerator } from '../hooks/useArt3DGenerator';
import Art3DWorkspace from '../components/Art3DWorkspace';
import { usePageMeta } from '../hooks/usePageMeta';

/* ─── LIVE 3D MODELS (Sketchfab embeds — verified public models) ─── */
const LIVE_3D_MODELS = [
  { id: '70ab4f4164b54afbad87f174f8b285c1', label: 'Duplex Architecture', tag: 'Architecture', vertices: '156K' },
  { id: '66dcdec2a0c44d1d9cc2ee12a4abc186', label: 'Guard Tower Structure', tag: 'Brutalist', vertices: '89K' },
  { id: 'b1701e74c9fe402f8620b7bf20459916', label: 'Interior Environment', tag: 'Interior', vertices: '210K' },
  { id: '6a93eca9479d4eacb012e9f2c9a909c7', label: 'Sci-Fi Supply Port', tag: 'Sci-Fi', vertices: '340K' },
];

/* ─── 3D SHOWCASE IMAGES ─── */
const SHOWCASE_3D = [
  { url: 'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?auto=format&fit=crop&q=80&w=600', label: 'Brutalist Tower', tag: 'Architecture' },
  { url: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?auto=format&fit=crop&q=80&w=600', label: 'Interior Space', tag: 'Interior' },
  { url: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&q=80&w=600', label: 'Glass Facade', tag: 'Exterior' },
  { url: 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?auto=format&fit=crop&q=80&w=600', label: 'Modular Design', tag: 'Modular' },
  { url: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&q=80&w=600', label: 'Urban Planning', tag: 'Urban' },
  { url: 'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&q=80&w=600', label: 'Concept Render', tag: 'VFX' },
];

const FEATURES = [
  { icon: <Layers />, title: 'Structural Gen', desc: 'Tạo lưới cấu trúc chịu lực cho kiến trúc & nội thất.', stat: '2.4M vertices' },
  { icon: <Palette />, title: 'PBR Photoreal', desc: 'Vật liệu xây dựng chuẩn PBR chuyên nghiệp.', stat: '4K textures' },
  { icon: <Package />, title: 'CAD Export', desc: 'Xuất .STEP, .OBJ, .GLTF chuẩn ngành.', stat: '12 formats' },
  { icon: <Cpu />, title: 'BIM Nodes', desc: 'Tích hợp dữ liệu mô hình thông tin công trình.', stat: 'IFC ready' },
  { icon: <Monitor />, title: 'Ambient Render', desc: 'Phối cảnh ánh sáng tự nhiên chân thực.', stat: 'HDRI maps' },
  { icon: <ShieldCheck />, title: 'VPC Sandbox', desc: 'Bảo mật bản quyền trong mạng riêng ảo.', stat: 'Encrypted' },
];

const WORKFLOW = [
  { step: '01', title: 'Mô tả', desc: 'Nhập prompt mô tả không gian, phong cách kiến trúc.', icon: <Upload size={20} /> },
  { step: '02', title: 'Mesh AI', desc: 'Engine tạo cấu trúc lưới 3D từ mô tả.', icon: <Cpu size={20} /> },
  { step: '03', title: 'Preview', desc: 'Xem trước, tinh chỉnh vật liệu và ánh sáng.', icon: <Eye size={20} /> },
  { step: '04', title: 'Export', desc: 'Xuất file chuẩn ngành, sẵn sàng sản xuất.', icon: <Download size={20} /> },
];

/* ─── ANIMATED WIREFRAME GRID ─── */
const WireframeGrid = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute inset-0" style={{ perspective: '1200px' }}>
      <div className="absolute inset-0 origin-bottom" style={{
        transform: 'rotateX(60deg) translateZ(-100px)',
        backgroundImage: `
          linear-gradient(rgba(16,185,129,0.08) 1px, transparent 1px),
          linear-gradient(90deg, rgba(16,185,129,0.08) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
        animation: 'gridScroll 20s linear infinite',
      }} />
    </div>
    <style>{`
      @keyframes gridScroll {
        0% { background-position: 0 0; }
        100% { background-position: 0 60px; }
      }
    `}</style>
  </div>
);

/* ─── FLOATING CUBE ─── */
const FloatingCube = ({ size = 120, delay = 0, x = '50%', y = '50%' }: { size?: number; delay?: number; x?: string; y?: string }) => (
  <motion.div
    initial={{ opacity: 0, rotateX: 0, rotateY: 0 }}
    animate={{ opacity: 1, rotateX: 360, rotateY: 360 }}
    transition={{ duration: 30, delay, repeat: Infinity, ease: 'linear' }}
    className="absolute pointer-events-none"
    style={{ left: x, top: y, width: size, height: size, perspective: '400px', transformStyle: 'preserve-3d' }}
  >
    {[
      { transform: `translateZ(${size/2}px)` },
      { transform: `translateZ(-${size/2}px) rotateY(180deg)` },
      { transform: `translateX(-${size/2}px) rotateY(-90deg)` },
      { transform: `translateX(${size/2}px) rotateY(90deg)` },
      { transform: `translateY(-${size/2}px) rotateX(90deg)` },
      { transform: `translateY(${size/2}px) rotateX(-90deg)` },
    ].map((face, i) => (
      <div key={i} className="absolute inset-0 border border-emerald-500/10 bg-emerald-500/[0.02]"
        style={{ ...face, backfaceVisibility: 'hidden' }} />
    ))}
  </motion.div>
);

/* ─── HOLOGRAM CARD ─── */
const HoloCard3D: React.FC<{ item: typeof SHOWCASE_3D[0]; index: number }> = ({ item, index }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springX = useSpring(rotateX, { stiffness: 200, damping: 20 });
  const springY = useSpring(rotateY, { stiffness: 200, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    rotateX.set(-y * 20);
    rotateY.set(x * 20);
  };

  const handleMouseLeave = () => { rotateX.set(0); rotateY.set(0); };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 40, rotateX: -10 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] as const }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX: springX, rotateY: springY, transformStyle: 'preserve-3d' }}
      className="group cursor-pointer"
    >
      <div className="relative bg-[#0a0f0a] border border-emerald-500/10 rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.5)] hover:shadow-[0_30px_80px_rgba(16,185,129,0.15)] hover:border-emerald-500/30 transition-all duration-700">
        {/* Scanline overlay */}
        <div className="absolute inset-0 z-30 pointer-events-none opacity-20"
          style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(16,185,129,0.03) 2px, rgba(16,185,129,0.03) 4px)' }} />

        <div className="aspect-[4/3] relative overflow-hidden">
          <img src={item.url} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000 saturate-50 group-hover:saturate-100" alt={item.label} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f0a] via-[#0a0f0a]/30 to-transparent" />

          {/* HUD overlay */}
          <div className="absolute top-3 left-3 flex items-center gap-2 z-20">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
            <span className="text-[8px] font-mono font-bold text-emerald-400/80 uppercase tracking-widest">{item.tag}</span>
          </div>
          <div className="absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/30 rounded text-[7px] font-mono text-emerald-400">
              MESH_READY
            </div>
          </div>

          {/* Wireframe grid overlay on hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-500 z-10"
            style={{
              backgroundImage: 'linear-gradient(rgba(16,185,129,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.3) 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }} />
        </div>

        <div className="p-4 relative z-20">
          <h4 className="text-sm font-bold text-white/90 font-mono">{item.label}</h4>
          <div className="flex items-center justify-between mt-2">
            <span className="text-[9px] font-mono text-emerald-500/60">v4.2.0 • 2.4M tri</span>
            <div className="flex gap-1">
              <div className="w-1 h-1 rounded-full bg-emerald-500/40" />
              <div className="w-1 h-1 rounded-full bg-emerald-500/40" />
              <div className="w-1 h-1 rounded-full bg-emerald-500/60" />
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
const SpatialArchitectPage: React.FC = () => {
  usePageMeta({
    title: '3D Spatial Architect — Kiến tạo không gian AI | Skyverses',
    description: 'Kiến tạo không gian 3D cấp độ công nghiệp bằng AI.',
    keywords: '3D architect, spatial AI, CAD generation, Skyverses',
    canonical: '/product/3d-spatial-architect'
  });

  const logic = useArt3DGenerator();
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.95]);

  if (logic.isStudioOpen) {
    return (
      <div className="fixed inset-0 z-[600] bg-[#0a0a0c] animate-in fade-in duration-500">
        <Art3DWorkspace onClose={() => logic.setIsStudioOpen(false)} logic={logic} />
      </div>
    );
  }

  return (
    <div className="bg-[#060806] min-h-screen text-white font-sans selection:bg-emerald-500/30 overflow-x-hidden">

      {/* ═══ HERO — IMMERSIVE 3D ═══ */}
      <motion.section style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
        <WireframeGrid />

        {/* Floating elements */}
        <FloatingCube size={80} delay={0} x="10%" y="20%" />
        <FloatingCube size={50} delay={5} x="85%" y="30%" />
        <FloatingCube size={35} delay={10} x="75%" y="70%" />

        {/* Glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-500/[0.04] rounded-full blur-[150px] animate-pulse pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-cyan-500/[0.03] rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 text-center max-w-5xl mx-auto space-y-8 pt-20">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <Link to="/market" className="inline-flex items-center gap-2 text-[11px] font-mono font-semibold text-emerald-500/60 hover:text-emerald-400 transition-colors mb-8">
              <ChevronLeft size={14} /> ← BACK_TO_MARKET
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-emerald-500/[0.08] border border-emerald-500/20 text-emerald-400 text-[11px] font-mono font-bold uppercase tracking-wider">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            CAD-GRADE AI ARCHITECTURE
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 1, ease: [0.22, 1, 0.36, 1] as const }}
            className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.85]">
            <span className="text-white/90">SPATIAL</span>
            <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(16,185,129,0.3)]">
              ARCHITECT
            </span>
          </motion.h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
            className="text-base md:text-lg text-white/40 font-mono max-w-2xl mx-auto leading-relaxed">
            Kiến tạo không gian 3D cấp công nghiệp. Chuyển đổi mô tả thành mesh cấu trúc hoàn hảo
            <span className="text-emerald-400/60"> — trong vài phút.</span>
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}
            className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button onClick={() => logic.setIsStudioOpen(true)}
              className="group relative bg-emerald-500 text-black px-10 py-5 rounded-xl font-black text-sm tracking-wide shadow-[0_0_40px_rgba(16,185,129,0.3)] hover:shadow-[0_0_60px_rgba(16,185,129,0.5)] hover:scale-[1.03] transition-all flex items-center gap-3 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative z-10 flex items-center gap-3">
                <Box size={18} />
                KHỞI CHẠY FORGE
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
            <a href="#showcase"
              className="px-10 py-5 border border-emerald-500/20 rounded-xl font-bold text-sm text-emerald-400/60 hover:text-emerald-400 hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all font-mono">
              XEM 3D SHOWCASE ↓
            </a>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
            className="flex flex-wrap items-center justify-center gap-6 pt-6 font-mono">
            {['CAD Export', 'PBR Materials', 'BIM Ready', '2.4M Vertices'].map((badge, i) => (
              <span key={i} className="flex items-center gap-1.5 text-[10px] font-semibold text-white/25">
                <div className="w-1 h-1 rounded-full bg-emerald-500/50" /> {badge}
              </span>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <div className="w-px h-12 bg-gradient-to-b from-transparent to-emerald-500/30" />
          <span className="text-[8px] font-mono text-emerald-500/40 uppercase tracking-widest">Scroll</span>
        </motion.div>
      </motion.section>

      {/* ═══ LIVE 3D INTERACTIVE ═══ */}
      <section className="py-32 px-6 lg:px-12 relative border-t border-emerald-500/[0.06]">
        <div className="absolute inset-0 bg-gradient-to-b from-[#060806] via-[#080a08] to-[#060806] pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center space-y-4 mb-16">
            <div className="inline-flex items-center gap-2 text-[10px] font-mono text-emerald-500/50 uppercase tracking-widest">
              <Box size={12} className="animate-spin" style={{ animationDuration: '8s' }} /> INTERACTIVE_3D_VIEWER
            </div>
            <h2 className="text-4xl lg:text-6xl font-black tracking-tight">
              Live 3D <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Models</span>
            </h2>
            <p className="text-sm text-white/30 font-mono max-w-lg mx-auto">
              Xoay, zoom, khám phá trực tiếp các mô hình 3D. Kéo chuột để xoay.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {LIVE_3D_MODELS.map((model, i) => (
              <motion.div key={model.id}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.15, ease: [0.22, 1, 0.36, 1] as const }}
                className="group relative bg-[#0a0f0a] border border-emerald-500/[0.08] rounded-2xl overflow-hidden hover:border-emerald-500/25 transition-all duration-700">
                {/* HUD corner accents */}
                <div className="absolute top-0 left-0 w-8 h-px bg-emerald-500/30 z-20" />
                <div className="absolute top-0 left-0 h-8 w-px bg-emerald-500/30 z-20" />
                <div className="absolute top-0 right-0 w-8 h-px bg-emerald-500/30 z-20" />
                <div className="absolute top-0 right-0 h-8 w-px bg-emerald-500/30 z-20" />

                {/* Sketchfab Iframe */}
                <div className="aspect-[16/10] relative">
                  <iframe
                    title={model.label}
                    src={`https://sketchfab.com/models/${model.id}/embed?autostart=1&ui_theme=dark&ui_infos=0&ui_controls=1&ui_stop=0&transparent=1`}
                    className="w-full h-full border-0"
                    allow="autoplay; fullscreen; xr-spatial-tracking"
                    allowFullScreen
                  />
                  {/* Top HUD */}
                  <div className="absolute top-3 left-3 flex items-center gap-2 z-20 pointer-events-none">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
                    <span className="text-[8px] font-mono font-bold text-emerald-400/70 uppercase tracking-widest">{model.tag}</span>
                  </div>
                  <div className="absolute top-3 right-3 z-20 pointer-events-none">
                    <div className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-[7px] font-mono text-emerald-400/70">
                      LIVE_3D
                    </div>
                  </div>
                </div>

                {/* Footer info */}
                <div className="px-5 py-4 border-t border-emerald-500/[0.06] flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-bold text-white/90 font-mono">{model.label}</h4>
                    <span className="text-[9px] font-mono text-emerald-500/40">{model.vertices} vertices • interactive</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[8px] font-mono text-white/20">
                    <RotateCcw size={10} /> Drag to rotate
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 3D IMAGE SHOWCASE ═══ */}
      <section id="showcase" className="py-32 px-6 lg:px-12 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-[#060806] via-[#080a08] to-[#060806] pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center space-y-4 mb-20">
            <div className="inline-flex items-center gap-2 text-[10px] font-mono text-emerald-500/50 uppercase tracking-widest">
              <Hexagon size={12} /> RENDER_GALLERY_v4
            </div>
            <h2 className="text-4xl lg:text-6xl font-black tracking-tight">
              AI <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Renders</span>
            </h2>
            <p className="text-sm text-white/30 font-mono max-w-md mx-auto">
              Kết quả phối cảnh từ hệ thống AI Mesh Engine.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" style={{ perspective: '1200px' }}>
            {SHOWCASE_3D.map((item, i) => (
              <HoloCard3D key={i} item={item} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURES — WIREFRAME CARDS ═══ */}
      <section className="py-32 px-6 lg:px-12 relative border-t border-emerald-500/[0.06]">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center space-y-4 mb-20">
            <h2 className="text-4xl lg:text-5xl font-black tracking-tight">
              Engine <span className="text-emerald-400">Capabilities</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.1, ease: [0.22, 1, 0.36, 1] as const }}
                className="group p-8 bg-[#0a0f0a] border border-emerald-500/[0.06] rounded-2xl hover:border-emerald-500/20 transition-all duration-500 relative overflow-hidden">
                {/* Corner accents */}
                <div className="absolute top-0 left-0 w-6 h-px bg-emerald-500/20" />
                <div className="absolute top-0 left-0 h-6 w-px bg-emerald-500/20" />
                <div className="absolute bottom-0 right-0 w-6 h-px bg-emerald-500/20" />
                <div className="absolute bottom-0 right-0 h-6 w-px bg-emerald-500/20" />

                <div className="w-12 h-12 border border-emerald-500/10 bg-emerald-500/[0.04] flex items-center justify-center text-emerald-500/40 group-hover:text-emerald-400 group-hover:border-emerald-500/30 transition-all rounded-xl mb-6">
                  {React.cloneElement(f.icon as React.ReactElement<any>, { size: 22 })}
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-bold text-white/90">{f.title}</h4>
                    <span className="text-[8px] font-mono text-emerald-500/40 uppercase">{f.stat}</span>
                  </div>
                  <p className="text-sm text-white/30 leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ WORKFLOW — PIPELINE ═══ */}
      <section className="py-32 px-6 lg:px-12 border-t border-emerald-500/[0.06] relative">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center space-y-4 mb-20">
            <div className="inline-flex items-center gap-2 text-[10px] font-mono text-emerald-500/50 uppercase tracking-widest">
              <RotateCcw size={12} /> PIPELINE_FLOW
            </div>
            <h2 className="text-4xl lg:text-5xl font-black tracking-tight">
              Từ prompt đến <span className="text-emerald-400">mesh 3D</span>
            </h2>
          </motion.div>

          <div className="relative">
            {/* Connecting line */}
            <div className="absolute left-7 top-0 bottom-0 w-px bg-gradient-to-b from-emerald-500/20 via-emerald-500/10 to-transparent hidden md:block" />

            <div className="space-y-6">
              {WORKFLOW.map((s, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                  transition={{ delay: i * 0.15, ease: [0.22, 1, 0.36, 1] as const }}
                  className="flex gap-6 items-start group">
                  <div className="shrink-0 w-14 h-14 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/10 flex items-center justify-center text-emerald-400/60 group-hover:text-emerald-400 group-hover:border-emerald-500/30 group-hover:bg-emerald-500/10 transition-all relative z-10">
                    {s.icon}
                  </div>
                  <div className="flex-grow p-6 bg-[#0a0f0a] border border-emerald-500/[0.04] rounded-xl group-hover:border-emerald-500/15 transition-all">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-[9px] font-mono text-emerald-500/50 uppercase">STEP_{s.step}</span>
                      <div className="h-px flex-grow bg-emerald-500/[0.06]" />
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

      {/* ═══ STATS BAR ═══ */}
      <section className="py-20 px-6 border-t border-emerald-500/[0.06] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/[0.02] via-transparent to-emerald-500/[0.02]" />
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10">
          {[
            { value: '2.4M', label: 'Max Vertices' },
            { value: '12+', label: 'Export Formats' },
            { value: '4K', label: 'PBR Textures' },
            { value: '<60s', label: 'Avg Gen Time' },
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center space-y-2">
              <div className="text-3xl lg:text-4xl font-black bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">{stat.value}</div>
              <div className="text-[10px] font-mono text-white/25 uppercase tracking-wider">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══ CTA — FORGE ═══ */}
      <section className="py-40 text-center relative overflow-hidden border-t border-emerald-500/[0.06]">
        <WireframeGrid />
        <div className="absolute inset-0 bg-gradient-to-t from-[#060806] via-transparent to-[#060806] pointer-events-none z-[1]" />

        <div className="max-w-3xl mx-auto space-y-10 relative z-10 px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="space-y-6">
            <div className="w-20 h-20 rounded-2xl bg-emerald-500/[0.08] border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400">
              <Box size={32} />
            </div>
            <h2 className="text-5xl md:text-7xl font-black tracking-tight leading-[0.9]">
              FORGE THE
              <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">SPATIAL</span>
            </h2>
            <p className="text-sm text-white/30 font-mono max-w-md mx-auto">
              Từ ý tưởng đến mô hình 3D cấp công nghiệp — chỉ bằng AI.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay: 0.2 }}>
            <button onClick={() => logic.setIsStudioOpen(true)}
              className="group relative bg-emerald-500 text-black px-16 py-6 rounded-xl text-sm font-black tracking-wider shadow-[0_0_60px_rgba(16,185,129,0.3)] hover:shadow-[0_0_100px_rgba(16,185,129,0.5)] hover:scale-[1.05] transition-all inline-flex items-center gap-3 overflow-hidden mx-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative z-10 flex items-center gap-3">
                <Sparkles size={18} />
                VÀO FORGE STUDIO
                <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
              </span>
            </button>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-center gap-2 pt-4">
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map(i => <Star key={i} size={12} className="text-emerald-500/40 fill-emerald-500/40" />)}
            </div>
            <span className="text-[10px] font-mono text-white/20">500+ kiến trúc sư tin dùng</span>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default SpatialArchitectPage;
