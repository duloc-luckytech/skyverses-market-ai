
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Upload, Wand2, Play, Download, Share2, 
  Loader2, Zap, RefreshCw, Layers, MonitorPlay,
  Film, User, Activity, ShieldCheck, 
  Settings2, Sliders, ArrowRight, CornerDownRight,
  Maximize2, Trash2, Camera, Lock, ExternalLink,
  Sparkles, History as HistoryIcon, Image as ImageIcon,
  ChevronDown, ChevronRight, UserCircle, LayoutGrid,
  ChevronLeft, AlertCircle, Info, MoreHorizontal,
  Move, Database, CheckCircle, Cpu, ChevronUp,
  AlertTriangle
} from 'lucide-react';
import { generateDemoVideo } from '../services/gemini';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Link } from 'react-router-dom';

const MODELS = [
  { id: 'kling-2.6', name: 'Kling 2.6 - Motion ✨', provider: 'Kling AI', desc: 'Đỉnh cao về chuyển động vật lý và độ chi tiết.' },
  { id: 'wan-2.2', name: 'Wan 2.2 - Video Animate', provider: 'Wan AI', desc: 'Tối ưu cho việc giữ nhất quán khuôn mặt và nhân vật.' }
];

const RATIOS = ['Auto', '16:9', '9:16', '1:1', '4:3'];
const MODES = ['Standard - 720p', 'High - 1080p', 'Ultra - 4K (Coming)'];

