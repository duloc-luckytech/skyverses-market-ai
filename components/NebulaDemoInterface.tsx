
import React, { useState } from 'react';
import {
  Zap, Loader2, Download, Terminal,
  Settings2, History as HistoryIcon, Wand2, Info,
  Sparkles, Layers, Cpu, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { imagesApi, ImageJobRequest } from '../apis/images';
import { pollJobOnce } from '../hooks/useJobPoller';

interface Archive {
  url: string;
  timestamp: string;
  metadata: string;
}

const NebulaDemoInterface = () => {
  const { isAuthenticated, login, credits, useCredits } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [activeImage, setActiveImage] = useState('https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=1600');
  const [isGenerating, setIsGenerating] = useState(false);
  const [archives, setArchives] = useState<Archive[]>([]);

  const [engineMode, setEngineMode] = useState('Creative_V2');
  const [resolution, setResolution] = useState('8K_Ultra');

  const handleSynthesis = async () => {
    if (!prompt.trim() || isGenerating || credits <= 0) return;
    if (!isAuthenticated) { login(); return; }
    setIsGenerating(true);

    try {
      const finalPrompt = `[ENGINE: ${engineMode}] Architectural visualization of: ${prompt}. High fidelity, photorealistic, 8K resolution.`;
      const payload: ImageJobRequest = {
        type: "text_to_image",
        input: { prompt: finalPrompt },
        config: { width: 1024, height: 1024, aspectRatio: "1:1", seed: 0, style: "cinematic" },
        engine: { provider: "google" as any, model: "google_image_gen_4_5" as any },
        enginePayload: { prompt: finalPrompt, privacy: "PRIVATE", projectId: "default" }
      };
      const apiRes = await imagesApi.createJob(payload);
      if (!apiRes.success || !apiRes.data.jobId) throw new Error('Job creation failed');

      const cancelRef = { current: false };
      pollJobOnce({
        jobId: apiRes.data.jobId,
        isCancelledRef: cancelRef,
        apiType: 'image',
        onDone: (result) => {
          const imageUrl = result.images?.[0] ?? '';
          if (imageUrl) {
            setActiveImage(imageUrl);
            setArchives(prev => [{
              url: imageUrl,
              timestamp: new Date().toLocaleTimeString(),
              metadata: `${engineMode} // ${resolution}`
            }, ...prev]);
            useCredits(1);
          }
          setIsGenerating(false);
        },
        onError: () => {
          console.error("Nebula Synthesis Error");
          setIsGenerating(false);
        }
      });
    } catch (err) {
      console.error("Nebula Synthesis Error:", err);
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-full w-full bg-white dark:bg-[#080808] overflow-hidden text-black dark:text-white">
      <div className="w-full lg:w-[350px] shrink-0 flex flex-col border-r border-black/10 dark:border-white/5 bg-gray-50 dark:bg-[#050506] overflow-y-auto no-scrollbar p-6 space-y-8">
        <div className="space-y-6">
          <label className="text-[9px] font-black uppercase text-gray-500 dark:text-gray-600 tracking-[0.4em] flex items-center gap-3">
            <Settings2 size={12} className="text-brand-blue" /> Config_Matrix
          </label>
          <div className="p-4 bg-white dark:bg-white/[0.02] border border-black/5 dark:border-white/5 space-y-6 shadow-sm">
            <div className="space-y-2">
              <label className="text-[7px] font-black uppercase text-gray-400 dark:text-gray-700">Engine_Mode</label>
              <select
                value={engineMode}
                onChange={(e) => setEngineMode(e.target.value)}
                className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 p-2.5 text-[10px] font-black uppercase text-black dark:text-white outline-none focus:border-brand-blue transition-all"
              >
                <option value="Creative_V2">Creative_V2</option>
                <option value="Precision_V1">Precision_V1</option>
                <option value="Abstract_Flow">Abstract_Flow</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[7px] font-black uppercase text-gray-400 dark:text-gray-700">Master_Resolution</label>
              <div className="grid grid-cols-2 gap-2">
                 {['4K_Standard', '8K_Ultra'].map(r => (
                   <button
                     key={r}
                     onClick={() => setResolution(r)}
                     className={`py-2 text-[8px] font-black uppercase border transition-all ${resolution === r ? 'bg-brand-blue border-brand-blue text-white' : 'border-black/10 dark:border-white/10 text-gray-400'}`}
                   >
                     {r.split('_')[0]}
                   </button>
                 ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
           <label className="text-[9px] font-black uppercase text-gray-500 dark:text-gray-600 tracking-[0.4em]">System_Status</label>
           <div className="p-4 border border-black/5 dark:border-white/5 space-y-4">
              <div className="flex justify-between items-center">
                 <span className="text-[8px] font-black uppercase text-gray-400">Node_Quota</span>
                 <div className="flex gap-1.5">
                    {[1,2,3].map(i => (
                      <div key={i} className={`w-2.5 h-2.5 rounded-full border border-black/10 dark:border-white/10 ${i <= credits ? 'bg-brand-blue animate-pulse' : 'bg-transparent'}`}></div>
                    ))}
                 </div>
              </div>
              <div className="flex items-center gap-3 text-green-500">
                 <ShieldCheck size={12} />
                 <span className="text-[8px] font-black uppercase tracking-widest">Neural_Uplink_Secure</span>
              </div>
           </div>
        </div>

        <div className="pt-6 border-t border-black/10 dark:border-white/5 mt-auto">
           <p className="text-[8px] text-gray-400 dark:text-gray-700 font-bold uppercase tracking-widest leading-relaxed">
             * Generation is limited to enterprise sandbox parameters. Resolution is upscaled post-synthesis.
           </p>
        </div>
      </div>

      <div className="flex-grow flex flex-col bg-gray-100 dark:bg-[#020203] relative overflow-hidden">
        <div className="flex-grow flex flex-col items-center justify-center p-6 relative">
          <div className="w-full max-w-3xl aspect-[16/10] relative z-10">
            <div className="w-full h-full bg-black border border-black/10 dark:border-white/10 relative overflow-hidden flex items-center justify-center group/view shadow-2xl">
              <img src={activeImage} className={`w-full h-full object-cover transition-all duration-[2s] ${isGenerating ? 'opacity-20 scale-105 blur-3xl' : 'opacity-100'}`} />

              {isGenerating && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-md z-20">
                   <Loader2 className="w-12 h-12 text-brand-blue animate-spin mb-4" />
                   <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white animate-pulse">Synthesizing_Blueprint...</p>
                </div>
              )}

              <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover/view:opacity-100 transition-opacity">
                <a href={activeImage} download className="p-3 bg-brand-blue text-white rounded-full shadow-xl hover:scale-110 transition-all"><Download size={16} /></a>
              </div>

              <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1 bg-black/60 backdrop-blur-md border border-white/10 text-[8px] font-black uppercase tracking-widest text-white/50">
                 <Terminal size={10} className="text-brand-blue" /> Output_Frame_Verified
              </div>
            </div>
          </div>
        </div>

        <div className="h-32 border-t border-black/10 dark:border-white/5 bg-white dark:bg-black p-4 flex gap-4 shrink-0 relative z-20 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] dark:shadow-none">
          <div className="flex-grow flex flex-col gap-2">
            <label className="text-[8px] font-black uppercase text-gray-400 dark:text-gray-700 tracking-[0.3em] flex items-center gap-2"><Wand2 size={12} className="text-brand-blue" /> Creative_Directive</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="flex-grow bg-black/5 dark:bg-white/[0.03] border border-black/10 dark:border-white/10 p-3 text-[11px] font-black uppercase text-black dark:text-white focus:outline-none focus:border-brand-blue/30 resize-none tracking-tight"
              placeholder="Describe architecture, light, material..."
            />
          </div>
          <button
            onClick={handleSynthesis}
            disabled={isGenerating || !prompt.trim() || credits <= 0}
            className="w-32 bg-brand-blue text-white flex flex-col items-center justify-center gap-2 hover:bg-black dark:hover:bg-white dark:hover:text-black transition-all group shadow-2xl active:scale-[0.98] disabled:opacity-20"
          >
            <Zap size={20} className="fill-current group-hover:scale-110 transition-transform" />
            <span className="text-[8px] font-black uppercase tracking-[0.2em]">Generate</span>
          </button>
        </div>
      </div>

      <div className="hidden xl:flex w-[280px] shrink-0 flex flex-col bg-gray-50 dark:bg-[#050506] border-l border-black/10 dark:border-white/5 overflow-y-auto no-scrollbar p-6 space-y-8">
        <div className="space-y-6">
          <label className="text-[9px] font-black uppercase text-gray-500 dark:text-gray-600 tracking-[0.4em] flex items-center gap-3">
            <HistoryIcon size={14} className="text-brand-blue" /> Session_Vault
          </label>
          <div className="space-y-3">
            {archives.length === 0 ? (
              <div className="py-20 text-center border border-dashed border-black/10 dark:border-white/10 opacity-20">
                 <Layers size={24} className="mx-auto mb-4" />
                 <p className="text-[8px] font-black uppercase tracking-widest">Vault_Empty</p>
              </div>
            ) : (
              archives.map((v, i) => (
                <div key={i} onClick={() => setActiveImage(v.url)} className="flex items-center gap-3 group cursor-pointer p-2 border border-transparent hover:border-brand-blue/20 transition-all">
                  <div className="w-12 h-12 border border-black/10 dark:border-white/5 overflow-hidden shrink-0">
                    <img src={v.url} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className="text-[7px] font-black text-black dark:text-white uppercase truncate">{v.metadata}</p>
                    <span className="text-[6px] font-bold text-gray-400 dark:text-gray-700 uppercase">{v.timestamp}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NebulaDemoInterface;
