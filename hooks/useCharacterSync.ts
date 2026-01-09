
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { generateDemoVideo } from '../services/gemini';
import { uploadToGCS } from '../services/storage';
import { pricingApi, PricingModel } from '../apis/pricing';
import { videosApi, VideoJobRequest, VideoJobResponse } from '../apis/videos';

export interface CharacterSlot {
  id: string;
  url: string | null;
  mediaId: string | null;
  name: string;
  role: string;
}

export interface PromptSequence {
  id: string;
  text: string;
  duration: string;
  boundCharacterIds: string[];
}

export interface ProductionJob {
  id: string;
  status: 'QUEUED' | 'SYNTHESIZING' | 'COMPLETED' | 'FAILED';
  prompt: string;
  progress: number;
  url?: string;
  timestamp: string;
  cost: number;
  isRefunded?: boolean;
  ratio: string;
  resolution: string;
  duration: string;
  references: string[];
  dateKey: string;
  modelName: string;
  error?: string;
}

export const useCharacterSync = () => {
  const { credits, useCredits, addCredits, isAuthenticated, login, refreshUserInfo } = useAuth();
  
  const [slots, setSlots] = useState<CharacterSlot[]>(
    Array.from({ length: 10 }, (_, i) => ({ 
      id: `slot-${i}`, 
      url: null, 
      mediaId: null,
      name: `Nhân vật ${i + 1}`, 
      role: 'NPC' 
    }))
  );
  
  const [sequences, setSequences] = useState<PromptSequence[]>([
    { id: 'seq-1', text: '', duration: '8s', boundCharacterIds: [] }
  ]);
  
  const [jobs, setJobs] = useState<ProductionJob[]>([]);
  const [history, setHistory] = useState<ProductionJob[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  
  // NEW: State for results terminal
  const [activeResultTab, setActiveResultTab] = useState<'CURRENT' | 'HISTORY'>('CURRENT');
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

  const [availableModels, setAvailableModels] = useState<PricingModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<PricingModel | null>(null);
  const [selectedEngine, setSelectedEngine] = useState('gommo');
  const [resolution, setResolution] = useState('720p');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [duration, setDuration] = useState('8s');

  const [usagePreference, setUsagePreference] = useState<'credits' | 'key' | null>(() => {
    return (localStorage.getItem('skyverses_usage_preference') as any) || 'credits';
  });

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const res = await pricingApi.getPricing({ tool: 'video', engine: selectedEngine });
        if (res.success && res.data.length > 0) {
          setAvailableModels(res.data);
          const defaultModel = res.data.find(m => m.modelKey === 'veo_3_1') || res.data[0];
          setSelectedModel(defaultModel);
        }
      } catch (error) {
        console.error("Failed to fetch character sync pricing:", error);
      }
    };
    fetchModels();

    const hasSeen = localStorage.getItem('skyverses_charsync_tutorial_seen');
    if (!hasSeen) {
      setShowTutorial(true);
    }
  }, [selectedEngine]);

  const closeTutorial = () => {
    localStorage.setItem('skyverses_charsync_tutorial_seen', 'true');
    setShowTutorial(false);
  };

  const availableResolutions = useMemo(() => {
    if (!selectedModel || !selectedModel.pricing) return ['720p', '1080p'];
    return Object.keys(selectedModel.pricing);
  }, [selectedModel]);

  const availableDurations = useMemo(() => {
    if (!selectedModel || !selectedModel.pricing || !selectedModel.pricing[resolution]) {
        return ['5s', '8s', '10s'];
    }
    return Object.keys(selectedModel.pricing[resolution]).map(d => `${d}s`);
  }, [selectedModel, resolution]);

  useEffect(() => {
    if (availableResolutions.length > 0 && !availableResolutions.includes(resolution)) {
      setResolution(availableResolutions[0]);
    }
  }, [availableResolutions]);

  useEffect(() => {
    if (availableDurations.length > 0 && !availableDurations.includes(duration)) {
      setDuration(availableDurations[0]);
    }
  }, [availableDurations]);

  const updateSlot = (idx: number, updates: Partial<CharacterSlot>) => {
    setSlots(prev => prev.map((s, i) => i === idx ? { ...s, ...updates } : s));
  };

  const addSequence = () => {
    setSequences([...sequences, { id: `seq-${Date.now()}`, text: '', duration: duration, boundCharacterIds: [] }]);
  };

  const removeSequence = (id: string) => {
    if (sequences.length > 1) setSequences(prev => prev.filter(s => s.id !== id));
  };

  const activeCharacterNames = useMemo(() => 
    slots.filter(s => s.url && s.name.trim()).map(s => s.name.toUpperCase()), 
  [slots]);

  const hasValidSequence = useMemo(() => {
    const activeSeqs = sequences.filter(s => s.text.trim() !== '');
    if (activeSeqs.length === 0) return false;
    if (activeCharacterNames.length === 0) return false;

    return activeSeqs.some(seq => {
      const textUpper = seq.text.toUpperCase();
      return activeCharacterNames.some(name => textUpper.includes(name));
    });
  }, [sequences, activeCharacterNames]);

  const currentUnitCost = useMemo(() => {
    if (!selectedModel || !selectedModel.pricing) return 50;
    const resMatrix = selectedModel.pricing[resolution.toLowerCase()];
    if (!resMatrix) return 50;
    const durKey = duration.replace('s', '');
    return resMatrix[durKey] || 50;
  }, [selectedModel, resolution, duration]);

  const totalCostEstimate = useMemo(() => 
    sequences.filter(s => s.text.trim() !== '').length * currentUnitCost, 
  [sequences, currentUnitCost]);

  const pollJobStatus = async (jobId: string, resultId: string, cost: number) => {
    try {
      const response: VideoJobResponse = await videosApi.getJobStatus(jobId);
      const isSuccess = response.success === true || response.status?.toLowerCase() === 'success';
      const jobStatus = response.data?.status?.toUpperCase();
      
      if (jobStatus === 'DONE' && response.data.result?.videoUrl) {
        const videoUrl = response.data.result.videoUrl;
        setJobs(prev => {
          const job = prev.find(j => j.id === resultId);
          if (job) {
             setHistory(h => [{ ...job, status: 'COMPLETED', url: videoUrl, progress: 100 }, ...h]);
          }
          return prev.filter(j => j.id !== resultId);
        });
        refreshUserInfo();
      } else if (jobStatus === 'FAILED' || jobStatus === 'ERROR' || (!isSuccess && jobStatus !== 'PENDING' && jobStatus !== 'PROCESSING')) {
        const errorData = (response.data as any)?.error;
        const errorMsg = errorData?.userMessage || errorData?.message || 'Lỗi tạo video';
        
        if (usagePreference === 'credits') addCredits(cost);
        setJobs(prev => prev.map(j => j.id === resultId ? { ...j, status: 'FAILED', error: errorMsg, isRefunded: true } : j));
      } else {
        setJobs(prev => prev.map(j => {
          if (j.id === resultId) {
            const newProgress = Math.min(95, j.progress + 3);
            return { ...j, progress: newProgress };
          }
          return j;
        }));
        setTimeout(() => pollJobStatus(jobId, resultId, cost), 5000);
      }
    } catch (e) {
      console.error("Polling Error:", e);
      setJobs(prev => prev.map(j => j.id === resultId ? { ...j, status: 'FAILED', error: 'Mất kết nối API' } : j));
    }
  };

  const handleLocalUpload = async (e: React.ChangeEvent<HTMLInputElement>, activeIdx: number | null) => {
    const file = e.target.files?.[0];
    if (!file || activeIdx === null || activeIdx < 0) return;

    // Validate file type: only PNG and JPEG
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      alert("Chỉ cho phép tải lên hình ảnh định dạng PNG hoặc JPEG.");
      if (e.target) e.target.value = '';
      return;
    }

    setUploadingIdx(activeIdx);
    const nameFromFileName = file.name.split('.')[0].replace(/[_-]/g, ' ').trim().toUpperCase();

    try {
      // Gán cứng source là fxlab khi upload hình nhân vật
      const metadata = await uploadToGCS(file, 'fxlab');
      updateSlot(activeIdx, { url: metadata.url, name: nameFromFileName, mediaId: metadata.mediaId });
    } catch (error) {
      console.error("Character image upload failed:", error);
    } finally {
      setUploadingIdx(null);
      if (e.target) e.target.value = '';
    }
  };

  const applyTemplate = (template: any) => {
    setSlots(prev => prev.map((s, i) => template.actors[i] ? { ...s, url: template.actors[i].url, name: template.actors[i].name, mediaId: template.actors[i].mediaId || null } : s));
    setSequences([{ id: `seq-${Date.now()}`, text: template.prompt, duration: '8s', boundCharacterIds: [] }]);
    setIsTemplateModalOpen(false);
  };

  const handleSynthesize = async () => {
    const activeSequences = sequences.filter(s => s.text.trim() !== '');
    if (activeSequences.length === 0 || isGenerating || !selectedModel) return;

    if (!usagePreference) return 'NEED_RESOURCE_MODAL';
    if (usagePreference === 'credits' && credits < totalCostEstimate) return 'LOW_CREDITS';

    setIsGenerating(true);
    const charUrls = slots.filter(s => s.url).map(s => s.url!);
    // Ưu tiên sử dụng mediaId nếu có cho engine fxlab/gommo
    const charMediaIds = slots.filter(s => s.url).map(s => s.mediaId || s.url!);
    
    const now = new Date();
    const dateKey = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString();

    for (const seq of activeSequences) {
      const resultId = `sync-job-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      const newJob: ProductionJob = {
        id: resultId, status: 'SYNTHESIZING', prompt: seq.text, progress: 15, timestamp: timeStr, cost: currentUnitCost, ratio: aspectRatio, resolution: resolution, duration: duration, references: charUrls, dateKey: dateKey, modelName: selectedModel.name
      };
      setJobs(prev => [newJob, ...prev]);

      try {
        if (usagePreference === 'credits') {
          const payload: VideoJobRequest = { 
            type: "ingredient", 
            // Chọn identifier dựa trên engine: fxlab -> mediaId, gommo -> url
            input: { images: selectedEngine === 'fxlab' ? charMediaIds : charUrls }, 
            config: { duration: parseInt(duration), aspectRatio, resolution }, 
            engine: { provider: selectedEngine as any, model: selectedModel.modelKey as any }, 
            enginePayload: { accessToken: "SECURE_GATEWAY_TOKEN", prompt: seq.text, privacy: "PRIVATE", translateToEn: true, projectId: "default", mode: selectedModel.mode as any } 
          };
          const res = await videosApi.createJob(payload);
          const isSuccess = res.success === true || res.status?.toLowerCase() === 'success';
          if (isSuccess && res.data.jobId) {
            useCredits(currentUnitCost);
            pollJobStatus(res.data.jobId, resultId, currentUnitCost);
          } else {
            setJobs(prev => prev.map(j => j.id === resultId ? { ...j, status: 'FAILED', error: res.message || 'Khởi tạo Job thất bại' } : j));
          }
        } else {
          const url = await generateDemoVideo({ prompt: `Character Sync: ${seq.text}. Identity Locked.`, references: charUrls, resolution: resolution as '720p' | '1080p', aspectRatio: aspectRatio, duration: duration, isUltra: selectedModel.modelKey.includes('ultra') || selectedModel.name.includes('PRO') });
          if (url) {
            setJobs(prev => prev.filter(j => j.id !== resultId));
            setHistory(prev => [{ ...newJob, status: 'COMPLETED', url, progress: 100 }, ...prev]);
          } else {
            setJobs(prev => prev.map(j => j.id === resultId ? { ...j, status: 'FAILED', error: 'Từ chối bởi Engine' } : j));
          }
        }
      } catch (e) {
        setJobs(prev => prev.map(j => j.id === resultId ? { ...j, status: 'FAILED', error: 'Lỗi động cơ xử lý' } : j));
      }
    }
    setIsGenerating(false);
    return 'SUCCESS';
  };

  return {
    slots, setSlots, updateSlot,
    sequences, setSequences, addSequence, removeSequence,
    jobs, setJobs,
    history, setHistory,
    isGenerating,
    uploadingIdx,
    handleLocalUpload,
    usagePreference, setUsagePreference,
    activeCharacterNames,
    hasValidSequence,
    totalCostEstimate,
    handleSynthesize,
    availableModels,
    selectedModel, setSelectedModel,
    selectedEngine, setSelectedEngine,
    resolution, setResolution,
    availableResolutions,
    aspectRatio, setAspectRatio,
    duration, setDuration,
    availableDurations,
    currentUnitCost,
    showTutorial,
    setShowTutorial,
    closeTutorial,
    activeResultTab,
    setActiveResultTab,
    isTemplateModalOpen,
    setIsTemplateModalOpen,
    applyTemplate
  };
};
