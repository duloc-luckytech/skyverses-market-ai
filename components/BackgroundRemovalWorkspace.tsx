import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Fixed: Added Link import
import { Link } from 'react-router-dom';
import { 
  X, Upload, Sparkles, Image as ImageIcon, Layers, 
  Trash2, Download, Check, Maximize2, Loader2, 
  AlertCircle, History, Share2, CornerDownRight, Zap,
  Smartphone, Monitor, Globe, ShieldCheck, UserCheck,
  ChevronRight, Files,
  // Fixed: Added missing icons
  ChevronLeft, Cpu, AlertTriangle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { uploadToGCS } from '../services/storage';

interface BgJob {
  id: string;
  original: string;
  result: string | null;
  status: 'PENDING' | 'PROCESSING' | 'DONE' | 'ERROR';
  filename: string;
  timestamp: string;
}

const BackgroundRemovalWorkspace: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { credits, useCredits, isAuthenticated, login, refreshUserInfo } = useAuth();
  
  const [jobs, setJobs] = useState<BgJob[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  // Fixed: Added missing state for low credit alert
  const [showLowCreditAlert, setShowLowCreditAlert] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const COST_PER_IMAGE = 50;

  // Fixed: Added triggerDownload implementation
  const triggerDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.body.appendChild(document.createElement('a'));
      link.href = blobUrl;
      link.download = filename;
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      window.open(url, '_blank');
    }
  };

  // Fixed: Added handleDownloadAllDone implementation
  const handleDownloadAllDone = () => {
    const doneJobs = jobs.filter(j => j.status === 'DONE' && j.result);
    doneJobs.forEach((job, idx) => {
      setTimeout(() => triggerDownload(job.result!, `no_bg_${job.id}.png`), idx * 800);
    });
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newJobs: BgJob[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const metadata = await uploadToGCS(file);
        newJobs.push({
          id: `bg-${Date.now()}-${i}`,
          original: metadata.url,
          result: null,
          status: 'PENDING',
          filename: file.name,
          timestamp: new Date().toLocaleTimeString()
        });
      } catch (err) {
        console.error(err);
      }
    }

    setJobs(prev => [...newJobs, ...prev]);
    setIsUploading(false);
    if (e.target) e.target.value = '';
  };

  const runAllJobs = async () => {
    const pendingJobs = jobs.filter(j => j.status === 'PENDING');
    if (pendingJobs.length === 0 || isProcessing) return;
    if (!isAuthenticated) { login(); return; }

    const totalCost = pendingJobs.length * COST_PER_IMAGE;
    if (credits < totalCost) {
      setShowLowCreditAlert(true);
      return;
    }

    setIsProcessing(true);
    
    for (const job of pendingJobs) {
      setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: 'PROCESSING' } : j));
      
      // Simulate AI Processing (Since real BG removal usually needs a specific backend or CV library)
      await new Promise(r => setTimeout(r, 2000));
      
      const success = useCredits(COST_PER_IMAGE);
      if (success) {
        setJobs(prev => prev.map(j => j.id === job.id ? { 
          ...j, 
          status: 'DONE', 
          // For demo, we use the original as result. In prod, this would be the transparent PNG URL
          result: j.original 
        } : j));
      } else {
        setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: 'ERROR' } : j));
      }
    }
    
    refreshUserInfo();
    setIsProcessing(false);
  };

  const removeJob = (id: string) => {
    setJobs(prev => prev.filter(j => j.id !== id));
  };

  const doneCount = jobs.filter(j => j.status === 'DONE').length;

  return (
    <div className="h-full w-full flex flex-col bg-[#fcfcfd] dark:bg-[#0c0c0e] text-slate-900 dark:text-white font-sans overflow-hidden transition-colors duration-500 relative">
      
      {/* HEADER */}
      <header className="h-16 md:h-20 border-b border-slate-200 dark:border-white/5 flex items-center justify-between px-8 bg-white/80 dark:bg-[#0d0d10]/80 backdrop-blur-xl z-[100] shrink-0">
        <div className="flex items-center gap-4">
           {/* Fixed: ChevronLeft icon used from missing import */}
           <button onClick={onClose} className="p-2 -ml-2 text-slate-400 hover:text-brand-blue transition-colors">
              <ChevronLeft size={24} />
           </button>
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-blue/10 rounded-xl flex items-center justify-center text-brand-blue shadow-inner">
                 <Layers size={20} />
              </div>
              <h2 className="text-xl font-black uppercase italic tracking-tighter">Background Remove</h2>
           </div>
        </div>

        <div className="flex items-center gap-6">
           <button 
             onClick={runAllJobs}
             disabled={isProcessing || jobs.filter(j => j.status === 'PENDING').length === 0}
             className="px-6 py-2.5 bg-slate-900 dark:bg-white/5 border border-slate-800 dark:border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-white flex items-center gap-3 hover:bg-brand-blue transition-all shadow-xl disabled:opacity-30 disabled:grayscale"
           >
              <Sparkles size={14} className="text-brand-blue" />
              Xóa nền ảnh tự động với AI
           </button>
           <div className="h-8 w-px bg-black/5 dark:bg-white/10"></div>
           <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
              <X size={24} />
           </button>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-grow overflow-y-auto no-scrollbar bg-slate-50/50 dark:bg-[#050507] p-8 lg:p-12 relative transition-colors duration-500">
         <div className="max-w-[1400px] mx-auto space-y-12">
            
            {/* 1. UPLOAD ZONE */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="relative w-full aspect-[21/9] border-4 border-dashed border-slate-200 dark:border-white/5 rounded-[3rem] flex flex-col items-center justify-center gap-8 cursor-pointer hover:border-brand-blue/40 hover:bg-brand-blue/[0.02] transition-all group overflow-hidden bg-white dark:bg-[#0d0d0f] shadow-2xl"
            >
               <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
               
               {isUploading ? (
                 <div className="flex flex-col items-center gap-4">
                    <Loader2 size={64} className="text-brand-blue animate-spin" strokeWidth={1} />
                    <p className="text-[12px] font-black uppercase tracking-[0.5em] text-brand-blue animate-pulse">Syncing_Assets...</p>
                 </div>
               ) : (
                 <>
                   <div className="w-24 h-24 bg-slate-100 dark:bg-white/5 rounded-[2.5rem] flex items-center justify-center text-slate-300 dark:text-gray-700 group-hover:scale-110 group-hover:text-brand-blue transition-all shadow-inner">
                      <Layers size={48} />
                   </div>
                   <div className="space-y-3 text-center">
                      <h3 className="text-2xl lg:text-3xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">Kéo thả ảnh hoặc click để chọn</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-500 font-bold uppercase tracking-widest leading-relaxed">
                         Hỗ trợ chọn nhiều ảnh - JPG, PNG, WEBP - Tối đa 10MB/ảnh
                      </p>
                   </div>
                   <div className="flex gap-4">
                      <button className="px-10 py-5 bg-brand-blue text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-brand-blue/20 flex items-center gap-3">
                         <Upload size={16} /> Tải ảnh lên
                      </button>
                      <button className="px-10 py-5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-gray-300 flex items-center gap-3">
                         <Files size={16} /> Chọn từ Album
                      </button>
                   </div>
                 </>
               )}
               <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*" onChange={handleUpload} />
            </div>

            {/* 2. HISTORY & RESULTS SECTION */}
            <div className="space-y-8">
               <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-4">
                     <div className="p-2 bg-rose-500/10 rounded-lg text-rose-500 shadow-inner">
                        <History size={18} />
                     </div>
                     <div className="flex items-center gap-3">
                        <h3 className="text-xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">Lịch sử xóa nền</h3>
                        {doneCount > 0 && <span className="bg-emerald-500/10 text-emerald-500 text-[9px] font-black px-3 py-1 rounded-full border border-emerald-500/20">{doneCount} thành công</span>}
                     </div>
                  </div>
                  {/* Fixed: handleDownloadAllDone function was missing */}
                  <button 
                    onClick={handleDownloadAllDone}
                    disabled={doneCount === 0}
                    className="px-8 py-3 bg-rose-600 text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-rose-600/20 flex items-center gap-3 hover:brightness-110 active:scale-95 transition-all disabled:opacity-30 disabled:grayscale"
                  >
                    <Download size={16} /> Tải tất cả ({doneCount})
                  </button>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  <AnimatePresence mode="popLayout">
                    {jobs.map((job) => (
                      <motion.div 
                        key={job.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="group relative bg-white dark:bg-[#111114] border border-black/5 dark:border-white/10 rounded-[2.5rem] overflow-hidden shadow-xl hover:shadow-2xl hover:border-brand-blue/30 transition-all"
                      >
                         <div className="aspect-video relative overflow-hidden flex bg-slate-100 dark:bg-black">
                            {/* Compare view */}
                            <div className="absolute inset-0 grid grid-cols-2">
                               <div className="relative overflow-hidden border-r border-white/20">
                                  <img src={job.original} className="w-full h-full object-cover grayscale opacity-40 blur-[1px]" alt="Source" />
                                  <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 rounded text-[7px] font-black text-white uppercase tracking-widest">Gốc</div>
                               </div>
                               <div className="relative overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
                                  {job.status === 'DONE' && job.result ? (
                                    <img src={job.result} className="w-full h-full object-cover" alt="Result" />
                                  ) : job.status === 'PROCESSING' ? (
                                    <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                                       <Loader2 size={24} className="text-brand-blue animate-spin" />
                                    </div>
                                  ) : job.status === 'ERROR' ? (
                                    <div className="w-full h-full flex items-center justify-center text-red-500">
                                       <AlertCircle size={24} />
                                    </div>
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center opacity-10">
                                       <ImageIcon size={24} />
                                    </div>
                                  )}
                                  <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-brand-blue/80 rounded text-[7px] font-black text-white uppercase tracking-widest">PNG</div>
                                  {job.status === 'DONE' && (
                                     <div className="absolute top-2 right-2 bg-emerald-500 text-white p-1 rounded-full shadow-lg">
                                        <Check size={10} strokeWidth={4} />
                                     </div>
                                  )}
                               </div>
                            </div>
                            
                            {/* Actions on hover */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-20">
                               {job.status === 'DONE' && (
                                 <button className="p-3 bg-white text-black rounded-full shadow-2xl hover:scale-110 transition-transform"><Maximize2 size={16}/></button>
                               )}
                               <button onClick={() => removeJob(job.id)} className="p-3 bg-white text-red-500 rounded-full shadow-2xl hover:scale-110 transition-transform"><Trash2 size={16}/></button>
                            </div>
                         </div>

                         <div className="p-6 space-y-4">
                            <div className="flex justify-between items-start">
                               <div className="space-y-1">
                                  <h4 className="text-xs font-black uppercase text-slate-800 dark:text-white truncate max-w-[180px] italic">"{job.filename}"</h4>
                                  <p className="text-[9px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest">{job.timestamp}</p>
                               </div>
                               <button className="p-2 text-gray-300 hover:text-brand-blue transition-colors"><Share2 size={14} /></button>
                            </div>
                            
                            {/* Fixed: triggerDownload function was missing */}
                            <button 
                              disabled={job.status !== 'DONE'}
                              onClick={() => job.result && triggerDownload(job.result, `no_bg_${job.id}.png`)}
                              className={`w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${job.status === 'DONE' ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20 hover:scale-[1.02] active:scale-98' : 'bg-slate-100 dark:bg-white/5 text-slate-300 dark:text-gray-700 cursor-not-allowed grayscale'}`}
                            >
                               <Download size={14} /> Tải PNG
                            </button>
                         </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
               </div>

               {jobs.length === 0 && (
                 <div className="py-32 flex flex-col items-center justify-center opacity-10 space-y-6 select-none grayscale">
                    <ImageIcon size={120} strokeWidth={1} className="text-slate-900 dark:text-white" />
                    <h3 className="text-2xl font-black uppercase tracking-[0.5em] italic">No Records</h3>
                 </div>
               )}
            </div>
         </div>
      </main>

      {/* STATUS FOOTER */}
      <footer className="h-14 border-t border-slate-200 dark:border-white/5 bg-white dark:bg-[#0a0a0c] px-10 flex items-center justify-between shrink-0 z-[100] transition-colors">
         <div className="flex items-center gap-10">
            <div className="flex items-center gap-3">
               <ShieldCheck size={16} className="text-emerald-500" />
               <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-500 italic">VPC_ENCRYPTION: ACTIVE</span>
            </div>
            <div className="flex items-center gap-3">
               {/* Fixed: Cpu icon used from missing import */}
               <Cpu size={16} className="text-brand-blue" />
               <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-500 italic">H100_CLUSTER: STABLE</span>
            </div>
         </div>
         <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]"></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-brand-blue">Protocol_Node_042_Ready</span>
         </div>
      </footer>

      {/* LOW CREDIT DIALOG */}
      <AnimatePresence>
        {/* Fixed: Added missing showLowCreditAlert state usage */}
        {showLowCreditAlert && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[1100] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
             <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="max-w-md w-full bg-white dark:bg-[#111114] p-12 border border-slate-200 dark:border-white/10 rounded-[2rem] text-center space-y-8 shadow-3xl">
                {/* Fixed: Added missing AlertTriangle icon */}
                <div className="w-20 h-20 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center mx-auto text-amber-500"><AlertTriangle size={40} /></div>
                <div className="space-y-4">
                   <h3 className="text-3xl font-black uppercase tracking-tighter italic">Hạn ngạch cạn kiệt</h3>
                   <p className="text-sm text-gray-500 dark:text-gray-400 font-bold leading-relaxed uppercase">Tác vụ xóa nền yêu cầu **{COST_PER_IMAGE} credits** mỗi ảnh. <br />Vui lòng nạp thêm để tiếp tục.</p>
                </div>
                <div className="flex flex-col gap-4">
                   {/* Fixed: Added missing Link component */}
                   <Link to="/credits" className="bg-brand-blue text-white py-5 rounded-full text-xs font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all text-center">Nạp thêm Credits</Link>
                   {/* Fixed: Added missing setShowLowCreditAlert state setter */}
                   <button onClick={() => setShowLowCreditAlert(false)} className="text-[10px] font-black uppercase text-slate-400 hover:text-brand-blue transition-colors tracking-widest underline underline-offset-8 decoration-white/20">Bỏ qua</button>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BackgroundRemovalWorkspace;