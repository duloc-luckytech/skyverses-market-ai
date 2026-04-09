
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Zap, Download, Loader2,
  ImageIcon, Plus,
  Sparkles, Sliders,
  Palette, Type,
  Maximize2, History as HistoryIcon,
  Trash2, ChevronDown,
  Coins, AlertTriangle, Share2, Monitor, Layout
} from 'lucide-react';
import { generateDemoImage, generateDemoText } from '../services/gemini';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Link } from 'react-router-dom';

const STORAGE_KEY = 'skyverses_social_banner_vault';

// ── Platform & Format definitions ────────────────────────────────────────────
const XIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);
const FBIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);
const IGIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
  </svg>
);
const LIIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const ALL_PLATFORMS = [
  {
    id: 'x', label: 'X (Twitter)', icon: <XIcon />, color: 'dark:border-white/20',
    formats: [
      { id: 'x_cover', label: 'Cover', size: '1500×500', ratio: '3/1' },
      { id: 'x_post', label: 'Post', size: '1200×675', ratio: '16/9' },
      { id: 'x_square', label: 'Square', size: '1080×1080', ratio: '1/1' },
    ]
  },
  {
    id: 'fb', label: 'Facebook', icon: <FBIcon />, color: 'border-blue-500/30',
    formats: [
      { id: 'fb_cover', label: 'Cover', size: '851×315', ratio: '851/315' },
      { id: 'fb_post', label: 'Post', size: '1200×630', ratio: '190/100' },
      { id: 'fb_story', label: 'Story', size: '1080×1920', ratio: '9/16' },
      { id: 'fb_event', label: 'Event', size: '1920×1080', ratio: '16/9' },
    ]
  },
  {
    id: 'ig', label: 'Instagram', icon: <IGIcon />, color: 'border-pink-500/30',
    formats: [
      { id: 'ig_square', label: 'Square', size: '1080×1080', ratio: '1/1' },
      { id: 'ig_portrait', label: 'Portrait', size: '1080×1350', ratio: '4/5' },
      { id: 'ig_story', label: 'Story', size: '1080×1920', ratio: '9/16' },
    ]
  },
  {
    id: 'li', label: 'LinkedIn', icon: <LIIcon />, color: 'border-blue-700/30',
    formats: [
      { id: 'li_cover', label: 'Profile Cover', size: '1584×396', ratio: '4/1' },
      { id: 'li_post', label: 'Post', size: '1200×627', ratio: '1200/627' },
      { id: 'li_company', label: 'Company', size: '1128×191', ratio: '1128/191' },
    ]
  },
];

const STYLES = ['Hiện đại', 'Cổ điển', 'Tối giản', 'Cyberpunk', 'Luxury', 'Nghệ thuật'];
const MODELS = ['Nano Banana Pro', 'Nano Banana Lite', 'Gemini 3 Pro Image'];
const MODES = ['Chuyên nghiệp', 'Nhanh', 'Cân bằng'];
const RESOLUTIONS = ['1k', '2k', '4k'];

interface BannerSession {
  id: string;
  url: string;
  prompt: string;
  platform: string;
  format: string;
  size: string;
  timestamp: string;
}

