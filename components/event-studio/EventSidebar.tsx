
import React from 'react';
import { Upload, User, Palette, Target, Sparkles, Loader2, X, Plus, FolderOpen } from 'lucide-react';
import { EventConfig } from '../../constants/event-configs';
import { SourceImage } from '../../hooks/useEventStudio';

interface EventSidebarProps {
  config: EventConfig;
  sourceImages: SourceImage[];
  onUpload: () => void;
  removeSourceImage: (id: string) => void;
  onOpenLibrary: () => void;
  isUploading: boolean;
  selectedSubject: string;
  setSelectedSubject: (val: string) => void;
  selectedScenes: string[];
  setSelectedScenes: (val: string[]) => void;
  prompt: string;
  setPrompt: (val: string) => void;
}

export const EventSidebar: React.FC<EventSidebarProps> = ({
  config, sourceImages, onUpload, removeSourceImage, onOpenLibrary, isUploading, selectedSubject, setSelectedSubject,
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

      {/* Anchor Image Section - Multiple Support */}
      <section className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <label className="text-[10px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-widest italic">Chân dung mỏ neo</label>
          <span className="text-[10px] font-bold text-slate-300">{sourceImages.length} tệp</span>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          {sourceImages.map((img) => (
            <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 group">
              <img src={img.url} className={`w-full h-full object-cover ${img.status === 'uploading' ? 'opacity-40 blur-[2px]' : ''}`} alt="" />
              
              {img.status === 'uploading' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 size={16} className="animate-spin text-brand-blue" />
                </div>
              )}

              <button 
                onClick={() => removeSourceImage(img.id)}
                className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={10} strokeWidth={3} />
              </button>
            </div>
          ))}

          {/* Add Actions */}
          <div className="aspect-square rounded-xl border-2 border-dashed border-slate-200 dark:border-white/10 flex flex-col items-center justify-center gap-1 group relative overflow-hidden transition-all hover:border-brand-blue/40">
             <Plus size={16} className="text-slate-300 dark:text-gray-600" />
             <div className="absolute inset-0 bg-white dark:bg-black flex flex-col opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={onUpload}
                  className="flex-1 flex items-center justify-center hover:bg-brand-blue/10 text-brand-blue border-b border-black/5 dark:border-white/5"
                  title="Tải lên từ máy"
                >
                  <Upload size={14} />
                </button>
                <button 
                  onClick={onOpenLibrary}
                  className="flex-1 flex items-center justify-center hover:bg-purple-500/10 text-purple-500"
                  title="Chọn từ thư viện"
                >
                  <FolderOpen size={14} />
                </button>
             </div>
          </div>
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
