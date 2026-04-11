
import { useState, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { imagesApi } from '../apis/images';
import { pollJobOnce } from './useJobPoller';
import { generateDemoText } from '../services/gemini';
import { Language } from '../types';

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

const genId = () => Math.random().toString(36).slice(2, 10);

function buildBgPrompt(slide: Slide, stylePreset: StylePreset): string {
  const prefix = stylePreset.promptPrefix;
  return `${prefix}for a presentation slide titled "${slide.title}", 16:9 widescreen format, no text, no UI elements, no watermarks, cinematic depth, premium quality, high resolution`;
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

  // ── Deck config ──────────────────────────────────────────────────────────────
  const [deckTopic, setDeckTopic] = useState('');
  const [deckStyle, setDeckStyle] = useState<string>('corporate');
  const [deckLanguage, setDeckLanguage] = useState<Language>('vi');
  const [slideCount, setSlideCount] = useState<number>(6);
  const [refImages, setRefImages] = useState<string[]>([]);

  // ── Slides ───────────────────────────────────────────────────────────────────
  const [slides, setSlides] = useState<Slide[]>([]);
  const [activeSlideId, setActiveSlideId] = useState<string>('');

  // ── UI state ─────────────────────────────────────────────────────────────────
  const [isGeneratingDeck, setIsGeneratingDeck] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // ── Undo / Redo ───────────────────────────────────────────────────────────────
  const [undoStack, setUndoStack] = useState<Slide[][]>([]);
  const [redoStack, setRedoStack] = useState<Slide[][]>([]);

  // ── Active slide ─────────────────────────────────────────────────────────────
  const activeSlide = slides.find(s => s.id === activeSlideId) ?? slides[0] ?? null;

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
      const prompt = buildBgPrompt(slide, stylePreset);
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
  }, [slides, deckStyle, updateSlide, showToast]);

  // ─── Gen full deck ────────────────────────────────────────────────────────────

  const generateDeck = useCallback(async () => {
    if (!deckTopic.trim()) { showToast('Vui lòng nhập chủ đề', 'error'); return; }
    isCancelledRef.current = false;
    setIsGeneratingDeck(true);
    setIsGenerateModalOpen(false);

    try {
      // 1. Ask AI to generate outline
      const langLabel = { en: 'English', vi: 'Vietnamese', ko: 'Korean', ja: 'Japanese' }[deckLanguage];
      const outlinePrompt = `You are a professional presentation designer.
Generate a slide deck outline for the topic: "${deckTopic}".
Requirements:
- Exactly ${slideCount} slides
- Language: ${langLabel}
- Style: ${deckStyle}
- Each slide needs a concise title (max 8 words) and 2-4 bullet points as body text
- Return ONLY a JSON array, no markdown, no explanation
Format: [{"title": "...", "body": "• point 1\\n• point 2\\n• point 3"}, ...]`;

      const raw = await generateDemoText(outlinePrompt);

      // Parse JSON from AI response
      let outline: Array<{ title: string; body: string }> = [];
      try {
        const jsonMatch = raw.match(/\[[\s\S]*\]/);
        if (jsonMatch) outline = JSON.parse(jsonMatch[0]);
      } catch {
        showToast('AI không trả về đúng format, thử lại nhé', 'error');
        setIsGeneratingDeck(false);
        return;
      }

      // 2. Create slides with text content
      const newSlides: Slide[] = outline.slice(0, slideCount).map((item, i) => ({
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

      // 3. Gen BG images for each slide (sequential to avoid rate limits)
      for (const slide of newSlides) {
        if (isCancelledRef.current) break;
        await genSlideBgDirect(slide, deckStyle);
      }
    } catch (err) {
      showToast('Có lỗi khi tạo deck, thử lại nhé', 'error');
    } finally {
      setIsGeneratingDeck(false);
    }
  }, [deckTopic, deckLanguage, deckStyle, slideCount, showToast]);

  // Internal: gen BG for a slide object directly (used in generateDeck loop)
  const genSlideBgDirect = async (slide: Slide, styleId: string) => {
    const stylePreset = SLIDE_STYLES.find(s => s.id === styleId) ?? SLIDE_STYLES[0];
    setSlides(prev => prev.map(s => s.id === slide.id ? { ...s, bgStatus: 'generating' } : s));

    try {
      const prompt = buildBgPrompt(slide, stylePreset);
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

      const raw = await generateDemoText(prompt);
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

    // Slides
    slides, setSlides,
    activeSlideId, setActiveSlideId,
    activeSlide,

    // UI
    isGeneratingDeck,
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
