import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Download, Share2, Loader2, Sparkles, Sliders, Plus, Wand2,
  ChevronRight, Trash2, LayoutGrid, Maximize2, Smartphone, ShieldCheck,
  CheckCircle2, ChevronDown, Type, ImageIcon,
  Coins, AlertTriangle,
} from 'lucide-react';
import { generateDemoImage, generateDemoText } from '../services/gemini';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Link } from 'react-router-dom';

const STORAGE_KEY = 'skyverses_SOCIAL-BANNER-AI_vault';
const CREDIT_COST = 120;

// ─── Platform / Format config ──────────────────────────────
const PLATFORMS = [
  { id: 'x',        label: 'X / Twitter', icon: '𝕏', color: '#1DA1F2' },
  { id: 'facebook', label: 'Facebook',    icon: 'f',  color: '#1877F2' },
  { id: 'instagram',label: 'Instagram',   icon: '◈',  color: '#E1306C' },
  { id: 'linkedin', label: 'LinkedIn',    icon: 'in', color: '#0A66C2' },
  { id: 'tiktok',   label: 'TikTok',      icon: '♪',  color: '#010101' },
];

const FORMATS_BY_PLATFORM: Record<string, { id: string; label: string; size: string; ratio: string }[]> = {
  x:         [
    { id: 'x-cover',  label: 'Cover',   size: '1500 × 500',  ratio: '16:9' },
    { id: 'x-post',   label: 'Post',    size: '1200 × 675',  ratio: '16:9' },
  ],
  facebook:  [
    { id: 'fb-cover', label: 'Cover',   size: '820 × 312',   ratio: '21:8' },
    { id: 'fb-post',  label: 'Post',    size: '1200 × 630',  ratio: '4:3' },
    { id: 'fb-story', label: 'Story',   size: '1080 × 1920', ratio: '9:16' },
  ],
  instagram: [
    { id: 'ig-post',  label: 'Post',    size: '1080 × 1080', ratio: '1:1' },
    { id: 'ig-story', label: 'Story',   size: '1080 × 1920', ratio: '9:16' },
    { id: 'ig-reel',  label: 'Reel',    size: '1080 × 1920', ratio: '9:16' },
    { id: 'ig-land',  label: 'Landscape', size: '1080 × 608', ratio: '16:9' },
  ],
  linkedin:  [
    { id: 'li-banner', label: 'Banner',  size: '1584 × 396',  ratio: '4:1' },
    { id: 'li-post',   label: 'Post',    size: '1200 × 627',  ratio: '16:9' },
  ],
  tiktok:    [
    { id: 'tt-video', label: 'Cover',   size: '1080 × 1920', ratio: '9:16' },
    { id: 'tt-post',  label: 'Post',    size: '1080 × 1080', ratio: '1:1' },
  ],
};

const STYLES = ['Hiện đại', 'Tối giản', 'Luxury', 'Cyberpunk', 'Cổ điển', 'Nghệ thuật'];
const MODELS = ['Nano Banana Pro', 'Nano Banana Lite', 'Gemini 3 Pro Image'];
const MODES  = ['Chuyên nghiệp', 'Nhanh', 'Cân bằng'];
const RESOLUTIONS = ['1k', '2k', '4k'];

interface BannerSession {
  id: string;
  url: string;
  prompt: string;
  config: { platform: string; format: string; style: string };
  timestamp: string;
}

