
import React from 'react';
import { Plus, Upload, FolderOpen, Loader2, Info } from 'lucide-react';
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
        
        {/* Uploading Skeleton State */}
        {isUploading && (
          <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-dashed border-brand-blue/30 bg-slate-50 dark:bg-white/5 animate-pulse flex items-center justify-center">
            {tempUrl && (
              <img src={tempUrl} className="w-full h-full object-cover opacity-50 blur-[1px]" alt="Uploading" />
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-black/10">
              <Loader2 size={18} className="text-brand-blue animate-spin" />
            </div>
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
    </div>
  );
};
