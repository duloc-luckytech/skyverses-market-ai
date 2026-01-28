import React from 'react';
import { motion } from 'framer-motion';
import { 
  X, Play, Share2, RefreshCw, Trash2, 
  Info, Clock, Zap, CheckCircle2, 
  MoreHorizontal, PlayCircle,
  // Added missing imports to fix compilation errors
  LayoutGrid, Maximize2
} from 'lucide-react';

interface TaskItem {
  id: string;
  title: string;
  status: 'generating' | 'completed' | 'failed';
  time: string;
  taskId: string;
  mode: string;
  runtime: string;
  expiry: string;
  progress?: number;
  duration?: string;
  imageUrl?: string;
}

const MOCK_TASKS: TaskItem[] = [
  {
    id: '1',
    title: '全能图片V1 Pro详情页生成PS...',
    status: 'generating',
    time: '05:17',
    taskId: '2016364442807312386',
    mode: 'Standard',
    runtime: 'N/A',
    expiry: 'N/A',
    progress: 40
  },
  {
    id: '2',
    title: 'HeartMuLa文生歌曲...',
    status: 'completed',
    time: '2026-01-27 10:35:19',
    taskId: '2015991084051730434',
    mode: 'Standard',
    runtime: '03:34',
    expiry: '13 days',
    duration: '01:59'
  },
  {
    id: '3',
    title: 'Basic Text-to-Image',
    status: 'completed',
    time: '2026-01-26 14:08:54',
    taskId: '2015683135030829058',
    mode: 'Standard',
    runtime: '00:51',
    expiry: '13 days',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800'
  }
];

export const TaskListSidebar: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <motion.aside
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      className="w-[400px] h-full bg-white dark:bg-[#111114] border-l border-black/5 dark:border-white/5 flex flex-col shrink-0 z-[150] shadow-2xl transition-colors"
    >
      <div className="p-6 border-b border-black/5 dark:border-white/5 flex items-center justify-between bg-slate-50 dark:bg-black/20">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-500">
            <LayoutGrid size={18} />
          </div>
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Task List</h3>
        </div>
        <button onClick={onClose} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
          <X size={20} />
        </button>
      </div>

      <div className="p-4 bg-slate-100 dark:bg-white/[0.02] border-b border-black/5 dark:border-white/5">
        <p className="text-[10px] font-bold text-gray-500 dark:text-zinc-500 italic uppercase tracking-tight">
          Tips: Preview node output image not in task list.
        </p>
      </div>

      <div className="flex-grow overflow-y-auto no-scrollbar p-5 space-y-6">
        {MOCK_TASKS.map((task) => (
          <div key={task.id} className="p-5 bg-white dark:bg-[#0a0a0c] border border-black/5 dark:border-white/10 rounded-2xl space-y-4 hover:border-indigo-500/30 transition-all shadow-sm">
            <div className="flex justify-between items-start">
               <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-[8px] font-black uppercase rounded-sm flex items-center gap-1">
                    <Zap size={8} fill="currentColor" /> AI Standard
                  </span>
                  <h4 className="text-[11px] font-black text-slate-800 dark:text-zinc-100 uppercase italic truncate max-w-[180px]">{task.title}</h4>
               </div>
               {task.status !== 'generating' && (
                 <button className="text-[9px] font-black text-red-500 uppercase hover:underline">Delete</button>
               )}
            </div>

            <div className="space-y-1">
               <p className={`text-[10px] font-black uppercase ${task.status === 'generating' ? 'text-emerald-500 animate-pulse' : 'text-gray-400'}`}>
                 {task.status === 'generating' ? `Generating ${task.time}` : task.time}
               </p>
               <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[9px] font-bold text-gray-500 dark:text-zinc-600 uppercase tracking-widest">
                  <p>taskid: {task.taskId}</p>
                  <p>Runtime Mode: {task.mode}</p>
                  <p>Run time: {task.runtime}</p>
                  <p className="text-orange-500/70">Expires in {task.expiry}</p>
               </div>
            </div>

            {task.duration && (
              <div className="space-y-3 pt-2">
                 <div className="flex items-center gap-4">
                    <button className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-700 dark:text-white">
                      <Play size={14} fill="currentColor" className="ml-0.5" />
                    </button>
                    <div className="flex-grow h-1 bg-slate-200 dark:bg-white/10 rounded-full relative">
                       <div className="absolute top-0 left-0 h-full w-1/3 bg-indigo-500"></div>
                    </div>
                    <span className="text-[9px] font-mono font-bold text-gray-500">00:00 / {task.duration}</span>
                 </div>
              </div>
            )}

            {task.imageUrl && (
              <div className="aspect-video rounded-xl overflow-hidden border border-black/5 dark:border-white/10 relative group">
                <img src={task.imageUrl} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <button className="p-2 bg-white/10 backdrop-blur-md rounded-full text-white"><Maximize2 size={16} /></button>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-black/5 dark:border-white/5">
               <div className="flex gap-4">
                  <button className="flex items-center gap-1.5 text-[9px] font-black text-gray-500 hover:text-indigo-500 uppercase transition-all">
                    <Share2 size={12} /> Share
                  </button>
                  <button className="flex items-center gap-1.5 text-[9px] font-black text-gray-500 hover:text-indigo-500 uppercase transition-all">
                    <RefreshCw size={12} /> Regenerate
                  </button>
               </div>
               <button className="p-1.5 text-gray-400 hover:text-white">
                  <MoreHorizontal size={14} />
               </button>
            </div>
          </div>
        ))}
      </div>
    </motion.aside>
  );
};