
import React, { useState, useEffect } from 'react';
import { 
  Zap, Loader2, Film, Clapperboard, MonitorPlay, 
  Terminal, ShieldCheck, History as HistoryIcon, Plus, Save, 
  Download, Layers, Camera, Sliders, Palette, 
  CheckCircle2, Info, Lock, ExternalLink, Activity, ChevronRight
} from 'lucide-react';
import { generateDemoVideo, generateDemoText } from '../services/gemini';

interface Scene {
  id: string;
  title: string;
  script: string;
  visualPrompt: string;
  shotType: 'WIDE' | 'MEDIUM' | 'CLOSE' | 'POV' | 'AERIAL';
  videoUrl: string | null;
  status: 'draft' | 'rendering' | 'complete' | 'error';
  version: number;
}

const AetherStudioInterface = () => {
  const [projectTitle, setProjectTitle] = useState('THE_NEURAL_ODYSSEY');
  const [scenes, setScenes] = useState<Scene[]>([
    { id: 'sc-1', title: 'ACT_01: ARRIVAL', script: 'Character enters the neon-soaked wasteland. Desolation in his eyes.', visualPrompt: 'Anamorphic 35mm, lone wanderer walking into a futuristic ruined city, dust particles in neon light, volumetric fog.', shotType: 'WIDE', videoUrl: null, status: 'draft', version: 1 },
    { id: 'sc-2', title: 'ACT_01: ENCOUNTER', script: 'Close up on the mechanical eye as it calibrates.', visualPrompt: 'Extreme close up, cybernetic eye iris opening, reflecting data streams, macro lens, high detail.', shotType: 'CLOSE', videoUrl: null, status: 'draft', version: 1 }
  ]);
  const [selectedSceneId, setSelectedSceneId] = useState<string>(scenes[0].id);
  const [needsKey, setNeedsKey] = useState(false);
  
  const [genre, setGenre] = useState('Sci-Fi');
  const [cameraMotion, setCameraMotion] = useState('Handheld Realistic');

  useEffect(() => {
    const checkKey = async () => {
      if ((window as any).aistudio) {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        if (!process.env.API_KEY && !hasKey) setNeedsKey(true);
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    if ((window as any).aistudio) {
      await (window as any).aistudio.openSelectKey();
      setNeedsKey(false);
    }
  };

  const currentScene = scenes.find(s => s.id === selectedSceneId) || scenes[0];

  const updateScene = (id: string, updates: Partial<Scene>) => {
    setScenes(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const handleRenderScene = async (id: string) => {
    const scene = scenes.find(s => s.id === id);
    if (!scene || scene.status === 'rendering') return;

    updateScene(id, { status: 'rendering' });
    try {
      const prompt = `Genre: ${genre}, Camera: ${cameraMotion}. Shot: ${scene.shotType}. ${scene.visualPrompt}`;
      const url = await generateDemoVideo({ prompt });
      if (url) {
        updateScene(id, { videoUrl: url, status: 'complete', version: scene.version + 1 });
      } else {
        updateScene(id, { status: 'error' });
      }
    } catch (err: any) {
      console.error("Render Error:", err);
      updateScene(id, { status: 'error' });
      if (err?.message?.includes('Requested entity was not found')) {
        setNeedsKey(true);
      }
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-full w-full bg-white dark:bg-[#080808] overflow-hidden text-black dark:text-white">
      <div className="w-full lg:w-[350px] shrink-0 flex flex-col border-r border-black/10 dark:border-white/5 bg-gray-50 dark:bg-[#050506] overflow-y-auto no-scrollbar p-6 space-y-8">
        <div className="space-y-6">
          <label className="text-[9px] font-black uppercase text-gray-500 dark:text-gray-600 tracking-[0.4em] flex items-center gap-3">
            <Layers size={12} className="text-brand-blue" /> Project_Hierarchy
          </label>
          <div className="space-y-2">
            {scenes.map((scene, idx) => (
              <button 
                key={scene.id} 
                onClick={() => setSelectedSceneId(scene.id)}
                className={`w-full p-4 border text-left transition-all relative ${selectedSceneId === scene.id ? 'border-brand-blue bg-brand-blue/5' : 'border-black/5 dark:border-white/5 opacity-60 hover:opacity-100'}`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[8px] font-black text-brand-blue">SEQ_{idx+1}</span>
                  <div className={`w-1.5 h-1.5 rounded-full ${scene.status === 'complete' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                </div>
                <h4 className="text-[10px] font-black uppercase truncate">{scene.title}</h4>
              </button>
            ))}
            <button onClick={() => setScenes([...scenes, { id: `sc-${Date.now()}`, title: 'NEW_SEQUENCE', script: '', visualPrompt: '', shotType: 'MEDIUM', videoUrl: null, status: 'draft', version: 1 }])} className="w-full py-3 border border-dashed border-black/10 dark:border-white/10 text-[9px] font-black uppercase text-gray-400 flex items-center justify-center gap-2 hover:border-brand-blue hover:text-brand-blue transition-all">
              <Plus size={12} /> Add Scene
            </button>
          </div>
        </div>
      </div>

      <div className="flex-grow flex flex-col bg-gray-100 dark:bg-[#020203] relative overflow-hidden">
        <div className="flex-grow flex flex-col items-center justify-center p-6 relative">
          <div className="w-full max-w-4xl aspect-video relative z-10">
            <div className="w-full h-full bg-black border border-black/10 dark:border-white/10 relative overflow-hidden flex items-center justify-center group/view shadow-2xl">
              {currentScene.videoUrl ? (
                <video key={currentScene.videoUrl} src={currentScene.videoUrl} autoPlay loop muted className="w-full h-full object-contain" />
              ) : (
                <div className="text-center opacity-20">
                   <MonitorPlay className="w-16 h-16 mx-auto mb-4" />
                   <p className="text-[11px] font-black uppercase tracking-[0.5em]">Viewport_Standby</p>
                </div>
              )}
              
              {currentScene.status === 'rendering' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-md z-20">
                   <Loader2 className="w-12 h-12 text-brand-blue animate-spin mb-4" />
                   <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white animate-pulse">Synthesizing_Take...</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="h-44 border-t border-black/10 dark:border-white/5 bg-white dark:bg-black p-6 flex flex-col lg:flex-row gap-6 shrink-0 relative z-20">
          <div className="flex-grow flex flex-col gap-2">
            <label className="text-[8px] font-black uppercase text-gray-400 dark:text-gray-700 tracking-[0.3em] flex items-center gap-2"><Camera size={12} className="text-brand-blue" /> Visual_Directive</label>
            <textarea 
              value={currentScene.visualPrompt} 
              onChange={(e) => updateScene(selectedSceneId, { visualPrompt: e.target.value })} 
              className="flex-grow bg-black/5 dark:bg-white/[0.03] border border-black/10 dark:border-white/10 p-3 text-[11px] font-black uppercase text-black dark:text-white focus:outline-none focus:border-brand-blue/30 resize-none tracking-tight leading-relaxed" 
              placeholder="Describe cinematography..." 
            />
          </div>
          <button 
            onClick={() => handleRenderScene(selectedSceneId)} 
            disabled={currentScene.status === 'rendering' || !currentScene.visualPrompt.trim()} 
            className="w-full lg:w-48 bg-brand-blue text-white flex flex-col items-center justify-center gap-2 hover:bg-black dark:hover:bg-white dark:hover:text-black transition-all group shadow-2xl active:scale-[0.98] disabled:opacity-20"
          >
            <Zap size={20} className="fill-current group-hover:scale-110 transition-transform" />
            <span className="text-[8px] font-black uppercase tracking-[0.2em]">Produce_Take</span>
          </button>
        </div>
      </div>

      {needsKey && (
        <div className="absolute inset-0 z-[100] bg-black/95 flex items-center justify-center p-8 text-center">
          <div className="max-w-md space-y-8 animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 border border-brand-blue mx-auto flex items-center justify-center">
              <Lock className="w-8 h-8 text-brand-blue animate-pulse" />
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl font-black uppercase tracking-tighter text-white">Auth Required</h3>
              <p className="text-[10px] text-gray-500 leading-relaxed uppercase tracking-widest font-bold">
                Aether studio-grade synthesis requires a paid project API key.
              </p>
              <div className="pt-6 flex flex-col gap-4">
                <button onClick={handleSelectKey} className="btn-sky-primary py-4 px-10 text-[10px] tracking-widest uppercase">Link Paid Key</button>
                <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="text-[9px] text-gray-600 hover:text-brand-blue flex items-center justify-center gap-2 font-black uppercase">Billing Specs <ExternalLink className="w-3 h-3" /></a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AetherStudioInterface;
