
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Box, Cpu, Layers, Package, Monitor, ArrowRight,
  Palette, ShieldCheck, Landmark, ChevronLeft,
  CheckCircle2, Star, Upload, Eye, Download, Sparkles
} from 'lucide-react';
import { useArt3DGenerator } from '../hooks/useArt3DGenerator';
import Art3DWorkspace from '../components/Art3DWorkspace';
import { usePageMeta } from '../hooks/usePageMeta';

/* ─── DATA ─── */
const FEATURES = [
  { icon: <Layers />, title: 'Structural Gen', desc: 'Tạo lưới cấu trúc chịu lực cho kiến trúc & nội thất.' },
  { icon: <Palette />, title: 'PBR Photoreal', desc: 'Tự động tạo vật liệu xây dựng chuẩn PBR chuyên nghiệp.' },
  { icon: <Package />, title: 'CAD Export', desc: 'Xuất tệp sang định dạng chuẩn ngành (.STEP, .OBJ, .GLTF).' },
  { icon: <Cpu />, title: 'BIM Nodes', desc: 'Tích hợp dữ liệu mô hình thông tin công trình xây dựng.' },
  { icon: <Monitor />, title: 'Ambient Render', desc: 'Phối cảnh ánh sáng tự nhiên chân thực cho trình bày dự án.' },
  { icon: <ShieldCheck />, title: 'VPC Sandbox', desc: 'Bảo mật bản quyền thiết kế trong môi trường riêng ảo.' },
];

const WORKFLOW = [
  { step: '01', title: 'Mô tả ý tưởng', desc: 'Nhập prompt mô tả không gian, phong cách kiến trúc.', icon: <Upload size={20} /> },
  { step: '02', title: 'AI xử lý mesh', desc: 'Engine tạo cấu trúc lưới 3D từ mô tả.', icon: <Cpu size={20} /> },
  { step: '03', title: 'Preview & tinh chỉnh', desc: 'Xem trước, điều chỉnh vật liệu và ánh sáng.', icon: <Eye size={20} /> },
  { step: '04', title: 'Export & triển khai', desc: 'Xuất file chuẩn ngành, sẵn sàng sản xuất.', icon: <Download size={20} /> },
];

const USE_CASES = [
  { emoji: '🏛️', title: 'Kiến trúc', desc: 'Phối cảnh công trình từ bản vẽ' },
  { emoji: '🛋️', title: 'Nội thất', desc: 'Thiết kế không gian sống AI' },
  { emoji: '🏙️', title: 'Đô thị', desc: 'Quy hoạch khu đô thị 3D' },
  { emoji: '🎮', title: 'Game Assets', desc: 'Tạo môi trường cho game' },
  { emoji: '📐', title: 'CAD/BIM', desc: 'Mô hình kỹ thuật chính xác' },
  { emoji: '🎬', title: 'VFX & Film', desc: 'Set phim ảo từ AI' },
];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 } as const,
  whileInView: { opacity: 1, y: 0 } as const,
  viewport: { once: true } as const,
  transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const },
});

