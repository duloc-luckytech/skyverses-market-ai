import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { History as HistoryIcon, Loader2, Sparkles, Database, Wand2 } from 'lucide-react';
import { ImageResult } from '../../hooks/useImageGenerator';
import { ImageResultCard } from './ImageResultCard';

interface ExplorerItem {
  _id: string;
  thumbnailUrl: string;
  mediaUrl: string;
  title: string;
  prompt: string;
}

interface GeneratorHistoryProps {
  results: ImageResult[];
  selectedIds: string[];
  toggleSelect: (id: string) => void;
  setActivePreviewUrl: (url: string) => void;
  onEdit: (url: string) => void;
  deleteResult: (id: string) => void;
  onDownload: (url: string, filename: string) => void;
  onUsePrompt: (prompt: string) => void;
  // Added onRetry property to satisfy ImageResultCard requirements
  onRetry: (res: ImageResult) => void;
}

export const GeneratorHistory: React.FC<GeneratorHistoryProps> = ({
  results, selectedIds, toggleSelect, setActivePreviewUrl, onEdit, deleteResult, onDownload, onUsePrompt, onRetry
}) => {
  const [explorerItems, setExplorerItems] = useState<ExplorerItem[]>([]);
  const [loadingExplorer, setLoadingExplorer] = useState(true);

  useEffect(() => {
    const fetchExplorer = async () => {
      try {
        const res = await fetch('https://api.skyverses.com/explorer?page=1&limit=10&type=image');
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setExplorerItems(json.data);
        }
      } catch (err) {
        console.error("Explorer fetch error:", err);
      } finally {
        setLoadingExplorer(false);
      }
    };
    fetchExplorer();
  }, []);

  return (
    <aside className="w-[320px] shrink-0 border-l border-slate-200 dark:border-white/5 bg-white dark:bg-[#0d0d0f] flex flex-col overflow-hidden z-50 transition-all duration-500 shadow-2xl">
       {/* Tab Selector Header */}
       <div className="h-14 border-b border-slate-200 dark:border-white/5 flex items-center px-6 shrink-0 bg-slate-50 dark:bg-black/20">
          <div className="flex items-center gap-2">
             <Sparkles size={14} className="text-brand-blue" />
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">Community Explore</span>
          </div>
       </div>

       <div className="flex-grow overflow-y-auto no-scrollbar p-4 space-y-6">
          {/* Section 1: Explore (Inspiration) */}
          <div className="space-y-4">
             <div className="flex items-center gap-2 px-1">
                <div className="w-1 h-3 bg-brand-blue"></div>
                <span className="text-[9px] font-black uppercase text-gray-500 tracking-widest">Gợi ý sáng tạo</span>
             </div>
             
             {loadingExplorer ? (
                <div className="py-10 flex flex-col items-center justify-center gap-3 opacity-40">
                   <Loader2 className="animate-spin text-brand-blue" size={20} />
                   <p className="text-[8px] font-black uppercase tracking-widest">Syncing Nodes...</p>
                </div>
             ) : (
                <div className="space-y-4">
                   {explorerItems.map(item => (
                      <div key={item._id} className="group relative bg-slate-50 dark:bg-white/[0.02] border border-black/5 dark:border-white/5 rounded-2xl overflow-hidden transition-all hover:border-brand-blue/30 shadow-sm">
                         <div className="aspect-[16/10] overflow-hidden relative">
                            <img src={item.thumbnailUrl} className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" alt="" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <button 
                              onClick={() => onUsePrompt(item.prompt)}
                              className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                            >
                               <div className="bg-brand-blue text-white px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest shadow-2xl scale-90 group-hover:scale-100 transition-transform flex items-center gap-2">
                                  <Wand2 size={12} /> Sử dụng Prompt
                               </div>
                            </button>
                         </div>
                         <div className="p-3 space-y-1">
                            <p className="text-[9px] font-black text-slate-800 dark:text-white/80 uppercase truncate italic leading-tight">"{item.title}"</p>
                            <p className="text-[7px] text-gray-400 font-bold uppercase tracking-widest">Verified Synthesis</p>
                         </div>
                      </div>
                   ))}
                </div>
             )}
          </div>

          {/* Section 2: Session History */}
          {results.length > 0 && (
            <div className="space-y-4 pt-6 border-t border-black/5 dark:border-white/5">
               <div className="flex items-center gap-2 px-1">
                  <div className="w-1 h-3 bg-purple-500"></div>
                  <span className="text-[9px] font-black uppercase text-gray-500 tracking-widest">Lịch sử phiên này</span>
               </div>
               <div className="space-y-4">
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
                      // Passed onRetry to satisfy ImageResultCard requirements
                      onRetry={() => onRetry(res)}
                    />
                  ))}
               </div>
            </div>
          )}
       </div>

       {/* System Footer */}
       <div className="p-4 border-t border-black/5 dark:border-white/5 bg-slate-50 dark:bg-black/20 shrink-0">
          <div className="flex items-center gap-3 text-[8px] font-black uppercase text-gray-400 italic">
             <Database size={10} />
             <span>Registry Sync: Active</span>
          </div>
       </div>
    </aside>
  );
};
