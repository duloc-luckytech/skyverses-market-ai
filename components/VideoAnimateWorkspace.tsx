
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Zap, Download, Share2, 
  Loader2, RefreshCw, Layers, MonitorPlay,
  Film, User, Activity, ShieldCheck, 
  Settings2, ArrowRight, 
  Maximize2, Trash2, Lock, ExternalLink,
  Sparkles, History as HistoryIcon, Image as ImageIcon,
  ChevronDown, UserCircle, LayoutGrid,
  ChevronLeft, AlertCircle, Info,
  Move, Database, CheckCircle, Cpu,
  AlertTriangle, Globe, Server,
  Play, ArrowDown, ArrowRightCircle,
  Settings,
  Check
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Link } from 'react-router-dom';
import { useVideoAnimate, RATIOS, QUALITY_MODES } from '../hooks/useVideoAnimate';
import ResourceAuthModal from './common/ResourceAuthModal';
import { ResourceControl } from './fashion-studio/ResourceControl';

const EXAMPLE_MEDIA = {
  input: "https://help-static-aliyun-doc.aliyuncs.com/assets/img/en-US/3287512671/p1008736.jpeg",
  ref: "https://help-static-aliyun-doc.aliyuncs.com/file-manage-files/en-US/20251031/stylii/move_input_video+%282%29.mp4",
  output: "https://help-static-aliyun-doc.aliyuncs.com/file-manage-files/en-US/20251031/stalwr/move_output_std+%281%29.mp4"
};

const TEMPLATES = [
  {
    id: 't1',
    name: 'Street Dance Motion',
    desc: 'Diễn hoạt nhân vật nhảy đường phố cực mượt.',
    input: "https://help-static-aliyun-doc.aliyuncs.com/assets/img/en-US/3287512671/p1008736.jpeg",
    ref: "https://help-static-aliyun-doc.aliyuncs.com/file-manage-files/en-US/20251031/stylii/move_input_video+%282%29.mp4",
    tag: 'DYNAMIC'
  }
];

