import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ChevronLeft, Play, Zap, ShieldCheck, 
  Sparkles, ArrowRight, Clapperboard, 
  Film, LayoutGrid, Terminal, Cpu, Activity,
  Camera, Loader2, Video, Eye, Heart, Maximize2
} from 'lucide-react';
import StoryboardStudioWorkspace from '../../components/StoryboardStudioWorkspace';
import { useLanguage } from '../../context/LanguageContext';

const StoryboardStudioPage = () => {
  const { lang } = useLanguage();
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [explorerVideos, setExplorerVideos] = useState<any[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(true);

  useEffect(() => {
    const fetchSamples = async () => {
      try {
        const response = await fetch('https://api.skyverses.com/explorer?page=1&limit=12&type=video');
        const result = await response.json();
        if (result.data) setExplorerVideos(result.data);
      } catch (error) {
        console.error("Failed to fetch samples:", error);
      } finally {
        setLoadingVideos(false);
      }
    };
    fetchSamples();
  }, []);

  if (isStudioOpen) {
    return (
      <div className="fixed inset-0 z-[500] bg-white dark:bg-black animate-in fade-in duration-500">
        <StoryboardStudioWorkspace onClose={() => setIsStudioOpen(false)} />
      </div>
    );
  }

  return (
    <div className="bg-[#fcfcfd] dark:bg-[#050506] min-h-screen text-slate-900 dark:text-white font-sans selection:bg-brand-blue/30 overflow-x-hidden pt-20 transition-colors duration-500">
      
      {/* 1. HERO SECTION & VIDEO SHOWCASE */}
      <section className="min-h-screen flex flex-col justify-center px-6 lg:px-12 py-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[1200px] h-[1000px] bg-brand-blue/5 rounded-full blur-[250px] pointer-events-none"></div>
        
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center relative z-10">
          <div className="lg:col-span-5 space-y-10">
            <motion.div 
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-blue/10 border border-brand-blue/20 text-brand-blue text-[10px] font-black uppercase tracking-[0.2em]"
            >
              <Sparkles size={14} /> AI Script-to-Screen Engine
            </motion.div>
            
            <div className="space-y-6">
              <h1 className="text-6xl lg:text-[90px] font-black leading-[0.85] tracking-tighter italic uppercase text-slate-900 dark:text-white">
                Đạo diễn <br /> <span className="text-brand-blue font-black">Thế giới</span> <br /> của bạn.
              </h1>
              <p className="text-xl lg:text-3xl text-slate-500 dark:text-gray-400 font-medium leading-tight border-l-4 border-brand-blue pl-8 max-w-xl transition-all">
                Từ kịch bản thô đến thước phim điện ảnh nhất quán chỉ trong tích tắc. Giải pháp sản xuất video AI chuyên nghiệp đầu tiên tại Việt Nam.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 pt-4">
              <button 
                onClick={() => setIsStudioOpen(true)}
                className="bg-brand-blue text-white px-12 py-6 rounded-sm text-xs font-black uppercase tracking-[0.4em] shadow-[0_20px_80px_rgba(0,144,255,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4 group"
              >
                Khởi chạy Studio Pro <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-12 py-6 border border-slate-200 dark:border-white/10 rounded-sm text-xs font-black uppercase tracking-[0.4em] text-slate-600 dark:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-all backdrop-blur-md flex items-center justify-center gap-4 shadow-sm">
                Xem Tài liệu <Play size={16} fill="currentColor" />
              </button>
            </div>

            <div className="flex items-center gap-8 pt-4 border-t border-black/5 dark:border-white/5">
                <div className="flex flex-col">
                    <span className="text-2xl font-black italic text-brand-blue leading-none">12.4ms</span>
                    <span className="text-[8px] font-black uppercase text-gray-400 tracking-widest mt-1">Uplink Latency</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-2xl font-black italic text-brand-blue leading-none">4K+</span>
                    <span className="text-[8px] font-black uppercase text-gray-400 tracking-widest mt-1">Native Resolution</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-2xl font-black italic text-brand-blue leading-none">VEO 3</span>
                    <span className="text-[8px] font-black uppercase text-gray-400 tracking-widest mt-1">Industrial Model</span>
                </div>
            </div>
          </div>

          {/* RIGHT SIDE: SCROLLING CARDS FROM API */}
          <div className="lg:col-span-7 h-[750px] relative">
            <div className="absolute inset-0 overflow-hidden mask-fade-vertical">
              {loadingVideos ? (
                <div className="h-full flex flex-col items-center justify-center gap-4 opacity-20">
                  <Loader2 className="w-10 h-10 animate-spin text-brand-blue" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Uplinking Registry...</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-6 animate-marquee-vertical">
                  {[...explorerVideos, ...explorerVideos].map((vid, idx) => (
                    <div 
                      key={`${vid._id}-${idx}`}
                      className="relative aspect-[3/4] rounded-[2.5rem] overflow-hidden bg-slate-100 dark:bg-black border border-black/5 dark:border-white/5 group shadow-2xl transition-all"
                    >
                      <video 
                        src={vid.mediaUrl} 
                        autoPlay loop muted playsInline
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-60"></div>
                      <div className="absolute bottom-6 left-6 right-6">
                        <span className="text-[8px] font-black uppercase text-brand-blue tracking-[0.2em] mb-2 block">AI Synthesis // Validated</span>
                        <h3 className="text-lg font-black italic uppercase tracking-tighter text-white line-clamp-2 drop-shadow-lg">
                          {vid.title}
                        </h3>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Central Badge Overlay */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
              <div className="w-32 h-32 rounded-full border-4 border-brand-blue flex items-center justify-center bg-white/10 dark:bg-black/40 backdrop-blur-3xl shadow-3xl">
                <Clapperboard size={48} className="text-brand-blue animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SPECS & CAPABILITIES */}
      <section className="py-40 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-[#08080a] transition-colors">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center space-y-4 mb-32">
             <h2 className="text-5xl lg:text-7xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">Kiến trúc sản xuất AI</h2>
             <p className="text-slate-400 dark:text-gray-500 uppercase text-[10px] font-black tracking-[0.5em] italic">Industrial Standards // Local Mastery</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-slate-200 dark:bg-white/5 border border-slate-200 dark:border-white/5 shadow-3xl">
            {[
              { t: 'Script Analysis', i: <Terminal size={24}/>, d: 'AI phân tích ngữ nghĩa kịch bản để tự động bóc tách các nhịp phim và bối cảnh quan trọng.' },
              { t: 'Visual Anchoring', i: <LayoutGrid size={24}/>, d: 'Duy trì nhân vật và phong cách nhất quán 100% qua mọi phân cảnh kết xuất, không bị biến dạng.' },
              { t: 'Dynamic Staging', i: <Camera size={24}/>, d: 'Tùy chỉnh góc máy, ánh sáng và nhịp độ điện ảnh cho từng frame hình để tạo ra chiều sâu hình ảnh.' },
              { t: 'Industrial Output', i: <Cpu size={24}/>, d: 'Hạ tầng xử lý mạnh mẽ cho phép kết xuất chuẩn 1080P/4K mượt mà phục vụ cho các dự án thương mại.' }
            ].map((f, i) => (
              <div key={i} className="p-16 bg-white dark:bg-black space-y-8 group hover:bg-brand-blue/[0.02] transition-all duration-500 border-r border-slate-50 dark:border-white/5 last:border-r-0">
                 <div className="w-14 h-14 border border-slate-100 dark:border-white/10 flex items-center justify-center text-slate-400 group-hover:text-brand-blue transition-colors rounded-sm shadow-sm">
                    {f.i}
                 </div>
                 <div className="space-y-3">
                    <h4 className="text-2xl font-black uppercase tracking-tighter italic text-slate-900 dark:text-white">{f.t}</h4>
                    <p className="text-sm text-slate-500 dark:text-gray-400 font-medium leading-relaxed uppercase tracking-widest leading-loose">"{f.d}"</p>
                 </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. USE CASES */}
      <section className="py-40 bg-white dark:bg-[#050506] transition-colors">
         <div className="max-w-7xl mx-auto px-6 lg:px-12 space-y-24">
            <div className="flex flex-col md:flex-row justify-between items-end gap-8">
              <div className="space-y-4">
                 <h2 className="text-5xl lg:text-[100px] font-black uppercase tracking-tighter italic leading-none text-slate-900 dark:text-white">Giải pháp <br /><span className="text-brand-blue">đa kênh.</span></h2>
              </div>
              <p className="text-slate-400 dark:text-gray-500 font-bold uppercase text-xs tracking-widest max-w-xs text-right italic">"Từ TVC quảng cáo đến phim ngắn và nội dung viral mạng xã hội."</p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { t: 'Quảng cáo thương mại', img: 'https://images.unsplash.com/photo-1551033406-611cf9a28f67?auto=format&fit=crop&q=80&w=800' },
                { t: 'Phim ngắn & Storytelling', img: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=800' },
                { t: 'MV Ca nhạc AI', img: 'https://images.unsplash.com/photo-1514525253361-bee1455d0a2b?auto=format&fit=crop&q=80&w=800' },
                { t: 'Nội dung Giáo dục', img: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=800' },
                { t: 'Game Cutscenes', img: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800' },
                { t: 'Virtual Influencers', img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800' }
              ].map((item, i) => (
                <div key={i} className="group relative overflow-hidden aspect-video border border-slate-100 dark:border-white/5 rounded-sm shadow-2xl hover:border-brand-blue/40 transition-all cursor-pointer bg-slate-100 dark:bg-[#0a0a0a]">
                   <img src={item.img} className="w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105" alt={item.t} />
                   <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent p-8 flex flex-col justify-end">
                      <h4 className="text-2xl font-black uppercase italic tracking-tighter text-white translate-y-2 group-hover:translate-y-0 transition-transform">{item.t}</h4>
                   </div>
                </div>
              ))}
           </div>
         </div>
      </section>

      {/* 4. FINAL CALL TO ACTION */}
      <section className="py-60 text-center relative overflow-hidden bg-slate-50 dark:bg-[#020203] border-t border-slate-100 dark:border-white/5 transition-colors">
        <div className="absolute inset-0 z-0 opacity-5 flex flex-wrap gap-4 p-8 pointer-events-none text-[220px] font-black text-slate-300 dark:text-brand-blue leading-none tracking-tighter select-none italic">
          STORY STORY STORY STORY
        </div>
        <div className="max-w-4xl mx-auto space-y-16 relative z-10">
           <h2 className="text-7xl lg:text-[140px] font-black uppercase tracking-tighter leading-[0.8] italic text-slate-900 dark:text-white transition-all">Sẵn sàng để <br /> <span className="text-brand-blue">Sáng tạo?</span></h2>
           <div className="space-y-10 pt-10">
            <button 
              onClick={() => setIsStudioOpen(true)}
              className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-24 py-8 rounded-sm text-sm font-black uppercase tracking-[0.6em] shadow-[0_40px_100px_rgba(0,0,0,0.2)] hover:scale-110 active:scale-95 transition-all flex items-center gap-6 mx-auto group"
            >
              Trải nghiệm Studio ngay <Zap size={24} fill="currentColor" />
            </button>
            <p className="text-slate-500 dark:text-gray-500 font-black uppercase tracking-[0.5em] text-[10px] italic">Universal Credit Ready • Enterprise Privacy • Instant Export</p>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes marquee-vertical {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        .animate-marquee-vertical {
          animation: marquee-vertical 40s linear infinite;
        }
        .mask-fade-vertical {
          mask-image: linear-gradient(to bottom, transparent, black 15%, black 85%, transparent);
          -webkit-mask-image: linear-gradient(to bottom, transparent, black 15%, black 85%, transparent);
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default StoryboardStudioPage;
