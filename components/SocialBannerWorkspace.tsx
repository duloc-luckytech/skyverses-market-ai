import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Zap, Download, Loader2,
  Plus, RefreshCw, Sparkles, Sliders,
  Wand2, Target, Maximize2,
  ChevronRight, Trash2, CheckCircle2,
  LayoutGrid, ChevronDown, Type,
  Coins, AlertTriangle, ImageIcon,
} from 'lucide-react';
import { generateDemoImage, generateDemoText } from '../services/gemini';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Link } from 'react-router-dom';
import AISuggestPanel, { StylePreset } from './workspace/AISuggestPanel';

const STORAGE_KEY = 'skyverses_social-banner_vault';
const CREDIT_COST = 120;

// ── Platform data ────────────────────────────────────────────────────────────
const PLATFORMS = [
  { id: 'x-cover',      label: 'X Cover',         ratio: '3:1',  size: '1500×500',  hint: 'Header ảnh bìa X/Twitter' },
  { id: 'x-post',       label: 'X Post',           ratio: '16:9', size: '1200×675',  hint: 'Ảnh đính kèm bài đăng X' },
  { id: 'fb-cover',     label: 'FB Cover',         ratio: '205:78', size: '820×312',hint: 'Ảnh bìa Facebook page/profile' },
  { id: 'fb-post',      label: 'FB Post',          ratio: '1200:630', size: '1200×630', hint: 'Ảnh đăng bài Facebook' },
  { id: 'ig-post',      label: 'IG Post',          ratio: '1:1',  size: '1080×1080', hint: 'Ảnh đăng Instagram feed' },
  { id: 'ig-story',     label: 'IG Story',         ratio: '9:16', size: '1080×1920', hint: 'Story Instagram/Facebook' },
  { id: 'li-banner',    label: 'LinkedIn Banner',  ratio: '4:1',  size: '1584×396',  hint: 'Ảnh bìa trang LinkedIn' },
  { id: 'li-post',      label: 'LinkedIn Post',    ratio: '1200:627', size: '1200×627', hint: 'Ảnh đăng bài LinkedIn' },
  { id: 'tiktok-cover', label: 'TikTok Cover',     ratio: '1:1',  size: '200×200',   hint: 'Ảnh đại diện TikTok' },
  { id: 'youtube-thumb',label: 'YT Thumbnail',     ratio: '16:9', size: '1280×720',  hint: 'Thumbnail YouTube video' },
];

const STYLES = ['Hiện đại', 'Luxury', 'Bold & Pop', 'Tối giản', 'Sắc nét', 'Gradient'];
const MODELS = ['Nano Banana Pro', 'Nano Banana Lite', 'Gemini 3 Pro Image'];
const MODES  = ['Chuyên nghiệp', 'Nhanh', 'Cân bằng'];
const RESOLUTIONS = ['1k', '2k', '4k'];

// Product-specific style presets for AISuggestPanel
const BANNER_STYLES: StylePreset[] = [
  { id: 'modern',    label: 'Hiện đại',  emoji: '⚡', description: 'Clean, bold typography',    promptPrefix: 'modern clean design, bold font, ' },
  { id: 'luxury',    label: 'Luxury',    emoji: '💎', description: 'Premium & sophisticated',   promptPrefix: 'luxury premium aesthetic, gold accents, ' },
  { id: 'bold',      label: 'Bold',      emoji: '🎯', description: 'High contrast, vivid pop',  promptPrefix: 'bold colorful design, high contrast, ' },
  { id: 'minimal',   label: 'Tối giản',  emoji: '🤍', description: 'Whitespace, clean palette', promptPrefix: 'minimalist design, lots of whitespace, ' },
  { id: 'trendy',    label: 'Trendy',    emoji: '🌈', description: 'Gradient, energetic, viral', promptPrefix: 'trendy gradient design, vibrant mesh, ' },
  { id: 'corporate', label: 'Corporate', emoji: '🏢', description: 'Professional & trustworthy', promptPrefix: 'corporate professional design, clean layout, ' },
];

