
import React, { useState, useRef } from 'react';
import {
  Monitor, Play, Clapperboard, Layers,
  Settings2, Download, Loader2, Zap, Upload,
  Target, ShieldCheck,
  History as HistoryIcon, Share2, Briefcase, Camera, Sun,
  Terminal, Activity, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { videosApi, VideoJobRequest } from '../apis/videos';
import { pollJobOnce } from '../hooks/useJobPoller';

const NexusStudioInterface = () => {
  const { isAuthenticated, login, useCredits } = useAuth();
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [history, setHistory] = useState<{url: string, prompt: string, segment: string, timestamp: string}[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const [segment, setSegment] = useState('Product Showcase');
  const [prompt, setPrompt] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSelectedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSynthesis = async () => {
    if ((!prompt.trim() && !selectedImage) || isGenerating) return;
    if (!isAuthenticated) { login(); return; }
    setIsGenerating(true);

    try {
      const fullPrompt = `${segment} production. Scene content: ${prompt}`;
      const type = selectedImage ? "image-to-video" : "text-to-video";
      const payload: VideoJobRequest = {
        type,
        input: selectedImage ? { images: [selectedImage] } : {},
        config: { duration: 8, aspectRatio: "16:9", resolution: "720p" },
        engine: { provider: "google" as any, model: "veo_3_fast" as any },
        enginePayload: { prompt: fullPrompt, privacy: "PRIVATE", translateToEn: true, projectId: "default", mode: "fast" }
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
          if (videoUrl) {
            setActiveVideo(videoUrl);
            setHistory(prev => [{
              url: videoUrl,
              prompt: prompt || 'Reference Take',
              segment,
              timestamp: new Date().toLocaleTimeString()
            }, ...prev]);
            useCredits(100);
          }
          setIsGenerating(false);
        },
        onError: () => {
          console.error("Studio Render Failed");
          setIsGenerating(false);
        }
      });
    } catch (err: any) {
      console.error("Studio Render Failed:", err);
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-full w-full bg-white dark:bg-[#050505] overflow-hidden text-black dark:text-white relative">
      <div className="w-full lg:w-[380px] shrink-0 flex flex-col border-r border-black/10 dark:border-white/10 bg-gray-50 dark:bg-black overflow-y-auto no-scrollbar p-8 space-y-12">
        <div className="space-y-6">
          <label className="text-[10px] font-black uppercase text-gray-500 dark:text-gray-600 tracking-widest flex items-center gap-3">
            <Briefcase className="w-4 h-4 text-brand-blue" /> Production_Profile
          </label>
          <div className="grid grid-cols-2 gap-2">
            {['Brand Film', 'Product Showcase', 'Social Ad', 'Cinematic'].map(s => (
              <button
                key={s}
                onClick={() => setSegment(s)}
                className={`py-3 px-3 text-[9px] font-black uppercase border transition-all text-left ${segment === s ? 'bg-brand-blue border-brand-blue text-white' : 'border-black/5 dark:border-white/5 text-gray-400 dark:text-gray-700 hover:border-brand-blue/30'}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6 pt-6 border-t border-black/5 dark:border-white/5">
           <label className="text-[10px] font-black uppercase text-gray-500 dark:text-gray-600 tracking-widest flex items-center gap-3">
              <Layers className="w-4 h-4 text-brand-blue" /> Master_Keyframe
           </label>
           <div
             onClick={() => fileInputRef.current?.click()}
             className="aspect-video border border-dashed border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/[0.02] flex flex-col items-center justify-center cursor-pointer group hover:border-brand-blue transition-all relative overflow-hidden"
           >
              {selectedImage ? (
                <img src={selectedImage} className="w-full h-full object-cover" />
              ) : (
                <>
                  <Upload className="w-6 h-6 text-gray-400 dark:text-gray-700 mb-2 group-hover:text-brand-blue transition-colors" />
                  <span className="text-[9px] font-black uppercase text-gray-400 dark:text-gray-700">Drop Master Frame</span>
                </>
              )}
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
           </div>
        </div>
      </div>

      <div className="flex-grow flex flex-col relative bg-gray-100 dark:bg-[#020202] overflow-hidden">
        <div className="flex-grow flex flex-col items-center justify-center p-6 lg:p-12 relative">
           <div className="w-full max-w-5xl relative z-10 group">
              <div className="aspect-video bg-black border border-black/10 dark:border-white/10 shadow-2xl relative overflow-hidden flex items-center justify-center">
                 {activeVideo ? (
                   <video key={activeVideo} src={activeVideo} autoPlay loop muted className={`w-full h-full object-contain ${isGenerating ? 'opacity-20 scale-105 blur-2xl' : 'opacity-100'}`} />
                 ) : (
                   <div className="flex flex-col items-center justify-center space-y-6 opacity-10 dark:opacity-5">
                      <Monitor className="w-16 h-16 text-black dark:text-white" />
                      <span className="text-xl font-black uppercase tracking-[0.8em] text-black dark:text-white">Signal_Offline</span>
                   </div>
                 )}

                 {isGenerating && (
                   <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-xl z-20">
                      <Loader2 className="w-20 h-20 text-brand-blue animate-spin mb-8" />
                      <p className="text-[12px] font-black uppercase tracking-[0.5em] text-white animate-pulse">Synthesizing_Take...</p>
                   </div>
                 )}
              </div>
           </div>
        </div>

        <div className="h-40 border-t border-black/10 dark:border-white/10 bg-white dark:bg-black/90 p-8 shrink-0 relative z-20">
           <div className="max-w-5xl mx-auto flex gap-6 h-full">
              <div className="flex-grow relative h-full">
                 <textarea
                   value={prompt}
                   onChange={(e) => setPrompt(e.target.value)}
                   placeholder="Direct industrial intent command..."
                   className="w-full h-full bg-black/5 dark:bg-white/[0.03] border border-black/5 dark:border-white/5 p-5 text-[13px] mono font-black focus:outline-none focus:border-brand-blue/30 text-black dark:text-white uppercase tracking-tighter resize-none"
                   disabled={isGenerating}
                 />
              </div>
              <button onClick={handleSynthesis} disabled={isGenerating || (!prompt.trim() && !selectedImage)} className="w-64 bg-brand-blue text-white flex flex-col items-center justify-center gap-3 hover:bg-black dark:hover:bg-white dark:hover:text-black transition-all group active:scale-[0.98] disabled:opacity-20">
                 <Zap className="w-6 h-6 fill-current group-hover:scale-110 transition-transform" />
                 <span className="text-[10px] font-black uppercase tracking-[0.3em]">Synthesize_Take</span>
              </button>
           </div>
        </div>
      </div>

      <div className="hidden xl:flex w-[320px] shrink-0 flex-col border-l border-black/10 dark:border-white/10 bg-gray-50 dark:bg-black overflow-hidden">
         <div className="h-16 border-b border-black/10 dark:border-white/5 flex items-center px-8 shrink-0">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-black dark:text-white flex items-center gap-3">
               <HistoryIcon className="w-4 h-4 text-brand-blue" /> Take_Archives
            </h3>
         </div>
         <div className="flex-grow overflow-y-auto p-6 space-y-6 no-scrollbar">
            {history.map((take, idx) => (
               <div key={idx} onClick={() => setActiveVideo(take.url)} className={`group border cursor-pointer transition-all overflow-hidden relative ${activeVideo === take.url ? 'border-brand-blue bg-brand-blue/[0.03]' : 'border-black/5 dark:border-white/5 opacity-50 hover:opacity-100'}`}>
                  <video src={take.url} className="w-full h-full object-cover" muted />
               </div>
            ))}
         </div>
      </div>
    </div>
  );
};

export default NexusStudioInterface;
