
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ChevronLeft, Sparkles, ArrowRight, Zap, Check,
  Upload, Cpu, Gauge, Maximize2, Layers,
  Image as ImageIcon, ScanLine, Palette, ShieldCheck,
  MonitorUp, Printer, Camera, LayoutGrid
} from 'lucide-react';
import UpscaleWorkspace from '../../components/UpscaleWorkspace';
import { usePageMeta } from '../../hooks/usePageMeta';

const ImageUpscaleAI = () => {
  const [isStudioOpen, setIsStudioOpen] = useState(false);

  usePageMeta({
    title: 'AI Image Upscale | Skyverses',
    description: 'Nâng cấp ảnh lên 4K-8K-12K với công nghệ AI Generative Upscale. Tái tạo chi tiết thông minh, không vỡ hình.',
    keywords: 'image upscale, AI enhance, super resolution, nâng cấp ảnh',
    canonical: '/product/image-upscale-ai'
  });

  if (isStudioOpen) {
    return (
      <div className="fixed inset-0 z-[500] bg-white dark:bg-[#0a0a0c]">
        <UpscaleWorkspace onClose={() => setIsStudioOpen(false)} />
      </div>
    );
  }

  const UPSCALE_MODES = [
    {
      id: 'standard',
      title: 'Standard',
      subtitle: 'Nhanh & Tiết kiệm',
      desc: 'Nâng cấp nhanh với chi phí thấp nhất. Phù hợp cho web, social media và preview.',
      features: ['Tốc độ xử lý cao', 'Chi phí thấp nhất', 'Phù hợp ảnh web & social'],
      icon: <Zap size={20} />,
      iconBg: 'bg-brand-blue/10 text-brand-blue',
    },
    {
      id: 'pro',
      title: 'Professional',
      subtitle: 'Cân bằng hoàn hảo',
      desc: 'Tái tạo chi tiết chuyên sâu bằng thuật toán Nano Pro. Lý tưởng cho marketing & thiết kế.',
      features: ['Thuật toán Nano Pro', 'Texture reconstruction', 'Dành cho marketing & design'],
      icon: <Cpu size={20} />,
      iconBg: 'bg-purple-500/10 text-purple-500',
    },
    {
      id: 'real',
      title: 'Generative Real',
      subtitle: 'Chân thực tuyệt đối',
      desc: 'AI tái tạo da, tóc, lỗ chân lông ở mức chân thực nhất. Dành cho chân dung & in ấn cao cấp.',
      features: ['Da, tóc chân thực', 'Xóa cảm giác "AI giả"', 'In ấn & chân dung cao cấp'],
      icon: <Sparkles size={20} />,
      iconBg: 'bg-emerald-500/10 text-emerald-500',
    },
  ];

  const USE_CASES = [
    {
      icon: <Camera size={20} />,
      title: 'Chân dung & Thời trang',
      desc: 'Tái tạo chi tiết da, tóc và biểu cảm tự nhiên cho ảnh portrait chuyên nghiệp.',
    },
    {
      icon: <LayoutGrid size={20} />,
      title: 'Sản phẩm & E-commerce',
      desc: 'Nâng cấp ảnh catalog, banner sản phẩm lên chất lượng studio chuyên nghiệp.',
    },
    {
      icon: <Printer size={20} />,
      title: 'In ấn khổ lớn',
      desc: 'Poster, billboard, backdrop sự kiện cần độ phân giải 8K-12K sắc nét tuyệt đối.',
    },
    {
      icon: <MonitorUp size={20} />,
      title: 'Nội dung số & Media',
      desc: 'Tối ưu hình ảnh cho LED display, presentation và nội dung digital marketing.',
    },
  ];

  const SPECS = [
    { icon: <Gauge size={12} />, label: 'Lên đến 12K', sub: 'Từ SD → Ultra HD 12K' },
    { icon: <Cpu size={12} />, label: 'H100 GPU Cluster', sub: 'Xử lý trong vài giây' },
    { icon: <Layers size={12} />, label: '3 chế độ', sub: 'Standard · Pro · Real' },
    { icon: <ScanLine size={12} />, label: 'Generative AI', sub: 'Tái tạo chi tiết thông minh' },
  ];

  const HIGHLIGHTS = [
    {
      icon: <Zap size={22} />,
      iconBg: 'bg-brand-blue/10 text-brand-blue',
      title: 'Xử lý nhanh & ổn định',
      desc: 'Cụm GPU H100 cho tốc độ render vượt trội. Upscale ảnh 4K chỉ trong vài giây.',
    },
    {
      icon: <ScanLine size={22} />,
      iconBg: 'bg-purple-500/10 text-purple-500',
      title: 'Tái tạo chi tiết thông minh',
      desc: 'Không chỉ phóng to — AI thực sự hiểu cấu trúc và "vẽ lại" các chi tiết bị mất.',
    },
    {
      icon: <Palette size={22} />,
      iconBg: 'bg-emerald-500/10 text-emerald-500',
      title: 'Màu sắc & ánh sáng tự nhiên',
      desc: 'Đảm bảo sự hài hòa về tone màu và ánh sáng sau quá trình nâng cấp.',
    },
    {
      icon: <ShieldCheck size={22} />,
      iconBg: 'bg-amber-500/10 text-amber-500',
      title: 'Bảo toàn bố cục gốc',
      desc: 'Cam kết không méo hình, không thay đổi composition hay tỉ lệ ảnh gốc.',
    },
  ];

  return (
    <div className="bg-white dark:bg-[#0a0a0c] min-h-screen text-slate-900 dark:text-white font-sans overflow-x-hidden pt-16 transition-colors duration-300">

      {/* ═══ HERO ═══ */}
      <section className="min-h-screen flex flex-col justify-center px-6 lg:px-12 py-16 relative overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-200px] right-[-200px] w-[800px] h-[800px] bg-emerald-500/[0.04] dark:bg-emerald-500/[0.06] rounded-full blur-[80px]" />
          <div className="absolute bottom-[-200px] left-[-200px] w-[600px] h-[600px] bg-brand-blue/[0.03] dark:bg-brand-blue/[0.04] rounded-full blur-[60px]" />
        </div>

        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center relative z-10">
          {/* LEFT */}
          <div className="lg:col-span-6 space-y-7">
            <Link to="/" className="inline-flex items-center gap-1.5 text-[10px] font-medium uppercase text-slate-400 dark:text-[#555] hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors tracking-wider">
              <ChevronLeft size={14} /> Trở lại
            </Link>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/[0.08] border border-emerald-500/15 rounded-full text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold uppercase tracking-wider">
                <Maximize2 size={12} /> Generative AI Upscale
              </div>
              <h1 className="text-5xl lg:text-7xl font-bold leading-[0.9] tracking-tight">
                Image <br /><span className="text-emerald-500 dark:text-emerald-400">Upscale</span>
              </h1>
              <p className="text-sm text-slate-500 dark:text-[#666] font-medium leading-relaxed max-w-md">
                Nâng cấp ảnh lên 4K-8K-12K với công nghệ AI Generative. Không chỉ phóng to — AI tái tạo từng pixel, giữ nguyên nét đẹp tự nhiên và chi tiết sắc nét nhất.
              </p>
            </motion.div>

            {/* Specs grid */}
            <div className="grid grid-cols-2 gap-2">
              {SPECS.map(s => (
                <div key={s.label} className="p-3 bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.04] rounded-xl flex items-start gap-2.5 group hover:border-emerald-500/20 transition-all">
                  <div className="shrink-0 w-6 h-6 rounded-md bg-emerald-500/10 flex items-center justify-center text-emerald-500 dark:text-emerald-400">{s.icon}</div>
                  <div>
                    <p className="text-[10px] font-semibold text-slate-700 dark:text-white/80">{s.label}</p>
                    <p className="text-[8px] font-medium text-slate-400 dark:text-[#444]">{s.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => setIsStudioOpen(true)}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-10 py-4 rounded-xl text-[11px] font-semibold uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-3 group"
              >
                Mở Upscale Studio <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {/* RIGHT — Before/After comparison */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-6"
          >
            <div className="aspect-[16/10] bg-slate-50 dark:bg-[#0c0c0e] border border-black/[0.06] dark:border-white/[0.06] rounded-2xl p-3 overflow-hidden relative">
              <div className="relative w-full h-full rounded-xl overflow-hidden bg-white dark:bg-black">
                <div className="absolute inset-0 grid grid-cols-2">
                  <img
                    src="https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&q=30&w=800"
                    className="w-full h-full object-cover opacity-50 blur-[1px]"
                    alt="Low resolution"
                  />
                  <img
                    src="https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&q=100&w=1600"
                    className="w-full h-full object-cover"
                    alt="Upscaled"
                  />
                </div>
                {/* Divider */}
                <div className="absolute inset-y-0 left-1/2 w-0.5 bg-emerald-400 z-20 shadow-[0_0_12px_rgba(52,211,153,0.5)]" />
                {/* Labels */}
                <div className="absolute top-4 left-4 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[8px] font-semibold text-white/80 uppercase tracking-wider border border-white/10 z-30">
                  Ảnh gốc · SD
                </div>
                <div className="absolute top-4 right-4 px-2.5 py-1 bg-emerald-500 rounded-lg text-[8px] font-bold text-white uppercase tracking-wider z-30">
                  Upscaled · 12K
                </div>
                {/* Bottom info */}
                <div className="absolute bottom-4 left-4 z-30">
                  <p className="text-lg font-bold text-white drop-shadow-lg">Crystal Clarity</p>
                  <p className="text-[9px] font-medium text-emerald-300/80">Generative detail reconstruction</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ INTRO ═══ */}
      <section className="py-20 md:py-28 border-y border-black/[0.04] dark:border-white/[0.04] bg-slate-50/50 dark:bg-white/[0.01]">
        <div className="max-w-3xl mx-auto px-6 lg:px-12 text-center space-y-5">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/[0.08] border border-emerald-500/15 rounded-full mb-5">
              <Sparkles size={12} className="text-emerald-500" />
              <span className="text-[9px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Công nghệ thế hệ mới</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight leading-[1.1] mb-4">
              Tái tạo chi tiết bằng <span className="text-emerald-500 dark:text-emerald-400">Generative AI</span>
            </h2>
            <p className="text-sm text-slate-500 dark:text-[#666] leading-relaxed max-w-2xl mx-auto">
              Generative Upscale không chỉ phóng to — AI hiểu cấu trúc hình ảnh và tái tạo các pixel mới hoàn toàn.
              Kết quả sắc nét hơn, tự nhiên hơn, giữ nguyên bố cục gốc kể cả ở độ phân giải rất cao.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ═══ UPSCALE MODES ═══ */}
      <section className="py-20 md:py-28 px-6 lg:px-12">
        <div className="max-w-[1200px] mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-500/[0.08] border border-purple-500/15 rounded-full mb-5">
              <Layers size={12} className="text-purple-500" />
              <span className="text-[9px] font-semibold uppercase tracking-wider text-purple-500">3 chế độ xử lý</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight leading-[1.1]">
              Chọn chế độ phù hợp <span className="text-purple-500 dark:text-purple-400">nhu cầu của bạn</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
            {UPSCALE_MODES.map((mode, idx) => (
              <motion.div
                key={mode.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -5, transition: { duration: 0.3 } }}
                className="p-7 md:p-8 rounded-2xl bg-white dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/[0.05] hover:border-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-500 group"
              >
                <div className="space-y-5">
                  <div className={`w-12 h-12 rounded-xl ${mode.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    {mode.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-1">{mode.title}</h3>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-500 dark:text-emerald-400 mb-3">{mode.subtitle}</p>
                    <p className="text-xs text-slate-500 dark:text-[#666] leading-relaxed">{mode.desc}</p>
                  </div>
                  <ul className="space-y-2.5 pt-4 border-t border-black/[0.04] dark:border-white/[0.04]">
                    {mode.features.map(f => (
                      <li key={f} className="flex items-center gap-2.5 text-[11px] font-medium text-slate-600 dark:text-[#888]">
                        <Check size={14} className="text-emerald-500 shrink-0" strokeWidth={3} />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ RESOLUTION SPECS ═══ */}
      <section className="py-20 md:py-28 px-6 lg:px-12 border-y border-black/[0.04] dark:border-white/[0.04] bg-slate-50/50 dark:bg-white/[0.01]">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left text */}
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-blue/[0.08] border border-brand-blue/15 rounded-full mb-5">
                <Maximize2 size={12} className="text-brand-blue" />
                <span className="text-[9px] font-semibold uppercase tracking-wider text-brand-blue">Độ phân giải</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight leading-[1.1] mb-4">
                Hỗ trợ từ 2K đến <span className="text-brand-blue">12K</span>
              </h2>
              <p className="text-sm text-slate-500 dark:text-[#666] leading-relaxed">
                Chọn mức phân giải phù hợp — từ 2K cho web & social đến 12K cho in ấn billboard và LED display.
              </p>
            </div>

            <div className="space-y-5">
              {[
                'Tự động tối ưu chi tiết theo mức phân giải đầu ra',
                'Giữ nguyên bố cục gốc — cam kết không méo hình',
                'Xử lý mượt ngay cả với file kích thước lớn',
                'Phù hợp cho cả màn hình LED và in ấn billboard'
              ].map(item => (
                <div key={item} className="flex gap-3 items-start group">
                  <div className="w-5 h-5 rounded-full bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center text-brand-blue shrink-0 mt-0.5">
                    <Check size={12} strokeWidth={3} />
                  </div>
                  <p className="text-sm text-slate-600 dark:text-[#888] font-medium leading-relaxed group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{item}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right - quality meter */}
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div className="bg-white dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.06] p-8 rounded-2xl space-y-8">
              <div className="flex justify-between items-center border-b border-black/[0.04] dark:border-white/[0.04] pb-5">
                <span className="text-[10px] font-semibold uppercase text-slate-400 dark:text-[#555] tracking-wider">Quality Inspector</span>
                <ScanLine size={16} className="text-emerald-500" />
              </div>
              <div className="space-y-6">
                {[
                  { label: 'Pixel Density', value: 99 },
                  { label: 'Texture Reconstruction', value: 97 },
                  { label: 'Color Accuracy', value: 98 }
                ].map(item => (
                  <div key={item.label} className="space-y-2.5">
                    <div className="flex justify-between text-[10px] font-semibold text-slate-500 dark:text-[#666]">
                      <span>{item.label}</span>
                      <span className="text-emerald-500">{item.value}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${item.value}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.5, delay: 0.2 }}
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-4 flex items-center gap-3 border-t border-black/[0.04] dark:border-white/[0.04]">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <MonitorUp size={20} />
                </div>
                <p className="text-[10px] font-semibold text-slate-400 dark:text-[#555] uppercase tracking-wider">Ready for mastering</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ USE CASES ═══ */}
      <section className="py-20 md:py-28 px-6 lg:px-12">
        <div className="max-w-[1200px] mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500/[0.08] border border-amber-500/15 rounded-full mb-5">
              <ImageIcon size={12} className="text-amber-500" />
              <span className="text-[9px] font-semibold uppercase tracking-wider text-amber-500">Ứng dụng</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight leading-[1.1]">
              Phù hợp <span className="text-amber-500 dark:text-amber-400">mọi nhu cầu</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {USE_CASES.map((item, idx) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -5, transition: { duration: 0.3 } }}
                className="p-6 rounded-2xl bg-white dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/[0.05] hover:border-amber-500/20 hover:shadow-lg hover:shadow-amber-500/5 transition-all duration-500 group"
              >
                <div className="space-y-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <h4 className="text-sm font-bold">{item.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-[#666] leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HIGHLIGHTS ═══ */}
      <section className="py-20 md:py-28 px-6 lg:px-12 border-y border-black/[0.04] dark:border-white/[0.04] bg-slate-50/50 dark:bg-white/[0.01]">
        <div className="max-w-[1000px] mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight leading-[1.1]">
              Ưu điểm <span className="text-emerald-500 dark:text-emerald-400">nổi bật</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {HIGHLIGHTS.map((item, idx) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="flex gap-5 items-start p-6 rounded-2xl bg-white dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/[0.05] hover:border-emerald-500/15 transition-all group"
              >
                <div className={`w-12 h-12 rounded-xl ${item.iconBg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                  {item.icon}
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-sm font-bold">{item.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-[#666] leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="px-6 lg:px-16 py-24 md:py-32">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="space-y-6">
            <h2 className="text-3xl lg:text-5xl font-bold tracking-tight leading-[1.1]">
              Sẵn sàng nâng cấp <span className="text-emerald-500 dark:text-emerald-400">hình ảnh?</span>
            </h2>
            <p className="text-sm text-slate-500 dark:text-[#555] max-w-lg mx-auto leading-relaxed">
              3 chế độ · Lên đến 12K · Generative AI · Auto Refund · Cloud History
            </p>
            <button
              onClick={() => setIsStudioOpen(true)}
              className="px-10 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold text-sm shadow-lg shadow-emerald-500/20 hover:brightness-110 active:scale-[0.98] transition-all inline-flex items-center gap-3"
            >
              <Upload size={18} />
              Mở Upscale Studio
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default ImageUpscaleAI;
