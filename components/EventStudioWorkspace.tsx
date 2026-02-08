
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Zap, Upload, ChevronDown, Sparkles, 
  Loader2, Coins, Image as ImageIcon, 
  RefreshCw, Layers, Share2, Download, 
  Check, History as HistoryIcon, ShieldCheck, Terminal
} from 'lucide-react';
import { generateDemoImage } from '../services/gemini';
import { useAuth } from '../context/AuthContext';
import { uploadToGCS } from '../services/storage';
import { MobileGeneratorBar } from './common/MobileGeneratorBar';
import { EventConfig, COMMON_STUDIO_CONSTANTS } from '../constants/event-configs';

interface EventStudioWorkspaceProps {
  onClose: () => void;
  config: EventConfig;
}

export const EventStudioWorkspace: React.FC<EventStudioWorkspaceProps> = ({ onClose, config }) => {
  const { credits, useCredits, isAuthenticated, login, refreshUserInfo } = useAuth();
  const Icon = config.icon;
  const accent = config.accentColor;

  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [history, setHistory] = useState<{id: string, url: string, prompt: string}[]>([]);
  const [activeHistoryIndex, setActiveHistoryIndex] = useState<number | null>(null);
  const [sourceImg, setSourceImg] = useState<string | null>(null);
  const [faceLock, setFaceLock] = useState(true);
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);

  const [selectedSubject, setSelectedSubject] = useState(config.subjects[0]);
  const [selectedModel, setSelectedModel] = useState(COMMON_STUDIO_CONSTANTS.AI_MODELS[0]);
  const [selectedRatio, setSelectedRatio] = useState(COMMON_STUDIO_CONSTANTS.RATIOS[0]);
  const [selectedQuality, setSelectedQuality] = useState(COMMON_STUDIO_CONSTANTS.QUALITY_MODES[0]);
  const [quantity, setQuantity] = useState(1);
  const [selectedScenes, setSelectedScenes] = useState<string[]>([]);
  const [extraRequest, setExtraRequest] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleTag = (tag: string, list: string[], setList: (l: string[]) => void) => {
    if (list.includes(tag)) setList(list.filter(t => t !== tag));
    else if (list.length < 3) setList([...list, tag]);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const metadata = await uploadToGCS(file);
        setSourceImg(metadata.url);
      } catch (err) {
        console.error(err);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const actionCost = selectedModel.cost * quantity;

  const handleGenerate = async () => {
    if (!isAuthenticated) { login(); return; }
    if (credits < actionCost) { alert("Số dư credits không đủ."); return; }
    
    setIsGenerating(true);
    if (window.innerWidth < 1024) setIsMobileExpanded(false);

    try {
      const successful = useCredits(actionCost);
      if (!successful) return;

      const promptDirective = `${config.basePrompt}. Theme: ${selectedSubject}. 
        Environment: ${selectedScenes.join(', ')}. 
        Quality: ${selectedQuality}. Aspect Ratio: ${selectedRatio}. 
        Details: ${extraRequest}. 
        Face Lock: ${faceLock ? 'Enabled' : 'Disabled'}. 
        ${config.atmosphere}`;

      const res = await generateDemoImage({
        prompt: promptDirective,
        images: sourceImg ? [sourceImg] : [],
        model: selectedModel.id,
        aspectRatio: selectedRatio
      });
      
      if (res) {
        const newEntry = { id: Date.now().toString(), url: res, prompt: extraRequest || selectedSubject };
        setHistory(prev => [newEntry, ...prev]);
        setActiveHistoryIndex(0);
        refreshUserInfo();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const activeResult = activeHistoryIndex !== null ? history[activeHistoryIndex] : null;

  // Dynamic Tailwind Classes based on accent color
  const bgAccent = `bg-${accent}-500/10 dark:bg-${accent}-500/20`;
  const borderAccent = `border-${accent}-500/20 dark:border-${accent}-500/30`;
  const textAccent = `text-${accent}-500`;
  const toggleBg = faceLock ? `bg-${accent}-600 border-${accent}-400` : `bg-slate-200 dark:bg-gray-800 border-slate-300 dark:border-white/10`;
  const buttonBg = `bg-${accent}-600`;

  return (
    <div className="h-full w-full flex bg-white dark:bg-[#0d0e12] text-slate-900 dark:text-white font-sans overflow-hidden transition-all duration-500 relative">
      <div className="flex-grow flex flex-col-reverse lg:flex-row overflow-hidden relative">
        <AnimatePresence>
          {isMobileExpanded && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
              onClick={() => setIsMobileExpanded(false)} 
              className="lg:hidden fixed inset-0 bg-black/60 z-[140] backdrop-blur-sm" 
            />
          )}
        </AnimatePresence>

        <aside className={`fixed lg:relative bottom-0 lg:top-0 left-0 w-full lg:w-[380px] shrink-0 bg-white dark:bg-[#0d0e12] border-t lg:border-t-0 lg:border-r border-slate-200 dark:border-white/5 flex flex-col z-[150] lg:z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] lg:shadow-none transition-all duration-500 ease-in-out ${isMobileExpanded ? 'h-[92dvh] rounded-t-[2.5rem]' : 'h-32 lg:h-full lg:rounded-none'}`}>
          <MobileGeneratorBar 
            isExpanded={isMobileExpanded}
            setIsExpanded={setIsMobileExpanded}
            prompt={extraRequest}
            setPrompt={setExtraRequest}
            credits={credits}
            totalCost={actionCost}
            isGenerating={isGenerating}
            isGenerateDisabled={isGenerating || !sourceImg}
            onGenerate={handleGenerate}
            onOpenLibrary={() => {}} 
            generateLabel="KHỞI TẠO"
            type="image"
          />

          <div className={`flex-grow overflow-y-auto no-scrollbar p-6 space-y-8 pb-48 ${!isMobileExpanded ? 'hidden lg:block' : 'block'}`}>
            <div className="hidden lg:flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm transition-colors ${bgAccent} ${borderAccent} ${textAccent}`}>
                  <Icon size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">{config.name}</h2>
                  <p className="text-[9px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest mt-1 italic">{config.version}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <div 
                  className={`w-10 h-5 rounded-full relative transition-colors cursor-pointer border ${toggleBg}`} 
                  onClick={() => setFaceLock(!faceLock)}
                >
                  <motion.div animate={{ x: faceLock ? 20 : 2 }} className="absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full shadow-lg" />
                </div>
                <span className="text-[7px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-widest">KHÓA MẶT</span>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest italic px-1">Ảnh chân dung mẫu</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`aspect-video rounded-2xl border-2 border-dashed border-slate-200 dark:border-white/10 bg-white dark:bg-black/40 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all group overflow-hidden relative shadow-inner hover:border-${accent}-500/40`}
              >
                {isUploading ? (
                  <Loader2 className={`animate-spin ${textAccent}`} size={32} />
                ) : sourceImg ? (
                  <img src={sourceImg} className="w-full h-full object-cover" alt="Anchor" />
                ) : (
                  <>
                    <div className={`p-4 rounded-full group-hover:scale-110 transition-transform bg-${accent}-500/5 dark:bg-${accent}-500/10`}>
                      <Upload size={32} className={`opacity-40 ${textAccent}`} />
                    </div>
                    <span className="text-[10px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest italic text-center">Tải ảnh chân dung cần ghép</span>
                  </>
                )}
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleUpload} />
              </div>
            </div>

            <section className="space-y-6">
               <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-lg bg-slate-200 dark:bg-white/5 border border-slate-300 dark:border-white/10 flex items-center justify-center text-xs font-black italic ${textAccent}`}>01</div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-white italic">PHONG CÁCH</h3>
               </div>
               <div className="space-y-4">
                  <div className="space-y-2">
                    <select 
                        value={selectedSubject} 
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        className={`w-full bg-slate-50 dark:bg-[#1a1b26] border border-slate-200 dark:border-white/10 rounded-lg p-3 text-[11px] font-bold text-slate-700 dark:text-slate-300 outline-none appearance-none cursor-pointer transition-colors focus:border-${accent}-500/50`}
                      >
                        {config.subjects.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {config.scenes.map(tag => (
                       <button 
                         key={tag} 
                         onClick={() => toggleTag(tag, selectedScenes, setSelectedScenes)}
                         className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase transition-all border ${selectedScenes.includes(tag) ? `${buttonBg} border-transparent text-white shadow-md` : `bg-white dark:bg-white/5 text-slate-400 border-slate-200 dark:border-white/5 hover:border-${accent}-500/30`}`}
                       >
                          + {tag}
                       </button>
                    ))}
                  </div>
               </div>
            </section>

            <section className="space-y-4 pt-4">
                <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest">YÊU CẦU BỔ SUNG</label>
                    <div className="flex items-center gap-1 text-brand-blue text-[9px] font-black italic"><Sparkles size={10} /> Smart Prompt</div>
                </div>
                <textarea 
                  value={extraRequest} onChange={e => setExtraRequest(e.target.value)} 
                  className={`w-full h-24 bg-white dark:bg-[#1a1b26] border border-slate-200 dark:border-white/5 p-4 text-[11px] font-medium outline-none rounded-xl text-slate-800 dark:text-white shadow-inner focus:border-${accent}-500/50 transition-all`} 
                  placeholder="VD: Ánh sáng lung linh, thêm hiệu ứng hạt bụi..." 
                />
            </section>
          </div>

          <div className="hidden lg:block shrink-0 p-6 space-y-4 bg-white/95 dark:bg-[#0d0e12]/95 backdrop-blur-xl border-t border-slate-200 dark:border-white/5 shadow-2xl transition-colors">
               <div className="flex justify-between items-center px-2">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest mb-1 italic">Số dư tài khoản</span>
                    <div className="flex items-center gap-2 text-brand-blue leading-none">
                      <Coins size={14} className="text-yellow-500" fill="currentColor" />
                      <span className="text-[14px] font-black italic">{credits.toLocaleString()} CR</span>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <span className="text-[8px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest mb-1 italic">Chi phí tạo ảnh</span>
                    <div className="flex items-center gap-1 text-orange-500 leading-none">
                      <Zap size={12} fill="currentColor" />
                      <span className="text-[14px] font-black italic">{actionCost} CR</span>
                    </div>
                  </div>
               </div>
               <button 
                 onClick={handleGenerate}
                 disabled={isGenerating || !sourceImg}
                 className={`w-full py-5 rounded-2xl flex items-center justify-center gap-4 text-xs font-black uppercase tracking-[0.4em] shadow-xl transition-all active:scale-[0.98] group relative overflow-hidden ${isGenerating || !sourceImg ? 'opacity-50 grayscale cursor-not-allowed bg-slate-200 dark:bg-gray-800' : `${buttonBg} text-white hover:brightness-110 shadow-lg`}`}
               >
                  <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  {isGenerating ? <Loader2 className="animate-spin" size={18}/> : <Sparkles size={18} fill="currentColor" />}
                  KHỞI TẠO HÌNH ẢNH
               </button>
          </div>
        </aside>

        <main className="flex-grow flex flex-col relative bg-slate-50 dark:bg-[#020205] transition-colors duration-500 overflow-hidden">
           <header className="h-14 border-b border-slate-200 dark:border-white/5 bg-white/80 dark:bg-black/40 backdrop-blur-xl flex items-center justify-between px-8 z-30 shrink-0 transition-colors">
              <div className="flex items-center gap-4">
                 <div className={`w-1.5 h-1.5 rounded-full animate-pulse shadow-lg ${`bg-${accent}-500 shadow-${accent}-500/50`}`}></div>
                 <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-gray-500 italic uppercase">Kết quả tổng hợp</span>
              </div>
              <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors bg-black/5 dark:bg-white/5 rounded-full"><X size={18} /></button>
           </header>
           <div className="flex-grow flex items-center justify-center p-6 md:p-12 relative overflow-hidden">
              <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-10 pointer-events-none" style={{ backgroundImage: `radial-gradient(circle, ${accent === 'rose' ? '#f43f5e' : accent === 'red' ? '#ef4444' : '#a855f7'} 1px, transparent 1px)`, backgroundSize: '40px 40px' }}></div>

              <AnimatePresence mode="wait">
                 {activeResult ? (
                   <motion.div key={activeResult.id} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="relative group max-w-4xl w-full aspect-[4/3] bg-white dark:bg-black rounded-sm overflow-hidden shadow-3xl border border-slate-200 dark:border-white/10">
                      <img src={activeResult.url} className="w-full h-full object-cover" alt="Result" />
                      <div className="absolute top-6 right-6 flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                         <button className={`p-4 bg-white/90 dark:bg-black/80 backdrop-blur-md rounded-full shadow-2xl text-slate-800 dark:text-white hover:text-white transition-all hover:${buttonBg}`}><Share2 size={20}/></button>
                         <a href={activeResult.url} download={`${config.id}_ai_${activeResult.id}.png`} className="p-4 bg-white text-black rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center"><Download size={20}/></a>
                      </div>
                   </motion.div>
                 ) : (
                   <div className="text-center space-y-10 opacity-20 flex flex-col items-center select-none transition-opacity">
                      <Icon size={140} strokeWidth={1} className={`text-slate-900 dark:text-white ${config.id === 'noel' ? 'animate-spin-slow' : 'animate-pulse'}`} />
                      <div className="space-y-2">
                         <h3 className="text-4xl font-black uppercase tracking-[0.5em] italic text-slate-900 dark:text-white leading-none uppercase">Studio Ready</h3>
                         <p className="text-sm font-bold uppercase tracking-widest text-slate-400 dark:text-gray-500 italic">HỆ THỐNG SẴN SÀNG KHỞI TẠO</p>
                      </div>
                   </div>
                 )}
              </AnimatePresence>
           </div>
        </main>
      </div>

      <aside className="hidden lg:flex w-24 md:w-28 xl:w-32 border-l border-slate-200 dark:border-white/5 bg-white/40 dark:bg-[#0d0e12]/40 backdrop-blur-xl flex flex-col items-center py-6 gap-4 overflow-y-auto no-scrollbar z-50 transition-colors">
          <div className="text-[8px] font-black uppercase text-slate-400 dark:text-gray-600 tracking-widest flex flex-col items-center gap-1 mb-2 text-center shrink-0 italic">
            <HistoryIcon size={14} /> Tệp tin
          </div>
          {history.map((asset, idx) => (
            <button 
              key={asset.id} 
              onClick={() => setActiveHistoryIndex(idx)}
              className={`relative w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 hover:scale-105 ${activeHistoryIndex === idx ? `border-${accent}-500 shadow-xl shadow-${accent}-500/20` : 'border-black/5 dark:border-white/10 opacity-60 hover:opacity-100'}`}
            >
              <img src={asset.url} className="w-full h-full object-cover" alt={`History ${idx}`} />
              <div className="absolute bottom-0 inset-x-0 bg-black/60 py-0.5">
                 <span className="text-[6px] font-black text-white uppercase text-center block tracking-tighter">0{history.length - idx}</span>
              </div>
            </button>
          ))}
      </aside>

      <style dangerouslySetInnerHTML={{ __html: `
        .animate-spin-slow {
          animation: spin 12s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      ` }} />
    </div>
  );
};
