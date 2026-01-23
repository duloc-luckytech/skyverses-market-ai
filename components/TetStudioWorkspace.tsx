
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Zap, Upload, Flower2, ChevronDown, Sparkles, 
  User, Palette, Maximize2, Star, Image as ImageIcon, 
  Loader2, Coins, Settings2, Cpu, ShieldCheck, Terminal,
  Shirt, LayoutGrid, Activity, Share2, Download, Check
} from 'lucide-react';
import { generateDemoImage } from '../services/gemini';
import { useAuth } from '../context/AuthContext';
import { uploadToGCS } from '../services/storage';

const SUBJECT_STYLES = ['Nữ giới', 'Nam giới', 'Trẻ em', 'Gia đình'];
const LAYOUT_OPTIONS = ['Chân dung', 'Toàn thân', 'Cận cảnh', 'Nửa người'];
const ART_STYLES = ['Điện ảnh', 'Tranh lụa', 'Manga', '3D Render', 'Hoài cổ'];
const CLOTHING_OPTIONS = ['Áo dài truyền thống', 'Áo dài cách tân', 'Việt phục', 'Áo Yếm', 'Tự do'];
const ACCESSORIES = ['Cành mai', 'Cành đào', 'Lì xì', 'Câu đối', 'Quạt giấy'];
const SCENES = ['Chợ Tết', 'Phố ông đồ', 'Đền chùa', 'Vườn hoa', 'Trong nhà'];
const EFFECTS = ['Nắng xuân', 'Mưa bụi', 'Lấp lánh', 'Mờ hậu cảnh'];

const AI_MODELS = [
  { id: 'gemini-2.5-flash-image', name: 'Gemini 2.5 Flash', cost: 150 },
  { id: 'gemini-3-pro-image-preview', name: 'Gemini 3 Pro (UHD)', cost: 500 }
];

