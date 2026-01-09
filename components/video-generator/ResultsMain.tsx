
import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Download, LayoutGrid, Film, Bot 
} from 'lucide-react';
import { VideoCard, VideoResult } from './VideoCard';

interface ResultsMainProps {
  activeTab: 'SESSION' | 'LIBRARY';
  setActiveTab: (tab: 'SESSION' | 'LIBRARY') => void;
  autoDownload: boolean;
  setAutoDownload: (val: boolean) => void;
  zoomLevel: number;
  setZoomLevel: (val: number) => void;
  results: VideoResult[];
  isGenerating: boolean;
  selectedVideoIds: string[];
  toggleSelect: (id: string) => void;
  setFullscreenVideo: (video: {url: string, hasSound: boolean, id: string} | null) => void;
  deleteResult: (id: string) => void;
  handleRetry: (res: VideoResult) => void;
  triggerDownload: (url: string, filename: string) => void;
  handleDownloadAllDone: () => void;
  todayKey: string;
}

export const ResultsMain: React.FC<ResultsMainProps> = ({
  activeTab, setActiveTab, autoDownload, setAutoDownload, zoomLevel, setZoomLevel,
  results, isGenerating, selectedVideoIds, toggleSelect, setFullscreenVideo,
  deleteResult, handleRetry, triggerDownload, handleDownloadAllDone, todayKey
}) => {
  const groupedResults = useMemo(() => {
    return results.reduce((acc, res) => {
      const key = res.dateKey || todayKey;
      if (!acc[key]) acc[key] = [];
      acc[key].push(res);
      return acc;
    }, {} as Record<string, VideoResult[]>);
  }, [results, todayKey]);

  const sortedDateKeys = useMemo(() => Object.keys(groupedResults).sort((a, b) => b.localeCompare(a)), [groupedResults]);
  const processingCount = results.filter(r => r.status === 'processing').length;

  return (
    <main className="flex-grow flex flex-col bg-slate-100 dark:bg-[#050505] relative overflow-hidden transition-all duration-500">
      {/* HUD Header */}
      <div className="h-16 border-b border-slate-200 dark:border-white/5 bg-white/80 dark:bg-[#0d0d0f]/80 backdrop-blur-xl flex items-center justify-between px-8 shrink-0 z-40">
        <div className="flex bg-slate-200/50 dark:bg-white/5 p-1.5 rounded-lg border border-slate-100 dark:border-white/5">
          <button 
            onClick={() => setActiveTab('SESSION')} 
            className={`px-8 py-2 text-[11px] font-black uppercase rounded-full transition-all ${activeTab === 'SESSION' ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
          >
            Phiên hiện tại
          </button>
          <button 
            onClick={() => setActiveTab('LIBRARY')} 
            className={`px-8 py-2 text-[11px] font-black uppercase rounded-full transition-all ${activeTab === 'LIBRARY' ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
          >
            Bộ sưu tập
          </button>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-3 bg-black/5 dark:bg-white/5 px-4 py-1.5 rounded-full border border-black/5 dark:border-white/10">
            <span className="text-[9px] font-black uppercase text-gray-500 dark:text-gray-400">Tự động tải</span>
            <button 
              onClick={() => setAutoDownload(!autoDownload)}
              className={`w-8 h-4 rounded-full relative transition-colors ${autoDownload ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-700'}`}
            >
              <motion.div 
                animate={{ left: autoDownload ? 18 : 2 }}
                className="absolute top-0.5 w-3 h-3 bg-white rounded-full shadow-sm" 
              />
            </button>
          </div>

          <button 
            onClick={handleDownloadAllDone}
            className="hidden sm:flex items-center gap-2 px-4 py-1.5 bg-purple-600 text-white rounded-full text-[9px] font-black uppercase hover:brightness-110 shadow-lg"
          >
            <Download size={14} /> Tải tất cả
          </button>

          <div className="hidden md:flex items-center gap-3 border-l border-black/10 dark:border-white/10 pl-6">
            <LayoutGrid size={16} className="text-slate-400 dark:text-gray-600" />
            <input 
              type="range" min="1" max="10" 
              value={zoomLevel} 
              onChange={e => setZoomLevel(parseInt(e.target.value))} 
              className="w-24 h-1 bg-slate-200 dark:bg-white/5 appearance-none rounded-full accent-purple-600" 
            />
          </div>
        </div>
      </div>

      {/* Results Grid */}
      <div className="flex-grow overflow-y-auto p-6 md:p-12 no-scrollbar pb-32 lg:pb-12">
        <div className="max-w-[1600px] mx-auto space-y-12">
          <AnimatePresence mode="popLayout">
            {(groupedResults[todayKey]?.length > 0 || processingCount > 0) && (
              <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                <div className="flex items-center gap-4">
                  <Calendar size={18} className="text-purple-500" />
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white italic">Hôm nay<span className="ml-2 text-slate-400 dark:text-gray-500 italic">({groupedResults[todayKey]?.length || 0})</span></h3>
                  <div className="h-px flex-grow bg-slate-200 dark:bg-white/5"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                   {groupedResults[todayKey]?.map(res => (
                     <VideoCard 
                       key={res.id} 
                       res={res} 
                       isSelected={selectedVideoIds.includes(res.id)} 
                       onToggleSelect={() => toggleSelect(res.id)} 
                       onFullscreen={(url, hasSound, id) => setFullscreenVideo({url, hasSound, id})} 
                       onDelete={deleteResult} 
                       onRetry={handleRetry}
                       onDownload={triggerDownload}
                     />
                   ))}
                </div>
              </motion.div>
            )}

            {sortedDateKeys.filter(date => date !== todayKey).map(dateKey => (
              <motion.div layout key={dateKey} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                <div className="flex items-center gap-4">
                  <Calendar size={18} className="text-purple-500" />
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white italic">{groupedResults[dateKey][0]?.displayDate || dateKey}<span className="ml-2 text-slate-400 dark:text-gray-500 italic">({groupedResults[dateKey].length})</span></h3>
                  <div className="h-px flex-grow bg-slate-200 dark:bg-white/5"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                   {groupedResults[dateKey].map(res => (
                     <VideoCard 
                       key={res.id} 
                       res={res} 
                       isSelected={selectedVideoIds.includes(res.id)} 
                       onToggleSelect={() => toggleSelect(res.id)} 
                       onFullscreen={(url, hasSound, id) => setFullscreenVideo({url, hasSound, id})} 
                       onDelete={deleteResult} 
                       onRetry={handleRetry}
                       onDownload={triggerDownload}
                     />
                   ))}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {results.length === 0 && !isGenerating && (
            <div className="h-full flex flex-col items-center justify-center opacity-10 space-y-8 select-none pt-24">
              <Film size={100} strokeWidth={1} className="text-slate-900 dark:text-white" />
              <h3 className="text-4xl font-black uppercase tracking-[0.5em] italic text-slate-900 dark:text-white">Vault Empty</h3>
            </div>
          )}
        </div>
      </div>

      {/* Footer Decoration */}
      <div className="absolute bottom-24 lg:bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30 pointer-events-none z-0">
         <div className="flex items-center gap-2">
            <img src="https://framerusercontent.com/images/GyMtocumMA0iElsHB6CRyb2GQ.png?width=366&height=268" className="w-5 h-5 object-contain" alt="" />
            <span className="text-[10px] font-black uppercase tracking-widest">Developed by Skyverses</span>
         </div>
         <p className="text-[8px] font-bold uppercase">Industrial Video Production Engine</p>
      </div>

      <button className="absolute bottom-24 lg:bottom-10 right-10 w-16 h-16 bg-[#1a3a4a] rounded-full flex items-center justify-center shadow-2xl z-[100] border border-white/10 group">
        <Bot size={32} className="text-cyan-400 group-hover:rotate-12 transition-transform" />
      </button>
    </main>
  );
};
