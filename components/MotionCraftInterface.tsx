
import React, { useState, useRef } from 'react';
import {
  Zap, Loader2, Video, Film, Play,
  Terminal, ShieldCheck, History as HistoryIcon,
  Download, Layers, Camera, Sliders,
  Palette, CheckCircle2, Info,
  Activity, Upload,
  Square, RotateCcw, MonitorPlay
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { videosApi, VideoJobRequest } from '../apis/videos';
import { pollJobOnce } from '../hooks/useJobPoller';

interface Take {
  url: string;
  prompt: string;
  motion: string;
  timestamp: string;
}

const MotionCraftInterface = () => {
  const { isAuthenticated, login, useCredits } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [takes, setTakes] = useState<Take[]>([]);

  // Motion Config
  const [motionPreset, setMotionPreset] = useState('Orbit');
  const [aspectRatio, setAspectRatio] = useState('9:16');
  const [sourceImage, setSourceImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSourceImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSynthesis = async () => {
    if ((!prompt.trim() && !sourceImage) || isGenerating) return;
    if (!isAuthenticated) { login(); return; }
    setIsGenerating(true);

    try {
      const directive = `${motionPreset} camera logic. Directive: ${prompt}`;
      const hasImages = sourceImage ? [sourceImage] : undefined;
      const payload: VideoJobRequest = {
        type: hasImages ? "image-to-video" : "text-to-video",
        input: { images: hasImages },
        config: { duration: 8, aspectRatio: aspectRatio as '16:9' | '9:16', resolution: "720p" },
        engine: { provider: "google" as any, model: "veo_3_fast" as any },
        enginePayload: { prompt: directive, privacy: "PRIVATE", translateToEn: true, projectId: "default", mode: "fast" }
      };
      const apiRes = await videosApi.createJob(payload);
      if (!apiRes.success || !apiRes.data.jobId) throw new Error('Job creation failed');

      const cancelRef = { current: false };
      pollJobOnce({
        jobId: apiRes.data.jobId,
        isCancelledRef: cancelRef,
        apiType: 'video',
        onDone: (result) => {
          const videoUrl = result.videoUrl ?? '';
          setActiveVideo(videoUrl);
          setTakes(prev => [{
            url: videoUrl,
            prompt: prompt || 'Reference Image Synthesis',
            motion: motionPreset,
            timestamp: new Date().toLocaleTimeString()
          }, ...prev]);
          useCredits(100);
          setIsGenerating(false);
        },
        onError: () => {
          console.error("Velocity Synthesis Error");
          setIsGenerating(false);
        }
      });
    } catch (err: any) {
      console.error("Velocity Synthesis Error:", err);
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-full w-full bg-white dark:bg-[#080808] overflow-hidden text-black dark:text-white">
      <div className="w-full lg:w-[350px] shrink-0 flex flex-col border-r border-black/10 dark:border-white/5 bg-gray-50 dark:bg-[#050506] overflow-y-auto no-scrollbar p-6 space-y-8">
        <div className="space-y-6">
          <label className="text-[9px] font-black uppercase text-gray-500 dark:text-gray-600 tracking-[0.4em] flex items-center gap-3">
            <Sliders size={12} className="text-brand-blue" /> Engine_Presets
          </label>
          <div className="p-4 bg-white dark:bg-white/[0.02] border border-black/5 dark:border-white/5 space-y-6 shadow-sm">
            <div className="space-y-2">
              <label className="text-[7px] font-black uppercase text-gray-400 dark:text-gray-700">Camera_Motion</label>
              <div className="grid grid-cols-2 gap-2">
                {['Orbit', 'Dolly', 'Pan', 'Zoom'].map(m => (
                  <button
                    key={m}
                    onClick={() => setMotionPreset(m)}
                    className={`py-2.5 text-[9px] font-black uppercase border transition-all ${motionPreset === m ? 'bg-brand-blue border-brand-blue text-white' : 'border-black/5 dark:border-white/5 text-gray-400'}`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
           <label className="text-[9px] font-black uppercase text-gray-500 dark:text-gray-600 tracking-[0.4em]">Reference_Frame</label>
           <div
             onClick={() => fileInputRef.current?.click()}
             className="aspect-video border border-dashed border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/[0.02] flex flex-col items-center justify-center cursor-pointer group hover:border-brand-blue transition-all relative overflow-hidden"
           >
              {sourceImage ? (
                <img src={sourceImage} className="w-full h-full object-cover" />
              ) : (
                <>
                  <Upload size={20} className="text-gray-400 mb-2 group-hover:text-brand-blue transition-colors" />
                  <span className="text-[8px] font-black uppercase text-gray-500">Initialize with Frame</span>
                </>
              )}
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
           </div>
        </div>
      </div>

      <div className="flex-grow flex flex-col bg-gray-100 dark:bg-[#020203] relative overflow-hidden">
        <div className="flex-grow flex flex-col items-center justify-center p-6 relative">
          <div className={`w-full relative z-10 transition-all duration-700 ${aspectRatio === '9:16' ? 'max-w-xs aspect-[9/16]' : 'max-w-4xl aspect-video'}`}>
            <div className="w-full h-full bg-black border border-black/10 dark:border-white/10 relative overflow-hidden flex items-center justify-center group/view shadow-2xl">
              {activeVideo ? (
                <video key={activeVideo} src={activeVideo} autoPlay loop muted className={`w-full h-full object-contain ${isGenerating ? 'opacity-20 blur-3xl scale-105' : 'opacity-100'}`} />
              ) : (
                <div className="text-center opacity-10">
                   <MonitorPlay className="w-20 h-20 mx-auto mb-4" />
                   <p className="text-[11px] font-black uppercase tracking-[0.6em]">Terminal_Standby</p>
                </div>
              )}

              {isGenerating && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-md z-20">
                   <Loader2 className="w-12 h-12 text-brand-blue animate-spin mb-4" />
                   <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white animate-pulse">Accelerating_Synthesis...</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="h-32 border-t border-black/10 dark:border-white/5 bg-white dark:bg-black p-4 flex gap-4 shrink-0 relative z-20">
          <div className="flex-grow flex flex-col gap-2">
            <label className="text-[8px] font-black uppercase text-gray-400 dark:text-gray-700 tracking-[0.3em] flex items-center gap-2"><Zap size={12} className="text-brand-blue" /> Intent_Directive</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="flex-grow bg-black/5 dark:bg-white/[0.03] border border-black/10 dark:border-white/10 p-3 text-[11px] font-black uppercase text-black dark:text-white focus:outline-none focus:border-brand-blue/30 resize-none tracking-tight leading-relaxed"
              placeholder="Describe motion..."
            />
          </div>
          <button
            onClick={handleSynthesis}
            disabled={isGenerating || (!prompt.trim() && !sourceImage)}
            className="w-40 bg-brand-blue text-white flex flex-col items-center justify-center gap-2 hover:bg-black dark:hover:bg-white dark:hover:text-black transition-all group shadow-2xl active:scale-[0.98] disabled:opacity-20"
          >
            <Zap size={20} className="fill-current group-hover:scale-110 transition-transform" />
            <span className="text-[8px] font-black uppercase tracking-[0.2em]">Generate</span>
          </button>
        </div>
      </div>

      <div className="hidden xl:flex w-[320px] shrink-0 flex flex-col bg-gray-50 dark:bg-[#050506] border-l border-black/10 dark:border-white/5 overflow-y-auto no-scrollbar p-6 space-y-8">
        <div className="space-y-6">
          <label className="text-[9px] font-black uppercase text-gray-500 dark:text-gray-600 tracking-[0.4em] flex items-center gap-3">
            <HistoryIcon size={14} className="text-brand-blue" /> Velocity_Archives
          </label>
          <div className="space-y-4">
            {takes.map((t, i) => (
              <div key={i} onClick={() => setActiveVideo(t.url)} className="group cursor-pointer border border-black/5 dark:border-white/5 overflow-hidden transition-all hover:border-brand-blue/30">
                <div className="aspect-video bg-black relative">
                   <video src={t.url} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MotionCraftInterface;
