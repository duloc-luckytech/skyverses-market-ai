
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { uploadToGCS, GCSAssetMetadata } from '../services/storage';
import { imagesApi, ImageJobRequest, ImageJobResponse } from '../apis/images';
import { pricingApi, PricingModel } from '../apis/pricing';
import { getCostFromPricing, getResolutionsFromPricing } from '../utils/pricing-helpers';
import { EventConfig, COMMON_STUDIO_CONSTANTS, STYLE_PRESETS, EventTemplate } from '../constants/event-configs';

export interface RenderResult {
  id: string;
  url: string | null;
  status: 'processing' | 'done' | 'error';
  prompt: string;
  timestamp: string;
  cost: number;
  seed: number;
  metadata?: any;
  pinned?: boolean;
}

export interface SourceImage {
  id: string;
  url: string;
  mediaId: string | null;
  status: 'uploading' | 'done';
  role?: 'anchor' | 'clothing' | 'couple';
}

export const useEventStudio = (config: EventConfig) => {
  const { credits, useCredits, addCredits, isAuthenticated, login, refreshUserInfo } = useAuth();
  
  // -- Operation States --
  const [isRequesting, setIsRequesting] = useState(false);
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'CURRENT' | 'HISTORY'>('CURRENT');
  const [showLowCreditAlert, setShowLowCreditAlert] = useState(false);

  // -- Content States --
  const [sourceImages, setSourceImages] = useState<SourceImage[]>([]);
  const [clothingImages, setClothingImages] = useState<SourceImage[]>([]);
  const [prompt, setPrompt] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(config.subjects[0]);
  const [selectedScenes, setSelectedScenes] = useState<string[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  
  // -- Tech Config --
  const [availableModels, setAvailableModels] = useState<any[]>([]);
  const [selectedModel, setSelectedModel] = useState<any>(null);
  const [selectedEngine, setSelectedEngine] = useState<string>('gommo');
  const [selectedRatio, setSelectedRatio] = useState(COMMON_STUDIO_CONSTANTS.RATIOS[0]);
  const [selectedRes, setSelectedRes] = useState('1k');
  const [quantity, setQuantity] = useState(1);

  // -- Fetch models from PricingMatrix (same as main Image Generator) --
  useEffect(() => {
    setAvailableModels([]);
    setSelectedModel(null);
    const fetchPricing = async () => {
      try {
        const res = await pricingApi.getPricing({ tool: 'image', engine: selectedEngine });
        if (res.success && res.data.length > 0) {
          const mapped = res.data.map((m: PricingModel) => ({
            id: m._id,
            name: m.name,
            modelKey: m.modelKey,
            raw: m
          }));
          setAvailableModels(mapped);
          const defaultModel = mapped.find((m: any) => m.raw.modelKey === 'google_image_gen_banana_pro') || mapped[0];
          setSelectedModel(defaultModel);

          const resOptions = getResolutionsFromPricing(defaultModel.raw.pricing);
          if (resOptions.length > 0) setSelectedRes(resOptions[0]);
          if (defaultModel.raw.aspectRatios && defaultModel.raw.aspectRatios.length > 0) setSelectedRatio(defaultModel.raw.aspectRatios[0]);
        }
      } catch (error) {
        console.error('Failed to fetch image pricing:', error);
      }
    };
    fetchPricing();
  }, [selectedEngine]);
  
  // -- Results & History --
  const [results, setResults] = useState<RenderResult[]>([]);
  const [historyResults, setHistoryResults] = useState<RenderResult[]>([]);
  const [isFetchingHistory, setIsFetchingHistory] = useState(false);
  const [activeResultId, setActiveResultId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [compareMode, setCompareMode] = useState(false);

  // -- Modals & Preferences --
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorImage, setEditorImage] = useState<string | null>(null);
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [usagePreference, setUsagePreference] = useState<'credits' | 'key'>(() => {
    return (localStorage.getItem('skyverses_usage_preference') as any) || 'credits';
  });

  const [isUploading, setIsUploading] = useState(false);

  // Derived states
  const isGenerating = useMemo(() => results.some(r => r.status === 'processing'), [results]);
  const activeStylePreset = useMemo(() => STYLE_PRESETS.find(s => s.id === selectedStyle), [selectedStyle]);

  // Sorted results: pinned first
  const sortedResults = useMemo(() => {
    const pinned = results.filter(r => favorites.has(r.id));
    const unpinned = results.filter(r => !favorites.has(r.id));
    return [...pinned, ...unpinned];
  }, [results, favorites]);

  // --- FETCH HISTORY ---
  const fetchHistory = useCallback(async () => {
    if (!isAuthenticated || isFetchingHistory) return;
    setIsFetchingHistory(true);
    try {
      const res = await imagesApi.getJobs({ limit: 30 });
      if (res && res.data) {
        const mapped: RenderResult[] = res.data
          .filter((job: any) => job.enginePayload?.category === config.id.toUpperCase())
          .map((job: any) => ({
            id: job._id || job.jobId,
            url: job.result?.images?.[0] || null,
            status: job.status === 'done' ? 'done' : (job.status === 'failed' || job.status === 'error' ? 'error' : 'processing'),
            prompt: job.input?.prompt || 'Generated Asset',
            timestamp: new Date(job.createdAt).toLocaleString(),
            cost: job.creditsUsed || 0,
            seed: job.config?.seed || 0,
            metadata: job.config
          }));
        setHistoryResults(mapped);
      }
    } catch (err) {
      console.error("Failed to fetch history:", err);
    } finally {
      setIsFetchingHistory(false);
    }
  }, [isAuthenticated, isFetchingHistory, config.id]);

  useEffect(() => {
    if (activeTab === 'HISTORY') fetchHistory();
  }, [activeTab, fetchHistory]);

  // --- TOOLTIP ---
  const currentUnitCost = useMemo(() => {
    if (!selectedModel?.raw?.pricing) return config.costBase;
    return getCostFromPricing(selectedModel.raw.pricing, selectedRes);
  }, [selectedModel, selectedRes, config.costBase]);

  const generateTooltip = useMemo(() => {
    if (!isAuthenticated) return "Vui lòng đăng nhập để tiếp tục";
    if (!selectedModel) return "Đang tải cấu hình AI...";
    const hasReadyImage = sourceImages.some(img => img.status === 'done');
    if (!hasReadyImage && !prompt.trim()) return "Vui lòng nhập kịch bản hoặc tải ảnh mỏ neo";
    if (usagePreference === 'credits' && credits < (currentUnitCost * quantity)) return `Số dư không đủ (Cần ${currentUnitCost * quantity} CR)`;
    return null;
  }, [isAuthenticated, selectedModel, sourceImages, prompt, usagePreference, credits, currentUnitCost, quantity]);

  const isGenerateDisabled = isRequesting || !!generateTooltip;

  // --- POLL STATUS ---
  const pollStatus = useCallback(async (jobId: string, resultId: string, cost: number) => {
    try {
      const res: ImageJobResponse = await imagesApi.getJobStatus(jobId);
      const status = res.data?.status;
      if (status === 'done' && res.data.result?.images?.length) {
        const imageUrl = res.data.result.images[0];
        setResults(prev => prev.map(r => r.id === resultId ? { ...r, url: imageUrl, status: 'done' } : r));
        setActiveResultId(resultId);
        refreshUserInfo();
      } else if (status === 'failed' || status === 'error') {
        if (usagePreference === 'credits') addCredits(cost);
        setResults(prev => prev.map(r => r.id === resultId ? { ...r, status: 'error' } : r));
      } else {
        setTimeout(() => pollStatus(jobId, resultId, cost), 4000);
      }
    } catch (e) {
      setResults(prev => prev.map(r => r.id === resultId ? { ...r, status: 'error' } : r));
    }
  }, [usagePreference, addCredits, refreshUserInfo]);

  // --- BUILD PROMPT ---
  const buildFinalPrompt = useCallback((overridePrompt?: string, overrideSeed?: number) => {
    const scenesString = selectedScenes.length > 0 ? `Bối cảnh: ${selectedScenes.join(', ')}.` : '';
    const styleModifier = activeStylePreset ? `\nSTYLE: ${activeStylePreset.modifier}` : '';
    const clothingRef = clothingImages.length > 0 ? '\nCLOTHING: The person should wear the exact clothing shown in the clothing reference image.' : '';
    const coupleNote = config.coupleMode && sourceImages.filter(i => i.status === 'done').length >= 2 
      ? '\nCOUPLE MODE: Two reference images provided — place both persons together as a romantic couple in the scene.' 
      : '';

    const userPrompt = overridePrompt || prompt || `Create a stunning ${config.id} themed photo with the theme "${selectedSubject}"`;

    const parts = [
      config.systemPrompt,
      coupleNote,
      clothingRef,
      styleModifier,
      '',
      `EVENT TYPE: ${config.name}`,
      `THEME: ${selectedSubject}`,
      scenesString ? `SCENE DETAILS: ${scenesString}` : '',
      `ATMOSPHERE: ${config.atmosphere}`,
      '',
      `USER REQUEST: ${userPrompt}`,
    ].filter(Boolean);

    return parts.join('\n');
  }, [config, selectedSubject, selectedScenes, prompt, activeStylePreset, clothingImages, sourceImages]);

  // --- CORE GENERATE ---
  const executeGenerate = async (overridePrompt?: string, overrideSeed?: number, overrideQty?: number) => {
    if (!isAuthenticated) { login(); return; }
    if (isRequesting || !selectedModel) return;

    const qty = overrideQty || quantity;
    const totalCost = currentUnitCost * qty;
    if (usagePreference === 'credits' && credits < totalCost) {
      setShowLowCreditAlert(true);
      return;
    }

    setIsRequesting(true);
    setActiveTab('CURRENT');
    if (window.innerWidth < 1024) setIsMobileExpanded(false);

    const finalPrompt = buildFinalPrompt(overridePrompt, overrideSeed);
    const anchors = sourceImages.filter(img => img.status === 'done');
    const clothingAnchor = clothingImages.find(img => img.status === 'done');

    for (let i = 0; i < qty; i++) {
      const seed = overrideSeed !== undefined ? overrideSeed + i : Math.floor(Math.random() * 999999);
      const resultId = `evt-${Date.now()}-${i}`;
      const newResult: RenderResult = {
        id: resultId,
        url: null,
        status: 'processing',
        prompt: overridePrompt || prompt || selectedSubject,
        timestamp: new Date().toLocaleTimeString(),
        cost: currentUnitCost,
        seed
      };

      setResults(prev => [newResult, ...prev]);
      setActiveResultId(resultId);

      try {
        // Build image references
        const imageRefs: string[] = [];
        if (anchors.length > 0) imageRefs.push(anchors[0].mediaId || anchors[0].url);
        if (config.coupleMode && anchors.length > 1) imageRefs.push(anchors[1].mediaId || anchors[1].url);
        if (clothingAnchor) imageRefs.push(clothingAnchor.mediaId || clothingAnchor.url);

        const payload: ImageJobRequest = {
          type: anchors.length > 0 ? "image_to_image" : "text_to_image",
          input: {
            prompt: finalPrompt,
            ...(imageRefs.length === 1 ? { image: imageRefs[0] } : {}),
            ...(imageRefs.length > 1 ? { images: imageRefs } : {}),
          },
          config: {
            width: 1024,
            height: 1024,
            aspectRatio: selectedRatio,
            seed,
            style: selectedStyle || 'cinematic'
          },
          engine: {
            provider: selectedEngine as any,
            model: selectedModel.raw.modelKey as any
          },
          enginePayload: {
            prompt: finalPrompt,
            privacy: 'PRIVATE',
            projectId: 'default',
            category: config.id.toUpperCase(),
            mode: anchors.length > 0 ? 'identity_sync' : 'text_to_image'
          }
        };

        const apiRes = await imagesApi.createJob(payload);
        if (apiRes.success && apiRes.data.jobId) {
          if (usagePreference === 'credits') useCredits(currentUnitCost);
          pollStatus(apiRes.data.jobId, resultId, currentUnitCost);
        } else {
          setResults(prev => prev.map(r => r.id === resultId ? { ...r, status: 'error' } : r));
        }
      } catch (e) {
        setResults(prev => prev.map(r => r.id === resultId ? { ...r, status: 'error' } : r));
      }
    }

    setIsRequesting(false);
  };

  const handleGenerate = () => executeGenerate();

  // --- FEATURE 5: MULTI-VARIATION (4 at once) ---
  const handleMultiVariation = () => executeGenerate(undefined, undefined, 4);

  // --- FEATURE 7: QUICK RE-GEN ---
  const handleRegenerate = (result: RenderResult) => {
    const newSeed = Math.floor(Math.random() * 999999);
    executeGenerate(result.prompt, newSeed, 1);
  };

  // --- FEATURE 4: PROMPT SUGGEST ---
  const handleSuggestPrompt = useCallback(() => {
    const scenesString = selectedScenes.length > 0 ? ` with ${selectedScenes.join(', ')}` : '';
    const styleStr = activeStylePreset ? ` in ${activeStylePreset.name} style` : '';
    
    const suggestions: Record<string, string[]> = {
      noel: [
        `Elegant Christmas portrait${scenesString}${styleStr}, surrounded by golden ornaments and gently falling snow, warm candlelight casting soft shadows`,
        `Cozy holiday scene${scenesString}${styleStr}, by the fireplace with a cup of cocoa, Christmas tree twinkling, stockings hung with care`,
        `Festive outdoor portrait${scenesString}${styleStr}, snow-dusted streets, vintage lamp posts, Christmas market in the background`,
      ],
      tet: [
        `Traditional Áo dài portrait${scenesString}${styleStr}, standing among vibrant peach blossoms, golden calligraphy scrolls, spring morning light`,
        `Elegant Tết celebration${scenesString}${styleStr}, beside a decorated kumquat tree, red lanterns and paper flowers, warm family atmosphere`,
        `Modern Tết fusion portrait${scenesString}${styleStr}, blending traditional Vietnamese elements with contemporary fashion, artistic composition`,
      ],
      wedding: [
        `Romantic couple portrait${scenesString}${styleStr}, elegant bridal gown flowing in the breeze, groom in tailored suit, golden hour backlighting`,
        `Luxury wedding studio shot${scenesString}${styleStr}, clean ethereal background, professional fashion photography quality, perfect grooming`,
        `Dreamy outdoor wedding${scenesString}${styleStr}, flower arch backdrop, soft bokeh, intimate embrace, magazine cover quality`,
      ],
      birthday: [
        `Glamorous birthday celebration${scenesString}${styleStr}, surrounded by floating balloons and confetti, stunning multi-tier cake, party lights`,
        `Fun vibrant birthday portrait${scenesString}${styleStr}, colorful decorations, giant gift boxes, celebratory champagne pop effect`,
        `Elegant birthday soirée${scenesString}${styleStr}, fairy lights canopy, flower arrangements, gold accents, glamorous outfit`,
      ]
    };

    const pool = suggestions[config.id] || suggestions['birthday'];
    const randomIdx = Math.floor(Math.random() * pool.length);
    setPrompt(pool[randomIdx]);
  }, [config.id, selectedScenes, activeStylePreset]);

  // --- FEATURE 2: APPLY TEMPLATE ---
  const applyTemplate = (template: EventTemplate) => {
    setPrompt(template.prompt);
    setSelectedStyle(template.style);
    setShowTemplates(false);
  };

  // --- FEATURE 9: FAVORITE/PIN ---
  const toggleFavorite = (resultId: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(resultId)) next.delete(resultId);
      else next.add(resultId);
      return next;
    });
  };

  // --- FEATURE 8: SHARE ---
  const handleShare = async (result: RenderResult) => {
    if (!result.url) return;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${config.name} — Skyverses AI`,
          text: result.prompt,
          url: result.url,
        });
      } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(result.url);
    }
  };

  // --- UPLOAD ---
  const processUploadFiles = async (files: File[], role: 'anchor' | 'clothing' | 'couple' = 'anchor') => {
    const fileList = Array.from(files);
    const setter = role === 'clothing' ? setClothingImages : setSourceImages;

    const newPlaceholders: SourceImage[] = fileList.map((file, i) => ({
      id: `uploading-${Date.now()}-${i}`,
      url: URL.createObjectURL(file),
      mediaId: null,
      status: 'uploading',
      role
    }));

    setter(prev => [...prev, ...newPlaceholders]);
    setIsUploading(true);

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const placeholderId = newPlaceholders[i].id;
      try {
      const metadata = await uploadToGCS(file, selectedEngine);
        setter(prev => prev.map(img =>
          img.id === placeholderId ? {
            ...img,
            id: metadata.id,
            url: metadata.url,
            mediaId: metadata.mediaId || null,
            status: 'done'
          } : img
        ));
      } catch (err) {
        console.error("Upload error:", err);
        setter(prev => prev.filter(img => img.id !== placeholderId));
      }
    }

    setIsUploading(false);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    await processUploadFiles(Array.from(files), 'anchor');
  };

  const handleClothingUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    await processUploadFiles(Array.from(files), 'clothing');
  };

  const removeSourceImage = (id: string) => {
    setSourceImages(prev => prev.filter(img => img.id !== id));
  };

  const removeClothingImage = (id: string) => {
    setClothingImages(prev => prev.filter(img => img.id !== id));
  };

  const addLibraryImages = (assets: GCSAssetMetadata[]) => {
    const newImages: SourceImage[] = assets.map(asset => ({
      id: asset.id,
      url: asset.url,
      mediaId: asset.mediaId || null,
      status: 'done',
      role: 'anchor'
    }));
    setSourceImages(prev => [...prev, ...newImages]);
  };

  return {
    // Auth & Credits
    credits, isGenerating, isRequesting,
    
    // UI State
    isMobileExpanded, setIsMobileExpanded,
    activeTab, setActiveTab,
    showLowCreditAlert, setShowLowCreditAlert,
    compareMode, setCompareMode,
    showTemplates, setShowTemplates,
    
    // Content
    sourceImages, setSourceImages,
    clothingImages, setClothingImages,
    removeSourceImage, removeClothingImage,
    addLibraryImages,
    prompt, setPrompt,
    selectedSubject, setSelectedSubject,
    selectedScenes, setSelectedScenes,
    selectedStyle, setSelectedStyle,
    
    // Config
    availableModels, selectedModel, setSelectedModel,
    selectedEngine, setSelectedEngine,
    selectedRatio, setSelectedRatio,
    selectedRes, setSelectedRes,
    quantity, setQuantity,
    currentUnitCost,
    
    // Results
    results, setResults,
    sortedResults,
    historyResults,
    isFetchingHistory,
    activeResultId, setActiveResultId,
    favorites, toggleFavorite,
    
    // Modals
    isLibraryOpen, setIsLibraryOpen,
    isEditorOpen, setIsEditorOpen,
    editorImage, setEditorImage,
    showResourceModal, setShowResourceModal,
    usagePreference, setUsagePreference,
    isUploading,
    
    // Actions
    generateTooltip,
    isGenerateDisabled,
    handleGenerate,
    handleUpload,
    handleClothingUpload,
    handleMultiVariation,
    handleRegenerate,
    handleSuggestPrompt,
    handleShare,
    applyTemplate,
    fetchHistory
  };
};
