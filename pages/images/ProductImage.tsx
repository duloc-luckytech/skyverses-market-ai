
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles, ArrowRight, Wand2, Palette, Eraser, Scan,
  Layers, Upload, Zap, CheckCircle2, Image as ImageIcon,
  Cpu, PenTool, Repeat, Star
} from 'lucide-react';
import ProductImageWorkspace from '../../components/ProductImageWorkspace';
import { usePageMeta } from '../../hooks/usePageMeta';

const FEATURES = [
  { icon: <Wand2 />, title: 'AI Generation', desc: 'Chuyển prompt văn bản thành hình ảnh 8K chất lượng cao với nhiều model AI tiên tiến.' },
  { icon: <Sparkles />, title: 'Image Enhancement', desc: 'Tăng cường, làm sắc nét và nâng cấp độ phân giải ảnh cũ mà không bị artifact.' },
  { icon: <Eraser />, title: 'Background Magic', desc: 'Tách nền chính xác và tổng hợp nền mới bằng AI neural network.' },
  { icon: <Palette />, title: 'Style Transfer', desc: 'Áp dụng phong cách nghệ thuật, ánh sáng và bố cục từ ảnh mẫu vào tác phẩm.' },
  { icon: <Scan />, title: 'Neural Retouch', desc: 'Chỉnh sửa da, kết cấu tự động cho ảnh thương mại chuyên nghiệp.' },
  { icon: <Layers />, title: 'Batch Processing', desc: 'Xử lý hàng loạt nhiều ảnh cùng lúc với cùng một pipeline AI.' },
];

const WORKFLOW_STEPS = [
  { step: '01', title: 'Upload hoặc tạo mới', desc: 'Tải ảnh lên hoặc nhập prompt để AI tạo ảnh mới từ đầu.', icon: <Upload size={20} /> },
  { step: '02', title: 'Chọn AI Model', desc: 'Chọn model phù hợp: Imagen, Banana, Midjourney và nhiều engine khác.', icon: <Cpu size={20} /> },
  { step: '03', title: 'Chỉnh sửa thông minh', desc: 'Dùng prompt để mô tả thay đổi — AI sẽ thực hiện chính xác theo ý bạn.', icon: <PenTool size={20} /> },
  { step: '04', title: 'Xuất & sử dụng', desc: 'Tải xuống ảnh chất lượng cao, sẵn sàng cho marketing và sản xuất.', icon: <Zap size={20} /> },
];

const USE_CASES = [
  { emoji: '📦', title: 'E-commerce', desc: 'Ảnh sản phẩm chuyên nghiệp cho shop online' },
  { emoji: '📱', title: 'Social Media', desc: 'Content ấn tượng cho mạng xã hội' },
  { emoji: '🎨', title: 'Creative Design', desc: 'Thiết kế sáng tạo không giới hạn' },
  { emoji: '🏠', title: 'Bất động sản', desc: 'Ảnh nội thất, kiến trúc chuyên nghiệp' },
  { emoji: '👗', title: 'Thời trang', desc: 'Lookbook, catalog thời trang AI' },
  { emoji: '🎮', title: 'Game & NFT', desc: 'Character art, concept art chất lượng cao' },
];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const },
});

