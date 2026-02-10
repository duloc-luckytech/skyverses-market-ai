
import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Terminal, Activity, Loader2, Cpu, ShieldCheck, Database, Clock, Copy, Check, AlertTriangle } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface JobLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  status?: 'processing' | 'done' | 'error' | string;
  logs: string[];
  jobId?: string;
}

export const JobLogsModal: React.FC<JobLogsModalProps> = ({ 
  isOpen, 
  onClose, 
  title = "Production Telemetry", 
  subtitle = "Node Process Trace",
  status = "idle",
  logs,
  jobId
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const handleCopyId = () => {
    if (!jobId) return;
    navigator.clipboard.writeText(jobId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReport = () => {
    if (!jobId) return;
    showToast(`Báo cáo lỗi đã được gửi cho Job ID: ${jobId.toUpperCase()}. Đội ngũ kỹ thuật sẽ kiểm tra ngay lập tức.`, 'warning');
  };

  if (!isOpen) return null;

  // Helper to get current time for log steps
  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('vi-VN', { hour12: false });
  };

  // Helper to parse log level and assign colors
  const getLogStyle = (log: string) => {
    const upperLog = log.toUpperCase();
    
    if (upperLog.includes('[ERROR]') || upperLog.includes('[FAIL]') || upperLog.includes('[CRITICAL]')) {
      return { 
        text: 'text-red-600 dark:text-red-400', 
        badge: 'bg-red-500/10 text-red-500 border-red-500/20' 
      };
    }
    if (upperLog.includes('[SUCCESS]') || upperLog.includes('[DONE]') || upperLog.includes('[COMPLETED]')) {
      return { 
        text: 'text-emerald-600 dark:text-emerald-400', 
        badge: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
      };
    }
    if (upperLog.includes('[STATUS]') || upperLog.includes('[POLLING]') || upperLog.includes('[AWAITING]')) {
      return { 
        text: 'text-amber-600 dark:text-amber-400', 
        badge: 'bg-amber-500/10 text-amber-500 border-amber-500/20' 
      };
    }
    if (upperLog.includes('[SYSTEM]') || upperLog.includes('[UPLINK]') || upperLog.includes('[NODE]') || upperLog.includes('[API]')) {
      return { 
        text: 'text-brand-blue dark:text-blue-400', 
        badge: 'bg-brand-blue/10 text-brand-blue border-brand-blue/20' 
      };
    }
    
    return { 
      text: 'text-slate-700 dark:text-zinc-300', 
      badge: 'bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-gray-500 border-black/5 dark:border-white/5' 
    };
  };

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 md:p-8">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 dark:bg-black/90 backdrop-blur-xl"
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 30 }}
        className="relative w-full max-w-2xl h-[600px] bg-white dark:bg-[#0c0c0e] border border-black/10 dark:border-white/10 rounded-[2.5rem] overflow-hidden shadow-3xl flex flex-col transition-colors duration-500"
      >
        {/* Terminal Header */}
        <div className="p-6 md:p-8 border-b border-black/5 dark:border-white/5 flex items-center justify-between shrink-0 bg-slate-50 dark:bg-black/40">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-10 h-10 bg-indigo-600/10 rounded-xl flex items-center justify-center text-indigo-600 shadow-inner shrink-0">
               <Terminal size={20} />
            </div>
            <div className="space-y-1 min-w-0">
               <h3 className="text-xl font-black uppercase italic tracking-tight text-slate-900 dark:text-white leading-none truncate">{title}</h3>
               <div className="flex items-center gap-2">
                  <p className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest italic truncate">{subtitle}</p>
                  {jobId && (
                    <div className="flex items-center gap-1.5 shrink-0 ml-1">
                      <span className="text-[8px] font-mono text-indigo-500 dark:text-indigo-400 bg-indigo-500/5 px-2 py-0.5 rounded border border-indigo-500/10">
                        ID: {jobId.length > 12 ? `${jobId.slice(0, 8)}...` : jobId.toUpperCase()}
                      </span>
                      <button 
                        onClick={handleCopyId}
                        className="p-1 text-slate-400 hover:text-indigo-500 transition-colors"
                        title="Copy Job ID"
                      >
                        {copied ? <Check size={10} className="text-emerald-500" /> : <Copy size={10} />}
                      </button>
                    </div>
                  )}
               </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-red-500 transition-colors bg-black/5 dark:bg-white/5 rounded-full shrink-0 ml-4"
          >
            <X size={24} />
          </button>
        </div>

        {/* Logs Feed */}
        <div ref={scrollRef} className="flex-grow overflow-y-auto p-8 font-mono text-[13px] leading-relaxed relative bg-slate-50/30 dark:bg-black/20 scroll-smooth">
           {/* Scanning line effect */}
           <div className="absolute top-0 left-0 w-full h-[1px] bg-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,1)] animate-[scan_4s_infinite_linear] pointer-events-none"></div>

           <div className="space-y-4">
              {logs && logs.length > 0 ? (
                logs.map((log, i) => {
                  const style = getLogStyle(log);
                  const tagMatch = log.match(/^\[(.*?)\]/);
                  const tag = tagMatch ? tagMatch[0] : null;
                  const message = tag ? log.substring(tag.length) : log;

                  return (
                    <motion.div 
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      key={i} 
                      className="flex gap-4 group items-start"
                    >
                       <div className="flex items-start gap-2 shrink-0 pt-0.5">
                          <span className="text-indigo-600 dark:text-indigo-500 font-black">$</span>
                          <span className="text-[9px] font-bold text-slate-400 dark:text-gray-600">[{getCurrentTime()}]</span>
                       </div>
                       <div className="flex flex-wrap items-baseline gap-2">
                          {tag && (
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase border tracking-tighter shrink-0 ${style.badge}`}>
                              {tag.replace(/[\[\]]/g, '')}
                            </span>
                          )}
                          <p className={`transition-colors break-words font-medium ${style.text}`}>
                             {message}
                          </p>
                       </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-20 opacity-20 gap-4">
                  <Database size={48} strokeWidth={1} className="text-slate-900 dark:text-white" />
                  <p className="text-slate-900 dark:text-gray-600 italic uppercase text-[11px] tracking-widest">No log manifests detected in this session...</p>
                </div>
              )}
              
              {status === 'processing' && (
                <div className="flex gap-4 items-center animate-pulse pt-2">
                   <div className="flex items-start gap-2 shrink-0">
                      <span className="text-indigo-600 dark:text-indigo-500 font-black">$</span>
                      <span className="text-[9px] font-bold text-slate-400 dark:text-gray-600 mt-0.5">[{getCurrentTime()}]</span>
                   </div>
                   <Loader2 size={12} className="animate-spin text-indigo-600 dark:text-indigo-500" />
                   <p className="text-indigo-600/60 dark:text-indigo-500/60 uppercase text-[11px] tracking-widest font-black italic">Awaiting next telemetry packet...</p>
                </div>
              )}
           </div>
        </div>

        {/* Footer HUD */}
        <div className="p-6 md:p-8 border-t border-black/5 dark:border-white/5 bg-slate-50 dark:bg-black/40 shrink-0 flex flex-col md:flex-row items-center justify-end gap-6">
           <div className="flex gap-3 w-full md:w-auto">
              <button 
                onClick={handleReport}
                className="flex-1 md:flex-none px-6 py-3 border border-red-500/20 text-red-500 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
              >
                 <div className="flex items-center gap-2">
                   <AlertTriangle size={14} /> BÁO LỖI
                 </div>
              </button>
              <button 
                onClick={onClose}
                className="flex-1 md:flex-none px-10 py-3 bg-slate-900 dark:bg-white text-white dark:text-black rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-brand-blue hover:text-white transition-all shadow-xl"
              >
                 TERMINATE MONITOR
              </button>
           </div>
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
