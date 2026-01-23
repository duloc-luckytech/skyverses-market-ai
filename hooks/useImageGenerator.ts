
import { useState, useRef, useEffect, useMemo } from 'react';
import { generateDemoImage } from '../services/gemini';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { GCSAssetMetadata, uploadToGCS } from '../services/storage';
import { imagesApi, ImageJobRequest, ImageJobResponse } from '../apis/images';
import { pricingApi, PricingModel } from '../apis/pricing';

export type CreationMode = 'SINGLE' | 'BATCH';

export interface ImageResult {
  id: string;
  url: string | null;
  prompt: string;
  fullTimestamp: string;
  dateKey: string;
  displayDate: string;
  model: string;
  status: 'processing' | 'done' | 'error';
  aspectRatio: string;
  resolution: string;
  cost: number;
  references: string[];
  isRefunded?: boolean;
}

export const RATIOS = ['1:1', '16:9', '9:16', '4:5', '3:4'];
export const RESOLUTIONS = ['1k', '2k', '4k'];

export const useImageGenerator = () => {
  const { credits, addCredits, useCredits, isAuthenticated, login, refreshUserInfo } = useAuth();
  const navigate = useNavigate();

  const [activeMode, setActiveMode] = useState<CreationMode>('SINGLE');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploadingRef, setIsUploadingRef] = useState(false);
  const [showLowCreditAlert, setShowLowCreditAlert] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(5);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorImage, setEditorImage] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activePreviewUrl, setActivePreviewUrl] = useState<string | null>(null);

  const [availableModels, setAvailableModels] = useState<any[]>([]);
  const [selectedModel, setSelectedModel] = useState<any>(null);

  const [prompt, setPrompt] = useState('');
  const [batchPrompts, setBatchPrompts] = useState<string[]>(['', '', '']);
  const [isBulkImporting, setIsBulkImporting] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [selectedRatio, setSelectedRatio] = useState(RATIOS[0]);
  const [selectedRes, setSelectedRes] = useState(RESOLUTIONS[0]);
  const [quantity, setQuantity] = useState(1);
  const [references, setReferences] = useState<string[]>([]);
  const [results, setResults] = useState<ImageResult[]>([]);

  const [showResourceModal, setShowResourceModal] = useState(false);
  const [isResumingGenerate, setIsResumingGenerate] = useState(false);
  const [usagePreference, setUsagePreference] = useState<'credits' | 'key' | null>(() => {
    return (localStorage.getItem('skyverses_usage_preference') as any) || 'credits';
  });

  const [hasPersonalKey, setHasPersonalKey] = useState(false);
  const [personalKey, setPersonalKey] = useState<string | undefined>(undefined);

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const res = await pricingApi.getPricing({ tool: 'image' });
        if (res.success && res.data.length > 0) {
          const mapped = res.data.map((m: PricingModel) => ({
            id: m.modelKey,
            name: m.name,
            raw: m
          }));
          setAvailableModels(mapped);
          const defaultModel = mapped.find(m => m.id === 'google_image_gen_4_5') || mapped[0];
          setSelectedModel(defaultModel);
        }
      } catch (error) {
        console.error("Failed to fetch image pricing:", error);
      }
    };
    fetchPricing();
  }, []);

  useEffect(() => {
    const vault = localStorage.getItem('skyverses_model_vault');
    if (vault) {
      try {
        const keys = JSON.parse(vault);
        if (keys.gemini && keys.gemini.trim() !== '') {
          setHasPersonalKey(true);
          setPersonalKey(keys.gemini);
        }
      } catch (e) {}
    }
  }, [showResourceModal]);

  const todayKey = useMemo(() => new Date().toISOString().split('T')[0], []);

  const getUnitCost = (model: any, resKey: string) => {
    if (!model || !model.raw || !model.raw.pricing) return 0;
    const resPricing = model.raw.pricing[resKey.toLowerCase()];
    if (!resPricing) return 0;
    const firstKey = Object.keys(resPricing)[0];
    return resPricing[firstKey] || 0;
  };

  const currentUnitCost = useMemo(() => {
    return getUnitCost(selectedModel, selectedRes);
  }, [selectedModel, selectedRes]);

  const totalCost = useMemo(() => {
    if (!selectedModel) return 0;
    const unitCost = currentUnitCost;
    if (activeMode === 'SINGLE') return unitCost * quantity;
    return batchPrompts.filter(p => p.trim()).length * unitCost;
  }, [activeMode, selectedModel, quantity, batchPrompts, currentUnitCost]);

  const generateTooltip = useMemo(() => {
    if (!isAuthenticated) return "Vui lòng đăng nhập";
    if (!usagePreference) return "Chọn nguồn tài nguyên";
    if (usagePreference === 'credits' && credits < totalCost) return `Số dư không đủ (Cần ${totalCost} CR)`;
    if (activeMode === 'SINGLE' && !prompt.trim()) return "Vui lòng nhập kịch bản";
    if (activeMode === 'BATCH' && batchPrompts.filter(p => p.trim()).length === 0) return "Vui lòng nhập ít nhất một kịch bản";
    return null;
  }, [isAuthenticated, usagePreference, credits, totalCost, activeMode, prompt, batchPrompts]);

  const isGenerateDisabled = isGenerating || !!generateTooltip || !selectedModel;

  const triggerDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.body.appendChild(document.createElement('a'));
      link.href = blobUrl;
      link.download = filename;
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      window.open(url, '_blank');
    }
  };

  const pollJobStatus = async (jobId: string, resultId: string, cost: number) => {
    try {
      const response: ImageJobResponse = await imagesApi.getJobStatus(jobId);
      if (response.data && response.data.status === 'done' && response.data.result?.images?.length) {
        const imageUrl = response.data.result.images[0];
        setResults(prev => prev.map(r => r.id === resultId ? { ...r, url: imageUrl, status: 'done' } : r));
        refreshUserInfo();
      } else if (response.data && response.data.status === 'failed') {
        if (usagePreference === 'credits') addCredits(cost);
        setResults(prev => prev.map(r => r.id === resultId ? { ...r, status: 'error', isRefunded: true } : r));
      } else {
        setTimeout(() => pollJobStatus(jobId, resultId, cost), 5000);
      }
    } catch (e) {
      setResults(prev => prev.map(r => r.id === resultId ? { ...r, status: 'error' } : r));
    }
  };

  const performInference = async (currentPreference: 'credits' | 'key') => {
    if (!selectedModel) return;
    const unitCost = currentUnitCost;
    const currentRefs = [...references];
    const promptsToRun = activeMode === 'SINGLE' 
      ? Array(quantity).fill(prompt) 
      : batchPrompts.filter(p => p.trim());
    
    if (promptsToRun.length === 0) return;
    setIsGenerating(true);

    const now = new Date();
    const ts = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')} ${now.toLocaleDateString('vi-VN')}`;

    const newTasks: ImageResult[] = promptsToRun.map((p, idx) => ({
      id: `img-${Date.now()}-${idx}`,
      url: null,
      prompt: p,
      fullTimestamp: ts,
      dateKey: todayKey,
      displayDate: now.toLocaleDateString('vi-VN'),
      model: selectedModel.name,
      status: 'processing',
      aspectRatio: selectedRatio,
      resolution: selectedRes,
      cost: currentPreference === 'credits' ? unitCost : 0,
      references: currentRefs
    }));
    
    setResults(prev => [...newTasks, ...prev]);

    try {
      await Promise.all(newTasks.map(async (task) => {
        if (currentPreference === 'credits') {
          const payload: ImageJobRequest = {
            type: references.length > 0 ? "image_to_image" : "text_to_image",
            input: { prompt: task.prompt, images: references.length > 0 ? references : undefined },
            config: { width: 1024, height: 1024, aspectRatio: selectedRatio, seed: 0, style: "cinematic" },
            engine: { provider: "gommo", model: selectedModel.id as any },
            enginePayload: { prompt: task.prompt, privacy: "PRIVATE", projectId: "default" }
          };
          const apiRes = await imagesApi.createJob(payload);
          if (apiRes.success && apiRes.data.jobId) {
            useCredits(unitCost);
            pollJobStatus(apiRes.data.jobId, task.id, unitCost);
          } else {
            setResults(prev => prev.map(r => r.id === task.id ? { ...r, status: 'error' } : r));
          }
        } else {
          const url = await generateDemoImage({ prompt: task.prompt, images: references, model: selectedModel.id, aspectRatio: selectedRatio, quality: selectedRes, apiKey: personalKey });
          if (url) {
            setResults(prev => prev.map(r => r.id === task.id ? { ...r, url, status: 'done' } : r));
          } else {
            setResults(prev => prev.map(r => r.id === task.id ? { ...r, status: 'error' } : r));
          }
        }
      }));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLocalFileUpload = async (file: File) => {
    setIsUploadingRef(true);
    try {
      const metadata = await uploadToGCS(file);
      setReferences((prev: string[]) => [...prev, metadata.url].slice(0, 6));
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      setIsUploadingRef(false);
    }
  };

  const handleGenerate = async () => {
    if (generateTooltip) return;
    if (!isAuthenticated) { login(); return; }

    if (!usagePreference) {
      setIsResumingGenerate(true);
      setShowResourceModal(true);
      return;
    }
    performInference(usagePreference);
  };

  const openEditor = (url: string) => {
    setEditorImage(url);
    setIsEditorOpen(true);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const deleteResult = (id: string) => setResults(prev => prev.filter(r => r.id !== id));

  const handleLibrarySelect = (selectedAssets: GCSAssetMetadata[]) => {
    const urls = selectedAssets.map(asset => asset.url);
    setReferences((prev: string[]) => [...prev, ...urls].slice(0, 6));
  };

  const handleEditorApply = (newUrl: string) => {
    const editedResult: ImageResult = { id: `edit-${Date.now()}`, url: newUrl, prompt: 'Edited', fullTimestamp: 'Vừa xong', dateKey: todayKey, displayDate: 'Hôm nay', model: 'Editor', status: 'done', aspectRatio: '1:1', resolution: '1k', cost: 0, references: [] };
    setResults(prev => [editedResult, ...prev]);
    setIsEditorOpen(false);
  };

  return {
    activeMode, setActiveMode, isGenerating, isUploadingRef,
    showLowCreditAlert, setShowLowCreditAlert, zoomLevel, setZoomLevel,
    isLibraryOpen, setIsLibraryOpen, isEditorOpen, setIsEditorOpen,
    editorImage, setActivePreviewUrl, selectedIds, setSelectedIds,
    activePreviewUrl, showResourceModal, setShowResourceModal,
    usagePreference, setUsagePreference, hasPersonalKey,
    prompt, setPrompt, batchPrompts, setBatchPrompts,
    isBulkImporting, setIsBulkImporting, bulkText, setBulkText,
    availableModels, selectedModel, setSelectedModel, selectedRatio, setSelectedRatio,
    selectedRes, setSelectedRes, quantity, setQuantity,
    references, setReferences, results, setResults, totalCost,
    generateTooltip, isGenerateDisabled, performInference,
    handleLocalFileUpload, handleGenerate, openEditor,
    toggleSelect, deleteResult, handleLibrarySelect,
    isResumingGenerate, setIsResumingGenerate, triggerDownload,
    handleEditorApply
  };
};
