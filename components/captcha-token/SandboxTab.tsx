
import React from 'react';
import { motion } from 'framer-motion';
import { Terminal, Loader2, Play } from 'lucide-react';
import { CaptchaLog } from '../../hooks/useCaptchaToken';

interface SandboxTabProps {
  requestMode: 'IMAGE' | 'VIDEO' | 'CUSTOM';
  setRequestMode: (mode: 'IMAGE' | 'VIDEO' | 'CUSTOM') => void;
  targetUrl: string;
  setTargetUrl: (url: string) => void;
  isExecuting: boolean;
  handleRunSandbox: () => void;
  logs: CaptchaLog[];
}

export const SandboxTab: React.FC<SandboxTabProps> = ({
  requestMode, setRequestMode, targetUrl, setTargetUrl, isExecuting, handleRunSandbox, logs
}) => {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
      <div className="p-10 bg-white dark:bg-[#0d0d0f] border border-black/5 dark:border-white/10 rounded-[2.5rem] shadow-2xl space-y-10">
         <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="space-y-1">
               <h3 className="text-2xl font-black uppercase italic tracking-tighter">Thử nghiệm API.</h3>
               <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Kiểm thử giải mã trực tiếp từ trình duyệt</p>
            </div>
            <div className="flex bg-slate-100 dark:bg-black/40 p-1 rounded-xl border border-black/5 dark:border-white/10">
               {(['IMAGE', 'VIDEO', 'CUSTOM'] as const).map(m => (
                 <button 
                   key={m} onClick={() => setRequestMode(m)}
                   className={`px-6 py-2.5 rounded-lg text-[9px] font-black uppercase transition-all ${requestMode === m ? 'bg-white dark:bg-[#1a1a1e] text-indigo-600 shadow-lg' : 'text-gray-400'}`}
                 >
                   {m}
                 </button>
               ))}
            </div>
         </div>

         <div className="space-y-6">
            <div className="space-y-3">
               <label className="text-[10px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest ml-2 italic">SiteKey / Dữ liệu kịch bản</label>
               <textarea 
                 value={targetUrl} onChange={e => setTargetUrl(e.target.value)}
                 className="w-full h-32 bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/5 p-5 rounded-2xl font-mono text-[12px] text-slate-800 dark:text-zinc-300 outline-none focus:ring-1 focus:ring-indigo-500/40 transition-all resize-none shadow-inner"
                 placeholder="Nhập SiteKey hoặc dữ liệu cần giải mã để thử nghiệm..."
               />
            </div>

            <button 
              onClick={handleRunSandbox}
              disabled={!targetUrl.trim() || isExecuting}
              className={`w-full py-6 rounded-2xl font-black uppercase text-xs tracking-[0.4em] shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-4 relative overflow-hidden group ${!targetUrl.trim() || isExecuting ? 'bg-slate-100 dark:bg-white/5 text-gray-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:scale-[1.01]'}`}
            >
               <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
               {isExecuting ? <Loader2 className="animate-spin" size={20} /> : <Play size={20} fill="currentColor" />}
               {isExecuting ? 'ĐANG GIẢI MÃ...' : 'CHẠY THỬ NGHIỆM'}
            </button>
         </div>
      </div>

      <div className="p-8 bg-black rounded-[2rem] border border-white/5 overflow-hidden relative shadow-2xl">
         <div className="absolute top-4 right-4 text-emerald-500/20"><Terminal size={32}/></div>
         <div className="space-y-6">
            <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-500 italic">Kết quả phản hồi hệ thống</h4>
            <div className="font-mono text-[12px] text-emerald-500 space-y-2 max-h-40 overflow-y-auto no-scrollbar pb-2">
               {isExecuting && <p className="animate-pulse">&gt; ĐANG GỬI YÊU CẦU TỚI MÁY CHỦ...</p>}
               <p className="opacity-40">&gt; Hệ thống sẵn sàng. Đang chờ lệnh thực thi.</p>
               {logs.slice(0, 1).map(l => (
                 <div key={l.id} className="space-y-1 animate-in fade-in duration-500 border-l border-emerald-500/30 pl-4 mt-4">
                    <p className="text-white font-bold">&gt; TRẠNG THÁI: {l.status}</p>
                    <p className="text-emerald-400">&gt; ĐỘ TRỄ: {l.latency}</p>
                    <p className="text-brand-blue leading-relaxed break-all font-medium">&gt; TOKEN KẾT QUẢ: {Math.random().toString(36).substring(2, 64).toUpperCase()}...</p>
                 </div>
               ))}
            </div>
         </div>
      </div>
    </motion.div>
  );
};
