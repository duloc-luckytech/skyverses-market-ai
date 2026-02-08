
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Download, Share2, AlertTriangle, Terminal, Zap } from 'lucide-react';
import { generateDemoVideo } from '../services/gemini';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { Link, useNavigate } from 'react-router-dom';
import ResourceAuthModal from './common/ResourceAuthModal';
import ImageLibraryModal from './ImageLibraryModal';
import { videosApi, VideoJobRequest, VideoJobResponse } from '../apis/videos';
import { uploadToGCS, GCSAssetMetadata } from '../services/storage';
import { SidebarLeft } from './video-generator/SidebarLeft';
import { ResultsMain } from './video-generator/ResultsMain';
import { VideoResult } from './video-generator/VideoCard';
import { pricingApi, PricingModel } from '../apis/pricing';
import { JobLogsModal } from './common/JobLogsModal';

type CreationMode = 'SINGLE' | 'MULTI' | 'AUTO';
type AutoTaskType = 'TEXT' | 'IMAGE_TO_VIDEO' | 'START_END';

interface MultiFrameNode {
  id: string;
  url: string | null;
  mediaId: string | null;
  prompt: string;
}

interface AutoTask {
  id: string;
  type: AutoTaskType;
  prompt: string;
  startUrl: string | null;
  startMediaId: string | null;
  endUrl: string | null;
  endMediaId: string | null;
}

