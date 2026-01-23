
import React from 'react';
import { 
  Home, ChevronDown, CloudUpload, Loader2, LayoutGrid, Palette, 
  Maximize2, ImageIcon, Activity, Lightbulb 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { MODES, ROOM_TYPES, STYLES } from '../../hooks/useRealEstateAI';

interface SidebarControlsProps {
  s: any;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

export const SidebarControls: React.FC<SidebarControlsProps> = ({ s, fileInputRef }) => {
  const labelStyle = "text-[10px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest mb-2 flex items-center gap-2 px-1";
  const selectStyle = "w-full bg-slate-50 dark:bg-[#16161a] border border-slate-200 dark:border-white/10 rounded-lg p-3 text-xs font-bold text-slate-800 dark:text-white outline-none focus:border-purple-500/50 transition-all appearance-none cursor-pointer shadow-sm";

  return (
    <div className="flex-grow overflow-y-auto no-scrollbar p-8 space-y-10">
      {/* Header & Toggle */}
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-600/10 dark:bg-purple-600/20 border border-purple-500/20 dark:border-purple-500/30 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400 shadow-sm">
              <Home size={22} />
            </div>
            <h2 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white leading-none">BẤT ĐỘNG SẢN AI</h2>
          </div>
          <p className="text-[9px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest pl-1">Thiết kế & Kiến trúc ảo</p>
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
            <span className="text-[10px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest text-center px-4">TẢI LÊN ẢNH HIỆN TRẠNG</span>
          </>
        )}
        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={s.handleUpload} />
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
    </div>
  );
};
