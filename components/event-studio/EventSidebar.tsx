
import React from 'react';
import { Upload, Palette, Target, Sparkles, Loader2, X, Plus, FolderOpen, Camera, Shirt, Wand2, Layout, Users, Heart } from 'lucide-react';
import { EventConfig, STYLE_PRESETS, EventTemplate } from '../../constants/event-configs';
import { SourceImage } from '../../hooks/useEventStudio';

interface EventSidebarProps {
  config: EventConfig;
  sourceImages: SourceImage[];
  clothingImages: SourceImage[];
  onUpload: () => void;
  onClothingUpload: () => void;
  removeSourceImage: (id: string) => void;
  removeClothingImage: (id: string) => void;
  onOpenLibrary: () => void;
  isUploading: boolean;
  selectedSubject: string;
  setSelectedSubject: (val: string) => void;
  selectedScenes: string[];
  setSelectedScenes: (val: string[]) => void;
  selectedStyle: string | null;
  setSelectedStyle: (val: string | null) => void;
  prompt: string;
  setPrompt: (val: string) => void;
  showTemplates: boolean;
  setShowTemplates: (val: boolean) => void;
  onApplyTemplate: (t: EventTemplate) => void;
  onSuggestPrompt: () => void;
}

export const EventSidebar: React.FC<EventSidebarProps> = ({
  config, sourceImages, clothingImages, onUpload, onClothingUpload, removeSourceImage, removeClothingImage,
  onOpenLibrary, isUploading, selectedSubject, setSelectedSubject,
  selectedScenes, setSelectedScenes, selectedStyle, setSelectedStyle,
  prompt, setPrompt, showTemplates, setShowTemplates, onApplyTemplate, onSuggestPrompt
}) => {
  const toggleScene = (scene: string) => {
    if (selectedScenes.includes(scene)) setSelectedScenes(selectedScenes.filter(s => s !== scene));
    else if (selectedScenes.length < 3) setSelectedScenes([...selectedScenes, scene]);
  };

  const EvIcon = config.icon;

  return (
    <div className="space-y-5">
      {/* ─── Branding Header ─── */}
      <section className="-mx-5 -mt-5 p-5 pb-4 bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-white/[0.02] dark:via-transparent dark:to-white/[0.01] border-b border-black/[0.04] dark:border-white/[0.04]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-${config.accentColor}-500/10 border border-${config.accentColor}-500/15 text-${config.accentColor}-500 shadow-sm`}>
              <EvIcon size={20} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white leading-none tracking-tight">{config.name}</h2>
              <div className="flex items-center gap-1.5 mt-1">
                <div className={`w-1 h-1 rounded-full bg-${config.accentColor}-500 animate-pulse`}></div>
                <p className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{config.version}</p>
              </div>
            </div>
          </div>
          {config.coupleMode && (
            <span className="flex items-center gap-1 px-2 py-1 bg-pink-500/10 text-pink-500 text-[8px] font-bold rounded-lg border border-pink-500/15">
              <Users size={10} /> Couple
            </span>
          )}
        </div>
      </section>

      {/* ─── FEATURE 2: Template Gallery Toggle ─── */}
      <section>
        <button 
          onClick={() => setShowTemplates(!showTemplates)}
          className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl border transition-all ${showTemplates ? `bg-${config.accentColor}-500/10 border-${config.accentColor}-500/20 text-${config.accentColor}-600` : 'bg-white dark:bg-white/[0.02] border-black/[0.06] dark:border-white/[0.06] text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/10'}`}
        >
          <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider">
            <Layout size={13} /> Mẫu có sẵn
          </span>
          <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${showTemplates ? `bg-${config.accentColor}-500 text-white` : 'bg-slate-100 dark:bg-white/[0.04] text-slate-500'}`}>
            {config.templates.length}
          </span>
        </button>

        {showTemplates && (
          <div className="mt-2 space-y-1.5 max-h-[200px] overflow-y-auto no-scrollbar">
            {config.templates.map(t => (
              <button
                key={t.id}
                onClick={() => onApplyTemplate(t)}
                className="w-full text-left p-3 rounded-xl bg-white dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] hover:border-brand-blue/30 transition-all group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-slate-700 dark:text-white/80">{t.name}</span>
                  <span className="text-[7px] font-semibold text-slate-400 uppercase">{t.style}</span>
                </div>
                <p className="text-[9px] text-slate-400 dark:text-slate-500 line-clamp-2 leading-relaxed">{t.prompt.slice(0, 80)}...</p>
                <div className="flex gap-1 mt-1.5">
                  {t.tags.map(tag => (
                    <span key={tag} className="text-[7px] font-semibold px-1.5 py-0.5 bg-slate-100 dark:bg-white/[0.03] text-slate-400 rounded">{tag}</span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* ─── Anchor Images (+ Couple Mode indicator) ─── */}
      <section className="space-y-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Camera size={13} className={`text-${config.accentColor}-500`} />
            <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
              {config.coupleMode ? 'Chân dung cặp đôi' : 'Chân dung gốc'}
            </label>
          </div>
          <span className="text-[9px] font-semibold text-slate-400 bg-slate-100 dark:bg-white/[0.03] px-2 py-0.5 rounded-md border border-black/[0.04] dark:border-white/[0.04]">
            {sourceImages.length}{config.coupleMode ? '/2' : ''} ảnh
          </span>
        </div>
        
        <div className="grid grid-cols-3 gap-2.5">
          {sourceImages.map((img, idx) => (
            <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden border border-black/[0.06] dark:border-white/[0.06] group shadow-sm hover:shadow-md transition-all">
              <img src={img.url} className={`w-full h-full object-cover transition-all ${img.status === 'uploading' ? 'opacity-40 blur-[2px] scale-105' : 'group-hover:scale-105'}`} alt="" />
              
              {img.status === 'uploading' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
                  <Loader2 size={16} className={`animate-spin text-${config.accentColor}-500`} />
                </div>
              )}

              {/* Couple badge */}
              {config.coupleMode && img.status === 'done' && (
                <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-pink-500/90 text-white text-[7px] font-bold rounded-md flex items-center gap-0.5">
                  <Heart size={7} fill="currentColor" /> {idx === 0 ? 'Cô dâu' : 'Chú rể'}
                </div>
              )}

              <button 
                onClick={() => removeSourceImage(img.id)}
                className="absolute top-1.5 right-1.5 p-1 bg-black/60 backdrop-blur-sm rounded-full text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:scale-110"
              >
                <X size={8} strokeWidth={3} />
              </button>
            </div>
          ))}

          {/* Add Button (limit 2 for couple, unlimited otherwise) */}
          {(!config.coupleMode || sourceImages.length < 2) && (
            <div className="aspect-square rounded-xl border-2 border-dashed border-slate-200 dark:border-white/[0.06] flex items-center justify-center group relative overflow-hidden transition-all hover:border-slate-300 dark:hover:border-white/10 bg-slate-50/50 dark:bg-white/[0.01]">
              <Plus size={18} className="text-slate-300 dark:text-slate-600 group-hover:opacity-0 transition-opacity" />
              <div className="absolute inset-0 flex flex-col opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-[#0d0e12]">
                <button onClick={onUpload} className={`flex-1 flex items-center justify-center hover:bg-${config.accentColor}-500/10 text-${config.accentColor}-500 border-b border-black/[0.04] dark:border-white/[0.04] transition-colors`} title="Tải ảnh">
                  <Upload size={14} />
                </button>
                <button onClick={onOpenLibrary} className="flex-1 flex items-center justify-center hover:bg-brand-blue/10 text-brand-blue transition-colors" title="Thư viện">
                  <FolderOpen size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

        {config.coupleMode && sourceImages.length < 2 && (
          <p className="text-[9px] text-pink-400 text-center italic flex items-center justify-center gap-1">
            <Users size={10} /> Tải lên 2 ảnh chân dung cho cặp đôi
          </p>
        )}
        {!config.coupleMode && sourceImages.length === 0 && (
          <p className="text-[9px] text-slate-400 dark:text-slate-500 text-center italic">
            Tải ảnh chân dung để AI giữ nguyên khuôn mặt
          </p>
        )}
      </section>

      {/* ─── FEATURE 10: Clothing Reference ─── */}
      <section className="space-y-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Shirt size={13} className="text-brand-blue" />
            <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Trang phục tham khảo</label>
          </div>
          <span className="text-[8px] font-semibold text-slate-400">{clothingImages.length > 0 ? '1 ảnh' : 'Tùy chọn'}</span>
        </div>

        {clothingImages.length > 0 ? (
          <div className="flex gap-2">
            {clothingImages.map(img => (
              <div key={img.id} className="relative w-16 h-16 rounded-lg overflow-hidden border border-brand-blue/20 group">
                <img src={img.url} className="w-full h-full object-cover" alt="" />
                {img.status === 'uploading' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <Loader2 size={12} className="animate-spin text-white" />
                  </div>
                )}
                <button onClick={() => removeClothingImage(img.id)} className="absolute top-0.5 right-0.5 p-0.5 bg-black/60 rounded-full text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500">
                  <X size={7} strokeWidth={3} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <button
            onClick={onClothingUpload}
            className="w-full p-3 rounded-xl border border-dashed border-brand-blue/20 bg-brand-blue/5 text-brand-blue text-[9px] font-bold hover:bg-brand-blue/10 transition-all flex items-center justify-center gap-2"
          >
            <Upload size={12} /> Tải ảnh trang phục mong muốn
          </button>
        )}
      </section>

      {/* ─── Subject ─── */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Target size={13} className={`text-${config.accentColor}-500`} />
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Chủ đề</h3>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {config.subjects.map(s => (
            <button 
              key={s}
              onClick={() => setSelectedSubject(s)}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-bold transition-all border ${
                selectedSubject === s 
                  ? `bg-${config.accentColor}-500 border-${config.accentColor}-500 text-white shadow-md shadow-${config.accentColor}-500/20` 
                  : 'bg-white dark:bg-white/[0.02] text-slate-500 dark:text-slate-400 border-black/[0.06] dark:border-white/[0.06] hover:border-slate-300 dark:hover:border-white/10'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </section>

      {/* ─── Scenes ─── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette size={13} className={`text-${config.accentColor}-500`} />
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Bối cảnh</h3>
          </div>
          <span className="text-[8px] font-semibold text-slate-400">{selectedScenes.length}/3</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {config.scenes.map(scene => (
            <button 
              key={scene} 
              onClick={() => toggleScene(scene)}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-bold transition-all border ${
                selectedScenes.includes(scene) 
                  ? 'bg-brand-blue border-brand-blue text-white shadow-md shadow-brand-blue/20' 
                  : 'bg-white dark:bg-white/[0.02] text-slate-500 dark:text-slate-400 border-black/[0.06] dark:border-white/[0.06] hover:border-brand-blue/30'
              }`}
            >
              + {scene}
            </button>
          ))}
        </div>
      </section>

      {/* ─── FEATURE 3: Style Presets ─── */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles size={13} className={`text-${config.accentColor}-500`} />
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Phong cách</h3>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {STYLE_PRESETS.map(style => (
            <button 
              key={style.id}
              onClick={() => setSelectedStyle(selectedStyle === style.id ? null : style.id)}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg text-[9px] font-bold transition-all border ${
                selectedStyle === style.id
                  ? `bg-${config.accentColor}-500/10 border-${config.accentColor}-500/30 text-${config.accentColor}-600`
                  : 'bg-white dark:bg-white/[0.02] border-black/[0.04] dark:border-white/[0.04] text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/10'
              }`}
            >
              <span className="text-base leading-none">{style.emoji}</span>
              <span>{style.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ─── Prompt (+ Suggest button) ─── */}
      <section className="space-y-3 pt-4 border-t border-black/[0.04] dark:border-white/[0.04]">
        <div className="flex justify-between items-center">
          <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider flex items-center gap-2">
            <Sparkles size={13} className={`text-${config.accentColor}-500`} /> Yêu cầu bổ sung
          </label>
          <button
            onClick={onSuggestPrompt}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[8px] font-bold bg-${config.accentColor}-500/10 text-${config.accentColor}-500 hover:bg-${config.accentColor}-500/20 transition-all border border-${config.accentColor}-500/15`}
          >
            <Wand2 size={10} /> Gợi ý AI
          </button>
        </div>
        <textarea 
          value={prompt} 
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full h-28 bg-white dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.06] p-3.5 text-[11px] font-medium outline-none rounded-xl text-slate-700 dark:text-white/80 focus:border-brand-blue/40 focus:ring-1 focus:ring-brand-blue/10 transition-all resize-none leading-relaxed placeholder:text-slate-400 dark:placeholder:text-slate-600" 
          placeholder={`VD: Ánh sáng lung linh, phong cách retro, nền studio Hàn Quốc...`}
        />
      </section>
    </div>
  );
};
