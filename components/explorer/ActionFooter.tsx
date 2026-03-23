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
    <div className="p-5 border-t border-black/[0.04] dark:border-white/[0.04] shrink-0 space-y-3">
      {/* Primary Action */}
      {is3D ? (
        <button 
          onClick={onOpenStudio}
          className="w-full bg-brand-blue text-white py-3 rounded-xl text-[13px] font-semibold hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
        >
          <Box size={15} /> Mở trong 3D Studio
        </button>
      ) : (
        <button className="w-full bg-brand-blue text-white py-3 rounded-xl text-[13px] font-semibold hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2">
          <RefreshCw size={15} /> Tái tạo từ prompt
        </button>
      )}
      
      {/* Secondary Actions */}
      <div className="grid grid-cols-2 gap-2">
        <button className="py-2.5 bg-slate-50 dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.04] rounded-xl flex items-center justify-center gap-1.5 text-[12px] font-medium text-slate-600 dark:text-gray-300 hover:border-brand-blue/30 transition-all">
          <Video size={13} /> Tạo video
        </button>
        <a 
          href={mediaUrl} download 
          className="py-2.5 bg-slate-50 dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.04] rounded-xl flex items-center justify-center gap-1.5 text-[12px] font-medium text-slate-600 dark:text-gray-300 hover:border-brand-blue/30 transition-all"
        >
          <Download size={13} /> Tải xuống
        </a>
        <button 
          onClick={() => isUpscaleSupported && onUpscale()}
          disabled={!isUpscaleSupported}
          className={`py-2.5 border border-black/[0.04] dark:border-white/[0.04] rounded-xl flex items-center justify-center gap-1.5 text-[12px] font-medium transition-all ${
            isUpscaleSupported 
            ? 'bg-slate-50 dark:bg-white/[0.03] text-slate-600 dark:text-gray-300 hover:border-brand-blue/30' 
            : 'bg-slate-50 dark:bg-white/[0.01] text-slate-300 dark:text-gray-600 cursor-not-allowed'
          }`}
        >
          <Maximize2 size={13} /> Upscale
        </button>
        <button className="py-2.5 bg-slate-50 dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.04] rounded-xl flex items-center justify-center gap-1.5 text-[12px] font-medium text-slate-600 dark:text-gray-300 hover:border-brand-blue/30 transition-all">
          <Edit3 size={13} /> Chỉnh sửa
        </button>
      </div>
    </div>
  );
};

export default ActionFooter;
