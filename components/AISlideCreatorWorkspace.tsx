
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Download, Undo2, Redo2, Sparkles,
  ChevronDown, Layers, FileText, Play,
} from 'lucide-react';
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
  const handleUpdateTitle = useCallback((id: string, val: string) => {
    s.updateSlide(id, { title: val });
  }, [s.updateSlide]);

  const handleUpdateBody = useCallback((id: string, val: string) => {
    s.updateSlide(id, { body: val });
  }, [s.updateSlide]);

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
      className="fixed inset-0 z-[500] flex flex-col bg-white dark:bg-[#0d0d0f]"
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
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-black/[0.06] dark:border-white/[0.05] bg-white/90 dark:bg-[#0d0d0f]/90 backdrop-blur shrink-0">
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
            {s.isDirty && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title="Có thay đổi chưa lưu" />
            )}
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
                    className="absolute top-full mt-1.5 right-0 z-50 bg-white dark:bg-[#1a1a1e] border border-black/[0.06] dark:border-white/[0.06] rounded-xl shadow-xl overflow-hidden min-w-[130px]"
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
            /* Empty state */
            <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 dark:bg-[#0d0d0f] p-8">
              <div className="w-16 h-16 rounded-2xl bg-brand-blue/10 flex items-center justify-center mb-4">
                <Layers size={28} className="text-brand-blue" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Bắt đầu tạo Slide</h3>
              <p className="text-sm text-slate-500 dark:text-white/40 text-center max-w-sm mb-6">
                Nhập chủ đề ở sidebar bên phải, chọn phong cách và số slides, rồi nhấn <strong>Tạo toàn bộ Deck</strong>.
              </p>

              {/* Primary CTA */}
              <motion.button
                onClick={() => s.setIsGenerateModalOpen(true)}
                disabled={!s.deckTopic.trim()}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-blue text-white font-bold text-sm shadow-lg shadow-brand-blue/20 hover:bg-brand-blue/90 transition-all disabled:opacity-40"
              >
                <Sparkles size={16} />
                Tạo Deck ngay
              </motion.button>

              {/* Divider */}
              <div className="flex items-center gap-3 my-5 w-full max-w-xs">
                <div className="flex-1 h-px bg-black/[0.06] dark:bg-white/[0.06]" />
                <span className="text-[11px] text-slate-400 dark:text-white/20 font-medium">hoặc</span>
                <div className="flex-1 h-px bg-black/[0.06] dark:bg-white/[0.06]" />
              </div>

              {/* Secondary actions: DOCX import + template download */}
              <div className="flex flex-col gap-2.5 w-full max-w-xs">
                {/* Import DOCX */}
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

                {/* Download template */}
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
          ) : (
            <>
              {/* Toolbar */}
              <div className="px-4 pt-3 pb-2 border-b border-black/[0.05] dark:border-white/[0.04] bg-white/50 dark:bg-[#0d0d0f]/50 shrink-0">
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
                onUpdateTitle={handleUpdateTitle}
                onUpdateBody={handleUpdateBody}
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
    </motion.div>
  );
};

export default AISlideCreatorWorkspace;