const SpatialArchitectPage: React.FC = () => {
  usePageMeta({
    title: '3D Spatial Architect — Kiến tạo không gian AI | Skyverses',
    description: 'Kiến tạo không gian 3D cấp độ công nghiệp bằng AI. Chuyển đổi mô tả thành mô hình lưới hoàn hảo.',
    keywords: '3D architect, spatial AI, CAD generation, Skyverses',
    canonical: '/product/3d-spatial-architect'
  });

  const logic = useArt3DGenerator();

  if (logic.isStudioOpen) {
    return (
      <div className="fixed inset-0 z-[600] bg-[#0a0a0c] animate-in fade-in duration-500">
        <Art3DWorkspace onClose={() => logic.setIsStudioOpen(false)} logic={logic} />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#050508] min-h-screen text-slate-900 dark:text-white font-sans selection:bg-emerald-500/30 transition-colors duration-500">

      {/* ═══ HERO ═══ */}
      <section className="relative pt-32 pb-24 px-6 lg:px-12 min-h-[90vh] flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-emerald-500/8 via-teal-500/5 to-transparent rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-5xl mx-auto w-full z-10 space-y-12 text-center">
          <motion.div {...fadeUp(0)}>
            <Link to="/market" className="inline-flex items-center gap-2 text-[11px] font-semibold text-slate-400 dark:text-slate-500 hover:text-emerald-500 transition-colors mb-6">
              <ChevronLeft size={14} /> Quay lại
            </Link>
          </motion.div>

          <motion.div {...fadeUp(0)}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold uppercase tracking-[0.15em]">
            <Landmark size={14} /> CAD-Grade AI Architecture
          </motion.div>

          <motion.h1 {...fadeUp(0.1)} className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.95]">
            Kiến tạo không gian
            <br />
            <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
              3D bằng AI
            </span>
          </motion.h1>

          <motion.p {...fadeUp(0.2)} className="text-lg md:text-xl text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
            Chuyển đổi mô tả và bản vẽ thành mô hình lưới cấp công nghiệp — phối cảnh kiến trúc & nội thất chuyên nghiệp.
          </motion.p>

          <motion.div {...fadeUp(0.3)} className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button onClick={() => logic.setIsStudioOpen(true)}
              className="group bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-10 py-5 rounded-2xl font-bold text-sm shadow-[0_20px_50px_rgba(16,185,129,0.25)] hover:shadow-[0_25px_60px_rgba(16,185,129,0.35)] hover:scale-[1.02] transition-all flex items-center gap-3">
              <Box size={18} />
              Khởi chạy Forge Studio
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <a href="#features" className="px-10 py-5 border border-slate-200 dark:border-white/10 rounded-2xl font-bold text-sm text-slate-600 dark:text-white/70 hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
              Tìm hiểu thêm
            </a>
          </motion.div>

          <motion.div {...fadeUp(0.4)} className="flex flex-wrap items-center justify-center gap-6 pt-6">
            {['CAD Export', 'PBR Vật liệu', 'BIM Ready', 'Mesh AI'].map((badge, i) => (
              <span key={i} className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                <CheckCircle2 size={13} className="text-emerald-500" /> {badge}
              </span>
            ))}
          </motion.div>
        </div>

        {/* Visual Preview */}
        <motion.div {...fadeUp(0.5)} className="relative max-w-5xl mx-auto mt-16 w-full border border-slate-200 dark:border-white/[0.06] bg-white dark:bg-[#0c0c10] rounded-2xl shadow-[0_40px_100px_rgba(0,0,0,0.08)] dark:shadow-[0_40px_100px_rgba(0,0,0,0.4)] overflow-hidden">
          <div className="h-10 border-b border-slate-100 dark:border-white/[0.04] bg-slate-50/80 dark:bg-white/[0.02] flex items-center px-4 gap-2">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/60" />
            </div>
            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 ml-3 uppercase tracking-wider">Forge Studio — 3D Engine</span>
          </div>
          <div className="aspect-[16/7] bg-gradient-to-br from-slate-100 via-emerald-50/20 to-slate-50 dark:from-[#0a0a0e] dark:via-emerald-950/10 dark:to-[#0c0c12] flex items-center justify-center relative group cursor-pointer"
            onClick={() => logic.setIsStudioOpen(true)}>
            <div className="text-center space-y-4">
              <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-500 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all duration-500">
                <Box size={32} />
              </div>
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400 group-hover:text-emerald-500 transition-colors">Click để mở Forge Studio</p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">Mô tả → AI Mesh → Export</p>
            </div>
            <div className="absolute top-6 right-6 px-3 py-1.5 bg-white/90 dark:bg-black/60 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-lg flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">Engine Ready</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section id="features" className="py-32 border-t border-slate-100 dark:border-white/[0.03] bg-slate-50/50 dark:bg-black/20 transition-colors">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <motion.div {...fadeUp()} className="text-center space-y-4 mb-20">
            <h2 className="text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
              Khả năng <span className="text-emerald-500">vượt trội</span>
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium max-w-lg mx-auto">
              Engine AI tạo mô hình 3D cấp công nghiệp cho mọi ngành.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <motion.div key={i} {...fadeUp(i * 0.08)}
                className="p-8 bg-white dark:bg-white/[0.015] border border-slate-200/80 dark:border-white/[0.04] rounded-2xl space-y-5 group hover:border-emerald-500/20 hover:shadow-lg dark:hover:shadow-emerald-500/5 transition-all duration-500">
                <div className="w-12 h-12 border border-slate-200 dark:border-white/[0.06] bg-slate-50 dark:bg-white/[0.02] flex items-center justify-center text-slate-400 dark:text-slate-500 group-hover:text-emerald-500 group-hover:border-emerald-500/30 transition-all rounded-xl">
                  {React.cloneElement(f.icon as React.ReactElement<any>, { size: 22 })}
                </div>
                <div className="space-y-2">
                  <h4 className="text-lg font-bold text-slate-800 dark:text-white/90">{f.title}</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ WORKFLOW ═══ */}
      <section className="py-32 border-t border-slate-100 dark:border-white/[0.03] transition-colors">
        <div className="max-w-5xl mx-auto px-6 lg:px-12">
          <motion.div {...fadeUp()} className="text-center space-y-4 mb-20">
            <h2 className="text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
              Quy trình <span className="text-emerald-500">4 bước</span>
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Từ ý tưởng đến mô hình 3D trong vài phút.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {WORKFLOW.map((s, i) => (
              <motion.div key={i} {...fadeUp(i * 0.1)}
                className="flex gap-5 p-6 bg-white dark:bg-white/[0.015] border border-slate-200/80 dark:border-white/[0.04] rounded-2xl group hover:border-emerald-500/20 transition-all">
                <div className="shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                  {s.icon}
                </div>
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Bước {s.step}</span>
                  <h4 className="text-base font-bold text-slate-800 dark:text-white/90">{s.title}</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ USE CASES ═══ */}
      <section className="py-32 border-t border-slate-100 dark:border-white/[0.03] bg-slate-50/50 dark:bg-black/20 transition-colors">
        <div className="max-w-6xl mx-auto px-6 lg:px-12">
          <motion.div {...fadeUp()} className="text-center space-y-4 mb-16">
            <h2 className="text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
              Ứng dụng <span className="text-emerald-500">đa ngành</span>
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Từ kiến trúc đến game — AI 3D cho mọi lĩnh vực.</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {USE_CASES.map((uc, i) => (
              <motion.div key={i} {...fadeUp(i * 0.06)}
                className="p-6 bg-white dark:bg-white/[0.015] border border-slate-200/80 dark:border-white/[0.04] rounded-2xl text-center group hover:border-emerald-500/20 hover:shadow-md transition-all">
                <span className="text-3xl">{uc.emoji}</span>
                <h4 className="text-sm font-bold text-slate-800 dark:text-white/90 mt-3">{uc.title}</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{uc.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-40 text-center relative overflow-hidden border-t border-slate-100 dark:border-white/[0.03] bg-white dark:bg-[#050508] transition-colors">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-emerald-500/5 to-teal-500/5 rounded-full blur-[150px] pointer-events-none" />
        <div className="max-w-3xl mx-auto space-y-10 relative z-10 px-6">
          <motion.div {...fadeUp()} className="space-y-6">
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[0.95] text-slate-900 dark:text-white">
              Kiến tạo
              <br />
              <span className="text-emerald-500">không gian 3D</span>
            </h2>
            <p className="text-base text-slate-500 dark:text-slate-400 font-medium max-w-xl mx-auto">
              Từ ý tưởng đến mô hình 3D cấp công nghiệp — chỉ bằng AI.
            </p>
          </motion.div>
          <motion.div {...fadeUp(0.15)} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={() => logic.setIsStudioOpen(true)}
              className="group bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-14 py-6 rounded-2xl text-sm font-bold shadow-[0_25px_60px_rgba(16,185,129,0.3)] hover:shadow-[0_30px_70px_rgba(16,185,129,0.4)] hover:scale-[1.03] transition-all inline-flex items-center gap-3">
              <Box size={18} />
              Vào Forge Studio
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
          <motion.div {...fadeUp(0.25)} className="flex items-center justify-center gap-2 pt-4">
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map(i => <Star key={i} size={14} className="text-amber-400 fill-amber-400" />)}
            </div>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Được tin dùng bởi 500+ kiến trúc sư</span>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default SpatialArchitectPage;
