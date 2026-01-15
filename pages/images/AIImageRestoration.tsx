
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ChevronLeft, Play, Zap, ShieldCheck, 
  Sparkles, ArrowRight, Upload, 
  Maximize2, Activity, ImageIcon,
  Clock, ShieldAlert, CheckCircle2,
  // Fix: Added missing User icon
  Settings2, Eraser, Palette, Scan, User
} from 'lucide-react';
import RestorationWorkspace from '../../components/RestorationWorkspace';
import { useLanguage } from '../../context/LanguageContext';

const AIImageRestoration = () => {
  const { lang } = useLanguage();
  const [isStudioOpen, setIsStudioOpen] = useState(false);

  if (isStudioOpen) {
    return (
      <div className="fixed inset-0 z-[500] bg-white dark:bg-black animate-in fade-in duration-500">
        <RestorationWorkspace onClose={() => setIsStudioOpen(false)} />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#020203] min-h-screen text-slate-900 dark:text-white font-sans selection:bg-emerald-500/30 overflow-x-hidden pt-20 transition-colors duration-500">
      
      {/* 1. HERO SECTION */}
      <section className="min-h-screen flex flex-col justify-center px-6 lg:px-12 py-20 relative">
        <div className="absolute inset-0 z-0 opacity-40 dark:opacity-20 pointer-events-none">
           <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-emerald-500/10 rounded-full blur-[200px]"></div>
           <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[200px]"></div>
        </div>

        <div className="max-w-[1500px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center relative z-10">
          <div className="lg:col-span-5 space-y-10 order-2 lg:order-1">
            <motion.div 
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em]"
            >
              <Sparkles size={14} /> Professional Image Restoration
            </motion.div>
            
            <div className="space-y-6">
              <h1 className="text-6xl lg:text-[100px] font-black leading-[0.85] tracking-tighter italic uppercase text-slate-900 dark:text-white">
                Restore <br /> <span className="text-emerald-500">Memories</span> to <br /> 4K Reality.
              </h1>
              <p className="text-xl lg:text-3xl text-slate-500 dark:text-gray-400 font-medium leading-tight border-l-2 border-emerald-500 pl-8">
                Hệ thống AI chuyên nghiệp phục chế ảnh cũ, mờ, xước thành tuyệt tác 4K sắc nét. Giữ trọn hồn cốt của quá khứ.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 pt-4">
              <button 
                onClick={() => setIsStudioOpen(true)}
                className="bg-emerald-600 text-white px-12 py-6 rounded-sm text-[12px] font-black uppercase tracking-[0.4em] shadow-[0_20px_80px_rgba(16,185,129,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4 group"
              >
                Khởi động Studio <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-12 py-6 border border-slate-200 dark:border-white/10 rounded-sm text-[12px] font-black uppercase tracking-[0.4em] text-slate-600 dark:text-white hover:bg-slate-50 dark:hover:bg-white/10 transition-all bg-white/5 dark:bg-white/5 backdrop-blur-md flex items-center justify-center gap-4">
                Xem kết quả mẫu <Play size={16} fill="currentColor" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 relative order-1 lg:order-2">
             <div className="aspect-[16/10] bg-slate-50 dark:bg-[#0a0a0c] border border-slate-200 dark:border-white/5 rounded-sm p-4 shadow-3xl overflow-hidden group transition-colors">
                <div className="relative w-full h-full bg-white dark:bg-black rounded-sm border border-emerald-500/10 overflow-hidden flex items-center justify-center transition-colors">
                   <div className="absolute inset-0 grid grid-cols-2">
                      <img 
                        src="https://images.unsplash.com/photo-1531259683007-016a7b628fc3?auto=format&fit=crop&q=80&w=1600" 
                        className="w-full h-full object-cover grayscale opacity-40 blur-sm" 
                        alt="Old" 
                      />
                      <img 
                        src="https://images.unsplash.com/photo-1531259683007-016a7b628fc3?auto=format&fit=crop&q=100&w=1600" 
                        className="w-full h-full object-cover" 
                        alt="Restored" 
                      />
                   </div>
                   <div className="absolute inset-y-0 left-1/2 w-1 bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.8)] z-20"></div>
                   <div className="absolute bottom-8 left-8 space-y-2 z-30">
                      <h3 className="text-3xl font-black italic uppercase tracking-tighter leading-none text-white drop-shadow-lg">Neural Restoration</h3>
                      <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.4em] italic">Vision_Core_v7.4_Active</p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS */}
      <section className="py-40 bg-slate-50 dark:bg-[#070708] border-y border-slate-100 dark:border-white/5 transition-colors">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center space-y-4 mb-24">
             <h2 className="text-4xl lg:text-6xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">The Restoration Path</h2>
             <p className="text-slate-400 dark:text-gray-500 uppercase text-[10px] font-black tracking-[0.5em]">Upload → Analyze → Synchronize</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { s: '01', t: 'Tải ảnh cũ', d: 'Tải lên các tấm ảnh bị mờ, xước, đen trắng hoặc độ phân giải thấp từ kho lưu trữ của bạn.', i: <Upload /> },
              { s: '02', t: 'AI Phân tích', d: 'Neural Core nhận diện các điểm lỗi, nhiễu hạt và các chi tiết khuôn mặt cần phục hồi.', i: <Scan /> },
              { s: '03', t: 'Kết xuất 4K', d: 'Hệ thống tổng hợp lại pixel, khử nhiễu và nâng cấp độ phân giải lên 4K sắc nét tuyệt đối.', i: <Maximize2 /> }
            ].map((step, i) => (
              <div key={i} className="p-12 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-sm relative group hover:border-emerald-500/30 transition-all shadow-sm">
                <div className="absolute top-4 right-8 text-5xl font-black italic text-black/[0.03] dark:text-white/5 group-hover:text-emerald-500/10 transition-colors">{step.s}</div>
                <div className="w-16 h-16 bg-emerald-500/5 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-10 rounded-sm group-hover:scale-110 transition-transform">
                   {React.cloneElement(step.i as React.ReactElement<any>, { size: 28 })}
                </div>
                <h4 className="text-2xl font-black uppercase italic tracking-tight mb-4 text-slate-900 dark:text-white">{step.t}</h4>
                <p className="text-gray-500 dark:text-gray-400 leading-relaxed font-bold uppercase text-xs tracking-widest leading-loose">"{step.d}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. CORE FEATURES */}
      <section className="py-40 border-t border-slate-100 dark:border-white/5 bg-white dark:bg-black transition-colors">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 space-y-24">
           <h2 className="text-4xl lg:text-6xl font-black uppercase tracking-tighter italic text-center text-slate-900 dark:text-white">Technical Mastery</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-slate-200 dark:bg-white/5 border border-slate-200 dark:border-white/5 shadow-2xl">
              {[
                { t: 'Face Enhancement', i: <User />, d: 'Khôi phục chân dung với độ chính xác tuyệt đối, giữ nguyên đặc điểm nhận dạng.' },
                { t: 'Scratch Removal', i: <Eraser />, d: 'Tự động xóa bỏ các vết xước, nếp gấp và vết ố bẩn của thời gian.' },
                { t: 'Color Synthesis', i: <Palette />, d: 'Chế độ AI thông minh tự động lên màu cho ảnh đen trắng một cách tự nhiên.' },
                { t: 'Noise Reduction', i: <Activity />, d: 'Loại bỏ hiện tượng nhiễu hạt (grain) và các lỗi nén kỹ thuật số.' },
                { t: '8K Upscaling', i: <Maximize2 />, d: 'Nâng cấp kích thước ảnh lên gấp 8 lần mà không làm vỡ hình.' },
                { t: 'Industrial Speed', i: <Zap />, d: 'Xử lý phục chế ảnh chỉ trong chưa đầy 5 giây nhờ cụm H100 GPU.' },
                { t: 'Privacy Vault', i: <ShieldCheck />, d: 'Dữ liệu cá nhân của bạn được bảo mật tuyệt đối trong mạng riêng ảo VPC.' },
                { t: 'History Sync', i: <Clock />, d: 'Lưu trữ lịch sử phục chế đồng bộ trên mọi thiết bị trong Cloud Registry.' }
              ].map((f, i) => (
                <div key={i} className="p-12 bg-white dark:bg-[#0a0a0c] space-y-6 hover:bg-emerald-500/[0.02] transition-all duration-500 border-r border-slate-50 dark:border-white/5 last:border-r-0">
                   <div className="text-emerald-600 dark:text-emerald-400 opacity-60 group-hover:opacity-100 transition-colors">
                      {React.cloneElement(f.i as React.ReactElement<any>, { size: 24 })}
                   </div>
                   <div className="space-y-2">
                      <h4 className="text-lg font-black uppercase tracking-widest italic text-slate-900 dark:text-white">{f.t}</h4>
                      <p className="text-[11px] text-slate-500 dark:text-gray-500 font-bold uppercase leading-relaxed tracking-tighter leading-loose">"{f.d}"</p>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* 4. FINAL CTA */}
      <section className="py-60 text-center relative overflow-hidden bg-white dark:bg-black border-t border-slate-100 dark:border-white/5 transition-colors">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] bg-emerald-500/5 rounded-full blur-[250px] pointer-events-none"></div>
        <div className="max-w-4xl mx-auto space-y-16 relative z-10">
          <h2 className="text-7xl lg:text-[140px] font-black uppercase tracking-tighter leading-[0.8] italic text-slate-900 dark:text-white">Save the <br /> <span className="text-emerald-500">History.</span></h2>
          <div className="space-y-10 pt-10">
            <button 
              onClick={() => setIsStudioOpen(true)}
              className="bg-emerald-600 text-white px-24 py-8 rounded-sm text-sm font-black uppercase tracking-[0.6em] shadow-[0_40px_100px_rgba(16,185,129,0.4)] hover:scale-110 active:scale-95 transition-all flex items-center gap-6 mx-auto group"
            >
              Phục chế ngay <Zap size={24} fill="currentColor" />
            </button>
            <p className="text-slate-500 dark:text-gray-500 font-black uppercase tracking-[0.5em] text-[10px] italic">Universal Credit Ready • 4K/8K Output • Instant Export</p>
          </div>
        </div>
      </section>

    </div>
  );
};

export default AIImageRestoration;
