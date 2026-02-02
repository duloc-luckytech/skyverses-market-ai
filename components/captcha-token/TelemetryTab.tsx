
import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Activity, Check, X, Zap } from 'lucide-react';
import { CaptchaLog } from '../../hooks/useCaptchaToken';

interface TelemetryTabProps {
  logs: CaptchaLog[];
  setLogs: (logs: CaptchaLog[]) => void;
}

export const TelemetryTab: React.FC<TelemetryTabProps> = ({ logs, setLogs }) => {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
      <div className="bg-white dark:bg-[#0d0d0f] border border-black/5 dark:border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl transition-all">
         <div className="p-8 border-b border-black/5 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-black/20">
            <div className="flex items-center gap-3">
               <BarChart3 size={20} className="text-indigo-600" />
               <h3 className="text-xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">Lịch sử Truy xuất.</h3>
            </div>
            <button onClick={() => setLogs([])} className="text-[10px] font-black text-gray-400 hover:text-red-500 transition-colors uppercase tracking-widest">Xoá nhật ký tạm</button>
         </div>
         
         <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse font-mono">
               <thead>
                  <tr className="bg-black/5 dark:bg-white/5 text-[9px] font-black uppercase tracking-widest text-gray-500">
                     <th className="px-10 py-6">Trace ID</th>
                     <th className="px-10 py-6">Thời gian</th>
                     <th className="px-10 py-6 text-center">Loại</th>
                     <th className="px-10 py-6 text-center">Độ trễ</th>
                     <th className="px-10 py-6">Trạng thái</th>
                     <th className="px-10 py-6 text-right">Chi phí</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-black/5 dark:divide-white/5">
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-32 text-center opacity-10">
                         <Activity size={48} className="mx-auto mb-4" />
                         <p className="text-[10px] font-black uppercase tracking-[0.5em]">No Active Logs</p>
                      </td>
                    </tr>
                  ) : logs.map(l => (
                    <tr key={l.id} className="group hover:bg-black/[0.01] dark:hover:bg-white/[0.01] text-[11px] font-bold">
                       <td className="px-10 py-6 text-gray-400">#{l.id}</td>
                       <td className="px-10 py-6 italic text-slate-500 dark:text-gray-400">{l.timestamp}</td>
                       <td className="px-10 py-6 text-center">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black shadow-sm ${l.action === 'VIDEO' ? 'bg-purple-500/10 text-purple-500' : 'bg-brand-blue/10 text-brand-blue'}`}>
                            {l.action}
                          </span>
                       </td>
                       <td className="px-10 py-6 text-center text-indigo-500 italic font-black">{l.latency}</td>
                       <td className="px-10 py-6">
                          <div className={`flex items-center gap-2 ${l.status === 'FAILED' ? 'text-red-500' : 'text-emerald-500'}`}>
                             {l.status === 'SUCCESS' ? <Check size={12} strokeWidth={4}/> : l.status === 'FAILED' ? <X size={12} strokeWidth={4}/> : <Zap size={10} fill="currentColor"/>}
                             <span className="text-[10px] font-black uppercase">{l.status}</span>
                          </div>
                       </td>
                       <td className="px-10 py-6 text-right text-orange-500 font-black italic">-{l.cost} CR</td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    </motion.div>
  );
};
