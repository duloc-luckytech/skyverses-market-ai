
import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
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
  logs?: string[];
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
  const [selectedEngine, _setSelectedEngine] = useState<string>('fxlab'); // Mặc định là fxlab

  const [prompt, setPrompt] = useState('');
  const [batchPrompts, setBatchPrompts] = useState<string[]>(['', '', '']);
  const [isBulkImporting, setIsBulkImporting] = useState(false);
  const [bulkText, setBulkText] = useState('');
  
  const [selectedRatio, setSelectedRatio] = useState(DEFAULT_ASPECT_RATIO);
  const [selectedRes, setSelectedRes] = useState(''); 
  const [quantity, setQuantity] = useState(1);
  const [references, setReferences] = useState<ReferenceItem[]>([]);
  const [results, setResults] = useState<ImageResult[]>([]);

  // Server History States
  const [serverResults, setServerResults] = useState<ImageResult[]>([]);
  const [isFetchingHistory, setIsFetchingHistory] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [hasMoreHistory, setHasMoreHistory] = useState(true);

  const [showResourceModal, setShowResourceModal] = useState(false);
  const [isResumingGenerate, setIsResumingGenerate] = useState(false);
  const [usagePreference, setUsagePreference] = useState<'credits' | 'key' | null>(() => {
    const saved = localStorage.getItem('skyverses_usage_preference');
    return (saved as any) || 'credits';
  });

  const [hasPersonalKey, setHasPersonalKey] = useState(false);
  const [personalKey, setPersonalKey] = useState<string | undefined>(undefined);
  const [showLowCreditAlert, setShowLowCreditAlert] = useState(false);

  const setSelectedEngine = (val: string) => {
    _setSelectedEngine(val);
    setReferences([]);
  };

  const addLogToTask = (taskId: string, message: string) => {
    setResults(prev => prev.map(r => r.id === taskId ? { ...r, logs: [...(r.logs || []), message] } : r));
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

          const resOptions = getResolutionsFromPricing(defaultModel.raw.pricing);
          if (resOptions.length > 0) {
            setSelectedRes(resOptions[0]);
          }
          
          if (defaultModel.raw.aspectRatios && defaultModel.raw.aspectRatios.length > 0) {
            setSelectedRatio(defaultModel.raw.aspectRatios[0]);
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

  // AUTO-TASK LOGIC
  useEffect(() => {
    const autoPrompt = localStorage.getItem('skyverses_global_auto_prompt');
    const autoRun = localStorage.getItem('skyverses_global_auto_run');

    if (autoRun === 'true' && autoPrompt && selectedModel) {
      setPrompt(autoPrompt);
      localStorage.removeItem('skyverses_global_auto_run');
      localStorage.removeItem('skyverses_global_auto_prompt');
      
      // Delay to ensure model and prompt are fully set before auto-generating
      setTimeout(() => {
        handleGenerate();
      }, 800);
    }
  }, [selectedModel, isAuthenticated]);

  useEffect(() => {
    if (selectedModel?.raw) {
      const m = selectedModel.raw;
      if (m.modes && m.modes.length > 0) {
        setSelectedMode(m.modes[0]);
      } else {
        setSelectedMode(m.mode || 'relaxed');
      }
      
      const resOptions = getResolutionsFromPricing(m.pricing);
      if (resOptions.length > 0 && !resOptions.includes(selectedRes)) {
        setSelectedRes(resOptions[0]);
      }

      if (m.aspectRatios && m.aspectRatios.length > 0 && !m.aspectRatios.includes(selectedRatio)) {
        setSelectedRatio(m.aspectRatios[0]);
      }
    }
  }, [selectedModel]);

  const fetchServerResults = useCallback(async (page: number = 1, isInitial: boolean = false) => {
    if (isInitial) setIsFetchingHistory(true);
    try {
      const response = await imagesApi.getJobs({ page, limit: 20 });
      const mapped: ImageResult[] = (response.data || []).map(job => {
        const date = new Date(job.createdAt);
        return {
          id: job._id,
          url: job.result?.images?.[0] || job.result?.thumbnail || null,
          prompt: job.input?.prompt || 'Untitled',
          fullTimestamp: date.toLocaleString('vi-VN'),
          dateKey: date.toISOString().split('T')[0],
          displayDate: date.toLocaleDateString('vi-VN'),
          model: job.engine?.model || 'AI Model',
          status: job.status === 'done' ? 'done' : job.status === 'failed' || job.status === 'error' ? 'error' : 'processing',
          aspectRatio: job.config?.aspectRatio || '1:1',
          resolution: job.result?.width ? `${job.result.width}x${job.result.height}` : '1024x1024',
          cost: job.creditsUsed || 0,
          references: [],
          logs: [`[SYSTEM] Loaded from archive registry.`]
        };
      });

      if (isInitial) setServerResults(mapped);
      else setServerResults(prev => [...prev, ...mapped]);

      const pagination = response.pagination;
      if (pagination) {
        setHasMoreHistory(page < Math.ceil(pagination.total / pagination.limit));
      }
      setHistoryPage(page);
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setIsFetchingHistory(false);
    }
  }, []);

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

  const pollImageJobStatus = async (jobId: string, resultId: string, cost: number) => {
    try {
      addLogToTask(resultId, `[POLLING] Requesting status update for node cluster...`);
      const response: ImageJobResponse = await imagesApi.getJobStatus(jobId);
      const isError = response.status === 'error' || response.data?.status === 'error' || response.data?.status === 'failed';

      if (isError) {
        const errorMsg = (response.data as any)?.error?.message || "Inference failed";
        addLogToTask(resultId, `[ERROR] Synthesis aborted: ${errorMsg}`);
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
        addLogToTask(resultId, `[SUCCESS] Synthesis complete. Delivering asset to CDN...`);
        const imageUrl = response.data.result.images[0];
        setResults(prev => prev.map(r => r.id === resultId ? { ...r, url: imageUrl, status: 'done' } : r));
        refreshUserInfo();
        fetchServerResults(1, true);
      } else {
        addLogToTask(resultId, `[STATUS] Pipeline state: ${response.data?.status?.toUpperCase() || 'SYNTHESIZING'}`);
        setTimeout(() => pollImageJobStatus(jobId, resultId, cost), 5000);
      }
    } catch (e) {
      addLogToTask(resultId, `[NETWORK] Connectivity drift. Retrying telemetry uplink...`);
      setTimeout(() => pollImageJobStatus(jobId, resultId, cost), 10000);
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
          references: currentRefs,
          logs: [`[SYSTEM] Production pipeline initialized.`]
        }));
    
    if (retryItem) {
      setResults(prev => prev.map(r => r.id === retryItem.id ? { ...r, status: 'processing', isRefunded: false, logs: [`[SYSTEM] Re-initializing production node for manual retry.`] } : r));
    } else {
      setResults(prev => [...newTasks, ...prev]);
    }

    const targetTasks = retryItem ? [retryItem] : newTasks;

    try {
      await Promise.all(targetTasks.map(async (task) => {
        addLogToTask(task.id, `[UPLINK] Authenticating resource pool: ${currentPreference.toUpperCase()}`);
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
            engine: { 
              provider: selectedEngine as any, 
              model: selectedModel.raw.modelKey as any 
            },
            enginePayload: { 
              prompt: task.prompt, 
              privacy: "PRIVATE", 
              projectId: "default",
              mode: selectedMode 
            }
          };
          addLogToTask(task.id, `[NODE_INIT] Provisioning H100 GPU cluster...`);
          const apiRes = await imagesApi.createJob(payload);
          if (apiRes.success && apiRes.data.jobId) {
            const serverJobId = apiRes.data.jobId;
            addLogToTask(task.id, `[API_READY] Remote job recognized. ID: ${serverJobId}`);
            setResults(prev => prev.map(r => r.id === task.id ? { ...r, id: serverJobId } : r));
            useCredits(unitCost);
            pollImageJobStatus(serverJobId, serverJobId, unitCost);
          } else {
            addLogToTask(task.id, `[ERROR] Resource handshake rejected: ${apiRes.message || 'Generic refusal'}`);
            setResults(prev => prev.map(r => r.id === task.id ? { ...r, status: 'error' } : r));
          }
        } else {
          addLogToTask(task.id, `[DIRECT_INFERENCE] Bypassing internal pool. Using personal SDK Uplink.`);
          const url = await generateDemoImage({ 
            prompt: task.prompt, 
            images: task.references.map(r => r.url), 
            model: selectedModel.raw.modelKey, 
            aspectRatio: task.aspectRatio || selectedRatio, 
            quality: task.resolution || selectedRes, 
            apiKey: personalKey 
          });
          if (url) {
            addLogToTask(task.id, `[SUCCESS] Direct synthesis complete. Asset loaded.`);
            setResults(prev => prev.map(r => r.id === task.id ? { ...r, url, status: 'done' } : r));
          } else {
            addLogToTask(task.id, `[ERROR] Personal SDK node returned zero-byte manifest.`);
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
      setReferences((prev: any) => [...prev, { url: metadata.url, mediaId: metadata.mediaId }].slice(0, 6));
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
    setReferences((prev: any) => [...prev, ...items].slice(0, 6));
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
    zoomLevel, setZoomLevel, showLowCreditAlert, setShowLowCreditAlert,
    serverResults, isFetchingHistory, hasMoreHistory, historyPage, fetchServerResults
  };
};
