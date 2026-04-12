import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { GoogleGenAI } from "@google/genai";
import { generateDemoImage } from '../services/gemini';
import { aiChatJSON, aiChatStream, aiChatOnce, aiChatStreamViaProxy, aiChatOnceViaProxy, ChatMessage } from '../apis/aiChat';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { imagesApi } from '../apis/images';
import { videosApi, VideoJobRequest } from '../apis/videos';
import { ExplorerItem } from '../components/ExplorerDetailModal';
import { STORYBOARD_SAMPLES } from '../data';
import { uploadToGCS } from '../services/storage';
import { pollJobOnce } from './useJobPoller';
import { useProjectManager } from './useProjectManager';

// ─── Shot Type ───────────────────────────────────────────────────────────────
export type ShotType = 'WIDE' | 'MED' | 'CU' | 'ECU' | 'POV';
export const SHOT_TYPES: ShotType[] = ['WIDE', 'MED', 'CU', 'ECU', 'POV'];
export const SHOT_TYPE_LABELS: Record<ShotType, string> = {
  WIDE: 'Wide', MED: 'Medium', CU: 'Close-Up', ECU: 'Extreme CU', POV: 'POV',
};
export const SHOT_TYPE_COLORS: Record<ShotType, string> = {
  WIDE: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
  MED:  'bg-violet-500/20 text-violet-300 border-violet-500/40',
  CU:   'bg-amber-500/20 text-amber-300 border-amber-500/40',
  ECU:  'bg-rose-500/20 text-rose-300 border-rose-500/40',
  POV:  'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
};
export const DURATION_PRESETS = [4, 8, 12, 16] as const;
export type DurationPreset = typeof DURATION_PRESETS[number];

export interface Scene {
  id: string;
  order: number;
  duration: number;
  shotType?: ShotType;
  prompt: string;
  visualUrl?: string | null;
  videoUrl?: string | null;
  audioUrl?: string | null;
  status: 'idle' | 'analyzing' | 'generating' | 'done' | 'error';
  jobId?: string;
  characterIds?: string[];
  errorMessage?: string;
}

export type AssetType = 'CHARACTER' | 'LOCATION' | 'OBJECT';
export type AssetStatus = 'idle' | 'processing' | 'done' | 'error';

export interface ReferenceAsset {
  id: string;
  name: string;
  url: string | null;
  mediaId: string | null;
  type: AssetType;
  status: AssetStatus;
  description?: string;
  designPrompt?: string;
  errorMessage?: string;
}

