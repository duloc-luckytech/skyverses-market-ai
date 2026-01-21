
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Zap, Sparkles, ArrowRight, ShieldCheck, 
  Activity, MonitorPlay, UserCircle, Film,
  Layers, Lock, ExternalLink, Cpu, ChevronLeft,
  Scan, Maximize2
} from 'lucide-react';
import { useVideoAnimate } from '../../hooks/useVideoAnimate';
import VideoAnimateWorkspace from '../../components/VideoAnimateWorkspace';
import { Link } from 'react-router-dom';

const HERO_EXAMPLES = [
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
    <div className="bg-white dark:bg-[#050507] min-h-screen text-slate-900 dark:text-white font-sans selection:bg-cyan-500/30 overflow-x-hidden pt-20 transition-colors duration-500">
      
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
                <Sparkles size={14} /> Công nghệ diễn hoạt ảnh sang Video chuyên nghiệp
              </motion.div>

              <div className="space-y-4">
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                  className="text-6xl lg:text-[100px] font-black tracking-tighter uppercase italic leading-[0.8] text-slate-900 dark:text-white"
                >
                  Video <br /> <span className="text-cyan-500">Animate.</span>
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                  className="text-xl lg:text-2xl text-slate-500 dark:text-gray-400 font-medium max-w-xl leading-tight border-l-4 border-cyan-500 pl-8"
                >
                  “Thổi hồn vào mọi khung hình. Khóa định danh nhân vật và tái cấu trúc chuyển động chân thực cho kỷ nguyên sáng tạo số tại Việt Nam.”
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

          {/* VIDEO SHOWCASE COLUMN */}
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
                      className="w-full h-full object-cover opacity-60 transition-all duration-1000 group-hover:scale-105" 
                    />
                    
                    {/* HUD OVERLAY */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
                    
                    <div className="absolute top-8 left-8 flex items-center gap-4 px-4 py-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-full">
                       <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse"></div>
                       <span className="text-[9px] font-black uppercase text-white tracking-widest italic">{HERO_EXAMPLES[currentSlide].tag}</span>
                    </div>

                    <div className="absolute bottom-10 left-10 space-y-2">
                       <p className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.4em] italic leading-none">Industrial_Output_v4.2</p>
                       <h3 className="text-4xl font-black italic uppercase tracking-tighter text-white leading-none">{HERO_EXAMPLES[currentSlide].title}</h3>
                    </div>

                    <div className="absolute bottom-10 right-10 flex gap-2">
                       {HERO_EXAMPLES.map((_, i) => (
                         <button 
                           key={i} 
                           onClick={() => setCurrentSlide(i)}
                           className={`h-1 rounded-full transition-all duration-500 ${i === currentSlide ? 'w-10 bg-cyan-500' : 'w-2 bg-white/20'}`}
                         />
                       ))}
                    </div>
                  </motion.div>
               </AnimatePresence>
            </div>

            {/* Floating Stats */}
            <div className="absolute -bottom-6 -left-6 bg-white dark:bg-[#0c0c0e] p-6 rounded-3xl shadow-3xl border border-slate-100 dark:border-white/10 hidden md:block">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-cyan-500/10 rounded-2xl flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                     <Activity size={24} />
                  </div>
                  <div>
                     <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Tốc độ xử lý</p>
                     <p className="text-xl font-black italic text-slate-800 dark:text-white">60 FPS Native</p>
                  </div>
               </div>
            </div>
          </div>

        </div>
      </section>

      {/* 3. CAPABILITIES GRID */}
      <section className="py-40 bg-slate-50/50 dark:bg-black/20 border-y border-slate-100 dark:border-white/5 relative z-10">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 space-y-32">
          
          {/* Feature 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div className="space-y-8">
              <div className="inline-block p-4 bg-cyan-500/10 rounded-2xl text-cyan-500">
                <Activity size={32} />
              </div>
              <h2 className="text-4xl lg:text-6xl font-black uppercase tracking-tighter italic leading-none text-slate-900 dark:text-white">Diễn Hoạt <br /> Chuyển Động.</h2>
              <p className="text-xl text-slate-600 dark:text-gray-400 font-medium leading-relaxed italic">
                Sử dụng video tham chiếu để áp dụng các chuyển động phức tạp (nhảy múa, hành động, biểu cảm) lên ảnh tĩnh của bạn mà không làm biến dạng cấu trúc nhân vật. Phù hợp cho sáng tạo nội dung TikTok và Reels.
              </p>
              <div className="flex flex-wrap gap-4">
                 {['Mượt mà 60fps', 'Vật lý chuẩn xác', 'Độ nét 4K'].map(f => (
                   <span key={f} className="px-3 py-1 bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest text-cyan-600 dark:text-cyan-400 italic shadow-sm">{f}</span>
                 ))}
              </div>
            </div>
            <div className="aspect-video bg-black rounded-[2.5rem] border-4 border-cyan-500/20 shadow-3xl overflow-hidden relative group">
               <video 
                 src="https://video.aidancing.net/video-avatar/ai-fashion-walking-posing-1.mp4" 
                 autoPlay loop muted playsInline
                 className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-[5s]" 
               />
               <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-cyan-500/80 text-white flex items-center justify-center shadow-2xl animate-pulse">
                     <Play size={24} fill="currentColor" className="ml-1" />
                  </div>
               </div>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div className="aspect-video bg-black rounded-[2.5rem] border-4 border-purple-500/20 shadow-3xl overflow-hidden relative group order-2 lg:order-1">
               <video 
                 src="https://video.aidancing.net/video-avatar/ai-change-bg-review-product.mp4" 
                 autoPlay loop muted playsInline
                 className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-[5s]" 
               />
               <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-purple-600/80 text-white flex items-center justify-center shadow-2xl animate-pulse">
                     <UserCircle size={32} />
                  </div>
               </div>
            </div>
            <div className="space-y-8 order-1 lg:order-2">
              <div className="inline-block p-4 bg-purple-600/10 rounded-2xl text-purple-600">
                <UserCircle size={32} />
              </div>
              <h2 className="text-4xl lg:text-6xl font-black uppercase tracking-tighter italic leading-none text-slate-900 dark:text-white text-right">Thay Thế <br /> Định Danh.</h2>
              <p className="text-xl text-slate-600 dark:text-gray-400 font-medium leading-relaxed text-right italic">
                Thay thế gương mặt và nhân dạng một cách mượt mà. Hệ thống AI phân tích hàng nghìn điểm mốc trên khuôn mặt để tiêm định danh mới vào video gốc với độ ổn định cao nhất, hoàn hảo cho Review sản phẩm.
              </p>
              <div className="flex flex-wrap gap-4 justify-end">
                 {['Khóa định danh', 'Khớp tông màu da', 'Không nháy hình'].map(f => (
                   <span key={f} className="px-3 py-1 bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest text-purple-600 dark:text-purple-400 italic shadow-sm">{f}</span>
                 ))}
              </div>
            </div>
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
