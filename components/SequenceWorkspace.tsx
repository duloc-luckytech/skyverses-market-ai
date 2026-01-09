
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Zap, Loader2, Play, Film, 
  Terminal, ShieldCheck, Download, 
  LayoutGrid, Plus, 
  ArrowRight, Square, CheckCircle2, 
  AlertTriangle, Layers, AlignLeft, 
  Sparkles, Camera, MonitorPlay,
  Lock, ExternalLink, Activity, Share2, 
  Clapperboard, Sliders, Settings2, BookOpen,
  ChevronRight, MoreVertical, Menu, LogOut,
  History as HistoryIcon
} from 'lucide-react';
import { generateDemoVideo, generateDemoText } from '../services/gemini';
import { useLanguage } from '../context/LanguageContext';

interface StoryBeat {
  id: string;
  title: string;
  visualPrompt: string;
  status: 'idle' | 'rendering' | 'done' | 'error';
  videoUrl: string | null;
  metadata: {
    camera: string;
    lighting: string;
  }
}

const SequenceWorkspace: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { lang } = useLanguage();
  const [story, setStory] = useState('Trong ánh hoàng hôn đỏ rực tại thành phố tương lai, một kiến trúc sư già đứng trên ban công nhìn những chiếc xe bay lướt qua. Ông đang cầm một bản vẽ holographic của một tòa tháp cao vút. Những kỷ niệm về thành phố cũ hiện về trong ánh mắt xa xăm.');
  const [beats, setBeats] = useState<StoryBeat[]>([]);
  const [isProcessingStory, setIsProcessingStory] = useState(false);
  const [activeBeatId, setActiveBeatId] = useState<string | null>(null);
  const [needsKey, setNeedsKey] = useState(false);
  const [showScript, setShowScript] = useState(true);
  
  const [logs, setLogs] = useState<string[]>(['Chào mừng bạn đến với Sequence Studio.', 'Đang chờ nhập kịch bản...']);

  useEffect(() => {
    const checkKey = async () => {
      if ((window as any).aistudio) {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        setNeedsKey(!hasKey);
      }
    };
    checkKey();
    if (window.innerWidth < 1024) setShowScript(false);
  }, []);

  const addLog = (msg: string) => setLogs(prev => [...prev.slice(-3), `> ${msg}`]);

  const handleProcessStory = async () => {
    if (!story.trim() || isProcessingStory) return;
    setIsProcessingStory(true);
    setBeats([]);
    addLog('Đang phân tích cấu trúc kịch bản...');

    try {
      const prompt = `Act as a Professional Film Director. Analyze this script and break it into 4 cinematic scenes. 
      Format each scene exactly as: Scene Title | Visual Details | Camera Angle | Lighting Style. 
      Separate scenes with "||".
      Script: "${story}"`;
      
      const res = await generateDemoText(prompt);
      const sceneData = res.split('||');
      
      const newBeats: StoryBeat[] = sceneData.map((s, i) => {
        const [title, visual, cam, light] = s.split('|');
        return {
          id: `scene-${i}`,
          title: title?.trim() || `Cảnh 0${i+1}`,
          visualPrompt: visual?.trim() || 'Cinematic visual',
          status: 'idle',
          videoUrl: null,
          metadata: {
            camera: cam?.trim() || 'Standard Master',
            lighting: light?.trim() || 'Natural Ambient'
          }
        };
      });
      
      setBeats(newBeats);
      setActiveBeatId(newBeats[0].id);
      addLog('Phân cảnh thành công.');
      if (window.innerWidth < 1024) setShowScript(false);
    } catch (err) {
      addLog('Lỗi phân tích kịch bản.');
    } finally {
      setIsProcessingStory(false);
    }
  };

  const synthesizeScene = async (beatId: string) => {
    const beat = beats.find(b => b.id === beatId);
    if (!beat || beat.status === 'rendering') return;

    setBeats(prev => prev.map(b => b.id === beatId ? { ...b, status: 'rendering' } : b));
    addLog(`Đang kết xuất: ${beat.title}...`);
    
    try {
      const directive = `Cinematic Master: ${beat.visualPrompt}. Camera: ${beat.metadata.camera}. Lighting: ${beat.metadata.lighting}. Professional 4K.`;
      const url = await generateDemoVideo({ prompt: directive });
      
      if (url) {
        setBeats(prev => prev.map(b => b.id === beatId ? { ...b, videoUrl: url, status: 'done' } : b));
        addLog(`Kết xuất hoàn tất: ${beat.title}.`);
      }
    } catch (err: any) {
      setBeats(prev => prev.map(b => b.id === beatId ? { ...b, status: 'error' } : b));
      if (err?.message?.includes("Requested entity was not found")) setNeedsKey(true);
      addLog(`Lỗi kết xuất cảnh phim.`);
    }
  };

  const activeBeat = beats.find(b => b.id === activeBeatId);

  return (
    <div className="flex flex-col lg:flex-row h-full w-full bg-white dark:bg-[#030304] text-black dark:text-white font-sans overflow-hidden relative transition-colors duration-500">
      
      {/* 1. NARRATIVE PANEL */}
      <AnimatePresence>
        {showScript && (
          <motion.aside 
            initial={{ x: -480 }} animate={{ x: 0 }} exit={{ x: -480 }}
            className="fixed lg:relative z-[100] w-full lg:w-[400px] h-full flex flex-col border-r border-black/5 dark:border-white/5 bg-[#f8f9fa] dark:bg-[#08080a] shadow-2xl"
          >
            <div className="p-6 lg:p-8 flex items-center justify-between border-b border-black/5 dark:border-white/5 shrink-0">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-brand-blue text-white rounded-sm">
                     <AlignLeft size={18} />
                  </div>
                  <h2 className="text-xs font-black uppercase tracking-widest text-brand-blue">Biên kịch</h2>
               </div>
               <button onClick={() => setShowScript(false)} className="p-2 text-gray-500 transition-colors">
                  <X size={24} />
               </button>
            </div>

            <div className="flex-grow overflow-y-auto no-scrollbar p-6 lg:p-8 space-y-8">
               <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                     <Terminal size={14} className="text-brand-blue" /> Ý tưởng câu chuyện
                  </label>
                  <textarea 
                    value={story}
                    onChange={(e) => setStory(e.target.value)}
                    className="w-full h-40 p-4 bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-sm text-sm font-medium focus:outline-none focus:border-brand-blue transition-all leading-relaxed"
                    placeholder="Viết nội dung phim của bạn..."
                  />
                  <button 
                    onClick={handleProcessStory}
                    disabled={isProcessingStory || !story.trim()}
                    className="w-full py-4 bg-brand-blue text-white font-black text-[11px] uppercase tracking-widest shadow-2xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-20"
                  >
                     {isProcessingStory ? <Loader2 className="animate-spin" size={16} /> : <Zap size={16} fill="currentColor" />}
                     Phân tách cảnh phim
                  </button>
               </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* 2. PRODUCTION AREA */}
      <main className="flex-grow flex flex-col bg-[#f1f1f4] dark:bg-[#010102] relative overflow-hidden transition-colors duration-500">
         <div className="flex-grow flex items-center justify-center p-8 lg:p-20 relative">
            <AnimatePresence mode="wait">
               {activeBeat ? (
                  <motion.div 
                    key={activeBeat.id} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
                    className="relative group w-full max-w-5xl aspect-video bg-black rounded-sm overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.5)] border border-white/5"
                  >
                     {activeBeat.videoUrl ? (
                        <video key={activeBeat.videoUrl} src={activeBeat.videoUrl} autoPlay loop muted className="w-full h-full object-contain" />
                     ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#050505] z-10 p-6 text-center">
                           {activeBeat.status === 'rendering' ? (
                              <div className="flex flex-col items-center gap-6">
                                 <Loader2 size={48} className="text-brand-blue animate-spin" />
                                 <p className="text-[12px] font-black uppercase tracking-[0.4em] text-white animate-pulse">Đang tổng hợp phân cảnh...</p>
                              </div>
                           ) : (
                              <button onClick={() => synthesizeScene(activeBeat.id)} className="bg-brand-blue text-white px-8 lg:px-12 py-4 lg:py-5 text-[10px] lg:text-[11px] font-black uppercase tracking-[0.4em] shadow-2xl hover:brightness-110 active:scale-[0.98] flex items-center gap-4">
                                 <Zap size={18} fill="currentColor" /> Khởi tạo kết xuất
                              </button>
                           )}
                        </div>
                     )}
                  </motion.div>
               ) : (
                  <div className="text-center space-y-6 lg:space-y-8 opacity-10 p-6">
                     <MonitorPlay size={80} strokeWidth={1} className="mx-auto" />
                     <p className="text-sm lg:text-xl font-black uppercase tracking-[1em]">Chưa có phân cảnh nào được chọn</p>
                  </div>
               )}
            </AnimatePresence>
         </div>

         <div className="h-32 lg:h-40 border-t border-black/10 dark:border-white/5 bg-white dark:bg-[#080808] p-6 lg:p-8 flex items-center justify-between z-[90] shrink-0 transition-colors duration-500 shadow-2xl">
            <div className="flex items-center gap-6 lg:gap-12 overflow-x-auto no-scrollbar flex-grow">
               <div className="space-y-3 lg:space-y-4 shrink-0">
                  <div className="flex items-center gap-3">
                     <HistoryIcon size={14} className="text-gray-400" />
                     <span className="text-[8px] lg:text-[10px] font-black uppercase tracking-widest text-gray-500">Dòng thời gian phim</span>
                  </div>
               </div>
            </div>
         </div>
      </main>

      {/* AUTH MODAL */}
      {needsKey && (
        <div className="absolute inset-0 z-[1000] bg-white/95 dark:bg-black/98 backdrop-blur-2xl flex items-center justify-center p-8 text-center transition-colors duration-500">
          <div className="max-w-md space-y-12 animate-in zoom-in duration-500">
            <div className="w-24 h-24 border-2 border-brand-blue mx-auto flex items-center justify-center shadow-2xl">
              <Lock className="w-10 h-10 text-brand-blue animate-pulse" />
            </div>
            <div className="space-y-6">
              <h3 className="text-3xl font-black uppercase tracking-tighter italic">Industrial Lock</h3>
              <p className="text-[11px] lg:text-[12px] text-gray-500 dark:text-gray-400 leading-relaxed uppercase tracking-widest font-bold">
                Professional narrative synthesis requires a **PAID** GCP Project API Key.
              </p>
              <div className="pt-8 flex flex-col gap-6 items-center">
                <button 
                  onClick={() => { if ((window as any).aistudio) (window as any).aistudio.openSelectKey(); setNeedsKey(false); }}
                  className="py-5 lg:py-6 px-16 lg:px-20 bg-brand-blue text-white text-[11px] lg:text-[12px] tracking-[0.4em] font-black uppercase shadow-2xl w-full rounded-sm hover:scale-105 transition-all"
                >
                  Link Enterprise Key
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SequenceWorkspace;
