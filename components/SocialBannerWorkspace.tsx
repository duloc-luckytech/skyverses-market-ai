
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Zap, Download, Loader2, Plus, Upload,
  RefreshCw, Sparkles, Maximize2, Trash2,
  CheckCircle2, ChevronDown, Coins, AlertTriangle,
  MessageCircle, Store, Building, Shirt,
  GraduationCap, Heart, Coffee, Plane, Cpu,
  LayoutGrid, Image as ImageIcon, Wand2, History, Copy,
} from 'lucide-react';
import { generateDemoImage, generateDemoText } from '../services/gemini';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { Link } from 'react-router-dom';
import AISuggestPanel, { StylePreset } from './workspace/AISuggestPanel';
import { useImageModels } from '../hooks/useImageModels';
import { ModelEngineSettings } from './image-generator/ModelEngineSettings';

// ─── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'skyverses_SOCIAL-BANNER-AI_vault';


const PLATFORMS = [
  { id: 'fb-cover',   label: 'FB Cover',    platform: 'Facebook', size: '820×312',   ratio: '16:9'  },
  { id: 'fb-post',    label: 'FB Post',     platform: 'Facebook', size: '1200×630',  ratio: '16:9'  },
  { id: 'fb-story',   label: 'FB Story',    platform: 'Facebook', size: '1080×1920', ratio: '9:16'  },
  { id: 'x-header',   label: 'X Header',    platform: 'X',        size: '1500×500',  ratio: '3:1'   },
  { id: 'x-post',     label: 'X Post',      platform: 'X',        size: '1200×675',  ratio: '16:9'  },
  { id: 'ig-post',    label: 'IG Post',     platform: 'Instagram',size: '1080×1080', ratio: '1:1'   },
  { id: 'ig-story',   label: 'IG Story',    platform: 'Instagram',size: '1080×1920', ratio: '9:16'  },
];

const STYLES = ['Hiện đại', 'Luxury', 'Tối giản', 'Bold & Pop', 'Vintage', 'Cyberpunk'];

const BANNER_STYLES: StylePreset[] = [
  { id: 'modern',   label: 'Hiện đại',  emoji: '⚡', description: 'Clean, bold typography',  promptPrefix: 'modern clean minimalist design, bold typography, ' },
  { id: 'luxury',   label: 'Luxury',    emoji: '💎', description: 'Premium, gold accents',    promptPrefix: 'luxury premium gold accent design, elegant, ' },
  { id: 'minimal',  label: 'Tối giản',  emoji: '◻️', description: 'White space, elegant',    promptPrefix: 'ultra minimal white space design, clean lines, ' },
  { id: 'bold',     label: 'Bold & Pop',emoji: '🎨', description: 'Vibrant, eye-catching',    promptPrefix: 'bold vibrant pop art colors, high contrast, eye-catching, ' },
  { id: 'vintage',  label: 'Vintage',   emoji: '📷', description: 'Retro, warm tones',        promptPrefix: 'vintage retro warm tones, nostalgic aesthetic, ' },
  { id: 'cyber',    label: 'Cyberpunk', emoji: '🌐', description: 'Neon, futuristic',          promptPrefix: 'cyberpunk neon glow futuristic dark background, ' },
];

const FEATURED_TEMPLATES = [
  { label: 'Flash Sale 50%',     prompt: 'Banner Flash Sale giảm 50%, nền đỏ năng lượng, chữ trắng bold, countdown timer, hiệu ứng ánh sáng rực rỡ', style: 'Bold & Pop' },
  { label: 'Ra mắt sản phẩm',   prompt: 'Banner ra mắt sản phẩm mới, nền tối premium, hình sản phẩm làm hero center, ánh sáng studio spotlight', style: 'Luxury' },
  { label: 'Tuyển dụng nhân sự', prompt: 'Banner tuyển dụng chuyên nghiệp, gradient xanh dương, icon nhân sự, text tuyển dụng rõ ràng, CTA nổi bật', style: 'Hiện đại' },
  { label: 'Khai trương',        prompt: 'Banner khai trương cửa hàng, pháo hoa, màu vàng đỏ truyền thống Việt Nam, đèn lung linh festive', style: 'Bold & Pop' },
];