const ProductImage = () => {
  usePageMeta({
    title: 'AI Image Studio — Chỉnh sửa & Tạo ảnh AI | Skyverses',
    description: 'Chỉnh sửa và tạo ảnh chuyên nghiệp bằng AI. Hỗ trợ nhiều model: Imagen, Banana, Midjourney. Xóa nền, chuyển phong cách, nâng cấp ảnh.',
    keywords: 'AI image editor, chỉnh sửa ảnh AI, product photography, Skyverses',
    canonical: '/product/product-image'
  });

  const [isStudioOpen, setIsStudioOpen] = useState(false);

  return (
    <div className="bg-white dark:bg-[#050508] min-h-screen text-slate-900 dark:text-white font-sans selection:bg-cyan-500/30 transition-colors duration-500">

      <ProductImageWorkspace isOpen={isStudioOpen} onClose={() => setIsStudioOpen(false)} />

      {/* ═══ HERO ═══ */}
      <section className="relative pt-32 pb-24 px-6 lg:px-12 min-h-[90vh] flex flex-col items-center justify-center overflow-hidden">
        {/* Ambient light */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-cyan-500/8 via-blue-500/5 to-transparent rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-5xl mx-auto w-full z-10 space-y-12 text-center">
          <motion.div {...fadeUp(0)}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-[11px] font-bold uppercase tracking-[0.15em]"
          >
            <Sparkles size={14} /> AI-Powered Image Studio
          </motion.div>

          <motion.h1 {...fadeUp(0.1)}
            className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.95]"
          >
            Chỉnh sửa ảnh
            <br />
            <span className="bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 bg-clip-text text-transparent">
              bằng AI thông minh
            </span>
          </motion.h1>

          <motion.p {...fadeUp(0.2)}
            className="text-lg md:text-xl text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed"
          >
            Upload ảnh, mô tả thay đổi bằng ngôn ngữ tự nhiên — AI sẽ biến ý tưởng thành hiện thực.
            Hỗ trợ đa model, đa phong cách.
          </motion.p>

          <motion.div {...fadeUp(0.3)} className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => setIsStudioOpen(true)}
              className="group bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-10 py-5 rounded-2xl font-bold text-sm shadow-[0_20px_50px_rgba(6,182,212,0.25)] hover:shadow-[0_25px_60px_rgba(6,182,212,0.35)] hover:scale-[1.02] transition-all flex items-center gap-3"
            >
              <ImageIcon size={18} />
              Mở AI Image Studio
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <a href="#features"
              className="px-10 py-5 border border-slate-200 dark:border-white/10 rounded-2xl font-bold text-sm text-slate-600 dark:text-white/70 hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
            >
              Tìm hiểu thêm
            </a>
          </motion.div>

          {/* Trust badges */}
          <motion.div {...fadeUp(0.4)} className="flex flex-wrap items-center justify-center gap-6 pt-6">
            {['Multi-model AI', 'Prompt-based editing', 'Export 4K/8K', 'Batch processing'].map((badge, i) => (
              <span key={i} className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                <CheckCircle2 size={13} className="text-emerald-500" /> {badge}
              </span>
            ))}
          </motion.div>
        </div>

        {/* Mock editor preview */}
        <motion.div {...fadeUp(0.5)}
          className="relative max-w-5xl mx-auto mt-16 w-full border border-slate-200 dark:border-white/[0.06] bg-white dark:bg-[#0c0c10] rounded-2xl shadow-[0_40px_100px_rgba(0,0,0,0.08)] dark:shadow-[0_40px_100px_rgba(0,0,0,0.4)] overflow-hidden"
        >
          <div className="h-10 border-b border-slate-100 dark:border-white/[0.04] bg-slate-50/80 dark:bg-white/[0.02] flex items-center px-4 gap-2">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/60" />
            </div>
            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 ml-3 uppercase tracking-wider">AI Image Studio — Editor</span>
          </div>
          <div className="aspect-[16/7] bg-gradient-to-br from-slate-100 via-slate-50 to-cyan-50/30 dark:from-[#0a0a0e] dark:via-[#0c0c12] dark:to-cyan-950/10 flex items-center justify-center relative group cursor-pointer"
            onClick={() => setIsStudioOpen(true)}
          >
            <div className="text-center space-y-4">
              <div className="w-20 h-20 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto text-cyan-500 group-hover:scale-110 group-hover:bg-cyan-500/20 transition-all duration-500">
                <Wand2 size={32} />
              </div>
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400 group-hover:text-cyan-500 transition-colors">Click để mở Studio</p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">Upload ảnh → Nhập prompt → AI chỉnh sửa</p>
            </div>
            {/* Floating indicators */}
            <div className="absolute top-6 right-6 px-3 py-1.5 bg-white/90 dark:bg-black/60 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-lg flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">AI Ready</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section id="features" className="py-32 border-t border-slate-100 dark:border-white/[0.03] bg-slate-50/50 dark:bg-black/20 transition-colors">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <motion.div {...fadeUp()} className="text-center space-y-4 mb-20">
            <h2 className="text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
              Công cụ <span className="text-cyan-500">chuyên nghiệp</span>
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium max-w-lg mx-auto">
              Tất cả những gì bạn cần để tạo và chỉnh sửa ảnh chuyên nghiệp — trong một studio duy nhất.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <motion.div key={i} {...fadeUp(i * 0.08)}
                className="p-8 bg-white dark:bg-white/[0.015] border border-slate-200/80 dark:border-white/[0.04] rounded-2xl space-y-5 group hover:border-cyan-500/20 hover:shadow-lg dark:hover:shadow-cyan-500/5 transition-all duration-500"
              >
                <div className="w-12 h-12 border border-slate-200 dark:border-white/[0.06] bg-slate-50 dark:bg-white/[0.02] flex items-center justify-center text-slate-400 dark:text-slate-500 group-hover:text-cyan-500 group-hover:border-cyan-500/30 transition-all rounded-xl">
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
              Quy trình <span className="text-cyan-500">đơn giản</span>
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              Chỉ 4 bước để có ảnh chuyên nghiệp
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {WORKFLOW_STEPS.map((s, i) => (
              <motion.div key={i} {...fadeUp(i * 0.1)}
                className="flex gap-5 p-6 bg-white dark:bg-white/[0.015] border border-slate-200/80 dark:border-white/[0.04] rounded-2xl group hover:border-cyan-500/20 transition-all"
              >
                <div className="shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-500 group-hover:scale-110 transition-transform">
                  {s.icon}
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest">Bước {s.step}</span>
                  </div>
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
              Ứng dụng <span className="text-cyan-500">đa ngành</span>
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              Từ e-commerce đến creative design — AI Image Studio phục vụ mọi nhu cầu.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {USE_CASES.map((uc, i) => (
              <motion.div key={i} {...fadeUp(i * 0.06)}
                className="p-6 bg-white dark:bg-white/[0.015] border border-slate-200/80 dark:border-white/[0.04] rounded-2xl text-center group hover:border-cyan-500/20 hover:shadow-md transition-all"
              >
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
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-cyan-500/5 to-blue-500/5 rounded-full blur-[150px] pointer-events-none" />
        <div className="max-w-3xl mx-auto space-y-10 relative z-10 px-6">
          <motion.div {...fadeUp()} className="space-y-6">
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[0.95] text-slate-900 dark:text-white">
              Bắt đầu <br />
              <span className="text-cyan-500">sáng tạo ngay</span>
            </h2>
            <p className="text-base text-slate-500 dark:text-slate-400 font-medium max-w-xl mx-auto">
              Không cần kỹ năng Photoshop. Chỉ cần mô tả — AI sẽ làm phần còn lại.
            </p>
          </motion.div>
          <motion.button {...fadeUp(0.15)}
            onClick={() => setIsStudioOpen(true)}
            className="group bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-14 py-6 rounded-2xl text-sm font-bold shadow-[0_25px_60px_rgba(6,182,212,0.3)] hover:shadow-[0_30px_70px_rgba(6,182,212,0.4)] hover:scale-[1.03] transition-all inline-flex items-center gap-3"
          >
            <Wand2 size={18} />
            Mở AI Image Studio
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </motion.button>

          {/* Rating */}
          <motion.div {...fadeUp(0.25)} className="flex items-center justify-center gap-2 pt-4">
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map(i => <Star key={i} size={14} className="text-amber-400 fill-amber-400" />)}
            </div>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Được sử dụng bởi 2,000+ creators</span>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default ProductImage;
