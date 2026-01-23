
import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Zap, Upload, Snowflake, ChevronDown, Sparkles, 
  User, MapPin, Palette, Layout, Maximize2, 
  Activity, Star, Image as ImageIcon, Loader2,
  Lock, Trash2, Check, RefreshCw, Layers, Sliders,
  Gift, LayoutGrid, Share2, Download, AlertTriangle,
  Coins, Terminal, Settings2, Cpu, Globe, ShieldCheck,
  Binary, Fingerprint, Command
} from 'lucide-react';
import { generateDemoImage } from '../services/gemini';
import { useAuth } from '../context/AuthContext';
import { uploadToGCS } from '../services/storage';

const SUBJECT_OPTIONS = ['Lễ hội ánh sáng', 'Mùa đông kỳ ảo', 'Cyberpunk Christmas', 'Manga Noel', 'Vintage Holiday'];
const RATIOS = ['1:1', '16:9', '9:16', '4:3', '3:4'];
const QUALITY_MODES = ['Tiêu chuẩn (Nhanh)', 'Sắc nét (Chất lượng)', 'Điện ảnh (UHD)'];
const AI_MODELS = [
  { id: 'gemini-2.5-flash-image', name: 'Gemini 2.5 Flash', cost: 150 },
  { id: 'gemini-3-pro-image-preview', name: 'Gemini 3 Pro (PRO)', cost: 500 }
];

const SCENE_TAGS = ['Tuyết rơi', 'Lò sưởi', 'Đường phố neon', 'Rừng thông', 'Bữa tiệc tối'];
const EFFECT_TAGS = ['Bokeh', 'Sương mù', 'Lấp lánh', 'Phản chiếu', 'Macro'];

interface NoelStudioWorkspaceProps {
  onClose: () => void;
}

