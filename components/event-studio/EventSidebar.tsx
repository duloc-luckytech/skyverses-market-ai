
import React from 'react';
import { Upload, User, Palette, Target, Sparkles, Loader2, Settings2 } from 'lucide-react';
import { EventConfig } from '../../constants/event-configs';

interface EventSidebarProps {
  config: EventConfig;
  sourceImg: string | null;
  onUpload: () => void;
  isUploading: boolean;
  selectedSubject: string;
  setSelectedSubject: (val: string) => void;
  selectedScenes: string[];
  setSelectedScenes: (val: string[]) => void;
  prompt: string;
  setPrompt: (val: string) => void;
}

export const EventSidebar: React.FC<EventSidebarProps> = ({
  config, sourceImg, onUpload, isUploading, selectedSubject, setSelectedSubject,
  selectedScenes, setSelectedScenes, prompt, setPrompt
}) => {
  const toggleScene = (scene: string) => {
    if (selectedScenes.includes(scene)) setSelectedScenes(selectedScenes.filter(s => s !== scene));
    else if (selectedScenes.length < 3) setSelectedScenes([...selectedScenes, scene]);
  };

  const EvIcon = config.icon;

  return (
    <div className="space-y-10">
      {/* Branding Header */}
      <section className="space-y-4 -mx-6 -mt-6 p-6 bg-slate-50 dark:bg-black/20 border-b border-slate-100 dark:border-white/5 transition-colors">
         <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-inner bg-${config.accentColor}-500/10 border-${config.accentColor}-500/20 text-${config.accentColor}-500`}>
               <EvIcon size={24} />
            </div>
            <div className="space-y-1">
               <h2 className="text-xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white leading-none">
                 {config.name}
               </h2>
               <div className="flex items-center gap-2">
                  <div className={`w-1 h-1 rounded-full bg-${config.accentColor}-500 animate-pulse`}></div>
                  <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest leading-none">
                    {config.version}
                  </p>
               </div>
            </div>
         </div>
      </section>

      {/* Anchor Image Section */}
      <section className="space-y-4">
        <label className="text-[10px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest italic px-1">Chân dung mỏ neo</label>
        <div 
          onClick={onUpload}
          className={`aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-4 cursor-pointer transition-all group overflow-hidden relative shadow-inner ${sourceImg ? 'border-brand-blue bg-brand-blue/5' : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/40 hover:border-brand-blue/40'}`}
        >
          {isUploading ? (
            <Loader2 className="animate-spin text-brand-blue" size={32} />
          ) : sourceImg ? (
            <img src={sourceImg} className="w-full h-full object-cover" alt="Anchor" />
          ) : (
            <>
              <div className="p-4 rounded-full bg-brand-blue/5 group-hover:scale-110 transition-transform">
                <User size={32} className="opacity-40 text-brand-blue" />
              </div>
              <span className="text-[10px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest text-center px-6 leading-relaxed">Tải ảnh mẫu của bạn (Full body/Portrait)</span>
            </>
          )}
        </div>
      </section>

      {/* Subject Styles */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <Target size={16} className="text-brand-blue" />
          <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-800 dark:text-white">Chủ đề chính</h3>
        </div>
        <div className="space-y-2">
          <select 
            value={selectedSubject} 
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full bg-slate-50 dark:bg-[#1a1b26] border border-slate-200 dark:border-white/10 rounded-xl p-3.5 text-xs font-bold text-slate-700 dark:text-slate-300 outline-none appearance-none cursor-pointer transition-colors focus:border-brand-blue"
          >
            {config.subjects.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </section>

      {/* Scenes Selection */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <Palette size={16} className="text-brand-blue" />
          <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-800 dark:text-white">Bối cảnh & Chi tiết</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {config.scenes.map(scene => (
            <button 
              key={scene} 
              onClick={() => toggleScene(scene)}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all border ${selectedScenes.includes(scene) ? 'bg-brand-blue border-transparent text-white shadow-md' : 'bg-white dark:bg-white/5 text-slate-400 border-slate-200 dark:border-white/5 hover:border-brand-blue/30'}`}
            >
              + {scene}
            </button>
          ))}
        </div>
      </section>

      {/* Extra Prompt */}
      <section className="space-y-4 pt-4 border-t border-slate-100 dark:border-white/5">
        <div className="flex justify-between items-center px-1">
          <label className="text-[10px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest">Yêu cầu bổ sung</label>
          <div className="flex items-center gap-1 text-brand-blue text-[9px] font-black italic"><Sparkles size={10} /> Smart-AI</div>
        </div>
        <textarea 
          value={prompt} 
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full h-32 bg-white dark:bg-[#1a1b26] border border-slate-200 dark:border-white/5 p-4 text-[11px] font-medium outline-none rounded-xl text-slate-800 dark:text-white shadow-inner focus:border-brand-blue transition-all resize-none leading-relaxed" 
          placeholder="Mô tả thêm ý tưởng của bạn (VD: Ánh sáng lung linh, phong cách retro...)" 
        />
      </section>
    </div>
  );
};