const AIVideoGeneratorWorkspace: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { credits, addCredits, useCredits, isAuthenticated, login, refreshUserInfo } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  
  // -- App States --
  const [activeMode, setActiveMode] = useState<CreationMode>('SINGLE');
  const [activeTab, setActiveTab] = useState<'SESSION' | 'HISTORY'>('SESSION');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(5);
  const [fullscreenVideo, setFullscreenVideo] = useState<{url: string, hasSound: boolean, id: string} | null>(null);
  const [showLowCreditAlert, setShowLowCreditAlert] = useState(false);
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [selectedLogTask, setSelectedLogTask] = useState<VideoResult | null>(null);
  
  // -- Auto Download States --
  const [autoDownload, setAutoDownload] = useState(false);
  const autoDownloadRef = useRef(false);
  useEffect(() => {
    autoDownloadRef.current = autoDownload;
  }, [autoDownload]);

  // -- Resource States --
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [isResumingGenerate, setIsResumingGenerate] = useState(false);
  const [usagePreference, setUsagePreference] = useState<'credits' | 'key' | null>(() => {
    const saved = localStorage.getItem('skyverses_usage_preference');
    return (saved as any) || 'credits';
  });
  const [hasPersonalKey, setHasPersonalKey] = useState(false);
  const [personalKey, setPersonalKey] = useState<string | undefined>(undefined);

  // -- Dynamic Pricing Data --
  const [availableModels, setAvailableModels] = useState<PricingModel[]>([]);
  const [selectedModelObj, setSelectedModelObj] = useState<PricingModel | null>(null);
  const [selectedEngine, setSelectedEngine] = useState('fxlab');
  const [selectedMode, setSelectedMode] = useState<string>('relaxed');

  // -- Common Config --
  const [ratio, setRatio] = useState<'16:9' | '9:16'>('16:9');
  const [duration, setDuration] = useState('8s'); 
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [resolution, setResolution] = useState('720p');
  const [quantity, setQuantity] = useState(1); 

  // -- Reference Selection Target Ref (Fix race condition) --
  const uploadTargetRef = useRef<string | null>(null);

  // -- Single Mode States --
  const [prompt, setPrompt] = useState('');
  const [startFrame, setStartFrame] = useState<string | null>(null);
  const [startFrameId, setStartFrameId] = useState<string | null>(null);
  const [endFrame, setEndFrame] = useState<string | null>(null);
  const [endFrameId, setEndFrameId] = useState<string | null>(null);

  // -- Multi Mode States --
  const [multiFrames, setMultiFrames] = useState<MultiFrameNode[]>([
    { id: '1', url: null, mediaId: null, prompt: '' },
    { id: '2', url: null, mediaId: null, prompt: '' },
    { id: '3', url: null, mediaId: null, prompt: '' }
  ]);

  // -- Auto Mode States --
  const [autoTasks, setAutoTasks] = useState<AutoTask[]>([
    { id: '1', type: 'TEXT', prompt: '', startUrl: null, startMediaId: null, endUrl: null, endMediaId: null }
  ]);
  const [isBulkImporting, setIsBulkImporting] = useState(false);
  const [bulkText, setBulkText] = useState('');

  // -- Results & Selection --
  const [results, setResults] = useState<VideoResult[]>([]);
  const [selectedVideoIds, setSelectedVideoIds] = useState<string[]>([]);

  // Result Ref to avoid stale closure during polling
  const resultsRef = useRef<VideoResult[]>([]);
  useEffect(() => {
    resultsRef.current = results;
  }, [results]);

  const hasJobs = results.length > 0;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const todayKey = useMemo(() => new Date().toISOString().split('T')[0], []);
  const processingCount = useMemo(() => results.filter(r => r.status === 'processing').length, [results]);

  // Fetch Pricing Models
  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const res = await pricingApi.getPricing({ tool: 'video', engine: selectedEngine });
        if (res.success && res.data.length > 0) {
          setAvailableModels(res.data);
          const defaultModel = res.data.find(m => m.modelKey === 'veo_3_1') || res.data[0];
          setSelectedModelObj(defaultModel);
        }
      } catch (error) {
        console.error("Failed to fetch video pricing:", error);
      }
    };
    fetchPricing();
  }, [selectedEngine]);

  // Sync selectedMode when selectedModelObj changes
  useEffect(() => {
    if (selectedModelObj) {
      if (selectedModelObj.modes && selectedModelObj.modes.length > 0) {
        setSelectedMode(selectedModelObj.modes[0]);
      } else {
        // Fix: Use selectedModelObj.mode instead of selectedMode
        setSelectedMode(selectedModelObj.mode || 'relaxed');
      }
    }
  }, [selectedModelObj]);

  const availableDurations = useMemo(() => {
    if (!selectedModelObj || !selectedModelObj.pricing) return ['5s', '8s', '10s'];
    const resKey = resolution.toLowerCase();
    const resPricing = selectedModelObj.pricing[resKey];
    if (!resPricing) return ['5s', '8s', '10s'];
    return Object.keys(resPricing).map(d => `${d}s`);
  }, [selectedModelObj, resolution]);

  useEffect(() => {
    if (availableDurations.length > 0 && !availableDurations.includes(duration)) {
      setDuration(availableDurations[0]);
    }
  }, [availableDurations, duration]);

  const cycleDuration = () => {
    const sequence = availableDurations;
    const index = sequence.indexOf(duration);
    setDuration(sequence[(index + 1) % sequence.length]);
  };

  const getUnitCost = (model: PricingModel | null, resKey: string, durStr: string) => {
    if (!model || !model.pricing) return 1500;
    const resMatrix = model.pricing[resKey.toLowerCase()];
    if (!resMatrix) return 1500;
    const durKey = durStr.replace('s', '');
    return resMatrix[durKey] || 1500;
  };

  const currentUnitCost = useMemo(() => {
    return getUnitCost(selectedModelObj, resolution, duration);
  }, [selectedModelObj, resolution, duration]);

  const currentTotalCost = useMemo(() => {
    if (activeMode === 'AUTO') return autoTasks.filter(t => t.prompt.trim() !== '').length * currentUnitCost;
    if (activeMode === 'MULTI') return (multiFrames.length - 1) * currentUnitCost;
    return currentUnitCost * quantity; 
  }, [activeMode, autoTasks, multiFrames, currentUnitCost, quantity]);

  const addLogToTask = (taskId: string, message: string) => {
    const timestamp = new Date().toLocaleTimeString('vi-VN');
    const logEntry = `${message}`;
    setResults(prev => prev.map(r => r.id === taskId ? { ...r, logs: [...(r.logs || []), logEntry] } : r));
    
    setSelectedLogTask(prev => {
      if (prev && prev.id === taskId) {
        return { ...prev, logs: [...(prev.logs || []), logEntry] };
      }
      return prev;
    });
  };

  const handleFrameClick = (id: string, mode: 'UPLOAD' | 'LIBRARY') => {
    uploadTargetRef.current = id;
    if (mode === 'UPLOAD') fileInputRef.current?.click();
    else setIsLibraryOpen(true);
  };

  const pollVideoJobStatus = async (jobId: string, resultId: string, cost: number) => {
    try {
      addLogToTask(resultId, `[POLLING] Requesting status update for node cluster...`);
      const response: VideoJobResponse = await videosApi.getJobStatus(jobId);
      
      const isSuccess = response.success === true || response.status?.toLowerCase() === 'success';
      const jobStatus = response.data?.status?.toLowerCase();
      
      const errorMsg = response.data?.error?.message || response.data?.error?.userMessage || "";
      if (errorMsg.includes("reCAPTCHA")) {
         addLogToTask(resultId, `[SECURITY_ALERT] reCAPTCHA challenge detected. Initiating automated retry protocol...`);
         const taskToRetry = resultsRef.current.find(r => r.id === resultId);
         if (taskToRetry) {
            performInference(usagePreference || 'credits', taskToRetry, true);
            return;
         }
      }

      if (!isSuccess || jobStatus === 'failed' || jobStatus === 'error') {
        addLogToTask(resultId, `[ERROR] Synthesis aborted: ${errorMsg || 'Unknown backend error'}`);
        setResults(prev => prev.map(r => {
           if (r.id === resultId) {
              if (usagePreference === 'credits' && !r.isRefunded) {
                addCredits(r.cost);
                return { ...r, status: 'error', isRefunded: true };
              }
              return { ...r, status: 'error' };
           }
           return r;
        }));
        return;
      }

      if (jobStatus === 'done' && response.data.result?.videoUrl) {
        addLogToTask(resultId, `[SUCCESS] Synthesis manifest completed. Delivering assets to CDN...`);
        const videoUrl = response.data.result.videoUrl;
        setResults(prev => prev.map(r => r.id === resultId ? { ...r, url: videoUrl, status: 'done' } : r));
        refreshUserInfo();
        if (autoDownloadRef.current) triggerDownload(videoUrl, `video_${resultId}.mp4`);
      } else {
        addLogToTask(resultId, `[STATUS] Pipeline state: ${jobStatus?.toUpperCase() || 'SYNTHESIZING'}`);
        setTimeout(() => pollVideoJobStatus(jobId, resultId, cost), 5000);
      }
    } catch (e) {
      addLogToTask(resultId, `[NETWORK] Connectivity drift. Retrying telemetry uplink...`);
      setTimeout(() => pollVideoJobStatus(jobId, resultId, cost), 10000);
    }
  };

  const performInference = async (currentPreference: 'credits' | 'key', retryTask?: VideoResult, isAutoRetry: boolean = false) => {
    if (!selectedModelObj) return;
    const now = new Date();
    const timestamp = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')} ${now.toLocaleDateString('vi-VN')}`;
    
    if (currentPreference === 'key') {
      if (!personalKey) { navigate('/settings'); return; }
    } else {
      const costToPay = retryTask ? retryTask.cost : currentTotalCost;
      if (!isAutoRetry && credits < costToPay) { setShowLowCreditAlert(true); return; }
    }

    setIsGenerating(true);
    if (isMobileExpanded) setIsMobileExpanded(false);

    const tasksToProduce = retryTask 
      ? [{ id: retryTask.id, type: "text-to-video" as const, prompt: retryTask.prompt, startUrl: retryTask.startImg || null, startMediaId: null, endUrl: retryTask.endImg || null, endMediaId: null, cost: retryTask.cost, ratio: retryTask.aspectRatio }]
      : activeMode === 'SINGLE' 
        ? (() => {
            let type: "text-to-video" | "image-to-video" | "start-end-image" = "text-to-video";
            if (startFrame && endFrame) type = "start-end-image";
            else if (startFrame) type = "image-to-video";
            return Array(quantity).fill(null).map((_, i) => ({ 
              id: `single-${Date.now()}-${i}`, 
              type, 
              prompt, 
              startUrl: startFrame, 
              startMediaId: startFrameId, 
              endUrl: endFrame, 
              endMediaId: endFrameId, 
              cost: currentUnitCost, 
              ratio 
            }));
          })()
        : activeMode === 'MULTI'
          ? Array.from({ length: multiFrames.length - 1 }).map((_, i) => ({ id: `batch-${Date.now()}-${i}`, type: "image-to-video" as const, prompt: multiFrames[i].prompt, startUrl: multiFrames[i].url, startMediaId: multiFrames[i].mediaId, endUrl: multiFrames[i+1].url, endMediaId: multiFrames[i+1].mediaId, cost: currentUnitCost, ratio }))
          : autoTasks.filter(t => t.prompt.trim() !== '').map((t, idx) => ({ id: `auto-${Date.now()}-${idx}`, type: t.startUrl && t.endUrl ? "start-end-image" as const : t.startUrl ? "image-to-video" as const : "text-to-video" as const, prompt: t.prompt, startUrl: t.startUrl, startMediaId: t.startMediaId, endUrl: t.endUrl, endMediaId: t.endMediaId, cost: currentUnitCost, ratio }));

    if (!retryTask) {
      const newResults: VideoResult[] = tasksToProduce.map(t => ({ 
        id: t.id, 
        url: null, 
        prompt: t.prompt, 
        fullTimestamp: timestamp, 
        dateKey: todayKey, 
        displayDate: now.toLocaleDateString('vi-VN'), 
        model: selectedModelObj.name, 
        mode: selectedMode,
        duration, 
        status: 'processing', 
        hasSound: soundEnabled, 
        aspectRatio: t.ratio as any, 
        cost: t.cost, 
        startImg: t.startUrl, 
        endImg: t.endUrl,
        logs: [`[${new Date().toLocaleTimeString('vi-VN')}] [SYSTEM] Production pipeline initialized.`] 
      }));
      setResults(prev => [...newResults, ...prev]);
    } else {
      setResults(prev => prev.map(r => r.id === retryTask.id ? { ...r, status: 'processing', isRefunded: false } : r));
      addLogToTask(retryTask.id, "[SYSTEM] Re-initializing production node for manual retry.");
    }

    try {
      await Promise.all(tasksToProduce.map(async (task) => {
        try {
          addLogToTask(task.id, `[UPLINK] Authenticating resource pool: ${currentPreference.toUpperCase()}`);
          if (currentPreference === 'credits') {
            const inputImages = selectedEngine === 'fxlab' ? [task.startMediaId || null, task.endMediaId || null] : [task.startUrl || null, task.endUrl || null];
            const payload: VideoJobRequest = { type: task.type, input: { images: inputImages }, config: { duration: parseInt(duration), aspectRatio: task.ratio, resolution: resolution }, engine: { provider: selectedEngine as any, model: selectedModelObj.modelKey as any }, enginePayload: { accessToken: "YOUR_GOMMO_ACCESS_TOKEN", prompt: task.prompt, privacy: "PRIVATE", translateToEn: true, projectId: "default", mode: selectedMode as any } };
            
            addLogToTask(task.id, `[NODE_INIT] Provisioning H100 GPU cluster...`);
            const res = await videosApi.createJob(payload);
            const isSuccess = res.success === true || res.status?.toLowerCase() === 'success';
            
            if (isSuccess && res.data.jobId) {
              const serverJobId = res.data.jobId;
              addLogToTask(task.id, `[API_READY] Remote job recognized. ID: ${serverJobId}`);
              
              setResults(prev => prev.map(r => r.id === task.id ? { ...r, id: serverJobId } : r));
              
              if (!isAutoRetry) useCredits(task.cost);
              pollVideoJobStatus(serverJobId, serverJobId, task.cost);
            } else {
              addLogToTask(task.id, `[ERROR] Resource handshake rejected: ${res.message || 'Generic refusal'}`);
              setResults(prev => prev.map(r => r.id === task.id ? { ...r, status: 'error' } : r));
            }
          } else {
            addLogToTask(task.id, `[DIRECT_INFERENCE] Bypassing internal pool. Using personal SDK Uplink.`);
            const url = await generateDemoVideo({ prompt: task.prompt, isUltra: selectedModelObj.modelKey.includes('ultra') || selectedModelObj.name.includes('PRO'), duration, resolution: resolution as '720p' | '1080p', aspectRatio: task.ratio as any, references: task.startUrl ? [task.startUrl] : undefined, lastFrame: task.endUrl || undefined });
            if (url) {
              addLogToTask(task.id, `[SUCCESS] Direct synthesis complete. Asset loaded.`);
              setResults(prev => prev.map(r => r.id === task.id ? { ...r, url, status: 'done' } : r));
              if (autoDownloadRef.current) triggerDownload(url, `video_${task.id}.mp4`);
            } else {
              addLogToTask(task.id, `[ERROR] Personal SDK node returned zero-byte manifest.`);
              setResults(prev => prev.map(r => r.id === task.id ? { ...r, status: 'error' } : r));
            }
          }
        } catch (e) { 
          addLogToTask(task.id, `[CRITICAL_FAIL] Logic gate error: ${String(e)}`);
          setResults(prev => prev.map(r => r.id === task.id ? { ...r, status: 'error' } : r)); 
        }
      }));
    } finally { setIsGenerating(false); }
  };

  const handleGenerate = async () => {
    if (isGenerateDisabled) return;
    if (!isAuthenticated) { login(); return; }
    if (!usagePreference) { setIsResumingGenerate(true); setShowResourceModal(true); return; }
    performInference(usagePreference);
  };

  // AUTO-TASK LOGIC
  useEffect(() => {
    const autoPrompt = localStorage.getItem('skyverses_global_auto_prompt');
    const autoRun = localStorage.getItem('skyverses_global_auto_run');

    if (autoRun === 'true' && autoPrompt && selectedModelObj) {
      setPrompt(autoPrompt);
      localStorage.removeItem('skyverses_global_auto_run');
      localStorage.removeItem('skyverses_global_auto_prompt');
      
      // Delay to ensure prompt state is set
      setTimeout(() => {
        handleGenerate();
      }, 500);
    }
  }, [selectedModelObj, isAuthenticated]); // Re-run when model loads and auth is confirmed

  const handleRetry = (res: VideoResult, isAutoRetry: boolean = false) => {
    if (!usagePreference) return;
    performInference(usagePreference, res, isAutoRetry);
  };

  const deleteResult = (id: string) => setResults(prev => prev.filter(r => r.id !== id));
  const toggleSelect = (id: string) => setSelectedVideoIds(prev => prev.includes(id) ? prev.filter(vidId => vidId !== id) : [...prev, id]);

  const cycleRatio = () => setRatio(r => r === '16:9' ? '9:16' : '16:9');
  const cycleSound = () => setSoundEnabled(s => !s);
  const cycleResolution = () => setResolution(r => r === '720p' ? '1080p' : '720p');

  const generateTooltip = useMemo(() => {
    if (!isAuthenticated) return "Vui lòng đăng nhập để sử dụng";
    if (!usagePreference) return "Vui lòng chọn Nguồn tài nguyên";
    if (processingCount >= 4) return "Đã đạt giới hạn 4 luồng xử lý đồng thời"; 
    if (usagePreference === 'credits' && credits < currentTotalCost) return `Số dư không đủ (Cần ${currentTotalCost} CR)`;
    if (activeMode === 'SINGLE' && !prompt.trim()) return "Vui lòng nhập kịch bản";
    return null;
  }, [isAuthenticated, usagePreference, credits, currentTotalCost, activeMode, prompt, processingCount]);

  const isGenerateDisabled = isGenerating || !!generateTooltip || !selectedModelObj;

  const handleApplyExample = (item: any) => {
    setPrompt(item.prompt);
    setActiveMode('SINGLE');
    if (window.innerWidth < 1024) setIsMobileExpanded(true);
  };

  const triggerDownload = async (url: string, filename: string) => {
    setIsDownloading(filename);
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.body.appendChild(document.createElement('a'));
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      window.open(url, '_blank');
    } finally {
      setIsDownloading(null);
    }
  };

  const handleDownloadAllDone = () => {
    const doneResults = results.filter(r => r.status === 'done' && r.url);
    if (doneResults.length === 0) return;
    doneResults.forEach((res, idx) => {
      setTimeout(() => triggerDownload(res.url!, `video_${res.id}.mp4`), idx * 1000); 
    });
  };

  // Fixed: Added handleBulkImport implementation
  const handleBulkImport = () => {
    if (!bulkText.trim()) {
      setIsBulkImporting(false);
      return;
    }
    const lines = bulkText.split('\n').map(l => l.trim()).filter(l => l !== '');
    const newTasks: AutoTask[] = lines.map((line, idx) => ({
      id: `auto-${Date.now()}-${idx}`,
      type: 'TEXT',
      prompt: line,
      startUrl: null,
      startMediaId: null,
      endUrl: null,
      endMediaId: null
    }));
    setAutoTasks(newTasks);
    setIsBulkImporting(false);
    setBulkText('');
  };

  // Fixed: Added handleAutoPromptChange implementation
  const handleAutoPromptChange = (id: string, val: string) => {
    setAutoTasks(prev => prev.map(t => t.id === id ? { ...t, prompt: val } : t));
  };

  // Fixed: Added removeAutoTask implementation
  const removeAutoTask = (id: string) => {
    if (autoTasks.length <= 1) return;
    setAutoTasks(prev => prev.filter(t => t.id !== id));
  };

  // Fixed: Added handleAutoFileUploadClick implementation
  const handleAutoFileUploadClick = (id: string, slot: 'START' | 'END', mode: 'UPLOAD' | 'LIBRARY') => {
    uploadTargetRef.current = `${id}-${slot}`;
    if (mode === 'UPLOAD') fileInputRef.current?.click();
    else setIsLibraryOpen(true);
  };

  // Fixed: Added handleLibrarySelect implementation
  const handleLibrarySelect = (selected: GCSAssetMetadata[]) => {
    const asset = selected[0];
    if (!asset) return;

    const target = uploadTargetRef.current;
    if (target === 'START') {
      setStartFrame(asset.url);
      setStartFrameId(asset.mediaId || asset.id);
    } else if (target === 'END') {
      setEndFrame(asset.url);
      setEndFrameId(asset.mediaId || asset.id);
    } else if (target?.includes('-')) {
      const parts = target.split('-');
      const slot = parts.pop();
      const taskId = parts.join('-');
      setAutoTasks(prev => prev.map(t => {
        if (t.id === taskId) {
          if (slot === 'START') return { ...t, startUrl: asset.url, startMediaId: asset.mediaId || asset.id };
          return { ...t, endUrl: asset.url, endMediaId: asset.mediaId || asset.id };
        }
        return t;
      }));
    } else if (target) {
      setMultiFrames(prev => prev.map(f => f.id === target ? { ...f, url: asset.url, mediaId: asset.mediaId || asset.id } : f));
    }
    setIsLibraryOpen(false);
  };

  // Fixed: Added handleFileUpload implementation
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const target = uploadTargetRef.current;
    setIsUploadingImage(target);
    try {
      const metadata = await uploadToGCS(file, selectedEngine);
      if (target === 'START') {
        setStartFrame(metadata.url);
        setStartFrameId(metadata.mediaId || metadata.id);
      } else if (target === 'END') {
        setEndFrame(metadata.url);
        setEndFrameId(metadata.mediaId || metadata.id);
      } else if (target?.includes('-')) {
        const parts = target.split('-');
        const slot = parts.pop();
        const taskId = parts.join('-');
        setAutoTasks(prev => prev.map(t => {
          if (t.id === taskId) {
            if (slot === 'START') return { ...t, startUrl: metadata.url, startMediaId: metadata.mediaId || metadata.id };
            return { ...t, endUrl: metadata.url, endMediaId: metadata.mediaId || metadata.id };
          }
          return t;
        }));
      } else if (target) {
        setMultiFrames(prev => prev.map(f => f.id === target ? { ...f, url: metadata.url, mediaId: metadata.mediaId || metadata.id } : f));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploadingImage(null);
      if (e.target) e.target.value = '';
    }
  };

  return (
    <div className="h-full w-full flex flex-col lg:flex-row bg-[#fcfcfd] dark:bg-[#0d0e12] text-slate-900 dark:text-white font-sans overflow-hidden transition-colors duration-500 relative">
      
      <AnimatePresence>
        {isMobileExpanded && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMobileExpanded(false)} className="lg:hidden fixed inset-0 bg-black/60 z-[140] backdrop-blur-sm" />
        )}
      </AnimatePresence>

      <SidebarLeft 
        onClose={onClose}
        activeMode={activeMode}
        setActiveMode={setActiveMode}
        prompt={prompt}
        setPrompt={setPrompt}
        startFrame={startFrame}
        endFrame={endFrame}
        handleSingleFrameClick={(slot, mode) => {
           uploadTargetRef.current = slot;
           if (mode === 'UPLOAD') fileInputRef.current?.click();
           else setIsLibraryOpen(true);
        }}
        fileInputRef={fileInputRef}
        isUploadingImage={isUploadingImage}
        multiFrames={multiFrames}
        handleAddFrame={() => {
           if (multiFrames.length >= 6) return;
           setMultiFrames(prev => [...prev, { id: Date.now().toString(), url: null, mediaId: null, prompt: '' }]);
        }}
        removeFrame={(id) => {
           if (multiFrames.length <= 2) return;
           setMultiFrames(prev => prev.filter(f => f.id !== id));
        }}
        handleFramePromptChange={(id, val) => setMultiFrames(prev => prev.map(n => n.id === id ? { ...n, prompt: val } : n))}
        handleFrameClick={handleFrameClick}
        autoTasks={autoTasks}
        isBulkImporting={isBulkImporting}
        setIsBulkImporting={setIsBulkImporting}
        bulkText={bulkText}
        setBulkText={setBulkText}
        handleBulkImport={handleBulkImport}
        handleAutoPromptChange={handleAutoPromptChange}
        removeAutoTask={removeAutoTask}
        handleAutoFileUploadClick={handleAutoFileUploadClick}
        isMobileExpanded={isMobileExpanded}
        setIsMobileExpanded={setIsMobileExpanded}
        availableModels={availableModels}
        selectedModelObj={selectedModelObj}
        setSelectedModelObj={setSelectedModelObj}
        selectedEngine={selectedEngine}
        setSelectedEngine={setSelectedEngine}
        selectedMode={selectedMode}
        setSelectedMode={setSelectedMode}
        ratio={ratio}
        cycleRatio={cycleRatio}
        duration={duration}
        cycleDuration={cycleDuration}
        soundEnabled={soundEnabled}
        cycleSound={cycleSound}
        resolution={resolution}
        cycleResolution={cycleResolution}
        usagePreference={usagePreference}
        credits={credits}
        setShowResourceModal={setShowResourceModal}
        currentTotalCost={currentTotalCost}
        handleGenerate={handleGenerate}
        isGenerating={isGenerating}
        isGenerateDisabled={isGenerateDisabled}
        generateTooltip={generateTooltip}
        quantity={quantity}
        setQuantity={setQuantity}
      />

      <ResultsMain 
        activeTab={activeTab} setActiveTab={setActiveTab} 
        autoDownload={autoDownload} setAutoDownload={setAutoDownload} 
        zoomLevel={zoomLevel} setZoomLevel={setZoomLevel}
        results={results} isGenerating={isGenerating}
        selectedVideoIds={selectedVideoIds} toggleSelect={toggleSelect}
        setFullscreenVideo={setFullscreenVideo} deleteResult={deleteResult}
        handleRetry={handleRetry} triggerDownload={triggerDownload}
        handleDownloadAllDone={handleDownloadAllDone} todayKey={todayKey}
        onApplyExample={handleApplyExample}
        onViewLogs={(res) => setSelectedLogTask(res)}
      />

      <AnimatePresence>
        {fullscreenVideo && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[1000] bg-black/95 flex flex-col items-center justify-center p-6 md:p-12">
            <button onClick={() => setFullscreenVideo(null)} className="absolute top-8 right-8 p-3 bg-white/10 rounded-full text-white hover:bg-white/20 transition-all z-50 backdrop-blur-md"><X size={28} /></button>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="w-full max-w-6xl aspect-video bg-black rounded-3xl overflow-hidden shadow-[0_0_150px_rgba(147,51,234,0.3)] border border-white/10 relative"><video src={fullscreenVideo.url} autoPlay controls className="w-full h-full object-contain" /></motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedLogTask && (
           <JobLogsModal 
             isOpen={true}
             logs={selectedLogTask.logs || []}
             status={selectedLogTask.status}
             title="Video Production Trace"
             subtitle="Node Process Trace"
             jobId={selectedLogTask.id}
             onClose={() => setSelectedLogTask(null)}
           />
        )}
      </AnimatePresence>

      <ImageLibraryModal 
        isOpen={isLibraryOpen} 
        onClose={() => setIsLibraryOpen(false)} 
        onConfirm={handleLibrarySelect}
        maxSelect={1}
      />

      <ResourceAuthModal isOpen={showResourceModal} onClose={() => setShowResourceModal(false)} onConfirm={(pref) => { setUsagePreference(pref); localStorage.setItem('skyverses_usage_preference', pref); setShowResourceModal(false); if (isResumingGenerate) { setIsResumingGenerate(false); performInference(pref); } }} hasPersonalKey={hasPersonalKey} totalCost={currentTotalCost} />

      <AnimatePresence>
        {showLowCreditAlert && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[1100] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="max-w-md w-full bg-white dark:bg-[#111114] p-12 border border-slate-200 dark:border-white/10 rounded-[2rem] text-center space-y-8 shadow-3xl transition-colors">
              <div className="w-24 h-24 bg-orange-500/10 border border-orange-500/20 rounded-full flex items-center justify-center mx-auto text-orange-500 shadow-xl dark:shadow-[0_0_40px_rgba(245,158,11,0.2)]"><AlertTriangle size={40} /></div>
              <div className="space-y-4">
                <h3 className="text-3xl font-black uppercase tracking-tighter italic text-slate-900 dark:text-white">Quota Depleted</h3>
                <p className="text-sm text-slate-500 dark:text-gray-400 font-bold leading-relaxed uppercase tracking-tight">Video synthesis requires ít nhất **{currentUnitCost} credits** per take. <br />Your current node balance is too low.</p>
              </div>
              <div className="flex flex-col gap-4">
                <Link to="/credits" className="bg-purple-600 text-white py-5 rounded-2xl font-black uppercase tracking-[0.4em] shadow-xl hover:scale-105 transition-all text-center">Nạp thêm Credits</Link>
                <button onClick={() => setShowLowCreditAlert(false)} className="text-[10px] font-black uppercase text-slate-400 dark:text-gray-500 hover:text-slate-900 dark:hover:text-white transition-colors tracking-widest underline underline-offset-8">Để sau</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
    </div>
  );
};

export default AIVideoGeneratorWorkspace;
