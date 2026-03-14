
import React from 'react';
import { RefreshCw, Video, Download, Maximize2, Edit3, Box } from 'lucide-react';

interface ActionFooterProps {
  mediaUrl: string;
  type: string;
  onUpscale: () => void;
  onOpenStudio?: () => void;
}

const ActionFooter: React.FC<ActionFooterProps> = ({ mediaUrl, type, onUpscale, onOpenStudio }) => {
  const isUpscaleSupported = type === 'image' || type === 'video' || type === 'text_video' || type === 'image_video';
  const is3D = type === 'game_asset_3d';

  return (
    <div className="p-8 border-t border-black/5 dark:border-white/5 bg-slate-50 dark:bg-black/40 shrink-0 space-y-4 transition-colors">
      {is3D ? (
        <button 
          onClick={onOpenStudio}
          className="w-full bg-brand-blue text-white py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] shadow-[0_15px_40px_rgba(0,144,255,0.2)] hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-4 italic group"
        >
          <Box size={16} strokeWidth={3} className="group-hover:scale-110 transition-transform duration-300" /> MỞ TRONG 3D STUDIO
        </button>
      ) : (
        <button className="w-full bg-[#dfff1a] text-black py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] shadow-[0_15px_40px_rgba(223,255,26,0.2)] hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-4 italic group">
          <RefreshCw size={16} strokeWidth={3} className="group-hover:rotate-180 transition-transform duration-700" /> TÁI TỔNG HỢP Ý TƯỞNG
        </button>
      )}
      
      <div className="grid grid-cols-2 gap-3">
        <button className="p-4 bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl flex items-center justify-center gap-3 text-[9px] font-black uppercase tracking-widest text-slate-700 dark:text-white hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-black transition-all shadow-sm">
          <Video size={14} /> TẠO CHUYỂN ĐỘNG
        </button>
        <a 
          href={mediaUrl} 
          download 
          className="p-4 bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl flex items-center justify-center gap-3 text-[9px] font-black uppercase tracking-widest text-slate-700 dark:text-white hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-black transition-all shadow-sm"
        >
          <Download size={14} /> TẢI XUỐNG GỐC
        </a>
        <button 
          onClick={() => isUpscaleSupported && onUpscale()}
          disabled={!isUpscaleSupported}
          className={`p-4 border border-black/10 dark:border-white/10 rounded-xl flex items-center justify-center gap-3 text-[9px] font-black uppercase tracking-widest transition-all shadow-sm ${
            isUpscaleSupported 
            ? 'bg-white dark:bg-white/5 text-slate-700 dark:text-white hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-black' 
            : 'bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-50'
          }`}
        >
          <Maximize2 size={14} /> NÂNG CẤP (UPSCALE)
        </button>
        <button className="p-4 bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl flex items-center justify-center gap-3 text-[9px] font-black uppercase tracking-widest text-slate-700 dark:text-white hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-black transition-all shadow-sm">
          <Edit3 size={14} /> CHỈNH SỬA (EDIT)
        </button>
      </div>
    </div>
  );
};

export default ActionFooter;
