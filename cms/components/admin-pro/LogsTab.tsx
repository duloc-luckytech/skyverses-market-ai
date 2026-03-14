
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Terminal, Github, Gitlab, User, CheckCircle2, 
  XCircle, Loader2, Clock, Hash, GitBranch, 
  Search, RefreshCw, ChevronRight, Activity, 
  AlertCircle, ExternalLink, Copy, Cpu, 
  ArrowUpRight, ShieldCheck, Database, X
} from 'lucide-react';
import { deployApi, DeployLog } from '../../apis/deploy';
import { useToast } from '../../context/ToastContext';
import { Solution } from '../../types';

interface LogsTabProps {
  remoteSolutions: Solution[];
}

export const LogsTab: React.FC<LogsTabProps> = ({ remoteSolutions }) => {
  const { showToast } = useToast();
  const [logs, setLogs] = useState<DeployLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedLog, setSelectedLog] = useState<DeployLog | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await deployApi.getLogs();
      if (res.success && res.data) {
        setLogs(res.data);
      }
    } catch (error) {
      showToast("Không thể đồng bộ nhật ký từ máy chủ", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    showToast("Đã sao chép Commit ID", "success");
  };

  const filteredLogs = logs.filter(l => 
    !search || 
    l.commitMessage?.toLowerCase().includes(search.toLowerCase()) ||
    l.branch?.toLowerCase().includes(search.toLowerCase()) ||
    l.triggeredBy?.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusIcon = (status: DeployLog['status']) => {
    switch (status) {
      case 'SUCCESS': return <CheckCircle2 className="text-emerald-500" size={16} />;
      case 'FAILED': return <XCircle className="text-rose-500" size={16} />;
      case 'RUNNING': return <Loader2 className="text-brand-blue animate-spin" size={16} />;
      default: return <Activity className="text-gray-400" size={16} />;
    }
  };

  const getSourceIcon = (source: DeployLog['source']) => {
    switch (source) {
      case 'github': return <Github size={14} />;
      case 'gitlab': return <Gitlab size={14} />;
      default: return <User size={14} />;
    }
  };

  const formatDuration = (ms?: number) => {
    if (!ms) return '---';
    return (ms / 1000).toFixed(1) + 's';
  };

  return (
    <div className="p-0 flex flex-col h-full animate-in fade-in duration-700 bg-white dark:bg-[#050507]">
      
      {/* INTERNAL TOOLBAR */}
      <div className="px-12 py-8 border-b border-black/5 dark:border-white/5 flex items-center justify-between bg-white dark:bg-[#08080a] shrink-0">
        <div className="relative group w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-blue transition-colors" size={18} />
          <input 
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Tìm theo kịch bản, nhánh hoặc tác giả..."
            className="w-full bg-slate-50 dark:bg-black/40 border border-black/5 dark:border-white/10 rounded-xl pl-12 pr-6 py-3 text-sm font-bold outline-none focus:border-brand-blue transition-all text-slate-800 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-6">
           {/* Cloud Stats - Using remoteSolutions prop */}
           <div className="hidden lg:flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-gray-400">
              <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-brand-blue shadow-[0_0_8px_#0090ff]"></div>
                 <span>Cloud Nodes: {remoteSolutions.length}</span>
              </div>
           </div>
           
           <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-gray-400 border-l border-white/10 pl-6">
              <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                 <span>Succeeded: {logs.filter(l => l.status === 'SUCCESS').length}</span>
              </div>
              <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
                 <span>Failed: {logs.filter(l => l.status === 'FAILED').length}</span>
              </div>
           </div>
           <button onClick={fetchData} className="p-3 bg-slate-50 dark:bg-white/5 hover:bg-brand-blue hover:text-white rounded-xl transition-all border border-black/5 dark:border-white/10">
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
           </button>
        </div>
      </div>

      {/* DATA GRID */}
      <div className="flex-grow overflow-y-auto no-scrollbar">
        <table className="w-full text-left border-collapse font-mono">
          <thead>
            <tr className="bg-black/5 dark:bg-white/5 text-[9px] font-black uppercase tracking-widest text-gray-500 sticky top-0 z-20 backdrop-blur-md">
              <th className="px-12 py-6">Status / Protocol</th>
              <th className="px-12 py-6">Commit Manifest</th>
              <th className="px-12 py-6">Branch</th>
              <th className="px-12 py-6">Triggered By</th>
              <th className="px-12 py-6">Compute Time</th>
              <th className="px-12 py-6 text-right">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5 dark:divide-white/5">
            {loading && logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-40 text-center">
                  <Loader2 className="animate-spin text-brand-blue mx-auto mb-4" size={48} />
                  <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400 animate-pulse italic">SYNCING_DEPLOY_REGISTRY...</p>
                </td>
              </tr>
            ) : filteredLogs.length > 0 ? (
              filteredLogs.map((log) => (
                <tr 
                  key={log._id} 
                  onClick={() => setSelectedLog(log)}
                  className="group hover:bg-brand-blue/[0.02] transition-colors cursor-pointer"
                >
                  <td className="px-12 py-6">
                    <div className="flex items-center gap-4">
                      {getStatusIcon(log.status)}
                      <span className={`text-[10px] font-black uppercase italic ${
                        log.status === 'SUCCESS' ? 'text-emerald-500' : 
                        log.status === 'FAILED' ? 'text-rose-500' : 'text-indigo-500'
                      }`}>
                        {log.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-12 py-6">
                    <div className="space-y-1 max-w-md">
                       <p className="text-[11px] font-black text-black dark:text-white uppercase truncate italic leading-tight">
                         "{log.commitMessage || 'Automated system update'}"
                       </p>
                       <div className="flex items-center gap-2">
                          <Hash size={10} className="text-gray-400" />
                          <span className="text-[9px] text-gray-500 font-bold tracking-tighter uppercase">{log.commitId?.slice(0, 7) || 'N/A'}</span>
                       </div>
                    </div>
                  </td>
                  <td className="px-12 py-6">
                    <div className="flex items-center gap-2 px-3 py-1 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded w-fit">
                       <GitBranch size={12} className="text-brand-blue" />
                       <span className="text-[10px] font-black text-slate-700 dark:text-gray-300 uppercase italic tracking-tighter">{log.branch}</span>
                    </div>
                  </td>
                  <td className="px-12 py-6">
                    <div className="flex items-center gap-3">
                       <div className="p-1.5 bg-black/5 dark:bg-white/10 rounded-full text-slate-400">
                          {getSourceIcon(log.source)}
                       </div>
                       <span className="text-[10px] font-bold text-slate-600 dark:text-gray-400 uppercase tracking-widest">{log.triggeredBy}</span>
                    </div>
                  </td>
                  <td className="px-12 py-6">
                    <div className="flex items-center gap-2 text-slate-700 dark:text-gray-300">
                       <Clock size={12} className="text-gray-400" />
                       <span className="text-[11px] font-black italic">{formatDuration(log.durationMs)}</span>
                    </div>
                  </td>
                  <td className="px-12 py-6 text-right">
                    <span className="text-[10px] font-bold text-gray-400 uppercase italic">
                      {new Date(log.createdAt).toLocaleString('vi-VN')}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-40 text-center opacity-20 italic">
                   <Activity size={48} className="mx-auto mb-4" />
                   <p className="text-xs font-black uppercase tracking-[0.5em]">No deployment nodes found</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* DETAIL TERMINAL MODAL */}
      <AnimatePresence>
        {selectedLog && (
          <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 md:p-12">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setSelectedLog(null)} />
             <motion.div initial={{ scale: 0.95, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 30 }} className="relative w-full max-w-5xl bg-[#0c0c0e] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-3xl flex flex-col max-h-[90vh]">
                <div className="p-8 border-b border-white/5 flex items-center justify-between shrink-0 bg-black/40">
                   <div className="flex items-center gap-5">
                      <div className="w-12 h-12 bg-indigo-600/20 border border-indigo-500/30 rounded-xl flex items-center justify-center text-indigo-500 shadow-inner">
                         <Terminal size={24} />
                      </div>
                      <div>
                         <h3 className="text-xl font-black uppercase tracking-tight italic text-white">Log_Monitor</h3>
                         <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest italic">TRACE_ID: {selectedLog._id}</p>
                      </div>
                   </div>
                   <button onClick={() => setSelectedLog(null)} className="p-2 text-gray-500 hover:text-white transition-colors"><X size={32}/></button>
                </div>

                <div className="flex-grow overflow-y-auto p-10 space-y-10 no-scrollbar bg-black font-mono">
                   {/* Meta HUD */}
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-10 border-b border-white/5">
                      {[
                        { l: 'Status', v: selectedLog.status, c: selectedLog.status === 'SUCCESS' ? 'text-emerald-500' : 'text-rose-500' },
                        { l: 'Compute', v: formatDuration(selectedLog.durationMs), c: 'text-brand-blue' },
                        { l: 'Source', v: selectedLog.source.toUpperCase(), c: 'text-white' },
                        { l: 'Hash', v: selectedLog.commitId?.slice(0, 12), c: 'text-indigo-400' }
                      ].map(stat => (
                        <div key={stat.l} className="space-y-1">
                           <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">{stat.l}</p>
                           <p className={`text-sm font-black italic truncate ${stat.c}`}>{stat.v}</p>
                        </div>
                      ))}
                   </div>

                   {/* Standard Output */}
                   <div className="space-y-4">
                      <div className="flex items-center gap-3 text-[10px] font-black text-gray-500 uppercase tracking-widest italic">
                         <ChevronRight size={14} className="text-brand-blue" /> Output Stream (STDOUT)
                      </div>
                      <pre className="p-6 bg-[#0a0a0c] border border-white/5 rounded-xl text-[12px] text-zinc-400 overflow-x-auto leading-relaxed whitespace-pre-wrap shadow-inner min-h-[100px]">
                         {selectedLog.stdout || 'Empty stream...'}
                      </pre>
                   </div>

                   {/* Standard Error / Errors */}
                   {(selectedLog.stderr || selectedLog.errorMessage) && (
                     <div className="space-y-4">
                        <div className="flex items-center gap-3 text-[10px] font-black text-rose-500 uppercase tracking-widest italic">
                           <AlertCircle size={14} /> Error Payload (STDERR)
                        </div>
                        <pre className="p-6 bg-rose-500/5 border border-rose-500/10 rounded-xl text-[12px] text-rose-400/90 overflow-x-auto leading-relaxed whitespace-pre-wrap shadow-inner">
                           {selectedLog.errorMessage || selectedLog.stderr}
                        </pre>
                     </div>
                   )}
                </div>

                <div className="p-8 border-t border-white/5 bg-black/40 flex justify-between items-center shrink-0">
                   <div className="flex items-center gap-3 text-[9px] font-black uppercase text-gray-600 italic">
                      <ShieldCheck size={14} className="text-emerald-500" /> Authorized_Registry_View
                   </div>
                   <div className="flex gap-4">
                      <button 
                        onClick={() => handleCopyId(selectedLog.commitId)}
                        className="px-6 py-3 border border-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all"
                      >
                         Copy Hash
                      </button>
                      <button 
                        onClick={() => setSelectedLog(null)}
                        className="px-10 py-3 bg-indigo-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-indigo-600/20"
                      >
                         Dismiss
                      </button>
                   </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
