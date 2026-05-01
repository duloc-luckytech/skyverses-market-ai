
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Loader2, Plus,
  Sparkles, Trash2,
  ChevronDown, ChevronRight, Coins,
  MessageCircle, Store, Building, Shirt,
  GraduationCap, Heart, Coffee, Plane, Cpu,
  LayoutGrid, Image as ImageIcon, Wand2, History,
  Maximize2, Download, RefreshCw, Bot,
  Upload, Hash, Copy, Check, Layers as LayersIcon,
} from 'lucide-react';
import { aiTextViaProxy } from '../apis/aiCommon';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import AISuggestPanel, { StylePreset } from './workspace/AISuggestPanel';
import { useImageGenerator } from '../hooks/useImageGenerator';
import { ModelEngineSettings } from './image-generator/ModelEngineSettings';
import { ImageJobCard } from '../components/shared/ImageJobCard';
import ResourceAuthModal from './common/ResourceAuthModal';

// ─── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'skyverses_SOCIAL-BANNER-AI_vault';
const BRAND_KIT_STORAGE_KEY = 'skyverses_banner_brand_kit'; // lưu brand colors + title/subtitle/logo

interface BrandKit {
  brandName?: string;
  tagline?: string;
  logoUrl?: string;
  colors: string[];
}

// Platform list — label bỏ prefix vì card đã render platform name riêng phía trên (rõ ràng hơn).
// 'X' đổi thành 'X (Twitter)' để user Việt nhận ra ngay (X rebrand từ Twitter 2023).
const PLATFORMS = [
  { id: 'fb-cover',   label: 'Ảnh bìa',     platform: 'Facebook',     size: '820×312',   ratio: '16:9'  },
  { id: 'fb-post',    label: 'Bài đăng',    platform: 'Facebook',     size: '1200×630',  ratio: '16:9'  },
  { id: 'fb-story',   label: 'Story',       platform: 'Facebook',     size: '1080×1920', ratio: '9:16'  },
  { id: 'x-header',   label: 'Banner',      platform: 'X (Twitter)',  size: '1500×500',  ratio: '3:1'   },
  { id: 'x-post',     label: 'Bài đăng',    platform: 'X (Twitter)',  size: '1200×675',  ratio: '16:9'  },
  { id: 'ig-post',    label: 'Bài đăng',    platform: 'Instagram',    size: '1080×1080', ratio: '1:1'   },
  { id: 'ig-story',   label: 'Story',       platform: 'Instagram',    size: '1080×1920', ratio: '9:16'  },
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

// 12 templates marketing-focused cho user Việt Nam — bao quát các use case phổ biến nhất
// (sale, ra mắt, tuyển dụng, sự kiện, lễ hội, webinar, app launch, voucher, before/after).
const FEATURED_TEMPLATES = [
  { label: 'Flash Sale 50%',     prompt: 'Banner Flash Sale giảm 50%, nền đỏ năng lượng, chữ trắng bold, countdown timer, hiệu ứng ánh sáng rực rỡ', style: 'Bold & Pop' },
  { label: 'Ra mắt sản phẩm',    prompt: 'Banner ra mắt sản phẩm mới, nền tối premium, hình sản phẩm làm hero center, ánh sáng studio spotlight', style: 'Luxury' },
  { label: 'Tuyển dụng',          prompt: 'Banner tuyển dụng chuyên nghiệp, gradient xanh dương, icon nhân sự, text tuyển dụng rõ ràng, CTA nổi bật', style: 'Hiện đại' },
  { label: 'Khai trương',         prompt: 'Banner khai trương cửa hàng, pháo hoa, màu vàng đỏ truyền thống Việt Nam, đèn lung linh festive', style: 'Bold & Pop' },
  { label: 'Sự kiện / Workshop',  prompt: 'Banner sự kiện workshop chuyên nghiệp, gradient tím xanh, ngày giờ địa điểm rõ ràng, icon speaker, badge LIVE', style: 'Hiện đại' },
  { label: 'Voucher / Quà tặng',  prompt: 'Banner voucher quà tặng hấp dẫn, nền vàng cam, icon quà tặng, badge "FREE" nổi bật, ribbon trang trí', style: 'Bold & Pop' },
  { label: 'Black Friday',        prompt: 'Banner Black Friday giảm sốc, nền đen sang trọng, chữ vàng kim, badge -70%, neon glow accent', style: 'Luxury' },
  { label: 'Tết / Lễ hội',        prompt: 'Banner Tết Nguyên Đán, hoa mai hoa đào, màu đỏ vàng truyền thống, lì xì, đèn lồng, không khí Tết Việt', style: 'Vintage' },
  { label: 'Webinar / Livestream',prompt: 'Banner webinar livestream, nền tối với gradient brand-blue, icon mic camera, badge LIVE đỏ nhấp nháy, info diễn giả', style: 'Hiện đại' },
  { label: 'Tải app',             prompt: 'Banner mời tải app, mockup điện thoại 3D nghiêng, badge App Store và Google Play, gradient brand color, CTA nổi bật', style: 'Hiện đại' },
  { label: 'Thông báo',           prompt: 'Banner thông báo quan trọng, layout tối giản clean, icon megaphone, viền màu nhấn, text rõ ràng dễ đọc', style: 'Tối giản' },
  { label: 'Trước & Sau',          prompt: 'Banner so sánh trước và sau (before/after), split layout đối xứng, label "TRƯỚC" và "SAU" rõ ràng, mũi tên transformation', style: 'Hiện đại' },
];

// CTA gắn nhanh — click sẽ append vào prompt mô tả banner để AI render kèm CTA nổi bật
const CTA_PRESETS: { label: string; emoji: string; appendText: string }[] = [
  { emoji: '🛒', label: 'Mua ngay',     appendText: ' Có CTA "MUA NGAY" nổi bật bên dưới.' },
  { emoji: '📅', label: 'Đặt chỗ',      appendText: ' Có CTA "ĐẶT CHỖ NGAY" nổi bật.' },
  { emoji: '✏️', label: 'Đăng ký',     appendText: ' Có CTA "ĐĂNG KÝ NGAY" nổi bật.' },
  { emoji: '📲', label: 'Tải app',      appendText: ' Có CTA "TẢI APP" + 2 badge App Store/Google Play.' },
  { emoji: '📞', label: 'Liên hệ',      appendText: ' Có CTA "LIÊN HỆ NGAY" + số hotline nổi bật.' },
  { emoji: '🔍', label: 'Xem chi tiết', appendText: ' Có CTA "XEM CHI TIẾT" nổi bật.' },
  { emoji: '🎁', label: 'Nhận voucher', appendText: ' Có CTA "SĂN VOUCHER NGAY" nổi bật.' },
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
  const { theme: _theme } = useTheme();
  const { credits, isAuthenticated, login } = useAuth();
  const { showToast } = useToast();

  // UI state
  const [activePlatform, setActivePlatform] = useState(PLATFORMS[0].id);
  const [isEnhancing, setIsEnhancing]       = useState(false);
  const [showAdvanced, setShowAdvanced]     = useState(false);
  const [showAISuggest, setShowAISuggest]   = useState(false); // collapsed by default
  const [viewMode, setViewMode]             = useState<'current' | 'library'>('current');
  const [activeIndustry, setActiveIndustry] = useState('social');

  // Content state
  const [localPrompt, setLocalPrompt]         = useState('');
  const [title, setTitle]                     = useState('');
  const [subtitle, setSubtitle]               = useState('');
  const [localReferences, setLocalReferences] = useState<string[]>([]);

  // Config state — useImageGenerator handles all generate logic
  const gen = useImageGenerator();

  const [selectedStyle, setSelectedStyle] = useState(STYLES[0]);
  const [quantity, setQuantity]           = useState(1);

  // Brand state
  const [brandColors, setBrandColors]       = useState(['#0090FF', '#6366F1']);
  const [hexInput, setHexInput]             = useState('#0090FF');
  const [useBrandColor, setUseBrandColor]   = useState(true);
  const [addTextToBanner, setAddTextToBanner] = useState(true);

  // ── PRO features ─────────────────────────────────────────────────────────
  // Brand Kit (logo + brand name + tagline) — persist localStorage để reuse across session
  const [brandLogoUrl, setBrandLogoUrl]   = useState<string>('');
  const [brandKitSavedAt, setBrandKitSavedAt] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Caption + Hashtag AI generator (post FB/X)
  const [showCaptionModal, setShowCaptionModal] = useState(false);
  const [captionGenerating, setCaptionGenerating] = useState(false);
  const [captionResult, setCaptionResult] = useState<{ caption: string; hashtags: string[] } | null>(null);

  // Magic Resize lite — re-gen cho platform khác (1 click)
  const [showResizeMenu, setShowResizeMenu] = useState(false);

  // History
  const [sessions, setSessions] = useState<BannerSession[]>([]);

  const fileInputRef   = useRef<HTMLInputElement>(null);
  const colorPickerRef = useRef<HTMLInputElement>(null);
  const [editingColorIndex, setEditingColorIndex] = useState<number | null>(null);

  // Prompt history
  const [promptHistory, setPromptHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory]     = useState(false);

  // Mobile bottom sheet
  const [showMobileSheet, setShowMobileSheet] = useState(false);

  // AI Enhance diff preview
  const [enhancedPreview, setEnhancedPreview] = useState<string | null>(null);
  const [showEnhanceDiff, setShowEnhanceDiff] = useState(false);

  // Lightbox
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  // Load history + brand kit on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { setSessions(JSON.parse(saved)); } catch { /* ignore */ }
    }
    const savedPrompts = localStorage.getItem(STORAGE_KEY + '_prompts');
    if (savedPrompts) {
      try { setPromptHistory(JSON.parse(savedPrompts)); } catch { /* ignore */ }
    }
    // Auto-restore Brand Kit (silent — không bật toast spam mỗi lần mở app)
    const savedBrandKit = localStorage.getItem(BRAND_KIT_STORAGE_KEY);
    if (savedBrandKit) {
      try {
        const kit: BrandKit & { savedAt?: string } = JSON.parse(savedBrandKit);
        if (kit.colors?.length) setBrandColors(kit.colors);
        if (kit.brandName) setTitle(kit.brandName);
        if (kit.tagline) setSubtitle(kit.tagline);
        if (kit.logoUrl) setBrandLogoUrl(kit.logoUrl);
        if (kit.savedAt) setBrandKitSavedAt(kit.savedAt);
      } catch { /* ignore */ }
    }
  }, []);

  const currentPlatform     = PLATFORMS.find(p => p.id === activePlatform) ?? PLATFORMS[0];
  const activeIndustryLabel = INDUSTRIES.find(i => i.id === activeIndustry)?.label ?? '';

  // Save sessions to localStorage when a job completes
  const prevResultsRef = useRef<string[]>([]);
  useEffect(() => {
    const doneResults = gen.results.filter(r => r.status === 'done' && r.url);
    const newDone = doneResults.filter(r => !prevResultsRef.current.includes(r.id));
    if (newDone.length > 0) {
      prevResultsRef.current = doneResults.map(r => r.id);
      setSessions(prev => {
        const newSessions = newDone.map(r => ({
          id: r.id,
          url: r.url!,
          prompt: localPrompt,
          config: { platformId: activePlatform, style: selectedStyle, model: gen.selectedModel?.name || '' },
          timestamp: new Date().toLocaleString('vi-VN'),
        }));
        const updated = [...newSessions, ...prev];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
      showToast('Banner đã được tạo thành công!', 'success');
    }
  }, [gen.results]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  // ── Brand Kit handlers ─────────────────────────────────────────────────────
  const saveBrandKit = useCallback(() => {
    const now = new Date().toISOString();
    const kit: BrandKit & { savedAt: string } = {
      brandName: title || undefined,
      tagline:   subtitle || undefined,
      logoUrl:   brandLogoUrl || undefined,
      colors:    brandColors,
      savedAt:   now,
    };
    try {
      localStorage.setItem(BRAND_KIT_STORAGE_KEY, JSON.stringify(kit));
      setBrandKitSavedAt(now);
      showToast('💾 Đã lưu bộ thương hiệu', 'success');
    } catch {
      showToast('Không lưu được bộ thương hiệu', 'error');
    }
  }, [title, subtitle, brandLogoUrl, brandColors, showToast]);

  const loadBrandKit = useCallback(() => {
    const saved = localStorage.getItem(BRAND_KIT_STORAGE_KEY);
    if (!saved) {
      showToast('Chưa có bộ thương hiệu nào được lưu', 'info');
      return;
    }
    try {
      const kit: BrandKit & { savedAt?: string } = JSON.parse(saved);
      if (kit.colors?.length) setBrandColors(kit.colors);
      if (kit.brandName) setTitle(kit.brandName);
      if (kit.tagline) setSubtitle(kit.tagline);
      if (kit.logoUrl) setBrandLogoUrl(kit.logoUrl);
      showToast('↻ Đã áp dụng bộ thương hiệu', 'success');
    } catch {
      showToast('Bộ thương hiệu lưu bị lỗi', 'error');
    }
  }, [showToast]);

  const clearBrandKit = useCallback(() => {
    try {
      localStorage.removeItem(BRAND_KIT_STORAGE_KEY);
      setBrandKitSavedAt(null);
      showToast('🗑 Đã xoá bộ thương hiệu đã lưu', 'info');
    } catch { /* ignore */ }
  }, [showToast]);

  const handleLogoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showToast('Logo quá lớn (>2MB). Hãy nén lại.', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setBrandLogoUrl(reader.result as string);
    reader.readAsDataURL(file);
  }, [showToast]);

  // ── Magic Resize lite — chuyển sang platform khác và auto re-gen ──────────
  const handleResizePlatform = useCallback((platformId: string) => {
    setActivePlatform(platformId);
    setShowResizeMenu(false);
    // gen.handleGenerate sẽ pick currentPlatform mới khi render — chỉ cần wait 1 tick
    requestAnimationFrame(() => {
      // Re-trigger generation. handleGenerate dùng state hiện tại (đã có prompt + style + brand).
      // Đảm bảo đủ điều kiện gen, không call nếu chưa auth/processing.
      if (!localPrompt.trim()) {
        showToast('Cần có Mô tả Banner trước khi resize.', 'error');
        return;
      }
      // Trigger qua nút Generate gốc — set prompt lại để force re-run
      handleGenerate();
    });
  }, [localPrompt, showToast]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Caption + Hashtag AI ──────────────────────────────────────────────────
  const generateCaption = useCallback(async () => {
    if (captionGenerating) return;
    setCaptionGenerating(true);
    setCaptionResult(null);
    try {
      const platformName = currentPlatform.platform.includes('Twitter') ? 'X (Twitter)' : currentPlatform.platform;
      const system = `Bạn là chuyên gia social media marketing tiếng Việt. User vừa tạo banner cho ${platformName}.
Hãy viết 1 caption ngắn gọn (2-3 câu, có emoji phù hợp) và đề xuất 8 hashtag liên quan (kèm dấu #) để đăng kèm banner.
Trả về CHÍNH XÁC theo format JSON:
{"caption": "...", "hashtags": ["#...", "#..."]}
Không giải thích thêm.`;
      const userMsg = `Mô tả banner: ${localPrompt}\nLĩnh vực: ${activeIndustryLabel}\nTiêu đề: ${title || '(không có)'}\nTiêu đề phụ: ${subtitle || '(không có)'}`;
      const raw = await aiTextViaProxy(`${system}\n\n${userMsg}`);
      // Parse JSON robustly — AI sometimes wraps in markdown ```json ... ```
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
      if (parsed?.caption && Array.isArray(parsed.hashtags)) {
        setCaptionResult({ caption: parsed.caption, hashtags: parsed.hashtags });
      } else {
        // Fallback: hiển thị raw text nếu parse fail
        setCaptionResult({ caption: raw, hashtags: [] });
      }
    } catch (err: any) {
      showToast(err?.message || 'Không tạo được caption', 'error');
      setShowCaptionModal(false);
    } finally {
      setCaptionGenerating(false);
    }
  }, [captionGenerating, currentPlatform, localPrompt, activeIndustryLabel, title, subtitle, showToast]);

  const copyToClipboard = useCallback((text: string, label: string) => {
    navigator.clipboard?.writeText(text).then(
      () => showToast(`✓ Đã copy ${label}`, 'success'),
      () => showToast('Không copy được', 'error')
    );
  }, [showToast]);

  const handleEnhance = async () => {
    if (!localPrompt.trim() || isEnhancing) return;
    setIsEnhancing(true);
    setShowEnhanceDiff(false);
    setEnhancedPreview(null);
    try {
      const system = 'Bạn là chuyên gia thiết kế banner mạng xã hội. Viết lại prompt sau thành mô tả chi tiết cho AI tạo banner: bố cục, màu sắc, font chữ, hiệu ứng ánh sáng. Ngắn gọn, tiếng Việt.';
      const enhanced = await aiTextViaProxy(`${system}\n\nPrompt gốc: "${localPrompt}"`);
      if (enhanced && !enhanced.includes('CONNECTION_TERMINATED')) {
        setEnhancedPreview(enhanced);
        setShowEnhanceDiff(true);
      }
    } catch { /* ignore */ } finally {
      setIsEnhancing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const remaining = 6 - localReferences.length;
    Array.from(files).slice(0, remaining).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => setLocalReferences(prev => [...prev, reader.result as string]);
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

  const handleGenerate = () => {
    if (!localPrompt.trim() || gen.isGenerating) return;
    if (!isAuthenticated) { login(); return; }

    const industryCtx  = activeIndustryLabel ? `[Lĩnh vực: ${activeIndustryLabel}] ` : '';
    const platformCtx  = `Platform: ${currentPlatform.platform} ${currentPlatform.label} (${currentPlatform.size}, tỷ lệ ${currentPlatform.ratio}).`;
    const colorCtx     = useBrandColor ? `Màu thương hiệu: ${brandColors.join(', ')}.` : '';
    const textCtx      = addTextToBanner && title ? `Tiêu đề chính: "${title}". Tiêu đề phụ: "${subtitle}".` : '';
    // Logo context — nếu user đã upload logo thì hint AI giữ logo position góc trên trái (chuẩn social banner)
    const logoCtx      = brandLogoUrl ? 'Có logo thương hiệu (đính kèm) đặt ở góc trên trái, kích thước vừa phải, không che nội dung chính.' : '';
    const stylePreset  = BANNER_STYLES.find(s => s.label === selectedStyle);
    const stylePrefix  = stylePreset?.promptPrefix ?? '';

    const finalPrompt = `${industryCtx}${stylePrefix}Tạo banner mạng xã hội chuyên nghiệp. ${platformCtx} Phong cách: ${selectedStyle}. ${colorCtx} ${textCtx} ${logoCtx} Mô tả: ${localPrompt}. Chất lượng ${gen.selectedRes || '2k'}, bố cục tối ưu cho ${currentPlatform.platform}.`;

    gen.setPrompt(finalPrompt);
    // Logo + references — logo prepend để AI ưu tiên reference cao hơn
    const allRefs = brandLogoUrl ? [brandLogoUrl, ...localReferences] : localReferences;
    gen.setReferences(allRefs.map(url => ({ url })));
    gen.setQuantity(quantity);

    const newHistory = [localPrompt, ...promptHistory.filter(p => p !== localPrompt)].slice(0, 10);
    setPromptHistory(newHistory);
    localStorage.setItem(STORAGE_KEY + '_prompts', JSON.stringify(newHistory));

    gen.handleGenerate();
  };

  const deleteSession = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = sessions.filter(s => s.id !== id);
    setSessions(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const handleDownloadUrl = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `skyverses_banner_${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(url, '_blank');
    }
  };

  // ── Shared sub-components ──────────────────────────────────────────────────

  /** Info bar shown below result images */
  const ResultInfoBar = ({ session }: { session?: BannerSession }) => {
    const plat = session ? PLATFORMS.find(p => p.id === session.config.platformId) : currentPlatform;
    const style = session?.config.style ?? selectedStyle;
    const model = session?.config.model ?? gen.selectedModel?.name ?? '';
    const ts    = session?.timestamp ?? '';
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-[#13171f] border-t border-black/[0.05] dark:border-white/[0.08] flex-wrap">
        {plat && (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-blue/10 text-brand-blue text-[9px] font-bold">
            {plat.platform} · {plat.label}
          </span>
        )}
        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-500 dark:text-violet-400 text-[9px] font-bold">
          {style}
        </span>
        {model && (
          <span className="flex items-center gap-1 text-[9px] text-slate-400 dark:text-gray-400">
            <Bot size={9} /> {model}
          </span>
        )}
        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold ml-auto">
          {gen.totalCost} CR
        </span>
        {ts && <span className="text-[9px] text-slate-300 dark:text-gray-500">{ts}</span>}
      </div>
    );
  };

  /** Action buttons below result image */
  const ResultActions = ({ url }: { url: string }) => (
    <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-[#13171f]">
      <button
        onClick={handleGenerate}
        disabled={gen.isGenerating}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-white/60 text-[10px] font-semibold hover:bg-brand-blue/10 hover:text-brand-blue transition-all disabled:opacity-40"
      >
        <RefreshCw size={11} /> Tạo lại
      </button>
      <button
        onClick={() => setLightboxUrl(url)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-white/60 text-[10px] font-semibold hover:bg-brand-blue/10 hover:text-brand-blue transition-all"
      >
        <Maximize2 size={11} /> Xem full
      </button>
      <button
        onClick={() => handleDownloadUrl(url)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-blue/10 text-brand-blue text-[10px] font-semibold hover:bg-brand-blue hover:text-white transition-all ml-auto"
      >
        <Download size={11} /> Tải về
      </button>
    </div>
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="h-full w-full flex flex-col bg-[#f4f7f9] dark:bg-[#0a0d14] text-slate-900 dark:text-white font-sans overflow-hidden relative transition-colors duration-500">

      {/* ── TOP NAV ── */}
      <div className="h-14 bg-white dark:bg-[#0a0d14] border-b border-slate-200 dark:border-white/10 flex items-center justify-between px-6 shrink-0 z-[100] transition-colors">
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

        {/* ── SIDEBAR ── hidden on mobile, sticky generate button ── */}
        <div className="hidden md:flex w-[360px] shrink-0 bg-white dark:bg-[#13171f] border-r border-slate-200 dark:border-white/10 flex-col h-full transition-colors">

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">

            {/* Platform Picker */}
            <div>
              <p className="text-[9px] font-semibold uppercase text-slate-400 dark:text-gray-400 mb-2 tracking-widest">Nền tảng & Format</p>
              <div className="grid grid-cols-2 gap-1.5">
                {PLATFORMS.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setActivePlatform(p.id)}
                    className={`flex flex-col items-start p-2.5 rounded-xl text-left border transition-all ${
                      activePlatform === p.id
                        ? 'bg-brand-blue text-white border-brand-blue shadow-sm shadow-brand-blue/20'
                        : 'bg-black/[0.02] dark:bg-white/[0.02] border-black/[0.05] dark:border-white/[0.08] text-slate-500 dark:text-gray-400 hover:border-brand-blue/30 hover:text-brand-blue'
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
              <p className="text-[9px] font-semibold uppercase text-slate-400 dark:text-gray-400 mb-1 tracking-widest">Lĩnh vực</p>
              <p className="text-[10px] text-slate-400 dark:text-gray-500 mb-2 leading-relaxed">AI sẽ tạo banner phù hợp với ngành bạn chọn (icon, mood, layout).</p>
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
                          : 'bg-black/[0.02] dark:bg-white/[0.02] border-black/[0.05] dark:border-white/[0.08] text-slate-500 dark:text-gray-400 hover:border-brand-blue/30 hover:text-brand-blue'
                      }`}
                    >
                      <Icon size={11} />
                      {ind.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* AI Suggest Panel — collapsible */}
            <div>
              <button
                onClick={() => setShowAISuggest(v => !v)}
                className="flex items-center justify-between w-full text-[9px] font-semibold uppercase text-slate-400 dark:text-gray-400 hover:text-brand-blue transition-colors tracking-widest mb-1"
              >
                <span>AI Gợi ý & Templates</span>
                {showAISuggest
                  ? <ChevronDown size={11} className="text-brand-blue" />
                  : <ChevronRight size={11} />
                }
              </button>
              <AnimatePresence>
                {showAISuggest && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <AISuggestPanel
                      productSlug="social-banner-ai"
                      productName="Social Banner AI"
                      styles={BANNER_STYLES}
                      onPromptSelect={(p) => setLocalPrompt(prev => p + (prev ? '\n' + prev : ''))}
                      onApply={(cfg) => {
                        if (cfg.prompt) setLocalPrompt(cfg.prompt);
                        if (cfg.style && BANNER_STYLES.find(s => s.label === cfg.style)) setSelectedStyle(cfg.style);
                        if (cfg.format) setActivePlatform(PLATFORMS.find(p => p.label === cfg.format)?.id ?? activePlatform);
                      }}
                      historyKey={STORAGE_KEY}
                      featuredTemplates={FEATURED_TEMPLATES}
                      productContext={`Social Banner AI tool for creating ${currentPlatform.platform} ${currentPlatform.label} banners for ${activeIndustryLabel || 'general'} industry in Vietnam`}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Prompt textarea */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[9px] font-semibold uppercase text-slate-400 dark:text-gray-400 tracking-widest">Mô tả Banner</p>
                {promptHistory.length > 0 && (
                  <div className="relative">
                    <button
                      onClick={() => setShowHistory(v => !v)}
                      className="flex items-center gap-1 text-[9px] font-semibold text-slate-400 dark:text-gray-400 hover:text-brand-blue transition-colors"
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
                          className="absolute right-0 top-5 z-50 w-72 bg-white dark:bg-[#1a1f2b] border border-black/[0.08] dark:border-white/[0.08] rounded-xl shadow-2xl overflow-hidden"
                        >
                          <div className="p-2 border-b border-black/[0.05] dark:border-white/[0.08]">
                            <p className="text-[9px] font-bold uppercase text-slate-400 tracking-widest px-1">10 Prompts gần nhất</p>
                          </div>
                          <div className="max-h-52 overflow-y-auto">
                            {promptHistory.map((p, i) => (
                              <button
                                key={i}
                                onClick={() => { setLocalPrompt(p); setShowHistory(false); }}
                                className="w-full text-left px-3 py-2.5 text-[11px] text-slate-700 dark:text-white/70 hover:bg-brand-blue/[0.06] hover:text-brand-blue transition-colors line-clamp-2 border-b border-black/[0.03] dark:border-white/[0.05] last:border-0"
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
                value={localPrompt}
                onChange={e => setLocalPrompt(e.target.value)}
                onKeyDown={e => {
                  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                    e.preventDefault();
                    handleGenerate();
                  }
                  if (e.key === 'ArrowUp' && !localPrompt.trim()) {
                    e.preventDefault();
                    const hist = (() => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY + '_prompts') || '[]'); } catch { return []; } })();
                    if (hist[0]) setLocalPrompt(hist[0]);
                  }
                }}
                placeholder={`Mô tả banner ${currentPlatform.label} bạn muốn tạo...`}
                rows={3}
                className="w-full text-[12px] bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] rounded-xl px-3 py-2.5 resize-none text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-brand-blue/50 transition-colors"
              />
              <button
                onClick={handleEnhance}
                disabled={isEnhancing || !localPrompt.trim()}
                className="mt-1.5 flex items-center gap-1.5 text-[10px] font-semibold text-brand-blue hover:opacity-80 disabled:opacity-30 transition-opacity"
              >
                {isEnhancing ? <Loader2 size={11} className="animate-spin" /> : <Wand2 size={11} />}
                AI Boost Prompt
              </button>

              {/* CTA presets — 1-click thêm Call-to-Action marketer thường dùng vào mô tả */}
              <div className="mt-3">
                <p className="text-[9px] font-semibold uppercase text-slate-400 dark:text-gray-400 tracking-widest mb-1.5">
                  Thêm CTA <span className="font-normal normal-case tracking-normal text-slate-400 dark:text-gray-500">(click để gắn vào mô tả)</span>
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {CTA_PRESETS.map(cta => (
                    <button
                      key={cta.label}
                      onClick={() => setLocalPrompt(prev => (prev.trim() + cta.appendText).trim())}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.08] text-[10px] font-semibold text-slate-600 dark:text-gray-300 hover:bg-brand-blue/10 hover:border-brand-blue/30 hover:text-brand-blue transition-all"
                      title={`Thêm "${cta.label}" vào mô tả banner`}
                    >
                      <span>{cta.emoji}</span>
                      <span>{cta.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* AI Enhance diff preview */}
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
                            onClick={() => { setLocalPrompt(enhancedPreview); setShowEnhanceDiff(false); setEnhancedPreview(null); showToast('Prompt đã được cập nhật!', 'success'); }}
                            className="text-[9px] font-bold text-emerald-500 hover:text-emerald-600 transition-colors"
                          >
                            ✓ Áp dụng
                          </button>
                          <button
                            onClick={() => { setShowEnhanceDiff(false); setEnhancedPreview(null); }}
                            className="text-[9px] text-slate-400 hover:text-red-400 transition-colors"
                          >
                            ✕ Bỏ
                          </button>
                        </div>
                      </div>
                      <div className="px-3 py-2 border-b border-dashed border-brand-blue/10">
                        <p className="text-[8px] font-bold text-slate-400 uppercase mb-1">Trước</p>
                        <p className="text-[10px] text-slate-500 dark:text-gray-300 line-clamp-2 leading-relaxed">{localPrompt}</p>
                      </div>
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
                <p className="text-[9px] font-semibold uppercase text-slate-400 dark:text-gray-400 tracking-widest">Text trên Banner</p>
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
                    className="w-full text-[12px] bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] rounded-xl px-3 py-2 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-brand-blue/50 transition-colors"
                  />
                  <input
                    value={subtitle}
                    onChange={e => setSubtitle(e.target.value)}
                    placeholder="Tiêu đề phụ (VD: Chỉ hôm nay)"
                    className="w-full text-[12px] bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] rounded-xl px-3 py-2 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-brand-blue/50 transition-colors"
                  />
                </div>
              )}
            </div>

            {/* Reference images */}
            <div>
              <p className="text-[9px] font-semibold uppercase text-slate-400 dark:text-gray-400 mb-2 tracking-widest">Ảnh tham chiếu ({localReferences.length}/6)</p>
              <div className="grid grid-cols-3 gap-1.5">
                {localReferences.map((ref, i) => (
                  <div key={i} className="aspect-square rounded-lg overflow-hidden relative group bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                    <img src={ref} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => setLocalReferences(prev => prev.filter((_, idx) => idx !== i))}
                      className="absolute top-1 right-1 p-0.5 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
                {localReferences.length < 6 && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-lg border border-dashed border-slate-300 dark:border-white/10 flex items-center justify-center hover:border-brand-blue/40 transition-colors text-slate-400 dark:text-gray-400"
                  >
                    <Plus size={16} />
                  </button>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileUpload} />
            </div>

            {/* Phong cách */}
            <div>
              <p className="text-[9px] font-semibold uppercase text-slate-400 dark:text-gray-400 mb-1 tracking-widest">Phong cách</p>
              <p className="text-[10px] text-slate-400 dark:text-gray-500 mb-1.5 leading-relaxed">Định hình tổng thể: typography, màu sắc, mood của banner.</p>
              <div className="flex flex-wrap gap-1.5">
                {STYLES.map(s => (
                  <button
                    key={s}
                    onClick={() => setSelectedStyle(s)}
                    className={`px-2.5 py-1.5 rounded-lg text-[10px] font-semibold border transition-all ${
                      selectedStyle === s
                        ? 'bg-brand-blue text-white border-brand-blue shadow-sm'
                        : 'bg-black/[0.02] dark:bg-white/[0.02] border-black/[0.05] dark:border-white/[0.08] text-slate-500 dark:text-gray-400 hover:border-brand-blue/30 hover:text-brand-blue'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Engine Settings */}
            <ModelEngineSettings
              availableModels={gen.availableModels}
              selectedModel={gen.selectedModel}
              setSelectedModel={gen.setSelectedModel}
              selectedRatio={gen.selectedRatio}
              setSelectedRatio={gen.setSelectedRatio}
              selectedRes={gen.selectedRes}
              setSelectedRes={gen.setSelectedRes}
              quantity={quantity}
              setQuantity={setQuantity}
              selectedMode={gen.selectedMode}
              setSelectedMode={gen.setSelectedMode}
              selectedEngine={gen.selectedEngine}
              onSelectEngine={gen.setSelectedEngine}
              activeMode="SINGLE"
              isGenerating={gen.isGenerating}
              familyList={[]}
              selectedFamily=""
              setSelectedFamily={() => {}}
              familyModels={gen.availableModels.map((m: any) => m.raw || m)}
              familyModes={[]}
              familyRatios={[]}
              familyResolutions={[]}
            />

            {/* Advanced — brand colors */}
            <div>
              <button
                onClick={() => setShowAdvanced(v => !v)}
                className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 dark:text-gray-400 hover:text-brand-blue transition-colors"
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
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-[9px] font-semibold uppercase text-slate-400 dark:text-gray-400 tracking-widest">Màu thương hiệu</p>
                        <button
                          onClick={() => setUseBrandColor(v => !v)}
                          className={`w-8 h-4 rounded-full transition-colors ${useBrandColor ? 'bg-brand-blue' : 'bg-slate-300 dark:bg-white/10'}`}
                          title="Bật/tắt áp dụng màu thương hiệu vào banner"
                        >
                          <div className={`w-3 h-3 bg-white rounded-full mx-0.5 transition-transform ${useBrandColor ? 'translate-x-4' : ''}`} />
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-400 dark:text-gray-500 mb-2 leading-relaxed">AI sẽ ưu tiên dùng các màu này làm tông chủ đạo cho banner.</p>
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

                    {/* ── Logo upload — auto đặt logo góc trên trái khi gen banner ── */}
                    <div>
                      <p className="text-[9px] font-semibold uppercase text-slate-400 dark:text-gray-400 mb-1 tracking-widest">Logo thương hiệu</p>
                      <p className="text-[10px] text-slate-400 dark:text-gray-500 mb-2 leading-relaxed">AI sẽ tự đặt logo ở góc trên trái banner.</p>
                      {brandLogoUrl ? (
                        <div className="flex items-center gap-2">
                          <div className="relative w-12 h-12 rounded-lg border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-white/[0.03] overflow-hidden flex items-center justify-center">
                            <img src={brandLogoUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
                          </div>
                          <button
                            onClick={() => logoInputRef.current?.click()}
                            className="text-[10px] font-semibold text-brand-blue hover:underline"
                          >
                            Đổi logo
                          </button>
                          <button
                            onClick={() => setBrandLogoUrl('')}
                            className="text-[10px] font-semibold text-rose-500 hover:underline"
                          >
                            Xoá
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => logoInputRef.current?.click()}
                          className="w-full py-3 rounded-xl border-2 border-dashed border-slate-200 dark:border-white/[0.08] text-[10px] font-semibold text-slate-400 dark:text-gray-400 hover:border-brand-blue/40 hover:text-brand-blue transition-all flex items-center justify-center gap-1.5"
                        >
                          <Upload size={12} /> Tải logo (PNG transparent · ≤ 2MB)
                        </button>
                      )}
                      <input
                        ref={logoInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </div>

                    {/* ── Brand Kit save/load — persist toàn bộ brand info localStorage ── */}
                    <div className="pt-2 border-t border-slate-100 dark:border-white/[0.05]">
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-[9px] font-semibold uppercase text-slate-400 dark:text-gray-400 tracking-widest">Bộ thương hiệu</p>
                        {brandKitSavedAt && (
                          <span className="text-[9px] text-emerald-500 font-semibold">✓ Đã lưu</span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 dark:text-gray-500 mb-2 leading-relaxed">Lưu màu + logo + tiêu đề để tái dùng nhanh ở lần sau.</p>
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          onClick={saveBrandKit}
                          className="flex-1 min-w-[100px] flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-brand-blue/10 text-brand-blue text-[10px] font-bold border border-brand-blue/20 hover:bg-brand-blue/20 transition-colors"
                          title="Lưu brand colors + logo + tiêu đề + tagline hiện tại"
                        >
                          💾 Lưu
                        </button>
                        <button
                          onClick={loadBrandKit}
                          className="flex-1 min-w-[100px] flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-gray-300 text-[10px] font-bold border border-slate-200 dark:border-white/[0.08] hover:bg-slate-200 dark:hover:bg-white/[0.08] transition-colors"
                          title="Khôi phục bộ thương hiệu đã lưu trước đó"
                        >
                          ↻ Áp dụng
                        </button>
                        {brandKitSavedAt && (
                          <button
                            onClick={clearBrandKit}
                            className="flex items-center justify-center px-2 py-1.5 rounded-lg text-rose-500 text-[10px] font-bold hover:bg-rose-500/10 transition-colors"
                            title="Xoá bộ thương hiệu đã lưu"
                          >
                            🗑
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>{/* end scroll area */}

          {/* ── Generate button — sticky bottom ── */}
          <div className="shrink-0 p-4 border-t border-slate-100 dark:border-white/10 bg-white dark:bg-[#13171f] space-y-2">
            <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-gray-400">
              <div className="flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${gen.isGenerating ? 'bg-brand-blue animate-pulse' : 'bg-emerald-400'}`} />
                {gen.isGenerating ? 'AI đang tạo banner...' : 'Sẵn sàng'}
              </div>
              <span className="font-semibold text-brand-blue">{gen.totalCost} CR / lần</span>
            </div>
            <motion.button
              onClick={handleGenerate}
              disabled={gen.isGenerating || !localPrompt.trim()}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-blue to-blue-500 text-white text-[12px] font-bold uppercase tracking-widest shadow-lg shadow-brand-blue/20 hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {gen.isGenerating
                ? <><Loader2 size={14} className="animate-spin" /> Đang tạo...</>
                : <><Sparkles size={14} /> Tạo Banner <kbd className="ml-1 text-[9px] font-mono bg-white/20 px-1.5 py-0.5 rounded opacity-70 normal-case tracking-normal">⌘↵</kbd></>
              }
            </motion.button>
          </div>

        </div>{/* end sidebar */}

        {/* ── MAIN VIEWPORT ── */}
        <div className="flex-1 flex flex-col bg-[#f0f2f5] dark:bg-[#0a0d14] overflow-hidden">

          {viewMode === 'current' ? (
            <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center">
              {(gen.isGenerating || gen.results.length > 0) ? (
                <div className="w-full max-w-2xl space-y-4">
                  {/* Placeholder card while submitting (no result yet) */}
                  {gen.isGenerating && gen.results.filter(r => r.status === 'processing').length === 0 && (
                    <div className="rounded-xl overflow-hidden shadow-sm">
                      <ImageJobCard
                        status="processing"
                        aspectRatio={currentPlatform.ratio === '9:16' ? '9/16' : currentPlatform.ratio === '1:1' ? '1/1' : currentPlatform.ratio === '3:1' ? '3/1' : '16/9'}
                        mode="full"
                        statusText="AI đang tạo banner..."
                        loadingExtra={
                          <div className="flex items-center gap-2 mt-2">
                            <span className="px-2 py-0.5 rounded-full bg-brand-blue/20 text-brand-blue text-[9px] font-bold">{currentPlatform.platform} · {currentPlatform.label}</span>
                            <span className="px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-400 text-[9px] font-bold">{selectedStyle}</span>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-bold">{gen.totalCost} CR</span>
                          </div>
                        }
                      />
                    </div>
                  )}

                  {/* Result cards */}
                  {gen.results.map(result => (
                    <div key={result.id} className="rounded-xl overflow-hidden shadow-sm bg-white dark:bg-[#13171f] border border-black/[0.06] dark:border-white/[0.08]">
                      <ImageJobCard
                        status={result.status}
                        resultUrl={result.url ?? undefined}
                        aspectRatio={currentPlatform.ratio === '9:16' ? '9/16' : currentPlatform.ratio === '1:1' ? '1/1' : currentPlatform.ratio === '3:1' ? '3/1' : '16/9'}
                        mode="full"
                        statusText={result.status === 'processing' ? 'AI đang tạo banner...' : undefined}
                        loadingExtra={result.status === 'processing' ? (
                          <div className="flex items-center gap-2 mt-2">
                            <span className="px-2 py-0.5 rounded-full bg-brand-blue/20 text-brand-blue text-[9px] font-bold">{currentPlatform.platform} · {currentPlatform.label}</span>
                            <span className="px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-400 text-[9px] font-bold">{selectedStyle}</span>
                          </div>
                        ) : undefined}
                        onReset={result.status === 'done' ? handleGenerate : undefined}
                        onRetry={result.status === 'error' ? handleGenerate : undefined}
                        infoSlot={<ResultInfoBar />}
                        resultFooter={result.status === 'done' && result.url
                          ? <ResultActions url={result.url} />
                          : undefined
                        }
                      />
                    </div>
                  ))}
                </div>
              ) : (
                /* Empty state — starter prompt cards */
                <div className="flex flex-col items-center justify-center gap-6 text-center w-full max-w-md my-auto">
                  <div>
                    <p className="text-sm font-semibold text-slate-400 dark:text-gray-400">Bắt đầu với một gợi ý</p>
                    <p className="text-[11px] text-slate-300 dark:text-gray-500 mt-1">Nhấn vào mẫu bên dưới hoặc nhập mô tả của bạn</p>
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
                        onClick={() => setLocalPrompt(sp.prompt)}
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
            /* ── Library grid ── */
            <div className="flex-1 overflow-y-auto p-6">
              {sessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                  <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                    <ImageIcon size={24} className="text-slate-300 dark:text-gray-500" />
                  </div>
                  <p className="text-sm text-slate-400 dark:text-gray-400">Thư viện trống — tạo banner đầu tiên!</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {sessions.map(session => {
                    const plat  = PLATFORMS.find(p => p.id === session.config.platformId);
                    return (
                      <div
                        key={session.id}
                        onClick={() => setViewMode('current')}
                        className="group relative cursor-pointer"
                      >
                        <ImageJobCard
                          status="done"
                          resultUrl={session.url}
                          aspectRatio={plat?.ratio === '9:16' ? '9/16' : plat?.ratio === '1:1' ? '1/1' : plat?.ratio === '3:1' ? '3/1' : '16/9'}
                          mode="compact"
                          cardClassName="border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#13171f] hover:border-brand-blue/30 hover:-translate-y-0.5 transition-all"
                          infoSlot={
                            <div className="bg-white dark:bg-[#13171f] px-3 pt-2 pb-1.5 border-t border-black/[0.05] dark:border-white/[0.08]">
                              {/* Badges row */}
                              <div className="flex flex-wrap gap-1 mb-1.5">
                                {plat && (
                                  <span className="px-1.5 py-0.5 rounded-full bg-brand-blue/10 text-brand-blue text-[8px] font-bold">
                                    {plat.platform} · {plat.label}
                                  </span>
                                )}
                                {session.config.style && (
                                  <span className="px-1.5 py-0.5 rounded-full bg-violet-500/10 text-violet-500 dark:text-violet-400 text-[8px] font-bold">
                                    {session.config.style}
                                  </span>
                                )}
                                {session.config.model && (
                                  <span className="flex items-center gap-0.5 text-[8px] text-slate-400 dark:text-gray-400">
                                    <Bot size={8} /> {session.config.model}
                                  </span>
                                )}
                              </div>
                              {/* Prompt */}
                              <p className="text-[10px] text-slate-600 dark:text-white/60 line-clamp-2 leading-relaxed">{session.prompt}</p>
                              {/* Footer */}
                              <div className="flex items-center justify-between mt-1.5">
                                <p className="text-[8px] text-slate-300 dark:text-gray-500">{session.timestamp}</p>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleDownloadUrl(session.url); }}
                                  className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-blue/10 text-brand-blue text-[8px] font-bold hover:bg-brand-blue hover:text-white transition-all"
                                >
                                  <Download size={8} /> Tải
                                </button>
                              </div>
                            </div>
                          }
                        />
                        <button
                          onClick={(e) => deleteSession(e, session.id)}
                          className="absolute top-2 right-2 z-10 p-1.5 rounded-lg bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── ResourceAuthModal ── */}
      <ResourceAuthModal
        isOpen={gen.showResourceModal}
        onClose={() => gen.setShowResourceModal(false)}
        onConfirm={(pref: 'credits' | 'key') => {
          gen.setUsagePreference(pref);
          localStorage.setItem('skyverses_usage_preference', pref);
          gen.setShowResourceModal(false);
          if (gen.isResumingGenerate) {
            gen.setIsResumingGenerate(false);
            gen.handleGenerate();
          }
        }}
        hasPersonalKey={gen.hasPersonalKey}
        totalCost={gen.totalCost}
      />

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {lightboxUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[500] bg-black/90 backdrop-blur-sm flex items-center justify-center p-6"
            onClick={() => setLightboxUrl(null)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.22 }}
              onClick={e => e.stopPropagation()}
              className="relative max-w-5xl max-h-[90vh] w-full flex flex-col items-center gap-3"
            >
              <img
                src={lightboxUrl}
                alt="Banner preview"
                className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl"
              />
              <div className="flex items-center gap-2 flex-wrap justify-center">
                <button
                  onClick={() => setLightboxUrl(null)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-white/70 hover:bg-white/20 text-[11px] font-semibold transition-all"
                >
                  <X size={13} /> Đóng
                </button>
                <button
                  onClick={() => handleDownloadUrl(lightboxUrl)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-blue text-white text-[11px] font-bold hover:brightness-110 transition-all"
                >
                  <Download size={13} /> Tải về
                </button>
                {/* Caption + Hashtag AI — gen post text đi kèm banner */}
                <button
                  onClick={() => { setShowCaptionModal(true); generateCaption(); }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500/20 text-purple-300 text-[11px] font-bold hover:bg-purple-500/30 transition-all"
                  title="Tạo caption + hashtag cho post Facebook/X"
                >
                  <Hash size={13} /> Caption + Hashtag
                </button>
                {/* Magic Resize lite — toggle dropdown 6 platform khác */}
                <div className="relative">
                  <button
                    onClick={() => setShowResizeMenu(v => !v)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/20 text-amber-300 text-[11px] font-bold hover:bg-amber-500/30 transition-all"
                    title="Tạo lại banner cho platform/size khác"
                  >
                    <LayersIcon size={13} /> Tạo cho platform khác
                  </button>
                  <AnimatePresence>
                    {showResizeMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-72 bg-[#1a1f2b] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-10"
                      >
                        <p className="px-3 py-2 text-[9px] font-bold uppercase tracking-widest text-gray-400 border-b border-white/[0.06]">Re-render với cùng prompt + style</p>
                        <div className="max-h-64 overflow-y-auto">
                          {PLATFORMS.filter(p => p.id !== activePlatform).map(p => (
                            <button
                              key={p.id}
                              onClick={() => { handleResizePlatform(p.id); setLightboxUrl(null); }}
                              className="w-full text-left px-3 py-2.5 hover:bg-brand-blue/10 transition-colors flex items-center justify-between border-b border-white/[0.04] last:border-0"
                            >
                              <div>
                                <p className="text-[11px] font-bold text-white">{p.platform}</p>
                                <p className="text-[10px] text-gray-400">{p.label} · {p.size}</p>
                              </div>
                              <ChevronRight size={12} className="text-gray-500" />
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Caption + Hashtag Modal ── */}
      <AnimatePresence>
        {showCaptionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[600] bg-black/70 backdrop-blur-md flex items-center justify-center p-6"
            onClick={() => setShowCaptionModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 30, stiffness: 400 }}
              onClick={e => e.stopPropagation()}
              className="relative w-full max-w-lg bg-white dark:bg-[#1a1f2b] rounded-2xl border border-black/[0.08] dark:border-white/[0.08] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="px-5 py-4 border-b border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/15 text-purple-500 flex items-center justify-center">
                    <Hash size={14} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white">Caption + Hashtag</h3>
                    <p className="text-[10px] text-slate-400 dark:text-gray-500">AI tạo nội dung post {currentPlatform.platform}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCaptionModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="p-5 overflow-y-auto flex-1 space-y-4">
                {captionGenerating ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-12 text-slate-400 dark:text-gray-400">
                    <Loader2 size={28} className="animate-spin text-purple-500" />
                    <p className="text-[12px] font-semibold">AI đang viết caption + chọn hashtag…</p>
                  </div>
                ) : captionResult ? (
                  <>
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-gray-400">Caption</p>
                        <button
                          onClick={() => copyToClipboard(captionResult.caption, 'caption')}
                          className="flex items-center gap-1 px-2 py-1 text-[10px] font-semibold text-brand-blue hover:bg-brand-blue/10 rounded-lg transition-colors"
                        >
                          <Copy size={11} /> Copy
                        </button>
                      </div>
                      <p className="text-[13px] leading-relaxed text-slate-700 dark:text-white bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] rounded-xl p-3 whitespace-pre-line">
                        {captionResult.caption}
                      </p>
                    </div>
                    {captionResult.hashtags.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-gray-400">Hashtag ({captionResult.hashtags.length})</p>
                          <button
                            onClick={() => copyToClipboard(captionResult.hashtags.join(' '), 'hashtag')}
                            className="flex items-center gap-1 px-2 py-1 text-[10px] font-semibold text-brand-blue hover:bg-brand-blue/10 rounded-lg transition-colors"
                          >
                            <Copy size={11} /> Copy tất cả
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {captionResult.hashtags.map((h, i) => (
                            <button
                              key={i}
                              onClick={() => copyToClipboard(h, h)}
                              className="px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-500 dark:text-purple-300 text-[11px] font-semibold border border-purple-500/20 hover:bg-purple-500/20 transition-colors"
                              title="Click để copy"
                            >
                              {h}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="pt-2 border-t border-slate-100 dark:border-white/[0.05]">
                      <button
                        onClick={() => copyToClipboard(`${captionResult.caption}\n\n${captionResult.hashtags.join(' ')}`, 'toàn bộ post')}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-brand-blue text-white text-[11px] font-bold hover:brightness-110 transition-all"
                      >
                        <Check size={13} /> Copy toàn bộ (caption + hashtag)
                      </button>
                      <button
                        onClick={generateCaption}
                        className="w-full mt-1.5 flex items-center justify-center gap-2 py-2 rounded-xl bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-gray-300 text-[10px] font-semibold border border-slate-200 dark:border-white/[0.08] hover:bg-slate-200 dark:hover:bg-white/[0.08] transition-colors"
                      >
                        <RefreshCw size={11} /> Tạo lại
                      </button>
                    </div>
                  </>
                ) : null}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Mobile Bottom Sheet ── */}
      <AnimatePresence>
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
              className="absolute bottom-0 left-0 right-0 bg-white dark:bg-[#13171f] rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between px-5 pt-4 pb-2 shrink-0">
                <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-white/20 mx-auto absolute left-1/2 -translate-x-1/2 top-3" />
                <p className="text-[12px] font-bold text-slate-700 dark:text-white/80">Cài đặt Banner</p>
                <button onClick={() => setShowMobileSheet(false)} className="p-1.5 text-slate-400 hover:text-red-400 transition-colors">
                  <X size={16} />
                </button>
              </div>

              <div className="overflow-y-auto flex-1 px-4 pb-4 space-y-4">
                <div>
                  <p className="text-[9px] font-semibold uppercase text-slate-400 dark:text-gray-400 mb-2 tracking-widest">Nền tảng</p>
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

                <div>
                  <p className="text-[9px] font-semibold uppercase text-slate-400 dark:text-gray-400 mb-2 tracking-widest">Lĩnh vực</p>
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

                <div>
                  <p className="text-[9px] font-semibold uppercase text-slate-400 dark:text-gray-400 mb-1.5 tracking-widest">Phong cách</p>
                  <select
                    value={selectedStyle}
                    onChange={e => setSelectedStyle(e.target.value)}
                    className="w-full text-[11px] bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] rounded-xl px-3 py-2 text-slate-700 dark:text-white focus:outline-none"
                  >
                    {STYLES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>

                <ModelEngineSettings
                  availableModels={gen.availableModels}
                  selectedModel={gen.selectedModel}
                  setSelectedModel={gen.setSelectedModel}
                  selectedRatio={gen.selectedRatio}
                  setSelectedRatio={gen.setSelectedRatio}
                  selectedRes={gen.selectedRes}
                  setSelectedRes={gen.setSelectedRes}
                  quantity={quantity}
                  setQuantity={setQuantity}
                  selectedMode={gen.selectedMode}
                  setSelectedMode={gen.setSelectedMode}
                  selectedEngine={gen.selectedEngine}
                  onSelectEngine={gen.setSelectedEngine}
                  activeMode="SINGLE"
                  isGenerating={gen.isGenerating}
                  familyList={[]}
                  selectedFamily=""
                  setSelectedFamily={() => {}}
                  familyModels={gen.availableModels.map((m: any) => m.raw || m)}
                  familyModes={[]}
                  familyRatios={[]}
                  familyResolutions={[]}
                />
              </div>

              <div className="shrink-0 p-4 border-t border-slate-100 dark:border-white/10">
                <motion.button
                  onClick={() => { setShowMobileSheet(false); handleGenerate(); }}
                  disabled={gen.isGenerating || !localPrompt.trim()}
                  whileTap={{ scale: 0.97 }}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-blue to-blue-500 text-white text-[12px] font-bold uppercase tracking-widest shadow-lg shadow-brand-blue/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Sparkles size={14} /> Tạo Banner — {gen.totalCost} CR
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
