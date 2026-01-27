import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ChevronLeft, Play, Zap, Terminal, 
  X, Layers, Download, Share2, Plus, Sliders,
  Workflow, Target, FileJson, 
  ArrowRight, LayoutGrid, Sparkles,
  CheckCircle2, Clock, Activity, Maximize2, 
  Globe, Heart, Boxes, Network, Code2,
  Film, MousePointer2, Cpu, Search, Filter,
  // Added Database to fix "Cannot find name 'Database'" error
  Database
} from 'lucide-react';
import AetherFlowInterface from '../components/AetherFlowInterface';
import { useLanguage } from '../context/LanguageContext';
import { useAetherFlow, WorkflowTemplate } from '../hooks/useAetherFlow';

const ProductAIAgentWorkflow = () => {
  const { lang } = useLanguage();
  const flow = useAetherFlow();
  const [isStudioOpen, setIsStudioOpen] = useState(false);

  if (isStudioOpen) {
    return (
      <div className="fixed inset-0 z-[500] bg-white dark:bg-[#050505] animate-in fade-in duration-500">
        <div className="h-full flex flex-col">
           <div className="h-16 border-b border-black/10 dark:border-white/5 bg-white/80 dark:bg-black/80 backdrop-blur-xl flex items-center justify-between px-8 shrink-0">
             <div className="flex items-center gap-4">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 italic">SKY_FLOW // Creator_Lattice_v2.0</span>
             </div>
             <button onClick={() => setIsStudioOpen(false)} className="w-10 h-10 border border-black/10 dark:border-white/10 rounded-full flex items-center justify-center text-gray-400 hover:text-black dark:hover:text-white transition-all">
                <X size={18} />
             </button>
          </div>
          <div className="flex-grow overflow-hidden">
             <AetherFlowInterface />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 bg-white dark:bg-[#020203] min-h-screen text-black dark:text-white font-sans overflow-x-hidden transition-colors duration-500 pb-32">
      {/* BACKGROUND LATTICE */}
      <div className="fixed inset-0 pointer-events-none z-0">
         <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_20%,_#10b98108_0%,_transparent_50%)]"></div>
         <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{ backgroundImage: 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)', backgroundSize: '80px 80px' }}></div>
      </div>

      <div className="max-w-[1700px] mx-auto px-6 lg:px-12 relative z-10">
        
        {/* --- HERO SECTION --- */}
        <section className="min-h-[70vh] flex flex-col justify-center py-12 lg:py-20 text-center">
          <div className="max-w-5xl mx-auto space-y-12">
            <Link to="/" className="inline-flex items-center gap-3 px-6 py-2 border border-black/10 dark:border-white/10 text-gray-500 hover:text-emerald-500 transition-all rounded-full bg-white/50 dark:bg-transparent backdrop-blur-md shadow-sm w-fit mx-auto">
              <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">Back_To_Market</span>
            </Link>

            <div className="space-y-8">
               <div className="flex items-center justify-center gap-4 text-emerald-500">
                  <Sparkles size={24} className="animate-pulse" />
                  <span className="text-[14px] font-black uppercase tracking-[0.8em] opacity-60 italic leading-none">Creative Automation</span>
               </div>
               <h1 className="text-6xl lg:text-[140px] font-black uppercase tracking-tighter leading-[0.8] italic drop-shadow-2xl">
                 Create <br /> <span className="text-emerald-500">Masterpieces.</span>
               </h1>
            </div>
            
            <p className="text-xl lg:text-4xl text-gray-500 dark:text-gray-400 font-medium leading-tight max-w-3xl mx-auto italic">
              “Dây chuyền tự động hóa dành cho **Nhà sáng tạo**. Biến kịch bản thô thành Video & Hình ảnh đỉnh cao chỉ bằng 1 cú click.”
            </p>

            <div className="flex flex-col sm:flex-row gap-6 pt-8 justify-center items-center">
               <button 
                 onClick={() => setIsStudioOpen(true)} 
                 className="w-full sm:w-auto bg-emerald-500 text-black px-20 py-8 text-[13px] font-black uppercase tracking-[0.4em] shadow-[0_30px_90px_rgba(16,185,129,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-6 rounded-sm group relative overflow-hidden"
               >
                  <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  Bắt đầu sáng tạo <Play size={20} fill="currentColor" />
               </button>
               <button className="px-12 py-8 border border-black/10 dark:border-white/10 rounded-sm text-[11px] font-black uppercase tracking-[0.3em] hover:bg-black dark:hover:bg-white dark:hover:text-black transition-all italic">
                  Khám phá kịch bản mẫu
               </button>
            </div>
          </div>
        </section>

        {/* --- NEW TEMPLATE EXPLORER BLOCK --- */}
        <section className="py-24 border-t border-black/5 dark:border-white/5 space-y-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4">
               <div className="flex items-center gap-3 text-emerald-500">
                  <LayoutGrid size={24} />
                  <h2 className="text-3xl lg:text-5xl font-black uppercase tracking-tighter italic text-slate-900 dark:text-white">Thư viện <span className="text-emerald-500">Kịch bản.</span></h2>
               </div>
               <p className="text-sm text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest italic opacity-60">Kế thừa hàng nghìn quy trình đã được tối ưu hóa cho Content Creator.</p>
            </div>
            
            <div className="flex items-center gap-4 bg-slate-50 dark:bg-white/5 p-1 rounded-xl border border-black/5 dark:border-white/10">
               <button className="px-6 py-2 bg-white dark:bg-white/10 text-emerald-500 shadow-sm rounded-lg text-[10px] font-black uppercase tracking-widest">Tất cả</button>
               <button className="px-6 py-2 text-gray-500 hover:text-emerald-500 rounded-lg text-[10px] font-black uppercase tracking-widest">Video AI</button>
               <button className="px-6 py-2 text-gray-500 hover:text-emerald-500 rounded-lg text-[10px] font-black uppercase tracking-widest">Ảnh 8K</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {flow.templates.slice(0, 12).map((tmpl, idx) => (
              <motion.div 
                key={tmpl._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="group relative aspect-[3/4] bg-white dark:bg-[#0a0a0c] border border-black/5 dark:border-white/10 rounded-[2.5rem] overflow-hidden shadow-xl hover:border-emerald-500/40 transition-all cursor-pointer"
                onClick={() => { flow.setWorkflowId(tmpl.templateId); setIsStudioOpen(true); }}
              >
                <img 
                  src={tmpl.covers?.[0]?.thumbnailUri || tmpl.covers?.[0]?.url} 
                  className="w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000 group-hover:scale-110" 
                  alt="" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
                
                <div className="absolute top-6 left-6">
                   <div className="flex items-center gap-2 px-3 py-1 bg-black/40 backdrop-blur-md border border-white/10 rounded-full">
                      <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></div>
                      <span className="text-[8px] font-black text-white uppercase tracking-widest">Active_Node</span>
                   </div>
                </div>

                <div className="absolute bottom-8 left-8 right-8 space-y-3">
                   <h4 className="text-2xl font-black uppercase italic tracking-tighter text-white leading-tight">{tmpl.name}</h4>
                   <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest line-clamp-1 italic">"{tmpl.desc || 'Quy trình sản xuất tự động'}"</p>
                   
                   <div className="flex items-center justify-between pt-4 border-t border-white/10">
                      <div className="flex items-center gap-4 text-[8px] font-black text-gray-500 uppercase tracking-widest">
                         <span className="flex items-center gap-1"><Activity size={10}/> {tmpl.statistics.useCount} Users</span>
                      </div>
                      <button className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all shadow-2xl">
                         <ArrowRight size={18} />
                      </button>
                   </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="flex justify-center pt-10">
             <button className="px-16 py-6 border border-black/10 dark:border-white/10 rounded-full text-[11px] font-black uppercase tracking-[0.4em] hover:bg-emerald-500 hover:text-white transition-all italic">
                Xem toàn bộ kho kịch bản
             </button>
          </div>
        </section>

        {/* --- VALUE PROPOSITION: INDUSTRIAL WORKFLOW --- */}
        <section className="py-40 border-t border-black/5 dark:border-white/5 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-24 items-center">
             <div className="lg:col-span-4 space-y-10">
                <div className="space-y-6">
                   <div className="flex items-center gap-4 text-emerald-500">
                      <Code2 size={28} />
                      <span className="text-[11px] font-black uppercase tracking-[0.6em] italic">Creative_Grid_v2.0</span>
                   </div>
                   <h2 className="text-5xl lg:text-8xl font-black uppercase tracking-tighter italic leading-none text-slate-900 dark:text-white">Phòng Lab <br /> <span className="text-emerald-500">Sáng tạo.</span></h2>
                </div>
                <p className="text-lg lg:text-xl text-gray-500 dark:text-gray-400 font-medium leading-relaxed italic border-l-4 border-emerald-500 pl-8">
                  Tận dụng hạ tầng GPU H100 để chạy các quy trình phức tạp nhất. Phục vụ marketing, game studio và các agency dẫn đầu.
                </p>
                <div className="grid grid-cols-1 gap-4 pt-6">
                   {[
                     { t: '100% Quyền sở hữu', d: 'Mọi tài sản bạn tạo ra thuộc về bạn.' },
                     { t: 'Kết xuất 4K/8K', d: 'Chất lượng tối đa cho in ấn và trình chiếu.' },
                     { t: 'Đồng nhất nhân vật', d: 'Khóa định danh khuôn mặt qua mọi cảnh.' }
                   ].map(item => (
                     <div key={item.t} className="flex items-center gap-4 text-slate-600 dark:text-gray-300">
                        <CheckCircle2 size={16} className="text-emerald-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{item.t}</span>
                     </div>
                   ))}
                </div>
             </div>

             <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-px bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 shadow-2xl rounded-sm overflow-hidden">
                {[
                  { step: '01', label: 'Kết nối kịch bản', icon: <Database />, desc: 'Chọn quy trình phù hợp từ hàng nghìn mẫu được xây dựng sẵn bởi chuyên gia.' },
                  { step: '02', label: 'Tùy chỉnh thông số', icon: <Sliders />, desc: 'Nhập yêu cầu, ảnh mỏ neo hoặc kịch bản của riêng bạn vào các khối node trực quan.' },
                  { step: '03', label: 'Tổng hợp Neural', icon: <Cpu />, desc: 'Hệ thống thực thi trên cụm GPU H100, xử lý hàng loạt khung hình trong tích tắc.' },
                  { step: '04', label: 'Xuất bản Master', icon: <Share2 />, desc: 'Nhận thành phẩm chất lượng cao nhất, sẵn sàng cho mọi nền tảng truyền thông.' }
                ].map((item) => (
                  <div key={item.step} className="p-16 bg-white dark:bg-[#08080a] space-y-10 group hover:bg-emerald-500/[0.01] transition-all duration-700 border-r border-black/5 dark:border-white/5 last:border-r-0">
                    <div className="flex justify-between items-start">
                       <span className="text-5xl font-black text-emerald-500 italic opacity-20 group-hover:opacity-100 transition-opacity">{item.step}</span>
                       <div className="p-5 border border-black/10 dark:border-white/10 text-gray-500 group-hover:text-emerald-500 group-hover:border-emerald-500 transition-all rounded-sm shadow-xl bg-slate-50 dark:bg-white/[0.02]">
                          {React.cloneElement(item.icon as React.ReactElement<any>, { size: 24 })}
                       </div>
                    </div>
                    <div className="space-y-4">
                       <h4 className="text-2xl font-black uppercase tracking-tighter italic text-slate-900 dark:text-white">{item.label}</h4>
                       <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed uppercase tracking-widest leading-loose">"{item.desc}"</p>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </section>

        {/* --- FINAL CONVERSION --- */}
        <section className="py-60 text-center relative overflow-hidden bg-emerald-500 rounded-[3rem] shadow-3xl mx-4 transition-all duration-700 group">
           <div className="absolute inset-0 opacity-10 flex flex-wrap gap-4 p-8 pointer-events-none text-[220px] font-black text-white leading-none tracking-tighter select-none italic uppercase">
              CREATE CREATE CREATE CREATE
           </div>
           
           <div className="relative z-10 space-y-16 max-w-4xl mx-auto px-6">
              <h2 className="text-7xl lg:text-[140px] font-black uppercase tracking-tighter leading-[0.8] italic text-white">Let's <br /> <span className="text-black">Build It.</span></h2>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-12 pt-10">
                 <button onClick={() => setIsStudioOpen(true)} className="bg-black text-white px-24 py-8 rounded-full text-sm font-black uppercase tracking-[0.4em] shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center gap-6 group">
                    BẮT ĐẦU NGAY <Zap size={24} fill="currentColor" className="group-hover:rotate-12 transition-transform" />
                 </button>
                 <Link to="/booking" className="px-16 py-8 border-2 border-black/20 text-black hover:bg-black hover:text-white text-sm font-black uppercase tracking-[0.4em] transition-all rounded-full italic">
                    Tư vấn giải pháp B2B
                 </Link>
              </div>
           </div>
        </section>

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
    </div>
  );
};

export default ProductAIAgentWorkflow;
