
import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Download, Undo2, Redo2, Sparkles,
  ChevronDown, Layers, FileText, Play,
  Check, Loader2 as RefreshIcon,
} from 'lucide-react';

// ── Speaker notes panel — collapsible drawer dưới canvas
interface SpeakerNotesPanelProps {
  slide: { id: string; notes?: string } | null;
  onUpdate: (notes: string) => void;
}
const SpeakerNotesPanel: React.FC<SpeakerNotesPanelProps> = React.memo(({ slide, onUpdate }) => {
  const [open, setOpen] = useState<boolean>(() => {
    try { return localStorage.getItem('skyverses_slide_notes_open') === '1'; } catch { return false; }
  });
  useEffect(() => {
    try { localStorage.setItem('skyverses_slide_notes_open', open ? '1' : '0'); } catch {}
  }, [open]);
  if (!slide) return null;
  return (
    <div className="shrink-0 border-t border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[var(--atlas-bg-panel)]">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-2 hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors"
      >
        <div className="flex items-center gap-2">
          <FileText size={12} className="text-slate-400 dark:text-gray-400" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-gray-400">Ghi chú diễn giả</span>
          {slide.notes && slide.notes.trim() && (
            <span className="text-[9px] font-semibold text-emerald-500 dark:text-emerald-400">• có nội dung</span>
          )}
        </div>
        <ChevronDown size={11} className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3">
              <textarea
                value={slide.notes || ''}
                onChange={e => onUpdate(e.target.value)}
                placeholder="Ghi chú để bạn đọc khi thuyết trình (không hiển thị trên slide)..."
                rows={3}
                className="w-full text-[12px] bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-xl px-3 py-2 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-brand-blue/50 resize-y leading-relaxed"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

// ── Autosave indicator badge — sub-component memoized để không re-render mỗi render parent
const SaveStatusBadge: React.FC<{ lastSavedAt: number | null }> = React.memo(({ lastSavedAt }) => {
  const [, force] = useState(0);
  // Tick mỗi 5s để update relative time
  useEffect(() => {
    const t = setInterval(() => force(n => n + 1), 5000);
    return () => clearInterval(t);
  }, []);
  if (!lastSavedAt) return null;
  const sec = Math.floor((Date.now() - lastSavedAt) / 1000);
  const label = sec < 5 ? '✓ Đã lưu' : sec < 60 ? `✓ Đã lưu ${sec}s trước` : `✓ Đã lưu ${Math.floor(sec / 60)}p trước`;
  return (
    <span className="hidden md:flex items-center gap-1 text-[10px] font-semibold text-emerald-500 dark:text-emerald-400" title="Tự động lưu vào localStorage">
      {label}
    </span>
  );
});
import { downloadDocxTemplate } from '../utils/downloadDocxTemplate';
import { useDocxImport } from '../hooks/useDocxImport';
import { useToast } from '../context/ToastContext';
import { useSlideStudio } from '../hooks/useSlideStudio';
import { useSlideProjectManager } from '../hooks/useSlideProjectManager';
import SlideThumbnailList from './slide-studio/SlideThumbnailList';
import SlideCanvas from './slide-studio/SlideCanvas';
import SlideSidebar from './slide-studio/SlideSidebar';
import SlideToolbar from './slide-studio/SlideToolbar';
import AIGenerateModal from './slide-studio/AIGenerateModal';
import SlideExportModal from './slide-studio/SlideExportModal';
import SlideProjectSwitcher from './slide-studio/SlideProjectSwitcher';
import SlideOnboardingWizard, {
  shouldShowSlideWizard,
  type WizardSettings,
} from './slide-studio/SlideOnboardingWizard';
import SlideHelpBanner, { SLIDE_TIPS_KEY } from './slide-studio/SlideHelpBanner';
import SlideGeneratingOverlay from './slide-studio/SlideGeneratingOverlay';
import SlidePromptBar from './slide-studio/SlidePromptBar';
import SlidePresenter from './slide-studio/SlidePresenter';
import { loadGlobalBrandKit, saveGlobalBrandKit, subscribeBrandKit } from '../utils/globalBrandKit';

interface Props {
  onClose: () => void;
}

const AISlideCreatorWorkspace: React.FC<Props> = ({ onClose }) => {
  const s = useSlideStudio();
  const pm = useSlideProjectManager();
  const { parseDocx } = useDocxImport();
  const { showToast } = useToast();

  const [exportDropOpen, setExportDropOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pptx' | 'pdf' | 'png'>('pptx');

  // ── Prompt Preset library — campaign template marketer dùng đi dùng lại ──
  interface SlidePromptPreset { id: string; name: string; topic: string; style: string; slideCount: number; language: string; carouselMode: boolean; aspectRatio: string; savedAt: string; }
  const PRESETS_KEY = 'skyverses_slide_prompt_presets';
  const [promptPresets, setPromptPresets] = useState<SlidePromptPreset[]>([]);
  const [showPresetModal, setShowPresetModal] = useState(false);
  const [showSavePresetDialog, setShowSavePresetDialog] = useState(false);
  const [presetNameInput, setPresetNameInput] = useState('');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(PRESETS_KEY);
      if (saved) setPromptPresets(JSON.parse(saved));
    } catch {}
  }, []);

  // ── Cross-workspace Brand Kit — load global on mount + subscribe updates ──
  useEffect(() => {
    const apply = () => {
      const kit = loadGlobalBrandKit();
      if (!kit) return;
      if (kit.brandName) s.setBrandSlogan(kit.brandName); // hook chưa có brandName field — map vào slogan tạm
      if (kit.slogan) s.setBrandSlogan(kit.slogan);
      if (kit.description) s.setBrandDescription(kit.description);
      if (kit.logoUrl) s.setBrandLogo(kit.logoUrl);
      if (kit.colors?.length >= 4) s.setBrandColors(kit.colors);
    };
    apply();
    return subscribeBrandKit(() => apply());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveToGlobalBrandKit = useCallback(() => {
    const ok = saveGlobalBrandKit({
      slogan: s.brandSlogan,
      description: s.brandDescription,
      logoUrl: s.brandLogo ?? undefined,
      colors: s.brandColors,
    });
    showToast(ok ? '🌐 Đã lưu Bộ thương hiệu chung — Banner & Slide đều dùng được' : 'Lỗi lưu', ok ? 'success' : 'error');
  }, [s.brandSlogan, s.brandDescription, s.brandLogo, s.brandColors, showToast]);

  const savePromptPreset = useCallback(() => {
    if (!presetNameInput.trim() || !s.deckTopic.trim()) {
      showToast('Cần tên preset + chủ đề slide', 'error');
      return;
    }
    const preset: SlidePromptPreset = {
      id: 'p_' + Date.now(),
      name: presetNameInput.trim(),
      topic: s.deckTopic,
      style: s.deckStyle,
      slideCount: s.slideCount,
      language: s.deckLanguage,
      carouselMode: s.carouselMode,
      aspectRatio: s.aspectRatio,
      savedAt: new Date().toISOString(),
    };
    setPromptPresets(prev => {
      const updated = [preset, ...prev].slice(0, 20);
      try { localStorage.setItem(PRESETS_KEY, JSON.stringify(updated)); } catch {}
      return updated;
    });
    setPresetNameInput('');
    setShowSavePresetDialog(false);
    showToast(`💾 Đã lưu preset "${preset.name}"`, 'success');
  }, [presetNameInput, s, showToast]);

  const applyPromptPreset = useCallback((p: SlidePromptPreset) => {
    s.setDeckTopic(p.topic);
    s.setDeckStyle(p.style);
    s.setSlideCount(p.slideCount);
    s.setDeckLanguage(p.language as any);
    s.setCarouselMode(p.carouselMode);
    s.setAspectRatio(p.aspectRatio as any);
    setShowPresetModal(false);
    showToast(`↻ Đã áp dụng preset "${p.name}"`, 'success');
  }, [s, showToast]);

  const deletePromptPreset = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setPromptPresets(prev => {
      const updated = prev.filter(x => x.id !== id);
      try { localStorage.setItem(PRESETS_KEY, JSON.stringify(updated)); } catch {}
      return updated;
    });
  }, []);
  const [isDocxLoading, setIsDocxLoading] = useState(false);
  const docxFileRef = useRef<HTMLInputElement>(null);

  const handleDocxImport = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsDocxLoading(true);
    try {
      const outline = await parseDocx(file);
      showToast(`Đã nhập ${outline.length} slides từ DOCX — đang tạo...`, 'success');
      s.setDocxOutline(outline);
      s.generateDeck(outline);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Lỗi khi nhập DOCX', 'error');
    } finally {
      setIsDocxLoading(false);
      if (docxFileRef.current) docxFileRef.current.value = '';
    }
  }, [parseDocx, showToast, s]);

  // ── Wizard & Help banner ───────────────────────────────────────────────────
  const [showWizard, setShowWizard] = useState(() => shouldShowSlideWizard());
  const [showHelpBanner, setShowHelpBanner] = useState(false);
  const [isPresentMode, setIsPresentMode] = useState(false);

  // Track first time slides appear after wizard/generation
  const prevSlideCountRef = useRef(s.slides.length);
  useEffect(() => {
    const prev = prevSlideCountRef.current;
    const curr = s.slides.length;
    if (prev === 0 && curr > 0 && !localStorage.getItem(SLIDE_TIPS_KEY)) {
      setShowHelpBanner(true);
    }
    prevSlideCountRef.current = curr;
  }, [s.slides.length]);

  const handleWizardComplete = useCallback((settings: WizardSettings) => {
    s.setDeckTopic(settings.deckTopic);
    s.setDeckStyle(settings.deckStyle);
    s.setSlideCount(settings.slideCount);
    s.setDeckLanguage(settings.deckLanguage);
    setShowWizard(false);
    // Open generate modal after a short delay so state updates settle
    setTimeout(() => s.setIsGenerateModalOpen(true), 80);
  }, [s]);

  const handleWizardSkip = useCallback(() => {
    setShowWizard(false);
  }, []);

  // Track if we're in the middle of loading a project (to skip the auto-save)
  const isLoadingProjectRef = useRef(false);

  // ── Load active project into studio on first mount ─────────────────────────
  useEffect(() => {
    const project = pm.loadProject(pm.activeProjectId);
    isLoadingProjectRef.current = true;
    s.setSlides(project.slides ?? []);
    s.setDeckTopic(project.deckTopic ?? '');
    s.setDeckStyle(project.deckStyle ?? 'corporate');
    s.setDeckLanguage(project.deckLanguage ?? 'vi');
    s.setSlideCount(project.slideCount ?? 6);
    if (project.slides?.length > 0) {
      s.setActiveSlideId(project.slides[0].id);
    }
    // Allow the state updates to settle before re-enabling auto-save
    setTimeout(() => { isLoadingProjectRef.current = false; }, 100);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Auto-save studio state → current project (debounced 500ms) ────────────
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (isLoadingProjectRef.current) return;

    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => {
      pm.saveCurrentProject({
        id: pm.activeProjectId,
        slides: s.slides,
        deckTopic: s.deckTopic,
        deckStyle: s.deckStyle,
        deckLanguage: s.deckLanguage,
        slideCount: s.slideCount,
      });
    }, 500);

    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.slides, s.deckTopic, s.deckStyle, s.deckLanguage, s.slideCount]);

  // ── Keyboard shortcuts: ⌘Z undo, ⌘← prev, ⌘→ next, ⌘D duplicate, ⌘N new slide ──
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Bỏ qua khi đang typing trong input/textarea/contenteditable
      const target = e.target as HTMLElement;
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target.isContentEditable) {
        // Chỉ cho phép ⌘Z trong input để undo native (không xử lý)
        return;
      }
      const meta = e.metaKey || e.ctrlKey;
      if (!meta) return;

      // ⌘Z = undo, ⌘⇧Z hoặc ⌘Y = redo
      if (e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        s.undo();
      } else if ((e.key.toLowerCase() === 'z' && e.shiftKey) || e.key.toLowerCase() === 'y') {
        e.preventDefault();
        s.redo();
      } else if (e.key === 'ArrowLeft') {
        // ⌘← prev slide
        e.preventDefault();
        const idx = s.slides.findIndex(sl => sl.id === s.activeSlideId);
        if (idx > 0) s.setActiveSlideId(s.slides[idx - 1].id);
      } else if (e.key === 'ArrowRight') {
        // ⌘→ next slide
        e.preventDefault();
        const idx = s.slides.findIndex(sl => sl.id === s.activeSlideId);
        if (idx >= 0 && idx < s.slides.length - 1) s.setActiveSlideId(s.slides[idx + 1].id);
      } else if (e.key.toLowerCase() === 'd') {
        // ⌘D = duplicate active slide (override browser bookmark)
        e.preventDefault();
        if (s.activeSlideId) s.duplicateSlide(s.activeSlideId);
      } else if (e.key.toLowerCase() === 'n' && !e.shiftKey) {
        // ⌘N = new blank slide
        e.preventDefault();
        s.addSlide();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.slides, s.activeSlideId]);

  // ── Project switch ─────────────────────────────────────────────────────────
  const handleSwitchProject = useCallback((id: string) => {
    // Save current state first
    pm.saveCurrentProject({
      id: pm.activeProjectId,
      slides: s.slides,
      deckTopic: s.deckTopic,
      deckStyle: s.deckStyle,
      deckLanguage: s.deckLanguage,
      slideCount: s.slideCount,
    });

    // Load the new project
    const project = pm.switchProject(id);
    isLoadingProjectRef.current = true;
    s.setSlides(project.slides ?? []);
    s.setDeckTopic(project.deckTopic ?? '');
    s.setDeckStyle(project.deckStyle ?? 'corporate');
    s.setDeckLanguage(project.deckLanguage ?? 'vi');
    s.setSlideCount(project.slideCount ?? 6);
    if (project.slides?.length > 0) {
      s.setActiveSlideId(project.slides[0].id);
    } else {
      s.setActiveSlideId('');
    }
    setTimeout(() => { isLoadingProjectRef.current = false; }, 100);
  }, [pm, s]);

  // ── Create project ─────────────────────────────────────────────────────────
  const handleCreateProject = useCallback((name: string) => {
    // Save current before creating
    pm.saveCurrentProject({
      id: pm.activeProjectId,
      slides: s.slides,
      deckTopic: s.deckTopic,
      deckStyle: s.deckStyle,
      deckLanguage: s.deckLanguage,
      slideCount: s.slideCount,
    });

    const project = pm.createProject(name);
    isLoadingProjectRef.current = true;
    s.setSlides([]);
    s.setDeckTopic('');
    s.setDeckStyle('corporate');
    s.setDeckLanguage('vi');
    s.setSlideCount(6);
    s.setActiveSlideId('');
    setTimeout(() => { isLoadingProjectRef.current = false; }, 100);
    // suppress unused-var warning — project returned but not needed here
    void project;
  }, [pm, s]);

  // ── Duplicate project ──────────────────────────────────────────────────────
  const handleDuplicateProject = useCallback((id: string) => {
    // Save current first
    pm.saveCurrentProject({
      id: pm.activeProjectId,
      slides: s.slides,
      deckTopic: s.deckTopic,
      deckStyle: s.deckStyle,
      deckLanguage: s.deckLanguage,
      slideCount: s.slideCount,
    });

    const newId = pm.duplicateProject(id);

    // Switch into the new duplicate
    const project = pm.loadProject(newId);
    isLoadingProjectRef.current = true;
    s.setSlides(project.slides ?? []);
    s.setDeckTopic(project.deckTopic ?? '');
    s.setDeckStyle(project.deckStyle ?? 'corporate');
    s.setDeckLanguage(project.deckLanguage ?? 'vi');
    s.setSlideCount(project.slideCount ?? 6);
    if (project.slides?.length > 0) {
      s.setActiveSlideId(project.slides[0].id);
    } else {
      s.setActiveSlideId('');
    }
    setTimeout(() => { isLoadingProjectRef.current = false; }, 100);
  }, [pm, s]);

  // ── Delete project ─────────────────────────────────────────────────────────
  const handleDeleteProject = useCallback((id: string) => {
    const nextActiveId = pm.deleteProject(id);

    // If we deleted the active project, load the new active one
    if (id === pm.activeProjectId) {
      const project = pm.loadProject(nextActiveId);
      isLoadingProjectRef.current = true;
      s.setSlides(project.slides ?? []);
      s.setDeckTopic(project.deckTopic ?? '');
      s.setDeckStyle(project.deckStyle ?? 'corporate');
      s.setDeckLanguage(project.deckLanguage ?? 'vi');
      s.setSlideCount(project.slideCount ?? 6);
      if (project.slides?.length > 0) {
        s.setActiveSlideId(project.slides[0].id);
      } else {
        s.setActiveSlideId('');
      }
      setTimeout(() => { isLoadingProjectRef.current = false; }, 100);
    }
  }, [pm, s]);

  // ── Slide update handlers ──────────────────────────────────────────────────

  const handleChangeLayout = useCallback((id: string, layout: any) => {
    s.updateSlide(id, { layout });
  }, [s.updateSlide]);

  const handleChangeTextColor = useCallback((id: string, color: 'light' | 'dark') => {
    s.updateSlide(id, { textColor: color });
  }, [s.updateSlide]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="fixed inset-0 z-[500] flex flex-col bg-white dark:bg-[var(--atlas-bg-panel)]"
    >
      {/* ══ Onboarding Wizard ═══════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showWizard && (
          <SlideOnboardingWizard
            onComplete={handleWizardComplete}
            onSkip={handleWizardSkip}
          />
        )}
      </AnimatePresence>
      {/* ══ Header Nav ══════════════════════════════════════════════════════════ */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-black/[0.06] dark:border-white/[0.08] bg-white/90 dark:bg-[var(--atlas-bg-panel)]/90 backdrop-blur shrink-0">
        {/* Left: Close + Title + Project Switcher */}
        <div className="flex items-center gap-3">
          <motion.button
            onClick={onClose}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/[0.04] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.06] text-[12px] font-medium text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white transition-all"
          >
            <X size={13} />
            Đóng
          </motion.button>

          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-brand-blue/10 flex items-center justify-center">
              <Layers size={12} className="text-brand-blue" />
            </div>
            <span className="text-[13px] font-bold text-slate-800 dark:text-white hidden sm:block">
              AI Slide Creator
            </span>
            {/* Autosave indicator — đếm thời gian từ lần lưu cuối */}
            <SaveStatusBadge lastSavedAt={s.lastSavedAt} />
          </div>

          {/* Project Switcher */}
          <div className="hidden sm:block">
            <SlideProjectSwitcher
              projects={pm.projects}
              activeProjectId={pm.activeProjectId}
              onSwitch={handleSwitchProject}
              onCreate={handleCreateProject}
              onRename={pm.renameProject}
              onDuplicate={handleDuplicateProject}
              onDelete={handleDeleteProject}
            />
          </div>
        </div>

        {/* Center: Undo / Redo + Slide count */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={s.undo}
            disabled={!s.canUndo}
            title="Hoàn tác (⌘Z)"
            className="p-2 rounded-lg hover:bg-black/[0.05] dark:hover:bg-white/[0.05] text-slate-500 dark:text-white/40 disabled:opacity-30 transition-colors"
          >
            <Undo2 size={14} />
          </button>
          <button
            onClick={s.redo}
            disabled={!s.canRedo}
            title="Làm lại (⌘⇧Z)"
            className="p-2 rounded-lg hover:bg-black/[0.05] dark:hover:bg-white/[0.05] text-slate-500 dark:text-white/40 disabled:opacity-30 transition-colors"
          >
            <Redo2 size={14} />
          </button>

          {s.slides.length > 0 && (
            <span className="px-2.5 py-1 rounded-full bg-brand-blue/[0.08] text-brand-blue text-[10px] font-bold ml-1">
              {s.slides.length} slides
            </span>
          )}
        </div>

        {/* Right: Generate + Export */}
        <div className="flex items-center gap-2">
          {/* Sync brand kit chung — share giữa Banner / Slide / Storyboard */}
          <button
            onClick={saveToGlobalBrandKit}
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 dark:text-cyan-400 text-[10px] font-bold hover:bg-cyan-500/20 transition-colors"
            title="Lưu logo + tagline + colors hiện tại vào Bộ thương hiệu CHUNG (Banner & Slide đều load được)"
          >
            🌐 Sync Brand
          </button>
          {/* Save Preset trigger */}
          {s.deckTopic.trim() && (
            <button
              onClick={() => setShowSavePresetDialog(true)}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-500 dark:text-purple-400 text-[10px] font-bold hover:bg-purple-500/20 transition-colors"
              title="Lưu chủ đề + style + tỷ lệ thành campaign preset"
            >
              💾 Lưu preset
            </button>
          )}
          {/* Open Presets list */}
          {promptPresets.length > 0 && (
            <button
              onClick={() => setShowPresetModal(true)}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-500 dark:text-purple-400 text-[10px] font-bold hover:bg-purple-500/20 transition-colors"
              title={`${promptPresets.length} preset đã lưu`}
            >
              📚 Presets ({promptPresets.length})
            </button>
          )}
          {/* Quick generate trigger */}
          {s.slides.length === 0 && (
            <motion.button
              onClick={() => s.setIsGenerateModalOpen(true)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              disabled={!s.deckTopic.trim() || s.isGeneratingDeck}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-blue text-white text-[11px] font-bold shadow-sm shadow-brand-blue/20 hover:bg-brand-blue/90 transition-all disabled:opacity-40"
            >
              <Sparkles size={12} />
              Tạo Deck
            </motion.button>
          )}

          {/* Free badge */}
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
            🆓 Free
          </span>

          {/* Export dropdown */}
          {s.slides.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setExportDropOpen(v => !v)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/[0.04] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.06] text-[11px] font-medium text-slate-600 dark:text-white/60 hover:border-brand-blue/40 transition-all"
              >
                <Download size={13} />
                Xuất
                <ChevronDown size={10} className={`transition-transform ${exportDropOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {exportDropOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ duration: 0.13 }}
                    className="absolute top-full mt-1.5 right-0 z-50 bg-white dark:bg-[var(--atlas-bg-panel)] border border-black/[0.06] dark:border-white/[0.06] rounded-xl shadow-atlas-lg overflow-hidden min-w-[130px]"
                  >
                    {[
                      { label: 'PowerPoint (.pptx)', value: 'pptx' as const },
                      { label: 'PDF', value: 'pdf' as const },
                      { label: 'PNG (zip)', value: 'png' as const },
                    ].map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => {
                          setExportFormat(opt.value);
                          setExportDropOpen(false);
                          s.setIsExportModalOpen(true);
                        }}
                        className="w-full text-left px-3 py-2 text-[11px] font-medium text-slate-600 dark:text-white/60 hover:bg-brand-blue/[0.06] hover:text-brand-blue transition-colors"
                      >
                        {opt.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Present button */}
          {s.slides.length > 0 && (
            <button
              onClick={() => setIsPresentMode(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-all"
              title="Trình chiếu toàn màn hình (Slideshow)"
            >
              <Play size={12} />
              Trình chiếu
            </button>
          )}
        </div>
      </div>

      {/* ══ Main body — 3 panels ════════════════════════════════════════════════ */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Panel 1: Thumbnail list */}
        {s.slides.length > 0 && (
          <SlideThumbnailList
            slides={s.slides}
            activeSlideId={s.activeSlideId}
            onSelectSlide={s.setActiveSlideId}
            onAddSlide={s.addSlide}
            onRemoveSlide={s.removeSlide}
            onDuplicateSlide={s.duplicateSlide}
            onMoveSlide={s.moveSlide}
          />
        )}


        {/* Panel 2: Canvas + Toolbar */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {s.slides.length === 0 ? (
            /* ── Rich empty state / onboarding ── */
            <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 dark:bg-[var(--atlas-bg-page)] p-6 overflow-y-auto">
              <div className="w-full max-w-lg flex flex-col items-center gap-6">

                {/* Hero icon with glow */}
                <div className="relative flex items-center justify-center">
                  <motion.div
                    className="absolute w-28 h-28 rounded-full bg-brand-blue/10"
                    animate={{ scale: [1, 1.18, 1], opacity: [0.5, 0.2, 0.5] }}
                    transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-brand-blue to-violet-500 flex items-center justify-center shadow-xl shadow-brand-blue/20 z-10">
                    <Layers size={28} className="text-white" />
                  </div>
                </div>

                {/* Headline */}
                <div className="text-center">
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Tạo bản trình chiếu chuyên nghiệp</h3>
                  <p className="text-sm text-slate-500 dark:text-white/40 leading-relaxed">
                    AI tự động tạo nội dung &amp; hình ảnh đẹp cho từng slide
                  </p>
                </div>

                {/* 3-step guide */}
                <div className="w-full grid grid-cols-3 gap-3">
                  {[
                    { step: '1', emoji: '✍️', label: 'Nhập chủ đề', desc: 'Sidebar bên phải' },
                    { step: '2', emoji: '🎨', label: 'Chọn style', desc: 'Phong cách bài trình' },
                    { step: '3', emoji: '🚀', label: 'Nhấn Tạo Deck', desc: 'AI lo phần còn lại' },
                  ].map((item, i) => (
                    <motion.div
                      key={item.step}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.12, duration: 0.4 }}
                      className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-white dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] shadow-sm"
                    >
                      <div className="w-8 h-8 rounded-xl bg-brand-blue/10 flex items-center justify-center text-base">{item.emoji}</div>
                      <p className="text-[11px] font-bold text-slate-700 dark:text-white/80">{item.label}</p>
                      <p className="text-[9px] text-slate-400 dark:text-white/50 text-center">{item.desc}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Primary CTA — pulsing */}
                <div className="relative">
                  <motion.div
                    className="absolute inset-0 rounded-xl bg-brand-blue/30"
                    animate={{ scale: [1, 1.14, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
                  />
                  <motion.button
                    onClick={() => s.setIsGenerateModalOpen(true)}
                    disabled={!s.deckTopic.trim()}
                    whileHover={{ scale: 1.04, boxShadow: '0 12px 32px rgba(201, 168, 76,0.35)' }}
                    whileTap={{ scale: 0.97 }}
                    className="relative flex items-center gap-2 px-7 py-3 rounded-xl bg-brand-blue text-white font-bold text-sm shadow-lg shadow-brand-blue/20 hover:bg-brand-blue/90 transition-all disabled:opacity-40 disabled:shadow-none"
                  >
                    <Sparkles size={16} />
                    Tạo Deck ngay
                  </motion.button>
                </div>

                {/* Mode showcase cards */}
                <div className="w-full grid grid-cols-2 gap-3">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                    className="p-3 rounded-xl bg-white dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06]"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-base">📝</span>
                      <span className="text-[11px] font-bold text-slate-700 dark:text-white/80">Text Deck</span>
                    </div>
                    <p className="text-[9px] text-slate-400 dark:text-gray-400 leading-snug">
                      Slides có nội dung text + hình nền. Chỉnh sửa trực tiếp như Canva.
                    </p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                    className="p-3 rounded-xl bg-violet-500/[0.06] border border-violet-500/20"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-base">🎨</span>
                      <span className="text-[11px] font-bold text-violet-700 dark:text-violet-300">Image Deck</span>
                      <span className="ml-auto px-1.5 py-0.5 rounded-full bg-violet-500 text-white text-[7px] font-bold">NEW</span>
                    </div>
                    <p className="text-[9px] text-violet-600 dark:text-violet-300/60 leading-snug">
                      Toàn ảnh AI fullscreen. Bật toggle &ldquo;Image Deck Mode&rdquo; ở sidebar.
                    </p>
                  </motion.div>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-3 w-full">
                  <div className="flex-1 h-px bg-black/[0.06] dark:bg-white/[0.06]" />
                  <span className="text-[11px] text-slate-400 dark:text-white/45 font-medium">hoặc</span>
                  <div className="flex-1 h-px bg-black/[0.06] dark:bg-white/[0.06]" />
                </div>

                {/* Secondary actions */}
                <div className="flex flex-col gap-2.5 w-full">
                  <label
                    className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border-2 border-dashed border-brand-blue/40 text-brand-blue text-[12px] font-semibold hover:bg-brand-blue/[0.05] transition-all cursor-pointer ${
                      (isDocxLoading || s.isGeneratingDeck) ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
                    }`}
                  >
                    {isDocxLoading ? (
                      <><span className="w-3.5 h-3.5 border-2 border-brand-blue/40 border-t-brand-blue rounded-full animate-spin" />Đang xử lý...</>
                    ) : (
                      <><FileText size={14} />Import từ file .docx</>
                    )}
                    <input
                      ref={docxFileRef}
                      type="file"
                      accept=".docx"
                      onChange={handleDocxImport}
                      disabled={isDocxLoading || s.isGeneratingDeck}
                      className="hidden"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => downloadDocxTemplate()}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-black/[0.08] dark:border-white/[0.08] text-[12px] font-medium text-slate-500 dark:text-white/40 hover:text-brand-blue hover:border-brand-blue/30 transition-all"
                  >
                    <Download size={13} />
                    Tải template mẫu (.docx)
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Toolbar */}
              <div className="px-4 pt-3 pb-2 border-b border-black/[0.05] dark:border-white/[0.08] bg-white/50 dark:bg-[var(--atlas-bg-panel)]/50 shrink-0">
                <SlideToolbar
                  slide={s.activeSlide}
                  slides={s.slides}
                  onRegenBg={s.genSlideBg}
                  onGenAllBg={s.genAllSlideBg}
                  onClearBg={s.clearSlideBg}
                  onUploadBg={(id, dataUrl) => s.updateSlide(id, { bgImageUrl: dataUrl, bgStatus: 'done', bgJobId: null })}
                  onDuplicateSlide={s.duplicateSlide}
                  onChangeLayout={handleChangeLayout}
                  onChangeTextColor={handleChangeTextColor}
                  onAISuggest={s.fetchAISuggestions}
                  onApplySuggestion={s.applySuggestion}
                  isGenAlling={s.isGenAlling}
                  genAllProgress={s.genAllProgress ?? undefined}
                />
              </div>


              {/* Help Banner */}
              <SlideHelpBanner
                visible={showHelpBanner}
                onDismiss={() => setShowHelpBanner(false)}
              />

              {/* Canvas */}
              <SlideCanvas
                slide={s.activeSlide}
                aspectRatio={s.aspectRatio}
                onUpdateTextBlock={s.updateTextBlock}
                onAddTextBlock={s.addTextBlock}
                onRemoveTextBlock={s.removeTextBlock}
                onBringTextBlockForward={s.bringTextBlockForward}
                onSendTextBlockBackward={s.sendTextBlockBackward}
                onDuplicateTextBlock={s.duplicateTextBlock}
                onPasteTextBlock={s.pasteTextBlock}
                onUpdateSlide={s.updateSlide}
                bottomBar={
                  <SlidePromptBar
                    slide={s.activeSlide}
                    onUpdateSlide={s.updateSlide}
                    onGenSlideBg={s.genSlideBg}
                    onAISuggest={s.fetchAISuggestions}
                  />
                }
              />

              {/* Speaker notes — collapsible panel dưới canvas, không in lên slide visual */}
              <SpeakerNotesPanel
                slide={s.activeSlide}
                onUpdate={(notes) => s.updateSlide(s.activeSlide!.id, { notes })}
              />
            </>
          )}

          {/* Generating overlay — covers Panel 2 while deck is being created */}
          <AnimatePresence>
            {s.isGeneratingDeck && (
              <SlideGeneratingOverlay
                isVisible={s.isGeneratingDeck}
                stage={s.generatingStage}
                progress={s.generatingProgress}
                streamText={s.generatingText}
                onCancel={s.cancelGeneration}
                isGenAlling={s.isGenAlling}
                genAllProgress={s.genAllProgress}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Panel 3: AI Sidebar */}
        <SlideSidebar
          deckTopic={s.deckTopic}
          setDeckTopic={s.setDeckTopic}
          deckStyle={s.deckStyle}
          setDeckStyle={s.setDeckStyle}
          deckLanguage={s.deckLanguage}
          setDeckLanguage={s.setDeckLanguage}
          slideCount={s.slideCount}
          setSlideCount={s.setSlideCount}
          refImages={s.refImages}
          setRefImages={s.setRefImages}
          isGeneratingDeck={s.isGeneratingDeck}
          onOpenGenerateModal={() => s.setIsGenerateModalOpen(true)}
          onCancelGeneration={s.cancelGeneration}
          onDocxImport={(outline) => {
            s.setDocxOutline(outline);
            s.generateDeck(outline);
          }}
          brandLogo={s.brandLogo}
          setBrandLogo={s.setBrandLogo}
          brandSlogan={s.brandSlogan}
          setBrandSlogan={s.setBrandSlogan}
          brandDescription={s.brandDescription}
          setBrandDescription={s.setBrandDescription}
          brandColors={s.brandColors}
          setBrandColors={s.setBrandColors}
          carouselMode={s.carouselMode}
          setCarouselMode={s.setCarouselMode}
          aspectRatio={s.aspectRatio}
          setAspectRatio={s.setAspectRatio}
          imageDeckMode={s.imageDeckMode}
          setImageDeckMode={s.setImageDeckMode}
        />
      </div>

      {/* ══ Modals ══════════════════════════════════════════════════════════════ */}
      <AIGenerateModal
        isOpen={s.isGenerateModalOpen}
        onClose={() => s.setIsGenerateModalOpen(false)}
        onConfirm={() => s.generateDeck()}
        deckTopic={s.deckTopic}
        deckStyle={s.deckStyle}
        deckLanguage={s.deckLanguage}
        slideCount={s.slideCount}
        isGenerating={s.isGeneratingDeck}
        imageDeckMode={s.imageDeckMode}
      />

      <SlideExportModal
        isOpen={s.isExportModalOpen}
        onClose={() => s.setIsExportModalOpen(false)}
        slides={s.slides}
        initialFormat={exportFormat}
      />

      {/* ── Slideshow Presenter ── */}
      {isPresentMode && s.slides.length > 0 && (
        <SlidePresenter
          slides={s.slides}
          initialIndex={s.slides.findIndex(sl => sl.id === s.activeSlideId) ?? 0}
          onClose={() => setIsPresentMode(false)}
        />
      )}

      {/* ── Save Prompt Preset Dialog ── */}
      <AnimatePresence>
        {showSavePresetDialog && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[700] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
            onClick={() => setShowSavePresetDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-md bg-white dark:bg-[var(--atlas-bg-panel)] rounded-lg border border-black/[0.08] dark:border-white/[0.08] shadow-atlas-lg overflow-hidden"
            >
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/15 text-purple-500 flex items-center justify-center">📚</div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white">Lưu Campaign Preset</h3>
                    <p className="text-[10px] text-slate-400 dark:text-gray-500">Tái sử dụng chủ đề + style + tỷ lệ cho campaign tương lai</p>
                  </div>
                </div>
                <input
                  value={presetNameInput}
                  onChange={e => setPresetNameInput(e.target.value)}
                  placeholder='Tên preset (vd: "Pitch Series A", "Onboarding Q1")'
                  autoFocus
                  onKeyDown={e => { if (e.key === 'Enter') savePromptPreset(); }}
                  className="w-full text-[12px] bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-xl px-3 py-2.5 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-brand-blue/50 mb-3"
                />
                <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05] rounded-xl p-2.5 mb-4 text-[10px] space-y-1">
                  <div><span className="text-slate-400">Chủ đề:</span> <span className="font-semibold text-slate-700 dark:text-white">{s.deckTopic}</span></div>
                  <div><span className="text-slate-400">Style:</span> <span className="font-semibold text-slate-700 dark:text-white">{s.deckStyle}</span> · <span className="text-slate-400">Slide:</span> <span className="font-semibold text-slate-700 dark:text-white">{s.slideCount}</span> · <span className="text-slate-400">Tỷ lệ:</span> <span className="font-semibold text-slate-700 dark:text-white">{s.aspectRatio}</span></div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setShowSavePresetDialog(false)} className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-gray-300 text-[11px] font-bold hover:bg-slate-200 dark:hover:bg-white/[0.08] transition-colors">Huỷ</button>
                  <button onClick={savePromptPreset} disabled={!presetNameInput.trim()} className="flex-1 py-2 rounded-xl bg-purple-500 text-white text-[11px] font-bold hover:brightness-110 disabled:opacity-40 transition-all">Lưu preset</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Preset List Modal ── */}
      <AnimatePresence>
        {showPresetModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[700] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
            onClick={() => setShowPresetModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-lg bg-white dark:bg-[var(--atlas-bg-panel)] rounded-lg border border-black/[0.08] dark:border-white/[0.08] shadow-atlas-lg overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="px-5 py-4 border-b border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/15 text-purple-500 flex items-center justify-center">📚</div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white">Campaign Preset đã lưu</h3>
                    <p className="text-[10px] text-slate-400 dark:text-gray-500">{promptPresets.length}/20 preset · click để áp dụng</p>
                  </div>
                </div>
                <button onClick={() => setShowPresetModal(false)} className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white"><X size={16} /></button>
              </div>
              <div className="overflow-y-auto p-3 space-y-1.5">
                {promptPresets.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 dark:text-gray-500 text-[12px]">Chưa có preset nào.</div>
                ) : promptPresets.map(p => (
                  <button
                    key={p.id}
                    onClick={() => applyPromptPreset(p)}
                    className="w-full text-left p-3 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-white/[0.02] hover:border-brand-blue/40 hover:bg-brand-blue/[0.04] transition-all group flex items-start justify-between gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="text-[12px] font-bold text-slate-800 dark:text-white truncate">{p.name}</p>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-500 font-bold">{p.style}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-white/[0.06] text-slate-500 dark:text-gray-400 font-semibold">{p.slideCount} slide · {p.aspectRatio}</span>
                        {p.carouselMode && <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 font-bold">Carousel</span>}
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-gray-400 line-clamp-2">{p.topic}</p>
                      <p className="text-[9px] text-slate-300 dark:text-gray-600 mt-1">{new Date(p.savedAt).toLocaleDateString('vi-VN')}</p>
                    </div>
                    <button onClick={(e) => deletePromptPreset(e, p.id)} className="shrink-0 p-1.5 rounded-lg text-slate-300 dark:text-gray-600 hover:text-rose-500 hover:bg-rose-500/10 transition-colors" title="Xoá preset">
                      <X size={12} />
                    </button>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AISlideCreatorWorkspace;