const INDUSTRIES = [
  { id: 'social',      label: 'MXH',        icon: MessageCircle },
  { id: 'restaurant',  label: 'Nhà hàng',   icon: Coffee        },
  { id: 'fashion',     label: 'Thời trang', icon: Shirt         },
  { id: 'realestate',  label: 'BĐS',        icon: Building      },
  { id: 'education',   label: 'Giáo dục',   icon: GraduationCap },
  { id: 'travel',      label: 'Du lịch',    icon: Plane         },
  { id: 'beauty',      label: 'Làm đẹp',    icon: Heart         },
  { id: 'tech',        label: 'Công nghệ',  icon: Cpu           },
  { id: 'retail',      label: 'Bán lẻ',     icon: Store         },
  { id: 'other',       label: 'Khác',       icon: LayoutGrid    },
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface BannerSession {
  id: string;
  url: string;
  prompt: string;
  config: {
    platformId: string;
    style: string;
    model: string;
  };
  timestamp: string;
}

// ─── Main Component ───────────────────────────────────────────────────────────

const SocialBannerWorkspace: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { theme } = useTheme();
  const { credits, useCredits, addCredits, isAuthenticated, login } = useAuth();
  const { showToast } = useToast();

  // UI state
  const [activePlatform, setActivePlatform] = useState(PLATFORMS[0].id);
  const [isGenerating, setIsGenerating]   = useState(false);
  const [isEnhancing, setIsEnhancing]     = useState(false);
  const [showAdvanced, setShowAdvanced]   = useState(false);
  const [status, setStatus]               = useState('Sẵn sàng');
  const [showLowCreditAlert, setShowLowCreditAlert] = useState(false);
  const [viewMode, setViewMode]           = useState<'current' | 'library'>('current');
  const [activeIndustry, setActiveIndustry] = useState('social');

  // Content state
  const [prompt, setPrompt]               = useState('');
  const [title, setTitle]                 = useState('');
  const [subtitle, setSubtitle]           = useState('');
  const [references, setReferences]       = useState<string[]>([]);
  const [result, setResult]               = useState<string | null>(null);

  // Config state — AI engine (live pricing API)
  const [imgEngine, setImgEngine] = useState('gommo');
  const imgModels = useImageModels(imgEngine);
  const {
    availableModels: imgAvailableModels,
    selectedModel: imgSelectedModel,
    setSelectedModel: setImgSelectedModel,
    selectedFamily: imgSelectedFamily,
    setSelectedFamily: setImgSelectedFamily,
    selectedMode: imgSelectedMode,
    setSelectedMode: setImgSelectedMode,
    selectedRes: imgSelectedRes,
    setSelectedRes: setImgSelectedRes,
    selectedRatio: imgSelectedRatio,
    setSelectedRatio: setImgSelectedRatio,
    familyList: imgFamilyList,
    familyModels: imgFamilyModels,
    familyModes: imgFamilyModes,
    familyResolutions: imgFamilyResolutions,
    familyRatios: imgFamilyRatios,
    selectedModelCost,
  } = imgModels;
  const [selectedStyle, setSelectedStyle]   = useState(STYLES[0]);
  const [quantity, setQuantity]             = useState(1);

  // Brand state
  const [brandColors, setBrandColors]     = useState(['#0090FF', '#6366F1']);
  const [hexInput, setHexInput]           = useState('#0090FF');
  const [useBrandColor, setUseBrandColor] = useState(true);
  const [addTextToBanner, setAddTextToBanner] = useState(true);

  // History
  const [sessions, setSessions] = useState<BannerSession[]>([]);

  const fileInputRef    = useRef<HTMLInputElement>(null);
  const colorPickerRef  = useRef<HTMLInputElement>(null);
  const abortRef        = useRef<AbortController | null>(null);
  const [editingColorIndex, setEditingColorIndex] = useState<number | null>(null);

  // Prompt history (W7)
  const [promptHistory, setPromptHistory]   = useState<string[]>([]);
  const [showHistory, setShowHistory]       = useState(false);

  // S1: Mobile bottom sheet
  const [showMobileSheet, setShowMobileSheet] = useState(false);

  // S2: AI Enhance diff preview
  const [enhancedPreview, setEnhancedPreview] = useState<string | null>(null);
  const [showEnhanceDiff, setShowEnhanceDiff] = useState(false);

  // Load history
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { setSessions(JSON.parse(saved)); } catch { /* ignore */ }
    }
    const savedPrompts = localStorage.getItem(STORAGE_KEY + '_prompts');
    if (savedPrompts) {
      try { setPromptHistory(JSON.parse(savedPrompts)); } catch { /* ignore */ }
    }
  }, []);

  const currentPlatform = PLATFORMS.find(p => p.id === activePlatform) ?? PLATFORMS[0];
  const activeIndustryLabel = INDUSTRIES.find(i => i.id === activeIndustry)?.label ?? '';

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleEnhance = async () => {
    if (!prompt.trim() || isEnhancing) return;
    setIsEnhancing(true);
    setStatus('Đang tối ưu prompt...');
    setShowEnhanceDiff(false);
    setEnhancedPreview(null);
    try {
      const system = 'Bạn là chuyên gia thiết kế banner mạng xã hội. Viết lại prompt sau thành mô tả chi tiết cho AI tạo banner: bố cục, màu sắc, font chữ, hiệu ứng ánh sáng. Ngắn gọn, tiếng Việt.';
      const enhanced = await generateDemoText(`${system}\n\nPrompt gốc: "${prompt}"`);
      if (enhanced && !enhanced.includes('CONNECTION_TERMINATED')) {
        setEnhancedPreview(enhanced);
        setShowEnhanceDiff(true);
        setStatus('Xem trước prompt mới →');
      }
    } catch { /* ignore */ } finally {
      setIsEnhancing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const remaining = 6 - references.length;
    Array.from(files).slice(0, remaining).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => setReferences(prev => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const handleColorBlockClick = (index: number) => {
    setEditingColorIndex(index);
    if (colorPickerRef.current) {
      colorPickerRef.current.value = brandColors[index];
      colorPickerRef.current.click();
    }
  };

  const onColorPickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editingColorIndex !== null) {
      const updated = [...brandColors];
      updated[editingColorIndex] = e.target.value;
      setBrandColors(updated);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;
    if (!isAuthenticated) { login(); return; }
    const totalCost = selectedModelCost * quantity;
    if (credits < totalCost) { setShowLowCreditAlert(true); return; }

    const controller = new AbortController();
    abortRef.current = controller;

    setIsGenerating(true);
    setStatus('Đang kết nối AI...');
    try {
      const industryCtx  = activeIndustryLabel ? `[Lĩnh vực: ${activeIndustryLabel}] ` : '';
      const platformCtx  = `Platform: ${currentPlatform.platform} ${currentPlatform.label} (${currentPlatform.size}, tỷ lệ ${currentPlatform.ratio}).`;
      const colorCtx     = useBrandColor ? `Màu thương hiệu: ${brandColors.join(', ')}.` : '';
      const textCtx      = addTextToBanner && title ? `Tiêu đề chính: "${title}". Tiêu đề phụ: "${subtitle}".` : '';
      const stylePreset  = BANNER_STYLES.find(s => s.label === selectedStyle);
      const stylePrefix  = stylePreset?.promptPrefix ?? '';

      const finalPrompt = `${industryCtx}${stylePrefix}Tạo banner mạng xã hội chuyên nghiệp. ${platformCtx} Phong cách: ${selectedStyle}. ${colorCtx} ${textCtx} Mô tả: ${prompt}. Chất lượng ${imgSelectedRes || '2k'}, bố cục tối ưu cho ${currentPlatform.platform}.`;

      setStatus('AI đang tạo banner...');
      const imageUrl = await generateDemoImage(finalPrompt, references);

      if (controller.signal.aborted) return;

      if (imageUrl) {
        // Deduct credits AFTER successful generation
        useCredits(totalCost);

        setResult(imageUrl);
        const newSession: BannerSession = {
          id: Date.now().toString(),
          url: imageUrl,
          prompt,
          config: { platformId: activePlatform, style: selectedStyle, model: imgSelectedModel?.name || imgSelectedModel?.raw?.name || '' },
          timestamp: new Date().toLocaleString('vi-VN'),
        };
        const updated = [newSession, ...sessions];
        setSessions(updated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

        // Save prompt to history (max 10)
        const newHistory = [prompt, ...promptHistory.filter(p => p !== prompt)].slice(0, 10);
        setPromptHistory(newHistory);
        localStorage.setItem(STORAGE_KEY + '_prompts', JSON.stringify(newHistory));

        setStatus('Hoàn tất ✓');
        showToast('Banner đã được tạo thành công!', 'success');
      } else {
        setStatus('Lỗi tạo banner');
        showToast('Không tạo được banner — credits chưa bị trừ, thử lại nhé!', 'warning');
      }
    } catch (err) {
      if (controller.signal.aborted) return;
      setStatus('Lỗi hệ thống');
      showToast('Lỗi hệ thống — credits chưa bị trừ, thử lại sau.', 'error');
    } finally {
      if (!controller.signal.aborted) {
        setIsGenerating(false);
      }
      abortRef.current = null;
    }
  };

  const deleteSession = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = sessions.filter(s => s.id !== id);
    setSessions(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="h-full w-full flex flex-col bg-[#f4f7f9] dark:bg-[#050505] text-slate-900 dark:text-white font-sans overflow-hidden relative transition-colors duration-500">

      {/* ── TOP NAV ── */}
      <div className="h-14 bg-white dark:bg-[#0a0a0a] border-b border-slate-200 dark:border-white/5 flex items-center justify-between px-6 shrink-0 z-[100] transition-colors">
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 p-1 rounded-full border border-slate-200 dark:border-white/10">
          {(['current', 'library'] as const).map(m => (
            <button
              key={m}
              onClick={() => setViewMode(m)}
              className={`px-5 py-1.5 text-[11px] font-bold rounded-full transition-all ${viewMode === m ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
            >
              {m === 'current' ? 'Phiên hiện tại' : `Thư viện (${sessions.length})`}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          {/* S1: Mobile sheet trigger */}
          <button
            onClick={() => setShowMobileSheet(true)}
            className="md:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-blue/10 border border-brand-blue/20 text-brand-blue text-[10px] font-bold"
          >
            <Sparkles size={12} /> Cài đặt
          </button>
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

        {/* ── SIDEBAR — hidden on mobile (uses bottom sheet instead) ── */}
        <div className="hidden md:flex w-[380px] shrink-0 bg-white dark:bg-[#0d0d0f] border-r border-slate-200 dark:border-white/5 flex-col overflow-y-auto transition-colors">
          <div className="p-4 space-y-4 flex-grow">

            {/* Platform Picker */}
            <div>
              <p className="text-[9px] font-semibold uppercase text-slate-400 dark:text-[#555] mb-2 tracking-widest">Nền tảng & Format</p>
              <div className="grid grid-cols-2 gap-1.5">
                {PLATFORMS.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setActivePlatform(p.id)}
                    className={`flex flex-col items-start p-2.5 rounded-xl text-left border transition-all ${
                      activePlatform === p.id
                        ? 'bg-brand-blue text-white border-brand-blue shadow-sm shadow-brand-blue/20'
                        : 'bg-black/[0.02] dark:bg-white/[0.02] border-black/[0.05] dark:border-white/[0.05] text-slate-500 dark:text-[#666] hover:border-brand-blue/30 hover:text-brand-blue'
                    }`}
                  >
                    <span className={`text-[10px] font-bold ${activePlatform === p.id ? 'text-white/70' : 'text-slate-400'}`}>{p.platform}</span>
                    <span className="text-[11px] font-semibold">{p.label}</span>
                    <span className={`text-[9px] mt-0.5 ${activePlatform === p.id ? 'text-white/60' : 'text-slate-400'}`}>{p.size}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Industry Picker */}
            <div>
              <p className="text-[9px] font-semibold uppercase text-slate-400 dark:text-[#555] mb-2 tracking-widest">Lĩnh vực</p>
              <div className="flex flex-wrap gap-1.5">
                {INDUSTRIES.map(ind => {
                  const Icon = ind.icon;
                  const isActive = activeIndustry === ind.id;
                  return (
                    <button
                      key={ind.id}
                      onClick={() => setActiveIndustry(ind.id)}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-medium border transition-all ${
                        isActive
                          ? 'bg-brand-blue text-white border-brand-blue shadow-sm shadow-brand-blue/20'
                          : 'bg-black/[0.02] dark:bg-white/[0.02] border-black/[0.05] dark:border-white/[0.05] text-slate-500 dark:text-[#666] hover:border-brand-blue/30 hover:text-brand-blue'
                      }`}
                    >
                      <Icon size={11} />
                      {ind.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* AI Suggest Panel */}
            <AISuggestPanel
              productSlug="social-banner-ai"
              productName="Social Banner AI"
              styles={BANNER_STYLES}
              onPromptSelect={(p) => setPrompt(prev => p + (prev ? '\n' + prev : ''))}
              onApply={(cfg) => {
                if (cfg.prompt) setPrompt(cfg.prompt);
                if (cfg.style && BANNER_STYLES.find(s => s.label === cfg.style)) setSelectedStyle(cfg.style);
                if (cfg.format) setActivePlatform(PLATFORMS.find(p => p.label === cfg.format)?.id ?? activePlatform);
              }}
              historyKey={STORAGE_KEY}
              featuredTemplates={FEATURED_TEMPLATES}
              productContext={`Social Banner AI tool for creating ${currentPlatform.platform} ${currentPlatform.label} banners for ${activeIndustryLabel || 'general'} industry in Vietnam`}
            />

            {/* Prompt textarea */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[9px] font-semibold uppercase text-slate-400 dark:text-[#555] tracking-widest">Mô tả Banner</p>
                {promptHistory.length > 0 && (
                  <div className="relative">
                    <button
                      onClick={() => setShowHistory(v => !v)}
                      className="flex items-center gap-1 text-[9px] font-semibold text-slate-400 dark:text-[#555] hover:text-brand-blue transition-colors"
                    >
                      <History size={10} /> Lịch sử ({promptHistory.length})
                    </button>
                    <AnimatePresence>
                      {showHistory && (
                        <motion.div
                          initial={{ opacity: 0, y: -4, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -4, scale: 0.97 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 top-5 z-50 w-72 bg-white dark:bg-[#111113] border border-black/[0.08] dark:border-white/[0.08] rounded-xl shadow-2xl overflow-hidden"
                        >
                          <div className="p-2 border-b border-black/[0.05] dark:border-white/[0.05]">
                            <p className="text-[9px] font-bold uppercase text-slate-400 tracking-widest px-1">10 Prompts gần nhất</p>
                          </div>
                          <div className="max-h-52 overflow-y-auto">
                            {promptHistory.map((p, i) => (
                              <button
                                key={i}
                                onClick={() => { setPrompt(p); setShowHistory(false); }}
                                className="w-full text-left px-3 py-2.5 text-[11px] text-slate-700 dark:text-white/70 hover:bg-brand-blue/[0.06] hover:text-brand-blue transition-colors line-clamp-2 border-b border-black/[0.03] dark:border-white/[0.03] last:border-0"
                              >
                                {p}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
              <textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                onKeyDown={e => {
                  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                    e.preventDefault();
                    handleGenerate();
                  }
                  if (e.key === 'ArrowUp' && !prompt.trim()) {
                    e.preventDefault();
                    const hist = (() => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY + '_prompts') || '[]'); } catch { return []; } })();
                    if (hist[0]) setPrompt(hist[0]);
                  }
                }}
                placeholder={`Mô tả banner ${currentPlatform.label} bạn muốn tạo...`}
                rows={4}
                className="w-full text-[12px] bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] rounded-xl px-3 py-2.5 resize-none text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-[#444] focus:outline-none focus:border-brand-blue/50 transition-colors"
              />
              <button
                onClick={handleEnhance}
                disabled={isEnhancing || !prompt.trim()}
                className="mt-1.5 flex items-center gap-1.5 text-[10px] font-semibold text-brand-blue hover:opacity-80 disabled:opacity-30 transition-opacity"
              >
                {isEnhancing ? <Loader2 size={11} className="animate-spin" /> : <Wand2 size={11} />}
                AI Boost Prompt
              </button>

              {/* S2: Enhance diff preview */}
              <AnimatePresence>
                {showEnhanceDiff && enhancedPreview && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.22 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-2 rounded-xl border border-brand-blue/25 bg-brand-blue/[0.03] overflow-hidden">
                      <div className="flex items-center justify-between px-3 py-1.5 border-b border-brand-blue/15 bg-brand-blue/[0.04]">
                        <span className="text-[9px] font-bold text-brand-blue uppercase tracking-wider flex items-center gap-1">
                          <Wand2 size={9} /> Prompt đã được tối ưu
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => { setPrompt(enhancedPreview); setShowEnhanceDiff(false); setEnhancedPreview(null); setStatus('Đã áp dụng prompt mới'); showToast('Prompt đã được cập nhật!', 'success'); }}
                            className="text-[9px] font-bold text-emerald-500 hover:text-emerald-600 transition-colors"
                          >
                            ✓ Áp dụng
                          </button>
                          <button
                            onClick={() => { setShowEnhanceDiff(false); setEnhancedPreview(null); setStatus('Sẵn sàng'); }}
                            className="text-[9px] text-slate-400 hover:text-red-400 transition-colors"
                          >
                            ✕ Bỏ
                          </button>
                        </div>
                      </div>
                      {/* Before */}
                      <div className="px-3 py-2 border-b border-dashed border-brand-blue/10">
                        <p className="text-[8px] font-bold text-slate-400 uppercase mb-1">Trước</p>
                        <p className="text-[10px] text-slate-500 dark:text-[#888] line-clamp-2 leading-relaxed">{prompt}</p>
                      </div>
                      {/* After */}
                      <div className="px-3 py-2">
                        <p className="text-[8px] font-bold text-brand-blue uppercase mb-1">Sau</p>
                        <p className="text-[10px] text-slate-700 dark:text-white/80 line-clamp-4 leading-relaxed">{enhancedPreview}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Title / Subtitle */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[9px] font-semibold uppercase text-slate-400 dark:text-[#555] tracking-widest">Text trên Banner</p>
                <button
                  onClick={() => setAddTextToBanner(v => !v)}
                  className={`w-8 h-4 rounded-full transition-colors ${addTextToBanner ? 'bg-brand-blue' : 'bg-slate-300 dark:bg-white/10'}`}
                >
                  <div className={`w-3 h-3 bg-white rounded-full mx-0.5 transition-transform ${addTextToBanner ? 'translate-x-4' : ''}`} />
                </button>
              </div>
              {addTextToBanner && (
                <div className="space-y-1.5">
                  <input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Tiêu đề chính (VD: SALE 50%)"
                    className="w-full text-[12px] bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] rounded-xl px-3 py-2 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-[#444] focus:outline-none focus:border-brand-blue/50 transition-colors"
                  />
                  <input
                    value={subtitle}
                    onChange={e => setSubtitle(e.target.value)}
                    placeholder="Tiêu đề phụ (VD: Chỉ hôm nay)"
                    className="w-full text-[12px] bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] rounded-xl px-3 py-2 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-[#444] focus:outline-none focus:border-brand-blue/50 transition-colors"
                  />
                </div>
              )}
            </div>

            {/* Reference images */}
            <div>
              <p className="text-[9px] font-semibold uppercase text-slate-400 dark:text-[#555] mb-2 tracking-widest">Ảnh tham chiếu ({references.length}/6)</p>
              <div className="grid grid-cols-3 gap-1.5">
                {references.map((ref, i) => (
                  <div key={i} className="aspect-square rounded-lg overflow-hidden relative group bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5">
                    <img src={ref} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => setReferences(prev => prev.filter((_, idx) => idx !== i))}
                      className="absolute top-1 right-1 p-0.5 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
                {references.length < 6 && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-lg border border-dashed border-slate-300 dark:border-white/10 flex items-center justify-center hover:border-brand-blue/40 transition-colors text-slate-400 dark:text-[#555]"
                  >
                    <Plus size={16} />
                  </button>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileUpload} />
            </div>

            {/* Phong cách banner (banner-specific, kept separate) */}
            <div>
              <p className="text-[9px] font-semibold uppercase text-slate-400 dark:text-[#555] mb-1.5 tracking-widest">Phong cách</p>
              <div className="flex flex-wrap gap-1.5">
                {STYLES.map(s => (
                  <button
                    key={s}
                    onClick={() => setSelectedStyle(s)}
                    className={`px-2.5 py-1.5 rounded-lg text-[10px] font-semibold border transition-all ${
                      selectedStyle === s
                        ? 'bg-brand-blue text-white border-brand-blue shadow-sm'
                        : 'bg-black/[0.02] dark:bg-white/[0.02] border-black/[0.05] dark:border-white/[0.05] text-slate-500 dark:text-[#666] hover:border-brand-blue/30 hover:text-brand-blue'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Cấu hình AI — shared ModelEngineSettings */}
            <ModelEngineSettings
              availableModels={imgAvailableModels}
              selectedModel={imgSelectedModel}
              setSelectedModel={setImgSelectedModel}
              selectedRatio={imgSelectedRatio}
              setSelectedRatio={setImgSelectedRatio}
              selectedRes={imgSelectedRes}
              setSelectedRes={setImgSelectedRes}
              quantity={quantity}
              setQuantity={setQuantity}
              selectedMode={imgSelectedMode}
              setSelectedMode={setImgSelectedMode}
              selectedEngine={imgEngine}
              onSelectEngine={setImgEngine}
              activeMode="SINGLE"
              isGenerating={isGenerating}
              familyList={imgFamilyList}
              selectedFamily={imgSelectedFamily}
              setSelectedFamily={setImgSelectedFamily}
              familyModels={imgFamilyModels.map(m => m.raw || m)}
              familyModes={imgFamilyModes}
              familyRatios={imgFamilyRatios}
              familyResolutions={imgFamilyResolutions}
            />

            {/* Advanced (collapsible) */}
            <div>
              <button
                onClick={() => setShowAdvanced(v => !v)}
                className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 dark:text-[#555] hover:text-brand-blue transition-colors"
              >
                <ChevronDown size={12} className={`transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
                Nâng cao
              </button>
              <AnimatePresence>
                {showAdvanced && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden mt-3 space-y-3"
                  >
                    {/* Brand colors */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-[9px] font-semibold uppercase text-slate-400 dark:text-[#555] tracking-widest">Màu thương hiệu</p>
                        <button
                          onClick={() => setUseBrandColor(v => !v)}
                          className={`w-8 h-4 rounded-full transition-colors ${useBrandColor ? 'bg-brand-blue' : 'bg-slate-300 dark:bg-white/10'}`}
                        >
                          <div className={`w-3 h-3 bg-white rounded-full mx-0.5 transition-transform ${useBrandColor ? 'translate-x-4' : ''}`} />
                        </button>
                      </div>
                      {useBrandColor && (
                        <div className="flex flex-wrap gap-1.5 items-center">
                          {brandColors.map((c, i) => (
                            <button
                              key={i}
                              onClick={() => handleColorBlockClick(i)}
                              className="w-7 h-7 rounded-lg border-2 border-white dark:border-white/10 shadow-sm hover:scale-110 transition-transform"
                              style={{ backgroundColor: c }}
                            />
                          ))}
                          <div className="flex items-center gap-1">
                            <input
                              value={hexInput}
                              onChange={e => setHexInput(e.target.value)}
                              placeholder="#HEX"
                              className="w-20 text-[10px] bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] rounded-lg px-2 py-1 text-slate-700 dark:text-white focus:outline-none focus:border-brand-blue/50"
                            />
                            <button
                              onClick={() => { if (brandColors.length < 8) setBrandColors([...brandColors, hexInput]); }}
                              className="p-1 rounded-lg bg-brand-blue/10 text-brand-blue hover:bg-brand-blue/20 transition-colors"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                          <input ref={colorPickerRef} type="color" className="hidden" onChange={onColorPickerChange} />
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Generate button */}
          <div className="p-4 border-t border-slate-100 dark:border-white/5 bg-white dark:bg-[#0d0d0f] shrink-0 space-y-2">
            <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-[#555]">
              <div className="flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${isGenerating ? 'bg-brand-blue animate-pulse' : 'bg-emerald-400'}`} />
                {status}
              </div>
              <div className="flex items-center gap-2">
                {isGenerating && (
                  <button
                    onClick={() => {
                      abortRef.current?.abort();
                      setIsGenerating(false);
                      setStatus('Đã hủy');
                    }}
                    className="text-[10px] text-red-400 hover:text-red-500 font-semibold flex items-center gap-1 transition-colors"
                  >
                    <X size={11} /> Hủy
                  </button>
                )}
                <span className="font-semibold text-brand-blue">{selectedModelCost * quantity} CR / lần</span>
              </div>
            </div>
            <motion.button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-blue to-blue-500 text-white text-[12px] font-bold uppercase tracking-widest shadow-lg shadow-brand-blue/20 hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {isGenerating
                ? <><Loader2 size={14} className="animate-spin" /> Đang tạo...</>
                : <><Sparkles size={14} /> Tạo Banner <kbd className="ml-1 text-[9px] font-mono bg-white/20 px-1.5 py-0.5 rounded opacity-70 normal-case tracking-normal">⌘↵</kbd></>
              }
            </motion.button>
          </div>
        </div>

        {/* ── MAIN VIEWPORT ── */}
        <div className="flex-1 flex flex-col bg-[#f0f2f5] dark:bg-[#060608] overflow-hidden">

          {viewMode === 'current' ? (
            <div className="flex-1 flex items-center justify-center p-8">
              {result ? (
                <div className="relative group max-w-2xl w-full">
                  <img
                    src={result}
                    alt="Generated banner"
                    className="w-full rounded-2xl shadow-2xl border border-black/[0.06] dark:border-white/[0.04]"
                  />
                  {/* Overlay actions */}
                  <div className="absolute inset-0 rounded-2xl bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
                    <a href={result} download="banner.png" className="p-3 rounded-xl bg-white/90 text-slate-900 hover:bg-white transition-colors shadow-lg" title="Tải xuống">
                      <Download size={18} />
                    </a>
                    <button onClick={() => window.open(result, '_blank')} className="p-3 rounded-xl bg-white/90 text-slate-900 hover:bg-white transition-colors shadow-lg" title="Xem toàn màn hình">
                      <Maximize2 size={18} />
                    </button>
                    <button
                      onClick={() => { navigator.clipboard.writeText(result ?? ''); showToast('Đã copy URL ảnh!', 'success'); }}
                      className="p-3 rounded-xl bg-white/90 text-slate-900 hover:bg-white transition-colors shadow-lg"
                      title="Copy URL"
                    >
                      <Copy size={18} />
                    </button>
                    <button onClick={handleGenerate} className="p-3 rounded-xl bg-white/90 text-slate-900 hover:bg-white transition-colors shadow-lg" title="Tạo lại">
                      <RefreshCw size={18} />
                    </button>
                  </div>
                  {/* Platform label */}
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-brand-blue/90 backdrop-blur-sm text-white text-[10px] font-bold">
                    {currentPlatform.platform} {currentPlatform.label} · {currentPlatform.size}
                  </div>
                </div>
              ) : isGenerating ? (
                /* ── Skeleton loading — 2×2 shimmer grid ── */
                <div className="w-full max-w-2xl space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    {[1, 2, 3, 4].map(i => (
                      <div
                        key={i}
                        className="aspect-video rounded-2xl bg-slate-200 dark:bg-white/[0.04] animate-pulse overflow-hidden relative"
                        style={{ animationDelay: `${i * 0.1}s` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 dark:via-white/[0.05] to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
                      </div>
                    ))}
                  </div>
                  <p className="text-center text-[11px] text-slate-400 dark:text-[#555] animate-pulse">
                    AI đang tạo banner · thường mất 10–30 giây...
                  </p>
                </div>
              ) : (
                /* ── Empty state — starter prompt cards ── */
                <div className="flex flex-col items-center justify-center gap-6 text-center w-full max-w-md">
                  <div>
                    <p className="text-sm font-semibold text-slate-400 dark:text-[#555]">Bắt đầu với một gợi ý</p>
                    <p className="text-[11px] text-slate-300 dark:text-[#444] mt-1">Nhấn vào mẫu bên dưới hoặc nhập mô tả của bạn</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5 w-full">
                    {[
                      { emoji: '🔥', label: 'Flash Sale', prompt: 'Banner Flash Sale giảm 50%, nền đỏ rực rỡ năng lượng, chữ trắng bold cỡ lớn, hiệu ứng ánh sáng rực rỡ, countdown timer nhỏ góc dưới' },
                      { emoji: '🎉', label: 'Khai trương', prompt: 'Banner khai trương cửa hàng, pháo hoa vàng đỏ truyền thống Việt Nam, đèn lung linh festive, màu vàng và đỏ nổi bật, chữ "KHAI TRƯƠNG" to và trang trọng' },
                      { emoji: '💼', label: 'Tuyển dụng', prompt: 'Banner tuyển dụng nhân sự chuyên nghiệp, gradient xanh dương sang tối, icon nhân sự, text tuyển dụng rõ ràng, CTA "NỘP ĐƠN NGAY" nổi bật' },
                      { emoji: '🌟', label: 'Ra mắt SP', prompt: 'Banner ra mắt sản phẩm mới cao cấp, nền tối premium, hình sản phẩm làm hero center, ánh sáng studio spotlight trắng, text "NEW ARRIVAL" tinh tế' },
                    ].map(sp => (
                      <button
                        key={sp.label}
                        onClick={() => setPrompt(sp.prompt)}
                        className="p-3.5 rounded-xl border border-black/[0.06] dark:border-white/[0.06] bg-white dark:bg-white/[0.02] text-left hover:border-brand-blue/40 hover:bg-brand-blue/[0.02] transition-all group"
                      >
                        <span className="text-xl">{sp.emoji}</span>
                        <p className="text-[11px] font-semibold text-slate-700 dark:text-white/70 mt-1.5 group-hover:text-brand-blue transition-colors">{sp.label}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Library grid */
            <div className="flex-1 overflow-y-auto p-6">
              {sessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                  <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                    <ImageIcon size={24} className="text-slate-300 dark:text-[#444]" />
                  </div>
                  <p className="text-sm text-slate-400 dark:text-[#555]">Thư viện trống — tạo banner đầu tiên!</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {sessions.map(session => (
                    <div
                      key={session.id}
                      onClick={() => { setResult(session.url); setViewMode('current'); }}
                      className="group relative rounded-xl overflow-hidden border border-black/[0.06] dark:border-white/[0.04] bg-white dark:bg-[#0d0d0f] cursor-pointer hover:border-brand-blue/30 transition-all hover:-translate-y-0.5"
                    >
                      <div className="aspect-video overflow-hidden">
                        <img src={session.url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                      <div className="p-3">
                        <p className="text-[11px] font-medium text-slate-700 dark:text-white/70 line-clamp-2">{session.prompt}</p>
                        <p className="text-[9px] text-slate-400 dark:text-[#555] mt-1">{session.timestamp}</p>
                      </div>
                      <button
                        onClick={(e) => deleteSession(e, session.id)}
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Low Credit Alert ── */}
      <AnimatePresence>
        {showLowCreditAlert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
            onClick={() => setShowLowCreditAlert(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-white dark:bg-[#0f0f11] rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-black/[0.06] dark:border-white/[0.06] text-center"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={24} className="text-amber-500" />
              </div>
              <h3 className="font-bold text-lg mb-2">Không đủ Credits</h3>
              <p className="text-sm text-slate-500 dark:text-[#666] mb-4">
                Bạn cần <strong className="text-brand-blue">{selectedModelCost * quantity} CR</strong> để tạo banner này.<br />
                Số dư hiện tại: <strong>{credits.toLocaleString()} CR</strong>
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLowCreditAlert(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-sm font-medium hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                >
                  Hủy
                </button>
                <Link
                  to="/credits"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl bg-brand-blue text-white text-sm font-bold text-center hover:brightness-110 transition-all"
                >
                  Nạp Credits
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* ── S1: MOBILE BOTTOM SHEET ── */}
        {showMobileSheet && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden absolute inset-0 z-[300] bg-black/50 backdrop-blur-sm"
            onClick={() => setShowMobileSheet(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              className="absolute bottom-0 left-0 right-0 bg-white dark:bg-[#0d0d0f] rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col"
            >
              {/* Sheet handle */}
              <div className="flex items-center justify-between px-5 pt-4 pb-2 shrink-0">
                <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-white/20 mx-auto absolute left-1/2 -translate-x-1/2 top-3" />
                <p className="text-[12px] font-bold text-slate-700 dark:text-white/80">Cài đặt Banner</p>
                <button onClick={() => setShowMobileSheet(false)} className="p-1.5 text-slate-400 hover:text-red-400 transition-colors">
                  <X size={16} />
                </button>
              </div>

              {/* Sheet body — scrollable */}
              <div className="overflow-y-auto flex-1 px-4 pb-4 space-y-4">

                {/* Platform */}
                <div>
                  <p className="text-[9px] font-semibold uppercase text-slate-400 dark:text-[#555] mb-2 tracking-widest">Nền tảng</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {PLATFORMS.map(p => (
                      <button
                        key={p.id}
                        onClick={() => setActivePlatform(p.id)}
                        className={`flex items-center gap-2 p-2.5 rounded-xl text-left border transition-all ${
                          activePlatform === p.id
                            ? 'bg-brand-blue text-white border-brand-blue'
                            : 'border-slate-200 dark:border-white/[0.06] text-slate-500 hover:border-brand-blue/30'
                        }`}
                      >
                        <span className="text-[11px] font-semibold">{p.label}</span>
                        <span className={`text-[9px] ml-auto ${activePlatform === p.id ? 'text-white/60' : 'text-slate-400'}`}>{p.size}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Industry */}
                <div>
                  <p className="text-[9px] font-semibold uppercase text-slate-400 dark:text-[#555] mb-2 tracking-widest">Lĩnh vực</p>
                  <div className="flex flex-wrap gap-1.5">
                    {INDUSTRIES.map(ind => {
                      const Icon = ind.icon;
                      return (
                        <button
                          key={ind.id}
                          onClick={() => setActiveIndustry(ind.id)}
                          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-medium border transition-all ${
                            activeIndustry === ind.id
                              ? 'bg-brand-blue text-white border-brand-blue'
                              : 'border-slate-200 dark:border-white/[0.06] text-slate-500 hover:border-brand-blue/30'
                          }`}
                        >
                          <Icon size={11} /> {ind.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Phong cách */}
                <div>
                  <p className="text-[9px] font-semibold uppercase text-slate-400 dark:text-[#555] mb-1.5 tracking-widest">Phong cách</p>
                  <select value={selectedStyle} onChange={e => setSelectedStyle(e.target.value)}
                    className="w-full text-[11px] bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] rounded-xl px-3 py-2 text-slate-700 dark:text-white focus:outline-none">
                    {STYLES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>

                {/* Cấu hình AI — shared ModelEngineSettings */}
                <ModelEngineSettings
                  availableModels={imgAvailableModels}
                  selectedModel={imgSelectedModel}
                  setSelectedModel={setImgSelectedModel}
                  selectedRatio={imgSelectedRatio}
                  setSelectedRatio={setImgSelectedRatio}
                  selectedRes={imgSelectedRes}
                  setSelectedRes={setImgSelectedRes}
                  quantity={quantity}
                  setQuantity={setQuantity}
                  selectedMode={imgSelectedMode}
                  setSelectedMode={setImgSelectedMode}
                  selectedEngine={imgEngine}
                  onSelectEngine={setImgEngine}
                  activeMode="SINGLE"
                  isGenerating={isGenerating}
                  familyList={imgFamilyList}
                  selectedFamily={imgSelectedFamily}
                  setSelectedFamily={setImgSelectedFamily}
                  familyModels={imgFamilyModels.map(m => m.raw || m)}
                  familyModes={imgFamilyModes}
                  familyRatios={imgFamilyRatios}
                  familyResolutions={imgFamilyResolutions}
                />


              </div>

              {/* Sheet footer CTA */}
              <div className="shrink-0 p-4 border-t border-slate-100 dark:border-white/5">
                <motion.button
                  onClick={() => { setShowMobileSheet(false); handleGenerate(); }}
                  disabled={isGenerating || !prompt.trim()}
                  whileTap={{ scale: 0.97 }}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-blue to-blue-500 text-white text-[12px] font-bold uppercase tracking-widest shadow-lg shadow-brand-blue/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Sparkles size={14} /> Tạo Banner — {selectedModelCost * quantity} CR
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SocialBannerWorkspace;
