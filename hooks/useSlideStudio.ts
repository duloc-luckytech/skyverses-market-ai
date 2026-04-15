
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

/** A freely-positioned rich text block on a slide (Canva-style) */
export interface FreeTextBlock {
  id: string;
  html: string;           // rich HTML
  x: number;              // left: % of canvas width  (0–100)
  y: number;              // top:  % of canvas height (0–100)
  w: number;              // width: % of canvas width  (5–100)
  h?: number;             // height: % of canvas height (undefined = auto)
  zIndex: number;
  role?: 'title' | 'body' | 'custom';
  // Block-level visual style
  bgColor?: string;       // e.g. 'rgba(0,0,0,0.4)' — undefined = transparent
  opacity?: number;       // 0–1, default 1
  borderRadius?: number;  // px
  padding?: number;       // px
  letterSpacing?: number; // px
  lineHeight?: number;    // unitless, e.g. 1.4
}

export interface Slide {
  id: string;
  index: number;
  title: string;       // plain-text (AI prompts, export, search)
  body: string;        // plain-text
  titleHtml?: string;  // legacy rich HTML
  bodyHtml?: string;   // legacy rich HTML
  textBlocks?: FreeTextBlock[];  // new free-canvas blocks
  layout: SlideLayout;
  bgImageUrl: string | null;
  bgJobId: string | null;
  bgStatus: 'idle' | 'generating' | 'done' | 'error';
  textColor: 'light' | 'dark';
  aiSuggestions: AISuggestion[];
  isSuggestLoading: boolean;
  bgPrompt?: string;
  slideRefImages?: string[];
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
  const [generatingStage, setGeneratingStage] = useState<'outline' | 'building' | 'idle'>('idle');
  const [generatingProgress, setGeneratingProgress] = useState(0);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // ── Gen-all BG queue state ───────────────────────────────────────────────────
  const [isGenAlling, setIsGenAlling] = useState(false);
  const [genAllProgress, setGenAllProgress] = useState<{ done: number; total: number } | null>(null);
  const genAllCancelRef = useRef(false);

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

  // ─── Free-canvas text block CRUD ─────────────────────────────────────────────

  const addTextBlock = useCallback((slideId: string) => {
    setSlides(prev => prev.map(s => {
      if (s.id !== slideId) return s;
      const maxZ = Math.max(0, ...(s.textBlocks?.map(b => b.zIndex) ?? [0]));
      const newBlock: FreeTextBlock = {
        id: genId(),
        html: '<span style="font-size:24px;font-family:Inter;color:#ffffff">Text mới</span>',
        x: 15, y: 35, w: 70,
        zIndex: maxZ + 1,
        role: 'custom',
      };
      return { ...s, textBlocks: [...(s.textBlocks ?? []), newBlock] };
    }));
    setIsDirty(true);
  }, []);

  const updateTextBlock = useCallback((slideId: string, blockId: string, patch: Partial<FreeTextBlock>) => {
    setSlides(prev => prev.map(s => {
      if (s.id !== slideId) return s;
      return { ...s, textBlocks: s.textBlocks?.map(b => b.id === blockId ? { ...b, ...patch } : b) };
    }));
    setIsDirty(true);
  }, []);

  const removeTextBlock = useCallback((slideId: string, blockId: string) => {
    setSlides(prev => prev.map(s => {
      if (s.id !== slideId) return s;
      if ((s.textBlocks?.length ?? 0) <= 1) {
        showToast('Cần ít nhất 1 text block', 'error');
        return s;
      }
      return { ...s, textBlocks: s.textBlocks?.filter(b => b.id !== blockId) };
    }));
    setIsDirty(true);
  }, [showToast]);

  const bringTextBlockForward = useCallback((slideId: string, blockId: string) => {
    setSlides(prev => prev.map(s => {
      if (s.id !== slideId) return s;
      const blocks = s.textBlocks ?? [];
      const block = blocks.find(b => b.id === blockId);
      if (!block) return s;
      const maxZ = Math.max(...blocks.map(b => b.zIndex));
      return { ...s, textBlocks: blocks.map(b => b.id === blockId ? { ...b, zIndex: maxZ + 1 } : b) };
    }));
  }, []);

  const pasteTextBlock = useCallback((slideId: string, template: FreeTextBlock) => {
    setSlides(prev => prev.map(s => {
      if (s.id !== slideId) return s;
      const maxZ = Math.max(0, ...(s.textBlocks?.map(b => b.zIndex) ?? [0]));
      const newBlock: FreeTextBlock = {
        ...template,
        id: genId(),
        x: Math.min(97 - template.w, template.x + 3),
        y: Math.min(90, template.y + 3),
        zIndex: maxZ + 1,
      };
      return { ...s, textBlocks: [...(s.textBlocks ?? []), newBlock] };
    }));
    setIsDirty(true);
  }, []);


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

