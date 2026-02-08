import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Zap, Upload, Snowflake, ChevronDown, Sparkles, 
  User, Palette, Maximize2, 
  Star, Image as ImageIcon, Loader2,
  Trash2, Check, RefreshCw, Layers, Sliders,
  Gift, LayoutGrid, Share2, Download, AlertTriangle,
  Coins, Terminal, Settings2, Cpu, Globe, ShieldCheck,
  Binary, Fingerprint, Command, History as HistoryIcon,
  ChevronLeft, ChevronUp
} from 'lucide-react';
import { generateDemoImage } from '../services/gemini';
import { useAuth } from '../context/AuthContext';
import { uploadToGCS } from '../services/storage';
import { MobileGeneratorBar } from './common/MobileGeneratorBar';

const SUBJECT_OPTIONS = ['Lễ hội ánh sáng', 'Mùa đông kỳ ảo', 'Cyberpunk Christmas', 'Manga Noel', 'Vintage Holiday'];
const RATIOS = ['1:1', '16:9', '9:16', '4:3', '3:4'];
const QUALITY_MODES = ['Tiêu chuẩn (Nhanh)', 'Sắc nét (Chất lượng)', 'Điện ảnh (UHD)'];
const AI_MODELS = [
  { id: 'gemini-2.5-flash-image', name: 'Gemini 2.5 Flash', cost: 150 },
  { id: 'gemini-3-pro-image-preview', name: 'Gemini 3 Pro (PRO)', cost: 500 }
];

const SCENE_TAGS = ['Tuyết rơi', 'Lò sưởi', 'Đường phố neon', 'Rừng thông', 'Bữa tiệc tối'];

interface NoelStudioWorkspaceProps {
  onClose: () => void;
}

