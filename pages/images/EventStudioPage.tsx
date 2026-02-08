
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { EventStudioWorkspace } from '../../components/EventStudioWorkspace';
import { EVENT_CONFIGS } from '../../constants/event-configs';
import { Loader2, Zap } from 'lucide-react';

interface EventStudioPageProps {
  type: 'noel' | 'tet' | 'wedding' | 'birthday';
}

const EventStudioPage: React.FC<EventStudioPageProps> = ({ type }) => {
  const config = EVENT_CONFIGS[type];
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSamples = async () => {
      setLoading(true);
      try {
        const response = await fetch(`https://api.skyverses.com/explorer?page=1&limit=10&search=${type}`);
        const result = await response.json();
        if (result.data) setImages(result.data);
      } catch (error) {
        console.error(`Failed to fetch ${type} samples:`, error);
      } finally {
        setLoading(false);
      }
    };
    fetchSamples();
    setIsStudioOpen(false);
  }, [type]);

  if (!config) return <div className="pt-40 text-center uppercase font-black tracking-widest opacity-20">Configuration Node Not Found</div>;

  if (isStudioOpen) {
    return (
      <div className="fixed inset-0 z-[500] bg-white dark:bg-black animate-in fade-in duration-500">
        <EventStudioWorkspace config={config} onClose={() => setIsStudioOpen(false)} />
      </div>
    );
  }

  const accentColorClass = `text-${config.accentColor}-500`;
  const accentBgClass = `bg-${config.accentColor}-500/10`;
  const accentBorderClass = `border-${config.accentColor}-500/20`;

  return (
    <div className="bg-[#fdfdfe] dark:bg-[#050507] min-h-screen text-slate-900 dark:text-white font-sans overflow-x-hidden pt-20 transition-colors duration-500">
      
      {/* 1. HERO SECTION */}
      <section className="min-h-screen flex flex-col justify-center px-6 lg:px-12 py-20 relative overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none opacity-20 dark:opacity-40">
           <div className={`absolute top-0 right-0 w-[1000px] h-[1000px] bg-${config.accentColor}-500/10 rounded-full blur-[200px]`}></div>
           <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-emerald-600/10 rounded-full blur-[200px]"></div>
        </div>

        <div className="max-w-[1500px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center relative z-10">
          <div className="lg:col-span-6 space-y-12">
            <div className="space-y-8">
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className={`inline-flex items-center gap-3 px-5 py-2 ${accentBgClass} border ${accentBorderClass} rounded-full ${accentColorClass} text-[11px] font-black uppercase tracking-[0.3em] italic`}
              >
                <config.icon size={14} className={type === 'noel' ? 'animate-spin-slow' : 'animate-pulse'} /> {config.name}
              </motion.div>

              <div className="space-y-6">
                <h1 className="text-7xl lg:text-[110px] font-black leading-[0.8] tracking-tighter italic uppercase text-slate-900 dark:text-white transition-all">
                  {config.heroTitle[0]} <span className={accentColorClass}>{config.heroTitle[1]}</span> <br /> <span className="text-emerald-500">{config.heroTitle[2]}</span>
                </h1>
                <p className="text-xl lg:text-3xl text-slate-500 dark:text-gray-400 font-medium leading-tight border-l-4 border-slate-200 dark:border-white/10 pl-8 max-w-2xl italic">
                  “{config.heroSubtitle}”
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 pt-4">
              <button 
                onClick={() => setIsStudioOpen(true)}
                className={`bg-${config.accentColor}-600 text-white px-16 py-8 rounded-sm text-xs font-black uppercase tracking-[0.4em] shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-6 group`}
              >
                Vào Studio <Zap size={22} fill="currentColor" className="group-hover:rotate-12 transition-transform" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 h-[700px] relative">
            <div className="absolute inset-0 overflow-hidden mask-fade-vertical">
              {loading ? (
                <div className="h-full flex flex-col items-center justify-center gap-4 opacity-20">
                  <Loader2 className={`w-10 h-10 animate-spin ${accentColorClass}`} />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">Đang tải mẫu...</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-6 animate-marquee-vertical">
                  {[...images, ...images].map((img, idx) => (
                    <div 
                      key={`${img._id}-${idx}`}
                      className="relative aspect-[3/4] rounded-[2rem] overflow-hidden bg-slate-100 dark:bg-black border border-black/5 dark:border-white/5 group shadow-2xl"
                    >
                      <img 
                        src={img.thumbnailUrl} 
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110" 
                        alt={img.title} 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-60"></div>
                      <div className="absolute bottom-6 left-6 right-6">
                         <span className={`text-[8px] font-black uppercase ${accentColorClass} tracking-widest block mb-2`}>Studio AI Creation</span>
                         <h3 className="text-lg font-black italic uppercase tracking-tighter text-white line-clamp-2 drop-shadow-lg">
                           {img.title}
                         </h3>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 2. BENEFITS SECTION */}
      <section className="py-40 bg-slate-50 dark:bg-[#08080a] border-y border-slate-100 dark:border-white/5 transition-colors">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-12">
          <h2 className="text-4xl lg:text-7xl font-black uppercase italic tracking-tighter leading-none text-slate-900 dark:text-white">
            Kiến tạo <br /><span className={accentColorClass}>Bằng Công Nghệ AI.</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            {config.benefits.map((item, i) => (
              <div key={i} className={`p-8 bg-white dark:bg-white/[0.02] border border-black/5 dark:border-white/5 rounded-3xl group hover:border-${config.accentColor}-500/30 transition-all shadow-sm`}>
                <span className={`text-3xl font-black italic opacity-20 group-hover:opacity-100 transition-colors leading-none ${accentColorClass}`}>0{i+1}</span>
                <div className="mt-6 space-y-2">
                  <h4 className="text-2xl font-black uppercase italic tracking-tight text-slate-900 dark:text-white">{item.t}</h4>
                  <p className="text-sm text-slate-500 dark:text-gray-400 font-medium leading-relaxed">"{item.d}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

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
        .animate-spin-slow {
          animation: spin 12s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default EventStudioPage;