    // 90-second timeout — auto-fail so gen-all queue never hangs
    const TIMEOUT_MS = 90_000;
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('TIMEOUT')), TIMEOUT_MS),
    );

    try {
      const prompt = slide.bgPrompt?.trim()
        ? slide.bgPrompt.trim()
        : buildBgPrompt(
            slide,
            stylePreset,
            [...(refImages ?? []), ...(slide.slideRefImages ?? [])],
            { slogan: brandSlogan, description: brandDescription },
          );

      const genPromise = (async () => {
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
      })();

      await Promise.race([genPromise, timeoutPromise]);
    } catch (err) {
      const isTimeout = err instanceof Error && err.message === 'TIMEOUT';
      updateSlide(slideId, { bgStatus: 'error', bgJobId: null });
      if (isTimeout) {
        showToast(`Slide "${slide.title.slice(0, 20)}" gen hình quá 90s — đã bỏ qua`, 'error');
      }
    }
  }, [slides, deckStyle, refImages, brandSlogan, brandDescription, updateSlide, showToast]);


  // ─── Gen ALL slide backgrounds sequentially ───────────────────────────────────

  const genAllSlideBg = useCallback(async () => {
    if (isGenAlling) return;
    const targets = slides.filter(s => s.bgStatus !== 'generating');
    if (targets.length === 0) return;
    setIsGenAlling(true);
    genAllCancelRef.current = false;
    setGenAllProgress({ done: 0, total: targets.length });

    for (let i = 0; i < targets.length; i++) {
      if (genAllCancelRef.current) break;
      await genSlideBg(targets[i].id);
      setGenAllProgress({ done: i + 1, total: targets.length });
      // small pause between jobs to avoid hammering the API
      if (i < targets.length - 1 && !genAllCancelRef.current) {
        await new Promise(r => setTimeout(r, 400));
      }
    }

    setIsGenAlling(false);
    setGenAllProgress(null);
  }, [slides, isGenAlling, genSlideBg]);

  const cancelGenAll = useCallback(() => {
    genAllCancelRef.current = true;
    setIsGenAlling(false);
    setGenAllProgress(null);
  }, []);

  // ─── Clear BG for a slide ─────────────────────────────────────────────────────

  const clearSlideBg = useCallback((slideId: string) => {
    updateSlide(slideId, { bgImageUrl: null, bgStatus: 'idle', bgJobId: null });
  }, [updateSlide]);

  // ─── Duplicate a slide ────────────────────────────────────────────────────────

  const duplicateSlide = useCallback((slideId: string) => {
    setSlides(prev => {
      const idx = prev.findIndex(s => s.id === slideId);
      if (idx === -1) return prev;
      pushUndo(prev);
      const original = prev[idx];
      const clone: Slide = {
        ...original,
        id: genId(),
        index: idx + 1,
      };
      const next = [
        ...prev.slice(0, idx + 1),
        clone,
        ...prev.slice(idx + 1),
      ].map((s, i) => ({ ...s, index: i }));
      setTimeout(() => setActiveSlideId(clone.id), 0);
      return next;
    });
    setIsDirty(true);
  }, [pushUndo]);

  // ─── Keyboard shortcuts ───────────────────────────────────────────────────────

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().includes('MAC');
      const ctrlOrCmd = isMac ? e.metaKey : e.ctrlKey;
      if (!ctrlOrCmd) return;
      if (e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        setUndoStack(u => {
          if (u.length === 0) return u;
          const prev = u[u.length - 1];
          setRedoStack(r => [...r, slides]);
          setSlides(prev);
          return u.slice(0, -1);
        });
      }
      if ((e.key === 'z' && e.shiftKey) || e.key === 'y') {
        e.preventDefault();
        setRedoStack(r => {
          if (r.length === 0) return r;
          const next = r[r.length - 1];
          setUndoStack(u => [...u, slides]);
          setSlides(next);
          return r.slice(0, -1);
        });
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [slides]);

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

      const isLight = deckStyle !== 'minimal';

      // ── Welcome slide (always first) ───────────────────────────────────────
      const welcomeSlide: Slide = {
        id: genId(),
        index: 0,
        title: deckTopic || 'Chào mừng',
        body: brandSlogan || 'Trình bày bởi Skyverses AI',
        layout: 'full-bg',
        bgImageUrl: null,
        bgJobId: null,
        bgStatus: 'idle',
        textColor: 'light',
        aiSuggestions: [],
        isSuggestLoading: false,
      };

      // ── Content slides (AI-generated) ──────────────────────────────────────
      const contentSlides: Slide[] = outline.slice(0, count).map((item, i) => ({
        id: genId(),
        index: i + 1,
        title: item.title || `Slide ${i + 2}`,
        body: item.body || '',
        layout: 'title-left' as SlideLayout,
        bgImageUrl: null,
        bgJobId: null,
        bgStatus: 'idle' as const,
        textColor: isLight ? 'light' : 'dark',
        aiSuggestions: [],
        isSuggestLoading: false,
      }));

      // ── Thank You slide (always last) ─────────────────────────────────────
      const thankYouSlide: Slide = {
        id: genId(),
        index: contentSlides.length + 1,
        title: 'Cảm ơn bạn đã lắng nghe!',
        body: 'Q&A · Liên hệ: hello@skyverses.com',
        layout: 'title-center',
        bgImageUrl: null,
        bgJobId: null,
        bgStatus: 'idle',
        textColor: 'light',
        aiSuggestions: [],
        isSuggestLoading: false,
      };

      const newSlides: Slide[] = [welcomeSlide, ...contentSlides, thankYouSlide]
        .map((s, i) => ({ ...s, index: i }));

      setSlides(newSlides);
      setActiveSlideId(newSlides[0]?.id ?? '');
      setIsDirty(true);
      if (importedOutline) setDocxOutline(null); // clear after use

      // Background images are generated manually per-slide via the toolbar
      setGeneratingProgress(100);
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
    genAllSlideBg,
    cancelGenAll,
    clearSlideBg,
    duplicateSlide,
    fetchAISuggestions,
    applySuggestion,
    cancelGeneration,

    // Gen-all state
    isGenAlling,
    genAllProgress,

    // Free-canvas text block actions
    addTextBlock,
    updateTextBlock,
    removeTextBlock,
    bringTextBlockForward,
    pasteTextBlock,
  };
};