// ─── Component ─────────────────────────────────────────────
const SocialBannerWorkspace: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { lang } = useLanguage();
  const { theme } = useTheme();
  const { credits, useCredits, isAuthenticated, login } = useAuth();

  // UI State
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnhancing, setIsEnhancing]   = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [status, setStatus]             = useState('Sẵn sàng');
  const [showLowCreditAlert, setShowLowCreditAlert] = useState(false);
  const [viewMode, setViewMode]         = useState<'current' | 'library'>('current');

  // Platform / Format State
  const [activePlatform, setActivePlatform] = useState(PLATFORMS[0].id);
  const [activeFormat, setActiveFormat]     = useState(FORMATS_BY_PLATFORM[PLATFORMS[0].id][0].id);

  // Content State
  const [prompt, setPrompt]     = useState('');
  const [headline, setHeadline] = useState('');
  const [tagline, setTagline]   = useState('');
  const [references, setReferences] = useState<string[]>([]);
  const [result, setResult]     = useState<string | null>(null);

  // Advanced State
  const [brandName, setBrandName]   = useState('');
  const [brandColors, setBrandColors] = useState(['#0090FF', '#7C3AED']);
  const [hexInput, setHexInput]     = useState('#2196F3');
  const [useBrandColor, setUseBrandColor] = useState(true);
  const [addTextToBanner, setAddTextToBanner] = useState(true);
  const [editingColorIndex, setEditingColorIndex] = useState<number | null>(null);

  // AI Config State
  const [selectedModel, setSelectedModel] = useState(MODELS[0]);
  const [selectedStyle, setSelectedStyle] = useState(STYLES[0]);
  const [selectedMode, setSelectedMode]   = useState(MODES[0]);
  const [selectedRes, setSelectedRes]     = useState(RESOLUTIONS[1]);
  const [quantity, setQuantity]           = useState(1);

  // History State
  const [sessions, setSessions] = useState<BannerSession[]>([]);

  const fileInputRef    = useRef<HTMLInputElement>(null);
  const colorPickerRef  = useRef<HTMLInputElement>(null);

  // Load history
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) { try { setSessions(JSON.parse(saved)); } catch { /* ignore */ } }
  }, []);

  // When platform changes, reset format to first available
  useEffect(() => {
    const formats = FORMATS_BY_PLATFORM[activePlatform] ?? [];
    if (formats.length) setActiveFormat(formats[0].id);
  }, [activePlatform]);

  const currentPlatform = PLATFORMS.find(p => p.id === activePlatform)!;
  const currentFormats  = FORMATS_BY_PLATFORM[activePlatform] ?? [];
  const currentFormat   = currentFormats.find(f => f.id === activeFormat) ?? currentFormats[0];

  // ── AI Boost ───────────────────────────────────────────
  const handleEnhance = async () => {
    if (!prompt.trim() || isEnhancing) return;
    setIsEnhancing(true);
    setStatus('Đang tối ưu mô tả...');
    try {
      const sys = `Bạn là chuyên gia marketing. Viết lại mô tả sau thành prompt AI chi tiết để tạo banner ${currentPlatform.label} (${currentFormat?.label ?? ''}) chuyên nghiệp. Giữ nội dung cốt lõi, thêm chi tiết về màu sắc, bố cục và font chữ. Trả về bằng Tiếng Việt ngắn gọn.`;
      const enhanced = await generateDemoText(`${sys}\n\nNội dung gốc: "${prompt}"`);
      if (enhanced && !enhanced.includes('CONNECTION_TERMINATED')) setPrompt(enhanced);
      setStatus('Đã tối ưu prompt');
    } catch { setStatus('Lỗi tăng cường'); }
    finally { setIsEnhancing(false); }
  };

  // ── File upload ────────────────────────────────────────
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []) as File[];
    files.slice(0, 6 - references.length).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => setReferences(prev => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
  };

  // ── Brand colors ───────────────────────────────────────
  const handleAddColor = () => { if (brandColors.length < 10) setBrandColors([...brandColors, hexInput]); };
  const handleColorBlockClick = (i: number) => {
    setEditingColorIndex(i);
    if (colorPickerRef.current) { colorPickerRef.current.value = brandColors[i]; colorPickerRef.current.click(); }
  };
  const onColorPickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editingColorIndex !== null) {
      const nc = [...brandColors]; nc[editingColorIndex] = e.target.value; setBrandColors(nc);
    }
  };
  const removeBrandColor = (i: number) => setBrandColors(brandColors.filter((_, idx) => idx !== i));

  // ── Generate ───────────────────────────────────────────
  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;
    if (!isAuthenticated) { login(); return; }
    const totalCost = CREDIT_COST * quantity;
    if (credits < totalCost) { setShowLowCreditAlert(true); return; }

    setIsGenerating(true);
    setStatus('Đang kết nối H100 Node...');
    try {
      const ok = useCredits(totalCost);
      if (!ok) throw new Error('Insufficient credits');

      const brandCtx  = brandName ? `Thương hiệu: ${brandName}.` : '';
      const colorCtx  = useBrandColor ? `Màu sắc chủ đạo: ${brandColors.join(', ')}.` : '';
      const textCtx   = addTextToBanner
        ? `Tiêu đề chính: "${headline || 'Your Brand'}". Tagline: "${tagline || 'Powered by AI'}".`
        : 'Tạo banner không có chữ.';

      const fullPrompt = `Tạo banner ${currentPlatform.label} — định dạng ${currentFormat?.label ?? ''} (${currentFormat?.size ?? ''}), tỷ lệ ${currentFormat?.ratio ?? '16:9'}).
Phong cách: ${selectedStyle}. ${brandCtx} ${colorCtx} ${textCtx}
Chi tiết: ${prompt}.
Yêu cầu: chất lượng ${selectedRes}, bố cục chuẩn platform, contrast cao, pixel-perfect.`;

      const imageUrl = await generateDemoImage(fullPrompt, references);
      if (imageUrl) {
        setResult(imageUrl);
        const session: BannerSession = {
          id: Date.now().toString(), url: imageUrl, prompt,
          config: { platform: activePlatform, format: activeFormat, style: selectedStyle },
          timestamp: new Date().toLocaleString(),
        };
        const updated = [session, ...sessions];
        setSessions(updated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        setStatus('Hoàn tất');
      } else { setStatus('Lỗi tạo ảnh'); }
    } catch { setStatus('Lỗi hệ thống'); }
    finally { setIsGenerating(false); }
  };

  const deleteSession = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = sessions.filter(s => s.id !== id);
    setSessions(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    if (result && sessions.find(s => s.id === id)?.url === result) setResult(null);
  };

  // ── Aspect ratio class for result preview ──────────────
  const ratioClass = () => {
    const r = currentFormat?.ratio ?? '16:9';
    if (r === '9:16') return 'aspect-[9/16] h-[75vh]';
    if (r === '1:1')  return 'aspect-square h-[65vh]';
    if (r === '4:1' || r === '21:8') return 'aspect-[4/1] w-[70vw]';
    return 'aspect-video w-[65vw]';
  };

  // ──────────────────────────────────────────────────────
  return (
    <div className="h-full w-full flex flex-col bg-[#f4f7f9] dark:bg-[#050505] text-slate-900 dark:text-white font-sans overflow-hidden relative transition-colors duration-500">

      {/* ① TOP NAV */}
      <div className="h-14 bg-white dark:bg-[#0a0a0a] border-b border-slate-200 dark:border-white/5 flex items-center justify-between px-6 shrink-0 z-[100] transition-colors">
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 p-1 rounded-full border border-slate-200 dark:border-white/10 transition-colors">
          <button
            onClick={() => setViewMode('current')}
            className={`px-5 py-1.5 text-[11px] font-bold rounded-full transition-all ${viewMode === 'current' ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
          >Phiên hiện tại</button>
          <button
            onClick={() => setViewMode('library')}
            className={`px-5 py-1.5 text-[11px] font-bold rounded-full transition-all ${viewMode === 'library' ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
          >Thư viện ({sessions.length})</button>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-brand-blue/10 border border-brand-blue/20 rounded-full">
            <Coins size={12} className="text-brand-blue" />
            <span className="text-[10px] font-black text-brand-blue">{credits.toLocaleString()} CR</span>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><X size={20} /></button>
        </div>
      </div>

      <div className="flex-grow flex overflow-hidden">

        {/* ② SIDEBAR */}
        <aside className="w-[380px] border-r border-slate-200 dark:border-white/5 bg-white dark:bg-[#0a0a0a] flex flex-col shrink-0 overflow-y-auto pb-10 transition-colors duration-500"
          style={{ scrollbarWidth: 'none' }}>
          <div className="p-5 space-y-8">

            {/* PLATFORM PICKER */}
            <section className="space-y-3">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-400">
                <LayoutGrid size={14} className="text-brand-blue" /> NỀN TẢNG
              </div>
              <div className="grid grid-cols-5 gap-2">
                {PLATFORMS.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setActivePlatform(p.id)}
                    className={`flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl border transition-all ${activePlatform === p.id
                      ? 'border-brand-blue bg-brand-blue/10 text-brand-blue'
                      : 'border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/[0.03] text-slate-400 dark:text-[#555] hover:border-slate-200 dark:hover:border-white/10'}`}
                  >
                    <span className="text-[14px] font-black leading-none" style={activePlatform === p.id ? { color: p.color } : {}}>{p.icon}</span>
                    <span className="text-[7px] font-bold uppercase">{p.label.split('/')[0].trim()}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* FORMAT PICKER */}
            <section className="space-y-3">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-400">
                <ImageIcon size={14} className="text-brand-blue" /> ĐỊNH DẠNG
              </div>
              <div className="flex flex-wrap gap-2">
                {currentFormats.map(f => (
                  <button
                    key={f.id}
                    onClick={() => setActiveFormat(f.id)}
                    className={`px-3 py-1.5 rounded-lg border text-[9px] font-bold uppercase transition-all ${activeFormat === f.id
                      ? 'border-brand-blue bg-brand-blue/10 text-brand-blue'
                      : 'border-slate-200 dark:border-white/[0.06] bg-slate-50 dark:bg-white/[0.03] text-slate-500 dark:text-[#555] hover:border-slate-300 dark:hover:border-white/10'}`}
                  >
                    {f.label}
                    <span className="ml-1.5 text-[7px] opacity-60 font-mono">{f.size}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* PROMPT */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-400">
                  <Type size={14} /> MÔ TẢ BANNER
                </div>
                <button
                  onClick={handleEnhance}
                  disabled={isEnhancing || !prompt.trim()}
                  className="flex items-center gap-1.5 text-[9px] font-black text-brand-blue uppercase tracking-widest hover:brightness-125 transition-all disabled:opacity-30"
                >
                  {isEnhancing ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                  AI Boost
                </button>
              </div>
              <textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                className="w-full h-24 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 p-4 text-xs font-bold focus:border-brand-blue outline-none transition-all resize-none rounded-md text-slate-800 dark:text-white"
                placeholder={`Mô tả banner ${currentPlatform.label} của bạn...`}
              />
            </section>

            {/* HEADLINE & TAGLINE */}
            <section className="space-y-4">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest">TIÊU ĐỀ CHÍNH</label>
                <input
                  value={headline} onChange={e => setHeadline(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 p-3 text-xs font-bold focus:border-brand-blue outline-none rounded-md text-slate-800 dark:text-white"
                  placeholder="VD: Flash Sale 50% OFF"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest">TAGLINE</label>
                <input
                  value={tagline} onChange={e => setTagline(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 p-3 text-xs font-bold focus:border-brand-blue outline-none rounded-md text-slate-800 dark:text-white"
                  placeholder="VD: Chỉ hôm nay — đừng bỏ lỡ"
                />
              </div>
            </section>

            {/* REFERENCE IMAGES */}
            <section className="space-y-3">
              <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400 dark:text-gray-400 tracking-widest">
                <div className="flex items-center gap-2"><ImageIcon size={14} /> ẢNH THAM CHIẾU</div>
                <span className="text-slate-300 dark:text-gray-600">{references.length}/6</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {references.map((ref, i) => (
                  <div key={i} className="relative aspect-square bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-md overflow-hidden group">
                    <img src={ref} className="w-full h-full object-cover" alt="" />
                    <button onClick={() => setReferences(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <X size={10} />
                    </button>
                  </div>
                ))}
                {references.length < 6 && (
                  <button onClick={() => fileInputRef.current?.click()} className="aspect-square border-2 border-dashed border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 rounded-md flex flex-col items-center justify-center gap-2 hover:border-brand-blue group transition-all">
                    <Plus size={18} className="text-slate-300 dark:text-gray-400 group-hover:text-brand-blue" />
                    <span className="text-[8px] font-black text-slate-400 dark:text-gray-500 uppercase">Thêm ảnh</span>
                  </button>
                )}
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={handleFileUpload} />
            </section>

            {/* MODEL CONFIG */}
            <section className="grid grid-cols-2 gap-x-4 gap-y-5 pt-4 border-t border-slate-100 dark:border-white/5">
              {([
                ['MODEL AI',   selectedModel, setSelectedModel, MODELS],
                ['PHONG CÁCH', selectedStyle, setSelectedStyle, STYLES],
                ['MODE',       selectedMode,  setSelectedMode,  MODES],
                ['RES',        selectedRes,   setSelectedRes,   RESOLUTIONS],
              ] as const).map(([lbl, val, setter, opts]) => (
                <div key={lbl} className="space-y-2">
                  <label className="text-[8px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest">{lbl}</label>
                  <select
                    value={val}
                    onChange={e => (setter as React.Dispatch<React.SetStateAction<string>>)(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 p-2 rounded-md text-[10px] font-bold outline-none text-slate-800 dark:text-white"
                  >
                    {(opts as readonly string[]).map(o => <option key={o} className="bg-white dark:bg-[#0a0a0a]">{o}</option>)}
                  </select>
                </div>
              ))}
              <div className="space-y-2">
                <label className="text-[8px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest">SỐ LƯỢNG</label>
                <input type="number" min={1} max={4} value={quantity} onChange={e => setQuantity(+e.target.value)} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 p-2 rounded-md text-[10px] font-bold outline-none text-slate-800 dark:text-white" />
              </div>
            </section>

            {/* CREDIT ESTIMATE */}
            <div className="flex justify-between items-center pt-2 text-brand-blue">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-tight">
                <Coins size={14} /> Đơn giá: {CREDIT_COST}
              </div>
              <div className="text-[12px] font-black uppercase italic">
                Tổng: {CREDIT_COST * quantity} CR
              </div>
            </div>

            {/* ADVANCED */}
            <section className="space-y-4">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full flex items-center justify-between p-3 border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 rounded-md text-[10px] font-black uppercase tracking-widest hover:border-slate-300 dark:hover:border-white/20 transition-all text-slate-500 dark:text-white"
              >
                <div className="flex items-center gap-2"><Sliders size={14} /> Tùy chọn nâng cao</div>
                <ChevronDown size={14} className={`transition-transform duration-300 ${showAdvanced ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {showAdvanced && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="space-y-6 overflow-hidden">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest">TÊN THƯƠNG HIỆU</label>
                      <input value={brandName} onChange={e => setBrandName(e.target.value)} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 p-3 text-xs font-bold outline-none rounded-md text-slate-800 dark:text-white" placeholder="Tên thương hiệu" />
                    </div>

                    <div className="space-y-3">
                      <label className="text-[9px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest">MÀU THƯƠNG HIỆU</label>
                      <div className="flex flex-wrap gap-2.5 items-center p-3 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 rounded-md">
                        {brandColors.map((color, i) => (
                          <div key={i} className="relative group cursor-pointer">
                            <div onClick={() => handleColorBlockClick(i)} className="w-8 h-8 rounded-sm shadow-lg border border-slate-200 dark:border-white/10 hover:scale-110 transition-transform" style={{ backgroundColor: color }} />
                            <button onClick={e => { e.stopPropagation(); removeBrandColor(i); }} className="absolute -top-1 -right-1 p-0.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X size={8} /></button>
                          </div>
                        ))}
                        <input type="color" ref={colorPickerRef} className="hidden" onChange={onColorPickerChange} />
                        <div className="flex-grow flex items-center gap-2 bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 px-3 py-1.5 rounded-sm">
                          <span className="text-[9px] text-slate-400 uppercase font-black">#</span>
                          <input value={hexInput} onChange={e => setHexInput(e.target.value.toUpperCase())} className="bg-transparent border-none outline-none text-[10px] font-black w-full text-brand-blue" placeholder="FFFFFF" />
                          <button onClick={handleAddColor} className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"><CheckCircle2 size={14} /></button>
                        </div>
                        <button onClick={handleAddColor} className="w-8 h-8 border border-dashed border-slate-300 dark:border-white/20 rounded-sm flex items-center justify-center text-slate-400 hover:border-brand-blue hover:text-brand-blue transition-all">
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-white/5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-500 dark:text-gray-400">Sử dụng màu thương hiệu</span>
                        <Toggle active={useBrandColor} onChange={() => setUseBrandColor(!useBrandColor)} />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-500 dark:text-gray-400">Thêm chữ vào banner</span>
                        <Toggle active={addTextToBanner} onChange={() => setAddTextToBanner(!addTextToBanner)} />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            {/* GENERATE BUTTON */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full py-5 bg-gradient-to-r from-brand-blue to-indigo-600 text-white font-black uppercase text-xs tracking-[0.3em] shadow-[0_20px_80px_rgba(0,144,255,0.25)] hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-4 rounded-xl disabled:opacity-30"
            >
              {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <Wand2 size={18} />}
              TẠO BANNER
            </button>

            {/* SESSION HISTORY (sidebar) */}
            <section className="pt-8 border-t border-slate-100 dark:border-white/5 space-y-4">
              <div className="flex items-center gap-3 text-[10px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest">
                <ImageIcon size={14} /> PHIÊN GẦN ĐÂY
              </div>
              <div className="space-y-3">
                {sessions.slice(0, 5).map(s => (
                  <div key={s.id} className="relative group/sess">
                    <button onClick={() => { setResult(s.url); setViewMode('current'); }} className="w-full flex items-center gap-3 p-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-lg hover:border-brand-blue transition-all text-left shadow-sm dark:shadow-none">
                      <div className="w-10 h-10 rounded overflow-hidden shrink-0 border border-slate-100 dark:border-transparent">
                        <img src={s.url} className="w-full h-full object-cover" alt="" />
                      </div>
                      <div className="flex-grow min-w-0">
                        <p className="text-[9px] font-black text-slate-900 dark:text-white truncate uppercase">{s.prompt}</p>
                        <p className="text-[7px] text-slate-400 dark:text-gray-500 uppercase">{s.timestamp}</p>
                      </div>
                      <ChevronRight size={12} className="text-slate-300 dark:text-gray-600 group-hover:text-brand-blue" />
                    </button>
                    <button onClick={e => deleteSession(e, s.id)} className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover/sess:opacity-100 transition-opacity shadow-lg">
                      <Trash2 size={10} />
                    </button>
                  </div>
                ))}
                {sessions.length === 0 && (
                  <div className="py-12 text-center opacity-20">
                    <p className="text-[10px] font-black uppercase tracking-widest italic text-slate-400 dark:text-white">Chưa có phiên nào</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </aside>

        {/* ③ MAIN VIEWPORT */}
        <main className="flex-grow bg-[#f0f3f6] dark:bg-[#020202] relative overflow-hidden flex flex-col items-center justify-center p-8 transition-colors duration-500">
          <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.015] pointer-events-none" style={{ backgroundImage: 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

          {/* Status bar */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1 bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-slate-200/50 dark:border-white/10 rounded-full z-10">
            <div className={`w-1.5 h-1.5 rounded-full ${isGenerating ? 'bg-brand-blue animate-pulse' : 'bg-green-500'}`} />
            <span className="text-[9px] font-bold text-slate-500 dark:text-white/40 uppercase tracking-wider">{status}</span>
            <span className="text-[9px] font-mono text-slate-300 dark:text-white/20">{CREDIT_COST} CR</span>
          </div>

          <AnimatePresence mode="wait">
            {/* LIBRARY VIEW */}
            {viewMode === 'library' ? (
              <motion.div key="lib" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full overflow-y-auto p-10" style={{ scrollbarWidth: 'none' }}>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {sessions.map(s => (
                    <div key={s.id} className="relative group/lib aspect-square bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5 rounded-lg overflow-hidden shadow-xl hover:border-brand-blue transition-all">
                      <img src={s.url} className="w-full h-full object-cover" alt="" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover/lib:opacity-100 transition-opacity" />
                      <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover/lib:opacity-100 translate-x-4 group-hover/lib:translate-x-0 transition-all">
                        <button onClick={e => deleteSession(e, s.id)} className="p-2 bg-red-500 text-white rounded-full shadow-lg"><Trash2 size={14} /></button>
                        <a href={s.url} download className="p-2 bg-white text-black rounded-full shadow-lg flex items-center justify-center"><Download size={14} /></a>
                      </div>
                      <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover/lib:opacity-100 translate-y-4 group-hover/lib:translate-y-0 transition-all">
                        <p className="text-[8px] font-black uppercase text-brand-blue truncate mb-1">{s.config.platform} · {s.config.format}</p>
                        <button onClick={() => { setResult(s.url); setViewMode('current'); }} className="w-full py-2 bg-white text-black text-[8px] font-black uppercase tracking-widest rounded-sm shadow-xl">Mở chỉnh sửa</button>
                      </div>
                    </div>
                  ))}
                  {sessions.length === 0 && (
                    <div className="col-span-full h-[50vh] flex flex-col items-center justify-center opacity-10 space-y-6">
                      <LayoutGrid size={120} className="text-slate-400 dark:text-white" />
                      <p className="text-xl font-black uppercase tracking-[0.5em] text-slate-800 dark:text-white">Thư viện trống</p>
                    </div>
                  )}
                </div>
              </motion.div>

            /* GENERATING STATE */
            ) : isGenerating ? (
              <motion.div key="gen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-12 text-center">
                <div className="relative">
                  <Loader2 size={120} className="text-brand-blue animate-spin" strokeWidth={1} />
                  <Sparkles size={40} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-brand-blue animate-pulse" />
                </div>
                <div className="space-y-4">
                  <p className="text-xl font-black uppercase tracking-[0.6em] animate-pulse italic text-slate-800 dark:text-white">ĐANG TẠO BANNER...</p>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-gray-600 uppercase tracking-widest">{currentPlatform.label} · {currentFormat?.label} · {currentFormat?.size}</p>
                </div>
              </motion.div>

            /* RESULT */
            ) : result ? (
              <motion.div key="res" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className={`relative shadow-[0_50px_150px_rgba(0,0,0,0.1)] dark:shadow-[0_50px_150px_rgba(0,0,0,1)] border border-slate-200 dark:border-white/5 bg-white dark:bg-black rounded-sm overflow-hidden group ${ratioClass()} transition-colors duration-500`}>
                <img src={result} className="w-full h-full object-cover" alt="Banner Result" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute top-6 right-6 flex flex-col gap-3 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all">
                  <button className="p-4 bg-white dark:bg-black/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-full hover:bg-brand-blue hover:text-white transition-all shadow-xl text-slate-800 dark:text-white"><Share2 size={18} /></button>
                  <a href={result} download={`banner_${activePlatform}_${activeFormat}_${Date.now()}.png`} className="p-4 bg-white text-black rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center"><Download size={18} /></a>
                </div>
                <div className="absolute bottom-6 left-6 space-y-1 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all">
                  <p className="text-[10px] font-black uppercase text-brand-blue tracking-widest">Banner Ready</p>
                  <p className="text-[8px] text-white/50 uppercase">{currentPlatform.label} · {currentFormat?.size}</p>
                </div>
              </motion.div>

            /* EMPTY */
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-8 opacity-20 dark:opacity-10 flex flex-col items-center">
                <div className="w-32 h-32 bg-slate-200 dark:bg-white/5 rounded-3xl flex items-center justify-center border border-slate-300 dark:border-white/10">
                  <LayoutGrid size={80} strokeWidth={1} className="text-slate-500 dark:text-white" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-black uppercase tracking-[0.5em] text-slate-800 dark:text-white">Chưa có banner</h3>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-gray-500">Tạo banner social media đầu tiên với AI</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer status bar */}
          <div className="absolute bottom-10 flex items-center gap-12 text-[10px] font-black uppercase text-slate-400 dark:text-gray-600 tracking-widest">
            <div className="flex items-center gap-2"><Smartphone size={14} /> Mobile Optimised</div>
            <div className="flex items-center gap-2"><Maximize2 size={14} /> Pixel Perfect</div>
            <div className="flex items-center gap-2"><ShieldCheck size={14} /> Brand Safe</div>
          </div>
        </main>
      </div>

      {/* LOW CREDIT DIALOG */}
      <AnimatePresence>
        {showLowCreditAlert && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-white dark:bg-[#0c0c0e] p-10 border border-slate-200 dark:border-white/10 rounded-sm text-center space-y-8 shadow-2xl">
              <div className="w-20 h-20 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center mx-auto text-amber-500"><AlertTriangle size={40} /></div>
              <div className="space-y-3">
                <h3 className="text-3xl font-black uppercase tracking-tighter italic text-slate-900 dark:text-white">Không đủ Credits</h3>
                <p className="text-sm text-slate-500 dark:text-gray-400 font-medium leading-relaxed">Tạo banner yêu cầu <strong>{CREDIT_COST * quantity} credits</strong>. Vui lòng nạp thêm để tiếp tục.</p>
              </div>
              <div className="flex flex-col gap-4">
                <Link to="/credits" className="bg-brand-blue text-white py-5 rounded-sm text-xs font-black uppercase tracking-[0.4em] shadow-xl text-center hover:brightness-110 transition-all">Nạp thêm Credits</Link>
                <button onClick={() => setShowLowCreditAlert(false)} className="text-[10px] font-black uppercase text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors">Để sau</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Toggle ────────────────────────────────────────────────
const Toggle = ({ active, onChange }: { active: boolean; onChange: () => void }) => (
  <button
    onClick={onChange}
    className={`w-10 h-5 rounded-full relative transition-colors ${active ? 'bg-brand-blue' : 'bg-slate-300 dark:bg-gray-700'}`}
  >
    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all duration-200 ${active ? 'left-[22px]' : 'left-0.5'}`} />
  </button>
);

export default SocialBannerWorkspace;
