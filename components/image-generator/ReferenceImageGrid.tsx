import React, { useCallback } from 'react';
import { Plus, Upload, FolderOpen, Loader2, GripVertical } from 'lucide-react';
import { ReferenceItem } from '../../hooks/useImageGenerator';

interface ReferenceImageGridProps {
  references: ReferenceItem[];
  isUploading: boolean;
  tempUrl: string | null;
  onRemove: (index: number) => void;
  onUploadTrigger: () => void;
  onLibraryTrigger: () => void;
  onFileDrop?: (file: File) => void;
}

export const ReferenceImageGrid: React.FC<ReferenceImageGridProps> = ({
  references, isUploading, tempUrl, onRemove, onUploadTrigger, onLibraryTrigger, onFileDrop
}) => {
  const maxRefs = 6;
  const currentCount = references.length + (isUploading ? 1 : 0);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files.length > 0 && onFileDrop) {
      const file = files[0];
      if (file.type.startsWith('image/')) onFileDrop(file);
    }
  }, [onFileDrop]);

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center px-0.5">
        <p className="text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Ảnh tham chiếu</p>
        <span className="text-[9px] font-medium text-slate-400 dark:text-slate-500">{currentCount}/{maxRefs}</span>
      </div>
      <p className="text-[8px] text-slate-400 dark:text-slate-500 px-0.5 leading-relaxed">💡 Tải ảnh mẫu để AI tham chiếu phong cách, bố cục hoặc chủ thể. Có thể để trống.</p>

      <div
        className="grid grid-cols-3 gap-1.5"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {references.map((ref, idx) => (
          <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-black/[0.06] dark:border-white/[0.04] group bg-slate-100 dark:bg-black">
            <img src={ref.url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={`Ref ${idx}`} />
            {/* Weight badge */}
            <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-black/60 backdrop-blur-md rounded text-[7px] font-semibold text-white/60">
              #{idx + 1}
            </div>
            <button
              onClick={() => onRemove(idx)}
              className="absolute inset-0 bg-red-500/70 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
            >
              <Plus className="rotate-45 text-white" size={16} />
            </button>
          </div>
        ))}

        {isUploading && (
          <div className="relative aspect-square rounded-lg overflow-hidden border border-dashed border-rose-500/30 bg-white/[0.02] animate-pulse flex items-center justify-center">
            {tempUrl && <img src={tempUrl} className="w-full h-full object-cover opacity-40 blur-[1px]" alt="Uploading" />}
            <div className="absolute inset-0 flex items-center justify-center"><Loader2 size={14} className="text-rose-400 animate-spin" /></div>
          </div>
        )}

        {currentCount < maxRefs && (
          <div className="relative aspect-square group">
            <div className="absolute inset-0 border border-dashed border-black/[0.08] dark:border-white/[0.06] rounded-lg flex flex-col items-center justify-center text-slate-400 dark:text-[#444] hover:border-rose-500/30 transition-all cursor-pointer gap-1">
              <Plus size={14} />
              <span className="text-[7px] font-medium">Drag & Drop</span>
            </div>
            <div className="absolute inset-0 bg-[#1a1a1e] opacity-0 group-hover:opacity-100 transition-all flex flex-col p-0.5 gap-0.5 z-10 border border-white/[0.08] rounded-lg shadow-xl">
              <button onClick={onUploadTrigger} className="flex-grow flex items-center justify-center gap-1 bg-white/[0.04] rounded text-[#666] hover:bg-rose-500 hover:text-white transition-all text-[8px]">
                <Upload size={10} /> Tải lên
              </button>
              <button onClick={onLibraryTrigger} className="flex-grow flex items-center justify-center gap-1 bg-white/[0.04] rounded text-[#666] hover:bg-rose-500 hover:text-white transition-all text-[8px]">
                <FolderOpen size={10} /> Thư viện
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
