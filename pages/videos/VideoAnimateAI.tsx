
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Zap, Sparkles, ArrowRight, ShieldCheck, 
  Activity, MonitorPlay, UserCircle, Film,
  Layers, Lock, ExternalLink, Cpu, ChevronLeft,
  Scan, Maximize2, Mic2, Music, UserCheck
} from 'lucide-react';
import VideoAnimateWorkspace from '../../components/VideoAnimateWorkspace';
import { Link } from 'react-router-dom';

const HERO_EXAMPLES = [
  {
    id: 0,
    url: 'https://video.aidancing.net/video-avatar/ai-talking-intro-product-2.mp4',
    title: 'AI Presenter Pro',
    tag: 'TALKING_AVATAR'
  },
  {
    id: 1,
    url: 'https://video.aidancing.net/video-avatar/ai-change-bg-review-product.mp4',
    title: 'Review Sản Phẩm AI',
    tag: 'E-COMMERCE_VN'
  },
  {
    id: 2,
    url: 'https://video.aidancing.net/video-avatar/ai-fashion-walking-posing-1.mp4',
    title: 'Catwalk Thời Trang AI',
    tag: 'FASHION_CREATOR'
  }
];

const SHOWCASE_LIST = [
  {
    id: 's1',
    title: 'AI Talking Avatar',
    desc: 'Tạo nhân vật ảo giới thiệu sản phẩm với khẩu hình và biểu cảm tự nhiên từ ảnh tĩnh.',
    video: 'https://video.aidancing.net/video-avatar/ai-talking-intro-product-2.mp4',
    mode: 'TALKING',
    icon: <UserCircle className="text-cyan-400" />
  },
  {
    id: 's2',
    title: 'AI Singing Performance',
    desc: 'Diễn hoạt ảnh tĩnh thành video ca hát chuyên nghiệp với độ ổn định và cảm xúc cao.',
    video: 'https://video.aidancing.net/video-avatar/ai-singing.mp4',
    mode: 'SINGING',
    icon: <Music className="text-pink-500" />
  },
  {
    id: 's3',
    title: 'Speech to Speech Sync',
    desc: 'Đồng bộ hóa giọng nói, nhịp môi và chuyển động gương mặt từ nguồn audio bất kỳ.',
    video: 'https://video.aidancing.net/video-avatar/ai-sts.mp4',
    mode: 'STS_SYNC',
    icon: <Mic2 className="text-emerald-400" />
  },
  {
    id: 's4',
    title: 'Professional Face Swap',
    desc: 'Thay đổi định danh nhân vật trong video gốc bằng gương mặt mới với độ khớp hoàn hảo.',
    video: 'https://video.aidancing.net/video-avatar/face-swap.mp4',
    mode: 'SWAP',
    icon: <UserCheck className="text-purple-500" />
  },
  {
    id: 's5',
    title: 'E-commerce AI Review',
    desc: 'Tự động hóa sản xuất video review sản phẩm với bối cảnh linh hoạt và chân thực.',
    video: 'https://video.aidancing.net/video-avatar/ai-change-bg-review-product.mp4',
    mode: 'REVIEW',
    icon: <Zap className="text-orange-400" />
  },
  {
    id: 's6',
    title: 'AI Fashion Runway',
    desc: 'Diễn hoạt dáng đi và chuyển động thời trang chuẩn Runway quốc tế từ ảnh mẫu.',
    video: 'https://video.aidancing.net/video-avatar/ai-fashion-walking-posing-1.mp4',
    mode: 'FASHION',
    icon: <Sparkles className="text-blue-400" />
  }
];

