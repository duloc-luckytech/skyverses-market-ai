
import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { generateDemoAudio } from '../services/gemini';
import { pricingApi, PricingModel } from '../apis/pricing';
import { videosApi, VideoJobRequest, VideoJobResponse } from '../apis/videos';

export interface MusicResult {
  id: string;
  name: string;
  desc: string;
  timestamp: string;
  buffer?: AudioBuffer;
  url?: string;
  status: 'processing' | 'done' | 'error';
  cost: number;
}

export const useMusicStudio = () => {
  const { credits, useCredits, addCredits, isAuthenticated, login, refreshUserInfo } = useAuth();
  
  // Input states
  const [songName, setSongName] = useState('');
  const [description, setDescription] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [isInstrumental, setIsInstrumental] = useState(false);
  
  // Infrastructure States
  const [selectedEngine, setSelectedEngine] = useState('gommo');
  const [availableModels, setAvailableModels] = useState<PricingModel[]>([]);
  const [selectedModelObj, setSelectedModelObj] = useState<PricingModel | null>(null);

  // Resource Preference
  const [usagePreference] = useState<'credits' | 'key'>(() => {
    const saved = localStorage.getItem('skyverses_usage_preference');
    return (saved as any) || 'credits';
  });
  
  // UI states
  const [activeTab, setActiveTab] = useState<'current' | 'library'>('current');
  const [isGenerating, setIsGenerating] = useState(false);
  const [expanding, setExpanding] = useState<'desc' | 'lyrics' | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeAudioId, setActiveAudioId] = useState<string | null>(null);
  const [autoDownload, setAutoDownload] = useState(false);
  
  // Data states
  const [results, setResults] = useState<MusicResult[]>([]);
  
  // Audio Refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const audioObjRef = useRef<HTMLAudioElement | null>(null);

  // Fetch Pricing for Audio
  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const res = await pricingApi.getPricing({ tool: 'music', engine: selectedEngine });
        if (res.success && res.data.length > 0) {
          setAvailableModels(res.data);
          setSelectedModelObj(res.data[0]);
        }
      } catch (error) {
        console.error("Failed to fetch audio pricing:", error);
      }
    };
    fetchPricing();
  }, [selectedEngine]);

  const currentUnitCost = useMemo(() => {
    if (!selectedModelObj || !selectedModelObj.pricing) return 2500;
    const resMatrix = selectedModelObj.pricing['standard'] || Object.values(selectedModelObj.pricing)[0];
    if (!resMatrix) return 2500;
    return Object.values(resMatrix)[0] as number || 2500;
  }, [selectedModelObj]);

  const stopPlayback = useCallback(() => {
    if (sourceNodeRef.current) {
      try { sourceNodeRef.current.stop(); } catch (e) {}
      sourceNodeRef.current = null;
    }
    if (audioObjRef.current) {
      audioObjRef.current.pause();
      audioObjRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setActiveAudioId(null);
  }, []);

  const downloadFile = useCallback((url: string, name: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `${name.replace(/\s+/g, '_')}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const pollMusicJobStatus = async (jobId: string, resultId: string, cost: number) => {
    try {
      const response: any = await videosApi.getJobStatus(jobId);
      const isSuccess = response.success === true || response.status?.toLowerCase() === 'success';
      const jobStatus = response.data?.status?.toLowerCase();

      if (jobStatus === 'done' && response.data.result?.audioUrl) {
        const audioUrl = response.data.result.audioUrl;
        setResults(prev => prev.map(r => {
          if (r.id === resultId) {
            if (autoDownload) downloadFile(audioUrl, r.name);
            return { ...r, url: audioUrl, status: 'done' };
          }
          return r;
        }));
        refreshUserInfo();
      } else if (jobStatus === 'failed' || jobStatus === 'error' || (!isSuccess && jobStatus !== 'pending' && jobStatus !== 'processing')) {
        if (usagePreference === 'credits') addCredits(cost);
        setResults(prev => prev.map(r => r.id === resultId ? { ...r, status: 'error' } : r));
      } else {
        setTimeout(() => pollMusicJobStatus(jobId, resultId, cost), 5000);
      }
    } catch (e) {
      console.error("Polling error", e);
      setTimeout(() => pollMusicJobStatus(jobId, resultId, cost), 10000);
    }
  };

  const handleGenerate = async (overrides?: Partial<MusicResult>) => {
    const name = overrides?.name || songName;
    const desc = overrides?.desc || description;
    const lyr = overrides?.id ? (results.find(r => r.id === overrides.id)?.desc || '') : lyrics;

    if (name.trim().length < 5) {
      alert("Tên bài hát phải có tối thiểu 5 ký tự.");
      return;
    }
    
    if (isGenerating) return;
    if (!isAuthenticated) { login(); return; }
    
    if (usagePreference === 'credits' && credits < currentUnitCost) {
      alert("Hạn ngạch không đủ. Vui lòng nạp thêm Credits.");
      return;
    }

    setIsGenerating(true);
    stopPlayback();
    
    const resultId = `music-${Date.now()}`;
    const newSong: MusicResult = { 
      id: resultId, 
      name: name, 
      desc: desc,
      timestamp: new Date().toLocaleTimeString(),
      status: 'processing',
      cost: currentUnitCost
    };
    setResults(prev => [newSong, ...prev]);

    try {
      if (usagePreference === 'credits') {
        const payload: any = {
          type: "text-to-music",
          input: { images: [] },
          config: {
            duration: 8,
            aspectRatio: "1:1",
            resolution: "720p"
          },
          engine: {
            provider: selectedEngine,
            model: selectedModelObj?.modelKey || "suno_v3"
          },
          enginePayload: {
            name: name,
            prompt: lyr || 'Một bản nhạc hay',
            styles: desc,
            privacy: "PRIVATE",
            translateToEn: true,
            projectId: "default"
          }
        };

        const res = await videosApi.createJob(payload);
        if (res.success && res.data.jobId) {
          useCredits(currentUnitCost);
          pollMusicJobStatus(res.data.jobId, resultId, currentUnitCost);
        } else {
          setResults(prev => prev.map(r => r.id === resultId ? { ...r, status: 'error' } : r));
        }
      } else {
        const buffer = await generateDemoAudio(`Style: ${desc}. Name: ${name}`, 'Kore'); 
        if (buffer) {
          setResults(prev => prev.map(r => r.id === resultId ? { ...r, buffer, status: 'done' } : r));
        }
      }
    } catch (error) {
      console.error("Music Generation Error:", error);
      setResults(prev => prev.map(r => r.id === resultId ? { ...r, status: 'error' } : r));
    } finally {
      setIsGenerating(false);
    }
  };

  const playBuffer = useCallback((bufferOrUrl: AudioBuffer | string, id: string) => {
    if (activeAudioId === id && isPlaying) {
      stopPlayback();
      return;
    }
    stopPlayback();
    if (typeof bufferOrUrl === 'string') {
      if (!audioObjRef.current) audioObjRef.current = new Audio();
      audioObjRef.current.src = bufferOrUrl;
      audioObjRef.current.onended = () => { setIsPlaying(false); setActiveAudioId(null); };
      audioObjRef.current.play();
      setIsPlaying(true);
      setActiveAudioId(id);
    } else {
      if (!audioCtxRef.current) {
        const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
        audioCtxRef.current = new AudioContextClass();
      }
      const source = audioCtxRef.current!.createBufferSource();
      source.buffer = bufferOrUrl;
      source.connect(audioCtxRef.current!.destination);
      source.onended = () => { setIsPlaying(false); setActiveAudioId(null); };
      source.start(0);
      sourceNodeRef.current = source;
      setIsPlaying(true);
      setActiveAudioId(id);
    }
  }, [activeAudioId, isPlaying, stopPlayback]);

  return {
    songName, setSongName,
    description, setDescription,
    lyrics, setLyrics,
    isInstrumental, setIsInstrumental,
    selectedEngine, setSelectedEngine,
    availableModels, selectedModelObj, setSelectedModelObj,
    currentUnitCost,
    usagePreference,
    credits,
    activeTab, setActiveTab,
    isGenerating,
    expanding, setExpanding,
    isPlaying, activeAudioId,
    results, setResults,
    handleGenerate,
    playBuffer,
    stopPlayback,
    autoDownload, setAutoDownload,
    downloadFile,
    handleDelete: (id: string) => setResults(prev => prev.filter(r => r.id !== id)),
    handleDownloadAll: () => {
      results.forEach(r => {
        if (r.status === 'done' && r.url) downloadFile(r.url, r.name);
      });
    }
  };
};
