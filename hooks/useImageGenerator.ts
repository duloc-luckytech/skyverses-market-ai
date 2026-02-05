
import { useState, useRef, useEffect, useMemo } from 'react';
import { generateDemoImage } from '../services/gemini';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { GCSAssetMetadata, uploadToGCS } from '../services/storage';
import { imagesApi, ImageJobRequest, ImageJobResponse } from '../apis/images';
import { pricingApi, PricingModel } from '../apis/pricing';
import { useToast } from '../context/ToastContext';
import { ASPECT_RATIOS, DEFAULT_ASPECT_RATIO } from '../constants/media-presets';
import { getResolutionsFromPricing, getCostFromPricing } from '../utils/pricing-helpers';

export type CreationMode = 'SINGLE' | 'BATCH';

export interface ReferenceItem {
  url: string;
  mediaId?: string;
}

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
  references: ReferenceItem[];
  isRefunded?: boolean;
}

export const useImageGenerator = () => {
  const { credits, addCredits, useCredits, isAuthenticated, login, refreshUserInfo } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [activeMode, setActiveMode] = useState<CreationMode>('SINGLE');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploadingRef, setIsUploadingRef] = useState(false);
  const [tempUploadUrl, setTempUploadUrl] = useState<string | null>(null);
  
  const [zoomLevel, setZoomLevel] = useState(5);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorImage, setEditorImage] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activePreviewUrl, setActivePreviewUrl] = useState<string | null>(null);

  const [availableModels, setAvailableModels] = useState<any[]>([]);
  const [selectedModel, setSelectedModel] = useState<any>(null);
  const [selectedMode, setSelectedMode] = useState<string>('relaxed');
  const [selectedEngine, _setSelectedEngine] = useState<string>('fxlab');

  const [prompt, setPrompt] = useState('');
  const [batchPrompts, setBatchPrompts] = useState<string[]>(['', '', '']);
  const [isBulkImporting, setIsBulkImporting] = useState(false);
  const [bulkText, setBulkText] = useState('');
  
  const [selectedRatio, setSelectedRatio] = useState(DEFAULT_ASPECT_RATIO);
  const [selectedRes, setSelectedRes] = useState(''); // Sẽ set khi load model
  const [quantity, setQuantity] = useState(1);
  const [references, setReferences] = useState<ReferenceItem[]>([]);
  const [results, setResults] = useState<ImageResult[]>([]);

  const [showResourceModal, setShowResourceModal] = useState(false);
  const [isResumingGenerate, setIsResumingGenerate] = useState(false);
  const [usagePreference, setUsagePreference] = useState<'credits' | 'key' | null>(() => {
    const saved = localStorage.getItem('skyverses_usage_preference');
    return (saved as any) || 'credits';
  });

  const [hasPersonalKey, setHasPersonalKey] = useState(false);
  const [personalKey, setPersonalKey] = useState<string | undefined>(undefined);

  // Added showLowCreditAlert state variable
  const [showLowCreditAlert, setShowLowCreditAlert] = useState(false);

  const setSelectedEngine = (val: string) => {
    _setSelectedEngine(val);
    setReferences([]);
  };

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const res = await pricingApi.getPricing({ tool: 'image', engine: selectedEngine });
        if (res.success && res.data.length > 0) {
          const mapped = res.data.map((m: PricingModel) => ({
            id: m._id, 
            name: m.name,
            raw: m
          }));
          setAvailableModels(mapped);
          const defaultModel = mapped.find(m => m.raw.modelKey === 'google_image_gen_banana_pro') || mapped[0];
          setSelectedModel(defaultModel);

          // Cập nhật resolution mặc định từ model đầu tiên
          const resOptions = getResolutionsFromPricing(defaultModel.raw.pricing);
          if (resOptions.length > 0) {
            setSelectedRes(resOptions[0]);
          }
        } else {
          setAvailableModels([]);
          setSelectedModel(null);
        }
      } catch (error) {
        console.error("Failed to fetch image pricing:", error);
      }
    };
    fetchPricing();
  }, [selectedEngine]);

  useEffect(() => {
    if (selectedModel?.raw) {
      const m = selectedModel.raw;
      if (m.modes && m.modes.length > 0) {
        setSelectedMode(m.modes[0]);
      } else {
        setSelectedMode(m.mode || 'relaxed');
      }
      
      // Đảm bảo selectedRes hợp lệ với model mới
      const resOptions = getResolutionsFromPricing(m.pricing);
      if (resOptions.length > 0 && !resOptions.includes(selectedRes)) {
        setSelectedRes(resOptions[0]);
      }
    }
  }, [selectedModel]);

  const currentUnitCost = useMemo(() => {
    if (!selectedModel) return 0;
    return getCostFromPricing(selectedModel.raw.pricing, selectedRes);
  }, [selectedModel, selectedRes]);

  const totalCost = useMemo(() => {
    if (!selectedModel) return 0;
    const unitCost = currentUnitCost;
    if (activeMode === 'SINGLE') return unitCost * quantity;
    return batchPrompts.filter(p => p.trim()).length * unitCost;
  }, [activeMode, selectedModel, quantity, batchPrompts, currentUnitCost]);

  const todayKey = useMemo(() => new Date().toISOString().split('T')[0], []);

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
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
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
      const isError = response.status === 'error' || response.data?.status === 'error' || response.data?.status === 'failed';

      if (isError) {
        if (usagePreference === 'credits') {
          setResults(prev => prev.map(r => {
            if (r.id === resultId && !r.isRefunded) {
              addCredits(cost);
              return { ...r, status: 'error', isRefunded: true };
            }
            return r.id === resultId ? { ...r, status: 'error' } : r;
          }));
        } else {
          setResults(prev => prev.map(r => r.id === resultId ? { ...r, status: 'error' } : r));
        }
        return;
      }

      if (response.data && response.data.status === 'done' && response.data.result?.images?.length) {
        const imageUrl = response.data.result.images[0];
        setResults(prev => prev.map(r => r.id === resultId ? { ...r, url: imageUrl, status: 'done' } : r));
        refreshUserInfo();
      } else {
        setTimeout(() => pollJobStatus(jobId, resultId, cost), 5000);
      }
    } catch (e) {
      console.error("Polling Network Error:", e);
      setTimeout(() => pollJobStatus(jobId, resultId, cost), 10000);
    }
  };

  const performInference = async (currentPreference: 'credits' | 'key', retryItem?: ImageResult) => {
    if (!selectedModel) return;
    const unitCost = retryItem ? retryItem.cost : currentUnitCost;
    const currentRefs = retryItem ? retryItem.references : [...references];
    const promptsToRun = retryItem 
      ? [retryItem.prompt]
      : (activeMode === 'SINGLE' 
          ? Array(quantity).fill(prompt) 
          : batchPrompts.filter(p => p.trim()));
    
    if (promptsToRun.length === 0) return;
    setIsGenerating(true);

    const now = new Date();
    const ts = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')} ${now.toLocaleDateString('vi-VN')}`;

    const newTasks: ImageResult[] = retryItem 
      ? [] 
      : promptsToRun.map((p, idx) => ({
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
    
    if (retryItem) {
      setResults(prev => prev.map(r => r.id === retryItem.id ? { ...r, status: 'processing', isRefunded: false } : r));
    } else {
      setResults(prev => [...newTasks, ...prev]);
    }

    const targetTasks = retryItem ? [retryItem] : newTasks;

    try {
      await Promise.all(targetTasks.map(async (task) => {
        if (currentPreference === 'credits') {
          const processedRefs = selectedEngine === 'fxlab' 
            ? task.references.map(r => r.mediaId).filter(Boolean) as string[]
            : task.references.map(r => r.url);

          const payload: ImageJobRequest = {
            type: processedRefs.length > 0 ? "image_to_image" : "text_to_image",
            input: { 
              prompt: task.prompt, 
              images: processedRefs.length > 0 ? processedRefs : undefined 
            },
            config: { width: 1024, height: 1024, aspectRatio: task.aspectRatio || selectedRatio, seed: 0, style: "cinematic" },
            engine: { provider: selectedEngine as any, model: selectedModel.id as any },
            enginePayload: { 
              prompt: task.prompt, 
              privacy: "PRIVATE", 
              projectId: "default",
              mode: selectedMode 
            }
          };
          const apiRes = await imagesApi.createJob(payload);
          if (apiRes.success && apiRes.data.jobId) {
            useCredits(unitCost);
            pollJobStatus(apiRes.data.jobId, task.id, unitCost);
          } else {
            setResults(prev => prev.map(r => r.id === task.id ? { ...r, status: 'error' } : r));
          }
        } else {
          const url = await generateDemoImage({ 
            prompt: task.prompt, 
            images: task.references.map(r => r.url), 
            model: selectedModel.raw.modelKey, 
            aspectRatio: task.aspectRatio || selectedRatio, 
            quality: task.resolution || selectedRes, 
            apiKey: personalKey 
          });
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
    const maxSize = 5 * 1024 * 1024;
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      showToast("Định dạng file không hỗ trợ. Vui lòng chọn PNG hoặc JPEG.", "error");
      return;
    }
    if (file.size > maxSize) {
      showToast("Dung lượng file quá lớn. Tối đa 5MB.", "error");
      return;
    }
    const localUrl = URL.createObjectURL(file);
    setTempUploadUrl(localUrl);
    setIsUploadingRef(true);
    try {
      const metadata = await uploadToGCS(file, selectedEngine);
      setReferences((prev) => [...prev, { url: metadata.url, mediaId: metadata.mediaId }].slice(0, 6));
    } catch (error) {
      console.error("Upload failed", error);
      showToast("Tải ảnh lên thất bại. Vui lòng thử lại.", "error");
    } finally {
      setIsUploadingRef(false);
      setTempUploadUrl(null);
      URL.revokeObjectURL(localUrl);
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

  const handleRetry = (res: ImageResult) => {
    if (!usagePreference) return;
    performInference(usagePreference, res);
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
    const items = selectedAssets.map(asset => ({ url: asset.url, mediaId: asset.mediaId }));
    setReferences((prev) => [...prev, ...items].slice(0, 6));
  };

  const handleEditorApply = (newUrl: string) => {
    const editedResult: ImageResult = { id: `edit-${Date.now()}`, url: newUrl, prompt: 'Edited', fullTimestamp: 'Vừa xong', dateKey: todayKey, displayDate: 'Hôm nay', model: 'Editor', status: 'done', aspectRatio: '1:1', resolution: '1k', cost: 0, references: [] };
    setResults(prev => [editedResult, ...prev]);
    setIsEditorOpen(false);
  };

  return {
    activeMode, setActiveMode, isGenerating, isUploadingRef, tempUploadUrl,
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
    handleLocalFileUpload, handleGenerate, handleRetry, openEditor,
    toggleSelect, deleteResult, handleLibrarySelect,
    isResumingGenerate, setIsResumingGenerate, triggerDownload,
    handleEditorApply, selectedMode, setSelectedMode,
    selectedEngine, setSelectedEngine,
    // Exported missing state variables to resolve property access errors
    zoomLevel, setZoomLevel, showLowCreditAlert, setShowLowCreditAlert
  };
};
