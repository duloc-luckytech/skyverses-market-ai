
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ChevronLeft, Sparkles, Wand2, Layers, 
  Sliders, Zap, ArrowRight, Loader2
} from 'lucide-react';

interface HeroSectionProps {
  onStartStudio: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onStartStudio }) => {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHeroImages = async () => {
      try {
        const response = await fetch('https://api.skyverses.com/explorer?page=2&limit=20&type=image');
        const result = await response.json();
        if (result.data && Array.isArray(result.data)) {
          const list = result.data.slice(0, 10);
          setImages(list);
        }
      } catch (error) {
        console.error("Failed to fetch hero images:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHeroImages();
  }, []);

  return (
    <section className="min-h-screen flex flex-col px-0 lg:px-12 py-0 lg:py-20 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[1200px] h-[1000px] bg-brand-blue/5 dark:bg-brand-blue/10 rounded-full blur-[250px] animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-purple-600/5 dark:bg-purple-600/10 rounded-full blur-[200px]"></div>
      </div>

      <div className="max-w-[1500px] mx-auto flex flex-col lg:grid lg:grid-cols-12 gap-0 lg:gap-24 items-center relative z-10">
        
        {/* SLIDER/VISUALS - TOP ON MOBILE */}
        <div className="w-full lg:col-span-6 h-[350px] sm:h-[450px] lg:h-[700px] relative order-1 lg:order-2 overflow-hidden lg:rounded-[3rem] lg:shadow-2xl">
          <div className="absolute inset-0 overflow-hidden mask-fade-vertical">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center gap-4 opacity-20">
                <Loader2 className="w-10 h-10 animate-spin text-brand-blue" />
                <span className="text-[10px] font-black uppercase tracking-widest">Uplinking Registry...</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:gap-6 animate-marquee-vertical px-4 lg:px-0">
                {[...images, ...images].map((img, idx) => (
                  <div 
                    key={`${img._id}-${idx}`}
                    className="relative aspect-[3/4] rounded-xl lg:rounded-[2rem] overflow-hidden bg-slate-100 dark:bg-black border border-black/5 dark:border-white/5 group shadow-lg"
                  >
                    <img 
                      src={img.mediaUrl || img.thumbnailUrl} 
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110" 
                      alt={img.title} 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-60"></div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
            <div className="w-20 h-20 lg:w-32 lg:h-32 rounded-full border border-white/10 flex items-center justify-center bg-white/5 dark:bg-black/20 backdrop-blur-2xl shadow-3xl animate-pulse">
              <Wand2 size={24} className="text-brand-blue" />
            </div>
          </div>
        </div>

        {/* CONTENT - BELOW SLIDER ON MOBILE */}
        <div className="lg:col-span-6 space-y-8 lg:space-y-12 order-2 lg:order-1 p-6 sm:p-10 lg:p-0 text-center lg:text-left">
          <div className="flex flex-col items-center lg:items-start gap-4">
            <Link to="/market" className="inline-flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 hover:text-brand-blue transition-colors tracking-[0.4em]">
              <ChevronLeft size={14} /> Trở lại Kho giải pháp
            </Link>
            
            <div className="space-y-4 lg:space-y-8">
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-3 px-5 py-2 bg-brand-blue/10 border border-brand-blue/20 rounded-full text-brand-blue text-[11px] font-black uppercase tracking-[0.3em] italic mx-auto lg:mx-0"
              >
                <Sparkles size={14} /> Next-Gen Visual Synthesis
              </motion.div>

              <div className="space-y-4">
                <h1 className="text-5xl sm:text-6xl lg:text-[110px] font-black leading-[0.85] tracking-tighter italic uppercase text-slate-900 dark:text-white transition-all">
                  Image <br className="hidden sm:block" /> <span className="text-brand-blue">Studio.</span>
                </h1>
                <p className="text-base sm:text-lg lg:text-3xl text-slate-500 dark:text-gray-400 font-medium leading-tight border-none lg:border-l-4 border-brand-blue lg:pl-8 max-w-2xl italic mx-auto lg:mx-0">
                  “Kiến tạo hình ảnh cấp độ công nghiệp từ dữ liệu tham chiếu đa tầng.”
                </p>
              </div>
            </div>
          </div>

          {/* CTA BUTTON - PROMINENT ON MOBILE */}
          <div className="flex flex-col sm:flex-row gap-6 pt-4 lg:pt-6 justify-center lg:justify-start">
            <button 
              onClick={onStartStudio}
              className="bg-brand-blue text-white px-10 py-6 lg:px-16 lg:py-8 rounded-full lg:rounded-sm text-xs font-black uppercase tracking-[0.4em] shadow-[0_20px_60px_rgba(0,144,255,0.4)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-6 group w-full sm:w-auto"
            >
              VÀO STUDIO NGAY <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4 opacity-80">
            {[
              { label: 'PROMPT + REF', icon: <Wand2 size={16}/> },
              { label: 'SINGLE / BATCH', icon: <Layers size={16}/> },
              { label: 'SPEC CONTROL', icon: <Sliders size={16}/> },
              { label: 'CREDIT BASED', icon: <Zap size={16}/> }
            ].map(item => (
              <div key={item.label} className="p-3 lg:p-5 bg-slate-50 dark:bg-white/[0.03] border border-black/5 dark:border-white/5 rounded-xl flex flex-col items-center lg:items-start gap-2 group hover:border-brand-blue/30 transition-all shadow-sm text-center lg:text-left">
                <div className="text-brand-blue group-hover:scale-110 transition-transform">{item.icon}</div>
                <p className="text-[8px] lg:text-[10px] font-black uppercase tracking-widest leading-none text-slate-900 dark:text-white">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      <style>{`
        .mask-fade-vertical {
          mask-image: linear-gradient(to bottom, transparent, black 5%, black 95%, transparent);
          -webkit-mask-image: linear-gradient(to bottom, transparent, black 5%, black 95%, transparent);
        }
        @keyframes marquee-vertical {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        .animate-marquee-vertical {
          animation: marquee-vertical 40s linear infinite;
        }
        .animate-marquee-vertical:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
};