const DEMOS = [
  { id: 1, label: 'Motion', color: 'bg-cyan-500', thumb: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=400' },
  { id: 2, label: 'Swap', color: 'bg-purple-500', thumb: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=400' },
  { id: 3, label: 'Dance', color: 'bg-orange-500', thumb: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=400' },
  { id: 4, label: 'Action', color: 'bg-emerald-500', thumb: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=400' },
];

interface RenderTask {
  id: string;
  status: 'processing' | 'completed' | 'error';
  url: string | null;
  type: 'MOTION' | 'SWAP';
  thumb: string | null;
  timestamp: string;
  model: string;
}

const VideoAnimateWorkspace: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { lang, t } = useLanguage();
  const { theme } = useTheme();
  const { credits, useCredits, isAuthenticated, login } = useAuth();
  
  // -- App States --
  const [mode, setMode] = useState<'MOTION' | 'SWAP'>('MOTION');
  const [selectedModel, setSelectedModel] = useState(MODELS[0]);
  const [selectedRatio, setSelectedRatio] = useState(RATIOS[0]);
  const [selectedQuality, setSelectedQuality] = useState(MODES[0]);
  
  // -- Asset States --
  const [sourceImg, setSourceImg] = useState<string | null>(null);
  const [refVideo, setRefVideo] = useState<string | null>(null);
  
  // -- Dropdown States --
  const [showModelMenu, setShowModelMenu] = useState(false);
  const [showRatioMenu, setShowRatioMenu] = useState(false);
  const [showQualityMenu, setShowQualityMenu] = useState(false);

  // -- Task Management --
  const [tasks, setTasks] = useState<RenderTask[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [needsKey, setNeedsKey] = useState(false);
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);
  const [showLowCreditAlert, setShowLowCreditAlert] = useState(false);

  const imgInputRef = useRef<HTMLInputElement>(null);
  const vidInputRef = useRef<HTMLInputElement>(null);

  // Calculate dynamic cost
  const estimatedCost = selectedQuality.includes('1080') ? 50 : 25;
  const hasEnoughCredits = credits >= estimatedCost;

  // Check key on mount
  useEffect(() => {
    const check = async () => {
      if ((window as any).aistudio) {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        if (!process.env.API_KEY && !hasKey) setNeedsKey(true);
      }
    };
    check();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'IMG' | 'VID') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'IMG') setSourceImg(reader.result as string);
        else setRefVideo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSynthesize = async () => {
    if (!sourceImg || isGenerating) return;
    if (!isAuthenticated) { login(); return; }
    
    if (!hasEnoughCredits) { 
      setShowLowCreditAlert(true);
      return; 
    }

    const taskId = Date.now().toString();
    const newTask: RenderTask = {
      id: taskId,
      status: 'processing',
      url: null,
      type: mode,
      thumb: sourceImg,
      model: selectedModel.name,
      timestamp: new Date().toLocaleTimeString()
    };

    setTasks(prev => [newTask, ...prev]);
    setIsGenerating(true);
    setIsHistoryExpanded(true); // Auto expand on new job

    try {
      const success = useCredits(estimatedCost);
      if (!success) throw new Error("Deduction failed");

      const directive = `${mode === 'MOTION' ? 'Motion Transfer' : 'Face Swap'} using ${selectedModel.id}. Ratio: ${selectedRatio}. Identity locked.`;
      
      const url = await generateDemoVideo({
        prompt: directive,
        references: [sourceImg],
        resolution: selectedQuality.includes('1080') ? '1080p' : '720p'
      });
      
      if (url) {
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'completed', url: url } : t));
      } else {
        throw new Error("Empty result");
      }
    } catch (err: any) {
      console.error(err);
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'error' } : t));
      if (err?.message?.includes("Requested entity was not found")) setNeedsKey(true);
    } finally {
      setIsGenerating(false);
    }
  };

  const activeGradient = mode === 'MOTION' 
    ? 'from-cyan-500 to-blue-600 shadow-cyan-500/20' 
    : 'from-purple-600 to-fuchsia-600 shadow-purple-500/20';

  const processingCount = tasks.filter(t => t.status === 'processing').length;
  const isHistoryVisible = isHistoryExpanded || processingCount > 0;

  return (
    <div className="h-full w-full flex flex-col bg-[#fcfcfd] dark:bg-[#0c0c0c] text-slate-900 dark:text-white font-sans overflow-hidden transition-all duration-500 selection:bg-brand-blue/30">
      
      {/* --- HEADER --- */}
      <header className="h-16 border-b border-black/5 dark:border-white/5 flex items-center justify-between px-6 shrink-0 z-50 bg-white/80 dark:bg-[#0c0c0c]/80 backdrop-blur-md transition-colors">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-2 text-slate-400 dark:text-gray-500 hover:text-slate-900 dark:hover:text-white transition-colors bg-black/5 dark:bg-white/5 rounded-full">
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-cyan-500 rounded-md flex items-center justify-center shadow-lg">
              <Film size={16} className="text-white dark:text-black" fill="currentColor" />
            </div>
            <span className="text-lg font-black tracking-tight italic uppercase">Video Animate</span>
          </div>
        </div>

        {/* MODE TOGGLE */}
        <div className="flex bg-slate-100 dark:bg-[#1a1a1a] p-1 rounded-xl border border-black/5 dark:border-white/10 shadow-inner transition-colors">
           <button 
             onClick={() => setMode('MOTION')}
             className={`px-8 py-2 rounded-lg text-[11px] font-black uppercase flex items-center gap-2.5 transition-all duration-300 ${mode === 'MOTION' ? 'bg-cyan-500 text-white dark:text-black shadow-[0_0_20px_rgba(6,182,212,0.4)]' : 'text-slate-500 dark:text-gray-500 hover:text-slate-900 dark:hover:text-white'}`}
           >
              <Move size={14} /> Motion
           </button>
           <button 
             onClick={() => setMode('SWAP')}
             className={`px-8 py-2 rounded-lg text-[11px] font-black uppercase flex items-center gap-2.5 transition-all duration-300 ${mode === 'SWAP' ? 'bg-purple-600 text-white shadow-[0_0_20px_rgba(147,51,234,0.4)]' : 'text-slate-500 dark:text-gray-500 hover:text-slate-900 dark:hover:text-white'}`}
           >
              <User size={14} /> Swap
           </button>
        </div>

        {/* User Stats */}
        <div className="flex items-center gap-4">
           <Link to="/credits" className="flex items-center gap-2 px-4 py-2 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-all">
              <Zap size={14} className="text-yellow-500" fill="currentColor" />
              <span className="text-xs font-black">{credits.toLocaleString()}</span>
           </Link>
        </div>
      </header>

      {/* --- MAIN WORKSPACE --- */}
      <div className="flex-grow flex overflow-hidden p-6 lg:p-10 gap-8 justify-center items-start">
        
        {/* 1. LEFT PANEL: INPUT & CONFIG */}
        <div className="w-full max-w-[580px] flex flex-col h-full bg-white dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-[2rem] overflow-hidden shadow-2xl relative transition-colors">
           
           {/* SCROLLABLE CONTENT AREA */}
           <div className="flex-grow overflow-y-auto no-scrollbar p-8 space-y-8">
              <div className="absolute top-0 right-0 p-12 opacity-[0.03] dark:opacity-[0.02] pointer-events-none text-slate-900 dark:text-white">
                 <Settings2 size={200} />
              </div>

              {/* DUAL ASSET UPLOAD */}
              <div className="grid grid-cols-2 gap-6 relative z-10">
                 {/* Image Input */}
                 <div className="space-y-4">
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-[0.3em]">
                       <ImageIcon size={14} className="text-cyan-500" /> Input Image
                    </div>
                    <div 
                      className={`relative aspect-[3/4] rounded-2xl border-2 border-dashed transition-all overflow-hidden flex flex-col items-center justify-center gap-4 cursor-pointer group ${sourceImg ? 'border-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.1)]' : 'border-slate-200 dark:border-white/10 hover:border-cyan-500/40 bg-slate-50 dark:bg-white/[0.02]'}`}
                      onClick={() => !sourceImg && imgInputRef.current?.click()}
                    >
                       {sourceImg ? (
                          <>
                             <img src={sourceImg} className="w-full h-full object-cover" alt="Identity" />
                             <button 
                               onClick={(e) => { e.stopPropagation(); setSourceImg(null); }}
                               className="absolute top-4 right-4 p-1.5 bg-red-500 rounded-full hover:scale-110 transition-transform shadow-xl text-white"
                             >
                                <X size={14} strokeWidth={3} />
                             </button>
                          </>
                       ) : (
                          <>
                             <div className="w-12 h-12 rounded-full bg-cyan-500/10 dark:bg-cyan-500/20 flex items-center justify-center text-cyan-600 dark:text-cyan-500 shadow-inner group-hover:scale-110 transition-transform">
                                <User size={28} />
                             </div>
                             <div className="text-center space-y-1">
                                <p className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-white">Upload ảnh</p>
                                <p className="text-[10px] text-slate-400 dark:text-gray-500 font-bold uppercase">Nhân vật của bạn</p>
                             </div>
                          </>
                       )}
                       <input type="file" ref={imgInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'IMG')} />
                    </div>
                 </div>

                 {/* Video Input (Motion Ref) */}
                 <div className="space-y-4">
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-[0.3em]">
                       <Film size={14} className="text-purple-500" /> Input Video
                    </div>
                    <div 
                      className={`relative aspect-[3/4] rounded-2xl border-2 border-dashed transition-all overflow-hidden flex flex-col items-center justify-center gap-4 cursor-pointer group ${refVideo ? 'border-purple-500 shadow-[0_0_30px_rgba(147,51,234,0.1)]' : 'border-slate-200 dark:border-white/10 hover:border-purple-500/40 bg-slate-50 dark:bg-white/[0.02]'}`}
                      onClick={() => !refVideo && vidInputRef.current?.click()}
                    >
                       {refVideo ? (
                          <>
                             <div className="w-full h-full bg-slate-900 dark:bg-black flex items-center justify-center">
                               <Film className="text-purple-500 animate-pulse" size={32} />
                             </div>
                             <button 
                               onClick={(e) => { e.stopPropagation(); setRefVideo(null); }}
                               className="absolute top-4 right-4 p-1.5 bg-red-500 rounded-full hover:scale-110 transition-transform shadow-xl text-white"
                             >
                                <X size={14} strokeWidth={3} />
                             </button>
                          </>
                       ) : (
                          <>
                             <div className="w-12 h-12 rounded-full bg-purple-500/10 dark:bg-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-500 shadow-inner group-hover:scale-110 transition-transform">
                                <MonitorPlay size={28} />
                             </div>
                             <div className="text-center space-y-1">
                                <p className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-white">Upload video</p>
                                <p className="text-[10px] text-slate-400 dark:text-gray-500 font-bold uppercase">Mẫu chuyển động</p>
                             </div>
                          </>
                       )}
                       <input type="file" ref={vidInputRef} className="hidden" accept="video/*" onChange={(e) => handleFileUpload(e, 'VID')} />
                    </div>
                 </div>
              </div>

              {/* MODEL SELECTOR */}
              <div className="space-y-4 pt-4 relative">
                 <p className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-[0.4em] text-center italic">Orchestration Model</p>
                 <div className="relative">
                    <button 
                      onClick={() => setShowModelMenu(!showModelMenu)}
                      className="w-full bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 p-5 rounded-2xl flex items-center justify-between group hover:border-brand-blue/30 transition-all shadow-sm"
                    >
                       <div className="flex items-center gap-4">
                          <Cpu size={18} className="text-brand-blue" />
                          <span className="font-black text-sm tracking-tight uppercase italic text-slate-900 dark:text-white">{selectedModel.name}</span>
                       </div>
                       <ChevronDown size={18} className={`text-slate-400 dark:text-gray-500 transition-transform duration-300 ${showModelMenu ? 'rotate-180' : ''}`} />
                    </button>
                    
                    <AnimatePresence>
                      {showModelMenu && (
                         <motion.div 
                           initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                           className="absolute top-full mt-2 w-full bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl p-2 z-[110] overflow-hidden"
                         >
                            {MODELS.map(m => (
                               <button 
                                 key={m.id} 
                                 onClick={() => { setSelectedModel(m); setShowModelMenu(false); }}
                                 className={`w-full p-4 flex items-center justify-between rounded-xl transition-all ${selectedModel.id === m.id ? 'bg-brand-blue/10 text-brand-blue' : 'hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-gray-400'}`}
                               >
                                  <div className="text-left">
                                     <p className="text-xs font-black uppercase italic">{m.name}</p>
                                     <p className="text-[9px] font-medium opacity-60">{m.desc}</p>
                                  </div>
                                  {selectedModel.id === m.id && <CheckCircle size={16} />}
                               </button>
                            ))}
                         </motion.div>
                      )}
                    </AnimatePresence>
                 </div>
              </div>

              {/* MODE & RATIO */}
              <div className="grid grid-cols-2 gap-6 pb-4">
                 <div className="space-y-2 relative">
                    <label className="text-[10px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest pl-2">Mode</label>
                    <button 
                      onClick={() => setShowQualityMenu(!showQualityMenu)}
                      className="w-full bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 p-4 rounded-2xl text-[11px] font-black uppercase flex items-center justify-between hover:border-brand-blue/30 transition-colors text-slate-900 dark:text-white"
                    >
                       {selectedQuality} <ChevronDown size={14} className="text-slate-400 dark:text-gray-500" />
                    </button>
                    {showQualityMenu && (
                       <div className="absolute bottom-full mb-2 w-full bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl p-2 z-[110]">
                          {MODES.map(q => (
                             <button key={q} onClick={() => { setSelectedQuality(q); setShowQualityMenu(false); }} className="w-full p-3 text-left text-[10px] font-black uppercase hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl text-slate-700 dark:text-white">{q}</button>
                          ))}
                       </div>
                    )}
                 </div>
                 <div className="space-y-2 relative">
                    <label className="text-[10px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest pl-2">Ratio</label>
                    <button 
                      onClick={() => setShowRatioMenu(!showRatioMenu)}
                      className="w-full bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 p-4 rounded-2xl text-[11px] font-black uppercase flex items-center justify-between hover:border-brand-blue/30 transition-colors text-slate-900 dark:text-white"
                    >
                       {selectedRatio} <ChevronDown size={14} className="text-slate-400 dark:text-gray-500" />
                    </button>
                    {showRatioMenu && (
                       <div className="absolute bottom-full mb-2 w-full bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl p-2 z-[110]">
                          {RATIOS.map(r => (
                             <button key={r} onClick={() => { setSelectedRatio(r); setShowRatioMenu(false); }} className="w-full p-3 text-left text-[10px] font-black uppercase hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl text-slate-700 dark:text-white">{r}</button>
                          ))}
                       </div>
                    )}
                 </div>
              </div>
           </div>

           {/* FIXED ACTION FOOTER */}
           <div className="p-8 border-t border-black/5 dark:border-white/5 bg-white/80 dark:bg-[#141414]/80 backdrop-blur-md shrink-0 space-y-4 transition-colors">
              <button 
                 onClick={handleSynthesize}
                 disabled={isGenerating || !sourceImg}
                 className={`w-full py-6 rounded-[2rem] flex items-center justify-center gap-4 text-[13px] font-black uppercase tracking-[0.3em] shadow-2xl transition-all active:scale-[0.97] group overflow-hidden relative ${sourceImg ? `bg-gradient-to-r ${activeGradient} text-white` : 'bg-slate-100 dark:bg-[#222] text-slate-400 dark:text-gray-500 cursor-not-allowed'}`}
              >
                 <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                 {isGenerating ? <Loader2 size={20} className="animate-spin" /> : <Zap size={20} fill="currentColor" />}
                 {mode === 'MOTION' ? 'Tạo Video Motion' : 'Tạo Video Swap'} 
                 <span className="opacity-60 ml-1">({estimatedCost} CR)</span>
              </button>
              
              {!hasEnoughCredits && sourceImg && (
                <div className="flex items-center justify-center gap-2 text-amber-500 animate-pulse">
                  <AlertTriangle size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Không đủ hạn ngạch (Cần {estimatedCost} CR)</span>
                </div>
              )}

              <div className="text-center">
                 <a href="https://skyverses.com/terms" target="_blank" className="text-[9px] text-slate-400 dark:text-gray-500 font-black uppercase tracking-widest hover:text-slate-900 dark:hover:text-white transition-all italic border-b border-transparent hover:border-slate-400 dark:hover:border-gray-500">
                    Learn more about {selectedModel.provider} technology <ExternalLink size={8} className="inline ml-1 mb-0.5" />
                 </a>
              </div>
           </div>
        </div>

        {/* 2. RIGHT PANEL: INFO & DEMO */}
        <div className="w-full max-w-[450px] flex flex-col h-full gap-6 overflow-y-auto no-scrollbar pb-32">
           {/* Model Presentation Card */}
           <div className="bg-white dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-3xl p-8 space-y-8 shadow-2xl transition-all">
              <div className="flex items-center gap-5">
                 <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl transition-colors duration-500 ${mode === 'MOTION' ? 'bg-cyan-500 shadow-cyan-500/20' : 'bg-purple-600 shadow-purple-500/20'}`}>
                    <Sparkles size={28} className="text-white dark:text-black" />
                 </div>
                 <div className="space-y-0.5">
                    <h3 className="text-xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">{selectedModel.name}</h3>
                    <p className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest">Powered by {selectedModel.provider}</p>
                 </div>
              </div>

              <p className="text-[12px] text-slate-600 dark:text-gray-400 font-bold leading-relaxed uppercase tracking-tight italic border-l border-slate-200 dark:border-white/10 pl-6">
                 Biến ảnh tĩnh thành video động với công nghệ AI tiên tiến nhất hiện nay. Hỗ trợ hai chế độ cốt lõi: 
                 <span className="text-cyan-500 ml-1.5 underline decoration-cyan-500/30 font-black">Motion</span> (chuyển động tự nhiên) và 
                 <span className="text-purple-500 ml-1.5 underline decoration-purple-500/30 font-black">Swap</span> (thay thế khuôn mặt).
              </p>

              <div className="flex flex-wrap gap-2.5">
                 {['1080P PRO', 'IDENTITY LOCK', 'FAST NODE', 'SECURE'].map(chip => (
                    <span key={chip} className="px-3 py-1 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest shadow-sm">{chip}</span>
                 ))}
              </div>

              {/* DEMO GRID */}
              <div className="space-y-5 pt-6 border-t border-slate-100 dark:border-white/5 transition-colors">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-[0.4em]">
                       <LayoutGrid size={14} /> Video Demo
                    </div>
                    <span className="text-[8px] font-bold text-brand-blue uppercase opacity-50">Industrial Samples</span>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    {DEMOS.map(demo => (
                       <div key={demo.id} className="aspect-video bg-slate-100 dark:bg-black border border-slate-100 dark:border-white/5 rounded-2xl relative overflow-hidden group cursor-pointer shadow-xl">
                          <img src={demo.thumb} className="w-full h-full object-cover opacity-60 dark:opacity-30 group-hover:opacity-100 dark:group-hover:opacity-60 transition-all duration-700 group-hover:scale-105" alt="" />
                          <div className="absolute inset-0 flex items-center justify-center">
                             <div className="w-10 h-10 rounded-full bg-white/20 dark:bg-white/10 backdrop-blur-md border border-slate-200 dark:border-white/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-white group-hover:text-black transition-all">
                                <Play size={16} fill="currentColor" className="ml-1" />
                             </div>
                          </div>
                          <div className="absolute bottom-3 left-3">
                             <span className={`px-2.5 py-1 rounded-md text-[8px] font-black uppercase text-white shadow-2xl ${demo.color}`}>
                                {demo.label}
                             </span>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>

              {/* FEATURE LISTS */}
              <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-white/5 transition-colors">
                 <button className="w-full flex items-center justify-between p-5 bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 rounded-2xl hover:bg-slate-100 dark:hover:bg-white/5 transition-all group shadow-sm">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-600 dark:text-cyan-400 group-hover:scale-110 transition-transform shadow-inner">
                          <Activity size={20} />
                       </div>
                       <div className="text-left">
                          <p className="text-[11px] font-black uppercase italic tracking-widest text-slate-800 dark:text-white">Motion Transfer</p>
                          <p className="text-[9px] text-slate-400 dark:text-gray-500 font-bold uppercase">Áp dụng chuyển động tham chiếu</p>
                       </div>
                    </div>
                    <ChevronRight size={14} className="text-slate-300 dark:text-gray-600 group-hover:text-cyan-500" />
                 </button>
                 <button className="w-full flex items-center justify-between p-5 bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 rounded-2xl hover:bg-slate-100 dark:hover:bg-white/5 transition-all group shadow-sm">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform shadow-inner">
                          <User size={20} />
                       </div>
                       <div className="text-left">
                          <p className="text-[11px] font-black uppercase italic tracking-widest text-slate-800 dark:text-white">Face Swap</p>
                          <p className="text-[9px] text-slate-400 dark:text-gray-500 font-bold uppercase">Thay thế danh tính mượt mà</p>
                       </div>
                    </div>
                    <ChevronRight size={14} className="text-slate-300 dark:text-gray-600 group-hover:text-purple-500" />
                 </button>
              </div>
           </div>
        </div>
      </div>

      {/* --- BOTTOM HISTORY DRAWER --- */}
      {/* Nút mở rộng nổi khi đang thu gọn */}
      {!isHistoryVisible && (
        <button 
          onClick={() => setIsHistoryExpanded(true)}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-8 py-3 bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-brand-blue hover:text-white transition-all shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-4 text-slate-700 dark:text-white"
        >
          <HistoryIcon size={14} /> Xem Lịch Sử Sản Xuất <ChevronUp size={14} />
        </button>
      )}

      <motion.div 
        initial={{ y: 240 }} 
        animate={{ y: isHistoryVisible ? 0 : 240 }}
        className="absolute bottom-0 left-0 right-0 h-56 bg-white/90 dark:bg-[#0c0c0c]/90 backdrop-blur-2xl border-t border-slate-200 dark:border-white/10 z-[100] p-8 shadow-[0_-20px_60px_rgba(0,0,0,0.1)] dark:shadow-[0_-20px_60px_rgba(0,0,0,0.5)] transition-all duration-500"
      >
         <div className="max-w-[1500px] mx-auto flex flex-col gap-6">
            <div className="flex items-center justify-between">
               <div 
                 className="flex items-center gap-6 cursor-pointer group/title"
                 onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
               >
                  <div className="flex items-center gap-3">
                     <LayoutGrid size={20} className={`transition-colors ${isHistoryVisible ? 'text-brand-blue' : 'text-slate-400 dark:text-gray-500'}`} />
                     <h3 className="text-sm font-black uppercase italic tracking-[0.2em] text-slate-900 dark:text-white">Lịch sử sản xuất</h3>
                  </div>
                  
                  {processingCount > 0 && (
                     <div className="flex items-center gap-3 px-4 py-1.5 bg-brand-blue/10 border border-brand-blue/30 rounded-full">
                        <RefreshCw size={14} className="text-brand-blue animate-spin" />
                        <span className="text-[10px] font-black text-brand-blue uppercase tracking-widest">{processingCount} đang xử lý...</span>
                     </div>
                  )}
               </div>
               
               <div className="flex gap-4">
                  <button onClick={() => setTasks([])} className="px-6 py-2 border border-slate-200 dark:border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-400 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 transition-all">Clear Storage</button>
                  <button 
                    onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
                    className={`px-6 py-2 border border-slate-200 dark:border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-white/10 transition-all flex items-center gap-2 ${isHistoryExpanded ? 'text-brand-blue border-brand-blue/30' : 'text-slate-500 dark:text-gray-400'}`}
                  >
                    {isHistoryExpanded ? 'Thu nhỏ' : 'Mở rộng'} 
                    {isHistoryExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                  </button>
               </div>
            </div>

            {/* Task List Horizontal Scroll */}
            <div className="flex gap-5 overflow-x-auto no-scrollbar pb-4 pt-2">
               {tasks.length > 0 ? tasks.map((task) => (
                  <div key={task.id} className="relative group shrink-0 w-36 aspect-[3/4.2] bg-slate-50 dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden shadow-sm dark:shadow-2xl transition-all hover:border-brand-blue/50">
                     {task.thumb ? (
                       <img src={task.thumb} className={`w-full h-full object-cover grayscale opacity-40 transition-all duration-700 ${task.status === 'processing' ? 'blur-[2px]' : 'group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105'}`} />
                     ) : (
                       <div className="w-full h-full flex items-center justify-center opacity-10 bg-slate-200 dark:bg-black text-slate-900 dark:text-white"><Film /></div>
                     )}
                     
                     {/* Result Video Overlay */}
                     {task.status === 'completed' && task.url && (
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                           <Play size={24} className="text-white fill-current" />
                        </div>
                     )}

                     <div className="absolute top-3 left-3">
                        <span className={`px-2 py-0.5 rounded text-[7px] font-black uppercase text-white shadow-xl ${task.type === 'MOTION' ? 'bg-cyan-500' : 'bg-purple-600'}`}>
                           {task.type}
                        </span>
                     </div>

                     {task.status === 'processing' && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/60 dark:bg-black/60 backdrop-blur-sm">
                           <Loader2 size={24} className="text-brand-blue animate-spin" />
                           <span className="text-[7px] font-black text-slate-800 dark:text-white/80 uppercase tracking-widest text-center px-2 animate-pulse">Neural Rendering...</span>
                        </div>
                     )}

                     {task.status === 'error' && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-red-900/40 backdrop-blur-sm">
                           <AlertCircle size={20} className="text-red-500" />
                           <span className="text-[8px] font-black text-red-100 uppercase text-center px-2">Render Failed</span>
                        </div>
                     )}

                     <div className="absolute bottom-0 inset-x-0 p-3 bg-white/80 dark:bg-black/60 border-t border-slate-200 dark:border-white/5 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 flex justify-between items-center transition-colors duration-500">
                        <p className="text-[8px] font-black text-slate-600 dark:text-white/50 truncate uppercase pr-2 italic">{task.model}</p>
                        <button onClick={(e) => { e.stopPropagation(); setTasks(prev => prev.filter(t => t.id !== task.id)); }} className="text-slate-400 dark:text-white/40 hover:text-red-500 transition-colors"><Trash2 size={10}/></button>
                     </div>
                  </div>
               )) : (
                  <div className="w-full h-32 flex flex-col items-center justify-center opacity-10 border-2 border-dashed border-slate-200 dark:border-white/20 rounded-2xl transition-colors">
                     <Database size={40} strokeWidth={1} className="text-slate-900 dark:text-white" />
                     <span className="text-[10px] font-black uppercase mt-4 tracking-[0.4em] italic text-slate-900 dark:text-white">No active production jobs in vault</span>
                  </div>
               )}
            </div>
         </div>
      </motion.div>

      {/* LOW CREDIT ALERT OVERLAY */}
      <AnimatePresence>
        {showLowCreditAlert && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-md flex items-center justify-center p-6"
          >
             <motion.div 
               initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
               className="max-w-md w-full bg-white dark:bg-[#111] p-10 border border-slate-200 dark:border-white/10 rounded-2xl space-y-8 text-center shadow-3xl transition-colors"
             >
                <div className="w-20 h-20 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center mx-auto text-amber-500">
                   <AlertTriangle size={40} />
                </div>
                <div className="space-y-3">
                   <h3 className="text-3xl font-black uppercase tracking-tighter italic text-slate-900 dark:text-white">Hạn ngạch cạn kiệt</h3>
                   <p className="text-sm text-slate-500 dark:text-gray-400 font-medium leading-relaxed">
                     Việc sản xuất này yêu cầu **{estimatedCost} credits**. Số dư của bạn hiện không đủ để khởi chạy node.
                   </p>
                </div>
                <div className="flex flex-col gap-4">
                   <Link 
                     to="/credits" 
                     className="bg-brand-blue text-white py-5 rounded-full text-xs font-black uppercase tracking-[0.4em] shadow-xl hover:scale-105 transition-all text-center"
                   >
                     Nạp thêm Credits
                   </Link>
                   <button 
                     onClick={() => setShowLowCreditAlert(false)}
                     className="text-[10px] font-black uppercase text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                   >
                     Để sau
                   </button>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AUTH OVERLAY */}
      {needsKey && (
        <div className="absolute inset-0 z-[1000] bg-white/95 dark:bg-black/98 backdrop-blur-3xl flex items-center justify-center p-8 text-center transition-all duration-700">
          <div className="max-w-md space-y-12 animate-in zoom-in duration-500">
            <div className="w-24 h-24 border-2 border-brand-blue mx-auto flex items-center justify-center shadow-2xl shadow-brand-blue/20 rounded-sm">
              <Lock className="w-10 h-10 text-brand-blue animate-pulse" />
            </div>
            <div className="space-y-6">
              <h3 className="text-4xl font-black uppercase tracking-tighter italic text-slate-900 dark:text-white leading-none">Access Required</h3>
              <p className="text-[12px] text-gray-600 dark:text-gray-400 leading-relaxed uppercase tracking-[0.3em] font-bold">
                Professional animation synthesis requires an authorized production node from a **PAID** GCP project.
              </p>
              <div className="pt-10 flex flex-col gap-6 items-center">
                <button 
                  onClick={() => { if ((window as any).aistudio) (window as any).aistudio.openSelectKey(); setNeedsKey(false); }}
                  className="py-6 px-16 bg-brand-blue text-white text-[12px] tracking-[0.4em] font-black uppercase shadow-2xl w-full hover:scale-105 active:scale-95 transition-all rounded-sm"
                >
                  Link Production Key
                </button>
                <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="text-[10px] text-gray-500 hover:text-brand-blue transition-colors uppercase font-black tracking-widest italic border-b border-gray-200 dark:border-gray-800 hover:border-brand-blue pb-1">
                   GCP Billing Architecture <ExternalLink size={12} className="inline ml-1" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default VideoAnimateWorkspace;
