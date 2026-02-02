
import React from 'react';
import { Plus, Upload, FolderOpen, Loader2, Info, Activity } from 'lucide-react';
import { ReferenceItem } from '../../hooks/useImageGenerator';

interface ReferenceImageGridProps {
  references: ReferenceItem[];
  isUploading: boolean;
  tempUrl: string | null;
  onRemove: (index: number) => void;
  onUploadTrigger: () => void;
  onLibraryTrigger: () => void;
}

export const ReferenceImageGrid: React.FC<ReferenceImageGridProps> = ({
  references,
  isUploading,
  tempUrl,
  onRemove,
  onUploadTrigger,
  onLibraryTrigger
}) => {
  const maxRefs = 6;
  const currentCount = references.length + (isUploading ? 1 : 0);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center px-1">
        <label className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest italic">
          ẢNH THAM CHIẾU
        </label>
        <span className="text-[10px] font-bold text-gray-500">{currentCount}/{maxRefs}</span>
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        {/* Render existing references */}
        {references.map((ref, idx) => (
          <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-black/5 dark:border-white/5 group bg-slate-100 dark:bg-black">
            <img src={ref.url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={`Ref ${idx}`} />
            <button 
              onClick={() => onRemove(idx)} 
              className="absolute inset-0 bg-red-500/80 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity z-10"
            >
              <Plus className="rotate-45 text-white" size={20} />
            </button>
          </div>
        ))}
        
        {/* Uploading State Card - Enhanced with Skyverses visual language */}
        {isUploading && (
          <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-brand-blue/40 bg-slate-50 dark:bg-black flex items-center justify-center shadow-[0_0_20px_rgba(0,144,255,0.1)] ring-1 ring-brand-blue/20">
            {tempUrl ? (
              <img src={tempUrl} className="w-full h-full object-cover opacity-30 blur-[2px] scale-110" alt="Uploading" />
            ) : (
              <div className="absolute inset-0 bg-black/20" />
            )}
            
            {/* Loading HUD Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 z-10">
              <div className="relative">
                <Loader2 size={20} className="text-brand-blue animate-spin" />
                <Activity size={10} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-brand-blue/40 animate-pulse" />
              </div>
              <span className="text-[7px] font-black uppercase tracking-[0.2em] text-brand-blue animate-pulse">Syncing</span>
            </div>

            {/* Scanning line animation */}
            <div className="absolute inset-x-0 top-0 h-px bg-brand-blue/50 shadow-[0_0_10px_rgba(0,144,255,1)] animate-[scan_2s_infinite_linear]"></div>
          </div>
        )}

        {/* Empty Slots with Add Actions */}
        {currentCount < maxRefs && (
          <div className="relative aspect-square group">
            <div className="absolute inset-0 border-2 border-dashed border-slate-200 dark:border-white/10 flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-brand-blue transition-all rounded-lg cursor-pointer">
              <Plus size={20} />
            </div>
            <div className="absolute inset-0 bg-white dark:bg-[#1a1a1e] opacity-0 group-hover:opacity-100 transition-all flex flex-col p-1 gap-1 z-10 border border-slate-200 dark:border-white/10 rounded-lg shadow-xl">
              <button 
                onClick={onUploadTrigger} 
                className="flex-grow flex items-center justify-center gap-2 bg-slate-50 dark:bg-white/5 rounded-md hover:bg-brand-blue hover:text-white transition-all text-slate-400 group-hover:text-inherit"
                title="Tải từ thiết bị"
              >
                <Upload size={14} />
              </button>
              <button 
                onClick={onLibraryTrigger} 
                className="flex-grow flex items-center justify-center gap-2 bg-slate-50 dark:bg-white/5 rounded-md hover:bg-brand-blue hover:text-white transition-all text-slate-400 group-hover:text-inherit"
                title="Chọn từ thư viện"
              >
                <FolderOpen size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-start gap-2 px-1">
        <Info size={12} className="text-brand-blue shrink-0 mt-0.5" />
        <p className="text-[9px] text-gray-400 dark:text-gray-600 font-bold uppercase tracking-widest italic leading-relaxed">
          Tải lên tối đa 6 ảnh để hướng dẫn AI về bố cục, màu sắc hoặc nhân vật.
        </p>
      </div>

      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};
