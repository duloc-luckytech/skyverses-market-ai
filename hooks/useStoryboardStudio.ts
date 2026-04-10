import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { generateDemoImage, generateDemoText } from '../services/gemini';
import { useAuth } from '../context/AuthContext';
import { imagesApi } from '../apis/images';
import { videosApi, VideoJobRequest } from '../apis/videos';
import { ExplorerItem } from '../components/ExplorerDetailModal';
import { STORYBOARD_SAMPLES } from '../data';
import { uploadToGCS } from '../services/storage';
import { pollJobOnce } from './useJobPoller';

export interface Scene {
  id: string;
  order: number;
  duration: number;
  prompt: string;
  visualUrl?: string | null;
  videoUrl?: string | null;
  audioUrl?: string | null;
  status: 'idle' | 'analyzing' | 'generating' | 'done' | 'error';
  jobId?: string;
  characterIds?: string[];
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

  const [activeTab, setActiveTab] = useState<'STORYBOARD' | 'ASSETS' | 'SETTINGS' | 'LOGIC' | 'SCENES'>('STORYBOARD');
  const [script, setScript] = useState('');
  const [totalDuration, setTotalDuration] = useState(64); 
  const [sceneDuration, setSceneDuration] = useState(8);
  const [voiceOverEnabled, setVoiceOverEnabled] = useState(false);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [selectedSceneIds, setSelectedSceneIds] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);

  const [showProgressModal, setShowProgressModal] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const autoCloseTriggeredRef = useRef(false);

  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<ReferenceAsset | null>(null);
  const [viewingExplorerItem, setViewingExplorerItem] = useState<ExplorerItem | null>(null);

  const [scriptRefImage, setScriptRefImage] = useState<string | null>(null);
  const [scriptRefAudio, setScriptRefAudio] = useState<string | null>(null);

  const [assets, setAssets] = useState<ReferenceAsset[]>([]);
  const assetUploadRef = useRef<HTMLInputElement>(null);
  const [activeUploadAssetId, setActiveUploadAssetId] = useState<string | null>(null);

  const isCancelledRef = useRef(false);

  // Cancel all in-flight polls on unmount
  useEffect(() => {
    return () => { isCancelledRef.current = true; };
  }, []);

  const [settings, setSettings] = useState({
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
  });

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
    const currentIdea = script.trim() || "Một ý tưởng ngẫu nhiên thú vị";
    
    try {
      const promptPayload = `
        Based on this idea: "${currentIdea}", create a professional and fluid narrative script for a video.
        The video has a TOTAL duration of ${totalDuration}s.
        
        CRITICAL INSTRUCTION: 
        - Write the script as a SINGLE, COHESIVE story arc. 
        - DO NOT mention "Shot 1", "Scene 2", "Beat 3", or any specific breakdown markers. 
        - Just provide a rich, descriptive paragraph that describes the beginning, middle, and end of the visual narrative.

        Fill in the following fields based on current context:
        - refined_idea (The fluid narrative described above)
        - format (e.g., Phim ngắn, TVC Quảng cáo, MV Ca nhạc)
        - style (e.g., Hoạt hình 3D, Hoạt hình 2D, Anime, Live-action, Cyberpunk, Realistic)
        - culture (setting/country)
        - background (specific setting details)
        - cinematic (camera style)
        - bgm (music mood)
        - voice-over (narrator style)

        Return ONLY a JSON object with these keys. No markdown.
      `;

      const res = await generateDemoText(
        promptPayload, 
        'gemini-3-flash-preview', 
        "You are a professional Storyboard Assistant. Help the user refine their creative ideas into structured narrative scripts."
      );
      
      if (res && res !== "CONNECTION_TERMINATED") {
        try {
          const result = JSON.parse(res);
          if (result.refined_idea) setScript(result.refined_idea);
          setSettings(prev => ({
            ...prev,
            format: result.format || prev.format,
            style: result.style || prev.style,
            culture: result.culture || prev.culture,
            background: result.background || prev.background,
            cinematic: result.cinematic || prev.cinematic,
            bgm: result.bgm || prev.bgm,
            voiceOver: result['voice-over'] || prev.voiceOver
          }));
        } catch (e) {
          console.error("JSON parse error on suggestion", e);
        }
      }
    } catch (e) {
      console.error("Suggestion generation error", e);
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
    setTerminalLogs(["Khởi tạo node xử lý kịch bản..."]);
    setIsProcessing(true);
    autoCloseTriggeredRef.current = false;

    const numScenes = Math.ceil(totalDuration / sceneDuration);

    try {
      const aestheticContext = `
        AESTHETIC SPECIFICATIONS:
        - Format: ${settings.format}
        - Global Style: ${settings.style}
        - Culture: ${settings.culture}
        - Ambient Lighting & Background: ${settings.background}
        - Cinematic Lens & Camera: ${settings.cinematic}
      `;

      const promptPayload = `
        ${aestheticContext}
        
        REQUIRED OUTPUT:
        1. Break down this narrative script into a detailed cinematic storyboard sequence: "${script}".
        2. Extract EVERY individual character as a separate object.
        3. Identify primary locations or environment settings.
        
        The timeline is ${totalDuration}s, and you MUST generate EXACTLY ${numScenes} scenes.
        
        Strictly follow this JSON schema:
        {
          "characters": [{"temp_id": "c1", "name": "NAME", "description": "Detailed physical description"}],
          "locations": [{"temp_id": "l1", "name": "NAME", "description": "Detailed environmental description"}],
          "scenes": [{"order": 1, "visualPrompt": "Cinematic visual description prompt, MUST include reference to character IDs and use the requested style and camera settings", "appears": ["c1", "l1"]}]
        }
        
        IMPORTANT: 
        - The TOTAL combined number of characters and locations to generate must be exactly 5.
        - CRITICAL: In "appears" array, list ONLY the "temp_id" of characters or locations that are LITERALLY present in that specific scene's visual description.
        - Ensure visualPrompts are detailed and descriptive.
      `;
      
      const res = await generateDemoText(promptPayload, 'gemini-3-pro-preview', systemPrompt);
      if (res && res !== "CONNECTION_TERMINATED") {
        const data = JSON.parse(res);
        const extractedCharacters = data.characters || [];
        const extractedLocations = data.locations || [];
        const extractedScenes = data.scenes || [];
        
        addLog(`Xử lý thành công: Trích xuất ${extractedCharacters.length} nhân vật, ${extractedLocations.length} bối cảnh.`);
        
        const visualStyle = settings.style.includes('--') ? 'Cinematic, hyper-detailed' : settings.style;
        const idMap: Record<string, string> = {};

        const charAssets: ReferenceAsset[] = extractedCharacters.map((c: any, i: number) => {
          const realId = `char-${Date.now()}-${i}`;
          idMap[c.temp_id] = realId;
          return {
            id: realId,
            name: c.name,
            url: null,
            mediaId: null,
            type: 'CHARACTER',
            status: 'idle',
            designPrompt: `Design sheet of ${c.name}, ${c.description}, ${visualStyle} style, white background, detailed character design, consistent with ${settings.culture}`
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
            type: 'LOCATION',
            status: 'idle',
            designPrompt: `Concept environment sheet of ${l.name}, ${l.description}, ${visualStyle} style, detailed background design, consistent with ${settings.background}`
          };
        });
        
        const allExtractedAssets = [...charAssets, ...locAssets].slice(0, 5);
        setAssets(allExtractedAssets);

        setScenes(extractedScenes.map((s: any, i: number) => ({
          id: `scene-${Date.now()}-${i}`,
          order: s.order || (i + 1),
          duration: sceneDuration,
          prompt: s.visualPrompt || s.title || "Cinematic scene",
          status: 'idle',
          characterIds: (s.appears || []).map((tid: string) => idMap[tid]).filter(Boolean)
        })));

        for (const asset of allExtractedAssets) {
          triggerImageGeneration(asset);
        }
      }
    } catch (error) {
      addLog("LỖI HỆ THỐNG: Không thể phân tách kịch bản.");
      setTimeout(closeProgressModal, 3000);
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
      const aestheticPrompt = [
        scene.prompt,
        settings.style && settings.style !== '--' ? `Style: ${settings.style}` : '',
        settings.cinematic ? `Camera: ${settings.cinematic}` : '',
        settings.culture ? `World: ${settings.culture}` : '',
      ].filter(Boolean).join('. ');

      try {
        const payload: any = {
          type: 'text_to_image',
          input: { prompt: aestheticPrompt },
          config: { width: 1024, height: 576, aspectRatio: '16:9', seed: 0, style: '' },
          engine: { provider: 'gommo', model: settings.imageModel as any },
          enginePayload: { prompt: aestheticPrompt, privacy: 'PRIVATE', projectId: 'default' },
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

  return {
    activeTab, setActiveTab, script, setScript, scriptRefImage, setScriptRefImage, scriptRefAudio, setScriptRefAudio,
    totalDuration, setTotalDuration, sceneDuration, setSceneDuration, voiceOverEnabled, setVoiceOverEnabled,
    scenes, setScenes, updateScene, selectedSceneIds, setSelectedSceneIds, toggleSceneSelection, selectAllScenes,
    isProcessing, isEnhancing, showProgressModal, closeProgressModal, terminalLogs, settings, setSettings, handleCreateStoryboard,
    handleSaveAndGenerate,
    handleLoadSample, handleLoadSuggestion, handleReGenerateAsset,
    handleReGenerateSceneImage, handleReGenerateSceneVideo,
    assets, addAsset: () => openAssetModal(), removeAsset: (id: string) => setAssets(prev => prev.filter(a => a.id !== id)),
    updateAsset, isAssetModalOpen, openAssetModal, closeAssetModal, saveAsset, editingAsset, setEditingAsset,
    viewingExplorerItem, setViewingExplorerItem, openExplorerView, openExplorerViewScene,
    systemPrompt, setSystemPrompt, handleGenerateBatchImages, handleGenerateBatchVideos,
    assetUploadRef, setActiveUploadAssetId, handleAssetUpload
  };
};