
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SOLUTIONS } from '../../data';
import { useLanguage } from '../../context/LanguageContext';
import { 
  ChevronLeft, Play, Camera, Film, Zap, 
  MonitorPlay, Activity, Share2, 
  Download, Video, Target, Sparkles
} from 'lucide-react';
import TextToVideoWorkspace from '../../components/TextToVideoWorkspace';

const ProductVideo1 = () => {
  const solution = SOLUTIONS.find(s => s.id === 'MOTION-SYNTH-V1');
  const { lang } = useLanguage();
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderImages = [
    "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=1600",
    "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=1600",
    "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1600"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  if (!solution) return null;

  if (isStudioOpen) {
    return (
      <div className="fixed inset-0 z-[500] bg-white dark:bg-black animate-in fade-in duration-700">
        <TextToVideoWorkspace onClose={() => setIsStudioOpen(false)} />
      </div>
    );
  }

  return (
    <div className="pt-24 bg-white dark:bg-[#020203] min-h-screen text-black dark:text-white font-sans selection:bg-brand-blue/30 overflow-x-hidden transition-colors duration-500 pb-32">
      <div className="fixed inset-0 pointer-events-none opacity-10 z-0">
         <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_30%,_#0090ff22_0%,_transparent_50%)]"></div>
      </div>

      <div className="max-w-[1500px] mx-auto px-6 lg:px-12 relative z-10">
        <section className="min-h-[85vh] flex flex-col justify-center py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-6 space-y-12 animate-in fade-in slide-in-from-left-8 duration-1000">
              <div className="space-y-8">
                <Link to="/" className="inline-flex items-center gap-3 px-6 py-2 border border-black/10 dark:border-white/10 text-gray-500 hover:text-black dark:hover:text-white transition-all group rounded-full bg-white/50 dark:bg-transparent backdrop-blur-md">
                  <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em]">Back to Home</span>
                </Link>

                <div className="space-y-2">
                   <h1 className="text-8xl lg:text-[140px] font-black uppercase tracking-tighter leading-[0.75] italic">
                     Synth <br /> <span className="text-brand-blue">Motion.</span>
                   </h1>
                </div>
                <p className="text-2xl lg:text-4xl text-gray-500 dark:text-gray-400 font-medium leading-tight border-l-4 border-brand-blue pl-10 max-w-xl italic">
                  “Biến ý định ngữ nghĩa thành thước phim 4K sống động với vật lý khí quyển hoàn hảo.”
                </p>
              </div>

              <div className="pt-8">
                 <button onClick={() => setIsStudioOpen(true)} className="bg-brand-blue text-white px-20 py-10 text-xs font-black uppercase tracking-[0.5em] shadow-[0_0_80px_rgba(0,144,255,0.2)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-8 rounded-sm group relative overflow-hidden">
                    Launch Engine <Play size={24} className="fill-current" />
                 </button>
              </div>
            </div>

            <div className="lg:col-span-6 w-full animate-in fade-in slide-in-from-right-8 duration-1000">
               <div className="aspect-[2.39/1] lg:aspect-[16/10] bg-black border border-black/10 dark:border-white/10 relative overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.4)] dark:shadow-[0_40px_100px_rgba(0,0,0,0.8)] group">
                  <div className="absolute inset-0">
                    {sliderImages.map((img, index) => (
                      <div key={index} className={`absolute inset-0 transition-all duration-[3000ms] ease-in-out ${index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-110 blur-sm'}`}>
                        <img src={img} className="w-full h-full object-cover" alt={`Cinema ${index}`} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
                      </div>
                    ))}
                  </div>
                  <div className="absolute inset-0 pointer-events-none border-[30px] lg:border-[60px] border-black opacity-30"></div>
                  <div className="absolute inset-0 p-8 lg:p-12 flex flex-col justify-between pointer-events-none">
                     <div className="flex justify-between items-start">
                        <div className="flex items-center gap-4">
                           <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse shadow-[0_0_10px_red]"></div>
                           <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60">REC ● VEO_3.1_RAW</span>
                        </div>
                     </div>
                     <div className="flex justify-between items-end">
                        <div className="space-y-1">
                           <p className="text-[8px] font-black uppercase text-brand-blue">Sequence_0{currentSlide + 1}</p>
                           <p className="text-2xl font-black uppercase italic tracking-tighter text-white">Temporal_Logic_Active</p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProductVideo1;
