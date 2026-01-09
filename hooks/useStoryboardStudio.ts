
import { useState, useCallback, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { generateDemoImage } from '../services/gemini';
import { useAuth } from '../context/AuthContext';
import { imagesApi } from '../apis/images';
import { videosApi, VideoJobRequest, VideoJobResponse } from '../apis/videos';
import { ExplorerItem } from '../components/ExplorerDetailModal';
import { STORYBOARD_SAMPLES } from '../data';

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
  characterIds?: string[]; // Danh sách ID các asset xuất hiện trong cảnh
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

  const [settings, setSettings] = useState({
    videoPrompt: true,
    format: 'TVC Quảng cáo',
    style: 'Hoạt hình 3D',
    culture: 'Futuristic Vietnam',
    background: 'Rain-slicked alleyways reflecting neon holograms, futuristic skyscrapers with jade accents.',
    cinematic: 'Low-angle tracking shots, shallow depth of field, anamorphic lens flares.',
    bgm: 'Lo-fi hip hop beats blended with traditional Vietnamese instruments.',
    voiceOver: 'Deep, resonant male voice with a calm and wise tone.',
    duration: 64,
    sceneDuration: 8,
    model: 'veo_3_1',
    imageModel: 'google_image_gen_4_5',
    retryCount: 2,
    maxThreads: 5
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
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ parts: [{ text: promptPayload }], role: "user" }],
        config: {
          responseMimeType: "application/json",
        },
      });

      if (response.text) {
        const result = JSON.parse(response.text);
        
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
      }
    } catch (e) {
      console.error("Gemini Suggestion Error:", e);
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

  const pollImageJobStatus = useCallback(async (jobId: string, assetId: string) => {
    try {
      const response: any = await imagesApi.getJobStatus(jobId);
      const jobStatus = response.data?.status || response.status;

      if (jobStatus === 'done' && response.data.result?.images?.length) {
        const imageUrl = response.data.result.images[0];
        const mediaId = response.data.result.imageId || null;
        updateAsset(assetId, { url: imageUrl, mediaId: mediaId, status: 'done' });
        refreshUserInfo();
        if (!autoCloseTriggeredRef.current) {
          autoCloseTriggeredRef.current = true;
          addLog("KẾT QUẢ: Đã tạo thành công concept.");
          setTimeout(closeProgressModal, 1500);
        }
      } else if (jobStatus === 'error' || jobStatus === 'failed') {
        updateAsset(assetId, { status: 'error' });
        addLog(`LỖI: Tác vụ ${jobId} thất bại.`);
      } else {
        setTimeout(() => pollImageJobStatus(jobId, assetId), 5000);
      }
    } catch (e) {
      updateAsset(assetId, { status: 'error' });
    }
  }, [updateAsset, refreshUserInfo, closeProgressModal, addLog]);

  const pollVideoJobStatus = useCallback(async (jobId: string, sceneId: string, cost: number) => {
    try {
      const response: VideoJobResponse = await videosApi.getJobStatus(jobId);
      const isSuccess = response.success === true || response.status?.toLowerCase() === 'success';
      const jobStatus = response.data?.status?.toLowerCase();

      if (jobStatus === 'done' && response.data.result?.videoUrl) {
        updateScene(sceneId, { videoUrl: response.data.result.videoUrl, status: 'done' });
        addLog(`KẾT QUẢ: Phân cảnh #${sceneId.slice(-4)} kết xuất thành công.`);
        refreshUserInfo();
      } else if (jobStatus === 'failed' || jobStatus === 'error' || (!isSuccess && jobStatus !== 'pending' && jobStatus !== 'processing')) {
        updateScene(sceneId, { status: 'error' });
        addLog(`LỖI: Render phân cảnh #${sceneId.slice(-4)} thất bại. Hoàn trả: ${cost} CR.`);
        addCredits(cost);
      } else {
        setTimeout(() => pollVideoJobStatus(jobId, sceneId, cost), 5000);
      }
    } catch (e) {
      console.error("Video poll error", e);
      setTimeout(() => pollVideoJobStatus(jobId, sceneId, cost), 10000);
    }
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
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
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
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ parts: [{ text: promptPayload }], role: "user" }],
        config: { 
          responseMimeType: "application/json",
          systemInstruction: systemPrompt
        }
      });
      
      const data = JSON.parse(response.text || '{}');
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
    setIsProcessing(true);
    addLog(`Bắt đầu kết xuất ${selectedSceneIds.length} hình ảnh...`);
    
    for (const id of selectedSceneIds) {
      const scene = scenes.find(s => s.id === id);
      if (!scene || scene.visualUrl) continue;
      
      updateScene(id, { status: 'generating' });
      try {
        const res = await generateDemoImage({
          prompt: `${scene.prompt}. ${settings.style} style, ${settings.cinematic} camera.`,
          model: settings.imageModel
        });
        if (res) {
          updateScene(id, { visualUrl: res, status: 'done' });
        } else {
          updateScene(id, { visualUrl: null, status: 'error' });
        }
      } catch (e) {
        updateScene(id, { visualUrl: null, status: 'error' });
      }
    }
    setIsProcessing(false);
    addLog("Hoàn tất kết xuất hình ảnh.");
    setSelectedSceneIds([]);
  }, [selectedSceneIds, isProcessing, scenes, updateScene, addLog, settings.style, settings.cinematic, settings.imageModel]);

  const handleGenerateBatchVideos = useCallback(async () => {
    if (selectedSceneIds.length === 0 || isProcessing) return;
    setIsProcessing(true);
    addLog(`Bắt đầu tiến trình kết xuất ${selectedSceneIds.length} phân cảnh video...`);
    
    const currentModelKey = "veo_3_1"; 
    const unitCost = 50; 

    for (const id of selectedSceneIds) {
      const scene = scenes.find(s => s.id === id);
      if (!scene || scene.videoUrl) continue;
      
      if (credits < unitCost) {
        addLog("CẢNH BÁO: Hạn ngạch cạn kiệt, tạm dừng tiến trình.");
        break;
      }

      updateScene(id, { status: 'generating' });
      addLog(`Uplink: Đang gửi lệnh render phân cảnh #${id.slice(-4)}...`);

      try {
        const sceneRefs = assets
          .filter(a => scene.characterIds?.includes(a.id) && a.url)
          .map(a => a.url!);

        const payload: VideoJobRequest = {
          type: "ingredient",
          input: { images: sceneRefs },
          config: {
            duration: sceneDuration,
            aspectRatio: "16:9",
            resolution: "720p"
          },
          engine: {
            provider: "gommo",
            model: currentModelKey as any
          },
          enginePayload: {
            accessToken: "STORYBOARD_GATEWAY",
            prompt: `${scene.prompt}. ${settings.style} style, ${settings.cinematic} camera, ${settings.background} background.`,
            privacy: "PRIVATE",
            translateToEn: true,
            projectId: "default",
            mode: "fast" 
          }
        };

        const res = await videosApi.createJob(payload);
        if (res.success && res.data.jobId) {
          useCredits(unitCost);
          pollVideoJobStatus(res.data.jobId, id, unitCost);
        } else {
          updateScene(id, { status: 'error' });
          addLog(`LỖI: Server từ chối lệnh render phân cảnh #${id.slice(-4)}.`);
        }
      } catch (e) {
        updateScene(id, { status: 'error' });
        addLog(`LỖI: Mất kết nối khi khởi tạo render phân cảnh #${id.slice(-4)}.`);
      }
    }
    setIsProcessing(false);
    setSelectedSceneIds([]);
  }, [selectedSceneIds, isProcessing, scenes, updateScene, addLog, credits, sceneDuration, useCredits, pollVideoJobStatus, assets, settings]);

  const handleReGenerateAsset = useCallback((id: string) => {
    const targetAsset = assets.find(a => a.id === id);
    if (targetAsset) {
      updateAsset(id, { status: 'processing', url: null });
      triggerImageGeneration({ ...targetAsset, status: 'processing', url: null });
    }
  }, [assets, triggerImageGeneration, updateAsset]);

  return {
    activeTab, setActiveTab, script, setScript, scriptRefImage, setScriptRefImage, scriptRefAudio, setScriptRefAudio,
    totalDuration, setTotalDuration, sceneDuration, setSceneDuration, voiceOverEnabled, setVoiceOverEnabled,
    scenes, setScenes, updateScene, selectedSceneIds, toggleSceneSelection, selectAllScenes,
    isProcessing, isEnhancing, showProgressModal, closeProgressModal, terminalLogs, settings, setSettings, handleCreateStoryboard,
    handleSaveAndGenerate,
    handleLoadSample, handleLoadSuggestion, handleReGenerateAsset,
    assets, addAsset: () => openAssetModal(), removeAsset: (id: string) => setAssets(prev => prev.filter(a => a.id !== id)),
    updateAsset, isAssetModalOpen, openAssetModal, closeAssetModal, saveAsset, editingAsset, setEditingAsset,
    viewingExplorerItem, setViewingExplorerItem, openExplorerView, openExplorerViewScene,
    systemPrompt, setSystemPrompt, handleGenerateBatchImages, handleGenerateBatchVideos
  };
};