const FEATURED_TEMPLATES = [
  { label: 'Sale 50% Flash',   prompt: 'Flash sale banner, bold 50% OFF text, red & gold gradient, urgency clock, modern e-commerce style', style: 'Bold' },
  { label: 'New Collection',   prompt: 'New collection launch banner, premium fashion brand, elegant black & white, minimalist layout', style: 'Luxury' },
  { label: 'Event Promo',      prompt: 'Corporate event banner, professional blue & white, conference theme, clean typography', style: 'Corporate' },
  { label: 'Brand Awareness',  prompt: 'Brand awareness banner, vibrant gradient background, logo placeholder, modern youthful energy', style: 'Trendy' },
  { label: 'Product Launch',   prompt: 'Product launch announcement, sleek modern design, spotlight on product, premium gradient', style: 'Hiện đại' },
];

interface BannerSession {
  id: string;
  url: string;
  prompt: string;
  platform: string;
  config: Record<string, unknown>;
  timestamp: string;
}

// ── Toggle component ──────────────────────────────────────────────────────────
const Toggle: React.FC<{ active: boolean; onChange: () => void }> = ({ active, onChange }) => (
  <button
    onClick={onChange}
    className={`relative w-10 h-5 rounded-full transition-colors duration-300 ${active ? 'bg-brand-blue' : 'bg-slate-200 dark:bg-white/10'}`}
  >
    <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-300 ${active ? 'translate-x-5' : 'translate-x-0'}`} />
  </button>
);

// ── Main Workspace ────────────────────────────────────────────────────────────
const SocialBannerWorkspace: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { lang } = useLanguage();
  const { theme } = useTheme();
  const { credits, useCredits, isAuthenticated, login } = useAuth();

  // UI
  const [isGenerating, setIsGenerating]   = useState(false);
  const [isEnhancing, setIsEnhancing]     = useState(false);
  const [showAdvanced, setShowAdvanced]   = useState(false);
  const [status, setStatus]               = useState('Sẵn sàng');
  const [showLowCreditAlert, setShowLowCreditAlert] = useState(false);
  const [viewMode, setViewMode]           = useState<'current' | 'library'>('current');

  // Content
  const [prompt, setPrompt]               = useState('');
  const [title, setTitle]                 = useState('');
  const [subtitle, setSubtitle]           = useState('');
  const [references, setReferences]       = useState<string[]>([]);
  const [result, setResult]               = useState<string | null>(null);

  // Platform & Style
  const [activePlatform, setActivePlatform] = useState(PLATFORMS[0].id);
  const [selectedStyle, setSelectedStyle]   = useState(STYLES[0]);
  const [selectedModel, setSelectedModel]   = useState(MODELS[0]);
  const [selectedMode, setSelectedMode]     = useState(MODES[0]);
  const [selectedRes, setSelectedRes]       = useState(RESOLUTIONS[1]);
  const [quantity, setQuantity]             = useState(1);

  // Advanced / brand
  const [brandName, setBrandName]         = useState('');
  const [brandColors, setBrandColors]     = useState(['#0090FF', '#6366F1']);
  const [hexInput, setHexInput]           = useState('#2196F3');
  const [useBrandColor, setUseBrandColor] = useState(true);
  const [addTextToBanner, setAddTextToBanner] = useState(true);

  // History
  const [sessions, setSessions]           = useState<BannerSession[]>([]);

  const fileInputRef    = useRef<HTMLInputElement>(null);
  const colorPickerRef  = useRef<HTMLInputElement>(null);
  const [editingColorIndex, setEditingColorIndex] = useState<number | null>(null);

  // Load history
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { setSessions(JSON.parse(saved)); } catch { /* ignore */ }
    }
  }, []);

  const selectedPlatformObj = PLATFORMS.find(p => p.id === activePlatform)!;

  // ── AI Boost ──
  const handleEnhance = async () => {
    if (!prompt.trim() || isEnhancing) return;
    setIsEnhancing(true);
    setStatus('Đang tối ưu mô tả...');
    try {
      const sys = 'Bạn là chuyên gia marketing. Viết lại mô tả sau thành prompt AI để tạo banner mạng xã hội chuyên nghiệp — thêm chi tiết về bố cục, màu sắc, kiểu chữ, cảm xúc. Trả về tiếng Việt ngắn gọn.';
      const enhanced = await generateDemoText(`${sys}\n\nNội dung: "${prompt}"`);
      if (enhanced && !enhanced.includes('CONNECTION_TERMINATED')) {
        setPrompt(enhanced);
        setStatus('Đã tăng cường prompt');
      }
    } catch { /* silent */ } finally { setIsEnhancing(false); }
  };

  // ── File upload ──
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).slice(0, 6 - references.length);
    files.forEach(f => {
      const reader = new FileReader();
      reader.onloadend = () => setReferences(prev => [...prev, reader.result as string]);
      reader.readAsDataURL(f);
    });
  };

  // ── Brand colors ──
  const handleColorBlockClick = (index: number) => {
    setEditingColorIndex(index);
    if (colorPickerRef.current) {
      colorPickerRef.current.value = brandColors[index];
      colorPickerRef.current.click();
    }
  };

  const onColorPickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editingColorIndex !== null) {
      const next = [...brandColors];
      next[editingColorIndex] = e.target.value;
      setBrandColors(next);
    }
  };

  // ── Generate ──
  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;
    if (!isAuthenticated) { login(); return; }

    const totalCost = CREDIT_COST * quantity;
    if (credits < totalCost) { setShowLowCreditAlert(true); return; }

    setIsGenerating(true);
    setStatus('Đang kết nối AI Node...');

    try {
      const successful = useCredits(totalCost);
      if (!successful) throw new Error('Insufficient credits');

      const platformInfo = `Platform: ${selectedPlatformObj.label} (${selectedPlatformObj.size}px, tỷ lệ ${selectedPlatformObj.ratio}).`;
      const brandCtx  = brandName ? `Thương hiệu: ${brandName}.` : '';
      const colorCtx  = useBrandColor ? `Màu thương hiệu: ${brandColors.join(', ')}.` : '';
      const textCtx   = addTextToBanner
        ? `Bao gồm tiêu đề: "${title || 'Banner text'}"${subtitle ? ` và phụ đề: "${subtitle}"` : ''}.`
        : 'Không thêm chữ vào banner.';
      const styleCtx  = `Style: ${selectedStyle}.`;

      const fullPrompt = `Tạo banner mạng xã hội chuyên nghiệp. ${platformInfo} ${styleCtx} ${brandCtx} ${colorCtx} ${textCtx} Mô tả: ${prompt}. Yêu cầu: pixel-perfect, chất lượng thương mại, chuẩn publish lên mạng xã hội, không watermark.`;

      const imageUrl = await generateDemoImage(fullPrompt, references);

      if (imageUrl) {
        setResult(imageUrl);
        const session: BannerSession = {
          id: Date.now().toString(),
          url: imageUrl,
          prompt,
          platform: selectedPlatformObj.label,
          config: { selectedStyle, selectedModel, selectedMode, selectedRes, quantity },
          timestamp: new Date().toLocaleString(),
        };
        const updated = [session, ...sessions];
        setSessions(updated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        setStatus('Hoàn tất');
      } else {
        setStatus('Lỗi tạo ảnh');
      }
    } catch { setStatus('Lỗi hệ thống'); } finally { setIsGenerating(false); }
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

      {/* ── LOW CREDIT ALERT ── */}
      <AnimatePresence>
        {showLowCreditAlert && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-16 left-1/2 -translate-x-1/2 z-[200] bg-white dark:bg-[#111] border border-orange-500/30 rounded-xl p-5 shadow-2xl max-w-sm w-full mx-4"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-orange-500 shrink-0 mt-0.5" size={18} />
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Không đủ credits</p>
                <p className="text-[11px] text-slate-500 dark:text-[#666] mt-1">
                  Cần tối thiểu {CREDIT_COST * quantity} CR. Bạn đang có {credits.toLocaleString()} CR.
                </p>
                <div className="flex gap-2 mt-3">
                  <Link to="/credits" onClick={onClose} className="flex-1 py-2 bg-brand-blue text-white text-[10px] font-bold uppercase tracking-widest rounded-lg text-center">
                    Nạp Credits
                  </Link>
                  <button onClick={() => setShowLowCreditAlert(false)} className="flex-1 py-2 border border-slate-200 dark:border-white/10 text-[10px] font-bold uppercase rounded-lg text-slate-500">
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 1. TOP NAV ── */}
      <div className="h-14 bg-white dark:bg-[#0a0a0a] border-b border-slate-200 dark:border-white/5 flex items-center justify-between px-6 shrink-0 z-[100] transition-colors">
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 p-1 rounded-full border border-slate-200 dark:border-white/10">
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

        <div className="flex items-center gap-4">
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

        {/* ── 2. SIDEBAR ── */}
        <aside className="w-[380px] border-r border-slate-200 dark:border-white/5 bg-white dark:bg-[#0a0a0a] flex flex-col shrink-0 overflow-y-auto no-scrollbar pb-10 transition-colors duration-500">
          <div className="p-5 space-y-7">

            {/* PLATFORM PICKER */}
            <section className="space-y-3">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-400">
                <Target size={14} className="text-brand-blue" /> PLATFORM
              </div>
              <div className="grid grid-cols-2 gap-2">
                {PLATFORMS.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setActivePlatform(p.id)}
                    className={`relative flex flex-col items-start gap-1 px-3 py-2.5 rounded-lg border text-left transition-all ${
                      activePlatform === p.id
                        ? 'border-brand-blue bg-brand-blue/[0.07] dark:bg-brand-blue/[0.12]'
                        : 'border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02] hover:border-slate-200 dark:hover:border-white/10'
                    }`}
                  >
                    <span className={`text-[10px] font-bold ${activePlatform === p.id ? 'text-brand-blue' : 'text-slate-700 dark:text-white/70'}`}>
                      {p.label}
                    </span>
                    <span className="text-[8px] text-slate-400 dark:text-[#555]">{p.size}</span>
                  </button>
                ))}
              </div>
              {/* Selected platform hint */}
              <div className="px-3 py-2 bg-brand-blue/[0.05] border border-brand-blue/15 rounded-lg">
                <p className="text-[9px] font-bold text-brand-blue">{selectedPlatformObj.label} — {selectedPlatformObj.size}px</p>
                <p className="text-[8px] text-slate-500 dark:text-[#666] mt-0.5">{selectedPlatformObj.hint}</p>
              </div>
            </section>

            {/* AI SUGGEST PANEL */}
            <AISuggestPanel
              productSlug="social-banner-ai"
              productName="Social Banner AI"
              styles={BANNER_STYLES}
              onPromptSelect={(p) => setPrompt(prev => p + (prev ? '\n' + prev : ''))}
              onApply={(cfg) => {
                if (cfg.prompt) setPrompt(cfg.prompt);
                if (cfg.style && BANNER_STYLES.find(s => s.label === cfg.style)) setSelectedStyle(cfg.style);
                if (cfg.format) setActivePlatform(PLATFORMS.find(p => p.label.toLowerCase().includes(cfg.format!.toLowerCase()))?.id ?? activePlatform);
              }}
              historyKey={STORAGE_KEY}
              featuredTemplates={FEATURED_TEMPLATES}
              productContext="Social media banner creator — tạo banner chuẩn kích thước cho X, Facebook, Instagram, LinkedIn. Hỗ trợ brand colors, AI copywriting, các format phổ biến."
            />

            {/* MÔ TẢ BANNER */}
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
                className="w-full h-24 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 p-4 text-xs font-bold focus:border-brand-blue outline-none transition-all resize-none rounded-md text-slate-800 dark:text-white placeholder:text-slate-300 dark:placeholder:text-white/20"
                placeholder="Mô tả banner của bạn... VD: Sale 50% sản phẩm mùa hè, nền xanh gradient, chữ trắng bold"
              />
            </section>

            {/* TIÊU ĐỀ */}
            <section className="space-y-3">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest">TIÊU ĐỀ CHÍNH</label>
                <input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 p-3 text-xs font-bold focus:border-brand-blue outline-none rounded-md text-slate-800 dark:text-white placeholder:text-slate-300 dark:placeholder:text-white/20"
                  placeholder="VD: FLASH SALE 50%"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest">PHỤ ĐỀ</label>
                <input
                  value={subtitle}
                  onChange={e => setSubtitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 p-3 text-xs font-bold focus:border-brand-blue outline-none rounded-md text-slate-800 dark:text-white placeholder:text-slate-300 dark:placeholder:text-white/20"
                  placeholder="VD: Chỉ hôm nay · Miễn phí vận chuyển"
                />
              </div>
            </section>

            {/* ẢNH THAM CHIẾU */}
            <section className="space-y-3">
              <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400 dark:text-gray-400 tracking-widest">
                <div className="flex items-center gap-2">
                  <ImageIcon size={14} /> ẢNH THAM CHIẾU
                </div>
                <span className="text-slate-300 dark:text-gray-600">{references.length}/6</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {references.map((ref, idx) => (
                  <div key={idx} className="relative aspect-square bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-md overflow-hidden group">
                    <img src={ref} className="w-full h-full object-cover" />
                    <button
                      onClick={() => setReferences(prev => prev.filter((_, i) => i !== idx))}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
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

            {/* MODEL SETTINGS */}
            <section className="grid grid-cols-2 gap-x-4 gap-y-4 pt-4 border-t border-slate-100 dark:border-white/5">
              <div className="space-y-2">
                <label className="text-[8px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest">MODEL AI</label>
                <select value={selectedModel} onChange={e => setSelectedModel(e.target.value)} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 p-2 rounded-md text-[10px] font-bold outline-none text-slate-800 dark:text-white">
                  {MODELS.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[8px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest">PHONG CÁCH</label>
                <select value={selectedStyle} onChange={e => setSelectedStyle(e.target.value)} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 p-2 rounded-md text-[10px] font-bold outline-none text-slate-800 dark:text-white">
                  {STYLES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[8px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest">MODE</label>
                <select value={selectedMode} onChange={e => setSelectedMode(e.target.value)} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 p-2 rounded-md text-[10px] font-bold outline-none text-slate-800 dark:text-white">
                  {MODES.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[8px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest">RESOLUTION</label>
                <select value={selectedRes} onChange={e => setSelectedRes(e.target.value)} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 p-2 rounded-md text-[10px] font-bold outline-none text-slate-800 dark:text-white">
                  {RESOLUTIONS.map(r => <option key={r}>{r.toUpperCase()}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[8px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest">SỐ LƯỢNG</label>
                <input type="number" min={1} max={4} value={quantity} onChange={e => setQuantity(parseInt(e.target.value) || 1)} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 p-2 rounded-md text-[10px] font-bold outline-none text-slate-800 dark:text-white" />
              </div>
            </section>

            {/* CREDIT ESTIMATE */}
            <div className="flex justify-between items-center pt-3 text-brand-blue">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-tight">
                <Zap size={14} fill="currentColor" /> {CREDIT_COST} CR / banner
              </div>
              <div className="text-[12px] font-black uppercase italic">
                Tổng: {CREDIT_COST * quantity} CR
              </div>
            </div>

            {/* ADVANCED OPTIONS */}
            <section className="space-y-4">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full flex items-center justify-between p-3 border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 rounded-md text-[10px] font-black uppercase tracking-widest hover:border-slate-300 dark:hover:border-white/20 transition-all text-slate-500 dark:text-white"
              >
                <div className="flex items-center gap-2">
                  <Sliders size={14} /> Tùy chọn nâng cao
                </div>
                <ChevronDown size={14} className={`transition-transform duration-300 ${showAdvanced ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {showAdvanced && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="space-y-5 overflow-hidden"
                  >
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest">TÊN THƯƠNG HIỆU</label>
                      <input value={brandName} onChange={e => setBrandName(e.target.value)} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 p-3 text-xs font-bold outline-none rounded-md text-slate-800 dark:text-white placeholder:text-slate-300 dark:placeholder:text-white/20" placeholder="VD: Skyverses Brand" />
                    </div>

                    {/* Brand colors */}
                    <div className="space-y-3">
                      <label className="text-[9px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest">MÀU THƯƠNG HIỆU</label>
                      <div className="flex flex-wrap gap-2 items-center p-3 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 rounded-md">
                        {brandColors.map((color, i) => (
                          <div key={i} className="relative group cursor-pointer">
                            <div
                              onClick={() => handleColorBlockClick(i)}
                              className="w-7 h-7 rounded shadow border border-slate-200 dark:border-white/10 hover:scale-110 transition-transform"
                              style={{ backgroundColor: color }}
                            />
                            <button onClick={(e) => { e.stopPropagation(); setBrandColors(prev => prev.filter((_, j) => j !== i)); }} className="absolute -top-1 -right-1 p-0.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                              <X size={8} />
                            </button>
                          </div>
                        ))}
                        <input type="color" ref={colorPickerRef} className="hidden" onChange={onColorPickerChange} />
                        <div className="flex-grow flex items-center gap-2 bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 px-3 py-1.5 rounded">
                          <span className="text-[9px] text-slate-400 dark:text-gray-600 uppercase font-black">#</span>
                          <input value={hexInput} onChange={e => setHexInput(e.target.value.toUpperCase())} className="bg-transparent border-none outline-none text-[10px] font-black w-full text-brand-blue" placeholder="0090FF" />
                          <button onClick={() => { if (brandColors.length < 10) setBrandColors(prev => [...prev, hexInput]); }} className="p-0.5 text-slate-400 hover:text-brand-blue transition-colors">
                            <CheckCircle2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-white/5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-500 dark:text-gray-400">Sử dụng màu thương hiệu</span>
                        <Toggle active={useBrandColor} onChange={() => setUseBrandColor(v => !v)} />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-500 dark:text-gray-400">Thêm chữ vào banner</span>
                        <Toggle active={addTextToBanner} onChange={() => setAddTextToBanner(v => !v)} />
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
              className="w-full py-5 bg-gradient-to-r from-brand-blue to-indigo-600 text-white font-black uppercase text-xs tracking-[0.3em] shadow-[0_20px_80px_rgba(0,144,255,0.25)] hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-4 rounded-xl disabled:opacity-30"
            >
              {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <Wand2 size={18} />}
              TẠO BANNER
            </button>

            {/* STATUS */}
            {isGenerating && (
              <div className="flex items-center gap-2 text-[9px] text-brand-blue font-bold uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-blue animate-pulse" />
                {status}
              </div>
            )}

            {/* HISTORY */}
            <section className="pt-6 border-t border-slate-100 dark:border-white/5 space-y-3">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest">
                <RefreshCw size={13} /> PHIÊN GẦN ĐÂY
              </div>
              {sessions.slice(0, 5).map(s => (
                <div key={s.id} className="relative group/sess">
                  <button
                    onClick={() => { setResult(s.url); setViewMode('current'); }}
                    className="w-full flex items-center gap-3 p-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-lg hover:border-brand-blue transition-all text-left"
                  >
                    <div className="w-10 h-10 rounded overflow-hidden shrink-0 border border-slate-100 dark:border-transparent">
                      <img src={s.url} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-grow min-w-0">
                      <p className="text-[9px] font-black text-slate-900 dark:text-white truncate uppercase">{s.platform} · {s.prompt.slice(0, 30)}…</p>
                      <p className="text-[7px] text-slate-400 dark:text-gray-500 uppercase">{s.timestamp}</p>
                    </div>
                    <ChevronRight size={12} className="text-slate-300 group-hover:text-brand-blue" />
                  </button>
                  <button onClick={(e) => deleteSession(e, s.id)} className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover/sess:opacity-100 transition-opacity shadow-lg">
                    <Trash2 size={10} />
                  </button>
                </div>
              ))}
              {sessions.length === 0 && (
                <div className="py-10 text-center opacity-20">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-white">Chưa có phiên nào</p>
                </div>
              )}
            </section>
          </div>
        </aside>

        {/* ── 3. MAIN VIEWPORT ── */}
        <main className="flex-grow bg-[#f0f3f6] dark:bg-[#020202] relative overflow-hidden flex flex-col items-center justify-center p-8 transition-colors duration-500">
          {/* Grid overlay */}
          <div className="absolute inset-0 opacity-[0.025] dark:opacity-[0.015] pointer-events-none" style={{ backgroundImage: 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

          <AnimatePresence mode="wait">
            {viewMode === 'library' ? (
              <motion.div key="library" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full overflow-y-auto p-8 no-scrollbar">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                  {sessions.map(s => (
                    <div key={s.id} className="relative group/lib aspect-video bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5 rounded-xl overflow-hidden shadow-xl hover:border-brand-blue transition-all">
                      <img src={s.url} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover/lib:opacity-100 transition-opacity" />
                      <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover/lib:opacity-100 transition-all">
                        <button onClick={(e) => deleteSession(e, s.id)} className="p-1.5 bg-red-500 text-white rounded-full shadow-lg"><Trash2 size={12} /></button>
                        <a href={s.url} download className="p-1.5 bg-white text-black rounded-full shadow-lg"><Download size={12} /></a>
                      </div>
                      <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover/lib:opacity-100 transition-all">
                        <p className="text-[8px] font-bold text-white/80 truncate">{s.platform}</p>
                        <button onClick={() => { setResult(s.url); setViewMode('current'); }} className="mt-1 w-full py-1.5 bg-brand-blue text-white text-[8px] font-black uppercase rounded shadow">Mở lại</button>
                      </div>
                    </div>
                  ))}
                  {sessions.length === 0 && (
                    <div className="col-span-full h-[50vh] flex flex-col items-center justify-center opacity-10 space-y-4">
                      <LayoutGrid size={80} className="text-slate-400 dark:text-white" />
                      <p className="text-lg font-black uppercase tracking-[0.4em] text-slate-800 dark:text-white">Thư viện trống</p>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div key="current" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-6 w-full max-w-2xl">
                {/* Platform label */}
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-brand-blue/10 border border-brand-blue/20 text-brand-blue text-[9px] font-bold rounded-full uppercase tracking-wider">
                    {selectedPlatformObj.label}
                  </span>
                  <span className="text-[9px] text-slate-400 dark:text-[#555]">{selectedPlatformObj.size}px · {selectedPlatformObj.ratio}</span>
                </div>

                {result ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative group w-full"
                  >
                    <img src={result} alt="Generated banner" className="w-full rounded-2xl shadow-2xl border border-slate-200 dark:border-white/5" />
                    {/* Download & fullscreen overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 rounded-2xl transition-colors flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
                      <a href={result} download className="p-3 bg-white text-slate-900 rounded-xl shadow-lg hover:scale-105 transition-transform">
                        <Download size={18} />
                      </a>
                      <button onClick={() => window.open(result, '_blank')} className="p-3 bg-brand-blue text-white rounded-xl shadow-lg hover:scale-105 transition-transform">
                        <Maximize2 size={18} />
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <div className="w-full aspect-video rounded-2xl border-2 border-dashed border-slate-200 dark:border-white/10 flex flex-col items-center justify-center gap-4 opacity-40">
                    <Wand2 size={40} className="text-slate-400 dark:text-white/30" />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-white/30">Chọn platform và nhập mô tả để tạo banner</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default SocialBannerWorkspace;
