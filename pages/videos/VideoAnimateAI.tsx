
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Zap, Sparkles, ArrowRight, ShieldCheck, 
  Activity, MonitorPlay, UserCircle, Film,
  Layers, Lock, ExternalLink, Cpu
} from 'lucide-react';
import { useVideoAnimate } from '../../hooks/useVideoAnimate';
import VideoAnimateWorkspace from '../../components/VideoAnimateWorkspace';

const VideoAnimateAI: React.FC = () => {
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);
  const v = useVideoAnimate();

  return (
    <div className="bg-white dark:bg-[#050507] min-h-screen text-slate-900 dark:text-white font-sans selection:bg-cyan-500/30 overflow-x-hidden transition-colors duration-500">
      
      {/* 1. BACKGROUND AMBIENCE */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[1200px] h-[1000px] bg-cyan-600/5 rounded-full blur-[250px]"></div>
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-purple-600/5 rounded-full blur-[200px]"></div>
      </div>

      {/* 2. HERO SECTION */}
      <section className="relative pt-32 pb-20 px-6 lg:px-12 min-h-[90vh] flex flex-col items-center justify-center text-center z-10">
        <div className="max-w-5xl mx-auto space-y-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 px-5 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-600 dark:text-cyan-400 text-[11px] font-black uppercase tracking-[0.4em] italic mx-auto"
          >
            <Sparkles size={14} /> Industrial Image-to-Video Engine
          </motion.div>

          <div className="space-y-6">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="text-6xl lg:text-[130px] font-black tracking-tighter uppercase italic leading-[0.8] text-slate-900 dark:text-white"
            >
              Video <br /> <span className="text-cyan-500">Animate.</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="text-xl lg:text-3xl text-slate-500 dark:text-gray-400 font-medium max-w-3xl mx-auto leading-tight italic"
            >
              “Thổi hồn vào mọi điểm ảnh. Khóa định danh nhân vật và tái cấu trúc chuyển động vật lý với độ chính xác tuyệt đối.”
            </motion.p>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-8"
          >
            <button 
              onClick={() => setIsWorkspaceOpen(true)}
              className="bg-cyan-500 text-white dark:text-black px-16 py-8 rounded-full text-sm font-black uppercase tracking-[0.4em] shadow-[0_20px_80px_rgba(6,182,212,0.4)] hover:scale-110 active:scale-95 transition-all flex items-center gap-6 group"
            >
              Mở Studio Chuyên Nghiệp <Zap size={20} fill="currentColor" className="group-hover:rotate-12 transition-transform" />
            </button>
            <button className="px-12 py-8 border border-slate-200 dark:border-white/10 rounded-full text-sm font-black uppercase tracking-[0.4em] text-slate-500 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-all backdrop-blur-md italic">
              Xem Bản Demo 4K
            </button>
          </motion.div>
        </div>
      </section>

      {/* 3. CAPABILITIES GRID */}
      <section className="py-40 bg-slate-50/50 dark:bg-black/20 border-y border-slate-100 dark:border-white/5 relative z-10">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 space-y-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div className="space-y-8">
              <div className="inline-block p-4 bg-cyan-500/10 rounded-2xl text-cyan-500">
                <Activity size={32} />
              </div>
              <h2 className="text-4xl lg:text-6xl font-black uppercase tracking-tighter italic leading-none text-slate-900 dark:text-white">Motion <br /> Transfer.</h2>
              <p className="text-xl text-slate-600 dark:text-gray-400 font-medium leading-relaxed">
                Sử dụng video tham chiếu để áp dụng các chuyển động phức tạp (nhảy múa, hành động, biểu cảm) lên ảnh tĩnh của bạn mà không làm biến dạng cấu trúc nhân vật.
              </p>
              <div className="flex gap-4">
                 {['Frame-Perfect', 'Physical Logic', '60FPS Output'].map(f => (
                   <span key={f} className="px-3 py-1 bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest text-cyan-600 dark:text-cyan-400 italic shadow-sm">{f}</span>
                 ))}
              </div>
            </div>
            <div className="aspect-video bg-black rounded-[2.5rem] border-4 border-cyan-500/20 shadow-3xl overflow-hidden relative group">
               <img src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=1200" className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-[5s]" />
               <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-cyan-500/80 text-white flex items-center justify-center shadow-2xl animate-pulse">
                     <Play size={24} fill="currentColor" className="ml-1" />
                  </div>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div className="aspect-video bg-black rounded-[2.5rem] border-4 border-purple-500/20 shadow-3xl overflow-hidden relative group order-2 lg:order-1">
               <img src="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1200" className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-[5s]" />
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
              <h2 className="text-4xl lg:text-6xl font-black uppercase tracking-tighter italic leading-none text-slate-900 dark:text-white text-right">Face <br /> Swap.</h2>
              <p className="text-xl text-slate-600 dark:text-gray-400 font-medium leading-relaxed text-right">
                Thay thế danh tính một cách mượt mà. Hệ thống AI phân tích 52 điểm mốc trên khuôn mặt để tiêm định danh mới vào video gốc với độ ổn định cao nhất.
              </p>
              <div className="flex gap-4 justify-end">
                 {['Identity Lock', 'Skin Tone Match', 'No Flicker'].map(f => (
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
            <span className="text-[10px] font-black uppercase tracking-[0.6em]">Powered by Skyverses Neural Lattice</span>
         </div>
      </footer>
    </div>
  );
};

export default VideoAnimateAI;
