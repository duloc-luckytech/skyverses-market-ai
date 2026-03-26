
import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Terminal, Loader2, Cpu, Clock, Copy, Check, AlertTriangle, Zap, CircleDot, CheckCircle2, XCircle, ChevronDown } from 'lucide-react';
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
  title = "Image Production Trace",
  subtitle = "Node Process Trace",
  status = "idle",
  logs,
  jobId
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    if (scrollRef.current && autoScroll) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    setAutoScroll(scrollHeight - scrollTop - clientHeight < 60);
  };

  const handleCopyId = () => {
    if (!jobId) return;
    navigator.clipboard.writeText(jobId);
    setCopied(true);
    showToast('Đã sao chép Job ID', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyLogs = () => {
    navigator.clipboard.writeText(logs.join('\n'));
    showToast('Đã sao chép toàn bộ log', 'success');
  };

  const handleReport = () => {
    if (!jobId) return;
    showToast(`Báo cáo lỗi đã gửi cho Job: ${jobId.slice(0, 8)}...`, 'warning');
  };

  if (!isOpen) return null;

  const statusConfig = {
    processing: { label: 'Đang xử lý', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', dot: 'bg-amber-400', icon: <Loader2 size={12} className="animate-spin" /> },
    done: { label: 'Hoàn thành', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', dot: 'bg-emerald-400', icon: <CheckCircle2 size={12} /> },
    error: { label: 'Lỗi', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', dot: 'bg-red-400', icon: <XCircle size={12} /> },
  }[status] || { label: status, color: 'text-slate-400', bg: 'bg-slate-500/10 border-slate-500/20', dot: 'bg-slate-400', icon: <CircleDot size={12} /> };

  const getLogStyle = (log: string) => {
    const u = log.toUpperCase();
    if (u.includes('[ERROR]') || u.includes('[FAIL]') || u.includes('[CRITICAL]'))
      return { color: 'text-red-400', accent: '#ef4444', tag: 'bg-red-500/15 text-red-400 border-red-500/20' };
    if (u.includes('[SUCCESS]') || u.includes('[DONE]') || u.includes('[COMPLETED]'))
      return { color: 'text-emerald-400', accent: '#10b981', tag: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' };
    if (u.includes('[STATUS]') || u.includes('[POLLING]') || u.includes('[AWAITING]'))
      return { color: 'text-amber-400', accent: '#f59e0b', tag: 'bg-amber-500/15 text-amber-400 border-amber-500/20' };
    if (u.includes('[UPLINK]') || u.includes('[NODE]') || u.includes('[API]'))
      return { color: 'text-blue-400', accent: '#3b82f6', tag: 'bg-blue-500/15 text-blue-400 border-blue-500/20' };
    if (u.includes('[DIRECT]') || u.includes('[GPU]'))
      return { color: 'text-purple-400', accent: '#a855f7', tag: 'bg-purple-500/15 text-purple-400 border-purple-500/20' };
    return { color: 'text-slate-400', accent: '#64748b', tag: 'bg-slate-500/10 text-slate-500 border-slate-500/10' };
  };

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-3 md:p-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-2xl"
        onClick={onClose}
      />

      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 28, stiffness: 350 }}
        className="relative w-full max-w-[680px] h-[85vh] max-h-[700px] bg-[#0d0d10] border border-white/[0.06] rounded-2xl overflow-hidden shadow-2xl flex flex-col"
      >
        {/* ─── HEADER ─── */}
        <div className="px-5 py-4 border-b border-white/[0.04] bg-[#0f0f13] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl flex items-center justify-center border border-indigo-500/10 shrink-0">
              <Terminal size={16} className="text-indigo-400" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-white leading-tight truncate">{title}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`inline-flex items-center gap-1 text-[9px] font-bold uppercase px-2 py-0.5 rounded-md border ${statusConfig.bg} ${statusConfig.color}`}>
                  {statusConfig.icon}
                  {statusConfig.label}
                </span>
                {jobId && (
                  <button
                    onClick={handleCopyId}
                    className="inline-flex items-center gap-1 text-[9px] font-mono text-slate-500 hover:text-indigo-400 transition-colors bg-white/[0.03] px-1.5 py-0.5 rounded border border-white/[0.04] hover:border-indigo-500/20"
                  >
                    {copied ? <Check size={8} className="text-emerald-400" /> : <Copy size={8} />}
                    {jobId.length > 12 ? `${jobId.slice(0, 10)}...` : jobId}
                  </button>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-white hover:bg-white/[0.06] rounded-lg transition-all shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* ─── STATS BAR ─── */}
        <div className="px-5 py-2.5 border-b border-white/[0.03] bg-[#0b0b0e] flex items-center gap-4 text-[9px] font-medium text-slate-500 shrink-0">
          <span className="flex items-center gap-1.5">
            <Cpu size={10} className="text-indigo-400/60" /> {logs.length} entries
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={10} className="text-slate-500/60" /> {new Date().toLocaleTimeString('vi-VN', { hour12: false })}
          </span>
          <span className="flex items-center gap-1.5">
            <Zap size={10} className="text-amber-400/60" /> Live
          </span>
          <div className="flex-grow" />
          <button onClick={handleCopyLogs} className="text-slate-500 hover:text-indigo-400 transition-colors flex items-center gap-1">
            <Copy size={9} /> Copy all
          </button>
        </div>

        {/* ─── LOG FEED ─── */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-grow overflow-y-auto font-mono text-[11px] leading-[1.8] no-scrollbar relative"
        >
          {/* Scanline */}
          {status === 'processing' && (
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent animate-[scan_3s_infinite_linear] pointer-events-none z-10" />
          )}

          <div className="p-5 space-y-0">
            {logs && logs.length > 0 ? (
              logs.map((log, i) => {
                const style = getLogStyle(log);
                const tagMatch = log.match(/^\[(.*?)\]/);
                const tag = tagMatch ? tagMatch[0] : null;
                const message = tag ? log.substring(tag.length).trim() : log;

                return (
                  <motion.div
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.02, duration: 0.2 }}
                    key={i}
                    className="flex items-start gap-3 py-1.5 group hover:bg-white/[0.02] -mx-2 px-2 rounded-lg transition-colors"
                  >
                    {/* Line number */}
                    <span className="text-[9px] text-slate-600 w-5 text-right shrink-0 select-none tabular-nums pt-px">{i + 1}</span>

                    {/* Accent dot */}
                    <div className="w-1.5 h-1.5 rounded-full mt-[5px] shrink-0" style={{ backgroundColor: style.accent, boxShadow: `0 0 6px ${style.accent}40` }} />

                    {/* Content */}
                    <div className="flex flex-wrap items-baseline gap-1.5 min-w-0">
                      {tag && (
                        <span className={`px-1.5 py-px rounded text-[8px] font-bold uppercase border tracking-wide shrink-0 ${style.tag}`}>
                          {tag.replace(/[\[\]]/g, '')}
                        </span>
                      )}
                      <span className={`${style.color} break-words`}>{message}</span>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-center">
                  <Terminal size={24} strokeWidth={1.5} className="text-slate-600" />
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Chưa có log</p>
                  <p className="text-[9px] text-slate-600 mt-1">Quá trình xử lý sẽ hiện tại đây</p>
                </div>
              </div>
            )}

            {/* Processing indicator */}
            {status === 'processing' && (
              <div className="flex items-center gap-3 py-2 -mx-2 px-2 mt-1">
                <span className="text-[9px] text-slate-600 w-5 text-right shrink-0">•</span>
                <Loader2 size={10} className="animate-spin text-indigo-400 shrink-0" />
                <span className="text-[10px] text-indigo-400/60 animate-pulse">Đang chờ dữ liệu...</span>
              </div>
            )}
          </div>

          {/* Scroll-to-bottom button */}
          {!autoScroll && (
            <button
              onClick={() => {
                if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
                setAutoScroll(true);
              }}
              className="fixed bottom-28 right-1/2 translate-x-1/2 px-3 py-1.5 bg-indigo-500/20 backdrop-blur-md border border-indigo-500/20 rounded-full text-[9px] font-bold text-indigo-400 flex items-center gap-1.5 hover:bg-indigo-500/30 transition-all z-20"
            >
              <ChevronDown size={10} /> Cuộn xuống
            </button>
          )}
        </div>

        {/* ─── FOOTER ─── */}
        <div className="px-5 py-3.5 border-t border-white/[0.04] bg-[#0b0b0e] shrink-0 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {status === 'error' && (
              <button
                onClick={handleReport}
                className="px-4 py-2 border border-red-500/20 text-red-400 rounded-lg text-[10px] font-bold flex items-center gap-1.5 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all"
              >
                <AlertTriangle size={11} /> Báo lỗi
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.06] text-white/80 rounded-lg text-[10px] font-bold transition-all"
          >
            Đóng
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
