
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ChevronLeft, Play, Zap, ShieldCheck, 
  Sparkles, ArrowRight, Home, LayoutGrid,
  Maximize2, Activity, ImageIcon,
  Palette, Scan, User, Database, Building2
} from 'lucide-react';
import RealEstateWorkspace from '../../components/RealEstateWorkspace';
import { useLanguage } from '../../context/LanguageContext';

const RealEstateAI: React.FC = () => {
  const { lang } = useLanguage();
  const [isStudioOpen, setIsStudioOpen] = useState(false);

  if (isStudioOpen) {
    return (
      <div className="fixed inset-0 z-[500] bg-black animate-in fade-in duration-500">
        <RealEstateWorkspace onClose={() => setIsStudioOpen(false)} />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#050507] min-h-screen text-slate-900 dark:text-white font-sans selection:bg-purple-500/30 overflow-x-hidden pt-20 transition-colors duration-500">
      
      {/* 1. HERO SECTION */}
      <section className="min-h-screen flex flex-col justify-center px-6 lg:px-12 py-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[1200px] h-[1000px] bg-purple-600/5 dark:bg-purple-600/10 rounded-full blur-[250px] pointer-events-none"></div>
        
        <div className="max-w-[1500px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center relative z-10">
          <div className="lg:col-span-6 space-y-10 order-2 lg:order-1">
            <motion.div 
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 text-[10px] font-black uppercase tracking-[0.2em]"
            >
              <Sparkles size={14} /> Industrial AI Real Estate Solutions
            </motion.div>
            
            <div className="space-y-6">
              <h1 className="text-6xl lg:text-[100px] font-black leading-[0.85] tracking-tighter italic uppercase text-slate-900 dark:text-white">
                Kiến tạo <br /> <span className="text-purple-600 dark:text-purple-500">Không gian</span> ảo.
              </h1>
              <p className="text-xl lg:text-3xl text-slate-500 dark:text-gray-400 font-medium leading-tight border-l-2 border-purple-500 pl-8">
                Biến những căn nhà trống thành tuyệt tác nội thất hoặc cải tạo kiến trúc cũ nát chỉ trong vài giây bằng trí tuệ nhân tạo.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 pt-4">
              <button 
                onClick={() => setIsStudioOpen(true)}
                className="bg-purple-600 text-white px-12 py-6 rounded-sm text-xs font-black uppercase tracking-[0.4em] shadow-[0_20px_80px_rgba(168,85,247,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4 group"
              >
                Khởi chạy Studio <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-12 py-6 border border-slate-200 dark:border-white/10 rounded-sm text-xs font-black uppercase tracking-[0.4em] text-slate-600 dark:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-all backdrop-blur-md flex items-center justify-center gap-4">
                Xem Showreel <Play size={16} fill="currentColor" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 relative order-1 lg:order-2">
             <div className="aspect-[4/3] bg-slate-50 dark:bg-[#0a0a0c] border border-slate-200 dark:border-white/5 rounded-[2rem] p-4 shadow-3xl relative overflow-hidden transition-colors flex flex-col justify-center items-center group">
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 to-transparent"></div>
                <div className="relative z-10 w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-white dark:border-white/10">
                   <div className="absolute inset-0 grid grid-cols-2">
                      <img src="https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover grayscale opacity-40 blur-sm" alt="Before" />
                      <img src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover" alt="After" />
                   </div>
                   <div className="absolute inset-y-0 left-1/2 w-0.5 bg-purple-500 shadow-[0_0_20px_rgba(168,85,247,1)] z-20"></div>
                   <div className="absolute bottom-6 left-6 right-6 p-4 bg-black/60 backdrop-blur-md border border-white/10 rounded-xl">
                      <p className="text-[10px] font-black uppercase tracking-widest text-purple-400 mb-1">Active Renovation</p>
                      <h4 className="text-xl font-black uppercase italic leading-none">VIRTUAL_STAGING_v4.2</h4>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* 2. CAPABILITIES GRID */}
      <section className="py-40 border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-[#08080a] transition-colors">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center space-y-4 mb-24">
             <h2 className="text-4xl lg:text-6xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white transition-colors">Giải pháp cho Realtors & Designers</h2>
             <p className="text-slate-400 dark:text-gray-500 uppercase text-[10px] font-black tracking-[0.5em]">Identity Persistence // Multi-Modal Architecture</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-slate-200 dark:bg-white/5 border border-slate-200 dark:border-white/5 shadow-3xl">
            {[
              { t: 'Virtual Staging', i: <Home size={24}/>, d: 'Tự động thêm nội thất vào các căn hộ trống một cách tự nhiên và thẩm mỹ.' },
              { t: 'Interior Renovation', i: <Palette size={24}/>, d: 'Cải tạo toàn bộ phong cách nội thất từ ảnh chụp hiện trạng thô sơ.' },
              { t: 'Architectural Style', i: <Building2 size={24}/>, d: 'Thay đổi diện mạo bên ngoài của công trình theo các phong cách kiến trúc hiện đại.' },
              { t: 'Spatial Accuracy', i: <Scan size={24}/>, d: 'Duy trì cấu trúc không gian và tỷ lệ vật lý chính xác của căn phòng gốc.' },
              { t: '8K Render Depth', i: <Maximize2 size={24}/>, d: 'Kết xuất hình ảnh chất lượng siêu cao, sẵn sàng cho in ấn banner quảng cáo.' },
              { t: 'VPC Privacy', i: <ShieldCheck size={24}/>, d: 'Dữ liệu bất động sản của bạn được bảo mật tuyệt đối trong môi trường private.' }
            ].map((f, i) => (
              <div key={i} className="p-16 bg-white dark:bg-black space-y-8 group hover:bg-purple-500/[0.02] transition-all duration-500 border-r border-slate-50 dark:border-white/5 last:border-r-0">
                 <div className="w-14 h-14 border border-slate-100 dark:border-white/10 flex items-center justify-center text-slate-400 group-hover:text-purple-600 transition-colors rounded-sm shadow-sm">
                    {f.i}
                 </div>
                 <div className="space-y-3">
                    <h4 className="text-2xl font-black uppercase tracking-tighter italic text-slate-900 dark:text-white transition-colors">{f.t}</h4>
                    <p className="text-sm text-gray-500 font-medium leading-relaxed uppercase tracking-widest leading-loose">"{f.d}"</p>
                 </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. FINAL CALL TO ACTION */}
      <section className="py-60 text-center relative overflow-hidden bg-white dark:bg-black transition-colors">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] bg-purple-500/5 rounded-full blur-[250px] pointer-events-none"></div>
        <div className="max-w-4xl mx-auto space-y-16 relative z-10 px-6">
           <h2 className="text-7xl lg:text-[140px] font-black uppercase tracking-tighter leading-[0.8] italic text-slate-900 dark:text-white transition-colors">Thiết lập <br /> <span className="text-purple-600 dark:text-purple-500">Tương lai.</span></h2>
           <button onClick={() => setIsStudioOpen(true)} className="bg-slate-900 dark:bg-white text-white dark:text-black px-24 py-8 rounded-full text-sm font-black uppercase tracking-[0.6em] shadow-[0_40px_100px_rgba(168,85,247,0.2)] hover:scale-110 active:scale-95 transition-all flex items-center gap-6 mx-auto group">
              Truy cập AI Studio <Zap size={24} fill="currentColor" />
           </button>
        </div>
      </section>

    </div>
  );
};

export default RealEstateAI;