export const NoelStudioWorkspace: React.FC<NoelStudioWorkspaceProps> = ({ onClose }) => {
  const { credits, useCredits, isAuthenticated, login, refreshUserInfo } = useAuth();
  
  // App Logic States
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [history, setHistory] = useState<{id: string, url: string, prompt: string}[]>([]);
  const [activeHistoryIndex, setActiveHistoryIndex] = useState<number | null>(null);
  const [sourceImg, setSourceImg] = useState<string | null>(null);
  const [faceLock, setFaceLock] = useState(true);
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);

  // Configuration States
  const [selectedSubject, setSelectedSubject] = useState(SUBJECT_OPTIONS[0]);
  const [selectedModel, setSelectedModel] = useState(AI_MODELS[0]);
  const [selectedRatio, setSelectedRatio] = useState(RATIOS[0]);
  const [selectedQuality, setSelectedQuality] = useState(QUALITY_MODES[0]);
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

      const promptDirective = `Noel Studio Design. Theme: ${selectedSubject}. 
        Environment: ${selectedScenes.join(', ')}. 
        Quality: ${selectedQuality}. Aspect Ratio: ${selectedRatio}. 
        Details: ${extraRequest}. 
        Face Lock: ${faceLock ? 'Enabled' : 'Disabled'}. 
        Beautiful Christmas atmosphere, 4K, high fidelity.`;

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

  return (
    <div className="h-full w-full flex bg-white dark:bg-[#0d0e12] text-slate-900 dark:text-white font-sans overflow-hidden transition-all duration-500 relative">
      
      {/* Container flex-col-reverse on mobile */}
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

        {/* SIDEBAR TRÁI: BOTTOM SHEET TRÊN MOBILE */}
        <aside 
          className={`fixed lg:relative bottom-0 lg:top-0 left-0 w-full lg:w-[380px] shrink-0 bg-white dark:bg-[#0d0e12] border-t lg:border-t-0 lg:border-r border-slate-200 dark:border-white/5 flex flex-col z-[150] lg:z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] lg:shadow-none transition-all duration-500 ease-in-out ${isMobileExpanded ? 'h-[92dvh] rounded-t-[2.5rem]' : 'h-32 lg:h-full lg:rounded-none'}`}
        >
          {/* MOBILE BAR */}
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
            {/* Header (Desktop only) */}
            <div className="hidden lg:flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center justify-center text-rose-500 shadow-sm transition-colors">
                  <Snowflake size={20} className="animate-spin-slow" />
                </div>
                <div>
                  <h2 className="text-xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">NOEL STUDIO</h2>
                  <p className="text-[9px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest mt-1 italic">AI Engine v2.5</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <div 
                  className={`w-10 h-5 rounded-full relative transition-colors cursor-pointer border ${faceLock ? 'bg-rose-500 border-rose-400' : 'bg-slate-200 dark:bg-gray-800 border-slate-300 dark:border-white/10'}`} 
                  onClick={() => setFaceLock(!faceLock)}
                >
                  <motion.div animate={{ x: faceLock ? 20 : 2 }} className="absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full shadow-lg" />
                </div>
                <span className="text-[7px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-widest">KHÓA MẶT</span>
              </div>
            </div>

            {/* Mobile Title Strip when expanded */}
            <div className="lg:hidden flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <Snowflake size={20} className="text-rose-500" />
                <h2 className="text-sm font-black uppercase tracking-widest italic">Cấu hình kịch bản Noel</h2>
              </div>
              <div className="flex items-center gap-1">
                   <div 
                    className={`w-10 h-5 rounded-full relative transition-colors cursor-pointer border ${faceLock ? 'bg-rose-500 border-rose-400' : 'bg-slate-200 dark:bg-gray-800 border-slate-300 dark:border-white/10'}`} 
                    onClick={() => setFaceLock(!faceLock)}
                  >
                    <motion.div animate={{ x: faceLock ? 20 : 2 }} className="absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full shadow-lg" />
                  </div>
                  <span className="text-[8px] font-black text-gray-500">FACE LOCK</span>
                </div>
            </div>

            {/* Upload Section */}
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest italic px-1">Ảnh chân dung mẫu</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="aspect-video rounded-2xl border-2 border-dashed border-slate-200 dark:border-white/10 bg-white dark:bg-black/40 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-rose-500/40 transition-all group overflow-hidden relative shadow-inner"
              >
                {isUploading ? (
                  <Loader2 className="animate-spin text-rose-500" size={32} />
                ) : sourceImg ? (
                  <img src={sourceImg} className="w-full h-full object-cover" alt="Anchor" />
                ) : (
                  <>
                    <div className="p-4 bg-rose-500/5 dark:bg-rose-500/10 rounded-full group-hover:scale-110 transition-transform">
                      <Upload size={32} className="text-rose-500/40" />
                    </div>
                    <span className="text-[10px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest italic">Tải ảnh khuôn mặt</span>
                  </>
                )}
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleUpload} />
              </div>
            </div>

            {/* Config Sections */}
            <section className="space-y-6">
               <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-white/5 border border-slate-300 dark:border-white/10 flex items-center justify-center text-xs font-black italic text-rose-500">01</div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-white italic">CHỦ ĐỀ & PHONG CÁCH</h3>
               </div>
               <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest px-1">PHONG CÁCH CHỦ ĐẠO</label>
                    <select 
                        value={selectedSubject} 
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-[#1a1b26] border border-slate-200 dark:border-white/10 rounded-lg p-3 text-[11px] font-bold text-slate-700 dark:text-slate-300 outline-none focus:border-rose-500/50 appearance-none cursor-pointer transition-colors"
                      >
                        {SUBJECT_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {SCENE_TAGS.map(tag => (
                       <button 
                         key={tag} 
                         onClick={() => toggleTag(tag, selectedScenes, setSelectedScenes)}
                         className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase transition-all border ${selectedScenes.includes(tag) ? 'bg-rose-600 border-rose-500 text-white shadow-md' : 'bg-white dark:bg-white/5 text-slate-400 border-slate-200 dark:border-white/5 hover:border-rose-500/30'}`}
                       >
                          + {tag}
                       </button>
                    ))}
                  </div>
               </div>
            </section>

            <section className="space-y-6 pt-4 border-t border-slate-200 dark:border-white/5">
               <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-white/5 border border-slate-300 dark:border-white/10 flex items-center justify-center text-xs font-black italic text-rose-500">02</div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-white italic">CẤU HÌNH AI</h3>
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest pl-1">MODEL</label>
                    <select value={selectedModel.id} onChange={e => setSelectedModel(AI_MODELS.find(m => m.id === e.target.value)!)} className="w-full bg-slate-50 dark:bg-[#1a1b26] border border-slate-200 dark:border-white/10 rounded-lg p-2.5 text-[10px] font-bold outline-none text-brand-blue appearance-none">
                       {AI_MODELS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest pl-1">TỈ LỆ</label>
                    <select value={selectedRatio} onChange={e => setSelectedRatio(e.target.value)} className="w-full bg-slate-50 dark:bg-[#1a1b26] border border-slate-200 dark:border-white/10 rounded-lg p-2.5 text-[10px] font-bold outline-none text-slate-700 dark:text-white appearance-none">
                       {RATIOS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                 </div>
               </div>
            </section>
          </div>

          {/* STICKY FOOTER (Desktop only) */}
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
                 className={`w-full py-5 rounded-2xl flex items-center justify-center gap-4 text-xs font-black uppercase tracking-[0.4em] shadow-xl transition-all active:scale-[0.98] group relative overflow-hidden ${isGenerating || !sourceImg ? 'opacity-50 grayscale cursor-not-allowed bg-slate-200 dark:bg-gray-800' : 'bg-rose-600 text-white hover:brightness-110 shadow-rose-600/20'}`}
               >
                  <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  {isGenerating ? <Loader2 className="animate-spin" size={18}/> : <Sparkles size={18} fill="currentColor" />}
                  KHỞI TẠO HÌNH ẢNH
               </button>
          </div>
        </aside>

        {/* VIEWPORT CHÍNH (GIỮA) */}
        <main className="flex-grow flex flex-col relative bg-slate-50 dark:bg-[#020205] transition-colors duration-500 overflow-hidden">
           <header className="h-14 border-b border-slate-200 dark:border-white/5 bg-white/80 dark:bg-black/40 backdrop-blur-xl flex items-center justify-between px-8 z-30 shrink-0 transition-colors">
              <div className="flex items-center gap-4">
                 <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_#f43f5e]"></div>
                 <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-gray-500 italic uppercase">Kết quả tổng hợp</span>
              </div>
              <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors bg-black/5 dark:bg-white/5 rounded-full"><X size={18} /></button>
         </header>

         <div className="flex-grow flex items-center justify-center p-12 relative overflow-hidden">
            <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #f43f5e 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

            <AnimatePresence mode="wait">
               {activeResult ? (
                 <motion.div key={activeResult.id} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="relative group max-w-5xl w-full aspect-[4/3] bg-white dark:bg-black rounded-sm overflow-hidden shadow-3xl border border-slate-200 dark:border-white/10">
                    {isGenerating && activeHistoryIndex === 0 ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-8 bg-slate-100/80 dark:bg-black/60 backdrop-blur-sm z-20">
                            <div className="relative">
                                <Loader2 size={100} className="text-rose-500 animate-spin" strokeWidth={1} />
                                <Snowflake size={32} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-rose-400 animate-pulse" />
                            </div>
                            <p className="text-sm font-black uppercase tracking-[0.5em] text-rose-600 animate-pulse">Synthesizing...</p>
                        </div>
                    ) : (
                        <>
                            <img src={activeResult.url} className="w-full h-full object-contain" alt="Noel Result" />
                            <div className="absolute top-6 right-6 flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                <button className="p-4 bg-white/90 dark:bg-black/80 backdrop-blur-md rounded-full shadow-2xl text-slate-800 dark:text-white hover:bg-rose-600 hover:text-white transition-all"><Share2 size={20}/></button>
                                <a href={activeResult.url} download={`noel_ai_${activeResult.id}.png`} className="p-4 bg-white text-black rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center"><Download size={20}/></a>
                            </div>
                        </>
                    )}
                 </motion.div>
               ) : isGenerating ? (
                 <motion.div key="gen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-12 text-center">
                    <div className="relative">
                       <Loader2 size={120} className="text-rose-500 animate-spin" strokeWidth={1} />
                       <Snowflake size={40} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-rose-400 animate-pulse" />
                    </div>
                    <div className="space-y-4">
                       <p className="text-xl font-black uppercase tracking-[0.6em] animate-pulse italic text-slate-900 dark:text-white">ĐANG XỬ LÝ HÌNH ẢNH...</p>
                       <p className="text-[10px] font-bold text-slate-400 dark:text-gray-600 uppercase tracking-widest italic">Hệ thống AI đang thực thi</p>
                    </div>
                 </motion.div>
               ) : (
                 <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-10 opacity-20 flex flex-col items-center select-none transition-opacity">
                    <Snowflake size={140} strokeWidth={1} className="text-slate-900 dark:text-white animate-spin-slow" />
                    <div className="space-y-2">
                       <h3 className="text-4xl font-black uppercase tracking-[0.5em] italic text-slate-900 dark:text-white leading-none uppercase">Studio Ready</h3>
                       <p className="text-sm font-bold uppercase tracking-widest text-slate-400 dark:text-gray-500 italic">HỆ THỐNG SẴN SÀNG KHỞI TẠO</p>
                    </div>
                 </motion.div>
               )}
            </AnimatePresence>
         </div>

         {/* Bottom Status Bar */}
         <div className="h-10 bg-white/60 dark:bg-black/60 border-t border-slate-200 dark:border-white/5 flex items-center justify-between px-8 shrink-0 transition-colors">
            <div className="flex items-center gap-6 text-[8px] font-black uppercase text-slate-400 dark:text-gray-600 tracking-widest">
               <span className="flex items-center gap-1.5"><ShieldCheck size={10} className="text-emerald-500" /> KẾT NỐI BẢO MẬT</span>
               <span className="flex items-center gap-1.5"><Terminal size={10} className="text-rose-500" /> ĐỘ TRỄ: 0.42s</span>
            </div>
            <span className="text-[8px] font-black text-slate-400 dark:text-gray-700 uppercase tracking-tighter italic">Skyverses Soul Production Network</span>
         </div>
      </main>

      {/* SIDEBAR PHẢI: LỊCH SỬ (HISTORY) TRÊN DESKTOP */}
      <aside className="hidden lg:flex w-24 md:w-28 xl:w-32 border-l border-slate-200 dark:border-white/5 bg-white/40 dark:bg-[#0d0e12]/40 backdrop-blur-xl flex flex-col items-center py-6 gap-4 overflow-y-auto no-scrollbar z-50 transition-colors">
          <div className="text-[8px] font-black uppercase text-slate-400 dark:text-gray-600 tracking-widest flex flex-col items-center gap-1 mb-2 text-center shrink-0 italic">
            <HistoryIcon size={14} /> Tệp tin
          </div>
          {history.map((asset, idx) => (
            <button 
              key={asset.id} 
              onClick={() => setActiveHistoryIndex(idx)}
              className={`relative w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 hover:scale-105 ${activeHistoryIndex === idx ? 'border-rose-500 shadow-xl shadow-rose-500/20' : 'border-black/5 dark:border-white/10 opacity-60 hover:opacity-100'}`}
            >
              <img src={asset.url} className="w-full h-full object-cover" alt={`History ${idx}`} />
              <div className="absolute bottom-0 inset-x-0 bg-black/60 py-0.5">
                 <span className="text-[6px] font-black text-white uppercase text-center block tracking-tighter">0{history.length - idx}</span>
              </div>
            </button>
          ))}
          {history.length === 0 && !isGenerating && (
            <div className="flex flex-col items-center gap-2 opacity-10 py-10">
              <ImageIcon size={24} />
              <span className="text-[8px] font-black uppercase">Trống</span>
            </div>
          )}
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
