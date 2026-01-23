
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Zap, Upload, Cake, ChevronDown, Sparkles, 
  User, Palette, Maximize2, Star, Image as ImageIcon, 
  Loader2, Coins, Settings2, Cpu, ShieldCheck, Terminal,
  Shirt, LayoutGrid, Activity, Share2, Download, Check,
  UserCircle, Gift, MapPin
} from 'lucide-react';
import { generateDemoImage } from '../services/gemini';
import { useAuth } from '../context/AuthContext';
import { uploadToGCS } from '../services/storage';

const CONCEPTS = ['Tiệc trà cổ điển', 'Neon Cyber Party', 'Outdoor Picnic', 'Luxury Ballroom', 'Manga Fantasy', 'Vintage 90s'];
const STYLES = ['Trong trẻo', 'Rực rỡ', 'Điện ảnh', 'Retro Film', 'High Fashion'];
const FEMALE_OUTFITS = ['Váy công chúa xòe', 'Đầm lụa sang trọng', 'Trang phục dạ hội', 'Streetwear năng động', 'Váy dự tiệc tối giản'];
const MALE_OUTFITS = ['Vest hiện đại', 'Sơ mi thanh lịch', 'Streetwear chất lừ', 'Tuxedo cổ điển', 'Áo len mỏng ấm áp'];
const POSES = ['Thổi nến lãng mạn', 'Cầm ly champagne', 'Cười tự nhiên', 'Dáng đứng fashion', 'Ngồi trên hộp quà'];
const RATIOS = ['1:1', '16:9', '9:16', '3:4', '4:3'];

const AI_MODELS = [
  { id: 'gemini-2.5-flash-image', name: 'Gemini 2.5 Flash', cost: 150 },
  { id: 'gemini-3-pro-image-preview', name: 'Gemini 3 Pro (UHD)', cost: 500 }
];

