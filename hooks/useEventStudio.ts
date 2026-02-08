
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { uploadToGCS, GCSAssetMetadata } from '../services/storage';
import { imagesApi, ImageJobRequest, ImageJobResponse } from '../apis/images';
import { generateDemoImage } from '../services/gemini';
import { EventConfig, COMMON_STUDIO_CONSTANTS } from '../constants/event-configs';

export interface RenderResult {
  id: string;
  url: string | null;
  status: 'processing' | 'done' | 'error';
  prompt: string;
  timestamp: string;
  cost: number;
  metadata?: any;
}

export interface SourceImage {
  id: string;
  url: string;
  mediaId: string | null;
  status: 'uploading' | 'done';
}

export const useEventStudio = (config: EventConfig) => {
  const { credits, useCredits, addCredits, isAuthenticated, login, refreshUserInfo } = useAuth();
  
  // -- Operation States --
  const [isRequesting, setIsRequesting] = useState(false); // Short-lived state for button feedback
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'CURRENT' | 'HISTORY'>('CURRENT');
  const [showLowCreditAlert, setShowLowCreditAlert] = useState(false);

  // -- Content States --
  const [sourceImages, setSourceImages] = useState<SourceImage[]>([]);
  const [prompt, setPrompt] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(config.subjects[0]);
  const [selectedScenes, setSelectedScenes] = useState<string[]>([]);
  
  // -- Tech Config --
  const [selectedModel, setSelectedModel] = useState(COMMON_STUDIO_CONSTANTS.AI_MODELS[0]);
  const [selectedRatio, setSelectedRatio] = useState(COMMON_STUDIO_CONSTANTS.RATIOS[0]);
  const [selectedRes, setSelectedRes] = useState('1k');
  const [quantity, setQuantity] = useState(1);
  
  // -- Results & History --
  const [results, setResults] = useState<RenderResult[]>([]);
  const [historyResults, setHistoryResults] = useState<RenderResult[]>([]);
  const [isFetchingHistory, setIsFetchingHistory] = useState(false);
  const [activeResultId, setActiveResultId] = useState<string | null>(null);

  // -- Modals & Preferences --
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorImage, setEditorImage] = useState<string | null>(null);
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [usagePreference, setUsagePreference] = useState<'credits' | 'key'>(() => {
    return (localStorage.getItem('skyverses_usage_preference') as any) || 'credits';
  });

  const [isUploading, setIsUploading] = useState(false);

  // Derived state: true if any task is currently synthesizing
  const isGenerating = useMemo(() => results.some(r => r.status === 'processing'), [results]);

  // --- LOGIC: FETCH HISTORY ---
  const fetchHistory = useCallback(async () => {
    if (!isAuthenticated || isFetchingHistory) return;
    setIsFetchingHistory(true);
    try {
      const res = await imagesApi.getJobs({ limit: 20 });
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
    if (activeTab === 'HISTORY') {
      fetchHistory();
    }
  }, [activeTab, fetchHistory]);

  // --- LOGIC: TOOLTIP ---
  const generateTooltip = useMemo(() => {
    if (!isAuthenticated) return "Vui lòng đăng nhập để tiếp tục";
    const hasReadyImage = sourceImages.some(img => img.status === 'done');
    if (!hasReadyImage && !prompt.trim()) return "Vui lòng nhập kịch bản hoặc tải ảnh mỏ neo";
    if (usagePreference === 'credits' && credits < (selectedModel.cost * quantity)) return `Số dư không đủ (Cần ${selectedModel.cost * quantity} CR)`;
    return null;
  }, [isAuthenticated, sourceImages, prompt, usagePreference, credits, selectedModel, quantity]);

  const isGenerateDisabled = isRequesting || !!generateTooltip;

  const pollStatus = useCallback(async (jobId: string, resultId: string, cost: number) => {
    try {
      const res: ImageJobResponse = await imagesApi.getJobStatus(jobId);
      const status = res.data?.status;

      if (status === 'done' && res.data.result?.images?.length) {
        const imageUrl = res.data.result.images[0];
        setResults(prev => prev.map(r => r.id === resultId ? { ...r, url: imageUrl, status: 'done' } : r));
        // Only set active if this was the latest task
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

  const handleGenerate = async () => {
    if (!isAuthenticated) { login(); return; }
    if (isRequesting) return;

    const totalCost = selectedModel.cost * quantity;
    if (usagePreference === 'credits' && credits < totalCost) {
      setShowLowCreditAlert(true);
      return;
    }

    setIsRequesting(true);
    setActiveTab('CURRENT');
    if (window.innerWidth < 1024) setIsMobileExpanded(false);

    const scenesString = selectedScenes.length > 0 ? `Bối cảnh: ${selectedScenes.join(', ')}.` : "";
    const finalPrompt = `${config.basePrompt} Chủ đề: ${selectedSubject}. ${scenesString} ${prompt}. ${config.atmosphere}`;

    // Launch multiple tasks in parallel
    const anchor = sourceImages.find(img => img.status === 'done');

    for (let i = 0; i < quantity; i++) {
      const resultId = `evt-${Date.now()}-${i}`;
      const newResult: RenderResult = {
        id: resultId,
        url: null,
        status: 'processing',
        prompt: prompt || selectedSubject,
        timestamp: new Date().toLocaleTimeString(),
        cost: selectedModel.cost
      };

      setResults(prev => [newResult, ...prev]);
      setActiveResultId(resultId);

      // Launch synthesis (Direct Gemini or Backend Job)
      if (!anchor) {
        // Handle background task for Direct AI
        (async () => {
          try {
            const directImageUrl = await generateDemoImage({
              prompt: finalPrompt,
              model: 'google_image_gen_4_5',
              aspectRatio: selectedRatio,
              quality: selectedRes
            });

            if (directImageUrl) {
              if (usagePreference === 'credits') useCredits(selectedModel.cost);
              setResults(prev => prev.map(r => r.id === resultId ? { ...r, url: directImageUrl, status: 'done' } : r));
              refreshUserInfo();
            } else {
              setResults(prev => prev.map(r => r.id === resultId ? { ...r, status: 'error' } : r));
            }
          } catch (err) {
            setResults(prev => prev.map(r => r.id === resultId ? { ...r, status: 'error' } : r));
          }
        })();
      } else {
        // MODE: IDENTITY SYNC (BACKEND PIPELINE)
        try {
          const payload: ImageJobRequest = {
            type: "image_to_image",
            input: { prompt: finalPrompt, image: anchor.mediaId || anchor.url },
            config: { width: 1024, height: 1024, aspectRatio: selectedRatio, seed: 0, style: "cinematic" },
            engine: { provider: "gommo", model: selectedModel.id as any },
            enginePayload: { prompt: finalPrompt, privacy: "PRIVATE", projectId: "default", category: config.id.toUpperCase() }
          };

          const apiRes = await imagesApi.createJob(payload);
          if (apiRes.success && apiRes.data.jobId) {
            if (usagePreference === 'credits') useCredits(selectedModel.cost);
            pollStatus(apiRes.data.jobId, resultId, selectedModel.cost);
          } else {
            setResults(prev => prev.map(r => r.id === resultId ? { ...r, status: 'error' } : r));
          }
        } catch (e) {
          setResults(prev => prev.map(r => r.id === resultId ? { ...r, status: 'error' } : r));
        }
      }
    }

    // Release button after initiating all requests
    setIsRequesting(false);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files) as File[];
    
    // Add placeholders immediately for non-blocking UI
    const newPlaceholders: SourceImage[] = fileList.map((file, i) => ({
      id: `uploading-${Date.now()}-${i}`,
      url: URL.createObjectURL(file),
      mediaId: null,
      status: 'uploading'
    }));

    setSourceImages(prev => [...prev, ...newPlaceholders]);

    // Process each upload
    fileList.forEach(async (file, i) => {
      const placeholderId = newPlaceholders[i].id;
      try {
        const metadata = await uploadToGCS(file);
        setSourceImages(prev => prev.map(img => 
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
        setSourceImages(prev => prev.filter(img => img.id !== placeholderId));
      }
    });
  };

  const removeSourceImage = (id: string) => {
    setSourceImages(prev => prev.filter(img => img.id !== id));
  };

  const addLibraryImages = (assets: GCSAssetMetadata[]) => {
    const newImages: SourceImage[] = assets.map(asset => ({
      id: asset.id,
      url: asset.url,
      mediaId: asset.mediaId || null,
      status: 'done'
    }));
    setSourceImages(prev => [...prev, ...newImages]);
  };

  return {
    credits,
    isGenerating,
    isRequesting,
    isMobileExpanded, setIsMobileExpanded,
    activeTab, setActiveTab,
    showLowCreditAlert, setShowLowCreditAlert,
    sourceImages, setSourceImages,
    removeSourceImage,
    addLibraryImages,
    prompt, setPrompt,
    selectedSubject, setSelectedSubject,
    selectedScenes, setSelectedScenes,
    selectedModel, setSelectedModel,
    selectedRatio, setSelectedRatio,
    selectedRes, setSelectedRes,
    quantity, setQuantity,
    results, setResults,
    historyResults,
    isFetchingHistory,
    activeResultId, setActiveResultId,
    isLibraryOpen, setIsLibraryOpen,
    isEditorOpen, setIsEditorOpen,
    editorImage, setEditorImage,
    showResourceModal, setShowResourceModal,
    usagePreference, setUsagePreference,
    isUploading,
    generateTooltip,
    isGenerateDisabled,
    handleGenerate,
    handleUpload,
    fetchHistory
  };
};
