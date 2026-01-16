
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { generateDemoVideo } from '../services/gemini';
import { pricingApi, PricingModel } from '../apis/pricing';
import { videosApi, VideoJobRequest, VideoJobResponse } from '../apis/videos';

export type AnimateMode = 'MOTION' | 'SWAP';

export interface RenderTask {
  id: string;
  status: 'processing' | 'completed' | 'error';
  url: string | null;
  type: AnimateMode;
  thumb: string | null;
  timestamp: string;
  model: string;
}

export const RATIOS = ['Auto', '16:9', '9:16', '1:1', '4:3'];
export const QUALITY_MODES = ['Standard - 720p', 'High - 1080p', 'Ultra - 4K (Coming)'];

export const useVideoAnimate = () => {
  const { credits, useCredits, addCredits, isAuthenticated, login, refreshUserInfo } = useAuth();
  
  const [mode, setMode] = useState<AnimateMode>('MOTION');
  
  // Dynamic Model States
  const [availableModels, setAvailableModels] = useState<PricingModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<PricingModel | null>(null);
  const [selectedEngine, setSelectedEngine] = useState('wan'); 
  
  const [selectedRatio, setSelectedRatio] = useState(RATIOS[0]);
  const [selectedQuality, setSelectedQuality] = useState(QUALITY_MODES[0]);
  
  const [sourceImg, setSourceImg] = useState<string | null>(null);
  const [refVideo, setRefVideo] = useState<string | null>(null);
  
  const [tasks, setTasks] = useState<RenderTask[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);
  const [showLowCreditAlert, setShowLowCreditAlert] = useState(false);
  const [needsKey, setNeedsKey] = useState(false);

  const [usagePreference, setUsagePreference] = useState<'credits' | 'key'>(() => {
    const saved = localStorage.getItem('skyverses_usage_preference');
    return (saved as any) || 'credits';
  });

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const res = await pricingApi.getPricing({ tool: 'video', engine: selectedEngine });
        if (res.success && res.data.length > 0) {
          setAvailableModels(res.data);
          setSelectedModel(res.data[0]);
        } else {
          setAvailableModels([]);
          setSelectedModel(null);
        }
      } catch (error) {
        console.error("Failed to fetch animate models:", error);
      }
    };
    fetchModels();
  }, [selectedEngine]);

  const estimatedCost = useMemo(() => {
    if (!selectedModel || !selectedModel.pricing) return 50;
    const resKey = selectedQuality.includes('1080') ? '1080p' : '720p';
    const resMatrix = selectedModel.pricing[resKey];
    if (!resMatrix) return 50;
    const firstDurKey = Object.keys(resMatrix)[0];
    return resMatrix[firstDurKey] || 50;
  }, [selectedModel, selectedQuality]);

  useEffect(() => {
    const checkKey = async () => {
      if ((window as any).aistudio) {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        if (!process.env.API_KEY && !hasKey) setNeedsKey(true);
      }
    };
    checkKey();
  }, []);

  const pollVideoJobStatus = async (jobId: string, taskId: string, cost: number) => {
    try {
      const response: VideoJobResponse = await videosApi.getJobStatus(jobId);
      const isSuccess = response.success === true || response.status?.toLowerCase() === 'success';
      const jobStatus = response.data?.status?.toLowerCase();

      if (jobStatus === 'done' && response.data.result?.videoUrl) {
        const videoUrl = response.data.result.videoUrl;
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'completed', url: videoUrl } : t));
        refreshUserInfo();
      } else if (jobStatus === 'failed' || jobStatus === 'error' || (!isSuccess && jobStatus !== 'pending' && jobStatus !== 'processing')) {
        if (usagePreference === 'credits') addCredits(cost);
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'error' } : t));
      } else {
        setTimeout(() => pollVideoJobStatus(jobId, taskId, cost), 5000);
      }
    } catch (e) {
      console.error("Animate Polling Error:", e);
      setTimeout(() => pollVideoJobStatus(jobId, taskId, cost), 10000);
    }
  };

  const handleSynthesize = async () => {
    if (!sourceImg || isGenerating || !selectedModel) return;
    if (!isAuthenticated) { login(); return; }
    
    if (usagePreference === 'credits' && credits < estimatedCost) { 
      setShowLowCreditAlert(true);
      return; 
    }

    const taskId = Date.now().toString();
    const newTask: RenderTask = {
      id: taskId,
      status: 'processing',
      url: null,
      type: mode,
      thumb: sourceImg,
      model: selectedModel.name,
      timestamp: new Date().toLocaleTimeString()
    };

    setTasks(prev => [newTask, ...prev]);
    setIsGenerating(true);
    setIsHistoryExpanded(true);

    try {
      if (usagePreference === 'key') {
        const directive = `${mode === 'MOTION' ? 'Motion Transfer' : 'Face Swap'} using ${selectedModel.modelKey}. Ratio: ${selectedRatio}.`;
        const url = await generateDemoVideo({
          prompt: directive,
          references: [sourceImg],
          resolution: selectedQuality.includes('1080') ? '1080p' : '720p'
        });
        if (url) {
          setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'completed', url: url } : t));
        } else {
          throw new Error("Empty result");
        }
      } else {
        // CALLING REAL API WITH CREDITS
        // Cập nhật type dựa trên mode: MOTION -> image-to-animation, SWAP -> swap-character
        const payloadType = mode === 'MOTION' ? "image-to-animation" : "swap-character";

        const payload: any = {
          type: payloadType,
          input: {
            images: [sourceImg],
            videos: refVideo ? [refVideo] : []
          },
          config: {
            duration: 5,
            aspectRatio: selectedRatio === 'Auto' ? '16:9' : selectedRatio,
            resolution: selectedQuality.includes('1080') ? '1080p' : '720p'
          },
          engine: {
            provider: selectedEngine as any,
            model: selectedModel.modelKey as any
          },
          enginePayload: {
            prompt: mode === 'MOTION' ? "Animate the person in the image following the movements in the video precisely" : "Swap the face of the person in the video with the face in the image",
            privacy: "PRIVATE",
            translateToEn: true,
            projectId: "default",
            mode: "fast"
          }
        };

        const res = await videosApi.createJob(payload);
        const isSuccess = res.success === true || res.status?.toLowerCase() === 'success';
        if (isSuccess && res.data.jobId) {
          useCredits(estimatedCost);
          pollVideoJobStatus(res.data.jobId, taskId, estimatedCost);
        } else {
          setTasks(prev => prev.map(r => r.id === taskId ? { ...r, status: 'error' } : r));
        }
      }
    } catch (err: any) {
      console.error("Animate Studio Error:", err);
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'error' } : t));
      if (err?.message?.includes("Requested entity was not found")) setNeedsKey(true);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'IMG' | 'VID') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'IMG') setSourceImg(reader.result as string);
        else setRefVideo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return {
    mode, setMode,
    selectedModel, setSelectedModel,
    selectedEngine, setSelectedEngine,
    availableModels,
    selectedRatio, setSelectedRatio,
    selectedQuality, setSelectedQuality,
    sourceImg, setSourceImg,
    refVideo, setRefVideo,
    tasks, setTasks,
    isGenerating,
    isHistoryExpanded, setIsHistoryExpanded,
    showLowCreditAlert, setShowLowCreditAlert,
    needsKey, setNeedsKey,
    estimatedCost,
    usagePreference,
    setUsagePreference,
    credits,
    handleFileUpload,
    handleSynthesize,
    hasPersonalKey: usagePreference === 'key' || !!localStorage.getItem('skyverses_model_vault')
  };
};
