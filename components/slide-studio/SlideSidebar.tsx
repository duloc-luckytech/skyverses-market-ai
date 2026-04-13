
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Loader2, Image as ImageIcon,
  Globe, ChevronDown, X, FileText,
  LayoutTemplate, Tag, Upload, Download,
  Settings2,
} from 'lucide-react';
import { downloadDocxTemplate } from '../../utils/downloadDocxTemplate';
import {
  SLIDE_STYLES, SLIDE_COUNT_OPTIONS,
} from '../../hooks/useSlideStudio';
import { useDocxImport, DocxOutline } from '../../hooks/useDocxImport';
import { useToast } from '../../context/ToastContext';
import { Language } from '../../types';

const LANGUAGES: { value: Language; label: string; flag: string }[] = [
  { value: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
  { value: 'en', label: 'English',    flag: '🇺🇸' },
  { value: 'ko', label: '한국어',      flag: '🇰🇷' },
  { value: 'ja', label: '日本語',      flag: '🇯🇵' },
];

interface Template {
  label: string;
  emoji: string;
  style: string;
  slideCount: number;
  language: Language;
  prompt: string;
}

const FEATURED_TEMPLATES: Template[] = [
  {
    label: 'Startup Pitch',
    emoji: '🚀',
    style: 'dark',
    slideCount: 8,
    language: 'en',
    prompt: 'Startup pitch deck for a tech company seeking Series A funding — problem, solution, market, team, traction',
  },
  {
    label: 'Báo cáo DN',
    emoji: '📊',
    style: 'corporate',
    slideCount: 6,
    language: 'vi',
    prompt: 'Báo cáo tổng kết kinh doanh quý 3 năm 2025 — kết quả, phân tích, kế hoạch',
  },
  {
    label: 'Bài giảng',
    emoji: '🎓',
    style: 'gradient',
    slideCount: 10,
    language: 'vi',
    prompt: 'Bài giảng Machine Learning cơ bản cho sinh viên đại học — khái niệm, thuật toán, ứng dụng',
  },
  {
    label: 'Marketing',
    emoji: '📣',
    style: 'creative',
    slideCount: 8,
    language: 'vi',
    prompt: 'Chiến dịch marketing Q4 cho sản phẩm mới — thị trường, chiến lược, KPIs, timeline',
  },
  {
    label: 'Product Launch',
    emoji: '✨',
    style: 'dark',
    slideCount: 8,
    language: 'en',
    prompt: 'Product launch presentation for a new mobile application — features, demo, roadmap, go-to-market',
  },
  {
    label: 'Portfolio',
    emoji: '🎨',
    style: 'minimal',
    slideCount: 6,
    language: 'en',
    prompt: 'Creative portfolio showcase for a design agency — about us, work samples, process, contact',
  },
];

interface Props {
  deckTopic: string;
  setDeckTopic: (v: string) => void;
  deckStyle: string;
  setDeckStyle: (v: string) => void;
  deckLanguage: Language;
  setDeckLanguage: (v: Language) => void;
  slideCount: number;
  setSlideCount: (v: number) => void;
  refImages: string[];
  setRefImages: (v: string[]) => void;
  isGeneratingDeck: boolean;
  onOpenGenerateModal: () => void;
  onCancelGeneration: () => void;
  onDocxImport: (outline: DocxOutline[]) => void;
  brandLogo: string | null;
  setBrandLogo: (v: string | null) => void;
  brandSlogan: string;
  setBrandSlogan: (v: string) => void;
  brandDescription: string;
  setBrandDescription: (v: string) => void;
}

// ── More Settings Drawer (slides in from right edge inside sidebar) ────────────

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  // all the advanced props
  slideCount: number;
  setSlideCount: (v: number) => void;
  deckLanguage: Language;
  setDeckLanguage: (v: Language) => void;
  refImages: string[];
  setRefImages: (v: string[]) => void;
  brandLogo: string | null;
  setBrandLogo: (v: string | null) => void;
  brandSlogan: string;
  setBrandSlogan: (v: string) => void;
  brandDescription: string;
  setBrandDescription: (v: string) => void;
  isGeneratingDeck: boolean;
  onDocxImport: (outline: DocxOutline[]) => void;
  applyTemplate: (t: Template) => void;
}