const SocialBannerWorkspace: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { lang } = useLanguage();
  const { theme } = useTheme();
  const { credits, useCredits, isAuthenticated, login } = useAuth();

  // UI State
  const [activePlatformId, setActivePlatformId] = useState(ALL_PLATFORMS[0].id);
  const [activeFormatId, setActiveFormatId] = useState(ALL_PLATFORMS[0].formats[0].id);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [status, setStatus] = useState('Sẵn sàng');
  const [showLowCreditAlert, setShowLowCreditAlert] = useState(false);
  const [viewMode, setViewMode] = useState<'current' | 'library'>('current');

  // Content State
  const [prompt, setPrompt] = useState('');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [references, setReferences] = useState<string[]>([]);
  const [result, setResult] = useState<string | null>(null);

  // Advanced Settings State
  const [brandName, setBrandName] = useState('');
  const [brandColors, setBrandColors] = useState(['#0090FF', '#7C3AED']);
  const [hexInput, setHexInput] = useState('#0090FF');
  const [useBrandColor, setUseBrandColor] = useState(true);
  const [addTextToBanner, setAddTextToBanner] = useState(false);

  // AI Config State
  const [selectedModel, setSelectedModel] = useState(MODELS[0]);
  const [selectedStyle, setSelectedStyle] = useState(STYLES[0]);
  const [selectedMode, setSelectedMode] = useState(MODES[0]);
  const [selectedRes, setSelectedRes] = useState(RESOLUTIONS[1]);
  const [quantity, setQuantity] = useState(1);

  // History State
  const [sessions, setSessions] = useState<BannerSession[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const colorPickerRef = useRef<HTMLInputElement>(null);
  const [editingColorIndex, setEditingColorIndex] = useState<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { setSessions(JSON.parse(saved)); } catch { }
    }
  }, []);

  const activePlatform = ALL_PLATFORMS.find(p => p.id === activePlatformId)!;
  const activeFormat = activePlatform.formats.find(f => f.id === activeFormatId) || activePlatform.formats[0];

  // Switch platform → auto select first format
  const handlePlatformChange = (platformId: string) => {
    setActivePlatformId(platformId);
    const platform = ALL_PLATFORMS.find(p => p.id === platformId)!;
    setActiveFormatId(platform.formats[0].id);
  };

  const handleEnhance = async () => {
    if (!prompt.trim() || isEnhancing) return;
    setIsEnhancing(true);
    setStatus('Đang tối ưu prompt...');
    try {
      const systemInstruction = `Bạn là chuyên gia social media marketing. Viết lại mô tả sau thành prompt AI chi tiết để tạo banner cho ${activePlatform.label} (${activeFormat.label} ${activeFormat.size}px). Thêm chi tiết về ánh sáng, màu sắc, bố cục phù hợp chuẩn ${activePlatform.label}. Trả về Tiếng Việt ngắn gọn.`;
      const enhanced = await generateDemoText(`${systemInstruction}\n\nNội dung gốc: "${prompt}"`);
      if (enhanced && !enhanced.includes('CONNECTION_TERMINATED')) {
        setPrompt(enhanced);
        setStatus('Đã tối ưu prompt');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const filesToProcess = Array.from(files as FileList).slice(0, 6 - references.length);
      filesToProcess.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => setReferences(prev => [...prev, reader.result as string]);
        reader.readAsDataURL(file);
      });
    }
  };

  const handleColorBlockClick = (index: number) => {
    setEditingColorIndex(index);
    if (colorPickerRef.current) {
      colorPickerRef.current.value = brandColors[index];
      colorPickerRef.current.click();
    }
  };

  const onColorPickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    if (editingColorIndex !== null) {
      const newColors = [...brandColors];
      newColors[editingColorIndex] = newColor;
      setBrandColors(newColors);
    }
  };

  const CREDIT_COST = 120;

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;
    if (!isAuthenticated) { login(); return; }
    const totalCost = CREDIT_COST * quantity;
    if (credits < totalCost) { setShowLowCreditAlert(true); return; }

    setIsGenerating(true);
    setViewMode('current');
    setStatus('Đang kết nối H100 Node...');

    try {
      const successful = useCredits(totalCost);
      if (!successful) throw new Error('Insufficient credits');

      const brandCtx = brandName ? `Thương hiệu: ${brandName}.` : '';
      const colorCtx = useBrandColor ? `Màu thương hiệu: ${brandColors.join(', ')}.` : '';
      const textCtx = addTextToBanner ? `Tiêu đề: "${title}"${subtitle ? `. Phụ đề: "${subtitle}"` : ''}.` : 'Không có chữ trên banner.';

      const fullPrompt = `Tạo banner social media chuyên nghiệp cho ${activePlatform.label}. 
Format: ${activeFormat.label} (${activeFormat.size}px, tỷ lệ ${activeFormat.ratio}). 
Phong cách: ${selectedStyle}. Chế độ: ${selectedMode}. 
${brandCtx} ${colorCtx} ${textCtx}
Mô tả: ${prompt}
Yêu cầu: Chất lượng ${selectedRes}, bố cục tối ưu cho ${activePlatform.label}, chuẩn ${activeFormat.label} ${activePlatform.label}.`;

      const imageUrl = await generateDemoImage(fullPrompt, references);

      if (imageUrl) {
        setResult(imageUrl);
        const newSession: BannerSession = {
          id: Date.now().toString(),
          url: imageUrl,
          prompt,
          platform: activePlatform.label,
          format: `${activeFormat.label} ${activeFormat.size}`,
          size: activeFormat.size,
          timestamp: new Date().toLocaleString()
        };
        const updated = [newSession, ...sessions];
        setSessions(updated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        setStatus('Hoàn tất');
      } else {
        setStatus('Lỗi tạo ảnh');
      }
    } catch (err) {
      console.error(err);
      setStatus('Lỗi hệ thống');
    } finally {
      setIsGenerating(false);
    }
  };

  const deleteSession = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = sessions.filter(s => s.id !== id);
    setSessions(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    if (result && sessions.find(s => s.id === id)?.url === result) setResult(null);
  };

  return (
    <div className="h-full w-full flex flex-col bg-[#f4f7f9] dark:bg-[#050505] text-slate-900 dark:text-white font-sans overflow-hidden relative transition-colors duration-500">

      {/* ── LOW CREDIT MODAL ── */}
      <AnimatePresence>
        {showLowCreditAlert && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 p-10 rounded-2xl max-w-sm w-full mx-6 text-center space-y-6 shadow-2xl">
              <AlertTriangle size={40} className="text-orange-400 mx-auto" />
              <div>
                <h3 className="text-xl font-black mb-2">Không đủ Credits</h3>
                <p className="text-sm text-slate-500 dark:text-gray-400">Bạn cần ít nhất <strong>{CREDIT_COST * quantity} CR</strong> để tạo banner. Hiện có <strong>{credits} CR</strong>.</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowLowCreditAlert(false)} className="flex-1 py-3 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-white/5 transition-all">Đóng</button>
                <Link to="/pricing" onClick={onClose} className="flex-1 py-3 bg-brand-blue text-white rounded-xl text-sm font-bold hover:brightness-110 transition-all text-center">Nạp Credits</Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 1. TOP NAV ── */}
      <div className="h-14 bg-white dark:bg-[#0a0a0a] border-b border-slate-200 dark:border-white/5 flex items-center justify-between px-6 shrink-0 z-[100] transition-colors">
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 p-1 rounded-full border border-slate-200 dark:border-white/10 transition-colors">
          <button
            onClick={() => setViewMode('current')}
            className={`px-5 py-1.5 text-[11px] font-bold rounded-full transition-all ${viewMode === 'current' ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
          >
            Phiên hiện tại
          </button>
          <button
            onClick={() => setViewMode('library')}
            className={`px-5 py-1.5 text-[11px] font-bold rounded-full transition-all ${viewMode === 'library' ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
          >
            Thư viện ({sessions.length})
          </button>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-brand-blue/10 border border-brand-blue/20 rounded-full">
            <Coins size={12} className="text-brand-blue" />
            <span className="text-[10px] font-black text-brand-blue">{credits.toLocaleString()} CR</span>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="flex-grow flex overflow-hidden">

        {/* ── 2. SIDEBAR TRÁI ── */}
        <aside className="w-[380px] border-r border-slate-200 dark:border-white/5 bg-white dark:bg-[#0a0a0a] flex flex-col shrink-0 overflow-y-auto no-scrollbar pb-10 transition-colors duration-500">
          <div className="p-5 space-y-8">

            {/* PLATFORM PICKER */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-400">
                <Share2 size={14} className="text-brand-blue" /> PLATFORM
              </div>
              <div className="grid grid-cols-4 gap-2">
                {ALL_PLATFORMS.map(p => (
                  <button
                    key={p.id}
                    onClick={() => handlePlatformChange(p.id)}
                    className={`flex flex-col items-center justify-center gap-2 py-3 border rounded-xl transition-all text-[9px] font-bold ${
                      activePlatformId === p.id
                        ? 'border-brand-blue bg-brand-blue/10 text-brand-blue'
                        : 'border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 text-slate-400 dark:text-gray-500 hover:border-slate-300 dark:hover:border-white/10'
                    }`}
                  >
                    {p.icon}
                    <span className="truncate w-full text-center px-1">{p.id === 'x' ? 'X' : p.id === 'fb' ? 'Facebook' : p.id === 'ig' ? 'Instagram' : 'LinkedIn'}</span>
                  </button>
                ))}
              </div>

              {/* FORMAT PICKER */}
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest">ĐỊNH DẠNG</label>
                <div className="flex flex-wrap gap-2">
                  {activePlatform.formats.map(f => (
                    <button
                      key={f.id}
                      onClick={() => setActiveFormatId(f.id)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                        activeFormatId === f.id
                          ? 'border-brand-blue bg-brand-blue/10 text-brand-blue'
                          : 'border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-gray-400 hover:border-slate-300 dark:hover:border-white/10'
                      }`}
                    >
                      {f.label}
                      <span className="ml-1 text-[8px] opacity-60">{f.size}</span>
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* MÔ TẢ */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-400">
                  <Type size={14} /> MÔ TẢ BANNER
                </div>
                <button
                  onClick={handleEnhance}
                  disabled={isEnhancing || !prompt.trim()}
                  className="flex items-center gap-1.5 text-[9px] font-black text-orange-500 dark:text-orange-400 uppercase tracking-widest hover:brightness-125 transition-all disabled:opacity-30"
                >
                  {isEnhancing ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                  AI Boost
                </button>
              </div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full h-24 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 p-4 text-xs font-bold focus:border-brand-blue outline-none transition-all resize-none rounded-md text-slate-800 dark:text-white"
                placeholder={`Mô tả banner ${activePlatform.label} ${activeFormat.label}...`}
              />
            </section>

            {/* TIÊU ĐỀ */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-400">
                <Type size={14} /> TIÊU ĐỀ (TÙY CHỌN)
              </div>
              <div className="space-y-2">
                <input
                  value={title} onChange={e => setTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 p-3 text-xs font-bold focus:border-brand-blue outline-none rounded-md text-slate-800 dark:text-white"
                  placeholder="Headline..."
                />
                <input
                  value={subtitle} onChange={e => setSubtitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 p-3 text-xs font-bold focus:border-brand-blue outline-none rounded-md text-slate-800 dark:text-white"
                  placeholder="Subheadline..."
                />
              </div>
            </section>

            {/* ẢNH THAM CHIẾU */}
            <section className="space-y-4">
              <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400 dark:text-gray-400 tracking-widest">
                <div className="flex items-center gap-2"><ImageIcon size={14} /> ẢNH THAM CHIẾU</div>
                <span className="text-slate-300 dark:text-gray-600">{references.length}/6</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {references.map((ref, idx) => (
                  <div key={idx} className="relative aspect-square bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-md overflow-hidden group">
                    <img src={ref} className="w-full h-full object-cover" alt="" />
                    <button onClick={() => setReferences(prev => prev.filter((_, i) => i !== idx))} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <X size={10} />
                    </button>
                  </div>
                ))}
                {references.length < 6 && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square border-2 border-dashed border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 rounded-md flex flex-col items-center justify-center gap-2 hover:border-brand-blue group transition-all"
                  >
                    <Plus size={18} className="text-slate-300 dark:text-gray-400 group-hover:text-brand-blue" />
                    <span className="text-[8px] font-black text-slate-400 dark:text-gray-500 uppercase">Thêm ảnh</span>
                  </button>
                )}
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={handleFileUpload} />
            </section>

            {/* AI CONFIG GRID */}
            <section className="grid grid-cols-2 gap-x-4 gap-y-5 pt-4 border-t border-slate-100 dark:border-white/5">
              <div className="space-y-2">
                <label className="text-[8px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest">MODEL AI</label>
                <select value={selectedModel} onChange={e => setSelectedModel(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 p-2.5 text-[10px] font-bold rounded-md focus:border-brand-blue outline-none text-slate-800 dark:text-white">
                  {MODELS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[8px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest">PHONG CÁCH</label>
                <select value={selectedStyle} onChange={e => setSelectedStyle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 p-2.5 text-[10px] font-bold rounded-md focus:border-brand-blue outline-none text-slate-800 dark:text-white">
                  {STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[8px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest">CHẾ ĐỘ</label>
                <select value={selectedMode} onChange={e => setSelectedMode(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 p-2.5 text-[10px] font-bold rounded-md focus:border-brand-blue outline-none text-slate-800 dark:text-white">
                  {MODES.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[8px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest">ĐỘ PHÂN GIẢI</label>
                <div className="flex gap-1">
                  {RESOLUTIONS.map(r => (
                    <button key={r} onClick={() => setSelectedRes(r)}
                      className={`flex-1 py-2 text-[9px] font-black uppercase rounded-md border transition-all ${selectedRes === r ? 'border-brand-blue bg-brand-blue/10 text-brand-blue' : 'border-slate-100 dark:border-white/5 text-slate-400 dark:text-gray-500 hover:border-slate-300'}`}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="col-span-2 space-y-2">
                <label className="text-[8px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest">SỐ LƯỢNG · {CREDIT_COST * quantity} CR</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map(n => (
                    <button key={n} onClick={() => setQuantity(n)}
                      className={`flex-1 py-2 text-[10px] font-black rounded-md border transition-all ${quantity === n ? 'border-brand-blue bg-brand-blue/10 text-brand-blue' : 'border-slate-100 dark:border-white/5 text-slate-400 dark:text-gray-500 hover:border-slate-300'}`}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* ADVANCED */}
            <section className="space-y-4 border-t border-slate-100 dark:border-white/5 pt-4">
              <button onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center justify-between w-full text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                <div className="flex items-center gap-2"><Sliders size={14} /> NÂNG CAO</div>
                <ChevronDown size={14} className={`transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {showAdvanced && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden space-y-5">
                    {/* Brand name */}
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest">TÊN THƯƠNG HIỆU</label>
                      <input value={brandName} onChange={e => setBrandName(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 p-3 text-xs font-bold focus:border-brand-blue outline-none rounded-md text-slate-800 dark:text-white"
                        placeholder="VD: Skyverses" />
                    </div>

                    {/* Brand colors */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[9px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest">
                          <Palette size={12} /> MÀU THƯƠNG HIỆU
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <div onClick={() => setUseBrandColor(!useBrandColor)} className={`w-8 h-4 rounded-full transition-all relative ${useBrandColor ? 'bg-brand-blue' : 'bg-slate-200 dark:bg-white/10'}`}>
                            <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${useBrandColor ? 'left-4' : 'left-0.5'}`} />
                          </div>
                        </label>
                      </div>
                      {useBrandColor && (
                        <div className="space-y-3">
                          <div className="flex flex-wrap gap-2">
                            {brandColors.map((c, i) => (
                              <div key={i} className="relative group">
                                <button onClick={() => handleColorBlockClick(i)} className="w-8 h-8 rounded-md border-2 border-white dark:border-black shadow-md hover:scale-110 transition-transform" style={{ backgroundColor: c }} />
                                <button onClick={() => setBrandColors(brandColors.filter((_, idx) => idx !== i))} className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <X size={8} />
                                </button>
                              </div>
                            ))}
                            {brandColors.length < 10 && (
                              <button onClick={() => setBrandColors([...brandColors, hexInput])} className="w-8 h-8 rounded-md border border-dashed border-slate-200 dark:border-white/10 flex items-center justify-center hover:border-brand-blue transition-colors">
                                <Plus size={12} className="text-slate-400" />
                              </button>
                            )}
                          </div>
                          <div className="flex gap-2 items-center">
                            <input type="text" value={hexInput} onChange={e => setHexInput(e.target.value)}
                              className="flex-1 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 px-3 py-2 text-[10px] font-mono rounded-md focus:border-brand-blue outline-none text-slate-800 dark:text-white"
                              placeholder="#HEX" />
                            <div className="w-8 h-8 rounded-md border border-white/10 shadow" style={{ backgroundColor: hexInput }} />
                          </div>
                          <input type="color" ref={colorPickerRef} className="hidden" onChange={onColorPickerChange} />
                        </div>
                      )}
                    </div>

                    {/* Text overlay toggle */}
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest">THÊM CHỮ VÀO BANNER</span>
                      <div onClick={() => setAddTextToBanner(!addTextToBanner)} className={`w-8 h-4 rounded-full transition-all relative cursor-pointer ${addTextToBanner ? 'bg-brand-blue' : 'bg-slate-200 dark:bg-white/10'}`}>
                        <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${addTextToBanner ? 'left-4' : 'left-0.5'}`} />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

          </div>
        </aside>

        {/* ── 3. VIEWPORT PHẢI ── */}
        <main className="flex-grow flex flex-col overflow-hidden">

          {/* GENERATE BUTTON */}
          <div className="px-6 py-4 bg-white dark:bg-[#0a0a0a] border-b border-slate-200 dark:border-white/5 flex items-center gap-4 shrink-0 transition-colors">
            <div className="text-[9px] font-black uppercase text-slate-300 dark:text-gray-600 tracking-widest flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isGenerating ? 'bg-orange-400 animate-pulse' : 'bg-emerald-500'}`} />
              {status}
            </div>
            <div className="ml-auto flex items-center gap-2 text-[9px] text-slate-400 dark:text-gray-600 font-bold uppercase tracking-widest">
              <Monitor size={12} /> {activePlatform.label} · {activeFormat.label} · {activeFormat.size}
            </div>
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="flex items-center gap-3 px-8 py-3 bg-brand-blue text-white text-[11px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-brand-blue/20 hover:brightness-110 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
              {isGenerating ? 'Đang tạo...' : `Tạo Banner · ${CREDIT_COST * quantity} CR`}
            </button>
          </div>

          {/* VIEWPORT CONTENT */}
          <div className="flex-grow overflow-y-auto p-6">
            {viewMode === 'current' ? (
              // CURRENT VIEW
              <div className="h-full flex items-center justify-center">
                {isGenerating ? (
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 border-2 border-brand-blue border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-sm font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest">{status}</p>
                    <p className="text-[10px] text-slate-300 dark:text-gray-600">{activePlatform.label} · {activeFormat.label} · {activeFormat.size}</p>
                  </div>
                ) : result ? (
                  <div className="space-y-4 max-w-3xl w-full">
                    <div
                      className="w-full bg-slate-100 dark:bg-black rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-xl relative group"
                      style={{ aspectRatio: activeFormat.ratio }}
                    >
                      <img src={result} className="w-full h-full object-cover" alt="Banner" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100">
                        <a href={result} download="banner.png" className="p-3 bg-white/90 text-slate-900 rounded-full shadow-lg hover:scale-110 transition-transform">
                          <Download size={18} />
                        </a>
                        <button onClick={() => window.open(result!, '_blank')} className="p-3 bg-white/90 text-slate-900 rounded-full shadow-lg hover:scale-110 transition-transform">
                          <Maximize2 size={18} />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[9px] text-slate-400 dark:text-gray-600 font-bold uppercase tracking-widest">
                      <span>{activePlatform.label} · {activeFormat.label} · {activeFormat.size}</span>
                      <span>{selectedRes} · {selectedStyle}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-4 max-w-xs">
                    <div
                      className="mx-auto bg-slate-100 dark:bg-white/[0.03] border-2 border-dashed border-slate-200 dark:border-white/5 rounded-xl flex items-center justify-center"
                      style={{ aspectRatio: activeFormat.ratio, maxWidth: '280px', width: '100%' }}
                    >
                      <Layout size={32} className="text-slate-300 dark:text-gray-700" />
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 dark:text-gray-600 uppercase tracking-widest">{activePlatform.label} {activeFormat.label} · {activeFormat.size}</p>
                    <p className="text-[9px] text-slate-300 dark:text-gray-700">Nhập mô tả và bấm Tạo Banner để bắt đầu</p>
                  </div>
                )}
              </div>
            ) : (
              // LIBRARY VIEW
              <div className="space-y-4">
                {sessions.length === 0 ? (
                  <div className="h-64 flex items-center justify-center text-slate-300 dark:text-gray-700">
                    <div className="text-center space-y-3">
                      <HistoryIcon size={32} className="mx-auto" />
                      <p className="text-sm font-bold uppercase tracking-widest">Chưa có banner nào</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {sessions.map(s => (
                      <div key={s.id} onClick={() => { setResult(s.url); setViewMode('current'); }}
                        className="group relative bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] rounded-xl overflow-hidden cursor-pointer hover:border-brand-blue/30 transition-all shadow-sm">
                        <div className="aspect-video w-full overflow-hidden">
                          <img src={s.url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Banner" />
                        </div>
                        <div className="p-3 space-y-1">
                          <p className="text-[9px] font-black text-brand-blue uppercase tracking-widest">{s.platform} · {s.format}</p>
                          <p className="text-[10px] font-medium text-slate-600 dark:text-gray-400 line-clamp-2">{s.prompt}</p>
                          <p className="text-[8px] text-slate-400 dark:text-gray-600">{s.timestamp}</p>
                        </div>
                        <button onClick={(e) => deleteSession(e, s.id)}
                          className="absolute top-2 right-2 p-1.5 bg-red-500/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600">
                          <Trash2 size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default SocialBannerWorkspace;
