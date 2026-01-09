
import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Upload, Mic, Play, Zap, 
  Download, Loader2, Sparkles, User, 
  Search, Plus, History, Volume2, 
  Check, ChevronDown, MonitorPlay,
  Image as ImageIcon,
  MoreVertical, ShieldCheck, Cpu,
  Mic2, Headphones, AlertTriangle,
  Share2, Wand2, Grid, LayoutGrid
} from 'lucide-react';
import { generateDemoVideo, generateDemoImage, generateDemoText } from '../services/gemini';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Link } from 'react-router-dom';

const AVATAR_SAMPLES = [
  { id: 's1', url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=400', label: '1> Scene: A young Japanese woman...' },
  { id: 's2', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=400', label: '1> Scene: A young woman...' },
  { id: 's3', url: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=400', label: '1> Scene: Professional presenter...' },
  { id: 's4', url: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=400', label: '1> Scene: Modern artist...' },
  { id: 's5', url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=400', label: 'Country: Japan Gender: Female...' },
  { id: 's6', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400', label: 'Avatar 6: Executive' },
  { id: 's7', url: 'https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&q=80&w=400', label: 'Cute Cat: Playful' },
  { id: 's8', url: 'https://images.unsplash.com/photo-1551033406-611cf9a28f67?auto=format&fit=crop&q=80&w=400', label: 'Cute Cat: Sleeping' },
];

const EXTENDED_AVATARS = [
  ...AVATAR_SAMPLES,
  { id: 's9', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400', label: 'Global Speaker: North America' },
  { id: 's10', url: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&q=80&w=400', label: 'Tech Expert: Software' },
  { id: 's11', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400', label: 'Financial Advisor' },
  { id: 's12', url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400', label: 'Corporate Lead' },
  { id: 's13', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400', label: 'Creative Designer' },
  { id: 's14', url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400', label: 'Young Entrepreneur' },
  { id: 's15', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400', label: 'Content Strategist' },
];

const AvatarLibraryModal: React.FC<{ 
  onClose: () => void; 
  onSelect: (av: any) => void;
  selectedId: string;
}> = ({ onClose, onSelect, selectedId }) => {
  const [search, setSearch] = useState('');
  
  const filtered = useMemo(() => {
    return EXTENDED_AVATARS.filter(a => a.label.toLowerCase().includes(search.toLowerCase()));
  }, [search]);

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[700] bg-black/80 dark:bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 md:p-12"
    >
      <motion.div 
        initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
        className="bg-white dark:bg-[#0d0d10] border border-slate-200 dark:border-white/5 rounded-2xl w-full max-w-6xl h-[85vh] flex flex-col overflow-hidden shadow-3xl transition-colors duration-500"
      >
        {/* Header */}
        <div className="h-20 border-b border-slate-100 dark:border-white/5 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-purple-100 dark:bg-purple-500/10 rounded-lg text-purple-600 dark:text-purple-400">
              <User size={20} />
            </div>
            <div>
              <h2 className="text-base font-black uppercase tracking-widest italic leading-none text-slate-900 dark:text-white">Danh sách Avatar mẫu</h2>
              <p className="text-[10px] font-bold text-slate-400 dark:text-gray-600 uppercase tracking-widest mt-1">140 avatar</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
            <X size={28} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-8 py-6 shrink-0">
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-600 group-focus-within:text-purple-500 transition-colors" size={20} />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm avatar mẫu..." 
              className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl py-4 pl-14 pr-6 text-sm font-bold text-slate-900 dark:text-white focus:border-purple-500/50 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-gray-700"
            />
          </div>
        </div>

        {/* Grid */}
        <div className="flex-grow overflow-y-auto p-8 pt-0 no-scrollbar">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filtered.map(av => (
              <button 
                key={av.id}
                onClick={() => onSelect(av)}
                className={`relative aspect-[3/4] rounded-xl border-2 overflow-hidden transition-all group ${selectedId === av.id ? 'border-purple-500 ring-4 ring-purple-500/10 shadow-[0_0_30px_rgba(168,85,247,0.2)]' : 'border-transparent opacity-60 hover:opacity-100 hover:border-slate-200 dark:hover:border-white/10'}`}
              >
                <img src={av.url} className="w-full h-full object-cover" alt="" />
                {selectedId === av.id && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-purple-600 rounded-full p-2 shadow-2xl">
                    <Check size={18} strokeWidth={4} className="text-white" />
                  </div>
                )}
                <div className="absolute bottom-0 inset-x-0 bg-white/60 dark:bg-black/60 p-2 backdrop-blur-md border-t border-slate-200 dark:border-white/5">
                  <p className="text-[8px] font-black text-slate-900 dark:text-white/80 truncate text-center uppercase tracking-widest">{av.label}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const AvatarGeneratorModal: React.FC<{ 
  onClose: () => void; 
  onGenerated: (url: string) => void;
}> = ({ onClose, onGenerated }) => {
  const { credits, useCredits, login, isAuthenticated } = useAuth();
  const [model, setModel] = useState('Nano Banana Pro x Cheap');
  const [prompt, setPrompt] = useState('');
  const [refImg, setRefImg] = useState<string | null>(null);
  const [ratio, setRatio] = useState('auto');
  const [mode, setMode] = useState('Cheap');
  const [resolution, setResolution] = useState('1k');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const GEN_COST = 150;

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setRefImg(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleEnhance = async () => {
    if (!prompt.trim() || isEnhancing) return;
    setIsEnhancing(true);
    try {
      const enhanced = await generateDemoText(`Bạn là một chuyên gia thiết kế nhân vật AI. Hãy mở rộng và tinh chỉnh prompt sau đây thành một mô tả cực kỳ chi tiết cho một Avatar chuyên nghiệp: "${prompt}". Tập trung vào ánh sáng, chi tiết nhiếp ảnh cao cấp, biểu cảm khuôn mặt và phong cách nghệ thuật. Phản hồi bằng Tiếng Việt ngắn gọn nhưng chất lượng cao.`);
      if (enhanced && !enhanced.includes("CONNECTION_TERMINATED")) setPrompt(enhanced);
    } catch (e) {
      console.error(e);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;
    if (!isAuthenticated) { login(); return; }
    if (credits < GEN_COST) { alert('Hạn ngạch node không đủ (Cần 150 credits)'); return; }

    setIsGenerating(true);
    try {
      const successful = useCredits(GEN_COST);
      if (!successful) throw new Error("Credits deduction failed");

      const modelId = model.includes('Gemini 3') ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';
      
      const res = await generateDemoImage(
        `High quality professional AI avatar: ${prompt}`, 
        refImg ? [refImg] : undefined, 
        modelId
      );
      
      if (res) setResult(res);
    } catch (e) {
      console.error(e);
      alert("Lỗi kiến tạo thực thể. Vui lòng thử lại.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[600] bg-black/70 dark:bg-black/80 backdrop-blur-md flex items-center justify-center p-4 md:p-10"
    >
      <motion.div 
        initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
        className="bg-white dark:bg-[#111114] border border-slate-200 dark:border-white/10 rounded-2xl w-full max-w-5xl h-[80vh] flex flex-col overflow-hidden shadow-2xl transition-colors duration-500"
      >
        {/* Header */}
        <div className="h-16 border-b border-slate-100 dark:border-white/10 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-lg text-blue-600 dark:text-blue-400">
              <ImageIcon size={18} />
            </div>
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Tạo Avatar mới bằng AI</h2>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
          {/* Sidebar */}
          <div className="w-full md:w-80 border-r border-slate-100 dark:border-white/10 p-6 space-y-6 overflow-y-auto no-scrollbar shrink-0 bg-slate-50 dark:bg-[#111114] transition-colors">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest">MODEL</label>
              <div className="relative">
                <select 
                  value={model} onChange={e => setModel(e.target.value)}
                  className="w-full bg-white dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-lg p-3 text-xs font-bold appearance-none outline-none focus:border-blue-500/50 text-slate-900 dark:text-white transition-colors"
                >
                  <option>Nano Banana Pro x Cheap</option>
                  <option>Gemini 3 Pro Image</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500 pointer-events-none" size={14} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest">ẢNH THAM CHIẾU</label>
              <div 
                onClick={() => fileRef.current?.click()}
                className="aspect-video border-2 border-dashed border-slate-200 dark:border-white/5 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-blue-500/30 transition-all bg-white dark:bg-black/20 group overflow-hidden"
              >
                {refImg ? (
                  <img src={refImg} className="w-full h-full object-cover" alt="Reference" />
                ) : (
                  <>
                    <Plus size={20} className="text-slate-400 dark:text-gray-600 group-hover:text-blue-500 transition-colors" />
                    <span className="text-[10px] font-black text-slate-400 dark:text-gray-600 uppercase">Thêm ảnh</span>
                  </>
                )}
              </div>
              <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={handleUpload} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest">PROMPT</label>
                <button 
                  onClick={handleEnhance} disabled={isEnhancing || !prompt.trim()}
                  className="flex items-center gap-1 text-[9px] font-black text-purple-600 dark:text-purple-400 hover:text-purple-500 transition-colors disabled:opacity-30"
                >
                  {isEnhancing ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}
                  Sáng tạo
                </button>
              </div>
              <textarea 
                value={prompt} onChange={e => setPrompt(e.target.value)}
                placeholder="Mô tả ảnh bạn muốn tạo..."
                className="w-full h-32 bg-white dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-lg p-4 text-xs font-bold outline-none focus:border-blue-500/50 resize-none transition-all placeholder:text-slate-300 dark:placeholder:text-gray-700 text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest">TỶ LỆ</label>
                <div className="bg-white dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-lg p-3 text-xs font-bold text-slate-600 dark:text-gray-300">{ratio}</div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest">CHẾ ĐỘ</label>
                <div className="bg-white dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-lg p-3 text-xs font-bold text-slate-600 dark:text-gray-300">{mode}</div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest">ĐỘ PHÂN GIẢI</label>
              <div className="bg-white dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-lg p-3 text-xs font-bold text-slate-600 dark:text-gray-300">{resolution}</div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-white/5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-slate-400 dark:text-gray-500">Chi phí ước tính</span>
                <div className="flex items-center gap-2 text-orange-600 dark:text-yellow-500">
                  <Zap size={14} fill="currentColor" />
                  <span className="text-sm font-black italic">{GEN_COST} credits</span>
                </div>
              </div>
              <button 
                onClick={handleGenerate} disabled={isGenerating || !prompt.trim()}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:grayscale transition-all rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl text-white"
              >
                {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} />}
                Tạo ảnh
              </button>
            </div>
          </div>

          {/* Result Viewport */}
          <div className="flex-grow bg-slate-100 dark:bg-black/20 p-8 flex flex-col overflow-hidden transition-colors">
            <h3 className="text-xs font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest mb-6">Kết quả</h3>
            <div className="flex-grow border border-slate-200 dark:border-white/5 rounded-2xl bg-white dark:bg-black/40 relative overflow-hidden flex items-center justify-center group shadow-inner">
              {result ? (
                <div className="w-full h-full relative group">
                  <img src={result} className="w-full h-full object-contain" alt="Result" />
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => onGenerated(result)}
                      className="p-3 bg-blue-600 text-white rounded-full shadow-xl hover:scale-110 active:scale-95 transition-all"
                    >
                      <Check size={20} strokeWidth={3} />
                    </button>
                    <a href={result} download="ai_avatar.png" className="p-3 bg-white text-black rounded-full shadow-xl hover:scale-110 active:scale-95 transition-all">
                      <Download size={20} />
                    </a>
                  </div>
                </div>
              ) : isGenerating ? (
                <div className="flex flex-col items-center gap-6">
                  <Loader2 size={64} className="text-blue-600 dark:text-blue-500 animate-spin" />
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600 dark:text-blue-500 animate-pulse">Đang kiến tạo thực thể...</p>
                </div>
              ) : (
                <div className="text-center space-y-4 opacity-20 transition-opacity">
                  <ImageIcon size={80} strokeWidth={1} className="mx-auto text-slate-900 dark:text-white" />
                  <div className="space-y-1">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Chưa có ảnh nào được tạo</p>
                    <p className="text-[10px] font-bold text-slate-900 dark:text-white">Nhập prompt và nhấn Tạo ảnh</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="h-16 border-t border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-black/40 px-6 flex items-center justify-end shrink-0 transition-colors">
          <button onClick={onClose} className="text-[10px] font-black uppercase text-slate-400 dark:text-gray-500 hover:text-slate-900 dark:hover:text-white transition-colors tracking-widest">Đóng</button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const AvatarLipsyncWorkspace: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { lang } = useLanguage();
  const { credits, useCredits, isAuthenticated, login } = useAuth();
  
  // -- Content State --
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_SAMPLES[0]);
  const [audioMode, setAudioMode] = useState<'UPLOAD' | 'LIBRARY' | 'RECORD' | 'TTS'>('UPLOAD');
  const [selectedModel, setSelectedModel] = useState('OmniHuman 1.5');
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultVideo, setResultVideo] = useState<string | null>(null);
  const [showLowCreditAlert, setShowLowCreditAlert] = useState(false);
  const [audioFile, setAudioFile] = useState<string | null>(null);
  const [ttsText, setTtsText] = useState('');
  const [showGenerator, setShowGenerator] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);

  const avatarUploadRef = useRef<HTMLInputElement>(null);
  const audioUploadRef = useRef<HTMLInputElement>(null);

  const COST_PER_GEN = 10;

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newAv = { id: `u-${Date.now()}`, url: reader.result as string, label: 'Avatar đã tải lên' };
        setSelectedAvatar(newAv);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file.name);
    }
  };

  const handleGenerate = async () => {
    if (isGenerating) return;
    if (!isAuthenticated) { login(); return; }
    
    // Check credits
    if (credits < COST_PER_GEN) {
      setShowLowCreditAlert(true);
      return;
    }

    setIsGenerating(true);
    try {
      const success = useCredits(COST_PER_GEN);
      if (!success) throw new Error("Insufficient credits");

      const directive = `Talking avatar lipsync. Avatar: ${selectedAvatar.label}. Model: ${selectedModel}. Input: ${audioMode === 'TTS' ? ttsText : audioFile || 'Default Audio'}. High quality synthesis.`;
      const url = await generateDemoVideo({ prompt: directive, isUltra: true });
      if (url) {
        setResultVideo(url);
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi trong quá trình tạo video. Vui lòng thử lại.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-full w-full flex flex-col bg-slate-50 dark:bg-[#08080a] text-slate-900 dark:text-white font-sans overflow-hidden transition-colors duration-500">
      
      {/* TOP HEADER */}
      <header className="h-16 border-b border-slate-200 dark:border-white/5 bg-white dark:bg-[#0d0d10] flex items-center justify-between px-8 shrink-0 z-[100] transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400">
            <User size={18} />
          </div>
          <h2 className="text-sm font-black uppercase tracking-widest italic text-slate-900 dark:text-white">Avatar Lipsync AI</h2>
        </div>

        <div className="flex items-center gap-6">
          <button className="flex items-center gap-3 px-5 py-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 transition-all group shadow-sm dark:shadow-none">
             <Sparkles size={14} className="text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform" />
             <span className="text-[11px] font-black uppercase tracking-widest text-slate-700 dark:text-white">Tạo video avatar nói với giọng của bạn</span>
          </button>
          <div className="h-6 w-px bg-slate-200 dark:bg-white/10"></div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
            <X size={24} />
          </button>
        </div>
      </header>

      <div className="flex-grow flex flex-col md:flex-row overflow-hidden p-4 md:p-8 gap-4 md:gap-8 no-scrollbar">
        
        {/* LEFT COLUMN: CHỌN AVATAR */}
        <div className="w-full md:w-[450px] flex flex-col gap-6 overflow-y-auto no-scrollbar shrink-0">
          <div className="bg-white dark:bg-[#0f0f13] rounded-2xl border border-slate-200 dark:border-white/5 p-6 lg:p-8 space-y-8 shadow-xl transition-colors">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <User size={18} className="text-purple-600 dark:text-purple-500" />
                <h3 className="text-lg font-black uppercase italic tracking-tight text-slate-900 dark:text-white">Chọn Avatar</h3>
              </div>
              <p className="text-[11px] text-slate-400 dark:text-gray-500 uppercase tracking-widest">Tải lên ảnh hoặc chọn từ mẫu có sẵn</p>
            </div>

            {/* Selected Preview Area */}
            <div className="flex flex-col items-center">
              <div className="relative group w-48 aspect-[3/4] bg-slate-100 dark:bg-black rounded-xl border-2 border-purple-500 shadow-2xl dark:shadow-[0_0_40px_rgba(168,85,247,0.2)] overflow-hidden transition-colors">
                <img src={selectedAvatar.url} className="w-full h-full object-cover" alt="Selected" />
                <button 
                  onClick={() => setSelectedAvatar(AVATAR_SAMPLES[0])}
                  className="absolute top-3 right-3 p-1.5 bg-black/60 rounded-full hover:bg-black/90 transition-colors"
                >
                  <X size={16} className="text-white" />
                </button>
                <div className="absolute bottom-0 inset-x-0 bg-white/60 dark:bg-black/60 py-2 text-center backdrop-blur-sm border-t border-slate-200 dark:border-white/10">
                  <span className="text-[10px] text-purple-700 dark:text-purple-400 font-black uppercase tracking-[0.2em]">Avatar đã chọn</span>
                </div>
              </div>
            </div>

            {/* Main Action Buttons */}
            <div className="grid grid-cols-3 gap-3">
              <button 
                onClick={() => avatarUploadRef.current?.click()}
                className="flex flex-col items-center justify-center gap-2 py-4 bg-purple-600 rounded-xl text-[11px] font-black uppercase tracking-widest text-white hover:brightness-110 active:scale-95 transition-all shadow-lg"
              >
                <Upload size={18} /> Upload
                <input type="file" ref={avatarUploadRef} className="hidden" accept="image/*" onChange={handleAvatarUpload} />
              </button>
              <button className="flex flex-col items-center justify-center gap-2 py-4 bg-slate-100 dark:bg-[#1e1e24] rounded-xl text-[11px] font-black uppercase tracking-widest text-slate-700 dark:text-white hover:bg-slate-200 dark:hover:bg-[#25252b] transition-all border border-slate-200 dark:border-white/5">
                <ImageIcon size={18} /> Album
              </button>
              <button 
                onClick={() => setShowGenerator(true)}
                className="flex flex-col items-center justify-center gap-2 py-4 bg-blue-600 rounded-xl text-[11px] font-black uppercase tracking-widest text-white hover:brightness-110 active:scale-[0.98] transition-all shadow-lg"
              >
                <Sparkles size={18} /> Tạo mới
              </button>
            </div>

            {/* Avatar Samples Section */}
            <div className="space-y-6 pt-6 border-t border-slate-100 dark:border-white/5">
               <div className="flex items-center justify-between">
                  <h4 className="text-[11px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-[0.3em]">AVATAR MẪU</h4>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setShowLibrary(true)}
                      className="text-[10px] font-black uppercase text-slate-400 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                      Xem toàn bộ
                    </button>
                    <button 
                      onClick={() => setShowGenerator(true)}
                      className="text-[10px] font-black uppercase text-purple-600 dark:text-purple-500 hover:text-purple-400 flex items-center gap-1.5 transition-colors"
                    >
                      <Plus size={12} strokeWidth={3} /> Tạo mới
                    </button>
                  </div>
               </div>

               <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-600 group-focus-within:text-purple-500 transition-colors" size={16} />
                  <input 
                    type="text" 
                    placeholder="Tìm kiếm mẫu avatar..." 
                    className="w-full bg-slate-50 dark:bg-black/60 border border-slate-200 dark:border-white/5 rounded-xl py-3.5 pl-12 pr-4 text-xs font-bold text-slate-800 dark:text-white focus:border-purple-500/50 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-gray-700 shadow-inner"
                  />
               </div>

               <div className="grid grid-cols-4 gap-3">
                  {AVATAR_SAMPLES.map(sample => (
                    <button 
                      key={sample.id}
                      onClick={() => setSelectedAvatar(sample)}
                      className={`relative aspect-[3/4] rounded-lg border-2 overflow-hidden transition-all group ${selectedAvatar.id === sample.id ? 'border-purple-500 ring-4 ring-purple-500/10 shadow-lg' : 'border-transparent opacity-40 hover:opacity-100'}`}
                    >
                      <img src={sample.url} className="w-full h-full object-cover" alt="" />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all" />
                      {selectedAvatar.id === sample.id && (
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-purple-500 rounded-full p-1.5 shadow-xl">
                           <Check size={14} strokeWidth={4} className="text-white" />
                        </div>
                      )}
                      <div className="absolute bottom-0 inset-x-0 bg-white/60 dark:bg-black/60 p-1 backdrop-blur-sm">
                        <p className="text-[7px] font-black text-slate-800 dark:text-white truncate text-center uppercase tracking-tighter">{sample.label}</p>
                      </div>
                    </button>
                  ))}
               </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: AUDIO INPUT & PROCESS */}
        <div className="flex-grow flex flex-col gap-6 overflow-y-auto no-scrollbar">
          <div className="bg-white dark:bg-[#0f0f13] rounded-2xl border border-slate-200 dark:border-white/5 p-6 lg:p-8 flex flex-col h-full shadow-xl transition-colors">
            <div className="space-y-1 mb-8">
              <div className="flex items-center gap-3">
                <Volume2 size={18} className="text-cyan-600 dark:text-cyan-400" />
                <h3 className="text-lg font-black uppercase italic tracking-tight text-slate-900 dark:text-white">Audio Input</h3>
              </div>
              <p className="text-[11px] text-slate-400 dark:text-gray-500 uppercase tracking-widest">Tải lên, ghi âm hoặc tạo TTS (tối đa 30s)</p>
            </div>

            {/* Mode Tabs */}
            <div className="grid grid-cols-4 gap-2 p-1.5 bg-slate-100 dark:bg-black/40 rounded-xl mb-8 shrink-0 border border-slate-200 dark:border-white/5 transition-colors">
              {[
                { id: 'UPLOAD', label: 'Upload', icon: <Upload size={14} /> },
                { id: 'LIBRARY', label: 'Thư viện', icon: <History size={14} /> },
                { id: 'RECORD', label: 'Ghi âm', icon: <Mic size={14} /> },
                { id: 'TTS', label: 'TTS', icon: <Cpu size={14} /> }
              ].map(mode => (
                <button
                  key={mode.id}
                  onClick={() => setAudioMode(mode.id as any)}
                  className={`flex items-center justify-center gap-2.5 py-3 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all ${audioMode === mode.id ? 'bg-cyan-600 dark:bg-cyan-500/20 text-white dark:text-cyan-400 border border-transparent dark:border-cyan-500/30 shadow-lg' : 'text-slate-500 hover:text-slate-900 dark:hover:text-gray-300'}`}
                >
                  {mode.icon} {mode.label}
                </button>
              ))}
            </div>

            {/* Input Content Area */}
            <div className="flex-grow flex flex-col items-center justify-center border-2 border-dashed border-slate-100 dark:border-white/5 rounded-2xl bg-slate-50 dark:bg-black/20 relative overflow-hidden group hover:border-cyan-500/20 transition-all shadow-inner">
               <AnimatePresence mode="wait">
                  {audioMode === 'UPLOAD' && (
                    <motion.div 
                      key="upload" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                      className="flex flex-col items-center gap-6 cursor-pointer p-12 text-center"
                      onClick={() => audioUploadRef.current?.click()}
                    >
                      <div className="w-20 h-20 rounded-full bg-white dark:bg-white/5 flex items-center justify-center text-slate-300 dark:text-gray-500 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 group-hover:bg-cyan-50 dark:group-hover:bg-cyan-400/10 transition-all shadow-sm">
                         <Volume2 size={40} />
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-base font-black uppercase tracking-tight italic text-slate-800 dark:text-white">Click để chọn file audio</h4>
                        <p className="text-[10px] text-slate-400 dark:text-gray-500 uppercase tracking-[0.2em]">{audioFile || 'MP3, WAV, M4A - File dài quá 30s sẽ được cắt'}</p>
                      </div>
                      <input type="file" ref={audioUploadRef} className="hidden" accept="audio/*" onChange={handleAudioUpload} />
                    </motion.div>
                  )}

                  {audioMode === 'LIBRARY' && (
                    <motion.div 
                      key="library" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                      className="flex flex-col items-center gap-6 text-center"
                    >
                      <History size={64} className="text-slate-200 dark:text-gray-700 opacity-50" strokeWidth={1} />
                      <div className="space-y-2">
                        <h4 className="text-base font-black uppercase tracking-tight italic text-slate-800 dark:text-white">Chọn audio từ thư viện</h4>
                        <p className="text-[10px] text-slate-400 dark:text-gray-600 uppercase tracking-widest">0 audio có sẵn trong phiên làm việc này</p>
                      </div>
                    </motion.div>
                  )}

                  {audioMode === 'RECORD' && (
                    <motion.div 
                      key="record" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                      className="flex flex-col items-center gap-8"
                    >
                      <button className="w-28 h-28 rounded-full bg-red-600 flex items-center justify-center text-white shadow-2xl dark:shadow-[0_0_50px_rgba(220,38,38,0.4)] hover:scale-110 active:scale-95 transition-all group border-4 border-white/20">
                         <Mic size={48} className="group-hover:scale-110 transition-transform" />
                      </button>
                      <div className="space-y-1 text-center">
                        <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 dark:text-gray-400">Nhấn để bắt đầu ghi âm</p>
                        <p className="text-[9px] font-bold text-red-500/60 uppercase tracking-widest animate-pulse">MIC_UPLINK_READY</p>
                      </div>
                    </motion.div>
                  )}

                  {audioMode === 'TTS' && (
                    <motion.div 
                      key="tts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="w-full h-full p-8 space-y-6 flex flex-col"
                    >
                      <div className="space-y-5">
                         <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest">CHỌN MODEL TTS</label>
                           <div className="relative">
                              <select className="w-full bg-white dark:bg-black/60 border border-slate-200 dark:border-white/5 rounded-xl p-4 text-xs font-bold outline-none appearance-none focus:border-cyan-500/40 text-slate-800 dark:text-gray-300 shadow-sm transition-colors">
                                <option>ElevenLabs V3 - High Quality</option>
                                <option>Skyverses Neural V1.2</option>
                              </select>
                              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-600" size={16} />
                           </div>
                         </div>

                         <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase text-slate-400 dark:text-gray-400 tracking-widest">CHỌN GIỌNG</label>
                           <div className="bg-white dark:bg-black/60 border border-slate-200 dark:border-white/5 rounded-xl p-4 flex justify-between items-center cursor-pointer hover:border-cyan-500/20 transition-all shadow-sm">
                              <div className="flex items-center gap-3">
                                <User size={16} className="text-cyan-600 dark:text-cyan-400" />
                                <span className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-gray-300">Chọn giọng mẫu...</span>
                              </div>
                              <ChevronDown size={16} className="text-slate-400 dark:text-gray-600" />
                           </div>
                         </div>

                         <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-600" size={16} />
                            <input 
                              type="text" 
                              value={ttsText}
                              onChange={(e) => setTtsText(e.target.value)}
                              placeholder="Tìm giọng hoặc nhập nội dung..." 
                              className="w-full bg-white dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-xl py-3.5 pl-12 pr-4 text-xs font-bold outline-none focus:border-cyan-500/20 text-slate-900 dark:text-white shadow-sm transition-colors" 
                            />
                         </div>

                         <button className="w-full py-4 bg-cyan-600 dark:bg-cyan-500/10 border border-transparent dark:border-cyan-500/30 text-white dark:text-cyan-400 rounded-xl text-[10px] font-black uppercase tracking-[0.4em] hover:brightness-110 dark:hover:bg-cyan-500/20 transition-all flex items-center justify-center gap-3 shadow-lg">
                            <Zap size={14} fill="currentColor" /> Tạo Âm Thanh TTS
                         </button>
                      </div>
                    </motion.div>
                  )}
               </AnimatePresence>
            </div>

            {/* Bottom Final Controls */}
            <div className="mt-8 space-y-6 pt-6 border-t border-slate-100 dark:border-white/5 transition-colors">
               <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest">CHỌN MODEL LIPSYNC</label>
                  <div className="relative">
                     <select 
                       value={selectedModel}
                       onChange={e => setSelectedModel(e.target.value)}
                       className="w-full bg-white dark:bg-black/60 border border-slate-200 dark:border-white/5 rounded-xl p-5 text-sm font-black uppercase italic tracking-widest outline-none appearance-none focus:border-purple-500/50 transition-all text-purple-700 dark:text-purple-400 shadow-sm"
                     >
                        <option>OmniHuman 1.5 - Industrial Grade</option>
                        <option>Fastwave V2 - Low Latency</option>
                        <option>Gemini Vision Pro</option>
                     </select>
                     <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500" size={20} />
                  </div>
                  <div className="flex items-center gap-2 px-1">
                     <p className="text-[10px] text-slate-500 dark:text-gray-600 font-black uppercase italic tracking-widest">Lipsync chuyên nghiệp cho doanh nghiệp</p>
                  </div>
               </div>

               <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between px-2">
                     <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-600">Chi phí dự kiến</span>
                     <div className="flex items-center gap-2">
                        <span className="text-xl font-black italic text-purple-600 dark:text-purple-500">{COST_PER_GEN}</span>
                        <span className="text-[9px] font-black uppercase text-slate-500 dark:text-gray-600">credits</span>
                     </div>
                  </div>
                  
                  <button 
                    onClick={handleGenerate}
                    disabled={isGenerating || (!audioFile && !ttsText.trim() && audioMode !== 'RECORD')}
                    className="w-full py-6 bg-purple-700 dark:bg-[#6d28d9] text-white rounded-2xl text-xs font-black uppercase tracking-[0.5em] shadow-xl dark:shadow-[0_15px_50px_rgba(109,40,217,0.4)] hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-4 disabled:opacity-30 disabled:grayscale group overflow-hidden relative"
                  >
                     <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                     {isGenerating ? <Loader2 className="animate-spin" size={22} /> : <MonitorPlay size={22} strokeWidth={2.5} />}
                     Tạo Video Lipsync
                  </button>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* RESULT MODAL */}
      <AnimatePresence>
        {resultVideo && (
           <motion.div 
             initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
             className="fixed inset-0 z-[600] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-6 lg:p-20"
           >
              <div className="max-w-5xl w-full bg-white dark:bg-[#141417] rounded-[2rem] border border-slate-200 dark:border-white/10 overflow-hidden relative shadow-3xl dark:shadow-[0_0_150px_rgba(168,85,247,0.3)] transition-colors duration-500">
                 <button 
                   onClick={() => setResultVideo(null)} 
                   className="absolute top-6 right-6 p-3 bg-black/60 rounded-full hover:bg-red-500 hover:text-white transition-all z-50 border border-white/10 text-white"
                 >
                    <X size={28}/>
                 </button>
                 
                 <div className="aspect-video bg-black flex items-center justify-center relative">
                    <video src={resultVideo} autoPlay controls className="w-full h-full object-contain" />
                    
                    {/* HUD Overlay */}
                    <div className="absolute top-8 left-8 flex items-center gap-6 text-white/20 pointer-events-none uppercase mono">
                      <div className="flex flex-col">
                        <span className="text-[7px] font-black tracking-widest">ENCODING: HEVC_PRO</span>
                        <span className="text-[7px] font-black tracking-widest">RES: 1080P_HD</span>
                      </div>
                      <div className="h-6 w-px bg-white/10"></div>
                      <div className="text-[7px] font-black tracking-widest">VIRTUAL_PRESENTER_v4</div>
                    </div>
                 </div>

                 <div className="p-8 lg:p-10 flex flex-col md:flex-row justify-between items-center bg-slate-50 dark:bg-[#0d0d0f] border-t border-slate-100 dark:border-white/5 gap-8 transition-colors">
                    <div className="space-y-2 text-center md:text-left">
                       <h3 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 dark:text-white">RENDER_MANIFEST_01</h3>
                       <div className="flex flex-wrap justify-center md:justify-start gap-4">
                          <span className="text-[10px] text-purple-600 dark:text-purple-500 font-black uppercase tracking-widest border border-purple-200 dark:border-purple-500/20 px-2 py-0.5 rounded-sm">Model: {selectedModel}</span>
                          <span className="text-[10px] text-slate-500 dark:text-gray-500 font-black uppercase tracking-widest border border-slate-200 dark:border-white/10 px-2 py-0.5 rounded-sm">Latency: 0.42s</span>
                       </div>
                    </div>
                    <div className="flex gap-4">
                       <button className="px-12 py-5 bg-black dark:bg-white text-white dark:text-black rounded-xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-purple-600 dark:hover:bg-purple-500 hover:text-white transition-all shadow-xl active:scale-95">
                          Tải Video .MP4
                       </button>
                       <button className="p-5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-400 dark:text-gray-500 hover:text-slate-900 dark:hover:text-white hover:border-slate-400 dark:hover:border-white/30 transition-all">
                          <Share2 size={20} />
                       </button>
                    </div>
                 </div>
              </div>
           </motion.div>
        )}
      </AnimatePresence>

      {/* AI GENERATOR MODAL */}
      <AnimatePresence>
        {showGenerator && (
          <AvatarGeneratorModal 
            onClose={() => setShowGenerator(false)} 
            onGenerated={(url) => {
              const newAv = { id: `ai-${Date.now()}`, url, label: 'AI Generated' };
              setSelectedAvatar(newAv);
              setShowGenerator(false);
            }} 
          />
        )}
      </AnimatePresence>

      {/* AVATAR LIBRARY MODAL */}
      <AnimatePresence>
        {showLibrary && (
          <AvatarLibraryModal 
            onClose={() => setShowLibrary(false)} 
            selectedId={selectedAvatar.id}
            onSelect={(av) => {
              setSelectedAvatar(av);
              setShowLibrary(false);
            }} 
          />
        )}
      </AnimatePresence>

      {/* LOW CREDIT DIALOG */}
      <AnimatePresence>
        {showLowCreditAlert && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
             <motion.div 
               initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
               className="max-w-md w-full bg-white dark:bg-[#111114] p-12 border border-slate-200 dark:border-white/10 rounded-[2rem] text-center space-y-8 shadow-3xl transition-colors"
             >
                <div className="w-24 h-24 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center mx-auto text-amber-500 shadow-xl dark:shadow-[0_0_40px_rgba(245,158,11,0.2)]">
                   <AlertTriangle size={48} />
                </div>
                <div className="space-y-4">
                   <h3 className="text-3xl font-black uppercase tracking-tighter italic text-slate-900 dark:text-white">Quota Depleted</h3>
                   <p className="text-sm text-slate-500 dark:text-gray-400 font-bold leading-relaxed uppercase tracking-tight">
                     Avatar Lipsync requires **{COST_PER_GEN} credits** per synthesis. <br />
                     Your current node balance is too low.
                   </p>
                </div>
                <div className="flex flex-col gap-4">
                   <Link to="/credits" className="bg-purple-600 text-white py-5 rounded-2xl text-[12px] font-black uppercase tracking-[0.4em] shadow-2xl hover:bg-purple-700 transition-colors text-center">Nạp thêm Credits</Link>
                   <button onClick={() => setShowLowCreditAlert(false)} className="text-[10px] font-black uppercase text-slate-400 dark:text-gray-500 hover:text-slate-900 dark:hover:text-white transition-colors tracking-widest underline underline-offset-8">Để sau</button>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AvatarLipsyncWorkspace;