export const useStoryboardStudio = () => {
  const { credits, useCredits, addCredits, isAuthenticated, login, refreshUserInfo } = useAuth();
  const { showToast } = useToast();

  // ── Multi-project manager ─────────────────────────────────────────────
  const projectManager = useProjectManager();
  const { activeProjectId } = projectManager;

  // Helper to read initial data for the active project
  const _initData = () => {
    return projectManager.loadProject(projectManager.activeProjectId);
  };

  const [activeTab, setActiveTab] = useState<'STORYBOARD' | 'ASSETS' | 'SETTINGS' | 'LOGIC' | 'SCENES' | 'EXPORT'>('STORYBOARD');
  const [script, setScript] = useState(() => _initData().script || '');
  const [totalDuration, setTotalDuration] = useState(() => _initData().totalDuration || 64);
  const [sceneDuration, setSceneDuration] = useState(() => _initData().sceneDuration || 8);
  const [voiceOverEnabled, setVoiceOverEnabled] = useState(false);
  const [scenes, setScenes] = useState<Scene[]>(() => _initData().scenes || []);
  const [selectedSceneIds, setSelectedSceneIds] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancingSceneId, setEnhancingSceneId] = useState<string | null>(null);
  const [isGeneratingVoiceover, setIsGeneratingVoiceover] = useState(false);

  const [showProgressModal, setShowProgressModal] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const autoCloseTriggeredRef = useRef(false);

  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<ReferenceAsset | null>(null);
  const [viewingExplorerItem, setViewingExplorerItem] = useState<ExplorerItem | null>(null);

  const [scriptRefImage, setScriptRefImage] = useState<string | null>(null);
  const [scriptRefAudio, setScriptRefAudio] = useState<string | null>(null);

  const [assets, setAssets] = useState<ReferenceAsset[]>(() => _initData().assets || []);
  const assetUploadRef = useRef<HTMLInputElement>(null);
  const [activeUploadAssetId, setActiveUploadAssetId] = useState<string | null>(null);

  // ── Project name (derived from active project) ────────────────────────
  const [projectName, setProjectName] = useState<string>(
    () => _initData().name || 'Untitled Project'
  );

  // ── Computed memos ────────────────────────────────────────────────────
  const renderedScenes = useMemo(
    () => scenes.filter(sc => sc.status === 'done' || !!sc.visualUrl || !!sc.videoUrl),
    [scenes]
  );

  const computedTotalDuration = useMemo(
    () => scenes.reduce((sum, sc) => sum + (sc.duration || 8), 0),
    [scenes]
  );

  const creditCostEstimate = useMemo(() => {
    const imageCost = scenes.filter(sc => !sc.visualUrl).length * 100;
    const videoCost = scenes.filter(sc => !sc.videoUrl).length * 50;
    return imageCost + videoCost;
  }, [scenes]);

  const isCancelledRef = useRef(false);

  // Auto-save current project via useProjectManager
  useEffect(() => {
    projectManager.saveCurrentProject({
      id: activeProjectId,
      script,
      totalDuration,
      sceneDuration,
      scenes,
      assets,
      name: projectName,
    });
  }, [script, totalDuration, sceneDuration, scenes, assets, projectName, activeProjectId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cancel all in-flight polls on unmount
  useEffect(() => {
    return () => { isCancelledRef.current = true; };
  }, []);

  // ── Batch completion toast tracker ──────────────────────────────────────────
  // Fires when ALL processing scenes finish (transition from ≥1 processing → 0)
  const prevProcessingCountRef = useRef(0);
  useEffect(() => {
    const processingCount = scenes.filter(sc => sc.status === 'generating' || sc.status === 'analyzing').length;
    const prev = prevProcessingCountRef.current;
    prevProcessingCountRef.current = processingCount;

    // Only fire when transitioning from active → idle AND there's at least 1 finished scene
    if (prev > 0 && processingCount === 0) {
      const doneCount  = scenes.filter(sc => sc.status === 'done').length;
      const errorCount = scenes.filter(sc => sc.status === 'error').length;
      if (doneCount > 0 || errorCount > 0) {
        if (errorCount === 0) {
          showToast(`✓ Đã xử lý ${doneCount} cảnh thành công`, 'success');
        } else if (doneCount === 0) {
          showToast(`⚠ ${errorCount} cảnh gặp lỗi, vui lòng thử lại`, 'error');
        } else {
          showToast(`⚠ ${doneCount} cảnh thành công, ${errorCount} cảnh lỗi`, 'warning');
        }
      }
    }
  }, [scenes, showToast]);

  const DEFAULT_SETTINGS = {
    videoPrompt: true,
    format: 'TVC Quảng cáo',
    style: 'Hoạt hình 3D',
    culture: 'Futuristic Vietnam',
    background: 'Rain-slicked alleyways reflecting neon holograms, futuristic skyscrapers with jade accents.',
    cinematic: 'Low-angle tracking shots, shallow depth of field, anamorphic lens flares.',
    bgm: 'Lo-fi hip hop beats blended with traditional Vietnamese instruments.',
    voiceOver: 'Deep, resonant male voice with a calm and wise tone.',
    duration: '64',
    sceneDuration: 8,
    model: 'veo_3_1',
    imageModel: 'google_image_gen_4_5',
    retryCount: 2,
    maxThreads: 5,
    // Render config extras
    resolution: '720p',
    aspectRatio: '16:9',
    imageRatio: '16:9',
    imageQuality: '1K',
    mode: 'fast',
    privacy: 'private',
    exportFormat: 'MP4',
    autoDownload: false,
    watermark: false,
  };

  type StoryboardSettings = typeof DEFAULT_SETTINGS;

  const SETTINGS_KEY = 'storyboard_settings';

  const [settings, setSettings] = useState<StoryboardSettings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // Auto-save settings to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch { /* quota exceeded */ }
  }, [settings]);

  const [systemPrompt, setSystemPrompt] = useState(`You are an expert AI Video Producer and Concept Artist. 
Your job is to parse scripts and extract EVERY individual entity for pre-production.

**ENTITY EXTRACTION RULES:**
1. **NO GROUPING**: If the prompt says "Naruto and Sasuke", you MUST return two separate objects in the 'characters' array.
2. **INDIVIDUAL ROLES**: For battle scenes like "Goku vs Jiren", you MUST extract BOTH as separate character entities.
3. **EXHAUSTIVE SEARCH**: Look for every proper noun that acts as a character or creature.
4. **DESIGN SHEETS**: For each character/object, create a 'design_description' that only describes their physical appearance in detail. Avoid style keywords here.`);

  const addLog = useCallback((msg: string) => {
    setTerminalLogs(prev => [...prev, msg]);
  }, []);

  // ── Domain-aware system prompt builder ─────────────────────────────
  const buildDomainSystemPrompt = useCallback((format: string): string => {
    const domainGuides: Record<string, string> = {
      'TVC Quảng cáo': `You are an expert TVC Commercial Director and Storyboard Artist.
For advertising content: scenes must be sharp, product-centric, emotionally driven.
Each scene should build AIDA (Attention-Interest-Desire-Action). Max 30s attention span per beat.
Brand must appear in at least 1 scene. End with a strong CTA visual.`,

      'MV Ca nhạc': `You are an expert Music Video Director and Visual Storyteller.
For music videos: focus on mood, rhythm sync, artist performance, and abstract visuals.
Scenes alternate between narrative story and artist performance shots.
Color grading and lighting are critical. Include dynamic transitions.`,

      'Phim ngắn': `You are an expert Short Film Director and Screenwriter.
For short films: focus on character arc, emotional tension, and narrative payoff.
Structure: Setup (20%) → Conflict (60%) → Resolution (20%).
Dialogue scenes, reaction shots, and environmental storytelling are essential.`,

      'Trailer / Teaser': `You are an expert Cinematic Trailer Editor and Director.
For trailers: build anticipation with quick cuts, music hits, and mystery reveals.
Start with intrigue, escalate tension, end on a cliffhanger or logo reveal.
Use intercutting between storylines. Every scene should be a "wow moment".`,

      'Video TikTok/Reels/Shorts': `You are an expert Short-Form Content Creator and Viral Video Director.
For vertical short-form: hook in first 2 seconds, visual storytelling without relying on audio.
Fast pacing (2-4s per scene), trending aesthetics, strong visual identity.
Design for silent viewing — text overlays and on-screen action must carry the message.`,

      'Phim tài liệu': `You are an expert Documentary Director and Visual Journalist.
For documentaries: authentic locations, interview setups, B-roll coverage, archival materials.
Balance exposition (narration/talking head) with immersive environmental shots.
Evidence-based visual storytelling — every scene must support a factual argument.`,

      'Video giáo dục': `You are an expert Educational Content Producer and Instructional Designer.
For educational videos: clarity over aesthetics. Use Visual → Explanation → Example → Summary structure.
Animations, diagrams, and step-by-step demonstrations are preferred over abstract visuals.
Pacing should be deliberate and measured.`,

      'Game Cutscene': `You are an expert Game Narrative Director and Cinematic Designer.
For game cutscenes: dramatic reveals, character confrontations, world-building visuals.
Cinematic framing with epic scale. Dynamic camera work (crane shots, close-ups for emotion).
Match game’s visual style — integrate UI/HUD references if applicable.`,
    };

    const basePrompt = `You are an expert AI Video Producer, Storyboard Artist, and Creative Director.
Your task is to parse creative scripts and extract structured pre-production data for AI video generation.

CORE RULES:
1. NO GROUPING of characters — each character is a SEPARATE object.
2. Extract EVERY individual entity (characters, creatures, branded products).
3. visualPrompt must be a detailed, self-contained cinematic description — do NOT reference other scenes.
4. Return ONLY valid JSON — no markdown fences, no extra text outside the JSON object.
5. Scene count MUST match exactly what is requested.`;

    const domainGuide = domainGuides[format] ?? `You are an expert AI Video Producer and Storyboard Artist.
Create detailed, visually rich scene breakdowns optimized for AI image and video generation.`;

    return `${basePrompt}

${domainGuide}`;
  }, []);


  const handleLoadSample = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * STORYBOARD_SAMPLES.length);
    const sample = STORYBOARD_SAMPLES[randomIndex];
    setScript(sample.script);
    addLog(`Đã tải kịch bản mẫu: ${sample.title}`);
  }, [addLog]);

  const handleLoadSuggestion = async () => {
    if (!isAuthenticated) { login(); return; }
    if (isEnhancing) return;

    setIsEnhancing(true);
    const currentIdea = script.trim() || 'Một ý tưởng ngẫu nhiên thú vị';
    addLog('[AI] Đang phân tích ý tưởng kiịch bản...');

    try {
      const messages: ChatMessage[] = [
        {
          role: 'system',
          content: `You are a professional Storyboard Assistant and Creative Director.
Help the user refine their creative ideas into structured narrative scripts optimized for AI video production.
Always respond in the same language as the user's input.
Return ONLY valid JSON — no markdown fences, no extra text.`,
        },
        {
          role: 'user',
          content: `Based on this idea: "${currentIdea}"
Create a professional and fluid narrative script for a video with total duration ${totalDuration}s.

Format: ${settings.format || 'auto-detect best format'}
Style preference: ${settings.style || 'auto'}

Return a JSON object with these exact keys:
{
  "refined_idea": "A rich, cohesive narrative paragraph describing beginning-middle-end. No scene breakdowns.",
  "format": "Video format type e.g. TVC Quảng cáo / MV Ca nhạc / Phim ngắn",
  "style": "Visual style e.g. Hoạt hình 3D / Anime / Live-action / Cyberpunk",
  "culture": "Cultural setting/country",
  "background": "Specific environment details",
  "cinematic": "Camera style and lens approach",
  "bgm": "Music mood and genre",
  "voice-over": "Narrator style"
}`,
        },
      ];

      // Stream the response into terminal logs for live feedback
      let accumulated = '';
      addLog('[AI] Đang viết kịch bản...');
      await aiChatStreamViaProxy(
        messages,
        (token) => {
          accumulated += token;
          // Update log with running text
          setTerminalLogs(prev => {
            const last = prev[prev.length - 1];
            if (last?.startsWith('[AI WRITING] ')) {
              return [...prev.slice(0, -1), `[AI WRITING] ${accumulated.slice(-120)}...`];
            }
            return [...prev, `[AI WRITING] ${token}`];
          });
        }
      );

      // Robust JSON parse — strip fences + regex fallback
      const cleaned = accumulated
        .replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
      const jsonStr = (cleaned[0] === '{' || cleaned[0] === '[')
        ? cleaned
        : (cleaned.match(/\{[\s\S]+\}/) ?? [''])[0];
      const result = JSON.parse(jsonStr);

      if (result.refined_idea) setScript(result.refined_idea);
      setSettings(prev => ({
        ...prev,
        format:    result.format    || prev.format,
        style:     result.style     || prev.style,
        culture:   result.culture   || prev.culture,
        background: result.background || prev.background,
        cinematic: result.cinematic  || prev.cinematic,
        bgm:       result.bgm        || prev.bgm,
        voiceOver: result['voice-over'] || prev.voiceOver,
      }));
      addLog('[DONE] Kịch bản gợi ý đã được tạo.');
    } catch (e: any) {
      addLog(`[LỖI] Tạo gợi ý thất bại: ${e?.message ?? 'unknown'}`);
      console.error('Suggestion error', e);
    } finally {
      setIsEnhancing(false);
    }
  };

  const toggleSceneSelection = (id: string) => {
    setSelectedSceneIds(prev => 
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  const selectAllScenes = () => {
    if (selectedSceneIds.length === scenes.length) setSelectedSceneIds([]);
    else setSelectedSceneIds(scenes.map(s => s.id));
  };

  const updateAsset = useCallback((id: string, updates: Partial<ReferenceAsset>) => {
    setAssets(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  }, []);

  const updateScene = useCallback((id: string, updates: Partial<Scene>) => {
    setScenes(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  }, []);

  const closeProgressModal = useCallback(() => {
    setShowProgressModal(false);
    setIsProcessing(false);
  }, []);

  const pollImageJobStatus = useCallback((jobId: string, assetId: string) => {
    pollJobOnce({
      jobId,
      isCancelledRef,
      apiType: 'image',
      intervalMs: 5000,
      networkRetryMs: 10000,
      onDone: (result) => {
        const imageUrl = result.images?.[0] ?? null;
        const mediaId = (result as any).imageId || null;
        updateAsset(assetId, { url: imageUrl, mediaId, status: 'done' });
        refreshUserInfo();
        if (!autoCloseTriggeredRef.current) {
          autoCloseTriggeredRef.current = true;
          addLog("KẾT QUẢ: Đã tạo thành công concept.");
          setTimeout(closeProgressModal, 1500);
        }
      },
      onError: () => {
        updateAsset(assetId, { status: 'error' });
        addLog(`LỖI: Tác vụ ${jobId} thất bại.`);
      },
    });
  }, [updateAsset, refreshUserInfo, closeProgressModal, addLog]);

  const pollVideoJobStatus = useCallback((jobId: string, sceneId: string, cost: number) => {
    pollJobOnce({
      jobId,
      isCancelledRef,
      apiType: 'video',
      intervalMs: 5000,
      networkRetryMs: 10000,
      onDone: (result) => {
        updateScene(sceneId, { videoUrl: result.videoUrl ?? null, status: 'done' });
        addLog(`KẾT QUẢ: Phân cảnh #${sceneId.slice(-4)} kết xuất thành công.`);
        refreshUserInfo();
      },
      onError: (errorMsg) => {
        updateScene(sceneId, { status: 'error' });
        addLog(`LỖI: Render phân cảnh #${sceneId.slice(-4)} thất bại. Hoàn trả: ${cost} CR.`);
        addCredits(cost);
      },
    });
  }, [updateScene, addLog, refreshUserInfo, addCredits]);

  const triggerImageGeneration = useCallback(async (asset: ReferenceAsset) => {
    if (!asset.designPrompt) return;
    const COST = 500; 
    if (credits < COST) return;
    updateAsset(asset.id, { status: 'processing' });
    try {
      const payload: any = {
        type: "text_to_image",
        input: { prompt: asset.designPrompt },
        config: { width: 1024, height: 1024, aspectRatio: '1:1', seed: 0, style: "cinematic" },
        engine: { provider: "gommo", model: settings.imageModel as any },
        enginePayload: { prompt: asset.designPrompt, privacy: "PRIVATE", projectId: "default" }
      };
      const res = await imagesApi.createJob(payload);
      if (res.success && res.data.jobId) {
        useCredits(COST);
        pollImageJobStatus(res.data.jobId, asset.id);
      } else {
        updateAsset(asset.id, { status: 'error' });
      }
    } catch (err) {
      updateAsset(asset.id, { status: 'error' });
    }
  }, [credits, useCredits, updateAsset, pollImageJobStatus, settings.imageModel]);

  const handleCreateStoryboard = async () => {
    if (!isAuthenticated) { login(); return; }
    setShowProgressModal(true);
    setTerminalLogs(['[⚡] Khởi động Storyboard Engine...']);
    setIsProcessing(true);
    autoCloseTriggeredRef.current = false;

    const numScenes = Math.ceil(totalDuration / sceneDuration);
    const format = settings.format || '';
    const domainSystemPrompt = buildDomainSystemPrompt(format);

    try {
      // ── Step 1: Stream domain intro ──────────────────────────────
      addLog(`[DOMAIN] Định dạng: ${format || 'Auto'} • ${numScenes} phân cảnh • ${totalDuration}s`);
      addLog('[AI] Đang phân tích cấu trúc kịch bản...');

      const aestheticContext = [
        settings.style     ? `Visual Style: ${settings.style}` : '',
        settings.culture   ? `World/Culture: ${settings.culture}` : '',
        settings.background ? `Environment: ${settings.background}` : '',
        settings.cinematic ? `Camera/Lens: ${settings.cinematic}` : '',
      ].filter(Boolean).join('\n');

      const messages: ChatMessage[] = [
        {
          role: 'system',
          content: domainSystemPrompt,
        },
        {
          role: 'user',
          content: `SCRIPT TO ANALYZE:
"${script}"

AESTHETIC CONTEXT:
${aestheticContext || 'AI auto-select best aesthetics'}

TIMELINE: ${totalDuration}s total • generate EXACTLY ${numScenes} scenes • ${sceneDuration}s each

Return ONLY this JSON (no fences, no extra text):
{
  "characters": [
    { "temp_id": "c1", "name": "Name", "description": "Detailed physical appearance only" }
  ],
  "locations": [
    { "temp_id": "l1", "name": "Name", "description": "Detailed environment description" }
  ],
  "scenes": [
    {
      "order": 1,
      "visualPrompt": "Rich, self-contained cinematic description. Include style, camera, lighting. Reference character appearances by physical description, not by name variable.",
      "appears": ["c1", "l1"],
      "mood": "tense / warm / epic / melancholic / etc",
      "cameraMove": "static / pan / tracking / handheld / crane / etc"
    }
  ]
}

IMPORTANT:
- Combined characters + locations = max 5 total
- Each visualPrompt must be 40-80 words, highly descriptive
- "appears" lists ONLY entities LITERALLY visible in that scene`,
        },
      ];

      // ── Step 2: Stream AI response with live terminal feedback ───
      addLog('[AI] Phân tách đang chạy — đang nhận phản hồi...');
      let accumulated = '';
      let dotCount = 0;

      await aiChatStreamViaProxy(messages, (token) => {
        accumulated += token;
        dotCount++;
        if (dotCount % 60 === 0) {
          addLog(`[STREAM] Đang nhận... ${accumulated.length} ky tự`);
        }
      }, undefined, 8192);

      addLog(`[OK] AI trả về ${accumulated.length} ky tự. Đang parse...`);

      // ── Step 3: Parse structured data — robust fence + regex fallback ──
      const cleaned = accumulated
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```\s*$/i, '')
        .trim();

      let data: any;
      try {
        data = JSON.parse(cleaned);
      } catch {
        // Fallback: extract first {...} block from mixed content
        const jsonMatch = cleaned.match(/\{[\s\S]+\}/);
        if (jsonMatch) data = JSON.parse(jsonMatch[0]);
        else throw new Error('Không đọc được JSON từ AI response');
      }

      const extractedCharacters: any[] = data.characters || [];
      const extractedLocations:  any[] = data.locations  || [];
      const extractedScenes:     any[] = data.scenes     || [];

      addLog(`[✓] Trích xuất: ${extractedCharacters.length} nhân vật, ${extractedLocations.length} bối cảnh, ${extractedScenes.length} phân cảnh.`);

      // ── Step 4: Build identity anchor assets ────────────────────
      const visualStyle = settings.style && settings.style !== '--'
        ? settings.style
        : 'Cinematic, hyper-detailed, ultra-realistic';
      const idMap: Record<string, string> = {};

      const charAssets: ReferenceAsset[] = extractedCharacters.map((c: any, i: number) => {
        const realId = `char-${Date.now()}-${i}`;
        idMap[c.temp_id] = realId;
        return {
          id: realId,
          name: c.name,
          url: null,
          mediaId: null,
          type: 'CHARACTER' as const,
          status: 'idle' as const,
          designPrompt: `Full character design sheet of ${c.name}. ${c.description}. ${visualStyle} style. White background. Front view + side profile. Consistent proportions. World: ${settings.culture || 'contemporary'}.`,
        };
      });

      const locAssets: ReferenceAsset[] = extractedLocations.map((l: any, i: number) => {
        const realId = `loc-${Date.now()}-${i}`;
        idMap[l.temp_id] = realId;
        return {
          id: realId,
          name: l.name,
          url: null,
          mediaId: null,
          type: 'LOCATION' as const,
          status: 'idle' as const,
          designPrompt: `Concept environment art of ${l.name}. ${l.description}. ${visualStyle} style. Establishing wide shot. ${settings.background || ''}. World: ${settings.culture || 'contemporary'}.`,
        };
      });

      const allAssets = [...charAssets, ...locAssets].slice(0, 5);
      setAssets(allAssets);

      // ── Step 5: Build scene list ─────────────────────────────────
      const builtScenes = extractedScenes.map((s: any, i: number) => ({
        id: `scene-${Date.now()}-${i}`,
        order: s.order || (i + 1),
        duration: sceneDuration,
        shotType: 'WIDE' as ShotType,
        prompt: s.visualPrompt || s.title || 'Cinematic scene',
        status: 'idle' as const,
        characterIds: (s.appears || []).map((tid: string) => idMap[tid]).filter(Boolean),
      }));
      setScenes(builtScenes);

      addLog(`[⚡] Khởi động tạo ${allAssets.length} identity anchors song song...`);

      // ── Close loading screen now — scenes are ready, asset gen runs in bg ──
      setShowProgressModal(false);
      setIsProcessing(false);

      // ── Step 6: Trigger parallel asset image generation ─────────
      await Promise.allSettled(allAssets.map(asset => triggerImageGeneration(asset)));

      addLog('[DONE] Storyboard dựng xong. Đang tạo concept art...');

    } catch (error: any) {
      addLog(`[LỖI HỆ THỐNG] ${error?.message ?? 'Không thể phân tách kịch bản.'}`);
      setShowProgressModal(false);
      setIsProcessing(false);
    }
  };

  const handleSaveAndGenerate = async () => {
    addLog("Đã cập nhật thiết lập hệ thống. Cấu hình mới đã được áp dụng.");
    setActiveTab('STORYBOARD');
  };

  const openAssetModal = (asset?: ReferenceAsset) => {
    if (asset) setEditingAsset({ ...asset });
    else setEditingAsset({ id: `asset-${Date.now()}`, name: 'Nhân vật mới', url: null, mediaId: null, type: 'CHARACTER', status: 'idle', description: '', designPrompt: 'New character design sheet' });
    setIsAssetModalOpen(true);
  };

  const closeAssetModal = () => {
    setIsAssetModalOpen(false);
    setEditingAsset(null);
  };

  const saveAsset = (asset: ReferenceAsset) => {
    setAssets(prev => {
      const exists = prev.find(a => a.id === asset.id);
      if (exists) return prev.map(a => a.id === asset.id ? asset : a);
      return [...prev, asset];
    });
    closeAssetModal();
    if (asset.status === 'idle') triggerImageGeneration(asset);
  };

  const openExplorerView = (asset: ReferenceAsset) => {
    if (!asset.url) return;
    setViewingExplorerItem({ id: asset.id, title: asset.name, type: 'image', thumbnailUrl: asset.url, mediaUrl: asset.url, authorName: 'Storyboard Studio' });
  };

  const openExplorerViewScene = (scene: Scene) => {
    if (!scene.visualUrl && !scene.videoUrl) return;
    setViewingExplorerItem({ id: scene.id, title: `Phân cảnh 0${scene.order}`, type: scene.videoUrl ? 'video' : 'image', thumbnailUrl: scene.visualUrl || '', mediaUrl: scene.videoUrl || scene.visualUrl || '', authorName: 'Storyboard Studio' });
  };

  const handleGenerateBatchImages = useCallback(async () => {
    if (selectedSceneIds.length === 0 || isProcessing) return;

    const targetScenes = scenes.filter(s => selectedSceneIds.includes(s.id) && !s.visualUrl);
    if (targetScenes.length === 0) return;

    const IMAGE_COST = 100; // per scene image
    const totalCost = targetScenes.length * IMAGE_COST;
    if (credits < totalCost) {
      addLog(`CẢNH BÁO: Không đủ credits. Cần ${totalCost} CR, hiện có ${credits} CR.`);
      return;
    }

    setIsProcessing(true);
    addLog(`[BATCH IMAGE] Khởi chạy ${targetScenes.length} tác vụ song song...`);

    // Mark all as generating immediately
    targetScenes.forEach(s => updateScene(s.id, { status: 'generating' }));

    const generateOneImage = async (scene: Scene) => {
      // Get character reference URLs for this scene (identity anchoring)
      const characterRefs = assets
        .filter(a => scene.characterIds?.includes(a.id) && a.url && a.status === 'done')
        .map(a => a.url!)
        .slice(0, 3); // max 3 refs

      const aestheticPrompt = [
        scene.prompt,
        settings.style && settings.style !== '--' ? `Style: ${settings.style}` : '',
        settings.cinematic ? `Camera: ${settings.cinematic}` : '',
        settings.culture ? `World: ${settings.culture}` : '',
      ].filter(Boolean).join('. ');

      try {
        const hasRefs = characterRefs.length > 0;
        const payload: any = {
          type: hasRefs ? 'image_to_image' : 'text_to_image',
          input: hasRefs ? { prompt: aestheticPrompt, images: characterRefs } : { prompt: aestheticPrompt },
          config: { width: 1024, height: 576, aspectRatio: '16:9', seed: 0, style: '' },
          engine: { provider: 'gommo', model: settings.imageModel as any },
          enginePayload: { prompt: aestheticPrompt, privacy: 'PRIVATE', projectId: 'default',
            ...(hasRefs ? { referenceImages: characterRefs } : {}) },
        };
        const res = await imagesApi.createJob(payload);
        if (res.success && res.data.jobId) {
          useCredits(IMAGE_COST);
          addLog(`[OK] Cảnh #${scene.order}: job ${res.data.jobId.slice(-6)} khởi tạo.`);
          pollJobOnce({
            jobId: res.data.jobId,
            isCancelledRef,
            apiType: 'image',
            intervalMs: 6000,
            networkRetryMs: 12000,
            onDone: (result) => {
              const imageUrl = result.images?.[0] ?? null;
              updateScene(scene.id, { visualUrl: imageUrl, status: imageUrl ? 'done' : 'error' });
              if (imageUrl) {
                addLog(`[DONE] Cảnh #${scene.order}: hình ảnh đã sẵn sàng.`);
                refreshUserInfo();
              }
            },
            onError: () => {
              updateScene(scene.id, { status: 'error' });
              addLog(`[LỖI] Cảnh #${scene.order}: render thất bại.`);
              addCredits(IMAGE_COST); // refund
            },
          });
        } else {
          updateScene(scene.id, { status: 'error' });
          addLog(`[LỖI] Cảnh #${scene.order}: server từ chối.`);
        }
      } catch {
        updateScene(scene.id, { status: 'error' });
        addLog(`[LỖI] Cảnh #${scene.order}: lỗi kết nối.`);
      }
    };

    // Run all in parallel (up to maxThreads)
    const THREADS = settings.maxThreads ?? 4;
    const chunks: Scene[][] = [];
    for (let i = 0; i < targetScenes.length; i += THREADS) {
      chunks.push(targetScenes.slice(i, i + THREADS));
    }
    for (const chunk of chunks) {
      await Promise.allSettled(chunk.map(generateOneImage));
    }

    setIsProcessing(false);
    addLog(`[BATCH IMAGE] Đã gửi ${targetScenes.length} tác vụ. Đang polling...`);
    setSelectedSceneIds([]);
  }, [selectedSceneIds, isProcessing, scenes, updateScene, addLog, credits, useCredits, addCredits, refreshUserInfo, settings, imagesApi, pollJobOnce, isCancelledRef]);

  const handleGenerateBatchVideos = useCallback(async () => {
    if (selectedSceneIds.length === 0 || isProcessing) return;

    const targetScenes = scenes.filter(s => selectedSceneIds.includes(s.id) && !s.videoUrl);
    if (targetScenes.length === 0) return;

    // Use model from settings (respects RenderConfigModal selection)
    const currentModelKey = (settings as any).model ?? 'veo_3_1';
    const resolution = (settings as any).resolution ?? '720p';
    const durationSecs = (settings as any).duration ? parseInt((settings as any).duration) : sceneDuration;
    const mode = (settings as any).mode ?? 'fast';

    // Credit pre-check: estimate cost before starting
    const VIDEO_UNIT_COST = 50;
    const totalEstimated = targetScenes.length * VIDEO_UNIT_COST;
    if (credits < totalEstimated) {
      addLog(`CẢNH BÁO: Không đủ credits. Cần ~${totalEstimated} CR, hiện có ${credits} CR.`);
      addLog(`Chỉ có thể xử lý ${Math.floor(credits / VIDEO_UNIT_COST)} / ${targetScenes.length} cảnh.`);
    }

    setIsProcessing(true);
    addLog(`[BATCH VIDEO] Khởi chạy ${targetScenes.length} cảnh song song — Model: ${currentModelKey.toUpperCase()}...`);

    targetScenes.forEach(s => updateScene(s.id, { status: 'generating' }));

    const renderOneVideo = async (scene: Scene) => {
      if (credits < VIDEO_UNIT_COST) {
        updateScene(scene.id, { status: 'error' });
        addLog(`[SKIP] Cảnh #${scene.order}: không đủ credits.`);
        return;
      }

      const sceneRefs = assets
        .filter(a => scene.characterIds?.includes(a.id) && a.url)
        .map(a => a.url!);

      const videoPrompt = [
        scene.prompt,
        settings.style && settings.style !== '--' ? `${settings.style} style` : '',
        settings.cinematic ? `${settings.cinematic} camera` : '',
        settings.background ? `${settings.background} background` : '',
      ].filter(Boolean).join('. ');

      const payload: VideoJobRequest = {
        type: sceneRefs.length > 0 ? 'ingredient' : 'text-to-video',
        input: { images: sceneRefs },
        config: { duration: Number(durationSecs), aspectRatio: (settings as any).aspectRatio ?? '16:9', resolution },
        engine: { provider: 'gommo', model: currentModelKey as any },
        enginePayload: {
          accessToken: 'STORYBOARD_GATEWAY',
          prompt: videoPrompt,
          privacy: 'PRIVATE',
          translateToEn: true,
          projectId: 'default',
          mode,
        },
      };

      try {
        const res = await videosApi.createJob(payload);
        if (res.success && res.data.jobId) {
          useCredits(VIDEO_UNIT_COST);
          addLog(`[OK] Cảnh #${scene.order}: job ${res.data.jobId.slice(-6)} khởi tạo.`);
          pollVideoJobStatus(res.data.jobId, scene.id, VIDEO_UNIT_COST);
        } else {
          updateScene(scene.id, { status: 'error' });
          addLog(`[LỖI] Cảnh #${scene.order}: server từ chối.`);
        }
      } catch {
        updateScene(scene.id, { status: 'error' });
        addLog(`[LỖI] Cảnh #${scene.order}: lỗi kết nối.`);
      }
    };

    // Parallel with thread limiting
    const THREADS = Math.min(settings.maxThreads ?? 4, targetScenes.length);
    const chunks: Scene[][] = [];
    for (let i = 0; i < targetScenes.length; i += THREADS) {
      chunks.push(targetScenes.slice(i, i + THREADS));
    }
    for (const chunk of chunks) {
      await Promise.allSettled(chunk.map(renderOneVideo));
    }

    setIsProcessing(false);
    setSelectedSceneIds([]);
    addLog(`[BATCH VIDEO] Đã gửi ${targetScenes.length} tác vụ. Đang polling results...`);
  }, [selectedSceneIds, isProcessing, scenes, updateScene, addLog, credits, sceneDuration, useCredits, pollVideoJobStatus, assets, settings]);

  const handleReGenerateAsset = useCallback((id: string) => {
    const targetAsset = assets.find(a => a.id === id);
    if (targetAsset) {
      updateAsset(id, { status: 'processing', url: null });
      triggerImageGeneration({ ...targetAsset, status: 'processing', url: null });
    }
  }, [assets, triggerImageGeneration, updateAsset]);

  // ── Re-generate image for a single scene ────────────────────────────
  const handleReGenerateSceneImage = useCallback(async (sceneId: string) => {
    const scene = scenes.find(s => s.id === sceneId);
    if (!scene) return;

    const IMAGE_COST = 100;
    if (credits < IMAGE_COST) { addLog(`[LỖI] Không đủ credits để tạo lại cảnh #${scene.order}.`); return; }

    updateScene(sceneId, { status: 'generating', visualUrl: null });
    addLog(`[REGEN] Tạo lại hình ảnh cảnh #${scene.order}...`);

    const prompt = [
      scene.prompt,
      settings.style && settings.style !== '--' ? `Style: ${settings.style}` : '',
      settings.cinematic ? `Camera: ${settings.cinematic}` : '',
    ].filter(Boolean).join('. ');

    try {
      const payload: any = {
        type: 'text_to_image',
        input: { prompt },
        config: { width: 1024, height: 576, aspectRatio: '16:9', seed: 0, style: '' },
        engine: { provider: 'gommo', model: settings.imageModel as any },
        enginePayload: { prompt, privacy: 'PRIVATE', projectId: 'default' },
      };
      const res = await imagesApi.createJob(payload);
      if (res.success && res.data.jobId) {
        useCredits(IMAGE_COST);
        pollJobOnce({
          jobId: res.data.jobId, isCancelledRef, apiType: 'image', intervalMs: 6000, networkRetryMs: 12000,
          onDone: (result) => {
            const url = result.images?.[0] ?? null;
            updateScene(sceneId, { visualUrl: url, status: url ? 'done' : 'error' });
            refreshUserInfo();
            addLog(`[DONE] Cảnh #${scene.order} tạo lại thành công.`);
          },
          onError: () => {
            updateScene(sceneId, { status: 'error' });
            addCredits(IMAGE_COST);
            addLog(`[LỖI] Tạo lại cảnh #${scene.order} thất bại. Hoàn trả ${IMAGE_COST} CR.`);
          },
        });
      } else {
        updateScene(sceneId, { status: 'error' });
      }
    } catch {
      updateScene(sceneId, { status: 'error' });
    }
  }, [scenes, credits, useCredits, addCredits, updateScene, addLog, settings, refreshUserInfo]);

  // ── Re-generate video for a single scene ────────────────────────────
  const handleReGenerateSceneVideo = useCallback(async (sceneId: string) => {
    const scene = scenes.find(s => s.id === sceneId);
    if (!scene) return;

    const VIDEO_COST = 50;
    if (credits < VIDEO_COST) { addLog(`[LỖI] Không đủ credits để render video cảnh #${scene.order}.`); return; }

    updateScene(sceneId, { status: 'generating', videoUrl: null });
    addLog(`[REGEN] Render video cảnh #${scene.order} — Model: ${(settings.model ?? 'veo_3_1').toUpperCase()}...`);

    const sceneRefs = assets.filter(a => scene.characterIds?.includes(a.id) && a.url).map(a => a.url!);
    const videoPrompt = [
      scene.prompt,
      settings.style ? `${settings.style} style` : '',
      settings.cinematic ? `${settings.cinematic} camera` : '',
    ].filter(Boolean).join('. ');
    const _s = settings as any;

    try {
      const payload: VideoJobRequest = {
        type: 'ingredient',
        input: { images: sceneRefs },
        config: { duration: Number(_s.duration ? parseInt(_s.duration) : 8), aspectRatio: _s.aspectRatio ?? '16:9', resolution: _s.resolution ?? '720p' },
        engine: { provider: 'gommo', model: (_s.model ?? 'veo_3_1') as any },
        enginePayload: { accessToken: 'STORYBOARD_GATEWAY', prompt: videoPrompt, privacy: 'PRIVATE', translateToEn: true, projectId: 'default', mode: _s.mode ?? 'fast' },
      };
      const res = await videosApi.createJob(payload);
      if (res.success && res.data.jobId) {
        useCredits(VIDEO_COST);
        pollVideoJobStatus(res.data.jobId, sceneId, VIDEO_COST);
      } else {
        updateScene(sceneId, { status: 'error' });
      }
    } catch {
      updateScene(sceneId, { status: 'error' });
    }
  }, [scenes, assets, credits, useCredits, updateScene, addLog, settings, pollVideoJobStatus]);

  // ── AI Enhance Scene Prompt ──────────────────────────────────
  const handleEnhanceScenePrompt = useCallback(async (sceneId: string) => {
    const scene = scenes.find(s => s.id === sceneId);
    if (!scene || enhancingSceneId) return;

    setEnhancingSceneId(sceneId);
    addLog(`[AI] Đang cải thiện prompt cảnh #${scene.order}...`);

    try {
      const enhanced = await aiChatOnceViaProxy([
        {
          role: 'system',
          content: `You are a cinematic prompt engineer specializing in AI video/image generation.
Rewrite the given scene description to be:
1. More visually specific and cinematic (lighting, composition, color palette)
2. Optimized for AI image generation (concrete details, no abstract concepts)
3. 40-70 words max
4. Coherent with the visual style: ${settings.style || 'cinematic'}
5. Return ONLY the enhanced prompt text, no explanation.`,
        },
        {
          role: 'user',
          content: `Original scene prompt:
"${scene.prompt}"

Format: ${settings.format || 'video'}
Style: ${settings.style || 'cinematic'}
Camera: ${settings.cinematic || 'dynamic'}

Rewrite this as a better image generation prompt:`,
        },
      ]);

      if (enhanced?.trim()) {
        updateScene(sceneId, { prompt: enhanced.trim() });
        addLog(`[✓] Cảnh #${scene.order}: prompt đã được cải thiện.`);
      }
    } catch (e: any) {
      addLog(`[LỖI] Enhance cảnh #${scene.order}: ${e?.message ?? 'thất bại.'}`);
    } finally {
      setEnhancingSceneId(null);
    }
  }, [scenes, enhancingSceneId, updateScene, addLog, settings]);

  // ── Enhance ALL visible scene prompts ──────────────────────────
  const handleEnhanceAllPrompts = useCallback(async () => {
    if (isProcessing || scenes.length === 0) return;
    setIsProcessing(true);
    addLog(`[AI] Cải thiện toàn bộ ${scenes.length} cảnh...`);
    try {
      for (const scene of scenes) {
        const enhanced = await aiChatOnceViaProxy([
          { role: 'system', content: `You are a cinematic prompt engineer. Rewrite the scene description to be more visually specific for AI image generation. Return ONLY the enhanced prompt, 40-70 words, ${settings.style || 'cinematic'} style.` },
          { role: 'user', content: `Scene ${scene.order}: "${scene.prompt}"\nContext: ${settings.format || ''} ${settings.cinematic || ''}. Rewrite:` },
        ]);
        if (enhanced?.trim()) updateScene(scene.id, { prompt: enhanced.trim() });
        await new Promise(r => setTimeout(r, 500)); // Rate limit
      }
      addLog(`[✓] Tất cả ${scenes.length} cảnh đã được cải thiện.`);
    } catch (e: any) {
      addLog(`[LỖI] Enhance all: ${e?.message ?? 'unknown'}`);
    } finally {
      setIsProcessing(false);
    }
  }, [scenes, isProcessing, updateScene, addLog, settings]);

  // ── Voiceover generation ────────────────────────────────────
  const handleGenerateVoiceover = useCallback(async (sceneId: string, voiceText?: string) => {
    const scene = scenes.find(s => s.id === sceneId);
    if (!scene || isGeneratingVoiceover) return;

    setIsGeneratingVoiceover(true);
    addLog(`[🎙️] Tạo voice-over cảnh #${scene.order}...`);

    try {
      const { generateDemoAudio } = await import('../services/gemini');
      const text = voiceText || scene.prompt.slice(0, 200); // cap at 200 chars
      const voiceName = settings.voiceOver?.toLowerCase().includes('female') ? 'Aoede' : 'Kore';

      const audioBuffer = await generateDemoAudio(text, voiceName);
      if (audioBuffer) {
        // Convert AudioBuffer to blob URL for playback
        const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContextClass();
        const offlineCtx = new OfflineAudioContext(audioBuffer.numberOfChannels, audioBuffer.length, audioBuffer.sampleRate);
        const source = offlineCtx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(offlineCtx.destination);
        source.start();
        const rendered = await offlineCtx.startRendering();

        // Encode as WAV
        const wavBuffer = audioBufferToWav(rendered);
        const blob = new Blob([wavBuffer], { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(blob);
        updateScene(sceneId, { audioUrl });
        addLog(`[✓] Voice-over cảnh #${scene.order} hoàn tất.`);
      }
    } catch (e: any) {
      addLog(`[LỖI] Voice-over cảnh #${scene.order}: ${e?.message ?? 'thất bại.'}`);
    } finally {
      setIsGeneratingVoiceover(false);
    }
  }, [scenes, isGeneratingVoiceover, updateScene, addLog, settings]);

  // Helper: convert AudioBuffer to WAV binary
  const audioBufferToWav = (buffer: AudioBuffer): ArrayBuffer => {
    const numCh = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;
    const bytesPerSample = bitDepth / 8;
    const blockAlign = numCh * bytesPerSample;
    const dataLength = buffer.length * blockAlign;
    const totalLength = 44 + dataLength;
    const arrayBuf = new ArrayBuffer(totalLength);
    const view = new DataView(arrayBuf);
    const writeStr = (offset: number, s: string) => { for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i)); };
    writeStr(0, 'RIFF'); view.setUint32(4, 36 + dataLength, true);
    writeStr(8, 'WAVE'); writeStr(12, 'fmt '); view.setUint32(16, 16, true);
    view.setUint16(20, format, true); view.setUint16(22, numCh, true);
    view.setUint32(24, sampleRate, true); view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true); view.setUint16(34, bitDepth, true);
    writeStr(36, 'data'); view.setUint32(40, dataLength, true);
    let offset = 44;
    for (let i = 0; i < buffer.length; i++) {
      for (let ch = 0; ch < numCh; ch++) {
        const s = Math.max(-1, Math.min(1, buffer.getChannelData(ch)[i]));
        view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
        offset += 2;
      }
    }
    return arrayBuf;
  };

  // ── Download helpers ─────────────────────────────────────────────
  const handleDownloadScene = useCallback((scene: Scene) => {
    const url = scene.videoUrl || scene.visualUrl;
    if (!url) return;
    const ext = scene.videoUrl ? 'mp4' : 'jpg';
    const a = document.createElement('a');
    a.href = url;
    a.download = `scene-${String(scene.order).padStart(2, '0')}.${ext}`;
    a.click();
  }, []);

  const handleDownloadAudio = useCallback((scene: Scene) => {
    if (!scene.audioUrl) return;
    const a = document.createElement('a');
    a.href = scene.audioUrl;
    a.download = `voiceover-scene-${String(scene.order).padStart(2, '0')}.wav`;
    a.click();
  }, []);

  const [isZipping, setIsZipping] = useState(false);

  const handleDownloadBatchZip = useCallback(async (sceneIds: string[]) => {
    if (isZipping) return;
    const targets = scenes.filter(s => sceneIds.includes(s.id) && (s.videoUrl || s.visualUrl));
    if (targets.length === 0) { showToast('Không có media để tải xuống', 'warning'); return; }

    setIsZipping(true);
    addLog(`[ZIP] Đang nén ${targets.length} file...`);
    try {
      const { default: JSZip } = await import('jszip');
      const zip = new JSZip();
      const folder = zip.folder('storyboard') ?? zip;

      await Promise.all(targets.map(async (s) => {
        const url = s.videoUrl || s.visualUrl!;
        const ext = s.videoUrl ? 'mp4' : 'jpg';
        const filename = `scene-${String(s.order).padStart(2, '0')}.${ext}`;
        try {
          const res = await fetch(url);
          const blob = await res.blob();
          folder.file(filename, blob);
        } catch {
          addLog(`[ZIP] Bỏ qua ${filename} — không tải được.`);
        }
      }));

      const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'STORE' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(zipBlob);
      a.download = `storyboard-${Date.now()}.zip`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 3000);
      addLog(`[ZIP] Hoàn tất — tải về ${targets.length} file.`);
      showToast(`✓ Đã đóng gói ${targets.length} file thành ZIP`, 'success');
    } catch (e: any) {
      addLog(`[ZIP LỖI] ${e?.message ?? 'unknown'}`);
      showToast('Không thể tạo ZIP', 'error');
    } finally {
      setIsZipping(false);
    }
  }, [isZipping, scenes, addLog, showToast]);

  // ── Move scene up/down (keyboard reorder) ────────────────────────
  const handleMoveScene = useCallback((id: string, direction: 'up' | 'down') => {
    setScenes(prev => {
      const idx = prev.findIndex(s => s.id === id);
      if (idx < 0) return prev;
      if (direction === 'up' && idx === 0) return prev;
      if (direction === 'down' && idx === prev.length - 1) return prev;
      const next = [...prev];
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
      [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
      return next.map((sc, i) => ({ ...sc, order: i + 1 }));
    });
  }, []);

  // ── Project persistence helpers ──────────────────────────────────

  /** Load a project's data into local state (called when switching projects) */
  const loadProjectIntoState = useCallback((id: string) => {
    const data = projectManager.switchProject(id);
    setScript(data.script || '');
    setScenes(data.scenes || []);
    setAssets(data.assets || []);
    setTotalDuration(data.totalDuration || 64);
    setSceneDuration(data.sceneDuration || 8);
    setProjectName(data.name || 'Untitled Project');
  }, [projectManager]);

  const handleNewProject = useCallback(() => {
    const p = projectManager.createProject();
    setScript(''); setScenes([]); setAssets([]);
    setTotalDuration(64); setSceneDuration(8);
    setProjectName(p.name);
    addLog('[★] Project mới đã được khởi tạo.');
  }, [projectManager, addLog]);

  const handleExportProjectJSON = useCallback(() => {
    const data = { script, totalDuration, sceneDuration, scenes, assets, settings, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `storyboard-project-${Date.now()}.json`; a.click();
    URL.revokeObjectURL(url);
    addLog('[✓] Project JSON đã được xuất.');
  }, [script, totalDuration, sceneDuration, scenes, assets, settings, addLog]);

  const handleImportProjectJSON = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.script !== undefined) setScript(data.script);
        if (data.scenes) setScenes(data.scenes);
        if (data.assets) setAssets(data.assets);
        if (data.totalDuration) setTotalDuration(data.totalDuration);
        if (data.sceneDuration) setSceneDuration(data.sceneDuration);
        addLog(`[✓] Import thành công: ${data.scenes?.length || 0} cảnh, ${data.assets?.length || 0} assets.`);
      } catch { addLog('[LỖI] File JSON không hợp lệ.'); }
    };
    reader.readAsText(file);
  }, [addLog]);

  const handleAssetUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeUploadAssetId) {
      updateAsset(activeUploadAssetId, { status: 'processing' });
      try {
        const metadata = await uploadToGCS(file);
        updateAsset(activeUploadAssetId, {
          url: metadata.url,
          mediaId: metadata.mediaId || metadata.id,
          status: 'done'
        });
      } catch (err) {
        updateAsset(activeUploadAssetId, { status: 'error' });
      } finally {
        setActiveUploadAssetId(null);
        if (e.target) e.target.value = '';
      }
    }
  };

  // ── Shot type per scene ──────────────────────────────────────────────
  const handleShotTypeChange = useCallback((sceneId: string, shotType: ShotType) => {
    setScenes(prev => prev.map(sc => sc.id === sceneId ? { ...sc, shotType } : sc));
  }, []);

  // ── Per-scene duration ────────────────────────────────────────────────
  const handleSceneDurationChange = useCallback((sceneId: string, duration: DurationPreset) => {
    setScenes(prev => prev.map(sc => sc.id === sceneId ? { ...sc, duration } : sc));
  }, []);

  // ── Drag reorder ─────────────────────────────────────────────────────
  const handleReorder = useCallback((reordered: Scene[]) => {
    setScenes(reordered.map((sc, i) => ({ ...sc, order: i + 1 })));
  }, []);

  return {
    activeTab, setActiveTab, script, setScript, scriptRefImage, setScriptRefImage, scriptRefAudio, setScriptRefAudio,
    totalDuration, setTotalDuration, sceneDuration, setSceneDuration, voiceOverEnabled, setVoiceOverEnabled,
    scenes, setScenes, updateScene, selectedSceneIds, setSelectedSceneIds, toggleSceneSelection, selectAllScenes,
    isProcessing, isEnhancing, enhancingSceneId, isGeneratingVoiceover,
    showProgressModal, closeProgressModal, terminalLogs, settings, setSettings, handleCreateStoryboard,
    handleSaveAndGenerate,
    handleLoadSample, handleLoadSuggestion, handleReGenerateAsset,
    handleReGenerateSceneImage, handleReGenerateSceneVideo,
    handleEnhanceScenePrompt, handleEnhanceAllPrompts,
    handleGenerateVoiceover,
    handleNewProject, handleExportProjectJSON, handleImportProjectJSON,
    assets, setAssets, addAsset: (type?: AssetType) => openAssetModal(type ? { id: `asset-${Date.now()}`, name: 'Tài nguyên mới', url: null, mediaId: null, type, status: 'idle', description: '', designPrompt: '' } : undefined), removeAsset: (id: string) => setAssets(prev => prev.filter(a => a.id !== id)),
    updateAsset, isAssetModalOpen, openAssetModal, closeAssetModal, saveAsset, editingAsset, setEditingAsset,
    viewingExplorerItem, setViewingExplorerItem, openExplorerView, openExplorerViewScene,
    systemPrompt, setSystemPrompt, handleGenerateBatchImages, handleGenerateBatchVideos,
    assetUploadRef, setActiveUploadAssetId, handleAssetUpload,
    // ── Phase 1/2 additions ──
    projectName, setProjectName,
    renderedScenes, computedTotalDuration, creditCostEstimate,
    handleShotTypeChange, handleSceneDurationChange, handleReorder,
    // ── Phase 3: Download + Audio + Drag ──
    handleDownloadScene, handleDownloadAudio, handleDownloadBatchZip, isZipping,
    handleMoveScene,
    // ── Multi-project ──
    projectManager, loadProjectIntoState,
  };
};