const VideoAnimateAI: React.FC = () => {
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % HERO_EXAMPLES.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-white dark:bg-[#050507] min-h-screen text-slate-900 dark:text-white font-sans selection:bg-brand-blue/30 overflow-x-hidden pt-20 transition-colors duration-500">
      
      {/* 1. BACKGROUND AMBIENCE */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[1200px] h-[1000px] bg-cyan-600/5 rounded-full blur-[250px]"></div>
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-purple-600/5 rounded-full blur-[200px]"></div>
      </div>

      {/* 2. HERO SECTION */}
      <section className="relative min-h-screen flex flex-col justify-center px-6 lg:px-12 py-20 z-10 overflow-hidden">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">
          
          <div className="lg:col-span-5 space-y-10 order-2 lg:order-1">
            <Link to="/market" className="inline-flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 hover:text-brand-blue transition-colors tracking-[0.4em]">
              <ChevronLeft size={14} /> Quay lại Kho giải pháp
            </Link>
            
            <div className="space-y-8">
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-3 px-5 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-600 dark:text-cyan-400 text-[11px] font-black uppercase tracking-[0.4em] italic"
              >
                <Sparkles size={14} /> Công nghệ diễn hoạt AI Studio
              </motion.div>

              <div className="space-y-6">
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                  className="text-6xl lg:text-[100px] font-black tracking-tighter uppercase italic leading-[0.8] text-slate-900 dark:text-white"
                >
                  Video <br /> <span className="text-cyan-500">Animate.</span>
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                  className="text-xl lg:text-3xl text-slate-500 dark:text-gray-400 font-medium max-w-xl leading-tight border-l-4 border-cyan-500 pl-8"
                >
                  “Hệ thống diễn hoạt hình ảnh và video chuyên nghiệp. Khóa định danh nhân vật (Identity Lock) và tái cấu trúc chuyển động chuẩn điện ảnh bằng trí tuệ nhân tạo.”
                </motion.p>
              </div>
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center gap-6 pt-4"
            >
              <button 
                onClick={() => setIsWorkspaceOpen(true)}
                className="bg-cyan-500 text-white dark:text-black px-12 py-6 rounded-full text-xs font-black uppercase tracking-[0.4em] shadow-[0_20px_80px_rgba(6,182,212,0.4)] hover:scale-110 active:scale-95 transition-all flex items-center justify-center gap-4 group"
              >
                Mở Studio Sáng Tạo <Zap size={18} fill="currentColor" className="group-hover:rotate-12 transition-transform" />
              </button>
              <button className="px-10 py-6 border border-slate-200 dark:border-white/10 rounded-full text-xs font-black uppercase tracking-[0.4em] text-slate-500 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-all backdrop-blur-md">
                Xem Showreel AI
              </button>
            </motion.div>
          </div>

          {/* HERO VIDEO SHOWCASE */}
          <div className="lg:col-span-7 relative order-1 lg:order-2">
            <div className="relative aspect-[16/10] bg-white dark:bg-[#0a0a0c] border border-slate-200 dark:border-white/10 rounded-[3rem] p-4 shadow-3xl overflow-hidden group">
               <AnimatePresence mode="wait">
                  <motion.div 
                    key={currentSlide}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 1 }}
                    className="h-full w-full bg-black rounded-[2.5rem] overflow-hidden relative"
                  >
                    <video 
                      src={HERO_EXAMPLES[currentSlide].url} 
                      autoPlay loop muted playsInline 
                      className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-105" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
                    <div className="absolute top-8 left-8 flex items-center gap-4 px-4 py-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-full">
                       <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse"></div>
                       <span className="text-[9px] font-black uppercase text-white tracking-widest italic">{HERO_EXAMPLES[currentSlide].tag}</span>
                    </div>
                    <div className="absolute bottom-10 left-10 space-y-2">
                       <h3 className="text-4xl font-black italic uppercase tracking-tighter text-white leading-none">{HERO_EXAMPLES[currentSlide].title}</h3>
                    </div>
                  </motion.div>
               </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CAPABILITIES SHOWCASE GRID - FULL 6 VIDEOS */}
      <section className="py-40 bg-slate-50/50 dark:bg-black/20 border-y border-slate-100 dark:border-white/5 relative z-10">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          <div className="text-center space-y-4 mb-24">
             <motion.span 
               initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
               className="text-cyan-500 font-black uppercase tracking-[0.6em] text-[11px]"
             >
               Engine Capabilities
             </motion.span>
             <h2 className="text-4xl lg:text-6xl font-black uppercase tracking-tighter italic text-slate-900 dark:text-white">Thư viện giải pháp Diễn hoạt</h2>
             <p className="text-slate-500 dark:text-gray-400 font-medium max-w-2xl mx-auto">Khám phá các khả năng vượt trội của hệ thống diễn hoạt thông minh Skyverses.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            {SHOWCASE_LIST.map((item, idx) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group relative bg-white dark:bg-[#0d0d0f] border border-slate-100 dark:border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl hover:border-cyan-500/40 transition-all duration-500"
              >
                <div className="aspect-video bg-black relative overflow-hidden">
                  <video 
                    src={item.video} 
                    autoPlay loop muted playsInline 
                    className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-105 opacity-60 group-hover:opacity-100" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80 group-hover:opacity-40 transition-opacity"></div>
                  
                  {/* Floating Tag */}
                  <div className="absolute top-6 left-6 z-20">
                    <span className="px-4 py-1.5 bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-[9px] font-black uppercase text-white tracking-widest shadow-xl">
                      {item.mode}
                    </span>
                  </div>

                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                     <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white shadow-3xl">
                        <Play size={28} fill="white" className="ml-1" />
                     </div>
                  </div>
                </div>

                <div className="p-10 space-y-6">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-black/5 dark:bg-white/5 flex items-center justify-center shadow-inner">
                         {item.icon}
                      </div>
                      <div className="space-y-0.5">
                         <h4 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white leading-none">{item.title}</h4>
                      </div>
                   </div>
                   <p className="text-sm text-slate-500 dark:text-gray-400 font-medium leading-relaxed italic">
                     "{item.desc}"
                   </p>
                   <div className="pt-4 flex justify-between items-center border-t border-black/5 dark:border-white/5">
                      <span className="text-[10px] font-black text-cyan-500 uppercase tracking-widest italic">Skyverses Workspace</span>
                      <button className="p-3 bg-slate-100 dark:bg-white/5 rounded-xl text-slate-400 hover:text-brand-blue transition-colors">
                         <ExternalLink size={18} />
                      </button>
                   </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. WORKSPACE MODAL */}
      <AnimatePresence>
        {isWorkspaceOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }}
            className="fixed inset-0 z-[1000] bg-white dark:bg-[#050507]"
          >
            <VideoAnimateWorkspace onClose={() => setIsWorkspaceOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. FOOTER */}
      <footer className="py-20 text-center space-y-8 opacity-40">
         <div className="flex items-center justify-center gap-6">
            <Cpu size={20} />
            <span className="text-[10px] font-black uppercase tracking-[0.6em]">Powered by Skyverses Neural Lattice - Giải pháp AI hàng đầu Việt Nam</span>
         </div>
      </footer>
    </div>
  );
};

export default VideoAnimateAI;
