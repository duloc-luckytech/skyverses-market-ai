
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Loader2, Image as ImageIcon,
  Globe, ChevronDown, X, FileText,
  LayoutTemplate, Tag, Upload, ImagePlay,
} from 'lucide-react';
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

type SidebarTab = 'create' | 'settings' | 'brand';

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
  /** Image-only deck mode: skips text blocks, auto gens all BGs */
  imageDeckMode: boolean;
  setImageDeckMode: (v: boolean) => void;
}

// ── Tab definitions ────────────────────────────────────────────────────────────

const TABS: { id: SidebarTab; label: string; emoji: string }[] = [
  { id: 'create',   label: 'Tạo Deck',  emoji: '✨' },
  { id: 'settings', label: 'Cài đặt',   emoji: '⚙️' },
  { id: 'brand',    label: 'Brand',      emoji: '🏷️' },
];

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
  imageDeckMode, setImageDeckMode,
}) => {
  const { showToast } = useToast();
  const { parseDocx } = useDocxImport();

  const [activeTab, setActiveTab] = React.useState<SidebarTab>('create');
  const [langOpen, setLangOpen] = React.useState(false);
  const [isDocxLoading, setIsDocxLoading] = React.useState(false);

  const fileRef      = React.useRef<HTMLInputElement>(null);
  const logoFileRef  = React.useRef<HTMLInputElement>(null);

  const currentLang = LANGUAGES.find(l => l.value === deckLanguage) ?? LANGUAGES[0];

  // ── Handlers ──────────────────────────────────────────────────────────────

  const applyTemplate = (t: Template) => {
    setDeckTopic(t.prompt);
    setDeckStyle(t.style);
    setSlideCount(t.slideCount);
    setDeckLanguage(t.language);
    showToast(`Đã áp dụng template "${t.label}"`, 'success');
    setActiveTab('create');
  };

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
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Lỗi khi nhập DOCX';
      showToast(message, 'error');
    } finally {
      setIsDocxLoading(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { if (reader.result) setBrandLogo(reader.result as string); };
    reader.readAsDataURL(file);
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="w-72 h-full flex flex-col bg-white dark:bg-[#1a1a1e] border-l border-black/[0.05] dark:border-white/[0.05]">

      {/* ── Tab bar ─────────────────────────────────────────────────────────── */}
      <div className="flex gap-1 px-3 pt-3 pb-2 shrink-0 border-b border-black/[0.05] dark:border-white/[0.04]">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-brand-blue text-white shadow-sm shadow-brand-blue/30'
                : 'text-slate-500 dark:text-white/40 hover:bg-black/[0.04] dark:hover:bg-white/[0.04]'
            }`}
          >
            <span className="hidden sm:inline mr-1">{tab.emoji}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Scrollable content ──────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-3 space-y-4">

        {/* ════════════════════════════════════════════════════════════════════
            Tab: Tạo Deck
        ════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'create' && (
          <>
            {/* Topic */}
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

            {/* Style */}
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
                    onClick={() => applyTemplate(t)}
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
          </>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            Tab: Cài đặt
        ════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'settings' && (
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
                <Globe size={9} className="inline mr-1" />
                Ngôn ngữ
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

        {/* ════════════════════════════════════════════════════════════════════
            Tab: Brand
        ════════════════════════════════════════════════════════════════════ */}
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

            {/* DOCX Import (in brand for power users who need it from sidebar) */}
            <div className="pt-1 border-t border-black/[0.05] dark:border-white/[0.04]">
              <label className="text-[9px] font-bold uppercase text-slate-400 dark:text-white/30 block mb-2">
                <FileText size={9} className="inline mr-1" />
                Import từ DOCX
              </label>
              <label
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-brand-blue/40 text-brand-blue text-[11px] font-semibold hover:bg-brand-blue/[0.05] transition-all cursor-pointer ${
                  (isDocxLoading || isGeneratingDeck) ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
                }`}
              >
                {isDocxLoading ? (
                  <><Loader2 size={13} className="animate-spin" />Đang xử lý...</>
                ) : (
                  <><FileText size={13} />Chọn file .docx</>
                )}
                <input
                  type="file"
                  accept=".docx"
                  onChange={handleDocxImport}
                  disabled={isDocxLoading || isGeneratingDeck}
                  className="hidden"
                />
              </label>
            </div>
          </>
        )}
      </div>

      {/* ── Sticky CTA at bottom ─────────────────────────────────────────── */}
      <div className="shrink-0 p-4 border-t border-black/[0.05] dark:border-white/[0.04] space-y-3">

        {/* Image Deck Mode toggle */}
        <button
          onClick={() => setImageDeckMode(!imageDeckMode)}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all ${
            imageDeckMode
              ? 'bg-violet-500/10 border-violet-500/40 text-violet-600 dark:text-violet-400'
              : 'bg-black/[0.02] dark:bg-white/[0.02] border-black/[0.06] dark:border-white/[0.06] text-slate-500 dark:text-white/40 hover:border-violet-400/40 hover:text-violet-500'
          }`}
        >
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
            imageDeckMode ? 'bg-violet-500/20' : 'bg-black/[0.04] dark:bg-white/[0.04]'
          }`}>
            <ImagePlay size={15} className={imageDeckMode ? 'text-violet-500' : 'text-slate-400 dark:text-white/30'} />
          </div>
          <div className="flex-1 text-left min-w-0">
            <p className="text-[11px] font-bold leading-tight">
              {imageDeckMode ? '🎨 Image Deck Mode: BẬT' : 'Image Deck Mode'}
            </p>
            <p className="text-[9px] leading-tight opacity-70 mt-0.5">
              {imageDeckMode
                ? 'Chỉ ảnh AI · Auto gen hình sau khi tạo'
                : 'Bật để tạo deck toàn ảnh AI, không text'
              }
            </p>
          </div>
          {/* Toggle switch */}
          <div className={`w-9 h-5 rounded-full transition-colors shrink-0 relative ${
            imageDeckMode ? 'bg-violet-500' : 'bg-slate-200 dark:bg-white/10'
          }`}>
            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${
              imageDeckMode ? 'left-[18px]' : 'left-0.5'
            }`} />
          </div>
        </button>

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
            whileHover={{ scale: 1.02, boxShadow: imageDeckMode ? '0 8px 24px rgba(139,92,246,0.3)' : '0 8px 24px rgba(0,144,255,0.25)' }}
            whileTap={{ scale: 0.97 }}
            disabled={!deckTopic.trim()}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white text-[12px] font-bold shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none ${
              imageDeckMode
                ? 'bg-violet-600 shadow-violet-500/20 hover:bg-violet-600/90'
                : 'bg-brand-blue shadow-brand-blue/20 hover:bg-brand-blue/90'
            }`}
          >
            {imageDeckMode ? <ImagePlay size={14} /> : <Sparkles size={14} />}
            {imageDeckMode ? 'Tạo Image Deck' : 'Tạo toàn bộ Deck'}
          </motion.button>
        )}
      </div>
    </div>
  );
};

export default SlideSidebar;
