import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { getExplorerUrl } from '../../../apis/config';
import { ChevronLeft, Sparkles, ArrowRight, Loader2, Play, Video, Cpu, Gauge, Ratio, Volume2 } from 'lucide-react';

interface HeroSectionProps { onStartStudio: () => void; }

export const HeroSection: React.FC<HeroSectionProps> = ({ onStartStudio }) => {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(getExplorerUrl('video', 1, 15));
        const j = await r.json();
        if (j.data && Array.isArray(j.data)) setVideos(j.data.slice(0, 8));
      } catch { } finally { setLoading(false); }
    })();
  }, []);

  const MODEL_FAMILIES = [
    { name: 'VEO 3.1', tag: 'Google', hot: true },
    { name: 'Kling 3.0', tag: 'Kuaishou' },
    { name: 'Sora 2', tag: 'OpenAI' },
    { name: 'Hailuo 2.3', tag: 'Minimax' },
    { name: 'Seedance', tag: 'ByteDance' },
    { name: 'Grok', tag: 'xAI' },
    { name: 'WAN 2.5', tag: 'Alibaba' },
    { name: 'V-Fuse', tag: 'Community' },
  ];

  const SPECS = [
    { icon: <Cpu size={12} />, label: '30+ AI Models', sub: '10 model families' },
    { icon: <Gauge size={12} />, label: 'Lên đến 4K', sub: '480p → 4K resolution' },
    { icon: <Ratio size={12} />, label: '6+ tỷ lệ', sub: '16:9, 9:16, 1:1, 21:9...' },
    { icon: <Volume2 size={12} />, label: 'Audio Sync', sub: 'LipSync & Sound FX' },
  ];

  return (
    <section className="min-h-screen flex flex-col justify-center px-6 lg:px-12 py-16 relative overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-200px] right-[-200px] w-[800px] h-[800px] bg-indigo-600/[0.04] dark:bg-indigo-600/[0.08] rounded-full blur-[200px]" />
        <div className="absolute bottom-[-200px] left-[-200px] w-[600px] h-[600px] bg-violet-600/[0.03] dark:bg-violet-600/[0.05] rounded-full blur-[180px]" />
      </div>

      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center relative z-10">
        {/* LEFT */}
        <div className="lg:col-span-6 space-y-7">
          <Link to="/market" className="inline-flex items-center gap-1.5 text-[10px] font-medium uppercase text-slate-400 dark:text-[#555] hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors tracking-wider">
            <ChevronLeft size={14} /> Trở lại
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-500/[0.08] border border-indigo-500/15 rounded-full text-indigo-500 dark:text-indigo-400 text-[10px] font-semibold uppercase tracking-wider">
              <Sparkles size={12} /> 30+ AI Video Models
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold leading-[0.9] tracking-tight">
              Video <br /><span className="text-indigo-500 dark:text-indigo-400">Studio</span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-[#666] font-medium leading-relaxed max-w-md">
              Tạo video AI với hơn 30 model hàng đầu: VEO 3.1, Kling 3.0, Sora 2, Hailuo, Seedance — tất cả trong một workspace. Hỗ trợ Text-to-Video, Image-to-Video, LipSync, Motion Control.
            </p>
          </motion.div>

          {/* Model family pills */}
          <div className="space-y-2">
            <p className="text-[9px] font-semibold uppercase text-slate-400 dark:text-[#444] tracking-wider">Hỗ trợ Model Families</p>
            <div className="flex flex-wrap gap-1.5">
              {MODEL_FAMILIES.map(m => (
                <div key={m.name} className={`px-2.5 py-1 rounded-lg text-[9px] font-medium border transition-all ${m.hot ? 'bg-indigo-500/10 border-indigo-500/25 text-indigo-500 dark:text-indigo-400' : 'bg-black/[0.02] dark:bg-white/[0.02] border-black/[0.06] dark:border-white/[0.04] text-slate-500 dark:text-[#666]'}`}>
                  {m.name} <span className="text-slate-400 dark:text-[#444] ml-1">· {m.tag}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Specs grid */}
          <div className="grid grid-cols-2 gap-2">
            {SPECS.map(s => (
              <div key={s.label} className="p-3 bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.04] rounded-xl flex items-start gap-2.5 group hover:border-indigo-500/20 transition-all">
                <div className="shrink-0 w-6 h-6 rounded-md bg-indigo-500/10 flex items-center justify-center text-indigo-500 dark:text-indigo-400">{s.icon}</div>
                <div>
                  <p className="text-[10px] font-semibold text-slate-700 dark:text-white/80">{s.label}</p>
                  <p className="text-[8px] font-medium text-slate-400 dark:text-[#444]">{s.sub}</p>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={onStartStudio}
            className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-10 py-4 rounded-xl text-[11px] font-semibold uppercase tracking-widest shadow-lg shadow-indigo-500/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-3 group"
          >
            Mở Video Studio <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* RIGHT - video grid */}
        <div className="lg:col-span-6 h-[550px] relative">
          <div className="absolute inset-0 overflow-hidden mask-fade-v">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center gap-3 opacity-20">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 animate-scroll-v">
                {[...videos, ...videos].map((v, i) => (
                  <div key={`${v._id}-${i}`} className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-slate-100 dark:bg-black border border-black/[0.06] dark:border-white/[0.04] group">
                    <video src={v.mediaUrl} autoPlay loop muted playsInline className="w-full h-full object-cover opacity-60 dark:opacity-40 group-hover:opacity-90 dark:group-hover:opacity-70 group-hover:scale-105 transition-all duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 dark:from-black/80 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <p className="text-[10px] font-semibold text-white/80 line-clamp-2">{v.title}</p>
                      <div className="w-5 h-0.5 bg-indigo-500 mt-1.5 group-hover:w-full transition-all duration-500" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
            <div className="w-20 h-20 rounded-full border border-black/10 dark:border-white/10 flex items-center justify-center bg-white/60 dark:bg-white/5 backdrop-blur-xl animate-pulse">
              <Play size={28} className="text-indigo-500 dark:text-indigo-400 ml-1" fill="currentColor" />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .mask-fade-v { mask-image: linear-gradient(to bottom, transparent, black 12%, black 88%, transparent); -webkit-mask-image: linear-gradient(to bottom, transparent, black 12%, black 88%, transparent); }
        @keyframes sv { 0% { transform: translateY(0); } 100% { transform: translateY(-50%); } }
        .animate-scroll-v { animation: sv 35s linear infinite; }
        .animate-scroll-v:hover { animation-play-state: paused; }
      `}</style>
    </section>
  );
};
