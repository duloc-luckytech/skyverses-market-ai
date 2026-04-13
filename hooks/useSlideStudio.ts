
import { useState, useCallback, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { imagesApi } from '../apis/images';
import { pollJobOnce } from './useJobPoller';
import { aiChatStreamViaProxy, aiTextViaProxy } from '../apis/aiCommon';
import { Language } from '../types';
import { DocxOutline } from './useDocxImport';

// ─── Types ────────────────────────────────────────────────────────────────────

export type SlideLayout = 'title-center' | 'title-left' | 'title-image' | 'full-bg' | 'two-col';

export interface AISuggestion {
  title: string;
  body: string;
}

export interface Slide {
  id: string;
  index: number;
  title: string;
  body: string;
  layout: SlideLayout;
  bgImageUrl: string | null;
  bgJobId: string | null;
  bgStatus: 'idle' | 'generating' | 'done' | 'error';
  textColor: 'light' | 'dark';
  aiSuggestions: AISuggestion[];
  isSuggestLoading: boolean;
}

export interface StylePreset {
  id: string;
  label: string;
  emoji: string;
  description: string;
  promptPrefix: string;
}

export const SLIDE_STYLES: StylePreset[] = [
  { id: 'corporate',  label: 'Corporate',  emoji: '💼', description: 'Professional, clean',   promptPrefix: 'professional corporate clean minimal abstract background, subtle texture, ' },
  { id: 'creative',   label: 'Creative',   emoji: '🎨', description: 'Vibrant, artistic',     promptPrefix: 'creative vibrant artistic colorful abstract background, dynamic shapes, ' },
  { id: 'minimal',    label: 'Minimal',    emoji: '◻️', description: 'White space, elegant',  promptPrefix: 'ultra minimal elegant soft white space abstract background, clean lines, ' },
  { id: 'dark',       label: 'Dark Mode',  emoji: '🌑', description: 'Premium dark',          promptPrefix: 'premium dark moody cinematic abstract background, deep shadows, atmospheric, ' },
  { id: 'gradient',   label: 'Gradient',   emoji: '🌈', description: 'Smooth gradients',      promptPrefix: 'smooth soft gradient mesh abstract background, pastel tones, fluid shapes, ' },
  { id: 'nature',     label: 'Nature',     emoji: '🌿', description: 'Organic, calm',         promptPrefix: 'organic natural calm serene abstract background, soft bokeh, earthy tones, ' },
];

export const SLIDE_COUNT_OPTIONS = [4, 6, 8, 10, 12];

export const LAYOUT_OPTIONS: { id: SlideLayout; label: string }[] = [
  { id: 'title-center', label: 'Giữa' },
  { id: 'title-left',   label: 'Trái' },
  { id: 'two-col',      label: '2 cột' },
  { id: 'full-bg',      label: 'Full BG' },
  { id: 'title-image',  label: 'Ảnh phải' },
];

const STORAGE_KEY = 'skyverses_AI-SLIDE-CREATOR_vault';

interface VaultData {
  slides: Slide[];
  deckTopic: string;
  deckStyle: string;
  deckLanguage: Language;
  slideCount: number;
}

function loadVault(): VaultData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as VaultData;
  } catch {
    return null;
  }
}

