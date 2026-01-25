
import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, Layers, Plus, RefreshCw, AlertCircle, Clock, 
  Trash2, Check, MonitorPlay, User, Maximize2, 
  Download, Grid2X2, Edit3, Film, 
  Image as LucideImage, Loader2, Square as SquareIcon, LayoutGrid, Settings,
  Sparkles, Camera, Music, Mic, FileAudio
} from 'lucide-react';
import { ReferenceAsset, Scene } from '../../hooks/useStoryboardStudio';
import { IdentityAnchors } from './IdentityAnchors';

interface StoryboardTabProps {
  script: string;
  setScript: (v: string) => void;
  scriptRefImage: string | null;
  setScriptRefImage: (v: string | null) => void;
  scriptRefAudio: string | null;
  setScriptRefAudio: (v: string | null) => void;
  totalDuration: number;
  setTotalDuration: (v: number) => void;
  sceneDuration: number;
  voiceOverEnabled: boolean;
  setVoiceOverEnabled: (v: boolean) => void;
  assets: ReferenceAsset[];
  addAsset: (type: any) => void;
  removeAsset: (id: string) => void;
  updateAsset: (id: string, updates: any) => void;
  updateScene: (id: string, updates: any) => void;
  handleReGenerateAsset: (id: string) => void;
  openAssetModal: (asset?: ReferenceAsset) => void;
  onViewAsset: (asset: ReferenceAsset) => void;
  onViewScene: (scene: Scene) => void;
  scenes: Scene[];
  selectedSceneIds: string[];
  toggleSceneSelection: (id: string) => void;
  selectAllScenes: () => void;
  isProcessing: boolean;
  isEnhancing?: boolean;
  assetUploadRef: React.RefObject<HTMLInputElement | null>;
  setActiveUploadAssetId: (id: string) => void;
  onOpenSettings: () => void;
  onOpenRenderConfig: () => void;
  onOpenAestheticConfig: () => void;
  onLoadSample: () => void;
  onLoadSuggestion: () => void;
  settings: any; 
}

