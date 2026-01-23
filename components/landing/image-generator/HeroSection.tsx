
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
          // Lấy 10 hình ngẫu nhiên hoặc 10 hình đầu tiên
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
    <section className="min-h-screen flex flex-col justify-center px-6 lg:px-12 py-20 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[1200px] h-[1000px] bg-brand-blue/5 dark:bg-brand-blue/10 rounded-full blur-[250px] animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-purple-600/5 dark:bg-purple-600/10 rounded-full blur-[200px]"></div>
      </div>

      <div className="max-w-[1500px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center relative z-10">
        {/* LEFT CONTENT */}
        <div className="lg:col-span-6 space-y-12">
          <Link to="/market" className="inline-flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 hover:text-brand-blue transition-colors tracking-[0.4em]">
            <ChevronLeft size={14} /> Trở lại Kho giải pháp
          </Link>
          
          <div className="space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-3 px-5 py-2 bg-brand-blue/10 border border-brand-blue/20 rounded-full text-brand-blue text-[11px] font-black uppercase tracking-[0.3em] italic"
            >
              <Sparkles size={14} /> Next-Gen Visual Synthesis
            </motion.div>

            <div className="space-y-6">
              <h1 className="text-7xl lg:text-[130px] font-black leading-[0.8] tracking-tighter italic uppercase text-slate-900 dark:text-white transition-all">
                Image <br /> <span className="text-brand-blue">Studio.</span>
              </h1>
              <p className="text-xl lg:text-3xl text-slate-500 dark:text-gray-400 font-medium leading-tight border-l-4 border-brand-blue pl-8 max-w-2xl italic">
                “Kiến tạo hình ảnh cấp độ công nghiệp từ dữ liệu hình ảnh tham chiếu đa tầng.”
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'PROMPT + REF', icon: <Wand2 size={16}/>, desc: '6 ảnh tham chiếu' },
              { label: 'SINGLE / BATCH', icon: <Layers size={16}/>, desc: 'Tạo hàng loạt' },
              { label: 'SPEC CONTROL', icon: <Sliders size={16}/>, desc: 'Tùy chỉnh Ratio/Res' },
              { label: 'CREDIT BASED', icon: <Zap size={16}/>, desc: 'Thanh toán linh hoạt' }
            ].map(item => (
              <div key={item.label} className="p-5 bg-slate-50 dark:bg-white/[0.03] border border-black/5 dark:border-white/5 rounded-2xl flex flex-col gap-3 group hover:border-brand-blue/30 transition-all shadow-sm">
                <div className="text-brand-blue group-hover:scale-110 transition-transform">{item.icon}</div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest leading-none text-slate-900 dark:text-white">{item.label}</p>
                  <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-6 pt-6">
            <button 
              onClick={onStartStudio}
              className="bg-brand-blue text-white px-16 py-8 rounded-sm text-xs font-black uppercase tracking-[0.4em] shadow-[0_20px_80px_rgba(0,144,255,0.4)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-6 group"
            >
              Khởi chạy Studio <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* RIGHT CONTENT: SCROLLING CARDS */}
        <div className="lg:col-span-6 h-[700px] relative">
          <div className="absolute inset-0 overflow-hidden mask-fade-vertical">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center gap-4 opacity-20">
                <Loader2 className="w-10 h-10 animate-spin text-brand-blue" />
                <span className="text-[10px] font-black uppercase tracking-widest">Uplinking Registry...</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-6 animate-marquee-vertical">
                {/* Double the list to create infinite loop effect */}
                {[...images, ...images].map((img, idx) => (
                  <div 
                    key={`${img._id}-${idx}`}
                    className="relative aspect-[3/4] rounded-[2rem] overflow-hidden bg-slate-100 dark:bg-black border border-black/5 dark:border-white/5 group shadow-2xl"
                  >
                    <img 
                      src={img.mediaUrl || img.thumbnailUrl} 
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110" 
                      alt={img.title} 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-60"></div>
                    <div className="absolute bottom-6 left-6 right-6">
                      <h3 className="text-lg font-black italic uppercase tracking-tighter text-white line-clamp-2 drop-shadow-lg">
                        {img.title}
                      </h3>
                      <div className="w-8 h-1 bg-brand-blue mt-3 group-hover:w-full transition-all duration-500"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Central Pulsing Icon */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
            <div className="w-32 h-32 rounded-full border border-white/10 flex items-center justify-center bg-white/5 dark:bg-black/20 backdrop-blur-2xl shadow-3xl animate-pulse">
              <Wand2 size={40} className="text-brand-blue" />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .mask-fade-vertical {
          mask-image: linear-gradient(to bottom, transparent, black 15%, black 85%, transparent);
          -webkit-mask-image: linear-gradient(to bottom, transparent, black 15%, black 85%, transparent);
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