function saveVault(data: VaultData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage might be full or disabled — fail silently
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const genId = () => Math.random().toString(36).slice(2, 10);

function buildBgPrompt(
  slide: Slide,
  stylePreset: StylePreset,
  refImages?: string[],
  brand?: { slogan?: string; description?: string },
): string {
  const prefix = stylePreset.promptPrefix;
  const refHint = refImages && refImages.length > 0
    ? `, visual style inspired by provided reference images,`
    : '';
  const brandHint = brand?.description
    ? `, thematic context: ${brand.description.slice(0, 80)},`
    : '';
  return `${prefix}for a presentation slide titled "${slide.title}"${refHint}${brandHint} 16:9 widescreen format, no text, no UI elements, no watermarks, cinematic depth, premium quality, high resolution`;
}

function createBlankSlide(index: number): Slide {
  return {
    id: genId(),
    index,
    title: `Slide ${index + 1}`,
    body: '',
    layout: 'title-center',
    bgImageUrl: null,
    bgJobId: null,
    bgStatus: 'idle',
    textColor: 'light',
    aiSuggestions: [],
    isSuggestLoading: false,
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useSlideStudio = () => {
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const isCancelledRef = useRef(false);

  // ── Load from vault (once) ────────────────────────────────────────────────
  const [_vaultLoaded] = useState<VaultData | null>(() => loadVault());

  // ── Deck config ──────────────────────────────────────────────────────────────
  const [deckTopic, setDeckTopic] = useState(_vaultLoaded?.deckTopic ?? '');
  const [deckStyle, setDeckStyle] = useState<string>(_vaultLoaded?.deckStyle ?? 'corporate');
  const [deckLanguage, setDeckLanguage] = useState<Language>(_vaultLoaded?.deckLanguage ?? 'vi');
  const [slideCount, setSlideCount] = useState<number>(_vaultLoaded?.slideCount ?? 6);
  const [refImages, setRefImages] = useState<string[]>([]);

  // ── Brand identity ───────────────────────────────────────────────────────────
  const [brandLogo, setBrandLogo] = useState<string | null>(null);
  const [brandSlogan, setBrandSlogan] = useState('');
  const [brandDescription, setBrandDescription] = useState('');

  // ── DOCX import outline ───────────────────────────────────────────────────────
  const [docxOutline, setDocxOutline] = useState<DocxOutline[] | null>(null);

  // ── Slides ───────────────────────────────────────────────────────────────────
  const [slides, setSlides] = useState<Slide[]>(_vaultLoaded?.slides ?? []);
  const [activeSlideId, setActiveSlideId] = useState<string>(_vaultLoaded?.slides?.[0]?.id ?? '');

  // ── UI state ─────────────────────────────────────────────────────────────────
  const [isGeneratingDeck, setIsGeneratingDeck] = useState(false);
  const [generatingText, setGeneratingText] = useState('');
  const [generatingStage, setGeneratingStage] = useState<'outline' | 'building' | 'images' | 'idle'>('idle');
  const [generatingProgress, setGeneratingProgress] = useState(0);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // ── Undo / Redo ───────────────────────────────────────────────────────────────
  const [undoStack, setUndoStack] = useState<Slide[][]>([]);
  const [redoStack, setRedoStack] = useState<Slide[][]>([]);

  // ── Active slide ─────────────────────────────────────────────────────────────
  const activeSlide = slides.find(s => s.id === activeSlideId) ?? slides[0] ?? null;

  // ── Legacy single-vault persistence (kept for backward-compat migration) ────
  // Note: primary persistence is now handled by useSlideProjectManager via
  // AISlideCreatorWorkspace. This effect only runs to keep the LEGACY_KEY in sync
  // so existing migrateLegacy() calls can find old data if needed. After the
  // project manager migrates the data on first load, this effect is effectively
  // a no-op because migrateLegacy() removes LEGACY_KEY on first read.
  // We intentionally leave it as a low-cost fallback write.
  useEffect(() => {
    saveVault({ slides, deckTopic, deckStyle, deckLanguage: deckLanguage as Language, slideCount });
  }, [slides, deckTopic, deckStyle, deckLanguage, slideCount]);

  // ─── Slide updater ──────────────────────────────────────────────────────────

  const updateSlide = useCallback((id: string, patch: Partial<Slide>) => {
    setSlides(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s));
    setIsDirty(true);
  }, []);

  const pushUndo = useCallback((prev: Slide[]) => {
    setUndoStack(u => [...u.slice(-19), prev]);
    setRedoStack([]);
  }, []);

  // ─── Add / Remove slide ──────────────────────────────────────────────────────

  const addSlide = useCallback(() => {
    setSlides(prev => {
      pushUndo(prev);
      const newSlide = createBlankSlide(prev.length);
      setActiveSlideId(newSlide.id);
      return [...prev, newSlide];
    });
  }, [pushUndo]);

  const removeSlide = useCallback((id: string) => {
    setSlides(prev => {
      if (prev.length <= 1) { showToast('Cần ít nhất 1 slide', 'error'); return prev; }
      pushUndo(prev);
      const remaining = prev.filter(s => s.id !== id).map((s, i) => ({ ...s, index: i }));
      if (activeSlideId === id) setActiveSlideId(remaining[0]?.id ?? '');
      return remaining;
    });
  }, [activeSlideId, pushUndo, showToast]);

  const moveSlide = useCallback((fromIdx: number, toIdx: number) => {
    setSlides(prev => {
      if (fromIdx === toIdx) return prev;
      pushUndo(prev);
      const arr = [...prev];
      const [moved] = arr.splice(fromIdx, 1);
      arr.splice(toIdx, 0, moved);
      return arr.map((s, i) => ({ ...s, index: i }));
    });
  }, [pushUndo]);

  // ─── Undo / Redo ─────────────────────────────────────────────────────────────

  const undo = useCallback(() => {
    setUndoStack(u => {
      if (u.length === 0) return u;
      const prev = u[u.length - 1];
      setRedoStack(r => [...r, slides]);
      setSlides(prev);
      return u.slice(0, -1);
    });
  }, [slides]);

  const redo = useCallback(() => {
    setRedoStack(r => {
      if (r.length === 0) return r;
      const next = r[r.length - 1];
      setUndoStack(u => [...u, slides]);
      setSlides(next);
      return r.slice(0, -1);
    });
  }, [slides]);

  // ─── Gen background image for 1 slide ────────────────────────────────────────

  const genSlideBg = useCallback(async (slideId: string) => {
    const slide = slides.find(s => s.id === slideId);
    const stylePreset = SLIDE_STYLES.find(s => s.id === deckStyle) ?? SLIDE_STYLES[0];
    if (!slide) return;

    updateSlide(slideId, { bgStatus: 'generating', bgJobId: null });

    try {
      const prompt = buildBgPrompt(slide, stylePreset, refImages, { slogan: brandSlogan, description: brandDescription });
      const res = await imagesApi.createJob({
        type: 'text_to_image',
        input: { prompt },
        config: { width: 1280, height: 720, aspectRatio: '16:9', seed: 0, style: '' },
        engine: { provider: 'gommo', model: 'google_image_gen_4_5' },
        enginePayload: { prompt, privacy: 'PRIVATE', projectId: 'default' },
      });

      if (!res?.data?.jobId) throw new Error('No jobId returned');

      const jobId = res.data.jobId;
      updateSlide(slideId, { bgJobId: jobId });

      await pollJobOnce({
        jobId,
        isCancelledRef,
        apiType: 'image',
        onDone: (result) => {
          const url = result.images?.[0] ?? null;
          updateSlide(slideId, { bgImageUrl: url, bgStatus: url ? 'done' : 'error', bgJobId: null });
        },
        onError: (msg) => {
          updateSlide(slideId, { bgStatus: 'error', bgJobId: null });
          showToast(`Lỗi gen ảnh slide: ${msg}`, 'error');
        },
      });
    } catch (err) {
      updateSlide(slideId, { bgStatus: 'error', bgJobId: null });
    }
  }, [slides, deckStyle, refImages, brandSlogan, brandDescription, updateSlide, showToast]);

  // ─── Gen full deck ────────────────────────────────────────────────────────────

  const generateDeck = useCallback(async (importedOutline?: DocxOutline[]) => {
    if (!isAuthenticated) { showToast('Vui lòng đăng nhập để tạo deck', 'error'); return; }
    if (!importedOutline && !deckTopic.trim()) { showToast('Vui lòng nhập chủ đề', 'error'); return; }
    isCancelledRef.current = false;
    setIsGeneratingDeck(true);
    setIsGenerateModalOpen(false);

    try {
      let outline: Array<{ title: string; body: string }> = importedOutline ?? [];

      if (!importedOutline) {
        // 1. Ask AI to generate outline (with brand context)
        const langLabel = { en: 'English', vi: 'Vietnamese', ko: 'Korean', ja: 'Japanese' }[deckLanguage];
        const refHint = refImages.length > 0
          ? `\n- Reference images provided: ${refImages.length} image(s) — incorporate their visual theme into slide descriptions`
          : '';
        const brandHint = brandDescription
          ? `\n- Project description: ${brandDescription}`
          : '';
        const sloganHint = brandSlogan
          ? `\n- Brand slogan: "${brandSlogan}"`
          : '';
        const outlinePrompt = `You are a professional presentation designer.
Generate a slide deck outline for the topic: "${deckTopic}".
Requirements:
- Exactly ${slideCount} slides
- Language: ${langLabel}
- Style: ${deckStyle}
- Each slide needs a concise title (max 8 words) and 2-4 bullet points as body text${refHint}${brandHint}${sloganHint}
- Return ONLY a JSON array, no markdown, no explanation
Format: [{"title": "...", "body": "• point 1\\n• point 2\\n• point 3"}, ...]`;

        // Stream the outline generation for realtime UX
        setGeneratingStage('outline');
        setGeneratingText('');
        setGeneratingProgress(5);
        const raw = await aiChatStreamViaProxy(
          [{ role: 'user', content: outlinePrompt }],
          (token) => setGeneratingText(prev => prev + token),
          undefined,
          4096,
        );
        setGeneratingProgress(30);

        // Parse JSON from AI response
        try {
          // Try array pattern first: [...]
          const arrayMatch = raw.match(/\[[\s\S]*\]/);
          if (arrayMatch) {
            const parsed = JSON.parse(arrayMatch[0]);
            if (Array.isArray(parsed)) {
              outline = parsed;
            } else if (parsed && typeof parsed === 'object') {
              // e.g. {"0": {...}, "1": {...}} — edge case
              const vals = Object.values(parsed);
              const firstArr = vals.find(v => Array.isArray(v));
              outline = Array.isArray(firstArr) ? (firstArr as typeof outline) : (vals as typeof outline);
            }
          } else {
            // Fallback: try object with array value e.g. {"slides": [...]}
            const objMatch = raw.match(/\{[\s\S]*\}/);
            if (objMatch) {
              const parsed = JSON.parse(objMatch[0]);
              const firstArray = Object.values(parsed).find(v => Array.isArray(v));
              if (firstArray) outline = firstArray as typeof outline;
            }
          }
        } catch {
          showToast('AI không trả về đúng format, thử lại nhé', 'error');
          setIsGeneratingDeck(false);
          return;
        }

        if (!Array.isArray(outline) || outline.length === 0) {
          showToast('AI không trả về đúng format, thử lại nhé', 'error');
          setIsGeneratingDeck(false);
          return;
        }
      }

      // 2. Create slides with text content
      // Hard guard: ensure outline is always a proper array before slicing
      if (!Array.isArray(outline)) {
        console.error('[generateDeck] outline is not an array after parsing:', outline);
        showToast('AI không trả về đúng format, thử lại nhé', 'error');
        setIsGeneratingDeck(false);
        return;
      }
      if (outline.length === 0) {
        showToast('Không có nội dung để tạo slide, thử lại nhé', 'error');
        setIsGeneratingDeck(false);
        return;
      }

      setGeneratingStage('building');
      setGeneratingProgress(35);

      const count = (Array.isArray(importedOutline) && importedOutline.length > 0)
        ? importedOutline.length
        : slideCount;
      const newSlides: Slide[] = outline.slice(0, count).map((item, i) => ({
        id: genId(),
        index: i,
        title: item.title || `Slide ${i + 1}`,
        body: item.body || '',
        layout: i === 0 ? 'title-center' : 'title-left',
        bgImageUrl: null,
        bgJobId: null,
        bgStatus: 'idle',
        textColor: deckStyle === 'minimal' ? 'dark' : 'light',
        aiSuggestions: [],
        isSuggestLoading: false,
      }));

      setSlides(newSlides);
      setActiveSlideId(newSlides[0]?.id ?? '');
      setIsDirty(true);
      if (importedOutline) setDocxOutline(null); // clear after use

      // 3. Gen BG images for each slide (sequential to avoid rate limits)
      setGeneratingStage('images');
      const brand = { slogan: brandSlogan, description: brandDescription };
      for (let i = 0; i < newSlides.length; i++) {
        if (isCancelledRef.current) break;
        await genSlideBgDirect(newSlides[i], deckStyle, refImages, brand);
        setGeneratingProgress(35 + Math.round(((i + 1) / newSlides.length) * 65));
      }
    } catch (err) {
      console.error('[generateDeck] error:', err);
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('401') || msg.toLowerCase().includes('unauthorized')) {
        showToast('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại', 'error');
      } else if (msg.includes('429') || msg.toLowerCase().includes('rate limit')) {
        showToast('Quá nhiều yêu cầu, vui lòng thử lại sau vài giây', 'error');
      } else if (msg.toLowerCase().includes('network') || msg.toLowerCase().includes('fetch')) {
        showToast('Lỗi kết nối mạng, kiểm tra lại internet', 'error');
      } else {
        showToast(`Lỗi tạo deck: ${msg.slice(0, 80)}`, 'error');
      }
    } finally {
      setIsGeneratingDeck(false);
      setGeneratingStage('idle');
      setGeneratingProgress(0);
      setGeneratingText('');
    }
  }, [isAuthenticated, deckTopic, deckLanguage, deckStyle, slideCount, refImages, brandSlogan, brandDescription, showToast]);

  // Internal: gen BG for a slide object directly (used in generateDeck loop)
  const genSlideBgDirect = async (
    slide: Slide,
    styleId: string,
    refImgs?: string[],
    brand?: { slogan?: string; description?: string },
  ) => {
    const stylePreset = SLIDE_STYLES.find(s => s.id === styleId) ?? SLIDE_STYLES[0];
    setSlides(prev => prev.map(s => s.id === slide.id ? { ...s, bgStatus: 'generating' } : s));

    try {
      const prompt = buildBgPrompt(slide, stylePreset, refImgs, brand);
      const res = await imagesApi.createJob({
        type: 'text_to_image',
        input: { prompt },
        config: { width: 1280, height: 720, aspectRatio: '16:9', seed: 0, style: '' },
        engine: { provider: 'gommo', model: 'google_image_gen_4_5' },
        enginePayload: { prompt, privacy: 'PRIVATE', projectId: 'default' },
      });

      if (!res?.data?.jobId) throw new Error('No jobId');

      const jobId = res.data.jobId;
      setSlides(prev => prev.map(s => s.id === slide.id ? { ...s, bgJobId: jobId } : s));

      await pollJobOnce({
        jobId,
        isCancelledRef,
        apiType: 'image',
        onDone: (result) => {
          const url = result.images?.[0] ?? null;
          setSlides(prev => prev.map(s =>
            s.id === slide.id
              ? { ...s, bgImageUrl: url, bgStatus: url ? 'done' : 'error', bgJobId: null }
              : s
          ));
        },
        onError: () => {
          setSlides(prev => prev.map(s =>
            s.id === slide.id ? { ...s, bgStatus: 'error', bgJobId: null } : s
          ));
        },
      });
    } catch {
      setSlides(prev => prev.map(s =>
        s.id === slide.id ? { ...s, bgStatus: 'error' } : s
      ));
    }
  };

  // ─── AI Suggest for 1 slide ───────────────────────────────────────────────────

  const fetchAISuggestions = useCallback(async (slideId: string) => {
    const slide = slides.find(s => s.id === slideId);
    if (!slide) return;
    updateSlide(slideId, { isSuggestLoading: true, aiSuggestions: [] });

    try {
      const prompt = `You are a professional presentation writer.
For a slide deck about "${deckTopic}" (slide ${slide.index + 1} of ${slides.length}),
current slide title: "${slide.title}", current body: "${slide.body}".
Generate 3 alternative versions of this slide content.
Return ONLY a JSON array, no explanation:
[{"title": "...", "body": "• ...\n• ...\n• ..."}, {"title": "...", "body": "..."}, {"title": "...", "body": "..."}]`;

      const raw = await aiTextViaProxy(prompt);
      let suggestions: AISuggestion[] = [];
      try {
        const match = raw.match(/\[[\s\S]*\]/);
        if (match) suggestions = JSON.parse(match[0]).slice(0, 3);
      } catch { /* ignore parse errors */ }

      updateSlide(slideId, { aiSuggestions: suggestions, isSuggestLoading: false });
    } catch {
      updateSlide(slideId, { isSuggestLoading: false });
      showToast('Không thể lấy gợi ý AI', 'error');
    }
  }, [slides, deckTopic, updateSlide, showToast]);

  const applySuggestion = useCallback((slideId: string, suggestion: AISuggestion) => {
    updateSlide(slideId, {
      title: suggestion.title,
      body: suggestion.body,
      aiSuggestions: [],
    });
  }, [updateSlide]);

  // ─── Cancel gen ──────────────────────────────────────────────────────────────

  const cancelGeneration = useCallback(() => {
    isCancelledRef.current = true;
    setIsGeneratingDeck(false);
  }, []);

  return {
    // Deck config
    deckTopic, setDeckTopic,
    deckStyle, setDeckStyle,
    deckLanguage, setDeckLanguage,
    slideCount, setSlideCount,
    refImages, setRefImages,

    // Brand identity
    brandLogo, setBrandLogo,
    brandSlogan, setBrandSlogan,
    brandDescription, setBrandDescription,

    // DOCX outline
    docxOutline, setDocxOutline,

    // Slides
    slides, setSlides,
    activeSlideId, setActiveSlideId,
    activeSlide,

    // UI
    isGeneratingDeck,
    generatingText,
    generatingStage,
    generatingProgress,
    isGenerateModalOpen, setIsGenerateModalOpen,
    isExportModalOpen, setIsExportModalOpen,
    isDirty,

    // Undo/redo
    undoStack, redoStack,
    undo, redo,
    canUndo: undoStack.length > 0,
    canRedo: redoStack.length > 0,

    // Actions
    addSlide,
    removeSlide,
    moveSlide,
    updateSlide,
    generateDeck,
    genSlideBg,
    fetchAISuggestions,
    applySuggestion,
    cancelGeneration,
  };
};