const NoelStudioWorkspace: React.FC<NoelStudioWorkspaceProps> = ({ onClose }) => {
  const { credits, useCredits, isAuthenticated, login, refreshUserInfo } = useAuth();
  
  // App Logic States
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [sourceImg, setSourceImg] = useState<string | null>(null);
  const [faceLock, setFaceLock] = useState(true);

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
        setResult(res);
        refreshUserInfo();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-full w-full flex bg-[#0d0e12] text-white font-sans overflow-hidden transition-all duration-500">
      
      {/* --- SIDEBAR: CONTROLS --- */}
      <aside className="w-full md:w-[420px] shrink-0 border-r border-white/5 bg-[#0d0e12] flex flex-col relative z-20 shadow-2xl transition-colors">
        
        {/* Scrollable Configuration Content */}
        <div className="flex-grow overflow-y-auto no-scrollbar p-8 space-y-10 pb-12">
          
          {/* Header */}
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-600/20 border border-purple-500/30 rounded-xl flex items-center justify-center text-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.2)]">
                <Snowflake size={24} className="animate-spin-slow" />
              </div>
              <div>
                <h2 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">NOEL STUDIO PRO</h2>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest italic">Công cụ tạo ảnh AI v2.5</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div 
                className={`w-12 h-6 rounded-full relative transition-colors cursor-pointer border ${faceLock ? 'bg-purple-600 border-purple-500' : 'bg-gray-800 border-white/10'}`} 
                onClick={() => setFaceLock(!faceLock)}
              >
                <motion.div animate={{ x: faceLock ? 24 : 2 }} className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg" />
              </div>
              <span className="text-[7px] font-black text-gray-500 uppercase tracking-widest">KHÓA MẶT</span>
            </div>
          </div>

          {/* Upload Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Ảnh chân dung mẫu</label>
              <div className="flex items-center gap-1.5 text-[8px] font-mono text-emerald-500">
                <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></div>
                SẴN SÀNG
              </div>
            </div>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="aspect-video rounded-2xl border-2 border-dashed border-white/10 bg-black/40 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-purple-500/40 transition-all group overflow-hidden relative shadow-inner"
            >
              {isUploading ? (
                <Loader2 className="animate-spin text-purple-500" size={32} />
              ) : sourceImg ? (
                <img src={sourceImg} className="w-full h-full object-cover" alt="Anchor" />
              ) : (
                <>
                  <div className="p-4 bg-purple-500/5 rounded-full group-hover:scale-110 transition-transform">
                    <Upload size={32} className="text-purple-500/40" />
                  </div>
                  <span className="text-[11px] font-black uppercase text-gray-500 tracking-widest italic">Tải ảnh khuôn mặt</span>
                </>
              )}
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleUpload} />
            </div>
          </div>

          {/* Step 1: Chủ đề */}
          <section className="space-y-6">
             <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs font-black italic text-purple-400">01</div>
                <h3 className="text-sm font-black uppercase tracking-widest text-white italic">CHỦ ĐỀ & PHONG CÁCH</h3>
             </div>
             <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-1 flex items-center gap-2">
                    <User size={12} className="text-purple-500" /> PHONG CÁCH CHỦ ĐẠO
                  </label>
                  <div className="relative">
                    <select 
                      value={selectedSubject} 
                      onChange={(e) => setSelectedSubject(e.target.value)}
                      className="w-full bg-[#1a1b26] border border-white/10 rounded-lg p-3.5 text-xs font-bold text-slate-300 outline-none focus:border-purple-500/50 appearance-none cursor-pointer shadow-inner"
                    >
                      {SUBJECT_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-3">
                   <div className="flex justify-between items-center px-1">
                      <label className="text-[9px] font-black uppercase text-gray-500 tracking-widest">BỐI CẢNH GIÁNG SINH (Tối đa 3)</label>
                   </div>
                   <div className="flex flex-wrap gap-2">
                      {SCENE_TAGS.map(tag => (
                         <button 
                           key={tag} 
                           onClick={() => toggleTag(tag, selectedScenes, setSelectedScenes)}
                           className={`px-3 py-2 rounded-lg text-[9px] font-bold uppercase transition-all border ${selectedScenes.includes(tag) ? 'bg-purple-600 border-purple-500 text-white' : 'bg-white/5 text-gray-500 border-white/5 hover:border-white/10'}`}
                         >
                            + {tag}
                         </button>
                      ))}
                   </div>
                </div>
             </div>
          </section>

          {/* Step 2: Cấu hình AI */}
          <section className="space-y-6 pt-6 border-t border-white/5">
             <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs font-black italic text-purple-400">02</div>
                <h3 className="text-sm font-black uppercase tracking-widest text-white italic flex items-center gap-2">
                  <Settings2 size={16} className="text-purple-500" /> CẤU HÌNH AI
                </h3>
             </div>

             <div className="grid grid-cols-1 gap-6 bg-black/40 p-6 rounded-2xl border border-white/5 shadow-inner">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-1 flex items-center gap-2">
                    <Cpu size={12} className="text-purple-500" /> MODEL XỬ LÝ
                  </label>
                  <div className="relative">
                    <select 
                      value={selectedModel.id} 
                      onChange={(e) => setSelectedModel(AI_MODELS.find(m => m.id === e.target.value)!)}
                      className="w-full bg-[#1a1b26] border border-white/10 rounded-lg p-3.5 text-[11px] font-black uppercase italic outline-none focus:border-purple-500/50 appearance-none cursor-pointer text-brand-blue"
                    >
                      {AI_MODELS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-1">TỈ LỆ ẢNH</label>
                    <div className="relative">
                      <select 
                        value={selectedRatio} 
                        onChange={(e) => setSelectedRatio(e.target.value)}
                        className="w-full bg-[#1a1b26] border border-white/10 rounded-lg p-3 text-[11px] font-bold outline-none appearance-none cursor-pointer text-white"
                      >
                        {RATIOS.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-1">CHẤT LƯỢNG</label>
                    <div className="relative">
                      <select 
                        value={selectedQuality} 
                        onChange={(e) => setSelectedQuality(e.target.value)}
                        className="w-full bg-[#1a1b26] border border-white/10 rounded-lg p-3 text-[11px] font-bold outline-none appearance-none cursor-pointer text-white"
                      >
                        {QUALITY_MODES.map(q => <option key={q} value={q}>{q}</option>)}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                    </div>
                  </div>
                </div>
             </div>
          </section>
        </div>

        {/* STICKY FOOTER ACTION HUB */}
        <div className="shrink-0 p-6 space-y-5 bg-[#0d0e12]/95 backdrop-blur-xl border-t border-white/5 shadow-[0_-20px_40px_rgba(0,0,0,0.2)]">
             <div className="flex justify-between items-center px-2">
                <div className="flex flex-col">
                  <span className="text-[8px] font-black uppercase text-gray-500 tracking-widest mb-1 italic">Số dư tài khoản</span>
                  <div className="flex items-center gap-2 text-brand-blue leading-none">
                    <Coins size={14} className="text-yellow-500" fill="currentColor" />
                    <span className="text-[14px] font-black italic">{credits.toLocaleString()} CR</span>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end">
                  <span className="text-[8px] font-black uppercase text-gray-500 tracking-widest mb-1 italic">Chi phí tạo ảnh</span>
                  <div className="flex items-center gap-1 text-orange-500 leading-none">
                    <Zap size={12} fill="currentColor" />
                    <span className="text-[14px] font-black italic">{actionCost} CR</span>
                  </div>
                </div>
             </div>

             <button 
               onClick={handleGenerate}
               disabled={isGenerating}
               className={`w-full py-5 rounded-2xl flex items-center justify-center gap-4 text-xs font-black uppercase tracking-[0.4em] shadow-xl transition-all active:scale-[0.98] group relative overflow-hidden ${isGenerating ? 'opacity-50 grayscale cursor-not-allowed bg-gray-800' : 'bg-slate-200 hover:bg-white text-slate-900 shadow-white/10'}`}
             >
                <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                {isGenerating ? <Loader2 className="animate-spin" size={18}/> : <Sparkles size={18} className="group-hover:rotate-12 transition-transform" />}
                KHỞI TẠO HÌNH ẢNH
             </button>
        </div>
      </aside>

      {/* --- MAIN VIEWPORT: KẾT QUẢ --- */}
      <main className="flex-grow flex flex-col relative bg-[#020205] transition-colors duration-500">
         <header className="h-14 border-b border-white/5 bg-black/40 backdrop-blur-xl flex items-center justify-between px-8 z-30 shrink-0">
            <div className="flex items-center gap-4">
               <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse shadow-[0_0_8px_#a855f7]"></div>
               <span className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-500 italic">MÀN HÌNH HIỂN THỊ</span>
            </div>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors bg-white/5 rounded-full"><X size={18} /></button>
         </header>

         <div className="flex-grow flex items-center justify-center p-12 relative overflow-hidden">
            <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #a855f7 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

            <AnimatePresence mode="wait">
               {result ? (
                 <motion.div key="result" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="relative group max-w-5xl w-full aspect-[4/3] bg-black rounded-sm overflow-hidden shadow-[0_40px_100px_rgba(168,85,247,0.15)] border border-white/10">
                    <img src={result} className="w-full h-full object-contain" alt="Noel Result" />
                    <div className="absolute top-6 right-6 flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                       <button className="p-4 bg-white/90 dark:bg-black/80 backdrop-blur-md rounded-full shadow-2xl text-slate-800 dark:text-white hover:bg-purple-600 hover:text-white transition-all"><Share2 size={20}/></button>
                       <a href={result} download={`noel_ai_${Date.now()}.png`} className="p-4 bg-white text-black rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center"><Download size={20}/></a>
                    </div>
                 </motion.div>
               ) : isGenerating ? (
                 <motion.div key="gen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-12 text-center">
                    <div className="relative">
                       <Loader2 size={120} className="text-purple-600 animate-spin" strokeWidth={1} />
                       <Snowflake size={40} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-purple-400 animate-pulse" />
                    </div>
                    <div className="space-y-4">
                       <p className="text-xl font-black uppercase tracking-[0.6em] animate-pulse italic text-white">ĐANG XỬ LÝ HÌNH ẢNH...</p>
                       <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest italic">Hệ thống AI đang thực thi</p>
                    </div>
                 </motion.div>
               ) : (
                 <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-10 opacity-20 flex flex-col items-center select-none">
                    <Snowflake size={140} strokeWidth={1} className="text-white animate-spin-slow" />
                    <div className="space-y-2">
                       <h3 className="text-4xl font-black uppercase tracking-[0.5em] italic text-white leading-none">STUDIO READY</h3>
                       <p className="text-sm font-bold uppercase tracking-widest text-gray-500 italic">HỆ THỐNG SẴN SÀNG KHỞI TẠO</p>
                    </div>
                 </motion.div>
               )}
            </AnimatePresence>
         </div>

         {/* Bottom Status Bar */}
         <div className="h-10 bg-black/60 border-t border-white/5 flex items-center justify-between px-8 shrink-0">
            <div className="flex items-center gap-6 text-[8px] font-black uppercase text-gray-600 tracking-widest">
               <span className="flex items-center gap-1.5"><ShieldCheck size={10} className="text-emerald-500" /> KẾT NỐI BẢO MẬT</span>
               <span className="flex items-center gap-1.5"><Terminal size={10} className="text-purple-500" /> ĐỘ TRỄ: 0.42s</span>
            </div>
            <span className="text-[8px] font-black text-gray-700 uppercase tracking-tighter">Hệ thống xử lý hình ảnh Skyverses</span>
         </div>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .animate-spin-slow {
          animation: spin 12s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      ` }} />
    </div>
  );
};

export default NoelStudioWorkspace;
