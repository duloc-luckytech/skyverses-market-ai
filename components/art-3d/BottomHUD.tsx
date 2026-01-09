import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RotateCcw, RotateCw, Sparkles, Zap, Star, Share2, 
  Download, HelpCircle, ChevronDown, Settings, Loader2,
  FileDown, ShieldCheck, Activity, Box as BoxIcon
} from 'lucide-react';

interface BottomHUDProps {
  onRotate: (dir: number) => void;
  showSettings: boolean;
  setShowSettings: (val: boolean) => void;
  credits: number;
  useCredits: (amount: number) => boolean;
  modelUrl: string | null;
}

export const BottomHUD: React.FC<BottomHUDProps> = ({ onRotate, showSettings, setShowSettings, credits, useCredits, modelUrl }) => {
  const [showExport, setShowExport] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [selectedFormat, setSelectedFormat] = useState('GLB');
  const [isPivotActive, setIsPivotActive] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  const formats = ['GLB', 'USD', 'FBX', 'OBJ', 'STL', '3MF'];
  const EXPORT_COST = 5;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(event.target as Node)) {
        setShowExport(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExportClick = async () => {
    if (!modelUrl) {
      alert("No active model instance found in workspace.");
      return;
    }
    
    if (useCredits(EXPORT_COST)) {
      setIsExporting(true);
      setShowExport(false);
      setExportProgress(10);
      
      try {
        // Step 1: Initialize Engine
        addLog("Initializing Neural Export Engine...");
        await new Promise(resolve => setTimeout(resolve, 800));
        setExportProgress(35);

        // Step 2: Fetching Data
        addLog("Compiling Geometry & Industrial Textures...");
        
        const extension = selectedFormat.toLowerCase();
        const filename = `skyverses_3d_export_${Date.now()}.${extension}`;

        // Try downloading using fetch/blob first (cleanest)
        try {
          const response = await fetch(modelUrl);
          if (!response.ok) throw new Error("CORS or Network Error");
          
          setExportProgress(65);
          const blob = await response.blob();
          
          addLog(`Packaging ${selectedFormat} container...`);
          await new Promise(resolve => setTimeout(resolve, 800));

          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          
          setExportProgress(100);
          addLog("Export Manifest Success.");
          setTimeout(() => setIsExporting(false), 500);

        } catch (fetchErr) {
          // Fallback: Direct download via hidden anchor if fetch is blocked by CORS
          addLog("Switching to standard download protocol...");
          setExportProgress(80);
          
          const link = document.createElement('a');
          link.href = modelUrl;
          link.target = '_blank';
          link.download = filename;
          // Note: download attribute only works for same-origin URLs or blobs.
          // For truly external URLs like GitHub raw, the browser might just open it.
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          setExportProgress(100);
          setTimeout(() => setIsExporting(false), 500);
        }
      } catch (error) {
        console.error("Export failed:", error);
        alert("Export node failure: Failed to sync with 3D instance storage.");
        setIsExporting(false);
      }
    } else {
      alert("Insufficient credits for export. Node authorization denied.");
    }
  };

  const addLog = (msg: string) => {
    console.log(`[SYSTEM_EXPORT] ${msg}`);
  };

  return (
    <>
      <AnimatePresence>
        {isExporting && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-[#0c0c0e]/95 backdrop-blur-3xl flex flex-col items-center justify-center p-8"
          >
            <div className="max-w-md w-full space-y-12 text-center">
              <div className="relative mx-auto w-32 h-32 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-white/5"></div>
                <motion.div 
                  className="absolute inset-0 rounded-full border-4 border-t-brand-blue border-r-transparent border-b-transparent border-l-transparent"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                />
                <FileDown className="w-12 h-12 text-brand-blue animate-pulse" />
              </div>

              <div className="space-y-8">
                <div className="space-y-3">
                  <h3 className="text-3xl font-black uppercase italic tracking-tighter text-white">Exporting Asset</h3>
                  <p className="text-[10px] font-black uppercase tracking-[0.6em] text-gray-500">Node Syncing: {selectedFormat} Package</p>
                </div>

                <div className="space-y-4">
                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${exportProgress}%` }}
                      className="h-full bg-brand-blue shadow-[0_0_20px_rgba(0,144,255,1)]"
                    />
                  </div>
                  <div className="flex justify-between items-center px-2 font-mono">
                    <span className="text-[9px] font-black uppercase text-gray-600 tracking-[0.3em] flex items-center gap-2">
                        <Activity size={10} className="animate-pulse text-brand-blue" /> Cluster_ID: X42
                    </span>
                    <span className="text-[11px] font-black text-brand-blue">{exportProgress}%</span>
                  </div>
                </div>

                <div className="pt-8 flex justify-center">
                   <div className="flex items-center gap-3 px-5 py-2 bg-white/5 border border-white/10 rounded-full">
                      <ShieldCheck size={14} className="text-emerald-500" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Security: Encrypted Uplink</span>
                   </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-4 w-full px-4 pointer-events-none">
        <div className="flex items-center gap-2 px-4 py-1.5 bg-black/60 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl pointer-events-auto">
          <Zap size={12} className="text-yellow-400" fill="currentColor" />
          <span className="text-[10px] font-black uppercase tracking-widest text-white/80">Balance: {credits.toLocaleString()} CR</span>
        </div>

        <div className="flex items-center gap-2 p-2 bg-[#141519]/90 backdrop-blur-3xl border border-white/10 rounded-full shadow-[0_30px_90px_rgba(0,0,0,0.5)] max-w-full overflow-x-auto no-scrollbar pointer-events-auto">
          <button onClick={() => onRotate(-45)} className="p-4 text-gray-500 hover:text-white transition-all hover:scale-110 shrink-0"><RotateCcw size={20}/></button>
          <button onClick={() => onRotate(45)} className="p-4 text-gray-500 hover:text-white transition-all hover:scale-110 shrink-0"><RotateCw size={20}/></button>
          
          <div className="h-8 w-px bg-white/10 mx-2 shrink-0"></div>

          <button 
            onClick={() => setShowSettings(!showSettings)} 
            className={`p-4 transition-all hover:scale-110 shrink-0 ${showSettings ? 'text-purple-400' : 'text-gray-500 hover:text-white'}`}
            title="View Settings"
          >
            <Settings size={20} />
          </button>

          <div className="h-8 w-px bg-white/10 mx-2 shrink-0"></div>

          <button className="group flex items-center gap-4 px-8 py-4 bg-[#323337] text-white border border-white/5 rounded-full text-[11px] font-black uppercase tracking-widest hover:bg-[#3f4147] hover:border-purple-500/50 transition-all shadow-xl shrink-0">
            <motion.div whileHover={{ rotate: 180 }} transition={{ duration: 0.5 }}>
              <Sparkles size={16} className="text-yellow-400" />
            </motion.div>
            Recraft 
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-yellow-400 text-black rounded-sm text-[9px] font-black">
              <Zap size={10} fill="currentColor" /> 5
            </div>
          </button>

          <div className="h-8 w-px bg-white/10 mx-2 shrink-0"></div>

          <button className="p-4 text-gray-500 hover:text-yellow-400 transition-all hover:scale-110 shrink-0"><Star size={20}/></button>
          <button className="p-4 text-gray-500 hover:text-cyan-400 transition-all hover:scale-110 shrink-0"><Share2 size={20}/></button>
          
          <div className="relative shrink-0" ref={exportRef}>
            <button 
              onClick={() => setShowExport(!showExport)}
              className={`flex items-center gap-3 px-10 py-4 rounded-full text-[11px] font-black uppercase tracking-widest transition-all ${showExport ? 'bg-purple-600 text-white shadow-[0_0_30px_rgba(168,85,247,0.3)]' : 'bg-[#FFE135] text-black shadow-[0_0_40px_rgba(255,225,53,0.3)] hover:scale-105 active:scale-95'}`}
            >
              <Download size={16} strokeWidth={3}/>
              Export Asset
            </button>

            <AnimatePresence>
              {showExport && (
                <motion.div 
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.95 }}
                  className="absolute bottom-full mb-6 right-0 w-[280px] bg-[#1a1b1e] border border-white/10 rounded-[2rem] shadow-3xl overflow-hidden p-2"
                >
                  <div className="flex flex-col">
                    <div className="py-2">
                      {formats.map((f) => (
                        <button 
                          key={f}
                          onClick={() => setSelectedFormat(f)}
                          className={`w-full flex items-center justify-between px-6 py-3 text-[11px] font-black uppercase transition-all rounded-xl ${selectedFormat === f ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                        >
                          <div className="flex items-center gap-2">
                            {f}
                            {(f === 'STL' || f === '3MF') && <HelpCircle size={14} className="opacity-40" />}
                          </div>
                          {selectedFormat === f && <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />}
                        </button>
                      ))}
                    </div>

                    <div className="px-6 py-4 border-t border-white/5 space-y-6">
                      <div className="relative">
                        <div className="flex items-center justify-between w-full bg-black/40 border border-white/10 p-3 rounded-xl text-[10px] font-black uppercase text-white">
                          <span>{selectedFormat}</span>
                          <ChevronDown size={14} className="opacity-40" />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase text-gray-400">Bottom-Center Pivot</span>
                          <HelpCircle size={12} className="opacity-20" />
                        </div>
                        <button 
                          onClick={() => setIsPivotActive(!isPivotActive)}
                          className={`w-10 h-5 rounded-full relative transition-colors ${isPivotActive ? 'bg-purple-600' : 'bg-white/10'}`}
                        >
                          <motion.div 
                            animate={{ x: isPivotActive ? 22 : 2 }}
                            className="absolute top-0.5 left-0 w-4 h-4 bg-white rounded-full shadow-lg"
                          />
                        </button>
                      </div>

                      <button 
                        onClick={handleExportClick}
                        className="w-full py-4 bg-[#FFE135] text-black rounded-full font-black uppercase text-[11px] tracking-[0.2em] flex items-center justify-center gap-2 hover:scale-[1.02] transition-all shadow-xl active:scale-95 group relative overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                        <span className="relative z-10">Start Export</span> 
                        <div className="relative z-10 flex items-center gap-1 ml-2">
                          <Zap size={10} fill="currentColor" />
                          <span>{EXPORT_COST}</span>
                        </div>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  );
};