const BirthdayStudioWorkspace: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { credits, useCredits, isAuthenticated, login, refreshUserInfo } = useAuth();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [sourceImg, setSourceImg] = useState<string | null>(null);
  const [faceLock, setFaceLock] = useState(true);

  // Config States
  const [gender, setGender] = useState<'Nữ' | 'Nam'>('Nữ');
  const [selectedConcept, setSelectedConcept] = useState(CONCEPTS[0]);
  const [selectedStyle, setSelectedStyle] = useState(STYLES[0]);
  const [selectedOutfit, setSelectedOutfit] = useState(FEMALE_OUTFITS[0]);
  const [selectedPose, setSelectedPose] = useState(POSES[0]);
  const [selectedRatio, setSelectedRatio] = useState(RATIOS[0]);
  const [selectedModel, setSelectedModel] = useState(AI_MODELS[0]);
  const [extraPrompt, setExtraPrompt] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const actionCost = selectedModel.cost;

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

      const promptDirective = `Professional Birthday Photo Production. Gender: ${gender}. Concept: ${selectedConcept}. Style: ${selectedStyle}. 
        Outfit: ${selectedOutfit}. Pose: ${selectedPose}. Ratio: ${selectedRatio}. 
        Details: ${extraPrompt}. Face Lock: ${faceLock ? 'Enabled' : 'Disabled'}. 
        Joyful and cinematic birthday atmosphere, high quality 8K.`;

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
    <div className="h-full w-full flex bg-white dark:bg-[#0d0e12] text-slate-900 dark:text-white font-sans overflow-hidden transition-all duration-500">
      
      {/* SIDEBAR (TRÁI) */}
      <aside className="w-full md:w-[420px] shrink-0 border-r border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-[#0d0e12] flex flex-col relative z-20 shadow-2xl transition-colors">
        
        <div className="flex-grow overflow-y-auto no-scrollbar p-8 space-y-8 pb-12">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-600/10 border border-purple-500/20 rounded-xl flex items-center justify-center text-purple-600 shadow-sm">
                <Cake size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white leading-none">TẠO ẢNH SINH NHẬT</h2>
                <p className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest mt-1 italic">Birthday AI Engine v4.2</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div 
                className={`w-12 h-6 rounded-full relative transition-colors cursor-pointer border ${faceLock ? 'bg-purple-600 border-purple-500' : 'bg-slate-200 dark:bg-gray-800 border-slate-300 dark:border-white/10'}`} 
                onClick={() => setFaceLock(!faceLock)}
              >
                <motion.div animate={{ x: faceLock ? 24 : 2 }} className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg" />
              </div>
              <span className="text-[7px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-widest">FACE LOCK</span>
            </div>
          </div>

          <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium px-1">Tạo ảnh sinh nhật độc đáo với concept sáng tạo.</p>

          {/* UPLOAD AREA */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="aspect-video rounded-2xl border-2 border-dashed border-slate-200 dark:border-white/10 bg-white dark:bg-black/40 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-purple-500/40 transition-all group overflow-hidden relative shadow-inner"
          >
            {isUploading ? (
              <Loader2 className="animate-spin text-purple-500" size={32} />
            ) : sourceImg ? (
              <img src={sourceImg} className="w-full h-full object-cover" alt="Anchor" />
            ) : (
              <>
                <Upload size={32} className="text-purple-500/40 group-hover:scale-110 transition-transform" />
                <p className="text-[10px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest text-center px-4 italic">ẢNH NHÂN VẬT CHÍNH</p>
              </>
            )}
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleUpload} />
          </div>

          <div className="flex items-center gap-3 py-3 border-y border-black/5 dark:border-white/5">
             <Zap size={14} className="text-purple-600" fill="currentColor" />
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-500">ENGINE:</span>
             <select 
               value={selectedModel.id} 
               onChange={e => setSelectedModel(AI_MODELS.find(m => m.id === e.target.value)!)}
               className="bg-transparent border-none text-[11px] font-black uppercase text-brand-blue outline-none cursor-pointer"
             >
                {AI_MODELS.map(m => <option key={m.id} value={m.id} className="dark:bg-black">{m.name}</option>)}
             </select>
          </div>

          {/* Gender Select */}
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => { setGender('Nữ'); setSelectedOutfit(FEMALE_OUTFITS[0]); }}
              className={`py-3.5 rounded-xl text-[11px] font-black uppercase transition-all border ${gender === 'Nữ' ? 'bg-purple-600 text-white border-transparent shadow-lg' : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-400'}`}
            >
              Nữ
            </button>
            <button 
              onClick={() => { setGender('Nam'); setSelectedOutfit(MALE_OUTFITS[0]); }}
              className={`py-3.5 rounded-xl text-[11px] font-black uppercase transition-all border ${gender === 'Nam' ? 'bg-purple-600 text-white border-transparent shadow-lg' : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-400'}`}
            >
              Nam
            </button>
          </div>

          {/* Configuration Form */}
          <div className="space-y-6">
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest italic flex items-center gap-2 px-1"><Shirt size={10} className="text-purple-500" /> TRANG PHỤC {gender.toUpperCase()}</label>
                  <div className="relative">
                    <select value={selectedOutfit} onChange={e => setSelectedOutfit(e.target.value)} className="w-full bg-white dark:bg-[#1a1b26] border border-slate-200 dark:border-white/10 rounded-lg p-2.5 text-[10px] font-bold outline-none text-slate-700 dark:text-white appearance-none">
                      {(gender === 'Nữ' ? FEMALE_OUTFITS : MALE_OUTFITS).map(o => <option key={o}>{o}</option>)}
                    </select>
                    <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest italic flex items-center gap-2 px-1"><Palette size={10} className="text-purple-500" /> PHONG CÁCH</label>
                  <div className="relative">
                    <select value={selectedStyle} onChange={e => setSelectedStyle(e.target.value)} className="w-full bg-white dark:bg-[#1a1b26] border border-slate-200 dark:border-white/10 rounded-lg p-2.5 text-[10px] font-bold outline-none text-slate-700 dark:text-white appearance-none">
                      {STYLES.map(s => <option key={s}>{s}</option>)}
                    </select>
                    <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest italic flex items-center gap-2 px-1"><MapPin size={10} className="text-purple-500" /> BỐI CẢNH</label>
                  <div className="relative">
                    <select value={selectedConcept} onChange={e => setSelectedConcept(e.target.value)} className="w-full bg-white dark:bg-[#1a1b26] border border-slate-200 dark:border-white/10 rounded-lg p-2.5 text-[10px] font-bold outline-none text-slate-700 dark:text-white appearance-none">
                      {CONCEPTS.map(o => <option key={o}>{o}</option>)}
                    </select>
                    <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest italic flex items-center gap-2 px-1"><UserCircle size={10} className="text-purple-500" /> TẠO DÁNG</label>
                  <div className="relative">
                    <select value={selectedPose} onChange={e => setSelectedPose(e.target.value)} className="w-full bg-white dark:bg-[#1a1b26] border border-slate-200 dark:border-white/10 rounded-lg p-2.5 text-[10px] font-bold outline-none text-slate-700 dark:text-white appearance-none">
                      {POSES.map(o => <option key={o}>{o}</option>)}
                    </select>
                    <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
             </div>

             <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest italic px-1">TỶ LỆ KHUNG HÌNH</label>
                <div className="relative">
                  <select value={selectedRatio} onChange={e => setSelectedRatio(e.target.value)} className="w-full bg-white dark:bg-[#1a1b26] border border-slate-200 dark:border-white/10 rounded-lg p-2.5 text-[10px] font-bold outline-none text-slate-700 dark:text-white appearance-none">
                     <option value="Giữ nguyên">Giữ nguyên</option>
                     {RATIOS.filter(r => r !== '1:1').map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                  <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
             </div>

             <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-slate-400 dark:text-gray-400 tracking-widest px-1">YÊU CẦU BỔ SUNG</label>
                <textarea 
                  value={extraPrompt} onChange={e => setExtraPrompt(e.target.value)} 
                  className="w-full h-24 bg-white dark:bg-[#1a1b26] border border-slate-200 dark:border-white/5 p-4 text-[11px] font-medium outline-none rounded-xl text-slate-800 dark:text-white shadow-inner" 
                  placeholder="Nhập thêm yêu cầu..." 
                />
             </div>
          </div>
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
               className={`w-full py-5 rounded-2xl flex items-center justify-center gap-4 text-xs font-black uppercase tracking-[0.4em] shadow-xl transition-all active:scale-[0.98] group relative overflow-hidden ${isGenerating || !sourceImg ? 'opacity-50 grayscale bg-slate-200 dark:bg-gray-800' : 'bg-purple-600 text-white hover:brightness-110 shadow-purple-600/20'}`}
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
               <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse shadow-[0_0_8px_#a855f7]"></div>
               <span className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-gray-500 italic">KẾT QUẢ</span>
            </div>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors bg-black/5 dark:bg-white/5 rounded-full"><X size={18} /></button>
         </header>

         <div className="flex-grow flex items-center justify-center p-12 relative overflow-hidden">
            <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #a855f7 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

            <AnimatePresence mode="wait">
               {result ? (
                 <motion.div key="result" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="relative group max-w-5xl w-full aspect-[4/3] bg-white dark:bg-black rounded-sm overflow-hidden shadow-2xl border border-slate-200 dark:border-white/10">
                    <img src={result} className="w-full h-full object-cover" alt="Birthday Result" />
                    <div className="absolute top-6 right-6 flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                       <button className="p-4 bg-white/90 dark:bg-black/80 backdrop-blur-md rounded-full shadow-2xl text-slate-800 dark:text-white hover:bg-purple-600 hover:text-white transition-all"><Share2 size={20}/></button>
                       <a href={result} download={`birthday_ai_${Date.now()}.png`} className="p-4 bg-white text-black rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center"><Download size={20}/></a>
                    </div>
                 </motion.div>
               ) : isGenerating ? (
                 <motion.div key="gen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-12 text-center">
                    <div className="relative">
                       <Loader2 size={120} className="text-purple-500 animate-spin" strokeWidth={1} />
                       <Cake size={40} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-purple-400 animate-pulse" fill="currentColor" />
                    </div>
                    <div className="space-y-4">
                       <p className="text-xl font-black uppercase tracking-[0.6em] animate-pulse italic text-slate-900 dark:text-white">ĐANG KHỞI TẠO BỮA TIỆC...</p>
                       <p className="text-[10px] font-bold text-slate-400 dark:text-gray-600 uppercase tracking-widest italic">Hệ thống AI đang thực thi</p>
                    </div>
                 </motion.div>
               ) : (
                 <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-10 opacity-20 flex flex-col items-center select-none transition-opacity">
                    <div className="w-32 h-32 rounded-full border-2 border-dashed border-purple-500/30 flex items-center justify-center">
                      <Cake size={60} strokeWidth={1} className="text-slate-900 dark:text-white animate-pulse" />
                    </div>
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
               <span className="flex items-center gap-1.5"><Terminal size={10} className="text-purple-500" /> ĐỘ TRỄ: 0.35s</span>
            </div>
            <span className="text-[8px] font-black text-slate-400 dark:text-gray-700 uppercase tracking-tighter italic">Skyverses Soul Birthday Production</span>
         </div>
      </main>
    </div>
  );
};

export default BirthdayStudioWorkspace;
