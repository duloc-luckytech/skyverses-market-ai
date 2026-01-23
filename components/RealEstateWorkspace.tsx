
import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Upload, Play, Zap, Loader2, Sparkles, 
  Home, Armchair, ChevronDown, Lock, ShieldCheck, 
  Activity, CloudUpload, Lightbulb, ImageIcon,
  Maximize2, Download, Share2, Settings,
  LayoutGrid, Palette
} from 'lucide-react';
import { useRealEstateAI, MODES, ROOM_TYPES, STYLES } from '../hooks/useRealEstateAI';

const RealEstateWorkspace: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const s = useRealEstateAI();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const labelStyle = "text-[10px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest mb-2 flex items-center gap-2 px-1";
  const selectStyle = "w-full bg-slate-50 dark:bg-[#16161a] border border-slate-200 dark:border-white/10 rounded-lg p-3 text-xs font-bold text-slate-800 dark:text-white outline-none focus:border-purple-500/50 transition-all appearance-none cursor-pointer shadow-sm";

  return (
    <div className="h-full w-full flex bg-[#fcfcfd] dark:bg-[#0c0c0e] text-slate-900 dark:text-white font-sans overflow-hidden transition-colors duration-500">
      
      {/* SIDEBAR ĐIỀU KHIỂN (TRÁI) */}
      <aside className="w-full md:w-[380px] shrink-0 border-r border-slate-200 dark:border-white/5 bg-white dark:bg-[#0d0e12] flex flex-col overflow-y-auto no-scrollbar shadow-2xl relative z-20 transition-colors">
        <div className="p-8 space-y-10">
           {/* Header & Toggle */}
           <div className="flex justify-between items-start">
              <div className="space-y-1">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-600/10 dark:bg-purple-600/20 border border-purple-500/20 dark:border-purple-500/30 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400 shadow-sm">
                       <Home size={22} />
                    </div>
                    <h2 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">BẤT ĐỘNG SẢN AI</h2>
                 </div>
                 <p className="text-[9px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest pl-1">Thiết kế nội thất & Kiến trúc ảo</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                 <div 
                   className={`w-12 h-6 rounded-full relative transition-colors cursor-pointer border ${s.faceLock ? 'bg-purple-600 border-purple-500' : 'bg-slate-200 dark:bg-gray-800 border-slate-300 dark:border-white/10'}`} 
                   onClick={() => s.setFaceLock(!s.faceLock)}
                 >
                    <motion.div animate={{ x: s.faceLock ? 24 : 2 }} className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg" />
                 </div>
                 <span className="text-[7px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-widest">FACE LOCK</span>
              </div>
           </div>

           {/* UPLOAD AREA */}
           <div 
             onClick={() => fileInputRef.current?.click()}
             className="aspect-video rounded-xl border-2 border-dashed border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/40 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-purple-500/40 transition-all group overflow-hidden relative shadow-inner"
           >
              {s.isUploading ? (
                <Loader2 className="animate-spin text-purple-500" size={32} />
              ) : s.sourceImage ? (
                <img src={s.sourceImage} className="w-full h-full object-cover" alt="Source" />
              ) : (
                <>
                  <CloudUpload size={32} className="text-purple-500/50 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest">TẢI LÊN ẢNH PHÒNG/NHÀ</span>
                </>
              )}
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={s.handleUpload} />
           </div>

           {/* ENGINE DISPLAY */}
           <div className="bg-slate-50 dark:bg-[#16161a] border border-slate-200 dark:border-white/5 p-4 rounded-xl flex justify-between items-center group hover:border-purple-500/20 transition-all shadow-sm">
              <div className="flex items-center gap-3">
                 <Zap size={14} className="text-purple-500" fill="currentColor" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-500">ENGINE:</span>
              </div>
              <span className="text-[11px] font-black text-slate-800 dark:text-white italic tracking-tight">Gemini 2.5 Flash</span>
           </div>

           {/* SELECTORS */}
           <div className="space-y-6">
              <div className="space-y-2">
                 <label className={labelStyle}><LayoutGrid size={12}/> CHẾ ĐỘ</label>
                 <div className="relative">
                    <select value={s.mode} onChange={e => s.setMode(e.target.value)} className={selectStyle}>
                       {MODES.map(m => <option key={m}>{m}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                 </div>
              </div>

              <div className="space-y-2">
                 <label className={labelStyle}><Home size={12}/> LOẠI PHÒNG</label>
                 <div className="relative">
                    <select value={s.roomType} onChange={e => s.setRoomType(e.target.value)} className={selectStyle}>
                       {ROOM_TYPES.map(rt => <option key={rt}>{rt}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                 </div>
              </div>

              <div className="space-y-2">
                 <label className={labelStyle}><Palette size={12}/> PHONG CÁCH</label>
                 <div className="relative">
                    <select value={s.style} onChange={e => s.setStyle(e.target.value)} className={selectStyle}>
                       {STYLES.map(st => <option key={st}>{st}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                 </div>
              </div>

              <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-white/5">
                 <label className={labelStyle}><Maximize2 size={12}/> TỶ LỆ KHUNG HÌNH</label>
                 <div className="relative">
                    <select value={s.aspectRatio} onChange={e => s.setAspectRatio(e.target.value)} className={selectStyle}>
                       <option>Giữ nguyên</option>
                       <option>1:1 (Vuông)</option>
                       <option>16:9 (Ngang)</option>
                       <option>9:16 (Dọc)</option>
                    </select>
                    <ImageIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 dark:text-gray-500 pointer-events-none" />
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                 </div>
              </div>
           </div>

           {/* ADDITIONAL PROMPT */}
           <div className="space-y-4">
              <div className="flex justify-between items-center px-1">
                 <label className={labelStyle}><Activity size={12}/> YÊU CẦU BỔ SUNG</label>
                 <button className="flex items-center gap-1 text-[9px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest hover:brightness-125 transition-all">
                    <Lightbulb size={12} /> Gợi ý
                 </button>
              </div>
              <textarea 
                value={s.extraPrompt} onChange={e => s.setExtraPrompt(e.target.value)}
                className="w-full h-32 bg-slate-50 dark:bg-[#16161a] border border-slate-200 dark:border-white/10 rounded-xl p-4 text-[13px] font-medium focus:border-purple-500/50 outline-none transition-all resize-none text-slate-700 dark:text-gray-300 placeholder:text-slate-300 dark:placeholder:text-gray-700 shadow-inner" 
                placeholder="Nhập thêm yêu cầu đặc biệt..."
              />
           </div>

           {/* GENERATE BUTTON */}
           <div className="pt-4 pb-12">
              <button 
                onClick={s.handleGenerate}
                disabled={s.isGenerating || !s.sourceImage}
                className={`w-full py-6 rounded-2xl font-black uppercase text-xs tracking-[0.4em] shadow-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-4 group ${s.sourceImage ? 'bg-purple-600 text-white hover:brightness-110 shadow-purple-600/20' : 'bg-slate-200 dark:bg-gray-800 text-slate-400 dark:text-gray-600 cursor-not-allowed'}`}
              >
                 {s.isGenerating ? <Loader2 className="animate-spin" size={20}/> : <Zap size={18} fill="currentColor" />}
                 KHỞI CHẠY TỔNG HỢP
              </button>
           </div>
        </div>
      </aside>

      {/* VIEWPORT HIỂN THỊ (PHẢI) */}
      <main className="flex-grow flex flex-col relative bg-[#f8f9fa] dark:bg-[#020202] transition-colors duration-500">
         <header className="h-14 border-b border-slate-200 dark:border-white/5 bg-white/80 dark:bg-black/40 flex items-center justify-between px-8 backdrop-blur-xl z-30 shrink-0">
            <div className="flex items-center gap-4">
               <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse shadow-[0_0_8px_#a855f7]"></div>
               <span className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500 dark:text-gray-400 italic">KẾT QUẢ TỔNG HỢP</span>
            </div>
            <div className="flex items-center gap-2">
               <button className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors" title="Cài đặt hệ thống"><Settings size={18}/></button>
               <div className="w-px h-6 bg-slate-200 dark:bg-white/10 mx-2"></div>
               <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-500 transition-colors bg-black/5 dark:bg-white/5 rounded-full"><X size={18} /></button>
            </div>
         </header>

         <div className="flex-grow flex items-center justify-center p-8 lg:p-20 relative">
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #a855f7 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
            
            <AnimatePresence mode="wait">
               {s.resultImage ? (
                  <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="relative group max-w-5xl w-full aspect-video bg-white dark:bg-black rounded-xl overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.1)] dark:shadow-[0_0_150px_rgba(168,85,247,0.15)] border border-slate-200 dark:border-white/10">
                     <img src={s.resultImage} className="w-full h-full object-cover" alt="Render result" />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10"></div>
                     <div className="absolute top-6 right-6 flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 z-20">
                        <button className="p-4 bg-white/90 dark:bg-black/80 backdrop-blur-md rounded-full shadow-2xl text-slate-800 dark:text-white hover:bg-brand-blue hover:text-white transition-all"><Share2 size={20}/></button>
                        <a href={s.resultImage} download={`skyverses_real_estate_${Date.now()}.png`} className="p-4 bg-white text-black rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center"><Download size={20}/></a>
                     </div>
                     <div className="absolute bottom-6 left-6 z-30 opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
                        <div className="flex gap-2">
                           <span className="px-3 py-1 bg-purple-600 text-white text-[9px] font-black uppercase tracking-widest rounded-sm shadow-xl italic">NEURAL RENDER v2.5</span>
                           <span className="px-3 py-1 bg-black/60 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest rounded-sm border border-white/10">8K ULTRA HD</span>
                        </div>
                     </div>
                  </motion.div>
               ) : s.isGenerating ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-12 text-center relative z-10">
                     <div className="relative">
                        <Loader2 size={120} className="text-purple-500 animate-spin" strokeWidth={1} />
                        <Sparkles size={40} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-purple-400 animate-pulse" />
                     </div>
                     <div className="space-y-4">
                        <p className="text-xl font-black uppercase tracking-[0.6em] animate-pulse italic text-slate-800 dark:text-white">ĐANG TỔNG HỢP KHÔNG GIAN...</p>
                        <p className="text-[10px] font-bold text-slate-400 dark:text-gray-600 uppercase tracking-widest">Architect Node #042 // Neural Lattice</p>
                     </div>
                  </motion.div>
               ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} className="text-center space-y-12 flex flex-col items-center select-none cursor-default">
                     <div className="w-32 h-32 rounded-[2.5rem] border-4 border-dashed border-slate-300 dark:border-white/20 flex items-center justify-center">
                        <Armchair size={80} strokeWidth={1} className="text-slate-400 dark:text-white" />
                     </div>
                     <h3 className="text-3xl font-black uppercase tracking-[0.6em] italic leading-none text-slate-800 dark:text-white">MAGIC AI ENGINE</h3>
                  </motion.div>
               )}
            </AnimatePresence>
         </div>

         {/* STATUS BAR BOTTOM */}
         <div className="h-12 border-t border-slate-200 dark:border-white/5 bg-white dark:bg-black px-8 flex items-center justify-between shrink-0 transition-colors z-30 shadow-2xl">
            <div className="flex items-center gap-8 text-[9px] font-black uppercase text-slate-400 dark:text-gray-600 tracking-widest italic">
               <div className="flex items-center gap-2 text-purple-500"><ShieldCheck size={14}/> Node Secure</div>
               <div className="flex items-center gap-2"><Maximize2 size={14}/> Full Perspective 8K</div>
            </div>
            <div className="flex items-center gap-2">
               <span className="text-[9px] font-black text-slate-300 dark:text-gray-700">CLUSTER: H100_ALPHA_V7_STABLE</span>
            </div>
         </div>
      </main>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default RealEstateWorkspace;