export const StoryboardTab: React.FC<StoryboardTabProps> = ({ 
  script, setScript, scriptRefImage, setScriptRefImage, scriptRefAudio, setScriptRefAudio,
  totalDuration, setTotalDuration, sceneDuration, voiceOverEnabled, setVoiceOverEnabled, 
  assets, addAsset, removeAsset, updateAsset, updateScene, handleReGenerateAsset, openAssetModal,
  onViewAsset, onViewScene,
  scenes, selectedSceneIds, toggleSceneSelection, selectAllScenes,
  isProcessing, isEnhancing, assetUploadRef, setActiveUploadAssetId,
  onOpenSettings, onOpenRenderConfig, onOpenAestheticConfig, onLoadSample, onLoadSuggestion, settings
}) => {
  const mainImageInputRef = useRef<HTMLInputElement>(null);
  const mainAudioInputRef = useRef<HTMLInputElement>(null);
  const [viewLayout, setViewLayout] = useState<'grid' | 'large' | 'list' | 'compact'>('grid');

  const handleMainImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setScriptRefImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleMainAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setScriptRefAudio(file.name); 
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      className="flex-grow flex flex-col p-6 lg:p-12 overflow-y-auto no-scrollbar bg-white dark:bg-[#050506] transition-colors duration-500"
    >
      <div className="max-w-[1600px] mx-auto w-full space-y-8 lg:space-y-10 pb-48 lg:pb-40">
        <div className="flex items-center gap-4 text-brand-blue border-l-4 border-brand-blue pl-4 lg:pl-6 max-w-6xl mx-auto w-full">
          <Zap size={20} className="lg:w-6 lg:h-6" />
          <h2 className="text-xl lg:text-3xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white transition-colors">TẠO KỊCH BẢN</h2>
        </div>

        {/* 1. SCRIPT INPUT */}
        <div className="space-y-4 lg:space-y-6 max-w-6xl mx-auto w-full">
           <label className="text-[9px] lg:text-[11px] font-black uppercase text-gray-500 tracking-[0.4em] italic leading-none">Ý TƯỞNG KỊCH BẢN</label>
           <div className="relative group">
              <textarea 
                value={script}
                onChange={(e) => setScript(e.target.value)}
                disabled={isEnhancing}
                className={`w-full h-40 lg:h-48 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 p-5 lg:p-8 rounded-sm text-base lg:text-lg font-medium leading-relaxed outline-none focus:border-brand-blue/40 transition-all resize-none shadow-xl dark:shadow-2xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-600 ${isEnhancing ? 'opacity-50' : ''}`}
                placeholder="Nhập ý tưởng kịch bản tại đây..."
              />
              
              {isEnhancing && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/40 dark:bg-black/20 backdrop-blur-sm rounded-sm z-20">
                  <Loader2 size={32} className="text-brand-blue animate-spin" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-800 dark:text-white animate-pulse mt-4">AI đang phân tích...</span>
                </div>
              )}

              <div className="absolute bottom-4 right-4 lg:bottom-6 lg:right-6 flex gap-3 lg:gap-4 text-slate-600 dark:text-white">
                <button 
                  onClick={onLoadSuggestion} 
                  disabled={isEnhancing}
                  className="flex items-center gap-1.5 lg:gap-2 text-[9px] lg:text-[10px] font-black text-brand-blue uppercase tracking-widest hover:underline transition-all disabled:opacity-30"
                >
                  <span className="flex items-center gap-1.5"><Sparkles size={12} /> Gợi ý</span>
                </button>
                <button 
                  onClick={onLoadSample} 
                  disabled={isEnhancing}
                  className="flex items-center gap-1.5 lg:gap-2 text-[9px] lg:text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest hover:underline transition-all disabled:opacity-30"
                >
                  <span className="flex items-center gap-1.5"><LayoutGrid size={12} /> Mẫu</span>
                </button>
              </div>
           </div>
           <div className="flex flex-wrap items-center gap-3 lg:gap-4">
              <button onClick={() => mainImageInputRef.current?.click()} className={`flex items-center gap-2 px-4 lg:px-6 py-2 rounded-lg text-[9px] lg:text-[10px] font-black uppercase tracking-widest transition-all border ${scriptRefImage ? 'bg-brand-blue/20 border-brand-blue text-brand-blue dark:text-white' : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-gray-400 hover:text-brand-blue dark:hover:text-white'}`}><LucideImage size={12} /> {scriptRefImage ? 'Đã tải ảnh' : 'Tải ảnh'}</button>
              <button onClick={() => mainAudioInputRef.current?.click()} className={`flex items-center gap-2 px-4 lg:px-6 py-2 rounded-lg text-[9px] lg:text-[10px] font-black uppercase tracking-widest transition-all border ${scriptRefAudio ? 'bg-emerald-500/20 border-emerald-500 text-emerald-700 dark:text-white' : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-gray-400 hover:text-emerald-500 dark:hover:text-white'}`}><FileAudio size={12} /> {scriptRefAudio ? 'Đã tải Audio' : 'Tải Audio'}</button>
              <input type="file" ref={mainImageInputRef} className="hidden" accept="image/*" onChange={handleMainImageUpload} />
              <input type="file" ref={mainAudioInputRef} className="hidden" accept="audio/*" onChange={handleMainAudioUpload} />
           </div>
        </div>

        {/* 1.5 CONFIGURATION SUMMARY */}
        <div className="max-w-6xl mx-auto w-full grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6">
          <div className="p-0.5 bg-gradient-to-r from-brand-blue/20 via-purple-500/20 to-brand-blue/20 rounded-xl lg:rounded-2xl xl:col-span-2">
            <div className="bg-slate-50 dark:bg-[#0a0a0c] rounded-lg lg:rounded-xl p-4 lg:p-6 flex flex-wrap items-center justify-between gap-4 transition-colors duration-500 h-full">
              <div className="flex flex-wrap items-center gap-4 lg:gap-8">
                <div className="flex items-center gap-2 lg:gap-3">
                  <div className="p-1.5 lg:p-2 bg-brand-blue/10 rounded-lg text-brand-blue">
                    <LucideImage size={12} />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[7px] lg:text-[8px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest leading-none">Image</p>
                    <p className="text-[9px] lg:text-[10px] font-black text-slate-800 dark:text-white uppercase italic leading-tight truncate max-w-[80px] lg:max-w-none">{settings.imageModel.replace(/_/g, ' ')}</p>
                  </div>
                </div>
                <div className="hidden lg:block w-px h-8 bg-slate-200 dark:bg-white/5"></div>
                <div className="flex items-center gap-2 lg:gap-3">
                  <div className="p-1.5 lg:p-2 bg-purple-500/10 rounded-lg text-purple-500">
                    <Film size={12} />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[7px] lg:text-[8px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest leading-none">Video</p>
                    <p className="text-[9px] lg:text-[10px] font-black text-slate-800 dark:text-white uppercase italic leading-tight truncate max-w-[80px] lg:max-w-none">{settings.model.toUpperCase()}</p>
                  </div>
                </div>
                <div className="hidden lg:block w-px h-8 bg-slate-200 dark:bg-white/5"></div>
                <div className="flex items-center gap-2 lg:gap-3">
                  <div className="p-1.5 lg:p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                    <Maximize2 size={12} />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[7px] lg:text-[8px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest leading-none">Res</p>
                    <p className="text-[9px] lg:text-[10px] font-black text-slate-800 dark:text-white uppercase italic leading-tight">1080P • 16:9</p>
                  </div>
                </div>
              </div>
              <button 
                onClick={onOpenRenderConfig}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg text-[8px] lg:text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-400 transition-all border border-slate-200 dark:border-white/5 ml-auto lg:ml-0"
              >
                <Settings size={12} /> <span className="hidden sm:inline">Cấu hình</span>
              </button>
            </div>
          </div>

          <div className="p-0.5 bg-slate-200 dark:bg-white/10 rounded-xl lg:rounded-2xl">
             <div className="bg-slate-50 dark:bg-[#0a0a0c] rounded-lg lg:rounded-xl p-4 lg:p-6 h-full space-y-3 transition-colors">
                <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-1.5">
                   <div className="flex items-center gap-2">
                      <Sparkles size={12} className="text-brand-blue" />
                      <span className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white leading-none">Aesthetic Profile</span>
                   </div>
                   <button onClick={onOpenAestheticConfig} className="text-[8px] font-black text-brand-blue uppercase hover:underline leading-none">Cấu Hình</button>
                </div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                   <div className="space-y-0.5">
                      <p className="text-[7px] lg:text-[8px] font-black text-gray-400 uppercase leading-none">Format</p>
                      <p className="text-[9px] lg:text-[10px] font-bold text-slate-700 dark:text-gray-300 truncate leading-tight">{settings.format}</p>
                   </div>
                   <div className="space-y-0.5">
                      <p className="text-[7px] lg:text-[8px] font-black text-gray-400 uppercase leading-none">Style</p>
                      <p className="text-[9px] lg:text-[10px] font-bold text-slate-700 dark:text-gray-300 truncate leading-tight">{settings.style}</p>
                   </div>
                   <div className="space-y-0.5">
                      <p className="text-[7px] lg:text-[8px] font-black text-gray-400 uppercase leading-none">Culture</p>
                      <p className="text-[9px] lg:text-[10px] font-bold text-slate-700 dark:text-gray-300 truncate leading-tight">{settings.culture}</p>
                   </div>
                   <div className="space-y-0.5 flex items-center gap-1.5 pt-0.5">
                      <div className="flex items-center gap-1">
                        <Music size={9} className="text-gray-400" />
                        <div className={`w-1 h-1 rounded-full ${settings.bgm ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Mic size={9} className="text-gray-400" />
                        <div className={`w-1 h-1 rounded-full ${settings.voiceOver ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* 2. DURATION HUD */}
        <div className="max-w-6xl mx-auto w-full space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-10">
            <div className="p-4 lg:p-6 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 flex items-center justify-between rounded-xl shadow-lg transition-colors">
                <div className="flex items-center gap-3 lg:gap-4">
                  <Clock size={18} className="text-brand-blue" />
                  <div className="space-y-0.5">
                    <p className="text-[8px] lg:text-[10px] font-black uppercase text-slate-400 dark:text-gray-500 leading-none">TỔNG THỜI LƯỢNG</p>
                    <div className="flex items-center gap-1">
                      <input 
                        type="number" step={8} min={8} value={totalDuration} 
                        onChange={(e) => setTotalDuration(parseInt(e.target.value) || 8)}
                        className="bg-transparent border-b border-brand-blue/20 text-xl lg:text-2xl font-black italic tracking-tighter text-slate-900 dark:text-white w-14 lg:w-20 outline-none focus:border-brand-blue transition-colors"
                      />
                      <span className="text-xl lg:text-2xl font-black italic tracking-tighter text-slate-300 dark:text-white/40 leading-none pt-1">s</span>
                    </div>
                  </div>
                </div>
                <span className="text-[8px] lg:text-[10px] font-black text-slate-300 dark:text-gray-700 uppercase italic">DIVISIBLE BY 8</span>
            </div>
            <div className="p-4 lg:p-6 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 flex items-center justify-between rounded-xl shadow-lg opacity-60 transition-colors">
                <div className="flex items-center gap-3 lg:gap-4">
                  <LayoutGrid size={18} className="text-slate-400 dark:text-gray-400" />
                  <div className="space-y-0.5">
                    <p className="text-[8px] lg:text-[10px] font-black uppercase text-slate-400 dark:text-gray-500 leading-none">THỜI LƯỢNG CẢNH</p>
                    <p className="text-xl lg:text-2xl font-black italic tracking-tighter text-slate-900 dark:text-white leading-none pt-1">{sceneDuration}s</p>
                  </div>
                </div>
                <span className="text-[8px] lg:text-[10px] font-black text-slate-300 dark:text-gray-700 uppercase italic">FIXED</span>
            </div>
          </div>
        </div>

        {/* 3. ASSET GRID (Identity Anchors) */}
        <IdentityAnchors 
          assets={assets}
          openAssetModal={openAssetModal}
          onViewAsset={onViewAsset}
          removeAsset={removeAsset}
          handleReGenerateAsset={handleReGenerateAsset}
        />

        {/* 4. PHÂN CẢNH CHI TIẾT */}
        <div className="space-y-8 lg:y-12 pt-10 lg:pt-12 border-t border-slate-200 dark:border-white/5">
          <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 lg:gap-6 px-1">
             <div className="space-y-1">
                <div className="flex items-center gap-3">
                   <MonitorPlay size={18} className="text-brand-blue" />
                   <h3 className="text-xl lg:text-2xl font-black uppercase tracking-tighter italic text-slate-900 dark:text-white transition-colors">Bản thảo phân cảnh</h3>
                </div>
                <p className="text-[8px] lg:text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-[0.3em] leading-none">Tổng hợp kịch bản hình ảnh</p>
             </div>
             <div className="flex flex-wrap items-center gap-3 lg:gap-6 bg-slate-50 dark:bg-[#0d0d0f] p-1 lg:p-1.5 rounded-xl lg:rounded-2xl border border-slate-200 dark:border-white/5 transition-colors duration-500">
                <button onClick={selectAllScenes} className={`flex items-center gap-2 lg:gap-3 px-4 lg:px-6 py-2 lg:py-2.5 rounded-lg lg:rounded-xl border transition-all text-[9px] lg:text-[11px] font-black uppercase tracking-tight ${selectedSceneIds.length === scenes.length && scenes.length > 0 ? 'bg-brand-blue dark:bg-white/10 border-brand-blue text-white' : 'bg-transparent border-slate-200 dark:border-white/5 text-slate-400 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'}`}>
                   <div className={`w-3.5 h-3.5 lg:w-4 lg:h-4 rounded border flex items-center justify-center transition-all ${selectedSceneIds.length === scenes.length && scenes.length > 0 ? 'bg-brand-blue border-brand-blue dark:border-white' : 'border-slate-300 dark:border-white/20 bg-slate-100 dark:bg-black/20'}`}>{selectedSceneIds.length === scenes.length && scenes.length > 0 && <Check size={10} strokeWidth={4} />}</div>
                   <span className="hidden xs:inline">Chọn tất cả</span><span className="xs:hidden">All</span>
                </button>
                <div className="flex gap-1 lg:gap-2 text-slate-600 dark:text-white">
                   <button className="flex items-center gap-2 px-3 lg:px-6 py-2 lg:py-2.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-lg lg:rounded-xl text-[9px] lg:text-[11px] font-black uppercase tracking-tight text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-all shadow-sm"><Download size={14} /> <span className="hidden sm:inline">Ảnh</span></button>
                   <button className="flex items-center gap-2 px-3 lg:px-6 py-2 lg:py-2.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-lg lg:rounded-xl text-[9px] lg:text-[11px] font-black uppercase tracking-tight text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-all shadow-sm"><Download size={14} /> <span className="hidden sm:inline">Video</span></button>
                </div>
                <div className="hidden sm:flex items-center bg-slate-200 dark:bg-black/40 p-1 rounded-lg lg:rounded-xl border border-slate-300 dark:border-white/10 transition-colors">
                   {[{ id: 'list', icon: <SquareIcon size={14}/> }, { id: 'grid', icon: <Grid2X2 size={14}/> }].map(l => (
                     <button key={l.id} onClick={() => setViewLayout(l.id as any)} className={`p-1.5 lg:p-2.5 rounded-lg transition-all ${viewLayout === l.id ? 'bg-brand-blue text-white shadow-lg' : 'text-slate-400 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'}`}>{l.icon}</button>
                   ))}
                </div>
             </div>
          </header>

          <div className={`grid gap-6 lg:gap-8 ${viewLayout === 'list' ? 'grid-cols-1' : viewLayout === 'large' ? 'grid-cols-1 md:grid-cols-2' : viewLayout === 'compact' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'}`}>
             {isProcessing ? Array.from({length: 4}).map((_, i) => <div key={i} className="aspect-video bg-slate-100 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-xl animate-pulse flex flex-col items-center justify-center gap-4"><Loader2 className="animate-spin text-brand-blue" /><span className="text-[10px] font-black text-slate-400 dark:text-gray-600 uppercase tracking-widest">Đang phân tích...</span></div>) : 
               scenes.map((scene) => (
                <div key={scene.id} onClick={() => toggleSceneSelection(scene.id)} className={`group relative flex flex-col bg-slate-50 dark:bg-white/[0.02] border-2 rounded-[1.5rem] lg:rounded-[2rem] overflow-hidden transition-all cursor-pointer shadow-lg dark:shadow-xl ${selectedSceneIds.includes(scene.id) ? 'border-brand-blue bg-brand-blue/5' : 'border-slate-100 dark:border-white/5 hover:border-slate-200 dark:hover:border-white/10'}`}>
                   <div onClick={(e) => { if (scene.visualUrl || scene.videoUrl) { e.stopPropagation(); onViewScene(scene); } }} className="aspect-video bg-slate-200 dark:bg-black relative overflow-hidden flex items-center justify-center transition-colors">
                      {scene.videoUrl ? <video src={scene.videoUrl} autoPlay loop muted className="w-full h-full object-cover" /> : scene.visualUrl ? <img src={scene.visualUrl} className="w-full h-full object-cover" /> : <div className="flex flex-col items-center gap-3 opacity-20 text-slate-500 dark:text-white"><MonitorPlay size={32} /><span className="text-[8px] font-black uppercase tracking-widest">Offline</span></div>}
                      <div className="absolute top-3 left-3 bg-white/80 dark:bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-sm border border-slate-200 dark:border-white/10 text-[8px] font-black text-slate-900 dark:text-white uppercase tracking-widest transition-colors">Cảnh 0{scene.order}</div>
                      {scene.status === 'generating' && <div className="absolute inset-0 bg-white/60 dark:bg-black/60 backdrop-blur-md flex flex-col items-center justify-center gap-2 z-20"><Loader2 className="text-brand-blue animate-spin" size={24} /><span className="text-[8px] font-black text-slate-800 dark:text-white uppercase tracking-[0.4em] animate-pulse">Rendering</span></div>}
                      <div onClick={(e) => { e.stopPropagation(); toggleSceneSelection(scene.id); }} className={`absolute top-3 right-3 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${selectedSceneIds.includes(scene.id) ? 'bg-brand-blue border-brand-blue' : 'bg-white/40 dark:bg-black/40 border-slate-300 dark:border-white/20'}`}>{selectedSceneIds.includes(scene.id) && <Check size={12} strokeWidth={4} className="text-white" />}</div>
                   </div>
                   <div className="px-4 py-3 lg:px-6 lg:py-4 bg-slate-100/50 dark:bg-black/40 border-b border-slate-200 dark:border-white/5 flex items-center gap-3 transition-colors duration-500">
                      <div className="flex items-center gap-1.5 mr-1">
                        <User size={10} className="text-emerald-500" />
                        <span className="text-[7px] lg:text-[8px] font-black uppercase text-emerald-500 tracking-widest leading-none">Mỏ neo:</span>
                      </div>
                      <div className="flex -space-x-1.5">
                        {(scene.characterIds || []).map((charId) => {
                          const asset = assets.find(a => a.id === charId);
                          if (!asset) return null;
                          return (
                            <div key={charId} className="w-6 h-6 lg:w-8 lg:h-8 rounded-full border-2 border-white dark:border-[#1c1f1f] overflow-hidden shadow-lg group/avatar relative" title={asset.name}>
                              {asset.url ? (
                                <img src={asset.url} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-slate-300 dark:bg-slate-800 flex items-center justify-center text-[8px] font-black text-slate-500 dark:text-white/40 transition-colors">
                                  {asset.name.charAt(0)}
                                </div>
                              )}
                            </div>
                          );
                        })}
                        {(scene.characterIds || []).length === 0 && (
                          <span className="text-[7px] font-bold text-slate-400 dark:text-gray-600 uppercase tracking-widest italic leading-none">Toàn cảnh</span>
                        )}
                      </div>
                   </div>
                   <div className="p-4 lg:p-6 space-y-3 lg:space-y-4 bg-white dark:bg-transparent transition-colors duration-500 flex-grow">
                      <div className="space-y-1">
                        <label className="text-[7px] lg:text-[8px] font-black uppercase text-slate-400 dark:text-gray-600 tracking-widest leading-none">Kịch bản chi tiết:</label>
                        <textarea value={scene.prompt} onChange={(e) => updateScene(scene.id, { prompt: e.target.value })} onClick={(e) => e.stopPropagation()} className="w-full bg-transparent border-none p-0 text-[11px] lg:text-[12px] font-medium leading-relaxed text-slate-700 dark:text-gray-300 italic focus:ring-0 resize-none min-h-[50px] transition-colors no-scrollbar" />
                      </div>
                      <div className="flex justify-between items-center pt-2 text-[8px] lg:text-[9px] font-black uppercase text-slate-400 dark:text-gray-500 border-t border-slate-100 dark:border-white/5">
                         <div className="flex items-center gap-1.5 text-slate-400 dark:text-white"><Clock size={10} /><span>{scene.duration}s</span></div>
                         <div className="flex items-center gap-2 lg:gap-3 text-slate-400 dark:text-white">
                            <button className="flex items-center gap-1 hover:text-brand-blue transition-colors group/regen"><RefreshCw size={10} className="group-hover/regen:rotate-180 transition-transform duration-700" /> <span className="hidden xs:inline">Tạo lại</span></button>
                            <button className="hover:text-red-500 transition-colors"><Trash2 size={10}/></button>
                         </div>
                      </div>
                   </div>
                </div>
               ))
             }
          </div>
        </div>
      </div>
    </motion.div>
  );
};