const MoreSettingsDrawer: React.FC<DrawerProps> = ({
  open, onClose,
  slideCount, setSlideCount,
  deckLanguage, setDeckLanguage,
  refImages, setRefImages,
  brandLogo, setBrandLogo,
  brandSlogan, setBrandSlogan,
  brandDescription, setBrandDescription,
  isGeneratingDeck,
  onDocxImport,
  applyTemplate,
}) => {
  const { showToast } = useToast();
  const { parseDocx } = useDocxImport();
  const [isDocxLoading, setIsDocxLoading] = React.useState(false);
  const [langOpen, setLangOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'basic' | 'brand' | 'import'>('basic');

  const fileRef = React.useRef<HTMLInputElement>(null);
  const docxFileRef = React.useRef<HTMLInputElement>(null);
  const logoFileRef = React.useRef<HTMLInputElement>(null);
  const currentLang = LANGUAGES.find(l => l.value === deckLanguage) ?? LANGUAGES[0];

  const handleRefImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) setRefImages([...refImages, reader.result as string].slice(0, 3));
    };
    reader.readAsDataURL(file);
  };

  const handleDocxImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsDocxLoading(true);
    try {
      const outline = await parseDocx(file);
      showToast(`Đã nhập ${outline.length} slides từ DOCX — đang tạo...`, 'success');
      onDocxImport(outline);
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Lỗi khi nhập DOCX';
      showToast(message, 'error');
    } finally {
      setIsDocxLoading(false);
      if (docxFileRef.current) docxFileRef.current.value = '';
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { if (reader.result) setBrandLogo(reader.result as string); };
    reader.readAsDataURL(file);
  };

  const TABS = [
    { id: 'basic' as const,  label: 'Cài đặt' },
    { id: 'brand' as const,  label: 'Brand' },
    { id: 'import' as const, label: 'Import' },
  ];

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 z-20 bg-black/20 dark:bg-black/40"
            onClick={onClose}
          />
          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
            className="absolute inset-y-0 right-0 z-30 w-full bg-white dark:bg-[#16161a] flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-black/[0.05] dark:border-white/[0.05] shrink-0">
              <span className="text-[12px] font-bold text-slate-700 dark:text-white">
                More Settings
              </span>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-black/[0.05] dark:hover:bg-white/[0.05] text-slate-400 dark:text-white/40 transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 px-3 pt-2.5 pb-1.5 shrink-0">
              {TABS.map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                    activeTab === t.id
                      ? 'bg-brand-blue text-white shadow-sm shadow-brand-blue/30'
                      : 'text-slate-500 dark:text-white/40 hover:bg-black/[0.04] dark:hover:bg-white/[0.04]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-3 space-y-4">

              {/* ── Tab: Cài đặt ─────────────────────────────────────────── */}
              {activeTab === 'basic' && (
                <>
                  {/* Slide count */}
                  <div>
                    <label className="text-[9px] font-bold uppercase text-slate-400 dark:text-white/30 block mb-1.5">
                      📊 Số lượng Slide
                    </label>
                    <div className="grid grid-cols-5 gap-1.5">
                      {SLIDE_COUNT_OPTIONS.map(count => (
                        <button
                          key={count}
                          onClick={() => setSlideCount(count)}
                          className={`py-2 rounded-lg text-[11px] font-bold transition-all ${
                            slideCount === count
                              ? 'bg-brand-blue text-white shadow-md shadow-brand-blue/30'
                              : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-white/60 hover:bg-slate-200 dark:hover:bg-white/10'
                          }`}
                        >
                          {count}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Language */}
                  <div>
                    <label className="text-[9px] font-bold uppercase text-slate-400 dark:text-white/30 block mb-1.5">
                      🌐 Ngôn ngữ
                    </label>
                    <div className="relative">
                      <button
                        onClick={() => setLangOpen(!langOpen)}
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-black/[0.08] dark:border-white/[0.08] text-[12px] font-medium text-slate-700 dark:text-white/80 flex items-center justify-between hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
                      >
                        <span>{currentLang.flag} {currentLang.label}</span>
                        <ChevronDown size={12} className={`transition-transform ${langOpen ? 'rotate-180' : ''}`} />
                      </button>
                      <AnimatePresence>
                        {langOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#252530] border border-black/[0.08] dark:border-white/[0.08] rounded-xl shadow-lg z-10 overflow-hidden"
                          >
                            {LANGUAGES.map(lang => (
                              <button
                                key={lang.value}
                                onClick={() => { setDeckLanguage(lang.value); setLangOpen(false); }}
                                className={`w-full px-3 py-2.5 text-left text-[12px] font-medium transition-colors ${
                                  deckLanguage === lang.value
                                    ? 'bg-brand-blue/10 text-brand-blue'
                                    : 'text-slate-700 dark:text-white/70 hover:bg-slate-50 dark:hover:bg-white/5'
                                }`}
                              >
                                {lang.flag} {lang.label}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Quick Templates */}
                  <div>
                    <label className="text-[9px] font-bold uppercase text-slate-400 dark:text-white/30 block mb-1.5">
                      <LayoutTemplate size={9} className="inline mr-1" />
                      Quick Templates
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {FEATURED_TEMPLATES.map(t => (
                        <button
                          key={t.label}
                          onClick={() => { applyTemplate(t); onClose(); }}
                          className="group flex items-center gap-2 p-2.5 rounded-xl border border-black/[0.06] dark:border-white/[0.06] bg-slate-50 dark:bg-white/[0.03] hover:border-brand-blue/40 hover:bg-brand-blue/[0.04] transition-all text-left"
                        >
                          <span className="text-base leading-none shrink-0">{t.emoji}</span>
                          <div className="min-w-0">
                            <p className="text-[10px] font-bold text-slate-700 dark:text-white/80 leading-tight truncate">
                              {t.label}
                            </p>
                            <p className="text-[8px] text-slate-400 dark:text-white/30 truncate">
                              {t.slideCount} slides · {t.style}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Ref Images */}
                  <div>
                    <label className="text-[9px] font-bold uppercase text-slate-400 dark:text-white/30 block mb-1.5">
                      🖼️ Ảnh tham chiếu (tuỳ chọn)
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {refImages.map((img, i) => (
                        <div key={i} className="relative group">
                          <img src={img} alt={`ref-${i}`} className="w-14 h-14 rounded-lg object-cover border border-black/[0.08] dark:border-white/[0.08]" />
                          <button
                            onClick={() => setRefImages(refImages.filter((_, j) => j !== i))}
                            className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={9} className="text-white" />
                          </button>
                        </div>
                      ))}
                      {refImages.length < 3 && (
                        <button
                          onClick={() => fileRef.current?.click()}
                          className="w-14 h-14 rounded-lg border-2 border-dashed border-black/[0.08] dark:border-white/[0.08] flex items-center justify-center hover:border-brand-blue/40 transition-colors"
                        >
                          <ImageIcon size={14} className="text-slate-400 dark:text-white/30" />
                        </button>
                      )}
                    </div>
                    <input ref={fileRef} type="file" accept="image/*" onChange={handleRefImageUpload} className="hidden" />
                    <p className="text-[9px] text-slate-400 dark:text-white/20 mt-1">
                      Tối đa 3 ảnh — AI dùng làm tham chiếu style/brand
                    </p>
                  </div>
                </>
              )}

              {/* ── Tab: Brand ───────────────────────────────────────────── */}
              {activeTab === 'brand' && (
                <>
                  {/* Logo */}
                  <div>
                    <label className="text-[9px] font-bold uppercase text-slate-400 dark:text-white/30 block mb-1.5">
                      <Tag size={9} className="inline mr-1" />
                      Logo thương hiệu
                    </label>
                    <div className="flex items-center gap-3">
                      {brandLogo ? (
                        <div className="relative group shrink-0">
                          <img src={brandLogo} alt="brand logo" className="w-14 h-14 rounded-xl object-contain border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-white/5" />
                          <button
                            onClick={() => setBrandLogo(null)}
                            className="absolute -top-1.5 -right-1.5 p-0.5 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={8} className="text-white" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => logoFileRef.current?.click()}
                          className="w-14 h-14 rounded-xl border-2 border-dashed border-black/[0.08] dark:border-white/[0.08] flex flex-col items-center justify-center gap-0.5 hover:border-brand-blue/40 transition-colors shrink-0"
                        >
                          <Upload size={13} className="text-slate-400 dark:text-white/30" />
                          <span className="text-[8px] text-slate-400 dark:text-white/30">Logo</span>
                        </button>
                      )}
                      <p className="text-[10px] text-slate-400 dark:text-white/30 leading-snug">
                        AI sẽ dùng logo làm tham chiếu thương hiệu khi tạo slide
                      </p>
                    </div>
                    <input ref={logoFileRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  </div>

                  {/* Slogan */}
                  <div>
                    <label className="text-[9px] font-bold uppercase text-slate-400 dark:text-white/30 block mb-1.5">
                      Slogan / Tagline
                    </label>
                    <input
                      value={brandSlogan}
                      onChange={e => setBrandSlogan(e.target.value)}
                      placeholder="VD: Innovate · Connect · Grow"
                      maxLength={80}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-black/[0.08] dark:border-white/[0.08] text-[12px] placeholder-slate-300 dark:placeholder-white/20 focus:outline-none focus:border-brand-blue/40 text-slate-900 dark:text-white"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="text-[9px] font-bold uppercase text-slate-400 dark:text-white/30 block mb-1.5">
                      Mô tả dự án / thương hiệu
                    </label>
                    <textarea
                      value={brandDescription}
                      onChange={e => setBrandDescription(e.target.value.slice(0, 200))}
                      placeholder="Mô tả ngắn để AI có ngữ cảnh..."
                      rows={4}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-black/[0.08] dark:border-white/[0.08] text-[12px] placeholder-slate-300 dark:placeholder-white/20 focus:outline-none focus:border-brand-blue/40 resize-none text-slate-900 dark:text-white"
                    />
                    <p className="text-right text-[9px] text-slate-300 dark:text-white/20 mt-0.5">
                      {brandDescription.length}/200
                    </p>
                  </div>
                </>
              )}

              {/* ── Tab: Import ──────────────────────────────────────────── */}
              {activeTab === 'import' && (
                <div className="space-y-3">
                  <p className="text-[11px] text-slate-500 dark:text-white/40 leading-relaxed">
                    Tạo nội dung deck trong Word (.docx) rồi import vào đây. AI sẽ tự tạo ảnh nền cho từng slide.
                  </p>

                  {/* Format guide */}
                  <div className="rounded-xl bg-brand-blue/[0.05] border border-brand-blue/20 p-3 space-y-1.5">
                    <p className="text-[10px] font-bold text-brand-blue">📝 Format chuẩn:</p>
                    {[
                      '# Tiêu đề slide 1  (Heading 1)',
                      'Bullet point đầu tiên',
                      'Bullet point thứ hai',
                      '',
                      '# Tiêu đề slide 2  (Heading 1)',
                      'Nội dung slide 2...',
                    ].map((line, i) => (
                      <p key={i} className={`text-[10px] font-mono ${line.startsWith('#') ? 'text-brand-blue font-bold' : line === '' ? 'h-1' : 'text-slate-500 dark:text-white/40'}`}>
                        {line || '\u00A0'}
                      </p>
                    ))}
                  </div>

                  {/* Upload */}
                  <button
                    onClick={() => docxFileRef.current?.click()}
                    disabled={isDocxLoading || isGeneratingDeck}
                    className="w-full py-3 rounded-xl border-2 border-dashed border-brand-blue/40 text-brand-blue text-[12px] font-semibold hover:bg-brand-blue/[0.05] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isDocxLoading ? (
                      <><Loader2 size={14} className="animate-spin" />Đang xử lý...</>
                    ) : (
                      <><FileText size={14} />Chọn file .docx</>
                    )}
                  </button>
                  <input
                    ref={docxFileRef}
                    type="file"
                    accept=".docx"
                    onChange={handleDocxImport}
                    disabled={isDocxLoading}
                    className="hidden"
                  />

                  {/* Download template */}
                  <button
                    type="button"
                    onClick={() => downloadDocxTemplate()}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-black/[0.08] dark:border-white/[0.08] text-[11px] font-medium text-slate-500 dark:text-white/40 hover:text-brand-blue hover:border-brand-blue/30 transition-all"
                  >
                    <Download size={12} />
                    Tải template mẫu (.docx)
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// ── Main Sidebar ──────────────────────────────────────────────────────────────

const SlideSidebar: React.FC<Props> = ({
  deckTopic, setDeckTopic,
  deckStyle, setDeckStyle,
  deckLanguage, setDeckLanguage,
  slideCount, setSlideCount,
  refImages, setRefImages,
  isGeneratingDeck,
  onOpenGenerateModal,
  onCancelGeneration,
  onDocxImport,
  brandLogo, setBrandLogo,
  brandSlogan, setBrandSlogan,
  brandDescription, setBrandDescription,
}) => {
  const { showToast } = useToast();
  const [moreOpen, setMoreOpen] = React.useState(false);

  const applyTemplate = (t: Template) => {
    setDeckTopic(t.prompt);
    setDeckStyle(t.style);
    setSlideCount(t.slideCount);
    setDeckLanguage(t.language);
    showToast(`Đã áp dụng template "${t.label}"`, 'success');
  };

  return (
    <div className="relative w-72 h-full flex flex-col bg-white dark:bg-[#1a1a1e] border-l border-black/[0.05] dark:border-white/[0.05] overflow-hidden">

      {/* ── Scrollable main area ──────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4 pb-2">

        {/* Header label */}
        <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/30">
          ⚙️ Slide Settings
        </p>

        {/* Topic textarea */}
        <div>
          <label className="text-[9px] font-bold uppercase text-slate-400 dark:text-white/30 block mb-1.5">
            📝 Chủ đề Deck
          </label>
          <textarea
            value={deckTopic}
            onChange={(e) => setDeckTopic(e.target.value)}
            placeholder="Nhập chủ đề bản trình chiếu..."
            rows={4}
            className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-black/[0.08] dark:border-white/[0.08] text-[12px] placeholder-slate-400 dark:placeholder-white/30 focus:outline-none focus:border-brand-blue/40 resize-none text-slate-900 dark:text-white leading-relaxed"
          />
        </div>

        {/* Style pills */}
        <div>
          <label className="text-[9px] font-bold uppercase text-slate-400 dark:text-white/30 block mb-1.5">
            🎨 Style
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {SLIDE_STYLES.map(style => (
              <button
                key={style.id}
                onClick={() => setDeckStyle(style.id)}
                className={`px-2 py-2 rounded-lg text-[9px] font-semibold transition-all truncate ${
                  deckStyle === style.id
                    ? 'bg-brand-blue/20 border border-brand-blue/50 text-brand-blue'
                    : 'bg-slate-100 dark:bg-white/5 border border-transparent text-slate-700 dark:text-white/60 hover:bg-slate-200 dark:hover:bg-white/10'
                }`}
              >
                {style.emoji} {style.label}
              </button>
            ))}
          </div>
        </div>

        {/* More Settings button */}
        <button
          onClick={() => setMoreOpen(true)}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border border-black/[0.07] dark:border-white/[0.07] bg-slate-50 dark:bg-white/[0.03] hover:border-brand-blue/30 hover:bg-brand-blue/[0.03] transition-all group"
        >
          <span className="flex items-center gap-2 text-[11px] font-semibold text-slate-500 dark:text-white/50 group-hover:text-brand-blue transition-colors">
            <Settings2 size={13} />
            More Settings
          </span>
          <span className="flex items-center gap-1.5 text-[9px] text-slate-400 dark:text-white/25">
            {/* badges for active settings */}
            {slideCount !== 6 && (
              <span className="px-1.5 py-0.5 rounded-full bg-brand-blue/10 text-brand-blue text-[8px] font-bold">{slideCount}</span>
            )}
            {deckLanguage !== 'vi' && (
              <span className="text-[11px]">{LANGUAGES.find(l => l.value === deckLanguage)?.flag}</span>
            )}
            {(brandLogo || brandSlogan) && (
              <span className="px-1.5 py-0.5 rounded-full bg-violet-500/10 text-violet-500 text-[8px] font-bold">Brand</span>
            )}
            <ChevronDown size={10} className="-rotate-90" />
          </span>
        </button>

      </div>

      {/* ── Sticky CTA at bottom ─────────────────────────────────────────── */}
      <div className="shrink-0 p-4 border-t border-black/[0.05] dark:border-white/[0.04]">
        {isGeneratingDeck ? (
          <motion.button
            onClick={onCancelGeneration}
            whileTap={{ scale: 0.97 }}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-[12px] font-semibold hover:bg-red-500/20 transition-all"
          >
            <X size={14} />
            Hủy tạo
          </motion.button>
        ) : (
          <motion.button
            onClick={onOpenGenerateModal}
            whileHover={{ scale: 1.02, boxShadow: '0 8px 24px rgba(0,144,255,0.25)' }}
            whileTap={{ scale: 0.97 }}
            disabled={!deckTopic.trim()}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-blue text-white text-[12px] font-bold shadow-lg shadow-brand-blue/20 hover:bg-brand-blue/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
          >
            <Sparkles size={14} />
            Tạo toàn bộ Deck
          </motion.button>
        )}
      </div>

      {/* ── More Settings drawer (slides over sidebar) ───────────────────── */}
      <MoreSettingsDrawer
        open={moreOpen}
        onClose={() => setMoreOpen(false)}
        slideCount={slideCount}
        setSlideCount={setSlideCount}
        deckLanguage={deckLanguage}
        setDeckLanguage={setDeckLanguage}
        refImages={refImages}
        setRefImages={setRefImages}
        brandLogo={brandLogo}
        setBrandLogo={setBrandLogo}
        brandSlogan={brandSlogan}
        setBrandSlogan={setBrandSlogan}
        brandDescription={brandDescription}
        setBrandDescription={setBrandDescription}
        isGeneratingDeck={isGeneratingDeck}
        onDocxImport={onDocxImport}
        applyTemplate={applyTemplate}
      />
    </div>
  );
};

export default SlideSidebar;
