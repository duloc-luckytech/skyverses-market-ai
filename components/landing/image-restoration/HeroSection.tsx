
import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Play, Wand2, Layers, RotateCcw } from 'lucide-react';

interface HeroSectionProps {
  onStartStudio: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onStartStudio }) => {
  return (
    <section className="min-h-screen flex flex-col justify-center px-6 lg:px-12 py-20 relative overflow-hidden">
      {/* Ambient Glow Layer */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-200px] right-[-100px] w-[900px] h-[900px] bg-emerald-500/[0.07] rounded-full blur-[180px] animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute bottom-[-300px] left-[-200px] w-[1000px] h-[1000px] bg-teal-600/[0.05] rounded-full blur-[220px] animate-pulse" style={{ animationDuration: '12s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/[0.03] rounded-full blur-[150px]"></div>
      </div>

      {/* Subtle Grid Pattern */}
      <div className="absolute inset-0 z-0 opacity-[0.015] dark:opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(16,185,129,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.3) 1px, transparent 1px)',
          backgroundSize: '80px 80px'
        }}
      />

      <div className="max-w-[1500px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-20 items-center relative z-10">
        {/* Left Content */}
        <div className="lg:col-span-5 space-y-10 order-2 lg:order-1">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-[0.25em]"
          >
            <Sparkles size={13} className="animate-pulse" /> Neural Restoration Engine v7
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="space-y-6"
          >
            <h1 className="text-5xl sm:text-6xl lg:text-[90px] xl:text-[100px] font-black leading-[0.88] tracking-tighter italic uppercase text-slate-900 dark:text-white">
              Restore <br /> <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">Memories</span> to <br /> 4K Reality.
            </h1>
            <p className="text-lg lg:text-2xl text-slate-500 dark:text-gray-400 font-medium leading-snug border-l-2 border-emerald-500 pl-6 max-w-lg">
              Hệ thống AI chuyên nghiệp phục chế ảnh cũ, mờ, xước thành tuyệt tác 4K sắc nét. Giữ trọn hồn cốt của quá khứ.
            </p>
          </motion.div>

          {/* Stats Row */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex gap-8 pt-2"
          >
            {[
              { value: '4K+', label: 'Max Output' },
              { value: '<5s', label: 'Processing' },
              { value: '98%', label: 'Accuracy' }
            ].map(stat => (
              <div key={stat.label} className="space-y-1">
                <p className="text-2xl lg:text-3xl font-black text-emerald-500 italic tracking-tighter">{stat.value}</p>
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-gray-500">{stat.label}</p>
              </div>
            ))}
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="flex flex-col sm:flex-row gap-5 pt-2"
          >
            <button 
              onClick={onStartStudio}
              className="relative bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-10 py-5 rounded-xl text-[11px] font-black uppercase tracking-[0.35em] shadow-[0_20px_60px_rgba(16,185,129,0.35)] hover:shadow-[0_25px_80px_rgba(16,185,129,0.5)] hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 flex items-center justify-center gap-3.5 group overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
              <Wand2 size={17} />
              Khởi động Studio <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="px-10 py-5 border border-slate-200 dark:border-white/10 rounded-xl text-[11px] font-black uppercase tracking-[0.35em] text-slate-600 dark:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-all bg-white/50 dark:bg-white/[0.02] backdrop-blur-xl flex items-center justify-center gap-3.5 group">
              Xem kết quả mẫu <Play size={14} fill="currentColor" className="group-hover:scale-110 transition-transform" />
            </button>
          </motion.div>
        </div>

        {/* Right Visual — Before/After Showcase */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, x: 30 }} 
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="lg:col-span-7 relative order-1 lg:order-2"
        >
          <div className="aspect-[16/10] bg-slate-50 dark:bg-[#0a0a0c] border border-slate-200 dark:border-white/[0.06] rounded-2xl p-3 sm:p-4 shadow-2xl dark:shadow-[0_20px_80px_rgba(0,0,0,0.6)] overflow-hidden group transition-colors relative">
            {/* Window Controls */}
            <div className="absolute top-5 left-6 z-30 flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400/60"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400/60"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/60"></div>
            </div>
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 px-6 py-1 bg-slate-100/80 dark:bg-white/5 backdrop-blur-md rounded-full">
              <span className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-gray-500">Neural_Core_v7.4 — Active</span>
            </div>
            
            <div className="relative w-full h-full bg-white dark:bg-black rounded-xl border border-emerald-500/10 overflow-hidden">
              {/* Before/After Split */}
              <div className="absolute inset-0 grid grid-cols-2">
                <div className="relative overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1531259683007-016a7b628fc3?auto=format&fit=crop&q=80&w=1600" 
                    className="w-full h-full object-cover grayscale opacity-50 blur-[1px] scale-105" 
                    alt="Damaged photo" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20"></div>
                  <div className="absolute top-6 left-6 px-3 py-1 bg-black/50 backdrop-blur-md rounded-full">
                    <span className="text-[8px] font-black uppercase tracking-[0.3em] text-red-400">Before</span>
                  </div>
                </div>
                <div className="relative overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1531259683007-016a7b628fc3?auto=format&fit=crop&q=100&w=1600" 
                    className="w-full h-full object-cover scale-105" 
                    alt="Restored photo" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-l from-transparent to-black/10"></div>
                  <div className="absolute top-6 right-6 px-3 py-1 bg-emerald-500/80 backdrop-blur-md rounded-full">
                    <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white">Restored</span>
                  </div>
                </div>
              </div>
              
              {/* Center Divider */}
              <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[3px] bg-gradient-to-b from-transparent via-emerald-400 to-transparent z-20 shadow-[0_0_30px_rgba(16,185,129,0.6)]">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.8)]">
                  <RotateCcw size={14} className="text-white" />
                </div>
              </div>
              
              {/* Bottom Info Bar */}
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/80 to-transparent z-30 flex items-end px-6 pb-3 justify-between">
                <div className="flex items-center gap-3">
                  <Layers size={14} className="text-emerald-400" />
                  <span className="text-[9px] font-black text-white/70 uppercase tracking-[0.2em]">Multi-pass Enhancement</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                  <span className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.2em]">4K Ready</span>
                </div>
              </div>
            </div>
          </div>

          {/* Floating Badge */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="absolute -bottom-6 -right-4 lg:-right-8 bg-white dark:bg-[#111215] p-5 rounded-xl shadow-2xl dark:shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-slate-100 dark:border-white/10 hidden md:flex items-center gap-4"
          >
            <div className="w-11 h-11 bg-emerald-500/10 rounded-xl flex items-center justify-center">
              <Wand2 size={20} className="text-emerald-500" />
            </div>
            <div className="space-y-0.5">
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-gray-500">Output_Quality</p>
              <p className="text-xl font-black uppercase italic tracking-tight text-slate-900 dark:text-white">Ultra HD 4K</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
