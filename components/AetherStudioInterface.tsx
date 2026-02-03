
import React, { useState, useEffect } from 'react';
import { 
  Zap, Loader2, Film, Clapperboard, MonitorPlay, 
  Terminal, History as HistoryIcon, Plus, Save, 
  Download, Layers, Camera, Maximize2, X
} from 'lucide-react';
import { generateDemoVideo } from '../services/gemini';

const AetherStudioInterface = () => {
  const [scenes, setScenes] = useState([
    { id: 'sc-1', title: 'ACT_01: ARRIVAL', prompt: 'Lone wanderer walking into a futuristic ruined city, dust particles in neon light, volumetric fog.', videoUrl: null, status: 'draft' }
  ]);
  const [selectedSceneId, setSelectedSceneId] = useState(scenes[0].id);
  const [isGenerating, setIsGenerating] = useState(false);

  const currentScene = scenes.find(s => s.id === selectedSceneId)!;

  const handleRender = async () => {
    if (!currentScene.prompt.trim() || isGenerating) return;
    setIsGenerating(true);
    try {
      const url = await generateDemoVideo({ prompt: currentScene.prompt });
      if (url) {
        setScenes(prev => prev.map(s => s.id === selectedSceneId ? { ...s, videoUrl: url, status: 'complete' } : s));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex h-full w-full bg-white dark:bg-[#080808] overflow-hidden text-black dark:text-white font-mono">
      <div className="w-[300px] shrink-0 flex flex-col border-r border-black/10 dark:border-white/5 bg-gray-50 dark:bg-[#050506] p-6 space-y-6">
        <label className="text-[9px] font-black uppercase text-gray-500 tracking-[0.4em] flex items-center gap-3">
          <Layers size={12} className="text-brand-blue" /> Pipeline_Stage
        </label>
        <div className="space-y-2">
          {scenes.map((scene, idx) => (
            <button key={scene.id} onClick={() => setSelectedSceneId(scene.id)} className={`w-full p-4 border text-left rounded-sm transition-all ${selectedSceneId === scene.id ? 'border-brand-blue bg-brand-blue/5' : 'border-black/5 dark:border-white/5 opacity-60'}`}>
              <span className="text-[8px] font-black text-brand-blue">SEQ_0{idx+1}</span>
              <h4 className="text-[10px] font-black uppercase truncate">{scene.title}</h4>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-grow flex flex-col bg-gray-100 dark:bg-[#020203]">
        <div className="flex-grow flex items-center justify-center p-12">
          <div className="w-full max-w-4xl aspect-video bg-black border border-white/5 shadow-2xl relative overflow-hidden flex items-center justify-center">
            {currentScene.videoUrl ? (
              <video src={currentScene.videoUrl} autoPlay loop muted className="w-full h-full object-contain" />
            ) : (
              <MonitorPlay className="w-16 h-16 opacity-5" />
            )}
            {isGenerating && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center gap-4">
                 <Loader2 size={32} className="animate-spin text-brand-blue" />
                 <p className="text-[10px] font-black uppercase tracking-[0.5em] animate-pulse">Synthesizing_Take...</p>
              </div>
            )}
          </div>
        </div>

        <div className="h-40 border-t border-black/10 dark:border-white/5 bg-white dark:bg-black p-8 flex gap-8 shrink-0">
          <textarea 
            value={currentScene.prompt} 
            onChange={(e) => setScenes(prev => prev.map(s => s.id === selectedSceneId ? { ...s, prompt: e.target.value } : s))}
            className="flex-grow bg-black/5 dark:bg-white/[0.03] border-none p-4 text-[11px] font-black uppercase outline-none resize-none tracking-tight leading-relaxed"
            placeholder="Cinematic directive..."
          />
          <button onClick={handleRender} disabled={isGenerating || !currentScene.prompt} className="w-48 bg-brand-blue text-white flex flex-col items-center justify-center gap-2 hover:bg-black transition-all shadow-xl disabled:opacity-20 rounded-sm">
             <Zap size={20} fill="currentColor" />
             <span className="text-[9px] font-black uppercase tracking-[0.3em]">Produce_Take</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AetherStudioInterface;