const VideoAnimateWorkspace: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { credits, isAuthenticated, login } = useAuth();
  const v = useVideoAnimate();
  
  const [showModelMenu, setShowModelMenu] = useState(false);
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const imgInputRef = useRef<HTMLInputElement>(null);
  const vidInputRef = useRef<HTMLInputElement>(null);

  const activeGradient = v.mode === 'MOTION' 
    ? 'from-cyan-500 to-blue-600 shadow-cyan-500/20' 
    : 'from-purple-600 to-fuchsia-600 shadow-purple-500/20';

  const hasEnoughCredits = credits >= v.estimatedCost;
  const hasJobs = v.tasks.length > 0;

  const handleApplyTemplate = (tmpl: typeof TEMPLATES[0]) => {
    v.setSourceImg(tmpl.input);
    v.setRefVideo(tmpl.ref);
    setShowTemplateModal(false);
  };

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (e) {
      window.open(url, '_blank');
    }
  };

  const renderInputs = () => {
    const identityInput = (
      <div key="identity-input" className="space-y-3">
        <label className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-2">
          <ImageIcon size={14} className="text-cyan-500" /> Identity
        </label>
        <div 
          className={`relative aspect-[3/4] rounded-2xl border-2 border-dashed transition-all overflow-hidden flex flex-col items-center justify-center gap-4 cursor-pointer group ${v.sourceImg ? 'border-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.1)]' : 'border-slate-200 dark:border-white/10 hover:border-cyan-500/40 bg-slate-50 dark:bg-white/[0.02]'}`}
          onClick={() => !v.sourceImg && imgInputRef.current?.click()}
        >
          {v.sourceImg ? (
            <>
              <img src={v.sourceImg} className="w-full h-full object-cover" alt="Identity" />
              <button 
                onClick={(e) => { e.stopPropagation(); v.setSourceImg(null); }}
                className="absolute top-3 right-3 p-1 bg-red-500 rounded-full hover:scale-110 transition-transform shadow-xl text-white"
              >
                <X size={12} strokeWidth={3} />
              </button>
            </>
          ) : (
            <div className="text-center space-y-2 p-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-600 mx-auto group-hover:scale-110 transition-transform shadow-inner">
                <User size={28} />
              </div>
              <p className="text-[9px] font-black uppercase text-slate-400">Tải ảnh mẫu</p>
            </div>
          )}
          <input type="file" ref={imgInputRef} className="hidden" accept="image/*" onChange={(e) => v.handleFileUpload(e, 'IMG')} />
        </div>
      </div>
    );

    const motionInput = (
      <div key="motion-input" className="space-y-3">
        <label className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-2">
          <Film size={14} className="text-purple-500" /> Motion
        </label>
        <div 
          className={`relative aspect-[3/4] rounded-2xl border-2 border-dashed transition-all overflow-hidden flex flex-col items-center justify-center gap-4 cursor-pointer group ${v.refVideo ? 'border-purple-500 shadow-[0_0_30px_rgba(147,51,234,0.1)]' : 'border-slate-200 dark:border-white/10 hover:border-purple-500/40 bg-slate-50 dark:bg-white/[0.02]'}`}
          onClick={() => !v.refVideo && vidInputRef.current?.click()}
        >
          {v.refVideo ? (
            <>
              <div className="w-full h-full bg-slate-900 dark:bg-black flex items-center justify-center">
                <Film className="text-purple-500 animate-pulse" size={48} />
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); v.setRefVideo(null); }}
                className="absolute top-3 right-3 p-1 bg-red-500 rounded-full hover:scale-110 transition-transform shadow-xl text-white"
              >
                <X size={12} strokeWidth={3} />
              </button>
            </>
          ) : (
            <div className="text-center space-y-2 p-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-600 mx-auto group-hover:scale-110 transition-transform">
                <MonitorPlay size={28} />
              </div>
              <p className="text-[9px] font-black uppercase text-slate-400">Tải video mẫu</p>
            </div>
          )}
          <input type="file" ref={vidInputRef} className="hidden" accept="video/*" onChange={(e) => v.handleFileUpload(e, 'VID')} />
        </div>
      </div>
    );

    return v.mode === 'SWAP' ? [motionInput, identityInput] : [identityInput, motionInput];
  };

  return (
    <div className="h-full w-full flex flex-col bg-[#fcfcfd] dark:bg-[#0c0c0e] text-slate-900 dark:text-white font-sans overflow-hidden transition-all duration-500 selection:bg-brand-blue/30 overflow-x-hidden">
      
      {/* --- HEADER --- */}
      <header className="h-16 border-b border-black/5 dark:border-white/5 flex items-center justify-between px-6 shrink-0 z-50 bg-white/80 dark:bg-[#0c0c0c]/80 backdrop-blur-md transition-colors">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-2 text-slate-400 dark:text-gray-500 hover:text-slate-900 dark:hover:text-white transition-colors bg-black/5 dark:bg-white/5 rounded-full">
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-cyan-500 rounded-md flex items-center justify-center shadow-lg text-white">
              <Film size={16} fill="currentColor" />
            </div>
            <span className="text-lg font-black tracking-tight italic uppercase">Animate Studio</span>
          </div>
        </div>

        {/* MODE TOGGLE */}
        <div className="flex bg-slate-100 dark:bg-[#1a1a1a] p-1 rounded-xl border border-black/5 dark:border-white/10 shadow-inner transition-colors">
           <button 
             onClick={() => v.setMode('MOTION')}
             className={`px-8 py-2 rounded-lg text-[11px] font-black uppercase flex items-center gap-2.5 transition-all duration-300 ${v.mode === 'MOTION' ? 'bg-cyan-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)]' : 'text-slate-500 dark:text-gray-500 hover:text-slate-900 dark:hover:text-white'}`}
           >
              <Move size={14} /> Motion
           </button>
           <button 
             onClick={() => v.setMode('SWAP')}
             className={`px-8 py-2 rounded-lg text-[11px] font-black uppercase flex items-center gap-2.5 transition-all duration-300 ${v.mode === 'SWAP' ? 'bg-purple-600 text-white shadow-[0_0_20px_rgba(147,51,234,0.4)]' : 'text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'}`}
           >
              <User size={14} /> Swap
           </button>
        </div>

        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2 px-4 py-1.5 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-full">
              <Zap size={10} className="text-yellow-500" fill="currentColor" />
              <span className="text-[11px] font-black italic">{(credits || 0).toLocaleString()} CR</span>
           </div>
        </div>
      </header>

      {/* --- MAIN WORKSPACE FULL WIDTH --- */}
      <div className="flex-grow flex overflow-hidden">
        
        {/* 1. LEFT COLUMN: CONTROLS (1/3) */}
        <div className="w-[400px] xl:w-[480px] shrink-0 border-r border-black/5 dark:border-white/5 bg-white dark:bg-[#0d0d0f] flex flex-col transition-all duration-500">
           <div className="flex-grow overflow-y-auto no-scrollbar p-8 space-y-10">
              {/* ASSET UPLOAD */}
              <div className="grid grid-cols-2 gap-6 relative z-10">
                 {renderInputs()}
              </div>

              {/* INFRASTRUCTURE CONFIG */}
              <div className="space-y-6 pt-6 border-t border-black/5 dark:border-white/5 relative z-20">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest italic flex items-center gap-2">
                      <Globe size={12} className="text-brand-blue" /> Source
                    </label>
                    <select 
                      value={v.selectedEngine}
                      onChange={(e) => v.setSelectedEngine(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 p-3 rounded-xl text-[10px] font-black uppercase outline-none focus:border-brand-blue transition-colors text-slate-900 dark:text-white cursor-pointer shadow-inner"
                    >
                      <option value="wan">Wan Direct</option>
                      <option value="fxlab">Fxlab Node</option>
                      <option value="gommo">Gommo Cluster</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest italic flex items-center gap-2">
                      <Server size={12} className="text-brand-blue" /> Model
                    </label>
                    <div className="relative">
                      <button 
                        onClick={() => setShowModelMenu(!showModelMenu)}
                        className="w-full bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 p-3 rounded-xl flex items-center justify-between group hover:border-brand-blue/30 transition-all shadow-inner"
                      >
                        <span className="font-black text-[10px] tracking-tight uppercase italic truncate pr-4">
                          {v.selectedModel?.name || 'Đang tải...'}
                        </span>
                        <ChevronDown size={14} className={`text-slate-400 transition-transform ${showModelMenu ? 'rotate-180' : ''}`} />
                      </button>
                      
                      <AnimatePresence>
                        {showModelMenu && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                            className="absolute bottom-full mb-2 w-full bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-2xl shadow-3xl p-2 z-[110] overflow-hidden max-h-60 overflow-y-auto no-scrollbar"
                          >
                            {v.availableModels.map(m => (
                              <button 
                                key={m._id} 
                                onClick={() => { v.setSelectedModel(m); setShowModelMenu(false); }}
                                className={`w-full p-4 flex flex-col items-start rounded-xl transition-all ${v.selectedModel?._id === m._id ? 'bg-brand-blue/10 text-brand-blue' : 'hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-gray-400'}`}
                              >
                                <p className="text-[10px] font-black uppercase italic">{m.name}</p>
                                <p className="text-[8px] font-medium opacity-60 uppercase tracking-widest mt-1 line-clamp-1">{m.description || 'Professional production model'}</p>
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </div>

              {/* SPECS */}
              <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest italic">Độ phân giải</label>
                    <select 
                      value={v.selectedQuality} 
                      onChange={e => v.setSelectedQuality(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 p-3 rounded-xl text-[10px] font-black uppercase outline-none focus:border-brand-blue transition-colors text-slate-900 dark:text-white shadow-inner"
                    >
                      {QUALITY_MODES.map(q => <option key={q} value={q}>{q}</option>)}
                    </select>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest italic">Tỉ lệ</label>
                    <select 
                      value={v.selectedRatio} 
                      onChange={e => v.setSelectedRatio(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 p-3 rounded-xl text-[10px] font-black uppercase outline-none focus:border-brand-blue transition-colors text-slate-900 dark:text-white shadow-inner"
                    >
                      {RATIOS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                 </div>
              </div>
           </div>

           {/* ACTION FOOTER */}
           <div className="p-8 border-t border-black/5 dark:border-white/5 bg-slate-50/50 dark:bg-black/20 shrink-0 space-y-4 transition-colors">
              <div className="flex items-center justify-between px-1 mb-2">
                 <div className="flex items-center gap-2">
                    <div className="flex flex-col">
                       <span className="text-[8px] font-black text-slate-400 dark:text-gray-600 uppercase tracking-widest italic leading-none mb-1">Balance</span>
                       <span className={`text-[11px] font-black italic leading-none ${v.usagePreference === 'key' ? 'text-purple-500' : 'text-brand-blue'}`}>
                          {v.usagePreference === 'key' ? 'PERSONAL KEY' : `${(credits || 0).toLocaleString()} CR`}
                       </span>
                    </div>
                    <button onClick={() => setShowResourceModal(true)} className="p-1 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-md hover:text-brand-blue transition-all">
                       <Settings size={12} />
                    </button>
                 </div>
                 <div className="text-right flex flex-col items-end">
                    <span className="text-[8px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest mb-1 italic">Chi phí ước tính</span>
                    <div className="flex items-center gap-1.5 text-orange-500 leading-none">
                       <Zap size={10} fill="currentColor" />
                       <span className="text-[11px] font-black italic">{v.estimatedCost} credits</span>
                    </div>
                 </div>
              </div>

              <button 
                 onClick={v.handleSynthesize}
                 disabled={v.isGenerating || !v.sourceImg || !v.selectedModel}
                 className={`w-full py-6 rounded-2xl flex items-center justify-center gap-4 text-[13px] font-black uppercase tracking-[0.3em] shadow-xl transition-all active:scale-[0.97] group overflow-hidden relative ${v.sourceImg && v.selectedModel ? `bg-gradient-to-r ${activeGradient} text-white` : 'bg-slate-200 dark:bg-[#222] text-slate-400 dark:text-gray-500 cursor-not-allowed grayscale'}`}
              >
                 <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                 {v.isGenerating ? <Loader2 size={20} className="animate-spin" /> : <Zap size={20} fill="currentColor" />}
                 KHỞI CHẠY STUDIO
              </button>
              
              {!hasEnoughCredits && v.sourceImg && (
                <div className="flex items-center justify-center gap-2 text-amber-500 animate-pulse">
                  <AlertTriangle size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Số dư cạn kiệt (Cần {v.estimatedCost} CR)</span>
                </div>
              )}
           </div>
        </div>

        {/* 2. RIGHT COLUMN: VIEWPORT & HISTORY (2/3) */}
        <div className="flex-grow flex flex-col bg-[#f0f1f4] dark:bg-[#050507] overflow-hidden relative">
           
           <AnimatePresence mode="wait">
              {hasJobs ? (
                 /* GRID VIEW OF RESULTS & HISTORY */
                 <motion.div 
                    key="results-grid"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="flex-grow overflow-y-auto no-scrollbar p-10 space-y-12"
                 >
                    <div className="max-w-[1400px] mx-auto space-y-12">
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                             <div className="p-2 bg-brand-blue/10 rounded-lg text-brand-blue">
                                <LayoutGrid size={24} />
                             </div>
                             <div className="space-y-0.5">
                                <h3 className="text-xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">Sản phẩm hiện tại</h3>
                             </div>
                          </div>
                          <div className="flex items-center gap-4">
                             <button onClick={() => setShowTemplateModal(true)} className="px-6 py-2 bg-purple-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:brightness-110 transition-all shadow-lg"><Sparkles size={14}/> Template</button>
                             <button onClick={() => v.setTasks([])} className="px-6 py-2 border border-black/5 dark:border-white/5 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500 transition-all">Dọn dẹp</button>
                          </div>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                          {v.tasks.map((task) => (
                             <motion.div 
                                key={task.id}
                                layout
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                className="group relative bg-white dark:bg-[#111] border border-black/5 dark:border-white/5 rounded-[2rem] overflow-hidden shadow-xl hover:shadow-2xl transition-all hover:border-brand-blue/40"
                             >
                                <div className="aspect-video bg-black relative overflow-hidden flex items-center justify-center">
                                   {task.status === 'processing' ? (
                                      <div className="flex flex-col items-center gap-4">
                                         <Loader2 size={40} className="text-cyan-500 animate-spin" />
                                         <p className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-500 animate-pulse">Rendering...</p>
                                      </div>
                                   ) : task.url ? (
                                      <>
                                         <video src={task.url} autoPlay loop muted className="w-full h-full object-cover" />
                                         <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Play size={40} fill="white" className="text-white ml-2" />
                                         </div>
                                      </>
                                   ) : (
                                      <div className="flex flex-col items-center justify-center text-red-500 gap-3 p-6 text-center">
                                         <AlertCircle size={32} />
                                         <p className="text-[10px] font-black uppercase italic">Video tạo lỗi</p>
                                      </div>
                                   )}
                                   
                                   <div className="absolute top-4 left-4 flex gap-2">
                                      <span className={`px-3 py-1 rounded text-[8px] font-black uppercase text-white shadow-xl ${task.type === 'MOTION' ? 'bg-cyan-500' : 'bg-purple-600'}`}>{task.type}</span>
                                      {task.status === 'completed' && <span className="bg-emerald-500 text-white px-2 py-1 rounded text-[8px] font-black">STABLE</span>}
                                   </div>

                                   <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                      {task.url && <button onClick={() => handleDownload(task.url!, `render_${task.id}.mp4`)} className="p-2.5 bg-white text-black rounded-lg shadow-xl hover:scale-110 transition-transform"><Download size={16} /></button>}
                                      <button onClick={() => v.setTasks(prev => prev.filter(t => t.id !== task.id))} className="p-2.5 bg-white text-red-500 rounded-lg shadow-xl hover:scale-110 transition-transform"><Trash2 size={16}/></button>
                                   </div>
                                </div>
                                <div className="p-6 space-y-4">
                                   <div className="flex justify-between items-start">
                                      <div className="space-y-1">
                                         <h4 className="text-sm font-black uppercase italic tracking-tighter text-slate-800 dark:text-white truncate max-w-[200px]">"{task.model}"</h4>
                                         <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                            <HistoryIcon size={12} /> {task.timestamp}
                                         </p>
                                      </div>
                                      <div className="flex items-center gap-2">
                                         <button className="p-2 text-gray-400 hover:text-brand-blue transition-colors"><Share2 size={14}/></button>
                                      </div>
                                   </div>
                                </div>
                             </motion.div>
                          ))}
                       </div>
                    </div>
                 </motion.div>
              ) : (
                 /* EMPTY STATE SHOWING TOOL DESCRIPTION & EXAMPLE */
                 <motion.div 
                    key="intel-view"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="flex-grow flex flex-col p-10 xl:p-16 overflow-y-auto no-scrollbar"
                 >
                    <div className="max-w-6xl mx-auto w-full space-y-16">
                       <div className="grid grid-cols-1 xl:grid-cols-2 gap-16 items-start">
                          <div className="space-y-10">
                             <div className="flex items-center gap-6">
                                <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center shadow-2xl transition-all duration-700 ${v.mode === 'MOTION' ? 'bg-cyan-500 shadow-cyan-500/20' : 'bg-purple-600 shadow-purple-500/20'}`}>
                                  <Sparkles size={40} className="text-white" />
                                </div>
                                <div className="space-y-1">
                                  <h3 className="text-4xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white leading-none">Motion AI</h3>
                                  <p className="text-[11px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-[0.4em] italic leading-none">Kinetic_Orchestrator_Active</p>
                                </div>
                             </div>

                             <div className="space-y-6">
                                <h4 className="text-[12px] font-black uppercase tracking-[0.5em] text-cyan-500 italic flex items-center gap-4">
                                  <Layers size={18} /> Engine Capabilities
                                </h4>
                                <div className="space-y-4">
                                   <p className="text-xl text-slate-700 dark:text-gray-200 font-bold leading-relaxed uppercase tracking-tight italic border-l-4 border-brand-blue pl-8 transition-colors">
                                      Makes a person in an image move based on a reference video.
                                   </p>
                                   <p className="text-sm text-slate-500 dark:text-gray-400 font-medium leading-relaxed italic pl-8">
                                      You can input an image and a video to generate a new video that keeps the image's background and follows the actions in the reference video.
                                   </p>
                                </div>
                             </div>

                             <div className="grid grid-cols-2 gap-4 pt-4">
                                {[
                                   { label: 'IDENTITY LOCK', desc: 'Duy trì nhân dạng' },
                                   { label: 'BACKGROUND FIX', desc: 'Giữ nguyên bối cảnh' },
                                   { label: 'ACTION SYNC', desc: 'Đồng bộ hành động' },
                                   { label: '60FPS FLOW', desc: 'Chuyển động mượt' }
                                ].map(chip => (
                                   <div key={chip.label} className="p-4 bg-white dark:bg-white/[0.03] border border-black/5 dark:border-white/5 rounded-xl flex items-center gap-3 group hover:border-brand-blue/30 transition-all">
                                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                      <div className="flex flex-col">
                                         <span className="text-[10px] font-black uppercase tracking-widest text-slate-800 dark:text-white">{chip.label}</span>
                                         <span className="text-[8px] font-bold text-gray-400 uppercase italic">{chip.desc}</span>
                                      </div>
                                   </div>
                                ))}
                             </div>
                             
                             <div className="pt-6">
                                <button onClick={() => setShowTemplateModal(true)} className="px-12 py-5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-[0.3em] flex items-center justify-center gap-4 shadow-2xl hover:scale-105 active:scale-95 transition-all group">
                                   <LayoutGrid size={20} className="group-hover:rotate-12 transition-transform" /> Mở thư viện Template
                                </button>
                             </div>
                          </div>

                          {/* EXAMPLE FLOW SECTION */}
                          <div className="space-y-8">
                             <div className="flex items-center justify-between px-2">
                                <div className="flex items-center gap-3 text-[11px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-[0.4em]">
                                   <LayoutGrid size={18} /> Industrial Sample Flow
                                </div>
                                <span className="text-[8px] font-black text-brand-blue uppercase opacity-50">Reference: Standard_Uplink</span>
                             </div>

                             <div className="grid grid-cols-2 gap-6">
                                {/* Input Image */}
                                <div className="space-y-3">
                                   <p className="text-[9px] font-black text-slate-400 dark:text-gray-600 uppercase tracking-widest ml-2 italic flex items-center gap-2">
                                      <div className="w-1 h-1 rounded-full bg-cyan-500"></div> Input Image
                                   </p>
                                   <div className="aspect-[3/4] bg-slate-100 dark:bg-black border border-black/5 dark:border-white/5 rounded-[1.5rem] relative overflow-hidden group/img shadow-xl">
                                      <img src={EXAMPLE_MEDIA.input} className="w-full h-full object-cover grayscale opacity-60 group-hover/img:grayscale-0 group-hover/img:opacity-100 transition-all duration-1000" alt="Sample Input" />
                                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity">
                                         <div className="p-3 bg-white/20 backdrop-blur-md rounded-full border border-white/20 text-white shadow-2xl">
                                            <ImageIcon size={20} />
                                         </div>
                                      </div>
                                   </div>
                                </div>

                                {/* Ref Video */}
                                <div className="space-y-3">
                                   <p className="text-[9px] font-black text-slate-400 dark:text-gray-600 uppercase tracking-widest ml-2 italic flex items-center gap-2">
                                      <div className="w-1 h-1 rounded-full bg-purple-500"></div> Reference Video
                                   </p>
                                   <div className="aspect-[3/4] bg-slate-100 dark:bg-black border border-black/5 dark:border-white/5 rounded-[1.5rem] relative overflow-hidden group/vid shadow-xl">
                                      <video src={EXAMPLE_MEDIA.ref} autoPlay loop muted playsInline className="w-full h-full object-cover opacity-60 group-hover/vid:opacity-100 transition-opacity" />
                                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                         <div className="w-10 h-10 rounded-full bg-purple-600/80 flex items-center justify-center text-white shadow-2xl animate-pulse">
                                            <Play size={16} fill="white" className="ml-1" />
                                         </div>
                                      </div>
                                   </div>
                                </div>

                                {/* Result Output */}
                                <div className="col-span-2 space-y-4 pt-4 border-t border-black/5 dark:border-white/5">
                                   <div className="flex justify-between items-center px-2">
                                      <p className="text-[10px] font-black text-brand-blue uppercase tracking-[0.3em] italic flex items-center gap-2">
                                         <Sparkles size={14} fill="currentColor" /> Final Output Video
                                      </p>
                                      <span className="text-[8px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">QUALITY: VERIFIED</span>
                                   </div>
                                   <div className="aspect-video bg-slate-100 dark:bg-black border-2 border-brand-blue/30 rounded-[2rem] relative overflow-hidden group/res shadow-3xl">
                                      <video src={EXAMPLE_MEDIA.output} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover/res:opacity-100 transition-opacity"></div>
                                      <div className="absolute bottom-6 left-6 flex items-center gap-4 opacity-0 group-hover/res:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                                         <button onClick={() => handleDownload(EXAMPLE_MEDIA.output, "sample_output.mp4")} className="px-6 py-2 bg-white text-black rounded-full text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-2xl flex items-center gap-2">
                                            <Download size={14} /> Download Sample
                                         </button>
                                      </div>
                                   </div>
                                </div>
                             </div>
                          </div>
                       </div>
                    </div>
                 </motion.div>
              )}
           </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {showTemplateModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[600] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 md:p-12"
          >
             <motion.div 
               initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
               className="bg-white dark:bg-[#0d0d0f] border border-white/10 rounded-[2.5rem] w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden shadow-3xl"
             >
                <div className="p-8 border-b border-black/5 dark:border-white/10 flex items-center justify-between bg-slate-50 dark:bg-black/40 shrink-0">
                   <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-purple-600/10 rounded-xl text-purple-500">
                         <LayoutGrid size={24} />
                      </div>
                      <div className="space-y-0.5">
                         <h2 className="text-xl font-black uppercase tracking-tight italic text-slate-900 dark:text-white leading-none">Thư viện Template</h2>
                         <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none">Lựa chọn mẫu có sẵn để bắt đầu nhanh</p>
                      </div>
                   </div>
                   <button onClick={() => setShowTemplateModal(false)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                      <X size={28} />
                   </button>
                </div>
                
                <div className="flex-grow overflow-y-auto no-scrollbar p-10">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {TEMPLATES.map(tmpl => (
                        <div key={tmpl.id} className="group bg-slate-50 dark:bg-white/[0.03] border border-black/5 dark:border-white/5 rounded-3xl p-6 hover:border-purple-500 transition-all shadow-sm hover:shadow-2xl">
                           <div className="flex gap-4 mb-6">
                              <div className="w-20 aspect-[3/4] bg-black rounded-xl overflow-hidden border border-white/10 shadow-lg">
                                 <img src={tmpl.input} className="w-full h-full object-cover" alt="Input" />
                              </div>
                              <div className="flex-grow aspect-[3/4] bg-black rounded-xl overflow-hidden border border-white/10 shadow-lg relative">
                                 <video src={tmpl.ref} autoPlay loop muted className="w-full h-full object-cover opacity-60" />
                                 <div className="absolute inset-0 flex items-center justify-center">
                                    <Play size={20} fill="white" className="text-white opacity-40" />
                                 </div>
                              </div>
                           </div>
                           <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                 <h4 className="text-lg font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">{tmpl.name}</h4>
                                 <span className="px-2 py-0.5 bg-brand-blue/10 text-brand-blue text-[8px] font-black uppercase rounded-sm">{tmpl.tag}</span>
                              </div>
                              <p className="text-xs text-gray-500 font-medium leading-relaxed italic">"{tmpl.desc}"</p>
                              <button 
                                onClick={() => handleApplyTemplate(tmpl)}
                                className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-black rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-brand-blue dark:hover:bg-purple-600 dark:hover:text-white transition-all shadow-xl active:scale-95"
                              >
                                 <button><Check size={16} strokeWidth={3} /></button> Sử dụng Template
                              </button>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
                
                <div className="p-8 border-t border-black/5 dark:border-white/10 bg-slate-50 dark:bg-black/40 text-center shrink-0">
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.4em] italic leading-none">Industrial Design // Prototype_Vault_01</p>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ResourceAuthModal 
        isOpen={showResourceModal} 
        onClose={() => setShowResourceModal(false)} 
        onConfirm={(pref) => {
          v.setUsagePreference(pref as any);
          localStorage.setItem('skyverses_usage_preference', pref);
          setShowResourceModal(false);
        }} 
        hasPersonalKey={v.usagePreference === 'key' || !!localStorage.getItem('skyverses_model_vault')} 
        totalCost={v.estimatedCost} 
      />

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default VideoAnimateWorkspace;