const TetStudioWorkspace: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { credits, useCredits, isAuthenticated, login, refreshUserInfo } = useAuth();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [sourceImg, setSourceImg] = useState<string | null>(null);
  const [faceLock, setFaceLock] = useState(true);

  // Config States
  const [selectedGender, setSelectedGender] = useState('Nữ giới');
  const [selectedLayout, setSelectedLayout] = useState(LAYOUT_OPTIONS[0]);
  const [selectedArtStyle, setSelectedArtStyle] = useState(ART_STYLES[0]);
  const [selectedClothing, setSelectedClothing] = useState(CLOTHING_OPTIONS[0]);
  const [selectedModel, setSelectedModel] = useState(AI_MODELS[0]);
  const [quantity, setQuantity] = useState(1);
  const [extraPrompt, setExtraPrompt] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const actionCost = selectedModel.cost * quantity;

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

  const handleGenerate = async () => {
    if (!isAuthenticated) { login(); return; }
    if (credits < actionCost) { alert("Số dư credits không đủ."); return; }
    
    setIsGenerating(true);
    try {
      const successful = useCredits(actionCost);
      if (!successful) return;

      const promptDirective = `Tet Holiday Photo Production. Subject: ${selectedGender}. Layout: ${selectedLayout}. 
        Style: ${selectedArtStyle}. Wearing: ${selectedClothing}. 
        Details: ${extraPrompt}. Face Lock: ${faceLock ? 'Enabled' : 'Disabled'}. 
        Vibrant Lunar New Year atmosphere, Peach/Apricot flowers, High fidelity 8K.`;

      const res = await generateDemoImage({
        prompt: promptDirective,
        images: sourceImg ? [sourceImg] : [],
        model: selectedModel.id
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
    <div className="h-full w-full flex bg-white dark:bg-[#0d0e12] text-slate-900 dark:text-white font-sans overflow-hidden transition-all duration-500">
      
      {/* SIDEBAR (TRÁI) */}
      <aside className="w-full md:w-[420px] shrink-0 border-r border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-[#0d0e12] flex flex-col relative z-20 shadow-2xl transition-colors">
        
        <div className="flex-grow overflow-y-auto no-scrollbar p-8 space-y-10 pb-12">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-600/10 border border-red-500/20 rounded-xl flex items-center justify-center text-red-600 shadow-sm">
                <Flower2 size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white leading-none">TẠO ẢNH TẾT</h2>
                <p className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest mt-1 italic">Lunar New Year AI v4.0</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div 
                className={`w-12 h-6 rounded-full relative transition-colors cursor-pointer border ${faceLock ? 'bg-red-600 border-red-500' : 'bg-slate-200 dark:bg-gray-800 border-slate-300 dark:border-white/10'}`} 
                onClick={() => setFaceLock(!faceLock)}
              >
                <motion.div animate={{ x: faceLock ? 24 : 2 }} className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg" />
              </div>
              <span className="text-[7px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-widest">FACE LOCK</span>
            </div>
          </div>

          {/* Upload Area */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="aspect-video rounded-2xl border-2 border-dashed border-slate-200 dark:border-white/10 bg-white dark:bg-black/40 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-red-500/40 transition-all group overflow-hidden relative shadow-inner"
          >
            {isUploading ? (
              <Loader2 className="animate-spin text-red-500" size={32} />
            ) : sourceImg ? (
              <img src={sourceImg} className="w-full h-full object-cover" alt="Anchor" />
            ) : (
              <>
                <Upload size={32} className="text-red-500/40 group-hover:scale-110 transition-transform" />
                <p className="text-[10px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest text-center px-4 italic">ẢNH CHÂN DUNG CẦN GHÉP TẾT</p>
              </>
            )}
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleUpload} />
          </div>

          <div className="flex items-center gap-3 py-3 border-y border-black/5 dark:border-white/5">
             <Zap size={14} className="text-red-600" fill="currentColor" />
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-500">ENGINE:</span>
             <select 
               value={selectedModel.id} 
               onChange={e => setSelectedModel(AI_MODELS.find(m => m.id === e.target.value)!)}
               className="bg-transparent border-none text-[11px] font-black uppercase text-brand-blue outline-none cursor-pointer"
             >
                {AI_MODELS.map(m => <option key={m.id} value={m.id} className="dark:bg-black">{m.name}</option>)}
             </select>
          </div>

          {/* Step 1: Đối tượng */}
          <section className="space-y-6">
             <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-white/5 border border-slate-300 dark:border-white/10 flex items-center justify-center text-xs font-black italic text-red-500">1</div>
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-white italic">ĐỐI TƯỢNG & BỐ CỤC</h3>
             </div>
             
             <div className="flex gap-2">
                {['Nữ giới', 'Nam giới'].map(g => (
                  <button 
                    key={g} onClick={() => setSelectedGender(g)}
                    className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase transition-all border ${selectedGender === g ? 'bg-gradient-to-r from-red-600 to-pink-600 border-transparent text-white shadow-lg' : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/5 text-slate-400'}`}
                  >
                    {g === 'Nữ giới' ? '👩‍🦰 ' : '👨‍🦱 '} {g}
                  </button>
                ))}
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest pl-1 italic">BỐ CỤC (LAYOUT)</label>
                  <select value={selectedLayout} onChange={e => setSelectedLayout(e.target.value)} className="w-full bg-white dark:bg-[#1a1b26] border border-slate-200 dark:border-white/10 rounded-lg p-3 text-[11px] font-bold outline-none text-slate-700 dark:text-white">
                    {LAYOUT_OPTIONS.map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest pl-1 italic">PHONG CÁCH</label>
                  <select value={selectedArtStyle} onChange={e => setSelectedArtStyle(e.target.value)} className="w-full bg-white dark:bg-[#1a1b26] border border-slate-200 dark:border-white/10 rounded-lg p-3 text-[11px] font-bold outline-none text-slate-700 dark:text-white">
                    {ART_STYLES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
             </div>
          </section>

          {/* Step 2: Trang phục */}
          <section className="space-y-6 pt-6 border-t border-black/5 dark:border-white/5">
             <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-white/5 border border-slate-300 dark:border-white/10 flex items-center justify-center text-xs font-black italic text-red-500">2</div>
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-white italic">TRANG PHỤC & CHI TIẾT</h3>
             </div>
             <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest pl-1 italic">TRANG PHỤC {selectedGender.toUpperCase()}</label>
                <select value={selectedClothing} onChange={e => setSelectedClothing(e.target.value)} className="w-full bg-white dark:bg-[#1a1b26] border border-slate-200 dark:border-white/10 rounded-lg p-3 text-[11px] font-bold outline-none text-slate-700 dark:text-white">
                   {CLOTHING_OPTIONS.map(o => <option key={o}>{o}</option>)}
                </select>
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                   <label className="text-[9px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest pl-1 italic">PHỤ KIỆN</label>
                   <select className="w-full bg-white dark:bg-[#1a1b26] border border-slate-200 dark:border-white/10 rounded-lg p-3 text-[10px] font-bold outline-none text-slate-700 dark:text-white">
                      <option>-- Chọn --</option>
                      {ACCESSORIES.map(a => <option key={a}>{a}</option>)}
                   </select>
                </div>
                <div className="space-y-2">
                   <label className="text-[9px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest pl-1 italic">BỐI CẢNH</label>
                   <select className="w-full bg-white dark:bg-[#1a1b26] border border-slate-200 dark:border-white/10 rounded-lg p-3 text-[10px] font-bold outline-none text-slate-700 dark:text-white">
                      <option>-- Chọn --</option>
                      {SCENES.map(s => <option key={s}>{s}</option>)}
                   </select>
                </div>
             </div>
             <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                   <label className="text-[10px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest">YÊU CẦU BỔ SUNG</label>
                </div>
                <textarea 
                  value={extraPrompt} onChange={e => setExtraPrompt(e.target.value)} 
                  className="w-full h-24 bg-white dark:bg-[#1a1b26] border border-slate-200 dark:border-white/5 p-4 text-[11px] font-medium outline-none rounded-xl text-slate-800 dark:text-white shadow-inner" 
                  placeholder="VD: Thêm cành hoa đào trước mặt, ánh sáng nắng nhẹ..." 
                />
             </div>
          </section>
        </div>

        {/* STICKY FOOTER */}
        <div className="shrink-0 p-6 space-y-5 bg-white/95 dark:bg-[#0d0e12]/95 backdrop-blur-xl border-t border-slate-200 dark:border-white/5 shadow-2xl transition-colors">
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
               className={`w-full py-5 rounded-2xl flex items-center justify-center gap-4 text-xs font-black uppercase tracking-[0.4em] shadow-xl transition-all active:scale-[0.98] group relative overflow-hidden ${isGenerating || !sourceImg ? 'opacity-50 grayscale bg-slate-200 dark:bg-gray-800' : 'bg-red-600 text-white hover:brightness-110 shadow-red-600/20'}`}
             >
                <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                {isGenerating ? <Loader2 className="animate-spin" size={20}/> : <Sparkles size={20} fill="currentColor" />}
                THỰC HIỆN
             </button>
        </div>
      </aside>

      {/* VIEWPORT (PHẢI) */}
      <main className="flex-grow flex flex-col relative bg-slate-100 dark:bg-[#020205] transition-colors duration-500">
         <header className="h-14 border-b border-slate-200 dark:border-white/5 bg-white/80 dark:bg-black/40 backdrop-blur-xl flex items-center justify-between px-8 z-30 shrink-0 transition-colors">
            <div className="flex items-center gap-4">
               <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_red]"></div>
               <span className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-gray-500 italic">KẾT QUẢ</span>
            </div>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors bg-black/5 dark:bg-white/5 rounded-full"><X size={18} /></button>
         </header>

         <div className="flex-grow flex items-center justify-center p-12 relative overflow-hidden">
            <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #ef4444 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

            <AnimatePresence mode="wait">
               {result ? (
                 <motion.div key="result" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="relative group max-w-5xl w-full aspect-[4/3] bg-white dark:bg-black rounded-sm overflow-hidden shadow-2xl border border-slate-200 dark:border-white/10">
                    <img src={result} className="w-full h-full object-cover" alt="Tet Result" />
                    <div className="absolute top-6 right-6 flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                       <button className="p-4 bg-white/90 dark:bg-black/80 backdrop-blur-md rounded-full shadow-2xl text-slate-800 dark:text-white hover:bg-red-600 hover:text-white transition-all"><Share2 size={20}/></button>
                       <a href={result} download={`tet_ai_${Date.now()}.png`} className="p-4 bg-white text-black rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center"><Download size={20}/></a>
                    </div>
                 </motion.div>
               ) : isGenerating ? (
                 <motion.div key="gen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-12 text-center">
                    <div className="relative">
                       <Loader2 size={120} className="text-red-500 animate-spin" strokeWidth={1} />
                       <Flower2 size={40} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-red-400 animate-pulse" />
                    </div>
                    <div className="space-y-4">
                       <p className="text-xl font-black uppercase tracking-[0.6em] animate-pulse italic text-slate-900 dark:text-white">ĐANG KHỞI TẠO SẮC XUÂN...</p>
                       <p className="text-[10px] font-bold text-slate-400 dark:text-gray-600 uppercase tracking-widest italic">Hệ thống AI đang thực thi</p>
                    </div>
                 </motion.div>
               ) : (
                 <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-10 opacity-20 flex flex-col items-center select-none transition-opacity">
                    <Flower2 size={140} strokeWidth={1} className="text-slate-900 dark:text-white animate-spin-slow" />
                    <div className="space-y-2">
                       <h3 className="text-4xl font-black uppercase tracking-[0.5em] italic text-slate-900 dark:text-white leading-none">MAGIC AI ENGINE</h3>
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
               <span className="flex items-center gap-1.5"><Terminal size={10} className="text-red-500" /> ĐỘ TRỄ: 0.35s</span>
            </div>
            <span className="text-[8px] font-black text-slate-400 dark:text-gray-700 uppercase tracking-tighter italic">Skyverses Soul Production Network</span>
         </div>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .animate-spin-slow {
          animation: spin 15s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      ` }} />
    </div>
  );
};

export default TetStudioWorkspace;
