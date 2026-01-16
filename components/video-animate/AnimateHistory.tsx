
import React from 'react';
import { motion } from 'framer-motion';
import { History as HistoryIcon, LayoutGrid, ChevronUp, ChevronDown, RefreshCw, Loader2, Film, Play, Trash2, Database, AlertCircle, Zap } from 'lucide-react';
import { RenderTask } from '../../hooks/useVideoAnimate';

interface Props {
  tasks: RenderTask[];
  isExpanded: boolean;
  setIsExpanded: (v: boolean) => void;
  processingCount: number;
  onDelete: (id: string) => void;
}

export const AnimateHistory: React.FC<Props> = ({ tasks, isExpanded, setIsExpanded, processingCount, onDelete }) => {
  const isHistoryVisible = isExpanded || processingCount > 0;

  return (
    <>
      {!isHistoryVisible && (
        <button 
          onClick={() => setIsExpanded(true)}
          className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] px-10 py-4 bg-white/90 dark:bg-[#111]/90 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-full text-[11px] font-black uppercase tracking-[0.4em] hover:bg-cyan-600 hover:text-white transition-all shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom-8 text-slate-700 dark:text-white group"
        >
          <HistoryIcon size={16} className="group-hover:rotate-180 transition-transform duration-700" /> 
          Lịch sử sản xuất <ChevronUp size={16} className="animate-bounce" />
        </button>
      )}

      <motion.div 
        initial={{ y: 240 }} 
        animate={{ y: isHistoryVisible ? 0 : 240 }}
        className="fixed bottom-0 left-0 right-0 h-64 bg-white/95 dark:bg-[#0c0c0c]/95 backdrop-blur-3xl border-t border-slate-200 dark:border-white/10 z-[100] p-8 shadow-[0_-20px_100px_rgba(0,0,0,0.2)] dark:shadow-[0_-20px_100px_rgba(0,0,0,0.6)] transition-all duration-500"
      >
         <div className="max-w-[1500px] mx-auto flex flex-col gap-8">
            <div className="flex items-center justify-between">
               <div 
                 className="flex items-center gap-8 cursor-pointer group/title"
                 onClick={() => setIsExpanded(!isExpanded)}
               >
                  <div className="flex items-center gap-4">
                     <div className="p-2 bg-cyan-500/10 rounded-lg">
                        <LayoutGrid size={24} className={`transition-colors ${isExpanded ? 'text-cyan-500' : 'text-slate-400'}`} />
                     </div>
                     <div className="space-y-0.5">
                        <h3 className="text-lg font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">Registry Vault</h3>
                        <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest leading-none">Hồ sơ kết xuất video</p>
                     </div>
                  </div>
                  
                  {processingCount > 0 && (
                     <div className="flex items-center gap-3 px-5 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full">
                        <RefreshCw size={14} className="text-cyan-500 animate-spin" />
                        <span className="text-[10px] font-black text-cyan-600 dark:text-cyan-500 uppercase tracking-[0.2em]">{processingCount} ĐANG TỔNG HỢP...</span>
                     </div>
                  )}
               </div>
               
               <div className="flex gap-4">
                  <button 
                    onClick={() => setIsExpanded(!isExpanded)}
                    className={`px-8 py-3 border border-slate-200 dark:border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-white/10 transition-all flex items-center gap-3 ${isExpanded ? 'text-cyan-500 border-cyan-500/30' : 'text-slate-500 dark:text-gray-400'}`}
                  >
                    {isExpanded ? 'Thu gọn' : 'Mở rộng'} 
                    {isExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                  </button>
               </div>
            </div>

            <div className="flex gap-6 overflow-x-auto no-scrollbar pb-6 pt-2">
               {tasks.length > 0 ? tasks.map((task) => (
                  <div key={task.id} className="relative group shrink-0 w-44 aspect-[3/4.2] bg-slate-50 dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-md transition-all hover:border-cyan-500/50">
                     {task.thumb ? (
                       <img src={task.thumb} className={`w-full h-full object-cover grayscale opacity-40 transition-all duration-700 ${task.status === 'processing' ? 'blur-[2px]' : 'group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110'}`} alt="" />
                     ) : (
                       <div className="w-full h-full flex items-center justify-center opacity-10 bg-slate-200 dark:bg-black text-slate-900 dark:text-white"><Film size={32}/></div>
                     )}
                     
                     {task.status === 'completed' && task.url && (
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                           <Play size={32} className="text-white fill-current" />
                        </div>
                     )}

                     <div className="absolute top-4 left-4">
                        <span className={`px-3 py-1 rounded-md text-[8px] font-black uppercase text-white shadow-xl ${task.type === 'MOTION' ? 'bg-cyan-500' : 'bg-purple-600'}`}>
                           {task.type}
                        </span>
                     </div>

                     {task.status === 'processing' && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-white/60 dark:bg-black/60 backdrop-blur-sm">
                           <Loader2 size={32} className="text-cyan-500 animate-spin" />
                           <span className="text-[8px] font-black text-slate-800 dark:text-white uppercase tracking-[0.4em] text-center px-4 animate-pulse">Neural Synthesis...</span>
                        </div>
                     )}

                     {task.status === 'error' && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-red-900/40 backdrop-blur-md">
                           <AlertCircle size={32} className="text-red-500" />
                           <span className="text-[9px] font-black text-red-100 uppercase text-center px-4">Node Failure</span>
                        </div>
                     )}

                     <div className="absolute bottom-0 inset-x-0 p-4 bg-white/90 dark:bg-black/80 border-t border-slate-200 dark:border-white/5 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 flex justify-between items-center transition-colors">
                        <div className="space-y-1 overflow-hidden">
                           <p className="text-[9px] font-black text-slate-800 dark:text-white/80 truncate uppercase italic leading-none">{task.model}</p>
                           <p className="text-[7px] font-bold text-gray-500 uppercase leading-none">{task.timestamp}</p>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); onDelete(task.id); }} className="p-2 text-slate-400 dark:text-white/40 hover:text-red-500 transition-colors bg-white/5 rounded-full"><Trash2 size={12}/></button>
                     </div>
                  </div>
               )) : (
                  <div className="w-full h-36 flex flex-col items-center justify-center opacity-10 border-2 border-dashed border-slate-200 dark:border-white/20 rounded-[2rem] transition-colors">
                     <Database size={48} strokeWidth={1} className="text-slate-900 dark:text-white" />
                     <span className="text-xs font-black uppercase mt-4 tracking-[0.5em] italic text-slate-900 dark:text-white">Registry Empty</span>
                  </div>
               )}
            </div>
         </div>
      </motion.div>
    </>
  );
};
