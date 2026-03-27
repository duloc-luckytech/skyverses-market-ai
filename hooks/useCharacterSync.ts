
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

export const MAX_CHARACTERS = 10;

export const useCharacterSync = () => {
  const { credits, useCredits, addCredits, isAuthenticated, login, refreshUserInfo } = useAuth();

  const [slots, setSlots] = useState<CharacterSlot[]>([]);

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

  const addCharacterFromLibrary = (url: string, mediaId: string | null, name: string) => {
    if (slots.length >= MAX_CHARACTERS) return;
    const newSlot: CharacterSlot = {
      id: `slot-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      url,
      mediaId,
      name: name.trim().toUpperCase() || `NV ${slots.length + 1}`,
      role: 'NPC'
    };
    setSlots(prev => [...prev, newSlot]);
  };

  const removeCharacter = (id: string) => {
    setSlots(prev => prev.filter(s => s.id !== id));
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
    // Just need at least one character with an image uploaded
    const hasCharacter = slots.some(s => s.url);
    return hasCharacter;
  }, [sequences, slots]);

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
      // Upload hình nhân vật qua gommo
      const metadata = await uploadToGCS(file, 'gommo');
      updateSlot(activeIdx, { url: metadata.url, name: nameFromFileName, mediaId: metadata.mediaId });
    } catch (error) {
      console.error("Character image upload failed:", error);
    } finally {
      setUploadingIdx(null);
      if (e.target) e.target.value = '';
    }
  };

  const applyTemplate = (template: any) => {
    const newSlots: CharacterSlot[] = (template.actors || []).slice(0, MAX_CHARACTERS).map((actor: any, i: number) => ({
      id: `slot-tmpl-${Date.now()}-${i}`,
      url: actor.url,
      mediaId: actor.mediaId || null,
      name: actor.name || `NV ${i + 1}`,
      role: 'NPC'
    }));
    setSlots(newSlots);
    setSequences([{ id: `seq-${Date.now()}`, text: template.prompt, duration: '8s', boundCharacterIds: [] }]);
    setIsTemplateModalOpen(false);
  };

  const handleSynthesize = async () => {
    const activeSequences = sequences.filter(s => s.text.trim() !== '');
    if (activeSequences.length === 0 || isGenerating || !selectedModel) return;

    if (!usagePreference) return 'NEED_RESOURCE_MODAL';
    if (usagePreference === 'credits' && credits < totalCostEstimate) return 'LOW_CREDITS';

    setIsGenerating(true);

    // Collect all character reference images (same as VideoGenerator's inputImages)
    const charUrls = slots.filter(s => s.url).map(s => s.url!);

    const now = new Date();
    const dateKey = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString();

    // Create placeholder jobs for each sequence
    const taskEntries = activeSequences.map(seq => {
      const localId = `sync-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      const job: ProductionJob = {
        id: localId,
        status: 'SYNTHESIZING',
        prompt: seq.text,
        progress: 10,
        timestamp: timeStr,
        cost: currentUnitCost,
        ratio: aspectRatio,
        resolution,
        duration,
        references: charUrls,
        dateKey,
        modelName: selectedModel.name,
      };
      return { localId, seq, job };
    });

    // Add all placeholder jobs to the queue
    setJobs(prev => [...taskEntries.map(t => t.job), ...prev]);

    // Run all sequences in parallel (like VideoGenerator's Promise.all)
    try {
      await Promise.all(taskEntries.map(async ({ localId, seq }) => {
        try {
          if (usagePreference === 'credits') {
            // Build payload matching VideoGenerator format — use "ingredient" for multi-reference character sync
            const payload: VideoJobRequest = {
              type: "ingredient",
              input: { images: charUrls.length > 0 ? charUrls : [null] },
              config: {
                duration: parseInt(duration),
                aspectRatio,
                resolution,
              },
              engine: {
                provider: selectedEngine as any,
                model: selectedModel.modelKey as any,
              },
              enginePayload: {
                accessToken: "SECURE_GATEWAY_TOKEN",
                prompt: seq.text,
                privacy: "PRIVATE",
                translateToEn: true,
                projectId: "default",
                mode: (selectedModel.mode || "relaxed") as any,
              },
            };

            const res = await videosApi.createJob(payload);
            const isSuccess = res.success === true || res.status?.toLowerCase() === 'success';

            if (isSuccess && res.data.jobId) {
              const serverJobId = res.data.jobId;

              // Replace local ID with server ID (same as VideoGenerator)
              setJobs(prev => prev.map(j => j.id === localId ? { ...j, id: serverJobId } : j));

              // Credits deducted server-side, sync client
              useCredits(currentUnitCost);

              // Start polling with server job ID
              pollJobStatus(serverJobId, serverJobId, currentUnitCost);
            } else {
              setJobs(prev => prev.map(j => j.id === localId ? {
                ...j, status: 'FAILED', error: res.message || 'Khởi tạo Job thất bại'
              } : j));
            }
          } else {
            // Personal API Key flow (same as VideoGenerator)
            const url = await generateDemoVideo({
              prompt: seq.text,
              references: charUrls.length > 0 ? charUrls : undefined,
              resolution: resolution as '720p' | '1080p',
              aspectRatio,
              duration,
              isUltra: selectedModel.modelKey.includes('ultra') || selectedModel.name.includes('PRO'),
            });

            if (url) {
              setJobs(prev => {
                const job = prev.find(j => j.id === localId);
                if (job) {
                  setHistory(h => [{ ...job, status: 'COMPLETED', url, progress: 100 }, ...h]);
                }
                return prev.filter(j => j.id !== localId);
              });
            } else {
              setJobs(prev => prev.map(j => j.id === localId ? {
                ...j, status: 'FAILED', error: 'Engine trả về kết quả rỗng'
              } : j));
            }
          }
        } catch (e) {
          setJobs(prev => prev.map(j => j.id === localId ? {
            ...j, status: 'FAILED', error: `Lỗi: ${String(e)}`
          } : j));
        }
      }));
    } finally {
      setIsGenerating(false);
    }

    return 'SUCCESS';
  };

  return {
    slots, setSlots, updateSlot, addCharacterFromLibrary, removeCharacter,
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
