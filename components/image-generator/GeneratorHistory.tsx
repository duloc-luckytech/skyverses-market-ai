
import React from 'react';
import { History as HistoryIcon } from 'lucide-react';
import { ImageResult } from '../../hooks/useImageGenerator';
import { ImageResultCard } from './ImageResultCard';

interface GeneratorHistoryProps {
  results: ImageResult[];
  selectedIds: string[];
  toggleSelect: (id: string) => void;
  setActivePreviewUrl: (url: string) => void;
  onEdit: (url: string) => void;
  deleteResult: (id: string) => void;
  onDownload: (url: string, filename: string) => void;
}

export const GeneratorHistory: React.FC<GeneratorHistoryProps> = ({
  results, selectedIds, toggleSelect, setActivePreviewUrl, onEdit, deleteResult, onDownload
}) => {
  return (
    <aside className="w-[300px] shrink-0 border-l border-slate-200 dark:border-white/5 bg-white dark:bg-[#0d0d0f] flex flex-col overflow-hidden z-50 transition-all duration-500">
       <div className="h-14 border-b border-slate-200 dark:border-white/5 flex items-center justify-between px-6 shrink-0 bg-slate-50 dark:bg-black/20 transition-colors">
          <div className="flex items-center gap-2">
             <HistoryIcon size={14} className="text-brand-blue" />
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">Lịch sử</span>
          </div>
       </div>

       <div className="flex-grow overflow-y-auto p-4 space-y-4 no-scrollbar">
          {results.map((res) => (
             <ImageResultCard 
               key={res.id} 
               res={res} 
               isSelected={selectedIds.includes(res.id)} 
               onToggleSelect={() => toggleSelect(res.id)} 
               onFullscreen={setActivePreviewUrl}
               onEdit={onEdit}
               onDelete={deleteResult}
               onDownload={onDownload}
             />
          ))}
          {results.length === 0 && (
            <div className="py-20 text-center opacity-10 italic">
              <p className="text-[9px] font-black uppercase text-slate-900 dark:text-white">Chưa có dữ liệu</p>
            </div>
          )}
       </div>
    </aside>
  );
};
