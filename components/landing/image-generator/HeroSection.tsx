import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { getExplorerUrl } from '../../../apis/config';
import { ChevronLeft, Sparkles, ArrowRight, Loader2, Image as ImageIcon, Cpu, Gauge, Ratio, Wand2 } from 'lucide-react';

interface HeroSectionProps { onStartStudio: () => void; }

export const HeroSection: React.FC<HeroSectionProps> = ({ onStartStudio }) => {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(getExplorerUrl('image', 1, 16));
        const j = await r.json();
        if (j.data && Array.isArray(j.data)) setImages(j.data.slice(0, 12));
      } catch { } finally { setLoading(false); }
    })();
  }, []);

  const MODEL_FAMILIES = [
    { name: 'Nano Banana Pro', tag: 'Google', hot: true },
    { name: 'Seedream 5', tag: 'ByteDance' },
    { name: 'Midjourney 7', tag: 'Midjourney' },
    { name: 'Kling 3.0 Omni', tag: 'Kuaishou' },
    { name: 'IMAGE O1', tag: 'Kling' },
    { name: 'Imagen 4.5', tag: 'Google' },
    { name: 'Z-Image', tag: 'Community' },
    { name: 'Dreamina 3.1', tag: 'ByteDance' },
  ];

  const SPECS = [
    { icon: <Cpu size={12} />, label: '22+ AI Models', sub: '10+ model families' },
    { icon: <Gauge size={12} />, label: 'Lên đến 12K', sub: '1K → Ultra HD 12K' },
    { icon: <Ratio size={12} />, label: '11 tỷ lệ', sub: '16:9 · 9:16 · 1:1 · 21:9 · 4:5...' },
    { icon: <Wand2 size={12} />, label: 'AI Upscale', sub: 'Nâng cấp ảnh chuyên nghiệp' },
  ];

  return (
    <section className="min-h-screen flex flex-col justify-center px-6 lg:px-12 py-16 relative overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-200px] right-[-200px] w-[800px] h-[800px] bg-rose-600/[0.04] dark:bg-rose-600/[0.06] rounded-full blur-[200px]" />
        <div className="absolute bottom-[-200px] left-[-200px] w-[600px] h-[600px] bg-fuchsia-600/[0.03] dark:bg-fuchsia-600/[0.04] rounded-full blur-[180px]" />
      </div>

      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center relative z-10">
        {/* LEFT */}
        <div className="lg:col-span-6 space-y-7">
          <Link to="/market" className="inline-flex items-center gap-1.5 text-[10px] font-medium uppercase text-slate-400 dark:text-[#555] hover:text-rose-500 dark:hover:text-rose-400 transition-colors tracking-wider">
            <ChevronLeft size={14} /> Trở lại
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-rose-500/[0.08] border border-rose-500/15 rounded-full text-rose-500 dark:text-rose-400 text-[10px] font-semibold uppercase tracking-wider">
              <Sparkles size={12} /> 22+ AI Image Models
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold leading-[0.9] tracking-tight">
              Image <br /><span className="text-rose-500 dark:text-rose-400">Studio</span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-[#666] font-medium leading-relaxed max-w-md">
              Tạo hình ảnh AI chất lượng cao với hơn 22 model hàng đầu: Nano Banana Pro, Seedream 5, Midjourney 7, Kling 3.0 Omni — hỗ trợ lên tới 12K, 11 tỷ lệ, Single & Batch mode.
            </p>
          </motion.div>

          {/* Model family pills */}
          <div className="space-y-2">
            <p className="text-[9px] font-semibold uppercase text-slate-400 dark:text-[#444] tracking-wider">Hỗ trợ Model Families</p>
            <div className="flex flex-wrap gap-1.5">
              {MODEL_FAMILIES.map(m => (
                <div key={m.name} className={`px-2.5 py-1 rounded-lg text-[9px] font-medium border transition-all ${m.hot ? 'bg-rose-500/10 border-rose-500/25 text-rose-500 dark:text-rose-400' : 'bg-black/[0.02] dark:bg-white/[0.02] border-black/[0.06] dark:border-white/[0.04] text-slate-500 dark:text-[#666]'}`}>
                  {m.name} <span className="text-slate-400 dark:text-[#444] ml-1">· {m.tag}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Specs grid */}
          <div className="grid grid-cols-2 gap-2">
            {SPECS.map(s => (
              <div key={s.label} className="p-3 bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.04] rounded-xl flex items-start gap-2.5 group hover:border-rose-500/20 transition-all">
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

        {/* RIGHT - image masonry grid */}
        <div className="lg:col-span-6 h-[550px] relative">
          <div className="absolute inset-0 overflow-hidden mask-fade-v">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center gap-3 opacity-20">
                <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2.5 animate-scroll-v">
                {[...images, ...images].map((item, i) => (
                  <div key={`${item._id}-${i}`} className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-black border border-black/[0.06] dark:border-white/[0.04] group">
                    <img
                      src={item.thumbnailUrl || item.mediaUrl}
                      alt={item.title || 'AI Generated'}
                      className="w-full h-full object-cover opacity-70 dark:opacity-50 group-hover:opacity-100 dark:group-hover:opacity-80 group-hover:scale-105 transition-all duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 dark:from-black/70 via-transparent to-transparent" />
                    <div className="absolute bottom-2 left-2 right-2">
                      <p className="text-[8px] font-semibold text-white/80 dark:text-white/70 line-clamp-2">{item.title}</p>
                      <div className="w-4 h-0.5 bg-rose-500 mt-1 group-hover:w-full transition-all duration-500" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
            <div className="w-16 h-16 rounded-full border border-black/10 dark:border-white/10 flex items-center justify-center bg-white/60 dark:bg-white/5 backdrop-blur-xl animate-pulse">
              <ImageIcon size={24} className="text-rose-500 dark:text-rose-400" />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .mask-fade-v { mask-image: linear-gradient(to bottom, transparent, black 12%, black 88%, transparent); -webkit-mask-image: linear-gradient(to bottom, transparent, black 12%, black 88%, transparent); }
        @keyframes sv { 0% { transform: translateY(0); } 100% { transform: translateY(-50%); } }
        .animate-scroll-v { animation: sv 40s linear infinite; }
        .animate-scroll-v:hover { animation-play-state: paused; }
      `}</style>
    </section>
  );
};
