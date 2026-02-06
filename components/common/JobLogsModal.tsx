
import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Terminal, Activity, Loader2, Cpu, ShieldCheck, Database, RefreshCw } from 'lucide-react';

interface JobLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  status?: 'processing' | 'done' | 'error' | string;
  logs: string[];
}

export const JobLogsModal: React.FC<JobLogsModalProps> = ({ 
  isOpen, 
  onClose, 
  title = "Production Telemetry", 
  subtitle = "Node Process Trace",
  status = "idle",
  logs 
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Tự động cuộn xuống khi có log mới
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 md:p-8">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/90 backdrop-blur-xl"
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 30 }}
        className="relative w-full max-w-2xl h-[600px] bg-[#0c0c0e] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-3xl flex flex-col"
      >
        {/* Terminal Header */}
        <div className="p-8 border-b border-white/5 flex items-center justify-between shrink-0 bg-black/40">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-600/10 rounded-xl flex items-center justify-center text-indigo-500 shadow-inner">
               <Terminal size={20} />
            </div>
            <div className="space-y-1">
               <h3 className="text-xl font-black uppercase italic tracking-tight text-white leading-none">{title}</h3>
               <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest italic">{subtitle}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-red-500 transition-colors bg-white/5 rounded-full"
          >
            <X size={24} />
          </button>
        </div>

        {/* System Bar */}
        <div className="px-8 py-3 bg-indigo-600/5 border-b border-white/5 flex items-center justify-between shrink-0">
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                 <div className={`w-1.5 h-1.5 rounded-full ${status === 'processing' ? 'bg-orange-500 animate-pulse' : status === 'done' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                 <span className="text-[8px] font-black uppercase text-gray-400 tracking-[0.2em]">NODE_{status.toUpperCase()}</span>
              </div>
              <div className="flex items-center gap-2">
                 <Cpu size={12} className="text-indigo-400" />
                 <span className="text-[8px] font-black uppercase text-gray-400 tracking-[0.2em]">H100_CLUSTER_A</span>
              </div>
           </div>
           <div className="flex items-center gap-2">
              <Activity size={12} className="text-brand-blue animate-pulse" />
              <span className="text-[8px] font-black uppercase text-gray-600 tracking-widest">REAL-TIME MONITOR</span>
           </div>
        </div>

        {/* Logs Feed */}
        <div ref={scrollRef} className="flex-grow overflow-y-auto p-8 font-mono text-[13px] leading-relaxed relative bg-black/20 scroll-smooth">
           {/* Scanning line effect */}
           <div className="absolute top-0 left-0 w-full h-[1px] bg-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,1)] animate-[scan_4s_infinite_linear] pointer-events-none"></div>

           <div className="space-y-4">
              {logs && logs.length > 0 ? (
                logs.map((log, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={i} 
                    className="flex gap-4 group"
                  >
                     <span className="text-indigo-600 font-black shrink-0">$</span>
                     <p className="text-zinc-300 group-hover:text-white transition-colors">{log}</p>
                  </motion.div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-20 opacity-20 gap-4">
                  <Database size={48} strokeWidth={1} />
                  <p className="text-gray-600 italic uppercase text-[11px] tracking-widest">No log manifests detected in this session...</p>
                </div>
              )}
              
              {status === 'processing' && (
                <div className="flex gap-4 items-center animate-pulse pt-2">
                   <span className="text-indigo-600 font-black">$</span>
                   <Loader2 size={12} className="animate-spin text-indigo-500" />
                   <p className="text-indigo-500/60 uppercase text-[11px] tracking-widest font-black italic">Awaiting next telemetry packet...</p>
                </div>
              )}
           </div>
        </div>

        {/* Footer HUD */}
        <div className="p-8 border-t border-white/5 bg-black/40 shrink-0 flex items-center justify-between">
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-emerald-500/60">
                 <ShieldCheck size={16} />
                 <span className="text-[10px] font-black uppercase tracking-widest">Privacy_VPC: SECURE</span>
              </div>
           </div>
           <button 
             onClick={onClose}
             className="px-10 py-3 bg-white dark:bg-white/10 text-slate-800 dark:text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-brand-blue hover:text-white transition-all shadow-xl"
           >
              TERMINATE MONITOR
           </button>
        </div>
      </motion.div>
      <style>{`
        @keyframes scan {
          0% { top: 0% }
          100% { top: 100% }
        }
      `}</style>
    </div>
  );
};
